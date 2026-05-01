---
title: Svelte 生态工具链
description: 'shadcn-svelte、Skeleton UI、Superforms、Lucia Auth、Prisma/Drizzle 集成等 Svelte 5 生态核心工具'
---

# Svelte 生态工具链

> 最后更新: 2026-05-01 | 覆盖: UI 库、表单、认证、ORM、AI 工具、动画、图表、状态管理

---

## UI 组件库

### shadcn-svelte

shadcn-svelte 是移植自 shadcn/ui 的拷贝式组件库，专为 Svelte 5 和 Tailwind CSS 设计。

#### 初始化项目

```bash
npx shadcn-svelte@latest init
```

初始化过程会交互式询问：

1. **样式基础**：Tailwind CSS v3 或 v4
2. **基础颜色**：slate、zinc、neutral、stone、gray 等
3. **CSS 变量模式** 或 **Tailwind 工具类模式**

初始化完成后会在项目根目录生成 `components.json` 配置文件：

```json
{
  "$schema": "https://next.shadcn-svelte.com/schema.json",
  "style": "default",
  "tailwind": {
    "config": "tailwind.config.js",
    "css": "src/app.css",
    "baseColor": "slate"
  },
  "aliases": {
    "components": "$lib/components",
    "utils": "$lib/utils"
  }
}
```

#### 添加组件

```bash
# 添加单个组件
npx shadcn-svelte@latest add button

# 添加多个组件
npx shadcn-svelte@latest add dialog dropdown-menu form table

# 添加全部可用组件
npx shadcn-svelte@latest add -a
```

组件会被复制到 `src/lib/components/ui/` 目录下，可直接修改源码。

#### 主题定制

shadcn-svelte 使用 CSS 变量进行主题定制。修改 `src/app.css`：

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

#### 修改组件源码

由于组件直接复制到 `$lib/components/ui/`，可以 100% 自由修改：

```svelte
<!-- $lib/components/ui/button/button.svelte -->
<script>
  import { Button as ButtonPrimitive } from 'bits-ui';
  import { cn } from '$lib/utils.js';

  let {
    class: className,
    variant = 'default',
    size = 'default',
    children,
    ...props
  } = $props();
</script>

<ButtonPrimitive.Root
  class={cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
    'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
    variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
    size === 'default' && 'h-10 px-4 py-2',
    size === 'sm' && 'h-9 rounded-md px-3',
    size === 'lg' && 'h-11 rounded-md px-8',
    size === 'icon' && 'h-10 w-10',
    className
  )}
  {...props}
>
  {@render children?.()}
</ButtonPrimitive.Root>
```

```svelte
<!-- 使用示例 -->
<script>
  import { Button } from '$lib/components/ui/button';
</script>

<Button variant="outline" onclick={() => console.log('clicked')}>
  Click me
</Button>
```

| 特性 | 说明 |
|------|------|
| **拷贝安装** | 组件代码直接复制到项目，无额外运行时依赖 |
| **Tailwind** | 基于 Tailwind CSS，支持 v3 和 v4 |
| **Svelte 5** | 原生 Runes 支持，`$props`、`$derived` 等 |
| **TypeScript** | 完整类型支持，无需额外类型声明 |
| **可定制** | 100% 可修改源码，无封装限制 |
| **无障碍** | 基于 Bits UI，遵循 WAI-ARIA 规范 |

> 数据来源: shadcn-svelte 官方文档 2026-05 | GitHub: huntabyte/shadcn-svelte

### Skeleton UI

Skeleton 是专为 Svelte 设计的 UI 工具包，提供完整的主题系统和预设组件，与 Tailwind CSS 深度集成。

#### 安装与配置

```bash
npm install @skeletonlabs/skeleton @skeletonlabs/tw-plugin
```

```js
// tailwind.config.js
import { skeleton } from '@skeletonlabs/tw-plugin';

export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@skeletonlabs/skeleton/**/*.svelte'
  ],
  theme: { extend: {} },
  plugins: [
    skeleton({
      themes: { preset: ['skeleton', 'modern', 'crimson'] }
    })
  ]
};
```

```ts
// src/app.html 或布局文件
<body data-theme="skeleton">
```

#### 主题系统详解

Skeleton 主题由四个核心层构成：

