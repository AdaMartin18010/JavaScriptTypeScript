---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# AI 可观测性（AI Observability）完全指南

> 深度解析生产环境 LLM 应用的可观测性体系构建：从 OpenTelemetry LLM 语义约定到多租户成本归因，覆盖追踪、监控、告警与 A/B 测试全链路最佳实践。

---

## 1. AI 可观测性概述

### 1.1 为什么 AI 可观测性不同于传统可观测性

传统应用可观测性围绕三大支柱（Metrics、Logs、Traces）展开，假设系统行为是确定性的：相同输入必然产生相同输出，延迟分布相对可预测，错误边界清晰。然而，生产环境的 LLM 应用彻底打破了这些假设。

| 维度 | 传统可观测性 | AI 可观测性 |
|------|------------|------------|
| **输出确定性** | 确定性：相同输入 → 相同输出 | 非确定性：温度、采样、模型版本均影响输出 |
| **成本模型** | 按计算资源（CPU/内存/时长）计费 | 按 Token 消耗计费，输入/输出定价差异大 |
| **延迟来源** | 代码逻辑、数据库查询、网络 IO | 模型推理时间（首 Token 延迟 + 生成延迟） |
| **错误边界** | 二进制：200/500，异常/正常 | 模糊地带：幻觉、偏见、安全违规、语义偏离 |
| **版本管理** | 代码版本 + 依赖版本 | 额外需要 Prompt 版本、模型版本、RAG 上下文版本 |
| **调试对象** | 堆栈跟踪、SQL 查询计划 | Prompt 内容、Token 分布、Embedding 相似度 |

AI 可观测性的核心挑战在于：**你需要观测的不仅是"系统是否正常运行"，更是"模型是否在合理范围内工作"。** 一次 HTTP 200 响应可能携带着完全幻觉的答案；一次看似正常的对话可能消耗了 10 倍于预期的 Token。因此，AI 可观测性必须覆盖以下独特层面：

- **Prompt 版本追踪**：记录每次调用使用的 Prompt 模板版本、动态注入的变量、系统提示词变更历史
- **Token 级成本归因**：精确到每次请求、每个用户、每个会话的输入/输出 Token 数量与费用
- **语义质量评估**：通过规则、模型评判或人工反馈量化输出质量（幻觉率、相关性、安全性）
- **模型行为对比**：同一 Prompt 在不同模型（GPT-4o vs Claude 3.5）下的行为差异

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AI 可观测性覆盖范围                                    │
│                                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   基础设施    │  │   模型 API    │  │   应用逻辑    │  │   语义质量    │   │
│  │  (CPU/内存)  │  │ (Token/延迟) │  │ (Prompt/RAG) │  │ (幻觉/安全)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│        │                  │                  │                  │           │
│        ▼                  ▼                  ▼                  ▼           │
│   传统 APM 覆盖 ◄────────────────────────────────────────────►  AI 特有     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 生产环境 LLM 应用的关键风险

在构建可观测性体系之前，需要识别生产环境中最常见的风险场景：

1. **成本失控**：用户通过构造超长输入触发大量 Token 消耗，或模型输出长度远超预期
2. **延迟退化**：模型升级后首 Token 时间（Time To First Token, TTFT）显著增加，导致用户体验下降
3. **Prompt 漂移**：运营团队修改了 Prompt 模板但未记录版本，导致输出质量回归难以追溯
4. **上下文窗口溢出**：RAG 检索返回过多文档，超出模型上下文限制，导致关键信息被截断
5. **级联幻觉**：Agent 在工具调用循环中基于错误假设持续推理，产生连锁错误

---

## 2. OpenTelemetry LLM Semantic Conventions

### 2.1 为什么需要标准化的语义约定

在 AI 可观测性早期，各平台（Langfuse、LangSmith、Braintrust、Helicone 等）使用私有的数据格式记录 LLM 调用信息。这导致：

- 供应商锁定：数据导出与迁移困难
- 工具碎片化：同一应用接入多个平台需要重复埋点
- 分析口径不一致：Token 计数、延迟定义、错误分类缺乏统一标准

**OpenTelemetry LLM Semantic Conventions** 正在成长为行业标准，它基于成熟的 OpenTelemetry 生态，为 LLM 调用定义了标准的 Span 属性、事件和指标语义。预计到 2027 年，主流 APM（Datadog、New Relic、Grafana）将全面兼容这些约定，实现 AI 可观测性与传统可观测性的统一。

### 2.2 核心 Span 属性规范

以下是 LLM Semantic Conventions 中定义的关键属性，应在每次模型调用时记录：

| 属性名 | 类型 | 说明 | 示例 |
|--------|------|------|------|
| `gen_ai.system` | string | AI 系统标识 | `openai`, `anthropic`, `cohere` |
| `gen_ai.request.model` | string | 请求的模型名称 | `gpt-4o`, `claude-3-5-sonnet-20241022` |
| `gen_ai.response.model` | string | 实际响应的模型（可能与请求不同） | `gpt-4o-2024-08-06` |
| `gen_ai.usage.input_tokens` | int | 输入 Token 数 | `1024` |
| `gen_ai.usage.output_tokens` | int | 输出 Token 数 | `512` |
| `gen_ai.usage.total_tokens` | int | 总 Token 数 | `1536` |
| `gen_ai.request.temperature` | float | 采样温度 | `0.7` |
| `gen_ai.request.top_p` | float | 核采样参数 | `0.95` |
| `gen_ai.request.max_tokens` | int | 最大输出 Token 限制 | `4096` |
| `gen_ai.request.frequency_penalty` | float | 频率惩罚 | `0.0` |
| `gen_ai.request.presence_penalty` | float | 存在惩罚 | `0.0` |
| `gen_ai.prompt.0.role` | string | 第 0 条消息的角色 | `system` |
| `gen_ai.prompt.0.content` | string | 第 0 条消息内容 | `You are a helpful assistant.` |
| `gen_ai.completion.0.role` | string | 第 0 条完成消息的角色 | `assistant` |
| `gen_ai.completion.0.content` | string | 第 0 条完成消息内容 | `The answer is...` |
| `gen_ai.response.finish_reason` | string | 生成终止原因 | `stop`, `length`, `tool_calls` |

### 2.3 手动埋点实现示例

当使用未自动集成的框架或自定义 Agent 时，需要手动创建 OpenTelemetry Span：

