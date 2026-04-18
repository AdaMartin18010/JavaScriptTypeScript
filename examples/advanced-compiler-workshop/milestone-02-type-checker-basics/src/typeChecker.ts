/**
 * @file 类型检查器 (Type Checker)
 * @category Advanced Compiler Workshop → Milestone 2
 *
 * 基于 AST 实现基础类型检查：
 * - 原始类型推断
 * - 赋值兼容性检查
 * - 函数参数/返回类型检查
 * - 接口形状检查（结构子类型）
 */

import type {
  ProgramNode,
  StatementNode,
  ExpressionNode,
  VariableDeclarationNode,
  FunctionDeclarationNode,
  InterfaceDeclarationNode,
  BlockStatementNode,
  ReturnStatementNode,
  ExpressionStatementNode,
  BinaryExpressionNode,
  CallExpressionNode,
  IdentifierNode,
  NumberLiteralNode,
  StringLiteralNode,
  BooleanLiteralNode,
  NullLiteralNode,
  TypeNode,
} from '../../milestone-01-mini-parser/src/ast.js';

import {
  type Type,
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
} from './types.js';

import { TypeEnvironment } from './environment.js';

/** 类型错误 */
export class TypeCheckError extends Error {
  constructor(
    message: string,
    public line: number = 0,
    public column: number = 0
  ) {
    super(`Type error at line ${line}, column ${column}: ${message}`);
    this.name = 'TypeCheckError';
  }
}

export class TypeChecker {
  private env = new TypeEnvironment();

  /**
   * 类型检查入口
   */
  check(node: ProgramNode): void {
    for (const stmt of node.body) {
      this.checkStatement(stmt);
    }
  }

  getEnvironment(): TypeEnvironment {
    return this.env;
  }

  // ==================== 语句检查 ====================

  protected checkStatement(node: StatementNode): void {
    switch (node.kind) {
      case 'VariableDeclaration':
        this.checkVariableDeclaration(node);
        break;
      case 'FunctionDeclaration':
        this.checkFunctionDeclaration(node);
        break;
      case 'InterfaceDeclaration':
        this.checkInterfaceDeclaration(node);
        break;
      case 'BlockStatement':
        this.checkBlockStatement(node);
        break;
      case 'ReturnStatement':
        this.checkReturnStatement(node);
        break;
      case 'ExpressionStatement':
        this.checkExpression(node.expression);
        break;
      default:
        throw new TypeCheckError(`Unknown statement kind: ${(node as any).kind}`);
    }
  }

  protected checkVariableDeclaration(node: VariableDeclarationNode): void {
    const inferredType = node.initializer ? this.checkExpression(node.initializer) : tUndefined;

    if (node.typeAnnotation) {
      const annotatedType = this.typeNodeToType(node.typeAnnotation);
      if (!this.isAssignable(inferredType, annotatedType)) {
        throw new TypeCheckError(
          `Type '${typeToString(inferredType)}' is not assignable to type '${typeToString(annotatedType)}'`,
          node.loc?.start.line,
          node.loc?.start.column
        );
      }
      this.env.define(node.name, annotatedType);
    } else {
      this.env.define(node.name, inferredType);
    }
  }

  protected checkFunctionDeclaration(node: FunctionDeclarationNode): void {
    // 构建函数类型
    const paramTypes = node.parameters.map((p) => ({
      name: p.name,
      type: this.typeNodeToType(p.typeAnnotation),
    }));
    const returnType = node.returnType ? this.typeNodeToType(node.returnType) : tVoid;
    const funcType = tFunction(paramTypes, returnType, node.typeParameters);

    // 在当前作用域注册函数名
    this.env.define(node.name, funcType);

    // 检查函数体
    this.env.pushScope();

    // 注册泛型参数（M2 基础版：仅注册名称，不处理约束）
    for (const tp of node.typeParameters) {
      this.env.define(tp, tGeneric(tp));
    }

    // 注册参数
    for (const param of node.parameters) {
      this.env.define(param.name, this.typeNodeToType(param.typeAnnotation));
    }

    let hasReturn = false;
    for (const stmt of node.body.statements) {
      this.checkStatement(stmt);
      if (stmt.kind === 'ReturnStatement') {
        hasReturn = true;
        const retStmt = stmt as ReturnStatementNode;
        const actualReturn = retStmt.argument ? this.checkExpression(retStmt.argument) : tVoid;
        if (!this.isAssignable(actualReturn, returnType)) {
          throw new TypeCheckError(
            `Return type '${typeToString(actualReturn)}' is not assignable to '${typeToString(returnType)}'`
          );
        }
      }
    }

    this.env.popScope();

    // void 函数可以没有 return
    if (!hasReturn && returnType.kind !== 'void' && returnType.kind !== 'undefined') {
      // 非 void 函数必须有 return（简化检查）
      // 实际 TS 中这更复杂，这里仅作演示
    }
  }

