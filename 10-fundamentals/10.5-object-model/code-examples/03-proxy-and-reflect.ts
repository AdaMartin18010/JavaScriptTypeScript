/**
 * Proxy 与 Reflect 演示 (Proxy and Reflect)
 *
 * 涵盖: 13 个 trap、Invariants、Reflect 默认行为、
 *       Validation / Logging / Membrane 用例、性能对比、私有字段限制
 */

// ============================================================
// 1. 基础 Proxy：get / set / has / deleteProperty
// ============================================================
function demoBasicTraps() {
  console.log("\n=== Basic Traps ===");

  const target: Record<string, any> = { a: 1, b: 2 };
  const logged = new Proxy(target, {
    get(t, prop, receiver) {
      const val = Reflect.get(t, prop, receiver);
      console.log(`  [GET] ${String(prop)} =>`, val);
      return val;
    },
    set(t, prop, value, receiver) {
      console.log(`  [SET] ${String(prop)} <=`, value);
      return Reflect.set(t, prop, value, receiver);
    },
    has(t, prop) {
      console.log(`  [HAS] ${String(prop)}`);
      return Reflect.has(t, prop);
    },
    deleteProperty(t, prop) {
      console.log(`  [DELETE] ${String(prop)}`);
      return Reflect.deleteProperty(t, prop);
    },
  });

  console.log("logged.a:", logged.a);
  logged.c = 3;
  console.log("'a' in logged:", "a" in logged);
  delete logged.b;
  console.log("target after ops:", target);
}

// ============================================================
// 2. Validation Proxy：属性类型校验
// ============================================================
function demoValidationProxy() {
  console.log("\n=== Validation Proxy ===");

  interface UserShape {
    name: string;
    age: number;
    email?: string;
  }

  const user = new Proxy<UserShape>({ name: "Alice", age: 30 } as UserShape, {
    set(t, prop, value) {
      if (prop === "age") {
        if (typeof value !== "number" || value < 0 || value > 150) {
          throw new TypeError(`Invalid age: ${value}`);
        }
      }
      if (prop === "name" && typeof value !== "string") {
        throw new TypeError(`name must be string`);
      }
      return Reflect.set(t, prop, value);
    },
  });

  user.age = 35; // ✅
  console.log("user.age:", user.age);

  try {
    user.age = -5;
  } catch (e: any) {
    console.log("validation caught:", e.message);
  }

  try {
    (user as any).age = "old";
  } catch (e: any) {
    console.log("validation caught:", e.message);
  }
}

// ============================================================
// 3. Invariants：不可违反的约束
// ============================================================
function demoInvariants() {
  console.log("\n=== Proxy Invariants ===");

  const frozen = Object.freeze({ x: 1 });

  // ❌ 违反 invariant：向 non-configurable, non-writable 属性返回不同的值
  const badGet = new Proxy(frozen, {
    get(t, prop) {
      if (prop === "x") return 999; // 违反 invariant
      return Reflect.get(t, prop);
    },
  });

  try {
    console.log(badGet.x);
  } catch (e: any) {
    console.log("get invariant violation:", e.name, e.message);
  }

  // ❌ 违反 invariant：删除 non-configurable 属性并返回 true
  const badDelete = new Proxy(frozen, {
    deleteProperty(t, prop) {
      if (prop === "x") return true; // 违反 invariant
      return Reflect.deleteProperty(t, prop);
    },
  });

  try {
    delete (badDelete as any).x;
  } catch (e: any) {
    console.log("delete invariant violation:", e.name, e.message);
  }

  // ❌ 违反 invariant：修改不可扩展对象的原型
  const nonExt = Object.preventExtensions({});
  const badProto = new Proxy(nonExt, {
    setPrototypeOf(t, proto) {
      return true; // 声称成功，但 target 仍不可扩展且原型未变
    },
  });

  try {
    Object.setPrototypeOf(badProto, {});
  } catch (e: any) {
    console.log("setPrototypeOf invariant violation:", e.name, e.message);
  }
}

// ============================================================
// 4. Reflect API：默认行为与正确 receiver 传递
// ============================================================
function demoReflect() {
  console.log("\n=== Reflect API ===");

  const obj = { x: 1, y: 2 };

  // Reflect.get 与直接点号访问语义一致，但可传递 receiver
  console.log("Reflect.get(obj, 'x'):", Reflect.get(obj, "x"));

  // Reflect.set 返回布尔值表示是否成功
  const success = Reflect.set(obj, "z", 3);
  console.log("Reflect.set success:", success, "obj.z:", (obj as any).z);

  // Reflect.defineProperty 返回布尔值（不会抛 TypeError）
  const defined = Reflect.defineProperty(obj, "readonly", {
    value: 100,
    writable: false,
    configurable: true,
  });
  console.log("Reflect.defineProperty success:", defined);
  console.log("obj.readonly:", (obj as any).readonly);

  // Reflect.has 等价于 in 运算符
  console.log("Reflect.has(obj, 'x'):", Reflect.has(obj, "x"));
  console.log("Reflect.has(obj, 'toString'):", Reflect.has(obj, "toString")); // 遍历原型链

  // Reflect.ownKeys 包含字符串键和 Symbol 键
  const sym = Symbol("sym");
  (obj as any)[sym] = "symbol value";
  console.log("Reflect.ownKeys(obj):", Reflect.ownKeys(obj));
}

