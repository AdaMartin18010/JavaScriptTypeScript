/**
 * @file LLM驱动的应用架构
 * @category App Architecture → AI-Driven
 * @difficulty hard
 * @tags llm, ai-architecture, smart-routing, ai-state
 * 
 * @description
 * LLM增强的应用架构模式：
 * - 智能路由决策
 * - AI辅助状态管理
 * - 自然语言接口
 */

// 智能路由系统
export interface RouteContext {
  path: string;
  params: Record<string, string>;
  userIntent?: string;
  history: string[];
}

export interface RouteDecision {
  targetRoute: string;
  params: Record<string, string>;
  confidence: number;
  reasoning: string;
}

export class IntelligentRouter {
  private routes = new Map<string, (ctx: RouteContext) => boolean>();
  private fallbackHandler: ((ctx: RouteContext) => RouteDecision) | null = null;
  
  registerRoute(
    pattern: string,
    matcher: (ctx: RouteContext) => boolean
  ): void {
    this.routes.set(pattern, matcher);
  }
  
  setFallback(handler: (ctx: RouteContext) => RouteDecision): void {
    this.fallbackHandler = handler;
  }
  
  // 智能路由决策
  resolveRoute(context: RouteContext): RouteDecision {
    // 1. 精确匹配
    for (const [pattern, matcher] of this.routes) {
      if (matcher(context)) {
        return {
          targetRoute: pattern,
          params: context.params,
          confidence: 1.0,
          reasoning: '精确路径匹配'
        };
      }
    }
    
    // 2. 基于用户意图的智能推断
    if (context.userIntent) {
      const intentBased = this.inferRouteFromIntent(context);
      if (intentBased.confidence > 0.7) {
        return intentBased;
      }
    }
    
    // 3. 基于历史的推荐
    const historyBased = this.inferFromHistory(context);
    if (historyBased.confidence > 0.6) {
      return historyBased;
    }
    
    // 4. Fallback
    if (this.fallbackHandler) {
      return this.fallbackHandler(context);
    }
    
    return {
      targetRoute: '/404',
      params: {},
      confidence: 0,
      reasoning: '未找到匹配路由'
    };
  }
  
  private inferRouteFromIntent(context: RouteContext): RouteDecision {
    const intent = context.userIntent?.toLowerCase() || '';
    
    // 简单的意图映射
    const intentMap: Record<string, string> = {
      '查看订单': '/orders',
      '订单': '/orders',
      'order': '/orders',
      '用户设置': '/settings',
      'settings': '/settings',
      '购物车': '/cart',
      'cart': '/cart',
      '结账': '/checkout',
      'checkout': '/checkout'
    };
    
    for (const [key, route] of Object.entries(intentMap)) {
      if (intent.includes(key.toLowerCase())) {
        return {
          targetRoute: route,
          params: {},
          confidence: 0.85,
          reasoning: `基于意图"${key}"推断`
        };
      }
    }
    
    return {
      targetRoute: '/',
      params: {},
      confidence: 0.3,
      reasoning: '意图不明确'
    };
  }
  
  private inferFromHistory(context: RouteContext): RouteDecision {
    if (context.history.length === 0) {
      return { targetRoute: '/', params: {}, confidence: 0, reasoning: '无历史数据' };
    }
    
    // 简单的频率分析
    const frequency = new Map<string, number>();
    for (const route of context.history) {
      frequency.set(route, (frequency.get(route) || 0) + 1);
    }
    
    const mostLikely = Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    return {
      targetRoute: mostLikely[0],
      params: {},
      confidence: Math.min(mostLikely[1] / context.history.length, 0.8),
      reasoning: '基于历史访问频率'
    };
  }
}

// AI辅助状态管理
export interface StateSuggestion {
  action: 'update' | 'reset' | 'merge';
  path: string;
  value: unknown;
  confidence: number;
  reason: string;
}

export class AIAssistedStateManager<T extends Record<string, unknown>> {
  private state: T;
  private history: { state: T; action: string; timestamp: number }[] = [];
  private listeners = new Set<(state: T, suggestion?: StateSuggestion) => void>();
  
  constructor(initialState: T) {
    this.state = initialState;
  }
  
  getState(): T {
    return { ...this.state };
  }
  
