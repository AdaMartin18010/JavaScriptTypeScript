// @ts-nocheck

/**
 * @file 抽象操作实现
 * @category ECMAScript Spec Foundation → Abstract Operations
 * @difficulty hard
 * @tags ToPrimitive, ToNumber, ToString, SameValue, Object.is, abstract-equality, coercion
 */

// ============================================================================
// 1. ToPrimitive
// ============================================================================

type PreferredType = "string" | "number";

function toPrimitive(input: unknown, preferredType: PreferredType = "number"): string | number | bigint | boolean | symbol | null | undefined {
  if (input === null || input === undefined || typeof input !== "object") {
    return input as string | number | bigint | boolean | symbol | null | undefined;
  }

  const hint = preferredType === "string" ? "string" : "number";
  const methodNames = hint === "string"
    ? ["toString", "valueOf"]
    : ["valueOf", "toString"];

  for (const name of methodNames) {
    const method = (input as Record<string, unknown>)[name];
    if (typeof method === "function") {
      const result = (method as () => unknown).call(input);
      if (result === null || result === undefined || typeof result !== "object") {
        return result as string | number | bigint | boolean | symbol | null | undefined;
      }
    }
  }

  throw new TypeError("Cannot convert object to primitive");
}

// ============================================================================
// 2. ToNumber
// ============================================================================

function toNumber(input: unknown): number {
  switch (typeof input) {
    case "undefined": return NaN;
    case "boolean": return input ? 1 : 0;
    case "number": return input;
    case "string": {
      const trimmed = (input as string).trim();
      if (trimmed === "") return 0;
      const num = Number(trimmed);
      return num;
    }
    case "bigint":
      throw new TypeError("Cannot convert BigInt to number");
    case "symbol":
      throw new TypeError("Cannot convert Symbol to number");
    case "object":
      if (input === null) return 0;
      return toNumber(toPrimitive(input, "number"));
    default:
      return NaN;
  }
}

// ============================================================================
// 3. ToString
// ============================================================================

function toString(input: unknown): string {
  switch (typeof input) {
    case "undefined": return "undefined";
    case "boolean": return input ? "true" : "false";
    case "number": {
      if (Number.isNaN(input)) return "NaN";
      if (input === 0 && 1 / input === -Infinity) return "0"; // -0
      return String(input);
    }
    case "string": return input;
    case "symbol": throw new TypeError("Cannot convert Symbol to string");
    case "bigint": return `${input}n`;
    case "object":
      if (input === null) return "null";
      return toString(toPrimitive(input, "string"));
    default:
      return String(input);
  }
}

// ============================================================================
// 4. SameValue / SameValueZero / Object.is
// ============================================================================

function sameValue(x: unknown, y: unknown): boolean {
  if (typeof x !== typeof y) return false;

  if (typeof x === "number") {
    if (Number.isNaN(x) && Number.isNaN(y)) return true;
    if (x === 0 && y === 0) {
      return 1 / (x as number) === 1 / (y as number); // +0 vs -0
    }
    return x === y;
  }

  return x === y;
}

function sameValueZero(x: unknown, y: unknown): boolean {
  if (typeof x !== typeof y) return false;

  if (typeof x === "number") {
    if (Number.isNaN(x) && Number.isNaN(y)) return true;
    // SameValueZero 不区分 +0 和 -0
    return x === y;
  }

  return x === y;
}

// ============================================================================
// 5. == 抽象相等算法演示
// ============================================================================

function abstractEquality(x: unknown, y: unknown): boolean {
  // 类型相同
  if (typeof x === typeof y) {
    if (typeof x === "undefined" || typeof x === "null") return true;
    if (typeof x === "number") {
      if (Number.isNaN(x) || Number.isNaN(y as number)) return false;
      if (x === (y as number)) return true;
      return false;
    }
    return x === y;
  }

  // null == undefined
  if ((x === null && y === undefined) || (x === undefined && y === null)) {
    return true;
  }

  // number vs string
  if (typeof x === "number" && typeof y === "string") {
    return abstractEquality(x, toNumber(y));
  }
  if (typeof x === "string" && typeof y === "number") {
    return abstractEquality(toNumber(x), y);
  }

  // boolean vs any
  if (typeof x === "boolean") {
    return abstractEquality(toNumber(x), y);
  }
  if (typeof y === "boolean") {
    return abstractEquality(x, toNumber(y));
  }

  // object vs primitive
  if ((typeof x === "object" && x !== null) && (typeof y !== "object" && y !== null)) {
    return abstractEquality(toPrimitive(x), y);
  }
  if ((typeof y === "object" && y !== null) && (typeof x !== "object" && x !== null)) {
    return abstractEquality(x, toPrimitive(y));
  }

  return false;
}

// ============================================================================
// 6. 经典表达式演示
// ============================================================================

