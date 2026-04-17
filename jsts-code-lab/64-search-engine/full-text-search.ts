/**
 * @file 全文搜索
 * @category Search Engine → Full Text Search
 * @difficulty medium
 * @tags full-text-search, inverted-index, tf-idf, relevance
 *
 * @description
 * 全文搜索实现：倒排索引、TF-IDF 评分、布尔查询、短语查询
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface Document {
  id: string;
  title: string;
  content: string;
  [field: string]: unknown;
}

export interface SearchResult {
  document: Document;
  score: number;
  highlights: string[];
}

export interface InvertedIndexEntry {
  term: string;
  docFreq: number; // 包含该词的文档数
  postings: Posting[];
}

export interface Posting {
  docId: string;
  termFreq: number; // 词在文档中出现次数
  positions: number[]; // 词在文档中的位置
  field: string; // 出现在哪个字段
}

export type QueryOperator = 'AND' | 'OR' | 'NOT';

export interface BooleanQuery {
  operator: QueryOperator;
  terms: string[];
}

// ============================================================================
// 分词器
// ============================================================================

export class Tokenizer {
  /**
   * 简单分词：按非字母数字字符分割
   */
  tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.isStopWord(token));
  }

  /**
   * 提取词干（简化版）
   */
  stem(word: string): string {
    // 简单处理常见后缀
    const suffixes = ['ing', 'ly', 'ed', 'er', 'est', 'tion', 's'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  }

  /**
   * 生成 N-gram
   */
  ngram(tokens: string[], n: number): string[] {
    const result: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      result.push(tokens.slice(i, i + n).join(' '));
    }
    return result;
  }

  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'must', 'can', 'this',
      'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
      'we', 'they', 'of', 'in', 'to', 'for', 'with', 'on', 'at'
    ]);
    return stopWords.has(word);
  }
}

// ============================================================================
// 倒排索引
// ============================================================================

export class InvertedIndex {
  private index = new Map<string, InvertedIndexEntry>();
  private documents = new Map<string, Document>();
  private tokenizer: Tokenizer;
  private totalDocs = 0;

  constructor(tokenizer?: Tokenizer) {
    this.tokenizer = tokenizer || new Tokenizer();
  }

  /**
   * 添加文档到索引
   */
  addDocument(doc: Document): void {
    // 存储文档
    this.documents.set(doc.id, doc);
    this.totalDocs++;

    // 索引标题
    const titleTokens = this.tokenizer.tokenize(doc.title);
    this.indexTokens(doc.id, titleTokens, 'title');

    // 索引内容
    const contentTokens = this.tokenizer.tokenize(doc.content);
    this.indexTokens(doc.id, contentTokens, 'content');
  }

  /**
   * 删除文档
   */
  removeDocument(docId: string): boolean {
    const doc = this.documents.get(docId);
    if (!doc) return false;

    // 从索引中移除
    const tokens = [
      ...this.tokenizer.tokenize(doc.title),
      ...this.tokenizer.tokenize(doc.content)
    ];

    for (const token of new Set(tokens)) {
      const entry = this.index.get(token);
      if (entry) {
        entry.postings = entry.postings.filter(p => p.docId !== docId);
        entry.docFreq = entry.postings.length;
        
        if (entry.postings.length === 0) {
          this.index.delete(token);
        }
      }
    }

    this.documents.delete(docId);
    this.totalDocs--;
    return true;
  }

  /**
   * 搜索单个词
   */
  searchTerm(term: string): Posting[] {
    const normalizedTerm = term.toLowerCase();
    const entry = this.index.get(normalizedTerm);
    return entry?.postings || [];
  }

  /**
   * 获取文档
   */
  getDocument(docId: string): Document | undefined {
    return this.documents.get(docId);
  }

  /**
   * 获取索引统计
   */
  getStats(): { totalDocs: number; uniqueTerms: number } {
    return {
      totalDocs: this.totalDocs,
      uniqueTerms: this.index.size
    };
  }

  /**
   * 获取词条的文档频率
   */
  getDocFreq(term: string): number {
    return this.index.get(term)?.docFreq || 0;
  }

  /**
   * 获取词条的倒排文档频率 (IDF)
   */
  getIDF(term: string): number {
    const docFreq = this.getDocFreq(term);
    if (docFreq === 0) return 0;
    return Math.log(this.totalDocs / docFreq);
  }

