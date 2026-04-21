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

```javascript
// 统一处理同步/异步错误
Promise.try(() => {
  if (Math.random() > 0.5) throw new Error("Sync error");
  return fetchData();
})
.then(result => console.log(result))
.catch(error => console.error(error));
```

---

**参考规范**：ECMA-262 §27.2 Promise Objects
