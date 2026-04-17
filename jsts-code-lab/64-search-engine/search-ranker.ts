/**
 * @file 搜索结果排序器
 * @category Search Engine → Ranking
 * @difficulty hard
 * @tags search, bm25, relevance, ranking, diversity
 *
 * @description
 * 搜索结果排序与重排序实现，包含 BM25 评分、结果去重和多样性重排。
 *
 * 评分模型：
 * - BM25: 经典的概率检索模型，优于 TF-IDF
 * - 组合评分: 融合相关性、时效性、点击率信号
 * - 多样性: MMR (Maximal Marginal Relevance) 避免结果冗余
 */

export interface RankableDocument {
  id: string;
  title: string;
  content: string;
  length: number;
  [field: string]: unknown;
}

export interface RankedResult {
  document: RankableDocument;
  score: number;
  rank: number;
}

// ==================== BM25 评分器 ====================

export interface BM25Options {
  k1: number;
  b: number;
}

export class BM25Scorer {
  private avgDocLength: number;
  private totalDocs: number;

  constructor(
    private documents: RankableDocument[],
    private options: BM25Options = { k1: 1.5, b: 0.75 }
  ) {
    this.totalDocs = documents.length;
    const totalLength = documents.reduce((sum, d) => sum + d.length, 0);
    this.avgDocLength = totalLength / Math.max(1, this.totalDocs);
  }

  /**
   * 计算 BM25 分数
   * @param docId 文档 ID
   * @param term 查询词
   * @param termFreq 词在文档中的频率
   * @param docFreq 包含该词的文档数
   */
  score(docId: string, term: string, termFreq: number, docFreq: number): number {
    const doc = this.documents.find(d => d.id === docId);
    if (!doc) return 0;

    const idf = this.idf(docFreq);
    const tfNorm = this.tfNormalization(termFreq, doc.length);

    return idf * tfNorm;
  }

  private idf(docFreq: number): number {
    const n = this.totalDocs - docFreq + 0.5;
    const d = docFreq + 0.5;
    return Math.log(1 + n / d);
  }

  private tfNormalization(termFreq: number, docLength: number): number {
    const { k1, b } = this.options;
    return (termFreq * (k1 + 1)) /
      (termFreq + k1 * (1 - b + b * (docLength / this.avgDocLength)));
  }
}

// ==================== 组合评分器 ====================

export interface ScoringSignal {
  name: string;
  weight: number;
  scoreFn: (doc: RankableDocument, query: string) => number;
}

export class CompositeRanker {
  private signals: ScoringSignal[] = [];

  addSignal(signal: ScoringSignal): void {
    this.signals.push(signal);
  }

  /**
   * 对文档进行组合评分
   */
  rank(documents: RankableDocument[], query: string): RankedResult[] {
    const scored = documents.map(doc => {
      let score = 0;
      for (const signal of this.signals) {
        score += signal.weight * signal.scoreFn(doc, query);
      }
      return { document: doc, score, rank: 0 };
    });

    scored.sort((a, b) => b.score - a.score);

    // 分配排名
    for (let i = 0; i < scored.length; i++) {
      scored[i].rank = i + 1;
    }

    return scored;
  }
}

// ==================== 去重引擎 ====================

export interface DedupOptions {
  /** 相似度阈值，超过则视为重复 */
  threshold: number;
  /** 用于比较的特征字段 */
  fields: string[];
}

export class DedupEngine {
  constructor(private options: DedupOptions) {}

  /**
   * 对结果进行去重，保留每组重复中的第一个
   */
  deduplicate(results: RankedResult[]): RankedResult[] {
    const kept: RankedResult[] = [];

    for (const result of results) {
      let isDuplicate = false;

      for (const existing of kept) {
        if (this.similarity(result.document, existing.document) >= this.options.threshold) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        kept.push(result);
      }
    }

    return kept;
  }

  private similarity(a: RankableDocument, b: RankableDocument): number {
    const featuresA = this.extractFeatures(a);
    const featuresB = this.extractFeatures(b);

    const intersection = featuresA.filter(f => featuresB.includes(f));
    const union = new Set([...featuresA, ...featuresB]);

    return union.size === 0 ? 0 : intersection.length / union.size;
  }

  private extractFeatures(doc: RankableDocument): string[] {
    const features: string[] = [];

    for (const field of this.options.fields) {
      const value = doc[field];
      if (typeof value === 'string') {
        features.push(...this.tokenize(value));
      }
    }

    return [...new Set(features)];
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }
}

// ==================== 多样性重排 (MMR) ====================

export class MMRReRanker {
  /**
   * Maximal Marginal Relevance 重排
   * @param results 初始排序结果
   * @param lambda 相关性权重 (0-1)，1=完全按相关性，0=完全按多样性
   * @param maxResults 最大返回结果数
   */
  reRank(results: RankedResult[], lambda = 0.5, maxResults = 10): RankedResult[] {
    const selected: RankedResult[] = [];
    const remaining = [...results];

    while (selected.length < maxResults && remaining.length > 0) {
      let bestIndex = 0;
      let bestScore = -Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const relevance = remaining[i].score;
        const diversity = this.maxSimilarity(remaining[i], selected);
        const mmrScore = lambda * relevance - (1 - lambda) * diversity;

        if (mmrScore > bestScore) {
          bestScore = mmrScore;
          bestIndex = i;
        }
      }

      const chosen = remaining.splice(bestIndex, 1)[0];
      chosen.rank = selected.length + 1;
      selected.push(chosen);
    }

