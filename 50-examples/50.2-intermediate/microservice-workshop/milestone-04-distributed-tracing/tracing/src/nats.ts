import { propagation, context, trace } from "@opentelemetry/api";
import type { Msg } from "nats";

/**
 * 从当前 context 中提取 trace context，转换为 NATS headers
 */
export function injectTraceContext(headers: Record<string, string> = {}): Record<string, string> {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  return { ...headers, ...carrier };
}

/**
 * 从 NATS Msg headers 中提取 trace context，返回新的 context
 */
export function extractTraceContextFromNats(msg: Msg): typeof context {
  const carrier: Record<string, string> = {};
  if (msg.headers) {
    for (const [key, values] of msg.headers) {
      if (values.length > 0) {
        carrier[key] = values[0];
      }
    }
  }
  return propagation.extract(context.active(), carrier);
}

/**
 * 获取当前 traceId（用于日志关联）
 */
export function getCurrentTraceId(): string | undefined {
  const span = trace.getSpan(context.active());
  return span?.spanContext().traceId;
}
