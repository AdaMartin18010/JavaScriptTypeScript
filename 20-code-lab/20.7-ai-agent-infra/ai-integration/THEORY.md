# AI 集成 — 理论基础

## 1. 核心概念

AI 集成是指将大型语言模型（LLM）的能力嵌入到应用程序中，使其具备理解、生成和推理能力。这一过程涉及三个关键层次：

### 1.1 模型层

- **LLM API**: OpenAI GPT-4o、Claude 3.5、Gemini 2.0 等通过 REST API 或 SDK 提供服务
- **本地模型**: Ollama、LM Studio 支持在本地运行开源模型（Llama 3、Qwen 2.5）
- **模型路由**: 根据任务复杂度自动选择合适模型（简单任务→轻量模型，复杂任务→大模型）

### 1.2 提示工程层

- **Zero-shot/Few-shot**: 直接提问或提供示例引导模型输出
- **Chain-of-Thought (CoT)**: 要求模型展示推理过程，提升复杂问题准确率
- **ReAct 模式**: 推理（Reasoning）与行动（Acting）交替，使模型能调用工具
- **结构化输出**: 通过 JSON Schema 约束模型输出格式，确保可解析性

### 1.3 应用架构层

- **RAG (Retrieval-Augmented Generation)**: 将外部知识库与生成模型结合，解决幻觉问题
- **Function Calling**: 模型输出结构化函数调用参数，由应用层执行
- **Agent Loop**: 观察→思考→行动→观察的循环，实现自主任务执行
- **Memory 管理**: 短期记忆（上下文窗口）与长期记忆（向量数据库）的结合

## 2. AI 集成模式对比

| 维度 | Direct API | RAG | Function Calling | Agents |
|------|-----------|-----|------------------|--------|
| **复杂度** | 低 | 中等 | 中等 | 高 |
| **延迟** | 低 | 中等（检索+生成） | 中等 | 高（多轮循环） |
| **准确性** | 依赖模型知识截止 | 高（外部知识增强） | 高（结构化确定性） | 高（工具组合） |
| **适用场景** | 通用对话、文本生成 | 客服、知识库问答 | 计算器、API 调用、表单填充 | 自动化任务、研究助手 |
| **成本** | 低 | 中等（向量存储+Embedding） | 低 | 高（多轮 Token） |
| **可解释性** | 低 | 中等（可追溯来源） | 高 | 中等 |
| **典型产品** | ChatGPT、Claude.ai | Perplexity、企业知识库 | GitHub Copilot Chat | AutoGPT、Devin |

## 3. OpenAI Function Calling 代码示例

```typescript
import OpenAI from 'openai';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const tools: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'get_weather',
      description: '获取指定城市的当前天气',
      parameters: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称，如 Beijing' },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'], default: 'celsius' }
        },
        required: ['city']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'search_products',
      description: '根据关键词搜索商品',
      parameters: {
        type: 'object',
        properties: {
          keyword: { type: 'string' },
          max_results: { type: 'number', default: 5 }
        },
        required: ['keyword']
      }
    }
  }
];

async function runConversation(userInput: string) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: '你是一个有用的助手，可以查询天气和搜索商品。' },
    { role: 'user', content: userInput }
  ];

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools,
    tool_choice: 'auto'
  });

  const choice = response.choices[0];

  // 模型决定调用函数
  if (choice.finish_reason === 'tool_calls') {
    const toolCall = choice.message.tool_calls![0];
    const args = JSON.parse(toolCall.function.arguments);

    // 实际执行函数（这里用 mock 代替）
    const result = toolCall.function.name === 'get_weather'
      ? { city: args.city, temperature: 22, condition: 'sunny' }
      : { products: [{ name: 'Demo Product', price: 99 }] };

    // 将结果回传给模型生成最终回复
    messages.push(choice.message);
    messages.push({
      role: 'tool',
      tool_call_id: toolCall.id,
      content: JSON.stringify(result)
    });

    const final = await client.chat.completions.create({
      model: 'gpt-4o',
      messages
    });
    return final.choices[0].message.content;
  }

  return choice.message.content;
}

runConversation('北京今天天气怎么样？').then(console.log);
```

### 结构化输出与 Zod 约束

```typescript
// structured-output.ts — 使用 response_format + zod 强类型解析
import { z } from 'zod';
import OpenAI from 'openai';

const ProductSchema = z.object({
  name: z.string(),
  price: z.number().positive(),
  categories: z.array(z.string()),
  inStock: z.boolean(),
});

type Product = z.infer<typeof ProductSchema>;

async function generateProduct(description: string): Promise<Product> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-2024-08-06',
    messages: [
      {
        role: 'system',
        content: 'You generate product metadata as valid JSON matching the requested schema.',
      },
      { role: 'user', content: description },
    ],
    response_format: { type: 'json_object' },
  });

  const raw = JSON.parse(response.choices[0].message.content!);
  return ProductSchema.parse(raw); // Zod 运行时校验
}

// 使用
const product = await generateProduct('A wireless noise-canceling headphone, $299, available');
console.log(product.name, product.price);
```