1. **Design Tokens**: 颜色、间距、字体、圆角等基础设计变量
2. **Theme Variants**: 内置预设主题（skeleton、modern、crimson、hamlindigo、gold-nouveau、rocket 等）
3. **Custom Themes**: 通过 [Theme Generator](https://themes.skeleton.dev/) 可视化创建
4. **CSS Custom Properties**: 运行时通过 JavaScript 动态切换主题

```css
/* 自定义主题变量 - 推荐在 app.css 中覆盖 */
:root {
  --theme-font-family-base: 'Inter', system-ui, sans-serif;
  --theme-font-family-heading: 'Inter', system-ui, sans-serif;
  --theme-rounded-base: 4px;
  --theme-rounded-container: 8px;
}

/* 完整自定义主题 */
[data-theme='my-theme'] {
  --color-primary-50: #f0f9ff;
  --color-primary-100: #e0f2fe;
  --color-primary-200: #bae6fd;
  --color-primary-500: #0ea5e9;
  --color-primary-900: #0c4a6e;
  --color-surface-50: #ffffff;
  --color-surface-100: #f8fafc;
  --color-surface-900: #0f172a;
}
```

#### 动态主题切换

```svelte
<script>
  import { storeTheme } from '@skeletonlabs/skeleton';

  function setTheme(theme) {
    storeTheme.set(theme);
    document.body.setAttribute('data-theme', theme);
  }
</script>

<select onchange={(e) => setTheme(e.target.value)} class="select">
  <option value="skeleton">Skeleton（默认）</option>
  <option value="modern">Modern</option>
  <option value="crimson">Crimson</option>
  <option value="hamlindigo">Hamlindigo</option>
</select>
```

#### 预设组件使用

```svelte
<script>
  import { AppShell, AppBar, LightSwitch, ProgressBar } from '@skeletonlabs/skeleton';
</script>

<AppShell>
  <svelte:fragment slot="header">
    <AppBar>
      <svelte:fragment slot="lead">
        <strong class="text-xl">My App</strong>
      </svelte:fragment>
      <svelte:fragment slot="trail">
        <LightSwitch />
      </svelte:fragment>
    </AppBar>
  </svelte:fragment>

  <div class="container mx-auto p-4 space-y-4">
    <ProgressBar value={50} max={100} />

    <div class="card p-4">
      <h3 class="h3">卡片标题</h3>
      <p class="text-surface-600-300-token">卡片内容区域，自动适配主题。</p>
    </div>
  </div>
</AppShell>
```

| 特性 | 说明 |
|------|------|
| **Tailwind 插件** | 以 Tailwind 插件形式提供，零组件运行时 |
| **预设主题** | 6+ 内置主题，支持一键切换 |
| **主题生成器** | 在线可视化生成自定义主题 |
| **Svelte 原生** | 专为 Svelte 设计，支持 Runes |
| **暗色模式** | 内置 LightSwitch 组件和自动适配 |

> 数据来源: Skeleton UI 官方文档 2026-05 | GitHub: skeletonlabs/skeleton

### Melt UI

Melt UI 是无头 UI 原语库，提供完整的可访问性支持，完全不绑定样式。它是 Bits UI 和 shadcn-svelte 的底层基础。

#### createDialog 完整示例

```svelte
<script>
  import { createDialog, melt } from '@melt-ui/svelte';
  import { fade, fly } from 'svelte/transition';
  import { X } from 'lucide-svelte';

  const {
    elements: { trigger, portalled, overlay, content, title, description, close },
    states: { open }
  } = createDialog({
    forceVisible: true,
    defaultOpen: false
  });
</script>

<button
  use:melt={$trigger}
  class="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors"
>
  打开对话框
</button>

{#if $open}
  <div use:melt={$portalled}>
    <div
      use:melt={$overlay}
      class="fixed inset-0 z-50 bg-black/50"
      transition:fade={{ duration: 150 }}
    />
    <div
      use:melt={$content}
      class="fixed left-1/2 top-1/2 z-50 max-w-md w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl"
      transition:fly={{ y: -20, duration: 200 }}
    >
      <div class="flex items-center justify-between mb-4">
        <h2 use:melt={$title} class="text-lg font-bold">确认操作</h2>
        <button
          use:melt={$close}
          class="rounded p-1 hover:bg-gray-100"
          aria-label="关闭"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <p use:melt={$description} class="text-gray-600 mb-6">
        此操作不可撤销，请确认是否继续删除？删除后数据将无法恢复。
      </p>
      <div class="flex justify-end gap-3">
        <button
          use:melt={$close}
          class="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          use:melt={$close}
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          onclick={() => handleDelete()}
        >
          确认删除
        </button>
      </div>
    </div>
  </div>
{/if}
```

#### createSelect 完整示例

```svelte
<script>
  import { createSelect, melt } from '@melt-ui/svelte';
  import { fly } from 'svelte/transition';
  import { ChevronDown, Check } from 'lucide-svelte';

  const {
    elements: { trigger, menu, option, label, group, groupLabel },
    states: { value, open, selectedLabel },
    helpers: { isSelected }
  } = createSelect({
    forceVisible: true,
    positioning: {
      placement: 'bottom',
      fitViewport: true,
      sameWidth: true
    }
  });

  const fruits = [
    { value: 'apple', label: '苹果' },
    { value: 'banana', label: '香蕉' },
    { value: 'orange', label: '橙子' },
    { value: 'grape', label: '葡萄' }
  ];
</script>

<div class="w-72">
  <label use:melt={$label} class="block text-sm font-medium text-gray-700 mb-1">
    选择水果
  </label>
  <button
    use:melt={$trigger}
    class="w-full flex items-center justify-between rounded-md border border-gray-300 px-3 py-2 bg-white shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="选择水果"
  >
    <span>{$selectedLabel ?? '请选择...'}</span>
    <ChevronDown class="w-4 h-4 text-gray-500" />
  </button>

  {#if $open}
    <div
      use:melt={$menu}
      class="z-50 mt-1 max-h-60 overflow-auto rounded-md border border-gray-200 bg-white shadow-lg"
      transition:fly={{ y: -5, duration: 150 }}
    >
      {#each fruits as item}
        <div
          use:melt={$option({ value: item.value, label: item.label })}
          class="relative cursor-pointer select-none px-3 py-2 text-gray-900 hover:bg-blue-50 data-[selected]:bg-blue-100 data-[highlighted]:bg-blue-50"
        >
          {#if $isSelected(item.value)}
            <span class="absolute left-2 top-1/2 -translate-y-1/2">
              <Check class="w-4 h-4 text-blue-600" />
            </span>
          {/if}
          <span class="pl-7">{item.label}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
```

#### 其他核心原语一览

| 原语 | 用途 | ARIA 支持 | 复杂度 |
|------|------|-----------|--------|
| `createAccordion` | 手风琴面板 | `aria-expanded`, `aria-controls` | 低 |
| `createTabs` | 标签页切换 | `aria-selected`, `role="tab"` | 低 |
| `createTooltip` | 工具提示 | `role="tooltip"`, `aria-describedby` | 低 |
| `createPopover` | 弹出浮层 | `aria-haspopup`, `aria-expanded` | 中 |
| `createSlider` | 范围滑块 | `aria-valuemin`, `aria-valuemax`, `aria-valuenow` | 中 |
| `createCollapsible` | 可折叠内容 | `aria-expanded` | 低 |
| `createPagination` | 分页导航 | `aria-label`, `aria-current` | 中 |
| `createDatePicker` | 日期选择器 | 完整日历键盘导航 | 高 |
| `createContextMenu` | 右键菜单 | 完整菜单键盘导航 | 高 |
| `createMenubar` | 菜单栏 | 完整菜单栏键盘导航 | 高 |

> 数据来源: Melt UI 官方文档 2026-05 | GitHub: melt-ui/melt-ui

---

## 表单处理

### Superforms 基础

```bash
npm install sveltekit-superforms zod
```

```ts
// +page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).max(120)
});

export const load = async () => {
  const form = await superValidate(zod(schema));
  return { form };
};

export const actions = {
  default: async ({ request }) => {
    const form = await superValidate(request, zod(schema));
    if (!form.valid) return fail(400, { form });

    await saveUser(form.data);
    return { form };
  }
};
```

```svelte
<!-- +page.svelte -->
<script>
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();
  const { form, errors, enhance } = superForm(data.form);
</script>

<form method="POST" use:enhance>
  <input name="name" bind:value={$form.name} />
  {#if $errors.name}<span>{$errors.name}</span>{/if}

  <input name="email" type="email" bind:value={$form.email} />
  {#if $errors.email}<span>{$errors.email}</span>{/if}

  <button type="submit">Submit</button>
</form>
```

### Superforms 高级用法

#### 嵌套表单与对象验证

```ts
// src/lib/schemas.ts
import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(5, '街道地址至少5个字符'),
  city: z.string().min(2, '城市名称至少2个字符'),
  zip: z.string().regex(/^\d{6}$/, '邮编必须是6位数字'),
  country: z.string().default('CN')
});

export const userSchema = z.object({
  name: z.string().min(2, '姓名至少2个字符'),
  email: z.string().email('请输入有效的邮箱地址'),
  age: z.number().min(18, '必须年满18岁').max(120, '年龄超出合理范围'),
  address: addressSchema,
  tags: z.array(z.string()).max(5, '最多5个标签').default([])
});
```

```svelte
<!-- +page.svelte -->
<script>
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();
  const { form, errors, enhance, delayed } = superForm(data.form, {
    delayMs: 500,
    timeoutMs: 8000
  });
</script>

<form method="POST" use:enhance class="space-y-4 max-w-lg">
  <div>
    <label class="block text-sm font-medium">姓名</label>
    <input name="name" bind:value={$form.name} class="input" />
    {#if $errors.name}<p class="text-red-500 text-sm">{$errors.name}</p>{/if}
  </div>

  <div>
    <label class="block text-sm font-medium">邮箱</label>
    <input name="email" type="email" bind:value={$form.email} class="input" />
    {#if $errors.email}<p class="text-red-500 text-sm">{$errors.email}</p>{/if}
  </div>

  <fieldset class="border rounded p-4 space-y-3">
    <legend class="text-sm font-medium px-2">地址信息</legend>

    <div>
      <label class="block text-sm">街道</label>
      <input name="address.street" bind:value={$form.address.street} class="input" />
      {#if $errors.address?.street}
        <p class="text-red-500 text-sm">{$errors.address.street}</p>
      {/if}
    </div>

    <div class="grid grid-cols-2 gap-3">
      <div>
        <label class="block text-sm">城市</label>
        <input name="address.city" bind:value={$form.address.city} class="input" />
        {#if $errors.address?.city}
          <p class="text-red-500 text-sm">{$errors.address.city}</p>
        {/if}
      </div>
      <div>
        <label class="block text-sm">邮编</label>
        <input name="address.zip" bind:value={$form.address.zip} class="input" />
        {#if $errors.address?.zip}
          <p class="text-red-500 text-sm">{$errors.address.zip}</p>
        {/if}
      </div>
    </div>
  </fieldset>

  <button type="submit" class="btn-primary" disabled={$delayed}>
    {#if $delayed}提交中...{:else}提交{/if}
  </button>
</form>
```

#### 文件上传与验证

```ts
// +page.server.ts
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { z } from 'zod';
import { fail } from '@sveltejs/kit';
import { writeFile } from 'fs/promises';
import { extname } from 'path';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const schema = z.object({
  avatar: z
    .instanceof(File, { message: '请上传头像文件' })
    .refine((f) => f.size > 0, '文件不能为空')
    .refine((f) => f.size < MAX_FILE_SIZE, '文件必须小于 2MB')
    .refine(
      (f) => ACCEPTED_TYPES.includes(f.type),
      '仅支持 JPG、PNG、WebP 格式'
    )
});

export const actions = {
  default: async ({ request }) => {
    const formData = await request.formData();
    const form = await superValidate(formData, zod(schema));

    if (!form.valid) return fail(400, { form });

    const file = formData.get('avatar') as File;
    const ext = extname(file.name);
    const filename = `avatar-${Date.now()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(`./uploads/${filename}`, buffer);

    return { form, filename };
  }
};
```

```svelte
<!-- +page.svelte -->
<script>
  import { superForm } from 'sveltekit-superforms';

  let { data } = $props();
  const { form, errors, enhance, message } = superForm(data.form);

  let preview = $state('');

  function handleFileChange(e) {
    const file = e.target.files[0];
    $form.avatar = file;

    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => (preview = reader.result);
      reader.readAsDataURL(file);
    }
  }
