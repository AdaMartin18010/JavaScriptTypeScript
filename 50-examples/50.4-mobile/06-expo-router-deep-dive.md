# 06 - Expo Router v3 深度实践

> **版本信息**: Expo Router v3 | Expo SDK 52 | React Navigation 7 | File-based Routing
> **目标读者**: 希望掌握现代 React Native 路由方案、构建复杂导航流程的开发者
> **阅读时长**: 约 50 分钟

---

## 目录

1. [路由方案选型对比](#一路由方案选型对比)
2. [Expo Router 核心概念](#二expo-router-核心概念)
3. [文件系统路由约定](#三文件系统路由约定)
4. [布局与嵌套路由](#四布局与嵌套路由)
5. [动态路由与参数解析](#五动态路由与参数解析)
6. [深度链接统一方案](#六深度链接统一方案)
7. [认证流程与受保护路由](#七认证流程与受保护路由)
8. [Modal Stack 与高级导航](#八modal-stack-与高级导航)
9. [Web 适配与 SSR](#九web-适配与-ssr)
10. [常见陷阱与解决方案](#十常见陷阱与解决方案)

---

## 一、路由方案选型对比

### 1.1 React Native 路由方案全景

| 方案 | 路由模型 | 类型安全 | 深度链接 | Web 支持 | 学习曲线 | 2026 推荐度 |
|-----|---------|---------|---------|---------|---------|------------|
| **Expo Router v3** | 文件系统 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 低 | ⭐⭐⭐⭐⭐ |
| **React Navigation 7** | 声明式 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | 中 | ⭐⭐⭐⭐ |
| **React Navigation 6** | 声明式 | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 中 | ⭐⭐ (遗留) |
| **React Native Navigation** | Native | ⭐⭐⭐ | ⭐⭐⭐ | ❌ | 高 | ⭐⭐⭐ |
| **React Router Native** | 声明式 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | 低 | ⭐⭐ (Web 优先) |
| **Taron 路由** | 文件系统 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | 低 | ⭐⭐ (Taro 生态) |

### 1.2 Expo Router vs React Navigation 决策矩阵

| 维度 | Expo Router v3 | React Navigation 7 | 建议 |
|-----|---------------|-------------------|------|
| **项目类型** | Expo 项目首选 | 裸 RN / 高度定制 | Expo 选 Expo Router |
| **路由配置方式** | 文件系统 | 代码声明 | 文件系统更直观 |
| **代码生成** | 自动生成类型 | 需手动定义 | Expo Router 减少样板 |
| **动态路由** | `[id].tsx` | `<Stack.Screen>` | 文件系统更自然 |
| **布局复用** | `_layout.tsx` | 自定义 Navigator | 两者相当 |
| **Web 共享** | 原生支持 | 需 react-native-web | Expo Router 完胜 |
| **嵌套深度** | 文件目录 | 组件嵌套 | 目录更直观 |
| **团队效率** | 高 (约定优于配置) | 中 | 大团队偏好 Expo Router |
| **迁移成本** | 从文件开始 | 从代码重构 | 新项目无差异 |

**结论**: 对于使用 Expo SDK 52+ 的新项目，**Expo Router v3 是默认且最优的路由方案**。它与文件系统深度集成，自动生成类型安全的导航 API，同时原生支持 Web 和深度链接。

---

## 二、Expo Router 核心概念

### 2.1 架构概览

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

### 2.2 核心 Hooks

```typescript
// useRouter - 导航控制
import { useRouter } from 'expo-router';

function MyComponent() {
  const router = useRouter();
  
  // 导航到路由
  router.push('/profile/123');
  
  // 替换当前路由
  router.replace('/home');
  
  // 返回上一页
  router.back();
  
  // 带参数导航
  router.push({ pathname: '/post/[id]', params: { id: '456' } });
  
  // 导航并携带查询参数
  router.push('/search?q=react+native');
  
  // 刷新当前路由
  router.refresh();
  
  // 判断是否可以返回
  const canGoBack = router.canGoBack();
}
```

```typescript
// useLocalSearchParams - 获取路由参数
import { useLocalSearchParams } from 'expo-router';

function PostDetail() {
  // URL: /post/123?sort=recent
  const { id, sort } = useLocalSearchParams<{ id: string; sort?: string }>();
  
  console.log(id);    // "123"
  console.log(sort);  // "recent" | undefined
}
```

```typescript
// useGlobalSearchParams - 获取全局路由参数
import { useGlobalSearchParams } from 'expo-router';

// 在深层嵌套组件中获取当前路由参数
const params = useGlobalSearchParams();
```

```typescript
// usePathname - 当前路径
import { usePathname } from 'expo-router';

function Breadcrumb() {
  const pathname = usePathname(); // "/settings/profile"
  
  const segments = pathname.split('/').filter(Boolean);
  // ['settings', 'profile']
}
```

```typescript
// useSegments - 路径段数组
import { useSegments } from 'expo-router';

function NavigationGuard() {
  const segments = useSegments(); // ['(app)', 'settings', 'profile']
  
  // 判断是否在特定路由组
  const isInAppGroup = segments[0] === '(app)';
}
```

---

## 三、文件系统路由约定

### 3.1 路由文件约定

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

### 3.2 特殊文件约定

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

### 3.3 路由参数类型生成

Expo Router 支持根据文件系统自动生成 TypeScript 类型：

```typescript
// 在 app.json 中启用
typeRoutes: true

// 自动生成的类型 (node_modules/.expo/types/router.d.ts)
// 可使用以下类型：
import { Href, useRouter } from 'expo-router';

// Href 类型会自动包含所有有效的路由路径
const validPath: Href = '/post/123';  // ✅ 类型安全
const invalidPath: Href = '/invalid'; // ❌ TypeScript 报错
```

---

## 四、布局与嵌套路由

### 4.1 根布局

```tsx
// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
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
            <Stack.Screen
              name="(app)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)"
              options={{ headerShown: false, animation: 'none' }}
            />
            <Stack.Screen
              name="post/[id]"
              options={{
                title: '帖子详情',
                presentation: 'card',
              }}
            />
            <Stack.Screen
              name="+not-found"
              options={{ title: '页面未找到' }}
            />
          </Stack>
          <StatusBar style="auto" />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
```

### 4.2 Tab 导航布局

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
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ title: '首页' }} />
      <Tabs.Screen name="explore" options={{ title: '探索' }} />
      <Tabs.Screen
        name="notifications"
        options={{
          title: '通知',
          tabBarBadge: 3,
          tabBarBadgeStyle: { backgroundColor: '#FF3B30' },
        }}
      />
      <Tabs.Screen name="profile" options={{ title: '我的' }} />
    </Tabs>
  );
}
```

### 4.3 认证布局

```tsx
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen
        name="register"
        options={{
          headerShown: true,
          title: '注册账号',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          headerShown: true,
          title: '重置密码',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
```

### 4.4 嵌套布局

```tsx
// app/post/_layout.tsx
import { Stack } from 'expo-router';

export default function PostLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#f8f8f8' },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: '全部帖子',
          headerSearchBarOptions: {
            placeholder: '搜索帖子...',
          },
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: '帖子详情',
          headerBackTitle: '返回',
        }}
      />
    </Stack>
  );
}
```

---

## 五、动态路由与参数解析

### 5.1 动态路由组件

```tsx
// app/post/[id].tsx
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { usePost } from '@hooks/usePosts';
import { OptimizedImage } from '@components/OptimizedImage';

export default function PostDetailScreen(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: post, isLoading, error } = usePost(id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View style={styles.center}>
        <Text>加载失败</Text>
        <Text
          style={styles.link}
          onPress={() => router.back()}
        >
          返回上一页
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: post.title }} />
      
      <OptimizedImage
        source={post.imageUrl}
        style={styles.image}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.body}>{post.body}</Text>
        <Text style={styles.meta}>
          作者: {post.author.name} · {post.createdAt}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  content: { padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  body: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 16 },
  meta: { fontSize: 14, color: '#999' },
  link: { color: '#007AFF', marginTop: 16 },
});
```

### 5.2 多段动态路由

```tsx
// app/user/[userId]/posts/[postId].tsx
import { useLocalSearchParams } from 'expo-router';

