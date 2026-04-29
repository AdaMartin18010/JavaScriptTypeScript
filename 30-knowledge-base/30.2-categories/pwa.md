# PWA（渐进式 Web 应用）

> PWA 技术栈与最佳实践。

---

## 核心技术

| 技术 | 说明 |
|------|------|
| **Service Worker** | 离线缓存、后台同步 |
| **Web App Manifest** | 安装配置、主题色 |
| **Web Push** | 推送通知 |
| **Background Sync** | 离线操作延迟同步 |
| **File System Access** | 本地文件读写 |

---

## PWA 功能对比矩阵

| 功能 | Chrome / Edge | Safari (iOS/macOS) | Firefox | Samsung Internet |
|------|---------------|--------------------|---------|------------------|
| **Service Worker** | ✅ 完整支持 | ✅ 支持 | ✅ 支持 | ✅ 完整支持 |
| **Add to Home Screen** | ✅ 支持 | ✅ 支持（iOS 16.4+） | ⚠️ 有限 | ✅ 支持 |
| **Web Push（Payload）** | ✅ 支持 | ⚠️ iOS 16.4+ 需用户交互 | ✅ 支持 | ✅ 支持 |
| **Background Sync** | ✅ 支持 | ❌ 不支持 | ⚠️ 实验性 | ✅ 支持 |
| **Periodic Background Sync** | ✅ 支持 | ❌ 不支持 | ❌ 不支持 | ✅ 支持 |
| **Badging API** | ✅ 支持 | ❌ 不支持 | ❌ 不支持 | ✅ 支持 |
| **File System Access** | ✅ 支持 | ❌ 不支持 | ❌ 不支持 | ⚠️ 部分 |
| **Web Share Target** | ✅ 支持 | ⚠️ iOS 16.4+ 有限 | ❌ 不支持 | ✅ 支持 |
| **Display Mode: standalone** | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 支持 |

---

## Service Worker 代码示例（Workbox 策略化缓存）

```typescript
// sw.ts - TypeScript Service Worker（通过 Vite PWA / Workbox 构建）
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope;

// 立即接管页面
self.skipWaiting();
clientsClaim();

// 清理旧缓存
cleanupOutdatedCaches();

// 预缓存构建产物（由构建工具注入 __WB_MANIFEST）
precacheAndRoute(self.__WB_MANIFEST);

// 页面导航：Network First（保证内容最新，离线回退缓存）
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
    ],
  })
);

// API 请求：Stale While Revalidate（快速响应 + 后台更新）
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200, 404] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 }),
    ],
  })
);

// 图片资源：Cache First（长期缓存，离线优先）
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// 字体资源：Cache First
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// 后台同步：离线表单提交
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-submissions') {
    event.waitUntil(syncFormSubmissions());
  }
});

async function syncFormSubmissions() {
  const db = await openIndexedDB();
  const submissions = await db.getAll('pendingForms');
  for (const submission of submissions) {
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission.data),
      });
      await db.delete('pendingForms', submission.id);
    } catch (err) {
      console.error('后台同步失败，保留记录:', err);
    }
  }
}

// 辅助函数：打开 IndexedDB
function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pwa-offline-db', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pendingForms')) {
        db.createObjectStore('pendingForms', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
```

---

## Web App Manifest 示例

```json
{
  "name": "JSTS Knowledge Base",
  "short_name": "JSTS KB",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3178c6",
  "icons": [
    { "src": "/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [
    { "src": "/screenshot-wide.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide" },
    { "src": "/screenshot-narrow.png", "sizes": "750x1334", "type": "image/png", "form_factor": "narrow" }
  ]
}
```

---

## 工具

| 工具 | 说明 |
|------|------|
| **Workbox** | Google 官方 SW 库 |
| **Vite PWA** | Vite 插件，自动生成 SW |
| **PWA Builder** | 微软官方 PWA 打包工具 |

---

## 权威参考链接

- [Web.dev Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Workbox 官方文档](https://developer.chrome.com/docs/workbox/)
- [Vite PWA 插件](https://vite-pwa-org.netlify.app/)
- [Web App Manifest 规范](https://w3c.github.io/manifest/)
- [Service Worker API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Builder](https://www.pwabuilder.com/)
- [Background Sync API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)

---

*最后更新: 2026-04-29*
