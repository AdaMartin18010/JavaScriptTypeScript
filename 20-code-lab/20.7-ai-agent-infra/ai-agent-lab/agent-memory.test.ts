import { describe, it, expect, beforeEach } from 'vitest';
import {
  ShortTermMemory,
  LongTermMemory,
  ImportanceScorer,
  MemorySummarizer,
  AgentMemory,
} from './agent-memory.js';

describe('ShortTermMemory', () => {
  let stm: ShortTermMemory;

  beforeEach(() => {
    stm = new ShortTermMemory(5, 3);
  });

  it('应能添加并检索最近记忆', () => {
    stm.add({ content: '第一条', role: 'user' });
    stm.add({ content: '第二条', role: 'assistant' });

    const recent = stm.getRecent(2);
    expect(recent).toHaveLength(2);
    expect(recent[0].content).toBe('第一条');
    expect(recent[1].content).toBe('第二条');
  });

  it('滑动窗口应限制返回数量', () => {
    stm.add({ content: 'a', role: 'user' });
    stm.add({ content: 'b', role: 'user' });
    stm.add({ content: 'c', role: 'user' });
    stm.add({ content: 'd', role: 'user' });

    expect(stm.getRecent()).toHaveLength(3);
    expect(stm.getRecent()[2].content).toBe('d');
  });

  it('超出容量时应淘汰最早记忆', () => {
    stm.add({ content: '1', role: 'user' });
    stm.add({ content: '2', role: 'user' });
    stm.add({ content: '3', role: 'user' });
    stm.add({ content: '4', role: 'user' });
    stm.add({ content: '5', role: 'user' });
    stm.add({ content: '6', role: 'user' });

    expect(stm.getAll()).toHaveLength(5);
    expect(stm.getAll()[0].content).toBe('2');
  });

  it('clear 应清空所有记忆', () => {
    stm.add({ content: 'test', role: 'user' });
    stm.clear();
    expect(stm.getAll()).toHaveLength(0);
  });

  it('应正确估算 Token 数', () => {
    stm.add({ content: '你好世界', role: 'user' });
    expect(stm.getTokenCount()).toBeGreaterThan(0);
  });
});

describe('ImportanceScorer', () => {
  const scorer = new ImportanceScorer();

  it('普通用户消息应有中等重要性', () => {
    const score = scorer.score({ id: '1', content: '你好', role: 'user', timestamp: Date.now() });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('包含关键字的记忆应得分更高', () => {
    const normal = scorer.score({ id: '1', content: '随便说说', role: 'user', timestamp: Date.now() });
    const critical = scorer.score({ id: '2', content: '重要：请记住这个关键配置', role: 'system', timestamp: Date.now() });
    expect(critical).toBeGreaterThan(normal);
  });

  it('系统消息应比用户消息重要', () => {
    const user = scorer.score({ id: '1', content: 'hello', role: 'user', timestamp: Date.now() });
    const system = scorer.score({ id: '2', content: 'hello', role: 'system', timestamp: Date.now() });
    expect(system).toBeGreaterThan(user);
  });
});

describe('LongTermMemory', () => {
  let ltm: LongTermMemory;

  beforeEach(() => {
    ltm = new LongTermMemory(50, 0.15);
  });

  it('应能存储并检索记忆', () => {
    ltm.add({ id: '1', content: 'TypeScript 类型系统很强大', role: 'observation', timestamp: Date.now() });
    ltm.add({ id: '2', content: 'JavaScript 闭包原理', role: 'observation', timestamp: Date.now() });

    const results = ltm.retrieve('TypeScript 类型', 3);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].memory.content).toContain('TypeScript');
  });

  it('不相关查询不应返回高相似度结果', () => {
    ltm.add({ id: '1', content: '苹果香蕉橘子', role: 'observation', timestamp: Date.now() });
    const results = ltm.retrieve('量子物理相对论', 3);
    // 简单向量模型下仍可能有极低相似度，但不应包含水果相关内容
    if (results.length > 0) {
      expect(results[0].score).toBeLessThan(0.5);
    }
  });

  it('应按重要性检索记忆', () => {
    ltm.add({ id: '1', content: '普通记忆', role: 'user', timestamp: Date.now() });
    ltm.add({ id: '2', content: '重要：系统关键配置', role: 'system', timestamp: Date.now() });

    const important = ltm.retrieveByImportance(0.7);
    expect(important.length).toBeGreaterThan(0);
    expect(important[0].content).toContain('重要');
  });

  it('应能获取情景记忆', () => {
    const now = Date.now();
    ltm.add({ id: '1', content: '刚刚发生', role: 'observation', timestamp: now });
    ltm.add({ id: '2', content: '很久以前', role: 'observation', timestamp: now - 24 * 60 * 60 * 1000 });

    const recent = ltm.getEpisodicMemories(60 * 60 * 1000);
    expect(recent.length).toBe(1);
    expect(recent[0].content).toBe('刚刚发生');
  });

  it('超出容量时应按重要性淘汰', () => {
    for (let i = 0; i < 55; i++) {
      ltm.add({ id: String(i), content: `记忆 ${i}`, role: 'user', timestamp: Date.now() });
    }
    expect(ltm.getAll().length).toBeLessThanOrEqual(50);
  });
});

