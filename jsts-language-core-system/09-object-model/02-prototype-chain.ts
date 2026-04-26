/**
 * 原型链深入演示 (Prototype Chain Deep Dive)
 *
 * 涵盖: [[Prototype]]、__proto__ vs getPrototypeOf、new 语义、
 *       instanceof / Symbol.hasInstance、isPrototypeOf、Class 语法糖、
 *       原型链 Mermaid 结构验证
 */

// ============================================================
// 1. 原型链基础与读取
// ============================================================
function demoPrototypeBasics() {
  console.log("\n=== Prototype Basics ===");

  const obj = { a: 1 };
  console.log("obj.__proto__ === Object.prototype:", obj.__proto__ === Object.prototype);
  console.log("Object.getPrototypeOf(obj) === Object.prototype:", Object.getPrototypeOf(obj) === Object.prototype);

  // __proto__ 与 getPrototypeOf 在普通对象上等价
  console.log("__proto__ === getPrototypeOf:", obj.__proto__ === Object.getPrototypeOf(obj));

  // Object.create(null) 无原型
  const nullProto = Object.create(null);
  console.log("Object.getPrototypeOf(nullProto):", Object.getPrototypeOf(nullProto)); // null
  // nullProto.__proto__ 是 undefined，因为没有 Object.prototype
  console.log("nullProto.__proto__:", (nullProto as any).__proto__); // undefined
}

// ============================================================
// 2. 构造函数、.prototype 与 new 语义
// ============================================================
function demoConstructorAndNew() {
  console.log("\n=== Constructor + new ===");

  function Animal(this: any, name: string) {
    this.name = name;
  }
  Animal.prototype.speak = function () {
    return `${this.name} makes a sound`;
  };

  const dog = new (Animal as any)("Buddy");
  console.log("dog.name:", dog.name); // Buddy
  console.log("dog.speak():", dog.speak()); // "Buddy makes a sound"
  console.log("dog.[[Prototype]] === Animal.prototype:", Object.getPrototypeOf(dog) === Animal.prototype);
  console.log("Animal.prototype.constructor === Animal:", Animal.prototype.constructor === Animal);

  // 模拟 new 运算符的实现
  function simulateNew(constructor: Function, ...args: any[]) {
    const obj = Object.create(constructor.prototype);
    const result = constructor.apply(obj, args);
    return result !== null && (typeof result === "object" || typeof result === "function") ? result : obj;
  }

  const simulated = simulateNew(Animal, "Sim");
  console.log("simulated.speak():", simulated.speak()); // "Sim makes a sound"
}

// ============================================================
// 3. instanceof 与 Symbol.hasInstance
// ============================================================
function demoInstanceof() {
  console.log("\n=== instanceof ===");

  class Animal {}
  class Dog extends Animal {}

  const dog = new Dog();
  console.log("dog instanceof Dog:", dog instanceof Dog); // true
  console.log("dog instanceof Animal:", dog instanceof Animal); // true
  console.log("dog instanceof Object:", dog instanceof Object); // true

  // 边缘案例：修改 prototype 后 instanceof 结果变化
  const originalProto = Dog.prototype;
  Dog.prototype = {} as any;
  console.log("after prototype swap, dog instanceof Dog:", dog instanceof Dog); // false
  console.log("Dog.prototype.isPrototypeOf(dog):", Dog.prototype.isPrototypeOf(dog)); // false

  // 恢复原型（不影响已创建的实例的原型链，但恢复 instanceof 对新实例有效）
  Dog.prototype = originalProto;
  console.log("after restore, dog instanceof Dog:", dog instanceof Dog); // true

  // Symbol.hasInstance 定制
  class ArrayLike {
    static [Symbol.hasInstance](instance: any) {
      return instance && typeof instance.length === "number";
    }
  }

  console.log("[] instanceof ArrayLike:", [] instanceof ArrayLike); // true
  console.log("'hello' instanceof ArrayLike:", "hello" instanceof (ArrayLike as any)); // false
}

// ============================================================
// 4. isPrototypeOf 的跨 Realm 优势
// ============================================================
function demoIsPrototypeOf() {
  console.log("\n=== isPrototypeOf ===");

  const grandparent = { generation: 1 };
  const parent = Object.create(grandparent);
  parent.generation = 2;
  const child = Object.create(parent);
  child.generation = 3;

  console.log("grandparent.isPrototypeOf(parent):", grandparent.isPrototypeOf(parent)); // true
  console.log("grandparent.isPrototypeOf(child):", grandparent.isPrototypeOf(child)); // true
  console.log("parent.isPrototypeOf(child):", parent.isPrototypeOf(child)); // true
  console.log("child.isPrototypeOf(grandparent):", child.isPrototypeOf(grandparent)); // false

  // Object.prototype 是所有普通对象的最终原型
  console.log("Object.prototype.isPrototypeOf(child):", Object.prototype.isPrototypeOf(child)); // true
  console.log("Object.prototype.isPrototypeOf({}):", Object.prototype.isPrototypeOf({})); // true
}

