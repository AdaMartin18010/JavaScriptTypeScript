import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../index";

interface LogEntry {
  level: "info" | "error" | "warn";
  timestamp: string;
  request_id: string;
  trace_id: string;
  method: string;
  path: string;
  status: number;
  duration_ms: number;
  user_agent?: string;
  cf_ray?: string;
  user_id?: string;
}

function serializeLog(entry: LogEntry): string {
  return JSON.stringify(entry);
}

export const loggerMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next
) => {
  const start = performance.now();

  await next();

  const duration = Math.round(performance.now() - start);
  const requestId = c.get("requestId");
  const traceId = c.get("traceId");

  const entry: LogEntry = {
    level: c.res.status >= 500 ? "error" : c.res.status >= 400 ? "warn" : "info",
    timestamp: new Date().toISOString(),
    request_id: requestId,
    trace_id: traceId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration_ms: duration,
    user_agent: c.req.header("user-agent") ?? undefined,
    cf_ray: c.req.header("cf-ray") ?? undefined,
    user_id: c.get("userId"),
  };

  console.log(serializeLog(entry));
};