```typescript
import { trace, SpanKind, Attributes } from '@opentelemetry/api'

const tracer = trace.getTracer('ai-agent', '1.0.0')

interface LLMCallOptions {
  model: string
  messages: Array<{ role: string; content: string }>
  temperature?: number
  maxTokens?: number
  userId?: string
  sessionId?: string
  promptVersion?: string
}

interface LLMCallResult {
  content: string
  usage: { inputTokens: number; outputTokens: number; totalTokens: number }
  finishReason: string
  model: string
  latencyMs: number
}

async function traceLLMCall(
  operation: string,
  options: LLMCallOptions,
  execute: () => Promise<LLMCallResult>
): Promise<LLMCallResult> {
  const startTime = Date.now()
  
  return tracer.startActiveSpan(
    `gen_ai.${operation}`,
    {
      kind: SpanKind.CLIENT,
      attributes: {
        'gen_ai.system': 'openai',
        'gen_ai.request.model': options.model,
        'gen_ai.request.temperature': options.temperature ?? 0.7,
        'gen_ai.request.max_tokens': options.maxTokens ?? 4096,
        'gen_ai.user.id': options.userId ?? 'anonymous',
        'gen_ai.session.id': options.sessionId ?? 'unknown',
        'gen_ai.prompt.version': options.promptVersion ?? 'latest',
        // 记录完整 Prompt（生产环境建议采样或脱敏）
        ...options.messages.reduce((acc, msg, idx) => {
          acc[`gen_ai.prompt.${idx}.role`] = msg.role
          acc[`gen_ai.prompt.${idx}.content`] = msg.content
          return acc
        }, {} as Attributes)
      }
    },
    async (span) => {
      try {
        const result = await execute()
        const latencyMs = Date.now() - startTime
        
        span.setAttributes({
          'gen_ai.response.model': result.model,
          'gen_ai.usage.input_tokens': result.usage.inputTokens,
          'gen_ai.usage.output_tokens': result.usage.outputTokens,
          'gen_ai.usage.total_tokens': result.usage.totalTokens,
          'gen_ai.response.finish_reason': result.finishReason,
          'gen_ai.latency.ms': latencyMs,
          'gen_ai.latency.ttft_ms': result.latencyMs // Time To First Token
        })
        
        // 记录完成内容（采样率控制）
        span.setAttribute('gen_ai.completion.0.role', 'assistant')
        span.setAttribute('gen_ai.completion.0.content', result.content)
        
        span.setStatus({ code: 0 }) // OK
        return result
      } catch (error) {
        span.recordException(error as Error)
        span.setAttributes({
          'error.type': error instanceof Error ? error.name : 'Unknown',
          'error.message': error instanceof Error ? error.message : String(error)
        })
        throw error
      } finally {
        span.end()
      }
    }
  )
}

// 使用示例
const result = await traceLLMCall('chat', {
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Explain TypeScript generics.' }
  ],
  temperature: 0.7,
  userId: 'user_12345',
  sessionId: 'sess_abc',
  promptVersion: 'v2.3.1'
}, async () => {
  // 实际的 OpenAI API 调用
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain TypeScript generics.' }
    ],
    temperature: 0.7
  })
  
  return {
    content: response.choices[0].message.content ?? '',
    usage: {
      inputTokens: response.usage?.prompt_tokens ?? 0,
      outputTokens: response.usage?.completion_tokens ?? 0,
      totalTokens: response.usage?.total_tokens ?? 0
    },
    finishReason: response.choices[0].finish_reason ?? 'unknown',
    model: response.model,
    latencyMs: 0 // 实际应从流式响应计算 TTFT
  }
})
```

### 2.4 成本属性扩展

虽然 OpenTelemetry 核心约定未强制要求成本字段，但在生产环境中建议扩展以下属性，便于后续成本分析：

```typescript
// 扩展成本相关属性
span.setAttributes({
  'gen_ai.cost.input_usd': result.usage.inputTokens * 0.000005,   // $5/M input tokens
  'gen_ai.cost.output_usd': result.usage.outputTokens * 0.000015, // $15/M output tokens
  'gen_ai.cost.total_usd': totalCost,
  'gen_ai.cost.currency': 'USD',
  'gen_ai.pricing.model_version': '2024-10-01' // 定价版本，应对调价场景
})
```

---

## 3. 主流平台与工具对比

### 3.1 平台概览

当前 AI 可观测性生态呈现"开源 leader + 商业闭环"的格局。以下是三大核心平台的深度对比：

| 维度 | **Langfuse** | **LangSmith** | **Braintrust** |
|------|-------------|--------------|---------------|
| **开源协议** | MIT (GitHub 8K+ stars) | 商业软件 | 商业软件 |
| **部署方式** | 云托管 / 私有化 Docker | 仅云托管 | 仅云托管 |
| **数据存储** | PostgreSQL + ClickHouse | 平台托管 | 平台托管 |
| **核心优势** | 开源透明、社区活跃、LLM 专注 | LangChain 生态深度集成 | 评估体系完善、数据集管理 |
| **追踪能力** | 完整 Trace/Span/Generation | 完整 Run/Step 追踪 | 实验级追踪 |
| **Prompt 管理** | Prompt 版本化与 Playground | Prompt Hub + 在线编辑 | Prompt 版本管理 |
| **评估系统** | 支持自定义 Score | 内置 evaluator + 规则 | 核心强项，支持 A/B 评估 |
| **成本追踪** | 开箱即用 Token 成本 | 基础 Token 统计 | 实验级成本分析 |
| **数据导出** | API / S3 / ClickHouse 直连 | 有限导出 | API 导出 |
| **价格模型** | 开源免费 + 云版按量 | 按 Trace 数量计费 | 按评估量计费 |
| **最佳场景** | 自托管需求、多平台集成 | 纯 LangChain 应用 | 重评估、重实验迭代 |

### 3.2 Langfuse：开源首选

Langfuse 是目前 GitHub 星数最高（8K+）的 AI 可观测性开源项目，采用 MIT 协议，支持私有化部署。

**核心架构：**

```
┌─────────────────────────────────────────────────────────────┐
│                         你的应用                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    │
│  │   AI SDK    │    │   Mastra    │    │  自定义 Agent │    │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            ▼                                │
│              ┌─────────────────────────┐                    │
│              │  Langfuse SDK / OTel    │                    │
│              │  (langfuse@3.x)         │                    │
│              └───────────┬─────────────┘                    │
└──────────────────────────┼──────────────────────────────────┘
                           │ HTTP / gRPC
                           ▼
              ┌─────────────────────────┐
              │     Langfuse Server     │
              │  (Next.js + PostgreSQL  │
              │   + ClickHouse + Redis) │
              └─────────────────────────┘
```

**TypeScript 集成示例：**

```typescript
import { Langfuse } from 'langfuse'

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.LANGFUSE_BASE_URL // 私有化部署时配置
})

// 创建 Trace（一次用户请求的全链路）
const trace = langfuse.trace({
  id: `trace_${requestId}`,
  name: 'chat-completion',
  userId: 'user_12345',
  sessionId: 'sess_abc',
  metadata: {
    plan: 'pro',
    region: 'ap-east-1'
  }
})

// 创建 Generation（一次 LLM 调用）
const generation = trace.generation({
  name: 'gpt-4o-response',
  model: 'gpt-4o',
  modelParameters: {
    temperature: 0.7,
    max_tokens: 4096
  },
  input: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: userQuery }
  ],
  usage: {
    input: 1024,
    output: 512,
    total: 1536,
    inputCost: 0.00512,
    outputCost: 0.00768,
    totalCost: 0.01280
  }
})

// 记录生成结果
generation.end({
  output: assistantResponse,
  metadata: {
    finishReason: 'stop',
    latencyMs: 2340,
    ttftMs: 180
  }
})

// 记录自定义评分（如幻觉检测分数）
langfuse.score({
  traceId: trace.id,
  name: 'hallucination_score',
  value: 0.15, // 0-1，越低越好
  comment: '输出中未检测到与事实不符的声明'
})

// 记录用户反馈
langfuse.score({
  traceId: trace.id,
  name: 'user_feedback',
  value: 1, // 👍
  comment: '用户点击了 thumbs up'
})

// 确保数据在请求结束前刷新
await langfuse.shutdownAsync()
```

