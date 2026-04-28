# 对象模型与原型链：形式语义与工程实现

> **定位**：`10-fundamentals/10.5-object-model/` — L1 语言核心层：对象模型专题
> **关联**：`jsts-code-lab/00-language-core/` | `30-knowledge-base/30.8-research/tsjs-stack-panorama-2026/01_language_core.md`
> **规范来源**：ECMA-262 §6.1.7 The Object Type | §9 Ordinary Object Internal Methods

---

## 一、核心命题

JavaScript 的对象模型建立在 **原型继承（Prototype-based Inheritance）** 之上，与主流的类继承（Class-based Inheritance）语言形成根本差异。理解原型链的形式语义，是掌握 JS 元编程、框架设计模式与 V8 优化机制的基础。

---

## 二、公理化基础

### 公理 1（对象公理）

JavaScript 中的对象是有属性的集合（collection of properties），每个属性是键值对的描述符（Descriptor）。对象自身**不存储方法**，方法只是值为函数的属性。

### 公理 2（原型公理）

每个对象（除 `Object.prototype` 外）具有内部槽 `[[Prototype]]`，指向其原型对象。属性查找遵循**原型链委托**（Prototype Chain Delegation），直至 `null`。

### 公理 3（委托公理）

对象与原型之间的关系是**委托**（Delegation）而非**复制**（Cloning）。修改原型会即时影响所有继承该原型的对象。

---

## 三、内部方法的形式化定义

ECMA-262 使用内部方法（Internal Methods）定义对象的行为接口：

| 内部方法 | 签名 | 语义 |
|---------|------|------|
| `[[GetPrototypeOf]]` | ( ) → Object \| Null | 返回对象的 `[[Prototype]]` |
| `[[SetPrototypeOf]]` | (Object \| Null) → Boolean | 设置对象的 `[[Prototype]]` |
| `[[Get]]` | (propertyKey, Receiver) → any | 获取属性值，含原型链遍历 |
| `[[Set]]` | (propertyKey, value, Receiver) → Boolean | 设置属性值 |
| `[[HasProperty]]` | (propertyKey) → Boolean | 检查属性存在（含原型链） |
| `[[Delete]]` | (propertyKey) → Boolean | 删除自有属性 |
| `[[OwnPropertyKeys]]` | ( ) → List of propertyKey | 返回自有属性键列表 |

### 3.1 `[[Get]]` 的形式化算法

```
O.[[Get]](P, Receiver)
1. 断言：P 是属性键（String 或 Symbol）
2. desc = O.[[GetOwnProperty]](P)
3. 若 desc 是 undefined
   a. parent = O.[[GetPrototypeOf]]()
   b. 若 parent 是 null，返回 undefined
   c. 返回 parent.[[Get]](P, Receiver)  // 递归委托
4. 若 desc 是数据描述符，返回 desc.[[Value]]
5. 若 desc 是访问器描述符
   a. getter = desc.[[Get]]
   b. 若 getter 是 undefined，返回 undefined
   c. 返回 Call(getter, Receiver)
```

**关键洞察**：原型链查找是**递归委托**过程，时间复杂度在最坏情况下为 $O(n)$（$n$ 为原型链长度），但 V8 通过 Inline Caching 将其优化至 $O(1)$ 均摊。

---

## 四、属性描述符（Property Descriptor）

### 4.1 数据描述符 vs 访问器描述符

| 属性 | 数据描述符 | 访问器描述符 |
|------|-----------|-------------|
| `[[Value]]` | ✅ 有 | ❌ 无 |
| `[[Writable]]` | ✅ 可配置 | ❌ 无 |
| `[[Get]]` | ❌ 无 | ✅ 有 |
| `[[Set]]` | ❌ 无 | ✅ 有 |
| `[[Enumerable]]` | ✅ 共享 | ✅ 共享 |
| `[[Configurable]]` | ✅ 共享 | ✅ 共享 |

### 4.2 描述符的操作语义

```javascript
// 数据描述符的创建与修改
const obj = {};
Object.defineProperty(obj, 'x', {
  value: 42,
  writable: false,
  enumerable: true,
  configurable: false
});

obj.x = 100;  // 静默失败（strict mode 下抛出 TypeError）
```

**定理（描述符不变性定理）**：若属性的 `[[Configurable]]` 为 `false`，则其类型（数据/访问器）不可变更，且 `[[Enumerable]]` 不可修改。

