/**
 * @file Mastra 框架配置
 * @description 配置 Mastra 运行时、模型提供商、Agent 注册与工作流引擎
 */

import { Mastra } from "@mastra/core";
import { createLogger } from "@mastra/core/logger";

// 导入 Agent 定义
import { researchAgent } from "./src/mastra/agents/researcher.js";
import { writerAgent } from "./src/mastra/agents/writer.js";
import { reviewerAgent } from "./src/mastra/agents/reviewer.js";
import { orchestratorAgent } from "./src/mastra/agents/orchestrator.js";

// 导入工作流定义
import { techDocWorkflow } from "./src/mastra/workflows/tech-doc-workflow.js";
import { codeReviewWorkflow } from "./src/mastra/workflows/code-review-workflow.js";

/**
 * Mastra 全局配置
 * - 注册所有 Agent 与工作流
 * - 配置日志级别与观测性
 * - 设置内存存储（开发环境使用内存，生产环境建议 PostgreSQL）
 */
export const mastra = new Mastra({
  agents: {
    researcher: researchAgent,
    writer: writerAgent,
    reviewer: reviewerAgent,
    orchestrator: orchestratorAgent,
  },
  workflows: {
    techDoc: techDocWorkflow,
    codeReview: codeReviewWorkflow,
  },
  logger: createLogger({
    name: "ai-agent-production",
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  }),
});

/**
 * 类型导出：用于在其他模块中获得类型推导
 */
export type MastraInstance = typeof mastra;
