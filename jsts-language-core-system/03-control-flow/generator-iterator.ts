/**
 * @file 生成器与迭代器控制
 * @category Language Core → Control Flow
 * @difficulty warm
 * @tags generator, iterator, yield, coroutine, symbol-iterator, custom-iterable
 *
 * @description
 * 演示生成器函数、`yield*` 委托、迭代器协议、自定义可迭代对象、
 * 生成器作为协程的双向通信，以及 `return()` 和 `throw()` 的边界行为。
 */

// ============================================================================
// 1. 基础生成器
// ============================================================================

/** ✅ 简单生成器：惰性序列 */
function* countUpTo(max: number): Generator<number, any, unknown> {
  for (let i = 1; i <= max; i++) {
    yield i;
  }
}

/** ✅ 无限序列生成器 */
function* fibonacci(): Generator<number, never, unknown> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// ============================================================================
// 2. yield* 委托
// ============================================================================

/** ✅ yield* 委托到另一个生成器 */
function* delegatedGenerator(): Generator<number, string, unknown> {
  yield* [1, 2, 3];
  yield* countUpTo(3);
  return 'done';
}

/** ✅ yield* 委托到字符串（可迭代对象） */
function* charGenerator(str: string): Generator<string, void, unknown> {
  yield* str;
}

/** ✅ 嵌套 yield* */
function* outer(): Generator<number, string, unknown> {
  yield* inner();
  return 'outer-done';
}

function* inner(): Generator<number, string, unknown> {
  yield 1;
  yield 2;
  return 'inner-done'; // return 值可被外层 yield* 获取（但通常忽略）
}

// ============================================================================
// 3. 迭代器协议与自定义可迭代对象
// ============================================================================

/** ✅ 自定义可迭代对象 */
class Range implements Iterable<number> {
  constructor(private start: number, private end: number, private step = 1) {}

  *[Symbol.iterator](): Generator<number, void, unknown> {
    for (let i = this.start; i < this.end; i += this.step) {
      yield i;
    }
  }
}

/** ✅ 手动实现迭代器协议（不通过生成器） */
class ManualCounter implements Iterator<number> {
  private current = 0;

  next(): IteratorResult<number> {
    if (this.current >= 3) {
      return { value: undefined, done: true };
    }
    return { value: this.current++, done: false };
  }

  [Symbol.iterator](): Iterator<number> {
    return this;
  }
}

/** ✅ 可迭代 + 迭代器双实现 */
class Countdown implements Iterable<number> {
  constructor(private start: number) {}

  [Symbol.iterator](): Iterator<number> {
    let count = this.start;
    return {
      next(): IteratorResult<number> {
        if (count <= 0) {
          return { value: undefined, done: true };
        }
        return { value: count--, done: false };
      }
    };
  }
}

// ============================================================================
// 4. 生成器作为协程（双向通信）
// ============================================================================

/** ✅ 双向通信：yield 接收外部值 */
function* bidirectional(): Generator<string, void, string> {
  const received1 = yield 'first'; // 产出 "first"，接收外部值
  console.log('  generator received:', received1);

  const received2 = yield `second (got: ${received1})`;
  console.log('  generator received:', received2);

  yield `final (got: ${received2})`;
}

/** ✅ 状态机协程 */
function* stateMachine(): Generator<string, void, 'NEXT' | 'RESET'> {
  let state = 0;
  while (true) {
    const command = yield `state-${state}`;
    if (command === 'RESET') {
      state = 0;
    } else {
      state++;
    }
  }
}

// ============================================================================
// 5. return() 与 throw() 的边界行为
// ============================================================================

/** ✅ return() 提前终止生成器 */
function demoReturn(): void {
  console.log('\n--- generator.return() ---');
  const gen = countUpTo(5);
  console.log('next():', gen.next()); // { value: 1, done: false }
  console.log('return(99):', gen.return(99)); // { value: 99, done: true }
  console.log('next() after return:', gen.next()); // { value: undefined, done: true }
}

/** ✅ throw() 向生成器注入异常 */
function demoThrow(): void {
  console.log('\n--- generator.throw() ---');

  function* withTryCatch(): Generator<string, void, unknown> {
    try {
      yield 'before-error';
      yield 'after-error'; // 这行不会执行
    } catch (err) {
      yield `caught: ${(err as Error).message}`;
    }
    yield 'after-catch';
  }

  const gen = withTryCatch();
  console.log('next():', gen.next()); // { value: 'before-error', done: false }
  console.log('throw():', gen.throw(new Error('injected'))); // { value: 'caught: injected', done: false }
  console.log('next():', gen.next()); // { value: 'after-catch', done: false }
  console.log('next():', gen.next()); // { value: undefined, done: true }
}

