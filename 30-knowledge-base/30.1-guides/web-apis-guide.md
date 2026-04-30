# Web API 指南

> 2026 年现代 Web API 速查：从 View Transitions 到 Popover 的渐进增强实践。

---

## 2024–2026 新增 API

| API | 支持度 | 说明 |
|-----|--------|------|
| **View Transitions** | Chrome 126+ | 页面间平滑动画，MPA 体验提升 |
| **Popover API** | Chrome 114+, Safari 17+ | 原生弹层，自动焦点管理 |
| **Invokers** | Chrome 135+ | `commandfor` 属性触发任意元素行为 |
| **Anchor Positioning** | Chrome 125+ | 元素相对锚点定位，替代 Popper.js |
| **@starting-style** | Chrome 117+ | CSS 进入动画，无需 JS |
| **Scoped CSS** | Chrome 131+ | `@scope` 限定样式作用域 |

---

## Web API 对比表

| API | 用途 | 替代库 | 浏览器支持 | 关键特性 |
|-----|------|--------|-----------|---------|
| **Fetch API** | HTTP 请求 | Axios (部分场景) | 全现代浏览器 | 原生 Promise, Streams, AbortController |
| **Streams API** | 流式数据处理 | — | Chrome, Firefox, Safari | ReadableStream, TransformStream |
| **Broadcast Channel** | 同源页面通信 | — | 全现代浏览器 | 跨 Tab 广播消息 |
| **Web Storage** | 键值存储 | — | 全现代浏览器 | localStorage (持久), sessionStorage (会话) |
| **IndexedDB** | 结构化客户端数据库 | localForage | 全现代浏览器 | 事务, 索引, 大容量 |
| **Cache API** | HTTP 请求缓存 | — | 全现代浏览器 | Service Worker 配合离线 |
| **Web Workers** | 后台线程 | — | 全现代浏览器 | 非阻塞计算 |
| **Resize Observer** | 元素尺寸监听 | ResizeSensor | 全现代浏览器 | 性能优于轮询 |
| **Intersection Observer** | 元素可见性 | scroll 事件 | 全现代浏览器 | 懒加载/无限滚动 |
| **View Transitions** | DOM 状态切换动画 | FLIP 库 | Chrome 126+ | 页面内/跨文档过渡 |
| **Popover API** | 顶层弹层 | Tippy.js, Popper | Chrome 114+, Safari 17+ | 自动焦点, 顶层堆叠, Light Dismiss |

---

## 代码示例

### Fetch API — 现代 HTTP 请求

```javascript
// 基础 GET + 错误处理 + 超时
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') throw new Error('Request timeout');
    throw error;
  }
}

// 流式响应处理 (SSE / NDJSON)
async function* streamLines(url) {
  const response = await fetch(url);
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop(); // 保留不完整行
    for (const line of lines) {
      if (line.trim()) yield JSON.parse(line);
    }
  }
}

// Usage: 逐行处理流式 AI 输出
for await (const chunk of streamLines('/api/chat')) {
  console.log(chunk.content);
}
```

### Streams API — 管道处理

```javascript
// 压缩并上传大文件
async function compressAndUpload(file) {
  const compressed = file.stream()
    .pipeThrough(new CompressionStream('gzip'));

  await fetch('/api/upload', {
    method: 'POST',
    body: compressed,
    headers: { 'Content-Encoding': 'gzip' },
  });
}

// 自定义 TransformStream：日志脱敏
const sanitizeStream = new TransformStream({
  transform(chunk, controller) {
    const text = new TextDecoder().decode(chunk);
    const sanitized = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[REDACTED]');
    controller.enqueue(new TextEncoder().encode(sanitized));
  },
});

// 响应流式 JSON 解析（分块处理）
async function parseJSONStream(response) {
  const reader = response.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TransformStream({
      transform(chunk, controller) {
        // 假设每行一个 JSON 对象
        for (const line of chunk.split('\n')) {
          const trimmed = line.trim();
          if (trimmed) controller.enqueue(JSON.parse(trimmed));
        }
      }
    }))
    .getReader();

  const items = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    items.push(value);
  }
  return items;
}
```

