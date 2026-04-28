/**
 * @file Promise.try (ES2025)
 * @category ECMAScript Evolution → ES2025
 * @difficulty easy
 * @tags promise, error-handling, es2025
 * @description
 * 演示 ES2025 Promise.try 方法：将同步或异步函数统一包装为 Promise，
 * 无论函数抛出异常还是返回非 Promise 值，结果都以 Promise 形式呈现。
 * 这是 new Promise((resolve, reject) => { ... }) 的安全简写。
 */

// ES2025 类型补丁：Promise.try 尚未进入所有 TypeScript lib 定义
declare global {
  interface PromiseConstructor {
    try<T>(fn: () => T | PromiseLike<T>): Promise<T>;
    try<T, A extends readonly unknown[]>(fn: (...args: A) => T | PromiseLike<T>, ...args: A): Promise<T>;
  }
}

/** 基本错误统一处理 */
export function basicErrorHandlingDemo(): Promise<string> {
  return Promise.try(() => {
    if (Math.random() < 0) throw new Error('Never happens in demo');
    return 'success';
  });
}

/** 参数传递演示 */
export function argumentPassingDemo(a: number, b: number): Promise<number> {
  return Promise.try((x: number, y: number) => x + y, a, b);
}

/** 与 async/await 配合 */
export async function asyncAwaitIntegrationDemo(): Promise<string> {
  const result = await Promise.try(async () => {
    await new Promise((resolve) => setTimeout(resolve, 10));
    return 'async result';
  });
  return result;
}

/** 同步异常也会被捕获为 rejection */
export function syncExceptionDemo(): Promise<never> {
  return Promise.try(() => {
    throw new Error('sync error');
  });
}

/** 对比 Promise.resolve 和 new Promise */
export function comparisonDemo(): {
  promiseTry: Promise<string>;
  promiseResolve: Promise<string>;
} {
  const fn = () => {
    throw new Error('boom');
  };

  return {
    // Promise.try 会捕获同步异常并 reject
    promiseTry: Promise.try(fn).catch((e) => `caught by try: ${e.message}`),
    // Promise.resolve(fn()) 会在调用 fn() 时直接抛出异常，无法捕获
    // 此处为了演示安全，需要 try/catch 包裹
    promiseResolve: (() => {
      try {
        return Promise.resolve(fn() as unknown as string).catch((e) => `caught: ${e.message}`);
      } catch (e) {
        return Promise.resolve(`uncaught by resolve: ${(e as Error).message}`);
      }
    })(),
  };
}
