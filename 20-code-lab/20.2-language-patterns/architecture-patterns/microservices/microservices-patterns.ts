/**
 * @file 微服务架构模式
 * @category Architecture Patterns → Microservices
 * @difficulty hard
 * @tags architecture, microservices, distributed-systems, service-mesh
 * 
 * @description
 * 微服务架构将应用拆分为一组小型、独立部署的服务：
 * - 服务注册与发现
 * - API 网关
 * - 断路器模式
 * - 负载均衡
 * - 事件驱动通信
 */

// ============================================================================
// 1. 服务注册与发现
// ============================================================================

export interface ServiceInstance {
  id: string;
  name: string;
  host: string;
  port: number;
  health: 'healthy' | 'unhealthy' | 'unknown';
  metadata: Record<string, string>;
  lastHeartbeat: number;
}

export class ServiceRegistry {
  private services = new Map<string, ServiceInstance[]>();

  register(instance: ServiceInstance): void {
    const instances = this.services.get(instance.name) || [];
    const existingIndex = instances.findIndex(i => i.id === instance.id);
    
    if (existingIndex >= 0) {
      instances[existingIndex] = instance;
    } else {
      instances.push(instance);
    }
    
    this.services.set(instance.name, instances);
    console.log(`[Registry] 服务注册: ${instance.name}@${instance.host}:${instance.port}`);
  }

  deregister(serviceName: string, instanceId: string): void {
    const instances = this.services.get(serviceName);
    if (instances) {
      const filtered = instances.filter(i => i.id !== instanceId);
      this.services.set(serviceName, filtered);
      console.log(`[Registry] 服务注销: ${serviceName}/${instanceId}`);
    }
  }

  discover(serviceName: string): ServiceInstance[] {
    const instances = this.services.get(serviceName) || [];
    return instances.filter(i => i.health === 'healthy');
  }

  updateHealth(serviceName: string, instanceId: string, health: ServiceInstance['health']): void {
    const instances = this.services.get(serviceName);
    if (instances) {
      const instance = instances.find(i => i.id === instanceId);
      if (instance) {
        instance.health = health;
        instance.lastHeartbeat = Date.now();
      }
    }
  }

  getAllServices(): Record<string, ServiceInstance[]> {
    return Object.fromEntries(this.services);
  }
}

// ============================================================================
// 2. API 网关
// ============================================================================

export interface ApiRequest {
  path: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
}

export interface ApiResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
}

export type RouteHandler = (req: ApiRequest) => Promise<ApiResponse>;

export class ApiGateway {
  private routes = new Map<string, { service: string; path: string }>();
  private loadBalancers = new Map<string, LoadBalancer>();

  constructor(
    private registry: ServiceRegistry,
    private circuitBreakers: Map<string, CircuitBreaker> = new Map()
  ) {}

  // 注册路由规则
  addRoute(pathPattern: string, serviceName: string, servicePath: string): void {
    this.routes.set(pathPattern, { service: serviceName, path: servicePath });
    console.log(`[Gateway] 路由注册: ${pathPattern} -> ${serviceName}${servicePath}`);
  }

  // 处理请求
  async handleRequest(request: ApiRequest): Promise<ApiResponse> {
    const route = this.matchRoute(request.path);
    if (!route) {
      return { status: 404, headers: {}, body: { error: 'Route not found' } };
    }

    const { service, path } = route;
    
    // 获取断路器
    let cb = this.circuitBreakers.get(service);
    if (!cb) {
      cb = new CircuitBreaker(service, async (req) => this.forwardRequest(service, req));
      this.circuitBreakers.set(service, cb);
    }

    // 通过断路器执行
    try {
      return await cb.execute({ ...request, path: path + request.path.replace(route.pathPattern, '') });
    } catch (error) {
      return { 
        status: 503, 
        headers: {}, 
        body: { error: 'Service unavailable', service } 
      };
    }
  }

  private matchRoute(path: string): { pathPattern: string; service: string; path: string } | null {
    for (const [pattern, target] of this.routes) {
      if (path.startsWith(pattern.replace('/*', ''))) {
        return { pathPattern: pattern, ...target };
      }
    }
    return null;
  }

  private async forwardRequest(serviceName: string, request: ApiRequest): Promise<ApiResponse> {
    const instances = this.registry.discover(serviceName);
    if (instances.length === 0) {
      throw new Error(`No healthy instances for service: ${serviceName}`);
    }

    // 获取或创建负载均衡器
    let lb = this.loadBalancers.get(serviceName);
    if (!lb) {
      lb = new RoundRobinBalancer(instances);
      this.loadBalancers.set(serviceName, lb);
    } else {
      lb.updateInstances(instances);
    }

    const instance = lb.next();
    console.log(`[Gateway] 转发请求到 ${serviceName}@${instance.host}:${instance.port}${request.path}`);

    // 模拟请求转发
    return {
      status: 200,
      headers: { 'X-Service': serviceName },
      body: { 
        service: serviceName, 
        instance: `${instance.host}:${instance.port}`,
        path: request.path 
      }
    };
  }
}