**Langfuse 自托管要点：**

```yaml
# docker-compose.yml 简化版
version: '3'
services:
  langfuse:
    image: ghcr.io/langfuse/langfuse:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@postgres:5432/langfuse
      - CLICKHOUSE_URL=http://clickhouse:8123
      - REDIS_URL=redis://redis:6379
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - SALT=${SALT}
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
```

### 3.3 LangSmith：LangChain 生态首选

LangSmith 由 LangChain 团队开发，与 LangChain/LangGraph 生态深度集成。如果你的技术栈完全基于 LangChain，LangSmith 提供了最无缝的体验。

```typescript
import { LangChainTracer } from 'langchain/callbacks'
import { ChatOpenAI } from '@langchain/openai'

const tracer = new LangChainTracer({
  projectName: 'production-chatbot',
  client: new Client({
    apiUrl: 'https://api.smith.langchain.com',
    apiKey: process.env.LANGSMITH_API_KEY
  })
})

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.7,
  callbacks: [tracer]
})

// 所有调用自动追踪，无需手动创建 span
const result = await model.invoke('Explain quantum computing.')
```

**LangSmith 的局限：**
- 闭源且仅云托管，无法满足数据合规的私有化需求
- 与 LangChain 强耦合，非 LangChain 应用集成成本较高
- 成本分析能力较弱，缺乏细粒度的租户级成本归因

### 3.4 Braintrust：评估驱动型平台

Braintrust 的定位更偏向"AI 工程质量平台"，其核心优势在于强大的评估（Eval）体系和实验管理。

```typescript
import { initLogger, wrapOpenAI } from 'braintrust'

const logger = initLogger({
  projectName: 'customer-support-bot',
  apiKey: process.env.BRAINTRUST_API_KEY
})

const client = wrapOpenAI(new OpenAI(), { logger })

// 自动记录调用，同时支持实验对比
const result = await client.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: query }]
})

// 定义评估指标
await logger.computeSummary({
  scores: {
    relevance: calculateRelevance(query, result),
    factual_accuracy: await factCheck(result),
    tone: evaluateTone(result)
  }
})
```

**选型建议：**
- **需要自托管 / 数据主权**：选择 Langfuse
- **深度使用 LangChain / LangGraph**：选择 LangSmith
- **重视评估体系与实验迭代**：选择 Braintrust
- **长期战略**：基于 OpenTelemetry 构建埋点层，保持平台切换灵活性

### 3.5 Helicone / Weave / Traceloop 专项对比

除上述三大核心平台外，生产环境中还经常接入以下专项工具，分别覆盖 Gateway 代理、实验追踪和 OpenTelemetry 原生集成场景。

| 维度 | **Helicone** | **Weave** | **Traceloop** |
|------|-------------|-----------|---------------|
| **定位** | LLM Gateway + 可观测性 | W&B 实验追踪延伸至 LLM | OpenTelemetry 原生 LLM Instrumentation |
| **开源协议** | ⚠️ 部分开源（Gateway 开源） | ⚠️ 部分开源 | ✅ Apache 2.0 |
| **核心能力** | 请求代理、缓存、成本追踪、实验管理、速率限制 | 实验追踪、模型评估、数据集版本、Prompt 迭代 | 自动 Instrumentation、分布式追踪、语义约定对齐 |
| **部署方式** | 云托管 / 自建 Gateway | 云托管（W&B 平台） | 自托管 / 云 |
| **集成成本** | 低（修改 baseURL 即可） | 中（需 SDK 埋点） | 低（自动注入，零代码改动） |
| **缓存能力** | ✅ Prompt 级缓存，命中即返回 | ❌ | ❌ |
| **成本追踪** | ✅ 实时成本仪表盘 + 预算告警 | ⚠️ 实验级成本分析 | ✅ 通过 OTel 属性扩展 |
| **Prompt 管理** | ✅ 在线版本化与 A/B 测试 | ✅ 实验级 Prompt 版本 | ❌ |
| **最佳场景** | 需要 Gateway 层代理、缓存、速率限制 | 模型微调与实验迭代闭环 | 已有 OTel 基础设施、追求零侵入 |

#### Helicone：Gateway 层可观测性

Helicone 的独特定位在于**拦截层（Intercept Layer）**：通过将 LLM API 的 baseURL 指向 Helicone Gateway，无需修改业务代码即可获得完整的请求日志、缓存和成本分析。

```typescript
// 集成方式：仅修改 baseURL 和添加 headers
import OpenAI from 'openai'

const openai = new OpenAI({
  baseURL: 'https://oai.hconeai.com/v1', // Helicone Gateway
  defaultHeaders: {
    'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY}`,
    'Helicone-Property-SessionId': 'sess_abc',
    'Helicone-Property-UserId': 'user_123',
  }
})

// 所有请求自动被追踪，包括缓存命中、成本、延迟
const response = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: 'Hello' }]
})
```

**Helicone 的 Gateway 特性：**

| 特性 | 说明 |
|------|------|
| **Prompt 缓存** | 相同 Prompt 命中缓存时直接返回，降低 50-90% API 成本 |
| **速率限制** | 按 Key / User / Organization 多级限流，防止突发流量击穿预算 |
| **请求重试** | 自动降级至备用模型（如 GPT-4o → GPT-4o-mini） |
| **实验管理** | 通过 Header 标记实验分组，自动对比不同 Prompt/模型的效果 |

#### Weave：实验追踪与模型迭代

Weave 由 Weights & Biases（W&B）推出，将传统 ML 实验管理的成熟能力迁移到 LLM 应用开发中，特别适合**模型微调 + Prompt 工程**的闭环迭代。

```typescript
import { weave } from 'weave'

// 初始化 Weave 项目
const client = await weave.init('my-llm-app')

// 追踪任意函数（自动捕获输入输出、延迟、异常）
const tracedGenerate = client.traceFunction(
  async (prompt: string) => {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    })
    return response.choices[0].message.content
  },
  { name: 'generate-text' }
)

// 调用即追踪
const result = await tracedGenerate('Explain quantum computing')

// 数据集版本管理与评估流水线
await client.publishDataset({
  name: 'qa-eval-v2',
  rows: evalData
})

await client.runEvaluation({
  model: tracedGenerate,
  dataset: 'qa-eval-v2',
  scorers: [relevanceScorer, factualAccuracyScorer]
})
```

**Weave 的核心优势：**
- 📊 **实验对比**：同一数据集在不同模型/Prompt 下的表现并排对比
- 🔄 **数据集版本化**：评估数据集像代码一样版本管理，支持回滚
- 🧪 **评估流水线**：内置多种 scorer（相关性、事实性、安全性），支持自定义
- 🔗 **W&B 生态打通**：微调训练 run 与线上推理 trace 在同一平台关联

#### Traceloop：OpenTelemetry 原生集成

Traceloop 是**最符合 OpenTelemetry 标准**的 LLM 可观测性方案，适合已有 APM 基础设施（Datadog、New Relic、Grafana）的团队。

```typescript
// 零代码改动：仅初始化即自动追踪所有 LLM 调用
import { Traceloop } from '@traceloop/node-server-sdk'

Traceloop.init({
  appName: 'my-ai-service',
  apiKey: process.env.TRACELOOP_API_KEY,
  // 支持导出到任意 OTel-compatible backend
  exporter: {
    url: 'https://otel-collector.internal.com/v1/traces'
  }
})

