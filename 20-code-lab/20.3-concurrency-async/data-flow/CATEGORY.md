---
dimension: 综合
sub-dimension: Data flow
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Data flow 核心概念与工程实践。

## 包含内容

- 本模块聚焦 data flow 核心概念与工程实践。
- 响应式编程、数据流图、状态同步、背压与流控。

## 子模块总览

| 子模块 | 说明 | 文件 |
|--------|------|------|
| Reactive Programming | 基于 Observable / Signal 的响应式数据流 | `reactive-programming.ts` / `reactive-programming.test.ts` |
| State Synchronization | 跨层状态一致性：单向流 vs 双向绑定 | `reactive-programming.ts` |
| Backpressure | 生产者-消费者速率不匹配的处理策略 | `reactive-programming.ts` |

## 代码示例：极简 Signal 响应式系统

```typescript
// reactive-programming.ts — 基于 Proxy 的自动依赖追踪
export function createSignal<T>(value: T) {
  const subscribers = new Set<() => void>();
  return {
    get: () => {
      const currentEffect = globalThis.__activeEffect;
      if (currentEffect) subscribers.add(currentEffect);
      return value;
    },
    set: (next: T) => {
      value = next;
      subscribers.forEach(fn => fn());
    },
  };
}

export function createEffect(fn: () => void) {
  globalThis.__activeEffect = fn;
  fn();
  globalThis.__activeEffect = undefined;
}

// 使用
const count = createSignal(0);
createEffect(() => console.log('count =', count.get()));
count.set(1); // 自动触发 effect
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
- 📄 reactive-programming.test.ts
- 📄 reactive-programming.ts

---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| RxJS Documentation | 文档 | [rxjs.dev](https://rxjs.dev/) |
| TC39 Signals Proposal | 提案 | [github.com/tc39/proposal-signals](https://github.com/tc39/proposal-signals) |
| Solid.js Reactivity | 文章 | [www.solidjs.com/tutorial/introduction_signals](https://www.solidjs.com/tutorial/introduction_signals) |
| Vue.js Reactivity Deep Dive | 文档 | [vuejs.org/guide/extras/reactivity-in-depth.html](https://vuejs.org/guide/extras/reactivity-in-depth.html) |
| Reactive Streams Specification | 规范 | [www.reactive-streams.org](https://www.reactive-streams.org/) |

---

*最后更新: 2026-04-29*
