import { describe, it, expect } from 'vitest';
import { RequestSigner, signRequest, verifyRequest } from './request-signer.js';

describe('RequestSigner', () => {
  const options = {
    secretKey: 'test-secret-key-1234567890',
    accessKeyId: 'TEST-KEY-ID',
    maxAgeMs: 60000,
  };

  it('should generate a valid signature', () => {
    const signer = new RequestSigner(options);
    const request = RequestSigner.buildCanonicalRequest(
      'GET',
      '/api/test',
      { foo: 'bar' },
      { 'content-type': 'application/json' },
      ''
    );

    const signature = signer.sign(request);
    expect(signature.accessKeyId).toBe('TEST-KEY-ID');
    expect(signature.version).toBe('v1');
    expect(signature.method).toBe('HMAC-SHA256');
    expect(signature.signature.length).toBeGreaterThan(0);
    expect(signature.nonce.length).toBeGreaterThanOrEqual(8);
  });

  it('should verify its own signature', () => {
    const signer = new RequestSigner(options);
    const request = RequestSigner.buildCanonicalRequest('POST', '/api/data', {}, {}, '{}');
    const signature = signer.sign(request);
    const result = signer.verify(request, signature);

    expect(result.valid).toBe(true);
  });

  it('should reject tampered request', () => {
    const signer = new RequestSigner(options);
    const request = RequestSigner.buildCanonicalRequest('POST', '/api/data', {}, {}, '{}');
    const signature = signer.sign(request);

    const tamperedRequest = { ...request, uri: '/api/other' };
    const result = signer.verify(tamperedRequest, signature);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Signature mismatch');
  });

  it('should detect replay attack via nonce', () => {
    const signer = new RequestSigner(options);
    const request = RequestSigner.buildCanonicalRequest('GET', '/api/test', {}, {}, '');
    const signature = signer.sign(request);

    const first = signer.verify(request, signature);
    expect(first.valid).toBe(true);

    const second = signer.verify(request, signature);
    expect(second.valid).toBe(false);
    expect(second.error).toContain('replay');
  });

  it('should reject expired timestamp', () => {
    const signer = new RequestSigner({ ...options, maxAgeMs: 1000 });
    const request = RequestSigner.buildCanonicalRequest('GET', '/api/test', {}, {}, '');
    const signature = signer.sign(request);

    // Wait for expiration
    return new Promise<void>(resolve => {
      setTimeout(() => {
        const result = signer.verify(request, signature);
        expect(result.valid).toBe(false);
        expect(result.error).toContain('expired');
        resolve();
      }, 1100);
    });
  });

  it('should reject wrong access key ID', () => {
    const signer = new RequestSigner(options);
    const request = RequestSigner.buildCanonicalRequest('GET', '/api/test', {}, {}, '');
    const signature = signer.sign(request);

    const wrongSignature = { ...signature, accessKeyId: 'WRONG-KEY' };
    const result = signer.verify(request, wrongSignature);

    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid access key ID');
  });

  it('should reject unsupported version', () => {
    const signer = new RequestSigner(options);
    const request = RequestSigner.buildCanonicalRequest('GET', '/api/test', {}, {}, '');
    const signature = signer.sign(request);

    const wrongSignature = { ...signature, version: 'v99' as const };
    const result = signer.verify(request, wrongSignature);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('version');
  });

  it('should throw on short secret key', () => {
    expect(() => new RequestSigner({ ...options, secretKey: 'short' })).toThrow('at least 16');
  });

  it('should throw on empty access key ID', () => {
    expect(() => new RequestSigner({ ...options, accessKeyId: '' })).toThrow('Access key ID is required');
  });

  it('should build canonical request with sorted query params', () => {
    const request = RequestSigner.buildCanonicalRequest(
      'GET',
      '/api/test',
      { z: '1', a: '2', m: '3' },
      {},
      ''
    );

    expect(request.queryString).toBe('a=2&m=3&z=1');
  });

  it('should build canonical request with sorted headers', () => {
    const request = RequestSigner.buildCanonicalRequest(
      'GET',
      '/api/test',
      {},
      { 'X-Custom': 'val', 'content-type': 'json' },
      ''
    );

    expect(Object.keys(request.headers)).toEqual(['content-type', 'x-custom']);
  });
});

describe('signRequest / verifyRequest convenience functions', () => {
  const options = {
    secretKey: 'convenience-secret-key-12345',
    accessKeyId: 'CONV-KEY',
  };

  it('should sign and verify via convenience functions', () => {
    const signature = signRequest(options, 'POST', '/api/items', { page: '1' }, {}, '{"name":"x"}');
    const result = verifyRequest(options, signature, 'POST', '/api/items', { page: '1' }, {}, '{"name":"x"}');
    expect(result.valid).toBe(true);
  });
});
