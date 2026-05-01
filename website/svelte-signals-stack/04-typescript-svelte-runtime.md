# TypeScript + Svelte 编译运行时

Svelte 5 的 TypeScript 支持是一次彻底的变革。
从 Svelte 4 依赖 `svelte-preprocess` 进行 TypeScript 转译，到 Svelte 5 的原生内置支持，开发者现在可以在 `.svelte` 模板、`.svelte.ts` 模块以及 SvelteKit 应用中享受完整的类型安全。
本章深入探讨 Svelte 5 的类型系统架构、编译器与 TypeScript 的交互机制，以及生产环境中的最佳实践。

## 概述

Svelte 5 实现了原生 TypeScript 支持，无需预处理器。`.svelte.ts` 文件允许在组件外部使用 Runes，实现类型安全的共享状态。
这一变化不仅是语法层面的简化，更意味着 Svelte 编译器本身能够理解 TypeScript 类型注解，并将其融入响应式系统的依赖追踪与代码生成过程中。

| 特性 | Svelte 4 | Svelte 5 |
|------|----------|----------|
| TypeScript 支持 | 需 `svelte-preprocess` | 原生内置 |
| 模板类型检查 | 有限 | 完整（`svelte-check`） |
| 泛型组件 | 不支持 | 支持（`generics` 属性） |
| `.svelte.ts` 文件 | 不存在 | 原生支持 Runes |
| Props 类型推断 | 手动声明 | `$props()` 自动推断 |
| 模板表达式类型 | 无检查 | `svelte-check` 深度检查 |
| 事件处理类型 | 弱类型 | 精确的 DOM 事件类型 |
| Snippet 类型 | 不支持 | `Snippet<T>` 泛型支持 |

::: tip 版本要求
本章内容基于 Svelte 5.0+、TypeScript 5.5+ 以及 `svelte-check` 4.x。
建议始终使用最新稳定版本以获得最佳类型推断体验。
:::

---

## `.svelte.ts` 文件

`.svelte.ts` 是 Svelte 5 引入的特殊文件扩展名，允许在普通 TypeScript 文件中使用 Runes。
这一机制打破了"Runes 只能在 `.svelte` 组件中使用"的限制，使得共享状态逻辑、自定义 Store 工厂函数以及跨组件通信模块都能获得完整的类型安全。

### 核心特性

- **Runes 可用性**：在 `.svelte.ts` 文件中，所有 Runes（`$state`、`$derived`、`$effect`、`$inspect` 等）均可直接使用
- **编译时转换**：Svelte 编译器会在编译阶段将 `.svelte.ts` 中的 Runes 转换为原生 JavaScript 的 Signal 操作
- **类型保留**：TypeScript 类型注解在编译后会被擦除，但在开发阶段由 `svelte-check` 和 IDE 完整保留
- **ESM 兼容**：`.svelte.ts` 文件作为标准 ES Module 导出，可被任意 `.svelte` 组件或 `.ts` 文件导入

### 计数器工厂示例

```ts
// counter.svelte.ts
export function createCounter(initial = 0) {
  let count = $state(initial);
  let doubled = $derived(count * 2);
  let history = $state<number[]>([]);

  function increment() {
    history.push(count);
    count++;
  }

  function decrement() {
    history.push(count);
    count--;
  }

  function reset() {
    count = initial;
    history = [];
  }

  return {
    get count() { return count; },
    get doubled() { return doubled; },
    get history() { return history; },
    increment,
    decrement,
    reset
  };
}
```

注意上述工厂函数通过 getter 返回 `$state` 变量。这是关键模式：直接返回 `count` 会丢失响应性（返回的是当前值的快照），而 getter 确保每次访问都读取最新的 Signal 值。

### 显式类型接口

```ts
// counter.svelte.ts
export interface Counter {
  readonly count: number;
  readonly doubled: number;
  readonly history: readonly number[];
  increment(): void;
  decrement(): void;
  reset(): void;
}

export function createCounter(initial = 0): Counter {
  let count = $state(initial);
  let doubled = $derived(count * 2);
  let history = $state<number[]>([]);

  function increment() {
    history = [...history, count];
    count++;
  }

  function decrement() {
    history = [...history, count];
    count--;
  }

  function reset() {
    count = initial;
    history = [];
  }

  return {
    get count() { return count; },
    get doubled() { return doubled; },
    get history() { return history; },
    increment,
    decrement,
    reset
  };
}
```