// 自动 Instrument 支持的库：
// - OpenAI, Anthropic, Cohere, Azure OpenAI
// - LangChain, LlamaIndex, Vercel AI SDK
// - Pinecone, Chroma, pgvector 等向量数据库

// 业务代码无需任何改动
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'

const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Explain TypeScript generics'
})
// 上述调用自动生成符合 LLM Semantic Conventions 的 Trace/Span
```

**Traceloop 的自动追踪覆盖范围：**

| 层级 | 自动 Instrument | 语义约定 |
|------|----------------|---------|
| **LLM 调用** | OpenAI, Anthropic, Azure, Bedrock | `gen_ai.*` |
| **框架层** | LangChain, LlamaIndex, AI SDK | `traceloop.framework.*` |
| **向量检索** | Pinecone, Chroma, pgvector | `db.vector.*` |
| **工具调用** | 自定义函数（通过装饰器） | `gen_ai.tool.*` |

**三工具选型速查：**

| 场景 | 推荐工具 |
|------|---------|
| 需要 Gateway 层代理、缓存、限流 | **Helicone** |
| 正在进行模型微调，需要实验闭环 | **Weave** |
| 已有 Datadog/Grafana，追求零侵入 | **Traceloop** |
| 需要自托管、数据主权 | **Langfuse**（3.2 节） |
| 深度 LangChain 生态 | **LangSmith**（3.3 节） |

---

## 4. Token 成本追踪与多租户 SaaS 归因

### 4.1 Token 成本为何复杂

LLM 定价模型具有以下特征，使得成本追踪远比传统云计算复杂：

1. **双重定价**：输入 Token 与输出 Token 单价不同（通常输出更贵）
2. **模型差异**：同一厂商不同模型价差可达 10-50 倍（GPT-4o vs GPT-4o-mini）
3. **动态调价**：厂商定期调整价格（如 OpenAI 2024 年多次降价）
4. **缓存折扣**：部分平台提供 Prompt 缓存折扣（如 Anthropic 的 prompt caching）
5. **批量折扣**：高并发场景下可能存在批量 API 折扣

```
单次请求成本 = (input_tokens × input_price_per_1k / 1000)
            + (output_tokens × output_price_per_1k / 1000)
            - cache_discount
            + 批量/微调附加费
```

### 4.2 多租户成本归因架构

在多租户 SaaS 应用中，需要将 Token 成本精确归因到用户、组织、功能和会话四个维度。

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         成本归因维度树                                        │
│                                                                             │
│  Organization (org_abc)                                                     │
│  ├── Workspace (ws_prod)                                                    │
│  │   ├── User (user_123)                                                    │
│  │   │   ├── Session (sess_xyz)                                             │
│  │   │   │   ├── Feature (chat)                                             │
│  │   │   │   │   ├── Request (req_001) ──► $0.0123                         │
│  │   │   │   │   ├── Request (req_002) ──► $0.0045                         │
│  │   │   │   │   └── Request (req_003) ──► $0.0091                         │
│  │   │   │   └── Feature (summarize)                                       │
│  │   │   │       └── Request (req_004) ──► $0.0021                         │
│  │   │   └── Session (sess_abc)                                             │
│  │   └── User (user_456)                                                    │
│  └── Workspace (ws_dev)                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.3 实时成本计费系统实现

```typescript
interface PricingTier {
  model: string
  inputPricePer1K: number   // 美元
  outputPricePer1K: number  // 美元
  effectiveFrom: Date
  effectiveTo?: Date
}

interface CostRecord {
  requestId: string
  organizationId: string
  userId: string
  sessionId: string
  feature: string
  model: string
  inputTokens: number
  outputTokens: number
  inputCost: number
  outputCost: number
  totalCost: number
  currency: string
  timestamp: Date
  promptVersion: string
}

class TokenCostTracker {
  private pricingTable: Map<string, PricingTier[]> = new Map()
  private costBuffer: CostRecord[] = []
  private flushInterval: NodeJS.Timeout
  
  constructor(
    private db: CostDatabase,
    private cache: RedisClient
  ) {
    // 每 30 秒批量刷新一次成本记录
    this.flushInterval = setInterval(() => this.flush(), 30000)
  }
  
  registerPricing(tier: PricingTier) {
    const tiers = this.pricingTable.get(tier.model) ?? []
    tiers.push(tier)
    tiers.sort((a, b) => b.effectiveFrom.getTime() - a.effectiveFrom.getTime())
    this.pricingTable.set(tier.model, tiers)
  }
  
  getActivePricing(model: string, at: Date = new Date()): PricingTier | undefined {
    const tiers = this.pricingTable.get(model)
    if (!tiers) return undefined
    return tiers.find(t => t.effectiveFrom <= at && (!t.effectiveTo || t.effectiveTo > at))
  }
  
  calculateCost(model: string, inputTokens: number, outputTokens: number): {
    inputCost: number
    outputCost: number
    totalCost: number
  } {
    const pricing = this.getActivePricing(model)
    if (!pricing) {
      throw new Error(`No pricing found for model: ${model}`)
    }
    
    const inputCost = (inputTokens * pricing.inputPricePer1K) / 1000
    const outputCost = (outputTokens * pricing.outputPricePer1K) / 1000
    
    return {
      inputCost: Math.round(inputCost * 1e9) / 1e9,  // 保留 9 位小数
      outputCost: Math.round(outputCost * 1e9) / 1e9,
      totalCost: Math.round((inputCost + outputCost) * 1e9) / 1e9
    }
  }
  
  async record(
    context: {
      requestId: string
      organizationId: string
      userId: string
      sessionId: string
      feature: string
      promptVersion: string
    },
    usage: {
      model: string
      inputTokens: number
      outputTokens: number
    }
  ): Promise<CostRecord> {
    const cost = this.calculateCost(usage.model, usage.inputTokens, usage.outputTokens)
    
    const record: CostRecord = {
      requestId: context.requestId,
      organizationId: context.organizationId,
      userId: context.userId,
      sessionId: context.sessionId,
      feature: context.feature,
      model: usage.model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      inputCost: cost.inputCost,
      outputCost: cost.outputCost,
      totalCost: cost.totalCost,
      currency: 'USD',
      timestamp: new Date(),
      promptVersion: context.promptVersion
    }
    
    // 写入实时缓存（用于仪表盘即时显示）
    await this.updateRealtimeBudget(context.organizationId, record.totalCost)
    
    // 缓冲批量写入
    this.costBuffer.push(record)
    if (this.costBuffer.length >= 100) {
      await this.flush()
    }
    
    return record
  }
  
  private async updateRealtimeBudget(orgId: string, cost: number) {
    const key = `budget:${orgId}:${new Date().toISOString().slice(0, 7)}` // 按月
    await this.cache.incrByFloat(key, cost)
    await this.cache.expire(key, 86400 * 35) // 35 天过期
    
    // 检查预算阈值
    const current = parseFloat(await this.cache.get(key) ?? '0')
    const limit = await this.getOrgBudgetLimit(orgId)
    if (current > limit * 0.9) {
      await this.sendBudgetAlert(orgId, current, limit)
    }
  }
  
  private async flush() {
    if (this.costBuffer.length === 0) return
    const batch = this.costBuffer.splice(0, this.costBuffer.length)
    await this.db.insertCostRecords(batch)
  }
  