export default function UserPostDetail() {
  const { userId, postId } = useLocalSearchParams<{
    userId: string;
    postId: string;
  }>();

  // URL: /user/123/posts/456
  // userId = "123", postId = "456"

  return (
    <View>
      <Text>User: {userId}</Text>
      <Text>Post: {postId}</Text>
    </View>
  );
}
```

### 5.3 捕获所有路由

```tsx
// app/docs/[...slug].tsx
import { useLocalSearchParams } from 'expo-router';

export default function DocsPage() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();
  
  // URL: /docs/getting-started/installation
  // slug = ['getting-started', 'installation']
  
  const path = slug?.join('/') || '';
  
  return (
    <View>
      <Text>Documentation Path: {path}</Text>
    </View>
  );
}
```

### 5.4 可选捕获所有

```tsx
// app/blog/[[...slug]].tsx
import { useLocalSearchParams } from 'expo-router';

export default function BlogPage() {
  const { slug } = useLocalSearchParams<{ slug?: string[] }>();
  
  // URL: /blog
  // slug = undefined
  
  // URL: /blog/2024/01/my-post
  // slug = ['2024', '01', 'my-post']

  return (
    <View>
      {slug ? (
        <Text>Post: {slug.join('/')}</Text>
      ) : (
        <Text>Blog Home</Text>
      )}
    </View>
  );
}
```

---

## 六、深度链接统一方案

### 6.1 深度链接配置

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
  return (
    <Stack
      linking={linking}
      // ...
    />
  );
}
```

### 6.2 原生深度链接配置

```json
// app.json
{
  "expo": {
    "scheme": "jsts-mobile-example",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "https",
              "host": "jsts-example.com",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": [
        "applinks:jsts-example.com"
      ]
    }
  }
}
```

### 6.3 深度链接处理

