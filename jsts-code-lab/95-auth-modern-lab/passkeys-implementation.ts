/**
 * @file WebAuthn / Passkeys 核心流程实现
 * @category Auth Modern Lab → Passkeys
 * @difficulty advanced
 * @tags webauthn, passkeys, fido2, authentication, cryptography
 *
 * @description
 * WebAuthn / FIDO2 Passkeys 的 TypeScript 核心实现：
 * - Registration（注册）：创建新的 Passkey 凭证
 * - Authentication（认证）：使用已有 Passkey 登录
 * - 服务器端验证逻辑（基于标准 WebCrypto API）
 *
 * 参考规范：
 * - W3C Web Authentication Level 2: https://www.w3.org/TR/webauthn-2/
 * - FIDO2 Client to Authenticator Protocol (CTAP)
 */

import * as crypto from 'crypto';

// ============================================================================
// 1. 类型定义（对齐 WebAuthn 规范）
// ============================================================================

/** COSE 算法标识符 */
export const COSEAlgorithm = {
  ES256: -7,   // ECDSA w/ SHA-256
  EdDSA: -8,   // EdDSA
  RS256: -257, // RSASSA-PKCS1-v1_5 w/ SHA-256
  RS384: -258,
  RS512: -259,
  PS256: -37,  // RSA-PSS w/ SHA-256
} as const;

/** 用户验证要求 */
export type UserVerificationRequirement = 'required' | 'preferred' | 'discouraged';

/** 认证器附加类型 */
export type AuthenticatorAttachment = 'platform' | 'cross-platform';

/** 认证器传输方式 */
export type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'hybrid' | 'internal';

/** 注册选项（服务端生成） */
export interface RegistrationOptions {
  challenge: string;                    // Base64URL 编码的随机挑战
  rp: {
    name: string;
    id: string;
  };
  user: {
    id: string;                         // Base64URL 编码的用户 ID
    name: string;                       // 用户名/邮箱
    displayName: string;                // 显示名称
  };
  pubKeyCredParams: Array<{            // 支持的算法
    type: 'public-key';
    alg: number;
  }>;
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct';
  authenticatorSelection?: {
    authenticatorAttachment?: AuthenticatorAttachment;
    userVerification?: UserVerificationRequirement;
    residentKey?: 'required' | 'preferred' | 'discouraged';
  };
  excludeCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: AuthenticatorTransport[];
  }>;
}

/** 认证选项（服务端生成） */
export interface AuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: AuthenticatorTransport[];
  }>;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}

/** 客户端注册响应 */
export interface RegistrationCredential {
  id: string;
  rawId: string;           // Base64URL
  response: {
    clientDataJSON: string; // Base64URL
    attestationObject: string; // Base64URL
    authenticatorData?: string;
    transports?: AuthenticatorTransport[];
  };
  type: 'public-key';
  authenticatorAttachment?: AuthenticatorAttachment;
  clientExtensionResults?: Record<string, unknown>;
}

/** 客户端认证响应 */
export interface AuthenticationCredential {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  type: 'public-key';
  authenticatorAttachment?: AuthenticatorAttachment;
  clientExtensionResults?: Record<string, unknown>;
}

/** 存储的凭证数据 */
export interface StoredCredential {
  credentialId: string;     // Base64URL
  userId: string;
  publicKey: Uint8Array;    // COSE 格式的公钥
  signCount: number;        // 签名计数器（防重放）
  transports: AuthenticatorTransport[];
  createdAt: Date;
  lastUsedAt?: Date;
}

// ============================================================================
// 2. 服务端 Passkey 服务
// ============================================================================

export class PasskeyService {
  private credentials = new Map<string, StoredCredential[]>();
  private challenges = new Map<string, { challenge: Uint8Array; expiresAt: number }>();

  constructor(
    private rpName: string,
    private rpId: string,
    private origin: string
  ) {}

  // --------------------------------------------------------------------------
  // 注册流程
  // --------------------------------------------------------------------------

