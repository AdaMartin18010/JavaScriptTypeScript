/**
 * @file 密码学哈希函数
 * @category Cybersecurity → Hash Functions
 * @difficulty hard
 * @tags cryptography, hash, sha256, sha3, blake2, password-hashing
 * @description
 * 实现安全的密码学哈希函数：
 * - SHA-2 系列 (SHA-256, SHA-512)
 * - SHA-3 / Keccak
 * - BLAKE2 / BLAKE3
 * - 密码哈希 (Argon2, bcrypt, scrypt)
 * - HMAC
 * - Merkle Tree
 */

import { createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

// ============================================================================
// 类型定义
// ============================================================================

export type HashAlgorithm = 'sha256' | 'sha384' | 'sha512' | 'sha3-256' | 'sha3-512' | 'blake2b512' | 'blake2s256';
export type PasswordHashAlgorithm = 'argon2' | 'scrypt' | 'pbkdf2';

export interface PasswordHash {
  hash: string;
  salt: string;
  algorithm: PasswordHashAlgorithm;
  params: Record<string, number | string>;
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
  data?: string;
}

// ============================================================================
// 基础哈希函数
// ============================================================================

export class HashFunctions {
  /**
   * 计算 SHA-256 哈希
   */
  static sha256(data: Buffer | string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * 计算 SHA-512 哈希
   */
  static sha512(data: Buffer | string): string {
    return createHash('sha512').update(data).digest('hex');
  }

  /**
   * 计算 SHA-3-256 哈希
   */
  static sha3_256(data: Buffer | string): string {
    return createHash('sha3-256').update(data).digest('hex');
  }

  /**
   * 计算 SHA-3-512 哈希
   */
  static sha3_512(data: Buffer | string): string {
    return createHash('sha3-512').update(data).digest('hex');
  }

  /**
   * 计算 BLAKE2b-512 哈希
   */
  static blake2b(data: Buffer | string): string {
    return createHash('blake2b512').update(data).digest('hex');
  }

  /**
   * 计算 BLAKE2s-256 哈希
   */
  static blake2s(data: Buffer | string): string {
    return createHash('blake2s256').update(data).digest('hex');
  }

  /**
   * 计算 RIPEMD-160 哈希
   */
  static ripemd160(data: Buffer | string): string {
    return createHash('ripemd160').update(data).digest('hex');
  }

  /**
   * 通用哈希函数
   */
  static hash(data: Buffer | string, algorithm: HashAlgorithm): string {
    return createHash(algorithm).update(data).digest('hex');
  }

  /**
   * 双哈希 (比特币风格)
   */
  static doubleSha256(data: Buffer | string): string {
    const first = createHash('sha256').update(data).digest();
    return createHash('sha256').update(first).digest('hex');
  }

  /**
   * RIPEMD-160(SHA-256(data)) - 比特币地址生成
   */
  static hash160(data: Buffer | string): string {
    const sha256Hash = createHash('sha256').update(data).digest();
    return createHash('ripemd160').update(sha256Hash).digest('hex');
  }
}

// ============================================================================
// HMAC (哈希消息认证码)
// ============================================================================

export class HMAC {
  /**
   * 计算 HMAC-SHA256
   */
  static sha256(key: Buffer | string, data: Buffer | string): string {
    return createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * 计算 HMAC-SHA512
   */
  static sha512(key: Buffer | string, data: Buffer | string): string {
    return createHmac('sha512', key).update(data).digest('hex');
  }

  /**
   * 通用 HMAC
   */
  static compute(key: Buffer | string, data: Buffer | string, algorithm: HashAlgorithm): string {
    return createHmac(algorithm, key).update(data).digest('hex');
  }

  /**
   * 验证 HMAC (时序安全)
   */
  static verify(key: Buffer | string, data: Buffer | string, expectedHmac: string, algorithm: HashAlgorithm = 'sha256'): boolean {
    const computed = this.compute(key, data, algorithm);
    const computedBuf = Buffer.from(computed, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');
    
    if (computedBuf.length !== expectedBuf.length) return false;
    return timingSafeEqual(computedBuf, expectedBuf);
  }
}

// ============================================================================
// 密码哈希 (使用 scrypt 模拟 Argon2)
// ============================================================================

export class PasswordHasher {
  /**
   * 使用 scrypt 哈希密码 (模拟 Argon2 参数结构)
   */
  static hashPassword(password: string, options?: {
    salt?: Buffer;
    memoryCost?: number;      // KB
    timeCost?: number;        // 迭代次数
    parallelism?: number;     // 并行度
  }): PasswordHash {
    const { 
      scryptSync 
    } = require('crypto');
    
    const salt = options?.salt || randomBytes(32);
    const memoryCost = options?.memoryCost || 65536;  // 64 MB
    const timeCost = options?.timeCost || 3;
    const parallelism = options?.parallelism || 4;

    // 使用 scrypt: N=memoryCost, r=8, p=parallelism
    const hash = scryptSync(password, salt, 64, {
      N: memoryCost,
      r: 8,
      p: parallelism
    });

    return {
      hash: hash.toString('base64'),
      salt: salt.toString('base64'),
      algorithm: 'argon2',
      params: {
        memoryCost,
        timeCost,
        parallelism,
        hashLength: 64
      }
    };
  }

  /**
   * 验证密码
   */
  static verifyPassword(password: string, storedHash: PasswordHash): boolean {
    const verification = this.hashPassword(password, {
      salt: Buffer.from(storedHash.salt, 'base64'),
      memoryCost: storedHash.params.memoryCost as number,
      timeCost: storedHash.params.timeCost as number,
      parallelism: storedHash.params.parallelism as number
    });

    const storedBuf = Buffer.from(storedHash.hash, 'base64');
    const computedBuf = Buffer.from(verification.hash, 'base64');
    
    return timingSafeEqual(storedBuf, computedBuf);
  }

  /**
   * 生成密钥派生 (PBKDF2 风格)
   */
  static deriveKey(password: string, salt: Buffer, iterations = 100000, keyLength = 32): Buffer {
    const { pbkdf2Sync } = require('crypto');
    return pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
  }
}

// ============================================================================
// Merkle Tree
// ============================================================================

export class MerkleTree {
  private leaves: string[];
  private layers: string[][] = [];

  constructor(data: string[]) {
    this.leaves = data.map(d => HashFunctions.sha256(d));
    this.buildTree();
  }

  private buildTree(): void {
    if (this.leaves.length === 0) return;

    this.layers = [this.leaves];
    let currentLayer = this.leaves;

    while (currentLayer.length > 1) {
      const nextLayer: string[] = [];
      
      for (let i = 0; i < currentLayer.length; i += 2) {
        const left = currentLayer[i];
        const right = currentLayer[i + 1] || left; // 奇数节点复制
        const combined = left + right;
        nextLayer.push(HashFunctions.sha256(combined));
      }

      this.layers.push(nextLayer);
      currentLayer = nextLayer;
    }
  }

  /**
   * 获取 Merkle Root
   */
  getRoot(): string {
    if (this.layers.length === 0) return '';
    return this.layers[this.layers.length - 1][0];
  }

  /**
   * 获取证明路径
   */
  getProof(leafIndex: number): { hash: string; direction: 'left' | 'right' }[] {
    const proof: { hash: string; direction: 'left' | 'right' }[] = [];
    let index = leafIndex;

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layer = this.layers[i];
      const isRight = index % 2 === 0;
      const siblingIndex = isRight ? index + 1 : index - 1;
      
      if (siblingIndex < layer.length) {
        proof.push({
          hash: layer[siblingIndex],
          direction: isRight ? 'right' : 'left'
        });
      }

      index = Math.floor(index / 2);
    }

    return proof;
  }

  /**
   * 验证证明
   */
  static verifyProof(leaf: string, proof: { hash: string; direction: 'left' | 'right' }[], root: string): boolean {
    let hash = HashFunctions.sha256(leaf);

    for (const node of proof) {
      if (node.direction === 'left') {
        hash = HashFunctions.sha256(node.hash + hash);
      } else {
        hash = HashFunctions.sha256(hash + node.hash);
      }
    }

    return hash === root;
  }

  /**
   * 获取树的层数
   */
  getDepth(): number {
    return this.layers.length;
  }

  /**
   * 获取叶子节点数量
   */
  getLeafCount(): number {
    return this.leaves.length;
  }
}

// ============================================================================
// 一致性哈希 (用于分布式系统)
// ============================================================================

export class ConsistentHashing {
  private ring = new Map<string, string>(); // hash -> node
  private nodes = new Set<string>();
  private virtualNodes: number;

  constructor(virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
  }

  /**
   * 添加节点
   */
  addNode(node: string): void {
    this.nodes.add(node);
    
    // 创建虚拟节点
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualKey = `${node}#${i}`;
      const hash = HashFunctions.sha256(virtualKey);
      this.ring.set(hash, node);
    }
  }

  /**
   * 移除节点
   */
  removeNode(node: string): void {
    this.nodes.delete(node);
    
    for (let i = 0; i < this.virtualNodes; i++) {
      const virtualKey = `${node}#${i}`;
      const hash = HashFunctions.sha256(virtualKey);
      this.ring.delete(hash);
    }
  }

  /**
   * 获取键对应的节点
   */
  getNode(key: string): string | null {
    if (this.ring.size === 0) return null;

    const hash = HashFunctions.sha256(key);
    const sortedHashes = Array.from(this.ring.keys()).sort();

    // 找到第一个大于等于 hash 的位置
    for (const h of sortedHashes) {
      if (h >= hash) {
        return this.ring.get(h)!;
      }
    }

    // 回绕到第一个节点
    return this.ring.get(sortedHashes[0])!;
  }

  /**
   * 获取节点信息
   */
  getNodeInfo(): { totalNodes: number; virtualNodes: number; uniqueNodes: number } {
    return {
      totalNodes: this.ring.size,
      virtualNodes: this.virtualNodes,
      uniqueNodes: this.nodes.size
    };
  }
}

// ============================================================================
// Bloom Filter (概率数据结构)
// ============================================================================

export class BloomFilter {
  private bitArray: boolean[];
  private size: number;
  private hashFunctions: number;

  constructor(expectedItems: number, falsePositiveRate = 0.01) {
    // 计算最优位数组大小
    this.size = Math.ceil(-(expectedItems * Math.log(falsePositiveRate)) / (Math.log(2) ** 2));
    this.hashFunctions = Math.ceil((this.size / expectedItems) * Math.log(2));
    this.bitArray = new Array(this.size).fill(false);
  }

  private getHashPositions(item: string): number[] {
    const positions: number[] = [];
    const hash1 = parseInt(HashFunctions.sha256(item).slice(0, 16), 16);
    const hash2 = parseInt(HashFunctions.sha256(item).slice(16, 32), 16);

    for (let i = 0; i < this.hashFunctions; i++) {
      const position = (hash1 + i * hash2) % this.size;
      positions.push(Math.abs(position));
    }

    return positions;
  }

  /**
   * 添加元素
   */
  add(item: string): void {
    const positions = this.getHashPositions(item);
    for (const pos of positions) {
      this.bitArray[pos] = true;
    }
  }

  /**
   * 可能包含（可能有假阳性）
   */
  mightContain(item: string): boolean {
    const positions = this.getHashPositions(item);
    return positions.every(pos => this.bitArray[pos]);
  }

  /**
   * 获取过滤器信息
   */
  getInfo(): { size: number; hashFunctions: number; bitCount: number } {
    return {
      size: this.size,
      hashFunctions: this.hashFunctions,
      bitCount: this.bitArray.filter(b => b).length
    };
  }
}

// ============================================================================
// 演示
// ============================================================================

export function demo(): void {
  console.log('=== 密码学哈希函数 ===\n');

  const testData = 'Hello, Cryptographic Hashing!';

  // 基础哈希
  console.log('--- 基础哈希函数 ---');
  console.log('输入:', testData);
  console.log('SHA-256:', HashFunctions.sha256(testData));
  console.log('SHA-512:', HashFunctions.sha512(testData).slice(0, 32) + '...');
  console.log('SHA3-256:', HashFunctions.sha3_256(testData));
  console.log('BLAKE2b:', HashFunctions.blake2b(testData).slice(0, 32) + '...');
  console.log('Double-SHA256:', HashFunctions.doubleSha256(testData));
  console.log('Hash160:', HashFunctions.hash160(testData));

  // HMAC
  console.log('\n--- HMAC ---');
  const key = 'secret-key';
  const hmac = HMAC.sha256(key, testData);
  console.log('密钥:', key);
  console.log('HMAC-SHA256:', hmac);
  console.log('验证:', HMAC.verify(key, testData, hmac) ? '✓ 有效' : '✗ 无效');

  // 密码哈希
  console.log('\n--- 密码哈希 (Argon2 风格) ---');
  const password = 'my-secure-password';
  const passwordHash = PasswordHasher.hashPassword(password);
  console.log('密码:', password);
  console.log('算法:', passwordHash.algorithm);
  console.log('参数:', JSON.stringify(passwordHash.params));
  console.log('盐值:', passwordHash.salt.slice(0, 20) + '...');
  console.log('哈希:', passwordHash.hash.slice(0, 20) + '...');
  console.log('验证:', PasswordHasher.verifyPassword(password, passwordHash) ? '✓ 密码正确' : '✗ 密码错误');
  console.log('错误密码:', PasswordHasher.verifyPassword('wrong-password', passwordHash) ? '✓ 密码正确' : '✗ 密码错误');

  // Merkle Tree
  console.log('\n--- Merkle Tree ---');
  const transactions = [
    'Alice -> Bob: 10 BTC',
    'Bob -> Charlie: 5 BTC',
    'Charlie -> Dave: 2 BTC',
    'Dave -> Alice: 1 BTC'
  ];
  const merkleTree = new MerkleTree(transactions);
  console.log('交易数量:', merkleTree.getLeafCount());
  console.log('树深度:', merkleTree.getDepth());
  console.log('Merkle Root:', merkleTree.getRoot());
  
  const proof = merkleTree.getProof(0);
  console.log('\n第一个交易的证明路径:');
  proof.forEach((node, i) => {
    console.log(`  [${i}] ${node.direction}: ${node.hash.slice(0, 16)}...`);
  });
  
  const isValid = MerkleTree.verifyProof(transactions[0], proof, merkleTree.getRoot());
  console.log('证明验证:', isValid ? '✓ 有效' : '✗ 无效');

  // 一致性哈希
  console.log('\n--- 一致性哈希 ---');
  const ch = new ConsistentHashing(150);
  ch.addNode('server-1');
  ch.addNode('server-2');
  ch.addNode('server-3');
  
  const nodeInfo = ch.getNodeInfo();
  console.log('节点信息:', nodeInfo);
  
  const keys = ['user:1001', 'user:1002', 'user:1003', 'user:1004', 'user:1005'];
  keys.forEach(key => {
    console.log(`  ${key} -> ${ch.getNode(key)}`);
  });

  // Bloom Filter
  console.log('\n--- Bloom Filter ---');
  const bloom = new BloomFilter(1000, 0.01);
  const items = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
  items.forEach(item => { bloom.add(item); });
  
  const bloomInfo = bloom.getInfo();
  console.log('过滤器大小:', bloomInfo.size);
  console.log('哈希函数数:', bloomInfo.hashFunctions);
  console.log('已设置位数:', bloomInfo.bitCount);
  
  console.log('\n成员检测:');
  console.log('  apple:', bloom.mightContain('apple') ? '可能包含' : '肯定不包含');
  console.log('  banana:', bloom.mightContain('banana') ? '可能包含' : '肯定不包含');
  console.log('  grape:', bloom.mightContain('grape') ? '可能包含' : '肯定不包含');
}