### RAG 检索-生成流水线

```typescript
// rag-pipeline.ts — 简化的向量检索 + LLM 增强生成
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import OpenAI from 'openai';

class SimpleRAG {
  private store?: MemoryVectorStore;
  private embeddings = new OpenAIEmbeddings();
  private client = new OpenAI();

  async indexDocuments(docs: string[]) {
    this.store = await MemoryVectorStore.fromTexts(docs, docs.map((_, i) => ({ id: i })), this.embeddings);
  }

  async query(question: string, topK = 3): Promise<string> {
    if (!this.store) throw new Error('No documents indexed');

    const results = await this.store.similaritySearch(question, topK);
    const context = results.map((r) => r.pageContent).join('\n---\n');

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Answer based only on the provided context. If uncertain, say "I don\'t know".',
        },
        { role: 'user', content: `Context:\n${context}\n\nQuestion: ${question}` },
      ],
    });

    return response.choices[0].message.content ?? '';
  }
}
```

### Ollama 本地模型推理

```typescript
// ollama-local.ts — 零成本本地 LLM 调用
interface OllamaResponse {
  message: { role: string; content: string };
  done: boolean;
}

export async function* streamOllama(model: string, prompt: string) {
  const res = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
    }),
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value);
    for (const line of chunk.split('\n').filter(Boolean)) {
      const data: OllamaResponse = JSON.parse(line);
      yield data.message.content;
    }
  }
}

// 使用
for await (const token of streamOllama('llama3.2', 'Explain TypeScript generics')) {
  process.stdout.write(token);
}
```

## 4. 向量与 Embedding

Embedding 是将文本/图像/音频映射到高维向量空间的技术。相似语义的内容在向量空间中距离更近。

```
文本 → Embedding 模型 → 1536 维向量 → 向量数据库（余弦相似度检索）
```

常用向量数据库：Pinecone、Weaviate、Milvus、Chroma、Qdrant。

### 余弦相似度计算

```typescript
// cosine-similarity.ts — 向量相似度计算
function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 使用示例
const vec1 = [0.1, 0.2, 0.3];
const vec2 = [0.11, 0.19, 0.31];
console.log(cosineSimilarity(vec1, vec2)); // ~0.999
```

## 5. 关键挑战

| 挑战 | 影响 | 缓解策略 |
|------|------|---------|
| 幻觉 | 模型生成虚假事实 | RAG、事实核查、置信度阈值 |
| 上下文窗口限制 | 长文档处理困难 | 分块、摘要、层次化检索 |
| 延迟 | 实时交互体验差 | 流式输出、边缘缓存、模型量化 |
| 成本 | Token 计费累积 | 缓存、模型降级、批处理 |
| 安全 | Prompt Injection | 输入验证、输出过滤、沙箱执行 |

## 6. 与相邻模块的关系

- **94-ai-agent-lab**: Agent 的完整实现（本模块是基础集成）
- **82-edge-ai**: 边缘端模型推理优化
- **92-observability-lab**: AI 系统的可观测性

## 权威参考

- [OpenAI Function Calling Guide](https://platform.openai.com/docs/guides/function-calling)
- [OpenAI Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs) — JSON Schema 约束
- [Anthropic API Documentation](https://docs.anthropic.com/en/api/getting-started) — Claude 系列模型
- [Vercel AI SDK](https://sdk.vercel.ai/docs) — 前端友好的流式 AI 集成
- [LangChain.js Documentation](https://js.langchain.com/docs/introduction) — LLM 应用编排框架
- [LlamaIndex Documentation](https://docs.llamaindex.ai/) — RAG 与数据增强框架
- [Ollama API Documentation](https://github.com/ollama/ollama/blob/main/docs/api.md) — 本地模型服务
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks — Lewis et al. (NeurIPS 2020)](https://arxiv.org/abs/2005.11401)
- [What is Retrieval-Augmented Generation? — IBM](https://www.ibm.com/think/topics/retrieval-augmented-generation)
- [Prompt Injection: LLM Security — OWASP LLM Top 10](https://genai.owasp.org/llm-top-10/)
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js) — 浏览器端 Transformer 推理
- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs) — Gemini 模型集成

---

*最后更新: 2026-04-29*
