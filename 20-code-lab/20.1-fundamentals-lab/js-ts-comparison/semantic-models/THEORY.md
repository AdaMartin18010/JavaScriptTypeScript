# 语义模型对比

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/semantic-models`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块对比 JavaScript 动态语义（运行时求值规则）与 TypeScript 静态语义（编译期类型约束）的模型差异，解释为何同一源代码在两种语义层面呈现不同判定结果。

### 1.2 形式化基础

- **动态语义（JS）**：操作语义，状态为 `(Heap, Stack, Expr)`，求值规则由 ECMA-262 的抽象操作定义。
- **静态语义（TS）**：类型系统作为对动态语义的保守近似：`⊢ e : T` 表示若 `e` 求值得值 `v`，则 `v ∈ ⟦T⟧`（值的类型解释）。TS 类型擦除后，程序的行为完全由 JS 动态语义决定。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 类型擦除 | 编译后移除所有类型注解与接口 | `.js` 输出 |
| 结构等价 | TS 按成员结构而非声明名称判定兼容 | `type A = {x:number}` vs `interface B {x:number}` |
| 类型精化 | 将宽泛类型收缩到更精确子集 | Narrowing |
| 健全性（Soundness） | 类型系统不许可运行时类型错误 | TS 为有意不完整的 |

---

## 二、设计原理

### 2.1 为什么存在

JavaScript 的动态类型与 TypeScript 的静态类型描述的是同一运行时实体，但视角不同。语义模型对比帮助开发者理解：为何某些合法 JS 代码在 TS 中报错，以及 TS 的类型断言如何绕过静态检查。

### 2.2 语义模型对比表

| 维度 | JavaScript 动态语义 | TypeScript 静态语义 |
|------|-------------------|-------------------|
| 类型检查时机 | 运行时 | 编译期 |
| 错误发现 | 执行到该行时抛出 | 编译时标红 |
| 类型依附 | 值携带运行时标签 | 变量携带编译期标签，擦除后消失 |
| 兼容性规则 | 隐式转换（`==`, `+`） | 结构子类型 |
| 泛型实例化 | 无（值无泛型信息） | 编译期擦除为通用结构 |
| 反射能力 | `typeof`, `instanceof`, `Reflect` | 无（编译后不可见） |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 形式化验证 | 保证正确性 | 成本极高、门槛高 | 安全关键系统 |
| TS 类型检查 | 低成本发现大量错误 | 不完全健全（如 `as any`） | 通用应用开发 |
| 运行时类型检查（Zod/io-ts） | 弥补 TS 擦除后的校验缺口 | 运行时开销 | 外部数据边界 |

---

## 三、实践映射

### 3.1 从理论到代码：语义分歧示例

```ts
// === 示例 1：类型擦除 ===
interface Point { x: number; y: number; }
interface Vector { x: number; y: number; }

function move(p: Point): Point {
  return { x: p.x + 1, y: p.y + 1 };
}

const v: Vector = { x: 0, y: 0 };
move(v); // ✅ TS 允许：结构等价，名义不同无关

// 编译后（擦除）：
// function move(p) { return { x: p.x + 1, y: p.y + 1 }; }
// move(v);
// 运行时没有任何 Point/Vector 信息

// === 示例 2：静态安全 vs 动态不安全 ===
function getLength(arr: string[]): number {
  return arr.length;
}

const unsafe: any = null;
getLength(unsafe); // ❌ 编译通过吗？不，但可用断言绕过
getLength(unsafe as string[]); // 编译通过，运行时爆炸

// === 示例 3：窄化保存静态语义一致性 ===
function process(value: string | number): string {
  if (typeof value === 'string') {
    return value.toUpperCase(); // 此处 value 被窄化为 string
  }
  return value.toFixed(2); // 此处被窄化为 number
}

// 编译后 JS：typeof 检查保留，类型信息消失
// function process(value) {
//   if (typeof value === 'string') return value.toUpperCase();
//   return value.toFixed(2);
// }
```

### 3.2 类型擦除的边界案例

```ts
// TS 重载在编译后消失，仅剩最后一个实现签名
function greet(name: string): string;
function greet(age: number): string;
function greet(arg: string | number): string {
  return typeof arg === 'string' ? `Hello ${arg}` : `Age ${arg}`;
}

// 编译后：
// function greet(arg) { ... }
// 运行时无重载分派

// 枚举在编译后生成反向映射对象（非完全擦除）
enum Status {
  Active = 1,
  Inactive = 0,
}
// JS 输出包含 Status["Active"] = 1 和 Status[1] = "Active"
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| 静态语义完全覆盖动态语义 | TS 类型系统只能保证部分安全属性，运行时异常仍可能发生 |
| 运行时类型与静态类型一致 | TS 类型在编译后被擦除，`typeof x` 反映的是 JS 运行时标签 |
| `as` 类型断言改变运行时行为 | `as` 仅在编译期生效，运行时值不变 |
| 接口在运行时可被检测 | 接口完全擦除，`instanceof` 仅适用于类构造函数 |

### 3.4 扩展阅读

- [ECMA-262: Execution Contexts](https://tc39.es/ecma262/#sec-execution-contexts)
- [TypeScript Handbook: Type Erasure](https://www.typescriptlang.org/docs/handbook/2/basic-types.html#erased-types)
- [TypeScript Handbook: Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [TypeScript Design Goals (Non-goals)](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)
- [ECMAScript Spec: Abstract Operations](https://tc39.es/ecma262/#sec-abstract-operations)
- `20.10-formal-verification/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
