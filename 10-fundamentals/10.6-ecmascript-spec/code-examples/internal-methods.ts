/**
 * @file 内部方法演示
 * @category ECMAScript Spec Foundation → Internal Methods
 * @difficulty hard
 * @tags [[Get]], [[Set]], [[HasProperty]], [[Delete]], prototype-chain, Proxy
 */

// ============================================================================
// 1. [[Get]] / [[Set]] 模拟
// ============================================================================

function internalGet(target: object, property: string | symbol, receiver?: unknown): unknown {
  // 1. 检查自有属性
  const ownDesc = Object.getOwnPropertyDescriptor(target, property);

  if (ownDesc) {
    if ("get" in ownDesc && ownDesc.get) {
      return ownDesc.get.call(receiver ?? target);
    }
    return ownDesc.value;
  }

  // 2. 沿原型链查找
  const proto = Object.getPrototypeOf(target);
  if (proto === null) return undefined;

  return internalGet(proto, property, receiver ?? target);
}

function internalSet(
  target: object,
  property: string | symbol,
  value: unknown,
  receiver?: unknown
): boolean {
  const ownDesc = Object.getOwnPropertyDescriptor(target, property);

  if (ownDesc) {
    if ("set" in ownDesc && ownDesc.set) {
      ownDesc.set.call(receiver ?? target, value);
      return true;
    }
    if ("writable" in ownDesc && !ownDesc.writable) {
      if (receiver === target) return false;
      // receiver 不同，尝试在 receiver 上创建属性
      Object.defineProperty(receiver ?? target, property, {
        value,
        writable: true,
        enumerable: true,
        configurable: true,
      });
      return true;
    }
    // 数据描述符，可写
    if (receiver === target || receiver === undefined) {
      (target as Record<string | symbol, unknown>)[property] = value;
      return true;
    }
  }

  // 沿原型链查找
  const proto = Object.getPrototypeOf(target);
  if (proto !== null) {
    return internalSet(proto, property, value, receiver ?? target);
  }

  // 原型链到顶，在 receiver 上创建属性
  Object.defineProperty(receiver ?? target, property, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  });
  return true;
}

// ============================================================================
// 2. [[HasProperty]] 模拟
// ============================================================================

function internalHasProperty(target: object, property: string | symbol): boolean {
  // 1. 检查自有属性
  if (Object.prototype.hasOwnProperty.call(target, property)) return true;

  // 2. 沿原型链查找
  const proto = Object.getPrototypeOf(target);
  if (proto === null) return false;

  return internalHasProperty(proto, property);
}

// ============================================================================
// 3. [[Delete]] 模拟
// ============================================================================

function internalDelete(target: object, property: string | symbol): boolean {
  const desc = Object.getOwnPropertyDescriptor(target, property);

  if (!desc) return true; // 属性不存在，视为成功

  if (!desc.configurable) {
    // 非严格模式返回 false，严格模式抛 TypeError
    return false;
  }

  delete (target as Record<string | symbol, unknown>)[property];
  return true;
}

// ============================================================================
// 4. 原型链查找模拟
// ============================================================================

function demonstratePrototypeChain(): void {
  console.log("--- 4. 原型链查找模拟 ---");

  const grandparent = {
    generation: "grandparent",
    greet() {
      return `Hello from ${this.generation}`;
    },
  };

  const parent = Object.create(grandparent);
  parent.generation = "parent";
  parent.sayHi = function (this: { generation: string }): string {
    return `Hi from ${this.generation}`;
  };

  const child = Object.create(parent);
  child.generation = "child";

  console.log("child.greet():", (child as { greet: () => string }).greet());
  console.log("child.sayHi():", (child as { sayHi: () => string }).sayHi());
  console.log("child.toString():", (child as { toString: () => string }).toString());

  // 使用模拟的 internalGet
  console.log("\n模拟 [[Get]]:");
  console.log("  internalGet(child, 'generation'):", internalGet(child, "generation"));
  console.log("  internalGet(child, 'sayHi'):", typeof internalGet(child, "sayHi"));
  console.log("  internalGet(child, 'nonExist'):", internalGet(child, "nonExist"));
}

// ============================================================================
// 5. Proxy Trap 映射到内部方法
// ============================================================================

