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

### 客户端 React 流式消费组件

```tsx
// components/ChatStream.tsx
'use client';

import { useState, useCallback } from 'react';

export function ChatStream() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    setIsLoading(true);

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: input }),
    });

    if (!response.body) return;

    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();

    let currentMessage = '';
    setMessages(prev => [...prev, `User: ${input}`, 'AI: ']);
    setInput('');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      currentMessage += value;
      // 更新最后一条消息
      setMessages(prev => [
        ...prev.slice(0, -1),
        `AI: ${currentMessage}`,
      ]);
    }

    setIsLoading(false);
  }, [input]);

  return (
    <div>
      <div>
        {messages.map((msg, i) => (
          <p key={i}>{msg}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && sendMessage()}
        disabled={isLoading}
      />
      <button onClick={sendMessage} disabled={isLoading}>
        Send
      </button>
    </div>
  );
}
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

### MCP (Model Context Protocol) TypeScript SDK 示例

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// 创建 MCP 客户端，连接本地工具服务器
const transport = new StdioClientTransport({
  command: 'npx',
  args: ['-y', '@modelcontextprotocol/server-filesystem', '/path/to/allowed/dir'],
});

const client = new Client({ name: 'my-app', version: '1.0.0' });
await client.connect(transport);

// 列出可用工具
const tools = await client.listTools();
console.log('Available tools:', tools.tools.map(t => t.name));

// 调用工具
const result = await client.callTool({
  name: 'read_file',
  arguments: { path: '/path/to/allowed/dir/example.md' },
});

console.log(result.content);
await client.close();
```

### AI SDK 多模型路由与 Fallback

```typescript
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { google } from '@ai-sdk/google';

// 多模型 fallback 策略
async function resilientGenerate(prompt: string) {
  const providers = [
    { name: 'openai', model: openai('gpt-4o') },
    { name: 'anthropic', model: anthropic('claude-3-5-sonnet-20241022') },
    { name: 'google', model: google('gemini-2.0-flash') },
  ];

  for (const provider of providers) {
    try {
      const { text } = await generateText({
        model: provider.model,
        prompt,
        maxRetries: 2,
      });
      return { provider: provider.name, text };
    } catch (error) {
      console.warn(`${provider.name} failed:`, error);
      continue;
    }
  }

  throw new Error('All AI providers failed');
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
6. **MCP 标准化**：使用 Model Context Protocol 统一工具接入，避免供应商锁定

---

## 权威链接

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Vercel AI SDK Quickstart](https://sdk.vercel.ai/docs/getting-started)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [LangChain.js](https://js.langchain.com/)
- [LlamaIndex TypeScript](https://ts.llamaindex.ai/)
- [What is RAG? – OpenAI](https://platform.openai.com/docs/guides/retrieval-augmented-generation)
- [Mastra – TypeScript Agent Framework](https://mastra.ai/)
- [Anthropic API Documentation](https://docs.anthropic.com/en/api/getting-started)
- [Google Gemini API](https://ai.google.dev/gemini-api/docs)
- [Cohere API Reference](https://docs.cohere.com/)
- [Zod Schema Validation](https://zod.dev/)
- [Hugging Face — Embeddings Guide](https://huggingface.co/docs/transformers/model_doc/auto#transformers.AutoModel)
- [pgvector — PostgreSQL Vector Extension](https://github.com/pgvector/pgvector)
- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [OpenAI Assistants API](https://platform.openai.com/docs/assistants/overview)
- [Vercel AI SDK RAG Guide](https://sdk.vercel.ai/docs/guides/rag-chatbot)
- [LangChain Expression Language (LCEL)](https://js.langchain.com/docs/concepts/#langchain-expression-language-lcel)
- [OpenAI Tokenizer](https://platform.openai.com/tokenizer)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Weaviate Vector Database](https://weaviate.io/developers/weaviate)

---

*最后更新: 2026-04-29*
