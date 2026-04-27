# 架构决策记录（ADR）

本文档记录本项目在设计与实现过程中的关键架构决策，包括技术选型理由、权衡分析与最终结论。

---

## ADR-001：选用 Expo SDK 52 作为开发基础

### 背景

移动应用开发需要同时覆盖 iOS 与 Android 平台。原生开发（Swift / Kotlin）虽然性能最佳，但维护两套代码成本过高。跨平台方案中，React Native 生态最为成熟，而 Expo 提供了开箱即用的工具链。

### 决策

采用 **Expo SDK 52** 作为项目基础框架。

### 理由

| 维度 | 分析 |
|------|------|
| 开发效率 | Expo 提供 `expo start` 一键启动，支持二维码扫描真机调试，省去 Xcode / Android Studio 复杂配置 |
| 原生能力 | SDK 52 内置 Camera、Location、Notifications 等模块，大部分场景无需 eject |
| 新架构支持 | SDK 52 默认启用 React Native New Architecture（Fabric + TurboModules），为长期演进做好准备 |
| EAS 构建 | 通过 Expo Application Services 可在云端完成构建与签名，降低 CI/CD 门槛 |

### 权衡

- **包体积**：Expo 包含较多内置模块，对包大小敏感的项目可考虑 prebuild 后移除未使用模块。
- **灵活性**：极端自定义原生代码的场景仍需 eject，但 SDK 52 的 Config Plugin 机制已大幅降低此需求。

### 结论

✅ **采纳**。Expo SDK 52 在本示例的学习与演示场景下，提供了最佳的开发体验与生态完整性。

---

## ADR-002：选用 Expo Router 作为导航系统

### 背景

React Native 社区存在多种导航方案：`react-navigation`、`react-native-navigation`（Wix）、以及基于文件系统的 `expo-router`。导航是移动应用的核心结构，直接影响代码组织与 deep linking 能力。

### 决策

采用 **Expo Router v4**（文件系统路由）替代传统的 `react-navigation` 命令式配置。

### 理由

| 维度 | 分析 |
|------|------|
| 约定优于配置 | 路由由文件系统结构自动生成，减少样板代码；新增页面只需创建文件 |
| 类型安全 | 支持 `typedRoutes` 实验特性，Link 组件与 `router.push()` 均可获得 TypeScript 提示 |
| Deep Linking | 自动根据文件路径生成 URL 模式，无需手动配置 linking 对象 |
| 嵌套导航 | 原生支持 Stack + Tab 嵌套，通过目录结构 `(tabs)/_layout.tsx` 即可表达 |

### 权衡

- **学习成本**：熟悉 Web 框架（Next.js、Remix）的开发者上手很快，但纯 `react-navigation` 用户需要适应文件系统思维。
- **动态路由限制**：复杂权限路由守卫仍需借助 `_layout.tsx` 中的条件渲染实现。

### 结论

✅ **采纳**。Expo Router 的声明式路由模型与 React Native New Architecture 趋势一致，更适合现代跨平台应用。

---

## ADR-003：选用 NativeWind 作为样式方案

### 背景

React Native 的样式系统基于 JavaScript 对象（`StyleSheet`），与 Web CSS 差异较大。社区存在 `Styled Components`、`Emotion`、`Tamagui`、`NativeWind` 等多种方案。

### 决策

采用 **NativeWind v4**（Tailwind CSS for React Native）。

### 理由

| 维度 | 分析 |
|------|------|
| 开发体验 | 使用熟悉的 Tailwind 工具类，如 `flex-row bg-primary rounded-xl`，无需在 JS 对象与样式文件间切换 |
| 设计系统一致性 | 通过 `tailwind.config.js` 统一定义颜色、间距、圆角等 token，确保全应用一致 |
| 运行时性能 | NativeWind v4 在构建时将类名编译为 `StyleSheet.create`，运行时开销极低 |
| 深色模式 | 通过 CSS 变量或条件类名（如 `dark:bg-black`）优雅支持深色模式切换 |
| 跨团队共享 | Web 项目与 RN 项目可复用同一套 Tailwind 配置 |

### 权衡

- **类名长度**：复杂布局可能出现较长的类名字符串，建议拆分为多个组件。
- **调试难度**：与纯 `StyleSheet` 相比，类名到最终样式的映射需要查看编译产物。

### 结论

✅ **采纳**。NativeWind 在保持 React Native 性能的同时，提供了接近 Web 开发的样式体验。

---

## ADR-004：启用 React Native New Architecture

### 背景

React Native 正在从旧架构（Bridge + JS Thread）向新架构（Fabric Renderer + TurboModules + JSI）迁移。新架构带来同步调用、更好的 TypeScript 支持与性能提升，但部分第三方库尚未完全兼容。

### 决策

在 `app.json` 中显式启用 `newArchEnabled: true`。

### 理由

| 维度 | 分析 |
|------|------|
| 性能 | Fabric 使用 C++ 共享层，减少 JS 与原生间的序列化开销，列表滚动更流畅 |
| 类型安全 | TurboModules 通过 Codegen 自动生成类型绑定，减少手动桥接代码 |
| 未来兼容 | Expo SDK 52 已将新架构设为默认，延迟迁移成本更高 |
| 社区趋势 | 主流库（Reanimated、Gesture Handler、React Navigation）均已支持新架构 |

### 权衡

- **库兼容性**：少数小众库可能仍未适配，需提前验证依赖列表。
- **调试差异**：部分错误堆栈与旧架构不同，开发者需熟悉新的调试模式。

### 结论

✅ **采纳**。New Architecture 是 React Native 的确定性未来，示例项目应展示最佳实践。

---

## ADR-005：选用 Zustand 进行轻量状态管理

### 背景

React 状态管理方案众多：Context API、Redux、Zustand、Jotai、Recoil 等。本示例项目规模适中，需要全局状态（主题偏好）但无需复杂中间件。

### 决策

采用 **Zustand** 作为全局状态管理库（已在 `package.json` 中声明，当前示例中通过 Props 传递演示）。

### 理由

| 维度 | 分析 |
|------|------|
| 轻量 | 核心代码不足 1KB，无样板代码 |
| TypeScript 友好 | 天然支持类型推断，无需额外类型定义 |
| 灵活性 | 支持同步/异步更新、中间件、持久化插件 |
| 性能 | 基于选择器订阅，仅当实际使用的状态变化时触发重渲染 |

### 权衡

- **生态规模**：Redux 的生态（DevTools、RTK Query）更成熟，但本示例场景下属于过度设计。

### 结论

✅ **采纳**。Zustand 在简洁性与功能完整性之间取得了最佳平衡。

---

## 关联文档

- [16-mobile-development](../../docs/platforms/MOBILE_DEVELOPMENT.md) — 移动开发全景指南
- [00-language-core](../../jsts-code-lab/00-language-core/) — TypeScript 类型系统实践
- [02-design-patterns](../../jsts-code-lab/02-design-patterns/) — 设计模式在 React 中的应用
- [18-frontend-frameworks](../../jsts-code-lab/18-frontend-frameworks/) — 前端框架深度解析
