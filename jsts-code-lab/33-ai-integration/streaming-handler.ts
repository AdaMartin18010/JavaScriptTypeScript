/**
 * @file Streaming Response Handler
 * @category AI Integration → Streaming
 * @difficulty medium
 * @tags ai, streaming, sse, ndjson, async-iterator, rate-limiter
 *
 * @description
 * 流式响应处理实现：
 * - SSE (Server-Sent Events) 解析器
 * - NDJSON 流式 JSON 解析器
 * - Token 速率限制器 / 节流器
 * - Stream 转换器（map/filter/reduce for async iterables）
 */

// ============================================================================
// 1. SSE 解析器
// ============================================================================

export interface SSEEvent {
  id?: string;
  event?: string;
  data: string;
  retry?: number;
}

export class SSEParser {
  private buffer = '';

  parse(chunk: string): SSEEvent[] {
    this.buffer += chunk;
    const events: SSEEvent[] = [];
    const lines = this.buffer.split('\n');

    // 保留最后一行（可能不完整）
    this.buffer = lines.pop() || '';

    let currentEvent: Partial<SSEEvent> = {};

    for (const line of lines) {
      if (line.startsWith('id:')) {
        currentEvent.id = line.slice(3).trim();
      } else if (line.startsWith('event:')) {
        currentEvent.event = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        const data = line.slice(5).trim();
        currentEvent.data = currentEvent.data ? currentEvent.data + '\n' + data : data;
      } else if (line.startsWith('retry:')) {
        currentEvent.retry = parseInt(line.slice(6).trim(), 10);
      } else if (line === '' && currentEvent.data !== undefined) {
        events.push(currentEvent as SSEEvent);
        currentEvent = {};
      }
    }

    return events;
  }

  flush(): SSEEvent[] {
    const remaining = this.buffer;
    this.buffer = '';
    if (!remaining.trim()) return [];
    return this.parse(remaining + '\n\n');
  }

  static async *parseStream(
    stream: AsyncIterable<string>
  ): AsyncGenerator<SSEEvent> {
    const parser = new SSEParser();
    for await (const chunk of stream) {
      const events = parser.parse(chunk);
      for (const event of events) {
        yield event;
      }
    }
    const remaining = parser.flush();
    for (const event of remaining) {
      yield event;
    }
  }
}

// ============================================================================
// 2. NDJSON 流式 JSON 解析器
// ============================================================================

export class NDJSONParser<T = unknown> {
  private buffer = '';

  parse(chunk: string): T[] {
    this.buffer += chunk;
    const results: T[] = [];
    let lineEnd: number;

    while ((lineEnd = this.buffer.indexOf('\n')) !== -1) {
      const line = this.buffer.slice(0, lineEnd).trim();
      this.buffer = this.buffer.slice(lineEnd + 1);

      if (line) {
        try {
          results.push(JSON.parse(line) as T);
        } catch (err) {
          console.warn(`[NDJSON] Parse error: ${(err as Error).message} for line: ${line.slice(0, 100)}`);
        }
      }
    }

    return results;
  }

  flush(): T[] {
    const remaining = this.buffer.trim();
    this.buffer = '';
    if (!remaining) return [];
    try {
      return [JSON.parse(remaining) as T];
    } catch {
      return [];
    }
  }

  static async *parseStream<T>(
    stream: AsyncIterable<string>
  ): AsyncGenerator<T> {
    const parser = new NDJSONParser<T>();
    for await (const chunk of stream) {
      const items = parser.parse(chunk);
      for (const item of items) {
        yield item;
      }
    }
    const remaining = parser.flush();
    for (const item of remaining) {
      yield item;
    }
  }
}

// ============================================================================
// 3. Token 速率限制器 / 节流器
// ============================================================================

export interface RateLimiterOptions {
  tokensPerSecond: number;
  burstSize?: number;
  maxQueueSize?: number;
}

export class TokenRateLimiter {
  private tokensPerSecond: number;
  private burstSize: number;
  private maxQueueSize: number;
  private tokens: number;
  private lastUpdate: number;
  private queue: Array<() => void> = [];

  constructor(options: RateLimiterOptions) {
    this.tokensPerSecond = options.tokensPerSecond;
    this.burstSize = options.burstSize ?? options.tokensPerSecond;
    this.maxQueueSize = options.maxQueueSize ?? 100;
    this.tokens = this.burstSize;
    this.lastUpdate = Date.now();
  }

  async acquire(tokenCount = 1): Promise<void> {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('Rate limiter queue full');
    }

