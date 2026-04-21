# async/await 转换原理

> async 函数的编译转换与执行步骤可视化
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. async 函数的本质

`async` 函数编译为**状态机 + Promise**：

```javascript
async function example() {
  const a = await fetchA();
  const b = await fetchB();
  return a + b;
}

// 大致等价于：
function example() {
  return new Promise((resolve, reject) => {
    let state = 0;
    let a;
    
    function step(value) {
      try {
        switch (state) {
          case 0:
            state = 1;
            fetchA().then(step, reject);
            break;
          case 1:
            a = value;
            state = 2;
            fetchB().then(step, reject);
            break;
          case 2:
            resolve(a + value);
            break;
        }
      } catch (e) {
        reject(e);
      }
    }
    
    step();
  });
}
```

---

## 2. await 的执行步骤

### 2.1 精确语义

`await x` 的执行步骤（ECMA-262 规范）：

1. 计算表达式 `x` 的值
2. 如果值不是 Thenable，包装为 resolved Promise
3. 如果是 Thenable，调用其 `.then()` 方法
4. **暂停当前 async 函数的执行**
5. 将后续代码作为微任务注册
6. 当 Promise 解决后，恢复执行

```javascript
async function demo() {
  console.log("A");
  await 1;              // 1 不是 Thenable，包装为 Promise.resolve(1)
  console.log("B");     // 作为微任务执行
}

demo();
console.log("C");

// 输出：A → C → B
```

### 2.2 await 的展开

```javascript
// await x 等价于：
Promise.resolve(x).then(value => /* 后续代码 */)
```

### 2.3 await vs 直接返回 Promise

```javascript
// ❌ 反模式：不必要的 await
async function fetchData() {
  return await fetch("/api/data"); // 多余，因为 async 函数已经返回 Promise
}

// ✅ 直接返回
async function fetchData() {
  return fetch("/api/data");
}
```

**例外**：在 try-catch 中，`await` 可以捕获同步和异步错误：

```javascript
// ✅ 需要 await 来捕获两种错误
async function safeFetch() {
  try {
    const response = await fetch("/api/data");
    return await response.json();
  } catch (e) {
    // 捕获 fetch 和 .json() 的错误
    return null;
  }
}
```

---

## 3. 执行流程可视化

### 3.1 经典题目

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

// 输出：
// script start
// async1 start
// async2
// script end
// async1 end
```

**步骤分解**：
1. `"script start"` — 同步
2. `async1()` 调用 — 同步执行到第一个 await
3. `"async1 start"` — 同步
4. `await async2()` — `async2()` 同步执行 → `"async2"`
5. `await` 将 `"async1 end"` 作为微任务入队
6. `"script end"` — 同步
7. 微任务 checkpoint → `"async1 end"`

### 3.2 多个 await 的竞争

```javascript
async function test() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
  await Promise.resolve();
  console.log("C");
}

test();
Promise.resolve().then(() => console.log("D"));
Promise.resolve().then(() => console.log("E"));

// 输出：A → D → B → E → C
```

**分析**：`test()` 先执行，`await` 将 `"B"` 注册为微任务。然后外部注册 `"D"` 和 `"E"`。微任务队列顺序：`["B", "D", "E"]`。

---

## 4. 错误传播

### 4.1 throw 自动包装为 reject

```javascript
async function mightFail() {
  throw new Error("Oops"); // 等效于 return Promise.reject(new Error("Oops"))
}

async function caller() {
  try {
    await mightFail();
  } catch (e) {
    console.log(e.message); // "Oops"
  }
}
```

### 4.2 同步错误与异步错误统一捕获

```javascript
async function unifiedErrorHandling() {
  try {
    // 同步错误
    if (!isValid()) throw new Error("Invalid");
    
    // 异步错误
    await fetch("/api/data");
  } catch (e) {
    // 统一捕获两种错误
    console.error(e);
  }
}
```

### 4.3 未捕获的异常

```javascript
async function unhandled() {
  throw new Error("Unhandled");
}

unhandled(); // 触发 unhandledrejection 事件

// ✅ 始终 await 或 .catch
unhandled().catch(e => console.error(e));
```

---

## 5. 并发控制

### 5.1 串行 vs 并行

```javascript
// ❌ 串行（慢）
async function sequential() {
  const user = await fetchUser();     // 100ms
  const posts = await fetchPosts();   // 100ms
  return { user, posts };             // 200ms
}

// ✅ 并行（快）
async function parallel() {
  const [user, posts] = await Promise.all([
    fetchUser(),
    fetchPosts()
  ]); // ~100ms
  return { user, posts };
}
```

### 5.2 混合模式

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

## 6. ES2025 Promise.try

ES2025 新增的 `Promise.try` 简化了同步/异步统一的错误处理：

```javascript
// ❌ 以前
async function safeCall(fn) {
  try {
    return await fn();
  } catch (e) {
    return handleError(e);
  }
}

// ✅ ES2025
Promise.try(() => {
  if (Math.random() > 0.5) throw new Error("Sync error");
  return fetchData();
})
.then(result => console.log(result))
.catch(error => console.error(error));
```

---

**参考规范**：ECMA-262 §27.7 Async Function Objects
