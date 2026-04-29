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

### BPE 分词器简化实现

```typescript
// bpe-tokenizer.ts
class BPETokenizer {
  private vocab = new Map<string, number>();
  private merges: Array<[string, string]> = [];

  constructor(vocabSize = 1000) {
    this.vocabSize = vocabSize;
  }

  private vocabSize: number;

  train(corpus: string[]) {
    // 初始化词汇表：所有字符
    const wordFreqs = new Map<string, number>();
    corpus.forEach(text => {
      const words = text.toLowerCase().split(/\s+/);
      words.forEach(word => {
        const tokenized = Array.from(word).join(' ') + ' </w>';
        wordFreqs.set(tokenized, (wordFreqs.get(tokenized) || 0) + 1);
      });
    });

    // 学习合并规则
    while (this.merges.length < this.vocabSize - 256) {
      const pairs = this.getPairStats(wordFreqs);
      if (pairs.size === 0) break;

      const bestPair = Array.from(pairs.entries()).sort((a, b) => b[1] - a[1])[0][0];
      this.merges.push(bestPair);

      // 应用合并
      const [a, b] = bestPair;
      const pattern = new RegExp(`${a} ${b}`, 'g');
      const newWordFreqs = new Map<string, number>();
      wordFreqs.forEach((freq, word) => {
        newWordFreqs.set(word.replace(pattern, `${a}${b}`), freq);
      });
      wordFreqs.clear();
      newWordFreqs.forEach((freq, word) => wordFreqs.set(word, freq));
    }

    // 构建最终词汇表
    wordFreqs.forEach((_, word) => {
      word.split(' ').forEach(token => {
        if (!this.vocab.has(token)) {
          this.vocab.set(token, this.vocab.size);
        }
      });
    });
  }

  private getPairStats(wordFreqs: Map<string, number>): Map<string, number> {
    const pairs = new Map<string, number>();
    wordFreqs.forEach((freq, word) => {
      const symbols = word.split(' ');
      for (let i = 0; i < symbols.length - 1; i++) {
        const pair = `${symbols[i]} ${symbols[i + 1]}`;
        pairs.set(pair, (pairs.get(pair) || 0) + freq);
      }
    });
    return pairs;
  }

  encode(text: string): number[] {
    const tokens: number[] = [];
    const words = text.toLowerCase().split(/\s+/);

    for (const word of words) {
      let wordTokens = Array.from(word + '</w>');
      for (const [a, b] of this.merges) {
        let i = 0;
        while (i < wordTokens.length - 1) {
          if (wordTokens[i] === a && wordTokens[i + 1] === b) {
            wordTokens.splice(i, 2, a + b);
          } else {
            i++;
          }
        }
      }
      wordTokens.forEach(t => {
        const id = this.vocab.get(t) || this.vocab.get('<unk>') || 0;
        tokens.push(id);
      });
    }

    return tokens;
  }

  decode(tokens: number[]): string {
    const idToToken = Array.from(this.vocab.entries()).sort((a, b) => a[1] - b[1]).map(([t]) => t);
    return tokens.map(id => idToToken[id] || '<unk>').join('').replace(/<\/w>/g, ' ').trim();
  }
}

// 使用示例
const tokenizer = new BPETokenizer(100);
tokenizer.train(['hello world', 'hello there', 'world peace']);
console.log(tokenizer.encode('hello world'));
console.log(tokenizer.decode(tokenizer.encode('hello world')));
```

### 规则 + 轻量模型 NER

```typescript
// ner-engine.ts
interface Entity {
  text: string;
  label: 'PERSON' | 'ORG' | 'DATE' | 'MONEY' | 'LOCATION';
  start: number;
  end: number;
}

class RuleBasedNER {
  private patterns: Array<{ regex: RegExp; label: Entity['label'] }> = [
    { regex: /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi, label: 'DATE' },
    { regex: /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, label: 'DATE' },
    { regex: /\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s+(USD|EUR|CNY)/g, label: 'MONEY' },
    { regex: /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g, label: 'PERSON' },
  ];

  extract(text: string): Entity[] {
    const entities: Entity[] = [];
    for (const { regex, label } of this.patterns) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        entities.push({
          text: match[0],
          label,
          start: match.index,
          end: match.index + match[0].length,
        });
      }
    }
    return this.resolveOverlaps(entities);
  }

  private resolveOverlaps(entities: Entity[]): Entity[] {
    return entities
      .sort((a, b) => a.start - b.start || b.end - a.end)
      .filter((entity, index, arr) => {
        if (index === 0) return true;
        const prev = arr[index - 1];
        return entity.start >= prev.end;
      });
  }
}

// 使用 Compromise.js 增强（工业级方案）
// import nlp from 'compromise';
// const doc = nlp('Apple Inc. was founded by Steve Jobs in Cupertino on April 1, 1976.');
// const people = doc.people().json();
// const places = doc.places().json();
// const orgs = doc.organizations().json();
```

### 文本分类（朴素贝叶斯）

```typescript
// naive-bayes-classifier.ts
class NaiveBayesClassifier {
  private classCounts = new Map<string, number>();
  private wordCounts = new Map<string, Map<string, number>>();
  private vocab = new Set<string>();
  private totalDocs = 0;

  train(text: string, label: string) {
    this.totalDocs++;
    this.classCounts.set(label, (this.classCounts.get(label) || 0) + 1);

    const words = this.tokenize(text);
    if (!this.wordCounts.has(label)) this.wordCounts.set(label, new Map());
    const labelWords = this.wordCounts.get(label)!;

    words.forEach(word => {
      this.vocab.add(word);
      labelWords.set(word, (labelWords.get(word) || 0) + 1);
    });
  }

  predict(text: string): Array<{ label: string; score: number }> {
    const words = this.tokenize(text);
    const results: Array<{ label: string; score: number }> = [];

    for (const [label, classCount] of this.classCounts) {
      let logProb = Math.log(classCount / this.totalDocs);
      const labelWords = this.wordCounts.get(label)!;
      const totalWords = Array.from(labelWords.values()).reduce((a, b) => a + b, 0);

      for (const word of words) {
        const count = labelWords.get(word) || 0;
        // 拉普拉斯平滑
        logProb += Math.log((count + 1) / (totalWords + this.vocab.size));
      }

      results.push({ label, score: logProb });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
  }
}

// 情感分析示例
const classifier = new NaiveBayesClassifier();
classifier.train('this movie is amazing and fantastic', 'positive');
classifier.train('great acting wonderful story', 'positive');
classifier.train('terrible waste of time boring', 'negative');
classifier.train('awful plot bad acting', 'negative');

console.log(classifier.predict('this was an amazing film'));
// [{ label: 'positive', score: -10.2 }, { label: 'negative', score: -14.5 }]
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
| TensorFlow.js Text Models | 文本模型 | [tensorflow.org/js/tutorials](https://www.tensorflow.org/js/tutorials) |
| spaCy (Python参考) | NLP 工业标准 | [spacy.io](https://spacy.io/) |
| fastText | 文本分类与表示 | [fasttext.cc](https://fasttext.cc/) |
| ANN-Benchmarks | 向量检索基准 | [ann-benchmarks.com](https://ann-benchmarks.com/) |

---

*最后更新: 2026-04-29*
