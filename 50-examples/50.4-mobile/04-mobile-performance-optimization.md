# 04 - 移动端性能优化完全手册

> **版本信息**: Hermes Engine | Expo SDK 52 | React Native 0.76 | FlashList | Reanimated 3
> **目标读者**: 需要构建高性能、低内存占用移动应用的开发者和架构师
> **阅读时长**: 约 50 分钟

---

## 目录

1. [移动端性能指标体系](#一移动端性能指标体系)
2. [Hermes 引擎深度优化](#二hermes-引擎深度优化)
3. [Bundle 拆分与按需加载](#三bundle-拆分与按需加载)
4. [图片加载与缓存策略](#四图片加载与缓存策略)
5. [列表虚拟化与内存管理](#五列表虚拟化与内存管理)
6. [渲染优化与避免重绘](#六渲染优化与避免重绘)
7. [启动时间优化](#七启动时间优化)
8. [动画性能优化](#八动画性能优化)
9. [内存泄漏检测与修复](#九内存泄漏检测与修复)
10. [性能监控与持续集成](#十性能监控与持续集成)

---

## 一、移动端性能指标体系

### 1.1 核心性能指标 (KPIs)

| 指标名称 | 目标值 (iOS) | 目标值 (Android) | 测量工具 | 业务影响 |
|---------|------------|----------------|---------|---------|
| **TTI (Time to Interactive)** | < 2.5s | < 3.5s | Flashlight, custom | 用户留存率 |
| **FCP (First Contentful Paint)** | < 1.5s | < 2.0s | Performance API | 首印象 |
| **滚动 FPS** | ≥ 55 | ≥ 50 | Systrace, Flashlight | 交互体验 |
| **交互响应延迟** | < 100ms | < 150ms | RN Perf Monitor | 操作流畅度 |
| **内存峰值** | < 250MB | < 300MB | Xcode Instruments, Android Profiler | 崩溃率 |
| **Bundle 大小** | < 5MB | < 5MB | Source map analysis | 下载转化率 |
| **JS Thread CPU** | < 40% | < 50% | Flipper, Hermes Profiler | 帧率稳定性 |
| **Native 线程阻塞** | < 16ms/frame | < 16ms/frame | Systrace | 流畅度 |

### 1.2 性能瓶颈诊断决策树

```
应用卡顿?
    │
    ├── JS Thread 忙碌? (查看 Perf Monitor)
    │    │
    │    ├── 是 → 大量 setState?
    │    │         │
    │    │         ├── 是 → 使用 React.memo, useMemo, useCallback
    │    │         │
    │    │         └── 否 → 复杂计算?
    │    │                   │
    │    │                   ├── 是 → 移至 Worker/Native Module
    │    │                   │
    │    │                   └── 否 → 检查 Bundle 解析时间
    │    │                             → 使用 Hermes Bytecode
    │    │
    │    └── 否 → Native Thread 忙碌?
    │              │
    │              ├── 是 → 原生模块阻塞主线程?
    │              │         → 使用 TurboModules 异步调用
    │              │
    │              └── 否 → UI 渲染瓶颈?
    │                        → 检查 Shadow Tree 层级
    │                        → 使用 FlashList 替代 FlatList
    │
    └── 内存增长?
         │
         ├── 是 → 图片未释放?
         │         → 使用 Expo Image + 尺寸限制
         │
         ├── 是 → 闭包引用?
         │         → 检查 useEffect 清理函数
         │
         └── 是 → 事件监听未移除?
                   → 使用 useEventListener Hook
```

---

## 二、Hermes 引擎深度优化

### 2.1 Hermes 架构优势

Hermes 是 Meta 专为 React Native 设计的 JavaScript 引擎，核心特性：

| 特性 | Hermes | JSC (JavaScriptCore) | V8 |
|-----|--------|---------------------|----|
| **启动速度** | ⭐⭐⭐⭐⭐ (Bytecode 预编译) | ⭐⭐⭐ (需解析) | ⭐⭐⭐⭐ |
| **内存占用** | ⭐⭐⭐⭐⭐ (Generational GC) | ⭐⭐⭐ | ⭐⭐ |
| **包体积** | ⭐⭐⭐⭐⭐ (so 文件 ~2MB) | ⭐⭐⭐ (内置) | ⭐⭐ (~8MB) |
| **调试支持** | ⭐⭐⭐⭐ (Chrome DevTools) | ⭐⭐⭐⭐⭐ (Safari) | ⭐⭐⭐⭐⭐ |
| **Intl 支持** | ⭐⭐⭐⭐ (ICU 集成) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **2026 状态** | React Native 默认 | 遗留支持 | 实验性 |

### 2.2 Hermes Bytecode 预编译

Hermes 不执行源码，而是执行预编译的字节码。这带来了显著的启动优势：

```bash
# Metro 默认配置下，Hermes 自动编译
# 验证 Hermes 是否启用
npx react-native info | grep Hermes

# 查看 Bundle 构成
npx react-native-bundle-visualizer

# 生成 Hermes Profile
# iOS:
xcrun simctl spawn booted profilehermes \
  --sample-interval 100 \
  --allocations \
  /path/to/bundle.hbc

# Android:
adb shell run-as com.yourapp \
  libhermes.so -cpuprofile /data/data/com.yourapp/cache/profile.json
```

### 2.3 Hermes 内存调优

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Hermes 特定优化
config.transformer.minifierConfig = {
  compress: {
    // 移除 console 调用 (生产环境)
    drop_console: true,
    // 移除 debugger 语句
    drop_debugger: true,
    // 全局定义
    global_defs: {
      __DEV__: false,
    },
  },
  mangle: {
    // 混淆变量名
    toplevel: true,
  },
};

module.exports = config;
```

### 2.4 Hermes 垃圾回收调优

```javascript
// 在 App 启动时配置 GC 策略 (高级用法)
if (global.HermesInternal) {
  // HermesInternal 暴露的调试接口
  // 注意: 这些 API 仅在 Debug 构建可用
  
  // 强制 GC (测试内存泄漏时使用)
  // global.HermesInternal.forceGC();
  
  // 获取堆统计
  const heapStats = global.HermesInternal.getHeapStats(true);
  console.log('Heap Size:', heapStats.heapSize);
  console.log('Allocated:', heapStats.allocatedBytes);
}
```

---

## 三、Bundle 拆分与按需加载

### 3.1 Metro Bundle 结构分析

```
index.bundle (Hermes Bytecode)
├── __prelude__              # Polyfills (~50KB)
├── node_modules/
│   ├── react/               # React Core (~40KB)
│   ├── react-native/        # RN Core (~200KB)
│   ├── @react-navigation/   # Navigation (~80KB)
│   └── ...                  # 第三方库
├── src/
│   ├── components/          # UI 组件
│   ├── screens/             # 页面
│   └── utils/               # 工具函数
└── RAM Bundle (可选)        # 按需加载模块
```

### 3.2 路由级代码分割

```typescript
// src/navigation/RootNavigator.tsx
import React, { lazy, Suspense } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

// 懒加载非首屏页面
const ProfileScreen = lazy(() => import('@screens/ProfileScreen'));
const SettingsScreen = lazy(() => import('@screens/SettingsScreen'));
const PostDetailScreen = lazy(() => import('@screens/PostDetailScreen'));

function LazyFallback() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Explore" component={ExploreScreen} />
      <Stack.Screen name="Create" component={CreateScreen} />
      
      {/* 懒加载页面 */}
      <Stack.Screen name="Profile">
        {(props) => (
          <Suspense fallback={<LazyFallback />}>
            <ProfileScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="Settings">
        {(props) => (
          <Suspense fallback={<LazyFallback />}>
            <SettingsScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
      
      <Stack.Screen name="PostDetail">
        {(props) => (
          <Suspense fallback={<LazyFallback />}>
            <PostDetailScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
```

### 3.3 基于 RAM Bundle 的按需加载 (高级)

```typescript
// src/utils/lazyLoad.ts
import { NativeModules } from 'react-native';

interface ModuleLoader<T> {
  load: () => Promise<T>;
  preload: () => void;
}

export function createLazyModule<T>(loader: () => Promise<T>): ModuleLoader<T> {
  let cachedModule: T | undefined;
  let loadPromise: Promise<T> | undefined;

  return {
    load: async () => {
      if (cachedModule) return cachedModule;
      if (!loadPromise) {
        loadPromise = loader().then((mod) => {
          cachedModule = mod;
          return mod;
        });
      }
      return loadPromise;
    },
    preload: () => {
      if (!cachedModule && !loadPromise) {
        loadPromise = loader().then((mod) => {
          cachedModule = mod;
          return mod;
        });
      }
    },
  };
}

// 使用示例: 预加载可能访问的模块
const heavyModule = createLazyModule(() => import('@utils/heavyComputation'));

// 空闲时预加载
requestIdleCallback(() => {
  heavyModule.preload();
});

// 实际使用时
async function handleComplexTask() {
  const module = await heavyModule.load();
  module.execute();
}
```

### 3.4 依赖体积优化

```bash
# 分析 Bundle 体积
npx react-native-bundle-visualizer --expo

# 常见优化策略:
# 1. 替换重型库
#    moment (290KB) → date-fns (20KB)
#    lodash (70KB) → lodash-es + tree-shaking
#    uuid (40KB) → expo-crypto (内置)

# 2. 启用 Tree Shaking
# babel.config.js:
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    // 确保支持 ES Modules 的 tree shaking
    ['module-resolver', { ... }],
  ],
  env: {
    production: {
      plugins: [
        // 移除 PropTypes
        ['transform-remove-console', { exclude: ['error', 'warn'] }],
      ],
    },
  },
};
```

---

## 四、图片加载与缓存策略

### 4.1 图片加载方案对比

| 方案 | 缓存策略 | 格式支持 | WebP | 渐进加载 | 内存管理 | 推荐指数 |
|-----|---------|---------|------|---------|---------|---------|
| Image (RN 内置) | 无 | JPG/PNG | ❌ | ❌ | 差 | ⭐ |
| react-native-fast-image | 磁盘+内存 | JPG/PNG/GIF/WebP | ✅ | ✅ | 中 | ⭐⭐⭐ |
| Expo Image | 磁盘+内存 | 全格式+SVG | ✅ | ✅ | 优 | ⭐⭐⭐⭐⭐ |
| react-native-svg | 不适用 | SVG | N/A | N/A | 优 | ⭐⭐⭐⭐ |
| Skia Image | GPU 纹理 | 全格式 | ✅ | ❌ | 极优 | ⭐⭐⭐⭐ |

### 4.2 Expo Image 最佳实践

```typescript
// src/components/OptimizedImage.tsx
import React from 'react';
import { Image, ImageContentFit, ImageSource } from 'expo-image';
import { ViewStyle } from 'react-native';

interface OptimizedImageProps {
  source: string | ImageSource;
  style?: ViewStyle;
  contentFit?: ImageContentFit;
  placeholder?: string;
  transition?: number;
  cachePolicy?: 'memory-disk' | 'memory' | 'disk' | 'none';
  priority?: 'low' | 'normal' | 'high';
}

export function OptimizedImage({
  source,
  style,
  contentFit = 'cover',
  placeholder,
  transition = 200,
  cachePolicy = 'memory-disk',
  priority = 'normal',
}: OptimizedImageProps): JSX.Element {
  return (
    <Image
      source={typeof source === 'string' ? { uri: source } : source}
      style={[{ backgroundColor: '#f0f0f0' }, style]}
      contentFit={contentFit}
      placeholder={placeholder ? { blurhash: placeholder } : undefined}
      transition={transition}
      cachePolicy={cachePolicy}
      priority={priority}
      // 自动选择最佳格式
      contentPosition="center"
    />
  );
}

// 使用示例
function PostCard({ post }: { post: Post }) {
  return (
    <View style={styles.card}>
      <OptimizedImage
        source={post.imageUrl}
        style={{ width: '100%', height: 200, borderRadius: 12 }}
        contentFit="cover"
        placeholder="LEHV6nWB2yk8pyo0adR*.7kCMdnj"  // Blurhash
        transition={300}
        cachePolicy="memory-disk"
        priority="high"
      />
      <Text style={styles.title}>{post.title}</Text>
    </View>
  );
}
```

### 4.3 图片预加载策略

```typescript
// src/utils/imagePreloader.ts
import { Image as ExpoImage } from 'expo-image';

class ImagePreloader {
  private preloadQueue: string[] = [];
  private maxConcurrent = 3;
  private activeLoads = 0;

  queue(urls: string[]) {
    this.preloadQueue.push(...urls);
    this.processQueue();
  }

  private async processQueue() {
    while (this.activeLoads < this.maxConcurrent && this.preloadQueue.length > 0) {
      const url = this.preloadQueue.shift()!;
      this.activeLoads++;
      
      try {
        await ExpoImage.prefetch(url, 'memory-disk');
      } catch (error) {
        console.warn('Failed to preload image:', url);
      } finally {
        this.activeLoads--;
        this.processQueue();
      }
    }
  }

  clearQueue() {
    this.preloadQueue = [];
  }
}

export const imagePreloader = new ImagePreloader();

// 在列表预加载中使用
function FeedScreen() {
  const { data } = usePosts();
  
  useEffect(() => {
    if (data) {
      const imageUrls = data.pages
        .flatMap((page) => page.data)
        .map((post) => post.imageUrl)
        .filter(Boolean);
      
      // 预加载接下来 10 张图片
      imagePreloader.queue(imageUrls.slice(0, 10));
    }
  }, [data]);
  
  return <FlashList ... />;
}
```

### 4.4 响应式图片尺寸

```typescript
// src/utils/imageSizing.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export function getOptimalImageUrl(
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  }
): string {
  const pixelDensity = PixelRatio.get();
  const targetWidth = Math.round((options.width || SCREEN_WIDTH) * pixelDensity);
  const targetHeight = options.height
    ? Math.round(options.height * pixelDensity)
    : undefined;

  // 假设使用 Cloudinary / Imgix / AWS Lambda 等图片服务
  const params = new URLSearchParams();
  params.set('w', targetWidth.toString());
  if (targetHeight) params.set('h', targetHeight.toString());
  if (options.quality) params.set('q', options.quality.toString());
  if (options.format) params.set('f', options.format);
  params.set('fit', 'crop');

  return `${baseUrl}?${params.toString()}`;
}

// 使用
const imageUrl = getOptimalImageUrl(post.imageUrl, {
  width: SCREEN_WIDTH,
  height: 200,
  quality: 80,
  format: 'webp',
});
```

---

## 五、列表虚拟化与内存管理

### 5.1 列表组件性能对比

| 组件 | 虚拟化 | 回收机制 | 预估高度 | 适用场景 | 内存效率 |
|-----|--------|---------|---------|---------|---------|
| ScrollView | ❌ | ❌ | N/A | 少量固定内容 | 差 |
| FlatList | ✅ | ✅ | 需准确 | 通用列表 | 中 |
| SectionList | ✅ | ✅ | 需准确 | 分组列表 | 中 |
| FlashList | ✅ | ✅✅ | 自动 | 长列表/复杂项 | 优 |
| RecyclerListView | ✅ | ✅✅ | 需准确 | 瀑布流/网格 | 优 |
| BigList | ✅ | ✅ | 需准确 | 超大数据集 | 优 |

### 5.2 FlashList 深度使用

FlashList 由 Shopify 开发，基于 RecyclerListView，但 API 与 FlatList 完全兼容：

```typescript
// src/screens/FeedScreen.tsx
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { usePosts } from '@hooks/usePosts';
import { PostCard } from '@components/PostCard';
import { PostCardSkeleton } from '@components/LoadingSkeleton';
import { Post } from '@types';

const ESTIMATED_ITEM_HEIGHT = 280;

export function FeedScreen(): JSX.Element {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = usePosts();

  const posts = data?.pages.flatMap((page) => page.data) ?? [];

  const renderItem: ListRenderItem<Post> = useCallback(
    ({ item, index }) => (
      <PostCard
        post={item}
        onPress={() => navigateToPost(item.id)}
        index={index}
      />
    ),
    []
  );

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const ListFooterComponent = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <PostCardSkeleton />
      </View>
    );
  }, [isFetchingNextPage]);

  const ListEmptyComponent = useCallback(() => {
    if (isLoading) {
      return (
        <View>
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </View>
      );
    }
    return (
      <View style={styles.empty}>
        <Text>暂无内容</Text>
      </View>
    );
  }, [isLoading]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <PostCardSkeleton />
        <PostCardSkeleton />
      </View>
    );
  }

  return (
    <FlashList
      data={posts}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      estimatedItemSize={ESTIMATED_ITEM_HEIGHT}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
      // 性能优化选项
      removeClippedSubviews={true}
      disableAutoLayout={false}
      disableHorizontalListHeightMeasurement={false}
      // 保持可见项不被回收
      overrideItemLayout={(layout, item) => {
        if (item.isPinned) {
          layout.size = 400; // 固定项高度
        }
      }}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: { paddingVertical: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
});
```

### 5.3 列表项组件优化

```typescript
// src/components/PostCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Post } from '@types';

interface PostCardProps {
  post: Post;
  onPress: (post: Post) => void;
  index: number;
}

// ✅ 使用 React.memo 避免不必要的重渲染
export const PostCard = React.memo(function PostCard({
  post,
  onPress,
}: PostCardProps): JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(post)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: post.imageUrl }}
        style={styles.image}
        contentFit="cover"
        cachePolicy="memory-disk"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={3}>
          {post.excerpt}
        </Text>
      </View>
    </TouchableOpacity>
  );
}, 
// 自定义比较函数
(prevProps, nextProps) => {
  return prevProps.post.id === nextProps.post.id &&
         prevProps.post.updatedAt === nextProps.post.updatedAt;
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  excerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
```

---

## 六、渲染优化与避免重绘

### 6.1 React 渲染优化检查清单

```typescript
// ✅ 优化前: 每次父组件渲染都创建新函数
function Parent() {
  const [count, setCount] = useState(0);
  
  // ❌ 每次渲染都创建新函数引用
  const handleClick = () => {
    console.log('clicked');
  };
  
  return <Child onClick={handleClick} />; // Child 每次都重渲染
}

// ✅ 优化后: 使用 useCallback
function Parent() {
  const [count, setCount] = useState(0);
  
  // 使用 useCallback 缓存函数引用
  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []); // 空依赖 = 永不重新创建
  
  return <Child onClick={handleClick} />; // Child 不会不必要重渲染
}

// ✅ 优化前: 每次创建新对象
function Parent() {
  const user = { name: 'John', age: 30 }; // 每次渲染新对象
  return <UserCard user={user} />;
}

// ✅ 优化后: 使用 useMemo
function Parent() {
  const user = useMemo(() => ({ name: 'John', age: 30 }), []);
  return <UserCard user={user} />;
}
```

### 6.2 使用 React DevTools Profiler

```typescript
// 包装组件以追踪渲染原因
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  console.log('Component:', id);
  console.log('Phase:', phase);
  console.log('Actual Duration:', actualDuration.toFixed(2), 'ms');
  console.log('Base Duration:', baseDuration.toFixed(2), 'ms');
  
  if (actualDuration > 16) {
    console.warn('⚠️ Slow render detected:', id);
  }
}

// 使用
<Profiler id="FeedScreen" onRender={onRenderCallback}>
  <FeedScreen />
</Profiler>
```

### 6.3 状态提升与 Context 优化

```typescript
// ❌ 反模式: 将所有状态放在根 Context
// 任何状态变化都导致整个应用重渲染

// ✅ 正模式: 按域拆分 Context
// src/contexts/AuthContext.tsx
import { createContext, useContext, useCallback } from 'react';

const AuthContext = createContext<AuthContextType | null>(null);

// 拆分为多个 Context 避免不必要更新
const AuthStateContext = createContext<AuthState | null>(null);
const AuthActionsContext = createContext<AuthActions | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  
  // 使用 useMemo 保持引用稳定
  const actions = useMemo(() => ({
    login: (credentials: LoginCredentials) => {
      dispatch({ type: 'LOGIN_START' });
      // ...
    },
    logout: () => dispatch({ type: 'LOGOUT' }),
  }), []); // dispatch 引用稳定
  
  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  );
}

// 自定义 Hooks
export function useAuthState() {
  const state = useContext(AuthStateContext);
  if (!state) throw new Error('AuthProvider missing');
  return state; // 仅状态变化时重渲染
}

export function useAuthActions() {
  const actions = useContext(AuthActionsContext);
  if (!actions) throw new Error('AuthProvider missing');
  return actions; // 永不导致重渲染
}
```

---

## 七、启动时间优化

### 7.1 启动阶段分析

```
App 启动时间线:
├─ T0: 用户点击图标
├─ T0-50ms: 操作系统加载 App 二进制
├─ T0-100ms: 加载并链接原生库 (Dyld/Linker)
├─ T0-200ms: 初始化 RCTBridge / JSI Runtime
├─ T0-400ms: 加载并解析 JS Bundle (Hermes: 直接加载 Bytecode)
├─ T0-600ms: 执行 JS Bundle (require 所有模块)
├─ T0-800ms: 首屏 React 渲染 (ReactDOM.render)
├─ T0-1000ms: 首屏 Native 布局 (Yoga/Fabric)
├─ T0-1200ms: 首屏图片加载完成
└─ TTI: 首次可交互
```

### 7.2 启动优化策略

```typescript
// App.tsx - 延迟加载非关键模块
import React, { Suspense, lazy } from 'react';
import { View, ActivityIndicator } from 'react-native';

// 立即加载: 首屏必需
import { RootNavigator } from './navigation/RootNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// 延迟加载: 非首屏
const AnalyticsProvider = lazy(() => import('./providers/AnalyticsProvider'));
const PushNotificationProvider = lazy(() => import('./providers/PushNotificationProvider'));
const DeepLinkProvider = lazy(() => import('./providers/DeepLinkProvider'));

function LazyLoadProvider({ children, provider: Provider }: {
  children: React.ReactNode;
  provider: React.ComponentType<{ children: React.ReactNode }>;
}) {
  return (
    <Suspense fallback={children}>
      <Provider>{children}</Provider>
    </Suspense>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LazyLoadProvider provider={AnalyticsProvider}>
        <LazyLoadProvider provider={PushNotificationProvider}>
          <LazyLoadProvider provider={DeepLinkProvider}>
            <RootNavigator />
          </LazyLoadProvider>
        </LazyLoadProvider>
      </LazyLoadProvider>
    </SafeAreaProvider>
  );
}
```

### 7.3 原生启动优化

```objc
// ios/YourApp/AppDelegate.mm
// 延迟初始化非关键 SDK

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
  // 1. 先启动 RN
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  
  // 2. 延迟初始化 Analytics (500ms 后)
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(0.5 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
    [Analytics initialize];
  });
  
  // 3. 延迟初始化 Push (2s 后)
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)),
                 dispatch_get_main_queue(), ^{
    [PushNotifications register];
  });
  
  return YES;
}
```

---

## 八、动画性能优化

### 8.1 动画方案对比

| 方案 | 执行线程 | 手势支持 | 性能 | 学习曲线 | 适用场景 |
|-----|---------|---------|------|---------|---------|
| Animated API | JS / Native Driver | 有限 | 中 | 低 | 简单动画 |
| Reanimated 2/3 | UI Thread | 完整 | 极优 | 中 | 复杂交互 |
| Lottie | Native | 无 | 良好 | 低 | 复杂矢量动画 |
| Skia (Shopify) | GPU | 完整 | 极优 | 高 | 自定义绘制 |
| LayoutAnimation | Native | 无 | 优 | 低 | 布局变化 |

### 8.2 Reanimated 3 工作流动画

```typescript
// src/components/SwipeableCard.tsx
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDecay,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
}: SwipeableCardProps): JSX.Element {
  const translateX = useSharedValue(0);
  const rotateZ = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      translateX.value = event.translationX;
      rotateZ.value = interpolate(
        event.translationX,
        [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
        [-15, 0, 15],
        Extrapolation.CLAMP
      );
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        // 滑出屏幕
        const direction = event.translationX > 0 ? 1 : -1;
        translateX.value = withSpring(direction * SCREEN_WIDTH * 1.5, {
          velocity: event.velocityX,
        }, () => {
          if (direction > 0 && onSwipeRight) {
            runOnJS(onSwipeRight)();
          } else if (direction < 0 && onSwipeLeft) {
            runOnJS(onSwipeLeft)();
          }
        });
      } else {
        // 回弹
        translateX.value = withSpring(0);
        rotateZ.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotateZ: `${rotateZ.value}deg` },
    ],
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {children}
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: SCREEN_WIDTH - 40,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
});
```

---

## 九、内存泄漏检测与修复

### 9.1 常见内存泄漏场景

| 场景 | 原因 | 检测方法 | 修复方案 |
|-----|------|---------|---------|
| 事件监听未移除 | addEventListener 无对应 remove | Flipper Memory | useEventListener Hook |
| 定时器未清理 | setInterval 未 clear | Performance Monitor | useEffect cleanup |
| 闭包引用组件 | 回调捕获已卸载组件状态 | ESLint exhaustive-deps | useRef + isMounted |
| 图片缓存膨胀 | 大图加载未限制 | Xcode Instruments | 限制缓存大小 |
| 导航栈累积 | 未正确返回或重置 | Navigation state 检查 | navigation.reset |
| Redux/Zustand 订阅 | 组件卸载后仍更新 | 内存快照对比 | 自动清理机制 |

### 9.2 安全的事件监听 Hook

```typescript
// src/hooks/useEventListener.ts
import { useEffect, useRef } from 'react';
import { EventSubscription } from 'expo-modules-core';

