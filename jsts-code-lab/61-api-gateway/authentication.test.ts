import { describe, it, expect } from 'vitest';
import { JWTHandler, APIKeyManager, OAuth2Server, CompositeAuthMiddleware, JWTMiddleware, APIKeyMiddleware } from './authentication';

describe('JWTHandler', () => {
  it('signs and verifies a token', () => {
    const jwt = new JWTHandler({ secret: 's', expiresIn: 3600 });
    const token = jwt.sign({ sub: 'u1' });
    const claims = jwt.verify(token);
    expect(claims.sub).toBe('u1');
    expect(claims.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('throws on expired token', () => {
    const jwt = new JWTHandler({ secret: 's', expiresIn: -1 });
    const token = jwt.sign({ sub: 'u1' });
    expect(() => jwt.verify(token)).toThrow('Token expired');
  });

  it('decodes without verifying', () => {
    const jwt = new JWTHandler({ secret: 's' });
    const token = jwt.sign({ sub: 'u1' });
    expect(jwt.decode(token)?.sub).toBe('u1');
  });
});

describe('APIKeyManager', () => {
  it('generates and validates key', () => {
    const manager = new APIKeyManager();
    const { key } = manager.generateKey('app', 'user1', ['read']);
    const result = manager.validateKey(key);
    expect(result.success).toBe(true);
    expect(result.user?.permissions).toContain('read');
  });

  it('revokes key and fails validation', () => {
    const manager = new APIKeyManager();
    const { id, key } = manager.generateKey('app', 'user1', ['read']);
    manager.revokeKey(id);
    expect(manager.validateKey(key).success).toBe(false);
  });
});

describe('OAuth2Server', () => {
  it('exchanges auth code for token', () => {
    const oauth = new OAuth2Server();
    const client = oauth.registerClient('c', ['http://cb'], ['read']);
    const code = oauth.generateAuthCode(client.clientId, 'u1', 'read');
    const token = oauth.exchangeCodeForToken(client.clientId, code);
    expect(token).not.toBeNull();
    expect(oauth.validateToken(token!.accessToken)?.userId).toBe('u1');
  });

  it('returns null for invalid code', () => {
    const oauth = new OAuth2Server();
    expect(oauth.exchangeCodeForToken('x', 'bad')).toBeNull();
  });
});

describe('CompositeAuthMiddleware', () => {
  it('returns success from first successful strategy', async () => {
    const composite = new CompositeAuthMiddleware();
    composite.addStrategy('always', { async authenticate() { return { success: true, user: { id: '1', roles: [], permissions: [] } }; } }, 1);
    composite.addStrategy('never', { async authenticate() { return { success: false, error: 'no' }; } }, 2);
    const result = await composite.authenticate({ headers: {} });
    expect(result.success).toBe(true);
    expect(result.metadata?.strategy).toBe('always');
  });

  it('returns combined errors when all fail', async () => {
    const composite = new CompositeAuthMiddleware();
    composite.addStrategy('a', { async authenticate() { return { success: false, error: 'fail-a' }; } }, 1);
    const result = await composite.authenticate({ headers: {} });
    expect(result.success).toBe(false);
    expect(result.error).toContain('fail-a');
  });
});
