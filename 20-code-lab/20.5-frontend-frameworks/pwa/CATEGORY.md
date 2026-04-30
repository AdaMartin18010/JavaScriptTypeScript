---
dimension: 应用领域
application-domain: PWA / 渐进式 Web 应用
created: 2026-04-27
---

# 维度标注

- **所属维度**: 应用领域（Application Domain）
- **应用域**: PWA — Service Worker、离线存储与原生体验
- **模块编号**: 37-pwa

## 边界说明

本模块聚焦 PWA 应用开发模式，包括：

- Service Worker 生命周期与缓存策略
- Web App Manifest 与可安装性
- 后台同步与推送通知

通用前端框架和构建工具不属于本模块范围。

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `service-worker-strategies.ts` | 缓存策略（Cache First / Network First / Stale-While-Revalidate） | — |
| `pwa-patterns.ts` | PWA 架构模式（Shell / App Shell / Streaming SSR） | `pwa-patterns.test.ts` |
| `web-app-manifest.ts` | Web App Manifest 类型安全生成与校验 | — |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### Service Worker 缓存策略

```typescript
// service-worker-strategies.ts
export async function staleWhileRevalidate(
  event: FetchEvent,
  cacheName: string
): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(event.request);

  const fetchPromise = fetch(event.request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(event.request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cached || fetchPromise;
}
```

### 后台同步队列

```typescript
export async function queueBackgroundSync(
  tag: string,
  payload: unknown
) {
  const registration = await navigator.serviceWorker.ready;

  if ('sync' in registration) {
    // 存储到 IndexedDB
    await db.pendingSyncs.add({ tag, payload, timestamp: Date.now() });
    await registration.sync.register(tag);
  } else {
    // 降级：立即执行
    await sendToServer(payload);
  }
}
```

### Web Push 订阅管理

```typescript
export async function subscribePush(
  publicKey: string
): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  await sendSubscriptionToServer(subscription);
  return subscription;
}
```

### Web App Manifest 类型安全生成

```typescript
interface WebAppManifest {
  name: string;
  short_name: string;
  start_url: string;
  display: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
  background_color: string;
  theme_color: string;
  icons: { src: string; sizes: string; type: string }[];
}

export function generateManifest(config: Partial<WebAppManifest>): WebAppManifest {
  return {
    name: config.name ?? 'My PWA',
    short_name: config.short_name ?? 'PWA',
    start_url: config.start_url ?? '/',
    display: config.display ?? 'standalone',
    background_color: config.background_color ?? '#ffffff',
    theme_color: config.theme_color ?? '#000000',
    icons: config.icons ?? [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}

// 序列化为 JSON 供 build 时写入
console.log(JSON.stringify(generateManifest({ name: 'Dashboard' }), null, 2));
```

### Workbox 路由预缓存

```typescript
// service-worker.ts (workbox-build 生成)
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

// 预缓存构建产物
precacheAndRoute(self.__WB_MANIFEST);

// API 请求：Stale-While-Revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({ cacheName: 'api-cache' })
);

// 图片资源：Cache First + 过期策略
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);
```

### 周期性后台同步

```typescript
export async function registerPeriodicSync(tag: string, minInterval: number) {
  const registration = await navigator.serviceWorker.ready;

  if ('periodicSync' in registration) {
    // @ts-expect-error Periodic Background Sync 实验性
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as PermissionName,
    });

    if (status.state === 'granted') {
      // @ts-expect-error
      await registration.periodicSync.register(tag, { minInterval });
    }
  }
}
```

### 离线回退页面（Offline Fallback）

```typescript
// offline-fallback.ts — 当网络与缓存均不可用时提供兜底页面

const OFFLINE_PAGE = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('offline-v1').then((cache) => cache.add(OFFLINE_PAGE))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_PAGE).then((res) => res || new Response('Offline'))
      )
    );
  }
});
```

### Manifest 验证与审计

```typescript
// manifest-validator.ts — 基于 JSON Schema 的清单校验

export interface ManifestAuditResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function auditManifest(manifest: Partial<WebAppManifest>): ManifestAuditResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest.name) errors.push('缺少 name 字段');
  if (!manifest.icons?.some(i => i.sizes === '192x192')) warnings.push('缺少 192x192 图标');
  if (!manifest.icons?.some(i => i.sizes === '512x512')) warnings.push('缺少 512x512 图标');
  if (!manifest.start_url) warnings.push('建议设置 start_url');

  return { valid: errors.length === 0, errors, warnings };
}
```

## 关联模块

- `97-lowcode-platform` — 低代码平台
- `58-data-visualization` — 数据可视化
- `30-knowledge-base/30.2-categories/35-pwa-lowcode.md` — PWA 分类索引
- `30-knowledge-base/application-domains-index.md` — 应用领域总索引

### 文件系统访问 API（File System Access API）

```typescript
// file-system-access.ts — 本地文件读写（Chrome 86+）

export async function openAndReadTextFile(): Promise<string | null> {
  try {
    const [fileHandle] = await (window as any).showOpenFilePicker({
      types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt'] } }],
    });
    const file = await fileHandle.getFile();
    return await file.text();
  } catch (err) {
    if ((err as Error).name === 'AbortError') return null;
    throw err;
  }
}

export async function saveTextFile(content: string, suggestedName = 'document.txt') {
  const fileHandle = await (window as any).showSaveFilePicker({
    suggestedName,
    types: [{ description: 'Text Files', accept: { 'text/plain': ['.txt'] } }],
  });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}
```

