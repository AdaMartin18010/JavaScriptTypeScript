# 移动开发 (Mobile Development)

> JavaScript/TypeScript 跨平台移动开发方案全景：从 Capacitor 到 React Native 与 PWA 的选型矩阵。

---

## 核心概念

跨平台移动方案按**运行时模型**分类：

| 模型 | 原理 | 代表 |
|------|------|------|
| **WebView 包装** | Web 应用嵌入原生 WebView | Capacitor, Cordova |
| **原生渲染** | JS 驱动原生 UI 组件 | React Native, NativeScript |
| **自绘引擎** | 跨平台渲染引擎绘制像素 | Flutter（Dart） |
| **渐进式 Web** | 浏览器运行，类原生体验 | PWA（Workbox） |

> **2026 格局**：React Native 持续主导，Capacitor 成为 Web 团队首选，PWA 在 B2B 场景 resurgence。

---

## 方案对比矩阵

| 维度 | React Native | Capacitor | PWA | NativeScript |
|------|-------------|-----------|-----|--------------|
| **语言** | JavaScript / TypeScript | JavaScript / TypeScript | JavaScript / TypeScript | JavaScript / TypeScript |
| **UI 渲染** | 原生组件 | WebView | 浏览器 | 原生组件 |
| **性能** | 接近原生 | 中等（WebView 限制） | 中等 | 接近原生 |
| **包体积** | ~15MB | ~5MB（Web 代码 + 壳） | 0（浏览器访问） | ~15MB |
| **原生 API** | 丰富（社区模块） | 需插件/桥接 | 受限（Web API） | 丰富 |
| **热更新** | ✅ CodePush | ✅ Live Update | ✅ Service Worker | ❌ |
| **App Store** | ✅ 原生提交 | ✅ 原生提交 | ❌（需 PWA 安装） | ✅ 原生提交 |
| **学习曲线** | 中 | 低 | 低 | 高 |
| **维护状态** | ✅ Meta 维护 | ✅ Ionic 维护 | ✅ 浏览器原生 | ⚠️ 小众 |

---

## 选型决策树

```
团队背景？
├── 已有 React Web 应用 → Capacitor（最小改动迁移）
├── 追求原生体验 + 复杂动画 → React Native
├── 预算有限 / B2B 内部工具 → PWA（零商店审核）
├── 已有 Vue/Angular 应用 → Capacitor 或 NativeScript
└── 游戏 / 图形密集型 → Flutter 或原生开发
```

---

## 代码示例

### React Native — 跨平台组件

```tsx
// components/ProductCard.tsx
import { View, Text, Image, Pressable, StyleSheet } from 'react-native'

interface Product {
  id: string
  name: string
  price: number
  image: string
}

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <Image source={{ uri: product.image }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
  pressed: { opacity: 0.8 },
  image: { width: 80, height: 80, borderRadius: 6 },
  info: { marginLeft: 12, flex: 1, justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
  price: { fontSize: 14, color: '#2563eb', marginTop: 4 },
})
```

### React Native — Context API 全局状态管理

```tsx
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  token: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
```

### Capacitor — 调用原生 API

```typescript
// utils/filesystem.ts
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

export async function writeConfig(data: object) {
  await Filesystem.writeFile({
    path: 'config/app.json',
    data: JSON.stringify(data),
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  })
}

export async function readConfig(): Promise<object> {
  const { data } = await Filesystem.readFile({
    path: 'config/app.json',
    directory: Directory.Data,
    encoding: Encoding.UTF8,
  })
  return JSON.parse(data)
}

// App.tsx — 初始化 Capacitor 插件
import { SplashScreen } from '@capacitor/splash-screen'

useEffect(() => {
  SplashScreen.hide({ fadeOutDuration: 500 })
}, [])
```

### Capacitor — 推送通知集成

```typescript
// utils/notifications.ts
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

export async function initPushNotifications(
  onToken: (token: string) => void,
  onNotification: (data: unknown) => void
) {
  if (!Capacitor.isNativePlatform()) return;

  const permStatus = await PushNotifications.requestPermissions();
  if (permStatus.receive !== 'granted') return;

  await PushNotifications.register();

  PushNotifications.addListener('registration', (token) => {
    onToken(token.value);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    onNotification(notification.data);
  });
}
```

### Capacitor 配置

```typescript
// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.example.myapp',
  appName: 'MyApp',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0f172a',
    },
  },
}

export default config
```

### PWA — Service Worker + Manifest

```json
// public/manifest.json
{
  "name": "My B2B Dashboard",
  "short_name": "Dashboard",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```typescript
