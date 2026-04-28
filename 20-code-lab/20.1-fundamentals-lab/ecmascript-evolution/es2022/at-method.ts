/**
 * @file ES2022 at() 方法
 * @category ECMAScript Evolution → ES2022
 * @difficulty easy
 * @tags es2022, array, string, index-access
 */

// ============================================================================
// 1. 数组的 at() 方法
// ============================================================================

const arr = ['a', 'b', 'c', 'd', 'e'];

// 传统方式获取最后一个元素
const lastTraditional = arr[arr.length - 1]; // 'e'

// 使用 at() - 支持负索引
const lastAt = arr.at(-1); // 'e'
const secondLast = arr.at(-2); // 'd'
const first = arr.at(0); // 'a'
const outOfBounds = arr.at(100); // undefined

// ============================================================================
// 2. 字符串的 at() 方法
// ============================================================================

const str = 'Hello, World!';

const lastChar = str.at(-1); // '!'
const secondLastChar = str.at(-2); // 'd'

// ============================================================================
// 3. 与方括号访问的对比
// ============================================================================

function compareAccessMethods() {
  const arr = [10, 20, 30, 40, 50];

  // 正索引：行为相同
  console.log(arr[0], arr.at(0)); // 10, 10
  console.log(arr[2], arr.at(2)); // 30, 30

  // 负索引：at() 支持，方括号不支持
  console.log(arr[-1]); // undefined (不是最后一个！)
  console.log(arr.at(-1)); // 50 (最后一个)

  // 越界访问
  console.log(arr[100]); // undefined
  console.log(arr.at(100)); // undefined

  // 非整数索引
  console.log(arr[1.5]); // undefined
  console.log(arr.at(1.5)); // 20 (转换为整数 1)
}

// ============================================================================
// 4. 实际应用场景
// ============================================================================

// 获取文件扩展名
function getFileExtension(filename: string): string | undefined {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1) return undefined;
  return filename.slice(lastDotIndex);
}

// 简化版本使用 at()
function getFileExtensionSimple(filename: string): string | undefined {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts.at(-1)}` : undefined;
}

// 获取路径的最后一部分
function getLastPathSegment(path: string): string {
  const segments = path.split('/').filter(Boolean);
  return segments.at(-1) || '';
}

// 获取数组的最后一个 N 个元素
function takeLast<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

// 使用 at() 获取倒数第 N 个
function getNthFromEnd<T>(arr: T[], n: number): T | undefined {
  return arr.at(-n);
}

// ============================================================================
// 5. 与 slice 的结合
// ============================================================================

function removeLast<T>(arr: T[]): T[] {
  return arr.slice(0, -1);
}

function removeFirst<T>(arr: T[]): T[] {
  return arr.slice(1);
}

// 获取除了最后一个的所有元素
function allButLast<T>(arr: T[]): T[] {
  return arr.slice(0, -1);
}

// 获取除了第一个的所有元素
function allButFirst<T>(arr: T[]): T[] {
  return arr.slice(1);
}

// ============================================================================
// 6. TypeScript 类型支持
// ============================================================================

// at() 可能返回 undefined
function safeAt<T>(arr: T[], index: number): T | undefined {
  return arr.at(index);
}

// 使用非空断言（如果确定索引有效）
function unsafeAt<T>(arr: T[], index: number): T {
  return arr.at(index)!;
}

// ============================================================================
// 导出
// ============================================================================

export {
  getFileExtension,
  getFileExtensionSimple,
  getLastPathSegment,
  takeLast,
  getNthFromEnd,
  removeLast,
  removeFirst,
  allButLast,
  allButFirst,
  safeAt,
  unsafeAt
};
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Array.at() Demo ===");
  
  const arr = ["a", "b", "c", "d", "e"];
  
  // 正索引
  console.log("First element:", arr.at(0));
  console.log("Third element:", arr.at(2));
  
  // 负索引
  console.log("Last element:", arr.at(-1));
  console.log("Second last:", arr.at(-2));
  
  // 字符串
  const str = "Hello, World!";
  console.log("Last char:", str.at(-1));
  console.log("First char:", str.at(0));
  
  // 获取文件扩展名
  const filename = "document.pdf";
  const ext = getFileExtensionSimple(filename);
  console.log(`Extension of ${filename}:`, ext);
  
  // 获取路径最后部分
  const path = "/home/user/documents/file.txt";
  console.log("Last path segment:", getLastPathSegment(path));
  
  console.log("=== End of Demo ===\n");
}
