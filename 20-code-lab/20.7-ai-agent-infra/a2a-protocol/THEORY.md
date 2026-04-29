# A2A 协议

> **定位**：`20-code-lab/20.7-ai-agent-infra/a2a-protocol`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决 AI Agent 间互操作的标准化通信问题。通过 A2A 协议实现跨平台、跨厂商的 Agent 协作。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Agent Card | 描述 Agent 能力与端点的元数据 | agent-card.json |
| Task | 跨 Agent 请求的工作单元 | task-protocol.ts |

---

## 二、设计原理

### 2.1 为什么存在

AI Agent 生态正在快速增长，但缺乏统一的互操作标准。A2A 协议定义了 Agent 发现、能力协商和任务协作的标准，是开放 Agent 网络的基础。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| A2A 标准 | 跨厂商互操作 | 生态初期 | 多 Agent 系统 |
| 私有协议 | 完全可控 | 孤岛化 | 封闭生态 |

### 2.3 与相关技术的对比

与私有 API 对比：标准化降低集成成本，私有 API 更灵活可控。

## 三、对比分析

| 维度 | A2A 协议 | MCP 协议 | 私有 API |
|------|---------|---------|---------|
| 定位 | Agent-to-Agent 互操作 | 模型-工具上下文连接 | 自定义集成 |
| 传输层 | HTTP/JSON-RPC | stdio / SSE / HTTP | 任意 |
| 发现机制 | Agent Card JSON | Tool/Resource 清单 | 手动配置 |
| 安全模型 | OAuth 2.0 / 委托身份 | 本地/服务器可控 | 自定义 |
| 生态阶段 | 早期（Google 主导） | 成长期（Anthropic 主导） | 成熟但封闭 |
| JS/TS 支持 | 实验 SDK | 官方 SDK（@modelcontextprotocol/sdk） | 取决于实现 |

## 四、实践映射

### 4.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 A2A 协议 核心机制的理解，并观察不同实现选择带来的行为差异。

### 4.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| A2A 替代 HTTP | A2A 建立在 HTTP 之上，是应用层协议 |
| 所有 Agent 都支持 A2A | A2A 需要生态适配，目前覆盖有限 |

### 4.3 代码示例

#### Agent Card 元数据与任务发送

```typescript
interface AgentCard {
  name: string;
  url: string;
  version: string;
  capabilities: { streaming?: boolean; pushNotifications?: boolean };
  authentication?: { schemes: string[] };
}

class A2AClient {
  constructor(private card: AgentCard) {}

  async sendTask(params: { id: string; message: { role: 'user'; parts: [{ text: string }] } }) {
    const res = await fetch(`${this.card.url}/tasks/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  }
}
```

### 4.4 扩展阅读

- [A2A Protocol — Google GitHub](https://github.com/google/A2A)
- [A2A Protocol 规范](https://google.github.io/A2A/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- `20.7-ai-agent-infra/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
