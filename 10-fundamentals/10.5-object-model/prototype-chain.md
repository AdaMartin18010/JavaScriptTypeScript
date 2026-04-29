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

### 3.2 代码示例：手动实现 `[[Get]]` 语义

```javascript
// prototype-get-simulation.js
function internalGet(obj, propertyKey) {
  let current = obj;
  while (current !== null) {
    const desc = Object.getOwnPropertyDescriptor(current, propertyKey);
    if (desc !== undefined) {
      if ('value' in desc) return desc.value; // 数据描述符
      if (desc.get) return desc.get.call(obj); // 访问器描述符
      return undefined;
    }
    current = Object.getPrototypeOf(current);
  }
  return undefined;
}

// 验证
const proto = { x: 10, get doubled() { return this.x * 2; } };
const child = Object.create(proto);
child.x = 5;

console.log(internalGet(child, 'x'));       // 5  (自有属性)
console.log(internalGet(child, 'doubled')); // 10 (访问器，this 绑定 child)
console.log(internalGet(child, 'y'));       // undefined
```

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

### 4.3 代码示例：访问器描述符与计算属性

```javascript
// accessor-descriptor-patterns.js
function createObservable(target) {
  const listeners = new Set();
  const wrapped = {};

  for (const key of Object.keys(target)) {
    let value = target[key];
    Object.defineProperty(wrapped, key, {
      enumerable: true,
      configurable: true,
      get() {
        console.log(`[GET] ${key}`);
        return value;
      },
      set(newValue) {
        if (value !== newValue) {
          const oldValue = value;
          value = newValue;
          listeners.forEach((cb) => cb(key, newValue, oldValue));
        }
      },
    });
  }

  wrapped.subscribe = (cb) => listeners.add(cb);
  return wrapped;
}

const state = createObservable({ count: 0 });
state.subscribe((k, v) => console.log(`[CHANGE] ${k} = ${v}`));
state.count = 5; // [GET] count (若先读取) / [CHANGE] count = 5
```

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

### 5.3 代码示例：`Object.create(null)` 与字典模式

```javascript
// dictionary-pattern.js
// 普通对象会从 Object.prototype 继承属性，导致键冲突风险
const unsafeMap = {};
if (unsafeMap.toString) { /* 意外为真！ */ }

// 创建无原型的纯净字典
const safeMap = Object.create(null);
console.log(safeMap.toString); // undefined
safeMap['__proto__'] = 'value'; // 不会触发原型污染

// 高性能键值统计（用于词频分析）
function countWords(text) {
  const counts = Object.create(null);
  for (const word of text.toLowerCase().match(/\w+/g) ?? []) {
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}
```

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

### 6.2 代码示例：原型污染攻击与防御

```javascript
// prototype-pollution-defense.js
// 攻击向量：合并对象时不检查键名
function unsafeMerge(target, source) {
  for (const key in source) {
    target[key] = source[key]; // 危险：key 可能为 '__proto__'
  }
}

// 防御策略一：使用 Object.create(null) 作为目标
function safeMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    if (key === '__proto__' || key === 'constructor') continue;
    target[key] = value;
  }
}

// 防御策略二：使用结构化克隆（Node.js 20+）
function structuredCloneMerge(obj) {
  return structuredClone(obj);
}

// 防御策略三：使用 Map 代替对象作为键值存储
const safeConfig = new Map();
safeConfig.set('__proto__', { polluted: true }); // 完全安全
```

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

### 7.1 代码示例：`instanceof` 的陷阱与替代方案

```javascript
// instanceof-patterns.js
// 问题：跨 iframe 的 Array 构造函数不同
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const IframeArray = iframe.contentWindow.Array;
const arr = new IframeArray(1, 2, 3);

console.log(arr instanceof Array);        // false!
console.log(arr instanceof IframeArray);  // true

// 替代方案一：使用 Array.isArray（推荐）
console.log(Array.isArray(arr)); // true

// 替代方案二：使用 Object.prototype.toString
console.log(Object.prototype.toString.call(arr) === '[object Array]'); // true

// 自定义类层次结构的 Symbol.hasInstance
class TypedBuffer {
  static [Symbol.hasInstance](instance) {
    return instance && typeof instance.read === 'function' && typeof instance.write === 'function';
  }
}

const mockBuffer = { read: () => {}, write: () => {} };
console.log(mockBuffer instanceof TypedBuffer); // true（基于鸭子类型）
```

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

## 九、代码示例：高性能原型模式（对象池）

```javascript
// object-pool-prototype.js
// 利用共享原型减少内存占用
function createPoolPrototype() {
  const PoolItemPrototype = {
    reset() {
      this.active = false;
      this.data = null;
    },
    activate(data) {
      this.active = true;
      this.data = data;
    },
  };

  const pool = [];
  return {
    acquire(data) {
      let item = pool.find((i) => !i.active);
      if (!item) {
        item = Object.create(PoolItemPrototype);
        pool.push(item);
      }
      item.activate(data);
      return item;
    },
    release(item) {
      item.reset();
    },
    size() {
      return pool.length;
    },
  };
}

// 所有 pool item 共享同一个原型，方法不重复创建
const particlePool = createPoolPrototype();
const p1 = particlePool.acquire({ x: 0, y: 0 });
const p2 = particlePool.acquire({ x: 10, y: 10 });
console.log(p1.reset === p2.reset); // true（共享原型方法）
```

---

## 十、后续文件索引

| 文件 | 主题 | 优先级 |
|------|------|--------|
| `property-descriptors.md` | 属性描述符深度分析 + 不变性模式 | P0 |
| `proxy-reflect.md` | Proxy 拦截器 + Reflect 元编程 | P0 |
| `private-fields.md` | 类私有字段 (#field) 的语义与内存模型 | P1 |

---

## 十一、权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| ECMA-262 §6.1.7 The Object Type | 对象类型的规范定义 | [tc39.es/ecma262/#sec-object-type](https://tc39.es/ecma262/#sec-object-type) |
| ECMA-262 §9 Ordinary Object Internal Methods | 普通对象内部方法 | [tc39.es/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots](https://tc39.es/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots) |
| ECMA-262 §19.1.2 Object 对象 | Object.create / getPrototypeOf / setPrototypeOf | [tc39.es/ecma262/#sec-properties-of-the-object-constructor](https://tc39.es/ecma262/#sec-properties-of-the-object-constructor) |
| MDN：继承与原型链 | 可视化教程 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain) |
| MDN：Object.create | API 参考 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/create) |
| MDN：属性描述符 | defineProperty 详解 | [developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| V8 博客：Fast Properties | Hidden Class 与属性访问优化 | [v8.dev/blog/fast-properties](https://v8.dev/blog/fast-properties) |
| V8 博客：Setting the prototype | 修改原型的性能影响 | [v8.dev/blog/fast-properties#setting-the-prototype](https://v8.dev/blog/fast-properties#setting-the-prototype) |
| OWASP：Prototype Pollution | 原型污染安全指南 | [owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Prototype_Pollution](https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/07-Input_Validation_Testing/18-Testing_for_Prototype_Pollution) |
| JavaScript Engine Fundamentals (Mathias Bynens) | 引擎优化原理解析 | [mathiasbynens.be/notes/prototypes](https://mathiasbynens.be/notes/prototypes) |

---

*本文件为 L1 对象模型专题的首篇，建立原型链的形式化基础。后续将深入属性描述符、Proxy/Reflect 元编程与私有字段的内存模型。*
