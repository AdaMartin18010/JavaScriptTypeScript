/**
 * @file CORS 和 CSRF 防护
 * @category API Security → CORS/CSRF
 * @difficulty medium
 * @tags cors, csrf, security, xsrf, origin-policy
 * 
 * @description
 * 跨域和 CSRF 防护实现：
 * - CORS 策略配置
 * - CSRF Token 生成与验证
 * - SameSite Cookie
 * - 预检请求处理
 */

// ============================================================================
// 1. CORS 配置
// ============================================================================

export interface CORSConfig {
  allowedOrigins: string[] | '*';
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
}

export const DefaultCORSConfig: CORSConfig = {
  allowedOrigins: '*',
  allowedMethods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id', 'X-Rate-Limit'],
  credentials: false,
  maxAge: 86400, // 24小时
  preflightContinue: false,
  optionsSuccessStatus: 204
};

export interface CORSRequest {
  method: string;
  headers: {
    origin?: string;
    'access-control-request-method'?: string;
    'access-control-request-headers'?: string;
  };
}

export interface CORSResponse {
  headers: {
    'access-control-allow-origin'?: string;
    'access-control-allow-methods'?: string;
    'access-control-allow-headers'?: string;
    'access-control-expose-headers'?: string;
    'access-control-allow-credentials'?: string;
    'access-control-max-age'?: string;
    'access-control-allow-private-network'?: string;
    vary?: string;
  };
  statusCode?: number;
}

// ============================================================================
// 2. CORS 处理器
// ============================================================================

export class CORSHandler {
  private config: CORSConfig;

  constructor(config: Partial<CORSConfig> = {}) {
    this.config = { ...DefaultCORSConfig, ...config };
  }

  // 处理 CORS 请求
  handle(request: CORSRequest, response: CORSResponse): CORSResponse {
    const origin = request.headers.origin;
    
    // 检查 Origin
    if (!this.isOriginAllowed(origin)) {
      return response;
    }

    // 设置允许的来源
    if (this.config.allowedOrigins === '*') {
      response.headers['access-control-allow-origin'] = '*';
    } else if (origin) {
      response.headers['access-control-allow-origin'] = origin;
      response.headers['vary'] = 'Origin';
    }

    // 设置凭证
    if (this.config.credentials) {
      response.headers['access-control-allow-credentials'] = 'true';
      // 使用具体来源而非 * 当允许凭证时
      if (origin && this.config.allowedOrigins !== '*') {
        response.headers['access-control-allow-origin'] = origin;
        response.headers['vary'] = 'Origin';
      }
    }

    // 预检请求处理
    if (request.method === 'OPTIONS') {
      return this.handlePreflight(request, response);
    }

    // 简单请求：暴露响应头
    if (this.config.exposedHeaders.length > 0) {
      response.headers['access-control-expose-headers'] = this.config.exposedHeaders.join(',');
    }

    return response;
  }

  // 处理预检请求
  private handlePreflight(request: CORSRequest, response: CORSResponse): CORSResponse {
    const requestedMethod = request.headers['access-control-request-method'];
    const requestedHeaders = request.headers['access-control-request-headers'];

    // 检查请求方法
    if (requestedMethod && !this.isMethodAllowed(requestedMethod)) {
      response.statusCode = 405;
      return response;
    }

    // 设置允许的方法
    response.headers['access-control-allow-methods'] = this.config.allowedMethods.join(',');

    // 检查并设置允许的请求头
    if (requestedHeaders) {
      const headers = requestedHeaders.split(',').map(h => h.trim().toLowerCase());
      const allowedHeaders = headers.filter(h => this.isHeaderAllowed(h));
      
      if (headers.length !== allowedHeaders.length) {
        response.statusCode = 403;
        return response;
      }
      
      response.headers['access-control-allow-headers'] = requestedHeaders;
    } else {
      response.headers['access-control-allow-headers'] = this.config.allowedHeaders.join(',');
    }

    // 缓存时间
    response.headers['access-control-max-age'] = this.config.maxAge.toString();
    
    response.statusCode = this.config.optionsSuccessStatus;
    return response;
  }

