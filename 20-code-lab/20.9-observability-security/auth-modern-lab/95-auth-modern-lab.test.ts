// @vitest-environment node

// Mock better-auth 及其插件（未安装依赖）
vi.mock('better-auth', () => ({
  betterAuth: vi.fn((config: unknown) => ({ handler: vi.fn(), config })),
}));

vi.mock('better-auth/adapters/drizzle', () => ({
  drizzleAdapter: vi.fn((db: unknown, opts: unknown) => ({ db, provider: (opts as any).provider })),
}));

vi.mock('better-auth/adapters/prisma', () => ({
  prismaAdapter: vi.fn((prisma: unknown, opts: unknown) => ({ prisma, provider: (opts as any).provider })),
}));

vi.mock('better-auth/plugins', () => ({
  twoFactor: vi.fn((opts: unknown) => ({ name: 'twoFactor', opts })),
}));

vi.mock('better-auth/plugins/passkey', () => ({
  passkey: vi.fn((opts: unknown) => ({ name: 'passkey', opts })),
}));

vi.mock('better-auth/plugins/organization', () => ({
  organization: vi.fn((opts: unknown) => ({ name: 'organization', opts })),
}));

vi.mock('better-auth/plugins/admin', () => ({
  admin: vi.fn((opts: unknown) => ({ name: 'admin', opts })),
}));

