---
dimension: 综合
sub-dimension: Service mesh advanced
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Service mesh advanced 核心概念与工程实践。

## 包含内容

- 本模块聚焦 service mesh advanced 核心概念与工程实践。
- 涵盖 Sidecar-less 架构、L7 流量管理与可观测性注入模式。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 服务网格理论形式化定义 |
| mesh-architecture.ts | 源码 | 轻量服务网格控制面 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

### L7 流量管理与负载均衡

```typescript
// mesh-architecture.ts — 轻量 L7 流量管理
interface RouteRule {
  path: string;
  targets: { host: string; weight: number }[];
  retries: number;
  timeoutMs: number;
}

class ServiceMeshProxy {
  constructor(private routes: RouteRule[]) {}

  async forward(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const rule = this.routes.find(r => url.pathname.startsWith(r.path));
    if (!rule) return new Response('Not Found', { status: 404 });

    const target = this.selectTarget(rule.targets);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), rule.timeoutMs);

    for (let i = 0; i <= rule.retries; i++) {
      try {
        const res = await fetch(`http://${target}${url.pathname}`, {
          signal: controller.signal,
        });
        clearTimeout(timer);
        return res;
      } catch (err) {
        if (i === rule.retries) throw err;
      }
    }
    return new Response('Service Unavailable', { status: 503 });
  }

  private selectTarget(targets: RouteRule['targets']): string {
    const total = targets.reduce((s, t) => s + t.weight, 0);
    let pick = Math.random() * total;
    for (const t of targets) {
      pick -= t.weight;
      if (pick <= 0) return t.host;
    }
    return targets[0].host;
  }
}
```

### 熔断器模式（Circuit Breaker）

```typescript
// circuit-breaker.ts — 服务网格熔断器
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  halfOpenMaxCalls: number;
}

enum CircuitState { Closed, Open, HalfOpen }

class CircuitBreaker {
  private state = CircuitState.Closed;
  private failures = 0;
  private nextAttempt = 0;
  private halfOpenCalls = 0;

  constructor(private config: CircuitBreakerConfig) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.Open) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HalfOpen;
      this.halfOpenCalls = 0;
    }

    if (this.state === CircuitState.HalfOpen && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      throw new Error('Circuit breaker is HALF_OPEN (max calls reached)');
    }

    if (this.state === CircuitState.HalfOpen) this.halfOpenCalls++;

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    if (this.state === CircuitState.HalfOpen) {
      this.state = CircuitState.Closed;
    }
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.config.failureThreshold) {
      this.state = CircuitState.Open;
      this.nextAttempt = Date.now() + this.config.resetTimeoutMs;
    }
  }

  get currentState(): CircuitState { return this.state; }
}
```

### 分布式链路追踪（OpenTelemetry 风格）

```typescript
// tracing.ts — 轻量分布式追踪注入
interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
}

function generateTraceId(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

function generateSpanId(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function injectTraceHeaders(ctx: TraceContext): Record<string, string> {
  return {
    'traceparent': `00-${ctx.traceId}-${ctx.spanId}-${ctx.sampled ? '01' : '00'}`,
  };
}

function extractTraceHeaders(headers: Headers): TraceContext | null {
  const traceparent = headers.get('traceparent');
  if (!traceparent) return null;
  const [, traceId, spanId, flags] = traceparent.split('-');
  return {
    traceId,
    spanId: generateSpanId(), // 当前 span 为新 ID
    parentSpanId: spanId,
    sampled: flags === '01',
  };
}
```

### mTLS 服务间认证概念

```typescript
// mtls-concept.ts — 服务网格 mTLS 握手概念实现
interface X509Certificate {
  subject: string;
  issuer: string;
  notBefore: Date;
  notAfter: Date;
  publicKey: CryptoKey;
}

class MeshMTLS {
  private caStore = new Map<string, X509Certificate>();

  addTrustedCA(cert: X509Certificate) {
    this.caStore.set(cert.subject, cert);
  }

  async verifyPeerCertificate(peerCert: X509Certificate): Promise<boolean> {
    const now = new Date();
    if (now < peerCert.notBefore || now > peerCert.notAfter) {
      console.error('Certificate expired or not yet valid');
      return false;
    }

    const issuer = this.caStore.get(peerCert.issuer);
    if (!issuer) {
      console.error('Unknown certificate issuer');
      return false;
    }

    // 实际生产中使用 Web Crypto API 验证签名
    console.log(`Verified certificate for ${peerCert.subject} issued by ${peerCert.issuer}`);
    return true;
  }

  async performHandshake(clientCert: X509Certificate, serverCert: X509Certificate): Promise<boolean> {
    const clientOk = await this.verifyPeerCertificate(serverCert);
    const serverOk = await this.verifyPeerCertificate(clientCert);
    return clientOk && serverOk;
  }
}

// 可运行示例
const mesh = new MeshMTLS();
const caCert: X509Certificate = {
  subject: 'Mesh Root CA',
  issuer: 'Mesh Root CA',
  notBefore: new Date('2026-01-01'),
  notAfter: new Date('2027-01-01'),
  publicKey: {} as CryptoKey,
};
mesh.addTrustedCA(caCert);
console.log('mTLS CA initialized');
```

### 指数退避重试

```typescript
// retry-backoff.ts — 带抖动的指数退避重试
interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt === config.maxRetries) break;

      const delay = Math.min(
        config.baseDelayMs * Math.pow(2, attempt),
        config.maxDelayMs
      );
      const jittered = config.jitter ? delay * (0.5 + Math.random() * 0.5) : delay;
      console.log(`Retry ${attempt + 1}/${config.maxRetries} after ${Math.round(jittered)}ms`);
      await new Promise((r) => setTimeout(r, jittered));
    }
  }

  throw lastError;
}

