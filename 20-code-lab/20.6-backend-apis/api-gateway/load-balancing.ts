/**
 * @file 负载均衡
 * @category API Gateway → Load Balancing
 * @difficulty medium
 * @tags load-balancing, round-robin, least-connections, health-check
 *
 * @description
 * 多种负载均衡算法实现：轮询、加权轮询、最少连接、一致性哈希、随机
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface Backend {
  id: string;
  host: string;
  port: number;
  weight: number; // 权重，用于加权算法
  connections: number; // 当前连接数
  healthy: boolean;
  metadata?: Record<string, unknown>;
}

export interface LoadBalancerStrategy {
  select(backends: Backend[]): Backend | null;
  updateBackend(backend: Backend): void;
  removeBackend(backendId: string): void;
}

export interface HealthCheckConfig {
  interval: number; // ms
  timeout: number; // ms
  path: string;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

// ============================================================================
// 轮询算法
// ============================================================================

export class RoundRobinStrategy implements LoadBalancerStrategy {
  private currentIndex = 0;
  private backends: Backend[] = [];

  select(backends: Backend[]): Backend | null {
    // 更新内部列表
    this.backends = backends.filter(b => b.healthy);
    
    if (this.backends.length === 0) return null;

    const backend = this.backends[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.backends.length;
    return backend;
  }

  updateBackend(backend: Backend): void {
    const index = this.backends.findIndex(b => b.id === backend.id);
    if (index > -1) {
      this.backends[index] = backend;
    } else {
      this.backends.push(backend);
    }
  }

  removeBackend(backendId: string): void {
    const index = this.backends.findIndex(b => b.id === backendId);
    if (index > -1) {
      this.backends.splice(index, 1);
      // 调整索引
      if (this.currentIndex >= this.backends.length) {
        this.currentIndex = 0;
      }
    }
  }
}

// ============================================================================
// 加权轮询算法 (Smooth Weighted Round Robin)
// ============================================================================

export class WeightedRoundRobinStrategy implements LoadBalancerStrategy {
  private currentWeights = new Map<string, number>();
  private backends: Backend[] = [];

  select(backends: Backend[]): Backend | null {
    this.backends = backends.filter(b => b.healthy);
    
    if (this.backends.length === 0) return null;
    if (this.backends.length === 1) return this.backends[0];

    let totalWeight = 0;
    let selected: Backend = this.backends[0];
    let maxWeight = -Infinity;

    for (const backend of this.backends) {
      const currentWeight = (this.currentWeights.get(backend.id) || 0) + backend.weight;
      this.currentWeights.set(backend.id, currentWeight);
      totalWeight += backend.weight;

      if (currentWeight > maxWeight) {
        maxWeight = currentWeight;
        selected = backend;
      }
    }

    // 减去总权重
    const selectedWeight = this.currentWeights.get(selected.id)! - totalWeight;
    this.currentWeights.set(selected.id, selectedWeight);

    return selected;
  }

  updateBackend(backend: Backend): void {
    const index = this.backends.findIndex(b => b.id === backend.id);
    if (index > -1) {
      this.backends[index] = backend;
    } else {
      this.backends.push(backend);
      this.currentWeights.set(backend.id, 0);
    }
  }

  removeBackend(backendId: string): void {
    const index = this.backends.findIndex(b => b.id === backendId);
    if (index > -1) {
      this.backends.splice(index, 1);
      this.currentWeights.delete(backendId);
    }
  }
}

// ============================================================================
// 最少连接算法
// ============================================================================

export class LeastConnectionsStrategy implements LoadBalancerStrategy {
  select(backends: Backend[]): Backend | null {
    const healthy = backends.filter(b => b.healthy);
    
    if (healthy.length === 0) return null;

    // 找到连接数最少的服务器
    let selected = healthy[0];
    for (const backend of healthy) {
      if (backend.connections < selected.connections) {
        selected = backend;
      }
    }

    return selected;
  }

  updateBackend(backend: Backend): void {
    // 无需维护内部状态
  }

  removeBackend(backendId: string): void {
    // 无需维护内部状态
  }
}

// ============================================================================
// 加权最少连接算法
// ============================================================================

export class WeightedLeastConnectionsStrategy implements LoadBalancerStrategy {
  select(backends: Backend[]): Backend | null {
    const healthy = backends.filter(b => b.healthy);
    
    if (healthy.length === 0) return null;

    // 计算加权连接数 = connections / weight
    let selected = healthy[0];
    let minScore = selected.connections / selected.weight;

    for (const backend of healthy) {
      const score = backend.connections / backend.weight;
      if (score < minScore) {
        minScore = score;
        selected = backend;
      }
    }

    return selected;
  }

  updateBackend(backend: Backend): void {}
  removeBackend(backendId: string): void {}
}

// ============================================================================
// IP 哈希算法 (一致性哈希)
// ============================================================================

export class IPHashStrategy implements LoadBalancerStrategy {
  select(backends: Backend[]): Backend | null {
    const healthy = backends.filter(b => b.healthy);
    
    if (healthy.length === 0) return null;
    if (healthy.length === 1) return healthy[0];

    // 这里简化实现，实际应该根据请求的 IP 计算
    // 为了演示，使用随机选择模拟 IP 哈希
    const hash = Math.floor(Math.random() * 1000000);
    const index = hash % healthy.length;
    
    return healthy[index];
  }

  updateBackend(backend: Backend): void {}
  removeBackend(backendId: string): void {}

  /**
   * 根据 IP 选择后端
   */
  selectByIp(ip: string, backends: Backend[]): Backend | null {
    const healthy = backends.filter(b => b.healthy);
    
    if (healthy.length === 0) return null;

    // FNV-1a hash
    let hash = 2166136261;
    for (let i = 0; i < ip.length; i++) {
      hash ^= ip.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }

    const index = Math.abs(hash) % healthy.length;
    return healthy[index];
  }
}

