/**
 * @file 现代 OAuth 2.1 + PKCE 实现
 * @category Auth Modern Lab → OAuth2
 * @difficulty advanced
 * @tags oauth2, pkce, authorization-code, security, jwt
 *
 * @description
 * 符合 OAuth 2.1 草案标准的授权码流程实现，包含：
 * - PKCE（Proof Key for Code Exchange）完整流程
 * - 状态参数防 CSRF
 * - 安全的 Token 交换与存储
 * - JWT ID Token 验证（OIDC）
 *
 * 规范参考：
 * - RFC 7636: PKCE
 * - OAuth 2.1 Draft: https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1
 * - OpenID Connect Core 1.0
 */

import * as crypto from 'crypto';

// ============================================================================
// 1. 类型定义
// ============================================================================

/** PKCE 参数对 */
export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

/** OAuth2 授权请求参数 */
export interface AuthorizationRequest {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
  responseType: 'code';
  additionalParams?: Record<string, string>;
}

/** Token 响应 */
export interface TokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string; // OIDC
}

/** Token 交换请求 */
export interface TokenExchangeRequest {
  clientId: string;
  clientSecret?: string; // 机密客户端需要
  redirectUri: string;
  code: string;
  codeVerifier: string;
}

/** OIDC ID Token 载荷（简化） */
export interface IDTokenPayload {
  iss: string;           // 签发者
  sub: string;           // 用户唯一标识
  aud: string;           // 受众（client_id）
  exp: number;           // 过期时间
  iat: number;           // 签发时间
  nonce?: string;        // 防重放
  name?: string;
  email?: string;
  picture?: string;
  [key: string]: unknown;
}

/** 存储的授权会话 */
interface AuthSession {
  state: string;
  nonce?: string;
  codeVerifier: string;
  redirectUri: string;
  provider: string;
  expiresAt: number;
}

// ============================================================================
// 2. PKCE 生成器
// ============================================================================

/**
 * PKCE（Proof Key for Code Exchange）参数生成
 *
 * 安全原理：
 * - code_verifier：高熵随机字符串（43-128 字符）
 * - code_challenge：code_verifier 的 SHA256 哈希（Base64URL）
 * - 授权请求只发送 challenge，Token 交换时发送原始 verifier
 * - 攻击者拦截授权码后无法构造 verifier，无法换取 Token
 */
export class PKCEGenerator {
  /**
   * 生成 PKCE 参数对
   */
  static generate(): PKCEPair {
    // code_verifier: 43-128 字符的 [A-Za-z0-9-._~]
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256',
    };
  }

  /**
   * 验证 code_verifier 是否匹配 code_challenge
   */
  static verify(codeVerifier: string, codeChallenge: string): boolean {
    const expectedChallenge = this.generateCodeChallenge(codeVerifier);
    return crypto.timingSafeEqual(
      Buffer.from(codeChallenge),
      Buffer.from(expectedChallenge)
    );
  }

  private static generateCodeVerifier(): string {
    // 32 bytes = 256 bits entropy，Base64URL 编码后为 43 字符
    return crypto.randomBytes(32).toString('base64url');
  }

  private static generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }
}

// ============================================================================
// 3. OAuth2 客户端
// ============================================================================

/**
 * 标准 OAuth 2.1 授权码 + PKCE 客户端
 *
 * 使用场景：
 * - SPA（单页应用）
 * - 移动端应用
 * - 桌面应用
 * - 任何无法安全存储 client_secret 的公共客户端
 */
export class OAuth2Client {
  private sessions = new Map<string, AuthSession>();

  constructor(
    private config: {
      clientId: string;
      clientSecret?: string; // 仅机密客户端需要
      authorizationEndpoint: string;
      tokenEndpoint: string;
      redirectUri: string;
      scopes: string[];
    }
  ) {}

