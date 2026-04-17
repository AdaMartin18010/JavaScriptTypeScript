/**
 * @file TF-IDF 向量化器
 * @category NLP Engineering → Vectorization
 * @difficulty medium
 * @tags tf-idf, bag-of-words, vector-space-model, normalization
 *
 * @description
 * 实现词频-逆文档频率（TF-IDF）向量化器，将文本文档转换为数值向量，
 * 用于信息检索与文本分类任务。
 */

export class TFIDFVectorizer {
  private idf = new Map<string, number>();
  private vocabulary = new Map<string, number>();
  private documentCount = 0;

  /**
   * 基于文档集计算 IDF 与词汇表
   * @param documents - 每个文档为一个已分词的词数组
   */
  fit(documents: string[][]): void {
    const documentFrequency = new Map<string, number>();

    for (const doc of documents) {
      const uniqueTerms = new Set(doc);
      for (const term of uniqueTerms) {
        documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
      }
    }

    this.documentCount = documents.length;

    for (const [term, df] of documentFrequency) {
      const idf = Math.log(this.documentCount / (df + 1)) + 1;
      this.idf.set(term, idf);
    }

    let index = 0;
    for (const term of this.idf.keys()) {
      this.vocabulary.set(term, index++);
    }
  }

  /**
   * 将单个文档转换为 TF-IDF 向量
   */
  transform(document: string[]): number[] {
    const vector = new Array(this.vocabulary.size).fill(0);

    const termCounts = new Map<string, number>();
    for (const term of document) {
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    }

    const maxCount = Math.max(...termCounts.values(), 1);

    for (const [term, count] of termCounts) {
      const idx = this.vocabulary.get(term);
      if (idx !== undefined) {
        const tf = count / maxCount;
        const idf = this.idf.get(term) || 1;
        vector[idx] = tf * idf;
      }
    }

    // L2 归一化
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }

    return vector;
  }

  /**
   * fit + transform 组合
   */
  fitTransform(documents: string[][]): number[][] {
    this.fit(documents);
    return documents.map(doc => this.transform(doc));
  }

  getVocabulary(): Map<string, number> {
    return this.vocabulary;
  }
}

export function demo(): void {
  console.log('=== TF-IDF 向量化 ===\n');
  const vectorizer = new TFIDFVectorizer();
  const docs = [
    ['the', 'cat', 'sat', 'on', 'the', 'mat'],
    ['the', 'dog', 'sat', 'on', 'the', 'log'],
    ['cats', 'and', 'dogs', 'are', 'pets']
  ];
  const vectors = vectorizer.fitTransform(docs);
  console.log('词汇表大小:', vectorizer.getVocabulary().size);
  console.log('文档向量维度:', vectors[0].length);
}
