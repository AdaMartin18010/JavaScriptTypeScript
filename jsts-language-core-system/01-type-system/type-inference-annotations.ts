/**
 * 类型推断与显式注解演示 (Type Inference & Annotations)
 *
 * 涵盖: contextual typing, widening, best common type,
 *       flow-sensitive inference, annotation vs inference trade-offs
 */

// ============================================================
// 1. 基础推断 vs 显式注解
// ============================================================
function demoBasicInference() {
  console.log("\n=== Basic Inference vs Annotation ===");

  // ✅ 简单值：编译器推断准确
  const count = 0;            // number
  const message = "Hello";    // string
  const isReady = true;       // boolean

  console.log("inferred types:", typeof count, typeof message, typeof isReady);

  // 显式注解：公共 API、复杂类型
  interface Config {
    host: string;
    port: number;
    ssl?: boolean;
  }

  const config: Config = {
    host: "localhost",
    port: 3000,
  };
  console.log("annotated config:", config.host, config.port);
}

// ============================================================
// 2. 上下文类型 (Contextual Typing)
// ============================================================
function demoContextualTyping() {
  console.log("\n=== Contextual Typing ===");

  // 左侧类型决定右侧推断
  const arr: string[] = [];           // [] 推断为 string[]
  arr.push("hello");
  console.log("contextual string[]:", arr);

  // 回调参数从上下文推断
  const nums = [1, 2, 3];
  const strings = nums.map(n => n.toString()); // n 推断为 number
  console.log("contextual map inference:", strings);

  // Promise 的 resolve 参数类型推断
  const p = new Promise<number>((resolve) => {
    resolve(42); // resolve 推断为 (value: number) => void
  });
  p.then(v => console.log("contextual Promise resolve:", v));

  // 事件处理器上下文
  const handleClick: (e: { x: number; y: number }) => void = (event) => {
    // event 从左侧推断为 { x: number; y: number }
    console.log("contextual event:", event.x, event.y);
  };
  handleClick({ x: 10, y: 20 });
}

// ============================================================
// 3. Widening（类型拓宽）
// ============================================================
function demoWidening() {
  console.log("\n=== Widening ===");

  // const 推断为字面量类型（不拓宽）
  const constLiteral = "hello"; // type: "hello"
  // constLiteral = "world"; // ❌ Error

  // let 推断为 widened 类型
  let letWidened = "hello";     // type: string
  letWidened = "world";         // ✅ 允许

  console.log("const literal vs let widened:", constLiteral, letWidened);

  // 对象字面量：属性会被 widened
  const point = { x: 0, y: 0 }; // { x: number; y: number }
  // point.x = "a"; // ❌ Error

  // as const 阻止 widening
  const exactPoint = { x: 0, y: 0 } as const;
  // exactPoint.x = 1; // ❌ Error: readonly property
  console.log("as const creates readonly literal types:", exactPoint);

  // 数组 widening
  const arr = [1, 2, 3]; // number[]
  const tuple = [1, 2, 3] as const; // readonly [1, 2, 3]
  console.log("array vs tuple:", arr, tuple);
}

// ============================================================
// 4. Best Common Type（最佳公共类型）
// ============================================================
function demoBestCommonType() {
  console.log("\n=== Best Common Type ===");

  // 从元素推断数组元素类型
  const mixed = [1, 2, null]; // (number | null)[]
  console.log("best common type of [1,2,null]:", mixed);

  const union = [0, 1, null]; // (number | null)[]
  console.log("best common type of [0,1,null]:", union);

  // 三元运算符的 best common type
  const result = Math.random() > 0.5 ? 42 : "error"; // string | number
  console.log("ternary best common type:", typeof result);

  // ❌ 反例：没有 best common type 时推断为 any (noImplicitAny 下报错)
  // const noCommon = []; // any[] (没有上下文)
  // noCommon.push(1);
  // noCommon.push("a");

  // ✅ 显式注解避免 any[]
  const explicit: (string | number)[] = [];
  explicit.push(1);
  explicit.push("a");
  console.log("explicit union array:", explicit);
}

