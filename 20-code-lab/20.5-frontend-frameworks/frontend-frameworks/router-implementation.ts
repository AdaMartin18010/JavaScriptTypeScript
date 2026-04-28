/**
 * @file 前端路由实现
 * @category Frontend Frameworks → Router
 * @difficulty medium
 * @tags router, spa, history-api, hash-router
 * 
 * @description
 * 前端路由系统实现：
 * - History API 路由
 * - Hash 路由
 * - 路由守卫
 * - 动态路由匹配
 */

// ============================================================================
// 1. 路由类型定义
// ============================================================================

export interface Route {
  path: string;
  component?: () => Promise<void> | void;
  children?: Route[];
  meta?: Record<string, unknown>;
  beforeEnter?: (to: Route, from: Route | null) => boolean | Promise<boolean>;
}

export interface RouteMatch {
  route: Route;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
}

export type NavigationGuard = (
  to: RouteMatch,
  from: RouteMatch | null,
  next: (allow: boolean) => void
) => void | Promise<void>;

// ============================================================================
// 2. History API 路由
// ============================================================================

export class HistoryRouter {
  private routes: Route[] = [];
  private currentRoute: RouteMatch | null = null;
  private beforeGuards: NavigationGuard[] = [];
  private afterHooks: ((to: RouteMatch, from: RouteMatch | null) => void)[] = [];

  constructor(routes: Route[]) {
    this.routes = routes;
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;
    // 监听浏览器前进后退
    window.addEventListener('popstate', () => {
      this.handleRouteChange();
    });

    // 初始路由
    this.handleRouteChange();
  }

  // 导航到指定路径
  push(path: string): void {
    if (typeof window === 'undefined') return;
    window.history.pushState({}, '', path);
    this.handleRouteChange();
  }

  // 替换当前历史
  replace(path: string): void {
    if (typeof window === 'undefined') return;
    window.history.replaceState({}, '', path);
    this.handleRouteChange();
  }

  // 后退
  back(): void {
    if (typeof window === 'undefined') return;
    window.history.back();
  }

  // 前进
  forward(): void {
    if (typeof window === 'undefined') return;
    window.history.forward();
  }

  // 添加全局前置守卫
  beforeEach(guard: NavigationGuard): () => void {
    this.beforeGuards.push(guard);
    return () => {
      const index = this.beforeGuards.indexOf(guard);
      if (index > -1) this.beforeGuards.splice(index, 1);
    };
  }

  // 添加全局后置钩子
  afterEach(hook: (to: RouteMatch, from: RouteMatch | null) => void): () => void {
    this.afterHooks.push(hook);
    return () => {
      const index = this.afterHooks.indexOf(hook);
      if (index > -1) this.afterHooks.splice(index, 1);
    };
  }

  private async handleRouteChange(): Promise<void> {
    const path = typeof window !== 'undefined' ? window.location.pathname : '/';
    const query = typeof window !== 'undefined' ? this.parseQuery(window.location.search) : {};
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) : '';

    const match = this.matchRoute(path);
    
    if (!match) {
      console.warn(`No route matched for: ${path}`);
      return;
    }

    const routeMatch: RouteMatch = {
      route: match.route,
      params: match.params,
      query,
      hash
    };

    // 执行全局前置守卫
    const canNavigate = await this.runGuards(routeMatch, this.currentRoute);
    if (!canNavigate) return;

    // 执行路由独享守卫
    if (match.route.beforeEnter) {
      const allow = await match.route.beforeEnter(match.route, this.currentRoute?.route || null);
      if (!allow) return;
    }

    const fromRoute = this.currentRoute;
    this.currentRoute = routeMatch;

    // 渲染组件
    if (match.route.component) {
      await match.route.component();
    }

