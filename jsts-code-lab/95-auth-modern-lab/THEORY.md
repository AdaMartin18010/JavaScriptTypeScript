# 现代认证实验室 — 理论基础

## 1. 认证演进脉络

| 阶段 | 技术 | 安全性 | 用户体验 |
|------|------|--------|---------|
| 密码时代 | 用户名+密码 | ⭐⭐ | ⭐⭐⭐ |
| Token 时代 | JWT / Session | ⭐⭐⭐ | ⭐⭐⭐ |
| OAuth 时代 | 第三方登录 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| Passkeys 时代 | WebAuthn / FIDO2 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## 2. Passkeys / WebAuthn

Passkeys 是基于公钥密码学的无密码认证标准（FIDO2/WebAuthn）：

- **注册**: 设备生成公私钥对，公钥发送给服务端，私钥保存在设备安全硬件（TPM/Secure Enclave）
- **认证**: 服务端发送挑战（Challenge），设备用私钥签名，服务端用公钥验证
- **跨设备同步**: 通过平台凭证管理器（Apple Keychain、Google Password Manager）同步
- **防钓鱼**: 绑定 origin，无法在钓鱼网站使用

## 3. OAuth 2.1 更新

OAuth 2.1 合并了 OAuth 2.0 + 安全最佳实践（PKCE 强制、隐式授权淘汰）：

- **Authorization Code + PKCE**: 唯一推荐的公共客户端流程
- **Device Code**: IoT/无浏览器设备的认证
- **JWT Profile**: 标准化令牌格式

## 4. FedCM (Federated Credential Management)

Chrome 提出的联邦身份管理新 API，解决第三方 Cookie 禁用后的社交登录问题：

- 浏览器作为身份中介，不依赖跨站 Cookie
- 用户明确选择身份提供者
- 防止隐蔽追踪（IDP 无法知道用户访问了哪些网站）

## 5. 零信任架构

现代认证的核心原则是**永不信任，始终验证**：

- 每次请求都验证身份和权限
- 最小权限原则（Least Privilege）
- 持续风险评估（设备健康、位置、行为异常）
- 微分段（Micro-segmentation）限制横向移动

## 6. 与相邻模块的关系

- **21-api-security**: API 层面的认证授权实现
- **38-web-security**: Web 层面的安全威胁与防御
- **94-ai-agent-lab**: AI Agent 的认证与权限管理
