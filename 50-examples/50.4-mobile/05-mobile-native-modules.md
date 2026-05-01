# 05 - 移动端原生模块开发指南

> **版本信息**: Expo Modules API 2.x | Swift 5.9+ | Kotlin 2.0+ | React Native 0.76 New Architecture
> **目标读者**: 需要访问平台特定能力、编写高性能原生代码或集成第三方原生 SDK 的开发者
> **阅读时长**: 约 55 分钟

---

## 目录

1. [原生模块开发路径选型](#一原生模块开发路径选型)
2. [Expo Modules API 入门](#二expo-modules-api-入门)
3. [Swift 原生模块开发](#三swift-原生模块开发)
4. [Kotlin 原生模块开发](#四kotlin-原生模块开发)
5. [TypeScript 桥接与类型安全](#五typescript-桥接与类型安全)
6. [TurboModules 高级开发](#六turbomodules-高级开发)
7. [原生视图组件 (Fabric)](#七原生视图组件-fabric)
8. [原生模块测试与调试](#八原生模块测试与调试)
9. [第三方 SDK 集成实战](#九第三方-sdk-集成实战)
10. [常见陷阱与解决方案](#十常见陷阱与解决方案)

---

## 一、原生模块开发路径选型

### 1.1 技术方案对比矩阵

| 方案 | 语言 | 复杂度 | 性能 | 热更新 | Expo Go | 推荐场景 |
|-----|------|--------|------|--------|---------|---------|
| **Expo Modules API** | Swift/Kotlin | 低 | 高 | ❌ | ❌ | 大多数场景首选 |
| **TurboModules (Old)** | Obj-C++/Java | 高 | 极高 | ❌ | ❌ | 极致性能需求 |
| **C++ TurboModules** | C++ | 极高 | 最高 | ❌ | ❌ | 跨平台共享算法 |
| **NativeModules (Legacy)** | Obj-C/Java | 中 | 中 | ❌ | ❌ | 维护旧代码 |
| **Expo Config Plugin** | JS/TS | 低 | N/A | ✅ | ✅ | 配置原生项目 |

**2026 年推荐**: 对于新开发的原生模块，**Expo Modules API** 是最佳选择。它提供了类型安全的自动绑定、简洁的 API 设计，并且与 Expo SDK 深度集成。

### 1.2 决策树

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

## 二、Expo Modules API 入门

### 2.1 创建模块

```bash
# 在 Monorepo 或项目中创建本地模块
npx create-expo-module@latest expo-device-info

# 或者在现有项目中创建
npx install-expo-modules@latest
```

### 2.2 模块目录结构

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

### 2.3 模块配置文件

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

## 三、Swift 原生模块开发

### 3.1 基础模块实现

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
      // 获取或创建设备唯一标识
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

### 3.2 Swift 原生视图组件

```swift
// ios/DeviceInfoView.swift
import ExpoModulesCore
import UIKit

class DeviceInfoView: ExpoView {
  private let label = UILabel()
  private let imageView = UIImageView()
  
  var title: String = "" {
    didSet {
      label.text = title
    }
  }
  
  var imageUrl: String = "" {
    didSet {
      loadImage(from: imageUrl)
    }
  }
  
  var onPress: EventDispatcher? // 回调到 JS
  
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
    
    // 布局约束
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
    
    // 点击手势
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

### 3.3 视图模块定义

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

## 四、Kotlin 原生模块开发

### 4.1 基础模块实现

```kotlin
// android/src/main/java/expo/modules/deviceinfo/DeviceInfoModule.kt
package expo.modules.deviceinfo

import android.content.Context
import android.os.BatteryManager
import android.os.Build
import android.provider.Settings
import android.view.WindowManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class DeviceInfoModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceInfo")
    
    // 导出的常量
    Constants(
      "platform" to "android",
      "systemVersion" to Build.VERSION.RELEASE,
      "model" to Build.MODEL,
      "manufacturer" to Build.MANUFACTURER,
      "sdkVersion" to Build.VERSION.SDK_INT
    )
    
    // 同步方法
    Function("getBatteryLevel") {
      val batteryManager = appContext.reactContext?.getSystemService(Context.BATTERY_SERVICE) as? BatteryManager
      val level = batteryManager?.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
      level?.toFloat()?.div(100) ?: -1f
    }
    
    // 异步方法
    AsyncFunction("getDeviceId") {
      withContext(Dispatchers.IO) {
        val context = appContext.reactContext ?: throw DeviceInfoException("Context not available")
        Settings.Secure.getString(context.contentResolver, Settings.Secure.ANDROID_ID)
          ?: throw DeviceInfoException("Unable to get device ID")
      }
    }
    
    // 带参数的方法
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
    
    // 事件发射器
    Events("onBatteryLevelChange")
    
    // 生命周期
    OnCreate {
      // 注册电池变化监听
      val context = appContext.reactContext ?: return@OnCreate
      // ...
    }
    
    OnDestroy {
      // 清理资源
    }
  }
}

class DeviceInfoException(message: String) : Exception(message)
```

### 4.2 Kotlin 原生视图组件

```kotlin
// android/src/main/java/expo/modules/deviceinfo/DeviceInfoView.kt
package expo.modules.deviceinfo

import android.content.Context
import android.graphics.drawable.Drawable
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import com.bumptech.glide.Glide
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.viewevent.EventDispatcher
import expo.modules.kotlin.views.ExpoView

class DeviceInfoView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
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
      layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT).apply {
        topMargin = 16
      }
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

### 4.3 视图模块定义

```kotlin
// android/src/main/java/expo/modules/deviceinfo/DeviceInfoViewModule.kt
package expo.modules.deviceinfo

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DeviceInfoViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DeviceInfoView")
    
    View(DeviceInfoView::class) {
      Prop("title") { view: DeviceInfoView, prop: String ->
        view.title = prop
      }
      
      Prop("imageUrl") { view: DeviceInfoView, prop: String ->
        view.imageUrl = prop
      }
      
      Events("onPress")
    }
  }
}
```

---

## 五、TypeScript 桥接与类型安全

### 5.1 完整的 TypeScript 类型定义

```typescript
// src/index.ts
import { requireNativeModule, requireNativeViewManager } from 'expo-modules-core';
import { EventEmitter, Subscription } from 'expo-modules-core';
import { ComponentType } from 'react';
import { ViewProps } from 'react-native';

// 原生模块接口
export interface DeviceInfoModuleType {
  // 常量
  platform: string;
  systemVersion: string;
  model: string;
  name?: string;
  manufacturer?: string;
  sdkVersion?: number;

  // 同步方法
  getBatteryLevel(): number;
  setBrightness(level: number): void;

  // 异步方法
  getDeviceId(): Promise<string>;

  // 事件监听
  addListener(eventName: string, listener: (event: BatteryEvent) => void): Subscription;
}

// 事件类型
export interface BatteryEvent {
  level: number;
  state: number;
}

// 视图 Props
export interface DeviceInfoViewProps extends ViewProps {
  title: string;
  imageUrl: string;
  onPress?: (event: { nativeEvent: { title: string } }) => void;
}

// 获取原生模块
const DeviceInfoModule = requireNativeModule<DeviceInfoModuleType>('DeviceInfo');

// 获取原生视图
export const DeviceInfoView = requireNativeViewManager<DeviceInfoViewProps>('DeviceInfoView');

// 导出类型安全的 API
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

### 5.2 React 组件封装

```typescript
// src/components/DeviceInfoCard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceInfo, DeviceInfoView, BatteryEvent } from '../index';

export function DeviceInfoCard(): JSX.Element {
  const [batteryLevel, setBatteryLevel] = React.useState<number>(-1);

  React.useEffect(() => {
    // 获取初始电量
    setBatteryLevel(DeviceInfo.getBatteryLevel());

    // 监听电量变化
    const subscription = DeviceInfo.addBatteryLevelListener((event: BatteryEvent) => {
      setBatteryLevel(event.level);
    });

    return () => {
      subscription.remove();
    };
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
  container: {
    padding: 16,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  nativeView: {
    width: '100%',
    height: 250,
    marginTop: 16,
  },
});
```

---

## 六、TurboModules 高级开发

### 6.1 同步方法调用

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

### 6.2 Kotlin 同步方法

```kotlin
// android/.../SyncCalculatorModule.kt
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

## 七、原生视图组件 (Fabric)

### 7.1 Fabric 组件注册 (iOS)

```objc
// ios/MyFabricComponent.mm
#import <React/RCTViewComponentView.h>
#import <React/RCTComponentViewDescriptor.h>
#import <React/RCTComponentViewFactory.h>

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

## 八、原生模块测试与调试

### 8.1 Swift 单元测试

```swift
// ios/Tests/DeviceInfoModuleTests.swift
import XCTest
@testable import ExpoModulesCore
@testable import ExpoDeviceInfo

class DeviceInfoModuleTests: XCTestCase {
  var module: DeviceInfoModule!
  
  override func setUp() {
    super.setUp()
    module = DeviceInfoModule()
  }
  
  func testBatteryLevel() {
    let level = module.getBatteryLevel()
    XCTAssertGreaterThanEqual(level, 0)
    XCTAssertLessThanEqual(level, 1)
  }
  
  func testSetBrightnessInvalidLevel() {
    XCTAssertThrowsError(try module.setBrightness(level: 1.5))
  }
}
```

### 8.2 Kotlin 单元测试

```kotlin
// android/src/test/java/.../DeviceInfoModuleTest.kt
package expo.modules.deviceinfo

import org.junit.Test
import org.junit.Assert.*

class DeviceInfoModuleTest {
  @Test
  fun testBatteryLevel() {
    // 使用 Mockito 模拟 Context
    // ...
  }
  
  @Test
  fun testSetBrightnessValidation() {
    val module = DeviceInfoModule()
    assertThrows(IllegalArgumentException::class.java) {
      module.definition().functions
        .first { it.name == "setBrightness" }
        .call(1.5)
    }
  }
}
```

---

## 九、第三方 SDK 集成实战

### 9.1 集成 ML Kit (示例)

```swift
// ios/MLKitModule.swift
import ExpoModulesCore
import MLKitVision
import MLKitTextRecognition

public class MLKitModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MLKit")
    
    AsyncFunction("recognizeText") { (imageUri: String) -> [String] in
      guard let url = URL(string: imageUri),
            let image = UIImage(contentsOfFile: url.path) else {
        throw MLKitError.invalidImage
      }
      
      let visionImage = VisionImage(image: image)
      let textRecognizer = TextRecognizer.textRecognizer()
      
      return try await withCheckedThrowingContinuation { continuation in
        textRecognizer.process(visionImage) { result, error in
          if let error = error {
            continuation.resume(throwing: error)
            return
          }
          
          let texts = result?.blocks.map { $0.text } ?? []
          continuation.resume(returning: texts)
        }
      }
    }
  }
}

enum MLKitError: Error {
  case invalidImage
}
```

---

## 十、常见陷阱与解决方案

### 陷阱 1: 主线程阻塞导致 ANR

**现象**: 同步方法执行耗时操作，UI 卡死。

**解决方案**:
```swift
// ❌ 错误: 在主线程执行耗时操作
Function("heavyCalculation") { (n: Int) -> Int in
  var result = 0
  for i in 0..<n { result += i }  // 阻塞主线程!
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
```proguard
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

下一步建议阅读 [06-expo-router-deep-dive.md](./06-expo-router-deep-dive.md)，学习如何在原生模块基础上构建复杂的导航和认证流程。


---

## 附录 A: 完整的 Expo Module 开发工作流

### A.1 创建本地 Expo Module

```bash
# 在现有 Expo 项目中创建本地模块
mkdir -p modules/expo-secure-storage

# 目录结构
modules/expo-secure-storage/
├── ios/
│   └── SecureStorageModule.swift
├── android/
│   └── src/main/java/expo/modules/securestorage/
│       └── SecureStorageModule.kt
├── src/
│   └── index.ts
├── expo-module.config.json
└── package.json
```

### A.2 安全存储模块 (Swift)

```swift
// modules/expo-secure-storage/ios/SecureStorageModule.swift
import ExpoModulesCore
import Security

public class SecureStorageModule: Module {
  private let service = "com.yourapp.securestorage"
  private let accessible = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly

  public func definition() -> ModuleDefinition {
    Name("SecureStorage")

    AsyncFunction("setItemAsync") { (key: String, value: String, options: [String: String]?) -> Bool in
      guard let data = value.data(using: .utf8) else {
        throw SecureStorageError.invalidValue
      }

      // 先删除已存在的条目
      deleteItem(key: key)

      let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: self.service,
        kSecAttrAccount as String: key,
        kSecValueData as String: data,
        kSecAttrAccessible as String: self.accessible,
      ]

      let status = SecItemAdd(query as CFDictionary, nil)
      guard status == errSecSuccess else {
        throw SecureStorageError.saveFailed(status: status)
      }
      return true
    }

    AsyncFunction("getItemAsync") { (key: String) -> String? in
      let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: self.service,
        kSecAttrAccount as String: key,
        kSecReturnData as String: true,
        kSecMatchLimit as String: kSecMatchLimitOne,
      ]

      var result: AnyObject?
      let status = SecItemCopyMatching(query as CFDictionary, &result)

      guard status == errSecSuccess,
            let data = result as? Data,
            let value = String(data: data, encoding: .utf8) else {
        return nil
      }
      return value
    }

    AsyncFunction("deleteItemAsync") { (key: String) -> Bool in
      return self.deleteItem(key: key)
    }

    AsyncFunction("getAllKeysAsync") { () -> [String] in
      let query: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrService as String: self.service,
        kSecReturnAttributes as String: true,
        kSecMatchLimit as String: kSecMatchLimitAll,
      ]

      var result: AnyObject?
      let status = SecItemCopyMatching(query as CFDictionary, &result)

      guard status == errSecSuccess,
            let items = result as? [[String: Any]] else {
        return []
      }

      return items.compactMap { item in
        item[kSecAttrAccount as String] as? String
      }
    }
  }

  private func deleteItem(key: String) -> Bool {
    let query: [String: Any] = [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: self.service,
      kSecAttrAccount as String: key,
    ]
    let status = SecItemDelete(query as CFDictionary)
    return status == errSecSuccess || status == errSecItemNotFound
  }
}

enum SecureStorageError: Error {
  case invalidValue
  case saveFailed(status: OSStatus)

  var localizedDescription: String {
    switch self {
    case .invalidValue:
      return "Invalid value provided"
    case .saveFailed(let status):
      return "Failed to save item (status: \(status))"
    }
  }
}
```

### A.3 安全存储模块 (Kotlin)

```kotlin
// modules/expo-secure-storage/android/.../SecureStorageModule.kt
package expo.modules.securestorage

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SecureStorageModule : Module() {
  private val sharedPreferences by lazy {
    val context = appContext.reactContext ?: throw SecureStorageException("Context not available")
    val masterKey = MasterKey.Builder(context)
      .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
      .build()

    EncryptedSharedPreferences.create(
      context,
      "secure_storage",
      masterKey,
      EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
      EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
  }

  override fun definition() = ModuleDefinition {
    Name("SecureStorage")

    AsyncFunction("setItemAsync") { key: String, value: String ->
      try {
        sharedPreferences.edit()
          .putString(key, value)
          .apply()
        true
      } catch (e: Exception) {
        throw SecureStorageException("Failed to save item: ${e.message}")
      }
    }

    AsyncFunction("getItemAsync") { key: String ->
      try {
        sharedPreferences.getString(key, null)
      } catch (e: Exception) {
        null
      }
    }

    AsyncFunction("deleteItemAsync") { key: String ->
      try {
        sharedPreferences.edit()
          .remove(key)
          .apply()
        true
      } catch (e: Exception) {
        false
      }
    }

    AsyncFunction("getAllKeysAsync") {
      sharedPreferences.all.keys.toList()
    }
  }
}

class SecureStorageException(message: String) : Exception(message)
```

### A.4 TypeScript 封装

```typescript
// modules/expo-secure-storage/src/index.ts
import { requireNativeModule } from 'expo-modules-core';

interface SecureStorageModule {
  setItemAsync(key: string, value: string): Promise<boolean>;
  getItemAsync(key: string): Promise<string | null>;
  deleteItemAsync(key: string): Promise<boolean>;
  getAllKeysAsync(): Promise<string[]>;
}

const SecureStorage = requireNativeModule<SecureStorageModule>('SecureStorage');

export const SecureStorageAPI = {
  async setItem(key: string, value: string): Promise<void> {
    const success = await SecureStorage.setItemAsync(key, value);
    if (!success) throw new Error(`Failed to set item: ${key}`);
  },

  async getItem(key: string): Promise<string | null> {
    return SecureStorage.getItemAsync(key);
  },

  async deleteItem(key: string): Promise<void> {
    await SecureStorage.deleteItemAsync(key);
  },

  async getAllKeys(): Promise<string[]> {
    return SecureStorage.getAllKeysAsync();
  },

  async multiSet(items: [string, string][]): Promise<void> {
    await Promise.all(items.map(([key, value]) => this.setItem(key, value)));
  },

  async multiGet(keys: string[]): Promise<Array<[string, string | null]>> {
    const values = await Promise.all(keys.map((key) => this.getItem(key)));
    return keys.map((key, index) => [key, values[index]]);
  },

  async multiDelete(keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.deleteItem(key)));
  },

  async clear(): Promise<void> {
    const keys = await this.getAllKeys();
    await this.multiDelete(keys);
  },
};

// React Hook
export function useSecureStorage() {
  const [isLoading, setIsLoading] = React.useState(false);

  const setItem = React.useCallback(async (key: string, value: string) => {
    setIsLoading(true);
    try {
      await SecureStorageAPI.setItem(key, value);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getItem = React.useCallback(async (key: string) => {
    setIsLoading(true);
    try {
      return await SecureStorageAPI.getItem(key);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { setItem, getItem, isLoading };
}
```

---

## 附录 B: 生物识别认证模块开发

### B.1 iOS Face ID / Touch ID

```swift
// ios/BiometricsModule.swift
import ExpoModulesCore
import LocalAuthentication

public class BiometricsModule: Module {
  private var context = LAContext()

  public func definition() -> ModuleDefinition {
    Name("Biometrics")

    AsyncFunction("isAvailableAsync") { () -> [String: Any] in
      var error: NSError?
      let canEvaluate = context.canEvaluatePolicy(
        .deviceOwnerAuthenticationWithBiometrics,
        error: &error
      )

      let biometryType: String
      switch context.biometryType {
      case .faceID: biometryType = "FaceID"
      case .touchID: biometryType = "TouchID"
      case .opticID: biometryType = "OpticID"
      default: biometryType = "None"
      }

      return [
        "available": canEvaluate,
        "biometryType": biometryType,
        "enrolled": canEvaluate,
        "error": error?.localizedDescription as Any,
      ]
    }

    AsyncFunction("authenticateAsync") { (promptMessage: String, fallbackLabel: String?) -> [String: Any] in
      self.context = LAContext()
      self.context.localizedFallbackTitle = fallbackLabel

      do {
        let success = try await self.context.evaluatePolicy(
          .deviceOwnerAuthenticationWithBiometrics,
          localizedReason: promptMessage
        )
        return ["success": success, "error": NSNull()]
      } catch let error {
        return [
          "success": false,
          "error": error.localizedDescription,
          "code": (error as NSError).code,
        ]
      }
    }

    AsyncFunction("getCredentialStateAsync") { (userId: String) -> String in
      // 检查 Apple ID 凭证状态 (Sign in with Apple)
      // 需要 ASAuthorizationAppleIDProvider
      return "authorized"
    }
  }
}
```

### B.2 Android 生物识别

```kotlin
// android/.../BiometricsModule.kt
package expo.modules.biometrics

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

class BiometricsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Biometrics")

    AsyncFunction("isAvailableAsync") {
      val context = appContext.reactContext ?: return@AsyncFunction mapOf(
        "available" to false,
        "biometryType" to "None",
        "error" to "Context not available"
      )

      val biometricManager = BiometricManager.from(context)
      val canAuthenticate = biometricManager.canAuthenticate(
        BiometricManager.Authenticators.BIOMETRIC_STRONG
      )

      val available = canAuthenticate == BiometricManager.BIOMETRIC_SUCCESS
      val biometryType = when (canAuthenticate) {
        BiometricManager.BIOMETRIC_SUCCESS -> "Biometric"
        BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE -> "None"
        BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE -> "None"
        BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED -> "None"
        else -> "None"
      }

      mapOf(
        "available" to available,
        "biometryType" to biometryType,
        "enrolled" to available
      )
    }

    AsyncFunction("authenticateAsync") { promptMessage: String ->
      val activity = appContext.currentActivity as? FragmentActivity
        ?: throw BiometricsException("Activity not available")

      suspendCancellableCoroutine { continuation ->
        val executor = ContextCompat.getMainExecutor(activity)
        val biometricPrompt = BiometricPrompt(
          activity,
          executor,
          object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: AuthenticationResult) {
              continuation.resume(mapOf("success" to true, "error" to null))
            }

            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
              continuation.resume(mapOf(
                "success" to false,
                "error" to errString.toString(),
                "code" to errorCode
              ))
            }

            override fun onAuthenticationFailed() {
              continuation.resume(mapOf("success" to false, "error" to "Authentication failed"))
            }
          }
        )

        val promptInfo = BiometricPrompt.PromptInfo.Builder()
          .setTitle("Biometric Authentication")
          .setSubtitle(promptMessage)
          .setNegativeButtonText("Cancel")
          .build()

        biometricPrompt.authenticate(promptInfo)
      }
    }
  }
}

class BiometricsException(message: String) : Exception(message)
```

### B.3 TypeScript API 与 Hook

```typescript
// src/modules/Biometrics.ts
import { requireNativeModule } from 'expo-modules-core';

interface BiometricsModule {
  isAvailableAsync(): Promise<{
    available: boolean;
    biometryType: 'FaceID' | 'TouchID' | 'OpticID' | 'Biometric' | 'None';
    enrolled: boolean;
    error?: string;
  }>;

  authenticateAsync(
    promptMessage: string,
    fallbackLabel?: string
  ): Promise<{
    success: boolean;
    error?: string;
    code?: number;
  }>;
}

const BiometricsNative = requireNativeModule<BiometricsModule>('Biometrics');

export const Biometrics = {
  async isAvailable() {
    return BiometricsNative.isAvailableAsync();
  },

  async authenticate(promptMessage: string, fallbackLabel?: string) {
    return BiometricsNative.authenticateAsync(promptMessage, fallbackLabel);
  },

  async authenticateWithFallback(
    promptMessage: string,
    onFallback: () => void
  ): Promise<boolean> {
    const result = await this.authenticate(promptMessage, 'Use Passcode');

    if (result.success) return true;

    // 用户选择回退或生物识别失败
    if (result.code === 10 || result.code === 2) { // LAErrorUserCancel or userFallback
      onFallback();
    }

    return false;
  },
};

// React Hook
export function useBiometrics() {
  const [isAvailable, setIsAvailable] = React.useState(false);
  const [biometryType, setBiometryType] = React.useState<string>('None');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    Biometrics.isAvailable().then((result) => {
      setIsAvailable(result.available);
      setBiometryType(result.biometryType);
    });
  }, []);

  const authenticate = React.useCallback(async (message: string) => {
    setIsLoading(true);
    try {
      return await Biometrics.authenticate(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isAvailable,
    biometryType,
    isLoading,
    authenticate,
  };
}

// 使用示例
function SecureActionButton() {
  const biometrics = useBiometrics();
  const router = useRouter();

  const handleSecureAction = async () => {
    if (!biometrics.isAvailable) {
      // 回退到密码验证
      router.push('/verify-password');
      return;
    }

    const result = await biometrics.authenticate('验证以继续操作');
    if (result.success) {
      // 执行敏感操作
      performSecureAction();
    }
  };

  return (
    <Button
      title="执行安全操作"
      onPress={handleSecureAction}
      loading={biometrics.isLoading}
    />
  );
}
```

---

## 附录 C: 原生模块测试完整指南

### C.1 iOS 单元测试 (XCTest)

```swift
// ios/Tests/SecureStorageTests.swift
import XCTest
@testable import ExpoModulesCore
@testable import ExpoSecureStorage

class SecureStorageTests: XCTestCase {
  var module: SecureStorageModule!

  override func setUp() {
    super.setUp()
    module = SecureStorageModule()
    // 清理测试数据
    _ = module.deleteItem(key: "test_key")
  }

  override func tearDown() {
    _ = module.deleteItem(key: "test_key")
    super.tearDown()
  }

  func testSetAndGetItem() async throws {
    let key = "test_key"
    let value = "test_value_中文测试"

    let saved = try await module.setItemAsync(key: key, value: value, options: nil)
    XCTAssertTrue(saved)

    let retrieved = try await module.getItemAsync(key: key)
    XCTAssertEqual(retrieved, value)
  }

  func testDeleteItem() async throws {
    let key = "test_key"
    try await module.setItemAsync(key: key, value: "value", options: nil)

    let deleted = try await module.deleteItemAsync(key: key)
    XCTAssertTrue(deleted)

    let retrieved = try await module.getItemAsync(key: key)
    XCTAssertNil(retrieved)
  }

  func testGetAllKeys() async throws {
    try await module.setItemAsync(key: "key1", value: "value1", options: nil)
    try await module.setItemAsync(key: "key2", value: "value2", options: nil)

    let keys = try await module.getAllKeysAsync()
    XCTAssertTrue(keys.contains("key1"))
    XCTAssertTrue(keys.contains("key2"))
  }

  func testLargeValue() async throws {
    let largeValue = String(repeating: "A", count: 100000)
    let saved = try await module.setItemAsync(key: "large", value: largeValue, options: nil)
    XCTAssertTrue(saved)

    let retrieved = try await module.getItemAsync(key: "large")
    XCTAssertEqual(retrieved?.count, largeValue.count)
  }
}
```

### C.2 Android 单元测试 (JUnit + Robolectric)

```kotlin
// android/src/test/java/.../SecureStorageModuleTest.kt
package expo.modules.securestorage

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [28])
class SecureStorageModuleTest {
  private lateinit var context: Context
  private lateinit var module: SecureStorageModule

  @Before
  fun setup() {
    context = ApplicationProvider.getApplicationContext()
    module = SecureStorageModule()
    // Robolectric 需要特殊处理 appContext
  }

  @After
  fun teardown() {
    runBlocking {
      module.definition().functions
        .first { it.name == "deleteItemAsync" }
        .call("test_key")
    }
  }

  @Test
  fun testSetAndGetItem() = runBlocking {
    val key = "test_key"
    val value = "test_value_中文测试"

    val saved = module.definition().functions
      .first { it.name == "setItemAsync" }
      .call(key, value)

    assertEquals(true, saved)

    val retrieved = module.definition().functions
      .first { it.name == "getItemAsync" }
      .call(key) as? String

    assertEquals(value, retrieved)
  }

  @Test
  fun testDeleteItem() = runBlocking {
    val key = "test_key"
    module.definition().functions
      .first { it.name == "setItemAsync" }
      .call(key, "value")

    val deleted = module.definition().functions
      .first { it.name == "deleteItemAsync" }
      .call(key)

    assertEquals(true, deleted)

    val retrieved = module.definition().functions
      .first { it.name == "getItemAsync" }
      .call(key)

    assertNull(retrieved)
  }
}
```

### C.3 端到端测试 (Detox)

```typescript
// e2e/native-module.test.ts
import { device, expect, element, by } from 'detox';

describe('Native Module Integration', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should store and retrieve secure data', async () => {
    await element(by.id('secure-storage-input')).typeText('secret_data');
    await element(by.id('store-button')).tap();

    await expect(element(by.text('Stored successfully'))).toBeVisible();

    await element(by.id('retrieve-button')).tap();

    await expect(element(by.text('secret_data'))).toBeVisible();
  });

  it('should authenticate with biometrics', async () => {
    await element(by.id('biometric-auth-button')).tap();

    // iOS: 使用 EarlGrey 匹配系统弹窗
    if (device.getPlatform() === 'ios') {
      await element(by.type('_UIAlertControllerView')).tap();
    }

    await expect(element(by.text('Authentication successful'))).toBeVisible();
  });
});
```

---

## 附录 D: 原生模块发布与版本管理

### D.1 NPM 发布配置

```json
// package.json
{
  "name": "@yourorg/expo-device-info",
  "version": "1.0.0",
  "description": "Expo module for accessing device information",
  "main": "build/index.js",
  "types": "build/index.d.ts",
  "scripts": {
    "build": "expo-module build",
    "clean": "expo-module clean",
    "lint": "expo-module lint",
    "test": "expo-module test",
    "prepare": "expo-module prepare",
    "prepublishOnly": "expo-module prepublishOnly",
    "expo-module": "expo-module"
  },
  "keywords": ["react-native", "expo", "device", "ios", "android"],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourorg/expo-device-info.git"
  },
  "bugs": {
    "url": "https://github.com/yourorg/expo-device-info/issues"
  },
  "author": "Your Name <you@example.com>",
  "license": "MIT",
  "homepage": "https://github.com/yourorg/expo-device-info#readme",
  "dependencies": {
    "expo-modules-core": "^1.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "expo-module-scripts": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "peerDependencies": {
    "expo": "*",
    "react": "*",
    "react-native": "*"
  }
}
```

### D.2 自动化发布流程

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Publish to NPM
        run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          generate_release_notes: true
```

---

## 附录 E: 原生模块常见 API 模式速查表

| 需求场景 | Swift 实现 | Kotlin 实现 | TypeScript 接口 | 注意事项 |
|---------|-----------|------------|----------------|---------|
| 同步返回值 | `Function("getVersion") { () -> String in }` | `Function("getVersion") { "1.0.0" }` | `getVersion(): string` | 避免耗时操作 |
| 异步操作 | `AsyncFunction("fetchData") { () -> Data in }` | `AsyncFunction("fetchData") { ... }` | `fetchData(): Promise<Data>` | 使用后台线程 |
| 事件发射 | `Events("onUpdate")` + `sendEvent(...)` | `Events("onUpdate")` | `addListener(event, callback)` | 记得清理监听 |
| 常量导出 | `Constants([...])` | `constants = mapOf(...)` | 直接属性访问 | 启动时确定 |
| 原生视图 | `View(MyView.self)` | `View(MyView::class)` | `React.FC<ViewProps>` | 实现 measure |
| 枚举参数 | `String` + 校验 | `String` + 校验 | `type Mode = 'A' \| 'B'` | 明确错误信息 |
| 字典参数 | `[String: Any]` | `Map<String, Any>` | `Record<string, unknown>` | 类型转换要小心 |
| 数组返回 | `[[String: Any]]` | `List<Map<String, Any>>` | `Array<Record<string, unknown>>` | 大数据量分页 |
| 文件路径 | `URL` / `String` | `Uri` / `String` | `string` | URI 编码处理 |
| 权限请求 | `AVCaptureDevice.requestAccess` | `ActivityCompat.requestPermissions` | 先检查再请求 | 处理拒绝情况 |

---

## 附录 F: Expo Modules API 与 TurboModules 对比决策表

| 维度 | Expo Modules API | TurboModules (C++ / Native) |
|-----|------------------|----------------------------|
| **开发速度** | ⭐⭐⭐⭐⭐ (自动生成绑定) | ⭐⭐⭐ (手动配置) |
| **类型安全** | ⭐⭐⭐⭐ (运行时+编译时) | ⭐⭐⭐⭐⭐ (完全编译时) |
| **性能上限** | ⭐⭐⭐⭐ (足够绝大多数场景) | ⭐⭐⭐⭐⭐ (JSI 直接调用) |
| **跨平台复用** | ⭐⭐⭐ (iOS/Android 分离) | ⭐⭐⭐⭐⭐ (C++ 共享逻辑) |
| **调试体验** | ⭐⭐⭐⭐⭐ (Expo 工具链) | ⭐⭐⭐ (原生调试器) |
| **生态兼容** | ⭐⭐⭐⭐⭐ (Expo SDK) | ⭐⭐⭐⭐ (RN Core) |
| **包体积影响** | ⭐⭐⭐⭐ (小而精) | ⭐⭐⭐ (C++ Runtime) |
| **学习曲线** | ⭐⭐⭐⭐⭐ (前端友好) | ⭐⭐⭐ (需要原生知识) |
| **2026 推荐** | 大多数场景首选 | 极致性能或 C++ 算法 |


---

## 附录 G: 完整的传感器模块开发

### G.1 加速度计与陀螺仪

```swift
// ios/SensorModule.swift
import ExpoModulesCore
import CoreMotion

public class SensorModule: Module {
  private let motionManager = CMMotionManager()
  private var timer: Timer?

  public func definition() -> ModuleDefinition {
    Name("Sensor")

    Constants([
      "isAccelerometerAvailable": motionManager.isAccelerometerAvailable,
      "isGyroscopeAvailable": motionManager.isGyroscopeAvailable,
      "isMagnetometerAvailable": motionManager.isMagnetometerAvailable,
      "isDeviceMotionAvailable": motionManager.isDeviceMotionAvailable,
    ])

    AsyncFunction("startAccelerometerUpdates") { (interval: Double) in
      guard motionManager.isAccelerometerAvailable else {
        throw SensorError.accelerometerNotAvailable
      }
      motionManager.accelerometerUpdateInterval = interval
      motionManager.startAccelerometerUpdates(to: .main) { [weak self] data, error in
        guard let data = data else { return }
        self?.sendEvent("onAccelerometerChange", [
          "x": data.acceleration.x,
          "y": data.acceleration.y,
          "z": data.acceleration.z,
          "timestamp": data.timestamp,
        ])
      }
    }

    AsyncFunction("stopAccelerometerUpdates") {
      motionManager.stopAccelerometerUpdates()
    }

    AsyncFunction("startGyroscopeUpdates") { (interval: Double) in
      guard motionManager.isGyroscopeAvailable else {
        throw SensorError.gyroscopeNotAvailable
      }
      motionManager.gyroUpdateInterval = interval
      motionManager.startGyroUpdates(to: .main) { [weak self] data, error in
        guard let data = data else { return }
        self?.sendEvent("onGyroscopeChange", [
          "x": data.rotationRate.x,
          "y": data.rotationRate.y,
          "z": data.rotationRate.z,
          "timestamp": data.timestamp,
        ])
      }
    }

    AsyncFunction("stopGyroscopeUpdates") {
      motionManager.stopGyroUpdates()
    }

    AsyncFunction("startDeviceMotionUpdates") { (interval: Double) in
      guard motionManager.isDeviceMotionAvailable else {
        throw SensorError.deviceMotionNotAvailable
      }
      motionManager.deviceMotionUpdateInterval = interval
      motionManager.startDeviceMotionUpdates(to: .main) { [weak self] data, error in
        guard let data = data else { return }
        self?.sendEvent("onDeviceMotionChange", [
          "acceleration": [
            "x": data.userAcceleration.x,
            "y": data.userAcceleration.y,
            "z": data.userAcceleration.z,
          ],
          "rotationRate": [
            "x": data.rotationRate.x,
            "y": data.rotationRate.y,
            "z": data.rotationRate.z,
          ],
          "attitude": [
            "pitch": data.attitude.pitch,
            "roll": data.attitude.roll,
            "yaw": data.attitude.yaw,
          ],
          "timestamp": data.timestamp,
        ])
      }
    }

    AsyncFunction("stopDeviceMotionUpdates") {
      motionManager.stopDeviceMotionUpdates()
    }

    Events("onAccelerometerChange", "onGyroscopeChange", "onDeviceMotionChange")

    OnDestroy {
      motionManager.stopAccelerometerUpdates()
      motionManager.stopGyroUpdates()
      motionManager.stopDeviceMotionUpdates()
    }
  }
}

enum SensorError: Error {
  case accelerometerNotAvailable
  case gyroscopeNotAvailable
  case deviceMotionNotAvailable
}
```

### G.2 Android 传感器

```kotlin
// android/.../SensorModule.kt
package expo.modules.sensor

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class SensorModule : Module(), SensorEventListener {
  private val sensorManager by lazy {
    appContext.reactContext?.getSystemService(android.content.Context.SENSOR_SERVICE) as? SensorManager
  }

  private var accelerometerSensor: Sensor? = null
  private var gyroscopeSensor: Sensor? = null

  override fun definition() = ModuleDefinition {
    Name("Sensor")

    Constants(
      "isAccelerometerAvailable" to (sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER) != null),
      "isGyroscopeAvailable" to (sensorManager?.getDefaultSensor(Sensor.TYPE_GYROSCOPE) != null),
      "isMagnetometerAvailable" to (sensorManager?.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD) != null),
    )

    AsyncFunction("startAccelerometerUpdates") { interval: Double ->
      val manager = sensorManager ?: throw SensorException("SensorManager not available")
      accelerometerSensor = manager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        ?: throw SensorException("Accelerometer not available")

      manager.registerListener(
        this@SensorModule,
        accelerometerSensor,
        (interval * 1000000).toInt()
      )
    }

    AsyncFunction("stopAccelerometerUpdates") {
      sensorManager?.unregisterListener(this, accelerometerSensor)
    }

    AsyncFunction("startGyroscopeUpdates") { interval: Double ->
      val manager = sensorManager ?: throw SensorException("SensorManager not available")
      gyroscopeSensor = manager.getDefaultSensor(Sensor.TYPE_GYROSCOPE)
        ?: throw SensorException("Gyroscope not available")

      manager.registerListener(
        this@SensorModule,
        gyroscopeSensor,
        (interval * 1000000).toInt()
      )
    }

    AsyncFunction("stopGyroscopeUpdates") {
      sensorManager?.unregisterListener(this, gyroscopeSensor)
    }

    Events("onAccelerometerChange", "onGyroscopeChange")
  }

  override fun onSensorChanged(event: SensorEvent) {
    when (event.sensor.type) {
      Sensor.TYPE_ACCELEROMETER -> {
        sendEvent("onAccelerometerChange", mapOf(
          "x" to event.values[0],
          "y" to event.values[1],
          "z" to event.values[2],
          "timestamp" to event.timestamp
        ))
      }
      Sensor.TYPE_GYROSCOPE -> {
        sendEvent("onGyroscopeChange", mapOf(
          "x" to event.values[0],
          "y" to event.values[1],
          "z" to event.values[2],
          "timestamp" to event.timestamp
        ))
      }
    }
  }

  override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}

class SensorException(message: String) : Exception(message)
```

### G.3 TypeScript Hook

```typescript
// src/hooks/useSensors.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { requireNativeModule } from 'expo-modules-core';

interface SensorData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

interface SensorModule {
  startAccelerometerUpdates(interval: number): Promise<void>;
  stopAccelerometerUpdates(): Promise<void>;
  startGyroscopeUpdates(interval: number): Promise<void>;
  stopGyroscopeUpdates(): Promise<void>;
  addListener(event: string, callback: (data: any) => void): { remove: () => void };
}

const Sensor = requireNativeModule<SensorModule>('Sensor');

export function useAccelerometer(interval: number = 0.1) {
  const [data, setData] = useState<SensorData | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    Sensor.startAccelerometerUpdates(interval);
    const subscription = Sensor.addListener('onAccelerometerChange', (event: SensorData) => {
      setData(event);
    });

    return () => {
      subscription.remove();
      Sensor.stopAccelerometerUpdates();
    };
  }, [interval]);

  return { data, isAvailable };
}

export function useGyroscope(interval: number = 0.1) {
  const [data, setData] = useState<SensorData | null>(null);

  useEffect(() => {
    Sensor.startGyroscopeUpdates(interval);
    const subscription = Sensor.addListener('onGyroscopeChange', (event: SensorData) => {
      setData(event);
    });

    return () => {
      subscription.remove();
      Sensor.stopGyroscopeUpdates();
    };
  }, [interval]);

  return { data };
}

// 摇一摇检测
export function useShakeDetection(threshold: number = 15, cooldown: number = 1000) {
  const { data } = useAccelerometer(0.05);
  const lastShake = useRef(0);
  const [shaken, setShaken] = useState(false);

  useEffect(() => {
    if (!data) return;

    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    const now = Date.now();

    if (magnitude > threshold && now - lastShake.current > cooldown) {
      lastShake.current = now;
      setShaken(true);
      const timer = setTimeout(() => setShaken(false), 500);
      return () => clearTimeout(timer);
    }
  }, [data, threshold, cooldown]);

  return shaken;
}
```

---

## 附录 H: 原生模块性能优化指南

### H.1 批量操作优化

```swift
// 避免频繁 JS → Native 调用
// ❌ 低效: 循环中逐个调用
for i in 0..<1000 {
  module.setItem("key_\(i)", value: "value_\(i)")
}

// ✅ 高效: 批量操作
module.batchSetItems([
  ["key_0", "value_0"],
  ["key_1", "value_1"],
  // ...
])

// Swift 实现
Function("batchSetItems") { (items: [[String]]) -> Int in
  var count = 0
  for item in items {
    guard item.count >= 2 else { continue }
    // 批量写入数据库或 UserDefaults
    UserDefaults.standard.set(item[1], forKey: item[0])
    count += 1
  }
  // 同步写入磁盘
  UserDefaults.standard.synchronize()
  return count
}
```

### H.2 线程模型最佳实践

```swift
// 主线程操作 (UI 相关)
Function("setBrightness") { (level: Double) in
  DispatchQueue.main.async {
    UIScreen.main.brightness = CGFloat(level)
  }
}

// 后台线程 (I/O 操作)
AsyncFunction("compressImage") { (uri: String, quality: Double) -> String in
  return try await withCheckedThrowingContinuation { continuation in
    DispatchQueue.global(qos: .userInitiated).async {
      do {
        let compressedUri = try ImageCompressor.compress(uri: uri, quality: quality)
        continuation.resume(returning: compressedUri)
      } catch {
        continuation.resume(throwing: error)
      }
    }
  }
}

// 专用串行队列 (避免竞态条件)
private let serialQueue = DispatchQueue(label: "com.yourapp.serial")

Function("incrementCounter") { () -> Int in
  serialQueue.sync {
    var counter = UserDefaults.standard.integer(forKey: "counter")
    counter += 1
    UserDefaults.standard.set(counter, forKey: "counter")
    return counter
  }
}
```

---

## 附录 I: 原生模块调试高级技巧

### I.1 iOS 调试

```objc
// 在原生模块中添加断点
// 使用 NSLog 输出调试信息
RCT_EXPORT_METHOD(debugMethod:(NSString *)param) {
  NSLog(@"[DEBUG] 收到参数: %@", param);
  
  // 使用 Xcode 的 Debug Navigator 查看内存和 CPU
  // 使用 Instruments 进行性能分析
  // - Time Profiler: 查找耗时操作
  // - Allocations: 查找内存泄漏
  // - Leaks: 自动检测泄漏
}

// 条件断点
#if DEBUG
  #define DLog(fmt, ...) NSLog((@"%s [Line %d] " fmt), __PRETTY_FUNCTION__, __LINE__, ##__VA_ARGS__)
#else
  #define DLog(...)
#endif
```

### I.2 Android 调试

```kotlin
// 使用 Timber 进行日志记录
class MyModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MyModule")
    
    Function("debugMethod") { param: String ->
      Timber.d("收到参数: $param")
      Timber.v("详细日志: ${BuildConfig.DEBUG}")
      
      // Android Studio Profiler
      // - CPU Profiler: 查找耗时方法
      // - Memory Profiler: 分析内存分配
      // - Network Profiler: 监控网络请求
    }
  }
}

// build.gradle 配置
android {
  buildTypes {
    debug {
      debuggable true
      minifyEnabled false
    }
    release {
      debuggable false
      minifyEnabled true
      proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
  }
}
```

---

## 附录 J: 原生模块常见崩溃原因与预防

| 崩溃类型 | 原因 | 预防措施 | 检测方法 |
|---------|------|---------|---------|
| EXC_BAD_ACCESS | 访问已释放对象 | 使用 weak self / weak reference | Zombie Objects |
| NullPointerException | Kotlin 空指针 | 使用 ?. 安全调用 !! 强制解包 | Lint 检查 |
| IllegalStateException | 状态异常 | 状态机验证 | 单元测试 |
| ANR | 主线程阻塞 | 耗时操作放后台 | StrictMode |
| OOM | 内存不足 | 图片压缩 / 缓存限制 | Memory Profiler |
| JNI Error | C++ 层异常 | 异常边界处理 | AddressSanitizer |
| Deadlock | 锁竞争 | 避免嵌套锁 / 超时 | Thread Sanitizer |
| Signal 11 | Segmentation Fault | 指针校验 | Crashlytics |

---

## 附录 K: Expo Modules API 完整类型映射表

| TypeScript 类型 | Swift 类型 | Kotlin 类型 | 说明 |
|---------------|-----------|------------|------|
| `string` | `String` | `String` | 字符串 |
| `number` | `Double` / `Int` | `Double` / `Int` | 数字 |
| `boolean` | `Bool` | `Boolean` | 布尔值 |
| `string[]` | `[String]` | `List<String>` | 字符串数组 |
| `number[]` | `[Double]` | `List<Double>` | 数字数组 |
| `Record<string, T>` | `[String: T]` | `Map<String, T>` | 字典 |
| `Date` | `Date` | `Date` | 日期 |
| `URL` | `URL` | `Uri` | URL |
| `Promise<T>` | `async -> T` | `suspend -> T` | 异步 |
| `() => void` | `@escaping () -> Void` | `() -> Unit` | 回调 |
| `ViewProps` | `ExpoView` | `ExpoView` | 视图 |

---

## 附录 L: 原生模块开发完整检查清单

### 开发前
- [ ] 确认 Expo SDK 版本兼容性
- [ ] 检查是否有现有模块可满足需求
- [ ] 确定平台范围 (iOS / Android / Web)
- [ ] 设计 TypeScript 类型接口

### 开发中
- [ ] 实现 TypeScript Spec
- [ ] iOS Swift 实现
- [ ] Android Kotlin 实现
- [ ] 错误处理与边界情况
- [ ] 单元测试编写

### 发布前
- [ ] 文档编写 (README + API 文档)
- [ ] 示例代码提供
- [ ] TypeScript 类型导出
- [ ] 版本号遵循 SemVer
- [ ] CHANGELOG 更新

### 发布后
- [ ] NPM 包发布
- [ ] GitHub Release 创建
- [ ] 社区通知 (Twitter / Discord)
- [ ] 问题跟踪配置


---

## 附录 M: 原生模块安全最佳实践

```swift
// 安全的模块实现示例
public class SecureModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SecureModule")

    // 输入验证
    Function("processUserInput") { (input: String) -> String in
      // 1. 长度限制
      guard input.count < 10000 else {
        throw SecureError.inputTooLong
      }

      // 2. 特殊字符过滤
      let sanitized = input
        .replacingOccurrences(of: "<", with: "&lt;")
        .replacingOccurrences(of: ">", with: "&gt;")

      // 3. 返回处理后的数据
      return sanitized
    }

    // 权限检查
    AsyncFunction("accessSensitiveData") { () -> String in
      // 检查生物识别认证状态
      let context = LAContext()
      var error: NSError?
      guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
        throw SecureError.authenticationRequired
      }

      let success = try await context.evaluatePolicy(
        .deviceOwnerAuthentication,
        localizedReason: "访问敏感数据需要验证身份"
      )

      guard success else {
        throw SecureError.authenticationFailed
      }

      return "sensitive_data"
    }

    // 安全的文件操作
    AsyncFunction("saveFile") { (filename: String, content: String) -> Bool in
      // 防止目录遍历攻击
      let sanitizedFilename = filename
        .replacingOccurrences(of: "../", with: "")
        .replacingOccurrences(of: "..", with: "")

      // 限制文件路径在沙盒内
      let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
      let fileURL = documentsPath.appendingPathComponent(sanitizedFilename)

      // 确保路径在沙盒内
      guard fileURL.path.hasPrefix(documentsPath.path) else {
        throw SecureError.invalidPath
      }

      try content.write(to: fileURL, atomically: true, encoding: .utf8)
      return true
    }
  }
}

enum SecureError: Error {
  case inputTooLong
  case authenticationRequired
  case authenticationFailed
  case invalidPath
}
```

---

## 附录 N: 原生模块版本兼容性矩阵

| Expo SDK | React Native | iOS Target | Android Target | New Arch | 说明 |
|---------|-------------|-----------|---------------|---------|------|
| 49 | 0.72 | 13.0 | API 21 | 可选 | 旧架构为主 |
| 50 | 0.73 | 13.4 | API 23 | 可选 | 新架构实验性 |
| 51 | 0.74 | 13.4 | API 23 | 可选 | 新架构改进 |
| 52 | 0.76 | 15.1 | API 24 | 默认 | 新架构默认 |
| 53 | 0.77 | 15.1 | API 24 | 默认 | 并发渲染 |

---

## 附录 O: 完整的原生模块调试控制台

```typescript
// src/modules/DebugConsole.ts
import { requireNativeModule } from 'expo-modules-core';

interface DebugModule {
  getMemoryUsage(): Promise<{
    used: number;
    total: number;
    free: number;
  }>;
  getCPUUsage(): Promise<number>;
  getBatteryLevel(): number;
  getThermalState(): string;
  triggerGC(): void;
  getThreadInfo(): Promise<Array<{
    name: string;
    id: number;
    priority: number;
  }>>;
}

const DebugNative = requireNativeModule<DebugModule>('DebugConsole');

export const DebugConsole = {
  async printSystemStats() {
    const [memory, cpu, battery, thermal] = await Promise.all([
      DebugNative.getMemoryUsage(),
      DebugNative.getCPUUsage(),
      Promise.resolve(DebugNative.getBatteryLevel()),
      Promise.resolve(DebugNative.getThermalState()),
    ]);

    console.log('=== System Stats ===');
    console.log(`Memory: ${(memory.used / 1024 / 1024).toFixed(1)}MB / ${(memory.total / 1024 / 1024).toFixed(1)}MB`);
    console.log(`CPU: ${cpu.toFixed(1)}%`);
    console.log(`Battery: ${(battery * 100).toFixed(0)}%`);
    console.log(`Thermal: ${thermal}`);
  },

  triggerGarbageCollection() {
    DebugNative.triggerGC();
  },
};
```
