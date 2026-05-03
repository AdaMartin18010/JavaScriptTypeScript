---
title: "Expo Router 深度解析"
description: "Expo Router v3 文件系统路由、动态路由、深度链接、认证流程与 Modal 导航的完整实践指南"
date: 2026-05-01
tags: ["示例", "移动端", "Expo Router", "路由", "React Native", "导航"]
category: "examples"
---

# Expo Router 深度解析

> **版本信息**: Expo Router v3 | Expo SDK 52 | React Navigation 7 | File-based Routing
> **目标读者**: 希望掌握现代 React Native 路由方案、构建复杂导航流程的开发者

---

## 目录

1. [路由方案选型对比](#路由方案选型对比)
2. [Expo Router 核心概念](#expo-router-核心概念)
3. [文件系统路由约定](#文件系统路由约定)
4. [布局与嵌套路由](#布局与嵌套路由)
5. [动态路由与参数解析](#动态路由与参数解析)
6. [深度链接统一方案](#深度链接统一方案)
7. [认证流程与受保护路由](#认证流程与受保护路由)
8. [Modal Stack 与高级导航](#modal-stack-与高级导航)
9. [Web 适配与 SSR](#web-适配与-ssr)
10. [常见陷阱与解决方案](#常见陷阱与解决方案)

---

## 路由方案选型对比

### React Native 路由方案全景

| 方案 | 路由模型 | 类型安全 | 深度链接 | Web 支持 | 学习曲线 | 2026 推荐度 |
|-----|---------|---------|---------|---------|---------|------------|
| **Expo Router v3** | 文件系统 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 低 | ⭐⭐⭐⭐⭐ |
| **React Navigation 7** | 声明式 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 中 | ⭐⭐⭐⭐ |
| **React Native Navigation** | Native | ⭐⭐⭐ | ⭐⭐⭐ | ❌ | 高 | ⭐⭐⭐ |
| **React Router Native** | 声明式 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐ (Web 优先) |

### Expo Router vs React Navigation 决策矩阵

| 维度 | Expo Router v3 | React Navigation 7 | 建议 |
|-----|---------------|-------------------|------|
| **项目类型** | Expo 项目首选 | 裸 RN / 高度定制 | Expo 选 Expo Router |
| **路由配置方式** | 文件系统 | 代码声明 | 文件系统更直观 |
| **代码生成** | 自动生成类型 | 需手动定义 | Expo Router 减少样板 |
| **动态路由** | `[id].tsx` | `<Stack.Screen>` | 文件系统更自然 |
| **Web 共享** | 原生支持 | 需 react-native-web | Expo Router 完胜 |
| **嵌套深度** | 文件目录 | 组件嵌套 | 目录更直观 |
| **团队效率** | 高 (约定优于配置) | 中 | 大团队偏好 Expo Router |

**结论**: 对于使用 Expo SDK 52+ 的新项目，**Expo Router v3 是默认且最优的路由方案**。

---

## Expo Router 核心概念

### 架构概览

```
Expo Router 架构:
┌─────────────────────────────────────────────────────────────┐
│                      JavaScript Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ File System │─►│ Route Tree  │─►│ Typed Navigation    │  │
│  │  (app dir)  │  │  (Runtime)  │  │  (useRouter)        │  │
│  └─────────────┘  └──────┬──────┘  └─────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                   React Navigation 7                         │
│  ┌─────────────┐  ┌──────┴──────┐  ┌─────────────────────┐  │
│  │   Stack     │  │    Tab      │  │      Drawer         │  │
│  │  Navigator  │  │  Navigator  │  │    Navigator        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    ┌──────┴──────┐
                    │  Native OS   │
                    │  Navigation  │
                    └─────────────┘
```

### 核心 Hooks

```typescript
// useRouter - 导航控制
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  router.push('/profile/123');
  router.replace('/home');
  router.back();
  router.push({ pathname: '/post/[id]', params: { id: '456' } });
  router.push('/search?q=react+native');
  router.refresh();
  const canGoBack = router.canGoBack();
}
```

```typescript
// useLocalSearchParams - 获取路由参数
import { useLocalSearchParams } from 'expo-router';

function PostDetail() {
  const { id, sort } = useLocalSearchParams<{ id: string; sort?: string }>();
}
```

```typescript
// usePathname - 当前路径
import { usePathname } from 'expo-router';

function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);
}
```

```typescript
// useSegments - 路径段数组
import { useSegments } from 'expo-router';

function NavigationGuard() {
  const segments = useSegments();
  const isInAppGroup = segments[0] === '(app)';
}
```

---

## 文件系统路由约定

### 路由文件约定

```
app/                           # 路由根目录
├── _layout.tsx                # 根布局 (必需)
├── index.tsx                  # / (首页)
├── explore.tsx                # /explore
├── settings.tsx               # /settings
├── +not-found.tsx             # 404 页面
│
├── (auth)/                    # 路由组 (无 URL 前缀)
│   ├── _layout.tsx            # 认证布局
│   ├── login.tsx              # /login
│   ├── register.tsx           # /register
│   └── forgot-password.tsx    # /forgot-password
│
├── (app)/                     # 应用主路由组
│   ├── _layout.tsx            # Tab 导航布局
│   ├── index.tsx              # / (Tab 首页)
│   ├── explore.tsx            # /explore
│   ├── profile.tsx            # /profile
│   └── notifications.tsx      # /notifications
│
├── post/                      # 嵌套路由
│   ├── _layout.tsx            # 帖子详情布局
│   ├── index.tsx              # /post
│   └── [id].tsx               # /post/:id
│
├── user/                      # 动态路由
│   ├── [userId].tsx           # /user/:userId
│   └── [userId]/              # 嵌套动态路由
│       ├── posts.tsx          # /user/:userId/posts
│       └── followers.tsx      # /user/:userId/followers
│
└── [...unmatched].tsx         # 全局通配符路由 (兜底)
```

### 特殊文件约定

| 文件名模式 | 用途 | 示例 URL |
|-----------|------|---------|
| `index.tsx` | 目录默认路由 | `/` 或 `/post` |
| `[id].tsx` | 动态段 | `/post/123` |
| `[...slug].tsx` | 捕获所有段 | `/docs/a/b/c` |
| `[[...slug]].tsx` | 可选捕获所有 | `/docs` 或 `/docs/a` |
| `(group)` | 路由组 (无 URL 影响) | 分组布局 |
| `+html.tsx` | HTML 模板 (Web) | - |
| `+not-found.tsx` | 404 页面 | 任何未匹配路由 |
| `_layout.tsx` | 布局包装器 | 所有子路由 |

### 路由参数类型生成

```typescript
// 在 app.json 中启用
typeRoutes: true

import { Href, useRouter } from 'expo-router';

const validPath: Href = '/post/123';  // ✅ 类型安全
const invalidPath: Href = '/invalid'; // ❌ TypeScript 报错
```

---

## 布局与嵌套路由

### 根布局

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60 * 5 } },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#fff' },
              headerTintColor: '#007AFF',
              headerTitleStyle: { fontWeight: '600' },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false, animation: 'none' }} />
            <Stack.Screen name="post/[id]" options={{ title: '帖子详情', presentation: 'card' }} />
            <Stack.Screen name="+not-found" options={{ title: '页面未找到' }} />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 } });
```

### Tab 导航布局

```tsx
// app/(app)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'index': iconName = focused ? 'home' : 'home-outline'; break;
            case 'explore': iconName = focused ? 'compass' : 'compass-outline'; break;
            case 'notifications': iconName = focused ? 'notifications' : 'notifications-outline'; break;
            case 'profile': iconName = focused ? 'person' : 'person-outline'; break;
            default: iconName = 'help-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.background, borderTopColor: colors.border },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="explore" options={{ title: '探索' }} />
      <Tabs.Screen name="notifications" options={{ title: '通知', tabBarBadge: 3 }} />
      <Tabs.Screen name="profile" options={{ title: '我的' }} />
    </Tabs>
  );
}
```

### 认证布局

```tsx
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" options={{ headerShown: true, title: '注册账号' }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: true, title: '重置密码', presentation: 'modal' }} />
    </Stack>
  );
}
```

---

## 动态路由与参数解析

### 动态路由组件

```tsx
// app/post/[id].tsx
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { usePost } from '@hooks/usePosts';

