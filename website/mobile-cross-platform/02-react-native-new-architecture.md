# 02. React Native 新架构

> Fabric 渲染层、TurboModules 同步调用、JSI 引擎直通——React Native 的性能革命。

---

## 旧架构瓶颈

传统 React Native 通过 **Bridge** 通信：

```
JS Thread ←→ Bridge (异步 JSON) ←→ Native Thread
```

问题：

- 所有通信异步化，无法直接同步访问原生对象
- JSON 序列化/反序列化开销大
- 线程切换导致 UI 掉帧

---

## 新架构三件套

### 1. JSI (JavaScript Interface)

C++ 共享层，让 JS 引擎可以直接持有 Native 对象的引用：

```cpp
// C++ HostObject 暴露给 JS
class MyHostObject : public jsi::HostObject {
  jsi::Value get(jsi::Runtime& rt, const jsi::PropNameID& name) override {
    return jsi::String::createFromAscii(rt, "hello from C++");
  }
};
```

JS 侧同步调用：

```typescript
const nativeModule = global.__myNativeModule; // 直接引用
const result = nativeModule.syncMethod();     // 同步调用！
```

### 2. Fabric 渲染层

取代旧的 Yoga + ShadowTree 异步渲染：

- **C++ Shadow Tree**：跨平台统一的布局计算
- **优先级调度**：高优先级 UI 更新（如手势）优先执行
- **同步布局**：减少 UI 的异步闪烁

```mermaid
flowchart LR
    JS[JS Thread] -->|JSI| Cxx[C++ Fabric]
    Cxx --> Yoga[Yoga Layout]
    Yoga --> Native[Native Views]
```

### 3. TurboModules

按需加载的原生模块，支持同步方法：

```typescript
// NativeModule 类型定义 (TypeScript)
import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';

export interface Spec extends TurboModule {
  readonly getConstants: () => { APP_VERSION: string };
  add(a: number, b: number): Promise<number>;
  // 同步方法
  getDeviceIdSync(): string;
}
```

---

## Hermes 引擎

React Native 默认的 JS 引擎，专为移动端优化：

| 特性 | 说明 |
|------|------|
| AOT 预编译 | 发布时编译为字节码，减少启动解析时间 |
| 内存优化 | 更高效的垃圾回收，降低 OOM |
| 调试支持 | 直接支持 Chrome DevTools |

启用 Hermes（`android/app/build.gradle`）：

```groovy
project.ext.react = [
    enableHermes: true
]
```

---

## 迁移检查清单

从旧架构迁移到新架构：

- [ ] 升级 React Native ≥ 0.73（新架构默认启用）
- [ ] 检查第三方库是否兼容 Fabric（查看 `codegenConfig`）
- [ ] 将原生模块迁移到 TurboModule 规范
- [ ] 验证 `ViewManager` 是否支持新渲染器
- [ ] 测试列表性能（`FlatList` + `FlashList`）

---

## 关键指标对比

| 场景 | 旧架构 | 新架构 | 提升 |
|------|--------|--------|------|
| 启动时间 (TTR) | 2.5s | 1.8s | 28% |
| 大列表滚动 FPS | 45 | 58 | 29% |
| 内存峰值 | 180MB | 145MB | 19% |
| 同步原生调用 | 不支持 | 支持 | 架构级 |
