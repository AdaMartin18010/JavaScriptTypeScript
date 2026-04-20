# Mobile React Native Expo 跟练教程

> 难度等级: ⭐⭐⭐
> 预计时间: 2-3 小时
> 前置知识: React 基础 (Hooks、组件)、CSS/Tailwind 基础、命令行操作基础

## 目标

完成本教程后，你将能够：

- 使用 Expo CLI 创建并运行一个 React Native 项目
- 使用 Expo Router 构建基于文件系统的导航结构
- 使用 NativeWind 在 React Native 中编写 Tailwind CSS 样式
- 在 iOS Simulator 和 Android Emulator 上运行应用
- 理解跨平台移动端开发的项目结构和最佳实践

## 环境准备

- **Node.js**: `>= 18.0.0` (建议 LTS 版本)
- **包管理器**: npm `>= 9.0.0` 或 yarn `>= 1.22.0` 或 pnpm
- **Git**: 用于克隆示例代码
- **编辑器**: VS Code (推荐安装 ESLint、Prettier、Expo Tools 扩展)
- **Expo Go App** (可选): 在物理设备上调试需要安装

### 平台特定要求

**iOS (macOS 必需):**

- Xcode (从 Mac App Store 安装)
- iOS Simulator (随 Xcode 安装)

**Android:**

- Android Studio
- Android SDK + 模拟器或真机调试

### 全局工具安装

```bash
# 安装 Expo CLI
npm install -g expo-cli

# 验证安装
expo --version
```

## Step 1: 进入项目并安装依赖

```bash
cd e:\_src\JavaScriptTypeScript\examples\mobile-react-native-expo

# 安装依赖
npm install

# 或使用 pnpm/yarn
pnpm install
# yarn install
```

### 验证

```bash
npm list expo expo-router
```

应能看到 `expo` 和 `expo-router` 已安装，版本符合 `package.json` 要求。

## Step 2: 创建项目基础结构 (如从零开始)

本示例已包含完整项目结构，但了解创建过程有助于理解：

```bash
# 如从头创建，命令如下 (本步可跳过，仅作参考)
npx create-expo-app my-expo-app --template blank-typescript
cd my-expo-app
npx install-expo-modules@latest
```

本项目的目录结构说明：

```
.
├── app/                    # Expo Router 路由目录 (文件即路由)
│   ├── (tabs)/             # Tab 导航组
│   │   ├── _layout.tsx     # Tab 布局配置
│   │   ├── index.tsx       # 首页 (/)
│   │   └── explore.tsx     # 探索页 (/explore)
│   ├── _layout.tsx         # 根布局
│   └── +not-found.tsx      # 404 页面
├── components/             # 可复用组件
├── constants/              # 常量定义
├── hooks/                  # 自定义 Hooks
├── assets/                 # 图片、字体等资源
├── app.json                # Expo 配置文件
├── babel.config.js         # Babel 配置
├── tailwind.config.js      # NativeWind/Tailwind 配置
└── package.json
```

### 验证

确认 `app/` 目录存在，且包含 `_layout.tsx` 文件：

```bash
ls app/
```

## Step 3: 配置 NativeWind

NativeWind 允许你在 React Native 中使用 Tailwind CSS 的实用类。

本示例已配置好，关键配置文件如下：

**tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**babel.config.js**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: ["nativewind/babel"], // NativeWind Babel 插件
  };
};
```

**app/_layout.tsx** (根布局中导入全局样式)

```tsx
import { Stack } from "expo-router";
import "../global.css"; // 导入 Tailwind 全局样式

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
```

确认项目根目录存在 `global.css`：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 验证

```bash
# 运行类型检查
npx tsc --noEmit
```

无类型错误即通过。

## Step 4: 构建首页

打开 `app/(tabs)/index.tsx`，这是应用的首页：

```tsx
import { View, Text, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        {/* 头部区域 */}
        <View className="mt-6 mb-4">
          <Text className="text-3xl font-bold text-slate-900">
            欢迎使用 Expo
          </Text>
          <Text className="mt-2 text-base text-slate-600">
            这是一个使用 Expo Router + NativeWind 构建的跨平台应用
          </Text>
        </View>

        {/* 功能卡片 */}
        <View className="bg-blue-50 rounded-2xl p-5 mb-4">
          <Text className="text-lg font-semibold text-blue-900">
            🚀 快速开发
          </Text>
          <Text className="mt-1 text-sm text-blue-700">
            使用 React 和 JavaScript 同时构建 iOS 和 Android 应用
          </Text>
        </View>

        <View className="bg-green-50 rounded-2xl p-5 mb-4">
          <Text className="text-lg font-semibold text-green-900">
            🎨 NativeWind
          </Text>
          <Text className="mt-1 text-sm text-green-700">
            使用 Tailwind CSS 的类名来编写原生样式
          </Text>
        </View>

        <View className="bg-purple-50 rounded-2xl p-5 mb-4">
          <Text className="text-lg font-semibold text-purple-900">
            🧭 Expo Router
          </Text>
          <Text className="mt-1 text-sm text-purple-700">
            基于文件系统的路由，类似 Next.js 的开发体验
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### 验证

```bash
# 启动开发服务器
npx expo start
```

在弹出的 Expo Dev Tools 中：

- 按 `i` 启动 iOS Simulator
- 按 `a` 启动 Android Emulator

确认首页正常显示，包含三个彩色卡片和标题。

## Step 5: 添加导航 (Expo Router)

本项目使用 Expo Router 的 **Tab 导航**。查看 `app/(tabs)/_layout.tsx`：

```tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "首页",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "探索",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

新增一个页面非常简单，只需在 `app/(tabs)/` 下创建文件：

```bash
# 创建新的 Tab 页面
touch "app/(tabs)/profile.tsx"
```

编辑 `app/(tabs)/profile.tsx`：

```tsx
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-slate-900">个人中心</Text>
      <Text className="mt-2 text-slate-600">这是个人资料页面</Text>
    </SafeAreaView>
  );
}
```

然后在 `app/(tabs)/_layout.tsx` 中注册新 Tab：

```tsx
// 在 <Tabs> 内添加：
<Tabs.Screen
  name="profile"
  options={{
    title: "我的",
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="person" size={size} color={color} />
    ),
  }}
