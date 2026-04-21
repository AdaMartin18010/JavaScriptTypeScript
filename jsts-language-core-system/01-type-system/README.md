# 01 类型系统专题

> TypeScript 类型系统的完整覆盖：基础、泛型、条件类型与前沿特性
>
> 对齐版本：TypeScript 5.8–6.0 / TS 7.0 Go 编译器预览

---

## 本阶段文件导航

| # | 文件 | 核心内容 |
|---|------|---------|
| 1 | [01-foundations.md](./01-foundations.md) | 基础类型、字面量类型、unknown/any/never |
| 2 | [02-type-inference-annotations.md](./02-type-inference-annotations.md) | 类型推断、显式注解、上下文类型 |
| 3 | [03-interfaces-vs-type-aliases.md](./03-interfaces-vs-type-aliases.md) | interface vs type、合并声明 |
| 4 | [04-unions-intersections.md](./04-unions-intersections.md) | 联合类型、交叉类型、可辨识联合 |
| 5 | [05-narrowing-guards.md](./05-narrowing-guards.md) | 类型守卫、可辨识联合、穷尽检查 |
| 6 | [06-generics-deep-dive.md](./06-generics-deep-dive.md) | 泛型约束、默认值、条件约束 |
| 7 | [08-conditional-types.md](./08-conditional-types.md) | 条件类型、infer、分配性 |
| 8 | [10-utility-types-patterns.md](./10-utility-types-patterns.md) | 内置工具类型、自定义工具类型 |
| 9 | [12-variance.md](./12-variance.md) | 协变、逆变、双变、型变标注 |
| 10 | [13-structural-vs-nominal.md](./13-structural-vs-nominal.md) | 结构类型、名义类型、品牌类型 |
| 14 | [14-type-soundness-boundary.md](./14-type-soundness-boundary.md) | 类型安全边界、strict 模式 |
| 15 | [15-ts5-ts6-new-type-features.md](./15-ts5-ts6-new-type-features.md) | TS 5.8–6.0 新特性 |
| 16 | [16-ts7-go-compiler-preview.md](./16-ts7-go-compiler-preview.md) | TS 7.0 Go 编译器预览 |

---

## 学习路径

```
基础类型 → 推断与注解 → interface/type → 联合/交叉 → 类型守卫 → 泛型 → 条件类型 → 工具类型 → 型变 → 前沿特性
```

---

## 与互补目录的交叉引用

- `../JSTS全景综述/01_language_core.md` — 语言核心全景
- `../jsts-code-lab/00-language-core/` — 语言核心代码实验

---

## 关键概念速查

| 概念 | 说明 |
|------|------|
| unknown | 类型安全的 any |
| never | 空联合、穷尽检查 |
| infer | 条件类型中提取类型 |
| 可辨识联合 | 通过共同字段收窄类型 |
| 品牌类型 | 模拟名义类型 |
| NoInfer | TS 5.4 防止推断拓宽 |

## 深入学习建议

### 前置知识

- JavaScript 基础语法
- ES6+ 新特性
- 基本的数据结构和算法

### 推荐资源

- ECMA-262 规范官方文档 (<https://tc39.es/ecma262/>)
- TypeScript Handbook (<https://www.typescriptlang.org/docs/>)
- V8 博客 (<https://v8.dev/blog>)
- HTML Living Standard (<https://html.spec.whatwg.org/>)

### 实践路径

1. 阅读本专题所有文件
2. 在 Chrome DevTools 中验证概念
3. 尝试修改代码观察行为变化
4. 阅读规范原文加深理解

### 与其他专题的关联

- 类型系统 → 变量系统：类型如何影响变量声明和作用域
- 变量系统 → 控制流：作用域如何影响控制流语句
- 控制流 → 执行模型：异步控制流与事件循环的关系
- 执行模型 → 执行流：引擎如何执行同步和异步代码
- 规范基础 → 所有专题：理解底层规范机制

## 版本历史

| 日期 | 更新 |
|------|------|
| 2025-04 | 初始版本，骨架搭建 |
| 2025-04 | 全面深化，全部文件 > 5000 字节 |
