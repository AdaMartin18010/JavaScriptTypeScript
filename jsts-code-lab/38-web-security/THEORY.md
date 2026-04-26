# Web 安全 — 理论基础

## 1. 安全模型

Web 安全基于**同源策略（Same-Origin Policy）**和**信任边界**构建。同源策略限制不同源之间的 DOM、Cookie、LocalStorage 访问，是浏览器安全的第一道防线。

### 1.1 威胁模型 STRIDE

| 威胁 | 描述 | Web 场景 |
|------|------|---------|
| **S**poofing | 身份伪造 | 会话劫持、钓鱼攻击 |
| **T**ampering | 数据篡改 | 请求参数篡改、中间人攻击 |
| **R**epudiation | 抵赖 | 缺乏审计日志 |
| **I**nformation Disclosure | 信息泄露 | XSS、错误信息暴露 |
| **D**enial of Service | 拒绝服务 | DDoS、资源耗尽 |
| **E**levation of Privilege | 权限提升 | IDOR、垂直越权 |

## 2. 核心防御机制

### 2.1 内容安全策略（CSP）
CSP 通过 HTTP 头 `Content-Security-Policy` 限制页面可加载的资源来源：
- `default-src 'self'` — 默认只允许同源资源
- `script-src 'nonce-xxx'` — 仅允许带特定 nonce 的内联脚本
- `frame-ancestors 'none'` — 禁止被嵌入 iframe（点击劫持防护）

### 2.2 跨域安全
- **CORS**: 服务端通过 `Access-Control-Allow-Origin` 控制跨域访问
- **CSRF Token**: 同步令牌模式防止跨站请求伪造
- **SameSite Cookie**: `SameSite=Strict/Lax/None` 控制 Cookie 的跨站发送行为

### 2.3 输入安全
- **XSS 防护**: HTML 实体编码、CSP、DOMPurify 消毒
- **SQL 注入防护**: 参数化查询、ORM 使用
- **路径遍历防护**: 输入路径规范化、白名单验证

## 3. 现代 Web 安全趋势

- **Subresource Integrity (SRI)**: 验证 CDN 资源哈希，防止供应链攻击
- **Trusted Types**: 强制所有 DOM XSS 敏感操作通过策略对象
- **Permission Policy**: 细粒度控制浏览器 API 权限（摄像头、地理位置等）
- **Post-Quantum Cryptography**: 抗量子计算的加密算法准备

## 4. 与相邻模块的关系

- **21-api-security**: API 层面的认证授权与输入验证
- **95-auth-modern-lab**: 现代认证机制（Passkeys、OAuth 2.1）
- **74-observability**: 安全事件的监控与告警
