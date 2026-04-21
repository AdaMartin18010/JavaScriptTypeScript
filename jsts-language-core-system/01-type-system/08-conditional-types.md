# 条件类型

> `extends ? :` 的完整语义、infer、分发性与递归条件类型
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基础条件类型

条件类型的语法类似于三元运算符：

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;       // false
```

### 1.1 形式化语义

```
T extends U ? X : Y

如果 T 可以赋值给 U，则结果为 X，否则为 Y
```

### 1.2 分配性条件类型（Distributive）

当条件类型作用于**裸类型参数**时，会**分配**到联合类型的每个成员：

```typescript
// 分配性：T 是裸类型参数
type ToArray<T> = T extends any ? T[] : never;

type A = ToArray<string | number>;
// = ToArray<string> | ToArray<number>
// = string[] | number[]

// 非分配性：T 被包裹
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;

type B = ToArrayNonDist<string | number>;
// = (string | number)[]
```

**控制分配性**：
- 裸类型参数 → 分配
- 包裹在元组/数组中 → 不分配
- `T extends any` 的左右包裹 → 控制分配

---

## 2. `infer` 关键字

`infer` 允许在条件类型中**推断**类型变量：

### 2.1 基本推断模式

```typescript
// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never;

type A = ElementType<string[]>;  // string
type B = ElementType<number[]>;  // number

// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type C = ReturnType<() => string>; // string

// 提取函数参数类型
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type D = Parameters<(a: string, b: number) => void>; // [string, number]
```

### 2.2 多重 infer

```typescript
// 提取 Promise 的解析值
type Awaited<T> = T extends Promise<infer U> ? U : T;

type E = Awaited<Promise<string>>; // string
```

### 2.3 infer 的约束与默认值

```typescript
// 约束 infer 的范围（TS 4.7+）
type FirstString<T> = T extends [infer S extends string, ...unknown[]] ? S : never;

type F = FirstString<["hello", 42]>; // "hello"
type G = FirstString<[42, "hello"]>; // never

// infer 默认值（TS 4.7+）
type Foo<T> = T extends [infer U = string] ? U : never;
```

---

## 3. 高级模式

### 3.1 递归条件类型

```typescript
// 深度 Readonly
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// 提取所有嵌套 Promise 的解析值
type DeepAwaited<T> = T extends Promise<infer U>
  ? DeepAwaited<U>
  : T;

type H = DeepAwaited<Promise<Promise<string>>>; // string
```

### 3.2 类型提取工具

```typescript
// 提取构造函数参数
type ConstructorParameters<T> = T extends new (...args: infer P) => any ? P : never;

// 提取类实例类型
type InstanceType<T> = T extends new (...args: any[]) => infer R ? R : never;

// 提取 this 参数类型
type ThisParameterType<T> = T extends (this: infer U, ...args: any[]) => any ? U : unknown;
```

### 3.3 条件类型与映射类型的结合

```typescript
// 过滤对象中值为 string 的属性
type StringValues<T> = {
  [K in keyof T as T[K] extends string ? K : never]: T[K];
};

interface User {
  name: string;
  age: number;
  email: string;
}

type StringProps = StringValues<User>; // { name: string; email: string; }
```

---

## 4. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 分配性意外行为 | `T extends U` 在 T 为联合类型时分配 | 包裹 `[T]` 阻止分配 |
| `never` 的特殊处理 | `never` 作为条件类型输入时返回 `never` | 理解 `never` 是空联合 |
| 递归深度限制 | 复杂递归条件类型可能超限 | 简化递归；使用接口 |
| infer 位置限制 | infer 只能在条件的 `extends` 子句中使用 | 确保语法正确 |
| 裸类型参数识别 | 只有裸类型参数才分配，部分包装也视为裸 | 用 `[T]` 明确包裹 |

---

## 6. 条件类型实战

```typescript
// API 响应类型映射
type ApiResponse<T> = T extends { data: infer D }
  ? { success: true; data: D }
  : { success: false; error: string };

// 提取 Promise 返回值
type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
type Result = UnwrapPromise<Promise<number>>; // number

// 过滤 never
type FilterNever<T> = T extends [infer F, ...infer R]
  ? [F] extends [never]
    ? FilterNever<R>
    : [F, ...FilterNever<R>]
  : [];
```

---

**参考规范**：TypeScript Handbook: Conditional Types | TypeScript Handbook: infer

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
