/**
 * hoisting.ts
 *
 * Demonstrates function hoisting vs var hoisting, TDZ with let/const,
 * class hoisting quirks, and temporal dead zone practical behaviors.
 */

export function demo(): void {
  console.log("=== 1. Function Declaration Hoisting ===");

  // ✅ Function declarations are fully hoisted (body and all)
  console.log("  declaredBefore() result:", declaredBefore()); // Works!

  function declaredBefore(): string {
    return "I am fully hoisted!";
  }

  // ✅ Mutual recursion relies on function hoisting
  console.log("  isEven(4):", isEven(4)); // true
  console.log("  isOdd(3):", isOdd(3));   // true

  function isEven(n: number): boolean {
    return n === 0 || isOdd(n - 1);
  }

  function isOdd(n: number): boolean {
    return n !== 0 && isEven(n - 1);
  }

  console.log("\n=== 2. var Hoisting vs Function Expression (反例) ===");

  // ✅ var is hoisted and initialized to undefined
  // @ts-expect-error: var is hoisted, initialized to undefined at runtime
  console.log("  varBefore declaration:", typeof varBefore); // "undefined"
  var varBefore = 42;
  console.log("  varBefore after assignment:", varBefore);     // 42

  // ❌ Function expressions are NOT hoisted as functions
  try {
    // @ts-expect-error: called before assignment
    expressedEarly();
  } catch (e: any) {
    console.log("  ❌ function expression before assignment:", e.name, "-", e.message);
  }

  var expressedEarly = function () {
    return "expressed";
  };
  console.log("  expressedEarly after assignment:", expressedEarly());

  // ❌ let/const function expressions also not hoisted
  try {
    // @ts-expect-error: called before declaration
    constExpressed();
  } catch (e: any) {
    console.log("  ❌ const function before declaration:", e.name, "-", e.message);
  }

  const constExpressed = () => "const expressed";
  console.log("  constExpressed after declaration:", constExpressed());

  console.log("\n=== 3. var Hoisting Shadowing Trap (经典反例) ===");

  var name = "global";

  function greet() {
    // Most developers expect "global" here, but...
    // @ts-expect-error: var is hoisted inside function scope
    console.log("  name inside greet (before var):", typeof name); // "undefined" (hoisted!)
    var name = "local";
    console.log("  name inside greet (after var):", name);           // "local"
  }

  greet();

  // The above is equivalent to:
  // function greet() {
  //   var name;              // hoisted
  //   console.log(name);     // undefined
  //   name = "local";
  //   console.log(name);     // "local"
  // }

  console.log("\n=== 4. let/const Hoisting into TDZ ===");

  // ❌ let is hoisted but uninitialized — TDZ
  function letHoistingDemo() {
    // TDZ starts here for `hoistedLet`
    try {
      eval("console.log(hoistedLet)");
    } catch (e: any) {
      console.log("  ❌ let in TDZ:", e.name, "-", e.message);
    }
    let hoistedLet = "initialized";
    console.log("  hoistedLet after declaration:", hoistedLet);
  }
  letHoistingDemo();

  // ❌ const same behavior
  function constHoistingDemo() {
    try {
      eval("const x = x + 1"); // right-hand `x` is in TDZ
    } catch (e: any) {
      console.log("  ❌ const self-reference in TDZ:", e.name, "-", e.message);
    }
  }
  constHoistingDemo();

  console.log("\n=== 5. Class Hoisting Quirks ===");

  // ❌ Class declarations are hoisted into TDZ (like let/const)
  function classHoistingDemo() {
    try {
      eval("new MyClass()");
    } catch (e: any) {
      console.log("  ❌ class before declaration:", e.name, "-", e.message);
    }

    class MyClass {
      value = 42;
    }

    console.log("  MyClass instance:", new MyClass().value);
  }
  classHoistingDemo();

  // ✅ Class expressions are NOT hoisted at all
  function classExpressionDemo() {
    try {
      // @ts-expect-error: used before initialization
      console.log(ClassExpr);
    } catch (e: any) {
      console.log("  ❌ class expression before declaration:", e.name, "-", e.message);
    }
    const ClassExpr = class {
      name = "expression";
    };
    console.log("  ClassExpr instance:", new ClassExpr().name);
  }
  classExpressionDemo();

  console.log("\n=== 6. Function Declaration vs var Conflict (边缘案例) ===");

  // In sloppy JS, `var myFn` and `function myFn(){}` in the same scope
  // create unpredictable behavior. TypeScript/esbuild typically rejects this.
  // Conceptually:
  console.log(`
  // In non-strict mode, this pattern is allowed but dangerous:
  function conflictDemo() {
    var myFn = 123;           // var hoisted first
    function myFn() {}        // function declaration also hoisted
    console.log(typeof myFn); // "number" (var assignment wins)
  }
  `);
  console.log("  ⚠️  TypeScript/esbuild rejects var+function name conflicts in the same scope");

  console.log("\n=== Summary ===");
  console.log("  • function declarations: fully hoisted (safe to call before declaration)");
  console.log("  • var: hoisted to undefined (common source of bugs)");
  console.log("  • let/const/class: hoisted into TDZ (access = ReferenceError)");
  console.log("  • function expressions: NOT hoisted (var gets undefined, let/const get TDZ)");
  console.log("  • class declarations: hoisted into TDZ");
  console.log("  • class expressions: NOT hoisted");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
