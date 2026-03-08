/**
 * @file NLP流水线
 * @category NLP Engineering → Pipeline
 * @difficulty hard
 * @tags nlp, text-processing, embeddings, semantic-search
 */

// 文本预处理
export class TextPreprocessor {
  // 分词
  tokenize(text: string): string[] {
    // 简化的分词：按空格和标点分割
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 0);
  }
  
  // 去除停用词
  removeStopwords(tokens: string[]): string[] {
    const stopwords = new Set([
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
    
    return tokens.filter(t => !stopwords.has(t));
  }
  
  // 词干提取（简化版Porter Stemmer）
  stem(word: string): string {
    // 简化的规则
    let stem = word;
    
    // 去除常见的后缀
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'ment'];
    for (const suffix of suffixes) {
      if (stem.endsWith(suffix) && stem.length > suffix.length + 2) {
        stem = stem.slice(0, -suffix.length);
        break;
      }
    }
    
    return stem;
  }
  
  // N-gram生成
  generateNgrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join('_'));
    }
    return ngrams;
  }
  
  // 完整预处理流程
  preprocess(text: string): { tokens: string[]; stems: string[]; bigrams: string[] } {
    const tokens = this.removeStopwords(this.tokenize(text));
    const stems = tokens.map(t => this.stem(t));
    const bigrams = this.generateNgrams(tokens, 2);
    
    return { tokens, stems, bigrams };
  }
}

// TF-IDF向量化
export class TFIDFVectorizer {
  private idf: Map<string, number> = new Map();
  private vocabulary: Map<string, number> = new Map();
  private documentCount = 0;
  
  fit(documents: string[][]): void {
    const documentFrequency = new Map<string, number>();
    
    for (const doc of documents) {
      const uniqueTerms = new Set(doc);
      for (const term of uniqueTerms) {
        documentFrequency.set(term, (documentFrequency.get(term) || 0) + 1);
      }
    }
    
    this.documentCount = documents.length;
    
    // 计算IDF
    for (const [term, df] of documentFrequency) {
      const idf = Math.log(this.documentCount / (df + 1)) + 1;
      this.idf.set(term, idf);
    }
    
    // 构建词汇表
    let index = 0;
    for (const term of this.idf.keys()) {
      this.vocabulary.set(term, index++);
    }
  }
  
  transform(document: string[]): number[] {
    const vector = new Array(this.vocabulary.size).fill(0);
    
    // 计算TF
    const termCounts = new Map<string, number>();
    for (const term of document) {
      termCounts.set(term, (termCounts.get(term) || 0) + 1);
    }
    
    const maxCount = Math.max(...termCounts.values());
    
    // 计算TF-IDF
    for (const [term, count] of termCounts) {
      const index = this.vocabulary.get(term);
      if (index !== undefined) {
        const tf = count / maxCount;
        const idf = this.idf.get(term) || 1;
        vector[index] = tf * idf;
      }
    }
    
    // L2归一化
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    if (norm > 0) {
      for (let i = 0; i < vector.length; i++) {
        vector[i] /= norm;
      }
    }
    
    return vector;
  }
  
  fitTransform(documents: string[][]): number[][] {
    this.fit(documents);
    return documents.map(doc => this.transform(doc));
  }
  
  getVocabulary(): Map<string, number> {
    return this.vocabulary;
  }
}

// 词嵌入（简化版）
export class WordEmbedding {
  private embeddings: Map<string, number[]> = new Map();
  private dimension: number;
  
  constructor(dimension: number = 50) {
    this.dimension = dimension;
  }
  
  // 随机初始化（实际应用中应使用预训练模型如Word2Vec/GloVe）
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
  
  // 句子嵌入（取平均）
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
  
  // 余弦相似度
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

// 语义搜索引擎
export class SemanticSearch {
  private documents: Array<{ id: string; text: string; embedding: number[] }> = [];
  private embedding: WordEmbedding;
  private preprocessor: TextPreprocessor;
  
  constructor(embeddingDimension: number = 50) {
    this.embedding = new WordEmbedding(embeddingDimension);
    this.preprocessor = new TextPreprocessor();
  }
  
  index(id: string, text: string): void {
    const processed = this.preprocessor.preprocess(text);
    const embedding = this.embedding.getSentenceEmbedding(processed.tokens);
    
    this.documents.push({ id, text, embedding });
  }
  
  buildIndex(): void {
    // 收集所有词汇
    const vocabulary = new Set<string>();
    for (const doc of this.documents) {
      const processed = this.preprocessor.preprocess(doc.text);
      for (const token of processed.tokens) {
        vocabulary.add(token);
      }
    }
    
    // 初始化嵌入
    this.embedding.initialize(Array.from(vocabulary));
    
    // 重新计算嵌入
    for (const doc of this.documents) {
      const processed = this.preprocessor.preprocess(doc.text);
      doc.embedding = this.embedding.getSentenceEmbedding(processed.tokens);
    }
  }
  
  search(query: string, topK: number = 5): Array<{ id: string; text: string; score: number }> {
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

// 命名实体识别（简化版）
export class NamedEntityRecognizer {
  private patterns: Map<string, RegExp> = new Map([
    ['PERSON', /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g],
    ['ORG', /\b[A-Z][a-z]* (Inc|Corp|LLC|Ltd|Company)\b/g],
    ['EMAIL', /\b[\w.-]+@[\w.-]+\.\w+\b/g],
    ['URL', /https?:\/\/[^\s]+/g],
    ['PHONE', /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g],
    ['DATE', /\b\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}\b/g]
  ]);
  
  extract(text: string): Array<{ text: string; type: string; start: number; end: number }> {
    const entities: Array<{ text: string; type: string; start: number; end: number }> = [];
    
    for (const [type, pattern] of this.patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match.index !== undefined) {
          entities.push({
            text: match[0],
            type,
            start: match.index,
            end: match.index + match[0].length
          });
        }
      }
    }
    
    // 按位置排序
    return entities.sort((a, b) => a.start - b.start);
  }
}

// 情感分析（简化版）
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
  
  analyze(text: string): { score: number; sentiment: 'positive' | 'negative' | 'neutral' } {
    const preprocessor = new TextPreprocessor();
    const tokens = preprocessor.preprocess(text).tokens;
    
    let positive = 0;
    let negative = 0;
    
    for (const token of tokens) {
      if (this.positiveWords.has(token)) positive++;
      if (this.negativeWords.has(token)) negative++;
    }
    
    const score = (positive - negative) / Math.max(tokens.length, 1);
    
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (score > 0.1) sentiment = 'positive';
    else if (score < -0.1) sentiment = 'negative';
    else sentiment = 'neutral';
    
    return { score, sentiment };
  }
}

export function demo(): void {
  console.log('=== NLP工程 ===\n');
  
  // 文本预处理
  console.log('--- 文本预处理 ---');
  const preprocessor = new TextPreprocessor();
  
  const text = "The quick brown foxes are jumping over the lazy dogs!";
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
  for (const result of results) {
    console.log(`  [${result.score.toFixed(3)}] ${result.text}`);
  }
  
  // 命名实体识别
  console.log('\n--- 命名实体识别 ---');
  const ner = new NamedEntityRecognizer();
  
  const sampleText = "Contact John Smith at john.smith@example.com or visit https://example.com. Call 555-123-4567.";
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
    'It\'s okay, nothing special.'
  ];
  
  for (const review of reviews) {
    const result = sentiment.analyze(review);
    console.log(`[${result.sentiment}] ${review} (score: ${result.score.toFixed(3)})`);
  }
}
