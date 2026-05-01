---
title: 移动端开发
description: JavaScript/TypeScript 移动端开发 2025-2026 完整指南 — React Native 新架构、Expo 生态、跨平台方案对比与新兴技术
---

# 移动端开发

2025-2026 年是 JS/TS 移动端开发的转折之年。React Native 新架构（Fabric + TurboModules）从默认开启走向**强制化**，Expo 生态持续扩张并已成为事实上的标准开发流，Capacitor 和 Tauri Mobile 正在重塑"Web 优先"的跨平台策略，而 Kotlin Multiplatform 与 Compose Multiplatform 的成熟正在加剧跨平台竞争格局。

> 📊 **关键数据**: State of JS 2025 显示，在跨平台框架中，**Flutter 开发者采用率约 46%**，**React Native 约 35%**；但 React Native 在 Hacker News 招聘需求中位数为 4.1，显著高于 Flutter 的 0.73。React Native GitHub Stars **121,000+**，Flutter **168,000+**。Expo 生态月活开发者突破 **45 万**，EAS Build 月构建量超过 **800 万次**（Expo 官方 2026 Q1 报告）。

---

## React Native 新架构 2025-2026 深度解析

React Native 的旧架构（异步 Bridge + JSON 序列化）已成为历史。新架构基于 **JSI（JavaScript Interface）** 实现 JS 与原生层的直接 C++ 调用，消除了序列化瓶颈。

### 版本演进与强制化路线

| 版本 | 发布时间 | 新架构状态 | 关键变更 |
|------|----------|-----------|----------|
| **0.76** | 2024.10 | 默认开启，可关闭 | 新架构首次作为默认配置 |
| **0.78** | 2025.02 | 默认开启 | React 19 正式集成 |
| **0.82** | 2025.10 | ⚠️ 强制开启 | 旧架构**永久移除**，无法回退 |
| **0.83** | 2026.02 | 强制开启 | Expo SDK 55 绑定，Hermes V1 生产就绪 |

> 📌 **数据来源**: React Native 官方博客版本发布公告 (reactnative.dev/blog)，截至 2026-04。

### Bridgeless Mode：彻底抛弃 Bridge

Bridgeless Mode 是 React Native 新架构的最终形态。在 Bridgeless 模式下：

- **完全移除**旧的异步 Bridge 通信机制
- 所有原生模块调用均通过 **JSI 直接同步调用** C++ 层
- 启动时无需等待 Bridge 初始化，**首屏时间进一步缩短 15-20%**
- 内存中不再维护 JSON 序列化/反序列化的临时对象，**GC 压力显著降低**

```bash
# 迁移检查工具
npx react-native-new-arch-check
npx expo-doctor

# 启用 Codegen（自动类型绑定生成）
./gradlew generateCodegenArtifactsFromSchema
```

> 💡 **注意**: 旧架构已于 **2025 年 6 月冻结** — 不再接受新功能、Bug 修复或安全补丁。未迁移的项目面临技术债务累积风险。

### JSI（JavaScript Interface）核心机制

JSI 是 React Native 新架构的基石，它是一个轻量级的 C++ API 层，允许 JavaScript 引擎（Hermes/JSC）与原生代码直接互操作：

| 特性 | 旧架构 Bridge | 新架构 JSI |
|------|---------------|-----------|
| 调用方式 | 异步 JSON 序列化 | 直接 C++ 指针调用 |
| 类型安全 | 运行时解析，无类型检查 | Codegen 编译期生成类型绑定 |
| 同步调用 | 不支持 | 完全支持 |
| 内存共享 | 复制数据 | 共享 C++ HostObject |
| 启动开销 | Bridge 初始化延迟 | 零额外初始化 |

```cpp
// JSI HostObject 示例（C++）
class MyNativeModule : public jsi::HostObject {
  jsi::Value get(jsi::Runtime& rt, const jsi::PropNameID& name) override {
    if (name.utf8(rt) == "nativeMethod") {
      return jsi::Function::createFromHostFunction(
        rt, name, 0,
        [](jsi::Runtime& rt, const jsi::Value&, const jsi::Value*, size_t) {
          return jsi::String::createFromUtf8(rt, "Hello from C++");
        }
      );
    }
    return jsi::Value::undefined();
  }
};
```

> 📌 **数据来源**: React Native 架构文档 (reactnative.dev/architecture/overview)，Meta 工程师技术分享 2025。

### Hermes 引擎：专为 RN 优化的 JS 引擎

Hermes 是 Meta 专为 React Native 设计的 JavaScript 引擎，2026 年已达成以下里程碑：

