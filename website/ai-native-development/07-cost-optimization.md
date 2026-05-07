# 07. 成本优化策略

## LLM 成本结构

| 成本项 | 占比 | 优化方向 |
|--------|------|----------|
| Input Tokens | ~70% | 精简 Prompt、缓存 |
| Output Tokens | ~20% | 限制 max_tokens |
| API 调用次数 | ~10% | 批量、缓存 |

## 优化策略

### 1. Prompt 压缩

```typescript
// ❌ 冗余上下文
const context = documents.map(d => d.fullText).join('\n');

// ✅ 关键信息提取
const context = documents
  .map(d => `${d.title}: ${d.summary}`)
  .join('\n');
```

### 2. 缓存响应

```typescript
import { createHash } from 'crypto';

async function cachedGenerate(prompt: string) {
  const key = createHash('sha256').update(prompt).digest('hex');

  // 检查缓存
  const cached = await redis.get(`ai:cache:${key}`);
  if (cached) return JSON.parse(cached);

  // 生成并缓存
  const result = await generate(prompt);
  await redis.setex(`ai:cache:${key}`, 3600, JSON.stringify(result));

  return result;
}
```

### 3. 模型降级策略

```typescript
async function smartGenerate(prompt: string, complexity: 'low' | 'medium' | 'high') {
  const models = {
    low: 'gpt-4o-mini',      // $0.15/M input
    medium: 'gpt-4o',         // $2.50/M input
    high: 'gpt-4o',           // $2.50/M input
  };

  const model = models[complexity];
  return generate(prompt, model);
}

// 自动复杂度判断
async function autoGenerate(prompt: string) {
  const complexity = await classifyComplexity(prompt);
  return smartGenerate(prompt, complexity);
}
```

### 4. 流式 Token 控制

```typescript
const result = streamText({
  model: openai('gpt-4o'),
  messages,
  maxTokens: 500,        // 限制输出长度
  temperature: 0.3,      // 降低随机性，减少重试
});
```

## 成本监控

```typescript
// 中间件记录成本
async function trackCosts(req: Request, model: string, tokens: number) {
  const costPer1K = {
    'gpt-4o': 0.0025,
    'gpt-4o-mini': 0.00015,
    'claude-3-5-sonnet': 0.003,
  };

  const cost = (tokens / 1000) * (costPer1K[model] || 0);

  await db.insert(aiCosts).values({
    model,
    tokens,
    cost,
    timestamp: new Date(),
  });
}
```

## 成本对比 (2025)

| 模型 | Input/1M | Output/1M | 适用场景 |
|------|----------|-----------|----------|
| GPT-4o | $2.50 | $10.00 | 复杂推理 |
| GPT-4o-mini | $0.15 | $0.60 | 日常任务 |
| Claude 3.5 Sonnet | $3.00 | $15.00 | 长上下文 |
| Llama 3.1 405B | $0.50 | $0.50 | 成本敏感 |

## 延伸阅读

- [OpenAI Pricing](https://openai.com/pricing)
- [Vercel AI SDK Cost Tracking](https://sdk.vercel.ai/docs/advanced/cost-tracking)
