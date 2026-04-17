/**
 * @file 语义搜索引擎
 * @category NLP Engineering → Search
 * @difficulty medium
 * @tags semantic-search, cosine-similarity, embedding-index, top-k
 *
 * @description
 * 基于词嵌入的极简语义搜索引擎：对文档建立嵌入索引后，
 * 使用余弦相似度检索与查询最相关的文档。
 */

import { WordEmbedding } from './word-embedding.js';
import { TextPreprocessor } from './text-preprocessor.js';

export interface SearchResult {
  id: string;
  text: string;
  score: number;
}

export class SemanticSearch {
  private documents: { id: string; text: string; embedding: number[] }[] = [];
  private embedding: WordEmbedding;
  private preprocessor: TextPreprocessor;

  constructor(embeddingDimension = 50) {
    this.embedding = new WordEmbedding(embeddingDimension);
    this.preprocessor = new TextPreprocessor();
  }

  /** 索引文档 */
  index(id: string, text: string): void {
    const processed = this.preprocessor.preprocess(text);
    const emb = this.embedding.getSentenceEmbedding(processed.tokens);
    this.documents.push({ id, text, embedding: emb });
  }

  /** 构建全局词汇表并重新计算嵌入 */
  buildIndex(): void {
    const vocabulary = new Set<string>();
    for (const doc of this.documents) {
      const processed = this.preprocessor.preprocess(doc.text);
      for (const token of processed.tokens) {
        vocabulary.add(token);
      }
    }
    this.embedding.initialize(Array.from(vocabulary));
    for (const doc of this.documents) {
      const processed = this.preprocessor.preprocess(doc.text);
      doc.embedding = this.embedding.getSentenceEmbedding(processed.tokens);
    }
  }

  /** 搜索最相关的 topK 个文档 */
  search(query: string, topK = 5): SearchResult[] {
    const processed = this.preprocessor.preprocess(query);
    const queryEmbedding = this.embedding.getSentenceEmbedding(processed.tokens);

    const scores = this.documents.map(doc => ({
      id: doc.id,
      text: doc.text,
      score: this.embedding.cosineSimilarity(queryEmbedding, doc.embedding)
    }));

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

export function demo(): void {
  console.log('=== 语义搜索 ===\n');
  const search = new SemanticSearch(10);

  search.index('doc1', 'Machine learning is a subset of artificial intelligence');
  search.index('doc2', 'Deep learning uses neural networks with many layers');
  search.index('doc3', 'Natural language processing helps computers understand text');
  search.index('doc4', 'Computer vision enables machines to interpret images');

  search.buildIndex();

  const results = search.search('AI and neural networks', 3);
  console.log('搜索结果:');
  for (const r of results) {
    console.log(`  [${r.score.toFixed(3)}] ${r.text}`);
  }
}
