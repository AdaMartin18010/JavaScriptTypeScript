/**
 * @file 分布式原语
 * @category Distributed Systems → Primitives
 * @difficulty hard
 * @tags distributed-systems, consistency, transactions, partitioning
 */

export interface Node {
  id: string;
  address: string;
  state: 'healthy' | 'suspect' | 'failed';
  lastHeartbeat: number;
}

// 分布式一致性哈希
export class ConsistentHash {
  private ring: Map<number, string> = new Map();
  private nodes: Set<string> = new Set();
  private virtualNodes = 150;
  
  addNode(nodeId: string): void {
    this.nodes.add(nodeId);
    
    // 创建虚拟节点
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(`${nodeId}:${i}`);
      this.ring.set(hash, nodeId);
    }
  }
  
  removeNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    
    for (let i = 0; i < this.virtualNodes; i++) {
      const hash = this.hash(`${nodeId}:${i}`);
      this.ring.delete(hash);
    }
  }
  
  getNode(key: string): string | null {
    if (this.ring.size === 0) return null;
    
    const hash = this.hash(key);
    const sortedHashes = Array.from(this.ring.keys()).sort((a, b) => a - b);
    
    // 找到第一个大于等于hash的节点
    for (const h of sortedHashes) {
      if (h >= hash) {
        return this.ring.get(h)!;
      }
    }
    
    // 回绕到第一个节点
    return this.ring.get(sortedHashes[0])!;
  }
  
  private hash(str: string): number {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h = h & h;
    }
    return Math.abs(h);
  }
  
  getStats(): { nodes: number; virtualNodes: number; ringSize: number } {
    return {
      nodes: this.nodes.size,
      virtualNodes: this.virtualNodes,
      ringSize: this.ring.size
    };
  }
}

// 分布式事务 - 两阶段提交简化版
export interface Transaction {
  id: string;
  participants: string[];
  state: 'pending' | 'prepared' | 'committed' | 'aborted';
}

export class TwoPhaseCommit {
  private transactions: Map<string, Transaction> = new Map();
  private participantVotes: Map<string, Map<string, 'yes' | 'no'>> = new Map();
  
  begin(txId: string, participants: string[]): Transaction {
    const tx: Transaction = {
      id: txId,
      participants,
      state: 'pending'
    };
    this.transactions.set(txId, tx);
    this.participantVotes.set(txId, new Map());
    return tx;
  }
  
  // 第一阶段：准备
  async prepare(txId: string, participantId: string): Promise<boolean> {
    const tx = this.transactions.get(txId);
    if (!tx) return false;
    
    // 模拟准备操作
    const canPrepare = Math.random() > 0.1; // 90%成功率
    
    const votes = this.participantVotes.get(txId)!;
    votes.set(participantId, canPrepare ? 'yes' : 'no');
    
    if (votes.size === tx.participants.length) {
      // 所有参与者已投票
      const allYes = Array.from(votes.values()).every(v => v === 'yes');
      tx.state = allYes ? 'prepared' : 'aborted';
    }
    
    return canPrepare;
  }
  
  // 第二阶段：提交或回滚
  async commit(txId: string): Promise<boolean> {
    const tx = this.transactions.get(txId);
    if (!tx || tx.state !== 'prepared') return false;
    
    tx.state = 'committed';
    console.log(`[2PC] 事务 ${txId} 已提交`);
    return true;
  }
  
  async abort(txId: string): Promise<boolean> {
    const tx = this.transactions.get(txId);
    if (!tx) return false;
    
    tx.state = 'aborted';
    console.log(`[2PC] 事务 ${txId} 已回滚`);
    return true;
  }
  
  getTransaction(txId: string): Transaction | undefined {
    return this.transactions.get(txId);
  }
}

// 向量时钟
export class VectorClock {
  private clock: Map<string, number> = new Map();
  
  increment(nodeId: string): void {
    const current = this.clock.get(nodeId) || 0;
    this.clock.set(nodeId, current + 1);
  }
  