export function useEventListener(
  eventName: string,
  handler: (event: any) => void,
  eventEmitter: { addListener: (name: string, handler: (event: any) => void) => EventSubscription }
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const subscription = eventEmitter.addListener(eventName, (event) => {
      savedHandler.current(event);
    });

    return () => {
      subscription.remove();
    };
  }, [eventName, eventEmitter]);
}

// 使用示例
import * as Notifications from 'expo-notifications';

function useNotificationHandler() {
  useEventListener(
    'notificationReceived',
    (notification) => {
      console.log('Notification:', notification);
    },
    Notifications
  );
}
```

### 9.3 安全的异步操作 Hook

```typescript
// src/hooks/useAsyncEffect.ts
import { useEffect, useRef, useCallback } from 'react';

export function useIsMounted() {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

// 使用示例
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null);
  const isMounted = useIsMounted();

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const data = await fetchUser(userId);
        if (!cancelled && isMounted()) {
          setUser(data);
        }
      } catch (error) {
        if (!cancelled && isMounted()) {
          console.error(error);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [userId, isMounted]);

  return <ProfileView user={user} />;
}
```

---

## 十、性能监控与持续集成

### 10.1 Flashlight 性能测试

```bash
# 安装 Flashlight
npm install -g @perf-labs/flashlight

