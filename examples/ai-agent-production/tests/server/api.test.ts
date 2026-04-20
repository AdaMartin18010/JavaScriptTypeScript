/**
 * @file API 路由测试
 * @description 验证 Hono 服务器的健康检查、Agent 调用与工作流接口
 */

import { describe, it, expect, beforeAll } from "vitest";
import app from "../../src/server/index.js";

describe("API Server", () => {
  it("GET /health 应返回健康状态", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.version).toBe("1.0.0");
  });

  it("GET /api/agents 应返回 Agent 列表", async () => {
    const res = await app.request("/api/agents");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.agents).toBeInstanceOf(Array);
    expect(body.agents.length).toBeGreaterThanOrEqual(4);

    const names = body.agents.map((a: { name: string }) => a.name);
    expect(names).toContain("researcher");
    expect(names).toContain("writer");
    expect(names).toContain("reviewer");
    expect(names).toContain("orchestrator");
  });

  it("GET /api/workflows 应返回工作流列表", async () => {
    const res = await app.request("/api/workflows");
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.workflows).toBeInstanceOf(Array);
    expect(body.workflows.length).toBeGreaterThanOrEqual(2);

    const names = body.workflows.map((w: { name: string }) => w.name);
    expect(names).toContain("techDoc");
    expect(names).toContain("codeReview");
  });

  it("POST /api/agents/invoke 未登录应返回 401", async () => {
    const res = await app.request("/api/agents/invoke", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agent: "researcher",
        prompt: "测试",
      }),
    });

    expect(res.status).toBe(401);
  });

  it("GET /api/mcp/tools 未登录应返回 401", async () => {
    const res = await app.request("/api/mcp/tools");
    expect(res.status).toBe(401);
  });

  it("访问不存在的路由应返回 404", async () => {
    const res = await app.request("/api/nonexistent");
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.error).toContain("不存在");
  });
});
