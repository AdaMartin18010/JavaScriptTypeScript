/**
 * # Navigation API 实践
 *
 * Navigation API 是 History API 的现代化替代，提供更可靠的程序化导航和拦截能力。
 *
 * ## 浏览器支持
 * - Chrome: 102+ (2022.5)
 * - Firefox: 127+ (2024.6)
 * - Safari: 暂未支持（2026.4）
 * - 渐进增强策略：先检测支持，不支持时回退到 History API
 *
 * ## 解决的问题
 * 1. History API 的 `pushState`/`replaceState` 不触发 `popstate` 事件
 * 2. 浏览器前进/后退时，难以拦截和自定义行为
 * 3. 单页应用中的导航状态管理混乱
 */

// ============================================
// 基础导航
// ============================================

/**
 * Navigation API 的核心对象。
 */
export function getNavigation(): Navigation | undefined {
  return (window as any).navigation as Navigation | undefined;
}

/**
 * 使用 Navigation API 进行导航。
 *
 * @example
 * navigateTo('/about');
 * navigateTo('/about', { history: 'replace' }); // 替换当前历史记录
 */
export async function navigateTo(
  url: string,
  options?: {
    history?: "auto" | "push" | "replace";
    info?: any; // 传递给 navigate 事件的自定义数据
  }
): Promise<NavigationResult | undefined> {
  const navigation = getNavigation();
  if (!navigation) {
    // 回退到 History API
    window.history.pushState(null, "", url);
    return undefined;
  }

  return navigation.navigate(url, options);
}

/**
 * 返回上一页。
 */
export async function goBack(): Promise<NavigationResult | undefined> {
  const navigation = getNavigation();
  if (!navigation) {
    window.history.back();
    return undefined;
  }

  return navigation.back();
}

/**
 * 前进到下一页。
 */
export async function goForward(): Promise<NavigationResult | undefined> {
  const navigation = getNavigation();
  if (!navigation) {
    window.history.forward();
    return undefined;
  }

  return navigation.forward();
}

// ============================================
// 导航事件拦截
// ============================================

/**
 * Navigation API 的核心优势：可靠的导航拦截。
 *
 * @example
 * interceptNavigation((event) => {
 *   if (event.destination.url.includes('/admin')) {
 *     if (!isAuthenticated()) {
 *       event.preventDefault();
 *       redirectToLogin();
 *       return;
 *     }
 *   }
 * });
 */
export function interceptNavigation(
  handler: (event: NavigateEvent) => void | Promise<void>
): () => void {
  const navigation = getNavigation();
  if (!navigation) {
    console.warn("Navigation API not supported, using hashchange fallback");
    return () => {};
  }

  const wrappedHandler = (event: NavigateEvent) => {
    handler(event);
  };

  navigation.addEventListener("navigate", wrappedHandler as EventListener);

  return () => {
    navigation.removeEventListener(
      "navigate",
      wrappedHandler as EventListener
    );
  };
}

/**
 * 拦截导航并执行自定义处理（如 SPA 路由）。
 *
 * @example
 * setupSPARouter(async (event) => {
 *   event.intercept({
 *     async handler() {
 *       const content = await fetchRouteContent(event.destination.url);
 *       renderPage(content);
 *     },
 *   });
 * });
 */
export function setupSPARouter(
  routeHandler: (event: NavigateEvent) => void
): () => void {
  return interceptNavigation((event) => {
    // 忽略非同源导航（外部链接）
    if (!event.destination.url.startsWith(window.location.origin)) {
      return;
    }

    // 忽略下载链接
    if (event.downloadRequest) {
      return;
    }

    // 忽略 hash-only 变化（除非需要处理）
    const url = new URL(event.destination.url);
    if (url.pathname === location.pathname && url.hash !== location.hash) {
      return;
    }

    routeHandler(event);
  });
}

// ============================================
// 导航历史管理
// ============================================

/**
 * 获取当前导航历史条目。
 */
export function getCurrentEntry(): NavigationHistoryEntry | undefined {
  return getNavigation()?.currentEntry;
}

/**
 * 获取导航历史长度。
 */
export function getHistoryLength(): number {
  return getNavigation()?.entries().length ?? window.history.length;
}

/**
 * 导航到指定的历史条目。
 */
export async function traverseTo(
  key: string
): Promise<NavigationResult | undefined> {
  const navigation = getNavigation();
  if (!navigation) {
    console.warn("traverseTo not supported without Navigation API");
    return undefined;
  }

  return navigation.traverseTo(key);
}

// ============================================
// 实用模式：过渡动画路由
// ============================================

