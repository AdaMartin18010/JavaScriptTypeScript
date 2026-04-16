import { describe, it, expect } from 'vitest';
import { AuthService, AuthorizationChecker, createAuthGuard, type AuthUser, type GuardContext } from './jwt-auth.js';

describe('AuthService', () => {
  const config = { secret: 'super-secret-key-at-least-32-characters-long', accessTokenExpiry: 900, refreshTokenExpiry: 604800 };
  const user: AuthUser = { id: 'u1', email: 'a@b.com', roles: ['admin'], permissions: ['read'] };

  it('generates and verifies access token', () => {
    const auth = new AuthService(config);
    const tokens = auth.generateTokenPair(user);
    const payload = auth.verifyAccessToken(tokens.accessToken);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe('u1');
    expect(auth.verifyAccessToken(tokens.refreshToken)).toBeNull();
  });

  it('refreshes and revokes tokens', () => {
    const auth = new AuthService(config);
    const tokens = auth.generateTokenPair(user);
    const newTokens = auth.refreshAccessToken(tokens.refreshToken);
    expect(newTokens).not.toBeNull();
    expect(auth.refreshAccessToken(tokens.refreshToken)).toBeNull();
    auth.revokeAllUserTokens(user.id);
    expect(auth.refreshAccessToken(newTokens!.refreshToken)).toBeNull();
  });

  it('rejects expired token', () => {
    const auth = new AuthService({ ...config, accessTokenExpiry: -1 });
    const tokens = auth.generateTokenPair(user);
    expect(auth.verifyAccessToken(tokens.accessToken)).toBeNull();
  });
});

describe('AuthorizationChecker', () => {
  const payload = { sub: 'u1', roles: ['admin', 'user'], permissions: ['read', 'write'] } as any;

  it('checks roles', () => {
    expect(AuthorizationChecker.hasRole(payload, 'admin')).toBe(true);
    expect(AuthorizationChecker.hasRole(payload, 'editor')).toBe(false);
  });

  it('checks permissions', () => {
    expect(AuthorizationChecker.hasPermission(payload, 'write')).toBe(true);
    expect(AuthorizationChecker.hasPermission(payload, 'delete')).toBe(false);
  });

  it('checks ownership', () => {
    expect(AuthorizationChecker.isOwner(payload, 'u1')).toBe(true);
    expect(AuthorizationChecker.isOwner(payload, 'u2')).toBe(false);
  });
});

describe('Guards', () => {
  it('createAuthGuard validates Bearer token', () => {
    const auth = new AuthService({ secret: 's', accessTokenExpiry: 10, refreshTokenExpiry: 10 });
    const tokens = auth.generateTokenPair({ id: 'u1', email: '', roles: [], permissions: [] });
    const guard = createAuthGuard(auth);
    const ctx: GuardContext = { request: { headers: { authorization: `Bearer ${tokens.accessToken}` }, params: {}, body: {} } };
    expect(guard(ctx)).toBe(true);
    expect(ctx.user).toBeDefined();
  });
});
