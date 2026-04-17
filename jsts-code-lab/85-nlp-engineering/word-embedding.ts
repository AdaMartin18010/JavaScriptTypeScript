/**
 * @file 词嵌入与向量操作
 * @category NLP Engineering → Embeddings
 * @difficulty medium
 * @tags word-embedding, cosine-similarity, vector-average, sentence-embedding
 *
 * @description
 * 实现简化版词嵌入查找与句子级向量表示，支持余弦相似度计算，
 * 用于语义检索与文本相似性任务。
 */

export class WordEmbedding {
  private embeddings = new Map<string, number[]>();
  private readonly dimension: number;

  constructor(dimension = 50) {
    this.dimension = dimension;
  }

  /** 随机初始化词汇表嵌入（实际应用应使用预训练模型） */
  initialize(vocabulary: string[]): void {
    for (const word of vocabulary) {
      const embedding: number[] = [];
      for (let i = 0; i < this.dimension; i++) {
        embedding.push((Math.random() - 0.5) * 0.1);
      }
      this.embeddings.set(word, embedding);
    }
  }

  getVector(word: string): number[] | undefined {
    return this.embeddings.get(word);
  }

  /** 句子嵌入：取词向量平均 */
  getSentenceEmbedding(words: string[]): number[] {
    const vectors: number[][] = [];
    for (const word of words) {
      const vec = this.getVector(word);
      if (vec) vectors.push(vec);
    }

    if (vectors.length === 0) {
      return new Array(this.dimension).fill(0);
    }

    const result = new Array(this.dimension).fill(0);
    for (const vec of vectors) {
      for (let i = 0; i < this.dimension; i++) {
        result[i] += vec[i];
      }
    }
    for (let i = 0; i < this.dimension; i++) {
      result[i] /= vectors.length;
    }
    return result;
  }

  /** 余弦相似度 */
  cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
  }
}

export function demo(): void {
  console.log('=== 词嵌入 ===\n');
  const emb = new WordEmbedding(10);
  emb.initialize(['machine', 'learning', 'deep', 'neural']);

  const v1 = emb.getSentenceEmbedding(['machine', 'learning']);
  const v2 = emb.getSentenceEmbedding(['deep', 'learning']);
  console.log('余弦相似度:', emb.cosineSimilarity(v1, v2).toFixed(4));
}
