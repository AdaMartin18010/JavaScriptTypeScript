# 03. AI 流式 UI 实现

## 流式输出的价值

| 方案 | 首字延迟 | 用户体验 |
|------|----------|----------|
| 同步等待 | 2-5s | ❌ 空白等待 |
| 流式输出 | 50-200ms | ✅ 即时反馈 |

## Vercel AI SDK 流式模式

### 文本流 (Text Stream)

```tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="chat-container">
      {/* 消息列表 */}
      <div className="messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            {/* 流式内容自动增量渲染 */}
            {message.parts?.map((part, i) => {
              if (part.type === 'text') {
                return <span key={i}>{part.text}</span>;
              }
              if (part.type === 'tool-invocation') {
                return <ToolCall key={i} tool={part.toolInvocation} />;
              }
            }) || message.content}
          </div>
        ))}

        {/* 加载指示器 */}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="loading-dots">...</div>
        )}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

### 对象流 (Object Stream)

```typescript
// 流式结构化数据
import { streamObject } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = streamObject({
    model: openai('gpt-4o'),
    schema: z.object({
      title: z.string(),
      steps: z.array(z.object({
        description: z.string(),
        code: z.string(),
      })),
    }),
    prompt,
  });

  return result.toTextStreamResponse();
}
```

```tsx
// 客户端增量渲染对象
import { experimental_useObject as useObject } from '@ai-sdk/react';

export default function Generator() {
  const { object, submit } = useObject({
    api: '/api/generate',
    schema: z.object({
      title: z.string(),
      steps: z.array(z.object({ description: z.string(), code: z.string() })),
    }),
  });

  return (
    <div>
      <button onClick={() => submit('Create a todo app')}>
        Generate
      </button>

      {/* 对象字段逐步出现 */}
      {object?.title && <h2>{object.title}</h2>}
      {object?.steps?.map((step, i) => (
        <div key={i}>
          <p>{step?.description}</p>
          {step?.code && <pre>{step.code}</pre>}
        </div>
      ))}
    </div>
  );
}
```

## 乐观更新模式

```tsx
const { messages, append, isLoading } = useChat();

async function handleQuickReply(text: string) {
  // 乐观更新：立即显示用户消息
  const userMessage = { id: Date.now().toString(), role: 'user', content: text };

  // 实际发送
  await append({ role: 'user', content: text });
}
```

## 延伸阅读

- [Vercel AI SDK UI Guide](https://sdk.vercel.ai/docs/ai-sdk-ui/overview)
- [Streaming with React Server Components](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
