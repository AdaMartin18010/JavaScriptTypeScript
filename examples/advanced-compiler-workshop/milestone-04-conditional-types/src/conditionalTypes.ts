/**
 * @file 条件类型求值器
 * @category Advanced Compiler Workshop → Milestone 4
 *
 * 实现 TypeScript 条件类型、infer 关键字和映射类型的类型层面求值。
 */

import {
  type Type,
  type ObjectType,
  type FunctionType,
  type ArrayType,
  type UnionType,
  type GenericType,
  typeToString,
  typesEqual,
  tNumber,
  tString,
  tBoolean,
  tNull,
  tUndefined,
  tVoid,
  tNever,
  tUnknown,
  tObject,
  tFunction,
  tArray,
  tUnion,
  tGeneric,
} from '../../milestone-02-type-checker-basics/src/types.js';

// ==================== 扩展类型表示 ====================

/** 条件类型表达式 */
export interface ConditionalType {
  kind: 'conditional';
  checkType: Type;       // T
  extendsType: Type;     // U
  trueType: Type;        // X
  falseType: Type;       // Y
  // infer 绑定：extendsType 中的泛型参数名 → 在求值时绑定
  inferVars: string[];
}

/** 映射类型表达式 */
export interface MappedType {
  kind: 'mapped';
  source: Type;          // T (对象类型)
  keyType: Type;         // keyof T 的结果（属性名联合）
  valueMapper: (key: string, valueType: Type) => Type;
  makeOptional?: boolean;
  makeReadonly?: boolean;
}

export type ExtendedType = Type | ConditionalType | MappedType;

// ==================== 求值错误 ====================

export class EvaluationError extends Error {
  constructor(message: string) {
    super(`Type evaluation error: ${message}`);
    this.name = 'EvaluationError';
  }
}

// ==================== 类型求值器 ====================

export class TypeEvaluator {
  /**
   * 求值条件类型表达式
   *
   * 核心逻辑：
   * 1. 若 checkType 是联合类型 → 分发求值（Distributive）
   * 2. 若 extendsType 包含 infer 变量 → 模式匹配
   * 3. 否则检查子类型关系
   */
  evaluateConditional(
    checkType: Type,
    extendsType: Type,
    trueType: Type,
    falseType: Type,
    inferVars: string[] = []
  ): Type {
    // 分发条件类型：T extends U ? X : Y，当 T 是联合类型时
    if (checkType.kind === 'union') {
      const results: Type[] = [];
      for (const member of checkType.types) {
        const result = this.evaluateConditional(member, extendsType, trueType, falseType, inferVars);
        // 过滤 never
        if (!(result.kind === 'primitive' && result.name === 'never')) {
          results.push(result);
        }
      }
      if (results.length === 0) return tNever;
      if (results.length === 1) return results[0];
      return tUnion(...results);
    }

    // 尝试模式匹配（infer）
    const matchResult = this.matchPattern(checkType, extendsType);
    if (matchResult.matched) {
      // 使用匹配结果绑定 infer 变量，应用到 trueType
      const substitutedTrue = this.applyBindings(trueType, matchResult.bindings);
      return substitutedTrue;
    }

    // 标准子类型检查
    if (this.isSubtype(checkType, extendsType)) {
      return trueType;
    }

    return falseType;
  }

  /**
   * 模式匹配：将具体类型与含 infer 的模式匹配
   *
   * 示例：
   * - match(Array<number>, Array<infer U>) → { matched: true, bindings: { U: number } }
   * - match(string, Array<infer U>) → { matched: false }
   */
  matchPattern(
    type: Type,
    pattern: Type
  ): { matched: boolean; bindings: Map<string, Type> } {
    const bindings = new Map<string, Type>();

    const success = this.matchRecursive(type, pattern, bindings);
    return { matched: success, bindings };
  }

