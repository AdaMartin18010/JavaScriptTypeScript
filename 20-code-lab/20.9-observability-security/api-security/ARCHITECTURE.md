# API 安全 — 架构设计

## 1. 架构概述

本模块构建了一个安全的 API 网关参考实现，集成认证、授权、输入验证、速率限制和安全审计。展示生产级 API 的多层防御体系。

## 2. 核心组件

### 2.1 认证层

- **JWT Validator**: Token 签名验证、过期检查
- **Session Manager**: 有状态会话管理
- **MFA Handler**: 多因素认证流程

### 2.2 授权层

- **RBAC Engine**: 基于角色的权限检查
- **ABAC Evaluator**: 基于属性的动态策略评估
- **Scope Checker**: OAuth Scope 验证

### 2.3 防护层

- **Input Sanitizer**: 请求参数消毒和验证
- **Rate Limiter**: 令牌桶算法限流
- **WAF Rules**: 常见攻击模式拦截（SQLi、XSS）

### 2.4 审计层

- **Access Logger**: 结构化访问日志
- **Anomaly Detector**: 异常行为检测

## 3. 数据流

```
Request → WAF → Rate Limiter → Auth → Authorization → Input Validation → Handler → Response
            ↓        ↓            ↓         ↓                ↓
        Block    Block(429)   Block(401) Block(403)    Block(400)
```

## 4. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 认证协议 | JWT + Refresh Token | 无状态 + 可撤销 |
| 限流算法 | 令牌桶 | 允许突发流量 |
| 输入验证 | Schema 校验（Zod/Yup）| 声明式、类型安全 |

## 5. 质量属性

- **安全性**: 多层防护，纵深防御
- **可用性**: 限流防止资源耗尽
- **可审计性**: 完整的安全事件日志