    return new Promise((resolve, reject) => {
      const tryAcquire = () => {
        this.refill();

        if (this.tokens >= tokenCount) {
          this.tokens -= tokenCount;
          resolve();
        } else {
          const needed = tokenCount - this.tokens;
          const waitMs = (needed / this.tokensPerSecond) * 1000;
          setTimeout(() => {
            this.refill();
            tryAcquire();
          }, Math.min(waitMs, 50));
        }
      };

      tryAcquire();
    });
  }

  async *throttle<T>(stream: AsyncIterable<T>, getTokenCount: (item: T) => number = () => 1): AsyncGenerator<T> {
    for await (const item of stream) {
      await this.acquire(getTokenCount(item));
      yield item;
    }
  }

  getStatus(): { availableTokens: number; queueLength: number; tokensPerSecond: number } {
    this.refill();
    return {
      availableTokens: this.tokens,
      queueLength: this.queue.length,
      tokensPerSecond: this.tokensPerSecond
    };
  }

  private refill(): void {
    const now = Date.now();
    const elapsed = (now - this.lastUpdate) / 1000;
    const added = elapsed * this.tokensPerSecond;
    this.tokens = Math.min(this.burstSize, this.tokens + added);
    this.lastUpdate = now;
  }
}

// ============================================================================
// 4. Stream 转换器
// ============================================================================

export class StreamTransformer {
  static async *map<T, R>(
    stream: AsyncIterable<T>,
    fn: (item: T, index: number) => R | Promise<R>
  ): AsyncGenerator<R> {
    let index = 0;
    for await (const item of stream) {
      yield await fn(item, index++);
    }
  }

  static async *filter<T>(
    stream: AsyncIterable<T>,
    predicate: (item: T, index: number) => boolean | Promise<boolean>
  ): AsyncGenerator<T> {
    let index = 0;
    for await (const item of stream) {
      if (await predicate(item, index++)) {
        yield item;
      }
    }
  }

  static async reduce<T, R>(
    stream: AsyncIterable<T>,
    fn: (acc: R, item: T, index: number) => R | Promise<R>,
    initial: R
  ): Promise<R> {
    let acc = initial;
    let index = 0;
    for await (const item of stream) {
      acc = await fn(acc, item, index++);
    }
    return acc;
  }

  static async *flatMap<T, R>(
    stream: AsyncIterable<T>,
    fn: (item: T, index: number) => AsyncIterable<R> | Promise<AsyncIterable<R>>
  ): AsyncGenerator<R> {
    let index = 0;
    for await (const item of stream) {
      const inner = await fn(item, index++);
      for await (const r of inner) {
        yield r;
      }
    }
  }

  static async *buffer<T>(
    stream: AsyncIterable<T>,
    size: number
  ): AsyncGenerator<T[]> {
    const buffer: T[] = [];
    for await (const item of stream) {
      buffer.push(item);
      if (buffer.length >= size) {
        yield buffer.splice(0, size);
      }
    }
    if (buffer.length > 0) {
      yield buffer;
    }
  }

