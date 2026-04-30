# 流式处理

> **定位**：`20-code-lab/20.3-concurrency-async/concurrency/streaming`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决大数据量处理的内存效率问题。通过流式接口实现渐进式读取、转换和输出，降低内存峰值。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 背压 | 生产与消费速率不匹配的处理 | backpressure.ts |
| 转换流 | 数据在管道中的映射处理 | transform-stream.ts |

---

## 二、设计原理

### 2.1 为什么存在

大数据量处理时一次性加载会导致内存溢出和响应延迟。流式处理将数据切分为小块逐段处理，是高效 I/O 的核心技术。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Node Stream | 生态成熟 | API 复杂 | 服务端 |
| Web Stream | 标准统一 | Node 支持较晚 | 跨平台 |

### 2.3 与相关技术的对比

| 技术 | 标准/平台 | 背压支持 | 转换能力 | 典型场景 |
|------|----------|---------|---------|---------|
| Node.js Stream | Node API | `pause/resume` / `pipe` | `Transform` | 文件 I/O、HTTP |
| Web Streams API | WHATWG 标准 | `ReadableStreamDefaultController` | `TransformStream` | 浏览器 / Deno |
| RxJS Observable | 库（ReactiveX） | 通过 Scheduler | `map`, `filter`, `mergeMap` | 复杂事件流 |
| Highland.js | 库 | 自动背压 | 函数式组合 | 函数式流处理 |
| Python asyncio Stream | Python 标准库 | `StreamReader` | 手动缓冲 | asyncio 生态 |

与批量处理对比：流式低内存但高代码复杂度，批量简单但内存峰值高。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 流式处理 核心机制的理解，并观察不同实现选择带来的行为差异。

#### Web Streams API：渐进式 JSON Lines 处理

```typescript
// transform-stream.ts — 在浏览器中处理大体积 JSON Lines

async function* parseJSONLines(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop()!; // 保留未完整行

    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line);
    }
  }

  if (buffer.trim()) yield JSON.parse(buffer);
}

// 使用：fetch 大文件并逐行解析
const response = await fetch('/api/large-dataset.ndjson');
for await (const record of parseJSONLines(response.body!)) {
  console.log(record); // 逐条处理，内存恒定
}
```

#### Node.js pipeline 模式

```typescript
import { createReadStream, createWriteStream } from 'fs';
import { Transform, pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

const upperCase = new Transform({
  transform(chunk, _encoding, callback) {
    callback(null, chunk.toString().toUpperCase());
  },
});

await pipelineAsync(
  createReadStream('input.txt'),
  upperCase,
  createWriteStream('output.txt')
);
```

#### 显式背压处理

```typescript
import { createReadStream, createWriteStream } from 'fs';

const readable = createReadStream('large-file.bin');
const writable = createWriteStream('copy.bin');

readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    // 写入缓冲区满，暂停读取直到 drain
    readable.pause();
    writable.once('drain', () => readable.resume());
  }
});

readable.on('end', () => writable.end());
```

#### Web Streams：TransformStream 与压缩

```typescript
async function compressStream(source: ReadableStream<Uint8Array>) {
  const cs = new CompressionStream('gzip');
  return source.pipeThrough(cs);
}

// 下载并实时压缩
const response = await fetch('/api/large-export.csv');
const compressed = await compressStream(response.body!);
const reader = compressed.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // value: Uint8Array (gzip 压缩后的数据块)
  await writeChunkToDisk(value);
}
```

#### 异步生成器组合流

```typescript
async function* mapStream<T, R>(
  source: AsyncIterable<T>,
  transform: (item: T) => R
): AsyncGenerator<R> {
  for await (const item of source) {
    yield transform(item);
  }
}

async function* filterStream<T>(
  source: AsyncIterable<T>,
  predicate: (item: T) => boolean
): AsyncGenerator<T> {
  for await (const item of source) {
    if (predicate(item)) yield item;
  }
}

// 组合使用
const numbers = ReadableStream.from([1, 2, 3, 4, 5, 6]);
const doubled = mapStream(numbers, (n) => n * 2);
const evens = filterStream(doubled, (n) => n % 4 === 0);

for await (const n of evens) {
  console.log(n); // 4, 8, 12
}
```

#### Node.js Readable.from 与异步迭代器

```typescript
import { Readable } from 'stream';

async function* dataGenerator() {
  for (let i = 0; i < 1_000_000; i++) {
    yield { id: i, value: Math.random() };
  }
}

const stream = Readable.from(dataGenerator());

stream.on('data', (chunk) => {
  // 逐条处理百万级数据，无需全部加载到内存
  processRecord(chunk);
});
```

#### Web Streams：自定义 TransformStream 实现 CSV 解析

