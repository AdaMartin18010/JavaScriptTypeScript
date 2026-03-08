/**
 * @fileoverview 完整的认证授权系统
 * 
 * 本模块提供了一个企业级的认证授权解决方案，包括：
 * - JWT Token 管理（生成、验证、刷新）
 * - 基于角色的访问控制 (RBAC)
 * - 会话管理
 * - 权限守卫
 * 
 * @example
 * ```typescript
 * const auth = new AuthManager({ jwtSecret: 'your-secret' });
 * const token = auth.generateToken({ userId: '123', role: 'admin' });
 * const isValid = auth.verifyToken(token);
 * ```
 * 
 * @module auth-manager
 * @version 1.0.0
 */

import * as crypto from 'crypto';

// ============================================================================
// 类型定义
// ============================================================================

/**
 * 用户角色
 */
export type UserRole = 'guest' | 'user' | 'moderator' | 'admin' | 'superadmin';

/**
 * 权限定义
 */
export type Permission = 
  | 'read:own'
  | 'read:any'
  | 'write:own'
  | 'write:any'
  | 'delete:own'
  | 'delete:any'
  | 'manage:users'
  | 'manage:roles'
  | 'manage:system';

/**
 * 用户信息
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions?: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * JWT Payload
 */
export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  permissions: Permission[];
  iat: number;
  exp: number;
  jti: string;
}

/**
 * Token 对
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

/**
 * 会话信息
 */
export interface Session {
  id: string;
  userId: string;
  tokenJti: string;
  refreshTokenJti: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isValid: boolean;
}

/**
 * 认证结果
 */
export interface AuthResult {
  success: boolean;
  user?: User;
  tokens?: TokenPair;
  error?: string;
  code: string;
}

/**
 * 认证配置
 */
export interface AuthConfig {
  jwtSecret: string;
  jwtIssuer?: string;
  jwtAudience?: string;
  accessTokenExpiry?: number; // 秒，默认 15 分钟
  refreshTokenExpiry?: number; // 秒，默认 7 天
  maxSessionsPerUser?: number;
  enableSessionTracking?: boolean;
}

/**
 * 守卫上下文
 */
export interface GuardContext {
  user?: User;
  token?: JWTPayload;
  request?: Record<string, unknown>;
  resource?: Record<string, unknown>;
}

/**
 * 守卫函数类型
 */
export type GuardFunction = (context: GuardContext) => boolean | Promise<boolean>;

/**
 * 守卫结果
 */
export interface GuardResult {
  allowed: boolean;
  reason?: string;
  missingPermissions?: Permission[];
}

// ============================================================================
// 角色权限映射
// ============================================================================

/**
 * 默认角色权限映射
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest: ['read:own'],
  user: ['read:own', 'write:own', 'delete:own'],
  moderator: ['read:own', 'read:any', 'write:own', 'delete:own', 'manage:users'],
  admin: ['read:any', 'write:any', 'delete:any', 'manage:users', 'manage:roles'],
  superadmin: ['read:any', 'write:any', 'delete:any', 'manage:users', 'manage:roles', 'manage:system'],
};

// ============================================================================
// JWT 工具类
// ============================================================================

/**
 * JWT Token 管理类
 */
export class JWTManager {
  private secret: string;
  private issuer?: string;
  private audience?: string;
  private accessTokenExpiry: number;
  private refreshTokenExpiry: number;

  constructor(config: AuthConfig) {
    this.secret = config.jwtSecret;
    this.issuer = config.jwtIssuer;
    this.audience = config.jwtAudience;
    this.accessTokenExpiry = config.accessTokenExpiry ?? 15 * 60; // 15 分钟
    this.refreshTokenExpiry = config.refreshTokenExpiry ?? 7 * 24 * 60 * 60; // 7 天
  }

