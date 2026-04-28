/**
 * 对象模型总览演示 (Object Model Overview)
 *
 * 涵盖: Property Descriptor、Accessor、defineProperty 默认值陷阱、
 *       Object.preventExtensions / seal / freeze 的行为差异与边缘案例
 */

// ============================================================
// 1. 数据描述符 (Data Descriptor)
// ============================================================
function demoDataDescriptor() {
  console.log("\n=== Data Descriptor ===");

  const obj: Record<string, any> = {};

  // ✅ 正例：显式定义数据描述符
  Object.defineProperty(obj, "id", {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  console.log("obj.id:", obj.id); // 42
  console.log("Object.keys:", Object.keys(obj)); // ["id"]

  // ❌ 陷阱：defineProperty 默认值全部为 false
  Object.defineProperty(obj, "secret", {
    value: "hidden",
  });

  console.log("obj.secret:", obj.secret); // "hidden"
  console.log("Object.keys after secret:", Object.keys(obj)); // ["id"] — secret 不可枚举

  // strict 模式下修改 writable=false 的属性会抛错（此处非 strict，静默失败）
  obj.secret = "leaked";
  console.log("obj.secret after write attempt:", obj.secret); // 仍为 "hidden"
}

// ============================================================
// 2. 访问器描述符 (Accessor Descriptor)
// ============================================================
function demoAccessorDescriptor() {
  console.log("\n=== Accessor Descriptor ===");

  let _temperature = 20;

  const thermostat = {
    get temperature() {
      console.log("[getter] reading temperature");
      return _temperature;
    },
    set temperature(value: number) {
      if (value < -273.15) {
        throw new RangeError("Temperature below absolute zero");
      }
      console.log("[setter] setting temperature to", value);
      _temperature = value;
    },
  };

  // ✅ 正例：通过 getter 读取
  console.log("current temp:", thermostat.temperature);

  // ✅ 正例：通过 setter 写入（带校验）
  thermostat.temperature = 25;

  // ❌ 反例：非法温度
  try {
    thermostat.temperature = -300;
  } catch (e: any) {
    console.log("setter validation caught:", e.message);
  }

  // 描述符检查
  const desc = Object.getOwnPropertyDescriptor(thermostat, "temperature");
  console.log("descriptor:", desc);
}

// ============================================================
// 3. Object.defineProperty 陷阱与受限修改
// ============================================================
function demoDefinePropertyTrap() {
  console.log("\n=== defineProperty Traps ===");

  const obj: Record<string, any> = {};

  // 创建 non-configurable 属性
  Object.defineProperty(obj, "pinned", {
    value: "fixed",
    writable: false,
    configurable: false,
  });

  console.log("pinned:", obj.pinned);

  // ❌ 反例：尝试将 non-configurable 数据属性转为访问器
  try {
    Object.defineProperty(obj, "pinned", {
      get() {
        return "hijacked";
      },
    });
  } catch (e: any) {
    console.log("type conversion blocked:", e.name, e.message);
  }

  // ✅ 正例：writable: true → false 是允许的（单向）
  Object.defineProperty(obj, "downgrade", {
    value: 1,
    writable: true,
    configurable: false,
  });

  Object.defineProperty(obj, "downgrade", {
    writable: false,
  });

  console.log("downgrade writable narrowed to false");

  // ❌ 反例：writable: false → true 不允许
  try {
    Object.defineProperty(obj, "downgrade", { writable: true });
  } catch (e: any) {
    console.log("writable cannot be reverted:", e.name);
  }
}

// ============================================================
// 4. 对象完整性层级：preventExtensions / seal / freeze
// ============================================================
function demoIntegrityLevels() {
  console.log("\n=== Integrity Levels ===");

  // --- preventExtensions ---
  const ext = { a: 1 };
  Object.preventExtensions(ext);
  console.log("isExtensible:", Object.isExtensible(ext)); // false

  // ❌ 不能新增属性
  try {
    (ext as any).b = 2;
  } catch (e: any) {
    console.log("preventExtensions blocks add:", e.name);
  }

  // ✅ 可以修改和删除已有属性
  ext.a = 10;
  delete (ext as any).a;
  console.log("ext after delete:", ext); // {}

  // --- seal ---
  const sealed = { a: 1, b: 2 };
  Object.seal(sealed);
  console.log("isSealed:", Object.isSealed(sealed)); // true

  sealed.a = 100; // ✅ 允许修改值（writable 仍为 true）
  console.log("sealed.a after write:", sealed.a); // 100

  try {
    delete (sealed as any).a;
  } catch (e: any) {
    console.log("seal blocks delete:", e.name);
  }

  try {
    (sealed as any).c = 3;
  } catch (e: any) {
    console.log("seal blocks add:", e.name);
  }

  // --- freeze ---
  const frozen = { a: 1 };
  Object.freeze(frozen);
  console.log("isFrozen:", Object.isFrozen(frozen)); // true

  try {
    frozen.a = 999;
  } catch (e: any) {
    console.log("freeze blocks write:", e.name);
  }
}

// ============================================================
// 5. 边缘案例：freeze 不递归
// ============================================================
function demoShallowFreeze() {
  console.log("\n=== Shallow Freeze Edge Case ===");

  const nested = {
    outer: "immutable",
    inner: { value: 42 },
  };
  Object.freeze(nested);

  // ❌ 外层属性不可改
  try {
    nested.outer = "changed";
  } catch (e: any) {
    console.log("outer frozen:", e.name);
  }

  // ⚠️ 内层对象未被冻结！
  nested.inner.value = 100; // ✅ 成功
  console.log("nested.inner.value after mutation:", nested.inner.value); // 100

  // 递归 freeze 的实现
  function deepFreeze<T extends Record<string, any>>(obj: T): T {
    const propNames = Reflect.ownKeys(obj);
    for (const name of propNames) {
      const value = (obj as any)[name];
      if (value && typeof value === "object") {
        deepFreeze(value);
      }
    }
    return Object.freeze(obj);
  }

  const deep = deepFreeze({ inner: { value: 42 } });
  try {
    deep.inner.value = 100;
  } catch (e: any) {
    console.log("deep freeze blocks nested mutation:", e.name);
  }
}

// ============================================================
// 6. 属性描述符枚举与枚举顺序
// ============================================================
function demoPropertyEnumeration() {
  console.log("\n=== Property Enumeration ===");

  const obj: Record<string, any> = {};
  obj.a = 1;
  obj.c = 3;
  obj.b = 2;

  // 数字键按升序排列，字符串键按创建顺序
  Object.defineProperty(obj, "hidden", { value: "x", enumerable: false });

  console.log("Object.keys:", Object.keys(obj)); // ["a", "c", "b"]（注意数字/字符串排序规则）
  console.log("for...in keys:");
  for (const key in obj) {
    console.log("  ", key);
  }

  console.log("getOwnPropertyNames (includes non-enumerable):", Object.getOwnPropertyNames(obj));
  console.log("propertyIsEnumerable('hidden'):", obj.propertyIsEnumerable("hidden"));
}

// ============================================================
// 反例集合 (Counter-examples)
// ============================================================
function demoCounterExamples() {
  console.log("\n=== Counter-examples ===");

  // 反例 1：试图覆盖 non-configurable 属性
  const o: Record<string, any> = {};
  Object.defineProperty(o, "x", { value: 1, configurable: false });
  try {
    Object.defineProperty(o, "x", { value: 2, writable: true, enumerable: true, configurable: true });
  } catch (e: any) {
    console.log("cannot redefine non-configurable:", e.name);
  }

  // 反例 2：在 non-extensible 对象上定义新属性
  const ne = Object.preventExtensions({});
  try {
    Object.defineProperty(ne, "x", { value: 1 });
  } catch (e: any) {
    console.log("cannot define on non-extensible:", e.name);
  }

  // 反例 3：getter 返回可变引用导致的"不可变"破坏
  const mutableArr = [1, 2, 3];
  const wrapper = {
    get items() {
      return mutableArr;
    },
  };
  wrapper.items.push(4); // 虽然无 setter，但返回的引用可被修改
  console.log("mutableArr mutated via getter:", mutableArr); // [1, 2, 3, 4]
}

// ============================================================
// 导出的 demo 函数
// ============================================================
export function demo() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║      Object Model Overview Demo              ║");
  console.log("╚══════════════════════════════════════════════╝");

  demoDataDescriptor();
  demoAccessorDescriptor();
  demoDefinePropertyTrap();
  demoIntegrityLevels();
  demoShallowFreeze();
  demoPropertyEnumeration();
  demoCounterExamples();

  console.log("\n✅ object-model-overview demo complete\n");
}

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
