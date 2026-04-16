import { describe, it, expect } from 'vitest';
import { FeatureFlagManager, ABTestManager } from './feature-flag-system';

describe('FeatureFlagManager', () => {
  it('enables flag for matching user rule', () => {
    const mgr = new FeatureFlagManager();
    mgr.register({ key: 'dark', enabled: true, rules: [{ type: 'user', condition: { userId: 'u1' } }] });
    expect(mgr.isEnabled('dark', { id: 'u1' })).toBe(true);
    expect(mgr.isEnabled('dark', { id: 'u2' })).toBe(false);
  });

  it('enables flag by group', () => {
    const mgr = new FeatureFlagManager();
    mgr.register({ key: 'beta', enabled: true, rules: [{ type: 'group', condition: { groups: ['beta'] } }] });
    expect(mgr.isEnabled('beta', { id: 'u1', groups: ['beta'] })).toBe(true);
    expect(mgr.isEnabled('beta', { id: 'u2', groups: ['regular'] })).toBe(false);
  });

  it('supports user override', () => {
    const mgr = new FeatureFlagManager();
    mgr.register({ key: 'feat', enabled: false, rules: [] });
    mgr.enableForUser('feat', 'u1');
    expect(mgr.isEnabled('feat', { id: 'u1' })).toBe(true);
  });

  it('rollout is consistent for same user', () => {
    const mgr = new FeatureFlagManager();
    mgr.register({ key: 'roll', enabled: true, rules: [], rollout: { percentage: 50 } });
    const user = { id: 'stable-user' };
    const first = mgr.isEnabled('roll', user);
    expect(mgr.isEnabled('roll', user)).toBe(first);
  });
});

describe('ABTestManager', () => {
  it('assigns variant consistently', () => {
    const ab = new ABTestManager();
    ab.createTest({ id: 't1', name: 'Test', flagKey: 'f1', variants: [{ name: 'a', weight: 50 }, { name: 'b', weight: 50 }] });
    const v1 = ab.getVariant('t1', 'user-1');
    expect(v1).not.toBeNull();
    expect(ab.getVariant('t1', 'user-1')).toBe(v1);
  });
});