  /**
   * 生成 JWT Token
   */
  generateToken(user: User, type: 'access' | 'refresh' = 'access'): string {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (type === 'access' ? this.accessTokenExpiry : this.refreshTokenExpiry);
    const jti = crypto.randomUUID();

    const header = {
      alg: 'HS256',
      typ: 'JWT',
    };

    const payload: Omit<JWTPayload, 'iat' | 'exp' | 'jti'> & { iat?: number; exp?: number; jti?: string; iss?: string; aud?: string } = {
      userId: user.id,
      username: user.username,
      role: user.role,
      permissions: user.permissions ?? DEFAULT_ROLE_PERMISSIONS[user.role],
    };

    if (this.issuer) payload.iss = this.issuer;
    if (this.audience) payload.aud = this.audience;
    payload.iat = now;
    payload.exp = exp;
    payload.jti = jti;

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(payload));
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * 验证 JWT Token
   */
  verifyToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, signature] = parts;

      // 验证签名
      const expectedSignature = this.sign(`${encodedHeader}.${encodedPayload}`);
      if (!this.timingSafeEqual(signature, expectedSignature)) {
        return null;
      }

      // 解析 payload
      const payload = JSON.parse(this.base64UrlDecode(encodedPayload)) as JWTPayload;

      // 检查过期时间
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp < now) {
        return null;
      }

      // 验证 issuer
      if (this.issuer && payload.iss !== this.issuer) {
        return null;
      }

      // 验证 audience
      if (this.audience && payload.aud !== this.audience) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * 生成 Token 对（access + refresh）
   */
  generateTokenPair(user: User): TokenPair {
    const accessToken = this.generateToken(user, 'access');
    const refreshToken = this.generateToken(user, 'refresh');
    const accessPayload = this.verifyToken(accessToken)!;

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(accessPayload.exp * 1000),
      refreshTokenExpiresAt: new Date(Date.now() + this.refreshTokenExpiry * 1000),
    };
  }

  /**
   * 刷新 Access Token
   */
  refreshAccessToken(refreshToken: string, user: User): TokenPair | null {
    const payload = this.verifyToken(refreshToken);
    if (!payload) return null;

    return this.generateTokenPair(user);
  }

  /**
   * 解析 Token（不验证）
   */
  decodeToken(token: string): Partial<JWTPayload> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(this.base64UrlDecode(parts[1]));
    } catch {
      return null;
    }
  }

  /**
   * 获取 Token 剩余有效时间（秒）
   */
  getTokenRemainingTime(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload?.exp) return 0;
    const now = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - now);
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private base64UrlDecode(str: string): string {
    const padding = '='.repeat((4 - (str.length % 4)) % 4);
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/') + padding;
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  private sign(data: string): string {
    return crypto.createHmac('sha256', this.secret).update(data).digest('base64url');
  }

  private timingSafeEqual(a: string, b: string): boolean {
    try {
      return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
      return false;
    }
  }
}

// ============================================================================
// 会话管理类
// ============================================================================

