# Promise 执行流

> Promise 的状态转换、微任务调度与链式调用机制
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. Promise 状态机

```
          new Promise((resolve, reject) => { ... })
                    │
                    ▼
              ┌──────────┐
              │ pending  │
              └────┬─────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
   ┌──────────┐        ┌──────────┐
   │fulfilled │        │rejected  │
   └──────────┘        └──────────┘
```

- **Pending**：初始状态
- **Fulfilled**：操作成功完成
- **Rejected**：操作失败

状态一旦确定，不可再变。

---

## 2. 执行流程

```javascript
console.log("1");

const promise = new Promise((resolve) => {
  console.log("2");
  resolve("3");
  console.log("4");
});

promise.then(value => console.log(value));

console.log("5");

// 输出：1 → 2 → 4 → 5 → 3
// 解释：
// 1: 同步
// 2: Promise executor 同步执行
// 4: resolve 后的同步代码继续执行
// 5: 同步代码结束
// 3: then 回调作为微任务执行
```

---

## 3. 微任务调度

```javascript
console.log("1");
Promise.resolve().then(() => console.log("2"));
Promise.resolve().then(() => console.log("3"));
console.log("4");

// 输出：1 → 4 → 2 → 3
// 微任务按 FIFO 顺序执行
```

---

## 4. 链式调用

```javascript
Promise.resolve(1)
  .then(v => {
    console.log(v); // 1
    return v + 1;
  })
  .then(v => {
    console.log(v); // 2
    return new Promise(resolve => setTimeout(() => resolve(v + 1), 0));
  })
  .then(v => {
    console.log(v); // 3（在下一个事件循环中）
  });
```

---

## 5. ES2025：Promise.try

ES2025 新增的 `Promise.try` 简化了同步/异步统一的错误处理：

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
  if (Math.random() > 0.5) throw new Error("Sync error");
  return fetchData();
})
.then(result => console.log(result))
.catch(error => console.error(error));
```

**优势**：同步错误自动转为 Promise reject，避免 `Promise.resolve().then()` 的微任务延迟问题。

---

## 6. 错误处理

```javascript
Promise.resolve()
  .then(() => { throw new Error("A"); })
  .then(() => console.log("B"))    // 跳过
  .catch(err => {
    console.log(err.message);       // "A"
    return "recovered";
  })
  .then(v => console.log(v));       // "recovered"
```

---

## 7. Promise 并发模式

### 7.1 Promise.all

```javascript
const [users, posts] = await Promise.all([
  fetchUsers(),
  fetchPosts()
]);
// 全部成功时返回结果数组，任一失败立即 reject
```

### 7.2 Promise.race

```javascript
const result = await Promise.race([
  fetchData(),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000)
  )
]);
```

---

## 8. Promise 链式错误处理

```javascript
Promise.resolve()
  .then(() => { throw new Error("A"); })
  .then(() => console.log("B"))    // 跳过
  .catch(err => {
    console.log(err.message);       // "A"
    return "recovered";
  })
  .then(v => console.log(v));       // "recovered"
```

## 9. Promise 静态方法

```javascript
// 全部解决
const [a, b] = await Promise.all([
  fetch("/a"),
  fetch("/b")
]);

// 竞赛
const winner = await Promise.race([
  fetch("/fast"),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), 5000)
  )
]);
```

---

**参考规范**：ECMA-262 §27.2 Promise Objects

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
