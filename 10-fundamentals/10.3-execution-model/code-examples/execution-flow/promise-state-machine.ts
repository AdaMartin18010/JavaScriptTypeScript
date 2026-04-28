/**
 * @file Promise 状态机实现
 * @category Execution Flow → Promise State Machine
 * @difficulty hard
 * @tags promise, state-machine, thenable, chaining, async
 */

// ============================================================================
// 1. 最小 Promise-like 状态机
// ============================================================================

type PromiseState = "pending" | "fulfilled" | "rejected";

interface Handler<T, R> {
  onFulfilled?: (value: T) => R | PromiseLike<R>;
  onRejected?: (reason: unknown) => R | PromiseLike<R>;
  resolve: (value: R | PromiseLike<R>) => void;
  reject: (reason: unknown) => void;
}

class MiniPromise<T> {
  private state: PromiseState = "pending";
  private value?: T;
  private reason?: unknown;
  private handlers: Handler<T, unknown>[] = [];

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason: unknown) => void
    ) => void
  ) {
    const resolve = (value: T | PromiseLike<T>): void => {
      if (this.state !== "pending") return;
      this.resolveValue(value);
    };

    const reject = (reason: unknown): void => {
      if (this.state !== "pending") return;
      this.state = "rejected";
      this.reason = reason;
      this.handlers.forEach((h) => this.handleRejection(h));
      this.handlers = [];
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  private resolveValue(value: T | PromiseLike<T>): void {
    if (value === this) {
      throw new TypeError("Chaining cycle detected");
    }

    if (value && (typeof value === "object" || typeof value === "function")) {
      const thenable = value as PromiseLike<T>;
      if (typeof thenable.then === "function") {
        // Thenable assimilation
        thenable.then(
          (v) => this.resolveValue(v),
          (r) => this.reject(r)
        );
        return;
      }
    }

    this.state = "fulfilled";
    this.value = value as T;
    this.handlers.forEach((h) => this.handleFulfillment(h));
    this.handlers = [];
  }

  private reject(reason: unknown): void {
    if (this.state !== "pending") return;
    this.state = "rejected";
    this.reason = reason;
    this.handlers.forEach((h) => this.handleRejection(h));
    this.handlers = [];
  }

  private handleFulfillment<R>(handler: Handler<T, R>): void {
    if (handler.onFulfilled) {
      try {
        handler.resolve(handler.onFulfilled(this.value as T));
      } catch (err) {
        handler.reject(err);
      }
    } else {
      handler.resolve(this.value as unknown as R);
    }
  }

  private handleRejection<R>(handler: Handler<T, R>): void {
    if (handler.onRejected) {
      try {
        handler.resolve(handler.onRejected(this.reason));
      } catch (err) {
        handler.reject(err);
      }
    } else {
      handler.reject(this.reason);
    }
  }

  then<R>(
    onFulfilled?: (value: T) => R | PromiseLike<R>,
    onRejected?: (reason: unknown) => R | PromiseLike<R>
  ): MiniPromise<R> {
    return new MiniPromise<R>((resolve, reject) => {
      const handler: Handler<T, R> = { onFulfilled, onRejected, resolve, reject };

      if (this.state === "fulfilled") {
        queueMicrotask(() => this.handleFulfillment(handler));
      } else if (this.state === "rejected") {
        queueMicrotask(() => this.handleRejection(handler));
      } else {
        this.handlers.push(handler as Handler<T, unknown>);
      }
    });
  }

  catch<R>(onRejected: (reason: unknown) => R | PromiseLike<R>): MiniPromise<R> {
    return this.then(undefined, onRejected);
  }

  finally(onFinally: () => void): MiniPromise<T> {
    return this.then(
      (value) => {
        onFinally();
        return value;
      },
      (reason) => {
        onFinally();
        throw reason;
      }
    );
  }

  getState(): PromiseState {
    return this.state;
  }

  static resolve<T>(value: T | PromiseLike<T>): MiniPromise<T> {
    return new MiniPromise<T>((resolve) => resolve(value));
  }

  static reject<T = never>(reason: unknown): MiniPromise<T> {
    return new MiniPromise<T>((_, reject) => reject(reason));
  }
}

// ============================================================================
// 2. Thenable Assimilation 演示
// ============================================================================

function demonstrateThenableAssimilation(): void {
  console.log("--- 2. Thenable Assimilation ---");

  // 模拟 jQuery 风格的 thenable
  const jqueryLike = {
    then(onFulfilled?: (value: string) => void) {
      setTimeout(() => onFulfilled?.("jQuery resolved"), 10);
    }
  };

  MiniPromise.resolve("start")
    .then((v) => {
      console.log("第一步:", v);
      return jqueryLike as PromiseLike<string>;
    })
    .then((v) => {
      console.log("Thenable 被同化:", v);
    });
}

// ============================================================================
// 3. 链式调用演示
// ============================================================================

function demonstrateChaining(): void {
  console.log("\n--- 3. Promise 链式调用 ---");

  MiniPromise.resolve(2)
    .then((x) => x * 2)
    .then((x) => x + 1)
    .then((x) => {
      console.log("链式结果:", x); // 5
      return String(x);
    })
    .then((s) => console.log("转换后:", s));
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: 忘记返回 Promise */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: 忘记 return ---");

  MiniPromise.resolve("A")
    .then((v) => {
      console.log("第一个 then:", v);
      // ❌ 忘记 return，下一个 then 会收到 undefined
      MiniPromise.resolve("B").then((inner) => {
        console.log("内部 Promise:", inner);
      });
    })
    .then((v) => {
      console.log("第二个 then 收到:", v); // undefined
    });
}

/** 反例 2: 未捕获的拒绝 */
function counterExample2(): void {
  console.log("\n--- Counter-example 2: 未捕获的拒绝 ---");

  // ❌ 没有 catch，错误被静默吞掉
  new MiniPromise<string>((resolve) => {
    resolve("ok");
  }).then((v) => {
    throw new Error(`处理 ${v} 时出错`);
  });
  console.log("上面的错误没有 catch，可能导致未处理的 Promise 拒绝");

  // ✅ 正确的做法
  MiniPromise.resolve("ok")
    .then((v) => {
      throw new Error(`处理 ${v} 时出错`);
    })
    .catch((err) => {
      console.log("捕获错误:", (err as Error).message);
    });
}

/** 反例 3: 嵌套 Promise 地狱 */
function counterExample3(): void {
  console.log("\n--- Counter-example 3: Promise 嵌套地狱 ---");
  console.log(`
// ❌ 嵌套 Promise（Promise 地狱）
getUser(id).then(user => {
  getOrders(user.id).then(orders => {
    getProducts(orders[0].id).then(product => {
      console.log(product);
    });
  });
});

// ✅ 链式调用
getUser(id)
  .then(user => getOrders(user.id))
  .then(orders => getProducts(orders[0].id))
  .then(product => console.log(product))
  .catch(err => console.error(err));
  `);
}

/** 反例 4: finally 不接收参数 */
function counterExample4(): void {
  console.log("--- Counter-example 4: finally 不接收参数 ---");

  MiniPromise.resolve("data")
    .finally(() => {
      console.log("finally 执行了（不接收参数）");
      // ❌ 试图在 finally 中获取值是错误的
      // console.log(value); // ReferenceError
    });
}

/** 反例 5: Promise 构造函数中的同步错误 */
function counterExample5(): void {
  console.log("\n--- Counter-example 5: 同步错误 vs 异步拒绝 ---");

  // 同步错误会被 try/catch 捕获
  try {
    new MiniPromise<string>(() => {
      throw new Error("同步错误");
    });
  } catch (e) {
    console.log("try/catch 捕获同步错误:", (e as Error).message);
  }

  // 异步错误不会被 try/catch 捕获
  try {
    new MiniPromise<string>((_, reject) => {
      setTimeout(() => reject(new Error("异步错误")), 0);
    });
    console.log("异步拒绝无法被 try/catch 捕获");
  } catch (e) {
    console.log("这不会执行");
  }
}

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Promise State Machine Demo ===\n");

  // 基础状态转换
  console.log("--- 1. Promise 状态转换 ---");
  const p1 = new MiniPromise<string>((resolve) => {
    console.log("创建时状态:", p1.getState());
    resolve("done");
    console.log("resolve 后状态:", p1.getState());
  });

  const p2 = new MiniPromise<string>((_, reject) => {
    reject("error");
    console.log("reject 后状态:", p2.getState());
  });

  // thenable assimilation
  demonstrateThenableAssimilation();

  // chaining
  demonstrateChaining();

  // catch / finally
  console.log("\n--- 4. catch & finally ---");
  MiniPromise.reject<string>("oops")
    .catch((err) => {
      console.log("catch 到:", err);
      return "recovered";
    })
    .finally(() => {
      console.log("finally 执行");
    })
    .then((v) => console.log("恢复后:", v));

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();
  counterExample4();
  counterExample5();

  console.log("\n=== End of Promise State Machine Demo ===\n");
}

export {
  MiniPromise,
  demonstrateThenableAssimilation,
  demonstrateChaining,
};
