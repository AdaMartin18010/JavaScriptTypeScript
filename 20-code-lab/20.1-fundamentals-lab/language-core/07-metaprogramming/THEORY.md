# 元编程

> **定位**：`20-code-lab/20.1-fundamentals-lab/language-core/07-metaprogramming`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

本模块探索代理、反射和装饰器等元编程技术，解决在运行时拦截和修改对象行为的高级抽象问题。

### 1.2 形式化基础

元编程允许程序将自身作为数据进行操作。在 JS/TS 中，元编程的核心机制包括：

- **Proxy**: 创建对象的拦截层，重定义基本操作（属性访问、赋值、枚举、函数调用等）
- **Reflect**: 提供与 Proxy handler 对应的默认行为 API
- **装饰器**: 在声明时附加元数据和行为的注解机制

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| Proxy | 拦截对象基本操作的代理器 | proxy-examples.ts |
| Reflect | 提供可拦截操作的默认行为 | reflect-api.ts |
| 装饰器 | 类与成员的注解式元编程 | decorators.ts |

---

## 二、设计原理

### 2.1 为什么存在

元编程允许代码在运行时检查和修改自身行为。代理和反射机制为框架开发、测试模拟和 API 拦截提供了强大的基础设施。

### 2.2 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Proxy | 能力强大、透明拦截 | 性能开销显著 | 调试/监控 |
| 显式方法 | 性能最优 | 侵入性修改 | 高频调用路径 |

### 2.3 特性对比表：Proxy vs Reflect vs Symbol

| 特性 | Proxy | Reflect | Symbol |
|------|-------|---------|--------|
| 核心定位 | 拦截并自定义对象操作 | 提供默认操作的函数式 API | 创建唯一、非字符串的键 |
| 典型用途 | 数据验证、日志、虚拟属性 | 配合 Proxy 恢复默认行为 | 私有/内部属性、协议标记 |
| 是否创建新对象 | 是，包装目标对象 | 否，纯工具函数 | 是，生成唯一原始值 |
| 可拦截的操作 | get/set/apply/construct/... 共 13 种 | 对应 Proxy 的 handler 方法 | 不可拦截 |
| 返回值特点 | handler 决定 | 返回操作是否成功 (boolean) | `typeof` 为 `"symbol"` |
| 性能影响 | 有（所有访问被代理） | 极小（直接转发） | 极小 |
| 内置 Symbol | — | — | `Symbol.iterator`, `Symbol.toStringTag`, `Symbol.asyncIterator` 等 |

### 2.4 与相关技术的对比

与 Ruby 元编程对比：JS Proxy 提供了更系统化的拦截能力。

---

## 三、实践映射

### 3.1 从理论到代码

本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 元编程 核心机制的理解，并观察不同实现选择带来的行为差异。

### 3.2 代码示例：Proxy + Reflect + Symbol 协同

```typescript
// ===== Symbol：定义不可冲突的内部协议 =====
const internalData = Symbol('internalData');
const toLogString = Symbol('toLogString');

interface User {
  name: string;
  [internalData]: { createdAt: Date };
  [toLogString](): string;
}

// ===== Proxy + Reflect：透明拦截与默认行为 =====
function createValidatedUser(target: User): User {
  return new Proxy(target, {
    // 拦截属性读取
    get(obj, prop, receiver) {
      if (prop === internalData) {
        console.warn('Attempt to access internal data');
        return undefined;
      }
      // Reflect.get 保持默认行为，包括 receiver 绑定
      return Reflect.get(obj, prop, receiver);
    },

    // 拦截属性设置
    set(obj, prop, value, receiver) {
      if (prop === 'name' && typeof value !== 'string') {
        throw new TypeError('name must be a string');
      }
      // Reflect.set 返回 boolean 表示是否成功
      const success = Reflect.set(obj, prop, value, receiver);
      if (success && prop === 'name') {
        console.log(`User renamed to: ${value}`);
      }
      return success;
    },

    // 拦截 in 操作符
    has(obj, prop) {
      if (prop === internalData) return false; // 隐藏内部属性
      return Reflect.has(obj, prop);
    },

    // 拦截 Object.keys
    ownKeys(obj) {
      return Reflect.ownKeys(obj).filter(k => k !== internalData);
    },
  });
}

// 使用
const user: User = {
  name: 'Alice',
  [internalData]: { createdAt: new Date() },
  [toLogString]() { return `User(${this.name})`; },
};

const proxied = createValidatedUser(user);
proxied.name = 'Bob';        // 日志: User renamed to: Bob
// proxied.name = 42;        // TypeError: name must be a string
console.log(internalData in proxied); // false（被代理隐藏）
console.log(Object.keys(proxied));    // ["name"]（不含 Symbol 属性）

// ===== 内置 Symbol 协议 =====
const iterable = {
  data: [10, 20, 30],
  [Symbol.iterator]() {
    let i = 0;
    const data = this.data;
    return {
      next() {
        return i < data.length
          ? { value: data[i++], done: false }
          : { value: undefined, done: true };
      },
    };
  },
};
console.log([...iterable]); // [10, 20, 30]
```

### 3.3 代码示例：Revocable Proxy 与 Membrane 模式

