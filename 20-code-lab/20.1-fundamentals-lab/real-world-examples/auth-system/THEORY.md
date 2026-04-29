# 认证系统

> **定位**：`20-code-lab/20.1-fundamentals-lab/real-world-examples/auth-system`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决认证系统的常见实现问题。包括 JWT 管理、会话持久化、权限校验和安全最佳实践。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| JWT | 基于签名的无状态令牌 | jwt-utils.ts |
| Refresh Token | 长期有效的访问令牌续期凭证 | auth-flow.ts |

---

## 二、设计原理

### 2.1 为什么存在

安全是应用开发的底线。认证系统验证用户身份并管理权限边界，其设计直接影响数据安全和合规性。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| JWT | 无状态、可扩展 | 令牌撤销困难 | 分布式系统 |
| Session | 服务端可控 | 存储与扩展开销 | 单体应用 |

### 2.3 特性对比表：认证模式

| 模式 | 状态 | 存储位置 | 撤销难度 | 跨域支持 | 适用场景 |
|------|------|----------|----------|----------|----------|
| Session + Cookie | 有状态 | 服务端 + 浏览器 Cookie | 易（服务端删除） | 需 CSRF 防护 | 传统 Web 应用 |
| JWT (Access + Refresh) | 无状态 | 客户端 (httpOnly / memory) | 难（需黑名单） | 天然支持 | SPA、移动 App、微服务 |
| OAuth 2.0 / OIDC | 委托态 | 授权服务器 | 中（通过撤销端点） | 标准支持 | 第三方登录、SSO |
| API Key | 无状态 | 客户端头部 | 易（服务端失效） | 天然支持 | 服务端到服务端 |
| mTLS | 无状态 | 客户端证书 | 易（吊销列表） | 复杂 | 高安全内部服务 |

### 2.4 与相关技术的对比

与 OAuth 对比：自建认证更可控，OAuth 更标准化但依赖第三方。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 认证系统 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：JWT 中间件与守卫

```typescript
import { createHmac } from 'crypto';

// ===== 极简 JWT 工具（生产环境请使用 jsonwebtoken / jose 库） =====
interface JWTPayload {
  sub: string;      // user id
  iat: number;      // issued at
  exp: number;      // expiration
  roles: string[];  // RBAC
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString('base64url');
}

function base64UrlDecode(str: string): string {
  return Buffer.from(str, 'base64url').toString('utf-8');
}

function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string, ttlSeconds = 3600): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body: JWTPayload = { ...payload, iat: now, exp: now + ttlSeconds };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const signature = createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedBody}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedBody}.${signature}`;
}

function verifyJWT(token: string, secret: string): JWTPayload {
  const [h, b, s] = token.split('.');
  if (!h || !b || !s) throw new Error('Invalid token format');

  const expected = createHmac('sha256', secret).update(`${h}.${b}`).digest('base64url');
  if (s !== expected) throw new Error('Invalid signature');

  const payload: JWTPayload = JSON.parse(base64UrlDecode(b));
  if (payload.exp * 1000 < Date.now()) throw new Error('Token expired');

  return payload;
}

// ===== Express 风格认证中间件 =====
interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

type Middleware = (req: AuthenticatedRequest, res: Response, next: () => void) => void;

function authMiddleware(secret: string): Middleware {
  return (req, res, next) => {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing token' });
      return;
    }
    try {
      req.user = verifyJWT(auth.slice(7), secret);
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

// ===== RBAC 守卫 =====
function requireRoles(...allowedRoles: string[]): Middleware {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthenticated' });
      return;
    }
    const hasRole = req.user.roles.some(r => allowedRoles.includes(r));
    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}

// 路由使用示例（伪代码）
// app.get('/admin/users', authMiddleware(SECRET), requireRoles('admin'), handler);
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| JWT 可以存储敏感信息 | JWT payload 仅 Base64 编码，可解码 |
| 前端可以安全地验证 Token | 密钥不应暴露在前端代码中 |

### 3.4 扩展阅读

- [OWASP 认证备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP JWT 安全备忘单](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [RFC 7519 — JSON Web Token (JWT)](https://datatracker.ietf.org/doc/html/rfc7519)
- [RFC 7515 — JSON Web Signature (JWS)](https://datatracker.ietf.org/doc/html/rfc7515)
- [Auth0：JWT 手册](https://auth0.com/resources/ebooks/jwt-handbook)
- [MDN：HTTP 认证](https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication)
- [jose 库 (Node.js/Web 通用)](https://github.com/panva/jose)
- `30-knowledge-base/30.6-security`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
