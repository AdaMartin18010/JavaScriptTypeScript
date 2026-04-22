// @ts-nocheck

/**
 * @file 短路逻辑与逻辑运算符
 * @category Language Core → Control Flow
 * @difficulty warm
 * @tags short-circuit, logical-operators, nullish-coalescing, assignment-operators
 *
 * @description
 * 演示 `&&`、`||`、`??` 的短路求值语义，以及 `&&=`、`||=`、`??=` 赋值运算符。
 * 重点对比 `||` 与 `??` 在 falsy-but-valid 值（0、""、false）上的差异。
 */

// ============================================================================
// 1. 基础短路语义
// ============================================================================

/** `&&`：左操作数 falsy 时短路，返回左操作数 */
function demoAnd(): void {
  const result1 = 0 && 'right';
  const result2 = 'hello' && 'right';
  console.log('0 && "right":', result1); // 0
  console.log('"hello" && "right":', result2); // "right"
}

/** `||`：左操作数 truthy 时短路，返回左操作数 */
function demoOr(): void {
  const result1 = 'hello' || 'default';
  const result2 = 0 || 'default';
  console.log('"hello" || "default":', result1); // "hello"
  console.log('0 || "default":', result2); // "default"
}

/** `??`：左操作数非 null/undefined 时短路，返回左操作数 */
function demoNullish(): void {
  const result1 = 0 ?? 'default';
  const result2 = '' ?? 'default';
  const result3 = false ?? 'default';
  const result4 = null ?? 'default';
  const result5 = undefined ?? 'default';
  console.log('0 ?? "default":', result1); // 0
  console.log('"" ?? "default":', result2); // ""
  console.log('false ?? "default":', result3); // false
  console.log('null ?? "default":', result4); // "default"
  console.log('undefined ?? "default":', result5); // "default"
}

// ============================================================================
// 2. 正例：合理选择运算符
// ============================================================================

/** ✅ 使用 `??` 保护有效的 falsy 值 */
function configurePort(userPort?: number): number {
  return userPort ?? 3000; // 允许 port = 0
}

/** ✅ 使用 `||` 处理布尔标志（需要所有 falsy 都回退） */
function enableFeature(flag?: boolean): boolean {
  return flag || false; // flag 为 undefined/false/0/"" 时都返回 false
}

/** ✅ 使用 `&&` 进行条件执行 */
function conditionalLog(condition: boolean, message: string): void {
  condition && console.log('[LOG]', message);
}

// ============================================================================
// 3. 反例：运算符误用（?? vs ||）
// ============================================================================

/** ❌ 反例：使用 `||` 导致 0 被意外替换为默认值 */
function badWithOr(count: number | undefined): number {
  // 当 count 为 0 时，|| 会将其视为 falsy，返回 10
  return count || 10;
}

/** ✅ 正例：使用 `??` 仅对 null/undefined 回退 */
function goodWithNullish(count: number | undefined): number {
  return count ?? 10; // count = 0 时保持 0
}

/** 演示反例差异 */
function demoOrVsNullishTrap(): void {
  console.log('\n--- ?? vs || 反例对比 ---');
  console.log('badWithOr(0):', badWithOr(0)); // ❌ 输出 10（意外！）
  console.log('goodWithNullish(0):', goodWithNullish(0)); // ✅ 输出 0

  console.log('badWithOr(""):', badWithOr('' as unknown as number | undefined)); // 语法上可能，逻辑上错误
  console.log('goodWithNullish(null):', goodWithNullish(null)); // 输出 10（正确）
}

// ============================================================================
// 4. 短路求值的副作用控制
// ============================================================================

let sideEffectCount = 0;

function sideEffect(): string {
  sideEffectCount++;
  return 'side-effect-result';
}

/** 演示短路导致副作用不执行 */
function demoShortCircuitSideEffects(): void {
  sideEffectCount = 0;

  // && 短路：左操作数 falsy，右操作数不求值
  const r1 = false && sideEffect();
  console.log('\n--- 短路副作用 ---');
  console.log('false && sideEffect():', r1, '| sideEffectCount:', sideEffectCount); // 0

  // || 短路：左操作数 truthy，右操作数不求值
  const r2 = true || sideEffect();
  console.log('true || sideEffect():', r2, '| sideEffectCount:', sideEffectCount); // 0

  // ?? 短路：左操作数非 nullish，右操作数不求值
  const r3 = 0 ?? sideEffect();
  console.log('0 ?? sideEffect():', r3, '| sideEffectCount:', sideEffectCount); // 0
}

