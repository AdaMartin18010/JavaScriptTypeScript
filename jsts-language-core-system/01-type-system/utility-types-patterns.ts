/**
 * 工具类型与实用模式演示 (Utility Types & Patterns)
 *
 * 涵盖: 从零实现 Partial, Required, Pick, Omit, Record,
 *       Exclude, Extract, NonNullable, Parameters, ReturnType, Awaited
 */

// ============================================================
// 从零实现内置工具类型
// ============================================================

/** 将所有属性变为可选 */
type MyPartial<T> = {
  [K in keyof T]?: T[K];
};

/** 将所有属性变为必需 */
type MyRequired<T> = {
  [K in keyof T]-?: T[K];
};

/** 选取指定属性 */
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/** 排除指定属性 */
type MyOmit<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

/** 创建键值对对象类型 */
type MyRecord<K extends keyof any, V> = {
  [P in K]: V;
};

/** 从联合类型中排除 */
type MyExclude<T, U> = T extends U ? never : T;

/** 从联合类型中提取 */
type MyExtract<T, U> = T extends U ? T : never;

/** 排除 null 和 undefined */
type MyNonNullable<T> = T extends null | undefined ? never : T;

/** 提取函数参数类型 */
type MyParameters<T extends (...args: any[]) => any> = T extends (...args: infer P) => any ? P : never;

/** 提取函数返回类型 */
type MyReturnType<T extends (...args: any[]) => any> = T extends (...args: any[]) => infer R ? R : never;

/** 解包 Promise 类型 */
type MyAwaited<T> = T extends Promise<infer U> ? MyAwaited<U> : T;

// ============================================================
// 1. Partial & Required
// ============================================================
function demoPartialRequired() {
  console.log("\n=== Partial & Required ===");

  interface User {
    id: number;
    name: string;
    email?: string;
  }

  // MyPartial: 全部可选
  const partial: MyPartial<User> = { name: "Alice" }; // id 可省略
  console.log("Partial<User>:", partial);

  // MyRequired: 全部必需（包括原本可选的 email）
  const required: MyRequired<Partial<User>> = {
    id: 1,
    name: "Bob",
    email: "bob@example.com",
  };
  console.log("Required<Partial<User>>:", required.email);

  // 与内置对比
  const builtinPartial: Partial<User> = { id: 2 };
  console.log("builtin Partial:", builtinPartial.id);
}

// ============================================================
// 2. Pick & Omit
// ============================================================
function demoPickOmit() {
  console.log("\n=== Pick & Omit ===");

  interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    secretKey: string;
  }

  // Pick: 选取公开字段
  type ProductPublic = MyPick<Product, "id" | "name" | "price">;
  const publicProduct: ProductPublic = { id: 1, name: "Widget", price: 9.99 };
  console.log("Pick<Product, public>:", publicProduct.name);

  // Omit: 排除敏感字段
  type ProductSafe = MyOmit<Product, "secretKey">;
  const safeProduct: ProductSafe = {
    id: 2,
    name: "Gadget",
    price: 19.99,
    description: "A useful gadget",
  };
  console.log("Omit<Product, secretKey>:", safeProduct.description);

  // 链式使用
  type ProductMinimal = MyPick<MyOmit<Product, "secretKey">, "id" | "name">;
  const minimal: ProductMinimal = { id: 3, name: "Thing" };
  console.log("Pick<Omit<...>>:", minimal.name);
}

// ============================================================
// 3. Record
// ============================================================
function demoRecord() {
  console.log("\n=== Record ===");

  // 用 Record 创建字典类型
  type PageInfo = { title: string; path: string };
  type PageMap = MyRecord<"home" | "about" | "contact", PageInfo>;

  const pages: PageMap = {
    home: { title: "Home", path: "/" },
    about: { title: "About", path: "/about" },
    contact: { title: "Contact", path: "/contact" },
  };
  console.log("Record pages:", pages.home.title);

  // 索引签名 vs Record
  interface StringDict {
    [key: string]: string;
  }
  const dict: StringDict = { a: "alpha", b: "beta" };
  console.log("string dictionary:", dict.a);

  // Record 的键可以是联合类型，限制更严格
  type StrictKeys = MyRecord<"a" | "b", number>;
  const strict: StrictKeys = { a: 1, b: 2 };
  // strict.c = 3; // ❌ Error
  console.log("strict Record:", strict);
}