  private indexTokens(docId: string, tokens: string[], field: string): void {
    const tokenPositions = new Map<string, number[]>();

    // 记录每个词的位置
    tokens.forEach((token, position) => {
      if (!tokenPositions.has(token)) {
        tokenPositions.set(token, []);
      }
      tokenPositions.get(token)!.push(position);
    });

    // 更新索引
    for (const [token, positions] of tokenPositions) {
      let entry = this.index.get(token);
      
      if (!entry) {
        entry = {
          term: token,
          docFreq: 0,
          postings: []
        };
        this.index.set(token, entry);
      }

      // 检查是否已存在该文档的 posting
      const existingPosting = entry.postings.find(p => p.docId === docId && p.field === field);
      
      if (existingPosting) {
        existingPosting.termFreq = positions.length;
        existingPosting.positions = positions;
      } else {
        const hasDoc = entry.postings.some(p => p.docId === docId);
        entry.postings.push({
          docId,
          termFreq: positions.length,
          positions,
          field
        });
        if (!hasDoc) {
          entry.docFreq++;
        }
      }
    }
  }
}

// ============================================================================
// TF-IDF 评分器
// ============================================================================

export class TFIDFScorer {
  constructor(private index: InvertedIndex) {}

  /**
   * 计算 TF-IDF 分数
   */
  score(docId: string, term: string, field: string): number {
    const entry = this.index.index.get(term);
    if (!entry) return 0;

    const posting = entry.postings.find(p => p.docId === docId && p.field === field);
    if (!posting) return 0;

    const tf = this.normalizeTF(posting.termFreq);
    const idf = this.index.getIDF(term);

    // 标题权重更高
    const fieldBoost = field === 'title' ? 2.0 : 1.0;

    return tf * idf * fieldBoost;
  }

  /**
   * 计算文档与查询的相关性分数
   */
  scoreDocument(docId: string, queryTerms: string[]): number {
    let score = 0;

    for (const term of queryTerms) {
      score += this.score(docId, term, 'title');
      score += this.score(docId, term, 'content');
    }

    return score;
  }

  private normalizeTF(termFreq: number): number {
    // 对数归一化
    return 1 + Math.log(termFreq);
  }
}

// ============================================================================
// 查询处理器
// ============================================================================

export class QueryProcessor {
  private tokenizer: Tokenizer;

  constructor(private index: InvertedIndex, tokenizer?: Tokenizer) {
    this.tokenizer = tokenizer || new Tokenizer();
  }

