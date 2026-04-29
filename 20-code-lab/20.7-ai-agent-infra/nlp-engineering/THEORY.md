# NLP 工程理论：从词向量到大语言模型

> **目标读者**：AI 应用开发者、关注 LLM 集成的工程师
> **关联文档**：``30-knowledge-base/30.2-categories/ai-integration.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,200 字

---

## 1. NLP 技术栈演进

### 1.1 四代范式

| 世代 | 方法 | 代表 | 特点 |
|------|------|------|------|
| **规则时代** | 正则、词典、语法规则 | 早期聊天机器人 | 硬编码、维护困难 |
| **统计时代** | 机器学习、特征工程 | TF-IDF、SVM | 需要大量标注数据 |
| **神经网络** | RNN、LSTM、Word2Vec | seq2seq、Attention | 自动特征学习 |
| **大模型时代** | Transformer、LLM | GPT-4、Claude、Llama | 涌现能力、上下文学习 |

### 1.2 LLM 能力边界

```
上下文窗口:
  GPT-4o: 128K tokens
  Claude 3.5: 200K tokens
  Gemini 1.5: 1M tokens

能力层级:
  L1: 文本生成 (摘要、翻译)
  L2: 推理 (数学、逻辑)
  L3: 代码生成 (编程助手)
  L4: 多模态 (文本+图像+音频)
  L5: Agent 自主执行 (规划+工具使用)
```

---

## 2. LLM 集成工程

### 2.1 提示工程 (Prompt Engineering)

**核心原则**：

```markdown
1. 清晰的角色定义
   "你是一位资深 TypeScript 工程师..."

2. 结构化输出要求
   "请按以下 JSON 格式返回: {"result": string, "confidence": number}"

3. 少样本示例 (Few-shot)
   "输入: X → 输出: Y"
   "输入: Z → 输出: W"
   "输入: [新输入] → 输出: ?"

4. 链式思考 (Chain-of-Thought)
   "让我们一步步思考..."
```

**结构化提示模板示例**：

```typescript
interface PromptTemplate<TInput, TOutput> {
  system: string;
  examples: Array<{ input: TInput; output: TOutput }>;
  format: (input: TInput) => string;
}

const codeReviewPrompt: PromptTemplate<string, string> = {
  system: `你是一位资深 TypeScript 代码审查专家。
请审查以下代码，输出 JSON 格式：
{"issues": [{"severity": "error|warn|info", "line": number, "message": string}], "score": number(0-100)}`,
  examples: [
    {
      input: `function add(a, b) { return a + b; }`,
      output: `{"issues": [{"severity": "warn", "line": 1, "message": "缺少类型注解"}], "score": 75}`,
    },
  ],
  format: (code: string) => `请审查以下代码：\n\n\`\`\`typescript\n${code}\n\`\`\``,
};

function buildMessages<TInput, TOutput>(
  template: PromptTemplate<TInput, TOutput>,
  input: TInput
) {
  return [
    { role: 'system' as const, content: template.system },
    ...template.examples.flatMap((ex) => [
      { role: 'user' as const, content: template.format(ex.input) },
      { role: 'assistant' as const, content: ex.output },
    ]),
    { role: 'user' as const, content: template.format(input) },
  ];
}
```

### 2.2 RAG（检索增强生成）

```
用户提问
  ↓
Embedding 模型 → 向量查询
  ↓
知识库 (向量数据库)
  ↓
检索相关文档片段
  ↓
LLM (上下文 + 检索结果) → 生成回答
```

**向量数据库选型**：

| 数据库 | 特点 | 适用 |
|--------|------|------|
| **Pinecone** | 托管、易用 | 快速原型 |
| **Weaviate** | GraphQL 接口 | 复杂查询 |
| **Qdrant** | Rust 编写、高性能 | 自托管 |
| **pgvector** | PostgreSQL 扩展 | 已有 PG 基础设施 |
| **Chroma** | 轻量、本地优先 | 开发测试 |

**完整 RAG Pipeline 代码示例**：

```typescript
// rag-pipeline.ts — 检索增强生成完整实现
import { OpenAI } from 'openai';

