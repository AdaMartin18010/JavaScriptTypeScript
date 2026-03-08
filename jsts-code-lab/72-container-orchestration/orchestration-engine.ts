/**
 * @file 编排引擎
 * @category Container Orchestration → Engine
 * @difficulty hard
 * @tags kubernetes, scheduling, autoscaling, health-check
 */

export interface Container {
  id: string;
  image: string;
  resources: { cpu: number; memory: number };
  ports: number[];
  env: Record<string, string>;
  status: 'pending' | 'running' | 'failed' | 'stopped';
  nodeId?: string;
  restartCount: number;
  healthCheck?: HealthCheckConfig;
}

export interface Node {
  id: string;
  capacity: { cpu: number; memory: number };
  allocated: { cpu: number; memory: number };
  labels: Record<string, string>;
  status: 'ready' | 'not-ready' | 'draining';
  containers: string[];
}

export interface HealthCheckConfig {
  path?: string;
  port: number;
  interval: number;
  timeout: number;
  retries: number;
}

// 调度器
export class Scheduler {
  private nodes: Map<string, Node> = new Map();
  
  addNode(node: Node): void {
    this.nodes.set(node.id, node);
  }
  
  schedule(container: Container): string | null {
    // 过滤可用节点
    const availableNodes = Array.from(this.nodes.values())
      .filter(n => n.status === 'ready')
      .filter(n => 
        n.capacity.cpu - n.allocated.cpu >= container.resources.cpu &&
        n.capacity.memory - n.allocated.memory >= container.resources.memory
      );
    
    if (availableNodes.length === 0) {
      console.log(`[Scheduler] 无可用节点调度容器 ${container.id}`);
      return null;
    }
    
    // 选择资源最充足的节点（Best Fit）
    const selected = availableNodes.sort((a, b) => {
      const aScore = (a.capacity.cpu - a.allocated.cpu) / a.capacity.cpu;
      const bScore = (b.capacity.cpu - b.allocated.cpu) / b.capacity.cpu;
      return bScore - aScore;
    })[0];
    
    // 分配资源
    selected.allocated.cpu += container.resources.cpu;
    selected.allocated.memory += container.resources.memory;
    selected.containers.push(container.id);
    
    console.log(`[Scheduler] 容器 ${container.id} 调度到节点 ${selected.id}`);
    return selected.id;
  }
  
  unschedule(container: Container): void {
    if (!container.nodeId) return;
    
    const node = this.nodes.get(container.nodeId);
    if (!node) return;
    
    node.allocated.cpu -= container.resources.cpu;
    node.allocated.memory -= container.resources.memory;
    node.containers = node.containers.filter(id => id !== container.id);
    
    console.log(`[Scheduler] 容器 ${container.id} 从节点 ${node.id} 移除`);
  }
  
  getNodeUtilization(nodeId: string): { cpu: number; memory: number } | null {
    const node = this.nodes.get(nodeId);
    if (!node) return null;
    
    return {
      cpu: (node.allocated.cpu / node.capacity.cpu) * 100,
      memory: (node.allocated.memory / node.capacity.memory) * 100
    };
  }
}

// 健康检查
export class HealthChecker {
  private checks: Map<string, ReturnType<typeof setInterval>> = new Map();
  private healthStatus: Map<string, { healthy: boolean; lastCheck: number; failures: number }> = new Map();
  
  startCheck(container: Container, callback: (healthy: boolean) => void): void {
    if (!container.healthCheck) return;
    
    const config = container.healthCheck;
    
    const interval = setInterval(async () => {
      const healthy = await this.performCheck(container);
      
      const status = this.healthStatus.get(container.id) || { 
        healthy: true, 
        lastCheck: Date.now(), 
        failures: 0 
      };
      
      if (healthy) {
        status.failures = 0;
        status.healthy = true;
      } else {
        status.failures++;
        if (status.failures >= config.retries) {
          status.healthy = false;
        }
      }
      
      status.lastCheck = Date.now();
      this.healthStatus.set(container.id, status);
      
      callback(status.healthy);
    }, config.interval);
    
    this.checks.set(container.id, interval);
  }
  
