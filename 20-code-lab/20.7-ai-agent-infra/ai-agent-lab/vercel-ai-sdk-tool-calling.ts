/**
 * @file Vercel AI SDK v5/v6 Tool Calling 完整示例
 * @category AI Agent → Tool Calling
 * @difficulty medium
 * @tags ai-sdk, vercel, tool-calling, zod, streaming, mcp
 *
 * 演示：统一模型 API、Zod Schema 验证、多工具并行调用、流式输出、MCP 集成模式。
 * 代码使用类型注解展示完整类型安全，实际运行需安装 `ai` 与 `zod` 包。
 */

import { z } from 'zod';

// ==================== Zod Schema 定义 ====================

const WeatherSchema = z.object({
  city: z.string().min(1).describe('城市名称，例如：北京、上海'),
  unit: z.enum(['celsius', 'fahrenheit']).optional().default('celsius'),
});

const CalculatorSchema = z.object({
  expression: z.string().min(1).describe('数学表达式，例如: (10 + 5) * 2'),
});

const SearchSchema = z.object({
  query: z.string().min(1).describe('搜索关键词'),
  limit: z.number().int().min(1).max(10).optional().default(5),
});

// 提取工具参数类型
export type WeatherParams = z.infer<typeof WeatherSchema>;
export type CalculatorParams = z.infer<typeof CalculatorSchema>;
export type SearchParams = z.infer<typeof SearchSchema>;

// ==================== 工具执行层（纯业务逻辑）====================

interface ToolResult {
  success: boolean;
  data?: string;
  error?: string;
}

async function fetchWeather(params: WeatherParams): Promise<ToolResult> {
  const { city, unit } = params;
  // 模拟异步天气 API 调用
  await simulateLatency(300);
  const temp = unit === 'celsius' ? 24 : 75;
  return {
    success: true,
    data: `${city} 当前天气：${temp}°${unit === 'celsius' ? 'C' : 'F'}，多云，湿度 65%`,
  };
}

