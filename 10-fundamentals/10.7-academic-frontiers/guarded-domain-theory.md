# Guarded Domain Theory：渐进类型的指称语义前沿

> **定位**：`10-fundamentals/10.7-academic-frontiers/`
> **来源**：Giovannini et al. (2025) | PLDI/POPL 2024-2025

---

## 一、研究背景

**Guarded Domain Theory** 是 2024-2025 年渐进类型（Gradual Typing）领域的重要理论进展，旨在为 `any` 类型提供严格的**指称语义（Denotational Semantics）**。

传统渐进类型理论（Siek & Taha, 2006）主要关注操作语义和一致性关系，而 Guarded Domain Theory 将 `any` 建模为**守卫类型（Guarded Type）**，在域论框架下解释其数学结构。

---

## 二、核心思想

### 2.1 问题：any 的语义是什么？

TypeScript 的 `any` 类型允许所有操作，但其在类型论中的精确含义长期模糊：

- 它是顶层类型 `Top`？
- 它是底层类型 `Bottom`？
- 它是一种特殊的**动态类型**？

### 2.2 Guarded Domain 的解决方案

Guarded Domain Theory 将 `any` 建模为：

```
any = guard(⊥)
```

其中 `guard` 是一个**域构造器**，将未定义值包装为可安全参与任何操作的动态值。

**关键洞察**：`any` 不是普通的类型，而是一种**计算效果（Computational Effect）**，其语义类似于 Haskell 的 `unsafeCoerce`，但被类型系统显式标记。

---

## 三、形式理论解释

### 3.1 渐进类型的一致性（Consistency）

Siek & Taha (2006) 定义渐进类型的一致性关系 `∼`：

```
τ ∼ τ               (自反)
any ∼ τ             (any 与任意类型一致)
τ ∼ any             (对称)
τ₁ → τ₂ ∼ τ₁' → τ₂'  if τ₁ ∼ τ₁' and τ₂ ∼ τ₂'
```

Guarded Domain Theory 将此关系提升到**指称层面**：一致性不是语法关系，而是域中元素通过 `guard`/`unguard` 操作建立的**精化序（Refinement Ordering）**。

### 3.2 精化类型示例

```typescript
// 精化类型（Refinement Types）在 TS 中的近似表达
// 使用 branded types + 谓词函数模拟

type PositiveInt = number & { __brand: 'PositiveInt' };

function guardPositiveInt(n: number): PositiveInt | null {
  return Number.isInteger(n) && n > 0 ? (n as PositiveInt) : null;
}

// Guarded Domain 视角：
// 运行时值 n 必须经过 guard 才能进入 PositiveInt 域。
// 如果 n 不满足谓词，guard 失败，对应 any 的「运行时错误」语义。

// 类比：
// any = guard(⊥)  意味着「未经验证的值被包裹为动态值」。
// 每次从 any 提取具体类型时，相当于 unguard + runtime check。

function unsafeDivide(a: any, b: any): number {
  // a 和 b 在 Guarded Domain 中是 guard(⊥)
  // 运行时它们必须满足 number 的谓词，否则行为未定义
  return (a as number) / (b as number);
}
```

### 3.3 Blame 追踪与契约系统模拟

Guarded Domain Theory 与契约系统（Contract Systems）密切相关。以下代码展示了如何用 TypeScript 模拟运行时 blame 追踪：

```typescript
// 模拟渐进类型的运行时契约与 blame 追踪
type Blame = { party: 'client' | 'server'; location: string };

class ContractViolation extends Error {
  constructor(public blame: Blame, message: string) {
    super(`Contract violation: ${message} (blame: ${blame.party} at ${blame.location})`);
  }
}

// 守卫函数：将 any 值「注入」到具体类型域，失败时抛出 blame
function guard<T>(
  value: any,
  predicate: (v: any) => v is T,
  blame: Blame
): T {
  if (predicate(value)) return value;
  throw new ContractViolation(blame, `Expected ${predicate.name}, got ${typeof value}`);
}

// 示例谓词
const isNumber = (v: any): v is number => typeof v === 'number';
const isString = (v: any): v is string => typeof v === 'string';

// 模拟 any → (number → number) 的渐进类型转换
function makeAdder(unsafeFn: any): (x: number) => number {
  return (x: number) => {
    const f = guard<(x: number) => number>(
      unsafeFn,
      (v): v is (x: number) => number => typeof v === 'function',
      { party: 'client', location: 'makeAdder.call' }
    );
    const result = f(x);
    return guard<number>(
      result,
      isNumber,
      { party: 'server', location: 'makeAdder.return' }
    );
  };
}

// 测试：运行时 blame 定位
const safeAdder = makeAdder((x: number) => x + 1);
console.log(safeAdder(5)); // 6

const badAdder = makeAdder((x: number) => 'oops');
// console.log(badAdder(5)); // ContractViolation: blame server
```

### 3.4 TypeScript `satisfies` 与精化序的工程映射

TypeScript 4.9 引入的 `satisfies` 运算符可视为 Guarded Domain 中「精化检查」的静态对应：

```typescript
// satisfies 确保表达式满足类型约束，但不改变其推断类型
const config = {
  host: 'localhost',
  port: 3000,
  debug: true,
} satisfies { host: string; port: number };

// config.debug 仍可被推断为 boolean（而非从约束类型中丢失）
const useDebug: boolean = config.debug;

// Guarded Domain 视角：
// satisfies 是编译期的 guard，将表达式精化为特定类型的子集，
// 同时保留原始值的精细结构信息。
```

### 3.5 渐进类型的 Gradual Guarantee

