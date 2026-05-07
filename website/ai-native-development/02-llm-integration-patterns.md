# 02. LLM 集成模式

## 模式对比

| 模式 | 复杂度 | 控制力 | 适用场景 |
|------|--------|--------|----------|
| **直接 API** | 低 | 高 | 简单查询、原型 |
| **Vercel AI SDK** | 中 | 高 | React/Next.js 应用 |
| **LangChain** | 高 | 中 | 复杂 Pipeline、Agent |
| **LlamaIndex** | 中 | 中 | RAG 优先场景 |

## 模式 1: 直接 API (最简)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateText(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0].message.content;
}
```

## 模式 2: Vercel AI SDK (React 集成)

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    system: 'You are a helpful assistant.',
  });

  return result.toDataStreamResponse();
}
```

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          <strong>{m.role}:</strong> {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

## 模式 3: LangChain (复杂 Pipeline)

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

const model = new ChatOpenAI({ model: 'gpt-4o' });

const prompt = PromptTemplate.fromTemplate(`
  基于以下上下文回答问题：
  {context}

  问题: {question}
`);

const chain = RunnableSequence.from([
  prompt,
  model,
]);

const result = await chain.invoke({
  context: 'TypeScript 是 JavaScript 的超集',
  question: 'TypeScript 是什么?',
});
```

## 模式 4: 工具调用 (Function Calling)

```typescript
import { streamText, tool } from 'ai';
import { z } from 'zod';

const result = streamText({
  model: openai('gpt-4o'),
  tools: {
    weather: tool({
      description: '获取指定城市的天气',
      parameters: z.object({
        city: z.string().describe('城市名称'),
      }),
      execute: async ({ city }) => {
        // 调用真实天气 API
        return fetchWeather(city);
      },
    }),
    calculator: tool({
      description: '计算数学表达式',
      parameters: z.object({
        expression: z.string(),
      }),
      execute: async ({ expression }) => {
        return eval(expression); // 生产环境用安全计算库
      },
    }),
  },
});
```

## 选型建议

| 场景 | 推荐 |
|------|------|
| Next.js 聊天应用 | Vercel AI SDK |
| 复杂数据处理 Pipeline | LangChain |
| 文档问答 (RAG) | LlamaIndex / Vercel AI SDK |
| 快速原型 | 直接 API |
| 多 Agent 协作 | LangGraph |

## 延伸阅读

- [Vercel AI SDK 文档](https://sdk.vercel.ai/docs/introduction)
- [LangChain JS 文档](https://js.langchain.com/docs/introduction/)
