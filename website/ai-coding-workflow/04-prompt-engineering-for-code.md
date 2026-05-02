---
title: 代码生成Prompt工程
description: '结构化Prompt设计、Few-shot学习、Chain-of-Thought推理和上下文窗口管理'
keywords: 'Prompt工程, Few-shot, Chain-of-Thought, 上下文窗口, 代码生成, 结构化Prompt'
---

# 代码生成Prompt工程

> **核心问题**: 如何设计Prompt，让AI生成高质量、可维护的代码？

## 1. 结构化Prompt设计

### 1.1 核心框架：角色 + 任务 + 约束 + 输出格式

**角色定义**：明确AI的专业身份

```markdown
你是一名资深的 SvelteKit + TypeScript 全栈开发者，
擅长编译器优化和响应式设计模式。
```

**任务描述**：具体、可验证的目标

```markdown
请实现一个支持虚拟滚动的数据表格组件，要求：
1. 支持 10 万行数据流畅渲染
2. 支持列排序和筛选
3. 支持行选择（单选/多选）
4. 使用 Svelte 5 Runes 语法
```

**约束条件**：限制和边界

```markdown
约束：
- 不使用第三方表格库
- 虚拟滚动使用 requestAnimationFrame
- 支持键盘导航（ArrowUp/ArrowDown/Space）
- 包含完整的 TypeScript 类型定义
```

**输出格式**：指定代码组织方式

```markdown
输出格式：
1. 文件清单及相对路径
2. 每个文件的完整代码
3. 关键设计决策的说明
4. 复杂度分析（时间/空间）
```

### 1.2 反幻觉策略

防止AI编造不存在的API：

```markdown
【反幻觉约束】

你只能使用以下确认存在的库和API：
- React 18.x (hooks: useState, useEffect, useCallback)
- date-fns (版本2.x)

如果你需要使用不在上述列表中的API，
请明确标注"[需要确认此API存在]"，
不要假设任何API的存在。
```

## 2. Few-shot学习

### 2.1 提供示例模板

**场景**：要求AI按项目既有风格生成代码。

```markdown
请按照以下模式生成新的 Service 类：

【现有模式示例：UserService】
```typescript
// src/services/UserService.ts
import { db } from '$lib/db';

export class UserService {
  async findById(id: string): Promise<User | null> {
    return db.selectFrom('users')
      .where('id', '=', id)
      .selectAll()
      .executeTakeFirst();
  }

  async create(data: CreateUserInput): Promise<User> {
    return db.insertInto('users')
      .values(data)
      .returningAll()
      .executeTakeFirstOrThrow();
  }
}
```

【任务】
请生成 OrderService，包含以下方法：

- findById(id)
- findByUserId(userId)
- create(data)
- updateStatus(id, status)

```

### 2.2 正例与反例对比

```markdown
【好的Prompt】
"请使用 Early Return 模式重构以下函数，
减少嵌套层级至最多2层。"

【差的Prompt】
"优化这个函数。"

【好的Prompt】
"为以下函数生成单元测试，覆盖：
- 正常输入
- 边界值（空数组、极大值）
- 异常输入（null、undefined、错误类型）"

【差的Prompt】
"写测试。"
```

## 3. Chain-of-Thought推理

### 3.1 引导AI逐步推理

```markdown
请实现一个 URL 解析函数，要求：

思考步骤：
1. 首先分析 URL 的标准结构（协议、主机、路径、查询参数、哈希）
2. 设计返回的类型定义（TypeScript interface）
3. 实现解析逻辑，处理边界情况
   - 相对路径
   - 无协议URL
   - 特殊字符编码
4. 编写对应的单元测试

请先输出思考过程，再输出最终代码。
```

### 3.2 分阶段开发Prompt

```markdown
【第一阶段：类型设计】
请为电商订单系统设计核心类型：
- Order（订单）
- OrderItem（订单项）
- ShippingAddress（配送地址）

要求：
- 使用 branded types 防止ID混淆
- 标注每个字段的业务约束

【第二阶段：API契约】
基于上述类型，设计 REST API 接口：
- POST /orders
- GET /orders/:id
- PATCH /orders/:id/status

【第三阶段：测试用例】
为每个API端点生成测试用例

【第四阶段：最终实现】
使用 SvelteKit + Prisma 实现完整的 CRUD
```

## 4. 上下文窗口管理

### 4.1 分块策略

当项目过大超出AI上下文窗口时：

```markdown
【项目概览】
项目：SaaS管理平台
技术栈：SvelteKit + Prisma + PostgreSQL
模块：用户管理、权限系统、计费、数据分析

【当前任务】
仅实现"用户管理"模块的以下功能：
1. 用户列表（分页、筛选、排序）
2. 用户详情页
3. 用户角色分配

【相关文件】
请同时查看以下已有文件以保持一致性：
- src/lib/schema.ts（数据库Schema）
- src/lib/types.ts（共享类型）
```