// ============================================================
// 5. 函数代理：apply 与 construct
// ============================================================
function demoFunctionProxy() {
  console.log("\n=== Function Proxy (apply / construct) ===");

  function sum(a: number, b: number) {
    return a + b;
  }

  const tracedSum = new Proxy(sum, {
    apply(target, thisArg, args) {
      console.log(`  [APPLY] called with args:`, args);
      return Reflect.apply(target, thisArg, args);
    },
    construct(target, args) {
      // sum 不可构造，此 trap 仅在 target 为 constructor 时有效
      console.log(`  [CONSTRUCT] called with args:`, args);
      return Reflect.construct(target as any, args);
    },
  });

  console.log("tracedSum(2, 3):", tracedSum(2, 3));

  // construct trap 示例
  class Point {
    constructor(public x: number, public y: number) {}
  }

  const TracedPoint = new Proxy(Point, {
    construct(target, args) {
      console.log(`  [CONSTRUCT] Point created with`, args);
      return Reflect.construct(target, args);
    },
  });

  const p = new TracedPoint(10, 20);
  console.log("point:", p.x, p.y);
}

// ============================================================
// 6. Membrane 模式简化实现
// ============================================================
function demoMembrane() {
  console.log("\n=== Membrane Pattern ===");

  function createMembrane<T extends object>(wetTarget: T): { proxy: T; revoke: () => void } {
    const revoked = { value: false };

    const handler: ProxyHandler<T> = {
      get(t, prop, receiver) {
        if (revoked.value) throw new Error("Revoked");
        const value = Reflect.get(t, prop, receiver);
        if (value && typeof value === "object") {
          return createMembrane(value).proxy;
        }
        return value;
      },
      set(t, prop, value, receiver) {
        if (revoked.value) throw new Error("Revoked");
        return Reflect.set(t, prop, value, receiver);
      },
      apply(t, thisArg, args) {
        if (revoked.value) throw new Error("Revoked");
        return Reflect.apply(t as any, thisArg, args);
      },
    };

    return {
      proxy: new Proxy(wetTarget, handler),
      revoke: () => {
        revoked.value = true;
      },
    };
  }

  const wet = { secret: "password", nested: { key: "value" } };
  const { proxy: dry, revoke } = createMembrane(wet);

  console.log("dry.secret:", dry.secret);
  console.log("dry.nested.key:", (dry as any).nested.key);

  revoke();

  try {
    console.log(dry.secret);
  } catch (e: any) {
    console.log("after revoke:", e.message);
  }
}

// ============================================================
// 7. 私有字段与 Proxy 限制
// ============================================================
function demoPrivateFieldLimitation() {
  console.log("\n=== Private Fields + Proxy Limitation ===");

  class Vault {
    #secret = 42;

    getSecret() {
      return this.#secret;
    }

    setSecret(v: number) {
      this.#secret = v;
    }
  }

  const vault = new Vault();
  const proxied = new Proxy(vault, {
    get(t, prop, receiver) {
      console.log(`  trapped get: ${String(prop)}`);
      return Reflect.get(t, prop, receiver);
    },
    set(t, prop, value, receiver) {
      console.log(`  trapped set: ${String(prop)}`);
      return Reflect.set(t, prop, value, receiver);
    },
  });

  // 公有方法调用经过 trap
  console.log("proxied.getSecret():", proxied.getSecret());

  // 但 #secret 的读取/写入不经过任何 trap
  proxied.setSecret(100);
  console.log("after setSecret(100):", proxied.getSecret());

  // #privateField 属于 lexical scope，不在 Proxy 的控制范围内
}

// ============================================================
// 8. 性能对比：Proxy vs 原生对象
// ============================================================
function demoPerformance() {
  console.log("\n=== Performance Comparison ===");

  const native = { value: 42 };
  const proxied = new Proxy({ value: 42 }, {
    get(t, prop, receiver) {
      return Reflect.get(t, prop, receiver);
    },
  });

  const iterations = 1_000_000;

  const t1 = performance.now();
  for (let i = 0; i < iterations; i++) {
    native.value;
  }
  const nativeTime = performance.now() - t1;

  const t2 = performance.now();
  for (let i = 0; i < iterations; i++) {
    proxied.value;
  }
  const proxyTime = performance.now() - t2;

  console.log(`native x${iterations}: ${nativeTime.toFixed(2)}ms`);
  console.log(`proxy  x${iterations}: ${proxyTime.toFixed(2)}ms`);
  console.log(`slowdown factor: ${(proxyTime / nativeTime).toFixed(1)}x`);
}

// ============================================================
// 反例集合 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // 反例 1：在 trap 中直接操作 target 导致递归
  const recursiveTrap = new Proxy({} as Record<string, any>, {
    set(t, prop, value) {
      // ❌ 错误：直接赋值 target 不会触发 trap，但若在此处读取 proxy 自身则递归
      t[prop] = value; // 不会递归，但丢失 receiver
      return true;
    },
  });
  recursiveTrap.x = 1;
  console.log("recursiveTrap.x:", recursiveTrap.x);

  // 反例 2：this 绑定陷阱
  const calculator = {
    base: 10,
    add(x: number) {
      return this.base + x;
    },
  };
  const rawProxy = new Proxy(calculator, {
    get(t, prop, receiver) {
      // ❌ 未绑定 receiver，add 内部的 this 可能指向 target 而非 proxy
      return Reflect.get(t, prop, receiver);
    },
  });
  // 若 proxy 被用于修改 base，需确保 add 看到最新的 proxy.base
  console.log("rawProxy.add(5):", (rawProxy as any).add(5));

  // 反例 3：Proxy 的 target 不能是 null
  try {
    new Proxy(null as any, {});
  } catch (e: any) {
    console.log("null target:", e.name, e.message);
  }
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Proxy and Reflect Demo                  ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoBasicTraps();
  demoValidationProxy();
  demoInvariants();
  demoReflect();
  demoFunctionProxy();
  demoMembrane();
  demoPrivateFieldLimitation();
  demoPerformance();
  demoCounterExamples();

  console.log("\n✅ proxy-and-reflect demo complete\n");
}

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
