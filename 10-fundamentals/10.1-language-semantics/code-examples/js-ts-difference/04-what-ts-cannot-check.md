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

```typescript
function safeProcess(data: unknown): void {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    // 安全访问
    console.log((data as { value: unknown }).value);
  }
}
```

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

```typescript
function printAnimals(animals: readonly Animal[]): void {
  animals.forEach(a => console.log(a.name));
  // animals.push(new Dog('Rex')); // ❌ 编译错误
}
```

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

```typescript
import { z } from 'zod';

const UserSchema = z.object({ value: z.number(), name: z.string() });
const parsed = UserSchema.safeParse(JSON.parse(raw));
if (!parsed.success) {
  throw new Error('Invalid user data');
}
```

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

```typescript
function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}
```

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

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "noUncheckedIndexedAccess": true
  }
}
// dict['nonExistent'] 类型变为 number | undefined
```

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

```typescript
class SafeGreeter {
  greet = (): string => {
    return this.message; // this 始终指向实例
  };
}
```

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

```typescript
interface User {
  readonly role: 'admin' | 'user';
}

const user = { role: 'admin' as const };
// user.role = 'user'; // ❌ 编译错误
```

---

## 9. JSON.parse 返回 any

```typescript
const data = JSON.parse(raw) as { id: number };
// data.id 实际是 "not-a-number"，但 TS 认为是 number
```

**防御：** zod / valibot 运行时验证。

```typescript
import { z } from 'zod';

const ApiResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
});

const data = ApiResponseSchema.parse(JSON.parse(raw));
```

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

## 11. Branded Types 绕过（名义类型模拟漏洞）

```typescript
type UserId = string & { __brand: 'UserId' };
type PostId = string & { __brand: 'PostId' };

function getUser(id: UserId) { /* ... */ }

const postId = 'abc123' as PostId;
getUser(postId as unknown as UserId); // 编译通过！运行时逻辑错误
```

**防御：** 避免双重断言，使用运行时校验包装器。

```typescript
function createUserId(raw: string): UserId {
  if (!raw.match(/^[a-z0-9]{24}$/)) throw new Error('Invalid UserId');
  return raw as UserId;
}
```

---

## 12. Excess Property Checks 绕过

```typescript
interface Config { host: string; port: number }

function loadConfig(c: Config) { /* ... */ }

// 对象字面量会触发 excess property check
loadConfig({ host: 'localhost', port: 3000, secret: 'leaked' }); // ❌ 编译错误

// 但通过中间变量可绕过
const evil = { host: 'localhost', port: 3000, secret: 'leaked' };
loadConfig(evil); // ✅ 编译通过！secret 被静默忽略或导致意外行为
```

**防御：** 使用 `satisfies` 关键字（TS 4.9+）或 zod 校验。

```typescript
const evil = { host: 'localhost', port: 3000, secret: 'leaked' } satisfies Config;
// ❌ 编译错误：Object literal may only specify known properties
```

---

## 13. Symbol Key Unsoundness

```typescript
const secretKey = Symbol('secret');

interface SafeBox {
  [key: string]: string;
}

const box: SafeBox = {};
(box as any)[secretKey] = 'sensitive'; // Symbol key 绕过索引签名检查

// 读取时可能泄漏
console.log(Object.getOwnPropertySymbols(box)); // [Symbol(secret)]
```

---

## 14. Prototype Pollution 防御盲点

```typescript
// TS 类型无法防御原型链污染
function merge<T, U>(target: T, source: U): T & U {
  for (const key in source) {
    // 未检查 key === '__proto__' 或 'constructor'
    (target as any)[key] = (source as any)[key];
  }
  return target as T & U;
}

// 攻击向量
merge({}, JSON.parse('{"__proto__":{"isAdmin":true}}'));
// 所有对象的 isAdmin 变为 true！
```

**防御：** 使用 `Object.create(null)` 或结构化克隆/库级 merge。

```typescript
function safeMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const result = { ...target };
  for (const [key, value] of Object.entries(source)) {
    if (key === '__proto__' || key === 'constructor') continue;
    (result as any)[key] = value;
  }
  return result as T & U;
}
```

---

## 15. 枚举（enum）反向映射陷阱

```typescript
enum Status { Active = 1, Inactive = 0 }

function getStatusLabel(s: Status): string {
  if (s === Status.Active) return 'Active';
  if (s === Status.Inactive) return 'Inactive';
  return 'Unknown'; // 理论上不可达
}

// 但运行时传入非法值
getStatusLabel(999 as Status); // 编译通过！返回 'Unknown'