::: warning 数组更新的响应性
在上面的示例中，`history.push(count)` 虽然会改变数组，但 Svelte 的响应性系统需要变量被重新赋值才能触发更新。因此更安全的做法是使用 `history = [...history, count]` 进行不可变更新。如果你需要可变更新，确保在 `$state` 中声明的对象或数组的变更能被编译器正确追踪。
:::

### 在组件中使用

```svelte
<!-- App.svelte -->
<script lang="ts">
  import { createCounter } from './counter.svelte.ts';

  const counter = createCounter(10);
</script>

<div class="counter">
  <button onclick={counter.decrement} aria-label="Decrease">−</button>
  <span class="value">
    {counter.count} (x2 = {counter.doubled})
  </span>
  <button onclick={counter.increment} aria-label="Increase">+</button>
  <button onclick={counter.reset}>Reset</button>
</div>

<ul class="history">
  {#each counter.history as h, i}
    <li>Step {i + 1}: {h}</li>
  {/each}
</ul>

<style>
  .counter {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .value {
    font-variant-numeric: tabular-nums;
    min-width: 10rem;
    text-align: center;
  }
</style>
```

---

## `$props` 类型推断

Svelte 5 的 `$props()` Runes 彻底改变了组件 Props 的类型定义方式。不再需要使用 `export let` 这种运行时与类型系统分离的语法，而是将类型注解直接融入响应式声明中。

### 基础类型定义

```svelte
<script lang="ts">
  interface Props {
    name: string;
    age?: number;
    items: string[];
    onSelect: (id: string) => void;
  }

  let { name, age = 18, items, onSelect }: Props = $props();
</script>

<h1>Hello, {name}</h1>
<p>Age: {age}</p>

<ul>
  {#each items as item}
    <li><button onclick={() => onSelect(item)}>{item}</button></li>
  {/each}
</ul>
```

在上述示例中：

- `name` 为必填字符串
- `age` 为可选数字，默认值为 `18`
- `items` 为字符串数组
- `onSelect` 为函数类型，接收 `string` 参数，返回 `void`

`$props()` 的运行时值即为解构后的对象，而 TypeScript 在编译时验证所有 Props 的类型兼容性和完整性。

### 解构与默认值

```svelte
<script lang="ts">
  interface Props {
    title: string;
    description?: string;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: boolean;
  }

  let {
    title,
    description = 'No description provided',
    variant = 'primary',
    disabled = false
  }: Props = $props();
</script>

<button class={variant} {disabled}>
  <strong>{title}</strong>
  {#if description}
    <small>{description}</small>
  {/if}
</button>
```

::: tip 类型收窄
当 Props 拥有联合类型（如 `variant?: 'primary' | 'secondary' | 'danger'`）时，TypeScript 会在模板中自动进行类型收窄。这意味着在 `{#if variant === 'danger'}` 块内，`variant` 的类型会被收窄为字面量 `'danger'`。
:::

### 泛型组件

Svelte 5 通过 `<script>` 标签的 `generics` 属性支持泛型组件，这是之前版本无法实现的强大特性。

```svelte
<!-- List.svelte -->
<script lang="ts" generics="T extends { id: string }">
  interface Props {
    items: T[];
    renderItem: (item: T) => string;
    key?: (item: T) => string;
    emptyMessage?: string;
  }

  let {
    items,
    renderItem,
    key = (item) => item.id,
    emptyMessage = 'No items found'
  }: Props = $props();
</script>

{#if items.length === 0}
  <p class="empty">{emptyMessage}</p>
{:else}
  <ul>
    {#each items as item (key(item))}
      <li>{renderItem(item)}</li>
    {/each}
  </ul>
{/if}
```

使用泛型组件时，TypeScript 会自动推断类型参数 `T`：

```svelte
<!-- UserList.svelte -->
<script lang="ts">
  import List from './List.svelte';

  interface User {
    id: string;
    name: string;
    email: string;
  }

  const users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@example.com' },
    { id: '2', name: 'Bob', email: 'bob@example.com' }
  ];

  function renderUser(user: User): string {
    return `${user.name} <${user.email}>`;
  }
</script>

<List items={users} renderItem={renderUser} />
```

