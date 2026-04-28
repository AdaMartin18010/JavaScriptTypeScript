/**
 * @file JWT 认证实现
 * @category Cybersecurity → JWT Authentication
 * @difficulty hard
 * @tags jwt, authentication, authorization, tokens, security
 * @description
 * 完整的 JWT 实现，包含：
 * - HS256/HS384/HS512 (HMAC)
 * - RS256/RS384/RS512 (RSA)
 * - ES256/ES384/ES512 (ECDSA)
 * - JWE 加密令牌
 * - 令牌刷新和撤销
 * - 安全最佳实践
 */

import { createHmac, createSign, createVerify, randomBytes, createCipheriv, createDecipheriv, timingSafeEqual } from 'crypto';

// ============================================================================
// 类型定义
// ============================================================================

export type JWTAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'none';
export interface JWTHeader {
  alg: JWTAlgorithm;
  typ: 'JWT';
  kid?: string;  // Key ID
  jku?: string;  // JWK Set URL
}

export interface JWTPayload {
  iss?: string;   // Issuer
  sub?: string;   // Subject
  aud?: string | string[];  // Audience
  exp?: number;   // Expiration Time
  nbf?: number;   // Not Before
  iat?: number;   // Issued At
  jti?: string;   // JWT ID
  [key: string]: unknown;
}

export interface JWTOptions {
  algorithm?: JWTAlgorithm;
  expiresIn?: number;      // seconds
  notBefore?: number;      // seconds
  audience?: string | string[];
  issuer?: string;
  subject?: string;
  jwtid?: string;
  header?: Partial<JWTHeader>;
}

export interface JWTVerifyOptions {
  algorithms?: JWTAlgorithm[];
  audience?: string | string[];
  issuer?: string | string[];
  subject?: string;
  clockTolerance?: number;  // seconds
  maxAge?: number;          // seconds
}

export interface DecodedJWT {
  header: JWTHeader;
  payload: JWTPayload;
  signature: string;
}

export interface VerifiedJWT extends DecodedJWT {
  valid: boolean;
  error?: string;
}

// ============================================================================
// Base64URL 编码/解码
// ============================================================================

class Base64Url {
  static encode(data: string | Buffer): string {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
    return buffer.toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  static decode(str: string): Buffer {
    // 添加填充
    const padding = 4 - (str.length % 4);
    if (padding !== 4) {
      str += '='.repeat(padding);
    }
    
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(base64, 'base64');
  }

  static decodeToString(str: string): string {
    return this.decode(str).toString('utf8');
  }
}

// ============================================================================
// JWT 签名器
// ============================================================================

class JWTSigner {
  private static readonly ALGORITHM_MAP: Record<JWTAlgorithm, string> = {
    'HS256': 'sha256',
    'HS384': 'sha384',
    'HS512': 'sha512',
    'RS256': 'RSA-SHA256',
    'RS384': 'RSA-SHA384',
    'RS512': 'RSA-SHA512',
    'ES256': 'SHA256',
    'ES384': 'SHA384',
    'ES512': 'SHA512',
    'none': 'none'
  };

  static sign(data: string, algorithm: JWTAlgorithm, secret: string | Buffer): string {
    if (algorithm === 'none') return '';
    
    const cryptoAlg = this.ALGORITHM_MAP[algorithm];
    
    if (algorithm.startsWith('HS')) {
      // HMAC
      return createHmac(cryptoAlg, secret).update(data).digest('base64url');
    } else if (algorithm.startsWith('RS')) {
      // RSA
      const signer = createSign(cryptoAlg);
      signer.update(data);
      return signer.sign(secret, 'base64url');
    } else if (algorithm.startsWith('ES')) {
      // ECDSA
      const signer = createSign(cryptoAlg);
      signer.update(data);
      return signer.sign(secret, 'base64url');
    }
    
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }

  static verify(data: string, signature: string, algorithm: JWTAlgorithm, secret: string | Buffer): boolean {
    if (algorithm === 'none') return signature === '';
    
    const cryptoAlg = this.ALGORITHM_MAP[algorithm];
    
    if (algorithm.startsWith('HS')) {
      // HMAC - 时序安全比较
      const computed = createHmac(cryptoAlg, secret).update(data).digest();
      const provided = Buffer.from(signature, 'base64url');
      
      if (computed.length !== provided.length) return false;
      return timingSafeEqual(computed, provided);
    } else if (algorithm.startsWith('RS') || algorithm.startsWith('ES')) {
      // RSA/ECDSA
      const verifier = createVerify(cryptoAlg);
      verifier.update(data);
      return verifier.verify(secret, signature, 'base64url');
    }
    
    throw new Error(`Unsupported algorithm: ${algorithm}`);
  }
}

// ============================================================================
// JWT 核心类
// ============================================================================

export class JWT {
  private secret: string | Buffer;
  private publicKey?: string | Buffer;  // 用于非对称验证

  constructor(secret: string | Buffer, publicKey?: string | Buffer) {
    this.secret = secret;
    this.publicKey = publicKey;
  }

