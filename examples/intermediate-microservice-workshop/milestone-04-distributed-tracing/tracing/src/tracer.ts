import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { trace, context, type Span, SpanStatusCode, propagation } from "@opentelemetry/api";

export interface TracerConfig {
  serviceName: string;
  serviceVersion?: string;
  otlpEndpoint?: string;
}

export function initTracing(config: TracerConfig): NodeSDK {
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: config.otlpEndpoint || process.env.OTLP_ENDPOINT || "http://localhost:4318/v1/traces",
    }),
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion || "1.0.0",
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });

  sdk.start();
  return sdk;
}

export const tracer = trace.getTracer("microservice-workshop", "1.0.0");

/** 创建并激活 Span */
export function withSpan<T>(
  name: string,
  operation: (span: Span) => T,
  options?: { parentContext?: typeof context; attributes?: Record<string, string | number | boolean> }
): T {
  const ctx = options?.parentContext || context.active();
  return tracer.startActiveSpan(name, { attributes: options?.attributes }, ctx, (span) => {
    try {
      const result = operation(span);
      if (result instanceof Promise) {
        return result
          .then((value) => {
            span.setStatus({ code: SpanStatusCode.OK });
            return value;
          })
          .catch((err) => {
            span.recordException(err instanceof Error ? err : new Error(String(err)));
            span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : String(err) });
            throw err;
          })
          .finally(() => span.end()) as T;
      }
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (err) {
      span.recordException(err instanceof Error ? err : new Error(String(err)));
      span.setStatus({ code: SpanStatusCode.ERROR, message: err instanceof Error ? err.message : String(err) });
      span.end();
      throw err;
    }
  });
}

/** 从 carrier 中提取 trace context */
export function extractContext(carrier: Record<string, string>): typeof context {
  return propagation.extract(context.active(), carrier);
}

/** 向 carrier 中注入 trace context */
export function injectContext(carrier: Record<string, string>): void {
  propagation.inject(context.active(), carrier);
}