/**
 * 会话管理器
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private userSessions: Map<string, Set<string>> = new Map();
  private maxSessionsPerUser: number;

  constructor(maxSessionsPerUser: number = 5) {
    this.maxSessionsPerUser = maxSessionsPerUser;
  }

  /**
   * 创建新会话
   */
  createSession(
    userId: string,
    tokenJti: string,
    refreshTokenJti: string,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Session {
    // 检查会话数量限制
    const userSessionIds = this.userSessions.get(userId) ?? new Set();
    if (userSessionIds.size >= this.maxSessionsPerUser) {
      // 移除最早的会话
      const oldestSessionId = this.findOldestSession(userId);
      if (oldestSessionId) {
        this.revokeSession(oldestSessionId);
      }
    }

    const session: Session = {
      id: crypto.randomUUID(),
      userId,
      tokenJti,
      refreshTokenJti,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      createdAt: new Date(),
      lastActivityAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 天
      isValid: true,
    };

    this.sessions.set(session.id, session);
    userSessionIds.add(session.id);
    this.userSessions.set(userId, userSessionIds);

    return session;
  }

  /**
   * 获取会话
   */
  getSession(sessionId: string): Session | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * 通过 Token JTI 查找会话
   */
  findSessionByTokenJti(tokenJti: string): Session | undefined {
    return Array.from(this.sessions.values()).find((s) => s.tokenJti === tokenJti);
  }

  /**
   * 更新会话活动
   */
  touchSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isValid) return false;

    session.lastActivityAt = new Date();
    return true;
  }

  /**
   * 撤销会话
   */
  revokeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.isValid = false;
    
    const userSessionIds = this.userSessions.get(session.userId);
    if (userSessionIds) {
      userSessionIds.delete(sessionId);
    }

    return true;
  }

  /**
   * 撤销用户的所有会话
   */
  revokeAllUserSessions(userId: string): number {
    const userSessionIds = this.userSessions.get(userId);
    if (!userSessionIds) return 0;

    let count = 0;
    userSessionIds.forEach((sessionId) => {
      if (this.revokeSession(sessionId)) {
        count++;
      }
    });

    this.userSessions.delete(userId);
    return count;
  }

  /**
   * 获取用户的所有会话
   */
  getUserSessions(userId: string): Session[] {
    const userSessionIds = this.userSessions.get(userId) ?? new Set();
    return Array.from(userSessionIds)
      .map((id) => this.sessions.get(id))
      .filter((s): s is Session => s !== undefined && s.isValid);
  }

  /**
   * 清理过期会话
   */
  cleanupExpiredSessions(): number {
    const now = new Date();
    let count = 0;

    this.sessions.forEach((session, id) => {
      if (session.expiresAt < now || !session.isValid) {
        this.sessions.delete(id);
        const userSessions = this.userSessions.get(session.userId);
        if (userSessions) {
          userSessions.delete(id);
        }
        count++;
      }
    });

    return count;
  }

  private findOldestSession(userId: string): string | undefined {
    const userSessionIds = this.userSessions.get(userId);
    if (!userSessionIds || userSessionIds.size === 0) return undefined;

    let oldestId: string | undefined;
    let oldestTime = Infinity;

    userSessionIds.forEach((sessionId) => {
      const session = this.sessions.get(sessionId);
      if (session && session.createdAt.getTime() < oldestTime) {
        oldestTime = session.createdAt.getTime();
        oldestId = sessionId;
      }
    });

    return oldestId;
  }
}

// ============================================================================
// 权限守卫类
// ============================================================================

/**
 * 权限守卫
 */
export class PermissionGuard {
  private guards: Map<string, GuardFunction[]> = new Map();

  /**
   * 注册守卫
   */
  registerGuard(resource: string, ...guards: GuardFunction[]): void {
    const existing = this.guards.get(resource) ?? [];
    this.guards.set(resource, [...existing, ...guards]);
  }

  /**
   * 检查权限
   */
  async checkPermission(
    user: User | undefined,
    permission: Permission,
    context?: Partial<GuardContext>
  ): Promise<GuardResult> {
    if (!user) {
      return { allowed: false, reason: 'User not authenticated' };
    }

    const userPermissions = user.permissions ?? DEFAULT_ROLE_PERMISSIONS[user.role];
    
    // 检查超级管理员
    if (userPermissions.includes('manage:system')) {
      return { allowed: true };
    }

    // 检查具体权限
    if (!userPermissions.includes(permission)) {
      return {
        allowed: false,
        reason: `Missing permission: ${permission}`,
        missingPermissions: [permission],
      };
    }

    const fullContext: GuardContext = {
      user,
      ...context,
    };

    // 执行资源特定守卫
    const resourceGuards = this.guards.get(permission) ?? [];
    for (const guard of resourceGuards) {
      const result = await guard(fullContext);
      if (!result) {
        return {
          allowed: false,
          reason: `Guard check failed for permission: ${permission}`,
        };
      }
    }

    return { allowed: true };
  }

  /**
   * 检查多个权限（AND 关系）
   */
  async checkAllPermissions(
    user: User | undefined,
    permissions: Permission[],
    context?: Partial<GuardContext>
  ): Promise<GuardResult> {
    const missingPermissions: Permission[] = [];

    for (const permission of permissions) {
      const result = await this.checkPermission(user, permission, context);
      if (!result.allowed) {
        missingPermissions.push(permission);
      }
    }

    if (missingPermissions.length > 0) {
      return {
        allowed: false,
        reason: `Missing permissions: ${missingPermissions.join(', ')}`,
        missingPermissions,
      };
    }

    return { allowed: true };
  }

