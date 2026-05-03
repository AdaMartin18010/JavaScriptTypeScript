import os, glob

base = r'e:\_src\JavaScriptTypeScript\website'

# ============================================================
# 1. fundamentals 导读扩充
# ============================================================

# module-system.md → 扩充为完整导读
f = os.path.join(base, 'fundamentals', 'module-system.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 模块系统
description: "JavaScript/TypeScript 模块系统完全指南，覆盖 ESM、CommonJS、循环依赖与互操作"
---

# 模块系统深入解析 (10.4)

> 模块系统是 JavaScript 工程化的基石。从早期的 IIFE 和 AMD，到 Node.js 的 CommonJS，再到 ES2015 的标准化 ESM，JavaScript 的模块化经历了漫长的演进。本导读将系统梳理这一演进脉络，深入解析两种主流模块系统的底层机制，并提供工程实践中的最佳方案。

## 模块系统的演进

```mermaid
timeline
    title JavaScript 模块化演进
    2009 : CommonJS
         : Node.js 诞生
         : require/exports
    2010 : AMD
         : RequireJS
         : define()/异步加载
    2011 : UMD
         : 通用模块定义
         : 兼容 CJS + AMD
    2015 : ESM (ES6)
         : import/export
         : 静态分析
         : 树摇优化
    2020 : ESM 统一
         : Node.js 14+
         : type: module
         : Import Attributes
```

## ESM 与 CommonJS 核心差异

| 特性 | ESM (ES Modules) | CommonJS (CJS) |
|------|-----------------|----------------|
| **语法** | `import` / `export` | `require` / `module.exports` |
| **加载时机** | 编译时静态解析 | 运行时动态加载 |
| **同步/异步** | 异步加载 | 同步加载 |
| **树摇优化** | ✅ 支持 | ❌ 不支持 |
| **循环依赖** | 部分支持 | 有限支持 |
| **顶层 await** | ✅ 支持 | ❌ 不支持 |
| **浏览器支持** | 原生支持 | 需打包工具 |

### 静态解析 vs 动态加载

```mermaid
flowchart LR
    subgraph ESM静态解析
        A[编译阶段] -->|解析import| B[构建依赖图]
        B --> C[树摇优化]
        C --> D[代码分割]
    end
    subgraph CJS动态加载
        E[运行时] -->|执行require| F[同步读取文件]
        F --> G[执行模块代码]
        G --> H[缓存模块]
    end
```

## ESM 核心机制

### 导出模式

```typescript
// 命名导出
export const PI = 3.14159;
export function calculateArea(r: number): number &#123;
  return PI * r * r;
&#125;

// 默认导出
export default class Circle &#123;
  constructor(private radius: number) &#123;&#125;
  area() &#123; return PI * this.radius ** 2; &#125;
&#125;

// 聚合导出（重新导出）
export * from './math-utils';
export &#123; default as Utils &#125; from './utils';
```

### 导入模式

```typescript
// 命名导入
import &#123; PI, calculateArea &#125; from './math';

// 默认导入
import Circle from './circle';

// 命名空间导入
import * as math from './math';

// 动态导入（代码分割）
const heavyModule = await import('./heavy-module');

// 带断言的导入
import json from './data.json' with &#123; type: 'json' &#125;;
```

## CommonJS 核心机制

### 模块包装器

Node.js 在执行 CJS 模块前，会将其包装在一个函数中：

```javascript
(function(exports, require, module, __filename, __dirname) &#123;
  // 模块代码实际在这里执行
  module.exports = &#123; foo: 'bar' &#125;;
&#125;);
```

### require 解析算法

```mermaid
flowchart TD
    A[require'x'] --> B&#123;核心模块?&#125;
    B -->|是| C[加载核心模块]
    B -->|否| D&#123;路径以./或../开头?&#125;
    D -->|是| E[解析为相对路径]
    E --> F[.js / .json / .node]
    D -->|否| G[node_modules查找]
    G --> H[逐层向上查找]
    H --> I[解析package.json main]
    I --> J[加载目标文件]
```

## 循环依赖处理

循环依赖是模块化中最棘手的问题之一。ESM 和 CJS 的处理方式截然不同：

### ESM 的循环依赖

```typescript
// a.ts
import &#123; b &#125; from './b';
console.log('a.ts 执行');
export const a = 'A';

// b.ts
import &#123; a &#125; from './a';
console.log('b.ts 执行');
export const b = 'B';
```

**ESM 的处理方式**：
1. 构建阶段解析所有 `import`，建立依赖图
2. 执行阶段按深度优先顺序执行
3. 遇到循环时，未完成的导出为 TDZ（暂时性死区）
4. 循环依赖的模块只能使用已完成的导出

### CJS 的循环依赖

```javascript
// a.js
const b = require('./b');
console.log('a.js:', b); // 可能得到不完整的对象
module.exports = &#123; name: 'A' &#125;;

// b.js
const a = require('./a');
console.log('b.js:', a); // 得到空对象或部分对象
module.exports = &#123; name: 'B' &#125;;
```

**CJS 的处理方式**：
1. 首次 `require` 时执行模块代码
2. 模块执行前先将空对象放入缓存
3. 循环依赖时返回缓存中的不完整对象
4. 完整对象在模块执行完毕后可用

### 循环依赖最佳实践

```mermaid
flowchart LR
    A[重构提取公共模块] --> B[打破循环]
    C[使用依赖注入] --> B
    D[事件驱动解耦] --> B
    E[将双向依赖改为单向] --> B
```

## ESM/CJS 互操作

### Node.js 中的互操作

```typescript
// ESM 导入 CJS
import cjsModule from './commonjs-module.js'; // 获取 module.exports
import &#123; namedExport &#125; from './commonjs-module.js'; // 获取 exports.xxx（Node 14+）

// CJS 导入 ESM
// CJS 中不能直接 require ESM，需要动态 import
async function loadEsm() &#123;
  const esmModule = await import('./esm-module.mjs');
  return esmModule.default;
&#125;
```

### package.json 配置

```json
&#123;
  "name": "my-lib",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "exports": &#123;
    ".": &#123;
      "import": &#123;
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      &#125;,
      "require": &#123;
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      &#125;
    &#125;
  &#125;
&#125;
```

## 核心文档

| 文档 | 主题 | 文件 |
|------|------|------|
| README | 模块系统总览 | [查看](../../10-fundamentals/10.4-module-system/README.md) |
| ESM/CJS 互操作 | ESM 与 CommonJS 的互操作机制 | [查看](../../10-fundamentals/10.4-module-system/esm-cjs-interop.md) |
| 循环依赖 | 循环依赖的检测与处理 | [查看](../../10-fundamentals/10.4-module-system/circular-dependency.md) |
| 导入属性与 defer | Import Attributes 与 defer 语义 | [查看](../../10-fundamentals/10.4-module-system/import-attributes-defer.md) |

## 代码示例

| 示例 | 主题 | 文件 |
|------|------|------|
| 01 | 模块系统概览 | [查看](../../10-fundamentals/10.4-module-system/code-examples/01-module-system-overview.md) |
| 02 | ESM 深度解析 | [查看](../../10-fundamentals/10.4-module-system/code-examples/02-esm-deep-dive.md) |
| 03 | CommonJS 机制 | [查看](../../10-fundamentals/10.4-module-system/code-examples/03-commonjs-mechanics.md) |
| 04 | CJS/ESM 互操作 | [查看](../../10-fundamentals/10.4-module-system/code-examples/04-cjs-esm-interop.md) |
| 05 | 模块解析 | [查看](../../10-fundamentals/10.4-module-system/code-examples/05-module-resolution.md) |
| 06 | 循环依赖 | [查看](../../10-fundamentals/10.4-module-system/code-examples/06-cyclic-dependencies.md) |

## 交叉引用

- **[执行模型深入解析](./execution-model)** — 模块加载的底层执行机制
- **[对象模型深入解析](./object-model)** — 模块导出值的内存表示
- **[ECMAScript 规范导读](./ecmascript-spec)** — 模块语义的形式化定义
- **[模块系统专题](/module-system/)** — 完整的模块系统深度专题（8篇文档）

---

 [← 返回首页](/)
""")
print(f"module-system: {os.path.getsize(f)} bytes")

# object-model.md → 扩充
f = os.path.join(base, 'fundamentals', 'object-model.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 对象模型
description: "JavaScript/TypeScript 对象模型完全指南，覆盖原型链、Proxy/Reflect、私有字段"
---

# 对象模型深入解析 (10.5)

> JavaScript 是一门基于原型的面向对象语言。与基于类的语言（Java、C++）不同，JavaScript 的对象系统建立在原型委托之上，通过 `Object.create`、`new` 操作符和 `class` 语法糖提供了灵活的面向对象编程能力。

## 对象模型的核心概念

```mermaid
flowchart TB
    subgraph 对象系统层次
        A[Object.prototype] --> B[自定义原型]
        B --> C[实例对象]
        D[构造函数] -->|prototype| B
        D -->|new| C
        C -->|__proto__| B
    end
```

### 对象的本质

在 JavaScript 中，对象本质上是一个**属性的集合**（Property Collection），每个属性都是一个键值对，带有自己的特征（Property Descriptor）：

```javascript
const obj = &#123; name: 'Alice' &#125;;

// 查看属性的完整描述
const descriptor = Object.getOwnPropertyDescriptor(obj, 'name');
console.log(descriptor);
// &#123;
//   value: 'Alice',
//   writable: true,
//   enumerable: true,
//   configurable: true
// &#125;
```

| 特征 | 说明 | 默认值 |
|------|------|--------|
| `value` | 属性值 | `undefined` |
| `writable` | 是否可写 | `true` |
| `enumerable` | 是否可枚举 | `true` |
| `configurable` | 是否可配置 | `true` |
| `get` | 读取器函数 | `undefined` |
| `set` | 写入器函数 | `undefined` |

## 原型链机制

### 原型链查找流程

```mermaid
flowchart LR
    A[dog.speak()] --> B&#123;dog自身有speak?&#125;
    B -->|否| C[Dog.prototype]
    C -->&#123;有speak?&#125; D[Animal.prototype]
    D -->&#123;有speak?&#125; E[Object.prototype]
    E -->|否| F[undefined]
```

```typescript
class Animal &#123;
  constructor(public name: string) &#123;&#125;
  speak() &#123;
    return `$&#123;this.name&#125; makes a sound`;
  &#125;
&#125;

class Dog extends Animal &#123;
  speak() &#123;
    return `$&#123;this.name&#125; barks`;
  &#125;
&#125;

const dog = new Dog('Rex');

// 原型链验证
console.log(dog.__proto__ === Dog.prototype); // true
console.log(Dog.prototype.__proto__ === Animal.prototype); // true
console.log(Animal.prototype.__proto__ === Object.prototype); // true
```

### 原型链的性能影响

| 操作 | 复杂度 | 说明 |
|------|--------|------|
| 属性读取 | O(k) | k = 原型链深度 |
| 属性写入 | O(1) | 直接写入自身 |
| `hasOwnProperty` | O(1) | 不遍历原型链 |
| `in` 操作符 | O(k) | 遍历原型链 |

**优化建议**：频繁访问的属性应放在对象自身，而非原型上。

## Class 语法与原型

`class` 是 JavaScript 中的语法糖，底层仍然是原型系统：

```mermaid
flowchart TB
    subgraph Class语法
        A[class Dog extends Animal] --> B[构造函数函数]
    end
    subgraph 底层原型
        B --> C[Dog.prototype]
        C --> D[Animal.prototype]
        D --> E[Object.prototype]
    end
```

### 私有字段（ES2022）

```typescript
class BankAccount &#123;
  #balance = 0;  // 私有字段

  deposit(amount: number) &#123;
    this.#balance += amount;
  &#125;

  get #formattedBalance() &#123;  // 私有访问器
    return `$&#123;this.#balance.toFixed(2)&#125;`;
  &#125;

  static #totalAccounts = 0;  // 静态私有字段

  constructor() &#123;
    BankAccount.#totalAccounts++;
  &#125;
&#125;

const account = new BankAccount();
account.deposit(100);
// account.#balance; // SyntaxError: 外部无法访问
```

## Proxy 与 Reflect

### Proxy 拦截器

Proxy 允许你拦截对象上的基本操作：

```typescript
const handler: ProxyHandler&lt;any&gt; = &#123;
  get(target, prop, receiver) &#123;
    console.log(`Getting $&#123;String(prop)&#125;`);
    return Reflect.get(target, prop, receiver);
  &#125;,

  set(target, prop, value, receiver) &#123;
    console.log(`Setting $&#123;String(prop)&#125; = $&#123;value&#125;`);
    return Reflect.set(target, prop, value, receiver);
  &#125;,

  has(target, prop) &#123;
    console.log(`Checking $&#123;String(prop)&#125;`);
    return Reflect.has(target, prop);
  &#125;,
&#125;;

const proxy = new Proxy(&#123; name: 'Alice' &#125;, handler);
proxy.name; // Getting name
proxy.age = 30; // Setting age = 30
'name' in proxy; // Checking name
```

### 常见 Proxy 应用场景

| 场景 | 实现方式 | 示例 |
|------|----------|------|
| 数据验证 | `set` 拦截器 | 校验赋值类型 |
| 懒加载 | `get` 拦截器 | 按需初始化 |
| 响应式系统 | `set` + 依赖收集 | Vue 3 Reactivity |
| 日志记录 | 多个拦截器 | API 调用追踪 |
| 不可变对象 | `set` 返回 false | 只读保护 |

## 核心文档

| 文档 | 主题 | 文件 |
|------|------|------|
| README | 对象模型总览 | [查看](../../10-fundamentals/10.5-object-model/README.md) |
| 原型链 | 原型继承与原型链机制 | [查看](../../10-fundamentals/10.5-object-model/prototype-chain.md) |
| 属性描述符 | 属性描述符与元编程 | [查看](../../10-fundamentals/10.5-object-model/property-descriptors.md) |
| Proxy/Reflect | 代理与反射 API | [查看](../../10-fundamentals/10.5-object-model/proxy-reflect.md) |
| 私有字段 | 类私有字段与弱引用 | [查看](../../10-fundamentals/10.5-object-model/private-fields.md) |

## 代码示例

| 示例 | 主题 | 文件 |
|------|------|------|
| 01 | 对象模型概览 | [查看](../../10-fundamentals/10.5-object-model/code-examples/01-object-model-overview.md) |
| 02 | 原型链 | [查看](../../10-fundamentals/10.5-object-model/code-examples/02-prototype-chain.md) |
| 03 | Proxy 与 Reflect | [查看](../../10-fundamentals/10.5-object-model/code-examples/03-proxy-and-reflect.md) |
| 04 | 私有字段 | [查看](../../10-fundamentals/10.5-object-model/code-examples/04-private-fields.md) |
| 05 | 对象创建模式 | [查看](../../10-fundamentals/10.5-object-model/code-examples/05-object-creation-patterns.md) |

## 交叉引用

- **[语言语义深入解析](./language-semantics)** — 对象的语法定义与语义规则
- **[执行模型深入解析](./execution-model)** — 对象在内存中的表示与生命周期
- **[编程原则 / 内存模型](/programming-principles/08-memory-models)** — 对象引用的内存一致性
- **[对象模型专题](/object-model/)** — 完整的对象模型深度专题（7篇文档）

---

 [← 返回首页](/)
""")
print(f"object-model: {os.path.getsize(f)} bytes")

