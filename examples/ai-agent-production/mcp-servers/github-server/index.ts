/**
 * @file GitHub MCP Server（模拟实现）
 * @description 通过 MCP 协议暴露 GitHub API 能力（Issue、PR、仓库查询）
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * 模拟 GitHub API 响应
 */
const MOCK_REPOS = [
  { name: "mastra", owner: "mastra-ai", stars: 15200, language: "TypeScript" },
  { name: "ai", owner: "vercel", stars: 9800, language: "TypeScript" },
  { name: "typescript", owner: "microsoft", stars: 102000, language: "TypeScript" },
];

const MOCK_ISSUES = [
  { number: 1, title: "Feature: 支持 MCP 协议", state: "open", labels: ["enhancement"] },
  { number: 2, title: "Bug: 工作流重试机制异常", state: "closed", labels: ["bug"] },
  { number: 3, title: "Docs: 补充部署指南", state: "open", labels: ["documentation"] },
];

/**
 * 创建 MCP Server 实例
 */
const server = new Server(
  { name: "github-server", version: "1.0.0" },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * 列出工具
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_repos",
      description: "根据关键词搜索 GitHub 仓库",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string", description: "搜索关键词" },
          language: { type: "string", description: "筛选编程语言" },
        },
        required: ["query"],
      },
    },
    {
      name: "list_issues",
      description: "列出指定仓库的 Issues",
      inputSchema: {
        type: "object" as const,
        properties: {
          owner: { type: "string", description: "仓库所有者" },
          repo: { type: "string", description: "仓库名称" },
          state: { type: "string", enum: ["open", "closed", "all"], default: "open" },
        },
        required: ["owner", "repo"],
      },
    },
    {
      name: "get_repo_info",
      description: "获取仓库基本信息",
      inputSchema: {
        type: "object" as const,
        properties: {
          owner: { type: "string", description: "仓库所有者" },
          repo: { type: "string", description: "仓库名称" },
        },
        required: ["owner", "repo"],
      },
    },
  ],
}));

/**
 * 调用工具
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "search_repos": {
        const { query, language } = args as { query: string; language?: string };
        let results = MOCK_REPOS.filter(
          (r) =>
            r.name.toLowerCase().includes(query.toLowerCase()) ||
            r.owner.toLowerCase().includes(query.toLowerCase())
        );
        if (language) {
          results = results.filter((r) => r.language.toLowerCase() === language.toLowerCase());
        }
        return {
          content: [{ type: "text" as const, text: JSON.stringify(results, null, 2) }],
        };
      }

      case "list_issues": {
        const { state } = args as { owner: string; repo: string; state?: string };
        let issues = MOCK_ISSUES;
        if (state && state !== "all") {
          issues = issues.filter((i) => i.state === state);
        }
        return {
          content: [{ type: "text" as const, text: JSON.stringify(issues, null, 2) }],
        };
      }

      case "get_repo_info": {
        const { owner, repo } = args as { owner: string; repo: string };
        const found = MOCK_REPOS.find((r) => r.owner === owner && r.name === repo);
        if (!found) {
          return {
            content: [{ type: "text" as const, text: `未找到仓库: ${owner}/${repo}` }],
            isError: true,
          };
        }
        return {
          content: [{ type: "text" as const, text: JSON.stringify(found, null, 2) }],
        };
      }

      default:
        throw new Error(`未知工具: ${name}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: [{ type: "text" as const, text: `错误: ${message}` }], isError: true };
  }
});

/**
 * 启动 stdio 传输
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[MCP GitHub Server] 已启动（模拟模式）");
}

main().catch((err: Error) => {
  console.error("[MCP GitHub Server] 错误:", err);
  process.exit(1);
});