  protected checkInterfaceDeclaration(node: InterfaceDeclarationNode): void {
    const props: Record<string, Type> = {};
    const optional: string[] = [];
    for (const prop of node.properties) {
      props[prop.name] = this.typeNodeToType(prop.type);
      if (prop.optional) optional.push(prop.name);
    }
    this.env.defineInterface(node.name, tObject(props, optional));
  }

  protected checkBlockStatement(node: BlockStatementNode): void {
    this.env.pushScope();
    for (const stmt of node.statements) {
      this.checkStatement(stmt);
    }
    this.env.popScope();
  }

  protected checkReturnStatement(node: ReturnStatementNode): void {
    // 实际应在函数上下文中检查返回类型
    // 这里仅计算返回表达式的类型
    if (node.argument) {
      this.checkExpression(node.argument);
    }
  }

  // ==================== 表达式检查 ====================

  protected checkExpression(node: ExpressionNode): Type {
    switch (node.kind) {
      case 'NumberLiteral':
        return tNumber;
      case 'StringLiteral':
        return tString;
      case 'BooleanLiteral':
        return tBoolean;
      case 'NullLiteral':
        return tNull;
      case 'Identifier':
        return this.checkIdentifier(node);
      case 'BinaryExpression':
        return this.checkBinaryExpression(node);
      case 'CallExpression':
        return this.checkCallExpression(node);
      default:
        throw new TypeCheckError(`Unknown expression kind: ${(node as any).kind}`);
    }
  }

  protected checkIdentifier(node: IdentifierNode): Type {
    const type = this.env.lookup(node.name);
    if (!type) {
      // 检查是否为接口名
      const iface = this.env.lookupInterface(node.name);
      if (iface) return iface;
      throw new TypeCheckError(`Cannot find name '${node.name}'`);
    }
    return type;
  }

  protected checkBinaryExpression(node: BinaryExpressionNode): Type {
    const left = this.checkExpression(node.left);
    const right = this.checkExpression(node.right);

    // 算术运算符
    if (['+', '-', '*', '/'].includes(node.operator)) {
      if (node.operator === '+' && (left.kind === 'primitive' && left.name === 'string' || right.kind === 'primitive' && right.name === 'string')) {
        return tString; // 字符串拼接
      }
      if (!this.isAssignable(left, tNumber)) {
        throw new TypeCheckError(`Left operand of '${node.operator}' must be number, got '${typeToString(left)}'`);
      }
      if (!this.isAssignable(right, tNumber)) {
        throw new TypeCheckError(`Right operand of '${node.operator}' must be number, got '${typeToString(right)}'`);
      }
      return tNumber;
    }

    // 比较运算符
    if (['==', '!=', '===', '!==', '<', '>', '<=', '>='].includes(node.operator)) {
      // 简化：允许同类型比较
      if (!this.isAssignable(left, right) && !this.isAssignable(right, left)) {
        // 允许 number 与 number、string 与 string 等
        if (left.kind === 'primitive' && right.kind === 'primitive' && left.name !== right.name) {
          throw new TypeCheckError(`Cannot compare '${typeToString(left)}' with '${typeToString(right)}'`);
        }
      }
      return tBoolean;
    }

    return tUnknown;
  }

