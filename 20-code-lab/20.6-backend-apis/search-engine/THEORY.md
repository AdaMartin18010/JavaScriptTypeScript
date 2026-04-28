# 搜索引擎理论：从全文检索到向量搜索

> **目标读者**：关注搜索功能的后端工程师、AI 应用开发者
> **关联文档**：``30-knowledge-base/30.2-categories/search-engine.md`` (Legacy) [Legacy link]
> **版本**：2026-04
> **字数**：约 2,800 字

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

### 3.2 混合搜索

```typescript
// 结合关键词搜索和语义搜索
const results = await index.search({
  query: '高性能前端框架',
  hybrid: {
    keywordWeight: 0.3,
    vectorWeight: 0.7,
  },
});
```

---

## 4. 选型

| 引擎 | 特点 | 适用 |
|------|------|------|
| **Elasticsearch** | 生态最全 | 企业搜索 |
| **Typesense** | 轻量、易用 | 中小项目 |
| **Meilisearch** | 开发者友好 | 快速集成 |
| **Algolia** | 托管、性能 | SaaS |
| **Pinecone** | 向量专用 | AI 应用 |
| **Milvus** | 开源向量 | 大规模 |

---

## 5. 总结

现代搜索 = **关键词精确性 + 向量语义性 + 个性化排序**。

---

## 参考资源

- [Elasticsearch 文档](https://www.elastic.co/guide/)
- [Vector Search Guide](https://www.pinecone.io/learn/vector-search/)

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