describe('MemorySummarizer', () => {
  const summarizer = new MemorySummarizer();

  it('应在 Token 预算内生成摘要', () => {
    const memories = [
      { id: '1', content: '用户喜欢 TypeScript', role: 'observation', timestamp: Date.now() - 3000 },
      { id: '2', content: '用户不喜欢 Java', role: 'observation', timestamp: Date.now() - 2000 },
      { id: '3', content: '用户需要性能优化方案', role: 'observation', timestamp: Date.now() - 1000 },
    ];

    const summary = summarizer.summarize(memories, { maxTokens: 100, currentTokens: 0 });
    expect(summary.length).toBeGreaterThan(0);
    expect(summary).toContain('用户');
  });

  it('预算耗尽时应返回空字符串', () => {
    const summary = summarizer.summarize(
      [{ id: '1', content: 'test', role: 'user', timestamp: Date.now() }],
      { maxTokens: 10, currentTokens: 10 }
    );
    expect(summary).toBe('');
  });

  it('compress 应在目标 Token 内压缩', () => {
    const memories = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      content: `这是第 ${i} 条比较长的记忆内容，用于测试压缩逻辑`,
      role: 'user' as const,
      timestamp: Date.now() + i,
    }));

    const compressed = summarizer.compress(memories, 50);
    expect(compressed.length).toBeGreaterThan(0);
    expect(compressed.length).toBeLessThan(memories.length);
  });
});

describe('AgentMemory', () => {
  let memory: AgentMemory;

  beforeEach(() => {
    memory = new AgentMemory(1024);
  });

  it('应能记忆和回忆', () => {
    memory.remember('我喜欢使用 React', 'user');
    memory.remember('React 是一个前端框架', 'assistant');

    const results = memory.recall('前端框架', 3);
    expect(results.length).toBeGreaterThan(0);
  });

  it('高重要性记忆应进入长期记忆', () => {
    memory.remember('重要：密码是 secret123', 'system');
    const ltm = memory.longTerm.getAll();
    expect(ltm.length).toBeGreaterThan(0);
    expect(ltm[0].content).toContain('密码');
  });

  it('应能获取上下文窗口', () => {
    memory.remember('问题一', 'user');
    memory.remember('回答一', 'assistant');

    const context = memory.getContextWindow();
    expect(context.length).toBeGreaterThan(0);
    expect(context).toContain('问题一');
  });

  it('应能报告 Token 预算状态', () => {
    memory.remember('测试内容', 'user');
    const budget = memory.getBudgetStatus();
    expect(budget.maxTokens).toBe(1024);
    expect(budget.currentTokens).toBeGreaterThan(0);
  });

  it('clear 应清空所有记忆层', () => {
    memory.remember('test', 'user');
    memory.clear();
    expect(memory.shortTerm.getAll()).toHaveLength(0);
    expect(memory.longTerm.getAll()).toHaveLength(0);
  });
});
