/**
 * symbol-private.ts
 *
 * Demonstrates Symbol uniqueness, Symbol.for(), well-known symbols,
 * Symbol.iterator, and private fields (#private vs TS private vs WeakMap).
 */

export function demo(): void {
  console.log("=== 1. Symbol() Uniqueness ===");

  const sym1 = Symbol("description");
  const sym2 = Symbol("description");

  console.log("  sym1 === sym2:", sym1 === sym2); // false
  console.log("  typeof sym1:", typeof sym1);     // "symbol"

  // ✅ Use as unique object keys
  const id = Symbol("id");
  const user = {
    name: "Alice",
    [id]: 12345, // Symbol-keyed property
  };

  console.log("  user.name:", user.name);
  console.log("  user[id]:", user[id]);

  // Symbol keys are hidden from standard enumeration
  console.log("  Object.keys(user):", Object.keys(user));           // ["name"]
  console.log("  Object.getOwnPropertyNames(user):", Object.getOwnPropertyNames(user)); // ["name"]
  console.log("  Object.getOwnPropertySymbols(user):", Object.getOwnPropertySymbols(user)); // [Symbol(id)]

  console.log("\n=== 2. Symbol.for() — Global Registry ===");

  const sharedA = Symbol.for("app.sharedKey");
  const sharedB = Symbol.for("app.sharedKey");

  console.log("  sharedA === sharedB:", sharedA === sharedB); // true
  console.log("  Symbol.keyFor(sharedA):", Symbol.keyFor(sharedA)); // "app.sharedKey"

  const localSym = Symbol("local");
  console.log("  Symbol.keyFor(localSym):", Symbol.keyFor(localSym)); // undefined (not in registry)

  console.log("\n=== 3. Well-Known Symbols ===");

  // Symbol.toStringTag — customizes Object.prototype.toString.call()
  class MyClass {
    get [Symbol.toStringTag]() {
      return "MyClass";
    }
  }
  console.log("  Object.prototype.toString.call(new MyClass()):", Object.prototype.toString.call(new MyClass())); // [object MyClass]

  // Symbol.hasInstance — customizes instanceof behavior
  class SpecialArray {
    static [Symbol.hasInstance](instance: unknown) {
      return Array.isArray(instance) && (instance as any).special === true;
    }
  }
  const arr = [1, 2, 3] as any;
  arr.special = true;
  console.log("  arr instanceof SpecialArray:", arr instanceof SpecialArray); // true

  console.log("\n=== 4. Symbol.iterator — Custom Iterable ===");

  const range = {
    from: 1,
    to: 5,
    [Symbol.iterator]() {
      let current = this.from;
      return {
        next: () => ({
          value: current++,
          done: current > this.to + 1,
        }),
      };
    },
  };

  console.log("  spread range:", [...range]); // [1, 2, 3, 4, 5]

  // Generator version (cleaner)
  const rangeGen = {
    from: 1,
    to: 5,
    *[Symbol.iterator]() {
      for (let i = this.from; i <= this.to; i++) {
        yield i;
      }
    },
  };
  console.log("  generator range:", [...rangeGen]); // [1, 2, 3, 4, 5]

  console.log("\n=== 5. Symbol as Pseudo-Private (反例: 并非真正私有) ===");

  const _secret = Symbol("secret");

  class SymbolPrivate {
    [_secret]: string;

    constructor(secret: string) {
      this[_secret] = secret;
    }

    getSecret(): string {
      return this[_secret];
    }
  }

  const instance = new SymbolPrivate("my-secret");
  console.log("  getSecret():", instance.getSecret());
  console.log("  Object.keys(instance):", Object.keys(instance)); // [] — hidden from keys

  // ❌ But Reflect.ownKeys can still find it!
  const symbols = Reflect.ownKeys(instance);
  console.log("  Reflect.ownKeys(instance):", symbols);
  console.log("  Access via found symbol:", (instance as any)[symbols[0] as symbol]); // "my-secret"

  console.log("\n=== 6. WeakMap — True Privacy with GC Benefits ===");

  const privateData = new WeakMap<object, { secret: string; counter: number }>();

  class WeakMapPrivate {
    constructor(secret: string) {
      privateData.set(this, { secret, counter: 0 });
    }

    increment(): number {
      const data = privateData.get(this)!;
      return ++data.counter;
    }

    getSecret(): string {
      return privateData.get(this)!.secret;
    }
  }

  const wmInstance = new WeakMapPrivate("weak-secret");
  console.log("  WeakMap secret:", wmInstance.getSecret());
  console.log("  WeakMap increment:", wmInstance.increment());
  console.log("  Reflect.ownKeys(wmInstance):", Reflect.ownKeys(wmInstance)); // [] — truly hidden

  console.log("\n=== 7. TypeScript `private` Keyword (编译时私有) ===");

  class TSPrivate {
    private secret: string;

    constructor(secret: string) {
      this.secret = secret;
    }

    getSecret(): string {
      return this.secret;
    }
  }

  const tsInstance = new TSPrivate("ts-secret");
  console.log("  TS private getSecret():", tsInstance.getSecret());
  console.log("  Reflect.ownKeys(tsInstance):", Reflect.ownKeys(tsInstance));
  // @ts-expect-error: TS compile error, but at runtime:
  console.log("  Runtime access to 'private' field:", tsInstance.secret); // Still accessible!
  console.log("  ⚠️  TS 'private' is compile-time only; erased at runtime");

  console.log("\n=== 8. ES2022 `#private` Fields (真正私有) ===");

  class TrulyPrivate {
    #secret: string;
    #counter = 0;

    constructor(secret: string) {
      this.#secret = secret;
    }

    getSecret(): string {
      return this.#secret;
    }

    increment(): number {
      return ++this.#counter;
    }
  }

  const tpInstance = new TrulyPrivate("truly-private");
  console.log("  #private getSecret():", tpInstance.getSecret());
  console.log("  #private increment:", tpInstance.increment());
  console.log("  Reflect.ownKeys(tpInstance):", Reflect.ownKeys(tpInstance)); // [] — #private is completely hidden

  try {
    // Use eval to bypass compile-time check and trigger runtime error
    eval("console.log(tpInstance.#secret)");
  } catch (e: any) {
    console.log("  ❌ accessing #private outside class:", e.name, "-", e.message);
  }

  console.log("\n=== 9. Symbol Implicit Conversion (反例) ===");

  const sym = Symbol("no-convert");
  try {
    // @ts-expect-error: Symbol cannot be implicitly converted
    console.log(sym + "hello");
  } catch (e: any) {
    console.log("  ❌ Symbol + string:", e.name, "-", e.message);
  }

  try {
    // @ts-expect-error: Symbol cannot be implicitly converted
    console.log(`${sym}`);
  } catch (e: any) {
    console.log("  ❌ template literal with Symbol:", e.name, "-", e.message);
  }

  // ✅ Explicit conversion is fine
  console.log("  sym.toString():", sym.toString());
  console.log("  String(sym):", String(sym));

  console.log("\n=== Summary ===");
  console.log("  • Symbol() creates unique, non-enumerable property keys");
  console.log("  • Symbol.for() shares via global registry; Symbol.keyFor() reverses");
  console.log("  • Well-known symbols override built-in behaviors (iterator, toStringTag, etc.)");
  console.log("  • Symbol privacy is weak: Reflect.ownKeys + access still possible");
  console.log("  • WeakMap provides true privacy + garbage-collection friendly");
  console.log("  • TS 'private' keyword: compile-time only, erased at runtime");
  console.log("  • ES2022 #private: language-level private, truly inaccessible externally");
  console.log("  • Symbols cannot be implicitly converted to strings/numbers");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
