import { describe, it, expect, vi } from 'vitest';
import { FeatureToggleManager, ToggleConditionEvaluator } from './feature-toggles';

describe('FeatureToggleManager', () => {
  it('respects environment overrides', () => {
    const mgr = new FeatureToggleManager();
    mgr.register({ key: 'f1', name: 'F1', description: '', enabled: false, environments: { dev: true }, dependencies: [], tags: [], owner: 'a' });
    expect(mgr.isEnabled('f1', { environment: 'dev', timestamp: 1 })).toBe(true);
    expect(mgr.isEnabled('f1', { environment: 'prod', timestamp: 1 })).toBe(false);
  });

  it('blocks toggle when dependency disabled', () => {
    const mgr = new FeatureToggleManager();
    mgr.register({ key: 'base', name: 'Base', description: '', enabled: false, environments: {}, dependencies: [], tags: [], owner: 'a' });
    mgr.register({ key: 'feat', name: 'Feat', description: '', enabled: true, environments: {}, dependencies: ['base'], tags: [], owner: 'a' });
    expect(mgr.isEnabled('feat')).toBe(false);
  });

  it('toggles and notifies listeners', () => {
    const mgr = new FeatureToggleManager();
    mgr.register({ key: 'f1', name: 'F1', description: '', enabled: false, environments: {}, dependencies: [], tags: [], owner: 'a' });
    const listener = vi.fn();
    mgr.onToggleChange(listener);
    mgr.enable('f1');
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ key: 'f1' }), true);
  });

  it('group enable/disable toggles all members', () => {
    const mgr = new FeatureToggleManager();
    mgr.register({ key: 'a', name: 'A', description: '', enabled: false, environments: {}, dependencies: [], tags: [], owner: 'x' });
    mgr.register({ key: 'b', name: 'B', description: '', enabled: false, environments: {}, dependencies: [], tags: [], owner: 'x' });
    mgr.createGroup('g1', '', ['a', 'b']);
    mgr.setGroupEnabled('g1', true);
    expect(mgr.isEnabled('a')).toBe(true);
    expect(mgr.isEnabled('b')).toBe(true);
  });
});

describe('ToggleConditionEvaluator', () => {
  it('evaluates percentage rule', () => {
    const evalr = new ToggleConditionEvaluator();
    const result = evalr.evaluate([{ type: 'percentage', condition: { percentage: 100 }, action: 'enable' }], { environment: 'prod', timestamp: 1, userId: 'u1' });
    expect(result).toBe(true);
  });

  it('evaluates time rule', () => {
    const evalr = new ToggleConditionEvaluator();
    const now = Date.now();
    const result = evalr.evaluate([{ type: 'time', condition: { start: now - 1000, end: now + 1000 }, action: 'enable' }], { environment: 'prod', timestamp: now });
    expect(result).toBe(true);
  });
});
