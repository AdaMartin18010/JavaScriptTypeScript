/**
 * @file Streams API 管道与背压控制
 * @category Web APIs → Streams
 * @difficulty hard
 * @tags streams, readablestream, writablestream, transformstream, backpressure
 */

// ============================================================================
// 1. 自定义 TransformStream：JSON 解析器
// ============================================================================

/**
 * 将 NDJSON (Newline Delimited JSON) 流解析为对象流的 TransformStream
 */
export function createNDJSONParserStream(): TransformStream<string, unknown> {
  let buffer = '';

  return new TransformStream({
    transform(chunk: string, controller) {
      buffer += chunk;
      const lines = buffer.split('\n');
      buffer = lines.pop()!; // 保留最后一行（可能不完整）

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          controller.enqueue(JSON.parse(trimmed));
        } catch (err) {
          controller.error(new Error(`JSON 解析失败: ${trimmed}`));
        }
      }
    },

    flush(controller) {
      if (buffer.trim()) {
        try {
          controller.enqueue(JSON.parse(buffer.trim()));
        } catch (err) {
          controller.error(new Error(`JSON 解析失败(flush): ${buffer}`));
        }
      }
    }
  });
}

// ============================================================================
// 2. 自定义 TransformStream：数据压缩（Gzip-like 逻辑演示）
// ============================================================================

/**
 * 模拟数据压缩的 TransformStream，实际项目中应使用 CompressionStream
 * 这里演示 TransformStream 的构造与背压处理
 */
export function createDedupTransformStream<T>(): TransformStream<T, T> {
  let lastValue: T | undefined;

  return new TransformStream({
    transform(chunk: T, controller) {
      // 简单的去重逻辑
      if (chunk !== lastValue) {
        lastValue = chunk;
        controller.enqueue(chunk);
      }
      // 如果 chunk === lastValue，直接丢弃，不 enqueue = 自然背压
    }
  });
}

// ============================================================================
// 3. 背压感知的 WritableStream
// ============================================================================

export interface BatchWriterConfig<T> {
  /** 批处理大小 */
  batchSize: number;
  /** 批处理超时毫秒 */
  flushIntervalMs: number;
  /** 实际写入回调 */
  onFlush: (batch: T[]) => Promise<void> | void;
}

/**
 * 批量写入的 WritableStream，自动按数量或时间触发 flush
 * 演示 WritableStream 的背压控制（write() 返回 Promise 反映队列状态）
 */
export function createBatchWritableStream<T>(config: BatchWriterConfig<T>): WritableStream<T> {
  const { batchSize, flushIntervalMs, onFlush } = config;
  let batch: T[] = [];
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = async (): Promise<void> => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (batch.length === 0) return;
    const currentBatch = batch;
    batch = [];
    await onFlush(currentBatch);
  };

  return new WritableStream({
    async write(chunk: T) {
      batch.push(chunk);
      if (batch.length >= batchSize) {
        await flush();
      } else if (!timer) {
        timer = setTimeout(() => {
          flush().catch((e) => {
            console.error('批量写入 flush 失败:', e);
          });
        }, flushIntervalMs);
      }
    },

    async close() {
      await flush();
    },

    abort(reason) {
      if (timer) clearTimeout(timer);
      console.error('WritableStream 被中断:', reason);
    }
  });
}

// ============================================================================
// 4. ReadableStream 生成器
// ============================================================================

/**
 * 从异步迭代器创建 ReadableStream
 */
export function iterableToStream<T>(iterable: AsyncIterable<T>): ReadableStream<T> {
  const iterator = iterable[Symbol.asyncIterator]();

  return new ReadableStream({
    async pull(controller) {
      const { done, value } = await iterator.next();
      if (done) {
        controller.close();
      } else {
        controller.enqueue(value);
      }
    },

    cancel() {
      iterator.return?.();
    }
  });
}

/**
 * 生成一个模拟传感器数据的 ReadableStream
 */
export function createSensorStream(options: { intervalMs: number; maxCount: number }): ReadableStream<number> {
  const { intervalMs, maxCount } = options;
  let count = 0;

  return new ReadableStream({
    start(controller) {
      const timer = setInterval(() => {
        if (count >= maxCount) {
          clearInterval(timer);
          controller.close();
          return;
        }
        const value = Math.random() * 100;
        controller.enqueue(value);
        count++;
      }, intervalMs);
    }
  });
}

// ============================================================================
// 5. 管道组合工具
// ============================================================================

/**
 * 将多个 TransformStream 串联为一个管道
 */
export function pipeThrough<T, U>(
  source: ReadableStream<T>,
  ...transforms: TransformStream<unknown, unknown>[]
): ReadableStream<U> {
  let result = source as ReadableStream<unknown>;
  for (const ts of transforms) {
    result = result.pipeThrough(ts);
  }
  return result as ReadableStream<U>;
}

/**
 * 将 ReadableStream 转换为异步迭代器（for-await-of 友好）
 */
export async function* streamToAsyncIterator<T>(stream: ReadableStream<T>): AsyncGenerator<T, void, unknown> {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

// ============================================================================
// Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Streams API 实战演示 ===\n');

  // 1. NDJSON 解析
  console.log('--- 1. NDJSON 流解析 ---');
  const ndjsonData = '{"id":1}\n{"id":2}\n{"id":3}\n';
  const textStream = new ReadableStream<string>({
    start(controller) {
      controller.enqueue(ndjsonData);
      controller.close();
    }
  });

  const parser = createNDJSONParserStream();
  const parsedReader = textStream.pipeThrough(parser).getReader();
  const objects: unknown[] = [];
  while (true) {
    const { done, value } = await parsedReader.read();
    if (done) break;
    objects.push(value);
  }
  console.log('解析结果:', objects);

  // 2. 批量写入
  console.log('\n--- 2. 批量写入流 ---');
  const flushedBatches: number[][] = [];
  const batchWriter = createBatchWritableStream<number>({
    batchSize: 3,
    flushIntervalMs: 100,
    onFlush: (batch) => {
      flushedBatches.push([...batch]);
    }
  });

  const writer = batchWriter.getWriter();
  await writer.write(1);
  await writer.write(2);
  await writer.write(3); // 触发 flush（满3个）
  await writer.write(4);
  await writer.close(); // 触发 flush（剩余）
  console.log('批量写入结果:', flushedBatches);

  // 3. 传感器流 + 管道
  console.log('\n--- 3. 传感器数据流 ---');
  const sensorStream = createSensorStream({ intervalMs: 10, maxCount: 5 });
  const values: number[] = [];
  for await (const v of streamToAsyncIterator(sensorStream)) {
    values.push(v);
  }
  console.log('采集数据量:', values.length);

  console.log('\n=== 演示结束 ===\n');
}
