/**
 * @file 流式分析
 * @category Real-time Analytics → Streaming
 * @difficulty hard
 * @tags streaming, windowing, anomaly-detection, cep
 */

// 事件时间处理
export interface StreamEvent<T> {
  data: T;
  timestamp: number;
  watermark: number;
}

// 窗口类型
export type WindowType = 'tumbling' | 'sliding' | 'session';

export interface Window {
  start: number;
  end: number;
  events: StreamEvent<unknown>[];
}

// 窗口操作
export class WindowOperator<T> {
  private windows: Window[] = [];
  private windowSize: number;
  private slideSize?: number;
  private type: WindowType;
  private sessionGap?: number;
  
  constructor(type: WindowType, windowSize: number, options?: { slideSize?: number; sessionGap?: number }) {
    this.type = type;
    this.windowSize = windowSize;
    this.slideSize = options?.slideSize;
    this.sessionGap = options?.sessionGap;
  }
  
  process(event: StreamEvent<T>): Window[] {
    const completedWindows: Window[] = [];
    
    switch (this.type) {
      case 'tumbling':
        this.processTumbling(event, completedWindows);
        break;
      case 'sliding':
        this.processSliding(event, completedWindows);
        break;
      case 'session':
        this.processSession(event, completedWindows);
        break;
    }
    
    return completedWindows;
  }
  
  private processTumbling(event: StreamEvent<T>, completed: Window[]): void {
    const windowStart = Math.floor(event.timestamp / this.windowSize) * this.windowSize;
    const windowEnd = windowStart + this.windowSize;
    
    let window = this.windows.find(w => w.start === windowStart);
    
    if (!window) {
      // 关闭之前的窗口
      for (const w of this.windows) {
        if (w.end <= windowStart && w.events.length > 0) {
          completed.push(w);
        }
      }
      this.windows = this.windows.filter(w => w.end > windowStart);
      
      window = { start: windowStart, end: windowEnd, events: [] };
      this.windows.push(window);
    }
    
    window.events.push(event);
  }
  
  private processSliding(event: StreamEvent<T>, completed: Window[]): void {
    const slide = this.slideSize || this.windowSize;
    const windowStart = Math.floor(event.timestamp / slide) * slide;
    
    // 创建或更新窗口
    for (let start = windowStart; start > windowStart - this.windowSize; start -= slide) {
      let window = this.windows.find(w => w.start === start);
      
      if (!window) {
        window = { start, end: start + this.windowSize, events: [] };
        this.windows.push(window);
      }
      
      if (event.timestamp >= start && event.timestamp < start + this.windowSize) {
        window.events.push(event);
      }
    }
    
    // 关闭过期窗口
    const cutoff = event.timestamp - this.windowSize;
    for (const w of this.windows) {
      if (w.end <= cutoff && w.events.length > 0) {
        completed.push(w);
      }
    }
    this.windows = this.windows.filter(w => w.end > cutoff);
  }
  
  private processSession(event: StreamEvent<T>, completed: Window[]): void {
    const gap = this.sessionGap || 30000; // 默认30秒
    
    // 查找最近的活跃会话
    let session = this.windows
      .filter(w => w.events.length > 0)
      .find(w => {
        const lastEvent = w.events[w.events.length - 1];
        return event.timestamp - lastEvent.timestamp < gap;
      });
    
    if (!session) {
      // 关闭过期会话
      for (const w of this.windows) {
        if (w.events.length > 0) {
          const lastEvent = w.events[w.events.length - 1];
          if (event.timestamp - lastEvent.timestamp >= gap) {
            completed.push(w);
          }
        }
      }
      
      session = { start: event.timestamp, end: event.timestamp, events: [] };
      this.windows.push(session);
    }
    
    session.events.push(event);
    session.end = event.timestamp;
  }
  
  getActiveWindows(): Window[] {
    return this.windows.filter(w => w.events.length > 0);
  }
}

// 聚合函数
export class Aggregators {
  static sum(window: Window, field: string): number {
    return window.events.reduce((sum, e) => sum + Number((e.data as Record<string, unknown>)[field] || 0), 0);
  }
  
  static avg(window: Window, field: string): number {
    if (window.events.length === 0) return 0;
    return Aggregators.sum(window, field) / window.events.length;
  }
  
  static count(window: Window): number {
    return window.events.length;
  }
  
  static min(window: Window, field: string): number {
    return Math.min(...window.events.map(e => Number((e.data as Record<string, unknown>)[field] || 0)));
  }
  
  static max(window: Window, field: string): number {
    return Math.max(...window.events.map(e => Number((e.data as Record<string, unknown>)[field] || 0)));
  }
  
