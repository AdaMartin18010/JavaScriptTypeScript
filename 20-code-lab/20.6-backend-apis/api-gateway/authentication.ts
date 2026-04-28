/**
 * @file API 网关认证
 * @category API Gateway → Authentication
 * @difficulty medium
 * @tags authentication, jwt, api-key, oauth
 *
 * @description
 * API 网关认证实现：JWT 验证、API Key、OAuth2 等多种认证方式
 */

import { createHash, createHmac, randomBytes } from 'crypto';

// ============================================================================
// 类型定义
// ============================================================================

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface AuthUser {
  id: string;
  roles: string[];
  permissions: string[];
  metadata?: Record<string, unknown>;
}

export interface JWTConfig {
  secret: string;
  algorithm?: 'HS256' | 'HS384' | 'HS512';
  expiresIn?: number; // seconds
  issuer?: string;
  audience?: string;
}

export interface JWTClaims {
  sub: string; // subject (user id)
  iat: number; // issued at
  exp: number; // expiration
  iss?: string; // issuer
  aud?: string; // audience
  roles?: string[];
  [key: string]: unknown;
}

// ============================================================================
// JWT 实现
// ============================================================================

export class JWTHandler {
  constructor(private config: JWTConfig) {}

  /**
   * 生成 JWT Token
   */
  sign(payload: Omit<JWTClaims, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const claims: JWTClaims = {
      ...payload,
      iat: now,
      exp: now + (this.config.expiresIn || 3600)
    } as JWTClaims;

    const header = {
      alg: this.config.algorithm || 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(claims));
    const signature = this.signSignature(encodedHeader, encodedPayload);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * 验证 JWT Token
   */
  verify(token: string): JWTClaims {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;

    // 验证签名
    const expectedSignature = this.signSignature(encodedHeader, encodedPayload);
    if (!this.timingSafeEqual(signature, expectedSignature)) {
      throw new Error('Invalid signature');
    }

    // 解析 payload
    const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JWTClaims;

    // 检查过期
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }

    // 验证 issuer
    if (this.config.issuer && payload.iss !== this.config.issuer) {
      throw new Error('Invalid issuer');
    }

    // 验证 audience
    if (this.config.audience && payload.aud !== this.config.audience) {
      throw new Error('Invalid audience');
    }

    return payload;
  }

  /**
   * 解码 Token（不验证签名）
   */
  decode(token: string): JWTClaims | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(this.base64UrlDecode(parts[1])) as JWTClaims;
    } catch {
      return null;
    }
  }

  /**
   * 刷新 Token
   */
  refresh(token: string): string {
    const claims = this.verify(token);
    const { iat, exp, ...rest } = claims;
    return this.sign(rest);
  }

  private signSignature(header: string, payload: string): string {
    const data = `${header}.${payload}`;
    const hmac = createHmac('sha256', this.config.secret);
    hmac.update(data);
    return this.base64UrlEncode(hmac.digest());
  }

  private base64UrlEncode(str: string | Buffer): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    // 添加填充
    const padding = 4 - (str.length % 4);
    if (padding !== 4) {
      str += '='.repeat(padding);
    }
    
    return Buffer.from(
      str.replace(/-/g, '+').replace(/_/g, '/'),
      'base64'
    ).toString('utf-8');
  }

  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

// ============================================================================
// API Key 认证
// ============================================================================

export interface APIKey {
  key: string;
  name: string;
  ownerId: string;
  permissions: string[];
  createdAt: number;
  expiresAt?: number;
  lastUsedAt?: number;
  rateLimit?: { requests: number; windowMs: number };
}

export class APIKeyManager {
  private keys = new Map<string, APIKey>();
  private keyIndex = new Map<string, string>(); // hashed key -> key id

  /**
   * 生成新的 API Key
   */
  generateKey(name: string, ownerId: string, permissions: string[]): { id: string; key: string } {
    const keyId = `ak_${randomBytes(16).toString('hex')}`;
    const keySecret = randomBytes(32).toString('base64url');
    const fullKey = `${keyId}.${keySecret}`;
    
    const apiKey: APIKey = {
      key: keyId,
      name,
      ownerId,
      permissions,
      createdAt: Date.now()
    };

    this.keys.set(keyId, apiKey);
    this.keyIndex.set(this.hashKey(fullKey), keyId);

    return { id: keyId, key: fullKey };
  }

