import { describe, it, expect } from 'vitest';
import {
  SSEParser,
  NDJSONParser,
  TokenRateLimiter,
  StreamTransformer
} from './streaming-handler.js';

async function* stringStream(chunks: string[]): AsyncGenerator<string> {
  for (const chunk of chunks) {
    yield chunk;
  }
}

async function* numberStream(nums: number[]): AsyncGenerator<number> {
  for (const n of nums) {
    yield n;
  }
}

describe('SSEParser', () => {
  it('parses SSE events from chunks', () => {
    const parser = new SSEParser();
    const events = parser.parse('id: 1\nevent: msg\ndata: hello\n\nid: 2\ndata: world\n\n');
    expect(events.length).toBe(2);
    expect(events[0].id).toBe('1');
    expect(events[0].event).toBe('msg');
    expect(events[0].data).toBe('hello');
    expect(events[1].data).toBe('world');
  });

  it('handles incomplete chunks via buffering', () => {
    const parser = new SSEParser();
    parser.parse('id: 1\ndata: hel');
    const events = parser.parse('lo\n\n');
    expect(events.length).toBe(1);
    expect(events[0].data).toBe('hello');
  });

  it('flushes remaining buffer', () => {
    const parser = new SSEParser();
    parser.parse('data: leftover');
    const events = parser.flush();
    expect(events.length).toBe(1);
    expect(events[0].data).toBe('leftover');
  });

  it('parses stream async', async () => {
    const stream = stringStream([
      'id: 1\ndata: a\n\n',
      'id: 2\ndata: b\n\n'
    ]);
    const events: ReturnType<typeof SSEParser.prototype.parse> = [];
    for await (const ev of SSEParser.parseStream(stream)) {
      events.push(ev);
    }
    expect(events.length).toBe(2);
    expect(events[1].data).toBe('b');
  });
});

describe('NDJSONParser', () => {
  it('parses newline-delimited JSON', () => {
    const parser = new NDJSONParser<{ token: string }>();
    const items = parser.parse('{"token": "a"}\n{"token": "b"}\n');
    expect(items.length).toBe(2);
    expect(items[0].token).toBe('a');
  });

  it('handles chunked NDJSON', () => {
    const parser = new NDJSONParser<{ v: number }>();
    parser.parse('{"v": 1}\n{"v":');
    const items = parser.parse(' 2}\n');
    expect(items.length).toBe(1);
    expect(items[0].v).toBe(2);
  });

  it('flushes remaining incomplete line', () => {
    const parser = new NDJSONParser<{ x: number }>();
    parser.parse('{"x": 5}');
    const items = parser.flush();
    expect(items.length).toBe(1);
    expect(items[0].x).toBe(5);
  });

  it('parses NDJSON stream', async () => {
    const stream = stringStream(['{"a":1}\n{"a":2}\n']);
    const items: Array<{ a: number }> = [];
    for await (const item of NDJSONParser.parseStream<{ a: number }>(stream)) {
      items.push(item);
    }
    expect(items.length).toBe(2);
  });
});

describe('TokenRateLimiter', () => {
  it('allows requests within burst', async () => {
    const limiter = new TokenRateLimiter({ tokensPerSecond: 10, burstSize: 3 });
    await limiter.acquire(1);
    await limiter.acquire(1);
    const status = limiter.getStatus();
    expect(status.availableTokens).toBeLessThanOrEqual(2);
  });

  it('throttles stream', async () => {
    const limiter = new TokenRateLimiter({ tokensPerSecond: 100, burstSize: 100 });
    const nums = [1, 2, 3];
    const result: number[] = [];
    for await (const n of limiter.throttle(numberStream(nums))) {
      result.push(n);
    }
    expect(result).toEqual([1, 2, 3]);
  });
});

describe('StreamTransformer', () => {
  it('maps values', async () => {
    const result: number[] = [];
    for await (const n of StreamTransformer.map(numberStream([1, 2, 3]), x => x * 2)) {
      result.push(n);
    }
    expect(result).toEqual([2, 4, 6]);
  });

  it('filters values', async () => {
    const result: number[] = [];
    for await (const n of StreamTransformer.filter(numberStream([1, 2, 3, 4]), x => x % 2 === 0)) {
      result.push(n);
    }
    expect(result).toEqual([2, 4]);
  });

  it('reduces values', async () => {
    const sum = await StreamTransformer.reduce(numberStream([1, 2, 3, 4]), (a, b) => a + b, 0);
    expect(sum).toBe(10);
  });

  it('buffers values', async () => {
    const result: number[][] = [];
    for await (const batch of StreamTransformer.buffer(numberStream([1, 2, 3, 4, 5]), 2)) {
      result.push(batch);
    }
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('flatMaps values', async () => {
    async function* inner(n: number): AsyncGenerator<number> {
      yield n;
      yield n * 10;
    }
    const result: number[] = [];
    for await (const n of StreamTransformer.flatMap(numberStream([1, 2]), inner)) {
      result.push(n);
    }
    expect(result).toEqual([1, 10, 2, 20]);
  });

  it('pipes transformations', async () => {
    const result: number[] = [];
    const pipeline = StreamTransformer.pipe(
      (s: AsyncIterable<number>) => StreamTransformer.filter(s, x => x > 2),
      (s: AsyncIterable<number>) => StreamTransformer.map(s, x => x * x)
    );
    for await (const n of pipeline(numberStream([1, 2, 3, 4]))) {
      result.push(n);
    }
    expect(result).toEqual([9, 16]);
  });
});