  // 检查 Origin 是否允许
  private isOriginAllowed(origin: string | undefined): boolean {
    if (!origin) return true; // 非跨域请求
    if (this.config.allowedOrigins === '*') return true;
    
    return this.config.allowedOrigins.some(allowed => {
      if (allowed.includes('*')) {
        // 通配符匹配: https://*.example.com
        const regex = new RegExp(allowed.replace(/\./g, '\\.').replace(/\*/g, '.*'));
        return regex.test(origin);
      }
      return allowed === origin;
    });
  }

  // 检查方法是否允许
  private isMethodAllowed(method: string): boolean {
    return this.config.allowedMethods.includes(method.toUpperCase());
  }

  // 检查请求头是否允许
  private isHeaderAllowed(header: string): boolean {
    const normalizedHeader = header.toLowerCase();
    return this.config.allowedHeaders.some(h => 
      h.toLowerCase() === normalizedHeader
    ) || normalizedHeader.startsWith('x-'); // 允许自定义请求头
  }
}

// ============================================================================
// 3. CSRF 防护
// ============================================================================

export interface CSRFConfig {
  cookieName: string;
  headerName: string;
  tokenLength: number;
  maxAge: number;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  domain?: string;
  path: string;
}

export const DefaultCSRFConfig: CSRFConfig = {
  cookieName: 'csrf-token',
  headerName: 'X-CSRF-Token',
  tokenLength: 32,
  maxAge: 3600, // 1小时
  secure: true,
  sameSite: 'strict',
  path: '/'
};

export class CSRFProtection {
  private config: CSRFConfig;
  private tokens: Map<string, { token: string; expires: number }> = new Map();

  constructor(config: Partial<CSRFConfig> = {}) {
    this.config = { ...DefaultCSRFConfig, ...config };
  }

  // 生成 CSRF Token
  generateToken(sessionId: string): string {
    const token = this.randomToken(this.config.tokenLength);
    const expires = Date.now() + this.config.maxAge * 1000;
    
    this.tokens.set(sessionId, { token, expires });
    
    return token;
  }

  // 验证 CSRF Token
  validateToken(sessionId: string, submittedToken: string): boolean {
    const stored = this.tokens.get(sessionId);
    
    if (!stored) {
      return false;
    }

    // 检查过期
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      return false;
    }

    // 常量时间比较防止时序攻击
    return this.timingSafeCompare(stored.token, submittedToken);
  }

  // 移除 Token
  removeToken(sessionId: string): void {
    this.tokens.delete(sessionId);
  }

  // 清理过期 Token
  cleanup(): void {
    const now = Date.now();
    for (const [sessionId, data] of this.tokens.entries()) {
      if (now > data.expires) {
        this.tokens.delete(sessionId);
      }
    }
  }

  // 生成 Cookie 设置
  generateCookie(token: string): string {
    const parts = [
      `${this.config.cookieName}=${token}`,
      `Path=${this.config.path}`,
      `Max-Age=${this.config.maxAge}`,
      `SameSite=${this.config.sameSite}`
    ];

    if (this.config.secure) {
      parts.push('Secure');
    }

    if (this.config.domain) {
      parts.push(`Domain=${this.config.domain}`);
    }

    return parts.join('; ');
  }

  // 检查请求是否需要 CSRF 验证
  shouldValidate(method: string): boolean {
    // 只验证会改变状态的请求
    const safeMethods = ['GET', 'HEAD', 'OPTIONS', 'TRACE'];
    return !safeMethods.includes(method.toUpperCase());
  }

  // 中间件形式
  middleware(request: {
    method: string;
    headers: Record<string, string>;
    sessionId?: string;
  }): { valid: boolean; error?: string } {
    if (!this.shouldValidate(request.method)) {
      return { valid: true };
    }

    if (!request.sessionId) {
      return { valid: false, error: 'No session found' };
    }

    const submittedToken = request.headers[this.config.headerName.toLowerCase()];
    if (!submittedToken) {
      return { valid: false, error: 'CSRF token missing' };
    }

    if (!this.validateToken(request.sessionId, submittedToken)) {
      return { valid: false, error: 'Invalid CSRF token' };
    }

    return { valid: true };
  }

  private randomToken(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private timingSafeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}

