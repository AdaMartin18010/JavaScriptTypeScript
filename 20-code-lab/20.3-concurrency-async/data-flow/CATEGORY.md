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

### Svelte 5 Runes 响应式

```typescript
// svelte-runes.ts — Svelte 5 编译时响应式示例
// $state、$derived、$effect 在编译期转换为细粒度订阅
function createCounter() {
  let count = $state(0);
  let doubled = $derived(count * 2);

  $effect(() => {
    console.log('count changed to', count);
  });

  return {
    get count() { return count; },
    get doubled() { return doubled; },
    increment() { count += 1; }
  };
}
```

### Node.js Transform Stream 流水线

```typescript
// node-transform-stream.ts — 基于流的背压控制
import { Transform, pipeline } from 'stream';

const parseLine = new Transform({
  objectMode: true,
  transform(chunk: Buffer, _encoding, callback) {
    const lines = chunk.toString().split('\n');
    for (const line of lines) {
      if (line.trim()) this.push(JSON.parse(line));
    }
    callback();
  },
});

const filterValid = new Transform({
  objectMode: true,
  transform(record: Record<string, unknown>, _enc, cb) {
    if (record.status === 'active') this.push(record);
    cb();
  },
});

// pipeline 自动处理背压与错误传播
pipeline(
  process.stdin,
  parseLine,
  filterValid,
  process.stdout,
  (err) => { if (err) console.error('Pipeline failed', err); }
);
```

### WHATWG Web Streams API

```typescript
// web-streams.ts — 浏览器原生流处理与 TransformStream
async function compressAndUpload(file: File) {
  const readable = file.stream();

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      // 模拟分块处理（实际可用 CompressionStream）
      controller.enqueue(chunk);
    },
  });

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: readable.pipeThrough(transform),
    duplex: 'half',
  });

  return response.json();
}
```

### AbortController 与竞态处理

```typescript
// abort-race.ts — 可取消的异步数据流
async function fetchWithTimeout(url: string, timeoutMs = 5000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return response.json();
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

// 自动取消过时请求的防抖封装
let currentController: AbortController | null = null;
async function search(query: string) {
  currentController?.abort();
  currentController = new AbortController();
  return fetch(`/api/search?q=${query}`, { signal: currentController.signal });
}
```

### Effection — 结构化并发

```typescript
// structured-concurrency.ts — 使用 Effection 管理并发资源生命周期
// npm install effection
import { run, sleep, spawn, race } from 'effection';

await run(function* () {
  // 所有子任务在父作用域退出时自动取消
  const task1 = yield* spawn(function* () {
    yield* sleep(1000);
    return 'task1 done';
  });

  const task2 = yield* spawn(function* () {
    yield* sleep(500);
    return 'task2 done';
  });

  // race：取最先完成的，其余自动取消
  const winner = yield* race([task1, task2]);
  console.log(winner); // task2 done
});
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
| Bacon.js — FRP Library | 文档 | [baconjs.github.io](https://baconjs.github.io/) |
| Most.js — Monadic Stream | 文档 | [github.com/cujojs/most](https://github.com/cujojs/most) |
| XState — State Machines | 文档 | [stately.ai/docs](https://stately.ai/docs) |
| ECMAScript Async Iteration | 提案 | [tc39.es/proposal-async-iteration](https://tc39.es/proposal-async-iteration/) |
| WHATWG Streams Standard | 规范 | [streams.spec.whatwg.org](https://streams.spec.whatwg.org/) |
| Effection — Structured Concurrency | 文档 | [frontside.com/effection](https://frontside.com/effection) |
| MDN: AbortController | 文档 | [developer.mozilla.org/en-US/docs/Web/API/AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) |
| React use (Canary) | 文档 | [react.dev/reference/react/use](https://react.dev/reference/react/use) |

---

*最后更新: 2026-04-30*
