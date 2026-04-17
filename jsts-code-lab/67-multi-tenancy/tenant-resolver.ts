/**
 * @file 基于 JWT 的租户解析器
 * @category Multi-Tenancy → Resolver
 * @difficulty medium
 * @tags multi-tenancy, jwt, authentication, tenant-resolution
 *
 * @description
 * 从 HTTP 请求中解析 JWT Token 并提取租户信息的解析器。
 * 支持从 Header、Query 参数和 Cookie 中解析 Token。
 */

/** JWT Payload 结构 */
export interface JwtPayload {
  /** 主题（用户 ID） */
  sub: string;
  /** 租户标识 */
  tenantId: string;
  /** 用户角色 */
  role: string;
  /** 权限列表 */
  permissions: string[];
  /** 过期时间（秒级时间戳） */
  exp: number;
  /** 签发时间（秒级时间戳） */
  iat: number;
}

/** 解析配置选项 */
export interface ResolveOptions {
  /** 请求头名称 */
  headerName?: string;
  /** Query 参数名称 */
  queryParamName?: string;
  /** Cookie 名称 */
  cookieName?: string;
}

/** 基于 JWT 的租户解析器 */
export class JwtTenantResolver {
  private readonly secret: string;

  /**
   * @param secret - JWT 签名密钥
   */
  constructor(secret: string) {
    if (!secret || secret.length < 8) {
      throw new Error('Secret must be at least 8 characters long');
    }
    this.secret = secret;
  }

  /**
   * 从 Authorization Header 中解析 JWT
   * @param authHeader - Authorization 请求头值
   * @returns 解析后的 JWT Payload
   * @throws 当格式无效或 Token 过期时抛出错误
   */
  resolveFromHeader(authHeader: string): JwtPayload {
    const token = this.extractBearerToken(authHeader);
    return this.decodeToken(token);
  }

  /**
   * 从多种来源解析租户信息
   * @param headers - HTTP 请求头
   * @param query - Query 参数
   * @param cookies - Cookie 对象
   * @returns 解析后的 JWT Payload
   * @throws 当未找到有效 Token 时抛出错误
   */
  resolve(
    headers: Record<string, string | string[] | undefined>,
    query: Record<string, string | undefined>,
    cookies?: Record<string, string>
  ): JwtPayload {
    const authHeader = headers['authorization'];
    if (typeof authHeader === 'string') {
      return this.resolveFromHeader(authHeader);
    }

    const token = query['tenantToken'];
    if (token) {
      return this.decodeToken(token);
    }

    if (cookies?.tenantToken) {
      return this.decodeToken(cookies.tenantToken);
    }

    throw new TenantResolutionError('Tenant token not found in request');
  }

  /**
   * 生成模拟 JWT token（用于测试）
   * @param payload - JWT 载荷内容
   * @returns 编码后的 JWT 字符串
   */
  generateToken(payload: Omit<JwtPayload, 'iat'>): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(
      JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })
    ).toString('base64url');
    const signature = this.sign(`${header}.${body}`);
    return `${header}.${body}.${signature}`;
  }

  private extractBearerToken(header: string): string {
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (!match) {
      throw new TenantResolutionError('Invalid Authorization header format, expected "Bearer <token>"');
    }
    return match[1];
  }

  private decodeToken(token: string): JwtPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new TenantResolutionError('Invalid JWT token format');
    }

    try {
      const payload = JSON.parse(
        Buffer.from(parts[1], 'base64url').toString('utf-8')
      ) as JwtPayload;

      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new TenantResolutionError('Token expired');
      }

      if (!payload.tenantId) {
        throw new TenantResolutionError('Missing tenantId in token payload');
      }

      return payload;
    } catch (error) {
      if (error instanceof TenantResolutionError) throw error;
      throw new TenantResolutionError('Failed to decode token');
    }
  }

  private sign(data: string): string {
    // Simplified HMAC signature for demonstration
    return Buffer.from(`${this.secret}.${data}`).toString('base64url').slice(0, 43);
  }
}

/** 租户解析错误 */
export class TenantResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantResolutionError';
  }
}