```tsx
// hooks/useDeepLink.ts
import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

export function useDeepLink() {
  const router = useRouter();

  useEffect(() => {
    // 处理应用启动时的链接
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // 处理应用运行时的链接
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => subscription.remove();
  }, []);

  function handleDeepLink(url: string) {
    const { path, queryParams } = Linking.parse(url);
    
    switch (path) {
      case 'post':
        if (queryParams?.id) {
          router.push(`/post/${queryParams.id}`);
        }
        break;
      case 'user':
        if (queryParams?.id) {
          router.push(`/user/${queryParams.id}`);
        }
        break;
      case 'reset-password':
        if (queryParams?.token) {
          router.push({
            pathname: '/(auth)/forgot-password',
            params: { token: queryParams.token as string },
          });
        }
        break;
      default:
        router.push('/+not-found');
    }
  }
}
```

---

## 七、认证流程与受保护路由

### 7.1 认证状态管理

```tsx
// providers/AuthProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@stores/authStore';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, initialize } = useAuthStore();
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
      // 未认证且不在认证页面 → 重定向到登录
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // 已认证但在认证页面 → 重定向到首页
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

### 7.2 登录页面

```tsx
// app/(auth)/login.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
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
    <View style={styles.container}>
      <Text style={styles.title}>登录</Text>
      
      <TextInput
        style={styles.input}
        placeholder="邮箱"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        style={styles.input}
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? '登录中...' : '登录'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
        <Text style={styles.link}>没有账号？立即注册</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 32 },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  link: { color: '#007AFF', textAlign: 'center', marginTop: 16 },
});
```

### 7.3 受保护的 API 路由

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
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
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

## 八、Modal Stack 与高级导航

### 8.1 Modal 路由

```tsx
// app/(app)/_layout.tsx
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      
      {/* Modal 路由 */}
      <Stack.Screen
        name="modal/create-post"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerShown: true,
          title: '创建帖子',
        }}
      />
      
      <Stack.Screen
        name="modal/image-preview"
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
          animation: 'fade',
        }}
      />
      
      {/* 底部 Sheet */}
      <Stack.Screen
        name="modal/sheet"
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
    </Stack>
  );
}
```

### 8.2 底部 Sheet 实现

```tsx
// app/(app)/modal/sheet.tsx
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BottomSheetModal() {
  const router = useRouter();
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > SCREEN_HEIGHT * 0.2) {
        translateY.value = withSpring(SCREEN_HEIGHT, {}, () => {
          runOnJS(router.back)();
        });
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        onPress={() => router.back()}
      />
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.sheet, animatedStyle]}>
          <View style={styles.handle} />
          <Text style={styles.title}>选项</Text>
          <TouchableOpacity style={styles.option}>
            <Text>分享</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Text>收藏</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option}>
            <Text style={{ color: '#FF3B30' }}>举报</Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  option: {
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
});
```

### 8.3 共享元素过渡 (Advanced)

```tsx
// 使用 react-navigation-shared-element
import { createSharedElementStackNavigator } from 'react-navigation-shared-element';
import { TransitionPresets } from '@react-navigation/stack';

const Stack = createSharedElementStackNavigator();

function SharedElementLayout() {
  return (
    <Stack.Navigator
      screenOptions={{
        gestureEnabled: false,
        ...TransitionPresets.ModalPresentationIOS,
      }}
    >
      <Stack.Screen name="Feed" component={FeedScreen} />
      <Stack.Screen
        name="PostDetail"
        component={PostDetailScreen}
        sharedElements={(route) => {
          const { id } = route.params;
          return [`post.${id}.image`, `post.${id}.title`];
        }}
      />
    </Stack.Navigator>
  );
}

// 在组件中使用 sharedElementId
// FeedScreen.tsx
<OptimizedImage
  source={post.imageUrl}
  style={styles.image}
  sharedTransitionTag={`post.${post.id}.image`}
/>

// PostDetailScreen.tsx
<OptimizedImage
  source={post.imageUrl}
  style={styles.heroImage}
  sharedTransitionTag={`post.${post.id}.image`}
/>
```

---

## 九、Web 适配与 SSR

### 9.1 Expo Router Web 配置

```javascript
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Web 支持
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'web.js',
  'web.ts',
  'web.tsx',
];

module.exports = config;
```

### 9.2 响应式路由

```tsx
// app/(app)/index.tsx
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  const handlePostPress = (postId: string) => {
    if (Platform.OS === 'web') {
      // Web: 在新标签页打开
      window.open(`/post/${postId}`, '_blank');
    } else {
      // Native: 使用路由导航
      router.push(`/post/${postId}`);
    }
  };

  return <Feed onPostPress={handlePostPress} />;
}
```

### 9.3 服务端渲染 (SSR)

```tsx
// app/+html.tsx
import { ScrollViewStyleReset } from 'expo-router/html';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 十、常见陷阱与解决方案

### 陷阱 1: 路由参数类型不匹配

**现象**: `useLocalSearchParams` 返回的类型与实际 URL 不一致。