// ============================================================================
// 一致性哈希环
// ============================================================================

export class ConsistentHashStrategy implements LoadBalancerStrategy {
  private virtualNodes: number;
  private ring = new Map<number, string>(); // hash -> backendId
  private sortedKeys: number[] = [];
  private backends = new Map<string, Backend>();

  constructor(virtualNodes = 150) {
    this.virtualNodes = virtualNodes;
  }

  select(backends: Backend[]): Backend | null {
    // 重建环（如果后端列表变化）
    this.rebuildRing(backends);
    
    // 这里简化实现，实际应该根据请求 key 选择
    const key = Math.random().toString();
    return this.getBackendByKey(key);
  }

  selectByKey(key: string, backends: Backend[]): Backend | null {
    this.rebuildRing(backends);
    return this.getBackendByKey(key);
  }

  private getBackendByKey(key: string): Backend | null {
    if (this.ring.size === 0) return null;

    const hash = this.hash(key);
    
    // 找到顺时针方向的第一个节点
    let targetHash: number | undefined;
    
    for (const h of this.sortedKeys) {
      if (h >= hash) {
        targetHash = h;
        break;
      }
    }

    // 如果没找到，取第一个（环的头部）
    if (targetHash === undefined) {
      targetHash = this.sortedKeys[0];
    }

    const backendId = this.ring.get(targetHash);
    return backendId ? this.backends.get(backendId) || null : null;
  }

  private rebuildRing(backends: Backend[]): void {
    const healthyIds = new Set(backends.filter(b => b.healthy).map(b => b.id));
    
    // 检查是否需要重建
    const currentIds = new Set(this.backends.keys());
    const needRebuild = 
      healthyIds.size !== currentIds.size ||
      ![...healthyIds].every(id => currentIds.has(id));

    if (!needRebuild) return;

    // 重建
    this.ring.clear();
    this.backends.clear();

    for (const backend of backends) {
      if (!backend.healthy) continue;
      
      this.backends.set(backend.id, backend);
      
      // 添加虚拟节点
      for (let i = 0; i < this.virtualNodes; i++) {
        const virtualKey = `${backend.id}#${i}`;
        const hash = this.hash(virtualKey);
        this.ring.set(hash, backend.id);
      }
    }

    this.sortedKeys = Array.from(this.ring.keys()).sort((a, b) => a - b);
  }

  private hash(key: string): number {
    // FNV-1a hash
    let hash = 2166136261;
    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return Math.abs(hash);
  }

  updateBackend(backend: Backend): void {
    this.backends.set(backend.id, backend);
  }

