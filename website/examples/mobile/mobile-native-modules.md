---
title: "移动端原生模块开发"
description: "使用 Expo Modules API 2.x 开发 Swift/Kotlin 原生模块的完整指南，涵盖类型安全桥接、TurboModules、原生视图与第三方 SDK 集成"
date: 2026-05-01
tags: ["示例", "移动端", "原生模块", "Expo", "Swift", "Kotlin", "React Native"]
category: "examples"
---

# 移动端原生模块开发

> **版本信息**: Expo Modules API 2.x | Swift 5.9+ | Kotlin 2.0+ | React Native 0.76 New Architecture
> **目标读者**: 需要访问平台特定能力、编写高性能原生代码或集成第三方原生 SDK 的开发者

---

## 目录

- [移动端原生模块开发](#移动端原生模块开发)
  - [目录](#目录)
  - [原生模块开发路径选型](#原生模块开发路径选型)
    - [技术方案对比矩阵](#技术方案对比矩阵)
    - [决策树](#决策树)
  - [Expo Modules API 入门](#expo-modules-api-入门)
    - [创建模块](#创建模块)
    - [模块目录结构](#模块目录结构)
    - [模块配置文件](#模块配置文件)
  - [Swift 原生模块开发](#swift-原生模块开发)
    - [基础模块实现](#基础模块实现)
    - [Swift 原生视图组件](#swift-原生视图组件)
    - [视图模块定义](#视图模块定义)
  - [Kotlin 原生模块开发](#kotlin-原生模块开发)
    - [基础模块实现](#基础模块实现-1)
    - [Kotlin 原生视图组件](#kotlin-原生视图组件)
  - [TypeScript 桥接与类型安全](#typescript-桥接与类型安全)
    - [完整的 TypeScript 类型定义](#完整的-typescript-类型定义)
    - [React 组件封装](#react-组件封装)
  - [TurboModules 高级开发](#turbomodules-高级开发)
    - [同步方法调用](#同步方法调用)
    - [Kotlin 同步方法](#kotlin-同步方法)
  - [原生视图组件](#原生视图组件)
    - [Fabric 组件注册 (iOS)](#fabric-组件注册-ios)
  - [常见陷阱与解决方案](#常见陷阱与解决方案)
    - [陷阱 1: 主线程阻塞导致 ANR](#陷阱-1-主线程阻塞导致-anr)
    - [陷阱 2: 事件监听内存泄漏](#陷阱-2-事件监听内存泄漏)
    - [陷阱 3: Android ProGuard 混淆导致方法找不到](#陷阱-3-android-proguard-混淆导致方法找不到)
    - [陷阱 4: iOS 模块未注册](#陷阱-4-ios-模块未注册)
    - [陷阱 5: 类型不匹配导致崩溃](#陷阱-5-类型不匹配导致崩溃)
  - [总结](#总结)
    - [类型映射速查表](#类型映射速查表)
  - [参考引用](#参考引用)

---

## 原生模块开发路径选型

### 技术方案对比矩阵

| 方案 | 语言 | 复杂度 | 性能 | 热更新 | Expo Go | 推荐场景 |
|-----|------|--------|------|--------|---------|---------|
| **Expo Modules API** | Swift/Kotlin | 低 | 高 | ❌ | ❌ | 大多数场景首选 |
| **TurboModules (Old)** | Obj-C++/Java | 高 | 极高 | ❌ | ❌ | 极致性能需求 |
| **C++ TurboModules** | C++ | 极高 | 最高 | ❌ | ❌ | 跨平台共享算法 |
| **NativeModules (Legacy)** | Obj-C/Java | 中 | 中 | ❌ | ❌ | 维护旧代码 |
| **Expo Config Plugin** | JS/TS | 低 | N/A | ✅ | ✅ | 配置原生项目 |

**2026 年推荐**: 对于新开发的原生模块，**Expo Modules API** 是最佳选择。它提供了类型安全的自动绑定、简洁的 API 设计，并且与 Expo SDK 深度集成。

### 决策树

```
是否需要访问原生平台 API?
    │
    ├── 否 → 使用纯 JS/TS 实现
    │
    └── 是 → 是否有现成的 Expo 模块?
              │
              ├── 是 → 使用 expo-xxx 模块
              │
              └── 否 → 需要自定义 UI 组件?
                        │
                        ├── 是 → 使用 Expo Modules API (View)
                        │
                        └── 否 → 需要跨平台共享逻辑?
                                  │
                                  ├── 是 → C++ TurboModule
                                  │
                                  └── 否 → Expo Modules API (Module)
```

---

## Expo Modules API 入门

### 创建模块

```bash
# 在 Monorepo 或项目中创建本地模块
npx create-expo-module@latest expo-device-info

# 或者在现有项目中创建
npx install-expo-modules@latest
```

### 模块目录结构

```
expo-device-info/
├── ios/
│   ├── DeviceInfoModule.swift      # Swift 实现
│   └── DeviceInfoView.swift        # 可选: 自定义视图
├── android/
│   └── src/main/java/expo/modules/deviceinfo/
│       ├── DeviceInfoModule.kt     # Kotlin 实现
│       └── DeviceInfoView.kt       # 可选: 自定义视图
├── src/
│   ├── index.ts                    # TypeScript 导出
│   └── DeviceInfo.types.ts         # 类型定义
├── expo-module.config.json         # 模块配置
└── package.json
```

### 模块配置文件

```json
// expo-module.config.json
{
  "platforms": ["ios", "android"],
  "ios": {
    "modules": ["DeviceInfoModule"]
  },
  "android": {
    "modules": ["expo.modules.deviceinfo.DeviceInfoModule"]
  }
}
```

---

## Swift 原生模块开发

### 基础模块实现

```swift
// ios/DeviceInfoModule.swift
import ExpoModulesCore
import UIKit
import CoreLocation

public class DeviceInfoModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DeviceInfo")

    // 导出的常量
    Constants([
      "platform": "ios",
      "systemVersion": UIDevice.current.systemVersion,
      "model": UIDevice.current.model,
      "name": UIDevice.current.name
    ])

    // 同步方法
    Function("getBatteryLevel") { () -> Float in
      UIDevice.current.isBatteryMonitoringEnabled = true
      return UIDevice.current.batteryLevel
    }

    // 异步方法
    AsyncFunction("getDeviceId") { () -> String in
      if let uuid = UIDevice.current.identifierForVendor?.uuidString {
        return uuid
      }
      throw DeviceInfoError.unableToGetDeviceId
    }

    // 带参数的方法
    Function("setBrightness") { (level: Double) in
      guard level >= 0 && level <= 1 else {
        throw DeviceInfoError.invalidBrightnessLevel
      }
      DispatchQueue.main.async {
        UIScreen.main.brightness = CGFloat(level)
      }
    }

    // 事件发射器
    Events("onBatteryLevelChange")

    // 启动时监听电池变化
    OnCreate {
      UIDevice.current.isBatteryMonitoringEnabled = true
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(self.batteryLevelDidChange),
        name: UIDevice.batteryLevelDidChangeNotification,
        object: nil
      )
    }
  }

  @objc private func batteryLevelDidChange(_ notification: Notification) {
    sendEvent("onBatteryLevelChange", [
      "level": UIDevice.current.batteryLevel,
      "state": UIDevice.current.batteryState.rawValue
    ])
  }
}

enum DeviceInfoError: Error {
  case unableToGetDeviceId
  case invalidBrightnessLevel
}
```

### Swift 原生视图组件

```swift
// ios/DeviceInfoView.swift
import ExpoModulesCore
import UIKit

class DeviceInfoView: ExpoView {
  private let label = UILabel()
  private let imageView = UIImageView()

  var title: String = "" {
    didSet { label.text = title }
  }

  var imageUrl: String = "" {
    didSet { loadImage(from: imageUrl) }
  }

  var onPress: EventDispatcher?

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupView()
  }

  private func setupView() {
    addSubview(imageView)
    addSubview(label)

    imageView.contentMode = .scaleAspectFill
    imageView.clipsToBounds = true
    imageView.layer.cornerRadius = 8

    label.textAlignment = .center
    label.font = UIFont.boldSystemFont(ofSize: 16)
    label.numberOfLines = 0

    imageView.translatesAutoresizingMaskIntoConstraints = false
    label.translatesAutoresizingMaskIntoConstraints = false

    NSLayoutConstraint.activate([
      imageView.topAnchor.constraint(equalTo: topAnchor),
      imageView.leadingAnchor.constraint(equalTo: leadingAnchor),
      imageView.trailingAnchor.constraint(equalTo: trailingAnchor),
      imageView.heightAnchor.constraint(equalToConstant: 150),

      label.topAnchor.constraint(equalTo: imageView.bottomAnchor, constant: 8),
      label.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 16),
      label.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -16),
      label.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -16)
    ])

    let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
    addGestureRecognizer(tapGesture)
    isUserInteractionEnabled = true
  }

  private func loadImage(from urlString: String) {
    guard let url = URL(string: urlString) else { return }
    URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
      guard let data = data, let image = UIImage(data: data) else { return }
      DispatchQueue.main.async {
        self?.imageView.image = image
      }
    }.resume()
  }

  @objc private func handleTap() {
    onPress?.call(["title": title])
  }
}
```

### 视图模块定义

```swift
// ios/DeviceInfoViewModule.swift
import ExpoModulesCore

public class DeviceInfoViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("DeviceInfoView")

    View(DeviceInfoView.self) {
      Prop("title") { (view: DeviceInfoView, prop: String) in
        view.title = prop
      }

      Prop("imageUrl") { (view: DeviceInfoView, prop: String) in
        view.imageUrl = prop
      }

      Events("onPress")
    }
  }
}
```

---

## Kotlin 原生模块开发

### 基础模块实现

```kotlin
// android/src/main/java/expo/modules/deviceinfo/DeviceInfoModule.kt
package expo.modules.deviceinfo

import android.content.Context
import android.os.BatteryManager
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class DeviceInfoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceInfo")

    Constants(
      "platform" to "android",
      "systemVersion" to Build.VERSION.RELEASE,
      "model" to Build.MODEL,
      "manufacturer" to Build.MANUFACTURER,
      "sdkVersion" to Build.VERSION.SDK_INT
    )

    Function("getBatteryLevel") {
      val batteryManager = appContext.reactContext?.
        getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
      val level = batteryManager?.
        getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
      level?.toFloat()?.div(100) ?: -1f
    }

    AsyncFunction("getDeviceId") {
      withContext(Dispatchers.IO) {
        val context = appContext.reactContext
          ?: throw DeviceInfoException("Context not available")
        Settings.Secure.getString(context.contentResolver,
          Settings.Secure.ANDROID_ID)
          ?: throw DeviceInfoException("Unable to get device ID")
      }
    }

    Function("setBrightness") { level: Double ->
      require(level in 0.0..1.0) { "Brightness level must be between 0 and 1" }

      val context = appContext.reactContext
      val window = context?.currentActivity?.window
        ?: throw DeviceInfoException("Activity not available")

      val layoutParams = window.attributes
      layoutParams.screenBrightness = level.toFloat()

      context.currentActivity?.runOnUiThread {
        window.attributes = layoutParams
      }
    }

    Events("onBatteryLevelChange")

    OnCreate {
      // 注册电池变化监听
    }

    OnDestroy {
      // 清理资源
    }
  }
}

class DeviceInfoException(message: String) : Exception(message)
```

### Kotlin 原生视图组件

```kotlin
// android/src/main/java/expo/modules/deviceinfo/DeviceInfoView.kt
package expo.modules.deviceinfo

import android.content.Context
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.bumptech.glide.Glide
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class DeviceInfoView(context: Context, appContext: AppContext) :
  ExpoView(context, appContext) {

  private val imageView: ImageView
  private val textView: TextView

  var title: String = ""
    set(value) {
      field = value
      textView.text = value
    }

  var imageUrl: String = ""
    set(value) {
      field = value
      loadImage(value)
    }

  var onPress: EventDispatcher? = null

  init {
    orientation = VERTICAL
    setPadding(16, 16, 16, 16)

    imageView = ImageView(context).apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, 400)
      scaleType = ImageView.ScaleType.CENTER_CROP
    }

    textView = TextView(context).apply {
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT,
        LayoutParams.WRAP_CONTENT).apply { topMargin = 16 }
      textSize = 16f
      setTextColor(0xFF000000.toInt())
    }

    addView(imageView)
    addView(textView)

    setOnClickListener {
      onPress?.invoke(mapOf("title" to title))
    }
  }

  private fun loadImage(url: String) {
    Glide.with(context)
      .load(url)
      .centerCrop()
      .into(imageView)
  }
}
```

---

## TypeScript 桥接与类型安全

### 完整的 TypeScript 类型定义

```typescript
// src/index.ts
import { requireNativeModule, requireNativeViewManager } from 'expo-modules-core';
import { EventEmitter, Subscription } from 'expo-modules-core';
import { ComponentType } from 'react';
import { ViewProps } from 'react-native';

// 原生模块接口
export interface DeviceInfoModuleType {
  platform: string;
  systemVersion: string;
  model: string;
  name?: string;
  manufacturer?: string;
  sdkVersion?: number;

  getBatteryLevel(): number;
  setBrightness(level: number): void;
  getDeviceId(): Promise<string>;
  addListener(eventName: string, listener: (event: BatteryEvent) => void): Subscription;
}

export interface BatteryEvent {
  level: number;
  state: number;
}

export interface DeviceInfoViewProps extends ViewProps {
  title: string;
  imageUrl: string;
  onPress?: (event: { nativeEvent: { title: string } }) => void;
}

const DeviceInfoModule = requireNativeModule<DeviceInfoModuleType>('DeviceInfo');
export const DeviceInfoView = requireNativeViewManager<DeviceInfoViewProps>('DeviceInfoView');

export const DeviceInfo = {
  get platform() { return DeviceInfoModule.platform; },
  get systemVersion() { return DeviceInfoModule.systemVersion; },
  get model() { return DeviceInfoModule.model; },
  get name() { return DeviceInfoModule.name; },
  get manufacturer() { return DeviceInfoModule.manufacturer; },
  get sdkVersion() { return DeviceInfoModule.sdkVersion; },

  getBatteryLevel: () => DeviceInfoModule.getBatteryLevel(),
  setBrightness: (level: number) => DeviceInfoModule.setBrightness(level),
  getDeviceId: () => DeviceInfoModule.getDeviceId(),

  addBatteryLevelListener: (listener: (event: BatteryEvent) => void): Subscription => {
    return DeviceInfoModule.addListener('onBatteryLevelChange', listener);
  },
};

export default DeviceInfo;
```

### React 组件封装

```typescript
// src/components/DeviceInfoCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceInfo, DeviceInfoView, BatteryEvent } from '../index';

export function DeviceInfoCard(): JSX.Element {
  const [batteryLevel, setBatteryLevel] = React.useState<number>(-1);

  React.useEffect(() => {
    setBatteryLevel(DeviceInfo.getBatteryLevel());

    const subscription = DeviceInfo.addBatteryLevelListener((event: BatteryEvent) => {
      setBatteryLevel(event.level);
    });

    return () => { subscription.remove(); };
  }, []);

  const handleViewPress = (event: { nativeEvent: { title: string } }) => {
    console.log('View pressed:', event.nativeEvent.title);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Device: {DeviceInfo.model}</Text>
      <Text style={styles.text}>OS: {DeviceInfo.platform} {DeviceInfo.systemVersion}</Text>
      <Text style={styles.text}>
        Battery: {batteryLevel >= 0 ? `${(batteryLevel * 100).toFixed(0)}%` : 'Unknown'}
      </Text>

      <DeviceInfoView
        style={styles.nativeView}
        title="Native View Example"
        imageUrl="https://picsum.photos/400/300"
        onPress={handleViewPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  text: { fontSize: 16, marginBottom: 8 },
  nativeView: { width: '100%', height: 250, marginTop: 16 },
});
```

---

## TurboModules 高级开发

### 同步方法调用

```swift
// ios/SyncCalculatorModule.swift
import ExpoModulesCore

public class SyncCalculatorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SyncCalculator")

    // 同步方法 (JSI 直接调用)
    Function("fibonacci") { (n: Int) -> Int in
      func fib(_ n: Int) -> Int {
        if n <= 1 { return n }
        return fib(n - 1) + fib(n - 2)
      }
      return fib(n)
    }

    Function("matrixMultiply") { (a: [[Double]], b: [[Double]]) -> [[Double]] in
      let rowsA = a.count
      let colsA = a[0].count
      let colsB = b[0].count

      var result = Array(repeating: Array(repeating: 0.0, count: colsB), count: rowsA)

      for i in 0..<rowsA {
        for j in 0..<colsB {
          for k in 0..<colsA {
            result[i][j] += a[i][k] * b[k][j]
          }
        }
      }
      return result
    }
  }
}
```

### Kotlin 同步方法

```kotlin
class SyncCalculatorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("SyncCalculator")

    Function("fibonacci") { n: Int ->
      fun fib(n: Int): Int {
        if (n <= 1) return n
        return fib(n - 1) + fib(n - 2)
      }
      fib(n)
    }

    Function("matrixMultiply") { a: List<List<Double>>, b: List<List<Double>> ->
      val rowsA = a.size
      val colsA = a[0].size
      val colsB = b[0].size

      Array(rowsA) { i ->
        Array(colsB) { j ->
          var sum = 0.0
          for (k in 0 until colsA) {
            sum += a[i][k] * b[k][j]
          }
          sum
        }.toList()
      }.toList()
    }
  }
}
```

---

## 原生视图组件

### Fabric 组件注册 (iOS)

```objc
// ios/MyFabricComponent.mm
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewDescriptor.h>

@interface MyFabricComponentView : RCTViewComponentView
@end

@implementation MyFabricComponentView

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<MyFabricComponentComponentDescriptor>();
}

- (void)updateProps:(Props::Shared const &)props oldProps:(Props::Shared const &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<MyFabricComponentProps const>(props);

  if (newProps.title != _title) {
    _title = newProps.title;
    _label.text = [NSString stringWithUTF8String:_title.c_str()];
  }

  [super updateProps:props oldProps:oldProps];
}

@end
```

---

## 常见陷阱与解决方案

### 陷阱 1: 主线程阻塞导致 ANR

**现象**: 同步方法执行耗时操作，UI 卡死。

**解决方案**:

```swift
// ❌ 错误: 在主线程执行耗时操作
Function("heavyCalculation") { (n: Int) -> Int in
  var result = 0
  for i in 0..<n { result += i }
  return result
}

// ✅ 正确: 使用 AsyncFunction 或后台线程
AsyncFunction("heavyCalculation") { (n: Int) -> Int in
  return await withCheckedContinuation { continuation in
    DispatchQueue.global(qos: .userInitiated).async {
      var result = 0
      for i in 0..<n { result += i }
      continuation.resume(returning: result)
    }
  }
}
```

### 陷阱 2: 事件监听内存泄漏

**现象**: 组件卸载后事件仍在发射，导致内存泄漏或崩溃。

**解决方案**:

```typescript
// 使用 useEvent 确保自动清理
import { useEvent } from 'expo';

function useBatteryLevel() {
  const [level, setLevel] = useState(-1);

  useEvent(DeviceInfo, 'onBatteryLevelChange', (event) => {
    setLevel(event.level);
  });

  return level;
}
```

### 陷阱 3: Android ProGuard 混淆导致方法找不到

**现象**: Release 构建时 Native Module 方法调用失败。

**解决方案**:

```text
# android/app/proguard-rules.pro
-keep class expo.modules.deviceinfo.** { *; }
-keepclassmembers class expo.modules.deviceinfo.** { *; }
```

### 陷阱 4: iOS 模块未注册

**现象**: `requireNativeModule` 返回 null。

**解决方案**:

```swift
// 确保 AppDelegate 中注册了 Expo Modules
// ios/YourApp/AppDelegate.mm
#import <ExpoModulesCore/EXModuleRegistryProvider.h>

// Expo SDK 49+ 自动处理，但如果使用裸工作流:
- (NSArray<id<RCTBridgeModule>> *)extraModulesForBridge:(RCTBridge *)bridge {
  return @[]; // Expo Modules 自动注册
}
```

### 陷阱 5: 类型不匹配导致崩溃

**现象**: JS 传递的参数类型与原生期望的不一致。

**解决方案**:

```typescript
// 在 JS 层做类型守卫
function setBrightness(level: number) {
  if (typeof level !== 'number' || level < 0 || level > 1) {
    throw new TypeError('Brightness level must be a number between 0 and 1');
  }
  DeviceInfo.setBrightness(level);
}
```

---

## 总结

原生模块开发是 React Native 进阶的核心能力。Expo Modules API 极大地简化了 Swift/Kotlin 与 TypeScript 之间的桥接工作，使得开发者可以专注于业务逻辑而非繁琐的绑定代码。

**关键要点**:

1. **Expo Modules API** 是 2026 年开发原生模块的首选方案
2. **类型安全** 通过 TypeScript 接口和自动生成的绑定实现
3. **性能敏感操作** 应使用同步方法或后台线程
4. **生命周期管理** 确保事件监听和资源正确清理
5. **测试覆盖** 原生代码需要独立的单元测试

### 类型映射速查表

| TypeScript 类型 | Swift 类型 | Kotlin 类型 | 说明 |
|---------------|-----------|------------|------|
| `string` | `String` | `String` | 字符串 |
| `number` | `Double` / `Int` | `Double` / `Int` | 数字 |
| `boolean` | `Bool` | `Boolean` | 布尔值 |
| `string[]` | `[String]` | `List<String>` | 字符串数组 |
| `Record<string, T>` | `[String: T]` | `Map<String, T>` | 字典 |
| `Promise<T>` | `async -> T` | `suspend -> T` | 异步 |
| `ViewProps` | `ExpoView` | `ExpoView` | 视图 |

---

## 参考引用

1. [Expo Modules API 官方文档](https://docs.expo.dev/modules/overview/) — Expo 团队维护的原生模块开发指南，包含完整的 Swift/Kotlin API 参考
2. [React Native New Architecture](https://reactnative.dev/docs/new-architecture-intro) — Meta 官方新架构文档，涵盖 TurboModules 与 Fabric 的底层原理
3. [Swift Concurrency with Expo Modules](https://docs.expo.dev/modules/module-api/#asyncfunction) — Expo 异步函数与 Swift `withCheckedThrowingContinuation` 集成模式
4. [Android EncryptedSharedPreferences](https://developer.android.com/reference/androidx/security/crypto/EncryptedSharedPreferences) — Google 官方安全存储实现，用于原生模块中的敏感数据持久化
5. [Kotlin Coroutines in React Native](https://kotlinlang.org/docs/coroutines-guide.html) — JetBrains 官方协程指南，适用于 Android 原生模块的异步编程
