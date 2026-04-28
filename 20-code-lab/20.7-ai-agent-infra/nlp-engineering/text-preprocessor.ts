/**
 * @file 文本预处理
 * @category NLP Engineering → Preprocessing
 * @difficulty easy
 * @tags tokenization, stopwords, stemming, n-gram, normalization
 *
 * @description
 * 提供 NLP 流水线的基础文本预处理能力：
 * - 分词（基于空格与标点的简化版）
 * - 停用词过滤
 * - 词干提取（简化规则）
 * - N-gram 生成
 */

export class TextPreprocessor {
  private readonly stopwords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'and', 'but', 'or', 'yet', 'so',
    'if', 'because', 'although', 'though', 'while', 'where',
    'when', 'that', 'which', 'who', 'whom', 'whose', 'what'
  ]);

  /** 分词 */
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }

  /** 去除停用词 */
  removeStopwords(tokens: string[]): string[] {
    return tokens.filter(t => !this.stopwords.has(t));
  }

  /** 词干提取（简化版） */
  stem(word: string): string {
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'ment'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  }

  /** N-gram 生成 */
  generateNgrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join('_'));
    }
    return ngrams;
  }

  /** 完整预处理流程 */
  preprocess(text: string): { tokens: string[]; stems: string[]; bigrams: string[] } {
    const tokens = this.removeStopwords(this.tokenize(text));
    const stems = tokens.map(t => this.stem(t));
    const bigrams = this.generateNgrams(tokens, 2);
    return { tokens, stems, bigrams };
  }
}

export function demo(): void {
  console.log('=== 文本预处理 ===\n');
  const preprocessor = new TextPreprocessor();
  const text = 'The quick brown foxes are jumping over the lazy dogs!';
  const result = preprocessor.preprocess(text);
  console.log('原文:', text);
  console.log('分词:', result.tokens.join(', '));
  console.log('词干:', result.stems.join(', '));
  console.log('二元组:', result.bigrams.join(', '));
}