</script>

<form method="POST" use:enhance enctype="multipart/form-data" class="space-y-4">
  {#if preview}
    <img src={preview} alt="预览" class="w-32 h-32 rounded-full object-cover" />
  {/if}

  <div>
    <input
      type="file"
      name="avatar"
      accept="image/jpeg,image/png,image/webp"
      onchange={handleFileChange}
      class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
    />
    {#if $errors.avatar}<p class="text-red-500 text-sm mt-1">{$errors.avatar}</p>{/if}
  </div>

  <button type="submit" class="btn-primary">上传头像</button>

  {#if $message}
    <p class="text-green-600">{$message}</p>
  {/if}
</form>
```

#### 多步骤表单

```svelte
<!-- MultiStepForm.svelte -->
<script>
  import { superForm } from 'sveltekit-superforms';
  import { zod } from 'sveltekit-superforms/adapters';
  import { z } from 'zod';

  let { data } = $props();

  const schemas = [
    z.object({ name: z.string().min(2, '姓名至少2个字符') }),
    z.object({ email: z.string().email('请输入有效邮箱') }),
    z.object({ age: z.coerce.number().min(18, '必须年满18岁') })
  ];

  let currentStep = $state(0);

  const { form, errors, validate, enhance, constraints } = superForm(data.form, {
    validators: zod(schemas[currentStep]),
    validationMethod: 'oninput'
  });

  async function nextStep() {
    const result = await validate();
    if (result.valid) currentStep++;
  }

  function prevStep() {
    currentStep--;
  }
</script>

<form method="POST" use:enhance class="max-w-md mx-auto space-y-6">
  <div class="flex items-center justify-between mb-6">
    {#each schemas as _, i}
      <div class="flex items-center">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
          class:bg-blue-600={i <= currentStep}
          class:text-white={i <= currentStep}
          class:bg-gray-200={i > currentStep}
        >
          {i + 1}
        </div>
        {#if i < schemas.length - 1}
          <div class="w-12 h-1 mx-2" class:bg-blue-600={i < currentStep} class:bg-gray-200={i >= currentStep}></div>
        {/if}
      </div>
    {/each}
  </div>

  {#if currentStep === 0}
    <div>
      <label class="block text-sm font-medium mb-1">姓名</label>
      <input name="name" bind:value={$form.name} class="input w-full" {...$constraints.name} />
      {#if $errors.name}<p class="text-red-500 text-sm mt-1">{$errors.name}</p>{/if}
    </div>
  {:else if currentStep === 1}
    <div>
      <label class="block text-sm font-medium mb-1">邮箱</label>
      <input name="email" type="email" bind:value={$form.email} class="input w-full" />
      {#if $errors.email}<p class="text-red-500 text-sm mt-1">{$errors.email}</p>{/if}
    </div>
  {:else if currentStep === 2}
    <div>
      <label class="block text-sm font-medium mb-1">年龄</label>
      <input name="age" type="number" bind:value={$form.age} class="input w-full" />
      {#if $errors.age}<p class="text-red-500 text-sm mt-1">{$errors.age}</p>{/if}
    </div>
  {/if}

  <div class="flex justify-between pt-4">
    {#if currentStep > 0}
      <button type="button" onclick={prevStep} class="px-4 py-2 border rounded-md hover:bg-gray-50">
        上一步
      </button>
    {:else}
      <div></div>
    {/if}

    {#if currentStep < schemas.length - 1}
      <button type="button" onclick={nextStep} class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
        下一步
      </button>
    {:else}
      <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
        提交
      </button>
    {/if}
  </div>
</form>
```

> 数据来源: Superforms 官方文档 2026-05 | GitHub: ciscoheat/sveltekit-superforms

---

## 认证

### Lucia Auth

#### 基础配置

```bash
npm install lucia @lucia-auth/adapter-sqlite
```

```ts
// src/lib/auth.ts
import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from './db';
import { sessions, users } from './schema';

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.username,
      email: attributes.email,
      avatar: attributes.avatar
    };
  }
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      username: string;
      email: string;
      avatar: string | null;
    };
  }
}
```

#### OAuth 完整配置（GitHub + Google）

```bash
npm install arctic
```

```ts
// src/lib/auth.ts
import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { GitHub, Google } from 'arctic';
import { db } from './db';
import { sessions, users } from './schema';

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production'
    }
  },
  getUserAttributes: (attributes) => {
    return {
      githubId: attributes.github_id,
      googleId: attributes.google_id,
      username: attributes.username,
      email: attributes.email,
      avatar: attributes.avatar
    };
  }
});

// GitHub OAuth 应用配置
export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_CLIENT_SECRET!
);

// Google OAuth 应用配置
export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_SECRET!,
  'http://localhost:5173/login/google/callback'
);

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      github_id: number | null;
      google_id: string | null;
      username: string;
      email: string;
      avatar: string | null;
    };
  }
}
```

```ts
// src/routes/login/github/+server.ts
import { generateState } from 'arctic';
import { github } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
  const state = generateState();
  const url = github.createAuthorizationURL(state, 'read:user');

  cookies.set('github_oauth_state', state, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10, // 10 分钟
    secure: process.env.NODE_ENV === 'production'
  });

  redirect(302, url.toString());
};
```

```ts
// src/routes/login/github/callback/+server.ts
import { github, lucia } from '$lib/auth';
import { OAuth2RequestError } from 'arctic';
import { db } from '$lib/db';
import { users } from '$lib/schema';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';

