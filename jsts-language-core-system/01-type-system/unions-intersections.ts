/**
 * 联合类型与交叉类型演示 (Unions & Intersections)
 *
 * 涵盖: discriminated unions, union narrowing, intersection merging,
 *       never in unions, 分配律
 */

// ============================================================
// 1. 联合类型基础 (Union Types A | B)
// ============================================================
function demoUnionBasics() {
  console.log("\n=== Union Basics ===");

  type StringOrNumber = string | number;
  let value: StringOrNumber = "hello";
  value = 42; // ✅ 允许

  console.log("union value:", value);

  // 只能安全使用共有属性
  function getLength(x: string | number): number {
    if (typeof x === "string") {
      return x.length; // ✅ 在 string 分支中
    }
    return x.toString().length; // ✅ number 分支
  }

  console.log("length of string:", getLength("hello"));
  console.log("length of number:", getLength(12345));

  // ❌ 反例：直接访问非共有属性
  // x.length; // Error: Property 'length' does not exist on type 'number'
}

// ============================================================
// 2. 可辨识联合 (Discriminated Unions)
// ============================================================
function demoDiscriminatedUnions() {
  console.log("\n=== Discriminated Unions ===");

  type Result<T> =
    | { status: "success"; data: T }
    | { status: "error"; message: string }
    | { status: "loading" };

  function handleResult<T>(result: Result<T>): string {
    switch (result.status) {
      case "success":
        // result.data 自动推断为 T
        return `Data: ${JSON.stringify(result.data)}`;
      case "error":
        // result.message 自动推断为 string
        return `Error: ${result.message}`;
      case "loading":
        return "Loading...";
      default:
        // 穷尽检查
        return assertNever(result);
    }
  }

  const successResult: Result<number> = { status: "success", data: 42 };
  const errorResult: Result<number> = { status: "error", message: "fail" };
  const loadingResult: Result<number> = { status: "loading" };

  console.log(handleResult(successResult));
  console.log(handleResult(errorResult));
  console.log(handleResult(loadingResult));
}

function assertNever(x: never): never {
  throw new Error(`Unhandled: ${JSON.stringify(x)}`);
}

// ============================================================
// 3. 联合类型收窄 (Union Narrowing)
// ============================================================
function demoUnionNarrowing() {
  console.log("\n=== Union Narrowing ===");

  type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "square"; side: number }
    | { kind: "triangle"; base: number; height: number };

  function area(shape: Shape): number {
    if (shape.kind === "circle") {
      return Math.PI * shape.radius ** 2; // shape: circle
    }
    if (shape.kind === "square") {
      return shape.side ** 2; // shape: square
    }
    // 剩余自动推断为 triangle
    return 0.5 * shape.base * shape.height;
  }

  console.log("circle area:", area({ kind: "circle", radius: 2 }));
  console.log("square area:", area({ kind: "square", side: 3 }));
  console.log("triangle area:", area({ kind: "triangle", base: 4, height: 5 }));
}

// ============================================================
// 4. 交叉类型 (Intersection Types A & B)
// ============================================================
function demoIntersections() {
  console.log("\n=== Intersection Types ===");

  type Timestamped = { createdAt: Date; updatedAt: Date };
  type Auditable = { createdBy: string; updatedBy: string };

  // 交叉类型合并所有属性
  type FullEntity = Timestamped & Auditable;

  const entity: FullEntity = {
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "admin",
    updatedBy: "admin",
  };

  console.log("intersection entity createdBy:", entity.createdBy);

  // 同名同类型：合并成功
  type A = { x: string; y: number };
  type B = { x: string; z: boolean };
  type C = A & B; // { x: string; y: number; z: boolean }

  const c: C = { x: "hello", y: 1, z: true };
  console.log("merged same-name property:", c.x);

  // 同名不同类型：产生 never（不可满足）
  type Conflict = { mode: "dev" } & { mode: "prod" }; // mode: never
  // const impossible: Conflict = { mode: "dev" }; // ❌ Error
}

// ============================================================
// 5. never 在联合与交叉中的吸收律
// ============================================================
function demoNeverInUnions() {
  console.log("\n=== never in Unions & Intersections ===");

  // never 是联合的单位元: T | never ≡ T
  type UnionWithNever = string | never; // ≡ string

  // never 是交叉的零元: T & never ≡ never
  type IntersectWithNever = string & never; // ≡ never

  // unknown | never ≡ unknown
  // unknown & T ≡ T

  console.log("string | never ≡ string");
  console.log("string & never ≡ never");

  // 实际应用：过滤 never 从联合中移除
  type Filter<T, U> = T extends U ? T : never;
  type Extracted = Filter<"a" | "b" | "c", "a" | "c">; // "a" | "c"

  // 使用 never 移除属性
  type RemoveX<T> = {
    [K in keyof T as K extends "x" ? never : K]: T[K];
  };
  type WithoutX = RemoveX<{ x: number; y: string; z: boolean }>;
  // { y: string; z: boolean }

  const withoutX: WithoutX = { y: "hello", z: true };
  console.log("removed x property via never:", withoutX.y);
}

// ============================================================
// 6. 分配律 (A | B) & C = (A & C) | (B & C)
// ============================================================
function demoDistributiveLaw() {
  console.log("\n=== Distributive Law ===");

  // 条件类型对联合的分配性
  type ToArray<T> = T extends any ? T[] : never;
  type Distributed = ToArray<string | number>; // string[] | number[]

  // 阻止分配：用元组包裹
  type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
  type NonDistributed = ToArrayNonDist<string | number>; // (string | number)[]

  console.log("distributive: string[] | number[]");
  console.log("non-distributive: (string | number)[]");

  // 实际演示
  const distArr: Distributed = ["hello"]; // string[]
  const nonDistArr: NonDistributed = ["hello", 42]; // (string | number)[]
  console.log("distributed array:", distArr);
  console.log("non-distributed array:", nonDistArr);
}

// ============================================================
// 7. 反例 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // ❌ 反例 1：用 & 代替 | 产生 never
  // type Status = "loading" & "success" & "error"; // ≡ never

  // ❌ 反例 2：交叉类型属性缺失
  type NameAge = { name: string } & { age: number };
  // const partial: NameAge = { name: "Bob" }; // ❌ Error: missing age

  // ❌ 反例 3：联合类型直接访问非共有属性
  function unsafeProcess(value: string | number) {
    // return value.length; // ❌ number has no length
    return typeof value === "string" ? value.length : String(value).length;
  }
  console.log("safe process:", unsafeProcess(42));

  // ❌ 反例 4：不可满足的交叉
  type Impossible = string & number; // ≡ never
  // const fail: Impossible = 42 as any;

  console.log("common misuse patterns demonstrated (see comments)");
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Unions & Intersections Demo             ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoUnionBasics();
  demoDiscriminatedUnions();
  demoUnionNarrowing();
  demoIntersections();
  demoNeverInUnions();
  demoDistributiveLaw();
  demoCounterExamples();

  console.log("\n✅ unions-intersections demo complete\n");
}

if (require.main === module) {
  demo();
}