**解决方案**:
```typescript
// 始终使用泛型指定参数类型
const { id } = useLocalSearchParams<{ id: string }>();

// 添加运行时校验
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
  const { data } = useQuery(['user'], fetchUser); // 导致子路由重渲染
  
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
// 使用 initialRouteName 确保正确的初始路由
<Stack initialRouteName="(app)">
  <Stack.Screen name="(app)" />
  <Stack.Screen name="(auth)" />
</Stack>
```

### 陷阱 4: Modal 内导航异常

**现象**: 在 Modal 中 `router.push` 没有正确导航。

**解决方案**:
```tsx
// Modal 内使用相对路径
router.push('../other-modal');

// 或使用绝对路径
router.push('/modal/other');
```

### 陷阱 5: Web 刷新 404

**现象**: Web 模式下直接访问 `/post/123` 刷新后 404。

**解决方案**:
```javascript
// next.config.js 或 web 服务器配置
module.exports = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/post/:id',
        destination: '/post/[id]',
      },
    ];
  },
};
```

### 陷阱 6: 路由组导致路径混乱

**现象**: `(app)` 和 `(auth)` 组之间的导航行为不符合预期。

**解决方案**:
```tsx
// 使用 replace 切换路由组
router.replace('/(auth)/login');

// 确保布局正确嵌套
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(app)" options={{ headerShown: false }} />
  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
</Stack>
```

---

## 总结

Expo Router v3 通过文件系统路由、类型安全的导航 API 和原生深度链接支持，为 React Native 应用提供了现代化的路由解决方案。它与 Expo SDK 52 深度集成，支持 Web 和移动端共享同一路由定义。

**关键要点**:

1. **文件即路由**: 直观的路由定义方式，自动生成导航类型
2. **动态路由**: `[id].tsx` 和 `[...slug].tsx` 满足各种参数需求
3. **布局复用**: `_layout.tsx` 实现嵌套导航结构
4. **认证路由**: 结合 Zustand 实现受保护的导航流程
5. **深度链接**: 统一的 URL 方案支持 Native 和 Web
6. **Modal 支持**: 内置多种呈现方式 (modal, fullScreenModal, transparentModal)

至此，本系列文档已完整覆盖现代 React Native 移动端开发的各个核心领域。建议结合实际项目需求，深入研读对应章节并在 `expo-app/` 示例项目中进行实践验证。


---

## 附录 A: 完整的认证路由守卫实现

### A.1 基于路由组的认证系统

```tsx
// app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@stores/authStore';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const segments = useSegments();
  const router = useRouter();
  const { token, isLoading, initializeAuth } = useAuthStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeAuth().finally(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isAuthenticated = !!token;

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [token, segments, isReady]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(app)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootLayoutNav />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
```

### A.2 受保护路由 Hook

```typescript
// hooks/useProtectedRoute.ts
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@stores/authStore';

interface UseProtectedRouteOptions {
  requireAuth?: boolean;
  requireGuest?: boolean;
  fallback?: string;
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
  const { requireAuth = true, requireGuest = false, fallback } = options;
  const router = useRouter();
  const segments = useSegments();
  const { token, isLoading } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    const isAuthenticated = !!token;
    const currentPath = segments.join('/');

    // 需要登录但未登录
    if (requireAuth && !isAuthenticated) {
      const loginPath = fallback || '/(auth)/login';
      if (!currentPath.includes('auth')) {
        router.replace(loginPath as any);
      }
      return;
    }

    // 需要访客身份但已登录
    if (requireGuest && isAuthenticated) {
      const homePath = fallback || '/(app)';
      if (currentPath.includes('auth')) {
        router.replace(homePath as any);
      }
      return;
    }
  }, [token, isLoading, segments, requireAuth, requireGuest, fallback]);

  return {
    isAuthenticated: !!token,
    isLoading,
  };
}

// 使用示例
// app/(app)/settings/admin.tsx
import { useProtectedRoute } from '@hooks/useProtectedRoute';

export default function AdminSettings() {
  useProtectedRoute({ requireAuth: true });

  // 只有登录用户能访问
  return <AdminPanel />;
}

// app/(auth)/login.tsx
import { useProtectedRoute } from '@hooks/useProtectedRoute';

export default function LoginScreen() {
  useProtectedRoute({ requireGuest: true });

  // 只有未登录用户能访问
  return <LoginForm />;
}
```

### A.3 基于角色的路由访问控制

```typescript
// hooks/useRoleGuard.ts
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@stores/authStore';

type UserRole = 'user' | 'moderator' | 'admin' | 'superadmin';

const roleHierarchy: Record<UserRole, number> = {
  user: 1,
  moderator: 2,
  admin: 3,
  superadmin: 4,
};

export function useRoleGuard(minimumRole: UserRole) {
  const router = useRouter();
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }

    const userRoleLevel = roleHierarchy[user?.role as UserRole] || 0;
    const requiredLevel = roleHierarchy[minimumRole];

    if (userRoleLevel < requiredLevel) {
      router.replace('/(app)/unauthorized');
    }
  }, [user, token, minimumRole]);

  return {
    hasAccess: !!user && (roleHierarchy[user.role as UserRole] || 0) >= roleHierarchy[minimumRole],
    userRole: user?.role,
  };
}

// 使用示例
// app/(app)/admin/dashboard.tsx
export default function AdminDashboard() {
  const { hasAccess } = useRoleGuard('admin');

  if (!hasAccess) return null;

  return <DashboardContent />;
}
```

