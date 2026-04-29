---
dimension: 综合
sub-dimension: Auth modern lab
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Auth modern lab 核心概念与工程实践。

## 包含内容

- 本模块聚焦 auth modern lab 核心概念与工程实践。
- 涵盖 Better Auth 集成、OAuth2 PKCE 流程、Passkeys/WebAuthn 实现与 RBAC 中间件。

## 子模块速查

| 子模块 | 类型 | 说明 |
|--------|------|------|
| ARCHITECTURE.md | 文档 | 现代认证架构设计 |
| README.md | 文档 | 模块入口与快速开始 |
| THEORY.md | 文档 | 认证理论形式化定义 |
| better-auth-setup.ts | 源码 | Better Auth 框架集成 |
| oauth2-pkce-flow.ts | 源码 | OAuth2 PKCE 完整流程 |
| passkeys-implementation.ts | 源码 | WebAuthn/Passkeys 实现 |
| rbac-middleware.ts | 源码 | 基于角色的访问控制 |
| index.ts | 源码 | 模块统一导出 |

## 代码示例

```typescript
// passkeys-implementation.ts — WebAuthn 注册与认证简化版
interface PasskeyCredential {
  id: string;
  publicKey: ArrayBuffer;
}

class PasskeyService {
  async register(
    userId: string,
    challenge: Uint8Array
  ): Promise<PasskeyCredential> {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Example App', id: location.hostname },
        user: {
          id: new TextEncoder().encode(userId),
          name: userId,
          displayName: userId,
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        authenticatorSelection: { userVerification: 'preferred' },
      },
    }) as PublicKeyCredential;

    const response = credential.response as AuthenticatorAttestationResponse;
    return {
      id: credential.id,
      publicKey: response.getPublicKey()!,
    };
  }

  async authenticate(
    credentialId: string,
    challenge: Uint8Array
  ): Promise<boolean> {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: new Uint8Array([...credentialId].map(c => c.charCodeAt(0))), type: 'public-key' }],
        userVerification: 'preferred',
      },
    });
    return assertion !== null;
  }
}
```

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 95-auth-modern-lab.test.ts
- 📄 ARCHITECTURE.md
- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 better-auth-setup.ts
- 📄 index.ts
- 📄 oauth2-pkce-flow.ts
- 📄 passkeys-implementation.ts
- 📄 rbac-middleware.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Better Auth | 官方文档 | [www.better-auth.com](https://www.better-auth.com/) |
| WebAuthn / Passkeys | MDN | [developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Authentication_API) |
| WebAuthn Spec | W3C | [w3c.github.io/webauthn](https://w3c.github.io/webauthn/) |
| OAuth 2.1 Draft | 草案 | [datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-11](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-11) |
| FIDO Alliance | 官方 | [fidoalliance.org/passkeys](https://fidoalliance.org/passkeys/) |
| Passkey Developer Guide | 指南 | [developers.google.com/identity/passkeys](https://developers.google.com/identity/passkeys) |

---

*最后更新: 2026-04-29*
