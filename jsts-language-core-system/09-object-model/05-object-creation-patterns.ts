/**
 * 对象创建模式演示 (Object Creation Patterns)
 *
 * 涵盖: Object Literal、Factory Function、Constructor Function、
 *       Class (ES2015+)、Object.create、Mixin/Composition、
 *       Structural Typing vs Nominal Typing
 */

// ============================================================
// 1. 对象字面量 (Object Literal)
// ============================================================
function demoObjectLiteral() {
  console.log("\n=== Object Literal ===");

  const person = {
    name: "Alice",
    age: 30,
    greet() {
      return `Hello, ${this.name}`;
    },
  };

  console.log("person.greet():", person.greet());

  // 计算属性键
  const key = "dynamicKey";
  const dynamic = {
    [key]: 42,
    [`computed_${key}`]: "value",
  };
  console.log("dynamic:", dynamic);

  // 方法简写 vs 箭头函数（this 绑定差异）
  const obj = {
    value: 10,
    method() {
      return this.value; // this 指向 obj
    },
    arrow: () => {
      return (obj as any).value; // 箭头函数无自身 this，需词法捕获
    },
  };
  console.log("method():", obj.method());
  console.log("arrow():", obj.arrow());
}

// ============================================================
// 2. 工厂函数 (Factory Function)
// ============================================================
function demoFactoryFunction() {
  console.log("\n=== Factory Function ===");

  interface Counter {
    increment(): number;
    decrement(): number;
    readonly value: number;
  }

  function createCounter(initial = 0): Counter {
    let count = initial; // 闭包私有状态

    return {
      increment() {
        return ++count;
      },
      decrement() {
        return --count;
      },
      get value() {
        return count;
      },
    };
  }

  const c1 = createCounter(10);
  console.log("c1.value:", c1.value); // 10
  console.log("c1.increment():", c1.increment()); // 11
  console.log("c1.increment():", c1.increment()); // 12
  console.log("c1.decrement():", c1.decrement()); // 11

  // count 不可从外部访问
  console.log("Object.keys(c1):", Object.keys(c1)); // ["increment", "decrement", "value"]

  // 工厂函数无需 new，避免 this 绑定错误
  const c2 = createCounter();
  console.log("c2.value:", c2.value); // 0
}

// ============================================================
// 3. 构造函数 (Constructor Function)
// ============================================================
function demoConstructorFunction() {
  console.log("\n=== Constructor Function ===");

  function Person(this: any, name: string, age: number) {
    this.name = name;
    this.age = age;
  }
  Person.prototype.greet = function () {
    return `Hi, I'm ${this.name}`;
  };

  const p = new (Person as any)("Bob", 25);
  console.log("p.greet():", p.greet());
  console.log("p instanceof Person:", p instanceof Person);

  // ❌ 遗漏 new 的问题（TS 严格模式下可通过类型检查避免）
  // const q = Person("Charlie", 30); // this 绑定到 global/undefined
}

// ============================================================
// 4. Class (ES2015+)
// ============================================================
function demoClass() {
  console.log("\n=== Class (ES2015+) ===");

  class Animal {
    constructor(public name: string) {}
    speak() {
      return `${this.name} makes a sound`;
    }
  }

  class Dog extends Animal {
    constructor(name: string, public breed: string) {
      super(name);
    }
    speak() {
      return `${this.name} the ${this.breed} barks`;
    }
  }

  const dog = new Dog("Rex", "Husky");
  console.log("dog.speak():", dog.speak());
  console.log("dog instanceof Dog:", dog instanceof Dog);
  console.log("dog instanceof Animal:", dog instanceof Animal);
  console.log("dog instanceof Object:", dog instanceof Object);
}

// ============================================================
// 5. Object.create
// ============================================================
function demoObjectCreate() {
  console.log("\n=== Object.create ===");

  const proto = {
    greet() {
      return `Hello from prototype`;
    },
  };

  const child = Object.create(proto);
  child.name = "Child";
  console.log("child.greet():", child.greet()); // 继承自原型
  console.log("Object.getPrototypeOf(child) === proto:", Object.getPrototypeOf(child) === proto);

  // Object.create(null) — 无原型字典
  const dict = Object.create(null);
  dict["key"] = "value";
  console.log("dict.key:", dict["key"]);
  console.log("'toString' in dict:", "toString" in dict); // false（无原型污染风险）

  // 带属性描述符的创建
  const controlled = Object.create(null, {
    readonly: {
      value: 42,
      writable: false,
      enumerable: true,
      configurable: true,
    },
  });
  console.log("controlled.readonly:", (controlled as any).readonly);
}

