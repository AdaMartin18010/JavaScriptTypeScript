/**
 * @file 分析引擎
 * @category Analytics → Engine
 * @difficulty medium
 * @tags analytics, tracking, funnel, events
 */

export interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  userId?: string;
  sessionId: string;
  timestamp: number;
}

// 事件追踪器
export class EventTracker {
  private events: AnalyticsEvent[] = [];
  private listeners: ((event: AnalyticsEvent) => void)[] = [];
  
  track(name: string, properties: Record<string, unknown> = {}): void {
    const event: AnalyticsEvent = {
      id: Math.random().toString(36).slice(2),
      name,
      properties,
      sessionId: this.getSessionId(),
      timestamp: Date.now()
    };
    
    this.events.push(event);
    this.listeners.forEach(l => {
      try {
        l(event);
      } catch (error) {
        console.error('Analytics listener error:', error);
      }
    });
  }
  
  onTrack(listener: (event: AnalyticsEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const idx = this.listeners.indexOf(listener);
      if (idx > -1) this.listeners.splice(idx, 1);
    };
  }
  
  getEvents(filters?: { name?: string; startTime?: number; endTime?: number }): AnalyticsEvent[] {
    let result = [...this.events];
    
    if (filters?.name) {
      result = result.filter(e => e.name === filters.name);
    }
    if (filters?.startTime) {
      result = result.filter(e => e.timestamp >= filters.startTime!);
    }
    if (filters?.endTime) {
      result = result.filter(e => e.timestamp <= filters.endTime!);
    }
    
    return result;
  }
  
  private getSessionId(): string {
    // 简化实现，实际应使用持久化存储
    return 'session-' + Math.floor(Date.now() / 3600000);
  }
}

// 漏斗分析
export interface FunnelStep {
  name: string;
  event: string;
  filter?: (event: AnalyticsEvent) => boolean;
}

export interface FunnelResult {
  step: string;
  count: number;
  conversionRate: number;
  dropOffRate: number;
}

export class FunnelAnalyzer {
  analyze(
    events: AnalyticsEvent[],
    steps: FunnelStep[],
    uniqueBy: 'user' | 'session' = 'user'
  ): FunnelResult[] {
    const results: FunnelResult[] = [];
    let previousCount = 0;
    
    for (const step of steps) {
      // 查找匹配该步骤的事件
      const stepEvents = events.filter(e => {
        if (e.name !== step.event) return false;
        if (step.filter) return step.filter(e);
        return true;
      });
      
      // 去重
      const uniqueIds = new Set(
        stepEvents.map(e => uniqueBy === 'user' ? e.userId : e.sessionId)
      );
      
      const count = uniqueIds.size;
      
      results.push({
        step: step.name,
        count,
        conversionRate: previousCount > 0 ? (count / previousCount) * 100 : 100,
        dropOffRate: previousCount > 0 ? ((previousCount - count) / previousCount) * 100 : 0
      });
      
      previousCount = count;
    }
    
    return results;
  }
}

// 用户行为路径分析
export class UserPathAnalyzer {
  analyzePaths(events: AnalyticsEvent[], sessionId: string): string[] {
    const sessionEvents = events
      .filter(e => e.sessionId === sessionId)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    return sessionEvents.map(e => e.name);
  }
  
  getCommonPaths(events: AnalyticsEvent[], minLength = 3): { path: string[]; count: number }[] {
    const pathCounts = new Map<string, number>();
    
    // 按会话分组
    const sessions = this.groupBySession(events);
    
    for (const sessionEvents of sessions.values()) {
      const sorted = sessionEvents.sort((a, b) => a.timestamp - b.timestamp);
      const path = sorted.map(e => e.name);
      
      if (path.length >= minLength) {
        const pathKey = path.join(' -> ');
        pathCounts.set(pathKey, (pathCounts.get(pathKey) || 0) + 1);
      }
    }
    
    return Array.from(pathCounts.entries())
      .map(([path, count]) => ({ path: path.split(' -> '), count }))
      .sort((a, b) => b.count - a.count);
  }
  
  private groupBySession(events: AnalyticsEvent[]): Map<string, AnalyticsEvent[]> {
    const groups = new Map<string, AnalyticsEvent[]>();
    
    for (const event of events) {
      if (!groups.has(event.sessionId)) {
        groups.set(event.sessionId, []);
      }
      groups.get(event.sessionId)!.push(event);
    }
    
    return groups;
  }
}

// 指标计算
export class MetricsCalculator {
  static conversionRate(events: AnalyticsEvent[], goalEvent: string, initialEvent: string): number {
    const initial = new Set(events.filter(e => e.name === initialEvent).map(e => e.sessionId)).size;
    const goals = new Set(events.filter(e => e.name === goalEvent).map(e => e.sessionId)).size;
    
    return initial > 0 ? (goals / initial) * 100 : 0;
  }
  
  static averageTimeBetween(events: AnalyticsEvent[], eventA: string, eventB: string): number {
    const times: number[] = [];
    const sessions = new Map<string, AnalyticsEvent[]>();
    
    // 按会话分组
    for (const e of events) {
      if (!sessions.has(e.sessionId)) {
        sessions.set(e.sessionId, []);
      }
      sessions.get(e.sessionId)!.push(e);
    }
    
    // 计算每个会话的时间差
    for (const sessionEvents of sessions.values()) {
      const sorted = sessionEvents.sort((a, b) => a.timestamp - b.timestamp);
      const idxA = sorted.findIndex(e => e.name === eventA);
      const idxB = sorted.findIndex(e => e.name === eventB);
      
      if (idxA !== -1 && idxB !== -1 && idxB > idxA) {
        times.push(sorted[idxB].timestamp - sorted[idxA].timestamp);
      }
    }
    
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }
}

export function demo(): void {
  console.log('=== 数据分析 ===\n');
  
  const tracker = new EventTracker();
  
  // 模拟事件
  tracker.track('page_view', { page: '/home' });
  tracker.track('product_view', { productId: '123' });
  tracker.track('add_to_cart', { productId: '123' });
  tracker.track('checkout_start');
  tracker.track('purchase', { value: 99.99 });
  
  const events = tracker.getEvents();
  console.log(`追踪了 ${events.length} 个事件`);
  
  // 漏斗分析
  const funnelAnalyzer = new FunnelAnalyzer();
  const funnel = funnelAnalyzer.analyze(
    events,
    [
      { name: '页面访问', event: 'page_view' },
      { name: '查看商品', event: 'product_view' },
      { name: '加入购物车', event: 'add_to_cart' },
      { name: '开始结账', event: 'checkout_start' },
      { name: '完成购买', event: 'purchase' }
    ],
    'session'
  );
  
  console.log('\n漏斗分析:');
  funnel.forEach(step => {
    console.log(`  ${step.step}: ${step.count} (${step.conversionRate.toFixed(1)}%)`);
  });
  
  // 转化率
  const conversion = MetricsCalculator.conversionRate(events, 'purchase', 'page_view');
  console.log(`\n总体转化率: ${conversion.toFixed(1)}%`);
}
