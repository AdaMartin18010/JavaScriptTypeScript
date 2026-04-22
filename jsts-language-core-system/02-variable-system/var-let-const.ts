/**
 * var-let-const.ts
 *
 * Demonstrates scope differences, reassignment vs redeclaration,
 * const with mutable objects, and temporal dead zone (TDZ) behavior.
 */

export function demo(): void {
  console.log("=== 1. Scope Differences ===");

  // ✅ var is function-scoped (not block-scoped)
  function varScopeDemo() {
    if (true) {
      var x = 10;
    }
    console.log("  var x accessible outside if-block:", x); // 10
  }
  varScopeDemo();

  // ✅ let/const are block-scoped
  function letScopeDemo() {
    if (true) {
      let y = 20;
      const z = 30;
      console.log("  let y inside block:", y);
      console.log("  const z inside block:", z);
    }
    // y and z are NOT accessible here
    // console.log(y); // ❌ ReferenceError
  }
  letScopeDemo();

  console.log("\n=== 2. Redeclaration vs Reassignment ===");

  // ✅ var allows redeclaration
  var a = 1;
  var a = 2; // No error
  console.log("  var redeclared:", a);

  // ✅ let allows reassignment but NOT redeclaration
  let b = 1;
  b = 2;
  console.log("  let reassigned:", b);
  // let b = 3; // ❌ SyntaxError: Identifier 'b' has already been declared

  // ✅ const allows NEITHER
  const c = 1;
  // c = 2; // ❌ TypeError: Assignment to constant variable
  // const c = 3; // ❌ SyntaxError
  console.log("  const value:", c);

  console.log("\n=== 3. const with Mutable Objects (反例) ===");

  // ⚠️ const only makes the BINDING immutable, not the object itself
  const obj = { value: 1 };
  obj.value = 2; // ✅ This works!
  console.log("  mutated const object property:", obj.value);

  // ❌ Reassigning the variable itself fails
  try {
    // @ts-expect-error: TS catches this, but we simulate runtime
    (obj as any) = { value: 3 };
  } catch (e: any) {
    console.log("  ❌ reassigned const object:", e.message);
  }

  // ✅ Truly immutable: use Object.freeze
  const frozen = Object.freeze({ value: 1 });
  try {
    (frozen as any).value = 2;
  } catch (e: any) {
    // In strict mode, this throws; in sloppy mode, it silently fails
    console.log("  ❌ mutated frozen object (silent or error in strict mode)");
  }
  console.log("  frozen object value:", frozen.value);

  console.log("\n=== 4. Temporal Dead Zone (TDZ) Simulation ===");

  // ✅ var: hoisted and initialized to undefined
  function varTdz() {
    console.log("  var before declaration:", typeof undeclaredVar); // "undefined"
    var undeclaredVar = 42;
  }
  varTdz();

  // ❌ let/const: hoisted but NOT initialized (TDZ)
  function letTdz() {
    // From the start of the block until the `let` statement,
    // `tdzLet` exists but is in the Temporal Dead Zone.
    console.log("  entering TDZ for tdzLet...");
    try {
      // This would be a compile error in TS, but at runtime:
      // console.log(tdzLet); // ❌ ReferenceError
      // We simulate by using eval to bypass TS static analysis:
      eval("console.log(tdzLet)");
    } catch (e: any) {
      console.log("  ❌ TDZ let access:", e.name, "-", e.message);
    }
    let tdzLet = 100;
    console.log("  after declaration:", tdzLet);
  }
  letTdz();

  // ❌ typeof in TDZ also throws (unlike undeclared variables)
  function typeofTdz() {
    try {
      eval("typeof tdzConst");
    } catch (e: any) {
      console.log("  ❌ typeof in TDZ:", e.name, "-", e.message);
    }
    const tdzConst = 200;
  }
  typeofTdz();

  // ❌ self-referencing const initialization
  function selfRefTdz() {
    try {
      eval("const selfRef = selfRef + 1");
    } catch (e: any) {
      console.log("  ❌ self-referencing const:", e.name, "-", e.message);
    }
  }
  selfRefTdz();

  console.log("\n=== 5. Global Object Property Differences ===");

  // var in global scope becomes a property of globalThis
  // (but only when run in global scope; in module scope it does not)
  // let/const do NOT become globalThis properties
  // This is demonstrated conceptually since we're in a module:
  console.log("  var would become globalThis property in script mode");
  console.log("  let/const do NOT become globalThis properties in any mode");

  console.log("\n=== Summary ===");
  console.log("  • var: function-scoped, hoisted to undefined, redeclarable");
  console.log("  • let: block-scoped, hoisted into TDZ, not redeclarable");
  console.log("  • const: block-scoped, hoisted into TDZ, not reassignable");
  console.log("  • const objects can still be mutated; use Object.freeze for immutability");
  console.log("  • TDZ errors are ReferenceErrors, including typeof in TDZ");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
