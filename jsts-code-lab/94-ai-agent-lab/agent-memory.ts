/**
 * @file Agent Memory Layer — 智能体记忆系统
 * @category AI Agent → Memory
 * @difficulty hard
 * @tags agent-memory, short-term-memory, long-term-memory, vector-store, summarization, importance-scoring
 *
 * 演示：对话缓冲、滑动窗口、向量检索、情景记忆、记忆重要性评分与 Token 预算管理。
 * 纯 TypeScript 实现，不依赖外部向量数据库，使用余弦相似度模拟语义检索。
 */

// ==================== 核心类型定义 ====================

export interface MemoryEntry {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'observation';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface ScoredMemory extends MemoryEntry {
  importance: number;
  embedding: number[];
}

export interface RetrievalResult {
  memory: ScoredMemory;
  score: number;
}

export interface TokenBudget {
  maxTokens: number;
  currentTokens: number;
}

// ==================== 工具函数 ====================

function generateId(): string {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function estimateTokens(text: string): number {
  // 简化估算：中文 ≈ 1 token/字，英文 ≈ 1 token/4 chars
  const cnCount = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const otherCount = text.length - cnCount;
  return cnCount + Math.ceil(otherCount / 4);
}

// 简化嵌入：将文本转换为词频向量（仅用于演示语义相似度）
function createEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9\s]/g, '');
  const words = normalized.split(/\s+/).filter((w) => w.length > 0);
  const vocab = Array.from(new Set(words));
  const vector = vocab.map((word) => words.filter((w) => w === word).length);

  // 若文本过短，补充基于字符的维度以保持一定区分度
  const charHash = text.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 16;
  for (let i = 0; i < 16; i++) {
    vector.push(i === charHash ? 1 : 0);
  }

  return vector;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    // 填充较短向量
    const maxLen = Math.max(a.length, b.length);
    const pa = [...a, ...Array(maxLen - a.length).fill(0)];
    const pb = [...b, ...Array(maxLen - b.length).fill(0)];
    a = pa;
    b = pb;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ==================== 短期记忆：对话缓冲与滑动窗口 ====================

export class ShortTermMemory {
  private buffer: MemoryEntry[] = [];

  constructor(
    private maxEntries: number = 10,
    private slidingWindowSize: number = 6
  ) {}

  add(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const fullEntry: MemoryEntry = {
      ...entry,
      id: generateId(),
      timestamp: Date.now(),
    };
    this.buffer.push(fullEntry);

    if (this.buffer.length > this.maxEntries) {
      this.buffer.shift();
    }

    return fullEntry;
  }

  getRecent(count?: number): MemoryEntry[] {
    const n = count ?? this.slidingWindowSize;
    return this.buffer.slice(-n);
  }

  getAll(): MemoryEntry[] {
    return [...this.buffer];
  }

  clear(): void {
    this.buffer = [];
  }

  getTokenCount(): number {
    return this.buffer.reduce((sum, e) => sum + estimateTokens(e.content), 0);
  }
}

// ==================== 记忆重要性评分器 ====================

export class ImportanceScorer {
  score(entry: MemoryEntry): number {
    let score = 0.5;

    // 系统消息重要性更高
    if (entry.role === 'system') score += 0.3;
    if (entry.role === 'observation') score += 0.2;

    // 内容长度适中者更重要（过长或过短都降权）
    const len = entry.content.length;
    if (len >= 20 && len <= 200) score += 0.1;

    // 包含关键指令词
    const keywords = ['重要', '关键', '必须', '记住', '注意', 'error', 'critical', 'remember'];
    if (keywords.some((kw) => entry.content.toLowerCase().includes(kw))) {
      score += 0.2;
    }

    // 包含代码块或结构化数据
    if (entry.content.includes('```') || entry.content.includes('{')) {
      score += 0.1;
    }

    return Math.min(1, Math.max(0, score));
  }
}

// ==================== 长期记忆：向量存储与情景记忆 ====================

export class LongTermMemory {
  private store: ScoredMemory[] = [];
  private scorer = new ImportanceScorer();

  constructor(
    private maxCapacity: number = 100,
    private similarityThreshold: number = 0.3
  ) {}

  add(entry: MemoryEntry): ScoredMemory {
    const embedding = createEmbedding(entry.content);
    const scored: ScoredMemory = {
      ...entry,
      embedding,
      importance: this.scorer.score(entry),
    };

    this.store.push(scored);

    // 按重要性淘汰旧记忆
    if (this.store.length > this.maxCapacity) {
      this.store.sort((a, b) => b.importance - a.importance);
      this.store = this.store.slice(0, this.maxCapacity);
    }

    return scored;
  }

