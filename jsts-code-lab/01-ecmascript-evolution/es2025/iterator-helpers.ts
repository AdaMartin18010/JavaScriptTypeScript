/**
 * @file Iterator Helpers (ES2025)
 * @category ECMAScript Evolution → ES2025
 * @difficulty medium
 * @tags iterator, lazy-evaluation, functional-programming, es2025
 * @description
 * 演示 ES2025 Iterator.prototype 上的辅助方法：map, filter, take, drop,
 * flatMap, reduce, toArray, forEach, some, every, find 以及 Iterator.from。
 * 这些方法支持惰性求值（lazy evaluation），在处理大规模或无限序列时节省内存。
 */

// ES2025 类型补丁：Iterator helpers 尚未进入所有 TypeScript lib 定义
declare global {
  interface IteratorObject<T, TReturn = unknown, TNext = unknown> {
    map<U>(callbackfn: (value: T, index: number) => U): IteratorObject<U, TReturn, TNext>;
    filter(predicate: (value: T, index: number) => boolean): IteratorObject<T, TReturn, TNext>;
    take(limit: number): IteratorObject<T, TReturn, TNext>;
    drop(count: number): IteratorObject<T, TReturn, TNext>;
    flatMap<U>(callbackfn: (value: T, index: number) => Iterator<U> | Iterable<U>): IteratorObject<U, TReturn, TNext>;
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
    toArray(): T[];
    forEach(callbackfn: (value: T, index: number) => void): void;
    some(predicate: (value: T, index: number) => boolean): boolean;
    every(predicate: (value: T, index: number) => boolean): boolean;
    find(predicate: (value: T, index: number) => boolean): T | undefined;
  }
  interface IteratorConstructor {
    from<T>(iterable: Iterator<T> | Iterable<T>): IteratorObject<T>;
  }
  var Iterator: IteratorConstructor;
}

/** 基础链式操作：过滤、映射、截取 */
export function basicChainDemo(): number[] {
  const source = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const iterator = Iterator.from(source);

  const result = iterator
    .filter((x) => x % 2 === 0)
    .map((x) => x * 10)
    .take(3)
    .toArray();

  return result; // [20, 40, 60]
}

/** 无限迭代器处理：斐波那契数列惰性截取 */
export function infiniteIteratorDemo(): number[] {
  function* fibonacci(): Generator<number> {
    let [a, b] = [0, 1];
    while (true) {
      yield a;
      [a, b] = [b, a + b];
    }
  }

  const fib = Iterator.from(fibonacci());
  const first10 = fib.take(10).toArray();
  return first10; // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
}

/** flatMap 展开嵌套结构 */
export function flatMapDemo(): string[] {
  const sentences = Iterator.from(['hello world', 'es2025 iterator helpers']);
  const words = sentences.flatMap((s) => s.split(' ')).toArray();
  return words; // ['hello', 'world', 'es2025', 'iterator', 'helpers']
}

/** reduce 归约操作 */
export function reduceDemo(): number {
  const nums = Iterator.from([1, 2, 3, 4, 5]);
  const sum = nums.reduce((acc, x) => acc + x, 0);
  return sum; // 15
}

/** some / every / find 短路求值 */
export function predicateDemo(): { some: boolean; every: boolean; find: number | undefined } {
  const nums = Iterator.from([2, 4, 6, 7, 8]);
  return {
    some: nums.some((x) => x % 2 !== 0), // true (遇到 7 即短路)
    every: Iterator.from([2, 4, 6]).every((x) => x % 2 === 0), // true
    find: Iterator.from([2, 4, 6, 7, 8]).find((x) => x > 5), // 6
  };
}

/** drop 跳过前 N 个元素 */
export function dropDemo(): number[] {
  const nums = Iterator.from([1, 2, 3, 4, 5, 6]);
  return nums.drop(3).toArray(); // [4, 5, 6]
}

/** forEach 副作用遍历 */
export function forEachDemo(): number[] {
  const collected: number[] = [];
  Iterator.from([1, 2, 3]).forEach((x) => collected.push(x * 2));
  return collected; // [2, 4, 6]
}

/** 演示惰性求值：中间操作不会立即执行 */
export function lazyEvaluationDemo(): string[] {
  const sideEffects: string[] = [];

  const pipeline = Iterator.from([1, 2, 3, 4, 5])
    .map((x) => {
      sideEffects.push(`map-${x}`);
      return x * 2;
    })
    .filter((x) => {
      sideEffects.push(`filter-${x}`);
      return x > 4;
    });

  // 此时 sideEffects 应为空（惰性求值）
  const beforeConsume = sideEffects.length;

  const result = pipeline.take(2).toArray();

  return [
    `before-consume=${beforeConsume}`,
    `result=${result.join(',')}`,
    `after-effects=${sideEffects.join(',')}`,
  ];
}
