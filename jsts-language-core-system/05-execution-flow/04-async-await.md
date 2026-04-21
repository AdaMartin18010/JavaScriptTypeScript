# async/await 执行流详解

> 异步函数的编译转换与执行步骤可视化
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. async 函数的本质

`async` 函数编译为状态机 + Promise：

```javascript
async function example() {
  const a = await fetchA();
  const b = await fetchB();
  return a + b;
}

// 大致等价于：
function example() {
  return new Promise((resolve, reject) => {
    fetchA().then(a => {
      fetchB().then(b => {
        resolve(a + b);
      }, reject);
    }, reject);
  });
}
```

---

## 2. await 的执行步骤

```javascript
async function demo() {
  console.log("A");
  await 1;              // 将后续代码转为微任务
  console.log("B");
  await Promise.resolve(2);
  console.log("C");
}

demo();
console.log("D");

// 输出：A → D → B → C
```

---

## 3. 执行流程可视化

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

---

## 4. 错误传播

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

---

**参考规范**：ECMA-262 §27.7 Async Function Objects
