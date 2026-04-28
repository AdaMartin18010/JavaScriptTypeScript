# NLP 工程理论：从词向量到大语言模型

> **目标读者**：AI 应用开发者、关注 LLM 集成的工程师
> **关联文档**：``30-knowledge-base/30.2-categories/ai-integration.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,200 字

---

## 1. NLP 技术栈演进

### 1.1 四代范式

| 世代 | 方法 | 代表 | 特点 |
|------|------|------|------|
| **规则时代** | 正则、词典、语法规则 | 早期聊天机器人 | 硬编码、维护困难 |
| **统计时代** | 机器学习、特征工程 | TF-IDF、SVM | 需要大量标注数据 |
| **神经网络** | RNN、LSTM、Word2Vec | seq2seq、Attention | 自动特征学习 |
| **大模型时代** | Transformer、LLM | GPT-4、Claude、Llama | 涌现能力、上下文学习 |

### 1.2 LLM 能力边界

```
上下文窗口:
  GPT-4o: 128K tokens
  Claude 3.5: 200K tokens
  Gemini 1.5: 1M tokens

能力层级:
  L1: 文本生成 (摘要、翻译)
  L2: 推理 (数学、逻辑)
  L3: 代码生成 (编程助手)
  L4: 多模态 (文本+图像+音频)
  L5: Agent 自主执行 (规划+工具使用)
```

---

## 2. LLM 集成工程

### 2.1 提示工程 (Prompt Engineering)

**核心原则**：

```markdown
1. 清晰的角色定义
   "你是一位资深 TypeScript 工程师..."

2. 结构化输出要求
   "请按以下 JSON 格式返回: {\"result\": string, \"confidence\": number}"

3. 少样本示例 (Few-shot)
   "输入: X → 输出: Y"
   "输入: Z → 输出: W"
   "输入: [新输入] → 输出: ?"

4. 链式思考 (Chain-of-Thought)
   "让我们一步步思考..."
```

### 2.2 RAG（检索增强生成）

```
用户提问
  ↓
Embedding 模型 → 向量查询
  ↓
知识库 (向量数据库)
  ↓
检索相关文档片段
  ↓
LLM (上下文 + 检索结果) → 生成回答
```

**向量数据库选型**：

| 数据库 | 特点 | 适用 |
|--------|------|------|
| **Pinecone** | 托管、易用 | 快速原型 |
| **Weaviate** | GraphQL 接口 | 复杂查询 |
| **Qdrant** | Rust 编写、高性能 | 自托管 |
| **pgvector** | PostgreSQL 扩展 | 已有 PG 基础设施 |
| **Chroma** | 轻量、本地优先 | 开发测试 |

---

## 3. 工程化实践

### 3.1 流式响应处理

```typescript
const stream = await openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: '解释 Promise' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

### 3.2 成本与性能优化

| 策略 | 效果 | 实现 |
|------|------|------|
| **缓存** | 减少 30-50% 调用 | 相同/相似查询缓存 |
| **降级** | 保证可用性 | GPT-4 失败 → GPT-3.5 |
| **批处理** | 降低 per-token 成本 | 合并短请求 |
| **模型路由** | 平衡成本与质量 | 简单任务 → 轻量模型 |

---

## 4. 反模式

### 反模式 1：过度依赖 LLM

❌ 所有逻辑都通过 LLM 实现。
✅ 确定性逻辑用代码，模糊性任务用 LLM。

### 反模式 2：忽视 Token 限制

❌ 一次性传入 10 万 token 的上下文。
✅ 使用 RAG 或摘要压缩上下文。

### 反模式 3：不验证 LLM 输出

❌ 直接执行 LLM 生成的 SQL/代码。
✅ 沙箱执行、人工审查、单元测试。

---

## 5. 总结

LLM 正在重塑软件开发的**人机交互层**。

**关键趋势**：
- 从"调用 API"到"设计 Agent 工作流"
- 从"通用模型"到"领域微调 + RAG"
- 从"文本生成"到"多模态理解 + 工具使用"

---

## 参考资源

- [OpenAI API 文档](https://platform.openai.com/docs)
- [LangChain 文档](https://js.langchain.com/)
- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [Hugging Face](https://huggingface.co/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `bpe-tokenizer.ts`
- `index.ts`
- `named-entity-recognizer.ts`
- `nlp-pipeline.ts`
- `semantic-search.ts`
- `sentiment-analyzer.ts`
- `text-classifier.ts`
- `text-preprocessor.ts`
- `tfidf-vectorizer.ts`
- `word-embedding.ts`

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