/**
 * 结合 View Transitions API 和 Navigation API 实现动画路由。
 *
 * @example
 * setupAnimatedRouter(async (event) => {
 *   event.intercept({
 *     async handler() {
 *       // 1. 获取新页面内容
 *       const content = await fetch(event.destination.url).then(r => r.text());
 *
 *       // 2. 执行 View Transition
 *       if (document.startViewTransition) {
 *         const transition = document.startViewTransition(() => {
 *           document.body.innerHTML = content;
 *         });
 *         await transition.updateCallbackDone;
 *       } else {
 *         document.body.innerHTML = content;
 *       }
 *     },
 *   });
 * });
 */
export function setupAnimatedRouter(
  contentLoader: (url: string) => Promise<string>
): () => void {
  return setupSPARouter((event) => {
    event.intercept({
      async handler() {
        const content = await contentLoader(event.destination.url);

        if (
          "startViewTransition" in document &&
          document.startViewTransition
        ) {
          const transition = document.startViewTransition(() => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "text/html");
            document.title = doc.title;
            document.body.innerHTML = doc.body.innerHTML;

            // 重新执行 scripts
            doc.body.querySelectorAll("script").forEach((oldScript) => {
              const newScript = document.createElement("script");
              Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
              });
              newScript.textContent = oldScript.textContent;
              oldScript.parentNode?.replaceChild(newScript, oldScript);
            });
          });

          await transition.updateCallbackDone;
        } else {
          const parser = new DOMParser();
          const doc = parser.parseFromString(content, "text/html");
          document.title = doc.title;
          document.body.innerHTML = doc.body.innerHTML;
        }
      },
    });
  });
}

// ============================================
// 实用模式：路由守卫
// ============================================

/**
 * 实现路由守卫（权限检查、确认提示等）。
 */
export function setupRouteGuards(guards: {
  /** 返回 true 允许导航，false 阻止 */
  beforeEach?: (url: string) => boolean | Promise<boolean>;
  /** 离开页面前的确认 */
  beforeLeave?: (url: string) => boolean | Promise<boolean>;
}): () => void {
  return interceptNavigation(async (event) => {
    const url = event.destination.url;

    // 离开确认
    if (guards.beforeLeave) {
      const canLeave = await guards.beforeLeave(url);
      if (!canLeave) {
        event.preventDefault();
        return;
      }
    }

    // 进入检查
    if (guards.beforeEach) {
      const canEnter = await guards.beforeEach(url);
      if (!canEnter) {
        event.preventDefault();
        return;
      }
    }
  });
}

// ============================================
// 类型定义（Navigation API 规范）
// ============================================

export interface Navigation extends EventTarget {
  currentEntry: NavigationHistoryEntry | null;
  transition: NavigationTransition | null;
  canGoBack: boolean;
  canGoForward: boolean;

  navigate(url: string, options?: NavigationOptions): NavigationResult;
  reload(options?: NavigationOptions): NavigationResult;
  traverseTo(key: string, options?: NavigationOptions): NavigationResult;
  back(options?: NavigationOptions): NavigationResult;
  forward(options?: NavigationOptions): NavigationResult;

  entries(): NavigationHistoryEntry[];
  updateCurrentEntry(options: { state: any }): void;

  onnavigate: ((event: NavigateEvent) => void) | null;
  onnavigatesuccess: ((event: Event) => void) | null;
  onnavigateerror: ((event: ErrorEvent) => void) | null;
  oncurrententrychange: ((event: Event) => void) | null;
}

export interface NavigationHistoryEntry {
  key: string;
  id: string;
  url: string;
  index: number;
  sameDocument: boolean;
  getState(): any;
}

export interface NavigationTransition {
  navigationType: string;
  from: NavigationHistoryEntry;
  finished: Promise<void>;
}

export interface NavigateEvent extends Event {
  navigationType: "push" | "replace" | "reload" | "traverse";
  destination: NavigationDestination;
  canIntercept: boolean;
  isTrusted: boolean;
  userInitiated: boolean;
  hashChange: boolean;
  downloadRequest: string | null;
  formData: FormData | null;
  signal: AbortSignal;

  intercept(options?: { handler?: () => void | Promise<void>; focusReset?: "after-transition" | "manual"; scroll?: "after-transition" | "manual" }): void;
  scroll(): void;
}

export interface NavigationDestination {
  url: string;
  key: string | null;
  id: string | null;
  index: number;
  sameDocument: boolean;
  getState(): any;
}

export interface NavigationOptions {
  history?: "auto" | "push" | "replace";
  info?: any;
  state?: any;
}

export interface NavigationResult {
  committed: Promise<NavigationHistoryEntry>;
  finished: Promise<NavigationHistoryEntry>;
}

// ============================================
// 特性检测
// ============================================

/**
 * 检测浏览器是否支持 Navigation API。
 */
export function supportsNavigation(): boolean {
  return "navigation" in window;
}
