# 表单处理 (Form Handling)

> JavaScript/TypeScript 生态表单处理方案选型矩阵，覆盖校验、状态管理与 2026 年服务端表单趋势。

---

## 核心概念

现代表单处理包含**三个层面**：

| 层面 | 职责 | 关键问题 |
|------|------|---------|
| **状态管理** | 跟踪输入值、 dirty/touched 状态 | 受控 vs 非受控组件 |
| **校验** | 验证输入合法性，显示错误信息 | 同步 vs 异步校验，字段级 vs 表单级 |
| **提交** | 发送数据到服务端，处理响应 | 乐观更新、错误回滚、防重复提交 |

> **2026 趋势**：React Server Actions 推动表单逻辑回归服务端，客户端库聚焦于渐进增强（Progressive Enhancement）。

---

## 主流方案对比矩阵

| 维度 | React Hook Form | FormKit | TanStack Form | Zod + Server Actions |
|------|----------------|---------|---------------|---------------------|
| **包体积** | ~9KB | ~20KB | ~5KB | ~12KB（Zod） |
| **校验方案** | 内置 + 集成 Yup/Zod | 内置规则引擎 | 内置 + 集成 Zod | Zod（服务端校验） |
| **TypeScript** | 优秀（泛型路径推断） | 良好 | 优秀 | 优秀 |
| **非 React 支持** | ❌ | Vue（原生） | 框架无关 | 框架无关 |
| **服务端校验** | 需手动实现 | 需手动实现 | 需手动实现 | ✅ 原生支持 |
| **数组字段** | ✅ useFieldArray | ✅ | ✅ | ✅ |
| **性能** | 非受控，最小重渲染 | 受控，中等 | 受控，细粒度 | 服务端处理 |
| **学习曲线** | 低 | 中 | 低 | 低 |

---

## 选型决策树

```
框架？
├── React →
│   ├── 追求最小体积 + 高性能 → React Hook Form
│   ├── 全平台（React/Vue/Solid）→ TanStack Form
│   └── Next.js App Router → Zod + Server Actions（优先）
├── Vue → FormKit（Vue 原生设计）
└── 服务端驱动（HTMX/Alpine）→ Zod + 原生表单提交
```

---

## 2026 生态动态

### React Server Actions 表单

Next.js 14+ 推荐模式：服务端 Action + 客户端渐进增强：

```typescript
// app/actions.ts
'use server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function submitForm(formData: FormData) {
  const data = schema.parse(Object.fromEntries(formData))
  // 直接操作数据库
  await db.user.create({ data })
}
```

```tsx
// app/page.tsx
<form action={submitForm}>
  <input name="email" type="email" required />
  <input name="password" type="password" minLength={8} />
  <button type="submit">提交</button>
</form>
```

> 无需客户端状态管理库，HTML5 验证为基线，JS 加载后增强体验。

### TanStack Form v1

- **框架无关**：React / Vue / Solid / Svelte 统一 API
- **Headless**：仅提供逻辑，无 UI 绑定
- **与 TanStack Query 深度集成**：提交状态、缓存、乐观更新

---

## 最佳实践

1. **校验分层**：HTML5 原生验证 → JS 客户端校验 → 服务端最终校验
2. **错误状态管理**：字段级错误即时反馈，表单级错误在提交时显示
3. **防重复提交**：提交中禁用按钮，使用 `useTransition` 或 `isPending`
4. **无障碍**：每个输入关联 `<label>`，错误信息通过 `aria-describedby` 关联
5. **文件上传**：使用 `FormData` + Server Action，避免 Base64 编码内存开销

---

## 参考资源

- [React Hook Form Documentation](https://react-hook-form.com/)
- [TanStack Form Documentation](https://tanstack.com/form/latest)
- [FormKit Documentation](https://formkit.com/)
- [Zod Documentation](https://zod.dev/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

## 关联文档

- `30-knowledge-base/30.2-categories/04-state-management.md`
- `20-code-lab/20.5-frontend-frameworks/forms/`
- `40-ecosystem/comparison-matrices/frontend-frameworks-compare.md`

---

*最后更新: 2026-04-29*
