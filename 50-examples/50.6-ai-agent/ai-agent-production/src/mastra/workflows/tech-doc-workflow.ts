/**
 * @file 技术文档编写工作流
 * @description Research → Write → Review 的 DAG 工作流
 */

import { Workflow } from "@mastra/core/workflows";
import { z } from "zod";

/**
 * 技术文档编写工作流
 * 
 * 阶段 1: Research — 收集技术资料
 * 阶段 2: Write — 基于研究资料撰写文档
 * 阶段 3: Review — 审查文档质量
 * 
 * 条件分支：若审查不通过，则循环回 Write 阶段重试（最多 2 次）
 */
export const techDocWorkflow = new Workflow({
  name: "tech-doc-workflow",
  triggerSchema: z.object({
    topic: z.string().describe("技术主题"),
    outputPath: z.string().describe("文档输出路径（相对于安全根目录）"),
    maxRetries: z.number().int().min(0).max(3).default(2).describe("审查不通过时的最大重试次数"),
  }),
})
  // 步骤 1: 研究阶段
  .step("research", {
    execute: async ({ context, mastra }) => {
      const agent = mastra.getAgent("researcher");
      const topic = context.triggerData.topic;

      const result = await agent.generate(
        `请对 "${topic}" 进行全面技术调研，输出结构化的调研报告。`
      );

      return {
        researchNotes: result.text,
        topic,
      };
    },
  })

  // 步骤 2: 写作阶段（依赖研究阶段输出）
  .step("write", {
    execute: async ({ context, mastra }) => {
      const agent = mastra.getAgent("writer");
      const researchNotes = context.getStepResult<{ researchNotes: string }>("research")?.researchNotes ?? "";
      const topic = context.triggerData.topic;
      const outputPath = context.triggerData.outputPath;

      const result = await agent.generate(
        `基于以下调研资料，撰写一份关于 "${topic}" 的技术文档。\n\n调研资料:\n${researchNotes}\n\n要求:\n1. 将最终文档写入文件路径: ${outputPath}\n2. 使用 write-file 工具写入\n3. 文档需包含标题、概述、详细内容、示例代码、参考资料`
      );

      return {
        draftContent: result.text,
        outputPath,
      };
    },
  })

  // 步骤 3: 审查阶段（依赖写作阶段输出）
  .step("review", {
    execute: async ({ context, mastra }) => {
      const agent = mastra.getAgent("reviewer");
      const outputPath = context.getStepResult<{ outputPath: string }>("write")?.outputPath ?? "";

      const result = await agent.generate(
        `请审查文件 "${outputPath}" 中的技术文档质量。使用 read-file 读取内容，然后对其中代码示例使用 analyze-code 和 review-code 工具。输出结构化审查报告。`
      );

      // 简单判断：若审查报告包含 "阻塞项" 或 "❌"，则认为不通过
      const passed = !result.text.includes("❌") && !result.text.includes("阻塞项");

      return {
        reviewReport: result.text,
        passed,
      };
    },
  })

  // 条件分支：审查不通过则重试写作
  .if(
    ({ context }) => {
      const review = context.getStepResult<{ passed: boolean }>("review");
      return review?.passed === false;
    },
    (workflow) =>
      workflow.step("rewrite", {
        execute: async ({ context, mastra }) => {
          const agent = mastra.getAgent("writer");
          const reviewReport = context.getStepResult<{ reviewReport: string }>("review")?.reviewReport ?? "";
          const outputPath = context.getStepResult<{ outputPath: string }>("write")?.outputPath ?? "";

          const result = await agent.generate(
            `根据以下审查意见，修改并重新写入文档 "${outputPath}"。\n\n审查意见:\n${reviewReport}`
          );

          return {
            rewritten: true,
            draftContent: result.text,
          };
        },
      })
  )

  // 最终聚合步骤
  .step("finalize", {
    execute: async ({ context }) => {
      const research = context.getStepResult<{ researchNotes: string }>("research");
      const write = context.getStepResult<{ outputPath: string }>("write");
      const review = context.getStepResult<{ reviewReport: string; passed: boolean }>("review");
      const rewrite = context.getStepResult<{ rewritten: boolean }>("rewrite");

      return {
        success: review?.passed ?? false,
        topic: context.triggerData.topic,
        outputPath: write?.outputPath,
        researchSummary: research?.researchNotes.slice(0, 500) + "...",
        reviewSummary: review?.reviewReport.slice(0, 500) + "...",
        wasRewritten: rewrite?.rewritten ?? false,
      };
    },
  });

/**
 * 提交工作流编译
 */
techDocWorkflow.commit();