  setState(updater: (prev: T) => T, action = 'update'): void {
    const newState = updater(this.state);
    this.history.push({ state: this.state, action, timestamp: Date.now() });
    this.state = newState;
    
    // AI生成建议
    const suggestion = this.generateSuggestion();
    
    this.listeners.forEach(listener => { listener(this.state, suggestion); });
  }
  
  // 基于历史模式生成状态管理建议
  private generateSuggestion(): StateSuggestion | undefined {
    if (this.history.length < 3) return undefined;
    
    // 检测重复模式
    const lastActions = this.history.slice(-3).map(h => h.action);
    if (lastActions.every(a => a === lastActions[0])) {
      return {
        action: 'reset',
        path: '',
        value: null,
        confidence: 0.6,
        reason: `检测到重复"${lastActions[0]}"操作，建议重置状态`
      };
    }
    
    return undefined;
  }
  
  // 预测性状态更新
  predictNextState(): Partial<T> | null {
    if (this.history.length < 2) return null;
    
    // 简单的时间序列预测
    const recent = this.history.slice(-5);
    const keys = Object.keys(this.state);
    
    const prediction: Partial<T> = {};
    
    for (const key of keys) {
      const values = recent.map(h => h.state[key]).filter(v => typeof v === 'number');
      if (values.length >= 2) {
        // 简单的线性趋势
        const trend = (values[values.length - 1]) - (values[values.length - 2]);
        (prediction as Record<string, unknown>)[key] = (this.state[key] as number) + trend;
      }
    }
    
    return Object.keys(prediction).length > 0 ? prediction : null;
  }
  
  subscribe(listener: (state: T, suggestion?: StateSuggestion) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}

// 自然语言命令接口
export class NaturalLanguageInterface {
  private commandHandlers = new Map<string, (args: string[]) => void>();
  
  registerCommand(
    pattern: string,
    handler: (args: string[]) => void
  ): void {
    this.commandHandlers.set(pattern.toLowerCase(), handler);
  }
  
  // 解析自然语言命令
  parseCommand(input: string): { command: string; args: string[] } | null {
    // 简单的关键字匹配
    const normalized = input.toLowerCase().trim();
    
    for (const [pattern, handler] of this.commandHandlers) {
      if (normalized.includes(pattern)) {
        const args = normalized
          .replace(pattern, '')
          .trim()
          .split(/\s+/)
          .filter(s => s.length > 0);
        
        return { command: pattern, args };
      }
    }
    
    return null;
  }
  
  execute(input: string): void {
    const parsed = this.parseCommand(input);
    
    if (parsed) {
      const handler = this.commandHandlers.get(parsed.command);
      if (handler) {
        console.log(`执行命令: ${parsed.command}, 参数: ${parsed.args.join(', ')}`);
        handler(parsed.args);
      }
    } else {
      console.log(`无法理解的命令: ${input}`);
    }
  }
}

export function demo(): void {
  console.log('=== LLM驱动应用架构 ===\n');
  
  // 智能路由演示
  console.log('--- 智能路由 ---');
  const router = new IntelligentRouter();
  
  router.registerRoute('/home', ctx => ctx.path === '/');
  router.registerRoute('/orders', ctx => ctx.path.startsWith('/orders'));
  
  const decision1 = router.resolveRoute({
    path: '/unknown',
    params: {},
    userIntent: '我想查看我的订单',
    history: ['/home', '/orders', '/orders']
  });
  console.log('路由决策:', decision1);
  
  // AI状态管理演示
  console.log('\n--- AI辅助状态管理 ---');
  const stateManager = new AIAssistedStateManager({
    count: 0,
    items: [] as string[]
  });
  
  stateManager.subscribe((state, suggestion) => {
    console.log('状态更新:', state);
    if (suggestion) {
      console.log('AI建议:', suggestion);
    }
  });
  
  stateManager.setState(s => ({ ...s, count: s.count + 1 }), 'increment');
  stateManager.setState(s => ({ ...s, count: s.count + 1 }), 'increment');
  stateManager.setState(s => ({ ...s, count: s.count + 1 }), 'increment');
  
  // 自然语言接口演示
  console.log('\n--- 自然语言接口 ---');
  const nli = new NaturalLanguageInterface();
  
  nli.registerCommand('搜索', args => { console.log(`搜索: ${args.join(' ')}`); });
  nli.registerCommand('打开', args => { console.log(`打开页面: ${args[0]}`); });
  
  nli.execute('搜索 JavaScript 教程');
  nli.execute('打开 设置页面');
}
