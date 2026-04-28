/**
 * @file 扩展类型检查器（集成泛型推断）
 * @category Advanced Compiler Workshop → Milestone 3
 *
 * 继承 M2 的 TypeChecker，在函数调用时集成泛型推断。
 */

import { TypeChecker, TypeCheckError } from '../../milestone-02-type-checker-basics/src/typeChecker.js';
import { type Type, type FunctionType, typeToString } from '../../milestone-02-type-checker-basics/src/types.js';
import type { CallExpressionNode } from '../../milestone-01-mini-parser/src/ast.js';
import { GenericSolver } from './genericSolver.js';

export class ExtendedTypeChecker extends TypeChecker {
  private solver = new GenericSolver();

  /**
   * 覆盖函数调用检查，加入泛型推断逻辑
   */
  protected override checkCallExpression(node: CallExpressionNode): Type {
    const calleeType = this.getEnvironment().lookup(node.callee.name);
    if (!calleeType) {
      throw new TypeCheckError(`Cannot find name '${node.callee.name}'`);
    }
    if (calleeType.kind !== 'function') {
      throw new TypeCheckError(`'${node.callee.name}' is not a function`);
    }

    const func = calleeType as FunctionType;

    // 计算实参类型
    const argTypes = node.arguments.map((arg) => this.checkExpression(arg));

    // 泛型推断
    let subst = this.solver.inferTypeArguments(func, argTypes);

    // 如果有显式类型参数，覆盖推断结果
    if (node.typeArguments && node.typeArguments.length > 0) {
      subst = new Map();
      for (let i = 0; i < Math.min(node.typeArguments.length, func.typeParams.length); i++) {
        const t = this.typeNodeToType(node.typeArguments[i]);
        subst.set(func.typeParams[i], t);
      }
    }

    // 检查参数类型（使用替换后的参数类型）
    for (let i = 0; i < func.params.length; i++) {
      const substitutedParamType = this.solver.applySubstitution(func.params[i].type, subst);
      const argType = argTypes[i];
      if (!this.isAssignable(argType, substitutedParamType)) {
        throw new TypeCheckError(
          `Argument of type '${typeToString(argType)}' is not assignable to parameter of type '${typeToString(substitutedParamType)}'`
        );
      }
    }

    // 返回替换后的返回类型
    return this.solver.applySubstitution(func.returnType, subst);
  }
}
