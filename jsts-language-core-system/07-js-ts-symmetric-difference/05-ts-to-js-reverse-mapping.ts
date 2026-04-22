/**
 * @file TS → JS 反向映射
 * @description
 * "没有 TypeScript 时，JavaScript 里怎么写？"
 * 本文件展示每个 TS 特性在纯 JS 中的等价写法或替代方案。
 */

// ============================================================================
// 1. interface → JSDoc @typedef / 运行时 duck typing
// ============================================================================

// TS:
// interface User {
//   id: number;
//   name: string;
// }

// JS 等价 1: JSDoc
/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 */

// JS 等价 2: 运行时 shape 验证
function isUser(obj: any): boolean {
  return obj && typeof obj.id === 'number' && typeof obj.name === 'string';
}

// JS 等价 3: 什么都不做 (duck typing)
// function greet(user) { return `Hello ${user.name}`; }
// greet({ id: 1, name: 'A' }); // 只要形状对就行

export function demoInterfaceToJs(): void {
  console.log('=== 1. interface → JS ===');
  console.log('  TS: interface User { id: number; name: string; }');
  console.log('  JS: JSDoc @typedef + 运行时 isUser() 验证');
  console.log(`  isUser({ id: 1, name: 'A' }) = ${isUser({ id: 1, name: 'A' })}`);
  console.log(`  isUser({}) = ${isUser({})}`);
}

// ============================================================================
// 2. type 别名 → JSDoc @typedef
// ============================================================================

// TS:
// type ID = string | number;
// type Point = { x: number; y: number };

// JS 等价: JSDoc + 运行时验证
/**
 * @typedef {string | number} ID
 * @typedef {{ x: number, y: number }} Point
 */

function isPoint(obj: any): boolean {
  return obj && typeof obj.x === 'number' && typeof obj.y === 'number';
}

export function demoTypeAliasToJs(): void {
  console.log('\n=== 2. type 别名 → JS ===');
  console.log('  TS: type Point = { x: number; y: number; }');
  console.log('  JS: JSDoc @typedef {{ x: number, y: number }} Point');
}

// ============================================================================
// 3. enum → Object.freeze / Symbol / const 对象
// ============================================================================

// TS:
// enum Status { Pending = 0, Success = 1, Error = 2 }

// JS 等价 1: Object.freeze
const Status = Object.freeze({
  Pending: 0,
  Success: 1,
  Error: 2,
} as const);

// JS 等价 2: Symbol (真正唯一)
const StatusSymbol = Object.freeze({
  Pending: Symbol('Pending'),
  Success: Symbol('Success'),
  Error: Symbol('Error'),
} as const);

// JS 等价 3: 反向映射需手动构建
const StatusReverse: Record<number, string> = {};
for (const [key, val] of Object.entries(Status)) {
  if (typeof val === 'number') {
    StatusReverse[val] = key;
  }
}

export function demoEnumToJs(): void {
  console.log('\n=== 3. enum → JS ===');
  console.log(`  TS: enum Status { Pending, Success, Error }`);
  console.log(`  JS: Object.freeze({ Pending: 0, Success: 1, Error: 2 })`);
  console.log(`  Status.Pending = ${Status.Pending}`);
  console.log(`  StatusReverse[0] = ${StatusReverse[0]}`);
  console.log(`  Symbol enum: StatusSymbol.Pending = ${String(StatusSymbol.Pending)}`);
}

// ============================================================================
// 4. generic<T> → 高阶函数 + 手动类型检查 / JSDoc @template
// ============================================================================

// TS:
// function identity<T>(x: T): T { return x; }

// JS 等价 1: 普通函数 (类型擦除后就是这样)
function identity(x: any): any {
  return x;
}

// JS 等价 2: 带运行时验证的"泛型"
function identityWithCheck<T>(
  x: any,
  validator: (v: any) => v is T
): T {
  if (!validator(x)) throw new TypeError('Invalid type');
  return x;
}

// JS 等价 3: JSDoc @template
/**
 * @template T
 * @param {T} x
 * @returns {T}
 */
function identityJSDoc(x: any): any {
  return x;
}

export function demoGenericToJs(): void {
  console.log('\n=== 4. generic<T> → JS ===');
  console.log('  TS: function identity<T>(x: T): T');
  console.log('  JS: function identity(x) { return x; } — 类型完全擦除');
  console.log('  增强: 传入 validator 函数做运行时类型检查');
}

// ============================================================================
// 5. implements → 运行时 shape 检查 / Object.assign
// ============================================================================

// TS:
// class Bird implements CanFly { fly() { ... } }

// JS 等价: 构造函数内检查必须方法
interface CanFly {
  fly(): void;
}