export default function PostDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: post, isLoading, error } = usePost(id);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text>加载失败</Text>
        <Text style={styles.link} onPress={() => router.back()}>返回上一页</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: post.title }} />
      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.body}>{post.body}</Text>
      <Text style={styles.meta}>作者: {post.author.name} · {post.createdAt}</Text>
    </View>
  );
}
```

### 多段动态路由与捕获所有

```tsx
// app/user/[userId]/posts/[postId].tsx
import { useLocalSearchParams } from 'expo-router';

export default function UserPostDetail() {
  const { userId, postId } = useLocalSearchParams<{ userId: string; postId: string }>();
  return (
    <View>
      <Text>User: {userId}</Text>
      <Text>Post: {postId}</Text>
    </View>
  );
}
```

```tsx
// app/docs/[...slug].tsx
import { useLocalSearchParams } from 'expo-router';

export default function DocsPage() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();
  const path = slug?.join('/') || '';
  return <Text>Documentation Path: {path}</Text>;
}
```

---

## 深度链接统一方案

### 深度链接配置

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import * as Linking from 'expo-linking';

const linking = {
  prefixes: [
    Linking.createURL('/'),
    'https://jsts-example.com',
    'jsts-mobile-example://',
  ],
};

export default function RootLayout() {
  return <Stack linking={linking}>{/* ... */}</Stack>;
}
```

