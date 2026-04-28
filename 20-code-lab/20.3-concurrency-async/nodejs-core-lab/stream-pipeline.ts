/**
 * @file Node.js stream 模块管道与 Web Streams 互操作
 * @category Node.js Core → Streams
 * @difficulty hard
 * @tags stream, pipeline, transform, web-streams
 */

import { Readable, Writable, Transform, pipeline, type TransformCallback } from 'node:stream';
import { pipeline as pipelinePromise } from 'node:stream/promises';
import type { ReadableStream as NodeReadableStream, WritableStream as NodeWritableStream } from 'node:stream/web';

// ============================================================================
// 1. 自定义 Transform：行解析器
// ============================================================================

/**
 * 将 Buffer 流转换为行流（按换行符分割）
 */
export class LineTransform extends Transform {
  private buffer = '';
  private encoding: BufferEncoding;

  constructor(options: { encoding?: BufferEncoding } = {}) {
    super({ objectMode: true });
    this.encoding = options.encoding ?? 'utf-8';
  }

  _transform(chunk: Buffer, _encoding: BufferEncoding, callback: TransformCallback): void {
    this.buffer += chunk.toString(this.encoding);
    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop()!; // 保留未完整的一行

    for (const line of lines) {
      this.push(line);
    }
    callback();
  }

  _flush(callback: TransformCallback): void {
    if (this.buffer) {
      this.push(this.buffer);
    }
    callback();
  }
}

// ============================================================================
// 2. 自定义 Transform：CSV 解析器
// ============================================================================

export interface CSVRecord {
  [key: string]: string;
}

/**
 * 简易 CSV Transform 流：输入行，输出对象
 */
export class CSVParseTransform extends Transform {
  private headers: string[] | null = null;
  private delimiter: string;

  constructor(options: { delimiter?: string } = {}) {
    super({ objectMode: true });
    this.delimiter = options.delimiter ?? ',';
  }

  _transform(chunk: string, _encoding: BufferEncoding, callback: TransformCallback): void {
    const line = typeof chunk === 'string' ? chunk : chunk.toString();
    if (!line.trim()) {
      callback();
      return;
    }

    const cells = line.split(this.delimiter).map((c) => c.trim());

    if (!this.headers) {
      this.headers = cells;
      callback();
      return;
    }

    const record: CSVRecord = {};
    for (let i = 0; i < this.headers.length; i++) {
      record[this.headers[i]!] = cells[i] ?? '';
    }

    this.push(record);
    callback();
  }
}

// ============================================================================
// 3. 背压感知的计数与限速 Transform
// ============================================================================

export interface ThrottleOptions {
  /** 每秒最大处理条数 */
  ratePerSecond: number;
}

/**
 * 限速 Transform 流，控制下游消费速率
 */
export class RateLimitTransform<T> extends Transform {
  private ratePerSecond: number;
  private processed = 0;
  private windowStart = Date.now();

  constructor(options: ThrottleOptions) {
    super({ objectMode: true });
    this.ratePerSecond = options.ratePerSecond;
  }

  _transform(chunk: T, _encoding: BufferEncoding, callback: TransformCallback): void {
    const now = Date.now();
    const elapsed = now - this.windowStart;

    if (elapsed >= 1000) {
      this.windowStart = now;
      this.processed = 0;
    }

    if (this.processed >= this.ratePerSecond) {
      const wait = 1000 - elapsed + 1;
      setTimeout(() => {
        this.processed = 0;
        this.windowStart = Date.now();
        this.push(chunk);
        callback();
      }, wait);
      return;
    }

    this.processed++;
    this.push(chunk);
    callback();
  }
}

// ============================================================================
// 4. Node.js Stream ↔ Web Streams 互操作
// ============================================================================

/**
 * 将 Node.js Readable 转换为 Web ReadableStream
 */
export function nodeToWebReadable(nodeStream: Readable): ReadableStream<Uint8Array> {
  return Readable.toWeb(nodeStream) as ReadableStream<Uint8Array>;
}

/**
 * 将 Web ReadableStream 转换为 Node.js Readable
 */
export function webToNodeReadable(webStream: ReadableStream<Uint8Array>): Readable {
  return Readable.fromWeb(webStream as NodeReadableStream<Uint8Array>);
}

/**
 * 将 Node.js Writable 转换为 Web WritableStream
 */
export function nodeToWebWritable(nodeStream: Writable): WritableStream<Uint8Array> {
  return Writable.toWeb(nodeStream) as WritableStream<Uint8Array>;
}

/**
 * 将 Web WritableStream 转换为 Node.js Writable
 */
