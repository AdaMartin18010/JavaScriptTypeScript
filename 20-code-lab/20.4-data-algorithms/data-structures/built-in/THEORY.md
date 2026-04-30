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
| 隐藏类 (Hidden Class) | V8 对 Object 的形状优化 | v8-internals.md |
| 哈希表 | Map/Set 的底层存储结构 | hash-table.md |

---

## 二、设计原理

### 2.1 为什么存在

内置数据结构经过引擎优化，是日常开发的首选。深入理解其底层实现和复杂度特征，能够避免性能陷阱并做出正确选择。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Map | 任意键、有序、O(1) 增删查 | 无字面量、JSON 不支持 | 动态集合、频繁增删 |
| Object | 字面量简洁 | 键限于字符串/Symbol、原型链污染风险 | 固定结构、配置对象 |
| Set | 去重、成员检测 O(1) | 无索引访问 | 唯一值集合 |
| WeakMap | 键弱引用、防内存泄漏 | 不可迭代、键仅限对象 | 私有数据、元数据缓存 |

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
| Array.prototype.find 在所有场景最优 | 大集合频繁查找应使用 Map/Set |

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

## 六、代码示例：ES2024 Object.groupBy 与 Map.groupBy

```typescript
// group-by.ts — 原生分组（ES2024）

interface Order {
  id: string;
  status: 'pending' | 'shipped' | 'delivered';
  amount: number;
}

const orders: Order[] = [
  { id: 'o1', status: 'pending', amount: 100 },
  { id: 'o2', status: 'shipped', amount: 200 },
  { id: 'o3', status: 'pending', amount: 150 },
];

// Object.groupBy：键为字符串
const byStatus = Object.groupBy(orders, o => o.status);
// => { pending: [o1, o3], shipped: [o2], delivered: undefined }

// Map.groupBy：键可为任意类型
const byThreshold = Map.groupBy(orders, o => o.amount >= 150 ? 'high' : 'low');
// => Map { 'low' => [o1], 'high' => [o2, o3] }

// 兼容性 polyfill
if (!Object.groupBy) {
  Object.groupBy = function groupBy<T>(
    items: Iterable<T>,
    callbackFn: (item: T, index: number) => string
  ): Record<string, T[]> {
    const result: Record<string, T[]> = {};
    let index = 0;
    for (const item of items) {
      const key = callbackFn(item, index++);
      if (!result[key]) result[key] = [];
      result[key].push(item);
    }
    return result;
  };
}
```

## 七、代码示例：TypedArray 与二进制数据处理

```typescript
// typed-arrays.ts — 高性能数值计算与文件解析

// 使用 Float64Array 进行大规模数值运算（避免 JS Number 对象开销）
function vectorAdd(a: Float64Array, b: Float64Array): Float64Array {
  const result = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) {
    result[i] = a[i] + b[i];
  }
  return result;
}

// 解析二进制文件头（如 WAV 文件）
function parseWavHeader(buffer: ArrayBuffer) {
  const view = new DataView(buffer);
  const riff = String.fromCharCode(...new Uint8Array(buffer, 0, 4));
  const fileSize = view.getUint32(4, true);
  const fmtChunkSize = view.getUint32(16, true);
  const audioFormat = view.getUint16(20, true);
  const numChannels = view.getUint16(22, true);
  const sampleRate = view.getUint32(24, true);

  return { riff, fileSize, audioFormat, numChannels, sampleRate };
}

// 使用 BigUint64Array 处理超过 2^53 的整数（如区块链金额）
const balances = new BigUint64Array([12345678901234567890n, 98765432109876543210n]);
const total = balances.reduce((sum, val) => sum + val, 0n);
```

## 八、代码示例：ArrayBuffer 与 SharedArrayBuffer 实战

```typescript
// arraybuffer-operations.ts — 二进制数据切片与零拷贝共享

// ArrayBuffer 切片（零拷贝视图）
const buffer = new ArrayBuffer(1024);
const view1 = new Uint8Array(buffer, 0, 512);   // 前半段
const view2 = new Uint16Array(buffer, 512, 256); // 后半段作为 Uint16

view1[0] = 0xFF;
console.log(buffer.byteLength); // 1024 — 原 buffer 不变

// SharedArrayBuffer：跨 Worker 零拷贝共享
const sab = new SharedArrayBuffer(1024);
const sharedView = new Int32Array(sab);

// Worker 线程中
// Atomics.store(sharedView, 0, 42);
// Atomics.notify(sharedView, 0);

// 主线程中等待
Atomics.wait(sharedView, 0, 0); // 阻塞直到索引 0 的值不再是 0
console.log('Shared value:', sharedView[0]);
```

## 九、代码示例：Set 的数学运算与关系操作

```typescript
// set-operations.ts — 集合代数

function union<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a, ...b]);
}

function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => b.has(x)));
}

function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
  return new Set([...a].filter(x => !b.has(x)));
}

function isSuperset<T>(a: Set<T>, b: Set<T>): boolean {
  return [...b].every(x => a.has(x));
}

// 使用示例
const activeUsers = new Set(['alice', 'bob', 'charlie']);
const premiumUsers = new Set(['bob', 'charlie', 'dave']);

console.log(union(activeUsers, premiumUsers));        // 所有用户
console.log(intersection(activeUsers, premiumUsers)); // 活跃且付费
console.log(difference(activeUsers, premiumUsers));   // 活跃但未付费
```

## 十、权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| ECMAScript® 2025 Language Specification — Map & Set | 形式化语义与算法步骤 | [tc39.es/ecma262](https://tc39.es/ecma262/multipage/keyed-collections.html) |
| V8 Blog — Fast properties | 对象/Map 底层隐藏类与哈希策略 | [v8.dev/blog/fast-properties](https://v8.dev/blog/fast-properties) |
| MDN — JavaScript 标准内置对象 | API 与复杂度参考 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects) |
| JavaScript Algorithms — Data Structures | 开源实现与复杂度对照 | [github.com/trekhleb/javascript-algorithms](https://github.com/trekhleb/javascript-algorithms) |
| MDN — TypedArray | 二进制数据类型 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray) |
| TC39 — Object.groupBy Proposal | ES2024 分组方法规范 | [tc39.es/proposal-array-grouping](https://tc39.es/proposal-array-grouping/) |
| V8 Blog — Elements kinds in V8 | 数组内部类型优化 | [v8.dev/blog/elements-kinds](https://v8.dev/blog/elements-kinds) |
| MDN — WeakMap | 弱引用映射详解 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap) |
| MDN — ArrayBuffer | 二进制数据缓冲区 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) |
| MDN — SharedArrayBuffer | 共享内存缓冲区 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) |
| MDN — DataView | 多字节数据视图 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView) |
| V8 Blog — Design Elements Kinds | 数组性能优化内幕 | [v8.dev/blog/elements-kinds](https://v8.dev/blog/elements-kinds) |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
