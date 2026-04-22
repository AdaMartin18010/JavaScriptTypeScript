/**
 * @file 规范类型演示
 * @category ECMAScript Spec Foundation → Specification Types
 * @difficulty hard
 * @tags reference-type, property-descriptor, accessor, data-descriptor, defineProperty
 */

// ============================================================================
// 1. Reference Type 模拟
// ============================================================================

/**
 * ECMAScript 规范中的 Reference 类型包含：
 * - base: 属性所在的对象或环境记录
 * - referencedName: 属性名
 * - strict: 是否严格模式引用
 */
interface Reference {
  base: object | undefined;
  referencedName: string | symbol;
  strict: boolean;
}

function createReference(base: object | undefined, name: string | symbol, strict = false): Reference {
  return { base, referencedName: name, strict };
}

function getValue(ref: Reference | unknown): unknown {
  if (!isReference(ref)) return ref;
  if (ref.base === undefined) {
    throw new ReferenceError(`${String(ref.referencedName)} is not defined`);
  }
  return (ref.base as Record<string | symbol, unknown>)[ref.referencedName];
}

function putValue(ref: Reference, value: unknown): void {
  if (ref.base === undefined) {
    if (ref.strict) {
      throw new ReferenceError(`${String(ref.referencedName)} is not defined`);
    }
    // 非严格模式下会创建全局变量（旧行为）
    (globalThis as Record<string | symbol, unknown>)[ref.referencedName] = value;
    return;
  }
  (ref.base as Record<string | symbol, unknown>)[ref.referencedName] = value;
}

function isReference(value: unknown): value is Reference {
  return (
    value !== null &&
    typeof value === "object" &&
    "base" in value &&
    "referencedName" in value &&
    "strict" in value
  );
}

function demonstrateReferenceType(): void {
  console.log("--- 1. Reference Type 模拟 ---");

  const obj = { foo: "bar" };
  const ref = createReference(obj, "foo");
  console.log("getValue(ref):", getValue(ref));

  putValue(ref, "baz");
  console.log("putValue 后:", obj.foo);

  const undefRef = createReference(undefined, "notExist", true);
  try {
    getValue(undefRef);
  } catch (e) {
    console.log("未定义引用:", (e as Error).message);
  }
}

// ============================================================================
// 2. Property Descriptor 操作
// ============================================================================

interface DataDescriptor<T = unknown> {
  value?: T;
  writable?: boolean;
  enumerable?: boolean;
  configurable?: boolean;
}

interface AccessorDescriptor<T = unknown> {
  get?: () => T;
  set?: (v: T) => void;
  enumerable?: boolean;
  configurable?: boolean;
}

type PropertyDescriptor<T = unknown> = DataDescriptor<T> | AccessorDescriptor<T>;

function isDataDescriptor(desc: PropertyDescriptor): desc is DataDescriptor {
  return "value" in desc || "writable" in desc;
}

function isAccessorDescriptor(desc: PropertyDescriptor): desc is AccessorDescriptor {
  return "get" in desc || "set" in desc;
}

