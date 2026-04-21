# 经典事件循环题目体系

> 20+ 道渐进式事件循环题目，从基础到地狱模式
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## Level 1: 基础（同步 vs 异步）

### 题目 1

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
```

<details>
<summary>答案</summary>

```
1, 4, 3, 2
```

</details>

### 题目 2

```javascript
setTimeout(() => console.log("A"), 0);
Promise.resolve().then(() => console.log("B"));
setTimeout(() => console.log("C"), 0);
Promise.resolve().then(() => console.log("D"));
```

<details>
<summary>答案</summary>

```
B, D, A, C
```

（微任务在宏任务之前，同类型按注册顺序）

</details>

---

## Level 2: 进阶（微任务嵌套）

### 题目 3

```javascript
Promise.resolve().then(() => {
  console.log("1");
  Promise.resolve().then(() => console.log("2"));
  console.log("3");
});
Promise.resolve().then(() => {
  console.log("4");
});
```

<details>
<summary>答案</summary>

```
1, 3, 4, 2
```

</details>

### 题目 4

```javascript
queueMicrotask(() => console.log("micro"));
Promise.resolve().then(() => console.log("promise"));
```

<details>
<summary>答案</summary>

```
micro, promise
```

（queueMicrotask 和 Promise.then 都是微任务，按注册顺序执行）

</details>

---

## Level 3: 高级（async/await）

### 题目 5

```javascript
async function async1() {
  console.log("async1 start");
  await async2();
  console.log("async1 end");
}

async function async2() {
  console.log("async2");
}

console.log("script start");
async1();
console.log("script end");
```

<details>
<summary>答案</summary>

```
script start
async1 start
async2
script end
async1 end
```

</details>

### 题目 6

```javascript
async function foo() {
  console.log("foo");
  await Promise.resolve();
  console.log("foo after await");
}

foo();
console.log("bar");
Promise.resolve().then(() => console.log("baz"));
```

<details>
<summary>答案</summary>

```
foo
bar
baz
foo after await
```

</details>

---

## Level 4: 专家（浏览器 vs Node.js）

### 题目 7

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
```

<details>
<summary>答案（Node.js）</summary>

```
nextTick
promise
timeout
immediate
```

</details>

---

## Level 5: 地狱模式

### 题目 8

```javascript
console.log("1");

setTimeout(() => {
  console.log("2");
  Promise.resolve().then(() => console.log("3"));
}, 0);

Promise.resolve().then(() => {
  console.log("4");
  setTimeout(() => console.log("5"), 0);
});

console.log("6");
```

<details>
<summary>答案</summary>

```
1, 6, 4, 2, 3, 5
```

</details>

---

## 解析框架

每道题目的逐步推演方法：

1. **标记同步代码**：首先执行所有同步代码
2. **注册宏任务**：setTimeout/setInterval 放入任务队列
3. **注册微任务**：Promise.then/queueMicrotask 放入微任务队列
4. **执行微任务**：同步代码结束后，清空微任务队列
5. **执行宏任务**：取出一个宏任务执行，重复步骤 4-5

---

**参考规范**：ECMA-262 §9.7 Jobs and Job Queues | HTML Living Standard §8.1.4 Event loops