| 指标 | Hermes 2024 | Hermes V1 (2026) | 提升幅度 |
|------|-------------|------------------|----------|
| 启动时间 (TTR) | 基准 | -35% | 显著优化 |
| 包体积增量 | ~2.5MB | ~1.8MB | -28% |
| 内存占用 | 基准 | -22% | 显著优化 |
| TTI (Time to Interactive) | 基准 | -40% | 显著优化 |
| Bytecode 预编译 | 支持 | 增强 (AOT 优化) | 持续改进 |

**Hermes 核心优化策略**：

- **AOT Bytecode**: 构建时将 JS 编译为 Hermes Bytecode，运行时直接加载，跳过解析和编译
- **惰性对象初始化 (Lazy Object Initialization)**: 延迟全局对象的初始化，减少启动阻塞
- **更紧凑的 GC**: 分代垃圾回收器针对移动设备内存约束优化
- **Intl 完整支持**: 从 0.73 起内置完整的 Intl API，无需 polyfill

```bash
# 检查 Hermes 是否启用
npx react-native info | findstr Hermes

# 生产构建启用 Hermes Bytecode
./gradlew assembleRelease -PhermesEnabled=true
```

> 📌 **数据来源**: Hermes GitHub Releases (github.com/facebook/hermes)，Meta React Native 性能基准测试 2026。

### 核心性能提升

**Shopify 2026 生产数据**（基于 0.82 Bridgeless Mode）：

- 冷启动速度提升 **43%**
- 渲染速度提升 **39%**
- 内存占用降低 **26%**
- 大型列表 (FlashList) 滚动帧率稳定性提升 **31%**

> 📌 **数据来源**: Shopify Engineering Blog 2026 "React Native New Architecture at Scale"。

---

## Expo 生态 50+ 深度全景

Expo 已从"React Native 的入门工具"演变为**生产级跨平台开发平台**。截至 2026 年，Expo SDK 55 已发布，Expo 生态月活开发者突破 45 万。

| 项目 | Stars | 采用率/状态 | 说明 |
|------|-------|-------------|------|
| **Expo** | 36,000+ | 新 RN 项目 ~78% 选择 Expo | 零配置开发平台，内置 100+ 原生模块 |
| **Expo Router** | 集成于 Expo | SDK 52+ 默认路由方案 | 基于文件系统的路由，支持深度链接、原生导航、共享元素过渡 |
| **EAS Build** | 云服务 | 月构建 800 万+ | 托管 CI/CD，支持自定义原生代码、企业签名、OTA 更新 |
| **EAS Update** | 云服务 | 日活更新推送 200 万+ | 合规的 OTA 更新方案，App Store / Play Store 审核友好 |
| **expo-modules-core** | 集成于 Expo | 新架构首选模块方案 | 原生模块开发的现代 API，Swift/Kotlin 直接暴露给 JS |
| **Expo Orbit** | 集成于 Expo | 开发者工具链 | 本地模拟器/真机快速预览、EAS 构建产物安装 |

> 📌 **数据来源**: Expo 官方状态页面 (status.expo.dev)，Expo 2026 Q1 开发者报告，GitHub (github.com/expo/expo) 截至 2026-04。

### EAS Build：托管构建基础设施

EAS Build 是 Expo 提供的云端 CI/CD 服务，解决了 React Native 中最痛苦的"原生构建环境配置"问题：

**核心能力**：

- **完全托管的构建环境**: macOS 虚拟机用于 iOS 构建，Linux 用于 Android，无需本地配置 Xcode/Android Studio
- **自定义原生代码**: 通过 `expo prebuild` 生成原生项目后，可注入自定义 Pod/Gradle 配置
- **企业签名与分发**: 内置 iOS 证书管理、Android 签名密钥托管、内部分发 (Enterprise Distribution)
- **并行构建**: iOS 与 Android 同时构建，平均构建时间 **iOS 12-18 分钟 / Android 8-12 分钟**
- **缓存策略**: 智能缓存 `node_modules`、`Pods`、`Gradle` 依赖，二次构建提速 **60%+**

