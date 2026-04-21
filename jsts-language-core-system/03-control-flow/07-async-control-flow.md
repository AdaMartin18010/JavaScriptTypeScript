# 异步控制流

> Promise、async/await 与并发控制的完整执行模型
>
> 对齐版本：ECMAScript 2025 (ES16) | TypeScript 5.8–6.0

---

## 1. Promise 控制流详解

### 1.1 Promise 的创建与解决

```javascript
const promise = new Promise((resolve, reject) => {
  // executor 是同步执行的
  console.log("Executor runs immediately");

  setTimeout(() => {
    resolve("Success"); // 异步解决
  }, 1000);
});
```

**关键点**：Promise executor 是**同步执行**的，这在理解 Promise 行为时非常重要。

### 1.2 .then / .catch / .finally 链式调用

```javascript
fetch("/api/user")
  .then(response => {
    if (!response.ok) throw new Error("HTTP error");
    return response.json();
  })
  .then(user => {
    console.log(user.name);
    return user.id;
  })
  .catch(error => {
    console.error("Failed:", error.message);
    throw error; // 重新抛出，继续传播
  })
  .finally(() => {
    console.log("Cleanup");
  });
```

**链式规则**：

- `.then(onFulfilled, onRejected)` 中的两个回调互斥
- 如果 `onFulfilled` 抛出异常，进入下一个 `.catch`
- `.finally` 不接收参数，也不改变 Promise 的值

### 1.3 Promise 的不可变性

Promise 一旦 settled（fulfilled 或 rejected），状态不可再变：

```javascript
const p = new Promise((resolve) => {
  resolve("first");
  resolve("second"); // 被忽略
  reject("error");   // 被忽略
});

p.then(value => console.log(value)); // "first"
```

---

## 2. async / await 执行语义

### 2.1 async 函数的本质

```javascript
async function greet() {
  return "Hello";
}

// 等价于：
function greet() {
  return Promise.resolve("Hello");
}

// 如果抛出异常：
async function errorFn() {
  throw new Error("Oops");
}
// 等价于返回 Promise.reject(new Error("Oops"))
```

### 2.2 await 的表达式暂停语义

```javascript
async function fetchUser() {
  console.log("Before await");
  const response = await fetch("/api/user"); // 暂停，交出控制权
  console.log("After await"); // 作为微任务恢复
  return response.json();
}
```

**await 的行为**：

1. 如果 await 的是 resolved Promise，将后续代码包装为微任务
2. 如果 await 的是 rejected Promise，抛出异常（可被 try/catch 捕获）
3. 如果 await 的是非 Promise 值，将其包装为 resolved Promise

### 2.3 await 的底层转换

```javascript
async function example() {
  const a = await promiseA;
  const b = await promiseB;
  return a + b;
}

// 大致等价于：
function example() {
  return promiseA.then(a => {
    return promiseB.then(b => {
      return a + b;
    });
  });
}
```

---

## 3. 并发控制

### 3.1 Promise.all — 全部成功

```javascript
// 等待所有 Promise 全部成功
const [users, posts, comments] = await Promise.all([
  fetch("/api/users").then(r => r.json()),
  fetch("/api/posts").then(r => r.json()),
  fetch("/api/comments").then(r => r.json())
]);

// 如果任一 Promise 拒绝，整个 Promise.all 立即拒绝
```

**使用场景**：多个独立的异步操作需要并行执行，且全部成功才算成功。

### 3.2 Promise.race — 竞争

```javascript
// 返回最先解决的 Promise
const result = await Promise.race([
  fetch("/api/fast-server"),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000)
  )
]);

// 使用场景：超时控制
```

### 3.3 Promise.allSettled（ES2020）— 全部完成

```javascript
// 等待所有 Promise 完成（无论成功或失败）
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b"),
  fetch("/api/c")
]);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Failure:", result.reason);
  }
});
```

**使用场景**：需要知道所有操作的结果，即使某些失败也不影响整体。

### 3.4 Promise.any（ES2021）— 任一成功