function demonstratePropertyDescriptors(): void {
  console.log("\n--- 2. Property Descriptor 操作 ---");

  const obj: Record<string, unknown> = {};

  // 数据描述符
  Object.defineProperty(obj, "dataProp", {
    value: 42,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  console.log("数据描述符:");
  console.log("  getOwnPropertyDescriptor:", Object.getOwnPropertyDescriptor(obj, "dataProp"));

  // 访问器描述符
  let internalValue = "secret";
  Object.defineProperty(obj, "accessorProp", {
    get() {
      console.log("  getter 被调用");
      return internalValue;
    },
    set(v: unknown) {
      console.log("  setter 被调用:", v);
      internalValue = String(v);
    },
    enumerable: true,
    configurable: true,
  });

  console.log("\n访问器描述符:");
  console.log("  读取:", (obj as { accessorProp: string }).accessorProp);
  (obj as { accessorProp: string }).accessorProp = "new value";

  // 混合描述符（错误）
  console.log("\n注意：数据描述符和访问器描述符不能混用");
  console.log("  不能同时指定 value 和 get/set");
}

// ============================================================================
// 3. 描述符特性对比
// ============================================================================

function demonstrateDescriptorFeatures(): void {
  console.log("\n--- 3. 描述符特性对比 ---");

  const obj: Record<string, unknown> = {};

  // writable
  Object.defineProperty(obj, "readOnly", {
    value: "fixed",
    writable: false,
    enumerable: true,
    configurable: true,
  });

  console.log("readOnly:", (obj as { readOnly: string }).readOnly);
  try {
    "use strict";
    (obj as { readOnly: string }).readOnly = "changed";
  } catch (e) {
    console.log("修改 readOnly:", (e as Error).message);
  }

  // enumerable
  Object.defineProperty(obj, "hidden", {
    value: "secret",
    writable: true,
    enumerable: false,
    configurable: true,
  });

  (obj as { visible: string }).visible = "shown";

  console.log("\n枚举属性:", Object.keys(obj));
  console.log("所有属性:", Object.getOwnPropertyNames(obj));

  // configurable
  Object.defineProperty(obj, "locked", {
    value: "cannot change descriptor",
    writable: true,
    enumerable: true,
    configurable: false,
  });

  try {
    "use strict";
    Object.defineProperty(obj, "locked", { value: "try change" });
    console.log("configurable=false 时可以修改 value（如果 writable=true）");
  } catch (e) {
    console.log("修改 locked:", (e as Error).message);
  }

  try {
    "use strict";
    Object.defineProperty(obj, "locked", { writable: false });
    console.log("可以修改 writable: false（单向）");
  } catch (e) {
    console.log("修改 writable:", (e as Error).message);
  }

  try {
    "use strict";
    Object.defineProperty(obj, "locked", { writable: true });
    console.log("但不能改回 writable: true");
  } catch (e) {
    console.log("改回 writable:", (e as Error).message);
  }
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: 隐式创建全局变量 */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: 隐式全局变量 ---");
  console.log(`
// ❌ 非严格模式下，未声明的赋值会创建全局变量
function bad() {
  x = 10; // 创建全局变量 x！
}

// ✅ 严格模式阻止隐式全局变量
function good() {
  'use strict';
  // x = 10; // ReferenceError
}
  `);
}

/** 反例 2: defineProperty 默认值 */
function counterExample2(): void {
  console.log("--- Counter-example 2: defineProperty 默认值陷阱 ---");

  const obj: Record<string, unknown> = {};

  // 不指定时，writable/enumerable/configurable 默认都是 false
  Object.defineProperty(obj, "strictProp", {
    value: "test",
  });

  console.log("descriptor:", Object.getOwnPropertyDescriptor(obj, "strictProp"));
  console.log("默认值都是 false，属性变得不可写、不可枚举、不可配置！");
}

/** 反例 3: getter 不返回值 */
function counterExample3(): void {
  console.log("\n--- Counter-example 3: getter 不返回值 ---");

  const obj = {
    get broken() {
      // 忘记 return
    },
    get fixed() {
      return "value";
    },
  };

  console.log("obj.broken:", obj.broken); // undefined
  console.log("obj.fixed:", obj.fixed); // "value"
}

/** 反例 4: 冻结对象仍可通过原型修改 */
function counterExample4(): void {
  console.log("\n--- Counter-example 4: freeze 的局限性 ---");

  const proto = { x: 1 };
  const obj = Object.create(proto);
  obj.y = 2;

  Object.freeze(obj);
  console.log("freeze 后 obj.y:", (obj as { y: number }).y);

  // 不能修改自有属性
  try {
    (obj as { y: number }).y = 3;
    console.log("修改 y 成功（非严格模式静默失败）");
  } catch (e) {
    console.log("修改 y 失败:", (e as Error).message);
  }

  // 但可以通过原型修改
  proto.x = 100;
  console.log("通过原型修改后 obj.x:", (obj as { x: number }).x);
}

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Specification Types Demo ===\n");

  demonstrateReferenceType();
  demonstratePropertyDescriptors();
  demonstrateDescriptorFeatures();

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();
  counterExample4();

  console.log("\n=== End of Specification Types Demo ===\n");
}

export {
  createReference,
  getValue,
  putValue,
  isReference,
  isDataDescriptor,
  isAccessorDescriptor,
};
