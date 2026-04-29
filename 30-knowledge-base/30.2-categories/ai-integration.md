# AI 集成

> JavaScript/TypeScript 项目中集成 AI 能力的方案与最佳实践。

---

## 核心能力

| 能力 | 方案 | 代表工具 |
|------|------|---------|
| **代码补全** | IDE 插件 | GitHub Copilot, Cursor |
| **文本生成** | LLM API | OpenAI, Anthropic, Gemini |
| **图像生成** | Diffusion API | DALL-E, Midjourney, Stable Diffusion |
| **Embedding** | 向量检索 | OpenAI Embedding, Cohere |
| **Agent 框架** | 工具调用 + 推理 | LangChain, Vercel AI SDK |

## Vercel AI SDK

```typescript
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

const { text } = await generateText({
  model: openai('gpt-4o'),
  prompt: '解释 React Server Components',
})
```

## 最佳实践

1. **流式响应**：使用 `streamText` 提升用户体验
2. **错误处理**：LLM 可能超时或失败，设计降级策略
3. **成本控制**：监控 Token 使用量，设置预算上限
4. **隐私合规**：敏感数据不发送至公共 LLM

---

*最后更新: 2026-04-29*
