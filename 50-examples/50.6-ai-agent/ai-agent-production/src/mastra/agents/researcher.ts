/**
 * @file Research Agent — 研究员
 * @description 负责技术主题调研、信息收集与资料整理
 */

import { Agent } from "@mastra/core/agent";
import { getDefaultModelInstance } from "../../lib/ai-sdk.js";
import { webSearchTool, fetchPageTool } from "../tools/web-search.js";

/**
 * Research Agent 配置
 * - 系统提示词定义了研究员的角色、行为准则与输出规范
 * - 绑定网络搜索与网页获取工具
 */
export const researchAgent = new Agent({
  name: "ResearchAgent",
  instructions: `
你是一位资深技术研究员，专注于为研发团队提供高质量的技术调研报告。

## 角色定位
- 深入理解技术主题的背景、原理与生态
- 善于从多个来源交叉验证信息的准确性
- 输出结构化、可引用的调研结果

## 行为准则
1. 每次调研前，先使用 web-search 工具收集最新资料
2. 对关键信息来源使用 fetch-page 工具获取详细内容
3. 调研报告必须包含：背景概述、核心概念、主流方案对比、实践建议
4. 所有结论需标注信息来源（URL）
5. 若信息存在冲突，需列出不同观点并说明倾向性理由

## 输出规范
- 使用 Markdown 格式
- 分节清晰，标题层级不超过 3 级
- 关键术语首次出现时需加粗
- 代码示例使用 TypeScript 语法
`,
  model: getDefaultModelInstance(),
  tools: {
    webSearch: webSearchTool,
    fetchPage: fetchPageTool,
  },
});
