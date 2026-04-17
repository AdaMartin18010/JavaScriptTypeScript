/**
 * @file 服务发现模式实现
 * @category Distributed Systems → Service Discovery
 * @difficulty medium
 * @tags service-discovery, registry, health-check, load-balancer
 *
 * @description
 * 服务发现是微服务架构中的核心组件，允许服务消费者动态定位服务提供者。
 * 本实现包含服务注册表、健康检查和简单的负载均衡策略。
 *
 * 核心概念：
 * - Service Registry：维护服务名到实例列表的映射
 * - Health Check：定期检测实例可用性
 * - Load Balancing：从健康实例中选择目标（Round Robin / Random）
 */

export interface ServiceInstance {
  /** 实例唯一标识 */
  id: string;
  /** 服务主机地址 */
  host: string;
  /** 服务端口号 */
  port: number;
  /** 附加元数据 */
  metadata: Record<string, string>;
  /** 健康状态 */
  healthy: boolean;
}

export interface ServiceRegistryOptions {
  /** 健康检查间隔（毫秒） */
  healthCheckIntervalMs?: number;
}

export class ServiceRegistry {
  private services = new Map<string, ServiceInstance[]>();
  private roundRobinCounters = new Map<string, number>();

  constructor(private options: ServiceRegistryOptions = {}) {}

  /**
   * 注册服务实例
   * @param serviceName - 服务名
   * @param instance - 实例信息
   */
  register(serviceName: string, instance: ServiceInstance): void {
    const instances = this.services.get(serviceName) ?? [];
    const idx = instances.findIndex(i => i.id === instance.id);
    if (idx >= 0) {
      instances[idx] = instance;
    } else {
      instances.push(instance);
    }
    this.services.set(serviceName, instances);
  }

  /**
   * 注销服务实例
   * @param serviceName - 服务名
   * @param instanceId - 实例 ID
   */
  deregister(serviceName: string, instanceId: string): void {
    const instances = this.services.get(serviceName);
    if (!instances) return;
    const filtered = instances.filter(i => i.id !== instanceId);
    this.services.set(serviceName, filtered);
  }

  /**
   * 发现指定服务的所有实例
   * @param serviceName - 服务名
   */
  discover(serviceName: string): ServiceInstance[] {
    return this.services.get(serviceName) ?? [];
  }

  /**
   * 获取健康的实例列表
   * @param serviceName - 服务名
   */
  getHealthyInstances(serviceName: string): ServiceInstance[] {
    return this.discover(serviceName).filter(i => i.healthy);
  }

  /**
   * 更新实例健康状态
   * @param serviceName - 服务名
   * @param instanceId - 实例 ID
   * @param healthy - 是否健康
   */
  updateHealth(serviceName: string, instanceId: string, healthy: boolean): void {
    const instances = this.services.get(serviceName);
    if (!instances) return;
    const instance = instances.find(i => i.id === instanceId);
    if (instance) {
      instance.healthy = healthy;
    }
  }

  /**
   * 使用 Round Robin 策略选择一个健康实例
   * @param serviceName - 服务名
   * @returns 选中的实例，若没有健康实例则返回 undefined
   */
  selectRoundRobin(serviceName: string): ServiceInstance | undefined {
    const healthy = this.getHealthyInstances(serviceName);
    if (healthy.length === 0) return undefined;

    const counter = this.roundRobinCounters.get(serviceName) ?? 0;
    const instance = healthy[counter % healthy.length];
    this.roundRobinCounters.set(serviceName, counter + 1);
    return instance;
  }

  /**
   * 使用随机策略选择一个健康实例
   * @param serviceName - 服务名
   */
  selectRandom(serviceName: string): ServiceInstance | undefined {
    const healthy = this.getHealthyInstances(serviceName);
    if (healthy.length === 0) return undefined;
    return healthy[Math.floor(Math.random() * healthy.length)];
  }

  /**
   * 获取所有已注册的服务名
   */
  getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }
}

export function demo(): void {
  console.log('=== 服务发现 ===\n');

  const registry = new ServiceRegistry();

  registry.register('order-service', {
    id: 'order-1',
    host: '10.0.1.10',
    port: 8080,
    metadata: { version: 'v1' },
    healthy: true
  });
  registry.register('order-service', {
    id: 'order-2',
    host: '10.0.1.11',
    port: 8080,
    metadata: { version: 'v2' },
    healthy: true
  });
  registry.register('order-service', {
    id: 'order-3',
    host: '10.0.1.12',
    port: 8080,
    metadata: { version: 'v1' },
    healthy: false
  });

  console.log('order-service 所有实例:', registry.discover('order-service').length);
  console.log('order-service 健康实例:', registry.getHealthyInstances('order-service').length);

  console.log('\nRound Robin 选择:');
  for (let i = 0; i < 4; i++) {
    const inst = registry.selectRoundRobin('order-service');
    console.log(`  ${inst?.id} @ ${inst?.host}:${inst?.port}`);
  }
}
