/**
 * @file 查询扩展器
 * @category Search Engine → Query Expansion
 * @difficulty medium
 * @tags search, query-expansion, synonym, spell-correction, query-rewriting
 *
 * @description
 * 查询扩展技术：通过同义词替换、拼写纠正和查询重写来改进搜索召回率。
 *
 * 扩展策略：
 * - 同义词扩展：将查询词替换或补充为其同义词
 * - 拼写纠正：基于编辑距离纠正拼写错误
 * - 查询规范化：大小写统一、去停用词、词干提取
 * - N-gram 扩展：将查询扩展为相邻词组合
 */

export interface ExpandedQuery {
  original: string;
  expansions: string[];
  corrections: string[];
  normalized: string;
}

// ==================== 同义词词典 ====================

export class SynonymDictionary {
  private synonyms = new Map<string, Set<string>>();

  addSynonym(word: string, synonyms: string[]): void {
    if (!this.synonyms.has(word)) {
      this.synonyms.set(word, new Set());
    }
    const set = this.synonyms.get(word)!;
    for (const s of synonyms) {
      set.add(s);
      // 双向映射
      if (!this.synonyms.has(s)) {
        this.synonyms.set(s, new Set());
      }
      this.synonyms.get(s)!.add(word);
    }
  }

  getSynonyms(word: string): string[] {
    return Array.from(this.synonyms.get(word.toLowerCase()) || []);
  }

  hasSynonyms(word: string): boolean {
    return this.synonyms.has(word.toLowerCase());
  }
}

// ==================== 拼写纠正器 ====================

export class SpellCorrector {
  private dictionary = new Set<string>();

  addWords(words: string[]): void {
    for (const word of words) {
      this.dictionary.add(word.toLowerCase());
    }
  }

  /**
   * 基于编辑距离找到最接近的正确拼写
   */
  correct(word: string): string | null {
    const lower = word.toLowerCase();
    if (this.dictionary.has(lower)) return word;

    let bestMatch: string | null = null;
    let bestDistance = Infinity;

    for (const dictWord of this.dictionary) {
      const dist = this.levenshtein(lower, dictWord);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = dictWord;
      }
    }

    // 如果最小编辑距离太大，不纠正
    if (bestDistance > Math.max(2, lower.length * 0.4)) {
      return null;
    }

    return bestMatch;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        const cost = a[j - 1] === b[i - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    return matrix[b.length][a.length];
  }
}

// ==================== 查询规范化器 ====================

export class QueryNormalizer {
  private stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'of', 'in', 'to', 'for', 'with', 'on', 'at', 'by', 'from'
  ]);

  /**
   * 规范化查询字符串
   */
  normalize(query: string): string {
    return query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0 && !this.stopWords.has(token))
      .join(' ');
  }

  /** 提取词干（简化版） */
  stem(word: string): string {
    const suffixes = ['ing', 'ly', 'ed', 'er', 'est', 'tion', 's'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }
    return word;
  }

  /** 生成 N-gram */
  ngrams(tokens: string[], n: number): string[] {
    const result: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      result.push(tokens.slice(i, i + n).join(' '));
    }
    return result;
  }
}

// ==================== 查询扩展器 ====================

export class QueryExpander {
  private synonymDict = new SynonymDictionary();
  private spellCorrector = new SpellCorrector();
  private normalizer = new QueryNormalizer();

  addSynonyms(word: string, synonyms: string[]): void {
    this.synonymDict.addSynonym(word, synonyms);
  }

  addDictionaryWords(words: string[]): void {
    this.spellCorrector.addWords(words);
  }

  /**
   * 扩展查询
   */
  expand(query: string): ExpandedQuery {
    const normalized = this.normalizer.normalize(query);
    const tokens = normalized.split(/\s+/).filter(t => t.length > 0);

    // 拼写纠正
    const corrections: string[] = [];
    for (const token of tokens) {
      const corrected = this.spellCorrector.correct(token);
      if (corrected && corrected !== token) {
        corrections.push(corrected);
      }
    }

    // 同义词扩展
    const expansions: string[] = [];
    for (const token of tokens) {
      const synonyms = this.synonymDict.getSynonyms(token);
      for (const syn of synonyms) {
        const expanded = tokens.map(t => (t === token ? syn : t)).join(' ');
        if (!expansions.includes(expanded) && expanded !== normalized) {
          expansions.push(expanded);
        }
      }
    }

    // N-gram 扩展
    if (tokens.length >= 2) {
      const bigrams = this.normalizer.ngrams(tokens, 2);
      for (const bigram of bigrams) {
        if (!expansions.includes(bigram) && bigram !== normalized) {
          expansions.push(bigram);
        }
      }
    }

    return {
      original: query,
      normalized,
      corrections,
      expansions
    };
  }

  /**
   * 生成所有可能的查询变体（用于搜索）
   */
  generateVariations(query: string): string[] {
    const expanded = this.expand(query);
    const variations = new Set<string>();

    variations.add(expanded.normalized);

    // 如果有纠正，也尝试纠正后的版本
    if (expanded.corrections.length > 0) {
      const tokens = expanded.normalized.split(/\s+/);
      for (let i = 0; i < tokens.length; i++) {
        const corrected = this.spellCorrector.correct(tokens[i]);
        if (corrected) {
          const correctedQuery = tokens.map((t, idx) => idx === i ? corrected : t).join(' ');
          variations.add(correctedQuery);
        }
      }
    }

    for (const exp of expanded.expansions) {
      variations.add(exp);
    }

    return Array.from(variations);
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 查询扩展 ===\n');

  const expander = new QueryExpander();

  // 添加同义词
  expander.addSynonyms('javascript', ['js', 'ecmascript']);
  expander.addSynonyms('typescript', ['ts']);
  expander.addSynonyms('react', ['reactjs', 'react.js']);

  // 添加词典用于拼写纠正
  expander.addDictionaryWords([
    'javascript', 'typescript', 'react', 'angular', 'vue',
    'node', 'python', 'java', 'programming', 'tutorial'
  ]);

  // 1. 同义词扩展
  console.log('--- 同义词扩展 ---');
  const result1 = expander.expand('javascript tutorial');
  console.log(`  原始: ${result1.original}`);
  console.log(`  规范化: ${result1.normalized}`);
  console.log(`  扩展: ${result1.expansions.join(', ')}`);

  // 2. 拼写纠正
  console.log('\n--- 拼写纠正 ---');
  const result2 = expander.expand('javascrpt tutorial');
  console.log(`  原始: ${result2.original}`);
  console.log(`  纠正: ${result2.corrections.join(', ')}`);

  // 3. 查询变体
  console.log('\n--- 查询变体 ---');
  const variations = expander.generateVariations('typescript react');
  variations.forEach(v => console.log(`  - ${v}`));
}