  stopCheck(containerId: string): void {
    const check = this.checks.get(containerId);
    if (check) {
      clearInterval(check);
      this.checks.delete(containerId);
    }
  }
  
  private async performCheck(container: Container): Promise<boolean> {
    // 模拟健康检查
    return Math.random() > 0.1; // 90%成功率
  }
  
  isHealthy(containerId: string): boolean {
    return this.healthStatus.get(containerId)?.healthy ?? true;
  }
}

// 水平自动扩缩容 (HPA)
export interface HPAPolicy {
  minReplicas: number;
  maxReplicas: number;
  targetCPUUtilization: number;
  scaleUpCooldown: number;
  scaleDownCooldown: number;
}

export class HorizontalPodAutoscaler {
  private policies: Map<string, HPAPolicy> = new Map();
  private metrics: Map<string, number[]> = new Map();
  private lastScaleTime: Map<string, number> = new Map();
  private currentReplicas: Map<string, number> = new Map();
  
  registerDeployment(deploymentId: string, policy: HPAPolicy): void {
    this.policies.set(deploymentId, policy);
    this.currentReplicas.set(deploymentId, policy.minReplicas);
  }
  
  recordMetrics(deploymentId: string, cpuUtilization: number): void {
    if (!this.metrics.has(deploymentId)) {
      this.metrics.set(deploymentId, []);
    }
    
    const metrics = this.metrics.get(deploymentId)!;
    metrics.push(cpuUtilization);
    
    // 保留最近10个数据点
    if (metrics.length > 10) {
      metrics.shift();
    }
  }
  
  evaluateScaling(deploymentId: string): { action: 'scale-up' | 'scale-down' | 'none'; targetReplicas: number } {
    const policy = this.policies.get(deploymentId);
    if (!policy) return { action: 'none', targetReplicas: 0 };
    
    const metrics = this.metrics.get(deploymentId) || [];
    if (metrics.length < 3) return { action: 'none', targetReplicas: 0 };
    
    const avgCpu = metrics.reduce((a, b) => a + b, 0) / metrics.length;
    const current = this.currentReplicas.get(deploymentId)!;
    
    // 检查冷却时间
    const lastScale = this.lastScaleTime.get(deploymentId) || 0;
    const now = Date.now();
    
    // 扩容
    if (avgCpu > policy.targetCPUUtilization * 1.1) {
      if (now - lastScale < policy.scaleUpCooldown) {
        return { action: 'none', targetReplicas: current };
      }
      
      const target = Math.min(current + 1, policy.maxReplicas);
      if (target > current) {
        this.lastScaleTime.set(deploymentId, now);
        this.currentReplicas.set(deploymentId, target);
        return { action: 'scale-up', targetReplicas: target };
      }
    }
    
    // 缩容
    if (avgCpu < policy.targetCPUUtilization * 0.8) {
      if (now - lastScale < policy.scaleDownCooldown) {
        return { action: 'none', targetReplicas: current };
      }
      
      const target = Math.max(current - 1, policy.minReplicas);
      if (target < current) {
        this.lastScaleTime.set(deploymentId, now);
        this.currentReplicas.set(deploymentId, target);
        return { action: 'scale-down', targetReplicas: target };
      }
    }
    
    return { action: 'none', targetReplicas: current };
  }
  
  getCurrentReplicas(deploymentId: string): number {
    return this.currentReplicas.get(deploymentId) || 1;
  }
}

// 服务发现
export class ServiceRegistry {
  private services: Map<string, { containers: string[]; port: number }> = new Map();
  private endpoints: Map<string, string[]> = new Map();
  
