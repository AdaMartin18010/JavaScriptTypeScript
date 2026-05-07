# 04. RAG 架构实战

## 什么是 RAG？

**R**etrieval **A**ugmented **G**eneration —— 检索增强生成。将外部知识注入 LLM 上下文，解决「幻觉」和「知识时效性」问题。

```
用户查询 → Embedding → Vector Search → 相关文档 → LLM Prompt → 回答
```

## 技术栈

| 组件 | 选项 |
|------|------|
| **Embedding** | OpenAI text-embedding-3, Cohere, local (ollama) |
| **Vector DB** | Pinecone, Weaviate, Chroma, pgvector |
| **分块策略** | 固定大小、语义分块、递归分块 |
| **重排序** | Cohere Rerank, Cross-encoder |

## 完整实现

### 1. 文档摄入

```typescript
// lib/rag/ingest.ts
import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import { db } from '../db';
import { documents } from '../db/schema';

export async function ingestDocument(content: string, metadata: Record<string, any>) {
  // 分块
  const chunks = chunkText(content, { size: 500, overlap: 50 });

  for (const chunk of chunks) {
    // 生成 Embedding
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: chunk,
    });

    // 存储
    await db.insert(documents).values({
      content: chunk,
      embedding,
      metadata,
    });
  }
}
```

### 2. 检索

```typescript
// lib/rag/retrieve.ts
import { cosineDistance } from 'drizzle-orm';

export async function retrieveRelevant(query: string, limit = 5) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: query,
  });

  const similarity = sql<number>`1 - (${cosineDistance(documents.embedding, embedding)})`;

  return db.select({
    content: documents.content,
    similarity,
  })
  .from(documents)
  .orderBy(desc(similarity))
  .limit(limit);
}
```

### 3. 生成

```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  const { messages } = await req.json();
  const userQuery = messages[messages.length - 1].content;

  // 检索相关上下文
  const docs = await retrieveRelevant(userQuery);
  const context = docs.map(d => d.content).join('\n\n');

  // 构建增强提示
  const result = streamText({
    model: openai('gpt-4o'),
    system: `基于以下上下文回答问题。如果上下文中没有答案，请说"我不知道"。\n\n${context}`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

## 分块策略对比

| 策略 | 优点 | 缺点 |
|------|------|------|
| 固定大小 (500 tokens) | 简单、均匀 | 可能切断语义 |
| 语义分块 | 保留完整语义 | 需要额外模型 |
| 递归分块 | 多层次检索 | 复杂度较高 |

## 评估 RAG 效果

```typescript
// 简单评估框架
async function evaluateRag(testQuestions: { q: string; expected: string }[]) {
  for (const { q, expected } of testQuestions) {
    const docs = await retrieveRelevant(q);
    const answer = await generateAnswer(q, docs);

    // 语义相似度评估
    const score = await semanticSimilarity(answer, expected);
    console.log(`Q: ${q}\nScore: ${score}\n`);
  }
}
```

## 延伸阅读

- [RAG Survey Paper](https://arxiv.org/abs/2312.10997)
- [LangChain RAG Tutorial](https://js.langchain.com/docs/tutorials/rag/)
