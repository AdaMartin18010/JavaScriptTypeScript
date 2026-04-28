# TS 无法检查的运行时陷阱

> 模块编号: 07-js-ts-symmetric-difference/04
> 复杂度: ⭐⭐⭐⭐⭐ (专家级)
> 目标读者: 安全工程师、类型系统研究者

---

## 核心命题

TypeScript 的静态分析有明确的边界。以下运行时陷阱**通过了类型检查，却在运行时爆炸**。

---

## 1. any 类型黑洞

```typescript
function processData(data: any): void {
  data.nonExistentMethod();        // 编译通过！运行时 TypeError
  data.nested.deep.value = 123;    // 编译通过！运行时 TypeError
}

processData(null);
processData({});
```

**原理：** `any` 类型关闭所有类型检查，是 TypeScript **unsoundness 的最大来源**。

**防御：** 用 `unknown` 替代 `any`，强制类型收窄后再使用。

---

## 2. 数组协变

```typescript
class Animal { name: string }
class Cat extends Animal { meow() {} }
class Dog extends Animal { bark() {} }

const cats: Cat[] = [new Cat('Whiskers')];
const animals: Animal[] = cats; // TS 允许！

animals.push(new Dog('Rex'));   // TS 允许！
// cats[1] 实际上是 Dog！
// cats[1].meow(); // 运行时 TypeError
```

**原理：** TypeScript 的数组是**协变的**（`Cat[]` 是 `Animal[]` 的子类型），这是 deliberate unsoundness，为了兼容常见的 OOP 模式。

**防御：** 使用 `readonly T[]` 或 `ReadonlyArray<T>` 禁止写入。

---

## 3. 类型断言的谎言

```typescript
const parsed = JSON.parse('{"value": 42}') as {
  value: number;
  name: string;  // 谎言！实际没有这个属性
};

parsed.name.toUpperCase(); // 编译通过！运行时 TypeError
```

更危险的：

```typescript
const num = 'hello' as unknown as number;
num.toFixed(2); // 编译通过！运行时 TypeError
```

**原理：** `as` 是类型系统的 **escape hatch**，信任开发者胜于检查。

**防御：** 使用类型守卫或 zod/io-ts 等运行时验证库。

---

## 4. .d.ts 声明与实现不匹配

```typescript
// some-lib.d.ts
declare module "untrusted" {
  export function getUser(): { id: number };
}

// 实际 JS 实现可能返回 null
function getUser() { return null; }
```

**原理：** `.d.ts` 是**信任声明**，TS 不验证实际 JS 是否遵守。

**防御：** strictNullChecks + 运行时验证。

---

## 5. typeof / instanceof 边界

### 跨 realm instanceof 失效

```javascript
const iframe = document.createElement('iframe');
const arr = new (iframe.contentWindow.Array)(1, 2, 3);
arr instanceof Array; // false！
Array.isArray(arr);   // true ✓
```

### typeof null

```typescript
function isObject(x: unknown): x is object {
  return typeof x === 'object'; // 错误！null 也满足
}
```

**防御：** 自定义守卫必须手动排除 null：`typeof x === 'object' && x !== null`

---

## 6. 索引签名 unsoundness

```typescript
interface Dict {
  [key: string]: number;
}

const dict: Dict = { count: 10 };
const value = dict['nonExistent']; // 类型: number
// 实际值: undefined
```

**防御：** `noUncheckedIndexedAccess` 选项。

---

## 7. this 参数类型

```typescript
class Greeter {
  greet(this: Greeter): string {
    return this.message;
  }
}

const fn = greeter.greet;
// fn(); // 运行时 TypeError！但 TS 可能已报错
```

**防御：** 箭头函数或 `.bind(this)`

---

## 8. 对象突变后类型收窄失效

```typescript
if (user.role === 'admin') {
  // TS 认为 user.role 是 'admin'
  (user as any).role = 'user'; // 外部修改
  // 后续代码不再安全
}
```

**防御：** `readonly` + `as const`，或不可变数据。

---

## 9. JSON.parse 返回 any

```typescript
const data = JSON.parse(raw) as { id: number };
// data.id 实际是 "not-a-number"，但 TS 认为是 number
```

**防御：** zod / valibot 运行时验证。

---

## 10. Function.prototype.call 绕过检查

```typescript
function strictFn(a: number, b: string): string {
  return `${a}-${b}`;
}

strictFn.call(null, 'wrong', 123);
// 参数类型完全没检查！
```

---

## 参考

- [TypeScript Type System Unsoundness](https://github.com/microsoft/TypeScript/issues/9825)
- [Design Goals: Soundness](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)