```json
{
  "cli": { "version": ">= 15.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

> 📌 **数据来源**: EAS Build 官方文档 (docs.expo.dev/build/introduction)，Expo 2026 Q1 性能报告。

### Expo Router：文件系统驱动的导航

Expo Router v4/v5（2025-2026）带来了 **共享元素过渡（Shared Element Transitions）** 和 **原生标签导航** 的完整支持，使 Expo 应用在视觉体验上更接近纯原生应用。

**关键特性**：

- **文件系统路由**: `app/(tabs)/index.tsx` 自动映射为路由，零配置
- **深度链接原生集成**: 自动处理 iOS Universal Links 和 Android App Links
- **原生栈导航**: 基于 `react-native-screens`，使用平台原生导航控制器
- **共享元素过渡**: 跨屏幕的共享组件动画，支持 Material Motion
- **API 路由**: `app/api/hello+api.ts` 支持在应用中内嵌服务端逻辑（Expo 实验性功能）

```typescript
// Expo Router 文件系统路由示例
// app/(tabs)/index.tsx
import { View, Text } from 'react-native';

export default function Home() {
  return (
    <View>
      <Text>Hello Expo Router</Text>
    </View>
  );
}

// app/user/[id].tsx — 动态路由
import { useLocalSearchParams } from 'expo-router';

export default function UserProfile() {
  const { id } = useLocalSearchParams();
  return <Text>User ID: {id}</Text>;
}
```

### expo-modules-core：现代原生模块开发

`expo-modules-core` 是 Expo 推出的原生模块开发框架，相比传统 React Native 的 `NativeModules` / `TurboModules`，大幅简化了 Swift/Kotlin 与 JavaScript 的桥接：

```swift
// Swift 原生模块（expo-modules-core）
import ExpoModulesCore

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyModule")

    Function("greet") { (name: String) -> String in
      return "Hello, \(name)!"
    }

    View(MyCustomView.self) {
      Prop("color") { (view: MyCustomView, color: String) in
        view.backgroundColor = UIColor(hex: color)
      }
    }
  }
}
```

**expo-modules-core vs TurboModules 对比**：

| 维度 | TurboModules (RN 官方) | expo-modules-core |
|------|------------------------|-------------------|
| 配置复杂度 | 高（需 C++ 绑定、Codegen、CMake/Gradle 配置） | 低（单文件 Swift/Kotlin，自动绑定） |
| 类型安全 | Codegen 生成 | 编译期 Swift/Kotlin 类型反射 |
| View 组件支持 | 完整但复杂 | 简化封装，一行注册 |
| 事件系统 | 手动实现 | 内置 `Events` DSL |
| 适用场景 | 高性能底层模块、大型 SDK 封装 | 业务原生模块、快速原型、中小团队 |

> 📌 **数据来源**: Expo Modules API 文档 (docs.expo.dev/modules/overview)，Expo 官方示例仓库。

---

## 跨平台方案深度对比

| 框架 | 语言 | 渲染方式 | Stars | 采用率 | 适用场景 |
|------|------|----------|-------|--------|----------|
| **React Native** | JS/TS | 原生组件 (Fabric) | 121k+ | 35% (State of JS 2025) | 已有 React 团队、需原生体验、招聘生态成熟 |
| **Flutter** | Dart | Impeller 自渲染引擎 | 168k+ | 46% (State of JS 2025) | 高度定制 UI、复杂动画、六端统一 (iOS/Android/Web/桌面) |
| **Ionic** | JS/TS | WebView | 51k+ | 12% (Web 优先场景) | Web 开发者转型、快速原型、PWA + App 混合、企业后台 |
| **Capacitor** | JS/TS | WebView | 12k+ | 快速增长 (Web→App 桥梁) | 已有 Web 应用 App 化、插件化原生能力扩展 |
| **Tauri Mobile** | Rust + JS/TS | WebView (系统原生) | 91k+ (含桌面) | 新兴 (~3% 移动端) | Rust 团队、极致包体积控制、安全敏感型应用 |
| **NativeScript** | JS/TS | 原生组件 | 24k+ | 3% | 需直接访问 100% 原生 API、Angular/Vue 团队 |
| **Kotlin Multiplatform** | Kotlin | 原生 UI / Compose | 生态增长中 | 18% (JetBrains 2025) | Android 优先团队、渐进式跨平台、业务逻辑共享 |
| **Compose Multiplatform** | Kotlin | Skia 自渲染 | 生态增长中 | 6% | Kotlin 团队、共享 UI + 业务逻辑、Material Design |

> 📌 **数据来源**: State of JS 2025 调查报告，GitHub Stars 截至 2026-04，JetBrains 开发者生态系统调查 2025。

### React Native vs Flutter：2026 核心差异

| 维度 | React Native | Flutter |
|------|--------------|---------|
| **UI 一致性** | 依赖平台原生组件，iOS/Android 有差异 | Impeller 自渲染，像素级跨平台一致 |
| **包体积** | 基础 ~8-12MB (Hermes) | 基础 ~15-20MB (含引擎) |
| **启动速度** | 新架构 + Hermes 极快 | Impeller 优化后接近 |
| **生态库数量** | npm 生态 + 原生模块，总量更大 | pub.dev 约 4 万+ 包，质量较高 |
| **招聘难度** | 低（JS/TS 人才充足） | 中（需 Dart 经验，人才池较小） |
| **Web 支持** | React Native Web 可用但非官方重点 | Flutter Web 生产就绪，但 SEO 差 |
| **大版本升级** | 0.7x 系列较频繁，需适配 | 3.x 稳定，破坏性变更少 |
| **典型客户** | Meta、Shopify、Microsoft、Amazon | Google、Alibaba、ByteDance、eBay |

> 📈 **Stack Overflow 2025 / JetBrains 开发者调查**: Kotlin Multiplatform 采用率从 2024 年的 **7%** 跃升至 2025 年的 **18%**，增长超过一倍。Google 在 I/O 2024 官方推荐 KMP 用于 Android/iOS 业务逻辑共享。

### Ionic：Web 技术栈的移动化

Ionic 是基于 Web 技术（HTML/CSS/JS）的移动端 UI 框架， historically 依赖 Cordova，现代版本全面转向 Capacitor：

| 指标 | 数据 |
|------|------|
| GitHub Stars | 51,000+ |
| 周下载量 | npm ~120,000 |
| 企业采用 |  primarily 企业后台、B2B 应用 |
| 适用场景 | 快速原型、已有 Angular/React/Vue Web 应用、PWA 优先策略 |

**Ionic 2026 定位**: Ionic 框架本身更侧重于 UI 组件库和主题系统，原生能力完全交由 Capacitor 处理。对于新项目，推荐直接使用 **Capacitor + 首选前端框架（React/Vue/Angular）**，Ionic 作为可选 UI 层。

---

## Capacitor：Web 到 App 的桥梁

Capacitor 是 Ionic 团队推出的现代 Web 运行时容器，替代了老旧的 Cordova，成为"Web 优先"跨平台方案的核心基础设施。

### 核心架构

Capacitor 本质上是一个**原生应用外壳**，内嵌系统 WebView（iOS WKWebView / Android WebView），并提供一个干净的桥梁让 Web 代码调用原生 API：

```
┌─────────────────────────────────────────┐
│           你的 Web 应用 (React/Vue/Angular) │
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  Web 代码    │  │ Capacitor APIs   │  │
│  │ (标准 Web API)│  │ (Camera/File/...)│  │
│  └──────┬──────┘  └────────┬─────────┘  │
│         │                   │            │
│  ┌──────┴───────────────────┴─────────┐  │
│  │      JavaScript Bridge (Injected)   │  │
│  └──────────────┬─────────────────────┘  │
└─────────────────┼────────────────────────┘
                  ▼