class BirdJS implements CanFly {
  constructor() {
    // 运行时接口检查 (模拟 implements)
    const requiredMethods = ['fly'];
    for (const method of requiredMethods) {
      if (typeof (this as any)[method] !== 'function') {
        throw new Error(`Missing method: ${method}`);
      }
    }
  }

  fly(): void {
    console.log('    flying');
  }
}

// 更简洁的 JS 方式: mixin 模式
function Flyable(Base: any) {
  return class extends Base {
    fly(): void {
      console.log('    flying');
    }
  };
}

export function demoImplementsToJs(): void {
  console.log('\n=== 5. implements → JS ===');
  console.log('  TS: class Bird implements CanFly');
  console.log('  JS: 构造函数内检查必需方法 / mixin 模式');
  const bird = new BirdJS();
  bird.fly();
}

// ============================================================================
// 6. private → 闭包 / WeakMap / #private
// ============================================================================

// TS:
// class A { private x = 10; }

// JS 等价 1: 闭包 (构造函数模式)
function createA(): { getX: () => number } {
  let x = 10; // 真正私有
  return {
    getX: () => x,
  };
}

// JS 等价 2: WeakMap
const _private = new WeakMap<object, { x: number }>();

class AWeakMap {
  constructor() {
    _private.set(this, { x: 10 });
  }

  getX(): number {
    return _private.get(this)!.x;
  }
}

// JS 等价 3: #private (原生 JS 私有字段)
class ANativePrivate {
  #x = 10;

  getX(): number {
    return this.#x;
  }
}

export function demoPrivateToJs(): void {
  console.log('\n=== 6. private → JS ===');
  console.log('  TS: private x = 10 (编译时私有，运行时可访问)');
  console.log('  JS 方案 1: 闭包变量 — 真正私有');
  console.log(`  createA().getX() = ${createA().getX()}`);
  console.log('  JS 方案 2: WeakMap — 真正私有');
  console.log(`  new AWeakMap().getX() = ${new AWeakMap().getX()}`);
  console.log('  JS 方案 3: #private — 原生支持，最推荐');
  console.log(`  new ANativePrivate().getX() = ${new ANativePrivate().getX()}`);
}

// ============================================================================
// 7. readonly → Object.freeze / Object.defineProperty
// ============================================================================

// TS:
// class Point { readonly x = 1; }

// JS 等价 1: Object.freeze
const frozenPoint = Object.freeze({ x: 1, y: 2 });
// frozenPoint.x = 3; // 严格模式下抛 TypeError

// JS 等价 2: Object.defineProperty
class PointReadonly {
  constructor(x: number) {
    Object.defineProperty(this, 'x', {
      value: x,
      writable: false,
      configurable: false,
    });
  }

  declare x: number;
}

export function demoReadonlyToJs(): void {
  console.log('\n=== 7. readonly → JS ===');
  console.log('  TS: readonly x = 1');
  console.log('  JS: Object.defineProperty(this, "x", { writable: false })');
  console.log(`  frozenPoint.x = ${frozenPoint.x}`);
}

// ============================================================================
// 8. as const → 手动字面量对象
// ============================================================================

// TS:
// const config = { api: '...', timeout: 5000 } as const;

// JS 等价: 直接写常量 (JS 没有类型，所以不需要 as const)
const configJS = Object.freeze({
  api: 'https://api.example.com',
  timeout: 5000,
} as const);

export function demoAsConstToJs(): void {
  console.log('\n=== 8. as const → JS ===');
  console.log('  TS: as const 产生字面量类型');
  console.log('  JS: Object.freeze 提供运行时不可变性');
  console.log(`  configJS.api = ${configJS.api}`);
}

// ============================================================================
// 9. satisfies → 运行时 assertShape()
// ============================================================================

// TS:
// const palette = { red: [255, 0, 0] } satisfies Record<string, [number, number, number]>;

// JS 等价: 运行时验证函数
function assertShape<T>(
  obj: any,
  validator: (o: any) => o is T
): asserts obj is T {
  if (!validator(obj)) {
    throw new TypeError('Shape assertion failed');
  }
}

function isPalette(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return false;
  for (const [key, val] of Object.entries(obj)) {
    if (!Array.isArray(val) || val.length !== 3 || !val.every((v) => typeof v === 'number')) {
      return false;
    }
  }
  return true;
}

const paletteJS = { red: [255, 0, 0], green: [0, 255, 0] };
// assertShape(paletteJS, isPalette); // 运行时验证

export function demoSatisfiesToJs(): void {
  console.log('\n=== 9. satisfies → JS ===');
  console.log('  TS: satisfies 在类型层验证结构');
  console.log('  JS: assertShape(obj, validator) 运行时验证');
}

// ============================================================================
// 10. keyof → Object.keys() (但有差异)
// ============================================================================

