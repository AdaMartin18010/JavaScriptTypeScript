---
title: 04 HTMX 4.0 新特性与前瞻
description: 了解 HTMX 4.0 Alpha 的重大变化：从 XMLHttpRequest 迁移到 Fetch API、ReadableStream 流式响应支持，以及对服务器优先架构的未来影响。
---

# 04 HTMX 4.0 新特性与前瞻

> **前置知识**：HTMX 核心概念、HTTP/_fetch API_
>
> **目标**：了解 HTMX 4.0 的技术演进方向，评估升级策略

---

## 1. HTMX 4.0 的核心变化

### 1.1 Fetch API 替换 XMLHttpRequest

HTMX 4.0 将底层从 `XMLHttpRequest` 全面迁移到 `Fetch API`：

```
HTMX 1.x-2.x: XMLHttpRequest
├── 进度事件支持好
├── 同步请求支持（不推荐）
└── 现代特性（如 Request/Response 对象）需要包装

HTMX 4.0: Fetch API
├── 原生 Promise 支持
├── 支持 ReadableStream 流式响应
├── 更好的 Service Worker 集成
├── 更现代的 API 设计
└── 与 Web Streams API 无缝集成
```

### 1.2 对现有代码的影响

```javascript
// HTMX 4.0 事件对象变化
htmx.on('htmx:beforeRequest', function(evt) {
  // evt.detail.xhr 变为 evt.detail.request（Fetch Request 对象）
  console.log(evt.detail.request.url);
  
  // 可以修改 Request 对象
  const newRequest = new Request(evt.detail.request, {
    headers: { 'X-Custom': 'value' }
  });
  evt.detail.request = newRequest;
});

htmx.on('htmx:afterRequest', function(evt) {
  // evt.detail.xhr 变为 evt.detail.response（Fetch Response 对象）
  console.log(evt.detail.response.status);
  
  // 可以读取响应头
  evt.detail.response.headers.forEach((value, key) => {
    console.log(`${key}: ${value}`);
  });
});
```

---

## 2. ReadableStream 流式响应

### 2.1 流式 HTML 更新

HTMX 4.0 支持通过 `ReadableStream` 逐步更新 DOM：

```html
<!-- 流式加载大表格 -->
<div hx-get="/api/large-dataset"
     hx-trigger="load"
     hx-target="#data-table"
     hx-swap="innerHTML"
     hx-ext="stream">
  加载中...
</div>

<div id="data-table"></div>
```

```javascript
// 服务器端（Node.js + Express）流式响应
app.get('/api/large-dataset', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Transfer-Encoding', 'chunked');
  
  const stream = db.queryStream('SELECT * FROM large_table');
  
  res.write('<table>');
  stream.on('data', (row) => {
    res.write(`<tr><td>${row.id}</td><td>${row.name}</td></tr>`);
  });
  stream.on('end', () => {
    res.write('</table>');
    res.end();
  });
});
```

### 2.2 渐进式内容加载

```html
<!-- 文章流式加载：先显示标题和摘要，再逐步加载正文 -->
<article hx-get="/api/article/123"
         hx-trigger="revealed"
         hx-swap="innerHTML">
  <div class="article-placeholder">
    <div class="skeleton-title"></div>
    <div class="skeleton-body"></div>
  </div>
</article>
```

```javascript
// 服务器端分块发送
app.get('/api/article/:id', async (req, res) => {
  const article = await db.articles.findById(req.params.id);
  
  res.setHeader('Content-Type', 'text/html');
  
  // 块 1：标题（立即发送）
  res.write(`
    <h1>${article.title}</h1>
    <div class="meta">${article.author} · ${article.date}</div>
  `);
  
  // 模拟异步加载正文
  await delay(100);
  
  // 块 2：摘要
  res.write(`<p class="summary">${article.summary}</p>`);
  
  await delay(100);
  
  // 块 3：完整正文
  res.write(`<div class="content">${article.content}</div>`);
  
  res.end();
});
```

---

## 3. 新的扩展系统

### 3.1 扩展注册方式变化

```javascript
// HTMX 4.0 扩展定义
htmx.defineExtension('stream', {
  onEvent: function(name, evt) {
    if (name === 'htmx:beforeRequest') {
      // 修改请求以支持流式响应
      evt.detail.request.headers.set('Accept', 'text/html+stream');
    }
  },
  
  transformResponse: function(text, xhr, elt) {
    // 处理流式响应片段
    return text;
  }
});
```

