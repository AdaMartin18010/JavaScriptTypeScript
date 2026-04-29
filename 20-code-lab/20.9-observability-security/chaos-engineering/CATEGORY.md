---
dimension: 综合
sub-dimension: Chaos engineering
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Chaos engineering 核心概念与工程实践。

## 包含内容

- 本模块聚焦 chaos engineering 核心概念与工程实践。
- 涵盖故障注入实验、熔断器模式、重试机制与弹性设计验证。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 混沌工程理论形式化定义 |
| chaos-experiments.ts | 源码 | 故障注入实验编排器 |
| circuit-breaker.ts | 源码 | 熔断器状态机实现 |
| fault-injection.ts | 源码 | 网络/延迟/异常故障注入 |
| retry-mechanisms.ts | 源码 | 指数退避与抖动重试 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// circuit-breaker.ts — 熔断器状态机
enum State { Closed, Open, HalfOpen }

class CircuitBreaker {
  private state = State.Closed;
  private failures = 0;
  private nextAttempt = Date.now();

  constructor(
    private threshold = 5,
    private timeoutMs = 60000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === State.Open) {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = State.HalfOpen;
    }

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
    this.state = State.Closed;
  }

  private onFailure(): void {
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.state = State.Open;
      this.nextAttempt = Date.now() + this.timeoutMs;
    }
  }

  getState(): string {
    return State[this.state];
  }
}
```

## 代码示例：指数退避 + 抖动重试

```typescript
// retry-mechanisms.ts — 带抖动的指数退避
interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: 'full' | 'equal' | 'none';
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = { maxRetries: 3, baseDelayMs: 100, maxDelayMs: 10000, jitter: 'full' }
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt === options.maxRetries) break;

      const exponential = options.baseDelayMs * 2 ** attempt;
      const capped = Math.min(exponential, options.maxDelayMs);
      const delay = applyJitter(capped, options.jitter);
      await sleep(delay);
    }
  }

  throw lastError;
}

function applyJitter(delay: number, type: RetryOptions['jitter']): number {
  switch (type) {
    case 'full':
      return Math.random() * delay;
    case 'equal':
      return delay / 2 + Math.random() * (delay / 2);
    case 'none':
    default:
      return delay;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 使用：
// await retryWithBackoff(() => fetch('/api/data'), { maxRetries: 5, jitter: 'equal' });
```

## 代码示例：HTTP 故障注入器

```typescript
// fault-injection.ts — 网络延迟与异常注入
interface FaultConfig {
  latencyMs?: number;
  errorRate?: number; // 0-1
  errorStatus?: number;
  timeoutRate?: number;
}

class HTTPFaultInjector {
  constructor(private config: FaultConfig) {}

  async inject<T>(promise: Promise<T>): Promise<T> {
    // 注入延迟
    if (this.config.latencyMs) {
      await sleep(this.config.latencyMs);
    }

    // 注入超时
    if (this.config.timeoutRate && Math.random() < this.config.timeoutRate) {
      await sleep(30000); // 模拟超时
    }

    // 注入错误响应
    if (this.config.errorRate && Math.random() < this.config.errorRate) {
      throw new Error(`Injected HTTP ${this.config.errorStatus ?? 500}`);
    }

    return promise;
  }
}

// 拦截 fetch 进行故障注入
function wrapFetchWithFaults(config: FaultConfig): typeof fetch {
  const injector = new HTTPFaultInjector(config);
  return (input, init) => injector.inject(fetch(input, init));
}
```

## 代码示例：混沌实验编排器

```typescript
// chaos-experiments.ts — 自动化混沌实验
interface ExperimentStep {
  name: string;
  target: string;
  fault: FaultConfig;
  durationMs: number;
  steadyStateCheck: () => Promise<boolean>;
}

interface ExperimentResult {
  experimentName: string;
  passed: boolean;
  steps: Array<{ name: string; passed: boolean; durationMs: number; error?: string }>;
}

class ChaosOrchestrator {
  async run(experimentName: string, steps: ExperimentStep[]): Promise<ExperimentResult> {
    const result: ExperimentResult = { experimentName, passed: true, steps: [] };

    for (const step of steps) {
      const stepStart = Date.now();
      const wrappedFetch = wrapFetchWithFaults(step.fault);

      try {
        // 在故障注入期间持续检查稳态假设
        const checkPromise = this.runSteadyStateCheck(step.steadyStateCheck, step.durationMs);
        const faultPromise = this.maintainFault(step.durationMs);

        await Promise.all([checkPromise, faultPromise]);

        result.steps.push({
          name: step.name,
          passed: true,
          durationMs: Date.now() - stepStart,
        });
      } catch (err) {
        result.passed = false;
        result.steps.push({
          name: step.name,
          passed: false,
          durationMs: Date.now() - stepStart,
          error: (err as Error).message,
        });
      }
    }

    return result;
  }

  private async runSteadyStateCheck(
    check: () => Promise<boolean>,
    durationMs: number,
    intervalMs = 1000
  ): Promise<void> {
    const end = Date.now() + durationMs;
    while (Date.now() < end) {
      const ok = await check();
      if (!ok) throw new Error('Steady state assumption violated');
      await sleep(Math.min(intervalMs, end - Date.now()));
    }
  }

  private async maintainFault(durationMs: number): Promise<void> {
    await sleep(durationMs);
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 chaos-experiments.test.ts
- 📄 chaos-experiments.ts
- 📄 circuit-breaker.test.ts
- 📄 circuit-breaker.ts
- 📄 fault-injection.test.ts
- 📄 fault-injection.ts
- 📄 index.ts
- 📄 retry-mechanisms.test.ts
- 📄 retry-mechanisms.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Principles of Chaos Engineering | 官方 | [principlesofchaos.org](https://principlesofchaos.org/) |
| Netflix Tech Blog: Chaos Engineering | 博客 | [netflixtechblog.com/tagged/chaos-engineering](https://netflixtechblog.com/tagged/chaos-engineering) |
| AWS Fault Injection Simulator | 官方文档 | [docs.aws.amazon.com/fis](https://docs.aws.amazon.com/fis/latest/userguide/what-is-fis.html) |
| Gremlin Chaos Engineering | 官方文档 | [gremlin.com/docs](https://www.gremlin.com/docs/) |
| Site Reliability Engineering (Google) | 书籍 | [sre.google/sre-book/table-of-contents](https://sre.google/sre-book/table-of-contents/) |
| Chaos Mesh (Kubernetes) | 官方文档 | [chaos-mesh.org](https://chaos-mesh.org/) |
| LitmusChaos | 云原生混沌工程 | [docs.litmuschaos.io](https://docs.litmuschaos.io/) |
| Resilience4j | 熔断/限流/重试库 | [resilience4j.readme.io](https://resilience4j.readme.io/) |
| Polly.js (Netflix) | 弹性策略库 | [netflix.github.io/pollyjs](https://netflix.github.io/pollyjs/) |
| OpenTelemetry — Resilience | 可观测性 | [opentelemetry.io/docs](https://opentelemetry.io/docs/) |
| AWS Well-Architected — Reliability | 可靠性支柱 | [docs.aws.amazon.com/wellarchitected/latest/reliability-pillar](https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/welcome.html) |
| Google SRE Workbook | 在线书籍 | [sre.google/workbook/table-of-contents](https://sre.google/workbook/table-of-contents/) |

---

*最后更新: 2026-04-29*
