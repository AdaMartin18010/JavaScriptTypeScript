/**
 * @file 动态导入示例用的 math 模块
 */

export const add = (a: number, b: number): number => a + b;
export const PI = 3.14159;
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Dynamic Import Math Demo ===");
  
  // 基础运算
  console.log("Add 2 + 3:", add(2, 3));
  console.log("PI value:", PI);
  
  // 使用导出的常量
  const radius = 5;
  const area = PI * radius * radius;
  console.log(`Circle area (r=${radius}):`, area);
  
  console.log("=== End of Demo ===\n");
}
