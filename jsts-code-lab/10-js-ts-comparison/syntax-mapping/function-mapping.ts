/**
 * @file 函数映射：JavaScript → TypeScript
 * @description 展示 JS 函数与 TS 函数（含泛型、重载、this 类型、类型守卫）的映射
 * @aligns ECMA-262 §10.2, TypeScript Spec §6
 */

// ============================================================================
// JS Version: 动态参数与返回值
// ============================================================================

function jsAdd(a: any, b: any) {
  return a + b;
}

const jsIdentity = (x: any) => x;

function jsGreet(greeting: any, name: any) {
  // greeting 和 name 均无类型约束
  return `${greeting}, ${name}`;
}

// ============================================================================
// TS Version: 静态类型约束 + 泛型 + 类型守卫 + 断言函数
// ============================================================================

// 1. 基本函数：参数与返回类型标注
function tsAdd(a: number, b: number): number {
  return a + b;
}

// 2. 泛型函数：保持多态性同时获得类型安全
function tsIdentity<T>(x: T): T {
  return x;
}

// 3. 可选参数与默认参数
function tsGreet(greeting: string, name?: string): string {
  return `${greeting}, ${name ?? "Guest"}`;
}

// 4. this 参数：仅用于类型检查，编译后擦除
interface Point {
  x: number;
  y: number;
}

function tsDistance(this: Point, p: Point): number {
  const dx = p.x - this.x;
  const dy = p.y - this.y;
  return Math.sqrt(dx ** 2 + dy ** 2);
}

// 5. 函数重载：编译时多态，运行时无额外开销
function processInput(input: string): string;
function processInput(input: number): number;
function processInput(input: string | number): string | number {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  return input * 2;
}

// 6. 用户自定义类型守卫（Type Predicate）
interface Fish {
  swim(): void;
}
interface Bird {
  fly(): void;
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}

// 7. 断言函数（Assertion Functions）
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError("Expected string");
  }
}

export { tsAdd, tsIdentity, tsGreet, tsDistance, processInput, isFish, assertIsString };
