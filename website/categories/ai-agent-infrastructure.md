---
title: AI Agent 基础设施与浏览器端 ML
description: JavaScript/TypeScript 生态 AI/ML 完整指南，覆盖 Transformers.js、WebLLM、Vercel AI SDK、Mastra、LangChain.js 及向量数据库
---

# AI Agent 基础设施与浏览器端 ML

> 本文档系统梳理 2025-2026 年 JavaScript/TypeScript 生态中 AI/ML 与 Agent 基础设施的关键框架、协议与工具。覆盖浏览器内 LLM 推理、跨平台 ML 运行时、Agent 编排框架、向量数据库客户端及可观测性。数据截至 2026 年 4 月。

---

## 🧪 关联代码实验室

> **4** 个关联模块 · 平均成熟度：**🌳**

| 模块 | 成熟度 | 说明 | 源码 |
|------|--------|------|------|
| [33-ai-integration](../../20-code-lab/20.7-ai-agent-infra/) | 🌿 可用 | AI SDK 封装、Prompt 工程、Embedding 流水线、流式输出 | [查看](../../20-code-lab/20.7-ai-agent-infra/) |
| [82-edge-ai](../../20-code-lab/20.13-edge-databases/) | 🌳 成熟 | 边缘推理、模型量化、WebGPU 计算 | [查看](../../20-code-lab/20.13-edge-databases/) |
| [94-ai-agent-lab](../../20-code-lab/20.7-ai-agent-infra/) | 🌿 可用 | MCP Server、多 Agent 协调、记忆层 | [查看](../../20-code-lab/20.7-ai-agent-infra/) |
| [55-ai-testing](../../20-code-lab/20.12-build-free-typescript/) | 🌿 可用 | AI 辅助测试、LLM-as-a-Judge | [查看](../../20-code-lab/20.12-build-free-typescript/) |

---

## 📊 整体概览

| 技术/框架 | 定位 | 维护方 | Stars / 下载量 | TS 支持 |
|-----------|------|--------|----------------|---------|
| **Transformers.js** | 浏览器内运行 Hugging Face 模型 | Hugging Face | 12,500+ Stars | ✅ 原生 |
| **ONNX Runtime Web** | 跨平台 ML 推理运行时 | Microsoft | 15,000+ Stars | ✅ 官方 |
| **WebLLM** | 浏览器内 Llama/Mistral/Phi | MLC AI (CMU) | 13,000+ Stars | ✅ 原生 |
| **Vercel AI SDK v4** | 统一模型接入 + 流式 UI | Vercel | 12,000+ Stars / 200万+ 周下载 | ✅ 原生 |
| **Mastra** | TypeScript-first Agent 框架 | Mastra Inc. | 10,500+ Stars | ✅ 原生 |
| **LangChain.js** | 复杂 RAG / Agent 工作流 | LangChain Inc. | 15,500+ Stars | ✅ 官方 |
| **Pinecone SDK** | 向量数据库客户端 | Pinecone | 800+ Stars / 20万+ 周下载 | ✅ 官方 |
| **MCP 协议** | 上下文协议标准 | Linux Foundation AAIF | 9700万+ 月下载 | ✅ 原生 |

---

## 1. 浏览器端 ML 推理：Transformers.js

