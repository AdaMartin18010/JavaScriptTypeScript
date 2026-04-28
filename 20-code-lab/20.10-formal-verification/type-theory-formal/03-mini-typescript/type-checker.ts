// ============================================================
// Mini-TS TypeChecker: 类型推断、子类型、泛型实例化、条件类型
// ============================================================

import type {
  ASTNode,
  Program,
  VariableDecl,
  FunctionDecl,
  ReturnStmt,
  BinaryExpr,
  CallExpr,
  Identifier,
  NumberLiteral,
  StringLiteral,
  ObjectLiteral,
  TypeAnnotation,
  Statement,
  Expression,
} from './parser.js';

export class TypeError extends Error {}

export class TypeChecker {
  private scopes: Map<string, TypeAnnotation>[] = [new Map()];
  private functions = new Map<string, FunctionDecl>();

  check(node: ASTNode): TypeAnnotation {
    switch (node.kind) {
      case 'Program':
        return this.checkProgram(node);
      case 'VariableDecl':
        return this.checkVariableDecl(node);
      case 'FunctionDecl':
        return this.checkFunctionDecl(node);
      case 'ReturnStmt':
        return this.checkReturnStmt(node);
      case 'BinaryExpr':
        return this.checkBinaryExpr(node);
      case 'CallExpr':
        return this.checkCallExpr(node);
      case 'Identifier':
        return this.checkIdentifier(node);
      case 'NumberLiteral':
        return { kind: 'primitive', name: 'number' };
      case 'StringLiteral':
        return { kind: 'primitive', name: 'string' };
      case 'ObjectLiteral':
        return this.checkObjectLiteral(node);
      default:
        throw new TypeError(`Unknown AST node kind: ${(node as ASTNode).kind}`);
    }
  }

  private pushScope(): void {
    this.scopes.push(new Map());
  }

  private popScope(): void {
    this.scopes.pop();
  }

  private define(name: string, type: TypeAnnotation): void {
    this.scopes[this.scopes.length - 1].set(name, type);
  }

