/**
 * @file JWT 认证与授权
 * @category API Security → Authentication
 * @difficulty medium
 * @tags jwt, auth, security, token, authorization
 * 
 * @description
 * JWT (JSON Web Token) 认证实现：
 * - Token 生成与验证
 * - 刷新令牌机制
 * - 权限检查
 * - 安全存储
 */

import * as crypto from 'crypto';

// ============================================================================
// 1. JWT 数据结构
// ============================================================================

interface JWTHeader {
  alg: 'HS256' | 'HS512' | 'RS256';
  typ: 'JWT';
}

interface JWTPayload {
  sub: string;        // subject (user id)
  iss?: string;       // issuer
  aud?: string;       // audience
  exp: number;        // expiration time
  iat: number;        // issued at
  nbf?: number;       // not before
  jti?: string;       // JWT ID
  [key: string]: unknown;
}

interface JWTTokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// 2. JWT 编码/解码 (简化实现)
// ============================================================================

class JWTCodec {
  private secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  encode(payload: JWTPayload): string {
    const header: JWTHeader = { alg: 'HS256', typ: 'JWT' };
    
    const headerB64 = this.base64UrlEncode(JSON.stringify(header));
    const payloadB64 = this.base64UrlEncode(JSON.stringify(payload));
    
    const signature = this.sign(`${headerB64}.${payloadB64}`);
    
    return `${headerB64}.${payloadB64}.${signature}`;
  }

  decode(token: string): JWTPayload | null {
    try {
      const [headerB64, payloadB64, signature] = token.split('.');
      
      if (!headerB64 || !payloadB64 || !signature) {
        return null;
      }

      // 验证签名
      const expectedSignature = this.sign(`${headerB64}.${payloadB64}`);
      if (!this.timingSafeCompare(signature, expectedSignature)) {
        return null;
      }

      const payload = JSON.parse(this.base64UrlDecode(payloadB64)) as JWTPayload;
      
      // 检查过期时间
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  private sign(data: string): string {
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('base64url');
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str).toString('base64url');
  }

  private base64UrlDecode(str: string): string {
    return Buffer.from(str, 'base64url').toString('utf8');
  }

  private timingSafeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}

// ============================================================================
// 3. 认证服务
// ============================================================================

export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  permissions: string[];
}

export interface AuthConfig {
  secret: string;
  accessTokenExpiry: number;  // seconds
  refreshTokenExpiry: number; // seconds
  issuer?: string;
  audience?: string;
}

export class AuthService {
  private codec: JWTCodec;
  private config: AuthConfig;
  private refreshTokens = new Map<string, { userId: string; expiresAt: number }>();

  constructor(config: AuthConfig) {
    this.codec = new JWTCodec(config.secret);
    this.config = config;
  }

  // 生成 Token 对
  generateTokenPair(user: AuthUser): JWTTokenPair {
    const now = Math.floor(Date.now() / 1000);
    
    // Access Token
    const accessPayload: JWTPayload = {
      sub: user.id,
      iss: this.config.issuer,
      aud: this.config.audience,
      exp: now + this.config.accessTokenExpiry,
      iat: now,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions
    };

    // Refresh Token
    const refreshTokenId = this.generateSecureId();
    const refreshPayload: JWTPayload = {
      sub: user.id,
      jti: refreshTokenId,
      exp: now + this.config.refreshTokenExpiry,
      iat: now,
      type: 'refresh'
    } as JWTPayload;

    // 存储 refresh token
    this.refreshTokens.set(refreshTokenId, {
      userId: user.id,
      expiresAt: now + this.config.refreshTokenExpiry
    });

    return {
      accessToken: this.codec.encode(accessPayload),
      refreshToken: this.codec.encode(refreshPayload),
      expiresIn: this.config.accessTokenExpiry
    };
  }

  // 验证 Access Token
  verifyAccessToken(token: string): JWTPayload | null {
    const payload = this.codec.decode(token);
    if (!payload || payload.type === 'refresh') {
      return null;
    }
    return payload;
  }

