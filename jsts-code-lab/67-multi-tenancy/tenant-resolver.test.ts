import { describe, it, expect } from 'vitest'
import { JwtTenantResolver, TenantResolutionError } from './tenant-resolver.js'

describe('tenant-resolver', () => {
  it('JwtTenantResolver is defined', () => {
    expect(typeof JwtTenantResolver).not.toBe('undefined');
  });

  it('can instantiate JwtTenantResolver with valid secret', () => {
    const resolver = new JwtTenantResolver('my-super-secret-key');
    expect(resolver).toBeDefined();
  });

  it('throws when secret is too short', () => {
    expect(() => new JwtTenantResolver('short')).toThrow();
  });

  it('generates and resolves token from header', () => {
    const resolver = new JwtTenantResolver('my-super-secret-key');
    const token = resolver.generateToken({
      sub: 'user-1',
      tenantId: 'tenant-1',
      role: 'admin',
      permissions: ['read'],
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    const payload = resolver.resolveFromHeader(`Bearer ${token}`);
    expect(payload.tenantId).toBe('tenant-1');
    expect(payload.sub).toBe('user-1');
  });

  it('throws on invalid header format', () => {
    const resolver = new JwtTenantResolver('my-super-secret-key');
    expect(() => resolver.resolveFromHeader('Basic abc')).toThrow(TenantResolutionError);
  });

  it('throws when token not found in request', () => {
    const resolver = new JwtTenantResolver('my-super-secret-key');
    expect(() => resolver.resolve({}, {})).toThrow(TenantResolutionError);
  });

  it('resolves from query param', () => {
    const resolver = new JwtTenantResolver('my-super-secret-key');
    const token = resolver.generateToken({
      sub: 'user-1',
      tenantId: 'tenant-2',
      role: 'user',
      permissions: [],
      exp: Math.floor(Date.now() / 1000) + 3600
    });

    const payload = resolver.resolve({}, { tenantToken: token });
    expect(payload.tenantId).toBe('tenant-2');
  });

  it('TenantResolutionError is defined', () => {
    expect(typeof TenantResolutionError).not.toBe('undefined');
  });
});