export const GET = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('github_oauth_state');

  if (!code || !state || state !== storedState) {
    return new Response(null, { status: 400 });
  }

  try {
    const tokens = await github.validateAuthorizationCode(code);
    const response = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokens.accessToken}` }
    });
    const githubUser = await response.json();

    // 检查是否已存在该 GitHub 用户
    const existingUser = await db.query.users.findFirst({
      where: eq(users.githubId, githubUser.id)
    });

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {});
      const sessionCookie = lucia.createSessionCookie(session.id);
      cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      redirect(302, '/');
    }

    // 创建新用户
    const userId = generateId(15);
    await db.insert(users).values({
      id: userId,
      githubId: githubUser.id,
      username: githubUser.login,
      email: githubUser.email ?? `${githubUser.login}@github.com`,
      avatar: githubUser.avatar_url
    });

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    redirect(302, '/');
  } catch (e) {
    if (e instanceof OAuth2RequestError) {
      return new Response(null, { status: 400 });
    }
    throw e;
  }
};
```

```ts
// src/routes/login/google/+server.ts
import { generateCodeVerifier, generateState } from 'arctic';
import { google } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

export const GET = async ({ cookies }) => {
  const state = generateState();
  const codeVerifier = generateCodeVerifier();
  const url = google.createAuthorizationURL(state, codeVerifier, 'openid email profile');

  cookies.set('google_oauth_state', state, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10,
    secure: process.env.NODE_ENV === 'production'
  });

  cookies.set('google_code_verifier', codeVerifier, {
    path: '/',
    httpOnly: true,
    maxAge: 60 * 10,
    secure: process.env.NODE_ENV === 'production'
  });

  redirect(302, url.toString());
};
```

