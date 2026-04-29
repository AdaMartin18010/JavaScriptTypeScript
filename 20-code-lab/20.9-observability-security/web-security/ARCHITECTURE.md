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

## 3. 安全架构纵深防御层次

| 层级 | 名称 | 职责 | 关键技术 / 工具 | 防御目标 |
|------|------|------|----------------|---------|
| **L7 边缘层** | CDN + WAF | 流量清洗、DDoS 缓解、规则过滤 | Cloudflare WAF, AWS WAF, ModSecurity | DDoS, SQLi, XSS, 恶意 Bot |
| **L7 网关层** | 反向代理 / API Gateway | 限流、认证、TLS 终结 | Nginx, Envoy, Kong, Traefik | 暴力破解、未授权访问、流量突增 |
| **L7 应用层** | 应用运行时安全 | 输入验证、输出编码、会话管理 | Zod, DOMPurify, Helmet, express-rate-limit | XSS, CSRF, IDOR, 注入攻击 |
| **L5 传输层** | TLS / mTLS | 通信加密、证书校验 | TLS 1.3, Let's Encrypt, cert-manager | 中间人攻击、窃听、篡改 |
| **L4 网络层** | 网络隔离 | VPC、安全组、防火墙规则 | AWS Security Groups, Calico | 端口扫描、横向移动 |
| **数据层** | 数据安全 | 加密存储、最小权限、审计日志 | AES-256-GCM, Vault, KMS | 数据泄露、越权访问 |
| **运行时层** | RASP / 行为监控 | 运行时攻击检测、异常行为分析 | Sqreen, Signal Sciences, Falco | 0-day 利用、内存攻击 |

> **纵深防御原则（Defense in Depth）**：每一层独立提供有效防护，即使某一层被突破，后续层次仍能阻止攻击扩散。

## 4. 数据流

```
Request → WAF Rules → Input Validation → Business Logic → Output Encoding → Security Headers → Response
              ↓              ↓                  ↓
          Block(403)    Block(400)      Sanitize/Alert
```

## 5. 代码示例：WAF + CDN + 安全头完整配置

### 5.1 Nginx 作为 WAF / 反向代理层

```nginx
# /etc/nginx/conf.d/security.conf
# Nginx 作为 L7 网关，集成基础 WAF 规则与安全头

server {
    listen 443 ssl http2;
    server_name api.example.com;

    # TLS 1.3 强制 + 强密码套件
    ssl_protocols TLSv1.3;
    ssl_ciphers TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256;
    ssl_prefer_server_ciphers off;
    ssl_certificate /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 8.8.8.8 1.1.1.1 valid=300s;

    # 速率限制：单 IP 每秒 10 请求，突发 20
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;

    # 连接限制：单 IP 最多 10 并发连接
    limit_conn_zone $binary_remote_addr zone=addr:10m;
    limit_conn addr 10;

    # 基础 WAF 规则：拦截常见攻击签名
    location / {
        # 拦截 SQL 注入特征
        if ($args ~* "union.*select.*\(") { return 403; }
        if ($args ~* "concat.*\(") { return 403; }

        # 拦截 XSS 特征
        if ($args ~* "<script") { return 403; }
        if ($args ~* "javascript:") { return 403; }

        # 拦截路径遍历
        if ($uri ~* "\.\.") { return 403; }

        # 安全头注入
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-Frame-Options "DENY" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

        # 动态 CSP（如需要更细粒度，可在应用层生成）
        add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'nonce-$request_id'; object-src 'none'; base-uri 'self';" always;

        proxy_pass http://nodejs_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# 上游 Node.js 应用
upstream nodejs_app {
    server 127.0.0.1:3000;
    keepalive 32;
}
```

### 5.2 Express.js 应用层安全中间件栈

