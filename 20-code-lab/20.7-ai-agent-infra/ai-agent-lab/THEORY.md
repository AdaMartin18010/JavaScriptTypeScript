# AI Agent 实验室 — 理论基础

> **对齐版本**：MCP 1.0 (2026 初) | A2A Protocol (Google, 2025) | Claude 4 / GPT-5.4
> **权威来源**：modelcontextprotocol.io、DigitalApplied 2026-03、arXiv 2604.05969、o-mega.ai 2026-02
> **最后更新**：2026-04

---

## 1. Agent 的定义与架构演进

AI Agent 是一个能够**感知环境、做出决策并执行行动**的自主系统。与单次 LLM 调用的根本区别：

| 维度 | LLM 调用 | AI Agent |
|------|---------|----------|
| **交互模式** | 请求-响应 | 感知 → 推理 → 行动 → 观察 → 循环 |
| **状态** | 无状态 | 维护工作记忆、短期/长期记忆 |
| **工具使用** | 无 | 动态发现、调用、组合外部工具 |
| **规划** | 无 | 将复杂目标分解为可执行子任务 |
| **自主性** | 被动响应 | 可独立运行数小时（Claude Code 可达 14.5h） |

2026 年的关键转变：Agent 从"实验性插件"进化为**企业工作流的基础设施层**。

---

## 2. Agent 架构模式

### 2.1 ReAct (Reasoning + Acting)

```
思考 → 行动（调用工具）→ 观察（获取结果）→ 思考 → ...
```

每一步的推理都基于前一步的执行反馈，形成闭环问题解决链。这是当前最广泛实现的 Agent 核心循环。

### 2.2 Plan-and-Solve

1. **规划阶段**：LLM 生成完整执行计划（步骤列表 + 依赖关系）
2. **执行阶段**：按拓扑顺序执行，收集中间结果
3. **验证阶段**：检查结果是否满足目标，必要时重新规划（re-planning）

### 2.3 Multi-Agent 协作

| 模式 | 描述 | 适用场景 |
|------|------|---------|
| **分工模式** | 不同 Agent 负责不同子任务（研究→写作→审校）| 内容生产、代码审查 |
| **辩论模式** | 多个 Agent 对同一问题提出不同观点，综合最优解 | 决策支持、风险评估 |
| **层级模式** | 主管 Agent 分配任务，工作 Agent 执行并汇报 | 项目管理、复杂系统运维 |
| **市场模式** | Agent 发布需求/能力，动态匹配 | 资源调度、供应链 |

---

## 3. MCP (Model Context Protocol) — 2026 生态现状

MCP 是 Anthropic 于 2024-11 开源的标准，定义了 LLM 与外部工具/资源的标准接口。2026 年已成为**事实上的 Agent 工具连接标准**。

### 3.1 核心架构

```
┌─────────────────────────────────────────────┐
│              Agent Runtime                   │
│   (Claude Code / Cursor / VS Code Copilot)   │
│                    │                         │
│              MCP Client                      │
│         (JSON-RPC 2.0 over stdio/SSE)        │
└────────────────────┼────────────────────────┘
                     │
    ┌────────────────┼────────────────┐
    │                │                │
┌───▼────┐    ┌──────▼──────┐   ┌────▼─────┐
│Filesystem│   │ PostgreSQL  │   │  GitHub  │
│  Server  │   │   Server    │   │  Server  │
└─────────┘    └─────────────┘   └──────────┘
```

**四大原语**：

- **Tools**：JSON Schema 描述的函数，Agent 按名调用
- **Resources**：只读数据源（文件、数据库记录、API 响应）
- **Prompts**：可复用的提示模板
- **Sampling**：Server 请求 Client 执行 LLM 推理（双向通信）

### 3.2 2026 生态规模

| 指标 | 数据 | 时间 |
|------|------|------|
| **月 SDK 下载量** | **9700 万** (Python + TypeScript) | 2026-02 |
| **公开 MCP Servers** | **10,000+** | 2026-03 |
| **注册 Tools** | **177,000+** | 2026-02 |
| **主要支持平台** | Claude, ChatGPT, Copilot, Gemini, Cursor, VS Code | 2026-04 |
| **标准化组织** | Linux Foundation Agentic AI Foundation (AAIF) | 2025-12 |

> *"MCP has rapidly become the de facto protocol for connecting AI models to tools, data, and applications."* — o-mega.ai, 2026-02

### 3.3 为什么 MCP 胜出

| 传统集成 | MCP 标准 |
|---------|---------|
| 每个工具为每个 LLM 单独适配 | Server 实现一次，所有 Client 通用 |
| 碎片化认证、错误处理、发现逻辑 | 协议层内置安全、审计、发现机制 |
| 供应商锁定 | 自由切换底层模型，无需重写集成 |

**类比**：MCP 是 AI 时代的 **USB-C**——标准化连接器，设备（工具）和主机（Agent）各做一端。

---

## 4. A2A (Agent-to-Agent) 协议

Google 提出的 A2A 协议用于**不同 Agent 之间的协作**，与 MCP 形成互补：