  /**
   * 简单查询
   */
  search(query: string): SearchResult[] {
    const terms = this.tokenizer.tokenize(query);
    if (terms.length === 0) return [];

    // 获取包含所有查询词的文档
    const candidateDocs = this.getCandidateDocuments(terms);
    
    // 评分
    const scorer = new TFIDFScorer(this.index);
    const results: SearchResult[] = [];

    for (const docId of candidateDocs) {
      const doc = this.index.getDocument(docId);
      if (!doc) continue;

      const score = scorer.scoreDocument(docId, terms);
      
      if (score > 0) {
        results.push({
          document: doc,
          score,
          highlights: this.generateHighlights(doc, terms)
        });
      }
    }

    // 按分数排序
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * 布尔查询
   */
  booleanSearch(query: BooleanQuery): SearchResult[] {
    const docSets: Set<string>[] = query.terms.map(term => {
      const postings = this.index.searchTerm(term);
      return new Set(postings.map(p => p.docId));
    });

    let resultDocs: Set<string>;

    switch (query.operator) {
      case 'AND':
        resultDocs = this.intersectSets(docSets);
        break;
      case 'OR':
        resultDocs = this.unionSets(docSets);
        break;
      case 'NOT':
        resultDocs = this.differenceSets(docSets[0], docSets.slice(1));
        break;
      default:
        resultDocs = new Set();
    }

    const results: SearchResult[] = [];
    for (const docId of resultDocs) {
      const doc = this.index.getDocument(docId);
      if (doc) {
        results.push({
          document: doc,
          score: 1,
          highlights: this.generateHighlights(doc, query.terms)
        });
      }
    }

    return results;
  }

  /**
   * 短语查询
   */
  phraseSearch(phrase: string): SearchResult[] {
    const terms = this.tokenizer.tokenize(phrase);
    if (terms.length === 0) return [];

    // 获取包含所有词的文档
    const candidateDocs = this.getCandidateDocuments(terms);
    const results: SearchResult[] = [];

    for (const docId of candidateDocs) {
      // 检查短语是否连续出现
      if (this.isPhraseMatch(docId, terms)) {
        const doc = this.index.getDocument(docId);
        if (doc) {
          results.push({
            document: doc,
            score: 2.0, // 短语匹配权重更高
            highlights: this.generateHighlights(doc, terms)
          });
        }
      }
    }

    return results;
  }

  private getCandidateDocuments(terms: string[]): Set<string> {
    const docFreqs = terms.map(term => ({
      term,
      docIds: this.index.searchTerm(term).map(p => p.docId)
    }));

    // 按文档频率排序，从最少的开始
    docFreqs.sort((a, b) => a.docIds.length - b.docIds.length);

    if (docFreqs.length === 0) return new Set();

    // 从文档数最少的词开始交集
    let result = new Set(docFreqs[0].docIds);
    
    for (let i = 1; i < docFreqs.length; i++) {
      result = new Set([...result].filter(id => docFreqs[i].docIds.includes(id)));
      if (result.size === 0) break;
    }

    return result;
  }

  private isPhraseMatch(docId: string, terms: string[]): boolean {
    // 简化实现：检查词是否按顺序连续出现
    const firstTermPostings = this.index.searchTerm(terms[0]).filter(p => p.docId === docId);
    
    for (const posting of firstTermPostings) {
      for (const pos of posting.positions) {
        let match = true;
        
        for (let i = 1; i < terms.length; i++) {
          const termPostings = this.index.searchTerm(terms[i]).filter(p => p.docId === docId);
          const found = termPostings.some(p => p.positions.includes(pos + i));
          if (!found) {
            match = false;
            break;
          }
        }
        
        if (match) return true;
      }
    }

    return false;
  }

  private generateHighlights(doc: Document, terms: string[]): string[] {
    const highlights: string[] = [];
    const content = doc.content.toLowerCase();
    
    for (const term of terms) {
      const index = content.indexOf(term);
      if (index !== -1) {
        const start = Math.max(0, index - 30);
        const end = Math.min(doc.content.length, index + term.length + 30);
        const snippet = doc.content.slice(start, end);
        highlights.push(snippet);
      }
    }

    return highlights;
  }

  private intersectSets(sets: Set<string>[]): Set<string> {
    if (sets.length === 0) return new Set();
    
    let result = new Set(sets[0]);
    for (let i = 1; i < sets.length; i++) {
      result = new Set([...result].filter(x => sets[i].has(x)));
    }
    return result;
  }

  private unionSets(sets: Set<string>[]): Set<string> {
    const result = new Set<string>();
    for (const set of sets) {
      for (const item of set) {
        result.add(item);
      }
    }
    return result;
  }

  private differenceSets(first: Set<string>, rest: Set<string>[]): Set<string> {
    const result = new Set(first);
    for (const set of rest) {
      for (const item of set) {
        result.delete(item);
      }
    }
    return result;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 全文搜索演示 ===\n');

  // 创建索引
  const index = new InvertedIndex();

  // 添加文档
  const docs: Document[] = [
    {
      id: '1',
      title: 'Introduction to TypeScript',
      content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.'
    },
    {
      id: '2',
      title: 'Advanced JavaScript Patterns',
      content: 'Learn advanced patterns and techniques in JavaScript programming.'
    },
    {
      id: '3',
      title: 'React and TypeScript',
      content: 'Building React applications with TypeScript for better developer experience.'
    },
    {
      id: '4',
      title: 'Node.js Fundamentals',
      content: 'Understanding the basics of Node.js and server-side JavaScript.'
    }
  ];

  for (const doc of docs) {
    index.addDocument(doc);
  }

  console.log('Index stats:', index.getStats());

  // 创建查询处理器
  const processor = new QueryProcessor(index);

  // 1. 简单搜索
  console.log('\n--- 简单搜索 "javascript" ---');
  const results1 = processor.search('javascript');
  results1.forEach(r => {
    console.log(`  [${r.score.toFixed(2)}] ${r.document.title}`);
  });

  // 2. 多词搜索
  console.log('\n--- 多词搜索 "typescript react" ---');
  const results2 = processor.search('typescript react');
  results2.forEach(r => {
    console.log(`  [${r.score.toFixed(2)}] ${r.document.title}`);
  });

  // 3. 布尔查询
  console.log('\n--- 布尔查询 (javascript AND typescript) ---');
  const results3 = processor.booleanSearch({
    operator: 'AND',
    terms: ['javascript', 'typescript']
  });
  results3.forEach(r => {
    console.log(`  ${r.document.title}`);
  });

  // 4. 短语搜索
  console.log('\n--- 短语搜索 "typescript programming" ---');
  const results4 = processor.phraseSearch('typescript programming');
  console.log(`  Found ${results4.length} exact phrase matches`);
}
