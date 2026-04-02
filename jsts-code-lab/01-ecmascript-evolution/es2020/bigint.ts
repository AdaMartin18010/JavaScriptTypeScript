/**
 * @file BigInt 任意精度整数
 * @category ECMAScript Evolution → ES2020
 * @difficulty easy
 * @tags es2020, bigint, precision, math
 */

// ============================================================================
// 1. 创建 BigInt
// ============================================================================

/** 字面量 */
const big1 = 9007199254740991n;

/** 构造函数 */
const big2 = BigInt(9007199254740991);
const big3 = BigInt('9007199254740991999');

// ============================================================================
// 2. 精度对比
// ============================================================================

const maxSafe = Number.MAX_SAFE_INTEGER; // 9007199254740991

console.log('Number.MAX_SAFE_INTEGER:', maxSafe);
console.log('maxSafe + 1:', maxSafe + 1);
console.log('maxSafe + 2:', maxSafe + 2);
console.log('Are they equal?', maxSafe + 1 === maxSafe + 2); // true!

const bigMax = 9007199254740991n;
console.log('BigInt + 1n:', bigMax + 1n);
console.log('BigInt + 2n:', bigMax + 2n);
console.log('Are they equal?', bigMax + 1n === bigMax + 2n); // false

// ============================================================================
// 3. 运算
// ============================================================================

const a = 100n;
const b = 20n;

console.log('Addition:', a + b); // 120n
console.log('Subtraction:', a - b); // 80n
console.log('Multiplication:', a * b); // 2000n
console.log('Division:', a / b); // 5n (整数除法)
console.log('Remainder:', a % b); // 0n
console.log('Exponentiation:', a ** 3n); // 1000000n

// ============================================================================
// 4. 比较
// ============================================================================

console.log('10n > 5n:', 10n > 5n); // true
console.log('10n === 10n:', 10n === 10n); // true
// @ts-expect-error 演示 BigInt 与 Number 的宽松相等
console.log('10n == 10:', 10n == 10); // true (宽松相等)
// console.log(10n === 10); // false (严格不相等，类型不同)

// ============================================================================
// 5. 限制
// ============================================================================

/** 不能与 Number 混合运算 */
// 10n + 5; // ❌ Error

/** 不能用于 Math 方法 */
// Math.max(10n, 20n); // ❌ Error

/** JSON 序列化 */
const data = { bigValue: 100n };
// JSON.stringify(data); // ❌ TypeError

/** 自定义 JSON 处理 */
const json = JSON.stringify(data, (_key, value) =>
  typeof value === 'bigint' ? value.toString() + 'n' : value
);
console.log(json);

// ============================================================================
// 6. 实用工具
// ============================================================================

/** BigInt 与 Number 安全转换 */
function bigintToNumber(n: bigint): number | bigint {
  if (n <= BigInt(Number.MAX_SAFE_INTEGER) && n >= BigInt(Number.MIN_SAFE_INTEGER)) {
    return Number(n);
  }
  return n; // 超出安全范围，保持 BigInt
}

/** 格式化大数字 */
function formatBigInt(n: bigint): string {
  return n.toLocaleString('zh-CN');
}

console.log(formatBigInt(12345678901234567890n));

// ============================================================================
// 导出
// ============================================================================

export { bigintToNumber, formatBigInt };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== BigInt Demo ===");
  
  // 创建 BigInt
  const big1 = 9007199254740991n;
  const big2 = BigInt(123);
  console.log("BigInt literal:", big1);
  console.log("BigInt constructor:", big2);
  
  // 运算
  console.log("100n + 20n:", 100n + 20n);
  console.log("100n * 3n:", 100n * 3n);
  console.log("100n ** 3n:", 100n ** 3n);
  
  // 转换
  const num = bigintToNumber(100n);
  console.log("Converted to number:", num);
  
  // 格式化
  console.log("Formatted:", formatBigInt(12345678901234567890n));
  
  console.log("=== End of Demo ===\n");
}