#### 登出

```ts
// src/routes/logout/+server.ts
import { lucia } from '$lib/auth';
import { fail, redirect } from '@sveltejs/kit';

export const POST = async ({ locals, cookies }) => {
  if (!locals.session) return fail(401);

  await lucia.invalidateSession(locals.session.id);
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

  redirect(302, '/login');
};
```

```svelte
<!-- 登出按钮 -->
<form method="POST" action="/logout">
  <button type="submit" class="btn">退出登录</button>
</form>
```

> ⚠️ **维护状态提示**: Lucia Auth 作者已宣布逐步停止维护（2024-11），建议新项目评估 Auth.js 或等待社区分叉。现有项目仍可正常使用。
>
> 数据来源: Lucia Auth 官方文档、GitHub 公告 2026-05 | GitHub: lucia-auth/lucia

### Auth.js (NextAuth)

```bash
npm install @auth/sveltekit
```

```ts
// src/auth.ts
import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/sveltekit/providers/github';
import Google from '@auth/sveltekit/providers/google';

export const { handle, signIn, signOut } = SvelteKitAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET
    })
  ],
  callbacks: {
    session({ session, token }) {
      session.user.id = token.sub;
      return session;
    }
  }
});
```

```ts
// src/hooks.server.ts
import { handle as authHandle } from './auth';
import { sequence } from '@sveltejs/kit/hooks';

export const handle = sequence(authHandle, async ({ event, resolve }) => {
  return resolve(event);
});
```

> 数据来源: Auth.js 官方文档 2026-05 | GitHub: nextauthjs/next-auth

---

## ORM 集成

### Drizzle ORM + SvelteKit 深度集成

#### 安装

```bash
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit
```

```ts
// src/lib/db.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });
```

#### 基础 Schema（保留）

```ts
// src/lib/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique()
});
```

#### Relations 关系定义

```ts
// src/lib/schema.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  avatar: text('avatar'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  slug: text('slug').notNull().unique(),
  authorId: integer('author_id').notNull().references(() => users.id),
  published: integer('published', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const comments = sqliteTable('comments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  content: text('content').notNull(),
  postId: integer('post_id').notNull().references(() => posts.id),
  authorId: integer('author_id').notNull().references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments)
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
  comments: many(comments)
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, { fields: [comments.authorId], references: [users.id] }),
  post: one(posts, { fields: [comments.postId], references: [posts.id] })
}));
```

#### 关系查询

```ts
// +page.server.ts
import { db } from '$lib/db';

export const load = async () => {
  // 查询所有用户及其已发布的文章，每篇文章包含评论和评论作者
  const usersWithPosts = await db.query.users.findMany({
    with: {
      posts: {
        where: (posts, { eq }) => eq(posts.published, true),
        with: {
          comments: {
            with: { author: true },
            orderBy: (comments, { desc }) => [desc(comments.createdAt)]
          }
        },
        orderBy: (posts, { desc }) => [desc(posts.createdAt)]
      }
    }
  });

  return { users: usersWithPosts };
};
```

#### Migrations 迁移

```ts
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/schema.ts',
  out: './drizzle/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: './sqlite.db'
  }
});
```

```bash
# 生成迁移文件
npx drizzle-kit generate

# 执行迁移
npx drizzle-kit migrate

# 查看数据库（可视化 GUI）
npx drizzle-kit studio

# 检查迁移状态
npx drizzle-kit check
```

#### Seed 数据填充

```ts
// src/lib/seed.ts
import { db } from './db';
import { users, posts } from './schema';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 开始填充种子数据...');

  // 清空现有数据（注意顺序避免外键约束错误）
  await db.run(sql`DELETE FROM comments`);
  await db.run(sql`DELETE FROM posts`);
  await db.run(sql`DELETE FROM users`);

  const [alice, bob, charlie] = await db.insert(users).values([
    { name: 'Alice', email: 'alice@example.com', avatar: 'https://i.pravatar.cc/150?u=alice' },
    { name: 'Bob', email: 'bob@example.com', avatar: 'https://i.pravatar.cc/150?u=bob' },
    { name: 'Charlie', email: 'charlie@example.com', avatar: 'https://i.pravatar.cc/150?u=charlie' }
  ]).returning();

  await db.insert(posts).values([
    { title: 'Hello World', content: '这是我的第一篇博客文章', slug: 'hello-world', authorId: alice.id, published: true },
    { title: 'Svelte 5 Runes 入门', content: 'Runes 带来了全新的响应式编程体验', slug: 'svelte-5-runes', authorId: bob.id, published: true },
    { title: 'Drizzle ORM 最佳实践', content: '类型安全的 SQL 查询构建器', slug: 'drizzle-orm-guide', authorId: alice.id, published: true },
    { title: '草稿文章', content: '这是一篇尚未发布的草稿', slug: 'draft-post', authorId: charlie.id, published: false }
  ]);

  console.log('✅ 种子数据填充完成');
}

seed().catch(console.error);
```

