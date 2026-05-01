---
title: 表单处理库
description: JavaScript/TypeScript 表单处理完整指南，覆盖 TanStack Form、React Hook Form、验证库与服务器表单
---

## 🧪 关联代码实验室

> **1** 个关联模块 · 平均成熟度：**🌿**

| 模块 | 成熟度 | 实现文件 | 测试文件 |
|------|--------|----------|----------|
| [16-application-development](../../20-code-lab/20.5-frontend-frameworks/) | 🌿 | 1 | 1 |

---

# 表单处理（Form Handling）

> 本文档梳理 2025-2026 年 JavaScript/TypeScript 生态中表单处理与验证的主流方案。覆盖 React、Vue、Solid 等框架的表单库，验证库选型，以及 Next.js Server Actions 驱动的服务器表单模式。数据截至 2026 年 4 月。

---

## 📊 整体概览

| 库/框架 | 定位 | Stars | 周下载 | TS 支持 | 包大小 |
|---------|------|-------|--------|:-------:|--------|
| **TanStack Form v1** | 跨框架 Headless 表单 | 4,200+ | 18万+ | ✅ 原生 | ~8KB |
| **React Hook Form v7** | React 高性能表单 | 44,000+ | 450万+ | ✅ 原生 | ~9KB |
| **Formik** | React 经典表单（维护放缓） | 32,500+ | 80万+ | ✅ 官方 | ~15KB |
| **Zod** | Schema 验证（生态统治） | 36,000+ | 700万+ | ✅ 原生 | ~12KB |
| **Valibot** | 轻量验证库 | 7,500+ | 35万+ | ✅ 原生 | ~1KB |
| **Yup** | 老牌 Schema 验证 | 23,000+ | 120万+ | ✅ 官方 | ~15KB |
| **Joi** | Node.js 服务端验证 | 21,000+ | 200万+ | ✅ 官方 | ~50KB |

---

## 1. TanStack Form v1：跨框架 Headless 表单