vi.mock('better-auth/plugins/magic-link', () => ({
  magicLink: vi.fn((opts: unknown) => ({ name: 'magicLink', opts })),
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as crypto from 'crypto';
import {
  PKCEGenerator,
  OAuth2Client,
  OAuth2Security,
  IDTokenPayload,
} from './oauth2-pkce-flow.js';
import {
  PasskeyService,
  RegistrationCredential,
  AuthenticationCredential,
  COSEAlgorithm,
} from './passkeys-implementation.js';
import {
  RBACEngine,
  AuthorizationGuard,
  User,
  RequestContext,
  createHonoRBAC,
  createExpressRBAC,
} from './rbac-middleware.js';
import {
  createAuthWithDrizzle,
  createAuthWithPrisma,
  authErrorMessages,
} from './better-auth-setup.js';

// ==================== PKCE 测试 ====================

describe('PKCE 生成与验证', () => {
  it('应生成符合规范的 PKCE 参数', () => {
    const pkce = PKCEGenerator.generate();

    expect(pkce.codeVerifier).toBeDefined();
    expect(pkce.codeChallenge).toBeDefined();
    expect(pkce.codeChallengeMethod).toBe('S256');

    // code_verifier 长度应在 43-128 之间（Base64URL 编码 32 字节为 43 字符）
    expect(pkce.codeVerifier.length).toBeGreaterThanOrEqual(43);
    expect(pkce.codeVerifier.length).toBeLessThanOrEqual(128);

    // 只允许 [A-Za-z0-9-._~]
    expect(pkce.codeVerifier).toMatch(/^[A-Za-z0-9\-._~]+$/);
  });

  it('应能验证正确的 code_verifier 和 code_challenge 配对', () => {
    const pkce = PKCEGenerator.generate();
    const valid = PKCEGenerator.verify(pkce.codeVerifier, pkce.codeChallenge);
    expect(valid).toBe(true);
  });

  it('应拒绝错误的 code_verifier', () => {
    const pkce = PKCEGenerator.generate();
    const valid = PKCEGenerator.verify(pkce.codeVerifier + 'x', pkce.codeChallenge);
    expect(valid).toBe(false);
  });

  it('不同次生成的 code_verifier 应不同', () => {
    const pkce1 = PKCEGenerator.generate();
    const pkce2 = PKCEGenerator.generate();
    expect(pkce1.codeVerifier).not.toBe(pkce2.codeVerifier);
    expect(pkce1.codeChallenge).not.toBe(pkce2.codeChallenge);
  });
});

// ==================== OAuth2 Client 测试 ====================

describe('OAuth2 Client', () => {
  let client: OAuth2Client;

  beforeEach(() => {
    client = new OAuth2Client({
      clientId: 'test-client-id',
      authorizationEndpoint: 'https://example.com/oauth/authorize',
      tokenEndpoint: 'https://example.com/oauth/token',
      redirectUri: 'http://localhost:3000/callback',
      scopes: ['read', 'write'],
    });
  });

  it('应生成包含所有必需参数的授权 URL', () => {
    const { url, state, sessionId } = client.createAuthorizationUrl();

    expect(url).toContain('https://example.com/oauth/authorize');
    expect(url).toContain('client_id=test-client-id');
    expect(url).toContain('response_type=code');
    expect(url).toContain('scope=read+write');
    expect(url).toContain('code_challenge_method=S256');
    expect(url).toContain('code_challenge=');
    expect(state).toBeDefined();
    expect(sessionId).toBeDefined();
  });

  it('应包含 state 和 PKCE 参数', () => {
    const { url, state } = client.createAuthorizationUrl();
    expect(url).toContain(`state=${state}`);
    expect(url).toContain('code_challenge=');
  });

  it('回调处理应验证 session 和 state', async () => {
    const { state, sessionId } = client.createAuthorizationUrl();

    // Mock fetch
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }),
    }));

    const result = await client.handleCallback(sessionId, 'auth-code', state);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.tokens.access_token).toBe('mock-access-token');
    }

    vi.unstubAllGlobals();
  });

  it('应拒绝错误的 state（CSRF 检测）', async () => {
    const { sessionId, state } = client.createAuthorizationUrl();
    // 构造与正确 state 长度相同但内容不同的 state，避免 timingSafeEqual 长度不一致报错
    const wrongState = state.slice(0, -1) + (state.endsWith('A') ? 'B' : 'A');

    const result = await client.handleCallback(sessionId, 'auth-code', wrongState);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('CSRF');
    }
  });

  it('应拒绝过期或无效的 session', async () => {
    const result = await client.handleCallback('invalid-session', 'auth-code', 'state');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Session not found');
    }
  });

  it('应能刷新 access token', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
      }),
    }));

    const result = await client.refreshAccessToken('refresh-token-123');

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.tokens.access_token).toBe('new-access-token');
    }

    vi.unstubAllGlobals();
  });

  it('应能验证 OIDC ID Token', async () => {
    const { state, sessionId } = client.createAuthorizationUrl({ useNonce: true });

    // 获取 session 中实际生成的 nonce
    const session = (client as any).sessions.get(sessionId);
    const expectedNonce = session.nonce;

    const payload: IDTokenPayload = {
      iss: 'https://example.com',
      sub: 'user-123',
      aud: 'test-client-id',
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      nonce: expectedNonce,
    };

    const idToken = `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: idToken,
      }),
    }));

    const result = await client.handleCallback(sessionId, 'auth-code', state, {
      validateIdToken: true,
      expectedIssuer: 'https://example.com',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.idTokenPayload).toBeDefined();
      expect(result.idTokenPayload!.sub).toBe('user-123');
    }

    vi.unstubAllGlobals();
  });

  it('应拒绝过期的 ID Token', async () => {
    const { state, sessionId } = client.createAuthorizationUrl();

    const payload: IDTokenPayload = {
      iss: 'https://example.com',
      sub: 'user-123',
      aud: 'test-client-id',
      exp: Math.floor(Date.now() / 1000) - 100, // 已过期
      iat: Math.floor(Date.now() / 1000) - 200,
    };

    const idToken = `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.signature`;

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'mock-access-token',
        token_type: 'Bearer',
        expires_in: 3600,
        id_token: idToken,
      }),
    }));

    const result = await client.handleCallback(sessionId, 'auth-code', state, {
      validateIdToken: true,
      expectedIssuer: 'https://example.com',
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('expired');
    }

    vi.unstubAllGlobals();
  });
});

// ==================== OAuth2 安全工具测试 ====================

describe('OAuth2 安全工具', () => {
  it('应精确匹配 redirect_uri', () => {
    expect(OAuth2Security.validateRedirectUri('http://localhost:3000/callback', [
      'http://localhost:3000/callback',
      'https://app.example.com/callback',
    ])).toBe(true);

    expect(OAuth2Security.validateRedirectUri('http://localhost:3000/callback2', [
      'http://localhost:3000/callback',
    ])).toBe(false);
  });

  it('应正确解析 scope', () => {
    expect(OAuth2Security.parseScopes('read write admin')).toEqual(['read', 'write', 'admin']);
    expect(OAuth2Security.parseScopes('')).toEqual([]);
  });

  it('应检查 scope 包含关系', () => {
    expect(OAuth2Security.hasScopes(['read', 'write'], ['read'])).toBe(true);
    expect(OAuth2Security.hasScopes(['read'], ['read', 'write'])).toBe(false);
  });

  it('应计算正确的过期时间', () => {
    const now = Date.now();
    const expiry = OAuth2Security.calculateExpiry(3600);
    expect(expiry.getTime()).toBeGreaterThan(now);
    expect(expiry.getTime()).toBeLessThanOrEqual(now + 3600 * 1000 + 1000);
  });
});

// ==================== Passkeys 测试 ====================

describe('Passkeys 实现', () => {
  let service: PasskeyService;

  beforeEach(() => {
    service = new PasskeyService('Test App', 'localhost', 'http://localhost:3000');
  });

  it('应生成包含必要字段的 RegistrationOptions', () => {
    const options = service.generateRegistrationOptions('user-1', 'user@example.com', '张三');

    expect(options.challenge).toBeDefined();
    expect(options.rp.name).toBe('Test App');
    expect(options.rp.id).toBe('localhost');
    expect(options.user.name).toBe('user@example.com');
    expect(options.user.displayName).toBe('张三');
    expect(options.pubKeyCredParams.map((p) => p.alg)).toContain(COSEAlgorithm.ES256);
    expect(options.timeout).toBe(60000);
    expect(options.attestation).toBe('none');
  });

  it('应生成包含 allowCredentials 的 AuthenticationOptions', () => {
    const options = service.generateAuthenticationOptions([
      { id: 'cred-1', transports: ['internal'] },
      { id: 'cred-2', transports: ['hybrid'] },
    ]);

    expect(options.challenge).toBeDefined();
    expect(options.rpId).toBe('localhost');
    expect(options.allowCredentials).toHaveLength(2);
    expect(options.allowCredentials![0].id).toBe('cred-1');
  });

  it('应验证正确的注册响应', async () => {
    const options = service.generateRegistrationOptions('user-1', 'user@example.com', '张三');

    const clientDataJSON = Buffer.from(JSON.stringify({
      type: 'webauthn.create',
      challenge: options.challenge,
      origin: 'http://localhost:3000',
    })).toString('base64url');

    const credential: RegistrationCredential = {
      id: 'cred-abc',
      rawId: 'raw-cred-abc',
      response: {
        clientDataJSON,
        attestationObject: 'mock-attestation',
      },
      type: 'public-key',
    };

    const result = await service.verifyRegistration(credential, options.challenge);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.credential.credentialId).toBe('cred-abc');
    }
  });

  it('应拒绝类型错误的注册响应', async () => {
    const options = service.generateRegistrationOptions('user-1', 'user@example.com', '张三');

    const clientDataJSON = Buffer.from(JSON.stringify({
      type: 'webauthn.get', // 错误的类型
      challenge: options.challenge,
      origin: 'http://localhost:3000',
    })).toString('base64url');

    const credential: RegistrationCredential = {
      id: 'cred-abc',
      rawId: 'raw-cred-abc',
      response: {
        clientDataJSON,
        attestationObject: 'mock-attestation',
      },
      type: 'public-key',
    };

    const result = await service.verifyRegistration(credential, options.challenge);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Invalid client data type');
    }
  });

  it('应拒绝 Origin 不匹配的注册响应', async () => {
    const options = service.generateRegistrationOptions('user-1', 'user@example.com', '张三');

    const clientDataJSON = Buffer.from(JSON.stringify({
      type: 'webauthn.create',
      challenge: options.challenge,
      origin: 'https://evil.com',
    })).toString('base64url');

    const credential: RegistrationCredential = {
      id: 'cred-abc',
      rawId: 'raw-cred-abc',
      response: {
        clientDataJSON,
        attestationObject: 'mock-attestation',
      },
      type: 'public-key',
    };

    const result = await service.verifyRegistration(credential, options.challenge);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('Origin 不匹配');
    }
  });

  function createMockAuthenticatorData(rpId: string, signCount: number): string {
    const rpIdHash = crypto.createHash('sha256').update(rpId).digest();
    const flags = Buffer.from([0x01]); // userPresent = true
    const signCountBuf = Buffer.alloc(4);
    signCountBuf.writeUInt32BE(signCount, 0);
    return Buffer.concat([rpIdHash, flags, signCountBuf]).toString('base64url');
  }

  it('应验证正确的认证响应', async () => {
    const options = service.generateAuthenticationOptions([{ id: 'cred-1' }]);

    const clientDataJSON = Buffer.from(JSON.stringify({
      type: 'webauthn.get',
      challenge: options.challenge,
      origin: 'http://localhost:3000',
    })).toString('base64url');

    const credential: AuthenticationCredential = {
      id: 'cred-1',
      rawId: 'raw-cred-1',
      response: {
        clientDataJSON,
        authenticatorData: createMockAuthenticatorData('localhost', 1),
        signature: 'mock-signature',
      },
      type: 'public-key',
    };

    const storedCredential = {
      credentialId: 'cred-1',
      userId: 'user-1',
      publicKey: new Uint8Array(0),
      signCount: 0,
      transports: ['internal'] as any,
      createdAt: new Date(),
    };

    const result = await service.verifyAuthentication(credential, options.challenge, storedCredential);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.newSignCount).toBe(1);
    }
  });

  it('应拒绝 userPresent 标志为 false 的认证响应', async () => {
    const options = service.generateAuthenticationOptions([{ id: 'cred-1' }]);

    const clientDataJSON = Buffer.from(JSON.stringify({
      type: 'webauthn.get',
      challenge: options.challenge,
      origin: 'http://localhost:3000',
    })).toString('base64url');

    // flags = 0x00, userPresent = false
    const rpIdHash = crypto.createHash('sha256').update('localhost').digest();
    const flags = Buffer.from([0x00]);
    const signCountBuf = Buffer.alloc(4);
    signCountBuf.writeUInt32BE(1, 0);
    const authenticatorData = Buffer.concat([rpIdHash, flags, signCountBuf]).toString('base64url');

    const credential: AuthenticationCredential = {
      id: 'cred-1',
      rawId: 'raw-cred-1',
      response: {
        clientDataJSON,
        authenticatorData,
        signature: 'mock-signature',
      },
      type: 'public-key',
    };

    const storedCredential = {
      credentialId: 'cred-1',
      userId: 'user-1',
      publicKey: new Uint8Array(0),
      signCount: 0,
      transports: ['internal'] as any,
      createdAt: new Date(),
    };

    const result = await service.verifyAuthentication(credential, options.challenge, storedCredential);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('User not present');
    }
  });

  it('应检测到签名计数器重放攻击', async () => {
    const options = service.generateAuthenticationOptions([{ id: 'cred-1' }]);

    const clientDataJSON = Buffer.from(JSON.stringify({
      type: 'webauthn.get',
      challenge: options.challenge,
      origin: 'http://localhost:3000',
    })).toString('base64url');

    const credential: AuthenticationCredential = {
      id: 'cred-1',
      rawId: 'raw-cred-1',
      response: {
        clientDataJSON,
        authenticatorData: createMockAuthenticatorData('localhost', 5),
        signature: 'mock-signature',
      },
      type: 'public-key',
    };

    // stored signCount 已经是 10，新的 5 < 10，应拒绝
    const storedCredential = {
      credentialId: 'cred-1',
      userId: 'user-1',
      publicKey: new Uint8Array(0),
      signCount: 10,
      transports: ['internal'] as any,
      createdAt: new Date(),
    };

    const result = await service.verifyAuthentication(credential, options.challenge, storedCredential);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('replay');
    }
  });
});

// ==================== RBAC 测试 ====================

describe('RBAC 权限控制', () => {
  let rbac: RBACEngine;
  let guard: AuthorizationGuard;

  beforeEach(() => {
    rbac = new RBACEngine();
    guard = new AuthorizationGuard(rbac);
  });

  it('角色权限应正确继承', () => {
    const guestPerms = rbac.getRolePermissions('guest');
    expect(guestPerms.has('posts:read')).toBe(true);

    const userPerms = rbac.getRolePermissions('user');
    expect(userPerms.has('posts:read')).toBe(true); // 继承自 guest
    expect(userPerms.has('posts:create')).toBe(true);

    const adminPerms = rbac.getRolePermissions('admin');
    expect(adminPerms.has('posts:delete')).toBe(true); // 继承链
    expect(adminPerms.has('users:delete')).toBe(true);
    expect(adminPerms.has('system:config')).toBe(false); // super-admin 才有

    const superAdminPerms = rbac.getRolePermissions('super-admin');
    expect(superAdminPerms.has('system:config')).toBe(true);
    expect(superAdminPerms.has('users:delete')).toBe(true);
  });

  it('应正确检查用户权限', () => {
    const editor: User = { id: 'e1', email: 'e@example.com', roles: ['editor'] };
    expect(rbac.hasPermission(editor, 'posts:update')).toBe(true);
    expect(rbac.hasPermission(editor, 'posts:delete')).toBe(true);
    expect(rbac.hasPermission(editor, 'users:delete')).toBe(false);
  });

  it('应支持直接分配的额外权限', () => {
    const user: User = {
      id: 'u1',
      email: 'u@example.com',
      roles: ['user'],
      permissions: ['system:logs'],
    };
    expect(rbac.hasPermission(user, 'system:logs')).toBe(true);
  });

  it('应正确判断角色层级', () => {
    const admin: User = { id: 'a1', email: 'a@example.com', roles: ['admin'] };
    expect(rbac.hasRoleAtLeast(admin, 'editor')).toBe(true);
    expect(rbac.hasRoleAtLeast(admin, 'admin')).toBe(true);
    expect(rbac.hasRoleAtLeast(admin, 'super-admin')).toBe(false);

    const editor: User = { id: 'e1', email: 'e@example.com', roles: ['editor'] };
    expect(rbac.hasRoleAtLeast(editor, 'admin')).toBe(false);
    expect(rbac.hasRoleAtLeast(editor, 'user')).toBe(true);
  });

  it('应支持资源所有权检查', () => {
    const user: User = { id: 'u1', email: 'u@example.com', roles: ['user'] };
    expect(rbac.isOwner(user, 'u1')).toBe(true);
    expect(rbac.isOwner(user, 'u2')).toBe(false);
  });

  it('应支持组织成员检查', () => {
    const user: User = { id: 'u1', email: 'u@example.com', roles: ['user'], orgId: 'org-a' };
    expect(rbac.isSameOrg(user, 'org-a')).toBe(true);
    expect(rbac.isSameOrg(user, 'org-b')).toBe(false);
  });

  it('守卫应拒绝未认证用户', () => {
    const ctx: RequestContext = { request: { method: 'GET', path: '/api/posts', params: {}, headers: {} } };
    const result = guard.requireAuth(ctx);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('登录');
  });

  it('守卫应检查指定角色', () => {
    const ctx: RequestContext = {
      user: { id: 'u1', email: 'u@example.com', roles: ['user'] },
      request: { method: 'GET', path: '/api/posts', params: {}, headers: {} },
    };

    expect(guard.requireRole('user')(ctx).allowed).toBe(true);
    expect(guard.requireRole('admin')(ctx).allowed).toBe(false);
  });

  it('守卫应检查指定权限', () => {
    const ctx: RequestContext = {
      user: { id: 'u1', email: 'u@example.com', roles: ['user'] },
      request: { method: 'GET', path: '/api/posts', params: {}, headers: {} },
    };

    expect(guard.requirePermission('posts:create')(ctx).allowed).toBe(true);
    expect(guard.requirePermission('posts:delete')(ctx).allowed).toBe(false);
  });

  it('资源所有权守卫应允许所有者或管理员', () => {
    const userCtx: RequestContext = {
      user: { id: 'u1', email: 'u@example.com', roles: ['user'] },
      request: { method: 'GET', path: '/api/posts/1', params: { id: '1' }, headers: {} },
    };

    const ownerCheck = guard.requireOwnerOrAdmin(() => 'u1');
    expect(ownerCheck(userCtx).allowed).toBe(true);

    const nonOwnerCheck = guard.requireOwnerOrAdmin(() => 'u2');
    expect(nonOwnerCheck(userCtx).allowed).toBe(false);

    const adminCtx: RequestContext = {
      user: { id: 'a1', email: 'a@example.com', roles: ['admin'] },
      request: { method: 'GET', path: '/api/posts/1', params: { id: '1' }, headers: {} },
    };
    expect(nonOwnerCheck(adminCtx).allowed).toBe(true);
  });

  it('组合守卫应要求全部通过（combineAll）', () => {
    const ctx: RequestContext = {
      user: { id: 'u1', email: 'u@example.com', roles: ['user'] },
      request: { method: 'GET', path: '/api/posts', params: {}, headers: {} },
    };

    const combined = guard.combineAll(
      guard.requireAuth,
      guard.requirePermission('posts:create')
    );
    expect(combined(ctx).allowed).toBe(true);

    const combinedFail = guard.combineAll(
      guard.requireAuth,
      guard.requirePermission('posts:delete')
    );
    expect(combinedFail(ctx).allowed).toBe(false);
  });

  it('组合守卫应允许任一通过（combineAny）', () => {
    const ctx: RequestContext = {
      user: { id: 'u1', email: 'u@example.com', roles: ['user'] },
      request: { method: 'GET', path: '/api/posts', params: {}, headers: {} },
    };

    const anyPass = guard.combineAny(
      guard.requirePermission('posts:delete'),
      guard.requirePermission('posts:create')
    );
    expect(anyPass(ctx).allowed).toBe(true);
  });

  it('框架适配器应生成 Hono 中间件', () => {
    const honoRbac = createHonoRBAC(rbac);
    expect(honoRbac.rbac).toBe(rbac);
    expect(honoRbac.guard).toBeInstanceOf(AuthorizationGuard);
    expect(typeof honoRbac.requirePermission).toBe('function');
  });

  it('框架适配器应生成 Express 中间件', () => {
    const expressRbac = createExpressRBAC(rbac);
    expect(expressRbac.rbac).toBe(rbac);
    expect(expressRbac.guard).toBeInstanceOf(AuthorizationGuard);
    expect(typeof expressRbac.requirePermission).toBe('function');
  });
});

// ==================== better-auth 配置测试 ====================

describe('better-auth 配置', () => {
  it('createAuthWithDrizzle 应返回带有配置的对象', () => {
    const mockDb = { query: {}, select: {}, insert: {}, update: {}, delete: {} };
    const auth = createAuthWithDrizzle(mockDb as any);

    expect(auth).toBeDefined();
    expect(auth.config).toBeDefined();
  });

  it('createAuthWithPrisma 应返回带有配置的对象', () => {
    const mockPrisma = { user: {}, session: {}, account: {}, verification: {} };
    const auth = createAuthWithPrisma(mockPrisma as any);

    expect(auth).toBeDefined();
    expect(auth.config).toBeDefined();
  });

  it('应包含预期的中文错误消息', () => {
    expect(authErrorMessages['user_already_exists']).toBe('该邮箱已被注册');
    expect(authErrorMessages['invalid_email_or_password']).toBe('邮箱或密码错误');
    expect(authErrorMessages['session_expired']).toBe('会话已过期，请重新登录');
    expect(authErrorMessages['two_factor_required']).toBe('需要二次验证');
  });
});
