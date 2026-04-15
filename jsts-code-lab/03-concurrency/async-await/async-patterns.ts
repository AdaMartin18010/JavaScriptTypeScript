/**
 * @file Async/Await 模式
 * @category Concurrency → Async/Await
 * @difficulty medium
 * @tags async, await, promise, sequential, parallel
 */

// ============================================================================
// 1. 顺序执行
// ============================================================================

async function sequentialExecution() {
  console.time('sequential');
  
  const result1 = await fetch('/api/data1');
  const result2 = await fetch('/api/data2');
  const result3 = await fetch('/api/data3');
  
  console.timeEnd('sequential');
  return [result1, result2, result3];
}

// ============================================================================
// 2. 并行执行
// ============================================================================

async function parallelExecution() {
  console.time('parallel');
  
  const [result1, result2, result3] = await Promise.all([
    fetch('/api/data1'),
    fetch('/api/data2'),
    fetch('/api/data3')
  ]);
  
  console.timeEnd('parallel');
  return [result1, result2, result3];
}

// ============================================================================
// 3. 错误处理模式
// ============================================================================

async function withTryCatch() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}

// 多个错误处理
async function multipleWithErrorHandling() {
  const results = await Promise.allSettled([
    fetch('/api/data1'),
    fetch('/api/data2'),
    fetch('/api/data3')
  ]);
  
  const successful = results
    .filter(r => r.status === 'fulfilled')
    .map(r => (r as PromiseFulfilledResult<Response>).value);
    
  const failed = results
    .filter(r => r.status === 'rejected')
    .map(r => (r as PromiseRejectedResult).reason);
    
  return { successful, failed };
}

// ============================================================================
// 4. 重试模式
// ============================================================================

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError!;
}

// ============================================================================
// 5. 超时控制
// ============================================================================

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
  
  return Promise.race([promise, timeout]);
}

// ============================================================================
// 6. 批量处理 (控制并发)
// ============================================================================

async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency = 3
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];
  
  for (const [index, item] of items.entries()) {
    const promise = processor(item).then(result => {
      results[index] = result;
    });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      const index = await Promise.race(
        executing.map((p, i) => p.then(() => i))
      );
      executing.splice(index, 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

// ============================================================================
// 7. Async Iterator
// ============================================================================

async function* paginatedFetcher(url: string) {
  let nextUrl: string | null = url;
  
  while (nextUrl) {
    const response: Response = await fetch(nextUrl);
    const data: unknown = await response.json();

    yield (data as { results: unknown }).results;

    nextUrl = (data as { next: string | null }).next;
  }
}

// 使用
async function consumeIterator() {
  for await (const page of paginatedFetcher('/api/items')) {
    console.log('Page:', page);
  }
}

// ============================================================================
// 8. Top-level await (ES2022)
// ============================================================================

// 在模块顶层使用 await
// const data = await fetch('/api/config').then(r => r.json());

// ============================================================================
// 导出
// ============================================================================

export {
  sequentialExecution,
  parallelExecution,
  withTryCatch,
  multipleWithErrorHandling,
  withRetry,
  withTimeout,
  batchProcess,
  paginatedFetcher,
  consumeIterator
};
// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Async/Await Patterns Demo ===");
  
  // 模拟延迟
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  // 重试模式
  console.log("Testing retry:");
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts++;
    if (attempts < 3) throw new Error("Not yet");
    return "Success after " + attempts + " attempts";
  }, 3, 100);
  console.log(result);
  
  // 超时控制
  console.log("\nTesting timeout:");
  try {
    await withTimeout(delay(2000), 100);
  } catch (e) {
    console.log("Timed out as expected");
  }
  
  // 批量处理
  console.log("\nBatch processing:");
  const items = [1, 2, 3, 4, 5];
  const processed = await batchProcess(items, async (n) => {
    await delay(50);
    return n * n;
  }, 2);
  console.log("Processed:", processed);
  
  console.log("=== End of Demo ===\n");
}
