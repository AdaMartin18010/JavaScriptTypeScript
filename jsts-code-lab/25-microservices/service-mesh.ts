/**
 * @file 微服务通信模式
 * @category Microservices → Communication
 * @difficulty hard
 * @tags microservices, service-mesh, circuit-breaker, retry
 * 
 * @description
 * 微服务间通信实现：
 * - 服务发现
 * - 熔断器
 * - 重试机制
 * - 负载均衡
 */

// ============================================================================
// 1. 服务注册与发现
// ============================================================================

export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  metadata: Record<string, string>;
  health: 'healthy' | 'unhealthy' | 'unknown';
  lastHeartbeat: number;
}

export class ServiceRegistry {
  private services: Map<string, ServiceInstance[]> = new Map();
  private healthCheckInterval: ReturnType<typeof setInterval>;

  constructor(private checkInterval = 30000) {
    this.healthCheckInterval = setInterval(() => {
      this.checkHealth();
    }, this.checkInterval);
  }

  register(instance: ServiceInstance): void {
    const instances = this.services.get(instance.name) || [];
    
    // 检查是否已存在
    const existingIndex = instances.findIndex(i => i.id === instance.id);
    if (existingIndex >= 0) {
      instances[existingIndex] = { ...instance, lastHeartbeat: Date.now() };
    } else {
      instances.push({ ...instance, lastHeartbeat: Date.now() });
    }
    
    this.services.set(instance.name, instances);
    console.log(`Service registered: ${instance.name} (${instance.id})`);
  }

  deregister(serviceName: string, instanceId: string): void {
    const instances = this.services.get(serviceName);
    if (instances) {
      const filtered = instances.filter(i => i.id !== instanceId);
      if (filtered.length === 0) {
        this.services.delete(serviceName);
      } else {
        this.services.set(serviceName, filtered);
      }
    }
  }

  discover(serviceName: string): ServiceInstance[] {
    const instances = this.services.get(serviceName) || [];
    return instances.filter(i => i.health === 'healthy');
  }

  getAllServices(): string[] {
    return Array.from(this.services.keys());
  }

  heartbeat(serviceName: string, instanceId: string): void {
    const instances = this.services.get(serviceName);
    if (instances) {
      const instance = instances.find(i => i.id === instanceId);
      if (instance) {
        instance.lastHeartbeat = Date.now();
        instance.health = 'healthy';
      }
    }
  }

  private checkHealth(): void {
    const now = Date.now();
    const timeout = 60000; // 60秒超时

    for (const [name, instances] of this.services) {
      for (const instance of instances) {
        if (now - instance.lastHeartbeat > timeout) {
          instance.health = 'unhealthy';
          console.warn(`Service unhealthy: ${name} (${instance.id})`);
        }
      }
    }
  }

  destroy(): void {
    clearInterval(this.healthCheckInterval);
  }
}

// ============================================================================
// 2. 熔断器
// ============================================================================

export enum CircuitState {
  CLOSED = 'CLOSED',       // 正常
  OPEN = 'OPEN',           // 熔断
  HALF_OPEN = 'HALF_OPEN'  // 半开
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
}

export class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime: number = 0;
  private config: CircuitBreakerConfig;

  constructor(
    private name: string,
    config?: Partial<CircuitBreakerConfig>
  ) {
    this.config = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 10000,
      resetTimeout: 30000,
      ...config
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.config.resetTimeout) {
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
        console.log(`Circuit breaker '${this.name}' entering HALF_OPEN state`);
      } else {
        throw new Error(`Circuit breaker '${this.name}' is OPEN`);
      }
    }

    try {
      const result = await this.executeWithTimeout(fn);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.config.timeout);

      fn()
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
    });
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
        console.log(`Circuit breaker '${this.name}' CLOSED`);
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.state = CircuitState.OPEN;
    } else if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.OPEN;
      console.log(`Circuit breaker '${this.name}' OPEN`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): { failures: number; successes: number; state: CircuitState } {
    return {
      failures: this.failures,
      successes: this.successes,
      state: this.state
    };
  }
}

// ============================================================================
// 3. 重试机制
// ============================================================================

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoff: 'fixed' | 'exponential' | 'linear';
  retryableErrors: string[];
}

export class RetryPolicy {
  private config: RetryConfig;