// ============================================================================
// 5. 逻辑赋值运算符（ES2021）
// ============================================================================

/** ✅ `&&=`：仅当左操作数 truthy 时赋值 */
function demoAndAssign(): void {
  let a: string | undefined = 'hello';
  a &&= 'world'; // a 为 truthy，执行赋值
  console.log('\n--- 逻辑赋值运算符 ---');
  console.log('"hello" &&= "world":', a); // "world"

  let b: string | undefined = undefined;
  b &&= 'world'; // b 为 falsy，不赋值
  console.log('undefined &&= "world":', b); // undefined
}

/** ✅ `||=`：仅当左操作数 falsy 时赋值 */
function demoOrAssign(): void {
  let a = '';
  a ||= 'default'; // a 为 falsy，执行赋值
  console.log('"" ||= "default":', a); // "default"

  let b = 'hello';
  b ||= 'default'; // b 为 truthy，不赋值
  console.log('"hello" ||= "default":', b); // "hello"
}

/** ✅ `??=`：仅当左操作数为 null/undefined 时赋值 */
function demoNullishAssign(): void {
  let a: number | undefined = 0;
  a ??= 100; // a 非 null/undefined，不赋值
  console.log('0 ??= 100:', a); // 0

  let b: number | undefined = undefined;
  b ??= 100; // b 为 undefined，执行赋值
  console.log('undefined ??= 100:', b); // 100
}

/** ❌ 反例：用 `||=` 误覆盖有效的 0 或 "" */
function badNullishAssign(value: string | undefined): string {
  let result = value;
  // result ||= 'fallback'; // ❌ 若 result 为 ""，会被替换
  result ??= 'fallback'; // ✅ 仅对 null/undefined 回退
  return result;
}

// ============================================================================
// 6. 优先级与括号
// ============================================================================

/** `??` 和 `||` 混合使用需括号 */
function demoPrecedence(): void {
  const a = null;
  const b = 'fallback';
  const c = 'backup';

  // ?? 和 || 优先级相同，不能无括号混用（TS 会报错）
  // const wrong = a ?? b || c; // ❌ SyntaxError
  const correct = a ?? (b || c); // ✅ 使用括号明确优先级
  console.log('\n--- 优先级 ---');
  console.log('null ?? ("fallback" || "backup"):', correct); // "fallback"
}

// ============================================================================
// 导出
// ============================================================================

export {
  demoAnd,
  demoOr,
  demoNullish,
  configurePort,
  enableFeature,
  conditionalLog,
  badWithOr,
  goodWithNullish,
  demoShortCircuitSideEffects,
  demoAndAssign,
  demoOrAssign,
  demoNullishAssign,
  badNullishAssign,
  demoPrecedence
};

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log('=== Short-Circuit Logical Operators Demo ===\n');

  demoAnd();
  demoOr();
  demoNullish();

  console.log('\n--- 正例：配置默认值 ---');
  console.log('configurePort(undefined):', configurePort(undefined)); // 3000
  console.log('configurePort(0):', configurePort(0)); // 0
  console.log('configurePort(8080):', configurePort(8080)); // 8080

  console.log('\n--- 正例：条件执行 ---');
  conditionalLog(true, 'This will log');
  conditionalLog(false, 'This will NOT log');

  demoOrVsNullishTrap();
  demoShortCircuitSideEffects();
  demoAndAssign();
  demoOrAssign();
  demoNullishAssign();

  console.log('\n--- 反例：??= vs ||= ---');
  console.log('badNullishAssign(""):', JSON.stringify(badNullishAssign(''))); // ""
  console.log('badNullishAssign(undefined):', JSON.stringify(badNullishAssign(undefined))); // "fallback"

  demoPrecedence();

  console.log('\n=== End of Demo ===\n');
}
