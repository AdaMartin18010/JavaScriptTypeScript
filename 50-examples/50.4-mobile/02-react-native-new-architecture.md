# 02 - React Native 新架构深度解析

> **版本信息**: React Native 0.76+ (New Architecture Default) | Fabric Renderer | TurboModules | JSI
> **目标读者**: 希望深入理解 RN 底层原理、进行性能调优或原生模块开发的高级开发者
> **阅读时长**: 约 50 分钟

---

## 目录

1. [旧架构的局限性](#一旧架构的局限性)
2. [新架构核心组件](#二新架构核心组件)
3. [JSI (JavaScript Interface) 详解](#三jsi-javascript-interface-详解)
4. [Fabric 渲染器](#四fabric-渲染器)
5. [TurboModules](#五turbomodules)
6. [新架构性能对比](#六新架构性能对比)
7. [从旧架构迁移](#七从旧架构迁移)
8. [新架构下调试与排错](#八新架构下调试与排错)
9. [C++ TurboModules 开发](#九c-turbomodules-开发)
10. [2026 年展望](#十2026-年展望)

---

## 一、旧架构的局限性

### 1.1 Bridge 架构的问题

React Native 0.68 之前的版本采用 **Bridge 架构**，JavaScript 线程与原生线程通过一个异步 JSON 序列化桥进行通信。这种设计在 2015 年是革命性的，但随着应用复杂度增长，其瓶颈日益明显：

| 问题维度 | 具体表现 | 影响 |
|---------|---------|------|
| **序列化开销** | 所有数据通过 JSON 字符串传递 | 大数据量传输时延迟显著 |
| **异步通信** | 无法同步调用原生 API | 手势响应、动画帧率受限 |
| **单线程瓶颈** | JS 线程同时处理逻辑和布局 | 复杂计算导致 UI 掉帧 |
| **类型安全缺失** | Bridge 通信无编译期类型检查 | 运行时错误难以定位 |
| **启动时间** | 需初始化 Bridge 和加载 Bundle | TTI (Time to Interactive) 较长 |

### 1.2 旧架构通信流程

```
┌──────────────┐     JSON String      ┌──────────────┐
│   JS Thread  │ ◄──────────────────► │ Native Thread│
│              │   (Async, Batch)     │              │
│  - React     │                      │  - UIView    │
│  - Business  │                      │  - Android   │
│    Logic     │                      │    View      │
└──────────────┘                      └──────────────┘
       │                                     │
       │         Shadow Thread               │
       │         (Layout, Yoga)              │
       └──────────────┬──────────────────────┘
                      │
                      ▼
              ┌──────────────┐
              │   Yoga Node  │
              │   (C++)      │
              └──────────────┘
```

**核心痛点**: 每次 JS 与 Native 通信都需要将对象序列化为 JSON，传递后再反序列化。对于高频操作（如手势、滚动、动画），这种开销累积显著。

---

## 二、新架构核心组件

React Native 0.68 引入新架构，并在 **0.76 版本默认启用**。新架构由三大支柱构成：

### 2.1 新架构组件总览

| 组件 | 职责 | 替代对象 | 核心技术 |
|-----|------|---------|---------|
| **JSI** | JS 引擎与 C++ 的通用接口 | Bridge | C++ Host Objects |
| **Fabric** | 新渲染器 | UI Manager | C++ Shadow Tree |
| **TurboModules** | 类型安全的原生模块 | NativeModules | C++ Codegen |
| **Codegen** | 自动生成类型绑定 | 手动桥接 | TypeScript Specs |

### 2.2 新架构通信流程

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native 0.76+                       │
│                                                             │
│  ┌─────────────┐      JSI (Host Objects)      ┌──────────┐ │
│  │  JS Engine  │ ◄───────────────────────────► │  C++ Core │ │
│  │  (Hermes)   │    Direct Memory Reference   │           │ │
│  │             │    No Serialization          │  - Fabric │ │
│  │  - React    │    Synchronous Calls         │  - Turbo  │ │
│  │  - Logic    │                              │    Modules│ │
│  └─────────────┘                              └─────┬─────┘ │
│                                                     │       │
│                           ┌─────────────────────────┘       │
│                           │                                 │
│                           ▼                                 │
│                    ┌──────────────┐                         │
│                    │  Platform UI │                         │
│                    │  (iOS/Android)│                        │
│                    └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

**核心改进**: JSI 允许 JavaScript 持有对 C++ Host Objects 的引用，实现直接内存访问和同步调用，彻底消除了 JSON 序列化开销。

---

## 三、JSI (JavaScript Interface) 详解

### 3.1 JSI 核心概念

JSI 是一个通用的 C++ API 层，抽象了 JavaScript 引擎的差异（Hermes、JSC、V8）。它不依赖于特定的 JS 引擎，为 Fabric 和 TurboModules 提供了底层支撑。

```cpp
// JSI 核心类示意 (简化版)
namespace facebook::jsi {
  class Runtime {
    // JS 运行时抽象
    virtual Value evaluateJavaScript(...) = 0;
    virtual Object global() = 0;
  };

  class Object {
    // JS 对象在 C++ 中的代理
    Value getProperty(Runtime&, const PropNameID& name);
    void setProperty(Runtime&, const PropNameID& name, const Value& value);
  };

  class HostObject {
    // C++ 对象暴露给 JS 的基类
    virtual Value get(Runtime&, const PropNameID& name) = 0;
    virtual void set(Runtime&, const PropNameID& name, const Value& value) = 0;
  };
}
```

### 3.2 JSI 同步调用示例

**C++ 端 (Host Object)**:

```cpp
// cpp/CalculatorHostObject.h
#pragma once
#include <jsi/jsi.h>

using namespace facebook::jsi;

class CalculatorHostObject : public HostObject {
public:
  Value get(Runtime& rt, const PropNameID& name) override {
    auto propName = name.utf8(rt);
    
    if (propName == "add") {
      return Function::createFromHostFunction(
        rt,
        PropNameID::forAscii(rt, "add"),
        2,
        [](Runtime& rt, const Value& thisValue, const Value* args, size_t count) -> Value {
          double a = args[0].asNumber();
          double b = args[1].asNumber();
          return Value(a + b);
        }
      );
    }
    
    if (propName == "multiply") {
      return Function::createFromHostFunction(
        rt,
        PropNameID::forAscii(rt, "multiply"),
        2,
        [](Runtime& rt, const Value& thisValue, const Value* args, size_t count) -> Value {
          double a = args[0].asNumber();
          double b = args[1].asNumber();
          return Value(a * b);
        }
      );
    }
    
    return Value::undefined();
  }

  void set(Runtime&, const PropNameID&, const Value&) override {}
};
```

**注册到全局对象**:

```cpp
// cpp/JSIExecutor.cpp
void installCalculator(Runtime& runtime) {
  auto calculator = Object::createFromHostObject(
    runtime,
    std::make_shared<CalculatorHostObject>()
  );
  runtime.global().setProperty(runtime, "nativeCalculator", std::move(calculator));
}
```

**JavaScript 调用**:

```typescript
// 在 JS 中直接同步调用 C++ 方法
const result = nativeCalculator.add(40, 2); // 42
const product = nativeCalculator.multiply(21, 2); // 42

// 这是同步调用！无需 await，无 JSON 序列化
console.log(typeof result); // "number"
```

### 3.3 JSI 与 Bridge 性能对比

| 操作类型 | Bridge (旧架构) | JSI (新架构) | 提升倍数 |
|---------|----------------|-------------|---------|
| 简单函数调用 | ~2-5ms | ~0.01ms | **200-500x** |
| 传递 1MB 对象 | ~50-100ms | ~0.5ms | **100-200x** |
| 读取原生常量 | ~1-2ms | ~0.001ms | **1000-2000x** |
| 批量数组操作 | ~20-50ms | ~0.1ms | **200-500x** |

---

## 四、Fabric 渲染器

### 4.1 Fabric 架构设计

Fabric 是 React Native 的新渲染层，替代了旧的 UI Manager。它完全用 C++ 实现，提供了跨平台统一的 Shadow Tree 管理。

```
┌─────────────────────────────────────────────────────────────┐
│                      Fabric 渲染管线                         │
│                                                             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌───────┐ │
│  │  React   │───►│  C++     │───►│  Diff    │───►│ Mount │ │
│  │  Reconciler    │  Shadow  │    │  Algorithm      │ Manager│ │
│  │          │    │  Tree    │    │          │    │       │ │
│  └──────────┘    └──────────┘    └──────────┘    └───┬───┘ │
│                                                      │     │
│                           ┌──────────────────────────┘     │
│                           ▼                                │
│                    ┌──────────────┐                        │
│                    │  Platform    │                        │
│                    │  View Layer  │                        │
│                    └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Fabric 关键改进

| 特性 | 旧架构 UI Manager | 新架构 Fabric | 收益 |
|-----|------------------|--------------|------|
| **线程模型** | JS + Shadow + Main 三线程 | C++ 统一 Shadow Tree | 减少线程切换 |
| **布局计算** | Yoga (JS 桥接调用) | Yoga (直接 C++ 调用) | 布局速度提升 2x |
| **优先级调度** | 无 | 支持 Suspense 优先级 | 交互响应更快 |
| **并发渲染** | 不支持 | 实验性支持 | 未来 React 并发特性 |
| **View Flattening** | 有限 | 自动优化 | 减少视图层级 |
| **事件处理** | 异步冒泡 | 同步优先 + 异步降级 | 手势响应提升 |

### 4.3 Fabric 组件示例

在 Fabric 中，原生组件需要实现 `ViewManager` 接口的 C++ 版本：

```cpp
// cpp/RNTMyComponent.h (Fabric Component)
#pragma once
#include <react/renderer/components/view/ConcreteViewComponentDescriptor.h>
#include <react/renderer/components/view/ViewProps.h>
#include <react/renderer/core/PropsParserContext.h>

namespace facebook::react {

class MyComponentProps final : public ViewProps {
 public:
  MyComponentProps() = default;
  
  MyComponentProps(
    const PropsParserContext& context,
    const MyComponentProps& sourceProps,
    const RawProps& rawProps
  ) : ViewProps(context, sourceProps, rawProps) {
    // 从 JS 传递的 props 解析
    title = convertRawProp(context, rawProps, "title", sourceProps.title, "");
    active = convertRawProp(context, rawProps, "active", sourceProps.active, false);
  }

  std::string title{};
  bool active{false};
};

using MyComponentShadowNode = ConcreteViewShadowNode<
  MyComponentProps,
  ViewEventEmitter,
  ViewShadowNode
>;

} // namespace facebook::react
```

### 4.4 启用 Fabric 渲染器

Expo SDK 52+ 已默认启用新架构，但手动检查配置：

```json
// app.json
{
  "expo": {
    "ios": {
      "newArchEnabled": true
    },
    "android": {
      "newArchEnabled": true
    }
  }
}
```

```bash
# 验证当前是否使用新架构
npx expo config --type introspect | grep newArch

# 在运行时的日志中查看
# 新架构启用时，Metro 日志会显示:
# "Running with Fabric..."
```

---

## 五、TurboModules

### 5.1 TurboModules 设计目标

TurboModules 是 NativeModules 的现代化替代方案，核心改进：

1. **懒加载**: 模块在首次调用时才初始化，显著减少启动时间
2. **类型安全**: 通过 TypeScript Spec 自动生成 C++/Java/Objective-C 绑定
3. **同步调用**: 通过 JSI 支持同步方法调用
4. **C++ 共享**: 跨平台业务逻辑可写一次，在 iOS/Android 共享

### 5.2 TurboModule 开发流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────┐
│ TypeScript  │────►│  Codegen    │────►│  Generated      │
│ Spec (.ts)  │     │  (编译时)    │     │  Bindings       │
└─────────────┘     └─────────────┘     └────────┬────────┘
                                                  │
                       ┌──────────────────────────┼──────────┐
                       ▼                          ▼          ▼
                ┌─────────────┐            ┌──────────┐ ┌──────────┐
                │   C++ Impl  │            │ iOS Impl │ │ Android  │
                │  (Shared)   │            │ (Obj-C++)│ │  (JNI)   │
                └─────────────┘            └──────────┘ └──────────┘
```

### 5.3 TypeScript Spec 定义

```typescript
// specs/NativeCalculator.ts
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // 同步方法
  add(a: number, b: number): number;
  multiply(a: number, b: number): number;
  
  // 异步方法 (Promise)
  complexCalculation(input: number): Promise<number>;
  
  // 常量导出
  readonly getConstants: () => {
    PI: number;
    E: number;
    VERSION: string;
  };
  
  // 事件发射器 (通过 RCTEventEmitter)
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.get<Spec>('NativeCalculator') as Spec | null;
```

### 5.4 iOS TurboModule 实现 (Objective-C++)

```objc
// ios/NativeCalculator.mm
#import "NativeCalculator.h"
#import <React/RCTBridge+Private.h>
#import <jsi/jsi.h>

@interface NativeCalculator ()
@end

@implementation NativeCalculator

RCT_EXPORT_MODULE(NativeCalculator)

// 自动生成的协议方法
- (NSNumber *)add:(double)a b:(double)b {
  return @(a + b);
}

- (NSNumber *)multiply:(double)a b:(double)b {
  return @(a * b);
}

- (void)complexCalculation:(double)input resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    // 模拟复杂计算
    double result = sqrt(input) * M_PI;
    dispatch_async(dispatch_get_main_queue(), ^{
      resolve(@(result));
    });
  });
}

- (NSDictionary *)getConstants {
  return @{
    @"PI": @(M_PI),
    @"E": @(M_E),
    @"VERSION": @"1.0.0"
  };
}

// 支持 JSI 直接绑定 (高级用法)
+ (BOOL)requiresMainQueueSetup {
  return NO;
}

@end
```

### 5.5 Android TurboModule 实现 (Kotlin + JNI)

```kotlin
// android/app/src/main/java/com/example/NativeCalculatorModule.kt
package com.example

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import kotlin.math.sqrt

class NativeCalculatorModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "NativeCalculator"

  override fun getConstants(): WritableMap {
    return Arguments.createMap().apply {
      putDouble("PI", Math.PI)
      putDouble("E", Math.E)
      putString("VERSION", "1.0.0")
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun add(a: Double, b: Double): Double {
    return a + b
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  fun multiply(a: Double, b: Double): Double {
    return a * b
  }

  @ReactMethod
  fun complexCalculation(input: Double, promise: Promise) {
    Thread {
      val result = sqrt(input) * Math.PI
      promise.resolve(result)
    }.start()
  }
}
```

### 5.6 JavaScript 调用方式

```typescript
// src/modules/Calculator.ts
import NativeCalculator from '../../specs/NativeCalculator';

export class Calculator {
  private static getModule() {
    if (!NativeCalculator) {
      throw new Error('NativeCalculator TurboModule is not available');
    }
    return NativeCalculator;
  }

  static add(a: number, b: number): number {
    return this.getModule().add(a, b);
  }

  static multiply(a: number, b: number): number {
    return this.getModule().multiply(a, b);
  }

  static async complexCalculation(input: number): Promise<number> {
    return this.getModule().complexCalculation(input);
  }

  static getConstants() {
    return this.getModule().getConstants();
  }
}

// 使用示例
import { Calculator } from './modules/Calculator';

// 同步调用 - 这是新架构的关键优势！
const sum = Calculator.add(10, 20); // 30

// 异步调用
const result = await Calculator.complexCalculation(100);

// 获取原生常量
const { PI, VERSION } = Calculator.getConstants();
```

---

## 六、新架构性能对比

### 6.1 基准测试结果

基于 React Native 0.76 + Expo SDK 52 的官方基准测试：

| 指标 | 旧架构 | 新架构 | 提升 |
|-----|--------|--------|------|
| **App 启动时间 (TTI)** | 2.8s | 1.9s | **32% ↓** |
| **首屏渲染时间** | 450ms | 280ms | **38% ↓** |
| **FlatList 滚动 FPS** | 52 FPS | 58 FPS | **11% ↑** |
| **大列表内存占用** | 180MB | 135MB | **25% ↓** |
| **手势响应延迟** | 85ms | 28ms | **67% ↓** |
| **Bundle 解析时间** | 1.2s | 0.6s (Hermes) | **50% ↓** |
| **Native Module 调用** | 2-5ms | 0.01ms | **99% ↓** |

### 6.2 内存模型对比

```
旧架构内存模型:
┌─────────────┐
│  JS Heap    │  (Hermes/JSC)
│  ~80MB      │
└──────┬──────┘
       │ JSON Bridge
       ▼
┌─────────────┐
│ Native Heap │  (iOS/Android Objects)
│  ~100MB     │
└─────────────┘

新架构内存模型:
┌─────────────┐
│  JS Heap    │  (Hermes)
│  ~50MB      │
└──────┬──────┘
       │ JSI Direct Ref
       ▼
┌─────────────┐
│  C++ Core   │  (Shared Memory)
│  ~60MB      │
└──────┬──────┘
       │ Platform Binding
       ▼
┌─────────────┐
│ Native Heap │  (Thin Wrappers)
│  ~25MB      │
└─────────────┘
```

---

## 七、从旧架构迁移

### 7.1 迁移决策矩阵

| 场景 | 建议 | 工作量 | 风险 |
|-----|------|--------|------|
| 全新项目 | 直接使用新架构 | 无 | 低 |
| Expo SDK 52+ | 自动启用，验证即可 | 1-2 天 | 低 |
| 裸 RN 0.72+ | 升级至 0.76+ | 3-5 天 | 中 |
| 大量使用第三方库 | 检查兼容性列表 | 1-2 周 | 中 |
| 自定义原生模块 | 重写为 TurboModules | 1-2 周 | 高 |
| 复杂旧项目 (RN < 0.70) | 渐进式迁移 | 1-2 月 | 高 |

### 7.2 第三方库兼容性检查

```bash
# 使用社区工具检查库兼容性
npx @react-native-community/cli doctor

# 手动检查关键库
# 查看库的 package.json 中是否声明:
# "react-native": ">=0.76.0"
# 或查看 Issues 中是否有 "New Architecture" 标签
```

### 7.3 常见迁移问题

**问题 1: 原生组件白屏**

```typescript
// 旧架构的 ViewManager
// ios/MyCustomViewManager.m
// 需要更新为 Fabric ComponentDescriptor

// 解决方案: 使用 Expo Modules API 简化迁移
// 如果库未适配，临时禁用新架构:
// app.json -> ios.newArchEnabled: false (不推荐长期)
```

**问题 2: TurboModules 类型不匹配**

```typescript
// 确保 TypeScript Spec 与实现完全匹配
// 常见问题: 可选参数、Nullable 类型、数组/对象结构

// 修复: 使用 codegen 生成的接口
import type { Spec } from './NativeMyModule';

// 确保实现类实现了 Spec 接口
```

**问题 3: JSI 初始化时序**

```typescript
// TurboModules 懒加载可能导致 JS 调用时模块未就绪
// 解决方案: 使用 TurboModuleRegistry.getEnforcing

import { TurboModuleRegistry } from 'react-native';

// 强制立即加载模块
const MyModule = TurboModuleRegistry.getEnforcing<Spec>('MyModule');
```

### 7.4 渐进式迁移脚本

```bash
#!/bin/bash
# migrate-to-new-arch.sh

echo "Step 1: 升级 React Native"
npx react-native upgrade 0.76.0

echo "Step 2: 升级依赖"
npx expo install --fix

echo "Step 3: 清理构建缓存"
cd ios && pod deintegrate && cd ..
rm -rf android/app/build

echo "Step 4: 重新安装 Pods"
cd ios && RCT_NEW_ARCH_ENABLED=1 pod install && cd ..

echo "Step 5: 运行测试"
npx jest
npx detox test

echo "Step 6: 手动验证"
echo "请检查:"
echo "- 所有第三方库功能正常"
echo "- 原生模块调用无崩溃"
echo "- 性能指标符合预期"
```

---

## 八、新架构下调试与排错

### 8.1 确认新架构已启用

```typescript
// src/utils/architecture.ts
import { NativeModules } from 'react-native';

export function isNewArchitectureEnabled(): boolean {
  // 方式 1: 检查全局变量
  return !!(global as any).nativeFabricUIManager;
}

export function getArchitectureInfo() {
  return {
    isFabric: !!(global as any).nativeFabricUIManager,
    isBridgeless: !!(global as any).RN$Bridgeless,
    jsEngine: global.HermesInternal ? 'Hermes' : 'JSC',
  };
}

// 在 App 启动时打印
console.log('Architecture Info:', getArchitectureInfo());
// 输出: { isFabric: true, isBridgeless: true, jsEngine: 'Hermes' }
```

### 8.2 Fabric 渲染调试

```bash
# 启用 Fabric 调试日志
RCT_NEW_ARCH_ENABLED=1 DEBUG_FABRIC=1 npx expo start

# 使用 React DevTools Profiler
# 1. 启动 Flipper 或 React DevTools
# 2. 选择 "Profiler" 标签
# 3. 记录渲染周期，检查 Commit 阶段耗时
```

### 8.3 TurboModule 调试

```cpp
// 在 C++ 实现中添加日志
#include <android/log.h>

#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, "TurboModule", __VA_ARGS__)

// 在方法中使用
LOGI("add called with a=%f, b=%f", a, b);
```

```objc
// iOS 端日志
#import <React/RCTLog.h>

RCTLogInfo(@"add called with a=%f, b=%f", a, b);
```

### 8.4 常见问题排查

| 问题现象 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `TurboModuleRegistry.get()` 返回 null | 模块未注册或名称不匹配 | 检查 `RCT_EXPORT_MODULE` 名称与 Spec 一致 |
| 同步方法崩溃 | 在主线程执行耗时操作 | 将耗时逻辑移至后台线程 |
| Fabric 组件不显示 | ShadowNode 配置错误 | 检查 `ComponentDescriptor` 注册 |
| Codegen 未生成绑定 | Spec 文件路径或格式错误 | 确保文件在 `package.json` 的 `codegenConfig` 中声明 |
| Android 构建失败 | NDK 版本不匹配 | 使用 `ndkVersion "26.1.10909125"` |

---

## 九、C++ TurboModules 开发

### 9.1 为什么使用 C++ TurboModules

对于跨平台共享的业务逻辑（如加密、图像处理、数据库），C++ TurboModules 可以避免在 iOS 和 Android 分别实现：

| 优势 | 说明 |
|-----|------|
| **代码复用** | 一次编写，双端运行 |
| **性能最优** | 无 JNI/Obj-C 桥接开销 |
| **类型安全** | 完整的 C++ 类型系统 |
| **生态接入** | 可直接使用 C/C++ 库 (OpenCV, SQLite, etc.) |

### 9.2 C++ TurboModule 完整示例

**TypeScript Spec**:

```typescript
// specs/NativeImageProcessor.ts
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  // 同步方法：灰度转换
  toGrayscale(base64Image: string): string;
  
  // 异步方法：高斯模糊
  applyBlur(base64Image: string, radius: number): Promise<string>;
  
  // 获取支持的格式
  getSupportedFormats(): string[];
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeImageProcessor');
```

**C++ 共享实现**:

```cpp
// cpp/ImageProcessor.h
#pragma once
#include <ReactCommon/TurboModule.h>
#include <jsi/jsi.h>
#include <string>
#include <vector>

namespace facebook::react {

class NativeImageProcessor : public TurboModule {
 public:
  NativeImageProcessor(std::shared_ptr<CallInvoker> jsInvoker);

  // 同步方法
  std::string toGrayscale(const std::string& base64Image);
  
  // 异步方法
  void applyBlur(
    const std::string& base64Image,
    double radius,
    std::function<void(std::string)> resolve,
    std::function<void(std::string)> reject
  );
  
  std::vector<std::string> getSupportedFormats();

 private:
  // 实际图像处理逻辑
  std::string decodeBase64(const std::string& base64);
  std::string encodeBase64(const std::vector<uint8_t>& data);
};

} // namespace facebook::react
```

```cpp
// cpp/ImageProcessor.cpp
#include "ImageProcessor.h"
#include <algorithm>
#include <future>

namespace facebook::react {

NativeImageProcessor::NativeImageProcessor(std::shared_ptr<CallInvoker> jsInvoker)
    : TurboModule("NativeImageProcessor", jsInvoker) {}

std::string NativeImageProcessor::toGrayscale(const std::string& base64Image) {
  auto decoded = decodeBase64(base64Image);
  
  // 简化的灰度转换 (假设 RGBA)
  for (size_t i = 0; i < decoded.size(); i += 4) {
    uint8_t gray = static_cast<uint8_t>(
      decoded[i] * 0.299 +     // R
      decoded[i + 1] * 0.587 + // G
      decoded[i + 2] * 0.114   // B
    );
    decoded[i] = decoded[i + 1] = decoded[i + 2] = gray;
  }
  
  return encodeBase64(decoded);
}

void NativeImageProcessor::applyBlur(
    const std::string& base64Image,
    double radius,
    std::function<void(std::string)> resolve,
    std::function<void(std::string)> reject) {
  
  std::async(std::launch::async, [this, base64Image, radius, resolve, reject]() {
    try {
      auto decoded = decodeBase64(base64Image);
      
      // 简化的盒式模糊算法
      auto blurred = boxBlur(decoded, static_cast<int>(radius));
      
      resolve(encodeBase64(blurred));
    } catch (const std::exception& e) {
      reject(std::string("Blur failed: ") + e.what());
    }
  });
}

std::vector<std::string> NativeImageProcessor::getSupportedFormats() {
  return {"JPEG", "PNG", "WEBP", "HEIC"};
}

} // namespace facebook::react
```

**JavaScript 绑定**:

```typescript
// src/modules/ImageProcessor.ts
import NativeImageProcessor from '../../specs/NativeImageProcessor';

export class ImageProcessor {
  static toGrayscale(base64Image: string): string {
    return NativeImageProcessor.toGrayscale(base64Image);
  }

  static applyBlur(base64Image: string, radius: number): Promise<string> {
    return NativeImageProcessor.applyBlur(base64Image, radius);
  }

  static getSupportedFormats(): string[] {
    return NativeImageProcessor.getSupportedFormats();
  }
}
```

---

## 十、2026 年展望

### 10.1 React Native 路线图

| 特性 | 预计版本 | 状态 |
|-----|---------|------|
| **Bridgeless 默认** | 0.76 (已发布) | ✅ 可用 |
| **Concurrent React 完整支持** | 0.77-0.78 | 🧪 实验性 |
| **Suspense for Native** | 0.78+ | 🔮 规划中 |
| **Web 支持稳定化** | Expo SDK 53+ | 🧪 进行中 |
| **React Server Components** | 0.79+ | 🔮 调研中 |
| **WASM 支持** | 未来 | 🔮 长期目标 |

### 10.2 新架构最佳实践总结

1. **始终使用 Hermes**: Hermes 与新架构深度集成，提供字节码预编译和更好的内存管理
2. **懒加载 TurboModules**: 利用 TurboModules 的懒加载特性，将非核心模块延迟初始化
3. **避免同步阻塞**: 即使 JSI 支持同步调用，也应避免在主线程执行耗时操作
4. **使用 Fabric 友好的组件**: 优先选择已适配 Fabric 的第三方库
5. **监控性能指标**: 使用 Flashlight 等工具持续跟踪 TTI、FPS、内存使用
6. **参与社区**: 新架构仍在快速迭代，及时关注 React Native 官方博客和 RFC

### 10.3 决策树：何时使用 C++ TurboModules

```
是否需要原生模块?
    │
    ├── 否 → 使用纯 JS/TS 实现
    │
    └── 是 → 是否跨平台共享逻辑?
              │
              ├── 是 → 性能是否关键?
              │         │
              │         ├── 是 → 使用 C++ TurboModule
              │         │
              │         └── 否 → 使用 Expo Modules API
              │
              └── 否 → 平台特定 UI?
                        │
                        ├── 是 → 平台原生 ViewManager
                        │
                        └── 否 → 平台原生 Module (Java/Obj-C)
```

---

## 总结

React Native 新架构（Fabric + TurboModules + JSI）代表了跨平台框架的重大进化。通过消除 Bridge 的序列化瓶颈、引入 C++ 核心层、实现类型安全的原生模块绑定，新架构在性能、类型安全和开发体验方面都实现了质的飞跃。

Expo SDK 52 默认启用新架构，意味着开发者无需额外配置即可享受这些改进。对于已有项目，建议制定渐进式迁移计划，优先迁移核心路径和高频使用的原生模块。

下一步建议阅读 [03-cross-platform-shared-code.md](./03-cross-platform-shared-code.md)，了解如何在新架构基础上构建跨平台共享的 Monorepo 项目。


---

## 附录 A: 完整的 TurboModule 类型定义与使用

### A.1 TypeScript Spec 完整示例

```typescript
// specs/NativeDatabase.ts
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface DatabaseRecord {
  id: string;
  data: string;
  createdAt: number;
  updatedAt: number;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  descending?: boolean;
}

export interface Spec extends TurboModule {
  // 数据库生命周期
  initializeDatabase(name: string, version: number): void;
  closeDatabase(): void;
  deleteDatabase(name: string): Promise<boolean>;

  // CRUD 操作
  insert(table: string, record: Record<string, string>): Promise<string>;
  update(table: string, id: string, record: Record<string, string>): Promise<number>;
  delete(table: string, id: string): Promise<number>;
  select(table: string, id: string): Promise<DatabaseRecord | null>;
  selectAll(table: string, options?: QueryOptions): Promise<DatabaseRecord[]>;

  // 批量操作
  batchInsert(table: string, records: Record<string, string>[]): Promise<string[]>;
  batchDelete(table: string, ids: string[]): Promise<number>;

  // 事务支持
  beginTransaction(): void;
  commitTransaction(): void;
  rollbackTransaction(): void;

  // 同步查询 (适用于小数据量配置读取)
  getConfigSync(key: string): string | null;
  setConfigSync(key: string, value: string): void;

  // 事件
  addListener(eventName: 'onDatabaseChange'): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeDatabase');
```

### A.2 JavaScript 封装层

```typescript
// src/modules/Database.ts
import NativeDatabase from '../../specs/NativeDatabase';
import { EventEmitter } from 'react-native';

class Database {
  private emitter = new EventEmitter();
  private subscription: any;

  constructor() {
    this.subscription = this.emitter.addListener('onDatabaseChange', (event) => {
      this.listeners.forEach((listener) => listener(event));
    });
  }

  private listeners: Array<(event: any) => void> = [];

  initialize(name: string, version: number = 1) {
    NativeDatabase.initializeDatabase(name, version);
  }

  async insert<T extends Record<string, unknown>>(table: string, record: T): Promise<string> {
    const stringifiedRecord: Record<string, string> = {};
    for (const [key, value] of Object.entries(record)) {
      stringifiedRecord[key] = JSON.stringify(value);
    }
    return NativeDatabase.insert(table, stringifiedRecord);
  }

  async select<T>(table: string, id: string): Promise<T | null> {
    const record = await NativeDatabase.select(table, id);
    if (!record) return null;

    const parsed: Record<string, unknown> = { ...record };
    if (record.data) {
      try {
        Object.assign(parsed, JSON.parse(record.data));
      } catch {
        // data 字段不是 JSON，保持原样
      }
    }
    return parsed as T;
  }

  async selectAll<T>(table: string, options?: { limit?: number; offset?: number }): Promise<T[]> {
    const records = await NativeDatabase.selectAll(table, options);
    return records.map((record) => {
      const parsed: Record<string, unknown> = { ...record };
      if (record.data) {
        try {
          Object.assign(parsed, JSON.parse(record.data));
        } catch {
          // ignore
        }
      }
      return parsed as T;
    });
  }

  async transaction<T>(operations: () => Promise<T>): Promise<T> {
    NativeDatabase.beginTransaction();
    try {
      const result = await operations();
      NativeDatabase.commitTransaction();
      return result;
    } catch (error) {
      NativeDatabase.rollbackTransaction();
      throw error;
    }
  }

  onChange(listener: (event: { table: string; operation: string; id: string }) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  destroy() {
    this.subscription?.remove();
    NativeDatabase.closeDatabase();
  }
}

export const database = new Database();

// 使用示例
interface User {
  id: string;
  name: string;
  email: string;
  age: number;
}

async function userOperations() {
  database.initialize('myapp', 1);

  // 插入
  const userId = await database.insert<User>('users', {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    age: 28,
  });

  // 查询
  const user = await database.select<User>('users', userId);
  console.log(user?.name); // 张三

  // 事务
  await database.transaction(async () => {
    await database.insert('users', { id: '2', name: '李四', email: 'lisi@example.com', age: 30 });
    await database.insert('users', { id: '3', name: '王五', email: 'wangwu@example.com', age: 25 });
  });

  // 查询全部
  const allUsers = await database.selectAll<User>('users', { limit: 10 });
  console.log(allUsers.length); // 3

  // 监听变化
  const unsubscribe = database.onChange((event) => {
    console.log(`Table ${event.table} changed: ${event.operation}`);
  });

  // 清理
  unsubscribe();
  database.destroy();
}
```

---

## 附录 B: 新架构下的 NativeWind 与样式系统

```typescript
// 在新架构中使用 Tailwind CSS (NativeWind v4)
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        secondary: '#5856D6',
        success: '#34C759',
        danger: '#FF3B30',
        warning: '#FF9500',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

// babel.config.js
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: ['nativewind/babel'],
};

// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './src/styles/global.css' });

// 组件中使用
import { View, Text, TouchableOpacity } from 'react-native';

export function StyledButton({ title, onPress, variant = 'primary' }: ButtonProps) {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold text-base';
  const variantStyles = {
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white',
    outline: 'border-2 border-primary text-primary',
    ghost: 'text-primary',
  };

  return (
    <TouchableOpacity onPress={onPress} className={`${baseStyles} ${variantStyles[variant]}`}>
      <Text className={variant === 'primary' || variant === 'secondary' ? 'text-white' : 'text-primary'}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
```

---

## 附录 C: JSI 直接内存操作示例

```cpp
// cpp/SharedBuffer.h
#pragma once
#include <jsi/jsi.h>
#include <vector>
#include <memory>

namespace facebook::jsi {

class SharedBuffer : public HostObject {
 public:
  SharedBuffer(size_t size) : data_(size) {}

  uint8_t* data() { return data_.data(); }
  size_t size() const { return data_.size(); }

  Value get(Runtime& rt, const PropNameID& name) override {
    auto prop = name.utf8(rt);

    if (prop == "length") {
      return Value(static_cast<double>(data_.size()));
    }

    if (prop == "get") {
      return Function::createFromHostFunction(
        rt,
        PropNameID::forAscii(rt, "get"),
        1,
        [this](Runtime& rt, const Value&, const Value* args, size_t count) -> Value {
          if (count < 1) return Value::undefined();
          size_t index = static_cast<size_t>(args[0].asNumber());
          if (index >= data_.size()) return Value::undefined();
          return Value(static_cast<double>(data_[index]));
        }
      );
    }

    if (prop == "set") {
      return Function::createFromHostFunction(
        rt,
        PropNameID::forAscii(rt, "set"),
        2,
        [this](Runtime& rt, const Value&, const Value* args, size_t count) -> Value {
          if (count < 2) return Value::undefined();
          size_t index = static_cast<size_t>(args[0].asNumber());
          uint8_t value = static_cast<uint8_t>(args[1].asNumber());
          if (index < data_.size()) {
            data_[index] = value;
          }
          return Value::undefined();
        }
      );
    }

    if (prop == "toArray") {
      return Function::createFromHostFunction(
        rt,
        PropNameID::forAscii(rt, "toArray"),
        0,
        [this](Runtime& rt, const Value&, const Value*, size_t) -> Value {
          auto array = Array(rt, data_.size());
          for (size_t i = 0; i < data_.size(); i++) {
            array.setValueAtIndex(rt, i, Value(static_cast<double>(data_[i])));
          }
          return array;
        }
      );
    }

    return Value::undefined();
  }

  void set(Runtime&, const PropNameID&, const Value&) override {}

 private:
  std::vector<uint8_t> data_;
};

} // namespace facebook::jsi

// 注册
void installSharedBuffer(Runtime& runtime) {
  auto createBuffer = Function::createFromHostFunction(
    runtime,
    PropNameID::forAscii(runtime, "createSharedBuffer"),
    1,
    [](Runtime& rt, const Value&, const Value* args, size_t count) -> Value {
      size_t size = count > 0 ? static_cast<size_t>(args[0].asNumber()) : 1024;
      auto buffer = std::make_shared<SharedBuffer>(size);
      return Object::createFromHostObject(rt, buffer);
    }
  );
  runtime.global().setProperty(runtime, "createSharedBuffer", std::move(createBuffer));
}

// JavaScript 使用
const buffer = createSharedBuffer(256);
console.log(buffer.length); // 256

for (let i = 0; i < buffer.length; i++) {
  buffer.set(i, i % 256);
}

const array = buffer.toArray();
console.log(array[0], array[1], array[255]); // 0, 1, 255
```

---

## 附录 D: 新架构组件适配检查清单

```typescript
// 检查第三方库是否支持新架构的脚本
// scripts/check-new-arch-support.js
const fs = require('fs');
const path = require('path');

function checkNewArchSupport(packagePath) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(packagePath, 'package.json'), 'utf8'));
  
  const checks = {
    name: packageJson.name,
    hasCodegenConfig: !!packageJson.codegenConfig,
    hasNewArchSupport: false,
    issues: [],
  };

  // 检查 react-native 版本要求
  const rnVersion = packageJson.peerDependencies?.['react-native'] || '';
  if (rnVersion.includes('>=0.70') || rnVersion.includes('>=0.76')) {
    checks.hasNewArchSupport = true;
  }

  // 检查 Fabric 组件
  const hasFabricView = fs.existsSync(path.join(packagePath, 'ios', `${packageJson.name}View.mm`)) ||
                        fs.existsSync(path.join(packagePath, 'android', 'src', 'newarch'));

  if (hasFabricView) {
    checks.hasNewArchSupport = true;
  }

  // 检查 TurboModule
  const hasTurboModule = fs.existsSync(path.join(packagePath, 'ios', `${packageJson.name}Module.mm`));
  if (hasTurboModule) {
    checks.hasNewArchSupport = true;
  }

  return checks;
}

// 扫描 node_modules
const nodeModules = path.join(process.cwd(), 'node_modules');
const packages = fs.readdirSync(nodeModules)
  .filter((name) => name.startsWith('react-native-') || name.startsWith('@react-native'))
  .map((name) => path.join(nodeModules, name))
  .filter((p) => fs.statSync(p).isDirectory());

const results = packages.map(checkNewArchSupport);

console.table(results.map((r) => ({
  Package: r.name,
  'New Arch Support': r.hasNewArchSupport ? '✅' : '❌',
  Codegen: r.hasCodegenConfig ? '✅' : '❌',
})));

const unsupported = results.filter((r) => !r.hasNewArchSupport);
if (unsupported.length > 0) {
  console.warn('\n⚠️  Unsupported packages:', unsupported.map((r) => r.name).join(', '));
}
```

---

## 附录 E: 完整的 New Architecture 迁移实战案例

```typescript
// 案例: 将旧版 Camera 模块迁移到 TurboModule

// 旧版 NativeModules 调用方式
// import { NativeModules } from 'react-native';
// const { CameraModule } = NativeModules;
// CameraModule.capturePhoto((error, photo) => { ... });

// 新版 TurboModule 调用方式
// specs/NativeCamera.ts
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface PhotoResult {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  timestamp: number;
}

export interface CaptureOptions {
  quality?: 'low' | 'medium' | 'high' | 'raw';
  flashMode?: 'auto' | 'on' | 'off' | 'torch';
  focusMode?: 'auto' | 'continuous' | 'manual';
  stabilization?: boolean;
  mirror?: boolean;
}

export interface Spec extends TurboModule {
  // 检查权限 (同步)
  checkPermission(): 'authorized' | 'denied' | 'restricted' | 'notDetermined';

  // 请求权限 (异步)
  requestPermission(): Promise<'authorized' | 'denied'>;

  // 拍照 (异步)
  capturePhoto(options?: CaptureOptions): Promise<PhotoResult>;

  // 开始录制 (异步)
  startRecording(options?: { quality?: string; maxDuration?: number }): Promise<void>;

  // 停止录制 (异步)
  stopRecording(): Promise<{ uri: string; duration: number }>;

  // 获取支持的闪光灯模式 (同步)
  getSupportedFlashModes(): string[];

  // 设置缩放 (同步)
  setZoom(level: number): void;

  // 获取最大缩放 (同步)
  getMaxZoom(): number;

  // 焦点调整 (异步)
  focusAtPoint(x: number, y: number): Promise<boolean>;

  // 事件
  addListener(eventName: 'onReady' | 'onError' | 'onZoomChanged'): void;
  removeListeners(count: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeCamera');

// TypeScript 封装
// src/modules/Camera.ts
import NativeCamera from '../../specs/NativeCamera';

export class Camera {
  static checkPermission() {
    return NativeCamera.checkPermission();
  }

  static async requestPermission() {
    return NativeCamera.requestPermission();
  }

  static async capturePhoto(options?: CaptureOptions): Promise<PhotoResult> {
    const permission = this.checkPermission();
    if (permission !== 'authorized') {
      throw new Error('Camera permission not granted');
    }
    return NativeCamera.capturePhoto(options);
  }

  static async startRecording(options?: { quality?: string; maxDuration?: number }) {
    return NativeCamera.startRecording(options);
  }

  static async stopRecording() {
    return NativeCamera.stopRecording();
  }

  static setZoom(level: number) {
    const maxZoom = NativeCamera.getMaxZoom();
    const clampedLevel = Math.max(1, Math.min(level, maxZoom));
    NativeCamera.setZoom(clampedLevel);
  }

  static getMaxZoom() {
    return NativeCamera.getMaxZoom();
  }

  static async focusAtPoint(x: number, y: number) {
    return NativeCamera.focusAtPoint(x, y);
  }

  static onReady(callback: () => void) {
    const subscription = NativeCamera.addListener('onReady', callback);
    return () => subscription.remove();
  }

  static onError(callback: (error: { code: string; message: string }) => void) {
    const subscription = NativeCamera.addListener('onError', callback);
    return () => subscription.remove();
  }
}

// React Hook 封装
// src/hooks/useCamera.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Camera, PhotoResult } from '@modules/Camera';

interface UseCameraOptions {
  autoRequestPermission?: boolean;
}

interface UseCameraReturn {
  permission: 'authorized' | 'denied' | 'restricted' | 'notDetermined' | null;
  isReady: boolean;
  zoom: number;
  maxZoom: number;
  error: Error | null;
  requestPermission: () => Promise<void>;
  capturePhoto: (options?: CaptureOptions) => Promise<PhotoResult>;
  setZoom: (level: number) => void;
  focusAtPoint: (x: number, y: number) => Promise<void>;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const [permission, setPermission] = useState<UseCameraReturn['permission']>(null);
  const [isReady, setIsReady] = useState(false);
  const [zoom, setZoomState] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1);
  const [error, setError] = useState<Error | null>(null);
  const listenersRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    // 初始化状态
    const currentPermission = Camera.checkPermission();
    setPermission(currentPermission);
    setMaxZoom(Camera.getMaxZoom());

    // 监听事件
    const readyListener = Camera.onReady(() => setIsReady(true));
    const errorListener = Camera.onError((err) => setError(new Error(err.message)));

    listenersRef.current = [readyListener, errorListener];

    // 自动请求权限
    if (options.autoRequestPermission && currentPermission === 'notDetermined') {
      requestPermission();
    }

    return () => {
      listenersRef.current.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Camera.requestPermission();
      setPermission(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Permission request failed'));
    }
  }, []);

  const capturePhoto = useCallback(async (options?: CaptureOptions) => {
    try {
      return await Camera.capturePhoto(options);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Capture failed')));
      throw err;
    }
  }, []);

  const handleSetZoom = useCallback((level: number) => {
    Camera.setZoom(level);
    setZoomState(level);
  }, []);

  const focusAtPoint = useCallback(async (x: number, y: number) => {
    await Camera.focusAtPoint(x, y);
  }, []);

  return {
    permission,
    isReady,
    zoom,
    maxZoom,
    error,
    requestPermission,
    capturePhoto,
    setZoom: handleSetZoom,
    focusAtPoint,
  };
}

// 组件中使用
// src/components/CameraView.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useCamera } from '@hooks/useCamera';

export function CameraView(): JSX.Element {
  const camera = useCamera({ autoRequestPermission: true });

  if (camera.permission === 'denied') {
    return (
      <View style={styles.container}>
        <Text>需要相机权限</Text>
        <TouchableOpacity onPress={camera.requestPermission}>
          <Text style={styles.button}>授权</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCapture = async () => {
    try {
      const photo = await camera.capturePhoto({
        quality: 'high',
        flashMode: 'auto',
      });
      console.log('Photo captured:', photo.uri);
    } catch (error) {
      console.error('Capture failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.preview}>
        {/* Camera preview would go here */}
        <Text>Camera Preview</Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity onPress={() => camera.setZoom(camera.zoom - 0.5)}>
          <Text style={styles.button}>Zoom -</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => camera.setZoom(camera.zoom + 0.5)}>
          <Text style={styles.button}>Zoom +</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.zoomText}>Zoom: {camera.zoom.toFixed(1)}x / {camera.maxZoom.toFixed(1)}x</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  preview: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  button: { color: '#fff', fontSize: 16 },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF3B30',
  },
  zoomText: { color: '#fff', textAlign: 'center', marginBottom: 10 },
});
```

此完整示例展示了从 TypeScript Spec 定义到 JavaScript 封装、React Hook 抽象，最终到 UI 组件的完整 TurboModule 开发流程，体现了新架构下类型安全、性能优化和开发体验的最佳实践。


---

## 附录 F: 新架构下的网络层优化

```typescript
// 利用 JSI 实现的高性能网络请求
// src/modules/NativeNetwork.ts
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

export interface ResponseData {
  status: number;
  headers: Record<string, string>;
  body: string;
  url: string;
}

export interface Spec extends TurboModule {
  request(config: RequestConfig): Promise<ResponseData>;
  requestSync(config: RequestConfig): ResponseData;
  cancelRequest(requestId: string): void;
  setDefaultTimeout(timeout: number): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeNetwork');
```

```cpp
// cpp/NativeNetwork.h
#pragma once
#include <ReactCommon/TurboModule.h>
#include <jsi/jsi.h>
#include <memory>
#include <string>

namespace facebook::react {

class NativeNetwork : public TurboModule {
 public:
  NativeNetwork(std::shared_ptr<CallInvoker> jsInvoker);

  // 异步 HTTP 请求 (使用后台线程)
  void request(
    const std::string& url,
    const std::string& method,
    const std::map<std::string, std::string>& headers,
    const std::string& body,
    int timeout,
    std::function<void(ResponseData)> resolve,
    std::function<void(std::string)> reject
  );

  // 同步 HTTP 请求 (仅用于配置读取等轻量操作)
  ResponseData requestSync(
    const std::string& url,
    const std::string& method,
    const std::map<std::string, std::string>& headers,
    const std::string& body,
    int timeout
  );

 private:
  struct ResponseData {
    int status;
    std::map<std::string, std::string> headers;
    std::string body;
    std::string url;
  };

  int defaultTimeout_ = 30000;
};

} // namespace facebook::react
```

---

## 附录 G: 新架构调试工具链

```bash
# 1. 启用 Fabric 调试日志
RCT_NEW_ARCH_ENABLED=1 DEBUG_FABRIC=1 npx expo start

# 2. 使用 React Native Debugger 附加到 Hermes
# 启动应用后，在 Chrome 中访问 chrome://inspect
# 选择对应的 Hermes 实例

# 3. 使用 Flipper 进行性能分析
# 安装 Flipper Desktop 应用
# 自动检测到运行的 React Native 应用
# 查看组件树、网络请求、数据库状态

# 4. Xcode Instruments 模板
# - Time Profiler: 分析 CPU 使用
# - Allocations: 分析内存分配
# - System Trace: 分析线程活动
# - Network: 分析网络请求

# 5. Android Systrace
adb shell atrace -o /data/local/tmp/trace.html sched gfx view
# 在 Chrome 中打开生成的 HTML 文件
```

---

## 附录 H: 旧架构到新架构迁移检查清单

| 检查项 | 状态 | 说明 |
|-------|------|------|
| **项目配置** | | |
| 升级 React Native 到 0.76+ | ⬜ | `npx react-native upgrade` |
| 升级 Expo SDK 到 52+ | ⬜ | `expo install expo@^52.0.0` |
| 启用 New Architecture | ⬜ | `newArchEnabled: true` |
| **依赖检查** | | |
| 检查第三方库兼容性 | ⬜ | 使用 `npx @react-native-community/cli doctor` |
| 升级 React Navigation 到 v7 | ⬜ | `npm install @react-navigation/native@^7` |
| 升级 Reanimated 到 v3 | ⬜ | 必须适配 Fabric |
| **代码迁移** | | |
| 替换 NativeModules 调用 | ⬜ | 改为 TurboModules |
| 更新原生组件注册 | ⬜ | 使用 Fabric ComponentDescriptor |
| 检查同步调用 | ⬜ | 确保不阻塞主线程 |
| **测试验证** | | |
| 运行单元测试 | ⬜ | `npm test` |
| 运行 E2E 测试 | ⬜ | `detox test` |
| 性能基准测试 | ⬜ | Flashlight |
| **发布** | | |
| 测试生产构建 | ⬜ | `eas build --local` |
| 灰度发布 | ⬜ | EAS Update |
| 监控崩溃率 | ⬜ | Sentry |

---

## 附录 I: 新架构性能基准详细数据

| 测试场景 | 旧架构 (ms) | 新架构 (ms) | 提升 |
|---------|-----------|-----------|------|
| **启动时间** | | | |
| 冷启动 (TTI) | 2800 | 1900 | -32% |
| JS Bundle 加载 | 1200 | 600 | -50% |
| 首帧渲染 | 450 | 280 | -38% |
| **渲染性能** | | | |
| FlatList 滚动 FPS | 52 | 58 | +11% |
| 复杂页面渲染 | 85 | 42 | -51% |
| 动画帧率稳定性 | 87% | 98% | +11% |
| **内存使用** | | | |
| 首屏内存 | 180MB | 135MB | -25% |
| 长列表内存增长 | 15MB/100项 | 8MB/100项 | -47% |
| 后台内存占用 | 95MB | 65MB | -32% |
| **原生调用** | | | |
| 简单方法调用 | 3.2ms | 0.01ms | -99.7% |
| 1KB 数据传输 | 2.1ms | 0.05ms | -97.6% |
| 100KB 数据传输 | 18.5ms | 0.8ms | -95.7% |
| **包体积** | | | |
| iOS IPA 大小 | 45MB | 38MB | -16% |
| Android APK 大小 | 42MB | 35MB | -17% |
| JS Bundle 大小 | 4.8MB | 4.2MB | -13% |

---

## 附录 J: 完整的 JSI HostObject 模板

```cpp
// cpp/TemplateHostObject.h
#pragma once
#include <jsi/jsi.h>
#include <functional>
#include <map>
#include <string>

using namespace facebook::jsi;

class TemplateHostObject : public HostObject {
 public:
  TemplateHostObject() = default;

  // 获取属性
  Value get(Runtime& rt, const PropNameID& name) override {
    auto propName = name.utf8(rt);

    // 导出常量
    if (propName == "VERSION") {
      return Value("1.0.0");
    }

    // 导出同步方法
    if (propName == "syncMethod") {
      return Function::createFromHostFunction(
        rt,
        PropNameID::forAscii(rt, "syncMethod"),
        2, // 参数个数
        [](Runtime& rt, const Value& thisValue, const Value* args, size_t count) -> Value {
          if (count < 2) return Value::undefined();
          
          double a = args[0].asNumber();
          double b = args[1].asNumber();
          
          return Value(a + b);
        }
      );
    }

    // 导出异步方法
    if (propName == "asyncMethod") {
      return Function::createFromHostFunction(
        rt,
        PropNameID::forAscii(rt, "asyncMethod"),
        1,
        [](Runtime& rt, const Value& thisValue, const Value* args, size_t count) -> Value {
          // 创建 Promise
          auto promiseConstructor = rt.global().getPropertyAsFunction(rt, "Promise");
          
          return promiseConstructor.callAsConstructor(
            rt,
            Function::createFromHostFunction(
              rt,
              PropNameID::forAscii(rt, "executor"),
              2,
              [args, count](Runtime& rt, const Value&, const Value* promiseArgs, size_t) -> Value {
                auto resolve = promiseArgs[0].asObject(rt).asFunction(rt);
                
                // 模拟异步操作
                std::string result = count > 0 
                  ? args[0].asString(rt).utf8(rt) + "_processed"
                  : "no_input";
                
                resolve.call(rt, String::createFromUtf8(rt, result));
                return Value::undefined();
              }
            )
          );
        }
      );
    }

    return Value::undefined();
  }

  // 设置属性
  void set(Runtime& rt, const PropNameID& name, const Value& value) override {
    auto propName = name.utf8(rt);
    
    // 存储属性值
    properties_[propName] = value.asString(rt).utf8(rt);
  }

  // 获取属性列表 (用于 Object.keys)
  std::vector<PropNameID> getPropertyNames(Runtime& rt) override {
    std::vector<PropNameID> names;
    names.push_back(PropNameID::forAscii(rt, "VERSION"));
    names.push_back(PropNameID::forAscii(rt, "syncMethod"));
    names.push_back(PropNameID::forAscii(rt, "asyncMethod"));
    return names;
  }

 private:
  std::map<std::string, std::string> properties_;
};

// 注册函数
void installTemplateHostObject(Runtime& runtime) {
  auto obj = Object::createFromHostObject(
    runtime,
    std::make_shared<TemplateHostObject>()
  );
  runtime.global().setProperty(runtime, "TemplateNativeModule", std::move(obj));
}
```

---

## 附录 K: 新架构组件生命周期

```
Fabric 组件完整生命周期:

1. JS 层创建
   JSX ──► React Reconciler ──► Create Node
   
2. Shadow Tree 构建
   JS Thread ──► C++ Shadow Tree ──► Yoga Layout
   
3. Diff 算法
   比较旧树与新树 ──► 生成 Mounting Instructions
   
4. Mounting
   Main Thread ──► 创建 Native Views
   
5. 事件处理
   User Event ──► Native View ──► C++ Event Emitter ──► JS Callback
   
6. 更新
   Props Change ──► Shadow Tree Update ──► Diff ──► Mounting Update
   
7. 卸载
   Component Unmount ──► Shadow Node 删除 ──► Native View 回收
```

---

## 附录 L: React Native 0.76+ 完整变更日志要点

| 变更 | 影响 | 迁移工作 |
|-----|------|---------|
| **Bridgeless 默认** | 不再初始化 Bridge | 移除 Bridge 相关代码 |
| **Fabric 默认** | UI Manager 替换 | 检查原生组件兼容性 |
| **TurboModules 默认** | NativeModules 弃用 | 迁移到 TurboModules |
| **Hermes 强制** | JSC 不再支持 | 确认 Hermes 兼容性 |
| **Android Min SDK 24** | 旧设备不支持 | 更新 minSdkVersion |
| **iOS Min 13.4** | 旧 iOS 不支持 | 更新 deployment target |
| **Kotlin 1.9** | 语法更新 | 升级 Gradle 插件 |
| **Gradle 8.3** | 构建系统更新 | 更新 wrapper |
| **C++ 20** | NDK 26+ | 更新 NDK 版本 |
| **New Event System** | 事件处理变更 | 更新事件监听代码 |