function demonstrateClassicExpressions(): void {
  console.log("--- 经典表达式演示 ---");

  // [] + {}
  console.log(`[] + {} = "${[] + {}}"`); // [object Object]
  // 解释: [].valueOf() -> [] (对象), [].toString() -> ""
  // {}.valueOf() -> {} (对象), {}.toString() -> "[object Object]"
  // "" + "[object Object]" = "[object Object]"

  // {} + []
  console.log(`{} + [] = ${{} + []}`); // 0 (或 "[object Object]")
  // 在语句开头，{} 被解析为代码块，不是对象
  // 所以实际上是 +[] -> +"" -> 0

  // 使用括号强制作为表达式
  console.log(`({} + []) = "${({} + [])}"`);
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: Object.is vs === 的 NaN / +0 / -0 */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: Object.is vs === ---");
  console.log("NaN === NaN:", NaN === NaN, "// false");
  console.log("Object.is(NaN, NaN):", Object.is(NaN, NaN), "// true");

  console.log("+0 === -0:", +0 === -0, "// true");
  console.log("Object.is(+0, -0):", Object.is(+0, -0), "// false");

  console.log("sameValueZero(+0, -0):", sameValueZero(+0, -0), "// true (用于 Map/Set)");
}

/** 反例 2: == 强制转换陷阱 */
function counterExample2(): void {
  console.log("\n--- Counter-example 2: == 强制转换陷阱 ---");

  const traps = [
    ["[] == false", [] as unknown, false],
    ["'' == false", "", false],
    ["'0' == false", "0", false],
    ["0 == '0'", 0, "0"],
    ["null == undefined", null, undefined],
    ["null == false", null, false],
    ["undefined == false", undefined, false],
    ["'1' == true", "1", true],
    ["[1] == true", [1] as unknown, true],
  ] as const;

  for (const [expr, a, b] of traps) {
    const result = abstractEquality(a, b);
    console.log(`${expr}: ${result}`);
  }
}

/** 反例 3: 对象 ToPrimitive 顺序 */
function counterExample3(): void {
  console.log("\n--- Counter-example 3: 自定义 ToPrimitive ---");

  const obj = {
    toString() {
      return "toString";
    },
    valueOf() {
      return "valueOf";
    },
  };

  console.log("obj + '' =", obj + ""); // valueOf (number hint)
  console.log("String(obj) =", String(obj)); // toString (string hint)

  const obj2 = {
    [Symbol.toPrimitive](hint: string): string {
      return `primitive(${hint})`;
    },
    toString() {
      return "toString";
    },
    valueOf() {
      return "valueOf";
    },
  };

  console.log("obj2 + '' =", obj2 + ""); // primitive(default)
  console.log("String(obj2) =", String(obj2)); // primitive(string)
}

/** 反例 4: 隐式类型转换的意外结果 */
function counterExample4(): void {
  console.log("\n--- Counter-example 4: 隐式转换意外 ---");

  console.log("typeof NaN:", typeof NaN); // number
  console.log("NaN == NaN:", NaN == NaN); // false
  console.log("isNaN('hello'):", isNaN("hello" as unknown as number)); // true (先转 number)
  console.log("Number.isNaN('hello'):", Number.isNaN("hello" as unknown as number)); // false

  console.log("[] + []:", JSON.stringify([] + [])); // ""
  console.log("[] + {}:", JSON.stringify([] + {})); // "[object Object]"
  console.log("true + true:", true + true); // 2
  console.log("true + []:", JSON.stringify(true + [])); // "true"
}

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Abstract Operations Demo ===\n");

  // ToPrimitive
  console.log("--- 1. ToPrimitive ---");
  console.log("toPrimitive(42):", toPrimitive(42));
  console.log("toPrimitive('hello'):", toPrimitive("hello"));
  console.log("toPrimitive([1,2,3]):", toPrimitive([1, 2, 3]));
  console.log("toPrimitive({a:1}):", toPrimitive({ a: 1 }));

  // ToNumber
  console.log("\n--- 2. ToNumber ---");
  console.log("toNumber('42'):", toNumber("42"));
  console.log("toNumber(''):", toNumber(""));
  console.log("toNumber('  '):", toNumber("  "));
  console.log("toNumber(null):", toNumber(null));
  console.log("toNumber(undefined):", toNumber(undefined));
  console.log("toNumber(true):", toNumber(true));
  console.log("toNumber('hello'):", toNumber("hello"));

  // ToString
  console.log("\n--- 3. ToString ---");
  console.log("toString(42):", toString(42));
  console.log("toString(null):", toString(null));
  console.log("toString([1,2]):", toString([1, 2]));
  console.log("toString({a:1}):", toString({ a: 1 }));

  // SameValue
  console.log("\n--- 4. SameValue ---");
  console.log("sameValue(NaN, NaN):", sameValue(NaN, NaN));
  console.log("sameValue(+0, -0):", sameValue(+0, -0));
  console.log("sameValueZero(+0, -0):", sameValueZero(+0, -0));

  // == 抽象相等
  console.log("\n--- 5. 抽象相等 == ---");
  console.log("abstractEquality(1, '1'):", abstractEquality(1, "1"));
  console.log("abstractEquality(null, undefined):", abstractEquality(null, undefined));
  console.log("abstractEquality(true, 1):", abstractEquality(true, 1));

  // 经典表达式
  demonstrateClassicExpressions();

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();
  counterExample4();

  console.log("\n=== End of Abstract Operations Demo ===\n");
}

export {
  toPrimitive,
  toNumber,
  toString,
  sameValue,
  sameValueZero,
  abstractEquality,
};
