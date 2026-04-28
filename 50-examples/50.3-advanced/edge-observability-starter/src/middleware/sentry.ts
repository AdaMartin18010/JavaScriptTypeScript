import type { MiddlewareHandler } from "hono";
import type { AppEnv } from "../index";

interface SentryEvent {
  event_id: string;
  timestamp: string;
  platform: "javascript";
  level: "error" | "warning" | "info";
  exception?: {
    values: Array<{
      type: string;
      value: string;
      stacktrace?: {
        frames: Array<{
          filename?: string;
          function?: string;
          lineno?: number;
          colno?: number;
        }>;
      };
    }>;
  };
  request?: {
    url: string;
    method: string;
    headers: Record<string, string>;
  };
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

async function sendToSentry(dsn: string, event: SentryEvent): Promise<void> {
  const url = new URL(dsn);
  const projectId = url.pathname.replace("/", "");
  const sentryUrl = `https://${url.host}/api/${projectId}/envelope/`;
  const authHeader = `Sentry sentry_version=7, sentry_key=${url.username}`;

  const envelope = `${JSON.stringify({ event_id: event.event_id, sent_at: new Date().toISOString() })}
${JSON.stringify({ type: "event" })}
${JSON.stringify(event)}`;

  try {
    await fetch(sentryUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": authHeader,
      },
      body: envelope,
    });
  } catch {
    // Sentry 上报失败不应影响主请求
  }
}

export const sentryMiddleware: MiddlewareHandler<AppEnv> = async (
  c,
  next
) => {
  const dsn = c.env.SENTRY_DSN;

  try {
    await next();
  } catch (err) {
    if (dsn) {
      const error = err instanceof Error ? err : new Error(String(err));
      const event: SentryEvent = {
        event_id: crypto.randomUUID().replace(/-/g, ""),
        timestamp: new Date().toISOString(),
        platform: "javascript",
        level: "error",
        exception: {
          values: [
            {
              type: error.name,
              value: error.message,
              stacktrace: {
                frames: error.stack
                  ? error.stack.split("\n").map((line) => ({
                      function: line.trim(),
                    }))
                  : [],
              },
            },
          ],
        },
        request: {
          url: c.req.url,
          method: c.req.method,
          headers: Object.fromEntries(c.req.raw.headers.entries()),
        },
        tags: {
          request_id: c.get("requestId"),
          trace_id: c.get("traceId"),
        },
        extra: {
          environment: c.env.ENVIRONMENT ?? "unknown",
        },
      };

      c.executionCtx.waitUntil(sendToSentry(dsn, event));
    }

    throw err; // 继续向上抛出，让全局错误处理接管
  }
};