  removeBackend(backendId: string): void {
    this.backends.delete(backendId);
  }
}

// ============================================================================
// 随机算法
// ============================================================================

export class RandomStrategy implements LoadBalancerStrategy {
  select(backends: Backend[]): Backend | null {
    const healthy = backends.filter(b => b.healthy);
    
    if (healthy.length === 0) return null;

    const index = Math.floor(Math.random() * healthy.length);
    return healthy[index];
  }

  updateBackend(backend: Backend): void {}
  removeBackend(backendId: string): void {}
}

// ============================================================================
// 加权随机算法
// ============================================================================

export class WeightedRandomStrategy implements LoadBalancerStrategy {
  select(backends: Backend[]): Backend | null {
    const healthy = backends.filter(b => b.healthy);
    
    if (healthy.length === 0) return null;

    // 计算总权重
    const totalWeight = healthy.reduce((sum, b) => sum + b.weight, 0);
    
    // 随机选择
    let random = Math.random() * totalWeight;
    
    for (const backend of healthy) {
      random -= backend.weight;
      if (random <= 0) {
        return backend;
      }
    }

    return healthy[healthy.length - 1];
  }

  updateBackend(backend: Backend): void {}
  removeBackend(backendId: string): void {}
}

// ============================================================================
// 健康检查器
// ============================================================================

export class HealthChecker {
  private checkInterval?: ReturnType<typeof setInterval>;
  private backendStats = new Map<string, {
    consecutiveSuccesses: number;
    consecutiveFailures: number;
  }>();

  constructor(private config: HealthCheckConfig) {}

  start(backends: Backend[], checkFn: (backend: Backend) => Promise<boolean>): void {
    this.checkInterval = setInterval(async () => {
      for (const backend of backends) {
        try {
          const isHealthy = await this.runCheck(backend, checkFn);
          this.updateBackendHealth(backend, isHealthy);
        } catch {
          this.updateBackendHealth(backend, false);
        }
      }
    }, this.config.interval);
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  private async runCheck(backend: Backend, checkFn: (backend: Backend) => Promise<boolean>): Promise<boolean> {
    return Promise.race([
      checkFn(backend),
      new Promise<boolean>((_, reject) => 
        setTimeout(() => { reject(new Error('Timeout')); }, this.config.timeout)
      )
    ]);
  }

  private updateBackendHealth(backend: Backend, isHealthy: boolean): void {
    let stats = this.backendStats.get(backend.id);
    if (!stats) {
      stats = { consecutiveSuccesses: 0, consecutiveFailures: 0 };
      this.backendStats.set(backend.id, stats);
    }

    if (isHealthy) {
      stats.consecutiveSuccesses++;
      stats.consecutiveFailures = 0;

      if (!backend.healthy && stats.consecutiveSuccesses >= this.config.healthyThreshold) {
        backend.healthy = true;
        console.log(`[HealthCheck] Backend ${backend.id} is now healthy`);
      }
    } else {
      stats.consecutiveFailures++;
      stats.consecutiveSuccesses = 0;

      if (backend.healthy && stats.consecutiveFailures >= this.config.unhealthyThreshold) {
        backend.healthy = false;
        console.log(`[HealthCheck] Backend ${backend.id} is now unhealthy`);
      }
    }
  }
}

// ============================================================================
// 负载均衡器
// ============================================================================

export class LoadBalancer {
  private backends: Backend[] = [];
  private strategy: LoadBalancerStrategy;
  private connections = new Map<string, number>(); // 追踪连接数

  constructor(strategy: LoadBalancerStrategy) {
    this.strategy = strategy;
  }

  /**
   * 添加后端服务器
   */
  addBackend(backend: Omit<Backend, 'connections' | 'healthy'>): void {
    const newBackend: Backend = {
      ...backend,
      connections: 0,
      healthy: true
    };
    this.backends.push(newBackend);
    this.strategy.updateBackend(newBackend);
  }

  /**
   * 移除后端服务器
   */
  removeBackend(backendId: string): void {
    const index = this.backends.findIndex(b => b.id === backendId);
    if (index > -1) {
      this.backends.splice(index, 1);
      this.strategy.removeBackend(backendId);
    }
  }

