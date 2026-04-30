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

### 内存倒排索引与 TF-IDF

```typescript
// full-text-search.ts — 轻量级内存搜索引擎

class InvertedIndex {
  private index = new Map<string, Set<number>>();
  private docs: string[] = [];

  addDocument(id: number, text: string): void {
    this.docs[id] = text;
    const tokens = this.tokenize(text);
    for (const token of tokens) {
      if (!this.index.has(token)) this.index.set(token, new Set());
      this.index.get(token)!.add(id);
    }
  }

  search(query: string): Array<{ id: number; score: number }> {
    const tokens = this.tokenize(query);
    const scores = new Map<number, number>();

    for (const token of tokens) {
      const docs = this.index.get(token);
      if (!docs) continue;
      const idf = Math.log(this.docs.length / (docs.size + 1));
      for (const docId of docs) {
        const tf = this.tokenize(this.docs[docId]).filter((t) => t === token).length;
        const current = scores.get(docId) ?? 0;
        scores.set(docId, current + tf * idf);
      }
    }

    return Array.from(scores.entries())
      .map(([id, score]) => ({ id, score }))
      .sort((a, b) => b.score - a.score);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().match(/\b\w+\b/g) ?? [];
  }
}
```

### 前缀树（Trie）自动补全

```typescript
// search-suggestions.ts — Trie 实现搜索建议

class TrieNode {
  children = new Map<string, TrieNode>();
  isEnd = false;
  frequency = 0; // 用于排序：搜索频率越高排名越前
}

class AutocompleteEngine {
  private root = new TrieNode();

  insert(word: string, frequency = 1): void {
    let node = this.root;
    for (const char of word) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode());
      node = node.children.get(char)!;
    }
    node.isEnd = true;
    node.frequency += frequency;
  }

  suggest(prefix: string, limit = 5): string[] {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) return [];
      node = node.children.get(char)!;
    }

    const results: Array<{ word: string; frequency: number }> = [];
    this.dfs(node, prefix, results);
    return results
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
      .map((r) => r.word);
  }

  private dfs(node: TrieNode, prefix: string, results: Array<{ word: string; frequency: number }>): void {
    if (node.isEnd) results.push({ word: prefix, frequency: node.frequency });
    for (const [char, child] of node.children) {
      this.dfs(child, prefix + char, results);
    }
  }
}

// 使用
const engine = new AutocompleteEngine();
['typescript', 'tailwind', 'testing', 'tanstack', 'three.js'].forEach((w) => engine.insert(w));
console.log(engine.suggest('t')); // ['typescript', 'tailwind', 'testing', 'tanstack', 'three.js']
```

### 分面搜索（Faceted Search）实现

```typescript
// faceted-search.ts — 内存分面聚合引擎

interface Document {
  id: string;
  title: string;
  category: string;
  brand: string;
  price: number;
  tags: string[];
}

interface FacetResult {
  field: string;
  values: Array<{ value: string; count: number }>;
}

class FacetedSearchEngine {
  constructor(private docs: Document[]) {}

  search(
    query: string,
    filters: Record<string, string[]> = {}
  ): { hits: Document[]; facets: FacetResult[] } {
    // 1. 全文过滤
    let hits = this.docs.filter((d) =>
      d.title.toLowerCase().includes(query.toLowerCase())
    );

    // 2. 分面过滤
    for (const [field, values] of Object.entries(filters)) {
      if (values.length === 0) continue;
      hits = hits.filter((d) => {
        const docValue = (d as any)[field];
        if (Array.isArray(docValue)) return values.some((v) => docValue.includes(v));
        return values.includes(String(docValue));
      });
    }

    // 3. 分面聚合
    const facets: FacetResult[] = ['category', 'brand', 'tags'].map((field) => ({
      field,
      values: this.aggregate(hits, field),
    }));

    return { hits, facets };
  }

  private aggregate(hits: Document[], field: string): Array<{ value: string; count: number }> {
    const counts = new Map<string, number>();
    for (const doc of hits) {
      const val = (doc as any)[field];
      const vals = Array.isArray(val) ? val : [val];
      for (const v of vals) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }
}

// 使用
const engine = new FacetedSearchEngine([
  { id: '1', title: 'MacBook Pro', category: 'laptop', brand: 'Apple', price: 1999, tags: ['pro', 'm3'] },
  { id: '2', title: 'ThinkPad X1', category: 'laptop', brand: 'Lenovo', price: 1599, tags: ['business'] },
  { id: '3', title: 'iPhone 15', category: 'phone', brand: 'Apple', price: 999, tags: ['5g'] },
]);

const result = engine.search('apple', { category: ['laptop', 'phone'] });
console.log(result.facets.find((f) => f.field === 'brand'));
// { field: 'brand', values: [{ value: 'Apple', count: 2 }] }
```

