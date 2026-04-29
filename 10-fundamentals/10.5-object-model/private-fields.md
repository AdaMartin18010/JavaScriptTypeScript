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

## 四、代码示例：高级私有字段模式

### 4.1 品牌类型（Branded Types）运行时保护

```typescript
// brand-type.ts —— 使用私有字段实现零开销品牌类型

type Brand<B> = { readonly __brand: B };
type Branded<T, B> = T & Brand<B>;

class UserId {
  readonly #brand = 'UserId' as const;
  constructor(readonly value: string) {}

  static from(value: string): Branded<string, 'UserId'> {
    return value as Branded<string, 'UserId'>;
  }
}

class OrderId {
  readonly #brand = 'OrderId' as const;
  constructor(readonly value: string) {}
}

// 编译时 + 运行时双重保护
function fetchUser(id: Branded<string, 'UserId'>) {
  return fetch(`/api/users/${id}`);
}

const userId = UserId.from('123');
const orderId = '456' as Branded<string, 'OrderId'>;

fetchUser(userId);   // ✅ 通过
// fetchUser(orderId); // ❌ 编译错误：类型不兼容
```

### 4.2 私有方法与静态块

```javascript
// private-methods.js —— ES2022 私有方法与静态初始化块

class SecureStorage {
  #data = new Map();
  #encryptionKey;

  // 静态私有字段
  static #algorithm = 'AES-GCM';

  // 静态块：类加载时执行一次性初始化
  static {
    if (!globalThis.crypto?.subtle) {
      throw new Error('Web Crypto API not available');
    }
    console.log(`SecureStorage initialized with ${this.#algorithm}`);
  }

  constructor() {
    this.#encryptionKey = this.#generateKey();
  }

  // 私有方法
  async #generateKey() {
    return crypto.subtle.generateKey(
      { name: SecureStorage.#algorithm, length: 256 },
      true,
      ['encrypt', 'decrypt'],
    );
  }

  async #encrypt(plaintext) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: SecureStorage.#algorithm, iv },
      this.#encryptionKey,
      new TextEncoder().encode(plaintext),
    );
    return { iv, ciphertext };
  }

  async set(key, value) {
    const encrypted = await this.#encrypt(value);
    this.#data.set(key, encrypted);
  }

  // 私有 getter
  get #size() {
    return this.#data.size;
  }

  get size() {
    return this.#size;
  }
}

const storage = new SecureStorage();
await storage.set('token', 'secret-value');
// storage.#encrypt('x'); // ❌ SyntaxError
```

### 4.3 组合多个私有字段实现状态机

```typescript
// state-machine.ts —— 私有字段封装状态转换逻辑

type State = 'idle' | 'loading' | 'success' | 'error';

class AsyncTask<T> {
  #state: State = 'idle';
  #result?: T;
  #error?: Error;
  #abortController = new AbortController();

  get state(): State {
    return this.#state;
  }

  get result(): T | undefined {
    if (this.#state !== 'success') return undefined;
    return this.#result;
  }

  async run(fn: (signal: AbortSignal) => Promise<T>): Promise<void> {
    if (this.#state === 'loading') {
      throw new Error('Task already running');
    }

    this.#state = 'loading';
    this.#error = undefined;

    try {
      this.#result = await fn(this.#abortController.signal);
      this.#state = 'success';
    } catch (e) {
      this.#error = e instanceof Error ? e : new Error(String(e));
      this.#state = 'error';
    }
  }

  cancel(): void {
    this.#abortController.abort();
    this.#abortController = new AbortController();
  }

  // 私有方法：状态转换的内部校验
  #assertTransition(from: State, to: State): void {
    const validTransitions: Record<State, State[]> = {
      idle: ['loading'],
      loading: ['success', 'error', 'idle'],
      success: ['idle'],
      error: ['idle'],
    };
    if (!validTransitions[from].includes(to)) {
      throw new Error(`Invalid transition: ${from} -> ${to}`);
    }
  }
}
```

---

## 五、内存模型分析

### 5.1 私有字段 vs WeakMap 封装

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

### 5.2 V8 的内存布局优化

V8 对私有字段的优化策略：

- **内联存储**：私有字段存储在对象的**内联槽（inline slots）**中，与公开属性共享 Hidden Class
- **固定偏移**：同一类的所有实例，私有字段具有**固定的内存偏移**
- **无字典模式**：私有字段不触发 Dictionary Mode 降级

---

## 六、批判性注意

### 6.1 私有字段的局限性

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

### 6.2 与 Proxy 的交互

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

## 七、决策树：何时使用私有字段

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

## 八、权威参考链接

- [ECMA-262 §15.7.3 Private Names](https://tc39.es/ecma262/#sec-private-names) — 私有字段规范定义
- [Class Fields Proposal (TC39)](https://github.com/tc39/proposal-class-fields) — 私有字段语言提案仓库
- [MDN: Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties) — MDN 私有属性文档
- [MDN: Static initialization blocks](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks) — 静态块文档
- [V8 Blog: Class fields performance](https://v8.dev/blog/fast-properties) — V8 属性访问与内存布局优化
- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html) — TypeScript 类与访问修饰符
- [Can I Use: Class private fields](https://caniuse.com/mdn-javascript_classes_private_class_fields) — 浏览器兼容性矩阵
- [JavaScript Engine Fundamentals: Shapes and Inline Caches](https://mathiasbynens.be/notes/shapes-ics) — Mathias Bynens 的 V8 对象模型详解
- [2ality: JavaScript class fields](https://2ality.com/2022/06/class-fields.html) — Dr. Axel Rauschmayer 的私有字段深度解析
- [WebKit Blog: Private class fields in JSC](https://webkit.org/blog/8479/release-notes-for-safari-technology-preview-98/) — Safari JavaScriptCore 私有字段实现

---

*本文件为对象模型专题的私有字段深度分析，涵盖形式化语义、内存模型与工程决策。*