function demonstrateProxyTraps(): void {
  console.log("\n--- 5. Proxy Trap 映射到内部方法 ---");

  const target: Record<string, unknown> = { foo: "bar" };

  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      console.log(`  [[Get]] trap: ${String(prop)}`);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      console.log(`  [[Set]] trap: ${String(prop)} = ${value}`);
      return Reflect.set(target, prop, value, receiver);
    },
    has(target, prop) {
      console.log(`  [[HasProperty]] trap: ${String(prop)}`);
      return Reflect.has(target, prop);
    },
    deleteProperty(target, prop) {
      console.log(`  [[Delete]] trap: ${String(prop)}`);
      return Reflect.deleteProperty(target, prop);
    },
    getPrototypeOf(target) {
      console.log("  [[GetPrototypeOf]] trap");
      return Reflect.getPrototypeOf(target);
    },
    setPrototypeOf(target, proto) {
      console.log("  [[SetPrototypeOf]] trap");
      return Reflect.setPrototypeOf(target, proto);
    },
    ownKeys(target) {
      console.log("  [[OwnPropertyKeys]] trap");
      return Reflect.ownKeys(target);
    },
  });

  console.log("读取 proxy.foo:", proxy.foo);
  proxy.baz = "qux";
  console.log("'foo' in proxy:", "foo" in proxy);
  delete proxy.baz;
  console.log("Object.keys(proxy):", Object.keys(proxy));
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: Proxy 的 get 陷阱不返回值 */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: Proxy get 陷阱不返回值 ---");

  const target = { value: 42 };
  const badProxy = new Proxy(target, {
    get() {
      // 忘记 return
    },
  });

  console.log("badProxy.value:", (badProxy as { value: unknown }).value); // undefined
}

/** 反例 2: 原型链污染 */
function counterExample2(): void {
  console.log("\n--- Counter-example 2: 原型链污染 ---");

  // ❌ 修改 Object.prototype 影响所有对象
  // (Object.prototype as Record<string, unknown>).polluted = "dangerous";

  const obj = {};
  console.log("'polluted' in obj:", "polluted" in obj); // 如果污染了就是 true

  // ✅ 使用 Object.create(null) 创建无原型对象
  const safeObj = Object.create(null);
  console.log("safeObj has no prototype:", Object.getPrototypeOf(safeObj));
}

/** 反例 3: Proxy 与内部槽 (internal slots) */
function counterExample3(): void {
  console.log("\n--- Counter-example 3: Proxy 与内部槽 ---");

  const date = new Date();
  const proxyDate = new Proxy(date, {});

  try {
    (proxyDate as Date).toISOString();
  } catch (e) {
    console.log("Date Proxy 调用方法失败:", (e as Error).message);
    console.log("原因：Date 使用内部槽 [[DateValue]]，Proxy 无法转发");
  }

  // ✅ 使用 target 绑定
  const safeProxy = new Proxy(date, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  });
  console.log("绑定后 toISOString:", (safeProxy as Date).toISOString());
}

/** 反例 4: for...in 不触发 has/get */
function counterExample4(): void {
  console.log("\n--- Counter-example 4: for...in 的行为 ---");

  const obj = { a: 1, b: 2 };
  const proxy = new Proxy(obj, {
    get(target, prop) {
      console.log(`  get ${String(prop)}`);
      return Reflect.get(target, prop);
    },
    has(target, prop) {
      console.log(`  has ${String(prop)}`);
      return Reflect.has(target, prop);
    },
  });

  console.log("for...in 循环:");
  for (const key in proxy) {
    console.log(`  key: ${key}, value: ${(proxy as Record<string, unknown>)[key]}`);
  }
  console.log("注意：for...in 不触发 get 陷阱来取值");
}

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Internal Methods Demo ===\n");

  // [[Get]] / [[Set]]
  console.log("--- 1. [[Get]] / [[Set]] 模拟 ---");
  const obj: Record<string, unknown> = {};
  internalSet(obj, "x", 10);
  console.log("internalSet(obj, 'x', 10):", internalGet(obj, "x"));

  // [[HasProperty]]
  console.log("\n--- 2. [[HasProperty]] ---");
  console.log("internalHasProperty(obj, 'x'):", internalHasProperty(obj, "x"));
  console.log("internalHasProperty(obj, 'y'):", internalHasProperty(obj, "y"));

  // [[Delete]]
  console.log("\n--- 3. [[Delete]] ---");
  Object.defineProperty(obj, "locked", {
    value: "secret",
    configurable: false,
  });
  console.log("internalDelete(obj, 'locked'):", internalDelete(obj, "locked"));
  console.log("internalDelete(obj, 'x'):", internalDelete(obj, "x"));

  demonstratePrototypeChain();
  demonstrateProxyTraps();

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();
  counterExample4();

  console.log("\n=== End of Internal Methods Demo ===\n");
}

export {
  internalGet,
  internalSet,
  internalHasProperty,
  internalDelete,
};