| 协议 | 层级 | 解决的问题 |
|------|------|-----------|
| **MCP** | Agent ↔ Tool | 单个 Agent 如何发现和使用外部能力 |
| **A2A** | Agent ↔ Agent | 多个独立 Agent 如何协商、分配、协作完成任务 |

**A2A 核心概念**：

- **Agent Card**：JSON 描述 Agent 的能力、端点、认证方式（类似"名片"）
- **Task**：工作单元，生命周期：提交 → 工作中 → 输入请求 → 完成/失败
- **Artifact**：Agent 产出的结构化结果，可传递给其他 Agent 继续处理

> 2026 年状态：A2A 仍处于早期标准化阶段，MCP 已进入大规模生产部署。

---

## 5. 记忆管理系统

| 记忆类型 | 存储介质 | 生命周期 | 用途 | 技术实现 |
|---------|---------|---------|------|---------|
| **工作记忆** | 上下文窗口 | 单次对话 | 当前任务上下文 | Prompt engineering |
| **短期记忆** | 向量数据库 | 会话级 | 相关历史检索 | RAG (Pinecone, Weaviate, pgvector) |
| **长期记忆** | 图数据库/关系库 | 持久 | 用户偏好、知识积累 | Neo4j, PostgreSQL + 嵌入索引 |
| **Episodic** | 日志/追踪系统 | 持久 | 经验回放、反思学习 | LangSmith, OpenTelemetry |
| **程序记忆** | 代码/配置 | 版本控制 | 技能、工作流定义 | MCP Tools, Workflows |

---

## 6. Agent 安全威胁模型

MCP 的快速普及（action tools 从 27% 增至 65%）带来了新的攻击面：

| 威胁类型 | 描述 | 防御措施 |
|---------|------|---------|
| **Tool Poisoning** | 在工具描述中嵌入恶意指令 | 审计工具描述，沙箱执行 |
| **Rug Pulls** | 工具行为在审批后突变 | 版本锁定，行为基线监控 |
| **Cross-Server 数据渗透** | 通过多 Server 组合泄露敏感数据 | 最小权限原则，数据流审计 |
| **权限提升** | 通过工具组合获得更高权限 | 能力隔离，人类在环 (Human-in-the-loop) |
| **Prompt Injection** | 通过工具返回内容劫持 Agent | 输入过滤，输出编码 |

> *"MCP servers sit at the intersection of natural-language reasoning and privileged execution. Securing MCP requires treating these servers as AI-driven control planes, not just another API layer."* — Qualys TotalAI, 2026-03

---

## 7. 主流 Agent 框架对比（2026）

| 框架 | 维护方 | 核心优势 | 适用场景 |
|------|--------|---------|---------|
| **Vercel AI SDK** | Vercel | 流式 UI、RSC 集成、多提供商抽象 | Next.js 全栈 Agent 应用 |
| **LangChain** | LangChain Inc | 生态最丰富，预构建链和工具 | 原型开发、复杂工作流 |
| **CrewAI** | CrewAI Inc | Multi-Agent 编排直观 | 团队协作、研究任务 |
| **Claude Code** | Anthropic | 终端原生，14.5h 自主运行 | 代码库级开发任务 |
| **OpenAI Codex** | OpenAI | GPT-5.3 驱动，深度 IDE 集成 | 软件工程自动化 |
| **Mastra** | Mastra | 类型安全工作流、本地优先 | TypeScript 优先的 Agent 框架 |

---

## 8. 与相邻模块的关系

- **33-ai-integration**: LLM 基础集成（本模块是高级 Agent 架构）
- **92-observability-lab**: Agent 执行过程的追踪与监控（OpenTelemetry + LangSmith）
- **82-edge-ai**: 边缘端 Agent 的推理优化（Wasm + ONNX Runtime）
- **20.6-backend-apis**: Agent 服务的 API 设计（tRPC / Server Actions / SSE 流）

---

## 参考来源

1. **modelcontextprotocol.io** — [MCP Official Introduction](https://modelcontextprotocol.io/docs/getting-started/intro) (2026-04)
2. **DigitalApplied** — [AI Agent Protocol Ecosystem Map 2026](https://www.digitalapplied.com/blog/ai-agent-protocol-ecosystem-map-2026-mcp-a2a-acp-ucp) (2026-03-18)
3. **IoT Digital Twin PLM** — [MCP Architecture Deep Dive 2026](https://iotdigitaltwinplm.com/anthropic-model-context-protocol-mcp-architecture-2026/) (2026-04-22)
4. **arXiv** — [Formal Security Framework for MCP-Based AI Agents](https://arxiv.org/html/2604.05969v1) (2025-11-25)
5. **o-mega.ai** — [Anthropic Ecosystem Complete Guide 2026](https://o-mega.ai/articles/the-anthropic-ecosystem-a-complete-guide-2026) (2026-02-24)
6. **Qualys** — [MCP Servers: The New Shadow IT for AI](https://blog.qualys.com/product-tech/2026/03/19/mcp-servers-shadow-it-ai-qualys-totalai-2026) (2026-03-20)
7. **Stormy.ai** — [Claude + HubSpot Breeze MCP Integration](https://stormy.ai/blog/anthropic-claude-hubspot-breeze-mcp-integration-guide) (2026-03-17)
