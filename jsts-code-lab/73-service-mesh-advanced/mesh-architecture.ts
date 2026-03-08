/**
 * @file 服务网格架构
 * @category Service Mesh → Architecture
 * @difficulty hard
 * @tags service-mesh, istio, traffic-management, mTLS
 */

export interface Service {
  name: string;
  version: string;
  endpoints: string[];
  labels: Record<string, string>;
}

export interface TrafficRule {
  source?: string;
  destination: string;
  weight: number;
  headers?: Record<string, string>;
  retries?: { attempts: number; timeout: number };
  timeout?: number;
}

// Sidecar代理
export class SidecarProxy {
  private routes: Map<string, TrafficRule[]> = new Map();
  private mTLSEnabled = true;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  
  constructor(private serviceName: string) {}
  
  addRoute(destination: string, rules: TrafficRule[]): void {
    this.routes.set(destination, rules);
  }
  
  async handleRequest(request: { path: string; headers: Record<string, string>; body: unknown }): Promise<{ status: number; body: unknown }> {
    // 1. 路由决策
    const route = this.selectRoute(request);
    if (!route) {
      return { status: 404, body: { error: 'No route found' } };
    }
    
    // 2. 熔断检查
    const cb = this.getCircuitBreaker(route.destination);
    if (!cb.allowRequest()) {
      return { status: 503, body: { error: 'Circuit breaker open' } };
    }
    
    // 3. 超时控制
    const timeout = route.timeout || 30000;
    
    try {
      // 4. 重试逻辑
      let lastError: Error | null = null;
      const attempts = route.retries?.attempts || 1;
      
      for (let i = 0; i < attempts; i++) {
        try {
          const result = await this.forwardRequest(route, request, timeout);
          cb.recordSuccess();
          return result;
        } catch (error) {
          lastError = error as Error;
          if (i < attempts - 1) {
            await this.delay(route.retries?.timeout || 1000);
          }
        }
      }
      
      throw lastError;
    } catch (error) {
      cb.recordFailure();
      return { status: 500, body: { error: (error as Error).message } };
    }
  }
  
  private selectRoute(request: { path: string; headers: Record<string, string> }): TrafficRule | null {
    for (const [dest, rules] of this.routes) {
      for (const rule of rules) {
        // 检查header匹配
        if (rule.headers) {
          const matches = Object.entries(rule.headers).every(
            ([key, value]) => request.headers[key] === value
          );
          if (matches) return rule;
        }
      }
    }
    
    // 默认选择第一个
    const allRules = Array.from(this.routes.values()).flat();
    return allRules[0] || null;
  }
  
  private async forwardRequest(
    route: TrafficRule, 
    request: unknown, 
    timeout: number
  ): Promise<{ status: number; body: unknown }> {
    // 模拟请求转发
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          status: 200, 
          body: { service: route.destination, forwarded: true } 
        });
      }, Math.random() * 100);
    });
  }
  
  private getCircuitBreaker(destination: string): CircuitBreaker {
    if (!this.circuitBreakers.has(destination)) {
      this.circuitBreakers.set(destination, new CircuitBreaker());
    }
    return this.circuitBreakers.get(destination)!;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 熔断器
class CircuitBreaker {
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  private failures = 0;
  private lastFailureTime = 0;
  private threshold = 5;
  private timeout = 30000;
  
  allowRequest(): boolean {
    if (this.state === 'closed') return true;
    
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime > this.timeout) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }
    
    return true; // half-open
  }
  
  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }
  
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.threshold) {
      this.state = 'open';
    }
  }
}

// 流量管理
export class TrafficManager {
  private canaryReleases: Map<string, { stable: number; canary: number }> = new Map();
  private trafficSplits: Map<string, Map<string, number>> = new Map();
  
  // 金丝雀发布
  setupCanary(service: string, canaryPercent: number): void {
    this.canaryReleases.set(service, {
      stable: 100 - canaryPercent,
      canary: canaryPercent
    });
  }
  
  // A/B测试流量分割
  setupABTest(service: string, variants: Record<string, number>): void {
    const total = Object.values(variants).reduce((a, b) => a + b, 0);
    if (total !== 100) throw new Error('Variants must sum to 100');
    
    this.trafficSplits.set(service, new Map(Object.entries(variants)));
  }
  
  routeRequest(service: string, userId: string): string {
    // 检查金丝雀
    const canary = this.canaryReleases.get(service);
    if (canary) {
      const hash = this.hashUserId(userId);
      if (hash < canary.canary) {
        return `${service}-canary`;
      }
      return `${service}-stable`;
    }
    
    // 检查A/B测试
    const abTest = this.trafficSplits.get(service);
    if (abTest) {
      const hash = this.hashUserId(userId);
      let cumulative = 0;
      
      for (const [variant, weight] of abTest) {
        cumulative += weight;
        if (hash < cumulative) {
          return `${service}-${variant}`;
        }
      }
    }
    
    return service;
  }
  
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }
}

