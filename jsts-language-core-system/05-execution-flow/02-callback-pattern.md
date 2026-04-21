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
```

---

**参考规范**：ECMA-262 §6.2.5.4 Invoke | ECMA-262 §27.2 Promise Objects
