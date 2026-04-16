import { describe, it, expect, vi } from 'vitest';
import { SignatureGenerator, FastRefreshRuntime, RefreshTransformer, RefreshErrorBoundary } from './fast-refresh';

describe('SignatureGenerator', () => {
  it('generates stable signature', () => {
    const gen = new SignatureGenerator();
    const sig = gen.generate('/src/Button.tsx', 'Button', ['useState']);
    expect(sig.key).toContain('Button');
    expect(sig.isComponent).toBe(true);
  });

  it('detects compatibility for identical signatures', () => {
    const gen = new SignatureGenerator();
    const a = gen.generate('/src/A.tsx', 'A', ['useState']);
    const b = gen.generate('/src/A.tsx', 'A', ['useState']);
    expect(gen.isCompatible(a, b)).toBe(true);
  });

  it('rejects compatibility for different hooks', () => {
    const gen = new SignatureGenerator();
    const a = gen.generate('/src/A.tsx', 'A', ['useState']);
    const b = gen.generate('/src/A.tsx', 'A', ['useState', 'useEffect']);
    expect(gen.isCompatible(a, b)).toBe(false);
  });
});

describe('FastRefreshRuntime', () => {
  it('registers component and stores state', () => {
    const runtime = new FastRefreshRuntime();
    runtime.register({ __state: 42 }, '/src/Counter.tsx', 'Counter');
    const stats = runtime.getStats();
    expect(stats.registered).toBe(1);
    expect(stats.states).toBe(1);
  });

  it('queues and performs updates', () => {
    const runtime = new FastRefreshRuntime();
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    runtime.handleUpdate({ type: 'component', id: 'A', filename: 'a.tsx' });
    runtime.performReactRefresh();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('1'));
    logSpy.mockRestore();
  });
});

describe('RefreshTransformer', () => {
  it('transforms code to inject registration', () => {
    const transformer = new RefreshTransformer();
    const code = 'export function Hello() {}';
    const transformed = transformer.transform(code, '/src/Hello.tsx');
    expect(transformed).toContain('__register__(Hello');
    expect(transformed).toContain('import.meta.hot');
  });

  it('returns original code when no components found', () => {
    const transformer = new RefreshTransformer();
    const code = 'const x = 1;';
    expect(transformer.transform(code, 'a.ts')).toBe(code);
  });
});

describe('RefreshErrorBoundary', () => {
  it('catches error and allows recovery', () => {
    const boundary = new RefreshErrorBoundary();
    expect(boundary.canRecover()).toBe(false);
    boundary.catchError(new Error('render error'));
    expect(boundary.canRecover()).toBe(true);
    expect(boundary.attemptRecovery()).toBe(true);
    expect(boundary.canRecover()).toBe(false);
  });
});
