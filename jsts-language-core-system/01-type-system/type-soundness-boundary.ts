/**
 * 类型健全性边界演示 (Type Soundness Boundary)
 *
 * 涵盖: as type assertions, any escape hatches, unsound assignments,
 *       satisfies, @ts-expect-error
 */

// ============================================================
// 1. as 类型断言 (Type Assertions)
// ============================================================
function demoTypeAssertions() {
  console.log("\n=== Type Assertions (as) ===");

  const rawValue: unknown = "hello";

  // ✅ 安全断言：已知运行时类型
  const str = rawValue as string;
  console.log("safe assertion:", str.toUpperCase());

  // ✅ 双重断言（通过 unknown 中转）
  const num = rawValue as unknown as number; // 危险但合法
  // num.toFixed(); // 运行时可能崩溃
  console.log("double assertion (unsafe):", num); // 实际上是 "hello"

  // ❌ 反例：错误的断言导致运行时错误
  const fakeElement = {} as HTMLDivElement;
  // fakeElement.appendChild(document.createElement("span")); // 运行时：{} 不是 DOM 节点

  // 尖括号语法（JSX 中不可用）
  const str2 = <string>rawValue;
  console.log("angle-bracket assertion:", str2);
}

// ============================================================
// 2. any —— 终极逃生舱
// ============================================================
function demoAnyEscapeHatch() {
  console.log("\n=== any Escape Hatch ===");

  let danger: any = 42;
  danger = "now a string"; // 允许
  danger = { anything: true }; // 允许

  // 所有操作都允许，但运行时可能崩溃
  console.log("any value:", danger);

  // ❌ 反例：any 的传播性污染
  function process(data: any) {
    return data.nested.deep.value; // 编译通过
  }
  // process(null); // 运行时崩溃

  // any 赋值给任何类型
  let sureString: string = danger; // 允许但危险
  console.log("any → string:", sureString);

  // 从 any 逃逸：使用 unknown 替代
  function safeProcess(data: unknown) {
    if (typeof data === "object" && data !== null && "value" in data) {
      return (data as { value: unknown }).value;
    }
    return undefined;
  }
  console.log("safe process:", safeProcess({ value: 42 }));
}

// ============================================================
// 3. 不健全赋值 (Unsound Assignments)
// ============================================================
function demoUnsoundAssignments() {
  console.log("\n=== Unsound Assignments ===");

  // ❌ 反例 1：数组协变导致的污染
  interface Animal {
    name: string;
  }
  interface Dog extends Animal {
    bark(): void;
  }

  const dogs: Dog[] = [{ name: "Rex", bark: () => console.log("woof") }];
  const animals: Animal[] = dogs; // ✅ 协变允许

  // animals.push({ name: "Cat" }); // 如果执行，dogs 中会有非 Dog
  // dogs[1].bark(); // 运行时错误

  console.log("array covariance allows unsound writes (commented)");

  // ❌ 反例 2：未初始化变量（非 strict 模式下）
  // strictNullChecks: off 时：
  // let maybeString: string;
  // console.log(maybeString); // undefined，但类型是 string

  // ❌ 反例 3：函数参数双变（strictFunctionTypes: off）
  let animalFn: (a: Animal) => void;
  let dogFn: (d: Dog) => void = (d) => d.bark();
  // strictFunctionTypes: false 时：
  // animalFn = dogFn; // 允许但不安全
  // animalFn({ name: "Cat" }); // 运行时：Cat 没有 bark
}

// ============================================================
// 4. satisfies 运算符 (TS 4.9+)
// ============================================================
function demoSatisfies() {
  console.log("\n=== satisfies Operator ===");

  // 问题：注解会丢失字面量类型信息
  const configAnnotated: Record<string, string | number> = {
    host: "localhost",
    port: 3000,
  };
  // configAnnotated.host 是 string | number，不是 "localhost"

  // 问题：推断会丢失约束检查
  const configInferred = {
    host: "localhost",
    port: 3000,
    // extra: true, // 如果不需要 extra，推断不会报错
  };

  // ✅ satisfies：保留推断类型，同时检查约束
  const config = {
    host: "localhost" as const,
    port: 3000 as const,
  } satisfies Record<string, string | number>;

  // config.host 仍然是字面量类型 "localhost"
  const hostLiteral: "localhost" = config.host;
  console.log("satisfies preserves literal:", hostLiteral);

  // 检查失败时会报错
  // const badConfig = { host: "localhost" } satisfies { host: string; port: number }; // Error: port missing

  // 实用：确保对象满足接口，同时保留精确类型
  type Theme = {
    colors: Record<string, string>;
    primary: string;
  };

  const theme = {
    colors: { red: "#f00", green: "#0f0" },
    primary: "red" as const,
  } satisfies Theme;

  // theme.primary 是 "red"，不是 string
  const primaryColor: "red" = theme.primary;
  console.log("satisfies with Theme:", primaryColor);
}

