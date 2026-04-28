# 类私有字段（Class Private Fields）：语义与内存模型

> **定位**：`10-fundamentals/10.5-object-model/`
> **规范来源**：ECMA-262 §15.7.3 Private Names | ES2022 Class Fields

---

## 一、核心命题

ES2022 引入的**私有字段（Private Fields）**通过 `#field` 语法，为 JavaScript 提供了真正的**封装机制**。与基于命名约定（`_private`）或 WeakMap 的模拟方案不同，私有字段在语言层面保证不可从类外部访问。

---

## 二、形式化语义

### 2.1 Private Name 的概念

ECMA-262 引入了 **Private Name** 作为规范级别的抽象标识符：

- 每个 `#field` 在类定义时创建一个唯一的 Private Name
- Private Name **不是 String 或 Symbol**，是一种全新的键类型
- Private Name 仅在**词法作用域**内可见（类的 `{}` 内）

### 2.2 内部方法扩展

私有字段需要扩展对象内部方法：

| 新增内部方法 | 语义 |
|-------------|------|
| `[[PrivateFieldFind]](P)` | 在对象的 `[[PrivateElements]]` 中查找私有字段 |
| `[[PrivateFieldGet]](P)` | 获取私有字段值 |
| `[[PrivateFieldSet]](P, value)` | 设置私有字段值 |
| `[[PrivateFieldAdd]](P, value)` | 初始化私有字段（构造函数中） |

### 2.3 对象的扩展结构

```
普通对象内部结构（含私有字段）：
{
  [[Prototype]]: ...,        // 原型链
  [[Extensible]]: true,
  [[PrivateElements]]: [     // [NEW] 私有元素列表
    { key: #x, value: 1 },
    { key: #y, value: 2 }
  ],
  // ... 公开属性
}
```

---

## 三、语法与行为

### 3.1 基础语法

```javascript
class Counter {
  #count = 0;           // 私有字段声明 + 初始化

  increment() {
    this.#count++;      // 类内部可访问
  }

  get #formatted() {   // 私有访问器
    return `Count: ${this.#count}`;
  }

  static #instances = 0; // 静态私有字段
}

const c = new Counter();
c.#count;              // ❌ SyntaxError：类外部不可访问
c['_count'];           // ❌ undefined：不是命名约定
```

### 3.2 关键行为特征

| 特征 | 行为 | 与 `_private` 的差异 |
|------|------|-------------------|
| **外部访问** | `SyntaxError` | 可以访问（只是约定） |
| **子类访问** | ❌ 不可访问 | ✅ 可以访问 |
| **Reflect 访问** | ❌ 无陷阱 | ✅ `Reflect.get` 可用 |
| **Proxy 拦截** | ❌ 不可拦截 | ✅ `get` 陷阱可拦截 |
| **结构化克隆** | ✅ 保留 | ✅ 保留 |
| **属性枚举** | ❌ 不出现 | ✅ `Object.keys` 包含 |

---

## 四、内存模型分析

### 4.1 私有字段 vs WeakMap 封装

```javascript
// WeakMap 模拟方案（ES2015-2021）
const _count = new WeakMap();
class Counter {
  constructor() { _count.set(this, 0); }
  increment() { _count.set(this, _count.get(this) + 1); }
}

// 私有字段方案（ES2022+）
class Counter {
  #count = 0;
  increment() { this.#count++; }
}
```

| 维度 | WeakMap | 私有字段 |
|------|---------|---------|
| **性能** | 哈希查找 | 直接偏移（V8 优化后） |
| **调试** | 开发者工具不可见 | 开发者工具可见（Chrome） |
| **子类访问** | 共享 WeakMap 可访问 | 词法隔离，不可访问 |
| **内存** | WeakMap 本身占内存 | 内联在对象结构中 |

### 4.2 V8 的内存布局优化

V8 对私有字段的优化策略：

- **内联存储**：私有字段存储在对象的**内联槽（inline slots）**中，与公开属性共享 Hidden Class
- **固定偏移**：同一类的所有实例，私有字段具有**固定的内存偏移**
- **无字典模式**：私有字段不触发 Dictionary Mode 降级

---

## 五、批判性注意

### 5.1 私有字段的局限性

1. **不可从类外部访问，即使是测试代码**：

   ```javascript
   // 测试中获取私有字段的 hack（不推荐）
   const desc = Object.getOwnPropertySymbols(c); // 不返回 Private Name
   // Private Name 完全不可从外部引用
   ```

2. **子类不可访问父类私有字段**：

   ```javascript
   class Parent { #x = 1; }
   class Child extends Parent {
     getX() { return this.#x; } // ❌ SyntaxError
   }
   ```

   这与 Java/C# 的 `protected` 不同。若需子类访问，需用 `protected` 模式（公开 getter）。

3. **TypeScript 中的 `#private` vs `private`**：

   ```typescript
   class A {
     private x = 1;    // TS 私有：编译后变为 public（仅类型检查）
     #y = 2;           // ES 私有：运行时真正不可访问
   }
   ```

### 5.2 与 Proxy 的交互

**Proxy 无法拦截私有字段访问**。这是设计上的刻意选择：

```javascript
class Secret {
  #value = 'hidden';
  get() { return this.#value; }
}

const proxy = new Proxy(new Secret(), {
  get(target, prop) {
    console.log('intercepted:', prop);
    return Reflect.get(target, prop);
  }
});

proxy.get();           // Proxy 拦截 get 陷阱
proxy.#value;          // ❌ SyntaxError（外部访问）
```

---

## 六、决策树：何时使用私有字段

```
需要封装？
├── 是 → 需要运行时保护？
│   ├── 是 → 使用 #private（ES2022+）
│   │   └── 需要子类访问？
│   │       ├── 是 → 改用 protected getter / Symbol 键
│   │       └── 否 → #private 是最佳选择
│   └── 否 → 仅需类型检查保护？
│       └── → TypeScript private（编译期）
└── 否 → 公开属性即可
```

---

*本文件为对象模型专题的私有字段深度分析，涵盖形式化语义、内存模型与工程决策。*
