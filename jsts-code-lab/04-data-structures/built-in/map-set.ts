/**
 * @file Map 与 Set 深度解析
 * @category Data Structures → Built-in
 * @difficulty easy
 * @tags map, set, es6, collection
 */

// ============================================================================
// 1. Map 基础
// ============================================================================

const userMap = new Map<string, { name: string; age: number }>();

// 添加
userMap.set('user1', { name: 'Alice', age: 30 });
userMap.set('user2', { name: 'Bob', age: 25 });

// 读取
console.log(userMap.get('user1')); // { name: 'Alice', age: 30 }
console.log(userMap.has('user1')); // true
console.log(userMap.size); // 2

// 删除
userMap.delete('user1');
userMap.clear();

// ============================================================================
// 2. Map 的迭代
// ============================================================================

const map = new Map([
  ['a', 1],
  ['b', 2],
  ['c', 3]
]);

// for...of
for (const [key, value] of map) {
  console.log(`${key}: ${value}`);
}

// forEach
map.forEach((value, key) => {
  console.log(`${key}: ${value}`);
});

// 只遍历 keys/values
console.log([...map.keys()]); // ['a', 'b', 'c']
console.log([...map.values()]); // [1, 2, 3]
console.log([...map.entries()]); // [['a', 1], ['b', 2], ['c', 3]]

// ============================================================================
// 3. Map vs Object
// ============================================================================

// Map 可以使用任意类型作为键
const objKey = { id: 1 };
const mapWithObjectKey = new Map<object, string>();
mapWithObjectKey.set(objKey, 'value');
console.log(mapWithObjectKey.get(objKey)); // 'value'

// Object 只能使用字符串/ Symbol 作为键
// Map 保留插入顺序
// Map 有 size 属性
// Map 在频繁增删时性能更好

// ============================================================================
// 4. Set 基础
// ============================================================================

const uniqueNumbers = new Set<number>([1, 2, 2, 3, 3, 3]);
console.log([...uniqueNumbers]); // [1, 2, 3]
console.log(uniqueNumbers.size); // 3

// 添加/删除
uniqueNumbers.add(4);
uniqueNumbers.delete(2);
console.log(uniqueNumbers.has(4)); // true

// ============================================================================
// 5. Set 操作
// ============================================================================

function union<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA, ...setB]);
}

function intersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter(x => setB.has(x)));
}

function difference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter(x => !setB.has(x)));
}

function symmetricDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...difference(setA, setB), ...difference(setB, setA)]);
}

// 使用
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);

console.log('Union:', [...union(a, b)]); // [1, 2, 3, 4]
console.log('Intersection:', [...intersection(a, b)]); // [2, 3]
console.log('Difference:', [...difference(a, b)]); // [1]

// ============================================================================
// 6. WeakMap / WeakSet
// ============================================================================

// WeakMap: 键必须是对象，弱引用，不可迭代
const weakMap = new WeakMap<object, string>();
let obj = { id: 1 };
weakMap.set(obj, 'data');
console.log(weakMap.get(obj)); // 'data'

// 当 obj 不再被引用时，WeakMap 中的条目会被垃圾回收
obj = null as any;
// weakMap 中的条目现在可以被垃圾回收

// WeakSet: 类似 Set，但只能存储对象，弱引用
const weakSet = new WeakSet<object>();
const obj1 = { id: 1 };
weakSet.add(obj1);
console.log(weakSet.has(obj1)); // true

// ============================================================================
// 7. 实际应用
// ============================================================================

// 缓存实现
class Cache<K, V> {
  private map = new Map<K, { value: V; expiry: number }>();

  set(key: K, value: V, ttlMs: number): void {
    this.map.set(key, { value, expiry: Date.now() + ttlMs });
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;

    if (Date.now() > entry.expiry) {
      this.map.delete(key);
      return undefined;
    }

    return entry.value;
  }

  clear(): void {
    this.map.clear();
  }
}

// 去重
function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)];
}

// 频率统计
function frequency<T>(arr: T[]): Map<T, number> {
  const freq = new Map<T, number>();
  for (const item of arr) {
    freq.set(item, (freq.get(item) || 0) + 1);
  }
  return freq;
}

// ============================================================================
// 导出
// ============================================================================

export {
  union,
  intersection,
  difference,
  symmetricDifference,
  Cache,
  unique,
  frequency
};
