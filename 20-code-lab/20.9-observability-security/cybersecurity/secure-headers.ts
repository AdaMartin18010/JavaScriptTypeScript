/**
 * @file 安全 HTTP 头部
 * @category Cybersecurity → Secure Headers
 * @difficulty hard
 * @tags security, headers, csp, hsts, x-frame-options, xss-protection
 * @description
 * HTTP 安全头部配置和中间件：
 * - Content Security Policy (CSP)
 * - Strict-Transport-Security (HSTS)
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 * - Cross-Origin 策略
 */

// ============================================================================
// 类型定义
// ============================================================================

export type CSPDirective = 
  | 'default-src' | 'script-src' | 'style-src' | 'img-src' | 'font-src'
  | 'connect-src' | 'media-src' | 'object-src' | 'frame-src' | 'frame-ancestors'
  | 'form-action' | 'base-uri' | 'manifest-src' | 'worker-src' | 'upgrade-insecure-requests'
  | 'block-all-mixed-content' | 'report-uri' | 'report-to';

export type CSPSource = 
  | "'self'" | "'unsafe-inline'" | "'unsafe-eval'" | "'none'" | "'strict-dynamic'" 
  | "'unsafe-hashes'" | "'wasm-unsafe-eval'" | string;  // host, scheme, nonce, hash

export type ReferrerPolicy = 
  | 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' 
  | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' 
  | 'strict-origin-when-cross-origin' | 'unsafe-url';

export type XFrameOption = 'DENY' | 'SAMEORIGIN' | 'ALLOW-FROM';

export interface CSPConfig {
  directives: Partial<Record<CSPDirective, CSPSource[]>>;
  reportOnly?: boolean;
  reportUri?: string;
}

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: CSPConfig;
  strictTransportSecurity?: {
    maxAge: number;        // seconds
    includeSubDomains?: boolean;
    preload?: boolean;
  };
  xFrameOptions?: XFrameOption | { option: XFrameOption; uri?: string };
  xContentTypeOptions?: boolean;
  xXSSProtection?: boolean | { enabled: boolean; mode?: 'block'; report?: string };
  referrerPolicy?: ReferrerPolicy | ReferrerPolicy[];
  permissionsPolicy?: Record<string, string | string[]>;
  crossOriginEmbedderPolicy?: 'require-corp' | 'credentialless' | 'unsafe-none';
  crossOriginOpenerPolicy?: 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
  crossOriginResourcePolicy?: 'same-origin' | 'same-site' | 'cross-origin';
  cacheControl?: string;
}

export interface SecurityReport {
  score: number;           // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  headers: Record<string, { present: boolean; value?: string; recommendation?: string }>;
  vulnerabilities: string[];
  recommendations: string[];
}

// ============================================================================
// Content Security Policy 构建器
// ============================================================================

export class CSPBuilder {
  private directives = new Map<CSPDirective, Set<CSPSource>>();
  private reportOnly = false;
  private reportUri?: string;

  static create(): CSPBuilder {
    return new CSPBuilder();
  }

  static default(): CSPBuilder {
    return new CSPBuilder()
      .addDirective('default-src', ["'self'"])
      .addDirective('script-src', ["'self'"])
      .addDirective('style-src', ["'self'", "'unsafe-inline'"])
      .addDirective('img-src', ["'self'", 'data:', 'https:'])
      .addDirective('font-src', ["'self'"])
      .addDirective('connect-src', ["'self'"])
      .addDirective('media-src', ["'self'"])
      .addDirective('object-src', ["'none'"])
      .addDirective('frame-ancestors', ["'none'"]);
  }

  static strict(): CSPBuilder {
    return new CSPBuilder()
      .addDirective('default-src', ["'none'"])
      .addDirective('script-src', ["'self'"])
      .addDirective('style-src', ["'self'"])
      .addDirective('img-src', ["'self'"])
      .addDirective('font-src', ["'self'"])
      .addDirective('connect-src', ["'self'"])
      .addDirective('base-uri', ["'self'"])
      .addDirective('form-action', ["'self'"])
      .addDirective('frame-ancestors', ["'none'"])
      .addDirective('upgrade-insecure-requests', []);
  }

