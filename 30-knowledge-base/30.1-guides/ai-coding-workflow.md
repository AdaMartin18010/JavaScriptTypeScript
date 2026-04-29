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

### 3. 测试生成

```bash
# 用 AI 生成单元测试
claude "为 src/utils/date.ts 生成 vitest 测试用例，覆盖边界条件"

# Cursor  Composer 模式：多文件测试生成
# 提示："为 src/services/ 下所有 API 客户端生成 MSW mock 和测试"
```

---

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

---

*最后更新: 2026-04-29*
