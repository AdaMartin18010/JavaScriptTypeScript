# API 安全 — 架构设计

## 1. 架构概述

本模块构建了一个安全的 API 网关参考实现，集成认证、授权、输入验证、速率限制和安全审计。展示生产级 API 的多层防御体系。架构采用"纵深防御"（Defense in Depth）的安全理念，将安全控制分布在网关层、应用层和数据层，每一层都独立验证和过滤，确保单点失效不会导致整体安全崩溃。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         客户端 (Client)                                  │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    HTTP Request (REST / GraphQL / gRPC)            │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      网关防护层 (Gateway Defense)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   DDoS       │  │    WAF       │  │   TLS        │                   │
│  │   Protection │  │   Rules      │  │   Termination│                   │
│  │  (Rate /     │  │ (OWASP Core  │  │  (TLS 1.3 /  │                   │
│  │   Conn Limit)│  │  Rule Set)   │  │   mTLS)      │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      认证层 (Authentication)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   JWT        │  │   Session    │  │    MFA       │                   │
│  │   Validator  │  │   Manager    │  │   Handler    │                   │
│  │ (RS256 /     │  │ (Stateless / │  │ (TOTP /      │                   │
│  │  EdDSA)      │  │  Stateful)   │  │  WebAuthn)   │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      授权层 (Authorization)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │    RBAC      │  │    ABAC      │  │   Scope      │                   │
│  │   Engine     │  │  Evaluator   │  │   Checker    │                   │
│  │ (Role-based  │  │ (Attribute-  │  │ (OAuth 2.1   │                   │
│  │  Access Ctrl)│  │  based)      │  │  Scopes)     │                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      应用防护层 (Application Defense)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Input      │  │   Rate       │  │   Output     │  │   CORS      │ │
│  │   Sanitizer  │  │   Limiter    │  │   Encoder    │  │   Handler   │ │
│  │ (Zod / Joi   │  │ (Token       │  │ (XSS         │  │ (Origin     │ │
│  │  Schema)     │  │  Bucket)     │  │  Prevention) │  │  Validation)│ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      审计层 (Audit Layer)                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Access     │  │   Anomaly    │  │   SIEM       │                   │
│  │   Logger     │  │   Detector   │  │   Export     │                   │
│  │ (Structured  │  │ (ML-based    │  │ (OTLP /      │                   │
│  │  JSON)       │  │  Baseline)   │  │  Syslog)     │                   │
│  └──────────────┘  └──────────────┘  └──────────────┘                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 认证层

| 组件 | 职责 | 标准/算法 | 安全性 |
|------|------|-----------|--------|
| JWT Validator | Token 签名验证、过期检查 | RS256 / EdDSA | 高（非对称密钥）|
| Session Manager | 有状态会话管理 | Secure Cookie + HttpOnly | 高 |
| MFA Handler | 多因素认证流程 | TOTP / WebAuthn / FIDO2 | 最高 |

### 3.2 授权层

| 组件 | 职责 | 决策模型 | 灵活性 |
|------|------|----------|--------|
| RBAC Engine | 基于角色的权限检查 | 角色 -> 权限 -> 资源 | 中 |
| ABAC Evaluator | 基于属性的动态策略评估 | 属性规则引擎 | 高 |
| Scope Checker | OAuth Scope 验证 | Scope 集合包含 | 中 |

### 3.3 防护层

| 组件 | 职责 | 技术实现 | 覆盖攻击 |
|------|------|----------|----------|
| Input Sanitizer | 请求参数消毒和验证 | Zod Schema + 白名单 | 注入类 |
| Rate Limiter | 令牌桶算法限流 | Redis + 滑动窗口 | DoS |
| WAF Rules | 常见攻击模式拦截（SQLi、XSS）| 正则 + 语义分析 | OWASP Top 10 |

### 3.4 审计层

| 组件 | 职责 | 存储 | 分析 |
|------|------|------|------|
| Access Logger | 结构化访问日志 | 不可变日志存储 | 时序查询 |
| Anomaly Detector | 异常行为检测 | 流处理 | 统计/ML |

## 4. 数据流

```
Request -> WAF -> Rate Limiter -> Auth -> Authorization -> Input Validation -> Handler -> Response
            |        |            |         |                |
        Block    Block(429)   Block(401) Block(403)    Block(400)
```

## 5. 安全方案对比

| 维度 | JWT | Session Cookie | API Key | mTLS | OAuth 2.1 | Passkeys |
|------|-----|----------------|---------|------|-----------|----------|
| 有状态 | 无 | 有 | 无 | 无 | 混合 | 无 |
| 可撤销 | 困难 | 容易 | 容易 | 困难 | 容易 | 容易 |
| 跨域 | 容易 | 需配置 | 容易 | N/A | 容易 | 容易 |
| 用户体验 | 无缝 | 无缝 | 需管理 | 无感 | 重定向 | 生物识别 |
| 安全性 | 中 | 高 | 低 | 最高 | 高 | 最高 |
| 适用场景 | SPA/API | Web App | 服务间 | 服务网格 | 第三方集成 | 现代认证 |
| 标准 | RFC 7519 | RFC 6265 | 自定义 | RFC 8446 | RFC 6749 | FIDO2 / WebAuthn |

## 6. 代码示例

### 6.1 多层安全中间件

