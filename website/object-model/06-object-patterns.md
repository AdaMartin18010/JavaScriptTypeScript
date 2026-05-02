---
title: 对象模式与设计模式
description: 'JavaScript对象导向设计模式：工厂、混入、组合、冻结密封等高级对象操作技巧'
keywords: '对象模式, 工厂模式, Mixin, 组合优于继承, Object.freeze, Object.seal, Symbol'
---

# 对象模式与设计模式

> **核心问题**: 在JavaScript中如何优雅地组织对象关系？何时用继承，何时用组合？

## 1. 创建模式

### 1.1 工厂模式

```javascript
// 简单工厂
function createUser(type, data) {
  const creators = {
    admin: () => new AdminUser(data),
    member: () => new MemberUser(data),
    guest: () => new GuestUser(data)
  };

  const creator = creators[type];
  if (!creator) throw new Error(`Unknown user type: ${type}`);
  return creator();
}

// 抽象工厂
class UIFactory {
  createButton() { throw new Error('Abstract'); }
  createInput() { throw new Error('Abstract'); }
}

class WebUIFactory extends UIFactory {
  createButton() { return document.createElement('button'); }
  createInput() { return document.createElement('input'); }
}
```

### 1.2 建造者模式

```javascript
class QueryBuilder {
  #parts = [];

  select(columns) {
    this.#parts.push({ type: 'SELECT', columns });
    return this;
  }

  from(table) {
    this.#parts.push({ type: 'FROM', table });
    return this;
  }

  where(condition) {
    this.#parts.push({ type: 'WHERE', condition });
    return this;
  }

  build() {
    return this.#parts.map(p => `${p.type} ${p.columns || p.table || p.condition}`).join(' ');
  }
}

const query = new QueryBuilder()
  .select('id, name')
  .from('users')
  .where('age > 18')
  .build();
// "SELECT id, name FROM users WHERE age > 18"
```

## 2. 组合 vs 继承

### 2.1 继承的问题

```javascript
// ❌ 继承层次过深
class Animal {
  walk() {}
}
class Mammal extends Animal {
  feedMilk() {}
}
class Dog extends Mammal {
  bark() {}
}
class RobotDog extends Dog {
  // 不想feedMilk但无法移除！
  charge() {}
}
```

**继承的脆弱基类问题**：修改基类可能意外破坏所有子类。

### 2.2 组合的优势

```javascript
// ✅ 组合：灵活组装行为
const walker = {
  walk() { console.log('Walking'); }
};

const barker = {
  bark() { console.log('Woof!'); }
};

const charger = {
  charge() { console.log('Charging...'); }
};

// 组装真实狗
function createDog() {
  return Object.assign({}, walker, barker);
}

// 组装机器狗
function createRobotDog() {
  return Object.assign({}, walker, barker, charger);
}
```

### 2.3 Mixin模式

```javascript
// Mixin工厂
const TimestampMixin = (Base) => class extends Base {
  constructor(...args) {
    super(...args);
    this.createdAt = new Date();
  }

  getAge() {
    return Date.now() - this.createdAt.getTime();
  }
};

const SerializableMixin = (Base) => class extends Base {
  toJSON() {
    return JSON.stringify(this);
  }

  fromJSON(json) {
    return Object.assign(this, JSON.parse(json));
  }
};

// 组合使用
class User {
  constructor(name) {
    this.name = name;
  }
}

class EnhancedUser extends TimestampMixin(SerializableMixin(User)) {
  // 同时拥有 timestamp 和 serialization 能力
}
```

## 3. 对象不变性

### 3.1 冻结、密封、扩展

```javascript
const obj = { a: 1, b: { c: 2 } };

// Object.preventExtensions — 禁止添加新属性
Object.preventExtensions(obj);
obj.d = 4; // 静默失败（strict mode报错）

// Object.seal — preventExtensions + 属性不可配置
Object.seal(obj);
delete obj.a; // 失败
obj.a = 10;   // 成功（值可修改）

// Object.freeze — seal + 属性只读（浅冻结）
Object.freeze(obj);
obj.a = 10;   // 失败
obj.b.c = 20; // ⚠️ 成功！深层未冻结

// 深度冻结
function deepFreeze(obj) {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  });
  return Object.freeze(obj);
}
```

