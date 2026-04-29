# 安全知识中枢

> **路径**: `30-knowledge-base/30.6-security/`
> **定位**: JavaScript/TypeScript 应用安全的系统性知识索引。本目录聚焦 Web 安全攻防、身份认证、供应链安全、隐私合规等领域，为开发者提供从漏洞原理到防御实践的全链路安全指南。

---

## 目录

- [安全知识中枢](#安全知识中枢)
  - [目录](#目录)
  - [核心主题](#核心主题)
    - [1. OWASP Top 10 与 Web 漏洞](#1-owasp-top-10-与-web-漏洞)
    - [2. XSS 跨站脚本攻击](#2-xss-跨站脚本攻击)
    - [3. CSRF 跨站请求伪造](#3-csrf-跨站请求伪造)
    - [4. CSP 内容安全策略](#4-csp-内容安全策略)
    - [5. 认证与授权安全](#5-认证与授权安全)
    - [6. 供应链安全](#6-供应链安全)
    - [7. 加密与隐私合规](#7-加密与隐私合规)
  - [安全工具推荐](#安全工具推荐)
  - [关联文档](#关联文档)

---

## 核心主题

### 1. OWASP Top 10 与 Web 漏洞

OWASP Top 10 是 Web 应用安全风险的权威基准。2025 版核心风险包括：

- **A01:2021-Broken Access Control**（失效的访问控制）
- **A02:2021-Cryptographic Failures**（加密机制失效）
- **A03:2021-Injection**（注入攻击，含 SQL、NoSQL、OS 命令注入）
- **A07:2021-Identification and Authentication Failures**（身份识别与认证失效）
- **A08:2021-Software and Data Integrity Failures**（软件与数据完整性失效）

在 Node.js/TypeScript 应用中，需特别关注模板注入、原型链污染（`__proto__`、`constructor`）、以及 `eval()` / `new Function()` 带来的代码执行风险。

### 2. XSS 跨站脚本攻击

XSS 允许攻击者将恶意脚本注入其他用户浏览的页面，分为三类：

- **存储型 XSS**：恶意脚本持久化存储于数据库，影响所有访问用户。
- **反射型 XSS**：恶意脚本嵌入 URL，诱骗用户点击触发。
- **DOM 型 XSS**：前端 JavaScript 不安全处理用户输入，直接修改 DOM。

**防御策略**：

- 对所有用户输入进行上下文感知的编码（HTML、JavaScript、URL、CSS）。
- 使用 DOMPurify 等库净化富文本内容。
- 避免使用 `innerHTML`、`document.write`，优先使用 `textContent` 或 React/Vue 的自动转义机制。
- 配置严格的 Content Security Policy（CSP）。

### 3. CSRF 跨站请求伪造

CSRF 利用用户已认证的会话，诱导其在不知情的情况下执行非预期操作。

**防御策略**：

- **CSRF Token**：服务端生成一次性令牌，嵌入表单或请求头（如 `csrf-token`）。
- **SameSite Cookie**：设置 `SameSite=Strict` 或 `SameSite=Lax`，阻止跨站携带 Cookie。
- **自定义请求头**：如 `X-Requested-With`，简单跨站请求无法自定义头部（受 CORS 预检限制）。
- **双重提交 Cookie**：将 Token 同时放入 Cookie 和请求参数中进行比对。

> 现代框架（如 Next.js、NestJS）和库（如 `csurf`、`helmet`）均提供 CSRF 防护中间件。

### 4. CSP 内容安全策略

CSP 通过 HTTP 响应头定义浏览器可加载资源的来源白名单，是缓解 XSS 和数据注入的有效纵深防御手段：

```http
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-{random}'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.example.com;
```

关键指令：

- `script-src`：控制 JavaScript 来源，建议使用 `nonce` 或严格哈希。
- `style-src`：限制 CSS 来源，`unsafe-inline` 应尽量避免。
- `frame-ancestors`：防止点击劫持，替代已废弃的 `X-Frame-Options`。
- `upgrade-insecure-requests`：自动将 HTTP 资源升级为 HTTPS。

### 5. 认证与授权安全

- **密码安全**：使用 bcrypt、Argon2 或 scrypt 进行哈希，禁止明文或弱哈希（如 MD5、SHA1）。
- **JWT 安全**：使用强签名算法（RS256 / ES256），设置合理的过期时间（access token 15 分钟，refresh token 7~30 天），实现令牌轮换与撤销机制。
- **会话管理**：Secure、HttpOnly、SameSite 标志必须设置；定期轮换会话 ID。
- **OAuth / OIDC**：严格校验 state 参数防 CSRF，使用 PKCE 流程保护移动端/SPA 授权码。

### 6. 供应链安全

npm 生态的依赖树庞大，供应链攻击面持续扩大：

- **依赖审计**：定期运行 `npm audit`、`pnpm audit` 或 Snyk、Socket.dev 进行自动化扫描。
- **锁定文件**：确保 `package-lock.json`、`pnpm-lock.yaml` 受版本控制，防止依赖漂移。
- **最小权限原则**：使用 `.npmrc` 的 `engine-strict`、only-allow 等约束，限制安装范围。
- **签名验证**：启用 npm 的 provenance attestations，验证包发布来源。

### 7. 加密与隐私合规

- **传输层加密**：强制 TLS 1.2+，使用 Let's Encrypt 或云厂商托管证书，启用 HSTS。
- **数据加密**：敏感数据（PII、密钥）在静态存储时使用 AES-256-GCM 或 ChaCha20-Poly1305。
- **密钥管理**：优先使用云厂商 KMS（AWS KMS、Azure Key Vault）或 HashiCorp Vault，避免硬编码密钥。
- **合规框架**：GDPR（欧盟）、CCPA（加州）、PIPL（中国）对数据收集、存储、删除有明确要求，需在架构设计阶段纳入考量。

---

## 安全工具推荐

| 工具 | 用途 |
|------|------|
| **Helmet** | Express/Fastify 安全响应头中间件 |
| **DOMPurify** | 浏览器端 HTML 净化 |
| **bcrypt / Argon2** | 密码哈希 |
| **jose** | JWT/JWS/JWE 的 JavaScript 实现 |
| **Snyk / Socket.dev** | 依赖漏洞与供应链安全扫描 |
| **ZAP / Burp Suite** | Web 应用渗透测试 |

---

## 关联文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 知识库总览 | [../README.md](../README.md) | `30-knowledge-base` 根目录索引 |
| 后端知识中枢 | [../30.4-backend/README.md](../30.4-backend/README.md) | 认证授权、API 安全实践 |
| 生态全景 | [../../40-ecosystem/README.md](../../40-ecosystem/README.md) | Awesome JS/TS 生态库导航（含安全工具） |
| 对比矩阵 | [../30.3-comparison-matrices/](../30.3-comparison-matrices/) | 安全工具与框架横向对比 |

---

*最后更新: 2026-04-29*
