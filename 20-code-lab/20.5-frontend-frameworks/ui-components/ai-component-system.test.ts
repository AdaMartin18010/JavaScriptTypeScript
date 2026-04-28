import { describe, it, expect, vi } from 'vitest';
import {
  AIComponentGenerator,
  AdaptiveUIEngine,
  IntelligentStateManager,
  NaturalLanguageUIController,
  type UserContext
} from './ai-component-system.js';

describe('AIComponentGenerator', () => {
  it('should generate a searchable user list component', async () => {
    const generator = new AIComponentGenerator();
    const spec = await generator.generateComponent('创建一个带搜索的用户列表');

    expect(spec.name).toBe('Smart列表');
    expect(spec.features).toContain('searchable');
    expect(spec.props.some(p => p.name === 'onSearch')).toBe(true);
    expect(spec.styling.responsive).toBe(true);
  });

  it('should generate a filterable and paginated table', async () => {
    const generator = new AIComponentGenerator();
    const spec = await generator.generateComponent('创建一个可筛选的表格，支持分页');

    expect(spec.name).toBe('Smart表格');
    expect(spec.features).toContain('filterable');
    expect(spec.features).toContain('pagination');
    expect(spec.props.some(p => p.name === 'filters')).toBe(true);
    expect(spec.props.some(p => p.name === 'pageSize')).toBe(true);
  });

  it('should fallback to SmartComponent when no keyword matches', async () => {
    const generator = new AIComponentGenerator();
    const spec = await generator.generateComponent('创建一个导航菜单');

    expect(spec.name).toBe('SmartComponent');
  });
});

describe('AdaptiveUIEngine', () => {
  const createContext = (overrides: Partial<UserContext> = {}): UserContext => ({
    deviceType: 'desktop',
    performanceScore: 80,
    networkSpeed: 'fast',
    preferences: {},
    interactionHistory: [],
    ...overrides
  });

  it('should adapt component for mobile devices', () => {
    const engine = new AdaptiveUIEngine(createContext({ deviceType: 'mobile' }));
    const config = engine.adaptComponent(
      { pagination: true },
      { mobile: { pagination: false, infiniteScroll: true } }
    );

    expect(config).toEqual({ pagination: false, infiniteScroll: true });
  });

  it('should predict search intent from interaction history', () => {
    const engine = new AdaptiveUIEngine(createContext({
      interactionHistory: ['search_product', 'search_category', 'search_brand']
    }));

    expect(engine.predictIntent()).toBe('likely_to_search');
    expect(engine.shouldPrefetch('/api/search-results')).toBe(true);
    expect(engine.shouldPrefetch('/api/products')).toBe(false);
  });

  it('should disable prefetch on slow network', () => {
    const engine = new AdaptiveUIEngine(createContext({ networkSpeed: 'slow' }));

    expect(engine.shouldPrefetch('search-data')).toBe(false);
  });

  it('should apply lowPerformance and slowNetwork adaptations together', () => {
    const engine = new AdaptiveUIEngine(createContext({
      performanceScore: 30,
      networkSpeed: 'slow'
    }));
    const config = engine.adaptComponent(
      { animations: true, images: true },
      {
        lowPerformance: { animations: false },
        slowNetwork: { images: false, lazyLoad: true }
      }
    );

    expect(config).toEqual({ animations: false, images: false, lazyLoad: true });
  });
});

describe('IntelligentStateManager', () => {
  it('should update state and notify listeners', () => {
    const manager = new IntelligentStateManager({ count: 0 });
    const listener = vi.fn();

    manager.subscribe(listener);
    manager.smartUpdate(() => ({ count: 5 }));

    expect(manager.getState()).toEqual({ count: 5 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ count: 5 });
  });

  it('should apply predictor automatically on update', () => {
    const manager = new IntelligentStateManager({ value: 0, doubled: 0 });
    manager.addPredictor(state => ({ doubled: (state as { value: number; doubled: number }).value * 2 }));

    manager.smartUpdate(() => ({ value: 7 }));

    expect(manager.getState()).toEqual({ value: 7, doubled: 14 });
  });

  it('should allow unsubscribing listeners', () => {
    const manager = new IntelligentStateManager({ count: 0 });
    const listener = vi.fn();

    const unsubscribe = manager.subscribe(listener);
    unsubscribe();
    manager.smartUpdate(() => ({ count: 1 }));

    expect(listener).not.toHaveBeenCalled();
  });
});

describe('NaturalLanguageUIController', () => {
  it('should parse search command', () => {
    const controller = new NaturalLanguageUIController();
    const command = controller.parseCommand('搜索TypeScript教程');

    expect(command.action).toBe('search');
    expect(command.parameters.query).toBe('TypeScript教程');
  });

  it('should parse sort command with descending order', () => {
    const controller = new NaturalLanguageUIController();
    const command = controller.parseCommand('按价格倒序排序');

    expect(command.action).toBe('sort');
    expect(command.parameters.field).toBe('价格');
    expect(command.parameters.order).toBe('desc');
  });

  it('should return unknown for unrecognized commands', () => {
    const controller = new NaturalLanguageUIController();
    const command = controller.parseCommand('Hello world');

    expect(command.action).toBe('unknown');
    expect(command.parameters.rawInput).toBe('Hello world');
  });
});
