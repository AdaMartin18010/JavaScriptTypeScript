# 内置数据结构

> **定位**：`20-code-lab/20.4-data-algorithms/data-structures/built-in`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块解决内置数据结构的高效使用问题。深入分析 Array、Map、Set、WeakMap 的底层实现与复杂度特征。

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| 时间复杂度 | 操作耗费的渐近增长量级 | complexity.md |
| Map vs Object | 键类型与迭代顺序的差异 | map-vs-object.ts |

---

## 二、设计原理

### 2.1 为什么存在

内置数据结构经过引擎优化，是日常开发的首选。深入理解其底层实现和复杂度特征，能够避免性能陷阱并做出正确选择。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Map | 任意键、有序 | 无字面量 | 动态集合 |
| Object | 字面量简洁 | 键限于字符串/Symbol | 固定结构 |

### 2.3 与相关技术的对比

与自定义结构对比：内置经过优化，自定义更灵活可控。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 内置数据结构 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 常见误区

| 误区 | 正确理解 |
|------|---------|
| Object 和 Map 完全等价 | Map 支持任意键、有序、有 size 属性 |
| Set 去重引用类型 | Set 按 SameValueZero 比较，对象去重需额外处理 |

### 3.3 扩展阅读

- [V8 Source](https://github.com/v8/v8)
- `20.4-data-algorithms/data-structures/`

---

## 四、深度对比：Array / Map / Set / WeakMap / Object

| 结构 | 键类型 | 有序性 | 可迭代 | 时间复杂度 (CRUD) | 垃圾回收协作 | 典型场景 |
|------|--------|--------|--------|-------------------|-------------|----------|
| `Array` | 整数索引 | ✅ 插入序 | ✅ | 尾部 O(1) / 中部 O(n) | ❌ | 队列、栈、列表 |
| `Object` | `string` / `Symbol` | ❌ (ES2015+ 部分有序) | ⚠️ | 均摊 O(1) | ❌ | 配置对象、字典 |
| `Map` | 任意值 | ✅ 插入序 | ✅ | O(1) | ❌ | 频繁增删的键值集合 |
| `Set` | 值本身 | ✅ 插入序 | ✅ | O(1) | ❌ | 去重、成员检测 |
| `WeakMap` | 仅对象 | ❌ | ❌ | O(1) | ✅ 键弱引用 | 私有数据、元数据缓存 |

## 五、代码示例：高频操作与性能边界

```typescript
// ── Map：任意键与有序性 ──
const userMeta = new Map<[number, string], Date>();
const key: [number, string] = [42, 'session'];
userMeta.set(key, new Date());

// Map 保持插入顺序，且键与值独立迭代
for (const [k, v] of userMeta) {
  console.log(k, v);
}

// ── WeakMap：私有属性与自动释放 ──
const privateData = new WeakMap<object, { token: string }>();

class SecureSession {
  constructor(token: string) {
    privateData.set(this, { token });
  }
  getToken(): string | undefined {
    return privateData.get(this)?.token;
  }
}
// 当 SecureSession 实例被垃圾回收时，WeakMap 条目自动消失

// ── Set + Array.from 去重模式 ──
const items = [{ id: 1 }, { id: 2 }, { id: 1 }];
const unique = Array.from(new Map(items.map(i => [i.id, i])).values());
// 注意：Set 不能直接按对象字段去重，需配合 Map 或手写比较
```

## 六、权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| ECMAScript® 2025 Language Specification — Map & Set | 形式化语义与算法步骤 | [tc39.es/ecma262](https://tc39.es/ecma262/multipage/keyed-collections.html) |
| V8 Blog — Fast properties | 对象/Map 底层隐藏类与哈希策略 | [v8.dev/blog/fast-properties](https://v8.dev/blog/fast-properties) |
| MDN — JavaScript 标准内置对象 | API 与复杂度参考 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) |
| JavaScript Algorithms — Data Structures | 开源实现与复杂度对照 | [github.com/trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
