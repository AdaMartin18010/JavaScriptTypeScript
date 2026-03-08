/**
 * @file Web 安全 - XSS 防护与 CSP
 * @category Web Security → XSS/CSP
 * @difficulty hard
 * @tags security, xss, csp, csrf, content-security-policy
 * 
 * @description
 * Web 安全实现：
 * - XSS 防护（输入过滤、输出编码）
 * - 内容安全策略 (CSP)
 * - CSRF 防护
 * - 安全头部配置
 * - 安全工具函数
 */

// ============================================================================
// 1. XSS 防护 - 输入过滤
// ============================================================================

export interface SanitizeOptions {
  allowedTags?: string[];
  allowedAttributes?: Record<string, string[]>;
  stripComments?: boolean;
  stripScripts?: boolean;
  allowDataUrls?: boolean;
}

export class XSSSanitizer {
  private defaultOptions: SanitizeOptions = {
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                  'ul', 'ol', 'li', 'a', 'img', 'code', 'pre', 'blockquote'],
    allowedAttributes: {
      '*': ['class', 'id'],
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height']
    },
    stripComments: true,
    stripScripts: true,
    allowDataUrls: false
  };

  private options: SanitizeOptions;

  constructor(options: SanitizeOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  // 清理 HTML
  sanitizeHtml(input: string): string {
    if (!input) return '';

    let sanitized = input;

    // 移除注释
    if (this.options.stripComments) {
      sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, '');
    }

    // 移除 script 标签
    if (this.options.stripScripts) {
      sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      sanitized = sanitized.replace(/<script[^>]*\/>/gi, '');
    }

    // 移除事件处理器
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');

    // 处理危险的 URL 协议
    sanitized = sanitized.replace(/(href|src|action)\s*=\s*["']javascript:[^"']*["']/gi, '$1=""');
    
    if (!this.options.allowDataUrls) {
      sanitized = sanitized.replace(/(href|src|action)\s*=\s*["']data:[^"']*["']/gi, '$1=""');
    }

    // 移除 style 标签中的 expression
    sanitized = sanitized.replace(/expression\s*\([^)]*\)/gi, '');

    return sanitized;
  }

  // 清理纯文本（完全移除 HTML）
  stripHtml(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
  }

  // 验证 URL 协议
  sanitizeUrl(url: string): string | null {
    if (!url) return null;

    const allowedProtocols = this.options.allowDataUrls 
      ? ['http:', 'https:', 'mailto:', 'tel:', 'data:']
      : ['http:', 'https:', 'mailto:', 'tel:'];

    try {
      const parsed = new URL(url, typeof window !== 'undefined' ? window.location.href : 'http://localhost');
      
      if (!allowedProtocols.includes(parsed.protocol)) {
        console.warn('[XSS] Blocked URL with protocol:', parsed.protocol);
        return null;
      }

      // 检查 data URL 的 MIME 类型
      if (parsed.protocol === 'data:') {
        const mimeMatch = url.match(/^data:([^;,]+)/);
        if (mimeMatch) {
          const mime = mimeMatch[1].toLowerCase();
          const allowedMimes = ['image/', 'text/plain'];
          if (!allowedMimes.some(m => mime.startsWith(m))) {
            console.warn('[XSS] Blocked data URL with MIME type:', mime);
            return null;
          }
        }
      }

      return url;
    } catch {
      // 相对 URL
      if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
        return url;
      }
      return null;
    }
  }

  // 清理 CSS
  sanitizeCss(input: string): string {
    if (!input) return '';

    // 移除 expression
    let sanitized = input.replace(/expression\s*\([^)]*\)/gi, '');
    
    // 移除 @import
    sanitized = sanitized.replace(/@import\s+["'][^"']*["']/gi, '');
    
    // 移除 behavior
    sanitized = sanitized.replace(/behavior\s*:\s*[^;}]*/gi, '');
    
    // 移除 -moz-binding
    sanitized = sanitized.replace(/-moz-binding\s*:\s*[^;}]*/gi, '');

    return sanitized;
  }

  // 验证文件类型
  validateFileType(file: File, allowedTypes: string[]): boolean {
    // 检查 MIME 类型
    if (allowedTypes.includes(file.type)) {
      return true;
    }

    // 检查扩展名（作为后备）
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = allowedTypes
      .map(t => t.split('/').pop())
      .filter(Boolean);

    if (ext && allowedExts.includes(ext)) {
      return true;
    }

    console.warn('[XSS] Blocked file type:', file.type, file.name);
    return false;
  }
}

