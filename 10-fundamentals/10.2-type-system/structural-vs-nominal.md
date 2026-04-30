# Structural vs Nominal Typing

> **定位**：`10-fundamentals/10.2-type-system/structural-vs-nominal.md`
> **关联**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/` | `30-knowledge-base/30.2-categories/`

---

## 概述

TypeScript 采用**结构子类型**（Structural Subtyping），而 Java/C# 等语言采用**名义子类型**（Nominal Subtyping）。这是 TypeScript 类型系统最核心的设计决策之一。

---

## 结构子类型（Structural Subtyping）

两个类型兼容当且仅当它们的成员结构兼容，与类型名称无关。

```typescript
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

let p2: Point2D = { x: 1, y: 2 };
let p3: Point3D = { x: 1, y: 2, z: 3 };

p2 = p3; // ✅ 兼容（结构子类型：Point3D 满足 Point2D 的所有成员）
// p3 = p2; // ❌ 错误：Point2D 缺少 z 成员
```

结构子类型的本质是**鸭子类型（Duck Typing）**在静态类型系统中的形式化：

> "如果它走起路来像鸭子，叫起来像鸭子，那它就是鸭子。"

---

## 名义子类型（Nominal Subtyping）

两个类型兼容当且仅当它们有显式的继承/实现关系。

```java
// Java 风格（名义子类型）
class Point2D { int x, y; }
class Point3D extends Point2D { int z; }

Point2D p2 = new Point3D(); // ✅ 显式继承

class AnotherPoint2D { int x, y; }
// Point2D p = new AnotherPoint2D(); // ❌ 编译错误：无继承关系
```

```csharp
// C# 风格（名义子类型 + 显式接口实现）
public interface IShape { double Area(); }
public class Circle : IShape {
    public double Area() => Math.PI * r * r;
}
// 只有显式声明 implements/extends 才建立子类型关系
```

---

## 深度对比表

| 特性 | 结构子类型（TypeScript） | 名义子类型（Java/C#/Rust） |
|------|------------------------|--------------------------|
| **兼容性判定** | 按成员结构递归比较 | 按显式声明的继承关系 |
| **灵活性** | 高：隐式兼容，解耦接口与实现 | 低：需显式 `implements`/`extends` |
| **类型安全** | 需额外注意（可能意外兼容） | 更强（意图显式表达） |
| **编译器实现** | 较复杂（需深度结构比较） | 较简单（查继承链即可） |
| **IDE 重构** | 较困难（无法确定"真正"的使用者） | 较简单（继承链清晰） |
| **跨包兼容性** | 天然兼容同结构类型 | 需适配层或桥接模式 |
| **运行时成本** | 无（仅编译期检查） | 无（仅编译期检查） |
| **典型语言** | TypeScript, Go, OCaml | Java, C#, C++, Rust, Swift |

---

## 代码示例：TypeScript 中的品牌类型（Brand Types）

TypeScript 的结构子类型系统缺乏**名义区分能力**，以下场景存在安全隐患：

```typescript
// ❌ 结构子类型的安全隐患：不同语义类型意外兼容
type UserId = string;
type OrderId = string;

function getUser(id: UserId) { /* ... */ }

const orderId: OrderId = 'order-123';
getUser(orderId); // ✅ 编译通过！但语义错误：用订单ID查用户
```

**品牌类型（Branded Types）**通过添加不可见的结构差异，在结构子类型系统中模拟名义类型：

```typescript
// 品牌类型声明：利用交叉类型添加唯一结构标记
type UserId   = string & { readonly __brand: unique symbol };
type OrderId  = string & { readonly __brand: unique symbol };
type Email    = string & { readonly __brand: unique symbol };

// 工厂函数：在边界处创建品牌类型
function UserId(id: string): UserId {
  if (!id.startsWith('u-')) throw new Error('Invalid UserId format');
  return id as UserId;
}

function OrderId(id: string): OrderId {
  if (!id.startsWith('o-')) throw new Error('Invalid OrderId format');
  return id as OrderId;
}

function Email(addr: string): Email {
  if (!addr.includes('@')) throw new Error('Invalid email');
  return addr as Email;
}

// 编译期防护：品牌不同，结构不兼容
const uid = UserId('u-123');
const oid = OrderId('o-456');
const email = Email('alice@example.com');

function getUser(id: UserId): { name: string } {
  return { name: 'Alice' };
}