  // 按多维度聚合查询
  async getCostBreakdown(
    organizationId: string,
    start: Date,
    end: Date,
    groupBy: 'user' | 'feature' | 'model' | 'day'
  ): Promise<Array<{ dimension: string; totalTokens: number; totalCost: number; requestCount: number }>> {
    return this.db.aggregateCosts({ organizationId, start, end, groupBy })
  }
  
  async destroy() {
    clearInterval(this.flushInterval)
    await this.flush()
  }
}

// 初始化定价表
const tracker = new TokenCostTracker(db, redis)
tracker.registerPricing({
  model: 'gpt-4o',
  inputPricePer1K: 2.50,
  outputPricePer1K: 10.00,
  effectiveFrom: new Date('2024-10-01')
})
tracker.registerPricing({
  model: 'gpt-4o-mini',
  inputPricePer1K: 0.15,
  outputPricePer1K: 0.60,
  effectiveFrom: new Date('2024-10-01')
})
tracker.registerPricing({
  model: 'claude-3-5-sonnet-20241022',
  inputPricePer1K: 3.00,
  outputPricePer1K: 15.00,
  effectiveFrom: new Date('2024-10-01')
})
```

### 4.4 预算控制与硬限制

多租户系统中常见的预算策略：

| 策略 | 触发条件 | 行为 | 适用场景 |
|------|---------|------|---------|
| **软告警** | 月度预算达 80% | 通知管理员，服务继续 | 所有组织 |
| **限流降级** | 月度预算达 100% | 切换至 cheaper 模型（4o → 4o-mini） | 非关键业务 |
| **硬切断** | 月度预算达 110% 或突发异常 | 拒绝新请求，返回 429 | 严格控制成本的组织 |
| **按功能配额** | 某功能超配额 | 该功能限流，其他功能正常 | 分级功能套餐 |

---

## 5. Prompt 与模型的 A/B 测试

### 5.1 为什么需要 A/B 测试

LLM 应用的输出质量高度依赖于：
- **Prompt 工程**：系统提示词的微小改动可能导致输出质量显著变化
- **模型选择**：不同模型在成本、延迟、质量之间存在权衡
- **参数调优**：temperature、top_p 等采样参数影响输出的创造性与稳定性

A/B 测试为这些数据驱动的决策提供科学依据，避免"感觉这个 Prompt 更好"的主观判断。

### 5.2 A/B 测试实验设计

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          A/B 测试架构                                         │
│                                                                             │
│   流量分配器 (Traffic Router)                                                │
│         │                                                                   │
│    ┌────┴────┬────────────┬────────────┐                                   │
│    ▼         ▼            ▼            ▼                                   │
│ ┌──────┐ ┌──────┐   ┌──────────┐  ┌──────────┐                            │
│ │控制组│ │实验组A│   │  实验组B  │  │  实验组C  │                            │
│ │v1.0  │ │v1.1  │   │v1.1+claude│  │v1.1+t0.9 │                            │
│ │gpt-4o│ │gpt-4o│   │3.5-sonnet │  │gpt-4o    │                            │
│ └──┬───┘ └──┬───┘   └────┬─────┘  └────┬─────┘                            │
│    │        │            │             │                                   │
│    └────────┴────────────┴─────────────┘                                   │
│                     │                                                       │
│                     ▼                                                       │
│         ┌─────────────────────┐                                             │
│         │   评估器 (Evaluator) │                                             │
│         │  - 延迟对比          │                                             │
│         │  - Token 成本对比     │                                             │
│         │  - 质量评分 (LLM-as-judge) │                                        │
│         │  - 用户反馈率         │                                             │
│         └─────────────────────┘                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 TypeScript 实现：实验框架

```typescript
interface Experiment {
  id: string
  name: string
  trafficAllocation: number // 0-1，总流量中参与实验的比例
  variants: Variant[]
  metrics: string[] // 关注的指标
  startAt: Date
  endAt?: Date
}

interface Variant {
  id: string
  name: string
  weight: number // 组内流量权重
  config: {
    promptVersion: string
    model: string
    temperature: number
    maxTokens: number
    systemPrompt?: string
  }
}

class ExperimentEngine {
  private experiments: Map<string, Experiment> = new Map()
  private assignments: Map<string, string> = new Map() // userId -> variantId
  
  constructor(private tracking: Langfuse | OTelTracer) {}
  
  registerExperiment(experiment: Experiment) {
    const totalWeight = experiment.variants.reduce((s, v) => s + v.weight, 0)
    if (Math.abs(totalWeight - 1) > 0.001) {
      throw new Error(`Variant weights must sum to 1, got ${totalWeight}`)
    }
    this.experiments.set(experiment.id, experiment)
  }
  
  assignVariant(experimentId: string, userId: string): Variant {
    const experiment = this.experiments.get(experimentId)
    if (!experiment) throw new Error(`Experiment ${experimentId} not found`)
    
    // 一致性哈希：同一用户始终分配至同一组
    const assignmentKey = `${experimentId}:${userId}`
    const cached = this.assignments.get(assignmentKey)
    if (cached) {
      return experiment.variants.find(v => v.id === cached)!
    }
    
    // 基于用户 ID 哈希决定分组
    const hash = this.hashString(`${experimentId}:${userId}`)
    let cumulative = 0
    for (const variant of experiment.variants) {
      cumulative += variant.weight
      if (hash <= cumulative) {
        this.assignments.set(assignmentKey, variant.id)
        
        // 记录分配事件
        this.tracking.event({
          name: 'experiment_assignment',
          traceId: assignmentKey,
          metadata: {
            experimentId,
            variantId: variant.id,
            userId
          }
        })
        
        return variant
      }
    }
    return experiment.variants[experiment.variants.length - 1]
  }
  
  async runWithVariant<T>(
    experimentId: string,
    userId: string,
    fn: (variant: Variant) => Promise<T>
  ): Promise<T> {
    const variant = this.assignVariant(experimentId, userId)
    const startTime = Date.now()
    
    try {
      const result = await fn(variant)
      const latency = Date.now() - startTime
      
      // 记录实验指标
      this.tracking.score({
        traceId: `${experimentId}:${userId}:${Date.now()}`,
        name: `${experimentId}_latency`,
        value: latency
      })
      
      return result
    } catch (error) {
      this.tracking.score({
        traceId: `${experimentId}:${userId}:${Date.now()}`,
        name: `${experimentId}_error`,
        value: 1
      })
      throw error
    }
  }
  
  private hashString(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转为 32bit 整数
    }
    return (Math.abs(hash) % 1000) / 1000 // 归一化到 0-1
  }
}

// 使用示例
const engine = new ExperimentEngine(langfuse)

engine.registerExperiment({
  id: 'prompt-v2-experiment',
  name: 'Prompt V2 效果验证',
  trafficAllocation: 0.3, // 30% 流量参与实验
  variants: [
    {
      id: 'control',
      name: '当前版本',
      weight: 0.5,
      config: { promptVersion: 'v1.0', model: 'gpt-4o', temperature: 0.7 }
    },
    {
      id: 'treatment',
      name: '新版本',
      weight: 0.5,
      config: { promptVersion: 'v2.1', model: 'gpt-4o', temperature: 0.5 }
    }
  ],
  metrics: ['latency', 'cost', 'user_feedback', 'hallucination_score'],
  startAt: new Date()
})

