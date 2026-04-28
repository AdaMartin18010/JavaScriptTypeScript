import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { trace, context, SpanStatusCode } from "@opentelemetry/api";

export const tracingPlugin = fp(async function (fastify: FastifyInstance, opts: { serviceName: string }) {
  const tracer = trace.getTracer(opts.serviceName, "1.0.0");

  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const parentContext = context.active();
    const span = tracer.startSpan(
      `${request.method} ${request.routerPath || request.url}`,
      {
        attributes: {
          "http.method": request.method,
          "http.url": request.url,
          "http.route": request.routerPath,
          "http.request_id": request.id,
          "net.peer.ip": request.ip,
          "service.name": opts.serviceName,
        },
      },
      parentContext
    );

    // 将 span 存入请求上下文
    (request as unknown as Record<string, unknown>).otelSpan = span;
    (request as unknown as Record<string, unknown>).otelContext = trace.setSpan(parentContext, span);
  });

  fastify.addHook("onSend", async (request: FastifyRequest, reply: FastifyReply) => {
    const span = (request as unknown as Record<string, unknown>).otelSpan as ReturnType<typeof trace.getSpan>;
    if (span) {
      span.setAttribute("http.status_code", reply.statusCode);
      if (reply.statusCode >= 400) {
        span.setStatus({ code: SpanStatusCode.ERROR });
      } else {
        span.setStatus({ code: SpanStatusCode.OK });
      }
    }
  });

  fastify.addHook("onResponse", async (request: FastifyRequest, reply: FastifyReply) => {
    const span = (request as unknown as Record<string, unknown>).otelSpan as ReturnType<typeof trace.getSpan>;
    if (span) {
      span.setAttribute("http.response_time_ms", reply.elapsedTime);
      span.end();
    }
  });

  fastify.addHook("onError", async (request: FastifyRequest, _reply: FastifyReply, error: Error) => {
    const span = (request as unknown as Record<string, unknown>).otelSpan as ReturnType<typeof trace.getSpan>;
    if (span) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
    }
  });
});
