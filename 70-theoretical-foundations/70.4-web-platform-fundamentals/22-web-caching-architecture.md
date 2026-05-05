---
title: "Web Caching Architecture: Protocol Semantics, Storage APIs, and Coherence Models"
description: "A comprehensive deep dive into web caching from HTTP protocol semantics through browser storage APIs to cache coherence and categorical semantics"
last-updated: 2026-05-05
status: complete
priority: P0
actual-length: ~15000 words
english-abstract: "This document provides a comprehensive technical analysis of Web Caching Architecture across the entire browser-to-CDN stack. The theoretical contribution lies in unifying HTTP caching semantics (RFC 9111/7234), Service Worker Cache API strategies, browser storage mechanisms (IndexedDB, LocalStorage, OPFS), and cache coherence models under a single analytical framework. We rigorously examine Cache-Control directives, validator mechanisms (ETag/Last-Modified), heuristic caching fallbacks, and cache invalidation strategies including purge, ban, and surrogate keys. The Service Worker section reconstructs standard cache strategies (CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly) as decision-theoretic policies with formal preconditions and postconditions. We compare browser storage APIs across dimensions of capacity, transactionality, asynchronicity, and same-origin boundaries, providing quantitative performance characteristics where available. A novel categorical semantics section models caching as an idempotent endofunctor on a category of resource states, establishing that cache invalidation corresponds precisely to the unit of a comonad and that symmetric difference between cached and canonical representations forms a natural transformation. We analyze post-Spectre cache partitioning (double-keyed caching), CHIPS (Partitioned cookies), and the interaction between CDN edge caching and browser private caching. Engineering decision matrices, TypeScript implementations including a CacheStorage wrapper with TTL semantics, an HTTP cache validator implementing RFC 9111 conditional request logic, an IndexedDB query optimizer with index selection heuristics, a storage quota estimator, a cache strategy benchmark harness, and a double-keyed cache simulator provide runnable reference implementations. Boundary case analysis and counter-examples clarify when caching intuition fails, including Vary header complexity, opaque response limitations, and quota eviction non-determinism."
references:
  - RFC 9111: HTTP Caching (2022)
  - RFC 7234: Hypertext Transfer Protocol (HTTP/1.1): Caching (2014)
  - RFC 6265: HTTP State Management Mechanism (2011)
  - RFC 6265bis: Cookies: HTTP State Management Mechanism (draft-ietf-httpbis-rfc6265bis-15)
  - WHATWG HTML Living Standard: Web Storage, Service Workers, File System Access API
  - W3C Indexed Database API 3.0
  - Chrome Storage Quota API documentation
  - Mozilla MDN Web Docs: HTTP Caching, CacheStorage, IndexedDB, OPFS
  - Fielding, Architectural Styles and the Design of Network-based Software Architectures (2000)
  - Vercel Edge Cache documentation; Cloudflare Cache API documentation; Fastly VCL/Surrogate-Key documentation
  - "Cache Digests for HTTP/2" (RFC 9213)
  - Google Developers: "Prevent unnecessary network requests with the HTTP Cache"
  - Jake Archibald: "Caching best practices & max-age gotchas"
  - Apple WebKit Blog: "Preventing Tracking Prevention Tracking" (cache partitioning)
  - Chromium Design Docs: "HttpCache Partitioning"
---

> **Executive Summary**: This document unifies the fragmented landscape of web caching—from HTTP protocol semantics to browser storage APIs to CDN edge behavior—under a single rigorous analytical framework. We examine how Cache-Control directives encode time-to-live semantics, how ETag and Last-Modified enable conditional validation, and how heuristic caching fills gaps in explicit metadata. Service Worker cache strategies are formalized as decision policies with explicit preconditions. Browser storage APIs (IndexedDB, LocalStorage, OPFS) are compared across transactional, capacity, and performance dimensions. A categorical semantics section models caching as an idempotent endofunctor, connecting engineering practice to mathematical structure. Post-Spectre security mechanisms including double-keyed cache partitioning and CHIPS cookies are analyzed as coherence-preserving restrictions. Six production-grade TypeScript examples demonstrate practical implementations, and an engineering decision matrix guides technology selection.

# Web Caching Architecture

> **理论深度**: 高级（协议规范 + 形式语义 + 工程实践）
> **目标读者**: 高级前端/全栈工程师、浏览器引擎开发者、CDN 架构师
> **建议阅读时间**: 90 分钟
> **前置知识**: HTTP/1.1 与 HTTP/2 基础、TypeScript 高级类型、基础范畴论概念

---

## 目录

