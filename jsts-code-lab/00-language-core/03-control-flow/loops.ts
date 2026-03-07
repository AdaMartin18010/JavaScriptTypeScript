/**
 * @file 循环语句深度解析
 * @category Language Core → Control Flow
 * @difficulty warm
 * @tags loops, iteration, performance
 */

// ============================================================================
// 1. for 循环家族
// ============================================================================

/** 经典 for 循环 */
function classicFor(arr: number[]): number {
  let sum = 0;
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i];
  }
  return sum;
}

/** for-of (ES2015) - 遍历可迭代对象 */
function forOfLoop(arr: string[]): string {
  let result = '';
  for (const item of arr) {
    result += item;
  }
  return result;
}

/** for-in - 遍历对象键 (包括继承的) */
function forInLoop(obj: Record<string, unknown>): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    keys.push(key);
  }
  return keys;
}

/** 安全的 for-in (只遍历自有属性) */
function forInSafe(obj: Record<string, unknown>): string[] {
  const keys: string[] = [];
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      keys.push(key);
    }
  }
  return keys;
}

/** for-await-of (ES2018) - 异步迭代 */
async function* asyncGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

async function forAwaitOf() {
  const results: number[] = [];
  for await (const num of asyncGenerator()) {
    results.push(num);
  }
  return results;
}

// ============================================================================
// 2. while / do-while
// ============================================================================

/** while */
function whileLoop<T>(predicate: () => boolean, action: () => T): T[] {
  const results: T[] = [];
  while (predicate()) {
    results.push(action());
  }
  return results;
}

/** do-while */
function doWhileExample(): number {
  let count = 0;
  let num = 0;
  do {
    num = Math.random();
    count++;
  } while (num < 0.5 && count < 100);
  return count;
}

// ============================================================================
// 3. 循环控制语句
// ============================================================================

function findFirstPositive(arr: number[]): number | undefined {
  for (const num of arr) {
    if (num > 0) return num; // break 退出循环
  }
  return undefined;
}

function sumPositive(arr: number[]): number {
  let sum = 0;
  for (const num of arr) {
    if (num <= 0) continue; // 跳过当前迭代
    sum += num;
  }
  return sum;
}

function findInMatrix(matrix: number[][], target: number): [number, number] | null {
  outer: for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      if (matrix[i][j] === target) {
        return [i, j];
      }
      if (matrix[i][j] > target) {
        continue outer; // 跳转到外层循环
      }
    }
  }
  return null;
}

// ============================================================================
// 4. 高阶函数替代循环
// ============================================================================

const numbers = [1, 2, 3, 4, 5];

/** map - 转换 */
const doubled = numbers.map(n => n * 2);

/** filter - 过滤 */
const evens = numbers.filter(n => n % 2 === 0);

/** reduce - 聚合 */
const sum = numbers.reduce((acc, n) => acc + n, 0);

/** find - 查找第一个 */
const firstEven = numbers.find(n => n % 2 === 0);

/** some / every */
const hasEven = numbers.some(n => n % 2 === 0);
const allPositive = numbers.every(n => n > 0);

/** forEach (注意：不能 break/continue/return 退出外层) */
numbers.forEach(n => console.log(n));

/** 复杂 reduce 示例：分组 */
const people = [
  { name: 'Alice', age: 25, city: 'Beijing' },
  { name: 'Bob', age: 30, city: 'Shanghai' },
  { name: 'Charlie', age: 25, city: 'Beijing' }
];

const groupedByAge = people.reduce((acc, person) => {
  const key = person.age;
  acc[key] ??= [];
  acc[key].push(person);
  return acc;
}, {} as Record<number, typeof people>);

// ============================================================================
// 5. 性能对比
// ============================================================================

/** 缓存长度优化 (现代JS引擎优化后差异不大) */
function fastFor(arr: number[]): number {
  let sum = 0;
  for (let i = 0, len = arr.length; i < len; i++) {
    sum += arr[i];
  }
  return sum;
}

/** 反向循环 */
function reverseFor(arr: number[]): number {
  let sum = 0;
  for (let i = arr.length - 1; i >= 0; i--) {
    sum += arr[i];
  }
  return sum;
}

/** 推荐：for-of (可读性与性能平衡) */
function recommendedFor(arr: number[]): number {
  let sum = 0;
  for (const n of arr) {
    sum += n;
  }
  return sum;
}

// ============================================================================
// 6. 惰性迭代 (生成器)
// ============================================================================

function* range(start: number, end: number, step = 1) {
  for (let i = start; i < end; i += step) {
    yield i;
  }
}

function* fibonacci(n: number) {
  let [a, b] = [0, 1];
  for (let i = 0; i < n; i++) {
    yield a;
    [a, b] = [b, a + b];
  }
}

/** 惰性求值管道 */
function* map<T, R>(iter: Iterable<T>, fn: (x: T) => R) {
  for (const x of iter) yield fn(x);
}

function* filter<T>(iter: Iterable<T>, predicate: (x: T) => boolean) {
  for (const x of iter) {
    if (predicate(x)) yield x;
  }
}

function* take<T>(iter: Iterable<T>, n: number) {
  let count = 0;
  for (const x of iter) {
    if (count++ >= n) break;
    yield x;
  }
}

// 使用
const result = [...take(filter(map(range(0, 100), x => x * x), x => x % 2 === 0), 5)];
// [0, 4, 16, 36, 64]

// ============================================================================
// 导出
// ============================================================================

export {
  classicFor,
  forOfLoop,
  forInSafe,
  forAwaitOf,
  whileLoop,
  doWhileExample,
  findFirstPositive,
  sumPositive,
  findInMatrix,
  fastFor,
  reverseFor,
  recommendedFor,
  range,
  fibonacci,
  map,
  filter,
  take,
  numbers,
  doubled,
  evens,
  sum,
  firstEven,
  hasEven,
  allPositive,
  groupedByAge,
  people
};
