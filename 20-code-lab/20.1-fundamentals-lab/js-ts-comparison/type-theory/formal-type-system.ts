/**
 * @file 类型系统的形式化论证
 * @category JS/TS Comparison → Type Theory
 * @difficulty hard
 * @tags type-theory, formal-verification, type-safety, soundness
 *
 * @description
 * TypeScript 类型系统的形式化说明与论证：
 * - 类型判断 (Type Judgments): Γ ⊢ e : τ
 * - 类型健全性 (Type Soundness)
 * - 渐进类型 (Gradual Typing)
 * - 类型擦除与保留
 */

import 'reflect-metadata';

// ============================================================================
// 1. 类型判断的形式化表示
// ============================================================================

/**
 * 类型判断: Γ ⊢ e : τ
 * 在上下文 Γ 中，表达式 e 具有类型 τ
 *
 * 示例:
 * - ∅ ⊢ 42 : number (空上下文中，42 是 number 类型)
 * - x:number ⊢ x + 1 : number (x 是 number 时，x+1 也是 number)
 */

type PrimitiveName = 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'symbol' | 'bigint';

// 上下文 (Context) 的形式化表示
export type TypeContext = Record<string, TypeAnnotation>;

export type TypeAnnotation =
  | { kind: 'primitive'; name: PrimitiveName }
  | { kind: 'object'; properties: Record<string, TypeAnnotation> }
  | { kind: 'function'; params: TypeAnnotation[]; returnType: TypeAnnotation }
  | { kind: 'union'; types: TypeAnnotation[] }
  | { kind: 'intersection'; types: TypeAnnotation[] }
  | { kind: 'generic'; name: string; constraints?: TypeAnnotation }
  | { kind: 'array'; elementType: TypeAnnotation }
  | { kind: 'tuple'; elementTypes: TypeAnnotation[] }
  | { kind: 'never' }
  | { kind: 'unknown' };

// 类型判断规则实现
export class TypeChecker {
  private context: TypeContext = {};

  // 变量声明规则: Γ, x:τ ⊢ x:τ
  declareVariable(name: string, type: TypeAnnotation): void {
    this.context[name] = type;
  }

  // 变量查找规则
  lookupVariable(name: string): TypeAnnotation | undefined {
    return this.context[name];
  }

  // 公开的递归类型相等判断（用于演示与外部一致性检查）
  equals(t1: TypeAnnotation, t2: TypeAnnotation): boolean {
    return this.typesEqual(t1, t2);
  }

  // 子类型关系: τ₁ <: τ₂ (τ₁ 是 τ₂ 的子类型)
  isSubtype(sub: TypeAnnotation, sup: TypeAnnotation): boolean {
    // 自反性: τ <: τ
    if (this.typesEqual(sub, sup)) return true;

    // Bottom type: never <: T
    if (sub.kind === 'never') return true;

    // Top type: T <: unknown
    if (sup.kind === 'unknown') return true;

    // T <: (A | B)  iff  T <: A 或 T <: B
    if (sup.kind === 'union') {
      return sup.types.some((t) => this.isSubtype(sub, t));
    }

    // T <: (A & B)  iff  T <: A 且 T <: B
    if (sup.kind === 'intersection') {
      return sup.types.every((t) => this.isSubtype(sub, t));
    }

    // 基本子类型规则
    switch (sub.kind) {
      case 'primitive':
        return sup.kind === 'primitive' && sub.name === sup.name;

      case 'function':
        if (sup.kind !== 'function') return false;
        return (
          sub.params.length === sup.params.length &&
          this.isContravariantInParams(sub.params, sup.params) &&
          this.isSubtype(sub.returnType, sup.returnType)
        );

      case 'object':
        if (sup.kind !== 'object') return false;
        return this.isStructuralSubtype(sub.properties, sup.properties);

      case 'union':
        // 分配性: (A | B) <: C 当且仅当 A <: C 且 B <: C
        return sub.types.every((t) => this.isSubtype(t, sup));

      case 'intersection':
        // 简化版: (A & B) <: C 当且仅当 A <: C 或 B <: C
        return sub.types.some((t) => this.isSubtype(t, sup));

      case 'array':
        return sup.kind === 'array' && this.isSubtype(sub.elementType, sup.elementType);

      case 'tuple':
        if (sup.kind === 'tuple') {
          if (sub.elementTypes.length !== sup.elementTypes.length) return false;
          return sub.elementTypes.every((et, i) => this.isSubtype(et, sup.elementTypes[i]));
        }
        if (sup.kind === 'array') {
          return sub.elementTypes.every((et) => this.isSubtype(et, sup.elementType));
        }
        return false;

      case 'generic':
        if (sup.kind !== 'generic') return false;
        if (sub.name !== sup.name) return false;
        if (sub.constraints === undefined && sup.constraints === undefined) return true;
        if (sub.constraints === undefined || sup.constraints === undefined) return false;
        return this.isSubtype(sub.constraints, sup.constraints);

      case 'unknown':
        // unknown 只能自反（已在前文处理）
        return false;

      default:
        return false;
    }
  }