# 测试启动时间
flashlight test --bundleId com.yourapp --testCommand "maestro test startup.yaml" --duration 10000

# 测试滚动性能
flashlight test --bundleId com.yourapp --testCommand "maestro test scroll.yaml" --duration 30000

# 生成报告
flashlight report ./results
```

### 10.2 自定义性能监控

```typescript
// src/utils/performance.ts
import { InteractionManager } from 'react-native';

export function measureInteraction(name: string, callback: () => void) {
  const startTime = performance.now();
  
  InteractionManager.runAfterInteractions(() => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    
    // 发送到分析服务
    if (duration > 100) {
      analytics.track('slow_interaction', {
        name,
        duration,
        threshold: 100,
      });
    }
  });
}

// 测量组件渲染时间
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  return function PerformanceTrackedComponent(props: P) {
    const startTime = performance.now();
    
    useEffect(() => {
      const duration = performance.now() - startTime;
      if (duration > 50) {
        console.warn(`[Performance] ${componentName} render: ${duration.toFixed(2)}ms`);
      }
    });
    
    return React.createElement(Component, props);
  };
}
```

### 10.3 CI 性能回归检测

```yaml
# .github/workflows/performance.yml
name: Performance Regression

on:
  pull_request:
    branches: [main]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build APK
        run: |
          cd apps/mobile
          eas build --platform android --profile preview --local --output ./build.apk
      
      - name: Run Flashlight
        run: |
          flashlight test \
            --app ./apps/mobile/build.apk \
            --testCommand "maestro test e2e/startup.yaml" \
            --duration 15000
      
      - name: Check Regression
        run: |
          # 对比基准结果
          flashlight compare ./results ./baseline-results
