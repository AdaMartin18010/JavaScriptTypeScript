# AI 集成 — 架构设计

## 1. 架构概述

本模块实现了 LLM 应用的核心架构组件，包括模型客户端、提示管理、RAG 检索管道和工具调用框架。展示生产级 AI 应用的工程化实现。架构采用"网关→管道→运行时"的三层结构，模型网关统一封装多厂商 API 差异，RAG 管道将外部知识注入上下文，Agent 运行时管理提示工程和工具执行，形成完整的 LLM 应用交付链路。

## 2. 架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           用户输入 (User Input)                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │         Query / Document / Image / Audio / Tool Result             │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      模型网关层 (Model Gateway)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Provider   │  │   Model      │  │   Retry &    │  │   Cost /    │ │
│  │   Adapter    │  │   Router     │  │   Fallback   │  │   Token     │ │
│  │ (OpenAI /    │  │ (Complexity  │  │ (Exponential │  │   Tracker   │ │
│  │  Anthropic / │  │  + Cost)     │  │  Backoff)    │  │             │ │
│  │  Gemini)     │  │              │  │              │  │             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      RAG 管道层 (RAG Pipeline)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   Document   │  │   Chunking   │  │   Embedding  │  │   Vector    │ │
│  │   Loader     │  │   Strategy   │  │   Pipeline   │  │   Store     │ │
│  │ (PDF/MD/     │  │ (Semantic /  │  │ (Batch /     │  │ (Similarity │ │
│  │  Word/HTML)  │  │  Fixed /     │  │  Caching)    │  │  + Keyword) │ │
│  │              │  │  Hierarchical)│  │              │  │             │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
└─────────┼─────────────────┼─────────────────┼─────────────────┼────────┘
          │                 │                 │                 │
          └─────────────────┼─────────────────┘                 │
                            │                                   │
                            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Agent 运行时层 (Agent Runtime)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                   │
│  │   Prompt     │  │   Context    │  │   Output     │                   │
│  │   Template   │  │   Manager    │  │   Parser     │                   │
│  │   Engine     │  │ (Window /    │  │ (JSON Schema │                   │
│  │              │  │  Summary)    │  │  / Streaming)│                   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                   │
└─────────┼─────────────────┼─────────────────┼───────────────────────────┘
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      LLM 提供商 (LLM Providers)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │   OpenAI     │  │  Anthropic   │  │    Gemini    │  │   Local     │ │
│  │   (GPT-4o)   │  │   (Claude)   │  │   (Gemini)   │  │  (Ollama)   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. 核心组件

### 3.1 模型网关

| 组件 | 职责 | 关键技术 | 可靠性 |
|------|------|----------|--------|
| Provider Adapter | 统一接口封装多厂商 API（OpenAI、Anthropic、Gemini）| 适配器模式 | 故障隔离 |
| Model Router | 根据任务复杂度和成本自动选择模型 | 启发式 / 规则引擎 | 降级可用 |
| Retry & Fallback | 失败重试和降级策略 | 指数退避 + 熔断 | 高可用 |

### 3.2 RAG 管道

| 组件 | 职责 | 关键技术 | 质量影响 |
|------|------|----------|----------|
| Document Loader | 多格式文档解析（PDF、Word、Markdown）| 流式解析 | 内容完整性 |
| Chunking Strategy | 语义分块、重叠窗口、层次分块 | 语义分割 / 固定长度 | 检索精度 |
| Embedding Pipeline | 文本向量化、批量处理 | 批量化 + 缓存 | 延迟/成本 |
| Vector Store | 相似度检索、混合搜索（向量 + 关键词）| HNSW / IVF | 召回率 |

### 3.3 Agent 运行时

| 组件 | 职责 | 关键技术 | 用户体验 |
|------|------|----------|----------|
| Prompt Template Engine | 变量替换、条件渲染、多轮对话管理 | Mustache / 自定义 DSL | 响应质量 |
| Tool Registry | 工具定义、参数 Schema、执行器绑定 | JSON Schema | 功能扩展 |
| Context Manager | 上下文窗口管理、历史摘要、Token 预算 | 滑动窗口 / 摘要 | 记忆连贯 |

## 4. 数据流

```
用户输入 → Context Manager → Prompt Builder → Model Gateway → LLM → Output Parser → Response
                ↓                  ↓
           Vector Store ← Embedding ← Document Loader (RAG)
                ↓
           Tool Registry ← Tool Results
```

## 5. 技术栈对比

| 组件/框架 | 多厂商 | RAG | 流式 | 工具调用 | 类型安全 | 成本追踪 | 适用场景 |
|-----------|--------|-----|------|----------|----------|----------|----------|
| 本实验室 | ★★★★★ | 内置 | ★★★★★ | ★★★★★ | ★★★★★ | 精细 | 学习/原型 |
| Vercel AI SDK | ★★★★★ | 外部 | ★★★★★ | ★★★★ | ★★★★★ | 基础 | 产品前端 |
| LangChain | ★★★★ | 丰富 | ★★★ | ★★★★ | ★★★ | 基础 | 快速构建 |
| LlamaIndex | ★★★ | ★★★★★ | ★★★ | ★★★ | ★★★ | 基础 | 复杂 RAG |
| OpenAI SDK | ★ | 无 | ★★★★★ | ★★★★★ | ★★★★ | 无 | OpenAI 专属 |
| Anthropic SDK | ★ | 无 | ★★★★★ | ★★★★★ | ★★★★ | 无 | Claude 专属 |

