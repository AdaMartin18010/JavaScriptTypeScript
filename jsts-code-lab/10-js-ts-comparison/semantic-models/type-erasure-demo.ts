/**
 * @file 类型擦除演示器
 * @category JS/TS Comparison → Semantic Models
 * @difficulty medium
 * @tags type-erasure, compiler-semantics, ts-to-js
 *
 * @description
 * 模拟 TypeScript 的类型擦除（Type Erasure）保证。
 * 接收一段 TypeScript 风格代码字符串，输出擦除所有类型标注后的等价 JavaScript 代码。
 *
 * 规范对齐: TS Spec §2.2、tc39/proposal-type-annotations §Intentional Omissions
 */

/**
 * 模拟 TypeScript 编译器的类型擦除阶段。
 *
 * 擦除规则:
 * - 变量/参数/返回类型标注 → 删除
 * - `interface` / `type alias` → 删除
 * - 泛型参数 `<T>` → 删除
 * - `as` 类型断言 → 删除（保留表达式）
 * - `enum` / `namespace` / 参数属性 → **保留**（运行时生成代码）
 *
 * @param tsCode - 输入的 TypeScript 风格代码字符串
 * @returns 擦除类型后的 JavaScript 代码字符串
 */
export function eraseTypes(tsCode: string): string {
  let js = tsCode;

  // 1. 删除 interface 声明块（整块删除）
  js = js.replace(/(?:export\s+)?interface\s+\w+\s*(?:<[^>]+>)?\s*(?:extends\s+[\w,\s]+)?\s*\{[\s\S]*?\}\s*/g, '');

  // 2. 删除 type alias 声明（整块删除）
  js = js.replace(/(?:export\s+)?type\s+\w+\s*(?:<[^>]+>)?\s*=\s*[^;]+;?/g, '');

  // 3. 删除 `as` 类型断言，保留表达式
  js = js.replace(/\s+as\s+[A-Za-z0-9_$|&<>{}\[\]:?]+/g, '');

  // 4. 删除 implements 子句
  js = js.replace(/\bimplements\s+[A-Za-z0-9_$, ]+/g, '');

  // 5. 删除函数/方法返回类型标注
  js = js.replace(/(\)\s*):\s*[A-Za-z0-9_$|&<>{}\[\]:?]+\s*(\{|=>)/g, '$1 $2');

  // 6. 删除圆括号内的参数类型标注
  // 使用全局替换，逐个处理每一对圆括号
  js = js.replace(/\(([^()]*)\)/g, (match, params: string) => {
    // 在参数列表内部，类型标注从 `:` 开始，到下一个 `,` 或字符串末尾结束
    const cleaned = params.replace(/([a-zA-Z0-9_$]+)\s*:\s*[^,)]+/g, '$1');
    return `(${cleaned})`;
  });

  // 7. 删除变量声明中的类型标注
  js = js.replace(/\b(let|const|var)\s+([a-zA-Z0-9_$]+)\s*:\s*[A-Za-z0-9_$|&<>{}\[\]:?]+(\s*[=;])/g, '$1 $2$3');

  // 8. 删除类属性类型标注（分号结尾）
  js = js.replace(/([a-zA-Z0-9_$]+)\s*:\s*[A-Za-z0-9_$|&<>{}\[\]:?]+(;)/g, '$1$2');

  // 9. 删除泛型参数
  js = js.replace(/([a-zA-Z0-9_$]+)\s*<[^>]+>(\s*\()/g, '$1$2');

  // 10. 清理多余的空行
  js = js.replace(/\n{3,}/g, '\n\n');

  return js.trim();
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  const tsCode = `
interface User {
  name: string;
  age: number;
}

type ID = string | number;

function greet<T>(user: User): string {
  return (user.name as string).toUpperCase();
}

enum Role {
  Admin = 1,
  User = 2,
}

class Person {
  constructor(public name: string) {}
}
`;

  console.log('=== TypeScript 源码 ===');
  console.log(tsCode);
  console.log('=== 擦除类型后的 JavaScript ===');
  console.log(eraseTypes(tsCode));
}
