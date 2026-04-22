# Web 安全模块

> 模块编号: 38-web-security
> 复杂度: ⭐⭐⭐⭐ (高级)
> 目标读者: 全栈工程师、安全工程师

---

## 模块概述

本模块覆盖 Web 应用安全的**核心防御机制**，从输入过滤到输出编码，从 CSP 到安全头部，提供可落地的 TypeScript 安全工具实现。

## 核心内容

| 文件 | 主题 | 覆盖范围 |
|------|------|----------|
| `xss-csp.ts` | XSS 防护与 CSP | 输入过滤、输出编码、内容安全策略构建、CSRF 防护、安全头部配置 |
| `xss-csp.test.ts` | 测试覆盖 | 所有安全类的单元测试 |

## 安全防御层次

```
第一层: 输入过滤        → XSSSanitizer（清理危险标签、URL、CSS）
第二层: 输出编码        → HTMLEncoder（HTML/JS/CSS/URL 上下文编码）
第三层: 内容安全策略    → CSPBuilder（限制资源加载来源）
第四层: 请求来源验证    → CSRFProtection（Token / Double-Submit Cookie）
第五层: 安全响应头部    → SecurityHeadersBuilder（HSTS、COOP、COEP 等）
```

## 关键概念

- **XSS（跨站脚本）**：通过注入恶意脚本窃取用户数据或执行未授权操作
- **CSP（内容安全策略）**：通过 HTTP 头部限制页面可加载的资源来源
- **CSRF（跨站请求伪造）**：诱导已认证用户执行非预期操作
- **安全头部**：HSTS、X-Frame-Options、COOP/COEP 等浏览器安全机制

## 关联模块

- `21-api-security` — JWT、CORS、Rate Limiting
- `81-cybersecurity` — 密码学、威胁建模、安全审计
- `examples/nodejs-api-security-boilerplate` — 生产级 API 安全实践

## 参考资源

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN CSP 文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
