# TypeScript 高级类型系统特性：形式化语义与实现

## 目录

- [TypeScript 高级类型系统特性：形式化语义与实现](#typescript-高级类型系统特性形式化语义与实现)
  - [目录](#目录)
  - [1. 条件类型的形式化语义](#1-条件类型的形式化语义)
    - [1.1 基本定义](#11-基本定义)
    - [1.2 分发性（Distributivity）](#12-分发性distributivity)
    - [1.3 never 处理的形式化语义](#13-never-处理的形式化语义)
    - [1.4 infer 关键字的形式化](#14-infer-关键字的形式化)
  - [2. 映射类型的形式化](#2-映射类型的形式化)
    - [2.1 基本映射类型](#21-基本映射类型)
    - [2.2 Keyof 的形式化语义](#22-keyof-的形式化语义)
    - [2.3 重映射（as）的形式化](#23-重映射as的形式化)
    - [2.4 修饰符的形式化](#24-修饰符的形式化)
  - [3. 模板字面量类型的字符串操作语义](#3-模板字面量类型的字符串操作语义)
    - [3.1 模板字面量类型的形式化定义](#31-模板字面量类型的形式化定义)
    - [3.2 内置字符串操作类型](#32-内置字符串操作类型)
    - [3.3 字符串模式匹配与推断](#33-字符串模式匹配与推断)
    - [3.4 递归字符串操作](#34-递归字符串操作)
  - [4. 逆变、协变、双变的完整理论](#4-逆变协变双变的完整理论)
    - [4.1 形式化定义](#41-形式化定义)
    - [4.2 各位置的变型规则](#42-各位置的变型规则)
    - [4.3 变型注解](#43-变型注解)
    - [4.4 变型在类型推断中的应用](#44-变型在类型推断中的应用)
  - [5. 类型推断的约束求解算法](#5-类型推断的约束求解算法)
    - [5.1 形式化框架](#51-形式化框架)
    - [5.2 Hindley-Milner 算法](#52-hindley-milner-算法)
    - [5.3 约束求解的具体实现](#53-约束求解的具体实现)
    - [5.4 类型推断的边界情况](#54-类型推断的边界情况)
  - [6. 类型守卫和类型谓词的形式化](#6-类型守卫和类型谓词的形式化)
    - [6.1 类型守卫的形式化定义](#61-类型守卫的形式化定义)
    - [6.2 类型谓词的逻辑运算](#62-类型谓词的逻辑运算)
    - [6.3 asserts 谓词的形式化](#63-asserts-谓词的形式化)
    - [6.4 守卫的完备性检查](#64-守卫的完备性检查)
  - [7. 品牌类型（Branded Types）和名义子类型模拟](#7-品牌类型branded-types和名义子类型模拟)
    - [7.1 名义子类型的理论](#71-名义子类型的理论)
    - [7.2 品牌类型的实现模式](#72-品牌类型的实现模式)
    - [7.3 高级品牌类型模式](#73-高级品牌类型模式)
    - [7.4 不透明类型（Opaque Types）](#74-不透明类型opaque-types)
  - [8. 递归类型和循环引用的处理](#8-递归类型和循环引用的处理)
    - [8.1 递归类型的形式化定义](#81-递归类型的形式化定义)
    - [8.2 递归深度的限制](#82-递归深度的限制)
    - [8.3 循环引用的处理](#83-循环引用的处理)
    - [8.4 递归条件类型](#84-递归条件类型)
  - [9. 条件类型中的类型推断](#9-条件类型中的类型推断)
    - [9.1 infer 的完整语义](#91-infer-的完整语义)
    - [9.2 多重 infer 模式](#92-多重-infer-模式)
    - [9.3 infer 的约束与默认值](#93-infer-的约束与默认值)
    - [9.4 高级 infer 模式](#94-高级-infer-模式)

---

## 1. 条件类型的形式化语义

### 1.1 基本定义

条件类型（Conditional Types）是 TypeScript 中最强大的类型构造之一，其形式化语义可以表示为：

```
T extends U ? X : Y
```

**形式化定义**：

设类型域 $\mathcal{T}$，条件类型是一个三元运算符 $C: \mathcal{T} \times \mathcal{T} \times \mathcal{T} \times \mathcal{T} \to \mathcal{T}$，定义为：

$$
C(T, U, X, Y) = \begin{cases}
X & \text{if } T \subseteq U \text{ (T 可分配给 U)} \\
Y & \text{otherwise}
\end{cases}
$$

### 1.2 分发性（Distributivity）

**形式化定义**：

当条件类型作用于裸类型参数时，具有分发性：

$$
(T_1 | T_2 | ... | T_n) \text{ extends } U \ ? \ X \ : \ Y \equiv (T_1 \text{ extends } U \ ? \ X \ : \ Y) \ | \ ... \ | \ (T_n \text{ extends } U \ ? \ X \ : \ Y)
$$

**数学表示**：

设 $D(T) = T \text{ extends } U \ ? \ X \ : \ Y$，则：

$$
D(\bigcup_{i \in I} T_i) = \bigcup_{i \in I} D(T_i)
$$

**TypeScript 代码示例**：

```typescript
// 分发性的实际表现
type ToArray<T> = T extends any ? T[] : never;

// 联合类型被分发处理
type A = ToArray<string | number>;
// 等价于: string[] | number[]
// 而不是: (string | number)[]

// 禁用分发性：使用元组包装
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type B = ToArrayNonDist<string | number>;
// 结果: (string | number)[]
```

**实用模式**：

```typescript
// 模式1：从联合类型中过滤
type Exclude<T, U> = T extends U ? never : T;
type Extract<T, U> = T extends U ? T : never;

type T1 = Exclude<'a' | 'b' | 'c', 'a' | 'c'>; // 'b'
type T2 = Extract<'a' | 'b' | 'c', 'a' | 'd'>; // 'a'

// 模式2：联合类型的扁平化
type Flatten<T> = T extends (infer U)[] ? U : T;
type T3 = Flatten<string[]>;      // string
type T4 = Flatten<number[][]>;    // number[]

// 模式3：条件类型链
type DeepFlatten<T> =
  T extends (infer U)[]
    ? DeepFlatten<U>
    : T;
```

### 1.3 never 处理的形式化语义

**形式化定义**：

never 类型（空集）在条件类型中的特殊处理：

$$
\text{never extends } U \ ? \ X \ : \ Y \equiv \text{never}
$$

这是因为 never 作为空联合，分发后结果仍是空集：

$$
D(\emptyset) = \emptyset
$$

**数学表示**：

对于任意类型 $U, X, Y$：

$$
\bigcup_{t \in \emptyset} (t \text{ extends } U \ ? \ X \ : \ Y) = \text{never}
$$

**TypeScript 代码示例**：

```typescript
// never 在条件类型中的行为
type TestNever<T> = T extends string ? 'yes' : 'no';

type T1 = TestNever<never>;  // never（不是 'yes' 或 'no'）

// 实用：使用 never 过滤联合类型
type NonNullable<T> = T extends null | undefined ? never : T;

type T2 = NonNullable<string | number | null>;  // string | number

// 联合类型中的 never 自动消除
type T3 = 'a' | never | 'b';  // 'a' | 'b'
```

### 1.4 infer 关键字的形式化

**形式化定义**：

infer 引入类型变量，进行模式匹配：

$$
T \text{ extends } \text{Pattern}<\alpha> \ ? \ X[\alpha] \ : \ Y
$$

其中 $\alpha$ 是新引入的类型变量，在 true 分支中可用。

**约束规则**：

如果 $T \subseteq \text{Pattern}<U>$ 对多个 $U$ 成立，则 $\alpha$ 取这些 $U$ 的联合：

$$
\alpha = \bigcup \{ U \mid T \subseteq \text{Pattern}<U> \}
$$

**TypeScript 代码示例**：

```typescript
// 基本 infer 用法
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 多个 infer
type First<T> = T extends [infer F, ...any[]] ? F : never;
type Last<T> = T extends [...any[], infer L] ? L : never;

// 递归 infer
type DeepReturnType<T> =
  T extends (...args: any[]) => infer R
    ? R extends (...args: any[]) => any
      ? DeepReturnType<R>
      : R
    : never;

// 实际应用
function compose<F extends (...args: any[]) => any>(
  fn: F
): DeepReturnType<F> {
  // 实现省略
  return {} as any;
}
```

---

## 2. 映射类型的形式化

### 2.1 基本映射类型

**形式化定义**：

映射类型是一个从键集到类型集的函数：

$$
\text{MappedType}(K, V) = \{ [P \in K]: V(P) \}
$$

其中 $K$ 是键的联合类型，$V$ 是值类型构造器。

**数学表示**：

对于键集 $K = \{k_1, k_2, ..., k_n\}$：

$$
\{ [P \in K]: T \} \equiv \{ k_1: T[k_1/P], k_2: T[k_2/P], ..., k_n: T[k_n/P] \}
$$

**TypeScript 代码示例**：

```typescript
// 基本映射类型
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

type Required<T> = {
  [P in keyof T]-?: T[P];
};

type Record<K extends keyof any, T> = {
  [P in K]: T;
};

// 使用示例
interface Person {
  name: string;
  age: number;
}

type ReadonlyPerson = Readonly<Person>;
// { readonly name: string; readonly age: number; }
```

### 2.2 Keyof 的形式化语义

**形式化定义**：

keyof 运算符提取类型的所有键：

$$
\text{keyof}: \mathcal{T} \to \mathcal{T}_{\text{string | number | symbol}}
$$

对于对象类型 $T = \{ k_1: T_1, k_2: T_2, ..., k_n: T_n \}$：

$$
\text{keyof } T = k_1 \ | \ k_2 \ | \ ... \ | \ k_n
$$

**特殊情况**：

```
keyof any = string | number | symbol
keyof never = never
keyof unknown = never
```

**TypeScript 代码示例**：

```typescript
// keyof 的基本用法
interface Person {
  name: string;
  age: number;
  0: boolean;  // 数字键
}

type PersonKeys = keyof Person;  // 'name' | 'age' | 0

// 索引签名的 keyof
type StringRecord = { [key: string]: any };
type StringKeys = keyof StringRecord;  // string | number

// 实用：类型安全的属性访问
type ValueOf<T, K extends keyof T> = T[K];
type NameType = ValueOf<Person, 'name'>;  // string
```

### 2.3 重映射（as）的形式化

**形式化定义**：

重映射通过 as 子句转换键：

$$
\{ [P \in K \text{ as } N(P)]: T \}
$$

其中 $N: \text{keyof } T \to \text{PropertyKey}$ 是键转换函数。

**数学表示**：

设原始键集为 $K$，新键集为 $K' = \{ N(k) \mid k \in K \}$，则：

$$
\{ [P \in K \text{ as } N(P)]: T(P) \} \equiv \{ k': T(N^{-1}(k')) \mid k' \in K' \}
$$

**TypeScript 代码示例**：

```typescript
// 键名转换
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }

// 过滤键
type Filter<T, U> = {
  [P in keyof T as T[P] extends U ? P : never]: T[P];
};

interface Mixed {
  a: string;
  b: number;
  c: string;
}

type StringProps = Filter<Mixed, string>;
// { a: string; c: string; }

// 从联合类型中提取特定模式的键
type EventHandlers<T> = {
  [P in keyof T as P extends `on${string}` ? P : never]: T[P];
};

interface Props {
  onClick: () => void;
  onHover: () => void;
  value: string;
}

type Handlers = EventHandlers<Props>;
// { onClick: () => void; onHover: () => void; }
```

### 2.4 修饰符的形式化

**形式化定义**：

修饰符改变属性的可变性：

| 修饰符 | 含义 | 数学表示 |
|--------|------|----------|
| `?` | 可选 | $P: T \ \Rightarrow \ P?: T \ \equiv \ P: T \| \text{undefined}$ |
| `-?` | 必选项 | $P?: T \ \Rightarrow \ P: T$ |
| `readonly` | 只读 | $\text{readonly } P: T$ |
| `-readonly` | 可写 | $P: T$（移除 readonly）|

**TypeScript 代码示例**：

```typescript
// 修饰符操作
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

type RequiredBy<T, K extends keyof T> =
  & Required<Pick<T, K>>
  & Omit<T, K>;

type OptionalBy<T, K extends keyof T> =
  & Partial<Pick<T, K>>
  & Omit<T, K>;

// 递归应用修饰符
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// 使用示例
interface Config {
  server: {
    host: string;
    port: number;
  };
  debug: boolean;
}

type ImmutableConfig = DeepReadonly<Config>;
// 所有嵌套属性都变为 readonly
```

---

## 3. 模板字面量类型的字符串操作语义

### 3.1 模板字面量类型的形式化定义

**形式化定义**：

模板字面量类型构造字符串类型的子集：

$$
\text{Template}<S, T> = \{ s \cdot t \mid s \in S, t \in T \}
$$

其中 $\cdot$ 表示字符串连接。

**数学表示**：

对于模板 `` `prefix${T}suffix` ``：

$$
\{ \text{"prefix"} \cdot v \cdot \text{"suffix"} \mid v \in T \}
$$

**TypeScript 代码示例**：

```typescript
// 基本模板字面量类型
type Greeting = `Hello, ${string}`;
const valid: Greeting = "Hello, World";  // ✓
// const invalid: Greeting = "Hi, World";   // ✗

// 联合类型的展开
type Color = 'red' | 'blue';
type Size = 'small' | 'large';
type Style = `${Color}-${Size}`;
// 'red-small' | 'red-large' | 'blue-small' | 'blue-large'

// 多个插值
type EventName<T extends string, H extends string> = `on${Capitalize<T>}${Capitalize<H>}`;
type ClickEvent = EventName<'mouse', 'click'>;  // 'onMouseClick'
```

### 3.2 内置字符串操作类型

**形式化定义**：

TypeScript 4.1+ 提供的字符串操作：

| 操作 | 定义 | 形式化 |
|------|------|--------|
| `Uppercase<S>` | 转大写 | $\lambda s. \text{upper}(s)$ |
| `Lowercase<S>` | 转小写 | $\lambda s. \text{lower}(s)$ |
| `Capitalize<S>` | 首字母大写 | $\lambda s. \text{upper}(s[0]) \cdot s[1:]$ |
| `Uncapitalize<S>` | 首字母小写 | $\lambda s. \text{lower}(s[0]) \cdot s[1:]$ |

**TypeScript 代码示例**：

```typescript
// 字符串操作组合
type CamelCase<S extends string> =
  S extends `${infer P}_${infer Q}`
    ? `${Lowercase<P>}${Capitalize<CamelCase<Q>>}`
    : Lowercase<S>;

type T1 = CamelCase<'HELLO_WORLD'>;  // 'helloWorld'
type T2 = CamelCase<'FOO_BAR_BAZ'>;  // 'fooBarBaz'

// Kebab-case 转换
type KebabCase<S extends string> =
  S extends `${infer C}${infer T}`
    ? T extends Uncapitalize<T>
      ? `${Lowercase<C>}${KebabCase<T>}`
      : `${Lowercase<C>}-${KebabCase<T>}`
    : S;

type T3 = KebabCase<'helloWorld'>;  // 'hello-world'
```

### 3.3 字符串模式匹配与推断

**形式化定义**：

模式匹配提取字符串的组成部分：

$$
\text{Pattern}<S, P> = \begin{cases}
\text{成功} & \text{if } S \subseteq P \text{ (S 匹配模式 P)} \\
\text{失败} & \text{otherwise}
\end{cases}
$$

**递归模式匹配**：

```typescript
// 分割字符串
type Split<S extends string, D extends string> =
  S extends `${infer T}${D}${infer U}`
    ? [T, ...Split<U, D>]
    : [S];

type T1 = Split<'a,b,c', ','>;  // ['a', 'b', 'c']

// 解析 URL 参数
type ParseParams<S extends string> =
  S extends `${infer Path}?${infer Query}`
    ? { path: Path; query: ParseQuery<Query> }
    : { path: S; query: {} };

type ParseQuery<S extends string> =
  S extends `${infer K}=${infer V}&${infer Rest}`
    ? { [k in K]: V } & ParseQuery<Rest>
    : S extends `${infer K}=${infer V}`
      ? { [k in K]: V }
      : {};

type T2 = ParseParams<'/user?id=123&active=true'>;
// { path: '/user'; query: { id: '123'; active: 'true' } }
```

### 3.4 递归字符串操作

**TypeScript 代码示例**：

```typescript
// 字符串长度计算（递归）
type StringLength<
  S extends string,
  Acc extends any[] = []
> = S extends `${string}${infer Rest}`
  ? StringLength<Rest, [...Acc, any]>
  : Acc['length'];

type L1 = StringLength<'hello'>;  // 5

// 字符串反转
type ReverseString<S extends string> =
  S extends `${infer F}${infer R}`
    ? `${ReverseString<R>}${F}`
    : S;

type R1 = ReverseString<'hello'>;  // 'olleh'

// 查找替换
type Replace<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer L}${From}${infer R}`
  ? `${L}${To}${R}`
  : S;

type R2 = Replace<'hello world', 'world', 'typescript'>;
// 'hello typescript'

// 全部替换
type ReplaceAll<
  S extends string,
  From extends string,
  To extends string
> = S extends `${infer L}${From}${infer R}`
  ? `${L}${To}${ReplaceAll<R, From, To>}`
  : S;

type R3 = ReplaceAll<'foo bar foo', 'foo', 'baz'>;
// 'baz bar baz'
```



---

## 4. 逆变、协变、双变的完整理论

### 4.1 形式化定义

**子类型关系**：

记 $S <: T$ 表示 S 是 T 的子类型。

**形式化规则**：

| 变型 | 定义 | 数学表示 |
|------|------|----------|
| **协变 (Covariant)** | 保持子类型方向 | $S <: T \Rightarrow F(S) <: F(T)$ |
| **逆变 (Contravariant)** | 反转子类型方向 | $S <: T \Rightarrow F(T) <: F(S)$ |
| **双变 (Bivariant)** | 两个方向都成立 | $S <: T \Rightarrow F(S) <: F(T) \land F(T) <: F(S)$ |
| **不变 (Invariant)** | 仅相等时成立 | $S \equiv T \Rightarrow F(S) <: F(T)$ |

### 4.2 各位置的变型规则

**形式化推导**：

```
            S <: T
─────────────────────────────────── (协变)
{ x: S } <: { x: T }

            T <: S
─────────────────────────────────── (逆变)
(x: S) => R <: (x: T) => R

            S <: T
─────────────────────────────────── (协变返回值)
(x: A) => S <: (x: A) => T
```

**TypeScript 代码示例**：

```typescript
// 协变示例（属性类型）
interface Animal { name: string; }
interface Dog extends Animal { bark(): void; }

interface Container<T> {
  value: T;
}

declare let animalContainer: Container<Animal>;
declare let dogContainer: Container<Dog>;

// dogContainer = animalContainer;  // Error: 属性是协变的
animalContainer = dogContainer;     // OK: Dog <: Animal => Container<Dog> <: Container<Animal>

// 逆变示例（函数参数）
type Handler<T> = (arg: T) => void;

declare let animalHandler: Handler<Animal>;
declare let dogHandler: Handler<Dog>;

dogHandler = animalHandler;      // OK: Animal >: Dog => Handler<Animal> <: Handler<Dog>
// animalHandler = dogHandler;   // Error: 参数是逆变的
```

### 4.3 变型注解

**形式化语法**：

```
+T  (协变)
-T  (逆变)
```

**TypeScript 配置**：

```typescript
// tsconfig.json 中启用严格变型检查
{
  "compilerOptions": {
    "strictFunctionTypes": true,  // 函数参数逆变
    "strictPropertyInitialization": true
  }
}
```

**完整示例**：

```typescript
// 变型的实际影响
interface Event {
  timestamp: number;
}

interface MouseEvent extends Event {
  x: number;
  y: number;
}

// 事件处理器 - 参数逆变
type EventHandler<E extends Event> = (e: E) => void;

function addHandler(
  handler: EventHandler<Event>
) {
  // 可以处理任何 Event
}

// 可以接受更通用的处理器
addHandler((e: Event) => console.log(e.timestamp));

// 类中的变型
class Producer<+T> {  // 理论表示，TS 不支持此语法
  produce(): T { throw new Error(); }
}

class Consumer<-T> {  // 理论表示
  consume(t: T): void {}
}
```

### 4.4 变型在类型推断中的应用

**实用模式**：

```typescript
// 利用逆变实现类型安全的事件系统
type EventMap = {
  click: { x: number; y: number };
  input: { value: string };
  submit: { data: FormData };
};

type EventHandlers<T extends Record<string, any>> = {
  [K in keyof T]: (event: T[K]) => void;
};

// 事件总线接口
interface EventBus<T extends Record<string, any>> {
  on<K extends keyof T>(
    type: K,
    handler: (event: T[K]) => void
  ): void;
  emit<K extends keyof T>(type: K, event: T[K]): void;
}

// 实现
type ConcreteEventBus = EventBus<EventMap>;
```

---

## 5. 类型推断的约束求解算法

### 5.1 形式化框架

**定义**：

类型推断问题可以形式化为约束求解问题：

$$
\text{给定}: \Gamma \vdash e : T \\
\text{求解}: \text{替换 } S \text{ 使得 } S(\Gamma) \vdash e : S(T)
$$

**约束集合**：

$$
C = \{ T_i <: U_i \mid i = 1..n \}
$$

**求解目标**：

找到最一般的替换（Most General Unifier, MGU）：

$$
S = \text{mgu}(C) = \bigcap \{ S' \mid S' \text{ 满足 } C \}
$$

### 5.2 Hindley-Milner 算法

**算法步骤**：

```
1. 为表达式生成约束
2. 统一约束求解
3. 应用替换得到类型
```

**形式化规则**：

$$
\frac{\Gamma \vdash e_1 : T_1 \quad \Gamma, x: T_1 \vdash e_2 : T_2}
     {\Gamma \vdash \text{let } x = e_1 \text{ in } e_2 : T_2}
$$

**TypeScript 代码示例**：

```typescript
// TypeScript 的类型推断行为
// 1. 上下文无关推断
function identity<T>(x: T): T {
  return x;
}

const num = identity(42);      // T 推断为 number
const str = identity("hello"); // T 推断为 string

// 2. 上下文敏感推断（双向推断）
declare function map<T, U>(arr: T[], fn: (x: T) => U): U[];

const lengths = map(["a", "bb", "ccc"], s => s.length);
// T 推断为 string（从数组）
// U 推断为 number（从返回值）

// 3. 多重约束
type HasLength = { length: number };

function logLength<T extends HasLength>(x: T): T {
  console.log(x.length);
  return x;
}
```

### 5.3 约束求解的具体实现

**形式化算法**：

```typescript
// 约束表示
type Constraint = {
  type: 'subtype' | 'equality';
  left: Type;
  right: Type;
};

// 统一算法（简化版）
function unify(constraints: Constraint[]): Map<TypeVar, Type> {
  const substitution = new Map<TypeVar, Type>();

  for (const c of constraints) {
    if (c.type === 'equality') {
      unifyTypes(c.left, c.right, substitution);
    }
  }

  return substitution;
}

function unifyTypes(
  t1: Type,
  t2: Type,
  subst: Map<TypeVar, Type>
): void {
  // 变量绑定
  if (isTypeVar(t1)) {
    bindVar(t1, t2, subst);
    return;
  }
  if (isTypeVar(t2)) {
    bindVar(t2, t1, subst);
    return;
  }

  // 结构统一
  if (isFunction(t1) && isFunction(t2)) {
    // 参数逆变，返回值协变
    unifyTypes(t2.param, t1.param, subst);  // 逆变
    unifyTypes(t1.return, t2.return, subst); // 协变
  }

  // 对象类型统一
  if (isObject(t1) && isObject(t2)) {
    for (const key of intersectKeys(t1, t2)) {
      unifyTypes(t1.props[key], t2.props[key], subst);
    }
  }
}
```

### 5.4 类型推断的边界情况

**TypeScript 代码示例**：

```typescript
// 1. 多态递归
type NestedArray<T> = T | NestedArray<T>[];

function flatten<T>(arr: NestedArray<T>): T[] {
  if (Array.isArray(arr)) {
    return arr.flatMap(flatten);
  }
  return [arr];
}

// 2. 高阶类型推断
type Pipe = <A, B, C>(
  f: (a: A) => B,
  g: (b: B) => C
) => (a: A) => C;

const pipe: Pipe = (f, g) => x => g(f(x));

// 3. 条件类型推断
type InferArray<T> = T extends (infer U)[] ? U : never;

function head<T extends any[]>(arr: T): InferArray<T> {
  return arr[0];
}

// 4. 默认类型参数
type Config<T = string, U = number> = {
  data: T;
  count: U;
};

type DefaultConfig = Config;  // { data: string; count: number; }
```

---

## 6. 类型守卫和类型谓词的形式化

### 6.1 类型守卫的形式化定义

**形式化定义**：

类型守卫是一个运行时检查，具有静态类型细化效果：

$$
\text{guard}: (x: T) \to x \text{ is } U \text{ where } U <: T
$$

**形式化规则**：

$$
\frac{\Gamma \vdash e : T \quad \Gamma \vdash \text{guard}(e) : \text{boolean}}
     {\Gamma, \text{guard}(e) = \text{true} \vdash e : U}
$$

**TypeScript 代码示例**：

```typescript
// 基本类型守卫
function isString(x: unknown): x is string {
  return typeof x === 'string';
}

function isNumber(x: unknown): x is number {
  return typeof x === 'number';
}

// 使用
function process(x: string | number) {
  if (isString(x)) {
    // x 被细化为 string
    return x.toUpperCase();
  }
  // x 被细化为 number
  return x.toFixed(2);
}

// 自定义类型守卫
type Fish = { swim(): void; name: string };
type Bird = { fly(): void; name: string };

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

function move(pet: Fish | Bird) {
  if (isFish(pet)) {
    pet.swim();
  } else {
    pet.fly();
  }
}
```

### 6.2 类型谓词的逻辑运算

**形式化定义**：

类型谓词可以进行逻辑组合：

$$
\begin{align}
\text{guard}_1 \land \text{guard}_2 &: x \text{ is } T_1 \cap T_2 \\
\text{guard}_1 \lor \text{guard}_2 &: x \text{ is } T_1 \cup T_2 \\
\neg \text{guard} &: x \text{ is } \text{not } T
\end{align}
$$

**TypeScript 代码示例**：

```typescript
// 交集守卫
function isStringArray(x: unknown): x is string[] {
  return Array.isArray(x) && x.every(isString);
}

// 析取守卫
function isNullish(x: unknown): x is null | undefined {
  return x === null || x === undefined;
}

// 否定守卫（通过 else 分支）
type NonNullable<T> = T extends null | undefined ? never : T;

function assertNonNull<T>(x: T): asserts x is NonNullable<T> {
  if (x === null || x === undefined) {
    throw new Error('Value is nullish');
  }
}

// 复杂守卫组合
type ValidUser = {
  id: number;
  name: string;
  email: string;
};

function isValidUser(obj: unknown): obj is ValidUser {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as any).id === 'number' &&
    'name' in obj &&
    typeof (obj as any).name === 'string' &&
    'email' in obj &&
    typeof (obj as any).email === 'string'
  );
}
```

### 6.3 asserts 谓词的形式化

**形式化定义**：

asserts 谓词在函数成功返回时确保条件成立：

$$
\text{asserts } x \text{ is } T : (x: U) \to \text{void} \land (x = T \text{ after return})
$$

**TypeScript 代码示例**：

```typescript
// 基本 asserts
type AssertIsString = (x: unknown) => asserts x is string;

const assertString: AssertIsString = (x) => {
  if (typeof x !== 'string') {
    throw new TypeError('Expected string');
  }
};

function processUnknown(x: unknown) {
  assertString(x);
  return x.toUpperCase();  // x 被细化为 string
}

// asserts this 守卫
class Stack<T> {
  #items: T[] = [];

  pop(): asserts this is { isEmpty: false } {
    if (this.isEmpty) {
      throw new Error('Stack is empty');
    }
    this.#items.pop();
  }

  get isEmpty(): boolean {
    return this.#items.length === 0;
  }
}

// 属性断言
type AssertHasProperty<T, K extends string> = (
  obj: T,
  key: K
) => asserts obj is T & Record<K, unknown>;

const assertHas: AssertHasProperty<object, string> = (obj, key) => {
  if (!(key in obj)) {
    throw new Error(`Missing property: ${key}`);
  }
};
```

### 6.4 守卫的完备性检查

**实用模式**：

```typescript
// 穷尽守卫检查
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }
  | { kind: 'triangle'; base: number; height: number };

function getArea(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2;
    case 'square':
      return shape.side ** 2;
    case 'triangle':
      return (shape.base * shape.height) / 2;
    default:
      // 穷尽检查：确保所有 case 都被处理
      const _exhaustive: never = shape;
      return _exhaustive;
  }
}

// 守卫映射
type GuardMap<T extends Record<string, any>> = {
  [K in keyof T]: (x: unknown) => x is T[K];
};

const typeGuards: GuardMap<{
  string: string;
  number: number;
  boolean: boolean;
}> = {
  string: (x): x is string => typeof x === 'string',
  number: (x): x is number => typeof x === 'number',
  boolean: (x): x is boolean => typeof x === 'boolean',
};
```


---

## 7. 品牌类型（Branded Types）和名义子类型模拟

### 7.1 名义子类型的理论

**形式化定义**：

名义子类型基于类型名称而非结构：

$$
S <:_{nominal} T \iff \text{name}(S) = \text{name}(T) \lor \text{inherits}(S, T)
$$

**与结构子类型的对比**：

| 类型系统 | 判定标准 | 示例 |
|----------|----------|------|
| 结构子类型 | 形状兼容 | `{x: number} <: {x: number}` |
| 名义子类型 | 声明关系 | `class B extends A` |

**TypeScript 代码示例**：

```typescript
// 问题：TypeScript 是结构类型的
type Meters = number;
type Seconds = number;

function run(distance: Meters, time: Seconds): number {
  return distance / time;
}

const m: Meters = 100;
const s: Seconds = 10;

run(s, m);  // 编译通过！但逻辑错误

// 解决方案：品牌类型
type Branded<T, B> = T & { __brand: B };

type Meters2 = Branded<number, 'meters'>;
type Seconds2 = Branded<number, 'seconds'>;

function createMeters(n: number): Meters2 {
  return n as Meters2;
}

function createSeconds(n: number): Seconds2 {
  return n as Seconds2;
}

const m2 = createMeters(100);
const s2 = createSeconds(10);

// run(s2, m2);  // Error: 类型不兼容
```

### 7.2 品牌类型的实现模式

**形式化定义**：

品牌类型通过交叉类型附加名义标签：

$$
\text{Branded}<T, B> = T \ \& \ \{ \_\_brand: B \}
$$

**TypeScript 代码示例**：

```typescript
// 基础品牌类型
type Brand<K, T> = K & { __brand: T };

// 具体品牌
export type USD = Brand<number, 'USD'>;
export type EUR = Brand<number, 'EUR'>;
export type JPY = Brand<number, 'JPY'>;

// 工厂函数
export const Money = {
  usd: (amount: number): USD => amount as USD,
  eur: (amount: number): EUR => amount as EUR,
  jpy: (amount: number): JPY => amount as JPY,
};

// 安全的货币操作
function addUSD(a: USD, b: USD): USD {
  return (a + b) as USD;
}

// 使用
const price1 = Money.usd(100);
const price2 = Money.usd(50);
// const price3 = Money.eur(30);

const total = addUSD(price1, price2);  // OK
// addUSD(price1, price3);  // Error: 类型不兼容

// ID 类型（防混淆）
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

function getUser(id: UserId): User {
  // 实现
}

function getPost(id: PostId): Post {
  // 实现
}
```

### 7.3 高级品牌类型模式

**实用模式**：

```typescript
// 带验证的品牌类型
interface Validated<T> {
  __validated: true;
  value: T;
}

type Email = Brand<string, 'Email'>;

function createEmail(value: string): Email | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) ? value as Email : null;
}

// 状态机品牌
type State<T, S extends string> = T & { __state: S };

type Unvalidated<T> = State<T, 'unvalidated'>;
type Valid<T> = State<T, 'validated'>;

type UserData = {
  name: string;
  email: string;
};

type UnvalidatedUser = Unvalidated<UserData>;
type ValidUser = Valid<UserData>;

function validateUser(user: UnvalidatedUser): ValidUser | null {
  if (user.name && user.email) {
    return user as ValidUser;
  }
  return null;
}

function saveUser(user: ValidUser): void {
  // 只能保存已验证的用户
}

// 使用
const raw: UnvalidatedUser = { name: 'John', email: '' } as UnvalidatedUser;
// saveUser(raw);  // Error: 需要 ValidUser

const validated = validateUser(raw);
if (validated) {
  saveUser(validated);  // OK
}

// 品牌类型的工具
type Unbrand<T> = T extends Brand<infer U, any> ? U : T;
type GetBrand<T> = T extends Brand<any, infer B> ? B : never;
```

### 7.4 不透明类型（Opaque Types）

**形式化定义**：

不透明类型隐藏实现细节，只允许通过特定操作访问：

```typescript
// 不透明类型声明
type Opaque<T, K> = T & { readonly __opaque__: K };

// 文件路径（跨平台安全）
type FilePath = Opaque<string, 'FilePath'>;

namespace FilePath {
  export function fromString(path: string): FilePath {
    // 规范化路径
    return normalizePath(path) as FilePath;
  }

  export function join(...segments: string[]): FilePath {
    return segments.join('/') as FilePath;
  }

  export function toString(path: FilePath): string {
    return path as string;
  }

  export function basename(path: FilePath): string {
    return (path as string).split('/').pop() || '';
  }
}

// 使用
const path = FilePath.fromString('./src/../dist');
// 无法直接操作内部字符串
// const wrong = path + '/file';  // Error
const joined = FilePath.join(FilePath.toString(path), 'file');
```

---

## 8. 递归类型和循环引用的处理

### 8.1 递归类型的形式化定义

**形式化定义**：

递归类型通过自引用定义无限结构：

$$
T = \mu \alpha. F(\alpha)
$$

其中 $\mu$ 是不动点算子，$F$ 是类型构造函数。

**展开表示**：

$$
\mu \alpha. F(\alpha) = F(\mu \alpha. F(\alpha)) = F(F(F(...)))
$$

**TypeScript 代码示例**：

```typescript
// 基本递归类型
type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

// 链表
type List<T> = { value: T; next: List<T> | null };

// 树结构
type TreeNode<T> = {
  value: T;
  left: TreeNode<T> | null;
  right: TreeNode<T> | null;
};

// 嵌套对象
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

// 实际使用
interface Config {
  server: {
    host: string;
    port: number;
    ssl: {
      enabled: boolean;
      cert: string;
    };
  };
}

type PartialConfig = DeepPartial<Config>;
```

### 8.2 递归深度的限制

**形式化说明**：

TypeScript 对递归深度有限制（默认约 50 层）：

$$
\text{recursion\_limit} = 50
$$

**处理策略**：

```typescript
// 尾递归优化形式
type DeepReadonly<T> = T extends any[]
  ? readonly DeepReadonly<T[number]>[]
  : T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// 尾递归的递归类型
type Tuple<T, N extends number, R extends T[] = []> =
  R['length'] extends N ? R : Tuple<T, N, [...R, T]>;

type T1 = Tuple<string, 3>;  // [string, string, string]

// 处理深度限制的辅助类型
type DeepModify<T, Depth extends number = 10> =
  Depth extends 0
    ? T
    : T extends object
      ? { [K in keyof T]: DeepModify<T[K], Prev<Depth>> }
      : T;

// 数字递减辅助
type Prev<N extends number> =
  N extends 10 ? 9 :
  N extends 9 ? 8 :
  N extends 8 ? 7 :
  N extends 7 ? 6 :
  N extends 6 ? 5 :
  N extends 5 ? 4 :
  N extends 4 ? 3 :
  N extends 3 ? 2 :
  N extends 2 ? 1 :
  N extends 1 ? 0 :
  0;
```

### 8.3 循环引用的处理

**TypeScript 代码示例**：

```typescript
// 接口的循环引用
interface User {
  id: string;
  name: string;
  posts: Post[];
  friends: User[];  // 自引用
}

interface Post {
  id: string;
  title: string;
  author: User;  // 循环引用
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  author: User;
  post: Post;
}

// 类型级别的循环引用检测
type HasCircularRef<T, Seen = never> =
  T extends object
    ? T extends Seen
      ? true
      : HasCircularRef<T[keyof T], Seen | T>
    : false;

// 安全的循环类型转换
type SafePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? SafePartial<U>[]
    : T[P] extends object
      ? SafePartial<T[P]>
      : T[P];
};
```

### 8.4 递归条件类型

**实用模式**：

```typescript
// 深度扁平化
type DeepFlatten<T> = T extends (infer U)[]
  ? DeepFlatten<U>
  : T extends object
    ? { [K in keyof T]: DeepFlatten<T[K]> }
    : T;

// 路径提取
type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? {
        [K in keyof T]-?: K extends string | number
          ? `${K}` | `${K}.${Paths<T[K], Prev<D>>}`
          : never;
      }[keyof T]
    : never;

interface Data {
  user: {
    name: string;
    address: {
      city: string;
      zip: number;
    };
  };
}

type DataPaths = Paths<Data>;
// 'user' | 'user.name' | 'user.address' | 'user.address.city' | 'user.address.zip'

// 路径值类型
type PathValue<T, P extends string> =
  P extends `${infer K}.${infer Rest}`
    ? K extends keyof T
      ? PathValue<T[K], Rest>
      : never
    : P extends keyof T
      ? T[P]
      : never;

type CityType = PathValue<Data, 'user.address.city'>;  // string
```

---

## 9. 条件类型中的类型推断

### 9.1 infer 的完整语义

**形式化定义**：

infer 在条件类型中引入存在量词：

$$
T \text{ extends } C<\exists \alpha> \ ? \ R[\alpha] \ : \ F
$$

**约束求解**：

如果 $T$ 匹配多个模式实例，$\alpha$ 取最宽的满足条件的类型：

$$
\alpha = \bigvee \{ U \mid T <: C<U> \}
$$

**TypeScript 代码示例**：

```typescript
// 基本模式匹配
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// 构造器参数
type ConstructorParameters<T> =
  T extends new (...args: infer P) => any ? P : never;
type InstanceType<T> =
  T extends new (...args: any[]) => infer R ? R : never;

// this 参数提取
type ThisParameterType<T> =
  T extends (this: infer U, ...args: any[]) => any ? U : unknown;
type OmitThisParameter<T> =
  T extends (this: any, ...args: infer P) => infer R
    ? (...args: P) => R
    : T;

// 使用示例
class MyClass {
  constructor(public x: number, public y: string) {}
}

type MyClassParams = ConstructorParameters<typeof MyClass>;
// [x: number, y: string]

type MyClassInstance = InstanceType<typeof MyClass>;
// MyClass
```

### 9.2 多重 infer 模式

**TypeScript 代码示例**：

```typescript
// Promise 链解析
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type P1 = Awaited<Promise<Promise<string>>>;  // string

// 异步函数返回值
type AsyncReturnType<T> =
  T extends (...args: any[]) => Promise<infer R>
    ? R
    : T extends (...args: any[]) => infer R
      ? R
      : never;

// 元组位置推断
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type H = Head<[1, 2, 3]>;      // 1
type T = Tail<[1, 2, 3]>;      // [2, 3]
type L = Last<[1, 2, 3]>;      // 3

// 数组元素推断
type Flatten<T> = T extends (infer U)[][] ? U[] : T;
type T1 = Flatten<string[][]>;  // string[]

// 复杂结构推断
type UnpackArray<T> = T extends Array<infer U> ? U : T;
type UnpackFunction<T> = T extends (...args: any[]) => infer R ? R : T;
type UnpackPromise<T> = T extends Promise<infer R> ? R : T;

// 链式解包
type DeepUnpack<T> =
  T extends Promise<infer R>
    ? DeepUnpack<R>
    : T extends (...args: any[]) => infer R
      ? DeepUnpack<R>
      : T extends Array<infer R>
        ? DeepUnpack<R>
        : T;

type D1 = DeepUnpack<Promise<Promise<string[]>>>;  // string
```

### 9.3 infer 的约束与默认值

**TypeScript 4.7+ 约束推断**：

```typescript
// 带约束的 infer
type FirstString<T> =
  T extends [infer S extends string, ...unknown[]]
    ? S
    : never;

type F1 = FirstString<['hello', number]>;  // 'hello'
type F2 = FirstString<[number, string]>;   // never

// 函数重载解析
type LastSignature<T> =
  T extends { (...args: any[]): infer R; (...args: any[]): any }
    ? R
    : never;

// 递归 infer
type DeepAwaited<T> =
  T extends Promise<infer U>
    ? DeepAwaited<U>
    : T;

// 条件链中的 infer
type ParseURL<T extends string> =
  T extends `${infer Protocol}://${infer Rest}`
    ? Protocol extends 'http' | 'https'
      ? Rest extends `${infer Host}/${infer Path}`
        ? { protocol: Protocol; host: Host; path: Path }
        : { protocol: Protocol; host: Rest; path: '' }
      : never
    : never;

type URLParts = ParseURL<'https://example.com/path/to/resource'>;
// { protocol: 'https'; host: 'example.com'; path: 'path/to/resource' }
```

### 9.4 高级 infer 模式

**实用模式**：

```typescript
// 提取事件处理器参数
type EventPayload<T, K extends keyof T> =
  T[K] extends ((event: infer E) => void) | undefined
    ? E
    : never;

interface ComponentEvents {
  onClick?: (event: { x: number; y: number }) => void;
  onChange?: (event: { value: string }) => void;
}

type ClickEvent = EventPayload<ComponentEvents, 'onClick'>;
// { x: number; y: number }

// 提取映射类型的键和值
type KeyOf<T> = T extends Map<infer K, any> ? K : never;
type ValueOf<T> = T extends Map<any, infer V> ? V : never;

// 条件类型中的联合推断
type AllValues<T> = T extends Record<string, infer V> ? V : never;

type Obj = { a: string; b: number; c: boolean };
type V = AllValues<Obj>;  // string | number | boolean

// 数组长度推断
type Length<T extends readonly any[]> = T['length'];
type IsEmpty<T extends readonly any[]> = T extends [] ? true : false;
```