  update(other: VectorClock): void {
    for (const [node, time] of other.clock) {
      const current = this.clock.get(node) || 0;
      this.clock.set(node, Math.max(current, time));
    }
  }
  
  // 比较两个向量时钟
  compare(other: VectorClock): 'before' | 'after' | 'concurrent' | 'equal' {
    let allLessOrEqual = true;
    let allGreaterOrEqual = true;
    let hasLess = false;
    let hasGreater = false;
    
    const allNodes = new Set([...this.clock.keys(), ...other.clock.keys()]);
    
    for (const node of allNodes) {
      const thisTime = this.clock.get(node) || 0;
      const otherTime = other.clock.get(node) || 0;
      
      if (thisTime < otherTime) {
        hasLess = true;
        allGreaterOrEqual = false;
      } else if (thisTime > otherTime) {
        hasGreater = true;
        allLessOrEqual = false;
      }
    }
    
    if (!hasLess && !hasGreater) return 'equal';
    if (allLessOrEqual) return 'before';
    if (allGreaterOrEqual) return 'after';
    return 'concurrent';
  }
  
  toJSON(): Record<string, number> {
    return Object.fromEntries(this.clock);
  }
}

// 分布式锁 (Redlock简化版)
export class DistributedLock {
  private locks: Map<string, { holder: string; expiry: number }> = new Map();
  private ttl = 10000; // 10秒TTL
  
  acquire(resource: string, clientId: string): boolean {
    const now = Date.now();
    const existing = this.locks.get(resource);
    
    if (existing && existing.expiry > now) {
      return false; // 锁已被占用
    }
    
    this.locks.set(resource, {
      holder: clientId,
      expiry: now + this.ttl
    });
    
    return true;
  }
  
  release(resource: string, clientId: string): boolean {
    const lock = this.locks.get(resource);
    
    if (!lock || lock.holder !== clientId) {
      return false;
    }
    
    this.locks.delete(resource);
    return true;
  }
  
  extend(resource: string, clientId: string): boolean {
    const lock = this.locks.get(resource);
    
    if (!lock || lock.holder !== clientId) {
      return false;
    }
    
    lock.expiry = Date.now() + this.ttl;
    return true;
  }
}

export function demo(): void {
  console.log('=== 分布式系统原语 ===\n');
  
  // 一致性哈希
  const hashRing = new ConsistentHash();
  hashRing.addNode('server-a');
  hashRing.addNode('server-b');
  hashRing.addNode('server-c');
  
  console.log('一致性哈希环:', hashRing.getStats());
  
  // 测试数据分布
  const testKeys = ['user:1', 'user:2', 'user:3', 'user:4', 'user:5'];
  console.log('数据分布:');
  for (const key of testKeys) {
    console.log(`  ${key} -> ${hashRing.getNode(key)}`);
  }
  
  // 节点下线后重新分布
  hashRing.removeNode('server-b');
  console.log('\n节点b下线后:');
  for (const key of testKeys) {
    console.log(`  ${key} -> ${hashRing.getNode(key)}`);
  }
  
  // 向量时钟
  console.log('\n--- 向量时钟 ---');
  const vc1 = new VectorClock();
  vc1.increment('node-a');
  vc1.increment('node-a');
  
  const vc2 = new VectorClock();
  vc2.increment('node-b');
  vc2.update(vc1);
  
  console.log('VC1:', vc1.toJSON());
  console.log('VC2:', vc2.toJSON());
  console.log('比较结果:', vc1.compare(vc2));
  
  // 分布式锁
  console.log('\n--- 分布式锁 ---');
  const lock = new DistributedLock();
  console.log('Client-1 获取锁:', lock.acquire('resource:1', 'client-1'));
  console.log('Client-2 获取锁:', lock.acquire('resource:1', 'client-2'));
  console.log('Client-1 释放锁:', lock.release('resource:1', 'client-1'));
  console.log('Client-2 再次获取:', lock.acquire('resource:1', 'client-2'));
}