### 4.2 上下文压缩

```markdown
【已有代码摘要】
项目使用以下模式：
- 所有API端点使用 src/routes/api/ 文件系统路由
- 数据库访问通过 src/lib/db.ts 的统一客户端
- 表单验证使用 Zod schema
- 错误处理统一返回 { success, data, error } 格式

【新功能要求】
基于上述模式，实现...（简述）
```

## 5. Prompt模板库

### 5.1 组件生成模板

```markdown
组件名称：{componentName}
Props接口：{propsInterface}
功能描述：{description}

要求：
- 使用 Svelte 5 Runes
- 支持无障碍（ARIA属性）
- 包含 Storybook stories
- TypeScript严格模式
```

### 5.2 API端点生成模板

```markdown
HTTP方法：{method}
路径：{path}
框架：SvelteKit Route Handler

输入验证：{inputSchema}
业务规则：{businessRules}
错误处理：{errorCases}
```

### 5.3 数据库Schema生成模板

```markdown
请为以下业务需求设计PostgreSQL + Prisma Schema：

业务领域：{domain}
核心实体：{entities}
关系类型：{relationships}

要求：
1. 使用适当的字段类型和约束
2. 添加索引优化查询
3. 包含软删除（deletedAt）
4. 使用uuid或snowflake作为主键
5. 包含完整的Prisma模型定义

输出格式：
- 完整的prisma/schema.prisma
- 各表的索引设计说明
- 常见的查询模式示例
```

### 5.4 算法实现模板

```markdown
请实现以下算法：{algorithmName}

输入格式：{inputFormat}
输出格式：{outputFormat}
约束条件：{constraints}

要求：
1. 时间复杂度：{timeComplexity}
2. 空间复杂度：{spaceComplexity}
3. 使用 TypeScript
4. 包含详细的注释说明思路
5. 包含边界测试用例
6. 如果存在多种解法，请比较并推荐最优方案

请先输出算法思路，再输出完整代码。
```

### 5.5 代码审查Prompt模板

```markdown
请审查以下代码，按以下维度分析：

【审查维度】
1. 类型安全性：是否存在隐式any、类型断言滥用
2. 性能问题：是否存在不必要的重渲染、内存泄漏
3. 可维护性：函数长度、圈复杂度、命名规范
4. 安全隐患：XSS、注入、敏感信息泄露
5. 测试覆盖：是否可测试、边界条件处理

【输出格式】
对每处问题：
- 标注严重级别（🔴严重/🟡警告/🟢建议）
- 问题位置（行号）
- 问题描述
- 推荐修复代码

【代码】
```typescript
[粘贴代码]
```

```

### 5.6 文档生成模板

```markdown
请为以下API生成完整的文档：

技术栈：{techStack}
目标读者：{audience}

要求：
1. 函数/方法的JSDoc注释
2. 使用示例（常见场景 + 边缘场景）
3. 参数说明表格（名称、类型、必填、描述）
4. 返回值说明
5. 可能抛出的错误
6. 相关的同级API交叉引用

代码：
```typescript
[粘贴代码]
```

```

## 6. Few-shot 深度示例

### 6.1 从函数式到响应式的Few-shot

**任务**：将传统命令式代码转换为Svelte 5 Runes响应式代码。

```markdown
【示例1：简单状态】
原始代码（命令式）：
```javascript
let count = 0;
function increment() {
  count++;
  updateUI(count);
}
```

转换后（Svelte 5 Runes）：

```svelte
<script>
  let count = $state(0);
</script>
<button onclick={() => count++}>
  Count: {count}
</button>
```

【示例2：派生状态】
原始代码：

```javascript
let firstName = '';
let lastName = '';
function getFullName() {
  return firstName + ' ' + lastName;
}
```

转换后：

```svelte
<script>
  let firstName = $state('');
  let lastName = $state('');
  let fullName = $derived(firstName + ' ' + lastName);
</script>
```

【任务】
请将以下代码转换为Svelte 5 Runes：
[粘贴代码]

```

### 6.2 错误处理模式Few-shot

```markdown
【示例1：同步函数错误处理】
原始代码：
```typescript
function parseConfig(json: string): Config {
  return JSON.parse(json);
}
```

改进后（使用Result类型）：

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function parseConfig(json: string): Result<Config> {
  try {
    const data = JSON.parse(json);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: e as Error };
  }
}
```

【示例2：异步函数错误处理】
原始代码：

```typescript
async function fetchUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}
```

改进后：

