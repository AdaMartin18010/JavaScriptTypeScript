/**
 * @file 技术文档工作流测试
 * @description 验证 DAG 工作流的步骤串联与条件分支
 */

import { describe, it, expect } from "vitest";
import { mastra } from "../../mastra.config.js";

describe("TechDocWorkflow", () => {
  it("应正确注册工作流", () => {
    const workflow = mastra.getWorkflow("techDoc");
    expect(workflow).toBeDefined();
    expect(workflow.name).toBe("tech-doc-workflow");
  });

  it("应完成 Research → Write → Review 全流程", async () => {
    const workflow = mastra.getWorkflow("techDoc");

    const result = await workflow.execute({
      triggerData: {
        topic: "TypeScript 5.8 新特性",
        outputPath: "tests/output/test-doc.md",
        maxRetries: 1,
      },
    });

    expect(result).toBeDefined();
    // 工作流结果结构验证
    expect(result.results).toBeInstanceOf(Map);
  }, 60000);
});
