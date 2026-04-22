/**
 * destructuring.ts
 *
 * Demonstrates array destructuring, object destructuring, nested destructuring,
 * default values, rest elements, parameter destructuring, and renaming.
 */

export function demo(): void {
  console.log("=== 1. Array Destructuring ===");

  const nums = [10, 20, 30];
  const [a, b, c] = nums;
  console.log("  [a, b, c] = [10, 20, 30]:", a, b, c); // 10 20 30

  // Skip elements
  const [, second, , fourth] = [1, 2, 3, 4];
  console.log("  [, second, , fourth]:", second, fourth); // 2 4

  // Destructuring strings (iterables)
  const [firstChar, secondChar] = "hi";
  console.log("  string destructured:", firstChar, secondChar); // h i

  console.log("\n=== 2. Object Destructuring ===");

  const person = { name: "Alice", age: 30, city: "Beijing" };
  const { name, age } = person;
  console.log("  { name, age }:", name, age); // Alice 30

  // Renaming
  const { name: userName, age: userAge } = person;
  console.log("  { name: userName, age: userAge }:", userName, userAge);

  // Nested objects
  const nestedObj = {
    user: {
      profile: {
        email: "alice@example.com",
      },
    },
  };
  const {
    user: {
      profile: { email },
    },
  } = nestedObj;
  console.log("  nested email:", email);

  console.log("\n=== 3. Default Values ===");

  // ✅ Default values only apply when property is `undefined`
  const { x = 1, y = 2 } = { x: undefined } as any;
  console.log("  { x=1, y=2 } from { x: undefined }:", x, y); // 1 2

  // ❌ null does NOT trigger default!
  const { z = 10 } = { z: null } as any;
  console.log("  { z=10 } from { z: null }:", z); // null (NOT 10!)

  // Array defaults
  const [p = 100, q = 200] = [undefined, 2];
  console.log("  [p=100, q=200] from [undefined, 2]:", p, q); // 100 2

  console.log("\n=== 4. Rest Elements ===");

  // Array rest
  const [head, ...tail] = [1, 2, 3, 4];
  console.log("  head:", head, "tail:", tail); // 1 [2, 3, 4]

  // Object rest
  const { a: first, ...rest } = { a: 1, b: 2, c: 3 };
  console.log("  first:", first, "rest:", rest); // 1 { b: 2, c: 3 }

  // ⚠️ Object rest only collects enumerable own properties
  const hidden = Object.create(null);
  hidden.visible = "yes";
  Object.defineProperty(hidden, "invisible", {
    value: "no",
    enumerable: false,
  });
  const { visible, ...remaining } = hidden;
  console.log("  visible:", visible, "remaining:", remaining); // invisible is excluded

  console.log("\n=== 5. Parameter Destructuring ===");

  // Function parameter with destructuring + defaults
  function createUser({
    name = "Anonymous",
    age = 0,
    role = "user",
  }: { name?: string; age?: number; role?: string } = {}) {
    return { name, age, role };
  }

  console.log("  createUser():", createUser());
  console.log("  createUser({ name: 'Bob' }):", createUser({ name: "Bob" }));
  console.log(
    "  createUser({ name: 'Bob', age: 25 }):",
    createUser({ name: "Bob", age: 25 })
  );

  // Nested parameter destructuring
  function processConfig({
    server: { host = "localhost", port = 3000 } = {},
  }: { server?: { host?: string; port?: number } } = {}) {
    return `${host}:${port}`;
  }

  console.log("  processConfig():", processConfig()); // localhost:3000
  console.log(
    "  processConfig({ server: { port: 8080 } }):",
    processConfig({ server: { port: 8080 } })
  );

  console.log("\n=== 6. Swapping Variables ===");

  let left = "L";
  let right = "R";
  [left, right] = [right, left];
  console.log("  swapped:", left, right); // R L

  console.log("\n=== 7. Destructuring undefined/null (反例) ===");

  // ❌ Destructuring null or undefined throws TypeError
  try {
    const { bad } = null as any;
    console.log(bad);
  } catch (e: any) {
    console.log("  ❌ destructuring null:", e.name, "-", e.message);
  }

  try {
    const [badArr] = undefined as any;
    console.log(badArr);
  } catch (e: any) {
    console.log("  ❌ destructuring undefined:", e.name, "-", e.message);
  }

  // ✅ Always provide a fallback when source might be null/undefined
  const safeSource = null;
  const { safe = "default" } = safeSource ?? {};
  console.log("  safe destructuring with fallback:", safe);

  console.log("\n=== 8. Nested Destructuring with Missing Intermediate (反例) ===");

  const shallow = {};
  try {
    const {
      deep: { value },
    } = shallow as any;
    console.log(value);
  } catch (e: any) {
    console.log("  ❌ nested destructuring missing path:", e.name, "-", e.message);
  }

  // ✅ Fix: provide default for the intermediate object
  const {
    deep: { value: fixedValue = "fallback" } = {},
  } = shallow as any;
  console.log("  nested with default fallback:", fixedValue);

  console.log("\n=== 9. Rest Placement (反例) ===");

  // ❌ Rest element must be the LAST element
  // This is a SyntaxError at parse time:
  // const [...middle, last] = [1, 2, 3];
  console.log("  Rest element (...rest) must be the last in the pattern");

  console.log("\n=== 10. Shallow Copy Trap (反例) ===");

  const original = { nested: { value: 1 } };
  const { nested } = original;
  nested.value = 2;
  console.log("  original.nested.value after mutation:", original.nested.value); // 2
  console.log("  ⚠️  Destructuring objects gives you REFERENCES, not deep copies");

  console.log("\n=== Summary ===");
  console.log("  • Array: [a, b] = arr; skip with commas; rest with ...tail");
  console.log("  • Object: { a, b } = obj; rename with { a: newName }");
  console.log("  • Defaults: { a = 1 } only trigger on undefined, NOT null");
  console.log("  • Nested: { a: { b } } = obj; use ={} defaults for safety");
  console.log("  • Rest: must be last; object rest skips non-enumerable props");
  console.log("  • Parameter destructuring: combine with ={} for optional args");
  console.log("  • Always guard against null/undefined with ?? {}");
  console.log("  • Destructured objects are shallow copies — nested refs shared");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
