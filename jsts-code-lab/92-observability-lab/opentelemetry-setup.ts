/**
 * @file opentelemetry-setup.ts
 * @description OpenTelemetry Node.js SDK 完整初始化示例
 *   - TracerProvider / MeterProvider / LoggerProvider 配置
 *   - AI Span 自定义属性（model、tokens、temperature、cost）
 *   - Pino 日志桥接（自动注入 traceId / spanId）
 *   - Sentry v8+ OpenTelemetry 集成
 *
 * @reference
 *   - OpenTelemetry JS: https://opentelemetry.io/docs/languages/js/
 *   - Sentry v8 OTel: https://docs.sentry.io/platforms/javascript/guides/node/opentelemetry/
 *   - Pino OTel: https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/plugins/node/opentelemetry-instrumentation-pino
 */

import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import {
  LoggerProvider,
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
} from '@opentelemetry/sdk-logs'
import {
  PeriodicExportingMetricReader,
  ConsoleMetricExporter,
} from '@opentelemetry/sdk-metrics'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { trace, metrics, logs, context, SpanStatusCode, ValueType } from '@opentelemetry/api'
import * as Sentry from '@sentry/node'
import { openTelemetryIntegration } from '@sentry/opentelemetry'
import pino from 'pino'

// =============================================================================
// 1. Sentry v8+ 初始化（必须先于 OTel SDK，以便复用 Sentry 的 span processor）
// =============================================================================

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'production',
  release: process.env.APP_VERSION,
  integrations: [
    openTelemetryIntegration(), // v8+: 原生 OTel 集成
    Sentry.httpIntegration(),
    Sentry.expressIntegration(),
  ],
  tracesSampleRate: 0.2,
  profilesSampleRate: 0.1,
})

// =============================================================================
// 2. OpenTelemetry SDK 初始化（TracerProvider / MeterProvider / LoggerProvider）
// =============================================================================

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
  headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
    ? Object.fromEntries(
        process.env.OTEL_EXPORTER_OTLP_HEADERS.split(',').map((h) => h.split('=') as [string, string])
      )
    : undefined,
})

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics',
  }),
  exportIntervalMillis: 60000,
})

const logExporter = new OTLPLogExporter({
  url: process.env.OTEL_EXPORTER_OTLP_LOGS_ENDPOINT || 'http://localhost:4318/v1/logs',
})

const loggerProvider = new LoggerProvider()
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter))
if (process.env.NODE_ENV === 'development') {
  loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(new ConsoleLogRecordExporter()))
}

logs.setGlobalLoggerProvider(loggerProvider)

const sdk = new NodeSDK({
  resource: resourceFromAttributes({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'ai-gateway',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'production',
    [SemanticResourceAttributes.HOST_NAME]: require('os').hostname(),
  }),
  traceExporter,
  metricReader,
  logRecordProcessors: [new BatchLogRecordProcessor(logExporter)],
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false }, // 减少文件系统 noise
      '@opentelemetry/instrumentation-net': { enabled: true },
      '@opentelemetry/instrumentation-http': { enabled: true },
    }),
  ],
})

sdk.start()

process.on('SIGTERM', async () => {
  await sdk.shutdown()
  process.exit(0)
})

// =============================================================================
// 3. Pino 日志配置：自动桥接 OpenTelemetry Trace Context
// =============================================================================

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport:
    process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
      : undefined,
  redact: {
    paths: ['password', 'authorization', '*.token', 'apiKey', 'openAiApiKey', 'heliconeApiKey'],
    remove: true,
  },
  base: { service: process.env.OTEL_SERVICE_NAME || 'ai-gateway', pid: process.pid },
  mixin() {
    // 将当前激活的 span context 注入每条日志，实现 logs <> traces 关联
    const span = trace.getSpan(context.active())
    if (!span) return {}
    const { traceId, spanId, traceFlags } = span.spanContext()
    return { traceId, spanId, traceFlags: traceFlags.toString(16) }
  },
  formatters: {
    level(label) {
      return { severity: label.toUpperCase(), levelLabel: label }
    },
  },
})

// =============================================================================
// 4. AI Span 自定义属性工具函数
// =============================================================================

const tracer = trace.getTracer('ai-gateway', '1.0.0')
const meter = metrics.getMeter('ai-gateway', '1.0.0')

// AI 专用指标
const tokenCounter = meter.createCounter('gen_ai.tokens.used', {
  description: 'Total tokens used across LLM calls',
  valueType: ValueType.INT,
})

const costHistogram = meter.createHistogram('gen_ai.cost.usd', {
  description: 'Cost per LLM call in USD',
  valueType: ValueType.DOUBLE,
})

const latencyHistogram = meter.createHistogram('gen_ai.latency_ms', {
  description: 'LLM call latency in milliseconds',
  valueType: ValueType.INT,
  unit: 'ms',
})

interface AISpanAttributes {
  model: string
  provider: 'openai' | 'anthropic' | 'azure' | 'google' | string
  temperature?: number
  maxTokens?: number
  promptTokens?: number
  completionTokens?: number
  totalTokens?: number
  costUsd?: number
  latencyMs?: number
  promptVersion?: string
  promptId?: string
  userId?: string
  [key: string]: unknown
}

/**
 * 创建 AI 调用 span，并自动附加 LLM 语义化属性
 * 遵循 OpenTelemetry gen_ai semantic conventions（草案）
 */