// ============================================================
// 5. @ts-expect-error
// ============================================================
function demoTsExpectError() {
  console.log("\n=== @ts-expect-error ===");

  // @ts-ignore: 下一行使用 any（无错误可 expect，因为 any 可赋值给 string）
  const wrongType: string = 42 as any;

  console.log("any bypasses type check:", wrongType);

  // 实用：测试类型系统行为
  function assertType<T>(_value: T) {}

  // @ts-expect-error: 测试 string 不能赋值给 number
  assertType<number>("hello");

  console.log("@ts-expect-error useful for type-level testing");
}

// ============================================================
// 6. 非空断言 (!)
// ============================================================
function demoNonNullAssertion() {
  console.log("\n=== Non-null Assertion (!) ===");

  // Mock DOM for Node.js runtime demonstration
  function findElement(id: string): HTMLElement | null {
    return id === "exists" ? ({ tagName: "DIV", textContent: "hello" } as HTMLElement) : null;
  }

  // ❌ 危险：假设元素一定存在
  const el = findElement("exists")!; // HTMLElement
  console.log("non-null asserted element:", el?.tagName ?? "null (if not found)");

  // ✅ 安全做法：类型守卫
  const maybeEl = findElement("exists");
  if (maybeEl) {
    console.log("safely narrowed element:", maybeEl.tagName);
  }

  // 可选链替代
  const text = findElement("missing")?.textContent;
  console.log("optional chain result:", text);
}

// ============================================================
// 7. 健全性等级与配置
// ============================================================
function demoSoundnessLevels() {
  console.log("\n=== Soundness Levels ===");

  // TypeScript 有意在以下方面允许不健全：
  // 1. any 类型
  // 2. 类型断言
  // 3. 数组协变
  // 4. 函数参数双变（strictFunctionTypes: off）
  // 5. 非空断言
  // 6. 对象字面量多余属性检查绕过

  // 提升健全性的配置：
  // {
  //   "strict": true,
  //   "noImplicitAny": true,
  //   "strictNullChecks": true,
  //   "strictFunctionTypes": true,
  //   "noUncheckedIndexedAccess": true
  // }

  // noUncheckedIndexedAccess 演示
  const arr = ["a", "b", "c"];
  const item = arr[100]; // 类型: string | undefined (with noUncheckedIndexedAccess)
  // 否则类型仅为 string
  console.log("unchecked index access result:", item); // undefined

  console.log("soundness levels depend on compiler configuration");
}

// ============================================================
// 8. 反例 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // ❌ 反例 1：as 断言完全绕过检查
  const notADog = {} as { name: string; bark(): void };
  // notADog.bark(); // 运行时崩溃

  // ❌ 反例 2：any 的传染性
  let x: any = 1;
  let y: string = x; // 允许
  let z: { a: { b: { c: number } } } = x; // 也允许
  console.log("any infects all types:", y, z);

  // ❌ 反例 3：@ts-expect-error 滥用
  // 如果用 @ts-expect-error 包裹没有错误的代码，会报错
  console.log("@ts-expect-error on valid code causes compile error (see comments)");

  // ❌ 反例 4：satisfies 不能替代显式类型注解用于公共 API
  // 因为 satisfies 不将变量类型限制为接口，只是检查兼容性
  const apiResponse = { data: 42 } satisfies { data: number };
  // apiResponse 的类型是 { data: number }，不是命名接口
  console.log("satisfies doesn't create nominal type:", apiResponse.data);
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Type Soundness Boundary Demo                ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoTypeAssertions();
  demoAnyEscapeHatch();
  demoUnsoundAssignments();
  demoSatisfies();
  demoTsExpectError();
  demoNonNullAssertion();
  demoSoundnessLevels();
  demoCounterExamples();

  console.log("\n✅ type-soundness-boundary demo complete\n");
}

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