### 查询解析器（布尔逻辑）

```typescript
// query-parser.ts — 支持 AND/OR/NOT 的查询表达式解析

type QueryNode =
  | { type: 'term'; value: string }
  | { type: 'and'; left: QueryNode; right: QueryNode }
  | { type: 'or'; left: QueryNode; right: QueryNode }
  | { type: 'not'; child: QueryNode };

class BooleanQueryParser {
  parse(input: string): QueryNode {
    const tokens = input.match(/\(|\)|AND|OR|NOT|[^\s()]+/gi) ?? [];
    let pos = 0;

    const parseExpr = (): QueryNode => {
      let node = parseTerm();
      while (pos < tokens.length) {
        const op = tokens[pos].toUpperCase();
        if (op === 'AND') { pos++; node = { type: 'and', left: node, right: parseTerm() }; }
        else if (op === 'OR') { pos++; node = { type: 'or', left: node, right: parseTerm() }; }
        else break;
      }
      return node;
    };

    const parseTerm = (): QueryNode => {
      const tok = tokens[pos];
      if (tok === '(') { pos++; const inner = parseExpr(); pos++; return inner; }
      if (tok.toUpperCase() === 'NOT') { pos++; return { type: 'not', child: parseTerm() }; }
      pos++;
      return { type: 'term', value: tok.toLowerCase() };
    };

    return parseExpr();
  }

  evaluate(node: QueryNode, docText: string): boolean {
    const text = docText.toLowerCase();
    switch (node.type) {
      case 'term': return text.includes(node.value);
      case 'and': return this.evaluate(node.left, docText) && this.evaluate(node.right, docText);
      case 'or': return this.evaluate(node.left, docText) || this.evaluate(node.right, docText);
      case 'not': return !this.evaluate(node.child, docText);
    }
  }
}

// 使用
const parser = new BooleanQueryParser();
const ast = parser.parse('(laptop OR phone) AND apple NOT samsung');
console.log(parser.evaluate(ast, 'Apple MacBook Pro laptop')); // true
console.log(parser.evaluate(ast, 'Samsung Galaxy phone')); // false
```

### 向量搜索近似（Vector Search Concept）

```typescript
// vector-search.ts — 余弦相似度向量检索概念实现

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

class VectorIndex {
  private vectors: Array<{ id: string; embedding: number[]; meta: unknown }> = [];

  add(id: string, embedding: number[], meta: unknown) {
    this.vectors.push({ id, embedding, meta });
  }

  search(query: number[], topK = 5) {
    return this.vectors
      .map((v) => ({ id: v.id, score: cosineSimilarity(v.embedding, query), meta: v.meta }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

// 生产环境中应使用专用向量数据库：Pinecone、Weaviate、Milvus、pgvector
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
| Apache Lucene | 核心搜索库 | [lucene.apache.org](https://lucene.apache.org/) |
| Redis Search | 实时搜索模块 | [redis.io/docs/stack/search](https://redis.io/docs/stack/search/) |
| SQLite FTS5 | 全文搜索扩展 | [sqlite.org/fts5.html](https://sqlite.org/fts5.html) |
| Introduction to Information Retrieval (Stanford) | 经典教材 | [nlp.stanford.edu/IR-book](https://nlp.stanford.edu/IR-book/) |
| Typesense | 开源搜索引擎 | [typesense.org](https://typesense.org/) |
| OpenSearch | 开源搜索与分析 | [opensearch.org](https://opensearch.org/) |
| Fuse.js — 模糊搜索 | 文档 | [fusejs.io](https://www.fusejs.io/) |
| Pagefind — 静态站点搜索 | 文档 | [pagefind.app](https://pagefind.app/) |
| pgvector — Postgres 向量扩展 | 文档 | [github.com/pgvector/pgvector](https://github.com/pgvector/pgvector) |
| Weaviate — 向量数据库 | 文档 | [weaviate.io](https://weaviate.io/) |
| Apache Tika — 内容提取 | 文档 | [tika.apache.org](https://tika.apache.org/) |

---

*最后更新: 2026-04-30*
