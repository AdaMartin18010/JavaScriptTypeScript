/**
 * @file 泛型求解器 (Generic Solver)
 * @category Advanced Compiler Workshop → Milestone 3
 *
 * 实现基于约束的泛型参数推断。
 * 核心算法：合一 (Unification) 的 TypeScript 风格简化版。
 */

import {
  type Type,
  type FunctionType,
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
  tObject,
  tFunction,
  tArray,
  tUnion,
  tGeneric,
  tUnknown,
} from '../../milestone-02-type-checker-basics/src/types.js';

/** 替换映射：泛型参数名 → 具体类型 */
export type Substitution = Map<string, Type>;

export class InferenceError extends Error {
  constructor(message: string) {
    super(`Inference error: ${message}`);
    this.name = 'InferenceError';
  }
}

export class GenericSolver {
  /**
   * 从函数类型和实参类型推断泛型参数替换映射
   */
  inferTypeArguments(funcType: FunctionType, argTypes: Type[]): Substitution {
    const subst: Substitution = new Map();

    if (funcType.typeParams.length === 0) {
      return subst; // 无泛型参数，无需推断
    }

    if (argTypes.length !== funcType.params.length) {
      throw new InferenceError(
        `Argument count mismatch: expected ${funcType.params.length}, got ${argTypes.length}`
      );
    }

    for (let i = 0; i < funcType.params.length; i++) {
      const paramType = funcType.params[i].type;
      const argType = argTypes[i];
      this.unify(paramType, argType, subst);
    }

    // 检查约束
    for (const paramName of funcType.typeParams) {
      // 查找该参数是否有约束（在当前简化模型中，约束信息存储在泛型类型中）
      // 由于 FunctionType 只存储名称列表，约束检查在 applySubstitution 后通过 checkConstraint 完成
      const inferred = subst.get(paramName);
      if (!inferred) {
        // 未推断出类型，可能是未使用参数，默认推断为 unknown（简化处理）
        subst.set(paramName, tUnknown);
      }
    }

    return subst;
  }

  /**
   * 合一算法：求解两个类型的最一般合一子
   *
   * 规则：
   * 1. unify(T, T) = {}                (同一类型，无约束)
   * 2. unify(T, α) = { α ↦ T }         (α 是未绑定变量)
   * 3. unify(Array<A>, Array<B>) = unify(A, B)  (结构递归)
   * 4. unify(number, string) = 错误     (不可合一)
   */
  unify(a: Type, b: Type, subst: Substitution): void {
    const resolvedA = this.resolve(a, subst);
    const resolvedB = this.resolve(b, subst);

    // 同一类型
    if (typesEqual(resolvedA, resolvedB)) return;

    // a 是泛型参数
    if (resolvedA.kind === 'generic') {
      this.bindVariable(resolvedA.name, resolvedB, subst);
      return;
    }

    // b 是泛型参数
    if (resolvedB.kind === 'generic') {
      this.bindVariable(resolvedB.name, resolvedA, subst);
      return;
    }

    // 数组类型递归合一
    if (resolvedA.kind === 'array' && resolvedB.kind === 'array') {
      this.unify(resolvedA.elementType, resolvedB.elementType, subst);
      return;
    }

    // 对象类型递归合一（按属性）
    if (resolvedA.kind === 'object' && resolvedB.kind === 'object') {
      for (const [key, aType] of resolvedA.properties.entries()) {
        const bType = resolvedB.properties.get(key);
        if (!bType) {
          // b 缺少该属性，若 a 中不是可选属性则报错
          if (!resolvedA.optionalProperties.has(key)) {
            throw new InferenceError(`Cannot unify: property '${key}' missing in ${typeToString(resolvedB)}`);
          }
          continue;
        }
        this.unify(aType, bType, subst);
      }
      // 检查 b 中有但 a 中没有的非可选属性
      for (const [key, bType] of resolvedB.properties.entries()) {
        if (!resolvedA.properties.has(key) && !resolvedB.optionalProperties.has(key)) {
          throw new InferenceError(`Cannot unify: property '${key}' missing in ${typeToString(resolvedA)}`);
        }
      }
      return;
    }

    // 函数类型递归合一
    if (resolvedA.kind === 'function' && resolvedB.kind === 'function') {
      if (resolvedA.params.length !== resolvedB.params.length) {
        throw new InferenceError(
          `Cannot unify functions with different parameter counts`
        );
      }
      for (let i = 0; i < resolvedA.params.length; i++) {
        this.unify(resolvedA.params[i].type, resolvedB.params[i].type, subst);
      }
      this.unify(resolvedA.returnType, resolvedB.returnType, subst);
      return;
    }

    // 联合类型
    if (resolvedA.kind === 'union' && resolvedB.kind === 'union') {
      // 简化：要求成员数量相同且一一对应
      if (resolvedA.types.length !== resolvedB.types.length) {
        throw new InferenceError('Cannot unify unions with different member counts');
      }
      for (let i = 0; i < resolvedA.types.length; i++) {
        this.unify(resolvedA.types[i], resolvedB.types[i], subst);
      }
      return;
    }

    // 原始类型直接比较
    if (resolvedA.kind === 'primitive' && resolvedB.kind === 'primitive') {
      if (resolvedA.name === resolvedB.name) return;
      throw new InferenceError(
        `Cannot unify primitive types '${resolvedA.name}' and '${resolvedB.name}'`
      );
    }

    throw new InferenceError(
      `Cannot unify '${typeToString(resolvedA)}' and '${typeToString(resolvedB)}'`
    );
  }

