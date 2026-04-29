---
dimension: 综合
sub-dimension: Microservices
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Microservices 核心概念与工程实践。

## 包含内容

- 本模块聚焦 microservices 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHIVED.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 index.ts
- 📄 service-mesh.test.ts
- 📄 service-mesh.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `service-mesh/` | 服务网格路由、熔断与可观测性 | `service-mesh.ts`, `service-mesh.test.ts` |
| `index/` | 模块入口与公共 API 导出 | `index.ts` |

## 代码示例

### 简易服务网格 sidecar 代理

```typescript
interface ServiceInstance {
  id: string;
  address: string;
  health: 'healthy' | 'unhealthy';
}

class ServiceMesh {
  private registry = new Map<string, ServiceInstance[]>();

  register(name: string, instance: ServiceInstance) {
    const list = this.registry.get(name) ?? [];
    list.push(instance);
    this.registry.set(name, list);
  }

  resolve(name: string): ServiceInstance | undefined {
    const healthy = this.registry.get(name)?.filter((i) => i.health === 'healthy');
    return healthy?.[Math.floor(Math.random() * healthy.length)];
  }
}
```

## 代码示例：熔断器模式（Circuit Breaker）

```typescript
// service-mesh.ts — 熔断器保护下游服务
interface CircuitBreakerOptions {
  failureThreshold: number;     // 连续失败次数阈值
  resetTimeoutMs: number;       // 半开状态等待时间
  halfOpenMaxCalls: number;     // 半开状态允许试探请求数
}

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker<TArgs extends any[], TReturn> {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private nextAttempt = Date.now();
  private halfOpenCalls = 0;

  constructor(
    private fn: (...args: TArgs) => Promise<TReturn>,
    private options: CircuitBreakerOptions
  ) {}

  async execute(...args: TArgs): Promise<TReturn> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
      this.halfOpenCalls = 0;
    }

    if (this.state === 'HALF_OPEN' && this.halfOpenCalls >= this.options.halfOpenMaxCalls) {
      throw new Error('Circuit breaker is OPEN (half-open limit reached)');
    }

    if (this.state === 'HALF_OPEN') {
      this.halfOpenCalls++;
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.options.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.options.resetTimeoutMs;
    }
  }

  getState(): CircuitState { return this.state; }
}

// 使用示例
const paymentService = new CircuitBreaker(
  async (orderId: string) => {
    const res = await fetch(`http://payment-service/charge/${orderId}`);
    if (!res.ok) throw new Error('Payment failed');
    return res.json();
  },
  { failureThreshold: 5, resetTimeoutMs: 30000, halfOpenMaxCalls: 2 }
);

// 正常调用，熔断器自动保护
try {
  const result = await paymentService.execute('order-123');
} catch (err) {
  console.error('Fallback to queue for later processing');
}
```

## 代码示例：指数退避重试

```typescript
// service-mesh.ts — 带抖动的指数退避重试策略
async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    baseDelayMs: number;
    maxDelayMs: number;
    retryableErrors?: (error: Error) => boolean;
  }
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      
      if (attempt === options.maxRetries) break;
      if (options.retryableErrors && !options.retryableErrors(lastError)) throw lastError;

      // 指数退避 + 全抖动（防止惊群）
      const exponential = Math.min(
        options.baseDelayMs * Math.pow(2, attempt),
        options.maxDelayMs
      );
      const jitter = Math.random() * exponential;
      const delay = Math.floor(jitter);

      console.log(`Retry ${attempt + 1}/${options.maxRetries} after ${delay}ms`);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  throw lastError!;
}

// 使用示例
const user = await withRetry(
  () => fetch('http://user-service/users/123').then(r => r.json()),
  { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 5000 }
);
```

## 代码示例：分布式追踪上下文传播

```typescript
// service-mesh.ts — OpenTelemetry 风格的追踪上下文传播
interface TraceContext {
  traceId: string;
  spanId: string;
  sampled: boolean;
}

class DistributedTracer {
  private static readonly HEADER = 'x-trace-context';

  static createRootSpan(operation: string): TraceContext {
    return {
      traceId: this.generateId(16),
      spanId: this.generateId(8),
      sampled: Math.random() < 0.1, // 10% 采样
    };
  }

  static inject(context: TraceContext, headers: Record<string, string>): void {
    headers[this.HEADER] = JSON.stringify(context);
  }

  static extract(headers: Record<string, string>): TraceContext | undefined {
    const raw = headers[this.HEADER];
    if (!raw) return undefined;
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  static childSpan(parent: TraceContext): TraceContext {
    return {
      traceId: parent.traceId,
      spanId: this.generateId(8),
      sampled: parent.sampled,
    };
  }

  private static generateId(bytes: number): string {
    return crypto.randomUUID().replace(/-/g, '').slice(0, bytes * 2);
  }
}

// 使用示例：跨服务调用时自动传播追踪上下文
async function callService(url: string, traceContext: TraceContext) {
  const headers: Record<string, string> = {};
  DistributedTracer.inject(traceContext, headers);
  
  const start = performance.now();
  try {
    const res = await fetch(url, { headers });
    console.log(`[trace=${traceContext.traceId}] ${url} took ${performance.now() - start}ms`);
    return res;
  } catch (err) {
    console.error(`[trace=${traceContext.traceId}] ${url} failed`);
    throw err;
  }
}
```


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Microservices.io | 权威模式目录 | [microservices.io](https://microservices.io/) |
| CNCF Cloud Native Definition | 云原生定义 | [cncf.io](https://www.cncf.io/) |
| Istio Documentation | 服务网格文档 | [istio.io/latest/docs](https://istio.io/latest/docs/) |
| AWS Microservices | 最佳实践 | [docs.aws.amazon.com/microservices](https://docs.aws.amazon.com/whitepapers/latest/microservices-on-aws/introduction.html) |
| OpenTelemetry Specification | 规范 | [opentelemetry.io/docs/specs/otel/](https://opentelemetry.io/docs/specs/otel/) |
| Netflix Tech Blog — Hystrix | 文章 | [netflixtechblog.com/introducing-hystrix-for-resilience-engineering](https://netflixtechblog.com/introducing-hystrix-for-resilience-engineering-13523c1f629c) |
| Google SRE Book — Handling Overload | 书籍 | [sre.google/sre-book/handling-overload/](https://sre.google/sre-book/handling-overload/) |
| Envoy Proxy Documentation | 文档 | [envoyproxy.io/docs](https://www.envoyproxy.io/docs) |

---

*最后更新: 2026-04-29*
