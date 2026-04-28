// @ts-nocheck

/**
 * @file JS-Only 运行时特性
 * @description
 * JavaScript 拥有而 TypeScript 无法建模、检查或改变的运行时行为。
 * 这些特性根植于 ECMA-262 引擎内部，是 JS 动态性的核心体现。
 */

// ============================================================================
// 1. typeof 的怪癖 — typeof null === "object"
// ============================================================================

export function demoTypeofQuirks(): void {
  console.log('=== 1. typeof 怪癖 ===');

  const cases = [
    null,           // "object" ← 历史 bug
    [],             // "object"
    {},             // "object"
    NaN,            // "number"
    Infinity,       // "number"
    () => {},       // "function"
    class Foo {},   // "function"
    undefined,      // "undefined"
    Symbol('x'),    // "symbol"
    123n,           // "bigint"
  ];

  for (const val of cases) {
    console.log(`  typeof ${String(val)} === "${typeof val}"`);
  }

  // 反例: TypeScript 无法修复 typeof null
  // if (typeof maybeNull === "object") {
  //   maybeNull.toString(); // TS 认为 safe，但 null 会抛错
  // }

  console.log('  💡 TS 类型: `typeof x === "object"` 收窄为 `object | null`，必须再排除 null');
}

// ============================================================================
// 2. == 抽象相等算法的强制转换矩阵
// ============================================================================

export function demoAbstractEquality(): void {
  console.log('\n=== 2. == 强制转换矩阵 ===');

  const matrix: [unknown, unknown, boolean, string][] = [
    [0, '0', 0 == '0', 'ToNumber("0") === 0'],
    ['', false, '' == false, 'ToNumber("") === 0, ToNumber(false) === 0'],
    [[], false, [] == false, 'ToPrimitive([]) -> "", ToNumber("") === 0'],
    [[], 0, [] == 0, 'ToPrimitive([]) -> "", ToNumber("") === 0'],
    [{}, '[object Object]', {} == '[object Object]', 'ToPrimitive({}) -> "[object Object]"'],
    [null, undefined, null == undefined, '规范特例: null == undefined 为 true'],
    [null, 0, null == 0 as unknown as boolean, 'ToNumber(null) === 0... 但规范特例使 null == 0 为 false'],
  ];

  for (const [a, b, result, reason] of matrix) {
    console.log(`  ${JSON.stringify(a)} == ${JSON.stringify(b)} → ${result} (${reason})`);
  }

  // 反例
  console.log('  ❌ [] == ![] →', [] == ![]); // true! 因为 ![] === false, [] == false
  console.log('  ❌ "" == [null] →', "" == [null] as unknown as boolean); // true!

  console.log('  💡 TS 无法阻止 == 的强制转换，只能用 lint 规则 ban 掉');
}

// ============================================================================
// 3. 抽象操作: ToPrimitive / ToNumber / ToString
// ============================================================================

export function demoAbstractOperations(): void {
  console.log('\n=== 3. 抽象操作 ===');

  // ToPrimitive: Symbol.toPrimitive → valueOf → toString
  const obj = {
    [Symbol.toPrimitive](hint: string): string | number {
      console.log(`    Symbol.toPrimitive called with hint: ${hint}`);
      return hint === 'number' ? 42 : 'forty-two';
    }
  };
  console.log(`  Number(obj) = ${Number(obj)}`);
  console.log(`  String(obj) = ${String(obj)}`);

  // ToNumber on strings
  console.log(`  Number("  123  ") = ${Number("  123  ")}`);
  console.log(`  Number("") = ${Number("")}`); // 0!
  console.log(`  Number("0x10") = ${Number("0x10")}`); // 16!
  console.log(`  Number("Infinity") = ${Number("Infinity")}`);
  console.log(`  Number("123abc") = ${Number("123abc")}`); // NaN

  // 反例: parseInt vs Number
  console.log('  parseInt("08") =', parseInt("08")); // 8 (ES3 是 0!)
  console.log('  parseInt("f", 16) =', parseInt("f", 16)); // 15
}

// ============================================================================
// 4. 内部槽 [[Prototype]] / [[Extensible]]
// ============================================================================

