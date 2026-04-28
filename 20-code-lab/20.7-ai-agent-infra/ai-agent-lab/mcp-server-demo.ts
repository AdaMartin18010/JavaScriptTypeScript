/**
 * @file MCP Server 最小实现
 * @category AI Agent → MCP
 * @difficulty medium
 * @tags mcp, model-context-protocol, json-rpc, stdio, tool-calling
 *
 * 基于 MCP 协议规范（Model Context Protocol）的最小可运行 Server 实现。
 * 演示：stdio 传输、JSON-RPC 2.0 通信、Tool / Resource / Prompt 原语。
 * 不依赖外部运行时库，纯 TypeScript 实现协议核心逻辑。
 */

import { createInterface, Interface } from 'node:readline';

// ==================== 协议类型定义 ====================

interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

interface McpTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpResource {
  uri: string;
  name: string;
  mimeType?: string;
}

interface McpPrompt {
  name: string;
  description: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

interface McpServerCapabilities {
  tools?: { listChanged?: boolean };
  resources?: { subscribe?: boolean; listChanged?: boolean };
  prompts?: { listChanged?: boolean };
}

// ==================== 业务工具实现 ====================

interface WeatherInput {
  city: string;
  unit?: 'celsius' | 'fahrenheit';
}

function getWeather(input: WeatherInput): string {
  const { city, unit = 'celsius' } = input;
  // 模拟天气查询
  const temp = unit === 'celsius' ? 22 : 72;
  return `${city} 当前温度: ${temp}°${unit === 'celsius' ? 'C' : 'F'}，晴朗`;
}

interface CalculatorInput {
  expression: string;
}

function calculate(input: CalculatorInput): string {
  const { expression } = input;
  // 安全计算：仅允许数字与基础运算符
  const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
  if (sanitized !== expression.trim()) {
    throw new Error('表达式包含非法字符');
  }
  try {
    // eslint-disable-next-line no-eval
    const result = new Function(`return (${sanitized})`)() as number;
    return `结果: ${result}`;
  } catch {
    throw new Error('表达式计算失败');
  }
}

// ==================== MCP Server 核心 ====================

export class McpServer {
  private tools: Map<string, McpTool & { handler: (args: unknown) => string }> = new Map();
  private resources: Map<string, McpResource & { handler: () => string }> = new Map();
  private prompts: Map<string, McpPrompt & { handler: (args: Record<string, string>) => string }> = new Map();
  private rl: Interface | null = null;
  private initialized = false;

  constructor(private readonly name: string, private readonly version: string) {}

  // 注册工具
  registerTool(
    tool: McpTool,
    handler: (args: unknown) => string
  ): void {
    this.tools.set(tool.name, { ...tool, handler });
  }

  // 注册资源
  registerResource(
    resource: McpResource,
    handler: () => string
  ): void {
    this.resources.set(resource.uri, { ...resource, handler });
  }

  // 注册提示模板
  registerPrompt(
    prompt: McpPrompt,
    handler: (args: Record<string, string>) => string
  ): void {
    this.prompts.set(prompt.name, { ...prompt, handler });
  }

  // 启动 stdio 传输
  start(): void {
    this.rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    this.rl.on('line', (line: string) => {
      this.handleMessage(line).catch((err: Error) => {
        this.sendError('unknown', -32000, err.message);
      });
    });

    console.error(`[MCP Server] ${this.name} v${this.version} 已启动 (stdio)`);
  }

  // 停止服务
  stop(): void {
    this.rl?.close();
    this.rl = null;
  }

  private async handleMessage(line: string): Promise<void> {
    let req: JsonRpcRequest;
    try {
      req = JSON.parse(line) as JsonRpcRequest;
    } catch {
      this.sendError('unknown', -32700, 'Parse error: 无效的 JSON');
      return;
    }

    if (req.jsonrpc !== '2.0') {
      this.sendError(req.id ?? 'unknown', -32600, 'Invalid Request: 仅支持 JSON-RPC 2.0');
      return;
    }

    switch (req.method) {
      case 'initialize':
        this.handleInitialize(req);
        break;
      case 'initialized':
        this.initialized = true;
        break;
      case 'tools/list':
        this.handleToolsList(req);
        break;
      case 'tools/call':
        this.handleToolCall(req);
        break;
      case 'resources/list':
        this.handleResourcesList(req);
        break;
      case 'resources/read':
        this.handleResourceRead(req);
        break;
      case 'prompts/list':
        this.handlePromptsList(req);
        break;
      case 'prompts/get':
        this.handlePromptGet(req);
        break;
      default:
        this.sendError(req.id, -32601, `Method not found: ${req.method}`);
    }
  }

  private handleInitialize(req: JsonRpcRequest): void {
    const capabilities: McpServerCapabilities = {
      tools: { listChanged: false },
      resources: { subscribe: false, listChanged: false },
      prompts: { listChanged: false },
    };

    this.sendResponse(req.id, {
      protocolVersion: '2024-11-05',
      capabilities,
      serverInfo: {
        name: this.name,
        version: this.version,
      },
    });
  }