  static percentile(window: Window, field: string, p: number): number {
    const values = window.events
      .map(e => Number((e.data as Record<string, unknown>)[field] || 0))
      .sort((a, b) => a - b);
    
    if (values.length === 0) return 0;
    const index = Math.floor(values.length * p);
    return values[Math.min(index, values.length - 1)];
  }
}

// 异常检测
export class AnomalyDetector {
  private baseline = new Map<string, { mean: number; std: number }>();
  private history = new Map<string, number[]>();
  private windowSize: number;
  
  constructor(windowSize = 100) {
    this.windowSize = windowSize;
  }
  
  update(metric: string, value: number): void {
    if (!this.history.has(metric)) {
      this.history.set(metric, []);
    }
    
    const values = this.history.get(metric)!;
    values.push(value);
    
    if (values.length > this.windowSize) {
      values.shift();
    }
    
    // 更新基线
    if (values.length >= 10) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
      this.baseline.set(metric, { mean, std: Math.sqrt(variance) });
    }
  }
  
  detect(metric: string, value: number): { isAnomaly: boolean; score: number; reason: string } {
    const baseline = this.baseline.get(metric);
    
    if (!baseline || baseline.std === 0) {
      return { isAnomaly: false, score: 0, reason: 'insufficient_data' };
    }
    
    // Z-score方法
    const zScore = Math.abs(value - baseline.mean) / baseline.std;
    const threshold = 3; // 3个标准差
    
    if (zScore > threshold) {
      return {
        isAnomaly: true,
        score: zScore,
        reason: value > baseline.mean ? 'value_too_high' : 'value_too_low'
      };
    }
    
    return { isAnomaly: false, score: zScore, reason: 'normal' };
  }
  
  // 基于阈值的检测
  checkThreshold(metric: string, value: number, min?: number, max?: number): { isAnomaly: boolean; reason: string } {
    if (min !== undefined && value < min) {
      return { isAnomaly: true, reason: 'below_minimum' };
    }
    if (max !== undefined && value > max) {
      return { isAnomaly: true, reason: 'above_maximum' };
    }
    return { isAnomaly: false, reason: 'normal' };
  }
}

// 复杂事件处理 (CEP)
export interface CEPEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

export interface CEPPattern {
  name: string;
  sequence: { type: string; condition?: (e: CEPEvent) => boolean }[];
  timeWindow: number;
  action: (events: CEPEvent[]) => void;
}

export class CEPEngine {
  private patterns: CEPPattern[] = [];
  private eventBuffer: CEPEvent[] = [];
  private partialMatches = new Map<string, CEPEvent[][]>();
  
  registerPattern(pattern: CEPPattern): void {
    this.patterns.push(pattern);
    this.partialMatches.set(pattern.name, []);
  }
  
  processEvent(event: CEPEvent): void {
    this.eventBuffer.push(event);
    
    // 清理过期事件
    const cutoff = event.timestamp - 60000; // 保留1分钟
    this.eventBuffer = this.eventBuffer.filter(e => e.timestamp > cutoff);
    
    // 检查模式
    for (const pattern of this.patterns) {
      this.matchPattern(pattern, event);
    }
  }
  
  private matchPattern(pattern: CEPPattern, event: CEPEvent): void {
    const matches = this.partialMatches.get(pattern.name) || [];
    const newMatches: CEPEvent[][] = [];
    
    // 尝试扩展现有部分匹配
    for (const match of matches) {
      const nextStep = match.length;
      if (nextStep < pattern.sequence.length) {
        const step = pattern.sequence[nextStep];
        if (step.type === event.type && (!step.condition || step.condition(event))) {
          const newMatch = [...match, event];
          
          // 检查时间窗口
          if (newMatch.length === pattern.sequence.length) {
            const timeSpan = newMatch[newMatch.length - 1].timestamp - newMatch[0].timestamp;
            if (timeSpan <= pattern.timeWindow) {
              pattern.action(newMatch);
            }
          } else {
            newMatches.push(newMatch);
          }
        }
      }
    }
    
    // 开始新的匹配
    const firstStep = pattern.sequence[0];
    if (firstStep.type === event.type && (!firstStep.condition || firstStep.condition(event))) {
      newMatches.push([event]);
    }
    
    this.partialMatches.set(pattern.name, newMatches);
  }
}

// 实时看板
export class RealtimeDashboard {
  private metrics = new Map<string, { value: number; timestamp: number }>();
  private subscribers = new Map<string, ((value: number) => void)[]>();
  