### 原生深度链接配置

```json
// app.json
{
  "expo": {
    "scheme": "jsts-mobile-example",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [{ "scheme": "https", "host": "jsts-example.com", "pathPrefix": "/" }],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:jsts-example.com"]
    }
  }
}
```

### 深度链接处理

```tsx
// hooks/useDeepLink.ts
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
    const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => subscription.remove();
  }, []);

  function handleDeepLink(url: string) {
    const { path, queryParams } = Linking.parse(url);
    switch (path) {
      case 'post':
        if (queryParams?.id) router.push(`/post/${queryParams.id}`);
        break;
      case 'user':
        if (queryParams?.id) router.push(`/user/${queryParams.id}`);
        break;
      case 'reset-password':
        if (queryParams?.token) {
          router.push({ pathname: '/(auth)/forgot-password', params: { token: queryParams.token as string } });
        }
        break;
      default:
        router.push('/+not-found');
    }
  }
}
```

---

## 认证流程与受保护路由

### 认证状态管理

```tsx
// providers/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@stores/authStore';

const AuthContext = createContext({ isAuthenticated: false, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, initialize } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    initialize().finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    const isAuthenticated = !!token;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [token, segments, isLoading]);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 登录页面

```tsx
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@stores/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(email, password);
      router.replace('/(app)');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <Text>登录</Text>
      <TextInput placeholder="邮箱" value={email} onChangeText={setEmail} />
      <TextInput placeholder="密码" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
        <Text>{isLoading ? '登录中...' : '登录'}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 受保护的 API 路由

```tsx
// app/(app)/settings/_layout.tsx
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@stores/authStore';

export default function SettingsLayout() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => !!state.token);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/(auth)/login');
  }, [isAuthenticated]);

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: '设置' }} />
      <Stack.Screen name="profile" options={{ title: '个人资料' }} />
      <Stack.Screen name="security" options={{ title: '安全' }} />
    </Stack>
  );
}
```

---

## Modal Stack 与高级导航

### Modal 路由

```tsx
// app/(app)/_layout.tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal/create-post" options={{ presentation: 'modal', animation: 'slide_from_bottom', headerShown: true, title: '创建帖子' }} />
      <Stack.Screen name="modal/image-preview" options={{ presentation: 'fullScreenModal', headerShown: false, animation: 'fade' }} />
      <Stack.Screen name="modal/sheet" options={{ presentation: 'transparentModal', animation: 'slide_from_bottom', contentStyle: { backgroundColor: 'transparent' } }} />
    </Stack>
  );
}
```

### 底部 Sheet 实现

```tsx
// app/(app)/modal/sheet.tsx
import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BottomSheetModal() {
  const router = useRouter();
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => { if (event.translationY > 0) translateY.value = event.translationY; })
    .onEnd((event) => {
      if (event.translationY > SCREEN_HEIGHT * 0.2) {
        translateY.value = withSpring(SCREEN_HEIGHT, {}, () => runOnJS(router.back)());
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View>
      <TouchableOpacity onPress={() => router.back()} />
      <GestureDetector gesture={gesture}>
        <Animated.View style={animatedStyle}>
          <Text>选项</Text>
          <TouchableOpacity><Text>分享</Text></TouchableOpacity>
          <TouchableOpacity><Text>收藏</Text></TouchableOpacity>
          <TouchableOpacity><Text>举报</Text></TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
```