// 在请求处理中应用
app.post('/chat', async (req, res) => {
  const { userId, message } = req.body
  
  const response = await engine.runWithVariant(
    'prompt-v2-experiment',
    userId,
    async (variant) => {
      const prompt = await loadPrompt(variant.config.promptVersion)
      return await callLLM({
        model: variant.config.model,
        temperature: variant.config.temperature,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: message }
        ]
      })
    }
  )
  
  res.json({ reply: response })
})
```

### 5.4 实验评估指标

| 指标类别 | 具体指标 | 评估方式 | 成功标准 |
|---------|---------|---------|---------|
| **效率** | P50/P95/P99 延迟 | 自动采集 | 实验组不劣于控制组 10% |
| **成本** | 单次请求平均成本 | Token × 单价 | 实验组成本降低 ≥ 15% |
| **质量** | 幻觉检测分数 | LLM-as-judge / 规则 | 实验组分数提升 ≥ 5% |
| **质量** | 相关性评分 | 嵌入余弦相似度 | 实验组 ≥ 控制组 |
| **用户** | 点赞率 / 点踩率 | 前端埋点 | 实验组点赞率提升 |
| **业务** | 任务完成率 | 业务事件 | 实验组完成率提升 |

---

## 6. 集成模式：主流框架的观测性接入

### 6.1 Vercel AI SDK v6

Vercel AI SDK v6 内置了可观测性中间件体系，可无缝接入 Langfuse、LangSmith 等平台。

```typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { createOpenTelemetryMiddleware } from '@vercel/otel'

// 方式一：使用 AI SDK 内置的 Telemetry
const result = await generateText({
  model: openai('gpt-4o'),
  prompt: 'Explain React Server Components.',
  experimental_telemetry: {
    isEnabled: true,
    functionId: 'explain-rsc',
    metadata: {
      userId: 'user_123',
      sessionId: 'sess_abc',
      promptVersion: 'v2.1'
    }
  }
})

// 方式二：自定义中间件（拦截所有 AI SDK 调用）
const observabilityMiddleware = {
  wrapGenerate: async ({ doGenerate, params }) => {
    const start = Date.now()
    const result = await doGenerate()
    const latency = Date.now() - start
    
    // 发送到可观测性平台
    await langfuse.generation({
      name: params.model.modelId,
      model: params.model.modelId,
      input: params.prompt,
      output: result.text,
      usage: {
        input: result.usage.promptTokens,
        output: result.usage.completionTokens
      },
      metadata: { latencyMs: latency }
    })
    
    return result
  }
}

// 在 AI SDK Provider 中注册中间件
const model = openai('gpt-4o', {
  middleware: observabilityMiddleware
})
```

### 6.2 Mastra

Mastra 是新兴的 TypeScript AI Agent 框架，其可观测性基于 OpenTelemetry 构建。

```typescript
import { Mastra } from '@mastra/core'
import { createLogger } from '@mastra/core/logger'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'

const mastra = new Mastra({
  agents: {
    supportAgent: {
      name: 'Support Agent',
      instructions: 'You are a helpful customer support agent.',
      model: openai('gpt-4o')
    }
  },
  // 配置 OTel 导出
  telemetry: {
    serviceName: 'mastra-support-app',
    enabled: true,
    export: {
      type: 'otlp',
      endpoint: 'https://api.langfuse.com/api/public/otel/v1/traces',
      headers: {
        'Authorization': `Basic ${btoa(`${publicKey}:${secretKey}`)}`
      }
    }
  }
})

// Mastra 自动追踪：
// - Agent 调用（gen_ai.agent.*）
// - Tool 调用（gen_ai.tool.*）
// - Workflow 执行步骤
// - LLM Generation

const agent = mastra.getAgent('supportAgent')
const result = await agent.generate('My order hasn\'t arrived yet.')
```

### 6.3 自定义 Agent 的观测性接入

对于未使用主流框架的自定义 Agent，建议采用分层埋点策略：

```typescript
interface AgentStep {
  stepId: string
  type: 'reasoning' | 'tool_call' | 'tool_result' | 'final_answer'
  input: unknown
  output: unknown
  latencyMs: number
  tokens?: { input: number; output: number }
}

class ObservableAgent {
  private tracer = trace.getTracer('custom-agent')
  
  async execute(userQuery: string, context: AgentContext): Promise<string> {
    const traceId = `agent_${context.sessionId}_${Date.now()}`
    
    return this.tracer.startActiveSpan(
      'agent.execution',
      {
        attributes: {
          'agent.session_id': context.sessionId,
          'agent.user_id': context.userId,
          'agent.query': userQuery,
          'agent.max_steps': context.maxSteps
        }
      },
      async (span) => {
        const steps: AgentStep[] = []
        let currentQuery = userQuery
        
        for (let step = 0; step < context.maxSteps; step++) {
          const stepSpan = this.tracer.startSpan(`agent.step.${step}`, {
            attributes: { 'agent.step.index': step }
          })
          
          // 推理步骤
          const reasoningStart = Date.now()
          const reasoning = await this.reason(currentQuery, context)
          const reasoningLatency = Date.now() - reasoningStart
          
          steps.push({
            stepId: `${traceId}_step_${step}`,
            type: 'reasoning',
            input: currentQuery,
            output: reasoning.plan,
            latencyMs: reasoningLatency,
            tokens: reasoning.usage
          })
          
          stepSpan.setAttributes({
            'agent.step.type': 'reasoning',
            'agent.step.latency_ms': reasoningLatency,
            'gen_ai.usage.input_tokens': reasoning.usage?.input ?? 0,
            'gen_ai.usage.output_tokens': reasoning.usage?.output ?? 0
          })
          
          // 工具调用
          if (reasoning.requiresTool) {
            const toolStart = Date.now()
            const toolResult = await this.executeTool(reasoning.toolCall!)
            const toolLatency = Date.now() - toolStart
            
            steps.push({
              stepId: `${traceId}_tool_${step}`,
              type: 'tool_result',
              input: reasoning.toolCall,
              output: toolResult,
              latencyMs: toolLatency
            })
            
            stepSpan.setAttributes({
              'agent.tool.name': reasoning.toolCall.name,
              'agent.tool.latency_ms': toolLatency,
              'agent.tool.success': !toolResult.error
            })
            
            currentQuery = `Tool result: ${JSON.stringify(toolResult)}\nOriginal query: ${userQuery}`
          } else {
            // 最终答案
            stepSpan.setAttribute('agent.step.type', 'final_answer')
            stepSpan.end()
            
            span.setAttributes({
              'agent.total_steps': steps.length,
              'agent.total_latency_ms': steps.reduce((s, st) => s + st.latencyMs, 0),
              'agent.completed': true
            })
            span.end()
            
            return reasoning.plan
          }
          
          stepSpan.end()
        }
        
        // 达到最大步数限制
        span.setAttributes({
          'agent.total_steps': steps.length,
          'agent.completed': false,
          'agent.termination_reason': 'max_steps_reached'
        })
        span.end()
        
        throw new Error('Agent exceeded maximum steps')
      }
    )
  }
  
  private async reason(query: string, context: AgentContext) {
    // 调用 LLM 进行推理
    return { plan: '', requiresTool: false, toolCall: null, usage: { input: 0, output: 0 } }
  }
  