  updateMetric(name: string, value: number): void {
    this.metrics.set(name, { value, timestamp: Date.now() });
    
    const callbacks = this.subscribers.get(name) || [];
    for (const cb of callbacks) {
      cb(value);
    }
  }
  
  getMetric(name: string): number | undefined {
    return this.metrics.get(name)?.value;
  }
  
  subscribe(name: string, callback: (value: number) => void): () => void {
    if (!this.subscribers.has(name)) {
      this.subscribers.set(name, []);
    }
    this.subscribers.get(name)!.push(callback);
    
    return () => {
      const callbacks = this.subscribers.get(name);
      if (callbacks) {
        const idx = callbacks.indexOf(callback);
        if (idx > -1) callbacks.splice(idx, 1);
      }
    };
  }
  
  getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    for (const [name, data] of this.metrics) {
      result[name] = data.value;
    }
    return result;
  }
}

export function demo(): void {
  console.log('=== 实时分析 ===\n');
  
  // 窗口操作
  console.log('--- 窗口操作 ---');
  
  // Tumbling窗口
  const tumblingWindow = new WindowOperator<number>('tumbling', 1000);
  
  const events = [
    { data: 10, timestamp: 100, watermark: 100 },
    { data: 20, timestamp: 500, watermark: 500 },
    { data: 30, timestamp: 1200, watermark: 1200 },
    { data: 40, timestamp: 1500, watermark: 1500 },
    { data: 50, timestamp: 2200, watermark: 2200 }
  ];
  
  console.log('滚动窗口处理:');
  for (const event of events) {
    const completed = tumblingWindow.process(event);
    if (completed.length > 0) {
      for (const w of completed) {
        console.log(`  窗口 [${w.start}-${w.end}]: ${w.events.map(e => e.data).join(', ')}`);
      }
    }
  }
  
  // 会话窗口
  console.log('\n会话窗口处理:');
  const sessionWindow = new WindowOperator<number>('session', 0, { sessionGap: 500 });
  
  const sessionEvents = [
    { data: 1, timestamp: 100, watermark: 100 },
    { data: 2, timestamp: 200, watermark: 200 },
    { data: 3, timestamp: 800, watermark: 800 }, // 新会话
    { data: 4, timestamp: 900, watermark: 900 }
  ];
  
  for (const event of sessionEvents) {
    const completed = sessionWindow.process(event);
    if (completed.length > 0) {
      for (const w of completed) {
        console.log(`  会话 (${w.events.length}个事件): ${w.events.map(e => e.data).join(', ')}`);
      }
    }
  }
  
  // 异常检测
  console.log('\n--- 异常检测 ---');
  const detector = new AnomalyDetector(50);
  
  // 模拟正常数据
  for (let i = 0; i < 20; i++) {
    detector.update('cpu', 50 + Math.random() * 10);
  }
  
  // 测试异常
  const testValues = [52, 48, 95, 51]; // 95是异常
  for (const value of testValues) {
    const result = detector.detect('cpu', value);
    console.log(`CPU=${value}: ${result.isAnomaly ? '异常' : '正常'} (score=${result.score.toFixed(2)})`);
  }
  
  // CEP
  console.log('\n--- 复杂事件处理 ---');
  const cep = new CEPEngine();
  
  // 定义欺诈检测模式：短时间内多次失败的登录尝试
  cep.registerPattern({
    name: 'potential_fraud',
    sequence: [
      { type: 'login_failed' },
      { type: 'login_failed' },
      { type: 'login_failed' }
    ],
    timeWindow: 60000,
    action: (events) => {
      console.log('检测到潜在欺诈! 3次登录失败:', events.map(e => e.timestamp));
    }
  });
  
  // 模拟事件
  cep.processEvent({ type: 'login_failed', timestamp: 1000, data: { user: 'user1' } });
  cep.processEvent({ type: 'login_failed', timestamp: 5000, data: { user: 'user1' } });
  cep.processEvent({ type: 'login_success', timestamp: 10000, data: { user: 'user1' } });
  cep.processEvent({ type: 'login_failed', timestamp: 15000, data: { user: 'user1' } });
  cep.processEvent({ type: 'login_failed', timestamp: 20000, data: { user: 'user1' } }); // 触发
  
  // 实时看板
  console.log('\n--- 实时看板 ---');
  const dashboard = new RealtimeDashboard();
  
  dashboard.subscribe('requests_per_second', (value) => {
    console.log(`[Dashboard] RPS: ${value}`);
  });
  
  dashboard.updateMetric('requests_per_second', 100);
  dashboard.updateMetric('requests_per_second', 150);
  dashboard.updateMetric('requests_per_second', 120);
  
  console.log('当前指标:', dashboard.getAllMetrics());
}