```javascript
// 返回任一成功的 Promise
const result = await Promise.any([
  fetch("/api/mirror-1"),
  fetch("/api/mirror-2"),
  fetch("/api/mirror-3")
]);

// 如果全部失败，抛出 AggregateError
try {
  await Promise.any([
    Promise.reject("A"),
    Promise.reject("B")
  ]);
} catch (e) {
  console.log(e.errors); // ["A", "B"]
}
```

### 3.5 Promise.try（ES2025）— 统一包装

```javascript
// 将同步或异步函数统一包装为 Promise
const result = await Promise.try(() => {
  if (Math.random() > 0.5) return "sync";
  throw new Error("sync error");
});

// 等价于：
// Promise.resolve().then(() => { ... })
// 但 Promise.try 更语义化
```

---

## 4. 串行 vs 并行

### 4.1 常见错误：串行误用

```javascript
// ❌ 串行执行（总时间 = 1s + 1s + 1s = 3s）
async function slow() {
  const user = await fetchUser();      // 1s
  const posts = await fetchPosts();    // 1s
  const comments = await fetchComments(); // 1s
  return { user, posts, comments };
}
```

### 4.2 并行执行

```javascript
// ✅ 并行执行（总时间 ≈ 1s）
async function fast() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  return { user, posts, comments };
}
```

### 4.3 混合模式

```javascript
// 先串行获取用户，再并行获取相关数据
async function mixed() {
  const user = await fetchUser(id); // 必须先获取用户

  const [posts, followers, settings] = await Promise.all([
    fetchPosts(user.id),
    fetchFollowers(user.id),
    fetchSettings(user.id)
  ]);

  return { user, posts, followers, settings };
}
```

---

## 5. 取消与超时

### 5.1 AbortController

```javascript
const controller = new AbortController();
const signal = controller.signal;

// 发起请求
fetch("/api/data", { signal })
  .then(response => response.json())
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("Request was cancelled");
    }
  });

// 取消请求
controller.abort();

// 超时自动取消
setTimeout(() => controller.abort(), 5000);
```

### 5.2 超时封装函数

```javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

// 使用
const data = await withTimeout(fetch("/api/data"), 5000);
```

---

## 6. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 串行误用为并行 | `for` 循环中的 `await` 是串行的 | 使用 `Promise.all` |
| async/await 中的循环陷阱 | `forEach` 中的 `async` 回调不会等待 | 使用 `for...of` 或 `Promise.all` |
| 未处理的 Promise 拒绝 | Promise 拒绝但没有 `catch` | 使用 `try/catch` 或 `.catch()` |
| async 函数中的同步错误 | `throw` 会转换为 rejected Promise | 正常使用 `try/catch` |
| Promise 构造函数中的异步错误 | `new Promise` 中 `throw` 不会自动 reject | 使用 `reject` 参数 |

### 6.1 forEach 的 async 陷阱

```javascript
// ❌ 错误：forEach 不会等待异步操作
urls.forEach(async (url) => {
  const data = await fetch(url);
  console.log(data);
});
console.log("Done"); // 这会在所有 fetch 完成前执行

// ✅ 正确：使用 for...of
for (const url of urls) {
  const data = await fetch(url);
  console.log(data);
}
console.log("Done"); // 在所有 fetch 完成后执行

// ✅ 正确：使用 Promise.all（并行）
await Promise.all(urls.map(async (url) => {
  const data = await fetch(url);
  console.log(data);
}));
console.log("Done");
```

### 6.2 未处理的 Promise 拒绝

```javascript
// ❌ 未处理
async function risky() {
  await fetch("/api/data"); // 如果失败，Promise 被拒绝但未处理
}
risky();

// ✅ 处理
async function safe() {
  try {
    await fetch("/api/data");
  } catch (error) {
    console.error(error);
  }
}
safe();
```

---

**参考规范**：ECMA-262 §27.2 Promise Objects | ECMA-262 §15.8 Async Function Definitions