```

---

## 总结

移动端性能优化是一个系统工程，需要从引擎、Bundle、网络、渲染、内存等多个维度综合考量。Hermes 引擎、FlashList、Expo Image 和 Reanimated 3 构成了 2026 年 React Native 性能优化的核心技术栈。

**关键要点**:

1. **Hermes Bytecode**: 预编译将启动时间减少 50%
2. **FlashList**: 虚拟化使长列表内存占用降低 25%，FPS 提升 11%
3. **Expo Image**: 智能缓存策略减少 60% 图片相关内存问题
4. **Reanimated 3**: UI 线程动画实现真正的 60 FPS
5. **Bundle 拆分**: 路由级懒加载减少首屏加载 40%
6. **持续监控**: Flashlight + CI 集成防止性能回归

下一步建议阅读 [05-mobile-native-modules.md](./05-mobile-native-modules.md)，学习如何编写高性能的原生模块来进一步突破性能瓶颈。


---

## 附录 A: 完整的性能监控 SDK 实现

```typescript
// packages/shared/src/performance/monitor.ts
import { InteractionManager, Platform } from 'react-native';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'fps' | 'count';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceConfig {
  enableConsoleLogging: boolean;
  enableAnalytics: boolean;
  slowRenderThreshold: number;
  slowInteractionThreshold: number;
  sampleRate: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private config: PerformanceConfig;
  private marks: Map<string, number> = new Map();
  private listeners: Array<(metric: PerformanceMetric) => void> = [];

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableConsoleLogging: __DEV__,
      enableAnalytics: !__DEV__,
      slowRenderThreshold: 50,
      slowInteractionThreshold: 100,
      sampleRate: 1.0,
      ...config,
    };
  }

  // 标记开始时间
  mark(name: string): void {
    this.marks.set(name, performance.now());
  }

  // 测量从 mark 到当前的时间
  measure(name: string, markName: string, metadata?: Record<string, unknown>): PerformanceMetric | null {
    const startTime = this.marks.get(markName);
    if (!startTime) return null;

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata,
    };

    this.record(metric);
    this.marks.delete(markName);
    return metric;
  }

  // 直接记录指标
  record(metric: PerformanceMetric): void {
    if (Math.random() > this.config.sampleRate) return;

    this.metrics.push(metric);

    if (this.config.enableConsoleLogging) {
      const emoji = this.getMetricEmoji(metric);
      console.log(
        `[Performance] ${emoji} ${metric.name}: ${metric.value.toFixed(2)}${metric.unit}`,
        metric.metadata || ''
      );
    }

    if (metric.value > this.getThreshold(metric.name)) {
      this.reportSlowMetric(metric);
    }

    this.listeners.forEach((listener) => listener(metric));
  }

  // 监控组件渲染
  trackRender(componentName: string, renderTime: number): void {
    this.record({
      name: `render.${componentName}`,
      value: renderTime,
      unit: 'ms',
      timestamp: Date.now(),
    });
  }

  // 监控交互响应
  trackInteraction(name: string, callback: () => void): void {
    const startTime = performance.now();

    InteractionManager.runAfterInteractions(() => {
      const duration = performance.now() - startTime;
      this.record({
        name: `interaction.${name}`,
        value: duration,
        unit: 'ms',
        timestamp: Date.now(),
      });
      callback();
    });
  }

  // 监控网络请求
  trackNetworkRequest(url: string, duration: number, success: boolean, bytesReceived?: number): void {
    this.record({
      name: 'network.request',
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      metadata: { url, success, bytesReceived },
    });
  }

  // 监控列表滚动
  trackScrollPerformance(listName: string, fps: number, droppedFrames: number): void {
    this.record({
      name: `scroll.${listName}`,
      value: fps,
      unit: 'fps',
      timestamp: Date.now(),
      metadata: { droppedFrames },
    });
  }

  // 获取所有指标
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  // 清空指标
  clear(): void {
    this.metrics = [];
    this.marks.clear();
  }

  // 订阅指标
  subscribe(listener: (metric: PerformanceMetric) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private getThreshold(metricName: string): number {
    if (metricName.includes('render')) return this.config.slowRenderThreshold;
    if (metricName.includes('interaction')) return this.config.slowInteractionThreshold;
    return Infinity;
  }

  private getMetricEmoji(metric: PerformanceMetric): string {
    if (metric.unit === 'fps') {
      return metric.value >= 55 ? '🚀' : metric.value >= 30 ? '⚠️' : '🔴';
    }
    if (metric.value > this.getThreshold(metric.name)) {
      return '🔴';
    }
    return '✅';
  }

  private reportSlowMetric(metric: PerformanceMetric): void {
    if (this.config.enableAnalytics) {
      // 发送到分析服务
      console.warn(`[Performance] Slow metric detected:`, metric);
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React Hook 封装
// packages/shared/src/performance/usePerformance.ts
import { useEffect, useRef, useCallback } from 'react';
import { performanceMonitor } from './monitor';

export function useRenderTrack(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
    const duration = performance.now() - startTime.current;
    performanceMonitor.trackRender(componentName, duration);
    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
  };
}

export function useInteractionTrack<T extends (...args: any[]) => void>(
  name: string,
  handler: T
): T {
  return useCallback((...args: Parameters<T>) => {
    performanceMonitor.trackInteraction(name, () => {
      handler(...args);
    });
  }, [name, handler]) as T;
}

// 高阶组件
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  return function PerformanceTrackedComponent(props: P) {
    useRenderTrack(componentName);
    return React.createElement(Component, props);
  };
}

// 使用示例
// src/components/HeavyList.tsx
import { withPerformanceTracking } from '@myrepo/shared';

function HeavyListBase({ data }: { data: Item[] }) {
  return (
    <FlashList
      data={data}
      renderItem={renderItem}
      estimatedItemSize={100}
    />
  );
}

export const HeavyList = withPerformanceTracking(HeavyListBase, 'HeavyList');
```

---

## 附录 B: Hermes 字节码优化与 Bundle 分析

```bash
#!/bin/bash
# scripts/analyze-bundle.sh

echo "=== Bundle 分析工具 ==="

# 1. 生成 Bundle
npx react-native bundle \
  --platform ios \
  --dev false \
  --entry-file index.js \
  --bundle-output ./tmp/ios.bundle \
  --sourcemap-output ./tmp/ios.bundle.map

# 2. 转换为 Hermes Bytecode (iOS)
ios/Pods/hermes-engine/destroot/bin/hermesc \
  -O -emit-binary \
  -out ./tmp/ios.bundle.hbc \
  ./tmp/ios.bundle

# 3. 分析 Bundle 大小
echo "原始 Bundle 大小:"
ls -lh ./tmp/ios.bundle

echo "Hermes Bytecode 大小:"
ls -lh ./tmp/ios.bundle.hbc

echo "压缩率:"
original=$(stat -f%z ./tmp/ios.bundle 2>/dev/null || stat -c%s ./tmp/ios.bundle)
compressed=$(stat -f%z ./tmp/ios.bundle.hbc 2>/dev/null || stat -c%s ./tmp/ios.bundle.hbc)
python3 -c "print(f'{((1 - $compressed/$original) * 100):.1f}%')"

# 4. 使用 source-map-explorer 分析
npx source-map-explorer ./tmp/ios.bundle ./tmp/ios.bundle.map \
  --html ./tmp/bundle-report.html

echo "报告已生成: ./tmp/bundle-report.html"
```

```typescript
// scripts/bundle-analyzer.ts
import fs from 'fs';
import path from 'path';

interface BundleChunk {
  name: string;
  size: number;
  dependencies: string[];
}

function analyzeBundle(bundlePath: string): BundleChunk[] {
  const bundle = fs.readFileSync(bundlePath, 'utf8');
  const chunks: BundleChunk[] = [];

  // 简单的正则分析 (实际项目应使用 AST)
  const moduleRegex = /__d\(function\([^)]+\)\{([\s\S]*?)\},(\d+),\[(.*?)\],"(.*?)"\);/g;
  let match;

  while ((match = moduleRegex.exec(bundle)) !== null) {
    const [, code, id, deps, name] = match;
    chunks.push({
      name,
      size: code.length,
      dependencies: deps.split(',').map((d) => d.trim().replace(/"/g, '')),
    });
  }

  return chunks.sort((a, b) => b.size - a.size);
}

function printBundleReport(chunks: BundleChunk[]) {
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);

  console.log('=== Bundle 分析报告 ===\n');
  console.log(`总模块数: ${chunks.length}`);
  console.log(`总大小: ${(totalSize / 1024).toFixed(2)} KB\n`);

  console.log('最大的 20 个模块:');
  console.table(
    chunks.slice(0, 20).map((chunk) => ({
      模块: chunk.name.length > 50 ? chunk.name.slice(0, 50) + '...' : chunk.name,
      大小: `${(chunk.size / 1024).toFixed(2)} KB`,
      占比: `${((chunk.size / totalSize) * 100).toFixed(1)}%`,
    }))
  );
}

const bundlePath = process.argv[2] || './tmp/ios.bundle';
if (fs.existsSync(bundlePath)) {
  const chunks = analyzeBundle(bundlePath);
  printBundleReport(chunks);
} else {
  console.error('Bundle 文件不存在:', bundlePath);
}
```

---

## 附录 C: 完整的内存管理最佳实践

```typescript
// src/utils/memoryManager.ts
import { useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  size: number;
  accessCount: number;
}

class MemoryCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private maxSize: number;
  private currentSize: number = 0;
  private ttl: number;

  constructor(options: { maxSizeMB: number; ttlMinutes: number }) {
    this.maxSize = options.maxSizeMB * 1024 * 1024;
    this.ttl = options.ttlMinutes * 60 * 1000;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.delete(key);
      return undefined;
    }

    entry.accessCount++;
    return entry.value;
  }

  set(key: string, value: T, size: number): void {
    // 如果单个条目超过最大缓存，不缓存
    if (size > this.maxSize) return;

    // 清理空间
    while (this.currentSize + size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }

    // 删除旧条目
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.currentSize -= oldEntry.size;
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      size,
      accessCount: 1,
    });
    this.currentSize += size;
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      this.cache.delete(key);
      return true;
    }
    return false;
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }

  getStats() {
    return {
      entries: this.cache.size,
      currentSize: this.currentSize,
      maxSize: this.maxSize,
      utilization: (this.currentSize / this.maxSize) * 100,
    };
  }
}

