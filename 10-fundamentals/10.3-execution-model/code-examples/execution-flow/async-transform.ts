/**
 * @file async/await 语法糖展开
 * @category Execution Flow → Async Transform
 * @difficulty hard
 * @tags async, await, desugar, promise-chain, generator
 */

// ============================================================================
// 1. async/await 手动展开为 Promise 链
// ============================================================================

/**
 * 原始 async 函数：
 * async function fetchUserData(userId: string) {
 *   const user = await getUser(userId);
 *   const orders = await getOrders(user.id);
 *   return { user, orders };
 * }
 */

/** 手动展开的 Promise 链等价形式 */
interface User {
  id: string;
  name: string;
}

interface Order {
  id: string;
  amount: number;
}

function mockGetUser(id: string): Promise<User> {
  return Promise.resolve({ id, name: `User-${id}` });
}

function mockGetOrders(userId: string): Promise<Order[]> {
  return Promise.resolve([
    { id: "o1", amount: 100 },
    { id: "o2", amount: 200 },
  ]);
}

// async/await 原始版本
async function fetchUserDataAsync(userId: string): Promise<{ user: User; orders: Order[] }> {
  const user = await mockGetUser(userId);
  const orders = await mockGetOrders(user.id);
  return { user, orders };
}

// 手动展开的 Promise 链版本
function fetchUserDataDesugared(userId: string): Promise<{ user: User; orders: Order[] }> {
  return new Promise((resolve, reject) => {
    mockGetUser(userId)
      .then((user) => {
        return mockGetOrders(user.id).then((orders) => {
          resolve({ user, orders });
        });
      })
      .catch((err) => reject(err));
  });
}

// 更精确的 Promise 链版本（模拟状态机）
function fetchUserDataStateMachine(userId: string): Promise<{ user: User; orders: Order[] }> {
  return mockGetUser(userId).then((user) => {
    return mockGetOrders(user.id).then((orders) => {
      return { user, orders };
    });
  });
}

// ============================================================================
// 2. 包含 try/catch 的展开
// ============================================================================

async function fetchWithRetryAsync(userId: string): Promise<User> {
  try {
    const user = await mockGetUser(userId);
    return user;
  } catch (err) {
    console.log("Error:", err);
    return { id: "fallback", name: "Fallback User" };
  }
}

function fetchWithRetryDesugared(userId: string): Promise<User> {
  return mockGetUser(userId).then(
    (user) => user,
    (err) => {
      console.log("Error:", err);
      return { id: "fallback", name: "Fallback User" };
    }
  );
}

// ============================================================================
// 3. 包含循环的展开
// ============================================================================

async function processItemsAsync(items: string[]): Promise<string[]> {
  const results: string[] = [];
  for (const item of items) {
    const processed = await Promise.resolve(item.toUpperCase());
    results.push(processed);
  }
  return results;
}

/** 循环的手动展开（使用递归模拟） */
function processItemsDesugared(items: string[]): Promise<string[]> {
  const results: string[] = [];

  function iterate(index: number): Promise<string[]> {
    if (index >= items.length) {
      return Promise.resolve(results);
    }
    return Promise.resolve(items[index].toUpperCase()).then((processed) => {
      results.push(processed);
      return iterate(index + 1);
    });
  }

  return iterate(0);
}

// ============================================================================
// 4. Generator + Promise 模拟 async/await
// ============================================================================

function runGenerator<T>(
  gen: Generator<Promise<unknown>, T, unknown>
): Promise<T> {
  return new Promise((resolve, reject) => {
    function step(value?: unknown): void {
      let result: IteratorResult<Promise<unknown>, T>;
      try {
        result = gen.next(value);
      } catch (err) {
        reject(err);
        return;
      }

      if (result.done) {
        resolve(result.value);
        return;
      }

      Promise.resolve(result.value).then(
        (v) => step(v),
        (err) => {
          try {
            const threw = gen.throw!(err);
            if (threw.done) {
              resolve(threw.value);
            } else {
              step(threw.value);
            }
          } catch (e) {
            reject(e);
          }
        }
      );
    }

    step();
  });
}

