/**
 * @file Promise.allSettled
 * @category ECMAScript Evolution → ES2020
 * @difficulty easy
 * @tags es2020, promise, async, error-handling
 */

// ============================================================================
// 1. 基础用法
// ============================================================================

const promises = [
  Promise.resolve('success'),
  Promise.reject(new Error('failed')),
  Promise.resolve('another success')
];

async function demonstrateAllSettled() {
  const results = await Promise.allSettled(promises);

  console.log(results);
  // [
  //   { status: 'fulfilled', value: 'success' },
  //   { status: 'rejected', reason: Error: failed },
  //   { status: 'fulfilled', value: 'another success' }
  // ]

  const succeeded = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');

  console.log('Succeeded:', succeeded.length);
  console.log('Failed:', failed.length);
}

// ============================================================================
// 2. 与 Promise.all 对比
// ============================================================================

async function compare() {
  // Promise.all - 一个失败全部失败
  try {
    await Promise.all([
      fetch('/api/users'),
      fetch('/api/posts'),
      fetch('/api/comments')
    ]);
  } catch (error) {
    console.log('One failed, all lost');
  }

  // Promise.allSettled - 获取所有结果
  const results = await Promise.allSettled([
    fetch('/api/users'),
    fetch('/api/posts'),
    fetch('/api/comments')
  ]);

  const users = results[0].status === 'fulfilled' ? results[0].value : null;
  const posts = results[1].status === 'fulfilled' ? results[1].value : null;
  const comments = results[2].status === 'fulfilled' ? results[2].value : null;
}

// ============================================================================
// 3. 类型安全处理
// ============================================================================

type Result<T> =
  | { status: 'fulfilled'; value: T }
  | { status: 'rejected'; reason: unknown };

function isFulfilled<T>(result: Result<T>): result is { status: 'fulfilled'; value: T } {
  return result.status === 'fulfilled';
}

function isRejected<T>(result: Result<T>): result is { status: 'rejected'; reason: unknown } {
  return result.status === 'rejected';
}

async function typedAllSettled<T>(promises: Promise<T>[]) {
  const results = await Promise.allSettled(promises);

  const values = results.filter(isFulfilled).map(r => r.value);
  const errors = results.filter(isRejected).map(r => r.reason);

  return { values, errors };
}

// ============================================================================
// 4. 实际应用：批量操作
// ============================================================================

async function batchDelete(urls: string[]) {
  const deletePromises = urls.map(url =>
    fetch(url, { method: 'DELETE' }).then(r => ({ url, success: r.ok }))
  );

  const results = await Promise.allSettled(deletePromises);

  const report = {
    succeeded: [] as string[],
    failed: [] as { url: string; error: unknown }[]
  };

  results.forEach((result, index) => {
    const url = urls[index];
    if (result.status === 'fulfilled') {
      report.succeeded.push(url);
    } else {
      report.failed.push({ url, error: result.reason });
    }
  });

  return report;
}

// ============================================================================
// 导出
// ============================================================================

export {
  demonstrateAllSettled,
  compare,
  typedAllSettled,
  isFulfilled,
  isRejected,
  batchDelete
};

export type { Result };
// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Promise.allSettled Demo ===");
  
  // 基础用法
  const promises = [
    Promise.resolve("success 1"),
    Promise.reject(new Error("failure")),
    Promise.resolve("success 2")
  ];
  
  const results = await Promise.allSettled(promises);
  console.log("Results:", results);
  
  // 分类结果
  const succeeded = results.filter(r => r.status === "fulfilled");
  const failed = results.filter(r => r.status === "rejected");
  console.log("Succeeded:", succeeded.length);
  console.log("Failed:", failed.length);
  
  // 类型安全处理
  const { values, errors } = await typedAllSettled([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.reject(new Error("oops"))
  ]);
  console.log("Values:", values);
  console.log("Errors:", errors.length);
  
  console.log("=== End of Demo ===\n");
}
