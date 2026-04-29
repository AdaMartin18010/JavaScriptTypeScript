---
dimension: 综合
sub-dimension: Edge computing
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Edge computing 核心概念与工程实践。

## 包含内容

- 本模块聚焦 edge computing 核心概念与工程实践。
- 涵盖边缘运行时模型、Edge-First 架构模式与地理感知路由策略。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | 边缘计算架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 边缘计算理论形式化定义 |
| edge-first-patterns/ | 目录 | 边缘优先设计模式 |
| edge-runtime.ts | 源码 | 边缘运行时抽象 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// edge-runtime.ts — 轻量边缘运行时适配器
interface EdgeContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

class EdgeRuntimeAdapter {
  constructor(
    private handler: (req: Request, ctx: EdgeContext) => Promise<Response>
  ) {}

  async execute(request: Request): Promise<Response> {
    const pending: Promise<unknown>[] = [];
    const context: EdgeContext = {
      waitUntil: (p) => pending.push(p),
      passThroughOnException: () => { /* no-op in adapter */ },
    };

    try {
      const response = await this.handler(request, context);
      // 等待后台任务
      await Promise.allSettled(pending);
      return response;
    } catch (err) {
      return new Response('Edge Runtime Error', { status: 500 });
    }
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📁 edge-first-patterns
- 📄 edge-runtime.test.ts
- 📄 edge-runtime.ts
- 📄 index.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Cloudflare Workers Runtime | 官方文档 | [developers.cloudflare.com/workers/runtime-apis](https://developers.cloudflare.com/workers/runtime-apis/) |
| V8 Lite Mode & Resource Constraints | 博客 | [v8.dev/blog/v8-lite](https://v8.dev/blog/v8-lite) |
| Fastly Compute@Edge | 官方文档 | [developer.fastly.com/learning/compute](https://developer.fastly.com/learning/compute/) |
| Edge Computing Patterns (ACM) | 论文 | [dl.acm.org/doi/10.1145/3409973.3410734](https://dl.acm.org/doi/10.1145/3409973.3410734) |
| WASI Preview 2 | 规范 | [github.com/WebAssembly/WASI](https://github.com/WebAssembly/WASI) |

---

*最后更新: 2026-04-29*
