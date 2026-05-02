---
title: 02 - 原型链深度
description: 深入解析 [[Prototype]]、属性查找机制、原型污染攻击与防护，以及 V8 对原型链访问的 Inline Cache 优化。
---

# 02 - 原型链深度

## `[[Prototype]]` 内部槽

每个 JavaScript 对象都有一个不可直接访问的内部槽 `[[Prototype]]`，可通过以下方式操作：

```js
const a = {};
const b = { x: 1 };

// 标准方式
Object.setPrototypeOf(a, b); // 修改原型，性能代价大
Object.getPrototypeOf(a) === b; // true

// 遗留方式（已弃用，但引擎广泛支持）
a.__proto__ === b; // true
```

> **引擎提示**：`Object.setPrototypeOf` 或 `__proto__` 会强制 V8 将对象标记为 **Prototype Mutation**，该对象的 Inline Cache 会被重置，后续属性访问退化为 **Megamorphic**。

---

## 原型链构建：Object.create

```js
const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;

// 原型链：rabbit → animal → Object.prototype → null
```

```mermaid
graph LR
    rabbit[rabbit<br/>{ jumps: true }] --> animal[animal<br/>{ eats: true }]
    animal --> obj[Object.prototype]
    obj --> null[null]
```

---

## 属性查找算法

当访问 `obj.prop` 时，引擎执行以下步骤：

1. 检查 `obj` 自身的 **Fast Properties / Dictionary**。
2. 若未命中，沿 `[[Prototype]]` 向上遍历。
3. 每访问一层原型，检查该原型的 Map 与属性。
4. 到达原型链末端仍未命中 → 返回 `undefined`（或触发 Setter/Proxy 拦截）。

```mermaid
sequenceDiagram
    participant Engine as V8 Engine
    participant O1 as obj (own)
    participant O2 as proto1
    participant O3 as proto2
    participant End as undefined

    Engine->>O1: Load IC: check Map + offset
    alt Hit
        O1-->>Engine: return value
    else Miss
        Engine->>O2: Load IC: check proto's Map
        alt Hit
            O2-->>Engine: return value
        else Miss
            Engine->>O3: Load IC: check proto2's Map
            alt Hit
                O3-->>Engine: return value
            else Miss
                Engine->>End: return undefined
            end
        end
    end
```

### V8 原型链 Inline Cache

V8 使用 **Polymorphic Load IC** 缓存原型链查找：

- **Monomorphic**：原型链上的每个对象 Map 都固定，可缓存完整查找路径。
- **Polymorphic**：原型链形状有少量变体（通常 ≤ 4），仍可走 IC。
- **Megamorphic**：频繁修改原型或属性布局，IC 失效，退化为通用 C++ 查找。

---

## 原型污染（Prototype Pollution）

攻击者通过污染 `Object.prototype` 上的属性，影响所有对象：

```js
// 危险代码（如解析不可信 JSON 或合并对象）
const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
const victim = {};
merge(victim, malicious); // 若 merge 未防护
console.log(victim.isAdmin); // true
```

### 防护策略

| 策略 | 实现 | 代价 |
|---|---|---|
| 拒绝 `__proto__` 键 | `if (key === '__proto__') continue` | 低 |
| 使用 `Object.create(null)` | 无原型对象 | 失去基础方法 |
| 使用 `Object.defineProperty` 冻结原型 | `Object.freeze(Object.prototype)` | 彻底，但可能破坏库 |
| 使用 `Object.hasOwn` / `hasOwnProperty` | 只信任自身属性 | 代码侵入性 |
| `structuredClone` / JSON 解析后白名单过滤 | 事前过滤 | 安全最高 |

```js
// 安全 merge 示例
function safeMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (key === '__proto__' || key === 'constructor') continue;
    if (Object.hasOwn(source, key)) {
      target[key] = source[key];
    }
  }
  return target;
}
```

---

## 内存图：原型链的 V8 表示

```mermaid
graph TB
    subgraph Instance
        R[rabbit JSObject]
        R_Map[Map: {jumps}]
    end

    subgraph Prototype1
        A[animal JSObject]
        A_Map[Map: {eats}]
    end

    subgraph Prototype2
        O[Object.prototype]
        O_Map[Map: {...built-ins}]
    end

    R -->|[[Prototype]]| A
    R --> R_Map
    A -->|[[Prototype]]| O
    A --> A_Map
    O -->|[[Prototype]]| NULL[null]
    O --> O_Map
```

> V8 中，原型对象本身也是 JSObject，有自己的 Map。修改原型对象的属性（如给 `animal` 添加新属性）会使所有以 `animal` 为原型的实例的 **Load IC 失效**，因为原型链的 Shape 发生了变化。

---

## 性能对比：自身属性 vs 原型链属性

| 访问类型 | Inline Cache 状态 | 相对性能 |
|---|---|---|
| 自身 Fast 属性 | Monomorphic | 1.0×（基准） |
| 自身 Dictionary 属性 | Megamorphic | 0.03× |
| 原型链 1 层 | Monomorphic | 0.7× |
| 原型链 2+ 层 | Polymorphic | 0.4× |
| 原型链频繁修改 | Megamorphic | 0.05× |

```js
// 基准：自身属性
function ownProp(obj) {
  let s = 0;
  for (let i = 0; i < 1e7; i++) s += obj.x;
  return s;
}

// 原型链 1 层
function proto1(obj) {
  let s = 0;
  for (let i = 0; i < 1e7; i++) s += obj.x;
  return s;
}
const base = { x: 1 };
const child = Object.create(base);

// 原型链 2 层
const grand = { x: 1 };
const parent = Object.create(grand);
const self = Object.create(parent);
```

> **关键结论**：原型链访问比自身属性慢约 30%–60%，但仍远快于字典模式。真正的性能杀手是 **运行时修改原型**（`setPrototypeOf`、给原型动态添加属性），这会导致所有相关 IC 失效。

---

## 小结

- `[[Prototype]]` 是内部槽，`__proto__` 是其遗留访问器。
- 原型链查找可被 V8 Inline Cache 加速，前提是原型链结构稳定。
- **永远不要**在热路径上调用 `Object.setPrototypeOf`。
- 原型污染是真实的安全威胁，处理不可信数据时必须使用 `Object.hasOwn` 或 `Object.create(null)`。