```json
// package.json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx src/lib/seed.ts",
    "db:setup": "npm run db:generate && npm run db:migrate && npm run db:seed"
  }
}
```

> 数据来源: Drizzle ORM 官方文档 2026-05 | GitHub: drizzle-team/drizzle-orm

### Prisma + SvelteKit

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String
  avatar    String?
  createdAt DateTime @default(now())
  posts     Post[]
  comments  Comment[]
}

model Post {
  id        Int       @id @default(autoincrement())
  title     String
  content   String
  slug      String    @unique
  published Boolean   @default(false)
  createdAt DateTime  @default(now())
  authorId  Int
  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
}

model Comment {
  id        Int      @id @default(autoincrement())
  content   String
  createdAt DateTime @default(now())
  postId    Int
  post      Post     @relation(fields: [postId], references: [id])
  authorId  Int
  author    User     @relation(fields: [authorId], references: [id])
}
```

```ts
// src/lib/db.ts
import { PrismaClient } from '@prisma/client';

const prisma = globalThis.__prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.__prisma = prisma;

export { prisma };
```

```ts
// +page.server.ts
import { prisma } from '$lib/db';

export const load = async () => {
  const users = await prisma.user.findMany({
    include: {
      posts: {
        where: { published: true },
        include: {
          comments: { include: { author: true } }
        }
      }
    }
  });
  return { users };
};
```

```bash
# Prisma 常用命令
npx prisma generate      # 生成 Client
npx prisma db push       # 原型阶段快速同步
npx prisma migrate dev   # 开发环境迁移
npx prisma studio        # 可视化数据库管理
npx prisma db seed       # 执行种子脚本
```

### Prisma vs Drizzle 对比

| 维度 | Prisma | Drizzle ORM |
|------|--------|-------------|
| **开发体验** | Schema 先行，CLI 功能全面 | 代码即 Schema，TypeScript 原生 |
| **类型安全** | 自动生成 Client，类型完整 | 极致类型推断，无需生成步骤 |
| **查询语法** | 链式 API，高度抽象 | SQL-like，支持原始 SQL |
| **迁移工具** | Prisma Migrate，成熟稳定 | Drizzle Kit，轻量快速 |
| **性能** | 运行时开销略高 | 接近手写 SQL |
| **生态** | 生态成熟，社区大，文档丰富 | 快速增长，Svelte 社区偏好明显 |
| **学习曲线** | 中等，需理解 Schema 语法 | 低，会 SQL 就能上手 |
| **Bundle 体积** | 较大（约 300KB+） | 极小（tree-shakeable） |
| **最佳场景** | 快速原型、复杂关系、团队协作 | 性能敏感、SQL 控制需求高、边缘部署 |
| **SvelteKit 适配** | 良好，但需处理单例 | 极佳，与 SvelteKit 深度集成示例多 |

**选型建议**：

- **新手或快速原型** → Prisma（Schema 直观，Studio 强大，文档丰富）
- **性能敏感或喜欢 SQL** → Drizzle（零运行时开销，SQL 透明）
- **SvelteKit 官方/社区示例** → Drizzle（SvelteKit 文档和教程多使用 Drizzle）
- **边缘计算/Worker 部署** → Drizzle（Bundle 体积极小，适合 Cloudflare Workers）

> 数据来源: Prisma 官方文档、Drizzle ORM 官方文档 2026-05

---

## 动画

### Motion One

```bash
npm install motion
```

Motion One 是基于 Web Animations API 的高性能动画库，Bundle 体积极小。

```svelte
<script>
  import { animate, stagger, spring } from 'motion';
  import { onMount } from 'svelte';

  let container;

  onMount(() => {
    animate(
      container.children,
      { y: [30, 0], opacity: [0, 1], scale: [0.9, 1] },
      { delay: stagger(0.08), duration: 0.5, easing: spring() }
    );
  });
</script>

<div bind:this={container} class="space-y-2">
  {#each ['任务一', '任务二', '任务三', '任务四'] as task}
    <div class="p-4 bg-blue-50 rounded-lg border">{task}</div>
  {/each}
</div>
```

### GSAP + Svelte

```bash
npm install gsap
```

GSAP 是业界功能最全面的动画库，适合复杂时间轴动画。

```svelte
<script>
  import { gsap } from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import { onMount } from 'svelte';

  gsap.registerPlugin(ScrollTrigger);

  let section;

  onMount(() => {
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.animate-item'), {
        scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' },
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out'
      });
    }, section);

    return () => ctx.revert();
  });
</script>

<section bind:this={section} class="py-20 px-4">
  <h1 class="animate-item text-4xl font-bold mb-6">滚动触发动画</h1>
  <p class="animate-item text-lg text-gray-600 mb-4">内容段落 1</p>
  <p class="animate-item text-lg text-gray-600 mb-4">内容段落 2</p>
  <p class="animate-item text-lg text-gray-600">内容段落 3</p>
</section>
```

### Svelte 内置 Transitions / Animate

Svelte 内置了声明式过渡系统，零依赖、性能优异。

```svelte
<script>
  import { fade, fly, slide, scale, blur } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import { quintOut, elasticOut } from 'svelte/easing';

  let items = $state([
    { id: 1, text: '第一项' },
    { id: 2, text: '第二项' },
    { id: 3, text: '第三项' }
  ]);
  let newItem = $state('');

  function addItem() {
    if (!newItem.trim()) return;
    items = [...items, { id: Date.now(), text: newItem }];
    newItem = '';
  }

  function removeItem(id) {
    items = items.filter((i) => i.id !== id);
  }

  function shuffle() {
    items = items.sort(() => Math.random() - 0.5);
  }
</script>