  /**
   * 检查多个权限（OR 关系）
   */
  async checkAnyPermission(
    user: User | undefined,
    permissions: Permission[],
    context?: Partial<GuardContext>
  ): Promise<GuardResult> {
    for (const permission of permissions) {
      const result = await this.checkPermission(user, permission, context);
      if (result.allowed) {
        return { allowed: true };
      }
    }

    return {
      allowed: false,
      reason: `User does not have any of the required permissions: ${permissions.join(', ')}`,
    };
  }

  /**
   * 检查所有权
   */
  checkOwnership(user: User, resourceOwnerId: string): GuardResult {
    if (user.id === resourceOwnerId) {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: 'User does not own this resource',
    };
  }

  /**
   * 创建资源守卫 - 只允许资源所有者
   */
  createOwnershipGuard(): GuardFunction {
    return (context: GuardContext): boolean => {
      if (!context.user || !context.resource) return false;
      return context.user.id === context.resource['ownerId'];
    };
  }

  /**
   * 创建角色守卫
   */
  createRoleGuard(...allowedRoles: UserRole[]): GuardFunction {
    return (context: GuardContext): boolean => {
      if (!context.user) return false;
      return allowedRoles.includes(context.user.role);
    };
  }
}

// ============================================================================
// 主认证管理类
// ============================================================================

/**
 * 认证管理器 - 主要入口类
 */
export class AuthManager {
  public jwt: JWTManager;
  public sessions: SessionManager;
  public guard: PermissionGuard;
  private config: AuthConfig;

  constructor(config: AuthConfig) {
    this.config = config;
    this.jwt = new JWTManager(config);
    this.sessions = new SessionManager(config.maxSessionsPerUser ?? 5);
    this.guard = new PermissionGuard();
  }

  /**
   * 用户登录
   */
  async login(
    user: User,
    metadata?: { ipAddress?: string; userAgent?: string }
  ): Promise<AuthResult> {
    try {
      // 生成 Token 对
      const tokens = this.jwt.generateTokenPair(user);

      // 解析 Token 获取 JTI
      const accessPayload = this.jwt.decodeToken(tokens.accessToken);
      const refreshPayload = this.jwt.decodeToken(tokens.refreshToken);

      // 创建会话
      if (this.config.enableSessionTracking !== false) {
        this.sessions.createSession(
          user.id,
          accessPayload?.jti ?? '',
          refreshPayload?.jti ?? '',
          metadata
        );
      }

      return {
        success: true,
        user,
        tokens,
        code: 'AUTH_SUCCESS',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
        code: 'AUTH_ERROR',
      };
    }
  }

  /**
   * 用户登出
   */
  logout(token: string): boolean {
    const payload = this.jwt.decodeToken(token);
    if (!payload?.jti) return false;

    const session = this.sessions.findSessionByTokenJti(payload.jti);
    if (session) {
      return this.sessions.revokeSession(session.id);
    }

    return true;
  }

  /**
   * 验证请求
   */
  async authenticate(token: string): Promise<AuthResult> {
    const payload = this.jwt.verifyToken(token);
    
    if (!payload) {
      return {
        success: false,
        error: 'Invalid or expired token',
        code: 'TOKEN_INVALID',
      };
    }

    // 检查会话有效性
    if (this.config.enableSessionTracking !== false) {
      const session = this.sessions.findSessionByTokenJti(payload.jti);
      if (!session || !session.isValid) {
        return {
          success: false,
          error: 'Session revoked',
          code: 'SESSION_REVOKED',
        };
      }

      this.sessions.touchSession(session.id);
    }

    const user: User = {
      id: payload.userId,
      username: payload.username,
      email: '', // 需要从数据库获取
      role: payload.role,
      permissions: payload.permissions,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      user,
      code: 'AUTH_SUCCESS',
    };
  }