### 3.2 Immutable.js vs 原生方案

| 方案 | 语法 | 性能 | 学习曲线 |
|------|------|------|----------|
| Object.freeze | 原生 | 好 | 低 |
| structuredClone | 原生 | 一般 | 低 |
| Immutable.js | 库 | 优秀 | 高 |
| Immer | 库 | 好 | 低 |

```javascript
// Immer：可变语法，不可变结果
import { produce } from 'immer';

const nextState = produce(state, draft => {
  draft.users.push(newUser); // 看起来像修改
  draft.settings.theme = 'dark';
}); // 实际返回新对象
```

## 4. Symbol作为键

### 4.1 Symbol的 unique 特性

```javascript
const id = Symbol('id');
const secret = Symbol('secret');

const user = {
  name: 'Alice',
  [id]: 12345,
  [secret]: 'hidden-value'
};

// Symbol键不出现在常规遍历中
Object.keys(user); // ['name']
Object.getOwnPropertyNames(user); // ['name']

// 需要专门获取
Object.getOwnPropertySymbols(user); // [Symbol(id), Symbol(secret)]
Reflect.ownKeys(user); // ['name', Symbol(id), Symbol(secret)]
```

### 4.2 Well-known Symbols

```javascript
class MyCollection {
  #items = [];

  // 使对象可迭代
  *[Symbol.iterator]() {
    yield* this.#items;
  }

  // 自定义类型转换
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.#items.length;
    return `[Collection ${this.#items.length} items]`;
  }

  // 自定义instanceof行为
  static [Symbol.hasInstance](instance) {
    return instance && typeof instance.add === 'function';
  }
}
```

## 5. 对象操作陷阱

### 5.1 Object.assign的坑

```javascript
const defaults = { a: 1, b: { nested: true } };
const config = Object.assign({}, defaults);

config.b.nested = false;
console.log(defaults.b.nested); // false！引用被共享

// ✅ 正确做法：深拷贝
const config2 = structuredClone(defaults);
// 或
const config3 = JSON.parse(JSON.stringify(defaults)); // 丢失函数/Symbol/undefined
```

### 5.2 for...in vs Object.keys

```javascript
class Parent {
  parentProp = 'parent';
}
class Child extends Parent {
  childProp = 'child';
}

const c = new Child();

for (const key in c) {
  console.log(key); // parentProp, childProp（包括继承属性）
}

Object.keys(c); // ['childProp']（仅自身可枚举）
Object.getOwnPropertyNames(c); // 所有自身属性
```

## 6. Mixin 模式进阶

### 6.1 带依赖注入的Mixin

```javascript
// 可配置行为的Mixin
const LoggableMixin = (options = {}) => (Base) => class extends Base {
  #logger = options.logger || console;
  #prefix = options.prefix || '[Loggable]';

  log(message) {
    this.#logger.log(`${this.#prefix} ${message}`);
  }

  error(message) {
    this.#logger.error(`${this.#prefix} ${message}`);
  }
};

const AuditableMixin = (Base) => class extends Base {
  #auditLog = [];

  audit(action, details) {
    this.#auditLog.push({
      timestamp: new Date(),
      action,
      details,
      user: this.id || 'anonymous'
    });
  }

  getAuditLog() {
    return [...this.#auditLog];
  }
};

// 使用
class Entity {
  constructor(id) { this.id = id; }
}

class User extends LoggableMixin({ prefix: '[User]' })(AuditableMixin(Entity)) {
  updateProfile(data) {
    this.log('Updating profile...');
    this.audit('PROFILE_UPDATE', data);
    // ...
  }
}
```

### 6.2 Mixin 组合顺序与冲突解决

```javascript
// 冲突检测Mixin
function withConflictDetection(...mixins) {
  return (Base) => {
    const methodMap = new Map();

    const MixedClass = mixins.reduce((Current, Mixin) => {
      const Next = Mixin(Current);

      // 检测方法冲突
      const prototype = Next.prototype;
      for (const name of Object.getOwnPropertyNames(prototype)) {
        if (name === 'constructor') continue;
        if (methodMap.has(name) && methodMap.get(name) !== prototype[name]) {
          console.warn(`Method conflict detected: ${name}`);
        }
        methodMap.set(name, prototype[name]);
      }

      return Next;
    }, Base);

    return MixedClass;
  };
}

