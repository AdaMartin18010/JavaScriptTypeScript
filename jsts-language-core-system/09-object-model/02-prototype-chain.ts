/**
 * 02-prototype-chain.ts
 * Runnable TypeScript examples demonstrating the Prototype Chain.
 * Execute with: npx ts-node 02-prototype-chain.ts
 */

console.log("=== Section 1: __proto__ vs Object.getPrototypeOf() ===");

const plain = { a: 1 };
console.log("Using Object.getPrototypeOf:", Object.getPrototypeOf(plain) === Object.prototype);
console.log("Using __proto__:", (plain as { __proto__: object }).__proto__ === Object.prototype);

// setPrototypeOf mutation
const protoA = { source: "A" };
const protoB = { source: "B" };
const mutableProto = Object.create(protoA);
console.log("Before setPrototypeOf - mutableProto.source:", mutableProto.source); // "A"
Object.setPrototypeOf(mutableProto, protoB);
console.log("After setPrototypeOf - mutableProto.source:", mutableProto.source);  // "B"

// Demonstrating preference for standard API
const modernObj = {};
const p = Object.getPrototypeOf(modernObj);
console.log("Modern API returns Object.prototype:", p === Object.prototype);


console.log("\n=== Section 2: The End of Chain - Object.prototype ===");

const endOfChain = {};
console.log("Object.getPrototypeOf(endOfChain) === Object.prototype:", Object.getPrototypeOf(endOfChain) === Object.prototype);
console.log("Object.getPrototypeOf(Object.prototype):", Object.getPrototypeOf(Object.prototype)); // null

// Null-prototype dictionary (no inherited toString/hasOwnProperty)
const dict: Record<string, string> = Object.create(null);
dict["toString"] = "not a function";
console.log("Null-prototype dict['toString']:", dict["toString"]); // "not a function"
console.log("'toString' in dict:", "toString" in dict);           // true
console.log("dict.hasOwnProperty:", (dict as { hasOwnProperty?: unknown }).hasOwnProperty); // undefined


console.log("\n=== Section 3: Constructor Functions and .prototype ===");

function Person(this: void, name: string): void {
  // Intentionally using explicit pattern to avoid strict TS 'this' errors
  // In real constructors 'this' is implicitly provided by 'new'
}

// Re-declare as constructable
interface PersonConstructor {
  new (name: string): { name: string; greet(): string };
  prototype: { greet(): string };
}

const PersonCtor = function (this: { name: string }, name: string) {
  this.name = name;
} as unknown as PersonConstructor;

PersonCtor.prototype.greet = function (this: { name: string }): string {
  return `Hello, I am ${this.name}`;
};

const alice = new PersonCtor("Alice");
console.log("alice.name:", alice.name);
console.log("alice.greet():", alice.greet());
console.log("Object.getPrototypeOf(alice) === PersonCtor.prototype:", Object.getPrototypeOf(alice) === PersonCtor.prototype);
console.log("PersonCtor.prototype.constructor === PersonCtor:", PersonCtor.prototype.constructor === PersonCtor);


console.log("\n=== Section 4: new Operator Semantics (Step by Step) ===");

function Vehicle(this: { wheels: number; type: string }, wheels: number, type: string) {
  this.wheels = wheels;
  this.type = type;
}

Vehicle.prototype.describe = function (this: { wheels: number; type: string }): string {
  return `A ${this.type} with ${this.wheels} wheels.`;
};

// Custom new simulation to demonstrate semantics
function simulateNew<F extends (...args: any[]) => any>(
  constructor: F,
  ...args: Parameters<F>
): ReturnType<F> {
  // Step 1: Create object with constructor's prototype
  const obj = Object.create(constructor.prototype);
  // Step 2: Call constructor with obj as 'this'
  const result = constructor.apply(obj, args);
  // Step 3: If constructor returns an object, use it; else use obj
  return (result !== null && (typeof result === "object" || typeof result === "function")) ? result : obj;
}

const bike = simulateNew(Vehicle, 2, "bicycle");
console.log("Simulated new - bike.describe():", bike.describe());
console.log("bike instanceof Vehicle:", bike instanceof Vehicle);

// Constructor returning explicit object
function Box(this: { label: string }) {
  // @ts-ignore
  this.label = "ignored";
  return { label: "explicit" };
}
const box = new (Box as any)();
console.log("Constructor returned explicit object - box.label:", box.label); // "explicit"


console.log("\n=== Section 5: instanceof Operator and Symbol.hasInstance ===");

class Animal {
  constructor(public name: string) {}
}

class Dog extends Animal {
  constructor(name: string, public breed: string) {
    super(name);
  }
}

const dog = new Dog("Rex", "German Shepherd");
console.log("dog instanceof Dog:", dog instanceof Dog);
console.log("dog instanceof Animal:", dog instanceof Animal);
console.log("dog instanceof Object:", dog instanceof Object);

// Custom Symbol.hasInstance
interface TaggedObject {
  _tag: string;
}

