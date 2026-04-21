# 01 类型系统（Type System）

> TypeScript 静态类型系统的完整指南：从基础类型到类型体操
>
> 文件数：13 | 对齐版本：TypeScript 5.8–6.0 / TS 7.0 预览

---

## 学习路径

### 基础（Beginner）

| # | 文件 | 内容 |
|---|------|------|
| 1 | [01-foundations.md](./01-foundations.md) | 原始类型、数组、元组、枚举、top/bottom 类型 |
| 2 | [02-type-inference-annotations.md](./02-type-inference-annotations.md) | 类型推断与类型注解 |
| 3 | [03-interfaces-vs-type-aliases.md](./03-interfaces-vs-type-aliases.md) | interface vs type 的本质区别与选用策略 |
| 4 | [04-unions-intersections.md](./04-unions-intersections.md) | 联合类型、交叉类型、可辨识联合 |
| 5 | [05-narrowing-guards.md](./05-narrowing-guards.md) | 类型收窄与类型守卫 |

### 进阶（Intermediate）

| # | 文件 | 内容 |
|---|------|------|
| 6 | [06-generics-deep-dive.md](./06-generics-deep-dive.md) | 泛型约束、默认值、条件约束、变型 |
| 7 | [08-conditional-types.md](./08-conditional-types.md) | 条件类型、infer、分配性、递归条件 |
| 8 | [10-utility-types-patterns.md](./10-utility-types-patterns.md) | 实用类型实现与实战模式 |

### 高级（Advanced）

| # | 文件 | 内容 |
|---|------|------|
| 9 | [12-variance.md](./12-variance.md) | 协变、逆变、双变与抗变 |
| 10 | [13-structural-vs-nominal.md](./13-structural-vs-nominal.md) | 结构子类型 vs 名义类型 |
| 11 | [14-type-soundness-boundary.md](./14-type-soundness-boundary.md) | 类型健全性边界 |
| 12 | [15-ts5-ts6-new-type-features.md](./15-ts5-ts6-new-type-features.md) | TS 5.x–6.0 新特性 |
| 13 | [16-ts7-go-compiler-preview.md](./16-ts7-go-compiler-preview.md) | TS 7.0 Go 编译器预览 |

---

## 核心概念速查

```typescript
// 可辨识联合 + 穷尽性检查
type Action = { type: "inc"; n: number } | { type: "dec"; n: number };
function reducer(state: number, action: Action): number {
  switch (action.type) {
    case "inc": return state + action.n;
    case "dec": return state - action.n;
    default: return action satisfies never;
  }
}
```

---

**相关链接**：

- [JSTS全景综述/01_language_core.md](../JSTS全景综述/01_language_core.md) — 语言核心综述
- [jsts-code-lab/00-language-core/](../jsts-code-lab/00-language-core/) — 代码实验室
