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
// 如需反向映射: Object.entries 手动构建
```

### generic → 高阶函数

```typescript
// TS
function identity<T>(x: T): T { return x; }
```

```javascript
// JS
function identity(x) { return x; }

// 带运行时验证
function identityWithCheck(x, validator) {
  if (!validator(x)) throw new TypeError();
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
  #x = 10; // 真正私有，引擎级保护
}
```

---

## 核心结论

TypeScript 的所有特性在 JavaScript 中都有等价表达，只是：

1. **缺少编译时检查** — 需要更多单元测试
2. **需要更多运行时验证** — zod / io-ts / 手动断言
3. **命名约定补充** — `_private` / `IInterface` 等匈牙利命名