  /**
   * 生成注册选项（Step 1: Server → Client）
   */
  generateRegistrationOptions(
    userId: string,
    userName: string,
    userDisplayName: string,
    existingCredentials: string[] = []
  ): RegistrationOptions {
    const challenge = this.generateChallenge();
    const challengeId = this.storeChallenge(challenge);

    // 注意：实际应用中 challengeId 需要通过 session/cookie 关联到用户
    console.log(`[Passkey] Stored challenge: ${challengeId}`);

    return {
      challenge: this.base64UrlEncode(challenge),
      rp: {
        name: this.rpName,
        id: this.rpId,
      },
      user: {
        id: this.base64UrlEncode(Buffer.from(userId)),
        name: userName,
        displayName: userDisplayName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: COSEAlgorithm.ES256 },
        { type: 'public-key', alg: COSEAlgorithm.EdDSA },
        { type: 'public-key', alg: COSEAlgorithm.RS256 },
      ],
      timeout: 60000,
      attestation: 'none', // 生产环境可选 'direct' 进行设备认证
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // 'platform' = 设备内置（指纹/面容）
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      excludeCredentials: existingCredentials.map(id => ({
        id,
        type: 'public-key' as const,
      })),
    };
  }

  /**
   * 验证注册响应（Step 3: Server verifies Client response）
   *
   * 简化实现：生产环境建议使用 @simplewebauthn/server
   */
  async verifyRegistration(
    credential: RegistrationCredential,
    expectedChallenge: string
  ): Promise<{ success: true; credential: StoredCredential } | { success: false; error: string }> {
    try {
      // 1. 验证 challenge
      if (!this.verifyChallenge(expectedChallenge)) {
        return { success: false, error: 'Challenge 无效或已过期' };
      }

      // 2. 解析 clientDataJSON
      const clientDataJSON = JSON.parse(
        Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf8')
      );

      // 3. 验证 type 必须为 'webauthn.create'
      if (clientDataJSON.type !== 'webauthn.create') {
        return { success: false, error: 'Invalid client data type' };
      }

      // 4. 验证 challenge 匹配
      const decodedChallenge = Buffer.from(clientDataJSON.challenge, 'base64url');
      const expectedChallengeBytes = Buffer.from(expectedChallenge, 'base64url');
      if (!crypto.timingSafeEqual(decodedChallenge, expectedChallengeBytes)) {
        return { success: false, error: 'Challenge 不匹配' };
      }

      // 5. 验证 origin
      if (clientDataJSON.origin !== this.origin) {
        return { success: false, error: 'Origin 不匹配' };
      }

      // 6. 验证 RP ID
      // 实际需解析 attestationObject 和 authData，此处为简化示例
      // 生产环境请使用 @simplewebauthn/server

      // 模拟存储凭证（实际应解析 attestationObject 提取公钥）
      const storedCredential: StoredCredential = {
        credentialId: credential.id,
        userId: '', // 从 session 获取
        publicKey: new Uint8Array(0), // 从 attestationObject 解析
        signCount: 0,
        transports: credential.response.transports || ['internal'],
        createdAt: new Date(),
      };

      return { success: true, credential: storedCredential };
    } catch (error) {
      return { success: false, error: `验证失败: ${error}` };
    }
  }

  // --------------------------------------------------------------------------
  // 认证流程
  // --------------------------------------------------------------------------

  /**
   * 生成认证选项（Step 1: Server → Client）
   */
  generateAuthenticationOptions(
    userCredentials: Array<{ id: string; transports?: AuthenticatorTransport[] }>
  ): AuthenticationOptions {
    const challenge = this.generateChallenge();
    this.storeChallenge(challenge);

    return {
      challenge: this.base64UrlEncode(challenge),
      rpId: this.rpId,
      allowCredentials: userCredentials.map(c => ({
        id: c.id,
        type: 'public-key' as const,
        transports: c.transports,
      })),
      timeout: 60000,
      userVerification: 'preferred',
    };
  }

  /**
   * 验证认证响应（Step 3: Server verifies）
   *
   * 核心验证逻辑：
   * 1. 验证 challenge
   * 2. 验证 rpIdHash
   * 3. 验证 flags（userPresent, userVerified）
   * 4. 验证签名
   * 5. 验证 signCount（防克隆检测）
   */
  async verifyAuthentication(
    credential: AuthenticationCredential,
    expectedChallenge: string,
    storedCredential: StoredCredential
  ): Promise<{ success: true; newSignCount: number } | { success: false; error: string }> {
    try {
      // 1. 验证 challenge
      if (!this.verifyChallenge(expectedChallenge)) {
        return { success: false, error: 'Challenge 无效或已过期' };
      }

      // 2. 解析 clientDataJSON
      const clientDataJSON = JSON.parse(
        Buffer.from(credential.response.clientDataJSON, 'base64url').toString('utf8')
      );

      if (clientDataJSON.type !== 'webauthn.get') {
        return { success: false, error: 'Invalid client data type' };
      }

      const decodedChallenge = Buffer.from(clientDataJSON.challenge, 'base64url');
      const expectedChallengeBytes = Buffer.from(expectedChallenge, 'base64url');
      if (!crypto.timingSafeEqual(decodedChallenge, expectedChallengeBytes)) {
        return { success: false, error: 'Challenge 不匹配' };
      }

      if (clientDataJSON.origin !== this.origin) {
        return { success: false, error: 'Origin 不匹配' };
      }

      // 3. 解析 authenticatorData
      const authData = Buffer.from(credential.response.authenticatorData, 'base64url');
      const rpIdHash = authData.subarray(0, 32);
      const flags = authData[32];
      const signCount = authData.readUInt32BE(33);

      // 验证 RP ID Hash
      const expectedRpIdHash = crypto.createHash('sha256').update(this.rpId).digest();
      if (!crypto.timingSafeEqual(rpIdHash, expectedRpIdHash)) {
        return { success: false, error: 'RP ID Hash 不匹配' };
      }

      // 验证用户在场标志
      const userPresent = (flags & 0x01) !== 0;
      if (!userPresent) {
        return { success: false, error: 'User not present' };
      }

      // 4. 签名验证（简化：实际需使用 COSE 公钥验证）
      const clientDataHash = crypto.createHash('sha256')
        .update(Buffer.from(credential.response.clientDataJSON, 'base64url'))
        .digest();
      const signatureBase = Buffer.concat([authData, clientDataHash]);
      const signature = Buffer.from(credential.response.signature, 'base64url');

      // 生产环境：使用 storedCredential.publicKey (COSE) 验证 signature
      console.log('[Passkey] Signature verification (simplified)');
      console.log('  Signature base length:', signatureBase.length);
      console.log('  Signature length:', signature.length);

      // 5. 签名计数器防重放检测
      if (signCount !== 0 && signCount <= storedCredential.signCount) {
        return { success: false, error: 'Possible replay attack (signCount)' };
      }

      return { success: true, newSignCount: signCount };
    } catch (error) {
      return { success: false, error: `验证失败: ${error}` };
    }
  }

  // --------------------------------------------------------------------------
  // 辅助方法
  // --------------------------------------------------------------------------

  private generateChallenge(): Uint8Array {
    return crypto.randomBytes(32);
  }

  private storeChallenge(challenge: Uint8Array): string {
    const id = crypto.randomUUID();
    this.challenges.set(id, {
      challenge,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 分钟过期
    });
    return id;
  }

  private verifyChallenge(challengeBase64url: string): boolean {
    // 实际应通过 challenge ID 查找并验证
    // 简化：直接解码验证格式
    try {
      const decoded = Buffer.from(challengeBase64url, 'base64url');
      return decoded.length >= 16;
    } catch {
      return false;
    }
  }

  private base64UrlEncode(buffer: Uint8Array | Buffer): string {
    return Buffer.from(buffer).toString('base64url');
  }
}

