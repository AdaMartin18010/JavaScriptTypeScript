# Web 安全

> Web 应用安全威胁与防护措施速查。

---

## 常见威胁

| 威胁 | 防护 |
|------|------|
| **XSS** | 转义输出，CSP，Trusted Types |
| **CSRF** | SameSite Cookie，Token 校验 |
| **SQL 注入** | 参数化查询，ORM |
| **Clickjacking** | X-Frame-Options, CSP frame-ancestors |
| **MITM** | HTTPS, HSTS |
| **供应链攻击** | 锁文件审计，私有 Registry |

## 安全响应头

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000
Referrer-Policy: strict-origin-when-cross-origin
```

---

*最后更新: 2026-04-29*
