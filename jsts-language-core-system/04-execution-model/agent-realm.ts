/**
 * @file Agent 与 Realm（领域）
 * @category Execution Model → Agent & Realm
 * @difficulty hard
 * @tags realm, iframe, eval, Function-constructor, Symbol.for, instanceof, cross-realm
 */

// ============================================================================
// 1. Realm 概念说明
// ============================================================================

/**
 * Realm 是一个包含以下内容的独立环境：
 * - 全局对象 (global object)
 * - 全局环境记录 (global environment record)
 * - 一组内置对象 (Array, Object, etc.)
 *
 * 每个 iframe、Worker、vm 模块运行上下文都有自己的 Realm。
 */

// ============================================================================
// 2. eval vs new Function 的 Realm 差异
// ============================================================================

function demonstrateEvalRealm(): void {
  console.log("--- 2. eval vs new Function 的 Realm 差异 ---");

  const localVar = "outer";

  // eval 在调用者的词法环境中执行
  // eslint-disable-next-line no-eval
  const evalResult = eval("localVar + ' - from eval'");
  console.log("eval 可以访问外部变量:", evalResult);

  // new Function 在全局环境中执行
  const fn = new Function("localVar", "return localVar + ' - from Function'");
  const fnResult = fn("passed");
  console.log("new Function 不能访问外部变量，只能访问全局:", fnResult);

  // 反例：试图用 new Function 访问局部变量会失败
  try {
    const badFn = new Function("return localVar");
    console.log("new Function 访问 localVar:", badFn());
  } catch (e) {
    console.log("❌ new Function 无法访问局部变量:", (e as Error).message);
  }
}

// ============================================================================
// 3. Symbol.for() 跨 Realm 行为
// ============================================================================

function demonstrateSymbolFor(): void {
  console.log("\n--- 3. Symbol.for() 跨 Realm 行为 ---");

  // Symbol.for 在全局 Symbol registry 中注册/查找
  const sym1 = Symbol.for("shared");
  const sym2 = Symbol.for("shared");

  // @ts-expect-error: Symbol.for() returns the same symbol for the same key
  console.log("Symbol.for('shared') === Symbol.for('shared'):", sym1 === sym2);
  console.log("Symbol.for 创建的 symbol 在所有 Realm 中共享");

  // 普通 Symbol 每次创建都是唯一的
  const unique1 = Symbol("unique");
  const unique2 = Symbol("unique");
  // @ts-expect-error: Symbol() always creates a unique symbol
  console.log("Symbol('unique') === Symbol('unique'):", unique1 === unique2);

  // Symbol.keyFor 只能用于 Symbol.for 创建的 symbol
  console.log("Symbol.keyFor(sym1):", Symbol.keyFor(sym1));
  console.log("Symbol.keyFor(unique1):", Symbol.keyFor(unique1)); // undefined
}

// ============================================================================
// 4. instanceof 跨 Realm 失败
// ============================================================================

/**
 * 跨 Realm 时，每个 Realm 有自己的 Array, Object, Date 等构造函数。
 * 因此 instanceof 会失败。
 */
function demonstrateCrossRealmInstanceof(): void {
  console.log("\n--- 4. instanceof 跨 Realm 失败 ---");

  // 模拟跨 Realm：使用 vm 模块或 iframe 时，不同 Realm 的构造函数不同
  // 这里用不同全局对象的 prototype 来说明

  const arr: unknown[] = [];
  console.log("arr instanceof Array:", arr instanceof Array);

  // 模拟从其他 realm 传递来的对象
  // 在浏览器中:
  // const iframe = document.createElement('iframe');
  // const iframeArray = iframe.contentWindow.Array;
  // const arrFromIframe = new iframeArray();
  // arrFromIframe instanceof Array // false!

  console.log(`
// 浏览器中 iframe 跨 Realm 示例:
const iframe = document.createElement('iframe');
document.body.appendChild(iframe);
const iframeArray = iframe.contentWindow!.Array;
const arr2 = new iframeArray(1, 2, 3);

console.log(arr2 instanceof Array);        // false ❌
console.log(arr2 instanceof iframeArray);  // true

// 解决方案: Array.isArray
console.log(Array.isArray(arr2));          // true ✅
  `);
}

// ============================================================================
// 5. 跨 Realm 检测方法
// ============================================================================

function demonstrateCrossRealmChecks(): void {
  console.log("--- 5. 跨 Realm 安全检测方法 ---");

  // ✅ 安全的类型检测
  console.log("Array.isArray([]):", Array.isArray([]));
  console.log("Object.prototype.toString.call([]):", Object.prototype.toString.call([]));
  console.log("Object.prototype.toString.call(new Date()):", Object.prototype.toString.call(new Date()));

  // 自定义对象的跨 Realm 检测
  console.log(`
// 自定义对象的跨 Realm 检测
class MyClass {}
const obj = new MyClass();

// ❌ 跨 Realm 失效
obj instanceof MyClass

// ✅ 使用 Symbol 或属性标记
const CLASS_TAG = Symbol.for('MyClass');
class SafeClass {
  static [CLASS_TAG] = true;
  [CLASS_TAG] = true;
}

function isSafeClass(obj: unknown): boolean {
  return obj != null && (obj as Record<symbol, unknown>)[CLASS_TAG] === true;
}
  `);
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: 依赖 instanceof 进行类型检查 */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: 跨 Realm instanceof 失效 ---");
  console.log(`
// ❌ 错误：依赖 instanceof 检查数组
function processArray(data: unknown) {
  if (data instanceof Array) {
    // 跨 Realm 时此检查会失败！
  }
}

// ✅ 正确：使用 Array.isArray
function processArraySafe(data: unknown) {
  if (Array.isArray(data)) {
    // 跨 Realm 仍然有效
  }
}
  `);
}

/** 反例 2: 使用 realm 特定的构造函数 */
function counterExample2(): void {
  console.log("--- Counter-example 2: realm 特定构造函数 ---");
  console.log(`
// ❌ 错误：检查对象的具体构造函数
function isDate(obj: unknown): boolean {
  return obj instanceof Date;
}
// 跨 Realm 的 Date 对象会返回 false

// ✅ 正确：使用 Object.prototype.toString
function isDateSafe(obj: unknown): boolean {
  return Object.prototype.toString.call(obj) === '[object Date]';
}
  `);
}

/** 反例 3: 假设全局对象可用 */
function counterExample3(): void {
  console.log("--- Counter-example 3: 全局对象假设 ---");
  console.log(`
// ❌ 错误：直接访问 window 或 document
function getWindowWidth(): number {
  return window.innerWidth; // 在 Worker/Node 中不可用
}

// ✅ 正确：检查全局对象类型
function getGlobalWidth(): number | undefined {
  if (typeof window !== 'undefined') {
    return window.innerWidth;
  }
  return undefined;
}
  `);
}

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Agent & Realm Demo ===\n");

  demonstrateEvalRealm();
  demonstrateSymbolFor();
  demonstrateCrossRealmInstanceof();
  demonstrateCrossRealmChecks();

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();

  console.log("\n=== End of Agent & Realm Demo ===\n");
}

export {
  demonstrateEvalRealm,
  demonstrateSymbolFor,
  demonstrateCrossRealmInstanceof,
  demonstrateCrossRealmChecks,
};
