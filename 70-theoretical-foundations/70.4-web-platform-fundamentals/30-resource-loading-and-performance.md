---
title: '资源加载与性能优化'
description: 'Web Resource Loading and Performance Optimization: Resource Hints, Core Web Vitals, Priority Hints, and Browser Loading Pipeline'
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive technical analysis of browser resource loading mechanisms and performance optimization strategies, covering Resource Hints (preload/prefetch/preconnect), Core Web Vitals (LCP/CLS/INP), Priority Hints, critical rendering path optimization, and the interaction between network layer and rendering pipeline.'
references:
  - 'W3C, Resource Hints (2023)'
  - 'Google, Core Web Vitals (2024)'
  - 'Chromium, Loading Performance Architecture'
  - 'WebKit, Network Layer Design'
---

# 资源加载与性能优化

> **理论深度**: 高级
> **前置阅读**: [14a-parsing-and-layout-engine.md](../70.2-cognitive-interaction-models/14a-parsing-and-layout-engine.md), [24-http-protocol-stack.md](24-http-protocol-stack.md)
> **目标读者**: 前端性能工程师、浏览器开发者、Web 架构师
> **核心问题**: 浏览器如何决定加载什么、何时加载、以什么优先级加载？开发者如何干预这一过程？

---

## 目录

