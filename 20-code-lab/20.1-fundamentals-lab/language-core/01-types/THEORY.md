# 类型系统

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/01-types`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块聚焦 JavaScript 的类型系统与 TypeScript 的静态类型扩展，解决动态类型带来的运行时错误与可维护性挑战。通过类型注解和推断提升代码可靠性。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 原始类型 | string/number/boolean/null/undefined/symbol/bigint | primitives.ts |
| 对象类型 | 引用类型的结构与接口定义 | object-types.ts |
| 联合类型 | 多个可能类型的析取组合 | union-types.ts |

---

## 二、设计原理

### 2.1 为什么存在

类型系统是防止运行时错误的防线。JavaScript 的动态类型提供了灵活性，但也导致大量隐蔽 bug。TypeScript 在保持 JS 语义的同时引入静态类型，实现了灵活性与安全性的平衡。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 显式注解 | 意图清晰、文档化 | 编写繁琐 | 公共接口 |
| 类型推断 | 代码简洁 | 复杂逻辑难追踪 | 内部实现 |

### 2.3 特性对比表：原始类型 vs 对象类型

| 特性 | 原始类型 (Primitive) | 对象类型 (Object) |
|------|---------------------|-------------------|
| 存储方式 | 栈内存，按值存储 | 堆内存，按引用存储 |
| 可变性 | 不可变 (immutable) | 可变 (mutable) |
| 比较行为 | 值比较 | 引用比较 |
| 种类 | string, number, boolean, null, undefined, symbol, bigint | Object, Array, Function, Date, RegExp 等 |
| 装箱机制 | 自动装箱为临时对象 | 无需装箱 |
| typeof 结果 | 对应类型字符串 | `"object"` / `"function"` |

### 2.4 与相关技术的对比

与 Flow 对比：TS 生态更成熟，类型系统表达力更强。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 类型系统 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：`typeof` 与 `instanceof` 的类型判别

```typescript
// typeof：判别原始类型
function checkPrimitive(value: unknown): string {
  if (typeof value === 'string') return `字符串，长度 ${value.length}`;
  if (typeof value === 'number' && !isNaN(value)) return `数字 ${value}`;
  if (typeof value === 'boolean') return `布尔 ${value}`;
  if (typeof value === 'bigint') return `BigInt ${value}`;
  if (typeof value === 'symbol') return `Symbol ${value.toString()}`;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  return '非原始类型';
}

// instanceof：判别对象原型链
class Dog {
  bark() { return 'Woof!'; }
}
class Cat {
  meow() { return 'Meow!'; }
}

function checkAnimal(animal: unknown): string {
  if (animal instanceof Dog) return animal.bark();
  if (animal instanceof Cat) return animal.meow();
  return 'Unknown animal';
}

// 注意：typeof null === 'object' 是历史遗留 bug
console.log(typeof null);        // "object"
console.log(null instanceof Object); // false
```

### 3.3 类型收窄（Type Narrowing）

```typescript
// discriminated union（可辨识联合类型）
interface Square {
  kind: 'square';
  size: number;
}

interface Rectangle {
  kind: 'rectangle';
  width: number;
  height: number;
}

interface Circle {
  kind: 'circle';
  radius: number;
}

type Shape = Square | Rectangle | Circle;

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'square':
      return shape.size ** 2;      // TS 自动收窄为 Square
    case 'rectangle':
      return shape.width * shape.height; // TS 自动收窄为 Rectangle
    case 'circle':
      return Math.PI * shape.radius ** 2; // TS 自动收窄为 Circle
    default:
      // exhaustiveness check
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}
```

### 3.4 结构类型 vs 名义类型

```typescript
// TypeScript 使用结构类型（Duck Typing）
interface Point2D {
  x: number;
  y: number;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
}

function printPoint(p: Point2D) {
  console.log(`(${p.x}, ${p.y})`);
}

const p3d: Point3D = { x: 1, y: 2, z: 3 };
printPoint(p3d); // ✅ 合法：Point3D 结构兼容 Point2D

// 名义类型模拟（使用 brands）
type UserId = string & { __brand: 'UserId' };
type OrderId = string & { __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

const uid = createUserId('u-123');
const oid = createOrderId('o-456');

// uid = oid; // ❌ 编译错误：结构相同但 brand 不同
```

### 3.5 类型谓词（Type Predicates）自定义守卫

```typescript
// 自定义类型守卫函数
interface Fish {
  swim(): void;
}

interface Bird {
  fly(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim(); // TS 知道此处 pet 是 Fish
  } else {
    pet.fly();  // TS 知道此处 pet 是 Bird
  }
}
```

### 3.6 `unknown` 的安全使用模式

```typescript
// unknown 要求显式类型收窄后才能使用
function parseJsonSafe(json: string): unknown {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function processApiResponse(response: unknown) {
  // ❌ 直接访问属性：编译错误
  // console.log(response.data);

  // ✅ 先进行类型校验
  if (
    typeof response === 'object' &&
    response !== null &&
    'data' in response &&
    Array.isArray(response.data)
  ) {
    return response.data; // response 被收窄为 { data: unknown[] }
  }

  throw new Error('Invalid response format');
}
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| any 可以临时替代所有类型 | any 会传播并破坏整个类型链 |
| unknown 与 any 等价 | unknown 要求使用前先进行类型收窄 |
| `typeof [] === 'array'` | `typeof []` 返回 `'object'`，应使用 `Array.isArray()` |
| `instanceof` 跨 iframe 可靠 | 不同全局环境下的构造函数引用不同，instanceof 可能失效 |
| 接口与类型别名完全等价 | 接口支持声明合并（declaration merging），type 不支持 |

### 3.8 扩展阅读

- [TypeScript 类型手册](https://www.typescriptlang.org/docs/handbook/basic-types.html)
- [MDN：JavaScript 数据类型与数据结构](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures)
- [MDN：typeof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof)
- [MDN：instanceof](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/instanceof)
- [ECMAScript® 2025 Language Specification — ECMAScript Data Types and Values](https://tc39.es/ecma262/#sec-ecmascript-data-types-and-values)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook: Type Guards](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-differentiating-types)
- [TypeScript: Structural vs Nominal Typing](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [2ality: JavaScript Values — Primitives vs Objects](https://2ality.com/2021/01/object-vs-object.html)
- [Deep JavaScript: Types, Values, and Variables](https://exploringjs.com/deep-js/ch_types-values-variables.html)
- `10-fundamentals/10.1-language-semantics/01-types/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
