# 01 - React Native + Expo 完整项目搭建指南

> **版本信息**: Expo SDK 52.x | React Native 0.76.x | TypeScript 5.6 | React Navigation 7.x
> **目标读者**: 具备 React 基础，希望系统性掌握现代 React Native 工程化实践的开发者
> **阅读时长**: 约 45 分钟

---

## 目录

1. [技术选型与决策矩阵](#一技术选型与决策矩阵)
2. [环境准备与工具链](#二环境准备与工具链)
3. [项目初始化与目录结构](#三项目初始化与目录结构)
4. [TypeScript 严格模式配置](#四typescript-严格模式配置)
5. [导航系统集成](#五导航系统集成)
6. [状态管理架构设计](#六状态管理架构设计)
7. [表单处理与验证](#七表单处理与验证)
8. [网络层封装](#八网络层封装)
9. [主题与国际化](#九主题与国际化)
10. [常见陷阱与解决方案](#十常见陷阱与解决方案)

---

## 一、技术选型与决策矩阵

在 2025-2026 年的移动端开发领域，React Native 生态系统已经高度成熟。Expo 作为官方推荐的开发框架，提供了从开发到发布的完整工具链。本节通过多维度对比，帮助团队做出合理的技术选型。

### 1.1 跨平台框架对比矩阵

| 维度 | Expo + React Native | 裸 React Native | Flutter | Ionic/Capacitor |
|-----|-------------------|---------------|---------|----------------|
| **开发效率** | ⭐⭐⭐⭐⭐ 开箱即用 | ⭐⭐⭐ 需大量原生配置 | ⭐⭐⭐⭐ 热重载优秀 | ⭐⭐⭐⭐ Web 技术栈 |
| **性能表现** | ⭐⭐⭐⭐ 接近原生 | ⭐⭐⭐⭐ 接近原生 | ⭐⭐⭐⭐⭐ 自绘引擎 | ⭐⭐⭐ WebView 渲染 |
| **生态成熟度** | ⭐⭐⭐⭐⭐ npm 生态 | ⭐⭐⭐⭐⭐ npm 生态 | ⭐⭐⭐⭐ 快速增长 | ⭐⭐⭐⭐⭐ Web 生态 |
| **原生能力访问** | ⭐⭐⭐⭐ Expo Modules | ⭐⭐⭐⭐⭐ 无限制 | ⭐⭐⭐⭐ Platform Channels | ⭐⭐⭐ 插件受限 |
| **团队学习成本** | ⭐⭐⭐⭐ 前端技能复用 | ⭐⭐⭐⭐ 前端+原生 | ⭐⭐⭐ Dart 新语言 | ⭐⭐⭐⭐⭐ 纯 Web |
| **发布流程** | ⭐⭐⭐⭐⭐ EAS 自动化 | ⭐⭐⭐ 手动配置 | ⭐⭐⭐⭐ Codemagic | ⭐⭐⭐⭐ Capacitor |
| **Web 支持** | ⭐⭐⭐ 实验性 | ⭐⭐ 需额外配置 | ⭐ 不支持 | ⭐⭐⭐⭐⭐ 核心优势 |
| **IDE 支持** | ⭐⭐⭐⭐ VS Code + Expo | ⭐⭐⭐⭐ VS Code | ⭐⭐⭐⭐⭐ Android Studio | ⭐⭐⭐⭐⭐ VS Code |
| **OTA 更新** | ⭐⭐⭐⭐⭐ EAS Update | ⭐⭐ CodePush(弃用) | ⭐⭐ Shorebird | ⭐⭐ CodePush |
| **2026 趋势** | 新架构默认、持续主导 | 逐步向 Expo 迁移 | 企业级增长 | PWA 场景为主 |

**选型建议**: 对于以 TypeScript/JavaScript 为核心技术栈的团队，**Expo SDK 52+ 是 2026 年的最优解**。它在保持 React Native 灵活性的同时，通过 EAS 构建服务和 Expo Modules 大幅降低了原生开发门槛。

### 1.2 Expo 工作流对比

| 特性 | Expo Go | Development Build | EAS Build |
|-----|---------|------------------|-----------|
| 启动速度 | ⚡ 极快 | 🚀 快 | 🐢 需等待云端构建 |
| 原生模块支持 | ❌ 仅限 SDK 内置 | ✅ 任意原生模块 | ✅ 任意原生模块 |
| 调试体验 | ⭐⭐⭐⭐⭐ 扫码即用 | ⭐⭐⭐⭐ 需安装 | ⭐⭐⭐ 生产环境 |
| 适用阶段 | 快速原型验证 | 日常开发 | 测试/生产发布 |
| 热更新支持 | ✅ | ✅ | ✅ EAS Update |
| 推送通知测试 | ⚠️ 受限 | ✅ 完整支持 | ✅ 完整支持 |

**推荐工作流**: 开发阶段使用 `Development Build`，配合 `expo-dev-client` 实现类似 Expo Go 的调试体验，同时支持任意原生模块。

---

## 二、环境准备与工具链

### 2.1 必备工具安装

```bash
# Node.js 20.x LTS (推荐使用 nvm 或 fnm 管理)
nvm install 20
nvm use 20

# 包管理器选择 (pnpm 为 2026 年推荐)
npm install -g pnpm

# Expo CLI 工具
npm install -g expo-cli@latest

# EAS CLI (构建与发布)
npm install -g eas-cli@latest

# 验证安装
expo --version    # >= 12.0.0
eas --version     # >= 12.0.0
node --version    # >= 20.0.0
```

### 2.2 移动端开发环境

**iOS (仅限 macOS)**:

```bash
# 安装 Xcode 16+ (通过 Mac App Store)
# 安装 Xcode Command Line Tools
xcode-select --install

# 安装 CocoaPods
sudo gem install cocoapods

# 配置 iOS 模拟器
xcrun simctl list devices
```

**Android**:

```bash
# 安装 Android Studio Iguana+
# 配置 ANDROID_HOME 环境变量
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# 创建模拟器 (Pixel 8 API 35)
avdmanager create avd -n Pixel8 -k "system-images;android-35;google_apis;x86_64"
```

### 2.3 推荐的 VS Code 扩展

| 扩展名称 | 用途 | 配置要点 |
|---------|------|---------|
| Expo Tools | 调试、日志、QR 码 | 启用 `expo.autoStart` |
| ES7+ React/Redux/GraphQL snippets | 代码片段 | 自定义 RN 模板 |
| React Native Tools | 断点调试 | 配置 `launch.json` |
| Tailwind CSS IntelliSense | NativeWind 支持 | 配置 `tailwindCSS.classAttributes` |
| Error Lens | 实时错误显示 | 开启 TypeScript 诊断 |

---

## 三、项目初始化与目录结构

### 3.1 创建项目

```bash
# 使用 create-expo-app 初始化 (推荐 --template blank-typescript)
npx create-expo-app jsts-mobile-example --template blank-typescript

# 或者使用 pnpm
cd jsts-mobile-example
pnpm install
```

**项目初始化后的关键文件**:

```
jsts-mobile-example/
├── app.json              # Expo 配置文件 (应用元数据、插件)
├── babel.config.js       # Babel 转译配置
├── metro.config.js       # Metro 打包配置
├── package.json          # 依赖管理
├── tsconfig.json         # TypeScript 配置
├── App.tsx               # 应用入口
└── assets/               # 静态资源
```

### 3.2 推荐的扩展目录结构

对于中大型项目，我们采用**功能优先 (Feature-First)** 的目录结构：

```
src/
├── components/           # 全局共享 UI 组件
│   ├── ui/              # 原子组件 (Button, Input, Card)
│   ├── forms/           # 表单专用组件
│   └── feedback/        # 反馈组件 (Toast, Modal, Skeleton)
├── screens/             # 页面级组件
│   ├── auth/            # 认证相关页面
│   ├── home/            # 首页模块
│   └── profile/         # 个人资料模块
├── navigation/          # 导航配置
│   ├── types.ts         # 导航类型定义
│   ├── linking.ts       # 深度链接配置
│   └── stacks/          # 各导航栈定义
├── hooks/               # 全局自定义 Hooks
│   ├── useAuth.ts
│   ├── useTheme.ts
│   └── useNetworkStatus.ts
├── stores/              # Zustand 状态存储
│   ├── authStore.ts
│   ├── themeStore.ts
│   └── uiStore.ts
├── services/            # API 服务层
│   ├── api.ts           # Axios 实例
│   ├── authService.ts
│   └── postService.ts
├── utils/               # 工具函数
│   ├── validation.ts    # Zod Schemas
│   ├── formatting.ts    # 日期/数字格式化
│   └── storage.ts       # AsyncStorage 封装
├── types/               # 全局 TypeScript 类型
│   ├── api.ts           # API 相关类型
│   ├── models.ts        # 业务模型
│   └── navigation.ts    # 导航参数类型
├── constants/           # 常量定义
│   ├── colors.ts
│   ├── spacing.ts
│   └── api.ts
└── i18n/                # 国际化
    ├── index.ts
    ├── en.json
    └── zh.json
```

### 3.3 路径别名配置

为了减少 `../../../` 地狱，配置路径别名：

**tsconfig.json**:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@stores/*": ["src/stores/*"],
      "@services/*": ["src/services/*"],
      "@constants/*": ["src/constants/*"]
    }
  }
}
```

**babel.config.js**:

```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@hooks': './src/hooks',
            '@utils': './src/utils',
            '@types': './src/types',
            '@stores': './src/stores',
            '@services': './src/services',
            '@constants': './src/constants',
          },
          extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        },
      ],
    ],
  };
};
```

---

## 四、TypeScript 严格模式配置

### 4.1 推荐的 tsconfig.json

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "jsx": "react-jsx",
    "allowJs": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "types": ["jest", "@testing-library/jest-native"]
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules", "babel.config.js", "metro.config.js"]
}
```

### 4.2 全局类型声明

```typescript
// src/types/global.d.ts
declare module '*.png' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.jpg' {
  const value: import('react-native').ImageSourcePropType;
  export default value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

// 环境变量类型
declare module '@env' {
  export const EXPO_PUBLIC_API_URL: string;
  export const EXPO_PUBLIC_APP_NAME: string;
}
```

### 4.3 导航类型安全

```typescript
// src/types/navigation.ts
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// 定义所有路由参数
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  PostDetail: { postId: string };
  Profile: { userId?: string };
  Settings: undefined;
  NotFound: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Create: undefined;
  Notifications: undefined;
  MyProfile: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: { email?: string };
};

// 辅助类型：获取屏幕 Props
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

// 全局声明增强
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

---

## 五、导航系统集成

### 5.1 安装依赖

```bash
# 核心导航库
pnpm add @react-navigation/native
pnpm add @react-navigation/native-stack
pnpm add @react-navigation/bottom-tabs

# 必需依赖
pnpm add react-native-screens react-native-safe-area-context

# 手势处理 (用于 Modal 和抽屉导航)
pnpm add react-native-gesture-handler

# 动画库 (用于共享元素过渡)
pnpm add react-native-reanimated
```

### 5.2 根导航器实现

```typescript
// src/navigation/RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { RootStackParamList } from '@types/navigation';
import { useAuthStore } from '@stores/authStore';
import { MainTabNavigator } from './MainTabNavigator';
import { AuthNavigator } from './AuthNavigator';
import { PostDetailScreen } from '@screens/PostDetailScreen';
import { linking } from './linking';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="PostDetail"
              component={PostDetailScreen}
              options={{
                headerShown: true,
                title: '帖子详情',
                animation: 'slide_from_right',
              }}
            />
            <Stack.Screen
              name="Profile"
              getComponent={() => require('@screens/ProfileScreen').ProfileScreen}
              options={{
                headerShown: true,
                title: '个人资料',
                animation: 'slide_from_right',
              }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{ animation: 'none' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 5.3 底部 Tab 导航器

```typescript
// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '@types/navigation';
import { useTheme } from '@hooks/useTheme';
import { HomeScreen } from '@screens/home/HomeScreen';
import { ExploreScreen } from '@screens/explore/ExploreScreen';
import { CreateScreen } from '@screens/create/CreateScreen';
import { NotificationsScreen } from '@screens/notifications/NotificationsScreen';
import { MyProfileScreen } from '@screens/profile/MyProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator(): JSX.Element {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Create':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Notifications':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'MyProfile':
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
          elevation: 8,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <Tab.Screen name="Explore" component={ExploreScreen} options={{ title: '探索' }} />
      <Tab.Screen
        name="Create"
        component={CreateScreen}
        options={{ title: '创建', tabBarLabel: '' }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: '通知', tabBarBadge: 3 }}
      />
      <Tab.Screen name="MyProfile" component={MyProfileScreen} options={{ title: '我的' }} />
    </Tab.Navigator>
  );
}
```

### 5.4 深度链接配置

```typescript
// src/navigation/linking.ts
import * as Linking from 'expo-linking';
import { LinkingOptions } from '@react-navigation/native';
import { RootStackParamList } from '@types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    Linking.createURL('/'),
    'https://jsts-example.com',
    'jsts-mobile-example://',
  ],
  config: {
    screens: {
      Main: {
        screens: {
          Home: 'home',
          Explore: 'explore',
          Notifications: 'notifications',
          MyProfile: 'profile',
        },
      },
      PostDetail: 'post/:postId',
      Profile: 'user/:userId',
      Settings: 'settings',
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
        },
      },
    },
  },
  getInitialURL: async () => {
    // 处理通知点击等情况
    const url = await Linking.getInitialURL();
    return url;
  },
};
```

---

## 六、状态管理架构设计

### 6.1 状态分类策略

现代 React Native 应用的状态应分为三类：

| 状态类型 | 管理工具 | 示例 | 持久化 |
|---------|---------|------|--------|
| **服务端状态** | React Query / SWR | 帖子列表、用户信息 | HTTP 缓存 |
| **全局客户端状态** | Zustand / Jotai | 认证状态、主题设置 | AsyncStorage |
| **局部 UI 状态** | useState / useReducer | 表单输入、Modal 显隐 | 否 |

### 6.2 Zustand 认证状态管理

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, AuthStatus } from '@types/models';
import { authService } from '@services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  initializeAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
}

interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      status: 'idle',
      isAuthenticated: false,

      initializeAuth: async () => {
        try {
          const token = await SecureStore.getItemAsync('auth_token');
          const refreshToken = await SecureStore.getItemAsync('refresh_token');

          if (token && refreshToken) {
            // 验证 Token 有效性
            const user = await authService.me();
            set({
              user,
              token,
              refreshToken,
              status: 'authenticated',
              isAuthenticated: true,
            });
          } else {
            set({ status: 'unauthenticated' });
          }
        } catch {
          set({ status: 'unauthenticated' });
        }
      },

      login: async (email, password) => {
        set({ status: 'loading' });
        try {
          const response = await authService.login({ email, password });
          await SecureStore.setItemAsync('auth_token', response.token);
          await SecureStore.setItemAsync('refresh_token', response.refreshToken);

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            status: 'authenticated',
            isAuthenticated: true,
          });
        } catch (error) {
          set({ status: 'unauthenticated' });
          throw error;
        }
      },

      register: async (data) => {
        set({ status: 'loading' });
        try {
          const response = await authService.register(data);
          await SecureStore.setItemAsync('auth_token', response.token);
          await SecureStore.setItemAsync('refresh_token', response.refreshToken);

          set({
            user: response.user,
            token: response.token,
            refreshToken: response.refreshToken,
            status: 'authenticated',
            isAuthenticated: true,
          });
        } catch (error) {
          set({ status: 'unauthenticated' });
          throw error;
        }
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('refresh_token');
        set({
          user: null,
          token: null,
          refreshToken: null,
          status: 'unauthenticated',
          isAuthenticated: false,
        });
      },

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await authService.refresh(refreshToken);
          await SecureStore.setItemAsync('auth_token', response.token);
          set({ token: response.token });
          return true;
        } catch {
          get().logout();
          return false;
        }
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updates } });
        }
      },
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        status: state.status,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

### 6.3 React Query 服务端状态管理

```typescript
// src/hooks/usePosts.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Post, PaginatedResponse, PostsFilter } from '@types/models';
import { postService } from '@services/postService';

const POSTS_QUERY_KEY = 'posts';

export function usePosts(filter: PostsFilter = {}) {
  return useInfiniteQuery<PaginatedResponse<Post>>({
    queryKey: [POSTS_QUERY_KEY, filter],
    queryFn: async ({ pageParam = 1 }) => {
      return postService.getPosts({
        page: pageParam as number,
        limit: 20,
        ...filter,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 分钟
  });
}

export function usePost(postId: string) {
  return useQuery<Post>({
    queryKey: [POSTS_QUERY_KEY, postId],
    queryFn: () => postService.getPost(postId),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.createPost,
    onSuccess: (newPost) => {
      // 乐观更新：将新帖子添加到首页缓存
      queryClient.setQueryData([POSTS_QUERY_KEY], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: [
            {
              ...old.pages[0],
              data: [newPost, ...old.pages[0].data],
            },
            ...old.pages.slice(1),
          ],
        };
      });
      // 使列表缓存失效以重新获取
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [POSTS_QUERY_KEY] });
    },
  });
}
```

---

## 七、表单处理与验证

### 7.1 Zod 验证 Schema

```typescript
// src/utils/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(8, '密码至少需要8个字符')
    .max(128, '密码不能超过128个字符')
    .regex(/[A-Z]/, '密码必须包含至少一个大写字母')
    .regex(/[a-z]/, '密码必须包含至少一个小写字母')
    .regex(/[0-9]/, '密码必须包含至少一个数字'),
});

export const registerSchema = loginSchema
  .extend({
    displayName: z
      .string()
      .min(2, '昵称至少需要2个字符')
      .max(50, '昵称不能超过50个字符'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export const postSchema = z.object({
  title: z
    .string()
    .min(1, '标题不能为空')
    .max(200, '标题不能超过200个字符'),
  body: z
    .string()
    .min(1, '内容不能为空')
    .max(10000, '内容不能超过10000个字符'),
  tags: z
    .array(z.string().min(1).max(20))
    .max(10, '标签不能超过10个')
    .optional(),
});

export const profileSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  bio: z.string().max(500).optional(),
  website: z.union([z.string().url('请输入有效的URL'), z.literal('')]).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type PostFormData = z.infer<typeof postSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
```

### 7.2 登录表单组件

```typescript
// src/screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { useAuthStore } from '@stores/authStore';
import { loginSchema, LoginFormData } from '@utils/validation';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

export function LoginScreen(): JSX.Element {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const login = useAuthStore((state) => state.login);
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setLoginError('');
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      setLoginError(error.message || '登录失败，请检查邮箱和密码');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>欢迎回来</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              登录以继续探索
            </Text>
          </View>

          <View style={styles.form}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="邮箱"
                  placeholder="请输入邮箱地址"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  leftIcon={<Ionicons name="mail-outline" size={20} color={colors.textSecondary} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="密码"
                  placeholder="请输入密码"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  secureTextEntry={secureText}
                  textContentType="password"
                  autoComplete="password"
                  leftIcon={<Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />}
                  rightIcon={
                    <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                      <Ionicons
                        name={secureText ? 'eye-outline' : 'eye-off-outline'}
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  }
                />
              )}
            />

            {loginError ? (
              <Text style={[styles.errorText, { color: colors.error }]}>{loginError}</Text>
            ) : null}

            <Button
              title="登录"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              disabled={isLoading}
              style={{ marginTop: 8 }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>
              还没有账号？
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register' as never)}>
              <Text style={[styles.footerLink, { color: colors.primary }]}>立即注册</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { gap: 0 },
  errorText: { fontSize: 14, marginBottom: 12, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, gap: 4 },
  footerText: { fontSize: 15 },
  footerLink: { fontSize: 15, fontWeight: '600' },
});
```

---

## 八、网络层封装

### 8.1 Axios 实例配置

```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from '@stores/authStore';
import { ApiError } from '@types/models';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com/v1';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Platform': Platform.OS,
        'X-App-Version': process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // 请求拦截器：注入 Token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器：处理 Token 刷新
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // 等待 Token 刷新完成
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers!.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refresh_token');
            if (!refreshToken) throw new Error('No refresh token');

            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { token } = response.data;
            await SecureStore.setItemAsync('auth_token', token);

            // 通知等待中的请求
            this.refreshSubscribers.forEach((callback) => callback(token));
            this.refreshSubscribers = [];

            originalRequest.headers!.Authorization = `Bearer ${token}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            useAuthStore.getState().logout();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // 统一错误处理
        const apiError: ApiError = {
          message: (error.response?.data as { message?: string })?.message || error.message,
          code: (error.response?.data as { code?: string })?.code || 'UNKNOWN_ERROR',
          status: error.response?.status || 500,
          details: (error.response?.data as { details?: Record<string, string[]> })?.details,
        };

        return Promise.reject(apiError);
      }
    );
  }

  get instance() {
    return this.client;
  }
}

export const apiClient = new ApiClient().instance;

// 便捷方法
export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return response.data;
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.patch<T>(url, data);
  return response.data;
}

export async function del<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return response.data;
}
```

### 8.2 业务服务层

```typescript
// src/services/postService.ts
import { get, post, put, del } from './api';
import { Post, PaginatedResponse, CreatePostInput, UpdatePostInput, PostsFilter } from '@types/models';

export const postService = {
  async getPosts(filter: PostsFilter): Promise<PaginatedResponse<Post>> {
    return get<PaginatedResponse<Post>>('/posts', filter as Record<string, unknown>);
  },

  async getPost(id: string): Promise<Post> {
    return get<Post>(`/posts/${id}`);
  },

  async createPost(data: CreatePostInput): Promise<Post> {
    return post<Post>('/posts', data);
  },

  async updatePost(id: string, data: UpdatePostInput): Promise<Post> {
    return put<Post>(`/posts/${id}`, data);
  },

  async deletePost(id: string): Promise<void> {
    return del<void>(`/posts/${id}`);
  },

  async likePost(id: string): Promise<{ likes: number }> {
    return post<{ likes: number }>(`/posts/${id}/like`);
  },

  async unlikePost(id: string): Promise<{ likes: number }> {
    return del<{ likes: number }>(`/posts/${id}/like`);
  },
};
```

---

## 九、主题与国际化

### 9.1 动态主题系统

```typescript
// src/hooks/useTheme.ts
import { useColorScheme } from 'react-native';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeStore {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode: ThemeMode) => set({ mode }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  overlay: string;
  shadow: string;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F2F2F7',
  primary: '#007AFF',
  secondary: '#5856D6',
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  border: '#E5E5EA',
  borderLight: '#F2F2F7',
  error: '#FF3B30',
  success: '#34C759',
  warning: '#FF9500',
  info: '#5AC8FA',
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: '#000000',
};

const darkColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1C1C1E',
  primary: '#0A84FF',
  secondary: '#5E5CE6',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  border: '#38383A',
  borderLight: '#2C2C2E',
  error: '#FF453A',
  success: '#30D158',
  warning: '#FF9F0A',
  info: '#64D2FF',
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: '#000000',
};

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const { mode, setMode } = useThemeStore();

  const isDark = mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');
  const colors = isDark ? darkColors : lightColors;

  return {
    isDark,
    colors,
    mode,
    setMode,
  };
}
```

### 9.2 主题化组件示例

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '@hooks/useTheme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps): JSX.Element {
  const { colors } = useTheme();

  const getBackgroundColor = (): string => {
    if (disabled) return colors.textTertiary;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'danger': return colors.error;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return colors.background;
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return '#FFFFFF';
      case 'outline':
      case 'ghost':
        return variant === 'danger' ? colors.error : colors.primary;
      default: return '#FFFFFF';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm': return { paddingVertical: 8, paddingHorizontal: 12 };
      case 'md': return { paddingVertical: 12, paddingHorizontal: 16 };
      case 'lg': return { paddingVertical: 16, paddingHorizontal: 24 };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'danger' ? colors.error : colors.primary,
          ...getPadding(),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
```

---

## 十、常见陷阱与解决方案

### 陷阱 1: Metro 缓存导致依赖更新不生效

**现象**: 安装新包后，运行时仍报错 `Module not found`。

**解决方案**:
```bash
# 清除所有缓存
npx expo start --clear

# 或手动清除
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
watchman watch-del-all
```

### 陷阱 2: iOS Pod 安装失败

**现象**: `pod install` 报错，依赖冲突或源码下载失败。

**解决方案**:
```bash
cd ios
pod deintegrate
pod repo update
pod install --repo-update
cd ..
```

### 陷阱 3: Android 构建内存不足

**现象**: `:app:mergeDexRelease` 或 `:app:bundleRelease` OOM。

**解决方案**:
```bash
# 在 android/gradle.properties 中增加内存
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.configureondemand=true
```

### 陷阱 4: TypeScript 路径别名在运行时失效

**现象**: VS Code 能正确跳转，但 Metro 打包报错。

**解决方案**: 确保 `babel-plugin-module-resolver` 已安装并正确配置 `babel.config.js`。

### 陷阱 5: SecureStore 在 Android 模拟器上数据丢失

**现象**: 应用重启后，SecureStore 中 Token 消失。

**解决方案**: Android 模拟器开启 "Cold Boot" 而非 "Quick Boot"，或使用 `AsyncStorage` 作为开发环境替代。

### 陷阱 6: FlashList 高度计算异常

**现象**: FlashList 内容显示空白或高度为 0。

**解决方案**: 确保父容器有确定的高度（非 `flex: 1` 嵌套问题），并设置准确的 `estimatedItemSize`。

### 陷阱 7: Expo SDK 升级后原生构建失败

**现象**: 升级 Expo SDK 后，iOS/Android 构建报错。

**解决方案**:
```bash
# 1. 删除锁文件和 node_modules
rm -rf node_modules pnpm-lock.yaml

# 2. 重新安装
pnpm install

# 3. 同步原生项目
npx expo prebuild --clean

# 4. 重新构建
npx expo run:ios
npx expo run:android
```

### 陷阱 8: React Query 缓存导致数据不同步

**现象**: 创建新数据后，列表未自动更新。

**解决方案**: 使用 `queryClient.invalidateQueries()` 或乐观更新，确保 mutation 成功后触发重新获取。

---

## 总结

本文档系统性地介绍了 2025-2026 年使用 Expo SDK 52 和 React Native 0.76 构建生产级移动应用的完整流程。从项目初始化、TypeScript 严格配置、导航系统、状态管理到网络层封装，涵盖了现代 React Native 工程化的核心环节。

**关键要点回顾**:

1. **Expo SDK 52** 默认启用 New Architecture，带来显著性能提升
2. **Zustand + React Query** 的组合是状态管理的黄金标准
3. **FlashList** 替代 FlatList 可大幅提升长列表性能
4. **Expo Image** 统一了跨平台的图片加载体验
5. **EAS Build/Update** 提供了企业级的 CI/CD 和 OTA 能力
6. **TypeScript 严格模式** 和路径别名是大型项目的必备基础设施

下一步建议阅读 [02-react-native-new-architecture.md](./02-react-native-new-architecture.md) 深入了解 Fabric 渲染器和 TurboModules 的工作原理。


---

## 附录 A: 完整的项目初始化脚本

```bash
#!/bin/bash
# scripts/init-expo-project.sh
# 完整的 Expo SDK 52 项目初始化脚本

set -e

PROJECT_NAME=${1:-"my-expo-app"}
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

echo "🚀 初始化 $PROJECT_NAME ..."

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "my-expo-app",
  "version": "1.0.0",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest --watchAll",
    "lint": "eslint . --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "react": "18.3.1",
    "react-native": "0.76.0",
    "expo-router": "~4.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.3.0",
    "typescript": "~5.6.0"
  }
}
EOF

# 安装依赖
pnpm install

# 创建目录结构
mkdir -p src/{components,screens,hooks,utils,types,navigation}
mkdir -p assets/{fonts,images}

echo "✅ 项目初始化完成"
echo ""
echo "下一步:"
echo "  cd $PROJECT_NAME"
echo "  npx expo start"
```

---

## 附录 B: 完整的 CI/CD 配置

```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run lint
      - run: pnpm run typecheck

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test --coverage

  e2e-tests:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec detox build --configuration ios.sim.debug
      - run: pnpm exec detox test --configuration ios.sim.debug

  build-ios:
    needs: [lint-and-typecheck, unit-tests]
    runs-on: macos-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec eas build --platform ios --non-interactive

  build-android:
    needs: [lint-and-typecheck, unit-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec eas build --platform android --non-interactive
```

---

## 附录 C: ESLint 与 Prettier 完整配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    'universe/native',
    'universe/shared/typescript-analysis',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.d.ts'],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  ],
  rules: {
    // React
    'react/jsx-boolean-value': ['error', 'never'],
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
    'react/self-closing-comp': 'error',
    
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    
    // Import
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
      },
    ],
    
    // General
    'no-console': ['warn', { allow: ['error', 'warn'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
};
```

```json
// .prettierrc
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always"
}
```

---

## 附录 D: 完整的测试配置

```typescript
// jest.config.js
const { getJestConfig } = require('@expo/config-plugins');

module.exports = {
  ...getJestConfig(),
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/(.*)$': '<rootDir>/src/screens/$1',
    '^@hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1',
    '^@stores/(.*)$': '<rootDir>/src/stores/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
  },
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

// jest.setup.js
import '@testing-library/jest-native/extend-expect';
import 'react-native-gesture-handler/jestSetup';

// Mock expo-modules
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});
```

---

## 附录 E: 完整的 Detox E2E 配置

```javascript
// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      config: 'e2e/jest.config.js',
      maxWorkers: 1,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/JSTSExample.app',
      build: 'xcodebuild -workspace ios/JSTSExample.xcworkspace -scheme JSTSExample -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build: 'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 15 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_8_API_35',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
  },
};
```

```typescript
// e2e/auth.test.ts
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp({ delete: true });
  });

  it('should show login screen for unauthenticated users', async () => {
    await expect(element(by.text('欢迎回来'))).toBeVisible();
    await expect(element(by.placeholder('请输入邮箱地址'))).toBeVisible();
    await expect(element(by.placeholder('请输入密码'))).toBeVisible();
  });

  it('should show validation errors for empty fields', async () => {
    await element(by.text('登录')).tap();
    await expect(element(by.text('邮箱不能为空'))).toBeVisible();
    await expect(element(by.text('密码至少需要8个字符'))).toBeVisible();
  });

  it('should login with valid credentials', async () => {
    await element(by.placeholder('请输入邮箱地址')).typeText('test@example.com');
    await element(by.placeholder('请输入密码')).typeText('Password123');
    await element(by.text('登录')).tap();
    
    await waitFor(element(by.text('首页')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should navigate to settings and logout', async () => {
    await element(by.text('我的')).tap();
    await element(by.text('设置')).tap();
    await element(by.text('退出登录')).tap();
    
    await expect(element(by.text('欢迎回来'))).toBeVisible();
  });
});
```

---

## 附录 F: Docker 开发环境配置

```dockerfile
# Dockerfile.dev
FROM node:20-slim

# 安装 Android SDK 依赖
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# 安装 pnpm
RUN npm install -g pnpm

WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# 复制源码
COPY . .

EXPOSE 8081 19000 19001 19002

CMD ["pnpm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "19000:19000"
      - "19001:19001"
      - "19002:19002"
      - "8081:8081"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - EXPO_PUBLIC_API_URL=http://localhost:3000
    stdin_open: true
    tty: true
```

---

## 附录 G: 完整的原生模块集成示例

```typescript
// src/modules/Clipboard.ts
import * as Clipboard from 'expo-clipboard';

export const ClipboardAPI = {
  async copy(text: string): Promise<void> {
    await Clipboard.setStringAsync(text);
  },

  async paste(): Promise<string | null> {
    return Clipboard.getStringAsync();
  },

  async hasImage(): Promise<boolean> {
    const hasImage = await Clipboard.hasImageAsync();
    return hasImage;
  },

  async getImage(): Promise<string | null> {
    const image = await Clipboard.getImageAsync({});
    return image?.data || null;
  },
};

// src/modules/Haptics.ts
import * as Haptics from 'expo-haptics';

export const HapticsAPI = {
  light() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  medium() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  heavy() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  success() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  error() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  warning() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },
};

// 在组件中使用
import { HapticsAPI } from '@modules/Haptics';

function LikeButton() {
  const handlePress = () => {
    HapticsAPI.medium();
    // 执行点赞逻辑
  };

  return <Button title="点赞" onPress={handlePress} />;
}
```

---

## 附录 H: 完整的国际化 (i18n) 实现

```typescript
// src/i18n/index.ts
import { I18n } from 'i18n-js';
import { getLocales } from 'expo-localization';

const en = {
  welcome: 'Welcome',
  login: 'Login',
  email: 'Email',
  password: 'Password',
  submit: 'Submit',
  cancel: 'Cancel',
  loading: 'Loading...',
  error: 'Error',
  retry: 'Retry',
  home: 'Home',
  explore: 'Explore',
  profile: 'Profile',
  settings: 'Settings',
  notifications: 'Notifications',
  search: 'Search',
  noResults: 'No results found',
  loadMore: 'Load more',
};

const zh = {
  welcome: '欢迎',
  login: '登录',
  email: '邮箱',
  password: '密码',
  submit: '提交',
  cancel: '取消',
  loading: '加载中...',
  error: '错误',
  retry: '重试',
  home: '首页',
  explore: '探索',
  profile: '个人资料',
  settings: '设置',
  notifications: '通知',
  search: '搜索',
  noResults: '没有找到结果',
  loadMore: '加载更多',
};

export const i18n = new I18n({
  en,
  zh,
});

i18n.locale = getLocales()[0]?.languageCode || 'zh';
i18n.enableFallback = true;
i18n.defaultLocale = 'zh';

// React Hook
export function useTranslation() {
  return {
    t: (key: keyof typeof zh, options?: Record<string, string>) =>
      i18n.t(key, options),
    locale: i18n.locale,
    setLocale: (locale: string) => {
      i18n.locale = locale;
    },
  };
}
```

---

## 附录 I: 完整的错误处理与日志系统

```typescript
// src/utils/errorHandler.ts
import { Platform } from 'react-native';

interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: number;
  stack?: string;
}

class ErrorTracker {
  private errors: AppError[] = [];
  private maxErrors = 100;

  track(error: Error, context?: Record<string, unknown>) {
    const appError: AppError = {
      code: (error as any).code || 'UNKNOWN_ERROR',
      message: error.message,
      details: {
        ...context,
        platform: Platform.OS,
        version: Platform.Version,
      },
      timestamp: Date.now(),
      stack: error.stack,
    };

    this.errors.push(appError);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    if (__DEV__) {
      console.error('[ErrorTracker]', appError);
    } else {
      // 发送到错误监控服务 (Sentry/Bugsnag)
      this.reportToService(appError);
    }
  }

  private reportToService(error: AppError) {
    // 实现上报逻辑
    fetch('https://api.yourservice.com/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    }).catch(() => {
      // 静默失败
    });
  }

  getRecentErrors(limit = 10): AppError[] {
    return this.errors.slice(-limit);
  }

  clear() {
    this.errors = [];
  }
}

export const errorTracker = new ErrorTracker();

// 全局错误边界
// src/components/GlobalErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { errorTracker } from '@utils/errorHandler';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    errorTracker.track(error, { componentStack: errorInfo.componentStack });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

function ErrorFallback({
  error,
  onReset,
}: {
  error?: Error;
  onReset: () => void;
}): JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>😵</Text>
      <Text style={styles.title}>应用遇到了问题</Text>
      <Text style={styles.message}>
        我们已记录此错误，请尝试重新加载应用。
      </Text>
      {__DEV__ && error && (
        <ScrollView style={styles.errorBox}>
          <Text style={styles.errorText}>{error.message}</Text>
          <Text style={styles.errorText}>{error.stack}</Text>
        </ScrollView>
      )}
      <TouchableOpacity style={styles.button} onPress={onReset}>
        <Text style={styles.buttonText}>重新加载</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  message: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 16 },
  errorBox: {
    width: '100%',
    maxHeight: 200,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { fontSize: 12, color: '#FF3B30', fontFamily: 'monospace' },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
```

---

## 附录 J: 2025-2026 移动端技术趋势总结

### 趋势 1: Bridgeless 成为默认
React Native 0.76 默认启用 Bridgeless 模式，JSI 成为唯一通信方式。这意味着所有原生模块必须通过 JSI 或 TurboModules 暴露，旧的 Bridge API 逐步淘汰。

### 趋势 2: Expo 生态系统主导地位
Expo SDK 52 覆盖了 90% 以上的常见移动端需求，EAS Build/Update 成为行业标准。裸 React Native 项目比例持续下降，新项目几乎清一色选择 Expo。

### 趋势 3: 跨平台统一
React Native Web 配合 Expo Router 实现了真正的 "Write Once, Run Anywhere"。一套代码同时支持 iOS、Android 和 Web，通过条件编译和平台检测处理差异。

### 趋势 4: AI 集成
On-device ML 通过 Core ML (iOS) 和 TensorFlow Lite (Android) 集成到 React Native。本地推理、图像识别、自然语言处理成为常见功能。

### 趋势 5: 边缘计算
配合 Cloudflare Workers 和 Vercel Edge Functions，移动端应用实现了更靠近用户的计算部署，显著降低延迟。

### 趋势 6: 隐私优先
iOS 17+ 和 Android 14+ 的隐私限制越来越严格。应用必须通过明确的权限请求、最小数据收集和端到端加密来赢得用户信任。