    // 执行后置钩子
    this.afterHooks.forEach(hook => { hook(routeMatch, fromRoute); });
  }

  private matchRoute(path: string): { route: Route; params: Record<string, string> } | null {
    for (const route of this.routes) {
      const match = this.matchPath(route.path, path);
      if (match.matched) {
        return { route, params: match.params };
      }
    }
    return null;
  }

  private matchPath(pattern: string, path: string): { matched: boolean; params: Record<string, string> } {
    // 简单实现：支持 :param 格式的动态路由
    const patternParts = pattern.split('/').filter(Boolean);
    const pathParts = path.split('/').filter(Boolean);

    if (patternParts.length !== pathParts.length && !pattern.endsWith('*')) {
      return { matched: false, params: {} };
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart.startsWith(':')) {
        // 动态参数
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart === '*') {
        // 通配符
        break;
      } else if (patternPart !== pathPart) {
        return { matched: false, params: {} };
      }
    }

    return { matched: true, params };
  }

  private parseQuery(search: string): Record<string, string> {
    const query: Record<string, string> = {};
    const params = new URLSearchParams(search);
    params.forEach((value, key) => {
      query[key] = value;
    });
    return query;
  }

  private async runGuards(to: RouteMatch, from: RouteMatch | null): Promise<boolean> {
    for (const guard of this.beforeGuards) {
      let allow = true;
      await guard(to, from, (result) => {
        allow = result;
      });
      if (!allow) return false;
    }
    return true;
  }

  getCurrentRoute(): RouteMatch | null {
    return this.currentRoute;
  }
}

// ============================================================================
// 3. Hash 路由（兼容旧浏览器）
// ============================================================================

export class HashRouter {
  private routes: Route[] = [];
  private currentRoute: RouteMatch | null = null;

  constructor(routes: Route[]) {
    this.routes = routes;
    this.init();
  }

  private init(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('hashchange', () => {
      this.handleRouteChange();
    });
    this.handleRouteChange();
  }

  push(path: string): void {
    if (typeof window === 'undefined') return;
    window.location.hash = path;
  }

  replace(path: string): void {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.hash = path;
    window.location.replace(url.toString());
  }

  private handleRouteChange(): void {
    const hash = typeof window !== 'undefined' ? window.location.hash.slice(1) || '/' : '/';
    // 复用 HistoryRouter 的匹配逻辑
    console.log(`Hash route changed to: ${hash}`);
  }

  getCurrentRoute(): RouteMatch | null {
    return this.currentRoute;
  }
}

// ============================================================================
// 4. 路由链接组件（模拟）
// ============================================================================

export function createRouterLink(router: HistoryRouter) {
  return class RouterLink {
    #to: string;
    #text: string;
    constructor(to: string, text: string) {
      this.#to = to;
      this.#text = text;
    }

    render(): string {
      return `<a href="${this.#to}" data-router-link>${this.#text}</a>`;
    }

    attachEvent(element: HTMLElement): void {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        router.push(this.#to);
      });
    }
  };
}

// ============================================================================
// 5. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 前端路由实现 ===\n');

  // 定义路由
  const routes: Route[] = [
    {
      path: '/',
      component: () => { console.log('  📄 Home Page'); },
      meta: { title: '首页' }
    },
    {
      path: '/about',
      component: () => { console.log('  📄 About Page'); },
      beforeEnter: () => {
        console.log('  🔒 About route guard passed');
        return true;
      }
    },
    {
      path: '/users/:id',
      component: () => { console.log('  📄 User Profile Page'); },
      meta: { requiresAuth: true }
    },
    {
      path: '/products/*',
      component: () => { console.log('  📄 Product Page (wildcard)'); }
    }
  ];

  console.log('注意：此示例在浏览器环境运行，Node环境仅展示代码结构\n');

  console.log('1. 路由定义');
  routes.forEach(route => {
    console.log(`   ${route.path} → ${route.meta?.title || 'Component'}`);
  });

  console.log('\n2. 路由特性');
  console.log('   - History API 支持');
  console.log('   - 动态参数 (:id)');
  console.log('   - 通配符 (*)');
  console.log('   - 路由守卫 (beforeEnter)');
  console.log('   - 全局前置守卫 (beforeEach)');
  console.log('   - 查询参数解析');

  console.log('\n3. 导航 API');
  console.log('   router.push(\'/users/123\')    - 历史导航');
  console.log('   router.replace(\'/home\')      - 替换当前');
  console.log('   router.back()                - 后退');
  console.log('   router.forward()             - 前进');

  console.log('\n4. 路由匹配示例');
  console.log('   /users/123  → 匹配 /users/:id, params: { id: "123" }');
  console.log('   /products/1/reviews → 匹配 /products/*');

  console.log('\n使用建议:');
  console.log('- History Router: 现代应用首选，URL 更美观');
  console.log('- Hash Router: 兼容旧浏览器或静态托管');
  console.log('- 始终添加 404 路由处理');
  console.log('- 路由守卫处理认证和权限');
}

// ============================================================================
// 导出 (类已在上面使用 export class 导出)
// ============================================================================
