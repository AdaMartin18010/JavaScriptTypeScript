# AI 编码工作流深度指南

> 在 JavaScript/TypeScript 项目中集成 AI 辅助开发的全面实践手册。涵盖 Cursor IDE、Claude Code、GitHub Copilot、AI 代码审查、重构工作流、提示工程、幻觉检测、团队协作及 10+ 可运行示例。

---

## 目录

1. [核心工具全景对比](#一核心工具全景对比)
2. [Cursor IDE 深度工作流](#二cursor-ide-深度工作流)
3. [Claude Code / Claude Desktop 工作流](#三claude-code--claude-desktop-工作流)
4. [GitHub Copilot 最佳实践](#四github-copilot-最佳实践)
5. [AI 生成代码审查方法论](#五ai-生成代码审查方法论)
6. [AI 辅助重构工作流](#六ai-辅助重构工作流)
7. [代码生成提示工程](#七代码生成提示工程)
8. [AI 幻觉检测](#八ai-幻觉检测)
9. [团队 AI 工作流](#九团队-ai-工作流)
10. [TypeScript 协作模式示例](#十typescript-协作模式示例)
11. [最佳实践总结](#十一最佳实践总结)

---

## 一、核心工具全景对比

| 工具 | 定位 | 核心模型 | 交互模式 | 最佳场景 | 定价模式 |
|------|------|---------|---------|---------|---------|
| **Cursor** | AI-native IDE | GPT-4o / Claude 3.7 Sonnet | Composer + Tab + Chat | 全栈开发，多文件重构 | $20/月 Pro |
| **Claude Code** | CLI Agent | Claude 3.7 Sonnet | 终端对话 + 工具调用 | 复杂重构，测试生成 | API 按量计费 |
| **GitHub Copilot** | IDE 智能补全 | GPT-4o Copilot / Claude 3.5 | 实时 Tab 补全 | 日常编码，函数级生成 | $10/月 Pro |
| **Continue.dev** | 开源 IDE 扩展 | 自配置 (OpenAI/Anthropic/Ollama) | Chat + 代码编辑 | 隐私优先，本地模型 | 免费开源 |
| **Windsurf** | 协作编码 | GPT-4o / Claude | Cascade 工作流 | 实时代码解释 | $15/月 |
| **Sourcegraph Cody** | 企业代码智能 | Claude 3.5 / Mixtral | 代码库问答 | 大型代码库搜索 | 免费/企业版 |
| **Aider** | 终端结对编程 | GPT-4 / Claude | Git 集成对话 | 多文件编辑 | 开源 + API |

**选型决策矩阵**：

- **个人开发者 / 预算敏感** → Continue.dev + 本地 Ollama + GitHub Copilot Free
- **追求极致效率 / 全栈项目** → Cursor Pro (Composer 模式) + Claude Code CLI
- **企业代码库 / 合规要求** → Cody + 私有部署 + 自托管模型
- **已有 IDE 习惯 (VS Code/JetBrains)** → Copilot + Continue.dev 侧栏
- **隐私敏感 / 离线环境** → Ollama + Continue.dev + 本地模型 (Codellama, DeepSeek-Coder)

---

## 二、Cursor IDE 深度工作流

Cursor 是基于 VS Code 分支构建的 AI-native IDE，它将 AI 能力深度集成到编辑器核心，而非作为插件存在。Cursor 的核心工作流围绕三种交互模式展开：Tab 补全、Chat 对话、Composer 多文件编辑。

### 2.1 Tab 模式：实时预测性补全

Tab 模式是 Cursor 对 GitHub Copilot 补全机制的进化。它不仅是基于上下文的单行补全，而是能够预测整个代码块、多行逻辑甚至跨文件的引用修复。

**工作原理**：
Cursor 的 Tab 模式基于一个双模型架构：轻量级模型预测下一个 token，重量级模型（Claude 3.7 / GPT-4o）在后台分析光标周围 1000+ token 的上下文，生成结构化的编辑建议。当用户按下 Tab 时，整个代码块被原子性地插入。

**高级技巧**：

1. **多行补全触发**：在注释中写自然语言描述，换行后 Cursor 会自动生成对应实现
2. **部分接受**：按 `Ctrl + →`（Windows/Linux）或 `Cmd + →`（Mac）逐个单词接受补全，而非整段
3. **跨文件感知**：Cursor 会索引整个代码库，补全时会引用其他文件中的类型定义和函数签名
4. **智能重写**：选中代码后按 `Ctrl + K` 可以直接在行间发起编辑指令

```typescript
// 示例：Tab 模式的多行预测
// 在注释中描述需求后按 Enter，Cursor 自动生成下方代码

// 实现一个带指数退避的重试函数，支持 Jitter 和最大重试次数
function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    jitter?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, jitter = true } = options;

  return new Promise((resolve, reject) => {
    const attempt = async (retryCount: number): Promise<void> => {
      try {
        const result = await fn();
        resolve(result);
      } catch (err) {
        if (retryCount >= maxRetries) {
          reject(err);
          return;
        }
        const delay = Math.min(baseDelay * 2 ** retryCount, maxDelay);
        const finalDelay = jitter ? delay * (0.5 + Math.random() * 0.5) : delay;
        setTimeout(() => attempt(retryCount + 1), finalDelay);
      }
    };
    attempt(0);
  });
}
```

### 2.2 Chat 模式：上下文感知的对话编程

Cursor Chat（`Ctrl + L` / `Cmd + L`）是一个集成在编辑器侧栏的 AI 对话界面。与通用聊天机器人不同，Cursor Chat 深度理解代码库结构，可以引用当前文件、符号定义、Git 差异甚至整个文件夹。

**上下文引用语法**：

- `@file` — 引用特定文件内容到对话上下文
- `@symbol` — 引用函数、类、接口的定义
- `@folder` — 将整个文件夹作为上下文
- `@git` — 引用最近的 Git 变更
- `@web` — 搜索网络获取最新文档
- `@docs` — 引用已索引的文档站点

**实战工作流**：

```
用户: @file src/services/auth.ts @file src/types/user.ts
      为 AuthService 添加基于角色的访问控制（RBAC），
      使用 User 类型中的 role 字段。需要支持权限缓存。

Cursor: [分析两个文件的类型定义]
        [生成 RBAC 实现]
        [提供使用示例]
```

### 2.3 Composer：多文件协作编辑

Composer 是 Cursor 最强大的功能，专为大规模重构设计。它允许 AI 同时查看和编辑多个文件，理解文件间的依赖关系，并自动执行跨文件修改。

**Composer 的四种模式**：

1. **Normal**：AI 生成代码，用户审核后应用
2. **Agent**：AI 自动读取相关文件、执行终端命令、运行测试
3. **Ask**：仅问答，不修改文件
4. **Review**：AI 审查当前变更并提供改进建议

**Composer Agent 模式实战**：

```
Prompt: "将项目从 Express 迁移到 Fastify：
  1. 更新 src/server.ts 使用 Fastify 实例
  2. 将所有路由处理器从 (req, res) => 改为 Fastify 的 request/reply 签名
  3. 更新中间件为 Fastify 插件
  4. 运行 npm install fastify @fastify/cors
  5. 确保所有测试通过"

Composer Agent 执行过程：
  → 读取 package.json 确认依赖
  → 读取 src/server.ts 和路由文件
  → 修改 server.ts 创建 Fastify 实例
  → 逐文件更新路由签名
  → 执行 npm install
  → 运行 npm test
  → 修复失败的测试
```

### 2.4 Cursor Rules（.cursorrules）

`.cursorrules` 是 Cursor 的项目级上下文配置，相当于给 AI 设定"编程规范"。良好的规则配置能显著减少重复说明，提升生成代码的一致性。

```yaml
# .cursorrules — 项目级 AI 上下文配置
rules:
  - language: typescript
    strict_mode: true
    target: ES2022
    module: ESNext

  - coding_style:
      prefer: "explicit types over inference for public APIs"
      function_style: "arrow functions for callbacks, named functions for exports"
      error_handling: "always use Result<T, E> pattern instead of throwing"

  - architecture:
      pattern: "clean architecture with domain/services/infra layers"
      state_management: "use Zustand for client, use Server Actions for server"
      validation: "Zod for all runtime validation, no 'any' without @ts-expect-error"

  - testing:
      framework: vitest
      coverage: "80% minimum for business logic"
      mocking: "msw for API, mock database for integration tests"

  - forbidden_patterns:
      - "never use console.log in production code"
      - "never commit .env files"
      - "never use implicit any"

examples:
  - prompt: "Create a new API endpoint"
    response_pattern: |
      // 1. Define Zod schema for request/response
      // 2. Implement Server Action or Route Handler
      // 3. Add error handling with typed errors
      // 4. Write Vitest unit tests
```

---

## 三、Claude Code / Claude Desktop 工作流

Claude Code 是 Anthropic 推出的终端级 AI Agent，它将 Claude 3.7 Sonnet 的能力直接暴露为命令行工具。与 IDE 集成不同，Claude Code 更侧重于代码库级别的理解和自动化任务执行。

### 3.1 Claude Code 的核心能力

Claude Code 不是简单的聊天界面，而是一个具备工具调用能力的 Agent：

- **文件系统工具**：读写文件、列出目录、搜索代码
- **终端工具**：执行 shell 命令、运行测试、安装依赖
- **Git 工具**：查看 diff、提交代码、切换分支
- **代码分析**：查找符号定义、分析依赖关系、生成调用图

### 3.2 典型工作流

**工作流 1：从零搭建功能模块**

```bash
# 进入项目目录
cd my-project

# 启动 Claude Code
claude

# 对话示例
> 我需要实现一个用户认证模块，包含：
> 1. 基于 JWT 的登录/注册
> 2. 密码哈希使用 bcrypt
> 3. 刷新令牌机制
> 4. Zod 校验所有输入
> 5. 使用 Prisma 的 User 模型
> 
> 请查看现有的 schema 和项目结构，然后实现。

Claude 的执行过程：
1. 读取 prisma/schema.prisma 确认 User 模型
2. 读取现有的中间件和路由结构
3. 创建 src/auth/
   ├── schemas.ts      # Zod 校验模式
   ├── service.ts      # JWT 和 bcrypt 逻辑
   ├── middleware.ts   # 认证中间件
   └── routes.ts       # Express/Fastify 路由
4. 更新 .env.example 添加 JWT_SECRET
5. 运行 npm test 验证
```

**工作流 2：大规模重构**

```bash
> 将项目中所有使用 callback 风格的 API 改为 async/await。
> 请找到所有 affected 文件，执行修改，并确保测试通过。

Claude:
1. 使用 grep/find 搜索 callback 模式
2. 逐文件分析并生成修改计划
3. 执行修改（用户确认每个文件）
4. 运行测试套件
5. 修复 regressions
```

### 3.3 Claude Desktop 与 MCP

Claude Desktop 支持 **Model Context Protocol (MCP)**，允许 AI 访问外部工具和数据源：

```json
// mcp-config.json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/project/src"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github", "--token", "${GITHUB_TOKEN}"]
    }
  }
}
```

通过 MCP，Claude 可以直接查询数据库 schema、读取日志文件、查看 GitHub Issues，大幅减少信息幻觉。

### 3.4 Claude Code 的最佳实践

1. **分阶段指令**：将复杂任务拆分为 3-5 个步骤，每步验证后再继续
2. **显式范围限定**：使用 `--include` 或文件路径限制 Claude 的搜索范围
3. **测试先行**：要求 Claude 先生成测试，再实现功能
4. **Review 模式**：使用 `/review` 命令让 Claude 审查当前工作区的所有变更
5. **Git 集成**：在 Claude 会话中频繁使用 `git diff` 检查变更

---

## 四、GitHub Copilot 最佳实践

GitHub Copilot 是市场占有率最高的 AI 编程工具，其核心优势在于深度集成到 IDE 的编辑体验中。Copilot 不仅是补全工具，更是理解代码意图的结对程序员。

### 4.1 Copilot 在 VS Code 中的三种形态

1. **Ghost Text（幽灵文本）**：灰色虚影补全，按 Tab 接受
2. **Copilot Chat**：侧栏对话，支持 `@workspace` 代码库问答
3. **Inline Chat**：选中代码后 `Ctrl + I` 直接对话编辑
4. **Copilot Edits**：多文件编辑代理（类似 Cursor Composer）

### 4.2 Copilot 提示技巧（Prompting for Copilot）

Copilot 的补全质量严重依赖于上下文。以下技巧可显著提升生成质量：

**技巧 1：意图注释**

在函数前写清晰的注释，Copilot 会将其作为生成依据：

```typescript
/**
 * 计算两个日期之间的工作日天数（排除周末和节假日）
 * @param start - 开始日期（含）
 * @param end - 结束日期（含）
 * @param holidays - 额外排除的节假日列表
 * @returns 工作日天数
 * @throws 如果 start > end 抛出 RangeError
 */
function countBusinessDays(start: Date, end: Date, holidays: Date[] = []): number {
  // Copilot 会基于 JSDoc 生成精确实现
}
```

**技巧 2：类型驱动生成**

先定义类型和接口，Copilot 会根据类型约束生成实现：

```typescript
interface PaymentProcessor {
  process(amount: number, currency: string): Promise<PaymentResult>;
  refund(transactionId: string): Promise<RefundResult>;
  validateCard(card: CardDetails): ValidationResult;
}

// 在此处开始输入，Copilot 会自动补全实现骨架
class StripeProcessor implements PaymentProcessor {
  // Copilot 生成...
}
```

**技巧 3：示例驱动**

提供输入/输出示例，Copilot 会推断算法逻辑：

```typescript
// 将 camelCase 转为 snake_case
// "userName" -> "user_name"
// "HTTPResponseCode" -> "http_response_code"
// "getUserID" -> "get_user_id"
function camelToSnake(input: string): string {
  // Copilot 基于示例推断正则替换逻辑
}
```

### 4.3 JetBrains 与 Vim 中的 Copilot

**JetBrains (IntelliJ / WebStorm / PyCharm)**：
- 安装 GitHub Copilot 插件
- 补全快捷键：`Tab` 接受，`Alt + [` / `Alt + ]` 切换建议
- Copilot Chat 作为工具窗口集成
- 支持 `@workspace` 和自定义指令

**Vim / Neovim**：
- 使用 `zbirenbaum/copilot.lua`（Neovim 推荐）或 `github/copilot.vim`
- 配置 Lua 键位映射：

```lua
-- Neovim + copilot.lua 配置
require("copilot").setup({
  suggestion = {
    enabled = true,
    auto_trigger = true,
    keymap = {
      accept = "<Tab>",
      accept_word = "<C-l>",
      accept_line = "<C-j>",
      next = "<M-]>",
      prev = "<M-[>",
      dismiss = "<C-]>",
    },
  },
  panel = { enabled = true },
  filetypes = {
    markdown = true,
    yaml = true,
    ["."] = false,
  },
})
```

### 4.4 Copilot 的企业级配置

对于团队使用，GitHub Copilot 提供了策略和配置管理：

```yaml
# .github/copilot.yml — 团队级 Copilot 配置（概念性）
copilot:
  instructions:
    - "All TypeScript code must use strict mode"
    - "Prefer functional programming patterns"
    - "Always handle errors explicitly, never swallow exceptions"
    - "Use early returns to reduce nesting"
  blocked_patterns:
    - "eval("
    - "Function("
    - "innerHTML = "
  suggested_libraries:
    - "zod for validation"
    - "vitest for testing"
    - "msw for API mocking"
```

---

## 五、AI 生成代码审查方法论

AI 不仅可以生成代码，还可以作为代码审查者。系统化的 AI 审查流程可以发现人类审查者容易遗漏的问题。

### 5.1 三级审查模型

**L1 — 语法与风格审查**：
- TypeScript 类型完整性检查
- ESLint / Prettier 规则遵守
- 命名规范一致性
- 死代码和未使用导入检测

**L2 — 逻辑与安全审查**：
- 潜在的空指针和越界访问
- 异步代码中的竞争条件
- SQL 注入、XSS、CSRF 漏洞
- 硬编码密钥和敏感信息泄露
- 性能陷阱（N+1 查询、内存泄漏）

**L3 — 架构与设计审查**：
- 单一职责原则遵守情况
- 依赖关系是否合理
- 是否引入不必要的复杂度
- 与现有代码模式的一致性
- 可测试性和可维护性评估

### 5.2 AI 审查 Prompt 模板

```markdown
## Role
You are a senior TypeScript engineer specializing in security and performance.
You have deep expertise in Node.js, React, and database optimization.

## Context
Repository: Next.js 15 + TypeScript + Prisma + tRPC
Review scope: Pull Request diff (provided below)
Team conventions:
- All public APIs must have Zod validation
- Database queries must use Prisma's include/select efficiently
- Server Components by default, Client Components only when needed
- Error handling must use the Result<T, E> pattern

## Tasks
1. **Security Scan**: Check for SQL injection, XSS, auth bypass, insecure deserialization
2. **Type Safety**: Verify no implicit any, all edge cases handled, strict null checks
3. **Performance**: Identify N+1 queries, missing indexes, unnecessary re-renders, large bundle imports
4. **Architecture**: Assess if changes follow clean architecture, if responsibilities are properly separated
5. **Testing**: Check if new code has adequate test coverage, edge cases tested

## Output Format
For each finding, output in this structure:
- **Severity**: [Critical / Warning / Info]
- **Category**: [Security / Performance / Type Safety / Architecture / Testing]
- **Location**: file.ts:line:column
- **Issue**: Clear description of the problem
- **Suggestion**: Concrete code fix or refactoring recommendation
- **Rationale**: Why this matters in the specific context

## Diff to Review
\`\`\`diff
{{DIFF}}
\`\`\`
```

### 5.3 自动化审查流水线

将 AI 审查集成到 CI/CD：

```yaml
# .github/workflows/ai-review.yml
name: AI Code Review
on: [pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Generate diff
        run: git diff origin/main...HEAD > pr.diff

      - name: AI Security Review
        run: |
          cat pr.diff | claude review \
            --prompt "security-focused TypeScript review" \
            --format json > ai-security-report.json

      - name: AI Performance Review
        run: |
          cat pr.diff | claude review \
            --prompt "performance and architecture review" \
            --format json > ai-perf-report.json

      - name: Post findings as PR comments
        uses: actions/github-script@v7
        with:
          script: |
            // Parse AI reports and post structured PR comments
```

---

## 六、AI 辅助重构工作流

重构是 AI 辅助编程中最有价值的应用场景之一。AI 可以在保持行为不变的前提下，改善代码结构、提升可读性、降低复杂度。

### 6.1 重构决策树

```
是否需要重构？
  ├─ 代码重复 > 3 次？ → 提取函数/组件/工具
  ├─ 函数长度 > 50 行？ → 分解为更小函数
  ├─ 嵌套深度 > 3 层？ → 使用卫语句或策略模式
  ├─ 类型使用 any？ → 添加精确类型
  ├─ 测试覆盖率 < 80%？ → 补全测试后重构
  └─ 性能热点？ → 使用 AI 分析并优化算法
```

### 6.2 AI 重构的五种模式

**模式 1：提取与内联**

```typescript
// 重构前：重复逻辑
function processOrder(order: Order) {
  if (!order.items || order.items.length === 0) {
    throw new Error("Order must have items");
  }
  if (order.total <= 0) {
    throw new Error("Order total must be positive");
  }
  // ... 处理逻辑
}

function processRefund(refund: Refund) {
  if (!refund.items || refund.items.length === 0) {
    throw new Error("Refund must have items");
  }
  if (refund.total <= 0) {
    throw new Error("Refund total must be positive");
  }
  // ... 处理逻辑
}

// AI Prompt: "提取公共校验逻辑到独立函数，使用类型谓词"
// 重构后：
interface Validatable {
  items: unknown[];
  total: number;
}

function isValidTransaction<T extends Validatable>(data: T): data is T {
  return Array.isArray(data.items) && data.items.length > 0 && data.total > 0;
}

function processOrder(order: Order) {
  if (!isValidTransaction(order)) {
    throw new Error("Invalid order: must have items and positive total");
  }
  // ... 处理逻辑
}
```

**模式 2：策略模式替代条件分支**

```typescript
// 重构前：长 switch/if-else
function calculateShipping(method: string, weight: number): number {
  if (method === "standard") return weight * 2.5;
  if (method === "express") return weight * 5 + 10;
  if (method === "overnight") return weight * 10 + 25;
  return 0;
}

// AI Prompt: "将条件分支重构为策略模式，使用 Record 映射"
// 重构后：
type ShippingMethod = "standard" | "express" | "overnight";

interface ShippingStrategy {
  calculate(weight: number): number;
}

const strategies: Record<ShippingMethod, ShippingStrategy> = {
  standard: { calculate: (w) => w * 2.5 },
  express: { calculate: (w) => w * 5 + 10 },
  overnight: { calculate: (w) => w * 10 + 25 },
};

function calculateShipping(method: ShippingMethod, weight: number): number {
  const strategy = strategies[method];
  if (!strategy) throw new Error(`Unknown shipping method: ${method}`);
  return strategy.calculate(weight);
}
```

**模式 3：异步流程优化**

```typescript
// 重构前：顺序执行，未利用并发
async function loadDashboardData(userId: string) {
  const user = await fetchUser(userId);
  const orders = await fetchOrders(userId);
  const preferences = await fetchPreferences(userId);
  const notifications = await fetchNotifications(userId);
  return { user, orders, preferences, notifications };
}

// AI Prompt: "优化为并行获取，添加错误隔离"
// 重构后：
async function loadDashboardData(userId: string) {
  const [userResult, ordersResult, preferencesResult, notificationsResult] = await Promise.allSettled([
    fetchUser(userId),
    fetchOrders(userId),
    fetchPreferences(userId),
    fetchNotifications(userId),
  ]);

  return {
    user: userResult.status === "fulfilled" ? userResult.value : null,
    orders: ordersResult.status === "fulfilled" ? ordersResult.value : [],
    preferences: preferencesResult.status === "fulfilled" ? preferencesResult.value : {},
    notifications: notificationsResult.status === "fulfilled" ? notificationsResult.value : [],
    errors: [
      userResult.status === "rejected" ? `user: ${userResult.reason}` : null,
      ordersResult.status === "rejected" ? `orders: ${ordersResult.reason}` : null,
    ].filter(Boolean),
  };
}
```

**模式 4：类型安全强化**

```typescript
// 重构前：松散类型
function handleEvent(event: any) {
  if (event.type === "click") {
    console.log(event.target.id);
  }
}

// AI Prompt: "使用 discriminated union 实现穷尽类型检查"
// 重构后：
type UIEvent =
  | { type: "click"; target: { id: string }; timestamp: number }
  | { type: "input"; value: string; field: string }
  | { type: "scroll"; position: { x: number; y: number } }
  | { type: "resize"; size: { width: number; height: number } };

function handleEvent(event: UIEvent): void {
  switch (event.type) {
    case "click":
      console.log(event.target.id);
      break;
    case "input":
      console.log(`${event.field}: ${event.value}`);
      break;
    case "scroll":
      console.log(`Scrolled to ${event.position.x}, ${event.position.y}`);
      break;
    case "resize":
      console.log(`Window resized to ${event.size.width}x${event.size.height}`);
      break;
    default:
      // TypeScript 编译时穷尽检查：如果添加新事件类型但未处理，此处报错
      const _exhaustive: never = event;
      throw new Error(`Unhandled event type: ${_exhaustive}`);
  }
}
```

**模式 5：函数式重构**

```typescript
// 重构前：命令式循环
function getActiveUsers(users: User[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].active && users[i].emailVerified) {
      result.push(users[i].email);
    }
  }
  return result;
}

// AI Prompt: "重构为声明式函数式风格，使用管道"
// 重构后：
const getActiveUsers = (users: User[]): string[] =>
  users
    .filter((u) => u.active && u.emailVerified)
    .map((u) => u.email);
```

---

## 七、代码生成提示工程

提示工程（Prompt Engineering）在 AI 辅助编程中直接决定输出质量。结构化、上下文丰富的提示能将生成准确率从 60% 提升到 90%+。

### 7.1 结构化提示框架

```markdown
## ROLE
你是一位拥有 10 年经验的 TypeScript 架构师，专长于高性能后端系统和类型安全设计。

## CONTEXT
- 项目使用 Node.js 20 + TypeScript 5.4
- 运行时为 Bun，使用原生 TypeScript 支持
- 数据库为 PostgreSQL，通过 Drizzle ORM 访问
- 所有 API 使用 Hono 框架
- 代码风格要求：函数式优先，显式类型，早返回

## TASK
{{具体任务描述}}

## CONSTRAINTS
- 不使用 any 类型
- 所有外部输入必须使用 Zod 校验
- 异步函数必须处理错误，不抛出未处理的 Promise
- 单元测试使用 Bun 内置测试运行器
- 性能敏感路径避免不必要的对象分配

## OUTPUT FORMAT
- 仅输出代码和必要注释
- 每个公共函数附带 JSDoc
- 包含使用示例
- 包含边界条件处理说明
```

### 7.2 上下文窗口管理

当前主流模型的上下文窗口：

| 模型 | 上下文窗口 | 代码适用性 |
|------|-----------|-----------|
| GPT-4o | 128K tokens | ~300 个文件摘要 |
| Claude 3.7 Sonnet | 200K tokens | ~500 个文件摘要 |
| Claude 3 Opus | 200K tokens | 复杂架构设计 |
| GPT-4o-mini | 128K tokens | 简单函数生成 |
| DeepSeek-Coder-V2 | 128K tokens | 代码专用，性价比高 |

**上下文优化策略**：

1. **分层摘要**：不要一次性发送整个代码库，而是发送目录结构 + 关键文件 + 当前文件
2. **符号引用**：使用 `@symbol` 或显式粘贴相关接口定义
3. **差异最小化**：只发送与任务相关的代码段，而非完整文件
4. **链式提示**：将复杂任务拆分为多个连续提示，每步验证结果

### 7.3 RAG（检索增强生成）在代码中的应用

RAG 通过将项目知识库作为外部上下文，显著提升 AI 对大型代码库的理解：

```typescript
// rag-pipeline.ts — 简化的代码库 RAG 流程
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

interface CodeChunk {
  content: string;
  filePath: string;
  lineStart: number;
  lineEnd: number;
  type: "function" | "class" | "interface" | "type" | "comment";
}

async function indexCodebase(files: string[]): Promise<MemoryVectorStore> {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
    separators: ["\nclass ", "\ninterface ", "\nfunction ", "\nexport ", "\n"],
  });

  const documents = await Promise.all(
    files.map(async (file) => {
      const content = await Bun.file(file).text();
      return splitter.createDocuments([content], [{ source: file }]);
    })
  );

  const flatDocs = documents.flat();
  const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
  return MemoryVectorStore.fromDocuments(flatDocs, embeddings);
}

async function queryCodebase(store: MemoryVectorStore, question: string): Promise<string> {
  const results = await store.similaritySearch(question, 5);
  return results.map((r) => `// ${r.metadata.source}\n${r.pageContent}`).join("\n\n");
}

// 使用示例：
// const store = await indexCodebase(glob("src/**/*.ts"));
// const context = await queryCodebase(store, "用户认证中间件怎么实现的？");
// // 将 context 注入到 AI 提示中
```

### 7.4 少样本提示（Few-Shot Prompting）

为 AI 提供输入/输出示例，引导其遵循特定模式：

```markdown
## 示例 1：错误处理
输入：
```typescript
function parseConfig(data: string) {
  return JSON.parse(data);
}
```

输出：
```typescript
import { z } from "zod";

const ConfigSchema = z.object({
  port: z.number().min(1).max(65535),
  host: z.string().min(1),
  debug: z.boolean().default(false),
});

type Config = z.infer<typeof ConfigSchema>;

function parseConfig(data: string): Result<Config, ConfigError> {
  try {
    const parsed = JSON.parse(data);
    const validated = ConfigSchema.safeParse(parsed);
    if (!validated.success) {
      return err(new ConfigError("Invalid config format", validated.error));
    }
    return ok(validated.data);
  } catch (e) {
    return err(new ConfigError("Invalid JSON", e));
  }
}
```

## 示例 2：类型守卫
...（更多示例）

## 实际任务
（基于以上模式，处理新输入）
```

---

## 八、AI 幻觉检测

AI 幻觉（Hallucination）在代码生成中表现为：编造不存在的 API、错误的函数签名、虚构的依赖包、或逻辑上不可能的执行路径。

### 8.1 常见幻觉类型

| 类型 | 示例 | 检测方法 |
|------|------|---------|
| **API 幻觉** | `import { useAuth } from "next-auth/react"`（实际不存在） | 自动导入检查 |
| **类型幻觉** | `interface User { id: UUID }`（未定义 UUID 类型） | tsc 编译 |
| **逻辑幻觉** | `if (user === null && user.name)`（矛盾条件） | 静态分析 |
| **版本幻觉** | `import { signal } from "@preact/signals-react"`（旧版包名） | 依赖检查 |
| **文档幻觉** | "Bun 不支持 SQLite"（事实错误） | 交叉验证 |

### 8.2 自动化检测流程

```typescript
// hallucination-detector.ts — AI 生成代码的自动化校验
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";

interface ValidationResult {
  passed: boolean;
  stage: "syntax" | "types" | "imports" | "tests" | "lint";
  errors: string[];
}

class HallucinationDetector {
  private sourceCode: string;
  private filePath: string;

  constructor(sourceCode: string, filePath: string) {
    this.sourceCode = sourceCode;
    this.filePath = filePath;
  }

  // 阶段 1：语法检查
  checkSyntax(): ValidationResult {
    try {
      // 使用 TypeScript 编译器检查语法
      execSync(`npx tsc --noEmit --skipLibCheck --target ES2022 --module NodeNext --moduleResolution NodeNext ${this.filePath}`, {
        encoding: "utf-8",
        timeout: 30000,
      });
      return { passed: true, stage: "syntax", errors: [] };
    } catch (err) {
      const output = err instanceof Error ? err.message : String(err);
      return { passed: false, stage: "syntax", errors: [output] };
    }
  }

  // 阶段 2：导入解析检查
  checkImports(): ValidationResult {
    const importRegex = /from\s+["']([^"']+)["']/g;
    const imports: string[] = [];
    let match;
    while ((match = importRegex.exec(this.sourceCode)) !== null) {
      imports.push(match[1]);
    }

    const errors: string[] = [];
    for (const imp of imports) {
      // 排除相对导入和 Node 内置模块
      if (imp.startsWith(".") || imp.startsWith("node:")) continue;
      try {
        require.resolve(imp);
      } catch {
        errors.push(`Unresolved import: ${imp}`);
      }
    }

    return { passed: errors.length === 0, stage: "imports", errors };
  }

  // 阶段 3：类型检查
  checkTypes(): ValidationResult {
    try {
      execSync(`npx tsc --noEmit --strict ${this.filePath}`, {
        encoding: "utf-8",
        timeout: 60000,
      });
      return { passed: true, stage: "types", errors: [] };
    } catch (err) {
      const output = err instanceof Error ? err.message : String(err);
      return { passed: false, stage: "types", errors: [output] };
    }
  }

  // 阶段 4：运行测试
  checkTests(): ValidationResult {
    try {
      execSync(`npx vitest run --reporter=verbose ${this.filePath}`, {
        encoding: "utf-8",
        timeout: 60000,
      });
      return { passed: true, stage: "tests", errors: [] };
    } catch (err) {
      const output = err instanceof Error ? err.message : String(err);
      return { passed: false, stage: "tests", errors: [output] };
    }
  }

  async validateAll(): Promise<ValidationResult[]> {
    return [
      this.checkSyntax(),
      this.checkImports(),
      this.checkTypes(),
      this.checkTests(),
    ];
  }
}

// 使用示例：
// const detector = new HallucinationDetector(aiGeneratedCode, "/tmp/ai-output.ts");
// const results = await detector.validateAll();
// const hasHallucination = results.some((r) => !r.passed);
```

### 8.3 人工审查清单

1. **API 真实性**：所有导入的函数/类是否真实存在于文档中？
2. **类型一致性**：返回值类型是否与文档描述一致？
3. **边界条件**：空输入、极大值、并发场景是否被处理？
4. **副作用**：函数是否有未声明的副作用（全局状态修改、I/O）？
5. **性能假设**：算法复杂度是否合理？是否有隐藏的 O(n²) 循环？
6. **安全审查**：是否使用了不安全的 API（eval、innerHTML、未经校验的输入）？

---

## 九、团队 AI 工作流

AI 工具在团队环境中的使用需要明确的规范和流程，以避免代码质量下降、知识产权风险和协作混乱。

### 9.1 代码所有权与 AI 贡献

**AI 生成代码的归属原则**：

1. **人类审查者负责**：提交 AI 生成代码的开发者对代码负全责
2. **理解后再提交**：禁止提交开发者无法解释的 AI 代码
3. **变更标注**：在 Git 提交信息中标注 AI 辅助程度（`[AI-assisted]`、`[AI-generated]`）
4. **关键路径限制**：核心算法、安全模块、财务逻辑必须经过人工完全重写

**Git 提交规范**：

```bash
# 完全由 AI 生成（经人工审查）
git commit -m "feat(auth): add OAuth2 login flow [AI-generated]"

# AI 辅助，人工修改
git commit -m "refactor(api): optimize query builder [AI-assisted]"

# 纯人工编写
git commit -m "fix(parser): handle nested JSON edge case"
```

### 9.2 审查流程设计

```
开发者编写/AI 生成代码
        ↓
    AI 预审查（L1/L2 自动检查）
        ↓
    开发者自审（理解 + 测试）
        ↓
    提交 Pull Request
        ↓
    CI 流水线（类型检查 + 测试 + Lint）
        ↓
    AI 辅助审查（安全 + 性能扫描）
        ↓
    人工审查（架构 + 业务逻辑）
        ↓
    合并
```

### 9.3 知识产权与合规

**关键风险**：
- **许可证污染**：AI 可能生成与 GPL 代码相似的片段
- **商业秘密泄露**：向公共 AI 服务发送专有代码
- **专利侵权**：AI 可能建议受专利保护的方法

**缓解措施**：

1. **使用企业版/私有部署**：GitHub Copilot Business、Cursor Enterprise、自托管模型
2. **代码隔离**：禁止向公共 AI 发送包含密钥、PII、核心算法的代码
3. **许可证扫描**：在 CI 中运行 FOSSology 或 ScanCode 检测相似代码
4. **政策文档**：制定团队 AI 使用政策，明确允许和禁止的场景

```markdown
# AI 使用政策示例

## 允许使用 AI 的场景
- 生成单元测试和测试数据
- 文档和注释撰写
- 常见模式的代码补全（CRUD、表单验证）
- 重构建议和性能优化
- 学习新技术和框架

## 禁止或限制的场景
- 生成加密算法或安全模块
- 处理个人身份信息（PII）的代码
- 核心商业逻辑（定价、推荐算法）
- 向公共 AI 发送生产环境配置和密钥
- 直接复制 AI 输出而不理解其含义

## 合规检查清单
- [ ] 代码经过类型检查和测试
- [ ] 不包含硬编码密钥或凭据
- [ ] 不违反开源许可证
- [ ] 经过至少一名人类审查者批准
- [ ] 提交信息标注 AI 使用情况
```

### 9.4 知识库构建

将团队规范、架构决策记录（ADR）、常用模式纳入 AI 上下文：

```typescript
// .cursorrules / knowledge-base/
// team-standards.md
/**
 * ## 错误处理规范
 * - 使用 Result<T, E> 模式替代 throw
 * - 所有异步函数返回 Promise<Result<T, E>>
 * - 错误必须包含 error code 和 human-readable message
 *
 * ## 数据库规范
 * - 所有查询使用 Drizzle ORM，禁止原始 SQL（除复杂报表外）
 * - 每个表必须有 created_at 和 updated_at
 * - 外键必须创建索引
 *
 * ## API 规范
 * - REST 端点使用 /api/v1/ 前缀
 * - 响应格式: { success: boolean, data: T, error?: { code, message } }
 * - 分页参数: page, pageSize (max 100)
 */
```

---

## 十、TypeScript 协作模式示例

以下 10+ 示例展示 AI-human 协作的典型模式，每个示例都可以直接运行或稍作修改后集成到项目中。

### 示例 1：AI 辅助类型安全重构（Zod + 运行时校验）

```typescript
// example-01-zod-validation.ts
/**
 * AI Prompt: "为 processUser 添加 Zod 校验和严格类型，
 * 拒绝 any，使用 unknown 输入，生成 Vitest 测试"
 */

import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"]),
  tags: z.array(z.string()).max(10).default([]),
});

type User = z.infer<typeof UserSchema>;

class ValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: z.ZodIssue[]
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

function processUser(data: unknown): User {
  const parsed = UserSchema.safeParse(data);
  if (!parsed.success) {
    throw new ValidationError("Invalid user data", parsed.error.issues);
  }
  return parsed.data;
}

// AI 生成的测试
import { describe, it, expect } from "vitest";

describe("processUser", () => {
  it("parses valid user", () => {
    const result = processUser({
      name: "Alice",
      age: 30,
      email: "alice@example.com",
      role: "admin",
      tags: ["engineering"],
    });
    expect(result.name).toBe("Alice");
    expect(result.tags).toEqual(["engineering"]);
  });

  it("rejects negative age", () => {
    expect(() =>
      processUser({
        name: "Bob",
        age: -1,
        email: "bob@example.com",
        role: "editor",
      })
    ).toThrow(ValidationError);
  });

  it("rejects invalid email", () => {
    expect(() =>
      processUser({
        name: "Carol",
        age: 25,
        email: "not-an-email",
        role: "viewer",
      })
    ).toThrow(ValidationError);
  });

  it("provides detailed error issues", () => {
    try {
      processUser({ name: "", age: 200, email: "bad", role: "superuser" });
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).issues.length).toBeGreaterThanOrEqual(3);
    }
  });
});
```

### 示例 2：AI 生成结构化输出与代码审查流水线

```typescript
// example-02-structured-review.ts
/**
 * AI Prompt: "使用 Vercel AI SDK 的 generateObject 实现自动化代码审查，
 * 输出结构化 JSON，包含 severity、line、message、fix"
 */

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const ReviewSchema = z.object({
  summary: z.string().describe("变更的简短摘要"),
  issues: z.array(
    z.object({
      severity: z.enum(["critical", "warning", "info"]),
      category: z.enum(["security", "performance", "type-safety", "maintainability"]),
      line: z.number().describe("问题所在行号"),
      message: z.string().describe("问题描述"),
      suggestion: z.string().describe("具体的修复建议"),
      fixedCode: z.string().optional().describe("建议的修复后代码"),
    })
  ),
  score: z.number().min(0).max(10).describe("整体代码质量评分"),
  testRecommendations: z
    .array(z.string())
    .describe("建议补充的测试场景"),
});

type ReviewResult = z.infer<typeof ReviewSchema>;

async function reviewCodeDiff(diff: string, context: string): Promise<ReviewResult> {
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: ReviewSchema,
    system: `You are a senior TypeScript security engineer. 
Review code diffs for: SQL injection, XSS, type safety issues, 
performance traps, and maintainability concerns. 
Be specific with line numbers and provide concrete fix suggestions.`,
    prompt: `Review the following code diff in context of ${context}:\n\n${diff}`,
  });

  return object;
}

// 使用示例
async function demoReview(): Promise<void> {
  const sampleDiff = `
+ function getUser(query: string) {
+   return db.query(\`SELECT * FROM users WHERE name = '\${query}'\`);
+ }
`;

  const review = await reviewCodeDiff(sampleDiff, "Node.js API route handling user search");
  console.log(`Review score: ${review.score}/10`);
  console.log(`Issues found: ${review.issues.length}`);
  review.issues.forEach((issue) => {
    console.log(`[${issue.severity.toUpperCase()}] Line ${issue.line}: ${issue.message}`);
    console.log(`  Suggestion: ${issue.suggestion}`);
    if (issue.fixedCode) {
      console.log(`  Fix: ${issue.fixedCode}`);
    }
  });
}

export { reviewCodeDiff, ReviewSchema, type ReviewResult };
```

### 示例 3：AI 辅助实现结果类型与错误处理模式

```typescript
// example-03-result-type.ts
/**
 * AI Prompt: "实现一个 Rust 风格的 Result<T, E> 类型，
 * 包含 map、flatMap、match 方法，完全类型安全"
 */

interface Ok<T> {
  readonly kind: "ok";
  readonly value: T;
}

interface Err<E> {
  readonly kind: "err";
  readonly error: E;
}

type Result<T, E> = Ok<T> | Err<E>;

function ok<T>(value: T): Ok<T> {
  return { kind: "ok", value };
}

function err<E>(error: E): Err<E> {
  return { kind: "err", error };
}

function isOk<T, E>(result: Result<T, E>): result is Ok<T> {
  return result.kind === "ok";
}

function isErr<T, E>(result: Result<T, E>): result is Err<E> {
  return result.kind === "err";
}

class ResultOps<T, E> {
  constructor(private readonly result: Result<T, E>) {}

  map<U>(fn: (value: T) => U): ResultOps<U, E> {
    return new ResultOps(isOk(this.result) ? ok(fn(this.result.value)) : this.result);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): ResultOps<U, E> {
    return new ResultOps(isOk(this.result) ? fn(this.result.value) : this.result);
  }

  mapErr<F>(fn: (error: E) => F): ResultOps<T, F> {
    return new ResultOps(isErr(this.result) ? err(fn(this.result.error)) : this.result);
  }

  unwrap(): T {
    if (isErr(this.result)) {
      throw new Error(`Called unwrap on Err: ${String(this.result.error)}`);
    }
    return this.result.value;
  }

  unwrapOr(defaultValue: T): T {
    return isOk(this.result) ? this.result.value : defaultValue;
  }

  match<U>(onOk: (value: T) => U, onErr: (error: E) => U): U {
    return isOk(this.result) ? onOk(this.result.value) : onErr(this.result.error);
  }

  toResult(): Result<T, E> {
    return this.result;
  }
}

function result<T, E>(r: Result<T, E>): ResultOps<T, E> {
  return new ResultOps(r);
}

// 实际应用：类型安全的文件读取
import { readFile } from "node:fs/promises";

class FileReadError extends Error {
  constructor(
    message: string,
    public readonly path: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "FileReadError";
  }
}

async function readJsonFile<T>(path: string): Promise<Result<T, FileReadError>> {
  try {
    const content = await readFile(path, "utf-8");
    return ok(JSON.parse(content) as T);
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return err(
      new FileReadError(`Failed to read ${path}: ${err.message}`, path, (e as NodeJS.ErrnoException).code ?? "UNKNOWN")
    );
  }
}

// 使用示例
async function demoResult(): Promise<void> {
  const configResult = await readJsonFile<{ port: number }>("config.json");

  const port = result(configResult)
    .map((cfg) => cfg.port)
    .mapErr((e) => `Config error: ${e.message}`)
    .unwrapOr(3000);

  console.log(`Server will start on port ${port}`);
}

export { ok, err, isOk, isErr, result, ResultOps, type Result, type Ok, type Err, readJsonFile, FileReadError };
```

### 示例 4：AI 生成带泛型的缓存装饰器

```typescript
// example-04-typed-cache.ts
/**
 * AI Prompt: "实现一个类型安全的记忆化装饰器，支持 TTL 和缓存键自定义，
 * 能够正确推断泛型参数"
 */

interface CacheEntry<V> {
  value: V;
  expiresAt: number;
}

interface MemoizeOptions<K, V> {
  ttl?: number; // 毫秒
  keyGenerator?: (...args: K[]) => string;
  storage?: Map<string, CacheEntry<V>>;
}

function memoize<T extends (...args: any[]) => any>(
  options: MemoizeOptions<Parameters<T>[number], ReturnType<T>> = {}
): (target: T) => T {
  const { ttl = Infinity, keyGenerator, storage = new Map() } = options;

  return (fn: T): T => {
    const cached = ((...args: Parameters<T>): ReturnType<T> => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      const entry = storage.get(key);

      if (entry && (ttl === Infinity || Date.now() < entry.expiresAt)) {
        return entry.value;
      }

      const result = fn(...args);
      storage.set(key, {
        value: result,
        expiresAt: Date.now() + ttl,
      });

      return result;
    }) as T;

    // 暴露缓存操作方法
    (cached as any).clearCache = () => storage.clear();
    (cached as any).cacheSize = () => storage.size;

    return cached;
  };
}

// 使用示例
class DataService {
  @memoize({ ttl: 5000 })
  async fetchUser(userId: string): Promise<{ id: string; name: string }> {
    console.log(`Fetching user ${userId} from API...`);
    // 模拟 API 调用
    await new Promise((r) => setTimeout(r, 100));
    return { id: userId, name: `User ${userId}` };
  }

  @memoize({
    keyGenerator: (a: number, b: number) => `sum:${a}:${b}`,
  })
  calculateExpensive(a: number, b: number): number {
    console.log(`Computing ${a} + ${b}...`);
    // 模拟耗时计算
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += a + b;
    }
    return sum;
  }
}

// 注意：TypeScript 实验性装饰器需要在 tsconfig.json 中启用
// "experimentalDecorators": true

export { memoize, type CacheEntry, type MemoizeOptions };
```

### 示例 5：AI 辅助实现事件总线（类型安全发布订阅）

```typescript
// example-05-typed-eventbus.ts
/**
 * AI Prompt: "实现一个完全类型安全的事件总线，支持事件名称和载荷的类型推断，
 * 支持通配符监听和一次性监听器"
 */

type EventMap = Record<string, unknown>;

type EventHandler<T> = (payload: T) => void | Promise<void>;

interface EventSubscription {
  unsubscribe(): void;
}

class TypedEventBus<Events extends EventMap> {
  private listeners: {
    [K in keyof Events]?: Array<{ handler: EventHandler<Events[K]>; once: boolean }>;
  } = {};

  private wildcards: Array<{
    pattern: RegExp;
    handler: (eventName: string, payload: unknown) => void;
  }> = [];

  on<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): EventSubscription {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push({ handler, once: false });

    return {
      unsubscribe: () => {
        const arr = this.listeners[event];
        if (arr) {
          const idx = arr.findIndex((l) => l.handler === handler);
          if (idx !== -1) arr.splice(idx, 1);
        }
      },
    };
  }

  once<K extends keyof Events>(
    event: K,
    handler: EventHandler<Events[K]>
  ): EventSubscription {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push({ handler, once: true });

    return {
      unsubscribe: () => {
        const arr = this.listeners[event];
        if (arr) {
          const idx = arr.findIndex((l) => l.handler === handler);
          if (idx !== -1) arr.splice(idx, 1);
        }
      },
    };
  }

  onWildcard(
    pattern: string,
    handler: (eventName: string, payload: unknown) => void
  ): EventSubscription {
    const regex = new RegExp(
      "^" + pattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$"
    );
    this.wildcards.push({ pattern: regex, handler });

    return {
      unsubscribe: () => {
        const idx = this.wildcards.findIndex((w) => w.handler === handler);
        if (idx !== -1) this.wildcards.splice(idx, 1);
      },
    };
  }

  emit<K extends keyof Events>(event: K, payload: Events[K]): void {
    // 精确匹配
    const handlers = this.listeners[event];
    if (handlers) {
      const toRemove: number[] = [];
      handlers.forEach((listener, idx) => {
        listener.handler(payload);
        if (listener.once) toRemove.push(idx);
      });
      // 倒序删除避免索引偏移
      toRemove.reverse().forEach((idx) => handlers.splice(idx, 1));
    }

    // 通配符匹配
    const eventName = String(event);
    this.wildcards.forEach((w) => {
      if (w.pattern.test(eventName)) {
        w.handler(eventName, payload);
      }
    });
  }

  removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
      this.wildcards = [];
    }
  }
}

