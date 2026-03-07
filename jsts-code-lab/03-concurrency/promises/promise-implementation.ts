/**
 * @file Promise 手写实现
 * @category Concurrency → Promises
 * @difficulty hard
 * @tags promise, async, implementation, polyfill
 */

// ============================================================================
// 1. 基础 Promise 实现
// ============================================================================

type Resolve<T> = (value: T | PromiseLike<T>) => void;
type Reject = (reason?: any) => void;
type Executor<T> = (resolve: Resolve<T>, reject: Reject) => void;
type OnFulfilled<T, TResult> = (value: T) => TResult | PromiseLike<TResult>;
type OnRejected<TResult> = (reason: any) => TResult | PromiseLike<TResult>;

enum PromiseState {
  Pending = 'pending',
  Fulfilled = 'fulfilled',
  Rejected = 'rejected'
}

class MyPromise<T> {
  private state = PromiseState.Pending;
  private value?: T;
  private reason?: any;
  private onFulfilledCallbacks: Array<(value: T) => void> = [];
  private onRejectedCallbacks: Array<(reason: any) => void> = [];

  constructor(executor: Executor<T>) {
    const resolve: Resolve<T> = value => {
      if (this.state === PromiseState.Pending) {
        this.state = PromiseState.Fulfilled;
        this.value = value;
        this.onFulfilledCallbacks.forEach(cb => cb(value));
      }
    };

    const reject: Reject = reason => {
      if (this.state === PromiseState.Pending) {
        this.state = PromiseState.Rejected;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(cb => cb(reason));
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then<TResult1 = T, TResult2 = never>(
    onFulfilled?: OnFulfilled<T, TResult1> | null,
    onRejected?: OnRejected<TResult2> | null
  ): MyPromise<TResult1 | TResult2> {
    return new MyPromise((resolve, reject) => {
      const fulfilledHandler = (value: T) => {
        if (!onFulfilled) {
          resolve(value as unknown as TResult1);
          return;
        }
        try {
          resolve(onFulfilled(value));
        } catch (error) {
          reject(error);
        }
      };

      const rejectedHandler = (reason: any) => {
        if (!onRejected) {
          reject(reason);
          return;
        }
        try {
          resolve(onRejected(reason));
        } catch (error) {
          reject(error);
        }
      };

      if (this.state === PromiseState.Fulfilled) {
        queueMicrotask(() => fulfilledHandler(this.value!));
      } else if (this.state === PromiseState.Rejected) {
        queueMicrotask(() => rejectedHandler(this.reason));
      } else {
        this.onFulfilledCallbacks.push(fulfilledHandler);
        this.onRejectedCallbacks.push(rejectedHandler);
      }
    });
  }

  catch<TResult = never>(
    onRejected?: OnRejected<TResult> | null
  ): MyPromise<T | TResult> {
    return this.then(null, onRejected);
  }

  finally(onFinally?: (() => void) | null): MyPromise<T> {
    return this.then(
      value => {
        onFinally?.();
        return value;
      },
      reason => {
        onFinally?.();
        throw reason;
      }
    );
  }

  // 静态方法
  static resolve<T>(value: T | PromiseLike<T>): MyPromise<T> {
    if (value instanceof MyPromise) return value;
    return new MyPromise(resolve => resolve(value));
  }

  static reject<T = never>(reason?: any): MyPromise<T> {
    return new MyPromise((_, reject) => reject(reason));
  }

  static all<T>(promises: Array<MyPromise<T>>): MyPromise<T[]> {
    return new MyPromise((resolve, reject) => {
      const results: T[] = [];
      let completed = 0;

      if (promises.length === 0) {
        resolve([]);
        return;
      }

      promises.forEach((promise, index) => {
        MyPromise.resolve(promise).then(
          value => {
            results[index] = value;
            completed++;
            if (completed === promises.length) {
              resolve(results);
            }
          },
          reason => reject(reason)
        );
      });
    });
  }

  static race<T>(promises: Array<MyPromise<T>>): MyPromise<T> {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        MyPromise.resolve(promise).then(resolve, reject);
      });
    });
  }
}

// ============================================================================
// 2. 使用示例
// ============================================================================

const demo = new MyPromise<number>((resolve, reject) => {
  setTimeout(() => resolve(42), 100);
});

demo
  .then(value => {
    console.log('Value:', value);
    return value * 2;
  })
  .then(value => {
    console.log('Doubled:', value);
  });

// ============================================================================
// 导出
// ============================================================================

export { MyPromise };