  addDirective(directive: CSPDirective, sources: CSPSource[]): this {
    if (!this.directives.has(directive)) {
      this.directives.set(directive, new Set());
    }
    sources.forEach(s => this.directives.get(directive)!.add(s));
    return this;
  }

  removeDirective(directive: CSPDirective): this {
    this.directives.delete(directive);
    return this;
  }

  addNonce(directive: 'script-src' | 'style-src', nonce: string): this {
    return this.addDirective(directive, [`'nonce-${nonce}'`]);
  }

  addHash(directive: 'script-src' | 'style-src', hash: string, algorithm: 'sha256' | 'sha384' | 'sha512' = 'sha256'): this {
    return this.addDirective(directive, [`'${algorithm}-${hash}'`]);
  }

  setReportOnly(value: boolean): this {
    this.reportOnly = value;
    return this;
  }

  setReportUri(uri: string): this {
    this.reportUri = uri;
    return this;
  }

  build(): CSPConfig {
    const directives: Partial<Record<CSPDirective, CSPSource[]>> = {};
    
    for (const [directive, sources] of this.directives) {
      directives[directive] = Array.from(sources);
    }

    if (this.reportUri) {
      directives['report-uri'] = [this.reportUri];
    }

    return {
      directives,
      reportOnly: this.reportOnly,
      reportUri: this.reportUri
    };
  }

  buildHeaderValue(): string {
    const parts: string[] = [];
    
    for (const [directive, sources] of this.directives) {
      if (sources.size === 0) {
        parts.push(directive);
      } else {
        parts.push(`${directive} ${Array.from(sources).join(' ')}`);
      }
    }

    if (this.reportUri) {
      parts.push(`report-uri ${this.reportUri}`);
    }

    return parts.join('; ');
  }
}

// ============================================================================
// 安全头部管理器
// ============================================================================

export class SecureHeaders {
  private config: SecurityHeadersConfig;

  constructor(config: SecurityHeadersConfig = {}) {
    this.config = {
      contentSecurityPolicy: CSPBuilder.default().build(),
      strictTransportSecurity: {
        maxAge: 31536000,  // 1 year
        includeSubDomains: true,
        preload: true
      },
      xFrameOptions: 'DENY',
      xContentTypeOptions: true,
      xXSSProtection: { enabled: true, mode: 'block' },
      referrerPolicy: 'strict-origin-when-cross-origin',
      permissionsPolicy: {
        'accelerometer': [],
        'camera': [],
        'geolocation': [],
        'gyroscope': [],
        'magnetometer': [],
        'microphone': [],
        'payment': [],
        'usb': []
      },
      crossOriginEmbedderPolicy: 'require-corp',
      crossOriginOpenerPolicy: 'same-origin',
      crossOriginResourcePolicy: 'same-origin',
      ...config
    };
  }

  /**
   * 生成所有安全头部
   */
  generateHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Content-Security-Policy
    if (this.config.contentSecurityPolicy) {
      const csp = this.config.contentSecurityPolicy;
      const headerName = csp.reportOnly 
        ? 'Content-Security-Policy-Report-Only' 
        : 'Content-Security-Policy';
      
      const cspBuilder = CSPBuilder.create();
      Object.entries(csp.directives).forEach(([directive, sources]) => {
        if (sources) {
          cspBuilder.addDirective(directive as CSPDirective, sources);
        }
      });
      if (csp.reportUri) {
        cspBuilder.setReportUri(csp.reportUri);
      }
      
      headers[headerName] = cspBuilder.buildHeaderValue();
    }

    // Strict-Transport-Security
    if (this.config.strictTransportSecurity) {
      const hsts = this.config.strictTransportSecurity;
      let value = `max-age=${hsts.maxAge}`;
      if (hsts.includeSubDomains) value += '; includeSubDomains';
      if (hsts.preload) value += '; preload';
      headers['Strict-Transport-Security'] = value;
    }