export function createAISpan(name: string, attributes: AISpanAttributes) {
  const span = tracer.startSpan(name, {
    attributes: {
      'gen_ai.system': attributes.provider,
      'gen_ai.request.model': attributes.model,
      'gen_ai.request.temperature': attributes.temperature,
      'gen_ai.request.max_tokens': attributes.maxTokens,
      'gen_ai.usage.input_tokens': attributes.promptTokens,
      'gen_ai.usage.output_tokens': attributes.completionTokens,
      'gen_ai.usage.total_tokens': attributes.totalTokens,
      'gen_ai.cost.usd': attributes.costUsd,
      'gen_ai.latency_ms': attributes.latencyMs,
      'ai.prompt.version': attributes.promptVersion,
      'ai.prompt.id': attributes.promptId,
      'enduser.id': attributes.userId,
    },
  })

  // 同步记录 metrics
  if (attributes.promptTokens) {
    tokenCounter.add(attributes.promptTokens, {
      'gen_ai.system': attributes.provider,
      'gen_ai.request.model': attributes.model,
      'token.type': 'input',
    })
  }
  if (attributes.completionTokens) {
    tokenCounter.add(attributes.completionTokens, {
      'gen_ai.system': attributes.provider,
      'gen_ai.request.model': attributes.model,
      'token.type': 'output',
    })
  }
  if (typeof attributes.costUsd === 'number') {
    costHistogram.record(attributes.costUsd, {
      'gen_ai.system': attributes.provider,
      'gen_ai.request.model': attributes.model,
    })
  }
  if (typeof attributes.latencyMs === 'number') {
    latencyHistogram.record(attributes.latencyMs, {
      'gen_ai.system': attributes.provider,
      'gen_ai.request.model': attributes.model,
    })
  }

  return span
}

/**
 * 包装异步 AI 调用，自动处理 span 生命周期和错误记录
 */
export async function wrapAI<T>(
  operationName: string,
  attributes: Omit<AISpanAttributes, 'latencyMs' | 'costUsd'>,
  fn: () => Promise<T & { usage?: { prompt_tokens?: number; completion_tokens?: number }; model?: string }>
): Promise<T> {
  const start = Date.now()

  return tracer.startActiveSpan(operationName, async (span) => {
    try {
      span.setAttribute('gen_ai.system', attributes.provider)
      span.setAttribute('gen_ai.request.model', attributes.model)
      span.setAttribute('gen_ai.request.temperature', attributes.temperature)
      span.setAttribute('gen_ai.request.max_tokens', attributes.maxTokens)
      span.setAttribute('ai.prompt.version', attributes.promptVersion ?? 'unknown')
      span.setAttribute('ai.prompt.id', attributes.promptId ?? 'unknown')
      span.setAttribute('enduser.id', attributes.userId ?? 'anonymous')

      const result = await fn()
      const latency = Date.now() - start

      const promptTokens = result.usage?.prompt_tokens ?? attributes.promptTokens ?? 0
      const completionTokens = result.usage?.completion_tokens ?? attributes.completionTokens ?? 0
      const totalTokens = promptTokens + completionTokens
      const cost = calculateCost(result.model || attributes.model, promptTokens, completionTokens)

      span.setAttribute('gen_ai.response.model', result.model || attributes.model)
      span.setAttribute('gen_ai.usage.input_tokens', promptTokens)
      span.setAttribute('gen_ai.usage.output_tokens', completionTokens)
      span.setAttribute('gen_ai.usage.total_tokens', totalTokens)
      span.setAttribute('gen_ai.latency_ms', latency)
      span.setAttribute('gen_ai.cost.usd', cost)
      span.setStatus({ code: SpanStatusCode.OK })

      // 记录结构化日志
      logger.info(
        {
          model: result.model || attributes.model,
          provider: attributes.provider,
          latencyMs: latency,
          costUsd: cost,
          promptTokens,
          completionTokens,
          totalTokens,
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
        },
        'AI call completed'
      )

      // 同步指标
      tokenCounter.add(promptTokens, { 'gen_ai.system': attributes.provider, 'gen_ai.request.model': attributes.model, 'token.type': 'input' })
      tokenCounter.add(completionTokens, { 'gen_ai.system': attributes.provider, 'gen_ai.request.model': attributes.model, 'token.type': 'output' })
      costHistogram.record(cost, { 'gen_ai.system': attributes.provider, 'gen_ai.request.model': attributes.model })
      latencyHistogram.record(latency, { 'gen_ai.system': attributes.provider, 'gen_ai.request.model': attributes.model })

      return result
    } catch (error) {
      span.recordException(error as Error)
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message })

      logger.error(
        {
          err: error,
          model: attributes.model,
          provider: attributes.provider,
          traceId: span.spanContext().traceId,
          spanId: span.spanContext().spanId,
        },
        'AI call failed'
      )

      throw error
    } finally {
      span.end()
    }
  })
}

// 定价参考：OpenAI GPT-4o / Claude 3.5 等（2026-04，单位：USD / 1M tokens）
const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 5.0, output: 15.0 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'claude-3-5-sonnet': { input: 3.0, output: 15.0 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
  'text-embedding-3-small': { input: 0.02, output: 0 },
  'text-embedding-3-large': { input: 0.13, output: 0 },
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rate = PRICING[model] || { input: 0, output: 0 }
  return (inputTokens * rate.input + outputTokens * rate.output) / 1_000_000
}

// =============================================================================
// 5. 使用示例
// =============================================================================

async function example() {
  const openaiResponse = await wrapAI(
    'openai.chat-completion',
    {
      model: 'gpt-4o',
      provider: 'openai',
      temperature: 0.7,
      maxTokens: 500,
      promptVersion: 'v1.2.0',
      promptId: 'summarize-prompt',
      userId: 'user-123',
    },
    async () => {
      // 模拟 OpenAI 调用
      return {
        choices: [{ message: { role: 'assistant', content: '...' } }],
        model: 'gpt-4o',
        usage: { prompt_tokens: 120, completion_tokens: 45 },
      } as any
    }
  )

  logger.info({ response: openaiResponse }, 'Example completed')
}

// example().catch(console.error)