  /**
   * 验证 API Key
   */
  validateKey(fullKey: string): AuthResult {
    const hashed = this.hashKey(fullKey);
    const keyId = this.keyIndex.get(hashed);

    if (!keyId) {
      return { success: false, error: 'Invalid API key' };
    }

    const apiKey = this.keys.get(keyId);
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    // 检查过期
    if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) {
      return { success: false, error: 'API key expired' };
    }

    // 更新最后使用时间
    apiKey.lastUsedAt = Date.now();

    return {
      success: true,
      user: {
        id: apiKey.ownerId,
        roles: ['api-user'],
        permissions: apiKey.permissions
      },
      metadata: {
        keyId: apiKey.key,
        keyName: apiKey.name
      }
    };
  }

  /**
   * 撤销 API Key
   */
  revokeKey(keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) return false;

    // 从索引中移除
    for (const [hash, id] of this.keyIndex) {
      if (id === keyId) {
        this.keyIndex.delete(hash);
        break;
      }
    }

    return this.keys.delete(keyId);
  }

  /**
   * 获取 API Key 信息
   */
  getKeyInfo(keyId: string): Omit<APIKey, 'key'> | undefined {
    const key = this.keys.get(keyId);
    if (!key) return undefined;

    const { key: _, ...info } = key;
    return info;
  }

  private hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }
}

// ============================================================================
// OAuth2 简化实现
// ============================================================================

export interface OAuthClient {
  clientId: string;
  clientSecret: string;
  name: string;
  redirectUris: string[];
  allowedScopes: string[];
}

export interface OAuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string;
}

export class OAuth2Server {
  private clients = new Map<string, OAuthClient>();
  private authCodes = new Map<string, { clientId: string; userId: string; scope: string; expiresAt: number }>();
  private accessTokens = new Map<string, { userId: string; scope: string; expiresAt: number }>();
  private refreshTokens = new Map<string, string>(); // refresh token -> access token

  /**
   * 注册客户端
   */
  registerClient(name: string, redirectUris: string[], allowedScopes: string[]): OAuthClient {
    const client: OAuthClient = {
      clientId: `client_${randomBytes(8).toString('hex')}`,
      clientSecret: randomBytes(32).toString('hex'),
      name,
      redirectUris,
      allowedScopes
    };

    this.clients.set(client.clientId, client);
    return client;
  }

  /**
   * 验证客户端
   */
  validateClient(clientId: string, clientSecret: string): boolean {
    const client = this.clients.get(clientId);
    return client?.clientSecret === clientSecret;
  }

  /**
   * 生成授权码（Authorization Code Flow）
   */
  generateAuthCode(clientId: string, userId: string, scope: string): string {
    const code = randomBytes(32).toString('hex');
    
    this.authCodes.set(code, {
      clientId,
      userId,
      scope,
      expiresAt: Date.now() + 600000 // 10分钟
    });

    return code;
  }

  /**
   * 用授权码换取 Token
   */
  exchangeCodeForToken(clientId: string, code: string): OAuthToken | null {
    const authCode = this.authCodes.get(code);
    
    if (authCode?.clientId !== clientId) {
      return null;
    }

    if (authCode.expiresAt < Date.now()) {
      this.authCodes.delete(code);
      return null;
    }

    // 使用一次后删除
    this.authCodes.delete(code);

    return this.generateToken(authCode.userId, authCode.scope);
  }

  /**
   * 验证 Access Token
   */
  validateToken(accessToken: string): { userId: string; scope: string } | null {
    const token = this.accessTokens.get(accessToken);
    
    if (!token || token.expiresAt < Date.now()) {
      return null;
    }

    return { userId: token.userId, scope: token.scope };
  }

  /**
   * 刷新 Token
   */
  refreshAccessToken(refreshToken: string): OAuthToken | null {
    const accessToken = this.refreshTokens.get(refreshToken);
    if (!accessToken) return null;

    const tokenData = this.accessTokens.get(accessToken);
    if (!tokenData) return null;

    // 删除旧 token
    this.accessTokens.delete(accessToken);
    this.refreshTokens.delete(refreshToken);

    // 生成新 token
    return this.generateToken(tokenData.userId, tokenData.scope);
  }

  private generateToken(userId: string, scope: string): OAuthToken {
    const accessToken = randomBytes(32).toString('hex');
    const refreshToken = randomBytes(32).toString('hex');
    const expiresIn = 3600; // 1小时

    this.accessTokens.set(accessToken, {
      userId,
      scope,
      expiresAt: Date.now() + expiresIn * 1000
    });

    this.refreshTokens.set(refreshToken, accessToken);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn,
      scope
    };
  }
}

// ============================================================================
// 认证中间件组合
// ============================================================================