在此示例中，`T` 被自动推断为 `User` 类型，`renderItem` 的参数类型也会相应地被精确推断为 `User`。

### 多类型参数

```svelte
<!-- Map.svelte -->
<script lang="ts" generics="K extends string | number, V">
  interface Props {
    entries: [K, V][];
    renderKey: (key: K) => string;
    renderValue: (value: V) => string;
  }

  let { entries, renderKey, renderValue }: Props = $props();
</script>

<dl>
  {#each entries as [k, v]}
    <dt>{renderKey(k)}</dt>
    <dd>{renderValue(v)}</dd>
  {/each}
</dl>
```

### 绑定 Props（`$bindable`）

双向绑定是组件库中最常见的需求之一。Svelte 5 通过 `$bindable()` Runes 提供了类型安全的双向绑定机制。

```svelte
<!-- Input.svelte -->
<script lang="ts">
  interface Props {
    value?: string;
    label: string;
    placeholder?: string;
    type?: 'text' | 'email' | 'password';
  }

  let {
    value = $bindable(),
    label,
    placeholder = '',
    type = 'text'
  }: Props = $props();
</script>

<label class="field">
  <span class="label">{label}</span>
  <input
    {type}
    {placeholder}
    bind:value
    class="input"
  />
</label>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .label {
    font-size: 0.875rem;
    font-weight: 500;
  }
  .input {
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
  }
</style>
```

父组件通过 `bind:` 指令实现双向绑定：

```svelte
<!-- Parent.svelte -->
<script lang="ts">
  import Input from './Input.svelte';

  let name = $state('');
  let email = $state('');
</script>

<Input bind:value={name} label="Name" placeholder="Enter your name" />
<Input bind:value={email} label="Email" type="email" placeholder="Enter your email" />

<p>Hello, {name || 'Guest'}</p>
```

`$bindable()` 的运行时语义是：声明该 Prop 可被父组件通过 `bind:` 进行双向绑定。如果父组件没有使用 `bind:`，则该 Prop 表现为普通的单向 Prop。

::: warning 绑定值的初始化
`$bindable()` 可以接受默认值，如 `$bindable('')`。但请注意，一旦父组件通过 `bind:` 传入值，默认值将被覆盖。这与 Svelte 4 中 `export let value = ''` 的语义完全一致。
:::

---

## `svelte-check` 工具链

`svelte-check` 是 Svelte 官方提供的类型检查 CLI 工具，它将 TypeScript 编译器与 Svelte 编译器深度集成，能够在 `.svelte` 文件的模板部分执行类型检查。

### 安装

```bash
npm install -D svelte-check typescript
```

### CLI 用法

```bash
# 一次性类型检查
npx svelte-check

# 监视模式（开发常用）
npx svelte-check --watch

# 输出 JSON（CI 场景）
npx svelte-check --output json

# 指定项目路径
npx svelte-check --workspace ./src

# 忽略特定诊断代码
npx svelte-check --ignore "2304,2322"
```

### 输出格式

`svelte-check` 支持三种输出格式：

- `human`（默认）：适合终端阅读的彩色文本输出
- `human-verbose`：包含更详细的诊断链信息
- `json`：适合 CI/CD 流水线解析的结构化数据

```bash
# CI 流水线示例
npx svelte-check --output json --fail-on-warnings
```

### `tsconfig.json` 配置

一个针对 Svelte 5 项目优化的 `tsconfig.json` 应当包含以下关键配置：

```json
{
  "extends": "./.svelte-kit/tsconfig.json",
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowJs": true,
    "checkJs": true,
    "verbatimModuleSyntax": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.svelte",
    "src/**/*.svelte.ts",
    "tests/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".svelte-kit",
    "build",
    "dist"
  ]
}
```

关键配置项说明：

| 配置项 | 作用 | Svelte 5 必要性 |
|--------|------|----------------|
| `moduleResolution: "bundler"` | 支持 `exports` 字段和裸导入 | 必需 |
| `isolatedModules: true` | 确保每个文件可独立编译 | 必需（Vite 要求） |
| `verbatimModuleSyntax: true` | 保留 `import type` / `export type` | 强烈推荐 |
| `allowJs: true` | 允许 JavaScript 文件参与编译 | 推荐 |
| `checkJs: true` | 对 JavaScript 文件进行类型检查 | 可选 |
| `strict: true` | 启用所有严格类型检查选项 | 强烈推荐 |