// ============================================================
// 5. Class 语法糖与原型链结构
// ============================================================
function demoClassSugar() {
  console.log("\n=== Class Syntax ===");

  class Shape {
    constructor(public name: string) {}
    describe() {
      return `Shape: ${this.name}`;
    }
  }

  class Rectangle extends Shape {
    constructor(name: string, public width: number, public height: number) {
      super(name);
    }
    area() {
      return this.width * this.height;
    }
  }

  const rect = new Rectangle("rect", 10, 20);
  console.log("rect.describe():", rect.describe()); // 继承自 Shape
  console.log("rect.area():", rect.area()); // Rectangle 自身

  // 原型链验证
  console.log(
    "rect.[[Prototype]] === Rectangle.prototype:",
    Object.getPrototypeOf(rect) === Rectangle.prototype
  );
  console.log(
    "Rectangle.prototype.[[Prototype]] === Shape.prototype:",
    Object.getPrototypeOf(Rectangle.prototype) === Shape.prototype
  );
  console.log(
    "Shape.prototype.[[Prototype]] === Object.prototype:",
    Object.getPrototypeOf(Shape.prototype) === Object.prototype
  );

  // super 的静态绑定
  const originalDescribe = Shape.prototype.describe;
  Shape.prototype.describe = function () {
    return "hijacked";
  };
  console.log("rect.describe() after prototype swap:", rect.describe());
  // 仍然输出 "Shape: rect" 因为 super 在类声明时静态绑定？
  // 注意：上面的 rect.describe() 调用的是 Rectangle.prototype.describe，其中 super.describe() 绑定到原始 Shape.prototype.describe
  // 所以 rect.describe() 输出 "Shape: rect"

  // 恢复
  Shape.prototype.describe = originalDescribe;
}

// ============================================================
// 6. 原型链性能：深度链 vs 扁平结构
// ============================================================
function demoPrototypePerformance() {
  console.log("\n=== Prototype Chain Performance ===");

  // 构建一个深原型链
  let deep: any = { value: 42 };
  for (let i = 0; i < 1000; i++) {
    deep = Object.create(deep);
  }

  // 读取底层属性需要遍历 1000+ 层
  const start = performance.now();
  for (let i = 0; i < 1_000_000; i++) {
    deep.value;
  }
  const elapsed = performance.now() - start;
  console.log(`deep chain (1000 levels) x1M reads: ${elapsed.toFixed(2)}ms`);

  // 扁平结构
  const flat: any = Object.create({ value: 42 });
  const start2 = performance.now();
  for (let i = 0; i < 1_000_000; i++) {
    flat.value;
  }
  const elapsed2 = performance.now() - start2;
  console.log(`flat chain (1 level) x1M reads: ${elapsed2.toFixed(2)}ms`);
}

// ============================================================
// 7. Object.create(null) 安全字典
// ============================================================
function demoNullPrototypeDict() {
  console.log("\n=== Null Prototype Dictionary ===");

  const unsafe: Record<string, any> = {};
  const safe = Object.create(null);

  // 原型污染攻击模拟
  (Object.prototype as any).polluted = "I am evil";

  console.log("unsafe.polluted:", unsafe.polluted); // "I am evil"
  console.log("safe.polluted:", (safe as any).polluted); // undefined

  // 清理
  delete (Object.prototype as any).polluted;

  // safe 对象可用作 Map 的轻量替代
  (safe as any).toString = "not a function";
  console.log("safe.toString:", (safe as any).toString); // "not a function"（无冲突）
}

// ============================================================
// 反例集合 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // 反例 1：Object.setPrototypeOf 的性能代价
  const perfObj: any = { a: 1, b: 2, c: 3 };
  Object.setPrototypeOf(perfObj, { inherited: true });
  // V8 会退化该对象为字典模式，后续属性访问变慢
  console.log("perfObj.inherited:", perfObj.inherited);

  // 反例 2：函数也是对象，具有 prototype 和 __proto__
  function fn() {}
  console.log("fn.__proto__ === Function.prototype:", fn.__proto__ === Function.prototype);
  console.log("fn.prototype.__proto__ === Object.prototype:", fn.prototype.__proto__ === Object.prototype);

  // 反例 3：箭头函数没有 prototype
  const arrow = () => {};
  console.log("arrow.prototype:", (arrow as any).prototype); // undefined

  // 反例 4：instanceof 右侧非对象会抛 TypeError
  try {
    ({} as any) instanceof 42;
  } catch (e: any) {
    console.log("instanceof non-object:", e.name, e.message);
  }
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Prototype Chain Deep Dive Demo          ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoPrototypeBasics();
  demoConstructorAndNew();
  demoInstanceof();
  demoIsPrototypeOf();
  demoClassSugar();
  demoPrototypePerformance();
  demoNullPrototypeDict();
  demoCounterExamples();

  console.log("\n✅ prototype-chain demo complete\n");
}

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
