/**
 * @file 代码审查工作流
 * @description 自动化代码审查流程：分析 → 审查 → 生成报告
 */

import { Workflow } from "@mastra/core/workflows";
import { z } from "zod";

/**
 * 代码审查工作流
 * 
 * 阶段 1: 读取代码文件
 * 阶段 2: 并行执行复杂度分析与风格审查
 * 阶段 3: 聚合结果，生成最终审查报告
 */
export const codeReviewWorkflow = new Workflow({
  name: "code-review-workflow",
  triggerSchema: z.object({
    filePath: z.string().describe("待审查代码文件路径（相对于安全根目录）"),
    language: z.string().default("typescript").describe("编程语言"),
  }),
})
  // 步骤 1: 读取代码
  .step("read-code", {
    execute: async ({ context, mastra }) => {
      const filePath = context.triggerData.filePath;
      // 使用 Researcher Agent 的 readFile 能力（或直接用工具）
      const agent = mastra.getAgent("reviewer");
      const result = await agent.generate(
        `请使用 read-file 工具读取文件 "${filePath}" 的内容，并返回完整代码文本。`
      );

      return {
        code: result.text,
        filePath,
      };
    },
  })

  // 步骤 2a: 复杂度分析（并行分支 A）
  .step("analyze-complexity", {
    execute: async ({ context, mastra }) => {
      const code = context.getStepResult<{ code: string }>("read-code")?.code ?? "";
      const language = context.triggerData.language;

      const agent = mastra.getAgent("reviewer");
      const result = await agent.generate(
        `请对以下 ${language} 代码进行复杂度分析，使用 analyze-code 工具。\n\n\`\`\`${language}\n${code}\n\`\`\``
      );

      return {
        analysisResult: result.text,
      };
    },
  })

  // 步骤 2b: 风格审查（并行分支 B）
  .step("review-style", {
    execute: async ({ context, mastra }) => {
      const code = context.getStepResult<{ code: string }>("read-code")?.code ?? "";
      const language = context.triggerData.language;

      const agent = mastra.getAgent("reviewer");
      const result = await agent.generate(
        `请对以下 ${language} 代码进行风格审查，使用 review-code 工具。\n\n\`\`\`${language}\n${code}\n\`\`\``
      );

      return {
        styleResult: result.text,
      };
    },
  })

  // 步骤 3: 聚合报告（等待并行步骤完成）
  .step("generate-report", {
    execute: async ({ context }) => {
      const filePath = context.triggerData.filePath;
      const analysis = context.getStepResult<{ analysisResult: string }>("analyze-complexity");
      const style = context.getStepResult<{ styleResult: string }>("review-style");

      const report = [
        `# 代码审查报告: ${filePath}`,
        "",
        "## 复杂度分析",
        analysis?.analysisResult ?? "未能获取分析结果",
        "",
        "## 风格审查",
        style?.styleResult ?? "未能获取审查结果",
        "",
        "---",
        `生成时间: ${new Date().toISOString()}`,
      ].join("\n");

      return {
        success: true,
        filePath,
        report,
      };
    },
  });

/**
 * 提交工作流编译
 */
codeReviewWorkflow.commit();