  /**
   * 创建 JWT
   */
  sign(payload: Omit<JWTPayload, 'iat' | 'exp' | 'nbf'>, options: JWTOptions = {}): string {
    const now = Math.floor(Date.now() / 1000);
    
    // 构建 header
    const header: JWTHeader = {
      alg: options.algorithm || 'HS256',
      typ: 'JWT',
      ...options.header
    };

    // 构建 payload
    const fullPayload: JWTPayload = {
      ...payload,
      iat: now
    };

    if (options.expiresIn) {
      fullPayload.exp = now + options.expiresIn;
    }

    if (options.notBefore) {
      fullPayload.nbf = now + options.notBefore;
    }

    if (options.audience) {
      fullPayload.aud = options.audience;
    }

    if (options.issuer) {
      fullPayload.iss = options.issuer;
    }

    if (options.subject) {
      fullPayload.sub = options.subject;
    }

    if (options.jwtid) {
      fullPayload.jti = options.jwtid;
    }

    // 编码
    const encodedHeader = Base64Url.encode(JSON.stringify(header));
    const encodedPayload = Base64Url.encode(JSON.stringify(fullPayload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    // 签名
    const secret = header.alg.startsWith('RS') || header.alg.startsWith('ES') 
      ? this.secret  // 私钥签名
      : this.secret;
      
    const signature = JWTSigner.sign(signingInput, header.alg, secret);

    return `${signingInput}.${signature}`;
  }

  /**
   * 验证 JWT
   */
  verify(token: string, options: JWTVerifyOptions = {}): VerifiedJWT {
    try {
      const decoded = this.decode(token);
      
      // 检查算法
      if (options.algorithms && !options.algorithms.includes(decoded.header.alg)) {
        return { ...decoded, valid: false, error: 'Algorithm not allowed' };
      }

      // 验证签名
      const signingInput = token.split('.').slice(0, 2).join('.');
      const signature = token.split('.')[2] || '';
      
      const secret = decoded.header.alg.startsWith('RS') || decoded.header.alg.startsWith('ES')
        ? (this.publicKey || this.secret)  // 使用公钥验证
        : this.secret;

      if (!JWTSigner.verify(signingInput, signature, decoded.header.alg, secret)) {
        return { ...decoded, valid: false, error: 'Invalid signature' };
      }

      const now = Math.floor(Date.now() / 1000);
      const clockTolerance = options.clockTolerance || 0;

      // 检查过期
      if (decoded.payload.exp && now > decoded.payload.exp + clockTolerance) {
        return { ...decoded, valid: false, error: 'Token expired' };
      }

      // 检查生效时间
      if (decoded.payload.nbf && now < decoded.payload.nbf - clockTolerance) {
        return { ...decoded, valid: false, error: 'Token not active' };
      }

      // 检查颁发者
      if (options.issuer) {
        const issuers = Array.isArray(options.issuer) ? options.issuer : [options.issuer];
        if (!decoded.payload.iss || !issuers.includes(decoded.payload.iss)) {
          return { ...decoded, valid: false, error: 'Invalid issuer' };
        }
      }

      // 检查受众
      if (options.audience) {
        const audiences = Array.isArray(options.audience) ? options.audience : [options.audience];
        const tokenAud = decoded.payload.aud;
        const tokenAudiences = Array.isArray(tokenAud) ? tokenAud : tokenAud ? [tokenAud] : [];
        
        if (!tokenAudiences.some(aud => audiences.includes(aud))) {
          return { ...decoded, valid: false, error: 'Invalid audience' };
        }
      }

      // 检查主题
      if (options.subject && decoded.payload.sub !== options.subject) {
        return { ...decoded, valid: false, error: 'Invalid subject' };
      }

      // 检查最大年龄
      if (options.maxAge && decoded.payload.iat) {
        if (now > decoded.payload.iat + options.maxAge + clockTolerance) {
          return { ...decoded, valid: false, error: 'Token too old' };
        }
      }

      return { ...decoded, valid: true };
    } catch (error) {
      return {
        header: { alg: 'none', typ: 'JWT' },
        payload: {},
        signature: '',
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 解码 JWT (不验证)
   */
  decode(token: string): DecodedJWT {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const header = JSON.parse(Base64Url.decodeToString(parts[0])) as JWTHeader;
    const payload = JSON.parse(Base64Url.decodeToString(parts[1])) as JWTPayload;

    return {
      header,
      payload,
      signature: parts[2]
    };
  }

  /**
   * 刷新令牌
   */
  refresh(token: string, newExpiresIn = 3600, options: JWTOptions = {}): string {
    const decoded = this.decode(token);
    const { iat, exp, nbf, ...restPayload } = decoded.payload;
    
    return this.sign(restPayload, {
      ...options,
      expiresIn: newExpiresIn,
      algorithm: decoded.header.alg
    });
  }
}

// ============================================================================
// 令牌存储和管理
// ============================================================================

export class TokenManager {
  private revokedTokens = new Set<string>();
  private tokenStore = new Map<string, { payload: JWTPayload; expiresAt: number }>();

  /**
   * 存储令牌元数据
   */
  storeToken(tokenId: string, payload: JWTPayload): void {
    const expiresAt = payload.exp ? payload.exp * 1000 : Date.now() + 3600000;
    this.tokenStore.set(tokenId, { payload, expiresAt });
  }

  /**
   * 撤销令牌
   */
  revokeToken(tokenId: string): void {
    this.revokedTokens.add(tokenId);
    this.tokenStore.delete(tokenId);
  }

  /**
   * 检查令牌是否被撤销
   */
  isRevoked(tokenId: string): boolean {
    return this.revokedTokens.has(tokenId);
  }

  /**
   * 清理过期令牌
   */
  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [id, data] of this.tokenStore) {
      if (data.expiresAt < now) {
        this.tokenStore.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * 获取活跃令牌数量
   */
  getActiveTokenCount(): number {
    return this.tokenStore.size;
  }
}

// ============================================================================
// JWE (JSON Web Encryption) 简化实现
// ============================================================================

export class JWE {
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 16;
  private readonly AUTH_TAG_LENGTH = 16;

  /**
   * 加密 JWT 为 JWE
   */
  encrypt(jwt: string, key: Buffer): string {
    const iv = randomBytes(this.IV_LENGTH);
    const cipher = createCipheriv(this.ALGORITHM, key, iv, { authTagLength: this.AUTH_TAG_LENGTH });
    
    const ciphertext = Buffer.concat([cipher.update(jwt, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // JWE Compact Serialization: header.encryptedKey.iv.ciphertext.authTag
    // 简化：直接使用对称密钥
    const header = Base64Url.encode(JSON.stringify({
      alg: 'dir',  // Direct encryption
      enc: 'A256GCM'
    }));

    return `${header}..${Base64Url.encode(iv)}.${Base64Url.encode(ciphertext)}.${Base64Url.encode(authTag)}`;
  }

  /**
   * 解密 JWE
   */
  decrypt(jwe: string, key: Buffer): string {
    const parts = jwe.split('.');
    if (parts.length !== 5) {
      throw new Error('Invalid JWE format');
    }

    const iv = Base64Url.decode(parts[2]);
    const ciphertext = Base64Url.decode(parts[3]);
    const authTag = Base64Url.decode(parts[4]);

    const decipher = createDecipheriv(this.ALGORITHM, key, iv, { authTagLength: this.AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
  }
}

// ============================================================================
// 演示
// ============================================================================

export function demo(): void {
  console.log('=== JWT 认证实现 ===\n');

  // HMAC (HS256) 示例
  console.log('--- HMAC (HS256) ---');
  const hmacSecret = 'your-256-bit-secret-key-here';
  const hmacJWT = new JWT(hmacSecret);

  const token1 = hmacJWT.sign(
    { userId: '12345', role: 'admin' },
    {
      algorithm: 'HS256',
      expiresIn: 3600,
      issuer: 'my-app',
      audience: 'my-api',
      subject: 'user@example.com'
    }
  );

  console.log('生成的 Token:');
  console.log(token1.slice(0, 80) + '...');

  const decoded1 = hmacJWT.decode(token1);
  console.log('\n解码 Header:', JSON.stringify(decoded1.header));
  console.log('解码 Payload:', JSON.stringify(decoded1.payload, null, 2));

  const verified1 = hmacJWT.verify(token1, {
    issuer: 'my-app',
    audience: 'my-api'
  });
  console.log('\n验证结果:', verified1.valid ? '✓ 有效' : '✗ 无效');
  if (!verified1.valid) console.log('错误:', verified1.error);

  // 令牌刷新
  console.log('\n--- 令牌刷新 ---');
  const refreshed = hmacJWT.refresh(token1, 7200);
  const decodedRefreshed = hmacJWT.decode(refreshed);
  console.log('新过期时间:', new Date((decodedRefreshed.payload.exp || 0) * 1000).toISOString());

  // 令牌管理
  console.log('\n--- 令牌管理 ---');
  const manager = new TokenManager();
  manager.storeToken('token-001', decoded1.payload);
  manager.storeToken('token-002', { ...decoded1.payload, jti: 'token-002' });
  console.log('活跃令牌数:', manager.getActiveTokenCount());
  
  manager.revokeToken('token-001');
  console.log('撤销后检查 token-001:', manager.isRevoked('token-001') ? '已撤销' : '有效');

  // JWE 加密
  console.log('\n--- JWE 加密令牌 ---');
  const jwe = new JWE();
  const encryptionKey = randomBytes(32);
  const encryptedToken = jwe.encrypt(token1, encryptionKey);
  console.log('JWE 格式:', encryptedToken.slice(0, 80) + '...');
  
  const decryptedToken = jwe.decrypt(encryptedToken, encryptionKey);
  console.log('解密验证:', decryptedToken === token1 ? '✓ 成功' : '✗ 失败');

  // 过期令牌示例
  console.log('\n--- 过期令牌测试 ---');
  const expiredToken = hmacJWT.sign(
    { userId: '999' },
    { expiresIn: -1 }  // 已经过期
  );
  const expiredCheck = hmacJWT.verify(expiredToken);
  console.log('过期令牌验证:', expiredCheck.valid ? '✓ 有效' : '✗ 无效');
  console.log('错误信息:', expiredCheck.error);
}
