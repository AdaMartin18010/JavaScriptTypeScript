/**
 * @file 工作流触发路由
 * @description 提供工作流启动、状态查询与历史记录接口
 */

import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { mastra } from "../../../mastra.config.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rate-limit.js";

const app = new Hono();

/**
 * GET /workflows
 * 列出所有已注册的工作流
 */
app.get("/", (c) => {
  const workflows = [
    {
      name: "techDoc",
      description: "技术文档编写工作流（Research → Write → Review）",
      steps: ["research", "write", "review", "finalize"],
    },
    {
      name: "codeReview",
      description: "代码审查工作流（Read → Analyze + Review → Report）",
      steps: ["read-code", "analyze-complexity", "review-style", "generate-report"],
    },
  ];
  return c.json({ workflows });
});

/**
 * POST /workflows/:name/start
 * 启动指定工作流
 */
app.post(
  "/:name/start",
  requireAuth,
  requireRole("admin", "developer"),
  rateLimit({ windowMs: 60_000, maxRequests: 10 }),
  zValidator(
    "json",
    z.object({
      data: z.record(z.unknown()),
    })
  ),
  async (c) => {
    const name = c.req.param("name");
    const { data } = c.req.valid("json");

    const workflow = mastra.getWorkflow(name as "techDoc" | "codeReview");
    if (!workflow) {
      return c.json({ success: false, error: `工作流未找到: ${name}` }, 404);
    }

    const runId = `run_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const start = performance.now();

    try {
      // 异步启动工作流（不阻塞响应）
      workflow.execute({ triggerData: data }).then((result) => {
        console.log(`[Workflow] ${name} (${runId}) 完成`, result);
      });

      return c.json({
        success: true,
        runId,
        workflow: name,
        status: "started",
        latencyMs: Math.round(performance.now() - start),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return c.json({ success: false, error: message }, 500);
    }
  }
);

/**
 * GET /workflows/:name/status/:runId
 * 查询工作流执行状态（模拟）
 */
app.get("/:name/status/:runId", requireAuth, async (c) => {
  const name = c.req.param("name");
  const runId = c.req.param("runId");

  // 实际生产环境应从数据库或状态存储查询
  return c.json({
    runId,
    workflow: name,
    status: "running", // pending / running / completed / failed
    progress: 0.5,
    startedAt: new Date().toISOString(),
  });
});

export default app;
