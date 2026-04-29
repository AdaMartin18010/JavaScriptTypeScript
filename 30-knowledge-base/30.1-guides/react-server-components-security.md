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
| **闭包泄漏** | Server Action 闭包捕获敏感上下文 | 显式序列化参数，避免隐式闭包 |
| **引用遍历攻击** | 客户端通过 `$R` 引用反查服务端对象 | 使用 `taint` API 标记不可序列化对象 |

---

## 安全边界：Server vs Client 对比

| 维度 | Server Component | Client Component |
|------|------------------|------------------|
| **执行环境** | Node.js / Edge Runtime | 浏览器 |
| **可访问 API** | `fs`, `db`, `process.env` | `window`, `localStorage`, `fetch` |
| **序列化风险** | 可能意外泄露敏感数据到 RSC Payload | Props 可被篡改后回传 Server Action |
| **认证边界** | 默认可信（需校验 session/cookie） | 默认不可信（所有输入需重新校验） |
| **Bundle 包含** | 不包含在客户端 JS bundle 中 | 完全下载到浏览器 |
| **安全策略** | 最小暴露 + 参数化查询 | 输入校验 + XSS 过滤 |

---

## 代码示例

### RSC 认证边界与数据脱敏

```tsx
// ✅ 安全：敏感操作留在服务端，仅传递脱敏数据
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';

async function ServerComponent() {
  const { userId } = await auth();
  if (!userId) {
    return <div>未登录</div>;
  }

  // 仅服务端可访问数据库
  const rawData = await db.query(
    'SELECT id, name, email, ssn FROM users WHERE id = ?',
    [userId]
  );

  // 显式脱敏：仅向客户端传递白名单字段
  const publicData = {
    id: rawData.id,
    name: rawData.name,
  };

  return <ClientComponent publicData={publicData} />;
}

// ✅ 安全：Server Action 使用 Zod 校验所有输入
'use server';

const UpdateProfileSchema = z.object({
  name: z.string().min(1).max(50),
  bio: z.string().max(500).optional(),
});

export async function updateProfile(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  // 严格校验客户端输入
  const parsed = UpdateProfileSchema.safeParse({
    name: formData.get('name'),
    bio: formData.get('bio'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten() };
  }

  // 参数化查询防止 SQL 注入
  await db.query('UPDATE users SET name = ?, bio = ? WHERE id = ?', [
    parsed.data.name,
    parsed.data.bio,
    userId,
  ]);

  return { success: true };
}

// ❌ 危险：传递原始数据到客户端
async function UnsafeComponent() {
  const data = await db.query('SELECT * FROM users');
  return <ClientComponent allUsers={data} />; // 可能泄露隐私
}

// ❌ 危险：闭包隐式捕获敏感数据
'use server';
export async function createUnsafeAction(userId: string) {
  const secrets = await db.query('SELECT * FROM secrets WHERE user_id = ?', [userId]);
  // 闭包捕获 secrets，可能被序列化到客户端
  return async () => {
    return secrets; // 泄露！
  };
}
```

---

## 最佳实践

1. **最小暴露原则**：Server Component 仅向 Client Component 传递必要数据
2. **输入校验**：Server Actions 中使用 Zod 严格校验所有输入
3. **认证边界**：每个 Server Action 独立校验用户身份
4. **环境隔离**：`.env.local` 中的密钥永不出现在客户端 bundle
5. **审计日志**：记录所有 Server Action 调用，便于溯源
6. **闭包审计**：避免在 Server Action 中隐式捕获敏感上下文
7. **Taint 标记**：React 19+ 使用 `taintObjectReference` / `taintUniqueValue` 标记不可泄漏数据

---

## 参考链接

- [React Server Components — RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Next.js Security — Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [React Taint API (Canary)](https://react.dev/reference/react/experimental_taintObjectReference)
- [OWASP Top 10 — Injection](https://owasp.org/Top10/A03_2021-Injection/)
- [Zod Schema Validation](https://zod.dev/)

---

*最后更新: 2026-04-29*