::: tip 关于 `verbatimModuleSyntax`
TypeScript 5.0 引入的 `verbatimModuleSyntax` 替代了旧的 `importsNotUsedAsValues` 和 `preserveValueImports`。它强制要求类型导入使用 `import type` 语法，这对于 Svelte 编译器正确区分类型与值至关重要。
:::

### VS Code 配置

为了获得最佳的 Svelte + TypeScript 开发体验，推荐配置以下 VS Code 设置：

```json
// .vscode/settings.json
{
  "svelte.enable-ts-plugin": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "svelte.plugin.svelte.compilerWarnings": {
    "a11y-click-events-have-key-events": "ignore",
    "a11y-no-static-element-interactions": "ignore"
  },
  "editor.defaultFormatter": "svelte.svelte-vscode",
  "[svelte]": {
    "editor.defaultFormatter": "svelte.svelte-vscode"
  }
}
```

```json
// .vscode/extensions.json
{
  "recommendations": [
    "svelte.svelte-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss"
  ]
}
```

---

## SvelteKit 类型生成

SvelteKit 通过代码生成提供了强大的类型系统支持。当你运行 `npm run check` 或启动开发服务器时，SvelteKit 会自动生成类型定义文件。

### 自动生成的类型

```bash
# 触发类型生成
npm run check

# 生成的文件位于：
# - src/app.d.ts（应用级类型声明）
# - .svelte-kit/types/（路由级类型）
# - .svelte-kit/tsconfig.json（自动生成的 TS 配置）
```

### 应用级类型声明

`src/app.d.ts` 是 SvelteKit 项目的全局类型声明入口：

```ts
// src/app.d.ts
/// <reference types="@sveltejs/kit" />

declare global {
  namespace App {
    // 错误处理类型
    interface Error {
      message: string;
      code?: string;
      status?: number;
    }

    // 服务端局部变量（hooks.handle 中设置）
    interface Locals {
      user: import('$lib/types').User | null;
      db: import('$lib/db').Database;
      sessionId: string;
    }

    // 页面级数据类型（与 +page.ts / +page.server.ts 的 load 函数关联）
    interface PageData {
      // 全局页面数据类型
    }

    // 平台环境（Cloudflare Workers、Vercel Edge 等）
    interface Platform {
      env?: {
        DB: D1Database;
        KV: KVNamespace;
        R2: R2Bucket;
      };
      context?: {
        waitUntil(promise: Promise<unknown>): void;
      };
      caches?: CacheStorage;
    }

    // 表单动作返回类型
    interface FormError {
      field?: string;
      message: string;
    }
  }
}

export {};
```

### 路由级类型

SvelteKit 为每个路由自动生成类型，可通过 `$types` 别名导入：

```ts
// +page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const response = await fetch(`/api/items/${params.id}`);
  const item = await response.json();

  return { item };
};
```

```ts
// +page.svelte
<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<h1>{data.item.name}</h1>
```

```ts
// +page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
  const item = await locals.db.items.findById(params.id);
  return { item };
};
```

### 布局类型

```ts
// +layout.ts
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url }) => {
  return {
    pathname: url.pathname,
    breadcrumbs: generateBreadcrumbs(url.pathname)
  };
};
```

```svelte
<!-- +layout.svelte -->
<script lang="ts">
  import type { LayoutData } from './$types';

  let { data, children }: { data: LayoutData; children: import('svelte').Snippet } = $props();
</script>

<nav>
  {#each data.breadcrumbs as crumb}
    <a href={crumb.href}>{crumb.label}</a>
  {/each}
</nav>

<main>
  {@render children()}
</main>
```

### Server Actions 类型

```ts
// +page.server.ts
import type { Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();
    const name = formData.get('name');

    if (!name || typeof name !== 'string') {
      return fail(400, { name, error: 'Name is required' });
    }

    const user = await locals.db.users.create({ name });
    return { user };
  }
};
```