/** ❌ 反例：未捕获 throw 会导致生成器终止 */
function demoUncaughtThrow(): void {
  console.log('\n--- 未捕获的 throw() ---');

  function* noCatch(): Generator<string, void, unknown> {
    yield 'one';
    yield 'two'; // throw 在这里注入，无 try/catch
    yield 'three';
  }

  const gen = noCatch();
  console.log('next():', gen.next()); // { value: 'one', done: false }
  try {
    gen.throw(new Error('boom'));
  } catch (e) {
    console.log('uncaught throw propagated:', (e as Error).message);
  }
  console.log('next() after uncaught throw:', gen.next()); // { value: undefined, done: true }
}

// ============================================================================
// 6. 反例：生成器的常见陷阱
// ============================================================================

/** ❌ 反例：复用已耗尽的生成器 */
function demoExhaustedReuse(): void {
  console.log('\n--- 反例：复用已耗尽的生成器 ---');
  const gen = countUpTo(2);
  console.log('first loop:', [...gen]); // [1, 2]
  console.log('second loop (exhausted):', [...gen]); // [] —— 生成器只能遍历一次！
}

/** ❌ 反例：在 for...of 中提前 break 不会自动调用 return */
function demoBreakBehavior(): void {
  console.log('\n--- 反例：for...of break ---');

  function* withCleanup(): Generator<number, void, unknown> {
    try {
      yield 1;
      yield 2;
      yield 3;
    } finally {
      console.log('  cleanup executed!');
    }
  }

  for (const value of withCleanup()) {
    console.log('  value:', value);
    if (value === 1) break; // break 会触发 finally！
  }
}

/** ❌ 反例：yield* 委托时 throw 的行为 */
function demoDelegatedThrow(): void {
  console.log('\n--- yield* 与 throw() ---');

  function* innerGen(): Generator<number, void, unknown> {
    try {
      yield 1;
      yield 2;
    } catch (e) {
      console.log('  inner caught:', (e as Error).message);
    }
  }

  function* outerGen(): Generator<number, void, unknown> {
    try {
      yield* innerGen();
      yield 3;
    } catch (e) {
      console.log('  outer caught:', (e as Error).message);
    }
  }

  const gen = outerGen();
  console.log('next():', gen.next()); // { value: 1, done: false }
  gen.throw(new Error('from-outer')); // 异常沿 yield* 传播到 inner
}

// ============================================================================
// 导出
// ============================================================================

export {
  countUpTo,
  fibonacci,
  delegatedGenerator,
  charGenerator,
  outer,
  inner,
  Range,
  ManualCounter,
  Countdown,
  bidirectional,
  stateMachine
};

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log('=== Generator & Iterator Control Demo ===\n');

  console.log('--- 基础生成器 ---');
  console.log('countUpTo(3):', [...countUpTo(3)]);

  console.log('\n--- 无限序列（取前 8 个）---');
  const fib = fibonacci();
  const fibFirst8: number[] = [];
  for (let i = 0; i < 8; i++) {
    fibFirst8.push(fib.next().value);
  }
  console.log('fibonacci first 8:', fibFirst8);

  console.log('\n--- yield* 委托 ---');
  const delegated = delegatedGenerator();
  const delegatedValues: (number | string)[] = [];
  let dr = delegated.next();
  while (!dr.done) {
    delegatedValues.push(dr.value);
    dr = delegated.next();
  }
  delegatedValues.push(dr.value); // 'done'
  console.log('delegatedGenerator:', delegatedValues);

  console.log('\n--- 自定义可迭代对象 ---');
  console.log('Range(2, 8, 2):', [...new Range(2, 8, 2)]);
  console.log('ManualCounter:', [...new ManualCounter()]);
  console.log('Countdown(3):', [...new Countdown(3)]);

  console.log('\n--- 双向通信协程 ---');
  const bi = bidirectional();
  console.log('next():', bi.next().value);
  console.log('next("hello"):', bi.next('hello').value);
  console.log('next("world"):', bi.next('world').value);

  console.log('\n--- 状态机协程 ---');
  const sm = stateMachine();
  console.log('next():', sm.next().value); // state-0
  console.log('next(NEXT):', sm.next('NEXT').value); // state-1
  console.log('next(NEXT):', sm.next('NEXT').value); // state-2
  console.log('next(RESET):', sm.next('RESET').value); // state-0
  console.log('next(NEXT):', sm.next('NEXT').value); // state-1

  demoReturn();
  demoThrow();
  demoUncaughtThrow();
  demoExhaustedReuse();
  demoBreakBehavior();
  demoDelegatedThrow();

  console.log('\n=== End of Demo ===\n');
}