Guarded Domain Theory 的形式化目标是证明 **Gradual Guarantee**：若将静态类型程序中某些类型替换为 `any`，程序的行为不会改变（最多从类型错误降级为运行时检查）。

```typescript
// 静态版本：编译期保证
function staticAdd(x: number, y: number): number {
  return x + y;
}

// 渐进版本：将 number 替换为 any，行为在运行时保持一致
// 但可能抛出运行时类型错误而非编译错误
function gradualAdd(x: any, y: any): any {
  return x + y;
}

// Guarded Domain 解释：
// staticAdd 的语义是在 number 域上的严格函数。
// gradualAdd 的语义是将输入 guard 到 number 域，
// 执行加法后 unguard 回 any 域。
// 若输入无法 guard（如字符串），运行时抛出 blame。
```

### 3.6 用 TypeScript 模拟 Guarded Cast

```typescript
// 模拟 Guarded Domain 中的 cast 操作
// cast: any → T，失败时产生 blame
type Guarded<T> = { _tag: 'Guarded'; value: T };

function guardValue<T>(
  value: unknown,
  check: (v: unknown) => v is T,
  label: string
): Guarded<T> {
  if (check(value)) return { _tag: 'Guarded', value };
  throw new TypeError(`Guarded cast failed at ${label}: expected guard predicate to hold`);
}

function unguard<T>(g: Guarded<T>): T {
  return g.value;
}

// 示例：安全 JSON 解析器
type User = { name: string; age: number };

function isUser(v: unknown): v is User {
  return (
    typeof v === 'object' && v !== null &&
    'name' in v && typeof (v as Record<string, unknown>).name === 'string' &&
    'age' in v && typeof (v as Record<string, unknown>).age === 'number'
  );
}

function parseUser(json: string): User {
  const parsed = JSON.parse(json) as unknown;
  const guarded = guardValue(parsed, isUser, 'parseUser');
  return unguard(guarded);
}

// 成功
console.log(parseUser('{"name":"Alice","age":30}'));
// 失败：抛出 TypeError
// console.log(parseUser('{"name":"Bob"}'));
```

---

## 四、与本项目的关系

本项目中的「实用主义形式化」认识论定位与 Guarded Domain Theory 形成呼应：

| 维度 | 本项目定位 | Guarded Domain Theory |
|------|----------|----------------------|
| any 的本质 | 逃生舱 / 未知压制 | guard(⊥) 计算效果 |
| 形式化程度 | 工程实践导向 | 严格指称语义 |
| 应用场景 | 代码库迁移、快速原型 | 编译器验证、类型安全证明 |

---

## 五、跟踪状态

- **论文状态**：Giovannini et al. (2025) 已发表
- **工具化**：尚无直接可用的编译器验证工具
- **TC39 关联**：Type Annotations 提案可能参考相关理论

---

## 六、权威文献与链接

| 文献 | 作者 | 年份 | 链接 |
|------|------|------|------|
| *Guarded Gradual Type Systems* | New et al. | 2020 | [arXiv:2007.04702](https://arxiv.org/abs/2007.04702) |
| *Gradual Typing for Functional Languages* | Siek & Taha | 2006 | [ACM DL](https://dl.acm.org/doi/10.1145/1159803.1159817) |
| *Denotational Semantics of Gradual Types* | Campora et al. | 2022 | [ICFP](https://doi.org/10.1145/3547627) |
| *The Gradualizer* | Cimini & Siek | 2016 | [POPL](https://doi.org/10.1145/2837614.2837632) |
| *Abstracting Gradual Typing* | Garcia et al. | 2016 | [POPL](https://doi.org/10.1145/2837614.2837670) |
| *Gradual Typing: A New Perspective* | Siek et al. | 2015 | [PNAS](https://doi.org/10.1073/pnas.1510986112) |
| *Towards a Semantic Model for Gradual Typing* | Clark et al. | 2023 | [arXiv](https://arxiv.org/abs/2310.12352) |
| TypeScript Design Goals | Microsoft | 2023 | [GitHub Wiki](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals) |
| TC39 Type Annotations Proposal | TC39 | Stage 1 | [tc39/proposal-type-annotations](https://github.com/tc39/proposal-type-annotations) |
| Gradual Typing.org | Community | — | [gradualtyping.org](http://gradualtyping.org/) |
| Siek's Blog — Gradual Typing | Siek | — | [siek.blogspot.com](https://siek.blogspot.com/) |
| Reticulated Python | Vitousek et al. | 2014 | [Github](https://github.com/mvitousek/reticulated) |
| Typed Racket | Felleisen et al. | — | [Racket Docs](https://docs.racket-lang.org/ts-guide/) |
| Pyright / mypy Gradual Typing | Microsoft / Dropbox | — | [Pyright Docs](https://microsoft.github.io/pyright/) |
| Soundness and Gradual Typing | Tobin-Hochstadt | — | [PL Perspectives](https://blog.sigplan.org/2019/08/12/soundness-and-graadual-typing/) |
| PLDI 2024 Proceedings | ACM | 2024 | [ACM DL](https://dl.acm.org/doi/proceedings/10.1145/3656410) |
| POPL 2025 Proceedings | ACM | 2025 | [ACM DL](https://dl.acm.org/doi/proceedings/10.1145/3704888) |
| TYPES Forum | Community | — | [types-announce](https://lists.chalmers.se/pipermail/types-announce/) |
| Lambda the Ultimate — Gradual Typing | Community | — | [LtU](http://lambda-the-ultimate.org/) |

---

*本文件为学术前沿瞭望的理论跟踪，用于理解 TypeScript 类型系统的数学基础。*
