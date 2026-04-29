# JavaScript 与 TypeScript 差异 — 理论基础

## 1. 类型系统本质差异

| 维度 | JavaScript | TypeScript |
|------|-----------|------------|
| 类型检查 | 运行时 | 编译时 |
| 类型系统 | 动态、鸭子类型 | 静态、结构类型 |
| 类型擦除 | N/A | 编译后移除类型 |
| 类型推断 | 弱（typeof） | 强（基于赋值推断） |

## 2. TypeScript 类型层级

```
unknown → 所有类型的超类型
  ├── any（逃逸舱口）
  ├── object
  │   ├── Array
  │   ├── Function
  │   └── 自定义对象
  ├── string / number / boolean / symbol / bigint
  ├── null / undefined
  └── never → 所有类型的子类型（空集）
```

## 3. 结构化类型系统

TypeScript 使用**结构等价**而非名义等价：

```typescript
interface Point { x: number; y: number }
class Point2D { x: number; y: number }
// Point 与 Point2D 兼容，因为它们结构相同
```

## 4. 类型收窄（Narrowing）

TypeScript 通过控制流分析自动收窄类型：

- `typeof` 守卫: `if (typeof x === 'string')`
- 真值守卫: `if (x)` 排除 null/undefined
- `instanceof` 守卫: `if (x instanceof Date)`
- 自定义类型守卫: `function isString(x: unknown): x is string`
- 判别联合: `if (x.kind === 'circle')`

## 5. 类型系统深度对比：JavaScript vs TypeScript vs Java/C #

| 维度 | JavaScript | TypeScript | Java | C# |
|------|-----------|------------|------|-----|
| **类型检查时机** | 运行时 | 编译时 | 编译时 | 编译时 |
| **类型等价规则** | 鸭子类型（运行时结构） | 结构类型（编译时结构） | 名义类型（声明名称） | 名义类型（声明名称） |
| **类型擦除** | 无类型信息 | 完全擦除为 JS | 保留泛型签名（签名擦除，运行时反射保留） | 保留泛型信息（JIT/反射） |
| **泛型支持** | 无 | ✅ 编译时泛型（类型参数擦除） | ✅ 运行时类型参数（类型擦除） | ✅ 运行时泛型（reified） |
| **联合/交叉类型** | 无原生支持 | ✅ `A \| B`, `A & B` | ❌（需继承/接口模拟） | ❌（需接口模拟） |
| **类型推断强度** | 无 | **强**（双向、上下文敏感） | 中（局部变量需显式） | 强（var + 泛型推断） |
| **条件类型** | 无 | ✅ `T extends U ? X : Y` | ❌ | ❌ |
| **模板字面量类型** | 无 | ✅ `` `id-${number}` `` | ❌ | ❌ |
| **逆变/协变控制** | 无 | ✅ `in` / `out` 修饰符（TS 4.7+） | ✅ 通配符 | ✅ `in` / `out` |
| **编译目标** | N/A | ES3 ~ ESNext | JVM Bytecode | IL / Native AOT |

> **核心洞察**：TypeScript 的类型系统是**结构化的（structural）**而非**名义的（nominal）**。这意味着类型兼容性取决于成员结构，而非声明名称。这与 Java/C# 的名义类型系统形成鲜明对比。

## 6. 代码示例：结构类型 vs 名义类型

### 6.1 TypeScript 结构类型（结构等价）

```typescript
// structural-typing.ts
// TypeScript 中，以下所有类型在结构上兼容

interface Animal {
  name: string;
  age: number;
}

class Dog {
  constructor(public name: string, public age: number, public breed?: string) {}
}

interface Pet {
  name: string;
  age: number;
}

// ✅ 全部兼容：因为结构相同
const animal: Animal = new Dog('Buddy', 3, 'Golden Retriever');
const pet: Pet = animal;

// 额外属性检查（excess property checking）
// 在对象字面量场景下，TS 会执行更严格的检查
const directAssign: Animal = {
  name: 'Kitty',
  age: 2,
  breed: 'Persian', // ❌ 错误：对象字面量只能指定已知属性
};

// 但通过变量传递则通过（结构子类型）
const kitty = { name: 'Kitty', age: 2, breed: 'Persian' };
const animal2: Animal = kitty; // ✅ 通过

// 函数参数的双向协变（bivariance）与严格函数类型
interface Comparator<T> {
  compare(a: T, b: T): number;
}

const numberComparator: Comparator<number> = {
  compare: (a, b) => a - b,
};

// 由于结构兼容，以下赋值是合法的
const anyComparator: Comparator<unknown> = numberComparator;
// 但反向则不成立：Comparator<unknown> 不能赋值给 Comparator<number>
```