### 徽章 API（Badging API）

```typescript
// badging-api.ts — 应用图标未读数标记

export async function setAppBadge(count?: number): Promise<void> {
  if ('setAppBadge' in navigator) {
    await (navigator as any).setAppBadge(count);
  }
}

export async function clearAppBadge(): Promise<void> {
  if ('clearAppBadge' in navigator) {
    await (navigator as any).clearAppBadge();
  }
}

// 使用示例：新消息到达时更新徽章
// setAppBadge(unreadCount);
```

### Web Share Target — 接收系统分享

```typescript
// share-target.ts — 作为系统级分享目标
// 需在 manifest 中配置 share_target

interface ShareTargetManifest {
  share_target: {
    action: string;
    method: string;
    enctype: string;
    params: {
      title: string;
      text: string;
      url: string;
      files?: Array<{ name: string; accept: string[] }>;
    };
  };
}

// manifest.json 对应配置：
// "share_target": {
//   "action": "/share",
//   "method": "POST",
//   "enctype": "multipart/form-data",
//   "params": {
//     "title": "title",
//     "text": "text",
//     "url": "url",
//     "files": [{ "name": "media", "accept": ["image/*", "video/*"] }]
//   }
// }

// 在 /share 路由处理接收到的分享
export function handleShareTarget(formData: FormData) {
  const title = formData.get('title') as string;
  const text = formData.get('text') as string;
  const url = formData.get('url') as string;
  const files = formData.getAll('media') as File[];

  return { title, text, url, files };
}
```

### 屏幕唤醒锁定（Screen Wake Lock API）

```typescript
// wake-lock.ts — 防止屏幕熄灭（如演示、导航场景）

let wakeLock: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<void> {
  if ('wakeLock' in navigator) {
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => {
        console.log('Wake lock released');
      });
    } catch (err) {
      console.error('Wake lock request failed:', err);
    }
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (wakeLock) {
    await wakeLock.release();
    wakeLock = null;
  }
}

// 页面可见性变化时自动重新获取
document.addEventListener('visibilitychange', async () => {
  if (document.visibilityState === 'visible' && wakeLock === null) {
    await requestWakeLock();
  }
});
```

### 导航预加载（Navigation Preload）

```typescript
// navigation-preload.ts — Service Worker 中加速导航请求

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (self as any).registration?.navigationPreload?.enable().catch(() => {})
  );
});

self.addEventListener('fetch', (event: FetchEvent) => {
  if (event.preloadResponse) {
    event.respondWith(
      event.preloadResponse.catch(() => fetch(event.request))
    );
  }
});
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| web.dev — Progressive Web Apps | 指南 | [web.dev/progressive-web-apps](https://web.dev/progressive-web-apps) |
| MDN — Service Worker API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) |
| MDN — Web Push Notifications | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Push_API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) |
| Workbox | 文档 | [developer.chrome.com/docs/workbox](https://developer.chrome.com/docs/workbox) |
| Web App Manifest | 规范 | [w3c.github.io/manifest](https://w3c.github.io/manifest) |
| PWA Builder | 工具 | [www.pwabuilder.com](https://www.pwabuilder.com) |
| MDN — Background Sync | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API) |
| MDN — Periodic Background Sync | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API) |
| Google — PWA Checklist | 清单 | [web.dev/pwa-checklist](https://web.dev/pwa-checklist/) |
| W3C — Service Workers | 规范 | [www.w3.org/TR/service-workers](https://www.w3.org/TR/service-workers/) |
| MDN — Cache API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Cache](https://developer.mozilla.org/en-US/docs/Web/API/Cache) |
| Google — Push Notifications on the Web | 指南 | [developers.google.com/web/fundamentals/push-notifications](https://developers.google.com/web/fundamentals/push-notifications) |
| W3C — Web App Manifest W3C Recommendation | 规范 | [www.w3.org/TR/appmanifest](https://www.w3.org/TR/appmanifest/) |
| web.dev — Offline UX Considerations | 指南 | [web.dev/offline-ux-design-guidelines](https://web.dev/offline-ux-design-guidelines/) |
| MDN — File System Access API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/File_System_API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) |
| MDN — Badging API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Badging_API](https://developer.mozilla.org/en-US/docs/Web/API/Badging_API) |
| MDN — Web Share API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Web_Share_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Share_API) |
| MDN — Screen Wake Lock API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) |
| web.dev — Navigation Preload | 指南 | [web.dev/navigation-preload](https://web.dev/navigation-preload/) |
| Fugu API Tracker | 能力追踪 | [fugu-tracker.web.app](https://fugu-tracker.web.app/) — PWA 新能力发布追踪 |
| web.dev — Notifications | 指南 | [web.dev/push-notifications-overview](https://web.dev/push-notifications-overview/) |
| MDN — Before Install Prompt Event | 文档 | [developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent](https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent) |
| web.dev — Install Prompt | 指南 | [web.dev/customize-install](https://web.dev/customize-install/) |
| Vite PWA Plugin | 工具 | [vite-pwa-org.netlify.app](https://vite-pwa-org.netlify.app/) — 零配置 PWA 插件 |
| Serwist (Workbox 继任者) | 工具 | [serwist.pages.dev](https://serwist.pages.dev/) — 下一代 Service Worker 库 |

---

*最后更新: 2026-04-30*