    // X-Frame-Options
    if (this.config.xFrameOptions) {
      if (typeof this.config.xFrameOptions === 'string') {
        headers['X-Frame-Options'] = this.config.xFrameOptions;
      } else {
        let value = this.config.xFrameOptions.option;
        if (this.config.xFrameOptions.uri) {
          value += ` ${this.config.xFrameOptions.uri}`;
        }
        headers['X-Frame-Options'] = value;
      }
    }

    // X-Content-Type-Options
    if (this.config.xContentTypeOptions) {
      headers['X-Content-Type-Options'] = 'nosniff';
    }

    // X-XSS-Protection
    if (this.config.xXSSProtection) {
      if (typeof this.config.xXSSProtection === 'boolean') {
        headers['X-XSS-Protection'] = this.config.xXSSProtection ? '1' : '0';
      } else {
        let value = this.config.xXSSProtection.enabled ? '1' : '0';
        if (this.config.xXSSProtection.mode) {
          value += `; mode=${this.config.xXSSProtection.mode}`;
        }
        if (this.config.xXSSProtection.report) {
          value += `; report=${this.config.xXSSProtection.report}`;
        }
        headers['X-XSS-Protection'] = value;
      }
    }

    // Referrer-Policy
    if (this.config.referrerPolicy) {
      headers['Referrer-Policy'] = Array.isArray(this.config.referrerPolicy)
        ? this.config.referrerPolicy.join(', ')
        : this.config.referrerPolicy;
    }

    // Permissions-Policy
    if (this.config.permissionsPolicy) {
      const policies = Object.entries(this.config.permissionsPolicy)
        .map(([feature, allowlist]) => {
          const value = Array.isArray(allowlist) && allowlist.length === 0 
            ? '()' 
            : `(${Array.isArray(allowlist) ? allowlist.join(' ') : allowlist})`;
          return `${feature}=${value}`;
        });
      headers['Permissions-Policy'] = policies.join(', ');
    }

    // Cross-Origin 策略
    if (this.config.crossOriginEmbedderPolicy) {
      headers['Cross-Origin-Embedder-Policy'] = this.config.crossOriginEmbedderPolicy;
    }
    if (this.config.crossOriginOpenerPolicy) {
      headers['Cross-Origin-Opener-Policy'] = this.config.crossOriginOpenerPolicy;
    }
    if (this.config.crossOriginResourcePolicy) {
      headers['Cross-Origin-Resource-Policy'] = this.config.crossOriginResourcePolicy;
    }

    // Cache-Control
    if (this.config.cacheControl) {
      headers['Cache-Control'] = this.config.cacheControl;
    }

    return headers;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<SecurityHeadersConfig>): this {
    this.config = { ...this.config, ...config };
    return this;
  }

  /**
   * Express/Connect 中间件
   */
  middleware(): (req: unknown, res: unknown, next: () => void) => void {
    const headers = this.generateHeaders();
    
    return (req: unknown, res: any, next: () => void) => {
      for (const [name, value] of Object.entries(headers)) {
        res.setHeader?.(name, value);
      }
      next();
    };
  }
}

// ============================================================================
// 安全头部扫描器
// ============================================================================

export class SecurityHeaderScanner {
  private static readonly REQUIRED_HEADERS = [
    'strict-transport-security',
    'content-security-policy',
    'x-frame-options',
    'x-content-type-options',
    'referrer-policy'
  ];

  private static readonly HEADER_WEIGHTS: Record<string, number> = {
    'strict-transport-security': 20,
    'content-security-policy': 25,
    'x-frame-options': 15,
    'x-content-type-options': 10,
    'referrer-policy': 10,
    'permissions-policy': 5,
    'cross-origin-embedder-policy': 5,
    'cross-origin-opener-policy': 5,
    'cross-origin-resource-policy': 5
  };

