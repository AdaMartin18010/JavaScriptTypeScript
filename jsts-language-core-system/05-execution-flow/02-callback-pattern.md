# 回调模式

> JavaScript 异步编程的原始形态：Callback Pattern 与 Callback Hell
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 回调基础

### 1.1 同步回调

```javascript
function processArray(arr, callback) {
  for (let i = 0; i < arr.length; i++) {
    callback(arr[i], i);
  }
}

processArray([1, 2, 3], (item, index) => {
  console.log(item, index);
});
```

### 1.2 异步回调

```javascript
function fetchData(url, callback) {
  setTimeout(() => {
    const data = { id: 1, name: "Alice" };
    callback(null, data);
  }, 1000);
}

fetchData("/api/user", (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(data);
});
```

---

## 2. 回调地狱（Callback Hell）

### 2.1 嵌套回调的问题

```javascript
getData(function (a) {
  getMoreData(a, function (b) {
    getMoreData(b, function (c) {
      getMoreData(c, function (d) {
        getMoreData(d, function (e) {
          console.log(e);
        });
      });
    });
  });
});
```

问题：

- 代码向右漂移（金字塔形）
- 错误处理分散在各层
- 代码可读性极差

---

## 3. 回调约定

### 3.1 Node.js Error-first Callback

```javascript
fs.readFile("file.txt", (err, data) => {
  if (err) {
    console.error("Read failed:", err);
    return;
  }
  console.log(data);
});
```

约定：

- 第一个参数：Error 对象（无错误时为 null）
- 后续参数：成功时的返回值

### 3.2 回调函数的签名设计

```javascript
// 好的签名：参数少、语义清晰
function fetchUser(id, callback) { }

// 差的签名：参数过多、含义不明
function doSomething(a, b, c, d, callback) { }
```

---

## 4. 回调的替代演进

### 4.1 Promise 化（Promisify）

```javascript
const util = require("util");
const readFilePromise = util.promisify(fs.readFile);

// 或使用原生 Promise
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}
```

### 4.2 async/await 的转换

```javascript
// 从回调地狱到 async/await
async function loadData() {
  const a = await getData();
  const b = await getMoreData(a);
  const c = await getMoreData(b);
  const d = await getMoreData(c);
  const e = await getMoreData(d);
  console.log(e);
}
```

---

## 5. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 回调中的 this 丢失 | 方法作为回调时 this 改变 | 使用箭头函数或 .bind() |
| 同步回调导致的堆栈爆炸 | 递归同步回调耗尽栈空间 | 使用 setImmediate 或 trampoline |
| Zalgo 问题 | 回调有时同步有时异步 | 始终异步调用回调（setImmediate） |
| 未处理的回调错误 | 回调中 throw 未被捕获 | 使用 domain 或 Promise 化 |

---

**参考规范**：ECMA-262 §9.5 Jobs and Job Queues