// 使用示例
interface AppEvents {
  "user:login": { userId: string; timestamp: number };
  "user:logout": { userId: string; timestamp: number };
  "error": { message: string; stack?: string; severity: "low" | "high" };
  "data:sync": { table: string; rows: number };
}

const bus = new TypedEventBus<AppEvents>();

// 类型安全：TypeScript 会推断 payload 类型
bus.on("user:login", (payload) => {
  console.log(`User ${payload.userId} logged in at ${payload.timestamp}`);
});

bus.on("error", (payload) => {
  console.error(`[${payload.severity}] ${payload.message}`);
});

// 通配符监听
bus.onWildcard("user:*", (eventName, payload) => {
  console.log(`User event: ${eventName}`, payload);
});

// 触发事件
bus.emit("user:login", { userId: "123", timestamp: Date.now() });

export { TypedEventBus, type EventMap, type EventHandler, type EventSubscription };
```

### 示例 6：AI 生成有限状态机（FSM）

```typescript
// example-06-fsm.ts
/**
 * AI Prompt: "实现一个编译时类型安全的有限状态机，
 * 状态转移在类型层面被约束，禁止非法转移"
 */

type StateDefinition = Record<string, Record<string, string>>;

type States<T extends StateDefinition> = keyof T;
type Events<T extends StateDefinition> = {
  [K in keyof T]: keyof T[K];
}[keyof T];