  private async executeTool(toolCall: ToolCall) {
    // 执行工具
    return { result: null }
  }
}
```

---

## 7. 核心指标监控体系

### 7.1 指标分层模型

生产环境 LLM 应用的监控应覆盖四个层次：

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        指标监控分层                                           │
│                                                                             │
│  Layer 4: 业务层                                                            │
│    ├── 任务完成率        ├── 用户满意度        ├── 转化率                    │
│                                                                             │
│  Layer 3: 语义质量层                                                         │
│    ├── 幻觉率          ├── 相关性评分        ├── 安全合规分数                │
│                                                                             │
│  Layer 2: LLM API 层                                                        │
│    ├── 延迟 (TTFT/TBT)  ├── Token 吞吐量     ├── 成本/请求                  │
│    ├── 错误率          ├── 限流率           ├── 重试率                      │
│                                                                             │
│  Layer 1: 基础设施层                                                         │
│    ├── CPU / 内存      ├── 网络 IO         ├── 节点健康度                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 关键指标详解

#### 7.2.1 延迟指标

| 指标 | 定义 | 目标值参考 | 监控重点 |
|------|------|-----------|---------|
| **TTFT** (Time To First Token) | 请求发出到首 Token 返回的时间 | < 300ms | 模型负载、网络路由 |
| **TBT** (Time Between Tokens) | 相邻 Token 间的间隔时间 | < 50ms | 流式生成流畅度 |
| **总延迟** | 请求发出到完整响应返回 | < 3s (P95) | 端到端用户体验 |
| **TPOT** (Time Per Output Token) | 每输出 Token 平均耗时 | 视模型而定 | 模型效率对比 |

```typescript
// 延迟指标采集示例
function calculateLatencyMetrics(timestamps: {
  requestStart: number
  firstTokenReceived?: number
  lastTokenReceived: number
  tokenTimestamps: number[]
}): {
  ttft: number
  totalLatency: number
  avgTBT: number
  tpot: number
} {
  const ttft = timestamps.firstTokenReceived 
    ? timestamps.firstTokenReceived - timestamps.requestStart 
    : timestamps.lastTokenReceived - timestamps.requestStart
  const totalLatency = timestamps.lastTokenReceived - timestamps.requestStart
  
  let totalTBT = 0
  for (let i = 1; i < timestamps.tokenTimestamps.length; i++) {
    totalTBT += timestamps.tokenTimestamps[i] - timestamps.tokenTimestamps[i - 1]
  }
  const avgTBT = timestamps.tokenTimestamps.length > 1 
    ? totalTBT / (timestamps.tokenTimestamps.length - 1) 
    : 0
  
  const outputTokens = timestamps.tokenTimestamps.length
  const tpot = outputTokens > 0 ? totalLatency / outputTokens : 0
  
  return { ttft, totalLatency, avgTBT, tpot }
}
```

#### 7.2.2 Token 与成本指标

| 指标 | 计算公式 | 用途 |
|------|---------|------|
| **Token 吞吐量** | 总 Token / 时间窗口 | 容量规划 |
| **输入/输出比** | input_tokens / output_tokens | 检测异常膨胀 |
| **单位成本效率** | 业务价值 / 总成本 | ROI 分析 |
| **缓存命中率** | 缓存命中请求 / 总请求 | Prompt 缓存优化效果 |

#### 7.2.3 质量指标

**幻觉率（Hallucination Rate）** 是 AI 应用最核心的质量指标之一。检测方法包括：

```typescript
// 基于 LLM-as-Judge 的幻觉检测
async function detectHallucination(
  claim: string,
  context: string,
  judgeModel: string = 'gpt-4o'
): Promise<{ isHallucination: boolean; confidence: number }> {
  const prompt = `You are a fact-checking assistant. Given the following CONTEXT and CLAIM, determine if the claim contains information NOT supported by the context (hallucination).

CONTEXT:
${context}

CLAIM:
${claim}

Respond ONLY with a JSON object in this format:
{ "isHallucination": boolean, "confidence": number (0-1), "unsupportedStatements": string[] }`

  const response = await callLLM({
    model: judgeModel,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0
  })
  
  try {
    const result = JSON.parse(response)
    return {
      isHallucination: result.isHallucination,
      confidence: result.confidence
    }
  } catch {
    return { isHallucination: false, confidence: 0 }
  }
}

// 批量幻觉率计算
async function calculateHallucinationRate(
  samples: Array<{ claim: string; context: string }>
): Promise<number> {
  const results = await Promise.all(
    samples.map(s => detectHallucination(s.claim, s.context))
  )
  const hallucinations = results.filter(r => r.isHallucination && r.confidence > 0.7)
  return hallucinations.length / samples.length
}
```

### 7.3 指标采集与存储建议

| 数据类型 | 存储方案 | 保留周期 | 查询场景 |
|---------|---------|---------|---------|
| 原始 Trace | ClickHouse / BigQuery | 30 天 | 调试、根因分析 |
| 聚合指标 | Prometheus / VictoriaMetrics | 15 个月 | 仪表盘、告警 |
| 成本记录 | PostgreSQL / OLAP | 24 个月 | 计费、财务对账 |
| 实验数据 | 数据仓库 (Snowflake) | 长期 | 离线分析、报告 |

---

## 8. 告警与 SLO 设计

### 8.1 AI 系统特有的告警场景

| 告警级别 | 场景 | 检测方式 | 响应动作 |
|---------|------|---------|---------|
| **P0 - 紧急** | 成本异常激增（> 5x 基线） | 实时成本流检测 | 自动限流、通知值班 |
| **P0 - 紧急** | 幻觉率突增（> 30%） | 滑动窗口质量评分 | 降级至备用模型 |
| **P1 - 高** | P99 延迟 > 10s 持续 5min | 延迟百分位监控 | 扩容、切换模型 |
| **P1 - 高** | 错误率 > 5%（API 异常） | 状态码 + 异常检测 | 熔断、重试策略调整 |
| **P2 - 中** | 单用户 Token 消耗 Top 1% | 租户级成本分析 | 用户通知、套餐调整 |
| **P2 - 中** | Prompt 版本与生产不一致 | 版本哈希校验 | 阻断发布、回滚 |
| **P3 - 低** | 缓存命中率 < 20% | 缓存指标统计 | 优化 Prompt 复用 |

### 8.2 SLO 定义模板

为 AI 应用定义 SLO 时，应区分不同模型/功能等级：

```typescript
interface SLODefinition {
  service: string
  tier: 'critical' | 'standard' | 'best-effort'
  indicators: SLOIndicator[]
}

interface SLOIndicator {
  name: string
  description: string
  target: number        // 目标值 (0-1)
  window: string        // 统计窗口，如 "30d"
  burnRateAlerts: BurnRateAlert[]
}

interface BurnRateAlert {
  multiplier: number    // 消耗速率倍数，如 1, 2, 14.4
  lookback: string      // 观察窗口，如 "1h", "6h"
  severity: string
}

