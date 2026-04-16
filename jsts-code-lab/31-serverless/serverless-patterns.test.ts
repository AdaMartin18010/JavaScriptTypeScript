import { describe, it, expect } from 'vitest';
import { FunctionOrchestrator, EventTriggerManager, StepFunction } from './serverless-patterns';

describe('FunctionOrchestrator', () => {
  it('registers and invokes function', async () => {
    const fo = new FunctionOrchestrator();
    const fn = { name: 'hello', handler: 'index.handler', runtime: 'nodejs20' as const, memory: 128, timeout: 10, environment: {}, triggers: [] };
    let called = false;
    fo.register(fn, async () => { called = true; return { ok: 1 }; });
    const res = await fo.invoke('hello', {});
    expect(called).toBe(true);
    expect((res as any).ok).toBe(1);
  });

  it('tracks stats', async () => {
    const fo = new FunctionOrchestrator();
    const fn = { name: 'f1', handler: 'h', runtime: 'nodejs20' as const, memory: 128, timeout: 10, environment: {}, triggers: [] };
    fo.register(fn, async () => 1);
    await fo.invoke('f1', {});
    await fo.invoke('f1', {});
    const stats = fo.getStats();
    expect(stats.get('f1')?.count).toBe(2);
  });
});

describe('EventTriggerManager', () => {
  it('adds HTTP trigger and returns formatted response', async () => {
    const etm = new EventTriggerManager();
    etm.addHttpTrigger('/api/users', 'GET', async () => ({ users: [] }));
    const res = await etm.trigger('http:GET:/api/users', { query: {} });
    expect((res as any).statusCode).toBe(200);
    expect((res as any).body).toContain('users');
  });

  it('throws for missing trigger', async () => {
    const etm = new EventTriggerManager();
    await expect(etm.trigger('http:GET:/missing', {})).rejects.toThrow('not found');
  });
});

describe('StepFunction', () => {
  it('executes task steps in order', async () => {
    const sf = new StepFunction();
    const log: string[] = [];
    sf.addStep({ name: 's1', type: 'task', handler: async () => { log.push('s1'); return 'a'; }, next: 's2' });
    sf.addStep({ name: 's2', type: 'task', handler: async (input) => { log.push('s2'); return input; }, end: true });
    const result = await sf.execute('start');
    expect(log).toEqual(['s1', 's2']);
    expect(result).toBe('a');
  });

  it('handles choice step', async () => {
    const sf = new StepFunction();
    sf.addStep({ name: 'start', type: 'choice', choices: [{ condition: (i: any) => i > 0, next: 'positive' }] });
    sf.addStep({ name: 'positive', type: 'task', handler: async () => 'pos', end: true });
    const result = await sf.execute(1);
    expect(result).toBe('pos');
  });
});