```typescript
// Revocable Proxy：可随时撤销的代理
function createSecureSession<T extends object>(data: T, ttlMs: number) {
  const { proxy, revoke } = Proxy.revocable(data, {
    get(target, prop, receiver) {
      console.log(`[audit] read ${String(prop)}`);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      console.log(`[audit] write ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value, receiver);
    },
  });

  // TTL 到期后自动撤销
  setTimeout(() => {
    console.log('[session] revoked due to TTL');
    revoke();
  }, ttlMs);

  return proxy;
}

const session = createSecureSession({ userId: '123', role: 'admin' }, 5000);
console.log(session.userId); // [audit] read userId -> '123'

// 5秒后访问会抛出 TypeError: Cannot perform 'get' on a proxy that has been revoked
```

### 3.4 代码示例：Reflect 构建通用序列化器

```typescript
// 使用 Reflect 实现深度只读代理
function deepReadonly<T extends object>(target: T): Readonly<T> {
  return new Proxy(target, {
    get(obj, prop, receiver) {
      const value = Reflect.get(obj, prop, receiver);
      if (value !== null && typeof value === 'object') {
        return deepReadonly(value);
      }
      return value;
    },

    set() {
      throw new TypeError('Cannot modify readonly object');
    },

    deleteProperty() {
      throw new TypeError('Cannot delete property of readonly object');
    },

    defineProperty() {
      throw new TypeError('Cannot define property on readonly object');
    },
  });
}

const config = deepReadonly({
  database: { host: 'localhost', port: 5432 },
  features: ['auth', 'billing'],
});

console.log(config.database.host); // 'localhost'
// config.database.port = 3306;    // TypeError: Cannot modify readonly object
```

### 3.5 代码示例：TC39 Stage 3 装饰器（TS 5.0+）

```typescript
// 方法计时装饰器
function timed<T extends (...args: any[]) => any>(
  target: T,
  context: ClassMethodDecoratorContext
) {
  const methodName = String(context.name);
  return function (this: any, ...args: Parameters<T>): ReturnType<T> {
    const start = performance.now();
    const result = target.apply(this, args);
    const elapsed = performance.now() - start;
    console.log(`[${methodName}] took ${elapsed.toFixed(2)}ms`);
    return result;
  } as T;
}

// 字段观察装饰器
function observable<T>(target: undefined, context: ClassFieldDecoratorContext) {
  return function (this: any, initialValue: T): T {
    let value = initialValue;
    const listeners = new Set<(v: T) => void>();

    Object.defineProperty(this, context.name, {
      get() { return value; },
      set(newValue: T) {
        if (value !== newValue) {
          value = newValue;
          listeners.forEach(cb => cb(newValue));
        }
      },
      enumerable: true,
      configurable: true,
    });

    (this as any).subscribe = (cb: (v: T) => void) => listeners.add(cb);
    return initialValue;
  };
}

class DataService {
  @observable
  status: 'idle' | 'loading' | 'done' = 'idle';

  @timed
  fetchData() {
    this.status = 'loading';
    // 模拟异步操作
    return new Promise(resolve => setTimeout(() => {
      this.status = 'done';
      resolve(null);
    }, 100));
  }
}

const service = new DataService();
service.subscribe((s) => console.log('status changed:', s));
service.fetchData();
```

### 3.6 代码示例：自定义迭代器与异步迭代器

```typescript
// 自定义范围迭代器
class Range {
  constructor(private start: number, private end: number, private step = 1) {}

  [Symbol.iterator](): Iterator<number> {
    let current = this.start;
    return {
      next: () => {
        if (current >= this.end) return { done: true, value: undefined };
        const value = current;
        current += this.step;
        return { done: false, value };
      },
    };
  }

  // 异步迭代器
  async *[Symbol.asyncIterator](): AsyncGenerator<number> {
    for (let i = this.start; i < this.end; i += this.step) {
      await new Promise(r => setTimeout(r, 10)); // 模拟异步
      yield i;
    }
  }
}

const range = new Range(0, 5);
console.log([...range]); // [0, 1, 2, 3, 4]

(async () => {
  for await (const n of range) {
    console.log('async:', n);
  }
})();
```

### 3.7 常见误区

| 误区 | 正确理解 |
|------|---------|
| Proxy 可以拦截所有操作 | 部分原生对象内部槽无法被代理 |
| Reflect 只是 Proxy 的镜像 | Reflect 提供默认行为且可用于普通对象 |
| 装饰器会改变类型签名 | 装饰器不应改变被装饰成员的类型接口 |
| Symbol.for 和 Symbol 相同 | Symbol.for 在全局注册表中共享，Symbol 每次创建唯一 |

### 3.8 扩展阅读

- [MDN Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [MDN Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect)
- [MDN Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
- [MDN: Proxy handler functions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy)
- [MDN: Well-known Symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#well-known_symbols)
- [ECMAScript 2025: Proxy Objects](https://tc39.es/ecma262/#sec-proxy-objects)
- [ECMAScript 2025: Reflection](https://tc39.es/ecma262/#sec-reflection)
- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators) — TC39 Stage 3 装饰器规范
- [TypeScript 5.0 Decorators](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators) — TS 官方装饰器文档
- [JavaScript Metaprogramming Patterns](https://exploringjs.com/impatient-js/ch_proxies.html) — Dr. Axel Rauschmayer
- `10-fundamentals/10.1-language-semantics/07-metaprogramming/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
