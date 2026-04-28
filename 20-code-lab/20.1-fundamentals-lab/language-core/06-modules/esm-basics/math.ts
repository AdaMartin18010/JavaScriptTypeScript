/**
 * @file 数学工具模块
 */

export const add = (a: number, b: number): number => a + b;
export const subtract = (a: number, b: number): number => a - b;
export const multiply = (a: number, b: number): number => a * b;
export const divide = (a: number, b: number): number => {
  if (b === 0) throw new Error('Division by zero');
  return a / b;
};

export default {
  add,
  subtract,
  multiply,
  divide
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== ESM Math Module Demo ===");
  
  console.log("Add 10 + 5:", add(10, 5));
  console.log("Subtract 10 - 5:", subtract(10, 5));
  console.log("Multiply 10 * 5:", multiply(10, 5));
  console.log("Divide 10 / 5:", divide(10, 5));
  
  // 复合运算
  const result = divide(multiply(add(2, 3), subtract(10, 5)), 5);
  console.log("Complex (2+3)*(10-5)/5:", result);
  
  console.log("=== End of Demo ===\n");
}
