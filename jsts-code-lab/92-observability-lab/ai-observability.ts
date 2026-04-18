/**
 * @file ai-observability.ts
 * @description AI 应用可观测性实战示例
 *   - Langfuse / Helicone 集成
 *   - 自定义 AI 调用追踪 wrapper（基于 OpenTelemetry）
 *   - Token usage 和 cost 计算
 *   - 与 pino 日志的协同
 *
 * @reference
 *   - Langfuse JS SDK: https://langfuse.com/docs/sdk/typescript
 *   - Helicone: https://docs.helicone.ai/
 *   - OpenTelemetry gen_ai conventions: https://opentelemetry.io/docs/specs/semconv/gen-ai/
 */

import OpenAI from 'openai'
import { Langfuse, observeOpenAI } from 'langfuse'
import { trace, SpanStatusCode } from '@opentelemetry/api'
import { logger } from './opentelemetry-setup' // 复用 pino + OTel logger

// =============================================================================
// 1. Langfuse 集成：LLM Tracing + Prompt 版本管理 + Cost 追踪
// =============================================================================

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com',
})

/**
 * 使用 Langfuse 包装 OpenAI 调用，自动追踪 generation + token + cost
 */
export async function callOpenAIWithLangfuse(params: {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
  userId?: string
  sessionId?: string
}) {
  const { prompt, model = 'gpt-4o', temperature = 0.7, maxTokens = 500, userId, sessionId } = params

  // 创建 trace（可选：与 OpenTelemetry trace 关联）
  const trace = langfuse.trace({
    name: 'chat-completion',
    userId,
    sessionId,
    metadata: { source: 'ai-observability.ts', model, temperature },
  })

  const generation = trace.generation({
    name: 'llm-response',
    model,
    modelParameters: { temperature, maxTokens },
    input: [{ role: 'user', content: prompt }],
  })

  const client = observeOpenAI(
    new OpenAI({ apiKey: process.env.OPENAI_API_KEY! }),
    { parent: generation } // 将 OpenAI 调用挂接到 generation 下
  )

  try {
    const start = Date.now()
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    })
    const latency = Date.now() - start

    const promptTokens = response.usage?.prompt_tokens ?? 0
    const completionTokens = response.usage?.completion_tokens ?? 0
    const cost = calculateCost(model, promptTokens, completionTokens)

    generation.end({
      output: response.choices[0].message,
      usage: {
        input: promptTokens,
        output: completionTokens,
        total: promptTokens + completionTokens,
        unit: 'TOKENS',
        inputCost: (promptTokens * (PRICING[model]?.input ?? 0)) / 1_000_000,
        outputCost: (completionTokens * (PRICING[model]?.output ?? 0)) / 1_000_000,
        totalCost: cost,
      },
      metadata: { latencyMs: latency },
    })

    trace.update({ metadata: { totalCost: cost, latencyMs: latency } })

    logger.info(
      {
        provider: 'openai',
        model,
        latencyMs: latency,
        costUsd: cost,
        promptTokens,
        completionTokens,
        traceId: trace.id,
      },
      'Langfuse-tracked AI call completed'
    )

    return {
      content: response.choices[0].message.content,
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, costUsd: cost },
      traceId: trace.id,
    }
  } catch (error) {
    generation.end({ output: { error: (error as Error).message } })
    trace.update({ metadata: { error: (error as Error).message } })
    throw error
  } finally {
    await langfuse.flushAsync()
  }
}

// =============================================================================
// 2. Helicone 集成：AI Gateway + Request Caching + Rate Limiting
// =============================================================================

/**
 * 使用 Helicone Proxy 集成，零侵入获得 AI 可观测性
 * 优势：无需 SDK 埋点，改 baseURL + Header 即可
 */