┌─────────────────────────────────────────┐
│      Capacitor Runtime (Native iOS/Android)│
│  ┌─────────────┐  ┌──────────────────┐  │
│  │  WKWebView  │  │  Native Plugins  │  │
│  │  /WebView   │  │  (Swift/Kotlin)  │  │
│  └─────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
```

### Capacitor 关键数据

| 指标 | 数据 | 来源 |
|------|------|------|
| GitHub Stars | 12,000+ | GitHub 2026-04 |
| npm 周下载量 | ~300,000 | npmjs.com |
| 官方插件数 | 25+ 核心插件 | Capacitor 官方 |
| 社区插件数 | 200+ | Capacitor Community |
| 包体积增量 | ~1.5MB (基础运行时) | Capacitor 官方基准 |

### 插件生态

Capacitor 插件分为三个层级：

**官方核心插件**（@capacitor/*）：

- `Camera` — 拍照/相册访问
- `Filesystem` — 文件读写（支持沙盒与外部存储）
- `Geolocation` — GPS 定位
- `Push Notifications` — 远程推送（FCM/APNs）
- `Splash Screen` — 启动屏管理
- `Status Bar` — 状态栏控制
- `App` — 应用生命周期事件

**社区插件**（@capacitor-community/*）：

- `bluetooth-le` — 低功耗蓝牙
- `firebase-analytics` — Firebase 分析
- `stripe` — 支付集成
- `media` — 音频/视频播放控制
- `text-to-speech` — TTS 合成

**自定义插件**: 使用 Capacitor Plugin API（Swift/Kotlin）自行开发：

```swift
// Capacitor iOS 插件示例
import Capacitor

