/**
 * # Service Worker 缓存策略
 *
 * PWA 的核心是 Service Worker，它允许网站在离线时工作、
 * 推送通知、后台同步等。
 */

/** 缓存策略枚举 */
export enum CacheStrategy {
  /** 缓存优先：先读缓存，没有则网络请求并缓存 */
  CacheFirst = "CacheFirst",
  /** 网络优先：先请求网络，失败则读缓存 */
  NetworkFirst = "NetworkFirst",
  /** 仅缓存 */
  CacheOnly = "CacheOnly",
  /** 仅网络 */
  NetworkOnly = "NetworkOnly",
  /** 陈旧同时重新验证：立即返回缓存，后台更新 */
  StaleWhileRevalidate = "StaleWhileRevalidate",
}

/**
 * 缓存优先策略。
 * 适用于：静态资源（JS、CSS、图片）
 */
export async function cacheFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

/**
 * 网络优先策略。
 * 适用于：API 请求、实时数据
 */
export async function networkFirst(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw new Error("Network error and no cache available");
  }
}

/**
 * 陈旧同时重新验证策略。
 * 适用于：频繁更新但可接受短暂旧数据的资源
 */
export async function staleWhileRevalidate(request: Request, cacheName: string): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // 后台更新缓存
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  });

  // 立即返回缓存（如果有）
  if (cached) {
    return cached;
  }

  // 没有缓存则等待网络请求
  return fetchPromise;
}

/**
 * 智能路由：根据请求类型选择策略。
 */
export function createSmartRouter(routes: Array<{
  pattern: RegExp;
  strategy: CacheStrategy;
  cacheName: string;
}>): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    for (const route of routes) {
      if (route.pattern.test(request.url)) {
        switch (route.strategy) {
          case CacheStrategy.CacheFirst:
            return cacheFirst(request, route.cacheName);
          case CacheStrategy.NetworkFirst:
            return networkFirst(request, route.cacheName);
          case CacheStrategy.StaleWhileRevalidate:
            return staleWhileRevalidate(request, route.cacheName);
          default:
            return fetch(request);
        }
      }
    }
    return fetch(request);
  };
}

// 预定义路由配置
export const defaultRoutes = [
  // 静态资源：缓存优先
  { pattern: /\.(js|css|woff2?)$/, strategy: CacheStrategy.CacheFirst, cacheName: "static-v1" },
  // API 请求：网络优先
  { pattern: /\/api\//, strategy: CacheStrategy.NetworkFirst, cacheName: "api-v1" },
  // 图片：陈旧同时重新验证
  { pattern: /\.(png|jpg|jpeg|gif|webp|svg)$/, strategy: CacheStrategy.StaleWhileRevalidate, cacheName: "images-v1" },
];