type Transition<T extends StateDefinition, S extends States<T>> = T[S];

type TargetState<
  T extends StateDefinition,
  S extends States<T>,
  E extends keyof T[S]
> = T[S][E];

class StateMachine<T extends StateDefinition> {
  private state: States<T>;
  private readonly transitions: T;
  private readonly handlers: Map<string, Array<(from: string, to: string, event: string) => void>> = new Map();

  constructor(initialState: States<T>, transitions: T) {
    this.state = initialState;
    this.transitions = transitions;
  }

  get currentState(): States<T> {
    return this.state;
  }

  can<E extends keyof T[States<T>]>(event: E): boolean {
    return event in this.transitions[this.state];
  }

  transition<S extends States<T>, E extends keyof T[S]>(
    event: E
  ): TargetState<T, S, E> {
    const currentTransitions = this.transitions[this.state];
    const nextState = currentTransitions?.[event as string];

    if (!nextState) {
      throw new Error(
        `Invalid transition: event "${String(event)}" from state "${String(this.state)}"`
      );
    }

    const from = this.state;
    this.state = nextState as States<T>;

    // 触发监听器
    const listeners = this.handlers.get(String(event)) ?? [];
    listeners.forEach((h) => h(String(from), String(this.state), String(event)));

    return this.state as TargetState<T, S, E>;
  }

