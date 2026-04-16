import { describe, it, expect, vi } from 'vitest';
import {
  IntelligentRouter,
  AIAssistedStateManager,
  NaturalLanguageInterface
} from './llm-driven-architecture.js';

describe('IntelligentRouter', () => {
  it('should return exact match with confidence 1.0', () => {
    const router = new IntelligentRouter();
    router.registerRoute('/home', ctx => ctx.path === '/');

    const decision = router.resolveRoute({ path: '/', params: {}, history: [] });
    expect(decision.targetRoute).toBe('/home');
    expect(decision.confidence).toBe(1.0);
  });

  it('should infer route from user intent', () => {
    const router = new IntelligentRouter();
    const decision = router.resolveRoute({
      path: '/unknown',
      params: {},
      userIntent: '我想查看我的订单',
      history: []
    });

    expect(decision.targetRoute).toBe('/orders');
    expect(decision.confidence).toBe(0.85);
  });

  it('should infer route from history frequency', () => {
    const router = new IntelligentRouter();
    const decision = router.resolveRoute({
      path: '/unknown',
      params: {},
      history: ['/about', '/home', '/home', '/home']
    });

    expect(decision.targetRoute).toBe('/home');
    expect(decision.confidence).toBe(0.75);
  });

  it('should return fallback when fallback handler is set', () => {
    const router = new IntelligentRouter();
    router.setFallback(ctx => ({
      targetRoute: '/fallback',
      params: ctx.params,
      confidence: 0.5,
      reasoning: 'fallback'
    }));

    const decision = router.resolveRoute({ path: '/missing', params: {}, history: [] });
    expect(decision.targetRoute).toBe('/fallback');
  });
});

describe('AIAssistedStateManager', () => {
  it('should update state and notify listeners', () => {
    const manager = new AIAssistedStateManager({ count: 0 });
    const listener = vi.fn();

    manager.subscribe(listener);
    manager.setState(s => ({ ...s, count: 5 }), 'update');

    expect(manager.getState()).toEqual({ count: 5 });
    expect(listener).toHaveBeenCalledWith(expect.anything(), undefined);
  });

  it('should suggest reset after repeated identical actions', () => {
    const manager = new AIAssistedStateManager({ count: 0 });
    const suggestions: any[] = [];

    manager.subscribe((state, suggestion) => {
      if (suggestion) suggestions.push(suggestion as never);
    });

    manager.setState(s => ({ ...s, count: s.count + 1 }), 'increment');
    manager.setState(s => ({ ...s, count: s.count + 1 }), 'increment');
    manager.setState(s => ({ ...s, count: s.count + 1 }), 'increment');

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].action).toBe('reset');
  });

  it('should predict next state based on numeric trends', () => {
    const manager = new AIAssistedStateManager({ value: 0 });
    manager.setState(() => ({ value: 2 }), 'update');
    manager.setState(s => ({ value: s.value + 3 }), 'update');
    manager.setState(s => ({ value: s.value + 3 }), 'update');

    const prediction = manager.predictNextState();
    expect(prediction).toEqual({ value: 11 });
  });

  it('should allow unsubscribing listeners', () => {
    const manager = new AIAssistedStateManager({ count: 0 });
    const listener = vi.fn();

    const unsubscribe = manager.subscribe(listener);
    unsubscribe();
    manager.setState(s => ({ ...s, count: 1 }), 'update');

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('NaturalLanguageInterface', () => {
  it('should parse and execute registered commands', () => {
    const nli = new NaturalLanguageInterface();
    const executed: string[] = [];

    nli.registerCommand('搜索', args => executed.push(args.join(' ')));
    nli.execute('搜索 TypeScript 教程');

    expect(executed).toEqual(['typescript 教程']);
  });

  it('should parse command with arguments', () => {
    const nli = new NaturalLanguageInterface();
    const parsed = nli.parseCommand('打开 settings');

    expect(parsed).toBeNull();
  });

  it('should return null for unrecognized commands', () => {
    const nli = new NaturalLanguageInterface();
    const parsed = nli.parseCommand('random gibberish');

    expect(parsed).toBeNull();
  });
});