  /**
   * 应用替换映射到类型
   */
  applySubstitution(type: Type, subst: Substitution): Type {
    const resolved = this.resolve(type, subst);

    switch (resolved.kind) {
      case 'generic': {
        const sub = subst.get(resolved.name);
        if (sub) return this.applySubstitution(sub, subst);
        return resolved;
      }
      case 'array':
        return tArray(this.applySubstitution(resolved.elementType, subst));
      case 'object': {
        const props: Record<string, Type> = {};
        const optional: string[] = [];
        for (const [k, v] of resolved.properties.entries()) {
          props[k] = this.applySubstitution(v, subst);
        }
        for (const k of resolved.optionalProperties) {
          optional.push(k);
        }
        return tObject(props, optional);
      }
      case 'function': {
        return tFunction(
          resolved.params.map((p) => ({
            name: p.name,
            type: this.applySubstitution(p.type, subst),
          })),
          this.applySubstitution(resolved.returnType, subst),
          resolved.typeParams
        );
      }
      case 'union':
        return tUnion(...resolved.types.map((t) => this.applySubstitution(t, subst)));
      default:
        return resolved;
    }
  }

  /**
   * 检查类型是否满足约束
   */
  checkConstraint(type: Type, constraint: Type): boolean {
    // 简化版约束检查：结构子类型的基本检查
    if (constraint.kind === 'object' && type.kind === 'object') {
      for (const [key, ct] of constraint.properties.entries()) {
        const tt = type.properties.get(key);
        if (!tt) return false;
        if (!this.checkConstraint(tt, ct)) return false;
      }
      return true;
    }
    if (constraint.kind === 'primitive' && type.kind === 'primitive') {
      return constraint.name === type.name;
    }
    // 其他情况简化处理
    return true;
  }

  // ==================== 私有方法 ====================

  private bindVariable(name: string, type: Type, subst: Substitution): void {
    // Occurs check：防止循环绑定（如 T = Array<T>）
    if (type.kind === 'generic' && type.name === name) return; // T = T，无操作
    if (this.occursIn(name, type, subst)) {
      throw new InferenceError(`Occurs check failed: '${name}' occurs in '${typeToString(type)}'`);
    }

    const existing = subst.get(name);
    if (existing) {
      // 已有绑定，需要合一
      const tempSubst = new Map(subst);
      tempSubst.delete(name);
      this.unify(existing, type, tempSubst);
      // 将 tempSubst 的更新合并回 subst
      for (const [k, v] of tempSubst.entries()) {
        subst.set(k, v);
      }
    } else {
      subst.set(name, type);
    }
  }

  private occursIn(name: string, type: Type, subst: Substitution): boolean {
    const resolved = this.resolve(type, subst);
    if (resolved.kind === 'generic' && resolved.name === name) return true;
    if (resolved.kind === 'array') return this.occursIn(name, resolved.elementType, subst);
    if (resolved.kind === 'object') {
      for (const v of resolved.properties.values()) {
        if (this.occursIn(name, v, subst)) return true;
      }
    }
    if (resolved.kind === 'function') {
      for (const p of resolved.params) {
        if (this.occursIn(name, p.type, subst)) return true;
      }
      if (this.occursIn(name, resolved.returnType, subst)) return true;
    }
    if (resolved.kind === 'union') {
      for (const t of resolved.types) {
        if (this.occursIn(name, t, subst)) return true;
      }
    }
    return false;
  }

  private resolve(type: Type, subst: Substitution): Type {
    if (type.kind !== 'generic') return type;
    const sub = subst.get(type.name);
    if (!sub) return type;
    if (sub.kind === 'generic' && sub.name === type.name) return type; // 自引用保护
    return this.resolve(sub, subst);
  }
}
