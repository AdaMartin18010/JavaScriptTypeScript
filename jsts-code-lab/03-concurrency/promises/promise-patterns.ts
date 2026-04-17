/**
 * @file Promise 组合模式
 * @category Concurrency → Promises
 * @difficulty medium
 * @tags promise, patterns, combinators
 */

// ============================================================================
// 1. Promise.all - 全部成功
// ============================================================================

async function allExample() {
  const [users, posts, comments] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json()),
    fetch('/api/comments').then(r => r.json())
  ]);
  
  return { users, posts, comments };
}

// ============================================================================
// 2. Promise.race - 第一个完成
// ============================================================================

async function raceExample() {
  const fastest = await Promise.race([
    fetchFromPrimary(),
    fetchFromBackup(),
    timeout(5000)
  ]);
  
  return fastest;
}

async function fetchFromPrimary() {
  return fetch('/api/primary').then(r => r.json());
}

async function fetchFromBackup() {
  return fetch('/api/backup').then(r => r.json());
}

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) => 
    setTimeout(() => { reject(new Error('Timeout')); }, ms)
  );
}

// ============================================================================
// 3. Promise.allSettled - 所有结果
// ============================================================================

async function allSettledExample() {
  const results = await Promise.allSettled([
    fetch('/api/data1'),
    fetch('/api/data2'),
    fetch('/api/data3')
  ]);
  
  return {
    succeeded: results.filter(r => r.status === 'fulfilled'),
    failed: results.filter(r => r.status === 'rejected')
  };
}

// ============================================================================
// 4. Promise.any - 第一个成功
// ============================================================================

async function anyExample() {
  try {
    const result = await Promise.any([
      fetch('/api/source1'),
      fetch('/api/source2'),
      fetch('/api/source3')
    ]);
    return result;
  } catch (error) {
    if (error instanceof AggregateError) {
      console.log('All sources failed:', error.errors);
    }
    throw error;
  }
}

// ============================================================================
// 5. 顺序执行 Promise
// ============================================================================

async function sequence<T>(
  fns: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  
  for (const fn of fns) {
    results.push(await fn());
  }
  
  return results;
}

// ============================================================================
// 6. 延迟 Promise
// ============================================================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================================================
// 7. 管道模式
// ============================================================================

type AsyncFn<T, R> = (input: T) => Promise<R>;

function pipe<T>(value: T, ...fns: AsyncFn<any, any>[]): Promise<any> {
  return fns.reduce(
    (acc, fn) => acc.then(fn),
    Promise.resolve(value)
  );
}

// ============================================================================
// 8. 防抖 Promise
// ============================================================================

function debouncePromise<T>(
  fn: () => Promise<T>,
  ms: number
): () => Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  let pendingPromise: Promise<T> | null = null;
  
  return () => {
    if (pendingPromise) return pendingPromise;
    
    pendingPromise = new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn().then(resolve).catch(reject).finally(() => {
          pendingPromise = null;
        });
      }, ms);
    });
    
    return pendingPromise;
  };
}

// ============================================================================
// 导出
// ============================================================================

export {
  allExample,
  raceExample,
  allSettledExample,
  anyExample,
  sequence,
  delay,
  pipe,
  debouncePromise,
  timeout
};

export type { AsyncFn };
// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Promise Patterns Demo ===");
  
  // Promise.all
  console.log("Promise.all:");
  const [a, b, c] = await Promise.all([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3)
  ]);
  console.log("Results:", { a, b, c });
  
  // Promise.race
  console.log("\nPromise.race:");
  const winner = await Promise.race([
    delay(200).then(() => "slow"),
    delay(100).then(() => "fast")
  ]);
  console.log("Winner:", winner);
  
  // Promise.allSettled
  console.log("\nPromise.allSettled:");
  const settled = await Promise.allSettled([
    Promise.resolve("ok"),
    Promise.reject(new Error("fail"))
  ]);
  console.log("Settled:", settled.map(s => s.status));
  
  // 顺序执行
  console.log("\nSequence:");
  const seq = await sequence([
    () => Promise.resolve("first"),
    () => Promise.resolve("second"),
    () => Promise.resolve("third")
  ]);
  console.log("Sequence:", seq);
  
  // 管道
  console.log("\nPipe:");
  const piped = await pipe(
    5,
    async (x) => x + 1,
    async (x) => x * 2,
    async (x) => String(x)
  );
  console.log("Piped:", piped);
  
  console.log("=== End of Demo ===\n");
}