print('Fundamentals batch done')

# ============================================================
# 2. examples/mobile.md 扩充
# ============================================================
f = os.path.join(base, 'examples', 'mobile.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 移动端开发示例
description: "JavaScript/TypeScript 移动端开发示例与最佳实践：React Native、Expo、跨平台共享与性能优化"
---

# 📱 移动端开发实战 (50.4)

> 移动端开发是 JavaScript/TypeScript 生态中增长最快的领域之一。React Native、Ionic、Capacitor 和新兴的跨平台方案为开发者提供了用 Web 技术构建原生应用的能力。

## 技术选型决策树

```mermaid
flowchart TD
    A[移动端技术选型] --> B&#123;需要原生性能?&#125;
    B -->|是| C&#123;团队熟悉React?&#125;
    C -->|是| D[React Native]
    C -->|否| E[Flutter/Dart]
    B -->|否| F&#123;需要Web代码复用?&#125;
    F -->|是| G[Capacitor/Ionic]
    F -->|否| H[PWA]
    D --> I[新架构 Fabric]
    D --> J[TurboModules]
    D --> K[Expo生态]
```

## React Native 新架构 (Fabric + TurboModules)

React Native 在 2022-2024 年完成了架构重写，新架构解决了旧架构（Bridge）的性能瓶颈：

```mermaid
flowchart LR
    subgraph 旧架构 Bridge
        A[JS线程] -->|序列化JSON| B[Bridge]
        B -->|异步通信| C[Native线程]
        C --> D[UI渲染慢]
    end
    subgraph 新架构 JSI
        E[JS线程] -->|JSI直接调用| F[C++层]
        F -->|同步调用| G[Native线程]
        G --> H[UI渲染快]
    end
```

| 特性 | 旧架构 (Bridge) | 新架构 (JSI) |
|------|----------------|-------------|
| 通信方式 | 异步 JSON 序列化 | 直接内存共享 |
| 启动速度 | 慢 | 快 2-3x |
| 内存占用 | 高 | 低 30% |
| TypeScript | 类型不全 | 完整类型 |
|  Fabric  |  Yoga 布局 |  跨平台统一布局  |

### 启用新架构

```json
// android/gradle.properties
newArchEnabled=true

// ios/Podfile
ENV['RCT_NEW_ARCH_ENABLED'] = '1'
```

## Expo 生态系统

Expo 是 React Native 最流行的开发平台，提供了托管工作流、EAS 构建服务和丰富的原生模块库：

```mermaid
flowchart TB
    subgraph Expo生态
        A[Expo SDK] --> B[原生模块]
        A --> C[Expo Router]
        A --> D[EAS Build]
        A --> E[Expo Go]
        B --> F[Camera / Maps / Notifications]
        C --> G[文件系统路由]
        D --> H[云端构建]
    end
```

### Expo Router 文件系统路由

```typescript
// app/index.tsx — 首页
export default function Home() &#123;
  return &lt;View&gt;&lt;Text&gt;Home&lt;/Text&gt;&lt;/View&gt;;
&#125;

// app/(tabs)/explore.tsx — Tab 路由
export default function Explore() &#123;
  return &lt;View&gt;&lt;Text&gt;Explore&lt;/Text&gt;&lt;/View&gt;;
&#125;

// app/[id].tsx — 动态路由
import &#123; useLocalSearchParams &#125; from 'expo-router';
export default function Detail() &#123;
  const &#123; id &#125; = useLocalSearchParams();
  return &lt;View&gt;&lt;Text&gt;Detail: &#123;id&#125;&lt;/Text&gt;&lt;/View&gt;;
&#125;
```

## 跨平台共享代码策略

```mermaid
flowchart TB
    subgraph 代码共享架构
        A[共享业务逻辑] --> B[React Native]
        A --> C[Web]
        A --> D[Node.js后端]
        B --> E[平台特定UI]
        C --> F[Web特定UI]
    end
```

```typescript
// 共享层：packages/core/src/api.ts
export async function fetchUser(id: string): Promise&lt;User&gt; &#123;
  const response = await fetch(`/api/users/$&#123;id&#125;`);
  return response.json();
&#125;

// 平台抽象层：packages/core/src/storage.ts
export interface Storage &#123;
  get(key: string): Promise&lt;string | null&gt;;
  set(key: string, value: string): Promise&lt;void&gt;;
&#125;

// React Native 实现
import AsyncStorage from '@react-native-async-storage/async-storage';
export const storage: Storage = AsyncStorage;

// Web 实现
export const storage: Storage = localStorage;
```

## 移动端性能优化

| 优化项 | 问题 | 方案 | 效果 |
|--------|------|------|------|
| 启动时间 | JS Bundle 过大 | Hermes 引擎 + 代码分割 | -50% |
| 列表滚动 | 长列表卡顿 | FlashList / RecyclerListView | 60fps |
| 内存泄漏 | 事件未移除 | useEffect cleanup | 稳定 |
| 图片加载 | 大图 OOM | react-native-fast-image | 流畅 |
| 动画 | JS 线程阻塞 | react-native-reanimated | 60fps |

### FlashList 长列表优化

```tsx
import &#123; FlashList &#125; from '@shopify/flash-list';

function ProductList(&#123; products &#125;) &#123;
  return (
    &lt;FlashList
      data=&#123;products&#125;
      renderItem=&#123;(&#123; item &#125;) => &lt;ProductCard product=&#123;item&#125; /&gt;&#125;
      estimatedItemSize=&#123;200&#125;
      keyExtractor=&#123;(item) => item.id&#125;
    /&gt;
  );
&#125;
```

## 原生模块开发

当 Expo/RN 的内置模块无法满足需求时，可以开发原生模块：

```mermaid
flowchart LR
    A[JS层] -->|TurboModules| B[C++层]
    B -->|JNI| C[Android Kotlin]
    B -->|ObjC++| D[iOS Swift]
```

### TurboModule 示例

```typescript
// specs/NativeCalculator.ts
import type &#123; TurboModule &#125; from 'react-native/Libraries/TurboModule/RCTExport';
import &#123; TurboModuleRegistry &#125; from 'react-native';

export interface Spec extends TurboModule &#123;
  add(a: number, b: number): Promise&lt;number&gt;;
&#125;

export default TurboModuleRegistry.get&lt;Spec&gt;('NativeCalculator');
```

## 文档目录

| 编号 | 主题 | 文件 |
|------|------|------|
| 01 | React Native + Expo 环境搭建 | [查看](../../50-examples/50.4-mobile/01-react-native-expo-setup.md) |
| 02 | React Native 新架构 (Fabric/TurboModules) | [查看](../../50-examples/50.4-mobile/02-react-native-new-architecture.md) |
| 03 | 跨平台共享代码策略 | [查看](../../50-examples/50.4-mobile/03-cross-platform-shared-code.md) |
| 04 | 移动端性能优化 | [查看](../../50-examples/50.4-mobile/04-mobile-performance-optimization.md) |
| 05 | 原生模块开发 | [查看](../../50-examples/50.4-mobile/05-mobile-native-modules.md) |
| 06 | Expo Router 深度解析 | [查看](../../50-examples/50.4-mobile/06-expo-router-deep-dive.md) |
| README | 移动端开发总览 | [查看](../../50-examples/50.4-mobile/README.md) |

## 参考资源

| 资源 | 链接 | 说明 |
|------|------|------|
| React Native 文档 | https://reactnative.dev | 官方文档 |
| Expo 文档 | https://docs.expo.dev | Expo 完整指南 |
| React Native Directory | https://reactnative.directory | 社区模块目录 |

---

 [← 返回示例首页](../)
""")
print(f"examples/mobile: {os.path.getsize(f)} bytes")

# ============================================================
# 3. code-lab 分类导航页扩充
# ============================================================

# code-lab/language-core.md
f = os.path.join(base, 'code-lab', 'language-core.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 语言核心实验室
description: "JavaScript/TypeScript 语言核心实验：变量系统、类型、控制流、函数与执行模型"
---

# 语言核心 (00-09)

> 语言核心实验室覆盖 JavaScript/TypeScript 语言最基础的机制。通过动手实验，你将深入理解变量系统、类型系统、控制流、函数、执行模型等核心概念。

## 学习路径

```mermaid
flowchart LR
    A[变量系统] --> B[类型与运算符]
    B --> C[控制流]
    C --> D[函数与闭包]
    D --> E[对象与原型]
    E --> F[执行模型]
    F --> G[异步编程]
    G --> H[模块化]
    style A fill:#4ade80,color:#000
    style H fill:#f472b6,color:#000
```

## 核心实验模块

| 编号 | 模块 | 实验数 | 核心概念 |
|------|------|--------|----------|
| **00** | language-core | 20 | 变量提升、作用域、this绑定 |
| **01** | ecmascript-evolution | 23 | ES2020-ES2025新特性 |
| **02** | design-patterns | 24 | 创建型/结构型/行为型模式 |
| **03** | concurrency | 6 | Event Loop、Promise、Async/Await |
| **04** | data-structures | 6 | 数组、链表、树、图 |
| **05** | algorithms | 6 | 排序、搜索、动态规划 |
| **06** | architecture-patterns | 4 | MVC、MVVM、微前端 |
| **07** | testing | 5 | 单元测试、TDD、Mock |
| **08** | performance | 5 | 时间复杂度、内存优化 |
| **09** | real-world-examples | 7 | 真实项目案例分析 |

## 关键实验预览

### 变量系统实验室

```javascript
// 实验：理解 let/const/var 的差异
console.log(a); // undefined（变量提升）
var a = 1;

console.log(b); // ReferenceError（TDZ）
let b = 2;

// 实验：块级作用域
for (var i = 0; i &lt; 3; i++) &#123;
  setTimeout(() => console.log(i), 100); // 3, 3, 3
&#125;

for (let j = 0; j &lt; 3; j++) &#123;
  setTimeout(() => console.log(j), 100); // 0, 1, 2
&#125;
```

### 类型系统实验室

```typescript
// 实验：结构类型 vs 名义类型
interface Point &#123; x: number; y: number &#125;
interface Vector &#123; x: number; y: number &#125;

const p: Point = &#123; x: 1, y: 2 &#125;;
const v: Vector = p; // ✅ TypeScript 中合法

// 实验：类型收窄
function process(value: string | number) &#123;
  if (typeof value === 'string') &#123;
    value.toUpperCase(); // ✅ string 方法
  &#125; else &#123;
    value.toFixed(2);    // ✅ number 方法
  &#125;
&#125;
```

### 闭包实验室

```javascript
// 实验：闭包与私有状态
function createCounter() &#123;
  let count = 0; // 私有变量
  return &#123;
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count,
  &#125;;
&#125;

const counter1 = createCounter();
const counter2 = createCounter();
counter1.increment(); // 1
counter1.increment(); // 2
counter2.increment(); // 1（独立状态）
```

## 实验环境

每个实验都包含：
- **环境准备**：所需的工具和依赖
- **核心代码**：可直接运行的示例
- **验证步骤**：确认理解的检查清单
- **扩展挑战**：深入探索的进阶任务
- **参考解答**：实验完成后的对照答案

## 参考资源

- [语言语义导读](/fundamentals/language-semantics) — 语言特性的理论解析
- [类型系统导读](/fundamentals/type-system) — TypeScript 类型系统基础
- [执行模型导读](/fundamentals/execution-model) — 代码运行时的底层机制

---

 [← 返回代码实验室首页](./)
""")
print(f"code-lab/language-core: {os.path.getsize(f)} bytes")

# code-lab/ai-frontier.md
f = os.path.join(base, 'code-lab', 'ai-frontier.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: AI 前沿实验室
description: "AI 与前沿技术实验：AI辅助编码、代码生成、边缘AI与智能Agent"
---

# AI 与前沿 (33, 55-56, 82, 94)

> AI 正在重塑软件开发的每一个环节。本实验室覆盖从 AI 辅助编码到智能 Agent 的完整技术栈，通过动手实验掌握 LLM 在工程实践中的应用。

## 技术全景

```mermaid
mindmap
  root((AI工程实验))
    AI辅助编码
      Cursor工作流
      GitHub Copilot
      Claude Code
    代码生成
      模板生成
      测试生成
      文档生成
    边缘AI
      ONNX Runtime Web
      TensorFlow.js
      WebLLM
    智能Agent
      MCP协议
      工具调用
      自主工作流
```

## 实验模块

| 编号 | 模块 | 实验数 | 核心内容 |
|------|------|--------|----------|
| **55** | ai-testing | 6 | AI 驱动的测试生成与优化 |
| **56** | code-generation | 5 | 基于 LLM 的代码生成工作流 |
| **82** | edge-ai | 9 | 浏览器端 AI 推理与优化 |
| **33** | ai-integration | 1 | AI SDK 集成基础 |
| **94** | ai-agent-lab | 3 | 智能 Agent 架构与实现 |

## 关键实验

### AI 辅助编码工作流

```typescript
// 实验：构建 AI 辅助代码审查工具
import OpenAI from 'openai';

const openai = new OpenAI(&#123; apiKey: process.env.OPENAI_API_KEY &#125;);

async function reviewCode(code: string): Promise&lt;string&gt; &#123;
  const response = await openai.chat.completions.create(&#123;
    model: 'gpt-4',
    messages: [
      &#123;
        role: 'system',
        content: '你是一位资深代码审查专家。请审查以下代码，指出潜在问题、安全风险和优化建议。'
      &#125;,
      &#123; role: 'user', content: code &#125;
    ],
  &#125;);
  return response.choices[0].message.content ?? '';
&#125;
```

### 边缘 AI 推理

```typescript
// 实验：浏览器端图像分类
import * as ort from 'onnxruntime-web';

async function classifyImage(imageData: ImageData) &#123;
  const session = await ort.InferenceSession.create('/model.onnx');
  const tensor = new ort.Tensor('float32', preprocess(imageData), [1, 3, 224, 224]);
  const results = await session.run(&#123; input: tensor &#125;);
  return postprocess(results);
&#125;
```

### MCP 工具集成

```typescript
// 实验：构建 MCP 工具服务器
import &#123; Server &#125; from '@modelcontextprotocol/sdk/server/index.js';

const server = new Server(&#123;
  name: 'weather-server',
  version: '1.0.0',
&#125;, &#123;
  capabilities: &#123; tools: &#123;&#125; &#125;
&#125;);

server.setRequestHandler(ListToolsRequestSchema, async () => &#123;
  return &#123;
    tools: [&#123;
      name: 'get_weather',
      description: '获取指定城市的天气',
      inputSchema: &#123;
        type: 'object',
        properties: &#123; city: &#123; type: 'string' &#125; &#125;,
        required: ['city'],
      &#125;,
    &#125;]
  &#125;;
&#125;);
```

## 参考资源

- [AI Agent 示例](/examples/ai-agent/) — Agent 架构与 MCP 集成实战
- [AI/ML 推理示例](/examples/ai-ml-inference/) — ONNX Runtime Web 浏览器端推理
- [AI 编码工作流](/ai-coding-workflow/) — Cursor、Copilot、Claude Code 深度指南

---

 [← 返回代码实验室首页](./)
""")
print(f"code-lab/ai-frontier: {os.path.getsize(f)} bytes")

# code-lab/runtime-architecture.md
f = os.path.join(base, 'code-lab', 'runtime-architecture.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 运行时与架构实验室
description: "运行时与架构实验：事件循环、内存管理、V8引擎、微服务与边缘架构"
---

# 运行时与架构 (50-54)

> 理解代码的底层运行机制是成为高级工程师的必经之路。本实验室通过动手实验，深入探索 JavaScript 运行时、浏览器/Node.js 架构、微服务通信和边缘计算。

## 实验模块

| 编号 | 模块 | 实验数 | 核心内容 |
|------|------|--------|----------|
| **50** | event-loop | 4 | 浏览器与 Node.js 事件循环差异 |
| **51** | memory-management | 4 | 垃圾回收、内存泄漏检测 |
| **52** | v8-internals | 3 | 编译管线、隐藏类、内联缓存 |
| **53** | microservices | 5 | 服务通信、熔断、限流 |
| **54** | edge-computing | 4 | Workers、边缘缓存、Durable Objects |

## 核心实验

### 事件循环可视化

```javascript
// 实验：验证微任务 vs 宏任务优先级
console.log('1. 同步');

setTimeout(() => console.log('2. 宏任务'), 0);

Promise.resolve().then(() => &#123;
  console.log('3. 微任务');
  return Promise.resolve();
&#125;).then(() => &#123;
  console.log('4. 嵌套微任务');
&#125;);

queueMicrotask(() => console.log('5. queueMicrotask'));

console.log('6. 同步结束');

// 输出顺序：1 → 6 → 3 → 5 → 4 → 2
```

### 内存泄漏检测

```javascript
// 实验：检测常见的内存泄漏模式

// 泄漏1：闭包引用
function createLeak() &#123;
  const hugeArray = new Array(1e6).fill('x');
  return () => hugeArray[0]; // hugeArray 永远无法释放
&#125;

// 泄漏2：事件监听器未移除
class LeakyComponent &#123;
  constructor() &#123;
    window.addEventListener('resize', this.handleResize);
    // 忘记 removeEventListener
  &#125;
&#125;

// 泄漏3：Map 缓存无上限
const cache = new Map();
function getData(key) &#123;
  if (!cache.has(key)) &#123;
    cache.set(key, fetchData(key)); // 持续增长
  &#125;
  return cache.get(key);
&#125;
```

### V8 编译管线实验

```javascript
// 实验：观察 TurboFan 优化效果
function add(a, b) &#123;
  return a + b;
&#125;

// 初始：解释执行（Ignition）
// 多次调用后：快速编译（Maglev）
// 高频调用后：优化编译（TurboFan）

for (let i = 0; i &lt; 100000; i++) &#123;
  add(i, i + 1);
&#125;

// 使用 --trace-opt 查看优化日志
// node --trace-opt script.js
```

## 参考资源

- [执行模型导读](/fundamentals/execution-model) — V8 引擎与事件循环深度解析
- [Edge 架构示例](/examples/edge-architecture/) — Cloudflare Workers 部署实战
- [微服务示例](/examples/microservices/) — gRPC 与服务网格

---

 [← 返回代码实验室首页](./)
""")
print(f"code-lab/runtime-architecture: {os.path.getsize(f)} bytes")

# code-lab/specialized-labs.md
f = os.path.join(base, 'code-lab', 'specialized-labs.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 专题实验室
description: "专题实验室：Svelte Signals、类型系统、异步并发、认证授权等深度实验"
---

# 实验室专题 (90-96)

> 专题实验室覆盖特定技术栈或工程领域的深度实验。每个专题都聚焦于一个具体的技术方向，提供从理论到实践的完整学习路径。

## 专题列表

```mermaid
flowchart TB
    subgraph 前端框架
        A[Svelte Signals] --> B[响应式系统]
        C[Vue Reactivity] --> D[依赖追踪]
    end
    subgraph 语言特性
        E[类型系统] --> F[泛型与条件类型]
        G[异步并发] --> H[Promise与Async]
    end
    subgraph 工程实践
        I[认证授权] --> J[JWT与OAuth]
        K[Server Functions] --> L[全栈类型安全]
    end
```

## 可用实验

| 专题 | 实验文件 | 难度 | 预计用时 |
|------|----------|------|----------|
| Svelte Signals | [svelte-signals-lab](/code-lab/svelte-signals-lab) | 🌿 中级 | 45min |
| 语言核心 | [language-core-lab](/code-lab/language-core-lab) | 🌱 初级 | 30min |
| 异步并发 | [async-concurrency-lab](/code-lab/async-concurrency-lab) | 🌿 中级 | 45min |
| 类型系统 | [type-system-lab](/code-lab/type-system-lab) | 🍂 高级 | 60min |
| λ Lambda演算 | [lab-00-lambda-calculus](/code-lab/lab-00-lambda-calculus) | 🍂 高级 | 90min |
| 操作语义 | [lab-00-operational-semantics](/code-lab/lab-00-operational-semantics) | 🍂 高级 | 90min |
| 工程环境 | [lab-01-basic-setup](/code-lab/lab-01-basic-setup) | 🌱 初级 | 30min |
| 类型推断 | [lab-01-type-inference](/code-lab/lab-01-type-inference) | 🌿 中级 | 45min |
| 公理语义 | [lab-02-axiomatic-semantics](/code-lab/lab-02-axiomatic-semantics) | 🍂 高级 | 90min |
| Server Functions | [lab-02-server-functions](/code-lab/lab-02-server-functions) | 🌿 中级 | 60min |
| 子类型关系 | [lab-02-subtyping](/code-lab/lab-02-subtyping) | 🌿 中级 | 45min |
| 变量系统 | [lab-02-variables](/code-lab/lab-02-variables) | 🌱 初级 | 30min |
| 认证授权 | [lab-03-auth](/code-lab/lab-03-auth) | 🌿 中级 | 60min |
| 控制流 | [lab-03-control-flow](/code-lab/lab-03-control-flow) | 🌱 初级 | 30min |
| Mini TS编译器 | [lab-03-mini-typescript](/code-lab/lab-03-mini-typescript) | 🍂 高级 | 120min |

## Svelte Signals 实验室（推荐）

Svelte 5 引入了全新的响应式系统 Runes，彻底改变了状态管理的方式：

```svelte
&lt;script&gt;
  let count = $state(0);      // 响应式状态
  let doubled = $derived(count * 2); // 派生状态

  $effect(() => &#123;            // 副作用
    console.log('Count changed:', count);
  &#125;);
&lt;/script&gt;

&lt;button onclick=&#123;() => count++&#125;&gt;
  &#123;count&#125; × 2 = &#123;doubled&#125;
&lt;/button&gt;
```

## 参考资源

- [Svelte Signals 专题](/svelte-signals-stack/) — 完整的响应式系统理论
- [编程原则](/programming-principles/) — λ演算与形式语义
- [TypeScript 类型系统](/typescript-type-system/) — 类型理论深度专题

---

 [← 返回代码实验室首页](./)
""")
print(f"code-lab/specialized-labs: {os.path.getsize(f)} bytes")

# code-lab/theoretical-depth.md
f = os.path.join(base, 'code-lab', 'theoretical-depth.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 理论深度实验室
description: "理论深度实验：计算理论、形式语义、类型论与程序分析"
---

# 理论深度 (40-41, 77-81)

> 本实验室连接计算机科学的理论基础与前端工程实践。通过形式化方法、类型论和程序分析的学习，建立对编程语言本质的深层理解。

## 理论基础图谱

```mermaid
mindmap
  root((计算理论))
    Lambda演算
       Church编码
      Y组合子
      不动点
    类型论
      简单类型
      多态类型
      依赖类型
    形式语义
      操作语义
      指称语义
      公理化语义
    程序分析
      抽象解释
      控制流分析
      数据流分析
```

## 实验模块

| 编号 | 模块 | 核心内容 | 理论联系 |
|------|------|----------|----------|
| **40** | computation-theory | λ演算、图灵机、可计算性 | 计算本质 |
| **41** | formal-methods | 规约、验证、模型检测 | 正确性保证 |
| **77** | category-theory | 范畴、函子、自然变换 | 类型系统数学基础 |
| **78** | linear-logic | 线性逻辑、资源敏感 | 内存管理 |
| **79** | proof-assistants | Coq、Agda、依赖类型 | 形式化验证 |
| **80** | program-synthesis | 程序合成、归纳编程 | AI代码生成 |
| **81** | verification | 霍尔逻辑、最弱前置条件 | 静态分析 |

## 核心实验

### λ演算实现

```typescript
// 实验：实现 λ演算解释器
type Term =
  | &#123; type: 'var'; name: string &#125;
  | &#123; type: 'abs'; param: string; body: Term &#125;
  | &#123; type: 'app'; func: Term; arg: Term &#125;;

// 变量替换
function substitute(term: Term, name: string, replacement: Term): Term &#123;
  switch (term.type) &#123;
    case 'var':
      return term.name === name ? replacement : term;
    case 'abs':
      if (term.param === name) return term;
      return &#123; type: 'abs', param: term.param, body: substitute(term.body, name, replacement) &#125;;
    case 'app':
      return &#123;
        type: 'app',
        func: substitute(term.func, name, replacement),
        arg: substitute(term.arg, name, replacement),
      &#125;;
  &#125;
&#125;

// β规约
function betaReduce(term: Term): Term &#123;
  if (term.type === 'app' && term.func.type === 'abs') &#123;
    return substitute(term.func.body, term.func.param, term.arg);
  &#125;
  return term;
&#125;
```

### 抽象解释实验

```typescript
// 实验：常量传播分析
interface AbstractValue &#123;
  kind: 'top' | 'const' | 'bottom';
  value?: number;
&#125;

function join(a: AbstractValue, b: AbstractValue): AbstractValue &#123;
  if (a.kind === 'bottom') return b;
  if (b.kind === 'bottom') return a;
  if (a.kind === 'const' && b.kind === 'const' && a.value === b.value) &#123;
    return a;
  &#125;
  return &#123; kind: 'top' &#125;;
&#125;

// 分析：x = 5; y = x + 3 → x=const(5), y=const(8)
// 分析：if (cond) x = 1 else x = 2 → x=top
```

## 参考资源

- [理论前沿](/theoretical-foundations/) — 36篇理论摘要导航
- [编程原则](/programming-principles/) — 计算思维、λ演算、类型论
- [学术前沿导读](/fundamentals/academic-frontiers) — 守卫域理论、TSGo编译器

---

 [← 返回代码实验室首页](./)
""")
print(f"code-lab/theoretical-depth: {os.path.getsize(f)} bytes")

# code-lab/distributed-enterprise.md
f = os.path.join(base, 'code-lab', 'distributed-enterprise.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 分布式与企业级实验室
description: "分布式系统与企业级开发实验：微服务、消息队列、事务、监控与可观测性"
---

# 分布式与企业 (59, 61-75)

> 本实验室覆盖企业级应用开发的核心挑战：分布式系统架构、数据一致性、服务治理和可观测性。通过动手实验，掌握构建可靠大规模系统的关键技术。

## 技术栈全景

```mermaid
flowchart TB
    subgraph 通信层
        A[gRPC/REST] --> B[消息队列]
        B --> C[Kafka/RabbitMQ]
    end
    subgraph 数据层
        D[分布式事务] --> E[Saga模式]
        D --> F[TCC模式]
        G[缓存] --> H[Redis Cluster]
    end
    subgraph 治理层
        I[服务发现] --> J[Consul/etcd]
        K[熔断限流] --> L[Circuit Breaker]
    end
    subgraph 观测层
        M[日志] --> N[ELK]
        O[指标] --> P[Prometheus]
        Q[追踪] --> R[Jaeger]
    end
```

## 实验模块

| 编号 | 模块 | 实验数 | 核心内容 |
|------|------|--------|----------|
| **59** | distributed-systems | 5 | CAP定理、一致性协议 |
| **61** | microservices | 6 | 服务拆分、通信、治理 |
| **62** | message-queue | 4 | Kafka、RabbitMQ 实践 |
| **63** | distributed-transaction | 3 | Saga、TCC、2PC |
| **64** | caching | 4 | Redis、缓存策略 |
| **65** | observability | 5 | 日志、指标、追踪 |
| **66** | security | 4 | OAuth、JWT、mTLS |
| **67** | ci-cd | 5 | 流水线、GitOps |
| **68** | container-orchestration | 4 | Docker、K8s |
| **69** | service-mesh | 3 | Istio、Envoy |
| **70** | data-pipeline | 3 | ETL、流处理 |
| **71** | graphql-enterprise | 3 | 联邦网关、权限 |
| **72** | realtime-systems | 3 | WebSocket、SSE |
| **73** | fullstack-frameworks | 4 | Next.js、Remix |
| **74** | serverless | 3 | Lambda、Workers |
| **75** | edge-computing | 3 | CDN、边缘函数 |

## 核心实验

### Saga 分布式事务

```typescript
// 实验：实现 Saga 编排器
type SagaStep = &#123;
  name: string;
  execute: () => Promise&lt;void&gt;;
  compensate: () => Promise&lt;void&gt;;
&#125;;

class SagaOrchestrator &#123;
  private steps: SagaStep[] = [];
  private completed: SagaStep[] = [];

  addStep(step: SagaStep) &#123;
    this.steps.push(step);
  &#125;

  async execute() &#123;
    for (const step of this.steps) &#123;
      try &#123;
        await step.execute();
        this.completed.push(step);
      &#125; catch (error) &#123;
        // 执行补偿操作
        for (const completed of this.completed.reverse()) &#123;
          await completed.compensate();
        &#125;
        throw error;
      &#125;
    &#125;
  &#125;
&#125;

// 使用示例：订单创建 Saga
const saga = new SagaOrchestrator();
saga.addStep(&#123;
  name: 'create-order',
  execute: () => orderService.create(order),
  compensate: () => orderService.cancel(order.id),
&#125;);
saga.addStep(&#123;
  name: 'deduct-inventory',
  execute: () => inventoryService.deduct(items),
  compensate: () => inventoryService.restore(items),
&#125;);
saga.addStep(&#123;
  name: 'process-payment',
  execute: () => paymentService.charge(amount),
  compensate: () => paymentService.refund(amount),
&#125;);
```

### 熔断器模式

```typescript
// 实验：实现 Circuit Breaker
enum CircuitState &#123; CLOSED, OPEN, HALF_OPEN &#125;

class CircuitBreaker &#123;
  private state = CircuitState.CLOSED;
  private failures = 0;
  private lastFailureTime?: number;

  constructor(
    private threshold = 5,
    private timeout = 60000,
  ) &#123;&#125;

  async execute&lt;T&gt;(fn: () => Promise&lt;T&gt;): Promise&lt;T&gt; &#123;
    if (this.state === CircuitState.OPEN) &#123;
      if (Date.now() - (this.lastFailureTime ?? 0) &gt; this.timeout) &#123;
        this.state = CircuitState.HALF_OPEN;
      &#125; else &#123;
        throw new Error('Circuit is OPEN');
      &#125;
    &#125;

    try &#123;
      const result = await fn();
      this.onSuccess();
      return result;
    &#125; catch (error) &#123;
      this.onFailure();
      throw error;
    &#125;
  &#125;

  private onSuccess() &#123;
    this.failures = 0;
    this.state = CircuitState.CLOSED;
  &#125;

  private onFailure() &#123;
    this.failures++;
    this.lastFailureTime = Date.now();
    if (this.failures &gt;= this.threshold) &#123;
      this.state = CircuitState.OPEN;
    &#125;
  &#125;
&#125;
```

## 参考资源

- [微服务示例](/examples/microservices/) — gRPC、服务网格通信
- [DevOps 示例](/examples/devops/) — CI/CD 流水线设计
- [GraphQL 生产示例](/examples/graphql-production/) — 联邦网关架构

---

 [← 返回代码实验室首页](./)
""")
print(f"code-lab/distributed-enterprise: {os.path.getsize(f)} bytes")

# code-lab/engineering-ecosystem.md
f = os.path.join(base, 'code-lab', 'engineering-ecosystem.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 工程与生态实验室
description: "工程与生态实验：构建工具、测试框架、状态管理、UI框架与性能优化"
---

# 工程与生态 (10-39)

> 本实验室覆盖现代前端工程化的完整工具链。从代码构建到生产部署，从状态管理到性能监控，掌握构建可靠、可维护、高性能应用的工程技术。

## 工程化全景

```mermaid
flowchart LR
    subgraph 开发阶段
        A[Vite/Webpack] --> B[TypeScript]
        B --> C[ESLint/Prettier]
        C --> D[单元测试]
    end
    subgraph 构建阶段
        E[代码分割] --> F[Tree Shaking]
        F --> G[压缩混淆]
    end
    subgraph 部署阶段
        H[Docker] --> I[CI/CD]
        I --> J[CDN部署]
    end
    subgraph 监控阶段
        K[错误追踪] --> L[性能监控]
        L --> M[用户分析]
    end
```

## 实验模块

| 编号 | 模块 | 实验数 | 核心内容 |
|------|------|--------|----------|
| **10** | build-tools | 5 | Vite、Webpack、esbuild、Rollup |
| **11** | state-management | 5 | Redux、Zustand、Jotai、Signals |
| **12** | ui-frameworks | 5 | React、Vue、Svelte、Solid |
| **13** | styling | 4 | CSS-in-JS、Tailwind、CSS Modules |
| **14** | routing | 3 | React Router、Vue Router、文件路由 |
| **15** | form-handling | 3 | React Hook Form、Formik、Zod |
| **16** | data-fetching | 4 | TanStack Query、SWR、GraphQL |
| **17** | animation | 3 | Framer Motion、GSAP、CSS动画 |
| **18** | testing | 5 | Vitest、Playwright、Storybook |
| **19** | i18n | 3 | react-i18n、FormatJS、Lingui |
| **20-39** | ecosystem-deep-dive | 各3-5 | 各技术栈深度实验 |

## 核心实验

### 构建工具对比

```typescript
// 实验：配置 Vite 多页面应用
// vite.config.ts
import &#123; defineConfig &#125; from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(&#123;
  plugins: [react()],
  build: &#123;
    rollupOptions: &#123;
      input: &#123;
        main: './index.html',
        admin: './admin.html',
      &#125;,
      output: &#123;
        manualChunks: &#123;
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        &#125;,
      &#125;,
    &#125;,
  &#125;,
&#125;);
```

### 状态管理演变

```typescript
// 实验：从 Redux 到 Signals

// Redux（样板代码多）
const counterReducer = (state = 0, action) => &#123;
  switch (action.type) &#123;
    case 'INCREMENT': return state + 1;
    default: return state;
  &#125;
&#125;;

// Zustand（简洁）
const useStore = create((set) => (&#123;
  count: 0,
  increment: () => set((s) => (&#123; count: s.count + 1 &#125;)),
&#125;));

// Signals（极致性能）
const count = signal(0);
const doubled = computed(() => count.value * 2);
// 仅订阅的组件会重新渲染
```

### 性能优化实验

```typescript
// 实验：React 渲染优化
import &#123; memo, useMemo, useCallback &#125; from 'react';

// 1. memo 避免不必要的重渲染
const ExpensiveComponent = memo(function ExpensiveComponent(&#123; data &#125;) &#123;
  return &lt;div&gt;&#123;heavyComputation(data)&#125;&lt;/div&gt;;
&#125;);

// 2. useMemo 缓存计算结果
const processedData = useMemo(() =>
  data.map(transform).filter(filter),
  [data]
);

// 3. useCallback 缓存函数引用
const handleClick = useCallback(() => &#123;
  onSelect(item.id);
&#125;, [item.id, onSelect]);
```

## 参考资源

- [前端模式示例](/examples/frontend-patterns/) — 组件组合与状态管理
- [性能示例](/examples/performance/) — Web Vitals 优化实战
- [测试示例](/examples/testing/) — Vitest 与 Playwright
- [状态管理专题](/state-management/) — 完整的状态管理知识体系

---

 [← 返回代码实验室首页](./)
""")
print(f"code-lab/engineering-ecosystem: {os.path.getsize(f)} bytes")

print('Code-lab batch done')

# ============================================================
# 4. diagrams 图表文件扩充
# ============================================================

# diagrams/ecmascript-timeline.md
f = os.path.join(base, 'diagrams', 'ecmascript-timeline.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: ECMAScript 标准演进时间线
description: "从 ES2015 到 ES2026 的 JavaScript 语言特性演进时间线，标注关键语法特性与浏览器支持状态"
---

# ECMAScript 标准演进时间线 (ES2020 - ES2026)

> ECMAScript 是 JavaScript 语言的标准规范，由 TC39 委员会每年发布一个新版本。理解这一演进脉络有助于把握语言发展方向，做出更合理的技术选型。

## 特性演进时间线

```mermaid
timeline
    title ECMAScript 特性演进
    2015 ES6 : let/const
             : 箭头函数
             : Class
             : Promise
             : 模块化
    2016 ES7 : Array.prototype.includes
             : 指数运算符 **
    2017 ES8 : async/await
             : Object.entries/values
    2018 ES9 : 展开运算符 ...
             : Promise.finally
    2019 ES10 : flat/flatMap
              : Object.fromEntries
    2020 ES11 : BigInt
              : 可选链 ?.
              : 空值合并 ??
              : Promise.allSettled
    2021 ES12 : Promise.any
              : 逻辑赋值
              : WeakRef
    2022 ES13 : Class 私有字段
              : at()
              : 顶层 await
    2023 ES14 : toSorted/toReversed
              : findLast
    2024 ES15 : Object.groupBy
              : Promise.withResolvers
    2025 ES16 : Iterator辅助方法
              : Set运算
```

## 关键特性详解

### ES2020 (ES11) — 现代 JavaScript 的里程碑

ES2020 引入了多个改变开发方式的特性：

| 特性 | 语法 | 解决痛点 |
|------|------|----------|
| BigInt | `9007199254740993n` | 超过 2^53 的精确整数 |
| 可选链 | `obj?.a?.b` | 深层属性访问的 null 检查 |
| 空值合并 | `value ?? default` | 仅对 null/undefined 生效的默认值 |
| Promise.allSettled | `Promise.allSettled([p1, p2])` | 等待所有 Promise 完成 |
| 动态 import | `await import('./mod')` | 运行时条件加载 |

```javascript
// 可选链 + 空值合并的组合
const userCity = user?.address?.city ?? 'Unknown';

// 对比传统写法
const userCity = user && user.address && user.address.city ? user.address.city : 'Unknown';
```

### ES2022 (ES13) — Class 的完善

```javascript
class Counter &#123;
  #count = 0;           // 私有字段
  static #instances = 0; // 静态私有字段

  increment() &#123;
    this.#count++;
    Counter.#instances++;
  &#125;

  get #formatted() &#123;   // 私有访问器
    return `Count: $&#123;this.#count&#125;`;
  &#125;
&#125;
```

## 浏览器支持状态

```mermaid
flowchart LR
    subgraph 已全面支持
        A[ES2020] --> B[Chrome 80+]
        A --> C[Firefox 80+]
        A --> D[Safari 14+]
    end
    subgraph 渐进支持
        E[ES2024] --> F[最新浏览器]
        E --> G[Babel转译]
    end
```

| 版本 | Chrome | Firefox | Safari | Node.js |
|------|--------|---------|--------|---------|
| ES2020 | 80 | 80 | 14 | 14.0 |
| ES2021 | 85 | 85 | 14.1 | 16.0 |
| ES2022 | 94 | 93 | 15.4 | 18.0 |
| ES2023 | 110 | 115 | 16.4 | 20.0 |
| ES2024 | 122 | 123 | 17.4 | 22.0 |

## TypeScript 与 ECMAScript 的关系

```mermaid
flowchart TB
    A[ECMAScript规范] -->|每年发布| B[新特性]
    B -->|TypeScript实现| C[类型安全版本]
    C -->|转译| D[兼容旧浏览器]
    E[TypeScript独有] --> F[类型系统]
    E --> G[装饰器]
    E --> H[枚举/接口]
```

TypeScript 是 ECMAScript 的超集，这意味着：
- 所有有效的 JavaScript 都是有效的 TypeScript
- TypeScript 在 ECMAScript 特性基础上增加了类型系统
- TypeScript 编译器可以将新特性转译为旧环境兼容的代码

## 参考资源

- [语言语义导读](/fundamentals/language-semantics) — ES2020-ES2025 特性矩阵
- [10-fundamentals/10.1-language-semantics](/fundamentals/language-semantics) — 语言核心特性全览

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/ecmascript-timeline: {os.path.getsize(f)} bytes")

# diagrams/event-loop-comparison.md
f = os.path.join(base, 'diagrams', 'event-loop-comparison.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: Event Loop 架构对比
description: "浏览器、Node.js 和 Web Worker 的 Event Loop 架构差异对比，含微任务与宏任务处理机制"
---

# Event Loop 架构对比 - Browser vs Node.js vs Worker

> Event Loop 是 JavaScript 异步编程的核心机制。不同运行时的 Event Loop 实现存在显著差异，理解这些差异对编写高性能、跨平台的代码至关重要。

## 三大运行时对比

```mermaid
flowchart TB
    subgraph Browser
        A[调用栈] --> B[微任务队列]
        B -->|清空后| C[宏任务队列]
        C --> D[渲染帧]
        D --> A
    end
    subgraph Node.js
        E[调用栈] --> F[微任务队列]
        F -->|6个阶段| G[timers]
        G --> H[pending]
        H --> I[check/setImmediate]
        I --> E
    end
    subgraph Web Worker
        J[调用栈] --> K[微任务队列]
        K --> L[宏任务队列]
        L --> J
        M[无DOM渲染] -.-> N[无UI更新]
    end
```

## 浏览器 Event Loop

浏览器的 Event Loop 以**渲染帧**为核心驱动力：

```mermaid
sequenceDiagram
    participant 栈 as 调用栈
    participant 微 as 微任务队列
    participant 宏 as 宏任务队列
    participant 渲染 as 渲染流水线

    栈->>微: 1. 执行同步代码
    微->>微: 2. 清空所有微任务
    宏->>栈: 3. 执行一个宏任务
    渲染->>渲染: 4. 检查是否需要渲染
    Note over 渲染: 每 16.6ms (60fps)
```

### 微任务 vs 宏任务

| 类型 | 优先级 | 示例 | 触发时机 |
|------|--------|------|----------|
| **微任务** | 高 | Promise.then、queueMicrotask、MutationObserver | 当前宏任务结束后立即执行 |
| **宏任务** | 低 | setTimeout、setInterval、I/O、UI事件 | 下一轮 Event Loop |

```javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 输出: 1 → 4 → 3 → 2
```

## Node.js Event Loop

Node.js 的 Event Loop 分为**六个阶段**：

```mermaid
flowchart LR
    A[timers<br/>setTimeout] --> B[pending callbacks]
    B --> C[idle, prepare] --> D[poll<br/>I/O回调]
    D --> E[check<br/>setImmediate]
    E --> F[close callbacks]
    F --> A
```

| 阶段 | 说明 | 示例 |
|------|------|------|
| timers | 执行 setTimeout/setInterval 回调 | `setTimeout(cb, 0)` |
| pending callbacks | 执行延迟到下一轮的 I/O 回调 | TCP 错误回调 |
| idle, prepare | Node 内部使用 | - |
| poll | 检索新的 I/O 事件 | fs.readFile 回调 |
| check | 执行 setImmediate 回调 | `setImmediate(cb)` |
| close callbacks | 执行 close 事件回调 | `socket.on('close')` |

### process.nextTick 的特殊性

```javascript
// nextTick 优先级高于所有微任务
setTimeout(() => console.log('timeout'), 0);
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));

// Node.js 输出: nextTick → promise → timeout → immediate
```

## Web Worker 的 Event Loop

Web Worker 运行在独立线程中，其 Event Loop 更简洁：

```javascript
// main.js
const worker = new Worker('worker.js');
worker.postMessage(&#123; data: largeArray &#125;);
worker.onmessage = (e) => &#123;
  console.log('Result:', e.data);
&#125;;

// worker.js
self.onmessage = (e) => &#123;
  // 在独立线程中执行，不阻塞主线程
  const result = heavyComputation(e.data);
  self.postMessage(result);
&#125;;
```

| 特性 | 主线程 | Web Worker |
|------|--------|-----------|
| DOM 访问 | ✅ | ❌ |
| 全局对象 | `window` | `self` |
| 渲染更新 | ✅ | ❌ |
| 通信方式 | - | postMessage |
| Event Loop | 含渲染 | 纯任务调度 |

## 关键差异总结

```mermaid
flowchart LR
    subgraph 执行顺序差异
        A[Browser] --> B[微任务 → 宏任务 → 渲染]
        C[Node.js] --> D[timers → poll → check]
        E[Worker] --> F[微任务 → 宏任务]
    end
```

| 场景 | Browser | Node.js | Worker |
|------|---------|---------|--------|
| `setTimeout(0)` | 最小 4ms | 立即（timers阶段） | 立即 |
| `setImmediate` | 不支持 | check 阶段 | 不支持 |
| `requestAnimationFrame` | 渲染前 | 不支持 | 不支持 |
| 微任务清空时机 | 每次宏任务后 | 每个阶段之间 | 每次宏任务后 |

## 参考资源

- [执行模型导读](/fundamentals/execution-model) — 调用栈、事件循环、V8 编译管线
- [并发异步示例](/examples/concurrency-patterns/) — Web Workers、SharedArrayBuffer

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/event-loop-comparison: {os.path.getsize(f)} bytes")

# diagrams/event-loop-detailed.md
f = os.path.join(base, 'diagrams', 'event-loop-detailed.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: Event Loop 详细执行流程
description: "Event Loop 微任务与宏任务的详细时序图，含 Promise、setTimeout、requestAnimationFrame 的精确执行顺序"
---

# Event Loop 详细执行流程（时序图）

> 本图展示了 Event Loop 中同步代码、微任务、宏任务和渲染的精确执行顺序。理解这一时序对于避免竞态条件和优化性能至关重要。

## 完整时序图

```mermaid
sequenceDiagram
    autonumber
    participant 用户 as 用户交互
    participant 宏任务 as 宏任务队列
    participant 调用栈 as 调用栈
    participant 微任务 as 微任务队列
    participant 渲染 as 渲染流水线

    用户->>调用栈: 点击按钮（触发事件）
    调用栈->>调用栈: 执行事件处理函数
    Note over 调用栈: 同步代码执行中...
    调用栈->>微任务: Promise.resolve().then()
    调用栈->>宏任务: setTimeout(cb, 0)
    调用栈->>微任务: queueMicrotask()
    调用栈->>调用栈: 同步代码结束

    Note over 微任务: 微任务阶段
    微任务->>调用栈: 执行 Promise.then()
    调用栈->>微任务: 新微任务？
    微任务->>调用栈: 执行 queueMicrotask()
    Note over 微任务: 直到微任务队列为空

    宏任务->>调用栈: 执行 setTimeout 回调
    调用栈->>微任务: 新的 Promise.then()
    Note over 微任务: 再次清空微任务队列

    渲染->>渲染: requestAnimationFrame
    渲染->>渲染: 样式计算
    渲染->>渲染: 布局（Layout）
    渲染->>渲染: 绘制（Paint）
    渲染->>渲染: 合成（Composite）
    Note over 渲染: 每 16.6ms（60fps）
```

## 典型代码执行分析

```javascript
console.log('1. 同步');

setTimeout(() => &#123;
  console.log('2. 宏任务1');
  Promise.resolve().then(() => console.log('3. 微任务1内的微任务'));
&#125;, 0);

Promise.resolve().then(() => &#123;
  console.log('4. 微任务1');
  setTimeout(() => console.log('5. 微任务内的宏任务'), 0);
&#125;);

queueMicrotask(() => console.log('6. queueMicrotask'));

requestAnimationFrame(() => console.log('7. rAF'));

console.log('8. 同步结束');

// 执行顺序：
// 1. 同步
// 8. 同步结束
// 4. 微任务1
// 6. queueMicrotask
// 2. 宏任务1
// 3. 微任务1内的微任务
// 7. rAF（在下一帧）
// 5. 微任务内的宏任务
```

## 微任务的级联执行

```mermaid
flowchart TD
    A[开始执行宏任务] --> B[同步代码执行]
    B --> C&#123;微任务队列为空?&#125;
    C -->|否| D[取出所有微任务]
    D --> E[依次执行]
    E --> F&#123;执行中产生新微任务?&#125;
    F -->|是| C
    F -->|否| G[微任务阶段结束]
    G --> H[下一宏任务]
```

**关键规则**：微任务阶段会一直执行直到微任务队列完全为空，包括新产生的微任务。

```javascript
// 微任务级联示例
let count = 0;
function scheduleMicrotasks() &#123;
  if (count &lt; 5) &#123;
    count++;
    Promise.resolve().then(() => &#123;
      console.log(`微任务 $&#123;count&#125;`);
      scheduleMicrotasks(); // 产生新微任务
    &#125;);
  &#125;
&#125;
scheduleMicrotasks();
// 输出：微任务 1 → 微任务 2 → ... → 微任务 5（连续执行）
```

## 常见陷阱

### 陷阱1：微任务阻塞渲染

```javascript
// 危险！微任务过多会阻塞渲染
function blockRender() &#123;
  for (let i = 0; i &lt; 10000; i++) &#123;
    Promise.resolve().then(() => &#123;
      // 大量微任务
    &#125;);
  &#125;
&#125;
// 渲染会延迟，导致卡顿
```

### 陷阱2：Promise 与 setTimeout 的竞态

```javascript
// 看似同时，实则微任务先执行
setTimeout(() => console.log('timeout'), 0);
Promise.resolve().then(() => console.log('promise'));
// 输出：promise → timeout
```

### 陷阱3：async/await 的本质

```javascript
async function example() &#123;
  console.log('A');
  await Promise.resolve(); // 后续代码变为微任务
  console.log('B'); // 微任务中执行
&#125;

example();
console.log('C');
// 输出：A → C → B
```

## 性能优化建议

| 场景 | 推荐方案 | 避免 |
|------|----------|------|
| 需要下一帧执行 | `requestAnimationFrame` | `setTimeout(fn, 0)` |
| 异步初始化 | `queueMicrotask` | 同步阻塞 |
| 批量DOM更新 | `requestAnimationFrame` + `DocumentFragment` | 多次微任务修改DOM |
| 延迟执行 | `setTimeout` / `requestIdleCallback` | 大量微任务排队 |

## 参考资源

- [执行模型导读](/fundamentals/execution-model) — 事件循环的底层原理
- [并发异步专题](/examples/concurrency-patterns/) — Web Workers 与多线程

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/event-loop-detailed: {os.path.getsize(f)} bytes")

print('Diagrams batch 1 done')

# diagrams/gradual-typing-lattice.md
f = os.path.join(base, 'diagrams', 'gradual-typing-lattice.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: 渐进类型系统精度格
description: "展示从动态类型到静态类型的渐进类型系统精度格，含 TypeScript 的类型层级与 soundness 边界"
---

# 渐进类型系统精度格 (Gradual Typing Lattice)

> 渐进类型（Gradual Typing）允许开发者在动态类型和静态类型之间平滑过渡。TypeScript 是最成功的渐进类型系统实现之一。

## 类型系统精度格

```mermaid
flowchart BT
    %% 顶部：完全动态
    A[any] --> B[unknown]

    %% 中间层：渐进类型
    B --> C[string | number | boolean]
    B --> D[object]
    B --> E[void]

    %% 更精确的类型
    C --> F[string]
    C --> G[number]
    C --> H[boolean]
    C --> I[literal 'hello']
    C --> J[literal 42]

    D --> K[&#123; name: string &#125;]
    D --> L[Array&lt;T&gt;]
    D --> M[Function]

    K --> N[&#123; name: 'Alice' &#125;]

    %% 底部：never
    F --> O[never]
    G --> O
    H --> O
    I --> O
    J --> O
    N --> O
    L --> O
    M --> O
    E --> O

    style A fill:#ff6b6b,color:#fff
    style O fill:#4ecdc4,color:#fff
```

## 渐进类型的核心思想

```mermaid
flowchart LR
    subgraph 动态类型
        A[JavaScript] --> B[运行时检查]
        B --> C[运行时错误]
    end
    subgraph 渐进类型
        D[TypeScript] --> E[编译时检查]
        E -->|部分| F[类型安全]
        E -->|部分| G[any类型]
    end
    subgraph 静态类型
        H[Java/Haskell] --> I[编译时检查]
        I --> J[完全类型安全]
    end
```

| 特性 | 动态类型 (JS) | 渐进类型 (TS) | 静态类型 (Java) |
|------|--------------|--------------|----------------|
| 类型检查时机 | 运行时 | 编译时 | 编译时 |
| 类型错误发现 | 运行时报错 | 编译时报错 | 编译时报错 |
| 迁移成本 | 无 | 低（可渐进） | 高（需重写） |
| 类型精度 | 无 | 可调 | 高 |
| 运行时开销 | 可能有检查 | 零（擦除） | 零或低 |

## TypeScript 的类型层级

```typescript
// 最宽松的类型：any
let anything: any = 4;
anything = 'string'; // ✅
anything.toFixed();  // ✅ 编译通过，运行时可能报错

// 安全的顶级类型：unknown
let unknownValue: unknown = 4;
unknownValue.toFixed(); // ❌ 编译错误
if (typeof unknownValue === 'number') &#123;
  unknownValue.toFixed(); // ✅ 类型收窄后安全
&#125;

// 最严格的类型：never
function throwError(): never &#123;
  throw new Error('error');
&#125;
```

## Soundness 与 Completeness 的权衡

```mermaid
flowchart LR
    A[Soundness<br/>类型正确] --> B[误报多]
    C[Completeness<br/>接受所有正确程序] --> D[漏报多]
    E[TypeScript选择] -->|平衡| F[实用主义]
    F --> G[常见错误捕获]
    F --> H[any 逃生舱]
```

TypeScript 的设计哲学是**实用性优先于 soundness**：

```typescript
// 不 sound 但实用的例子
const arr: any[] = [1, 'two', 3];
const numbers: number[] = arr as number[]; // 编译通过，运行时不安全
// TypeScript 允许 as 断言，因为这是有用的逃生舱
```

## 参考资源

- [类型系统导读](/fundamentals/type-system) — 结构类型、泛型、变型
- [10-fundamentals/10.2-type-system](/fundamentals/type-system) — 渐进类型理论深度解析

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/gradual-typing-lattice: {os.path.getsize(f)} bytes")

# diagrams/js-execution-model.md
f = os.path.join(base, 'diagrams', 'js-execution-model.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: JavaScript 执行模型与 ECMA-262 规范对应
description: "JavaScript 代码执行到引擎实现的完整映射，含执行上下文、环境记录与 Realm 的关系"
---

# JavaScript 执行模型与 ECMA-262 规范对应

> 本文档将 JavaScript 代码的执行流程与 ECMA-262 规范中的抽象概念进行映射，帮助理解代码在引擎中的实际运行方式。

## 执行模型全景

```mermaid
flowchart TB
    subgraph 规范层 ECMA-262
        A[执行上下文<br/>Execution Context] --> B[词法环境<br/>Lexical Environment]
        B --> C[环境记录<br/>Environment Record]
        C --> D[声明性记录<br/>Declarative ER]
        C --> E[对象性记录<br/>Object ER]
        A --> F[Realm]
        F --> G[全局对象]
        F --> H[内部库]
    end
    subgraph 实现层 V8
        I[调用栈] --> J[栈帧]
        J --> K[局部变量]
        J --> L[this指针]
        M[堆] --> N[闭包变量]
        M --> O[对象与原型]
    end
    A -.->|实现| I
    C -.->|实现| K
    F -.->|实现| O
```

## 执行上下文栈

```mermaid
flowchart TB
    subgraph 调用栈
        A[全局执行上下文] --> B[foo()]
        B --> C[bar()]
        C --> D[baz()]
    end
    subgraph 每个上下文的组成
        E[词法环境] --> F[变量环境]
        E --> G[this绑定]
        F --> H[环境记录]
        H --> I[Outer引用]
    end
```

### 执行上下文的创建过程

```javascript
// 代码执行前的准备阶段
function example() &#123;
  let local = 1;      // 在词法环境中创建绑定
  const fixed = 2;    // 创建不可变绑定
  function inner() &#123;&#125; // 创建函数对象并初始化
&#125;

// 执行上下文的三个阶段：
// 1. 创建阶段：建立词法环境，提升变量/函数声明
// 2. 执行阶段：逐行执行代码
// 3. 销毁阶段：弹出调用栈（闭包变量保留在堆中）
```

## Realm 与全局对象

Realm 是 ECMA-262 中的独立执行环境，每个 Realm 有自己的全局对象：

```mermaid
flowchart LR
    subgraph Realm A
        A1[windowA] --> A2[ArrayA]
        A1 --> A3[JSONA]
    end
    subgraph Realm B
        B1[windowB] --> B2[ArrayB]
        B1 --> B3[JSONB]
    end
    A2 -.x.-> B2
    A1 -.->|iframe| B1
```

```javascript
// 不同 Realm 的数组构造函数不同
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);

const iframeArray = iframe.contentWindow.Array;
console.log(Array === iframeArray); // false

const arr = [];
console.log(arr instanceof Array); // true
console.log(arr instanceof iframeArray); // false
```

## 闭包的规范解释

```mermaid
flowchart TB
    subgraph 闭包机制
        A[外部函数] --> B[创建环境记录]
        B --> C[内部函数]
        C --> D[引用外部变量]
        D --> E[环境记录保留在堆中]
        F[外部函数返回] --> G[调用栈弹出]
        G -.->|但| E
    end
```

```javascript
function createCounter() &#123;
  let count = 0; // 环境记录中的绑定
  return &#123;
    increment: () => ++count,
    getValue: () => count,
  &#125;;
&#125;

const counter = createCounter();
// createCounter 的执行上下文已弹出，但环境记录被闭包引用保留
```

## 参考资源

- [执行模型导读](/fundamentals/execution-model) — V8 引擎架构深度解析
- [ECMAScript 规范导读](/fundamentals/ecmascript-spec) — 抽象操作与完成记录

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/js-execution-model: {os.path.getsize(f)} bytes")

# diagrams/module-resolution-flow.md
f = os.path.join(base, 'diagrams', 'module-resolution-flow.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: ESM/CJS 模块解析与互操作流程
description: "ESM 与 CommonJS 模块解析算法的详细流程图，含 Node.js 模块路径查找与互操作机制"
---

# ESM/CJS 模块解析与互操作流程

> 模块解析是 JavaScript 工程化的核心机制。本文档详细展示 Node.js 中 ESM 和 CJS 的模块解析算法，以及两种模块系统的互操作方案。

## 模块解析算法对比

```mermaid
flowchart TD
    subgraph ESM解析
        A[import 'x'] --> B&#123;URL格式?&#125;
        B -->|是| C[直接加载]
        B -->|否| D[裸导入]
        D --> E[node_modules查找]
        E --> F[package.json exports]
        F --> G[条件导出解析]
        G --> H[加载目标文件]
    end
    subgraph CJS解析
        I[require'x'] --> J&#123;核心模块?&#125;
        J -->|是| K[加载核心模块]
        J -->|否| L&#123;以./或../开头?&#125;
        L -->|是| M[相对路径解析]
        M --> N[.js/.json/.node]
        L -->|否| O[node_modules查找]
        O --> P[逐层向上遍历]
        P --> Q[解析main字段]
    end
```

## ESM 模块解析

### 裸导入解析流程

```mermaid
flowchart LR
    A[import 'lodash'] --> B[node_modules/lodash/package.json]
    B --> C&#123;exports字段?&#125;
    C -->|是| D[条件导出匹配]
    C -->|否| E[main字段]
    D --> F[import/require条件]
    F --> G[types条件]
    G --> H[加载目标文件]
```

```json
// 条件导出示例
&#123;
  "exports": &#123;
    ".": &#123;
      "import": &#123;
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      &#125;,
      "require": &#123;
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      &#125;
    &#125;,
    "./package.json": "./package.json"
  &#125;
&#125;
```

## CJS 模块解析

### require() 的完整路径

```mermaid
flowchart TD
    A[require'module'] --> B[核心模块?]
    B -->|是| C[返回核心模块]
    B -->|否| D[路径以/开头?]
    D -->|是| E[绝对路径]
    D -->|否| F[路径以./或../开头?]
    F -->|是| G[相对路径解析]
    G --> H[添加.js/.json/.node]
    F -->|否| I[node_modules查找]
    I --> J[当前目录/node_modules]
    J --> K[父目录/node_modules]
    K --> L[/node_modules]
    L --> M[解析package.json]
```

### 文件扩展名解析

```javascript
// require('./module') 的查找顺序：
// 1. ./module.js
// 2. ./module.json
// 3. ./module.node
// 4. ./module/index.js
// 5. ./module/index.json
// 6. ./module/index.node
```

## ESM/CJS 互操作

### Node.js 互操作规则

```mermaid
flowchart LR
    subgraph ESM导入CJS
        A[import foo from 'cjs'] --> B[获取module.exports]
        B --> C[作为默认导出]
        A --> D[import &#123; named &#125;] --> E[获取exports.xxx]
    end
    subgraph CJS导入ESM
        F[require'esm'] --> G[❌ 错误]
        F --> H[await import'esm'] --> I[✅ 动态导入]
    end
```

| 方向 | 语法 | 结果 | 说明 |
|------|------|------|------|
| ESM → CJS | `import def from 'cjs'` | `module.exports` | 作为默认导出 |
| ESM → CJS | `import &#123; named &#125; from 'cjs'` | `exports.named` | Node 14+ 支持 |
| CJS → ESM | `require('esm')` | ❌ 错误 | CJS 不能同步 require ESM |
| CJS → ESM | `await import('esm')` | ✅ 正常 | 动态 import 可用 |

### 双模式包的最佳实践

```json
&#123;
  "name": "my-lib",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": &#123;
    ".": &#123;
      "import": &#123;
        "types": "./dist/index.d.mts",
        "default": "./dist/index.mjs"
      &#125;,
      "require": &#123;
        "types": "./dist/index.d.cts",
        "default": "./dist/index.cjs"
      &#125;
    &#125;
  &#125;
&#125;
```

## 参考资源

- [模块系统导读](/fundamentals/module-system) — ESM/CJS 核心机制深度解析
- [模块系统专题](/module-system/) — 完整专题（8篇深度文档）

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/module-resolution-flow: {os.path.getsize(f)} bytes")

# diagrams/project-knowledge-graph.md
f = os.path.join(base, 'diagrams', 'project-knowledge-graph.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: JavaScript/TypeScript 全景知识库
description: "Awesome JS/TS Ecosystem 项目的知识图谱，展示各专题间的关联关系与学习路径"
---

# JavaScript/TypeScript 全景知识库 - 项目知识图谱

> 本项目构建了一个完整的 JavaScript/TypeScript 学习与知识体系。本图谱展示了各专题间的关联关系，帮助学习者规划最优学习路径。

## 知识图谱总览

```mermaid
mindmap
  root((JS/TS<br/>知识体系))
    语言基础
      语言语义
      类型系统
      执行模型
      模块系统
      对象模型
      ECMAScript规范
    工程实践
      构建工具
      测试工程
      性能工程
      安全合规
      DevOps
    前端框架
      React生态
      Vue生态
      Svelte/Solid
      状态管理
    后端与API
      Node.js
      API设计
      数据库ORM
      微服务
    前沿技术
      WebAssembly
      AI/ML推理
      边缘计算
      Rust工具链
    理论基础
      范畴论
      类型论
      认知科学
```

## 核心学习路径

```mermaid
flowchart LR
    subgraph 基础路径
        A[语言语义] --> B[类型系统]
        B --> C[执行模型]
        C --> D[模块系统]
    end
    subgraph 工程路径
        E[构建工具] --> F[测试工程]
        F --> G[性能工程]
        G --> H[DevOps]
    end
    subgraph 进阶路径
        I[设计模式] --> J[架构模式]
        J --> K[微服务]
        K --> L[边缘计算]
    end
    D --> E
    H --> I
```

## 专题关联矩阵

| 专题 | 前置知识 | 关联专题 | 难度 |
|------|----------|----------|------|
| 语言语义 | 无 | 类型系统、执行模型 | 🌱 初级 |
| 类型系统 | 语言语义 | 执行模型、对象模型 | 🌿 中级 |
| 执行模型 | 语言语义 | 性能工程、内存模型 | 🌿 中级 |
| 模块系统 | 语言语义 | DevOps、微服务 | 🌿 中级 |
| 状态管理 | 前端框架 | 设计模式、性能工程 | 🌿 中级 |
| 微服务 | 模块系统、API设计 | DevOps、数据库 | 🍂 高级 |
| WebAssembly | 执行模型、性能工程 | 边缘计算、Rust | 🍂 高级 |
| 范畴论 | 类型系统 | 函数式编程 | 🍁 专家 |

## 项目结构导航

```mermaid
flowchart TB
    subgraph 源码目录
        A[10-fundamentals] --> B[语言核心文档]
        C[20-code-lab] --> D[动手实验]
        E[30-knowledge-base] --> F[知识体系]
        G[50-examples] --> H[实战示例]
        I[70-theoretical-foundations] --> J[理论前沿]
    end
    subgraph 网站
        K[website/] --> L[VitePress站点]
        L --> M[指南与示例]
    end
    B --> L
    D --> L
    F --> L
    H --> L
    J --> L
```

## 参考资源

- [项目首页](/) — 完整知识体系列表
- [理论前沿](/theoretical-foundations/) — 36篇理论摘要
- [代码实验室](/code-lab/) — 动手实验集合

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/project-knowledge-graph: {os.path.getsize(f)} bytes")

# diagrams/promise-state-machine.md
f = os.path.join(base, 'diagrams', 'promise-state-machine.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: Promise 状态机转换图
description: "Promise 的三种状态转换机制，含 then/catch/finally 的调用流程与错误传播规则"
---

# Promise 状态机转换图

> Promise 是 JavaScript 异步编程的核心抽象。理解其状态机模型对于编写可靠的异步代码至关重要。

## Promise 状态机

```mermaid
stateDiagram-v2
    [*] --> Pending: new Promise()
    Pending --> Fulfilled: resolve(value)
    Pending --> Rejected: reject(reason)
    Fulfilled --> [*]
    Rejected --> [*]
    note right of Pending
        初始状态
        可以转换为
        Fulfilled 或 Rejected
    end note
    note right of Fulfilled
        终态
        不可再次改变
    end note
    note right of Rejected
        终态
        不可再次改变
    end note
```

## then/catch 的调用链

```mermaid
flowchart LR
    A[Promise.resolve1] --> B[.then]
    B --> C[返回值x]
    C --> D[.then]
    D --> E[抛出错误]
    E --> F[.catch]
    F --> G[恢复]
    G --> H[.finally]
    H --> I[Promise.resolve2]
```

## 关键规则

### 规则1：状态不可变

```javascript
const p = new Promise((resolve, reject) => &#123;
  resolve('first');
  resolve('second'); // 被忽略，状态已确定
  reject('error');   // 被忽略
&#125;);

p.then(v => console.log(v)); // 输出: first
```

### 规则2：then 返回新 Promise

```javascript
const p1 = Promise.resolve(1);
const p2 = p1.then(v => v * 2);

console.log(p1 === p2); // false，总是返回新 Promise
```

### 规则3：错误传播

```javascript
Promise.resolve()
  .then(() => &#123; throw new Error('A'); &#125;)
  .then(() => console.log('B'))  // 跳过
  .catch(e => console.log(e))     // 捕获: Error A
  .then(() => console.log('C'));  // 继续执行: C
```

## Promise 组合

```mermaid
flowchart TB
    subgraph Promise.all
        A[p1] --> D[全部成功]
        B[p2] --> D
        C[p3] --> D
        E[任一失败] --> F[整体失败]
    end
    subgraph Promise.race
        G[p1] --> H[最先 settled]
        I[p2] --> H
    end
    subgraph Promise.allSettled
        J[p1] --> K[等待全部完成]
        L[p2] --> K
        K --> L[返回所有结果]
    end
```

| 方法 | 成功条件 | 失败条件 | 返回值 |
|------|----------|----------|--------|
| `Promise.all` | 全部 resolve | 任一 reject | 结果数组 |
| `Promise.race` | 最先 settle | 最先 reject | 单个结果 |
| `Promise.allSettled` | 全部完成 | 不会失败 | 状态对象数组 |
| `Promise.any` | 任一 resolve | 全部 reject | 单个结果 |

## async/await 的本质

```mermaid
flowchart LR
    A[async function] --> B[返回 Promise]
    C[await expr] --> D[暂停执行]
    D --> E[expr resolve]
    E --> F[恢复执行]
```

```javascript
// async/await 是 Promise 的语法糖
async function example() &#123;
  const result = await fetch('/api'); // 等待 Promise resolve
  return result.json();               // 自动包装为 Promise
&#125;

// 等价于：
function example() &#123;
  return fetch('/api')
    .then(result => result.json());
&#125;
```

## 参考资源

- [并发异步专题](/examples/concurrency-patterns/) — Web Workers、SharedArrayBuffer
- [执行模型导读](/fundamentals/execution-model) — 事件循环与异步机制

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/promise-state-machine: {os.path.getsize(f)} bytes")

# diagrams/type-system-hierarchy.md
f = os.path.join(base, 'diagrams', 'type-system-hierarchy.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: TypeScript 类型系统层次结构
description: "TypeScript 类型系统的完整层次结构，从原始类型到高级类型编程的演进路径"
---

# TypeScript 类型系统层次结构

> TypeScript 的类型系统是一个图灵完备的静态类型语言。理解其层次结构有助于掌握从基础到高级的类型编程技术。

## 类型层次结构

```mermaid
flowchart BT
    %% 底层
    never

    %% 字面量类型
    literal42["literal 42"] --> number
    literalHello["literal 'hello'"] --> string
    literalTrue["literal true"] --> boolean

    %% 原始类型
    number --> Primitive
    string --> Primitive
    boolean --> Primitive
    symbol --> Primitive
    bigint --> Primitive
    undefined --> Primitive
    null --> Primitive

    %% 复合类型
    Primitive --> Object
    Array --> Object
    Function --> Object
    Tuple --> Array

    %% 联合与交叉
    stringOrNumber["string | number"] --> union
    nameAndAge["&#123;name&#125; & &#123;age&#125;"] --> intersection

    %% 泛型
    T --> Generic
    ArrayT["Array&lt;T&gt;"] --> Generic
    PromiseT["Promise&lt;T&gt;"] --> Generic

    %% 条件类型
    ExtendsT["T extends U ? X : Y"] --> Conditional

    %% 映射类型
    ReadonlyT["Readonly&lt;T&gt;"] --> Mapped
    PartialT["Partial&lt;T&gt;"] --> Mapped

    %% 顶层类型
    Object --> unknown
    union --> unknown
    intersection --> unknown
    Generic --> unknown
    Conditional --> unknown
    Mapped --> unknown
    unknown --> any
```

## 类型层级速查

| 层级 | 类型 | 说明 |
|------|------|------|
| **顶层** | `unknown` | 安全的顶级类型 |
| **顶层** | `any` | 关闭类型检查 |
| **原始** | `string/number/boolean` | 基本数据类型 |
| **复合** | `object/Array/Function` | 引用类型 |
| **泛型** | `Array&lt;T&gt;/Promise&lt;T&gt;` | 参数化类型 |
| **条件** | `T extends U ? X : Y` | 类型级三元运算 |
| **映射** | `&#123;[K in T]: V&#125;` | 遍历属性键 |
| **底层** | `never` | 空集/不可达 |

## 类型兼容性

```typescript
// 协变（Covariant）：子类型可赋值给父类型
let animal: Animal = new Dog(); // ✅

// 逆变（Contravariant）：函数参数
let f1: (x: Animal) => void = (x: Dog) => &#123;&#125;; // ❌
let f2: (x: Dog) => void = (x: Animal) => &#123;&#125;; // ✅

// 双向协变（Bivariant）：TypeScript 配置项
// strictFunctionTypes: true 时禁用双向协变
```

## 类型工具进阶

```typescript
// 递归类型
type DeepReadonly&lt;T&gt; = &#123;
  readonly [K in keyof T]: T[K] extends object
    ? DeepReadonly&lt;T[K]&gt;
    : T[K];
&#125;;

// 模板字面量类型
type EventName&lt;T extends string&gt; = `on$&#123;Capitalize&lt;T&gt;&#125;`;
// EventName<'click'> = 'onClick'

// 类型级编程：斐波那契
type Fibonacci&lt;N extends number&gt; = /* ... */;
```

## 参考资源

- [类型系统导读](/fundamentals/type-system) — 结构类型、泛型、变型
- [TypeScript 类型系统专题](/typescript-type-system/) — 19篇深度文档

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/type-system-hierarchy: {os.path.getsize(f)} bytes")

# diagrams/typescript-compiler-architecture.md
f = os.path.join(base, 'diagrams', 'typescript-compiler-architecture.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: TypeScript 编译器架构
description: "TypeScript 编译器的内部架构：扫描器、解析器、绑定器、检查器与发射器的完整流程"
---

# TypeScript 编译器架构

> TypeScript 编译器（tsc）是一个功能丰富的转译器和类型检查器。理解其内部架构有助于诊断复杂的类型问题和优化编译性能。

## 编译器管线

```mermaid
flowchart LR
    A[源码 .ts] --> B[Scanner<br/>扫描器]
    B --> C[Token Stream]
    C --> D[Parser<br/>解析器]
    D --> E[AST]
    E --> F[Binder<br/>绑定器]
    F --> G[Symbol Table]
    E --> H[Checker<br/>类型检查器]
    H --> I[Type Information]
    E --> J[Emitter<br/>发射器]
    J --> K[.js 输出]
    J --> L[.d.ts 输出]
```

## 各阶段详解

### 1. Scanner（扫描器）

将源代码字符流转换为 Token 序列：

```typescript
// 源码
const x: number = 42;

// Token 序列
// [ConstKeyword, Identifier, Colon, NumberKeyword, Equals, NumericLiteral(42), Semicolon]
```

### 2. Parser（解析器）

将 Token 序列构建为抽象语法树（AST）：

```mermaid
flowchart TD
    A[SourceFile] --> B[VariableStatement]
    B --> C[VariableDeclarationList]
    C --> D[VariableDeclaration]
    D --> E[Identifier 'x']
    D --> F[TypeAnnotation]
    F --> G[NumberKeyword]
    D --> H[NumericLiteral 42]
```

### 3. Binder（绑定器）

建立标识符与声明之间的符号表：

```typescript
// 创建 Symbol
const symbol = createSymbol(/*flags*/ SymbolFlags.Variable, 'x');

// 建立作用域链
// 全局作用域 → 模块作用域 → 函数作用域 → 块级作用域
```

### 4. Checker（类型检查器）

核心类型检查逻辑：

```mermaid
flowchart TD
    A[类型检查] --> B[类型推断]
    A --> C[类型兼容性检查]
    A --> D[控制流分析]
    B --> E[变量初始化推断]
    B --> F[函数返回类型推断]
    C --> G[结构子类型检查]
    D --> H[类型收窄]
    D --> I[可达性分析]
```

### 5. Emitter（发射器）

生成输出文件：

```mermaid
flowchart LR
    A[AST] --> B[Transformer]
    B --> C[降级ES5/ES6]
    C --> D[Printer]
    D --> E[.js 文件]
    D --> F[.d.ts 文件]
    D --> G[Source Map]
```

## TSConfig 配置对编译器的影响

```mermaid
flowchart TB
    A[tsconfig.json] --> B[compilerOptions]
    B --> C[target]
    B --> D[module]
    B --> E[strict]
    C --> F[降级级别]
    D --> G[模块格式]
    E --> H[严格检查]
```

| 配置项 | 影响阶段 | 说明 |
|--------|----------|------|
| `target` | Emitter | 输出 JavaScript 版本 |
| `module` | Emitter | 模块系统格式 |
| `strict` | Checker | 启用所有严格类型检查 |
| `noEmit` | Emitter | 跳过文件生成 |
| `declaration` | Emitter | 生成 .d.ts 文件 |

## 编译性能优化

```mermaid
flowchart LR
    A[大项目编译慢] --> B[增量编译]
    A --> C[项目引用]
    A --> D[skipLibCheck]
    B --> E[仅编译修改的文件]
    C --> F[并行编译子项目]
    D --> G[跳过node_modules检查]
```

```json
// tsconfig.json 性能优化
&#123;
  "compilerOptions": &#123;
    "incremental": true,
    "tsBuildInfoFile": "./.tsbuildinfo",
    "skipLibCheck": true,
    "composite": true
  &#125;
&#125;
```

## 参考资源

- [类型系统导读](/fundamentals/type-system) — TypeScript 类型理论基础
- [TSGo 原生编译器](/fundamentals/academic-frontiers) — TypeScript 编译器重写计划

---

 [← 返回架构图首页](./)
""")
print(f"diagrams/typescript-compiler-architecture: {os.path.getsize(f)} bytes")

print('Diagrams batch done')

# ============================================================
# 5. patterns/vue-patterns.md 扩充
# ============================================================
f = os.path.join(base, 'patterns', 'vue-patterns.md')
with open(f, 'w', encoding='utf-8') as fh:
    fh.write("""---
title: Vue 设计模式与最佳实践
description: "Vue.js 生态系统中的核心设计模式：组合式函数、状态管理、渲染优化与架构模式"
---

# Vue 设计模式与最佳实践

> Vue 3 的组合式 API（Composition API）彻底改变了 Vue 应用的开发方式。本文档系统梳理 Vue 生态中的核心设计模式，从组合式函数到大型应用架构的最佳实践。

## Vue 3 核心架构

```mermaid
flowchart TB
    subgraph 响应式系统
        A[ref/reactive] --> B[Proxy拦截]
        B --> C[依赖收集]
        C --> D[ effect 调度]
        D --> E[DOM更新]
    end
    subgraph 组件系统
        F[Options API] --> G[Composition API]
        G --> H[组合式函数]
        H --> I[逻辑复用]
    end
    subgraph 编译器
        J[模板] --> K[编译器]
        K --> L[渲染函数]
        L --> M[虚拟DOM]
    end
```

## 组合式函数模式 (Composables)

组合式函数是 Vue 3 中逻辑复用的核心机制：

```typescript
// useFetch.ts — 数据获取组合式函数
import &#123; ref, watchEffect &#125; from 'vue';

export function useFetch&lt;T&gt;(url: string) &#123;
  const data = ref&lt;T | null&gt;(null);
  const error = ref&lt;Error | null&gt;(null);
  const loading = ref(false);

  watchEffect(async () => &#123;
    loading.value = true;
    error.value = null;

    try &#123;
      const response = await fetch(url);
      data.value = await response.json();
    &#125; catch (e) &#123;
      error.value = e as Error;
    &#125; finally &#123;
      loading.value = false;
    &#125;
  &#125;);

  return &#123; data, error, loading &#125;;
&#125;

// 组件中使用
const &#123; data: users, loading &#125; = useFetch&lt;User[]&gt;('/api/users');
```

### 组合式函数最佳实践

| 规则 | 说明 | 示例 |
|------|------|------|
| 命名约定 | 以 `use` 开头 | `useAuth`、`useLocalStorage` |
| 参数处理 | 接受 ref 或原始值 | `useFeature(maybeRef)` |
| 副作用管理 | 在 onUnmounted 中清理 | `addEventListener` → `removeEventListener` |
| 返回值 | 返回对象，便于解构 | `return &#123; data, error &#125;` |

## 状态管理模式

### Pinia（推荐）

```typescript
// stores/counter.ts
import &#123; defineStore &#125; from 'pinia';
import &#123; ref, computed &#125; from 'vue';

export const useCounterStore = defineStore('counter', () => &#123;
  // State
  const count = ref(0);

  // Getters
  const doubleCount = computed(() => count.value * 2);

  // Actions
  function increment() &#123;
    count.value++;
  &#125;

  function decrement() &#123;
    count.value--;
  &#125;

  return &#123; count, doubleCount, increment, decrement &#125;;
&#125;);

// 组件中使用
import &#123; useCounterStore &#125; from '@/stores/counter';
const counter = useCounterStore();
```

### 组件间通信模式

```mermaid
flowchart LR
    subgraph 父子通信
        A[Props] --> B[Events]
        C[v-model] --> D[双向绑定]
    end
    subgraph 跨层级通信
        E[Provide/Inject] --> F[依赖注入]
        G[Pinia] --> H[全局状态]
    end
    subgraph 特殊场景
        I[Template Refs] --> J[直接访问]
        K[Event Bus] --> L[ mitt.js ]
    end
```

## 渲染优化模式

### v-memo 控制渲染

```vue
&lt;template&gt;
  &lt;div v-memo="[item.id, item.status]"&gt;
    &lt;!-- 仅当 id 或 status 变化时重新渲染 --&gt;
    &lt;HeavyComponent :data="item" /&gt;
  &lt;/div&gt;
&lt;/template&gt;
```

### 虚拟列表

```vue
&lt;script setup&gt;
import &#123; computed, ref &#125; from 'vue';

const items = ref(Array.from(&#123; length: 10000 &#125;, (_, i) => (&#123; id: i, text: `Item $&#123;i&#125;` &#125;)));
const itemHeight = 50;
const containerHeight = 400;
const visibleCount = Math.ceil(containerHeight / itemHeight);

const scrollTop = ref(0);
const startIndex = computed(() => Math.floor(scrollTop.value / itemHeight));
const visibleItems = computed(() =>
  items.value.slice(startIndex.value, startIndex.value + visibleCount + 1)
);
&lt;/script&gt;

&lt;template&gt;
  &lt;div class="viewport" @scroll="scrollTop = $event.target.scrollTop"&gt;
    &lt;div :style="&#123; height: items.length * itemHeight + 'px' &#125;"&gt;
      &lt;div
        v-for="item in visibleItems"
        :key="item.id"
        :style="&#123;
          transform: `translateY($&#123;startIndex * itemHeight&#125;px)`,
          height: itemHeight + 'px'
        &#125;"
      &gt;
        &#123;&#123; item.text &#125;&#125;
      &lt;/div&gt;
    &lt;/div&gt;
  &lt;/div&gt;
&lt;/template&gt;
```

## 大型应用架构

```mermaid
flowchart TB
    subgraph 应用层
        A[App.vue] --> B[路由视图]
    end
    subgraph 页面层
        B --> C[Page Components]
    end
    subgraph 组件层
        C --> D[业务组件]
        D --> E[基础组件]
    end
    subgraph 逻辑层
        F[Composables] --> G[API Clients]
        F --> H[Store]
    end
    subgraph 基础设施
        I[Router] --> J[Guards]
        K[HTTP Client] --> L[Interceptors]
    end
```

| 层级 | 职责 | 示例 |
|------|------|------|
| 应用层 | 全局布局、路由入口 | `App.vue`、`layouts/` |
| 页面层 | 路由对应的页面组件 | `views/`、`pages/` |
| 组件层 | 可复用的 UI 组件 | `components/` |
| 逻辑层 | 业务逻辑、状态管理 | `composables/`、`stores/` |
| 基础设施 | 工具、配置、常量 | `utils/`、`constants/` |

## 参考资源

| 资源 | 链接 |
|------|------|
| Vue 官方文档 | https://vuejs.org |
| Pinia 文档 | https://pinia.vuejs.org |
| VueUse | https://vueuse.org |

---

 [← 返回首页](/)
""")
print(f"patterns/vue-patterns: {os.path.getsize(f)} bytes")

print('All enrichment done!')