export function demoInternalSlots(): void {
  console.log('\n=== 4. 内部槽 ===');

  const base = { x: 1 };
  const derived = Object.create(base);
  derived.y = 2;

  // [[Prototype]] 链
  console.log(`  derived.x (原型链查找) = ${derived.x}`);
  console.log(`  Object.getPrototypeOf(derived) === base: ${Object.getPrototypeOf(derived) === base}`);

  // [[Extensible]]
  const sealed = {};
  Object.preventExtensions(sealed);
  console.log(`  Object.isExtensible(sealed): ${Object.isExtensible(sealed)}`);
  // sealed.z = 3; // TS 不报错！但 strict mode 下运行时抛 TypeError

  // 反例: Object.prototype 污染
  // ({}).__proto__.polluted = true; // 运行时可行，TS 类型系统 unaware
  console.log('  💡 TS 不知道对象是否被 preventExtensions/seal/freeze');
}

// ============================================================================
// 5. WeakRef / FinalizationRegistry — GC 交互
// ============================================================================

export function demoWeakRef(): void {
  console.log('\n=== 5. WeakRef / FinalizationRegistry ===');

  // WeakRef: 不阻止垃圾回收的引用
  let target: { data: string } | null = { data: 'sensitive' };
  const ref = new WeakRef(target);

  console.log(`  WeakRef deref (存活时): ${ref.deref()?.data}`);

  target = null; // 取消强引用
  // GC 可能在未来的某个时刻回收 target
  console.log(`  WeakRef deref (可能已回收): ${ref.deref()?.data ?? 'undefined (已回收)'}`);

  // FinalizationRegistry: GC 回调
  const registry = new FinalizationRegistry<string>((heldValue) => {
    console.log(`    🗑️ Finalizer 触发: ${heldValue} 被回收`);
  });

  let obj: object | null = { id: 1 };
  registry.register(obj, 'object-1');
  obj = null;

  console.log('  💡 TS 类型系统对 GC 时机完全无知；WeakRef 的 deref() 可能随时返回 undefined');
}

// ============================================================================
// 6. Atomics / SharedArrayBuffer — 内存模型
// ============================================================================

export function demoAtomics(): void {
  console.log('\n=== 6. Atomics / SharedArrayBuffer ===');

  // 创建共享内存
  const buffer = new SharedArrayBuffer(1024);
  const array = new Int32Array(buffer);

  // Atomics 操作保证线程安全
  Atomics.store(array, 0, 42);
  const value = Atomics.load(array, 0);
  console.log(`  Atomics.load: ${value}`);

  // Atomics.wait / Atomics.notify — 线程同步原语
  // Atomics.wait(array, 0, 42); // 在 Worker 中阻塞直到值改变

  // 反例: 非 Atomics 访问导致 data race
  // array[0] = 1; // TS 无法检测这是否是 data race！
  // const x = array[0]; // 可能读到 torn write

  console.log('  💡 TS 不知道代码运行在哪个线程；无法检测 data race');
}

// ============================================================================
// 7. instanceof / Symbol.hasInstance 跨 Realm 失效
// ============================================================================

export function demoInstanceofQuirks(): void {
  console.log('\n=== 7. instanceof 怪癖 ===');

  class MyArray extends Array {}
  const arr = new MyArray();

  console.log(`  arr instanceof MyArray: ${arr instanceof MyArray}`);
  console.log(`  arr instanceof Array: ${arr instanceof Array}`);

  // 反例: 跨 Realm
  // const iframe = document.createElement('iframe');
  // const iframeArray = iframe.contentWindow!.Array;
  // const arr2 = new iframeArray();
  // arr2 instanceof Array → false! (不同 Realm 的 Array 构造函数)
  // Array.isArray(arr2) → true ✓ (可靠的方法)

  console.log('  Array.isArray([]):', Array.isArray([])); // true
  console.log('  💡 TS `instanceof`  narrowing 在跨 realm 时失效；应优先用 Array.isArray / in 运算符');
}

// ============================================================================
// 8. eval / new Function — 动态代码执行
// ============================================================================

