# 语法映射关系

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/syntax-mapping`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块建立 JS 与 TS 语法元素之间的显式映射关系，揭示 TS 类型构造如何对应到 JS 值空间的行为，降低学习者在两种语法体系间转换的认知负担。

### 1.2 形式化基础

设 JS 值空间为 `V`，TS 类型空间为 `T`。语法映射是函数 `⟦·⟧: T → P(V)`（类型的值解释），满足：
- `⟦number⟧ = { v ∈ V | typeof v === 'number' }`
- `⟦A & B⟧ = ⟦A⟧ ∩ ⟦B⟧`（交集类型对应值集合的交）
- `⟦A | B⟧ = ⟦A⟧ ∪ ⟦B⟧`（联合类型对应值集合的并）

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 类型注解 | 为值附加编译期类型约束 | `: number`, `: string` |
| 类型推断 | 编译器自动推导省略的类型 | `let x = 1` → `x: number` |
| 类型擦除 | 编译后 TS 特有语法被移除 | `.d.ts` / `.js` 输出 |
| 语法糖 | TS 提供便捷写法，编译为等效 JS | `?.`, `??`, `as const` |

---

## 二、设计原理

### 2.1 为什么存在

TS 类型系统建立在 JS 运行时之上。语法映射建立了两者之间的认知桥梁，帮助开发者理解：类型构造不仅是「额外语法」，更是对值空间行为的精确描述。

### 2.2 语法映射表

| TS 语法 | JS 对应/编译结果 | 语义说明 |
|--------|-----------------|---------|
| `let x: number` | `let x` | 类型擦除，运行时无检查 |
| `interface P { x: number }` | 无 | 仅编译期结构契约 |
| `type ID = string` | 无 | 类型别名，零运行时开销 |
| `function f<T>(x: T): T` | `function f(x) { return x; }` | 泛型擦除为任意参数 |
| `enum Color { R, G }` | 反向映射对象 | 部分保留运行时结构 |
| `class C { private x: number }` | `class C { constructor() { this.x = ... } }` | `private` 仅 TS 检查 |
| `x?.y ?? z` | `(x == null ? void 0 : x.y) != null ? x.y : z` | 可选链 + 空值合并（ES2020+） |
| `const a = [1, 2] as const` | `const a = [1, 2]` | 字面量类型窄化 |
| `satisfies T` | 无 | 仅约束不拓宽类型 |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 显式类型注解 | 文档即代码、自解释 | 编写冗余 | 公共 API、团队边界 |
| 类型推断 | 减少样板 | 复杂场景难追踪 | 内部实现、局部变量 |
| `satisfies` | 推断 + 约束双重保障 | TS 4.9+ | 配置对象、常量结构 |

---

## 三、实践映射

### 3.1 语法映射代码示例

```ts
// === 基础类型映射 ===
let count: number = 10;        // JS: let count = 10;
let name: string = 'TS';       // JS: let name = 'TS';
let active: boolean = true;    // JS: let active = true;

// === 对象与接口映射 ===
interface User {
  id: number;
  name: string;
  readonly createdAt: Date;
}

const u: User = {
  id: 1,
  name: 'Alice',
  createdAt: new Date(),
};
// JS 输出：const u = { id: 1, name: 'Alice', createdAt: new Date() };
// readonly 不生成任何运行时保护

// === 函数签名映射 ===
function add(a: number, b: number): number {
  return a + b;
}
// JS: function add(a, b) { return a + b; }

// 默认参数 + 可选参数
function greet(name: string, greeting = 'Hello'): string {
  return `${greeting}, ${name}`;
}
// JS: function greet(name, greeting = 'Hello') { ... }

// === 联合类型与窄化 ===
function format(input: string | number): string {
  if (typeof input === 'string') {
    return input.trim();       // 窄化为 string
  }
  return input.toFixed(2);     // 窄化为 number
}
// JS: function format(input) { if (typeof input === 'string') ... }

// === 泛型擦除 ===
function identity<T>(arg: T): T {
  return arg;
}
const n = identity<number>(42);
// JS: function identity(arg) { return arg; }
// JS: const n = identity(42);

// === as const 映射 ===
const config = {
  host: 'localhost',
  port: 3000,
} as const;
// config.host 类型为字面量 'localhost'，非 string
// JS: const config = { host: 'localhost', port: 3000 };
```

### 3.2 装饰器映射（TS 实验性 vs TC39）

```ts
// TypeScript 实验装饰器（legacy）
function log(target: any, key: string, desc: PropertyDescriptor) {
  const original = desc.value;
  desc.value = function (...args: any[]) {
    console.log(`Call ${key}`);
    return original.apply(this, args);
  };
}

// TC39 Stage 3 装饰器（TS 5.0+ 支持）
function logged(target: Function, context: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.log(`Calling ${String(context.name)}`);
    return target.apply(this, args);
  };
}
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| TS 是 JS 的超集因此完全兼容 | 有效 JS 未必能通过 TS 类型检查（如 `[] + {}`） |
| 类型擦除不影响运行时 | 装饰器、枚举、`namespace` 会改变运行时结构 |
| `private` 在运行时是私有的 | TS `private` 仅在编译期检查，运行时仍可访问 |
| `interface` 会生成代码 | 接口完全擦除，零运行时开销 |

### 3.4 扩展阅读

- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook: Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [AST Explorer: TS vs JS](https://astexplorer.net/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
- `10-fundamentals/10.1-language-semantics/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
