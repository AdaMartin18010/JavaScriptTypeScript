# 生成器与迭代器控制流

> 可暂停/恢复的执行流：Generator 的完整语义
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 迭代器协议回顾

```javascript
// 可迭代对象
const iterable = {
  [Symbol.iterator]() {
    let i = 0;
    return {
      next() {
        if (i < 3) return { value: i++, done: false };
        return { done: true };
      }
    };
  }
};

for (const value of iterable) {
  console.log(value); // 0, 1, 2
}
```

---

## 2. Generator 基础

### 2.1 `function*` 语法

```javascript
function* countUp() {
  yield 1;
  yield 2;
  yield 3;
}

const gen = countUp();

console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

### 2.2 `yield` 表达式

```javascript
function* generator() {
  const a = yield 1;      // 产出 1，暂停，等待外部传入值
  console.log("Received:", a);
  const b = yield 2;
  console.log("Received:", b);
}

const gen = generator();
gen.next();          // 产出 1，暂停
// gen 停在 yield 1 处，等待 next 传入值
gen.next("first");   // a = "first"，产出 2，暂停
gen.next("second");  // b = "second"，完成
```

---

## 3. Generator 控制流

### 3.1 `yield`：产出值并暂停

```javascript
function* range(start, end) {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}

for (const num of range(1, 5)) {
  console.log(num); // 1, 2, 3, 4, 5
}
```

### 3.2 `next(value)`：传入值并恢复

```javascript
function* echo() {
  while (true) {
    const input = yield "Ready";
    yield `Echo: ${input}`;
  }
}

const gen = echo();
gen.next();           // { value: "Ready", done: false }
gen.next("hello");    // { value: "Echo: hello", done: false }
gen.next();           // { value: "Ready", done: false }
```

### 3.3 `return(value)`：提前终止

```javascript
function* gen() {
  yield 1;
  yield 2;
  yield 3;
}

const g = gen();
g.next();           // { value: 1, done: false }
g.return("early");  // { value: "early", done: true }
g.next();           // { value: undefined, done: true }
```

### 3.4 `throw(error)`：向生成器注入异常

```javascript
function* gen() {
  try {
    yield 1;
    yield 2;
  } catch (e) {
    yield `Caught: ${e.message}`;
  }
}

const g = gen();
g.next();                    // { value: 1, done: false }
g.throw(new Error("Oops"));  // { value: "Caught: Oops", done: false }
```

---

## 4. 委托生成器

### 4.1 `yield*` 语法

```javascript
function* subGenerator() {
  yield "a";
  yield "b";
}

function* mainGenerator() {
  yield "start";
  yield* subGenerator();
  yield "end";
}

for (const value of mainGenerator()) {
  console.log(value); // "start", "a", "b", "end"
}
```

### 4.2 委托给可迭代对象

```javascript
function* gen() {
  yield* [1, 2, 3];
  yield* "abc";
}

console.log([...gen()]); // [1, 2, 3, "a", "b", "c"]
```

---

## 5. 异步生成器

### 5.1 `async function*`

```javascript
async function* asyncRange(start, end) {
  for (let i = start; i <= end; i++) {
    await new Promise(resolve => setTimeout(resolve, 100));
    yield i;
  }
}

// 消费
async function main() {
  for await (const num of asyncRange(1, 3)) {
    console.log(num); // 1, 2, 3（间隔 100ms）
  }
}
```

### 5.2 AsyncIterator 协议

```javascript
const asyncIterable = {
  async *[Symbol.asyncIterator]() {
    yield await Promise.resolve(1);
    yield await Promise.resolve(2);
  }
};
```

---

## 6. 实战模式

### 6.1 惰性序列生成

```javascript
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
console.log(fib.next().value); // 0
console.log(fib.next().value); // 1
console.log(fib.next().value); // 1
console.log(fib.next().value); // 2
```

### 6.2 状态机实现

```javascript
function* trafficLight() {
  while (true) {
    yield "green";
    yield "yellow";
    yield "red";
  }
}

const light = trafficLight();
console.log(light.next().value); // "green"
console.log(light.next().value); // "yellow"
console.log(light.next().value); // "red"
```

### 6.3 Redux-Saga 风格控制流

```javascript
function* fetchUserSaga() {
  try {
    const user = yield call(api.fetchUser);
    yield put({ type: "FETCH_USER_SUCCESS", payload: user });
  } catch (error) {
    yield put({ type: "FETCH_USER_FAILURE", payload: error.message });
  }
}
```

---

## 7. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 生成器不自动执行 | `function*` 返回生成器对象，不会自动运行 | 手动调用 `.next()` 或 for...of |
| yield 的运算符优先级 | `yield` 优先级低，复杂表达式需括号 | `yield (a + b)` |
| 生成器实例的重用 | 生成器实例是一次性的 | 每次需要新的生成器实例 |
| throw 后生成器状态 | throw 后若未捕获，生成器终止 | 在 try/catch 中处理 |

---

**参考规范**：ECMA-262 §15.5 Generator Functions | ECMA-262 §15.6 Async Generator Functions
