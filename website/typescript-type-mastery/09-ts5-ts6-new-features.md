---
title: 09 TS 5.x/6.x 新特性实战
description: 掌握 TypeScript 5.x 和 6.x 的新特性：satisfies、NoInfer、const 类型参数、Erasable Syntax、类型导入优化等。
---

# 09 TS 5.x/6.x 新特性实战

> **前置知识**：TypeScript 基础、类型推断
>
> **目标**：能够在项目中应用最新的 TypeScript 特性

---

## 1. satisfies 运算符（TS 4.9+）

### 1.1 核心用法

```typescript
// 问题：类型注解丢失精确推断
const config: Record<string, string> = {
  primary: '#007bff',
  secondary: '#6c757d',
};
// config.primary 的类型是 string，不是 '#007bff'

// 解决：satisfies 保留推断
const config2 = {
  primary: '#007bff',
  secondary: '#6c757d',
} satisfies Record<string, string>;

// config2.primary 的类型是 '#007bff'
type PrimaryColor = typeof config2.primary; // '#007bff'
```

### 1.2 配置对象验证

```typescript
interface ThemeConfig {
  colors: Record<string, string>;
  spacing: Record<string, number>;
}

const theme = {
  colors: {
    primary: '#007bff',
    danger: '#dc3545',
  },
  spacing: {
    sm: 8,
    md: 16,
  },
} satisfies ThemeConfig;

// 保留精确键名推断
type ColorKey = keyof typeof theme.colors; // 'primary' | 'danger'
```

---

## 2. `NoInfer<T>`（TS 5.4+）

### 2.1 阻止不期望的推断

```typescript
// 问题：defaultValue 影响泛型推断
function createStore<T>(config: {
  initial: T;
  defaultValue: T;
}) {
  return config;
}

// T 被推断为 string | number（错误）
const store = createStore({
  initial: 42,
  defaultValue: 'default',
});

// 解决：使用 NoInfer
function createStore2<T>(config: {
  initial: T;
  defaultValue: NoInfer<T>;
}) {
  return config;
}

// T 正确推断为 number
const store2 = createStore2({
  initial: 42,
  defaultValue: 0,
});
```

---

## 3. const 类型参数（TS 5.0+）

### 3.1 自动 const 推断

```typescript
// 之前：需要 as const
function createRoutes<T extends readonly string[]>(routes: T): T {
  return routes;
}

const routes = createRoutes(['home', 'about', 'contact'] as const);

// TS 5.0+：const 类型参数
function createRoutes2<const T extends readonly string[]>(routes: T): T {
  return routes;
}

const routes2 = createRoutes2(['home', 'about', 'contact']);
// routes2 的类型是 readonly ['home', 'about', 'contact']
```

---

## 4. Erasable Syntax（TS 5.8+ / TS 6.0）

### 4.1 JavaScript 文件中的类型注解

```javascript
// file.js — 无需 TypeScript 编译器！
/**
 * @param {string} name
 * @returns {number}
 */
function greet(name) {
  console.log(`Hello, ${name}`);
  return name.length;
}

// TS 5.8+ 支持直接在 JS 中写类型（实验性）
// function greet(name: string): number {
//   console.log(`Hello, ${name}`);
//   return name.length;
// }
```

---

## 5. 类型导入优化

### 5.1 import type

```typescript
// TS 3.8+：显式类型导入
import type { User } from './types';
import { type User, createUser } from './types';

// TS 5.0+：更严格的类型导入检查
// 确保类型导入在编译后完全擦除
```

---

## 6. 装饰器（TS 5.0+）

### 6.1 Stage 3 装饰器

```typescript
// 类装饰器
function logged(target: any, context: ClassDecoratorContext) {
  console.log(`Creating class ${context.name}`);
  return target;
}

// 方法装饰器
function timing(target: any, context: ClassMethodDecoratorContext) {
  return function (...args: any[]) {
    const start = performance.now();
    const result = target.apply(this, args);
    console.log(`${context.name} took ${performance.now() - start}ms`);
    return result;
  };
}

@logged
class MyService {
  @timing
  fetchData() {
    // ...
  }
}
```

---

## 常见陷阱

| 特性 | 版本要求 | 注意事项 |
|------|---------|---------|
| satisfies | 4.9+ | 不检查 excess properties |
| NoInfer | 5.4+ | 旧版本可用 `T & {}` 模拟 |
| const 参数 | 5.0+ | 仅影响类型推断 |
| Erasable Syntax | 5.8+ | 实验性，需配置 |

---

## 延伸阅读

- [TypeScript 5.4 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-4.html)
- [TypeScript 5.0 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html)
