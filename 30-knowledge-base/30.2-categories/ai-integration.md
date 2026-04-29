# AI 集成

> JavaScript/TypeScript 项目中集成 AI 能力的方案与最佳实践。

---

## 核心能力

| 能力 | 方案 | 代表工具 |
|------|------|---------|
| **代码补全** | IDE 插件 | GitHub Copilot, Cursor |
| **文本生成** | LLM API | OpenAI, Anthropic, Gemini |
| **图像生成** | Diffusion API | DALL-E, Midjourney, Stable Diffusion |
| **Embedding** | 向量检索 | OpenAI Embedding, Cohere |
| **Agent 框架** | 工具调用 + 推理 | LangChain, Vercel AI SDK |

---

## AI 集成模式对比

| 维度 | RAG（检索增强生成） | Fine-tuning（微调） | Agents（智能体） |
|------|---------------------|---------------------|-----------------|
| **核心思想** | 动态检索外部知识库，注入上下文 | 在预训练模型基础上继续训练特定任务数据 | LLM + 工具调用 + 推理循环，自主完成任务 |
| **数据需求** | 低：只需文档/向量库 | 高：数千至数万条标注样本 | 中：工具 API 定义 + 少量示例 |
| **成本** | 低（API 调用 + 向量存储） | 高（训练计算 + 数据标注） | 中（多次 API 调用 + 推理开销） |
| **延迟** | 中（检索 + 生成） | 低（单次推理） | 高（多轮推理 + 工具调用） |
| **知识时效性** | 实时更新向量库即可 | 需重新训练 | 实时（取决于工具接入的数据源） |
| **适用场景** | 客服问答、企业知识库、文档助手 | 品牌语气、特定格式输出、代码风格 | 自动化工作流、复杂多步骤任务 |
| **JS/TS 生态** | LlamaIndexTS, Vercel AI SDK RAG | OpenAI Fine-tuning API | Vercel AI SDK, LangChain.js, Mastra |

---

## Vercel AI SDK

```typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: '解释 React Server Components',
})
```

---

## Code Example: OpenAI Embeddings + RAG

```typescript
import { openai } from '@ai-sdk/openai';
import { embed, generateText } from 'ai';

// 1. 将文档分块并生成 embeddings
async function createEmbedding(text: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding; // number[] (1536-dim)
}

// 2. 向量检索（伪代码：使用 pgvector / pinecone / milvus）
async function retrieveContext(query: string, vectorStore: VectorStore) {
  const queryEmbedding = await createEmbedding(query);
  const results = await vectorStore.similaritySearch(queryEmbedding, 5);
  return results.map(r => r.content).join('\n---\n');
}

// 3. RAG 生成
async function ragAnswer(question: string, vectorStore: VectorStore) {
  const context = await retrieveContext(question, vectorStore);
  const { text } = await generateText({
    model: openai('gpt-4o-mini'),
    system: '你是一个基于知识库的助手。只能使用提供的上下文回答问题。',
    prompt: `上下文：\n${context}\n\n问题：${question}`,
  });
  return text;
}
```

---

## Code Example: 流式文本生成（AI SDK）

```typescript
import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: '你是一位资深 TypeScript 工程师。',
    prompt,
  });

  return result.toDataStreamResponse();
}

// 客户端消费流
// const response = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({ prompt }) });
// const reader = response.body?.pipeThrough(new TextDecoderStream()).getReader();
// while (reader) {
//   const { done, value } = await reader.read();
//   if (done) break;
//   console.log(value);
// }
```

---

## Code Example: Agent 工具调用（Vercel AI SDK）

```typescript
import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const weatherTool = tool({
  description: '获取指定城市的当前天气',
  parameters: z.object({
    city: z.string().describe('城市名称，如 Beijing'),
    unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
  }),
  execute: async ({ city, unit }) => {
    // 实际调用天气 API
    const res = await fetch(`https://api.weather.example.com/v1/current?city=${city}&unit=${unit}`);
    return res.json();
  },
});

async function runAgent(query: string) {
  const { text, toolCalls } = await generateText({
    model: openai('gpt-4o'),
    tools: { getWeather: weatherTool },
    prompt: query,
    maxToolRoundtrips: 3, // 允许最多 3 轮工具调用
  });
  return { text, toolCalls };
}

// const result = await runAgent('北京今天天气怎么样？');
```

---

## Code Example: 结构化输出（Object Generation）

```typescript
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

const schema = z.object({
  title: z.string().describe('文章标题'),
  summary: z.string().max(200).describe('200字以内摘要'),
  tags: z.array(z.string()).max(5).describe('相关标签'),
  sentiment: z.enum(['positive', 'neutral', 'negative']).describe('情感倾向'),
});

async function analyzeArticle(content: string) {
  const { object } = await generateObject({
    model: openai('gpt-4o'),
    schema,
    prompt: `分析以下文章内容，提取结构化信息：\n\n${content}`,
  });
  return object; // 类型为 z.infer<typeof schema>
}
```

---

## 最佳实践

1. **流式响应**：使用 `streamText` 提升用户体验
2. **错误处理**：LLM 可能超时或失败，设计降级策略
3. **成本控制**：监控 Token 使用量，设置预算上限
4. **隐私合规**：敏感数据不发送至公共 LLM
5. **Embedding 模型选型**：
   - 通用语义：`text-embedding-3-small`（性价比高）
   - 代码检索：`text-embedding-3-large` 或专用代码模型
   - 多语言：Cohere `embed-multilingual-v3`

---

## 权威链接

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [LangChain.js](https://js.langchain.com/)
- [LlamaIndex TypeScript](https://ts.llamaindex.ai/)
- [What is RAG? – OpenAI](https://platform.openai.com/docs/guides/retrieval-augmented-generation)
- [Mastra – TypeScript Agent Framework](https://mastra.ai/)
- [Anthropic API Documentation](https://docs.anthropic.com/en/api/getting-started)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Cohere API Reference](https://docs.cohere.com/)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [Zod Schema Validation](https://zod.dev/)
- [Hugging Face — Embeddings Guide](https://huggingface.co/docs/transformers/model_doc/auto#transformers.AutoModel)
- [pgvector — PostgreSQL Vector Extension](https://github.com/pgvector/pgvector)

---

*最后更新: 2026-04-29*
