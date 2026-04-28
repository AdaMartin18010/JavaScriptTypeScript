import { describe, it, expect, vi } from 'vitest';
import {
  XSSSanitizer,
  HTMLEncoder,
  CSPBuilder,
  CSRFProtection,
  SecurityHeadersBuilder
} from './xss-csp.js';

describe('XSSSanitizer', () => {
  it('should sanitize script tags', () => {
    const sanitizer = new XSSSanitizer();
    const input = '<script>alert("xss")</script><p>safe</p>';
    expect(sanitizer.sanitizeHtml(input)).toBe('<p>safe</p>');
  });

  it('should remove event handlers', () => {
    const sanitizer = new XSSSanitizer();
    const input = '<img src="x" onerror="alert(1)" />';
    expect(sanitizer.sanitizeHtml(input)).toBe('<img src="x"  />');
  });

  it('should block javascript: URLs', () => {
    const sanitizer = new XSSSanitizer();
    expect(sanitizer.sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizer.sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('should strip HTML completely', () => {
    const sanitizer = new XSSSanitizer();
    expect(sanitizer.stripHtml('<p>hello</p>')).toBe('hello');
  });
});

describe('HTMLEncoder', () => {
  it('should encode HTML entities', () => {
    expect(HTMLEncoder.encodeHtml('<script>')).toBe('&lt;script&gt;');
    expect(HTMLEncoder.encodeHtml('"test"')).toBe('&quot;test&quot;');
  });

  it('should encode JavaScript strings safely', () => {
    expect(HTMLEncoder.encodeJavaScript("<script>alert('xss')</script>"))
      .not.toContain('<script>');
  });

  it('should produce safe JSON', () => {
    const obj = { html: '<script>alert(1)</script>' };
    const json = HTMLEncoder.safeJsonStringify(obj);
    expect(json).not.toContain('<script>');
    expect(JSON.parse(json)).toEqual(obj);
  });
});

describe('CSPBuilder', () => {
  it('should build strict policy', () => {
    const csp = new CSPBuilder().setStrictPolicy().build();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
    expect(csp).toContain("object-src 'none'");
  });

  it('should generate correct headers', () => {
    const headers = new CSPBuilder().setStrictPolicy().generateHeaders();
    expect(headers).toHaveProperty('Content-Security-Policy');
  });

  it('should support report-only mode', () => {
    const headers = new CSPBuilder()
      .setStrictPolicy()
      .setReportOnly(true)
      .generateHeaders();
    expect(headers).toHaveProperty('Content-Security-Policy-Report-Only');
  });

  it('should validate unsafe-inline with nonce conflict', () => {
    const issues = new CSPBuilder()
      .addDirective('script-src', "'self'", "'unsafe-inline'")
      .addScriptNonce('abc123')
      .validate();
    expect(issues.length).toBeGreaterThan(0);
  });
});

describe('CSRFProtection', () => {
  it('should generate and validate tokens', () => {
    const csrf = new CSRFProtection();
    const sessionId = 'session-1';
    const token = csrf.generateToken(sessionId);
    expect(csrf.validateToken(sessionId, token)).toBe(true);
    expect(csrf.validateToken(sessionId, 'wrong')).toBe(false);
  });

  it('should generate double-submit cookie', () => {
    const csrf = new CSRFProtection();
    const { token, cookie } = csrf.generateDoubleSubmitCookie();
    expect(token).toBeTruthy();
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('HttpOnly');
  });
});

describe('SecurityHeadersBuilder', () => {
  it('should build recommended headers', () => {
    const headers = new SecurityHeadersBuilder().setRecommendedHeaders().build();
    expect(headers['Strict-Transport-Security']).toBeDefined();
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });

  it('should generate nginx config', () => {
    const config = new SecurityHeadersBuilder()
      .setRecommendedHeaders()
      .generateNginxConfig();
    expect(config).toContain('add_header Strict-Transport-Security');
  });
});
