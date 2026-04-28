/**
 * @file 网络搜索工具
 * @description 模拟网络搜索能力，实际项目中可替换为 SerpAPI、Tavily 或自定义搜索引擎
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * 模拟搜索结果条目
 */
interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

/**
 * 模拟搜索引擎数据库
 * 实际生产环境应接入真实搜索 API
 */
const MOCK_KNOWLEDGE_BASE: Record<string, SearchResultItem[]> = {
  typescript: [
    {
      title: "TypeScript 官方文档",
      url: "https://www.typescriptlang.org/docs/",
      snippet: "TypeScript 是 JavaScript 的超集，添加了静态类型系统。",
      source: "typescriptlang.org",
    },
    {
      title: "TypeScript 5.8 新特性",
      url: "https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/",
      snippet: "TypeScript 5.8 引入了更强大的类型推断和性能优化。",
      source: "microsoft.com",
    },
  ],
  mastra: [
    {
      title: "Mastra AI 框架文档",
      url: "https://mastra.ai/docs",
      snippet: "Mastra 是 TypeScript-first 的 AI 应用框架，内置工作流引擎与多 Agent 编排。",
      source: "mastra.ai",
    },
    {
      title: "Mastra GitHub 仓库",
      url: "https://github.com/mastra-ai/mastra",
      snippet: "GitHub - mastra-ai/mastra: The TypeScript AI framework.",
      source: "github.com",
    },
  ],
  mcp: [
    {
      title: "Model Context Protocol 规范",
      url: "https://modelcontextprotocol.io/",
      snippet: "MCP 是标准化的 LLM 上下文协议，支持 Tools、Resources 和 Prompts。",
      source: "modelcontextprotocol.io",
    },
    {
      title: "MCP TypeScript SDK",
      url: "https://github.com/modelcontextprotocol/typescript-sdk",
      snippet: "Official TypeScript SDK for Model Context Protocol.",
      source: "github.com",
    },
  ],
  default: [
    {
      title: "搜索结果",
      url: "https://example.com/search",
      snippet: "未找到精确匹配，建议进一步细化搜索关键词。",
      source: "example.com",
    },
  ],
};

/**
 * 执行模拟搜索
 */
function performMockSearch(query: string): SearchResultItem[] {
  const normalized = query.toLowerCase().trim();
  for (const [key, results] of Object.entries(MOCK_KNOWLEDGE_BASE)) {
    if (normalized.includes(key)) {
      return results;
    }
  }
  return MOCK_KNOWLEDGE_BASE.default;
}

/**
 * 网络搜索工具
 */
export const webSearchTool = createTool({
  id: "web-search",
  description: "搜索互联网获取技术主题的相关信息（当前为模拟实现）",
  inputSchema: z.object({
    query: z.string().describe("搜索关键词"),
    limit: z.number().int().min(1).max(10).default(5).describe("返回结果数量上限"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    results: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
        source: z.string(),
      })
    ),
    total: z.number(),
    query: z.string(),
  }),
  execute: async ({ context }) => {
    const results = performMockSearch(context.query);
    const limited = results.slice(0, context.limit);

    return {
      success: true,
      results: limited,
      total: limited.length,
      query: context.query,
    };
  },
});

/**
 * 获取网页摘要工具（模拟）
 */
export const fetchPageTool = createTool({
  id: "fetch-page",
  description: "获取指定网页的内容摘要（当前为模拟实现）",
  inputSchema: z.object({
    url: z.string().url().describe("目标网页 URL"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    title: z.string(),
    summary: z.string(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    // 模拟延迟
    await new Promise((r) => setTimeout(r, 300));

    return {
      success: true,
      title: `页面: ${context.url}`,
      summary: `这是 ${context.url} 的内容摘要。实际生产环境应使用 fetch 或 playwright 获取真实网页内容。`,
    };
  },
});
