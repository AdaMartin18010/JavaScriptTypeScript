/**
 * @file 情感分析器
 * @category NLP Engineering → Sentiment Analysis
 * @difficulty easy
 * @tags sentiment-analysis, lexicon, polarity, text-classification
 *
 * @description
 * 基于情感词典的简化版情感分析器，通过统计正负情感词数量判断文本情感倾向。
 */

export interface SentimentResult {
  score: number;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export class SentimentAnalyzer {
  private positiveWords = new Set([
    'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'love', 'like', 'happy', 'pleased', 'satisfied', 'perfect',
    'best', 'awesome', 'brilliant', 'outstanding', 'superb'
  ]);

  private negativeWords = new Set([
    'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike',
    'angry', 'disappointed', 'unsatisfied', 'poor', 'worst',
    'disgusting', 'useless', 'waste', 'boring', 'annoying'
  ]);

  analyze(text: string): SentimentResult {
    const tokens = text.toLowerCase().split(/\W+/).filter(t => t.length > 0);
    let positive = 0;
    let negative = 0;

    for (const token of tokens) {
      if (this.positiveWords.has(token)) positive++;
      if (this.negativeWords.has(token)) negative++;
    }

    const score = (positive - negative) / Math.max(tokens.length, 1);
    let sentiment: SentimentResult['sentiment'];
    if (score > 0.05) sentiment = 'positive';
    else if (score < -0.05) sentiment = 'negative';
    else sentiment = 'neutral';

    return { score, sentiment };
  }
}

export function demo(): void {
  console.log('=== 情感分析 ===\n');
  const analyzer = new SentimentAnalyzer();
  const reviews = [
    'This product is amazing! I love it.',
    'Terrible experience, would not recommend.',
    "It's okay, nothing special."
  ];
  for (const review of reviews) {
    const r = analyzer.analyze(review);
    console.log(`[${r.sentiment}] ${review} (score: ${r.score.toFixed(3)})`);
  }
}
