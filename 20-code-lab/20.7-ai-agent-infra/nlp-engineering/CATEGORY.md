---
dimension: 应用领域
application-domain: AI 与 Agent 应用
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: NLP 工程 — 分词、情感分析、命名实体识别与语义搜索
- **模块编号**: 85-nlp-engineering

## 边界说明

本模块聚焦自然语言处理在 JS/TS 中的应用，包括：

- BPE 分词与文本预处理
- 情感分析与文本分类
- 命名实体识别与语义搜索
- Word Embedding 与 TF-IDF

大规模语言模型训练和 Transformer 架构原理不属于本模块范围。

## 子模块索引

| 子模块 | 说明 | 关键文件 |
|--------|------|----------|
| `tokenization/` | BPE/WordPiece 分词实现 | `tokenizer.ts`, `bpe.test.ts` |
| `sentiment-analysis/` | 情感分类与极性检测 | `sentiment.ts` |
| `named-entity-recognition/` | 命名实体识别规则与模型 | `ner.ts` |
| `semantic-search/` | 向量检索与余弦相似度 | `semantic-search.ts` |
| `text-embedding/` | TF-IDF / Word2Vec 轻量实现 | `embedding.ts` |

## 代码示例

### 轻量 TF-IDF 实现

```typescript
interface Document {
  id: string;
  text: string;
}

class TfIdf {
  private docs: Document[] = [];
  private idf: Map<string, number> = new Map();

  add(doc: Document) {
    this.docs.push(doc);
  }

  fit() {
    const N = this.docs.length;
    const allTerms = new Set<string>();
    this.docs.forEach(d => d.text.toLowerCase().split(/\W+/).forEach(t => allTerms.add(t)));
    allTerms.forEach(term => {
      const df = this.docs.filter(d => d.text.toLowerCase().includes(term)).length;
      this.idf.set(term, Math.log(N / (1 + df)));
    });
  }

  vectorize(text: string): Map<string, number> {
    const terms = text.toLowerCase().split(/\W+/);
    const tf = new Map<string, number>();
    terms.forEach(t => tf.set(t, (tf.get(t) || 0) + 1 / terms.length));
    const vec = new Map<string, number>();
    tf.forEach((v, k) => vec.set(k, v * (this.idf.get(k) || 0)));
    return vec;
  }
}
```

### 余弦相似度语义搜索

```typescript
function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}

// 使用 transformers.js 生成嵌入
import { pipeline } from '@xenova/transformers';
const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
const output = await embedder('JavaScript NLP is powerful', { pooling: 'mean', normalize: true });
```

## 关联模块

- `33-ai-integration` — AI 集成
- `76-ml-engineering` — ML 工程
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

## 权威参考

| 资源 | 类型 | 链接 |
|------|------|------|
| Transformers.js | 浏览器端 NLP | [huggingface.co/docs/transformers.js](https://huggingface.co/docs/transformers.js) |
| Natural | Node.js NLP 库 | [naturalnode.github.io/natural](https://naturalnode.github.io/natural/) |
| Compromise | 轻量 NLP 解析 | [compromise.cool](https://compromise.cool/) |
| Wink NLP | 自然语言处理 | [winkjs.org](https://winkjs.org/) |
| Hugging Face | 模型生态 | [huggingface.co](https://huggingface.co) |

---

*最后更新: 2026-04-29*
