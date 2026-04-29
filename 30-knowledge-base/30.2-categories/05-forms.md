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

## 代码示例：React Hook Form + Zod Resolver

```tsx
// react-hook-form-example.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3, '用户名至少 3 个字符'),
  email: z.string().email('请输入有效邮箱'),
  age: z.coerce.number().min(18, '必须年满 18 岁'),
  agreeTerms: z.boolean().refine((val) => val === true, '必须同意条款'),
});

type FormData = z.infer<typeof schema>;

export function RegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: FormData) => {
    await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="username">用户名</label>
        <input id="username" {...register('username')} aria-invalid={!!errors.username} />
        {errors.username && <span role="alert">{errors.username.message}</span>}
      </div>

      <div>
        <label htmlFor="email">邮箱</label>
        <input id="email" type="email" {...register('email')} aria-invalid={!!errors.email} />
        {errors.email && <span role="alert">{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="age">年龄</label>
        <input id="age" type="number" {...register('age')} aria-invalid={!!errors.age} />
        {errors.age && <span role="alert">{errors.age.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register('agreeTerms')} />
          同意服务条款
        </label>
        {errors.agreeTerms && <span role="alert">{errors.agreeTerms.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '注册'}
      </button>
    </form>
  );
}
```

## 代码示例：TanStack Form 框架无关用法

```tsx
// tanstack-form-example.tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

export function TanStackFormExample() {
  const form = useForm({
    defaultValues: { firstName: '', lastName: '' },
    validatorAdapter: zodValidator,
    onSubmit: async ({ value }) => {
      console.log('Submitted:', value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field
        name="firstName"
        validators={{
          onChange: z.string().min(2, '至少 2 个字符'),
        }}
        children={(field) => (
          <div>
            <label htmlFor={field.name}>名字</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 && (
              <em role="alert">{field.state.meta.errors.join(', ')}</em>
            )}
          </div>
        )}
      />

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <button type="submit" disabled={!canSubmit}>
            {isSubmitting ? '...' : '提交'}
          </button>
        )}
      />
    </form>
  );
}
```

## 代码示例：原生 FormData + Constraint Validation API

```typescript
// native-form-validation.ts — 零依赖渐进增强
export function enhanceForm(form: HTMLFormElement): () => void {
  const controller = new AbortController();

  form.addEventListener(
    'submit',
    async (e) => {
      e.preventDefault();

      // 使用原生 Constraint Validation API
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;

      try {
        submitter && (submitter.disabled = true);
        const res = await fetch(form.action, {
          method: form.method,
          body: formData,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        form.dispatchEvent(new CustomEvent('form-success', { detail: await res.json() }));
      } catch (err) {
        form.dispatchEvent(new CustomEvent('form-error', { detail: err }));
      } finally {
        submitter && (submitter.disabled = false);
      }
    },
    { signal: controller.signal }
  );

  return () => controller.abort();
}
```

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
- [HTML Spec — Form Submission](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#form-submission)
- [MDN — FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [MDN — Constraint Validation](https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation)
- [web.dev — Sign-in Form Best Practices](https://web.dev/articles/sign-in-form-best-practices)
- [WAI-ARIA — Form Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/forms/)
- [Conform — Type-safe Form Validation](https://conform.guide/)
- [Superforms — SvelteKit Forms](https://superforms.rocks/)
- [Modular Forms — Qwik/Solid/Preact](https://modularforms.dev/)

---

## 关联文档

- `30-knowledge-base/30.2-categories/04-state-management.md`
- `20-code-lab/20.5-frontend-frameworks/forms/`
- `40-ecosystem/comparison-matrices/frontend-frameworks-compare.md`

---

*最后更新: 2026-04-29*