  private typesEqual(t1: TypeAnnotation, t2: TypeAnnotation): boolean {
    if (t1.kind !== t2.kind) return false;

    switch (t1.kind) {
      case 'primitive':
        return t1.name === (t2 as { kind: 'primitive'; name: PrimitiveName }).name;

      case 'object': {
        const t2Obj = t2 as { kind: 'object'; properties: Record<string, TypeAnnotation> };
        const entries1 = Object.entries(t1.properties);
        const entries2 = Object.entries(t2Obj.properties);
        if (entries1.length !== entries2.length) return false;
        entries1.sort((a, b) => a[0].localeCompare(b[0]));
        entries2.sort((a, b) => a[0].localeCompare(b[0]));
        for (let i = 0; i < entries1.length; i++) {
          if (entries1[i][0] !== entries2[i][0]) return false;
          if (!this.typesEqual(entries1[i][1], entries2[i][1])) return false;
        }
        return true;
      }

      case 'function': {
        const t2Fn = t2 as { kind: 'function'; params: TypeAnnotation[]; returnType: TypeAnnotation };
        if (t1.params.length !== t2Fn.params.length) return false;
        return (
          t1.params.every((p, i) => this.typesEqual(p, t2Fn.params[i])) &&
          this.typesEqual(t1.returnType, t2Fn.returnType)
        );
      }

      case 'union':
      case 'intersection':
        return this.typeSetEqual(
          t1.types,
          (t2 as { kind: typeof t1.kind; types: TypeAnnotation[] }).types
        );

      case 'generic': {
        const t2Gen = t2 as { kind: 'generic'; name: string; constraints?: TypeAnnotation };
        if (t1.name !== t2Gen.name) return false;
        if (t1.constraints === undefined && t2Gen.constraints === undefined) return true;
        if (t1.constraints === undefined || t2Gen.constraints === undefined) return false;
        return this.typesEqual(t1.constraints, t2Gen.constraints);
      }

      case 'array':
        return this.typesEqual(
          t1.elementType,
          (t2 as { kind: 'array'; elementType: TypeAnnotation }).elementType
        );

      case 'tuple': {
        const t2Tuple = t2 as { kind: 'tuple'; elementTypes: TypeAnnotation[] };
        if (t1.elementTypes.length !== t2Tuple.elementTypes.length) return false;
        return t1.elementTypes.every((et, i) => this.typesEqual(et, t2Tuple.elementTypes[i]));
      }

      case 'never':
      case 'unknown':
        return true;

      default:
        return false;
    }
  }

  private typeSetEqual(a: readonly TypeAnnotation[], b: readonly TypeAnnotation[]): boolean {
    if (a.length !== b.length) return false;
    const used = new Array<boolean>(b.length).fill(false);
    for (const ta of a) {
      let found = false;
      for (let i = 0; i < b.length; i++) {
        if (!used[i] && this.typesEqual(ta, b[i])) {
          used[i] = true;
          found = true;
          break;
        }
      }
      if (!found) return false;
    }
    return true;
  }

