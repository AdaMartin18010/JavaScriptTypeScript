/**
 * 01-object-model-overview.ts
 * Runnable TypeScript examples demonstrating the JavaScript Object Model.
 * Execute with: npx ts-node 01-object-model-overview.ts
 */

console.log("=== Section 1: Objects as Collections of Properties ===");

const obj: Record<string, number> = { a: 1, b: 2 };
console.log("Object keys:", Object.keys(obj)); // ["a", "b"]
console.log("Object values:", Object.values(obj)); // [1, 2]

// Symbol-keyed property
const sym = Symbol("secret");
const symObj: Record<string | symbol, unknown> = { ...obj, [sym]: "hidden" };
console.log("Symbol property accessible:", symObj[sym]); // "hidden"
console.log("Own property symbols:", Object.getOwnPropertySymbols(symObj)); // [Symbol(secret)]


console.log("\n=== Section 2: The Prototype Chain ===");

const parent = { inherited: true };
const child = Object.create(parent);
child.own = "mine";

console.log("child.own:", child.own);       // "mine" (own property)
console.log("child.inherited:", child.inherited); // true (from prototype)
console.log("child.toString:", typeof child.toString); // "function" (from Object.prototype)

console.log("Object.getPrototypeOf(child) === parent:", Object.getPrototypeOf(child) === parent);
console.log("Object.getPrototypeOf(parent) === Object.prototype:", Object.getPrototypeOf(parent) === Object.prototype);
console.log("Object.getPrototypeOf(Object.prototype):", Object.getPrototypeOf(Object.prototype)); // null


console.log("\n=== Section 3: Property Descriptors ===");

const descriptorObj: Record<string, number> = { x: 10 };
const desc = Object.getOwnPropertyDescriptor(descriptorObj, "x")!;
console.log("Descriptor of 'x':", desc);
// { value: 10, writable: true, enumerable: true, configurable: true }

// Non-enumerable property
Object.defineProperty(descriptorObj, "y", {
  value: 20,
  writable: true,
  enumerable: false,
  configurable: true,
});
console.log("Keys after adding hidden 'y':", Object.keys(descriptorObj)); // ["x"]
console.log("'y' is enumerable:", Object.getOwnPropertyDescriptor(descriptorObj, "y")!.enumerable); // false


console.log("\n=== Section 4: Accessor Properties (Getters/Setters) ===");

const accessorObj = {
  _temperature: 20,
  get temperature(): number {
    console.log("  [getter] reading temperature");
    return this._temperature;
  },
  set temperature(value: number) {
    console.log("  [setter] setting temperature to", value);
    this._temperature = value;
  },
};

console.log("Read temperature:", accessorObj.temperature); // invokes getter
accessorObj.temperature = 25;                            // invokes setter
console.log("Read again:", accessorObj.temperature);

// Using defineProperty
const temperatureLog: number[] = [];
Object.defineProperty(accessorObj, "history", {
  get(): number[] {
    return [...temperatureLog];
  },
  set(val: number) {
    temperatureLog.push(val);
  },
  enumerable: true,
  configurable: true,
});
accessorObj.history = 20;
accessorObj.history = 25;
console.log("History (via accessor):", accessorObj.history); // [20, 25]


console.log("\n=== Section 5: defineProperty vs Direct Assignment ===");

const compareObj: Record<string, unknown> = {};

// Direct assignment
declare const globalThis: { directAssigned?: unknown };
compareObj.directAssigned = "hello";
console.log("Descriptor after direct assignment:", Object.getOwnPropertyDescriptor(compareObj, "directAssigned"));
// { value: 'hello', writable: true, enumerable: true, configurable: true }

// Object.defineProperty
Object.defineProperty(compareObj, "definedProperty", {
  value: "world",
});
console.log("Descriptor after defineProperty:", Object.getOwnPropertyDescriptor(compareObj, "definedProperty"));
// { value: 'world', writable: false, enumerable: false, configurable: false }


console.log("\n=== Section 6: Object Integrity Levels ===");

const mutable = { a: 1, nested: { b: 2 } };