getUser(uid);     // ✅ 正常
getUser(oid);     // ❌ TS Error: Argument of type 'OrderId' is not assignable to parameter of type 'UserId'
getUser(email);   // ❌ TS Error: 类型不兼容
getUser('u-123'); // ❌ TS Error: 普通 string 无法赋值给 UserId
```

**进阶：使用 `declare const` 实现零运行时开销的 Opaque 类型**

```typescript
// 更轻量的 Opaque 类型（无需 unique symbol，无运行时残留）
type Opaque<K, T> = T & { readonly __opaque__: K };

type USD = Opaque<'USD', number>;
type CNY = Opaque<'CNY', number>;

function USD(amount: number): USD { return amount as USD; }
function CNY(amount: number): CNY { return amount as CNY; }

const price: USD = USD(99.99);
const localPrice: CNY = CNY(699);

function payUSD(amount: USD) { /* ... */ }

payUSD(price);      // ✅
payUSD(localPrice); // ❌ Error: 防止货币单位混用的严重财务错误
payUSD(99.99);      // ❌ Error: 裸 number 无法传入
```

**代码示例：跨包结构兼容的实际场景**

```typescript
// package-a 定义的接口
interface Logger {
  info(msg: string): void;
  error(msg: string): void;
}

// package-b 定义的接口（完全不同名称，相同结构）
interface ILogger {
  info(msg: string): void;
  error(msg: string): void;
}

// package-c 的函数接受 package-a 的 Logger
function setupLogger(logger: Logger) { /* ... */ }

// 可以传入 package-b 的实现，无需任何适配层
const bLogger: ILogger = { info: console.log, error: console.error };
setupLogger(bLogger); // ✅ 结构兼容，天然跨包互通
```

### 函数类型的结构兼容性

```typescript
// TypeScript 函数参数是双向协变的（在 strictFunctionTypes 关闭时）
type Handler = (x: string) => void;
let h: Handler = (x: string | number) => { console.log(x); }; // ❌ strictFunctionTypes 开启时错误

// ✅ 好: 返回值协变是安全的
type Factory = () => string | number;
let f: Factory = () => 'hello'; // ✅ string 是 string | number 的子类型
```

### 泛型约束中的结构兼容性

```typescript
interface Named { name: string; }
interface NamedAndDated extends Named { createdAt: Date; }

function greet<T extends Named>(entity: T): string {
    return `Hello, ${entity.name}`;
}

const user: NamedAndDated = { name: 'Alice', createdAt: new Date() };
greet(user); // ✅ 结构兼容：NamedAndDated 满足 Named 的结构
```

### 使用私有字段模拟名义类型（零运行时代价）

```typescript
// 利用 #private 字段使结构不兼容，从而模拟名义类型
type UserId = string & { readonly #brand: unique symbol };
type OrderId = string & { readonly #brand: unique symbol };

function UserId(id: string): UserId { return id as UserId; }
function OrderId(id: string): OrderId { return id as OrderId; }

const uid = UserId('u-1');
const oid = OrderId('o-1');

// uid = oid; // ❌ 编译错误：私有标识符不同导致结构不兼容
```

---

## 代码示例：结构类型的边缘行为与注意事项

```typescript
// ============================================
// 示例 1：额外属性检查（Excess Property Checks）
// ============================================

interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || 'red',
    area: (config.width || 10) ** 2
  };
}

// ❌ 额外属性检查报错（对象字面量直接传入）
// createSquare({ colour: 'red', width: 100 });

// ✅ 绕过额外属性检查的方式
const myConfig = { colour: 'red', width: 100 };
createSquare(myConfig); // 不报错，因为 myConfig 推断为 { colour: string; width: number }
                        // 结构上与 SquareConfig 兼容

// ============================================
// 示例 2：可选属性与 undefined 的区别
// ============================================

interface WithOptional {
  name: string;
  age?: number;
}

interface WithUndefined {
  name: string;
  age: number | undefined;
}

const opt: WithOptional = { name: 'A' };      // ✅ age 可省略
// const und: WithUndefined = { name: 'B' };   // ❌ age 必须显式提供

// ============================================
// 示例 3：readonly 属性的结构兼容性
// ============================================

interface Mutable {
  x: number;
}

interface Immutable {
  readonly x: number;
}

const mut: Mutable = { x: 1 };
const imm: Immutable = mut; // ✅ Mutable 可赋值给 Immutable（更宽松 → 更严格）
// mut = imm;               // ❌ Immutable 不可赋值给 Mutable

// ============================================
// 示例 4：类实例与对象字面量的结构兼容
// ============================================