// src/sw.ts (Workbox)
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'

// 预缓存构建产物
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

// API 请求：Stale-While-Revalidate
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({ cacheName: 'api-cache' })
)

// 图片：Cache First + 过期清理
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 })],
  })
)
```

```typescript
// main.tsx — 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then((reg) => console.log('SW registered:', reg.scope))
    .catch((err) => console.error('SW registration failed:', err))
}
```

### PWA — 后台同步与离线表单

```typescript
// utils/sync.ts
export async function queueSync(tag: string, payload: object) {
  const registration = await navigator.serviceWorker.ready;
  if ('sync' in registration) {
    await (registration as any).sync.register(tag);
    // 存入 IndexedDB 等待同步触发
    await idbKeyval.set(tag, payload);
  } else {
    // 不支持后台同步，立即执行
    await submitForm(payload);
  }
}

// sw.ts — 监听 sync 事件
self.addEventListener('sync', (event: SyncEvent) => {
  if (event.tag === 'submit-form') {
    event.waitUntil(
      idbKeyval.get('submit-form').then((payload) =>
        fetch('/api/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      )
    );
  }
});
```

### React Native — Hermes 引擎配置

```json
// android/app/build.gradle
project.ext.react = [
    enableHermes: true
]

// ios/Podfile
use_react_native!(
  :hermes_enabled => true
)
```

```javascript
// 检查 Hermes 是否启用
const isHermes = () => !!global.HermesInternal
console.log('Hermes enabled:', isHermes())
```

---

## 2026 生态动态

### React Native 新架构

- **Bridgeless Mode**：完全移除旧版 Bridge，JS 与原生直接通信
- **Fabric 渲染器**：异步布局，减少主线程阻塞
- **TurboModules**：按需加载原生模块，缩短启动时间

### Capacitor 6

- **官方 Live Update**：无需 App Store 审核即可推送 Web 层更新
- **Swift / Kotlin 插件模板**：简化原生插件开发
- **Deep Linking 简化**：统一 API 处理 URL Scheme 和 Universal Links

### PWA 在 B2B 的复兴

- **安装便捷**：Chrome/Edge 自动提示安装，无需商店
- **推送通知**：Web Push API 支持后台通知
- **限制**：iOS 推送支持仍弱于原生，部分 API 受限

---

## 最佳实践

1. **性能监控**：使用 Flipper（React Native）或 Chrome DevTools（Capacitor/PWA）分析性能
2. **离线优先**：Service Worker 缓存核心资源，Workbox 简化配置
3. **手势处理**：React Native 使用 `react-native-gesture-handler`，Capacitor 使用 Hammer.js
4. **安全通信**：Capacitor 与原生桥接时使用 `CapacitorHttp` 替代 `fetch`（绕过 CORS）
5. **构建优化**：React Native 使用 Hermes 引擎减小包体积并提升启动速度
6. **类型安全**：为 React Native 组件编写严格的 TypeScript 接口，避免 `any` 泛滥
7. **可访问性**：使用 React Native 的 `AccessibilityInfo` 和 PWA 的 ARIA 属性确保无障碍支持

---

## 参考资源

- [React Native Documentation](https://reactnative.dev/)
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page) — React Native 新架构官方指南
- [Capacitor Documentation](https://capacitorjs.com/)
- [Capacitor Plugins](https://capacitorjs.com/docs/apis) — 官方插件 API 列表
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [NativeScript Documentation](https://nativescript.org/)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [Ionic — Capacitor Live Updates](https://ionic.io/docs/live-updates) — 热更新官方方案
- [Google — Progressive Web App Checklist](https://web.dev/pwa-checklist/) — PWA 质量检查清单
- [Apple — Safari Web Push Notifications](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers) — iOS Web Push 官方文档
- [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) — 手势处理权威库
- [Hermes Documentation](https://hermesengine.dev/) — Meta 官方 JS 引擎文档
- [W3C — Web App Manifest](https://www.w3.org/TR/appmanifest/) — PWA Manifest 规范
- [Web.dev — Service Workers](https://web.dev/learn/pwa/service-workers/) — Service Worker 权威教程
- [MDN — Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) — Web Push 标准文档
- [MDN — Background Sync](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API) — 后台同步 API
- [Google Play — Publish PWA](https://developers.google.com/codelabs/pwa-in-play) — 将 PWA 发布到 Google Play
- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/) — App Store 审核指南

---

## 关联文档

- `30-knowledge-base/30.2-categories/10-css-frameworks.md`
- `20-code-lab/20.5-frontend-frameworks/mobile/`

---

*最后更新: 2026-04-29*
