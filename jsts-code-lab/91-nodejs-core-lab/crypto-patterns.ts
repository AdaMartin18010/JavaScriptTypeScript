/**
 * @file Node.js crypto 模块加密模式
 * @category Node.js Core → Crypto
 * @difficulty medium
 * @tags crypto, hash, hmac, aes-gcm, key-derivation
 */

import crypto from 'node:crypto';
import { promisify } from 'node:util';

const scryptAsync = promisify(crypto.scrypt);

// ============================================================================
// 1. 哈希算法（SHA-256 / SHA-512）
// ============================================================================

/**
 * 计算数据的 SHA-256 哈希值
 * @param data 输入数据
 * @param encoding 输出编码，默认 hex
 */
export function sha256(data: string | Buffer, encoding: crypto.BinaryToTextEncoding = 'hex'): string {
  return crypto.createHash('sha256').update(data).digest(encoding);
}

/**
 * 计算文件的 SHA-256 哈希（流式，适合大文件）
 */
export async function sha256File(filePath: string): Promise<string> {
  const { createReadStream } = await import('node:fs');
  const hash = crypto.createHash('sha256');

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath);
    stream.on('data', (chunk: Buffer) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

/**
 * 计算数据的 SHA-512 哈希值
 */
export function sha512(data: string | Buffer, encoding: crypto.BinaryToTextEncoding = 'hex'): string {
  return crypto.createHash('sha512').update(data).digest(encoding);
}

// ============================================================================
// 2. HMAC（消息认证码）
// ============================================================================

/**
 * 使用 HMAC-SHA-256 生成消息认证码
 * @param key 密钥
 * @param data 数据
 */
export function hmacSha256(key: string | Buffer, data: string | Buffer): string {
  return crypto.createHmac('sha256', key).update(data).digest('hex');
}

/**
 * 使用 HMAC-SHA-512 生成消息认证码
 */
export function hmacSha512(key: string | Buffer, data: string | Buffer): string {
  return crypto.createHmac('sha512', key).update(data).digest('hex');
}

// ============================================================================
// 3. AES-256-GCM 加解密（认证加密）
// ============================================================================

export interface AesGcmCipher {
  iv: string;
  authTag: string;
  ciphertext: string;
}

const AES_KEY_SIZE = 32; // 256 bit
const AES_IV_SIZE = 16; // 128 bit
const AES_TAG_SIZE = 16; // 128 bit
const AES_ALGORITHM = 'aes-256-gcm';

/**
 * 使用 AES-256-GCM 加密数据
 * @param plaintext 明文
 * @param key 密钥，必须是 32 字节
 */
export function aesGcmEncrypt(plaintext: string, key: Buffer): AesGcmCipher {
  if (key.length !== AES_KEY_SIZE) {
    throw new Error(`AES-256 密钥必须为 ${AES_KEY_SIZE} 字节，当前 ${key.length} 字节`);
  }

  const iv = crypto.randomBytes(AES_IV_SIZE);
  const cipher = crypto.createCipheriv(AES_ALGORITHM, key, iv);

  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf-8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    ciphertext: ciphertext.toString('hex')
  };
}

/**
 * 使用 AES-256-GCM 解密数据
 */
export function aesGcmDecrypt(cipher: AesGcmCipher, key: Buffer): string {
  if (key.length !== AES_KEY_SIZE) {
    throw new Error(`AES-256 密钥必须为 ${AES_KEY_SIZE} 字节，当前 ${key.length} 字节`);
  }

  const decipher = crypto.createDecipheriv(AES_ALGORITHM, key, Buffer.from(cipher.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(cipher.authTag, 'hex'));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(cipher.ciphertext, 'hex')),
    decipher.final()
  ]);

  return plaintext.toString('utf-8');
}

// ============================================================================
// 4. 密钥派生（scrypt / pbkdf2）
// ============================================================================

export interface DerivedKey {
  key: Buffer;
  salt: string;
}

/**
 * 使用 scrypt 从密码派生密钥（推荐，Node.js 原生优化）
 * @param password 用户密码
 * @param salt 盐值，不提供则自动生成
 * @param keylen 派生密钥长度，默认 32
 */
