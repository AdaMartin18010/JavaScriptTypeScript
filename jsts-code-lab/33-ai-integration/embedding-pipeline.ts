/**
 * @file Embedding Pipeline
 * @category AI Integration → Embeddings
 * @difficulty medium
 * @tags ai, embeddings, vector-store, similarity-search, text-chunking, hybrid-search
 *
 * @description
 * Embedding 与向量操作实现：
 * - 文本分块策略（固定长度、语义、递归）
 * - 向量存储接口（内存 + 持久化）
 * - 元数据过滤的相似度搜索
 * - 混合搜索（关键词 + 向量）
 */

// ============================================================================
// 1. 文本分块策略
// ============================================================================

export interface TextChunk {
  id: string;
  content: string;
  startIndex: number;
  endIndex: number;
  metadata: Record<string, unknown>;
}

export interface ChunkingOptions {
  chunkSize: number;
  overlap: number;
  separator?: string;
}

export abstract class ChunkingStrategy {
  abstract chunk(text: string, options: ChunkingOptions): TextChunk[];

  protected generateId(): string {
    return `chunk_${Math.random().toString(36).substring(2, 10)}`;
  }
}

/** 固定长度分块 */
export class FixedSizeChunking extends ChunkingStrategy {
  chunk(text: string, options: ChunkingOptions): TextChunk[] {
    const { chunkSize, overlap } = options;
    const step = chunkSize - overlap;
    const chunks: TextChunk[] = [];

    for (let i = 0; i < text.length; i += step) {
      const end = Math.min(i + chunkSize, text.length);
      chunks.push({
        id: this.generateId(),
        content: text.slice(i, end),
        startIndex: i,
        endIndex: end,
        metadata: { strategy: 'fixed', index: chunks.length }
      });

      if (end >= text.length) break;
    }

    return chunks;
  }
}

/** 语义分块（按段落/句子边界） */
export class SemanticChunking extends ChunkingStrategy {
  chunk(text: string, options: ChunkingOptions): TextChunk[] {
    const { chunkSize, separator = '\n\n' } = options;
    const paragraphs = text.split(separator);
    const chunks: TextChunk[] = [];
    let current: string[] = [];
    let currentLength = 0;
    let startIndex = 0;

    for (const para of paragraphs) {
      if (currentLength + para.length > chunkSize && current.length > 0) {
        const content = current.join(separator);
        chunks.push({
          id: this.generateId(),
          content,
          startIndex,
          endIndex: startIndex + content.length,
          metadata: { strategy: 'semantic', paragraphs: current.length }
        });
        startIndex += content.length + separator.length;
        current = [para];
        currentLength = para.length;
      } else {
        current.push(para);
        currentLength += para.length + separator.length;
      }
    }

    if (current.length > 0) {
      const content = current.join(separator);
      chunks.push({
        id: this.generateId(),
        content,
        startIndex,
        endIndex: startIndex + content.length,
        metadata: { strategy: 'semantic', paragraphs: current.length }
      });
    }

    return chunks;
  }
}

/** 递归分块（先按大分隔符，再递归细分） */
export class RecursiveChunking extends ChunkingStrategy {
  private separators = ['\n\n', '\n', '. ', '? ', '! ', ' ', ''];

  chunk(text: string, options: ChunkingOptions): TextChunk[] {
    return this.recursiveSplit(text, options.chunkSize, 0, 0);
  }

  private recursiveSplit(
    text: string,
    chunkSize: number,
    sepIndex: number,
    globalOffset: number
  ): TextChunk[] {
    if (text.length <= chunkSize || sepIndex >= this.separators.length) {
      return text.length === 0 ? [] : [{
        id: this.generateId(),
        content: text,
        startIndex: globalOffset,
        endIndex: globalOffset + text.length,
        metadata: { strategy: 'recursive', sepLevel: sepIndex }
      }];
    }

    const sep = this.separators[sepIndex];
    const parts = sep === '' ? text.split('') : text.split(sep);
    const chunks: TextChunk[] = [];
    let current = '';
    let offset = globalOffset;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const withSep = i < parts.length - 1 && sep !== '' ? part + sep : part;

      if (current.length + withSep.length > chunkSize && current.length > 0) {
        chunks.push(...this.recursiveSplit(current, chunkSize, sepIndex + 1, offset));
        offset += current.length;
        current = withSep;
      } else {
        current += withSep;
      }
    }

