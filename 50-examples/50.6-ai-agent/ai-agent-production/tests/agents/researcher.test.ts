/**
 * @file Research Agent 测试
 * @description 验证研究员 Agent 的配置、工具绑定与生成能力
 */

import { describe, it, expect, beforeAll } from "vitest";
import { mastra } from "../../mastra.config.js";

describe("ResearchAgent", () => {
  let agent: ReturnType<typeof mastra.getAgent>;

  beforeAll(() => {
    agent = mastra.getAgent("researcher");
  });

  it("应正确注册并获取 Agent 实例", () => {
    expect(agent).toBeDefined();
    expect(agent.name).toBe("ResearchAgent");
  });

  it("应包含 webSearch 与 fetchPage 工具", () => {
    const tools = agent.tools;
    expect(tools).toBeDefined();
    expect(Object.keys(tools ?? {})).toContain("webSearch");
    expect(Object.keys(tools ?? {})).toContain("fetchPage");
  });

  it("应对技术主题生成结构化调研结果", async () => {
    const result = await agent.generate(
      '请简要调研 "MCP 协议" 的核心概念与生态现状，限制在 3 句话以内。'
    );

    expect(result.text).toBeTruthy();
    expect(result.text.length).toBeGreaterThan(10);
    expect(result.usage).toBeDefined();
  }, 30000);
});