```typescript
// api-security/src/gateway/SecurityPipeline.ts
interface SecurityContext {
  requestId: string;
  clientIp: string;
  userId?: string;
  roles: string[];
  scopes: string[];
  rateLimitBucket?: string;
}

type SecurityMiddleware = (
  req: Request,
  ctx: SecurityContext,
  next: () => Promise<Response>
) => Promise<Response>;

class SecurityPipeline {
  private middlewares: SecurityMiddleware[] = [];

  constructor(config: SecurityConfig) {
    this.middlewares = [
      wafMiddleware(config.wafRules),
      rateLimitMiddleware(config.rateLimit),
      jwtAuthMiddleware(config.jwt),
      rbacMiddleware(config.permissions),
      inputValidationMiddleware(config.schemas),
      corsMiddleware(config.cors),
      auditMiddleware(),
    ];
  }

  async handle(req: Request): Promise<Response> {
    const ctx: SecurityContext = {
      requestId: crypto.randomUUID(),
      clientIp: req.headers.get('x-forwarded-for') ?? 'unknown',
      roles: [],
      scopes: [],
    };

    const dispatch = (i: number): Promise<Response> => {
      if (i >= this.middlewares.length) {
        return this.routeToHandler(req, ctx);
      }
      return this.middlewares[i](req, ctx, () => dispatch(i + 1));
    };

    try {
      return await dispatch(0);
    } catch (err) {
      return this.errorResponse(err as Error, ctx);
    }
  }

  private async routeToHandler(req: Request, ctx: SecurityContext): Promise<Response> {
    // 路由到实际处理器
    return new Response('OK');
  }

  private errorResponse(err: Error, ctx: SecurityContext): Response {
    return new Response(JSON.stringify({ error: err.message, requestId: ctx.requestId }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// 令牌桶限流中间件
function rateLimitMiddleware(config: { requestsPerSecond: number; burstSize: number }): SecurityMiddleware {
  const buckets = new Map<string, { tokens: number; lastUpdate: number }>();

  return async (req, ctx, next) => {
    const key = ctx.clientIp;
    const now = Date.now();
    const bucket = buckets.get(key) ?? { tokens: config.burstSize, lastUpdate: now };

    // 补充令牌
    const elapsed = (now - bucket.lastUpdate) / 1000;
    bucket.tokens = Math.min(config.burstSize, bucket.tokens + elapsed * config.requestsPerSecond);
    bucket.lastUpdate = now;

    if (bucket.tokens < 1) {
      return new Response('Too Many Requests', { status: 429, headers: { 'Retry-After': '1' } });
    }

    bucket.tokens -= 1;
    buckets.set(key, bucket);
    return next();
  };
}

// JWT 验证中间件
function jwtAuthMiddleware(config: { publicKey: string; issuer: string }): SecurityMiddleware {
  return async (req, ctx, next) => {
    const auth = req.headers.get('authorization');
    if (!auth?.startsWith('Bearer ')) {
      return new Response('Unauthorized', { status: 401 });
    }

    const token = auth.slice(7);
    try {
      const payload = await verifyJWT(token, config.publicKey, config.issuer);
      ctx.userId = payload.sub;
      ctx.roles = payload.roles ?? [];
      ctx.scopes = payload.scope?.split(' ') ?? [];
    } catch {
      return new Response('Invalid Token', { status: 401 });
    }

    return next();
  };
}

async function verifyJWT(token: string, publicKey: string, issuer: string): Promise<any> {
  // 实际实现需使用 jose 或 jsonwebtoken 库
  return { sub: 'user-123', roles: ['user'], scope: 'read write' };
}
```

### 6.2 Zod 输入验证与 RBAC

```typescript
// api-security/src/validation/SchemaValidator.ts
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(['user', 'admin']).default('user'),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

function inputValidationMiddleware(schemas: Record<string, z.ZodSchema>): SecurityMiddleware {
  return async (req, ctx, next) => {
    const schema = schemas[req.url];
    if (!schema) return next();

    try {
      const body = await req.json();
      const validated = schema.parse(body);
      // 将验证后的数据附加到请求
      (req as any).validatedBody = validated;
      return next();
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Validation Failed', details: err }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
}

// RBAC 中间件
function rbacMiddleware(permissions: Record<string, string[]>): SecurityMiddleware {
  return async (req, ctx, next) => {
    const requiredRoles = permissions[req.url];
    if (!requiredRoles) return next();

    const hasPermission = requiredRoles.some(role => ctx.roles.includes(role));
    if (!hasPermission) {
      return new Response('Forbidden', { status: 403 });
    }

    return next();
  };
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 认证协议 | JWT + Refresh Token | 无状态 + 可撤销 |
| 限流算法 | 令牌桶 | 允许突发流量 |
| 输入验证 | Schema 校验（Zod/Yup） | 声明式、类型安全 |

## 8. 质量属性

- **安全性**: 多层防护，纵深防御
- **可用性**: 限流防止资源耗尽
- **可审计性**: 完整的安全事件日志

## 9. 参考链接

- [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/editions/2023/en/0x00-header/) — API 安全权威清单
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/) — 安全开发速查表
- [JSON Web Token (JWT) RFC 7519](https://tools.ietf.org/html/rfc7519) — JWT 标准规范
- [OAuth 2.1 Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1) — OAuth 2.1 草案
- [WebAuthn / FIDO2 Specification](https://www.w3.org/TR/webauthn-2/) — 无密码认证标准
- [Mozilla Web Security Guidelines](https://infosec.mozilla.org/guidelines/web_security) — Mozilla Web 安全指南