    if (current.length > 0) {
      chunks.push(...this.recursiveSplit(current, chunkSize, sepIndex + 1, offset));
    }

    return chunks;
  }
}

// ============================================================================
// 2. 向量存储接口
// ============================================================================

export interface VectorRecord {
  id: string;
  vector: number[];
  text: string;
  metadata: Record<string, unknown>;
}

export interface VectorSearchResult {
  record: VectorRecord;
  score: number;
}

export interface VectorStore {
  add(record: VectorRecord): Promise<void>;
  addMany(records: VectorRecord[]): Promise<void>;
  search(query: number[], topK: number, filter?: MetadataFilter): Promise<VectorSearchResult[]>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
}

export type MetadataFilter = Record<string, string | number | boolean | { $gt?: number; $lt?: number; $gte?: number; $lte?: number; $eq?: unknown }>;

/** 内存向量存储 */
export class InMemoryVectorStore implements VectorStore {
  private records: VectorRecord[] = [];

  async add(record: VectorRecord): Promise<void> {
    this.records.push(record);
  }

  async addMany(records: VectorRecord[]): Promise<void> {
    this.records.push(...records);
  }

  async search(
    query: number[],
    topK: number,
    filter?: MetadataFilter
  ): Promise<VectorSearchResult[]> {
    let candidates = this.records;

    if (filter) {
      candidates = candidates.filter(r => this.matchesFilter(r.metadata, filter));
    }

    const scored = candidates.map(r => ({
      record: r,
      score: this.cosineSimilarity(query, r.vector)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }

  async delete(id: string): Promise<void> {
    this.records = this.records.filter(r => r.id !== id);
  }

  async count(): Promise<number> {
    return this.records.length;
  }

  private matchesFilter(metadata: Record<string, unknown>, filter: MetadataFilter): boolean {
    for (const [key, condition] of Object.entries(filter)) {
      const value = metadata[key];

      if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
        const op = condition as { $gt?: number; $lt?: number; $gte?: number; $lte?: number; $eq?: unknown };
        if (op.$gt !== undefined && !(typeof value === 'number' && value > op.$gt)) return false;
        if (op.$lt !== undefined && !(typeof value === 'number' && value < op.$lt)) return false;
        if (op.$gte !== undefined && !(typeof value === 'number' && value >= op.$gte)) return false;
        if (op.$lte !== undefined && !(typeof value === 'number' && value <= op.$lte)) return false;
        if (op.$eq !== undefined && value !== op.$eq) return false;
      } else if (value !== condition) {
        return false;
      }
    }
    return true;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }
}

/** 持久化向量存储（基于 JSON 文件） */
export class PersistentVectorStore extends InMemoryVectorStore {
  private filePath: string;
  private dirty = false;

  constructor(filePath: string) {
    super();
    this.filePath = filePath;
  }

  async add(record: VectorRecord): Promise<void> {
    await super.add(record);
    this.dirty = true;
  }

  async addMany(records: VectorRecord[]): Promise<void> {
    await super.addMany(records);
    this.dirty = true;
  }

  async delete(id: string): Promise<void> {
    await super.delete(id);
    this.dirty = true;
  }

  async save(): Promise<void> {
    if (!this.dirty) return;
    // 实际项目中使用 fs.writeFile
    console.log(`[VectorStore] Saved ${await this.count()} records to ${this.filePath}`);
    this.dirty = false;
  }

  async load(): Promise<void> {
    console.log(`[VectorStore] Loading from ${this.filePath}`);
    // 实际项目中使用 fs.readFile + JSON.parse
  }
}

// ============================================================================
// 3. 混合搜索（关键词 + 向量）
// ============================================================================

export interface HybridSearchResult extends VectorSearchResult {
  keywordScore: number;
  vectorScore: number;
  combinedScore: number;
}

export class HybridSearchEngine {
  private vectorStore: VectorStore;
  private vectorWeight: number;
  private keywordWeight: number;

  constructor(
    vectorStore: VectorStore,
    options: { vectorWeight?: number; keywordWeight?: number } = {}
  ) {
    this.vectorStore = vectorStore;
    this.vectorWeight = options.vectorWeight ?? 0.7;
    this.keywordWeight = options.keywordWeight ?? 0.3;
  }

  async search(
    queryVector: number[],
    queryText: string,
    topK: number,
    filter?: MetadataFilter
  ): Promise<HybridSearchResult[]> {
    // 向量搜索
    const vectorResults = await this.vectorStore.search(queryVector, topK * 3, filter);

    // 关键词搜索（简单的 TF-IDF 近似）
    const keywords = this.extractKeywords(queryText);
    const keywordScores = new Map<string, number>();

    for (const vr of vectorResults) {
      const score = this.keywordScore(keywords, vr.record.text);
      keywordScores.set(vr.record.id, score);
    }

    // 合并分数
    const combined: HybridSearchResult[] = vectorResults.map(vr => {
      const kwScore = keywordScores.get(vr.record.id) || 0;
      return {
        record: vr.record,
        score: this.vectorWeight * vr.score + this.keywordWeight * kwScore,
        vectorScore: vr.score,
        keywordScore: kwScore,
        combinedScore: this.vectorWeight * vr.score + this.keywordWeight * kwScore
      };
    });

    combined.sort((a, b) => b.combinedScore - a.combinedScore);
    return combined.slice(0, topK);
  }

  private extractKeywords(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2);
  }

  private keywordScore(keywords: string[], text: string): number {
    const lower = text.toLowerCase();
    let matches = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) matches++;
    }
    return keywords.length > 0 ? matches / keywords.length : 0;
  }
}