  /**
   * 选择后端服务器
   */
  select(): Backend | null {
    const backend = this.strategy.select(this.backends);
    
    if (backend) {
      // 增加连接数
      backend.connections++;
      this.connections.set(backend.id, (this.connections.get(backend.id) || 0) + 1);
    }

    return backend;
  }

  /**
   * 释放连接
   */
  release(backendId: string): void {
    const backend = this.backends.find(b => b.id === backendId);
    if (backend) {
      backend.connections = Math.max(0, backend.connections - 1);
    }
    const current = this.connections.get(backendId) || 0;
    if (current > 0) {
      this.connections.set(backendId, current - 1);
    }
  }

  /**
   * 获取后端列表
   */
  getBackends(): Backend[] {
    return [...this.backends];
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    total: number;
    healthy: number;
    unhealthy: number;
    totalConnections: number;
  } {
    const healthy = this.backends.filter(b => b.healthy).length;
    return {
      total: this.backends.length,
      healthy,
      unhealthy: this.backends.length - healthy,
      totalConnections: Array.from(this.connections.values()).reduce((a, b) => a + b, 0)
    };
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 负载均衡算法演示 ===\n');

  // 创建后端服务器
  const backends: Backend[] = [
    { id: 'server-1', host: 'localhost', port: 8081, weight: 5, connections: 2, healthy: true },
    { id: 'server-2', host: 'localhost', port: 8082, weight: 3, connections: 5, healthy: true },
    { id: 'server-3', host: 'localhost', port: 8083, weight: 2, connections: 1, healthy: true }
  ];

  // 1. 轮询
  console.log('--- 轮询 (Round Robin) ---');
  const roundRobin = new RoundRobinStrategy();
  const rrResults: Record<string, number> = {};
  
  for (let i = 0; i < 9; i++) {
    const backend = roundRobin.select(backends);
    if (backend) {
      rrResults[backend.id] = (rrResults[backend.id] || 0) + 1;
      process.stdout.write(`${backend.id} `);
    }
  }
  console.log('\nDistribution:', rrResults);

  // 2. 加权轮询
  console.log('\n--- 加权轮询 (Weighted Round Robin) ---');
  const weightedRR = new WeightedRoundRobinStrategy();
  const wrrResults: Record<string, number> = {};
  
  for (let i = 0; i < 100; i++) {
    const backend = weightedRR.select(backends);
    if (backend) {
      wrrResults[backend.id] = (wrrResults[backend.id] || 0) + 1;
    }
  }
  console.log('Distribution (100 requests):', wrrResults);
  console.log('Expected ratio: server-1:50%, server-2:30%, server-3:20%');

  // 3. 最少连接
  console.log('\n--- 最少连接 (Least Connections) ---');
  const leastConn = new LeastConnectionsStrategy();
  
  for (let i = 0; i < 5; i++) {
    const backend = leastConn.select(backends);
    if (backend) {
      console.log(`  Selected: ${backend.id} (connections: ${backend.connections})`);
      // 模拟增加连接
      backend.connections++;
    }
  }

  // 4. 一致性哈希
  console.log('\n--- 一致性哈希 (Consistent Hash) ---');
  const consistentHash = new ConsistentHashStrategy(100);
  
  const keys = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
  const keyDistribution: Record<string, string[]> = {};
  
  for (const key of keys) {
    const backend = consistentHash.selectByKey(key, backends);
    if (backend) {
      if (!keyDistribution[backend.id]) {
        keyDistribution[backend.id] = [];
      }
      keyDistribution[backend.id].push(key);
      console.log(`  ${key} -> ${backend.id}`);
    }
  }

  // 5. 负载均衡器统计
  console.log('\n--- 负载均衡器统计 ---');
  const lb = new LoadBalancer(new RoundRobinStrategy());
  
  lb.addBackend({ id: 's1', host: 'localhost', port: 8081, weight: 1 });
  lb.addBackend({ id: 's2', host: 'localhost', port: 8082, weight: 1 });
  lb.addBackend({ id: 's3', host: 'localhost', port: 8083, weight: 1 });

  // 模拟选择
  for (let i = 0; i < 5; i++) {
    lb.select();
  }

  console.log('Stats:', lb.getStats());
}