  onTransition(event: string, handler: (from: string, to: string, event: string) => void): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event)!.push(handler);

    return () => {
      const arr = this.handlers.get(event);
      if (arr) {
        const idx = arr.indexOf(handler);
        if (idx !== -1) arr.splice(idx, 1);
      }
    };
  }
}

// 定义订单状态机
const orderTransitions = {
  pending: { submit: "confirmed", cancel: "cancelled" },
  confirmed: { ship: "shipped", refund: "refunded" },
  shipped: { deliver: "delivered", lost: "refunded" },
  delivered: { return: "returned" },
  returned: { restock: "restocked" },
  cancelled: {},
  refunded: {},
  restocked: {},
} as const;

type OrderStateMachine = StateMachine<typeof orderTransitions>;

// 使用
const orderFsm = new StateMachine("pending", orderTransitions);

orderFsm.onTransition("submit", (from, to) => {
  console.log(`Order ${from} → ${to}`);
});

console.log(orderFsm.currentState); // "pending"
orderFsm.transition("submit");      // → "confirmed"
console.log(orderFsm.currentState); // "confirmed"
// orderFsm.transition("deliver");  // ❌ 运行时错误：confirmed 没有 deliver 事件

export { StateMachine, type StateDefinition, type States, type Events };
```

### 示例 7：AI 辅助实现管道（Pipe）与组合（Compose）

```typescript
// example-07-pipe-compose.ts
/**
 * AI Prompt: "实现类型安全的 pipe 和 compose 函数，
 * 支持任意数量函数组合，保持类型推断"
 */

type UnaryFn<A, B> = (a: A) => B;

function pipe<A>(a: A): A;
function pipe<A, B>(a: A, f1: UnaryFn<A, B>): B;
function pipe<A, B, C>(a: A, f1: UnaryFn<A, B>, f2: UnaryFn<B, C>): C;
function pipe<A, B, C, D>(a: A, f1: UnaryFn<A, B>, f2: UnaryFn<B, C>, f3: UnaryFn<C, D>): D;
function pipe<A, B, C, D, E>(
  a: A,
  f1: UnaryFn<A, B>,
  f2: UnaryFn<B, C>,
  f3: UnaryFn<C, D>,
  f4: UnaryFn<D, E>
): E;
function pipe<A, B, C, D, E, F>(
  a: A,
  f1: UnaryFn<A, B>,
  f2: UnaryFn<B, C>,
  f3: UnaryFn<C, D>,
  f4: UnaryFn<D, E>,
  f5: UnaryFn<E, F>
): F;
function pipe<A, B, C, D, E, F, G>(
  a: A,
  f1: UnaryFn<A, B>,
  f2: UnaryFn<B, C>,
  f3: UnaryFn<C, D>,
  f4: UnaryFn<D, E>,
  f5: UnaryFn<E, F>,
  f6: UnaryFn<F, G>
): G;
function pipe(a: unknown, ...fns: UnaryFn<unknown, unknown>[]): unknown {
  return fns.reduce((acc, fn) => fn(acc), a);
}

function compose<A, B>(f1: UnaryFn<A, B>): UnaryFn<A, B>;
function compose<A, B, C>(f1: UnaryFn<A, B>, f2: UnaryFn<B, C>): UnaryFn<A, C>;
function compose<A, B, C, D>(f1: UnaryFn<A, B>, f2: UnaryFn<B, C>, f3: UnaryFn<C, D>): UnaryFn<A, D>;
function compose<A, B, C, D, E>(
  f1: UnaryFn<A, B>,
  f2: UnaryFn<B, C>,
  f3: UnaryFn<C, D>,
  f4: UnaryFn<D, E>
): UnaryFn<A, E>;
function compose(...fns: UnaryFn<unknown, unknown>[]): UnaryFn<unknown, unknown> {
  return (a: unknown) => fns.reduce((acc, fn) => fn(acc), a);
}

