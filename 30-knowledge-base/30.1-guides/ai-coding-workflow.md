# AI 编码工作流

> 在 JavaScript/TypeScript 项目中集成 AI 辅助开发的最佳实践与工具链。

---

## 核心工具对比

| 工具 | 定位 | 核心模型 | 最佳场景 | 定价模式 |
|------|------|---------|---------|---------|
| **Cursor** | AI-native IDE | GPT-4o / Claude 3.7 Sonnet | 全栈开发，代码库理解，多文件重构 | $20/月 Pro |
| **GitHub Copilot** | IDE 插件补全 | GPT-4o Copilot / Claude 3.5 | 日常编码，函数级生成，代码补全 | $10/月 Pro |
| **Sourcegraph Cody** | 企业代码智能 | Claude 3.5 / Mixtral | 大型代码库搜索，跨仓库理解 | 免费/企业版 |
| **Continue.dev** | 开源 IDE 扩展 | 自配置 (OpenAI/Anthropic/Ollama) | 隐私优先，本地模型，完全可定制 | 免费开源 |
| **Claude Code** | CLI Agent | Claude 3.7 Sonnet | 复杂重构，测试生成，终端集成 | API 按量计费 |
| **V0.dev** | UI 生成 | Claude / GPT-4o | React 组件，Tailwind 样式 | 免费/付费 |
| **Windsurf** | 协作编码 | GPT-4o / Claude | 实时代码解释，审查辅助 | $15/月 |

**选型决策矩阵**：

- **个人开发者 / 预算敏感** → Continue.dev + 本地 Ollama
- **追求效率 / 全栈项目** → Cursor (Composer 模式)
- **企业代码库 / 合规要求** → Cody + 私有部署
- **已有 IDE 习惯 (VS Code/JetBrains)** → Copilot / Continue.dev

---

## 代码示例：AI 辅助类型安全重构

```typescript
// 重构前：松散的类型定义
function processUser(data: any) {
  return {
    name: data.name,
    age: data.age,
    role: data.role,
  };
}

// Cursor / Copilot 提示："为 processUser 添加 Zod 校验和严格类型"
// 重构后：AI 生成的类型安全版本
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150),
  role: z.enum(['admin', 'editor', 'viewer']),
});

type User = z.infer<typeof UserSchema>;

function processUser(data: unknown): User {
  const parsed = UserSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid user data: ${parsed.error.message}`);
  }
  return parsed.data;
}

// 测试生成提示："为 processUser 生成 Vitest 测试用例，覆盖边界条件"
// AI 输出：
import { describe, it, expect } from 'vitest';

describe('processUser', () => {
  it('parses valid user', () => {
    expect(processUser({ name: 'Alice', age: 30, role: 'admin' })).toEqual({
      name: 'Alice', age: 30, role: 'admin',
    });
  });

  it('rejects negative age', () => {
    expect(() => processUser({ name: 'Bob', age: -1, role: 'editor' }))
      .toThrow('Invalid user data');
  });

  it('rejects invalid role', () => {
    expect(() => processUser({ name: 'Carol', age: 25, role: 'hacker' }))
      .toThrow('Invalid user data');
  });
});
```

---

## 工作流模式

### 1. 提示驱动开发（Prompt-Driven Development）

```
角色：Senior TypeScript Engineer
上下文：Next.js 15 App Router 项目
任务：实现带 Zod 校验的 Server Action
约束：使用 React 19 useActionState，错误信息中文
```

### 2. AI 辅助代码审查

- 提交前用 AI 检查潜在 Bug
- 生成变更摘要（Commit Message）
- 自动检测安全漏洞（XSS、注入）

### AI 审查 Prompt 模板

```markdown
## Role
You are a senior security-focused code reviewer.

## Context
Repository: Next.js 15 + TypeScript + Prisma
File to review: src/app/api/orders/route.ts

## Tasks
1. Identify SQL injection, XSS, or auth bypass risks.
2. Check for missing input validation.
3. Suggest performance improvements (N+1 queries, missing indexes).
4. Output findings in Markdown with severity (Critical / Warning / Info).
```

### 3. 测试生成

```bash
# 用 AI 生成单元测试
claude "为 src/utils/date.ts 生成 vitest 测试用例，覆盖边界条件"

