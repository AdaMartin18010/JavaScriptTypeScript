/**
 * @file 异步控制流
 * @category Language Core → Control Flow
 * @difficulty warm
 * @tags async, await, promise, promise-all, promise-race, async-generator
 *
 * @description
 * 演示 Promise 状态机、async 函数返回值语义、await 非 thenable 值、
 * 串行 vs 并行 await、Promise 组合子（all/race/allSettled/any），
 * 以及异步生成器函数。
 */

// ============================================================================
// 1. Promise 状态机
// ============================================================================

/** ✅ Promise 状态：pending → fulfilled */
function demoPromiseStates(): void {
  console.log('--- Promise 状态 ---');

  const pending = new Promise(() => {});
  console.log('pending Promise:', pending); // Promise { <pending> }

  const fulfilled = Promise.resolve(42);
  fulfilled.then(v => console.log('fulfilled value:', v)); // 42

  const rejected = Promise.reject(new Error('fail'));
  rejected.catch(e => console.log('rejected reason:', (e as Error).message)); // "fail"

  // Promise 状态一旦确定不可变
  let mutablePromise = Promise.resolve(1);
  mutablePromise = Promise.resolve(2); // 这是重新赋值，不是改变原 Promise 状态
  console.log('Promise immutability: new reference assigned');
}

// ============================================================================
// 2. async 函数返回值
// ============================================================================

/** ✅ async 函数隐式返回 Promise */
async function implicitReturn(): Promise<number> {
  return 42; // 被包装为 Promise.resolve(42)
}

/** ✅ async 函数中抛出异常变为 rejected Promise */
async function implicitReject(): Promise<never> {
  throw new Error('async error'); // 被包装为 Promise.reject(Error)
}

/** 演示 async 返回值 */
async function demoAsyncReturn(): Promise<void> {
  console.log('\n--- async 函数返回值 ---');

  const result = implicitReturn();
  console.log('typeof result:', typeof result); // "object"
  console.log('result instanceof Promise:', result instanceof Promise); // true
  console.log('await result:', await result); // 42

  try {
    await implicitReject();
  } catch (e) {
    console.log('caught async reject:', (e as Error).message); // "async error"
  }
}

// ============================================================================
// 3. await 非 thenable 值
// ============================================================================

/** ✅ await 非 Promise 值立即 resolve */
async function demoAwaitNonThenable(): Promise<void> {
  console.log('\n--- await 非 thenable ---');

  const num = await 42;
  console.log('await 42:', num); // 42

  const str = await 'hello';
  console.log('await "hello":', str); // "hello"

  const obj = await { x: 1 };
  console.log('await { x: 1 }:', obj); // { x: 1 }

  const nul = await null;
  console.log('await null:', nul); // null
}

// ============================================================================
// 4. 串行 vs 并行 await
// ============================================================================

function delay<T>(ms: number, value: T): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

/** ❌ 反例：不必要的串行 await */
async function badSequential(): Promise<[number, number]> {
  const start = Date.now();
  const a = await delay(100, 1);
  const b = await delay(100, 2);
  console.log('  sequential time:', Date.now() - start, 'ms'); // ~200ms
  return [a, b];
}

/** ✅ 正例：并行执行 */
async function goodParallel(): Promise<[number, number]> {
  const start = Date.now();
  const [a, b] = await Promise.all([delay(100, 1), delay(100, 2)]);
  console.log('  parallel time:', Date.now() - start, 'ms'); // ~100ms
  return [a, b];
}

/** ✅ 有条件地并行：先发起请求，后 await */
async function parallelStart(): Promise<[number, number]> {
  const start = Date.now();
  const p1 = delay(100, 1);
  const p2 = delay(100, 2);
  // 两个 Promise 在此处已经并行开始
  const a = await p1;
  const b = await p2;
  console.log('  parallel-start time:', Date.now() - start, 'ms'); // ~100ms
  return [a, b];
}

// ============================================================================
// 5. Promise 组合子
// ============================================================================

/** ✅ Promise.all：全部成功 */
async function demoPromiseAll(): Promise<void> {
  console.log('\n--- Promise.all ---');
  const results = await Promise.all([
    Promise.resolve('a'),
    Promise.resolve('b')
  ]);
  console.log('Promise.all success:', results); // ['a', 'b']

  try {
    await Promise.all([Promise.resolve('a'), Promise.reject(new Error('fail'))]);
  } catch (e) {
    console.log('Promise.all first reject:', (e as Error).message); // "fail"
  }
}

/** ✅ Promise.race：首个完成（无论 fulfilled/rejected） */
async function demoPromiseRace(): Promise<void> {
  console.log('\n--- Promise.race ---');
  const winner = await Promise.race([
    delay(200, 'slow'),
    delay(50, 'fast')
  ]);
  console.log('Promise.race winner:', winner); // "fast"

  try {
    await Promise.race([
      delay(200, 'slow'),
      Promise.reject(new Error('instant-fail'))
    ]);
  } catch (e) {
    console.log('Promise.race first reject:', (e as Error).message); // "instant-fail"
  }
}

/** ✅ Promise.allSettled：全部完成，永不 reject */
async function demoPromiseAllSettled(): Promise<void> {
  console.log('\n--- Promise.allSettled ---');
  const results = await Promise.allSettled([
    Promise.resolve('ok'),
    Promise.reject(new Error('fail'))
  ]);
  console.log('Promise.allSettled:');
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      console.log(`  [${i}] fulfilled:`, r.value);
    } else {
      console.log(`  [${i}] rejected:`, r.reason.message);
    }
  });
}