// 或者字符串枚举的反向映射
const label = Status[1]; // "Active" — 如果传入变量可能泄漏内部名称
```

**防御：** 使用 `const` 断言 + 联合类型替代 enum。

```typescript
type Status = 'active' | 'inactive';
const StatusMap = { active: 1, inactive: 0 } as const;
```

---

## 参考

- [TypeScript Type System Unsoundness](https://github.com/microsoft/TypeScript/issues/9825)
- [Design Goals: Soundness](https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals)
- [TypeScript Handbook — Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html)
- [Zod — TypeScript-first Schema Validation](https://zod.dev/)
- [Valibot — Modular Schema Validation](https://valibot.dev/)
- [io-ts — Runtime Type System](https://github.com/gcanti/io-ts)
- [TypeScript — strictNullChecks](https://www.typescriptlang.org/tsconfig/#strictNullChecks)
- [TypeScript — noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess)
- [TypeScript — satisfies Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)
- [OWASP — Prototype Pollution Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html)
- [Snyk — TypeScript Type Safety Guide](https://snyk.io/blog/typescript-type-safety/)
- [Matt Pocock — TypeScript's Worst Unsoundness](https://www.youtube.com/watch?v=TSYWvT1qDHY)
- [Total TypeScript — Branded Types](https://www.totaltypescript.com/branded-types)
- [MDN — Array.isArray](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)

---

## 深化补充：更多运行时陷阱与权威参考

### 递归类型 unsoundness

```typescript
type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const bad: Json = {};
// TS 允许，但以下赋值在运行时会导致栈溢出或结构错误
function deepMerge(a: Json, b: Json): Json {
  if (typeof a === 'object' && a !== null && typeof b === 'object' && b !== null) {
    return { ...a, ...b, extra: deepMerge(a, b) }; // 无限递归
  }
  return b;
}
```

### `in` 运算符 narrowing 边界

```typescript
interface Admin { role: 'admin'; adminKey: string }
interface User { role: 'user' }

function checkAccess(person: Admin | User) {
  if ('adminKey' in person) {
    // TS 收窄为 Admin，但运行时对象可能来自外部 JSON
    // 如果 person = { role: 'user', adminKey: 'hacked' }，则逻辑错误
    console.log(person.adminKey);
  }
}
```

### `as const` 与枚举的互操作陷阱

```typescript
const StatusMap = { active: 1, inactive: 0 } as const;
type StatusKey = keyof typeof StatusMap; // 'active' | 'inactive'

// 运行时对象可能包含额外键
const runtime = JSON.parse('{"active":1,"inactive":0,"banned":2}');
function processStatus(s: typeof StatusMap) {
  // s 类型要求 { active: 1, inactive: 0 }
  // 但运行时传入的 { banned: 2 } 在结构兼容时可能通过某些检查
}
```

### 权威外部链接索引

| 资源 | 链接 | 说明 |
|------|------|------|
| TypeScript Type System Unsoundness | <https://github.com/microsoft/TypeScript/issues/9825> | 官方 unsoundness 讨论 |
| TypeScript Design Goals | <https://github.com/microsoft/TypeScript/wiki/TypeScript-Design-Goals> | 设计目标文档 |
| TypeScript Handbook — Type Compatibility | <https://www.typescriptlang.org/docs/handbook/type-compatibility.html> | 类型兼容性 |
| TypeScript — strictNullChecks | <https://www.typescriptlang.org/tsconfig/#strictNullChecks> | 严格空检查配置 |
| TypeScript — noUncheckedIndexedAccess | <https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess> | 索引访问检查 |
| TypeScript — satisfies Operator | <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator> | satisfies 运算符 |
| Zod — Schema Validation | <https://zod.dev/> | 运行时类型验证 |
| Valibot — Schema Validation | <https://valibot.dev/> | 模块化验证库 |
| io-ts — Runtime Type System | <https://github.com/gcanti/io-ts> | 函数式运行时类型 |
| OWASP — Prototype Pollution | <https://cheatsheetseries.owasp.org/cheatsheets/Prototype_Pollution_Prevention_Cheat_Sheet.html> | 原型污染防御 |
| Total TypeScript — Branded Types | <https://www.totaltypescript.com/branded-types> | 品牌类型教程 |
| MDN — Array.isArray | <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray> | 跨 realm 数组检测 |
| TypeScript ESLint — strict-boolean-expressions | <https://typescript-eslint.io/rules/strict-boolean-expressions/> | 严格布尔表达式规则 |
| Ariya — TypeScript Unsoundness Deep Dive | <https://ariya.io/2019/05/when-typescript-meets-runtime-validation> | 运行时验证深度分析 |