// ============================================================================
// 4. 双重提交 Cookie 模式
// ============================================================================

export class DoubleSubmitCookie {
  private csrf: CSRFProtection;

  constructor(config?: Partial<CSRFConfig>) {
    this.csrf = new CSRFProtection(config);
  }

  // 生成 Token（返回 Cookie 值和表单值）
  generate(sessionId: string): { cookie: string; formValue: string } {
    const token = this.csrf.generateToken(sessionId);
    const cookie = this.csrf.generateCookie(token);
    
    return { cookie, formValue: token };
  }

  // 验证双重提交
  validate(sessionId: string, cookieToken: string, submittedToken: string): boolean {
    // Cookie 中的 token 必须与提交的一致
    if (!this.csrf['timingSafeCompare'](cookieToken, submittedToken)) {
      return false;
    }
    
    // 同时验证 token 有效性
    return this.csrf.validateToken(sessionId, submittedToken);
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== CORS 和 CSRF 防护 ===\n');

  console.log('1. CORS 配置');
  const cors = new CORSHandler({
    allowedOrigins: ['https://example.com', 'https://*.example.com'],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 3600
  });

  // 模拟简单请求
  const simpleRequest: CORSRequest = {
    method: 'GET',
    headers: { origin: 'https://app.example.com' }
  };
  const simpleResponse: CORSResponse = { headers: {} };
  cors.handle(simpleRequest, simpleResponse);
  console.log('   Simple request headers:', simpleResponse.headers);

  // 模拟预检请求
  const preflightRequest: CORSRequest = {
    method: 'OPTIONS',
    headers: {
      origin: 'https://app.example.com',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'Content-Type,Authorization'
    }
  };
  const preflightResponse: CORSResponse = { headers: {} };
  cors.handle(preflightRequest, preflightResponse);
  console.log('   Preflight response:', preflightResponse);

  console.log('\n2. CSRF 防护');
  const csrf = new CSRFProtection({
    cookieName: 'XSRF-TOKEN',
    headerName: 'X-XSRF-TOKEN'
  });

  // 生成 token
  const sessionId = 'user-session-123';
  const token = csrf.generateToken(sessionId);
  console.log('   Generated token:', token.substring(0, 16) + '...');

  // 验证有效 token
  const valid = csrf.validateToken(sessionId, token);
  console.log('   Valid token:', valid);

  // 验证无效 token
  const invalid = csrf.validateToken(sessionId, 'invalid-token');
  console.log('   Invalid token:', invalid);

  // 中间件验证
  const middlewareResult = csrf.middleware({
    method: 'POST',
    headers: { 'x-csrf-token': token },
    sessionId
  });
  console.log('   Middleware check:', middlewareResult);

  console.log('\n3. 双重提交 Cookie');
  const doubleSubmit = new DoubleSubmitCookie();
  const { cookie, formValue } = doubleSubmit.generate(sessionId);
  console.log('   Set-Cookie:', cookie.substring(0, 50) + '...');
  console.log('   Form value:', formValue.substring(0, 16) + '...');

  const doubleValid = doubleSubmit.validate(sessionId, formValue, formValue);
  console.log('   Double submit valid:', doubleValid);

  console.log('\n安全要点:');
  console.log('- CORS: 严格限制允许的来源，慎用 *');
  console.log('- CSRF: 所有状态改变请求必须验证');
  console.log('- SameSite Cookie: 现代浏览器首选');
  console.log('- 双重提交: 无需服务端存储 token');
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
