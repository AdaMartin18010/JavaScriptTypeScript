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
- `.finally` 不接收参数，不改变 Promise 链的值或错误

### 1.3 Promise.resolve 的隐式包装

```javascript
// 以下等价
Promise.resolve(42);
new Promise(resolve => resolve(42));

// 如果传入的是 Thenable，会递归解包
Promise.resolve(thenable); // 等待 thenable 的 then 调用
```

---

## 2. async/await 的本质

### 2.1 语法糖还是新语义？

`async/await` 是 **Generator + Promise 的语法糖**，但引入了新的执行语义。

```javascript
async function fetchData() {
  const response = await fetch("/api/data");
  const data = await response.json();
  return data;
}

// 大致等价于（简化）：
function fetchData() {
  return new Promise((resolve, reject) => {
    fetch("/api/data")
      .then(response => response.json())
      .then(data => resolve(data))
      .catch(reject);
  });
}
```

### 2.2 await 的执行语义

`await x` 的精确语义：

1. 计算表达式 `x` 的值
2. 如果值不是 Thenable，包装为 resolved Promise
3. 如果是 Thenable，调用其 `.then()` 方法
4. **暂停当前 async 函数的执行**
5. 将后续代码作为微任务注册
6. 当 Promise 解决后，恢复执行

```javascript
async function example() {
  console.log("A");
  await 1;              // 1 不是 Thenable，包装为 Promise.resolve(1)
  console.log("B");     // 作为微任务执行
}

example();
console.log("C");

// 输出：A → C → B
```

### 2.3 async 函数的返回值

```javascript
async function returnValue() {
  return 42; // 自动包装为 Promise.resolve(42)
}

async function throwError() {
  throw new Error("Oops"); // 自动包装为 Promise.reject(error)
}

async function returnPromise() {
  return Promise.resolve(42); // 返回原 Promise（不会双重包装）
}
```

---

## 3. 并发控制

### 3.1 并行 vs 串行

```javascript
// ❌ 串行（慢）
async function sequential() {
  const user = await fetchUser();      // 100ms
  const posts = await fetchPosts();    // 100ms
  const comments = await fetchComments(); // 100ms
  return { user, posts, comments };    // 总耗时 300ms
}

// ✅ 并行（快）
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]); // 总耗时 ~100ms
  return { user, posts, comments };
}
```

### 3.2 Promise.all 的失败模式

```javascript
// Promise.all 短路与（short-circuit）
const promises = [
  fetchUser(),
  fetchPosts(),
  Promise.reject(new Error("fail"))
];

const results = await Promise.all(promises);
// 一旦有一个 reject，立即 reject，其他 Promise 继续执行但结果被忽略
```

### 3.3 Promise.allSettled

```javascript
// 等待所有 Promise settle，无论成功或失败
const results = await Promise.allSettled(promises);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Failed:", result.reason);
  }
});
```

### 3.4 Promise.race 与超时

```javascript
// 带超时的 fetch
async function fetchWithTimeout(url, timeout) {
  return Promise.race([
    fetch(url),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    )
  ]);
}
```

---

## 4. ES2025: Promise.try

ES2025 新增 `Promise.try`，统一处理同步/异步错误：

```javascript
// ❌ 以前：需要手动包装
function safeCall(fn) {
  return new Promise((resolve, reject) => {
    try {
      resolve(fn());
    } catch (e) {
      reject(e);
    }
  });
}

// ✅ ES2025：Promise.try
Promise.try(() => {
  if (Math.random() > 0.5) throw new Error("Oops");
  return fetchData();
})
.then(result => console.log(result))
.catch(error => console.error(error));
```

**优势**：同步错误自动转为 Promise reject，避免 `Promise.resolve().then()` 的微任务延迟问题。

---

## 5. 错误处理模式

### 5.1 try/catch 与 .catch 的对比

```javascript
// async/await + try/catch
async function fetchUser() {
  try {
    const response = await fetch("/api/user");
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}

// Promise 链 + .catch
function fetchUser() {
  return fetch("/api/user")
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .catch(error => {
      console.error("Fetch failed:", error);
      return null;
    });
}
```

### 5.2 Result 类型模式

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

async function safeFetch<T>(url: string): Promise<Result<T>> {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return { ok: true, value: data };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}

// 使用
const result = await safeFetch<User>("/api/user");
if (result.ok) {
  console.log(result.value.name);
} else {
  console.error(result.error.message);
}
```

---

## 6. 常见陷阱

### 6.1 忘记 await

```javascript
async function example() {
  const user = fetchUser(); // ❌ 忘记 await，user 是 Promise
  console.log(user.name);   // ❌ undefined
}
```

### 6.2 并行循环

```javascript
// ❌ 串行执行（慢）
for (const url of urls) {
  await fetch(url);
}

// ✅ 并行执行（快）
await Promise.all(urls.map(url => fetch(url)));

// ✅ 控制并发数
async function fetchWithLimit(urls, limit) {
  const results = [];
  const executing = [];

  for (const url of urls) {
    const promise = fetch(url).then(r => results.push(r));
    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }

  await Promise.all(executing);
  return results;
}
```

### 6.3 async 函数中的同步错误

```javascript
async function example() {
  throw new Error("Sync error"); // 等效于 return Promise.reject(new Error(...))
}

// 未捕获的 Promise rejection
example(); // 触发 unhandledrejection 事件

// ✅ 始终 await 或 .catch
await example().catch(e => console.error(e));
```

---

**参考规范**：ECMA-262 §27.2 Promise Objects | ECMA-262 §27.7 Async Function Objects
