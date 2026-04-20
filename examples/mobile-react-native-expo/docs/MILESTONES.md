# 学习里程碑

本示例项目被设计为一个渐进式学习路径，共划分为 **6 个里程碑**。每个里程碑包含明确的学习目标、预计耗时、关联的 Code-Lab 模块以及验证标准。

---

## 里程碑 1：项目初始化与 Expo Router 路由配置

**预计时间**：2 小时
**难度**：⭐⭐

### 学习目标

- 掌握 `create-expo-app` 初始化流程与项目结构
- 理解 Expo SDK 52 的新特性与 New Architecture 启用方式
- 掌握 Expo Router 的文件系统路由约定：`index.tsx`、分组路由 `(tabs)`、动态路由 `[id].tsx`
- 配置 `tsconfig.json` 路径别名（`@/*`）

### 关联 Code-Lab 模块

- `00-language-core` — TypeScript 模块解析与路径映射
- `18-frontend-frameworks` — 现代前端路由模型（文件系统路由 vs 配置式路由）

### 实践任务

1. 运行 `npx create-expo-app@latest --template blank-typescript` 创建项目
2. 安装 `expo-router` 并配置 `main` 入口为 `expo-router/entry`
3. 创建 `app/(tabs)/_layout.tsx` 与 `app/(tabs)/home.tsx`
4. 验证路由跳转：`/` → `/home` → `/(tabs)/explore`

### 验证标准

- [ ] `npm start` 能正常启动 Metro bundler 并在模拟器/真机运行
- [ ] Tab 切换无报错，页面切换带有默认过渡动画
- [ ] TypeScript 编译无错误（`npx tsc --noEmit`）

---

## 里程碑 2：NativeWind 样式系统搭建与主题切换

**预计时间**：3 小时
**难度**：⭐⭐⭐

### 学习目标

- 理解 NativeWind v4 的工作原理：Babel 编译 + CSS 导入
- 配置 `tailwind.config.js` 扩展主题 token（颜色、字体、间距）
- 实现 `ThemedText` 与 `ThemedView` 组件，支持自动适配深色模式
- 掌握 `useColorScheme` 与 `expo-system-ui` 的协同使用

### 关联 Code-Lab 模块

- `02-design-patterns` — 高阶组件（HOC）与 render props 模式
- `18-frontend-frameworks` — CSS-in-JS 与 Utility-First CSS 的对比

### 实践任务

1. 安装 `nativewind` 与 `tailwindcss`，配置 `metro.config.js`
2. 创建 `global.css` 并在根布局中导入
3. 实现 `constants/Colors.ts` 定义两套配色
4. 完成 `components/ThemedText.tsx` 与 `components/ThemedView.tsx`
5. 在 iOS / Android 模拟器上验证系统主题切换时应用响应

### 验证标准

- [ ] 浅色模式下文字为黑色、背景为白色；深色模式下自动反转
- [ ] 切换系统主题时无需重启应用即可生效
- [ ] `tailwind.config.js` 中自定义颜色在组件中可用（如 `text-primary`）

---

## 里程碑 3：列表渲染、搜索过滤与性能优化

**预计时间**：3 小时
**难度**：⭐⭐⭐

### 学习目标

- 掌握 `FlatList` 的正确使用（`keyExtractor`、`getItemLayout`、`initialNumToRender`）
- 实现受控搜索框与防抖处理（`useDebounce` Hook）
- 使用 `useMemo` 与 `useCallback` 避免不必要的重渲染
- 理解 React Native 的列表性能瓶颈与优化策略

### 关联 Code-Lab 模块

- `00-language-core` — 闭包、Hooks 依赖数组与渲染机制
- `04-data-structures` — 数组过滤与搜索算法
- `08-performance` — React 渲染优化与列表虚拟化

### 实践任务

1. 在 `app/(tabs)/home.tsx` 中实现 `FlatList` 渲染 20+ 条模拟数据
2. 创建 `components/SearchBar.tsx` 受控组件
3. 创建 `hooks/useDebounce.ts` 实现 400ms 防抖
4. 使用 `useCallback` 缓存 `renderItem` 与 `keyExtractor`
5. 在 Android 低端设备或开启 "Profile Herms" 验证滚动帧率

### 验证标准

- [ ] 快速输入搜索词时不卡顿，停止输入 400ms 后列表才更新
- [ ] 长列表滚动流畅，无明显的白屏或掉帧
- [ ] 搜索无结果时展示友好的空状态 UI

---

## 里程碑 4：导航与动画（Stack + Tab 导航）