// 全局图片缓存
export const imageCache = new MemoryCache<string>({
  maxSizeMB: 50,
  ttlMinutes: 30,
});

// 内存压力监听
export function useMemoryPressure() {
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // 应用回到前台，可以清理一些缓存
        console.log('App returned to foreground');
      }

      if (nextAppState === 'background') {
        // 应用进入后台，清理非必要缓存
        imageCache.clear();
        console.log('Cleared image cache on background');
      }

      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);
}

// 图片预加载管理器 (带内存限制)
class ImagePreloader {
  private queue: Array<{ url: string; priority: number }> = [];
  private loading: Set<string> = new Set();
  private maxConcurrent: number = 3;

  preload(url: string, priority: number = 0) {
    if (imageCache.get(url) || this.loading.has(url)) return;

    this.queue.push({ url, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }

  private processQueue() {
    while (this.loading.size < this.maxConcurrent && this.queue.length > 0) {
      const { url } = this.queue.shift()!;
      this.loadImage(url);
    }
  }

  private async loadImage(url: string) {
    this.loading.add(url);

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;
        imageCache.set(url, base64, blob.size);
        this.loading.delete(url);
        this.processQueue();
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.warn('Failed to preload image:', url);
      this.loading.delete(url);
      this.processQueue();
    }
  }

  cancelAll() {
    this.queue = [];
    this.loading.clear();
  }
}

export const imagePreloader = new ImagePreloader();
```

---

## 附录 D: 完整的启动优化实战

```typescript
// src/utils/startup.ts
import { InteractionManager, AppRegistry } from 'react-native';

interface StartupTask {
  name: string;
  priority: 'critical' | 'high' | 'normal' | 'low';
  execute: () => Promise<void> | void;
  delay?: number;
}

class StartupManager {
  private tasks: StartupTask[] = [];
  private completedTasks: Set<string> = new Set();
  private startTime: number = 0;