interface Document {
  id: string;
  content: string;
  embedding: number[];
  metadata: Record<string, unknown>;
}

class RAGPipeline {
  private docs: Document[] = [];
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /** 计算余弦相似度 */
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
  }

  /** 生成文本嵌入 */
  async embed(text: string): Promise<number[]> {
    const res = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return res.data[0].embedding;
  }

  /** 索引文档 */
  async indexDocument(content: string, metadata: Record<string, unknown> = {}): Promise<void> {
    const embedding = await this.embed(content);
    this.docs.push({ id: crypto.randomUUID(), content, embedding, metadata });
  }

  /** 检索 Top-K 相关文档 */
  async retrieve(query: string, topK = 3): Promise<Document[]> {
    const queryEmbedding = await this.embed(query);
    const scored = this.docs.map((doc) => ({
      doc,
      score: this.cosineSimilarity(queryEmbedding, doc.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.doc);
  }

  /** 生成回答 */
  async generate(query: string): Promise<string> {
    const relevantDocs = await this.retrieve(query);
    const context = relevantDocs.map((d) => `[${d.metadata.source}] ${d.content}`).join('\n\n');

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: '你是一个有帮助的助手。请仅根据提供的上下文回答问题。如果上下文中没有答案，请明确说明。',
        },
        {
          role: 'user',
          content: `上下文：\n${context}\n\n问题：${query}`,
        },
      ],
      temperature: 0.3,
    });

    return response.choices[0].message.content ?? '';
  }
}

// ===== 使用示例 =====
async function main() {
  const rag = new RAGPipeline(process.env.OPENAI_API_KEY!);

  // 索引知识库
  await rag.indexDocument('TypeScript 5.8 引入了 erasableSyntaxOnly 选项。', { source: 'TS博客' });
  await rag.indexDocument('Go 原生编译器将 TypeScript 编译速度提升 10 倍。', { source: 'MS公告' });
  await rag.indexDocument('Temporal API 提供了不可变的日期时间对象。', { source: 'MDN' });

  // 查询
  const answer = await rag.generate('TypeScript 7.0 的性能改进是什么？');
  console.log(answer);
}
```

---

## 3. 工程化实践

### 3.1 流式响应处理

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: '解释 Promise' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

**带打字机效果的 React Hook**：

```typescript
// useStreamingChat.ts
import { useState, useCallback, useRef } from 'react';
import { OpenAI } from 'openai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useStreamingChat(apiKey: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const openai = useRef(new OpenAI({ apiKey, dangerouslyAllowBrowser: true }));

  const sendMessage = useCallback(
    async (content: string) => {
      const userMsg: ChatMessage = { role: 'user', content };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
      setMessages((prev) => [...prev, assistantMsg]);

      abortRef.current = new AbortController();

      try {
        const stream = await openai.current.chat.completions.create(
          {
            model: 'gpt-4o-mini',
            messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
            stream: true,
          },
          { signal: abortRef.current.signal }
        );

        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content ?? '';
          assistantMsg.content += delta;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { ...assistantMsg };
            return next;
          });
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, messages]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { messages, isLoading, sendMessage, stop };
}
```

### 3.2 成本与性能优化

| 策略 | 效果 | 实现 |
|------|------|------|
| **缓存** | 减少 30-50% 调用 | 相同/相似查询缓存 |
| **降级** | 保证可用性 | GPT-4 失败 → GPT-3.5 |
| **批处理** | 降低 per-token 成本 | 合并短请求 |
| **模型路由** | 平衡成本与质量 | 简单任务 → 轻量模型 |

**智能模型路由器**：

```typescript
// model-router.ts
interface ModelConfig {
  name: string;
  maxTokens: number;
  costPer1K: number;
  contextWindow: number;
}

const MODELS: Record<string, ModelConfig> = {
  'gpt-4o': { name: 'gpt-4o', maxTokens: 4096, costPer1K: 0.005, contextWindow: 128000 },
  'gpt-4o-mini': { name: 'gpt-4o-mini', maxTokens: 4096, costPer1K: 0.00015, contextWindow: 128000 },
};

