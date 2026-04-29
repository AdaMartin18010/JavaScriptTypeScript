# 属性描述符：不变性模式与元编程

> **定位**：`10-fundamentals/10.5-object-model/`
> **规范来源**：ECMA-262 §6.1.7.1 Property Attributes

---

## 一、属性描述符的形式化定义

ECMA-262 将属性描述符定义为**记录（Record）**，含以下字段：

| 字段 | 数据描述符 | 访问器描述符 | 默认值 |
|------|-----------|-------------|--------|
| `[[Value]]` | ✅ | ❌ | `undefined` |
| `[[Writable]]` | ✅ | ❌ | `false` |
| `[[Get]]` | ❌ | ✅ | `undefined` |
| `[[Set]]` | ❌ | ✅ | `undefined` |
| `[[Enumerable]]` | ✅ | ✅ | `false` |
| `[[Configurable]]` | ✅ | ✅ | `false` |

---

## 二、数据描述符 vs 访问器描述符 深度对比

| 维度 | 数据描述符（Data Descriptor） | 访问器描述符（Accessor Descriptor） |
|------|---------------------------|----------------------------------|
| **存储内容** | 原始值（`[[Value]]`） | getter/setter 函数（`[[Get]]`/`[[Set]]`） |
| **可写控制** | `[[Writable]]` | 由 setter 是否存在控制 |
| **读取行为** | 直接返回 `[[Value]]` | 调用 `[[Get]]()` 并返回其结果 |
| **写入行为** | 直接修改 `[[Value]]` | 调用 `[[Set]](value)` |
| **默认值陷阱** | 字面量赋值默认 `writable: true, enumerable: true, configurable: true` | `Object.defineProperty` 默认全为 `false` |
| **典型用例** | 普通属性、常量、私有字段模拟 | 计算属性、依赖追踪、数据绑定 |
| **性能特征** | 直接内存访问，V8 可内联优化 | 函数调用开销，优化受限 |

---

## 三、不变性模式矩阵

| 模式 | 配置 | 效果 | 用例 |
|------|------|------|------|
| **Prevent Extensions** | `Object.preventExtensions(obj)` | 禁止新增属性 | 密封配置对象 |
| **Seal** | `Object.seal(obj)` | 禁止增删 + 描述符不可变 | 保护对象结构 |
| **Freeze** | `Object.freeze(obj)` | Seal + 所有属性只读 | 常量对象 |
| **Define Property** | `Object.defineProperty` | 精确控制单属性 | 计算属性、私有模拟 |

---

## 四、描述符操作的形式化规则

### 4.1 不可配置属性的限制

若 `[[Configurable]]` 为 `false`：

- ❌ 不可删除该属性
- ❌ 不可将数据描述符改为访问器描述符（或反之）
- ❌ 不可修改 `[[Enumerable]]`
- ⚠️ 可将 `[[Writable]]` 从 `true` 改为 `false`（单向）

### 4.2 严格模式 vs 非严格模式

| 操作 | 非严格模式 | 严格模式 |
|------|-----------|---------|
| 修改只读属性 | 静默失败 | `TypeError` |
| 删除不可配置属性 | 返回 `false` | `TypeError` |
| 访问未定义 getter | `undefined` | `undefined` |

---

## 五、代码示例：`defineProperty` 高级模式