export async function deriveKeyScrypt(
  password: string,
  salt?: string,
  keylen = AES_KEY_SIZE
): Promise<DerivedKey> {
  const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16);
  const key = await scryptAsync(password, saltBuffer, keylen);
  return { key: key as Buffer, salt: saltBuffer.toString('hex') };
}

/**
 * 使用 pbkdf2 从密码派生密钥（兼容性更好）
 */
export function deriveKeyPbkdf2(
  password: string,
  salt?: string,
  keylen = AES_KEY_SIZE,
  iterations = 600000
): Promise<DerivedKey> {
  const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(16);

  return new Promise((resolve, reject) => {
    crypto.pbkdf2(password, saltBuffer, iterations, keylen, 'sha256', (err, key) => {
      if (err) reject(err);
      else resolve({ key, salt: saltBuffer.toString('hex') });
    });
  });
}

// ============================================================================
// 5. 安全随机数与 Token 生成
// ============================================================================

/**
 * 生成加密安全的随机十六进制字符串
 * @param byteLength 字节长度，默认 32
 */
export function randomHex(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('hex');
}

/**
 * 生成 URL 安全的随机 Token（Base64URL）
 * @param byteLength 字节长度，默认 32
 */
export function randomToken(byteLength = 32): string {
  return crypto.randomBytes(byteLength).toString('base64url');
}

/**
 * 生成 UUID v4（基于随机数）
 */
export function uuidv4(): string {
  return crypto.randomUUID();
}

// ============================================================================
// 6. 密码哈希（argon2 风格的封装，使用 Node.js 原生 scrypt）
// ============================================================================

export interface PasswordHash {
  hash: string;
  salt: string;
}

/**
 * 对密码进行哈希处理，返回可存储的 hash + salt
 * 使用 scrypt，参数：N=16384, r=8, p=1（默认）
 */
export async function hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.randomBytes(16).toString('hex');
  const key = await scryptAsync(password, salt, 64);
  return { hash: (key as Buffer).toString('hex'), salt };
}

/**
 * 验证密码是否与存储的哈希匹配
 */
export async function verifyPassword(password: string, stored: PasswordHash): Promise<boolean> {
  const key = await scryptAsync(password, stored.salt, 64);
  const hashBuffer = Buffer.from(stored.hash, 'hex');
  return crypto.timingSafeEqual(hashBuffer, key as Buffer);
}

// ============================================================================
// Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Crypto 模块实战演示 ===\n');

  // 1. 哈希
  console.log('--- 1. SHA-256 ---');
  const hash = sha256('hello world');
  console.log('SHA-256("hello world"):', hash.slice(0, 16) + '...');

  // 2. HMAC
  console.log('\n--- 2. HMAC-SHA256 ---');
  const mac = hmacSha256('secret-key', 'important message');
  console.log('HMAC:', mac.slice(0, 16) + '...');

  // 3. AES-GCM 加解密
  console.log('\n--- 3. AES-256-GCM ---');
  const { key, salt } = await deriveKeyScrypt('my-password');
  const encrypted = aesGcmEncrypt('Sensitive Data 🔒', key);
  console.log('加密结果（iv/authTag/ct）:', {
    iv: encrypted.iv.slice(0, 8) + '...',
    authTag: encrypted.authTag.slice(0, 8) + '...',
    ciphertext: encrypted.ciphertext.slice(0, 16) + '...'
  });
  const decrypted = aesGcmDecrypt(encrypted, key);
  console.log('解密结果:', decrypted);

  // 4. 密码哈希
  console.log('\n--- 4. 密码哈希 ---');
  const pwdHash = await hashPassword('my-secure-password');
  const isValid = await verifyPassword('my-secure-password', pwdHash);
  const isInvalid = await verifyPassword('wrong-password', pwdHash);
  console.log('正确密码验证:', isValid);
  console.log('错误密码验证:', isInvalid);

  // 5. 随机 Token
  console.log('\n--- 5. 安全随机 Token ---');
  console.log('随机 Token:', randomToken(16));
  console.log('UUID v4:', uuidv4());

  console.log('\n=== 演示结束 ===\n');
}
