/**
 * scope-chain.ts
 *
 * Demonstrates global scope, function scope, block scope,
 * lexical environment chain visualization, and with-statement legacy.
 */

export function demo(): void {
  console.log("=== 1. Global Scope ===");

  // In a module, top-level declarations are module-scoped,
  // but conceptually they sit just below global scope.
  const globalLike = "module-top-level";
  console.log("  module-top-level variable:", globalLike);

  console.log("\n=== 2. Function Scope ===");

  function outer() {
    const outerVar = "outer";

    function inner() {
      const innerVar = "inner";
      console.log("    inner sees innerVar:", innerVar);
      console.log("    inner sees outerVar:", outerVar);
    }

    inner();
    console.log("  outer sees outerVar:", outerVar);
    // console.log(innerVar); // ❌ ReferenceError
  }

  outer();

  console.log("\n=== 3. Block Scope ===");

  if (true) {
    const blockConst = "inside if-block";
    let blockLet = "also inside if-block";
    var blockVar = "var leaks out"; // function-scoped, leaks!
    console.log("  inside block:", blockConst, blockLet);
  }

  // blockConst and blockLet are NOT accessible here
  console.log("  outside block, var leaked:", blockVar);
  try {
    eval("console.log(blockConst)");
  } catch (e: any) {
    console.log("  ❌ blockConst outside block:", e.name, "-", e.message);
  }

  console.log("\n=== 4. Lexical Environment Chain Visualization ===");

  const level0 = "global-level";

  function level1() {
    const level1Var = "level-1";

    function level2() {
      const level2Var = "level-2";

      function level3() {
        const level3Var = "level-3";

        // Resolution order:
        // 1. level3's local environment
        // 2. level2's environment (OuterEnv)
        // 3. level1's environment (OuterEnv)
        // 4. module/global environment (OuterEnv)
        console.log("    [level3] level3Var:", level3Var);
        console.log("    [level3] level2Var:", level2Var);
        console.log("    [level3] level1Var:", level1Var);
        console.log("    [level3] level0:   ", level0);
      }

      level3();
    }

    level2();
  }

  level1();

  console.log("\n=== 5. Variable Shadowing ===");

  const shadow = "global";

  function shadowOuter() {
    const shadow = "outer";

    function shadowInner() {
      const shadow = "inner";
      console.log("    shadowInner sees:", shadow); // "inner"
    }

    shadowInner();
    console.log("  shadowOuter sees:", shadow); // "outer"
  }

  shadowOuter();
  console.log("  global sees:", shadow); // "global"

  console.log("\n=== 6. catch Block Scope ===");

  const e = "global-e";

  try {
    throw new Error("test error");
  } catch (e) {
    // `e` here is block-scoped to the catch clause
    console.log("  catch e:", (e as Error).message);
  }

  console.log("  outside catch, e is:", e); // "global-e" (not overwritten!)

  console.log("\n=== 7. with Statement Legacy (反例) ===");

  // ⚠️ with is deprecated and forbidden in strict mode.
  // It dynamically injects an object into the scope chain,
  // making static analysis impossible and killing engine optimizations.

  console.log("  'with' is forbidden in strict mode.");
  console.log("  In sloppy mode, this code would work but is strongly discouraged:");
  console.log(`
    const obj = { x: 1, y: 2 };
    with (obj) {
      console.log(x); // 1 — looked up on obj
      x = 10;         // modifies obj.x
    }
  `);
  console.log("  Problems with 'with':");
  console.log("    1. Impossible to know at parse time if 'x' is a variable or property");
  console.log("    2. Engines cannot optimize variable lookups");
  console.log("    3. Unpredictable behavior when properties shadow variables");

  // We cannot demo with() in TypeScript strict mode,
  // but we show the modern replacement:
  const obj = { x: 1, y: 2 };
  console.log("  Modern replacement — direct access:", obj.x, obj.y);

  console.log("\n=== 8. eval Scope Pollution (反例) ===");

  function evalPollutionDemo() {
    const local = "safe";
    eval('var leaked = "I leak into function scope!"');
    console.log("  eval-created var accessible:", (globalThis as any).leaked ?? "in function scope (non-strict)");
  }

  evalPollutionDemo();

  console.log("\n=== Summary ===");
  console.log("  • Scope chain lookup: current → OuterEnv → ... → global");
  console.log("  • var ignores block scope; let/const respect it");
  console.log("  • Shadowing: inner declaration hides outer one");
  console.log("  • catch(e) creates a block-scoped binding for the error");
  console.log("  • 'with' statement: deprecated, optimizer-killer, strict-mode forbidden");
  console.log("  • eval('var x') can leak variables into enclosing function scope");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
