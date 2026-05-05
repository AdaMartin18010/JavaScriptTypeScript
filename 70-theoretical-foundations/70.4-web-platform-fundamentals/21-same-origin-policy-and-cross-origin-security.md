---
title: '同源策略与跨域安全模型'
description: 'Same-Origin Policy, CORS, CSP, COOP, COEP, Site Isolation, and Spectre mitigations in modern browsers'
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive analysis of browser cross-origin security mechanisms including Same-Origin Policy, CORS preflight logic, CSP directive enforcement, COOP/COEP cross-origin isolation, Site Isolation process architecture, and Spectre mitigation strategies.'
references:
  - 'MDN, Same-origin policy'
  - 'W3C, Fetch Standard (CORS)'
  - 'W3C, Content Security Policy Level 3'
  - 'Chromium, Site Isolation Design Doc'
  - 'Mozilla, Cross-Origin Opener Policy'
---

# 同源策略与跨域安全模型

## 目录

- [同源策略与跨域安全模型](#同源策略与跨域安全模型)
  - [目录](#目录)
  - [1. 历史与语义：同源策略的三元组](#1-历史与语义同源策略的三元组)
    - [1.1 起源与动机](#11-起源与动机)
    - [1.2 Origin 的代数定义](#12-origin-的代数定义)
    - [1.3 SOP 的 Enforcement 层级](#13-sop-的-enforcement-层级)
    - [1.4 `document.domain` 的历史与废弃](#14-documentdomain-的历史与废弃)
  - [2. CORS：跨域资源共享的协议细节](#2-cors跨域资源共享的协议细节)
    - [2.1 CORS 作为 SOP 的受控例外](#21-cors-作为-sop-的受控例外)
    - [2.2 简单请求（Simple Requests）与预检请求（Preflight）](#22-简单请求simple-requests与预检请求preflight)
      - [2.2.1 简单请求的条件](#221-简单请求的条件)
      - [2.2.2 预检请求（Preflight Request）](#222-预检请求preflight-request)
    - [2.3 `Vary: Origin` 与缓存陷阱](#23-vary-origin-与缓存陷阱)
    - [2.4 Credentials 与 Security Implications](#24-credentials-与-security-implications)
    - [2.5 CORS 在 Fetch Standard 中的算法化](#25-cors-在-fetch-standard-中的算法化)
  - [3. CSP：内容安全策略的指令与绕过](#3-csp内容安全策略的指令与绕过)
    - [3.1 CSP 的设计目标与演进](#31-csp-的设计目标与演进)
    - [3.2 核心指令详解](#32-核心指令详解)
    - [3.3 `nonce` 与 `hash` 机制](#33-nonce-与-hash-机制)
    - [3.4 `'strict-dynamic'` 的语义](#34-strict-dynamic-的语义)
    - [3.5 `report-uri` vs `report-to`](#35-report-uri-vs-report-to)
    - [3.6 CSP Bypass 技术](#36-csp-bypass-技术)
  - [4. COOP/COEP：跨源隔离与 Spectre 防护](#4-coopcoep跨源隔离与-spectre-防护)
    - [4.1 Spectre 与 Meltdown 对浏览器架构的冲击](#41-spectre-与-meltdown-对浏览器架构的冲击)
    - [4.2 SharedArrayBuffer 的禁用与复活](#42-sharedarraybuffer-的禁用与复活)
    - [4.3 Cross-Origin Isolation 的条件](#43-cross-origin-isolation-的条件)
    - [4.4 CORP（Cross-Origin Resource Policy）](#44-corpcross-origin-resource-policy)
    - [4.5 实际部署挑战](#45-实际部署挑战)
  - [5. Site Isolation：进程级隔离架构](#5-site-isolation进程级隔离架构)
    - [5.1 从单进程到多进程再到 Site Isolation](#51-从单进程到多进程再到-site-isolation)
    - [5.2 Site Isolation 的设计原理](#52-site-isolation-的设计原理)
    - [5.3 性能与安全权衡](#53-性能与安全权衡)
    - [5.4 Firefox 与 WebKit 的实现差异](#54-firefox-与-webkit-的实现差异)
  - [6. PostMessage 与跨域通信安全](#6-postmessage-与跨域通信安全)
    - [6.1 PostMessage 的设计与风险](#61-postmessage-的设计与风险)
    - [6.2 必须遵循的安全规范](#62-必须遵循的安全规范)
    - [6.3 Structured Clone 算法](#63-structured-clone-算法)
  - [7. 范畴论语义：安全策略的格结构](#7-范畴论语义安全策略的格结构)
    - [7.1 安全策略作为偏序集](#71-安全策略作为偏序集)
    - [7.2 具体策略的格嵌入](#72-具体策略的格嵌入)
    - [7.3 策略组合的安全性保持](#73-策略组合的安全性保持)
  - [8. 对称差分析：旧安全模型 vs 现代隔离模型](#8-对称差分析旧安全模型-vs-现代隔离模型)
    - [8.1 Pre-Spectre 模型（~1995–2017）](#81-pre-spectre-模型19952017)
    - [8.2 Post-Spectre 现代模型（2018–至今）](#82-post-spectre-现代模型2018至今)
    - [8.3 对称差对比表](#83-对称差对比表)
    - [8.4 兼容性与安全性的张力](#84-兼容性与安全性的张力)
  - [9. 工程决策矩阵](#9-工程决策矩阵)
    - [9.1 场景与策略映射](#91-场景与策略映射)
    - [9.2 决策树](#92-决策树)
    - [9.3 实际部署检查清单](#93-实际部署检查清单)
  - [10. 反例与局限性](#10-反例与局限性)
    - [10.1 JSONP 的历史遗产与安全隐患](#101-jsonp-的历史遗产与安全隐患)
    - [10.2 CORS 误配置导致凭证泄露](#102-cors-误配置导致凭证泄露)
    - [10.3 CSP Bypass via DOM Clobbering](#103-csp-bypass-via-dom-clobbering)
    - [10.4 COOP 的 OAuth 兼容性问题](#104-coop-的-oauth-兼容性问题)
    - [10.5 Site Isolation 的侧信道残余风险](#105-site-isolation-的侧信道残余风险)
    - [10.6 PostMessage 的 origin 校验遗漏](#106-postmessage-的-origin-校验遗漏)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：SOP Origin 比较器](#示例-1sop-origin-比较器)
    - [示例 2：CORS 预检请求模拟器](#示例-2cors-预检请求模拟器)
    - [示例 3：CSP 策略解析器与评估器](#示例-3csp-策略解析器与评估器)
    - [示例 4：COOP/COEP 头验证器](#示例-4coopcoep-头验证器)
    - [示例 5：PostMessage 安全包装器](#示例-5postmessage-安全包装器)
    - [示例 6：Spectre 缓解定时攻击检测器](#示例-6spectre-缓解定时攻击检测器)
    - [示例 7：OAuth2 Popup 安全通信封装](#示例-7oauth2-popup-安全通信封装)
  - [参考文献](#参考文献)

---

## 1. 历史与语义：同源策略的三元组

### 1.1 起源与动机

同源策略（Same-Origin Policy, SOP）是 Web 安全架构的基石。
它最早由 Netscape Navigator 2.0 在 1995 年引入，其动机极为朴素：防止一个网页上的恶意脚本读取另一个网页的敏感数据。
在 1990 年代中期，Web 从静态文档仓库迅速演变为具有状态保持能力的应用平台（cookie 的引入是关键转折点），浏览器需要一个机制来隔离不同来源（origin）的文档对象模型（DOM）和网络状态。

SOP 的核心语义可以概括为：**一个 origin 中的文档或脚本，未经显式授权，不得访问另一个 origin 中的资源**。
这里的"资源"包括但不限于：

- DOM 树（`window.document`）
- Cookie、LocalStorage、IndexedDB 等存储机制
- XMLHttpRequest / Fetch API 发起的 HTTP 请求响应
- 某些 JavaScript 对象的属性（如 `window.location`）

### 1.2 Origin 的代数定义

根据 [RFC 6454](https://tools.ietf.org/html/rfc6454) 和 [WHATWG URL Standard](https://url.spec.whatwg.org/#origin)，一个 origin 是一个三元组：

$$
\text{Origin} := (\text{scheme}, \text{host}, \text{port})
$$

其中：

- **scheme**（协议）：通常为 `http`、`https`、`ftp`、`file` 等。在浏览器安全模型中，`https` 与 `http` 被视为不同 scheme。
- **host**：域名或 IP 地址。注意，host 的比较基于序列化后的字符串，而非 DNS 解析结果。因此 `example.com` 与 `www.example.com` 是不同的 host。
- **port**：端口号。若 scheme 有默认端口（如 `http` 为 80，`https` 为 443），则显式指定默认端口与省略端口在比较时视为等价。

**序列化算法**（ WHATWG 标准）：

```text
origin serialization = scheme + "://" + host
if port is not default for scheme:
    origin serialization += ":" + port
```

**关键推论**：

1. `https://example.com:443` 与 `https://example.com` **同源**（端口等价）。
2. `https://example.com` 与 `http://example.com` **不同源**（scheme 不同）。
3. `https://api.example.com` 与 `https://example.com` **不同源**（host 不同）。
4. `https://example.com:8443` 与 `https://example.com` **不同源**（端口不同）。
5. `file:///path/to/page.html` 的 origin 在规范中定义为**不透明 origin（opaque origin）**，每次导航可能生成新的内部标识符，导致 `file://` 页面之间的互访问受到严格限制。

### 1.3 SOP 的 Enforcement 层级

浏览器在不同接口层对 SOP 的执行力度并不一致，这构成了安全模型的重要细节：

| 接口/资源类型 | SOP 执行策略 | 备注 |
|-------------|------------|------|
| DOM 访问 (`window.document`) | 严格禁止跨 origin | 跨 origin window 引用仅暴露有限属性（`location`、`postMessage`、`closed` 等） |
| Cookie (`document.cookie`) | 基于 Domain 属性，而非严格 SOP | `Domain=.example.com` 允许子域共享，这是历史遗留设计缺陷 |
| Web Storage (localStorage/sessionStorage) | 严格按 origin 隔离 | 甚至 `http://a.com` 与 `https://a.com` 也隔离 |
| IndexedDB | 严格按 origin 隔离 | 同源数据库不可互访 |
| Fetch / XHR | 默认禁止，CORS 作为例外机制 | 见第 2 节 |
| `<img>` / `<script>` / `<link>` | 允许加载，但脚本执行受 CORS 控制 | 经典的"可以嵌入，不可读取"（embedding vs reading）区别 |
| `<iframe>` | DOM 互访受 SOP 限制 | `sandbox` 属性可进一步限制 |
| WebSocket | 不使用 SOP，使用源白名单（origin header） | 服务器必须主动校验 `Origin` header |

### 1.4 `document.domain` 的历史与废弃

`document.domain` 曾是 SOP 的一个"逃生舱"。两个同二级域名但不同子域的页面（如 `a.example.com` 和 `b.example.com`）可以将 `document.domain` 同时设置为 `"example.com"`，从而绕过 SOP 获得相互 DOM 访问权限。

**废弃原因**（Chromium 115+ / Firefox 120+ 已移除）：

1. **安全边界模糊化**：`document.domain` 的放松是**双向的、不可逆的**。一旦页面 A 将 domain 设置为 `"example.com"`，任何同 domain 的页面都可以访问它，攻击面急剧扩大。
2. **Site Isolation 的冲突**：进程级隔离要求 origin 边界清晰。`document.domain` 允许同一进程内 origin 动态变更，破坏了 Site Isolation 的不变量。
3. **Spectre 缓解**：进程隔离是 Spectre 缓解的核心，`document.domain` 迫使浏览器在进程隔离上做出妥协。
4. **替代方案成熟**：CORS、PostMessage、`iframe sandbox` 提供了更细粒度、更安全的跨域通信机制。

Chromium 的移除策略是**逐步弃用**：先禁止设置 `document.domain` 为无效值，然后在跨域隔离（cross-origin isolated）环境中锁定，最终完全移除 setter。开发者被引导使用 `postMessage` 或 `BroadcastChannel` 进行跨子域通信。

---

## 2. CORS：跨域资源共享的协议细节

### 2.1 CORS 作为 SOP 的受控例外

跨域资源共享（Cross-Origin Resource Sharing, CORS）并非"替代"SOP，而是 SOP 的**显式例外机制**。CORS 允许服务器通过 HTTP 响应头声明："我允许来自某些 origin 的浏览器脚本读取我的响应"。

CORS 的核心设计哲学是：**请求本身会到达服务器，但浏览器会在返回 JavaScript 之前拦截响应**，除非服务器通过响应头给予了许可。这意味着 CORS 无法替代服务器端的身份验证和授权——它只解决"浏览器是否允许脚本读取响应"的问题。

### 2.2 简单请求（Simple Requests）与预检请求（Preflight）

CORS 将跨域请求分为两类，分类标准是**是否可能触发服务器副作用**：

#### 2.2.1 简单请求的条件

一个请求同时满足以下所有条件时，被视为简单请求，浏览器直接发送，不经过预检：

1. **HTTP 方法** 为 `GET`、`HEAD` 或 `POST`。
2. **头部字段** 仅限于 CORS 安全列表明头（safelisted request headers）：`Accept`、`Accept-Language`、`Content-Language`、`Content-Type`。
3. **`Content-Type`** 的值仅限于：`application/x-www-form-urlencoded`、`multipart/form-data`、`text/plain`。
4. **无自定义头部**（如 `X-Custom-Header`）。
5. **无使用 `ReadableStream`** 的请求体。
6. **XMLHttpRequest 请求**未设置 `withCredentials` 为 `true` 时的额外限制（Fetch API 中由 `credentials` 选项控制）。

简单请求的实际场景：普通的表单提交、无自定义头的 GET 请求、Content-Type 为 `text/plain` 的 POST 请求。

#### 2.2.2 预检请求（Preflight Request）

对于非简单请求，浏览器会自动发起一个 **OPTIONS 预检请求**，其结构如下：

```http
OPTIONS /resource HTTP/1.1
Origin: https://client.example.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: X-Custom-Header, Content-Type
Host: api.example.com
```

服务器必须返回带有 CORS 头的响应：

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://client.example.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: X-Custom-Header, Content-Type
Access-Control-Max-Age: 86400
Access-Control-Allow-Credentials: true
Vary: Origin
```

**关键头部语义**：

| 响应头 | 语义 | 备注 |
|-------|------|------|
| `Access-Control-Allow-Origin` (ACAO) | 允许访问的 origin | 可以是具体 origin 或 `*`。若携带 credentials，则不能为 `*` |
| `Access-Control-Allow-Methods` (ACAM) | 允许的 HTTP 方法 | 仅用于预检响应 |
| `Access-Control-Allow-Headers` (ACAH) | 允许的请求头 | 仅用于预检响应 |
| `Access-Control-Allow-Credentials` | 是否允许携带 cookie/认证头 | `true` 或省略 |
| `Access-Control-Max-Age` | 预检结果缓存时间（秒） | 浏览器上限通常为 24 小时（Firefox 为 86400 秒） |
| `Access-Control-Expose-Headers` | 允许脚本访问的响应头 | 默认仅暴露 6 个 safelisted response headers |

### 2.3 `Vary: Origin` 与缓存陷阱

CORS 响应通常依赖 `Origin` 请求头的值返回不同的 `Access-Control-Allow-Origin`。如果服务器未设置 `Vary: Origin`，CDN 或浏览器缓存可能将针对 `Origin: https://a.com` 的响应返回给来自 `https://b.com` 的请求，导致 CORS 失败。

**正确的 ACAO 动态设置模式**：

```http
# 服务器端伪逻辑
if (allowed_origins.includes(request.headers.origin)) {
    response.headers.set('Access-Control-Allow-Origin', request.headers.origin);
    response.headers.set('Vary', 'Origin');  // 必须！
}
```

**常见错误**：在 Nginx/Apache 中静态配置 `add_header 'Access-Control-Allow-Origin' '*'` 并配合缓存，或动态设置 ACAO 但忘记 `Vary: Origin`。

### 2.4 Credentials 与 Security Implications

当请求携带 credentials（cookie、HTTP Basic Auth、客户端 TLS 证书）时，CORS 执行更严格的规则：

1. `Access-Control-Allow-Origin` **不能为 `*`**，必须是具体的 origin。
2. `Access-Control-Allow-Credentials` 必须为 `true`。
3. 客户端必须显式设置 `credentials: 'include'`（Fetch）或 `xhr.withCredentials = true`。

**重大安全风险**：`Access-Control-Allow-Origin: *` 与 `Access-Control-Allow-Credentials: true` 同时出现是逻辑矛盾的。某些旧版浏览器可能错误地允许这种组合，但现代浏览器会拒绝。更危险的配置是**反射 Origin**：

```http
Access-Control-Allow-Origin: {反射请求的 Origin 头}
Access-Control-Allow-Credentials: true
```

如果服务器不加限制地反射任何 Origin，攻击者网站可以诱导已登录用户发起携带 cookie 的请求，并读取响应——这实质上是 **CORS 版本的 CSRF 且能读取响应**，常被用于 API 密钥窃取。

### 2.5 CORS 在 Fetch Standard 中的算法化

[W3C Fetch Standard](https://fetch.spec.whatwg.org/) 将 CORS 逻辑完全算法化。以 Fetch 的 "CORS-preflight fetch" 算法为例：

1. 若请求是简单请求，跳过预检。
2. 否则，检查缓存中是否存在匹配的预检结果。
3. 若无缓存，发送 OPTIONS 请求。
4. 检查响应中的 CORS 头是否允许当前请求的方法和头部。
5. 若允许，缓存结果并发送实际请求；若不允许，网络错误（NetworkError）。

Chromium 的实现位于 `services/network/cors/` 目录，`CorsURLLoader` 类负责拦截请求、管理预检缓存（`CorsPreflightCache`）。

---

## 3. CSP：内容安全策略的指令与绕过

### 3.1 CSP 的设计目标与演进

内容安全策略（Content Security Policy, CSP）旨在缓解**跨站脚本攻击（XSS）**和**数据注入攻击**。其基本思想是：服务器通过 HTTP 头（`Content-Security-Policy`）或 `<meta>` 标签声明一系列**加载和执行策略**，浏览器强制执行。

CSP 从 1.0 到 Level 3 的演进：

- **CSP 1.0**：`default-src`、`script-src`、`style-src`、`img-src` 等指令，以及 `'none'`、`'self'`、`'unsafe-inline'`、`'unsafe-eval'` 关键字。
- **CSP 2.0**：引入 `nonce-*` 和 `sha256-*` 哈希源，允许在总体禁止 inline script 的同时，放行特定的内联脚本。
- **CSP 3.0**：引入 `'strict-dynamic'`、`'unsafe-hashes'`、`'report-sample'` 等新关键字，以及 `script-src-elem`、`script-src-attr` 等更细粒度的指令。

### 3.2 核心指令详解

| 指令 | 控制目标 | 常见值 |
|-----|---------|--------|
| `default-src` | 所有未显式指定指令的默认回退 | `'self'` |
| `script-src` | JavaScript 加载与执行 | `'self'` `nonce-xxx` `'strict-dynamic'` |
| `style-src` | CSS 加载与应用 | `'self'` `'unsafe-inline'` |
| `img-src` | 图片加载 | `'self'` `data:` `https:` |
| `connect-src` | Fetch/XHR/WebSocket 的连接目标 | `'self'` `https://api.example.com` |
| `frame-src` / `child-src` | iframe / worker 的加载源 | `'self'` `'none'` |
| `frame-ancestors` | 谁可以将本页嵌入为 iframe | `'none'` `'self'`（用于点击劫持防御） |
| `form-action` | 表单提交目标 | `'self'` |
| `base-uri` | `<base>` 标签的合法值 | `'self'` |
| `upgrade-insecure-requests` | 自动将 http 请求升级为 https | 布尔指令 |
| `block-all-mixed-content` | 阻止混合内容（已废弃，被 `upgrade-insecure-requests` 替代） | 布尔指令 |

### 3.3 `nonce` 与 `hash` 机制

**Nonce 源**：服务器每次响应生成一个密码学随机字符串（通常 16 字节，base64 编码）：

```http
Content-Security-Policy: script-src 'nonce-abc123';
```

```html
<script nonce="abc123">console.log('allowed');</script>
<script>console.log('blocked');</script>  <!-- 违反 CSP -->
```

Nonce 的关键是**不可预测**。若 nonce 是固定的或可猜测的，攻击者可以构造带有相同 nonce 的恶意脚本注入。

**Hash 源**：允许执行内容哈希匹配的内联脚本：

```http
Content-Security-Policy: script-src 'sha256-abc123...';
```

哈希值的计算基于脚本内容（不含 `<script>` 标签本身）。对于动态生成的内容，nonce 更实用；对于静态内容，hash 避免了服务器端状态。

### 3.4 `'strict-dynamic'` 的语义

`'strict-dynamic'` 是 CSP 3.0 引入的革命性机制，专门解决**第三方脚本加载其自身依赖**的问题。

传统困境：你信任 `https://trusted.com/app.js`，但 `app.js` 动态加载 `https://trusted.com/lib.js`。若 `script-src` 仅白名单 `trusted.com`，则 `lib.js` 可以加载；但若攻击者注入 `<script src="https://trusted.com/lib.js">`，也会被允许。若使用 nonce，则动态加载的脚本（如 `document.createElement('script')`）没有 nonce，会被阻塞。

`'strict-dynamic'` 的语义：**信任传导**。一个被 nonce 或 hash 显式允许的脚本，其动态创建的子脚本自动被信任，而白名单源被忽略。

```http
Content-Security-Policy: script-src 'nonce-r4nd0m' 'strict-dynamic' https: 'unsafe-inline';
```

在此策略下：

- 带有 `nonce-r4nd0m` 的脚本被允许。
- 该脚本通过 `document.createElement('script')` 动态加载的脚本被允许。
- 直接通过 `<script src="https://example.com/x.js">` 加载的脚本**被忽略**（白名单被 `strict-dynamic` 压制）。
- `'unsafe-inline'` 作为降级：不支持 CSP 的浏览器会回退到 `'unsafe-inline'`。

### 3.5 `report-uri` vs `report-to`

CSP 提供两种违规报告机制：

- **`report-uri`**（CSP 1/2）：指定一个 URL，浏览器发送标准的 JSON payload：

  ```json
  {
    "csp-report": {
      "document-uri": "https://example.com/page",
      "violated-directive": "script-src",
      "blocked-uri": "https://evil.com/xss.js",
      "original-policy": "script-src 'self'"
    }
  }
  ```

- **`report-to`**（CSP 3，基于 Reporting API）：指定一个 Reporting API 的 endpoint group，支持批量报告、权重控制和更丰富的元数据。

```http
Report-To: { "group": "csp-endpoint", "max_age": 10886400, "endpoints": [{ "url": "https://example.com/csp-report" }] }
Content-Security-Policy: ...; report-to csp-endpoint;
```

`report-uri` 已被标记为 deprecated，但浏览器仍支持。`report-to` 的优势在于与 Reporting API 统一，支持跨域报告时的 `Reporting-Endpoints` 响应头。

### 3.6 CSP Bypass 技术

CSP 并非 XSS 的银弹。已知的绕过技术包括：

**DOM Clobbering**：
若 CSP 允许某些 HTML 元素（如 `<a>`、`<form>`）的 `id` 或 `name` 属性，攻击者可以注入：

```html
<a id="config" href="javascript:alert(1)"></a>
```

如果 JavaScript 代码使用 `window.config` 或 `document.config`，可能被 DOM 元素覆盖，进而执行恶意逻辑。

**JSONP 作为 script src**：
若 `script-src` 白名单包含提供 JSONP 的域名（如 `https://accounts.google.com`），攻击者可以利用 JSONP endpoint 执行任意代码：

```html
<script src="https://accounts.google.com/o/oauth2/revoke?callback=alert(1)"></script>
```

这促使现代 CSP 推荐优先使用 `'strict-dynamic'` + nonce，而非域名白名单。

**AngularJS / Template Injection**：
若页面使用了 AngularJS（1.x）且 `script-src` 允许 `'self'`，攻击者可以注入 `ng-app` 和模板表达式：

```html
<div ng-app ng-csp>{{$on.constructor('alert(1)')()}}</div>
```

AngularJS 的模板引擎会将其编译为 JavaScript 执行。

**MIME Sniffing 绕过**：
若 `object-src` 未设置为 `'none'`，攻击者可能通过 `<embed>` 或 `<object>` 加载恶意 Flash/SWF 文件执行脚本。

---

## 4. COOP/COEP：跨源隔离与 Spectre 防护

### 4.1 Spectre 与 Meltdown 对浏览器架构的冲击

2018 年披露的 Spectre（幽灵）和 Meltdown（熔断）漏洞彻底改变了浏览器安全模型。这些漏洞利用**推测执行（speculative execution）**和**微架构侧信道（microarchitectural side channels）**（如缓存定时攻击），允许恶意代码读取**同一地址空间内**的任意内存。

对于浏览器而言，这意味着：如果攻击者控制的页面与包含敏感数据的页面（如银行页面、邮件页面）处于**同一进程**，攻击者可以通过 JavaScript 的精确计时器和高精度数组操作，利用 Spectre 读取另一页面的内存。

### 4.2 SharedArrayBuffer 的禁用与复活

SharedArrayBuffer（SAB）允许不同 Worker 线程共享同一块内存，配合 `Atomics` API 实现高效的并发。然而，SAB 也是构建**高精度定时器**的关键工具（一个线程循环递增共享内存，另一个线程读取），而高精度定时器是 Spectre 攻击的必要组件。

浏览器厂商的应对：

- **2018年1月**：所有主流浏览器禁用 SharedArrayBuffer。
- **2020年起**：引入 **Cross-Origin Isolation** 机制，允许在满足隔离条件的页面中重新启用 SAB。

### 4.3 Cross-Origin Isolation 的条件

一个页面要成为**跨源隔离（cross-origin isolated）**，必须同时满足：

1. **COOP（Cross-Origin Opener Policy）**：页面通过 HTTP 头声明与 opener 的隔离关系。
   - `Cross-Origin-Opener-Policy: same-origin` — 仅当 opener 与自身同源时保留 `window.opener` 引用，否则切断（跨域 opener 为 `null`）。
   - `Cross-Origin-Opener-Policy: same-origin-allow-popups` — 保留对未设置 COOP 的弹出窗口的引用（降级模式）。
   - `Cross-Origin-Opener-Policy: unsafe-none` — 默认，无隔离。

2. **COEP（Cross-Origin Embedder Policy）**：页面通过 HTTP 头声明对其嵌入资源的跨域策略。
   - `Cross-Origin-Embedder-Policy: require-corp` — 页面只能加载显式允许跨域嵌入的资源（即资源响应携带 `Cross-Origin-Resource-Policy` 头或 CORS 头）。
   - `Cross-Origin-Embedder-Policy: credentialless`（实验性）— 允许加载跨域资源，但请求不携带 cookie 和认证信息，降低信息泄露风险。

当页面同时设置 `COOP: same-origin` 和 `COEP: require-corp` 时，浏览器将该页面标记为 cross-origin isolated，此时：

- `window.crossOriginIsolated` 返回 `true`。
- `SharedArrayBuffer` 可用。
- `performance.measureUserAgentSpecificMemory()` 可用（用于内存测量）。
- 更高精度的 `performance.now()`（Chromium 中从 100μs 降级到 5μs 的精度限制会被放宽）。

### 4.4 CORP（Cross-Origin Resource Policy）

CORP 是资源端（被嵌入方）的声明：

```http
Cross-Origin-Resource-Policy: same-site      # 仅允许同 site 的页面嵌入
Cross-Origin-Resource-Policy: same-origin    # 仅允许同 origin 的页面嵌入
Cross-Origin-Resource-Policy: cross-origin   # 允许任何页面嵌入
```

**Site vs Origin**：Site 是 eTLD+1（effective Top-Level Domain + 1），例如 `a.example.com` 和 `b.example.com` 属于同 site (`example.com`)，但不同 origin。

当 COEP 为 `require-corp` 时，浏览器会检查所有子资源（iframe、img、script、video 等）的响应是否携带 CORP 头。若缺失，资源被阻塞（network error）。

### 4.5 实际部署挑战

部署 COOP+COEP 的最大挑战是**第三方资源兼容性**：

- Google Fonts、CDN 上的 jQuery、广告脚本、社交媒体嵌入（Facebook Like、Twitter 卡片）等通常不携带 CORP 头。
- 解决方案包括：使用 `credentialless` 模式（若浏览器支持）、代理第三方资源并添加 CORP 头、或要求第三方服务商支持 CORP。

---

## 5. Site Isolation：进程级隔离架构

### 5.1 从单进程到多进程再到 Site Isolation

浏览器进程模型的演进：

1. **单进程模型**（早期浏览器）：所有标签页、插件、渲染引擎共享同一进程。一个页面崩溃导致整个浏览器崩溃。
2. **多进程模型**（Chrome 2008）：Browser 进程 + GPU 进程 + 多个 Renderer 进程。Renderer 进程通常按标签页分配，但同一标签页的跨域 iframe 仍可能在同一进程。
3. **Site Isolation**（Chrome 67, 2018）：**按 site（eTLD+1）分配进程**。来自不同 site 的文档永不共享同一渲染进程。

### 5.2 Site Isolation 的设计原理

**核心不变量**：不同 site 的文档不应共享地址空间。

实现机制：

- **导航时进程切换**：当页面导航到不同 site 时，Chrome 创建新的 Renderer 进程，并通过 `frame swap` 机制替换旧进程中的 frame。
- **跨域 iframe 进程隔离**：`https://example.com` 页面中的 `<iframe src="https://evil.com">` 会加载到独立的 Renderer 进程。
- **代理对象（Proxy）与远程 frame**：父进程通过 `RemoteFrame` / `LocalFrame` 代理访问跨域 iframe 的有限属性。实际的 DOM 树位于另一个进程。
- **Site-per-process vs Isolate-origins**：默认按 site 隔离。对于高安全需求，可以通过 `--isolate-origins=https://bank.example.com` 按 origin 隔离。

### 5.3 性能与安全权衡

| 维度 | 单标签单进程 | Site Isolation |
|-----|------------|---------------|
| 内存占用 | 低 | 高（每个进程有独立 V8 堆、Blink 对象） |
| 进程切换开销 | 无 | IPC 和序列化开销 |
| Spectre 防护 | 无 | 强（地址空间隔离） |
| 崩溃隔离 | 标签页级 | Site 级 |
| `postMessage` 延迟 | 低（同进程） | 高（跨进程 IPC） |

Chromium 的优化策略：

- **进程重用**：同一 site 的新标签页可能复用现有进程（受 `max_renderer_processes` 限制）。
- **Same-Site 进程共享**：同 site 的不同 origin（如 `a.example.com` 和 `b.example.com`）默认共享进程，除非启用 `--isolate-origins`。
- **Spare Renderer**：预创建空闲进程以减少导航延迟。

### 5.4 Firefox 与 WebKit 的实现差异

- **Firefox**：采用 **Total Cookie Protection**（原 dFPI — dynamic First-Party Isolation）和 **Project Fission**（Site Isolation 实现）。Fission 自 Firefox 94 起逐步 rollout，其进程分配粒度与 Chromium 类似。
- **WebKit (Safari)**：Safari 使用 **进程池（process pool）** 模型，按 domain 或标签页分配进程，但实现细节较不透明。Safari 的 Intelligent Tracking Prevention（ITP）在存储隔离上与 Site Isolation 互补。

---

## 6. PostMessage 与跨域通信安全

### 6.1 PostMessage 的设计与风险

`window.postMessage()` 是 HTML5 引入的安全跨域通信机制，旨在替代不安全的 `document.domain` 和直接跨域 DOM 访问。

基本 API：

```javascript
targetWindow.postMessage(message, targetOrigin);
```

接收端：

```javascript
window.addEventListener('message', (event) => {
    // event.origin — 消息发送方的 origin
    // event.source — 发送方 window 引用
    // event.data — 消息内容（structured clone 后的对象）
});
```

### 6.2 必须遵循的安全规范

**规则 1：始终校验 `event.origin`**

```javascript
window.addEventListener('message', (event) => {
    if (event.origin !== 'https://trusted.example.com') {
        return; // 拒绝非信任来源
    }
    // 处理消息
});
```

反例：若省略 origin 校验，任何页面（包括钓鱼页面、广告 iframe）都可以向你的页面发送消息。

**规则 2：使用精确的 `targetOrigin`，而非 `*`**

```javascript
// 危险：消息可能泄露给中间人 iframe
otherWindow.postMessage(secretData, '*');

// 安全：仅目标 origin 可接收
otherWindow.postMessage(secretData, 'https://receiver.example.com');
```

**规则 3：校验消息数据的类型和结构**

即使 origin 正确，也应将 `event.data` 视为不可信输入：

```javascript
if (typeof event.data !== 'object' || !event.data.action) {
    return;
}
```

**规则 4：避免通过 postMessage 发送敏感凭证**

postMessage 是广播语义（尽管有 targetOrigin 限制），且消息内容会经过结构化克隆，可能在浏览器内部被记录。

### 6.3 Structured Clone 算法

postMessage 使用 **Structured Clone Algorithm** 序列化数据，支持：

- 基本类型（string、number、boolean、null、undefined）
- Date、RegExp、Map、Set、ArrayBuffer、TypedArray
- ImageData、Blob、File、FileList
- 循环引用

不支持：

- Function
- DOM 节点
- 某些属性描述符（getters 会被求值并序列化返回值）

**Transferables**：通过 `[message, [transfer]]` 语法，ArrayBuffer 可以**转移**而非复制，发送方失去对缓冲区的访问权。

```javascript
const buffer = new ArrayBuffer(1024);
worker.postMessage({ data: buffer }, [buffer]);
// buffer.byteLength === 0 in sender
```

---

## 7. 范畴论语义：安全策略的格结构

### 7.1 安全策略作为偏序集

将浏览器的安全策略视为一个**格（Lattice）** $(\mathcal{P}, \sqsubseteq)$，其中：

- 每个元素 $p \in \mathcal{P}$ 代表一种安全策略配置。
- 偏序关系 $p_1 \sqsubseteq p_2$ 表示策略 $p_2$ **至少与 $p_1$ 一样严格**（即 $p_2$ 允许的操作集是 $p_1$ 的子集）。

**交（Meet）与并（Join）**：

- $p_1 \sqcap p_2$：同时满足 $p_1$ 和 $p_2$ 的策略（最宽松的公共约束）。
- $p_1 \sqcup p_2$：任一策略允许即允许（最严格的公共许可）。

### 7.2 具体策略的格嵌入

| 策略层 | 元素 | 偏序方向 |
|-------|------|---------|
| SOP | `(scheme, host, port)` 等价类 | 不同 origin 不可比较；同 origin 相等 |
| CORS | `Access-Control-Allow-Origin` 集合 | `{a.com} \sqsubseteq {a.com, b.com} \sqsubseteq *` |
| CSP | `script-src` 白名单集合 | `'none' \sqsubseteq nonce-xxx \sqsubseteq 'self' \sqsubseteq *` |
| COOP | `same-origin > same-origin-allow-popups > unsafe-none` | 越严格越在格上方 |
| COEP | `require-corp > credentialless > unsafe-none` | 同上 |
| Site Isolation | `origin-isolation > site-isolation > process-per-tab > single-process` | 同上 |

**格的上确界（Supremum）**：现代浏览器的"最大安全策略"可以形式化为：

$$
\text{MaxPolicy} = \text{SOP} \sqcup \text{CORS(minimal)} \sqcup \text{CSP(strict)} \sqcup \text{COOP(same-origin)} \sqsqcup \text{COEP(require-corp)} \sqcup \text{SiteIsolation(origin)}
$$

此策略下，页面功能受限但安全边界最强：

- 无法与任何跨域窗口通信（COOP）。
- 无法加载未授权的子资源（COEP/CSP）。
- 运行在高精度定时器和 SharedArrayBuffer 可用但进程隔离的环境中。

### 7.3 策略组合的安全性保持

在格理论框架下，安全策略的组合必须满足**单调性**：若 $p_1 \sqsubseteq p_2$，则对任何上下文 $C$，$C[p_1] \sqsubseteq C[p_2]$。这保证了添加更严格的策略不会意外放宽安全边界。

然而，实践中存在**非单调组合**：

- `document.domain` 的赋值操作是**格中的下降操作**（从 `a.b.com` 下降到 `b.com`），破坏了单调性。
- CSP 的 `'unsafe-inline'` 是 `'nonce-xxx'` 的下降操作，但 `'strict-dynamic'` 引入了非单调的信任传导。

---

## 8. 对称差分析：旧安全模型 vs 现代隔离模型

### 8.1 Pre-Spectre 模型（~1995–2017）

**核心机制**：

- **SOP**：阻止跨 origin 的 DOM/存储/网络读取。
- **CORS**：受控例外，允许服务器显式授权。
- **CSP 1/2**：XSS 缓解，但以域名白名单为主。

**假设**：

- 同源页面共享进程是可接受的。
- JavaScript 定时器精度（5μs）不会构成严重威胁。
- `document.domain` 作为合法的企业内网跨域方案。

**对称差（攻击面）**：

- XSS 一旦在同源页面内执行，可完全访问该 origin 的所有数据（因为同进程）。
- 第三方脚本与第一方脚本共享地址空间。
- `document.domain` 允许子域间双向信任传递，一旦某个子域被攻破，主域沦陷。

### 8.2 Post-Spectre 现代模型（2018–至今）

**新增机制**：

- **COOP/COEP**：切断跨域窗口关联，隔离子资源加载。
- **Site Isolation**：不同 site 不共享进程。
- **CSP 3 + `'strict-dynamic'`**：消除域名白名单的绕过风险。
- **document.domain 移除**：消除动态信任下降通道。
- **Timing Attack Mitigations**：`SharedArrayBuffer` 有条件复活，`performance.now()` 精度降级，除非 cross-origin isolated。

### 8.3 对称差对比表

| 维度 | Pre-Spectre (Δ⁻) | Post-Spectre (Δ⁺) | 对称差 |
|-----|------------------|-------------------|--------|
| 进程隔离 | 标签页级或同 site 共享 | Site 级或 Origin 级 | 跨域 iframe 必须跨进程 |
| 定时器精度 | 5μs 全局可用 | 100μs 默认可用，5μs 需 COI | 高精度成为特权 |
| SAB | 全局可用 | 仅 COI 环境可用 | 并发原语受限 |
| 跨域窗口引用 | `window.opener` 默认可用 | COOP 可切断 | 弹出窗口通信受限 |
| 子资源加载 | 仅需服务器响应 | COEP 要求 CORP/CORS | 第三方嵌入门槛提高 |
| 信任传递 | `document.domain` | nonce + `strict-dynamic` | 信任更细粒度且可审计 |
| XSS 影响范围 | 同 origin 全部数据 | 同 site 数据（Site Isolation 后） | 隔离粒度提升 |

### 8.4 兼容性与安全性的张力

现代模型的主要代价是**兼容性**：大量遗留的跨域集成（OAuth popup、第三方嵌入、广告系统）在现代严格策略下会中断。浏览器的策略是**渐进式强化**：

- 默认保持兼容性（`unsafe-none`）。
- 提供 opt-in 机制（COOP/COEP/CSP）供高安全需求应用选择。
- 通过 `Permissions-Policy`（原 Feature Policy）进一步细化功能授权。

---

## 9. 工程决策矩阵

### 9.1 场景与策略映射

| 场景 | 推荐策略 | 避免的配置 | 理由 |
|-----|---------|-----------|------|
| **公共 API（无认证）** | `ACAO: *`，无 credentials | `ACAO: *` + `ACAC: true` | 公共数据无需身份，`*` 简化客户端 |
| **认证 API（cookie/token）** | 精确 ACAO + `Vary: Origin` + `ACAC: true` | `ACAO: {反射 Origin}` | 反射 Origin 允许任意网站窃取认证响应 |
| **第三方嵌入（视频/图片）** | `CORP: cross-origin` 或 CORS | 无 CORP 头（在 COEP 页面中会被阻） | 明确声明资源可被跨域嵌入 |
| **第一方隔离应用** | `COOP: same-origin` + `COEP: require-corp` + 严格 CSP | 遗留第三方脚本无 CORP | 高安全应用需 COI，但要确保所有子资源合规 |
| **OAuth2/OIDC 登录弹窗** | `COOP: same-origin-allow-popups` | `COOP: same-origin` | 完全隔离会切断 popup 与 opener 的通信，破坏 OAuth 流程 |
| **银行/金融应用** | Origin 级 Site Isolation + 严格 CSP + nonce | `'unsafe-inline'` | 最高隔离粒度，XSS 即使发生也限制在单页面 |
| **内容聚合平台** | `COEP: credentialless`（若支持）+ iframe sandbox | `COEP: require-corp`（第三方内容难以合规） | credentialless 允许加载跨域内容但不泄露用户身份 |

### 9.2 决策树

```
是否需要跨域读取认证响应？
├── 是 → 精确 ACAO + credentials + CSRF token
└── 否 → 数据是否公开？
    ├── 是 → ACAO: *（无 credentials）
    └── 否 → 是否第一方高安全应用？
        ├── 是 → COOP: same-origin + COEP: require-corp + CSP strict
        └── 否 → 标准 CORS + CSP default-src 'self'
```

### 9.3 实际部署检查清单

- [ ] CORS 头是否包含 `Vary: Origin`？
- [ ] 认证接口是否拒绝 `ACAO: *` + credentials 的组合？
- [ ] CSP 是否包含 `'upgrade-insecure-requests'`？
- [ ] 内联脚本是否使用 nonce 而非 `'unsafe-inline'`？
- [ ] 动态脚本加载是否启用 `'strict-dynamic'`？
- [ ] 是否设置了 `X-Content-Type-Options: nosniff` 防止 MIME 嗅探？
- [ ] 是否设置了 `X-Frame-Options` 或 CSP `frame-ancestors` 防止点击劫持？
- [ ] COOP/COEP 是否根据业务场景正确配置？
- [ ] 第三方嵌入资源是否携带 CORP 头或 CORS 头？

---

## 10. 反例与局限性

### 10.1 JSONP 的历史遗产与安全隐患

JSONP（JSON with Padding）是 CORS 出现之前的跨域数据获取方案：

```html
<script src="https://api.example.com/data?callback=handleData"></script>
```

服务器返回：

```javascript
handleData({ "key": "value" });
```

**根本缺陷**：

1. 无法限制请求方法（只能是 GET）。
2. 无法设置自定义请求头。
3. 响应是完整 JavaScript 执行，服务器一旦被攻破或存在漏洞，攻击者可以注入任意代码。
4. 现代 CSP 的 `script-src` 若白名单 JSONP endpoint，等同于允许该域名的任意代码执行。

**反例**：2015 年，某大型社交网站的 JSONP endpoint 未充分校验 `callback` 参数，导致反射型 XSS：`?callback=alert(1)//`。

### 10.2 CORS 误配置导致凭证泄露

**场景**：银行 API 配置如下：

```http
Access-Control-Allow-Origin: {反射 Origin}
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST
```

**攻击流程**：

1. 用户已登录银行网站 `https://bank.com`，cookie 有效。
2. 用户访问攻击者网站 `https://evil.com`。
3. `evil.com` 的 JavaScript 发起：`fetch('https://bank.com/api/balance', { credentials: 'include' })`。
4. 银行服务器反射 `Origin: https://evil.com`，浏览器认为 CORS 允许。
5. 攻击者读取用户余额数据。

**缓解**：服务器维护一个允许 origin 的白名单，拒绝未知 origin 的预检和实际请求。

### 10.3 CSP Bypass via DOM Clobbering

**场景**：某网站 CSP 为 `script-src 'self'`，但允许 HTML 表单元素：

```html
<!-- 攻击者注入 -->
<form name="config" action="javascript:alert(1)">
  <input name="apiUrl" value="https://evil.com">
</form>
```

```javascript
// 第一方代码（假设存在漏洞）
const url = window.config?.apiUrl?.value || '/default';
fetch(url); // 实际发送到 evil.com
```

DOM Clobbering 利用 HTML `name`/`id` 属性自动挂载到 `window`/`document` 对象的特性，覆盖 JavaScript 变量。若 CSP 未限制 HTML 标签的注入，这种绕过是可行的。

### 10.4 COOP 的 OAuth 兼容性问题

**场景**：某应用设置 `Cross-Origin-Opener-Policy: same-origin`，并使用 OAuth2 授权码流程。

**问题**：OAuth2 弹窗需要向 opener 发送消息（通过 `window.opener.postMessage`）或使用 `window.opener` 检测关闭状态。COOP: same-origin 导致跨域弹窗的 `window.opener` 为 `null`，通信中断。

**缓解**：OAuth 流程中使用 `COOP: same-origin-allow-popups`，或改为重定向流程（不依赖 popup）。

### 10.5 Site Isolation 的侧信道残余风险

尽管 Site Isolation 大幅缓解了 Spectre，但**同 site 的不同 origin 仍可能共享进程**（默认配置下）。例如 `https://foo.example.com` 和 `https://bar.example.com` 共享进程。

若 `foo.example.com` 存在 XSS，攻击者仍可能利用 Spectre 读取 `bar.example.com` 的内存。对此，Chromium 提供 `--isolate-origins` 启动参数实现更细粒度的隔离，但内存开销显著增加。

### 10.6 PostMessage 的 origin 校验遗漏

**真实漏洞模式**：接收端代码如下：

```javascript
window.addEventListener('message', (e) => {
    if (e.origin.includes('example.com')) {  // 错误：子串匹配
        process(e.data);
    }
});
```

攻击者注册 `https://evil-example.com`，其 origin 包含子串 `example.com`，校验被绕过。

**正确做法**：严格相等比较 `e.origin === 'https://trusted.example.com'`。

---

## TypeScript 代码示例

### 示例 1：SOP Origin 比较器

```typescript
/**
 * SOP Origin 比较器
 * 根据 RFC 6454 / WHATWG URL Standard 实现 origin 的解析与比较
 */

interface Origin {
  scheme: string;
  host: string;
  port: number | null;
}

const DEFAULT_PORTS: Record<string, number> = {
  'http:': 80,
  'https:': 443,
  'ftp:': 21,
  'ws:': 80,
  'wss:': 443,
};

function parseOrigin(urlString: string): Origin | 'opaque' {
  try {
    const url = new URL(urlString);
    const scheme = url.protocol.toLowerCase();
    const host = url.hostname.toLowerCase();
    let port: number | null = url.port ? parseInt(url.port, 10) : null;

    if (port === null || port === DEFAULT_PORTS[scheme]) {
      port = null;
    }

    // file:// 协议返回 opaque origin
    if (scheme === 'file:') {
      return 'opaque';
    }

    return { scheme, host, port };
  } catch {
    return 'opaque';
  }
}

function serializeOrigin(origin: Origin): string {
  let result = `${origin.scheme}//${origin.host}`;
  if (origin.port !== null) {
    result += `:${origin.port}`;
  }
  return result;
}

function isSameOrigin(a: string, b: string): boolean {
  const originA = parseOrigin(a);
  const originB = parseOrigin(b);

  if (originA === 'opaque' || originB === 'opaque') {
    // opaque origin 与任何 origin 都不同源，包括自身（每次可能不同）
    return false;
  }

  return (
    originA.scheme === originB.scheme &&
    originA.host === originB.host &&
    originA.port === originB.port
  );
}

// 测试用例
function runTests() {
  const tests: [string, string, boolean][] = [
    ['https://example.com', 'https://example.com', true],
    ['https://example.com:443', 'https://example.com', true],
    ['https://example.com:8443', 'https://example.com', false],
    ['https://example.com', 'http://example.com', false],
    ['https://api.example.com', 'https://example.com', false],
    ['https://example.com/path', 'https://example.com/other', true],
    ['file:///tmp/a.html', 'file:///tmp/b.html', false],
  ];

  for (const [a, b, expected] of tests) {
    const result = isSameOrigin(a, b);
    const status = result === expected ? 'PASS' : 'FAIL';
    console.log(`[${status}] isSameOrigin("${a}", "${b}") = ${result} (expected ${expected})`);
  }
}

runTests();
```

### 示例 2：CORS 预检请求模拟器

```typescript
/**
 * CORS Preflight 模拟器
 * 模拟浏览器对跨域请求的 CORS 检查逻辑
 */

interface CorsRequest {
  method: string;
  headers: Record<string, string>;
  credentials: 'omit' | 'same-origin' | 'include';
}

interface CorsResponse {
  allowOrigin: string | null;
  allowMethods: string[];
  allowHeaders: string[];
  allowCredentials: boolean;
  maxAge: number;
}

const SAFELISTED_METHODS = new Set(['GET', 'HEAD', 'POST']);
const SAFELISTED_HEADERS = new Set([
  'accept', 'accept-language', 'content-language', 'content-type',
]);
const SAFELISTED_CONTENT_TYPES = new Set([
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
]);

function isSimpleRequest(req: CorsRequest): boolean {
  if (!SAFELISTED_METHODS.has(req.method.toUpperCase())) {
    return false;
  }

  for (const [name, value] of Object.entries(req.headers)) {
    const lowerName = name.toLowerCase();
    if (!SAFELISTED_HEADERS.has(lowerName)) {
      return false;
    }
    if (lowerName === 'content-type') {
      const contentType = value.split(';')[0].trim().toLowerCase();
      if (!SAFELISTED_CONTENT_TYPES.has(contentType)) {
        return false;
      }
    }
  }

  return true;
}

function simulatePreflight(
  request: CorsRequest,
  response: CorsResponse,
  requestOrigin: string
): { allowed: boolean; reason?: string } {
  // 检查 ACAO
  if (!response.allowOrigin) {
    return { allowed: false, reason: 'Missing Access-Control-Allow-Origin' };
  }

  // 携带 credentials 时不能为 *
  if (request.credentials === 'include' && response.allowOrigin === '*') {
    return { allowed: false, reason: 'Cannot use wildcard ACAO with credentials' };
  }

  // 简单请求跳过预检，但仍需检查 ACAO
  if (isSimpleRequest(request)) {
    if (response.allowOrigin !== '*' && response.allowOrigin !== requestOrigin) {
      return { allowed: false, reason: 'ACAO does not match request origin' };
    }
    return { allowed: true };
  }

  // 预检检查
  if (!response.allowMethods.includes(request.method.toUpperCase())) {
    return { allowed: false, reason: `Method ${request.method} not allowed` };
  }

  for (const headerName of Object.keys(request.headers)) {
    const lower = headerName.toLowerCase();
    if (!SAFELISTED_HEADERS.has(lower) && !response.allowHeaders.includes(lower)) {
      return { allowed: false, reason: `Header ${headerName} not allowed` };
    }
  }

  if (request.credentials === 'include' && !response.allowCredentials) {
    return { allowed: false, reason: 'Credentials not allowed' };
  }

  return { allowed: true };
}

// 测试用例
const testRequests: { req: CorsRequest; res: CorsResponse; origin: string }[] = [
  {
    req: { method: 'GET', headers: {}, credentials: 'omit' },
    res: { allowOrigin: '*', allowMethods: ['GET'], allowHeaders: [], allowCredentials: false, maxAge: 0 },
    origin: 'https://client.com',
  },
  {
    req: { method: 'PUT', headers: { 'X-Custom': '1' }, credentials: 'include' },
    res: { allowOrigin: 'https://client.com', allowMethods: ['PUT'], allowHeaders: ['x-custom'], allowCredentials: true, maxAge: 86400 },
    origin: 'https://client.com',
  },
  {
    req: { method: 'GET', headers: {}, credentials: 'include' },
    res: { allowOrigin: '*', allowMethods: ['GET'], allowHeaders: [], allowCredentials: true, maxAge: 0 },
    origin: 'https://client.com',
  },
];

for (const { req, res, origin } of testRequests) {
  const result = simulatePreflight(req, res, origin);
  console.log(`[${result.allowed ? 'ALLOW' : 'BLOCK'}] ${req.method} ${result.reason || 'OK'}`);
}
```

### 示例 3：CSP 策略解析器与评估器

```typescript
/**
 * CSP 策略解析器
 * 解析 CSP 字符串并评估给定资源加载是否被允许
 */

type CspSource = 'self' | 'none' | 'unsafe-inline' | 'unsafe-eval' | 'strict-dynamic' | string;

interface CspPolicy {
  [directive: string]: CspSource[];
}

function parseCsp(headerValue: string): CspPolicy {
  const policy: CspPolicy = {};
  const directives = headerValue.split(';');

  for (const directive of directives) {
    const tokens = directive.trim().split(/\s+/);
    if (tokens.length === 0) continue;
    const [name, ...values] = tokens;
    policy[name.toLowerCase()] = values.map(v =>
      v.startsWith("'") && v.endsWith("'") ? v.slice(1, -1) as CspSource : v
    );
  }

  return policy;
}

function isAllowedByCsp(
  policy: CspPolicy,
  directive: string,
  resourceUrl: string,
  context?: { nonce?: string; hash?: string; isDynamic?: boolean }
): boolean {
  const sources = policy[directive] || policy['default-src'] || [];

  if (sources.includes('none')) return false;
  if (sources.includes('*')) return true;

  try {
    const url = new URL(resourceUrl, 'https://example.com');

    for (const src of sources) {
      if (src === 'self') {
        // 简化为同源检查（实际应比较 site）
        if (url.host === 'example.com') return true;
      }
      if (src === 'unsafe-inline' && !sources.includes('nonce') && !sources.includes('sha')) {
        if (context?.nonce || context?.hash) continue;
        return true;
      }
      if (src.startsWith('nonce-') && context?.nonce === src.slice(6)) {
        return true;
      }
      if (src.startsWith('sha256-') && context?.hash === src.slice(7)) {
        return true;
      }
      if (src === 'strict-dynamic' && context?.isDynamic) {
        // 若存在 strict-dynamic，允许 nonce/hash 脚本的动态加载
        return true;
      }
      if (!src.match(/^['"]/)) {
        // 域名/路径匹配（简化实现）
        if (resourceUrl.includes(src)) return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

// 测试
const csp = "default-src 'self'; script-src 'self' 'nonce-abc123' 'strict-dynamic'; style-src 'self' 'unsafe-inline'";
const policy = parseCsp(csp);

console.log('Parsed CSP:', JSON.stringify(policy, null, 2));

const tests = [
  { directive: 'script-src', url: 'https://evil.com/x.js' },
  { directive: 'script-src', url: 'https://evil.com/x.js', context: { isDynamic: true } },
  { directive: 'script-src', url: 'inline', context: { nonce: 'abc123' } },
  { directive: 'style-src', url: 'inline' },
];

for (const t of tests) {
  const allowed = isAllowedByCsp(policy, t.directive, t.url, t.context);
  console.log(`[${allowed ? 'ALLOW' : 'BLOCK'}] ${t.directive}: ${t.url} ${JSON.stringify(t.context || {})}`);
}
```

### 示例 4：COOP/COEP 头验证器

```typescript
/**
 * COOP/COEP 头验证器
 * 检查响应头是否满足 Cross-Origin Isolated 的条件
 */

interface SecurityHeaders {
  'cross-origin-opener-policy'?: string;
  'cross-origin-embedder-policy'?: string;
  'cross-origin-resource-policy'?: string;
}

type CoopValue = 'same-origin' | 'same-origin-allow-popups' | 'unsafe-none';
type CoepValue = 'require-corp' | 'credentialless' | 'unsafe-none';

function parseCoop(value?: string): CoopValue {
  if (!value) return 'unsafe-none';
  const v = value.toLowerCase().split(';')[0].trim();
  if (v === 'same-origin' || v === 'same-origin-allow-popups') return v as CoopValue;
  return 'unsafe-none';
}

function parseCoep(value?: string): CoepValue {
  if (!value) return 'unsafe-none';
  const v = value.toLowerCase().split(';')[0].trim();
  if (v === 'require-corp' || v === 'credentialless') return v as CoepValue;
  return 'unsafe-none';
}

function isCrossOriginIsolated(headers: SecurityHeaders): {
  isolated: boolean;
  coop: CoopValue;
  coep: CoepValue;
  missing: string[];
} {
  const coop = parseCoop(headers['cross-origin-opener-policy']);
  const coep = parseCoep(headers['cross-origin-embedder-policy']);
  const missing: string[] = [];

  if (coop !== 'same-origin') {
    missing.push(`COOP must be 'same-origin', got '${coop}'`);
  }
  if (coep !== 'require-corp') {
    missing.push(`COEP must be 'require-corp', got '${coep}'`);
  }

  return {
    isolated: coop === 'same-origin' && coep === 'require-corp',
    coop,
    coep,
    missing,
  };
}

function checkSubresource(
  subresourceHeaders: SecurityHeaders,
  parentCoep: CoepValue
): { allowed: boolean; reason?: string } {
  if (parentCoep !== 'require-corp') {
    return { allowed: true };
  }

  const corp = subresourceHeaders['cross-origin-resource-policy'];
  const cors = subresourceHeaders['access-control-allow-origin'];

  if (corp) {
    const corpValue = corp.toLowerCase().trim();
    if (corpValue === 'cross-origin' || corpValue === 'same-site' || corpValue === 'same-origin') {
      return { allowed: true };
    }
  }

  if (cors) {
    return { allowed: true, reason: 'Allowed via CORS' };
  }

  return { allowed: false, reason: 'Missing CORP or CORS headers (required by COEP: require-corp)' };
}

// 测试
const pageHeaders: SecurityHeaders = {
  'cross-origin-opener-policy': 'same-origin',
  'cross-origin-embedder-policy': 'require-corp',
};

const coiResult = isCrossOriginIsolated(pageHeaders);
console.log('Cross-Origin Isolated:', coiResult.isolated);
console.log('Details:', coiResult);

const subResources: SecurityHeaders[] = [
  { 'cross-origin-resource-policy': 'cross-origin' },
  { 'access-control-allow-origin': '*' },
  {}, // 无 CORP/CORS
];

for (const sub of subResources) {
  const result = checkSubresource(sub, coiResult.coep);
  console.log(`Subresource: ${result.allowed ? 'ALLOW' : 'BLOCK'} — ${result.reason || 'OK'}`);
}
```

### 示例 5：PostMessage 安全包装器

```typescript
/**
 * PostMessage 安全包装器
 * 提供类型安全的 origin 校验与消息验证
 */

interface TypedMessage<T = unknown> {
  type: string;
  payload: T;
  timestamp: number;
  nonce: string;
}

class SecurePostMessageChannel {
  private allowedOrigins: Set<string>;
  private listeners = new Map<string, ((payload: unknown, event: MessageEvent) => void)[]>();

  constructor(allowedOrigins: string[]) {
    this.allowedOrigins = new Set(allowedOrigins.map(o => o.toLowerCase()));
  }

  /**
   * 发送消息到目标窗口，严格指定 targetOrigin
   */
  send<T>(
    targetWindow: Window,
    targetOrigin: string,
    type: string,
    payload: T
  ): void {
    if (!targetOrigin || targetOrigin === '*') {
      throw new Error('targetOrigin must be explicitly specified');
    }

    const message: TypedMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      nonce: this.generateNonce(),
    };

    targetWindow.postMessage(message, targetOrigin);
  }

  /**
   * 注册带 origin 校验的消息处理器
   */
  on<T>(type: string, handler: (payload: T, event: MessageEvent) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    const wrapped = (rawPayload: unknown, event: MessageEvent) => {
      handler(rawPayload as T, event);
    };
    this.listeners.get(type)!.push(wrapped);

    return () => this.off(type, wrapped);
  }

  /**
   * 启动全局 message 事件监听
   */
  attach(target: Window = window): () => void {
    const handler = (event: MessageEvent) => {
      // 规则 1: 严格 origin 校验
      const origin = event.origin.toLowerCase();
      if (!this.allowedOrigins.has(origin)) {
        console.warn(`[SecurePostMessage] Blocked message from untrusted origin: ${event.origin}`);
        return;
      }

      // 规则 2: 校验消息结构
      const data = event.data;
      if (!this.isValidTypedMessage(data)) {
        console.warn('[SecurePostMessage] Invalid message structure');
        return;
      }

      // 规则 3: 拒绝过旧消息（可选的重放保护）
      const age = Date.now() - data.timestamp;
      if (age > 30000) {
        console.warn('[SecurePostMessage] Message too old, possible replay');
        return;
      }

      const handlers = this.listeners.get(data.type);
      if (handlers) {
        for (const h of handlers) {
          try {
            h(data.payload, event);
          } catch (err) {
            console.error('[SecurePostMessage] Handler error:', err);
          }
        }
      }
    };

    target.addEventListener('message', handler);
    return () => target.removeEventListener('message', handler);
  }

  private isValidTypedMessage(data: unknown): data is TypedMessage {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof (data as TypedMessage).type === 'string' &&
      typeof (data as TypedMessage).timestamp === 'number' &&
      typeof (data as TypedMessage).nonce === 'string'
    );
  }

  private generateNonce(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  private off(type: string, handler: (payload: unknown, event: MessageEvent) => void): void {
    const list = this.listeners.get(type);
    if (list) {
      const idx = list.indexOf(handler);
      if (idx >= 0) list.splice(idx, 1);
    }
  }
}

// 使用示例
const channel = new SecurePostMessageChannel(['https://trusted.example.com']);
const detach = channel.attach();

const unsubscribe = channel.on<{ token: string }>('auth', (payload, event) => {
  console.log('Received auth from', event.origin, payload);
});

// 模拟发送（实际环境中需要真实的目标窗口）
// channel.send(popupWindow, 'https://trusted.example.com', 'auth', { token: 'xyz' });

console.log('SecurePostMessageChannel initialized');
```

### 示例 6：Spectre 缓解定时攻击检测器

```typescript
/**
 * Spectre 缓解：高精度定时器降级检测器
 * 检测当前环境是否受定时器精度降级保护，以及 SharedArrayBuffer 可用性
 */

interface TimingMitigationReport {
  performanceNowPrecision: number;        // 估计的 performance.now() 精度 (ms)
  sharedArrayBufferAvailable: boolean;    // SAB 是否可用
  crossOriginIsolated: boolean;           // window.crossOriginIsolated
  userAgent: string;
  highResolutionTimerAvailable: boolean;  // 是否能获取亚毫秒级精度
}

function measurePerformanceNowPrecision(samples = 1000): number {
  const deltas: number[] = [];

  for (let i = 0; i < samples; i++) {
    const t1 = performance.now();
    const t2 = performance.now();
    const delta = t2 - t1;
    if (delta > 0) {
      deltas.push(delta);
    }
  }

  if (deltas.length === 0) return 0;

  // 取最小非零差值作为精度估计
  const minDelta = Math.min(...deltas);
  return minDelta;
}

function checkSharedArrayBuffer(): boolean {
  try {
    const sab = new SharedArrayBuffer(1024);
    return sab instanceof SharedArrayBuffer;
  } catch {
    return false;
  }
}

function checkCrossOriginIsolated(): boolean {
  try {
    return (window as any).crossOriginIsolated === true;
  } catch {
    return false;
  }
}

function canBuildHighResolutionTimer(): boolean {
  // 检查是否能构建 Spectre 所需的高精度计时器
  // 1. SharedArrayBuffer 可用于 Worker + Atomics 自增计时
  // 2. performance.now() 精度是否足够低（>100μs 为安全降级）
  const precision = measurePerformanceNowPrecision(100);
  const sab = checkSharedArrayBuffer();

  // 若 precision < 0.1ms (100μs) 且 SAB 可用，则存在高精度计时风险
  if (precision < 0.05 && sab) {
    return true;
  }

  // 即使没有 SAB，某些浏览器可能仍提供足够精度的 performance.now()
  if (precision < 0.01) {
    return true;
  }

  return false;
}

function generateMitigationReport(): TimingMitigationReport {
  const precision = measurePerformanceNowPrecision();
  const sab = checkSharedArrayBuffer();
  const coi = checkCrossOriginIsolated();

  return {
    performanceNowPrecision: precision,
    sharedArrayBufferAvailable: sab,
    crossOriginIsolated: coi,
    userAgent: navigator.userAgent,
    highResolutionTimerAvailable: canBuildHighResolutionTimer(),
  };
}

// 运行检测
const report = generateMitigationReport();
console.log('=== Spectre Mitigation Report ===');
console.log(`performance.now() precision: ${(report.performanceNowPrecision * 1000).toFixed(3)} μs`);
console.log(`SharedArrayBuffer available: ${report.sharedArrayBufferAvailable}`);
console.log(`Cross-Origin Isolated: ${report.crossOriginIsolated}`);
console.log(`High-res timer risk: ${report.highResolutionTimerAvailable ? 'YES (mitigation insufficient)' : 'NO (degraded)'}`);
console.log(`User-Agent: ${report.userAgent}`);

// 建议
if (report.highResolutionTimerAvailable && !report.crossOriginIsolated) {
  console.warn('\n[WARNING] Current environment allows high-resolution timing without cross-origin isolation.');
  console.warn('Recommendation: Deploy COOP: same-origin + COEP: require-corp to enable process isolation.');
}

// 导出供模块使用
export {
  measurePerformanceNowPrecision,
  checkSharedArrayBuffer,
  checkCrossOriginIsolated,
  generateMitigationReport,
  type TimingMitigationReport,
};
```

### 示例 7：OAuth2 Popup 安全通信封装

```typescript
/**
 * OAuth2 授权码流程的 Popup 安全通信封装
 * 结合 state 参数校验与 PostMessage origin 验证
 */

interface AuthConfig {
  authorizeUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  allowedOpenerOrigin: string;
}

interface AuthResult {
  success: boolean;
  code?: string;
  state?: string;
  error?: string;
}

class OAuth2PopupClient {
  private config: AuthConfig;
  private stateStore = new Map<string, { createdAt: number; verifier?: string }>();

  constructor(config: AuthConfig) {
    this.config = config;
  }

  /**
   * 发起 OAuth2 授权请求（PKCE 可选扩展）
   */
  async authorize(): Promise<AuthResult> {
    const state = this.generateState();
    this.stateStore.set(state, { createdAt: Date.now() });

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.config.scope,
      state,
    });

    const url = `${this.config.authorizeUrl}?${params.toString()}`;
    const popup = window.open(url, 'oauth', 'width=500,height=600');

    if (!popup) {
      throw new Error('Popup blocked');
    }

    return new Promise((resolve) => {
      const cleanup = () => {
        window.removeEventListener('message', handler);
        clearInterval(interval);
      };

      // 监听 redirectUri 页面的 PostMessage
      const handler = (event: MessageEvent) => {
        if (event.origin !== new URL(this.config.redirectUri).origin) {
          return;
        }

        const data = event.data;
        if (data?.type !== 'oauth:callback') return;

        const result = this.validateCallback(data.payload);
        cleanup();
        resolve(result);
      };

      window.addEventListener('message', handler);

      // 轮询检测 popup 是否关闭
      const interval = setInterval(() => {
        if (popup.closed) {
          cleanup();
          resolve({ success: false, error: 'Popup closed by user' });
        }
      }, 500);

      // 10 分钟超时
      setTimeout(() => {
        cleanup();
        resolve({ success: false, error: 'Authorization timeout' });
      }, 10 * 60 * 1000);
    });
  }

  /**
   * 在 redirectUri 页面调用，将结果传回 opener
   */
  static sendResultToOpener(result: AuthResult, allowedOpenerOrigin: string): void {
    if (!window.opener) {
      console.warn('No opener available');
      return;
    }

    // 严格校验 opener origin
    // 注意：实际中 opener 可能因 COOP 为 null
    try {
      window.opener.postMessage(
        { type: 'oauth:callback', payload: result },
        allowedOpenerOrigin
      );
    } catch (e) {
      console.error('Failed to post message to opener:', e);
    }
  }

  private generateState(): string {
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(array);
    } else {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }
    return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  }

  private validateCallback(payload: { code?: string; state?: string; error?: string }): AuthResult {
    const { code, state, error } = payload;

    if (error) {
      return { success: false, error };
    }

    if (!state || !this.stateStore.has(state)) {
      return { success: false, error: 'Invalid or expired state parameter' };
    }

    const stored = this.stateStore.get(state)!;
    const age = Date.now() - stored.createdAt;
    this.stateStore.delete(state);

    if (age > 10 * 60 * 1000) {
      return { success: false, error: 'State expired' };
    }

    if (!code) {
      return { success: false, error: 'Missing authorization code' };
    }

    return { success: true, code, state };
  }
}

// 导出
export { OAuth2PopupClient, type AuthConfig, type AuthResult };
```

---

## 参考文献

1. **RFC 6454** — *The Web Origin Concept*. IETF, 2011. 定义了 Origin 三元组的正式规范。
2. **WHATWG Fetch Standard** — [https://fetch.spec.whatwg.org/](https://fetch.spec.whatwg.org/). 包含 CORS 预检、简单请求、凭证传递的完整算法。
3. **W3C Content Security Policy Level 3** — [https://www.w3.org/TR/CSP3/](https://www.w3.org/TR/CSP3/). CSP 指令、nonce、hash、strict-dynamic 的权威规范。
4. **Chromium Site Isolation Design Doc** — [https://www.chromium.org/Home/chromium-security/site-isolation/](https://www.chromium.org/Home/chromium-security/site-isolation/). Chromium 进程隔离架构的详细设计文档。
5. **Mozilla Web Security: Cross-Origin Opener Policy** — [https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cross-Origin-Opener-Policy). COOP 的语义与浏览器兼容性参考。
6. **Google Web Fundamentals: Cross-Origin Resource Sharing (CORS)** — [https://web.dev/cross-origin-resource-sharing/](https://web.dev/cross-origin-resource-sharing/). Google 对 CORS 最佳实践的工程化总结。
7. **Spectre Attacks: Exploiting Speculative Execution** — Kocher et al., IEEE S&P 2019. Spectre 漏洞的原始论文。
8. **Chromium: Deprecating document.domain** — [https://developer.chrome.com/blog/immutable-document-domain/](https://developer.chrome.com/blog/immutable-document-domain/). `document.domain` 废弃的技术原因与迁移指南。
9. **OWASP Cheat Sheet Series: Content Security Policy** — [https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html). CSP 绕过与防御的实战参考。
10. **Mozilla Hacks: Introducing Firefox’s new Site Isolation architecture** — [https://hacks.mozilla.org/2021/05/introducing-firefox-new-site-isolation-architecture/](https://hacks.mozilla.org/2021/05/introducing-firefox-new-site-isolation-architecture/). Firefox Project Fission 的技术解读。
11. **W3C Reporting API** — [https://www.w3.org/TR/reporting-1/](https://www.w3.org/TR/reporting-1/). `report-to` 与 Reporting API 的规范。
12. **HTML Standard: postMessage** — [https://html.spec.whatwg.org/multipage/web-messaging.html](https://html.spec.whatwg.org/multipage/web-messaging.html). PostMessage 的规范与 Structured Clone Algorithm。
13. **WebKit Blog: Full Third-Party Cookie Blocking and More** — [https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/](https://webkit.org/blog/10218/full-third-party-cookie-blocking-and-more/). Safari 的 ITP 与隐私防护策略。
14. **MDN: Same-origin policy** — [https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy). SOP 的权威文档与浏览器行为差异说明。