  // 刷新 Token
  refreshAccessToken(refreshToken: string): JWTTokenPair | null {
    const payload = this.codec.decode(refreshToken);
    if (payload?.type !== 'refresh' || !payload.jti) {
      return null;
    }

    const stored = this.refreshTokens.get(payload.jti);
    if (!stored || stored.expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // 删除旧的 refresh token (轮换)
    this.refreshTokens.delete(payload.jti);

    // 生成新的 token 对
    const user: AuthUser = {
      id: stored.userId,
      email: payload.email as string || '',
      roles: (payload.roles as string[]) || [],
      permissions: (payload.permissions as string[]) || []
    };

    return this.generateTokenPair(user);
  }

  // 撤销 Refresh Token
  revokeRefreshToken(refreshToken: string): boolean {
    const payload = this.codec.decode(refreshToken);
    if (payload?.jti) {
      this.refreshTokens.delete(payload.jti);
      return true;
    }
    return false;
  }

  // 撤销用户的所有 Token
  revokeAllUserTokens(userId: string): void {
    for (const [tokenId, data] of this.refreshTokens.entries()) {
      if (data.userId === userId) {
        this.refreshTokens.delete(tokenId);
      }
    }
  }

  private generateSecureId(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// ============================================================================
// 4. 权限检查
// ============================================================================

export class AuthorizationChecker {
  // 检查角色
  static hasRole(payload: JWTPayload, role: string): boolean {
    const roles = (payload.roles as string[]) || [];
    return roles.includes(role);
  }

  // 检查任意角色
  static hasAnyRole(payload: JWTPayload, roles: string[]): boolean {
    const userRoles = (payload.roles as string[]) || [];
    return roles.some(role => userRoles.includes(role));
  }

  // 检查所有角色
  static hasAllRoles(payload: JWTPayload, roles: string[]): boolean {
    const userRoles = (payload.roles as string[]) || [];
    return roles.every(role => userRoles.includes(role));
  }

  // 检查权限
  static hasPermission(payload: JWTPayload, permission: string): boolean {
    const permissions = (payload.permissions as string[]) || [];
    return permissions.includes(permission);
  }

  // 检查资源所有权
  static isOwner(payload: JWTPayload, resourceOwnerId: string): boolean {
    return payload.sub === resourceOwnerId;
  }
}

// ============================================================================
// 5. 装饰器风格守卫 (模拟)
// ============================================================================

export interface GuardContext {
  user?: JWTPayload;
  request: {
    headers: Record<string, string>;
    params: Record<string, string>;
    body: Record<string, unknown>;
  };
}

type Guard = (context: GuardContext) => boolean | Promise<boolean>;

export const createAuthGuard = (authService: AuthService): Guard => {
  return (context: GuardContext): boolean => {
    const authHeader = context.request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.substring(7);
    const payload = authService.verifyAccessToken(token);
    if (!payload) {
      return false;
    }

    context.user = payload;
    return true;
  };
};

export const createRoleGuard = (...roles: string[]): Guard => {
  return (context: GuardContext): boolean => {
    if (!context.user) return false;
    return AuthorizationChecker.hasAnyRole(context.user, roles);
  };
};

export const createPermissionGuard = (...permissions: string[]): Guard => {
  return (context: GuardContext): boolean => {
    if (!context.user) return false;
    return permissions.every(p => AuthorizationChecker.hasPermission(context.user!, p));
  };
};

export const createOwnerGuard = (getOwnerId: (ctx: GuardContext) => string): Guard => {
  return (context: GuardContext): boolean => {
    if (!context.user) return false;
    const ownerId = getOwnerId(context);
    return AuthorizationChecker.isOwner(context.user, ownerId);
  };
};

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== JWT 认证与授权 ===\n');

  const authService = new AuthService({
    secret: 'your-secret-key-at-least-32-characters',
    accessTokenExpiry: 900,    // 15 分钟
    refreshTokenExpiry: 604800, // 7 天
    issuer: 'my-app',
    audience: 'my-api'
  });

  // 模拟用户
  const user: AuthUser = {
    id: 'user-123',
    email: 'admin@example.com',
    roles: ['admin', 'user'],
    permissions: ['users:read', 'users:write', 'posts:read', 'posts:write']
  };

  console.log('1. 生成 Token 对');
  const tokens = authService.generateTokenPair(user);
  console.log('Access Token:', tokens.accessToken.substring(0, 50) + '...');
  console.log('Refresh Token:', tokens.refreshToken.substring(0, 50) + '...');
  console.log('Expires In:', tokens.expiresIn, 'seconds');

  console.log('\n2. 验证 Access Token');
  const payload = authService.verifyAccessToken(tokens.accessToken);
  console.log('Payload:', payload ? {
    sub: payload.sub,
    email: payload.email,
    roles: payload.roles,
    exp: new Date(payload.exp * 1000).toISOString()
  } : null);

  console.log('\n3. 权限检查');
  if (payload) {
    console.log('Has admin role:', AuthorizationChecker.hasRole(payload, 'admin'));
    console.log('Has user role:', AuthorizationChecker.hasRole(payload, 'user'));
    console.log('Has editor role:', AuthorizationChecker.hasRole(payload, 'editor'));
    console.log('Can write posts:', AuthorizationChecker.hasPermission(payload, 'posts:write'));
    console.log('Can delete posts:', AuthorizationChecker.hasPermission(payload, 'posts:delete'));
  }

  console.log('\n4. 刷新 Token');
  const newTokens = authService.refreshAccessToken(tokens.refreshToken);
  console.log('New Access Token:', newTokens ? 'Generated' : 'Failed');

  console.log('\n5. 撤销 Token');
  authService.revokeAllUserTokens(user.id);
  console.log('All tokens revoked');

  console.log('\nJWT 安全要点:');
  console.log('- 使用强密钥 (至少 256 bits)');
  console.log('- Access Token 短时效 (15-30 分钟)');
  console.log('- Refresh Token 轮换机制');
  console.log('- 使用 HTTPS 传输');
  console.log('- 验证签名防止篡改');
}

// ============================================================================
// 导出 (类已在上面使用 export class 导出)
// ============================================================================

export type { JWTHeader, JWTPayload, JWTTokenPair, Guard };;
