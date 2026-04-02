/**
 * @file JWT 安全最佳实践
 * @category Cybersecurity → Authentication
 * @difficulty hard
 * @tags security, jwt, authentication, token-rotation, rs256
 *
 * @description
 * 演示 JWT（JSON Web Token）的安全最佳实践：
 * - HS256 / RS256 签名验证
 * - Token 过期检查（exp / nbf / iat）
 * - 刷新令牌轮换（Refresh Token Rotation）
 * - JWT 黑名单模拟（Logout / 撤销机制）
 */

import { createHmac, createSign, createVerify, randomBytes } from 'node:crypto';

export type JwtAlgorithm = 'HS256' | 'RS256';

export interface JwtHeader {
  alg: JwtAlgorithm;
  typ: 'JWT';
}

export interface JwtPayload {
  sub: string;
  iss?: string;
  aud?: string;
  iat: number;
  exp: number;
  jti: string;
  /** 角色/权限声明 */
  roles?: readonly string[];
}

export interface JwtTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface DecodedJwt {
  header: JwtHeader;
  payload: JwtPayload;
  signature: string;
}

/**
 * 模拟 Base64URL 编码（JWT 标准使用 Base64URL，非标准 Base64）
 */
function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(input: string): string {
  // 补齐 Padding
  const padding = '='.repeat((4 - (input.length % 4)) % 4);
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * JWT 安全服务
 *
 * 安全要点：
 * 1. HS256 使用共享密钥，适合服务端内部通信；RS256 使用公私钥对，适合分布式微服务。
 * 2. 必须验证 exp（过期时间），拒绝过期 Token。
 * 3. Refresh Token 应实现轮换机制：每次使用后发放新的 Refresh Token，旧 Token 失效。
 * 4. 登出/撤销场景需要维护 JWT 黑名单（或缩短 Access Token 有效期）。
 */
export class JwtSecurityService {
  private readonly hsSecret: string;
  private readonly rsPrivateKey: string;
  private readonly rsPublicKey: string;
  private readonly blacklist = new Set<string>();
  private readonly refreshTokenStore = new Map<
    string,
    { userId: string; issuedAt: number; replacedBy?: string }
  >();

  constructor(options: {
    hsSecret: string;
    rsPrivateKey: string;
    rsPublicKey: string;
  }) {
    this.hsSecret = options.hsSecret;
    this.rsPrivateKey = options.rsPrivateKey;
    this.rsPublicKey = options.rsPublicKey;
  }

  /**
   * 生成安全随机字符串，用于 JTI 或 Refresh Token
   */
  private generateSecureId(length = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * 签发 Access Token
   */
  signAccessToken(
    userId: string,
    algorithm: JwtAlgorithm,
    options: { expiresInSeconds?: number; roles?: readonly string[] } = {}
  ): string {
    const now = Math.floor(Date.now() / 1000);
    const header: JwtHeader = { alg: algorithm, typ: 'JWT' };
    const payload: JwtPayload = {
      sub: userId,
      iat: now,
      exp: now + (options.expiresInSeconds ?? 900), // 默认 15 分钟
      jti: this.generateSecureId(16),
      roles: options.roles ?? [],
    };

    const headerB64 = base64UrlEncode(JSON.stringify(header));
    const payloadB64 = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${headerB64}.${payloadB64}`;

    let signature: string;
    if (algorithm === 'HS256') {
      // HMAC-SHA256 签名
      signature = createHmac('sha256', this.hsSecret)
        .update(signingInput)
        .digest('base64url');
    } else {
      // RS256 私钥签名
      signature = createSign('RSA-SHA256')
        .update(signingInput)
        .sign(this.rsPrivateKey, 'base64url');
    }

    return `${signingInput}.${signature}`;
  }

  /**
   * 解析 JWT（不验证签名）
   */
  decode(token: string): DecodedJwt {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }
    const [headerB64, payloadB64, signature] = parts;
    const header = JSON.parse(base64UrlDecode(headerB64)) as JwtHeader;
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as JwtPayload;
    return { header, payload, signature };
  }

  /**
   * 验证 JWT 签名与声明
   */
  verify(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [headerB64, payloadB64, signature] = parts;
    const signingInput = `${headerB64}.${payloadB64}`;
    const header = JSON.parse(base64UrlDecode(headerB64)) as JwtHeader;
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as JwtPayload;

    // 1. 算法白名单校验（防止 alg=none 攻击）
    if (!['HS256', 'RS256'].includes(header.alg)) {
      throw new Error(`Unsupported or insecure algorithm: ${header.alg}`);
    }

    // 2. 签名验证
    let valid = false;
    if (header.alg === 'HS256') {
      const expected = createHmac('sha256', this.hsSecret)
        .update(signingInput)
        .digest('base64url');
      valid = signature === expected;
    } else {
      valid = createVerify('RSA-SHA256')
        .update(signingInput)
        .verify(this.rsPublicKey, signature, 'base64url');
    }

    if (!valid) {
      throw new Error('Invalid JWT signature');
    }

    // 3. 时间声明验证
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > payload.exp) {
      throw new Error('JWT has expired');
    }
    if (payload.nbf && now < payload.nbf) {
      throw new Error('JWT not yet valid');
    }

    // 4. 黑名单检查
    if (this.blacklist.has(payload.jti)) {
      throw new Error('JWT has been revoked');
    }

    return payload;
  }

  /**
   * 签发 Token 对（Access Token + Refresh Token）
   */
  issueTokenPair(
    userId: string,
    algorithm: JwtAlgorithm,
    accessOptions?: { expiresInSeconds?: number; roles?: readonly string[] }
  ): JwtTokenPair {
    const accessToken = this.signAccessToken(userId, algorithm, accessOptions);
    const refreshToken = this.generateSecureId(32);

    this.refreshTokenStore.set(refreshToken, {
      userId,
      issuedAt: Date.now(),
    });

    return { accessToken, refreshToken };
  }

  /**
   * 刷新令牌轮换（Refresh Token Rotation）
   *
   * 安全原则：每次使用 Refresh Token 后，原 Token 立即失效，并发放新的 Token 对。
   * 这能有效检测 Refresh Token 窃取（攻击者使用旧 Token 时，合法用户下次刷新会失败）。
   */
  rotateRefreshToken(
    oldRefreshToken: string,
    algorithm: JwtAlgorithm
  ): JwtTokenPair {
    const record = this.refreshTokenStore.get(oldRefreshToken);
    if (!record) {
      throw new Error('Invalid refresh token');
    }

    // 若该 Refresh Token 已被轮换过，说明可能存在重放攻击或窃取
    if (record.replacedBy) {
      // 安全响应：撤销该用户所有 Refresh Token（模拟）
      this.revokeAllUserRefreshTokens(record.userId);
      throw new Error('Refresh token reuse detected. All tokens revoked.');
    }

    // 生成新的 Token 对
    const newPair = this.issueTokenPair(record.userId, algorithm);

    // 标记旧 Token 已被替换
    record.replacedBy = newPair.refreshToken;
    this.refreshTokenStore.set(oldRefreshToken, record);

    return newPair;
  }

  /**
   * 将 JWT 加入黑名单（用于登出或撤销）
   */
  revokeAccessToken(jti: string): void {
    this.blacklist.add(jti);
  }

  /**
   * 撤销用户的全部 Refresh Token
   */
  private revokeAllUserRefreshTokens(userId: string): void {
    for (const [token, data] of this.refreshTokenStore.entries()) {
      if (data.userId === userId) {
        data.replacedBy = 'REVOKED';
        this.refreshTokenStore.set(token, data);
      }
    }
  }

  isBlacklisted(jti: string): boolean {
    return this.blacklist.has(jti);
  }
}

export function demo(): void {
  console.log('=== JWT 安全最佳实践 Demo ===\n');

  // 生成演示用的 RSA 密钥对（实际项目应从安全密钥库加载）
  const { generateKeyPairSync } = require('node:crypto');
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  const jwtService = new JwtSecurityService({
    hsSecret: 'demo-hs256-secret-at-least-32-bytes-long!',
    rsPrivateKey: privateKey,
    rsPublicKey: publicKey,
  });

  // 1. HS256 签发与验证
  console.log('--- HS256 签名验证 ---');
  const hsToken = jwtService.signAccessToken('user-001', 'HS256', {
    expiresInSeconds: 300,
    roles: ['reader'],
  });
  console.log(`  签发 HS256 Token: ${hsToken.slice(0, 40)}...`);
  const hsPayload = jwtService.verify(hsToken);
  console.log(`  验证通过: sub=${hsPayload.sub}, roles=${hsPayload.roles?.join(',')}`);

  // 2. RS256 签发与验证
  console.log('\n--- RS256 签名验证 ---');
  const rsToken = jwtService.signAccessToken('user-002', 'RS256', {
    expiresInSeconds: 300,
    roles: ['admin', 'editor'],
  });
  console.log(`  签发 RS256 Token: ${rsToken.slice(0, 40)}...`);
  const rsPayload = jwtService.verify(rsToken);
  console.log(`  验证通过: sub=${rsPayload.sub}, roles=${rsPayload.roles?.join(',')}`);

  // 3. 过期检测
  console.log('\n--- Token 过期检查 ---');
  const expiredToken = jwtService.signAccessToken('user-003', 'HS256', {
    expiresInSeconds: -1, // 已过期
  });
  try {
    jwtService.verify(expiredToken);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  预期异常: ${message}`);
  }

  // 4. Refresh Token 轮换
  console.log('\n--- Refresh Token 轮换 ---');
  const pair = jwtService.issueTokenPair('user-004', 'HS256');
  console.log(`  初始 Refresh Token: ${pair.refreshToken.slice(0, 24)}...`);
  const rotated = jwtService.rotateRefreshToken(pair.refreshToken, 'HS256');
  console.log(`  轮换后 Refresh Token: ${rotated.refreshToken.slice(0, 24)}...`);

  // 5. 黑名单模拟
  console.log('\n--- JWT 黑名单（登出撤销）---');
  jwtService.revokeAccessToken(rsPayload.jti);
  console.log(`  Token JTI ${rsPayload.jti} 已加入黑名单`);
  try {
    jwtService.verify(rsToken);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`  预期异常: ${message}`);
  }
}