  constructor(config?: Partial<RetryConfig>) {
    this.config = {
      maxAttempts: 3,
      delay: 1000,
      backoff: 'exponential',
      retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
      ...config
    };
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        
        if (!this.shouldRetry(error as Error)) {
          throw error;
        }

        if (attempt < this.config.maxAttempts) {
          const delay = this.calculateDelay(attempt);
          console.log(`Retry attempt ${attempt}/${this.config.maxAttempts} after ${delay}ms`);
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  private shouldRetry(error: Error): boolean {
    return this.config.retryableErrors.some(e => 
      error.message.includes(e) || ('code' in error && error.code === e)
    );
  }

  private calculateDelay(attempt: number): number {
    switch (this.config.backoff) {
      case 'exponential':
        return this.config.delay * Math.pow(2, attempt - 1);
      case 'linear':
        return this.config.delay * attempt;
      case 'fixed':
      default:
        return this.config.delay;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// 4. 负载均衡器
// ============================================================================

export type LoadBalancingStrategy = 'round-robin' | 'random' | 'least-connections' | 'weighted';

export class LoadBalancer {
  private currentIndex = 0;
  private connections: Map<string, number> = new Map();

  constructor(private strategy: LoadBalancingStrategy = 'round-robin') {}

  select(instances: ServiceInstance[]): ServiceInstance | null {
    if (instances.length === 0) return null;

    switch (this.strategy) {
      case 'round-robin':
        return this.roundRobin(instances);
      case 'random':
        return this.random(instances);
      case 'least-connections':
        return this.leastConnections(instances);
      default:
        return instances[0];
    }
  }

  private roundRobin(instances: ServiceInstance[]): ServiceInstance {
    const instance = instances[this.currentIndex % instances.length];
    this.currentIndex++;
    return instance;
  }

  private random(instances: ServiceInstance[]): ServiceInstance {
    return instances[Math.floor(Math.random() * instances.length)];
  }

  private leastConnections(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) => {
      const minConn = this.connections.get(min.id) || 0;
      const instConn = this.connections.get(instance.id) || 0;
      return instConn < minConn ? instance : min;
    });
  }

  recordConnection(instanceId: string, delta: number): void {
    const current = this.connections.get(instanceId) || 0;
    this.connections.set(instanceId, Math.max(0, current + delta));
  }
}

// ============================================================================
// 5. 服务代理
// ============================================================================

export class ServiceProxy {
  private registry: ServiceRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();
  private retryPolicy: RetryPolicy;
  private loadBalancer: LoadBalancer;

  constructor(
    registry: ServiceRegistry,
    options?: {
      retry?: Partial<RetryConfig>;
      loadBalancing?: LoadBalancingStrategy;
    }
  ) {
    this.registry = registry;
    this.retryPolicy = new RetryPolicy(options?.retry);
    this.loadBalancer = new LoadBalancer(options?.loadBalancing);
  }

  async call<T>(
    serviceName: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    // 获取服务实例
    const instances = this.registry.discover(serviceName);
    if (instances.length === 0) {
      throw new Error(`No healthy instances found for service: ${serviceName}`);
    }

    // 负载均衡选择
    const instance = this.loadBalancer.select(instances);
    if (!instance) {
      throw new Error(`Failed to select instance for service: ${serviceName}`);
    }

    // 获取或创建熔断器
    const breakerKey = `${serviceName}:${instance.id}`;
    let breaker = this.breakers.get(breakerKey);
    if (!breaker) {
      breaker = new CircuitBreaker(breakerKey);
      this.breakers.set(breakerKey, breaker);
    }

    // 执行调用
    return this.retryPolicy.execute(() =>
      breaker!.execute(() => this.makeRequest(instance, endpoint, data))
    );
  }

  private async makeRequest<T>(
    instance: ServiceInstance,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    this.loadBalancer.recordConnection(instance.id, 1);
    
    try {
      const url = `http://${instance.host}:${instance.port}${endpoint}`;
      console.log(`  → ${url}`);
      
      // 模拟请求
      await new Promise(resolve => setTimeout(resolve, 10));
      
      return { success: true, data, from: instance.id } as T;
    } finally {
      this.loadBalancer.recordConnection(instance.id, -1);
    }
  }

  getCircuitStates(): Map<string, CircuitState> {
    return new Map(
      Array.from(this.breakers.entries()).map(([k, v]) => [k, v.getState()])
    );
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== 微服务通信模式 ===\n');

  // 创建服务注册中心
  const registry = new ServiceRegistry();

  // 注册服务实例
  console.log('1. 服务注册');
  registry.register({
    id: 'user-service-1',
    name: 'user-service',
    host: 'localhost',
    port: 3001,
    metadata: { version: '1.0' },
    health: 'healthy',
    lastHeartbeat: Date.now()
  });
  
  registry.register({
    id: 'user-service-2',
    name: 'user-service',
    host: 'localhost',
    port: 3002,
    metadata: { version: '1.0' },
    health: 'healthy',
    lastHeartbeat: Date.now()
  });

  console.log('   Services:', registry.getAllServices());
  console.log('   User service instances:', registry.discover('user-service').length);

  console.log('\n2. 负载均衡');
  const lb = new LoadBalancer('round-robin');
  const instances = registry.discover('user-service');
  
  for (let i = 0; i < 4; i++) {
    const selected = lb.select(instances);
    console.log(`   Request ${i + 1}: ${selected?.id}`);
  }

  console.log('\n3. 熔断器');
  const breaker = new CircuitBreaker('test-service', {
    failureThreshold: 3,
    resetTimeout: 5000
  });

  // 模拟失败
  for (let i = 0; i < 5; i++) {
    try {
      await breaker.execute(async () => {
        throw new Error('Service error');
      });
    } catch (error) {
      console.log(`   Attempt ${i + 1}: ${breaker.getState()}`);
    }
  }

  console.log('\n4. 重试机制');
  const retry = new RetryPolicy({
    maxAttempts: 3,
    delay: 100,
    backoff: 'exponential'
  });

  const result = await retry.execute(async () => {
    console.log('   Executing with retry...');
    return 'success';
  });
  console.log('   Result:', result);

  console.log('\n微服务通信要点:');
  console.log('- 服务发现：动态注册和发现服务实例');
  console.log('- 熔断器：防止故障级联');
  console.log('- 重试机制：自动恢复临时故障');
  console.log('- 负载均衡：分散请求压力');
  console.log('- 健康检查：自动剔除故障实例');

  registry.destroy();
}

// ============================================================================
// 导出 (已在上面导出)
// ============================================================================
