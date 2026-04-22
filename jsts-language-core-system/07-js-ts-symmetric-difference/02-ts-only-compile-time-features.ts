/**
 * @file TS-Only 编译时特性
 * @description
 * TypeScript 独有的编译时构造 — 这些特性在运行时完全擦除，JS 永远不会有它们。
 * 本文件展示每个 TS-only 特性，并附注 "如果只用 JS，怎么近似它"。
 */

// ============================================================================
// 1. interface — 结构类型声明
// ============================================================================

interface User {
  id: number;
  name: string;
}

// interface 可以声明合并 (declaration merging)
interface User {
  email: string;
}

// 运行时: User 接口完全消失，没有任何 JS 代码生成
export function demoInterface(): void {
  console.log('=== 1. interface ===');
  const user: User = { id: 1, name: 'Alice', email: 'a@example.com' };
  console.log(`  运行时无 User 接口存在: ${typeof (globalThis as any).User}`); // undefined!
  console.log(`  user 对象: ${JSON.stringify(user)}`);
  console.log('  💡 JS 等价: JSDoc @typedef 或运行时 duck typing');
}

// ============================================================================
// 2. type 别名 — 类型级宏
// ============================================================================

type ID = string | number;
type Point = { x: number; y: number };
type Callback = (data: string) => void;

// type 不可合并（会报错）
// type ID = boolean; // Error: Duplicate identifier

export function demoTypeAlias(): void {
  console.log('\n=== 2. type 别名 ===');
  const id1: ID = 'abc';
  const id2: ID = 123;
  console.log(`  ID 类型运行时消失: typeof ID === ${typeof (globalThis as any).ID}`);
  console.log('  💡 JS 等价: JSDoc @typedef 或注释说明');
}

// ============================================================================
// 3. 联合类型 (Union Types)
// ============================================================================

type Status = 'pending' | 'success' | 'error';
type Value = string | number | boolean;

export function demoUnionTypes(): void {
  console.log('\n=== 3. 联合类型 ===');
  function logValue(v: Value): void {
    console.log(`  值: ${v}, typeof: ${typeof v}`);
  }
  logValue('hello');
  logValue(42);

  // 运行时: 联合类型无痕迹，只有具体值
  const x: Status = 'success';
  console.log(`  Status 联合类型运行时: "${x}" (只是字符串)`);
  console.log('  💡 JS 等价: 运行时 typeof 检查或手动验证');
}

// ============================================================================
// 4. 交叉类型 (Intersection Types)
// ============================================================================

type Named = { name: string };
type Aged = { age: number };
type Person = Named & Aged; // { name: string; age: number }

export function demoIntersectionTypes(): void {
  console.log('\n=== 4. 交叉类型 ===');
  const person: Person = { name: 'Bob', age: 30 };
  console.log(`  Person 交叉类型运行时: ${JSON.stringify(person)} (普通对象)`);
  console.log('  💡 JS 等价: Object.assign 或对象展开 { ...a, ...b }');
}

// ============================================================================
// 5. 条件类型 (Conditional Types)
// ============================================================================

type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<123>;     // false

// distributive conditional type
type ToArray<T> = T extends any ? T[] : never;
type C = ToArray<string | number>; // string[] | number[]

export function demoConditionalTypes(): void {
  console.log('\n=== 5. 条件类型 ===');
  // 运行时完全没有 IsString、ToArray 的存在
  console.log('  IsString<"hello"> 结果: 类型 true (运行时无痕迹)');
  console.log('  ToArray<string | number> 结果: 类型 string[] | number[]');
  console.log('  💡 JS 等价: 运行时无法实现类型级分支，需手动写 if/typeof');
}

// ============================================================================
// 6. infer — 类型提取
// ============================================================================

type ReturnTypeOf<T> = T extends (...args: any[]) => infer R ? R : never;
type Fn = () => string;
type Ret = ReturnTypeOf<Fn>; // string

type ArrayElement<T> = T extends (infer E)[] ? E : never;
type Elem = ArrayElement<number[]>; // number

