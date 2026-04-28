# TS-Only 编译时特性

> 模块编号: 07-js-ts-symmetric-difference/02
> 复杂度: ⭐⭐⭐⭐ (高级)
> 目标读者: 类型系统研究者、编译器使用者

---

## 核心命题

以下特性**仅存在于 TypeScript 编译时**，在编译后的 JavaScript 中**完全消失**。JavaScript 引擎永远不会知道它们存在。

---

## 类型声明构造

### interface

```typescript
interface User {
  id: number;
  name: string;
}
```

编译后：

```javascript
// 什么都没有！
```

**JS 等价方案：**

- JSDoc: `@typedef {{ id: number, name: string }} User`
- 运行时: duck typing — 只要对象有 `id` 和 `name` 就行

### type 别名

```typescript
type ID = string | number;
type Point = { x: number; y: number };
```

编译后：零代码。

**关键区别：** `type` 不可声明合并，`interface` 可合并。

---

## 类型运算构造

### 联合类型 (Union)

```typescript
type Status = 'pending' | 'success' | 'error';
```

运行时：`Status` 消失，只有具体的字符串值 `"pending"` 等。

### 交叉类型 (Intersection)

```typescript
type Employee = Person & HasId;
```

运行时：普通对象，所有属性平铺在一起。

### 条件类型

```typescript
type IsString<T> = T extends string ? true : false;
```

运行时：**完全不存在**。这是纯粹的类型级编程。

**JS 等价：** 无法实现。条件类型是类型系统的 Turing-complete 特性。

### infer

```typescript
type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
```

运行时：不存在。`infer` 是类型系统的模式匹配变量。

### 映射类型

```typescript
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

运行时：不存在。`[K in keyof T]` 是编译时的属性遍历。

### 模板字面量类型

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;
```

运行时：不存在。这是类型级的字符串操作。

---

## 修饰符

### private / protected

```typescript
class A {
  private x = 10;
}
```

编译后：

```javascript
class A {
  constructor() {
    this.x = 10; // private 修饰符消失！
  }
}
```

**陷阱：** `(new A() as any).x` 在运行时完全可访问。

**JS 真正私有方案：**

- `#private` 字段（ES2022）
- WeakMap
- 闭包变量

### readonly

```typescript
class Point {
  readonly x = 1;
}
```

编译后：`readonly` 消失，属性可写。

**JS 等价：** `Object.defineProperty(this, 'x', { writable: false })`

### abstract

```typescript
abstract class Animal {
  abstract makeSound(): void;
}
```

编译后：`abstract` 消失，生成普通 class。

**JS 等价：** 构造函数内检查 `if (new.target === Animal) throw new Error(...)`

---

## 其他编译时构造

| 特性 | 运行时残留 | JS 等价 |
|------|-----------|---------|
| `implements` | 零 | duck typing |
| function overloads | 零 | 手动 typeof dispatch |
| `as const` | 零 | `Object.freeze` |
| `satisfies` | 零 | `assertShape()` 运行时验证 |
| `declare module` | 零 | 无 |
| `/// <reference>` | 零 | 无 |
| `keyof` (类型级) | 零 | `Object.keys()` (返回 string[]) |
| `typeof` (类型级) | 零 | JS `typeof` 返回 primitive string |

---

## 类型擦除保证

TypeScript 的核心设计原则：**类型是编译时 construct，不支付运行时税**。

```typescript
// 编译前
function greet(user: { name: string }): string {
  return `Hello ${user.name}`;
}

// 编译后 (tsc --target es2022)
function greet(user) {
  return `Hello ${user.name}`;
}
```

所有类型注解、接口、类型别名、泛型参数、条件类型在编译后**完全消失**。

---

## 例外：Runtime-Impacting 特性

部分 TS 特性会产生运行时代码，详见 `03-runtime-impacting-ts-features.md`：

- `enum` → 对象 + 反向映射
- `namespace` → IIFE
- parameter properties → `this.x = x`
- decorators → `__decorate` 调用

---

## 参考

- TypeScript Spec: Type Erasure
- [TypeScript Design Goals](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)