  /**
   * 刷新 Token
   */
  async refresh(refreshToken: string, user: User): Promise<AuthResult> {
    const payload = this.jwt.verifyToken(refreshToken);
    
    if (!payload) {
      return {
        success: false,
        error: 'Invalid or expired refresh token',
        code: 'REFRESH_TOKEN_INVALID',
      };
    }

    const tokens = this.jwt.refreshAccessToken(refreshToken, user);
    
    if (!tokens) {
      return {
        success: false,
        error: 'Failed to refresh token',
        code: 'REFRESH_FAILED',
      };
    }

    return {
      success: true,
      tokens,
      code: 'TOKEN_REFRESHED',
    };
  }

  /**
   * 授权检查
   */
  async authorize(
    token: string,
    permission: Permission,
    context?: Partial<GuardContext>
  ): Promise<GuardResult> {
    const authResult = await this.authenticate(token);
    
    if (!authResult.success || !authResult.user) {
      return {
        allowed: false,
        reason: authResult.error ?? 'Authentication failed',
      };
    }

    return this.guard.checkPermission(authResult.user, permission, {
      ...context,
      user: authResult.user,
      token: this.jwt.decodeToken(token) as JWTPayload,
    });
  }
}

// ============================================================================
// 辅助函数
// ============================================================================

/**
 * 创建测试用户
 */
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    username: 'testuser',
    email: 'test@example.com',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

/**
 * 创建管理员用户
 */
export function createAdminUser(overrides?: Partial<User>): User {
  return createTestUser({
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    ...overrides,
  });
}

// ============================================================================
// Demo 函数
// ============================================================================

/**
 * 演示认证授权系统的使用
 */