// 可运行示例
let attempts = 0;
retryWithBackoff(
  async () => {
    attempts++;
    if (attempts < 3) throw new Error('Transient failure');
    return 'Success!';
  },
  { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 2000, jitter: true }
).then((r) => console.log(r));
```

### 健康检查探针

```typescript
// health-probe.ts — Kubernetes 风格健康检查
interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  checks: Record<string, { status: 'pass' | 'fail'; latencyMs: number; message?: string }>;
}

class HealthProbe {
  private checks = new Map<string, () => Promise<{ ok: boolean; message?: string }>>();

  register(name: string, check: () => Promise<{ ok: boolean; message?: string }>) {
    this.checks.set(name, check);
  }

  async run(): Promise<HealthStatus> {
    const results: HealthStatus['checks'] = {};
    let allPass = true;

    for (const [name, check] of this.checks) {
      const start = performance.now();
      try {
        const result = await check();
        results[name] = {
          status: result.ok ? 'pass' : 'fail',
          latencyMs: Math.round(performance.now() - start),
          message: result.message,
        };
        if (!result.ok) allPass = false;
      } catch (err) {
        results[name] = {
          status: 'fail',
          latencyMs: Math.round(performance.now() - start),
          message: (err as Error).message,
        };
        allPass = false;
      }
    }

    const degradedCount = Object.values(results).filter((r) => r.status === 'fail').length;
    const status = allPass ? 'healthy' : degradedCount >= this.checks.size / 2 ? 'unhealthy' : 'degraded';

    return { status, checks: results };
  }
}

// 可运行示例
const probe = new HealthProbe();
probe.register('database', async () => ({ ok: true, message: 'Connected' }));
probe.register('cache', async () => ({ ok: false, message: 'Connection timeout' }));
probe.register('upstream', async () => ({ ok: true }));

probe.run().then((status) => console.log('Health:', status.status, status.checks));
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 mesh-architecture.test.ts
- 📄 mesh-architecture.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Istio Documentation | 官方文档 | [istio.io/latest/docs](https://istio.io/latest/docs/) |
| Linkerd Architecture | 官方文档 | [linkerd.io/2.15/reference/architecture](https://linkerd.io/2.15/reference/architecture/) |
| Envoy Proxy Documentation | 官方文档 | [envoyproxy.io/docs](https://www.envoyproxy.io/docs) |
| eBPF-based Service Mesh (Cilium) | 官方文档 | [docs.cilium.io/en/stable/network/servicemesh](https://docs.cilium.io/en/stable/network/servicemesh/) |
| Service Mesh Interface (SMI) Spec | 规范 | [smi-spec.io](https://smi-spec.io/) |
| OpenTelemetry Specification | 规范 | [opentelemetry.io/docs/specs/otel](https://opentelemetry.io/docs/specs/otel/) |
| W3C Trace Context | 规范 | [w3.org/TR/trace-context](https://www.w3.org/TR/trace-context/) |
| Cloud Native Patterns — Circuit Breaker | 指南 | [learn.microsoft.com/azure/architecture/patterns/circuit-breaker](https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker) |
| Envoy Retry & Circuit Breaker Policies | 官方文档 | [envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking) |
| gRPC Load Balancing | 指南 | [grpc.io/docs/guides/service-config](https://grpc.io/docs/guides/service-config/) |
| Istio Security — mTLS | 官方文档 | [istio.io/latest/docs/concepts/security](https://istio.io/latest/docs/concepts/security/) |
| Cilium Service Mesh — Sidecar-less | 官方文档 | [docs.cilium.io/en/stable/network/servicemesh/ingress](https://docs.cilium.io/en/stable/network/servicemesh/ingress/) |
| Kubernetes Probes | 官方文档 | [kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes) |
| AWS App Mesh | 官方文档 | [aws.amazon.com/app-mesh](https://aws.amazon.com/app-mesh/) |
| NGINX Service Mesh | 官方文档 | [docs.nginx.com/nginx-service-mesh](https://docs.nginx.com/nginx-service-mesh/) |
| Service Mesh Comparison (CNCF)](https://layer5.io/service-mesh-landscape) | 对比 | [layer5.io/service-mesh-landscape](https://layer5.io/service-mesh-landscape) |
| Zero Trust Architecture — NIST](https://csrc.nist.gov/publications/detail/sp/800-207/final) | 规范 | [csrc.nist.gov/publications/detail/sp/800-207/final](https://csrc.nist.gov/publications/detail/sp/800-207/final) |

---

*最后更新: 2026-04-29*