```svelte
<!-- +page.svelte -->
<script lang="ts">
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
</script>

<form method="POST">
  <input name="name" value={form?.name ?? ''} />
  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}
  <button type="submit">Submit</button>
</form>
```

---

## 编译器与类型系统交互

理解 Svelte 编译器如何与 TypeScript 协作，对于调试复杂类型问题至关重要。

### 编译流程

```
┌─────────────────────────────────────────────┐
│              编译时 (Build Time)              │
├─────────────────────────────────────────────┤
│  .svelte / .svelte.ts                       │
│       ↓                                       │
│  Svelte 编译器 (parse → analyze → transform)  │
│    - 解析模板 AST                             │
│    - 分析 Script 中的 Runes 调用              │
│    - 构建响应式依赖图                          │
│    - 生成优化后的 JS 代码                      │
│       ↓                                       │
│  TypeScript 编译器 / svelte-check              │
│    - 类型检查 `<script>` 中的逻辑             │
│    - 类型检查模板中的表达式                    │
│    - 验证 Props 类型兼容性                     │
│    - 检查事件处理器签名                        │
│       ↓                                       │
│  Vite (开发) / Rollup/Rolldown (生产)         │
│    - ESM 模块打包                             │
│    - Tree-shaking 死码消除                     │
│    - Code splitting 代码分割                   │
│    - Minify 压缩                               │
└─────────────────────────────────────────────┘
```

### `.svelte` 文件的编译过程

当一个 `.svelte` 文件被编译时，Svelte 编译器执行以下步骤：

1. **解析阶段**：将文件解析为模板 AST、Script AST 和 Style AST
2. **Runes 分析**：遍历 Script AST，识别 `$state`、`$derived`、`$effect` 等 Runes 调用
3. **作用域分析**：确定每个变量的作用域和生命周期
4. **依赖图构建**：分析 `$derived` 和 `$effect` 的依赖关系
5. **代码生成**：将 AST 转换为优化的 JavaScript，Signal 操作被内联为细粒度更新逻辑
6. **TypeScript 剥离**：如果 `lang="ts"`，在代码生成前剥离类型注解

### `.svelte.ts` 文件的编译过程

`.svelte.ts` 文件的编译更为直接：

1. **Runes 识别**：扫描文件中的 Runes 调用
2. **状态转换**：将 `$state` 变量转换为 Signal 声明
3. **派生转换**：将 `$derived` 表达式转换为 computed Signal
4. **效果转换**：将 `$effect` 块转换为 effect 作用域
5. **类型擦除**：移除所有 TypeScript 类型注解
6. **输出 JS**：生成标准 JavaScript ESM 模块

### 类型检查时机

`svelte-check` 的类型检查发生在编译之后：

1. 使用 TypeScript 编译器 API 分析 `<script>` 块的类型
2. 使用 Svelte Language Server 分析模板中的表达式类型
3. 交叉验证组件 Props 的使用是否与声明一致
4. 检查事件绑定是否符合 DOM 事件类型定义

---

## 高级类型模式

### Snippet 类型

Svelte 5 的 `Snippet` 类型允许你定义类型化的内容片段：

```svelte
<!-- DataTable.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props<T> {
    data: T[];
    columns: { key: keyof T; title: string }[];
    rowActions?: Snippet<[T]>;
    emptyState?: Snippet;
  }

  let { data, columns, rowActions, emptyState }: Props<unknown> = $props();
</script>

<table>
  <thead>
    <tr>
      {#each columns as column}
        <th>{column.title}</th>
      {/each}
      {#if rowActions}
        <th>Actions</th>
      {/if}
    </tr>
  </thead>
  <tbody>
    {#if data.length === 0}
      <tr>
        <td colspan={columns.length + (rowActions ? 1 : 0)}>
          {@render emptyState?.()}
        </td>
      </tr>
    {:else}
      {#each data as row}
        <tr>
          {#each columns as column}
            <td>{row[column.key]}</td>
          {/each}
          {#if rowActions}
            <td>{@render rowActions(row)}</td>
          {/if}
        </tr>
      {/each}
    {/if}
  </tbody>
</table>
```

使用：