---

## 五、原型链的结构与可视化

### 5.1 标准对象的原型链

```
null
  ↑
Object.prototype
  ↑
Array.prototype  ←──  array = []
  ↑                    │
  └──  array 的 [[Prototype]] 指向 Array.prototype

Object.prototype
  ↑
Function.prototype  ←──  function fn() {}
  ↑                         │
  └──  fn 的 [[Prototype]] 指向 Function.prototype
  └──  fn.prototype 的 [[Prototype]] 指向 Object.prototype
```

### 5.2 `class` 语法糖的原型链

```javascript
class Animal {
  speak() { return 'sound'; }
}
class Dog extends Animal {
  speak() { return 'woof'; }
}

const dog = new Dog();
```

```
dog (实例)
  ↑ [[Prototype]]
Dog.prototype = { speak(), constructor }
  ↑ [[Prototype]]
Animal.prototype = { speak(), constructor }
  ↑ [[Prototype]]
Object.prototype
  ↑ [[Prototype]]
null
```

**关键洞察**：`class` 关键字不改变 JS 的原型继承本质，只是语法糖。`extends` 使用 `Object.setPrototypeOf` 建立原型链，`super()` 使用 `Reflect.construct` 调用父类构造函数。

---

## 六、原型链操作的形式化对比

| 操作 | 语法 | 规范方法 | 影响范围 | 性能影响 |
|------|------|---------|---------|---------|
| 创建时指定原型 | `Object.create(proto)` | `OrdinaryObjectCreate(proto)` | 新对象 | 无 |
| 运行时修改原型 | `Object.setPrototypeOf(obj, proto)` | `[[SetPrototypeOf]]` | 该对象及其后代查找 | ⚠️ 触发 V8 去优化 |
| 读取原型 | `Object.getPrototypeOf(obj)` | `[[GetPrototypeOf]]` | 只读 | 无 |
| `__proto__` 访问 | `obj.__proto__` | 遗留访问器 | 读写 | ⚠️ 非标准，避免使用 |

### 6.1 原型修改的性能灾难

V8 的 Hidden Class 优化**严格依赖对象原型的稳定性**。运行时修改原型会导致：

1. **Hidden Class 失效**：所有共享该 Hidden Class 的对象需重新分类
2. **Inline Cache 失效**：所有缓存该对象形状的 IC 需清除
3. **去优化（Deoptimization）**：已编译的优化代码回退到字节码

**工程戒律**：生产代码中**绝对禁止**使用 `Object.setPrototypeOf` 或 `__proto__`。

---

## 七、`instanceof` 的形式化语义

```
instanceof 运算符算法（简化）：
1. 获取 C 的 `prototype` 属性（非 `[[Prototype]]`）
2. 令 O = obj.[[GetPrototypeOf]]()
3. 循环：
   a. 若 O 是 null，返回 false
   b. 若 O === C.prototype，返回 true
   c. O = O.[[GetPrototypeOf]]()
```

**批判性注意**：`instanceof` 检查的是**原型链上的原型对象相等性**，而非构造函数本身。跨 Realm（iframe/worker）使用时可能失败。

---

## 八、与类继承语言的对比矩阵

| 维度 | JS 原型继承 | Java 类继承 | Python 混合继承 |
|------|-----------|------------|----------------|
| **继承机制** | 原型链委托 | 类层次结构 | MRO (C3 线性化) |
| **方法查找** | 运行时沿链委托 | 虚函数表 (vtable) | 运行时 MRO 查找 |
| **多态实现** | 原型链重写 | 方法重写 + 虚调用 | Duck Typing |
| **结构修改** | 运行时动态（可用） | 编译期固定 | 运行时动态（可用） |
| **性能优化** | Hidden Class + IC | vtable 直接分派 | 字典查找 + 缓存 |

---

## 九、后续文件索引

| 文件 | 主题 | 优先级 |
|------|------|--------|
| `property-descriptors.md` | 属性描述符深度分析 + 不变性模式 | P0 |
| `proxy-reflect.md` | Proxy 拦截器 + Reflect 元编程 | P0 |
| `private-fields.md` | 类私有字段 (#field) 的语义与内存模型 | P1 |

---

*本文件为 L1 对象模型专题的首篇，建立原型链的形式化基础。后续将深入属性描述符、Proxy/Reflect 元编程与私有字段的内存模型。*
