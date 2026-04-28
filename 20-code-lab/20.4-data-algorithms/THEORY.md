# 数据结构与算法：理论基础

> **定位**：`20-code-lab/20.4-data-algorithms/`
> **关联**：`10-fundamentals/10.2-type-system/` | `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/DATA_STRUCTURES_ALGORITHMS_THEORY.md`

---

## 一、核心理论

### 1.1 问题域定义

在 JavaScript 中，数据结构不仅是算法的基础，更是**类型系统与运行时性能**的交汇点。理解 Array、Map、Set、TypedArray 的底层实现差异，是编写高性能 JS/TS 代码的前提。

### 1.2 JS 内置数据结构复杂度

| 结构 | 访问 | 搜索 | 插入 | 删除 | 底层实现 |
|------|------|------|------|------|---------|
| `Array` | O(1) | O(n) | O(n) 均摊 | O(n) | 动态数组 |
| `Object` (键) | O(1) | O(1) | O(1) | O(1) | 哈希表 |
| `Map` | O(1) | O(1) | O(1) | O(1) | 哈希表（保序） |
| `Set` | — | O(1) | O(1) | O(1) | 哈希表 |
| `WeakMap` | O(1) | O(1) | O(1) | O(1) | 哈希表（键弱引用） |

---

## 二、设计原理

### 2.1 V8 内部优化

- **Smi（Small Integer）**：31/32位小整数，直接嵌入指针，无需堆分配
- **Fast Elements**：线性数组，连续索引时 O(1) 访问
- **Dictionary Elements**：哈希表，稀疏数组时降级
- **Hidden Classes**：对象结构稳定时的固定偏移优化

### 2.2 类型化数组（TypedArray）

| 类型 | 字节 | 用途 |
|------|------|------|
| `Int8Array` | 1 | 小整数数组 |
| `Float64Array` | 8 | 科学计算 |
| `Uint8Array` | 1 | 二进制数据、Buffer |
| `BigInt64Array` | 8 | 大整数 |

**性能优势**：连续内存、无装箱开销、支持 SIMD/ WebAssembly 互操作。

---

## 三、实践映射

### 3.1 选型决策

```
需要有序键值对？
├── 是 → 键类型多样？
│   ├── 是 → Map
│   └── 否 → Object（仅String/Symbol键）
├── 需要唯一值集合？
│   └── → Set
├── 需要弱引用？
│   └── → WeakMap/WeakSet
└── 大数据数值计算？
    └── → TypedArray
```

---

## 四、扩展阅读

- `10-fundamentals/10.5-object-model/property-descriptors.md` — 对象属性底层机制
- `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/DATA_STRUCTURES_ALGORITHMS_THEORY.md`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