  private lookup(name: string): TypeAnnotation | undefined {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      const t = this.scopes[i].get(name);
      if (t) return t;
    }
    return undefined;
  }

  private checkProgram(node: Program): TypeAnnotation {
    for (const stmt of node.body) {
      this.check(stmt);
    }
    return { kind: 'primitive', name: 'void' };
  }

  private checkVariableDecl(node: VariableDecl): TypeAnnotation {
    const inferredType: TypeAnnotation = node.initializer ? this.check(node.initializer) : { kind: 'primitive', name: 'void' };

    if (node.typeAnnotation) {
      if (!this.isSubtype(inferredType, node.typeAnnotation)) {
        throw new TypeError(
          `Type ${this.typeToString(inferredType)} is not assignable to ${this.typeToString(node.typeAnnotation)}`
        );
      }
      this.define(node.name, node.typeAnnotation);
      return node.typeAnnotation;
    } else {
      this.define(node.name, inferredType);
      return inferredType;
    }
  }

  private checkFunctionDecl(node: FunctionDecl): TypeAnnotation {
    // Store function for later lookup
    this.functions.set(node.name, node);

    const funcType: TypeAnnotation = {
      kind: 'function',
      params: node.params.map((p) => ({ name: p.name, type: p.typeAnnotation || { kind: 'primitive', name: 'void' } })),
      returnType: node.returnType || { kind: 'primitive', name: 'void' },
      genericParams: node.genericParams.length > 0 ? node.genericParams : undefined,
    };

    this.define(node.name, funcType);

    // Check body
    this.pushScope();
    for (const param of node.params) {
      this.define(param.name, param.typeAnnotation || { kind: 'primitive', name: 'void' });
    }

    let hasReturn = false;
    for (const stmt of node.body) {
      const t = this.check(stmt);
      if (stmt.kind === 'ReturnStmt') {
        hasReturn = true;
        if (node.returnType) {
          const returnType = this.simplifyConditional(node.returnType, this.scopes[this.scopes.length - 1]);
          if (!this.isSubtype(t, returnType)) {
            throw new TypeError(
              `Return type ${this.typeToString(t)} is not assignable to ${this.typeToString(returnType)}`
            );
          }
        }
      }
    }

    this.popScope();
    return funcType;
  }

  private checkReturnStmt(node: ReturnStmt): TypeAnnotation {
    if (!node.argument) return { kind: 'primitive', name: 'void' };
    return this.check(node.argument);
  }

  private checkBinaryExpr(node: BinaryExpr): TypeAnnotation {
    const left = this.check(node.left);
    const right = this.check(node.right);

    if (left.kind !== 'primitive' || left.name !== 'number') {
      throw new TypeError(`Left operand of ${node.operator} must be number, got ${this.typeToString(left)}`);
    }
    if (right.kind !== 'primitive' || right.name !== 'number') {
      throw new TypeError(`Right operand of ${node.operator} must be number, got ${this.typeToString(right)}`);
    }

    return { kind: 'primitive', name: 'number' };
  }

  private checkCallExpr(node: CallExpr): TypeAnnotation {
    const calleeType = this.check(node.callee);

    if (calleeType.kind === 'function') {
      const argTypes = node.args.map((arg) => this.check(arg));

      // Generic instantiation
      let substitution = new Map<string, TypeAnnotation>();
      if (calleeType.genericParams && calleeType.genericParams.length > 0) {
        substitution = this.inferGenerics(calleeType, argTypes);
      }

      // Check argument compatibility
      for (let i = 0; i < calleeType.params.length; i++) {
        const paramType = this.substituteType(calleeType.params[i].type, substitution);
        const argType = argTypes[i];
        if (!argType) {
          throw new TypeError(`Missing argument for parameter ${calleeType.params[i].name}`);
        }
        if (!this.isSubtype(argType, paramType)) {
          throw new TypeError(
            `Argument of type ${this.typeToString(argType)} is not assignable to parameter of type ${this.typeToString(paramType)}`
          );
        }
      }

      const returnType = this.substituteType(calleeType.returnType, substitution);
      return returnType;
    }

    // Support calling an identifier that refers to a generic parameter (rare in this subset)
    throw new TypeError(`Cannot call non-function type ${this.typeToString(calleeType)}`);
  }

  private checkIdentifier(node: Identifier): TypeAnnotation {
    const t = this.lookup(node.name);
    if (!t) {
      throw new TypeError(`Cannot find name '${node.name}'`);
    }
    return t;
  }

  private checkObjectLiteral(node: ObjectLiteral): TypeAnnotation {
    const properties: Record<string, TypeAnnotation> = {};
    for (const prop of node.properties) {
      properties[prop.key] = this.check(prop.value);
    }
    return { kind: 'object', properties };
  }

  // ============================================================
  // Subtyping (width subtyping for objects)
  // ============================================================

  isSubtype(sub: TypeAnnotation, sup: TypeAnnotation): boolean {
    if (this.typeEqual(sub, sup)) return true;

    // primitive subtyping: number is not subtype of string etc.
    if (sub.kind === 'primitive' && sup.kind === 'primitive') {
      return sub.name === sup.name;
    }

    // object width subtyping: sub must have at least all properties of sup
    if (sub.kind === 'object' && sup.kind === 'object') {
      for (const key of Object.keys(sup.properties)) {
        if (!sub.properties[key]) return false;
        if (!this.isSubtype(sub.properties[key], sup.properties[key])) return false;
      }
      return true;
    }

    // generic parameters
    if (sub.kind === 'generic' && sup.kind === 'generic') {
      return sub.name === sup.name;
    }

    // function subtyping (simplified: contravariant params, covariant return)
    if (sub.kind === 'function' && sup.kind === 'function') {
      if (sub.params.length !== sup.params.length) return false;
      for (let i = 0; i < sub.params.length; i++) {
        if (!this.isSubtype(sup.params[i].type, sub.params[i].type)) return false;
      }
      return this.isSubtype(sub.returnType, sup.returnType);
    }

    return false;
  }

  private typeEqual(a: TypeAnnotation, b: TypeAnnotation): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // ============================================================
  // Generic Instantiation
  // ============================================================

  private inferGenerics(
    funcType: TypeAnnotation & { kind: 'function' },
    argTypes: TypeAnnotation[]
  ): Map<string, TypeAnnotation> {
    const substitution = new Map<string, TypeAnnotation>();
    if (!funcType.genericParams) return substitution;

    for (let i = 0; i < funcType.params.length; i++) {
      const paramType = funcType.params[i].type;
      const argType = argTypes[i];
      if (!argType) continue;
      this.inferGenericFromType(paramType, argType, substitution);
    }

    return substitution;
  }

  private inferGenericFromType(
    paramType: TypeAnnotation,
    argType: TypeAnnotation,
    substitution: Map<string, TypeAnnotation>
  ): void {
    if (paramType.kind === 'generic') {
      if (!substitution.has(paramType.name)) {
        substitution.set(paramType.name, argType);
      }
      return;
    }

    if (paramType.kind === 'object' && argType.kind === 'object') {
      for (const key of Object.keys(paramType.properties)) {
        this.inferGenericFromType(paramType.properties[key], argType.properties[key], substitution);
      }
    }

    // For primitives, no inference needed
  }

  private substituteType(type: TypeAnnotation, substitution: Map<string, TypeAnnotation>): TypeAnnotation {
    if (type.kind === 'generic') {
      const sub = substitution.get(type.name);
      if (sub) return sub;
      return type;
    }

    if (type.kind === 'object') {
      const properties: Record<string, TypeAnnotation> = {};
      for (const key of Object.keys(type.properties)) {
        properties[key] = this.substituteType(type.properties[key], substitution);
      }
      return { kind: 'object', properties };
    }

    if (type.kind === 'function') {
      return {
        kind: 'function',
        params: type.params.map((p) => ({ name: p.name, type: this.substituteType(p.type, substitution) })),
        returnType: this.substituteType(type.returnType, substitution),
        genericParams: type.genericParams,
      };
    }

    if (type.kind === 'conditional') {
      const checkType = substitution.get(type.check) || { kind: 'generic', name: type.check };
      const simplified = this.simplifyConditional(
        { kind: 'conditional', check: type.check, extends: type.extends, trueType: type.trueType, falseType: type.falseType },
        substitution
      );
      return simplified;
    }

    return type;
  }

  // ============================================================
  // Conditional Type Simplification
  // ============================================================

  private simplifyConditional(type: TypeAnnotation, ctx: Map<string, TypeAnnotation>): TypeAnnotation {
    if (type.kind !== 'conditional') return type;

    const checkType = ctx.get(type.check);
    if (!checkType) return type; // cannot simplify

    const extendsType: TypeAnnotation = { kind: 'primitive', name: type.extends as 'number' | 'string' | 'boolean' | 'void' };

    if (this.isSubtype(checkType, extendsType)) {
      return this.substituteType(type.trueType, ctx);
    } else {
      return this.substituteType(type.falseType, ctx);
    }
  }

  // ============================================================
  // Utilities
  // ============================================================

  private typeToString(type: TypeAnnotation): string {
    switch (type.kind) {
      case 'primitive':
        return type.name;
      case 'generic':
        return type.name;
      case 'object': {
        const props = Object.entries(type.properties)
          .map(([k, v]) => `${k}: ${this.typeToString(v)}`)
          .join(', ');
        return `{ ${props} }`;
      }
      case 'function': {
        const params = type.params.map((p) => `${p.name}: ${this.typeToString(p.type)}`).join(', ');
        const generics = type.genericParams ? `<${type.genericParams.join(', ')}>` : '';
        return `${generics}(${params}) => ${this.typeToString(type.returnType)}`;
      }
      case 'conditional':
        return `${type.check} extends ${type.extends} ? ${this.typeToString(type.trueType)} : ${this.typeToString(type.falseType)}`;
    }
  }
}
