# 回调模式与回调地狱

> 异步编程的基石：从回调到 Promise 再到 async/await 的演进
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 回调基础

回调是将函数作为参数传递，在适当时机调用：

```javascript
function fetchData(callback) {
  setTimeout(() => {
    const data = { id: 1, name: "Alice" };
    callback(data);
  }, 100);
}

fetchData((user) => {
  console.log(user.name);
});
```

### 1.1 错误优先回调（Node.js 风格）

```javascript
fs.readFile("file.txt", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

### 1.2 回调的同步 vs 异步调用

```javascript
// ❌ 不一致：可能同步或异步调用
function maybeAsync(callback) {
  if (cache.has(data)) {
    callback(cache.get(data)); // 同步调用
  } else {
    fetch(data, callback);     // 异步调用
  }
}

// ✅ 始终异步调用（使用 queueMicrotask）
function alwaysAsync(callback) {
  if (cache.has(data)) {
    queueMicrotask(() => callback(cache.get(data)));
  } else {
    fetch(data, callback);
  }
}
```

---

## 2. 回调地狱（Callback Hell）

嵌套过深的回调导致代码难以维护：

```javascript
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        getMoreData(d, function(e) {
          // ...
        });
      });
    });
  });
});
```

### 2.1 命名的缓解方案

```javascript
function handleA(a) {
  getMoreData(a, handleB);
}

function handleB(b) {
  getMoreData(b, handleC);
}

function handleC(c) {
  getMoreData(c, handleD);
}

getData(handleA);
```

---

## 3. 错误处理困境

```javascript
asyncOp1(function(err, result1) {
  if (err) { handleError(err); return; }

  asyncOp2(result1, function(err, result2) {
    if (err) { handleError(err); return; }

    asyncOp3(result2, function(err, result3) {
      if (err) { handleError(err); return; }
      // ...
    });
  });
});
```

---

## 4. 现代替代方案

### 4.1 Promise

```javascript
getData()
  .then(a => getMoreData(a))
  .then(b => getMoreData(b))
  .then(c => getMoreData(c))
  .catch(err => handleError(err));
```

### 4.2 async/await

```javascript
async function process() {
  try {
    const a = await getData();
    const b = await getMoreData(a);
    const c = await getMoreData(b);
    return c;
  } catch (err) {
    handleError(err);
  }
}
```

---

## 5. 回调的合理场景

```javascript
// 事件监听
document.addEventListener("click", handleClick);

// 数组方法
[1, 2, 3].map(x => x * 2);

// 定时器
setTimeout(() => console.log("done"), 1000);

// 自定义事件
emitter.on("data", callback);

// 回调 API 的 Promise 包装
const readFile = (path) => new Promise((resolve, reject) => {
  fs.readFile(path, (err, data) => {
    if (err) reject(err);
    else resolve(data);
  });
});
```

---

## 6. 回调模式演进史

| 时期 | 模式 | 代表 |
|------|------|------|
| 1995-2009 | 纯回调 | DOM 事件监听 |
| 2009-2015 | 错误优先回调 | Node.js 核心模块 |
| 2015+ | Promise | ES6 标准化 |
| 2017+ | async/await | ES8 标准化 |
| 2025 | Promise.try | ES2025 |

## 7. 回调模式演进史

| 时期 | 模式 | 代表 |
|------|------|------|
| 1995-2009 | 纯回调 | DOM 事件监听 |
| 2009-2015 | 错误优先回调 | Node.js 核心模块 |
| 2015+ | Promise | ES6 标准化 |
| 2017+ | async/await | ES8 标准化 |
| 2025 | Promise.try | ES2025 |

## 8. 回调与内存泄漏

```javascript
// ❌ 潜在的内存泄漏
class EventEmitter {
  constructor() {
    this.listeners = [];
  }
  on(event, callback) {
    this.listeners.push({ event, callback });
  }
}

// ✅ 使用 WeakRef（ES2021）
class WeakEventEmitter {
  #listeners = new Set();
  on(callback) {
    const ref = new WeakRef(callback);
    this.#listeners.add(ref);
  }
}
```

## 9. Node.js 中的回调约定

```javascript
const fs = require("fs");

// 错误优先回调
fs.readFile("file.txt", (err, data) => {
  if (err) {
    console.error("读取失败:", err);
    return;
  }
  console.log(data);
});

// Promise 化
const util = require("util");
const readFile = util.promisify(fs.readFile);

// 或直接使用 fs.promises
const fsp = require("fs").promises;
const data = await fsp.readFile("file.txt");
```

## 10. 回调与事件循环的交互

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

process.nextTick?.(() => console.log("4"));

console.log("5");

// Node.js 输出：1 → 5 → 4 → 3 → 2
// 浏览器输出：1 → 5 → 3 → 2
```

回调的执行时机取决于其注册的任务队列。

---

**参考规范**：ECMA-262 §6.2.5.4 Invoke | ECMA-262 §27.2 Promise Objects

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