class TaggedValidator {
  static [Symbol.hasInstance](instance: unknown): boolean {
    return (
      typeof instance === "object" &&
      instance !== null &&
      (instance as TaggedObject)._tag === "validated"
    );
  }
}

const fakeInstance: TaggedObject = { _tag: "validated" };
console.log("fakeInstance instanceof TaggedValidator:", fakeInstance instanceof TaggedValidator); // true

const invalidInstance: TaggedObject = { _tag: "invalid" };
console.log("invalidInstance instanceof TaggedValidator:", invalidInstance instanceof TaggedValidator); // false


console.log("\n=== Section 6: isPrototypeOf() ===");

const grandparent = { generation: 1 };
const parent2 = Object.create(grandparent);
const child2 = Object.create(parent2);

console.log("parent2.isPrototypeOf(child2):", parent2.isPrototypeOf(child2));           // true
console.log("grandparent.isPrototypeOf(child2):", grandparent.isPrototypeOf(child2)); // true
console.log("Object.prototype.isPrototypeOf(child2):", Object.prototype.isPrototypeOf(child2)); // true
console.log("child2.isPrototypeOf(parent2):", child2.isPrototypeOf(parent2));         // false


console.log("\n=== Section 7: Class Syntax as Prototype Sugar ===");

class Shape {
  constructor(public color: string) {}
  describe(): string {
    return `A ${this.color} shape.`;
  }
}

class Rectangle extends Shape {
  constructor(color: string, public width: number, public height: number) {
    super(color);
  }
  area(): number {
    return this.width * this.height;
  }
  describe(): string {
    return `${super.describe()} It is ${this.width}x${this.height}.`;
  }
}

const rect = new Rectangle("blue", 10, 20);
console.log("rect.describe():", rect.describe());
console.log("rect.area():", rect.area());
console.log("rect instanceof Rectangle:", rect instanceof Rectangle);
console.log("rect instanceof Shape:", rect instanceof Shape);
console.log("rect instanceof Object:", rect instanceof Object);

// Inspecting the chain
console.log("\nPrototype chain inspection:");
let current: object | null = rect;
let depth = 0;
while (current !== null) {
  const ctor = (current as { constructor?: { name: string } }).constructor;
  console.log(`  depth ${depth}:`, ctor?.name ?? "(null prototype)");
  current = Object.getPrototypeOf(current);
  depth++;
}


console.log("\n=== Section 8: Static Prototype Chain ===");

class BaseService {
  static serviceName = "Base";
  static logService(): void {
    console.log("Service:", this.serviceName);
  }
}

class UserService extends BaseService {
  static serviceName = "User";
}

console.log("UserService.serviceName:", UserService.serviceName); // "User"
UserService.logService(); // "Service: User"
console.log("UserService inherits logService from BaseService:", UserService.logService === BaseService.logService);

// Static chain inspection
console.log("Static chain:");
let staticCurrent: object | null = UserService;
let staticDepth = 0;
while (staticCurrent !== null) {
  const name = (staticCurrent as { name?: string }).name ?? "(anonymous)";
  console.log(`  static depth ${staticDepth}:`, name);
  staticCurrent = Object.getPrototypeOf(staticCurrent);
  staticDepth++;
}


console.log("\n=== Section 9: Edge Cases ===");

// 9.1 Prototype cycle prevention
const nodeA: { link?: object | null } = {};
const nodeB: { link?: object | null } = {};
Object.setPrototypeOf(nodeA, nodeB);
console.log("Setting nodeB proto to nodeA throws:");
try {
  Object.setPrototypeOf(nodeB, nodeA);
} catch (e) {
  console.log("  Caught expected error:", (e as Error).name); // TypeError
}

// 9.2 Proxy prototype interception
const proxyTarget = {};
const proxy = new Proxy(proxyTarget, {
  getPrototypeOf() {
    return Array.prototype;
  },
});
console.log("proxy instanceof Array (via Proxy trap):", proxy instanceof Array); // true

// 9.3 Function.prototype is a function
console.log("typeof Function.prototype:", typeof Function.prototype); // "function"
console.log("Function.prototype instanceof Object:", Function.prototype instanceof Object); // true


console.log("\n=== Section 10: Practical Pattern - Mixin via Prototype ===");

const Flyable = {
  fly(this: { altitude: number }): string {
    return `Flying at ${this.altitude}m`;
  },
};

interface Bird {
  name: string;
  altitude: number;
}

function Bird(this: Bird, name: string) {
  this.name = name;
  this.altitude = 100;
}

Bird.prototype = Object.create(Flyable);
Bird.prototype.constructor = Bird;
Bird.prototype.chirp = function (this: Bird): string {
  return `${this.name} says tweet!`;
};

const sparrow = new (Bird as any)("Sparrow");
console.log("sparrow.chirp():", sparrow.chirp());
console.log("sparrow.fly():", sparrow.fly());
console.log("Flyable.isPrototypeOf(sparrow):", Flyable.isPrototypeOf(sparrow));


console.log("\n=== All prototype-chain demonstrations completed successfully ===");
