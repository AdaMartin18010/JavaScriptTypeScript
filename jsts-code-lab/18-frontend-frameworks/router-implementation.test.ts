import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistoryRouter, HashRouter, createRouterLink, type Route } from './router-implementation.js';

describe('HistoryRouter', () => {
  let routes: Route[];

  beforeEach(() => {
    routes = [
      { path: '/', component: vi.fn() },
      { path: '/about', component: vi.fn(), beforeEnter: () => true },
      { path: '/users/:id', component: vi.fn(), meta: { requiresAuth: true } },
      { path: '/products/*', component: vi.fn() },
    ];
  });

  it('should instantiate without errors in Node', () => {
    const router = new HistoryRouter(routes);
    expect(router).toBeInstanceOf(HistoryRouter);
  });

  it('should match routes with params', () => {
    const router = new HistoryRouter(routes);
    // @ts-expect-error accessing private method for testing
    const match = router.matchRoute('/users/123');
    expect(match).not.toBeNull();
    expect(match!.params.id).toBe('123');
  });

  it('should match wildcard routes', () => {
    const router = new HistoryRouter(routes);
    // @ts-expect-error accessing private method for testing
    const match = router.matchRoute('/products/1/reviews');
    expect(match).not.toBeNull();
  });

  it('should parse query strings', () => {
    const router = new HistoryRouter(routes);
    // @ts-expect-error accessing private method for testing
    const query = router.parseQuery('?foo=bar&baz=qux');
    expect(query).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('should register and run global guards', async () => {
    const router = new HistoryRouter(routes);
    const guard = vi.fn((to: any, from: any, next: any) => next(true));
    router.beforeEach(guard as any);

    // @ts-expect-error accessing private method for testing
    await router.runGuards({ route: routes[0], params: {}, query: {}, hash: '' }, null);
    expect(guard).toHaveBeenCalled();
  });

  it('should block navigation when guard returns false', async () => {
    const router = new HistoryRouter(routes);
    const guard = vi.fn((to: any, from: any, next: any) => next(false));
    router.beforeEach(guard as any);

    // @ts-expect-error accessing private method for testing
    const result = await router.runGuards({ route: routes[0], params: {}, query: {}, hash: '' }, null);
    expect(result).toBe(false);
  });

  it('should support afterEach hooks', () => {
    const router = new HistoryRouter(routes);
    const hook = vi.fn();
    const unsubscribe = router.afterEach(hook);
    unsubscribe();
    expect((router as any).afterHooks.length).toBe(0);
  });
});

describe('HashRouter', () => {
  it('should instantiate without errors in Node', () => {
    const router = new HashRouter([{ path: '/' }]);
    expect(router).toBeInstanceOf(HashRouter);
  });
});

describe('createRouterLink', () => {
  it('should create a RouterLink class', () => {
    const router = new HistoryRouter([{ path: '/' }]);
    const RouterLink = createRouterLink(router);
    const link = new RouterLink('/home', 'Home');

    expect(link.render()).toContain('/home');
    expect(link.render()).toContain('Home');
  });
});
