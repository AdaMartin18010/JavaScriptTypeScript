# async/await 转换语义

> async/await 作为 Promise 语法糖的底层转换与微任务调度
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 语法糖转换

### 1.1 async 函数

```javascript
async function greet() {
  return "Hello";
}

// 等价于：
function greet() {
  return Promise.resolve("Hello");
}
```

### 1.2 await 表达式

```javascript
async function fetchUser() {
  const user = await fetch("/api/user");
  return user.json();
}

// 大致等价于：
function fetchUser() {
  return fetch("/api/user").then(user => user.json());
}
```

---

## 2. 执行暂停与恢复

### 2.1 await 处的执行暂停

```javascript
async function example() {
  console.log("A");
  await Promise.resolve(); // 暂停，将后续代码包装为微任务
  console.log("B");
}

console.log("C");
example();
console.log("D");

// 输出：C, A, D, B
```

解析：

1. `C`（同步）
2. `A`（example 中的同步代码）
3. `await`：暂停 example，将 `console.log("B")` 注册为微任务
4. `D`（同步）
5. 微任务检查点：`B`

### 2.2 Promise 解决后的恢复执行

```javascript
async function delayed() {
  console.log("Start");
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("After 1s"); // 1 秒后作为微任务恢复
}
```

---

## 3. 错误处理

### 3.1 try/catch 与 Promise 拒绝的映射

```javascript
async function risky() {
  try {
    const data = await fetch("/api/data");
    return data;
  } catch (error) {
    console.error("Failed:", error);
    throw error;
  }
}

// 等价于：
function risky() {
  return fetch("/api/data")
    .then(data => data)
    .catch(error => {
      console.error("Failed:", error);
      throw error;
    });
}
```

### 3.2 未捕获的异常传播

```javascript
async function throwError() {
  throw new Error("Oops");
}

throwError(); // 返回 rejected Promise，未处理会触发 unhandledrejection
```

---

## 4. 并发 vs 串行

### 4.1 顺序 await（串行）

```javascript
// ❌ 串行执行
async function slow() {
  const user = await fetchUser();      // 等待 1s
  const posts = await fetchPosts();    // 等待 1s
  return { user, posts };              // 总时间：2s
}
```

### 4.2 Promise.all + await（并发）

```javascript
// ✅ 并行执行
async function fast() {
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ]);
  return { user, posts };              // 总时间：1s
}
```

---

## 5. 性能考量

- async/await 有轻微的开销（Promise 创建和微任务调度）
- 在大多数场景下，性能差异可忽略
- 避免在热路径中创建不必要的 async 函数

---

**参考规范**：ECMA-262 §15.8 Async Function Definitions
