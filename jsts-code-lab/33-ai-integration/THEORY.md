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