- [资源加载与性能优化](#资源加载与性能优化)
  - [目录](#目录)
  - [1. 浏览器资源加载流水线](#1-浏览器资源加载流水线)
    - [1.1 从 URL 到资源请求的完整链路](#11-从-url-到资源请求的完整链路)
    - [1.2 推测性加载：Preload Scanner](#12-推测性加载preload-scanner)
  - [2. Resource Hints 深度解析](#2-resource-hints-深度解析)
    - [2.1 Preconnect：提前建立连接](#21-preconnect提前建立连接)
    - [2.2 DNS-Prefetch：仅预解析域名](#22-dns-prefetch仅预解析域名)
    - [2.3 Prefetch：预加载后续导航资源](#23-prefetch预加载后续导航资源)
    - [2.4 Preload：强制提前加载当前页关键资源](#24-preload强制提前加载当前页关键资源)
    - [2.5 Modulepreload：ES Module 依赖图预加载](#25-modulepreloades-module-依赖图预加载)
    - [2.6 Prerender：预渲染整个页面](#26-prerender预渲染整个页面)
  - [3. Core Web Vitals 与度量模型](#3-core-web-vitals-与度量模型)
    - [3.1 LCP：最大内容绘制（Largest Contentful Paint）](#31-lcp最大内容绘制largest-contentful-paint)
    - [3.2 INP：交互到下一次绘制（Interaction to Next Paint）](#32-inp交互到下一次绘制interaction-to-next-paint)
    - [3.3 CLS：累积布局偏移（Cumulative Layout Shift）](#33-cls累积布局偏移cumulative-layout-shift)
  - [4. 资源优先级与调度](#4-资源优先级与调度)
    - [4.1 浏览器内置优先级启发式](#41-浏览器内置优先级启发式)
    - [4.2 Priority Hints：`fetchpriority` 属性](#42-priority-hintsfetchpriority-属性)
    - [4.3 HTTP/2 与 HTTP/3 的流优先级](#43-http2-与-http3-的流优先级)
  - [5. 关键渲染路径优化](#5-关键渲染路径优化)
    - [5.1 关键渲染路径（CRP）三要素](#51-关键渲染路径crp三要素)
    - [5.2 优化策略矩阵](#52-优化策略矩阵)
    - [5.3 渲染流水线与加载的交互](#53-渲染流水线与加载的交互)
  - [6. 范畴论语义：加载策略的优化格](#6-范畴论语义加载策略的优化格)
  - [7. 对称差分析：旧加载模型 vs 现代优先级模型](#7-对称差分析旧加载模型-vs-现代优先级模型)
  - [8. 工程决策矩阵](#8-工程决策矩阵)
  - [9. 反例与局限性](#9-反例与局限性)
    - [9.1 Preload 滥用的反例](#91-preload-滥用的反例)
    - [9.2 过度优化的检测成本](#92-过度优化的检测成本)
    - [9.3 Core Web Vitals 的测量盲区](#93-core-web-vitals-的测量盲区)
    - [9.4 网络层的不可控性](#94-网络层的不可控性)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：Resource Hints 生成器](#示例-1resource-hints-生成器)
    - [示例 2：LCP 观测器](#示例-2lcp-观测器)
    - [示例 3：CLS 累积计算器](#示例-3cls-累积计算器)
    - [示例 4：长任务检测器](#示例-4长任务检测器)
    - [示例 5：优先级加载队列](#示例-5优先级加载队列)
    - [示例 6：关键 CSS 提取器（简化版）](#示例-6关键-css-提取器简化版)
  - [参考文献](#参考文献)

---

## 1. 浏览器资源加载流水线

### 1.1 从 URL 到资源请求的完整链路

当浏览器解析 HTML 遇到外部资源引用时（`<link rel="stylesheet">`、`<script src>`、`<img>`、`<video>` 等），资源加载流水线启动。这个流水线可以分解为六个阶段：

**阶段一：URL 解析与规范化**

- 相对 URL 根据 `base` 元素或文档 URL 解析为绝对 URL
- 应用 HSTS（HTTP Strict Transport Security）策略，必要时将 http:// 升级为 https://
- 检查 Preload Scanner 是否已提前发起推测性请求

**阶段二：缓存查找（Cache Lookup）**

- 检查 Service Worker 的 `fetch` 拦截器（如果已注册且处于激活状态）
- 检查 HTTP Cache（磁盘缓存），匹配 URL + Vary 头部组合
- 检查内存缓存（Memory Cache，如 base64 图片、已解码的脚本）
- 检查 `prefetch` / `prerender` 的预加载缓存

**阶段三：DNS 解析**

- 检查 DNS 缓存（浏览器缓存 → OS 缓存 → 路由器缓存 → ISP DNS）
- 如果启用 HTTP/3，解析 Alt-Svc 或 SVCB/HTTPS DNS 记录
- Happy Eyeballs：IPv6 和 IPv4 并行尝试，优先使用更快建立的连接

**阶段四：连接建立**

- 复用现有 TCP 连接（HTTP/1.1 Keep-Alive 或 HTTP/2 多路复用）
- 如需新连接：TCP 三次握手（1-RTT）+ TLS 握手（1-2 RTT）
- HTTP/3 通过 QUIC 实现 0-RTT 或 1-RTT 连接恢复

**阶段五：请求与响应**

- 构造 HTTP 请求报文（方法、头部、优先级信息）
- HTTP/2：将请求映射到流（Stream），通过 HPACK 压缩头部
- HTTP/3：通过 QUIC 流独立传输，避免 TCP 队头阻塞
- 接收响应：解压缩（gzip/Brotli/zstd）、解析、解码

**阶段六：资源处理与交付**

- CSS：解析为 CSSOM，加入样式计算流水线
- JavaScript：解析、编译（V8 的 Streaming Compilation）、执行
- 图片：解码（JPEG 的 IDCT、WebP 的 VP8、AVIF 的 AV1），创建 Image Bitmap
- 字体：子集化、hinting、字形光栅化

### 1.2 推测性加载：Preload Scanner

**Preload Scanner**（又称 **Lookahead Scanner** 或 **Speculative Parser**）是浏览器资源加载的关键优化机制。它在主解析器（Main Parser）因遇到 `<script>` 而阻塞时，作为一个独立的轻量级扫描器继续向前查看 HTML 字节流，发现外部资源引用并提前发起网络请求。

**工作机制**：

- 维护一个独立的状态机，只识别标签名和关键属性（`src`、`href`、`rel`、`url()`）
- 不构建完整的 DOM Tree，不进行 CSS 选择器匹配
- 发现资源后立即提交给 Resource Dispatcher，但**不执行**脚本或应用样式

**局限性**：

- 无法发现由 JavaScript 动态创建的资源（如 `document.createElement('script')`）
- 无法解析 CSS 中的 `@import` 或 `background-image`（除非主解析器已构建部分 CSSOM）
- 对 `<picture>` 的 `srcset` 和 `sizes` 支持有限（需要视口信息）

---

## 2. Resource Hints 深度解析

### 2.1 Preconnect：提前建立连接

`<link rel="preconnect">` 指示浏览器提前建立到目标域名的 DNS 解析、TCP 连接和 TLS 握手。它将连接建立的延迟（通常 100-300ms）从关键路径中移除。

**最佳实践**：

- 对页面即将请求的第三方域（CDN、字体服务、API 网关）使用 preconnect
- 不要过度使用：每个 preconnect 消耗系统资源（套接字、TLS 会话缓存），Chrome 限制最多 6-8 个预连接
- 配合 `crossorigin` 属性处理 CORS 资源（如 Google Fonts）

### 2.2 DNS-Prefetch：仅预解析域名

`<link rel="dns-prefetch">` 是 preconnect 的轻量级版本，仅执行 DNS 解析而不建立 TCP/TLS 连接。适用于页面可能请求但不确定何时请求的子资源域。

### 2.3 Prefetch：预加载后续导航资源

`<link rel="prefetch">` 请求一个可能在**后续页面导航**中使用的资源。浏览器以**最低优先级**在空闲时间下载该资源，并存入 HTTP Cache。

**关键约束**：

- prefetch 的资源仅在跨页面导航时可用（不适用于当前页面的资源加载）
- 浏览器可能完全忽略 prefetch（尤其在低电量模式或数据节省模式）
- 错误的 prefetch 会浪费带宽（如预加载了用户永远不会访问的页面资源）

### 2.4 Preload：强制提前加载当前页关键资源

`<link rel="preload">` 是开发者对浏览器加载优先级的**最强干预**。它强制浏览器立即以**高优先级**下载指定资源，无论主解析器是否已遇到该资源。

**使用场景**：

- CSS 中的 `@font-face` 字体（避免 FOIT/FOUT）
- 通过 CSS `background-image` 引用的首屏关键图片
- 动态加载的模块（如 `import()` 的路径预加载）
- 视频首帧的 poster 图片

**必须指定 `as` 属性**：`as="script"`、`as="style"`、`as="font"`、`as="image"` 等。浏览器根据 `as` 值决定正确的 Content-Type 检查、CORS 策略和优先级。

**配合 `crossorigin`**：对于 CORS 资源（尤其是字体），preload 和实际请求必须使用相同的 CORS 模式，否则浏览器会下载两次。

### 2.5 Modulepreload：ES Module 依赖图预加载

`<link rel="modulepreload">` 专门针对 ES Module 的依赖图。它不仅预加载指定的模块文件，还会**递归解析和预加载**其静态 `import` 依赖。

**与 preload 的区别**：

- preload 只下载一个文件，不解析其内容
- modulepreload 下载并解析模块，构建模块图中的所有静态依赖列表，提前加载整个依赖子树

### 2.6 Prerender：预渲染整个页面

`<link rel="prerender">` 是最高级别的推测性优化：浏览器在隐藏标签页中完整加载并渲染目标页面，包括执行 JavaScript、应用样式、运行布局。

**状态演变**：

- 早期 Chromium 支持完整 prerender，但兼容性差且内存开销大
- 现代 Chrome 使用 **NoState Prefetch**：只下载资源并解析 DOM/CSSOM，但不执行 JavaScript 或渲染，状态不保存
- **Speculation Rules API**（Chrome 108+）：用 JSON 配置更精细的预渲染策略，支持条件触发（如鼠标悬停 200ms 后）

---

## 3. Core Web Vitals 与度量模型

### 3.1 LCP：最大内容绘制（Largest Contentful Paint）

**LCP** 度量视口内最大可见元素（图片、视频 poster、背景图、块级文本）的渲染时间。目标：**≤2.5秒**（Good）、≤4.0秒（Needs Improvement）、>4.0秒（Poor）。

**LCP 元素候选**：

- `<img>` 元素
- `<image>` inside `<svg>`
- `<video>` 的 poster 图片
- 通过 `url()` 加载的背景图片（仅 CSS 背景在视口内时）
- 块级元素中的文本节点

**优化策略**：

- 减少服务器响应时间（TTFB）
- 优化资源加载距离：将 LCP 图片放在 HTML 中而非 CSS 背景中，使用 `fetchpriority="high"`
- 消除渲染阻塞资源：内联关键 CSS，延迟非关键 JavaScript
- 优化图片尺寸和格式：使用响应式图片（`srcset`）、现代格式（AVIF/WebP）

### 3.2 INP：交互到下一次绘制（Interaction to Next Paint）

**INP**（取代 FID）度量页面对用户交互（点击、触摸、键盘输入）的响应延迟。它捕获整个交互生命周期中的**最长延迟帧**。

**交互生命周期**：

1. **输入延迟（Input Delay）**：用户事件到达主线程到事件处理程序开始执行的时间。如果主线程被长任务阻塞，输入延迟会增加。
2. **处理时间（Processing Time）**：事件处理程序本身的执行时间。
3. **呈现延迟（Presentation Delay）**：事件处理完成后到浏览器完成下一帧绘制的时间。

**目标**：INP ≤ 200ms（Good）、≤ 500ms（Needs Improvement）、> 500ms（Poor）

**优化策略**：

- 减少主线程长任务（>50ms）：使用 `scheduler.yield()` 或 `setTimeout` 分解大任务
- 优化事件处理程序：避免在输入事件中触发强制同步布局（FSL）
- 使用 `requestIdleCallback` 或 `scheduler.postTask` 调度低优先级工作

### 3.3 CLS：累积布局偏移（Cumulative Layout Shift）

**CLS** 度量页面生命周期中所有**意外布局偏移**的累积分数。意外偏移指非由用户交互（如点击展开按钮）引起的可见元素位置变化。

**计算方式**：

```
CLS = Σ (impact_fraction × distance_fraction)
```

- **Impact Fraction**：不稳定元素在视口中占据的面积比例
- **Distance Fraction**：元素移动距离与视口最大维度的比值

**常见 CLS 来源**：

- 图片/视频/iframe 没有预设尺寸（`width`/`height` 或 `aspect-ratio`）
- Web 字体加载导致文本回流（FOUT/FOIT）
- 动态注入的广告或嵌入内容
- 异步加载的内容（如 A/B 测试变体）

**优化策略**：

- 为所有媒体元素设置 `width` 和 `height` 属性（或使用 CSS `aspect-ratio`）
- 为动态内容预留空间（skeleton placeholder）
- 使用 `font-display: optional` 或预加载关键字体

---

## 4. 资源优先级与调度

### 4.1 浏览器内置优先级启发式

浏览器根据资源类型和位置分配默认优先级：

| 资源类型 | 优先级 | 理由 |
|---------|--------|------|
| `<head>` 中的 CSS | Highest | 阻塞渲染 |
| `<head>` 中的 `<script>`（非 async/defer） | High | 阻塞解析 |
| `<body>` 中的 `<script>`（非 async/defer） | Medium | 可能阻塞，但非首屏关键 |
| `preload` 资源 | High/Auto | 根据 `as` 属性决定 |
| `<img>`（首屏可见） | High | LCP 候选 |
| `<img>`（视口外） | Low | 延迟加载候选 |
| `@font-face` | High → Low | 初始高优先级，超时后降级 |
| `fetch()` / XHR | High | 通常由应用逻辑驱动 |
| `prefetch` 资源 | Lowest | 推测性加载 |

### 4.2 Priority Hints：`fetchpriority` 属性

**`fetchpriority="high" | "low" | "auto"`** 允许开发者覆盖浏览器的默认优先级启发式：

- 对首屏 LCP 图片使用 `fetchpriority="high"`，确保它与 CSS 同时加载
- 对非关键脚本或视口外图片使用 `fetchpriority="low"`，避免挤占带宽
- 对 `fetch()` 请求使用，优化 API 调用与资源加载的竞争关系

**限制**：Priority Hints 是**建议性**的，浏览器仍保留最终调度决策权。在 HTTP/2 中，它映射为流的权重；在 HTTP/3 中，影响 QUIC 流的调度顺序。

### 4.3 HTTP/2 与 HTTP/3 的流优先级

**HTTP/2**：使用依赖树和权重（weight）来调度流。高权重流获得更多带宽份额。浏览器的资源优先级直接映射为流的权重。

**HTTP/3**：QUIC 的流是独立的，没有 HTTP/2 的依赖树概念。优先级通过发送方的流调度策略实现（如 Chromium 的 BBR 拥塞控制 + 流优先级队列）。

---

## 5. 关键渲染路径优化

### 5.1 关键渲染路径（CRP）三要素

关键渲染路径是浏览器将 HTML/CSS/JS 转换为屏幕像素所需的最小资源链：

1. **DOM Tree**：由 HTML 解析生成
2. **CSSOM Tree**：由 CSS 解析生成
3. **Render Tree**：DOM + CSSOM 的交集，只包含可见节点

CRP 的阻塞资源：

- **CSS 阻塞渲染**：浏览器必须等待所有 CSS 资源下载并解析完成后才能构建 Render Tree。没有 CSSOM，浏览器不知道元素的样式。
- **JavaScript 阻塞解析**：同步 `<script>` 会暂停 HTML 解析器，等待脚本下载和执行完成（因为脚本可能通过 `document.write()` 修改 DOM）。

### 5.2 优化策略矩阵

| 策略 | 适用场景 | 实现方式 |
|------|---------|---------|
| 内联关键 CSS | 首屏样式 < 14KB（gzip） | `<style>` 标签内联关键路径 CSS，剩余 CSS 异步加载 |
| 异步加载非关键 CSS | 打印样式、主题变体 | `<link rel="preload" as="style" onload="this.rel='stylesheet'">` |
| `defer` 属性 | 依赖 DOM 的脚本 | `<script defer>`：延迟到 HTML 解析完成后、DOMContentLoaded 之前执行 |
| `async` 属性 | 独立脚本（如分析代码） | `<script async>`：下载不阻塞解析，下载完成后立即执行（可能阻塞渲染） |
| `type="module"` | ES Module | 默认 defer 行为，可使用 `async` 覆盖 |
| 代码分割 | 大型 SPA | 路由级动态导入 `import()`，只加载当前路由代码 |
| 服务端渲染（SSR） | 内容密集型应用 | 在服务端完成初始 HTML 渲染，减少客户端 CRP 长度 |

### 5.3 渲染流水线与加载的交互

资源加载和渲染并非完全串行。现代浏览器的优化包括：

- **渐进式渲染**：浏览器在接收到部分 HTML/CSS 后就开始构建和绘制 Render Tree，不必等待全部资源
- **分块传输（Chunked Transfer）**：服务器通过 HTTP chunked encoding 流式发送 HTML，浏览器可以逐步解析和渲染
- **推测性解析**：Preload Scanner 在解析器阻塞时继续发现资源

---

## 6. 范畴论语义：加载策略的优化格

资源加载策略可以形式化为**偏序集（Poset）**上的优化问题：

**对象**：加载策略集合 S = {无优化, dns-prefetch, preconnect, prefetch, preload, prerender}

**偏序关系** ≤：策略 A ≤ 策略 B，当且仅当 B 的资源消耗 ≥ A 的资源消耗，且 B 的优化效果 ≥ A 的优化效果

```
无优化 ≤ dns-prefetch ≤ preconnect ≤ {prefetch, preload} ≤ prerender
```

注意 `prefetch` 和 `preload` 是不可比的（incomparable）：

- `preload` 消耗更多即时带宽，但优化当前页面的关键路径
- `prefetch` 消耗空闲带宽，但优化的是后续导航

这构成了一个**格（Lattice）**，其中：

- **meet（下确界）**：两种策略的交集效果
- **join（上确界）**：两种策略的并集资源消耗

**单调性定理**：如果策略 A ≤ 策略 B，那么对于任意资源集合 R，B 的完成时间 ≤ A 的完成时间（在资源不受限的理想条件下）。然而，实际浏览器中资源受限，join 操作可能导致过度竞争，反而增加完成时间。

---

## 7. 对称差分析：旧加载模型 vs 现代优先级模型

| 维度 | 旧模型（HTTP/1.1 时代） | 现代模型（HTTP/2+ 时代） | 交集 |
|------|----------------------|------------------------|------|
| 并发连接 | 每域 6-8 个 TCP 连接 | 单一 TCP 连接上的多路复用 | 域名分片（sharding）作为过时优化 |
| 优先级 | 无显式优先级，先到先得 | 流权重 + fetchpriority + 启发式 | 资源类型识别 |
| 推测性加载 | 几乎无（除 DNS 预解析） | Preload Scanner + Resource Hints + Speculation Rules | 无 |
| 关键路径干预 | 开发者无法干预 | preload、modulepreload、fetchpriority | 无 |
| 度量反馈 | 无标准化性能度量 | Core Web Vitals + Long Tasks API + Resource Timing | Performance Timeline API |
| 字体加载 | 同步阻塞（FOIT） | font-display + preload 字体 | @font-face 规则 |
| 脚本加载 | 阻塞解析 | async/defer/module + 代码分割 | `<script>` 标签 |

---

## 8. 工程决策矩阵

| 场景 | 推荐策略 | 理由 | 风险 |
|------|---------|------|------|
| 首屏关键字体 | `preload` + `font-display: swap` | 消除 FOIT，确保文本立即可见 | 预加载非关键字重会浪费带宽 |
| 第三方分析脚本 | `async` 或 `defer` | 不阻塞解析，加载完成后执行 | 可能延迟数据收集，影响实时分析 |
| 路由级 SPA 代码 | 动态 `import()` + `modulepreload` | 只加载当前路由代码，预加载关键模块 | 代码分割粒度需要精细设计 |
| 图片懒加载 | `loading="lazy"` + 占位符 | 视口外图片不加载，减少初始带宽 | 快速滚动时可能出现空白（需配合预加载距离调整）|
| 后续页面资源 | `prefetch` | 空闲时预加载，不竞争当前页面带宽 | 导航可能不发生，预加载浪费 |
| 第三方 API 调用 | `preconnect` | 提前建立连接，减少首次 API 调用延迟 | 每个 preconnect 消耗系统资源，过量导致连接池耗尽 |
| 大量小图标 | SVG Sprite 或 Icon Font | 减少 HTTP 请求数 | 首屏只需部分图标时，Sprite 包含无用数据 |
| HTTP/2 服务器推送 | **不推荐**（已废弃） | Chrome 已移除支持，缓存匹配困难 | 推送给浏览器已缓存的资源会浪费带宽 |

---

## 9. 反例与局限性

### 9.1 Preload 滥用的反例

某电商网站为了"优化性能"，给首屏的 20 张图片都添加了 `preload` 和 `fetchpriority="high"`。结果是：

- 所有 20 张图片竞争相同的最高优先级，实际上等于没有优先级区分
- CSS 文件被挤到低优先级队列，导致 Render Tree 构建延迟
- LCP 从 1.8s 恶化到 3.2s

**教训**：`preload` 和 `fetchpriority` 是**稀缺信号**，应该只用于真正的关键资源。

### 9.2 过度优化的检测成本

Resource Hints 本身需要解析和执行。在包含数百个 `<link rel="preconnect">` 的页面中：

- 额外的 DOM 节点增加解析时间
- 大量预连接占用套接字和内存
- Chrome 会主动忽略超出限制的 preconnect

### 9.3 Core Web Vitals 的测量盲区

- **Lab Data vs Field Data**：Lighthouse 的 Lab Data 在受控环境运行，无法反映真实用户的网络条件和设备性能。Field Data（CrUX）基于真实用户，但延迟 28 天更新。
- **SPA 的 INP 困境**：单页应用的 INP 可能在路由切换时才暴露问题，而 CrUX 按页面 URL 聚合，可能掩盖路由级性能问题。
- **CLS 的用户交互豁免**：用户点击后 500ms 内的布局偏移不计入 CLS，但某些设计模式（如点击后异步加载内容）可能在此窗口期外造成偏移。

### 9.4 网络层的不可控性

开发者可以优化资源加载策略，但无法控制：

- 用户的网络类型和信号强度（4G/5G/WiFi 切换）
- ISP 的 DNS 解析速度和缓存策略
- CDN 节点的地理分布和负载状况
- 浏览器的内部缓存驱逐策略（尤其在内存压力下）

---

## TypeScript 代码示例

### 示例 1：Resource Hints 生成器

```typescript
interface ResourceHint {
  rel: 'dns-prefetch' | 'preconnect' | 'prefetch' | 'preload' | 'modulepreload';
  href: string;
  as?: string;
  crossorigin?: 'anonymous' | 'use-credentials';
  fetchpriority?: 'high' | 'low' | 'auto';
}

class ResourceHintManager {
  private hints: Set<string> = new Set();

  add(hint: ResourceHint): boolean {
    const key = `${hint.rel}|${hint.href}`;
    if (this.hints.has(key)) return false;
    this.hints.add(key);

    const link = document.createElement('link');
    link.rel = hint.rel;
    link.href = hint.href;
    if (hint.as) link.as = hint.as;
    if (hint.crossorigin) link.crossOrigin = hint.crossorigin;
    if (hint.fetchpriority) {
      (link as any).fetchPriority = hint.fetchpriority;
    }
    document.head.appendChild(link);
    return true;
  }

  preconnectForCORS(url: string) {
    this.add({ rel: 'preconnect', href: new URL(url).origin, crossorigin: 'anonymous' });
  }

  preloadFont(url: string) {
    this.add({ rel: 'preload', href: url, as: 'font', crossorigin: 'anonymous' });
  }
}
```

### 示例 2：LCP 观测器

```typescript
function observeLCP(callback: (entry: PerformanceEntry) => void) {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    callback(lastEntry);
  });
  observer.observe({ entryTypes: ['largest-contentful-paint'] });
  return observer;
}

// 使用
observeLCP((entry) => {
  console.log('LCP:', entry.startTime, 'ms');
  console.log('LCP Element:', (entry as any).element?.tagName);
});
```

### 示例 3：CLS 累积计算器

```typescript
class CLSCalculator {
  private clsValue = 0;
  private sessionEntries: PerformanceEntry[] = [];
  private sessionMax = 0;

  start() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          this.sessionEntries.push(entry);
          const value = (entry as any).value;
          this.clsValue += value;

          // 计算滑动窗口最大值（最新 5 条）
          const windowSum = this.sessionEntries
            .slice(-5)
            .reduce((sum, e) => sum + (e as any).value, 0);
          this.sessionMax = Math.max(this.sessionMax, windowSum);
        }
      }
    });
    observer.observe({ entryTypes: ['layout-shift'] });
    return observer;
  }

  getCLS(): { total: number; sessionMax: number } {
    return { total: this.clsValue, sessionMax: this.sessionMax };
  }
}
```

### 示例 4：长任务检测器

```typescript
function observeLongTasks(threshold = 50) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const duration = entry.duration;
      if (duration > threshold) {
        console.warn(`Long task detected: ${duration.toFixed(1)}ms`, {
          startTime: entry.startTime,
          attribution: (entry as any).attribution,
        });
      }
    }
  });
  observer.observe({ entryTypes: ['longtask'] });
  return observer;
}
```

### 示例 5：优先级加载队列

```typescript
type ResourcePriority = 'critical' | 'important' | 'normal' | 'lazy';

interface QueuedResource {
  url: string;
  priority: ResourcePriority;
  type: 'image' | 'script' | 'style' | 'font' | 'fetch';
}

class PriorityLoader {
  private queue: QueuedResource[] = [];
  private concurrency = 6;
  private running = 0;

  private priorityWeight: Record<ResourcePriority, number> = {
    critical: 4,
    important: 3,
    normal: 2,
    lazy: 1,
  };

  add(resource: QueuedResource) {
    this.queue.push(resource);
    this.queue.sort((a, b) => this.priorityWeight[b.priority] - this.priorityWeight[a.priority]);
    this.drain();
  }

  private async drain() {
    if (this.running >= this.concurrency) return;
    const resource = this.queue.shift();
    if (!resource) return;

    this.running++;
    try {
      const response = await fetch(resource.url, {
        priority: resource.priority === 'critical' ? 'high' : 'auto',
      });
      console.log(`Loaded [${resource.priority}] ${resource.url}`);
      return response;
    } finally {
      this.running--;
      this.drain();
    }
  }
}
```

### 示例 6：关键 CSS 提取器（简化版）

```typescript
function extractCriticalCSS(
  html: string,
  cssRules: CSSStyleRule[],
  viewportWidth = 1920,
  viewportHeight = 1080
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const criticalRules: string[] = [];

  for (const rule of cssRules) {
    try {
      const elements = doc.querySelectorAll(rule.selectorText);
      for (const el of Array.from(elements)) {
        const rect = (el as HTMLElement).getBoundingClientRect?.();
        const isVisible = rect &&
          rect.top < viewportHeight &&
          rect.bottom > 0 &&
          rect.left < viewportWidth &&
          rect.right > 0;

        if (isVisible) {
          criticalRules.push(`${rule.selectorText} { ${rule.style.cssText} }`);
          break;
        }
      }
    } catch {
      // 忽略无效选择器
    }
  }

  return criticalRules.join('\n');
}
```

---

## 参考文献

1. W3C. *Resource Hints.* W3C Working Draft, 2023. <https://www.w3.org/TR/resource-hints/>
2. Google. *Core Web Vitals.* web.dev, 2024. <https://web.dev/articles/vitals>
3. Google. *Optimize LCP.* web.dev, 2024. <https://web.dev/articles/optimize-lcp>
4. Google. *Optimize CLS.* web.dev, 2024. <https://web.dev/articles/optimize-cls>
5. Google. *Optimize INP.* web.dev, 2024. <https://web.dev/articles/inp>
6. Chromium. *Loading Performance Architecture.* Chromium Design Docs.
7. Ilya Grigorik. *High Performance Browser Networking.* O'Reilly, 2013. <https://hpbn.co/>
8. Addy Osmani. *The Cost of JavaScript.* Google Developers, 2018. <https://v8.dev/blog/cost-of-javascript-2019>
9. WebKit. *Network Layer and Resource Loading.* WebKit Blog.
10. Chrome Developers. *Speculation Rules API.* developer.chrome.com, 2024.
