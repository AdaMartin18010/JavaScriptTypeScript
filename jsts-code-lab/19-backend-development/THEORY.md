# 后端开发 — 理论基础

## 1. HTTP 服务端架构

### 1.1 请求处理流程

```
请求 → 路由匹配 → 中间件栈 → 处理器 → 响应
```

### 1.2 中间件模式

每个中间件函数接收 `(req, res, next)`：

- 可以修改请求/响应对象
- 可以终止请求（不调用 next）
- 可以调用 next() 将控制权传递给下一个中间件
- 应用：认证、日志、错误处理、压缩、CORS

## 2. 认证授权体系

### 2.1 认证（Authentication）—— 确认你是谁

- **Session + Cookie**: 服务端存储会话状态，Cookie 传递 Session ID
- **JWT**: 无状态令牌，包含签名防止篡改，服务端无需存储会话
- **OAuth 2.0**: 第三方授权框架，委托访问权限
- **Passkeys**: 基于 WebAuthn 的无密码认证

### 2.2 授权（Authorization）—— 确认你能做什么

- **RBAC**: 基于角色的访问控制（用户→角色→权限）
- **ABAC**: 基于属性的访问控制（动态策略评估）
- **ACL**: 访问控制列表（直接绑定用户与资源权限）

## 3. 数据库访问模式

- **Active Record**: 模型类直接包含 CRUD 方法
- **Repository**: 数据访问逻辑封装在仓储层
- **DAO**: 数据访问对象，更底层的数据库操作抽象
- **Unit of Work**: 跟踪对象变更，批量提交事务

## 4. API 设计

- **REST**: 资源导向，使用 HTTP 方法表达语义（GET/POST/PUT/DELETE）
- **RPC**: 动作导向，直接暴露操作（gRPC、JSON-RPC、tRPC）
- **GraphQL**: 客户端驱动查询，单一端点，精确获取所需数据

## 5. 与相邻模块的关系

- **21-api-security**: API 安全威胁与防御
- **20-database-orm**: 数据库设计与 ORM 使用
- **24-graphql**: GraphQL 的深层实现
