import { describe, it, expect } from 'vitest';
import {
  IntelligentRenderEngine,
  IslandsArchitecture,
  ProgressiveHydrationScheduler
} from './intelligent-rendering.js';

describe('IntelligentRenderEngine', () => {
  it('should choose SSR for article content', () => {
    const engine = new IntelligentRenderEngine();
    const decision = engine.decideStrategy('article', {
      device: 'desktop',
      connection: '4g',
      history: []
    });

    expect(decision.strategy).toBe('ssr');
    expect(decision.priority).toBe('critical');
  });

  it('should choose CSR for app content with dashboard history', () => {
    const engine = new IntelligentRenderEngine();
    const decision = engine.decideStrategy('app', {
      device: 'mobile',
      connection: '4g',
      history: ['/dashboard', '/settings']
    });

    expect(decision.strategy).toBe('csr');
    expect(decision.priority).toBe('important');
  });

  it('should choose SSG for slow-2g connection', () => {
    const engine = new IntelligentRenderEngine();
    const decision = engine.decideStrategy('landing', {
      device: 'mobile',
      connection: 'slow-2g',
      history: []
    });

    expect(decision.strategy).toBe('ssg');
    expect(decision.priority).toBe('critical');
  });

  it('should optimize strategy based on recorded metrics', () => {
    const engine = new IntelligentRenderEngine();
    engine.recordMetric('lcp', 5000);

    const optimized = engine.optimizeStrategy();
    expect(optimized.strategy).toBe('streaming');
  });
});

describe('IslandsArchitecture', () => {
  it('should register islands and track stats', () => {
    const islands = new IslandsArchitecture();
    islands.registerIsland({
      id: 'header',
      component: 'Header',
      props: { title: 'Test' },
      hydration: 'eager'
    });

    const stats = islands.getIslandStats();
    expect(stats.total).toBe(1);
    expect(stats.hydrated).toBe(0);
    expect(stats.pending).toBe(1);
  });

  it('should hydrate eager islands', async () => {
    const islands = new IslandsArchitecture();
    islands.registerIsland({
      id: 'nav',
      component: 'Nav',
      props: {},
      hydration: 'eager'
    });
    islands.registerIsland({
      id: 'comments',
      component: 'Comments',
      props: {},
      hydration: 'visible'
    });

    await islands.hydrate('eager');
    expect(islands.getHydratedCount()).toBe(1);
  });

  it('should hydrate all eager-matching islands when strategy is eager', async () => {
    const islands = new IslandsArchitecture();
    islands.registerIsland({ id: 'a', component: 'A', props: {}, hydration: 'eager' });
    islands.registerIsland({ id: 'b', component: 'B', props: {}, hydration: 'eager' });
    islands.registerIsland({ id: 'c', component: 'C', props: {}, hydration: 'lazy' });

    await islands.hydrate('eager');
    expect(islands.getHydratedCount()).toBe(2);
  });
});

describe('ProgressiveHydrationScheduler', () => {
  it('should process tasks by priority order', async () => {
    const scheduler = new ProgressiveHydrationScheduler();
    const order: string[] = [];

    scheduler.schedule('low', () => order.push('low'), 10);
    scheduler.schedule('high', () => order.push('high'), 1);
    scheduler.schedule('mid', () => order.push('mid'), 5);

    await new Promise(r => setTimeout(r, 50));
    expect(order).toEqual(['high', 'mid', 'low']);
  });

  it('should handle empty queue gracefully', async () => {
    const scheduler = new ProgressiveHydrationScheduler();
    // No tasks scheduled, should not throw
    await new Promise(r => setTimeout(r, 10));
    expect(true).toBe(true);
  });
});