```typescript
async function fetchUser(id: string): Promise<Result<User, FetchError>> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
      return { success: false, error: new FetchError(res.status) };
    }
    const data = await res.json();
    return { success: true, data };
  } catch (e) {
    return { success: false, error: new FetchError(0, e) };
  }
}
```

【任务】
请按照上述模式，改进以下代码的错误处理：
[粘贴代码]

```

### 6.3 测试生成Few-shot

```markdown
【示例1：纯函数测试】
函数：
```typescript
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
```

AI生成测试：

```typescript
import { describe, it, expect } from 'vitest';
import { clamp } from './math';

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles equal min and max', () => {
    expect(clamp(5, 10, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5);
  });
});
```

【示例2：异步API测试】
函数：

```typescript
export async function fetchUser(id: string): Promise<User> {
  // ...
}
```

AI生成测试：

```typescript
describe('fetchUser', () => {
  it('returns user for valid id', async () => {
    const user = await fetchUser('123');
    expect(user.id).toBe('123');
    expect(user.email).toMatch(/@/);
  });

  it('throws for non-existent id', async () => {
    await expect(fetchUser('999')).rejects.toThrow('User not found');
  });

  it('throws for invalid id format', async () => {
    await expect(fetchUser('')).rejects.toThrow('Invalid id');
  });
});
```

【任务】
请为以下函数生成完整的Vitest测试，覆盖所有分支：
[粘贴代码]

```

## 7. 反模式深度对比

### 7.1 Prompt反模式与正面对比

| 反模式 | 反面示例 | 正面示例 | 改进要点 |
|--------|---------|---------|----------|
| **过度笼统** | "写个登录页面" | "使用SvelteKit实现JWT登录页面，包含邮箱+密码表单，密码需满足8位以上含大小写和数字，登录成功后跳转/dashboard，错误时显示具体提示" | 指定技术栈、验证规则、交互流程 |
| **隐含假设** | "优化这个排序函数" | "优化以下排序函数，目标：将100万元素数组的排序时间从200ms降至50ms以内，允许使用额外内存，不允许修改输入数组" | 明确约束和目标指标 |
| **忽视边界** | "实现一个数组去重函数" | "实现数组去重函数，要求：处理null/undefined元素、保持原始顺序、支持对象数组（按id字段去重）、在Node.js 18环境下运行" | 列出所有边界条件和环境要求 |
| **输出模糊** | "写文档" | "为以下API生成Markdown文档，包含：功能描述、参数表格（名称/类型/必填/默认值/描述）、返回值类型、错误码说明、3个使用示例" | 指定文档结构和具体内容 |
| **缺乏上下文** | "修复这个bug" | "在以下代码中，第23行当user为null时会抛出TypeError。请修复该问题，同时确保修复后所有现有测试仍通过，并添加针对该场景的回归测试" | 提供错误位置、期望行为、验证标准 |

### 7.2 代码生成反模式

```markdown
【反模式1：AI幻觉API】
❌ AI生成：
```typescript
import { useSWR } from 'swr';
// AI可能生成swr不存在的API
const { data, error, isLoading } = useSWR('/api/user', fetcher, {
  refreshInterval: 5000,
  suspense: true  // 可能版本不支持
});
```

✅ 正确定制Prompt后：

```markdown
请使用 SWR v2.2 的API（仅使用官方文档中明确存在的选项：
- revalidateOnFocus, revalidateOnReconnect, refreshInterval
- dedupingInterval, shouldRetryOnError
不要生成未列出的选项）。
```

【反模式2：忽略类型安全】
❌ AI生成：

```typescript
function processData(data: any) {
  return data.items.map((item: any) => ({
    name: item.name,
    value: item.value
  }));
}
```

✅ 正确定制Prompt后：

```typescript
interface ProcessedItem {
  name: string;
  value: number;
}

interface InputData {
  items: Array<{
    name: string;
    value: number;
    metadata?: Record<string, unknown>;
  }>;
}

function processData(data: InputData): ProcessedItem[] {
  return data.items.map(item => ({
    name: item.name,
    value: item.value
  }));
}
```

【反模式3：过度工程】
❌ AI生成：
为简单的计数器组件生成20个文件，包含复杂的状态机、 sagas、 中间件。

✅ 正确定制Prompt后：

```markdown
请实现一个计数器组件，要求：
- 单文件实现（<100行）
- 使用Svelte 5 Runes
- 仅包含必要功能：增/减/重置
- 无需外部状态管理
```

```

## 8. 高级上下文管理技巧

### 8.1 多文件上下文组织

当需要提供多个文件作为上下文时：

```markdown
【项目结构摘要】
```

src/
├── lib/
│   ├── db.ts          # Prisma客户端
│   ├── auth.ts        # 认证工具
│   └── validation.ts  # Zod schema
├── routes/
│   ├── api/
│   │   └── users/
│   │       └── +server.ts  # 用户API
│   └── login/
│       └── +page.svelte    # 登录页

```