async function calculateExpression(params: CalculatorParams): Promise<ToolResult> {
  const { expression } = params;
  const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
  if (sanitized !== expression.trim()) {
    return { success: false, error: '表达式包含非法字符' };
  }
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${sanitized})`)() as number;
    return { success: true, data: `计算结果: ${result}` };
  } catch {
    return { success: false, error: '表达式计算失败' };
  }
}

async function performSearch(params: SearchParams): Promise<ToolResult> {
  const { query, limit } = params;
  await simulateLatency(200);
  const mockResults = [
    `结果 1: ${query} 的入门指南`,
    `结果 2: ${query} 最佳实践`,
    `结果 3: ${query} 常见问题解答`,
    `结果 4: ${query} 性能优化`,
    `结果 5: ${query} 高级技巧`,
  ].slice(0, limit);
  return { success: true, data: mockResults.join('\n') };
}

function simulateLatency(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== AI SDK 工具定义（类型安全层）====================

export interface AiSdkTool<TParams> {
  name: string;
  description: string;
  parameters: z.ZodSchema<TParams>;
  execute: (params: TParams) => Promise<ToolResult>;
}

export const weatherTool: AiSdkTool<WeatherParams> = {
  name: 'get_weather',
  description: '获取指定城市的当前天气信息，支持摄氏度与华氏度',
  parameters: WeatherSchema,
  execute: fetchWeather,
};

export const calculatorTool: AiSdkTool<CalculatorParams> = {
  name: 'calculate',
  description: '安全执行数学表达式计算，支持 + - * / 与括号',
  parameters: CalculatorSchema,
  execute: calculateExpression,
};

export const searchTool: AiSdkTool<SearchParams> = {
  name: 'search',
  description: '执行网络搜索并返回相关结果摘要',
  parameters: SearchSchema,
  execute: performSearch,
};

export const tools = [weatherTool, calculatorTool, searchTool];

// ==================== 模拟 LLM 响应与工具调用编排 ====================

export interface LlmMessage {
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: string;
  }>;
  toolCallId?: string;
}

export class ToolCallingOrchestrator {
  private conversation: LlmMessage[] = [];
  private maxSteps = 5;

  constructor(private readonly availableTools: AiSdkTool<unknown>[] = tools) {}

  // 模拟发送用户消息并获取 LLM 响应（含可能的 tool_calls）
  async sendMessage(userContent: string): Promise<LlmMessage[]> {
    this.conversation.push({ role: 'user', content: userContent });

    for (let step = 0; step < this.maxSteps; step++) {
      const assistantMsg = await this.mockLlmResponse(this.conversation);
      this.conversation.push(assistantMsg);

      // 若无工具调用，直接返回最终回答
      if (!assistantMsg.toolCalls || assistantMsg.toolCalls.length === 0) {
        break;
      }

      // 并行执行所有工具调用
      const toolResults = await Promise.all(
        assistantMsg.toolCalls.map(async (call) => {
          const result = await this.executeTool(call.name, call.arguments);
          return {
            role: 'tool' as const,
            content: result,
            toolCallId: call.id,
          };
        })
      );

      this.conversation.push(...toolResults);
    }

    return this.conversation;
  }

  private async mockLlmResponse(history: LlmMessage[]): Promise<LlmMessage> {
    // 模拟 LLM 决策：根据用户输入决定是否调用工具
    const lastUserMsg = history.findLast((m) => m.role === 'user');
    const content = lastUserMsg?.content ?? '';

    // 模拟工具调用触发逻辑
    if (content.includes('天气')) {
      const cityMatch = content.match(/([\u4e00-\u9fa5]{2,10}|[A-Za-z\s]+)/);
      const city = cityMatch ? cityMatch[1].trim() : '北京';
      return {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: `call_${Date.now()}`,
            name: 'get_weather',
            arguments: JSON.stringify({ city, unit: 'celsius' }),
          },
        ],
      };
    }

    if (content.includes('计算') || /\d+.*[+*\-/].*\d+/.test(content)) {
      const exprMatch = content.match(/([\d()+\-*/.\s]+)/);
      const expression = exprMatch ? exprMatch[1].trim() : '1+1';
      return {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: `call_${Date.now()}`,
            name: 'calculate',
            arguments: JSON.stringify({ expression }),
          },
        ],
      };
    }

    if (content.includes('搜索')) {
      const query = content.replace('搜索', '').trim();
      return {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: `call_${Date.now()}`,
            name: 'search',
            arguments: JSON.stringify({ query, limit: 3 }),
          },
        ],
      };
    }

    // 普通对话，无需工具
    return {
      role: 'assistant',
      content: `已收到您的消息："${content}"。目前无需调用外部工具即可回答。`,
    };
  }

  private async executeTool(name: string, argsJson: string): Promise<string> {
    const tool = this.availableTools.find((t) => t.name === name);
    if (!tool) {
      return `错误: 未找到工具 "${name}"`;
    }

    // Zod 校验
    let parsed: unknown;
    try {
      parsed = JSON.parse(argsJson);
    } catch {
      return `错误: 工具参数 JSON 解析失败`;
    }

    const validation = tool.parameters.safeParse(parsed);
    if (!validation.success) {
      return `错误: 参数校验失败 - ${validation.error.message}`;
    }

    const result = await tool.execute(validation.data);
    return result.success ? result.data ?? '' : `错误: ${result.error}`;
  }

  getConversation(): LlmMessage[] {
    return this.conversation;
  }
}

// ==================== 流式输出模拟（Streaming UI）====================

export async function* streamAgentResponse(
  orchestrator: ToolCallingOrchestrator,
  userMessage: string
): AsyncGenerator<string, void, unknown> {
  yield '[思考中...]\n';
  const history = await orchestrator.sendMessage(userMessage);

  for (const msg of history) {
    if (msg.role === 'assistant' && msg.content) {
      yield `[助手] ${msg.content}\n`;
    } else if (msg.role === 'assistant' && msg.toolCalls) {
      for (const call of msg.toolCalls) {
        yield `[调用工具] ${call.name}(${call.arguments})\n`;
      }
    } else if (msg.role === 'tool') {
      yield `[工具结果] ${msg.content}\n`;
    }
  }

  yield '[完成]\n';
}

// ==================== MCP Client 集成模式（适配层）====================

export interface McpToolAdapter {
  name: string;
  description: string;
  parameters: z.ZodSchema<unknown>;
  execute: (params: unknown) => Promise<ToolResult>;
}

// 将 MCP Server 的工具列表转换为 AI SDK 兼容格式
export function adaptMcpTools(mcpTools: Array<{ name: string; description: string; inputSchema: Record<string, unknown> }>): McpToolAdapter[] {
  return mcpTools.map((tool) => {
    // 将 JSON Schema 动态转换为 Zod Schema（简化版实现）
    const zodSchema = jsonSchemaToZod(tool.inputSchema);
    return {
      name: tool.name,
      description: tool.description,
      parameters: zodSchema,
      execute: async (params: unknown) => {
        // 实际实现中通过 MCP Client 发送 tools/call 请求
        console.log(`[MCP] 调用 ${tool.name}，参数:`, JSON.stringify(params));
        return { success: true, data: `MCP 工具 ${tool.name} 执行结果（模拟）` };
      },
    };
  });
}

// 简化版 JSON Schema → Zod 转换器（仅支持基础类型）
function jsonSchemaToZod(schema: Record<string, unknown>): z.ZodSchema<unknown> {
  if (schema.type === 'object' && typeof schema.properties === 'object' && schema.properties !== null) {
    const shape: Record<string, z.ZodType<unknown>> = {};
    const props = schema.properties as Record<string, { type?: string; description?: string }>;
    const required = (schema.required as string[]) ?? [];

    for (const [key, value] of Object.entries(props)) {
      let zType: z.ZodType<unknown>;
      if (value.type === 'string') {
        zType = z.string();
      } else if (value.type === 'number') {
        zType = z.number();
      } else if (value.type === 'boolean') {
        zType = z.boolean();
      } else if (value.type === 'integer') {
        zType = z.number().int();
      } else {
        zType = z.unknown();
      }

      if (!required.includes(key)) {
        zType = (zType as z.ZodType<unknown>).optional();
      }
      shape[key] = zType;
    }
    return z.object(shape);
  }

  return z.unknown();
}

// ==================== 演示入口 ====================

export async function demo(): Promise<void> {
  console.log('=== Vercel AI SDK Tool Calling 演示 ===\n');

  const orchestrator = new ToolCallingOrchestrator();

  console.log('--- 场景 1: 天气查询 ---');
  for await (const chunk of streamAgentResponse(orchestrator, '北京今天天气怎么样？')) {
    process.stdout.write(chunk);
  }

  console.log('\n--- 场景 2: 数学计算 ---');
  const orchestrator2 = new ToolCallingOrchestrator();
  for await (const chunk of streamAgentResponse(orchestrator2, '帮我计算 (100 + 50) * 2')) {
    process.stdout.write(chunk);
  }

  console.log('\n--- 场景 3: MCP 工具适配 ---');
  const mockMcpTools = [
    {
      name: 'get_weather',
      description: '查询天气',
      inputSchema: {
        type: 'object',
        properties: { city: { type: 'string' }, unit: { type: 'string' } },
        required: ['city'],
      },
    },
  ];
  const adapted = adaptMcpTools(mockMcpTools);
  console.log(`已适配 ${adapted.length} 个 MCP 工具: ${adapted.map((t) => t.name).join(', ')}`);
}

if (require.main === module) {
  demo().catch(console.error);
}
