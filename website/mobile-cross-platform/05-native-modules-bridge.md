# 05. 原生模块桥接

> 突破 JavaScript 边界：TurboModule、NativeModule 与 Swift/Kotlin 的互操作。

---

## 三种桥接方式

| 方式 | 复杂度 | 性能 | 适用场景 |
|------|--------|------|----------|
| Native Module (旧) | 中 | 异步 JSON | 兼容旧代码 |
| TurboModule (新) | 高 | 同步 + JSI | 新架构项目 |
| Expo Module API | 低 | 自动桥接 | Expo 项目 |

---

## TurboModule 实战

### 1. 定义 Spec (TypeScript)

```typescript
// specs/NativeCalculator.ts
import type { TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  add(a: number, b: number): number;  // 同步！
  multiplyAsync(a: number, b: number): Promise<number>;
}
```

### 2. iOS 实现 (Swift)

```swift
// ios/NativeCalculator.swift
import Foundation

@objc(NativeCalculator)
class NativeCalculator: NSObject {
  @objc
  func add(_ a: NSNumber, b: NSNumber) -> NSNumber {
    return NSNumber(value: a.doubleValue + b.doubleValue)
  }

  @objc
  func multiplyAsync(_ a: NSNumber, b: NSNumber, resolve: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let result = a.doubleValue * b.doubleValue
    resolve(result)
  }
}
```

### 3. Android 实现 (Kotlin)

```kotlin
// android/app/src/main/java/com/example/NativeCalculator.kt
package com.example

import com.facebook.react.bridge.*

class NativeCalculator(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "NativeCalculator"

  @ReactMethod
  fun add(a: Double, b: Double, promise: Promise) {
    promise.resolve(a + b)
  }

  @ReactMethod
  fun multiplyAsync(a: Double, b: Double, promise: Promise) {
    promise.resolve(a * b)
  }
}
```

### 4. 注册模块

```kotlin
// android/app/src/main/java/com/example/MyAppPackage.kt
class MyAppPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(NativeCalculator(reactContext))
  }
  // ... createViewManagers
}
```

### 5. JS 调用

```typescript
import { NativeModules } from 'react-native';
const { NativeCalculator } = NativeModules;

const sum = NativeCalculator.add(2, 3); // 同步调用
const product = await NativeCalculator.multiplyAsync(4, 5);
```

---

## Expo Modules API

Expo 提供的现代化模块开发方式，无需编写 Objective-C/Java 胶水代码：

### Swift Module

```swift
import ExpoModulesCore

public class MyModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MyModule")

    Function("greet") { (name: String) in
      return "Hello, \(name)!"
    }

    AsyncFunction("fetchData") { (url: String) in
      // async/await 原生支持
      let data = try await URLSession.shared.data(from: URL(string: url)!).0
      return String(data: data, encoding: .utf8)
    }
  }
}
```

---

## 类型安全最佳实践

为原生模块编写 TypeScript 声明：

```typescript
// types/native-modules.d.ts
declare module 'react-native' {
  interface NativeModulesStatic {
    NativeCalculator: {
      add(a: number, b: number): number;
      multiplyAsync(a: number, b: number): Promise<number>;
    };
  }
}
```

或使用 Codegen（新架构）：

```typescript
// NativeCalculator.ts (Codegen 入口)
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  add(a: number, b: number): number;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeCalculator');
```
