/**
 * @file Runtime-Impacting TS 特性
 * @description
 * 大多数 TS 特性在编译后完全擦除，但有一些会生成额外的 JS 代码。
 * 本文件完整列出所有对运行时产生副作用的 TS 特性，并展示编译前后的对比。
 */

// ============================================================================
// 1. enum — 生成对象 + 反向映射
// ============================================================================

enum Direction {
  Up,
  Down,
  Left,
  Right,
}

// 编译后 JS:
// var Direction;
// (function (Direction) {
//   Direction[Direction["Up"] = 0] = "Up";
//   Direction[Direction["Down"] = 1] = "Down";
//   ...
// })(Direction || (Direction = {}));

// const enum — 完全内联，零运行时开销
const enum ConstDirection {
  Up = 0,
  Down = 1,
}

export function demoEnum(): void {
  console.log('=== 1. enum ===');
  console.log(`  Direction.Up = ${Direction.Up}`);
  console.log(`  Direction[0] = ${Direction[0]}`); // 反向映射！
  console.log(`  Direction["Up"] = ${Direction['Up']}`);

  // 反例: enum 是双向映射对象，不是真正的常量
  const fake = 999 as unknown as Direction;
  console.log(`  Direction[999] = ${Direction[fake]}`); // undefined，但类型系统是 Direction

  console.log('  const enum: 编译时内联，零运行时');
  console.log('  💡 编译后 JS 生成 IIFE + 对象 + 反向映射');
}

// ============================================================================
// 2. namespace / module — 生成 IIFE
// ============================================================================

namespace Validation {
  export function isEmail(s: string): boolean {
    return s.includes('@');
  }

  export const VERSION = '1.0.0';
}

// 编译后 JS:
// var Validation;
// (function (Validation) {
//   function isEmail(s) { return s.includes('@'); }
//   Validation.isEmail = isEmail;
//   Validation.VERSION = '1.0.0';
// })(Validation || (Validation = {}));

export function demoNamespace(): void {
  console.log('\n=== 2. namespace ===');
  console.log(`  Validation.isEmail("test@e.com") = ${Validation.isEmail('test@e.com')}`);
  console.log(`  Validation.VERSION = ${Validation.VERSION}`);
  console.log('  💡 编译后生成 IIFE 或对象赋值，污染全局/模块作用域');
}

// ============================================================================
// 3. 参数属性 (Parameter Properties)
// ============================================================================

class Point3D {
  constructor(
    public x: number,
    public y: number,
    private z: number
  ) {}
}

// 编译后 JS:
// class Point3D {
//   constructor(x, y, z) {
//     this.x = x;
//     this.y = y;
//     this.z = z;
//   }
// }

export function demoParameterProperties(): void {
  console.log('\n=== 3. 参数属性 ===');
  const p = new Point3D(1, 2, 3);
  console.log(`  p.x = ${p.x}, p.y = ${p.y}`);
  // z 是 private，但编译后仍存在于 this.z
  console.log(`  (p as any).z = ${(p as any).z}`); // 3 — private 修饰符运行时消失
  console.log('  💡 编译后在构造函数内生成 `this.x = x` 赋值语句');
}

// ============================================================================
// 4. Decorators (Stage 3) — 生成装饰器调用
// ============================================================================

function logged(target: any, context: ClassMethodDecoratorContext) {
  const methodName = String(context.name);
  return function (this: any, ...args: any[]) {
    console.log(`    [${methodName}] called with:`, args);
    const result = (target as Function).apply(this, args);
    console.log(`    [${methodName}] returned:`, result);
    return result;
  };
}

class Calculator {
  @logged
  add(a: number, b: number): number {
    return a + b;
  }
}

// 编译后 JS (简化):
// let Calculator = class Calculator {
//   add(a, b) { return a + b; }
// };
// __decorate([
//   logged
// ], Calculator.prototype, "add", 1);

export function demoDecorators(): void {
  console.log('\n=== 4. Decorators ===');
  const calc = new Calculator();
  console.log(`  calc.add(2, 3) = ${calc.add(2, 3)}`);
  console.log('  💡 编译后生成 __decorate 辅助函数调用');
}

// ============================================================================
// 5. emitDecoratorMetadata — 注入 Reflect.metadata
// ============================================================================

// 当 tsconfig.json 中 emitDecoratorMetadata: true 时:
// @logged
// add(a: number, b: number): number { ... }
// 编译后额外生成:
// __metadata("design:type", Function),
// __metadata("design:paramtypes", [Number, Number]),
// __metadata("design:returntype", Number)