@objc(MyPlugin)
public class MyPlugin: CAPPlugin {
  @objc func echo(_ call: CAPPluginCall) {
    let value = call.getString("value") ?? ""
    call.resolve(["value": value])
  }
}
```

### Capacitor 适用场景

| 场景 | 推荐度 | 说明 |
|------|--------|------|
| 已有 Web 应用快速 App 化 | ⭐⭐⭐⭐⭐ | 最小改动，最大复用 |
| PWA + App 双轨发布 | ⭐⭐⭐⭐⭐ | 同一套代码，多平台分发 |
| 内容展示型应用 | ⭐⭐⭐⭐⭐ | 新闻、博客、文档 |
| 企业后台/管理后台 | ⭐⭐⭐⭐ | 复杂表单、数据表格 |
| 高性能游戏/图形 | ⭐⭐ | WebView 性能限制 |
| 重度原生交互 | ⭐⭐⭐ | 依赖社区插件覆盖度 |

---

## Tauri Mobile：Rust + WebView 的移动方案

Tauri 是一个使用 Web 前端构建桌面和移动应用的框架，后端由 Rust 驱动。2025-2026 年，Tauri v2 正式支持 iOS 和 Android，成为 Capacitor 的有力竞争者。

### Tauri 核心数据

| 指标 | 数据 | 来源 |
|------|------|------|
| GitHub Stars | 91,000+ (tauri-apps/tauri) | GitHub 2026-04 |
| 移动端支持版本 | Tauri v2 (2024.10 稳定) | Tauri 官方博客 |
| 包体积 | **~600KB** (基础 Rust 二进制) | Tauri 官方基准 |
| 内存占用 | 显著低于 Electron/Cordova | 社区基准测试 |
| 采用率 (移动端) | ~3% (新兴增长中) | State of JS 2025 估算 |

### Tauri Mobile 架构

```
┌─────────────────────────────────────────┐
│         前端 (WebView)                   │
│    React / Vue / Svelte / 纯 HTML       │
│         ↕ IPC (JSON 消息)               │
├─────────────────────────────────────────┤
│         Tauri Runtime (Rust)             │
│    ┌─────────┐  ┌─────────────────┐     │
│    │  WRY    │  │  tauri::command │     │
│    │ WebView │  │  (Rust 后端 API) │     │
│    │ 封装层   │  │                 │     │
│    └─────────┘  └─────────────────┘     │
│         ↕                                │
│    ┌─────────────────────────────────┐  │
│    │    系统原生 API (iOS/Android)    │  │
│    └─────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**WRY** 是 Tauri 团队开发的跨平台 WebView 封装库，iOS 使用 WKWebView，Android 使用 WebView，通过 Rust 统一抽象。

### Tauri vs Capacitor

| 维度 | Tauri Mobile | Capacitor |
|------|--------------|-----------|
| **后端语言** | Rust | Swift/Kotlin/Java (原生) |
| **包体积** | 极小 (~600KB 基础) | 较小 (~1.5MB 基础) |
| **性能** | Rust 后端，内存安全高性能 | WebView + 原生插件 |
| **安全性** | ⭐⭐⭐⭐⭐ (Rust 内存安全) | ⭐⭐⭐⭐ |
| **学习曲线** | 陡峭 (需 Rust) | 平缓 (标准 Web + 原生配置) |
| **插件生态** | 成长中 (Rust 原生插件) | 成熟 (200+ 社区插件) |
| **前端框架** | 任意 (无偏好) | 任意 (无偏好) |
| **适用场景** | 安全敏感、包体积极致压缩、Rust 团队 | Web 团队快速转型、插件依赖重 |

### Tauri Mobile 适用场景

| 场景 | 推荐度 | 说明 |
|------|--------|------|
| 密码管理器/安全工具 | ⭐⭐⭐⭐⭐ | Rust 安全性 + 小包体积 |
| 极简工具类 App | ⭐⭐⭐⭐⭐ | 包体积优势显著 |
| 已有 Rust 后端团队 | ⭐⭐⭐⭐⭐ | 技术栈统一 |
| 快速原型 | ⭐⭐⭐ | 构建工具链配置较复杂 |
| 复杂原生功能 | ⭐⭐⭐ | 插件生态尚在追赶 |

