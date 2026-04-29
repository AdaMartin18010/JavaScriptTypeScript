---
dimension: 应用领域
application-domain: AI 与 Agent 应用
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: AI 辅助测试 — 测试生成、突变测试、LLM-as-Judge
- **模块编号**: 55-ai-testing

## 边界说明

本模块聚焦 AI 在测试领域的应用，包括：

- AI 测试生成与覆盖率分析
- 突变测试与模糊测试
- 视觉回归与智能测试选择
- LLM-as-a-Judge 评估模式

通用测试框架（Jest/Vitest/Playwright）本身不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `ai-test-generator.ts` | LLM 驱动的测试用例生成 | `ai-test-generator.test.ts` |
| `coverage-calculator.ts` | 覆盖率分析与缺口检测 | `coverage-calculator.test.ts` |
| `mutation-testing.ts` | 代码突变与测试健壮性评估 | `mutation-testing.test.ts` |
| `fuzzing-generator.ts` | 基于 AI 的模糊输入生成 | `fuzzing-generator.test.ts` |
| `property-based-generator.ts` | 属性基测试生成（fast-check 风格） | `property-based-generator.test.ts` |
| `smart-test-selector.ts` | 变更影响分析与智能测试选择 | `smart-test-selector.test.ts` |
| `visual-regression.ts` | AI 视觉回归检测 | `visual-regression.test.ts` |
| `llm-as-judge.ts` | LLM 作为评估者的模式实现 | `llm-as-judge.test.ts` |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### LLM 测试生成器

```typescript
// ai-test-generator.ts
export async function generateTests(
  sourceCode: string,
  llm: { complete(prompt: string): Promise<string> }
): Promise<string> {
  const prompt = `
You are a senior TypeScript engineer. Write comprehensive unit tests
using Vitest for the following code. Cover edge cases and error paths.

${sourceCode}

Output only the test file content.
  `.trim();

  return llm.complete(prompt);
}
```

### 突变测试核心逻辑

```typescript
// mutation-testing.ts
export function mutateOperator(node: { type: string; operator: string }) {
  const swaps: Record<string, string> = {
    '+': '-',
    '-': '+',
    '*': '/',
    '/': '*',
    '===': '!==',
    '!==': '===',
    '>': '<=',
    '<': '>=',
  };

  if (node.type === 'BinaryExpression' && swaps[node.operator]) {
    return { ...node, operator: swaps[node.operator] };
  }
  return null;
}

export async function runMutationSuite(
  source: string,
  testRunner: (code: string) => Promise<boolean>
): Promise<{ killed: number; survived: number }> {
  // 简化：遍历 AST 生成突变体并运行测试
  const mutations = collectMutations(source);
  let killed = 0;
  let survived = 0;

  for (const mutant of mutations) {
    const passed = await testRunner(mutant);
    passed ? survived++ : killed++;
  }

  return { killed, survived };
}
```

### LLM-as-Judge 评估模式

```typescript
// llm-as-judge.ts
export async function llmAsJudge(
  candidate: string,
  reference: string,
  criteria: string[],
  llm: { complete(prompt: string): Promise<string> }
): Promise<Record<string, number>> {
  const prompt = `
Evaluate the following candidate output against the reference.
Score each criterion from 1 to 10.

Criteria: ${criteria.join(', ')}

Reference: ${reference}
Candidate: ${candidate}

Output JSON only: { "criterion": score }
  `.trim();

  const response = await llm.complete(prompt);
  return JSON.parse(response);
}
```

## 关联模块

- `33-ai-integration` — AI 集成
- `56-code-generation` — 代码生成
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Stryker Mutator | 文档 | [stryker-mutator.io](https://stryker-mutator.io) |
| fast-check | 文档 | [dubzzz.github.io/fast-check.github.com](https://dubzzz.github.io/fast-check.github.com) |
| Playwright Visual Comparisons | 文档 | [playwright.dev/docs/test-snapshots](https://playwright.dev/docs/test-snapshots) |
| Arize AI — LLM Evaluation | 指南 | [docs.arize.com/phoenix](https://docs.arize.com/phoenix) |
| Coverage.js (c8) | 文档 | [github.com/bcoe/c8](https://github.com/bcoe/c8) |
| Evals Framework — OpenAI | 文档 | [github.com/openai/evals](https://github.com/openai/evals) |

---

*最后更新: 2026-04-29*