### Web Storage — 结构化存储与缓存

```javascript
// localStorage：简单键值 (5–10 MB)
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');

// sessionStorage：标签页隔离
sessionStorage.setItem('formDraft', JSON.stringify({ name: 'Alice', step: 2 }));

// IndexedDB：大规模结构化数据
const db = await openDB('app-store', 1, {
  upgrade(db) {
    db.createObjectStore('documents', { keyPath: 'id' });
    db.createObjectStore('syncQueue', { keyPath: 'timestamp' });
  },
});

// 事务写入
await db.put('documents', { id: 1, content: '...', updatedAt: Date.now() });

// Cache API：Service Worker 离线缓存
const cache = await caches.open('v1');
await cache.add('/api/config');
const cached = await cache.match('/api/config');
```

### Broadcast Channel — 跨 Tab 通信

```javascript
// 创建频道（同源策略限制）
const channel = new BroadcastChannel('app_sync');

// 发送消息
channel.postMessage({ type: 'LOGIN', userId: 42 });

// 接收消息
channel.onmessage = (event) => {
  if (event.data.type === 'LOGOUT') {
    window.location.reload();
  }
};

// 清理
channel.close();

// 完整示例：跨 Tab 购物车同步
class CartSync {
  #channel = new BroadcastChannel('cart_v1');

  constructor() {
    this.#channel.onmessage = ({ data }) => {
      if (data.action === 'UPDATE') this.render(data.items);
    };
  }

  addItem(item) {
    const items = this.readCart();
    items.push(item);
    localStorage.setItem('cart', JSON.stringify(items));
    this.#channel.postMessage({ action: 'UPDATE', items });
  }

  destroy() {
    this.#channel.close();
  }
}
```

### Resize Observer — 高性能尺寸监听

```javascript
// 替代轮询与 window.resize 监听，精确到元素级别
const ro = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    const element = entry.target;

    // 响应式 Canvas 重绘
    if (element.tagName === 'CANVAS') {
      element.width = width * devicePixelRatio;
      element.height = height * devicePixelRatio;
      redrawCanvas();
    }

    // 容器查询的 JS 降级方案
    if (width < 600) element.classList.add('compact');
    else element.classList.remove('compact');
  }
});

ro.observe(document.querySelector('.responsive-container'));
ro.observe(document.querySelector('canvas'));

// 断开监听
// ro.disconnect();
```

### Intersection Observer — 懒加载与无限滚动

```javascript
// 图片懒加载（原生 loading="lazy" 的增强版）
const imageObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  }
}, { rootMargin: '200px 0px', threshold: 0.01 });

document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));

// 无限滚动触发器
const sentinel = document.querySelector('#scroll-sentinel');
const scrollObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !isLoading) {
    loadNextPage();
  }
}, { rootMargin: '100px' });
scrollObserver.observe(sentinel);
```

### View Transitions

```javascript
// 单页应用导航动画
document.startViewTransition(() => {
  updateDOM() // 更新内容
});

// 列表重排动画（可运行示例）
async function shuffleList(listEl) {
  if (!document.startViewTransition) {
    // 降级：直接重排
    listEl.append(...Array.from(listEl.children).sort(() => Math.random() - 0.5));
    return;
  }

  // View Transition 自动捕获旧状态与新状态，计算 FLIP 动画
  await document.startViewTransition(() => {
    listEl.append(...Array.from(listEl.children).sort(() => Math.random() - 0.5));
  }).finished;
}
```

### Popover API

```html
<button popovertarget="menu">打开菜单</button>
<div id="menu" popover>
  <ul><li>选项 1</li><li>选项 2</li></ul>
</div>
```

```javascript
// JS 控制 Popover（手动触发模式）
const popover = document.getElementById('menu');

// 显示（自动处理焦点、顶层堆叠、Light Dismiss）
popover.showPopover();

// 隐藏
popover.hidePopover();

// 监听事件
popover.addEventListener('toggle', (e) => {
  console.log('Popover', e.newState); // "open" | "closed"
});

// 嵌套 Popover 示例
const submenuTrigger = document.getElementById('submenu-trigger');
submenuTrigger.addEventListener('click', () => {
  document.getElementById('submenu').showPopover({
    source: submenuTrigger // 相对于触发元素定位
  });
});
```

