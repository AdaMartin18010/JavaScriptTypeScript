# 03 - 跨平台代码共享与 Monorepo 实践

> **版本信息**: pnpm workspaces | Turborepo 2.x | Expo SDK 52 | React Native 0.76 | TypeScript 5.6 (Project References)
> **目标读者**: 需要同时维护 Web 和移动端应用的团队，希望最大化代码复用率
> **阅读时长**: 约 50 分钟

---

## 目录

1. [跨平台代码共享策略概述](#一跨平台代码共享策略概述)
2. [Monorepo 架构选型](#二monorepo-架构选型)
3. [Turborepo + pnpm Workspace 配置](#三turborepo--pnpm-workspace-配置)
4. [共享包设计原则](#四共享包设计原则)
5. [平台差异化处理](#五平台差异化处理)
6. [React Native Web 统一构建](#六react-native-web-统一构建)
7. [Expo Router Web 适配](#七expo-router-web-适配)
8. [代码示例：完整的 Monorepo 项目](#八代码示例完整的-monorepo-项目)
9. [构建与发布流程](#九构建与发布流程)
10. [常见陷阱与解决方案](#十常见陷阱与解决方案)

---

## 一、跨平台代码共享策略概述

### 1.1 代码共享层次模型

在同时维护 Web 和移动端应用时，代码可按复用层次分为：

```
┌─────────────────────────────────────────────────────────────┐
│                    跨平台代码共享层次                         │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: 业务逻辑层 (Business Logic)                         │
│          • API 客户端封装                                    │
│          • 状态管理逻辑 (Zustand stores)                     │
│          • 表单验证规则 (Zod schemas)                        │
│          • 工具函数 (formatters, validators)                │
│          复用率: 90-95%                                      │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: 组件抽象层 (Component Abstractions)                 │
│          • 设计系统 Tokens (colors, spacing, typography)    │
│          • 无头组件 (Headless UI patterns)                  │
│          • 自定义 Hooks (useAuth, useTheme, useDebounce)    │
│          复用率: 70-80%                                      │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: 视图组件层 (View Components)                        │
│          • 跨平台组件库 (Tamagui, NativeWind, Dripsy)       │
│          • 条件渲染组件                                      │
│          复用率: 40-60%                                      │
├─────────────────────────────────────────────────────────────┤
│ Layer 1: 平台特定层 (Platform Specific)                      │
│          • 导航 (React Router vs React Navigation)          │
│          • 原生模块 (Camera, Biometrics, Push)              │
│          • 平台特定 UI (SafeArea, StatusBar)                │
│          复用率: 0-10%                                       │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 技术方案对比

| 方案 | 代表工具 | 复用率 | 学习成本 | 性能 | 适用场景 |
|-----|---------|--------|---------|------|---------|
| **Monorepo + 共享包** | pnpm + Turborepo | 80%+ | 中 | 最优 | 中大型团队 |
| **跨平台组件库** | Tamagui, NativeWind | 60% | 中 | 良好 | 设计系统优先 |
| **Expo Web** | expo-router | 70% | 低 | 良好 | Expo 生态项目 |
| **React Native Web** | react-native-web | 50% | 低 | 一般 | 简单页面 |
| **Tauri + React** | Tauri | 30% | 高 | 最优 | 桌面应用为主 |
| **Flutter Web** | Flutter | 90% | 高 | 较差 | Flutter 生态 |

**2026 年推荐方案**: 对于 React Native + Web 场景，采用 **Monorepo + Turborepo + 共享包** 配合 **Tamagui 或 NativeWind** 实现跨平台 UI，可获得最佳的代码复用率和性能平衡。

---

## 二、Monorepo 架构选型

### 2.1 Monorepo 工具对比

| 特性 | pnpm Workspaces | Nx | Turborepo | Rush | Lerna |
|-----|----------------|-----|----------|------|-------|
| **包管理** | pnpm (原生) | npm/yarn/pnpm | 任意 | 任意 | npm/yarn |
| **任务编排** | 基础 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **远程缓存** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **依赖图分析** | ❌ | ✅ | ✅ | ✅ | ❌ |
| ** affected 命令** | ❌ | ✅ | ✅ | ✅ | ❌ |
| **配置复杂度** | 低 | 高 | 中 | 高 | 中 |
| **社区活跃度** | 高 | 高 | 高 | 中 | 低(已弃用) |
| **2026 推荐度** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |

### 2.2 架构决策矩阵

```
团队规模 < 10 人?
    ├── 是 → 使用 pnpm workspaces 即可
    │         无需复杂任务编排
    │
    └── 否 → 需要 CI/CD 优化?
              │
              ├── 是 → 使用 Turborepo + Remote Cache
              │         显著减少 CI 构建时间
              │
              └── 否 → 使用 Nx 或 Turborepo
                        利用依赖图分析和 affected 命令
```

---

## 三、Turborepo + pnpm Workspace 配置

### 3.1 目录结构

```
my-monorepo/
├── pnpm-workspace.yaml      # pnpm 工作区配置
├── turbo.json               # Turborepo 管道配置
├── package.json             # 根包配置
├── tsconfig.json            # 根 TypeScript 配置
├── apps/
│   ├── mobile/              # Expo 移动端应用
│   │   ├── package.json
│   │   ├── App.tsx
│   │   ├── app.json
│   │   └── src/
│   └── web/                 # Next.js Web 应用
│       ├── package.json
│       ├── next.config.js
│       └── src/
├── packages/
│   ├── ui/                  # 跨平台 UI 组件库
│   │   ├── package.json
│   │   ├── src/
│   │   └── tsconfig.json
│   ├── shared/              # 共享业务逻辑
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── api/
│   │   │   ├── stores/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── tsconfig.json
│   ├── config/              # 共享配置 (eslint, tsconfig)
│   │   ├── package.json
│   │   ├── eslint-preset.js
│   │   └── tsconfig/
│   └── types/               # 全局类型定义
│       ├── package.json
│       └── src/
└── tooling/                 # 构建脚本和工具
    └── scripts/
```

### 3.2 pnpm Workspace 配置

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"

# 共享依赖提升 (减少重复安装)
shared-workspace-lockfile: true

# 严格对等依赖
strict-peer-dependencies: false
```

### 3.3 根 package.json

```json
{
  "name": "my-monorepo",
  "private": true,
  "packageManager": "pnpm@9.0.0",
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\""
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.6.0",
    "prettier": "^3.3.0",
    "@turbo/gen": "^2.0.0"
  }
}
```

### 3.4 Turborepo 管道配置

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "expo-router/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 3.5 TypeScript Project References

```json
// tsconfig.json (根配置)
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "bundler"
  },
  "references": [
    { "path": "./packages/types" },
    { "path": "./packages/config" },
    { "path": "./packages/shared" },
    { "path": "./packages/ui" },
    { "path": "./apps/mobile" },
    { "path": "./apps/web" }
  ]
}
```

```json
// packages/shared/tsconfig.json
{
  "extends": "../config/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": ".",
    "paths": {
      "@myrepo/types": ["../types/src"]
    }
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../types" }
  ]
}
```

---

## 四、共享包设计原则

### 4.1 包依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                      包依赖关系                              │
│                                                             │
│                    ┌──────────┐                             │
│                    │  @myrepo │                             │
│                    │  /config │                             │
│                    └────┬─────┘                             │
│                         │                                   │
│                    ┌────┴─────┐                             │
│                    │  @myrepo │                             │
│                    │  /types  │                             │
│                    └────┬─────┘                             │
│                         │                                   │
│        ┌────────────────┼────────────────┐                 │
│        │                │                │                 │
│   ┌────┴─────┐    ┌────┴─────┐    ┌────┴─────┐           │
│   │ @myrepo  │    │ @myrepo  │    │ @myrepo  │           │
│   │ /shared  │    │  /ui     │    │ /utils   │           │
│   └────┬─────┘    └────┬─────┘    └──────────┘           │
│        │               │                                   │
│        └───────┬───────┘                                   │
│                │                                           │
│           ┌────┴─────┐                                     │
│           │  apps    │                                     │
│           │ (mobile  │                                     │
│           │  + web)  │                                     │
│           └──────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 共享 API 客户端包

```typescript
// packages/shared/src/api/client.ts
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL 
  || process.env.NEXT_PUBLIC_API_URL 
  || 'https://api.example.com/v1';

export interface ApiConfig {
  baseURL?: string;
  timeout?: number;
  getToken?: () => Promise<string | null>;
  onAuthError?: () => void;
}

export function createApiClient(config: ApiConfig = {}): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL || API_BASE_URL,
    timeout: config.timeout || 15000,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  client.interceptors.request.use(
    async (reqConfig: InternalAxiosRequestConfig) => {
      if (config.getToken) {
        const token = await config.getToken();
        if (token && reqConfig.headers) {
          reqConfig.headers.Authorization = `Bearer ${token}`;
        }
      }
      return reqConfig;
    },
    (error) => Promise.reject(error)
  );

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401 && config.onAuthError) {
        config.onAuthError();
      }
      return Promise.reject(error);
    }
  );

  return client;
}
```

```typescript
// packages/shared/src/api/services/postService.ts
import { createApiClient } from '../client';
import { Post, PaginatedResponse, CreatePostInput } from '@myrepo/types';

interface PostsFilter {
  page?: number;
  limit?: number;
  tag?: string;
  search?: string;
}

export function createPostService(getToken?: () => Promise<string | null>) {
  const client = createApiClient({ getToken });

  return {
    async getPosts(filter: PostsFilter = {}): Promise<PaginatedResponse<Post>> {
      const { data } = await client.get<PaginatedResponse<Post>>('/posts', { params: filter });
      return data;
    },

    async getPost(id: string): Promise<Post> {
      const { data } = await client.get<Post>(`/posts/${id}`);
      return data;
    },

    async createPost(input: CreatePostInput): Promise<Post> {
      const { data } = await client.post<Post>('/posts', input);
      return data;
    },

    async updatePost(id: string, input: Partial<CreatePostInput>): Promise<Post> {
      const { data } = await client.put<Post>(`/posts/${id}`, input);
      return data;
    },

    async deletePost(id: string): Promise<void> {
      await client.delete(`/posts/${id}`);
    },
  };
}

export type PostService = ReturnType<typeof createPostService>;
```

### 4.3 共享 Zustand Store

```typescript
// packages/shared/src/stores/authStore.ts
import { create, StoreApi } from 'zustand';
import { User, AuthStatus } from '@myrepo/types';
import { createPostService } from '../api/services/postService';

interface AuthState {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;

  setToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  setStatus: (status: AuthStatus) => void;
  logout: () => void;
}

export type AuthStore = StoreApi<AuthState>;

export function createAuthStore(
  getToken: () => string | null,
  setTokenStorage: (token: string | null) => Promise<void>
): AuthStore {
  return create<AuthState>((set, get) => ({
    user: null,
    token: getToken(),
    status: 'idle',
    isAuthenticated: false,

    setToken: (token) => {
      set({ token, isAuthenticated: !!token });
      setTokenStorage(token);
    },

    setUser: (user) => set({ user }),

    setStatus: (status) => set({ status }),

    logout: async () => {
      await setTokenStorage(null);
      set({ user: null, token: null, status: 'unauthenticated', isAuthenticated: false });
    },
  }));
}
```

### 4.4 包入口配置

```json
// packages/shared/package.json
{
  "name": "@myrepo/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.js"
    },
    "./api": {
      "types": "./dist/api/index.d.ts",
      "import": "./dist/api/index.mjs",
      "require": "./dist/api/index.js"
    },
    "./stores": {
      "types": "./dist/stores/index.d.ts",
      "import": "./dist/stores/index.mjs",
      "require": "./dist/stores/index.js"
    }
  },
  "scripts": {
    "build": "tsup src/index.ts src/api/index.ts src/stores/index.ts --format cjs,esm --dts",
    "dev": "tsup src/index.ts --format cjs,esm --dts --watch",
    "lint": "eslint src/",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "axios": "^1.7.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.6.0",
    "@myrepo/types": "workspace:*",
    "@myrepo/config": "workspace:*"
  }
}
```

---

## 五、平台差异化处理

### 5.1 平台检测与条件代码

```typescript
// packages/shared/src/utils/platform.ts
import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isMobile = isIOS || isAndroid;
export const isNative = isMobile;

// 平台特定的常量
export const platformSelect = <T>(spec: { native?: T; web?: T; ios?: T; android?: T; default: T }): T => {
  if (isIOS && spec.ios !== undefined) return spec.ios;
  if (isAndroid && spec.android !== undefined) return spec.android;
  if (isNative && spec.native !== undefined) return spec.native;
  if (isWeb && spec.web !== undefined) return spec.web;
  return spec.default;
};
```

### 5.2 平台特定组件封装

```typescript
// packages/ui/src/components/PlatformView.tsx
import React from 'react';
import { View, ViewProps, ScrollView, ScrollViewProps } from 'react-native';

interface PlatformViewProps extends ViewProps {
  children: React.ReactNode;
  useScrollView?: boolean;
  scrollProps?: ScrollViewProps;
}

export function PlatformView({ children, useScrollView, scrollProps, ...viewProps }: PlatformViewProps): JSX.Element {
  if (useScrollView) {
    return (
      <ScrollView {...scrollProps}>
        <View {...viewProps}>{children}</View>
      </ScrollView>
    );
  }
  return <View {...viewProps}>{children}</View>;
}
```

### 5.3 存储抽象层

```typescript
// packages/shared/src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// React Native 实现
export const rnStorage: StorageAdapter = {
  getItem: AsyncStorage.getItem,
  setItem: AsyncStorage.setItem,
  removeItem: AsyncStorage.removeItem,
};

// Web 实现 (使用 localStorage)
export const webStorage: StorageAdapter = {
  getItem: async (key: string) => {
    return localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    localStorage.removeItem(key);
  },
};

// 工厂函数
export function createStorage(platform: 'web' | 'native'): StorageAdapter {
  return platform === 'web' ? webStorage : rnStorage;
}
```

---

## 六、React Native Web 统一构建

### 6.1 Expo Web 配置

```javascript
// apps/web/next.config.js
const { withExpo } = require('@expo/next-adapter');
const withTM = require('next-transpile-modules')([
  '@myrepo/ui',
  '@myrepo/shared',
  '@myrepo/types',
  'react-native',
  'react-native-web',
  '@expo/webpack-config',
]);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'react-native',
    'react-native-web',
    '@expo/vector-icons',
    '@myrepo/ui',
    '@myrepo/shared',
  ],
  experimental: {
    turbo: {
      resolveAlias: {
        'react-native$': 'react-native-web',
      },
    },
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    config.resolve.extensions = [
      '.web.js',
      '.web.jsx',
      '.web.ts',
      '.web.tsx',
      ...config.resolve.extensions,
    ];
    return config;
  },
};

module.exports = withExpo(withTM(nextConfig));
```

### 6.2 Metro Web 配置 (Expo Router)

```javascript
// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 支持 Web 构建
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
  'web.js',
  'web.ts',
  'web.tsx',
];

// 别名映射
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
};

module.exports = config;
```

---

## 七、Expo Router Web 适配

### 7.1 文件系统路由共享

Expo Router v3 支持通过 `app/` 目录的文件系统自动生成路由，且可同时用于 Native 和 Web：

```
apps/mobile/app/
├── _layout.tsx           # 根布局 (共享导航结构)
├── index.tsx             # 首页
├── explore/
│   └── index.tsx         # /explore
├── post/
│   └── [id].tsx          # /post/:id
├── profile/
│   └── [userId].tsx      # /profile/:userId
└── settings.tsx          # /settings
```

```typescript
// apps/mobile/app/_layout.tsx
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="index" options={{ title: '首页' }} />
          <Stack.Screen name="explore" options={{ title: '探索' }} />
          <Stack.Screen name="post/[id]" options={{ title: '帖子详情' }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
```

### 7.2 深度链接统一配置

```typescript
// apps/mobile/app/linking.ts
import * as Linking from 'expo-linking';

export const linking = {
  prefixes: [
    Linking.createURL('/'),
    'https://myapp.com',
    'myapp://',
  ],
};
```

---

## 八、代码示例：完整的 Monorepo 项目

### 8.1 跨平台按钮组件

```typescript
// packages/ui/src/components/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
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
  const colors = {
    primary: '#007AFF',
    secondary: '#5856D6',
    text: '#000000',
    textSecondary: '#666666',
    background: '#FFFFFF',
    border: '#E5E5EA',
    error: '#FF3B30',
  };

  const getBackgroundColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.secondary;
      case 'outline':
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.background;
    switch (variant) {
      case 'primary':
      case 'secondary': return '#FFFFFF';
      case 'outline':
      case 'ghost': return colors.primary;
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
          borderColor: colors.primary,
          ...getPadding(),
        },
        Platform.select({
          web: { cursor: disabled ? 'not-allowed' : 'pointer' },
          default: {},
        }),
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
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

### 8.2 跨平台表单 Hook

```typescript
// packages/shared/src/hooks/useForm.ts
import { useState, useCallback } from 'react';
import { ZodSchema, ZodError } from 'zod';

interface FieldState<T> {
  value: T;
  error?: string;
  touched: boolean;
}

interface UseFormOptions<T> {
  initialValues: T;
  schema: ZodSchema<T>;
  onSubmit: (values: T) => Promise<void>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: <K extends keyof T>(field: K, value: T[K]) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(options.initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((fieldValues: T): boolean => {
    try {
      options.schema.parse(fieldValues);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof T;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [options.schema]);

  const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validate({ ...values, [field]: value } as T);
    }
  }, [values, touched, validate]);

  const handleBlur = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate(values);
  }, [values, validate]);

  const handleSubmit = useCallback(async () => {
    setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (!validate(values)) return;
    
    setIsSubmitting(true);
    try {
      await options.onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate, options]);

  const reset = useCallback(() => {
    setValues(options.initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [options.initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}
```

### 8.3 Web 端使用共享组件

```tsx
// apps/web/src/pages/index.tsx
import { Button } from '@myrepo/ui';
import { useForm } from '@myrepo/shared';
import { loginSchema } from '@myrepo/shared';

export default function HomePage() {
  const form = useForm({
    initialValues: { email: '', password: '' },
    schema: loginSchema,
    onSubmit: async (values) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      // 处理响应
    },
  });

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 40 }}>
      <h1>Web 应用</h1>
      <input
        type="email"
        value={form.values.email}
        onChange={(e) => form.handleChange('email', e.target.value)}
        onBlur={() => form.handleBlur('email')}
        placeholder="邮箱"
      />
      {form.errors.email && <span style={{ color: 'red' }}>{form.errors.email}</span>}
      
      <input
        type="password"
        value={form.values.password}
        onChange={(e) => form.handleChange('password', e.target.value)}
        onBlur={() => form.handleBlur('password')}
        placeholder="密码"
      />
      {form.errors.password && <span style={{ color: 'red' }}>{form.errors.password}</span>}
      
      <Button
        title="登录"
        onPress={form.handleSubmit}
        loading={form.isSubmitting}
      />
    </div>
  );
}
```

### 8.4 Mobile 端使用共享组件

```tsx
// apps/mobile/src/screens/LoginScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '@myrepo/ui';
import { useForm, loginSchema } from '@myrepo/shared';
import { SafeAreaView } from 'react-native-safe-area-context';

export function LoginScreen(): JSX.Element {
  const form = useForm({
    initialValues: { email: '', password: '' },
    schema: loginSchema,
    onSubmit: async (values) => {
      // 使用共享 API 客户端
      console.log('Login:', values);
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>移动端登录</Text>
      {/* 使用与 Web 相同的 Button 组件 */}
      <Button
        title="登录"
        onPress={form.handleSubmit}
        loading={form.isSubmitting}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
});
```

---

## 九、构建与发布流程

### 9.1 CI/CD 管道配置

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
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
      - run: pnpm turbo run lint typecheck

  test:
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
      - run: pnpm turbo run test

  build:
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
      - run: pnpm turbo run build

  deploy-web:
    needs: [lint-and-typecheck, test, build]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm --filter web build
      # 部署到 Vercel/Netlify
```

### 9.2 Turborepo Remote Cache

```bash
# 配置 Vercel Remote Cache
echo "TURBO_TOKEN=$TURBO_TOKEN" >> $GITHUB_ENV
echo "TURBO_TEAM=$TURBO_TEAM" >> $GITHUB_ENV

# 本地开发时启用
turbo run build --remote-only
```

### 9.3 EAS Build 集成

```json
// apps/mobile/eas.json
{
  "cli": {
    "version": ">= 12.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

```bash
# 构建时先构建共享包
pnpm --filter @myrepo/shared build
pnpm --filter @myrepo/ui build

# 然后构建移动端
cd apps/mobile
eas build --platform ios
```

---

## 十、常见陷阱与解决方案

### 陷阱 1: pnpm Workspace 依赖解析失败

**现象**: `Cannot find module '@myrepo/shared'`

**解决方案**:
```bash
# 确保在根目录执行 pnpm install
pnpm install

# 检查 workspace 包是否正确声明
# packages/shared/package.json 必须有:
# "name": "@myrepo/shared"

# 引用时使用 workspace: 协议
# apps/mobile/package.json:
# "dependencies": { "@myrepo/shared": "workspace:*" }
```

### 陷阱 2: Metro 无法解析 Workspace 包

**现象**: Metro bundler 报错找不到 Monorepo 中的包

**解决方案**:
```javascript
// apps/mobile/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// 添加 Monorepo 路径
const monorepoPackages = {
  '@myrepo/shared': path.resolve(__dirname, '../../packages/shared'),
  '@myrepo/ui': path.resolve(__dirname, '../../packages/ui'),
  '@myrepo/types': path.resolve(__dirname, '../../packages/types'),
};

config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  ...monorepoPackages,
};

config.watchFolders = [
  path.resolve(__dirname, '../../packages'),
];

module.exports = config;
```

### 陷阱 3: TypeScript Project References 编译失败

**现象**: `tsc` 报错找不到依赖包的类型定义

**解决方案**:
```json
// 确保每个包都有正确的 references 链
// packages/ui/tsconfig.json
{
  "extends": "../config/tsconfig/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "references": [
    { "path": "../types" },
    { "path": "../config" }
  ]
}

// 根 tsconfig.json 使用 references 而非 files/include
{
  "files": [],
  "references": [
    { "path": "./packages/types" },
    { "path": "./packages/shared" },
    { "path": "./packages/ui" },
    { "path": "./apps/mobile" },
    { "path": "./apps/web" }
  ]
}
```

### 陷阱 4: react-native-web 样式不一致

**现象**: 相同组件在 Native 和 Web 上样式表现不同

**解决方案**:
```typescript
// 使用 Platform.select 或统一的设计系统
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    padding: 16,
    ...Platform.select({
      web: {
        maxWidth: 1200,
        marginHorizontal: 'auto',
      },
      native: {
        flex: 1,
      },
    }),
  },
});
```

### 陷阱 5: 共享包中的环境变量访问

**现象**: `process.env` 在共享包中未定义

**解决方案**:
```typescript
// packages/shared/src/config.ts
// 不要直接在共享包中使用 process.env
// 改为接收配置参数

export interface AppConfig {
  apiUrl: string;
  appName: string;
  enableAnalytics: boolean;
}

let globalConfig: AppConfig | null = null;

export function initializeConfig(config: AppConfig) {
  globalConfig = config;
}

export function getConfig(): AppConfig {
  if (!globalConfig) {
    throw new Error('Config not initialized');
  }
  return globalConfig;
}

// 在应用入口初始化
// apps/mobile/App.tsx
import { initializeConfig } from '@myrepo/shared';

initializeConfig({
  apiUrl: process.env.EXPO_PUBLIC_API_URL!,
  appName: process.env.EXPO_PUBLIC_APP_NAME!,
  enableAnalytics: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
});
```

### 陷阱 6: EAS Build 找不到 Workspace 依赖

**现象**: EAS Build 云端构建时 Workspace 包未打包

**解决方案**:
```json
// apps/mobile/package.json
{
  "scripts": {
    "eas-build-pre-install": "cd ../.. && pnpm install"
  }
}

// 或使用 EAS Monorepo 支持
// eas.json
{
  "build": {
    "production": {
      "env": {
        "PNPM_WORKSPACE": "true"
      }
    }
  }
}
```

### 陷阱 7: 循环依赖导致构建失败

**现象**: `turbo run build` 报错循环依赖

**解决方案**:
```
# 使用以下命令分析依赖图
pnpm m ls --depth=-1

# 确保依赖方向单向:
# types → config → shared → ui → apps
# 避免 ui → shared → ui 这样的循环
```

---

## 总结

跨平台代码共享是现代前端工程化的核心能力之一。通过 Turborepo + pnpm Workspace 构建 Monorepo，配合清晰的包分层架构，可以实现 80% 以上的业务逻辑代码在 Web 和移动端共享。

**关键要点**:

1. **包分层设计**: 业务逻辑层复用率最高 (90%+)，平台特定层保持最小化
2. **TypeScript Project References**: 确保跨包类型安全和增量编译
3. **Turborepo 管道**: 通过依赖图分析实现最优的构建和测试编排
4. **存储和网络抽象**: 通过接口隔离平台差异
5. **Expo Router Web**: 一套路由代码同时服务 Native 和 Web

下一步建议阅读 [04-mobile-performance-optimization.md](./04-mobile-performance-optimization.md)，学习如何在 Monorepo 架构下对移动端进行深度性能优化。


---

## 附录 A: 完整的 Monorepo 工具链配置

### A.1 _changeset 版本管理配置

```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "restricted",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

```bash
# 使用 changeset 管理版本
pnpm add -D @changesets/cli

# 创建变更集
pnpm changeset

# 版本提升
pnpm changeset version

# 发布
pnpm changeset publish
```

### A.2 Lint-staged 与 Husky 配置

```json
// package.json (根)
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

pnpm lint-staged
```

---

## 附录 B: 跨平台设计系统实现

```typescript
// packages/ui/src/theme/tokens.ts
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
} as const;

export const borderRadius = {
  none: 0,
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  full: 9999,
} as const;

export const typography = {
  xs: { fontSize: 12, lineHeight: 16 },
  sm: { fontSize: 14, lineHeight: 20 },
  base: { fontSize: 16, lineHeight: 24 },
  lg: { fontSize: 18, lineHeight: 28 },
  xl: { fontSize: 20, lineHeight: 28 },
  '2xl': { fontSize: 24, lineHeight: 32 },
  '3xl': { fontSize: 30, lineHeight: 36 },
  '4xl': { fontSize: 36, lineHeight: 40 },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
} as const;
```

### B.1 跨平台文本组件

```tsx
// packages/ui/src/components/Text.tsx
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { useTheme } from '@hooks/useTheme';
import { typography } from '../theme/tokens';

type TextVariant = keyof typeof typography;

type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
}

export function Text({
  variant = 'base',
  weight = 'normal',
  color,
  align,
  style,
  children,
  ...props
}: TextProps): JSX.Element {
  const { colors } = useTheme();
  const textStyle = typography[variant];

  const fontWeightMap: Record<TextWeight, string> = {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  };

  return (
    <RNText
      style={[
        {
          fontSize: textStyle.fontSize,
          lineHeight: textStyle.lineHeight,
          fontWeight: fontWeightMap[weight] as any,
          color: color || colors.text,
          textAlign: align,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
```

### B.2 跨平台 Stack/Flex 布局组件

```tsx
// packages/ui/src/components/Stack.tsx
import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { spacing } from '../theme/tokens';

type SpacingValue = keyof typeof spacing;
type Direction = 'row' | 'column';
type AlignItems = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
type JustifyContent = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';

interface StackProps extends ViewProps {
  direction?: Direction;
  spacing?: SpacingValue;
  align?: AlignItems;
  justify?: JustifyContent;
  flex?: number;
  wrap?: boolean;
  children: React.ReactNode;
}

export function Stack({
  direction = 'column',
  spacing: spacingValue = 4,
  align,
  justify,
  flex,
  wrap,
  style,
  children,
  ...props
}: StackProps): JSX.Element {
  const gap = spacing[spacingValue];

  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap,
          alignItems: align,
          justifyContent: justify,
          flex,
          flexWrap: wrap ? 'wrap' : 'nowrap',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

// 使用示例
// <Stack direction="row" spacing={4} align="center" justify="space-between">
//   <Text>左侧内容</Text>
//   <Button title="操作" />
// </Stack>
```

---

## 附录 C: 完整的跨平台网络层

```typescript
// packages/shared/src/api/index.ts
export { createApiClient } from './client';
export { createPostService } from './services/postService';
export { createAuthService } from './services/authService';
export { createUserService } from './services/userService';

// packages/shared/src/api/services/authService.ts
import { createApiClient } from '../client';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '@myrepo/types';

export function createAuthService(getToken?: () => Promise<string | null>) {
  const client = createApiClient({ getToken });

  return {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
      return client.post<AuthResponse>('/auth/login', credentials);
    },

    async register(data: RegisterCredentials): Promise<AuthResponse> {
      return client.post<AuthResponse>('/auth/register', data);
    },

    async logout(): Promise<void> {
      return client.post('/auth/logout');
    },

    async refreshToken(refreshToken: string): Promise<{ token: string }> {
      return client.post('/auth/refresh', { refreshToken });
    },

    async me(): Promise<User> {
      return client.get<User>('/auth/me');
    },

    async forgotPassword(email: string): Promise<void> {
      return client.post('/auth/forgot-password', { email });
    },

    async resetPassword(token: string, password: string): Promise<void> {
      return client.post('/auth/reset-password', { token, password });
    },

    async socialLogin(provider: 'google' | 'apple' | 'wechat', token: string): Promise<AuthResponse> {
      return client.post<AuthResponse>(`/auth/${provider}`, { token });
    },
  };
}

// packages/shared/src/api/services/userService.ts
import { createApiClient } from '../client';
import { User, UpdateProfileInput, PaginatedResponse } from '@myrepo/types';

export function createUserService(getToken?: () => Promise<string | null>) {
  const client = createApiClient({ getToken });

  return {
    async getUser(id: string): Promise<User> {
      return client.get<User>(`/users/${id}`);
    },

    async updateProfile(data: UpdateProfileInput): Promise<User> {
      return client.patch<User>('/users/me', data);
    },

    async uploadAvatar(uri: string): Promise<{ avatarUrl: string }> {
      const formData = new FormData();
      formData.append('avatar', {
        uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      return client.post('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },

    async followUser(userId: string): Promise<void> {
      return client.post(`/users/${userId}/follow`);
    },

    async unfollowUser(userId: string): Promise<void> {
      return client.delete(`/users/${userId}/follow`);
    },

    async getFollowers(userId: string, page = 1): Promise<PaginatedResponse<User>> {
      return client.get(`/users/${userId}/followers`, { page, limit: 20 });
    },

    async getFollowing(userId: string, page = 1): Promise<PaginatedResponse<User>> {
      return client.get(`/users/${userId}/following`, { page, limit: 20 });
    },
  };
}
```

---

## 附录 D: 跨平台文件系统抽象

```typescript
// packages/shared/src/utils/fileSystem.ts
import { Platform } from 'react-native';

export interface FileInfo {
  uri: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

export interface FileSystemInterface {
  readFile(uri: string): Promise<string>;
  writeFile(uri: string, content: string): Promise<void>;
  deleteFile(uri: string): Promise<void>;
  exists(uri: string): Promise<boolean>;
  getInfo(uri: string): Promise<FileInfo | null>;
  copyFile(fromUri: string, toUri: string): Promise<void>;
  makeDirectory(uri: string): Promise<void>;
  readDirectory(uri: string): Promise<string[]>;
  getFreeSpace(): Promise<number>;
}

// Native 实现 (使用 expo-file-system)
// Web 实现 (使用 File API)
// 工厂函数根据平台返回不同实现
export function createFileSystem(): FileSystemInterface {
  if (Platform.OS === 'web') {
    return createWebFileSystem();
  }
  return createNativeFileSystem();
}

function createNativeFileSystem(): FileSystemInterface {
  // 使用 expo-file-system
  const FS = require('expo-file-system');

  return {
    async readFile(uri: string): Promise<string> {
      return FS.readAsStringAsync(uri);
    },

    async writeFile(uri: string, content: string): Promise<void> {
      return FS.writeAsStringAsync(uri, content);
    },

    async deleteFile(uri: string): Promise<void> {
      return FS.deleteAsync(uri);
    },

    async exists(uri: string): Promise<boolean> {
      const info = await FS.getInfoAsync(uri);
      return info.exists;
    },

    async getInfo(uri: string): Promise<FileInfo | null> {
      const info = await FS.getInfoAsync(uri, { size: true });
      if (!info.exists) return null;
      return {
        uri: info.uri,
        name: uri.split('/').pop() || '',
        size: info.size || 0,
        type: '',
        lastModified: info.modificationTime || Date.now(),
      };
    },

    async copyFile(fromUri: string, toUri: string): Promise<void> {
      return FS.copyAsync({ from: fromUri, to: toUri });
    },

    async makeDirectory(uri: string): Promise<void> {
      return FS.makeDirectoryAsync(uri, { intermediates: true });
    },

    async readDirectory(uri: string): Promise<string[]> {
      return FS.readDirectoryAsync(uri);
    },

    async getFreeSpace(): Promise<number> {
      return FS.getFreeDiskStorageAsync();
    },
  };
}

function createWebFileSystem(): FileSystemInterface {
  // Web 环境使用 IndexedDB 或 LocalStorage 模拟
  return {
    async readFile(uri: string): Promise<string> {
      return localStorage.getItem(uri) || '';
    },

    async writeFile(uri: string, content: string): Promise<void> {
      localStorage.setItem(uri, content);
    },

    async deleteFile(uri: string): Promise<void> {
      localStorage.removeItem(uri);
    },

    async exists(uri: string): Promise<boolean> {
      return localStorage.getItem(uri) !== null;
    },

    async getInfo(uri: string): Promise<FileInfo | null> {
      const content = localStorage.getItem(uri);
      if (!content) return null;
      return {
        uri,
        name: uri.split('/').pop() || '',
        size: new Blob([content]).size,
        type: 'text/plain',
        lastModified: Date.now(),
      };
    },

    async copyFile(fromUri: string, toUri: string): Promise<void> {
      const content = localStorage.getItem(fromUri);
      if (content) localStorage.setItem(toUri, content);
    },

    async makeDirectory(): Promise<void> {
      // Web 不真正创建目录
    },

    async readDirectory(): Promise<string[]> {
      return Object.keys(localStorage);
    },

    async getFreeSpace(): Promise<number> {
      return 1024 * 1024 * 1024; // 假设 1GB
    },
  };
}
```

---

## 附录 E: 跨平台推送通知抽象

```typescript
// packages/shared/src/utils/notifications.ts
import { Platform } from 'react-native';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: boolean;
  badge?: number;
}

export interface PushToken {
  type: 'expo' | 'fcm' | 'apns';
  token: string;
}

export interface NotificationInterface {
  requestPermissions(): Promise<boolean>;
  getPermissions(): Promise<boolean>;
  getPushToken(): Promise<PushToken | null>;
  scheduleNotification(payload: NotificationPayload, delay?: number): Promise<string>;
  cancelNotification(id: string): Promise<void>;
  cancelAllNotifications(): Promise<void>;
  setBadgeCount(count: number): Promise<void>;
  addListener(callback: (notification: NotificationPayload) => void): () => void;
}

export function createNotificationManager(): NotificationInterface {
  if (Platform.OS === 'web') {
    return createWebNotificationManager();
  }
  return createNativeNotificationManager();
}

function createNativeNotificationManager(): NotificationInterface {
  const Notifications = require('expo-notifications');
  const Device = require('expo-device');

  return {
    async requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    },

    async getPermissions() {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    },

    async getPushToken() {
      if (!Device.isDevice) return null;
      const { data } = await Notifications.getExpoPushTokenAsync();
      return { type: 'expo' as const, token: data };
    },

    async scheduleNotification(payload, delay = 0) {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
          sound: payload.sound,
          badge: payload.badge,
        },
        trigger: delay > 0 ? { seconds: delay } : null,
      });
      return id;
    },

    async cancelNotification(id) {
      await Notifications.cancelScheduledNotificationAsync(id);
    },

    async cancelAllNotifications() {
      await Notifications.cancelAllScheduledNotificationsAsync();
    },

    async setBadgeCount(count) {
      await Notifications.setBadgeCountAsync(count);
    },

    addListener(callback) {
      const subscription = Notifications.addNotificationReceivedListener(callback);
      return () => subscription.remove();
    },
  };
}

function createWebNotificationManager(): NotificationInterface {
  return {
    async requestPermissions() {
      if (!('Notification' in window)) return false;
      const result = await Notification.requestPermission();
      return result === 'granted';
    },

    async getPermissions() {
      if (!('Notification' in window)) return false;
      return Notification.permission === 'granted';
    },

    async getPushToken() {
      // Web Push 需要 Service Worker 和 VAPID
      return null;
    },

    async scheduleNotification(payload) {
      if (Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          data: payload.data,
        });
      }
      return 'web-notification';
    },

    async cancelNotification() {
      // Web 无法取消已显示的通知
    },

    async cancelAllNotifications() {
      // 有限支持
    },

    async setBadgeCount() {
      // Web 有限支持
    },

    addListener(callback) {
      // Web 通过 Service Worker 监听
      return () => {};
    },
  };
}
```

---

## 附录 F: 跨平台 Monorepo 发布策略

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  version:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v3
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - name: Create Release Pull Request
        uses: changesets/action@v1
        with:
          publish: pnpm release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## 附录 G: 跨平台调试技巧

### React Native Debugger 配置

```bash
# 安装 React Native Debugger
brew install react-native-debugger

# 启动
open "rndebugger://set-debugger-loc?host=localhost&port=8081"
```

### Flipper 插件推荐

| 插件 | 用途 | 安装方式 |
|-----|------|---------|
| Network | HTTP 请求监控 | 内置 |
| React DevTools | 组件树和 Profiler | 内置 |
| Logs | 日志过滤和搜索 | 内置 |
| AsyncStorage | 本地存储查看 | 内置 |
| Performance | 性能追踪 | 内置 |
| Redux Debugger | Zustand/Redux 状态 | 社区插件 |
| Navigation | 路由栈查看 | 社区插件 |

### 远程调试配置

```typescript
// src/utils/debug.ts
import { Platform } from 'react-native';

export function setupDebugging() {
  if (__DEV__) {
    // 启用 Reactotron (可选)
    if (Platform.OS !== 'web') {
      const Reactotron = require('reactotron-react-native').default;
      Reactotron.configure({ name: 'JSTS Mobile' }).useReactNative().connect();
    }

    // 全局日志增强
    const originalConsoleLog = console.log;
    console.log = (...args: any[]) => {
      originalConsoleLog(
        `[${new Date().toISOString()}]`,
        ...args
      );
    };
  }
}
```


---

## 附录 H: 完整的跨平台动画系统

```tsx
// packages/ui/src/components/AnimatedView.tsx
import React from 'react';
import { ViewStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';

type AnimationPreset = 'fade' | 'slide' | 'zoom' | 'bounce' | 'flip';
type AnimationDirection = 'up' | 'down' | 'left' | 'right';

interface AnimatedViewProps {
  children: React.ReactNode;
  animation?: AnimationPreset;
  direction?: AnimationDirection;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
  entering?: boolean;
  exiting?: boolean;
}

export function AnimatedView({
  children,
  animation = 'fade',
  direction = 'up',
  delay = 0,
  duration = 300,
  style,
  entering = true,
  exiting = true,
}: AnimatedViewProps): JSX.Element {
  const getEnteringAnimation = () => {
    switch (animation) {
      case 'fade':
        return FadeIn.duration(duration).delay(delay);
      case 'slide':
        return SlideInRight.duration(duration).delay(delay);
      case 'zoom':
        return ZoomIn.duration(duration).delay(delay);
      default:
        return FadeIn;
    }
  };

  const getExitingAnimation = () => {
    switch (animation) {
      case 'fade':
        return FadeOut.duration(duration);
      case 'slide':
        return SlideOutLeft.duration(duration);
      case 'zoom':
        return ZoomOut.duration(duration);
      default:
        return FadeOut;
    }
  };

  return (
    <Animated.View
      style={[styles.container, style]}
      entering={entering ? getEnteringAnimation() : undefined}
      exiting={exiting ? getExitingAnimation() : undefined}
    >
      {children}
    </Animated.View>
  );
}

// 手势动画卡片
export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
}: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}): JSX.Element {
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.card, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {},
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});
```

---

## 附录 I: 完整的跨平台日志系统

```typescript
// packages/shared/src/utils/logger.ts
import { Platform } from 'react-native';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: number;
  tag?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs = 1000;
  private minLevel: LogLevel = __DEV__ ? 'debug' : 'warn';

  private levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
    fatal: 4,
  };

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.minLevel];
  }

  private log(level: LogLevel, message: string, tag?: string, metadata?: Record<string, unknown>) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: Date.now(),
      tag,
      metadata: {
        ...metadata,
        platform: Platform.OS,
      },
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // 控制台输出
    const prefix = tag ? `[${tag}] ` : '';
    switch (level) {
      case 'debug':
        console.debug(`${prefix}${message}`, metadata || '');
        break;
      case 'info':
        console.info(`${prefix}${message}`, metadata || '');
        break;
      case 'warn':
        console.warn(`${prefix}${message}`, metadata || '');
        break;
      case 'error':
      case 'fatal':
        console.error(`${prefix}${message}`, metadata || '');
        break;
    }
  }

  debug(message: string, tag?: string, metadata?: Record<string, unknown>) {
    this.log('debug', message, tag, metadata);
  }

  info(message: string, tag?: string, metadata?: Record<string, unknown>) {
    this.log('info', message, tag, metadata);
  }

  warn(message: string, tag?: string, metadata?: Record<string, unknown>) {
    this.log('warn', message, tag, metadata);
  }

  error(message: string, tag?: string, metadata?: Record<string, unknown>) {
    this.log('error', message, tag, metadata);
  }

  fatal(message: string, tag?: string, metadata?: Record<string, unknown>) {
    this.log('fatal', message, tag, metadata);
  }

  getLogs(level?: LogLevel, tag?: string): LogEntry[] {
    return this.logs.filter((log) => {
      if (level && log.level !== level) return false;
      if (tag && log.tag !== tag) return false;
      return true;
    });
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  clear() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
```

---

## 附录 J: 完整的跨平台日期时间处理

```typescript
// packages/shared/src/utils/dateTime.ts
export function formatDate(date: Date | string, locale: string = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string, locale: string = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string, locale: string = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: Date | string, locale: string = 'zh-CN'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) return locale === 'zh-CN' ? '刚刚' : 'just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return locale === 'zh-CN' ? `${mins}分钟前` : `${mins}m ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return locale === 'zh-CN' ? `${hours}小时前` : `${hours}h ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return locale === 'zh-CN' ? `${days}天前` : `${days}d ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return locale === 'zh-CN' ? `${weeks}周前` : `${weeks}w ago`;
  }

  return formatDate(d, locale);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function getAge(birthDate: Date | string): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}
```

---

## 附录 K: 跨平台支付抽象层示例

```typescript
// packages/shared/src/payment/types.ts
export interface PaymentProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  errorCode?: string;
}

export interface PaymentProvider {
  name: string;
  initialize(): Promise<void>;
  purchase(product: PaymentProduct): Promise<PaymentResult>;
  restorePurchases(): Promise<PaymentProduct[]>;
  getAvailableProducts(): Promise<PaymentProduct[]>;
}

// packages/shared/src/payment/ApplePayProvider.ts
export class ApplePayProvider implements PaymentProvider {
  name = 'ApplePay';

  async initialize(): Promise<void> {
    // 初始化 Apple Pay
  }

  async purchase(product: PaymentProduct): Promise<PaymentResult> {
    // 调用 Apple Pay 原生接口
    return { success: true, transactionId: 'apple_tx_123' };
  }

  async restorePurchases(): Promise<PaymentProduct[]> {
    return [];
  }

  async getAvailableProducts(): Promise<PaymentProduct[]> {
    return [];
  }
}

// packages/shared/src/payment/GooglePayProvider.ts
export class GooglePayProvider implements PaymentProvider {
  name = 'GooglePay';

  async initialize(): Promise<void> {
    // 初始化 Google Pay
  }

  async purchase(product: PaymentProduct): Promise<PaymentResult> {
    // 调用 Google Pay 原生接口
    return { success: true, transactionId: 'google_tx_123' };
  }

  async restorePurchases(): Promise<PaymentProduct[]> {
    return [];
  }

  async getAvailableProducts(): Promise<PaymentProduct[]> {
    return [];
  }
}

// packages/shared/src/payment/PaymentManager.ts
import { Platform } from 'react-native';

export class PaymentManager {
  private provider: PaymentProvider;

  constructor() {
    this.provider = Platform.OS === 'ios'
      ? new ApplePayProvider()
      : new GooglePayProvider();
  }

  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  async purchase(product: PaymentProduct): Promise<PaymentResult> {
    return this.provider.purchase(product);
  }

  async restorePurchases(): Promise<PaymentProduct[]> {
    return this.provider.restorePurchases();
  }
}
```

---

## 附录 L: Monorepo 性能优化策略

| 优化策略 | 配置 | 预期收益 |
|---------|------|---------|
| **Turborepo Remote Cache** | Vercel / AWS S3 | CI 时间 -60% |
| **pnpm Dedupe** | `pnpm dedupe` | 磁盘空间 -30% |
| **TypeScript Incremental** | `incremental: true` | 类型检查 -50% |
| **SWC 编译** | `transformer: 'swc'` | 构建速度 +40% |
| **依赖预构建** | `optimizeDeps` | 开发启动 -30% |
| **并行构建** | `parallel: true` | 总构建时间 -40% |
| **按需类型检查** | `affected` 模式 | 类型检查 -70% |
| **Bundle Splitting** | 动态导入 | 首屏加载 -40% |
