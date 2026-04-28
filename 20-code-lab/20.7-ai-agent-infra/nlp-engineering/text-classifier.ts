/**
 * @file 简单文本分类器（朴素贝叶斯）
 * @category NLP Engineering → Classification
 * @difficulty medium
 * @tags naive-bayes, text-classification, bag-of-words, multinomial
 *
 * @description
 * 实现多项式朴素贝叶斯文本分类器，基于词袋模型统计每个词在各类别下的条件概率，
 * 用于理解文本分类的基础原理。
 */

export interface LabeledDocument {
  text: string;
  label: string;
}

export class NaiveBayesClassifier {
  private classCounts = new Map<string, number>();
  private wordClassCounts = new Map<string, Map<string, number>>();
  private vocabulary = new Set<string>();
  private totalDocs = 0;
  private smoothing = 1; // Laplace 平滑

  /** 训练分类器 */
  train(documents: LabeledDocument[]): void {
    for (const doc of documents) {
      this.totalDocs++;
      this.classCounts.set(doc.label, (this.classCounts.get(doc.label) || 0) + 1);

      const words = this.tokenize(doc.text);
      for (const word of words) {
        this.vocabulary.add(word);
        if (!this.wordClassCounts.has(word)) {
          this.wordClassCounts.set(word, new Map());
        }
        const classMap = this.wordClassCounts.get(word)!;
        classMap.set(doc.label, (classMap.get(doc.label) || 0) + 1);
      }
    }
  }

  /** 预测单个文档的类别 */
  predict(text: string): { label: string; confidence: number } {
    const words = this.tokenize(text);
    let bestLabel = '';
    let bestScore = -Infinity;
    const scores: number[] = [];

    for (const [label, classCount] of this.classCounts) {
      // 先验概率 log P(C)
      let logProb = Math.log(classCount / this.totalDocs);

      // 似然 log P(W|C)
      for (const word of words) {
        const wordCountInClass = this.wordClassCounts.get(word)?.get(label) || 0;
        const totalWordsInClass = this.getTotalWordsInClass(label);
        const prob = (wordCountInClass + this.smoothing) / (totalWordsInClass + this.smoothing * this.vocabulary.size);
        logProb += Math.log(prob);
      }

      scores.push(logProb);
      if (logProb > bestScore) {
        bestScore = logProb;
        bestLabel = label;
      }
    }

    // softmax 近似置信度
    const maxScore = Math.max(...scores);
    const expScores = scores.map(s => Math.exp(s - maxScore));
    const sumExp = expScores.reduce((a, b) => a + b, 0);
    const confidence = Math.exp(bestScore - maxScore) / sumExp;

    return { label: bestLabel, confidence };
  }

  /** 评估准确率 */
  evaluate(documents: LabeledDocument[]): number {
    let correct = 0;
    for (const doc of documents) {
      const pred = this.predict(doc.text);
      if (pred.label === doc.label) correct++;
    }
    return correct / documents.length;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  private getTotalWordsInClass(label: string): number {
    let total = 0;
    for (const classMap of this.wordClassCounts.values()) {
      total += classMap.get(label) || 0;
    }
    return total;
  }
}

export function demo(): void {
  console.log('=== 朴素贝叶斯文本分类器 ===\n');

  const trainingData: LabeledDocument[] = [
    { text: 'I love this product, it is amazing', label: 'positive' },
    { text: 'Great quality and fast shipping', label: 'positive' },
    { text: 'Excellent customer service', label: 'positive' },
    { text: 'Terrible experience, very disappointed', label: 'negative' },
    { text: 'Poor quality and broken parts', label: 'negative' },
    { text: 'I hate this, waste of money', label: 'negative' }
  ];

  const classifier = new NaiveBayesClassifier();
  classifier.train(trainingData);

  const testDocs = [
    'This product is amazing and great',
    'Very disappointed with poor quality'
  ];

  for (const text of testDocs) {
    const result = classifier.predict(text);
    console.log(`[${result.label}] ${text} (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
  }
}