/>
```

### 验证

保存后应用会自动热重载。确认底部 Tab 栏出现三个选项：「首页」「探索」「我的」，且点击能正确切换页面。

## Step 6: 在 iOS/Android 上运行

### iOS (需要 macOS + Xcode)

```bash
# 在 Expo 终端中按 i
i

# 或直接运行
npx expo run:ios

# 指定模拟器型号
npx expo run:ios --device "iPhone 15 Pro"
```

### Android

```bash
# 确保 Android 模拟器已启动，或已连接真机 (adb devices 能看到设备)
adb devices

# 在 Expo 终端中按 a
a

# 或直接运行
npx expo run:android
```

### 物理设备调试 (Expo Go)

1. 在手机安装 **Expo Go** App (App Store / Google Play)
2. 确保手机和电脑在同一 WiFi 下
3. 启动 `npx expo start`
4. 扫描终端中的二维码

### 验证

- [ ] iOS Simulator 中应用正常显示，无红屏错误
- [ ] Android Emulator 中应用正常显示，无红屏错误
- [ ] Tab 导航切换流畅
- [ ] NativeWind 样式正确渲染（圆角、背景色、文字大小等）

## Step 7: 打包与发布准备

```bash
# 预构建 (生成原生 iOS/Android 项目)
npx expo prebuild

# 这会在项目下生成 ios/ 和 android/ 目录
ls ios/ android/
```

### 验证

确认 `ios/` 和 `android/` 目录已生成，包含完整的原生项目文件。后续可使用 Xcode 或 Android Studio 打开进行正式打包。

## 常见错误排查

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `command not found: expo` | Expo CLI 未全局安装或未使用 npx | 使用 `npx expo` 替代，或运行 `npm install -g expo-cli` |
| `Unable to open simulator` | Xcode 未安装或 iOS Simulator 未配置 | macOS 上安装 Xcode，运行 `xcode-select --install` |
| `NativeWind styles not applied` | Babel 配置错误或 global.css 未导入 | 检查 `babel.config.js` 是否包含 `nativewind/babel`；检查 `_layout.tsx` 是否导入 `global.css` |
| `Module not found: expo-router` | 依赖未正确安装 | 删除 `node_modules` 和锁文件，重新 `npm install` |
| `Metro bundler Error: ESOCKETTIMEDOUT` | 网络问题或缓存损坏 | 运行 `npx expo start --clear` 清除缓存 |
| `adb devices` 无设备 | Android 调试未开启或驱动未安装 | 开启手机开发者模式 + USB 调试；Windows 安装 Google USB Driver |
| `Invariant Violation: View config getter` | 使用了 Web 专用组件在 RN 中 | 确保使用 `react-native` 导出的组件（如 `<View>` 而非 `<div>`） |
| `Error: Package "expo-font"` | 字体加载失败 | 运行 `npx expo install expo-font` |

## 扩展挑战

1. **添加动画效果**: 使用 `react-native-reanimated` 为卡片添加入场动画
2. **接入真实数据**: 使用 `swr` 或 `@tanstack/react-query` 从 API 获取数据并展示
3. **实现下拉刷新**: 在首页 ScrollView 中添加 `RefreshControl` 组件
4. **添加深色模式**: 使用 NativeWind 的 `dark:` 变体实现主题切换
5. **手势交互**: 使用 `react-native-gesture-handler` 实现滑动删除卡片功能
6. **推送通知**: 集成 `expo-notifications` 实现本地推送
7. **发布应用**: 使用 EAS (Expo Application Services) 构建并提交到 App Store / Play Store

## 相关学习资源

- **code-lab**: `jsts-code-lab/00-language-core` — TypeScript/JavaScript 核心语法练习
- **code-lab**: `jsts-code-lab/18-frontend-frameworks` — React 组件、Hooks、状态管理
- **理论文档**: `JSTS全景综述/01_language_core.md` — JS/TS 语言核心概念
- **理论文档**: `JSTS全景综述/03_design_patterns.md` — 前端常用设计模式
- **外部参考**: [Expo 官方文档](https://docs.expo.dev/)
- **外部参考**: [Expo Router 文档](https://docs.expo.dev/router/introduction/)
- **外部参考**: [NativeWind 文档](https://www.nativewind.dev/)