  private matchRecursive(type: Type, pattern: Type, bindings: Map<string, Type>): boolean {
    // pattern 是泛型参数 → 视为 infer 变量
    if (pattern.kind === 'generic') {
      const existing = bindings.get(pattern.name);
      if (existing) {
        return typesEqual(existing, type);
      }
      bindings.set(pattern.name, type);
      return true;
    }

    // 结构递归匹配
    if (pattern.kind === 'array' && type.kind === 'array') {
      return this.matchRecursive(type.elementType, pattern.elementType, bindings);
    }

    if (pattern.kind === 'object' && type.kind === 'object') {
      for (const [key, pType] of pattern.properties.entries()) {
        const tType = type.properties.get(key);
        if (!tType) return false;
        if (!this.matchRecursive(tType, pType, bindings)) return false;
      }
      return true;
    }

    if (pattern.kind === 'function' && type.kind === 'function') {
      if (pattern.params.length !== type.params.length) return false;
      for (let i = 0; i < pattern.params.length; i++) {
        if (!this.matchRecursive(type.params[i].type, pattern.params[i].type, bindings)) return false;
      }
      return this.matchRecursive(type.returnType, pattern.returnType, bindings);
    }

    // 原始类型直接比较
    if (pattern.kind === 'primitive' && type.kind === 'primitive') {
      return pattern.name === type.name;
    }

    // 其他情况：视为不匹配（简化）
    return false;
  }

  /**
   * 应用 infer 绑定到类型
   */
  applyBindings(type: Type, bindings: Map<string, Type>): Type {
    if (type.kind === 'generic') {
      const bound = bindings.get(type.name);
      if (bound) return bound;
      return type;
    }
    if (type.kind === 'array') {
      return tArray(this.applyBindings(type.elementType, bindings));
    }
    if (type.kind === 'object') {
      const props: Record<string, Type> = {};
      const optional: string[] = [];
      for (const [k, v] of type.properties.entries()) {
        props[k] = this.applyBindings(v, bindings);
      }
      for (const k of type.optionalProperties) {
        optional.push(k);
      }
      return tObject(props, optional);
    }
    if (type.kind === 'function') {
      return tFunction(
        type.params.map((p) => ({ name: p.name, type: this.applyBindings(p.type, bindings) })),
        this.applyBindings(type.returnType, bindings),
        type.typeParams
      );
    }
    if (type.kind === 'union') {
      return tUnion(...type.types.map((t) => this.applyBindings(t, bindings)));
    }
    return type;
  }

  /**
   * 求值映射类型
   */
  evaluateMappedType(source: Type, mapper: (key: string, valueType: Type) => Type): Type {
    if (source.kind !== 'object') {
      return tNever;
    }

    const props: Record<string, Type> = {};
    const optional: string[] = [];
    for (const [key, valueType] of source.properties.entries()) {
      props[key] = mapper(key, valueType);
      if (source.optionalProperties.has(key)) {
        optional.push(key);
      }
    }
    return tObject(props, optional);
  }

  // ==================== 子类型判断（简化版）====================

  private isSubtype(sub: Type, sup: Type): boolean {
    if (typesEqual(sub, sup)) return true;

    if (sub.kind === 'primitive' && sup.kind === 'primitive') {
      // 特殊规则：never 是任何类型的子类型
      if (sub.name === 'never') return true;
      // 特殊规则：null / undefined 可互相赋值（简化）
      if ((sub.name === 'null' || sub.name === 'undefined') &&
          (sup.name === 'null' || sup.name === 'undefined')) return true;
      return sub.name === sup.name;
    }

    if (sub.kind === 'object' && sup.kind === 'object') {
      for (const [key, supType] of sup.properties.entries()) {
        const subType = sub.properties.get(key);
        if (!subType) return false;
        if (!this.isSubtype(subType, supType)) return false;
      }
      return true;
    }

    if (sub.kind === 'array' && sup.kind === 'array') {
      return this.isSubtype(sub.elementType, sup.elementType);
    }

    if (sub.kind === 'function' && sup.kind === 'function') {
      if (sub.params.length !== sup.params.length) return false;
      for (let i = 0; i < sub.params.length; i++) {
        if (!this.isSubtype(sup.params[i].type, sub.params[i].type)) return false;
      }
      return this.isSubtype(sub.returnType, sup.returnType);
    }

    if (sup.kind === 'union') {
      return sup.types.some((t) => this.isSubtype(sub, t));
    }

    if (sub.kind === 'union') {
      return sub.types.every((t) => this.isSubtype(t, sup));
    }

    return false;
  }