  register(task: StartupTask): void {
    this.tasks.push(task);
    this.tasks.sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority));
  }

  async execute(): Promise<void> {
    this.startTime = performance.now();
    console.log('[Startup] Starting initialization...');

    // 第一阶段: 关键任务 (阻塞)
    const criticalTasks = this.tasks.filter((t) => t.priority === 'critical');
    for (const task of criticalTasks) {
      await this.runTask(task);
    }

    // 第二阶段: 高优先级任务 (交互后执行)
    InteractionManager.runAfterInteractions(async () => {
      const highTasks = this.tasks.filter(
        (t) => t.priority === 'high' && !this.completedTasks.has(t.name)
      );
      for (const task of highTasks) {
        await this.runTask(task);
      }
    });

    // 第三阶段: 普通任务 (延迟执行)
    setTimeout(async () => {
      const normalTasks = this.tasks.filter(
        (t) => t.priority === 'normal' && !this.completedTasks.has(t.name)
      );
      for (const task of normalTasks) {
        await this.runTask(task);
      }
    }, 2000);

    // 第四阶段: 低优先级任务 (空闲时执行)
    requestIdleCallback?.(async () => {
      const lowTasks = this.tasks.filter(
        (t) => t.priority === 'low' && !this.completedTasks.has(t.name)
      );
      for (const task of lowTasks) {
        await this.runTask(task);
      }
    });
  }

  private async runTask(task: StartupTask): Promise<void> {
    if (this.completedTasks.has(task.name)) return;

    const taskStart = performance.now();

    try {
      if (task.delay) {
        await new Promise((resolve) => setTimeout(resolve, task.delay));
      }

      await task.execute();
      this.completedTasks.add(task.name);

      const duration = performance.now() - taskStart;
      console.log(`[Startup] ✅ ${task.name}: ${duration.toFixed(2)}ms`);
    } catch (error) {
      console.error(`[Startup] ❌ ${task.name} failed:`, error);
    }
  }

  private getPriorityValue(priority: StartupTask['priority']): number {
    const priorities = { critical: 0, high: 1, normal: 2, low: 3 };
    return priorities[priority];
  }

  getStartupTime(): number {
    return performance.now() - this.startTime;
  }
}