### 1.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | TanStack Form |
| **版本** | v1.0（2025 年 1 月正式发布） |
| **Stars** | ⭐ 4,200+ |
| **周下载** | 18万+ |
| **TS 支持** | ✅ 原生 TypeScript |
| **GitHub** | [TanStack/form](https://github.com/TanStack/form) |
| **官网** | [tanstack.com/form](https://tanstack.com/form) |

**一句话描述**：由 TanStack 团队打造的跨框架 Headless 表单引擎，支持 React、Vue、Solid、Svelte 和 Angular，强调极致性能与框架无关的表单状态管理。

**v1 核心特性**：

- **跨框架统一 API**：`@tanstack/react-form`、`@tanstack/vue-form`、`@tanstack/solid-form` 共享核心逻辑
- **Headless 设计**：零 UI 依赖，完全控制表单渲染
- **粒度级响应式**：字段级订阅，避免无关重渲染
- **内置异步验证**：支持 debounce、abort controller 的异步校验
- **Form API 优先**：通过 `form.Field` render prop 模式精确控制每个字段

```tsx
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';

function ProfileForm() {
  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      age: 18,
    },
    validatorAdapter: zodValidator,
    validators: {
      onChange: z.object({
        username: z.string().min(3, '至少 3 个字符'),
        email: z.string().email('邮箱格式错误'),
        age: z.number().min(18, '必须年满 18 岁'),
      }),
    },
    onSubmit: async ({ value }) => {
      await fetch('/api/profile', { method: 'POST', body: JSON.stringify(value) });
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
        name="username"
        children={(field) => (
          <div>
            <input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && (
              <em>{field.state.meta.errors.join(', ')}</em>
            )}
          </div>
        )}
      />
      <button type="submit" disabled={form.state.isSubmitting}>
        {form.state.isSubmitting ? '提交中...' : '保存'}
      </button>
    </form>
  );
}
```

---

## 2. React Hook Form：v7+ 性能标杆

### 2.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | React Hook Form |
| **版本** | v7.55+（2025 年活跃迭代） |
| **Stars** | ⭐ 44,000+ |
| **周下载** | 450万+ |
| **TS 支持** | ✅ 原生 TypeScript |
| **GitHub** | [react-hook-form/react-hook-form](https://github.com/react-hook-form/react-hook-form) |
| **官网** | [react-hook-form.com](https://react-hook-form.com) |

**一句话描述**：React 生态中 Stars 最高、下载量最大的表单库，通过非受控组件与引用注册实现极致渲染性能。

**2025-2026 关键更新**：

- **v7.55+ 支持 React 19**：完全兼容 React 19 的 `use()` 和 Actions
- **Server Actions 原生集成**：`useForm` 新增 `action` 模式，无缝衔接 Next.js Server Actions
- **Form Provider 性能优化**：Context 粒度细化，大型表单渲染提升 30%
- **Resolver 生态扩展**：官方支持 Zod、Valibot、Yup、Joi、Superstruct、io-ts

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3, '用户名至少 3 个字符'),
  email: z.string().email('请输入有效邮箱'),
  tags: z.array(z.string()).min(1, '至少选择一个标签'),
});

type FormData = z.infer<typeof schema>;

function UserForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // 2025 推荐：直接对接 Server Action
  const onSubmit = handleSubmit(async (data) => {
    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...register('username')} placeholder="用户名" />
      {errors.username && <span>{errors.username.message}</span>}

      <input {...register('email')} placeholder="邮箱" />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        提交
      </button>
    </form>
  );
}
```

---

## 3. Formik：经典但已停滞？

### 3.1 维护状态分析

| 属性 | 详情 |
|------|------|
| **名称** | Formik |
| **Stars** | ⭐ 32,500+ |
| **最后更新** | v2.4.6（2024 年中），v3 计划未兑现 |
| **周下载** | 80万+（持续下降） |
| **GitHub** | [jaredpalmer/formik](https://github.com/jaredpalmer/formik) |

**一句话描述**：Formik 曾是 React 表单领域的开创者，但 2024-2025 年维护几乎停滞，v3 版本迟迟未发布，社区正在向 React Hook Form 和 TanStack Form 迁移。

**现状判断**：

> ⚠️ **Formik 并未"死亡"**，但已进入**维护模式**。对于新项目，**不推荐**使用 Formik；存量项目如无性能问题可继续使用，但建议逐步迁移。

**迁移路径**：

| 场景 | 迁移目标 |
|------|----------|
| 追求极简 API | React Hook Form |
| 需要跨框架复用 | TanStack Form |
| 重度依赖 Formik 生态 | 继续使用，关注社区 fork |

---

## 4. 验证库：Zod 统治与 Valibot 崛起

### 4.1 Zod：生态统治者

| 属性 | 详情 |
|------|------|
| **Stars** | ⭐ 36,000+ |
| **周下载** | 700万+ |
| **GitHub** | [colinhacks/zod](https://github.com/colinhacks/zod) |

**2025-2026 状态**：Zod 已成为 JS/TS 生态的**事实标准验证库**。从 tRPC 到 Prisma、从 React Hook Form 到 AI SDK，Zod Schema 无处不在。

```typescript
import { z } from 'zod';

// 复杂业务 Schema
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'editor', 'viewer']),
  profile: z.object({
    displayName: z.string().min(2).max(50),
    avatar: z.string().url().optional(),
  }),
  tags: z.array(z.string()).max(10),
  metadata: z.record(z.unknown()).default({}),
});

type User = z.infer<typeof UserSchema>;

// 安全解析（不抛异常）
const result = UserSchema.safeParse(unknownData);
if (!result.success) {
  console.log(result.error.issues); // 结构化错误列表
}
```

### 4.2 Valibot：轻量替代方案

| 属性 | 详情 |
|------|------|
| **Stars** | ⭐ 7,500+ |
| **周下载** | 35万+ |
| **GitHub** | [fabian-hiller/valibot](https://github.com/fabian-hiller/valibot) |

**一句话描述**：由 Angular 社区核心成员 Fabian Hiller 创建的验证库，以**模块化 tree-shakable API** 和**极小包体积**（~1KB）著称，是 Zod 在性能敏感场景下的最佳替代。

```typescript
import * as v from 'valibot';

// 仅导入需要的验证器（极致 tree-shaking）
const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
});

// 类型推导
type Login = v.InferOutput<typeof LoginSchema>;

