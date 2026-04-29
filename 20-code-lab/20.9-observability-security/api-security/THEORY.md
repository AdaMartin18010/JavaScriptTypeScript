# API 安全 — 理论基础

## 1. OWASP API Security Top 10

| 排名 | 风险 | 描述 |
|------|------|------|
| API1 | 对象级授权失效 | 用户可访问其他用户的数据（IDOR） |
| API2 | 认证失效 | 弱令牌、JWT 配置错误、凭证泄露 |
| API3 | 过度数据暴露 | API 返回超出需要的数据 |
| API4 | 缺乏资源限制 | 无 Rate Limiting，导致 DoS |
| API5 | 功能级授权失效 | 普通用户可访问管理员接口 |
| API6 | 批量赋值 | 客户端可修改只读字段 |
| API7 | 安全配置错误 | 默认配置、CORS 过宽、头缺失 |
| API8 | 注入攻击 | SQL、NoSQL、OS 命令注入 |
| API9 | 资产管理不当 | 旧版本 API 未下线、文档暴露 |
| API10 | 日志监控不足 | 无法及时发现和响应攻击 |

## 2. API 认证与授权机制对比

| 维度 | OAuth 2.0 | OpenID Connect (OIDC) | mTLS | JWT |
|------|-----------|----------------------|------|-----|
| **主要目的** | 授权代理（ delegated access ） | 身份认证（Authentication） | 双向传输层安全 | 令牌信息载体 |
| **参与方** | 授权服务器、资源服务器、客户端、资源所有者 | 在 OAuth 2.0 基础上增加 ID Token | 客户端 ↔ 服务端 | 签发者 ↔ 验证者 |
| **信任基础** | 授权服务器颁发的 Access Token | ID Token（JWT 格式） | X.509 证书链双向验证 | 签名密钥（HMAC/RSA/ECDSA） |
| **是否加密** | 不强制（依赖 TLS） | 不强制（依赖 TLS） | 强制 TLS 双向认证 | 仅签名（JWS），可选加密（JWE） |
| **适用场景** | 第三方应用接入、SSO | 用户身份联邦登录 | 微服务间零信任通信、IoT | 无状态会话、微服务认证传播 |
| **复杂度** | 高 | 中等 | 高（证书管理） | 低 |
| **主流实现** | Auth0、Keycloak、Okta | 同 OAuth 2.0 | Istio、Linkerd、AWS ALB | jose、jsonwebtoken |

> **选型建议**：
> - 用户登录/SSO → **OIDC**
> - 第三方 API 接入 → **OAuth 2.0 + PKCE**
> - 服务网格内部通信 → **mTLS**
> - 无状态 API 认证 → **JWT（短时效 + Refresh Token）**

## 3. JWT 验证代码示例

```typescript
import { jwtVerify, SignJWT, JWTPayload } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// 签发 JWT（Access Token）
export async function signAccessToken(payload: Record<string, unknown>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('urn:api:issuer')
    .setAudience('urn:api:audience')
    .setExpirationTime('15m') // 短时效
    .sign(SECRET);
}

// 中间件：验证 JWT
export async function verifyJwtMiddleware(request: Request): Promise<JWTPayload> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const { payload } = await jwtVerify(token, SECRET, {
      issuer: 'urn:api:issuer',
      audience: 'urn:api:audience',
      clockTolerance: 30 // 允许 30 秒时钟偏差
    });
    return payload;
  } catch (err) {
    // 区分错误类型以返回正确 HTTP 状态码
    if (err instanceof Error && err.message.includes('expired')) {
      throw new Error('Token expired');
    }
    throw new Error('Invalid token');
  }
}

// Hono / Express 风格路由守卫示例
import { Hono } from 'hono';

const app = new Hono();

app.get('/api/admin/users', async (c) => {
  const payload = await verifyJwtMiddleware(c.req.raw);

  // 功能级授权检查（API5 防护）
  if (payload.role !== 'admin') {
    return c.json({ error: 'Forbidden' }, 403);
  }

  return c.json({ users: [] });
});
```

## 4. 令牌安全

### JWT 最佳实践

- **签名算法**: 强制使用 HS256 或 RS256，禁止 none
- **过期时间**: Access Token 15-30 分钟，Refresh Token 7-30 天
- **存储位置**: 避免 localStorage（XSS 风险），使用 httpOnly Cookie
- **撤销机制**: 维护令牌黑名单或使用短生命周期 + Refresh

### API Key 管理

- 使用环境变量存储，禁止硬编码
- 定期轮换（90 天周期）
- 最小权限原则，按功能分 Key

## 5. 输入验证

- **白名单验证**: 仅允许已知安全的输入模式
- **参数化查询**: 防止 SQL/NoSQL 注入
- **文件上传**: 限制类型、大小，存储在非执行目录，重命名文件
- **ID 格式**: 使用 UUID 替代自增 ID，防止枚举攻击

## 6. Rate Limiting

| 策略 | 粒度 | 算法 |
|------|------|------|
| 固定窗口 | 每分钟/小时 | 简单计数器 |
| 滑动窗口 | 动态窗口 | 令牌桶 / 漏桶 |
| 自适应 | 用户行为 | 机器学习异常检测 |

## 7. 与相邻模块的关系

- **38-web-security**: Web 层面的安全机制（CSP、CORS、CSRF）
- **95-auth-modern-lab**: 现代认证机制深度实践
- **20-database-orm**: 数据库层面的注入防护

## 参考链接

- [OWASP API Security Top 10 2023](https://owasp.org/www-project-api-security/)
- [OAuth 2.0 for Browser-Based Apps — IETF](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-browser-based-apps)
- [JSON Web Token (JWT) Best Current Practices — RFC 8725](https://datatracker.ietf.org/doc/html/rfc8725)
- [JWT.io Debugger](https://jwt.io/)
- [OWASP Cheat Sheet Series: JWT Security](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