**预计时间**：2.5 小时
**难度**：⭐⭐⭐

### 学习目标

- 掌握 Expo Router 中 Stack 与 Tab 的嵌套配置
- 实现页面间参数传递与动态路由（`[id].tsx`）
- 使用 `react-native-reanimated` 添加自定义过渡动画
- 理解 Header 配置、返回按钮定制与 Deep Linking

### 关联 Code-Lab 模块

- `02-design-patterns` — 导航器模式与守卫模式
- `18-frontend-frameworks` — 声明式路由与嵌套布局

### 实践任务

1. 完善 `app/(tabs)/_layout.tsx` 配置底部 Tab 栏图标与标题
2. 实现 `app/[id].tsx` 详情页，接收并解析路由参数
3. 在 `app/(tabs)/explore.tsx` 中实现网格布局与分类筛选
4. 为页面切换添加简单的 Reanimated 共享元素动画（可选进阶）
5. 验证 Deep Link：`jstsmobile://item-001` 可直接打开详情页

### 验证标准

- [ ] Tab 切换流畅，图标与标题正确显示
- [ ] 点击列表项正确跳转到详情页并展示对应数据
- [ ] 详情页点击返回可回到上一页，状态保持正确

---

## 里程碑 5：状态管理与数据持久化

**预计时间**：3 小时
**难度**：⭐⭐⭐⭐

### 学习目标

- 使用 Zustand 创建全局 Store（主题偏好、用户设置）
- 使用 `persist` 中间件将状态持久化到 `AsyncStorage`
- 掌握 React Query（TanStack Query）进行服务端状态管理
- 理解服务端状态与客户端状态的分离原则

### 关联 Code-Lab 模块

- `02-design-patterns` — 状态管理模式（Flux、Atomic、Proxy-based）
- `06-architecture-patterns` — 分层架构与数据流设计
- `18-frontend-frameworks` — 服务端状态同步策略

### 实践任务

1. 创建 `store/usePreferenceStore.ts`，管理 `themeMode` 与 `notificationsEnabled`
2. 集成 `zustand/middleware` 的 `persist` 实现设置项本地存储
3. 在 `app/(tabs)/settings.tsx` 中连接 Store，实现状态读写
4. 使用 `@tanstack/react-query` 封装模拟 API 请求（替换 `MockData.ts`）
5. 实现乐观更新（Optimistic Update）与错误重试

### 验证标准

- [ ] 切换主题模式后杀死应用重启，设置保持不变
- [ ] 网络异常时展示错误提示，恢复网络后自动重试
- [ ] Store 更新时仅相关组件重渲染，无全局渲染风暴

---

## 里程碑 6：构建、测试与部署到应用商店

**预计时间**：4 小时
**难度**：⭐⭐⭐⭐

### 学习目标

- 编写 Jest + React Native Testing Library 单元测试
- 配置 EAS Build 进行云端构建（iOS / Android）
- 生成应用签名、配置应用商店元数据
- 理解 OTA（Over-The-Air）更新机制与 `expo-updates`

### 关联 Code-Lab 模块

- `07-testing` — 单元测试、集成测试与快照测试
- `09-real-world-examples` — 生产环境部署与持续交付

### 实践任务

1. 完成 `components/__tests__/Card.test.tsx` 与 `hooks/__tests__/useDebounce.test.ts`
2. 配置 `jest.config.js`（或 `package.json` 中的 `jest` 字段）
3. 注册 EAS 账号，运行 `eas build --platform ios` / `eas build --platform android`
4. 配置 `app.json` 中的应用图标、启动屏与应用名称
5. 提交 TestFlight（iOS）与 Google Play 内部测试（Android）

### 验证标准

- [ ] `npm test` 全部通过，覆盖率不低于 70%
- [ ] EAS Build 成功生成 `.ipa` 与 `.aab` 文件
- [ ] 应用在 iOS 与 Android 真机上正常运行，无崩溃
- [ ] 通过应用商店审核指南的基础检查（权限声明、隐私政策链接）

---

## 学习路径总览

```
里程碑 1 ──→ 里程碑 2 ──→ 里程碑 3 ──→ 里程碑 4 ──→ 里程碑 5 ──→ 里程碑 6
(路由配置)   (样式系统)   (列表性能)   (导航动画)   (状态持久)   (构建部署)
    │           │           │           │           │           │
    └───────────┴───────────┴───────────┴───────────┴───────────┘
                        预计总耗时：17.5 小时
```

完成全部里程碑后，你将具备独立开发并发布一个跨平台 React Native 应用的完整能力。
