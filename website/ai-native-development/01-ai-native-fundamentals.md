# 01. AI-Native 开发范式

## 范式转变

AI-Native 开发不是简单的「API 调用」，而是软件工程范式的根本转变：

```
传统软件: Input → [确定性代码] → Output
          规则明确，结果可预测

AI-Native: Input → [LLM 推理] → Output
            概率性输出，需要容错设计
```

## 核心原则

### 1. 确定性兜底 (Deterministic Fallback)

```typescript
async function classifyIntent(userInput: string): Promise<string> {
  // 先尝试确定性匹配
  const keywords = {
    'order': ['下单', '购买', 'buy'],
    'refund': ['退款', '退货', 'return'],
  };

  for (const [intent, words] of Object.entries(keywords)) {
    if (words.some(w => userInput.includes(w))) return intent;
  }

  // 兜底：LLM 推理
  const result = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: `分类意图: ${userInput}` }],
    temperature: 0,
  });

  return result.choices[0].message.content || 'unknown';
}
```

### 2. 结构化输出 (Structured Output)

```typescript
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const ExtractSchema = z.object({
  name: z.string(),
  date: z.string(),
  items: z.array(z.object({
    product: z.string(),
    quantity: z.number(),
  })),
});

const completion = await openai.beta.chat.completions.parse({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: emailText }],
  response_format: zodResponseFormat(ExtractSchema, 'extract'),
});

const data = completion.choices[0].message.parsed; // 类型安全
```

### 3. 上下文管理

```typescript
// Token 预算管理
const MAX_TOKENS = 4000;

function buildMessages(userQuery: string, history: Message[]) {
  const systemPrompt = { role: 'system', content: 'You are a helpful assistant.' };

  // 裁剪历史，保留 token 预算
  const recentHistory = history.slice(-10);

  // 添加 RAG 上下文
  const relevantDocs = await retrieveDocuments(userQuery);
  const context = relevantDocs.map(d => d.content).join('\n\n');

  return [
    systemPrompt,
    { role: 'user', content: `Context:\n${context}\n\nQuery: ${userQuery}` },
    ...recentHistory,
  ];
}
```

## AI-Native 应用架构

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   用户界面   │────▶│  AI SDK /    │────▶│   LLM API   │
│ (Next.js)   │◀────│  Orchestrator│◀────│ (OpenAI等)  │
└─────────────┘     └──────┬───────┘     └─────────────┘
                           │
                    ┌──────▼───────┐
                    │  Vector DB   │
                    │  (RAG)       │
                    └──────────────┘
```

## 常见反模式

| ❌ 反模式 | ✅ 正确做法 |
|----------|-----------|
| 把所有逻辑交给 LLM | 确定性逻辑用代码，模糊逻辑用 LLM |
| 忽略 Token 成本 | 监控并优化上下文长度 |
| 直接信任 LLM 输出 | 验证、消毒、兜底 |
| 同步阻塞调用 | 流式输出 + 乐观更新 |

## 延伸阅读

- [Building LLM Applications](https://www.oreilly.com/library/view/building-llm-apps/9781098150570/)
- [Patterns for Building LLM Systems](https://eugeneyan.com/writing/llm-patterns/)
