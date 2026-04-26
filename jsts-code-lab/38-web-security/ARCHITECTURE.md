# Web 安全 — 架构设计

## 1. 架构概述

本模块实现了 Web 应用的多层安全防护体系，包括输入验证、输出编码、安全头和运行时监控。展示纵深防御的安全架构。

## 2. 核心组件

### 2.1 输入防护层
- **Schema Validator**: 请求参数结构验证（Zod/Joi）
- **Sanitizer**: HTML/CSS/JS 注入消毒
- **File Validator**: 上传文件类型、大小、内容检查

### 2.2 输出安全层
- **CSP Generator**: 动态内容安全策略生成
- **Header Injector**: 安全头自动注入（HSTS、X-Frame-Options）
- **Response Filter**: 敏感信息脱敏

### 2.3 运行时监控
- **XSS Auditor**: 反射型 XSS 检测
- **CSRF Guard**: 令牌验证和 SameSite Cookie 策略
- **Rate Limiter**: 基于 IP/用户/行为的限流

## 3. 数据流

```
Request → WAF Rules → Input Validation → Business Logic → Output Encoding → Security Headers → Response
              ↓              ↓                  ↓
          Block(403)    Block(400)      Sanitize/Alert
```

## 4. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| XSS 防护 | DOMPurify + CSP | 多层防护 |
| 会话管理 | httpOnly + SameSite + Secure | 防御 XSS 和 CSRF |
| 密码存储 | Argon2id | 抗 GPU/ASIC 破解 |

## 5. 质量属性

- **安全性**: OWASP Top 10 全覆盖
- **可用性**: 安全策略不阻碍正常功能
- **可审计性**: 安全事件完整日志
