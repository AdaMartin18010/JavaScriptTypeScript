/**
 * 条件类型与映射类型演示 (Conditional & Mapped Types)
 *
 * 涵盖: T extends U ? X : Y, infer, distributive conditional types,
 *       mapped types { [K in T]: V }, template literal types, recursive types
 */

// ============================================================
// 1. 条件类型基础
// ============================================================
function demoConditionalBasics() {
  console.log("\n=== Conditional Type Basics ===");

  // 基础语法: T extends U ? X : Y
  type IsString<T> = T extends string ? true : false;

  type A = IsString<"hello">; // true
  type B = IsString<42>;      // false

  const a: A = true;
  const b: B = false;
  console.log("IsString<'hello'>:", a);
  console.log("IsString<42>:", b);

  // 提取子类型
  type ExtractString<T> = T extends string ? T : never;
  type Extracted = ExtractString<string | number | "foo">; // string | "foo" ≡ string
  // 注意：分配性导致 string | number 的每个成员被检查
}

// ============================================================
// 2. infer 关键字 —— 类型提取
// ============================================================
function demoInfer() {
  console.log("\n=== infer Keyword ===");

  // 提取函数返回类型
  type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
  type FnRet = MyReturnType<() => string>; // string

  // 提取 Promise 内部类型
  type MyAwaited<T> = T extends Promise<infer U> ? U : T;
  type Promised = MyAwaited<Promise<number>>; // number

  // 提取数组元素类型
  type ElementType<T> = T extends (infer E)[] ? E : T;
  type ArrEl = ElementType<string[]>; // string

  // 提取元组类型
  type First<T extends readonly unknown[]> = T extends [infer F, ...unknown[]] ? F : never;
  type TupleFirst = First<[number, string, boolean]>; // number

  // 实际验证（通过类型断言的辅助变量）
  const fnRet: FnRet = "hello";
  const awaited: Promised = 42;
  const el: ArrEl = "world";
  const first: TupleFirst = 100;

  console.log("ReturnType demo:", fnRet);
  console.log("Awaited demo:", awaited);
  console.log("ElementType demo:", el);
  console.log("TupleFirst demo:", first);

  // 嵌套 infer
  type NestedPromise<T> = T extends Promise<Promise<infer U>> ? U : never;
  type Nested = NestedPromise<Promise<Promise<string>>>; // string
  const nested: Nested = "nested";
  console.log("nested infer:", nested);
}

// ============================================================
// 3. 分配性条件类型 (Distributive Conditional Types)
// ============================================================
function demoDistributiveConditionals() {
  console.log("\n=== Distributive Conditional Types ===");

  // 裸类型参数会自动分配到联合类型的每个成员
  type ToArray<T> = T extends any ? T[] : never;
  type Distributed = ToArray<string | number>; // string[] | number[]

  const strArr: Distributed = ["hello"]; // string[]
  const numArr: Extract<Distributed, number[]> = [1, 2, 3]; // number[]
  console.log("distributed string[]:", strArr);
  console.log("distributed number[]:", numArr);

  // 阻止分配：用元组包裹
  type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
  type NonDistributed = ToArrayNonDist<string | number>; // (string | number)[]

  const mixedArr: NonDistributed = ["hello", 42]; // ✅
  console.log("non-distributed mixed[]:", mixedArr);

  // 实用：过滤联合类型
  type Exclude<T, U> = T extends U ? never : T;
  type MyExcluded = Exclude<"a" | "b" | "c", "a" | "c">; // "b"

  type Extract<T, U> = T extends U ? T : never;
  type MyExtracted = Extract<"a" | "b" | "c", "a" | "c">; // "a" | "c"

  const excluded: MyExcluded = "b";
  const extracted: MyExtracted = "a";
  console.log("exclude result:", excluded);
  console.log("extract result:", extracted);
}

// ============================================================
// 4. 映射类型 (Mapped Types)
// ============================================================
function demoMappedTypes() {
  console.log("\n=== Mapped Types ===");

  interface User {
    id: number;
    name: string;
    email: string;
  }

  // 基础映射：全部可选
  type MyPartial<T> = {
    [K in keyof T]?: T[K];
  };

  // 基础映射：全部必需
  type MyRequired<T> = {
    [K in keyof T]-?: T[K]; // -? 移除可选修饰符
  };

  // 基础映射：全部只读
  type MyReadonly<T> = {
    readonly [K in keyof T]: T[K];
  };

  const partialUser: MyPartial<User> = { name: "Alice" };
  const requiredUser: MyRequired<Partial<User>> = { id: 1, name: "Bob", email: "bob@example.com" };
  const readonlyUser: MyReadonly<User> = { id: 2, name: "Carol", email: "carol@example.com" };

  console.log("partial user:", partialUser.name);
  console.log("required user:", requiredUser.email);
  console.log("readonly user:", readonlyUser.id);

  // 映射 + 条件：过滤属性
  type PickByType<T, U> = {
    [K in keyof T as T[K] extends U ? K : never]: T[K];
  };

  type StringProps = PickByType<User, string>; // { name: string; email: string }
  const stringProps: StringProps = { name: "Dave", email: "dave@example.com" };
  console.log("picked string props:", stringProps.name);
}