【相关文件内容】
--- FILE: src/lib/db.ts ---
[内容]

--- FILE: src/lib/validation.ts ---
[内容]

【任务】
基于上述文件，实现用户注册API：POST /api/register
```

### 8.2 代码摘要替代完整代码

当文件过长时，提供结构化摘要：

```markdown
【文件摘要：src/lib/utils.ts】
- 导出函数：formatDate(date, format?) → string
- 导出函数：parseQueryParams(url) → Record<string, string>
- 导出常量：DEFAULT_PAGE_SIZE = 20
- 依赖：dayjs

【文件摘要：src/lib/auth.ts】
- 导出：verifyToken(token) → Promise<Payload>
- 导出：createToken(payload) → string
- 导出中间件：requireAuth
- 依赖：jose

【任务】
基于上述工具函数，实现...
```

## 9. 领域特定Prompt模式

### 9.1 前端组件Prompt模式

```markdown
【组件规格】
名称：DataTable
类型：复合组件（容器 + 子组件）

【行为规格】
1. 支持列排序（点击表头切换升序/降序）
2. 支持行选择（单选/多选/全选）
3. 支持虚拟滚动（10万行流畅渲染）
4. 支持空状态和加载状态

【无障碍要求】
- 表头使用<th scope="col">
- 行选择使用aria-checked
- 支持键盘导航（方向键、Space选择）

【样式约束】
- 使用Tailwind CSS
- 暗色模式支持
- 响应式：移动端横向滚动
```

### 9.2 后端API Prompt模式

```markdown
【API规格】
方法：POST /api/orders
认证：需要（Bearer JWT）

【请求Schema】
```typescript
const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive()
  })).min(1),
  shippingAddress: z.object({
    street: z.string().min(1),
    city: z.string(),
    zipCode: z.string().regex(/^\d{6}$/)
  })
});
```

【业务规则】

1. 检查库存充足性
2. 计算总价（含税费）
3. 创建订单记录（事务）
4. 扣减库存
5. 发送确认邮件（异步）

【错误处理】

- 400：请求参数无效
- 401：未认证
- 409：库存不足
- 500：内部错误（回滚事务）

```

### 9.3 数据库设计Prompt模式

```markdown
【业务需求】
设计一个多租户SaaS平台的权限系统。

【要求】
1. 支持组织（Organization）级别的数据隔离
2. 支持角色（Role）基于权限（Permission）的RBAC
3. 支持用户在不同组织中有不同角色
4. 权限变更实时生效（不依赖重新登录）

【约束】
- 数据库：PostgreSQL 15
- ORM：Prisma
- 租户隔离方式：行级安全（RLS）

【输出要求】
1. 完整的Prisma Schema
2. RLS策略定义
3. 常见查询示例
4. 索引设计说明
```

## 10. 多语言与国际化Prompt

### 10.1 代码注释国际化

```markdown
请为以下代码添加中英双语注释：
- 函数级注释使用JSDoc，包含中英文
- 复杂逻辑行内注释使用中文
- 保持注释简洁，不重复代码本身表达的信息

代码：
[粘贴代码]
```

### 10.2 错误消息国际化

```markdown
请实现一个错误消息国际化系统：

要求：
1. 支持中文、英文、日文
2. 错误码格式：ERR_{MODULE}_{CODE}（如 ERR_AUTH_001）
3. 支持动态参数插值（如 "用户 {name} 不存在"）
4. 提供TypeScript类型定义，确保所有错误码都有对应消息

输出：
- 核心类型定义
- 消息加载器
- 使用示例
```

## 6. 常见陷阱

| 陷阱 | 示例 | 修复 |
|------|------|------|
| 过于笼统 | "写个登录功能" | 明确技术栈、安全要求、UI规格 |
| 缺乏约束 | "用React实现" | 指定版本、状态管理方案、样式方案 |
| 忽略边界 | "排序数组" | 明确空数组、重复元素、大数组 |
| 不指定输出 | "优化代码" | 明确优化目标（性能/可读性/大小） |

## 总结

- **结构化Prompt**：角色 + 任务 + 约束 + 格式，缺一不可
- **Few-shot示例**：提供项目既有模式，确保一致性
- **Chain-of-Thought**：引导AI逐步推理，提高准确性
- **上下文管理**：大项目分块，保持上下文聚焦
- **迭代优化**：根据输出质量持续调整Prompt

## 参考资源

- [Prompt Engineering Guide](https://www.promptingguide.ai/) 📚
- [OpenAI Prompt Best Practices](https://platform.openai.com/docs/guides/prompt-engineering) 📘

> 最后更新: 2026-05-02
