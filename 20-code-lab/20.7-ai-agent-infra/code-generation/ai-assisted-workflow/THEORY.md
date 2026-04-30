# AI 辅助工作流

> **定位**：`20-code-lab/20.7-ai-agent-infra/code-generation/ai-assisted-workflow`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 AI 辅助开发流程的集成问题。涵盖代码生成、审查自动化和智能重构的工作流设计。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 提示工程 | 引导模型输出的输入结构化技巧 | prompts/ |
| 代码审查 | 自动化质量与安全问题检测 | review-bot.ts |

---

## 二、设计原理

### 2.1 为什么存在

AI 正在重塑软件开发的全流程。将 AI 能力嵌入代码生成、审查和重构环节，可以显著提升开发效率和代码质量。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| AI 生成 | 效率提升 | 需人工审查 | 样板代码 |
| 手工编写 | 质量可控 | 耗时 | 核心业务逻辑 |

### 2.3 与相关技术的对比

与传统开发对比：AI 辅助提升效率，但需要更高审查标准。

## 三、对比分析

| 维度 | AI 辅助工作流 | 传统手工开发 | 低代码平台 |
|------|-------------|-------------|-----------|
| 开发速度 | 极快（秒级生成） | 中等 | 快（拖拽） |
| 代码质量 | 依赖提示与模型能力 | 高（专家可控） | 中等（模板化） |
| 可维护性 | 需持续审查与重构 | 高 | 低（平台锁定） |
| 定制化 | 高（自然语言描述） | 最高 | 低 |
| 安全合规 | 需人工审计幻觉与漏洞 | 可控 | 可控 |
| JS/TS 生态 | Copilot/Cursor/Vercel v0 成熟 | 原生 | Retool/OutSystems |

---

## 四、实践映射

### 4.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 AI 辅助工作流 核心机制的理解，并观察不同实现选择带来的行为差异。

### 4.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| AI 生成代码无需审查 | AI 输出可能包含幻觉和安全隐患 |
| AI 辅助只适用于生成代码 | 也可用于测试生成、文档和重构建议 |

### 4.3 代码示例

#### 结构化提示驱动的代码生成工作流

```typescript
interface CodeGenPrompt {
  context: string;      // 现有代码库上下文
  instruction: string;  // 自然语言需求
  constraints: string[]; // 约束：类型安全、测试覆盖等
}

async function generateWithReview(prompt: CodeGenPrompt, apiKey: string) {
  // 1. 生成代码
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are a TypeScript expert.' },
        { role: 'user', content: `${prompt.context}\n${prompt.instruction}` },
      ],
    }),
  });
  const { choices } = await response.json();
  const generated = choices[0].message.content;

  // 2. 自动化审查（类型检查、lint、安全扫描）
  const audit = await runAudit(generated);
  return { generated, audit };
}

async function runAudit(code: string) {
  // 集成 tsc / ESLint / Semgrep 等
  return { issues: [] as string[] };
}
```

#### AST 感知智能重构提示

```typescript
// ast-aware-refactor.ts — 结合 TypeScript Compiler API 的上下文感知生成
import ts from 'typescript';

function extractContext(filePath: string, cursorLine: number): string {
  const sourceFile = ts.createSourceFile(
    filePath,
    ts.sys.readFile(filePath) || '',
    ts.ScriptTarget.Latest,
    true
  );

  let targetNode: ts.Node | null = null;
  function visit(node: ts.Node) {
    const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    if (line === cursorLine) targetNode = node;
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  // 提取当前函数/类的签名和类型信息作为上下文
  if (targetNode) {
    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return printer.printNode(ts.EmitHint.Unspecified, targetNode, sourceFile);
  }
  return '';
}

async function refactorWithASTContext(
  filePath: string,
  cursorLine: number,
  instruction: string,
  llm: (prompt: string) => Promise<string>
): Promise<string> {
  const context = extractContext(filePath, cursorLine);
  const prompt = `Refactor the following TypeScript code.\nInstruction: ${instruction}\n\nCode Context:\n${context}`;
  return llm(prompt);
}
```

#### 自动化测试生成工作流

```typescript
// test-generation.ts
interface TestGenInput {
  sourceCode: string;
  functionName: string;
  framework: 'vitest' | 'jest' | 'node:test';
}

async function generateUnitTests(input: TestGenInput, llm: (prompt: string) => Promise<string>): Promise<string> {
  const prompt = `
Generate comprehensive unit tests for the following function.
Use ${input.framework} syntax with TypeScript.
Include edge cases, error handling, and boundary conditions.

Function to test:
${input.sourceCode}