### Anchor Positioning

```css
#tooltip {
  position: absolute;
  anchor-default: --trigger;
  inset-area: top;
}
```

```javascript
// JS 动态设置锚点（CSS Anchor Positioning API 的脚本接口）
const trigger = document.getElementById('trigger');
const tooltip = document.getElementById('tooltip');

// 通过 CSS anchor-name 关联
trigger.style.anchorName = '--my-anchor';
tooltip.style.positionAnchor = '--my-anchor';

// fallback 策略：空间不足时自动翻转
/*
#tooltip {
  position-fallback: --flip;
}

@position-fallback --flip {
  @try { inset-area: top; }
  @try { inset-area: bottom; }
}
*/
```

### Web Workers — 后台线程计算

```javascript
// worker.js
self.onmessage = ({ data }) => {
  const { type, payload } = data;
  if (type === 'HEAVY_COMPUTE') {
    let sum = 0;
    for (let i = 0; i < payload.n; i++) sum += Math.sqrt(i);
    self.postMessage({ type: 'RESULT', sum });
  }
};

// main.js
const worker = new Worker('worker.js', { type: 'module' });

worker.postMessage({ type: 'HEAVY_COMPUTE', payload: { n: 1e8 } });
worker.onmessage = ({ data }) => {
  if (data.type === 'RESULT') {
    console.log('Worker result:', data.sum);
    worker.terminate();
  }
};

// SharedWorker（同源多页面共享）
const shared = new SharedWorker('shared-worker.js');
shared.port.start();
shared.port.postMessage({ action: 'JOIN', roomId: 'room-1' });
shared.port.onmessage = (e) => console.log('Shared message:', e.data);
```

---

## 渐进增强策略

```javascript
// 特性检测
if ('startViewTransition' in document) {
  // 使用 View Transitions
} else {
  // 降级到普通更新
}

// Storage 可用性检测
function storageAvailable(type) {
  try {
    const storage = window[type];
    const x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

// Streams 回退
if (typeof CompressionStream !== 'undefined') {
  // 使用原生压缩流
} else {
  // 加载 pako.js 回退
}

// Broadcast Channel 回退到 localStorage 事件
function createCrossTabChannel(name) {
  if ('BroadcastChannel' in window) {
    return new BroadcastChannel(name);
  }
  // 降级方案：利用 storage 事件（仅限同源）
  const listeners = new Set();
  window.addEventListener('storage', (e) => {
    if (e.key === name) {
      const data = JSON.parse(e.newValue ?? '{}');
      listeners.forEach(fn => fn({ data }));
    }
  });
  return {
    postMessage: (msg) => {
      localStorage.setItem(name, JSON.stringify({ ...msg, __ts: Date.now() }));
    },
    set onmessage(fn) { listeners.add(fn); },
    close() { listeners.clear(); }
  };
}
```

---

## 参考链接

- [MDN Web APIs Reference](https://developer.mozilla.org/en-US/docs/Web/API)
- [Fetch API — Living Standard](https://fetch.spec.whatwg.org/)
- [Streams Standard](https://streams.spec.whatwg.org/)
- [View Transitions API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Popover API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API)
- [Anchor Positioning — CSS Tricks](https://css-tricks.com/css-anchor-positioning-guide/)
- [Web Storage API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [IndexedDB API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Broadcast Channel API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API)
- [Resize Observer API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [Intersection Observer API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web Workers API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Cache API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Cache)
- [Using Service Workers — MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [Can I Use — Browser Support Tables](https://caniuse.com/)
- [web.dev: View Transitions](https://developer.chrome.com/docs/web-platform/view-transitions)
- [web.dev: Popover API](https://developer.chrome.com/docs/web-platform/popover)
- [HTML Standard: Web Application APIs](https://html.spec.whatwg.org/multipage/webappapis.html)
- [WICG: Invokers API](https://open-ui.org/components/invokers.explainer/)
- [CSS Anchor Positioning — W3C](https://drafts.csswg.org/css-anchor-position/)

---

*最后更新: 2026-04-29*
