# 数学符号约定指南

> **用途**: 统一 70-theoretical-foundations/ 目录下所有文档的数学符号
> **适用范围**: 范畴论、形式语义、认知科学、多模型分析
> **最后更新**: 2026-04-30

---

## 一、范畴论语号

| 符号 | LaTeX | 含义 | 示例 |
|------|-------|------|------|
| $\mathbf{C}$ | `\mathbf{C}` | 范畴 C | $\mathbf{Set}$, $\mathbf{TypeScript}$ |
| $Obj(\mathbf{C})$ | `Obj(\mathbf{C})` | 范畴 C 的对象类 | 类型、集合 |
| $Hom_\mathbf{C}(A, B)$ | `Hom_\mathbf{C}(A, B)` | 从 A 到 B 的态射集 | 函数、箭头 |
| $\mathbf{C}(A, B)$ | `\mathbf{C}(A, B)` | 简写态射集 | 同 $Hom$ |
| $f \circ g$ | `f \circ g` | 态射组合（先 g 后 f）| `f(g(x))` |
| $id_A$ | `id_A` | A 上的恒等态射 | `x => x` |
| $F: \mathbf{C} \to \mathbf{D}$ | `F: \mathbf{C} \to \mathbf{D}` | 函子 F | `Array.map` |
| $\eta, \varepsilon$ | `\eta, \varepsilon` | 单位、余单位 | 伴随的单位/余单位 |
| $\alpha: F \Rightarrow G$ | `\alpha: F \Rightarrow G` | 自然变换 | `flatten: Array<Array<_>> -> Array<_>` |
| $\cong$ | `\cong` | 同构 | 双向可逆映射 |
| $\sqsubseteq$ | `\sqsubseteq` | 精化关系 | $M_1 \sqsubseteq M_2$ |
| $\Vdash$ | `\Vdash` | 满足关系 | 模型满足性质 |

---

## 二、类型与构造子

| 符号 | LaTeX | 含义 | TS 对应 |
|------|-------|------|---------|
| $A \times B$ | `A \times B` | 积类型（Product）| `{ a: A, b: B }` |
| $A + B$ | `A + B` | 和类型（Coproduct）| `A \| B` |
| $B^A$ | `B^A` | 指数类型（Exponential）| `(a: A) => B` |
| $1$ | `1` | 终端对象 / 单位类型 | `void` / `undefined` |
| $0$ | `0` | 初始对象 / 空类型 | `never` |
| $\Omega$ | `\Omega` | 子对象分类器 | `boolean` |
| $\prod$ | `\prod` | 积（极限）| `Promise.all` |
| $\coprod$ | `\coprod` | 余积（余极限）| `Promise.race` |
| $\lim$ | `\lim` | 极限 | `reduce` |
| $\mathrm{colim}$ | `\mathrm{colim}` | 余极限 | 合并操作 |

---

## 三、语义与模型

| 符号 | LaTeX | 含义 |
|------|-------|------|
| $\mathcal{D}$ | `\mathcal{D}` | 指称函数（操作语义 → 指称语义）|
| $\mathcal{O}$ | `\mathcal{O}` | 操作语义函数 |
| $\mathcal{A}$ | `\mathcal{A}` | 公理语义函数 |
| $\Delta(M_1, M_2)$ | `\Delta(M_1, M_2)` | 模型对称差 |
| $\delta$ | `\delta` | 状态转移函数 |
| $\tau$ | `\tau` | 类型 / 传播函数 |
| $\chi$ | `\chi` | 特征函数 |
| $\Vdash$ | `\Vdash` | 满足关系 |

---

## 四、单子与效应

| 符号 | LaTeX | 含义 |
|------|-------|------|
| $T$ | `T` | 单子类型构造子 |
| $\eta$ | `\eta` | 单位（Unit / Return）|
| $\mu$ | `\mu` | 乘法（Multiply / Join）|
| $\gg=$ | `\gg=` | Kleisli 组合（bind）|
| $M_1 \setminus M_2$ | `M_1 \setminus M_2` | 集合差 / 模型差 |

---

## 五、认知科学

| 符号 | 含义 |
|------|------|
| $WM$ | 工作记忆（Working Memory）|
| $LTM$ | 长期记忆（Long-Term Memory）|
| $CL$ | 认知负荷（Cognitive Load）|
| $CL_{intrinsic}$ | 内在认知负荷 |
| $CL_{extraneous}$ | 外在认知负荷 |
| $CL_{germane}$ | 相关认知负荷 |

---

## 六、响应与并发

| 符号 | LaTeX | 含义 |
|------|-------|------|
| $R(i, t)$ | `R(i, t)` | 响应函数 |
| $R_{sync}$ | `R_{sync}` | 同步响应分量 |
| $R_{async}$ | `R_{async}` | 异步响应分量 |
| $R_{concurrent}$ | `R_{concurrent}` | 并发响应分量 |
| $\mathbf{1}_{condition}$ | `\mathbf{1}_{condition}` | 指示函数 |

---

## 七、通用逻辑符号

| 符号 | LaTeX | 含义 |
|------|-------|------|
| $\forall$ | `\forall` | 全称量词 |
| $\exists$ | `\exists` | 存在量词 |
| $\Rightarrow$ | `\Rightarrow` | 蕴含 |
| $\Leftrightarrow$ | `\Leftrightarrow` | 等价 |
| $\land$ | `\land` | 且 |
| $\lor$ | `\lor` | 或 |
| $\neg$ | `\neg` | 非 |
| $\in$ | `\in` | 属于 |
| $\subseteq$ | `\subseteq` | 子集 |
| $\cup$ | `\cup` | 并集 |
| $\cap$ | `\cap` | 交集 |

---

## 八、命名约定

### 8.1 文件命名

- 所有 Markdown 文件使用 `NN-标题.md` 格式
- 代码示例使用 `-examples.ts` 后缀
- Mermaid 图表使用 `.mmd` 后缀

### 8.2 引用格式

- 学术论文：作者, "标题", 期刊/会议, 年份
- 书籍：作者, *标题*, 出版社, 年份
- 技术文档：团队, "标题", 类型, 年份

### 8.3 Front-matter 标准

```yaml
---
title: "中文标题"
description: "英文描述"
last-updated: YYYY-MM-DD
review-cycle: 6 months
next-review: YYYY-MM-DD
status: complete | skeleton
priority: P0 | P1 | P2
actual-length: ~XXXX words
references:
  - 作者, 标题 (年份)
---
```

---

*本指南随内容更新同步维护。*
