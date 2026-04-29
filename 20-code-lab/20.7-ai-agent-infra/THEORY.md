# AI Agent 基础设施

> **定位**：`20-code-lab/20.7-ai-agent-infra`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 AI Agent 基础设施 领域的核心理论与实践映射问题。通过代码示例和形式化分析建立从概念到实现的认知桥梁。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 核心概念 | AI Agent 基础设施 的核心定义与语义 | 示例代码 |
| 实践模式 | 工程化中的典型应用场景 | patterns/ |

---

## 二、设计原理

### 2.1 为什么存在

AI Agent 基础设施 作为软件工程中的重要课题，其存在是为了解决特定领域的复杂度与可维护性挑战。通过建立系统化的理论框架和实践模式，开发者能够更高效地构建可靠的系统。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 方案 A | 通用、稳健 | 可能非最优 | 大多数场景 |
| 方案 B | 针对性强 | 适用范围窄 | 特定需求 |

### 2.3 与相关技术的对比

与其他相关技术对比，AI Agent 基础设施 在特定场景下提供了独特的权衡优势。

## 三、对比分析

| 维度 | MCP 协议 | A2A 协议 | 直接 Function Calling |
|------|---------|---------|----------------------|
| 交互范围 | 模型 ↔ 工具/资源 | Agent ↔ Agent | 单次请求 ↔ 工具 |
| 协议层级 | 应用层（stdio/SSE/HTTP） | 应用层（HTTP/JSON-RPC） | 厂商 API 扩展 |
| 生态开放度 | 开放标准（Anthropic 主导） | 开放标准（Google 主导） | 封闭（各 LLM 厂商） |
| 发现机制 | 动态 tools/resources 协商 | Agent Card 元数据 | 静态 JSON Schema |
| 可组合性 | 高（多 Server 组合） | 高（多 Agent 协作） | 低（单会话绑定） |
| JS/TS 成熟度 | SDK 稳定 | 实验阶段 | 成熟（OpenAI/Anthropic SDK） |

## 四、实践映射

### 4.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 AI Agent 基础设施 核心机制的理解，并观察不同实现选择带来的行为差异。

### 4.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| AI Agent 基础设施 很简单无需学习 | 深入理解能避免隐蔽 bug 和性能陷阱 |
| 理论脱离实际 | 理论指导实践中的架构决策 |

### 4.3 代码示例

#### Agent 基础设施编排器（MCP + A2A 混合）

```typescript
interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: unknown) => Promise<unknown>;
}

class AgentInfraOrchestrator {
  private mcpTools = new Map<string, AgentTool>();
  private agentRegistry = new Map<string, { url: string; capabilities: string[] }>();

  registerMcpTool(tool: AgentTool) {
    this.mcpTools.set(tool.name, tool);
  }

  registerAgent(id: string, meta: { url: string; capabilities: string[] }) {
    this.agentRegistry.set(id, meta);
  }

  async dispatch(intent: string, args: unknown) {
    // 优先本地 MCP 工具
    if (this.mcpTools.has(intent)) {
      return this.mcpTools.get(intent)!.execute(args);
    }
    // 否则委托给其他 Agent（A2A）
    for (const [id, meta] of this.agentRegistry) {
      if (meta.capabilities.includes(intent)) {
        return fetch(`${meta.url}/tasks/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: crypto.randomUUID(), message: { role: 'user', parts: [{ text: JSON.stringify(args) }] } }),
        }).then((r) => r.json());
      }
    }
    throw new Error(`No handler found for intent: ${intent}`);
  }
}
```

### 4.4 扩展阅读

- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google A2A Protocol](https://github.com/google/A2A)
- [Anthropic — Build with Claude](https://docs.anthropic.com/en/docs/build-with-claude)
- [OpenAI Agents SDK](https://github.com/openai/openai-agents-python)
- [LangChain.js](https://js.langchain.com/)
- `30-knowledge-base/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
