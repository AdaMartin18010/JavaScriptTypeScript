# 64-search-engine

搜索引擎核心算法与组件实现。

## Topics

| Topic | File |
|---|---|
| 搜索实现（倒排索引、TF-IDF、布尔/短语查询） | `search-implementation.ts` |
| 全文搜索 | `full-text-search.ts` |
| 分面搜索 | `faceted-search.ts` |
| 搜索建议 | `search-suggestions.ts` |
| 搜索结果排序（BM25、MMR） | `search-ranker.ts` |
| 查询扩展（同义词、拼写纠正） | `query-expander.ts` |

## Running Tests

```bash
npx vitest run 64-search-engine
```
