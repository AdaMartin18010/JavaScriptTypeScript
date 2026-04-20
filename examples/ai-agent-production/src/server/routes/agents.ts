/**
 * @file Agent 调用路由
 * @description 提供 Agent 直接调用、流式输出与历史记录查询接口
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { mastra } from "../../../mastra.config.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";

const app = new Hono();

/**
 * 请求体校验 Schema
 */
const invokeSchema = z.object({
  agent: z.enum(["researcher", "writer", "reviewer", "orchestrator"]),
  prompt: z.string().min(1).max(10000),
  stream: z.boolean().default(false),
  options: z
    .object({
      maxTokens: z.number().int().min(1).max(8192).optional(),
      temperature: z.number().min(0).max(2).optional(),
    })
    .optional(),
});

/**
 * GET /agents
 * 列出所有已注册的 Agent
 */
app.get("/", (c) => {
  const agents = [
    { name: "researcher", description: "技术研究员：收集信息、检索数据、分析背景" },
    { name: "writer", description: "技术写手：基于研究资料撰写文档" },
    { name: "reviewer", description: "审校专家：审查文档与代码质量" },
    { name: "orchestrator", description: "编排器：协调多 Agent 协作" },
  ];
  return c.json({ agents });
});

/**
 * POST /agents/invoke
 * 调用指定 Agent（非流式）
 */
app.post(
  "/invoke",
  requireAuth,
  requireRole("admin", "developer"),
  rateLimit({ windowMs: 60_000, maxRequests: 30 }),
  zValidator("json", invokeSchema),
  async (c) => {
    const body = c.req.valid("json");
    const agent = mastra.getAgent(body.agent);

    const start = performance.now();
    const result = await agent.generate(body.prompt, {
      maxTokens: body.options?.maxTokens,
      temperature: body.options?.temperature,
    });
    const latency = Math.round(performance.now() - start);

    return c.json({
      success: true,
      agent: body.agent,
      output: result.text,
      usage: result.usage,
      latencyMs: latency,
    });
  }
);

/**
 * POST /agents/invoke/stream
 * 调用指定 Agent（流式 SSE 输出）
 */
app.post(
  "/invoke/stream",
  requireAuth,
  requireRole("admin", "developer"),
  rateLimit({ windowMs: 60_000, maxRequests: 20 }),
  zValidator("json", invokeSchema.omit({ stream: true })),
  async (c) => {
    const body = c.req.valid("json");
    const agent = mastra.getAgent(body.agent);

    const stream = await agent.stream(body.prompt, {
      maxTokens: body.options?.maxTokens,
      temperature: body.options?.temperature,
    });

    c.header("Content-Type", "text/event-stream");
    c.header("Cache-Control", "no-cache");
    c.header("Connection", "keep-alive");

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream.textStream) {
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ chunk }) }\n\n`));
            }
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            controller.close();
          } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({ error: message })}\n\n`)
            );
            controller.close();
          }
        },
      })
    );
  }
);

export default app;