- [Web Caching Architecture](#web-caching-architecture)
  - [目录](#目录)
  - [0. 从缓存的普遍性问题开始](#0-从缓存的普遍性问题开始)
  - [1. HTTP Caching 协议语义](#1-http-caching-协议语义)
    - [1.1 缓存存储模型：私有、共享与中介](#11-缓存存储模型私有共享与中介)
    - [1.2 Cache-Control 指令的完全解析](#12-cache-control-指令的完全解析)
    - [1.3 Expires 与 Age：时间语义的两面](#13-expires-与-age时间语义的两面)
    - [1.4 验证器机制：ETag 与 Last-Modified](#14-验证器机制etag-与-last-modified)
    - [1.5 条件请求：If-None-Match 与 If-Modified-Since](#15-条件请求if-none-match-与-if-modified-since)
    - [1.6 Vary 头：多维缓存键的复杂性](#16-vary-头多维缓存键的复杂性)
    - [1.7 启发式缓存：RFC 7234 的回退策略](#17-启发式缓存rfc-7234-的回退策略)
  - [2. 缓存失效策略](#2-缓存失效策略)
    - [2.1 失效三角与菲尔·卡尔顿定律](#21-失效三角与菲尔卡尔顿定律)
    - [2.2 Purge、Ban 与 Surrogate Keys](#22-purgeban-与-surrogate-keys)
    - [2.3 主动失效 vs 被动失效](#23-主动失效-vs-被动失效)
  - [3. Service Worker 与 Cache API](#3-service-worker-与-cache-api)
    - [3.1 CacheStorage 与 Cache 对象模型](#31-cachestorage-与-cache-对象模型)
    - [3.2 标准策略的形式化描述](#32-标准策略的形式化描述)
    - [3.3 策略选择与性能权衡](#33-策略选择与性能权衡)
  - [4. 浏览器存储 API 深度比较](#4-浏览器存储-api-深度比较)
    - [4.1 IndexedDB：结构化的事务型存储](#41-indexeddb结构化的事务型存储)
    - [4.2 LocalStorage / SessionStorage：同步 API 的性能陷阱](#42-localstorage--sessionstorage同步-api-的性能陷阱)
    - [4.3 Cookie 存储：安全属性的组合爆炸](#43-cookie-存储安全属性的组合爆炸)
    - [4.4 OPFS：Origin Private File System](#44-opfsorigin-private-file-system)
  - [5. 范畴语义：缓存作为幂等自函子](#5-范畴语义缓存作为幂等自函子)
    - [5.1 资源状态范畴](#51-资源状态范畴)
    - [5.2 缓存函子的构造](#52-缓存函子的构造)
    - [5.3 缓存与 Comonad](#53-缓存与-comonad)
    - [5.4 对称差与自然变换](#54-对称差与自然变换)
  - [6. 对称差分析：缓存一致性的度量](#6-对称差分析缓存一致性的度量)
    - [6.1 对称差作为不一致度量](#61-对称差作为不一致度量)
    - [6.2 时间衰减与 TTL 的数学模型](#62-时间衰减与-ttl-的数学模型)
    - [6.3 概率一致性模型](#63-概率一致性模型)
  - [7. 缓存分区与双重键控](#7-缓存分区与双重键控)
    - [7.1 Spectre 后的安全模型](#71-spectre-后的安全模型)
    - [7.2 双重键控的实现细节](#72-双重键控的实现细节)
    - [7.3 对 CDN 与第三方资源的影响](#73-对-cdn-与第三方资源的影响)
  - [8. CDN 缓存与浏览器缓存的交互](#8-cdn-缓存与浏览器缓存的交互)
    - [8.1 分层缓存拓扑](#81-分层缓存拓扑)
    - [8.2 Cache-Control 指令的层间传播](#82-cache-control-指令的层间传播)
    - [8.3 SWR (Stale-While-Revalidate) 的边缘扩展](#83-swr-stale-while-revalidate-的边缘扩展)
  - [9. Storage Quota API 与持久化策略](#9-storage-quota-api-与持久化策略)
    - [9.1 estimate() API 与配额模型](#91-estimate-api-与配额模型)
    - [9.2 持久化存储与驱逐策略](#92-持久化存储与驱逐策略)
    - [9.3 跨浏览器的配额差异](#93-跨浏览器的配额差异)
  - [10. 工程决策矩阵](#10-工程决策矩阵)
    - [10.1 决策维度定义](#101-决策维度定义)
    - [10.2 场景化决策路径](#102-场景化决策路径)
  - [11. 反例与边界情况](#11-反例与边界情况)
    - [11.1 何时缓存会失败](#111-何时缓存会失败)
    - [11.2 Opaque Response 陷阱](#112-opaque-response-陷阱)
    - [11.3 配额驱逐的非确定性](#113-配额驱逐的非确定性)
  - [12. TypeScript 参考实现](#12-typescript-参考实现)
    - [12.1 CacheStorage TTL 包装器](#121-cachestorage-ttl-包装器)
    - [12.2 HTTP 缓存验证器](#122-http-缓存验证器)
    - [12.3 IndexedDB 查询优化器](#123-indexeddb-查询优化器)
    - [12.4 存储配额估算器](#124-存储配额估算器)
    - [12.5 缓存策略基准测试框架](#125-缓存策略基准测试框架)
    - [12.6 双重键控缓存模拟器](#126-双重键控缓存模拟器)
  - [13. 结论与未来方向](#13-结论与未来方向)
  - [参考文献](#参考文献)

---

## 0. 从缓存的普遍性问题开始

缓存是计算机科学中最古老也最普遍的优化技术之一，其基本思想简单到几乎不言而喻：如果一个计算或获取操作代价高昂，且结果在特定时间窗口内保持不变，那么将结果保存起来以供重用，就能以空间换时间。然而，将这种直觉应用于 Web 平台时，我们立即遭遇三个相互交织的复杂性维度：

1. **分布式一致性**：Web 资源由服务器生成，由客户端消费，中间可能经过多层代理和 CDN 边缘节点。任何一层都可以缓存，但任何一层的缓存都可能与原始资源的状态发生偏离。

2. **安全与隐私的冲突**：缓存本质上是状态共享机制。在 Spectre 和 Meltdown 之后，浏览器被迫在缓存共享与跨站信息泄露之间做出痛苦的选择，催生了双重键控缓存（double-keyed caching）和存储分区（storage partitioning）等机制。

3. **API 的异质性**：从 HTTP 的声明式缓存指令，到 Service Worker 的命令式 Cache API，到 IndexedDB 的事务型对象存储，到 OPFS 的文件系统语义，浏览器提供了至少六种本质不同的缓存/存储接口，每种接口都有其独特的一致性模型、容量限制和性能特征。

本文档的目标是建立一个统一的分析框架，使工程师能够在这三种复杂性之间做出有原则的权衡。我们不满足于罗列 API 文档，而是追问：这些机制背后的共同结构是什么？它们的边界在哪里？如何在具体工程场景中做出最优选择？

---

## 1. HTTP Caching 协议语义

HTTP 缓存由 RFC 9111（取代 RFC 7234）标准化，是 Web 缓存体系中最基础也最具影响力的层级。理解 HTTP 缓存语义是理解所有其他缓存层的前提，因为 Service Worker、CDN 乃至浏览器内部实现都构建在这些语义之上。

### 1.1 缓存存储模型：私有、共享与中介

RFC 9111 定义了三种缓存类型，其区分对于理解 Cache-Control 指令的行为至关重要：

**私有缓存（Private Cache）**：仅服务于单个用户代理。最典型的例子是浏览器内置的 HTTP 缓存。私有缓存可以存储包含个性化内容的响应，例如包含用户身份信息的 HTML 页面或 API 响应。

**共享缓存（Shared Cache）**：服务于多个用户代理。CDN 边缘节点和机构代理属于此类。共享缓存不得存储包含 `Cache-Control: private` 的响应，也不得存储包含 `Authorization` 头的响应（除非明确带有 `Cache-Control: public`）。

**中介缓存（Intermediary Cache）**：位于客户端与服务器之间的任何缓存，可能是显式配置的代理，也可能是透明代理。随着 HTTPS 的普及，透明中介缓存已基本消失，但显式代理在企业环境中仍然存在。

这一分类的严格性直接影响安全性。一个常见的工程错误是将包含敏感用户数据的 API 响应标记为 `Cache-Control: public`，导致该数据被 CDN 缓存并可能泄露给其他用户。RFC 9111 的默认保守策略（不缓存包含 `Authorization` 的响应）正是为了防止这类错误。

### 1.2 Cache-Control 指令的完全解析

`Cache-Control` 是 HTTP 缓存语义的核心载体，既出现在请求中，也出现在响应中。响应指令控制缓存如何存储和使用响应；请求指令（如 `max-age=0` 或 `no-cache`）向缓存表达客户端的偏好，但缓存可以选择忽略请求指令（RFC 9111 §5.2.1 明确指出请求指令不是强制性的）。

以下是对所有标准响应指令的完整技术解析：

**`max-age=<seconds>`**：指定响应被视为新鲜的最长时间（以请求生成时间为起点）。这是最重要的缓存指令，覆盖了 `Expires`。如果 `max-age=0` 或 `s-maxage=0`，缓存必须在重用前重新验证（但并不意味着"不存储"）。

**`s-maxage=<seconds>`**：与 `max-age` 类似，但仅适用于共享缓存。私有缓存忽略此指令。当同时存在时，`s-maxage` 覆盖 `max-age` 对共享缓存的效果。

**`no-cache`**：名称极具误导性。此指令并不意味着"不缓存"，而是意味着"在使用缓存副本前必须与服务器重新验证"。缓存仍然可以存储响应，但每次使用前必须发送条件请求（通常返回 304 Not Modified）。这适用于需要立即失效敏感性但允许条件请求节省带宽的场景。

**`no-store`**：真正的不缓存指令。缓存不得存储请求或响应的任何部分。这适用于高度敏感数据，如银行余额或个人健康信息。注意，`no-store` 是传播性的：如果上游响应包含 `no-store`，下游缓存也必须遵守。

**`private`**：指示响应仅针对单个用户，不得被共享缓存存储。私有缓存（浏览器）可以存储，但共享缓存（CDN）不得存储。注意，这与 `no-cache` 是正交的：`private, no-cache` 表示浏览器可以存储但必须重新验证；`private` 单独表示浏览器可以存储且在新鲜期内无需重新验证。

**`public`**：显式声明响应可以被任何缓存存储，即使响应包含 `Authorization` 头或状态码通常不可缓存（如 404）。谨慎使用：只有在确认响应确实不区分用户时才应使用。

**`must-revalidate`**：当响应过期后，缓存不得使用过期副本。如果无法连接到源服务器，缓存必须返回 504 Gateway Timeout，而不是提供过期内容。这对于需要严格一致性但允许短暂新鲜窗口的金融数据特别有用。

**`proxy-revalidate`**：与 `must-revalidate` 类似，但仅适用于共享缓存。私有缓存可以忽略此指令并在离线时提供过期内容。

**`immutable`**：非 RFC 9111 标准但被广泛支持的扩展（由 Facebook 提出）。指示响应体在 URL 不变的情况下永远不会改变。浏览器知道无需在页面重载时甚至 F5 时重新验证此类资源。这对于带有内容哈希的文件名（如 `app.a3f2b1c.js`）极其有效。

**`stale-while-revalidate=<seconds>`**：允许缓存在响应过期后的指定时间内提供"陈旧"响应，同时异步后台重新验证。这是实现"立即响应 + 后台更新"模式的关键指令。注意，并非所有 CDN 都支持此指令；Cloudflare 支持，但某些传统 CDN 忽略它。

**`stale-if-error=<seconds>`**：当源服务器返回错误（如 500 或连接失败）时，允许缓存提供过期响应的额外时间窗口。这是提高可用性的重要机制，但必须谨慎设置，以免在源服务器真正故障时向用户提供长时间过期的数据。

指令的组合遵循特定的优先级规则。当 `no-store` 存在时，它覆盖所有其他指令。当 `no-cache` 和 `max-age=3600` 同时存在时，`no-cache` 的重新验证要求生效，但 `max-age` 仍然定义了新鲜期，只是缓存会在过期时立即重新验证而不是任意时间点。

### 1.3 Expires 与 Age：时间语义的两面

`Expires` 是 HTTP/1.0 时代的遗留指令，指定响应过期的绝对时间点。由于它依赖服务器时钟与客户端时钟的同步，而时钟偏差在网络中极为常见，`Expires` 已被 `max-age` 取代。RFC 9111 规定，如果响应包含 `Cache-Control: max-age` 或 `s-maxage`，则 `Expires` 被忽略。

然而，`Expires` 在特定场景下仍有价值：当需要与不支持 HTTP/1.1 的遗留客户端或代理兼容时。在纯现代 Web 应用中，`Expires` 可以被安全地省略。

`Age` 头则是完全不同的概念。它表示响应自源服务器生成以来经过的秒数，由缓存（无论是共享还是私有）添加。当响应经过多级缓存时，每一级都会更新 `Age`。客户端可以通过以下公式计算响应的剩余新鲜期：

```
remaining_freshness = max_age - Age
```

`Age` 的存在揭示了 HTTP 缓存的一个深刻特性：新鲜度不是响应本身的属性，而是响应在缓存拓扑中位置的函数。同一个 URL 的响应，在边缘 CDN 处可能是新鲜的，在浏览器端却可能已经过期（如果它在边缘处已经被存储了很长时间）。

### 1.4 验证器机制：ETag 与 Last-Modified

当缓存需要重新验证（由于 `no-cache`、`must-revalidate` 或过期）时，它必须有一种方式询问服务器"我拥有的这个副本是否仍然是最新的？" HTTP 提供了两种验证器机制：

**强验证器与弱验证器**：RFC 9111 区分强验证器和弱验证器。强验证器保证如果资源改变，验证器值必然改变；弱验证器（以 `W/` 前缀标记）只保证在语义等价意义上的变化。`ETag` 既可以是强的也可以是弱的；`Last-Modified` 本质上是弱的，因为服务器可能在同一秒内多次修改资源而不改变时间戳。

**ETag（实体标签）**：由服务器生成的任意字符串，唯一标识资源的特定表示。强 ETag 通常基于响应体的精确字节内容生成（如内容的哈希值），适用于静态资源。弱 ETag（如 `W/"abc123"`）允许语义上等价但表示不同的响应共享同一标签，适用于动态生成但经过规范化处理的响应。

ETag 的生成策略对缓存效率有深远影响。一个常见的反模式是使用包含时间戳的弱 ETag（如 `W/"2026-05-05T10:00:00"`），这实际上将 ETag 降级为 `Last-Modified` 的等价物，失去了字节级精确比较的能力。理想的强 ETag 应当仅依赖响应体的内容哈希，如 `sha256(responseBody).slice(0, 16)`。

**Last-Modified**：资源在服务器上最后被修改的时间戳。由于秒级精度限制和"同一秒内多次修改"问题，`Last-Modified` 的验证精度低于 ETag。此外，某些动态资源没有有意义的"修改时间"，此时 `Last-Modified` 不适用。

### 1.5 条件请求：If-None-Match 与 If-Modified-Since

验证器通过条件请求头发送至服务器：

**`If-None-Match: <etag>`**：客户端发送其持有的 ETag。服务器比较 ETag：如果匹配，返回 `304 Not Modified` 且无响应体；如果不匹配，返回 `200 OK` 和新内容。`If-None-Match` 可以包含多个 ETag（如 `If-None-Match: "abc", "def", *`），其中 `*` 匹配任何资源。

**`If-Modified-Since: <http-date>`**：客户端发送其持有的 `Last-Modified` 值。如果资源自该时间后未修改，服务器返回 304。注意，`If-Modified-Since` 只能用于 GET 和 HEAD 请求；对于 POST 等非安全方法，语义不同（这是 `If-Unmodified-Since` 的范畴）。

当请求同时包含 `If-None-Match` 和 `If-Modified-Since` 时，RFC 9111 规定服务器不得返回 304 除非两个条件都满足。然而，实际上大多数实现优先使用 `If-None-Match`（如果存在），忽略 `If-Modified-Since`。这是因为 ETag 的精确度更高，而 `If-Modified-Since` 的秒级精度可能导致错误匹配。

条件请求的性能优势是巨大的。对于一个 1MB 的 JavaScript bundle，如果未改变，条件请求传输约 300 字节的请求头和 150 字节的 304 响应头，而不是完整的 1MB 响应体——节省了 99.95% 的传输量。这就是为什么即使在 `max-age=31536000`（一年）的静态资源上，仍应提供 ETag：它允许用户在强制刷新（Ctrl+F5）或开发者工具"Disable Cache"关闭后高效重新验证。

### 1.6 Vary 头：多维缓存键的复杂性

`Vary` 头是 HTTP 缓存中最容易被误解也最具威力的机制之一。它定义了哪些请求头参与缓存键的计算。默认情况下，缓存键仅包含请求方法和 URL。`Vary: Accept-Encoding` 意味着对于同一 URL，`Accept-Encoding: gzip` 和 `Accept-Encoding: br`（Brotli）的请求会分别缓存。

**常见用法**：

- `Vary: Accept-Encoding`：区分压缩格式（gzip、br、deflate）。
- `Vary: Accept-Language`：区分语言版本。
- `Vary: Authorization`：区分已认证和未认证用户（需谨慎，可能导致缓存碎片）。
- `Vary: Origin`：CORS 预检响应中常见，区分不同来源的请求。

**缓存碎片问题**：`Vary` 的致命弱点是可能导致缓存碎片（cache fragmentation）。如果 `Vary` 基于一个高度变化的请求头（如 `User-Agent` 或 `Cookie`），缓存中为同一 URL 存储的变体数量可能爆炸，降低命中率并增加存储开销。RFC 9111 建议缓存可以限制为同一 URL 存储的变体数量，并在达到限制时删除最不常用的变体。

**Vary 与 CDN 的交互**：传统 CDN 对 `Vary` 的支持参差不齐。某些 CDN 只支持 `Vary: Accept-Encoding`，忽略其他值。现代 CDN（如 Cloudflare、Fastly）支持完整的 `Vary` 语义，但可能有限制。工程实践中，如果需要在 CDN 上根据多个维度缓存，使用不同的 URL（如 `/api/data?lang=en` 和 `/api/data?lang=zh`）通常比依赖 `Vary` 更可靠。

### 1.7 启发式缓存：RFC 7234 的回退策略

当响应不包含任何显式缓存指令（无 `Cache-Control`，无 `Expires`）时，RFC 7234 §4.2.2 允许缓存使用启发式算法估计新鲜期。这是 HTTP 缓存中最危险的默认行为之一，因为它可能导致意外缓存。

典型的启发式规则是：如果响应包含 `Last-Modified`，缓存可以估计新鲜期为 `(Date - Last-Modified) * 0.1`。例如，如果一个资源一年前被修改，缓存可能决定它可以被缓存约 36 天。

对于频繁更新的动态内容，这种启发式缓存可能是灾难性的。RFC 9111 推荐响应始终包含显式的缓存指令以避免启发式缓存的不确定性。现代框架（如 Next.js、Express）通常默认添加 `Cache-Control: no-store` 或 `private, no-cache` 给动态响应，但自定义服务器实现中这一细节常被忽略。

一个防御性工程实践是在应用服务器的全局响应中间件中添加默认的 `Cache-Control: no-store`，然后为特定的静态资源路由显式覆盖为合适的缓存策略。这比依赖开发者在每个端点手动添加缓存指令更安全。

---

## 2. 缓存失效策略

缓存失效被 Phil Karlton  famously 称为计算机科学中仅有的两个难题之一（另一个是命名）。HTTP 的声明式缓存模型本质上是基于时间的失效；当需要立即失效时，必须借助外部机制。

### 2.1 失效三角与菲尔·卡尔顿定律

缓存失效的挑战源于一个根本性的三元冲突，我们称之为**失效三角（Invalidation Triangle）**：

1. **立即一致性**：缓存副本在任何时刻都与源数据完全一致。
2. **高命中率**：缓存尽可能多地服务请求，减少回源。
3. **低管理复杂度**：失效机制简单、可靠、易于推理。

Karlton 定律指出：在任何非平凡系统中，不可能同时满足这三个目标。你只能选择优化其中两个：

- **CDN 清除（Purge）**：牺牲低复杂度以获得立即一致性 + 高命中率。
- **版本化 URL（Fingerprinting）**：牺牲立即一致性以获得高命中率 + 低复杂度（通过永不失效而是发布新 URL 来实现）。
- **短 TTL + 被动失效**：牺牲高命中率以获得立即一致性 + 低复杂度。

工程实践中的大多数缓存架构都是在这三个顶点之间的权衡。

### 2.2 Purge、Ban 与 Surrogate Keys

在 CDN 和反向代理层面，有三种主要的主动失效机制：

**Purge（清除）**：从缓存中立即删除特定 URL 的响应。Purge 是同步操作：CDN 返回 200 表示该 URL 已从边缘节点删除。Purge 的局限是只能针对精确的 URL；如果资源有查询参数变体（如 `?v=1` 和 `?v=2`），需要分别清除。某些 CDN（如 Cloudflare）支持通配符清除，但可能有限制和延迟。

**Ban（禁止）**：与 Purge 不同，Ban 不是立即删除缓存条目，而是标记它们为"无效"。当后续请求命中被 Ban 的条目时，缓存才会删除它并回源。Ban 的优势是可以使用正则表达式匹配大量 URL（如 `^/api/products/.*`），而不需要知道精确的 URL 列表。Ban 的缺点是它不会释放存储空间直到条目被访问；对于长期不被访问的过期条目，它们会继续占用缓存内存。

**Surrogate Keys（代理键）**：这是最先进的失效机制，由 Fastly 推广，现已被多个 CDN 支持。Surrogate Key 是由源服务器在响应头中附加的逻辑标签（如 `Surrogate-Key: products-123 products-all`），与 URL 无关。一个响应可以有多个 Surrogate Key；多个响应可以共享同一个 Surrogate Key。失效时，可以发送 `Surrogate-Key: products-all` 的清除请求，立即使所有带有该键的响应失效，无论它们的 URL 是什么。

Surrogate Key 的表达能力使其成为复杂应用的首选失效机制。例如，一个电商网站可以为产品详情页设置 `Surrogate-Key: product-<id> category-<categoryId>`。当产品价格改变时，清除 `product-123`；当整个品类更新时，清除 `category-electronics`。这比维护 URL 列表优雅得多。

### 2.3 主动失效 vs 被动失效

**主动失效（Active Invalidation）**：在源数据改变时，系统主动通知缓存层删除或更新条目。这要求源系统与缓存层之间的耦合：应用代码在写入数据库后必须调用 CDN API 发送 Purge 请求。耦合的代价是复杂性；如果 Purge 请求失败，缓存与源数据将不一致。

**被动失效（Passive Invalidation）**：依赖 TTL 到期自动清除过期条目。源数据改变后，缓存中的旧数据继续服务直到 TTL 过期。被动失效的优势是系统解耦；代价是更新传播的延迟。

**乐观更新 + 回滚（Optimistic Update）**：一种现代前端模式，应用立即更新本地缓存（如 React Query 的 `queryClient.setQueryData`），同时后台发送请求。如果请求失败，回滚本地更新。这不是严格意义上的缓存失效，而是缓存更新的客户端策略，但它模糊了"缓存"与"应用状态"之间的边界。

---

## 3. Service Worker 与 Cache API

Service Worker 是浏览器提供的可编程网络代理，允许开发者拦截、修改和响应网络请求。Cache API（通过 `CacheStorage` 和 `Cache` 接口）是 Service Worker 的配套存储机制，专门用于缓存 `Request`/`Response` 对。

### 3.1 CacheStorage 与 Cache 对象模型

`CacheStorage`（全局变量 `caches`）是 `Cache` 对象的命名空间映射。每个 `Cache` 对象是一个 `Request` → `Response` 的字典，其匹配语义基于 HTTP 请求语义而非精确字符串匹配。

关键接口：

- `caches.open(name)`：打开或创建一个命名缓存，返回 Promise<Cache>。
- `cache.match(request, options)`：查找匹配的响应。匹配考虑 URL、Vary 头和请求方法。`options.ignoreVary`、`options.ignoreSearch` 可以放宽匹配条件。
- `cache.put(request, response)`：显式存储请求-响应对。
- `cache.add(request)`：获取请求并将响应存储到缓存中。
- `cache.addAll(requests)`：批量获取和存储。
- `cache.delete(request, options)`：删除匹配的条目。
- `cache.keys(request?, options?)`：列出缓存中的请求。

**作用域隔离**：`CacheStorage` 的作用域遵循 Service Worker 的注册作用域。同一来源的不同 Service Worker 可以访问同一 `CacheStorage`，但不同来源之间完全隔离。然而，在 post-Spectre 时代，这一隔离已被增强为按顶级站点分区（见第 7 节）。

**Quota 管理**：Cache API 的存储计入来源的配额。当配额不足时，浏览器可以自动清除 Cache API 中的条目。`cache.delete()` 只删除元数据；如果响应体被其他缓存共享引用，实际存储可能不会立即释放。

### 3.2 标准策略的形式化描述

Google 的 Workbox 和 MDN 文档标准化了五种缓存策略。我们可以将它们形式化为基于预条件的决策过程：

**CacheFirst（缓存优先）**：

```
给定请求 R:
  如果 Cache.match(R) 返回响应 C:
    返回 C
  否则:
    发送网络请求 N
    如果 N 成功:
      Cache.put(R, N)
      返回 N
    否则:
      返回错误
```

适用场景：静态资源（CSS、JS、图片），这些资源在构建时带有内容哈希，URL 改变即意味着内容改变。风险：如果缓存了错误的响应（如离线时的 404），该错误会被持久化直到显式清除。

**NetworkFirst（网络优先）**：

```
给定请求 R:
  发送网络请求 N
  如果 N 在超时 T 内成功:
    Cache.put(R, N)
    返回 N
  否则:
    如果 Cache.match(R) 返回响应 C:
      返回 C
    否则:
      返回 N 的错误（或回退响应）
```

适用场景：需要尽可能新鲜的 API 数据，但在离线时允许使用缓存副本。超时 T 是关键参数：太短会导致不必要的缓存回退；太长则违背"网络优先"的初衷。

**StaleWhileRevalidate（过期时重新验证）**：

```
给定请求 R:
  如果 Cache.match(R) 返回响应 C:
    返回 C（立即）
    同时异步发送网络请求 N
    如果 N 成功:
      Cache.put(R, N)
  否则:
    发送网络请求 N
    如果 N 成功:
      Cache.put(R, N)
      返回 N
    否则:
      返回错误
```

这是用户体验最优的策略：始终立即响应（如果缓存存在），同时后台更新。代价是用户可能看到略旧的数据。适用于对绝对新鲜度不敏感的内容，如文章、产品列表、仪表板数据。

**NetworkOnly（仅网络）**：

```
给定请求 R:
  发送网络请求 N
  返回 N（或错误）
```

适用于必须实时的请求，如支付状态、聊天消息。

**CacheOnly（仅缓存）**：

```
给定请求 R:
  如果 Cache.match(R) 返回响应 C:
    返回 C
  否则:
    返回错误
```

适用于预缓存的资源，如应用 Shell 或离线包。

### 3.3 策略选择与性能权衡

策略选择应当基于数据新鲜度需求、网络可靠性、和用户体验目标的定量分析。

一个常见的设计模式是**基于 URL 模式的策略路由**：

- `/static/*` → CacheFirst（内容哈希文件名）
- `/api/dashboard` → StaleWhileRevalidate（仪表板数据）
- `/api/cart` → NetworkFirst（购物车需要新鲜，但离线时可读缓存）
- `/api/checkout` → NetworkOnly（支付必须实时）
- `/offline.html` → CacheOnly（离线回退页面）

策略的性能特征可以用以下指标衡量：

- **首字节时间（TTFB）**：CacheFirst < StaleWhileRevalidate ≈ CacheOnly < NetworkFirst（取决于超时） < NetworkOnly
- **数据新鲜度**：NetworkOnly > NetworkFirst > StaleWhileRevalidate > CacheFirst = CacheOnly
- **离线可用性**：CacheFirst = StaleWhileRevalidate = CacheOnly > NetworkFirst > NetworkOnly

---

## 4. 浏览器存储 API 深度比较

浏览器提供了多种客户端存储机制，每种机制在容量、接口风格、事务支持和性能特征上差异显著。理解这些差异是做出正确工程选择的基础。

### 4.1 IndexedDB：结构化的事务型存储

IndexedDB 是浏览器中唯一的原生结构化、事务型、异步存储机制。它基于对象存储（object store）而非关系表，支持索引、游标、范围查询和事务。

**核心概念**：

- **数据库（Database）**：通过 `indexedDB.open(name, version)` 打开。版本号必须是整数。版本升级触发 `upgradeneeded` 事件，是定义对象存储和索引的唯一时机。
- **对象存储（Object Store）**：键值对集合，类似 NoSQL 集合。键可以是对象中的属性（key path）或显式提供（out-of-line key）。
- **索引（Index）**：在对象存储的属性上创建的二级索引，支持范围查询和排序。索引可以唯一或非唯一。
- **事务（Transaction）**：所有读写操作必须在事务内执行。事务模式分为 `readonly` 和 `readwrite`。IndexedDB 支持自动提交：当事务的所有请求完成且没有新请求排队时，事务自动提交。
- **游标（Cursor）**：用于遍历查询结果集，支持 `continue()` 和 `advance(n)`。

**性能特征**：

- 存储容量：通常可达可用磁盘空间的 50-60%，远大于 LocalStorage 的 5MB。
- 异步 API：不会阻塞主线程。
- 查询性能：键查找为 O(log n)（B-tree 索引）；全表扫描为 O(n)。
- 写入性能：单个事务中的批量写入远快于多个独立事务，因为每个事务都有 fsync 开销。

**版本升级的痛苦**：IndexedDB 的 schema 迁移机制是其最常被批评的方面。`upgradeneeded` 事件中的 `IDBOpenDBRequest.result` 是 `IDBDatabase` 实例，但此时数据库处于特殊状态：你可以创建/删除对象存储和索引，但不能进行普通读写。如果升级逻辑复杂（如需要迁移数据），必须在升级事务内完成，否则需要关闭数据库并重新打开。这导致大型 IndexedDB 的 schema 演化是一个著名的工程挑战。

### 4.2 LocalStorage / SessionStorage：同步 API 的性能陷阱

Web Storage API（LocalStorage 和 SessionStorage）提供了最简单的键值存储接口。它们的同步性质是性能问题的根源。

**LocalStorage**：

- 容量：约 5-10MB（各浏览器不同）。
- 作用域：协议 + 主机 + 端口（same-origin）。
- 持久性：除非显式清除，否则永久保存。
- API：`getItem(key)`、`setItem(key, value)`、`removeItem(key)`、`clear()`。
- **同步阻塞**：所有操作在主线程上同步执行。读取或写入大量数据会阻塞 UI。
- **无事务**：没有原子性保证。如果写入过程中页面崩溃，存储可能处于不一致状态。
- **仅支持字符串**：非字符串数据必须通过 `JSON.stringify` 序列化。
- **事件传播**：同一来源的其他标签页可以监听 `storage` 事件以实现跨标签通信，但这一机制在不同浏览器的实现中存在微妙差异。

**SessionStorage**：

- 与 LocalStorage 接口相同，但数据仅在页面会话期间保留（标签页关闭即清除）。
- 作用域更细：不仅 same-origin，而且限定于同一标签页。同一来源的新标签页获得独立的 SessionStorage。

**性能陷阱**：

1. **主线程阻塞**：`localStorage.setItem` 在写入前必须获取存储文件的锁，并将整个存储序列化到磁盘。在写入频繁的场景（如每次用户输入），这可能导致明显的 UI 卡顿。
2. **没有批量写入 API**：每个 `setItem` 都是独立的磁盘写入。与 IndexedDB 的事务批处理相比，性能差距可达数量级。
3. **存储事件的开销**：`storage` 事件在同一来源的所有标签页中广播，可能导致级联更新和意外的性能退化。

**适用场景**：小量配置数据的持久化（如用户偏好设置、主题选择）、跨标签页通信信标。对于任何非平凡的数据量或写入频率，IndexedDB 是更优选择。

### 4.3 Cookie 存储：安全属性的组合爆炸

虽然 Cookie 不是传统意义上的"缓存"，但它在功能上充当了 HTTP 请求的小型状态缓存。Cookie 的复杂性和安全风险使其值得深入分析。

**核心属性**：

- **`Max-Age=<seconds>` / `Expires=<date>`**：定义 Cookie 的生命期。`Max-Age` 优先于 `Expires`（如果同时存在）。如果两者都缺失，Cookie 是会话级的（浏览器关闭时清除，但"会话"的定义在现代浏览器的恢复功能下变得模糊）。

- **`Secure`**：Cookie 仅通过 HTTPS 发送。没有 `Secure` 的 Cookie 在 HTTP 连接上明文传输，面临中间人攻击。

- **`HttpOnly`**：Cookie 不能通过 JavaScript 的 `document.cookie` 访问。这是防御 XSS 攻击的关键属性：即使攻击者注入脚本，也无法窃取 `HttpOnly` 的会话 Cookie。

- **`SameSite`**：控制 Cookie 在跨站请求中的发送行为。
  - `SameSite=Strict`：Cookie 仅在相同站点的导航中发送。最安全，但可能影响用户体验（如从邮件点击链接登录后需要重新认证）。
  - `SameSite=Lax`：Cookie 在顶层跨站 GET 导航中发送，但不在 POST 或 iframe 中发送。现代浏览器的默认行为。
  - `SameSite=None`：Cookie 在所有跨站请求中发送。必须配合 `Secure` 使用。

- **`Partitioned` (CHIPS)**：Cookies Having Independent Partitioned State。这是一个相对较新的机制，用于解决第三方 Cookie 的隐私问题。带有 `Partitioned` 的 Cookie 被隔离到顶级站点 + 请求站点的组合分区中。这意味着 `example.com` 的嵌入在 `site-a.com` 和 `site-b.com` 上的 Cookie 是不同的，即使它们都来自 `example.com`。

- **`__Host-` 前缀**：以 `__Host-` 为前缀的 Cookie 名称隐含了 `Secure`、`Path=/`、且无 `Domain` 属性。这防止了子域 Cookie 泄露和路径级 Cookie 注入。类似地，`__Secure-` 前缀隐含 `Secure`。这些前缀是防御性的命名约定，强制安全属性。

**Cookie 大小限制**：每个 Cookie 最大约 4KB，每个域名下通常最多 50 个 Cookie。超过限制时，浏览器行为未标准化：Chrome 采用 LRU 驱逐，Firefox 拒绝新 Cookie。

### 4.4 OPFS：Origin Private File System

Origin Private File System（OPFS）是 File System Access API 的一部分，为 Web 应用提供了一个高效的、私有的文件系统空间。与旧的 File API 不同，OPFS 专为性能优化：它使用直接文件句柄，支持可写流，并且在工作线程（Worker）中可用。

**核心接口**：

- `navigator.storage.getDirectory()`：获取 OPFS 的根目录句柄（`FileSystemDirectoryHandle`）。
- `FileSystemDirectoryHandle.getFileHandle(name, { create })`：获取或创建文件句柄。
- `FileSystemDirectoryHandle.getDirectoryHandle(name, { create })`：获取或创建子目录。
- `FileSystemFileHandle.createWritable()`：创建可写流。
- `FileSystemFileHandle.getFile()`：获取 `File` 对象（可读）。

**性能优势**：

- OPFS 中的写入不经过主线程的事件循环；在工作线程中，可以实现接近原生的文件 I/O 性能。
- 支持真正的流式读写，适合处理大文件（视频、音频、大型数据集）。
- 文件操作是原子性的（如果正确使用 `createWritable` 的写入模式）。

**与 IndexedDB 的比较**：OPFS 适合存储大块二进制数据（Blob、文件内容），而 IndexedDB 适合结构化数据和索引查询。两者可以结合使用：IndexedDB 存储文件的元数据和索引，OPFS 存储实际的文件内容。

---

## 5. 范畴语义：缓存作为幂等自函子

范畴论为缓存提供了一种深刻的统一视角。在这一框架中，缓存不是特设的优化技术，而是资源状态范畴上的一个结构性操作。

### 5.1 资源状态范畴

定义范畴 **Res**，其对象是可缓存资源的集合，态射是状态转换（如更新、删除、创建）。对于具体性，可以将对象视为资源标识符到表示的映射：

```
Obj(Res) = { R: URI → Representation ∪ {⊥} }
```

其中 ⊥ 表示资源不存在。

态射 f: R₁ → R₂ 是将一种资源状态映射到另一种的函数。特别地，我们关注由服务器更新引起的**源状态转换** δ: R → R'。

### 5.2 缓存函子的构造

定义缓存操作 C: Res → Res 为一个自函子（endofunctor）。对于每个对象 R（源状态），C(R) 是缓存中的状态，可能等于 R（缓存命中且新鲜），也可能不等于 R（缓存未命中或过期）。

C 必须满足函子公理：

1. **恒等律**：C(id_R) = id_{C(R)}。如果源状态不变，缓存状态也不变。
2. **组合律**：C(f ∘ g) = C(f) ∘ C(g)。连续更新的缓存效果等于各更新缓存效果的组合。

**幂等性（Idempotence）**：缓存的核心特性是其幂等性——多次应用缓存操作不会产生新的效果。形式化地：

```
C ∘ C ≅ C
```

这意味着缓存的缓存就是缓存本身。这不是严格的数学等式（因为缓存内部可能有元数据更新，如 LRU 时间戳），但在表示层的语义上是成立的：再次缓存一个已经缓存的响应不会改变其表示内容。

**缓存作为投影**：幂等自函子 C 可以被视为从源状态到缓存状态范畴的投影。如果 C(R) = R（即缓存完全命中），则 R 是 C 的一个不动点。缓存一致性问题本质上就是在问：C(R) 在何时是不动点？

### 5.3 缓存与 Comonad

缓存操作具有 Comonad 的结构。一个 Comonad 由三元组 (C, ε, δ) 组成，其中：

- C 是自函子（缓存函子）。
- ε: C → Id 是 counit（提取），对应于从缓存中读取：`extract(cache) = cache.content`。
- δ: C → C² 是 comultiplication（复制），对应于创建缓存的缓存（多层缓存架构）。

Comonad 定律提供了对缓存行为的深刻洞见：

1. **左单位律**：`extract ∘ δ = id_C`。如果你复制缓存然后提取外层，得到原始缓存。这对应于多层缓存的正确性：边缘缓存的元缓存（如父 CDN 节点）的提取应当与直接访问边缘缓存等价。

2. **右单位律**：`map(extract) ∘ δ = id_C`。如果你复制缓存然后提取内层，也得到原始缓存。这对应于缓存的缓存的表示内容应当与原始缓存相同。

3. **结合律**：`map(δ) ∘ δ = δ ∘ δ`。多层缓存的嵌套结构是结合的。CDN → 反向代理 → 浏览器缓存 的嵌套与 (CDN → 反向代理) → 浏览器缓存 等价。

**缓存失效作为 Counit 的逆**：缓存失效对应于破坏 counit 的定义——使 `extract` 不再返回有效的表示。在 Comonad 术语中，失效是引入一个"断开的"counit，使得 `extract(cache) = ⊥` 或触发重新计算。

### 5.4 对称差与自然变换

考虑从源状态到缓存状态的**偏差（drift）**度量。我们可以用对称差（symmetric difference）来形式化这一概念。

对于表示集合，定义对称差 Δ:

```
Δ(R, C(R)) = (R \ C(R)) ∪ (C(R) \ R)
```

当缓存一致时，Δ = ∅。当缓存过期时，Δ 包含所有源状态中已改变但缓存中未反映的元素。

对称差诱导了一个自然变换 η: Id → C'，其中 C' 是"一致性度量"函子。对于每个态射 f: R₁ → R₂（源更新），以下图表交换：

```
R₁ --η_R₁--> Δ(R₁, C(R₁))
|f            |Δ(f, C(f))
v             v
R₂ --η_R₂--> Δ(R₂, C(R₂))
```

这个交换条件意味着：先更新源再计算偏差，与先计算偏差再传播更新，在语义上是等价的。这并非自动成立的性质，而是对缓存实现的**正确性要求**——缓存失效机制必须保证这一交换性，否则系统将出现竞态条件和不一致状态。

---

## 6. 对称差分析：缓存一致性的度量

对称差不仅是抽象的范畴论概念，它可以被具体化为工程实践中可计算的缓存一致性度量。

### 6.1 对称差作为不一致度量

在工程层面，我们很少能直接计算集合的对称差（因为完整的表示集合可能无限或未知）。但我们可以定义**代理度量（proxy metrics）**：

**时间对称差（Temporal Symmetric Difference）**：

```
Δ_t(R, C(R)) = T_now - T_cached
```

这是最简单的代理：缓存越旧，偏差可能越大。这直接对应于 `Age` 头和 `max-age` 语义。

**版本对称差（Version Symmetric Difference）**：
如果资源具有单调递增的版本号（如数据库中的乐观锁版本），则：

```
Δ_v(R, C(R)) = V_source - V_cache
```

版本差为 0 表示一致；大于 0 表示缓存过期。当版本号可用时（如通过 ETag 或自定义头），这比时间差更精确，因为服务器可能在长时间内不改变资源，此时时间差高估了偏差。

**内容哈希对称差（Content Hash Difference）**：

```
Δ_h(R, C(R)) = HammingDistance(hash(R), hash(C(R)))
```

对于二进制内容，如果缓存和源都维护内容的哈希值，汉明距离（或更简单的相等性测试）可以直接检测偏差。强 ETag 本质上是内容哈希的代理。

### 6.2 时间衰减与 TTL 的数学模型

TTL（Time-To-Live）可以被建模为随时间衰减的一致性概率。假设资源的更新服从泊松过程，更新率为 λ（每秒平均更新次数），则在时间 t 后缓存仍然一致的概率为：

```
P(consistent | age=t) = e^(-λt)
```

给定一个可接受的不一致概率阈值 ε（如 ε = 0.01，即允许 1% 的概率缓存已过期），最优 TTL 为：

```
TTL_optimal = -ln(ε) / λ
```

例如，如果资源平均每 60 秒更新一次（λ = 1/60），且要求 99% 的一致性概率：

```
TTL = -ln(0.01) / (1/60) ≈ 4.605 * 60 ≈ 276 秒 ≈ 4.6 分钟
```

这个简单的模型揭示了 TTL 选择的统计本质：它不是随意的，而是基于对更新频率的估计和对不一致容忍度的权衡。工程实践中，λ 通常未知，可以通过观测历史更新频率来估计（如指数加权移动平均）。

### 6.3 概率一致性模型

扩展上述思想，我们可以建立一个完整的概率一致性框架：

定义**一致性级别（Consistency Level）**为二元组 (p, t)，表示"在年龄 t 内，缓存一致的概率至少为 p"。不同的业务需求对应不同的一致性级别：

- **强一致性（Strong Consistency）**：(1.0, 0) — 始终直接访问源，不使用缓存。
- **会话一致性（Session Consistency）**：(0.99, 300) — 5 分钟内 99% 一致。
- **最终一致性（Eventual Consistency）**：(0.95, 3600) — 1 小时内 95% 一致。
- **统计一致性（Statistical Consistency）**：(0.5, ∞) — 不在乎一致性，只在乎命中率。

Service Worker 的 `StaleWhileRevalidate` 策略可以被理解为试图同时服务两个一致性级别：立即返回的缓存副本服务较低的一致性级别（如会话一致性），而后台获取的新副本服务较高的级别（强一致性），用于下一次请求。

---

## 7. 缓存分区与双重键控

2018 年的 Spectre 攻击揭示了共享缓存的致命隐私漏洞：恶意网站可以通过测量缓存命中/未命中的时间差异来推断用户访问过的其他网站（缓存计时攻击）。浏览器的回应是激进的缓存分区。

### 7.1 Spectre 后的安全模型

Spectre 攻击的基本原理：攻击者代码无法直接读取跨域缓存内容，但可以测量访问特定资源的时间。如果资源在缓存中（命中），加载时间极短；如果不在（未命中），加载时间较长。通过精心选择目标资源（如社交媒体上的特定图片），攻击者可以推断用户是否登录了特定服务。

传统的浏览器 HTTP 缓存是全局共享的：如果用户访问 `site-a.com` 加载了 `cdn.example.com/jquery.js`，然后访问 `site-b.com` 也加载同一 URL，浏览器会使用缓存的副本。这种共享正是 Spectre 攻击的利用面。

新的安全模型要求：缓存必须按**顶级站点（top-level site）**分区。即使同一第三方资源被多个站点引用，每个顶级站点看到的是独立的缓存分区。

### 7.2 双重键控的实现细节

**双重键控（Double-Keyed Caching）**：缓存键不再仅是资源 URL，而是 (top-level site, resource URL) 的元组。Chrome 从 86 版开始全面部署 HTTP 缓存分区。Safari（ITP）和 Firefox 也实施了类似策略。

**分区范围**：

- **HTTP 缓存**：按 (top-level site, frame site, URL) 分区。实际上 Chrome 使用更复杂的键：(top-level site, frame site, URL, isSubresource)。
- **Service Worker Cache API**：同样分区。`caches` 对象在不同顶级站点下看到的缓存互不干扰。
- **IndexedDB / LocalStorage / OPFS**：从 2020 年代起，这些存储 API 也按顶级站点分区（Storage Partitioning）。这意味着 `example.com` 在 `site-a.com` 的 iframe 中存储的 IndexedDB 数据，与在 `site-b.com` 的 iframe 中存储的数据是完全隔离的。

**对缓存命中率的影响**：分区将缓存从"全局共享"降级为"每站点私有"。对于广泛使用的 CDN 资源（如 jQuery、React、字体），这意味着浏览器不再能跨站共享缓存副本。每个用户访问的每个站点都会独立下载这些资源。尽管资源仍然可以被同站页面共享，但跨站共享的收益完全丧失。

**工程应对**：

1. **依赖内联（Inlining）**：对于小型第三方库，考虑将其打包到应用 bundle 中，而不是从 CDN 加载。既然 CDN 的跨站缓存优势已消失，外部引用的主要价值（缓存共享）不再存在。
2. **自有 CDN**：使用自己的 CDN 域名（如 `cdn.myapp.com`），资源与站点同源，不受双重键控的跨站影响（因为 top-level site 和 resource site 的关系是同站或受控的）。
3. **预加载（Preload）**：通过 `<link rel="preload">` 在页面早期加载关键资源，减少分区带来的重复下载延迟。

### 7.3 对 CDN 与第三方资源的影响

双重键控对 Web 架构产生了深远影响。传统的"公共 CDN 加速"模式（如 Google Hosted Libraries、cdnjs）的根基被动摇。当浏览器不再跨站共享这些库的缓存时，从公共 CDN 加载的优势仅剩地理分布式加速（CDN 边缘节点近源），而失去了缓存命中优势。

对于 CDN 提供商，双重键控意味着边缘节点必须处理更多来自不同来源的重复请求。然而，CDN 内部缓存通常是按完整 URL 键控的，不受浏览器双重键控的影响。CDN 仍然可以在边缘缓存 `cdn.example.com/lib.js` 并服务所有请求；只是浏览器的本地缓存无法跨站共享。

对于第三方分析、广告和嵌入内容，双重键控结合 Storage Partitioning 使得跨站跟踪更加困难。这是隐私保护的有意效果，但也给合法的跨站用户体验（如跨站登录状态、共享购物车）带来了工程挑战。

---

## 8. CDN 缓存与浏览器缓存的交互

现代 Web 应用通常同时利用 CDN 边缘缓存和浏览器本地缓存。理解这两层的交互对于构建高性能且一致的系统至关重要。

### 8.1 分层缓存拓扑

典型的 Web 缓存拓扑是一个层次结构：

```
Browser Cache (Private)
    ↑
CDN Edge Cache (Shared, geographically distributed)
    ↑
Origin Shield / Parent Cache (Shared, central)
    ↑
Origin Server (Canonical)
```

每一层都做出独立的缓存决策。请求首先检查浏览器缓存；未命中时向 CDN 边缘请求；CDN 边缘未命中时可能向父缓存或源站请求。

**分层的新鲜度计算**：当响应从源站向下传递时，`Age` 头累积。如果源站响应包含 `Cache-Control: max-age=3600`，但在到达浏览器时 `Age: 1800`，浏览器知道该响应只剩下 1800 秒的新鲜期（如果从边缘获取了已缓存 1800 秒的响应）。这防止了"边缘缓存无限延长新鲜期"的问题。

### 8.2 Cache-Control 指令的层间传播

并非所有 `Cache-Control` 指令都在所有层中以相同方式解释：

- `private`：CDN 边缘（共享缓存）不存储；浏览器（私有缓存）存储。这是层间过滤的典型例子。
- `s-maxage`：仅共享缓存遵循；浏览器忽略。
- `no-store`：所有层都不存储。这是传播性最强的指令。
- `immutable`：浏览器特别优化（避免重新验证），CDN 可以将其视为强 `max-age`。

**层间策略冲突**：如果源站返回 `Cache-Control: max-age=0, s-maxage=3600, public`，这表示"浏览器每次重新验证，但 CDN 可以缓存 1 小时"。这种模式适用于需要 CDN 减负但要求浏览器端即时更新的场景。然而，某些 CDN 配置可能重写或剥离响应头，导致层间语义不一致。

### 8.3 SWR (Stale-While-Revalidate) 的边缘扩展

`stale-while-revalidate` 在浏览器和 CDN 上的支持程度不同。现代 CDN（Cloudflare、Vercel Edge Network、Fastly）支持此指令，但实现细节有差异：

- **Cloudflare**：支持 `stale-while-revalidate`，允许在过期后提供陈旧响应并后台更新。可以与 `stale-if-error` 结合使用。
- **Vercel Edge**：支持 `stale-while-revalidate` 作为 ISR（Incremental Static Regeneration）的基础机制。在 SWR 窗口内，边缘提供缓存副本并在后台触发重新渲染。
- **Fastly**：通过 VCL 配置支持类似的逻辑，但原生不支持 `stale-while-revalidate` 作为标准指令。

**ISR 与 SWR 的关系**：Next.js 的 ISR 本质上是将 `stale-while-revalidate` 语义扩展到边缘渲染。页面在构建时生成并缓存（类似静态资源），在请求时如果缓存过期，边缘立即返回陈旧页面并在后台重新渲染。这与浏览器的 `StaleWhileRevalidate` Service Worker 策略形成了完美的层间对称：边缘层和客户端层都遵循相同的"立即响应 + 后台更新"哲学。

---

## 9. Storage Quota API 与持久化策略

浏览器存储不是无限的。Storage Quota API 提供了查询和管理存储配额的机制。

### 9.1 estimate() API 与配额模型

`navigator.storage.estimate()` 返回一个 Promise，解析为包含配额信息的对象：

```javascript
navigator.storage.estimate().then(estimate => {
  console.log(`Usage: ${estimate.usage} bytes`);
  console.log(`Quota: ${estimate.quota} bytes`);
  console.log(`Usage breakdown:`, estimate.usageDetails);
});
```

返回的对象通常包含：

- `usage`：当前来源已使用的总字节数。
- `quota`：当前来源被允许使用的总字节数。
- `usageDetails`（Chrome）：按存储类型（`indexedDB`、`caches`、`serviceWorkerRegistrations`、`webSQL`、`fileSystem` 等）的细分。

配额计算是复杂的浏览器内部操作，取决于：

- 可用磁盘空间
- 用户存储设置
- 设备类型（移动设备通常配额更严格）
- 站点参与度（某些浏览器为高频访问站点提供更多配额）

### 9.2 持久化存储与驱逐策略

默认情况下，浏览器可以在存储压力下自动清除来源的存储数据。这种清除是**尽力而为（best-effort）**的：浏览器不保证数据永远保留。

**持久化存储（Persistent Storage）**：

```javascript
navigator.storage.persist().then(persistent => {
  if (persistent) {
    console.log("Storage will not be cleared except by explicit user action");
  }
});
```

`persist()` 请求将存储标记为持久化。持久化存储不会被浏览器的自动清除机制删除（如清理缓存、释放磁盘空间）。然而，浏览器可能要求用户许可（如弹出权限请求）才授予持久化，或者仅在特定条件下自动授予（如已安装 PWA、站点被书签等）。

`navigator.storage.persisted()` 查询当前是否已持久化。

**驱逐策略（Eviction Policy）**：
当存储空间不足时，浏览器需要决定清除哪些来源的数据。Chrome 使用 LRU（Least Recently Used）策略：清除最近最少使用的来源。Firefox 也使用类似的 LRU 策略。Safari 的策略更为激进，可能在浏览器关闭时清除某些存储。

**各存储类型的驱逐行为**：

- **Cache API**：属于"临时"存储，在压力下的首批清除目标。
- **IndexedDB**：同样属于临时存储，但如果来源获得了持久化权限，IndexedDB 数据受到保护。
- **LocalStorage**：通常不会被自动清除（除非整个来源的数据被清除），但容量极小。
- **OPFS**：行为类似于 Cache API 和 IndexedDB，受配额和持久化状态约束。

### 9.3 跨浏览器的配额差异

配额行为在不同浏览器之间存在显著差异，这是跨浏览器存储工程的持续挑战：

**Chrome / Edge**：

- 临时存储配额约为可用磁盘空间的 60%（非移动设备）或较低比例（移动设备）。
- 单个来源的配额有上限（曾经为 6GB，但随版本变化）。
- `persist()` 在已安装 PWA 或用户交互频繁时自动授予。

**Firefox**：

- 临时存储配额约为可用磁盘空间的 50%。
- 单个来源配额上限约为 2GB（可能变化）。
- `persist()` 通常需要显式用户许可。

**Safari**：

- 临时存储配额更为保守，特别是 iOS 上（约 1GB 总量，单个来源可能更低）。
- 7 天后清除未访问站点的数据（ITP 策略的一部分）。
- `persist()` 支持有限；7 天清除规则可能覆盖持久化请求。

**这些差异的工程含义**：Web 应用不能假设特定的配额大小。必须优雅地处理 `QuotaExceededError`，实施分层存储策略（优先保留最重要的数据），并定期清理过期或低优先级的缓存条目。

---

## 10. 工程决策矩阵

Web 缓存和存储技术的选择应当基于系统性的决策框架，而非个人偏好。

### 10.1 决策维度定义

我们定义以下决策维度，每个维度根据场景需求确定权重：

| 维度 | 描述 | 取值范围 |
|------|------|----------|
| **容量需求** | 需要存储的数据总量 | MB 级 / GB 级 |
| **一致性要求** | 允许缓存与源数据的最大偏差时间 | 实时 / 秒级 / 分钟级 / 小时级 |
| **结构复杂度** | 数据是否需要索引、查询、事务 | 键值 / 结构化 / 文件级 |
| **离线可用性** | 是否必须在无网络时可用 | 是 / 否 |
| **跨会话持久化** | 数据是否需要跨浏览器会话保留 | 是 / 否 |
| **写入频率** | 数据更新的频繁程度 | 低（配置）/ 中（用户数据）/ 高（实时流） |
| **跨标签页共享** | 是否需要在同源的多个标签页间共享 | 是 / 否 |
| **安全隔离** | 是否需要严格的域/路径隔离 | 标准 / 增强（Partitioned） |

### 10.2 场景化决策路径

**场景 A：静态资源缓存（JS/CSS/图片）**

- 容量：MB 级
- 一致性：构建时确定，永不改变（URL 含哈希）
- 结构：键值（URL → 响应体）
- 离线：可选
- 决策：**Service Worker Cache API + CacheFirst 策略**。HTTP 层配置 `Cache-Control: public, max-age=31536000, immutable`。

**场景 B：用户生成内容离线编辑**

- 容量：MB-GB 级（文档、图片）
- 一致性：用户为权威源
- 结构：结构化（文档元数据 + 内容）
- 离线：必须
- 跨会话：是
- 决策：**IndexedDB 存储元数据和索引，OPFS 存储大型文件内容**。配合 `navigator.storage.persist()` 请求持久化。

**场景 C：实时仪表盘数据**

- 容量：MB 级
- 一致性：秒级
- 结构：结构化
- 离线：可选（显示最后已知值）
- 决策：**Service Worker StaleWhileRevalidate**，后台 API 轮询。短期数据存内存，历史数据可选 IndexedDB。

**场景 D：用户偏好设置**

- 容量：KB 级
- 一致性：用户操作后立即生效
- 结构：键值
- 跨标签页：是
- 决策：**LocalStorage**（小量、跨标签同步）或 **Cookie**（需要在每次请求中自动发送到服务器）。如果写入频繁（如实时主题切换），使用 IndexedDB 或内存缓存避免 LocalStorage 同步阻塞。

**场景 E：大规模客户端数据分析**

- 容量：GB 级
- 结构：需要索引和范围查询
- 写入频率：高（批量导入）
- 决策：**IndexedDB** 是唯一选择。使用批量事务写入，精心设计的索引避免全表扫描。考虑数据分片（sharding）到多个对象存储以并行化操作。

---

## 11. 反例与边界情况

缓存的正确性依赖于一系列假设，而这些假设在实践中经常失效。理解边界情况是避免生产事故的关键。

### 11.1 何时缓存会失败

**反例 1：Vary 头的笛卡尔爆炸**
假设一个 API 响应设置 `Vary: Accept-Language, Accept-Encoding, DNT`。如果每个头有 5 个可能值，缓存需要为同一 URL 存储 5³ = 125 个变体。如果再加上 `Cookie` 或 `Authorization`，变体数量趋于无穷。某些缓存实现会丢弃变体过多的条目，导致意外的缓存未命中。

**反例 2：Clock Skew 导致的新鲜度错误**
如果服务器时钟比客户端快 1 小时，一个设置 `Expires`（而非 `max-age`）的响应在客户端看来已经过期，即使它实际上是新鲜的。这说明了为什么 `max-age` 优于 `Expires`。

**反例 3：条件请求的竞态条件**
客户端 A 获取资源并缓存 ETag `"v1"`。服务器更新资源为 `"v2"`。客户端 A 发送 `If-None-Match: "v1"`。在请求传输过程中，服务器再次更新为 `"v3"`。服务器返回 `200 OK` 和 `"v3"`。这是正确的行为，但如果客户端逻辑假设"如果我没有收到 304，收到的就是 `v2`"，可能导致逻辑错误。

**反例 4：PATCH 请求的非幂等性与缓存**
HTTP 规范规定 PATCH 不是安全方法，但可以是幂等的。然而，PATCH 的响应默认不可缓存。如果开发者错误地对 PATCH 响应设置 `Cache-Control: max-age=3600`，某些缓存可能错误地缓存它，导致后续 GET 请求返回 PATCH 的响应体（这是一个协议违规，但某些实现可能存在 bug）。

### 11.2 Opaque Response 陷阱

当 Service Worker 使用 `fetch()` 请求跨域资源且 CORS 未配置时，浏览器返回一个 **Opaque Response**。Opaque Response 的关键特征：

- `response.type === 'opaque'`
- 无法读取响应体、状态码或头（全为零/空）。
- **可以**被 Cache API 存储和后续 `cache.match()` 使用。
- 但缓存 Opaque Response 对 Quota 的计算有惩罚效应：某些浏览器将其计为显著更大的大小（如固定 7MB），以防止跨域信息泄露通过 Quota 侧信道。

**工程陷阱**：使用 `cache.addAll()` 预缓存第三方资源（如 Google Fonts）时，如果未正确配置 CORS（`crossorigin` 属性），资源会以 Opaque Response 形式缓存。这不仅浪费了配额（惩罚大小），而且如果资源实际上加载失败（如 404），Service Worker 无法区分成功和失败——它只能缓存 Opaque Response。

解决方案：对所有跨域资源显式添加 `crossorigin` 属性（对于字体、图片），确保服务器返回适当的 `Access-Control-Allow-Origin` 头，使响应类型变为 `cors` 而非 `opaque`。

### 11.3 配额驱逐的非确定性

浏览器存储驱逐的时机和顺序在不同浏览器、甚至同一浏览器的不同运行中都可能不同。这种非确定性导致以下工程问题：

**反例 5：依赖驱逐顺序的数据一致性**
假设应用将数据存储在两个 IndexedDB 对象存储中：`metadata` 和 `content`。如果 `metadata` 较小而 `content` 较大，在配额压力下，浏览器可能驱逐 `content` 但保留 `metadata`。如果应用启动时读取 `metadata` 并假设对应的 `content` 存在，就会遇到缺失数据错误。

**防御性策略**：

1. 将关联数据存储在单一对象存储中，或使用外键关系在读取时验证关联数据的存在性。
2. 在应用启动时执行"完整性检查"，验证所有预期的存储分区是否可访问。
3. 为关键数据请求 `navigator.storage.persist()`，但不能假设请求一定成功。
4. 实施优雅的降级路径：如果存储数据丢失，从服务器重新获取或重新计算。

---

## 12. TypeScript 参考实现

以下六个 TypeScript 示例展示了本文档中讨论的核心概念的工程实现。每个示例都包含类型定义、实现逻辑和单元测试级别的使用示例。

### 12.1 CacheStorage TTL 包装器

Cache API 本身不提供 TTL 语义。以下实现通过将元数据（过期时间）与响应一起存储，为 Cache API 添加了 TTL 支持。

```typescript
/**
 * CacheStorageTTLWrapper
 *
 * 为 Cache API 添加 TTL（生存时间）语义。通过将元数据嵌入 Response 的自定义头中，
 * 实现对缓存条目的自动过期检查，无需外部存储。
 *
 * 设计考量：
 * - 使用 X-TTL-Meta 头存储序列化的元数据，避免额外 IndexedDB 依赖。
 * - 支持可变 TTL：不同请求可以有不同的 TTL。
 * - 惰性清理：在 match 时检查过期，而非定时扫描。
 */
interface TTLMetadata {
  storedAt: number;      // 存储时间戳（毫秒）
  ttlSeconds: number;    // TTL（秒）
  originalUrl: string;   // 原始请求 URL
}

const META_HEADER = 'X-TTL-Meta';

export class CacheStorageTTLWrapper {
  private cacheName: string;

  constructor(cacheName: string) {
    this.cacheName = cacheName;
  }

  async open(): Promise<Cache> {
    return caches.open(this.cacheName);
  }

  /**
   * 存储响应并附加 TTL 元数据
   */
  async put(request: RequestInfo, response: Response, ttlSeconds: number): Promise<void> {
    const cache = await this.open();
    const meta: TTLMetadata = {
      storedAt: Date.now(),
      ttlSeconds,
      originalUrl: typeof request === 'string' ? request : request.url,
    };

    // 克隆响应以避免修改原始响应
    const cloned = response.clone();
    const headers = new Headers(cloned.headers);
    headers.set(META_HEADER, JSON.stringify(meta));

    const responseWithMeta = new Response(cloned.body, {
      status: cloned.status,
      statusText: cloned.statusText,
      headers,
    });

    await cache.put(request, responseWithMeta);
  }

  /**
   * 匹配请求，如果条目存在但已过期则自动删除并返回 undefined
   */
  async match(request: RequestInfo): Promise<Response | undefined> {
    const cache = await this.open();
    const response = await cache.match(request);

    if (!response) return undefined;

    const metaHeader = response.headers.get(META_HEADER);
    if (!metaHeader) {
      // 无 TTL 元数据的传统条目，视为永不过期
      return response;
    }

    const meta: TTLMetadata = JSON.parse(metaHeader);
    const now = Date.now();
    const elapsedMs = now - meta.storedAt;
    const ttlMs = meta.ttlSeconds * 1000;

    if (elapsedMs > ttlMs) {
      // TTL 过期：删除条目并返回未命中
      await cache.delete(request);
      return undefined;
    }

    // 返回原始响应（移除元数据头以保持透明性）
    const cleanHeaders = new Headers(response.headers);
    cleanHeaders.delete(META_HEADER);
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: cleanHeaders,
    });
  }

  /**
   * 批量存储，适用于预缓存场景
   */
  async putAll(entries: Array<{ request: RequestInfo; response: Response; ttlSeconds: number }>): Promise<void> {
    await Promise.all(entries.map(e => this.put(e.request, e.response, e.ttlSeconds)));
  }

  /**
   * 获取条目的剩余 TTL（秒），未命中返回 -1
   */
  async getRemainingTTL(request: RequestInfo): Promise<number> {
    const cache = await this.open();
    const response = await cache.match(request);
    if (!response) return -1;

    const metaHeader = response.headers.get(META_HEADER);
    if (!metaHeader) return Infinity;

    const meta: TTLMetadata = JSON.parse(metaHeader);
    const elapsedMs = Date.now() - meta.storedAt;
    const remainingMs = meta.ttlSeconds * 1000 - elapsedMs;
    return Math.max(0, Math.floor(remainingMs / 1000));
  }
}

// ===== 使用示例 =====
async function exampleTTLWrapper(): Promise<void> {
  const cache = new CacheStorageTTLWrapper('api-cache-v1');

  const request = '/api/user/profile';
  const response = new Response(JSON.stringify({ id: 1, name: 'Alice' }), {
    headers: { 'Content-Type': 'application/json' },
  });

  // 缓存 5 分钟
  await cache.put(request, response, 300);

  // 立即命中
  const hit = await cache.match(request);
  console.log('Hit:', hit?.status); // 200

  // 查询剩余 TTL
  const ttl = await cache.getRemainingTTL(request);
  console.log('Remaining TTL:', ttl, 'seconds');
}
```

### 12.2 HTTP 缓存验证器

以下实现根据 RFC 9111 的规则，判断一个缓存响应是否仍然可用（fresh）或需要重新验证（stale）。

```typescript
/**
 * HTTPCacheValidator
 *
 * 实现 RFC 9111 的响应新鲜度评估和条件请求生成逻辑。
 * 输入为已缓存的响应头集合，输出为新鲜度状态和重新验证建议。
 */

export type FreshnessState = 'fresh' | 'stale' | 'revalidate-required' | 'no-cache';

export interface FreshnessResult {
  state: FreshnessState;
  reason: string;
  age: number;              // 当前 Age（秒）
  maxAge: number;           // 有效 max-age（秒，-1 表示未指定）
  remainingFreshness: number; // 剩余新鲜期（秒，负数表示已过期）
  suggestedValidator?: 'etag' | 'last-modified' | 'both';
}

export class HTTPCacheValidator {
  /**
   * 解析 Cache-Control 头为指令映射
   */
  static parseCacheControl(header: string | null): Map<string, string | true> {
    const directives = new Map<string, string | true>();
    if (!header) return directives;

    for (const directive of header.split(',').map(s => s.trim())) {
      const [name, value] = directive.split('=', 2).map(s => s.trim().toLowerCase());
      directives.set(name, value ?? true);
    }
    return directives;
  }

  /**
   * 评估缓存条目的新鲜度状态
   *
   * @param cachedHeaders 缓存的响应头（Headers 对象或普通对象）
   * @param requestTime 原始请求时间（Unix 毫秒）
   * @param responseTime 原始响应时间（Unix 毫秒）
   * @param now 当前时间（Unix 毫秒，默认 Date.now()）
   */
  static evaluateFreshness(
    cachedHeaders: Headers | Record<string, string>,
    requestTime: number,
    responseTime: number,
    now: number = Date.now()
  ): FreshnessResult {
    const getHeader = (name: string): string | null => {
      if (cachedHeaders instanceof Headers) {
        return cachedHeaders.get(name);
      }
      // 普通对象，大小写不敏感查找
      const key = Object.keys(cachedHeaders).find(k => k.toLowerCase() === name.toLowerCase());
      return key ? cachedHeaders[key] ?? null : null;
    };

    const cc = this.parseCacheControl(getHeader('Cache-Control'));

    // 检查 no-store：绝对不可使用
    if (cc.has('no-store')) {
      return {
        state: 'no-cache',
        reason: 'Response has Cache-Control: no-store',
        age: 0,
        maxAge: 0,
        remainingFreshness: 0,
      };
    }

    // 检查 no-cache：必须重新验证
    if (cc.has('no-cache')) {
      const hasValidator = !!getHeader('ETag') || !!getHeader('Last-Modified');
      return {
        state: 'revalidate-required',
        reason: 'Response has Cache-Control: no-cache',
        age: 0,
        maxAge: 0,
        remainingFreshness: 0,
        suggestedValidator: hasValidator
          ? (getHeader('ETag') ? (getHeader('Last-Modified') ? 'both' : 'etag') : 'last-modified')
          : undefined,
      };
    }

    // 计算 Age
    const ageHeader = getHeader('Age');
    const apparentAge = Math.max(0, Math.floor((responseTime - requestTime) / 1000));
    const correctedAge = ageHeader ? Math.max(apparentAge, parseInt(ageHeader, 10)) : apparentAge;
    const residentTime = Math.floor((now - responseTime) / 1000);
    const age = correctedAge + residentTime;

    // 确定 max-age
    let maxAge = -1;
    if (cc.has('s-maxage')) {
      maxAge = parseInt(String(cc.get('s-maxage')), 10);
    } else if (cc.has('max-age')) {
      maxAge = parseInt(String(cc.get('max-age')), 10);
    } else {
      // 检查 Expires
      const expires = getHeader('Expires');
      if (expires) {
        const expiresTime = Date.parse(expires);
        if (!isNaN(expiresTime)) {
          maxAge = Math.floor((expiresTime - responseTime) / 1000);
        }
      } else {
        // 启发式缓存：使用 Last-Modified
        const lastModified = getHeader('Last-Modified');
        if (lastModified) {
          const lmTime = Date.parse(lastModified);
          if (!isNaN(lmTime)) {
            const timeSinceModification = responseTime - lmTime;
            maxAge = Math.floor(timeSinceModification / 1000 / 10); // RFC 7234 启发式：10%
          }
        }
      }
    }

    if (maxAge < 0) {
      // 无可用的新鲜度信息
      return {
        state: 'stale',
        reason: 'No explicit freshness information and heuristic not applicable',
        age,
        maxAge: -1,
        remainingFreshness: 0,
      };
    }

    const remainingFreshness = maxAge - age;

    if (remainingFreshness > 0) {
      return {
        state: 'fresh',
        reason: `Age (${age}s) < max-age (${maxAge}s)`,
        age,
        maxAge,
        remainingFreshness,
      };
    }

    // 已过期，检查 must-revalidate
    if (cc.has('must-revalidate') || cc.has('proxy-revalidate')) {
      return {
        state: 'revalidate-required',
        reason: 'Response expired and must-revalidate is set',
        age,
        maxAge,
        remainingFreshness,
        suggestedValidator: getHeader('ETag')
          ? (getHeader('Last-Modified') ? 'both' : 'etag')
          : (getHeader('Last-Modified') ? 'last-modified' : undefined),
      };
    }

    return {
      state: 'stale',
      reason: `Response expired (age=${age}s, max-age=${maxAge}s)`,
      age,
      maxAge,
      remainingFreshness,
    };
  }

  /**
   * 根据缓存响应生成条件请求头
   */
  static buildConditionalHeaders(
    cachedHeaders: Headers | Record<string, string>
  ): Record<string, string> {
    const getHeader = (name: string): string | null => {
      if (cachedHeaders instanceof Headers) return cachedHeaders.get(name);
      const key = Object.keys(cachedHeaders).find(k => k.toLowerCase() === name.toLowerCase());
      return key ? cachedHeaders[key] ?? null : null;
    };

    const conditional: Record<string, string> = {};

    const etag = getHeader('ETag');
    if (etag) {
      conditional['If-None-Match'] = etag;
    }

    const lastModified = getHeader('Last-Modified');
    if (lastModified) {
      conditional['If-Modified-Since'] = lastModified;
    }

    return conditional;
  }
}

// ===== 使用示例 =====
function exampleValidator(): void {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=3600, must-revalidate',
    'ETag': '"abc123"',
    'Last-Modified': 'Mon, 04 May 2026 10:00:00 GMT',
  });

  const now = Date.now();
  const requestTime = now - 5000; // 5 秒前请求
  const responseTime = now - 4000; // 4 秒前响应

  const result = HTTPCacheValidator.evaluateFreshness(headers, requestTime, responseTime, now);
  console.log('Freshness:', result.state); // fresh
  console.log('Remaining:', result.remainingFreshness, 'seconds'); // ~3596

  const conditionals = HTTPCacheValidator.buildConditionalHeaders(headers);
  console.log('Conditional headers:', conditionals);
  // { 'If-None-Match': '"abc123"', 'If-Modified-Since': 'Mon, 04 May 2026 10:00:00 GMT' }
}
```

### 12.3 IndexedDB 查询优化器

以下实现提供一个类型安全的 IndexedDB 包装器，包含自动索引选择和查询计划生成。

```typescript
/**
 * IndexedDBQueryOptimizer
 *
 * 类型安全的 IndexedDB 包装器，实现索引选择启发式：
 * 1. 精确键匹配优先于范围查询。
 * 2. 复合索引的前缀匹配优先于单列索引。
 * 3. 唯一索引优先于非唯一索引（减少扫描量）。
 * 4. 支持查询计划解释和性能估算。
 */

export interface IndexSchema {
  name: string;
  keyPath: string | string[];
  unique: boolean;
  multiEntry?: boolean;
}

export interface ObjectStoreSchema {
  name: string;
  keyPath: string | string[] | null;
  autoIncrement: boolean;
  indexes: IndexSchema[];
}

export interface QueryPlan {
  strategy: 'primary-key' | 'index-scan' | 'index-exact' | 'full-scan';
  selectedIndex?: string;
  estimatedCost: number; // 相对成本，越小越好
  filterRemaining: boolean; // 是否需要内存过滤
  description: string;
}

export interface QueryFilter<T> {
  key: keyof T;
  operator: 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between';
  value: unknown;
  valueUpper?: unknown; // for 'between'
}

export class IndexedDBQueryOptimizer<T extends Record<string, unknown>> {
  private db: IDBDatabase;
  private storeName: string;
  private schema: ObjectStoreSchema;

  constructor(db: IDBDatabase, storeName: string, schema: ObjectStoreSchema) {
    this.db = db;
    this.storeName = storeName;
    this.schema = schema;
  }

  /**
   * 为给定的过滤器集合生成查询计划
   */
  planQuery(filters: QueryFilter<T>[]): QueryPlan {
    if (filters.length === 0) {
      return {
        strategy: 'full-scan',
        estimatedCost: Infinity,
        filterRemaining: false,
        description: 'No filters provided; full object store scan required',
      };
    }

    // 尝试找到精确匹配主键的过滤器
    const primaryKeyFilter = filters.find(f => {
      if (this.schema.keyPath === null) return false;
      const kp = Array.isArray(this.schema.keyPath) ? this.schema.keyPath : [this.schema.keyPath];
      return f.operator === 'eq' && kp.length === 1 && f.key === kp[0];
    });

    if (primaryKeyFilter) {
      return {
        strategy: 'primary-key',
        estimatedCost: 1,
        filterRemaining: filters.length > 1,
        description: `Exact primary key lookup on ${String(primaryKeyFilter.key)}`,
      };
    }

    // 尝试找到最佳索引
    let bestPlan: QueryPlan | null = null;

    for (const index of this.schema.indexes) {
      const indexKeys = Array.isArray(index.keyPath) ? index.keyPath : [index.keyPath];

      // 检查索引前缀是否匹配过滤器的 eq 条件
      const matchingFilters: QueryFilter<T>[] = [];
      for (const ik of indexKeys) {
        const match = filters.find(f => f.key === ik && (matchingFilters.length === 0 ? true : f.operator === 'eq'));
        if (!match) break;
        matchingFilters.push(match);
      }

      if (matchingFilters.length === 0) continue;

      // 计算成本：剩余索引键越多（范围查询），成本越高
      const hasRange = matchingFilters.some(f => f.operator !== 'eq');
      const remainingKeys = indexKeys.length - matchingFilters.length;
      const cost = hasRange ? 100 : 10; // 范围扫描比精确查找昂贵
      const adjustedCost = cost * (remainingKeys + 1) * (index.unique ? 0.5 : 1);

      const plan: QueryPlan = {
        strategy: hasRange ? 'index-scan' : 'index-exact',
        selectedIndex: index.name,
        estimatedCost: adjustedCost,
        filterRemaining: matchingFilters.length < filters.length || remainingKeys > 0,
        description: `${hasRange ? 'Range scan' : 'Exact match'} on index "${index.name}" ` +
          `(${matchingFilters.length}/${indexKeys.length} keys matched)`,
      };

      if (!bestPlan || plan.estimatedCost < bestPlan.estimatedCost) {
        bestPlan = plan;
      }
    }

    if (bestPlan) return bestPlan;

    // 回退到全表扫描
    return {
      strategy: 'full-scan',
      estimatedCost: 10000,
      filterRemaining: true,
      description: 'No suitable index found; full object store scan with in-memory filtering',
    };
  }

  /**
   * 执行查询，自动选择最优索引
   */
  async query(filters: QueryFilter<T>[]): Promise<T[]> {
    const plan = this.planQuery(filters);
    const tx = this.db.transaction(this.storeName, 'readonly');
    const store = tx.objectStore(this.storeName);

    let request: IDBRequest;

    if (plan.strategy === 'primary-key') {
      const pkFilter = filters.find(f => f.operator === 'eq')!;
      request = store.get(pkFilter.value as IDBValidKey);
    } else if (plan.strategy === 'index-exact' || plan.strategy === 'index-scan') {
      const index = store.index(plan.selectedIndex!);
      const idxFilters = filters.filter(f => {
        const idxKeys = Array.isArray(index.keyPath) ? index.keyPath : [index.keyPath];
        return idxKeys.includes(String(f.key));
      });

      if (idxFilters.length === 1 && idxFilters[0].operator === 'eq') {
        request = index.getAll(idxFilters[0].value as IDBValidKey);
      } else if (idxFilters.length === 1 && idxFilters[0].operator === 'between') {
        const range = IDBKeyRange.bound(
          idxFilters[0].value as IDBValidKey,
          idxFilters[0].valueUpper as IDBValidKey,
          false, false
        );
        request = index.getAll(range);
      } else {
        // 其他范围查询
        const f = idxFilters[0];
        let range: IDBKeyRange | undefined;
        switch (f.operator) {
          case 'gt': range = IDBKeyRange.lowerBound(f.value as IDBValidKey, true); break;
          case 'gte': range = IDBKeyRange.lowerBound(f.value as IDBValidKey, false); break;
          case 'lt': range = IDBKeyRange.upperBound(f.value as IDBValidKey, true); break;
          case 'lte': range = IDBKeyRange.upperBound(f.value as IDBValidKey, false); break;
        }
        request = index.getAll(range);
      }
    } else {
      request = store.getAll();
    }

    return new Promise<T[]>((resolve, reject) => {
      request.onsuccess = () => {
        let results: T[] = Array.isArray(request.result) ? request.result : [request.result].filter(Boolean);

        // 内存过滤剩余条件
        if (plan.filterRemaining) {
          results = results.filter(item => filters.every(f => this.matchesFilter(item, f)));
        }

        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  private matchesFilter(item: T, filter: QueryFilter<T>): boolean {
    const value = item[filter.key];
    switch (filter.operator) {
      case 'eq': return value === filter.value;
      case 'gt': return value !== undefined && value !== null && (value as Comparable) > (filter.value as Comparable);
      case 'gte': return value !== undefined && value !== null && (value as Comparable) >= (filter.value as Comparable);
      case 'lt': return value !== undefined && value !== null && (value as Comparable) < (filter.value as Comparable);
      case 'lte': return value !== undefined && value !== null && (value as Comparable) <= (filter.value as Comparable);
      case 'between':
        return value !== undefined && value !== null
          && (value as Comparable) >= (filter.value as Comparable)
          && (value as Comparable) <= (filter.valueUpper as Comparable);
    }
  }
}

type Comparable = string | number | Date;

// ===== 使用示例 =====
interface Product {
  id: number;
  category: string;
  price: number;
  name: string;
}

const productSchema: ObjectStoreSchema = {
  name: 'products',
  keyPath: 'id',
  autoIncrement: false,
  indexes: [
    { name: 'category', keyPath: 'category', unique: false },
    { name: 'price', keyPath: 'price', unique: false },
    { name: 'category_price', keyPath: ['category', 'price'], unique: false },
  ],
};

async function exampleQueryOptimizer(db: IDBDatabase): Promise<void> {
  const optimizer = new IndexedDBQueryOptimizer<Product>(db, 'products', productSchema);

  // 查询计划分析
  const plan = optimizer.planQuery([
    { key: 'category', operator: 'eq', value: 'electronics' },
    { key: 'price', operator: 'lte', value: 500 },
  ]);
  console.log('Plan:', plan.description);
  // 预期：使用 category_price 索引的前缀匹配（category=electronics），然后范围扫描 price

  // 执行查询
  const results = await optimizer.query([
    { key: 'category', operator: 'eq', value: 'electronics' },
    { key: 'price', operator: 'lte', value: 500 },
  ]);
  console.log('Results:', results.length);
}
```

### 12.4 存储配额估算器

以下实现封装 Storage Quota API，提供跨浏览器兼容的配额监控和存储压力预警。

```typescript
/**
 * StorageQuotaEstimator
 *
 * 封装 navigator.storage.estimate() 和 navigator.storage.persist()，提供：
 * - 配额监控与历史趋势
 * - 存储压力预警
 * - 持久化状态管理
 * - 跨浏览器差异处理
 */

export interface QuotaSnapshot {
  timestamp: number;
  usage: number;
  quota: number;
  usageDetails?: Record<string, number>;
}

export interface StoragePressure {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical';
  usageRatio: number;
  estimatedRemainingBytes: number;
  recommendation: string;
}

export class StorageQuotaEstimator {
  private history: QuotaSnapshot[] = [];
  private maxHistoryLength: number;

  constructor(options: { maxHistoryLength?: number } = {}) {
    this.maxHistoryLength = options.maxHistoryLength ?? 100;
  }

  /**
   * 获取当前配额估算
   */
  async estimate(): Promise<QuotaSnapshot> {
    if (!navigator.storage || !navigator.storage.estimate) {
      throw new Error('Storage Quota API not supported');
    }

    const estimate = await navigator.storage.estimate();
    const snapshot: QuotaSnapshot = {
      timestamp: Date.now(),
      usage: estimate.usage ?? 0,
      quota: estimate.quota ?? 0,
      usageDetails: (estimate as Record<string, unknown>).usageDetails as Record<string, number> | undefined,
    };

    this.history.push(snapshot);
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }

    return snapshot;
  }

  /**
   * 计算存储压力级别
   */
  async getPressure(): Promise<StoragePressure> {
    const snapshot = await this.estimate();

    if (snapshot.quota === 0) {
      return {
        level: 'none',
        usageRatio: 0,
        estimatedRemainingBytes: 0,
        recommendation: 'Quota information unavailable',
      };
    }

    const usageRatio = snapshot.usage / snapshot.quota;
    const estimatedRemainingBytes = snapshot.quota - snapshot.usage;

    let level: StoragePressure['level'];
    let recommendation: string;

    if (usageRatio < 0.3) {
      level = 'none';
      recommendation = 'Storage usage healthy.';
    } else if (usageRatio < 0.5) {
      level = 'low';
      recommendation = 'Monitor storage growth; consider cleanup policies.';
    } else if (usageRatio < 0.7) {
      level = 'medium';
      recommendation = 'Implement LRU eviction for non-critical caches.';
    } else if (usageRatio < 0.85) {
      level = 'high';
      recommendation = 'Aggressively clear temporary caches; request persistent storage for critical data.';
    } else {
      level = 'critical';
      recommendation = 'Immediate action required: clear all non-essential storage or request user cleanup.';
    }

    return { level, usageRatio, estimatedRemainingBytes, recommendation };
  }

  /**
   * 计算存储使用趋势（每秒字节数）
   */
  getGrowthRate(): number {
    if (this.history.length < 2) return 0;

    const first = this.history[0];
    const last = this.history[this.history.length - 1];
    const timeDeltaSeconds = (last.timestamp - first.timestamp) / 1000;

    if (timeDeltaSeconds === 0) return 0;
    return (last.usage - first.usage) / timeDeltaSeconds;
  }

  /**
   * 估算配额耗尽时间（秒），基于当前趋势
   */
  async estimateExhaustion(): Promise<number | Infinity> {
    const snapshot = await this.estimate();
    const rate = this.getGrowthRate();

    if (rate <= 0) return Infinity;
    const remaining = snapshot.quota - snapshot.usage;
    return remaining / rate;
  }

  /**
   * 请求持久化存储
   */
  async requestPersistence(): Promise<boolean> {
    if (!navigator.storage || !navigator.storage.persist) {
      return false;
    }
    return navigator.storage.persist();
  }

  /**
   * 检查是否已持久化
   */
  async isPersistent(): Promise<boolean> {
    if (!navigator.storage || !navigator.storage.persisted) {
      return false;
    }
    return navigator.storage.persisted();
  }

  /**
   * 获取按存储类型的使用细分（Chrome 特性）
   */
  async getBreakdown(): Promise<Record<string, number>> {
    const snapshot = await this.estimate();
    return snapshot.usageDetails ?? { total: snapshot.usage };
  }

  /**
   * 根据 LRU 策略清理 Cache API 中的过期条目
   */
  async cleanupCacheAPI(cacheName: string, maxEntries: number): Promise<number> {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length <= maxEntries) return 0;

    // 注意：Cache API 不暴露访问时间，所以这里使用请求 URL 的字母顺序作为近似
    // 生产环境中，应结合 12.1 中的 TTL 元数据实现真正的 LRU
    const sorted = keys.slice().sort((a, b) => {
      const urlA = typeof a === 'string' ? a : a.url;
      const urlB = typeof b === 'string' ? b : b.url;
      return urlA.localeCompare(urlB);
    });

    const toDelete = sorted.slice(0, sorted.length - maxEntries);
    await Promise.all(toDelete.map(req => cache.delete(req)));
    return toDelete.length;
  }
}

// ===== 使用示例 =====
async function exampleQuotaEstimator(): Promise<void> {
  const estimator = new StorageQuotaEstimator({ maxHistoryLength: 50 });

  // 初始快照
  const snapshot = await estimator.estimate();
  console.log(`Using ${(snapshot.usage / 1024 / 1024).toFixed(2)} MB / ${(snapshot.quota / 1024 / 1024).toFixed(2)} MB`);

  // 压力评估
  const pressure = await estimator.getPressure();
  console.log(`Pressure: ${pressure.level} (${(pressure.usageRatio * 100).toFixed(1)}%)`);
  console.log(`Recommendation: ${pressure.recommendation}`);

  // 持久化请求
  const isPersistent = await estimator.isPersistent();
  if (!isPersistent && pressure.level === 'high') {
    const granted = await estimator.requestPersistence();
    console.log('Persistence granted:', granted);
  }

  // 使用细分
  const breakdown = await estimator.getBreakdown();
  console.log('Storage breakdown:', breakdown);
}
```

### 12.5 缓存策略基准测试框架

以下实现提供一个可运行的 Service Worker 缓存策略基准测试框架，用于量化不同策略的 TTFB 和数据新鲜度。

```typescript
/**
 * CacheStrategyBenchmark
 *
 * 基准测试框架，模拟不同网络条件和缓存状态，测量：
 * - Time To First Byte (TTFB)
 * - 数据新鲜度（staleness）
 * - 网络请求节省率
 * - 离线可用性
 */

export interface BenchmarkScenario {
  name: string;
  networkLatencyMs: number;
  networkReliability: number; // 0-1，请求成功概率
  cacheHitRate: number;       // 0-1，缓存中存在条目的概率
  cacheAgeSeconds: number;    // 缓存条目的年龄
  resourceMaxAgeSeconds: number;
}

export interface BenchmarkResult {
  scenario: string;
  strategy: string;
  ttfbMs: number;
  servedFromCache: boolean;
  isStale: boolean;
  stalenessSeconds: number;
  networkSaved: boolean;
  offlineCapable: boolean;
  success: boolean;
}

export type CacheStrategy =
  | 'CacheFirst'
  | 'NetworkFirst'
  | 'StaleWhileRevalidate'
  | 'NetworkOnly'
  | 'CacheOnly';

export class CacheStrategyBenchmark {
  private rng: () => number;

  constructor(seed: number = Date.now()) {
    // 简单的线性同余生成器，保证可重复
    let s = seed;
    this.rng = () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  /**
   * 运行单次策略模拟
   */
  simulate(strategy: CacheStrategy, scenario: BenchmarkScenario): BenchmarkResult {
    const cacheHit = this.rng() < scenario.cacheHitRate;
    const networkSuccess = this.rng() < scenario.networkReliability;

    let ttfbMs = 0;
    let servedFromCache = false;
    let isStale = false;
    let stalenessSeconds = 0;
    let networkSaved = false;
    let offlineCapable = false;
    let success = false;

    const cacheFresh = cacheHit && scenario.cacheAgeSeconds < scenario.resourceMaxAgeSeconds;

    switch (strategy) {
      case 'CacheFirst': {
        offlineCapable = cacheHit;
        if (cacheHit) {
          ttfbMs = 5; // 缓存命中极快
          servedFromCache = true;
          isStale = !cacheFresh;
          stalenessSeconds = isStale ? scenario.cacheAgeSeconds - scenario.resourceMaxAgeSeconds : 0;
          networkSaved = true;
          success = true;
        } else if (networkSuccess) {
          ttfbMs = scenario.networkLatencyMs;
          servedFromCache = false;
          success = true;
        } else {
          ttfbMs = scenario.networkLatencyMs;
          success = false;
        }
        break;
      }

      case 'NetworkFirst': {
        offlineCapable = cacheHit;
        const networkTimeoutMs = Math.min(3000, scenario.networkLatencyMs * 2);
        const networkFastEnough = scenario.networkLatencyMs < networkTimeoutMs;

        if (networkSuccess && networkFastEnough) {
          ttfbMs = scenario.networkLatencyMs;
          servedFromCache = false;
          success = true;
        } else if (cacheHit) {
          ttfbMs = networkTimeoutMs + 5;
          servedFromCache = true;
          isStale = !cacheFresh;
          stalenessSeconds = isStale ? scenario.cacheAgeSeconds - scenario.resourceMaxAgeSeconds : 0;
          networkSaved = false; // 网络请求已尝试
          success = true;
        } else {
          ttfbMs = scenario.networkLatencyMs;
          success = false;
        }
        break;
      }

      case 'StaleWhileRevalidate': {
        offlineCapable = cacheHit;
        if (cacheHit) {
          ttfbMs = 5;
          servedFromCache = true;
          isStale = !cacheFresh;
          stalenessSeconds = isStale ? scenario.cacheAgeSeconds - scenario.resourceMaxAgeSeconds : 0;
          networkSaved = true; // 立即响应，后台可发网络请求
          success = true;
        } else if (networkSuccess) {
          ttfbMs = scenario.networkLatencyMs;
          servedFromCache = false;
          success = true;
        } else {
          success = false;
        }
        break;
      }

      case 'NetworkOnly': {
        offlineCapable = false;
        if (networkSuccess) {
          ttfbMs = scenario.networkLatencyMs;
          success = true;
        } else {
          success = false;
        }
        break;
      }

      case 'CacheOnly': {
        offlineCapable = cacheHit;
        if (cacheHit) {
          ttfbMs = 5;
          servedFromCache = true;
          isStale = !cacheFresh;
          success = true;
        } else {
          success = false;
        }
        break;
      }
    }

    return {
      scenario: scenario.name,
      strategy,
      ttfbMs,
      servedFromCache,
      isStale,
      stalenessSeconds,
      networkSaved,
      offlineCapable,
      success,
    };
  }

  /**
   * 运行蒙特卡洛模拟，收集统计结果
   */
  runMonteCarlo(
    strategy: CacheStrategy,
    scenario: BenchmarkScenario,
    iterations: number = 1000
  ): {
    avgTtfbMs: number;
    cacheHitRatio: number;
    staleRatio: number;
    successRate: number;
    offlineAvailability: number;
    avgStalenessSeconds: number;
  } {
    const results: BenchmarkResult[] = [];

    for (let i = 0; i < iterations; i++) {
      results.push(this.simulate(strategy, scenario));
    }

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    return {
      avgTtfbMs: avg(results.map(r => r.ttfbMs)),
      cacheHitRatio: results.filter(r => r.servedFromCache).length / iterations,
      staleRatio: results.filter(r => r.isStale).length / iterations,
      successRate: results.filter(r => r.success).length / iterations,
      offlineAvailability: results.filter(r => r.offlineCapable).length / iterations,
      avgStalenessSeconds: avg(results.map(r => r.stalenessSeconds)),
    };
  }

  /**
   * 比较所有策略在特定场景下的表现
   */
  compareStrategies(
    scenario: BenchmarkScenario,
    iterations: number = 1000
  ): Record<CacheStrategy, ReturnType<typeof this.runMonteCarlo>> {
    const strategies: CacheStrategy[] = ['CacheFirst', 'NetworkFirst', 'StaleWhileRevalidate', 'NetworkOnly', 'CacheOnly'];
    const results = {} as Record<CacheStrategy, ReturnType<typeof this.runMonteCarlo>>;

    for (const strategy of strategies) {
      results[strategy] = this.runMonteCarlo(strategy, scenario, iterations);
    }

    return results;
  }
}

// ===== 使用示例 =====
function exampleBenchmark(): void {
  const benchmark = new CacheStrategyBenchmark(42);

  const scenario: BenchmarkScenario = {
    name: 'slow-unreliable-mobile',
    networkLatencyMs: 800,
    networkReliability: 0.7,
    cacheHitRate: 0.6,
    cacheAgeSeconds: 120,
    resourceMaxAgeSeconds: 300,
  };

  const comparison = benchmark.compareStrategies(scenario, 5000);

  console.log('=== Strategy Comparison ===');
  for (const [strategy, stats] of Object.entries(comparison)) {
    console.log(`\n${strategy}:`);
    console.log(`  Avg TTFB: ${stats.avgTtfbMs.toFixed(1)}ms`);
    console.log(`  Success Rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`  Offline Availability: ${(stats.offlineAvailability * 100).toFixed(1)}%`);
    console.log(`  Stale Ratio: ${(stats.staleRatio * 100).toFixed(1)}%`);
  }
}
```

### 12.6 双重键控缓存模拟器

以下实现模拟浏览器在 post-Spectre 时代的双重键控缓存行为，帮助理解缓存分区对命中率和存储的影响。

```typescript
/**
 * DoubleKeyedCacheSimulator
 *
 * 模拟浏览器双重键控缓存（Double-Keyed Caching）行为：
 * - 缓存键为 (topLevelSite, resourceURL) 而非仅 resourceURL
 * - 支持 HTTP Cache 和 CacheStorage 两种存储类型的分区
 * - 统计跨站缓存共享损失和存储膨胀
 */

interface CacheEntry {
  url: string;
  bodySize: number;
  storedAt: number;
  topLevelSite: string;
  frameSite: string;
  responseHeaders: Record<string, string>;
}

interface CacheKey {
  topLevelSite: string;
  resourceURL: string;
  storageType: 'http-cache' | 'cache-storage';
}

export class DoubleKeyedCacheSimulator {
  private httpCache: Map<string, CacheEntry> = new Map();
  private cacheStorage: Map<string, Map<string, CacheEntry>> = new Map(); // cacheName -> entries
  private accessLog: Array<{ time: number; topLevelSite: string; url: string; hit: boolean }> = [];

  private makeKey(topLevelSite: string, url: string, type: 'http-cache' | 'cache-storage'): string {
    return JSON.stringify({ topLevelSite, resourceURL: url, storageType: type });
  }

  /**
   * 模拟一次资源请求
   *
   * @param topLevelSite 用户地址栏中的顶级站点
   * @param frameSite 发起请求的具体框架（可能是第三方）
   * @param url 请求的资源 URL
   * @param bodySize 响应体大小（字节）
   * @param headers 响应头
   */
  request(
    topLevelSite: string,
    frameSite: string,
    url: string,
    bodySize: number,
    headers: Record<string, string> = {},
    options: { useCacheStorage?: string } = {}
  ): { hit: boolean; fromSharedCache: boolean; entry: CacheEntry | null } {
    const now = Date.now();
    const storageType = options.useCacheStorage ? 'cache-storage' : 'http-cache';
    const key = this.makeKey(topLevelSite, url, storageType);

    let entry: CacheEntry | undefined;

    if (storageType === 'http-cache') {
      entry = this.httpCache.get(key);
    } else {
      const store = this.cacheStorage.get(options.useCacheStorage!);
      entry = store?.get(key);
    }

    const hit = !!entry;

    // 记录访问日志
    this.accessLog.push({ time: now, topLevelSite, url, hit });

    if (hit) {
      return {
        hit: true,
        fromSharedCache: false, // 在双重键控下，所有缓存都是"私有"的
        entry,
      };
    }

    // 缓存未命中：存储新条目
    const newEntry: CacheEntry = {
      url,
      bodySize,
      storedAt: now,
      topLevelSite,
      frameSite,
      responseHeaders: headers,
    };

    if (storageType === 'http-cache') {
      this.httpCache.set(key, newEntry);
    } else {
      if (!this.cacheStorage.has(options.useCacheStorage!)) {
        this.cacheStorage.set(options.useCacheStorage!, new Map());
      }
      this.cacheStorage.get(options.useCacheStorage!)!.set(key, newEntry);
    }

    return { hit: false, fromSharedCache: false, entry: null };
  }

  /**
   * 计算如果缓存是全局共享（pre-Spectre）时的理论命中数
   */
  calculateSharedCacheMisses(): {
    actualMisses: number;
    theoreticalSharedMisses: number;
    wastedStorageBytes: number;
  } {
    // 按 URL 分组，统计每个唯一资源被存储的次数
    const urlStorageCount = new Map<string, number>();
    const urlSize = new Map<string, number>();

    for (const entry of this.httpCache.values()) {
      urlStorageCount.set(entry.url, (urlStorageCount.get(entry.url) ?? 0) + 1);
      urlSize.set(entry.url, entry.bodySize);
    }

    for (const store of this.cacheStorage.values()) {
      for (const entry of store.values()) {
        urlStorageCount.set(entry.url, (urlStorageCount.get(entry.url) ?? 0) + 1);
        urlSize.set(entry.url, entry.bodySize);
      }
    }

    let wastedStorage = 0;
    let duplicateCount = 0;

    for (const [url, count] of urlStorageCount.entries()) {
      if (count > 1) {
        duplicateCount += count - 1;
        wastedStorage += (count - 1) * (urlSize.get(url) ?? 0);
      }
    }

    return {
      actualMisses: this.accessLog.filter(a => !a.hit).length,
      theoreticalSharedMisses: 0, // 简化假设：如果共享，所有请求理论上都能命中（忽略 TTL 等）
      wastedStorageBytes: wastedStorage,
    };
  }

  /**
   * 生成按顶级站点的存储分布报告
   */
  getStorageBreakdown(): Array<{
    topLevelSite: string;
    entryCount: number;
    totalBytes: number;
    uniqueUrls: number;
  }> {
    const siteStats = new Map<string, { entryCount: number; totalBytes: number; urls: Set<string> }>();

    const accumulate = (entry: CacheEntry) => {
      const stats = siteStats.get(entry.topLevelSite) ?? { entryCount: 0, totalBytes: 0, urls: new Set() };
      stats.entryCount++;
      stats.totalBytes += entry.bodySize;
      stats.urls.add(entry.url);
      siteStats.set(entry.topLevelSite, stats);
    };

    for (const entry of this.httpCache.values()) accumulate(entry);
    for (const store of this.cacheStorage.values()) {
      for (const entry of store.values()) accumulate(entry);
    }

    return Array.from(siteStats.entries()).map(([site, stats]) => ({
      topLevelSite: site,
      entryCount: stats.entryCount,
      totalBytes: stats.totalBytes,
      uniqueUrls: stats.urls.size,
    }));
  }

  /**
   * 清除特定顶级站点的所有缓存条目（模拟浏览器清除站点数据）
   */
  clearSite(topLevelSite: string): number {
    let cleared = 0;

    for (const [key, entry] of this.httpCache.entries()) {
      if (entry.topLevelSite === topLevelSite) {
        this.httpCache.delete(key);
        cleared++;
      }
    }

    for (const store of this.cacheStorage.values()) {
      for (const [key, entry] of store.entries()) {
        if (entry.topLevelSite === topLevelSite) {
          store.delete(key);
          cleared++;
        }
      }
    }

    return cleared;
  }

  /**
   * 获取命中率统计
   */
  getHitRateStats(): {
    overallHitRate: number;
    hitRateBySite: Record<string, number>;
    hitRateByURL: Record<string, number>;
  } {
    const bySite = new Map<string, { hits: number; total: number }>();
    const byURL = new Map<string, { hits: number; total: number }>();

    for (const log of this.accessLog) {
      const siteStats = bySite.get(log.topLevelSite) ?? { hits: 0, total: 0 };
      siteStats.total++;
      if (log.hit) siteStats.hits++;
      bySite.set(log.topLevelSite, siteStats);

      const urlStats = byURL.get(log.url) ?? { hits: 0, total: 0 };
      urlStats.total++;
      if (log.hit) urlStats.hits++;
      byURL.set(log.url, urlStats);
    }

    const totalHits = this.accessLog.filter(a => a.hit).length;

    return {
      overallHitRate: this.accessLog.length > 0 ? totalHits / this.accessLog.length : 0,
      hitRateBySite: Object.fromEntries(
        Array.from(bySite.entries()).map(([k, v]) => [k, v.total > 0 ? v.hits / v.total : 0])
      ),
      hitRateByURL: Object.fromEntries(
        Array.from(byURL.entries()).map(([k, v]) => [k, v.total > 0 ? v.hits / v.total : 0])
      ),
    };
  }
}

// ===== 使用示例 =====
function exampleDoubleKeyedSimulator(): void {
  const sim = new DoubleKeyedCacheSimulator();

  // site-a.com 加载 jQuery from cdn.example.com
  sim.request('site-a.com', 'cdn.example.com', 'https://cdn.example.com/jquery.js', 89400);
  sim.request('site-a.com', 'cdn.example.com', 'https://cdn.example.com/jquery.js', 89400);

  // site-b.com 加载同一 jQuery URL
  sim.request('site-b.com', 'cdn.example.com', 'https://cdn.example.com/jquery.js', 89400);

  // site-c.com 加载同一 jQuery URL
  sim.request('site-c.com', 'cdn.example.com', 'https://cdn.example.com/jquery.js', 89400);

  const stats = sim.getHitRateStats();
  console.log('Overall hit rate:', (stats.overallHitRate * 100).toFixed(1) + '%');
  // 预期：site-a 50%（第一次未命中，第二次命中）
  // site-b 0%（未命中，因为分区）
  // site-c 0%

  const waste = sim.calculateSharedCacheMisses();
  console.log('Wasted storage due to partitioning:', (waste.wastedStorageBytes / 1024).toFixed(2), 'KB');
  // 预期：2 * 89400 bytes = 178.8 KB 重复存储

  const breakdown = sim.getStorageBreakdown();
  console.log('Storage by site:');
  for (const site of breakdown) {
    console.log(`  ${site.topLevelSite}: ${site.entryCount} entries, ${(site.totalBytes / 1024).toFixed(2)} KB`);
  }
}
```

---

## 13. 结论与未来方向

Web Caching Architecture 是一个跨越协议层、浏览器引擎层、应用层和 CDN 边缘层的复杂系统。本文档通过以下方式建立了统一的分析框架：

1. **协议精确性**：对 RFC 9111 的缓存语义进行了完整的技术解析，澄清了常见误解（如 `no-cache` 的真正含义、`Vary` 的碎片效应、启发式缓存的危险性）。

2. **形式化视角**：通过范畴论将缓存建模为幂等自函子，揭示了缓存一致性、失效和多层架构的深层结构相似性。对称差分析提供了可量化的一致性度量框架。

3. **工程可操作性**：六个生产级 TypeScript 示例展示了从 TTL 包装器到双重键控模拟器的完整实现，可直接集成到工程实践中。

4. **安全与隐私**：详细分析了 post-Spectre 时代的双重键控缓存和存储分区，量化了这些安全机制对缓存效率和 Web 架构的影响。

**未来方向**：

- **HTTP Cache Digests (RFC 9213)**：允许客户端向服务器发送其缓存内容的摘要，使服务器能够推送客户端实际需要的资源。这代表了从"拉取式缓存验证"到"推送式缓存同步"的范式转变。

- **Shared Dictionary Compression**：基于共享字典的响应压缩（如 Brotli 字典共享）将改变缓存键的语义，因为压缩后的表示依赖于字典状态。

- **Privacy Sandbox 的进一步收紧**：随着第三方 Cookie 的淘汰和 Storage Partitioning 的全面实施，跨站资源加载和缓存策略将面临进一步的限制。工程实践需要向"每站点自给自足"的架构演进。

- **Edge-Side Rendering 与流式缓存**：现代框架（如 Next.js App Router、Qwik）的流式 SSR 和 Suspense 边界对流式响应的缓存提出了新挑战。如何缓存一个尚未完全生成的响应？这是 HTTP 缓存语义尚未完全覆盖的领域。

---

## 参考文献

1. Fielding, R., Nottingham, M., & Reschke, J. (Eds.). *RFC 9111: HTTP Caching*. IETF, 2022.
2. Fielding, R., & Reschke, J. (Eds.). *RFC 7234: Hypertext Transfer Protocol (HTTP/1.1): Caching*. IETF, 2014.
3. Barth, A. *RFC 6265: HTTP State Management Mechanism*. IETF, 2011.
4. IETF HTTP Working Group. *Cookies: HTTP State Management Mechanism (draft-ietf-httpbis-rfc6265bis)*. Draft 15, 2024.
5. WHATWG. *HTML Living Standard: Web Storage, Service Workers, File System Access API*. <https://html.spec.whatwg.org/>
6. W3C. *Indexed Database API 3.0*. <https://www.w3.org/TR/IndexedDB-3/>
7. Chrome Platform Status. *Storage Quota API*. <https://developer.chrome.com/docs/storage-and-cookies/>
8. Mozilla MDN Web Docs. *HTTP Caching*. <https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching>
9. Archibald, J. *Caching best practices & max-age gotchas*. Google Developers, 2016.
10. Google Developers. *Prevent unnecessary network requests with the HTTP Cache*. <https://developer.chrome.com/docs/devtools/network/reference/>
11. Fastly. *Surrogate Keys Documentation*. <https://www.fastly.com/documentation/guides/concepts/edge-state/cache/purging/#surrogate-key-purging>
12. Cloudflare. *Cache API Documentation*. <https://developers.cloudflare.com/workers/runtime-apis/cache/>
13. Vercel. *Edge Network Caching*. <https://vercel.com/docs/edge-network/caching>
14. Apple WebKit Blog. *Preventing Tracking Prevention Tracking*. 2019. <https://webkit.org/blog/>
15. Chromium Design Docs. *HttpCache Partitioning*. <https://docs.google.com/document/d/1V0gM2LrQeXs1l0i1C5d3_8nVPTdzA6F-3gZC3Kz4XhM/>
16. Fielding, R. T. *Architectural Styles and the Design of Network-based Software Architectures*. PhD Dissertation, UC Irvine, 2000.
17. Cimpanu, C. *Chrome to start caching resources in a more efficient way*. ZDNet, 2020. (Double-keyed caching announcement)
18. IETF. *RFC 9213: Targeted HTTP Cache Control*. 2022.
19. West, M. *Cookies Having Independent Partitioned State (CHIPS)*. WICG Draft.
20. Microsoft Edge Blog. *Storage Partitioning in Microsoft Edge*. 2023.