export interface AuthMiddleware {
  authenticate(request: { headers: Record<string, string> }): Promise<AuthResult>;
}

export class CompositeAuthMiddleware implements AuthMiddleware {
  private strategies: { name: string; middleware: AuthMiddleware; priority: number }[] = [];

  addStrategy(name: string, middleware: AuthMiddleware, priority = 10): void {
    this.strategies.push({ name, middleware, priority });
    this.strategies.sort((a, b) => a.priority - b.priority);
  }

  async authenticate(request: { headers: Record<string, string> }): Promise<AuthResult> {
    const errors: string[] = [];

    for (const strategy of this.strategies) {
      try {
        const result = await strategy.middleware.authenticate(request);
        if (result.success) {
          return { ...result, metadata: { ...result.metadata, strategy: strategy.name } };
        }
        if (result.error) {
          errors.push(`${strategy.name}: ${result.error}`);
        }
      } catch (error) {
        errors.push(`${strategy.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return {
      success: false,
      error: errors.join('; ')
    };
  }
}

// JWT 中间件
export class JWTMiddleware implements AuthMiddleware {
  constructor(private jwt: JWTHandler) {}

  async authenticate(request: { headers: Record<string, string> }): Promise<AuthResult> {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return { success: false, error: 'Missing or invalid Authorization header' };
    }

    const token = authHeader.slice(7);
    
    try {
      const claims = this.jwt.verify(token);
      return {
        success: true,
        user: {
          id: claims.sub,
          roles: claims.roles || [],
          permissions: []
        }
      };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Invalid token' 
      };
    }
  }
}

// API Key 中间件
export class APIKeyMiddleware implements AuthMiddleware {
  constructor(private manager: APIKeyManager) {}

  async authenticate(request: { headers: Record<string, string> }): Promise<AuthResult> {
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      return { success: false, error: 'Missing API key' };
    }

    return this.manager.validateKey(apiKey);
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== API 网关认证演示 ===\n');

  // 1. JWT
  console.log('--- JWT 认证 ---');
  const jwt = new JWTHandler({
    secret: 'my-secret-key',
    expiresIn: 3600,
    issuer: 'my-api'
  });

  const token = jwt.sign({
    sub: 'user-123',
    roles: ['admin', 'user'],
    custom: 'data'
  });
  console.log('Generated token:', token.substring(0, 50) + '...');

  const decoded = jwt.decode(token);
  console.log('Decoded claims:', decoded);

  const verified = jwt.verify(token);
  console.log('Verified subject:', verified.sub);

  // 2. API Key
  console.log('\n--- API Key 认证 ---');
  const apiKeyManager = new APIKeyManager();
  const { id, key } = apiKeyManager.generateKey('My App', 'user-456', ['read', 'write']);
  console.log('Generated API Key ID:', id);
  console.log('Full key:', key.substring(0, 30) + '...');

  const validation = apiKeyManager.validateKey(key);
  console.log('Validation result:', validation.success);
  if (validation.user) {
    console.log('User permissions:', validation.user.permissions);
  }

  // 3. OAuth2
  console.log('\n--- OAuth2 服务器 ---');
  const oauth = new OAuth2Server();
  const client = oauth.registerClient('My OAuth App', ['https://example.com/callback'], ['read', 'write']);
  console.log('OAuth Client ID:', client.clientId);

  const authCode = oauth.generateAuthCode(client.clientId, 'user-789', 'read write');
  console.log('Authorization code:', authCode.substring(0, 20) + '...');

  const oauthToken = oauth.exchangeCodeForToken(client.clientId, authCode);
  if (oauthToken) {
    console.log('Access token obtained:', oauthToken.accessToken.substring(0, 20) + '...');
    console.log('Expires in:', oauthToken.expiresIn, 'seconds');

    const validated = oauth.validateToken(oauthToken.accessToken);
    console.log('Token valid for user:', validated?.userId);
  }

  // 4. 组合认证
  console.log('\n--- 组合认证中间件 ---');
  const composite = new CompositeAuthMiddleware();
  composite.addStrategy('jwt', new JWTMiddleware(jwt), 1);
  composite.addStrategy('apikey', new APIKeyMiddleware(apiKeyManager), 2);

  // 使用 JWT 认证
  composite.authenticate({ headers: { authorization: `Bearer ${token}` } })
    .then(result => {
      console.log('JWT auth result:', result.success, result.metadata?.strategy);
    });

  // 使用 API Key 认证
  composite.authenticate({ headers: { 'x-api-key': key } })
    .then(result => {
      console.log('API Key auth result:', result.success, result.metadata?.strategy);
    });
}
