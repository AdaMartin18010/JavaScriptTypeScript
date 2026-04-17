/**
 * @file 请求签名验证器（HMAC 简化）
 * @category Cybersecurity → Request Signing
 * @difficulty medium
 * @tags hmac, request-signature, api-security, replay-attack, tamper-proof
 *
 * @description
 * 实现基于 HMAC-SHA256 的 API 请求签名与验证机制：
 * - 请求签名生成（canonical request + HMAC）
 * - 时间戳防重放攻击
 * - Nonce 唯一性校验
 * - 签名版本控制
 */

import { createHmac, timingSafeEqual } from 'crypto';

// ============================================================================
// 类型定义
// ============================================================================

/** 签名版本 */
export type SignatureVersion = 'v1';

/** 签名方法 */
export type SignatureMethod = 'HMAC-SHA256';

/** 签名参数 */
export interface SignatureParams {
  /** 访问密钥 ID */
  accessKeyId: string;
  /** 签名版本 */
  version: SignatureVersion;
  /** 签名方法 */
  method: SignatureMethod;
  /** 时间戳（ISO 8601） */
  timestamp: string;
  /** 随机数（防止重放） */
  nonce: string;
  /** 签名值 */
  signature: string;
}

/** 规范化请求组件 */
export interface CanonicalRequest {
  /** HTTP 方法 */
  httpMethod: string;
  /** URI 路径 */
  uri: string;
  /** 查询参数（已排序） */
  queryString: string;
  /** 请求头（已排序） */
  headers: Record<string, string>;
  /** 请求体哈希 */
  bodyHash: string;
}

/** 签名配置 */
export interface SignerOptions {
  /** 签名密钥 */
  secretKey: string;
  /** 访问密钥 ID */
  accessKeyId: string;
  /** 签名有效期（毫秒），默认 5 分钟 */
  maxAgeMs?: number;
  /** 是否要求 nonce */
  requireNonce?: boolean;
}

/** 验证结果 */
export interface VerificationResult {
  /** 验证是否通过 */
  valid: boolean;
  /** 错误信息 */
  error?: string;
  /** 计算出的签名（用于调试） */
  computedSignature?: string;
}

// ============================================================================
// 请求签名器
// ============================================================================

/**
 * HMAC 请求签名器
 *
 * 基于 AWS Signature Version 4 的简化实现，为 API 请求提供：
 * 1. 身份认证：通过密钥对确认请求方身份
 * 2. 数据完整性：任何请求参数的修改都会导致签名不匹配
 * 3. 防重放攻击：通过时间戳 + nonce 限制签名的有效时间和唯一性
 */
export class RequestSigner {
  private readonly secretKey: string;
  private readonly accessKeyId: string;
  private readonly maxAgeMs: number;
  private readonly requireNonce: boolean;
  private readonly usedNonces = new Set<string>();

  constructor(options: SignerOptions) {
    if (!options.secretKey || options.secretKey.length < 16) {
      throw new Error('Secret key must be at least 16 characters');
    }
    if (!options.accessKeyId) {
      throw new Error('Access key ID is required');
    }

    this.secretKey = options.secretKey;
    this.accessKeyId = options.accessKeyId;
    this.maxAgeMs = options.maxAgeMs ?? 5 * 60 * 1000; // 5 minutes
    this.requireNonce = options.requireNonce ?? true;
  }

  /**
   * 生成请求签名
   * @param request - 规范化请求
   * @returns 签名参数
   */
  sign(request: CanonicalRequest): SignatureParams {
    const timestamp = new Date().toISOString();
    const nonce = this.generateNonce();
    const signature = this.computeSignature(request, timestamp, nonce);

    return {
      accessKeyId: this.accessKeyId,
      version: 'v1',
      method: 'HMAC-SHA256',
      timestamp,
      nonce,
      signature,
    };
  }