---

## 附录 B: 完整的深度链接与通知路由系统

### B.1 深度链接处理器

```typescript
// utils/deepLinkHandler.ts
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export interface DeepLinkRoute {
  pattern: RegExp;
  handler: (params: Record<string, string>) => string | { pathname: string; params?: Record<string, string> };
  requireAuth?: boolean;
}

const deepLinkRoutes: DeepLinkRoute[] = [
  {
    pattern: /^\/post\/(\w+)$/,
    handler: (params) => `/post/${params[0]}`,
  },
  {
    pattern: /^\/user\/(\w+)$/,
    handler: (params) => `/user/${params[0]}`,
  },
  {
    pattern: /^\/user\/(\w+)\/posts$/,
    handler: (params) => `/user/${params[0]}/posts`,
  },
  {
    pattern: /^\/settings\/(\w+)$/,
    handler: (params) => `/settings/${params[0]}`,
    requireAuth: true,
  },
  {
    pattern: /^\/reset-password$/,
    handler: (params) => ({
      pathname: '/(auth)/forgot-password',
      params: { token: params.token },
    }),
  },
  {
    pattern: /^\/invite\/(\w+)$/,
    handler: (params) => ({
      pathname: '/(auth)/register',
      params: { inviteCode: params[0] },
    }),
  },
];

export function useDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleUrl = (url: string) => {
      const parsed = Linking.parse(url);
      const path = parsed.path || '';
      const queryParams = parsed.queryParams || {};

      for (const route of deepLinkRoutes) {
        const match = path.match(route.pattern);
        if (match) {
          const params: Record<string, string> = {};
          match.slice(1).forEach((value, index) => {
            params[index.toString()] = value;
          });

          // 合并查询参数
          Object.assign(params, queryParams);

          const result = route.handler(params);

          if (typeof result === 'string') {
            router.push(result as any);
          } else {
            router.push(result as any);
          }
          return;
        }
      }

      // 未匹配到路由
      console.warn('Unhandled deep link:', url);
      router.push('/+not-found');
    };

    // 处理启动时的链接
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    // 监听应用运行时的链接
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleUrl(url);
    });

    return () => subscription.remove();
  }, []);
}
```

### B.2 推送通知路由

```typescript
// utils/notificationHandler.ts
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

interface NotificationData {
  type: 'post' | 'message' | 'follow' | 'system';
  targetId?: string;
  targetScreen?: string;
  params?: Record<string, string>;
}

export function useNotificationHandler() {
  const router = useRouter();

  useEffect(() => {
    // 配置通知行为
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // 处理通知点击
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data as NotificationData;

      switch (data.type) {
        case 'post':
          if (data.targetId) {
            router.push(`/post/${data.targetId}`);
          }
          break;
        case 'message':
          if (data.targetId) {
            router.push(`/messages/${data.targetId}`);
          }
          break;
        case 'follow':
          if (data.targetId) {
            router.push(`/user/${data.targetId}`);
          }
          break;
        case 'system':
          if (data.targetScreen) {
            router.push(data.targetScreen as any);
          }
          break;
      }
    };

    // 监听通知点击
    const subscription = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => subscription.remove();
  }, []);
}

// 发送本地通知测试
export async function sendLocalNotification(data: NotificationData) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '新消息',
      body: '您有一条新消息',
      data,
    },
    trigger: null, // 立即发送
  });
}
```

---

## 附录 C: Expo Router 与状态管理集成

### C.1 Zustand + Expo Router 状态同步

```typescript
// stores/navigationStore.ts
import { create } from 'zustand';

interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  routeHistory: string[];
  setCurrentRoute: (route: string) => void;
  canGoBack: boolean;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentRoute: '/',
  previousRoute: null,
  routeHistory: ['/'],

  setCurrentRoute: (route) => {
    const state = get();
    set({
      previousRoute: state.currentRoute,
      currentRoute: route,
      routeHistory: [...state.routeHistory.slice(-9), route],
      canGoBack: state.routeHistory.length > 1,
    });
  },

  get canGoBack() {
    return get().routeHistory.length > 1;
  },
}));

// 路由追踪组件
// components/RouteTracker.tsx
import { usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useNavigationStore } from '@stores/navigationStore';

export function RouteTracker() {
  const pathname = usePathname();
  const setCurrentRoute = useNavigationStore((state) => state.setCurrentRoute);

  useEffect(() => {
    setCurrentRoute(pathname);
  }, [pathname]);

  return null;
}

// 在根布局中使用
// app/_layout.tsx
export default function RootLayout() {
  return (
    <>
      <RouteTracker />
      <Stack>...</Stack>
    </>
  );
}
```

### C.2 查询参数同步

