import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../index";

function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const traceMiddleware: MiddlewareHandler<AppEnv> = async (c, next) => {
  // 优先从传入请求头获取 trace ID，否则生成新的
  const traceId =
    c.req.header("x-trace-id") ??
    c.req.header("traceparent")?.split("-")[1] ??
    generateTraceId();

  const requestId = crypto.randomUUID();

  c.set("traceId", traceId);
  c.set("requestId", requestId);

  // 将 trace ID 注入响应头，便于客户端追踪
  c.header("x-trace-id", traceId);
  c.header("x-request-id", requestId);

  await next();
};
