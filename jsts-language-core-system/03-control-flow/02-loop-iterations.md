# 循环与迭代

> 从传统循环到 ES2025 Iterator Helpers：遍历机制的完整演进
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 传统循环

### 1.1 for 循环

```javascript
for (let i = 0; i < 5; i++) {
  console.log(i);
}
```

### 1.2 while / do...while

```javascript
let i = 0;
while (i < 5) {
  console.log(i);
  i++;
}

// do...while 至少执行一次
let j = 0;
do {
  console.log(j);
  j++;
} while (j < 5);
```

### 1.3 循环控制

```javascript
for (let i = 0; i < 10; i++) {
  if (i === 3) continue; // 跳过当前迭代
  if (i === 7) break;    // 终止循环
  console.log(i);        // 0, 1, 2, 4, 5, 6
}
```

### 1.4 标签语句

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) break outer; // 跳出外层循环
  }
}
```

---

## 2. for...in

遍历对象的**可枚举属性键**（包括继承的属性）：

```javascript
const obj = { a: 1, b: 2 };

for (const key in obj) {
  console.log(key); // "a", "b"
}

// 包含继承属性
const child = Object.create({ parent: true });
child.own = true;
for (const key in child) {
  console.log(key); // "own", "parent"
}
```

**注意**：
- 顺序不保证（历史上是插入顺序，但规范不保证）
- 包含原型链属性
- 键为字符串（即使是数组索引）

---

## 3. for...of

遍历**可迭代对象**的值：

```javascript
const arr = [10, 20, 30];
for (const value of arr) {
  console.log(value); // 10, 20, 30
}

// 字符串
for (const char of "hello") {
  console.log(char); // "h", "e", "l", "l", "o"
}

// Map
const map = new Map([["a", 1], ["b", 2]]);
for (const [key, value] of map) {
  console.log(key, value);
}
```

---

## 4. ES2025：Iterator Helpers

ES2025 引入全局 `Iterator` 对象和原型方法，支持**惰性求值**的链式操作：

```javascript
// map
Iterator.from([1, 2, 3])
  .map(x => x * 2)
  .toArray(); // [2, 4, 6]

// filter + take
Iterator.from([1, 2, 3, 4, 5])
  .filter(x => x % 2 === 0)
  .take(1)
  .toArray(); // [2]

// drop
Iterator.from([1, 2, 3, 4, 5])
  .drop(2)
  .toArray(); // [3, 4, 5]

// reduce
Iterator.from([1, 2, 3])
  .reduce((a, b) => a + b, 0); // 6
```

### 4.1 惰性求值的优势

```javascript
// 传统数组方法：创建中间数组
const result = [1, 2, 3, 4, 5]
  .map(x => x * 2)     // 创建 [2, 4, 6, 8, 10]
  .filter(x => x > 5); // 创建 [6, 8, 10]

// Iterator Helpers：惰性求值，无中间数组
const result = Iterator.from([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .filter(x => x > 5)
  .toArray(); // [6, 8, 10]

// 处理大数据流时优势更明显
function* generateLargeData() {
  for (let i = 0; i < 1000000; i++) {
    yield fetchLogLine(i);
  }
}

const errors = Iterator.from(generateLargeData())
  .filter(line => line.includes("ERROR"))
  .map(line => parseError(line))
  .take(100) // 只取前 100 条
  .toArray();
```

### 4.2 与生成器结合

```javascript
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 获取前 10 个斐波那契数
const fibs = Iterator.from(fibonacci())
  .take(10)
  .toArray(); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

---

## 5. 迭代器协议详解

### 5.1 Iterable Protocol

对象必须实现 `[Symbol.iterator]` 方法才能成为可迭代对象：

```javascript
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        if (current <= last) {
          return { done: false, value: current++ };
        }
        return { done: true };
      }
    };
  }
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

### 5.2 Iterator Protocol

迭代器对象必须实现 `next()` 方法，返回 `{ done, value }`：

```javascript
const iterator = [1, 2, 3][Symbol.iterator]();

console.log(iterator.next()); // { done: false, value: 1 }
console.log(iterator.next()); // { done: false, value: 2 }
console.log(iterator.next()); // { done: false, value: 3 }
console.log(iterator.next()); // { done: true, value: undefined }
```

---

## 6. 数组方法式迭代

```javascript
const nums = [1, 2, 3, 4, 5];

// forEach
nums.forEach((n, i) => console.log(i, n));

// map
const doubled = nums.map(n => n * 2);

// filter
const evens = nums.filter(n => n % 2 === 0);

// reduce
const sum = nums.reduce((acc, n) => acc + n, 0);

// find / findIndex
const found = nums.find(n => n > 3); // 4

// findLast / findLastIndex（ES2023）
const lastEven = nums.findLast(n => n % 2 === 0); // 4
```

### 6.1 与循环的性能对比

在现代引擎中，数组方法通常与 for 循环性能相当（甚至更快，因为引擎可以优化内置方法）。

### 6.2 提前终止

`forEach` 不能提前终止，需使用 `some`/`every` 或传统循环：

```javascript
// 使用 some 实现提前终止
[1, 2, 3, 4, 5].some(n => {
  console.log(n);
  return n === 3; // 返回 true 时终止
});
```

---

## 7. 异步迭代

### 7.1 for await...of

```javascript
async function* asyncGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

async function main() {
  for await (const num of asyncGenerator()) {
    console.log(num); // 1, 2, 3
  }
}
```

### 7.2 AsyncIterable / AsyncIterator 协议

```javascript
const asyncRange = {
  from: 1,
  to: 5,
  async *[Symbol.asyncIterator]() {
    for (let i = this.from; i <= this.to; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      yield i;
    }
  }
};
```

---

**参考规范**：ECMA-262 §14.7 Iteration Statements | ECMA-262 §27.1.2 The Iterator Interface