/** ✅ Promise.any：首个成功 */
async function demoPromiseAny(): Promise<void> {
  console.log('\n--- Promise.any ---');
  const first = await Promise.any([
    delay(200, 'slow'),
    delay(50, 'fast')
  ]);
  console.log('Promise.any first success:', first); // "fast"

  try {
    await Promise.any([
      Promise.reject(new Error('err1')),
      Promise.reject(new Error('err2'))
    ]);
  } catch (e) {
    console.log('Promise.any all rejected:', e instanceof AggregateError);
    console.log('  errors:', (e as AggregateError).errors.map((x: Error) => x.message));
  }
}

// ============================================================================
// 6. 异步生成器函数
// ============================================================================

/** ✅ async generator */
async function* asyncCounter(max: number): AsyncGenerator<number, string, unknown> {
  for (let i = 1; i <= max; i++) {
    await delay(10, undefined);
    yield i;
  }
  return 'async-counter-done';
}

/** ✅ for await...of 消费异步生成器 */
async function demoAsyncGenerator(): Promise<void> {
  console.log('\n--- async generator ---');
  const values: number[] = [];
  for await (const v of asyncCounter(3)) {
    values.push(v);
  }
  console.log('asyncCounter values:', values); // [1, 2, 3]
}

/** ✅ 异步可迭代对象 */
class AsyncRange implements AsyncIterable<number> {
  constructor(private start: number, private end: number) {}

  async *[Symbol.asyncIterator](): AsyncGenerator<number, void, unknown> {
    for (let i = this.start; i < this.end; i++) {
      await delay(5, undefined);
      yield i;
    }
  }
}

// ============================================================================
// 7. 反例：常见异步陷阱
// ============================================================================

/** ❌ 反例：忘记 await，得到 Promise 而非结果 */
async function missingAwait(): Promise<void> {
  console.log('\n--- 反例：忘记 await ---');

  async function fetchUser(): Promise<{ name: string }> {
    return { name: 'Alice' };
  }

  // ❌ 忘记 await
  const userPromise = fetchUser();
  console.log('typeof userPromise:', typeof userPromise); // "object" (Promise!)
  console.log('userPromise.name:', (userPromise as unknown as { name: string }).name); // undefined

  // ✅ 正确 await
  const user = await fetchUser();
  console.log('awaited user.name:', user.name); // "Alice"
}

/** ❌ 反例：在 Array.map 中使用 async 但忘记 Promise.all */
async function badMapAsync(): Promise<void> {
  console.log('\n--- 反例：async map 无 Promise.all ---');

  const ids = [1, 2, 3];

  // ❌ 返回的是 Promise[]，不是结果[]
  const bad = ids.map(async id => delay(10, id * 2));
  console.log('bad map result:', bad); // [Promise, Promise, Promise]

  // ✅ 正确方式
  const good = await Promise.all(ids.map(async id => delay(10, id * 2)));
  console.log('good map result:', good); // [2, 4, 6]
}

/** ❌ 反例：try/catch 无法捕获同步块中创建的 rejected Promise */
function syncThrowInAsync(): void {
  console.log('\n--- 反例：同步块中的异步错误 ---');

  // ❌ try/catch 无法捕获 Promise.reject 的错误
  // 因为 Promise.reject 只是返回一个 rejected Promise，不会抛出异常
  let rejected: Promise<never>;
  try {
    rejected = Promise.reject(new Error('unhandled'));
  } catch {
    console.log('this will not print');
  }

  // 必须通过 .catch 或 await 处理，否则会成为 unhandled rejection
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  rejected!.catch(e => {
    console.log('caught via .catch (necessary):', (e as Error).message);
  });

  // ✅ 正确方式：直接链式调用 .catch
  Promise.reject(new Error('handled')).catch(e => {
    console.log('caught via .catch:', (e as Error).message);
  });
}

/** ❌ 反例：await 在循环中导致串行化 */
async function badLoopAwait(): Promise<void> {
  console.log('\n--- 反例：循环内 await 导致串行 ---');
  const start = Date.now();
  const results: number[] = [];
  for (const id of [1, 2, 3]) {
    results.push(await delay(30, id));
  }
  console.log('  loop await time:', Date.now() - start, 'ms'); // ~90ms
}

/** ✅ 正例：循环并行化 */
async function goodLoopParallel(): Promise<void> {
  console.log('--- 正例：循环并行化 ---');
  const start = Date.now();
  const promises = [1, 2, 3].map(id => delay(30, id));
  const results = await Promise.all(promises);
  console.log('  loop parallel time:', Date.now() - start, 'ms'); // ~30ms
  console.log('  results:', results);
}

// ============================================================================
// 导出
// ============================================================================

export {
  implicitReturn,
  implicitReject,
  delay,
  badSequential,
  goodParallel,
  parallelStart,
  asyncCounter,
  AsyncRange
};

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Async Control Flow Demo ===\n');

  demoPromiseStates();
  await demoAsyncReturn();
  await demoAwaitNonThenable();

  console.log('\n--- 串行 vs 并行 ---');
  await badSequential();
  await goodParallel();
  await parallelStart();

  await demoPromiseAll();
  await demoPromiseRace();
  await demoPromiseAllSettled();
  await demoPromiseAny();
  await demoAsyncGenerator();

  console.log('\n--- 异步可迭代对象 ---');
  const asyncValues: number[] = [];
  for await (const v of new AsyncRange(5, 8)) {
    asyncValues.push(v);
  }
  console.log('AsyncRange(5, 8):', asyncValues);

  await missingAwait();
  await badMapAsync();
  syncThrowInAsync();

  // 给微任务一点时间
  await delay(20, undefined);

  await badLoopAwait();
  await goodLoopParallel();

  console.log('\n=== End of Demo ===\n');
}
