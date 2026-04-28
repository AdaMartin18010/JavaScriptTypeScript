# Milestone 3: Generic Inference —— 泛型推断

## 理论基础

### 泛型与参数多态（Parametric Polymorphism）

泛型是**参数多态**的具体实现。函数 `identity<T>(x: T): T` 对任意类型 `T` 都成立，这是多态的核心思想。

```
identity : ∀T. T → T
```

### TypeScript 的推断策略

TypeScript 不使用完整的 Hindley-Milner 全局合一，而是采用**基于约束的局部推断**：

1. **自底向上收集候选类型**：从实参表达式推断类型
2. **对比形参类型模式**：如 `T` vs `number`，`Array<T>` vs `Array<string>`
3. **生成替换映射（Substitution）**：`{ T ↦ number }`
4. **应用替换到返回类型**：`identity(42)` 的返回类型变为 `number`

### 合一（Unification）的简化版

合一是求解类型方程的算法：

```
unify(T, number)         → { T ↦ number }
unify(Array<T>, Array<string>) → { T ↦ string }
unify(T, U)              → 错误（未绑定变量冲突）
unify(number, string)    → 错误（不可合一）
```

本实现支持：
- 类型变量与具体类型的绑定
- 复合类型（Array, Function）的递归合一
- 泛型约束检查（`T extends number`）

### 泛型约束

```typescript
function longest<T extends { length: number }>(a: T, b: T): T
```

约束意味着：`T` 的实例化类型必须是 `{ length: number }` 的子类型。

## 关键代码 Walkthrough

### `genericSolver.ts`

`GenericSolver` 实现泛型参数推断的核心算法：

- `inferTypeArguments(funcType, argTypes)`：遍历每个参数，调用 `unify(paramType, argType)` 收集替换映射
- `unify(a, b)`：递归合一两个类型
  - 若 `a` 是泛型参数 → 绑定到 `b`
  - 若 `b` 是泛型参数 → 绑定到 `a`
  - 若两者是相同复合类型 → 递归合一子组件
  - 否则 → 错误
- `applySubstitution(type, subst)`：将替换映射应用到类型上
- `checkConstraint(type, constraint)`：检查类型是否满足约束

### 与 `ExtendedTypeChecker` 的集成

本里程碑提供一个 `ExtendedTypeChecker`，它继承 M2 的 `TypeChecker` 并覆盖 `checkCallExpression`，在函数调用时自动进行泛型推断。

## 运行测试

```bash
pnpm test examples/advanced-compiler-workshop/milestone-03-generic-inference
```

## 延伸阅读

- `jsts-code-lab/40-type-theory-formal/01-type-inference/hindley-milner.ts` —— 完整 HM 算法实现
- `jsts-code-lab/40-type-theory-formal/THEORY.md` §3 —— Hindley-Milner 类型推断
- `jsts-code-lab/40-type-theory-formal/THEORY.md` §4.1 —— 约束推断 vs HM 合一
