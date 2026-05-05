---
title: '权限模型与隐私架构'
description: 'Permissions API, Privacy Sandbox, Fenced Frames, and Attribution Reporting: Browser Privacy Architecture and Tracking Prevention'
last-updated: 2026-05-05
review-cycle: 6 months
next-review: 2026-11-05
status: complete
priority: P0
english-abstract: 'A comprehensive technical analysis of browser permission models and privacy architecture, covering the Permissions API, Privacy Sandbox APIs (FLoC, Topics, FLEDGE, Attribution Reporting), Fenced Frames, third-party cookie deprecation strategies, and cross-browser tracking prevention mechanisms.'
references:
  - 'W3C, Permissions API'
  - 'WICG, Privacy Sandbox'
  - 'Google, Privacy Sandbox Developer Documentation'
  - 'Mozilla, State of Web Privacy'
  - 'Apple, Intelligent Tracking Prevention (ITP)'
---

# 权限模型与隐私架构

> **理论深度**: 高级
> **前置阅读**: [21-same-origin-policy-and-cross-origin-security.md](21-same-origin-policy-and-cross-origin-security.md), [26-web-security-threat-model.md](26-web-security-threat-model.md)
> **目标读者**: 隐私工程师、Web 平台开发者、广告技术专家
> **核心问题**: 浏览器如何在支持 Web 平台丰富功能的同时，防止跨站跟踪和用户画像？第三方 Cookie  deprecation 后的替代方案是什么？

---

## 目录

