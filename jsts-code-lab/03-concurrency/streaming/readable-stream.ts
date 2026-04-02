/**
 * @file Readable Stream 处理
 * @category Concurrency → Streaming
 * @difficulty medium
 * @tags stream, readable-stream, async-iterator
 */

// ============================================================================
// 1. 基础 Readable Stream
// ============================================================================

export function createNumberStream(max: number): ReadableStream<number> {
  return new ReadableStream({
    start(controller) {
      let i = 0;
      const interval = setInterval(() => {
        if (i >= max) {
          controller.close();
          clearInterval(interval);
          return;
        }
        controller.enqueue(i++);
      }, 100);
    }
  });
}

// ============================================================================
// 2. 从异步生成器创建 Stream
// ============================================================================

export async function* generateData<T>(items: T[], delay = 100): AsyncGenerator<T> {
  for (const item of items) {
    await new Promise(resolve => setTimeout(resolve, delay));
    yield item;
  }
}

export function createAsyncGeneratorStream<T>(generator: AsyncGenerator<T>): ReadableStream<T> {
  return new ReadableStream({
    async pull(controller) {
      const { value, done } = await generator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    }
  });
}

// ============================================================================
// 3. Transform Stream
// ============================================================================

export class JsonParserTransformStream<T> extends TransformStream<string, T> {
  constructor() {
    super({
      transform(chunk, controller) {
        try {
          const parsed = JSON.parse(chunk);
          controller.enqueue(parsed);
        } catch (error) {
          controller.error(error);
        }
      }
    });
  }
}

export class LineSplitterTransformStream extends TransformStream<string, string> {
  private buffer = '';

  constructor() {
    super({
      transform(chunk, controller) {
        this.buffer += chunk;
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop() || '';
        for (const line of lines) {
          if (line) controller.enqueue(line);
        }
      },
      flush(controller) {
        if (this.buffer) {
          controller.enqueue(this.buffer);
        }
      }
    });
  }
}

// ============================================================================
// 4. Pipeline 构建
// ============================================================================

export class StreamPipeline<T> {
  private stream: ReadableStream<T>;

  constructor(stream: ReadableStream<T>) {
    this.stream = stream;
  }

  pipeThrough<U>(transform: TransformStream<T, U>): StreamPipeline<U> {
    this.stream = this.stream.pipeThrough(transform);
    return this as unknown as StreamPipeline<U>;
  }

  pipeTo(writable: WritableStream<T>): Promise<void> {
    return this.stream.pipeTo(writable);
  }

  getReader(): ReadableStreamDefaultReader<T> {
    return this.stream.getReader();
  }

  async toArray(): Promise<T[]> {
    const reader = this.stream.getReader();
    const results: T[] = [];
    
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      results.push(value);
    }
    
    return results;
  }

  // 支持 for await...of
  [Symbol.asyncIterator](): AsyncIterator<T> {
    const reader = this.stream.getReader();
    return {
      async next(): Promise<IteratorResult<T>> {
        const { value, done } = await reader.read();
        return { value: value as T, done };
      }
    };
  }
}

// ============================================================================
// 5. 背压处理
// ============================================================================

export function createBackpressureStream<T>(
  producer: () => Promise<T | null>,
  highWaterMark = 16
): ReadableStream<T> {
  let count = 0;

  return new ReadableStream({
    async pull(controller) {
      if (count >= highWaterMark) {
        return;
      }

      const data = await producer();
      if (data === null) {
        controller.close();
      } else {
        controller.enqueue(data);
        count++;
      }
    }
  });
}

// ============================================================================
// 6. 文件流处理 (浏览器环境)
// ============================================================================

export async function* readFileChunks(
  file: File,
  chunkSize = 1024 * 1024 // 1MB
): AsyncGenerator<Uint8Array> {
  const stream = file.stream();
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield value;
  }
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export async function demo() {
  // 创建数字流
  const numberStream = createNumberStream(10);

  // 创建处理管道
  const pipeline = new StreamPipeline(numberStream);

  // 转换并收集结果
  const results = await pipeline
    .pipeThrough(new TransformStream({
      transform(num, controller) {
        controller.enqueue(num * 2);
      }
    }))
    .toArray();

  console.log(results); // [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]
}

// ============================================================================
// 导出
// ============================================================================

export { generateData, readFileChunks, demo };;
