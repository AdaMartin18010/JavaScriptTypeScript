# 搜索引擎

> JavaScript/TypeScript 应用搜索方案选型。

---

## 方案对比

| 维度 | Elasticsearch | Typesense | Meilisearch | Algolia |
|------|---------------|-----------|-------------|---------|
| **部署模式** | 自托管 / Elastic Cloud | 自托管 / Typesense Cloud | 自托管 / Meilisearch Cloud | 全托管 SaaS |
| **开源协议** | SSPL / Elastic License | GPL-3 | MIT | 闭源 |
| **查询语言** | Query DSL (JSON) | 类 DSL / 过滤语法 | 简单搜索参数 | REST API |
| **Typo 容错** | 配置实现 | 开箱即用 | 开箱即用 | 开箱即用 |
| **多租户** | 索引隔离 | 集合隔离 | 租户令牌 (API Key) | App ID / Index 隔离 |
| **同义词/分面** | 强大聚合 / Facet | 支持 | 支持 | 支持 |
| **实时索引延迟** | 近实时（1s） | 毫秒级 | 毫秒级 | 毫秒级 |
| **SDK 生态** | 极丰富 | 丰富 | 丰富 | 极丰富 |
| **适用规模** | PB 级日志 / 企业搜索 | 中小规模 | 中小规模 | 任何规模（按量计费） |
| **2026 状态** | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 | ✅ 活跃 |

---

## 代码示例：Meilisearch + Node.js

```typescript
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: 'http://localhost:7700',
  apiKey: 'masterKey',
});

// 创建索引并配置可搜索字段
const index = client.index('products');

await index.updateSettings({
  searchableAttributes: ['title', 'description', 'brand'],
  filterableAttributes: ['category', 'price', 'inStock'],
  sortableAttributes: ['price', 'createdAt'],
  typoTolerance: {
    enabled: true,
    minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
  },
});

// 添加文档
await index.addDocuments([
  { id: 1, title: 'Wireless Headphones', category: 'Audio', price: 199, inStock: true },
  { id: 2, title: 'USB-C Cable', category: 'Accessories', price: 15, inStock: false },
]);

// 搜索（自动 typo 容错、高亮、过滤）
const results = await index.search('headphone', {
  filter: ['price < 300', 'inStock = true'],
  sort: ['price:asc'],
  attributesToHighlight: ['title'],
});

console.log(results.hits);
```

## 代码示例：Elasticsearch + Node.js

```typescript
import { Client } from '@elastic/elasticsearch';

const client = new Client({ node: 'http://localhost:9200' });

// 创建索引并定义映射
await client.indices.create({
  index: 'articles',
  body: {
    mappings: {
      properties: {
        title: { type: 'text', analyzer: 'standard' },
        tags: { type: 'keyword' },
        publishedAt: { type: 'date' },
        views: { type: 'integer' },
      },
    },
  },
});

// 索引文档
await client.index({
  index: 'articles',
  id: '1',
  document: {
    title: 'Advanced TypeScript Patterns',
    tags: ['typescript', 'patterns'],
    publishedAt: new Date().toISOString(),
    views: 1200,
  },
});

// 布尔查询 + 聚合
const result = await client.search({
  index: 'articles',
  body: {
    query: {
      bool: {
        must: [{ match: { title: 'typescript' } }],
        filter: [{ range: { views: { gte: 1000 } } }],
      },
    },
    aggs: {
      tags_distribution: { terms: { field: 'tags', size: 10 } },
    },
    highlight: {
      fields: { title: {} },
    },
  },
});

console.log(result.hits.hits);
console.log(result.aggregations?.tags_distribution);
```

## 代码示例：Typesense + Node.js

```typescript
import Typesense from 'typesense';

const client = new Typesense.Client({
  nodes: [{ host: 'localhost', port: 8108, protocol: 'http' }],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
});

// 创建集合（schema 必须先定义）
await client.collections().create({
  name: 'products',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'price', type: 'float', facet: true, sort: true },
    { name: 'category', type: 'string', facet: true },
  ],
});

// 导入文档
await client.collections('products').documents().import([
  { title: 'Mechanical Keyboard', price: 149.99, category: 'Electronics' },
  { title: 'Ergonomic Mouse', price: 79.99, category: 'Electronics' },
]);

// 搜索 + 分面 + 排序
const results = await client.collections('products').documents().search({
  q: 'keyboard',
  query_by: 'title',
  facet_by: 'category',
  sort_by: 'price:asc',
});

console.log(results.hits);
console.log(results.facet_counts);
```

---

## 选型建议

| 场景 | 推荐方案 |
|------|----------|
| 站内搜索 / 轻量应用 | Meilisearch / Typesense |
| 电商产品搜索 | Algolia / Typesense |
| 日志/文档/大数据搜索 | Elasticsearch |
| 预算敏感 + 需要托管 | Meilisearch Cloud / Typesense Cloud |
| 无运维 + 快速上线 | Algolia |

---

## 权威参考链接

- [Elasticsearch 官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [Elasticsearch JS Client](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/index.html)
- [Typesense 官方文档](https://typesense.org/docs/)
- [Typesense JS Client](https://github.com/typesense/typesense-js)
- [Meilisearch 官方文档](https://www.meilisearch.com/docs)
- [Meilisearch JS Client](https://github.com/meilisearch/meilisearch-js)
- [Algolia 官方文档](https://www.algolia.com/doc/)
- [Algolia InstantSearch.js](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/)
- [Meilisearch GitHub](https://github.com/meilisearch/meilisearch)
- [Typesense GitHub](https://github.com/typesense/typesense)
- [Comparison: Meilisearch vs Typesense vs Elasticsearch](https://typesense.org/typesense-vs-algolia-vs-elasticsearch-vs-meilisearch/) — Typesense 官方横向对比

---

*最后更新: 2026-04-29*
