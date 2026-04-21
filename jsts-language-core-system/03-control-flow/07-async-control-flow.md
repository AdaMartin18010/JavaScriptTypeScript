# 异步控制流

> Promise、async/await 与并发控制的完整执行模型
>
> 对齐版本：ECMAScript 2025 (ES16) | TypeScript 5.8–6.0

---

## 1. Promise 控制流

### 1.1 Promise 的创建与解决

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success");
  }, 1000);
});
```

### 1.2 .then / .catch / .finally 链

```javascript
fetch("/api/user")
  .then(response => response.json())
  .then(user => console.log(user))
  .catch(error => console.error(error))
  .finally(() => console.log("Done"));
```

### 1.3 Promise 的不可变性

Promise 一旦 settled（fulfilled 或 rejected），状态不可再变：

```javascript
const promise = new Promise((resolve) => {
  resolve("first");
  resolve("second"); // 被忽略
});

promise.then(value => console.log(value)); // "first"
```

---

## 2. async / await

### 2.1 async 函数总是返回 Promise

```javascript
async function greet() {
  return "Hello";
}

// 等价于：
function greet() {
  return Promise.resolve("Hello");
}
```

### 2.2 await 的表达式暂停语义

```javascript
async function fetchData() {
  console.log("Start");
  const data = await fetch("/api/data"); // 暂停，等待 Promise 解决
  console.log("Received");
  return data;
}
```

### 2.3 错误传播机制

```javascript
async function risky() {
  const data = await fetch("/api/data");
  // 如果 fetch 拒绝，错误会在这里抛出
}

// 等价于：
function risky() {
  return fetch("/api/data").then(data => {
    // ...
  });
}
```

---

## 3. 并发控制

### 3.1 Promise.all

等待所有 Promise **全部成功**：

```javascript
const [users, posts] = await Promise.all([
  fetch("/api/users"),
  fetch("/api/posts")
]);
// 如果任一 Promise 拒绝，整个 Promise.all 立即拒绝
```

### 3.2 Promise.race

返回**最先解决**的 Promise：

```javascript
const result = await Promise.race([
  fetch("/api/fast"),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000)
  )
]);
```

### 3.3 Promise.allSettled（ES2020）

等待所有 Promise **全部完成**（无论成功或失败）：

```javascript
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b")
]);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Failure:", result.reason);
  }
});
```

### 3.4 Promise.any（ES2021）

返回**任一成功**的 Promise：

```javascript
try {
  const result = await Promise.any([
    fetch("/api/mirror-1"),
    fetch("/api/mirror-2"),
    fetch("/api/mirror-3")
  ]);
} catch (aggregateError) {
  console.log("All failed:", aggregateError.errors);
}
```

### 3.5 Promise.try（ES2025）

将同步或异步函数统一包装为 Promise：

```javascript
// ES2025
const result = await Promise.try(() => {
  if (Math.random() > 0.5) return "sync";
  throw new Error("sync error");
});
```

---

## 4. 串行 vs 并行

### 4.1 串行执行

```javascript
// ❌ 串行（慢）
const user = await fetchUser();
const posts = await fetchPosts(user.id);
const comments = await fetchComments(posts[0].id);
```

### 4.2 并行执行

```javascript
// ✅ 并行（快）
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
```

### 4.3 混合模式

```javascript
// 先串行获取用户，再并行获取相关数据
const user = await fetchUser(id);
const [posts, followers] = await Promise.all([
  fetchPosts(user.id),
  fetchFollowers(user.id)
]);
```

---

## 5. 取消与超时

### 5.1 AbortController

```javascript
const controller = new AbortController();
const signal = controller.signal;

fetch("/api/data", { signal })
  .then(response => response.json())
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("Request was cancelled");
    }
  });

// 取消请求
controller.abort();
```

### 5.2 超时封装

```javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

const data = await withTimeout(fetch("/api/data"), 5000);
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 串行误用为并行 | for 循环中的 await 是串行的 | 使用 Promise.all 并行化 |
| async/await 中的循环陷阱 | forEach 中的 async 回调不会等待 | 使用 for...of 或 Promise.all |
| 未处理的 Promise 拒绝 | Promise 拒绝但没有 catch | 使用 try/catch 或 .catch() |
| async 函数中的同步错误 | throw 会转换为 rejected Promise | 正常使用 try/catch 处理 |
| Promise 构造函数中的异步错误 | new Promise 中 throw 不会自动 reject | 使用 reject 参数 |

---

**参考规范**：ECMA-262 §27.2 Promise Objects | ECMA-262 §15.8 Async Function Objects
