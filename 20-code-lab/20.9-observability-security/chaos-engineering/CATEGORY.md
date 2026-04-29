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

---

*最后更新: 2026-04-29*
