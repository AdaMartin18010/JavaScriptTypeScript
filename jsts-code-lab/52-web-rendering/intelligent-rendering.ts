/**
 * @file 智能渲染策略
 * @category Web Rendering → Hydration
 * @difficulty hard
 * @tags ssr, csr, hydration, islands-architecture
 * 
 * @description
 * 智能渲染优化策略：
 * - SSR/CSR 混合渲染决策
 * - 渐进式hydration
 * - Islands架构实现
 */

export type RenderStrategy = 'ssr' | 'csr' | 'ssg' | 'isr' | 'streaming';

export interface RenderDecision {
  strategy: RenderStrategy;
  reason: string;
  priority: 'critical' | 'important' | 'lazy';
}

// 智能渲染决策引擎
export class IntelligentRenderEngine {
  private metrics: Map<string, number> = new Map();
  
  // 根据内容和用户行为决定渲染策略
  decideStrategy(
    contentType: string,
    userContext: { device: string; connection: string; history: string[] }
  ): RenderDecision {
    // 关键内容优先SSR
    if (contentType === 'article' || contentType === 'product') {
      return {
        strategy: 'ssr',
        reason: 'SEO关键内容，需要快速首屏',
        priority: 'critical'
      };
    }
    
    // 用户交互频繁的内容用CSR
    if (userContext.history.includes('/dashboard') || contentType === 'app') {
      return {
        strategy: 'csr',
        reason: '应用型内容，交互优先',
        priority: 'important'
      };
    }
    
    // 弱网环境使用SSG
    if (userContext.connection === 'slow-2g') {
      return {
        strategy: 'ssg',
        reason: '弱网环境，预生成内容',
        priority: 'critical'
      };
    }
    
    // 默认流式渲染
    return {
      strategy: 'streaming',
      reason: '平衡首屏和交互性',
      priority: 'important'
    };
  }
  
  // 记录性能指标用于优化决策
  recordMetric(name: string, value: number): void {
    this.metrics.set(name, value);
  }
  
  // 基于历史数据优化策略
  optimizeStrategy(): RenderDecision {
    const avgLCP = this.metrics.get('lcp') || 2500;
    const avgFID = this.metrics.get('fid') || 100;
    
    if (avgLCP > 4000) {
      return {
        strategy: 'streaming',
        reason: 'LCP过高，使用流式渲染优化',
        priority: 'critical'
      };
    }
    
    if (avgFID > 200) {
      return {
        strategy: 'ssr',
        reason: 'FID过高，减少客户端JS',
        priority: 'critical'
      };
    }
    
    return {
      strategy: 'ssg',
      reason: '性能良好，使用静态生成',
      priority: 'lazy'
    };
  }
}

// Islands架构实现
export interface Island {
  id: string;
  component: string;
  props: Record<string, unknown>;
  hydration: 'eager' | 'lazy' | 'idle' | 'visible';
}

export class IslandsArchitecture {
  private islands: Map<string, Island> = new Map();
  private hydrated: Set<string> = new Set();
  
  registerIsland(island: Island): void {
    this.islands.set(island.id, island);
  }
  
  // 根据策略hydrate islands
  async hydrate(strategy: 'eager' | 'lazy' | 'idle' | 'visible' = 'visible'): Promise<void> {
    const islandsToHydrate = Array.from(this.islands.values())
      .filter(i => i.hydration === strategy);
    
    for (const island of islandsToHydrate) {
      await this.hydrateIsland(island);
    }
  }
  
  private async hydrateIsland(island: Island): Promise<void> {
    console.log(`Hydrating island: ${island.id} (${island.component})`);
    this.hydrated.add(island.id);
  }
  
  getHydratedCount(): number {
    return this.hydrated.size;
  }
  
  getIslandStats(): { total: number; hydrated: number; pending: number } {
    return {
      total: this.islands.size,
      hydrated: this.hydrated.size,
      pending: this.islands.size - this.hydrated.size
    };
  }
}

// 渐进式Hydration调度器
export class ProgressiveHydrationScheduler {
  private queue: Array<{ id: string; callback: () => void; priority: number }> = [];
  private isProcessing = false;
  
  schedule(id: string, callback: () => void, priority: number = 5): void {
    this.queue.push({ id, callback, priority });
    this.queue.sort((a, b) => a.priority - b.priority);
    
    if (!this.isProcessing) {
      this.isProcessing = true;
      Promise.resolve().then(() => this.processQueue());
    }
  }
  
  private async processQueue(): Promise<void> {
    while (this.queue.length > 0) {
      this.queue.sort((a, b) => a.priority - b.priority);
      const task = this.queue.shift()!;
      
      // 使用 requestIdleCallback 或 setTimeout 让出主线程
      await new Promise(resolve => {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => resolve(undefined));
        } else {
          setTimeout(() => resolve(undefined), 0);
        }
      });
      
      task.callback();
      console.log(`Hydrated: ${task.id} (priority: ${task.priority})`);
    }
    
    this.isProcessing = false;
  }
}

export function demo(): void {
  console.log('=== 智能渲染策略 ===\n');
  
  // 渲染决策演示
  const engine = new IntelligentRenderEngine();
  
  const articleStrategy = engine.decideStrategy('article', {
    device: 'desktop',
    connection: '4g',
    history: []
  });
  console.log('文章内容策略:', articleStrategy);
  
  const appStrategy = engine.decideStrategy('app', {
    device: 'mobile',
    connection: '4g',
    history: ['/dashboard', '/settings']
  });
  console.log('应用内容策略:', appStrategy);
  
  // Islands架构演示
  console.log('\n--- Islands架构 ---');
  const islands = new IslandsArchitecture();
  
  islands.registerIsland({
    id: 'header',
    component: 'Header',
    props: { title: 'My Site' },
    hydration: 'eager'
  });
  
  islands.registerIsland({
    id: 'comments',
    component: 'CommentSection',
    props: { postId: 123 },
    hydration: 'visible'
  });
  
  islands.registerIsland({
    id: 'footer',
    component: 'Footer',
    props: {},
    hydration: 'idle'
  });
  
  console.log('Island统计:', islands.getIslandStats());
  
  // 渐进式Hydration演示
  console.log('\n--- 渐进式Hydration ---');
  const scheduler = new ProgressiveHydrationScheduler();
  
  scheduler.schedule('search', () => {}, 1); // 高优先级
  scheduler.schedule('analytics', () => {}, 10); // 低优先级
  scheduler.schedule('chat', () => {}, 2);
}
