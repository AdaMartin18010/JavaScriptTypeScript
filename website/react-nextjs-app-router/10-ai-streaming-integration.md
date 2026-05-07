---
title: 10 AI 流式集成
description: 掌握 Next.js 与 AI SDK 的流式集成：Vercel AI SDK、RAG 架构、流式 LLM 响应、TTFT 优化和边缘推理。
---

# 10 AI 流式集成

> **前置知识**：Next.js App Router、基础 AI 概念
>
> **目标**：能够构建流式 AI 应用，优化首 token 时间

---

## 1. Vercel AI SDK

### 1.1 基础流式响应

```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

```tsx
// app/chat/page.tsx
'use client';

import { useChat } from 'ai/react';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map(m => (
          <div key={m.id} className={`message ${m.role}`}>
            <div className="content">{m.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="输入消息..."
        />
        <button type="submit">发送</button>
      </form>
    </div>
  );
}
```

---

## 2. RAG 架构

### 2.1 检索增强生成

```typescript
// app/api/rag/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';
import { vectorStore } from '@/lib/vector-store';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1];

  // 1. 检索相关文档
  const relevantDocs = await vectorStore.similaritySearch({
    query: lastMessage.content,
    k: 5,
  });

  // 2. 构建增强提示
  const context = relevantDocs.map(d => d.pageContent).join('\n\n');
  const systemPrompt = `基于以下上下文回答问题：\n\n${context}`;

  // 3. 流式生成
  const result = streamText({
    model: openai('gpt-4o'),
    system: systemPrompt,
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
```

---

## 3. TTFT 优化

### 3.1 首 Token 时间优化

```typescript
// 策略 1：预加载模型连接
const model = openai('gpt-4o', {
  // 使用持久连接
  fetch: async (url, options) => {
    return fetch(url, {
      ...options,
      keepalive: true,
    });
  },
});

// 策略 2：边缘部署
export const runtime = 'edge';

// 策略 3：流式 UI
'use client';
import { useChat } from 'ai/react';

export default function OptimizedChat() {
  const { messages, isLoading } = useChat({
    // 乐观更新：立即显示用户消息
    api: '/api/chat',
  });

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {/* 打字机效果 */}
          <StreamedContent content={m.content} isStreaming={m.role === 'assistant' && isLoading} />
        </div>
      ))}
    </div>
  );
}

function StreamedContent({ content, isStreaming }: { content: string; isStreaming: boolean }) {
  return (
    <span className={isStreaming ? 'streaming' : ''}>
      {content}
      {isStreaming && <span className="cursor">▋</span>}
    </span>
  );
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **不处理流中断** | 用户刷新页面导致流中断 | 添加错误边界和重试机制 |
| **上下文过长** | 超过模型 token 限制 | 使用摘要或分块策略 |
| **泄露 API Key** | 在客户端暴露 Key | 通过 Server Action 调用 |

---

## 延伸阅读

- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [RAG Architecture](https://www.pinecone.io/learn/retrieval-augmented-generation/)
