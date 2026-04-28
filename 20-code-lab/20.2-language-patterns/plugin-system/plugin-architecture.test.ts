import { describe, it, expect, vi } from 'vitest';
import { HookManager, PluginManager, PluginSandbox } from './plugin-architecture.js';

describe('HookManager', () => {
  it('executes handlers in priority order', async () => {
    const hooks = new HookManager();
    const order: number[] = [];
    hooks.addHandler('evt', () => order.push(2), 20);
    hooks.addHandler('evt', () => order.push(1), 10);
    await hooks.execute('evt');
    expect(order).toEqual([1, 2]);
  });

  it('waterfall passes value through handlers', async () => {
    const hooks = new HookManager();
    hooks.addHandler('wf', (val: number) => val + 1, 10);
    hooks.addHandler('wf', (val: number) => val * 2, 20);
    const result = await hooks.executeWaterfall('wf', 3);
    expect(result).toBe(8);
  });
});

describe('PluginManager', () => {
  it('registers and activates plugins', () => {
    const pm = new PluginManager();
    const coreActivate = vi.fn();
    pm.register({ name: 'core', version: '1', activate: coreActivate });
    pm.activate('core');
    expect(coreActivate).toHaveBeenCalled();
    expect(pm.getActivatedPlugins()).toContain('core');
  });

  it('activates dependencies first', () => {
    const pm = new PluginManager();
    const order: string[] = [];
    pm.register({ name: 'base', version: '1', activate: () => order.push('base') });
    pm.register({ name: 'ext', version: '1', dependencies: ['base'], activate: () => order.push('ext') });
    pm.activate('ext');
    expect(order).toEqual(['base', 'ext']);
  });

  it('prevents deactivation if depended on', () => {
    const pm = new PluginManager();
    pm.register({ name: 'base', version: '1', activate: () => {} });
    pm.register({ name: 'ext', version: '1', dependencies: ['base'], activate: () => {} });
    pm.activate('base');
    pm.activate('ext');
    expect(() => { pm.deactivate('base'); }).toThrow('depends on it');
  });
});

describe('PluginSandbox', () => {
  it('executes code in sandbox', () => {
    const sb = new PluginSandbox();
    const result = sb.execute('return Math.pow(x, 2)', { x: 4 });
    expect(result).toBe(16);
  });

  it('validates dangerous code', () => {
    const sb = new PluginSandbox();
    const result = sb.validate('eval("bad")');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