export function demoInfer(): void {
  console.log('\n=== 6. infer ===');
  console.log('  ReturnTypeOf<() => string> = string (纯类型推导)');
  console.log('  ArrayElement<number[]> = number (纯类型推导)');
  console.log('  💡 JS 等价: 无法实现，infer 是类型系统的模式匹配');
}

// ============================================================================
// 7. 映射类型 (Mapped Types)
// ============================================================================

type Readonly<T> = { readonly [K in keyof T]: T[K] };
type Partial<T> = { [K in keyof T]?: T[K] };

type UserKeys = keyof User; // 'id' | 'name' | 'email'

export function demoMappedTypes(): void {
  console.log('\n=== 7. 映射类型 ===');
  const readonlyUser: Readonly<User> = { id: 1, name: 'A', email: 'a@e.com' };
  // readonlyUser.id = 2; // TS 编译错误！
  console.log(`  Readonly<User> 运行时: ${JSON.stringify(readonlyUser)} (普通对象)`);
  console.log('  💡 JS 等价: Object.freeze 或 Object.defineProperty 写保护');
}

// ============================================================================
// 8. 模板字面量类型 (Template Literal Types)
// ============================================================================

type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<'click'>; // 'onClick'

type CssValue = `${number}px` | `${number}%` | `${number}em`;

export function demoTemplateLiteralTypes(): void {
  console.log('\n=== 8. 模板字面量类型 ===');
  console.log('  EventName<"click"> = "onClick" (类型级字符串操作)');
  console.log('  CssValue = `${number}px | ${number}% | ${number}em`');
  console.log('  💡 JS 等价: 运行时正则表达式验证字符串格式');
}

// ============================================================================
// 9. keyof / typeof (类型级)
// ============================================================================

const config = { host: 'localhost', port: 3000 };
type ConfigKeys = keyof typeof config; // 'host' | 'port'

export function demoKeyofTypeof(): void {
  console.log('\n=== 9. keyof / typeof (类型级) ===');
  console.log('  keyof typeof config = "host" | "port"');
  console.log('  💡 注意: JS 也有 typeof 运算符，但返回 "string"/"number" 等，完全不同！');
  console.log(`     JS typeof config.host = "${typeof config.host}"`);
  console.log('     TS typeof config (类型级) = { host: string; port: number }');
}

// ============================================================================
// 10. 函数重载声明
// ============================================================================

function processInput(input: string): string;
function processInput(input: number): number;
function processInput(input: string | number): string | number {
  if (typeof input === 'string') return input.toUpperCase();
  return input * 2;
}

export function demoOverloads(): void {
  console.log('\n=== 10. 函数重载 ===');
  console.log(`  processInput("hello") = ${processInput('hello')}`);
  console.log(`  processInput(5) = ${processInput(5)}`);
  // 运行时只有最后一个实现签名存在
  console.log('  💡 JS 等价: 单一函数内手动 dispatch (typeof / instanceof)');
}

// ============================================================================
// 11. abstract class / abstract 方法
// ============================================================================

abstract class Animal {
  abstract makeSound(): void;
  move(): void {
    console.log('    moving...');
  }
}

// 运行时: abstract 完全擦除，生成普通 class
// new Animal(); // TS 编译错误，但编译后的 JS 允许（只是会抛运行时错误）

export function demoAbstract(): void {
  console.log('\n=== 11. abstract class ===');
  console.log('  abstract 修饰符运行时消失');
  console.log('  💡 JS 等价: 构造函数内检查 `if (new.target === Animal) throw new Error(...)`');
}

// ============================================================================
// 12. implements 子句
// ============================================================================

interface CanFly {
  fly(): void;
}

class Bird implements CanFly {
  fly(): void {
    console.log('    flying');
  }
}

// 运行时: implements 完全擦除
export function demoImplements(): void {
  console.log('\n=== 12. implements ===');
  const bird = new Bird();
  bird.fly();
  console.log('  implements 子句运行时消失');
  console.log('  💡 JS 等价: 运行时 duck typing — 只要对象有 fly 方法即可');
}

