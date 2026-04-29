---
dimension: 应用领域
application-domain: AI 与 Agent 应用
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: AI 与 Agent 应用 — LLM 集成、RAG、Embedding 与 AI-Native 开发
- **模块编号**: 33-ai-integration

## 边界说明

本模块聚焦 AI 技术在 JS/TS 应用中的落地实现，包括：

- LLM API 调用与 Prompt 工程
- Embedding 与向量检索
- RAG 架构与 Function Calling
- Streaming 处理与 AI SDK 模式

底层模型训练、GPU 集群和 AI 框架本身的对比选型不属于本模块范围（请参见 `30-knowledge-base/30.2-categories/28-ai-agent-infrastructure.md`）。

## 子模块目录

| 子模块 | 说明 | 关键文件 |
|---|---|---|
| llm-apis | OpenAI、Anthropic、Gemini 等 LLM API 调用与 Streaming | `llm-apis/README.md` |
| embeddings | 文本 Embedding 生成、向量存储与相似度计算 | `embeddings/README.md` |
| agents | Agent 架构：ReAct、Plan-and-Execute、Multi-Agent 编排 | `agents/README.md` |
| rag | RAG 流程：文档分块、检索、重排序与生成增强 | `rag/README.md` |
| fine-tuning | 模型微调数据准备、评估与轻量微调（LoRA/QLoRA） | `fine-tuning/README.md` |

## 核心代码示例

### OpenAI API Streaming 调用

```ts
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function streamChat() {
  const stream = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: 'Explain async/await in JavaScript' }],
    stream: true,
  });

  for await (const chunk of stream) {
    process.stdout.write(chunk.choices[0]?.delta?.content ?? '');
  }
}
streamChat();
```

### 向量相似度检索（余弦相似度）

```ts
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] ** 2;
    normB += b[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

const query = [0.1, 0.2, 0.3];
const docs = [
  { id: '1', embedding: [0.1, 0.19, 0.31] },
  { id: '2', embedding: [0.9, 0.1, 0.0] },
];
const ranked = docs
  .map(d => ({ ...d, score: cosineSimilarity(query, d.embedding) }))
  .sort((a, b) => b.score - a.score);
console.log(ranked);
```

### Vercel AI SDK 流式响应

```ts
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });
  return result.toDataStreamResponse();
}
```

## 权威外部链接

- [OpenAI Platform 文档](https://platform.openai.com/docs)
- [Anthropic API 文档](https://docs.anthropic.com/en/docs/welcome)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs)
- [LangChain.js 文档](https://js.langchain.com/docs/introduction)
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js)
- [Pinecone 向量数据库文档](https://docs.pinecone.io/)
- [OpenAI Embeddings 指南](https://platform.openai.com/docs/guides/embeddings)

## 关联模块

- `55-ai-testing` — AI 辅助测试
- `56-code-generation` — AI 辅助代码生成
- `82-edge-ai` — 边缘 AI 推理
- `85-nlp-engineering` — NLP 工程
- `89-autonomous-systems` — 自主系统
- `94-ai-agent-lab` — Agent 实战实验室
- `examples/ai-agent-production/` — 生产级示例
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引
