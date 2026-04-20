/**
 * @file 文件系统操作工具
 * @description 为 Agent 提供安全的文件读写、目录遍历能力
 */

import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { readFile, writeFile, mkdir, readdir, access } from "node:fs/promises";
import { resolve, join, relative } from "node:path";

/**
 * 文件系统操作的安全根目录
 * 所有操作都会被限制在此目录下，防止路径遍历攻击
 */
const SAFE_ROOT = resolve(process.env.MCP_FILESYSTEM_ROOT ?? "./data/mcp-files");

/**
 * 验证并规范化路径，确保安全
 */
function safePath(inputPath: string): string {
  const target = resolve(SAFE_ROOT, inputPath);
  const rel = relative(SAFE_ROOT, target);
  if (rel.startsWith("..") || rel === "..") {
    throw new Error("路径遍历检测：不允许访问安全根目录之外的文件");
  }
  return target;
}

/**
 * 读取文件内容工具
 */
export const readFileTool = createTool({
  id: "read-file",
  description: "读取指定路径的文本文件内容，支持 UTF-8 编码",
  inputSchema: z.object({
    path: z.string().describe("相对于安全根目录的文件路径"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    content: z.string(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const target = safePath(context.path);
      const content = await readFile(target, "utf-8");
      return { success: true, content };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, content: "", error: message };
    }
  },
});

/**
 * 写入文件内容工具
 */
export const writeFileTool = createTool({
  id: "write-file",
  description: "将内容写入指定路径的文本文件，自动创建父目录",
  inputSchema: z.object({
    path: z.string().describe("相对于安全根目录的文件路径"),
    content: z.string().describe("要写入的文本内容"),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const target = safePath(context.path);
      await mkdir(resolve(target, ".."), { recursive: true });
      await writeFile(target, context.content, "utf-8");
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  },
});

/**
 * 列出目录内容工具
 */
export const listDirTool = createTool({
  id: "list-directory",
  description: "列出指定目录下的文件和子目录",
  inputSchema: z.object({
    path: z.string().describe("相对于安全根目录的目录路径").default("."),
  }),
  outputSchema: z.object({
    success: z.boolean(),
    entries: z.array(z.object({ name: z.string(), type: z.enum(["file", "directory"]) })),
    error: z.string().optional(),
  }),
  execute: async ({ context }) => {
    try {
      const target = safePath(context.path);
      const entries = await readdir(target, { withFileTypes: true });
      return {
        success: true,
        entries: entries.map((e) => ({
          name: e.name,
          type: e.isDirectory() ? "directory" : ("file" as const),
        })),
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, entries: [], error: message };
    }
  },
});

/**
 * 检查文件是否存在
 */
export const fileExistsTool = createTool({
  id: "file-exists",
  description: "检查指定路径的文件或目录是否存在",
  inputSchema: z.object({
    path: z.string().describe("相对于安全根目录的路径"),
  }),
  outputSchema: z.object({
    exists: z.boolean(),
  }),
  execute: async ({ context }) => {
    try {
      const target = safePath(context.path);
      await access(target);
      return { exists: true };
    } catch {
      return { exists: false };
    }
  },
});