// ============================================================================
// 13. private / protected 访问修饰符
// ============================================================================

class BankAccount {
  private balance = 0;

  deposit(amount: number): void {
    this.balance += amount;
  }

  getBalance(): number {
    return this.balance;
  }
}

// 运行时: private 完全擦除！
export function demoAccessModifiers(): void {
  console.log('\n=== 13. private / protected ===');
  const account = new BankAccount();
  account.deposit(100);
  console.log(`  getBalance(): ${account.getBalance()}`);
  // console.log((account as any).balance); // 运行时完全可访问！
  console.log('  💡 JS 等价: 闭包变量 / WeakMap / #private 字段 (真正私有)');
}

// ============================================================================
// 14. readonly 修饰符
// ============================================================================

class ImmutablePoint {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export function demoReadonly(): void {
  console.log('\n=== 14. readonly ===');
  const p = new ImmutablePoint(1, 2);
  // p.x = 3; // TS 错误
  console.log(`  point: (${p.x}, ${p.y})`);
  console.log('  readonly 运行时消失');
  console.log('  💡 JS 等价: Object.defineProperty(this, "x", { writable: false })');
}

// ============================================================================
// 15. as const 断言
// ============================================================================

const tuple = [1, 2, 3] as const;
// 类型: readonly [1, 2, 3] — 字面量类型元组

const config2 = {
  api: 'https://api.example.com',
  timeout: 5000,
} as const;
// 类型: { readonly api: "https://api.example.com"; readonly timeout: 5000 }

export function demoAsConst(): void {
  console.log('\n=== 15. as const ===');
  console.log(`  tuple 运行时: [${tuple}] (普通数组)`);
  console.log('  💡 JS 等价: Object.freeze([1, 2, 3]) — 但 freeze 是运行时，as const 是类型级');
}

// ============================================================================
// 16. satisfies 运算符
// ============================================================================

const palette = {
  red: [255, 0, 0],
  green: [0, 255, 0],
  blue: [0, 0, 255],
} satisfies Record<string, [number, number, number]>;

// palette.red 保持 [number, number, number] 类型（而非宽泛的 number[]）

export function demoSatisfies(): void {
  console.log('\n=== 16. satisfies ===');
  console.log(`  palette.red: [${palette.red}]`);
  console.log('  satisfies 运行时完全消失');
  console.log('  💡 JS 等价: 运行时验证函数 assertShape(obj, schema)');
}

// ============================================================================
// 17. declare module / 环境声明
// ============================================================================

// declare module "some-untyped-lib" {
//   export function doSomething(): void;
// }

// 运行时: declare 不生成任何代码
export function demoAmbient(): void {
  console.log('\n=== 17. declare / ambient ===');
  console.log('  declare module 不生成任何 JS 代码');
  console.log('  💡 JS 等价: 无 — 这是纯类型声明');
}

// ============================================================================
// 18. 三斜线指令
// ============================================================================

// /// <reference types="node" />
// /// <reference path="./types.d.ts" />

export function demoTripleSlash(): void {
  console.log('\n=== 18. 三斜线指令 ===');
  console.log('  /// <reference ... /> 编译后完全消失');
  console.log('  💡 JS 等价: import 语句（但三斜线是编译期指令，非模块导入）');
}

// ============================================================================
// 主演示
// ============================================================================

export function demo(): void {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     TS-Only 编译时特性 — 运行时完全擦除的构造                ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  demoInterface();
  demoTypeAlias();
  demoUnionTypes();
  demoIntersectionTypes();
  demoConditionalTypes();
  demoInfer();
  demoMappedTypes();
  demoTemplateLiteralTypes();
  demoKeyofTypeof();
  demoOverloads();
  demoAbstract();
  demoImplements();
  demoAccessModifiers();
  demoReadonly();
  demoAsConst();
  demoSatisfies();
  demoAmbient();
  demoTripleSlash();

  console.log('\n✅ TS-Only 编译时特性演示完成');
  console.log('   核心结论: 这些特性在编译后完全消失，JS 引擎永远不会知道它们存在');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  demo();
}