### 3.2 内置扩展增强

| 扩展 | HTMX 2.x | HTMX 4.0 |
|------|----------|----------|
| `json-enc` | 发送 JSON | 使用 Request 对象原生支持 |
| `sse` | SSE 通过 EventSource | SSE 通过 Fetch EventStream |
| `ws` | WebSocket | WebSocket（无变化） |
| `loading-states` | CSS 类控制 | CSS 类 + View Transitions |

---

## 4. 性能优化

### 4.1 请求合并

```html
<!-- HTMX 4.0 自动合并同时发出的相同请求 -->
<button hx-get="/api/data" hx-target="#result1">加载 1</button>
<button hx-get="/api/data" hx-target="#result2">加载 2</button>

<!-- 两个按钮同时点击时，只发送一个请求，结果分发到两个目标 -->
```

### 4.2 预连接与预加载

```html
<!-- 预连接常用 API 端点 -->
<meta name="htmx-config" content='{"defaultSwapStyle":"innerHTML","preload":"true"}'>

<!-- 鼠标悬停时预加载内容 -->
<a hx-get="/page/2"
   hx-target="#content"
   hx-trigger="preload">
  下一页（悬停时预加载）
</a>
```

---

## 5. 迁移策略

### 5.1 从 HTMX 2.x 迁移到 4.0

```javascript
// 1. 检查自定义事件处理器
htmx.on('htmx:beforeRequest', function(evt) {
  // 旧代码：evt.detail.xhr.setRequestHeader(...)
  // 新代码：evt.detail.request.headers.set(...)
});

// 2. 检查扩展代码
htmx.defineExtension('my-ext', {
  onEvent: function(name, evt) {
    // 旧代码可能依赖 xhr 对象
    // 需要适配为 Request/Response 对象
  }
});

// 3. 测试流式响应（如果使用了自定义流处理）
```

### 5.2 兼容性考虑

| 特性 | HTMX 2.x | HTMX 4.0 | 兼容性 |
|------|----------|----------|--------|
| `hx-get`/`hx-post` | ✅ | ✅ | 完全兼容 |
| `hx-target` | ✅ | ✅ | 完全兼容 |
| `hx-swap` | ✅ | ✅ | 完全兼容 |
| `hx-trigger` | ✅ | ✅ | 完全兼容 |
| 自定义事件中的 `xhr` | ✅ | ❌ | 需迁移到 `request`/`response` |
| 同步请求 | ✅ | ❌ | 移除（Fetch API 不支持） |
| 流式响应 | 扩展支持 | 原生支持 | 增强 |

---

## 6. 未来展望

### 6.1 Carson Gross 的"100 年 Web"愿景

HTMX 的设计哲学强调**超媒体系统的长期稳定性**：

> HTML 和 HTTP 是 Web 的基石，已经稳定运行了 30 年。HTMX 通过扩展 HTML 的能力，而不是引入新的抽象层，来构建能够长期维护的应用。

### 6.2 与新兴标准的集成

| 标准 | HTMX 4.0 支持 | 影响 |
|------|--------------|------|
| View Transitions API | ✅ 原生 | 更流畅的页面切换 |
| Speculation Rules API | ✅ 配合 | 预渲染页面提升性能 |
| Priority Hints | ✅ 配合 | 控制资源加载优先级 |
| Declarative Shadow DOM | 研究中 | 服务端渲染 Web Components |

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **迁移时忽略自定义扩展** | 依赖 `xhr` 对象的扩展会失效 | 全面测试自定义扩展 |
| **流式响应的 CSS 动画** | 流式插入的元素动画可能不同步 | 使用 `htmx:load` 事件初始化 |
| **Fetch API 的 CORS 差异** | Fetch 和 XHR 的 CORS 处理略有不同 | 测试跨域场景 |

---

## 练习

1. 比较 HTMX 2.x 和 4.0 的 Fetch API 差异，列出需要修改的代码清单。
2. 实现一个流式加载的日志查看器：服务器通过 ReadableStream 逐行发送日志，HTMX 逐步追加到页面。
3. 设计一个 View Transitions + HTMX 的相册应用：点击图片使用过渡动画展开详情。

---

## 延伸阅读

- [HTMX 4.0 Alpha Release Notes](https://htmx.org/posts/)
- [Fetch API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [ReadableStream MDN](https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream)
- [View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