  retrieve(query: string, topK: number = 5): RetrievalResult[] {
    const queryEmbedding = createEmbedding(query);
    const results: RetrievalResult[] = this.store.map((memory) => ({
      memory,
      score: cosineSimilarity(queryEmbedding, memory.embedding),
    }));

    return results
      .filter((r) => r.score >= this.similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  retrieveByImportance(minImportance: number = 0.7): ScoredMemory[] {
    return this.store
      .filter((m) => m.importance >= minImportance)
      .sort((a, b) => b.importance - a.importance);
  }

  getEpisodicMemories(timeRangeMs?: number): ScoredMemory[] {
    const now = Date.now();
    let memories = [...this.store];
    if (timeRangeMs) {
      memories = memories.filter((m) => now - m.timestamp <= timeRangeMs);
    }
    return memories.sort((a, b) => b.timestamp - a.timestamp);
  }

  getAll(): ScoredMemory[] {
    return [...this.store];
  }

  clear(): void {
    this.store = [];
  }
}

// ==================== 记忆摘要：Token 预算管理 ====================

export class MemorySummarizer {
  summarize(memories: MemoryEntry[], budget: TokenBudget): string {
    let availableTokens = budget.maxTokens - budget.currentTokens;
    if (availableTokens <= 0) return '';

    // 按时间排序，优先保留最近记忆
    const sorted = [...memories].sort((a, b) => b.timestamp - a.timestamp);
    const included: MemoryEntry[] = [];

    for (const mem of sorted) {
      const tokens = estimateTokens(mem.content);
      if (tokens <= availableTokens) {
        included.push(mem);
        availableTokens -= tokens;
      } else {
        break;
      }
    }

    // 生成摘要文本
    const lines = included
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((m) => `[${m.role}] ${m.content}`);

    return lines.join('\n');
  }

  compress(memories: MemoryEntry[], targetTokens: number): MemoryEntry[] {
    if (memories.length === 0) return [];

    const totalTokens = memories.reduce((sum, m) => sum + estimateTokens(m.content), 0);
    if (totalTokens <= targetTokens) return [...memories];

    // 先按重要性排序，取最重要的记忆直到达到目标 Token 数
    const scored = memories.map((m) => ({
      memory: m,
      importance: new ImportanceScorer().score(m),
    }));

    scored.sort((a, b) => b.importance - a.importance);

    const result: MemoryEntry[] = [];
    let usedTokens = 0;
    for (const item of scored) {
      const tokens = estimateTokens(item.memory.content);
      if (usedTokens + tokens <= targetTokens) {
        result.push(item.memory);
        usedTokens += tokens;
      }
    }

    // 按时间重新排序
    return result.sort((a, b) => a.timestamp - b.timestamp);
  }
}

// ==================== 统一记忆层 ====================

export class AgentMemory {
  public shortTerm = new ShortTermMemory();
  public longTerm = new LongTermMemory();
  public summarizer = new MemorySummarizer();

  private tokenBudget: TokenBudget = { maxTokens: 4096, currentTokens: 0 };

  constructor(maxTokens?: number) {
    if (maxTokens) {
      this.tokenBudget.maxTokens = maxTokens;
    }
  }

  remember(content: string, role: MemoryEntry['role'] = 'observation', metadata?: Record<string, unknown>): void {
    const entry: Omit<MemoryEntry, 'id' | 'timestamp'> = { content, role, metadata };
    const shortTermEntry = this.shortTerm.add(entry);

    // 高重要性记忆同步到长期记忆
    const scored = new ImportanceScorer().score(shortTermEntry);
    if (scored >= 0.7) {
      this.longTerm.add(shortTermEntry);
    }

    this.updateTokenBudget();
  }

  recall(query: string, topK: number = 5): RetrievalResult[] {
    // 优先从长期记忆检索
    const longTermResults = this.longTerm.retrieve(query, topK);

    // 补充短期记忆
    const recent = this.shortTerm.getRecent();
    const queryEmbedding = createEmbedding(query);
    const shortTermResults: RetrievalResult[] = recent
      .map((m) => ({
        memory: { ...m, importance: 0.5, embedding: createEmbedding(m.content) },
        score: cosineSimilarity(queryEmbedding, createEmbedding(m.content)),
      }))
      .filter((r) => r.score >= 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.ceil(topK / 2));

    // 合并去重并按分数排序
    const merged = new Map<string, RetrievalResult>();
    for (const r of longTermResults) merged.set(r.memory.id, r);
    for (const r of shortTermResults) {
      if (!merged.has(r.memory.id)) merged.set(r.memory.id, r);
    }

    return Array.from(merged.values()).sort((a, b) => b.score - a.score).slice(0, topK);
  }

  getContextWindow(): string {
    const recent = this.shortTerm.getRecent();
    this.updateTokenBudget();
    return this.summarizer.summarize(recent, this.tokenBudget);
  }

  compressIfNeeded(): void {
    const recent = this.shortTerm.getAll();
    const targetTokens = Math.floor(this.tokenBudget.maxTokens * 0.3); // 短期记忆占用 30%
    const compressed = this.summarizer.compress(recent, targetTokens);

    // 将超出预算的旧记忆归档到长期记忆
    const compressedIds = new Set(compressed.map((c) => c.id));
    for (const mem of recent) {
      if (!compressedIds.has(mem.id)) {
        this.longTerm.add(mem);
      }
    }
  }

  clear(): void {
    this.shortTerm.clear();
    this.longTerm.clear();
    this.tokenBudget.currentTokens = 0;
  }

  private updateTokenBudget(): void {
    const shortTermTokens = this.shortTerm.getTokenCount();
    const longTermTokens = this.longTerm.getAll().reduce((sum, m) => sum + estimateTokens(m.content), 0);
    this.tokenBudget.currentTokens = shortTermTokens + longTermTokens;
  }

  getBudgetStatus(): TokenBudget {
    this.updateTokenBudget();
    return { ...this.tokenBudget };
  }
}

// ==================== 演示入口 ====================

export async function demo(): Promise<void> {
  console.log('=== Agent Memory Layer 演示 ===\n');

  const memory = new AgentMemory(2048);

  // 1. 短期记忆：模拟对话
  console.log('--- 短期记忆：多轮对话 ---');
  memory.remember('你好，请帮我规划一次日本旅行', 'user');
  memory.remember('好的，请问您计划出行几天？', 'assistant');
  memory.remember('大概 7 天，想去东京和大阪', 'user');
  memory.remember('收到。建议前 4 天东京，后 3 天大阪。', 'assistant');
  memory.remember('重要：用户偏好樱花季（3 月下旬至 4 月上旬）', 'observation', { category: 'preference' });

  const recent = memory.shortTerm.getRecent(3);
  console.log('最近 3 条记忆:');
  recent.forEach((m) => console.log(`  [${m.role}] ${m.content}`));

  // 2. 长期记忆检索
  console.log('\n--- 长期记忆：语义检索 ---');
  memory.remember('用户曾经询问过京都的寺庙推荐', 'observation');
  memory.remember('用户讨厌人多的景点，喜欢小众体验', 'observation');
  memory.remember('用户的预算是每人 15000 元人民币', 'observation');

  const results = memory.recall('东京有什么推荐', 3);
  console.log(`检索 "东京有什么推荐" 得到 ${results.length} 条结果:`);
  results.forEach((r) => {
    console.log(`  [score=${r.score.toFixed(3)}] ${r.memory.content.slice(0, 60)}...`);
  });

  // 3. 重要性评分
  console.log('\n--- 重要性评分 ---');
  const scorer = new ImportanceScorer();
  const testMemories: MemoryEntry[] = [
    { id: '1', content: '你好', role: 'user', timestamp: Date.now() },
    { id: '2', content: '重要：用户密码是 secret123（记住这个关键信息）', role: 'system', timestamp: Date.now() },
    { id: '3', content: '```typescript\nconst x = 1;\n```', role: 'assistant', timestamp: Date.now() },
  ];
  testMemories.forEach((m) => {
    console.log(`  [${m.role}] score=${scorer.score(m).toFixed(2)} | ${m.content.slice(0, 50)}`);
  });

  // 4. Token 预算管理
  console.log('\n--- Token 预算管理 ---');
  const budget = memory.getBudgetStatus();
  console.log(`当前 Token 使用: ${budget.currentTokens} / ${budget.maxTokens}`);

  const context = memory.getContextWindow();
  console.log(`\n上下文窗口内容:\n${context.slice(0, 300)}...`);

  // 5. 情景记忆
  console.log('\n--- 情景记忆 ---');
  const episodic = memory.longTerm.getEpisodicMemories(60 * 60 * 1000); // 1 小时内
  console.log(`最近 1 小时内的情景记忆: ${episodic.length} 条`);

  console.log('\n=== 演示完成 ===');
}

if (require.main === module) {
  demo().catch(console.error);
}