// 安全通信 (mTLS)
export class MutualTLS {
  private certificates: Map<string, { cert: string; key: string; ca: string }> = new Map();
  
  issueCertificate(serviceName: string): { cert: string; key: string } {
    // 模拟证书签发
    const cert = `-----BEGIN CERTIFICATE-----\n${serviceName}-cert\n-----END CERTIFICATE-----`;
    const key = `-----BEGIN PRIVATE KEY-----\n${serviceName}-key\n-----END PRIVATE KEY-----`;
    
    this.certificates.set(serviceName, { cert, key, ca: 'mesh-ca' });
    
    console.log(`[mTLS] 为 ${serviceName} 签发证书`);
    return { cert, key };
  }
  
  verifyPeer(serviceName: string, peerCert: string): boolean {
    // 验证对等证书
    const stored = this.certificates.get(serviceName);
    if (!stored) return false;
    
    // 简化验证
    return peerCert.includes(serviceName);
  }
  
  rotateCertificate(serviceName: string): { cert: string; key: string } {
    console.log(`[mTLS] 轮转 ${serviceName} 证书`);
    return this.issueCertificate(serviceName);
  }
}

// 可观测性
export class MeshObservability {
  private metrics: Map<string, { requests: number; latency: number[]; errors: number }> = new Map();
  private traces: Array<{ traceId: string; spans: Span[] }> = [];
  
  recordMetrics(service: string, latency: number, error: boolean): void {
    if (!this.metrics.has(service)) {
      this.metrics.set(service, { requests: 0, latency: [], errors: 0 });
    }
    
    const m = this.metrics.get(service)!;
    m.requests++;
    m.latency.push(latency);
    if (error) m.errors++;
  }
  
  startTrace(traceId: string): Trace {
    const trace = new Trace(traceId);
    return trace;
  }
  
  getMetrics(service: string): { requests: number; avgLatency: number; errorRate: number } | null {
    const m = this.metrics.get(service);
    if (!m || m.requests === 0) return null;
    
    const avgLatency = m.latency.reduce((a, b) => a + b, 0) / m.latency.length;
    return {
      requests: m.requests,
      avgLatency,
      errorRate: (m.errors / m.requests) * 100
    };
  }
}

interface Span {
  id: string;
  parentId?: string;
  service: string;
  operation: string;
  startTime: number;
  endTime?: number;
}

class Trace {
  private spans: Span[] = [];
  
  constructor(private traceId: string) {}
  
  startSpan(service: string, operation: string, parentId?: string): string {
    const spanId = Math.random().toString(36).slice(2);
    this.spans.push({
      id: spanId,
      parentId,
      service,
      operation,
      startTime: Date.now()
    });
    return spanId;
  }
  
  endSpan(spanId: string): void {
    const span = this.spans.find(s => s.id === spanId);
    if (span) {
      span.endTime = Date.now();
    }
  }
}

export function demo(): void {
  console.log('=== 高级服务网格 ===\n');
  
  // Sidecar代理
  const proxy = new SidecarProxy('frontend');
  proxy.addRoute('backend', [
    { destination: 'backend-v1', weight: 80 },
    { destination: 'backend-v2', weight: 20, headers: { 'x-canary': 'true' } }
  ]);
  
  // 发送请求
  console.log('--- Sidecar代理 ---');
  proxy.handleRequest({ path: '/api/data', headers: {}, body: {} })
    .then(res => console.log('响应:', res));
  
  // 流量管理
  console.log('\n--- 流量管理 ---');
  const tm = new TrafficManager();
  tm.setupCanary('payment-service', 10);
  
  const users = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
  console.log('金丝雀路由:');
  for (const user of users) {
    const target = tm.routeRequest('payment-service', user);
    console.log(`  ${user} -> ${target}`);
  }
  
  // mTLS
  console.log('\n--- 双向TLS ---');
  const mtls = new MutualTLS();
  mtls.issueCertificate('service-a');
  mtls.issueCertificate('service-b');
  
  // 可观测性
  console.log('\n--- 可观测性 ---');
  const obs = new MeshObservability();
  obs.recordMetrics('api-gateway', 45, false);
  obs.recordMetrics('api-gateway', 120, false);
  obs.recordMetrics('api-gateway', 200, true);
  
  console.log('指标:', obs.getMetrics('api-gateway'));
}