// React Hook Form 集成
import { valibotResolver } from '@hookform/resolvers/valibot';
const { register } = useForm({ resolver: valibotResolver(LoginSchema) });
```

### 4.3 验证库对比

| 维度 | Zod | Valibot | Yup | Joi |
|------|-----|---------|-----|-----|
| **Stars** | 36k+ | 7.5k+ | 23k+ | 21k+ |
| **周下载** | 700万+ | 35万+ | 120万+ | 200万+ |
| **包大小** | ~12KB | ~1KB | ~15KB | ~50KB |
| **Tree-shaking** | ⚠️ 一般 | ✅ 极致 | ❌ 差 | ❌ 差 |
| **TS 类型推导** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **运行时性能** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| **生态兼容性** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **适用场景** | 通用首选 | 包体积敏感 | 存量项目 | Node.js 服务端 |

---

## 5. 服务器表单：Next.js Server Actions + Form

### 5.1 Server Actions 表单模式（2025 最佳实践）

Next.js 14+ 引入的 Server Actions 在 2025 年已成为 React 全栈表单处理的**推荐模式**，将验证、提交、错误处理全部放在服务端：

```tsx
// actions.ts
'use server';

import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10),
  published: z.boolean().default(false),
});

export async function createPost(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = CreatePostSchema.safeParse(raw);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  // 直接操作数据库（零 API 层）
  await db.insert(posts).values(parsed.data);
  revalidatePath('/posts');
  redirect('/posts');
}

// page.tsx
import { useActionState } from 'react';
import { createPost } from './actions';

export default function NewPostPage() {
  const [state, formAction, isPending] = useActionState(createPost, { errors: {} });

  return (
    <form action={formAction}>
      <input name="title" placeholder="标题" />
      {state.errors?.title && <p>{state.errors.title[0]}</p>}

      <textarea name="content" placeholder="内容" />
      {state.errors?.content && <p>{state.errors.content[0]}</p>}

      <button type="submit" disabled={isPending}>
        {isPending ? '发布中...' : '发布'}
      </button>
    </form>
  );
}
```

**Server Actions 表单优势**：

1. **零 API 路由**：无需编写 `/api/posts` 端点
2. **渐进增强**：无 JavaScript 时表单仍可提交
3. **自动 CSRF 防护**：Next.js 内置 CSRF 令牌验证
4. **类型安全端到端**：Zod Schema 同时约束客户端与服务端

---

## 6. 文件上传：Uploader 与 Dropzone

### 6.1 主流方案

| 库 | Stars | 定位 | 周下载 |
|----|-------|------|--------|
| **react-dropzone** | 11,000+ | React 拖拽上传 Hook | 180万+ |
| **uploadthing** | 4,500+ | 类型安全文件上传服务 | 15万+ |
| **Uppy** | 28,000+ | 全能上传库（多源、断点续传） | 40万+ |

### 6.2 Uploadthing：全栈类型安全上传

```tsx
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadButton } from '@uploadthing/react';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB', maxFileCount: 4 } })
    .middleware(async () => {
      const user = await auth();
      if (!user) throw new Error('Unauthorized');
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db.insert(images).values({ url: file.url, userId: metadata.userId });
    }),
} satisfies FileRouter;

// 前端组件
<UploadButton
  endpoint="imageUploader"
  onClientUploadComplete={(res) => alert('上传完成')}
/>
```

---

## 7. 选型决策矩阵

| 场景 | 推荐方案 |
|------|----------|
| React 新项目（性能优先） | **React Hook Form + Zod** |
| 跨框架复用（React/Vue/Solid） | **TanStack Form + Zod/Valibot** |
| Next.js App Router 全栈 | **Server Actions + Zod + useActionState** |
| 包体积极度敏感 | **TanStack Form + Valibot** |
| 复杂多步骤向导表单 | **React Hook Form**（useFieldArray + 条件逻辑） |
| 文件上传 + 存储 | **Uploadthing**（Next.js）或 **Uppy**（通用） |
| 存量 Formik 项目 | 逐步迁移至 **React Hook Form** |

---

> 📅 本文档最后更新：2026 年 4 月
>
> 💡 **提示**：2025-2026 年表单处理领域呈现"验证库 Zod 一统天下、表单库双雄并立"的格局。React Hook Form 仍是 React 生态最稳妥的选择，而 TanStack Form 凭借跨框架能力迅速崛起。Next.js Server Actions 正在重新定义全栈表单的开发范式，建议新项目中优先考虑。