<div class="max-w-md mx-auto p-4 space-y-4">
  <div class="flex gap-2">
    <input bind:value={newItem} placeholder="新项目" class="flex-1 input" onkeydown={(e) => e.key === 'Enter' && addItem()} />
    <button onclick={addItem} class="px-4 py-2 bg-blue-600 text-white rounded">添加</button>
    <button onclick={shuffle} class="px-4 py-2 border rounded">打乱</button>
  </div>

  {#each items as item (item.id)}
    <div
      animate:flip={{ duration: 300, easing: quintOut }}
      in:fly={{ y: 20, duration: 300, easing: elasticOut }}
      out:slide={{ duration: 200 }}
      class="flex items-center justify-between p-4 bg-blue-100 rounded-lg"
    >
      <span>{item.text}</span>
      <button onclick={() => removeItem(item.id)} class="text-red-500 hover:text-red-700">删除</button>
    </div>
  {/each}
</div>
```

| 库 | 特点 | 适用场景 | Stars (2026-05) |
|----|------|----------|-----------------|
| **Svelte 内置** | 声明式，零依赖，自动清理 | 简单 UI 过渡、列表动画 | 内置 |
| **Motion One** | Web Animations API，极轻量 | 列表动画、手势、物理弹簧 | 19k+ |
| **GSAP** | 功能最全，插件生态丰富 | 复杂时间轴、ScrollTrigger、SVG 动画 | 18k+ |

> 数据来源: Motion One、GSAP GitHub 2026-05

---

## 图表

### LayerChart

```bash
npm install layerchart
```

LayerChart 是基于 D3 和 Svelte 5 的声明式图表库，专为 Svelte 5 Runes 设计。

```svelte
<script>
  import { Chart, Svg, Axis, Bars, Tooltip, Line, Area } from 'layerchart';

  const data = [
    { month: '1月', value: 100, forecast: 90 },
    { month: '2月', value: 200, forecast: 180 },
    { month: '3月', value: 150, forecast: 160 },
    { month: '4月', value: 300, forecast: 280 },
    { month: '5月', value: 250, forecast: 260 },
    { month: '6月', value: 400, forecast: 380 }
  ];
</script>

<div class="h-80 w-full">
  <Chart {data} x="month" y="value" padding={{ left: 20, right: 20, bottom: 20, top: 20 }}>
    <Svg>
      <Axis placement="bottom" grid={{ class: 'stroke-gray-100' }} />
      <Axis placement="left" grid={{ class: 'stroke-gray-100' }} />
      <Area y="forecast" fill="rgba(148, 163, 184, 0.2)" />
      <Line y="forecast" class="stroke-gray-400 stroke-2 stroke-dashed" />
      <Bars fill="#3b82f6" radius={4} class="hover:fill-blue-600 transition-colors" />
    </Svg>
    <Tooltip.Root let:data>
      <div class="bg-white p-3 shadow-lg rounded-lg border">
        <div class="text-sm font-medium">{data.month}</div>
        <div class="text-blue-600">实际: {data.value}</div>
        <div class="text-gray-500">预测: {data.forecast}</div>
      </div>
    </Tooltip.Root>
  </Chart>
</div>
```

### Viz.js + Svelte

```bash
npm install @viz-js/viz
```

Viz.js 是 Graphviz 的 WebAssembly 移植，适合流程图、结构图渲染。

```svelte
<script>
  import { instance } from '@viz-js/viz';
  import { onMount } from 'svelte';

  let svg = $state('');
  let dot = `
    digraph G {
      rankdir=LR;
      node [shape=box, style="rounded,filled", fontname="Inter"];
      edge [arrowhead=vee];

      A [label="用户请求", fillcolor="#dbeafe"];
      B [label="SvelteKit 路由", fillcolor="#dcfce7"];
      C [label="Load 函数", fillcolor="#fef3c7"];
      D [label="Drizzle ORM", fillcolor="#fce7f3"];
      E [label="页面渲染", fillcolor="#e0e7ff"];

      A -> B -> C -> D -> E;
      C -> E [style=dashed, label="缓存命中"];
    }
  `;

  onMount(async () => {
    const viz = await instance();
    svg = viz.renderSVGElement(dot).outerHTML;
  });
</script>

<div class="border rounded-lg p-4 bg-white overflow-auto">
  {@html svg}
</div>
```

| 库 | 图表类型 | 特点 | Stars (2026-05) |
|----|----------|------|-----------------|
| **LayerChart** | 统计图表 | Svelte 5 原生、D3 驱动、声明式 | 1.5k+ |
| **Viz.js** | 流程图/结构图 | Graphviz 兼容、WASM 渲染 | 1k+ |
| **layerchart-svelte** | 扩展图表 | 热力图、桑基图、树图 | 1.5k+ |

> 数据来源: LayerChart、Viz.js GitHub 2026-05

---

## Svelte MCP Server

```bash
npm install -D @sveltejs/mcp
```

Svelte MCP Server 让 AI 助手（Cursor、Copilot、Claude Desktop、Windsurf）直接理解 Svelte 项目结构，提供上下文感知的代码生成和重构建议。

### 配置方式

```json
// .cursor/mcp.json
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["@sveltejs/mcp"],
      "env": {
        "PROJECT_ROOT": "."
      }
    }
  }
}
```

```json
// Claude Desktop 配置
{
  "mcpServers": {
    "svelte": {
      "command": "npx",
      "args": ["-y", "@sveltejs/mcp"]
    }
  }
}
```

### AI 辅助能力

- **组件依赖图分析**: AI 可查询组件树和依赖关系，理解项目架构
- **类型安全代码生成**: 基于现有的 Drizzle/Prisma schema 生成类型安全的表单和 API
- **Runes 响应式流理解**: AI 理解 `$state`、`$derived`、`$effect` 的数据流向
- **自动重构建议**: 识别过时的 Svelte 4 模式（如 `export let`），建议迁移到 Runes
- **路由分析**: 理解 SvelteKit 文件系统路由、`load` 函数和 `actions`
- **表单生成**: 根据 Zod schema 自动生成完整的 Superforms 表单页面

### 使用示例

在支持 MCP 的 AI 助手（Cursor Composer、Claude Desktop Chat）中输入：

```
分析这个 SvelteKit 项目的路由结构和数据流
帮我根据 src/lib/schema.ts 生成一个完整的 CRUD 页面
将这个组件从 Svelte 4 语法迁移到 Svelte 5 Runes
为 User 模型生成一个带文件上传的 Superform
```

> 数据来源: Svelte 官方博客 2026-04 | GitHub: sveltejs/mcp

---

## 状态管理

### Runes 已经足够

Svelte 5 Runes 提供了原生的细粒度响应式系统，对于绝大多数应用场景已完全足够：

```svelte
<script>
  // 本地组件状态
  let count = $state(0);

  // 派生状态
  let doubled = $derived(count * 2);
  let isEven = $derived(count % 2 === 0);

  // 副作用
  $effect(() => {
    console.log('count changed:', count);
    document.title = `Count: ${count}`;
  });

  // 清理副作用
  $effect(() => {
    const handler = () => count++;
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  });
</script>

