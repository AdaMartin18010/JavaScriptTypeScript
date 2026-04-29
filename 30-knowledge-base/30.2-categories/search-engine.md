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
- [Typesense 官方文档](https://typesense.org/docs/)
- [Meilisearch 官方文档](https://www.meilisearch.com/docs)
- [Algolia 官方文档](https://www.algolia.com/doc/)
- [Meilisearch GitHub](https://github.com/meilisearch/meilisearch)
- [Typesense GitHub](https://github.com/typesense/typesense)

---

*最后更新: 2026-04-29*