  /**
   * 扫描响应头部
   */
  scan(headers: Record<string, string | string[]>): SecurityReport {
    const normalizedHeaders: Record<string, string> = {};
    
    for (const [name, value] of Object.entries(headers)) {
      normalizedHeaders[name.toLowerCase()] = Array.isArray(value) ? value.join(', ') : value;
    }

    const headerStatus: SecurityReport['headers'] = {};
    const vulnerabilities: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // 检查每个安全头部
    for (const header of SecurityHeaderScanner.REQUIRED_HEADERS) {
      const weight = SecurityHeaderScanner.HEADER_WEIGHTS[header] || 5;
      const value = normalizedHeaders[header];
      const present = !!value;

      headerStatus[header] = { present, value };

      if (present) {
        score += weight;
        this.validateHeaderValue(header, value, vulnerabilities, recommendations);
      } else {
        recommendations.push(`添加 ${header} 头部`);
        if (header === 'strict-transport-security') {
          vulnerabilities.push('缺少 HSTS，可能遭受 SSL 剥离攻击');
        } else if (header === 'content-security-policy') {
          vulnerabilities.push('缺少 CSP，可能遭受 XSS 攻击');
        } else if (header === 'x-frame-options') {
          vulnerabilities.push('缺少 X-Frame-Options，可能遭受点击劫持');
        }
      }
    }

    // 检查危险头部
    if (normalizedHeaders.server) {
      headerStatus.server = { present: true, value: normalizedHeaders.server };
      vulnerabilities.push('暴露 Server 头部可能泄露服务器信息');
      recommendations.push('移除或混淆 Server 头部');
      score -= 5;
    }

    if (normalizedHeaders['x-powered-by']) {
      headerStatus['x-powered-by'] = { present: true, value: normalizedHeaders['x-powered-by'] };
      vulnerabilities.push('暴露 X-Powered-By 头部');
      recommendations.push('移除 X-Powered-By 头部');
      score -= 5;
    }

    // 计算等级
    const grade = this.calculateGrade(Math.max(0, score));

    return {
      score: Math.max(0, score),
      grade,
      headers: headerStatus,
      vulnerabilities,
      recommendations
    };
  }

  private validateHeaderValue(
    header: string, 
    value: string, 
    vulnerabilities: string[], 
    recommendations: string[]
  ): void {
    switch (header) {
      case 'strict-transport-security':
        const maxAgeMatch = /max-age=(\d+)/.exec(value);
        if (!maxAgeMatch) {
          vulnerabilities.push('HSTS 缺少 max-age');
        } else {
          const maxAge = parseInt(maxAgeMatch[1]);
          if (maxAge < 31536000) {
            recommendations.push('建议 HSTS max-age 至少为 1 年 (31536000 秒)');
          }
        }
        break;

      case 'content-security-policy':
        if (value.includes("'unsafe-inline'") && !value.includes("'nonce-") && !value.includes("'sha256-")) {
          vulnerabilities.push('CSP 允许 unsafe-inline 脚本，降低 XSS 防护效果');
        }
        if (!value.includes('default-src')) {
          recommendations.push('CSP 建议添加 default-src 作为后备');
        }
        break;

      case 'x-frame-options':
        if (value.toUpperCase() === 'ALLOWALL' || value.toUpperCase().startsWith('ALLOW-FROM')) {
          vulnerabilities.push('X-Frame-Options 允许嵌入，存在点击劫持风险');
        }
        break;
    }
  }