// preventExtensions
const nonExtensible = Object.preventExtensions({ ...mutable });
console.log("Is extensible before preventExtensions:", Object.isExtensible(mutable));
console.log("Is extensible after preventExtensions:", Object.isExtensible(nonExtensible));
// @ts-ignore
nonExtensible.c = 3; // silently ignored in non-strict; TypeError in strict
console.log("Keys after attempted extension:", Object.keys(nonExtensible)); // ["a", "nested"]

// seal
const sealed = Object.seal({ ...mutable });
console.log("Is sealed:", Object.isSealed(sealed));
console.log("Is extensible:", Object.isExtensible(sealed));
// @ts-ignore
sealed.a = 99;       // allowed (writable remains)
console.log("'a' after mutation:", sealed.a); // 99
// @ts-ignore
delete sealed.a;     // TypeError in strict; silently fails otherwise
console.log("'a' after delete attempt:", sealed.a); // 99

// freeze
const frozen = Object.freeze({ ...mutable });
console.log("Is frozen:", Object.isFrozen(frozen));
// @ts-ignore
frozen.a = 999;      // TypeError in strict; silently fails otherwise
console.log("'a' after mutation attempt:", frozen.a); // 1

// Shallow limitation demonstration
frozen.nested.b = 999; // Works! freeze is shallow
console.log("nested.b after deep mutation:", frozen.nested.b); // 999

// Deep freeze utility
function deepFreeze<T extends object>(obj: T): T {
  const propNames = Object.getOwnPropertyNames(obj);
  for (const name of propNames) {
    const value = (obj as Record<string, unknown>)[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(obj);
}

const deepFrozen = deepFreeze({ ...mutable });
// @ts-ignore
deepFrozen.nested.b = 888; // TypeError in strict
console.log("nested.b after deep freeze:", deepFrozen.nested.b); // 999 (unchanged from earlier)


console.log("\n=== Section 7: Descriptor Combination Matrix ===");

const matrixObj: Record<string, unknown> = {};
const configs: Array<{ writable?: boolean; enumerable?: boolean; configurable?: boolean; name: string }> = [
  { name: "m_www", writable: true, enumerable: true, configurable: true },
  { name: "m_wwf", writable: true, enumerable: true, configurable: false },
  { name: "m_wfw", writable: true, enumerable: false, configurable: true },
  { name: "m_wff", writable: true, enumerable: false, configurable: false },
  { name: "m_fww", writable: false, enumerable: true, configurable: true },
  { name: "m_fwf", writable: false, enumerable: true, configurable: false },
  { name: "m_ffw", writable: false, enumerable: false, configurable: true },
  { name: "m_fff", writable: false, enumerable: false, configurable: false },
];

for (const cfg of configs) {
  Object.defineProperty(matrixObj, cfg.name, {
    value: 1,
    writable: cfg.writable,
    enumerable: cfg.enumerable,
    configurable: cfg.configurable,
  });
}

console.log("Enumerable keys:", Object.keys(matrixObj));
// Only m_www, m_wwf, m_fww, m_fwf appear

for (const cfg of configs) {
  const d = Object.getOwnPropertyDescriptor(matrixObj, cfg.name)!;
  console.log(
    `${cfg.name}: writable=${d.writable}, enumerable=${d.enumerable}, configurable=${d.configurable}`
  );
}


console.log("\n=== Section 8: Formal Internal Method Demonstration ===");

// Proxy to intercept and log internal method behavior
const target = { value: 42 };
const loggedProxy = new Proxy(target, {
  get(t, prop) {
    console.log(`  [[Get]] called for property "${String(prop)}"`);
    return Reflect.get(t, prop);
  },
  set(t, prop, value) {
    console.log(`  [[Set]] called for property "${String(prop)}" = ${value}`);
    return Reflect.set(t, prop, value);
  },
  getOwnPropertyDescriptor(t, prop) {
    console.log(`  [[GetOwnProperty]] called for "${String(prop)}"`);
    return Reflect.getOwnPropertyDescriptor(t, prop);
  },
});

console.log("Reading loggedProxy.value:", loggedProxy.value);
loggedProxy.value = 100;
console.log("Descriptor query:", Object.getOwnPropertyDescriptor(loggedProxy, "value"));


console.log("\n=== All demonstrations completed successfully ===");