    return selected;
  }

  private maxSimToSelected(result: RankedResult, selected: RankedResult[]): number {
    if (selected.length === 0) return 0;

    let maxSim = 0;
    for (const s of selected) {
      const sim = this.documentSimilarity(result.document, s.document);
      if (sim > maxSim) maxSim = sim;
    }

    return maxSim;
  }

  private maxSimilarity(result: RankedResult, selected: RankedResult[]): number {
    return this.maxSimToSelected(result, selected);
  }

  private documentSimilarity(a: RankableDocument, b: RankableDocument): number {
    const tokensA = new Set(this.tokenize(`${a.title} ${a.content}`));
    const tokensB = new Set(this.tokenize(`${b.title} ${b.content}`));

    const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
    const union = new Set([...tokensA, ...tokensB]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
  }
}

// ==================== 排序管线 ====================

export class RankingPipeline {
  private bm25Scorer?: BM25Scorer;
  private compositeRanker = new CompositeRanker();
  private dedupEngine?: DedupEngine;
  private mmrReRanker = new MMRReRanker();

  setBM25Scorer(scorer: BM25Scorer): void {
    this.bm25Scorer = scorer;
  }

  addScoringSignal(signal: ScoringSignal): void {
    this.compositeRanker.addSignal(signal);
  }

  setDedupEngine(engine: DedupEngine): void {
    this.dedupEngine = engine;
  }

  /**
   * 执行完整排序管线
   */
  process(
    documents: RankableDocument[],
    query: string,
    options: {
      useMMR?: boolean;
      mmrLambda?: number;
      maxResults?: number;
      deduplicate?: boolean;
    } = {}
  ): RankedResult[] {
    const { useMMR = false, mmrLambda = 0.5, maxResults = 20, deduplicate = false } = options;

    // 1. 基础评分
    let results = this.compositeRanker.rank(documents, query);

    // 2. 去重
    if (deduplicate && this.dedupEngine) {
      results = this.dedupEngine.deduplicate(results);
    }

    // 3. MMR 多样性重排
    if (useMMR) {
      results = this.mmrReRanker.reRank(results, mmrLambda, maxResults);
    } else {
      results = results.slice(0, maxResults);
      for (let i = 0; i < results.length; i++) {
        results[i].rank = i + 1;
      }
    }

    return results;
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 搜索结果排序 ===\n');

  const documents: RankableDocument[] = [
    { id: '1', title: 'TypeScript Tutorial', content: 'Learn TypeScript from scratch', length: 120 },
    { id: '2', title: 'Advanced TypeScript', content: 'Deep dive into TypeScript types', length: 200 },
    { id: '3', title: 'TypeScript vs JavaScript', content: 'Compare TypeScript and JavaScript', length: 150 },
    { id: '4', title: 'JavaScript Basics', content: 'Introduction to JavaScript programming', length: 100 },
    { id: '5', title: 'React with TypeScript', content: 'Build React apps using TypeScript', length: 180 }
  ];

  // BM25 评分演示
  console.log('--- BM25 评分 ---');
  const bm25 = new BM25Scorer(documents);
  const score = bm25.score('1', 'typescript', 2, 4);
  console.log(`  BM25 score for doc 1, term "typescript", tf=2, df=4: ${score.toFixed(3)}`);

  // 组合评分演示
  console.log('\n--- 组合评分 ---');
  const pipeline = new RankingPipeline();

  pipeline.addScoringSignal({
    name: 'title-match',
    weight: 2.0,
    scoreFn: (doc, query) => {
      const q = query.toLowerCase();
      return doc.title.toLowerCase().includes(q) ? 1.0 : 0.0;
    }
  });

  pipeline.addScoringSignal({
    name: 'content-match',
    weight: 1.0,
    scoreFn: (doc, query) => {
      const q = query.toLowerCase();
      return doc.content.toLowerCase().includes(q) ? 1.0 : 0.0;
    }
  });

  pipeline.addScoringSignal({
    name: 'recency',
    weight: 0.5,
    scoreFn: (doc) => {
      // 模拟：ID 越大越新
      const id = parseInt(doc.id, 10);
      return id / 5;
    }
  });

  const results = pipeline.process(documents, 'typescript', { maxResults: 5 });
  results.forEach(r => {
    console.log(`  [${r.rank}] ${r.document.title} (score: ${r.score.toFixed(2)})`);
  });

  // MMR 多样性重排
  console.log('\n--- MMR 多样性重排 (lambda=0.3) ---');
  const mmrResults = pipeline.process(documents, 'typescript', {
    useMMR: true,
    mmrLambda: 0.3,
    maxResults: 4
  });
  mmrResults.forEach(r => {
    console.log(`  [${r.rank}] ${r.document.title}`);
  });
}
