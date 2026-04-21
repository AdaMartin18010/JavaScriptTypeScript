# 类型级编程

> 在类型层面实现计算：类型体操、HKT 模拟与高级类型挑战
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 类型级计算基础

TypeScript 的类型系统图灵完备，可以在类型层面进行编程：

```typescript
// 将类型视为集合
// 条件类型作为逻辑判断
// 映射类型作为迭代

// 类型级加法（Peano 数）
type Zero = 0;
type Succ<N extends number> = N extends 0 ? 1 : N extends 1 ? 2 : N extends 2 ? 3 : never;

type One = Succ<Zero>;   // 1
type Two = Succ<One>;    // 2
```

---

## 2. 递归类型模式

### 2.1 树结构类型

```typescript
interface TreeNode<T> {
  value: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;
}
```

### 2.2 JSON 解析器类型

```typescript
type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };
```

### 2.3 类型级斐波那契

```typescript
type Fibonacci<N extends number, Current extends any[] = [], Next extends any[] = [1]> =
  Current["length"] extends N ? Current["length"]
  : Fibonacci<N, [...Current, 1], [...Current, ...Next]>;
```

---

## 3. 高阶类型（HKT）模拟

TypeScript 不直接支持 HKT，但可以通过结构模拟：

```typescript
// HKT 接口
interface HKT<F, A> {
  readonly _F: F;
  readonly _A: A;
}

// Functor 模拟
interface Functor<F> {
  map<A, B>(fa: HKT<F, A>, f: (a: A) => B): HKT<F, B>;
}
```

---

## 4. 类型挑战精选

### 4.1 数组/元组操作

```typescript
// 获取元组长度
type Length<T extends readonly any[]> = T["length"];

// 元组 Push
type Push<T extends readonly any[], V> = [...T, V];

// 元组 Pop
type Pop<T extends readonly any[]> = T extends readonly [...infer R, any] ? R : never;
```

### 4.2 字符串操作

```typescript
// 字符串长度（类型级）
type StringLength<S extends string, Acc extends any[] = []> =
  S extends `${string}${infer Rest}` ? StringLength<Rest, [...Acc, 1]> : Acc["length"];
```

---

## 5. 类型体操的工程价值

### 5.1 何时使用

- 库的类型定义（如 Prisma、tRPC、Zod）
- 框架的类型系统（如 Next.js、Nuxt）
- 复杂业务类型的自动化生成

### 5.2 可读性平衡

类型体操虽然强大，但过度使用会降低代码可维护性。建议：

- 将复杂类型拆分为命名良好的子类型
- 添加类型注释说明意图
- 在团队内部建立类型复杂度规范

---

**参考资源**：type-challenges/type-challenges GitHub
