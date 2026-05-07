# 06. AI 测试与评估

## 为什么 AI 测试不同于传统测试？

| 传统测试 | AI 测试 |
|---------|---------|
| 输入 → 输出 确定性 | 输入 → 输出 概率性 |
| `expect(add(2,2)).toBe(4)` | 语义相似度 > 0.8 |
| 单元测试覆盖 | 评估数据集 + 人工审核 |

## 评估维度

| 维度 | 指标 | 工具 |
|------|------|------|
| **正确性** | 准确率、F1 Score | 自定义脚本 |
| **幻觉率** | 事实一致性 | LLM-as-judge |
| **延迟** | TTFT, TPS | 平台内置 |
| **成本** | $/1K tokens | 账单监控 |

## 自动化评估框架

```typescript
// lib/eval/framework.ts
interface EvalCase {
  input: string;
  expected?: string;
  criteria: string[];
}

async function runEval(cases: EvalCase[], model: string) {
  const results = [];

  for (const testCase of cases) {
    const start = Date.now();
    const output = await generate(testCase.input, model);
    const latency = Date.now() - start;

    // LLM-as-judge 评分
    const score = await judgeQuality(testCase.input, output, testCase.criteria);

    results.push({ ...testCase, output, latency, score });
  }

  return results;
}

// LLM 作为评判者
async function judgeQuality(input: string, output: string, criteria: string[]) {
  const prompt = `
    评估以下回答质量 (1-10):
    问题: ${input}
    回答: ${output}
    标准: ${criteria.join(', ')}

    只返回数字评分。
  `;

  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0,
  });

  return parseInt(result.choices[0].message.content || '0');
}
```

## RAG 专项评估

```typescript
// RAGAS-style 评估
interface RagEvalResult {
  faithfulness: number;    // 回答是否基于检索文档
  answerRelevancy: number; // 回答是否相关
  contextPrecision: number; // 检索文档的相关比例
  contextRecall: number;    // 是否检索到所有必要文档
}

async function evaluateRag(
  question: string,
  answer: string,
  contexts: string[],
  groundTruth: string
): Promise<RagEvalResult> {
  return {
    faithfulness: await checkFaithfulness(answer, contexts),
    answerRelevancy: await checkRelevancy(question, answer),
    contextPrecision: await checkPrecision(question, contexts),
    contextRecall: await checkRecall(groundTruth, contexts),
  };
}
```

## CI/CD 集成

```yaml
# .github/workflows/ai-eval.yml
name: AI Evaluation

on:
  push:
    paths: ['lib/ai/**', 'prompts/**']

jobs:
  eval:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run eval
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
      - uses: actions/upload-artifact@v4
        with:
          name: eval-results
          path: eval-results.json
```

## 延伸阅读

- [RAGAS Framework](https://docs.ragas.io/)
- [OpenAI Evals](https://github.com/openai/evals)
- [MLflow LLM Evaluation](https://mlflow.org/docs/latest/llms/llm-evaluate/index.html)