```typescript
// hooks/useSyncedSearchParams.ts
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export function useSyncedSearchParams<T extends Record<string, string>>() {
  const params = useLocalSearchParams<T>();
  const router = useRouter();
  const [localParams, setLocalParams] = useState<T>(params);

  useEffect(() => {
    setLocalParams(params);
  }, [params]);

  const updateParams = useCallback(
    (updates: Partial<T>) => {
      const newParams = { ...localParams, ...updates };
      setLocalParams(newParams);

      // 同步到 URL
      router.setParams(newParams as Record<string, string>);
    },
    [localParams, router]
  );

  const removeParams = useCallback(
    (keys: Array<keyof T>) => {
      const newParams = { ...localParams };
      keys.forEach((key) => delete newParams[key]);
      setLocalParams(newParams);
      router.setParams(newParams as Record<string, string>);
    },
    [localParams, router]
  );

  return {
    params: localParams,
    updateParams,
    removeParams,
  };
}

// 使用示例
// app/explore.tsx
export default function ExploreScreen() {
  const { params, updateParams } = useSyncedSearchParams<{
    q?: string;
    category?: string;
    sort?: string;
  }>();

  const handleSearch = (query: string) => {
    updateParams({ q: query });
  };

  const handleCategoryChange = (category: string) => {
    updateParams({ category });
  };

  return (
    <View>
      <SearchInput value={params.q || ''} onChangeText={handleSearch} />
      <CategoryFilter
        selected={params.category}
        onSelect={handleCategoryChange}
      />
      <Results query={params.q} category={params.category} sort={params.sort} />
    </View>
  );
}
```

---

## 附录 D: 完整的 Modal 系统实现

### D.1 全局 Modal 管理

```tsx
// components/ModalManager.tsx
import { useRouter, usePathname } from 'expo-router';
import { createContext, useContext, useCallback, useState } from 'react';

type ModalType = 'bottomSheet' | 'alert' | 'fullscreen' | 'popover';

interface ModalConfig {
  type: ModalType;
  title?: string;
  content: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

interface ModalContextType {
  showModal: (config: ModalConfig) => void;
  hideModal: () => void;
  currentModal: ModalConfig | null;
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [currentModal, setCurrentModal] = useState<ModalConfig | null>(null);

  const showModal = useCallback((config: ModalConfig) => {
    setCurrentModal(config);
  }, []);

  const hideModal = useCallback(() => {
    setCurrentModal((prev) => {
      prev?.onClose?.();
      return null;
    });
  }, []);

  return (
    <ModalContext.Provider value={{ showModal, hideModal, currentModal }}>
      {children}
      {currentModal && <ModalRenderer config={currentModal} onClose={hideModal} />}
    </ModalContext.Provider>
  );
}

function ModalRenderer({ config, onClose }: { config: ModalConfig; onClose: () => void }) {
  switch (config.type) {
    case 'bottomSheet':
      return <BottomSheetModal title={config.title} onClose={onClose}>
        {config.content}
      </BottomSheetModal>;
    case 'alert':
      return <AlertModal
        title={config.title}
        onClose={onClose}
        onConfirm={config.onConfirm}
      >
        {config.content}
      </AlertModal>;
    case 'fullscreen':
      return <FullscreenModal onClose={onClose}>
        {config.content}
      </FullscreenModal>;
    default:
      return null;
  }
}

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('ModalProvider not found');
  return context;
};

// 使用示例
function MyComponent() {
  const { showModal, hideModal } = useModal();

  const handleDelete = () => {
    showModal({
      type: 'alert',
      title: '确认删除',
      content: <Text>此操作不可撤销，确定要删除吗？</Text>,
      onConfirm: async () => {
        await deleteItem();
        hideModal();
      },
    });
  };

  return <Button title="删除" onPress={handleDelete} />;
}
```

---

## 附录 E: Expo Router 测试策略

### E.1 路由单元测试

```typescript
// __tests__/routing.test.tsx
import { renderRouter, screen, fireEvent } from 'expo-router/testing-library';

describe('Routing', () => {
  it('navigates from home to post detail', () => {
    const { getByText } = renderRouter({
      index: require('../app/(app)/index').default,
      'post/[id]': require('../app/post/[id]').default,
    });

    fireEvent.press(getByText('View Post'));
    expect(screen).toHavePathname('/post/123');
  });

  it('redirects unauthenticated users to login', () => {
    renderRouter({
      '(app)/index': require('../app/(app)/index').default,
      '(auth)/login': require('../app/(auth)/login').default,
    }, {
      initialUrl: '/(app)',
    });

    expect(screen).toHavePathname('/(auth)/login');
  });
});
```

### E.2 E2E 路由测试 (Maestro)

```yaml
# e2e/navigation.yaml
appId: com.yourapp
---
- launchApp

# 测试 Tab 导航
- tapOn: "探索"
- assertVisible: "探索页面"

- tapOn: "我的"
- assertVisible: "个人资料"

# 测试页面导航
- tapOn: "首页"
- tapOn: "第一个帖子"
- assertVisible: "帖子详情"

# 测试返回
- tapOn: "返回"
- assertVisible: "首页"

# 测试 Modal
- tapOn: "创建"
- assertVisible: "创建帖子"
- tapOn: "取消"
- assertNotVisible: "创建帖子"

# 测试深度链接
- openLink: "jsts-mobile-example://post/123"
- assertVisible: "帖子详情"
```

