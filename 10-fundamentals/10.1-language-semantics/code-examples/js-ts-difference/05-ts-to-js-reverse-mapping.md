# TS → JS 反向映射

> 模块编号: 07-js-ts-symmetric-difference/05
> 复杂度: ⭐⭐⭐ (中级)
> 目标读者: 需要编写纯 JS 的开发者、类型系统学习者

---

## 核心命题

"没有 TypeScript 时，JavaScript 里怎么写？"

---

## 映射表

| TS 特性 | JS 等价方案 | 运行时效果 |
|---------|------------|-----------|
| `interface` | JSDoc `@typedef` / duck typing | 无运行时检查 |
| `type` 别名 | JSDoc `@typedef` | 无运行时检查 |
| `enum` | `Object.freeze({ A: 1, B: 2 })` | 真正不可变 |
| `generic<T>` | 高阶函数 + 手动检查 / JSDoc `@template` | 手动类型检查 |
| `implements` | duck typing / `Object.assign` | 无运行时检查 |
| `private` | `#private` / WeakMap / 闭包 | **真正私有** |
| `protected` | 命名约定 `_method` | 约定而非强制 |
| `readonly` | `Object.defineProperty` + `writable: false` | 运行时不可写 |
| `abstract` | 构造函数 `new.target` 检查 | 运行时阻止实例化 |
| `as const` | `Object.freeze` | 运行时不可变 |
| `satisfies` | `assertShape(obj, validator)` | 运行时验证 |
| `keyof` | `Object.keys()` | 返回 `string[]` |
| function overloads | 手动 `typeof` dispatch | 运行时分支 |
| `namespace` | IIFE / ES Module | 模块化 |
| decorators | 高阶函数 / monkey patch | 运行时增强 |
| `interface` 合并 | `Object.assign` | 对象合并 |

---

## 详细示例

### interface → JSDoc

```typescript
// TS
interface User {
  id: number;
  name: string;
}
```

```javascript
// JS
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 */
```

### enum → Object.freeze

```typescript
// TS
enum Status { Pending, Success, Error }
```

```javascript
// JS
const Status = Object.freeze({
  Pending: 0,
  Success: 1,
  Error: 2,
});

// 如需双向映射，显式扩展
const StatusWithReverse = Object.freeze({
  ...Status,
  0: 'Pending',
  1: 'Success',
  2: 'Error',
});
```

### generic → 高阶函数 + JSDoc @template

```typescript
// TS
function identity<T>(x: T): T { return x; }
```

```javascript
// JS — 纯鸭子类型，无额外运行时成本
function identity(x) { return x; }

// 带运行时验证
function identityWithCheck(x, validator) {
  if (!validator(x)) throw new TypeError('Value failed runtime validation');
  return x;
}
```

```javascript
// JSDoc 提供编辑器类型提示
/**
 * @template T
 * @param {T} x
 * @returns {T}
 */
function identity(x) {
  return x;
}
```

### private → #private

```typescript
// TS
class A {
  private x = 10;
}
```

```javascript
// JS
class A {
  #x = 10; // 真正私有，引擎级保护，不可通过 Reflect.ownKeys 枚举
}
```

### readonly → Object.defineProperty

```typescript
// TS
class Config {
  readonly apiUrl = 'https://api.example.com';
}
```

```javascript
// JS
class Config {
  constructor() {
    Object.defineProperty(this, 'apiUrl', {
      value: 'https://api.example.com',
      writable: false,
      configurable: false,
      enumerable: true,
    });
  }
}

// 或者使用 class field + Object.freeze 实例
class ConfigFrozen {
  apiUrl = 'https://api.example.com';
  constructor() {
    Object.freeze(this);
  }
}
```

### abstract → new.target 检查

```typescript
// TS
abstract class Animal {
  abstract speak(): string;
}
```

```javascript
// JS
class Animal {
  constructor() {
    if (new.target === Animal) {
      throw new TypeError('Cannot construct Animal instances directly');
    }
  }

  speak() {
    throw new Error('Method "speak()" must be implemented');
  }
}
```

### satisfies → 运行时结构断言

```typescript
// TS
const config = {
  host: 'localhost',
  port: 3000,
} satisfies { host: string; port: number };
```

```javascript
// JS
function assertShape(obj, schema) {
  for (const [key, validator] of Object.entries(schema)) {
    if (!(key in obj)) throw new TypeError(`Missing key: ${key}`);
    if (!validator(obj[key])) throw new TypeError(`Invalid value for ${key}`);
  }
  return obj;
}

const config = assertShape(
  { host: 'localhost', port: 3000 },
  {
    host: (v) => typeof v === 'string',
    port: (v) => typeof v === 'number' && Number.isInteger(v),
  }
);
```

### function overloads → typeof dispatch

```typescript
// TS
function process(input: string): string;
function process(input: number): number;
function process(input: string | number): string | number {
  if (typeof input === 'string') return input.toUpperCase();
  return input * 2;
}
```

```javascript
// JS
function process(input) {
  if (typeof input === 'string') return input.toUpperCase();
  if (typeof input === 'number') return input * 2;
  throw new TypeError('Unsupported input type');
}
```

### decorators → 高阶函数

```typescript
// TS
function Log(target: any, key: string, descriptor: PropertyDescriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    console.log(`Call ${key}(${args.join(', ')})`);
    return original.apply(this, args);
  };
}

class Greeter {
  @Log
  greet(name: string) {
    return `Hello, ${name}`;
  }
}
```

```javascript
// JS
function Log(target, key, descriptor) {
  const original = descriptor.value;
  descriptor.value = function (...args) {
    console.log(`Call ${key}(${args.join(', ')})`);
    return original.apply(this, args);
  };
  return descriptor;
}

class Greeter {
  greet(name) {
    return `Hello, ${name}`;
  }
}

// 手动应用装饰器
Object.defineProperty(Greeter.prototype, 'greet', Log(Greeter.prototype, 'greet', Object.getOwnPropertyDescriptor(Greeter.prototype, 'greet')));
```

---

## 核心结论

TypeScript 的所有特性在 JavaScript 中都有等价表达，只是：

1. **缺少编译时检查** — 需要更多单元测试
2. **需要更多运行时验证** — zod / io-ts / 手动断言
3. **命名约定补充** — `_private` / `IInterface` 等匈牙利命名

---

## 权威参考链接

- [MDN — Private class features](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties)
- [MDN — Object.freeze](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
- [MDN — Object.defineProperty](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [MDN — new.target](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new.target)
- [MDN — JSDoc @typedef](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/typedef)
- [TypeScript Handbook — Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [TypeScript Handbook — Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
- [ECMA-262 — Class Definitions](https://tc39.es/ecma262/#sec-class-definitions)
- [JSDoc Documentation](https://jsdoc.app/)

---

*最后更新: 2026-04-29*