export function demoDynamicExecution(): void {
  console.log('\n=== 8. eval / new Function ===');

  // eval 在当前词法作用域执行
  const x = 1;
  console.log(`  eval("x + 1") = ${eval('x + 1')}`); // 2

  // new Function 在全局作用域执行
  const fn = new Function('a', 'b', 'return a + b');
  console.log(`  new Function("a", "b", "return a + b")(1, 2) = ${fn(1, 2)}`);

  // 反例: eval 逃逸 TS 类型检查
  const result = eval('"hello" + 123'); // TS 认为是 any
  console.log(`  eval 结果类型: any，实际值: ${result}`);

  console.log('  💡 eval 和 new Function 的返回值类型为 any，TS 完全放弃检查');
}

// ============================================================================
// 9. with 语句 — TS 报错但 JS 有效
// ============================================================================

export function demoWithStatement(): void {
  console.log('\n=== 9. with 语句 (已废弃) ===');

  // with 在 TS 中是错误 (TS 严格模式下不允许)
  // 但在 JS 中仍然有效：
  const obj = { a: 1, b: 2 };
  // with (obj) {
  //   console.log(a + b); // 3 — 但变量解析不可静态分析
  // }

  console.log('  with 语句使变量解析动态化，TS 完全无法分析，故禁止');
  console.log('  💡 TS 编译错误: `with` 语句在 TS 中不被允许');
}

// ============================================================================
// 10. arguments 对象 — 类数组但非数组
// ============================================================================

export function demoArgumentsObject(): void {
  console.log('\n=== 10. arguments 对象 ===');

  function legacyFn() {
    console.log(`  arguments.length: ${arguments.length}`);
    console.log(`  arguments[0]: ${arguments[0]}`);
    console.log(`  Array.isArray(arguments): ${Array.isArray(arguments)}`); // false!
    // arguments.shift(); // 错误！没有数组方法
  }

  legacyFn(1, 2, 3);

  // 反例: arguments 与形参别名 (非 strict mode)
  // function alias(a: number) {
  //   arguments[0] = 99; // a 也变成 99！
  // }

  console.log('  💡 TS 推荐剩余参数 `...args: number[]` 替代 arguments');
}

// ============================================================================
// 11. Error.prototype.stack — 非标准属性
// ============================================================================

export function demoErrorStack(): void {
  console.log('\n=== 11. Error.stack (非标准) ===');

  const err = new Error('Something went wrong');
  console.log(`  err.stack 存在: ${'stack' in err}`);
  console.log(`  stack 类型: string | undefined (运行时决定)`);
  // 不同引擎格式不同: V8 vs SpiderMonkey vs JavaScriptCore

  console.log('  💡 stack 不是 ECMA-262 标准，TS 的 lib.es5.d.ts 将其定义为 string');
}

// ============================================================================
// 12. 运行时属性访问: 方括号 vs 点号
// ============================================================================

export function demoPropertyAccess(): void {
  console.log('\n=== 12. 动态属性访问 ===');

  const obj: Record<string, number> = { a: 1, b: 2 };
  const key = Math.random() > 0.5 ? 'a' : 'b';

  console.log(`  obj[key]: ${obj[key]}`); // TS 允许，因为索引签名

  // 反例: 计算属性超出类型范围
  const userInput = 'c';
  console.log(`  obj[userInput]: ${obj[userInput]}`); // undefined，但 TS 认为 number | undefined

  console.log('  💡 方括号访问使静态分析失效，TS 只能退回到索引签名类型');
}

// ============================================================================
// 主演示
// ============================================================================

export function demo(): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     JS-Only 运行时特性 — TS 无法建模的行为                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  demoTypeofQuirks();
  demoAbstractEquality();
  demoAbstractOperations();
  demoInternalSlots();
  demoWeakRef();
  demoAtomics();
  demoInstanceofQuirks();
  demoDynamicExecution();
  demoWithStatement();
  demoArgumentsObject();
  demoErrorStack();
  demoPropertyAccess();

  console.log('\n✅ JS-Only 运行时特性演示完成');
  console.log('   核心结论: JS 的动态性根植于引擎内部，TS 类型层无法触及这些行为');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demo();
}