  // ==================== 内置工具类型实现 ====================

  /**
   * Exclude<T, U> = T extends U ? never : T
   */
  exclude(union: Type, excluded: Type): Type {
    if (union.kind !== 'union') {
      return this.evaluateConditional(union, excluded, tNever, union);
    }
    const results: Type[] = [];
    for (const member of union.types) {
      const result = this.evaluateConditional(member, excluded, tNever, member);
      if (!(result.kind === 'primitive' && result.name === 'never')) {
        results.push(result);
      }
    }
    if (results.length === 0) return tNever;
    if (results.length === 1) return results[0];
    return tUnion(...results);
  }

  /**
   * Extract<T, U> = T extends U ? T : never
   */
  extract(union: Type, extracted: Type): Type {
    if (union.kind !== 'union') {
      return this.evaluateConditional(union, extracted, union, tNever);
    }
    const results: Type[] = [];
    for (const member of union.types) {
      const result = this.evaluateConditional(member, extracted, member, tNever);
      if (!(result.kind === 'primitive' && result.name === 'never')) {
        results.push(result);
      }
    }
    if (results.length === 0) return tNever;
    if (results.length === 1) return results[0];
    return tUnion(...results);
  }

  /**
   * ReturnType<T> = T extends (...args: any[]) => infer R ? R : never
   */
  returnType(func: Type): Type {
    if (func.kind !== 'function') return tNever;
    // 简化：直接返回函数的返回类型
    return func.returnType;
  }

  /**
   * Parameters<T> = T extends (...args: infer P) => any ? P : never
   */
  parameters(func: Type): Type {
    if (func.kind !== 'function') return tNever;
    // 返回参数类型的联合（简化：返回对象类型 { 0: T1, 1: T2 } 模拟 tuple）
    const props: Record<string, Type> = {};
    for (let i = 0; i < func.params.length; i++) {
      props[String(i)] = func.params[i].type;
    }
    return tObject(props);
  }

  /**
   * Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T
   */
  awaited(type: Type): Type {
    // 简化：检查是否为 Array<某类型> 模拟 Promise（教学中用）
    // 实际 Promise 应包含 then/catch 方法，这里简化为数组包装器
    if (type.kind === 'array') {
      // 递归解包
      return this.awaited(type.elementType);
    }
    return type;
  }

  /**
   * Readonly<T>: 所有属性设为只读（值层面无区别，仅标记）
   */
  readonly(type: Type): Type {
    if (type.kind !== 'object') return type;
    // 在当前简化模型中，readonly 不改变类型结构
    return type;
  }

  /**
   * Partial<T>: 所有属性设为可选
   */
  partial(type: Type): Type {
    if (type.kind !== 'object') return type;
    const props: Record<string, Type> = {};
    const optional: string[] = [];
    for (const [k, v] of type.properties.entries()) {
      props[k] = v;
      optional.push(k);
    }
    return tObject(props, optional);
  }

  /**
   * Required<T>: 所有属性设为必选
   */
  required(type: Type): Type {
    if (type.kind !== 'object') return type;
    const props: Record<string, Type> = {};
    for (const [k, v] of type.properties.entries()) {
      props[k] = v;
    }
    return tObject(props);
  }

  /**
   * Record<K, V>: 从键类型创建对象类型
   */
  record(keys: Type, valueType: Type): Type {
    if (keys.kind !== 'union') {
      // 单键
      if (keys.kind === 'primitive' && (keys.name === 'string' || keys.name === 'number')) {
        // 无法枚举无限键，返回索引签名风格的对象（简化）
        return tObject({ [keys.name]: valueType });
      }
      return tObject({});
    }
    const props: Record<string, Type> = {};
    for (const keyType of keys.types) {
      if (keyType.kind === 'primitive' && keyType.name === 'string') {
        props[keyType.name] = valueType;
      } else if (keyType.kind === 'primitive') {
        props[keyType.name] = valueType;
      }
    }
    return tObject(props);
  }
}
