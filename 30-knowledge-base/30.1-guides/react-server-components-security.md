# React Server Components 安全指南

> RSC（React Server Components）架构中的安全边界、序列化风险与防护策略。

---

## 核心风险

| 风险 | 描述 | 防护措施 |
|------|------|---------|
| **敏感数据泄露** | 服务端数据意外序列化到客户端 | 明确标记 `client` / `server` 边界 |
| **服务端注入** | 用户输入被服务端执行 | 参数化查询，禁止拼接 SQL/命令 |
| **Props 污染** | 客户端 props 被篡改后回传 | 服务端重新校验所有输入 |
| **环境变量泄露** | `process.env` 误传客户端 | 仅传递白名单变量 |

---

## 安全边界

```tsx
// ✅ 安全：敏感操作留在服务端
async function ServerComponent() {
  const data = await db.query('SELECT * FROM secrets') // 仅服务端执行
  return <ClientComponent publicData={data.summary} />  // 仅传递脱敏数据
}

// ❌ 危险：传递原始数据到客户端
async function UnsafeComponent() {
  const data = await db.query('SELECT * FROM users')
  return <ClientComponent allUsers={data} />  // 可能泄露隐私
}
```

---

## 最佳实践

1. **最小暴露原则**：Server Component 仅向 Client Component 传递必要数据
2. **输入校验**：Server Actions 中使用 Zod 严格校验所有输入
3. **认证边界**：每个 Server Action 独立校验用户身份
4. **环境隔离**：`.env.local` 中的密钥永不出现在客户端 bundle
5. **审计日志**：记录所有 Server Action 调用，便于溯源

---

*最后更新: 2026-04-29*
