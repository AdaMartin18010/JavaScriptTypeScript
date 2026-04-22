/**
 * 基础类型体系演示 (Type Foundations)
 *
 * 涵盖: unknown / any / never, literal types, strict 模式效果,
 *       null / undefined 区分, 顶类型 / 底类型
 */

// ============================================================
// 1. unknown — 顶类型 (⊤)，强制类型守卫后才能使用
// ============================================================
function demoUnknown() {
  console.log("\n=== unknown ===");

  const raw: unknown = fetchDataFromNetwork(); // 模拟外部数据

  // ❌ 反例：不能直接使用 unknown
  // raw.toFixed(); // Error: Object is of type 'unknown'

  // ✅ 正例：通过类型守卫收窄后才能使用
  if (typeof raw === "number") {
    console.log("narrowed to number:", raw.toFixed(2));
  }

  // unknown 可接收任何类型
  const a: unknown = 42;
  const b: unknown = "hello";
  const c: unknown = null;
  console.log("unknown accepts any value:", { a, b, c });
}

function fetchDataFromNetwork(): unknown {
  return 3.14159;
}

// ============================================================
// 2. any — 类型系统的“逃生舱”，绕过所有检查
// ============================================================
function demoAny() {
  console.log("\n=== any ===");

  let danger: any = 42;
  danger = "now I'm a string"; // 允许：任意赋值

  // ⚠️ 运行时可能崩溃，但编译通过
  console.log("any value:", danger);

  // ❌ 反例：any 破坏类型传递性
  let x: any = 1;
  let y: string = x; // 编译通过，但运行时 x 是 number
  console.log("any assigned to string (unsafe):", y);

  // any 可赋值给任何类型，也可接收任何类型
  let s: string = danger; // 危险！
  console.log("any → string (runtime risk):", s);
}

// ============================================================
// 3. never — 底类型 (⊥)，表示不可能存在的值
// ============================================================
function demoNever() {
  console.log("\n=== never ===");

  // never 可赋值给任何类型（因为它是所有类型的子类型）
  const fail = (): never => {
    throw new Error("always throws");
  };

  // ✅ 正例：穷尽检查 (exhaustiveness checking)
  type Shape = { kind: "circle" } | { kind: "square" };
  function area(s: Shape): number {
    switch (s.kind) {
      case "circle": return Math.PI;
      case "square": return 1;
      default:
        // s 在这里的类型为 never
        return assertNever(s);
    }
  }

  console.log("never in exhaustiveness check works");

  // ❌ 反例：不能把其他类型赋值给 never
  // const impossible: never = 42; // Error: Type 'number' is not assignable to type 'never'
}

function assertNever(x: never): never {
  throw new Error(`Unexpected object: ${x}`);
}

// ============================================================
// 4. 字面量类型 (Literal Types)
// ============================================================
function demoLiteralTypes() {
  console.log("\n=== Literal Types ===");

  // const 推断为精确的字面量类型
  const exactNum = 42;       // type: 42
  const exactStr = "hello";  // type: "hello"
  const exactBool = true;    // type: true

  console.log("literal types inferred:", exactNum, exactStr, exactBool);

  // let 推断为 widened 类型
  let widened = 42;          // type: number
  widened = 100;             // ✅ 允许

  // ✅ 显式声明字面量类型
  let direction: "up" | "down" | "left" | "right" = "up";
  // direction = "forward"; // ❌ Error: Type '"forward"' is not assignable

  console.log("direction literal:", direction);
}

// ============================================================
// 5. strict 模式效果
// ============================================================
function demoStrictEffects() {
  console.log("\n=== strict mode effects ===");

  // strictNullChecks: on 时，null/undefined 不能随意赋值给其他类型
  let name: string = "Alice";
  // name = null; // ❌ Error (with strictNullChecks)

  // ✅ 必须显式联合
  let maybeName: string | null = null;
  maybeName = "Bob";
  console.log("nullable string:", maybeName);

  // 未初始化变量在 strict 下报错
  // let uninitialized: string;
  // console.log(uninitialized); // ❌ Error: Variable is used before being assigned

  // 隐式 any 在 strict/noImplicitAny 下报错
  // function fn(x) { return x + 1; } // ❌ Parameter 'x' implicitly has an 'any' type

  console.log("strict mode ensures explicit null handling");
}

// ============================================================
// 6. null vs undefined
// ============================================================
function demoNullUndefined() {
  console.log("\n=== null vs undefined ===");

  // null: 表示“空值”（开发者显式设置）
  const empty: null = null;

  // undefined: 表示“未定义”（未初始化或缺失）
  const missing: undefined = undefined;

  // void: 仅用于函数返回值，表示“不关心的返回值”
  function noReturn(): void {
    // return undefined; // ✅ 允许
    // return null;      // ❌ 在 strictNullChecks 下报错
  }

  // typeof null === "object" (历史 bug，ES 保留兼容性)
  console.log("typeof null:", typeof null); // "object"
  console.log("typeof undefined:", typeof undefined); // "undefined"

  // ✅ 最佳实践：使用 undefined 作为可选值/缺失值，null 作为显式空值
  interface User {
    name: string;
    email?: string;      // undefined 表示未设置
    avatar: string | null; // null 表示显式无头像
  }

  const user: User = { name: "Alice", avatar: null };
  console.log("user with null avatar:", user.name, user.avatar);
}

// ============================================================
// 7. 类型层级速查
// ============================================================
function demoTypeHierarchy() {
  console.log("\n=== Type Hierarchy ===");

  // 顶类型: unknown
  const top: unknown = "anything";

  // 中间类型: string, number, boolean, object, etc.
  const mid: string = "middle";

  // never 是底类型
  // never 可由 impossible intersection 产生
  type Impossible = string & number; // ≡ never

  // unknown & string ≡ string
  // never | string ≡ string

  console.log("Type lattice: unknown (⊤) > any/string/number/... > never (⊥)");
}

// ============================================================
// 反例集合 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples (commented out) ===");

  // 反例 1: 把 null 赋值给 object (strictNullChecks)
  // let obj: object = null; // ❌ Type 'null' is not assignable to type 'object'

  // 反例 2: any 导致运行时错误
  function processAny(data: any) {
    // 编译通过，但如果 data 没有 toFixed 则运行时崩溃
    // return data.toFixed(2);
  }
  console.log("processAny({}) would crash at runtime:", processAny({}));

  // 反例 3: void ≠ undefined 语义
  function returnsVoid(): void {
    return undefined; // ✅ 允许
    // return null;   // ❌ strict 下报错
  }
  console.log("void allows undefined return only in strict mode");
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Type Foundations Demo                   ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoUnknown();
  demoAny();
  demoNever();
  demoLiteralTypes();
  demoStrictEffects();
  demoNullUndefined();
  demoTypeHierarchy();
  demoCounterExamples();

  console.log("\n✅ type-foundations demo complete\n");
}

// 如果直接运行此文件
if (require.main === module) {
  demo();
}