  /**
   * 验证请求签名
   * @param request - 规范化请求
   * @param params - 签名参数
   * @returns 验证结果
   */
  verify(request: CanonicalRequest, params: SignatureParams): VerificationResult {
    // 1. 检查版本
    if (params.version !== 'v1') {
      return { valid: false, error: `Unsupported signature version: ${params.version}` };
    }

    // 2. 检查方法
    if (params.method !== 'HMAC-SHA256') {
      return { valid: false, error: `Unsupported signature method: ${params.method}` };
    }

    // 3. 检查 Access Key ID
    if (params.accessKeyId !== this.accessKeyId) {
      return { valid: false, error: 'Invalid access key ID' };
    }

    // 4. 检查时间戳（防重放）
    const requestTime = new Date(params.timestamp).getTime();
    const now = Date.now();
    if (Number.isNaN(requestTime)) {
      return { valid: false, error: 'Invalid timestamp format' };
    }
    if (Math.abs(now - requestTime) > this.maxAgeMs) {
      return { valid: false, error: 'Request timestamp expired or too far in the future' };
    }

    // 5. 检查 nonce（防重放）
    if (this.requireNonce) {
      if (!params.nonce || params.nonce.length < 8) {
        return { valid: false, error: 'Nonce is required and must be at least 8 characters' };
      }
      if (this.usedNonces.has(params.nonce)) {
        return { valid: false, error: 'Nonce has been used before (replay attack detected)' };
      }
    }

    // 6. 验证签名值
    const computedSignature = this.computeSignature(request, params.timestamp, params.nonce);
    const computedBuf = Buffer.from(computedSignature, 'hex');
    const providedBuf = Buffer.from(params.signature, 'hex');

    if (computedBuf.length !== providedBuf.length) {
      return { valid: false, error: 'Signature mismatch', computedSignature };
    }

    if (!timingSafeEqual(computedBuf, providedBuf)) {
      return { valid: false, error: 'Signature mismatch', computedSignature };
    }

    // 7. 记录 nonce（验证通过后）
    if (this.requireNonce && params.nonce) {
      this.usedNonces.add(params.nonce);
      // 清理过期 nonce（简单策略：超过一定数量时清空）
      if (this.usedNonces.size > 100000) {
        this.usedNonces.clear();
      }
    }

    return { valid: true };
  }

  /**
   * 构建规范化请求字符串
   * @param httpMethod - HTTP 方法
   * @param uri - URI 路径
   * @param queryParams - 查询参数
   * @param headers - 请求头
   * @param body - 请求体
   * @returns 规范化请求
   */
  static buildCanonicalRequest(
    httpMethod: string,
    uri: string,
    queryParams: Record<string, string>,
    headers: Record<string, string>,
    body: string
  ): CanonicalRequest {
    // 对查询参数按键排序并编码
    const sortedQuery = Object.entries(queryParams)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    // 对请求头先小写化再按键排序
    const sortedHeaders: Record<string, string> = {};
    const lowerKeys = Object.keys(headers).map(k => k.toLowerCase()).sort();
    for (const key of lowerKeys) {
      const originalKey = Object.keys(headers).find(k => k.toLowerCase() === key)!;
      sortedHeaders[key] = headers[originalKey].trim();
    }

    // 计算请求体哈希
    const bodyHash = createHmac('sha256', 'canonical-request').update(body).digest('hex');

    return {
      httpMethod: httpMethod.toUpperCase(),
      uri,
      queryString: sortedQuery,
      headers: sortedHeaders,
      bodyHash,
    };
  }

  private computeSignature(request: CanonicalRequest, timestamp: string, nonce: string): string {
    const canonicalString = this.buildCanonicalString(request, timestamp, nonce);
    return createHmac('sha256', this.secretKey).update(canonicalString).digest('hex');
  }

  private buildCanonicalString(request: CanonicalRequest, timestamp: string, nonce: string): string {
    const parts = [
      request.httpMethod,
      request.uri,
      request.queryString,
      // 规范化请求头：key:value\n 形式
      Object.entries(request.headers)
        .map(([k, v]) => `${k}:${v}`)
        .join('\n'),
      request.bodyHash,
      timestamp,
      nonce,
    ];

    return parts.join('\n');
  }