// ============================================================
// 4. Exclude & Extract
// ============================================================
function demoExcludeExtract() {
  console.log("\n=== Exclude & Extract ===");

  type All = "a" | "b" | "c" | "d" | "e";

  // Exclude: 从 All 中移除 "a" | "c"
  type WithoutAC = MyExclude<All, "a" | "c">; // "b" | "d" | "e"
  const without: WithoutAC = "b";
  console.log("Exclude<All, 'a'|'c'>:", without);

  // Extract: 从 All 中提取 "a" | "c" | "f"
  type OnlyACF = MyExtract<All, "a" | "c" | "f">; // "a" | "c"
  const only: OnlyACF = "a";
  console.log("Extract<All, 'a'|'c'|'f'>:", only);

  // 实用：从联合中排除特定类型
  type Primitive = string | number | boolean | Function;
  type NoFunction = MyExclude<Primitive, Function>; // string | number | boolean
  const noFn: NoFunction = true;
  console.log("Exclude<Primitive, Function>:", noFn);
}

// ============================================================
// 5. NonNullable
// ============================================================
function demoNonNullable() {
  console.log("\n=== NonNullable ===");

  type MaybeString = string | null | undefined;
  type DefinitelyString = MyNonNullable<MaybeString>; // string

  const str: DefinitelyString = "hello";
  console.log("NonNullable<string|null|undefined>:", str);

  // 实用：过滤数组中的 null/undefined
  function filterNonNull<T>(arr: (T | null | undefined)[]): T[] {
    return arr.filter((x): x is T => x !== null && x !== undefined);
  }

  const mixed = [1, null, 2, undefined, 3];
  const clean = filterNonNull(mixed);
  console.log("filtered non-null:", clean);
}

// ============================================================
// 6. Parameters & ReturnType
// ============================================================
function demoParametersReturnType() {
  console.log("\n=== Parameters & ReturnType ===");

  function greet(name: string, age: number): string {
    return `Hello ${name}, you are ${age}`;
  }

  // Parameters: 提取参数元组类型
  type GreetParams = MyParameters<typeof greet>; // [string, number]
  const params: GreetParams = ["Alice", 30];
  console.log("Parameters<typeof greet>:", params);

  // ReturnType: 提取返回类型
  type GreetReturn = MyReturnType<typeof greet>; // string
  const result: GreetReturn = greet(...params);
  console.log("ReturnType<typeof greet>:", result);

  // 重载函数只取最后一个签名
  function overloaded(x: string): string;
  function overloaded(x: number): number;
  function overloaded(x: string | number): string | number {
    return x;
  }
  type OverloadedReturn = MyReturnType<typeof overloaded>; // number (last overload)
  const ov: OverloadedReturn = 42;
  console.log("ReturnType of overloaded:", ov);
}

// ============================================================
// 7. Awaited
// ============================================================
function demoAwaited() {
  console.log("\n=== Awaited ===");

  // 解包一层 Promise
  type A = MyAwaited<Promise<string>>; // string
  const a: A = "unwrapped";
  console.log("Awaited<Promise<string>>:", a);

  // 递归解包嵌套 Promise
  type B = MyAwaited<Promise<Promise<number>>>; // number
  const b: B = 42;
  console.log("Awaited<Promise<Promise<number>>>:", b);

  // 非 Promise 直接返回
  type C = MyAwaited<string>; // string
  const c: C = "not a promise";
  console.log("Awaited<string>:", c);

  // 实用：异步函数返回值推断
  async function fetchUser(): Promise<{ id: number; name: string }> {
    return { id: 1, name: "Alice" };
  }

  type FetchUserReturn = MyAwaited<ReturnType<typeof fetchUser>>;
  const user: FetchUserReturn = { id: 2, name: "Bob" };
  console.log("Awaited<ReturnType<async fn>>:", user.name);
}

// ============================================================
// 8. 反例 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // ❌ 反例 1：Parameters/ReturnType 不能用于非函数类型
  // type BadParams = MyParameters<string>; // Error: Type 'string' does not satisfy the constraint

  // ❌ 反例 2：Pick 使用不在 keyof T 中的键
  // type BadPick = MyPick<{ a: string }, "b">; // Error: '"b"' does not satisfy the constraint

  // ❌ 反例 3：Record 的键过于宽泛
  // type BadRecord = Record<string, number>;
  // 与 { [key: string]: number } 等价，失去了具体键的限制

  // ✅ 正确：使用联合类型作为 Record 的键
  type GoodRecord = Record<"x" | "y", number>;
  const good: GoodRecord = { x: 1, y: 2 };
  console.log("good Record:", good);

  // ❌ 反例 4：NonNullable 不会移除 false/0/"" 等 falsy 值
  type FalsyOk = MyNonNullable<string | false | 0 | null>; // string | false | 0
  const falsy: FalsyOk = false; // ✅ false 保留了！
  console.log("NonNullable keeps false/0/empty-string:", falsy);
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Utility Types & Patterns Demo               ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoPartialRequired();
  demoPickOmit();
  demoRecord();
  demoExcludeExtract();
  demoNonNullable();
  demoParametersReturnType();
  demoAwaited();
  demoCounterExamples();

  console.log("\n✅ utility-types-patterns demo complete\n");
}

if (require.main === module) {
  demo();
}