  /**
   * 生成授权 URL（Step 1: 引导用户到授权服务器）
   */
  createAuthorizationUrl(options?: {
    provider?: string;
    additionalParams?: Record<string, string>;
    useNonce?: boolean; // OIDC nonce
  }): { url: string; state: string; sessionId: string } {
    const pkce = PKCEGenerator.generate();
    const state = this.generateState();
    const nonce = options?.useNonce ? this.generateNonce() : undefined;
    const sessionId = crypto.randomUUID();

    // 存储会话状态（生产环境应使用加密 Cookie / Redis）
    this.sessions.set(sessionId, {
      state,
      nonce,
      codeVerifier: pkce.codeVerifier,
      redirectUri: this.config.redirectUri,
      provider: options?.provider || 'default',
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 分钟过期
    });

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      state,
      code_challenge: pkce.codeChallenge,
      code_challenge_method: 'S256',
      ...(nonce ? { nonce } : {}),
      ...(options?.additionalParams || {}),
    });

    const url = `${this.config.authorizationEndpoint}?${params.toString()}`;

    return { url, state, sessionId };
  }

  /**
   * 处理回调并交换 Token（Step 2-3）
   */
  async handleCallback(
    sessionId: string,
    code: string,
    state: string,
    options?: {
      validateIdToken?: boolean;
      expectedIssuer?: string;
    }
  ): Promise<{
    success: true;
    tokens: TokenResponse;
    idTokenPayload?: IDTokenPayload;
  } | {
    success: false;
    error: string;
  }> {
    // 1. 验证会话存在且未过期
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found or expired' };
    }

    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return { success: false, error: 'Authorization session expired' };
    }

    // 2. 验证 state 防 CSRF
    if (!crypto.timingSafeEqual(Buffer.from(state), Buffer.from(session.state))) {
      return { success: false, error: 'State mismatch (CSRF detected)' };
    }

    // 3. 清理已使用的会话
    this.sessions.delete(sessionId);

    // 4. 交换 Token
    const tokenResult = await this.exchangeCodeForTokens({
      clientId: this.config.clientId,
      clientSecret: this.config.clientSecret,
      redirectUri: session.redirectUri,
      code,
      codeVerifier: session.codeVerifier,
    });

    if (!tokenResult.success) {
      return tokenResult;
    }

    // 5. 可选：验证 OIDC ID Token
    let idTokenPayload: IDTokenPayload | undefined;
    if (options?.validateIdToken && tokenResult.tokens.id_token) {
      const validation = await this.validateIDToken(
        tokenResult.tokens.id_token,
        session.nonce,
        options.expectedIssuer
      );
      if (!validation.valid) {
        return { success: false, error: `ID Token invalid: ${validation.error}` };
      }
      idTokenPayload = validation.payload;
    }

    return {
      success: true,
      tokens: tokenResult.tokens,
      idTokenPayload,
    };
  }

  /**
   * 使用 Refresh Token 获取新 Access Token
   */
  async refreshAccessToken(
    refreshToken: string
  ): Promise<{
    success: true;
    tokens: TokenResponse;
  } | {
    success: false;
    error: string;
  }> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: this.config.clientId,
      ...(this.config.clientSecret ? { client_secret: this.config.clientSecret } : {}),
    });

    try {
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: `Token refresh failed: ${error}` };
      }

      const tokens = await response.json() as TokenResponse;
      return { success: true, tokens };
    } catch (err) {
      return { success: false, error: `Network error: ${err}` };
    }
  }

  // --------------------------------------------------------------------------
  // 私有方法
  // --------------------------------------------------------------------------

  private async exchangeCodeForTokens(
    request: TokenExchangeRequest
  ): Promise<{
    success: true;
    tokens: TokenResponse;
  } | {
    success: false;
    error: string;
  }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: request.clientId,
      redirect_uri: request.redirectUri,
      code: request.code,
      code_verifier: request.codeVerifier,
      ...(request.clientSecret ? { client_secret: request.clientSecret } : {}),
    });

    try {
      const response = await fetch(this.config.tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        return { success: false, error: `Token exchange failed: ${errorBody}` };
      }

      const tokens = await response.json() as TokenResponse;

      // 基本验证
      if (!tokens.access_token || tokens.token_type !== 'Bearer') {
        return { success: false, error: 'Invalid token response' };
      }

      return { success: true, tokens };
    } catch (err) {
      return { success: false, error: `Network error: ${err}` };
    }
  }

  /**
   * 简化版 ID Token 验证（无签名验证）
   * 生产环境应使用 jose 库进行完整 JWT 验证
   */
  private async validateIDToken(
    idToken: string,
    expectedNonce?: string,
    expectedIssuer?: string
  ): Promise<{ valid: true; payload: IDTokenPayload } | { valid: false; error: string }> {
    try {
      const [headerB64, payloadB64] = idToken.split('.');
      if (!headerB64 || !payloadB64) {
        return { valid: false, error: 'Malformed JWT' };
      }

      const payload = JSON.parse(
        Buffer.from(payloadB64, 'base64url').toString('utf8')
      ) as IDTokenPayload;

      // 验证过期时间
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, error: 'ID Token expired' };
      }

      // 验证受众
      if (payload.aud !== this.config.clientId) {
        return { valid: false, error: 'Invalid audience' };
      }

      // 验证签发者
      if (expectedIssuer && payload.iss !== expectedIssuer) {
        return { valid: false, error: 'Invalid issuer' };
      }

      // 验证 nonce（防重放）
      if (expectedNonce && payload.nonce !== expectedNonce) {
        return { valid: false, error: 'Nonce mismatch' };
      }

      return { valid: true, payload };
    } catch (err) {
      return { valid: false, error: `Validation error: ${err}` };
    }
  }

  private generateState(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  private generateNonce(): string {
    return crypto.randomBytes(16).toString('base64url');
  }
}