  static async *debounce<T>(
    stream: AsyncIterable<T>,
    ms: number
  ): AsyncGenerator<T> {
    let lastValue: T | undefined;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let resolver: ((value: IteratorResult<T>) => void) | null = null;
    let done = false;

    const iterator = stream[Symbol.asyncIterator]();

    const nextItem = async (): Promise<void> => {
      const result = await iterator.next();
      if (result.done) {
        done = true;
        if (resolver && lastValue !== undefined) {
          resolver({ value: lastValue, done: false });
          resolver = null;
        }
      } else {
        lastValue = result.value;
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          if (resolver) {
            resolver({ value: lastValue!, done: false });
            resolver = null;
          }
        }, ms);
        // 继续读取
        nextItem().catch(() => {});
      }
    };

    nextItem().catch(() => {});

    while (!done || lastValue !== undefined) {
      const result = await new Promise<IteratorResult<T>>(resolve => {
        resolver = resolve;
      });
      if (result.value !== undefined) {
        yield result.value;
        lastValue = undefined;
      }
    }
  }

  static pipe<T>(
    ...fns: Array<(s: AsyncIterable<T>) => AsyncIterable<T>>
  ): (stream: AsyncIterable<T>) => AsyncIterable<T> {
    return (stream: AsyncIterable<T>) =>
      fns.reduce((s, fn) => fn(s), stream);
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

async function* mockSSEStream(): AsyncGenerator<string> {
  const events = [
    'id: 1\nevent: message\ndata: Hello\n\n',
    'id: 2\nevent: message\ndata: world\n\n',
    'id: 3\nevent: done\ndata: [DONE]\n\n'
  ];
  for (const ev of events) {
    await new Promise(r => setTimeout(r, 50));
    yield ev;
  }
}

async function* mockNDJSONStream(): AsyncGenerator<string> {
  const lines = [
    '{"token": "The", "index": 0}\n',
    '{"token": "quick", "index": 1}\n',
    '{"token": "brown", "index": 2}\n',
    '{"token": "fox", "index": 3}\n'
  ];
  for (const line of lines) {
    await new Promise(r => setTimeout(r, 40));
    yield line;
  }
}

async function* mockNumberStream(): AsyncGenerator<number> {
  for (let i = 1; i <= 10; i++) {
    await new Promise(r => setTimeout(r, 30));
    yield i;
  }
}

export async function demo(): Promise<void> {
  console.log('=== Streaming Handler ===\n');

  // 1. SSE 解析
  console.log('1. SSE (Server-Sent Events) 解析');
  const sseEvents: SSEEvent[] = [];
  for await (const event of SSEParser.parseStream(mockSSEStream())) {
    sseEvents.push(event);
    console.log(`   Event [${event.event}] id=${event.id}: ${event.data}`);
  }
  console.log(`   Total events: ${sseEvents.length}`);

  // 2. NDJSON 解析
  console.log('\n2. NDJSON 流式 JSON 解析');
  const tokens: Array<{ token: string; index: number }> = [];
  for await (const item of NDJSONParser.parseStream<{ token: string; index: number }>(mockNDJSONStream())) {
    tokens.push(item);
    console.log(`   Token [${item.index}]: ${item.token}`);
  }

  // 3. Token 速率限制
  console.log('\n3. Token 速率限制器');
  const limiter = new TokenRateLimiter({ tokensPerSecond: 5, burstSize: 2 });
  const numbers = mockNumberStream();

  const throttledNumbers: number[] = [];
  const start = Date.now();
  for await (const n of limiter.throttle(numbers, () => 1)) {
    throttledNumbers.push(n);
    process.stdout.write(`   ${n} `);
  }
  const elapsed = Date.now() - start;
  console.log(`\n   Throttled ${throttledNumbers.length} items in ${elapsed}ms`);
  console.log(`   Limiter status:`, limiter.getStatus());

  // 4. Stream 转换器
  console.log('\n4. Stream 转换器');

  // map
  const doubled = [];
  for await (const n of StreamTransformer.map(mockNumberStream(), x => x * 2)) {
    doubled.push(n);
  }
  console.log('   Map (x*2):', doubled.slice(0, 5).join(', ') + '...');

  // filter
  const evens = [];
  for await (const n of StreamTransformer.filter(mockNumberStream(), x => x % 2 === 0)) {
    evens.push(n);
  }
  console.log('   Filter (even):', evens.join(', '));

  // reduce
  const sum = await StreamTransformer.reduce(mockNumberStream(), (a, b) => a + b, 0);
  console.log('   Reduce (sum 1..10):', sum);

  // buffer
  const buffered: number[][] = [];
  for await (const batch of StreamTransformer.buffer(mockNumberStream(), 3)) {
    buffered.push(batch);
  }
  console.log('   Buffer (size=3):', buffered.map(b => `[${b.join(', ')}]`).join(', '));

  // flatMap
  async function* expand(n: number): AsyncGenerator<number> {
    yield n;
    yield n * 10;
  }
  const flatMapped: number[] = [];
  for await (const n of StreamTransformer.flatMap(mockNumberStream(), expand)) {
    flatMapped.push(n);
  }
  console.log('   FlatMap (x, x*10):', flatMapped.slice(0, 6).join(', ') + '...');

  // 5. 组合管道
  console.log('\n5. Stream Pipeline 组合');
  const pipeline = StreamTransformer.pipe(
    (s: AsyncIterable<number>) => StreamTransformer.filter(s, (x: number) => x > 3),
    (s: AsyncIterable<number>) => StreamTransformer.map(s, (x: number) => x * x)
  );

  const piped: number[] = [];
  for await (const n of pipeline(mockNumberStream())) {
    piped.push(n as number);
  }
  console.log('   Pipe (filter >3, map x^2):', piped.join(', '));

  console.log('\nStreaming Handler 要点:');
  console.log('- SSE 解析: 处理服务器推送事件，支持事件类型和 ID');
  console.log('- NDJSON: 流式解析换行分隔的 JSON，适合 LLM token 流');
  console.log('- 速率限制: 基于令牌桶算法，保护下游服务');
  console.log('- Stream 转换: 函数式操作异步流，类似数组方法');
  console.log('- Pipeline: 组合多个转换操作，构建复杂流处理逻辑');
}
