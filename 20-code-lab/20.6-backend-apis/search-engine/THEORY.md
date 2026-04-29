# 搜索引擎理论：从全文检索到向量搜索

> **目标读者**：关注搜索功能的后端工程师、AI 应用开发者
> **关联文档**：`30-knowledge-base/30.2-categories/search-engine.md` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 3,400 字

---

## 1. 搜索技术演进

### 1.1 三代搜索

| 世代 | 技术 | 特点 |
|------|------|------|
| **1.0** | 倒排索引 + TF-IDF | 精确匹配、关键词相关 |
| **2.0** | Elasticsearch / Solr | 分布式、实时、聚合 |
| **3.0** | 向量搜索 + 混合检索 | 语义理解、AI 增强 |

---

## 2. 倒排索引原理

```
文档集合:
  Doc1: "JavaScript 教程"
  Doc2: "TypeScript 进阶"
  Doc3: "JavaScript 性能优化"

倒排索引:
  javascript → [Doc1, Doc3]
  typescript → [Doc2]
  教程      → [Doc1]
  进阶      → [Doc2]
  性能      → [Doc3]
  优化      → [Doc3]
```

### 2.1 手写倒排索引

```typescript
// inverted-index.ts — 简化倒排索引实现
class InvertedIndex {
  private index = new Map<string, Set<number>>();
  private docs: string[] = [];

  addDocument(id: number, text: string) {
    this.docs[id] = text;
    const terms = this.tokenize(text);
    for (const term of terms) {
      if (!this.index.has(term)) this.index.set(term, new Set());
      this.index.get(term)!.add(id);
    }
  }

  search(query: string): Array<{ id: number; text: string; score: number }> {
    const terms = this.tokenize(query);
    const scores = new Map<number, number>();

    for (const term of terms) {
      const docIds = this.index.get(term);
      if (!docIds) continue;
      // TF-IDF 简化: 每个匹配词 +1
      for (const id of docIds) {
        scores.set(id, (scores.get(id) ?? 0) + 1);
      }
    }

    return Array.from(scores.entries())
      .map(([id, score]) => ({ id, text: this.docs[id], score }))
      .sort((a, b) => b.score - a.score);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\s+/).filter(Boolean);
  }
}

const idx = new InvertedIndex();
idx.addDocument(1, 'JavaScript 教程');
idx.addDocument(2, 'TypeScript 进阶');
idx.addDocument(3, 'JavaScript 性能优化');
console.log(idx.search('JavaScript'));
// [{ id: 1, text: 'JavaScript 教程', score: 1 }, { id: 3, text: 'JavaScript 性能优化', score: 1 }]
```

---

## 3. 向量搜索

### 3.1 Embedding + 近似最近邻

```
文本 → Embedding 模型 → 向量 (768-4096 维)
  ↓
向量数据库 (HNSW / IVF)
  ↓
查询向量 → ANN 搜索 → 最相似的文档
```

### 3.2 余弦相似度计算

```typescript
// vector-similarity.ts — 向量相似度基础
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 简化向量索引 (Brute-force，仅适合小规模)
class VectorIndex {
  private vectors: Array<{ id: string; vector: Float32Array; meta: any }> = [];

  add(id: string, vector: Float32Array, meta: any) {
    this.vectors.push({ id, vector, meta });
  }

  search(query: Float32Array, topK: number = 5) {
    return this.vectors
      .map((v) => ({
        id: v.id,
        score: cosineSimilarity(query, v.vector),
        meta: v.meta,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}
```

### 3.3 混合搜索

```typescript
// hybrid-search.ts — 结合关键词搜索和语义搜索
interface HybridSearchResult {
  id: string;
  keywordScore: number;
  vectorScore: number;
  combinedScore: number;
}

function hybridSearch(
  query: string,
  queryVector: Float32Array,
  keywordWeight: number = 0.3,
  vectorWeight: number = 0.7
): HybridSearchResult[] {
  const keywordResults = invertedIndex.search(query); // 见上文
  const vectorResults = vectorIndex.search(queryVector, 20);

  const merged = new Map<string, { keywordScore: number; vectorScore: number }>();

  // 归一化 keyword 分数
  const maxKw = Math.max(...keywordResults.map((r) => r.score), 1);
  for (const r of keywordResults) {
    merged.set(String(r.id), { keywordScore: r.score / maxKw, vectorScore: 0 });
  }

  // 归一化 vector 分数
  const maxVec = Math.max(...vectorResults.map((r) => r.score), 1);
  for (const r of vectorResults) {
    const existing = merged.get(r.id);
    if (existing) {
      existing.vectorScore = r.score / maxVec;
    } else {
      merged.set(r.id, { keywordScore: 0, vectorScore: r.score / maxVec });
    }
  }

  return Array.from(merged.entries())
    .map(([id, scores]) => ({
      id,
      ...scores,
      combinedScore: keywordWeight * scores.keywordScore + vectorWeight * scores.vectorScore,
    }))
    .sort((a, b) => b.combinedScore - a.combinedScore);
}
```