// 实用工具函数
const trim = (s: string): string => s.trim();
const toLower = (s: string): string => s.toLowerCase();
const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const removeExtraSpaces = (s: string): string => s.replace(/\s+/g, " ");

// 使用 pipe 进行数据转换
const normalizeName = (input: string): string =>
  pipe(input, trim, toLower, removeExtraSpaces, capitalize);

console.log(normalizeName("  JOHN   DOE  ")); // "John doe"

// 使用 compose 构建可复用的转换器
const slugify = compose(
  trim,
  toLower,
  (s: string) => s.replace(/[^\w\s-]/g, ""),
  removeExtraSpaces,
  (s: string) => s.replace(/\s/g, "-")
);

console.log(slugify("Hello World!!!")); // "hello-world"

// 与 Result 类型结合
import { ok, err, isOk, type Result } from "./example-03-result-type";

function validateEmail(email: string): Result<string, string> {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? ok(email)
    : err("Invalid email format");
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function checkDomain(email: string): Result<string, string> {
  const blockedDomains = ["tempmail.com", "10minutemail.com"];
  const domain = email.split("@")[1];
  return blockedDomains.includes(domain) ? err("Blocked domain") : ok(email);
}

// 管道中的结果处理
const processEmail = (input: string): Result<string, string> => {
  const normalized = normalizeEmail(input);
  const validated = validateEmail(normalized);
  if (!isOk(validated)) return validated;
  return checkDomain(validated.value);
};

export { pipe, compose, type UnaryFn };
```

### 示例 8：AI 辅助生成 Worker Pool

```typescript
// example-08-worker-pool.ts
/**
 * AI Prompt: "实现一个类型安全的 Worker Pool，支持泛型任务和结果，
 * 自动负载均衡，带超时和错误处理"
 */

interface WorkerTask<TInput, TOutput> {
  id: string;
  input: TInput;
  execute: (input: TInput) => Promise<TOutput> | TOutput;
  resolve: (value: TOutput) => void;
  reject: (reason: Error) => void;
  timeout?: number;
}

interface PoolOptions {
  minWorkers?: number;
  maxWorkers?: number;
  queueSize?: number;
  defaultTimeout?: number;
}

class TypedWorkerPool<TInput, TOutput> {
  private workers: Worker[] = [];
  private queue: WorkerTask<TInput, TOutput>[] = [];
  private activeWorkers = new Map<number, boolean>();
  private taskIdCounter = 0;
  private readonly options: Required<PoolOptions>;

  constructor(
    private workerScript: string | URL,
    options: PoolOptions = {}
  ) {
    this.options = {
      minWorkers: 2,
      maxWorkers: 4,
      queueSize: 100,
      defaultTimeout: 30000,
      ...options,
    };

    this.initializeWorkers();
  }

  private initializeWorkers(): void {
    for (let i = 0; i < this.options.minWorkers; i++) {
      this.addWorker();
    }
  }

  private addWorker(): void {
    if (this.workers.length >= this.options.maxWorkers) return;

    const worker = new Worker(this.workerScript, { type: "module" });
    const workerId = this.workers.length;
    this.activeWorkers.set(workerId, false);

    worker.onmessage = (event: MessageEvent<{ taskId: string; result: TOutput; error?: string }>) => {
      const { taskId, result, error } = event.data;
      const task = this.findTask(taskId);
      if (task) {
        if (error) {
          task.reject(new Error(error));
        } else {
          task.resolve(result);
        }
      }
      this.activeWorkers.set(workerId, false);
      this.processQueue();
    };

    worker.onerror = (err) => {
      console.error(`Worker ${workerId} error:`, err);
      this.activeWorkers.set(workerId, false);
    };

    this.workers.push(worker);
  }

  private findTask(taskId: string): WorkerTask<TInput, TOutput> | undefined {
    const idx = this.queue.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      return this.queue.splice(idx, 1)[0];
    }
    return undefined;
  }

  private getIdleWorker(): { worker: Worker; id: number } | null {
    for (let i = 0; i < this.workers.length; i++) {
      if (!this.activeWorkers.get(i)) {
        return { worker: this.workers[i], id: i };
      }
    }
    return null;
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;

    const idle = this.getIdleWorker();
    if (!idle) {
      // 尝试扩展池
      if (this.workers.length < this.options.maxWorkers) {
        this.addWorker();
        // 新 worker 初始化后会被标记为 idle，递归处理
        setTimeout(() => this.processQueue(), 0);
      }
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.activeWorkers.set(idle.id, true);

    // 设置超时
    const timeoutId = setTimeout(() => {
      task.reject(new Error(`Task ${task.id} timed out`));
      this.activeWorkers.set(idle.id, false);
      this.processQueue();
    }, task.timeout ?? this.options.defaultTimeout);

    // 包装 resolve/reject 以清除超时
    const originalResolve = task.resolve;
    const originalReject = task.reject;
    task.resolve = (value: TOutput) => {
      clearTimeout(timeoutId);
      originalResolve(value);
    };
    task.reject = (reason: Error) => {
      clearTimeout(timeoutId);
      originalReject(reason);
    };

    idle.worker.postMessage({
      taskId: task.id,
      input: task.input,
    });
  }

  execute(input: TInput, timeout?: number): Promise<TOutput> {
    if (this.queue.length >= this.options.queueSize) {
      return Promise.reject(new Error("Worker pool queue is full"));
    }

    return new Promise((resolve, reject) => {
      const task: WorkerTask<TInput, TOutput> = {
        id: `task-${++this.taskIdCounter}`,
        input,
        execute: async (data) => data as unknown as TOutput,
        resolve,
        reject,
        timeout,
      };

      this.queue.push(task);
      this.processQueue();
    });
  }

  terminate(): void {
    this.workers.forEach((w) => w.terminate());
    this.workers = [];
    this.queue = [];
    this.activeWorkers.clear();
  }
}

// Worker 脚本示例 (worker.ts):
/*
self.onmessage = async (event: MessageEvent<{ taskId: string; input: unknown }>) => {
  const { taskId, input } = event.data;
  try {
    // 执行实际计算
    const result = await performHeavyCalculation(input);
    self.postMessage({ taskId, result });
  } catch (err) {
    self.postMessage({ taskId, error: err instanceof Error ? err.message : String(err) });
  }
};
*/

export { TypedWorkerPool, type WorkerTask, type PoolOptions };
```

### 示例 9：AI 生成配置管理器（环境变量 + Zod）

```typescript
// example-09-config-manager.ts
/**
 * AI Prompt: "实现一个类型安全的配置管理器，支持环境变量加载、
 * Zod 校验、默认值、运行时重载，兼容 Node.js / Bun / Deno"
 */

import { z } from "zod";

interface ConfigSource {
  get(key: string): string | undefined;
}

class EnvSource implements ConfigSource {
  get(key: string): string | undefined {
    // 兼容多个运行时
    if (typeof process !== "undefined" && process.env) {
      return process.env[key];
    }
    // @ts-ignore - Deno
    if (typeof Deno !== "undefined") {
      // @ts-ignore
      return Deno.env.get(key);
    }
    return undefined;
  }
}

class MapSource implements ConfigSource {
  constructor(private data: Record<string, string>) {}
  get(key: string): string | undefined {
    return this.data[key];
  }
}

interface ConfigManagerOptions<T extends z.ZodObject<any>> {
  schema: T;
  sources?: ConfigSource[];
  prefix?: string;
}

class ConfigManager<T extends z.ZodObject<any>> {
  private config: z.infer<T> | null = null;
  private readonly schema: T;
  private readonly sources: ConfigSource[];
  private readonly prefix: string;

  constructor(options: ConfigManagerOptions<T>) {
    this.schema = options.schema;
    this.sources = options.sources ?? [new EnvSource()];
    this.prefix = options.prefix ?? "";
  }

  load(): z.infer<T> {
    const raw: Record<string, unknown> = {};

    for (const key of Object.keys(this.schema.shape)) {
      const envKey = this.prefix ? `${this.prefix}_${key}` : key;
      const value = this.sources.reduce<string | undefined>(
        (acc, source) => acc ?? source.get(envKey),
        undefined
      );

      if (value !== undefined) {
        raw[key] = this.coerceValue(value, this.schema.shape[key]);
      }
    }

    const parsed = this.schema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
      throw new Error(`Configuration validation failed:\n${issues.join("\n")}`);
    }

    this.config = parsed.data;
    return parsed.data;
  }

  get<K extends keyof z.infer<T>>(key: K): z.infer<T>[K] {
    if (!this.config) {
      this.load();
    }
    return this.config![key];
  }

  getAll(): z.infer<T> {
    if (!this.config) {
      this.load();
    }
    return this.config!;
  }

  reload(): z.infer<T> {
    this.config = null;
    return this.load();
  }

  private coerceValue(value: string, schema: z.ZodTypeAny): unknown {
    if (schema instanceof z.ZodBoolean) return value === "true" || value === "1";
    if (schema instanceof z.ZodNumber) return Number(value);
    if (schema instanceof z.ZodArray) return value.split(",").map((s) => s.trim());
    return value;
  }
}

// 使用示例
const AppConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1),
  API_SECRET: z.string().min(32),
  CORS_ORIGINS: z.array(z.string()).default(["http://localhost:3000"]),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  ENABLE_METRICS: z.coerce.boolean().default(false),
});

type AppConfig = z.infer<typeof AppConfigSchema>;

// 初始化配置
const config = new ConfigManager({
  schema: AppConfigSchema,
  prefix: "APP",
});

// 使用
const port = config.get("PORT");
const dbUrl = config.get("DATABASE_URL");

export { ConfigManager, EnvSource, MapSource, AppConfigSchema, type AppConfig, type ConfigSource };
```

### 示例 10：AI 辅助实现流式数据处理管道

```typescript
// example-10-stream-pipeline.ts
/**
 * AI Prompt: "实现一个类型安全的流式数据处理管道，支持 map、filter、reduce、
 * batch 操作，基于 AsyncGenerator，内存友好"
 */

interface StreamOptions {
  batchSize?: number;
  concurrency?: number;
}

class TypedStream<T> {
  constructor(private source: AsyncGenerator<T, void, unknown>) {}

  static fromArray<U>(array: U[]): TypedStream<U> {
    async function* generator() {
      for (const item of array) yield item;
    }
    return new TypedStream(generator());
  }

  static fromAsyncIterable<U>(iterable: AsyncIterable<U>): TypedStream<U> {
    async function* generator() {
      for await (const item of iterable) yield item;
    }
    return new TypedStream(generator());
  }

  map<U>(fn: (item: T) => U | Promise<U>): TypedStream<U> {
    const source = this.source;
    async function* generator() {
      for await (const item of source) {
        yield await fn(item);
      }
    }
    return new TypedStream(generator());
  }

  filter(predicate: (item: T) => boolean | Promise<boolean>): TypedStream<T> {
    const source = this.source;
    async function* generator() {
      for await (const item of source) {
        if (await predicate(item)) yield item;
      }
    }
    return new TypedStream(generator());
  }

  batch(size: number): TypedStream<T[]> {
    const source = this.source;
    async function* generator() {
      let batch: T[] = [];
      for await (const item of source) {
        batch.push(item);
        if (batch.length >= size) {
          yield batch;
          batch = [];
        }
      }
      if (batch.length > 0) yield batch;
    }
    return new TypedStream(generator());
  }

  flatMap<U>(fn: (item: T) => U[] | Promise<U[]>): TypedStream<U> {
    const source = this.source;
    async function* generator() {
      for await (const item of source) {
        const mapped = await fn(item);
        for (const u of mapped) yield u;
      }
    }
    return new TypedStream(generator());
  }

  async reduce<U>(fn: (acc: U, item: T) => U | Promise<U>, initial: U): Promise<U> {
    let acc = initial;
    for await (const item of this.source) {
      acc = await fn(acc, item);
    }
    return acc;
  }

  async forEach(fn: (item: T) => void | Promise<void>): Promise<void> {
    for await (const item of this.source) {
      await fn(item);
    }
  }

  async toArray(): Promise<T[]> {
    const result: T[] = [];
    for await (const item of this.source) {
      result.push(item);
    }
    return result;
  }

  async collect(): Promise<T[]> {
    return this.toArray();
  }
}

// 使用示例
interface LogEntry {
  timestamp: number;
  level: "info" | "warn" | "error";
  message: string;
  metadata: Record<string, unknown>;
}

async function processLogs(): Promise<void> {
  const logs: LogEntry[] = [
    { timestamp: 1, level: "info", message: "Server started", metadata: {} },
    { timestamp: 2, level: "error", message: "DB timeout", metadata: { retry: 3 } },
    { timestamp: 3, level: "warn", message: "High memory", metadata: { usage: 85 } },
    { timestamp: 4, level: "error", message: "Auth failed", metadata: { userId: "123" } },
    { timestamp: 5, level: "info", message: "Request complete", metadata: { duration: 120 } },
  ];

  const errorCount = await TypedStream.fromArray(logs)
    .filter((log) => log.level === "error")
    .map((log) => ({ ...log, hour: new Date(log.timestamp).getHours() }))
    .reduce((count) => count + 1, 0);

  console.log(`Total errors: ${errorCount}`);

  // 批量处理
  const batched = await TypedStream.fromArray(logs)
    .batch(2)
    .map((batch) => batch.map((b) => b.message))
    .toArray();

  console.log("Batched messages:", batched);
}

// 模拟大数据流处理
async function* generateLargeDataset(): AsyncGenerator<{ id: number; value: number }> {
  for (let i = 0; i < 1000000; i++) {
    yield { id: i, value: Math.random() };
  }
}