  protected checkCallExpression(node: CallExpressionNode): Type {
    const calleeType = this.env.lookup(node.callee.name);
    if (!calleeType) {
      throw new TypeCheckError(`Cannot find name '${node.callee.name}'`);
    }

    if (calleeType.kind !== 'function') {
      throw new TypeCheckError(`'${node.callee.name}' is not a function`);
    }

    const func = calleeType;

    // 检查参数数量
    if (node.arguments.length !== func.params.length) {
      throw new TypeCheckError(
        `Expected ${func.params.length} arguments, but got ${node.arguments.length}`
      );
    }

    // 检查参数类型（M2 基础版：泛型函数不做替换，仅检查泛型参数是否匹配）
    for (let i = 0; i < func.params.length; i++) {
      const argType = this.checkExpression(node.arguments[i]);
      const paramType = func.params[i].type;

      if (!this.isAssignable(argType, paramType)) {
        throw new TypeCheckError(
          `Argument of type '${typeToString(argType)}' is not assignable to parameter of type '${typeToString(paramType)}'`
        );
      }
    }

    return func.returnType;
  }

  // ==================== 子类型判断 ====================

  /**
   * 判断 source 是否可赋值给 target（source <: target）
   */
  isAssignable(source: Type, target: Type): boolean {
    // never 可赋值给任何类型
    if (source.kind === 'primitive' && source.name === 'never') return true;

    // 任何类型可赋值给 unknown（但本简化版没有 unknown）
    // 同一类型
    if (typesEqual(source, target)) return true;

    // 原始类型：必须完全匹配（简化版，不考虑 number | literal 等）
    if (target.kind === 'primitive' && source.kind === 'primitive') {
      // null / undefined 的特殊处理
      if (target.name === 'undefined' && source.name === 'null') return true; // strictNullChecks 关闭时
      return source.name === target.name;
    }

    // 对象宽度子类型
    if (target.kind === 'object' && source.kind === 'object') {
      for (const [key, targetType] of target.properties.entries()) {
        const sourceType = source.properties.get(key);
        if (!sourceType) {
          // 检查是否为可选属性
          if (!target.optionalProperties.has(key)) return false;
          continue;
        }
        if (!this.isAssignable(sourceType, targetType)) return false;
      }
      return true;
    }

    // 数组子类型
    if (target.kind === 'array' && source.kind === 'array') {
      return this.isAssignable(source.elementType, target.elementType);
    }

    // 函数子类型：参数逆变，返回值协变
    if (target.kind === 'function' && source.kind === 'function') {
      if (target.params.length !== source.params.length) return false;
      // 参数：target 的参数类型必须是 source 参数类型的子类型（逆变）
      for (let i = 0; i < target.params.length; i++) {
        if (!this.isAssignable(target.params[i].type, source.params[i].type)) return false;
      }
      // 返回值：source 的返回类型必须是 target 返回类型的子类型（协变）
      return this.isAssignable(source.returnType, target.returnType);
    }

    // 联合类型
    if (target.kind === 'union') {
      // 简化：source 必须是 union 中某个类型的子类型
      return target.types.some((t) => this.isAssignable(source, t));
    }
    if (source.kind === 'union') {
      // source 的每个成员都必须可赋值给 target
      return source.types.every((t) => this.isAssignable(t, target));
    }

    // 泛型参数：仅比较名称（简化）
    if (target.kind === 'generic' && source.kind === 'generic') {
      return target.name === source.name;
    }

    return false;
  }

  // ==================== TypeNode → Type 转换 ====================

  protected typeNodeToType(node: TypeNode): Type {
    switch (node.kind) {
      case 'PrimitiveType':
        switch (node.name) {
          case 'number': return tNumber;
          case 'string': return tString;
          case 'boolean': return tBoolean;
          case 'null': return tNull;
          case 'undefined': return tUndefined;
          case 'void': return tVoid;
          case 'never': return tNever;
        }
        break;
      case 'IdentifierType': {
        // 查找是否为已定义的接口
        const iface = this.env.lookupInterface(node.name);
        if (iface) return iface;
        // 否则视为泛型参数或未知类型
        return tGeneric(node.name);
      }
      case 'ArrayType':
        return tArray(this.typeNodeToType(node.elementType));
      case 'FunctionType':
        return tFunction(
          node.params.map((p) => ({ name: p.name, type: this.typeNodeToType(p.type) })),
          this.typeNodeToType(node.returnType)
        );
      case 'GenericType': {
        // 如 Array<number>
        const elementType = this.typeNodeToType(node.params[0]);
        if (node.name === 'Array') return tArray(elementType);
        // 其他泛型类型暂不支持
        return tGeneric(node.name);
      }
    }
    return tUnknown;
  }
}
