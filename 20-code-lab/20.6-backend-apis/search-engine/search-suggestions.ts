/**
 * @file 搜索建议
 * @category Search Engine → Search Suggestions
 * @difficulty medium
 * @tags autocomplete, typeahead, suggestions, fuzzy-search
 *
 * @description
 * 搜索建议实现：前缀树、模糊匹配、热门搜索、个性化建议
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface Suggestion {
  text: string;
  score: number;
  type: 'history' | 'popular' | 'prefix' | 'fuzzy';
  metadata?: Record<string, unknown>;
}

export interface SearchHistory {
  query: string;
  timestamp: number;
  count: number;
}

// ============================================================================
// 前缀树 (Trie)
// ============================================================================

interface TrieNode {
  children: Map<string, TrieNode>;
  isEnd: boolean;
  frequency: number;
  completions: string[];
}

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = {
      children: new Map(),
      isEnd: false,
      frequency: 0,
      completions: []
    };
  }

  /**
   * 插入词
   */
  insert(word: string, frequency = 1): void {
    let node = this.root;
    
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) {
        node.children.set(char, {
          children: new Map(),
          isEnd: false,
          frequency: 0,
          completions: []
        });
      }
      node = node.children.get(char)!;
      
      // 记录可能的补全
      if (!node.completions.includes(word)) {
        node.completions.push(word);
        // 按频率排序并限制数量
        node.completions.sort((a, b) => this.getFrequency(b) - this.getFrequency(a));
        if (node.completions.length > 5) {
          node.completions.pop();
        }
      }
    }
    
    node.isEnd = true;
    node.frequency += frequency;
  }

  /**
   * 搜索前缀
   */
  searchPrefix(prefix: string): string[] {
    let node = this.root;
    
    for (const char of prefix.toLowerCase()) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }
    
    return this.collectCompletions(node, prefix);
  }

  /**
   * 获取自动完成建议
   */
  autocomplete(prefix: string, limit = 5): Suggestion[] {
    const completions = this.searchPrefix(prefix);
    
    return completions
      .slice(0, limit)
      .map(text => ({
        text,
        score: this.getFrequency(text),
        type: 'prefix' as const
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * 模糊搜索（允许一个字符差异）
   */
  fuzzySearch(word: string, maxDistance = 1): string[] {
    const results: string[] = [];
    this.fuzzySearchRecursive(this.root, '', word, 0, maxDistance, results);
    return results;
  }

  private fuzzySearchRecursive(
    node: TrieNode,
    current: string,
    target: string,
    index: number,
    maxDistance: number,
    results: string[]
  ): void {
    if (maxDistance < 0) return;

    if (index === target.length) {
      if (node.isEnd) {
        results.push(current);
      }
      return;
    }

    const char = target[index].toLowerCase();

    // 精确匹配
    if (node.children.has(char)) {
      this.fuzzySearchRecursive(
        node.children.get(char)!,
        current + char,
        target,
        index + 1,
        maxDistance,
        results
      );
    }

    // 尝试跳过（删除）
    this.fuzzySearchRecursive(node, current, target, index + 1, maxDistance - 1, results);

    // 尝试替换
    for (const [childChar, childNode] of node.children) {
      if (childChar !== char) {
        this.fuzzySearchRecursive(childNode, current + childChar, target, index + 1, maxDistance - 1, results);
      }
    }

    // 尝试插入
    for (const [childChar, childNode] of node.children) {
      this.fuzzySearchRecursive(childNode, current + childChar, target, index, maxDistance - 1, results);
    }
  }

  private collectCompletions(node: TrieNode, prefix: string): string[] {
    const results: string[] = [];
    
    if (node.isEnd) {
      // 从频率映射中恢复原始词
      results.push(prefix);
    }

    // 优先使用预计算的补全
    for (const completion of node.completions) {
      if (!results.includes(completion)) {
        results.push(completion);
      }
    }

    return results;
  }

  private getFrequency(word: string): number {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children.has(char)) return 0;
      node = node.children.get(char)!;
    }
    return node.isEnd ? node.frequency : 0;
  }
}

// ============================================================================
// 搜索历史管理器
// ============================================================================

export class SearchHistoryManager {
  private history = new Map<string, SearchHistory>();
  private maxSize: number;

  constructor(maxSize = 100) {
    this.maxSize = maxSize;
  }

  /**
   * 记录搜索
   */
  record(query: string): void {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return;

    const existing = this.history.get(normalized);
    if (existing) {
      existing.count++;
      existing.timestamp = Date.now();
    } else {
      this.history.set(normalized, {
        query: normalized,
        timestamp: Date.now(),
        count: 1
      });
    }

    // 清理旧记录
    if (this.history.size > this.maxSize) {
      this.cleanup();
    }
  }

  /**
   * 获取搜索历史建议
   */
  getSuggestions(prefix: string, limit = 5): Suggestion[] {
    const normalizedPrefix = prefix.toLowerCase();
    
    return Array.from(this.history.values())
      .filter(h => h.query.startsWith(normalizedPrefix))
      .sort((a, b) => {
        // 优先按频率，其次按时间
        if (b.count !== a.count) return b.count - a.count;
        return b.timestamp - a.timestamp;
      })
      .slice(0, limit)
      .map(h => ({
        text: h.query,
        score: h.count,
        type: 'history' as const
      }));
  }

  /**
   * 获取热门搜索
   */
  getPopular(limit = 5): Suggestion[] {
    return Array.from(this.history.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(h => ({
        text: h.query,
        score: h.count,
        type: 'popular' as const
      }));
  }

  /**
   * 清除历史
   */
  clear(): void {
    this.history.clear();
  }

  private cleanup(): void {
    // 删除最老的记录
    const sorted = Array.from(this.history.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    const toDelete = Math.floor(this.maxSize * 0.2); // 删除 20%
    for (let i = 0; i < toDelete; i++) {
      this.history.delete(sorted[i][0]);
    }
  }
}

// ============================================================================
// 搜索建议引擎
// ============================================================================

export class SuggestionEngine {
  private trie: Trie;
  private historyManager: SearchHistoryManager;
  private popularSearches = new Map<string, number>();

  constructor(options: { maxHistory?: number } = {}) {
    this.trie = new Trie();
    this.historyManager = new SearchHistoryManager(options.maxHistory);
  }

  /**
   * 添加词典词
   */
  addWord(word: string, frequency = 1): void {
    this.trie.insert(word, frequency);
  }

  /**
   * 批量添加词典
   */
  addDictionary(words: string[]): void {
    for (const word of words) {
      this.addWord(word, 1);
    }
  }

  /**
   * 记录搜索
   */
  recordSearch(query: string): void {
    this.historyManager.record(query);
    this.popularSearches.set(query, (this.popularSearches.get(query) || 0) + 1);
  }

  /**
   * 获取搜索建议
   */
  getSuggestions(query: string, options: {
    limit?: number;
    includeHistory?: boolean;
    includePopular?: boolean;
    includeFuzzy?: boolean;
  } = {}): Suggestion[] {
    const {
      limit = 5,
      includeHistory = true,
      includePopular = true,
      includeFuzzy = true
    } = options;

    const suggestions: Suggestion[] = [];
    const seen = new Set<string>();

    // 1. 历史搜索建议
    if (includeHistory) {
      const historySuggestions = this.historyManager.getSuggestions(query, limit);
      for (const s of historySuggestions) {
        if (!seen.has(s.text)) {
          suggestions.push(s);
          seen.add(s.text);
        }
      }
    }

    // 2. 前缀补全
    const prefixSuggestions = this.trie.autocomplete(query, limit);
    for (const s of prefixSuggestions) {
      if (!seen.has(s.text)) {
        suggestions.push(s);
        seen.add(s.text);
      }
    }

    // 3. 模糊匹配
    if (includeFuzzy && suggestions.length < limit) {
      const fuzzyResults = this.trie.fuzzySearch(query, 1);
      for (const text of fuzzyResults) {
        if (!seen.has(text) && suggestions.length < limit) {
          suggestions.push({
            text,
            score: 0.5,
            type: 'fuzzy'
          });
          seen.add(text);
        }
      }
    }

    // 4. 热门搜索（如果没有足够建议）
    if (includePopular && suggestions.length < limit && query.length < 2) {
      const popular = this.historyManager.getPopular(limit - suggestions.length);
      for (const s of popular) {
        if (!seen.has(s.text)) {
          suggestions.push(s);
          seen.add(s.text);
        }
      }
    }

    return suggestions.slice(0, limit);
  }

  /**
   * 获取热门搜索
   */
  getTrending(limit = 10): Suggestion[] {
    return Array.from(this.popularSearches.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([text, count]) => ({
        text,
        score: count,
        type: 'popular' as const
      }));
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 搜索建议演示 ===\n');

  // 创建建议引擎
  const engine = new SuggestionEngine();

  // 添加词典
  const dictionary = [
    'javascript', 'javascript tutorial', 'javascript array', 'javascript promise',
    'typescript', 'typescript generic', 'typescript interface',
    'react', 'react hooks', 'react context', 'react router',
    'vue', 'vue composition api', 'vuex',
    'angular', 'angular directive', 'angular service',
    'node.js', 'node.js express', 'node.js middleware',
    'python', 'python django', 'python flask',
    'database', 'database design', 'database optimization'
  ];
  
  engine.addDictionary(dictionary);

  // 模拟搜索历史
  const searches = [
    'javascript', 'javascript', 'javascript',
    'react hooks', 'react hooks',
    'typescript',
    'node.js', 'node.js',
    'database'
  ];
  
  for (const query of searches) {
    engine.recordSearch(query);
  }

  // 1. 前缀补全
  console.log('--- 前缀补全 "java" ---');
  const suggestions1 = engine.getSuggestions('java');
  suggestions1.forEach(s => {
    console.log(`  [${s.type}] ${s.text} (score: ${s.score})`);
  });

  // 2. 搜索建议（包含历史）
  console.log('\n--- 搜索建议 "re" ---');
  const suggestions2 = engine.getSuggestions('re');
  suggestions2.forEach(s => {
    console.log(`  [${s.type}] ${s.text} (score: ${s.score})`);
  });

  // 3. 模糊匹配
  console.log('\n--- 模糊匹配 "javascipt" (typo) ---');
  const suggestions3 = engine.getSuggestions('javascipt', { includeFuzzy: true });
  suggestions3.forEach(s => {
    console.log(`  [${s.type}] ${s.text} (score: ${s.score})`);
  });

  // 4. 热门搜索
  console.log('\n--- 热门搜索 ---');
  const trending = engine.getTrending(5);
  trending.forEach((s, i) => {
    console.log(`  ${i + 1}. ${s.text} (${s.score} searches)`);
  });

  // 5. Trie 单独演示
  console.log('\n--- Trie 模糊搜索 "typescrit" ---');
  const trie = new Trie();
  dictionary.forEach(word => { trie.insert(word, Math.floor(Math.random() * 10) + 1); });
  
  const fuzzyResults = trie.fuzzySearch('typescrit', 1);
  console.log('  Did you mean:', fuzzyResults.join(', '));
}
