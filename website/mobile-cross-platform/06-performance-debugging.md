# 06. 性能优化与调试

> 启动时间、渲染帧率、内存管理——移动端性能的三座大山。

---

## 启动优化

### Hermes 字节码预编译

```bash
# 发布构建自动启用
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle
```

### 懒加载与代码分割

```tsx
import { Suspense, lazy } from 'react';

const HeavyScreen = lazy(() => import('./HeavyScreen'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyScreen />
    </Suspense>
  );
}
```

### 启动时间监控

```tsx
import { StartupTrace } from 'react-native-startup-trace';

// 标记关键阶段
StartupTrace.mark('js_bundle_loaded');
StartupTrace.mark('first_render_complete');
```

---

## 渲染性能

### FlatList 优化

```tsx
import { FlatList } from 'react-native';

<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => <ItemCard data={item} />}
  initialNumToRender={10}        // 首屏渲染数量
  maxToRenderPerBatch={10}       // 每批渲染数量
  windowSize={5}                 // 视口外缓存范围
  removeClippedSubviews={true}   // 卸载屏幕外组件
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### FlashList：FlatList 的平替

```tsx
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  renderItem={({ item }) => <ItemCard data={item} />}
  estimatedItemSize={200}  // 关键：预估项高度
/>
```

> FlashList 通过回收机制和更智能的布局复用，在相同数据量下帧率提升 30%+。

---

## 内存管理

### 图片优化

```tsx
import { Image } from 'expo-image';  // 或 react-native-fast-image

<Image
  source={{ uri: 'https://example.com/photo.jpg' }}
  contentFit="cover"
  cachePolicy="memory-disk"   // 多级缓存
  transition={200}
/>
```

### 避免内存泄漏

```tsx
import { useEffect, useRef } from 'react';

function useSafeAsync() {
  const isMounted = useRef(true);

  useEffect(() => {
    return () => { isMounted.current = false; };
  }, []);

  return isMounted;
}

// 使用
const isMounted = useSafeAsync();
useEffect(() => {
  fetchData().then(data => {
    if (isMounted.current) setData(data);
  });
}, []);
```

---

## 调试工具链

| 工具 | 用途 |
|------|------|
| **Flipper** | 网络请求、数据库、日志、布局检查 |
| **React DevTools** | 组件树、Profiler 性能分析 |
| **Hermes Profiler** | JS 执行火焰图 |
| **Xcode Instruments** | iOS 原生性能（Time Profiler、Allocations） |
| **Android Studio Profiler** | CPU、内存、网络、电量 |
| **Repack** | 模块联邦、微前端、热更新调试 |

### Flipper 插件推荐

```bash
# 网络监控
idb flipper-plugin-network

# 数据库查看
idb flipper-plugin-databases

# 共享偏好设置
idb flipper-plugin-shared-preferences
```

---

## 性能指标基线

| 指标 | 优秀 | 合格 | 需优化 |
|------|------|------|--------|
| 冷启动时间 (TTR) | &lt; 1.5s | &lt; 2.5s | &gt; 3s |
| 列表滚动 FPS | 58+ | 50+ | &lt; 45 |
| 内存占用 (中档机) | &lt; 150MB | &lt; 200MB | &gt; 250MB |
| 包体积 | &lt; 30MB | &lt; 50MB | &gt; 80MB |
| JS Bundle 大小 | &lt; 2MB | &lt; 4MB | &gt; 6MB |