```typescript
function createCSVParserStream(): TransformStream<Uint8Array, Record<string, string>> {
  let buffer = '';
  let headers: string[] | null = null;

  return new TransformStream({
    transform(chunk, controller) {
      buffer += new TextDecoder().decode(chunk);
      const lines = buffer.split('\n');
      buffer = lines.pop()!;

      for (const line of lines) {
        const cells = line.split(',').map(c => c.trim());
        if (!headers) {
          headers = cells;
        } else {
          const row: Record<string, string> = {};
          headers.forEach((h, i) => row[h] = cells[i] ?? '');
          controller.enqueue(row);
        }
      }
    },
    flush(controller) {
      if (buffer.trim() && headers) {
        const cells = buffer.split(',').map(c => c.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => row[h] = cells[i] ?? '');
        controller.enqueue(row);
      }
    }
  });
}

// 使用：fetch CSV 并实时解析为对象流
const res = await fetch('/api/export.csv');
const csvStream = res.body!.pipeThrough(createCSVParserStream());
for await (const record of csvStream) {
  console.log(record);
}
```

#### Node.js Duplex 流：实时日志过滤与转发

```typescript
import { Transform, PassThrough } from 'stream';
import type { Duplex } from 'stream';

function createLogFilterStream(minLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'): Duplex {
  const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
  const threshold = levels[minLevel];

  return new Transform({
    objectMode: true,
    transform(chunk: { level: string; message: string }, _encoding, callback) {
      const levelValue = levels[chunk.level as keyof typeof levels] ?? 0;
      if (levelValue >= threshold) {
        callback(null, chunk);
      } else {
        callback(); // 过滤掉低级别日志
      }
    },
  });
}

// 使用：将日志流过滤后转发到多个目的地
const source = new PassThrough({ objectMode: true });
const filter = createLogFilterStream('WARN');
const destination = new PassThrough({ objectMode: true });

source.pipe(filter).pipe(destination);

destination.on('data', (log) => console.log('[WARN+]', log));

source.write({ level: 'INFO', message: 'Server started' });   // 被过滤
source.write({ level: 'ERROR', message: 'DB connection lost' }); // 通过
```

#### Node.js 自定义 Transform：行缓冲区行号注入

```typescript
import { Transform } from 'stream';

function createLineNumberTransform(): Transform {
  let lineNumber = 0;
  let leftover = '';

  return new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      const text = leftover + chunk.toString('utf-8');
      const lines = text.split('\n');
      leftover = lines.pop()!;

      const output = lines
        .map(line => `${String(++lineNumber).padStart(6, '0')}: ${line}`)
        .join('\n') + '\n';

      callback(null, output);
    },
    flush(callback) {
      if (leftover) {
        callback(null, `${String(++lineNumber).padStart(6, '0')}: ${leftover}\n`);
      } else {
        callback();
      }
    },
  });
}

// 使用：为文本流添加行号
import { createReadStream, createWriteStream } from 'fs';
createReadStream('input.txt').pipe(createLineNumberTransform()).pipe(createWriteStream('output.txt'));
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| 流会自动处理背压 | 需要显式检查 writable.needDrain |
| 管道错误会自动传播 | 需使用 pipeline() 或手动监听 error |

### 3.3 扩展阅读

- [Node.js Streams](https://nodejs.org/api/stream.html)
- [Web Streams API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API)
- [Backpressure in Node.js](https://nodejs.org/en/learn/modules/backpressuring-in-streams)
- [WHATWG Streams Standard](https://streams.spec.whatwg.org/)
- [RxJS — Understanding Streams](https://rxjs.dev/guide/observable)
- [Node.js stream.finished](https://nodejs.org/api/stream.html#streamfinishedstream-options-callback)
- [Web Streams — ReadableStream](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
- [Node.js — stream.pipeline](https://nodejs.org/api/stream.html#streampipelinesource-transforms-destination-callback)
- [Compression Streams API](https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API)
- [Async Iterators — TC39 Proposal](https://github.com/tc39/proposal-async-iteration)
- [Node.js — stream.finished](https://nodejs.org/api/stream.html#streamfinishedstream-options)
- [Node.js — stream.Readable.from](https://nodejs.org/api/stream.html#streamreadablefromiterable-options)
- [MDN — TransformStream](https://developer.mozilla.org/en-US/docs/Web/API/TransformStream)
- [Web.dev — Streams API Concepts](https://web.dev/articles/streams)
- [Node.js — Stream Handbook](https://github.com/substack/stream-handbook)
- [Node.js — Duplex Streams](https://nodejs.org/api/stream.html#duplex-and-transform-streams)
- [MDN — WritableStream](https://developer.mozilla.org/en-US/docs/Web/API/WritableStream)
- [Node.js — Stream Backpressure Guide](https://nodejs.org/en/learn/modules/backpressuring-in-streams)
- [Streams Spec — ReadableStreamBYOBReader](https://streams.spec.whatwg.org/#byob-readers)

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