---

## 附录 F: Expo Router v3 新特性与迁移指南

| 特性 | Expo Router v2 | Expo Router v3 | 迁移说明 |
|-----|---------------|---------------|---------|
| **路由组** | `(group)` 语法 | `(group)` 语法 | 无变化 |
| **动态路由** | `[id].tsx` | `[id].tsx` | 无变化 |
| **布局** | `_layout.tsx` | `_layout.tsx` | 无变化 |
| **API Routes** | 不支持 | `route.tsx` (Web) | 新增 |
| **Error Boundaries** | 不支持 | `error.tsx` | 新增 |
| **Loading UI** | 不支持 | `loading.tsx` | 新增 |
| **Typed Routes** | 实验性 | 稳定 | 默认启用 |
| **Static Params** | 不支持 | `generateStaticParams` | 新增 (SSG) |
| **Head API** | 不支持 | `Head` 组件 | 新增 (SEO) |
| **Revalidate** | 不支持 | `revalidate` | 新增 (ISR) |

### F.1 API Routes (Web Only)

```tsx
// app/api/users/route.tsx
import { ExpoRequest, ExpoResponse } from 'expo-router/server';

export async function GET(request: ExpoRequest) {
  const users = await fetchUsers();
  return ExpoResponse.json(users);
}

export async function POST(request: ExpoRequest) {
  const body = await request.json();
  const user = await createUser(body);
  return ExpoResponse.json(user, { status: 201 });
}
```

### F.2 静态站点生成

```tsx
// app/post/[id].tsx
import { generateStaticParams } from 'expo-router';

export async function generateStaticParams() {
  const posts = await fetchAllPosts();
  return posts.map((post) => ({ id: post.id }));
}

export default function PostPage({ params }: { params: { id: string } }) {
  return <PostDetail id={params.id} />;
}
```

---

## 附录 G: 完整的 Expo Router 项目结构参考

```
app/
├── _layout.tsx                 # 根布局
├── +html.tsx                   # HTML 模板 (Web)
├── +not-found.tsx              # 404 页面
│
├── (app)/                      # 主应用路由组
│   ├── _layout.tsx             # Tab 导航
│   ├── index.tsx               # 首页 Tab
│   ├── explore/
│   │   ├── _layout.tsx         # 探索页布局
│   │   ├── index.tsx           # 探索首页
│   │   └── [category].tsx      # 分类页面
│   ├── search/
│   │   ├── _layout.tsx
│   │   └── index.tsx           # 搜索页
│   ├── notifications.tsx       # 通知 Tab
│   └── profile/
│       ├── _layout.tsx
│       ├── index.tsx           # 个人资料
│       ├── edit.tsx            # 编辑资料
│       └── settings/
│           ├── _layout.tsx
│           ├── index.tsx       # 设置首页
│           ├── account.tsx     # 账号设置
│           ├── privacy.tsx     # 隐私设置
│           └── notifications.tsx # 通知设置
│
├── (auth)/                     # 认证路由组
│   ├── _layout.tsx
│   ├── login.tsx
│   ├── register.tsx
│   ├── forgot-password.tsx
│   └── verify-email.tsx
│
├── post/
│   ├── _layout.tsx
│   ├── [id].tsx                # 帖子详情
│   └── [id]/
│       ├── edit.tsx            # 编辑帖子
│       └── comments.tsx        # 评论
│
├── user/
│   ├── [userId].tsx            # 用户主页
│   └── [userId]/
│       ├── posts.tsx
│       ├── followers.tsx
│       └── following.tsx
│
├── modal/                      # Modal 路由
│   ├── create-post.tsx
│   ├── image-preview.tsx
│   └── share.tsx
│
└── [...unmatched].tsx          # 全局兜底
```


---

## 附录 H: 完整的搜索与过滤路由模式