  private calculateGrade(score: number): SecurityReport['grade'] {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

// ============================================================================
// 预设配置
// ============================================================================

export const SecurityPresets = {
  /**
   * 最严格的安全配置
   */
  strict: (): SecureHeaders => new SecureHeaders({
    contentSecurityPolicy: CSPBuilder.strict().build(),
    strictTransportSecurity: {
      maxAge: 63072000,  // 2 years
      includeSubDomains: true,
      preload: true
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: true,
    referrerPolicy: 'no-referrer',
    crossOriginEmbedderPolicy: 'require-corp',
    crossOriginOpenerPolicy: 'same-origin',
    crossOriginResourcePolicy: 'same-origin'
  }),

  /**
   * API 安全配置
   */
  api: (): SecureHeaders => new SecureHeaders({
    contentSecurityPolicy: CSPBuilder.create()
      .addDirective('default-src', ["'none'"])
      .addDirective('frame-ancestors', ["'none'"])
      .build(),
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: true,
    referrerPolicy: 'no-referrer'
  }),

  /**
   * 单页应用配置
   */
  spa: (): SecureHeaders => new SecureHeaders({
    contentSecurityPolicy: CSPBuilder.create()
      .addDirective('default-src', ["'self'"])
      .addDirective('script-src', ["'self'", "'unsafe-inline'", "'unsafe-eval'"])
      .addDirective('style-src', ["'self'", "'unsafe-inline'"])
      .addDirective('img-src', ["'self'", 'data:', 'https:'])
      .addDirective('connect-src', ["'self'", 'https:'])
      .addDirective('font-src', ["'self'"])
      .addDirective('manifest-src', ["'self'"])
      .build(),
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true
    },
    xFrameOptions: 'SAMEORIGIN',
    xContentTypeOptions: true,
    referrerPolicy: 'strict-origin-when-cross-origin'
  })
};

// ============================================================================
// 演示
// ============================================================================

export function demo(): void {
  console.log('=== 安全 HTTP 头部 ===\n');

  // CSP 构建器
  console.log('--- CSP 构建器 ---');
  const csp = CSPBuilder.create()
    .addDirective('default-src', ["'self'"])
    .addDirective('script-src', ["'self'", 'https://cdn.example.com'])
    .addDirective('style-src', ["'self'", "'unsafe-inline'"])
    .addDirective('img-src', ["'self'", 'data:', 'https:'])
    .addDirective('connect-src', ["'self'", 'https://api.example.com'])
    .addDirective('frame-ancestors', ["'none'"])
    .setReportUri('/csp-report')
    .buildHeaderValue();
  
  console.log('CSP 策略值:');
  console.log(csp);

  // 安全头部生成
  console.log('\n--- 生成的安全头部 ---');
  const secureHeaders = SecurityPresets.spa();
  const headers = secureHeaders.generateHeaders();
  
  for (const [name, value] of Object.entries(headers)) {
    console.log(`${name}:`);
    console.log(`  ${value.length > 60 ? value.slice(0, 60) + '...' : value}`);
  }

  // 安全扫描
  console.log('\n--- 安全头部扫描 ---');
  const scanner = new SecurityHeaderScanner();
  
  // 模拟响应头部
  const mockHeaders = {
    'content-security-policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
    'strict-transport-security': 'max-age=31536000; includeSubDomains',
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'server': 'nginx/1.18.0',
    'x-powered-by': 'Express'
  };

  const report = scanner.scan(mockHeaders);
  console.log(`安全评分: ${report.score}/100`);
  console.log(`安全等级: ${report.grade}`);
  
  console.log('\n头部检测:');
  for (const [header, status] of Object.entries(report.headers)) {
    const icon = status.present ? '✓' : '✗';
    console.log(`  ${icon} ${header}`);
  }

  if (report.vulnerabilities.length > 0) {
    console.log('\n发现的漏洞:');
    report.vulnerabilities.forEach(v => { console.log(`  ⚠ ${v}`); });
  }

  if (report.recommendations.length > 0) {
    console.log('\n建议:');
    report.recommendations.slice(0, 3).forEach(r => { console.log(`  • ${r}`); });
  }

  // 不同预设
  console.log('\n--- 预设配置对比 ---');
  
  const presets = [
    { name: 'Strict', preset: SecurityPresets.strict() },
    { name: 'API', preset: SecurityPresets.api() },
    { name: 'SPA', preset: SecurityPresets.spa() }
  ];

  for (const { name, preset } of presets) {
    const presetHeaders = preset.generateHeaders();
    const headerCount = Object.keys(presetHeaders).length;
    const cspValue = presetHeaders['Content-Security-Policy'] || 'None';
    console.log(`${name}: ${headerCount} 个头部`);
    console.log(`  CSP: ${cspValue.slice(0, 40)}${cspValue.length > 40 ? '...' : ''}`);
  }
}
