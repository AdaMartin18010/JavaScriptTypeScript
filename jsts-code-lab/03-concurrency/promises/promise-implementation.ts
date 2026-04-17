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
  private value?: T | PromiseLike<T>;
  private reason?: any;
  private onFulfilledCallbacks: ((value: T | PromiseLike<T>) => void)[] = [];
  private onRejectedCallbacks: ((reason: any) => void)[] = [];

  constructor(executor: Executor<T>) {
    const resolve: Resolve<T> = value => {
      if (this.state === PromiseState.Pending) {
        this.state = PromiseState.Fulfilled;
        this.value = value;
        this.onFulfilledCallbacks.forEach(cb => { cb(value); });
      }
    };

    const reject: Reject = reason => {
      if (this.state === PromiseState.Pending) {
        this.state = PromiseState.Rejected;
        this.reason = reason;
        this.onRejectedCallbacks.forEach(cb => { cb(reason); });
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
      const fulfilledHandler = (value: T | PromiseLike<T>) => {
        if (!onFulfilled) {
          resolve(value as unknown as TResult1);
          return;
        }
        try {
          resolve(onFulfilled(value as T));
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
        queueMicrotask(() => { fulfilledHandler(this.value!); });
      } else if (this.state === PromiseState.Rejected) {
        queueMicrotask(() => { rejectedHandler(this.reason); });
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
    return new MyPromise(resolve => { resolve(value); });
  }

  static reject<T = never>(reason?: any): MyPromise<T> {
    return new MyPromise((_, reject) => { reject(reason); });
  }

  static all<T>(promises: MyPromise<T>[]): MyPromise<T[]> {
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
          reason => { reject(reason); }
        );
      });
    });
  }

  static race<T>(promises: MyPromise<T>[]): MyPromise<T> {
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

export { MyPromise };

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== MyPromise Implementation Demo ===");

  // 基础 Promise 演示
  console.log("\n1. Basic Promise resolution:");
  const p1 = new MyPromise<number>((resolve) => {
    setTimeout(() => { resolve(42); }, 10);
  });
  p1.then(value => {
    console.log("   Resolved with:", value);
  });

  // Promise 链式调用
  console.log("\n2. Chaining:");
  const p2 = new MyPromise<number>((resolve) => {
    resolve(10);
  });
  p2
    .then(value => {
      console.log("   First then:", value);
      return value * 2;
    })
    .then(value => {
      console.log("   Second then:", value);
      return value + 5;
    })
    .then(value => {
      console.log("   Third then:", value);
    });

  // Promise 错误处理
  console.log("\n3. Error handling:");
  const p3 = new MyPromise<number>((_, reject) => {
    reject(new Error("Something went wrong"));
  });
  p3
    .catch(error => {
      console.log("   Caught error:", (error as Error).message);
      return 0;
    })
    .then(value => {
      console.log("   Recovered with:", value);
    });

  // Promise.finally
  console.log("\n4. Finally:");
  const p4 = new MyPromise<string>((resolve) => {
    resolve("Success");
  });
  p4
    .then(value => { console.log("   Value:", value); })
    .finally(() => { console.log("   Finally executed"); });

  // 静态方法演示
  console.log("\n5. Static methods:");
  
  // MyPromise.resolve
  MyPromise.resolve("Immediate value").then(v => 
    { console.log("   resolve:", v); }
  );

  // MyPromise.reject
  MyPromise.reject("Error value").catch(e => 
    { console.log("   reject:", e); }
  );

  // MyPromise.all
  console.log("\n6. Promise.all:");
  MyPromise.all([
    MyPromise.resolve(1),
    MyPromise.resolve(2),
    MyPromise.resolve(3)
  ]).then(results => {
    console.log("   All results:", results);
  });

  // MyPromise.race
  console.log("\n7. Promise.race:");
  MyPromise.race([
    new MyPromise<number>(resolve => setTimeout(() => { resolve(1); }, 50)),
    new MyPromise<number>(resolve => setTimeout(() => { resolve(2); }, 10))
  ]).then(winner => {
    console.log("   Race winner:", winner);
  });

  console.log("\n=== End of Demo ===\n");
}
