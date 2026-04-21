# 事件循环经典题目与解析

> 从基础到高级：20+ 道渐进式事件循环练习题
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 基础题目

### 题目 1：基础顺序

```javascript
console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");
```

<details>
<summary>答案与解析</summary>

**输出**：`1 → 4 → 3 → 2`

**解析**：
1. `console.log("1")` — 同步
2. `setTimeout` — 宏任务入队
3. `Promise.then` — 微任务入队
4. `console.log("4")` — 同步
5. 同步代码结束 → microtask checkpoint → `3`
6. 宏任务 → `2`

</details>

### 题目 2：Promise 链

```javascript
Promise.resolve(1)
  .then(v => {
    console.log(v);
    return v + 1;
  })
  .then(v => {
    console.log(v);
    return new Promise(resolve => setTimeout(() => resolve(v + 1), 0));
  })
  .then(v => console.log(v));

console.log("end");
```

<details>
<summary>答案与解析</summary>

**输出**：`end → 1 → 2 → 3`

**解析**：
1. `Promise.resolve(1)` 创建 resolved Promise
2. 第一个 `.then` 回调作为微任务 → `1`
3. 返回 `2`，第二个 `.then` 回调作为微任务 → `2`
4. 返回 Promise（setTimeout 0），其解决在下一个事件循环
5. `"end"` 同步输出
6. 微任务队列清空后，setTimeout 回调执行，Promise 解决
7. 第三个 `.then` 作为微任务 → `3`

</details>

---

## 2. async/await 题目

### 题目 3：async 函数执行顺序

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
<summary>答案与解析</summary>

**输出**：`script start → async1 start → async2 → script end → async1 end`

**解析**：
1. `"script start"` — 同步
2. `async1()` 调用
3. `"async1 start"` — 同步（async 函数体在调用时同步执行到第一个 await）
4. `await async2()` — `async2()` 同步执行 → `"async2"`
5. `await` 将后续代码（`"async1 end"`）作为微任务入队
6. `"script end"` — 同步
7. 微任务 checkpoint → `"async1 end"`

</details>

### 题目 4：多个 await

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
```

<details>
<summary>答案与解析</summary>

**输出**：`A → D → B → E → C`

**解析**：
1. `test()` 调用 → `"A"`
2. `await Promise.resolve()` — 将 `"B"` 作为微任务入队
3. 外部 `"D"` 和 `"E"` 也作为微任务入队
4. 微任务队列：`["B", "D", "E"]`
5. 注意：`"B"` 先注册，但 `"D"` 紧随其后
6. 实际执行顺序取决于注册顺序：`"B"` 在 `test()` 中注册，`"D"` 在外部注册
7. 但 `"B"` 是在第一个 await 时注册，`"D"` 是在外部注册
8. 由于 `test()` 先执行，`"B"` 比 `"D"` 先注册
9. 所以顺序是：`"B"` → `"D"` → `"E"`?

**纠正**：实际上 `"D"` 和 `"E"` 在 `test()` 的外部代码中注册，而 `"B"` 在 `test()` 的 await 后注册。由于 `test()` 的代码先执行，`"B"` 先注册，然后是 `"D"`、 `"E"`。

所以正确输出是：`A → B → D → E → C`

等等，让我重新分析...

`await Promise.resolve()` 的执行：
- `Promise.resolve()` 立即返回 resolved Promise
- `.then(callback)` 将 callback 加入微任务队列
- 所以 `"B"` 进入微任务队列

然后外部代码继续：
- `Promise.resolve().then(() => console.log("D"))` — `"D"` 进入微任务队列
- `Promise.resolve().then(() => console.log("E"))` — `"E"` 进入微任务队列

所以微任务队列顺序：`["B", "D", "E"]`

输出：`A → B → D → E → C`

</details>

---

## 3. 高级题目

### 题目 5：微任务递归

```javascript
let count = 0;

function schedule() {
  Promise.resolve().then(() => {
    count++;
    console.log(count);
    if (count < 3) schedule();
  });
}

schedule();
setTimeout(() => console.log("timeout"), 0);
```

<details>
<summary>答案与解析</summary>

**输出**：`1 → 2 → 3 → timeout`

**解析**：
1. `schedule()` 注册第一个微任务
2. 微任务 checkpoint：输出 `1`，注册第二个微任务
3. 继续 checkpoint（因为微任务队列非空）：输出 `2`，注册第三个微任务
4. 继续 checkpoint：输出 `3`，不再注册
5. 微任务队列空，执行宏任务：`timeout`

**关键点**：微任务 checkpoint 会递归清空所有微任务，包括新添加的。

</details>

### 题目 6：Promise + setTimeout 混合

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
<summary>答案与解析</summary>

**输出**：`1 → 6 → 4 → 2 → 3 → 5`

**解析**：
1. `"1"` — 同步
2. `setTimeout` — 宏任务 T1 入队
3. `Promise.then` — 微任务 M1 入队
4. `"6"` — 同步
5. Microtask checkpoint：M1 → `"4"`，同时 setTimeout 注册宏任务 T2
6. 宏任务 T1 → `"2"`，同时 Promise.then 注册微任务 M2
7. Microtask checkpoint（每个宏任务后检查）：M2 → `"3"`
8. 宏任务 T2 → `"5"`

</details>

---

## 4. 陷阱题目

### 题目 7：setTimeout 延迟不为 0

```javascript
setTimeout(() => console.log("1"), 0);
setTimeout(() => console.log("2"), 1);
setTimeout(() => console.log("3"), 0);
```

<details>
<summary>答案与解析</summary>

**输出**：`1 → 3 → 2`（通常情况）

**解析**：
- 延迟为 0 的 setTimeout 回调先执行
- 延迟为 1ms 的后执行
- 但注意：HTML5 规范要求 setTimeout 最小延迟为 4ms（如果嵌套层级超过 5）

</details>

### 题目 8：MutationObserver（浏览器）

```javascript
const observer = new MutationObserver(() => {
  console.log("mutation");
});

observer.observe(document.body, { childList: true });
document.body.appendChild(document.createElement("div"));

Promise.resolve().then(() => console.log("promise"));
```

<details>
<summary>答案与解析</summary>

**输出**：`promise → mutation`

**解析**：
- MutationObserver 回调作为微任务执行
- Promise.then 也是微任务
- 执行顺序：Promise.then 先注册先执行，MutationObserver 在微任务队列尾部

</details>

---

## 5. Node.js 特殊题目

### 题目 9：process.nextTick

```javascript
setTimeout(() => console.log("timeout"), 0);
setImmediate(() => console.log("immediate"));
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
```

<details>
<summary>答案与解析</summary>

**输出**：`nextTick → promise → timeout/immediate`

**解析**：
- `process.nextTick` 在 Node.js 中优先级高于微任务
- 然后是 Promise 微任务
- `setTimeout` 和 `setImmediate` 取决于事件循环阶段

**注意**：`process.nextTick` 可能饿死 I/O，Node.js 文档建议使用 `queueMicrotask`。

</details>

---

## 6. 实战场景

### 场景 1：批量 DOM 更新

```javascript
// ❌ 多次重排
for (let i = 0; i < 100; i++) {
  element.style.height = `${i}px`; // 每次触发重排
}

// ✅ 批量更新
requestAnimationFrame(() => {
  for (let i = 0; i < 100; i++) {
    element.style.height = `${i}px`; // 批量处理，只触发一次重排
  }
});
```

### 场景 2：防抖与节流

```javascript
// 防抖：利用 setTimeout 宏任务
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：控制执行频率
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

---

**参考资源**：
- [Jake Archibald: Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [Node.js Event Loop Guide](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