---

## 4. 选型

| 引擎 | 特点 | 适用 |
|------|------|------|
| **Elasticsearch** | 生态最全、聚合强大 | 企业搜索、日志分析 |
| **Typesense** | 轻量、 typo-tolerant | 中小项目、即时搜索 |
| **Meilisearch** | 开发者友好、开箱即用 | 快速集成、电商搜索 |
| **Algolia** | 托管、高可用、全球 CDN | SaaS、移动应用 |
| **Pinecone** | 纯向量、无需调参 | AI 应用、RAG |
| **Milvus** | 开源向量、十亿级规模 | 大规模语义搜索 |
| **pgvector** | PostgreSQL 扩展 | 已有 PG 基础设施 |

---

## 5. 分面搜索与查询扩展

```typescript
// faceted-search.ts — 分面聚合实现
interface FacetResult {
  field: string;
  buckets: Array<{ value: string; count: number }>;
}

function buildFacets(docs: any[], facetFields: string[]): FacetResult[] {
  return facetFields.map((field) => {
    const counts = new Map<string, number>();
    for (const doc of docs) {
      const val = doc[field];
      if (val) counts.set(val, (counts.get(val) ?? 0) + 1);
    }
    return {
      field,
      buckets: Array.from(counts.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    };
  });
}

// 查询扩展: 同义词与拼写纠正
const synonyms: Record<string, string[]> = {
  js: ['javascript'],
  ts: ['typescript'],
};

function expandQuery(query: string): string[] {
  const terms = query.split(/\s+/);
  return terms.flatMap((t) => [t, ...(synonyms[t.toLowerCase()] ?? [])]);
}
```

---

## 6. 总结

现代搜索 = **关键词精确性 + 向量语义性 + 个性化排序**。

---

## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Elasticsearch 文档 | 文档 | [elastic.co/guide](https://www.elastic.co/guide/) |
| Vector Search Guide (Pinecone) | 指南 | [pinecone.io/learn/vector-search](https://www.pinecone.io/learn/vector-search/) |
| Typesense 文档 | 文档 | [typesense.org/docs](https://typesense.org/docs/) |
| Meilisearch 文档 | 文档 | [meilisearch.com/docs](https://www.meilisearch.com/docs) |
| pgvector GitHub | 仓库 | [github.com/pgvector/pgvector](https://github.com/pgvector/pgvector) |
| Milvus 文档 | 文档 | [milvus.io/docs](https://milvus.io/docs) |
| Information Retrieval (Manning) | 书籍 | [nlp.stanford.edu/IR-book](https://nlp.stanford.edu/IR-book/) — 经典教材 |
| HNSW Paper | 论文 | [arxiv.org/abs/1603.09320](https://arxiv.org/abs/1603.09320) |
| BM25 算法详解 | 博客 | [www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables](https://www.elastic.co/blog/practical-bm25-part-2-the-bm25-algorithm-and-its-variables) |
| OpenAI Embeddings Guide | 指南 | [platform.openai.com/docs/guides/embeddings](https://platform.openai.com/docs/guides/embeddings) |

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `faceted-search.ts`
- `full-text-search.ts`
- `index.ts`
- `query-expander.ts`
- `search-implementation.ts`
- `search-ranker.ts`
- `search-suggestions.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **倒排索引模式**：从正排到倒排的空间-时间权衡
2. **组合模式**：分面搜索将多维过滤器组合为树状结构
3. **策略模式**：BM25、TF-IDF、向量相似度作为可替换的评分策略

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 数据结构（哈希表、树）、线性代数基础 |
| 后续进阶 | 多租户搜索隔离、实时索引更新、分布式搜索 |

---

> 📅 理论深化更新：2026-04-29