```tsx
// app/(app)/search/_layout.tsx
import { Stack } from 'expo-router';

export default function SearchLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerSearchBarOptions: {
            placeholder: '搜索帖子、用户...',
            hideWhenScrolling: false,
            onChangeText: (text: string) => {
              // 触发搜索
            },
          },
        }}
      />
      <Stack.Screen name="results" options={{ title: '搜索结果' }} />
      <Stack.Screen name="filters" options={{ presentation: 'modal', title: '筛选' }} />
    </Stack>
  );
}

// app/(app)/search/index.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';

export default function SearchScreen() {
  const router = useRouter();
  const { q, category, sort } = useLocalSearchParams<{
    q?: string;
    category?: string;
    sort?: string;
  }>();

  const [searchQuery, setSearchQuery] = useState(q || '');

  const handleSearch = useCallback((text: string) => {
    setSearchQuery(text);
    router.setParams({ q: text });
  }, [router]);

  const handleFilterPress = useCallback(() => {
    router.push('/search/filters');
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="搜索..."
          autoFocus
        />
        <Text onPress={handleFilterPress} style={styles.filterButton}>
          筛选
        </Text>
      </View>

      <FlashList
        data={[]}
        renderItem={() => null}
        estimatedItemSize={100}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text>输入关键词开始搜索</Text>
          </View>
        }
      />
    </View>
  );
}

// app/(app)/search/filters.tsx
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CATEGORIES = ['全部', '技术', '生活', '娱乐', '工作'];
const SORT_OPTIONS = [
  { label: '最新', value: 'recent' },
  { label: '最热', value: 'popular' },
  { label: '相关度', value: 'relevance' },
];

export default function FilterModal() {
  const router = useRouter();
  const { category, sort } = useLocalSearchParams();

  const applyFilters = (newCategory?: string, newSort?: string) => {
    router.setParams({
      category: newCategory || category,
      sort: newSort || sort,
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>分类</Text>
      <View style={styles.chipContainer}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.chip,
              category === cat && styles.chipActive,
            ]}
            onPress={() => applyFilters(cat)}
          >
            <Text style={category === cat ? styles.chipTextActive : styles.chipText}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>排序</Text>
      {SORT_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={styles.sortOption}
          onPress={() => applyFilters(undefined, option.value)}
        >
          <Text style={sort === option.value ? styles.sortActive : null}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', padding: 8 },
  input: { flex: 1, height: 40, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  filterButton: { marginLeft: 12, color: '#007AFF' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginTop: 16, marginBottom: 8 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0' },
  chipActive: { backgroundColor: '#007AFF' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  sortOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  sortActive: { color: '#007AFF', fontWeight: '600' },
});
```

---

## 附录 I: 完整的错误处理路由

```tsx
// app/+not-found.tsx
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: '页面未找到' }} />
      <View style={styles.container}>
        <Text style={styles.emoji}>🤔</Text>
        <Text style={styles.title}>404</Text>
        <Text style={styles.description}>
          您访问的页面不存在或已被移除
        </Text>
        <Link href="/(app)" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>返回首页</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 48, fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

// app/error.tsx
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😵</Text>
      <Text style={styles.title}>出错了</Text>
      <Text style={styles.description}>
        {error.message || '应用遇到了意外错误'}
      </Text>
      <TouchableOpacity style={styles.button} onPress={reset}>
        <Text style={styles.buttonText}>重试</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => router.replace('/(app)')}
      >
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>
          返回首页
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  description: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  button: { backgroundColor: '#007AFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginBottom: 8, minWidth: 200, alignItems: 'center' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryButtonText: { color: '#007AFF' },
});
```

---

## 附录 J: Expo Router 与后端 API 集成模式

```tsx
// hooks/useApiRoute.ts
import { useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

interface ApiRouteOptions<T> {
  endpoint: string;
  transform?: (data: any) => T;
}

export function useApiRoute<T>(options: ApiRouteOptions<T>) {
  const params = useLocalSearchParams();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [options.endpoint, params],
    queryFn: async () => {
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      const url = `${options.endpoint}${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      return options.transform ? options.transform(data) : data;
    },
  });

  return { data, isLoading, error, refetch };
}

// 使用示例
// app/post/[id].tsx
export default function PostPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: post, isLoading } = useApiRoute<Post>({
    endpoint: `/api/posts/${id}`,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (!post) return <NotFound />;

  return <PostDetail post={post} />;
}
```

---

## 附录 K: Expo Router 导航模式速查表

| 场景 | 代码 | 行为 |
|-----|------|------|
| 普通跳转 | `router.push('/post/123')` | 堆栈压入新页面 |
| 替换跳转 | `router.replace('/home')` | 替换当前页面 |
| 返回 | `router.back()` | 返回上一页 |
| 返回 N 层 | `router.back(2)` | 返回两层 |
| 带参数跳转 | `router.push({ pathname: '/post/[id]', params: { id: '123' } })` | 动态路由 |
| 带查询参数 | `router.push('/search?q=test')` | URL 查询参数 |
| 刷新 | `router.refresh()` | 重新获取数据 |
| 设置参数 | `router.setParams({ tab: 'hot' })` | 更新当前路由参数 |
| 重定向 | `router.replace('/(auth)/login')` | 认证跳转 |
|  canGoBack | `router.canGoBack()` | 判断能否返回 |
| dismiss | `router.dismiss()` | 关闭 Modal |
| dismissAll | `router.dismissAll()` | 关闭所有 Modal |

---

## 附录 L: Expo Router v3 完整更新日志

### 新特性
- **Static Rendering**: 支持 SSG 和 ISR
- **API Routes**: 后端 API 端点
- **Error Boundaries**: 路由级错误处理
- **Loading UI**: 路由级加载状态
- **Typed Routes**: 类型安全路由
- **Head API**: SEO 元数据管理
- **Revalidate**: 增量静态再生

### 改进
- **性能**: 启动时间减少 30%
- **Bundle**: 包体积减少 20%
- **类型**: 100% TypeScript 覆盖
- **开发体验**: 热更新速度提升

### 破坏性变更
- `useSearchParams` 重命名为 `useLocalSearchParams`
- `usePathname` 行为变更
- `Segment` 组件移除