## 6. 代码示例

### 6.1 统一模型网关接口

```typescript
// ai-integration/src/gateway/ModelGateway.ts
interface LLMMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }>;
}

interface CompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
  responseFormat?: { type: 'json_schema'; schema: object };
  stream?: boolean;
}

interface CompletionResult {
  content: string;
  usage: { promptTokens: number; completionTokens: number; totalTokens: number };
  toolCalls?: Array<{ name: string; arguments: object }>;
  finishReason: 'stop' | 'length' | 'tool_calls';
}

interface LLMProvider {
  name: string;
  complete(messages: LLMMessage[], options: CompletionOptions): Promise<CompletionResult>;
  stream(messages: LLMMessage[], options: CompletionOptions): AsyncIterable<string>;
}

class ModelGateway {
  private providers = new Map<string, LLMProvider>();
  private defaultProvider: string;

  constructor(config: { providers: LLMProvider[]; default: string }) {
    for (const p of config.providers) {
      this.providers.set(p.name, p);
    }
    this.defaultProvider = config.default;
  }

  async complete(
    messages: LLMMessage[],
    options: CompletionOptions = {}
  ): Promise<CompletionResult> {
    const provider = this.providers.get(options.model ?? this.defaultProvider);
    if (!provider) throw new Error(`Provider ${options.model} not found`);

    // 重试逻辑
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const start = Date.now();
        const result = await provider.complete(messages, options);
        this.trackCost(provider.name, result.usage, Date.now() - start);
        return result;
      } catch (err) {
        lastError = err as Error;
        await this.delay(Math.pow(2, attempt) * 1000);
      }
    }

    // 降级到备用模型
    return this.fallbackComplete(messages, options);
  }

  private trackCost(provider: string, usage: CompletionResult['usage'], latency: number): void {
    console.log(`[${provider}] tokens=${usage.totalTokens}, latency=${latency}ms`);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms));
  }

  private async fallbackComplete(
    messages: LLMMessage[],
    options: CompletionOptions
  ): Promise<CompletionResult> {
    const fallback = this.providers.get(this.defaultProvider);
    return fallback!.complete(messages, { ...options, model: 'gpt-3.5-turbo' });
  }
}
```

### 6.2 RAG 检索管道

```typescript
// ai-integration/src/rag/RAGPipeline.ts
interface Document {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

interface VectorStore {
  upsert(docs: Document[]): Promise<void>;
  query(vector: number[], topK: number): Promise<Array<{ doc: Document; score: number }>>;
}

interface Embedder {
  embed(texts: string[]): Promise<number[][]>;
}

class RAGPipeline {
  constructor(
    private embedder: Embedder,
    private vectorStore: VectorStore,
    private chunkSize = 512,
    private chunkOverlap = 50
  ) {}

  async ingest(document: Document): Promise<void> {
    const chunks = this.chunkText(document.content, this.chunkSize, this.chunkOverlap);
    const chunkDocs: Document[] = chunks.map((content, i) => ({
      id: `${document.id}#${i}`,
      content,
      metadata: { ...document.metadata, chunkIndex: i, parentId: document.id },
    }));

    const embeddings = await this.embedder.embed(chunkDocs.map(d => d.content));
    for (let i = 0; i < chunkDocs.length; i++) {
      chunkDocs[i].embedding = embeddings[i];
    }

    await this.vectorStore.upsert(chunkDocs);
  }

  async retrieve(query: string, topK = 5): Promise<string> {
    const [queryEmbedding] = await this.embedder.embed([query]);
    const results = await this.vectorStore.query(queryEmbedding, topK);

    // 重排序：简单按相关度排序，生产环境可引入 cross-encoder
    const context = results
      .sort((a, b) => b.score - a.score)
      .map(r => `[Source: ${r.doc.metadata.parentId}]\n${r.doc.content}`)
      .join('\n\n---\n\n');

    return context;
  }

  private chunkText(text: string, size: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + size));
      start += size - overlap;
    }
    return chunks;
  }
}
```

## 7. 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 模型抽象 | 统一接口 + 适配器 | 便于切换和对比 |
| 检索策略 | 向量 + BM25 混合 | 平衡语义和精确匹配 |
| 输出约束 | JSON Schema 结构化 | 确保可解析性 |

## 8. 质量属性

- **可靠性**: 降级策略保证服务可用
- **成本效率**: 模型路由和缓存降低 Token 消耗
- **可观测性**: 完整的调用链和成本追踪

## 9. 参考链接

- [OpenAI API Reference](https://platform.openai.com/docs/api-reference) — OpenAI API 官方参考
- [Anthropic API Documentation](https://docs.anthropic.com/) — Claude API 官方文档
- [Vercel AI SDK](https://sdk.vercel.ai/docs) — 现代 AI SDK 框架
- [RAG Survey Paper (2024)](https://arxiv.org/abs/2312.10997) — 检索增强生成综述论文
- [Hugging Face Embeddings Guide](https://huggingface.co/blog/getting-started-with-embeddings) — 嵌入模型入门
- [OpenTelemetry for AI Applications](https://opentelemetry.io/docs/) — AI 应用可观测性标准