// ============================================================================
// 4. Embedding Pipeline 组合
// ============================================================================

export interface EmbeddingPipelineConfig {
  chunking: ChunkingStrategy;
  chunkOptions: ChunkingOptions;
  vectorStore: VectorStore;
  embedFn: (text: string) => number[] | Promise<number[]>;
}

export class EmbeddingPipeline {
  private config: EmbeddingPipelineConfig;

  constructor(config: EmbeddingPipelineConfig) {
    this.config = config;
  }

  async ingest(document: string, metadata: Record<string, unknown> = {}): Promise<void> {
    const chunks = this.config.chunking.chunk(document, this.config.chunkOptions);
    const records: VectorRecord[] = [];

    for (const chunk of chunks) {
      const vector = await this.config.embedFn(chunk.content);
      records.push({
        id: chunk.id,
        vector,
        text: chunk.content,
        metadata: { ...metadata, ...chunk.metadata }
      });
    }

    await this.config.vectorStore.addMany(records);
    console.log(`[Pipeline] Ingested ${records.length} chunks`);
  }

  async query(
    queryText: string,
    topK = 5,
    filter?: MetadataFilter
  ): Promise<VectorSearchResult[]> {
    const queryVector = await this.config.embedFn(queryText);
    return this.config.vectorStore.search(queryVector, topK, filter);
  }
}

// ============================================================================
// 5. 使用示例
// ============================================================================

