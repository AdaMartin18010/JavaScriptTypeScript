/**
 * @file ES2024 Promise.withResolvers
 * @category ECMAScript Evolution → ES2024
 * @difficulty easy
 * @tags es2024, promise, deferred, withresolvers
 */

// ============================================================================
// 1. 基础用法
// ============================================================================

// 传统方式
function createDeferred<T>() {
  let resolve: (value: T) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve: resolve!, reject: reject! };
}

// ES2024 方式
function createDeferredModern<T>() {
  return Promise.withResolvers<T>();
}

// ============================================================================
// 2. 使用场景：延迟操作
// ============================================================================

class DelayedAction<T> {
  private deferred = Promise.withResolvers<T>();
  private timeoutId?: ReturnType<typeof setTimeout>;

  schedule(action: () => T, delay: number): Promise<T> {
    this.timeoutId = setTimeout(() => {
      try {
        const result = action();
        this.deferred.resolve(result);
      } catch (error) {
        this.deferred.reject(error);
      }
    }, delay);

    return this.deferred.promise;
  }

  cancel(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.deferred.reject(new Error('Action cancelled'));
    }
  }

  get promise(): Promise<T> {
    return this.deferred.promise;
  }
}

// ============================================================================
// 3. 使用场景：手动控制 Promise
// ============================================================================

class AsyncLock {
  private deferred = Promise.withResolvers<void>();
  private locked = false;

  async acquire(): Promise<void> {
    if (this.locked) {
      await this.deferred.promise;
    }
    this.locked = true;
  }

  release(): void {
    this.locked = false;
    this.deferred.resolve();
    // 重置以便下次使用
    this.deferred = Promise.withResolvers<void>();
  }
}

// ============================================================================
// 4. 使用场景：取消请求
// ============================================================================

interface CancellableRequest<T> {
  promise: Promise<T>;
  cancel: (reason?: string) => void;
}

function createCancellableRequest<T>(
  executor: (
    resolve: (value: T) => void,
    reject: (reason?: unknown) => void
  ) => () => void
): CancellableRequest<T> {
  const { promise, resolve, reject } = Promise.withResolvers<T>();
  const cleanup = executor(resolve, reject);

  return {
    promise,
    cancel: (reason = 'Request cancelled') => {
      cleanup();
      reject(new Error(reason));
    }
  };
}

// 使用
function fetchWithCancellation(url: string): CancellableRequest<Response> {
  const controller = new AbortController();

  return createCancellableRequest((resolve, reject) => {
    fetch(url, { signal: controller.signal })
      .then(resolve)
      .catch(reject);

    return () => controller.abort();
  });
}

// ============================================================================
// 5. 使用场景：条件等待
// ============================================================================

class ConditionVariable {
  private waiters: Array<PromiseWithResolvers<void>> = [];

  async wait(condition: () => boolean): Promise<void> {
    if (condition()) return;

    const deferred = Promise.withResolvers<void>();
    this.waiters.push(deferred);
    return deferred.promise;
  }

  notify(): void {
    const waiter = this.waiters.shift();
    if (waiter) {
      waiter.resolve();
    }
  }

  notifyAll(): void {
    while (this.waiters.length > 0) {
      this.waiters.shift()!.resolve();
    }
  }
}

// ============================================================================
// 6. 对比：Promise.withResolvers vs 构造函数
// ============================================================================

// 传统方式 - 需要将 resolve/reject 赋值给外部变量
let externalResolve: (value: string) => void;
let externalReject: (reason?: unknown) => void;

const traditionalPromise = new Promise<string>((resolve, reject) => {
  externalResolve = resolve;
  externalReject = reject;
});

// 使用 externalResolve 和 externalReject
// 但 TypeScript 会认为它们可能未被赋值

// ES2024 方式 - 直接获取 resolve/reject
const { promise, resolve, reject } = Promise.withResolvers<string>();

// resolve 和 reject 可以直接使用
resolve('success');

// ============================================================================
// 导出
// ============================================================================

export {
  createDeferred,
  createDeferredModern,
  DelayedAction,
  AsyncLock,
  createCancellableRequest,
  fetchWithCancellation,
  ConditionVariable
};

export type { CancellableRequest };
// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Promise.withResolvers Demo ===");
  
  // 基础用法
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  
  setTimeout(() => resolve("completed!"), 100);
  const result = await promise;
  console.log("Resolved:", result);
  
  // 延迟操作
  const delayed = new DelayedAction<string>();
  delayed.schedule(() => "delayed result", 50);
  const delayedResult = await delayed.promise;
  console.log("Delayed:", delayedResult);
  
  // 异步锁
  const lock = new AsyncLock();
  await lock.acquire();
  console.log("Lock acquired");
  lock.release();
  console.log("Lock released");
  
  // 对比旧方式和新方式
  const modern = createDeferredModern<string>();
  modern.resolve("modern way");
  console.log("Modern deferred:", await modern.promise);
  
  console.log("=== End of Demo ===\n");
}