function* fetchUserDataGenerator(userId: string): Generator<Promise<unknown>, { user: User; orders: Order[] }, unknown> {
  const user = yield mockGetUser(userId);
  const orders = yield mockGetOrders((user as User).id);
  return { user: user as User, orders: orders as Order[] };
}

function fetchUserDataWithGenerator(userId: string): Promise<{ user: User; orders: Order[] }> {
  return runGenerator(fetchUserDataGenerator(userId));
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: 并行误用 await */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: 串行 vs 并行 ---");
  console.log(`
// ❌ 串行执行（总时间 = a + b）
async function slow() {
  const a = await fetchA(); // 1s
  const b = await fetchB(); // 1s
  return [a, b]; // 总时间 2s
}

// ✅ 并行执行（总时间 = max(a, b)）
async function fast() {
  const [a, b] = await Promise.all([fetchA(), fetchB()]);
  return [a, b]; // 总时间 1s
}
  `);
}

/** 反例 2: await 在 forEach 中 */
function counterExample2(): void {
  console.log("--- Counter-example 2: forEach 中的 await ---");
  console.log(`
// ❌ forEach 不会等待 Promise
urls.forEach(async (url) => {
  const data = await fetch(url);
  console.log(data); // 顺序不可预测
});
console.log("done"); // 会在所有 fetch 完成前打印

// ✅ 使用 for...of
for (const url of urls) {
  const data = await fetch(url);
  console.log(data);
}
console.log("done"); // 正确等待

// ✅ 或者使用 Promise.all
await Promise.all(urls.map(async (url) => {
  const data = await fetch(url);
  console.log(data);
}));
  `);
}

/** 反例 3: 忘记 await */
function counterExample3(): void {
  console.log("--- Counter-example 3: 忘记 await ---");

  async function forgotAwait(): Promise<string> {
    const promise = Promise.resolve("value");
    return promise; // ✅ 返回 Promise 是允许的
  }

  async function reallyForgot(): Promise<void> {
    const promise = Promise.resolve("value");
    console.log(promise); // ❌ 打印的是 Promise 对象，不是 "value"
    // 应该是: console.log(await promise);
  }

  reallyForgot();
}

/** 反例 4: 在普通函数中使用 await */
function counterExample4(): void {
  console.log("\n--- Counter-example 4: async 函数返回值 ---");
  console.log(`
// async 函数总是返回 Promise
async function getValue() {
  return 42;
}

const result = getValue();
console.log(result); // Promise { 42 }

// ❌ 错误：试图直接获取值
const value = getValue(); // 这是 Promise，不是 42

// ✅ 正确
const value = await getValue(); // 42
  `);
}

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Async/Await Transform Demo ===\n");

  // 对比 async/await 和手动展开
  console.log("--- 1. async/await vs Promise 链 ---");
  const r1 = await fetchUserDataAsync("u1");
  console.log("async/await:", r1);

  const r2 = await fetchUserDataDesugared("u1");
  console.log("手动展开:", r2);

  const r3 = await fetchUserDataStateMachine("u1");
  console.log("状态机版本:", r3);

  // try/catch 展开
  console.log("\n--- 2. try/catch 展开 ---");
  const r4 = await fetchWithRetryAsync("u2");
  console.log("async try/catch:", r4);

  const r5 = await fetchWithRetryDesugared("u2");
  console.log("desugared try/catch:", r5);

  // 循环展开
  console.log("\n--- 3. 循环展开 ---");
  const items = ["a", "b", "c"];
  const r6 = await processItemsAsync(items);
  console.log("async 循环:", r6);

  const r7 = await processItemsDesugared(items);
  console.log("手动展开循环:", r7);

  // Generator 模拟
  console.log("\n--- 4. Generator 模拟 async/await ---");
  const r8 = await fetchUserDataWithGenerator("u1");
  console.log("Generator 版本:", r8);

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();
  counterExample4();

  console.log("\n=== End of Async Transform Demo ===\n");
}

export {
  fetchUserDataAsync,
  fetchUserDataDesugared,
  fetchUserDataStateMachine,
  fetchWithRetryAsync,
  fetchWithRetryDesugared,
  processItemsAsync,
  processItemsDesugared,
  runGenerator,
  fetchUserDataWithGenerator,
};
