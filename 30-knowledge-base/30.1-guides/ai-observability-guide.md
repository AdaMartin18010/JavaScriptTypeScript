# AI 可观测性完整指南

> **定位**：`30-knowledge-base/30.1-guides/`
> **新增**：2026-04

---

## 一、为什么 AI 需要可观测性

生产级 AI 系统面临独特的可观测性挑战：

| 挑战 | 传统可观测性 | AI 可观测性 |
|------|------------|------------|
| **输出不确定性** | 确定性响应 | 概率性输出，相同输入不同结果 |
| **延迟来源** | 代码执行 | 模型推理时间（LLM API 延迟） |
| **成本追踪** | CPU/内存 | Token 消耗、模型调用次数 |
| **质量评估** | 单元测试 | 人工评估、自动评分（RAGAS） |
| **调试难度** | 堆栈跟踪 | Prompt/上下文/模型版本的复杂交互 |

---

## 二、OpenTelemetry LLM Semantic Conventions

OpenTelemetry 于 2025-2026 定义了 LLM 调用的语义约定：

### 2.1 Span 属性

| 属性 | 说明 | 示例 |
|------|------|------|
| `gen_ai.system` | AI 系统标识 | `openai`, `anthropic` |
| `gen_ai.request.model` | 请求模型 | `gpt-4o` |
| `gen_ai.usage.input_tokens` | 输入 token 数 | 1024 |
| `gen_ai.usage.output_tokens` | 输出 token 数 | 512 |
| `gen_ai.response.finish_reason` | 完成原因 | `stop`, `length` |

### 2.2 事件（Events）

```
Event: gen_ai.content.prompt
  - body: Prompt 内容（脱敏后）

Event: gen_ai.content.completion
  - body: 完成内容
```

---

## 三、工具生态

| 工具 | 类型 | 开源 | 核心功能 |
|------|------|------|---------|
| **Langfuse** | 追踪平台 | ✅ | LLM 调用追踪、成本分析、Prompt 版本管理 |
| **LangSmith** | 追踪平台 | ❌ | LangChain 原生集成、评估工作流 |
| **Helicone** | 网关+观测 | ✅ | 代理层拦截、缓存、成本优化 |
| **Weights & Biases** | ML 实验 | ✅ | 模型版本、实验对比 |
| **Phoenix** | 评估平台 | ✅ | RAG 评估、漂移检测 |

---

## 四、TypeScript 集成示例

```typescript
// OpenTelemetry + Langfuse 集成
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseExporter } from 'langfuse-vercel';

const sdk = new NodeSDK({
  traceExporter: new LangfuseExporter({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY,
    secretKey: process.env.LANGFUSE_SECRET_KEY,
    baseUrl: 'https://cloud.langfuse.com'
  })
});

sdk.start();

// AI SDK 自动追踪
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: '解释 TypeScript 的类型擦除',
  // 自动生成 OpenTelemetry spans
});
```

---

## 五、成本追踪模型

```typescript
interface TokenCost {
  inputTokens: number;
  outputTokens: number;
  model: string;
  costPer1KInput: number;  // USD
  costPer1KOutput: number; // USD
}

function calculateCost(usage: TokenCost): number {
  const inputCost = (usage.inputTokens / 1000) * usage.costPer1KInput;
  const outputCost = (usage.outputTokens / 1000) * usage.costPer1KOutput;
  return inputCost + outputCost;
}

// GPT-4o: $5/1M input, $15/1M output
// Claude 3.5 Sonnet: $3/1M input, $15/1M output
```

---

*本指南为生产级 AI 系统的可观测性完整参考。*
