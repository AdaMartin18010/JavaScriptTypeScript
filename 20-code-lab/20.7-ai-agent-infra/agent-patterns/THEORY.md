# Agent 模式

> **定位**：`20-code-lab/20.7-ai-agent-infra/agent-patterns`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 AI Agent 系统的设计模式问题。涵盖 ReAct、Plan-and-Execute 和多 Agent 协作等架构模式。

### 1.2 形式化基础

- **ReAct（Reasoning + Acting）**：将 Thought（推理）、Action（行动）、Observation（观察）交替执行，形成推理-行动闭环。
- **Plan-and-Execute**：先由 LLM 生成完整计划，再按步骤执行，适合需要长期规划的任务。
- **Multi-Agent**：多个专用 Agent 通过消息传递协作，模拟组织分工，提升复杂任务的可扩展性。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| ReAct | 推理与行动交替的循环模式 | react-pattern.ts |
| 工具调用 | LLM 与外部函数的接口约定 | tool-calling.ts |
| Agent 记忆 | 短期上下文与长期向量记忆的结合 | agent-memory.ts |

---

## 二、设计原理

### 2.1 为什么存在

LLM 的自主能力需要通过结构化的模式来引导。Agent 模式将推理、规划和工具调用组织为可复用的架构，提升 AI 系统的可控性和可靠性。

### 2.2 模式对比

| 模式 | 核心思想 | 优点 | 缺点 | 适用场景 |
|------|---------|------|------|---------|
| ReAct | 推理与行动交替，边想边做 | 推理透明、可解释、可纠错 | 延迟高、token 消耗大 | 复杂决策、工具链调用 |
| Plan-and-Execute | 先规划完整步骤，再执行 | 计划全局最优、减少重复推理 | 计划僵化、难适应环境变化 | 确定性任务（数据分析、报告生成）|
| Multi-Agent | 多角色分工协作 | 模块化、可扩展、容错性高 | 通信开销大、协调复杂 | 软件开发、研究助理、游戏 NPC |
| Reflexion | 自我反思与迭代改进 | 可从错误中学习 | 额外轮次、成本增加 | 代码生成、数学证明 |

### 2.3 与相关技术的对比

与硬编码流程对比：Agent 模式提升适应性，硬编码更确定和高效。与单纯 Prompt Engineering 对比：Agent 模式引入结构化的控制流和工具接口，使 LLM 行为更可预测。

---

## 三、实践映射

### 3.1 从理论到代码

以下是 **ReAct Agent 循环** 的 TypeScript 简化实现：

```typescript
// agent-loop.ts
// ReAct 风格 Agent：Thought -> Action -> Observation 循环

interface Tool {
  name: string;
  description: string;
  run(input: string): string;
}

interface Step {
  thought: string;
  action: string;
  observation: string;
}

class ReActAgent {
  private tools: Map<string, Tool>;
  private maxSteps = 5;

  constructor(tools: Tool[]) {
    this.tools = new Map(tools.map(t => [t.name, t]));
  }

  async run(task: string, llm: (prompt: string) => Promise<string>): Promise<string> {
    const history: Step[] = [];
    let prompt = this.buildPrompt(task, history);

    for (let i = 0; i < this.maxSteps; i++) {
      const response = await llm(prompt);
      const parsed = this.parse(response);

      if (parsed.finish) {
        return parsed.finish;
      }

      const tool = this.tools.get(parsed.action);
      const observation = tool
        ? tool.run(parsed.actionInput)
        : `Error: tool "${parsed.action}" not found.`;

      history.push({
        thought: parsed.thought,
        action: `${parsed.action}[${parsed.actionInput}]`,
        observation,
      });

      console.log(`Step ${i + 1}:`);
      console.log('  Thought:', parsed.thought);
      console.log('  Action:', parsed.action, parsed.actionInput);
      console.log('  Observation:', observation);

      prompt = this.buildPrompt(task, history);
    }

    return 'Max steps reached.';
  }

  private buildPrompt(task: string, history: Step[]): string {
    let p = `You are a helpful assistant. Solve the following task using tools.\nTask: ${task}\n`;
    if (history.length) {
      p += '\nPrevious steps:\n';
      for (const s of history) {
        p += `Thought: ${s.thought}\nAction: ${s.action}\nObservation: ${s.observation}\n`;
      }
    }
    p += '\nRespond in format:\nThought: <reasoning>\nAction: <tool_name>\nAction Input: <input>\nOR\nFinish: <final_answer>';
    return p;
  }

  private parse(text: string) {
    const thought = text.match(/Thought:\s*(.+)/)?.[1]?.trim() || '';
    const action = text.match(/Action:\s*(\S+)/)?.[1]?.trim() || '';
    const actionInput = text.match(/Action Input:\s*(.+)/)?.[1]?.trim() || '';
    const finish = text.match(/Finish:\s*(.+)/s)?.[1]?.trim();
    return { thought, action, actionInput, finish };
  }
}

// 可运行示例（使用模拟 LLM）
const tools: Tool[] = [
  {
    name: 'search',
    description: 'Search the web',
    run: (q) => `Results for "${q}": Eiffel Tower height = 330m`,
  },
  {
    name: 'calculator',
    description: 'Calculate expressions',
    run: (expr) => {
      try {
        // eslint-disable-next-line no-eval
        return String(eval(expr));
      } catch { return 'Error'; }
    },
  },
];

const agent = new ReActAgent(tools);

// 模拟 LLM：根据提示返回固定响应
const mockLLM = async (prompt: string) => {
  if (prompt.includes('Eiffel Tower')) {
    if (prompt.includes('Previous steps')) {
      return 'Finish: The Eiffel Tower is 330 meters tall, which is 1082.68 feet.';
    }
    return 'Thought: I need to find the height of the Eiffel Tower.\nAction: search\nAction Input: Eiffel Tower height';
  }
  return 'Finish: I do not know.';
};

agent.run('How tall is the Eiffel Tower in feet?', mockLLM).then(console.log);
```

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Agent 模式保证正确结果 | 模式提升可控性，不消除模型幻觉；需配合人工审核 |
| 越复杂的模式越好 | 简单任务使用简单模式降低延迟和成本 |
| Multi-Agent 必然优于单 Agent | 通信开销和协调失败可能降低整体性能 |
| ReAct 只适用于聊天 | ReAct 可用于任何需要工具调用的 LLM 工作流（如代码 agent） |

### 3.3 扩展阅读

- [ReAct: Synergizing Reasoning and Acting in Language Models — arXiv](https://arxiv.org/abs/2210.03629)
- [LangChain Agents — Concepts](https://python.langchain.com/docs/concepts/agents/)
- [AutoGen: Multi-Agent Conversation Framework — Microsoft](https://microsoft.github.io/autogen/)
- [Plan-and-Solve Prompting — arXiv](https://arxiv.org/abs/2305.04091)
- [Reflexion: Self-Reflective Agents — arXiv](https://arxiv.org/abs/2303.11366)
- `20.7-ai-agent-infra/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