// 示例：AI 客服系统 SLO
const customerSupportSLOs: SLODefinition = {
  service: 'ai-customer-support',
  tier: 'critical',
  indicators: [
    {
      name: 'availability',
      description: 'LLM API 可用性',
      target: 0.999,
      window: '30d',
      burnRateAlerts: [
        { multiplier: 14.4, lookback: '1h', severity: 'P0' },   // 2% 预算在 1h 内耗尽
        { multiplier: 2, lookback: '6h', severity: 'P1' }       // 慢速消耗预警
      ]
    },
    {
      name: 'p95_latency',
      description: 'P95 端到端延迟 < 5s',
      target: 0.95,
      window: '7d',
      burnRateAlerts: [
        { multiplier: 14.4, lookback: '1h', severity: 'P1' }
      ]
    },
    {
      name: 'cost_per_session',
      description: '单次会话成本 < $0.05',
      target: 0.90,
      window: '7d',
      burnRateAlerts: [
        { multiplier: 2, lookback: '6h', severity: 'P2' }
      ]
    },
    {
      name: 'hallucination_rate',
      description: '幻觉率 < 5%',
      target: 0.95,
      window: '7d',
      burnRateAlerts: [
        { multiplier: 14.4, lookback: '1h', severity: 'P0' },
        { multiplier: 2, lookback: '6h', severity: 'P1' }
      ]
    }
  ]
}
```

### 8.3 告警降噪策略

AI 系统的告警容易产生噪声，建议采用以下策略：

1. **动态基线**：基于历史同期数据（上周同一时间）设定阈值，而非固定值
2. **多信号关联**：成本告警 + 流量告警同时触发才升级，避免单一异常抖动
3. **分层抑制**：底层基础设施告警抑制上层业务告警（如果 GPU 节点故障，不重复触发延迟告警）
4. **预测性告警**：基于 Token 消耗速率预测月度预算是否超支，提前 3 天预警

```typescript
// 动态基线告警示例
class DynamicBaselineAlert {
  private history: Map<string, number[]> = new Map() // metric -> values
  
  async check(metric: string, currentValue: number): Promise<{
    alert: boolean
    severity: string
    deviation: number
    baseline: number
  }> {
    const history = this.history.get(metric) ?? []
    if (history.length < 24) { // 需要至少 24 个历史点
      history.push(currentValue)
      this.history.set(metric, history)
      return { alert: false, severity: 'none', deviation: 0, baseline: 0 }
    }
    
    // 计算滑动平均基线（排除异常值）
    const sorted = [...history].sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const filtered = sorted.filter(v => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr)
    const baseline = filtered.reduce((s, v) => s + v, 0) / filtered.length
    const std = Math.sqrt(filtered.reduce((s, v) => s + Math.pow(v - baseline, 2), 0) / filtered.length)
    
    const deviation = (currentValue - baseline) / std
    
    // 更新历史（滑动窗口）
    history.push(currentValue)
    if (history.length > 168) history.shift() // 保留 7 天（每小时一个点）
    this.history.set(metric, history)
    
    if (deviation > 5) {
      return { alert: true, severity: 'P0', deviation, baseline }
    } else if (deviation > 3) {
      return { alert: true, severity: 'P1', deviation, baseline }
    } else if (deviation > 2) {
      return { alert: true, severity: 'P2', deviation, baseline }
    }
    
    return { alert: false, severity: 'none', deviation, baseline }
  }
}
```

---

## 9. 未来趋势：AI 可观测性与主流 APM 的融合

### 9.1 行业预测

AI 可观测性作为独立品类的窗口期预计将持续到 2027 年。此后，以下融合趋势将加速：

| 趋势 | 描述 | 影响 |
|------|------|------|
| **APM 原生支持** | Datadog、New Relic、Grafana 全面集成 LLM Semantic Conventions | 专用 AI 可观测性工具需差异化 |
| **统一追踪平面** | 传统微服务 Trace 与 LLM Generation 在同一视图中呈现 | 降低全链路排查成本 |
| **成本 FinOps** | 云厂商账单系统直接关联 Token 级成本 | 更精确的部门级成本分摊 |
| **边缘可观测性** | 端侧模型（手机、浏览器）的推理追踪 | 扩展可观测性边界 |
| **自动评估闭环** | 观测数据自动回流至模型微调与 Prompt 优化 | 从"观测"走向"自治" |

### 9.2 架构演进建议

为应对融合趋势，当前构建 AI 可观测性体系时应遵循以下原则：

1. **基于 OpenTelemetry**：确保数据格式与主流 APM 兼容，避免供应商锁定
2. **分离采集层与分析层**：采集端（SDK/Agent）稳定，分析端（Langfuse/Datadog）可替换
3. **保留原始数据**：Prompt、Completion、Token 分布等原始数据长期归档，支持未来审计
4. **统一身份体系**：Trace ID、User ID、Session ID 贯穿传统服务与 LLM 调用

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        未来统一可观测性架构                                   │
│                                                                             │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│   │   Web App    │  │   API GW     │  │  Background  │                     │
│   │  (React)     │  │  (Kong/AWS)  │  │   Worker     │                     │
│   └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                     │
│          │                 │                 │                             │
│          └─────────────────┼─────────────────┘                             │
│                            ▼                                               │
│              ┌─────────────────────────────┐                               │
│              │   OpenTelemetry Collector   │                               │
│              │   (统一采集网关)              │                               │
│              └──────────────┬──────────────┘                               │
│                             │                                              │
│            ┌────────────────┼────────────────┐                            │
│            ▼                ▼                ▼                            │
│      ┌──────────┐   ┌──────────┐   ┌──────────────┐                      │
│      │ Datadog  │   │ Grafana  │   │   Langfuse   │   ◄── 分析层可替换    │
│      │ (APM)    │   │ (LGTM)   │   │  (LLM 专项)  │                      │
│      └──────────┘   └──────────┘   └──────────────┘                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. References

1. **OpenTelemetry LLM Semantic Conventions**
   - [OpenTelemetry Gen AI Semantic Conventions (Latest)](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
   - GitHub: `open-telemetry/semantic-conventions` — gen-ai 相关 PR 与讨论

2. **Langfuse**
   - 官网：https://langfuse.com
   - GitHub：https://github.com/langfuse/langfuse（8K+ stars，MIT 协议）
   - 文档：https://langfuse.com/docs

3. **LangSmith**
   - 官网：https://smith.langchain.com
   - 文档：https://docs.smith.langchain.com

4. **Braintrust**
   - 官网：https://www.braintrust.dev
   - 文档：https://www.braintrust.dev/docs

5. **Vercel AI SDK**
   - 文档：https://sdk.vercel.ai/docs
   - Telemetry 指南：https://sdk.vercel.ai/docs/ai-sdk-core/telemetry

6. **Mastra**
   - 官网：https://mastra.ai
   - GitHub：https://github.com/mastra-ai/mastra

7. **行业报告**
   - Gartner: "Predicts 2026: AI Trust, Risk and Security Management"
   - a16z: "The New Normal in AI Infrastructure"

8. **定价参考（2024-2025）**
   - OpenAI Pricing: https://openai.com/api/pricing
   - Anthropic Pricing: https://www.anthropic.com/pricing
   - 注意：定价频繁变动，生产系统应建立动态定价更新机制

---

> **关联文档**
>
> - [MCP 指南](./mcp-guide.md) — Model Context Protocol 开发与集成
> - [AI SDK 指南](./ai-sdk-guide.md) — Vercel AI SDK 深度使用
> - `jsts-code-lab/94-ai-agent-lab/` — AI Agent 相关代码实验室
> - [AI Agent 基础设施](../categories/23-ai-agent-infrastructure.md)
