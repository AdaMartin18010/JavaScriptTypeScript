---
dimension: 综合
sub-dimension: Search engine
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Search engine 核心概念与工程实践。

## 包含内容

- 本模块聚焦 search engine 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 faceted-search.test.ts
- 📄 faceted-search.ts
- 📄 full-text-search.test.ts
- 📄 full-text-search.ts
- 📄 index.ts
- 📄 query-expander.test.ts
- 📄 query-expander.ts
- 📄 search-implementation.test.ts
- 📄 search-implementation.ts
- 📄 search-ranker.test.ts
- 📄 search-ranker.ts
- 📄 search-suggestions.test.ts
- 📄 search-suggestions.ts


---

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `full-text-search/` | 倒排索引与 TF-IDF 全文检索 | `full-text-search.ts`, `full-text-search.test.ts` |
| `faceted-search/` | 分面导航与聚合过滤 | `faceted-search.ts`, `faceted-search.test.ts` |
| `query-expander/` | 查询扩展与同义词处理 | `query-expander.ts`, `query-expander.test.ts` |
| `search-ranker/` | 排序算法与相关性评分 | `search-ranker.ts`, `search-ranker.test.ts` |
| `search-implementation/` | 搜索引擎集成封装 | `search-implementation.ts`, `search-implementation.test.ts` |
| `search-suggestions/` | 自动补全与搜索建议 | `search-suggestions.ts`, `search-suggestions.test.ts` |

## 代码示例

### 基于 Meilisearch 的类型安全搜索客户端

```typescript
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({ host: 'http://localhost:7700', apiKey: 'masterKey' });

interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
}

const index = client.index<Product>('products');

// 搜索并返回强类型结果
const results = await index.search('laptop', {
  facets: ['category'],
  filter: ['price >= 500'],
});
```


## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| Meilisearch Documentation | 官方文档 | [meilisearch.com/docs](https://www.meilisearch.com/docs) |
| Algolia Docs | 官方文档 | [algolia.com/doc](https://www.algolia.com/doc/) |
| Elasticsearch Guide | 官方指南 | [elastic.co/guide/en/elasticsearch/reference](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html) |
| Lunr.js | 轻量浏览器搜索 | [lunrjs.com](https://lunrjs.com/) |

---

*最后更新: 2026-04-29*
