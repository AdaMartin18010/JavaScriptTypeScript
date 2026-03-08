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

// 上下文 (Context) 的形式化表示
interface TypeContext {
  [variable: string]: TypeAnnotation;
}

type TypeAnnotation = 
  | { kind: 'primitive'; name: 'number' | 'string' | 'boolean' | 'undefined' | 'null' | 'symbol' | 'bigint' }
  | { kind: 'object'; properties: Record<string, TypeAnnotation> }
  | { kind: 'function'; params: TypeAnnotation[]; returnType: TypeAnnotation }
  | { kind: 'union'; types: TypeAnnotation[] }
  | { kind: 'intersection'; types: TypeAnnotation[] }
  | { kind: 'generic'; name: string; constraints?: TypeAnnotation }
  | { kind: 'array'; elementType: TypeAnnotation }
  | { kind: 'tuple'; elementTypes: TypeAnnotation[] };

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

  // 子类型关系: τ₁ <: τ₂ (τ₁ 是 τ₂ 的子类型)
  isSubtype(sub: TypeAnnotation, sup: TypeAnnotation): boolean {
    // 自反性: τ <: τ
    if (this.typesEqual(sub, sup)) return true;

    // 基本子类型规则
    switch (sub.kind) {
      case 'primitive':
        // never <: primitive
        return sup.kind === 'primitive' && sub.name === sup.name;
      
      case 'function':
        // 协变/逆变规则
        if (sup.kind !== 'function') return false;
        // 参数逆变，返回值协变
        return this.isContravariantInParams(sub.params, sup.params) &&
               this.isSubtype(sub.returnType, sup.returnType);
      
      case 'object':
        // 结构化子类型
        if (sup.kind !== 'object') return false;
        return this.isStructuralSubtype(sub.properties, sup.properties);
      
      case 'union':
        // 分配性: (A | B) <: C 当且仅当 A <: C 且 B <: C
        return sub.types.every(t => this.isSubtype(t, sup));
      
      default:
        return false;
    }
  }

  private typesEqual(t1: TypeAnnotation, t2: TypeAnnotation): boolean {
    return JSON.stringify(t1) === JSON.stringify(t2);
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
      if (!subType) return false; // 缺少必需属性
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
      progress: isWellTyped,  // Well-typed 表达式可以求值
      preservation: isWellTyped // 类型在求值过程中保持
    };
  }

  private checkWellTyped(expr: string, type: string): boolean {
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
 * - 动态类型 (any) 和静态类型共存
 * - 边界处插入运行时检查
 */

// 一致性关系 (Consistency): τ₁ ~ τ₂
export function isConsistent(t1: unknown, t2: unknown): boolean {
  // any 与任何类型一致
  if (t1 === 'any' || t2 === 'any') return true;
  // 否则类型必须相同
  return t1 === t2;
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
  static check<T>(value: unknown, expectedType: string): asserts value is T {
    const actualType = this.getRuntimeType(value);
    if (actualType !== expectedType && expectedType !== 'any') {
      throw new TypeError(
        `类型不匹配: 期望 ${expectedType}, 得到 ${actualType}`
      );
    }
  }

  private static getRuntimeType(value: unknown): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      return value.constructor?.name || 'object';
    }
    return typeof value;
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
  getValue: function() { return this.value; }
};

// 装饰器/元数据用于保留类型信息
import 'reflect-metadata';

const METADATA_KEY = 'design:type';

export function preserveType(target: any, propertyKey: string) {
  // 使用 Reflect Metadata API 保留类型信息
  const type = Reflect.getMetadata(METADATA_KEY, target, propertyKey);
  target[`__type_${propertyKey}`] = type;
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
  
  console.log('number <: number?', checker.isSubtype(numberType, numberType));
  console.log('number <: string?', checker.isSubtype(numberType, stringType));

  // 3. 类型健全性
  console.log('\n--- 3. 类型健全性 ---');
  const validator = new SoundnessValidator();
  const soundness = validator.validateSoundness('x + 1', 'number');
  console.log('Progress:', soundness.progress);
  console.log('Preservation:', soundness.preservation);

  // 4. 渐进类型
  console.log('\n--- 4. 渐进类型一致性 ---');
  console.log('number ~ any?', isConsistent('number', 'any'));
  console.log('number ~ string?', isConsistent('number', 'string'));

  // 5. 形式化证明
  console.log('\n--- 5. 形式化证明 ---');
  proveNumberAddition();
  proveLSP();

  // 6. 运行时类型检查
  console.log('\n--- 6. 运行时类型检查 ---');
  try {
    RuntimeTypeChecker.check<number>(42, 'number');
    console.log('✓ number 检查通过');
    
    RuntimeTypeChecker.check<string>(42 as any, 'string');
  } catch (e) {
    console.log('✗ 类型错误:', (e as Error).message);
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  TypeChecker,
  SoundnessValidator,
  RuntimeTypeChecker,
  isConsistent,
  proveNumberAddition,
  proveLSP
};

export type {
  TypeContext,
  TypeAnnotation,
  SoundnessProof
};