// TS:
// type Keys = keyof { a: 1; b: 2 }; // "a" | "b"

// JS 等价:
const objKeys = { a: 1, b: 2 };
const keys = Object.keys(objKeys); // ["a", "b"] — 运行时才能拿到

export function demoKeyofToJs(): void {
  console.log('\n=== 10. keyof → JS ===');
  console.log('  TS: keyof T → 编译时字面量联合类型');
  console.log(`  JS: Object.keys(obj) → ${JSON.stringify(keys)} (运行时字符串数组)`);
  console.log('  💡 Object.keys 返回 string[]，丢失具体键名信息');
}

// ============================================================================
// 11. 函数重载 → 手动 dispatch
// ============================================================================

// TS:
// function process(x: string): string;
// function process(x: number): number;
// function process(x: string | number): string | number { ... }

// JS 等价: 单一函数 + typeof 分支
function processJS(x: string | number): string | number {
  if (typeof x === 'string') {
    return x.toUpperCase();
  }
  return x * 2;
}

// 更复杂的: 基于参数数量和类型的手动 dispatch
function overloadJS(...args: any[]): any {
  if (args.length === 1 && typeof args[0] === 'string') {
    return args[0].toUpperCase();
  }
  if (args.length === 1 && typeof args[0] === 'number') {
    return args[0] * 2;
  }
  if (args.length === 2) {
    return args[0] + args[1];
  }
  throw new Error('No matching overload');
}

export function demoOverloadToJs(): void {
  console.log('\n=== 11. 函数重载 → JS ===');
  console.log('  TS: 多个声明签名 + 一个实现');
  console.log('  JS: 单一函数内 typeof / instanceof 手动分发');
  console.log(`  processJS("hello") = ${processJS('hello')}`);
  console.log(`  processJS(5) = ${processJS(5)}`);
}

// ============================================================================
// 12. namespace → IIFE / ES Module
// ============================================================================

// TS:
// namespace Utils {
//   export function log(x: string) { console.log(x); }
// }

// JS 等价 1: IIFE (旧式)
const UtilsIIFE = (function () {
  function log(x: string): void {
    console.log(x);
  }
  return { log };
})();

// JS 等价 2: ES Module (现代)
// export function log(x) { console.log(x); }

export function demoNamespaceToJs(): void {
  console.log('\n=== 12. namespace → JS ===');
  console.log('  TS: namespace Utils { ... }');
  console.log('  JS: IIFE 或 ES Module');
  UtilsIIFE.log('    Hello from IIFE namespace');
}

// ============================================================================
// 13. 装饰器 → 高阶函数 / 猴子补丁
// ============================================================================

// TS:
// @logged
// method() { ... }

// JS 等价: 高阶函数
function withLogging(fn: Function): Function {
  return function (this: any, ...args: any[]) {
    console.log(`    calling ${fn.name} with`, args);
    return fn.apply(this, args);
  };
}

const rawMethod = function add(a: number, b: number): number {
  return a + b;
};
const loggedMethod = withLogging(rawMethod);

export function demoDecoratorToJs(): void {
  console.log('\n=== 13. 装饰器 → JS ===');
  console.log('  TS: @logged (编译后生成 __decorate 调用)');
  console.log('  JS: 高阶函数 withLogging(fn) 包装原函数');
  console.log(`  loggedMethod(2, 3) = ${loggedMethod(2, 3)}`);
}

// ============================================================================
// 14. interface 合并 → Object.assign
// ============================================================================

// TS:
// interface User { name: string; }
// interface User { age: number; } // 声明合并

// JS 等价: 对象合并
const userBase = { name: 'Alice' };
const userMerged = Object.assign({}, userBase, { age: 30 });

export function demoMergingToJs(): void {
  console.log('\n=== 14. interface 合并 → JS ===');
  console.log('  TS: 同名 interface 自动合并');
  console.log(`  JS: Object.assign({}, a, b) = ${JSON.stringify(userMerged)}`);
}

// ============================================================================
// 主演示
// ============================================================================

export function demo(): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     TS → JS 反向映射 — 没有 TS 时 JS 怎么写                 ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  demoInterfaceToJs();
  demoTypeAliasToJs();
  demoEnumToJs();
  demoGenericToJs();
  demoImplementsToJs();
  demoPrivateToJs();
  demoReadonlyToJs();
  demoAsConstToJs();
  demoSatisfiesToJs();
  demoKeyofToJs();
  demoOverloadToJs();
  demoNamespaceToJs();
  demoDecoratorToJs();
  demoMergingToJs();

  console.log('\n✅ TS → JS 反向映射演示完成');
  console.log('   核心结论: TS 是"类型层语法糖"，所有特性在 JS 中都有等价表达');
  console.log('   只是缺少编译时检查，需要更多运行时验证和测试');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demo();
}
