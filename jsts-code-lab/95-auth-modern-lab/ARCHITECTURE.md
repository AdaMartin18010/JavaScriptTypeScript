# 现代认证实验室 — 架构设计

## 1. 架构概述

本模块实现了现代 Web 认证的完整技术栈，包括 Passkeys、OAuth 2.1、JWT 会话管理和多因素认证。展示从注册到登出的全生命周期安全架构。

## 2. 核心组件

### 2.1 Passkeys 系统
- **WebAuthn Server**: 挑战生成、注册/认证验证
- **Credential Store**: 公钥凭证的安全存储
- **Cross-Device Sync**: 跨设备凭证同步适配

### 2.2 OAuth 2.1 服务器
- **Authorization Endpoint**: 授权码颁发
- **Token Endpoint**: 访问/刷新令牌颁发和验证
- **PKCE Validator**: 授权码交换验证

### 2.3 会话管理
- **JWT Issuer**: 签名令牌生成
- **Session Store**: 有状态会话的分布式存储
- **Refresh Rotator**: 刷新令牌轮换机制

### 2.4 MFA 引擎
- **TOTP Generator**: 基于时间的一次性密码
- **WebAuthn MFA**: 生物识别第二因素
- **Recovery Codes**: 备用恢复码生成和验证

## 3. 数据流

```
Login Request → Strategy Selector → Passkeys / OAuth / Password → MFA Challenge → Session Creation → Response
```

## 4. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 主认证 | Passkeys 优先 | 最安全、用户体验最好 |
| 回退认证 | OAuth 2.1 + 密码 | 兼容性和覆盖面 |
| 会话方案 | JWT + Redis | 无状态 + 可撤销 |

## 5. 质量属性

- **安全性**: 抗钓鱼、抗重放、抗暴力破解
- **可用性**: 跨平台、跨设备的无缝体验
- **合规性**: 符合 FIDO2 / OAuth 2.1 标准