export function demoDecoratorMetadata(): void {
  console.log('\n=== 5. emitDecoratorMetadata ===');
  console.log('  开启后在运行时注入 Reflect.metadata("design:paramtypes", ...)');
  console.log('  依赖 reflect-metadata polyfill');
  console.log('  💡 这是 Angular DI 和 NestJS 的基础，但增加包体积');
}

// ============================================================================
// 6. Class Fields — TS 3.7+ 与原生语义差异
// ============================================================================

class FieldDemo {
  // TS 编译选项 useDefineForClassFields: true (ES2022 语义)
  // → 编译为 Object.defineProperty
  // useDefineForClassFields: false (旧 TS 语义)
  // → 编译为构造函数内 this.x = value

  x = 10;
  y: number;

  constructor() {
    this.y = 20;
  }
}

export function demoClassFields(): void {
  console.log('\n=== 6. Class Fields 编译差异 ===');
  const d = new FieldDemo();
  console.log(`  x = ${d.x}, y = ${d.y}`);
  console.log('  💡 TS 的 class fields 编译目标不同，运行时行为可能不同');
  console.log('     - useDefineForClassFields: true → defineProperty (不可枚举)');
  console.log('     - useDefineForClassFields: false → this.x = value (可枚举)');
}

// ============================================================================
// 7. import = require() / export =
// ============================================================================

// import fs = require('fs');       // 编译为 const fs = require('fs');
// export = MyModule;               // 编译为 module.exports = MyModule;

export function demoLegacyModuleSyntax(): void {
  console.log('\n=== 7. import = / export = ===');
  console.log('  `import fs = require("fs")` → `const fs = require("fs")`');
  console.log('  `export = MyModule` → `module.exports = MyModule`');
  console.log('  💡 这是 TS 为兼容 CommonJS 设计的语法，非标准 ESM');
}

// ============================================================================
// 8. tslib 辅助函数导入
// ============================================================================

// 当 tsconfig.json 中 importHelpers: true 时:
// class 继承、对象展开、async/await 等会使用 tslib 的辅助函数
// 而非每个文件内联生成

// 编译前:
// class A extends B {}

// importHelpers: false (默认):
// var __extends = (this && this.__extends) || ...  // 每个文件重复！

// importHelpers: true:
// import { __extends } from "tslib";              // 统一导入

export function demoTslib(): void {
  console.log('\n=== 8. tslib 辅助函数 ===');
  console.log('  importHelpers: true 时，统一从 tslib 导入 __extends/__assign 等');
  console.log('  减少重复代码，但增加运行时依赖');
}

// ============================================================================
// 9. JSX — 编译为 React.createElement
// ============================================================================

// const element = <div className="app">Hello</div>;
// 编译后:
// const element = React.createElement("div", { className: "app" }, "Hello");

export function demoJsx(): void {
  console.log('\n=== 9. JSX ===');
  console.log('  JSX 不是 TS 特性，但 TS 编译它');
  console.log('  `<div />` → `React.createElement("div", null)`');
  console.log('  💡 运行时生成虚拟 DOM 对象，有真实性能开销');
}

// ============================================================================
// 10. using / await using — Symbol.dispose 辅助
// ============================================================================

// using file = openFile('data.txt');
// 编译后:
// const file = openFile('data.txt');
// try { ... } finally { file[Symbol.dispose](); }

export function demoUsing(): void {
  console.log('\n=== 10. using / await using ===');
  console.log('  `using` 编译为 try/finally + Symbol.dispose 调用');
  console.log('  `await using` 编译为 try/finally + await Symbol.asyncDispose()');
  console.log('  💡 需要运行时 polyfill 提供 Symbol.dispose');
}

// ============================================================================
// 主演示
// ============================================================================

export function demo(): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     Runtime-Impacting TS 特性 — 编译后产生 JS 代码           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  demoEnum();
  demoNamespace();
  demoParameterProperties();
  demoDecorators();
  demoDecoratorMetadata();
  demoClassFields();
  demoLegacyModuleSyntax();
  demoTslib();
  demoJsx();
  demoUsing();

  console.log('\n✅ Runtime-Impacting TS 特性演示完成');
  console.log('   核心结论: 这些 TS 特性不是"纯类型"，它们会改变运行时行为或增加代码体积');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demo();
}
