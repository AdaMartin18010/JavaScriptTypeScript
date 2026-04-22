/**
 * jsts-language-core-system/02-variable-system/index.ts
 *
 * Central export for all variable-system demonstration modules.
 */

export { demo as demoVarLetConst } from "./var-let-const.js";
export { demo as demoHoisting } from "./hoisting.js";
export { demo as demoScopeChain } from "./scope-chain.js";
export { demo as demoClosurePatterns } from "./closure-patterns.js";
export { demo as demoSymbolPrivate } from "./symbol-private.js";
export { demo as demoDestructuring } from "./destructuring.js";

import { demo as demoVarLetConst } from "./var-let-const.js";
import { demo as demoHoisting } from "./hoisting.js";
import { demo as demoScopeChain } from "./scope-chain.js";
import { demo as demoClosurePatterns } from "./closure-patterns.js";
import { demo as demoSymbolPrivate } from "./symbol-private.js";
import { demo as demoDestructuring } from "./destructuring.js";

/** Run all variable-system demos sequentially. */
export function runAllDemos(): void {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  demoVarLetConst();
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  demoHoisting();
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  demoScopeChain();
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  demoClosurePatterns();
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  demoSymbolPrivate();
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  demoDestructuring();
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("All variable-system demos completed.");
}

// Run all if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  runAllDemos();
}