  private isContravariantInParams(sub: TypeAnnotation[], sup: TypeAnnotation[]): boolean {
    if (sub.length !== sup.length) return false;
    // 参数位置逆变: sup[i] <: sub[i]
    return sub.every((s, i) => this.isSubtype(sup[i], s));
  }

  private isStructuralSubtype(
    subProps: Record<string, TypeAnnotation>,
    supProps: Record<string, TypeAnnotation>
  ): boolean {
    // 子类型必须有超类型的所有属性，且类型更具体或相同
    for (const [key, supType] of Object.entries(supProps)) {
      const subType = subProps[key];
      if (subType === undefined) return false; // 缺少必需属性
      if (!this.isSubtype(subType, supType)) return false;
    }
    return true;
  }
}

// ============================================================================
// 2. 类型健全性 (Type Soundness)
// ============================================================================

/**
 * 类型健全性定理:
 * 如果 ∅ ⊢ e : τ 且 e ⟶* v (e 求值为 v)，则 ∅ ⊢ v : τ
 *
 * 即："Well-typed programs cannot go wrong"
 * - 类型正确的程序不会在某些运行时错误上失败
 */

export interface SoundnessProof {
  // 进展性 (Progress): 如果 e 是 well-typed，则 e 是值或可以进一步规约
  progress: boolean;

  // 保持性 (Preservation): 如果 ∅ ⊢ e : τ 且 e ⟶ e'，则 ∅ ⊢ e' : τ
  preservation: boolean;
}

// 类型健全性验证器
export class SoundnessValidator {
  /**
   * 验证表达式是否满足类型健全性
   *
   * 注意: TypeScript 是渐进类型系统，其健全性保证有所不同:
   * - 严格模式 (--strict): 提供更强的健全性保证
   * - 非严格模式: 允许某些 "trust me" 转换，牺牲健全性换取灵活性
   */
  validateSoundness(expression: string, expectedType: string): SoundnessProof {
    console.log(`[Soundness] 验证表达式: ${expression}`);
    console.log(`[Soundness] 期望类型: ${expectedType}`);

    // 模拟类型检查
    const isWellTyped = this.checkWellTyped(expression, expectedType);

    return {
      progress: isWellTyped, // Well-typed 表达式可以求值
      preservation: isWellTyped // 类型在求值过程中保持
    };
  }

  private checkWellTyped(_expr: string, _type: string): boolean {
    // 实际项目中应使用 TypeScript 编译器 API
    return true; // 简化示例
  }
}

// ============================================================================
// 3. 渐进类型系统 (Gradual Typing)
// ============================================================================

/**
 * TypeScript 采用渐进类型系统：
 * - 允许混合 typed 和 untyped 代码
 * - unknown 作为顶层类型，与任何类型在一致性上兼容
 * - 边界处插入运行时检查
 */

// 一致性关系 (Consistency): τ₁ ~ τ₂
export function isConsistent(t1: TypeAnnotation, t2: TypeAnnotation): boolean {
  // unknown 与任何类型一致
  if (t1.kind === 'unknown' || t2.kind === 'unknown') return true;
  // 否则要求结构相等
  return new TypeChecker().equals(t1, t2);
}

// 运行时类型检查 (边界检查)
export class RuntimeTypeChecker {
  /**
   * 在 typed/untyped 边界插入运行时检查
   *
   * 示例:
   * function greet(name: string): string {
   *   // 编译器生成: if (typeof name !== 'string') throw TypeError
   *   return `Hello, ${name}`;
   * }
   */
  static check<T>(value: unknown, expectedType: TypeAnnotation): asserts value is T {
    if (expectedType.kind === 'unknown') return;

    const actualType = this.inferType(value);
    const checker = new TypeChecker();
    if (!checker.isSubtype(actualType, expectedType)) {
      throw new TypeError(
        `类型不匹配: 期望 ${this.typeToString(expectedType)}, 得到 ${this.typeToString(actualType)}`
      );
    }
  }