// ============================================================================
// 4. 安全工具
// ============================================================================

/**
 * OAuth2 安全工具集
 */
export class OAuth2Security {
  /**
   * 验证 redirect_uri 是否在允许列表中
   * 防止授权码注入攻击
   */
  static validateRedirectUri(uri: string, allowedUris: string[]): boolean {
    // 精确匹配（不允许通配符或子路径匹配）
    return allowedUris.includes(uri);
  }

  /**
   * 解析并验证 scope 字符串
   */
  static parseScopes(scopeString: string): string[] {
    return scopeString.split(' ').filter(s => s.length > 0);
  }

  /**
   * 检查 scope 是否包含必需权限
   */
  static hasScopes(granted: string[], required: string[]): boolean {
    const grantedSet = new Set(granted);
    return required.every(s => grantedSet.has(s));
  }

  /**
   * 计算 Token 过期时间
   */
  static calculateExpiry(expiresIn: number): Date {
    return new Date(Date.now() + expiresIn * 1000);
  }

  /**
   * 安全存储 Token 的建议策略
   */
  static getStorageRecommendation(): Record<string, string> {
    return {
      accessToken: '内存（运行时变量）',
      refreshToken: 'HttpOnly Secure SameSite=Strict Cookie',
      idToken: '内存（不持久化）',
      codeVerifier: '内存 / 加密 Cookie（授权流程期间）',
    };
  }
}

// ============================================================================
// 5. 演示
// ============================================================================

export function demo(): void {
  console.log('=== OAuth 2.1 + PKCE 现代实现 ===\n');

  // 1. PKCE 生成
  console.log('1. PKCE 参数生成');
  const pkce = PKCEGenerator.generate();
  console.log('   Code Verifier:', pkce.codeVerifier.substring(0, 30) + '...');
  console.log('   Code Challenge:', pkce.codeChallenge.substring(0, 30) + '...');
  console.log('   Method:', pkce.codeChallengeMethod);

  // 2. 验证 PKCE
  console.log('\n2. PKCE 验证');
  const valid = PKCEGenerator.verify(pkce.codeVerifier, pkce.codeChallenge);
  console.log('   Verification:', valid ? '✅ 通过' : '❌ 失败');

  // 3. OAuth2 客户端配置
  console.log('\n3. OAuth2 客户端');
  const client = new OAuth2Client({
    clientId: 'my-app-client-id',
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    tokenEndpoint: 'https://github.com/login/oauth/access_token',
    redirectUri: 'http://localhost:3000/auth/callback',
    scopes: ['read:user', 'user:email'],
  });

  const { url, state } = client.createAuthorizationUrl();
  console.log('   Authorization URL 生成完成');
  console.log('   State:', state.substring(0, 20) + '...');

  // 4. Token 安全存储建议
  console.log('\n4. Token 安全存储建议');
  const recommendations = OAuth2Security.getStorageRecommendation();
  for (const [key, value] of Object.entries(recommendations)) {
    console.log(`   ${key}: ${value}`);
  }

  console.log('\n5. 安全要点');
  console.log('   ✓ 所有公共客户端必须使用 PKCE');
  console.log('   ✓ State 参数强制使用（防 CSRF）');
  console.log('   ✓ 精确匹配 redirect_uri（无通配符）');
  console.log('   ✓ Refresh Token 存储在 HttpOnly Cookie');
  console.log('   ✓ Access Token 不持久化（内存存储）');
  console.log('   ✓ OIDC 场景使用 nonce 防重放');
}
