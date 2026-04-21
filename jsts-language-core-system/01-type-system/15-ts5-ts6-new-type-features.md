# TS 5.x / 6.0 新类型特性

> TypeScript 5.0–6.0 引入的类型系统增强
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. TS 5.0 类型特性

### 1.1 `const` 类型参数

```typescript
function createArray<const T>(items: readonly T[]): T[] {
  return [...items];
}

const arr = createArray([1, 2, 3]);
// T 推断为 readonly [1, 2, 3]（而非 number[]）
```

### 1.2 装饰器类型支持

TS 5.0 实现了 Stage 3 装饰器提案，支持类型化的类装饰器、方法装饰器等：

```typescript
function logged<This, Args extends any[], Return>(
  target: (this: This, ...args: Args) => Return,
  context: ClassMethodDecoratorContext
) {
  return function (this: This, ...args: Args): Return {
    console.log(`Calling ${String(context.name)}`);
    return target.apply(this, args);
  };
}
```

---

## 2. TS 5.4 类型特性

### 2.1 `NoInfer<T>`

```typescript
function createStore<T>(initial: T, validate: (state: NoInfer<T>) => boolean): T {
  if (!validate(initial)) throw new Error("Invalid");
  return initial;
}
```

### 2.2 闭包类型推断改进

```typescript
function makeMultiplier(factor: number) {
  return (x: number) => x * factor;
  // TS 5.4+ 更精确地推断返回类型
}
```

---

## 3. TS 5.5 类型特性

### 3.1 正则表达式字面量类型推断

```typescript
const regex = /^(?<name>\w+)$/;
// TS 5.5+ 在某些上下文中可推断更精确的类型
```

### 3.2 数组方法类型推断改进

```typescript
const filtered = [1, 2, 3].filter((x) => x > 1);
// TS 5.5+ 推断为 number[]（之前在某些场景可能推断更宽）
```

---

## 4. TS 6.0 类型特性

### 4.1 默认配置变革

```json
{
  "compilerOptions": {
    "strict": true,       // 默认启用
    "module": "esnext",   // 默认 ESM
    "target": "es2025"    // 默认 ES2025
  }
}
```

### 4.2 上下文感知推断改进

TS 6.0 改进了方法语法的类型推断，使上下文类型推断更加可靠：

```typescript
const obj = {
  method(x: number) {
    return x.toString();
  }
};
// 返回类型更可靠地推断为 string
```

### 4.3 `#/` 导入前缀

```typescript
// TS 6.0 支持 #/ 作为路径映射前缀（与 Node.js 导入映射对齐）
import { utils } from "#/utils";
```

---

## 5. 迁移建议

### 5.1 从旧配置迁移

1. 显式声明 `types` 数组（默认从 `[]` 开始）
2. 移除 `target: es5`
3. 更新 `moduleResolution` 为 `nodenext` 或 `bundler`

---

**参考规范**：TypeScript 5.0 Release Notes | TypeScript 6.0 Release Notes
