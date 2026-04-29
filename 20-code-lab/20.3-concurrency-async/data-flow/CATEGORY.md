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

### RxJS Observable 与背压处理

```typescript
// reactive-programming.ts — RxJS 数据流与背压策略
import { interval, fromEvent } from 'rxjs';
import { throttleTime, debounceTime, bufferTime, switchMap } from 'rxjs/operators';

// 高频点击流：使用 throttleTime 丢弃溢出的值
const clickStream = fromEvent(document, 'click').pipe(
  throttleTime(300) // 背压策略：每 300ms 只取第一次点击
);

// 搜索输入防抖：debounceTime 减少请求频率
const searchInput = fromEvent<KeyboardEvent>(document.querySelector('#search')!, 'input');
const searchStream = searchInput.pipe(
  debounceTime(200),
  switchMap((e) => fetch(`/api/search?q=${(e.target as HTMLInputElement).value}`))
);

// 批量处理：bufferTime 将高频数据聚合后处理
const sensorStream = interval(10).pipe(
  bufferTime(1000), // 每秒聚合为一个数组处理
);
```

### 异步迭代器与背压

```typescript
// backpressure.ts — 使用 AsyncIterator 实现自然背压
async function* produceWithBackpressure(source: ReadableStream<Uint8Array>) {
  const reader = source.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      // 消费者通过 for await...of 控制拉取速率
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

// 消费者以自身速率处理，天然背压
async function consumeStream(stream: ReadableStream<Uint8Array>) {
  for await (const chunk of produceWithBackpressure(stream)) {
    await processChunk(chunk); // 处理慢时，生产端自动阻塞
  }
}
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
| Svelte 5 Runes | 文档 | [svelte.dev/docs/runes](https://svelte.dev/docs/runes) |
| React useEffect 文档 | 官方文档 | [react.dev/reference/react/useEffect](https://react.dev/reference/react/useEffect) |
| Node.js Stream API | 官方文档 | [nodejs.org/api/stream.html](https://nodejs.org/api/stream.html) |
| Pull-based vs Push-based | 经典文章 | [github.com/kriskowal/gtor](https://github.com/kriskowal/gtor) |

---

*最后更新: 2026-04-29*