```svelte
<script lang="ts">
  import DataTable from './DataTable.svelte';

  interface User {
    id: string;
    name: string;
    role: string;
  }

  const users: User[] = [
    { id: '1', name: 'Alice', role: 'Admin' },
    { id: '2', name: 'Bob', role: 'User' }
  ];
</script>

<DataTable data={users} columns={[
  { key: 'name', title: 'Name' },
  { key: 'role', title: 'Role' }
]}>
  {#snippet rowActions(user: User)}
    <button onclick={() => editUser(user.id)}>Edit</button>
    <button onclick={() => deleteUser(user.id)}>Delete</button>
  {/snippet}

  {#snippet emptyState()}
    <p>No users found. <a href="/users/new">Create one?</a></p>
  {/snippet}
</DataTable>
```

### 上下文类型（Context API）

```ts
// stores/context.svelte.ts
import { getContext, setContext } from 'svelte';

export interface ThemeContext {
  theme: 'light' | 'dark';
  toggle(): void;
}

const THEME_KEY = Symbol('theme');

export function setThemeContext(ctx: ThemeContext) {
  setContext(THEME_KEY, ctx);
}

export function getThemeContext(): ThemeContext {
  return getContext(THEME_KEY) as ThemeContext;
}
```

```svelte
<!-- ThemeProvider.svelte -->
<script lang="ts">
  import { setThemeContext } from './stores/context.svelte.ts';

  let theme = $state<'light' | 'dark'>('light');

  setThemeContext({
    get theme() { return theme; },
    toggle() { theme = theme === 'light' ? 'dark' : 'light'; }
  });
</script>

<div class={theme}>
  {@render children()}
</div>
```

### 事件类型精确化

```svelte
<script lang="ts">
  interface Props {
    onsubmit: (data: FormData) => void;
    onkeydown: (e: KeyboardEvent) => void;
    onfiledrop: (files: FileList) => void;
  }

  let { onsubmit, onkeydown, onfiledrop }: Props = $props();

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    onsubmit(formData);
  }
</script>

<form onsubmit={handleSubmit} onkeydown={onkeydown}>
  <!-- form fields -->
</form>
```

---

## 类型安全最佳实践

| 实践 | 推荐 | 示例 |
|------|------|------|
| **Props 接口** | 始终定义 `interface Props` | `interface Props { name: string }` |
| **State 泛型** | 显式标注复杂类型 | `let items = $state<Item[]>([])` |
| **Load 类型** | 使用生成的 `$types` | `import type { PageLoad } from './$types'` |
| **事件类型** | 原生 DOM 事件类型 | `onclick: (e: MouseEvent) => void` |
| **Store 工厂** | 返回类型化 getter 对象 | `return { get count(): number }` |
| **类型导入** | 使用 `import type` | `import type { Snippet } from 'svelte'` |
| **上下文键** | 使用 Symbol 避免冲突 | `const KEY = Symbol('key')` |
| **表单类型** | 使用 `ActionData` | `let { form }: { form: ActionData } = $props()` |
| **泛型约束** | 使用 `extends` 限制类型 | `generics="T extends { id: string }"` |
| **严格模式** | `strict: true` | 在 `tsconfig.json` 中启用 |

### 常见陷阱与规避

1. **直接解构 `$state` 对象**：解构会丢失响应性。应使用 getter 或保持对象引用。
2. **循环引用类型**：复杂的状态图可能产生循环类型引用，使用 `interface` 而非 `type` 可缓解。
3. **`$effect` 依赖遗漏**：`$effect` 的依赖是自动追踪的，但如果条件分支中的变量未被初始执行路径访问，可能遗漏追踪。
4. **模板表达式类型错误**：在模板中调用方法时，确保方法签名明确，避免隐式 `any`。

---

## 参考资源

- [Svelte TypeScript 文档](https://svelte.dev/docs/typescript) 📚
- [SvelteKit 类型文档](https://kit.svelte.dev/docs/types) 📚
- [svelte-check](https://github.com/sveltejs/language-tools/tree/master/packages/svelte-check) 🛠️
- [Svelte Language Tools](https://github.com/sveltejs/language-tools) 🛠️
- [TypeScript 5.5 发行说明](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-5.html) 📚

> 最后更新: 2026-05-01 | 数据来源: svelte.dev 官方文档, TypeScript 5.5+, Svelte 5.0+ 源码