// ============================================================================
// 3. 断路器模式
// ============================================================================

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private readonly failureThreshold = 5;
  private readonly successThreshold = 3;
  private readonly timeout = 30000; // 30秒

  constructor(
    private name: string,
    private operation: (req: ApiRequest) => Promise<ApiResponse>
  ) {}

  async execute(request: ApiRequest): Promise<ApiResponse> {
    if (this.state === 'OPEN') {
      if (Date.now() - (this.lastFailureTime || 0) > this.timeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
        console.log(`[CircuitBreaker:${this.name}] 状态: OPEN -> HALF_OPEN`);
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const response = await this.operation(request);
      this.onSuccess();
      return response;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        console.log(`[CircuitBreaker:${this.name}] 状态: HALF_OPEN -> CLOSED`);
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      console.log(`[CircuitBreaker:${this.name}] 状态: ${this.state} -> OPEN`);
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// ============================================================================
// 4. 负载均衡器
// ============================================================================

abstract class LoadBalancer {
  protected instances: ServiceInstance[] = [];

  constructor(instances: ServiceInstance[] = []) {
    this.instances = instances;
  }

  updateInstances(instances: ServiceInstance[]): void {
    this.instances = instances;
  }

  abstract next(): ServiceInstance;
}

class RoundRobinBalancer extends LoadBalancer {
  private currentIndex = 0;

  next(): ServiceInstance {
    if (this.instances.length === 0) {
      throw new Error('No instances available');
    }
    const instance = this.instances[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.instances.length;
    return instance;
  }
}

class RandomBalancer extends LoadBalancer {
  next(): ServiceInstance {
    if (this.instances.length === 0) {
      throw new Error('No instances available');
    }
    const index = Math.floor(Math.random() * this.instances.length);
    return this.instances[index];
  }
}

// ============================================================================
// 5. 事件总线 (服务间异步通信)
// ============================================================================

export interface DomainEvent {
  type: string;
  payload: unknown;
  timestamp: number;
  service: string;
}

export class EventBus {
  private handlers = new Map<string, ((event: DomainEvent) => void)[]>();

  subscribe(eventType: string, handler: (event: DomainEvent) => void): () => void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);

    return () => {
      const idx = handlers.indexOf(handler);
      if (idx > -1) handlers.splice(idx, 1);
    };
  }

  publish(event: DomainEvent): void {
    console.log(`[EventBus] 事件发布: ${event.type} from ${event.service}`);
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error(`[EventBus] 处理器错误:`, error);
      }
    });
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 微服务架构模式演示 ===\n');

  // 创建注册中心
  const registry = new ServiceRegistry();

  // 注册服务实例
  registry.register({
    id: 'user-1',
    name: 'user-service',
    host: 'localhost',
    port: 8001,
    health: 'healthy',
    metadata: { version: '1.0' },
    lastHeartbeat: Date.now()
  });

  registry.register({
    id: 'order-1',
    name: 'order-service',
    host: 'localhost',
    port: 8002,
    health: 'healthy',
    metadata: { version: '1.0' },
    lastHeartbeat: Date.now()
  });

  registry.register({
    id: 'order-2',
    name: 'order-service',
    host: 'localhost',
    port: 8003,
    health: 'healthy',
    metadata: { version: '1.1' },
    lastHeartbeat: Date.now()
  });

  // 创建 API 网关
  const gateway = new ApiGateway(registry);
  gateway.addRoute('/api/users', 'user-service', '/users');
  gateway.addRoute('/api/orders', 'order-service', '/orders');

  // 模拟请求
  console.log('');
  gateway.handleRequest({ path: '/api/users/123', method: 'GET', headers: {} });
  gateway.handleRequest({ path: '/api/orders', method: 'GET', headers: {} });
  gateway.handleRequest({ path: '/api/orders', method: 'POST', headers: {}, body: {} });

  // 事件总线演示
  console.log('\n=== 事件总线演示 ===');
  const eventBus = new EventBus();
  
  eventBus.subscribe('OrderCreated', (event) => {
    console.log(`[Handler] 处理订单创建:`, event.payload);
  });

  eventBus.subscribe('OrderCreated', (event) => {
    console.log(`[Handler] 发送通知邮件:`, event.payload);
  });

  eventBus.publish({
    type: 'OrderCreated',
    payload: { orderId: 'ORD-001', amount: 199 },
    timestamp: Date.now(),
    service: 'order-service'
  });
}

// ============================================================================
// 导出
// ============================================================================

// (已在上方使用 export class 直接导出，此处无需重复导出)
