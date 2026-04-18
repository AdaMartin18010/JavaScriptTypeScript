/**
 * @file Fetch API 高级用法
 * @category Web APIs → Fetch
 * @difficulty medium
 * @tags fetch, abortcontroller, streams, progress
 */

// ============================================================================
// 1. 可中断请求 (AbortController)
// ============================================================================

/**
 * 创建一个支持超时与手动取消的 fetch 请求
 * @param url 请求地址
 * @param init fetch 配置
 * @param timeoutMs 超时毫秒数
 */
export async function fetchWithAbort<T = unknown>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10000
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new DOMException('请求超时', 'TimeoutError')), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return (await response.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`请求被取消: ${err.message}`);
    }
    throw err;
  }
}

/**
 * 可复用的请求取消管理器，用于管理多个并行请求的生命周期
 */
export class FetchCancelManager {
  private controllers = new Map<string, AbortController>();

  /**
   * 发起一个受管理的请求
   */
  async fetch<T = unknown>(key: string, url: string, init?: RequestInit, timeoutMs?: number): Promise<T> {
    this.cancel(key); // 同名请求自动取消前一个
    const controller = new AbortController();
    this.controllers.set(key, controller);

    const timeoutId = timeoutMs
      ? setTimeout(() => controller.abort(new DOMException('请求超时', 'TimeoutError')), timeoutMs)
      : null;

    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (timeoutId) clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return (await response.json()) as T;
    } finally {
      this.controllers.delete(key);
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  /**
   * 取消指定 key 的请求
   */
  cancel(key: string): void {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  /**
   * 取消所有管理的请求
   */
  cancelAll(): void {
    for (const [key, controller] of this.controllers) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  get size(): number {
    return this.controllers.size;
  }
}

// ============================================================================
// 2. 流式读取 (ReadableStream) + 进度追踪
// ============================================================================

export interface DownloadProgress {
  loaded: number;
  total: number;
  percent: number;
  chunk: Uint8Array;
  done: boolean;
}

/**
 * 带进度追踪的下载函数，逐块读取响应体
 */
export async function* downloadWithProgress(
  url: string,
  init?: RequestInit
): AsyncGenerator<DownloadProgress, void, unknown> {
  const response = await fetch(url, init);
  if (!response.ok) throw new Error(`下载失败: HTTP ${response.status}`);

  const total = Number(response.headers.get('content-length')) || 0;
  const reader = response.body!.getReader();
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      yield { loaded, total, percent: total ? 100 : 0, chunk: new Uint8Array(0), done: true };
      break;
    }
    loaded += value.byteLength;
    const percent = total ? Math.round((loaded / total) * 100) : 0;
    yield { loaded, total, percent, chunk: value, done: false };
  }
}

/**
 * 将 AsyncGenerator 收集为完整的 Uint8Array
 */
export async function collectDownload(url: string, init?: RequestInit): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  for await (const progress of downloadWithProgress(url, init)) {
    if (!progress.done) {
      chunks.push(progress.chunk);
    }
  }
  const totalLength = chunks.reduce((sum, c) => sum + c.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

// ============================================================================
// 3. 上传进度追踪
// ============================================================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percent: number;
}

/**
 * 创建支持上传进度追踪的 ReadableStream
 * @param blob 要上传的数据
 * @param onProgress 进度回调
 */
export function createUploadStream(
  blob: Blob,
  onProgress?: (p: UploadProgress) => void
): ReadableStream<Uint8Array> {
  const total = blob.size;
  let loaded = 0;

  return new ReadableStream({
    async start(controller) {
      const reader = blob.stream().getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          break;
        }
        loaded += value.byteLength;
        const percent = Math.round((loaded / total) * 100);
        onProgress?.({ loaded, total, percent });
        controller.enqueue(value);
      }
    }
  });
}

/**
 * 使用 XMLHttpRequest 实现上传进度（更精确的上传进度）
 */
export function uploadWithXHR(
  url: string,
  file: File | Blob,
  onProgress?: (p: UploadProgress) => void,
  init?: { method?: string; headers?: Record<string, string> }
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(init?.method ?? 'POST', url);

    if (init?.headers) {
      for (const [k, v] of Object.entries(init.headers)) {
        xhr.setRequestHeader(k, v);
      }
    }

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress?.({
          loaded: e.loaded,
          total: e.total,
          percent: Math.round((e.loaded / e.total) * 100)
        });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(`上传失败: HTTP ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('上传网络错误')));
    xhr.addEventListener('abort', () => reject(new Error('上传被取消')));

    xhr.send(file);
  });
}

// ============================================================================
// Demo
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Fetch 高级用法演示 ===\n');

  // 1. AbortController 演示（使用 JSONPlaceholder 测试）
  console.log('--- 1. 可中断请求 ---');
  try {
    const data = await fetchWithAbort<{ id: number }>(
      'https://jsonplaceholder.typicode.com/posts/1',
      {},
      5000
    );
    console.log('获取数据:', data.id);
  } catch (e) {
    console.error('请求失败:', (e as Error).message);
  }

  // 2. CancelManager 演示
  console.log('\n--- 2. 请求取消管理器 ---');
  const manager = new FetchCancelManager();
  manager.fetch('req1', 'https://jsonplaceholder.typicode.com/posts/1').catch((e: Error) => {
    console.log('req1 结果/错误:', e.message);
  });
  manager.cancel('req1'); // 立即取消
  console.log('管理器剩余请求数:', manager.size);

  console.log('\n=== 演示结束 ===\n');
}
