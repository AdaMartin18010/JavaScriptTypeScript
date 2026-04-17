# JS/TS 语义层可运行模型设计文档

> **定位**: `jsts-code-lab/10-js-ts-comparison/semantic-models/` 的设计蓝图与规范对齐说明  
> **对齐来源**: `JS_TS_语言语义模型全面分析.md`、ECMA-262 2025、TypeScript 5.8–6.0 Spec、Siek & Taha Gradual Typing Theory  
> **目标**: 将三层语义模型（L1 运行时 / L2 编译时 / L3 宿主调度）转化为可演示、可验证的 TypeScript 代码模块。

---

## 1. 设计原则

本目录下的所有代码模块遵循以下原则：

1. **可执行性**: 每个语义概念必须能在 Node.js 22+ 环境中直接运行或测试。
2. **零侵入性**: 演示器代码不修改 JavaScript 引擎行为，仅在用户空间模拟编译时/运行时语义。
3. **规范对齐**: 每个实现需标注对应的规范章节或学术论文来源。
4. **类型擦除可视化**: 通过同一份 TS 代码的"编译前"与"编译后"对照，展示 L2 语义如何映射到 L1 语义。

---

## 2. 模块规划

### 2.1 类型擦除演示器 (`type-erasure-demo.ts`)

**对应理论**: TypeScript 的类型擦除（Type Erasure）保证。

**功能说明**:
- 接收一段 TypeScript 风格的 AST 描述（或字符串模板）。
- 输出擦除所有类型标注后的等价 JavaScript 代码。
- 展示以下擦除规则：
  - 变量/参数/返回类型标注 → 删除
  - `interface` / `type alias` → 删除
  - 泛型参数 `<T>` → 删除
  - `as` 类型断言 → 删除（保留表达式）
  - `enum` / `namespace` / 参数属性 → **保留**（这些是运行时生成代码的例外）

**规范对齐**: TS Spec §2.2、tc39/proposal-type-annotations §Intentional Omissions。

### 2.2 渐进类型边界演示器 (`gradual-boundary-demo.ts`)

**对应理论**: Siek & Taha (2006) 的 Consistency Relation `T ~ S` 与 Cast Insertion。

**功能说明**:
- 在 typed/untyped 边界（如 `any`/`unknown` 与具体类型的交界处）模拟运行时一致性检查。
- 提供 `shallowTag(value, type)` 和 `runtimeCheck<T>(value)` 辅助函数。
- 演示 Gradual Typing 的核心行为：
  - `unknown` 到 `string` 需要显式窄化或断言。
  - `any` 可以隐式转换为任何类型（这是 TS 类型系统中的 unsound 规则）。
  - 运行时检查失败时抛出 `TypeError`。

**规范对齐**: `GRADUAL_TYPING_THEORY.md` §2.1、§5.1。

### 2.3 方差与结构化子类型演示器 (`variance-demo.ts`)

**对应理论**: 结构化子类型（Structural Subtyping）、函数参数逆变（Contravariance）、返回值协变（Covariance）。

**功能说明**:
- 通过一组可编译的示例展示：
  - 对象类型的**宽度子类型（Width Subtyping）**。
  - 函数类型的**参数逆变**与**返回值协变**。
  - `in` / `out` 方差标注（TS 4.7+）对泛型类型的影响。
- 包含在 `--strictFunctionTypes` 开启/关闭时的行为差异说明。

**规范对齐**: TS Handbook — Variance Annotations、Bierman et al. (2014) §Subtyping。

### 2.4 编译器阶段演示器 (`compiler-phase-demo.ts`)

**对应理论**: 编译器前端流水线（Lexer → Parser → Type Checker → Emitter）。

**功能说明**:
- 提供一个**极度简化**的编译器玩具实现，仅用于教学演示：
  - **Lexer**: 将简化的 TS 子集 tokenize。
  - **Parser**: 递归下降解析为简易 AST。
  - **Type Checker**: 对 AST 执行最基础的类型推断（如 `let x = 1` → `number`）。
  - **Emitter**: 将 AST 转换为擦除类型的 JS 字符串。
- 不追求完整语法覆盖，只覆盖变量声明、函数、二元运算三种构造。

**规范对齐**: `COMPILER_LANGUAGE_DESIGN.md` §1、§5。

---

## 3. 与项目文档的关联

| 本目录模块 | 对应文档 | 作用 |
|-----------|---------|------|
| `type-erasure-demo.ts` | `JS_TO_TS_SYNTAX_SEMANTICS_MAPPING.md` §1.3 | 可视化"擦除保证与例外" |
| `gradual-boundary-demo.ts` | `GRADUAL_TYPING_THEORY.md` §5 | 将 Gradual Typing 理论转化为可运行代码 |
| `variance-demo.ts` | `JS_TO_TS_SYNTAX_SEMANTICS_MAPPING.md` §2.2 | 展示函数子类型规则的编译时行为 |
| `compiler-phase-demo.ts` | `COMPILER_LANGUAGE_DESIGN.md` §1 | 演示编译器前端流水线的最小闭环 |

---

## 4. 运行方式

```bash
# 进入项目根目录
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/semantic-models/type-erasure-demo.ts
```

> 上述四个模块已完成基于真实 TypeScript API 的实现，可直接运行和测试。

---

*文档版本: v2.0 | 最后更新: 2026-04-17*
