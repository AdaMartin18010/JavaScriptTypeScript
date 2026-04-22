# JavaScript/TypeScript 语言核心深度解析

> **目标读者**：所有 JS/TS 开发者，从初级到高级
> **关联文档**：[`jsts-language-core-system/`](../../jsts-language-core-system/)
> **版本**：2026-04
> **字数**：约 3,500 字

---

## 1. JS/TS 语言核心概览

### 1.1 JavaScript 的本质

JavaScript 是一门**多范式、动态类型、基于原型**的编程语言。它的核心设计哲学：

1. **简单性**：10 天内设计完成，语法借鉴 C/Java
2. **灵活性**：弱类型、隐式转换、一等函数
3. **嵌入性**：为浏览器而生，与宿主环境深度集成

### 1.2 TypeScript 的增量

TypeScript = JavaScript + 静态类型系统 + 现代工具链

**不是新语言，是 JS 的超集**。所有 JS 代码都是合法的 TS 代码（配置允许时）。

```typescript
// TypeScript 的增量价值在大型代码库中显现
interface User {
  id: number;
  name: string;
}

// 编译时捕获错误，而非运行时
function greet(user: User) {
  return `Hello, ${user.name}`;
}

greet({ id: 1, name: 'Alice' }); // ✅
greet({ id: 1 });                // ❌ TS 错误: 缺少 name
```

---

## 2. 类型系统核心概念

### 2.1 结构类型 vs 名义类型

```typescript
// TypeScript: 结构类型（鸭子类型）
interface Point { x: number; y: number; }
interface Vector { x: number; y: number; }

const p: Point = { x: 1, y: 2 };
const v: Vector = p; // ✅ 结构相同即可赋值
```

```java
// Java/C#: 名义类型
class Point { int x, y; }
class Vector { int x, y; }

Point p = new Point();
Vector v = p; // ❌ 编译错误：类型不兼容
```

**影响**：TS 的类型兼容性基于形状而非名称，这使得接口组合极为灵活。

### 2.2 型变（Variance）

| 型变 | 含义 | 示例 |
|------|------|------|
| **协变** | 子类型可赋值给父类型 | `Cat[]` → `Animal[]` |
| **逆变** | 父类型可赋值给子类型 | `(Animal) => void` → `(Cat) => void` |
| **双变** | 同时协变和逆变 | 旧 TS 函数的参数 |
| **不变** | 必须完全匹配 | `Array<Cat>` vs `Array<Animal>` |

### 2.3 类型体操与实用工具

```typescript
// 条件类型
type IsString<T> = T extends string ? true : false;
type A = IsString<'hello'>; // true
type B = IsString<123>;     // false

// 映射类型
type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Partial<T> = { [K in keyof T]?: T[K] };

// 模板字面量类型
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // 'onClick'
```

---

## 3. 执行模型

### 3.1 调用栈与事件循环

```
调用栈 (Call Stack)          Web APIs              任务队列
┌─────────┐                ┌──────────┐          ┌──────────┐
│ main()  │ ──setTimeout──→│ Timer    │ ──到期──→│ 宏任务    │
│ foo()   │                └──────────┘          └──────────┘
│ bar()   │                                        ↑
└─────────┘                                   事件循环
```

**关键规则**：
- 同步代码优先执行
- 微任务（Promise）在宏任务之前
- 每轮事件循环至少执行一个宏任务

### 3.2 内存管理

```javascript
// 标记-清除 GC 示例
let user = { name: 'Alice' };
let admin = user;

user = null; // user 不再引用对象
admin = null; // 对象不可达，GC 回收
```

**内存泄漏常见原因**：
1. 全局变量未清理
2. 闭包引用大对象
3. 定时器未清除
4. DOM 引用未释放
5. EventListener 未移除

---

## 4. 现代语言特性演进

### 4.1 ES2020-ES2025 关键特性

| 年份 | 特性 | 影响 |
|------|------|------|
| ES2020 | `BigInt`, `Promise.allSettled`, `??`, `?.` | 空安全操作符改变代码风格 |
| ES2021 | `Promise.any`, `AggregateError`, `numeric separators` | 更健壮的异步处理 |
| ES2022 | `class fields`, `private methods`, `at()` | 类语法现代化 |
| ES2023 | `toSorted`, `toReversed`, `toSpliced`, `findLast` | 不可变数组方法 |
| ES2024 | `Array.groupBy`, `Promise.withResolvers` | 数据分组标准化 |
| ES2025 | `import attributes`, `RegExp /v` | 模块化安全增强 |

### 4.2 TypeScript 5.x 关键更新

- **TS 5.0**: Decorators 标准、const type parameters
- **TS 5.1**: `Array.prototype.find` 类型优化
- **TS 5.2**: `using` 关键字（显式资源管理）
- **TS 5.3**: `import type *` 支持
- **TS 5.4**: `NoInfer<T>` 类型
- **TS 5.5**: 类型推断增强、更快的编译
- **TS 5.8**: 更严格的类型检查
- **TS 7.0 (tsgo)**: Go 重写编译器，10x 速度提升

---

## 5. 常见陷阱与反模式

### 陷阱 1：隐式类型转换

```javascript
[] + []           // ""
[] + {}           // "[object Object]"
{} + []           // 0 (在表达式上下文中 {} 是空块)
true + true       // 2
1 < 2 < 3         // true (1 < 2 → true → true < 3 → 1 < 3 → true)
```

**防御**：使用 `===` 严格相等，使用 `??` 空值合并。

### 陷阱 2：闭包与循环

```javascript
// ❌ 所有 i 都是 10
for (var i = 0; i < 10; i++) {
  setTimeout(() => console.log(i), 100);
}

// ✅ 每次迭代独立的 i
for (let i = 0; i < 10; i++) {
  setTimeout(() => console.log(i), 100);
}
```

### 陷阱 3：this 绑定

```javascript
const obj = {
  name: 'Alice',
  greet: function() { console.log(this.name); },
  greetArrow: () => console.log(this.name),
};

obj.greet();      // 'Alice'
obj.greetArrow(); // undefined（箭头函数 this 继承外部）

const fn = obj.greet;
fn();             // undefined（严格模式）或 global.name
```

---

## 6. 学习路径建议

```
阶段 1: 语法基础
  ├── 变量声明 (var/let/const)
  ├── 数据类型与转换
  ├── 控制流与函数
  └── 对象与数组操作

阶段 2: 核心机制
  ├── 作用域与闭包
  ├── this 绑定与原型链
  ├── 异步编程 (Promise/async-await)
  └── 事件循环与执行模型

阶段 3: TypeScript
  ├── 类型系统基础
  ├── 泛型与条件类型
  ├── 类型推断与窄化
  └── 工程配置与工具链

阶段 4: 高级主题
  ├── 元编程 (Proxy/Reflect)
  ├── 迭代器与生成器
  ├── WeakRef 与 FinalizationRegistry
  └── ECMAScript 规范解读
```

---

## 参考资源

- [ECMA-262 规范](https://tc39.es/ecma262/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)
- [JavaScript Weekly](https://javascriptweekly.com/)