// ============================================================
// 6. Mixins 与组合 (Composition over Inheritance)
// ============================================================
function demoMixins() {
  console.log("\n=== Mixins & Composition ===");

  // Mixin 工厂：接收基类，返回增强类
  function Timestamped<TBase extends new (...args: any[]) => object>(Base: TBase) {
    return class extends Base {
      timestamp = Date.now();
      getTimestamp() {
        return this.timestamp;
      }
    };
  }

  function Serializable<TBase extends new (...args: any[]) => object>(Base: TBase) {
    return class extends Base {
      toJSON() {
        const entries = Object.entries(this);
        return JSON.stringify(Object.fromEntries(entries));
      }
    };
  }

  class User {
    constructor(public name: string) {}
  }

  const EnhancedUser = Serializable(Timestamped(User));
  const user = new EnhancedUser("Alice");
  console.log("user.getTimestamp():", user.getTimestamp());
  console.log("user.toJSON():", user.toJSON());

  // Object.assign 组合（浅拷贝）
  const canFly = { fly() { return "flying"; } };
  const canSwim = { swim() { return "swimming"; } };
  const duck = Object.assign({}, canFly, canSwim);
  console.log("duck.fly():", (duck as any).fly());
  console.log("duck.swim():", (duck as any).swim());
}

// ============================================================
// 7. 结构类型 vs 名义类型
// ============================================================
function demoStructuralVsNominal() {
  console.log("\n=== Structural vs Nominal Typing ===");

  // TypeScript 结构类型：只看形状，不看声明位置
  class Dog {
    bark() {
      return "woof";
    }
  }

  class Cat {
    bark() {
      return "meow";
    }
  }

  function triggerBark(animal: Dog) {
    console.log("bark:", animal.bark());
  }

  triggerBark(new Dog()); // ✅
  triggerBark(new Cat()); // ✅ TypeScript 允许！结构兼容

  // 名义类型模拟：Brand Type
  type USD = number & { __brand: "USD" };
  type EUR = number & { __brand: "EUR" };

  const priceUSD = 100 as USD;
  const priceEUR = 100 as EUR;

  function payUSD(amount: USD) {
    console.log("paid USD:", amount);
  }

  payUSD(priceUSD); // ✅
  // payUSD(priceEUR); // ❌ 编译错误：品牌不同

  // 运行时 Brand 检查（结合私有字段）
  class TypedBox {
    #brand = true;
    static isBox(obj: unknown): obj is TypedBox {
      return obj instanceof Object && #brand in obj;
    }
  }

  console.log("TypedBox.isBox(new TypedBox()):", TypedBox.isBox(new TypedBox()));
  console.log("TypedBox.isBox({}):", TypedBox.isBox({}));
}

// ============================================================
// 8. this 绑定陷阱与解决方案
// ============================================================
function demoThisBindingTrap() {
  console.log("\n=== this Binding Trap ===");

  class Button {
    label = "Click me";

    // 方法定义：this 动态绑定
    handleClick() {
      console.log("clicked:", this.label);
    }

    // 箭头函数属性：词法绑定 this
    handleClickArrow = () => {
      console.log("clicked (arrow):", this.label);
    };
  }

  const btn = new Button();

  // ❌ 作为回调传递时丢失 this
  const boundMethod = btn.handleClick;
  try {
    boundMethod(); // this 为 undefined（strict mode）
  } catch (e: any) {
    console.log("unbound method error:", e.name);
  }

  // ✅ 箭头函数保持 this
  const arrowMethod = btn.handleClickArrow;
  arrowMethod(); // "clicked (arrow): Click me"

  // ✅ 手动 bind
  const bound = btn.handleClick.bind(btn);
  bound(); // "clicked: Click me"
}

// ============================================================
// 反例集合 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // 反例 1：Object.assign 浅拷贝导致嵌套对象共享
  const source = { nested: { value: 1 } };
  const copy = Object.assign({}, source);
  copy.nested.value = 999;
  console.log("source.nested.value after shallow copy mutation:", source.nested.value); // 999

  // 反例 2：Mixin 方法名冲突，后者覆盖前者
  const MixinA = (Base: any) =>
    class extends Base {
      greet() {
        return "A";
      }
    };
  const MixinB = (Base: any) =>
    class extends Base {
      greet() {
        return "B";
      }
    };

  class Base {}
  class Mixed extends MixinB(MixinA(Base)) {}
  console.log("new Mixed().greet():", new Mixed().greet()); // "B"

  // 反例 3：class 字段在实例上，不在 prototype 上
  class WithField {
    field = 42;
    method() {
      return this.field;
    }
  }
  console.log("field on instance:", new WithField().hasOwnProperty("field")); // true
  console.log("method on prototype:", WithField.prototype.hasOwnProperty("method")); // true
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Object Creation Patterns Demo           ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoObjectLiteral();
  demoFactoryFunction();
  demoConstructorFunction();
  demoClass();
  demoObjectCreate();
  demoMixins();
  demoStructuralVsNominal();
  demoThisBindingTrap();
  demoCounterExamples();

  console.log("\n✅ object-creation-patterns demo complete\n");
}

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
