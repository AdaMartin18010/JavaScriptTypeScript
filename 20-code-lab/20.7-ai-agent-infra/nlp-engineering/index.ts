/**
 * @file NLP工程模块
 * @module NLP Engineering
 * @description
 * NLP工程：
 * - 文本预处理（分词、停用词、词干、N-gram）
 * - TF-IDF 向量化
 * - 词嵌入与余弦相似度
 * - 语义搜索
 * - 命名实体识别（规则基础版）
 * - 情感分析
 * - BPE Tokenizer
 * - 朴素贝叶斯文本分类器
 */

export * as NlpPipeline from './nlp-pipeline.js';
export * as TextPreprocessor from './text-preprocessor.js';
export * as TFIDFVectorizer from './tfidf-vectorizer.js';
export * as WordEmbedding from './word-embedding.js';
export * as SemanticSearch from './semantic-search.js';
export * as NamedEntityRecognizer from './named-entity-recognizer.js';
export * as SentimentAnalyzer from './sentiment-analyzer.js';
export * as BPETokenizer from './bpe-tokenizer.js';
export * as TextClassifier from './text-classifier.js';
