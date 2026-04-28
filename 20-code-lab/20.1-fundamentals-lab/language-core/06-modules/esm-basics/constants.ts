/**
 * @file 常量定义
 */

export const PI = Math.PI;
export const E = Math.E;
export const SQRT2 = Math.SQRT2;
export const MAX_VALUE = Number.MAX_VALUE;
export const MIN_VALUE = Number.MIN_VALUE;
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== ESM Constants Demo ===");
  
  console.log("PI:", PI);
  console.log("E:", E);
  console.log("SQRT2:", SQRT2);
  console.log("MAX_VALUE:", MAX_VALUE);
  console.log("MIN_VALUE:", MIN_VALUE);
  
  // 计算圆的面积
  const radius = 10;
  const area = PI * radius * radius;
  console.log(`Circle area (r=${radius}):`, area);
  
  console.log("=== End of Demo ===\n");
}
