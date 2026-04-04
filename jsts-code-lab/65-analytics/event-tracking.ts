/**
 * @file 事件追踪
 * @category Analytics → Event Tracking
 * @difficulty medium
 * @tags event-tracking, analytics, user-behavior
 *
 * @description
 * 事件追踪系统：埋点、事件属性、会话追踪、实时分析
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  userId?: string;
  anonymousId: string;
  sessionId: string;
  timestamp: number;
  context: EventContext;
}

export interface EventContext {
  page?: {
    url: string;
    title: string;
    referrer?: string;
  };
  device?: {
    type: 'desktop' | 'tablet' | 'mobile';
    os?: string;
    browser?: string;
  };
  location?: {
    country?: string;
    city?: string;
  };
  campaign?: {
    source?: string;
    medium?: string;
    name?: string;
  };
}

export interface Session {
  id: string;
  userId?: string;
  anonymousId: string;
  startedAt: number;
  lastActivityAt: number;
  events: AnalyticsEvent[];
  properties: Record<string, unknown>;
}

export type EventType = 'track' | 'page' | 'identify' | 'group' | 'alias';

// ============================================================================
// 事件追踪器
// ============================================================================

export class EventTracker {
  private events: AnalyticsEvent[] = [];
  private listeners: Array<(event: AnalyticsEvent) => void> = [];
  private sessionManager: SessionManager;
  private batchSize: number;
  private flushInterval: number;
  private batch: AnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;

  constructor(options: {
    sessionManager?: SessionManager;
    batchSize?: number;
    flushInterval?: number;
    autoStart?: boolean;
  } = {}) {
    this.sessionManager = options.sessionManager || new SessionManager();
    this.batchSize = options.batchSize || 20;
    this.flushInterval = options.flushInterval || 5000;

    if (options.autoStart !== false) {
      this.start();
    }
  }

  /**
   * 追踪事件
   */
  track(
    name: string,
    properties: Record<string, unknown> = {},
    context?: Partial<EventContext>
  ): AnalyticsEvent {
    const event = this.createEvent('track', name, properties, context);
    this.enqueue(event);
    return event;
  }

  /**
   * 页面浏览
   */
  page(
    name: string,
    properties: Record<string, unknown> = {},
    context?: Partial<EventContext>
  ): AnalyticsEvent {
    const event = this.createEvent('page', name, properties, context);
    this.enqueue(event);
    return event;
  }

  /**
   * 用户识别
   */
  identify(userId: string, traits: Record<string, unknown> = {}): AnalyticsEvent {
    this.sessionManager.setUserId(userId);
    const event = this.createEvent('identify', 'identify', { userId, ...traits });
    this.enqueue(event);
    return event;
  }

  /**
   * 启动批量发送
   */
  start(): void {
    if (this.flushTimer) return;
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * 停止批量发送
   */
  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush(); // 强制发送剩余事件
  }

  /**
   * 订阅事件
   */
  onTrack(listener: (event: AnalyticsEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 获取所有事件
   */
  getEvents(filters?: {
    name?: string;
    userId?: string;
    startTime?: number;
    endTime?: number;
  }): AnalyticsEvent[] {
    let result = [...this.events];

    if (filters?.name) {
      result = result.filter(e => e.name === filters.name);
    }
    if (filters?.userId) {
      result = result.filter(e => e.userId === filters.userId);
    }
    if (filters?.startTime) {
      result = result.filter(e => e.timestamp >= filters.startTime!);
    }
    if (filters?.endTime) {
      result = result.filter(e => e.timestamp <= filters.endTime!);
    }

    return result;
  }

  private createEvent(
    type: EventType,
    name: string,
    properties: Record<string, unknown>,
    context?: Partial<EventContext>
  ): AnalyticsEvent {
    const session = this.sessionManager.getCurrentSession();

    return {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      properties,
      userId: session.userId,
      anonymousId: session.anonymousId,
      sessionId: session.id,
      timestamp: Date.now(),
      context: {
        ...this.getDefaultContext(),
        ...context
      }
    };
  }

  private enqueue(event: AnalyticsEvent): void {
    this.batch.push(event);

    if (this.batch.length >= this.batchSize) {
      this.flush();
    }

    // 实时通知
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (err) {
        console.error('[EventTracker] Listener error:', err);
      }
    });
  }

  private flush(): void {
    if (this.batch.length === 0) return;

    const events = [...this.batch];
    this.batch = [];
    this.events.push(...events);

    // 这里可以发送到服务器
    console.log(`[EventTracker] Flushed ${events.length} events`);
  }

  private getDefaultContext(): EventContext {
    return {
      page: {
        url: typeof window !== 'undefined' ? window.location.href : '',
        title: typeof document !== 'undefined' ? document.title : ''
      },
      device: {
        type: 'desktop'
      }
    };
  }
}

