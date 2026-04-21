# 生成器与迭代器执行流

> Generator 的状态机模型与执行控制
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. Generator 基础

```javascript
function* count() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = count();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

---

## 2. Generator 作为状态机

```javascript
function* trafficLight() {
  while (true) {
    yield "green";   // 状态 1
    yield "yellow";  // 状态 2
    yield "red";     // 状态 3
  }
}

const light = trafficLight();
console.log(light.next().value); // "green"
console.log(light.next().value); // "yellow"
console.log(light.next().value); // "red"
```

---

## 3. yield 传值

```javascript
function* echo() {
  const received = yield "ready";
  yield `received: ${received}`;
}

const gen = echo();
console.log(gen.next());           // { value: "ready", done: false }
console.log(gen.next("hello"));    // { value: "received: hello", done: false }
```

---

## 4. 异步生成器

```javascript
async function* asyncRange(start, end) {
  for (let i = start; i <= end; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    yield i;
  }
}

(async () => {
  for await (const num of asyncRange(1, 3)) {
    console.log(num); // 1, 2, 3（每 100ms）
  }
})();
```

---

**参考规范**：ECMA-262 §27.5 Generator Objects