Requirements:
1. Test normal execution paths
2. Test invalid inputs and expected errors
3. Use descriptive test names (given-when-then or should-*)`;

  return llm(prompt);
}

// 批量测试生成流水线
async function batchGenerateTests(filePaths: string[], framework: 'vitest') {
  const results = await Promise.all(
    filePaths.map(async (path) => {
      const code = await fs.readFile(path, 'utf-8');
      const testCode = await generateUnitTests(
        { sourceCode: code, functionName: extractExports(code)[0], framework },
        mockLLM
      );
      const testPath = path.replace('.ts', '.test.ts');
      await fs.writeFile(testPath, testCode);
      return { source: path, test: testPath };
    })
  );
  return results;
}
```

#### MCP (Model Context Protocol) 集成示例

```typescript
// mcp-integration.ts — 通过 MCP 为 LLM 提供代码库上下文
interface MCPTool {
  name: string;
  description: string;
  inputSchema: object;
  execute: (args: unknown) => Promise<string>;
}

const codebaseSearchTool: MCPTool = {
  name: 'search_codebase',
  description: 'Search the codebase for function definitions, types, or patterns',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' },
      language: { type: 'string', enum: ['typescript', 'javascript'] },
    },
    required: ['query'],
  },
  async execute(args) {
    const { query } = args as { query: string };
    // 使用 ripgrep 或 tree-sitter 进行语义搜索
    const results = await semanticSearch(query);
    return JSON.stringify(results.slice(0, 10));
  },
};

async function mcpEnhancedGeneration(
  userRequest: string,
  tools: MCPTool[],
  llm: (prompt: string, tools: MCPTool[]) => Promise<string>
): Promise<string> {
  const systemPrompt = `You are an expert TypeScript developer with access to codebase tools. Use tools to gather context before generating code.`;
  return llm(`${systemPrompt}\n\nUser Request: ${userRequest}`, tools);
}
```

### 4.4 多智能体协作工作流

```typescript
// multi-agent-workflow.ts
interface Agent {
  name: string;
  role: string;
  run(context: string): Promise<string>;
}

class CodeReviewerAgent implements Agent {
  name = 'Reviewer';
  role = '审查代码风格、类型安全和潜在 bug';
  async run(context: string): Promise<string> {
    const prompt = `Review the following TypeScript code for:
1. Type safety issues
2. Potential null/undefined errors
3. Performance anti-patterns
4. Missing error handling

Code:
${context}
Respond with structured JSON: { "issues": [{ "severity", "line", "message" }] }`;
    return llm(prompt);
  }
}

class TestWriterAgent implements Agent {
  name = 'TestWriter';
  role = '生成边界条件测试';
  async run(context: string): Promise<string> {
    const prompt = `Write Vitest unit tests for:\n${context}\nInclude edge cases and error paths.`;
    return llm(prompt);
  }
}

async function runMultiAgentPipeline(code: string, agents: Agent[]) {
  const results: Record<string, string> = {};
  for (const agent of agents) results[agent.name] = await agent.run(code);
  return results;
}
```

### 4.5 RAG 增强代码生成

```typescript
// rag-code-generation.ts
interface CodeEmbedding { filePath: string; content: string; embedding: number[]; }

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function retrieveRelevantContext(query: string, codebase: CodeEmbedding[], topK = 5) {
  const queryEmbedding = await embedText(query);
  const scored = codebase.map(doc => ({ doc, score: cosineSimilarity(queryEmbedding, doc.embedding) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map(s => s.doc);
}
```

### 4.6 结构化输出与 Zod 验证

```typescript
// structured-output.ts
import { z } from 'zod';

const RefactorSchema = z.object({
  summary: z.string(),
  changes: z.array(z.object({
    filePath: z.string(), originalCode: z.string(),
    refactoredCode: z.string(), reasoning: z.string(),
  })),
  testsAdded: z.boolean(),
});

type RefactorResult = z.infer<typeof RefactorSchema>;

async function structuredRefactor(code: string): Promise<RefactorResult> {
  const prompt = `Refactor the code. Respond with valid JSON matching schema...
Code:\n${code}`;
  const raw = await llm(prompt);
  return RefactorSchema.parse(JSON.parse(raw));
}
```

### 4.7 扩展阅读

- [GitHub Copilot](https://github.com/features/copilot)
- [GitHub Copilot API — Copilot Extensions](https://docs.github.com/en/copilot/building-copilot-extensions)
- [Cursor — AI Code Editor](https://cursor.com/)
- [Cursor Rules Documentation](https://docs.cursor.com/context/rules-for-ai)
- [Vercel v0](https://v0.dev/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenAI Codex — Code Generation Model](https://platform.openai.com/docs/guides/codex)
- [Anthropic Computer Use Beta](https://docs.anthropic.com/en/docs/build-with-claude/computer-use)
- [Vercel AI SDK — Generative UI](https://sdk.vercel.ai/docs/ai-sdk-ui/overview)
- [MCP (Model Context Protocol) — Introduction](https://modelcontextprotocol.io/introduction)
- [Aider — AI Pair Programming in Terminal](https://aider.chat/)
- [SWE-bench — Evaluating LLMs on Software Engineering](https://www.swebench.com/)
- `20.7-ai-agent-infra/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