```rust
// Tauri Rust Command 示例
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

> 📌 **数据来源**: Tauri 官方文档 (tauri.app)，Tauri GitHub 仓库，社区基准测试对比。

---

## 性能优化专题

### 启动时间优化

启动时间是移动端应用留存的关键指标。2026 年各方案优化策略：

| 优化手段 | React Native | Flutter | Capacitor/Tauri |
|----------|--------------|---------|-----------------|
| **引擎预加载** | Hermes Bytecode AOT | Dart AOT Snapshot | WebView 预初始化 |
| **懒加载** | `React.lazy` + 分包 | 延迟加载库/资源 | 动态 `import()` |
| **原生启动屏** | `expo-splash-screen` | `flutter_native_splash` | Capacitor Splash Screen API |
| **后台预热** | iOS 后台获取预初始化 | 共享引擎实例 | N/A |
| **最佳实践 TTI** | ~1.5s (新架构+Hermes) | ~2s (Impeller) | ~1s (轻量 Web) |

**React Native 启动优化代码示例**：

```typescript
// 1. Hermes Bytecode 预编译（构建时自动）
// 2. 延迟非关键模块
const HeavyScreen = React.lazy(() => import('./HeavyScreen'));

// 3. 使用 react-native-startup-time 监控
import { getStartupTime } from 'react-native-startup-time';
useEffect(() => {
  getStartupTime().then(time => console.log(`Startup: ${time}ms`));
}, []);

// 4. FlashList 替代 FlatList（大数据集）
import { FlashList } from "@shopify/flash-list";
```

### 包大小优化

| 框架 | 基础包大小 | 优化后 | 主要优化手段 |
|------|-----------|--------|-------------|
| React Native + Hermes | ~8-12MB | ~6-9MB | Hermes 精简、ProGuard/R8、图片资源优化 |
| Flutter (Impeller) | ~15-20MB | ~10-15MB | Tree-shaking、Split AAB、延迟加载 |
| Capacitor | ~1.5MB + Web | ~3-8MB | Web 代码分割、Brotli 压缩、资源懒加载 |
| Tauri Mobile | ~0.6MB + Web | ~2-5MB | Rust LTO、Strip Symbols、Upx 压缩 |

**通用包大小优化策略**：

- **资源优化**: 使用 `react-native-image-picker` 压缩上传，WebP/AVIF 替代 PNG/JPEG
- **代码分割**: 路由级按需加载，减少首屏 JS Bundle
- **原生侧优化**: Android 启用 R8/ProGuard，iOS 启用 Bitcode 精简（Xcode 15+ 已废弃 Bitcode）
- **依赖审计**: 定期使用 `react-native-bundle-visualizer` 或 `webpack-bundle-analyzer` 分析依赖膨胀

```bash
# React Native 包分析
npx react-native-bundle-visualizer

# Android APK/AAB 分析
./gradlew app:analyzeReleaseBundle
```

### 内存管理

**React Native 内存优化**：

- **JSI + Bridgeless**: 消除 Bridge 序列化产生的临时对象，降低 GC 频率
- **Hermes 紧凑 GC**: 分代回收策略针对移动端优化
- **图片缓存控制**: `react-native-fast-image` 替代默认 Image 组件，支持 LRU 缓存策略
- **列表虚拟化**: 始终使用 `FlashList` 或 `RecyclerListView` 处理长列表，避免内存膨胀

**Capacitor/Tauri (WebView) 内存优化**：

- WebView 进程隔离：Android 9+ 支持 `setDataDirectorySuffix` 分离 WebView 数据
- 限制 WebView 缓存大小：通过 Capacitor 配置 `server.androidScheme`
- 及时释放 WebView 资源：页面隐藏时调用 `WebView.onPause()`

---

## 原生模块开发：Swift / Kotlin 桥接

### TurboModules (React Native 官方)

TurboModules 是 React Native 新架构的原生模块系统，基于 JSI 实现高性能绑定：

**开发流程**：

1. 定义接口（TypeScript Spec）
2. Codegen 自动生成 C++ 绑定代码
3. 实现原生模块（Swift / Kotlin / C++）
4. JSI 直接调用，无 Bridge 开销

```typescript
// 1. 定义 Spec (NativeMyModule.ts)
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  readonly getConstants: () => { const1: string };
  readonly doSomething: (value: string) => Promise<string>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('MyModule');
