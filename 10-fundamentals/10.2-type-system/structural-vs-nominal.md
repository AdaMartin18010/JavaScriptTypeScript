# Structural vs Nominal Typing

> **定位**：`10-fundamentals/10.2-type-system/structural-vs-nominal.md`
> **关联**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/` | `30-knowledge-base/30.2-categories/`

---

## 概述

TypeScript 采用**结构子类型**（Structural Subtyping），而 Java/C# 等语言采用**名义子类型**（Nominal Subtyping）。这是 TypeScript 类型系统最核心的设计决策之一。

## 结构子类型

两个类型兼容当且仅当它们的成员结构兼容，与类型名称无关。

```typescript
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

let p2: Point2D = { x: 1, y: 2 };
let p3: Point3D = { x: 1, y: 2, z: 3 };

p2 = p3; // ✅ 兼容（结构子类型）
```

## 名义子类型

两个类型兼容当且仅当它们有显式的继承/实现关系。

```java
// Java 风格（名义子类型）
class Point2D { int x, y; }
class Point3D extends Point2D { int z; }

Point2D p2 = new Point3D(); // ✅ 显式继承
```

## 权衡

| 特性 | 结构子类型 | 名义子类型 |
|------|-----------|-----------|
| 灵活性 | 高 | 低 |
| 类型安全 | 需额外注意 | 更强 |
| 编译器实现 | 较复杂 | 较简单 |

---

*本文件由重构工具自动生成于 2026-04-28。*