function generateMockEmbedding(text: string): number[] {
  // 确定性 mock embedding，使相似度有意义
  const seed = text.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  const vec: number[] = [];
  const rng = (n: number) => {
    const x = Math.sin(seed + n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  };
  for (let i = 0; i < 128; i++) {
    vec.push((rng(i) - 0.5) * 2);
  }
  return vec;
}

export async function demo(): Promise<void> {
  console.log('=== Embedding Pipeline ===\n');

  const sampleDoc = `
TypeScript is a strongly typed programming language that builds on JavaScript.
It adds additional syntax to JavaScript for tight integration with your editor.
TypeScript code converts to JavaScript, which runs anywhere JavaScript runs.

React is a library for web and native user interfaces.
Build user interfaces out of individual pieces called components.
React components are JavaScript functions.

Node.js is an open-source, cross-platform JavaScript runtime environment.
It executes JavaScript code outside of a web browser.
Node.js lets developers use JavaScript to write command line tools.
`.trim();

  // 1. 文本分块
  console.log('1. 文本分块策略');

  const fixed = new FixedSizeChunking();
  const fixedChunks = fixed.chunk(sampleDoc, { chunkSize: 120, overlap: 20 });
  console.log(`   Fixed size: ${fixedChunks.length} chunks`);
  console.log(`   First chunk: "${fixedChunks[0]?.content.slice(0, 60)}..."`);

  const semantic = new SemanticChunking();
  const semanticChunks = semantic.chunk(sampleDoc, { chunkSize: 200, overlap: 0 });
  console.log(`   Semantic: ${semanticChunks.length} chunks`);

  const recursive = new RecursiveChunking();
  const recursiveChunks = recursive.chunk(sampleDoc, { chunkSize: 100, overlap: 10 });
  console.log(`   Recursive: ${recursiveChunks.length} chunks`);

  // 2. 向量存储
  console.log('\n2. 向量存储与相似度搜索');
  const store = new InMemoryVectorStore();

  // 添加文档
  const docs = [
    { text: 'TypeScript provides type safety for JavaScript projects.', meta: { category: 'language' } },
    { text: 'React uses a virtual DOM for efficient UI updates.', meta: { category: 'framework' } },
    { text: 'Node.js enables server-side JavaScript execution.', meta: { category: 'runtime' } },
    { text: 'Python is a popular language for data science.', meta: { category: 'language' } }
  ];

  for (const doc of docs) {
    await store.add({
      id: `doc_${Math.random().toString(36).substring(2, 8)}`,
      vector: generateMockEmbedding(doc.text),
      text: doc.text,
      metadata: doc.meta
    });
  }

  const queryVec = generateMockEmbedding('JavaScript typing system');
  const results = await store.search(queryVec, 3);
  console.log('   Top results:');
  for (const r of results) {
    console.log(`     [${r.score.toFixed(3)}] ${r.record.text}`);
  }

  // 元数据过滤
  const filtered = await store.search(queryVec, 3, { category: 'language' });
  console.log(`   Filtered (category=language): ${filtered.length} results`);

  // 3. 混合搜索
  console.log('\n3. 混合搜索（关键词 + 向量）');
  const hybrid = new HybridSearchEngine(store, { vectorWeight: 0.6, keywordWeight: 0.4 });
  const hybridResults = await hybrid.search(
    generateMockEmbedding('JavaScript server runtime'),
    'Node.js server',
    3
  );
  console.log('   Hybrid results:');
  for (const r of hybridResults) {
    console.log(`     [combined=${r.combinedScore.toFixed(3)}, vec=${r.vectorScore.toFixed(3)}, kw=${r.keywordScore.toFixed(3)}] ${r.record.text}`);
  }

  // 4. Embedding Pipeline
  console.log('\n4. Embedding Pipeline');
  const pipeline = new EmbeddingPipeline({
    chunking: new SemanticChunking(),
    chunkOptions: { chunkSize: 150, overlap: 20 },
    vectorStore: new InMemoryVectorStore(),
    embedFn: generateMockEmbedding
  });

  await pipeline.ingest(sampleDoc, { source: 'docs', docId: '001' });
  const queryResults = await pipeline.query('What is TypeScript?', 3);
  console.log('   Query results:');
  for (const r of queryResults) {
    console.log(`     [${r.score.toFixed(3)}] ${r.record.text.slice(0, 60)}...`);
  }

  console.log('\nEmbedding Pipeline 要点:');
  console.log('- 固定分块: 简单高效，但可能切断语义');
  console.log('- 语义分块: 保持段落完整性，适合文档');
  console.log('- 递归分块: 自适应粒度，平衡语义与大小');
  console.log('- 元数据过滤: 在向量搜索前缩小候选集');
  console.log('- 混合搜索: 结合语义和关键词，提高召回率');
}
