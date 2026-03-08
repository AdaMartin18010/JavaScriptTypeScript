/**
 * @file Promise.any
 * @category ECMAScript Evolution → ES2021
 * @difficulty easy
 * @tags es2021, promise, race, first-success
 */

// ============================================================================
// 1. 基础用法
// ============================================================================

async function demonstrateAny() {
  const promises = [
    new Promise((_, reject) => setTimeout(reject, 100, new Error('First'))),
    new Promise(resolve => setTimeout(resolve, 200, 'Second')),
    new Promise((_, reject) => setTimeout(reject, 300, new Error('Third')))
  ];

  try {
    const firstSuccess = await Promise.any(promises);
    console.log(firstSuccess); // 'Second' (第一个成功的)
  } catch (error) {
    // 所有都失败
    if (error instanceof AggregateError) {
      console.log('All failed:', error.errors);
    }
  }
}

// ============================================================================
// 2. 与 Promise.race 对比
// ============================================================================

async function compareRaceVsAny() {
  // Promise.race - 第一个 settled (成功或失败)
  const raceResult = Promise.race([
    Promise.reject(new Error('Quick failure')),
    Promise.resolve('Slow success')
  ]);
  // raceResult 会是 rejected!

  // Promise.any - 第一个 fulfilled (成功的)
  const anyResult = Promise.any([
    Promise.reject(new Error('Quick failure')),
    Promise.resolve('Slow success')
  ]);
  // anyResult 会是 'Slow success'
}

// ============================================================================
// 3. 实际应用：多源数据获取
// ============================================================================

interface User {
  id: number;
  name: string;
}

async function fetchUserFromMultipleSources(userId: number): Promise<User> {
  const sources = [
    fetch(`https://api1.example.com/users/${userId}`),
    fetch(`https://api2.example.com/users/${userId}`),
    fetch(`https://api3.example.com/users/${userId}`)
  ];

  const response = await Promise.any(sources);
  return response.json();
}

// ============================================================================
// 4. 带超时控制
// ============================================================================

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), ms)
    )
  ]);
}

async function fetchWithTimeout(sources: string[], timeoutMs: number) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Global timeout')), timeoutMs)
  );

  try {
    return await Promise.any([...sources.map(fetch), timeoutPromise]);
  } catch (error) {
    if (error instanceof AggregateError) {
      console.log('All sources failed or timed out');
    }
    throw error;
  }
}

// ============================================================================
// 5. 错误处理
// ============================================================================

async function handleErrors() {
  try {
    await Promise.any([
      Promise.reject(new Error('A')),
      Promise.reject(new Error('B')),
      Promise.reject(new Error('C'))
    ]);
  } catch (error) {
    if (error instanceof AggregateError) {
      console.log('All promises rejected:');
      for (const e of error.errors) {
        console.log(' -', e);
      }
    }
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  demonstrateAny,
  compareRaceVsAny,
  fetchUserFromMultipleSources,
  withTimeout,
  fetchWithTimeout,
  handleErrors
};

export type { User };
// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Promise.any Demo ===");
  
  // 基础用法 - 第一个成功的
  const promises = [
    new Promise((_, reject) => setTimeout(reject, 100, new Error("First"))),
    new Promise(resolve => setTimeout(resolve, 200, "Second")),
    new Promise((_, reject) => setTimeout(reject, 300, new Error("Third")))
  ];
  
  try {
    const result = await Promise.any(promises);
    console.log("First success:", result);
  } catch (error) {
    console.log("All failed");
  }
  
  // 带超时
  const fastPromise = withTimeout(Promise.resolve("quick"), 1000);
  const result = await fastPromise;
  console.log("With timeout:", result);
  
  // 错误处理
  try {
    await Promise.any([
      Promise.reject(new Error("A")),
      Promise.reject(new Error("B"))
    ]);
  } catch (error) {
    if (error instanceof AggregateError) {
      console.log("Aggregate errors:", error.errors.length);
    }
  }
  
  console.log("=== End of Demo ===\n");
}