export function webToNodeWritable(webStream: WritableStream<Uint8Array>): Writable {
  return Writable.fromWeb(webStream as NodeWritableStream<Uint8Array>);
}

// ============================================================================
// 5. 安全的 pipeline 组合
// ============================================================================

/**
 * 将多个 Transform 流串联为一个 pipeline
 * 使用 stream/promises 的 pipeline 自动处理错误与资源清理
 */
export async function runPipeline<T = unknown>(
  source: Readable,
  transforms: Transform[],
  sink: Writable
): Promise<void> {
  const streams = [source, ...transforms, sink];
  await pipelinePromise(streams);
}

/**
 * 创建一个内存中的测试管道：字符串输入 → 处理 → 收集输出
 */
export function createTestPipeline(
  ...transforms: Transform[]
): { input: Writable; output: Promise<unknown[]> } {
  const chunks: unknown[] = [];

  const input = new Writable({
    objectMode: true,
    write(chunk, _encoding, callback) {
      // 手动将数据喂给第一个 transform
      const first = transforms[0];
      if (first) {
        first.write(chunk, callback);
      } else {
        chunks.push(chunk);
        callback();
      }
    }
  });

  // 串联 transforms
  for (let i = 0; i < transforms.length - 1; i++) {
    transforms[i]!.pipe(transforms[i + 1]!);
  }

  // 最后一个 transform 的输出收集
  if (transforms.length > 0) {
    const last = transforms[transforms.length - 1]!;
    last.on('data', (chunk: unknown) => chunks.push(chunk));
  }

  const output = new Promise<unknown[]>((resolve) => {
    const check = () => {
      if (transforms.length === 0) {
        resolve(chunks);
        return;
      }
      const last = transforms[transforms.length - 1]!;
      last.on('end', () => resolve(chunks));
      // 如果没有 end 事件，给一个小延迟兜底
      setTimeout(() => resolve(chunks), 50);
    };
    check();
  });

  return { input, output };
}

// ============================================================================
// 6. Object Mode 流工具
// ============================================================================

/**
 * 从异步迭代器创建 Node.js Readable（objectMode）
 */
export function iterableToReadable<T>(iterable: AsyncIterable<T>): Readable {
  const iterator = iterable[Symbol.asyncIterator]();

  return new Readable({
    objectMode: true,
    async read() {
      try {
        const { done, value } = await iterator.next();
        if (done) {
          this.push(null);
        } else {
          this.push(value);
        }
      } catch (err) {
        this.destroy(err as Error);
      }
    }
  });
}

/**
 * 收集 Readable 流的所有数据到数组
 */
export async function collectStream<T>(stream: Readable): Promise<T[]> {
  const chunks: T[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: T) => chunks.push(chunk));
    stream.on('end', () => resolve(chunks));
    stream.on('error', reject);
  });
}

// ============================================================================
// Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Stream 管道与 Web Streams 互操作演示 ===\n');

  // 1. LineTransform
  console.log('--- 1. 行解析 Transform ---');
  const lineTransform = new LineTransform();
  const lines: string[] = [];
  lineTransform.on('data', (line: string) => lines.push(line));
  lineTransform.write(Buffer.from('line1\nline2\nline3'));
  lineTransform.end();
  await new Promise((resolve) => lineTransform.on('end', resolve));
  console.log('解析行数:', lines.length);

  // 2. CSVParseTransform
  console.log('\n--- 2. CSV 解析 Transform ---');
  const csvTransform = new CSVParseTransform();
  const records: CSVRecord[] = [];
  csvTransform.on('data', (record: CSVRecord) => records.push(record));
  csvTransform.write('name,age\n');
  csvTransform.write('Alice,30\n');
  csvTransform.write('Bob,25\n');
  csvTransform.end();
  await new Promise((resolve) => csvTransform.on('end', resolve));
  console.log('解析记录:', records);

  // 3. 限速 Transform
  console.log('\n--- 3. 限速 Transform ---');
  const rateLimit = new RateLimitTransform<string>({ ratePerSecond: 100 });
  const rateResults: string[] = [];
  rateLimit.on('data', (chunk: string) => rateResults.push(chunk));
  rateLimit.write('a');
  rateLimit.write('b');
  rateLimit.write('c');
  rateLimit.end();
  await new Promise((resolve) => rateLimit.on('end', resolve));
  console.log('限速输出:', rateResults);

  // 4. 收集流
  console.log('\n--- 4. 收集流数据 ---');
  const source = Readable.from([1, 2, 3, 4, 5]);
  const collected = await collectStream<number>(source);
  console.log('收集结果:', collected);

  console.log('\n=== 演示结束 ===\n');
}