### 1.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | Transformers.js |
| **版本** | v3.x（2025 年发布 v3，支持 WebGPU） |
| **Stars** | ⭐ 12,500+ |
| **GitHub** | [huggingface/transformers.js](https://github.com/huggingface/transformers.js) |
| **官网** | [huggingface.co/docs/transformers.js](https://huggingface.co/docs/transformers.js) |

**一句话描述**：Hugging Face 官方推出的浏览器端 ML 推理库，允许在浏览器中直接运行 10,000+ 个预训练模型，无需后端服务器。

**2025-2026 关键突破**：

- **v3 WebGPU 后端**：推理速度较 WASM 后端提升 10-30 倍，可流畅运行 7B 参数模型
- **Pipeline API 扩展**：新增 `text-generation`、`image-to-text`、`automatic-speech-recognition`、`zero-shot-classification`
- **量化模型生态**：Hugging Face Hub 提供大量 `onnx` 和 `q4f16` 量化模型，浏览器加载体积降至 2-4GB

```typescript
import { pipeline } from '@huggingface/transformers';

// 零样本分类（完全本地，零后端依赖）
const classifier = await pipeline('zero-shot-classification', 'Xenova/mobilebert-uncased-mnli');
const result = await classifier('这款新手机电池续航非常持久', ['科技', '体育', '美食']);
// [{ label: '科技', score: 0.98 }, ...]

// 文本生成（WebGPU 加速）
const generator = await pipeline('text-generation', 'onnx-community/Llama-3.2-1B-Instruct-q4f16', {
  dtype: 'q4f16',
  device: 'webgpu', // v3 关键：启用 GPU 加速
});
const output = await generator('Explain quantum computing in simple terms:', {
  max_new_tokens: 128,
  temperature: 0.7,
});
```

**性能数据（2026-04，M3 MacBook Pro）**：

| 模型 | 后端 | 推理速度 | 内存占用 |
|------|------|----------|----------|
| Llama-3.2-1B | WebGPU | ~25 tokens/s | ~1.2GB |
| Llama-3.2-1B | WASM | ~2 tokens/s | ~1.5GB |
| Mistral-7B-Instruct-q4 | WebGPU | ~8 tokens/s | ~4.5GB |
| BERT-base | WebGPU | ~50ms/句 | ~400MB |

---

## 2. ONNX Runtime Web：跨平台 ML 标准运行时

### 2.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | ONNX Runtime Web |
| **Stars** | ⭐ 15,000+ (microsoft/onnxruntime) |
| **维护方** | Microsoft |
| **GitHub** | [microsoft/onnxruntime](https://github.com/microsoft/onnxruntime) |

**一句话描述**：Microsoft 开源的跨平台推理引擎，支持将 PyTorch/TensorFlow 模型转换为 ONNX 格式后在浏览器、Node.js 和 React Native 中运行。

**2025-2026 关键特性**：

- **WebGPU Execution Provider**：ORT Web 1.20+ 原生支持 WebGPU，成为 Transformers.js v3 的底层依赖
- **React Native 支持**：`onnxruntime-react-native` 包支持 iOS/Android 端侧推理
- **量化工具链**：内置 INT8/UINT8 动态量化，模型体积减少 75%

```typescript
import * as ort from 'onnxruntime-web/all';

// 加载 ONNX 模型（WebGPU 后端）
const session = await ort.InferenceSession.create('./model.onnx', {
  executionProviders: ['webgpu'],
  graphOptimizationLevel: 'all',
});

// 准备输入张量
const inputTensor = new ort.Tensor('float32', inputData, [1, 3, 224, 224]);
const feeds = { input: inputTensor };

// 执行推理
const results = await session.run(feeds);
const output = results.output.data as Float32Array;
```

---

## 3. WebLLM：浏览器内大模型引擎

### 3.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | WebLLM |
| **Stars** | ⭐ 13,000+ |
| **维护方** | MLC AI（CMU 机器学习编译团队） |
| **GitHub** | [mlc-ai/web-llm](https://github.com/mlc-ai/web-llm) |
| **官网** | [webllm.mlc.ai](https://webllm.mlc.ai) |

**一句话描述**：基于 TVM Unity 编译栈的浏览器端 LLM 推理引擎，支持 Llama、Mistral、Phi、Gemma、Qwen 等主流模型，以极致的内存效率和推理速度著称。

**2025-2026 亮点**：

- **WebGPU Paged Attention**：实现 vLLM 风格的 KV Cache 分页管理，支持更长上下文（32K+）
- **Service Worker 缓存**：模型权重自动缓存到 IndexedDB，二次加载秒开
- **ChatModule API**：与 OpenAI API 兼容的接口，方便现有应用迁移

```typescript
import * as webllm from '@mlc-ai/web-llm';

// 初始化引擎
const engine = await webllm.CreateMLCEngine('Llama-3.1-8B-Instruct-q4f16_1-MLC', {
  initProgressCallback: (p) => console.log(`加载进度: ${(p.progress * 100).toFixed(1)}%`),
});

// OpenAI 兼容 API
const reply = await engine.chat.completions.create({
  messages: [
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: 'Write a quicksort in TypeScript' },
  ],
  temperature: 0.7,
  max_tokens: 512,
  stream: false,
});

console.log(reply.choices[0].message.content);
```

**WebLLM vs Transformers.js 对比**：

| 维度 | WebLLM | Transformers.js |
|------|--------|-----------------|
| **定位** | 专精 LLM 推理 | 通用 ML Pipeline |
| **模型范围** | Llama、Mistral、Phi、Qwen | 10,000+ HF 模型 |
| **最大模型** | 70B（量化后） | 7-8B（浏览器实用上限） |
| **上下文长度** | 32K-128K | 4K-8K（通常） |
| **API 风格** | OpenAI 兼容 | Hugging Face Pipeline |
| **适用场景** | Chatbot、代码助手 | 分类、Embedding、ASR |

---

## 4. Vercel AI SDK：流式 UI 与多模型编排

### 4.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | Vercel AI SDK |
| **版本** | v4.x（2025 年发布 v4，v4.2 支持 MCP Client） |
| **Stars** | ⭐ 12,000+ |
| **周下载** | 200万+ |
| **GitHub** | [vercel/ai](https://github.com/vercel/ai) |

**一句话描述**：Vercel 推出的统一 AI 模型接入层，支持 100+ 模型提供商，原生集成流式 UI、工具调用与 MCP 协议。

**v4 核心能力**：

- **`streamText` / `generateText`**：统一接口支持 OpenAI、Anthropic、Google、Mistral、Groq、xAI 等
- **`useChat` / `useCompletion`**：React/Vue/Svelte 的流式 UI Hook，一行代码实现打字机效果
- **Tool Calling**：`tools` 参数支持 Zod Schema 定义，自动序列化/反序列化
- **MCP Client 内置**：`experimental_createMCPClient` 直接消费 MCP Server

```typescript
import { streamText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// 带工具调用的流式响应
const result = streamText({
  model: openai('gpt-4o'),
  prompt: 'What\'s the weather in Paris?',
  tools: {
    getWeather: tool({
      description: 'Get weather for a city',
      parameters: z.object({ city: z.string() }),
      execute: async ({ city }) => {
        return await fetchWeatherAPI(city);
      },
    }),
  },
});

// Next.js Route Handler 中直接返回流
return result.toDataStreamResponse();

// React 前端消费
import { useChat } from '@ai-sdk/react';
const { messages, input, handleSubmit } = useChat({ api: '/api/chat' });
```

---

## 5. Mastra：TypeScript-first Agent 框架

### 5.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | Mastra |
| **Stars** | ⭐ 10,500+ |
| **GitHub** | [mastra-ai/mastra](https://github.com/mastra-ai/mastra) |
| **官网** | [mastra.ai](https://mastra.ai) |

**一句话描述**：专为 TypeScript 开发者设计的 AI Agent 框架，内置工作流引擎（DAG/状态机）、长期记忆层、多 Agent 协调与可观测性。

**2025-2026 亮点**：

- **Workflow Engine**：可视化 DAG 编排，支持条件分支、循环、并行执行
- **Memory 层**：自动会话历史管理，支持向量检索增强的长期记忆
- **Evals 框架**：内置 LLM-as-a-Judge 评估，自动化测试 Agent 输出质量
- **部署目标**：支持 Node.js、Cloudflare Workers、Vercel Edge 一键部署

```typescript
import { Mastra } from '@mastra/core';
import { Agent } from '@mastra/core/agent';
import { Step, Workflow } from '@mastra/core/workflow';

// 定义 Agent
const researcher = new Agent({
  name: 'Researcher',
  instructions: 'You are a research assistant. Find accurate information.',
  model: openai('gpt-4o'),
});

// 定义工作流
const researchWorkflow = new Workflow({
  name: 'research-workflow',
  triggerSchema: z.object({ topic: z.string() }),
});

const searchStep = new Step({
  id: 'search',
  execute: async ({ context }) => {
    const topic = context.triggerData.topic;
    const response = await researcher.generate(`Research: ${topic}`);
    return { summary: response.text };
  },
});

researchWorkflow.step(searchStep).commit();

// 运行
const mastra = new Mastra({ workflows: { researchWorkflow } });
const run = await mastra.getWorkflow('researchWorkflow').createRun();
const result = await run.start({ triggerData: { topic: 'Quantum Computing' } });
```

---

## 6. LangChain.js：成熟的企业级编排

### 6.1 项目概述

| 属性 | 详情 |
|------|------|
| **名称** | LangChain.js |
| **Stars** | ⭐ 15,500+ |
| **GitHub** | [langchain-ai/langchainjs](https://github.com/langchain-ai/langchainjs) |

**2025-2026 状态**：LangChain.js 仍是**最成熟的 JS/TS AI 编排框架**，尤其在复杂 RAG Pipeline、文档加载与分割领域无出其右。但社区开始批评其过度抽象，新项目更倾向 Vercel AI SDK + Mastra 的组合。

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createRetrievalChain } from 'langchain/chains/retrieval';

// 文档处理 + Embedding + 向量检索
const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
const docs = await splitter.createDocuments([largeDocument]);

const embeddings = new OpenAIEmbeddings();
const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings);
const retriever = vectorStore.asRetriever();

const model = new ChatOpenAI({ modelName: 'gpt-4o' });
const chain = await createRetrievalChain({ llm: model, retriever });

const result = await chain.invoke({ input: 'What are the key findings?' });
```

---

## 7. 向量数据库客户端

### 7.1 客户端对比

| 数据库 | JS/TS SDK | Stars | 定位 | 特色功能 |
|--------|-----------|-------|------|----------|
| **Pinecone** | `@pinecone-database/pinecone` | 800+ | 托管向量 DB | Serverless 自动扩缩容 |
| **Weaviate** | `weaviate-ts-client` | 1,200+ | 开源向量 DB | GraphQL 接口、混合搜索 |
| **Qdrant** | `@qdrant/js-client-rest` | 600+ | 高性能开源向量 DB | 过滤搜索、量化存储 |
| **pgvector** | `pg` + SQL | 12,000+ | PostgreSQL 扩展 | 与关系数据共存 |
| **Chroma** | `chromadb` | 4,000+ | 轻量本地向量 DB | 嵌入式、零配置 |

### 7.2 Pinecone 客户端示例

```typescript
import { Pinecone } from '@pinecone-database/pinecone';

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
const index = pc.index('docs-index');

// 批量 upsert
await index.namespace('products').upsert([
  { id: 'prod-1', values: embeddingVector, metadata: { category: 'electronics', price: 999 } },
]);

// 元数据过滤查询
const results = await index.namespace('products').query({
  vector: queryVector,
  topK: 10,
  filter: { category: { $eq: 'electronics' }, price: { $lte: 1500 } },
  includeMetadata: true,
});
```

---

## 8. MCP 与 Agent 协议

### 8.1 MCP（Model Context Protocol）

| 属性 | 详情 |
|------|------|
| **维护方** | Linux Foundation AAIF（2025.12 捐赠） |
| **月下载** | 9,700万+（npm, 2026-04） |
| **公共 Servers** | 5,800+ |

MCP 已成为连接 LLM 与外部工具的**事实标准**，TypeScript SDK 提供 Server/Client 双端开发能力：

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

const server = new Server({ name: 'weather-server', version: '1.0.0' }, { capabilities: { tools: {} } });
// ... 工具注册与处理
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 9. 选型决策矩阵

| 场景 | 推荐方案 |
|------|----------|
| **浏览器内 AI 功能（分类/Embedding）** | **Transformers.js v3 + WebGPU** |
| **浏览器内 Chatbot（Llama/Mistral）** | **WebLLM** |
| **跨平台模型部署（Web/Node/RN）** | **ONNX Runtime Web** |
| **Next.js 全栈 Chat 应用** | **Vercel AI SDK v4 + Zod** |
| **企业级 Agent 工作流编排** | **Mastra** |
| **复杂 RAG / 文档处理** | **LangChain.js** |
| **生产级向量检索（托管）** | **Pinecone** |
| **向量数据与业务数据共存** | **PostgreSQL + pgvector** |
| **快速原型 / 本地开发** | **Chroma** |

---

## 10. 关键数据汇总（2026-04）

| 项目 | Stars | 周下载 | 趋势 |
|------|-------|--------|------|
| Transformers.js | 12,500+ | 12万+ | ⬆️ 高速（WebGPU 驱动） |
| ONNX Runtime Web | 15,000+ | 25万+ | ⬆️ 稳定 |
| WebLLM | 13,000+ | 3万+ | ⬆️ 高速 |
| Vercel AI SDK | 12,000+ | 200万+ | ⬆️ 高速 |
| Mastra | 10,500+ | 5万+ | ⬆️ 爆发式增长 |
| LangChain.js | 15,500+ | 80万+ | ➡️ 成熟 |
| Zod | 36,000+ | 700万+ | ⬆️ 统治级 |
| Pinecone JS SDK | 800+ | 20万+ | ➡️ 稳定 |

---

> 📅 本文档最后更新：2026 年 4 月
>
> 💡 **提示**：2025-2026 年 JS/TS AI 生态呈现"端侧推理爆发 + Agent 框架成熟"的双轮驱动格局。Transformers.js v3 的 WebGPU 支持让浏览器运行 7B 模型成为现实，而 Mastra 和 Vercel AI SDK 则在全栈 Agent 开发体验上持续领先。选型时应根据是否需要浏览器端推理、工作流复杂度及团队技术栈综合判断。
