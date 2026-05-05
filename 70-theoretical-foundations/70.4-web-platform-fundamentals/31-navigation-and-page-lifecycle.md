---
title: '导航与页面生命周期'
description: 'Browser Navigation and Page Lifecycle: from URL input to onLoad, BFCache, Prerender, Navigation API, and Lifecycle Events'
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive technical analysis of browser navigation mechanisms and page lifecycle events, covering the full pipeline from URL input to page load, BFCache architecture, Prerender2, Navigation API, and the Page Lifecycle API with its frozen/resumed states.'
references:
  - 'W3C, Navigation Timing Level 2'
  - 'W3C, Page Visibility API'
  - 'WICG, Navigation API'
  - 'Chromium, BFCache Design Doc'
  - 'Google, Page Lifecycle API'
---

# 导航与页面生命周期

> **理论深度**: 高级
> **前置阅读**: [24-http-protocol-stack.md](24-http-protocol-stack.md), [30-resource-loading-and-performance.md](30-resource-loading-and-performance.md)
> **目标读者**: 前端架构师、浏览器开发者、性能工程师
> **核心问题**: 从用户在地址栏输入 URL 到页面完全可交互，浏览器内部经历了什么？页面在不同状态下如何行为？

---

## 目录

- [导航与页面生命周期](#导航与页面生命周期)
  - [目录](#目录)
  - [1. 导航流水线全景](#1-导航流水线全景)
    - [1.1 用户发起导航的六种路径](#11-用户发起导航的六种路径)
    - [1.2 浏览器进程内的导航阶段](#12-浏览器进程内的导航阶段)
    - [1.3 跨进程导航的复杂度](#13-跨进程导航的复杂度)
  - [2. Navigation Timing API 深度解析](#2-navigation-timing-api-深度解析)
    - [2.1 性能时间线中的导航阶段](#21-性能时间线中的导航阶段)
    - [2.2 关键指标的计算公式](#22-关键指标的计算公式)
    - [2.3 TTFB 的构成与优化](#23-ttfb-的构成与优化)
  - [3. BFCache：往返缓存架构](#3-bfcache往返缓存架构)
    - [3.1 BFCache 的核心机制](#31-bfcache-的核心机制)
    - [3.2 BFCache 的资格判定（Eligibility）](#32-bfcache-的资格判定eligibility)
    - [3.3 页面恢复与事件语义](#33-页面恢复与事件语义)
    - [3.4 BFCache 与 unload 的废弃](#34-bfcache-与-unload-的废弃)
  - [4. Prerender 与推测性导航](#4-prerender-与推测性导航)
    - [4.1 Prerender 的演进史](#41-prerender-的演进史)
    - [4.2 Speculation Rules API](#42-speculation-rules-api)
  - [5. Navigation API：现代导航控制](#5-navigation-api现代导航控制)
    - [5.1 历史管理的问题](#51-历史管理的问题)
    - [5.2 Navigation API 的核心抽象](#52-navigation-api-的核心抽象)
    - [5.3 与 SPA 路由框架的集成](#53-与-spa-路由框架的集成)
  - [6. Page Lifecycle API](#6-page-lifecycle-api)
    - [6.1 页面状态的完整状态机](#61-页面状态的完整状态机)
    - [6.2 生命周期事件](#62-生命周期事件)
    - [6.3 冻结状态的技术细节](#63-冻结状态的技术细节)
  - [7. 范畴论语义：生命周期状态机](#7-范畴论语义生命周期状态机)
  - [8. 对称差分析：旧导航模型 vs 现代模型](#8-对称差分析旧导航模型-vs-现代模型)
  - [9. 工程决策矩阵](#9-工程决策矩阵)
  - [10. 反例与局限性](#10-反例与局限性)
    - [10.1 BFCache 的不可预测性](#101-bfcache-的不可预测性)
    - [10.2 Navigation API 的跨浏览器困境](#102-navigation-api-的跨浏览器困境)
    - [10.3 Page Lifecycle 的语义模糊](#103-page-lifecycle-的语义模糊)
    - [10.4 预渲染的隐私悖论](#104-预渲染的隐私悖论)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：Navigation Timing 分析器](#示例-1navigation-timing-分析器)
    - [示例 2：BFCache 检测器](#示例-2bfcache-检测器)
    - [示例 3：页面生命周期状态机](#示例-3页面生命周期状态机)
    - [示例 4：Navigation API 路由器（渐进增强）](#示例-4navigation-api-路由器渐进增强)
    - [示例 5：Speculation Rules 生成器](#示例-5speculation-rules-生成器)
    - [示例 6：长任务与冻结感知调度器](#示例-6长任务与冻结感知调度器)
  - [参考文献](#参考文献)

---

## 1. 导航流水线全景

### 1.1 用户发起导航的六种路径

浏览器中的"导航"（Navigation）不仅指地址栏输入 URL，还包括以下六种触发路径：

1. **地址栏输入（Omnibox/Address Bar）**：用户键入 URL 或搜索关键词
2. **链接点击（`<a href>`）**：用户点击超链接
3. **表单提交（`<form>`）**：GET/POST 表单提交
4. **脚本导航**：`location.href = ...`、`window.open()`、`history.pushState()`
5. **iframe 导航**：`<iframe>` 的 src 变更或内部导航
6. **重定向（Redirect）**：服务器返回 301/302/307/308，或 Refresh 头部

每种路径在 Chromium 的 Navigation 模块中有不同的处理流程，但共享核心阶段：开始导航 → 选择 Renderer → 提交导航 → 加载完成。

### 1.2 浏览器进程内的导航阶段

在 Chromium 的多进程架构中，导航由 **Browser Process** 协调：

**阶段一：BeginNavigation**

- 浏览器进程的 UI Thread 接收导航请求
- 检查 `beforeunload` 事件：向当前页面的 Renderer Process 发送消息，询问是否允许离开
- 开始 URL 规范化（拼接 base URL、处理相对路径）
- 检查 HSTS 列表，升级 http:// → https://

**阶段二：URLRequest 启动**

- 创建 `URLRequest` 对象，交由网络栈处理
- 检查 Service Worker 拦截：查询 Service Worker 是否注册了该 scope 的 `fetch` 事件
- 如果 Service Worker 决定拦截，导航请求转为 Fetch 事件处理；否则继续网络请求

**阶段三：Redirect 处理**

- 如果收到 3xx 重定向，更新 URL，重复阶段二（有最大重定向次数限制，通常为 20 次）
- 跨域重定向时，需要重新计算 Referrer 策略和 CORS 头

**阶段四：选择或创建 Renderer**

- **Site Isolation 决策**：根据目标 URL 的 Site（eTLD+1）决定是复用现有 Renderer Process 还是创建新进程
- 如果当前页面的进程与目标页面属于同一 Site（且非跨站点 iframe 场景），可能复用进程
- 跨 Site 导航必须创建新的 Renderer Process（安全隔离要求）

**阶段五：CommitNavigation**

- 网络响应头部到达，Browser Process 向目标 Renderer Process 发送 `CommitNavigation` IPC
- Renderer Process 创建新的 `HTMLDocument` 和 `Frame`，准备接收响应体
- 旧页面的 `unload` 事件可能在此时或稍后触发（取决于 BFCache 资格）

**阶段六：加载与解析**

- Renderer Process 接收 HTML 响应体，启动 HTML5 Tokenizer（参见 14a）
- 解析、布局、绘制流水线启动（参见 14a-d）
- 触发 `DOMContentLoaded` 和 `load` 事件

### 1.3 跨进程导航的复杂度

跨 Site 导航（如从 `example.com` 到 `third-party.com`）涉及两个 Renderer Process 的协调：

- 旧 Renderer 需要保存状态（如滚动位置、表单数据），以便用户点击"后退"时恢复
- 新 Renderer 需要以最快的速度完成首次绘制（First Paint）
- Browser Process 维护 `FrameTree` 和 `RenderFrameHost` 映射，管理进程间跳转

---

## 2. Navigation Timing API 深度解析

### 2.1 性能时间线中的导航阶段

`PerformanceNavigationTiming` 接口（Level 2）提供了导航每个阶段的精确时间戳：

```
startTime           : 导航开始（通常为 0）
  ├── redirectStart : 首个重定向开始（若有）
  ├── redirectEnd   : 最后一个重定向完成
  ├── fetchStart    : 准备发起网络请求
  ├── domainLookupStart : DNS 解析开始
  ├── domainLookupEnd   : DNS 解析完成
  ├── connectStart      : TCP 连接开始
  ├── connectEnd        : TCP 连接完成（含 TLS）
  ├── secureConnectionStart : TLS 握手开始（HTTPS）
  ├── requestStart      : HTTP 请求发送
  ├── responseStart     : 首个字节到达（TTFB）
  ├── responseEnd       : 最后一个字节到达
  ├── domInteractive    : DOM 解析完成，子资源仍在加载
  ├── domContentLoadedEventStart : DCL 事件开始
  ├── domContentLoadedEventEnd   : DCL 事件结束
  ├── domComplete       : DOM 及所有子资源加载完成
  ├── loadEventStart    : window.load 开始
  └── loadEventEnd      : window.load 结束
```

### 2.2 关键指标的计算公式

| 指标 | 计算公式 | 目标值 |
|------|---------|--------|
| **TTFB** (Time to First Byte) | `responseStart - startTime` | ≤ 600ms |
| **DNS 查询时间** | `domainLookupEnd - domainLookupStart` | ≤ 100ms |
| **TCP/TLS 建立时间** | `connectEnd - connectStart` | ≤ 200ms |
| **下载时间** | `responseEnd - responseStart` | 视资源大小 |
| **DOM 解析时间** | `domInteractive - responseEnd` | 视 HTML 复杂度 |
| **DCL 延迟** | `domContentLoadedEventEnd - domInteractive` | 视脚本执行 |
| **总加载时间** | `loadEventEnd - startTime` | 视应用规模 |

### 2.3 TTFB 的构成与优化

TTFB 不仅包含网络传输，还包括服务器处理时间：

```
TTFB = 客户端到服务器的 RTT + 服务器处理时间 + 服务器到客户端的 RTT
```

服务器处理时间可能包括：

- CDN 边缘节点的缓存查找
- 源服务器的 SSR 渲染（React/Vue/Angular 的服务端渲染）
- 数据库查询（尤其当 SSR 需要实时数据时）
- API 网关的认证和路由

**优化策略**：

- 使用边缘渲染（Edge SSR）或静态站点生成（SSG）减少服务器处理时间
- 启用 CDN 缓存（Cache-Control: s-maxage）
- 使用 HTTP/2 Server Push（已废弃）或 Early Hints（103 Status）
- 流式 SSR：在服务端生成 HTML 时立即流式发送 `<head>` 和首屏内容，不必等待全部数据

---

## 3. BFCache：往返缓存架构

### 3.1 BFCache 的核心机制

**BFCache**（Back-Forward Cache，往返缓存）是浏览器为了在用户点击"后退"和"前进"按钮时提供**即时页面恢复**而设计的内存缓存机制。与 HTTP Cache 不同，BFCache 缓存的是**完整的页面状态**，包括：

- DOM Tree 和 CSSOM Tree 的序列化表示
- JavaScript 堆状态（全局变量、闭包、事件监听器）
- 渲染状态（滚动位置、缩放级别、选区）
- 视频/音频播放位置
- 表单数据

当页面进入 BFCache 时，浏览器**冻结**该页面的 Renderer Process（或特定 Frame），将其内存状态标记为"可恢复"。当用户点击后退时，浏览器**解冻**该状态，直接显示，无需重新导航、解析或执行脚本。

### 3.2 BFCache 的资格判定（Eligibility）

并非所有页面都能进入 BFCache。浏览器执行严格的资格检查，以下情况会**阻止**页面进入 BFCache：

**页面级别的阻止因素**：

- 设置了 `Cache-Control: no-store` 的 HTTP 头部
- 正在使用 `unload` 事件（旧 API，现代浏览器推荐使用 `pagehide` 替代）
- 页面中包含正在进行中的 `fetch` 或 `XMLHttpRequest`
- WebSocket 连接处于打开状态
- 使用 `BroadcastChannel` 或 `SharedWorker`（跨页面通信机制）

**脚本级别的阻止因素**：

- 通过 `window.open()` 打开了子窗口且子窗口未关闭
- 持有 `MediaSource` 或 `WebRTC` 连接
- 使用 `FileReader` 进行文件读取
- 存在未完成的 IndexedDB 事务

**Chromium 的特殊限制**：

- 如果页面的内存占用超过阈值（通常为 20-30MB），可能被拒绝进入 BFCache
- HTTP/3 连接的页面可能因 QUIC 连接状态难以序列化而被排除

### 3.3 页面恢复与事件语义

当页面从 BFCache 恢复时，浏览器触发 `pageshow` 事件，且 `event.persisted === true`：

```javascript
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // 页面从 BFCache 恢复，非全新加载
    console.log('Restored from BFCache');
  }
});
```

**开发者注意事项**：

- 不要依赖 `load` 事件来初始化应用状态（BFCache 恢复时不会触发 `load`）
- 使用 `pageshow`/`pagehide` 替代 `load`/`unload`
- 恢复后可能需要刷新数据（如时间戳、库存状态）

### 3.4 BFCache 与 unload 的废弃

`unload` 事件是 Web 平台设计中的一个历史错误：

- 它阻止了 BFCache 的使用（因为浏览器无法保证 `unload` 处理程序在缓存恢复后不会再次执行）
- 它在移动浏览器中不可靠（iOS Safari 经常忽略 `unload`）
- 现代替代方案：`pagehide`（visibilityState = hidden 时触发，persisted 标志指示是否进入缓存）

---

## 4. Prerender 与推测性导航

### 4.1 Prerender 的演进史

**Prerender** 是浏览器在用户实际导航前，提前在后台加载并渲染目标页面的技术：

- **Prerender 1.0（Chrome 13-57）**：`<link rel="prerender">`。浏览器在隐藏标签页中完整渲染页面，包括执行 JavaScript。问题：兼容差、内存开销大、测量困难。
- **NoState Prefetch（Chrome 63+）**：只下载资源并解析 HTML/CSSOM，但不执行 JavaScript 或渲染。不保存页面状态。
- **Prerender2 / Speculation Rules API（Chrome 108+）**：用 JSON 配置规则，支持更精细的触发条件和资源限制。

### 4.2 Speculation Rules API

```html
<script type="speculationrules">
{
  "prerender": [{
    "source": "list",
    "urls": ["/next-page", "/cart"]
  }, {
    "source": "document",
    "where": {
      "href_matches": "/products/*",
      "relative_to": "document"
    },
    "eagerness": "moderate"
  }]
}
</script>
```

**Eagerness 级别**：

- `conservative`：仅在用户鼠标悬停链接 200ms 后触发
- `moderate`：用户将链接加入视口时触发
- `eager`：页面加载完成后立即预渲染所有匹配链接

**隐私保护**：Prerender 页面在独立的 Renderer Process 中运行，不共享 Cookie 或存储，直到用户实际导航。这防止了跨站跟踪。

---

## 5. Navigation API：现代导航控制

### 5.1 历史管理的问题

传统的 `history.pushState()` / `history.replaceState()` API 存在以下问题：

- 导航是同步的，但实际的资源加载是异步的，导致状态不一致
- 没有内置的导航拦截机制（需手动监听 `click` 事件）
- 滚动恢复行为不可控
- 无法区分用户发起的导航和脚本发起的导航

### 5.2 Navigation API 的核心抽象

**`navigation`** 全局对象提供了对导航生命周期的完整控制：

```javascript
// 拦截导航
navigation.addEventListener('navigate', (event) => {
  if (event.destination.url.startsWith('/app/')) {
    event.intercept({
      async handler() {
        // 自定义导航处理：加载数据、更新 DOM
        const data = await fetchData(event.destination.url);
        updateApp(data);
      }
    });
  }
});
```

**关键特性**：

- **`navigate` 事件**：所有导航（链接点击、history.pushState、后退/前进、表单提交）统一触发
- **`event.intercept()`**：拦截默认导航行为，执行自定义过渡动画或数据加载
- **`NavigationTransition`**：表示进行中的导航，支持 `finished`、`committed` Promise
- **滚动行为控制**：`scroll()` 方法允许在导航完成后恢复或重置滚动位置

### 5.3 与 SPA 路由框架的集成

Navigation API 的设计目标之一是简化 SPA 路由：

- 不再需要拦截所有 `<a>` 点击事件
- 不再需要手动管理 `history` 栈
- 内置的 `transition.finished` 允许在导航完成前显示加载状态

但截至 2025-2026 年，Navigation API 仍在 Chrome/Edge 中逐步推广，Firefox 和 Safari 的支持滞后。

---

## 6. Page Lifecycle API

### 6.1 页面状态的完整状态机

现代浏览器中的页面生命周期包含以下状态：

```
ACTIVE ──► PASSIVE ──► HIDDEN ──► FROZEN ──► DISCARDED
   ▲         │          │          │
   │         ▼          ▼          ▼
   └────── RESUMED ◄─── VISIBLE ◄── THAWED
```

**ACTIVE**：页面可见且用户正在交互（当前获得焦点的标签页）
**PASSIVE**：页面可见但用户未交互（后台播放视频的标签页）
**HIDDEN**：页面不可见（用户切换到其他标签页或最小化窗口）
**FROZEN**：页面被冻结以节省 CPU/电量，JavaScript 执行暂停，定时器（setTimeout/setInterval）停止
**DISCARDED**：页面被浏览器从内存中彻底移除（BFCache 不可用时）

### 6.2 生命周期事件

| 事件 | 触发条件 | 典型用途 |
|------|---------|---------|
| `focus` / `blur` | 窗口获得/失去焦点 | 暂停/恢复键盘快捷键监听 |
| `visibilitychange` | `document.visibilityState` 变化 | 暂停/恢复动画、轮询请求 |
| `freeze` | 页面进入冻结状态 | 保存未持久化的状态，释放 Web Locks |
| `resume` | 页面从冻结恢复 | 恢复数据同步，检查数据新鲜度 |
| `pageshow` / `pagehide` | 页面显示/隐藏（含 BFCache） | 初始化/清理资源 |

### 6.3 冻结状态的技术细节

当页面进入 **FROZEN** 状态时：

- 所有 JavaScript 执行被暂停（包括 Promise 回调和 Microtask）
- `setTimeout` / `setInterval` 的计时器冻结（不累积，恢复后继续）
- `requestAnimationFrame` 回调停止
- WebSocket 连接可能被关闭（取决于浏览器策略）
- `BroadcastChannel` 消息被缓冲，恢复后递送

**开发者应对策略**：

- 使用 `sessionStorage` 或 `IndexedDB` 保存关键状态（`localStorage` 是同步 API，在 `freeze` 中可能阻塞）
- 在 `freeze` 事件中释放占用大量内存的资源（如图片 Bitmap、WebGL 上下文）
- 在 `resume` 中检查数据时效性（如库存、价格、会话状态）

---

## 7. 范畴论语义：生命周期状态机

页面生命周期可以形式化为一个**范畴** **L**，其中：

- **对象**：页面状态 {ACTIVE, PASSIVE, HIDDEN, FROZEN, DISCARDED}
- **态射**：状态转换事件 {focus, blur, visibilitychange, freeze, resume, discard}

**性质**：

- 这不是一个群胚（Groupoid），因为某些转换不可逆（如 DISCARDED 无法恢复）
- 它是一个**偏序范畴**（Posetal Category），因为任意两个状态之间最多只有一种转换路径
- **初始对象**：不存在（页面可以从任何状态开始，取决于浏览器恢复策略）
- **终止对象**：DISCARDED（所有路径最终可能导向此状态）

**函子视角**：不同浏览器（Chrome、Firefox、Safari）实现了从抽象规范范畴 **L_spec** 到具体实现范畴 **L_impl** 的函子。这些函子保持结构但不保持所有态射（如 Safari 的冻结策略比 Chrome 更激进，某些转换被省略）。

---

## 8. 对称差分析：旧导航模型 vs 现代模型

| 维度 | 旧模型（2015 年前） | 现代模型（2024+） | 交集 |
|------|------------------|-----------------|------|
| 导航控制 | `history.pushState()` + 手动拦截 | Navigation API + Speculation Rules | 客户端路由的必要性 |
| 后退恢复 | 完全重新加载页面 | BFCache 即时恢复（含 JS 状态） | `pageshow` 事件 |
| 页面隐藏 | 无标准化生命周期 | Page Lifecycle API（freeze/resume） | `visibilitychange` |
| 预渲染 | `<link rel="prerender">`（已废弃） | Speculation Rules + NoState Prefetch | 推测性加载概念 |
| 跨站导航 | 进程复用（Pre-Site Isolation） | 强制新进程（Site Isolation） | URL 解析和请求构造 |
| 会话恢复 | `unload` + `beforeunload` | `pagehide` + `freeze`/`resume` | 状态保存需求 |
| 性能度量 | `performance.timing`（已废弃） | `PerformanceNavigationTiming` Level 2 | 时间戳采集 |

---

## 9. 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| SPA 路由 | Navigation API（渐进增强） | 统一导航拦截，简化路由逻辑 | Safari/Firefox 支持滞后，需 polyfill |
| 后退即时恢复 | 避免 `unload`，使用 `pagehide` + `pageshow` | 启用 BFCache，提升后退体验 | 恢复后数据可能陈旧，需显式刷新 |
| 后台标签页数据同步 | `visibilitychange` + `requestIdleCallback` | 仅在页面可见时执行高优先级同步 | 冻结状态下定时器停止，需用 `resume` 补偿 |
| 预渲染内部链接 | Speculation Rules API（Chrome） | 精细控制，隐私安全 | 仅在 Chrome 有效，其他浏览器无支持 |
| 移动端后台保活 | `freeze`/`resume` 保存状态到 IndexedDB | 浏览器冻结页面是必然，提前保存 | 频繁写入 IndexedDB 增加能耗 |
| 跨站 iframe 嵌入 | `sandbox` + `referrerpolicy` + COOP | 多层防御，最小权限原则 | 过度限制可能破坏嵌入功能 |
| 长任务后台执行 | 迁移到 Service Worker 或 Web Worker | 主线程冻结时，Worker 可能继续运行 | Worker 也有生命周期限制 |

---

## 10. 反例与局限性

### 10.1 BFCache 的不可预测性

开发者无法强制页面进入 BFCache。即使移除了所有阻止因素，浏览器仍可能因内存压力拒绝缓存。这导致：

- 测试环境（开发者机器内存充足）与生产环境（用户低端设备）的行为差异巨大
- 依赖 BFCache 的"快速后退"体验在低内存设备上不可靠

### 10.2 Navigation API 的跨浏览器困境

Navigation API 在 2026 年仍只有 Chromium 内核浏览器完整支持。Firefox 和 Safari 的滞后意味着：

- 使用 Navigation API 的 SPA 在不支持的浏览器中需要完整的 fallback 路由系统
- 实际上增加了代码复杂度而非简化

### 10.3 Page Lifecycle 的语义模糊

`freeze` 事件的触发时机在不同浏览器中差异显著：

- Chrome：标签页隐藏 5 分钟后冻结
- Safari：更激进，可能立即冻结后台标签
- Firefox：取决于 `dom.pageThumbnails.enabled` 和内存压力

这种差异使得跨浏览器的"后台数据保存"策略难以统一。

### 10.4 预渲染的隐私悖论

Speculation Rules 的 Prerender 在独立进程中运行，不共享 Cookie。但：

- 如果预渲染页面包含个性化内容（如推荐算法），无 Cookie 的预渲染结果与实际导航结果可能不同
- 这导致用户看到"闪变"（flash of unpersonalized content）

---

## TypeScript 代码示例

### 示例 1：Navigation Timing 分析器

```typescript
interface NavigationMetrics {
  ttfb: number;
  dnsTime: number;
  connectTime: number;
  domParseTime: number;
  loadTime: number;
}

function getNavigationMetrics(): NavigationMetrics | null {
  const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!entry) return null;

  return {
    ttfb: entry.responseStart - entry.startTime,
    dnsTime: entry.domainLookupEnd - entry.domainLookupStart,
    connectTime: entry.connectEnd - entry.connectStart,
    domParseTime: entry.domInteractive - entry.responseEnd,
    loadTime: entry.loadEventEnd - entry.startTime,
  };
}

// 使用
const metrics = getNavigationMetrics();
if (metrics) {
  console.table(metrics);
}
```

### 示例 2：BFCache 检测器

```typescript
class BFCacheDetector {
  private wasRestored = false;

  constructor() {
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        this.wasRestored = true;
        console.log('Page restored from BFCache');
      }
    });

    window.addEventListener('pagehide', (e) => {
      if (e.persisted) {
        console.log('Page entering BFCache');
      }
    });
  }

  isRestored(): boolean {
    return this.wasRestored;
  }
}
```

### 示例 3：页面生命周期状态机

```typescript
type PageState = 'active' | 'passive' | 'hidden' | 'frozen';

class PageLifecycleManager {
  private state: PageState = 'active';
  private listeners: Set<(state: PageState) => void> = new Set();

  constructor() {
    document.addEventListener('visibilitychange', () => {
      this.updateState();
    });

    window.addEventListener('freeze', () => {
      this.state = 'frozen';
      this.notify();
    });

    window.addEventListener('resume', () => {
      this.updateState();
    });

    window.addEventListener('focus', () => this.updateState());
    window.addEventListener('blur', () => this.updateState());
  }

  private updateState() {
    if (document.visibilityState === 'hidden') {
      this.state = 'hidden';
    } else if (document.hasFocus()) {
      this.state = 'active';
    } else {
      this.state = 'passive';
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach(cb => cb(this.state));
  }

  onChange(callback: (state: PageState) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  getState(): PageState {
    return this.state;
  }
}
```

### 示例 4：Navigation API 路由器（渐进增强）

```typescript
class NavigationRouter {
  private routes = new Map<string, () => Promise<void>>();

  constructor() {
    if ('navigation' in window) {
      (window as any).navigation.addEventListener('navigate', (event: any) => {
        const url = new URL(event.destination.url);
        const handler = this.routes.get(url.pathname);
        if (handler) {
          event.intercept({ handler });
        }
      });
    }
  }

  register(path: string, handler: () => Promise<void>) {
    this.routes.set(path, handler);
  }

  navigate(path: string) {
    if ('navigation' in window) {
      (window as any).navigation.navigate(path);
    } else {
      history.pushState(null, '', path);
      this.routes.get(path)?.();
    }
  }
}
```

### 示例 5：Speculation Rules 生成器

```typescript
interface SpeculationRule {
  source: 'list' | 'document';
  urls?: string[];
  where?: {
    href_matches?: string;
    relative_to?: string;
  };
  eagerness?: 'conservative' | 'moderate' | 'eager';
}

class SpeculationRulesBuilder {
  private rules: { prerender: SpeculationRule[] } = { prerender: [] };

  addList(urls: string[], eagerness: SpeculationRule['eagerness'] = 'moderate') {
    this.rules.prerender.push({ source: 'list', urls, eagerness });
    return this;
  }

  addDocumentPattern(pattern: string, eagerness: SpeculationRule['eagerness'] = 'moderate') {
    this.rules.prerender.push({
      source: 'document',
      where: { href_matches: pattern, relative_to: 'document' },
      eagerness
    });
    return this;
  }

  inject() {
    const script = document.createElement('script');
    script.type = 'speculationrules';
    script.textContent = JSON.stringify(this.rules);
    document.head.appendChild(script);
  }
}
```

### 示例 6：长任务与冻结感知调度器

```typescript
class FreezeAwareScheduler {
  private queue: Array<() => void> = [];
  private frozen = false;

  constructor() {
    window.addEventListener('freeze', () => {
      this.frozen = true;
    });
    window.addEventListener('resume', () => {
      this.frozen = false;
      this.flush();
    });
  }

  schedule(task: () => void) {
    if (this.frozen) {
      this.queue.push(task);
    } else {
      requestIdleCallback(() => task());
    }
  }

  private flush() {
    while (this.queue.length > 0 && !this.frozen) {
      const task = this.queue.shift()!;
      task();
    }
  }
}
```

---

## 参考文献

1. W3C. *Navigation Timing Level 2.* W3C Recommendation. <https://www.w3.org/TR/navigation-timing-2/>
2. W3C. *Page Visibility API.* W3C Recommendation. <https://www.w3.org/TR/page-visibility/>
3. WICG. *Navigation API.* <https://wicg.github.io/navigation-api/>
4. Google. *Page Lifecycle API.* web.dev, 2024. <https://web.dev/articles/page-lifecycle-api>
5. Chromium. *Back-Forward Cache Design Doc.* Chromium Developers.
6. Google. *Speculation Rules API.* developer.chrome.com, 2024.
7. Ilya Grigorik. *High Performance Browser Networking.* O'Reilly, 2013. <https://hpbn.co/>
8. Philip Walton. *Page Lifecycle API.* Google Developers, 2018.
9. Chrome Developers. *BFCache Explainer.* <https://developer.chrome.com/docs/web-platform/bfcache/>
10. Mozilla. *Working with BFCache.* MDN Web Docs. <https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Memory_management_for_Firefox_and_add-ons>
