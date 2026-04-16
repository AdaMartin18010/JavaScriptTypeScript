/**
 * @file 渐进类型边界演示器
 * @category JS/TS Comparison → Semantic Models
 * @difficulty medium
 * @tags gradual-typing, runtime-check, type-boundary, soundness
 *
 * @description
 * 在 typed/untyped 边界模拟运行时一致性检查。
 * 演示 Gradual Typing 的核心行为：unknown → T 需要窄化，any → T 可隐式转换。
 *
 * 规范对齐: Siek & Taha (2006) Consistency Relation、GRADUAL_TYPING_THEORY.md §5
 */

export class RuntimeTypeChecker {
  /**
   * 在 typed/untyped 边界执行运行时类型检查。
   *
   * @param value - 待检查的值
   * @param expectedType - 期望的类型描述字符串
   * @throws TypeError 当运行时检查失败时抛出
   *
   * 支持的 expectedType 格式:
   * - 原始类型: "string", "number", "boolean"
   * - 数组: "array", "string[]", "number[]"
   * - 对象: "object"
   */
  static check<T>(value: unknown, expectedType: string): asserts value is T {
    if (!this.shallowMatch(value, expectedType)) {
      throw new TypeError(
        `运行时类型检查失败: 期望 ${expectedType}, 实际得到 ${this.describeValue(value)}`
      );
    }
  }

  /**
   * 为值附加一个浅层类型标签（用于教学演示）。
   */
  static shallowTag(value: unknown, type: string): { value: unknown; __tag: string } {
    return { value, __tag: type };
  }

  /**
   * 执行浅层运行时类型匹配。
   */
  private static shallowMatch(value: unknown, expectedType: string): boolean {
    const trimmed = expectedType.trim();

    // 原始类型
    switch (trimmed) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'undefined':
        return typeof value === 'undefined';
      case 'null':
        return value === null;
      case 'symbol':
        return typeof value === 'symbol';
      case 'bigint':
        return typeof value === 'bigint';
      case 'function':
        return typeof value === 'function';
      case 'object':
        return typeof value === 'object' && value !== null;
      case 'array':
        return Array.isArray(value);
    }

    // 数组泛型: string[], number[]
    const arrayMatch = trimmed.match(/^(.+)\[\]$/);
    if (arrayMatch) {
      if (!Array.isArray(value)) return false;
      const elementType = arrayMatch[1];
      // 浅层检查：仅验证每个元素都是该原始类型
      return (value as unknown[]).every((item) => this.shallowMatch(item, elementType));
    }

    // 对象结构浅查: {name:string,age:number}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      if (typeof value !== 'object' || value === null) return false;
      const inner = trimmed.slice(1, -1);
      const pairs = inner.split(',').map((s) => s.trim()).filter(Boolean);
      for (const pair of pairs) {
        const [k, v] = pair.split(':').map((s) => s.trim());
        if (!k || !v) continue;
        const obj = value as Record<string, unknown>;
        if (!(k in obj)) return false;
        if (!this.shallowMatch(obj[k], v)) return false;
      }
      return true;
    }

    // 默认未知类型视为通过（与 unknown 语义对齐）
    return true;
  }

  private static describeValue(value: unknown): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
  }
}

/**
 * 模拟 `unknown` 到具体类型需要显式窄化的语义。
 *
 * 在真实 TypeScript 中，以下代码在编译时会报错：
 *   const u: unknown = 'hello';
 *   const s: string = u; // Error: Type 'unknown' is not assignable to type 'string'.
 *
 * 我们的运行时演示器通过 `RuntimeTypeChecker.check` 模拟这一窄化步骤。
 */
export function narrowUnknownToString(u: unknown): string {
  RuntimeTypeChecker.check<string>(u, 'string');
  return u; // 经过断言后，u 被窄化为 string
}

/**
 * 模拟 `any` 可以隐式转换为任何类型的语义。
 *
 * 在真实 TypeScript 中：
 *   const a: any = 42;
 *   const s: string = a; // 编译通过（但运行时不安全）
 *
 * 我们的演示器展示：任何值都可以被"信任"为任何类型，
 * 这体现了 `any` 的 unsound 特性。
 */
export function castAnyToType<T>(_value: unknown, _typeHint: string): T {
  // any 的语义：完全绕过检查
  return _value as T;
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 渐进类型边界演示 ===\n');

  // 1. unknown → string 需要运行时窄化
  const raw: unknown = 'hello';
  try {
    const narrowed = narrowUnknownToString(raw);
    console.log('✓ unknown 窄化成功:', narrowed);
  } catch (e) {
    console.log('✗ 窄化失败:', (e as Error).message);
  }

  // 2. any 隐式转换（unsound）
  const dangerous: unknown = 42;
  const casted = castAnyToType<string>(dangerous, 'string');
  console.log('⚠ any 隐式转换结果:', casted, '(运行时类型实际上是 number)');

  // 3. 数组边界检查
  const arr = [1, 2, 3];
  try {
    RuntimeTypeChecker.check<number[]>(arr, 'number[]');
    console.log('✓ number[] 检查通过');
  } catch (e) {
    console.log('✗ 数组检查失败:', (e as Error).message);
  }

  // 4. 对象边界检查
  const obj = { name: 'Alice', age: 30 };
  try {
    RuntimeTypeChecker.check<{ name: string; age: number }>(obj, '{name:string,age:number}');
    console.log('✓ 对象结构检查通过');
  } catch (e) {
    console.log('✗ 对象检查失败:', (e as Error).message);
  }
}