export function demo(): void {
  console.log('='.repeat(60));
  console.log('🔐 Auth Manager Demo');
  console.log('='.repeat(60));

  // 创建认证管理器
  const auth = new AuthManager({
    jwtSecret: 'your-super-secret-key-for-demo-only',
    jwtIssuer: 'demo-app',
    jwtAudience: 'demo-client',
    accessTokenExpiry: 300, // 5 分钟
    refreshTokenExpiry: 3600, // 1 小时
    enableSessionTracking: true,
  });

  // 创建测试用户
  console.log('\n📋 Creating test users...');
  const regularUser = createTestUser({ username: 'alice', role: 'user' });
  const adminUser = createAdminUser({ username: 'bob', id: 'admin-001' });
  const superAdmin = createTestUser({ username: 'charlie', role: 'superadmin' });

  console.log('  Regular User:', regularUser.username, `(${regularUser.role})`);
  console.log('  Admin User:', adminUser.username, `(${adminUser.role})`);
  console.log('  Super Admin:', superAdmin.username, `(${superAdmin.role})`);

  // 用户登录
  console.log('\n🔑 User Login...');
  const loginResult = auth.login(regularUser, {
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
  });
  
  if (!loginResult.tokens) {
    console.log('  ❌ Login failed');
    return;
  }

  console.log('  ✅ Login successful!');
  console.log('  Access Token:', loginResult.tokens.accessToken.substring(0, 50) + '...');
  console.log('  Refresh Token:', loginResult.tokens.refreshToken.substring(0, 50) + '...');
  console.log('  Access Token expires at:', loginResult.tokens.accessTokenExpiresAt.toISOString());

  // 验证 Token
  console.log('\n✅ Token Verification...');
  const accessToken = loginResult.tokens.accessToken;
  const decodedPayload = auth.jwt.decodeToken(accessToken);
  console.log('  Decoded Payload:', JSON.stringify(decodedPayload, null, 2).substring(0, 300) + '...');

  // 验证请求
  console.log('\n🔍 Authenticate Request...');
  const authResult = auth.authenticate(accessToken);
  if (authResult.success) {
    console.log('  ✅ Token is valid');
    console.log('  User:', authResult.user?.username, `(${authResult.user?.role})`);
  }

  // 权限检查
  console.log('\n🛡️ Permission Checks...');
  
  // 用户权限
  console.log('\n  Regular User Permissions:');
  auth.authorize(accessToken, 'read:own').then(result => {
    console.log(`    read:own: ${result.allowed ? '✅' : '❌'}`);
  });
  auth.authorize(accessToken, 'read:any').then(result => {
    console.log(`    read:any: ${result.allowed ? '✅' : '❌'}`);
  });
  auth.authorize(accessToken, 'write:own').then(result => {
    console.log(`    write:own: ${result.allowed ? '✅' : '❌'}`);
  });
  auth.authorize(accessToken, 'manage:users').then(result => {
    console.log(`    manage:users: ${result.allowed ? '✅' : '❌'} (${result.reason})`);
  });

  // 管理员权限
  console.log('\n  Admin User Permissions:');
  const adminLogin = auth.login(adminUser);
  if (adminLogin.tokens) {
    auth.authorize(adminLogin.tokens.accessToken, 'read:any').then(result => {
      console.log(`    read:any: ${result.allowed ? '✅' : '❌'}`);
    });
    auth.authorize(adminLogin.tokens.accessToken, 'manage:users').then(result => {
      console.log(`    manage:users: ${result.allowed ? '✅' : '❌'}`);
    });
    auth.authorize(adminLogin.tokens.accessToken, 'manage:system').then(result => {
      console.log(`    manage:system: ${result.allowed ? '✅' : '❌'} (${result.reason})`);
    });
  }

  // 超级管理员权限
  console.log('\n  Super Admin Permissions:');
  const superLogin = auth.login(superAdmin);
  if (superLogin.tokens) {
    auth.authorize(superLogin.tokens.accessToken, 'manage:system').then(result => {
      console.log(`    manage:system: ${result.allowed ? '✅' : '❌'}`);
    });
  }

  // 所有权检查
  console.log('\n👤 Ownership Check...');
  const ownershipResult = auth.guard.checkOwnership(regularUser, regularUser.id);
  console.log(`  Own resource: ${ownershipResult.allowed ? '✅' : '❌'}`);
  
  const otherOwnershipResult = auth.guard.checkOwnership(regularUser, 'other-user-id');
  console.log(`  Other's resource: ${otherOwnershipResult.allowed ? '✅' : '❌'} (${otherOwnershipResult.reason})`);

  // 会话管理
  console.log('\n📊 Session Management...');
  const sessions = auth.sessions.getUserSessions(regularUser.id);
  console.log(`  Active sessions for ${regularUser.username}:`, sessions.length);

  // 登出
  console.log('\n👋 User Logout...');
  const logoutSuccess = auth.logout(accessToken);
  console.log(`  Logout: ${logoutSuccess ? '✅' : '❌'}`);

  // 验证会话已失效
  const sessionsAfterLogout = auth.sessions.getUserSessions(regularUser.id);
  console.log(`  Active sessions after logout:`, sessionsAfterLogout.length);

  // Token 刷新
  console.log('\n🔄 Token Refresh...');
  const refreshResult = auth.refresh(loginResult.tokens.refreshToken, regularUser);
  if (refreshResult.tokens) {
    console.log('  ✅ Token refreshed successfully!');
    console.log('  New Access Token:', refreshResult.tokens.accessToken.substring(0, 50) + '...');
  }

  // 清理过期会话
  console.log('\n🧹 Cleanup...');
  const cleanedCount = auth.sessions.cleanupExpiredSessions();
  console.log(`  Cleaned up ${cleanedCount} expired sessions`);

  console.log('\n' + '='.repeat(60));
  console.log('✨ Demo completed!');
  console.log('='.repeat(60));
}

// 导出所有公共成员
export {
  // 主要类
  JWTManager,
  SessionManager,
  PermissionGuard,
  AuthManager,
  // 类型
  UserRole,
  Permission,
  User,
  JWTPayload,
  TokenPair,
  Session,
  AuthResult,
  AuthConfig,
  GuardContext,
  GuardFunction,
  GuardResult,
  // 常量
  DEFAULT_ROLE_PERMISSIONS,
};

// 如果是直接运行此文件，执行 demo
if (require.main === module) {
  demo();
}