  registerService(name: string, containerId: string, port: number): void {
    if (!this.services.has(name)) {
      this.services.set(name, { containers: [], port });
    }
    
    const service = this.services.get(name)!;
    if (!service.containers.includes(containerId)) {
      service.containers.push(containerId);
    }
    
    console.log(`[ServiceRegistry] 服务 ${name} 注册容器 ${containerId}:${port}`);
  }
  
  deregisterService(name: string, containerId: string): void {
    const service = this.services.get(name);
    if (!service) return;
    
    service.containers = service.containers.filter(id => id !== containerId);
    
    if (service.containers.length === 0) {
      this.services.delete(name);
    }
  }
  
  discover(serviceName: string): { endpoints: string[]; port: number } | null {
    const service = this.services.get(serviceName);
    if (!service) return null;
    
    // 返回所有端点
    return {
      endpoints: service.containers,
      port: service.port
    };
  }
  
  // 负载均衡选择
  selectEndpoint(serviceName: string, strategy: 'round-robin' | 'random' = 'round-robin'): string | null {
    const service = this.services.get(serviceName);
    if (!service || service.containers.length === 0) return null;
    
    if (strategy === 'random') {
      return service.containers[Math.floor(Math.random() * service.containers.length)];
    }
    
    // 简单的轮询
    const endpoints = this.endpoints.get(serviceName) || [];
    const selected = service.containers[endpoints.length % service.containers.length];
    endpoints.push(selected);
    this.endpoints.set(serviceName, endpoints);
    
    return selected;
  }
}

export function demo(): void {
  console.log('=== 容器编排 ===\n');
  
  // 调度器
  const scheduler = new Scheduler();
  
  // 添加节点
  scheduler.addNode({
    id: 'node-1',
    capacity: { cpu: 4, memory: 8192 },
    allocated: { cpu: 0, memory: 0 },
    labels: { zone: 'a', type: 'compute' },
    status: 'ready',
    containers: []
  });
  
  scheduler.addNode({
    id: 'node-2',
    capacity: { cpu: 4, memory: 8192 },
    allocated: { cpu: 0, memory: 0 },
    labels: { zone: 'b', type: 'compute' },
    status: 'ready',
    containers: []
  });
  
  // 创建容器
  const container: Container = {
    id: 'web-app-1',
    image: 'nginx:latest',
    resources: { cpu: 0.5, memory: 512 },
    ports: [80],
    env: { ENV: 'production' },
    status: 'pending',
    restartCount: 0,
    healthCheck: { port: 80, interval: 30000, timeout: 5000, retries: 3 }
  };
  
  const nodeId = scheduler.schedule(container);
  console.log('节点利用率:', scheduler.getNodeUtilization(nodeId || ''));
  
  // HPA
  console.log('\n--- 自动扩缩容 ---');
  const hpa = new HorizontalPodAutoscaler();
  hpa.registerDeployment('web-service', {
    minReplicas: 2,
    maxReplicas: 10,
    targetCPUUtilization: 70,
    scaleUpCooldown: 60000,
    scaleDownCooldown: 300000
  });
  
  // 模拟高负载
  for (let i = 0; i < 5; i++) {
    hpa.recordMetrics('web-service', 85);
  }
  
  const decision = hpa.evaluateScaling('web-service');
  console.log(`扩容决策: ${decision.action}, 目标副本: ${decision.targetReplicas}`);
  
  // 服务发现
  console.log('\n--- 服务发现 ---');
  const registry = new ServiceRegistry();
  registry.registerService('api-gateway', 'container-1', 8080);
  registry.registerService('api-gateway', 'container-2', 8080);
  registry.registerService('api-gateway', 'container-3', 8080);
  
  console.log('服务端点:', registry.discover('api-gateway'));
  console.log('轮询选择:', registry.selectEndpoint('api-gateway'));
  console.log('轮询选择:', registry.selectEndpoint('api-gateway'));
}