```

```kotlin
// 2. Kotlin 实现 (Android)
@ReactModule(name = "MyModule")
class MyModule(reactContext: ReactApplicationContext) :
  NativeMyModuleSpec(reactContext) {

  override fun getConstants(): Map<String, Any> {
    return mapOf("const1" to "value")
  }

  override fun doSomething(value: String, promise: Promise) {
    promise.resolve("Processed: $value")
  }
}
```

### Expo Modules（推荐用于 Expo 项目）

如前文所述，`expo-modules-core` 大幅简化了原生模块开发：

```kotlin
// Kotlin (expo-modules-core)
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyModule")

    AsyncFunction("processAsync") { input: String ->
      // 自动在协程中执行
      "Result: $input"
    }

    OnDestroy {
      // 清理资源
    }
  }
}
```

### 选型：TurboModules vs Expo Modules

| 场景 | 推荐方案 |
|------|----------|
| Expo 托管工作流 (EAS Build) | **Expo Modules** |
| 纯 React Native (无 Expo) | **TurboModules** |
| 需要 C++ 共享代码 (跨 iOS/Android) | **TurboModules + C++ JSI** |
| 快速开发 MVP / 内部工具 | **Expo Modules** |
| 第三方 SDK 封装 (地图、支付、AI) | **Expo Modules** (社区优先) |

---

## 选型决策树（按业务类型）

### 社交应用（如 Instagram、Discord 类）

```
已有 React 团队且追求原生体验?
├── 是 → React Native + Expo (推荐)
│         └── 需实时音视频? → expo-av + Daily.co / Twilio
├── 否，追求 UI 极致一致? → Flutter
│         └── 需复杂自定义动画? → Flutter (Impeller) 必选
└── 否，Web 团队快速验证? → Capacitor + React
```

**社交应用关键考量**：

- 实时消息：RN 的 `socket.io-client` 或 Flutter 的 `web_socket_channel`
- 推送通知：Expo Notifications / Firebase Cloud Messaging (Capacitor)
- 媒体处理：RN `react-native-video` vs Flutter `video_player`

### 电商应用（如 Shopify、Amazon 类）

```
需要与现有 Web 电商共享代码?
├── 是 → Capacitor (Web 优先) 或 React Native (组件共享)
│         └── 已有 Next.js 站点? → Capacitor 最小改动
├── 否，独立原生体验? → React Native + Expo (Shopify 生产验证)
│         └── 需复杂支付流程? → Stripe React Native SDK / expo-payments-stripe
└── 追求极致性能与包体积? → Flutter (自渲染，性能可控)
```

**电商应用关键数据**：

- Shopify 2026：RN 新架构下电商应用转化率提升 **8%**（页面加载速度优化驱动）
- 包体积敏感地区（新兴市场）: Tauri Mobile 或 Capacitor 更优

### 工具类应用（如笔记、计算器、效率工具）

```
功能简单、包体积极度敏感?
├── 是 → Tauri Mobile (Rust + WebView, ~2MB 总包)
│         └── 团队有 Rust 经验? → Tauri 首选
├── 是，但无 Rust 经验 → Capacitor + 轻量前端框架
│         └── 需离线存储? → Capacitor Preferences API + IndexedDB
└── 功能复杂、需深度系统集成? → React Native + Expo
```

### 游戏 / 图形密集型应用

```
2D 休闲游戏?
├── 是 → Flutter (Flutter Flame 引擎) 或 React Native (react-native-game-engine)
│         └── 物理引擎需求? → Flutter + Forge2D
├── 否，3D 或高性能图形? → 不推荐 JS/TS 方案
│         └── 考虑 Unity / Godot / 原生 Metal/Vulkan
└── WebGL 小游戏移植? → Capacitor + Phaser / Three.js (WebView 内)
```

**游戏方案核心数据**：

- Flutter Flame: GitHub 12k+ Stars，2D 游戏首选
- React Native Skia: `@shopify/react-native-skia` 15k+ Stars，自定义绘制
- Tauri + WebGL: 适用于轻度 WebGL 游戏，包体积极小

---

## 2026 趋势与展望

### 趋势一：React Native 统治力持续强化

- **新架构强制化**（0.82+）消除了社区分裂，所有库必须适配新架构
- **Meta 持续投入**：React Native 仍是 Instagram、Facebook 核心客户端技术
- **Microsoft 加持**：React Native Windows/macOS 持续维护，Teams 大规模使用
- **招聘市场**：RN 岗位数量是 Flutter 的 **2.3 倍**（Hacker News 2026 Q1 招聘数据）

### 趋势二：Expo 生态成熟为"默认选择"

- **新项目的默认流**：~78% 的新 React Native 项目选择 Expo（Expo 2026 Q1 报告）
- **EAS 成为基础设施**：EAS Build/Update 已服务数十万应用，构建可靠性达 99.9%
- **Expo Router 标准化**：文件系统路由成为 Expo 应用的事实标准
- **expo-modules-core 替代 TurboModules**：对于 Expo 用户，原生模块开发门槛降至历史最低

### 趋势三：Tauri Mobile 崛起为"轻量方案"

- **Rust 语言热度**: Rust 连续 8 年当选 Stack Overflow 最受喜爱语言，人才池扩大
- **安全与合规**: Tauri 的 Rust 后端满足金融、政府类应用的安全审计要求
- **包体积优势**: 在新兴市场（网络基础设施薄弱地区），Tauri 的极小体积是核心卖点
- **增长预期**: 预计 2026 年底 Tauri Mobile 采用率将突破 **5%**（桌面端已超过 15%）

### 趋势四：WebView 方案（Capacitor）在企业市场稳固

- **B2B / 企业后台**: Capacitor 是"Web 应用 App 化"的最短路径
- **PWA + App 双轨**: 一套代码同时服务浏览器用户和应用商店用户
- **插件生态扩张**: Capacitor Community 插件数量年增长率 **40%**

### 趋势五：Kotlin Multiplatform 蚕食"逻辑共享"市场

- **业务逻辑共享**: KMP 在"共享网络层、数据层、校验逻辑"场景比 RN/Flutter 更轻量
- **Google 官方背书**: Android 官方文档推荐 KMP 作为跨平台业务逻辑方案
- **与 Compose Multiplatform 协同**: 2025 年 iOS Stable 后，Kotlin 全栈跨平台成为可能

---

## 桌面端移植

### React Native Windows / macOS

| 项目 | 维护者 | Stars | 状态 |
|------|--------|-------|------|
| **react-native-windows** | Microsoft | 15,000+ | 活跃，支持 WinUI 2/3、Xbox |
| **react-native-macos** | Microsoft | 3,800+ | 活跃，与 iOS 代码高度共享 |

React Native 桌面方案适合**已有移动端 RN 应用**向桌面扩展的场景，代码共享率可达 60-80%。但桌面专属组件生态远小于移动端，复杂桌面 UI 仍需原生开发补充。

---

## 快速选型参考

| 团队背景 | 推荐方案 | 预期代码复用率 | 包体积基准 |
|----------|----------|---------------|-----------|
| React/TS 团队，需快速上市 | React Native + Expo | 70-85% | ~8-12MB |
| 追求极致 UI 一致性/动画 | Flutter | 90-95% | ~15-20MB |
| Web 团队，需 PWA + App | Ionic + Capacitor | 80-90% (Web 优先) | ~3-8MB |
| 已有 Web 应用，最小改动 App 化 | Capacitor | 90%+ | ~3-8MB |
| Rust 团队，安全/体积敏感 | Tauri Mobile | 80-90% (前端复用) | ~2-5MB |
| Android/Kotlin 团队扩展 iOS | Kotlin Multiplatform | 80%+ (业务逻辑) | 原生体积 |
| 已有多端 RN 应用，扩展桌面 | RN + react-native-windows/macOS | 60-80% | ~15-25MB |

---

## 参考资料与数据来源

- [React Native 官方文档](https://reactnative.dev/) — 架构、版本发布说明
- [React Native 官方博客](https://reactnative.dev/blog) — Bridgeless Mode、新架构迁移指南
- [Hermes GitHub](https://github.com/facebook/hermes) — 引擎版本发布与性能基准
- [Expo 官方文档](https://docs.expo.dev/) — EAS Build、Expo Router、Expo Modules API
- [Expo 状态页面与开发者报告](https://status.expo.dev/) — 2026 Q1 构建与采用数据
- [Capacitor 官方文档](https://capacitorjs.com/) — 插件开发、架构说明
- [Tauri 官方文档](https://tauri.app/) — v2 移动端支持、Rust API
- [Flutter 官方文档](https://docs.flutter.dev/) — Impeller 引擎、性能优化
- [Kotlin Multiplatform 官方](https://kotlinlang.org/docs/multiplatform.html)
- [Compose Multiplatform](https://www.jetbrains.com/compose-multiplatform/)
- [State of JS 2025](https://stateofjs.com/) — 开发者采用率、满意度调查
- [JetBrains 开发者生态系统调查 2025](https://www.jetbrains.com/lp/devecosystem-2025/) — KMP/Compose 采用数据
- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/) — 语言偏好、技术趋势
- [Shopify Engineering Blog 2026](https://shopify.engineering/) — React Native 生产性能数据
- [Hacker News "Who is hiring" 2026 Q1](https://news.ycombinator.com/) — 招聘需求统计
- GitHub Stars 数据截至 2026-04-30，来自各项目官方仓库

---

*最后更新: 2026年5月*