export const startupManager = new StartupManager();

// 使用示例
// App.tsx
import { startupManager } from './utils/startup';

// 注册启动任务
startupManager.register({
  name: 'init-store',
  priority: 'critical',
  execute: () => {
    // 初始化 Zustand stores
    useAuthStore.getState().initializeAuth();
  },
});

startupManager.register({
  name: 'init-query-client',
  priority: 'critical',
  execute: () => {
    // React Query 客户端已在上层组件创建
  },
});

startupManager.register({
  name: 'init-analytics',
  priority: 'high',
  execute: async () => {
    // 延迟初始化分析 SDK
    await import('./utils/analytics').then((m) => m.initializeAnalytics());
  },
});

startupManager.register({
  name: 'init-push-notifications',
  priority: 'normal',
  execute: async () => {
    await import('./utils/notifications').then((m) => m.initializePushNotifications());
  },
  delay: 3000,
});

startupManager.register({
  name: 'prefetch-common-data',
  priority: 'low',
  execute: async () => {
    // 预加载常用数据
    await queryClient.prefetchQuery({ queryKey: ['config'], queryFn: fetchAppConfig });
  },
});

// 应用入口
export default function App() {
  useEffect(() => {
    startupManager.execute();
  }, []);

  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}
```

---

## 附录 E: 性能优化决策速查表

| 症状 | 诊断工具 | 根本原因 | 解决方案 | 预期收益 |
|-----|---------|---------|---------|---------|
| 启动慢 (>3s) | Flashlight | Bundle 大 / 初始化多 | Hermes + 任务分级 | -30%~50% TTI |
| 滚动卡顿 | Systrace | JS Thread 忙碌 | FlashList + memo | +10~15 FPS |
| 图片加载慢 | Network | 无缓存 / 大尺寸 | Expo Image + 预加载 | -80% 加载时间 |
| 内存告警 | Xcode/Android Profiler | 图片缓存膨胀 / 泄漏 | 限制缓存 + 清理 | -25% 内存 |
| 交互延迟 | Perf Monitor | 主线程阻塞 | 异步操作 + 手势优化 | -60ms 延迟 |
| Bundle 过大 | Bundle Analyzer | 冗余依赖 | Tree shaking + 拆分 | -40% 体积 |
| 动画掉帧 | Reanimated Profiler | JS 线程动画 | Reanimated 3 + UI 线程 | 稳定 60 FPS |
| 状态更新慢 | React DevTools | 过度渲染 | Context 拆分 + selectors | -50% 渲染次数 |


---

## 附录 F: 完整的图片处理流水线

```typescript
// src/utils/imageProcessor.ts
import { Image as ExpoImage } from 'expo-image';
import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PIXEL_DENSITY = 2; // 根据 PixelRatio.get() 动态获取

interface ImageProcessOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

interface ProcessedImage {
  uri: string;
  width: number;
  height: number;
  size: number;
}

export class ImageProcessor {
  static async preload(url: string): Promise<void> {
    await ExpoImage.prefetch(url, 'memory-disk');
  }

