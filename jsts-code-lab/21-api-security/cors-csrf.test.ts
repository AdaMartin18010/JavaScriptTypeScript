import { describe, it, expect } from 'vitest';
import { CORSHandler, CSRFProtection, DoubleSubmitCookie, DefaultCORSConfig, DefaultCSRFConfig } from './cors-csrf.js';

describe('CORSHandler', () => {
  it('should allow simple request from allowed origin', () => {
    const cors = new CORSHandler({ allowedOrigins: ['https://example.com'] });
    const res = cors.handle({ method: 'GET', headers: { origin: 'https://example.com' } }, { headers: {} });
    expect(res.headers['access-control-allow-origin']).toBe('https://example.com');
  });

  it('should handle preflight request', () => {
    const cors = new CORSHandler(DefaultCORSConfig);
    const res = cors.handle(
      { method: 'OPTIONS', headers: { origin: 'https://app.example.com', 'access-control-request-method': 'POST', 'access-control-request-headers': 'Content-Type' } },
      { headers: {} }
    );
    expect(res.headers['access-control-allow-methods']).toBe(DefaultCORSConfig.allowedMethods.join(','));
    expect(res.headers['access-control-allow-headers']).toContain('Content-Type');
    expect(res.statusCode).toBe(204);
  });

  it('should reject disallowed origin', () => {
    const cors = new CORSHandler({ allowedOrigins: ['https://example.com'] });
    const res = cors.handle({ method: 'GET', headers: { origin: 'https://evil.com' } }, { headers: {} });
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('CSRFProtection', () => {
  it('should generate and validate token', () => {
    const csrf = new CSRFProtection(DefaultCSRFConfig);
    const token = csrf.generateToken('session-1');
    expect(csrf.validateToken('session-1', token)).toBe(true);
    expect(csrf.validateToken('session-1', 'bad')).toBe(false);
  });

  it('should require token for unsafe methods only', () => {
    const csrf = new CSRFProtection();
    expect(csrf.shouldValidate('GET')).toBe(false);
    expect(csrf.shouldValidate('POST')).toBe(true);
  });

  it('middleware should reject missing token', () => {
    const csrf = new CSRFProtection();
    const result = csrf.middleware({ method: 'POST', headers: {}, sessionId: 's1' });
    expect(result.valid).toBe(false);
    expect(result.error).toBe('CSRF token missing');
  });
});

describe('DoubleSubmitCookie', () => {
  it('should generate matching cookie and form value', () => {
    const ds = new DoubleSubmitCookie();
    const { cookie, formValue } = ds.generate('session-1');
    expect(ds.validate('session-1', formValue, formValue)).toBe(true);
    expect(ds.validate('session-1', formValue, 'other')).toBe(false);
  });
});