  private generateNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

// ============================================================================
// 便捷工具
// ============================================================================

/**
 * 快速签名 HTTP 请求
 * @param options - 签名配置
 * @param httpMethod - HTTP 方法
 * @param uri - URI 路径
 * @param queryParams - 查询参数
 * @param headers - 请求头
 * @param body - 请求体
 * @returns 签名参数
 */
export function signRequest(
  options: SignerOptions,
  httpMethod: string,
  uri: string,
  queryParams: Record<string, string> = {},
  headers: Record<string, string> = {},
  body = ''
): SignatureParams {
  const signer = new RequestSigner(options);
  const canonical = RequestSigner.buildCanonicalRequest(httpMethod, uri, queryParams, headers, body);
  return signer.sign(canonical);
}

/**
 * 快速验证 HTTP 请求签名
 * @param options - 签名配置
 * @param params - 签名参数
 * @param httpMethod - HTTP 方法
 * @param uri - URI 路径
 * @param queryParams - 查询参数
 * @param headers - 请求头
 * @param body - 请求体
 * @returns 验证结果
 */
export function verifyRequest(
  options: SignerOptions,
  params: SignatureParams,
  httpMethod: string,
  uri: string,
  queryParams: Record<string, string> = {},
  headers: Record<string, string> = {},
  body = ''
): VerificationResult {
  const signer = new RequestSigner(options);
  const canonical = RequestSigner.buildCanonicalRequest(httpMethod, uri, queryParams, headers, body);
  return signer.verify(canonical, params);
}

export function demo(): void {
  console.log('=== 请求签名验证器 ===\n');

  const options: SignerOptions = {
    secretKey: 'my-super-secret-key-12345678',
    accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
    maxAgeMs: 300000,
  };

  const signer = new RequestSigner(options);

  // 构建规范化请求
  const request = RequestSigner.buildCanonicalRequest(
    'POST',
    '/api/users',
    { page: '1', limit: '10' },
    { 'content-type': 'application/json', 'x-custom-header': 'value' },
    '{"name":"Alice"}'
  );

  console.log('规范化请求:');
  console.log('  方法:', request.httpMethod);
  console.log('  URI:', request.uri);
  console.log('  查询:', request.queryString);
  console.log('  请求头:', JSON.stringify(request.headers));
  console.log('  体哈希:', request.bodyHash.slice(0, 16) + '...');

  // 签名
  const signature = signer.sign(request);
  console.log('\n生成的签名参数:');
  console.log('  AccessKeyId:', signature.accessKeyId);
  console.log('  Version:', signature.version);
  console.log('  Method:', signature.method);
  console.log('  Timestamp:', signature.timestamp);
  console.log('  Nonce:', signature.nonce);
  console.log('  Signature:', signature.signature.slice(0, 32) + '...');

  // 验证
  const verification = signer.verify(request, signature);
  console.log('\n验证结果:', verification.valid ? '✓ 通过' : '✗ 失败');
  if (!verification.valid) {
    console.log('  错误:', verification.error);
  }

  // 尝试重放攻击
  console.log('\n--- 重放攻击检测 ---');
  const replayResult = signer.verify(request, signature);
  console.log('重放验证:', replayResult.valid ? '通过' : '拒绝');
  if (!replayResult.valid) {
    console.log('  错误:', replayResult.error);
  }

  // 篡改检测
  console.log('\n--- 篡改检测 ---');
  const tamperedRequest = { ...request, uri: '/api/admin' };
  const tamperedResult = signer.verify(tamperedRequest, signature);
  console.log('篡改验证:', tamperedResult.valid ? '通过' : '拒绝');
  if (!tamperedResult.valid) {
    console.log('  错误:', tamperedResult.error);
  }
}
