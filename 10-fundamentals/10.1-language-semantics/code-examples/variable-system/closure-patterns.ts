/**
 * closure-patterns.ts
 *
 * Demonstrates closure capture by reference, loop closure problem,
 * module pattern, IIFE closures, and memory leak risks.
 */

export function demo(): void {
  console.log("=== 1. Closure Capture by Reference (Not by Value) ===");

  function createIncrementor() {
    let count = 0;

    return {
      increment: () => ++count,
      decrement: () => --count,
      getCount: () => count,
    };
  }

  const counter = createIncrementor();
  console.log("  initial count:", counter.getCount()); // 0
  console.log("  increment:", counter.increment());     // 1
  console.log("  increment:", counter.increment());     // 2
  console.log("  decrement:", counter.decrement());     // 1

  // Each call to createIncrementor creates a NEW lexical environment
  const counter2 = createIncrementor();
  console.log("  counter2 initial:", counter2.getCount()); // 0 (independent)

  console.log("\n=== 2. Loop Closure Problem — var (经典反例) ===");

  function createHandlersWithVar() {
    const handlers: (() => number)[] = [];
    for (var i = 0; i < 3; i++) {
      handlers.push(() => i); // All closures capture the SAME `i`
    }
    return handlers;
  }

  const varHandlers = createHandlersWithVar();
  console.log("  var loop closures:", varHandlers.map((h) => h())); // [3, 3, 3]

  // Why? Because `var i` is function-scoped. By the time any handler
  // executes, the loop has finished and i === 3.

  console.log("\n=== 3. Loop Closure Fix — let ===");

  function createHandlersWithLet() {
    const handlers: (() => number)[] = [];
    for (let i = 0; i < 3; i++) {
      handlers.push(() => i); // Each iteration gets a NEW `i` binding
    }
    return handlers;
  }

  const letHandlers = createHandlersWithLet();
  console.log("  let loop closures:", letHandlers.map((h) => h())); // [0, 1, 2]

  console.log("\n=== 4. Loop Closure Fix — IIFE (ES5 workaround) ===");

  function createHandlersWithIIFE() {
    const handlers: (() => number)[] = [];
    for (var i = 0; i < 3; i++) {
      (function (capturedI) {
        handlers.push(() => capturedI);
      })(i);
    }
    return handlers;
  }

  const iifeHandlers = createHandlersWithIIFE();
  console.log("  IIFE loop closures:", iifeHandlers.map((h) => h())); // [0, 1, 2]

  console.log("\n=== 5. Module Pattern (IIFE Closure) ===");

  const CounterModule = (function () {
    let count = 0; // private via closure

    return {
      increment() {
        return ++count;
      },
      decrement() {
        return --count;
      },
      getCount() {
        return count;
      },
    };
  })();

  console.log("  module increment:", CounterModule.increment()); // 1
  console.log("  module increment:", CounterModule.increment()); // 2
  console.log("  module count:", CounterModule.getCount());      // 2
  // count is NOT accessible from outside: true encapsulation

  console.log("\n=== 6. Closure Memory Leak Risk (反例) ===");

  function potentialLeakDemo() {
    // Simulating a large object that the closure does NOT reference
    const hugeData = new Array(1000).fill("x").join("");
    const unrelated = "small string";

    const handler = () => {
      // This closure only references `unrelated`, not `hugeData`
      return unrelated.toUpperCase();
    };

    // Modern engines (V8, etc.) can optimize and NOT retain hugeData
    // because escape analysis shows it's unreferenced.
    // However, if you DO reference hugeData, it stays alive:
    const badHandler = () => {
      return hugeData.length; // ❌ hugeData is retained!
    };

    console.log("  handler result:", handler());
    console.log("  badHandler result:", badHandler());
    console.log("  ⚠️  badHandler keeps hugeData alive even after potentialLeakDemo returns");
  }

  potentialLeakDemo();

  // Demonstrating actual leak pattern: forgetting to remove listeners
  function leakyListenerPattern() {
    const listeners: ((() => void) | null)[] = [];

    for (let i = 0; i < 3; i++) {
      const bigArray = new Array(10000).fill(i);

      const listener = () => {
        console.log("    listener using bigArray[0]:", bigArray[0]);
      };

      listeners.push(listener);
      // ❌ If we never call listeners[i] = null, bigArray is retained
    }

    // "Cleanup"
    listeners.length = 0; // Removing references allows GC
    console.log("  listeners cleared — bigArray can now be garbage collected");
  }

  leakyListenerPattern();

  console.log("\n=== 7. Shared Lexical Environment (反例) ===");

  function createTwoClosures() {
    let shared = 0;

    const increment = () => ++shared;
    const decrement = () => --shared;

    return { increment, decrement };
  }

  const pair = createTwoClosures();
  console.log("  increment:", pair.increment()); // 1
  console.log("  increment:", pair.increment()); // 2
  console.log("  decrement:", pair.decrement()); // 1
  // Both functions share the SAME `shared` variable — sometimes surprising!

  console.log("\n=== 8. Accidental Global Variable (非严格模式反例) ===");

  // In non-strict mode, assigning to an undeclared variable creates
  // a property on the global object. In strict mode (and TypeScript),
  // this throws a ReferenceError.
  try {
    // We use eval to bypass TS compile-time checks and simulate the error
    eval("oopsGlobal = 'I am global'");
  } catch (e: any) {
    console.log("  ❌ accidental global in strict mode:", e.name, "-", e.message);
  }

  console.log("  In non-strict script mode, 'oopsGlobal' would become a global property.");
  console.log("  TypeScript strict mode prevents this at compile time.");

  console.log("\n=== Summary ===");
  console.log("  • Closures capture variable REFERENCES, not snapshots");
  console.log("  • var in loops: all closures share one binding → use let or IIFE");
  console.log("  • Module pattern: IIFE + closures = true privacy before ES modules");
  console.log("  • Memory leaks: closures referencing large objects prevent GC");
  console.log("  • Clean up listeners/callbacks when no longer needed");
  console.log("  • Multiple closures from same scope share the same variables");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