  private handleToolsList(req: JsonRpcRequest): void {
    const tools = Array.from(this.tools.values()).map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema,
    }));
    this.sendResponse(req.id, { tools });
  }

  private handleToolCall(req: JsonRpcRequest): void {
    const params = req.params as { name: string; arguments?: unknown } | undefined;
    const toolName = params?.name;
    if (!toolName) {
      this.sendError(req.id, -32602, 'Invalid params: 缺少 tool name');
      return;
    }

    const tool = this.tools.get(toolName);
    if (!tool) {
      this.sendError(req.id, -32602, `Tool not found: ${toolName}`);
      return;
    }

    try {
      const result = tool.handler(params.arguments ?? {});
      this.sendResponse(req.id, {
        content: [{ type: 'text', text: result }],
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.sendError(req.id, -32603, `Tool execution error: ${message}`);
    }
  }

  private handleResourcesList(req: JsonRpcRequest): void {
    const resources = Array.from(this.resources.values()).map(({ uri, name, mimeType }) => ({
      uri,
      name,
      mimeType,
    }));
    this.sendResponse(req.id, { resources });
  }

  private handleResourceRead(req: JsonRpcRequest): void {
    const params = req.params as { uri: string } | undefined;
    const uri = params?.uri;
    if (!uri) {
      this.sendError(req.id, -32602, 'Invalid params: 缺少 resource uri');
      return;
    }

    const resource = this.resources.get(uri);
    if (!resource) {
      this.sendError(req.id, -32602, `Resource not found: ${uri}`);
      return;
    }

    const contents = resource.handler();
    this.sendResponse(req.id, {
      contents: [{ uri, mimeType: resource.mimeType ?? 'text/plain', text: contents }],
    });
  }

  private handlePromptsList(req: JsonRpcRequest): void {
    const prompts = Array.from(this.prompts.values()).map(({ name, description, arguments: args }) => ({
      name,
      description,
      arguments: args,
    }));
    this.sendResponse(req.id, { prompts });
  }

  private handlePromptGet(req: JsonRpcRequest): void {
    const params = req.params as { name: string; arguments?: Record<string, string> } | undefined;
    const promptName = params?.name;
    if (!promptName) {
      this.sendError(req.id, -32602, 'Invalid params: 缺少 prompt name');
      return;
    }

    const prompt = this.prompts.get(promptName);
    if (!prompt) {
      this.sendError(req.id, -32602, `Prompt not found: ${promptName}`);
      return;
    }

    const text = prompt.handler(params.arguments ?? {});
    this.sendResponse(req.id, {
      description: prompt.description,
      messages: [{ role: 'user', content: { type: 'text', text } }],
    });
  }

  private sendResponse(id: number | string, result: unknown): void {
    const res: JsonRpcResponse = { jsonrpc: '2.0', id, result };
    console.log(JSON.stringify(res));
  }

  private sendError(id: number | string, code: number, message: string): void {
    const res: JsonRpcResponse = { jsonrpc: '2.0', id, error: { code, message } };
    console.log(JSON.stringify(res));
  }
}

// ==================== 初始化并运行 Server ====================

export function createDemoServer(): McpServer {
  const server = new McpServer('demo-weather-calc', '1.0.0');

  // 注册天气工具
  server.registerTool(
    {
      name: 'get_weather',
      description: '查询指定城市的当前天气',
      inputSchema: {
        type: 'object',
        properties: {
          city: { type: 'string', description: '城市名称' },
          unit: { type: 'string', enum: ['celsius', 'fahrenheit'], description: '温度单位' },
        },
        required: ['city'],
      },
    },
    (args: unknown) => getWeather(args as WeatherInput)
  );

  // 注册计算器工具
  server.registerTool(
    {
      name: 'calculate',
      description: '安全计算数学表达式（仅支持 + - * / 与括号）',
      inputSchema: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: '数学表达式，例如: (10 + 20) * 3' },
        },
        required: ['expression'],
      },
    },
    (args: unknown) => calculate(args as CalculatorInput)
  );

  // 注册系统状态资源
  server.registerResource(
    {
      uri: 'system://status',
      name: '系统状态',
      mimeType: 'application/json',
    },
    () => JSON.stringify({ status: 'healthy', uptime: process.uptime(), timestamp: new Date().toISOString() })
  );

  // 注册代码审查提示模板
  server.registerPrompt(
    {
      name: 'code_review',
      description: '生成代码审查提示词',
      arguments: [
        { name: 'language', description: '编程语言', required: true },
        { name: 'code', description: '待审查代码', required: true },
      ],
    },
    (args: Record<string, string>) =>
      `请作为资深 ${args.language} 工程师，审查以下代码并提供改进建议：\n\n\`\`\`${args.language}\n${args.code}\n\`\`\``
  );

  return server;
}

// CLI 入口：直接运行 ts-node mcp-server-demo.ts 时启动
if (require.main === module) {
  const server = createDemoServer();
  server.start();
}
