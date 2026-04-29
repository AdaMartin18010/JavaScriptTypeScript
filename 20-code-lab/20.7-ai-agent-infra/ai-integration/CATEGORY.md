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

### Function Calling 与结构化输出

```typescript
// llm-apis/function-calling.ts
import { z } from 'zod';
import OpenAI from 'openai';

const WeatherSchema = z.object({
  location: z.string().describe('城市名称'),
  unit: z.enum(['celsius', 'fahrenheit']).default('celsius'),
});

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市的当前天气',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: '城市名称' },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
        },
        required: ['location'],
      },
    },
  },
];

async function agentWithTools(userMessage: string) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: userMessage }],
    tools,
    tool_choice: 'auto',
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (toolCall?.function.name === 'get_weather') {
    const args = WeatherSchema.parse(JSON.parse(toolCall.function.arguments));
    return fetchWeather(args.location, args.unit);
  }
  return response.choices[0]?.message?.content;
}

async function fetchWeather(location: string, unit: string) {
  return { location, temperature: 22, unit, condition: 'sunny' };
}
```

### ReAct Agent 循环实现

```typescript
// agents/react-agent.ts
interface AgentStep {
  thought: string;
  action: string;
  observation: string;
}

class ReActAgent {
  private tools: Map<string, (input: string) => Promise<string>> = new Map();

  registerTool(name: string, handler: (input: string) => Promise<string>): void {
    this.tools.set(name, handler);
  }

  async run(query: string, maxSteps = 10): Promise<string> {
    const history: AgentStep[] = [];
    let currentQuery = query;

    for (let i = 0; i < maxSteps; i++) {
      const prompt = this.buildPrompt(currentQuery, history);
      const llmResponse = await this.callLLM(prompt);

      const thoughtMatch = llmResponse.match(/Thought:\s*(.+)/);
      const actionMatch = llmResponse.match(/Action:\s*(\w+)\[(.*?)\]/);

      if (!thoughtMatch) break;

      const thought = thoughtMatch[1].trim();

      if (!actionMatch) {
        // Agent 决定直接回答
        const answerMatch = llmResponse.match(/Answer:\s*(.+)/s);
        return answerMatch ? answerMatch[1].trim() : llmResponse;
      }

      const [, actionName, actionInput] = actionMatch;
      const tool = this.tools.get(actionName);
      const observation = tool ? await tool(actionInput) : `Tool "${actionName}" not found`;

      history.push({ thought, action: `${actionName}[${actionInput}]`, observation });
    }

    return history.map((h) => `Thought: ${h.thought}\nObservation: ${h.observation}`).join('\n');
  }

  private buildPrompt(query: string, history: AgentStep[]): string {
    const toolList = Array.from(this.tools.keys()).map((t) => `- ${t}[input]`).join('\n');
    const historyText = history
      .map((h) => `Thought: ${h.thought}\nAction: ${h.action}\nObservation: ${h.observation}`)
      .join('\n');

    return `You are a reasoning agent. Available tools:\n${toolList}\n\nQuestion: ${query}\n${historyText}\nThought:`;
  }

  private async callLLM(prompt: string): Promise<string> {
    // 实际实现中调用 OpenAI / Anthropic 等
    return `Thought: Analyzing...\nAction: search[${prompt.slice(0, 20)}]`;
  }
}
```

### RAG 流水线：文档分块与检索

```typescript
// rag/rag-pipeline.ts
interface DocumentChunk {
  id: string;
  text: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

class SimpleRAGPipeline {
  private chunks: DocumentChunk[] = [];

  addDocument(text: string, metadata: Record<string, unknown>, chunkSize = 500, overlap = 50): void {
    // 滑动窗口分块
    for (let i = 0; i < text.length; i += chunkSize - overlap) {
      const chunkText = text.slice(i, i + chunkSize);
      this.chunks.push({
        id: `${metadata.id}-${i}`,
        text: chunkText,
        embedding: [], // 实际应由 embedding API 生成
        metadata: { ...metadata, position: i },
      });
    }
  }

  async retrieve(queryEmbedding: number[], topK = 3): Promise<DocumentChunk[]> {
    const scored = this.chunks.map((chunk) => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, topK).map((s) => s.chunk);
  }

  async generateAnswer(query: string, retrievedChunks: DocumentChunk[]): Promise<string> {
    const context = retrievedChunks.map((c) => c.text).join('\n---\n');
    const prompt = `Based on the following context, answer the question.\n\nContext:\n${context}\n\nQuestion: ${query}\nAnswer:`;
    // 调用 LLM API
    return prompt;
  }
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] ** 2;
    nb += b[i] ** 2;
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
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
- [Google Gemini API 文档](https://ai.google.dev/gemini-api/docs)
- [Ollama JavaScript Library](https://github.com/ollama/ollama-js)
- [Mastra.ai — AI Agent Framework](https://mastra.ai/docs)
- [LlamaIndex TS 文档](https://ts.llamaindex.ai/)
- [Cohere API 文档](https://docs.cohere.com/)
- [Weaviate 向量数据库](https://weaviate.io/developers/weaviate)
- [Chroma DB 文档](https://docs.trychroma.com/)
- [Arize AI — RAG Evaluation](https://docs.arize.com/arize/llm-tracing)

## 关联模块

- `55-ai-testing` — AI 辅助测试
- `56-code-generation` — AI 辅助代码生成
- `82-edge-ai` — 边缘 AI 推理
- `85-nlp-engineering` — NLP 工程
- `89-autonomous-systems` — 自主系统
- `94-ai-agent-lab` — Agent 实战实验室
- `examples/ai-agent-production/` — 生产级示例
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引
