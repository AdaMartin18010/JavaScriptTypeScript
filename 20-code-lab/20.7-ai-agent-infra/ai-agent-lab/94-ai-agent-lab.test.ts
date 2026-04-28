// @vitest-environment node

// Mock zod 以避免依赖缺失（该模块未安装）
vi.mock('zod', () => {
  const schema = {
    safeParse: (data: unknown) => ({ success: true, data }),
    parse: (data: unknown) => data,
  };
  const chainable = {
    min: () => chainable,
    max: () => chainable,
    int: () => chainable,
    optional: () => chainable,
    default: () => chainable,
    describe: () => chainable,
    ...schema,
  };
  return {
    z: {
      object: () => chainable,
      string: () => chainable,
      number: () => chainable,
      enum: () => chainable,
      infer: () => ({}),
      unknown: () => schema,
    },
  };
});

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { McpServer, createDemoServer } from './mcp-server-demo.js';
import {
  AgentRegistry,
  WorkflowEngine,
  ResearchAgent,
  WriterAgent,
  EditorAgent,
  CodeAgent,
  TestAgent,
  contentPipelineWorkflow,
  devSwarmWorkflow,
  fullProductWorkflow,
} from './multi-agent-workflow.js';
import {
  ToolCallingOrchestrator,
  weatherTool,
  calculatorTool,
  searchTool,
  adaptMcpTools,
  tools,
} from './vercel-ai-sdk-tool-calling.js';

// ==================== MCP Server 测试 ====================

describe('MCP Server', () => {
  let server: McpServer;
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    server = createDemoServer();
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    server.stop();
  });

  it('应正确注册工具并在 tools/list 中返回', async () => {
    await (server as any).handleMessage(
      JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })
    );

    const calls = consoleSpy.mock.calls as string[][];
    const response = JSON.parse(calls[0][0]);
    expect(response.jsonrpc).toBe('2.0');
    expect(response.id).toBe(1);
    expect(response.result.tools).toHaveLength(2);
    expect(response.result.tools.map((t: any) => t.name)).toContain('get_weather');
    expect(response.result.tools.map((t: any) => t.name)).toContain('calculate');
  });

  it('应能通过 tools/call 调用天气工具', async () => {
    await (server as any).handleMessage(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name: 'get_weather', arguments: { city: '上海', unit: 'celsius' } },
      })
    );

    const calls = consoleSpy.mock.calls as string[][];
    const response = JSON.parse(calls[0][0]);
    expect(response.result.content[0].text).toContain('上海');
    expect(response.result.content[0].text).toContain('22°C');
  });

  it('应能通过 tools/call 调用计算器工具', async () => {
    await (server as any).handleMessage(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: { name: 'calculate', arguments: { expression: '(10 + 5) * 2' } },
      })
    );

    const calls = consoleSpy.mock.calls as string[][];
    const response = JSON.parse(calls[0][0]);
    expect(response.result.content[0].text).toContain('30');
  });

  it('调用不存在工具时应返回错误', async () => {
    await (server as any).handleMessage(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: { name: 'nonexistent' },
      })
    );

    const calls = consoleSpy.mock.calls as string[][];
    const response = JSON.parse(calls[0][0]);
    expect(response.error).toBeDefined();
    expect(response.error.code).toBe(-32602);
    expect(response.error.message).toContain('Tool not found');
  });

  it('应支持 resources/list 和 resources/read', async () => {
    await (server as any).handleMessage(
      JSON.stringify({ jsonrpc: '2.0', id: 5, method: 'resources/list' })
    );

    const calls = consoleSpy.mock.calls as string[][];
    const listResponse = JSON.parse(calls[0][0]);
    expect(listResponse.result.resources).toHaveLength(1);
    expect(listResponse.result.resources[0].uri).toBe('system://status');

    await (server as any).handleMessage(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 6,
        method: 'resources/read',
        params: { uri: 'system://status' },
      })
    );

    const readResponse = JSON.parse(calls[1][0]);
    expect(readResponse.result.contents[0].uri).toBe('system://status');
    expect(readResponse.result.contents[0].mimeType).toBe('application/json');
  });

  it('应支持 prompts/list 和 prompts/get', async () => {
    await (server as any).handleMessage(
      JSON.stringify({ jsonrpc: '2.0', id: 7, method: 'prompts/list' })
    );

    const calls = consoleSpy.mock.calls as string[][];
    const listResponse = JSON.parse(calls[0][0]);
    expect(listResponse.result.prompts).toHaveLength(1);
    expect(listResponse.result.prompts[0].name).toBe('code_review');

    await (server as any).handleMessage(
      JSON.stringify({
        jsonrpc: '2.0',
        id: 8,
        method: 'prompts/get',
        params: { name: 'code_review', arguments: { language: 'TypeScript', code: 'const x = 1;' } },
      })
    );

    const getResponse = JSON.parse(calls[1][0]);
    expect(getResponse.result.messages[0].content.text).toContain('TypeScript');
  });

  it('无效 JSON 请求应返回 parse error', async () => {
    await (server as any).handleMessage('这不是 JSON');

    const calls = consoleSpy.mock.calls as string[][];
    const response = JSON.parse(calls[0][0]);
    expect(response.error.code).toBe(-32700);
  });

  it('非 JSON-RPC 2.0 请求应返回 invalid request', async () => {
    await (server as any).handleMessage(JSON.stringify({ jsonrpc: '1.0', id: 9, method: 'foo' }));

    const calls = consoleSpy.mock.calls as string[][];
    const response = JSON.parse(calls[0][0]);
    expect(response.error.code).toBe(-32600);
  });
});

