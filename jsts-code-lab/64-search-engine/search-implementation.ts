/**
 * @file 搜索引擎实现
 * @category Search → Implementation
 * @difficulty hard
 * @tags search, full-text, faceted-search, suggestions
 */

export interface SearchDocument {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  category?: string;
  createdAt?: Date;
  [key: string]: unknown;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights?: string[];
}

// 倒排索引
export class InvertedIndex {
  private index: Map<string, Set<string>> = new Map();
  private documents: Map<string, SearchDocument> = new Map();
  
  addDocument(doc: SearchDocument): void {
    this.documents.set(doc.id, doc);
    
    // 分词并建立索引
    const tokens = this.tokenize(`${doc.title} ${doc.content}`);
    
    for (const token of tokens) {
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }
      this.index.get(token)!.add(doc.id);
    }
  }
  
  removeDocument(id: string): void {
    const doc = this.documents.get(id);
    if (!doc) return;
    
    const tokens = this.tokenize(`${doc.title} ${doc.content}`);
    for (const token of tokens) {
      this.index.get(token)?.delete(id);
    }
    
    this.documents.delete(id);
  }
  
  search(query: string): SearchResult[] {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return [];
    
    // 获取包含所有查询词的文档
    let docIds: Set<string> | null = null;
    
    for (const token of tokens) {
      const ids = this.index.get(token);
      if (!ids) return [];
      
      if (docIds === null) {
        docIds = new Set(ids);
      } else {
        docIds = new Set([...docIds].filter(id => ids.has(id)));
      }
    }
    
    if (!docIds || docIds.size === 0) return [];
    
    // 计算相关性分数
    return Array.from(docIds).map(id => {
      const doc = this.documents.get(id)!;
      const score = this.calculateScore(doc, tokens);
      return {
        document: doc,
        score,
        highlights: this.generateHighlights(doc, tokens)
      };
    }).sort((a, b) => b.score - a.score);
  }
  
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }
  
  private calculateScore(doc: SearchDocument, queryTokens: string[]): number {
    let score = 0;
    const titleTokens = this.tokenize(doc.title);
    const contentTokens = this.tokenize(doc.content);
    
    for (const token of queryTokens) {
      // 标题匹配权重更高
      if (titleTokens.includes(token)) {
        score += 3;
      }
      // 内容匹配
      if (contentTokens.includes(token)) {
        score += 1;
      }
    }
    
    return score;
  }
  
  private generateHighlights(doc: SearchDocument, tokens: string[]): string[] {
    const highlights: string[] = [];
    const content = doc.content.toLowerCase();
    
    for (const token of tokens) {
      const index = content.indexOf(token);
      if (index !== -1) {
        const start = Math.max(0, index - 30);
        const end = Math.min(doc.content.length, index + token.length + 30);
        highlights.push(doc.content.slice(start, end));
      }
    }
    
    return highlights;
  }
  
  getStats(): { documents: number; terms: number } {
    return {
      documents: this.documents.size,
      terms: this.index.size
    };
  }
}

// 分面搜索
export interface Facet {
  field: string;
  values: Array<{ value: string; count: number }>;
}

export class FacetedSearch {
  constructor(private index: InvertedIndex) {}
  
  searchWithFacets(
    query: string,
    filters?: Record<string, string[]>
  ): { results: SearchResult[]; facets: Facet[] } {
    // 基础搜索
    let results = this.index.search(query);
    
    // 应用分面过滤
    if (filters) {
      results = results.filter(r => {
        for (const [field, values] of Object.entries(filters)) {
          const docValue = r.document[field];
          if (!values.includes(String(docValue))) {
            return false;
          }
        }
        return true;
      });
    }
    
    // 计算分面
    const facets = this.calculateFacets(results);
    
    return { results, facets };
  }
  
  private calculateFacets(results: SearchResult[]): Facet[] {
    const categoryCounts = new Map<string, number>();
    const tagCounts = new Map<string, number>();
    
    for (const r of results) {
      if (r.document.category) {
        categoryCounts.set(
          r.document.category,
          (categoryCounts.get(r.document.category) || 0) + 1
        );
      }
      
      for (const tag of r.document.tags || []) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    }
    
    return [
      {
        field: 'category',
        values: Array.from(categoryCounts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
      },
      {
        field: 'tags',
        values: Array.from(tagCounts.entries())
          .map(([value, count]) => ({ value, count }))
          .sort((a, b) => b.count - a.count)
      }
    ];
  }
}

// 搜索建议
export class SearchSuggestions {
  private trie = new Map<string, any>();
  private frequencies = new Map<string, number>();
  
  addTerm(term: string, frequency: number = 1): void {
    this.frequencies.set(term, (this.frequencies.get(term) || 0) + frequency);
    
    let node = this.trie;
    for (const char of term.toLowerCase()) {
      if (!node.has(char)) {
        node.set(char, new Map());
      }
      node = node.get(char);
    }
    node.set('_end', true);
  }
  
  suggest(prefix: string, limit: number = 5): string[] {
    const prefixLower = prefix.toLowerCase();
    let node = this.trie;
    
    // 导航到前缀节点
    for (const char of prefixLower) {
      if (!node.has(char)) {
        return [];
      }
      node = node.get(char);
    }
    
    // 收集所有完成的词
    const completions: string[] = [];
    this.collectTerms(node, prefixLower, completions);
    
    // 按频率排序
    return completions
      .map(term => ({ term, freq: this.frequencies.get(term) || 0 }))
      .sort((a, b) => b.freq - a.freq)
      .slice(0, limit)
      .map(x => x.term);
  }
  
  private collectTerms(
    node: Map<string, any>,
    prefix: string,
    results: string[]
  ): void {
    if (node.has('_end')) {
      results.push(prefix);
    }
    
    for (const [char, child] of node.entries()) {
      if (char !== '_end') {
        this.collectTerms(child, prefix + char, results);
      }
    }
  }
}

export function demo(): void {
  console.log('=== 搜索引擎 ===\n');
  
  // 创建索引
  const index = new InvertedIndex();
  
  index.addDocument({
    id: '1',
    title: 'TypeScript入门教程',
    content: 'TypeScript是JavaScript的超集，添加了类型系统',
    category: 'tutorial',
    tags: ['typescript', 'javascript']
  });
  
  index.addDocument({
    id: '2',
    title: 'React最佳实践',
    content: '使用React构建高性能用户界面的方法',
    category: 'guide',
    tags: ['react', 'frontend']
  });
  
  index.addDocument({
    id: '3',
    title: 'JavaScript性能优化',
    content: '提升JavaScript代码执行速度的技巧',
    category: 'performance',
    tags: ['javascript', 'performance']
  });
  
  console.log('索引统计:', index.getStats());
  
  // 搜索
  const results = index.search('javascript typescript');
  console.log(`\n搜索 "javascript typescript":`);
  results.forEach(r => {
    console.log(`  ${r.document.title} (分数: ${r.score})`);
  });
  
  // 搜索建议
  const suggestions = new SearchSuggestions();
  suggestions.addTerm('typescript tutorial', 10);
  suggestions.addTerm('typescript best practices', 8);
  suggestions.addTerm('javascript performance', 15);
  suggestions.addTerm('javascript basics', 12);
  
  console.log('\n搜索建议 "type":', suggestions.suggest('type'));
}