<button onclick={() => count++}>Count: {count} ({doubled}, {isEven ? '偶数' : '奇数'})</button>
```

### 跨组件共享状态

```ts
// src/lib/stores.svelte.ts
export function createCounter() {
  let count = $state(0);
  let history = $state<number[]>([]);

  return {
    get count() { return count; },
    get history() { return [...history]; },
    increment() {
      history.push(count);
      count++;
    },
    decrement() {
      history.push(count);
      count--;
    },
    reset() {
      history = [];
      count = 0;
    }
  };
}

// 全局单例
export const globalCounter = createCounter();
```

```svelte
<!-- ComponentA.svelte -->
<script>
  import { globalCounter } from '$lib/stores.svelte';
</script>

<button onclick={globalCounter.increment}>+</button>
<span>{globalCounter.count}</span>
```

```svelte
<!-- ComponentB.svelte -->
<script>
  import { globalCounter } from '$lib/stores.svelte';
</script>

<button onclick={globalCounter.decrement}>-</button>
<span>{globalCounter.count}</span>
<ul>
  {#each globalCounter.history as h}
    <li>{h}</li>
  {/each}
</ul>
```

### 何时需要外部库

| 场景 | 推荐库 | 原因 |
|------|--------|------|
| **跨框架共享逻辑** | Zustand / Jotai | 需要在 React/Vue/Svelte 间共享同一套状态逻辑 |
| **时间旅行调试** | Zustand + Redux DevTools | 需要记录、回放状态变更历史 |
| **复杂异步流** | RxJS + Svelte Store | WebSocket、事件流、复杂数据组合与转换 |
| **服务端状态管理** | TanStack Query | 缓存策略、去重请求、后台刷新、乐观更新 |
| **大规模全局状态** | Pinia / Zustand | 需要命名空间、模块化、插件系统 |
| **持久化状态** | svelte-persisted-store | 自动同步 localStorage/sessionStorage |

**核心原则**：对于纯 Svelte 项目，优先使用 Svelte 5 Runes 和 `.svelte.ts` 模块。仅在遇到上述特定跨场景需求时，才引入外部状态管理库。过度使用全局状态库会增加复杂性和 Bundle 体积。

> 数据来源: Svelte 官方文档 2026-05

---

## 生态工具 Stars/版本/维护状态

| 工具 | Stars | 最新版本 | 维护状态 | 许可证 | 说明 |
|------|-------|----------|----------|--------|------|
| **shadcn-svelte** | ~14k | v1.x | 活跃 | MIT | 拷贝式组件，社区繁荣，与 shadcn/ui 同步 |
| **Skeleton UI** | ~6k | v3.x | 活跃 | MIT | Svelte 专用主题系统，Tailwind 插件架构 |
| **Melt UI** | ~5k | v1.x | 活跃 | MIT | 无头组件原语，Bits UI 基础 |
| **Superforms** | ~5k | v2.x | 活跃 | MIT | SvelteKit 表单处理标杆，Zod/Valibot 集成 |
| **Lucia Auth** | ~7k | v3.x | 逐步停止维护 | MIT | 轻量 Session-based，作者已宣布停止维护 |
| **Auth.js** | ~25k | v5.x | 活跃 | ISC | 多框架 OAuth 方案，SvelteKit 官方推荐 |
| **Drizzle ORM** | ~45k | v0.40+ | 活跃 | Apache-2.0 | 类型安全 SQL，SvelteKit 社区首选 |
| **Prisma** | ~40k | v6.x | 活跃 | Apache-2.0 | 成熟 ORM，Schema 先行，生态丰富 |
| **Motion One** | ~19k | v10.x | 活跃 | MIT | Web Animations API，高性能轻量 |
| **GSAP** | ~18k | v3.x | 活跃 | 商业+开源 | 专业动画库，ScrollTrigger 强大 |
| **LayerChart** | ~1.5k | v0.x | 活跃 | MIT | Svelte 5 + D3，声明式图表 |
| **@sveltejs/mcp** | ~0.5k | v0.x | 活跃 | MIT | Svelte 官方 AI 辅助开发工具 |
| **TanStack Query** | ~42k | v5.x | 活跃 | MIT | 服务端状态管理，缓存策略强大 |
| **Zustand** | ~51k | v5.x | 活跃 | MIT | 轻量全局状态，跨框架友好 |

> 数据来源: GitHub Stars / npm registry 2026-05-01 | 维护状态基于最近 3 个月提交频率和发布记录

---

> 最后更新: 2026-05-01 | 数据来源: GitHub Stars 2026-05, npm registry, 各项目官方文档及发布公告