// ==================== Multi-Agent Workflow 测试 ====================

describe('Multi-Agent Workflow', () => {
  let registry: AgentRegistry;
  let engine: WorkflowEngine;

  beforeEach(() => {
    registry = new AgentRegistry();
    registry.register(new ResearchAgent());
    registry.register(new WriterAgent());
    registry.register(new EditorAgent());
    registry.register(new CodeAgent());
    registry.register(new TestAgent());
    engine = new WorkflowEngine(registry);
  });

  it('顺序工作流应依次执行各步骤并共享状态', async () => {
    const results = await engine.executeSequential(contentPipelineWorkflow, 'AI Agent 安全');

    expect(results).toHaveLength(3);
    expect(results[0].agentName).toBe('researcher');
    expect(results[0].success).toBe(true);
    expect(results[1].agentName).toBe('writer');
    expect(results[1].success).toBe(true);
    expect(results[2].agentName).toBe('editor');
    expect(results[2].success).toBe(true);

    // 验证 sharedState 被传递
    expect(results[1].output).toContain('AI Agent 安全');
  });

  it('并行工作流应同时执行多个 Agent', async () => {
    const results = await engine.executeParallel(devSwarmWorkflow, 'user auth');

    expect(results).toHaveLength(2);
    const names = results.map((r) => r.agentName).sort();
    expect(names).toEqual(['coder', 'tester']);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it('混合工作流应正确编排顺序和并行阶段', async () => {
    const results = await engine.executeMixed(fullProductWorkflow, 'payment gateway');

    expect(results).toHaveLength(3);
    // 阶段 1: 顺序研究
    expect(results[0]).toHaveLength(1);
    expect(results[0][0].agentName).toBe('researcher');
    // 阶段 2: 并行编码+测试
    expect(results[1]).toHaveLength(2);
    expect(results[1].map((r) => r.agentName).sort()).toEqual(['coder', 'tester']);
    // 阶段 3: 顺序审校
    expect(results[2]).toHaveLength(1);
    expect(results[2][0].agentName).toBe('editor');
  });

  it('条件不满足时应跳过对应步骤', async () => {
    const conditionalWorkflow = {
      name: 'conditional-test',
      steps: [
        {
          id: 's1',
          name: '总是执行',
          agentName: 'researcher',
          type: 'sequential' as const,
        },
        {
          id: 's2',
          name: '条件跳过',
          agentName: 'writer',
          type: 'sequential' as const,
          condition: () => false,
        },
      ],
    };

    const results = await engine.executeSequential(conditionalWorkflow, 'test');
    expect(results).toHaveLength(1);
    expect(results[0].agentName).toBe('researcher');
  });

  it('transform 应正确转换输入', async () => {
    const transformWorkflow = {
      name: 'transform-test',
      steps: [
        {
          id: 's1',
          name: '转换步骤',
          agentName: 'coder',
          type: 'sequential' as const,
          transform: (input: string) => `Transformed: ${input}`,
        },
      ],
    };

    const results = await engine.executeSequential(transformWorkflow, 'hello');
    expect(results[0].output).toContain('Transformed:Hello');
  });

  it('AgentRegistry 应能正确注册和查找 Agent', () => {
    expect(registry.get('researcher')).toBeInstanceOf(ResearchAgent);
    expect(registry.get('writer')).toBeInstanceOf(WriterAgent);
    expect(() => registry.get('nonexistent')).toThrow('Agent not found: nonexistent');
  });

  it('各 Agent 应返回正确的输出格式', async () => {
    const ctx = {
      taskId: 't1',
      input: 'test',
      metadata: {},
      sharedState: {},
    };

    const researchResult = await new ResearchAgent().execute('topic', ctx);
    expect(researchResult.success).toBe(true);
    expect(researchResult.tokensUsed).toBeGreaterThan(0);
    expect(researchResult.output).toContain('背景调研完成');

    const writerResult = await new WriterAgent().execute('topic', ctx);
    expect(writerResult.success).toBe(true);
    expect(writerResult.output).toContain('## 关于 topic 的报告');

    const editorResult = await new EditorAgent().execute('draft', ctx);
    expect(editorResult.success).toBe(true);
    expect(editorResult.output).toContain('审校意见');

    const codeResult = await new CodeAgent().execute('user login', ctx);
    expect(codeResult.success).toBe(true);
    expect(codeResult.output).toContain('function handleUserLogin()');

    const testResult = await new TestAgent().execute('user login', ctx);
    expect(testResult.success).toBe(true);
    expect(testResult.output).toContain('describe');
  });
});

// ==================== Vercel AI SDK Tool Calling 测试 ====================

describe('Vercel AI SDK Tool Calling', () => {
  it('应导出所有工具定义', () => {
    expect(tools).toHaveLength(3);
    expect(weatherTool.name).toBe('get_weather');
    expect(calculatorTool.name).toBe('calculate');
    expect(searchTool.name).toBe('search');
  });

  it('天气工具应返回模拟天气数据', async () => {
    const result = await weatherTool.execute({ city: '北京', unit: 'celsius' });
    expect(result.success).toBe(true);
    expect(result.data).toContain('北京');
    expect(result.data).toContain('24°C');
  });

  it('计算器工具应正确计算表达式', async () => {
    const result = await calculatorTool.execute({ expression: '(100 + 50) * 2' });
    expect(result.success).toBe(true);
    expect(result.data).toContain('300');
  });

  it('计算器工具应拒绝非法字符', async () => {
    const result = await calculatorTool.execute({ expression: 'alert(1)' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('非法字符');
  });

  it('搜索工具应返回模拟结果', async () => {
    const result = await searchTool.execute({ query: 'TypeScript', limit: 3 });
    expect(result.success).toBe(true);
    expect(result.data).toContain('结果 1');
    expect(result.data).toContain('结果 3');
    expect(result.data).not.toContain('结果 4');
  });

  it('ToolCallingOrchestrator 应处理普通对话（无工具调用）', async () => {
    const orchestrator = new ToolCallingOrchestrator();
    const history = await orchestrator.sendMessage('你好');

    const assistantMsgs = history.filter((m) => m.role === 'assistant');
    expect(assistantMsgs.length).toBeGreaterThanOrEqual(1);
    expect(assistantMsgs[assistantMsgs.length - 1].content).toContain('已收到您的消息');
  });

  it('ToolCallingOrchestrator 应处理天气查询工具调用', async () => {
    const orchestrator = new ToolCallingOrchestrator();
    const history = await orchestrator.sendMessage('北京今天天气怎么样？');

    const toolCalls = history.filter((m) => m.role === 'assistant' && m.toolCalls);
    expect(toolCalls.length).toBeGreaterThanOrEqual(1);

    const toolResults = history.filter((m) => m.role === 'tool');
    expect(toolResults.length).toBeGreaterThanOrEqual(1);
    expect(toolResults[0].content).toContain('北京');
  });

  it('ToolCallingOrchestrator 应处理数学计算工具调用', async () => {
    const orchestrator = new ToolCallingOrchestrator();
    const history = await orchestrator.sendMessage('帮我计算 10 + 20');

    const toolResults = history.filter((m) => m.role === 'tool');
    expect(toolResults.length).toBeGreaterThanOrEqual(1);
    expect(toolResults[0].content).toContain('30');
  });

  it('adaptMcpTools 应将 MCP 工具转换为 AI SDK 格式', async () => {
    const mcpTools = [
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

    const adapted = adaptMcpTools(mcpTools);
    expect(adapted).toHaveLength(1);
    expect(adapted[0].name).toBe('get_weather');
    expect(adapted[0].description).toBe('查询天气');

    const result = await adapted[0].execute({ city: '上海' });
    expect(result.success).toBe(true);
  });

  it('未找到工具时应返回错误信息', async () => {
    const orchestrator = new ToolCallingOrchestrator([]);
    // 通过反射直接调用私有方法进行测试
    const result = await (orchestrator as any).executeTool('unknown_tool', '{}');
    expect(result).toContain('未找到工具');
  });
});
