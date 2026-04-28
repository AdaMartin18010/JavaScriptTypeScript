/**
 * @file MCP Client 封装
 * @description 基于 MCP SDK 的 Client 封装，支持多 Server 连接与工具发现
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import type {
  Tool,
  Resource,
  Prompt,
  CallToolResult,
  GetPromptResult,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Server 连接配置
 */
export interface McpServerConfig {
  name: string;
  transport: "stdio" | "sse";
  /** stdio 模式：命令与参数 */
  command?: string;
  args?: string[];
  /** SSE 模式：服务端点 URL */
  url?: string;
}

/**
 * MCP Client 管理器
 * 负责维护多个 MCP Server 的连接、工具发现与调用
 */
export class McpClientManager {
  private clients = new Map<string, Client>();
  private toolsCache = new Map<string, Tool[]>();
  private resourcesCache = new Map<string, Resource[]>();
  private promptsCache = new Map<string, Prompt[]>();

  /**
   * 注册并连接一个 MCP Server
   */
  async connectServer(config: McpServerConfig): Promise<void> {
    if (this.clients.has(config.name)) {
      throw new Error(`MCP Server "${config.name}" 已存在`);
    }

    let transport: StdioClientTransport | SSEClientTransport;

    if (config.transport === "stdio") {
      if (!config.command) {
        throw new Error(`stdio 模式需要提供 command 字段`);
      }
      transport = new StdioClientTransport({
        command: config.command,
        args: config.args ?? [],
      });
    } else {
      if (!config.url) {
        throw new Error(`SSE 模式需要提供 url 字段`);
      }
      transport = new SSEClientTransport(new URL(config.url));
    }

    const client = new Client(
      { name: "ai-agent-client", version: "1.0.0" },
      { capabilities: { tools: {}, resources: {}, prompts: {} } }
    );

    await client.connect(transport);
    this.clients.set(config.name, client);

    // 预加载工具、资源与提示列表
    await this.refreshServerCapabilities(config.name);

    console.log(`[MCP] 已连接 Server: ${config.name}`);
  }

  /**
   * 刷新指定 Server 的能力列表
   */
  async refreshServerCapabilities(serverName: string): Promise<void> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP Server 未找到: ${serverName}`);
    }

    const [tools, resources, prompts] = await Promise.all([
      client.listTools().then((r) => r.tools),
      client.listResources().then((r) => r.resources),
      client.listPrompts().then((r) => r.prompts),
    ]);

    this.toolsCache.set(serverName, tools);
    this.resourcesCache.set(serverName, resources);
    this.promptsCache.set(serverName, prompts);
  }

  /**
   * 获取所有已连接 Server 的工具列表
   */
  getAllTools(): Array<{ server: string; tool: Tool }> {
    const result: Array<{ server: string; tool: Tool }> = [];
    for (const [server, tools] of this.toolsCache) {
      for (const tool of tools) {
        result.push({ server, tool });
      }
    }
    return result;
  }

  /**
   * 调用指定 Server 的工具
   */
  async callTool(
    serverName: string,
    toolName: string,
    args: Record<string, unknown>
  ): Promise<CallToolResult> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP Server 未找到: ${serverName}`);
    }

    return client.callTool({ name: toolName, arguments: args });
  }

  /**
   * 获取指定 Server 的提示模板
   */
  async getPrompt(
    serverName: string,
    promptName: string,
    args?: Record<string, string>
  ): Promise<GetPromptResult> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP Server 未找到: ${serverName}`);
    }

    return client.getPrompt({ name: promptName, arguments: args });
  }

  /**
   * 读取指定 Server 的资源
   */
  async readResource(serverName: string, uri: string): Promise<string> {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP Server 未找到: ${serverName}`);
    }

    const result = await client.readResource({ uri });
    const text = result.contents
      .map((c) => ("text" in c ? c.text : ""))
      .join("\n");
    return text;
  }

  /**
   * 断开所有 Server 连接
   */
  async disconnectAll(): Promise<void> {
    for (const [name, client] of this.clients) {
      await client.close();
      console.log(`[MCP] 已断开 Server: ${name}`);
    }
    this.clients.clear();
    this.toolsCache.clear();
    this.resourcesCache.clear();
    this.promptsCache.clear();
  }

  /**
   * 获取已连接的 Server 名称列表
   */
  getConnectedServers(): string[] {
    return Array.from(this.clients.keys());
  }
}

/**
 * 全局 MCP Client 管理器实例
 */
export const mcpManager = new McpClientManager();