export function createHeliconeClient(options?: { cacheEnabled?: boolean; userId?: string }) {
  const { cacheEnabled = true, userId } = options ?? {}

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    baseURL: 'https://oai.helicone.ai/v1',
    defaultHeaders: {
      'Helicone-Auth': `Bearer ${process.env.HELICONE_API_KEY!}`,
      'Helicone-Cache-Enabled': cacheEnabled ? 'true' : 'false',
      'Helicone-User-Id': userId || 'anonymous',
      // 可选：自定义属性用于 Helicone Dashboard 过滤
      'Helicone-Property-Environment': process.env.NODE_ENV || 'production',
      'Helicone-Property-Service': 'ai-gateway',
      // 可选：限流策略（请求数;时间窗口）
      // 'Helicone-RateLimit-Policy': '1000;w=3600',
    },
  })
}

/**
 * 调用示例：Helicone 自动追踪 request、response、latency、token、cost
 */
export async function callOpenAIWithHelicone(params: {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
  userId?: string
}) {
  const { prompt, model = 'gpt-4o-mini', temperature = 0.7, maxTokens = 300, userId } = params

  const client = createHeliconeClient({ cacheEnabled: true, userId })

  const start = Date.now()
  const response = await client.chat.completions.create({
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
  })
  const latency = Date.now() - start

  const promptTokens = response.usage?.prompt_tokens ?? 0
  const completionTokens = response.usage?.completion_tokens ?? 0
  const cost = calculateCost(model, promptTokens, completionTokens)

  logger.info(
    {
      provider: 'openai-via-helicone',
      model: response.model,
      latencyMs: latency,
      costUsd: cost,
      promptTokens,
      completionTokens,
      cached: false, // Helicone 会在 response headers 中返回缓存状态
      userId,
    },
    'Helicone-tracked AI call completed'
  )

  return {
    content: response.choices[0].message.content,
    usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, costUsd: cost },
  }
}

// =============================================================================
// 3. 自定义 AI 调用追踪 wrapper（纯 OpenTelemetry，vendor-neutral）
// =============================================================================

const tracer = trace.getTracer('ai-observability', '1.0.0')

interface LLMUsage {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
}

interface TrackLLMOptions {
  operation: string
  model: string
  provider: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  userId?: string
  sessionId?: string
  promptVersion?: string
  metadata?: Record<string, unknown>
}

/**
 * 通用 AI 调用追踪 wrapper
 * - 创建 span 并附加 gen_ai 语义属性
 * - 自动计算 token 消耗、cost、latency
 * - 记录结构化日志（含 traceId）
 * - 支持错误追踪和重试标记
 */
export async function trackLLMCall<T extends { usage?: LLMUsage; model?: string }>(
  options: TrackLLMOptions,
  execute: () => Promise<T>
): Promise<T> {
  const {
    operation,
    model,
    provider,
    temperature,
    maxTokens,
    systemPrompt,
    userId,
    sessionId,
    promptVersion,
    metadata,
  } = options

  const start = Date.now()

  return tracer.startActiveSpan(operation, async (span) => {
    // 设置核心属性
    span.setAttribute('gen_ai.system', provider)
    span.setAttribute('gen_ai.request.model', model)
    span.setAttribute('gen_ai.request.temperature', temperature ?? 0.7)
    span.setAttribute('gen_ai.request.max_tokens', maxTokens ?? 1024)
    span.setAttribute('gen_ai.system_prompt.length', systemPrompt?.length ?? 0)
    span.setAttribute('ai.prompt.version', promptVersion ?? 'unknown')
    span.setAttribute('enduser.id', userId ?? 'anonymous')
    span.setAttribute('session.id', sessionId ?? 'unknown')

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          span.setAttribute(`ai.metadata.${key}`, value)
        }
      })
    }

    try {
      const result = await execute()
      const latency = Date.now() - start

      const usage = result.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
      const cost = calculateCost(result.model || model, usage.prompt_tokens, usage.completion_tokens)

      // 响应属性
      span.setAttribute('gen_ai.response.model', result.model || model)
      span.setAttribute('gen_ai.usage.input_tokens', usage.prompt_tokens)
      span.setAttribute('gen_ai.usage.output_tokens', usage.completion_tokens)
      span.setAttribute('gen_ai.usage.total_tokens', usage.total_tokens)
      span.setAttribute('gen_ai.latency_ms', latency)
      span.setAttribute('gen_ai.cost.usd', cost)
      span.setAttribute('gen_ai.success', true)

      span.setStatus({ code: SpanStatusCode.OK })

      logger.info(
        {
          operation,
          provider,
          model: result.model || model,
          latencyMs: latency,
          costUsd: cost,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          promptVersion,
          userId,
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
        },
        'LLM call succeeded'
      )

      return result
    } catch (error) {
      const err = error as Error
      span.recordException(err)
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message })
      span.setAttribute('gen_ai.success', false)
      span.setAttribute('error.type', err.name)
      span.setAttribute('error.message', err.message)

      logger.error(
        {
          operation,
          provider,
          model,
          err,
          promptVersion,
          userId,
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
        },
        'LLM call failed'
      )

      throw error
    } finally {
      span.end()
    }
  })
}