class Animal {
  constructor(public name: string) {}
  move(distance: number): void {
    console.log(`${this.name} moved ${distance}m`);
  }
}

interface Mover {
  name: string;
  move(distance: number): void;
}

const animal = new Animal('Cat');
const mover: Mover = animal; // ✅ 类实例结构兼容接口

// 反过来也成立
const literalMover: Mover = {
  name: 'Dog',
  move(d) { console.log(d); }
};
const animal2: Animal = literalMover; // ✅ 对象字面量结构兼容类
```

---

## 结构 vs 名义的工程权衡

```
项目规模
├── 小型项目 / 原型 (< 10k LOC)
│   └── 结构子类型优势：快速迭代，无需显式接口声明
│
├── 中型项目 (10k - 100k LOC)
│   └── 混合策略：核心领域用 Brand Types，外围用结构类型
│
└── 大型项目 / 平台 (> 100k LOC)
    └── 名义化需求上升：需要更强的架构边界和重构安全
        └── 方案：Brand Types + 严格的模块边界 + ESLint 规则
```

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **TypeScript Handbook: Type Compatibility** | 官方结构子类型说明 | [typescriptlang.org/docs/handbook/type-compatibility.html](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) |
| **TypeScript Deep Dive: Nominal Typing** | 品牌类型技术详解 | [basarat.gitbook.io/typescript/type-system/moving-types](https://basarat.gitbook.io/typescript/type-system/moving-types) |
| **Matt Pocock: Opaque Types in TS** | 零运行时开销 Opaque 类型教程 | [mattpocock.com](https://www.mattpocock.com/)（社区广泛引用） |
| **Effective TypeScript: Item 53** | Dan Vanderkam 品牌类型最佳实践 | [effectivetypescript.com](https://effectivetypescript.com/) |
| **GO 语言接口设计** | 另一主流结构子类型语言的哲学 | [go.dev/doc/effective_go#interfaces](https://go.dev/doc/effective_go#interfaces) |
| **Soundiness Literature** | 学术视角：结构类型的可证安全性 | [Soundiness](https://soundiness.github.io/) |
| **TypeScript FAQ: Nominal Typing** | 官方 FAQ 对名义类型的讨论 | [github.com/microsoft/TypeScript/wiki/FAQ#nominal-typing](https://github.com/microsoft/TypeScript/wiki/FAQ#nominal-typing) |
| **Rust Traits vs TypeScript Interfaces** | 名义与结构类型的语言对比 | [doc.rust-lang.org/book/ch10-02-traits.html](https://doc.rust-lang.org/book/ch10-02-traits.html) |
| **TypeScript Handbook: Type Compatibility** | 官方结构子类型说明 | [typescriptlang.org/docs/handbook/type-compatibility.html](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) |
| **TypeScript Deep Dive: Nominal Typing** | 品牌类型技术详解 | [basarat.gitbook.io/typescript/type-system/moving-types](https://basarat.gitbook.io/typescript/type-system/moving-types) |
| **Effective TypeScript: Item 53** | 品牌类型最佳实践 | [effectivetypescript.com](https://effectivetypescript.com/) |
| **Go 语言接口设计** | 另一主流结构子类型语言的哲学 | [go.dev/doc/effective_go#interfaces](https://go.dev/doc/effective_go#interfaces) |
| **Rust Traits vs TypeScript Interfaces** | 名义与结构类型的语言对比 | [doc.rust-lang.org/book/ch10-02-traits.html](https://doc.rust-lang.org/book/ch10-02-traits.html) |
| **TypeScript FAQ: Nominal Typing** | 官方 FAQ 对名义类型的讨论 | [github.com/microsoft/TypeScript/wiki/FAQ#nominal-typing](https://github.com/microsoft/TypeScript/wiki/FAQ#nominal-typing) |
| **Soundiness Literature** | 学术视角：结构类型的可证安全性 | [Soundiness](https://soundiness.github.io/) |
| **MDN: Classes** | JavaScript 类与继承 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) |
| **MDN: private class fields** | 私有字段规范 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_class_fields) |
| **Academic Paper: Gradual Typing** | 渐进类型系统学术基础 | [wphomes.soic.indiana.edu/jsabral/pubs/gradual-typing-snapshot.pdf](https://wphomes.soic.indiana.edu/jsabral/pubs/gradual-typing-snapshot.pdf) |

---

*本文件由重构工具自动生成于 2026-04-28，已增强代码示例与对比深度。*
