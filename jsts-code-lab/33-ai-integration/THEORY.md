# AI 集成理论：从 API 调用到智能应用

> **目标读者**：希望将 AI 能力集成到应用的开发者
> **关联文档**：[`docs/categories/33-ai-integration.md`](../../docs/categories/33-ai-integration.md)
> **版本**：2026-04

---

## 1. AI 集成层次

```
L1: 直接 API 调用
  ↓
L2: 提示工程 + 流式处理
  ↓
L3: RAG（检索增强生成）
  ↓
L4: Agent（自主决策 + 工具使用）
  ↓
L5: 多 Agent 协作系统
```

---

## 2. 关键模式

### 2.1 RAG 架构

```
用户提问 → Embedding → 向量检索 → 上下文构建 → LLM → 回答
```

### 2.2 Agent 架构

```
目标 → 规划 → 执行（工具）→ 观察 → ...循环直到完成
```

---

## 3. JS/TS AI 生态

| 层级 | 库 | 用途 |
|------|-----|------|
| **底层** | OpenAI SDK / Anthropic SDK | 直接 API |
| **框架** | LangChain.js / Vercel AI SDK | 抽象层 |
| **Agent** | Mastra / AutoGen | 自主系统 |
| **UI** | shadcn-chat / Vercel Chat | 聊天界面 |

---

## 4. 总结

AI 集成不是简单的 API 调用，而是**重新设计应用的人机交互层**。

---

## 参考资源

- [Vercel AI SDK](https://sdk.vercel.ai/)
- [LangChain.js](https://js.langchain.com/)
- [OpenAI API](https://platform.openai.com/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `ai-sdk-patterns.ts`
- `embedding-pipeline.ts`
- `index.ts`
- `llm-gateway.ts`
- `prompt-engineering.ts`
- `streaming-handler.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
