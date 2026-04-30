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

## Web Push 推送通知

```typescript
// push-client.ts — 客户端订阅推送
export async function subscribePush(applicationServerKey: string) {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
  });

  // 将 subscription JSON 发送至后端保存
  await fetch('/api/push-subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });

  return subscription;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
```

```typescript
// sw-push.ts — Service Worker 中接收并显示通知
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? { title: 'New Notification', body: '' };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data.url,
      actions: [
        { action: 'open', title: 'Open' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data ?? '/'));
  }
});
```

```javascript
// push-server.js — Node.js 服务端使用 web-push 库发送
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:admin@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPush(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
  } catch (err) {
    if (err.statusCode === 410) {
      // 订阅已过期，从数据库删除
      await deleteSubscription(subscription.endpoint);
    }
  }
}
```

> 📖 Reference: [web-push-libs/web-push](https://github.com/web-push-libs/web-push) | [Push API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

---

## File System Access API（本地文件读写）

```typescript
// file-system-access.ts — 渐进式增强文件操作
export async function openAndReadFile(): Promise<string> {
  if (!('showOpenFilePicker' in window)) {
    // 降级：传统 <input type="file">
    return fallbackFileInput();
  }

  const [fileHandle] = await window.showOpenFilePicker({
    types: [
      { description: 'Markdown', accept: { 'text/markdown': ['.md'] } },
      { description: 'Text', accept: { 'text/plain': ['.txt'] } },
    ],
    multiple: false,
  });

  const file = await fileHandle.getFile();
  return file.text();
}

export async function saveToFile(content: string, suggestedName = 'notes.md') {
  if (!('showSaveFilePicker' in window)) {
    // 降级：下载 Blob
    const blob = new Blob([content], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = suggestedName;
    a.click();
    return;
  }

  const fileHandle = await window.showSaveFilePicker({
    suggestedName,
    types: [{ accept: { 'text/markdown': ['.md'] } }],
  });

  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

// 拖拽打开文件
export function enableDropFile(target: HTMLElement, onRead: (text: string) => void) {
  target.addEventListener('dragover', (e) => { e.preventDefault(); target.classList.add('drag-over'); });
  target.addEventListener('dragleave', () => target.classList.remove('drag-over'));
  target.addEventListener('drop', async (e) => {
    e.preventDefault();
    target.classList.remove('drag-over');
    const file = e.dataTransfer?.files[0];
    if (file) onRead(await file.text());
  });
}
```

> 📖 Reference: [File System Access API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) | [Google Chrome Developers — File System Access](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)

---

## Periodic Background Sync（定期后台同步）

```typescript
// periodic-sync.ts — 定期更新缓存内容（如每日新闻、股票数据）
export async function registerPeriodicSync(tag: string, minIntervalHours = 24) {
  const registration = await navigator.serviceWorker.ready;

  if ('periodicSync' in registration) {
    const status = await navigator.permissions.query({
      name: 'periodic-background-sync' as any,
    });

    if (status.state === 'granted') {
      await (registration as any).periodicSync.register(tag, {
        minInterval: minIntervalHours * 60 * 60 * 1000,
      });
      console.log(`Registered periodic sync: ${tag}`);
    }
  }
}
```

```typescript
// sw-periodic.ts — Service Worker 中处理定期同步
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'refresh-news') {
    event.waitUntil(refreshNewsCache());
  }
});

async function refreshNewsCache() {
  const cache = await caches.open('news-cache');
  const response = await fetch('/api/news/latest');
  if (response.ok) {
    await cache.put('/api/news/latest', response.clone());
  }
}
```

> ⚠️ 仅 Chrome/Edge 支持；iOS Safari 不支持。

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
- [Push API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Notifications API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [File System Access API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- [Periodic Background Sync (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)
- [Badging API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Badging_API)
- [Web Share Target API (MDN)](https://developer.mozilla.org/en-US/docs/Web/Manifest/share_target)
- [Cache Storage API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage)
- [Install Prompt — BeforeInstallPromptEvent](https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent)
- [Google Developers — PWA Checklist](https://web.dev/pwa-checklist/)
- [Microsoft PWA Documentation](https://docs.microsoft.com/en-us/microsoft-edge/progressive-web-apps-chromium/)
- [web-push-libs/web-push (Node.js)](https://github.com/web-push-libs/web-push)
- [W3C Web App Manifest](https://www.w3.org/TR/appmanifest/)

---

*最后更新: 2026-04-29*