### 6.2 模拟名义类型（Nominal Typing）的 TypeScript 技巧

```typescript
// nominal-branding.ts
// 在需要名义类型场景（如不同单位的数字、Entity ID）时，使用 Brand 模式

type Brand<K, T> = K & { __brand: T };

type UserId = Brand<number, 'UserId'>;
type OrderId = Brand<number, 'OrderId'>;

function createUserId(id: number): UserId {
  return id as UserId;
}

function createOrderId(id: number): OrderId {
  return id as OrderId;
}

const userId = createUserId(1);
const orderId = createOrderId(1);

// ❌ 编译错误：不能将 OrderId 赋值给 UserId
// const wrong: UserId = orderId;

// 更轻量的声明合并模式（Intersection + Unique Symbol）
declare const __brand: unique symbol;
type Nominal<T, B> = T & { readonly [__brand]: B };

type Meters = Nominal<number, 'Meters'>;
type Seconds = Nominal<number, 'Seconds'>;

const distance = 100 as Meters;
const duration = 60 as Seconds;

// ❌ 编译错误：不能将 Seconds 赋值给 Meters
// const bad: Meters = duration;

// 安全的运算
function addMeters(a: Meters, b: Meters): Meters {
  return (a + b) as Meters;
}
```

### 6.3 类型守卫与类型收窄实战

```typescript
// narrowing-patterns.ts
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; height: number }
  | { kind: 'triangle'; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      // TypeScript 自动收窄为 { kind: 'circle'; radius: number }
      return Math.PI * shape.radius ** 2;
    case 'rectangle':
      return shape.width * shape.height;
    case 'triangle':
      return 0.5 * shape.base * shape.height;
    default:
      // 穷尽检查：如果新增 Shape 变体但未处理，此处会报错
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// 自定义类型守卫（User-Defined Type Guards）
interface Cat {
  meow(): void;
  species: 'cat';
}

interface Dog {
  bark(): void;
  species: 'dog';
}

type Pet = Cat | Dog;

function isCat(pet: Pet): pet is Cat {
  return pet.species === 'cat';
}

function makeSound(pet: Pet) {
  if (isCat(pet)) {
    pet.meow(); // TypeScript 知道此处 pet 是 Cat
  } else {
    pet.bark(); // TypeScript 知道此处 pet 是 Dog
  }
}
```

## 7. 高级类型特性

- **条件类型**: `T extends U ? X : Y`
- **映射类型**: `{ [K in keyof T]: T[K] }`
- **模板字面量类型**: `` `hello-${string}` ``
- **逆变/协变**: 函数参数位置的类型关系

## 8. 与相邻模块的关系

- **00-language-core**: JavaScript 核心机制
- **01-ecmascript-evolution**: ECMAScript 标准演进
- **40-type-theory-formal**: 类型理论的形式化基础

## 9. 权威参考链接

- [TypeScript Handbook: Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html) — TypeScript 官方类型兼容性文档
- [TypeScript Handbook: Structural Typing](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html#structural-type-system) — 结构类型系统介绍
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html) — 类型收窄完整指南
- [TypeScript Handbook: Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html) — 类型生成类型
- [ECMA-262 Language Specification](https://tc39.es/ecma262/) — ECMAScript 语言规范
- [nominal typing vs structural typing (TypeScript FAQ)](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-do-these-empty-classes-behave-strangely) — TypeScript 官方 FAQ
- [TAPL (Types and Programming Languages)](https://www.cis.upenn.edu/~bcpierce/tapl/) — Benjamin Pierce 经典类型理论教材
- [TypeScript Deep Dive by Basarat](https://basarat.gitbook.io/typescript/) — 开源 TypeScript 深度指南