# Cursor  Composer 模式：多文件测试生成
# 提示："为 src/services/ 下所有 API 客户端生成 MSW mock 和测试"
```

---

## AI 项目上下文配置

### `.cursorrules` 示例（Cursor 项目级规则）

```yaml
# .cursorrules — Cursor IDE 项目级上下文配置
rules:
  - always_use_typescript_strict: true
  - prefer_explicit_return_types: true
  - testing_framework: vitest
  - mocking_library: msw
  - orm: prisma
  - ui_framework: react-19
  - style_guide: |
      - Use functional components with hooks
      - Prefer `const` arrow functions for event handlers
      - Use Zod for all runtime validation
      - Use `next-safe-action` for Server Actions
      - Never use `any` without `@ts-expect-error` comment
examples:
  - prompt: "Create a new API route"
    expected_pattern: "app/api/[resource]/route.ts with GET/POST handlers, Zod validation, Prisma query"
```

### MCP (Model Context Protocol) 工具调用

```typescript
// mcp-server-config.json — 连接外部数据源到 AI 工作流
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://localhost/mydb"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/project/src"]
    }
  }
}
```

通过 MCP，AI Agent 可直接查询数据库schema、读取文件系统，减少幻觉。

---

## 代码示例：Vercel AI SDK 流式响应

```typescript
// app/api/chat/route.ts — Next.js App Router 流式 AI 聊天
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a senior TypeScript engineer.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

```typescript
// app/page.tsx — 前端消费流式响应
'use client';
import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} placeholder="Ask about TypeScript..." />
      </form>
    </div>
  );
}
```

## 代码示例：OpenAI 结构化输出（Structured Outputs）

```typescript
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const CodeReviewSchema = z.object({
  summary: z.string().describe('变更摘要'),
  issues: z.array(z.object({
    severity: z.enum(['critical', 'warning', 'info']),
    line: z.number(),
    message: z.string(),
    suggestion: z.string(),
  })),
  score: z.number().min(0).max(10).describe('代码质量评分'),
});

export async function reviewCode(diff: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema: CodeReviewSchema,
    prompt: `Review the following TypeScript diff:\n\n${diff}`,
  });
  return object;
}
```

## 代码示例：LangChain.js Agent 工具调用

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';

const weatherTool = tool(
  async ({ city }) => {
    // 实际实现调用天气 API
    return `Weather in ${city}: 24°C, Sunny`;
  },
  {
    name: 'weather',
    description: 'Get current weather for a city',
    schema: z.object({ city: z.string() }),
  }
);

const model = new ChatOpenAI({ model: 'gpt-4o' });
const tools = [weatherTool];

const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant. Use tools when needed.'],
  ['placeholder', '{chat_history}'],
  ['human', '{input}'],
  ['placeholder', '{agent_scratchpad}'],
]);

const agent = createToolCallingAgent({ llm: model, tools, prompt });
const executor = new AgentExecutor({ agent, tools });

const result = await executor.invoke({
  input: 'What is the weather in Tokyo?',
});
console.log(result.output);
```

## 最佳实践

1. **始终人工审查**：AI 生成的代码需理解后再提交
2. **上下文管理**：提供充足的类型定义和示例，减少幻觉
3. **敏感数据隔离**：不向公共 AI 服务发送密钥、PII
4. **版本控制**：AI 修改的文件与人工修改分开展示
5. **知识库构建**：将项目规范、ADR 放入 AI 上下文，保持一致性
6. **渐进采用**：从测试生成 → 函数补全 → 模块重构逐步深入
7. **模型选择**：复杂架构设计用 Claude 3.7，快速补全用 GPT-4o-mini

---

## 参考链接

- [Cursor — The AI Code Editor](https://www.cursor.com/)
- [GitHub Copilot — Your AI pair programmer](https://github.com/features/copilot)
- [Sourcegraph Cody](https://sourcegraph.com/cody)
- [Continue.dev — Open-source AI code assistant](https://www.continue.dev/)
- [Claude Code — Agentic Coding](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview)
- [Ollama — Run LLMs locally](https://ollama.com/)
- [Aider — AI pair programming in your terminal](https://aider.chat/)
- [Model Context Protocol (MCP) — Anthropic](https://modelcontextprotocol.io/)
- [OpenAI API Documentation](https://platform.openai.com/docs/)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [LangChain.js Documentation](https://js.langchain.com/docs/)
- [Anthropic Model Context Protocol](https://modelcontextprotocol.io/)
- [AI SDK Patterns — Streaming](https://sdk.vercel.ai/docs/ai-sdk-ui/chatbot)
- [Zod — TypeScript-first Schema Validation](https://zod.dev/)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules)

---

*最后更新: 2026-04-29*