// ============================================================================
// 2. XSS 防护 - 输出编码
// ============================================================================

export class HTMLEncoder {
  // HTML 实体编码
  static encodeHtml(input: string): string {
    if (!input) return '';
    
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return input.replace(/[&<>"'/]/g, char => entityMap[char] || char);
  }

  // 属性编码（更严格的编码）
  static encodeAttribute(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/`/g, '&#x60;')
      .replace(/=/g, '&#x3D;');
  }

  // JavaScript 字符串编码
  static encodeJavaScript(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
  }

  // CSS 字符串编码
  static encodeCss(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\A ')
      .replace(/</g, '\\3c ')
      .replace(/>/g, '\\3e ');
  }

  // URL 编码
  static encodeUrl(input: string): string {
    return encodeURIComponent(input);
  }

  // JSON 安全编码
  static safeJsonStringify(obj: unknown): string {
    return JSON.stringify(obj)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');
  }
}

// ============================================================================
// 3. 内容安全策略 (CSP)
// ============================================================================

export type CSPDirective = 
  | 'default-src' | 'script-src' | 'style-src' | 'img-src' | 'connect-src'
  | 'font-src' | 'object-src' | 'media-src' | 'frame-src' | 'frame-ancestors'
  | 'form-action' | 'base-uri' | 'manifest-src' | 'worker-src'
  | 'upgrade-insecure-requests' | 'block-all-mixed-content'
  | 'require-trusted-types-for' | 'trusted-types';

export interface CSPPolicy {
  directives: Partial<Record<CSPDirective, string[]>>;
  reportOnly?: boolean;
  reportUri?: string;
}

export class CSPBuilder {
  private policy: CSPPolicy;

  constructor() {
    this.policy = {
      directives: {}
    };
  }

  // 设置严格的安全策略
  setStrictPolicy(): this {
    this.policy.directives = {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'font-src': ["'self'"],
      'object-src': ["'none'"],
      'media-src': ["'self'"],
      'frame-src': ["'none'"],
      'frame-ancestors': ["'none'"],
      'form-action': ["'self'"],
      'base-uri': ["'self'"],
      'upgrade-insecure-requests': []
    };
    return this;
  }

  // 设置宽松的安全策略（用于开发）
  setPermissivePolicy(): this {
    this.policy.directives = {
      'default-src': ["'self'", '*'],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
      'style-src': ["'self'", "'unsafe-inline'", '*'],
      'img-src': ['*', 'data:', 'blob:'],
      'connect-src': ['*']
    };
    return this;
  }

  // 添加指令
  addDirective(directive: CSPDirective, ...values: string[]): this {
    if (!this.policy.directives[directive]) {
      this.policy.directives[directive] = [];
    }
    this.policy.directives[directive]!.push(...values);
    return this;
  }

  // 移除指令
  removeDirective(directive: CSPDirective): this {
    delete this.policy.directives[directive];
    return this;
  }

  // 设置报告模式
  setReportOnly(reportOnly: boolean): this {
    this.policy.reportOnly = reportOnly;
    return this;
  }

  // 设置报告 URI
  setReportUri(uri: string): this {
    this.policy.reportUri = uri;
    return this;
  }

  // 添加 nonce 到 script-src
  addScriptNonce(nonce: string): this {
    return this.addDirective('script-src', `'nonce-${nonce}'`);
  }

  // 添加 hash 到 script-src
  addScriptHash(hash: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'): this {
    return this.addDirective('script-src', `'${algorithm}-${hash}'`);
  }

  // 构建 CSP 字符串
  build(): string {
    const parts: string[] = [];

    for (const [directive, values] of Object.entries(this.policy.directives)) {
      if (values && values.length > 0) {
        parts.push(`${directive} ${values.join(' ')}`);
      } else {
        parts.push(directive);
      }
    }

    if (this.policy.reportUri) {
      parts.push(`report-uri ${this.policy.reportUri}`);
    }

    return parts.join('; ');
  }

  // 生成 HTTP 头
  generateHeaders(): Record<string, string> {
    const headerName = this.policy.reportOnly 
      ? 'Content-Security-Policy-Report-Only'
      : 'Content-Security-Policy';

    return {
      [headerName]: this.build()
    };
  }

  // 生成 meta 标签
  generateMetaTag(): string {
    if (this.policy.reportUri) {
      console.warn('CSP meta tag cannot include report-uri directive');
    }
    
    const policy = this.build().replace(/report-uri[^;]*;?/g, '').trim();
    return `<meta http-equiv="Content-Security-Policy" content="${HTMLEncoder.encodeAttribute(policy)}">`;
  }

  // 验证 CSP 配置
  validate(): string[] {
    const issues: string[] = [];
    const directives = this.policy.directives;

    // 检查 unsafe-inline 和 nonce/hash 的冲突
    const scriptSrc = directives['script-src'] || [];
    if (scriptSrc.includes("'unsafe-inline'") && 
        scriptSrc.some(v => v.startsWith("'nonce-") || v.startsWith("'sha256-") || v.startsWith("'sha384-") || v.startsWith("'sha512-"))) {
      issues.push('Using unsafe-inline with nonces or hashes in script-src is not recommended');
    }

    // 检查是否允许 eval
    if (scriptSrc.includes("'unsafe-eval'")) {
      issues.push('Using unsafe-eval allows code injection attacks');
    }

    // 检查 object-src
    if (!directives['object-src'] || directives['object-src'].includes("'self'")) {
      issues.push('Consider setting object-src to none to prevent plugin-based attacks');
    }

    return issues;
  }
}

// ============================================================================
// 4. CSRF 防护
// ============================================================================

export class CSRFProtection {
  private tokenStorage: Map<string, string> = new Map();
  private tokenLength = 32;

  // 生成 CSRF Token
  generateToken(sessionId: string): string {
    const token = this.randomString(this.tokenLength);
    this.tokenStorage.set(sessionId, token);
    return token;
  }

  // 验证 CSRF Token
  validateToken(sessionId: string, token: string): boolean {
    const storedToken = this.tokenStorage.get(sessionId);
    
    if (!storedToken) {
      console.warn('[CSRF] No token found for session');
      return false;
    }

    // 使用恒定时间比较防止时序攻击
    const isValid = this.timingSafeEqual(storedToken, token);
    
    if (!isValid) {
      console.warn('[CSRF] Token mismatch');
    }
    
    return isValid;
  }

  // 删除 Token
  removeToken(sessionId: string): void {
    this.tokenStorage.delete(sessionId);
  }

  // 生成双提交 Cookie Token
  generateDoubleSubmitCookie(): { token: string; cookie: string } {
    const token = this.randomString(this.tokenLength);
    
    // Cookie 应该是 httpOnly 和 secure 的
    const cookie = `csrf_token=${token}; Path=/; SameSite=Strict; Secure; HttpOnly`;
    
    return { token, cookie };
  }

  // 验证双提交 Cookie
  validateDoubleSubmitCookie(cookieToken: string, headerToken: string): boolean {
    return this.timingSafeEqual(cookieToken, headerToken);
  }

  // 添加 CSRF Token 到表单
  addTokenToForm(form: HTMLFormElement, token: string): void {
    let input = form.querySelector('input[name="csrf_token"]') as HTMLInputElement;
    
    if (!input) {
      input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'csrf_token';
      form.appendChild(input);
    }
    
    input.value = token;
  }

  // 添加 CSRF Token 到 Fetch 请求
  addTokenToFetchOptions(options: RequestInit, token: string): RequestInit {
    return {
      ...options,
      headers: {
        ...options.headers,
        'X-CSRF-Token': token
      }
    };
  }

  private randomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const randomValues = new Uint32Array(length);
      crypto.getRandomValues(randomValues);
      
      for (let i = 0; i < length; i++) {
        result += chars[randomValues[i] % chars.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
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
// 5. 安全头部配置
// ============================================================================

export interface SecurityHeaders {
  'Strict-Transport-Security'?: string;
  'X-Frame-Options'?: 'DENY' | 'SAMEORIGIN' | string;
  'X-Content-Type-Options'?: 'nosniff';
  'Referrer-Policy'?: string;
  'Permissions-Policy'?: string;
  'X-XSS-Protection'?: string;
  'Cross-Origin-Embedder-Policy'?: 'require-corp' | 'credentialless' | 'unsafe-none';
  'Cross-Origin-Opener-Policy'?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
  'Cross-Origin-Resource-Policy'?: 'same-origin' | 'same-site' | 'cross-origin';
}

export class SecurityHeadersBuilder {
  private headers: SecurityHeaders = {};

  // 启用 HSTS (HTTPS 强制)
  enableHSTS(maxAge = 31536000, includeSubDomains = true, preload = false): this {
    let value = `max-age=${maxAge}`;
    if (includeSubDomains) value += '; includeSubDomains';
    if (preload) value += '; preload';
    
    this.headers['Strict-Transport-Security'] = value;
    return this;
  }

  // 防止点击劫持
  preventClickjacking(option: 'DENY' | 'SAMEORIGIN' | string = 'DENY'): this {
    this.headers['X-Frame-Options'] = option;
    return this;
  }

  // 防止 MIME 类型嗅探
  preventMimeSniffing(): this {
    this.headers['X-Content-Type-Options'] = 'nosniff';
    return this;
  }

  // 设置 Referrer 策略
  setReferrerPolicy(policy: string = 'strict-origin-when-cross-origin'): this {
    this.headers['Referrer-Policy'] = policy;
    return this;
  }

  // 设置权限策略 (之前的 Feature Policy)
  setPermissionsPolicy(directives: Record<string, string[]>): this {
    const policy = Object.entries(directives)
      .map(([feature, allowlist]) => `${feature}=(${allowlist.join(' ')})`)
      .join(', ');
    
    this.headers['Permissions-Policy'] = policy;
    return this;
  }

  // 启用 XSS 过滤器（仅旧浏览器）
  enableXSSFilter(mode: '0' | '1' | '1; mode=block' = '1; mode=block'): this {
    this.headers['X-XSS-Protection'] = mode;
    return this;
  }

  // 设置 COEP (Cross-Origin Embedder Policy)
  setCOEP(policy: 'require-corp' | 'credentialless' | 'unsafe-none' = 'require-corp'): this {
    this.headers['Cross-Origin-Embedder-Policy'] = policy;
    return this;
  }

  // 设置 COOP (Cross-Origin Opener Policy)
  setCOOP(policy: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none' = 'same-origin'): this {
    this.headers['Cross-Origin-Opener-Policy'] = policy;
    return this;
  }

  // 设置 CORP (Cross-Origin Resource Policy)
  setCORP(policy: 'same-origin' | 'same-site' | 'cross-origin' = 'same-origin'): this {
    this.headers['Cross-Origin-Resource-Policy'] = policy;
    return this;
  }

  // 设置推荐的安全头部
  setRecommendedHeaders(): this {
    return this
      .enableHSTS()
      .preventClickjacking()
      .preventMimeSniffing()
      .setReferrerPolicy()
      .enableXSSFilter()
      .setCOEP()
      .setCOOP()
      .setCORP()
      .setPermissionsPolicy({
        'camera': ['self'],
        'microphone': ['self'],
        'geolocation': ['self'],
        'payment': ['none']
      });
  }

  // 构建头部对象
  build(): SecurityHeaders {
    return { ...this.headers };
  }

  // 生成 nginx 配置
  generateNginxConfig(): string {
    return Object.entries(this.headers)
      .map(([name, value]) => `add_header ${name} "${value}";`)
      .join('\n');
  }

  // 生成 Express 中间件
  generateExpressMiddleware(): string {
    return `
app.use((req, res, next) => {
${Object.entries(this.headers)
  .map(([name, value]) => `  res.setHeader('${name}', '${value}');`)
  .join('\n')}
  next();
});
    `.trim();
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== Web 安全 - XSS 防护与 CSP ===\n');

  console.log('1. XSS 输入过滤');
  const sanitizer = new XSSSanitizer();
  
  const maliciousInput = '<script>alert("xss")</script><p>Safe content</p>';
  const sanitized = sanitizer.sanitizeHtml(maliciousInput);
  console.log('   Input:', maliciousInput.slice(0, 50) + '...');
  console.log('   Sanitized:', sanitized);

  // URL 验证
  const badUrl = 'javascript:alert("xss")';
  const goodUrl = sanitizer.sanitizeUrl(badUrl);
  console.log('   Bad URL sanitized:', goodUrl);

  console.log('\n2. 输出编码');
  const userInput = '<script>alert("xss")</script>';
  
  console.log('   HTML encoding:', HTMLEncoder.encodeHtml(userInput));
  console.log('   JS encoding:', HTMLEncoder.encodeJavaScript(userInput));
  console.log('   CSS encoding:', HTMLEncoder.encodeCss(userInput));

  const data = { user: '<script>alert(1)</script>', id: 123 };
  console.log('   Safe JSON:', HTMLEncoder.safeJsonStringify(data));

  console.log('\n3. 内容安全策略 (CSP)');
  const cspBuilder = new CSPBuilder()
    .setStrictPolicy()
    .addScriptNonce('abc123')
    .addDirective('img-src', 'https://cdn.example.com');

  const csp = cspBuilder.build();
  console.log('   CSP:', csp.substring(0, 100) + '...');

  const validation = cspBuilder.validate();
  console.log('   Validation issues:', validation.length > 0 ? validation : 'None');

  const headers = cspBuilder.generateHeaders();
  console.log('   Headers:', Object.keys(headers));

  console.log('\n4. CSRF 防护');
  const csrf = new CSRFProtection();
  
  const sessionId = 'user-session-123';
  const token = csrf.generateToken(sessionId);
  console.log('   Generated token:', token.substring(0, 16) + '...');
  
  const isValid = csrf.validateToken(sessionId, token);
  console.log('   Token valid:', isValid);
  
  const isInvalid = csrf.validateToken(sessionId, 'wrong-token');
  console.log('   Wrong token valid:', isInvalid);

  const doubleSubmit = csrf.generateDoubleSubmitCookie();
  console.log('   Double-submit cookie set');

  console.log('\n5. 安全头部');
  const headersBuilder = new SecurityHeadersBuilder()
    .setRecommendedHeaders();

  const securityHeaders = headersBuilder.build();
  console.log('   Security headers:');
  Object.entries(securityHeaders).forEach(([name, value]) => {
    console.log(`     ${name}: ${value}`);
  });

  console.log('\nWeb 安全要点:');
  console.log('- 输入过滤: 清理所有用户输入，移除危险标签和属性');
  console.log('- 输出编码: 根据上下文进行适当的编码（HTML、JS、CSS）');
  console.log('- CSP: 限制资源加载来源，防止 XSS 攻击');
  console.log('- CSRF Token: 验证请求来源，防止跨站请求伪造');
  console.log('- HttpOnly Cookie: 防止 JavaScript 访问敏感 Cookie');
  console.log('- SameSite Cookie: 防止跨站 Cookie 发送');
  console.log('- HSTS: 强制使用 HTTPS 连接');
  console.log('- 安全头部: 配置适当的响应头部增强安全性');
}

// ============================================================================
// 导出（已在文件中使用 export class 导出）
// ============================================================================
