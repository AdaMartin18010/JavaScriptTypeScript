# 现代认证实验室 — 理论基础

## 1. 认证演进脉络

| 阶段 | 技术 | 安全性 | 用户体验 |
|------|------|--------|---------|
| 密码时代 | 用户名+密码 | ⭐⭐ | ⭐⭐⭐ |
| Token 时代 | JWT / Session | ⭐⭐⭐ | ⭐⭐⭐ |
| OAuth 时代 | 第三方登录 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Passkeys 时代 | WebAuthn / FIDO2 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 2. 现代认证提供商对比

| 维度 | Auth0 | Clerk | Lucia | NextAuth.js (Auth.js) |
|------|-------|-------|-------|----------------------|
| **定位** | 企业级身份平台 | 为 React/Next.js 优化的全栈认证 | 轻量、框架无关的会话管理库 | 开源 OAuth/SSO 适配框架 |
| **价格** | 免费 25k MAU → 企业版 | 免费 10k MAU → 按需 | 完全开源免费 | 完全开源免费 |
| **UI 组件** | Universal Login（托管） | 开箱即用的 `<SignIn />` / `<UserButton />` | 无（需自建 UI） | 无（需自建或 Headless） |
| **多租户** | 原生支持（Organizations） | 支持 | 需自行实现 | 需自行实现 |
| **Passkeys** | 支持 | 原生支持 | 需集成 WebAuthn | 实验性支持 |
| **JWT/Session** | 两者皆可 | 自动处理会话 + JWT | 仅 Session（Cookie） | 两者皆可（Adapter 模式） |
| **边缘兼容** | 有限 | 原生支持 Edge Runtime | 原生支持 Edge | 原生支持 Edge |
| **最佳场景** | 大型企业、多应用联邦 | 全栈/前端优先的快速启动 | 自建后端、极致控制 | 已有 OAuth 需求、预算有限 |

> **选型建议**：
>
> - 快速上线且重视用户体验 → **Clerk**
> - 已有复杂身份基础设施 → **Auth0**
> - 自建后端、需要完全控制 → **Lucia**
> - 仅需社交 OAuth 登录 → **NextAuth.js / Auth.js**

## 3. Clerk 中间件代码示例

```tsx
// middleware.ts — Next.js App Router with Clerk
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 定义公开路由
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhook(.*)'
]);

// 定义管理员路由
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();

  // 未登录用户访问受保护路由 → 重定向登录
  if (!isPublicRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // 管理员路由权限检查（依赖 Clerk 的 publicMetadata）
  if (isAdminRoute(req)) {
    const role = sessionClaims?.metadata?.role;
    if (role !== 'admin') {
      return new Response('Forbidden: Admin access required', { status: 403 });
    }
  }

  // 允许通过
}, {
  // 调试与性能选项
  debug: process.env.NODE_ENV === 'development',
});

export const config = {
  matcher: [
    // 排除 Next.js 内部静态资源
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // 始终运行 API 路由
    '/(api|trpc)(.*)',
  ],
};
```

服务端组件中获取用户信息：

```tsx
// app/dashboard/page.tsx
import { currentUser } from '@clerk/nextjs/server';

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    return <div>请登录</div>;
  }

  return (
    <div>
      <h1>欢迎, {user.firstName}</h1>
      <p>邮箱: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

## 4. Passkeys / WebAuthn

Passkeys 是基于公钥密码学的无密码认证标准（FIDO2/WebAuthn）：

- **注册**: 设备生成公私钥对，公钥发送给服务端，私钥保存在设备安全硬件（TPM/Secure Enclave）
- **认证**: 服务端发送挑战（Challenge），设备用私钥签名，服务端用公钥验证
- **跨设备同步**: 通过平台凭证管理器（Apple Keychain、Google Password Manager）同步
- **防钓鱼**: 绑定 origin，无法在钓鱼网站使用

## 5. OAuth 2.1 更新

OAuth 2.1 合并了 OAuth 2.0 + 安全最佳实践（PKCE 强制、隐式授权淘汰）：

- **Authorization Code + PKCE**: 唯一推荐的公共客户端流程
- **Device Code**: IoT/无浏览器设备的认证
- **JWT Profile**: 标准化令牌格式

## 6. FedCM (Federated Credential Management)

Chrome 提出的联邦身份管理新 API，解决第三方 Cookie 禁用后的社交登录问题：

- 浏览器作为身份中介，不依赖跨站 Cookie
- 用户明确选择身份提供者
- 防止隐蔽追踪（IDP 无法知道用户访问了哪些网站）

## 7. 零信任架构

现代认证的核心原则是**永不信任，始终验证**：

- 每次请求都验证身份和权限
- 最小权限原则（Least Privilege）
- 持续风险评估（设备健康、位置、行为异常）
- 微分段（Micro-segmentation）限制横向移动

## 8. 与相邻模块的关系

- **21-api-security**: API 层面的认证授权实现
- **38-web-security**: Web 层面的安全威胁与防御
- **94-ai-agent-lab**: AI Agent 的认证与权限管理

## 参考链接

- [Clerk Documentation](https://clerk.com/docs)
- [Auth0 Documentation](https://auth0.com/docs)
- [Lucia Auth](https://lucia-auth.com/)
- [Auth.js (NextAuth.js v5)](https://authjs.dev/)
- [Web Authentication (WebAuthn) — W3C](https://www.w3.org/TR/webauthn-2/)
- [FIDO Alliance Passkeys](https://fidoalliance.org/passkeys/)
- [OAuth 2.1 — IETF Draft](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-10)