class ModelRouter {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /** 基于复杂度选择模型 */
  selectModel(prompt: string): string {
    const complexityScore = this.estimateComplexity(prompt);
    if (complexityScore > 0.8) return 'gpt-4o';
    if (complexityScore > 0.5) return 'gpt-4o';
    return 'gpt-4o-mini';
  }

  private estimateComplexity(prompt: string): number {
    let score = 0;
    if (prompt.length > 2000) score += 0.3;
    if (/\b(code|algorithm|math|proof|logic)\b/i.test(prompt)) score += 0.4;
    if (/\b(explain|analyze|compare|evaluate)\b/i.test(prompt)) score += 0.2;
    return Math.min(score, 1);
  }

  async routeAndGenerate(prompt: string): Promise<{ content: string; model: string; cost: number }> {
    const model = this.selectModel(prompt);
    const response = await this.openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
    });

    const tokens = response.usage?.total_tokens ?? 0;
    const cost = (tokens / 1000) * MODELS[model].costPer1K;

    return {
      content: response.choices[0].message.content ?? '',
      model,
      cost,
    };
  }
}
```

---

## 4. 反模式

### 反模式 1：过度依赖 LLM

❌ 所有逻辑都通过 LLM 实现。
✅ 确定性逻辑用代码，模糊性任务用 LLM。

### 反模式 2：忽视 Token 限制

❌ 一次性传入 10 万 token 的上下文。
✅ 使用 RAG 或摘要压缩上下文。

### 反模式 3：不验证 LLM 输出

❌ 直接执行 LLM 生成的 SQL/代码。
✅ 沙箱执行、人工审查、单元测试。

### 反模式 4：忽略输出格式一致性

```typescript
// ❌ 直接解析可能失败的 JSON
const result = JSON.parse(response.choices[0].message.content!);

// ✅ 使用结构化输出 (JSON Schema)
const structured = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: '生成一个用户对象' }],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'user',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
        required: ['id', 'name', 'email'],
      },
    },
  },
});
```

---

## 5. 总结

LLM 正在重塑软件开发的**人机交互层**。

**关键趋势**：
- 从"调用 API"到"设计 Agent 工作流"
- 从"通用模型"到"领域微调 + RAG"
- 从"文本生成"到"多模态理解 + 工具使用"

---

## 参考资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [OpenAI Cookbook](https://github.com/openai/openai-cookbook) — 官方最佳实践与模式
- [LangChain 文档](https://js.langchain.com/)
- [LangChain RAG 教程](https://js.langchain.com/docs/tutorials/rag/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Hugging Face](https://huggingface.co/)
- [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js/) — 浏览器端 NLP
- [Google Gemini API 文档](https://ai.google.dev/gemini-api/docs)
- [Anthropic Claude API](https://docs.anthropic.com/en/api/getting-started)
- [Vercel AI SDK](https://sdk.vercel.ai/docs) — 统一 LLM SDK
- [Ollama](https://github.com/ollama/ollama) — 本地 LLM 运行
- [Pinecone 文档](https://docs.pinecone.io/)
- [Qdrant 文档](https://qdrant.tech/documentation/)
- [pgvector GitHub](https://github.com/pgvector/pgvector)
- [Chroma 文档](https://docs.trychroma.com/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `bpe-tokenizer.ts`
- `index.ts`
- `named-entity-recognizer.ts`
- `nlp-pipeline.ts`
- `semantic-search.ts`
- `sentiment-analyzer.ts`
- `text-classifier.ts`
- `text-preprocessor.ts`
- `tfidf-vectorizer.ts`
- `word-embedding.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **管道模式 (Pipeline Pattern)**：NLP 处理流程（分词 → 清洗 → 向量化 → 检索 → 生成）的链式组合
2. **策略模式 (Strategy Pattern)**：不同 Embedding 模型/LLM 的灵活切换（ModelRouter）
3. **适配器模式 (Adapter Pattern)**：统一封装 OpenAI/Claude/Gemini 等不同供应商 API

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | `10-fundamentals/10.2-type-system` — 类型体操与泛型约束 |
| 后续进阶 | `20-code-lab/20.6-backend-apis` — API 设计与错误处理 |

---

> 📅 理论深化更新：2026-04-27