  private static inferType(value: unknown): TypeAnnotation {
    if (value === null) return { kind: 'primitive', name: 'null' };
    if (value === undefined) return { kind: 'primitive', name: 'undefined' };

    const jsType = typeof value;
    switch (jsType) {
      case 'number':
        return { kind: 'primitive', name: 'number' };
      case 'string':
        return { kind: 'primitive', name: 'string' };
      case 'boolean':
        return { kind: 'primitive', name: 'boolean' };
      case 'symbol':
        return { kind: 'primitive', name: 'symbol' };
      case 'bigint':
        return { kind: 'primitive', name: 'bigint' };
      case 'function':
        // 运行时无法推断完整函数签名，保守返回 unknown
        return { kind: 'unknown' };
      case 'object':
      default:
        // 对象运行时信息有限，保守返回 unknown
        return { kind: 'unknown' };
    }
  }

  private static typeToString(type: TypeAnnotation): string {
    switch (type.kind) {
      case 'primitive':
        return type.name;
      case 'object': {
        const props = Object.entries(type.properties)
          .map(([k, v]) => `${k}: ${this.typeToString(v)}`)
          .join(', ');
        return `{ ${props} }`;
      }
      case 'function': {
        const params = type.params.map((p) => this.typeToString(p)).join(', ');
        return `(${params}) => ${this.typeToString(type.returnType)}`;
      }
      case 'union':
        return type.types.map((t) => this.typeToString(t)).join(' | ');
      case 'intersection':
        return type.types.map((t) => this.typeToString(t)).join(' & ');
      case 'generic':
        return type.constraints
          ? `${type.name} extends ${this.typeToString(type.constraints)}`
          : type.name;
      case 'array':
        return `${this.typeToString(type.elementType)}[]`;
      case 'tuple':
        return `[${type.elementTypes.map((t) => this.typeToString(t)).join(', ')}]`;
      case 'never':
        return 'never';
      case 'unknown':
        return 'unknown';
      default:
        return 'unknown';
    }
  }
}

// ============================================================================
// 4. 类型擦除与保留 (Type Erasure vs. Type Preservation)
// ============================================================================

/**
 * TypeScript 使用类型擦除:
 * - 编译时: 类型存在，用于静态检查
 * - 运行时: 类型被擦除，只剩下 JavaScript
 *
 * 对比:
 * - Java/C#: 类型保留 (Reified generics)
 * - TypeScript: 类型擦除 (Erased generics)
 */

// 编译前 (TypeScript)
interface Box<T> {
  value: T;
  getValue(): T;
}

// 编译后 (JavaScript) - 类型擦除
const boxJS = {
  value: undefined, // 类型信息丢失
  getValue: function () {
    return this.value;
  }
};

// 装饰器/元数据用于保留类型信息
const METADATA_KEY = 'design:type';

export function preserveType(target: object, propertyKey: string): void {
  // 使用 Reflect Metadata API 保留类型信息
  const type: unknown = Reflect.getMetadata(METADATA_KEY, target, propertyKey);
  (target as Record<string, unknown>)[`__type_${propertyKey}`] = type;
}

// ============================================================================
// 5. 形式化证明示例
// ============================================================================

/**
 * 定理: 如果 x: number 且 y: number，则 x + y : number
 *
 * 证明:
 * 1. 前提: Γ ⊢ x : number, Γ ⊢ y : number
 * 2. 根据加法规则: number + number → number
 * 3. 因此: Γ ⊢ (x + y) : number ∎
 */