// 使用
class Service extends withConflictDetection(
  LoggableMixin(),
  AuditableMixin,
  CacheableMixin
)(BaseService) {}
```

---

## 7. 组合模式进阶

### 7.1 基于委托的组合

```javascript
// 比 Object.assign 更灵活的组合模式
function compose(target, ...sources) {
  for (const source of sources) {
    const descriptors = Object.getOwnPropertyDescriptors(source);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (key === 'constructor') continue;

      // 保留 getter/setter
      Object.defineProperty(target, key, descriptor);
    }
  }
  return target;
}

const flyable = {
  _altitude: 0,
  get altitude() { return this._altitude; },
  fly(to) { this._altitude = to; return this; },
  land() { this._altitude = 0; return this; }
};

const swimmable = {
  _depth: 0,
  get depth() { return this._depth; },
  dive(to) { this._depth = to; return this; },
  surface() { this._depth = 0; return this; }
};

// 组合：鸭子（能飞能游）
function createDuck() {
  return compose({}, flyable, swimmable, {
    quack() { console.log('Quack!'); return this; }
  });
}

const duck = createDuck();
duck.fly(100).dive(5).quack();
console.log(duck.altitude, duck.depth); // 100 5
```

### 7.2 策略模式与组合

```javascript
// 策略定义
const strategies = {
  json: {
    serialize: (data) => JSON.stringify(data),
    deserialize: (str) => JSON.parse(str),
    contentType: 'application/json'
  },
  form: {
    serialize: (data) => new URLSearchParams(data).toString(),
    deserialize: (str) => Object.fromEntries(new URLSearchParams(str)),
    contentType: 'application/x-www-form-urlencoded'
  },
  multipart: {
    serialize: (data) => {
      const form = new FormData();
      for (const [key, value] of Object.entries(data)) {
        form.append(key, value);
      }
      return form;
    },
    deserialize: (formData) => Object.fromEntries(formData),
    contentType: 'multipart/form-data'
  }
};

// 策略组合器
function createSerializer(strategyName, ...middleware) {
  const strategy = strategies[strategyName];
  if (!strategy) throw new Error(`Unknown strategy: ${strategyName}`);

  return {
    serialize: (data) => middleware.reduce(
      (result, mw) => mw.beforeSerialize ? mw.beforeSerialize(result) : result,
      strategy.serialize(data)
    ),
    deserialize: (str) => {
      let result = strategy.deserialize(str);
      for (const mw of middleware.reverse()) {
        result = mw.afterDeserialize ? mw.afterDeserialize(result) : result;
      }
      return result;
    },
    contentType: strategy.contentType
  };
}

// 使用
const apiClient = createSerializer('json',
  { beforeSerialize: (data) => ({ ...data, timestamp: Date.now() }) },
  { afterDeserialize: (data) => ({ ...data, parsedAt: Date.now() }) }
);
```

---

## 8. Immutable 模式深度实践

### 8.1 原生不可变方案

```javascript
// 使用 Proxy 实现自动不可变（开发环境）
function immutable(obj) {
  return new Proxy(obj, {
    set(target, prop, value) {
      throw new Error(`Cannot mutate immutable object property: ${String(prop)}`);
    },
    deleteProperty(target, prop) {
      throw new Error(`Cannot delete immutable object property: ${String(prop)}`);
    }
  });
}

const config = immutable({ apiUrl: 'https://api.example.com', timeout: 5000 });
// config.timeout = 3000; // Error!

// 真正的不可变更新：创建新对象
function updateConfig(config, changes) {
  return { ...config, ...changes };
}

