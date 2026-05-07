# M1: HTMX 基础实验

## 目标

掌握 HTMX 核心概念：属性驱动交互、hx-get/hx-post、目标替换、触发器。

## 实验环境

```bash
# 任意静态服务器即可
cd milestone-01-htmx-basics
# 使用 Python 简易服务器
python -m http.server 3000
# 或 npx serve .
```

## 实验任务

### 任务 1: 最简单的 HTMX 请求

```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
  <script src="https://unpkg.com/htmx.org@2.0.0"></script>
</head>
<body>
  <button hx-get="/api/hello" hx-target="#result">
    Click Me
  </button>
  <div id="result"></div>
</body>
</html>
```

配套服务端（Node.js 模拟）：

```js
// server.js
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/api/hello' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end('<p>Hello from server! Time: ' + new Date().toISOString() + '</p>');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3001);
```

### 任务 2: hx-swap 模式实验

测试所有 `hx-swap` 值：

```html
<div hx-get="/item" hx-swap="innerHTML">innerHTML（默认）</div>
<div hx-get="/item" hx-swap="outerHTML">outerHTML</div>
<div hx-get="/item" hx-swap="beforebegin">beforebegin</div>
<div hx-get="/item" hx-swap="afterbegin">afterbegin</div>
<div hx-get="/item" hx-swap="beforeend">beforeend</div>
<div hx-get="/item" hx-swap="afterend">afterend</div>
<div hx-get="/item" hx-swap="delete">delete（移除自身）</div>
<div hx-get="/item" hx-swap="none">none（不替换，只触发事件）</div>
```

### 任务 3: 触发器与延时

```html
<!-- 搜索框输入防抖 -->
<input
  type="search"
  hx-get="/api/search"
  hx-target="#results"
  hx-trigger="keyup changed delay:300ms"
  name="q"
/>
<div id="results"></div>

<!-- 页面可见时加载 -->
<div hx-get="/api/notifications" hx-trigger="revealed"></div>

<!-- 轮询 -->
<div hx-get="/api/status" hx-trigger="every 5s"></div>
```

## 验证清单

- [ ] 点击按钮无页面刷新，内容动态替换
- [ ] hx-swap 各值行为符合预期
- [ ] 搜索防抖生效（300ms 内多次输入只发一次请求）
- [ ] 轮询每 5 秒自动更新

## 延伸阅读

- [HTMX 属性参考](https://htmx.org/reference/)
- [HTMX 示例集](https://htmx.org/examples/)
