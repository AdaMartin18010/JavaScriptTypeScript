# JSTS Mobile React Native Expo 示例

基于 **Expo SDK 52+**、**React Native New Architecture**、**NativeWind** 与 **TypeScript** 构建的跨平台移动应用示例项目。本项目演示了现代 React Native 开发的最佳实践，包括文件系统路由、深色模式、高性能列表、搜索防抖与组件化架构。

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Expo SDK | ~52.0 | 跨平台开发框架与工具链 |
| React Native | 0.76 | 新架构（Fabric + TurboModules）默认启用 |
| React | 18.3 | UI 库 |
| TypeScript | ~5.6 | 类型安全 |
| NativeWind | ^4.1 | Tailwind CSS for React Native |
| Expo Router | ~4.0 | 基于文件系统的路由 |
| Zustand | ^5.0 | 轻量状态管理 |
| TanStack Query | ^5.59 | 服务端状态管理 |
| Reanimated | ~3.16 | 流畅动画引擎 |

---

## 快速开始

### 环境要求

- Node.js 18+（推荐 20 LTS）
- npm / yarn / pnpm
- iOS 模拟器（macOS + Xcode）或 Android 模拟器（Android Studio）
- Expo Go App（真机调试）

### 安装依赖

```bash
cd examples/mobile-react-native-expo
npm install
```

### 启动开发服务器

```bash
# 启动 Metro bundler，根据提示选择 iOS / Android / Web
npm start

# 或直接启动指定平台
npm run ios
npm run android
npm run web
```

### 运行测试

```bash
# 交互式监视模式
npm test

# CI 模式（一次性运行）
npm run test:ci
```

### 类型检查与代码检查

```bash
# TypeScript 类型检查
npm run typecheck

# ESLint 代码检查
npm run lint
```

---

## 项目结构

```
mobile-react-native-expo/
├── app/                          # Expo Router 路由目录
│   ├── index.tsx                 # 入口欢迎页
│   ├── [id].tsx                  # 动态路由：详情页
│   └── (tabs)/                   # Tab 分组路由
│       ├── _layout.tsx           # Tab 导航布局
│       ├── home.tsx              # 首页：列表 + 搜索
│       ├── explore.tsx           # 探索页：网格分类
│       └── settings.tsx          # 设置页：主题与偏好
├── components/                   # 可复用组件
│   ├── ThemedText.tsx            # 主题适配文本
│   ├── ThemedView.tsx            # 主题适配视图
│   ├── Card.tsx                  # 卡片组件（NativeWind）
│   ├── SearchBar.tsx             # 搜索栏组件
│   └── __tests__/                # 组件测试
├── hooks/                        # 自定义 Hooks
│   ├── useThemeColor.ts          # 主题颜色 Hook
│   ├── useDebounce.ts            # 防抖 Hook
│   └── __tests__/                # Hooks 测试
├── constants/                    # 常量与数据
│   ├── Colors.ts                 # 主题色彩系统
│   └── MockData.ts               # 模拟数据
├── types/                        # TypeScript 类型定义
│   └── index.ts
├── docs/                         # 项目文档
│   ├── ARCHITECTURE.md           # 架构决策记录
│   └── MILESTONES.md             # 学习里程碑
├── package.json                  # 依赖清单
├── tsconfig.json                 # TypeScript 配置
├── tailwind.config.js            # NativeWind 配置
├── metro.config.js               # Metro bundler 配置
├── app.json                      # Expo 应用配置
├── global.css                    # Tailwind 基础导入
└── .env.example                  # 环境变量示例
```

---

## 核心特性

### 1. Expo Router 文件系统路由

路由由目录结构自动生成：

- `app/index.tsx` → `/`
- `app/(tabs)/home.tsx` → `/home`
- `app/[id].tsx` → `/item-001`

无需手动维护路由配置表，新增页面即创建文件。

### 2. NativeWind 样式系统

使用熟悉的 Tailwind 工具类编写跨平台样式：

```tsx
<View className="flex-row items-center justify-between px-4 py-3 rounded-xl bg-surface">
  <Text className="text-base font-semibold text-text">标题</Text>
</View>
```

`tailwind.config.js` 中扩展的颜色 token 与 `Colors.ts` 中的主题系统保持一致，确保深色模式无缝切换。

### 3. 深色模式支持

- 使用 `useColorScheme()` 监听系统主题变化
- `ThemedText` / `ThemedView` 自动应用对应配色
- `app.json` 中配置 `userInterfaceStyle: "automatic"`

### 4. 高性能列表

首页使用 `FlatList` 并开启以下优化：

- `getItemLayout`：跳过动态布局计算
- `initialNumToRender`：控制首屏渲染数量
- `windowSize`：控制内存中保留的屏幕数
- `useCallback` 缓存 `renderItem` 与 `keyExtractor`

### 5. 搜索防抖

`useDebounce` Hook 将搜索输入延迟 400ms 后再触发过滤，避免频繁渲染导致的卡顿。

---

## 平台适配

| 功能 | iOS | Android | 说明 |
|------|-----|---------|------|
| 状态栏 | ✅ | ✅ | `expo-status-bar` 自动适配 |
| 安全区 | ✅ | ✅ | `react-native-safe-area-context` |
| 深色模式 | ✅ | ✅ | 跟随系统或手动切换 |
| Tab 导航 | ✅ | ✅ | Expo Router Bottom Tabs |
| 返回手势 | ✅ | ✅ | Stack 导航默认支持 |
| 字体渲染 | ✅ | ✅ | 系统默认字体，跨平台一致 |

---

## 关联文档与 Code-Lab

本项目是 [JavaScriptTypeScript](https://github.com/your-org/JavaScriptTypeScript) 大仓库的一部分，以下模块与本示例紧密相关：

### 文档

- [`docs/platforms/MOBILE_DEVELOPMENT.md`](../../docs/platforms/MOBILE_DEVELOPMENT.md) — 移动开发全景指南，涵盖 React Native、Expo、Capacitor 等方案对比

### Code-Lab 模块

| 模块 | 路径 | 关联内容 |
|------|------|----------|
| 语言核心 | [`jsts-code-lab/00-language-core/`](../../jsts-code-lab/00-language-core/) | TypeScript 类型系统、泛型、类型体操 |
| 设计模式 | [`jsts-code-lab/02-design-patterns/`](../../jsts-code-lab/02-design-patterns/) | React 中的设计模式：HOC、Render Props、Compound Components |
| 前端框架 | [`jsts-code-lab/18-frontend-frameworks/`](../../jsts-code-lab/18-frontend-frameworks/) | React 原理、Hooks 深入、状态管理对比 |

建议按照 [`docs/MILESTONES.md`](./docs/MILESTONES.md) 中的 6 个里程碑逐步学习，预计总耗时约 **17.5 小时**。

---

## 架构决策

详细的架构决策记录（ADR）请参阅 [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)，包括：

- 为什么选用 Expo SDK 52
- 为什么选用 Expo Router 而非 react-navigation
- 为什么选用 NativeWind 而非 StyleSheet
- 为什么启用 React Native New Architecture
- 为什么选用 Zustand 进行状态管理

---

## 贡献

欢迎提交 Issue 与 PR！请确保：

1. 代码通过 TypeScript 类型检查（`npm run typecheck`）
2. 所有测试通过（`npm run test:ci`）
3. 遵循现有的代码风格与注释规范

---

## 许可证

[MIT](../../LICENSE)