```typescript
// security-middleware.ts
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';
import csrf from 'csurf';
import cookieParser from 'cookie-parser';
import DOMPurify from 'isomorphic-dompurify';
import { z } from 'zod';

const app = express();

// 1. Helmet：安全头一站式配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      styleSrc: ["'self'", "'unsafe-inline'"], // 如需严格可移除 unsafe-inline
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: { maxAge: 63072000, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// 2. CORS：白名单模式
app.use(cors({
  origin: (origin, callback) => {
    const whitelist = ['https://app.example.com', 'https://admin.example.com'];
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// 3. 速率限制：区分认证与未认证
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || 'unknown',
  handler: (req, res) => {
    res.status(429).json({ error: 'Too many requests, please try again later.' });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 登录/注册接口更严格
  skipSuccessfulRequests: true, // 成功请求不计入
});

app.use(generalLimiter);
app.use('/auth', authLimiter);

// 4. 输入消毒
app.use(express.json({ limit: '10kb' })); // 限制 body 大小
app.use(mongoSanitize()); // 防止 NoSQL 注入
app.use(hpp()); // 防止 HTTP 参数污染

// 5. CSRF 保护（Cookie-based Session）
app.use(cookieParser());
app.use(csrf({ cookie: { httpOnly: true, secure: true, sameSite: 'strict' } }));
app.use((req, res, next) => {
  res.cookie('XSRF-TOKEN', req.csrfToken(), { sameSite: 'strict', secure: true });
  next();
});

// 6. 请求体 Schema 校验示例
const LoginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

app.post('/auth/login', (req, res, next) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.issues });
  }
  next();
});

// 7. 输出消毒辅助函数
export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}
```

### 5.3 Cloudflare CDN + WAF 规则配置（Terraform）

```hcl
# cloudflare_waf.tf
# 使用 Cloudflare 作为边缘 WAF + CDN

resource "cloudflare_zone" "example" {
  zone = "example.com"
}

# OWASP Core Ruleset
resource "cloudflare_ruleset" "owasp_waf" {
  zone_id = cloudflare_zone.example.id
  name    = "OWASP WAF Rules"
  kind    = "zone"
  phase   = "http_request_firewall_managed"

  rules {
    action = "block"
    expression = "(cf.waf.score lt 20)"  # WAF 分数低于 20 阻止
    description = "Block low WAF score requests"
    enabled = true
  }
}

# 自定义防火墙规则：阻止已知恶意 IP
resource "cloudflare_firewall_rule" "block_bad_ips" {
  zone_id = cloudflare_zone.example.id
  description = "Block known malicious IPs"
  filter_id   = cloudflare_filter.bad_ips.id
  action      = "block"
}

resource "cloudflare_filter" "bad_ips" {
  zone_id = cloudflare_zone.example.id
  expression = "(ip.src in { 192.0.2.1 198.51.100.0/24 })"
  description = "Known bad actor IPs"
}

# DDoS 防护覆盖
resource "cloudflare_ruleset" "ddos_protection" {
  zone_id = cloudflare_zone.example.id
  name    = "DDoS Protection"
  kind    = "zone"
  phase   = "http_request_ddos"

  rules {
    action = "execute"
    expression = "true"
    action_parameters {
      id = "4d21379b4f9f4bb088e0729962c8b3cf" # Cloudflare 托管 DDoS 规则集 ID
      overrides {
        action = "block"
      }
    }
  }
}
```

## 6. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| XSS 防护 | DOMPurify + CSP | 多层防护 |
| 会话管理 | httpOnly + SameSite + Secure | 防御 XSS 和 CSRF |
| 密码存储 | Argon2id | 抗 GPU/ASIC 破解 |

## 7. 质量属性

- **安全性**: OWASP Top 10 全覆盖
- **可用性**: 安全策略不阻碍正常功能
- **可审计性**: 安全事件完整日志

## 8. 权威参考链接

- [OWASP Top 10:2021](https://owasp.org/Top10/) — OWASP 十大 Web 安全风险
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — OWASP 安全速查表集合
- [Content Security Policy (CSP) Quick Reference](https://content-security-policy.com/) — CSP 指令速查
- [Helmet.js Documentation](https://helmetjs.github.io/) — Express 安全中间件
- [Cloudflare WAF Documentation](https://developers.cloudflare.com/waf/) — Cloudflare WAF 规则配置
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security) — Mozilla Web 安全指南
- [CORS Specification](https://fetch.spec.whatwg.org/#cors-protocol) — WHATWG Fetch CORS 规范
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/) — 免费 TLS 证书颁发