  static async getOptimalUrl(url: string, options: ImageProcessOptions = {}): Promise<string> {
    const { maxWidth = SCREEN_WIDTH, quality = 80, format = 'webp' } = options;
    const targetWidth = Math.round(maxWidth * PIXEL_DENSITY);

    // 如果使用 CDN 图片服务 (如 Cloudinary, Imgix)
    if (url.includes('cloudinary.com')) {
      return `${url.replace('/upload/', `/upload/w_${targetWidth},q_${quality},f_${format}/`)}`;
    }

    if (url.includes('imgix.net')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}w=${targetWidth}&q=${quality}&auto=format`;
    }

    return url;
  }

  static calculateAspectRatio(width: number, height: number, maxWidth: number): { width: number; height: number } {
    const ratio = height / width;
    const calculatedHeight = Math.round(maxWidth * ratio);
    return { width: maxWidth, height: calculatedHeight };
  }

  static async getImageSize(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      ExpoImage.getSize(uri, (width, height) => {
        resolve({ width, height });
      }, reject);
    });
  }
}

// 图片缓存管理器
export class ImageCacheManager {
  private cache: Map<string, { uri: string; timestamp: number; size: number }> = new Map();
  private maxCacheSize = 50 * 1024 * 1024; // 50MB
  private currentSize = 0;

  async add(uri: string, processedUri: string, size: number): Promise<void> {
    // 如果缓存已满，清理最旧的
    while (this.currentSize + size > this.maxCacheSize && this.cache.size > 0) {
      this.evictLRU();
    }

    this.cache.set(uri, {
      uri: processedUri,
      timestamp: Date.now(),
      size,
    });
    this.currentSize += size;
  }

  get(uri: string): string | undefined {
    const entry = this.cache.get(uri);
    if (entry) {
      entry.timestamp = Date.now(); // 更新访问时间
      return entry.uri;
    }
    return undefined;
  }

  private evictLRU(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey)!;
      this.currentSize -= entry.size;
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }
}

export const imageCache = new ImageCacheManager();
```

---

## 附录 G: 完整的列表渲染优化模式

```tsx
// src/components/OptimizedList.tsx
import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import Animated from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OptimizedListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  estimatedItemSize: number;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  onEndReached?: () => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  numColumns?: number;
}

function OptimizedListBase<T>({
  data,
  renderItem,
  keyExtractor,
  estimatedItemSize,
  headerComponent,
  footerComponent,
  emptyComponent,
  onEndReached,
  onRefresh,
  refreshing,
  numColumns = 1,
}: OptimizedListProps<T>): JSX.Element {
  // 使用 useMemo 缓存数据
  const memoizedData = useMemo(() => data, [data]);

  // 使用 useCallback 缓存渲染函数
  const handleRenderItem: ListRenderItem<T> = useCallback(
    ({ item, index }) => (
      <Animated.View entering={FadeInUp.delay(index * 50)}>
        {renderItem(item, index)}
      </Animated.View>
    ),
    [renderItem]
  );

  // 缓存 keyExtractor
  const handleKeyExtractor = useCallback(
    (item: T) => keyExtractor(item),
    [keyExtractor]
  );

  // 缓存空组件
  const ListEmptyComponent = useMemo(
    () => (emptyComponent ? () => <>{emptyComponent}</> : undefined),
    [emptyComponent]
  );

  return (
    <FlashList
      data={memoizedData}
      renderItem={handleRenderItem}
      keyExtractor={handleKeyExtractor}
      estimatedItemSize={estimatedItemSize}
      ListHeaderComponent={headerComponent}
      ListFooterComponent={footerComponent}
      ListEmptyComponent={ListEmptyComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={onRefresh}
      removeClippedSubviews={true}
      numColumns={numColumns}
      // 优化：只渲染可见区域 + 缓冲区
      disableAutoLayout={false}
      // 优化：禁用水平列表高度测量
      disableHorizontalListHeightMeasurement={false}
      // 优化：覆盖项布局 (用于固定高度项)
      overrideItemLayout={(layout, item, index) => {
        // 可以为特定项设置不同高度
        if (index === 0 && headerComponent) {
          layout.size = estimatedItemSize + 20;
        }
      }}
      // 维护可见项状态
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
      }}
    />
  );
}

import { FadeInUp } from 'react-native-reanimated';

export const OptimizedList = React.memo(OptimizedListBase) as typeof OptimizedListBase;

// 使用示例
function PostList({ posts }: { posts: Post[] }) {
  const renderPost = useCallback((post: Post) => (
    <PostCard post={post} />
  ), []);

  const keyExtractor = useCallback((post: Post) => post.id, []);

  return (
    <OptimizedList
      data={posts}
      renderItem={renderPost}
      keyExtractor={keyExtractor}
      estimatedItemSize={280}
      onEndReached={() => console.log('Load more')}
    />
  );
}
```

---

## 附录 H: 状态管理性能优化模式

```typescript
// stores/optimizedStore.ts
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

// 使用 subscribeWithSelector 实现精准订阅
interface AppState {
  user: User | null;
  posts: Post[];
  notifications: Notification[];
  theme: 'light' | 'dark';
  isLoading: boolean;
  
  setUser: (user: User | null) => void;
  setPosts: (posts: Post[]) => void;
  addNotification: (notification: Notification) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set) => ({
    user: null,
    posts: [],
    notifications: [],
    theme: 'light',
    isLoading: false,

    setUser: (user) => set({ user }),
    setPosts: (posts) => set({ posts }),
    addNotification: (notification) =>
      set((state) => ({ notifications: [notification, ...state.notifications] })),
    setTheme: (theme) => set({ theme }),
    setLoading: (isLoading) => set({ isLoading }),
  }))
);

// 精准选择器 (避免不必要的重渲染)
// ❌ 低效: 订阅整个 store
const state = useAppStore(); // 任何状态变化都触发重渲染

// ✅ 高效: 只订阅需要的字段
const user = useAppStore((state) => state.user);
const theme = useAppStore((state) => state.theme);

// ✅ 更高效: 订阅多个字段使用 shallow
const { user, theme } = useAppStore(
  (state) => ({ user: state.user, theme: state.theme }),
  shallow
);

// ✅ 最高效: 使用 subscribeWithSelector 监听特定变化
useEffect(() => {
  const unsubscribe = useAppStore.subscribe(
    (state) => state.user,
    (user) => {
      console.log('User changed:', user);
    }
  );
  return unsubscribe;
}, []);
```

---

## 附录 I: 完整的构建优化配置

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. 优化模块解析
config.resolver.blockList = [
  /\.git\/.*/,
  /\.svn\/.*/,
  /node_modules\/.*\/node_modules\/.*/,
];

// 2. 缓存配置
config.cacheStores = [
  require('metro-cache').FileStore({
    root: require('os').tmpdir() + '/metro-cache',
  }),
];

// 3. 转换器优化
config.transformer.minifierConfig = {
  compress: {
    drop_console: true,
    drop_debugger: true,
    global_defs: {
      __DEV__: false,
    },
    passes: 2,
  },
  mangle: {
    toplevel: true,
    properties: {
      regex: /^_/,
    },
  },
};

// 4. 资源优化
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// 5. 并行处理
config.maxWorkers = require('os').cpus().length;

module.exports = config;
```

---

## 附录 J: 性能监控仪表板

```typescript
// src/utils/performanceDashboard.ts
import { useState, useEffect } from 'react';
import { InteractionManager } from 'react-native';

interface PerformanceMetrics {
  fps: number;
  memory: number;
  jsHeapSize: number;
  bridgeCalls: number;
  renderCount: number;
}

export function usePerformanceMonitor(): PerformanceMetrics {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memory: 0,
    jsHeapSize: 0,
    bridgeCalls: 0,
    renderCount: 0,
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measure = () => {
      frameCount++;
      const now = performance.now();

      if (now - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (now - lastTime));
        frameCount = 0;
        lastTime = now;

        // 获取内存信息
        const memory = (global as any).performance?.memory;
        
        setMetrics({
          fps,
          memory: memory?.usedJSHeapSize || 0,
          jsHeapSize: memory?.totalJSHeapSize || 0,
          bridgeCalls: 0,
          renderCount: 0,
        });
      }

      animationId = requestAnimationFrame(measure);
    };

    animationId = requestAnimationFrame(measure);

    return () => cancelAnimationFrame(animationId);
  }, []);

  return metrics;
}

// 性能评分
export function calculatePerformanceScore(metrics: PerformanceMetrics): number {
  let score = 100;

  // FPS 扣分
  if (metrics.fps < 55) score -= 10;
  if (metrics.fps < 30) score -= 30;

  // 内存扣分 (超过 200MB)
  const memoryMB = metrics.memory / (1024 * 1024);
  if (memoryMB > 200) score -= 15;
  if (memoryMB > 300) score -= 25;

  return Math.max(0, score);
}
```

---

## 附录 K: 启动时间优化终极指南

| 优化策略 | 实施难度 | 收益 | 实施方法 |
|---------|---------|------|---------|
| **Hermes Bytecode** | 低 | ⭐⭐⭐⭐⭐ | 默认启用 |
| **延迟加载非关键模块** | 低 | ⭐⭐⭐⭐ | `React.lazy()` |
| **原生模块懒加载** | 中 | ⭐⭐⭐⭐ | TurboModules |
| **图片预加载策略** | 中 | ⭐⭐⭐ | 优先级队列 |
| **Bundle 拆分** | 中 | ⭐⭐⭐⭐ | 动态导入 |
| **原生启动优化** | 高 | ⭐⭐⭐⭐ | 延迟 SDK 初始化 |
| **Splash Screen 优化** | 低 | ⭐⭐⭐ | expo-splash-screen |
| **字体异步加载** | 低 | ⭐⭐⭐ | expo-font |
| **SQLite 预填充** | 中 | ⭐⭐⭐ | 预置数据库 |
| **代码预编译** | 高 | ⭐⭐⭐⭐ | Babel 缓存 |