const newConfig = updateConfig(config, { timeout: 3000 });
```

### 8.2 Immer 深度实践

```javascript
import { produce, enableMapSet } from 'immer';
enableMapSet(); // 支持 Map 和 Set

// 基础用法
const nextState = produce(baseState, draft => {
  draft.users.push({ id: 3, name: 'Carol' });
  draft.settings.theme = 'dark';
});

// 柯里化用法：创建不可变更新函数
const toggleTodo = produce((draft, todoId) => {
  const todo = draft.find(t => t.id === todoId);
  if (todo) todo.completed = !todo.completed;
});

const newTodos = toggleTodo(todos, 1);

// 自动冻结（生产环境可关闭以提升性能）
import { setAutoFreeze } from 'immer';
setAutoFreeze(process.env.NODE_ENV !== 'production');
```

### 8.3 Immutable.js vs Immer vs 原生

| 方案 | 语法 | 性能 | 学习曲线 | 包大小 | 适用场景 |
|------|------|------|----------|--------|----------|
| Object.freeze | 原生 | 好 | 低 | 0 | 配置对象、常量 |
| structuredClone | 原生 | 一般 | 低 | 0 | 深拷贝简单对象 |
| spread operator | 原生 | 好 | 低 | 0 | 浅层更新 |
| Immer | 库 | 好 | 低 | ~3KB | 深层嵌套更新 |
| Immutable.js | 库 | 优秀 | 高 | ~15KB | 高频不可变操作 |

```javascript
// 原生 spread（浅层）
const state = { user: { name: 'Alice' }, posts: [] };
const newState = { ...state, posts: [...state.posts, newPost] };

// Immer（深层，更直观）
const newState2 = produce(state, draft => {
  draft.posts.push(newPost);
});

// Immutable.js（函数式）
import { Map, List } from 'immutable';
const immState = Map({ user: Map({ name: 'Alice' }), posts: List() });
const newImmState = immState.setIn(['posts'], immState.get('posts').push(newPost));
```

---

## 9. 现代对象模式

### 9.1 使用Object.groupBy

```javascript
// ES2024
const users = [
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Charlie', role: 'admin' }
];

const grouped = Object.groupBy(users, user => user.role);
// {
//   admin: [Alice, Charlie],
//   user: [Bob]
// }
```

### 9.2 使用Map替代Object

| 场景 | Object | Map |
|------|--------|-----|
| 键类型 | String/Symbol | 任意类型 |
| 顺序 | 不保证（除String键） | 插入顺序 |
| 大小获取 | Object.keys(obj).length | map.size |
| 性能 | 少量键更优 | 频繁增删更优 |
| 迭代 | for...in / Object.entries | for...of / forEach |
| 原型污染 | 有风险 | 安全 |

```javascript
// 使用Map处理复杂键
const userVisits = new Map();

const user1 = { id: 1 };
const user2 = { id: 2 };

userVisits.set(user1, ['2024-01-01', '2024-01-15']);
userVisits.set(user2, ['2024-02-01']);

userVisits.get(user1); // ['2024-01-01', '2024-01-15']

// WeakMap：键对象可被GC
const privateData = new WeakMap();
class User {
  constructor(name) {
    privateData.set(this, { passwordHash: '...', sessions: [] });
  }
}
```

## 总结

- **组合优于继承**：JavaScript中组合更灵活，避免脆弱的继承链
- **Mixin模式**：通过函数组合复用行为，避免多重继承问题，注意组合顺序和冲突解决
- **不变性**：`Object.freeze`浅冻结，`structuredClone`深拷贝，Immer兼顾开发体验与性能
- **Symbol键**：提供"半私有"属性，不干扰常规对象操作
- **Map vs Object**：频繁增删、复杂键、原型安全用Map；简单数据结构用Object
- **策略模式**：将算法封装为可替换的策略对象，通过组合实现灵活行为

## 参考资源

- [JavaScript Info: Objects](https://javascript.info/object) 📚
- [MDN: Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 📘
- [Exploring ES6: Symbols](https://exploringjs.com/es6/ch_symbols.html) 📖
- [Immer Documentation](https://immerjs.github.io/immer/) 🔄

> 最后更新: 2026-05-02