- [权限模型与隐私架构](#权限模型与隐私架构)
  - [目录](#目录)
  - [1. 浏览器权限模型的演进](#1-浏览器权限模型的演进)
    - [1.1 从"全有或全无"到"按站点委托"](#11-从全有或全无到按站点委托)
    - [1.2 权限持久化存储](#12-权限持久化存储)
  - [2. Permissions API 与委托模型](#2-permissions-api-与委托模型)
    - [2.1 Permissions API 的查询语义](#21-permissions-api-的查询语义)
    - [2.2 权限策略（Permissions Policy）](#22-权限策略permissions-policy)
    - [2.3 Storage Access API](#23-storage-access-api)
  - [3. 第三方 Cookie 的终结与替代](#3-第三方-cookie-的终结与替代)
    - [3.1 第三方 Cookie 的安全与隐私问题](#31-第三方-cookie-的安全与隐私问题)
    - [3.2 第三方 Cookie 的逐步废弃](#32-第三方-cookie-的逐步废弃)
    - [3.3 First-Party Sets 与 SameParty](#33-first-party-sets-与-sameparty)
  - [4. Privacy Sandbox 核心 API](#4-privacy-sandbox-核心-api)
    - [4.1 Topics API：兴趣主题替代跨站跟踪](#41-topics-api兴趣主题替代跨站跟踪)
    - [4.2 Protected Audience API（原 FLEDGE）](#42-protected-audience-api原-fledge)
    - [4.3 Attribution Reporting API](#43-attribution-reporting-api)
  - [5. Fenced Frames：不可渗透的嵌入](#5-fenced-frames不可渗透的嵌入)
    - [5.1 Fenced Frame 的设计目标](#51-fenced-frame-的设计目标)
    - [5.2 与 Protected Audience API 的集成](#52-与-protected-audience-api-的集成)
    - [5.3 对现有架构的影响](#53-对现有架构的影响)
  - [6. 跨浏览器跟踪防护对比](#6-跨浏览器跟踪防护对比)
    - [6.1 Safari：ITP 与全栈隐私](#61-safariitp-与全栈隐私)
    - [6.2 Firefox：Total Cookie Protection](#62-firefoxtotal-cookie-protection)
    - [6.3 Chrome：Privacy Sandbox 的渐进路径](#63-chromeprivacy-sandbox-的渐进路径)
  - [7. 范畴论语义：隐私的抽象边界](#7-范畴论语义隐私的抽象边界)
  - [8. 对称差分析：旧广告模型 vs 隐私沙盒模型](#8-对称差分析旧广告模型-vs-隐私沙盒模型)
  - [9. 工程决策矩阵](#9-工程决策矩阵)
  - [10. 反例与局限性](#10-反例与局限性)
    - [10.1 Topics API 的覆盖度反例](#101-topics-api-的覆盖度反例)
    - [10.2 差分隐私的效用权衡](#102-差分隐私的效用权衡)
    - [10.3 Fenced Frame 的品牌安全盲区](#103-fenced-frame-的品牌安全盲区)
    - [10.4 Privacy Sandbox 的浏览器锁定](#104-privacy-sandbox-的浏览器锁定)
  - [TypeScript 代码示例](#typescript-代码示例)
    - [示例 1：Permissions API 查询器](#示例-1permissions-api-查询器)
    - [示例 2：CHIPS Cookie 分区化检测器](#示例-2chips-cookie-分区化检测器)
    - [示例 3：Topics API 模拟器](#示例-3topics-api-模拟器)
    - [示例 4：Storage Access API 封装器](#示例-4storage-access-api-封装器)
    - [示例 5：Privacy Sandbox 归因报告噪声模拟器](#示例-5privacy-sandbox-归因报告噪声模拟器)
    - [示例 6：跨浏览器隐私特性检测器](#示例-6跨浏览器隐私特性检测器)
  - [参考文献](#参考文献)

---

## 1. 浏览器权限模型的演进

### 1.1 从"全有或全无"到"按站点委托"

早期浏览器（2000 年代）的权限模型极其粗糙：

- **ActiveX / Java Applets**：二进制插件拥有完全系统访问权，安全依赖签名和沙箱
- **Geolocation（HTML5 早期）**：首次访问即弹出阻塞式模态对话框，用户只能"允许"或"拒绝"
- **Notification**：一旦允许，网站可以无限发送通知，无法限制频率

现代浏览器的权限模型转向**按站点委托（Per-Site Delegation）**和**上下文感知（Context-Aware）**：

- **临时权限**：某些权限（如麦克风、摄像头）在用户关闭标签页后自动撤销
- **一次性权限**：Chrome 的"仅本次允许"选项，不持久化到权限数据库
- **权限衰减**：长期未访问的站点，其权限可能自动降级（如从"允许"变为"询问"）

### 1.2 权限持久化存储

Chromium 将权限存储在 **Profile 目录**的 SQLite 数据库中（`Permissions` 表）：

- `origin`：请求权限的站点来源
- `type`：权限类型（`GEOLOCATION`、`NOTIFICATION`、`CAMERA` 等）
- `value`：状态（`ALLOW = 1`、`BLOCK = 2`、`ASK = 0`）
- `expiration`：权限过期时间戳（用于临时权限）

**权限继承规则**：

- 子框架（iframe）默认继承父页面的权限状态
- 但某些敏感权限（如摄像头、支付）只能由**顶层框架（Top-Level Frame）**请求，iframe 中的请求会被静默拒绝或要求用户手势

---

## 2. Permissions API 与委托模型

### 2.1 Permissions API 的查询语义

**Permissions API** 允许网站查询特定权限的当前状态，而无需实际触发权限请求：

```javascript
const status = await navigator.permissions.query({ name: 'geolocation' });
// status.state: 'granted' | 'prompt' | 'denied'
```

**关键设计**：`query()` 是**只读**的，不会触发用户提示。这允许网站在适当时机（如用户点击"查找附近门店"按钮后）请求权限，而非页面加载时立即请求。

**支持的权限类型**（截至 2025）：

- `'geolocation'`、`'notifications'`、`'push'`、`'midi'`、`'camera'`、`'microphone'`、`'speaker-selection'`
- `'background-sync'`、`'periodic-background-sync'`、`'storage-access'`、`'window-management'`
- `'display-capture'`、`'clipboard-read'`、`'clipboard-write'`、`'idle-detection'`

### 2.2 权限策略（Permissions Policy）

**Permissions Policy**（原 Feature Policy）允许页面通过 HTTP 头部或 iframe 的 `allow` 属性，**限制自身及子框架**的权限使用：

```http
Permissions-Policy: geolocation=(self "https://maps.example.com"), camera=()
```

```html
<iframe src="https://embed.example.com" allow="geolocation; microphone"></iframe>
```

**默认策略**：

- 顶层页面默认拥有所有权限（除了某些高权限如 `document-domain`）
- iframe 默认**不继承**任何权限，必须通过 `allow` 显式授予
- 某些权限在 iframe 中**完全禁用**，即使 `allow` 也无法启用（如 `window-management`）

### 2.3 Storage Access API

**Storage Access API** 解决了第三方 iframe 在第三方 Cookie 被阻止后的身份验证问题：

```javascript
// 在第三方 iframe 中
const hasAccess = await document.hasStorageAccess();
if (!hasAccess) {
  await document.requestStorageAccess();
  // 现在可以访问第一方 Cookie
}
```

**限制条件**：

- 必须与用户有**先前交互**（user gesture）
- 必须在**同一 Site 的顶层页面**上（通过 `SameParty` 或 `First-Party Sets`）
- 浏览器可能要求用户显式确认（尤其是 Safari）

---

## 3. 第三方 Cookie 的终结与替代

### 3.1 第三方 Cookie 的安全与隐私问题

**第三方 Cookie**（Third-Party Cookie）是指在跨站上下文中设置的 Cookie（如网站 A 嵌入了网站 B 的 iframe，B 设置的 Cookie）：

**跟踪机制**：

- 广告网络在所有合作网站嵌入追踪像素（1×1 图片）
- 每次页面加载，浏览器向广告服务器发送请求，携带该域下的 Cookie
- 广告服务器通过 Cookie ID 跨站关联用户行为，构建兴趣画像
- 多个广告网络交换 Cookie 映射表（Cookie Matching），实现跨平台跟踪

**安全漏洞**：

- **CSRF**：第三方 Cookie 自动随请求发送，恶意网站可利用用户的已登录态执行操作
- **XS-Leaks**：通过第三方 Cookie 的存在与否推断用户的登录状态（如 `facebook.com` 的 Cookie 存在 → 用户已登录 Facebook）

### 3.2 第三方 Cookie 的逐步废弃

**时间表**：

- **Safari（2017）**：ITP 1.0 开始限制第三方 Cookie，7 天后删除
- **Firefox（2019）**：ETP（Enhanced Tracking Protection）默认阻止第三方 Cookie
- **Chrome（2024-2025）**：原计划 2022 年废弃，推迟至 2024 年 Q3 开始 1% 用户测试，逐步扩展到 100%
- **Chrome（2025-2026）**：Privacy Sandbox 替代方案稳定后，完全禁用第三方 Cookie

**CHIPS（Cookies Having Independent Partitioned State）**：

- 为第三方 Cookie 提供**分区化**替代方案
- Cookie 设置 `Partitioned` 属性后，其作用域被限制在**顶层站点 + 第三方站点**的组合键下
- 不同顶层站点下的同一第三方 iframe 无法共享分区 Cookie

```http
Set-Cookie: session=abc123; Secure; SameSite=None; Partitioned
```

### 3.3 First-Party Sets 与 SameParty

**First-Party Sets** 允许相关域名（如 `example.com` 和 `example.co.uk`）声明为同一"第一方"，在特定场景下共享 Cookie 和存储：

```json
{
  "primary": "https://example.com",
  "associatedSites": ["https://example.co.uk", "https://example.de"]
}
```

**限制**：

- 必须通过公开可验证的方式声明（如 `.well-known/first-party-set`）
- 集合大小受限（Chrome 限制最多 3 个关联站点 + 1 个服务站点）
- 需要浏览器厂商审核（防止滥用）

---

## 4. Privacy Sandbox 核心 API

### 4.1 Topics API：兴趣主题替代跨站跟踪

**FLoC（Federated Learning of Cohorts）** 是 Privacy Sandbox 的第一代兴趣画像方案，因隐私争议被废弃。替代方案 **Topics API** 采用更保守的设计：

**工作原理**：

1. 浏览器每周根据用户的浏览历史，计算其最感兴趣的 **5 个主题**（从约 350 个预定义分类中选择，如"体育/足球"、"科技/编程"）
2. 主题计算完全在**本地**进行，不上传原始浏览历史到任何服务器
3. 网站通过 `document.browsingTopics()` 请求当前用户的主题列表
4. 浏览器返回过去 3 周内该站点观察到的最多 3 个主题

**隐私保护机制**：

- 每个站点只能观察到**用户访问过该站点时**对应的主题
- 敏感主题（如"健康/癌症"、"政治/极端主义"）被完全排除
- 用户可以随时查看和删除浏览器存储的主题历史
- 同一主题不会连续两周返回（防止长期跟踪）

**局限性**：

- 广告精准度显著低于基于 Cookie 的个体跟踪
- 主题粒度粗糙（350 个分类 vs 无限的个体画像维度）

### 4.2 Protected Audience API（原 FLEDGE）

**Protected Audience API** 允许浏览器在本地执行**再营销（Remarketing）**和**受众定向**，无需跨站共享用户 ID：

**核心流程**：

1. **加入兴趣组（JoinAdInterestGroup）**：用户访问电商网站时，浏览器本地存储一个兴趣组（如"放弃购物车的用户"）
2. **运行广告拍卖（RunAdAuction）**：用户访问出版商网站时，浏览器在本地执行拍卖，比较广告商出价
3. **展示广告**：获胜广告的 URL 通过 Fenced Frame 展示（隔离出版商和广告商的 JavaScript 环境）

**关键技术约束**：

- 兴趣组数据完全存储在浏览器本地（Interest Group Database）
- 广告竞价通过受限的 JavaScript 执行环境（Worklet）完成，禁止网络请求和外部通信
- 每日每个站点加入的兴趣组数量有限制（Chrome：最多 1000 个/站点，1000 个/全局）

### 4.3 Attribution Reporting API

**Attribution Reporting API** 替代了第三方 Cookie 的**广告归因**功能（将广告点击/展示与后续转化关联）：

**事件级报告（Event-Level Reports）**：

- 浏览器本地存储归因源（attribution source，如广告点击）和触发器（trigger，如购买）
- 在隐私预算限制下，发送去标识化的归因报告
- 引入**噪声**（Differential Privacy），防止个体行为被推断

**摘要报告（Summary Reports）**：

- 使用**安全多方计算（Secure Multi-Party Computation）**或**可信赖执行环境（TEE）**
- 广告平台和出版商分别加密贡献数据，由 TEE 聚合后输出汇总的转化率
- 个体数据在聚合过程中不可解密

**限制**：

- 事件级报告有严格的速率和数据粒度限制（如最多 3 个转化数据位）
- 摘要报告延迟较高（数小时到数天），不适合实时优化

---

## 5. Fenced Frames：不可渗透的嵌入

### 5.1 Fenced Frame 的设计目标

**Fenced Frame** 是一种新的 HTML 嵌入元素（`<fencedframe>`），设计目标是**完全隔离嵌入内容与宿主页面**的双向通信：

```html
<fencedframe src="https://ad.example.com/creative"></fencedframe>
```

**与 iframe 的关键差异**：

| 特性 | iframe | Fenced Frame |
|------|--------|-------------|
| `window.parent` 访问 | 可以访问（受同源限制） | 完全不可访问 |
| `postMessage` | 支持跨域通信 | 不支持 |
| Cookie | 继承或独立（第三方/分区） | 独立分区，与宿主无共享 |
| 存储 | 可访问同源 Storage | 独立存储分区 |
| DOM 读取 | 宿主可读取 iframe DOM | 宿主完全不可读取 |
| 大小调整 | 宿主可通过 CSS 控制 | 由内部内容决定，宿主不可控 |

### 5.2 与 Protected Audience API 的集成

Fenced Frame 是 Protected Audience API 的**强制渲染容器**：

- 通过 `runAdAuction()` 获胜的广告**必须**在 Fenced Frame 中展示
- 这确保了广告商无法通过 DOM 读取或 `postMessage` 从出版商页面提取用户信息
- 广告点击通过特殊的 `navigator.fencedFrameConfig` 机制处理，避免泄露点击坐标和上下文

### 5.3 对现有架构的影响

Fenced Frame 的引入对现有 Web 架构有深远影响：

- **广告监控失效**：出版商无法再使用 `IntersectionObserver` 监控广告可见性（Fenced Frame 内容不可见）
- **品牌安全检测失效**：自动化工具无法扫描 Fenced Frame 内的广告内容
- **共享状态困难**：如果页面需要在 iframe 和主页面之间共享状态（如登录态、主题偏好），Fenced Frame 完全切断了这一通道

---

## 6. 跨浏览器跟踪防护对比

### 6.1 Safari：ITP 与全栈隐私

Apple 的 **Intelligent Tracking Prevention（ITP）** 是浏览器中最激进的跟踪防护：

**核心策略**：

- **第三方 Cookie 完全阻止**：默认阻止所有第三方 Cookie
- **本地存储 7 天限制**：由 JavaScript 写入的 `localStorage`、`IndexedDB`、`Cookie` 在 7 天后自动删除（除非用户再次访问）
- **链接装饰检测**：检测 URL 查询参数中的跟踪 ID（如 `?utm_source=...`），在跨站导航时删除
- **CNAME 伪装检测**：识别使用 CNAME DNS 记录伪装的第三方跟踪域

**对 Web 开发的影响**：

- 客户端持久化存储不可靠（7 天限制）
- 跨站登录态难以维持（Single Sign-On 依赖第三方 Cookie）
- 分析数据不完整（用户可能在 7 天后被视为新用户）

### 6.2 Firefox：Total Cookie Protection

Mozilla 的 **Total Cookie Protection**（原 dFPI，Dynamic First-Party Isolation）：

- 为每个站点创建独立的 Cookie jar
- `example.com` 嵌入的第三方 iframe 只能访问为 `example.com` 分区存储的 Cookie
- 与 CHIPS 类似，但全局默认启用，无需 Cookie 设置 `Partitioned` 属性

**Storage Access API 集成**：

- 第三方 iframe 可以通过 `requestStorageAccess()` 请求访问其第一方 Cookie
- 但要求用户与 iframe 有**先前交互**，且 iframe 必须属于**First-Party Set** 或通过其他信任验证

### 6.3 Chrome：Privacy Sandbox 的渐进路径

Google 的策略是**用新 API 替代旧机制**，而非直接阻止：

- 保留广告生态系统的功能，但通过浏览器中介降低隐私风险
- Topics / Protected Audience / Attribution Reporting 构成完整的广告技术替代栈
- 渐进式推出，给予广告行业适配时间

**争议点**：

- 批评者认为 Privacy Sandbox 只是将跟踪从第三方转移到浏览器厂商（Google）
- Chrome 的市场主导地位（~65%）使得 Privacy Sandbox 成为事实标准，可能挤压竞争对手
- 英国竞争与市场管理局（CMA）对 Google 实施监管，确保 Privacy Sandbox 不会反竞争

---

## 7. 范畴论语义：隐私的抽象边界

隐私保护机制可以形式化为**信息流的格（Lattice of Information Flow）**：

**对象**：信息域（Information Domains），如 `UserIdentity`、`BrowsingHistory`、`CrossSiteProfile`、`AggregatedCohort`

**态射**：信息转换函数（Information Transformations），如 `Hash`、`K-Anonymize`、`DifferentialPrivacy`、`NoiseInjection`

**偏序关系** ≤：域 A ≤ 域 B，当且仅当从 B 可以推断 A 的信息（B 的信息量 ≥ A）

**隐私保护作为态射**：

- **去标识化（De-identification）**：`UserIdentity → Pseudonym`
- **差分隐私（Differential Privacy）**：`IndividualRecord → NoisyAggregate`
- **k-匿名化**：`IndividualRecord → EquivalenceClass（size ≥ k）`

**单调性**：如果隐私保护机制 f 满足 `f(Domain) ≤ Domain`，则 f 是**信息无损或损失**的（不会增加信息量）。有效的隐私保护必须是信息损失态射。

---

## 8. 对称差分析：旧广告模型 vs 隐私沙盒模型

| 维度 | 旧模型（第三方 Cookie） | Privacy Sandbox 模型 | 交集 |
|------|----------------------|---------------------|------|
| 用户标识 | 全局唯一 Cookie ID | 无个体 ID，主题/队列级别 | 浏览器作为中介 |
| 跨站关联 | 服务器端 Cookie 匹配 | 浏览器本地计算，不上传历史 | 兴趣定向概念 |
| 归因测量 | 服务器端像素追踪 | 浏览器本地归因 + 差分隐私 | 转化事件记录 |
| 再营销 | 第三方 Cookie 重定向 | Protected Audience 本地拍卖 | 向特定人群展示广告 |
| 广告主数据 | 第一方 + 第三方数据融合 | 第一方数据 + 浏览器中介信号 | 第一方数据使用 |
| 实时竞价 | 100ms 内完成用户画像查询 | 浏览器预计算兴趣组，本地拍卖 | 拍卖机制 |
| 出版商收入 | 高度精准定价 | 精准度降低，可能收入下降 | 广告填充率 |

---

## 9. 工程决策矩阵

| 场景 | 推荐方案 | 理由 | 风险 |
|------|---------|------|------|
| 跨站身份验证 | OAuth2 + `prompt=none` + First-Party Sets | 在第三方 Cookie 受限环境下维持 SSO | First-Party Sets 审核严格，不适合小规模站点 |
| 嵌入第三方内容 | iframe + `sandbox` + Permissions Policy | 最小权限原则，显式授权 | Fenced Frame 更隔离，但功能受限且兼容性差 |
| 广告再营销 | Protected Audience API（Chrome）+ 传统方案 fallback | Chrome 占市场 65%，需覆盖主要用户群 | Firefox/Safari 不支持，需要替代方案 |
| 兴趣定向广告 | Topics API（Chrome）+ Contextual Ads fallback | 上下文广告不依赖用户画像，隐私合规 | Topics 粒度粗糙，CTR 可能下降 |
| 跨站分析 | 服务端统一收集 + 第一方 Cookie | 避免第三方 Cookie 限制 | 需要用户登录态，匿名用户无法追踪 |
| 嵌入广告监控 | 与广告平台协商，使用 aggregate reporting | Fenced Frame 阻止直接监控 | 归因延迟增加，实时优化困难 |
| 客户端持久化 | `localStorage` + 服务端同步备份 | Safari 7 天限制下，服务端是唯一可靠持久化 | 增加服务端负载和隐私合规复杂度 |

---

## 10. 反例与局限性

### 10.1 Topics API 的覆盖度反例

Topics API 的 350 个分类对于垂直领域（如 B2B 软件、小众爱好）覆盖不足：

- 一个专业医学论坛的用户可能被归类为"健康"，而无法区分是医生、患者还是研究员
- 这导致广告投放的相关性显著下降，出版商 CPM（每千次展示成本）可能下降 30-50%

### 10.2 差分隐私的效用权衡

Attribution Reporting API 的噪声注入保护了个体隐私，但严重损害了小样本 advertiser 的效用：

- 大型广告主（日转化量 > 10000）可以在噪声中识别趋势
- 小型广告主（日转化量 < 100）的信号完全被噪声淹没，无法判断广告效果
- 这可能加剧广告市场的马太效应，有利于大型平台

### 10.3 Fenced Frame 的品牌安全盲区

出版商无法在 Fenced Frame 中扫描广告内容，导致：

- 恶意广告（钓鱼、恶意软件）可能通过 Protected Audience 的拍卖进入出版商页面
- 品牌安全工具（如 Integral Ad Science、DoubleVerify）完全失效
- 出版商面临品牌声誉风险，但无法自主验证广告内容

### 10.4 Privacy Sandbox 的浏览器锁定

Privacy Sandbox API 目前只有 Chromium 完整实现。如果网站深度依赖 Protected Audience 或 Topics，实际上锁定了 Chrome 用户群，对 Firefox/Safari 用户的体验可能降级（如显示不相关广告或无法登录）。

---

## TypeScript 代码示例

### 示例 1：Permissions API 查询器

```typescript
type PermissionName = 'geolocation' | 'notifications' | 'camera' | 'microphone' | 'clipboard-read' | 'clipboard-write';

class PermissionManager {
  private cache = new Map<PermissionName, PermissionState>();

  async query(name: PermissionName): Promise<PermissionState> {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    try {
      const status = await navigator.permissions.query({ name } as any);
      this.cache.set(name, status.state);

      status.addEventListener('change', () => {
        this.cache.set(name, status.state);
      });

      return status.state;
    } catch {
      return 'prompt';
    }
  }

  async requestIfNeeded(name: PermissionName, callback: () => void) {
    const state = await this.query(name);
    if (state === 'granted') {
      callback();
    } else if (state === 'prompt') {
      // Trigger permission request by calling the API
      callback();
    }
  }
}
```

### 示例 2：CHIPS Cookie 分区化检测器

```typescript
interface CookieOptions {
  name: string;
  value: string;
  partitioned?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  secure?: boolean;
}

class CHIPSManager {
  setPartitionedCookie(options: CookieOptions): boolean {
    if (options.partitioned && !options.secure) {
      console.error('Partitioned cookies require Secure attribute');
      return false;
    }

    const parts = [
      `${encodeURIComponent(options.name)}=${encodeURIComponent(options.value)}`,
      'Path=/',
      options.sameSite ? `SameSite=${options.sameSite}` : '',
      options.secure ? 'Secure' : '',
      options.partitioned ? 'Partitioned' : '',
    ].filter(Boolean);

    document.cookie = parts.join('; ');
    return true;
  }

  isPartitionedSupported(): boolean {
    // Test by setting a cookie with Partitioned and checking if it's accepted
    const testName = '__chips_test';
    this.setPartitionedCookie({
      name: testName,
      value: '1',
      partitioned: true,
      secure: true,
      sameSite: 'None',
    });

    const supported = document.cookie.includes(testName);
    // Clean up
    document.cookie = `${testName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; Partitioned`;
    return supported;
  }
}
```

### 示例 3：Topics API 模拟器

```typescript
interface Topic {
  id: number;
  name: string;
  taxonomyVersion: string;
}

class TopicsAPIMock {
  private userTopics: Map<number, Topic[]> = new Map();
  private readonly TAXONOMY: Topic[] = [
    { id: 1, name: 'Arts & Entertainment', taxonomyVersion: '1' },
    { id: 2, name: 'Autos & Vehicles', taxonomyVersion: '1' },
    { id: 3, name: 'Business & Industrial', taxonomyVersion: '1' },
    { id: 4, name: 'Computers & Electronics', taxonomyVersion: '1' },
    { id: 5, name: 'Finance', taxonomyVersion: '1' },
  ];

  // Simulate browsing history to topic mapping
  recordVisit(siteCategory: string) {
    const topic = this.TAXONOMY.find(t =>
      siteCategory.toLowerCase().includes(t.name.split(' ')[0].toLowerCase())
    );
    if (!topic) return;

    const week = this.getCurrentWeek();
    if (!this.userTopics.has(week)) {
      this.userTopics.set(week, []);
    }
    const topics = this.userTopics.get(week)!;
    if (!topics.find(t => t.id === topic.id)) {
      topics.push(topic);
    }
  }

  async browsingTopics(): Promise<Topic[]> {
    const currentWeek = this.getCurrentWeek();
    const result: Topic[] = [];

    // Return topics from last 3 weeks
    for (let i = 0; i < 3; i++) {
      const week = currentWeek - i;
      const topics = this.userTopics.get(week) || [];
      for (const topic of topics) {
        if (!result.find(t => t.id === topic.id)) {
          result.push(topic);
        }
      }
    }

    // Max 3 topics per call
    return result.slice(0, 3);
  }

  private getCurrentWeek(): number {
    const now = new Date();
    return Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  }
}
```

### 示例 4：Storage Access API 封装器

```typescript
class StorageAccessManager {
  async request(): Promise<boolean> {
    if (!('requestStorageAccess' in document)) {
      // Browser doesn't support Storage Access API
      return false;
    }

    try {
      const hasAccess = await document.hasStorageAccess();
      if (hasAccess) return true;

      await document.requestStorageAccess();
      return true;
    } catch {
      return false;
    }
  }

  // Check if we can use storage access without user gesture
  async canRequestAutoGrant(): Promise<boolean> {
    try {
      // In some browsers, if user has previously granted access,
      // requestStorageAccess() may resolve without a gesture
      await document.requestStorageAccess();
      return true;
    } catch {
      return false;
    }
  }
}
```

### 示例 5：Privacy Sandbox 归因报告噪声模拟器

```typescript
interface AttributionConfig {
  epsilon: number; // Privacy budget parameter
  maxValue: number;
  l1Sensitivity: number;
}

class DifferentialPrivacySimulator {
  constructor(private config: AttributionConfig) {}

  // Laplace mechanism
  addNoise(trueValue: number): number {
    const scale = this.config.l1Sensitivity / this.config.epsilon;
    const noise = this.sampleLaplace(0, scale);
    return Math.max(0, Math.min(this.config.maxValue, trueValue + noise));
  }

  private sampleLaplace(mean: number, scale: number): number {
    const u = Math.random() - 0.5;
    return mean - scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  // Simulate batch reporting
  simulateBatch(trueValues: number[]): { trueSum: number; noisySum: number; error: number } {
    const noisyValues = trueValues.map(v => this.addNoise(v));
    const trueSum = trueValues.reduce((a, b) => a + b, 0);
    const noisySum = noisyValues.reduce((a, b) => a + b, 0);
    return {
      trueSum,
      noisySum,
      error: Math.abs(noisySum - trueSum) / trueSum,
    };
  }
}
```

### 示例 6：跨浏览器隐私特性检测器

```typescript
interface PrivacyFeatures {
  thirdPartyCookiesBlocked: boolean;
  itpEnabled: boolean;
  storageAccessApi: boolean;
  topicsApi: boolean;
  protectedAudience: boolean;
  attributionReporting: boolean;
  partitionedCookies: boolean;
}

class PrivacyFeatureDetector {
  async detect(): Promise<PrivacyFeatures> {
    return {
      thirdPartyCookiesBlocked: await this.checkThirdPartyCookies(),
      itpEnabled: this.checkITP(),
      storageAccessApi: 'requestStorageAccess' in document,
      topicsApi: 'browsingTopics' in document,
      protectedAudience: 'joinAdInterestGroup' in navigator,
      attributionReporting: 'attributionReporting' in document,
      partitionedCookies: this.checkPartitionedCookies(),
    };
  }

  private async checkThirdPartyCookies(): Promise<boolean> {
    // Simplified: check if we can set a third-party cookie
    // In reality, this requires an actual cross-origin test
    return !navigator.cookieEnabled; // Fallback heuristic
  }

  private checkITP(): boolean {
    // Safari ITP detection heuristic
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    return isSafari && /Version\/1[5-9]/.test(navigator.userAgent);
  }

  private checkPartitionedCookies(): boolean {
    return 'cookieStore' in window || document.cookie.includes('Partitioned');
  }
}
```

---

## 参考文献

1. W3C. *Permissions API.* W3C Working Draft. <https://www.w3.org/TR/permissions/>
2. WICG. *Privacy Sandbox.* <https://privacysandbox.com/>
3. Google. *The Privacy Sandbox.* developer.chrome.com, 2024.
4. Google. *Topics API.* developer.chrome.com, 2024.
5. Google. *Protected Audience API.* developer.chrome.com, 2024.
6. Google. *Attribution Reporting.* developer.chrome.com, 2024.
7. Apple. *Intelligent Tracking Prevention.* WebKit Blog, 2017-2024.
8. Mozilla. *Total Cookie Protection.* Mozilla Security Blog, 2021.
9. UK CMA. *Privacy Sandbox Commitments.* Competition and Markets Authority, 2022.
10. W3C. *Fenced Frame.* WICG Explainer. <https://github.com/WICG/fenced-frame>