// ============================================================
// 5. 模板字面量类型 (Template Literal Types)
// ============================================================
function demoTemplateLiteralTypes() {
  console.log("\n=== Template Literal Types ===");

  type EventName<T extends string> = `on${Capitalize<T>}`;
  type ClickEvent = EventName<"click">; // "onClick"
  type HoverEvent = EventName<"hover">; // "onHover"

  const onClick: ClickEvent = "onClick";
  const onHover: HoverEvent = "onHover";
  console.log("event names:", onClick, onHover);

  // 联合类型的模板展开
  type HttpMethod = "get" | "post" | "put" | "delete";
  type Endpoint = `/api/${HttpMethod}`;
  // "/api/get" | "/api/post" | "/api/put" | "/api/delete"

  const endpoint: Endpoint = "/api/get";
  console.log("endpoint literal:", endpoint);

  // 键重映射
  type Getters<T> = {
    [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
  };

  interface Person {
    name: string;
    age: number;
  }

  type PersonGetters = Getters<Person>;
  const getters: PersonGetters = {
    getName: () => "Alice",
    getAge: () => 30,
  };
  console.log("getter result:", getters.getName());
}

// ============================================================
// 6. 递归类型 (Recursive Types)
// ============================================================
function demoRecursiveTypes() {
  console.log("\n=== Recursive Types ===");

  // JSON 的递归定义
  type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

  const data: JSONValue = {
    name: "root",
    count: 42,
    nested: {
      children: [
        { name: "child1", active: true },
        { name: "child2", active: false },
      ],
    },
  };
  console.log("recursive JSON:", JSON.stringify(data).slice(0, 60) + "...");

  // 递归条件类型：深度 Readonly
  type DeepReadonly<T> = {
    readonly [K in keyof T]: T[K] extends object ? DeepReadonly<T[K]> : T[K];
  };

  const deepObj: DeepReadonly<{ a: { b: { c: string } } }> = {
    a: { b: { c: "deep" } },
  };
  // deepObj.a.b.c = "modified"; // ❌ Error: readonly
  console.log("deep readonly:", deepObj.a.b.c);

  // 递归深度限制演示（安全版本）
  type Prev = [never, 0, 1, 2, 3, 4, 5];
  type SafeDeep<T, Depth extends number = 3> = Depth extends 0
    ? T
    : T extends object
    ? { [K in keyof T]: SafeDeep<T[K], Prev[Depth]> }
    : T;

  const safeDeep: SafeDeep<{ a: { b: { c: { d: string } } } }> = {
    a: { b: { c: { d: "safe" } } },
  };
  console.log("safe deep:", safeDeep.a.b.c.d);
}

// ============================================================
// 7. 反例 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // ❌ 反例 1：递归过深导致编译错误
  // type Infinite<T> = T extends object ? Infinite<T[keyof T]> : T;
  // type X = Infinite<{ a: { b: { c: string } } }>; // Error: Type instantiation is excessively deep

  // ❌ 反例 2：忘记分配性导致意外结果
  // type Wrap<T> = T extends string ? { value: T } : never;
  // type R = Wrap<string | number>;
  // 实际: { value: string } | never = { value: string }
  // 因为 T 是裸类型参数，分配到每个成员

  // ✅ 阻止分配
  type WrapNonDist<T> = [T] extends [string] ? { value: T } : never;
  type R2 = WrapNonDist<string | number>; // never
  console.log("non-distributed wrap result:", "never (demonstrated in type)");

  // ❌ 反例 3：infer 位置错误
  // type BadInfer<T> = T extends infer U ? U : never; // 合法但无意义

  // ❌ 反例 4：未终止的递归条件类型
  // type Flatten<T> = T extends (infer U)[] ? Flatten<U> : T;
  // 如果 T 是 any[] 会无限递归
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Conditional & Mapped Types Demo             ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoConditionalBasics();
  demoInfer();
  demoDistributiveConditionals();
  demoMappedTypes();
  demoTemplateLiteralTypes();
  demoRecursiveTypes();
  demoCounterExamples();

  console.log("\n✅ conditional-mapped-types demo complete\n");
}

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