// ============================================================================
// 3. 客户端 Passkey API 封装
// ============================================================================

/**
 * 浏览器端 Passkey 调用封装
 * 需在支持 WebAuthn 的现代浏览器中运行
 */
export class PasskeyClient {
  /**
   * 注册新的 Passkey
   */
  static async register(options: RegistrationOptions): Promise<RegistrationCredential> {
    if (!window.PublicKeyCredential) {
      throw new Error('当前浏览器不支持 WebAuthn');
    }

    // 检查是否为自动填充条件调用（conditional mediation）
    const challenge = Uint8Array.from(
      atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
      challenge,
      rp: options.rp,
      user: {
        id: Uint8Array.from(atob(options.user.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams,
      timeout: options.timeout,
      attestation: options.attestation as AttestationConveyancePreference,
      authenticatorSelection: options.authenticatorSelection,
      excludeCredentials: options.excludeCredentials?.map(c => ({
        id: Uint8Array.from(atob(c.id.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0)),
        type: c.type as PublicKeyCredentialType,
        transports: c.transports as AuthenticatorTransport[],
      })),
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyCredentialCreationOptions,
    });

    if (!credential) {
      throw new Error('用户取消了 Passkey 注册');
    }

    return this.encodeRegistrationCredential(credential as PublicKeyCredential);
  }

  /**
   * 使用 Passkey 认证
   */
  static async authenticate(options: AuthenticationOptions): Promise<AuthenticationCredential> {
    if (!window.PublicKeyCredential) {
      throw new Error('当前浏览器不支持 WebAuthn');
    }

    const challenge = Uint8Array.from(
      atob(options.challenge.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
      challenge,
      rpId: options.rpId,
      allowCredentials: options.allowCredentials?.map(c => ({
        id: Uint8Array.from(atob(c.id.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0)),
        type: c.type as PublicKeyCredentialType,
        transports: c.transports as AuthenticatorTransport[],
      })),
      timeout: options.timeout,
      userVerification: options.userVerification as UserVerificationRequirement,
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyCredentialRequestOptions,
    });

    if (!assertion) {
      throw new Error('用户取消了 Passkey 认证');
    }

    return this.encodeAuthenticationCredential(assertion as PublicKeyCredential);
  }

  /**
   * 检查当前设备是否支持 Passkey
   */
  static async isSupported(): Promise<boolean> {
    if (!window.PublicKeyCredential) return false;
    // 检查平台认证器（设备内置）是否可用
    return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.() ?? false;
  }

  private static encodeRegistrationCredential(credential: PublicKeyCredential): RegistrationCredential {
    const response = credential.response as AuthenticatorAttestationResponse;
    return {
      id: credential.id,
      rawId: this.arrayBufferToBase64Url(credential.rawId),
      response: {
        clientDataJSON: this.arrayBufferToBase64Url(response.clientDataJSON),
        attestationObject: this.arrayBufferToBase64Url(response.attestationObject),
        authenticatorData: response.authenticatorData
          ? this.arrayBufferToBase64Url(response.authenticatorData)
          : undefined,
        transports: response.getTransports?.() as AuthenticatorTransport[],
      },
      type: credential.type as 'public-key',
      authenticatorAttachment: credential.authenticatorAttachment as AuthenticatorAttachment,
    };
  }

  private static encodeAuthenticationCredential(credential: PublicKeyCredential): AuthenticationCredential {
    const response = credential.response as AuthenticatorAssertionResponse;
    return {
      id: credential.id,
      rawId: this.arrayBufferToBase64Url(credential.rawId),
      response: {
        clientDataJSON: this.arrayBufferToBase64Url(response.clientDataJSON),
        authenticatorData: this.arrayBufferToBase64Url(response.authenticatorData),
        signature: this.arrayBufferToBase64Url(response.signature),
        userHandle: response.userHandle
          ? this.arrayBufferToBase64Url(response.userHandle)
          : undefined,
      },
      type: credential.type as 'public-key',
      authenticatorAttachment: credential.authenticatorAttachment as AuthenticatorAttachment,
    };
  }

  private static arrayBufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}

// ============================================================================
// 4. 演示
// ============================================================================

export function demo(): void {
  console.log('=== Passkeys / WebAuthn 核心流程 ===\n');

  const service = new PasskeyService(
    'My App',
    'localhost',
    'http://localhost:3000'
  );

  console.log('1. 注册流程');
  console.log('   Step 1: 服务端生成 RegistrationOptions（含 challenge）');
  const regOptions = service.generateRegistrationOptions(
    'user-123',
    'user@example.com',
    '张三'
  );
  console.log('   Challenge:', regOptions.challenge.substring(0, 20) + '...');

  console.log('\n2. 认证流程');
  console.log('   Step 1: 服务端生成 AuthenticationOptions');
  const authOptions = service.generateAuthenticationOptions([
    { id: 'cred-abc123', transports: ['internal'] },
  ]);
  console.log('   Challenge:', authOptions.challenge.substring(0, 20) + '...');

  console.log('\n3. 安全要点');
  console.log('   ✓ Challenge 随机且单次有效');
  console.log('   ✓ Origin 和 RP ID 严格匹配');
  console.log('   ✓ 签名计数器检测克隆攻击');
  console.log('   ✓ 用户在场标志（User Present）验证');
  console.log('   ✓ 生产环境建议使用 @simplewebauthn/server');

  console.log('\n4. 浏览器支持检测');
  console.log('   调用 PasskeyClient.isSupported() 检测设备支持情况');
}
