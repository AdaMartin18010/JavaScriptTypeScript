# 类型健全性边界

> TypeScript 的类型安全保证与绕过机制
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 类型健全性定义

**类型健全性（Type Soundness）**：如果程序通过类型检查，则运行时不会出现类型错误。

TypeScript 是**有意不健全**的：为了与 JavaScript 的兼容性和灵活性，允许某些类型不安全的操作。

---

## 2. 类型不安全的边界

### 2.1 any 类型

```typescript
let x: any = 4;
x.toFixed();     // 编译通过，运行时安全
x.nonExistent(); // 编译通过，运行时报错
```

### 2.2 类型断言

```typescript
const el = document.getElementById("root") as HTMLDivElement;
// 如果元素不是 div，运行时行为未定义
```

### 2.3 数组协变

```typescript
let animals: Animal[] = [];
let dogs: Dog[] = [];

animals = dogs; // TypeScript 允许（协变）
animals.push(new Cat()); // 运行时：dogs 数组中有了 Cat！
```

### 2.4 非空断言

```typescript
const element = document.getElementById("root")!;
// 如果元素不存在，运行时 null 错误
```

---

## 3. 提升类型安全

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true
  }
}
```

---

**参考规范**：TypeScript Handbook: Type Safety | TypeScript Design Goals
