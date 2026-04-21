# Promise 详解

> Promise A+ 规范实现与实战模式
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

## 2. 基本用法

### 2.1 创建 Promise

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true;
    if (success) {
      resolve("Data loaded");
    } else {
      reject(new Error("Failed to load"));
    }
  }, 1000);
});
```

### 2.2 消费 Promise

```javascript
promise
  .then(value => {
    console.log(value); // "Data loaded"
    return value.toUpperCase();
  })
  .then(upper => {
    console.log(upper); // "DATA LOADED"
  })
  .catch(error => {
    console.error(error);
  })
  .finally(() => {
    console.log("Cleanup");
  });
```

---

## 3. Promise 链

### 3.1 then 的返回值

```javascript
Promise.resolve(1)
  .then(v => v + 1)      // 返回 2
  .then(v => v * 2)      // 返回 4
  .then(v => Promise.resolve(v + 1)) // 返回 Promise<5>
  .then(v => console.log(v)); // 5
```

### 3.2 错误冒泡

```javascript
Promise.resolve()
  .then(() => { throw new Error("A"); })
  .then(() => console.log("B"))    // 跳过
  .then(() => console.log("C"))    // 跳过
  .catch(err => console.log(err.message)); // "A"
```

---

## 4. 静态方法

```javascript
// Promise.resolve / Promise.reject
Promise.resolve(42);        // 立即 fulfilled
Promise.reject(new Error()); // 立即 rejected

// Promise.all：全部成功才成功
Promise.all([p1, p2, p3])
  .then(([r1, r2, r3]) => {});

// Promise.race：第一个 settled 决定结果
Promise.race([p1, p2])
  .then(winner => {});

// Promise.allSettled：等待全部 settled
Promise.allSettled([p1, p2])
  .then(results => {
    results.forEach(r => {
      if (r.status === "fulfilled") console.log(r.value);
      else console.error(r.reason);
    });
  });

// Promise.any：第一个 fulfilled 决定结果
Promise.any([p1, p2, p3])
  .then(first => {})
  .catch(aggregateError => {
    // 全部 rejected
  });
```

---

## 5. 微任务调度

```javascript
console.log("1");
Promise.resolve().then(() => console.log("2"));
console.log("3");
// 输出：1 → 3 → 2
```

`.then()` 回调作为微任务，在当前同步代码执行后调度。

---

**参考规范**：ECMA-262 §27.2 Promise Objects | Promise A+ Specification