// ============================================================================
// 会话管理器
// ============================================================================

export class SessionManager {
  private currentSession: Session;
  private sessions: Map<string, Session> = new Map();
  private timeout: number;

  constructor(options: { timeout?: number } = {}) {
    this.timeout = options.timeout || 30 * 60 * 1000; // 30分钟
    this.currentSession = this.createSession();
  }

  /**
   * 获取当前会话
   */
  getCurrentSession(): Session {
    // 检查会话是否过期
    if (Date.now() - this.currentSession.lastActivityAt > this.timeout) {
      this.endSession();
      this.currentSession = this.createSession();
    }

    this.currentSession.lastActivityAt = Date.now();
    return this.currentSession;
  }

  /**
   * 设置用户 ID
   */
  setUserId(userId: string): void {
    this.currentSession.userId = userId;
  }

  /**
   * 结束当前会话
   */
  endSession(): void {
    this.sessions.set(this.currentSession.id, {
      ...this.currentSession,
      properties: {
        ...this.currentSession.properties,
        endedAt: Date.now()
      }
    });
  }

  /**
   * 获取会话历史
   */
  getSessions(userId?: string): Session[] {
    const all = Array.from(this.sessions.values());
    if (userId) {
      return all.filter(s => s.userId === userId);
    }
    return all;
  }

  private createSession(): Session {
    const anonymousId = `anon_${Math.random().toString(36).slice(2, 10)}`;
    
    return {
      id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      anonymousId,
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
      events: [],
      properties: {}
    };
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 事件追踪演示 ===\n');

  const tracker = new EventTracker({ autoStart: false });

  // 1. 追踪自定义事件
  console.log('--- 追踪事件 ---');
  
  tracker.track('Product Viewed', {
    product_id: '123',
    product_name: 'Wireless Headphones',
    price: 99.99,
    category: 'Electronics'
  });

  tracker.track('Added to Cart', {
    product_id: '123',
    quantity: 1,
    cart_value: 99.99
  });

  // 2. 页面浏览
  console.log('--- 页面浏览 ---');
  tracker.page('Homepage', { url: '/home' });
  tracker.page('Product Page', { url: '/product/123', product_id: '123' });

  // 3. 用户识别
  console.log('--- 用户识别 ---');
  tracker.identify('user_12345', {
    email: 'user@example.com',
    plan: 'premium',
    company: 'Acme Inc'
  });

  // 4. 事件订阅
  console.log('--- 实时事件监听 ---');
  const unsubscribe = tracker.onTrack((event) => {
    console.log(`  [Real-time] ${event.name}`);
  });

  tracker.track('Button Clicked', { button_id: 'submit' });
  
  // 取消订阅
  unsubscribe();

  // 5. 批量刷新
  console.log('\n--- 批量刷新 ---');
  tracker.start();
  
  for (let i = 0; i < 5; i++) {
    tracker.track('Scroll Event', { depth: (i + 1) * 20 });
  }

  // 手动刷新
  tracker.stop();

  // 6. 查询事件
  console.log('\n--- 查询事件 ---');
  const allEvents = tracker.getEvents();
  console.log(`  Total events tracked: ${allEvents.length}`);
  
  const productEvents = tracker.getEvents({ name: 'Product Viewed' });
  console.log(`  Product Viewed events: ${productEvents.length}`);

  console.log('\n--- 会话信息 ---');
  const sessionManager = new SessionManager();
  const session = sessionManager.getCurrentSession();
  console.log(`  Session ID: ${session.id}`);
  console.log(`  Anonymous ID: ${session.anonymousId}`);
}