---

## Web 适配与 SSR

### 响应式路由

```tsx
// app/(app)/index.tsx
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handlePostPress = (postId: string) => {
    if (Platform.OS === 'web') {
      window.open(`/post/${postId}`, '_blank');
    } else {
      router.push(`/post/${postId}`);
    }
  };

  return <Feed onPostPress={handlePostPress} />;
}
```

### 服务端渲染 (SSR)

```tsx
// app/+html.tsx
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 常见陷阱与解决方案

### 陷阱 1: 路由参数类型不匹配

**现象**: `useLocalSearchParams` 返回的类型与实际 URL 不一致。

**解决方案**:

```typescript
const { id } = useLocalSearchParams<{ id: string }>();
if (!id || typeof id !== 'string') {
  return <Redirect href="/+not-found" />;
}
```

### 陷阱 2: 布局重渲染导致导航状态丢失

**现象**: 在 `_layout.tsx` 中执行副作用导致子路由重载。

**解决方案**:

```tsx
// ❌ 错误: 在布局中直接发起请求
export default function Layout() {
  const { data } = useQuery(['user'], fetchUser);
  return <Stack />;
}

// ✅ 正确: 使用 Provider 模式
export default function Layout() {
  return (
    <UserProvider>
      <Stack />
    </UserProvider>
  );
}
```

### 陷阱 3: 深度链接未正确处理

**现象**: 应用通过深度链接打开后，导航栈状态异常。

**解决方案**:

```tsx
<Stack initialRouteName="(app)">
  <Stack.Screen name="(app)" />
  <Stack.Screen name="(auth)" />
</Stack>
```

### 陷阱 4: Modal 内导航异常

**现象**: 在 Modal 中 `router.push` 没有正确导航。

**解决方案**:

```tsx
router.push('../other-modal');
router.push('/modal/other');
```

### 陷阱 5: Web 刷新 404

**现象**: Web 模式下直接访问 `/post/123` 刷新后 404。

**解决方案**:

```javascript
module.exports = {
  trailingSlash: true,
  async rewrites() {
    return [
      { source: '/post/:id', destination: '/post/[id]' },
    ];
  },
};
```

---

## 总结

Expo Router v3 通过文件系统路由、类型安全的导航 API 和原生深度链接支持，为 React Native 应用提供了现代化的路由解决方案。

**关键要点**:

1. **文件即路由**: 直观的路由定义方式，自动生成导航类型
2. **动态路由**: `[id].tsx` 和 `[...slug].tsx` 满足各种参数需求
3. **布局复用**: `_layout.tsx` 实现嵌套导航结构
4. **认证路由**: 结合 Zustand 实现受保护的导航流程
5. **深度链接**: 统一的 URL 方案支持 Native 和 Web
6. **Modal 支持**: 内置多种呈现方式

### 导航模式速查表

| 场景 | 代码 | 行为 |
|-----|------|------|
| 普通跳转 | `router.push('/post/123')` | 堆栈压入新页面 |
| 替换跳转 | `router.replace('/home')` | 替换当前页面 |
| 返回 | `router.back()` | 返回上一页 |
| 带参数跳转 | `router.push({ pathname: '/post/[id]', params: { id: '123' } })` | 动态路由 |
| 带查询参数 | `router.push('/search?q=test')` | URL 查询参数 |
| 刷新 | `router.refresh()` | 重新获取数据 |
| 重定向 | `router.replace('/(auth)/login')` | 认证跳转 |
| dismiss | `router.dismiss()` | 关闭 Modal |

---

## 参考引用

1. [Expo Router 官方文档](https://docs.expo.dev/router/introduction/) — Expo 团队维护的文件系统路由指南，包含 v3 新特性与迁移说明
2. [React Navigation 7](https://reactnavigation.org/docs/getting-started/) — React Native 导航底层库官方文档，理解 Stack/Tab/Drawer Navigator 原理
3. [Expo Linking 深度链接](https://docs.expo.dev/guides/linking/) — 统一深度链接方案，涵盖 iOS Universal Links 与 Android App Links 配置
4. [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) — Software Mansion 出品的高性能动画库，用于 Modal 与转场动画
5. [Expo Router Testing Library](https://docs.expo.dev/router/reference/testing/) — 路由单元测试与 E2E 测试官方指南，包含 `renderRouter` API
