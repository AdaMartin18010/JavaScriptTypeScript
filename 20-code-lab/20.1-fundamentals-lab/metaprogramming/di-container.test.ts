import { describe, it, expect } from 'vitest'
import { DIContainer, DIScope, DIResolutionError, Lifetime } from './di-container.js'

describe('di-container', () => {
  it('DIContainer is defined', () => {
    expect(typeof DIContainer).not.toBe('undefined');
  });

  it('registerSingleton returns same instance', () => {
    const container = new DIContainer();
    let count = 0;
    container.registerSingleton('counter', () => { count++; return { count }; });

    const a = container.resolve<{ count: number }>('counter');
    const b = container.resolve<{ count: number }>('counter');
    expect(a).toBe(b);
    expect(a.count).toBe(1);
  });

  it('registerTransient returns new instance each time', () => {
    const container = new DIContainer();
    let count = 0;
    container.registerTransient('counter', () => { count++; return { count }; });

    const a = container.resolve<{ count: number }>('counter');
    const b = container.resolve<{ count: number }>('counter');
    expect(a).not.toBe(b);
    expect(a.count).toBe(1);
    expect(b.count).toBe(2);
  });

  it('registerScoped returns same instance within scope', () => {
    const container = new DIContainer();
    container.registerScoped('service', () => ({ id: Math.random() }));

    const scope = container.createScope('scope-1');
    const a = scope.resolve<{ id: number }>('service');
    const b = scope.resolve<{ id: number }>('service');
    expect(a).toBe(b);
  });

  it('registerScoped returns different instances across scopes', () => {
    const container = new DIContainer();
    container.registerScoped('service', () => ({ id: Math.random() }));

    const scope1 = container.createScope('scope-1');
    const scope2 = container.createScope('scope-2');
    const a = scope1.resolve<{ id: number }>('service');
    const b = scope2.resolve<{ id: number }>('service');
    expect(a).not.toBe(b);
  });

  it('resolve throws for unregistered token', () => {
    const container = new DIContainer();
    expect(() => container.resolve('unknown')).toThrow(DIResolutionError);
  });

  it('resolve scoped without scopeId throws', () => {
    const container = new DIContainer();
    container.registerScoped('service', () => ({}));
    expect(() => container.resolve('service')).toThrow(DIResolutionError);
  });

  it('isRegistered returns correct boolean', () => {
    const container = new DIContainer();
    container.registerSingleton('svc', () => ({}));
    expect(container.isRegistered('svc')).toBe(true);
    expect(container.isRegistered('other')).toBe(false);
  });

  it('getRegisteredTokens returns all tokens', () => {
    const container = new DIContainer();
    container.registerSingleton('a', () => ({}));
    container.registerSingleton('b', () => ({}));
    const tokens = container.getRegisteredTokens();
    expect(tokens).toContain('a');
    expect(tokens).toContain('b');
  });

  it('clear removes all registrations', () => {
    const container = new DIContainer();
    container.registerSingleton('svc', () => ({}));
    container.clear();
    expect(container.isRegistered('svc')).toBe(false);
  });

  it('DIScope can resolve services', () => {
    const container = new DIContainer();
    container.registerScoped('svc', () => ({ value: 42 }));
    const scope = new DIScope(container, 'test');
    const svc = scope.resolve<{ value: number }>('svc');
    expect(svc.value).toBe(42);
  });

  it('DIResolutionError is defined', () => {
    expect(typeof DIResolutionError).not.toBe('undefined');
  });

  it('Lifetime enum values are correct', () => {
    expect(Lifetime.Singleton).toBe('singleton');
    expect(Lifetime.Transient).toBe('transient');
    expect(Lifetime.Scoped).toBe('scoped');
  });
});
