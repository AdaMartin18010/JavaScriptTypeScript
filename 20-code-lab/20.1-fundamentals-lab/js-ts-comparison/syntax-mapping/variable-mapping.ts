/**
 * @file 变量声明映射：JavaScript → TypeScript
 * @description 展示 JS 动态变量声明与 TS 静态类型声明的并排对比
 * @aligns ECMA-262 §13.3, TypeScript Spec §3.1
 */

// ============================================================================
// JS Version: 完全动态，无编译时类型约束
// ============================================================================

let jsValue: any = 42;
jsValue = "hello"; // 运行时合法

function jsGreet(name: any): any {
  // 在纯 JS 中无类型标注，此处仅用于演示动态特性
  return "Hello, " + name;
}

// ============================================================================
// TS Version: 编译时类型约束，擦除后生成的 JS 与上方完全一致
// ============================================================================

const tsValue = 42;
// tsValue = "hello"; // 编译错误：Type 'string' is not assignable to type 'number'.

function tsGreet(name: string): string {
  return `Hello, ${name}`;
}

// 类型推断：不写标注时，TS 自动推断类型
const inferredNumber = 42; // inferred as number
const inferredString = "hello"; // inferred as string

// const 断言：将类型收窄到最窄的字面量类型
const literalValue = 42 as const; // type: 42 (not number)
const tupleValue = [1, 2, 3] as const; // type: readonly [1, 2, 3]

// unknown vs any：更安全的顶层类型
const safeUnknown: unknown = fetchSomeData();
// safeUnknown.toUpperCase(); // 编译错误！必须先窄化
if (typeof safeUnknown === "string") {
  safeUnknown.toUpperCase(); // 在类型守卫块内可用
}

// 辅助函数占位
function fetchSomeData(): unknown {
  return "data";
}

export { jsValue, tsValue, inferredNumber, inferredString, literalValue, tupleValue };