```javascript
// ============================================
// 模式 1：只读计算属性（getter only）
// ============================================

const circle = {
  radius: 5
};

Object.defineProperty(circle, 'area', {
  get() {
    return Math.PI * this.radius * this.radius;
  },
  enumerable: true,
  configurable: true
});

console.log(circle.area); // ~78.54
circle.radius = 10;
console.log(circle.area); // ~314.16
// circle.area = 100;     // ❌ 无 setter，严格模式 TypeError

// ============================================
// 模式 2：私有状态封装（闭包 + defineProperty）
// ============================================

function createCounter() {
  let count = 0; // 真正的私有变量，无法从外部访问

  const counter = {};

  Object.defineProperty(counter, 'value', {
    get() { return count; },
    enumerable: true,
    configurable: false
  });

  Object.defineProperty(counter, 'increment', {
    value: function() { count++; },
    writable: false,
    enumerable: false, // 方法通常不可枚举
    configurable: false
  });

  Object.defineProperty(counter, 'reset', {
    value: function() { count = 0; },
    writable: false,
    enumerable: false,
    configurable: false
  });

  return Object.seal(counter); // 禁止增删属性
}

const c = createCounter();
c.increment();
console.log(c.value); // 1
c.increment();
console.log(c.value); // 2
// c.value = 999;     // ❌ 严格模式 TypeError：只读属性
// delete c.value;    // ❌ 不可配置

// ============================================
// 模式 3：数据验证 setter
// ============================================

const user = {};

Object.defineProperty(user, 'age', {
  get() {
    return this._age;
  },
  set(value) {
    if (!Number.isInteger(value) || value < 0 || value > 150) {
      throw new TypeError('Invalid age');
    }
    this._age = value;
  },
  enumerable: true,
  configurable: true
});

user.age = 25;  // ✅
console.log(user.age); // 25
// user.age = -5; // ❌ TypeError: Invalid age
// user.age = 200; // ❌ TypeError: Invalid age

// ============================================
// 模式 4：惰性初始化（Lazy Initialization）
// ============================================

const database = {};

Object.defineProperty(database, 'connection', {
  get() {
    // 首次访问时创建，之后替换为数据描述符直接返回
    const conn = createExpensiveConnection();
    Object.defineProperty(database, 'connection', {
      value: conn,
      writable: false,
      enumerable: true,
      configurable: false
    });
    return conn;
  },
  configurable: true,
  enumerable: true
});

function createExpensiveConnection() {
  console.log('Creating expensive connection...');
  return { id: Math.random(), query: (sql) => [/* ... */] };
}

console.log(database.connection); // Creating expensive connection... { id: ..., query: ... }
console.log(database.connection); // 直接返回缓存值，无日志

// ============================================
// 模式 5：Freeze 递归（深度不可变）
// ============================================

function deepFreeze(obj) {
  // 先冻结自身
  Object.freeze(obj);

  // 递归冻结所有引用类型的属性值
  Object.getOwnPropertyNames(obj).forEach(name => {
    const prop = obj[name];
    if (prop !== null && (typeof prop === 'object' || typeof prop === 'function')) {
      deepFreeze(prop);
    }
  });

  return obj;
}

const config = deepFreeze({
  server: {
    host: 'localhost',
    port: 3000,
    ssl: {
      cert: '/path/to/cert',
      key: '/path/to/key'
    }
  },
  features: ['auth', 'billing']
});

// config.server.port = 8080;           // ❌ 严格模式 TypeError
// config.server.ssl.cert = 'hacked';   // ❌ 递归冻结生效
// config.features.push('new');         // ❌ 数组也被冻结

// ============================================
// 模式 6：Property Descriptor 自省工具
// ============================================

function describeObject(obj) {
  const result = {};
  for (const key of Reflect.ownKeys(obj)) {
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    const type = desc.get || desc.set ? 'accessor'
                : desc.writable ? 'data-mutable'
                : 'data-readonly';
    result[key] = {
      type,
      configurable: desc.configurable,
      enumerable: desc.enumerable,
      value: desc.value,
      hasGetter: !!desc.get,
      hasSetter: !!desc.set,
    };
  }
  return result;
}

console.log(describeObject(circle));
// {
//   radius: { type: 'data-mutable', configurable: true, enumerable: true, value: 10 },
//   area:   { type: 'accessor', configurable: true, enumerable: true, hasGetter: true, hasSetter: false }
// }
```

---

## 六、工程实践：用描述符实现品牌类型（Branded Types）

```typescript
// 模拟名义类型：创建不可伪造的品牌属性
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function UserId(id: string): UserId {
  return id as UserId;
}

function OrderId(id: string): OrderId {
  return id as OrderId;
}

// 编译期防止混用
const uid = UserId('u-123');
const oid = OrderId('o-456');

function getUser(id: UserId) { /* ... */ }
getUser(oid); // ❌ TS Error：类型不兼容
```

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **ECMA-262 §6.1.7.1** | Property Attributes 规范定义 | [tc39.es/ecma262/#sec-property-attributes](https://tc39.es/ecma262/#sec-property-attributes) |
| **MDN: Object.defineProperty** | 开发者文档与完整示例 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) |
| **MDN: Object.freeze / seal / preventExtensions** | 不变性模式 API 参考 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) |
| **JavaScript Info: Property Descriptors** | 交互式教程 | [javascript.info/property-descriptors](https://javascript.info/property-descriptors) |
| **Dr. Axel Raulschmayer: Property Descriptors in Depth** | 2ality 深度文章 | [2ality.com/2016/02/object-property-definitions.html](https://2ality.com/2016/02/object-property-definitions.html) |
| **Reflect API (ES2015)** | 程序化操作描述符的现代方式 | [tc39.es/ecma262/#sec-reflect-object](https://tc39.es/ecma262/#sec-reflect-object) |

---

*本文件为对象模型专题的属性描述符深度分析，已增强对比表与代码示例。*
