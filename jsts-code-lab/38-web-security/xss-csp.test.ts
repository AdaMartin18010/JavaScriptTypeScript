import { describe, it, expect } from 'vitest';
import { XSSSanitizer, HTMLEncoder, CSPBuilder, CSRFProtection, SecurityHeadersBuilder } from './xss-csp.js';

describe('XSSSanitizer', () => {
  it('removes script tags and events', () => {
    const s = new XSSSanitizer();
    const out = s.sanitizeHtml('<script>alert(1)</script><p onclick="evil()">hi</p>');
    expect(out).not.toContain('<script>');
    expect(out).not.toContain('onclick');
  });

  it('strips HTML completely', () => {
    const s = new XSSSanitizer();
    expect(s.stripHtml('<p>hello</p>')).toBe('hello');
  });

  it('sanitizes URLs', () => {
    const s = new XSSSanitizer();
    expect(s.sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(s.sanitizeUrl('https://example.com')).toBe('https://example.com');
    expect(s.sanitizeUrl('/relative')).toBe('/relative');
  });
});

describe('HTMLEncoder', () => {
  it('encodes HTML entities', () => {
    expect(HTMLEncoder.encodeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('encodes JavaScript string', () => {
    expect(HTMLEncoder.encodeJavaScript("a'b")).toBe("a\\'b");
  });

  it('safe JSON stringify escapes tags', () => {
    const json = HTMLEncoder.safeJsonStringify({ html: '<script>' });
    expect(json).not.toContain('<');
  });
});

describe('CSPBuilder', () => {
  it('builds strict policy', () => {
    const csp = new CSPBuilder().setStrictPolicy().build();
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("script-src 'self'");
  });

  it('validates issues', () => {
    const issues = new CSPBuilder().setPermissivePolicy().validate();
    expect(issues.some(i => i.includes('unsafe-eval'))).toBe(true);
  });

  it('generates headers', () => {
    const headers = new CSPBuilder().setStrictPolicy().generateHeaders();
    expect(headers['Content-Security-Policy']).toBeDefined();
  });
});

describe('CSRFProtection', () => {
  it('generates and validates token', () => {
    const csrf = new CSRFProtection();
    const token = csrf.generateToken('s1');
    expect(csrf.validateToken('s1', token)).toBe(true);
    expect(csrf.validateToken('s1', 'bad')).toBe(false);
  });

  it('validates double submit cookie', () => {
    const csrf = new CSRFProtection();
    expect(csrf.validateDoubleSubmitCookie('abc', 'abc')).toBe(true);
    expect(csrf.validateDoubleSubmitCookie('abc', 'xyz')).toBe(false);
  });
});

describe('SecurityHeadersBuilder', () => {
  it('builds recommended headers', () => {
    const headers = new SecurityHeadersBuilder().setRecommendedHeaders().build();
    expect(headers['Strict-Transport-Security']).toBeDefined();
    expect(headers['X-Frame-Options']).toBeDefined();
  });
});
