# 异步控制流

> async/await 的编译原理与执行语义
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. async 函数的本质

`async` 函数是 Generator + Promise 的语法糖：

```javascript
async function fetchData() {
  const response = await fetch("/api/data");
  const data = await response.json();
  return data;
}

// 等价于（简化）：
function fetchData() {
  return new Promise((resolve) => {
    fetch("/api/data")
      .then(response => response.json())
      .then(data => resolve(data));
  });
}
```

---

## 2. await 的执行语义

### 2.1 暂停与恢复

```javascript
async function example() {
  console.log("A");
  await Promise.resolve(); // 暂停，将后续代码加入微任务队列
  console.log("B");        // 微任务阶段恢复执行
}

example();
console.log("C");
// 输出顺序：A → C → B
```

### 2.2 await 的 thenable 特性

`await` 不仅等待 Promise，也等待任何 thenable：

```javascript
const thenable = {
  then(resolve) {
    setTimeout(() => resolve("done"), 100);
  }
};

async function test() {
  const result = await thenable; // 等待 thenable 的 then 调用 resolve
  console.log(result); // "done"
}
```

---

## 3. 并行 vs 串行

### 3.1 串行（慢）

```javascript
async function sequential() {
  const user = await fetchUser();     // 100ms
  const posts = await fetchPosts();   // 100ms
  const comments = await fetchComments(); // 100ms
  return { user, posts, comments };   // 总耗时 300ms
}
```

### 3.2 并行（快）

```javascript
async function parallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]); // 总耗时 ~100ms
  return { user, posts, comments };
}
```

### 3.3 混合模式

```javascript
async function mixed() {
  const user = await fetchUser(); // 必须先获取用户

  // 并行获取该用户的数据
  const [posts, settings] = await Promise.all([
    fetchPosts(user.id),
    fetchSettings(user.id)
  ]);

  return { user, posts, settings };
}
```

---

## 4. 错误处理

### 4.1 try/catch

```javascript
async function safeFetch() {
  try {
    const response = await fetch("/api/data");
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    return null;
  }
}
```

### 4.2 同步错误与异步错误

```javascript
async function mixedErrors() {
  try {
    // 同步错误（throw）
    if (!isValid()) throw new Error("Invalid");

    // 异步错误（Promise reject）
    await fetch("/api/data");
  } catch (e) {
    // 捕获两种错误
    console.error(e);
  }
}
```

### 4.3 顶层 await 的错误

```javascript
// ES2022 顶层 await
const data = await fetchData().catch(e => {
  console.error(e);
  return defaultData;
});
```

---

## 5. async 函数的返回值

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

**参考规范**：ECMA-262 §27.7 Async Function Objects