// =============================================================================
// 4. Token Usage 和 Cost 计算
// =============================================================================

const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 5.0, output: 15.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10.0, output: 30.0 },
  'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'claude-3-opus': { input: 15.0, output: 75.0 },
  'text-embedding-3-small': { input: 0.02, output: 0 },
  'text-embedding-3-large': { input: 0.13, output: 0 },
}

export function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rate = PRICING[model] || { input: 0, output: 0 }
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000
}

/**
 * 批量计算并汇总 cost（用于 batch 调用或月度报表）
 */
export function aggregateCost(
  records: Array<{ model: string; inputTokens: number; outputTokens: number }>
): { totalCost: number; byModel: Record<string, { inputCost: number; outputCost: number; total: number }> } {
  const byModel: Record<string, { inputCost: number; outputCost: number; total: number }> = {}

  let totalCost = 0
  for (const r of records) {
    const rate = PRICING[r.model] || { input: 0, output: 0 }
    const inputCost = (r.inputTokens * rate.input) / 1_000_000
    const outputCost = (r.outputTokens * rate.output) / 1_000_000
    const recordTotal = inputCost + outputCost

    if (!byModel[r.model]) {
      byModel[r.model] = { inputCost: 0, outputCost: 0, total: 0 }
    }
    byModel[r.model].inputCost += inputCost
    byModel[r.model].outputCost += outputCost
    byModel[r.model].total += recordTotal
    totalCost += recordTotal
  }

  return { totalCost, byModel }
}

// =============================================================================
// 5. 使用示例：组合 Langfuse + OpenTelemetry + Pino
// =============================================================================

async function combinedExample() {
  // 场景：需要同时获得 Langfuse 的 LLM 语义追踪 和 OTel 的系统级追踪

  const prompt = 'Explain the benefits of structured logging in AI applications.'

  // 方法 A：Langfuse 主导（prompt 版本、cost、evaluation 数据集）
  const resultA = await callOpenAIWithLangfuse({
    prompt,
    model: 'gpt-4o-mini',
    temperature: 0.5,
    userId: 'user-demo-001',
    sessionId: 'session-abc',
  })

  // 方法 B：Helicone 主导（零侵入、request caching、rate limiting）
  const resultB = await callOpenAIWithHelicone({
    prompt,
    model: 'gpt-4o-mini',
    userId: 'user-demo-001',
  })

  // 方法 C：纯 OpenTelemetry（vendor-neutral，直接进入 Jaeger/Grafana）
  const resultC = await trackLLMCall(
    {
      operation: 'openai.chat-completions',
      model: 'gpt-4o-mini',
      provider: 'openai',
      temperature: 0.5,
      promptVersion: 'v2.1.0',
      userId: 'user-demo-001',
      metadata: { feature: 'demo', experimentId: 'exp-42' },
    },
    async () => {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })
      return client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      })
    }
  )

  logger.info(
    {
      langfuseTraceId: resultA.traceId,
      heliconeCached: false, // 实际应从 response headers 读取
      otelTraceId: resultC.id, // 实际为 span context
    },
    'Combined observability example completed'
  )
}

// combinedExample().catch(console.error)
