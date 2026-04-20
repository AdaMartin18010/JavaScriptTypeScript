/**
 * @file 文件系统 MCP Server
 * @description 通过 MCP 协议暴露安全的文件读写、目录遍历能力
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { readFile, writeFile, mkdir, readdir, access } from "node:fs/promises";
import { resolve, relative } from "node:path";

/**
 * 安全根目录
 */
const SAFE_ROOT = resolve(process.env.MCP_ROOT ?? ".");

/**
 * 路径安全检查
 */
function safePath(input: string): string {
  const target = resolve(SAFE_ROOT, input);
  const rel = relative(SAFE_ROOT, target);
  if (rel.startsWith("..") || rel === "..") {
    throw new Error("路径遍历检测：不允许访问安全根目录之外的文件");
  }
  return target;
}

/**
 * 创建 MCP Server 实例
 */
const server = new Server(
  { name: "filesystem-server", version: "1.0.0" },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

/**
 * 列出工具
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "read_file",
      description: "读取指定路径的文本文件内容",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "相对于安全根目录的文件路径" },
        },
        required: ["path"],
      },
    },
    {
      name: "write_file",
      description: "将内容写入指定路径的文本文件",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "相对于安全根目录的文件路径" },
          content: { type: "string", description: "要写入的文本内容" },
        },
        required: ["path", "content"],
      },
    },
    {
      name: "list_directory",
      description: "列出指定目录下的文件和子目录",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "相对于安全根目录的目录路径", default: "." },
        },
      },
    },
    {
      name: "file_exists",
      description: "检查指定路径的文件或目录是否存在",
      inputSchema: {
        type: "object" as const,
        properties: {
          path: { type: "string", description: "相对于安全根目录的路径" },
        },
        required: ["path"],
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
      case "read_file": {
        const path = safePath((args as { path: string }).path);
        const content = await readFile(path, "utf-8");
        return { content: [{ type: "text" as const, text: content }] };
      }

      case "write_file": {
        const { path, content } = args as { path: string; content: string };
        const target = safePath(path);
        await mkdir(resolve(target, ".."), { recursive: true });
        await writeFile(target, content, "utf-8");
        return { content: [{ type: "text" as const, text: `文件已写入: ${path}` }] };
      }

      case "list_directory": {
        const dirPath = safePath((args as { path?: string }).path ?? ".");
        const entries = await readdir(dirPath, { withFileTypes: true });
        const result = entries.map((e) => ({
          name: e.name,
          type: e.isDirectory() ? "directory" : "file",
        }));
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      }

      case "file_exists": {
        const checkPath = safePath((args as { path: string }).path);
        try {
          await access(checkPath);
          return { content: [{ type: "text" as const, text: "true" }] };
        } catch {
          return { content: [{ type: "text" as const, text: "false" }] };
        }
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
 * 列出资源
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: "file://root",
      name: "文件系统根目录",
      mimeType: "application/json",
    },
  ],
}));

/**
 * 读取资源
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri === "file://root") {
    const entries = await readdir(SAFE_ROOT, { withFileTypes: true });
    return {
      contents: [
        {
          uri,
          mimeType: "application/json",
          text: JSON.stringify(
            entries.map((e) => ({ name: e.name, type: e.isDirectory() ? "directory" : "file" })),
            null,
            2
          ),
        },
      ],
    };
  }
  throw new Error(`未知资源: ${uri}`);
});

/**
 * 启动 stdio 传输
 */
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[MCP Filesystem Server] 已启动，安全根目录: ${SAFE_ROOT}`);
}

main().catch((err: Error) => {
  console.error("[MCP Filesystem Server] 错误:", err);
  process.exit(1);
});
