# 类型健全性边界

> TypeScript 类型系统的安全保证与不安全边界
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 类型健全性概念

- **Soundness（可靠性）**：如果程序通过类型检查，则运行时不会发生类型错误
- **Completeness（完备性）**：如果程序运行时安全，则一定能通过类型检查

TypeScript 选择**实用性优先于完全健全性**：

```typescript
// TS 允许这不安全的代码通过编译
const obj: any = { x: "hello" };
const num: number = obj; // ✅ 编译通过（any → 任何类型）
```

---

## 2. 类型擦除（Type Erasure）

TypeScript 编译后所有类型信息被擦除：

```typescript
// TS 源码
function greet(name: string): string {
  return `Hello, ${name}`;
}

// 编译后的 JS
function greet(name) {
  return "Hello, " + name;
}
```

**运行时无类型信息**：

```typescript
interface Cat { meow(): void; }
interface Dog { bark(): void; }

function isCat(animal: Cat | Dog): animal is Cat {
  return "meow" in animal; // 运行时只能检查属性存在性
}
```

---

## 3. 不安全的类型操作

### 3.1 `any` 的传染性

```typescript
let x: any = 1;
let y = x + "hello"; // y 也变成 any
```

### 3.2 类型断言

```typescript
const val = ("hello" as unknown) as number;
val.toFixed(); // 编译通过，运行时报错
```

### 3.3 非空断言 `!`

```typescript
const arr: string[] = [];
const first = arr[0]!; // 绕过 undefined 检查
```

---

## 4. 类型安全边界

### 4.1 `unknown` 的安全使用

```typescript
function safeParse(input: unknown): string {
  if (typeof input === "string") return input;
  if (typeof input === "number") return String(input);
  throw new Error("Invalid input");
}
```

### 4.2 运行时验证

```typescript
import { z } from "zod";

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const user = UserSchema.parse(unknownData); // 运行时 + 编译时双重保障
```

---

## 5. 严格模式配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

---

## 6. 最新进展

### `--erasableSyntaxOnly`（TS 5.8+）

只允许使用可擦除的语法（类型注解、接口等），禁止 enum、参数属性等需要转换的语法：

```typescript
// ✅ 可擦除
const x: string = "hello";

// ❌ 不可擦除（需要转换）
enum Color { Red, Green }
```

### TS 7.0 潜在影响

Go 编译器重写可能增强类型检查强度，但语言语义保持不变。

---

**参考规范**：TypeScript Handbook: Type Safety