// ============================================================
// 5. Flow-sensitive Inference（流敏感推断）
// ============================================================
function demoFlowSensitiveInference() {
  console.log("\n=== Flow-sensitive Inference ===");

  let value: string | number = "hello";
  console.log("initial (string | number):", typeof value);

  if (typeof value === "string") {
    // 在此分支中，value 被推断为 string
    console.log("in string branch:", value.toUpperCase());
  }

  // 重新赋值后类型环境更新
  value = 42;
  console.log("after reassignment:", typeof value);
  // value.toUpperCase(); // ❌ Error: value is now number

  // 在条件中推断更精确的类型
  function process(x: string | number | boolean) {
    if (typeof x === "string") {
      console.log("flow narrowed to string:", x.length);
    } else if (typeof x === "number") {
      console.log("flow narrowed to number:", x.toFixed(2));
    } else {
      console.log("flow narrowed to boolean:", x);
    }
  }

  process(3.14159);
}

// ============================================================
// 6. Annotation vs Inference Trade-offs
// ============================================================
function demoTradeOffs() {
  console.log("\n=== Annotation vs Inference Trade-offs ===");

  // ❌ 反例：推断丢失字面量类型信息
  const configLoose = {
    host: "localhost",
    port: 3000,
  };
  // configLoose.host 是 string，不是 "localhost"

  // ✅ 方案 1：as const
  const configConst = {
    host: "localhost",
    port: 3000,
  } as const;
  // configConst.host 是 "localhost"，configConst.port 是 3000
  console.log("as const preserves literals:", configConst.host, configConst.port);

  // ✅ 方案 2：显式注解
  interface ServerConfig {
    host: "localhost" | "0.0.0.0";
    port: number;
  }
  const configAnnotated: ServerConfig = {
    host: "localhost",
    port: 3000,
  };
  console.log("annotation constrains values:", configAnnotated.host);

  // 推断 vs 注解决策矩阵实践
  // - 局部变量：推断
  const local = 42;
  // - 函数参数：注解
  function greet(name: string): string {
    return `Hello, ${name}`;
  }
  // - 返回值（公共 API）：注解
  // - 复杂表达式：注解

  console.log("greet inference/annotation:", greet("TypeScript"));
}

// ============================================================
// 7. 空数组与空对象的推断陷阱
// ============================================================
function demoInferenceTraps() {
  console.log("\n=== Inference Traps ===");

  // ❌ 反例：空数组推断为 any[]（没有上下文）
  // const emptyArr = [];
  // emptyArr.push(1);
  // emptyArr.push("hello");
  // 结果: (string | number)[] —— 可能不是预期行为

  // ✅ 正例：显式注解空数组
  const numberArr: number[] = [];
  numberArr.push(1);
  // numberArr.push("hello"); // ❌ Error
  console.log("annotated empty array:", numberArr);

  // ❌ 反例：无注解的函数参数推断为 any
  // const fn = (x) => x + 1; // 'x' implicitly has type 'any'

  // ✅ 正例：显式注解函数参数
  const fn = (x: number): number => x + 1;
  console.log("annotated fn:", fn(5));

  // 泛型函数的推断
  function identity<T>(x: T): T {
    return x;
  }
  const idNum = identity(42);      // T 推断为 number
  const idStr = identity("hello"); // T 推断为 string
  console.log("generic inference:", idNum, idStr);
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Type Inference & Annotations Demo           ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoBasicInference();
  demoContextualTyping();
  demoWidening();
  demoBestCommonType();
  demoFlowSensitiveInference();
  demoTradeOffs();
  demoInferenceTraps();

  console.log("\n✅ type-inference-annotations demo complete\n");
}

import { fileURLToPath } from 'node:url';
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
