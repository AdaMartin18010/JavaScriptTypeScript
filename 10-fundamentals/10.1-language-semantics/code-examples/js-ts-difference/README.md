# JavaScript / TypeScript 对称差分析

> 模块编号: 07-js-ts-symmetric-difference
> 复杂度: ⭐⭐⭐⭐⭐ (专家级)
> 目标读者: 语言研究者、编译器工程师、高级架构师

---

## 核心命题

JavaScript 与 TypeScript 的关系不是"超集/子集"那么简单。本模块用**集合论对称差**的视角，将语言特性划分为四个互不相交的集合：

```
┌─────────────────────────────────────────────────────────────┐
│                     语言特性全集                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │  JS-Only    │  │  交集       │  │  TS-Only            │ │
│  │  运行时行为  │  │  共享语法   │  │  编译时构造          │ │
│  │             │  │             │  │                     │ │
│  │ typeof null │  │ let/const   │  │ interface           │ │
│  │ == 强制转换 │  │ function    │  │ type alias          │ │
│  │ [[Prototype]]│  │ class       │  │ conditional types   │ │
│  │ WeakRef     │  │ async/await │  │ generics            │ │
│  │ Atomics     │  │ import/export│  │ mapped types        │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  TS Runtime-Impacting                                   ││
│  │  TS 特性但影响运行时                                     ││
│  │  enum / namespace / decorators / parameter properties   ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 文件索引

| 文件 | 主题 |
|------|------|
| `01-js-only-runtime-features.ts` + `.md` | JS 有、TS 无（或无法建模）的运行时行为 |
| `02-ts-only-compile-time-features.ts` + `.md` | TS 有、JS 无的编译时构造 |
| `03-runtime-impacting-ts-features.ts` + `.md` | 对运行时产生副作用的 TS 特性 |
| `04-what-ts-cannot-check.ts` + `.md` | TS 静态分析力所不及的 JS 运行时陷阱 |
| `05-ts-to-js-reverse-mapping.ts` + `.md` | 没有 TS 特性时，JS 里怎么写 |
| `06-symmetric-difference-matrix.md` | 三集 Venn 图式总览矩阵 |

## 关联模块

- `jsts-code-lab/10-js-ts-comparison/` — JS/TS 对比代码实验室
- `JSTS全景综述/JS_TO_TS_SYNTAX_SEMANTICS_MAPPING.md` — JS→TS 语义映射
- `JSTS全景综述/JS_TS_语言语义模型全面分析.md` — 三层语义模型
- `JSTS全景综述/GRADUAL_TYPING_THEORY.md` — 渐进类型理论

## 学习方法论

1. **先读 `06-symmetric-difference-matrix.md`** — 获得全局视图
2. **再读 `01` + `02`** — 理解两个语言的"独占领土"
3. **然后读 `03`** — 理解 TS 的"运行时脚印"
4. **最后读 `04` + `05`** — 理解类型系统的边界和等价替换
