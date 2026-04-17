/**
 * @file NLP流水线
 * @category NLP Engineering → Pipeline
 * @difficulty hard
 * @tags nlp, text-processing, embeddings, semantic-search
 *
 * @description
 * NLP 工程模块的聚合入口，重新导出所有子模块的核心类，
 * 并提供完整流水线演示函数。
 */

export { TextPreprocessor } from './text-preprocessor.js';
export { TFIDFVectorizer } from './tfidf-vectorizer.js';
export { WordEmbedding } from './word-embedding.js';
export { SemanticSearch } from './semantic-search.js';
export { NamedEntityRecognizer } from './named-entity-recognizer.js';
export { SentimentAnalyzer } from './sentiment-analyzer.js';
export { BPETokenizer } from './bpe-tokenizer.js';
export { NaiveBayesClassifier } from './text-classifier.js';

import { TextPreprocessor } from './text-preprocessor.js';
import { TFIDFVectorizer } from './tfidf-vectorizer.js';
import { SemanticSearch } from './semantic-search.js';
import { NamedEntityRecognizer } from './named-entity-recognizer.js';
import { SentimentAnalyzer } from './sentiment-analyzer.js';

export function demo(): void {
  console.log('=== NLP工程 ===\n');

  // 文本预处理
  const preprocessor = new TextPreprocessor();
  const text = 'The quick brown foxes are jumping over the lazy dogs!';
  const processed = preprocessor.preprocess(text);
  console.log('原文:', text);
  console.log('分词:', processed.tokens.join(', '));
  console.log('词干:', processed.stems.join(', '));
  console.log('二元组:', processed.bigrams.join(', '));

  // TF-IDF
  console.log('\n--- TF-IDF向量化 ---');
  const tfidf = new TFIDFVectorizer();
  const documents = [
    ['the', 'cat', 'sat', 'on', 'the', 'mat'],
    ['the', 'dog', 'sat', 'on', 'the', 'log'],
    ['cats', 'and', 'dogs', 'are', 'pets']
  ];
  const vectors = tfidf.fitTransform(documents);
  console.log('词汇表大小:', tfidf.getVocabulary().size);
  console.log('文档向量维度:', vectors[0].length);

  // 语义搜索
  console.log('\n--- 语义搜索 ---');
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

  // 命名实体识别
  console.log('\n--- 命名实体识别 ---');
  const ner = new NamedEntityRecognizer();
  const sampleText = 'Contact John Smith at john.smith@example.com or visit https://example.com. Call 555-123-4567.';
  const entities = ner.extract(sampleText);
  console.log('识别的实体:');
  for (const entity of entities) {
    console.log(`  [${entity.type}] ${entity.text}`);
  }

  // 情感分析
  console.log('\n--- 情感分析 ---');
  const sentiment = new SentimentAnalyzer();
  const reviews = [
    'This product is amazing! I love it.',
    'Terrible experience, would not recommend.',
    "It's okay, nothing special."
  ];
  for (const review of reviews) {
    const result = sentiment.analyze(review);
    console.log(`[${result.sentiment}] ${review} (score: ${result.score.toFixed(3)})`);
  }
}