export function proveNumberAddition(): string {
  const proof = `
定理: 数字加法的类型保持性

前提条件:
  (1) Γ ⊢ x : number
  (2) Γ ⊢ y : number

类型规则 (T-Add):
  Γ ⊢ e₁ : number    Γ ⊢ e₂ : number
  ──────────────────────────────────
        Γ ⊢ (e₁ + e₂) : number

证明:
  由 (1) 和 (2)，根据 T-Add 规则，
  可得 Γ ⊢ (x + y) : number

结论: 数字加法运算的结果类型为 number ∎
  `;

  console.log(proof);
  return proof;
}

/**
 * 定理: 子类型的替换原则 (Liskov Substitution Principle)
 *
 * 如果 S <: T，则任何需要 T 的地方都可以用 S 替换
 */
export function proveLSP(): string {
  const proof = `
定理: 里氏替换原则 (LSP)

定义:
  S <: T 表示 S 是 T 的子类型

前提:
  (1) 存在函数 f: T → R
  (2) S <: T

结论:
  对于所有 s: S, f(s) : R

证明 (基于结构化子类型):
  如果 S <: T，则 S 包含 T 的所有必需属性和方法。
  因此 f 对 S 的操作与对 T 的操作相同。
  所以 f(s) 的类型与 f(t) 的类型相同，都是 R ∎
  `;

  console.log(proof);
  return proof;
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 类型系统的形式化论证 ===\n');

  // 1. 类型判断演示
  console.log('--- 1. 类型判断 ---');
  const checker = new TypeChecker();

  checker.declareVariable('x', { kind: 'primitive', name: 'number' });
  checker.declareVariable('y', { kind: 'primitive', name: 'string' });

  console.log('上下文: x:number, y:string');
  console.log('查询 x 的类型:', checker.lookupVariable('x'));

  // 2. 子类型关系
  console.log('\n--- 2. 子类型关系 ---');
  const numberType: TypeAnnotation = { kind: 'primitive', name: 'number' };
  const stringType: TypeAnnotation = { kind: 'primitive', name: 'string' };
  const neverType: TypeAnnotation = { kind: 'never' };
  const unknownType: TypeAnnotation = { kind: 'unknown' };
  const unionType: TypeAnnotation = { kind: 'union', types: [numberType, stringType] };
  const unionTypeReversed: TypeAnnotation = { kind: 'union', types: [stringType, numberType] };
  const intersectionType: TypeAnnotation = { kind: 'intersection', types: [numberType, stringType] };

  console.log('number <: number?', checker.isSubtype(numberType, numberType));
  console.log('number <: string?', checker.isSubtype(numberType, stringType));
  console.log('never <: number?', checker.isSubtype(neverType, numberType));
  console.log('number <: unknown?', checker.isSubtype(numberType, unknownType));
  console.log('union [A,B] == union [B,A]?', checker.equals(unionType, unionTypeReversed));
  console.log('(number | string) <: (string | number)?', checker.isSubtype(unionType, unionTypeReversed));
  console.log('(number & string) <: number?', checker.isSubtype(intersectionType, numberType));

  // 3. 类型健全性
  console.log('\n--- 3. 类型健全性 ---');
  const validator = new SoundnessValidator();
  const soundness = validator.validateSoundness('x + 1', 'number');
  console.log('Progress:', soundness.progress);
  console.log('Preservation:', soundness.preservation);

  // 4. 渐进类型
  console.log('\n--- 4. 渐进类型一致性 ---');
  console.log('number ~ unknown?', isConsistent(numberType, unknownType));
  console.log('number ~ string?', isConsistent(numberType, stringType));

  // 5. 形式化证明
  console.log('\n--- 5. 形式化证明 ---');
  proveNumberAddition();
  proveLSP();

  // 6. 运行时类型检查
  console.log('\n--- 6. 运行时类型检查 ---');
  try {
    RuntimeTypeChecker.check<number>(42, numberType);
    console.log('✓ number 检查通过');

    RuntimeTypeChecker.check<string>(42, stringType);
  } catch (e) {
    console.log('✗ 类型错误:', (e as Error).message);
  }
}

// ============================================================================
// 导出已内联于各声明之上
// ============================================================================