async function processLargeDataset(): Promise<void> {
  const sum = await TypedStream.fromAsyncIterable(generateLargeDataset())
    .filter((item) => item.value > 0.5)
    .batch(1000)
    .map((batch) => batch.reduce((s, item) => s + item.value, 0))
    .reduce((total, batchSum) => total + batchSum, 0);

  console.log(`Sum of filtered values: ${sum}`);
}

export { TypedStream, type StreamOptions };
```

### 示例 11：AI 辅助 MCP 工具客户端

```typescript
// example-11-mcp-client.ts
/**
 * AI Prompt: "实现一个 Model Context Protocol (MCP) 客户端，
 * 支持工具发现、调用和类型安全的结果处理"
 */

interface MCPTool {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description?: string; enum?: string[] }>;
    required?: string[];
  };
}

interface MCPClientConfig {
  serverUrl: string;
  apiKey?: string;
  timeout?: number;
}

class MCPClient {
  private config: MCPClientConfig;
  private tools: MCPTool[] = [];

  constructor(config: MCPClientConfig) {
    this.config = { timeout: 30000, ...config };
  }

  async discoverTools(): Promise<MCPTool[]> {
    const response = await fetch(`${this.config.serverUrl}/tools`, {
      headers: this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Failed to discover tools: ${response.statusText}`);
    }

    this.tools = (await response.json()).tools;
    return this.tools;
  }

  async callTool<T = unknown>(toolName: string, parameters: Record<string, unknown>): Promise<T> {
    const tool = this.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }

    // 参数校验
    const missing = tool.parameters.required?.filter((r) => !(r in parameters));
    if (missing && missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(", ")}`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${this.config.serverUrl}/tools/${toolName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
        },
        body: JSON.stringify(parameters),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Tool execution failed: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  getToolSchema(toolName: string): MCPTool | undefined {
    return this.tools.find((t) => t.name === toolName);
  }
}

// 使用示例
async function demoMCP(): Promise<void> {
  const client = new MCPClient({
    serverUrl: "http://localhost:3000/mcp",
    apiKey: process.env.MCP_API_KEY,
  });

  const tools = await client.discoverTools();
  console.log("Available tools:", tools.map((t) => t.name));

  // 调用数据库查询工具
  const result = await client.callTool<{ rows: unknown[] }>("query_database", {
    sql: "SELECT * FROM users LIMIT 10",
  });

  console.log("Query result:", result.rows);
}

export { MCPClient, type MCPTool, type MCPClientConfig };
```

### 示例 12：AI 辅助实现 API 客户端生成器

```typescript
// example-12-api-generator.ts
/**
 * AI Prompt: "实现一个类型安全的 REST API 客户端生成器，
 * 从 OpenAPI 风格定义生成带 Zod 校验的 TypeScript 客户端代码"
 */

import { z } from "zod";

interface EndpointDefinition {
  path: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  params?: Record<string, z.ZodTypeAny>;
  body?: z.ZodTypeAny;
  response: z.ZodTypeAny;
  headers?: Record<string, string>;
}

type ApiClient<T extends Record<string, EndpointDefinition>> = {
  [K in keyof T]: T[K]["params"] extends Record<string, z.ZodTypeAny>
    ? (
        params: z.infer<z.ZodObject<T[K]["params"]>>,
        options?: { body?: T[K]["body"] extends z.ZodTypeAny ? z.infer<T[K]["body"]> : never }
      ) => Promise<z.infer<T[K]["response"]>>
    : (
        options?: { body?: T[K]["body"] extends z.ZodTypeAny ? z.infer<T[K]["body"]> : never }
      ) => Promise<z.infer<T[K]["response"]>>;
};

function createApiClient<T extends Record<string, EndpointDefinition>>(
  baseUrl: string,
  endpoints: T,
  defaultHeaders?: Record<string, string>
): ApiClient<T> {
  const client = {} as ApiClient<T>;

  for (const [name, def] of Object.entries(endpoints)) {
    (client as any)[name] = async (paramsOrOptions?: unknown, maybeOptions?: unknown) => {
      let url = def.path;
      let body: unknown = undefined;

      // 解析参数
      if (def.params && paramsOrOptions) {
        const parsed = z.object(def.params).parse(paramsOrOptions);
        for (const [key, value] of Object.entries(parsed)) {
          url = url.replace(`:${key}`, String(value));
        }
      }

      // 解析 body
      if (def.body) {
        const options = (maybeOptions ?? paramsOrOptions) as { body?: unknown };
        if (options?.body) {
          body = def.body.parse(options.body);
        }
      }

      const response = await fetch(`${baseUrl}${url}`, {
        method: def.method,
        headers: {
          "Content-Type": "application/json",
          ...defaultHeaders,
          ...def.headers,
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return def.response.parse(data);
    };
  }

  return client;
}

// 使用示例
const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

const api = createApiClient("https://api.example.com", {
  getUser: {
    path: "/users/:id",
    method: "GET",
    params: { id: z.coerce.number() },
    response: UserSchema,
  },
  createUser: {
    path: "/users",
    method: "POST",
    body: z.object({ name: z.string(), email: z.string().email() }),
    response: UserSchema,
  },
  listUsers: {
    path: "/users",
    method: "GET",
    response: z.array(UserSchema),
  },
});

// 类型安全调用
// api.getUser({ id: 1 }) → Promise<{ id: number; name: string; email: string }>
// api.createUser({}, { body: { name: "Alice", email: "alice@example.com" } })

export { createApiClient, type EndpointDefinition, type ApiClient };
```

---

## 十一、最佳实践总结

1. **始终人工审查**：AI 生成的代码必须被理解后再提交。如果无法向同事解释代码的工作原理，就不应该提交它。

2. **分层验证**：
   - L1：AI 生成 → 语法/类型检查
   - L2：开发者审查 → 逻辑正确性
   - L3：CI 流水线 → 测试 + Lint + 安全扫描
   - L4：人工审查 → 架构和业务逻辑

3. **上下文管理**：
   - 为每个项目配置 `.cursorrules` 或团队规范文档
   - 使用 MCP 连接项目数据源（数据库 schema、API 文档）
   - 保持提示简洁，一次只处理一个关注点

4. **敏感数据隔离**：
   - 绝不向公共 AI 服务发送密钥、PII、核心算法
   - 使用企业版或本地模型处理敏感代码
   - 在 CI 中扫描 AI 输出是否包含硬编码凭据

5. **渐进采用路线图**：
   - 第 1 周：AI 生成测试和文档
   - 第 2-3 周：AI 辅助函数补全和重构
   - 第 4-6 周：AI 参与模块设计和多文件编辑
   - 第 7 周+：AI Agent 执行端到端功能开发（持续监督）

6. **模型选择策略**：
   - **复杂架构设计** → Claude 3.7 Sonnet / Claude 3 Opus
   - **日常编码补全** → GPT-4o / Copilot
   - **快速简单任务** → GPT-4o-mini / Claude 3.5 Haiku
   - **隐私敏感场景** → 本地模型 (Ollama + DeepSeek-Coder-V2)
   - **代码库搜索** → Cody + Claude 3.5 Sonnet

7. **知识库持续维护**：
   - 将常见 AI 提示模板存入团队 Wiki
   - 记录 AI 常犯错误和修正模式
   - 定期更新 `.cursorrules` 和 MCP 配置

8. **度量和反馈**：
   - 跟踪 AI 生成代码的缺陷率
   - 收集开发者对 AI 工具的满意度
   - 根据实际效果调整使用策略和提示模板

---

## 参考链接

- [Cursor — The AI Code Editor](https://www.cursor.com/)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)
- [Claude Code — Agentic Coding](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [GitHub Copilot — Your AI pair programmer](https://github.com/features/copilot)
- [GitHub Copilot Best Practices](https://github.blog/2024-01-22-how-to-get-the-most-out-of-github-copilot/)
- [Continue.dev — Open-source AI code assistant](https://www.continue.dev/)
- [Aider — AI pair programming in your terminal](https://aider.chat/)
- [Sourcegraph Cody](https://sourcegraph.com/cody)
- [Ollama — Run LLMs locally](https://ollama.com/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenAI API — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [Anthropic API Documentation](https://docs.anthropic.com/en/api/getting-started)
- [Zod — TypeScript-first Schema Validation](https://zod.dev/)
- [LangChain.js Documentation](https://js.langchain.com/docs/)
- [AI SDK Patterns — Streaming](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot)
- [TypeScript Handbook — Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Microsoft — Responsible AI Practices](https://www.microsoft.com/en-us/ai/responsible-ai)

---

*最后更新: 2026-05-01*


---

## 附录 A：AI 工具深度配置参考

### A.1 Continue.dev 完整配置

Continue.dev 是开源 IDE 扩展，支持 VS Code 和 JetBrains。其强大之处在于完全可定制的模型配置和上下文提供程序。

```json
// config.json — Continue.dev 配置
{
  "models": [
    {
      "title": "Claude 3.7 Sonnet",
      "provider": "anthropic",
      "model": "claude-3-7-sonnet-20250219",
      "apiKey": "${ANTHROPIC_API_KEY}",
      "systemMessage": "You are an expert TypeScript engineer. Always provide type-safe code with strict null checks."
    },
    {
      "title": "Local Ollama",
      "provider": "ollama",
      "model": "deepseek-coder-v2:16b",
      "apiBase": "http://localhost:11434"
    },
    {
      "title": "Azure OpenAI",
      "provider": "azure",
      "model": "gpt-4o",
      "apiKey": "${AZURE_OPENAI_KEY}",
      "apiBase": "https://my-resource.openai.azure.com",
      "engine": "gpt-4o-deployment"
    }
  ],
  "tabAutocompleteModel": {
    "title": "Codellama",
    "provider": "ollama",
    "model": "codellama:7b-code"
  },
  "customCommands": [
    {
      "name": "test",
      "prompt": "{{{ input }}}\n\nWrite comprehensive unit tests for the above code using Vitest. Cover: 1) Happy path, 2) Edge cases (null, empty, extreme values), 3) Error cases. Use describe/it blocks and explicit assertions.",
      "description": "Generate unit tests"
    },
    {
      "name": "explain",
      "prompt": "{{{ input }}}\n\nExplain this code in detail: 1) What it does at a high level, 2) How each part works, 3) Potential issues or improvements, 4) Type-level behavior.",
      "description": "Explain code"
    },
    {
      "name": "refactor",
      "prompt": "{{{ input }}}\n\nRefactor this code to improve: readability, type safety, performance. Use modern TypeScript patterns. Preserve all existing behavior.",
      "description": "Refactor code"
    }
  ],
  "contextProviders": [
    { "name": "diff", "params": {} },
    { "name": "open", "params": {} },
    { "name": "terminal", "params": {} },
    { "name": "problems", "params": {} },
    { "name": "folder", "params": {} },
    { "name": "codebase", "params": {} }
  ],
  "slashCommands": [
    { "name": "edit", "description": "Edit selected code" },
    { "name": "comment", "description": "Add comments" },
    { "name": "share", "description": "Export conversation" }
  ]
}
```

### A.2 Ollama 本地模型配置

对于隐私敏感或离线环境，本地模型是完全可行的方案：

```bash
# 安装 Ollama
# macOS: brew install ollama
# Linux: curl -fsSL https://ollama.com/install.sh | sh

# 拉取适合编程的模型
ollama pull deepseek-coder-v2:16b      # 代码专用，16B 参数
ollama pull codellama:7b-code          # 轻量级补全
ollama pull qwen2.5-coder:14b          # 中文支持好
ollama pull llama3.1:8b                # 通用能力

# 创建自定义模型配置
cat > Modelfile << 'EOF'
FROM deepseek-coder-v2:16b
SYSTEM You are an expert TypeScript and Node.js engineer. You write clean, type-safe, well-tested code. You prefer functional programming patterns and immutable data structures. Always use strict TypeScript settings.
PARAMETER temperature 0.2
PARAMETER num_ctx 8192
EOF

ollama create ts-expert -f Modelfile
ollama run ts-expert
```

### A.3 Aider 终端配置

Aider 是终端中的 AI 结对编程工具，与 Git 深度集成：

```bash
# 安装
pip install aider-chat

# 使用 Claude 3.7
export ANTHROPIC_API_KEY=sk-ant-...
aider --model claude-3-7-sonnet-20250219

# 使用本地模型
aider --model ollama/deepseek-coder-v2:16b

# 常用工作流
aider src/utils.ts src/types.ts          # 指定上下文文件
/model claude-3-7-sonnet                 # 切换模型
/add src/new-file.ts                     # 添加文件到上下文
/drop src/old-file.ts                    # 移除文件
/test                                    # 运行测试
/lint                                    # 运行 Linter
/commit                                  # 生成提交信息并提交
```

---

## 附录 B：高级提示工程模式

### B.1 Chain-of-Thought 编程提示

对于复杂算法，引导 AI 逐步思考：

```markdown
## Task
Implement a concurrent task scheduler with priority queue and deadlock prevention.

## Requirements
- Support up to 100 concurrent tasks
- Tasks have priorities (1-10) and dependencies
- Detect circular dependencies before execution
- Provide execution order guarantee for dependent tasks

## Approach
Please think step by step:
1. First, design the data structures (Task, DependencyGraph, PriorityQueue)
2. Then, implement the topological sort for dependency resolution
3. Next, add the priority-based scheduling logic
4. Finally, implement the concurrency limit with a semaphore pattern
5. Include comprehensive error handling for deadlock detection

## Output
Provide the complete TypeScript implementation with JSDoc comments and a usage example.
```

### B.2 Reflection Pattern（自我修正）

让 AI 审查自己的输出：

```markdown
## Step 1: Generate
Write a TypeScript function that securely hashes passwords using bcrypt.

## Step 2: Review
Now review your own code for:
- Timing attack vulnerabilities
- Memory safety issues
- Error handling completeness
- Type safety gaps

## Step 3: Refine
Provide the corrected implementation based on your review findings.
```

### B.3 多 Agent 协作模式

模拟团队中不同角色的协作：

```markdown
## Architect Agent
Design the API interface for a real-time notification service.
Focus on: types, error contracts, event schemas.

## Implementer Agent
Implement the Architect's design using WebSocket and Redis Pub/Sub.
Focus on: correctness, performance, error handling.

## Reviewer Agent
Review the Implementer's code for security and maintainability.
Identify at least 3 potential issues and suggest fixes.

## Final Output
Combine all outputs into a production-ready implementation.
```

---

## 附录 C：AI 辅助调试方法论

### C.1 系统性调试流程

当遇到 Bug 时，与 AI 协作的系统性方法：

**Phase 1：现象描述**
```markdown
## Observed Behavior
Function X returns undefined for input Y, but works for input Z.

## Expected Behavior
Should return { id: "...", name: "..." } for all valid inputs.

## Environment
- Node.js 20.11
- TypeScript 5.4
- Database: PostgreSQL 16
```

**Phase 2：上下文提供**
粘贴相关函数、类型定义、测试用例、错误堆栈。

**Phase 3：假设生成**
```markdown
## Hypotheses
1. Database query returns null for edge case
2. Type assertion hides undefined value
3. Async race condition in cache invalidation

## Evidence
- Log output shows query returns row
- But downstream receives undefined
```

**Phase 4：验证与修复**
让 AI 针对每个假设提供验证方法和修复方案。

### C.2 日志分析提示模板

```markdown
## Role
You are a Node.js performance engineer specializing in async debugging.

## Logs
```
[2026-05-01T10:23:45] ERROR: Request timeout after 30000ms
[2026-05-01T10:23:45] WARN:  Connection pool exhausted (20/20)
[2026-05-01T10:23:46] ERROR: UnhandledPromiseRejection: Database connection failed
```

## Task
1. Identify the root cause chain
2. Suggest 3 immediate mitigations
3. Propose long-term architectural fixes
4. Provide monitoring/alerting recommendations
```

---

## 附录 D：性能优化与 AI 协作

### D.1 AI 辅助性能分析

```markdown
## Code
（粘贴性能敏感的代码段）

## Metrics
- Current: 2000ms average response time
- Target: < 500ms p95
- Throughput: 100 req/s

## Constraints
- Must maintain ACID guarantees
- Cannot add read replicas
- Memory limit: 512MB per instance

## Task
1. Identify the top 3 bottlenecks
2. Propose specific optimizations with expected impact
3. Provide benchmark code to validate improvements
```

### D.2 算法复杂度分析提示

```markdown
## Function
（粘贴算法实现）

## Analysis Request
1. Time complexity (best/average/worst)
2. Space complexity
3. Identify any hidden O(n²) or worse patterns
4. Suggest algorithmic improvements if applicable
5. Provide Big-O notation with reasoning
```

---

## 附录 E：安全编码与 AI

### E.1 安全审查专项提示

```markdown
## Role
You are a security-focused code reviewer with expertise in OWASP Top 10.

## Code
（粘贴需要审查的代码）

## Checklist
For each item, provide: severity, location, explanation, fix:
- [ ] SQL Injection
- [ ] XSS (Reflected/Stored/DOM)
- [ ] CSRF vulnerabilities
- [ ] Insecure deserialization
- [ ] Sensitive data exposure
- [ ] Broken authentication
- [ ] Security misconfiguration
- [ ] Insecure direct object references
- [ ] Missing function-level access control
- [ ] Unvalidated redirects/forwards
```

### E.2 密钥与凭据管理

```typescript
// example-security-patterns.ts
/**
 * AI Prompt: "展示如何安全地管理 API 密钥和凭据，
 * 避免硬编码，支持轮换，兼容多种运行时"
 */

interface CredentialProvider {
  get(name: string): Promise<string | undefined>;
}

// 环境变量提供器
class EnvCredentialProvider implements CredentialProvider {
  async get(name: string): Promise<string | undefined> {
    return process.env[name];
  }
}

// AWS Secrets Manager 提供器
class AWSSecretProvider implements CredentialProvider {
  async get(name: string): Promise<string | undefined> {
    // 使用 AWS SDK 获取密钥
    // const secret = await secretsManager.getSecretValue({ SecretId: name });
    // return secret.SecretString;
    return undefined; // 占位实现
  }
}

// HashiCorp Vault 提供器
class VaultProvider implements CredentialProvider {
  async get(name: string): Promise<string | undefined> {
    // 使用 Vault API
    return undefined; // 占位实现
  }
}

// 带缓存和轮换的凭据管理器
class SecureCredentialManager {
  private cache = new Map<string, { value: string; expiresAt: number }>();
  private providers: CredentialProvider[];

  constructor(providers: CredentialProvider[]) {
    this.providers = providers;
  }

  async get(name: string, ttlMs = 300000): Promise<string> {
    const cached = this.cache.get(name);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    for (const provider of this.providers) {
      const value = await provider.get(name);
      if (value) {
        this.cache.set(name, { value, expiresAt: Date.now() + ttlMs });
        return value;
      }
    }

    throw new Error(`Credential not found: ${name}`);
  }

  invalidate(name: string): void {
    this.cache.delete(name);
  }
}

export { SecureCredentialManager, EnvCredentialProvider, type CredentialProvider };
```

---

*附录最后更新: 2026-05-01*


---

## 附录 F：AI 辅助测试策略

### F.1 测试生成工作流

AI 在测试领域的应用是最成熟的场景之一。系统化的测试生成工作流包括：

**1. 边界值分析生成**
```markdown
## Input
function divide(a: number, b: number): number

## Task
Generate test cases covering:
- Positive/negative/zero inputs
- Division by zero
- Very large numbers (Number.MAX_SAFE_INTEGER)
- Very small numbers (Number.MIN_VALUE)
- Floating point edge cases (0.1 + 0.2 !== 0.3)
- Non-numeric inputs (if applicable)
```

**2. 基于属性的测试（Property-Based Testing）**
```typescript
// AI 生成的 PBT 示例
import { fc, it } from "@fast-check/vitest";

// 属性：除法应满足 a / b * b ≈ a（当 b ≠ 0）
it.prop([fc.float(), fc.float()])("division inverse property", (a, b) => {
  fc.pre(b !== 0);
  const result = divide(a, b) * b;
  return Math.abs(result - a) < 0.0001 || (Number.isNaN(a) && Number.isNaN(result));
});

// 属性：排序应满足输出长度等于输入长度
it.prop([fc.array(fc.integer())])("sort preserves length", (arr) => {
  return sort(arr).length === arr.length;
});
```

**3. 突变测试（Mutation Testing）辅助**
```markdown
## Task
分析以下代码，识别哪些逻辑分支如果突变（如将 > 改为 >=）不会导致测试失败。
这些就是测试覆盖的盲点。

## Code
（粘贴代码和测试）

## Output
1. 每个突变点的位置和类型
2. 当前测试是否能捕获该突变
3. 建议补充的测试用例
```

### F.2 测试维护自动化

AI 可以帮助维护随代码演变的测试套件：

```typescript
// 当函数签名变更时，AI 可以批量更新测试
// 输入：新旧函数签名 + 现有测试
// 输出：更新后的测试

// 旧签名
// function fetchUser(id: string): Promise<User>

// 新签名
// function fetchUser(id: string, options?: { includeProfile?: boolean }): Promise<User>

// AI 更新后的测试
it("fetches user with default options", async () => {
  const user = await fetchUser("123");
  expect(user.id).toBe("123");
});

it("fetches user with profile when requested", async () => {
  const user = await fetchUser("123", { includeProfile: true });
  expect(user.profile).toBeDefined();
});
```

---

## 附录 G：AI 驱动的文档工程

### G.1 自动化文档生成

```markdown
## Task
为以下 TypeScript 模块生成完整的 API 文档：

## Requirements
1. JSDoc for all public exports
2. Usage examples for each function
3. Type parameter explanations
4. Error conditions documented
5. Related functions cross-referenced

## Format
Output in Markdown, compatible with VitePress / Docusaurus.
```

### G.2 架构决策记录（ADR）辅助

```markdown
## Context
We need to choose between REST and GraphQL for our public API.

## Constraints
- Must support mobile apps with varying bandwidth
- Must allow third-party integrations
- Team has strong REST experience
- Frontend uses React Query

## Task
Generate an ADR comparing:
1. REST with OpenAPI
2. GraphQL with Apollo
3. tRPC for internal + REST for external

For each option, provide: pros, cons, complexity, learning curve, migration path.
```

---

## 附录 H：多语言项目中的 AI 协作

在包含 TypeScript、Rust、Python 的 polyglot 项目中，AI 可以充当"翻译官"：

```markdown
## Task
将以下 TypeScript 类型定义转换为 equivalent Rust structs with serde.

## TypeScript
interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  meta: { page: number; total: number };
}

## Requirements
- Use serde for JSON serialization
- Preserve Option types appropriately
- Add derive macros for Debug, Clone
- Handle null as Option in Rust
```

---

## 附录 I：AI 工具故障排除

### I.1 常见问题与解决

| 问题 | 可能原因 | 解决方案 |
|------|---------|---------|
| 补全质量突然下降 | 模型切换或上下文污染 | 清除对话历史，重新打开文件 |
| AI 生成过时 API | 训练数据截止日期 | 粘贴最新文档到上下文 |
| 大文件编辑失败 | 上下文窗口溢出 | 分块处理，每次 < 500 行 |
| 导入路径错误 | 项目结构复杂 | 粘贴 tsconfig paths 到提示 |
| 类型推断失败 | 缺少依赖类型 | 确保 node_modules 在索引中 |
| 中文输出质量差 | 模型对中文代码支持弱 | 使用英文提示 + 中文注释 |

### I.2 性能优化

```markdown
## 提升 AI 响应速度的技巧

1. **缩小上下文范围**：不要发送整个项目，只发送相关文件
2. **使用轻量模型**：简单任务用 GPT-4o-mini 代替 GPT-4o
3. **启用本地缓存**：Cursor 和 Continue.dev 支持本地索引缓存
4. **预加载索引**：在 IDE 启动时让 AI 索引完成后再开始工作
5. **批量请求**：将多个相关问题合并为一次对话
```

---

*本指南由 AI 辅助编写，经人工审查和验证。*
*全文完*


---

## 附录 J：AI 辅助架构设计

### J.1 架构模式生成

AI 可以帮助团队快速探索和评估不同的架构方案：

```markdown
## Context
We are building a real-time collaborative document editor (like Google Docs)
for enterprise customers. Requirements:
- Support 100+ concurrent editors per document
- Offline-first capability
- Full audit log of all changes
- SOC 2 compliance requirements
- Must work in air-gapped environments

## Task
Propose 3 architecture alternatives with:
1. High-level component diagram (text-based)
2. Technology stack recommendations
3. Data flow for collaborative editing
4. Conflict resolution strategy
5. Deployment topology
6. Estimated complexity (1-10)
7. Risk assessment

## Format
Use C4 model notation for diagrams. Include specific library/framework names.
```

### J.2 C4 模型与 AI 协作

```markdown
## Task
Generate a C4 Container diagram for a microservices e-commerce platform.

## Services
- API Gateway (Kong)
- User Service (Node.js + Express)
- Product Catalog Service (Node.js + Fastify)
- Order Service (Node.js + NestJS)
- Payment Service (Python + FastAPI)
- Notification Service (Node.js + BullMQ)
- Search Service (Go + Elasticsearch)

## Data Stores
- PostgreSQL (users, orders)
- MongoDB (product catalog)
- Redis (sessions, caching)
- Elasticsearch (search index)
- S3 (product images)

## Output
Generate PlantUML C4 diagram source code.
```

---

## 附录 K：AI 辅助性能工程

### K.1 负载测试脚本生成

```markdown
## Task
Generate a k6 load testing script for the following API:

## Endpoints
POST /api/login — authenticate user
GET /api/products — list products (paginated)
POST /api/orders — create order
GET /api/orders/:id — get order details

## Requirements
- Ramp up to 1000 VUs over 5 minutes
- Test authentication flow with realistic credentials
- Validate response times (p95 < 200ms for GET, < 500ms for POST)
- Include custom metrics for business KPIs
- Generate HTML report

## Format
Output complete k6 JavaScript test script.
```

### K.2 数据库查询优化

```markdown
## Task
Optimize the following PostgreSQL query. Target: < 50ms execution time.

## Current Query
SELECT u.*, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2025-01-01'
GROUP BY u.id
ORDER BY order_count DESC
LIMIT 100;

## Schema
- users: id (PK), email, created_at, updated_at — 1M rows
- orders: id (PK), user_id (FK), total_amount, status, created_at — 10M rows

## Current Performance
Execution Time: 2450ms
Planning Time: 12ms

## Task
1. Identify bottlenecks using EXPLAIN ANALYZE
2. Propose index additions
3. Rewrite query if needed
4. Provide before/after execution plans
```

---

## 附录 L：AI 辅助安全加固

### L.1 依赖安全扫描

```typescript
// AI 生成的依赖安全分析脚本
import { readFile } from "node:fs/promises";

interface VulnerabilityReport {
  package: string;
  installedVersion: string;
  vulnerableVersions: string;
  severity: "critical" | "high" | "medium" | "low";
  cveId?: string;
  fixAvailable: boolean;
  fixedVersion?: string;
}

async function analyzeDependencies(packageJsonPath: string): Promise<VulnerabilityReport[]> {
  const content = await readFile(packageJsonPath, "utf-8");
  const pkg = JSON.parse(content);

  const allDeps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
  };

  const reports: VulnerabilityReport[] = [];

  for (const [name, version] of Object.entries(allDeps)) {
    // 查询 NVD / npm audit API
    // 这里使用模拟数据
    if (name === "lodash" && (version as string).startsWith("4.17")) {
      reports.push({
        package: name,
        installedVersion: version as string,
        vulnerableVersions: "<4.17.21",
        severity: "high",
        cveId: "CVE-2021-23337",
        fixAvailable: true,
        fixedVersion: "4.17.21",
      });
    }
  }

  return reports;
}

// CI 集成
async function securityGate(packageJsonPath: string): Promise<void> {
  const vulns = await analyzeDependencies(packageJsonPath);
  const critical = vulns.filter((v) => v.severity === "critical");
  const high = vulns.filter((v) => v.severity === "high");

  console.log(`Found ${vulns.length} vulnerabilities:`);
  console.log(`  Critical: ${critical.length}`);
  console.log(`  High: ${high.length}`);

  if (critical.length > 0) {
    console.error("Critical vulnerabilities found. Blocking build.");
    process.exit(1);
  }

  if (high.length > 5) {
    console.error("Too many high-severity vulnerabilities. Blocking build.");
    process.exit(1);
  }
}
```

### L.2  secrets 扫描配置

```yaml
# .github/workflows/secrets-scan.yml
name: Secrets Scan
on: [push, pull_request]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Detect Secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: main
          head: HEAD
          extra_args: --debug --only-verified
```

---

## 附录 M：AI 辅助国际化（i18n）

```markdown
## Task
Generate a complete i18n setup for a Next.js application supporting
English, Chinese, Japanese, and German.

## Requirements
1. Use next-intl for routing and translations
2. Type-safe message keys
3. RTL support preparation
4. Date/number/currency formatting per locale
5. Pluralization rules
6. Generate translation files for:
   - Common UI (buttons, labels, errors)
   - User-facing forms
   - Email templates

## Format
Provide complete file structure, configuration, and sample components.
```

---

## 附录 N：AI 辅助可访问性（a11y）

```markdown
## Task
Review the following React component for WCAG 2.1 AA compliance.

## Checklist
- [ ] Color contrast ratios (4.5:1 for normal text)
- [ ] Keyboard navigation support
- [ ] Screen reader announcements
- [ ] Focus management
- [ ] Alternative text for images
- [ ] Form label associations
- [ ] Motion preference respect

## Component
（粘贴组件代码）

## Output
For each violation:
1. WCAG criterion number
2. Severity (Critical/Major/Minor)
3. Current code issue
4. Corrected code
5. Testing recommendation
```

---

*本指南致力于成为 JavaScript/TypeScript 开发者使用 AI 工具的权威参考。*
*欢迎通过 Issue 和 PR 贡献您的实践经验。*

*全文完 — 2026-05-01*


---

## 附录 O：AI 辅助数据建模

### O.1 数据库 Schema 生成

```markdown
## Task
Design a PostgreSQL schema for a SaaS multi-tenant application.

## Requirements
- Tenants are isolated at row level (RLS)
- Users can belong to multiple tenants with different roles
- Audit log for all data changes
- Soft deletes everywhere
- Support 10,000 tenants, 1M users per tenant

## Output
1. Complete DDL with indexes and constraints
2. Row Level Security policies
3. Trigger functions for audit logging
4. TypeScript types (via Zod or Drizzle)
5. Migration scripts
```

### O.2 Prisma Schema 辅助设计

```markdown
## Context
Building an e-commerce platform with:
- Products with variants (size, color)
- Inventory tracking per warehouse
- Order management with status workflow
- Payment processing with multiple providers
- Shipping tracking

## Task
Generate a Prisma schema with:
- Proper relations and foreign keys
- Enum definitions
- Index recommendations
- Full-text search setup (PostgreSQL)
- JSON fields for flexible attributes
- Soft delete pattern

## Constraints
- Use PostgreSQL provider
- Follow naming conventions (snake_case in DB, camelCase in Prisma)
- Include @@index and @@unique where appropriate
```

---

## 附录 P：AI 辅助 DevOps 与基础设施

### P.1 Dockerfile 生成

```markdown
## Task
Generate a production-ready Dockerfile for a Node.js 23 TypeScript application.

## Requirements
- Multi-stage build (if using traditional build) OR single-stage for strip-types
- Non-root user
- Health check
- Proper signal handling (SIGTERM)
- Minimal attack surface (distroless or alpine)
- .dockerignore recommendations

## Application
- Next.js 15 App Router
- Uses Prisma ORM
- Needs environment variables at runtime
- Exposes port 3000
```

### P.2 GitHub Actions 工作流生成

```markdown
## Task
Generate a complete CI/CD pipeline for a TypeScript monorepo.

## Structure
- apps/web (Next.js)
- apps/api (Fastify + tRPC)
- packages/ui (React component library)
- packages/db (Prisma schema + client)

## Requirements
1. Lint and type-check on every PR
2. Unit tests with coverage reporting
3. Integration tests with test database
4. Build verification
5. Deploy web to Vercel (preview + production)
6. Deploy API to Railway/Fly.io
7. Turborepo remote caching
```

### P.3 Terraform / Pulumi 基础设施

```markdown
## Task
Generate Pulumi TypeScript code for:
- AWS ECS Fargate cluster
- Application Load Balancer
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- S3 bucket for static assets
- CloudFront distribution
- Route53 DNS records
- IAM roles and policies
```

---

## 附录 Q：AI 辅助技术选型

### Q.1 决策矩阵生成

```markdown
## Context
We need to choose a state management library for a large React application.

## Options
- Zustand
- Jotai
- Redux Toolkit
- Recoil
- Valtio

## Criteria
- Bundle size impact
- TypeScript support quality
- DevTools availability
- Learning curve
- Community size
- Maintenance status
- SSR compatibility
- Atomic updates support

## Task
Generate a weighted decision matrix with scores 1-5 for each option.
Include specific code examples showing each library's approach.
```

### Q.2 技术雷达更新

```markdown
## Task
Analyze the following technologies for our team's next quarter adoption:

## Technologies
1. TanStack Start (new meta-framework)
2. React Server Components (stable in Next.js 15)
3. htmx for progressive enhancement
4. PartyKit for real-time collaboration
5. Zero sync engine for local-first

## For Each
- Maturity assessment (1-5)
- Risk level (Low/Medium/High)
- Effort to adopt (person-weeks)
- Potential impact on architecture
- Team skill gap analysis
- Recommended action (Adopt/Trial/Assess/Hold)
```

---

## 附录 R：AI 辅助技术写作

### R.1 文档模板生成

```markdown
## Task
Generate a comprehensive README.md template for an open-source TypeScript library.

## Sections Required
1. Hero banner with badges
2. One-line description + feature list
3. Installation instructions (npm/yarn/pnpm/bun)
4. Quick start example (runnable)
5. API documentation structure
6. Configuration options
7. Error handling guide
8. Contributing guidelines
9. License and credits
10. Changelog format

## Tone
Professional but approachable. Target audience: intermediate TypeScript developers.
```

### R.2 博客文章辅助

```markdown
## Task
Write a technical blog post about "Type-Safe API Contracts with tRPC and Zod".

## Requirements
- 2000+ words
- 5+ code examples
- Comparison table (tRPC vs REST vs GraphQL)
- Performance benchmarks
- Real-world use case
- Call to action

## Audience
Full-stack TypeScript developers considering tRPC adoption.
```

---

*最终版本 — 2026-05-01*
*本文档持续更新，以反映 AI 工具生态的最新发展。*


---

## 附录 S：AI 辅助代码考古（Code Archaeology）

在处理遗留代码库时，AI 可以作为"代码考古学家"帮助理解系统：

```markdown
## Task
Analyze this legacy codebase and provide:

1. **Architecture Overview**: High-level system design based on directory structure and key files
2. **Dependency Graph**: Major modules and their relationships
3. **Tech Debt Hotspots**: Files with highest complexity or most TODOs
4. **Refactoring Roadmap**: Prioritized list of improvements with effort estimates
5. **Knowledge Gaps**: Areas lacking documentation or tests

## Context
（粘贴项目树和关键文件内容）
```

### S.1 遗留代码理解工作流

```typescript
// 示例：使用 AI 理解复杂的正则表达式
const complexRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// AI Prompt: "解释这个正则表达式，将其重构为可读的组合函数，
// 并提供测试用例覆盖所有分支"

// AI 输出重构版本：
function validatePassword(password: string): boolean {
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);
  const hasMinLength = password.length >= 8;

  return hasLower && hasUpper && hasDigit && hasSpecial && hasMinLength;
}
```

---

## 附录 T：AI 辅助代码现代化

### T.1 框架迁移辅助

```markdown
## Task
Migrate a React Class Component to a modern Function Component with hooks.

## Input
（粘贴 Class Component 代码）

## Requirements
1. Convert to function component with TypeScript
2. Replace lifecycle methods with hooks
3. Use useEffect cleanup properly
4. Convert state management to useState/useReducer
5. Add React.memo if beneficial
6. Write tests for the new component
```

### T.2 语言版本升级

```markdown
## Task
Modernize this JavaScript ES5 code to ES2022 TypeScript.

## Requirements
1. Convert var to const/let
2. Replace function expressions with arrow functions
3. Use async/await instead of callbacks
4. Add TypeScript types
5. Use optional chaining and nullish coalescing
6. Replace manual loops with array methods
7. Add JSDoc comments
```

---

## 附录 U：AI 辅助开源贡献

### U.1 Issue 分析与修复

```markdown
## Task
Analyze this GitHub issue and propose a fix.

## Issue
Title: "Memory leak in long-running processes"
Description: After 24 hours, the Node.js process uses 2GB+ RAM.

## Code Context
（粘贴相关源码）

## Task
1. Identify potential memory leak sources
2. Use heap snapshot analysis patterns
3. Propose specific code changes
4. Write a test to verify the fix
5. Estimate impact on existing users
```

### U.2 Pull Request 描述生成

```typescript
// 使用 AI 自动生成高质量的 PR 描述
interface PRDescription {
  title: string;
  summary: string;
  changes: string[];
  breakingChanges: string[];
  testing: string;
  screenshots?: string[];
}

function generatePRDescription(diff: string, commits: string[]): PRDescription {
  // AI 分析 diff 和 commits，生成结构化 PR 描述
  return {
    title: "feat(auth): implement OAuth2 PKCE flow",
    summary: "This PR adds PKCE (Proof Key for Code Exchange) support to our OAuth2 implementation...",
    changes: [
      "Added `generatePKCEChallenge()` utility",
      "Updated OAuth2 login endpoint to accept code_challenge",
      "Added token exchange with code_verifier validation",
    ],
    breakingChanges: [],
    testing: "- Unit tests for PKCE utilities\n- Integration test for full OAuth2 flow\n- Verified against Auth0 and Keycloak",
  };
}
```

---

## 附录 V：AI 伦理与责任使用

### V.1 可持续 AI 使用原则

1. **能源意识**：大模型推理消耗显著能源。优先使用本地模型处理简单任务，保留云端大模型用于复杂场景。

2. **数据主权**：理解代码上传至第三方 AI 服务的数据处理条款。敏感代码使用企业版或自托管方案。

3. **技能保持**：定期手写核心算法，防止对 AI 的过度依赖导致基础技能退化。

4. **多样性支持**：AI 模型可能存在偏见。审查生成的代码是否对多语言、多文化用户公平。

5. **透明度**：在团队中明确标注 AI 辅助程度，维护协作信任。

### V.2 开发者成长与 AI

AI 不应替代学习，而应加速学习：

- **新手阶段**：用 AI 解释代码，但要求自己重写
- **进阶阶段**：用 AI 生成骨架，自己填充核心业务逻辑
- **专家阶段**：用 AI 处理样板代码，专注架构和创新

---

*本文档是 JavaScript/TypeScript 全景知识库的一部分。*
* maintained by the community, enhanced by AI, validated by humans. *
*最终版本 — 2026-05-01*


---

## 附录 W：AI 辅助学习路径

### W.1 新手到专家的 AI 辅助学习路线图

**第 1-2 周：基础熟悉**
- 安装 GitHub Copilot，体验 Tab 补全
- 使用 AI 解释不熟悉的代码片段
- 让 AI 生成简单的函数实现并对比自己的写法
- 学习基本的提示技巧

**第 3-4 周：工具深化**
- 尝试 Cursor 的 Chat 和 Composer 模式
- 配置 Continue.dev 连接多个模型
- 使用 AI 生成单元测试并理解测试设计
- 建立自己的提示模板库

**第 5-8 周：工作流整合**
- 将 AI 审查纳入代码提交流程
- 使用 Claude Code 进行多文件重构
- 配置 MCP 连接项目数据源
- 建立团队 AI 使用规范

**第 9-12 周：高级应用**
- 使用 AI 进行架构设计和方案评估
- 构建自定义 RAG 管道连接代码库
- 开发团队专用的 AI 工具和脚本
- 成为团队 AI 工具的内部专家

### W.2 持续学习资源

- **每日练习**：用 AI 解决一个 Codewars / LeetCode 问题，对比 AI 解法和自己的思路
- **周度挑战**：选择一个不熟悉的库，让 AI 生成教程项目并动手实现
- **月度复盘**：回顾 AI 生成代码的质量趋势，调整使用策略

---

*文档统计：超过 12,000 字，涵盖 12 个主要章节、23 个附录、12 个可运行 TypeScript 示例。*
*最终版本 — 2026-05-01*
