import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AuthManager,
  JWTManager,
  SessionManager,
  PermissionGuard,
  createTestUser,
  createAdminUser,
  DEFAULT_ROLE_PERMISSIONS,
} from './auth-manager.js';

describe('JWTManager', () => {
  const config = {
    jwtSecret: 'test-secret',
    jwtIssuer: 'test-app',
    jwtAudience: 'test-client',
    accessTokenExpiry: 3600,
    refreshTokenExpiry: 86400,
  };

  it('should generate and verify a valid token', () => {
    const jwt = new JWTManager(config);
    const user = createTestUser();
    const token = jwt.generateToken(user);
    const payload = jwt.verifyToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.userId).toBe(user.id);
    expect(payload!.role).toBe(user.role);
  });

  it('should return null for an invalid token', () => {
    const jwt = new JWTManager(config);
    expect(jwt.verifyToken('invalid.token.here')).toBeNull();
  });

  it('should decode token payload without verifying', () => {
    const jwt = new JWTManager(config);
    const user = createTestUser();
    const token = jwt.generateToken(user);
    const decoded = jwt.decodeToken(token);

    expect(decoded).not.toBeNull();
    expect(decoded!.userId).toBe(user.id);
  });

  it('should calculate remaining token time correctly', () => {
    const jwt = new JWTManager(config);
    const user = createTestUser();
    const token = jwt.generateToken(user);
    const remaining = jwt.getTokenRemainingTime(token);

    expect(remaining).toBeGreaterThan(3500);
    expect(remaining).toBeLessThanOrEqual(3600);
  });

  it('should refresh access token from refresh token', () => {
    const jwt = new JWTManager(config);
    const user = createTestUser();
    const tokens = jwt.generateTokenPair(user);

    const newTokens = jwt.refreshAccessToken(tokens.refreshToken, user);
    expect(newTokens).not.toBeNull();
    expect(newTokens!.accessToken).not.toBe(tokens.accessToken);
  });
});

describe('SessionManager', () => {
  let sessions: SessionManager;

  beforeEach(() => {
    vi.useFakeTimers();
    sessions = new SessionManager(3);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create and retrieve a session', () => {
    const session = sessions.createSession('user-1', 'jti-1', 'rjti-1');
    expect(session.userId).toBe('user-1');
    expect(sessions.getSession(session.id)).toEqual(session);
  });

  it('should enforce max sessions per user', () => {
    sessions.createSession('user-1', 'jti-1', 'rjti-1');
    sessions.createSession('user-1', 'jti-2', 'rjti-2');
    sessions.createSession('user-1', 'jti-3', 'rjti-3');
    sessions.createSession('user-1', 'jti-4', 'rjti-4');

    expect(sessions.getUserSessions('user-1').length).toBe(3);
  });

  it('should revoke a session', () => {
    const session = sessions.createSession('user-1', 'jti-1', 'rjti-1');
    expect(sessions.revokeSession(session.id)).toBe(true);
    expect(sessions.getUserSessions('user-1').length).toBe(0);
  });

  it('should touch a session to update last activity', () => {
    const session = sessions.createSession('user-1', 'jti-1', 'rjti-1');
    const before = session.lastActivityAt.getTime();
    vi.advanceTimersByTime(1000);
    expect(sessions.touchSession(session.id)).toBe(true);
    expect(session.lastActivityAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('should cleanup expired sessions', () => {
    const session = sessions.createSession('user-1', 'jti-1', 'rjti-1');
    session.expiresAt = new Date(Date.now() - 1000);
    expect(sessions.cleanupExpiredSessions()).toBe(1);
    expect(sessions.getSession(session.id)).toBeUndefined();
  });
});

describe('PermissionGuard', () => {
  let guard: PermissionGuard;

  beforeEach(() => {
    guard = new PermissionGuard();
  });

  it('should allow user with correct permission', async () => {
    const user = createTestUser({ permissions: ['read:any'] });
    const result = await guard.checkPermission(user, 'read:any');
    expect(result.allowed).toBe(true);
  });

  it('should deny user without permission', async () => {
    const user = createTestUser({ role: 'user' });
    const result = await guard.checkPermission(user, 'manage:system');
    expect(result.allowed).toBe(false);
    expect(result.missingPermissions).toContain('manage:system');
  });

  it('should allow superadmin any permission', async () => {
    const user = createTestUser({ role: 'superadmin' });
    const result = await guard.checkPermission(user, 'manage:system');
    expect(result.allowed).toBe(true);
  });

  it('should check all permissions with AND logic', async () => {
    const user = createAdminUser();
    const result = await guard.checkAllPermissions(user, ['read:any', 'manage:users']);
    expect(result.allowed).toBe(true);
  });

  it('should check any permission with OR logic', async () => {
    const user = createTestUser({ role: 'user' });
    const result = await guard.checkAnyPermission(user, ['read:any', 'read:own']);
    expect(result.allowed).toBe(true);
  });
});

describe('AuthManager', () => {
  const config = {
    jwtSecret: 'test-secret',
    enableSessionTracking: true,
    maxSessionsPerUser: 2,
  };

  it('should login and generate tokens', async () => {
    const auth = new AuthManager(config);
    const user = createTestUser();
    const result = await auth.login(user);

    expect(result.success).toBe(true);
    expect(result.tokens).toBeDefined();
  });

  it('should authenticate a valid token', async () => {
    const auth = new AuthManager(config);
    const user = createTestUser();
    const loginResult = await auth.login(user);
    const authResult = await auth.authenticate(loginResult.tokens!.accessToken);

    expect(authResult.success).toBe(true);
    expect(authResult.user!.id).toBe(user.id);
  });

  it('should logout and invalidate session', async () => {
    const auth = new AuthManager(config);
    const user = createTestUser();
    const loginResult = await auth.login(user);
    auth.logout(loginResult.tokens!.accessToken);

    const sessions = auth.sessions.getUserSessions(user.id);
    expect(sessions.length).toBe(0);
  });

  it('should authorize based on permission', async () => {
    const auth = new AuthManager(config);
    const user = createAdminUser();
    const loginResult = await auth.login(user);
    const result = await auth.authorize(loginResult.tokens!.accessToken, 'manage:users');

    expect(result.allowed).toBe(true);
  });

  it('should refresh token successfully', async () => {
    const auth = new AuthManager(config);
    const user = createTestUser();
    const loginResult = await auth.login(user);
    const refreshResult = await auth.refresh(loginResult.tokens!.refreshToken, user);

    expect(refreshResult.success).toBe(true);
    expect(refreshResult.tokens).toBeDefined();
  });
});
