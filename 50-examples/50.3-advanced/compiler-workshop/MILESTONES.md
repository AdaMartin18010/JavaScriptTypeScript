# 里程碑总路线图

> 本文档串联 5 个里程碑的理论基础、关键算法与代码实现，并关联到 `jsts-code-lab` 中的对应模块。

---

## 路线图总览

```
M1: Mini Parser
    │
    ▼ 输出 AST
M2: Type Checker Basics
    │
    ▼ 扩展类型表示与环境
M3: Generic Inference
    │
    ▼ 扩展类型求值
M4: Conditional Types
    │
    ▼ 类型层面实践
M5: Type Challenges
```

---

## Milestone 1: Mini Parser —— 从源代码到 AST

### 目标

实现一个递归下降解析器，支持 TypeScript 子集：变量声明（带类型注解）、函数声明、接口声明、基本表达式。

### 理论基础

**上下文无关文法（CFG）**

本解析器处理的简化文法：

```bnf
Program     ::= Statement*
Statement   ::= VarDecl | FunctionDecl | InterfaceDecl | ExprStmt
VarDecl     ::= ("let" | "const") Identifier (":" Type)? ("=" Expr)? ";"
FunctionDecl::= "function" Identifier TypeParams? "(" Params? ")" (":" Type)? Block
InterfaceDecl::= "interface" Identifier "{" PropertyDecl* "}"
Type        ::= Identifier | Primitive | ArrayType | FunctionType
Primitive   ::= "number" | "string" | "boolean" | "null" | "undefined"
ArrayType   ::= Type "[]"
FunctionType::= "(" Types? ")" "=>" Type
Expr        ::= Literal | Identifier | BinaryExpr | CallExpr
```

**递归下降解析（Recursive Descent Parsing）**

每个非终结符对应一个解析函数。例如 `parseStatement()` 根据当前 Token 的类型分发到具体的解析方法。这种技术直接、易于调试，是教学首选。

### 代码示例：Mini Lexer 实现

```typescript
// lexer.ts —— 为 Mini Parser 提供 Token 流

type TokenType =
  | 'LET' | 'CONST' | 'FUNCTION' | 'INTERFACE'
  | 'IDENT' | 'NUMBER' | 'STRING' | 'BOOLEAN'
  | 'COLON' | 'SEMICOLON' | 'COMMA' | 'ASSIGN'
  | 'LPAREN' | 'RPAREN' | 'LBRACE' | 'RBRACE'
  | 'LBRACKET' | 'RBRACKET' | 'ARROW' | 'LT' | 'GT'
  | 'PLUS' | 'MINUS' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  pos: number;
}

class Lexer {
  private pos = 0;
  private keywords = new Map<string, TokenType>([
    ['let', 'LET'], ['const', 'CONST'],
    ['function', 'FUNCTION'], ['interface', 'INTERFACE'],
    ['true', 'BOOLEAN'], ['false', 'BOOLEAN'],
    ['null', 'BOOLEAN'], ['undefined', 'BOOLEAN'],
    ['number', 'IDENT'], ['string', 'IDENT'], ['boolean', 'IDENT'],
  ]);

  constructor(private source: string) {}

  tokenize(): Token[] {
    const tokens: Token[] = [];
    while (this.pos < this.source.length) {
      this.skipWhitespace();
      if (this.pos >= this.source.length) break;
      tokens.push(this.nextToken());
    }
    tokens.push({ type: 'EOF', value: '', pos: this.pos });
    return tokens;
  }

  private nextToken(): Token {
    const start = this.pos;
    const ch = this.source[this.pos];

    // 标识符 / 关键字
    if (/[a-zA-Z_]/.test(ch)) {
      while (/[a-zA-Z0-9_]/.test(this.source[this.pos])) this.pos++;
      const word = this.source.slice(start, this.pos);
      const type = this.keywords.get(word) ?? 'IDENT';
      return { type, value: word, pos: start };
    }

    // 数字
    if (/\d/.test(ch)) {
      while (/\d/.test(this.source[this.pos])) this.pos++;
      return { type: 'NUMBER', value: this.source.slice(start, this.pos), pos: start };
    }

    // 字符串
    if (ch === '"' || ch === "'") {
      this.pos++;
      while (this.source[this.pos] !== ch) this.pos++;
      this.pos++; // 跳过闭合引号
      return { type: 'STRING', value: this.source.slice(start + 1, this.pos - 1), pos: start };
    }

    // 双字符符号
    if (ch === '=' && this.source[this.pos + 1] === '>') {
      this.pos += 2;
      return { type: 'ARROW', value: '=>', pos: start };
    }

    // 单字符符号
    const singles: Record<string, TokenType> = {
      ':': 'COLON', ';': 'SEMICOLON', ',': 'COMMA', '=': 'ASSIGN',
      '(': 'LPAREN', ')': 'RPAREN', '{': 'LBRACE', '}': 'RBRACE',
      '[': 'LBRACKET', ']': 'RBRACKET', '+': 'PLUS', '-': 'MINUS',
      '<': 'LT', '>': 'GT',
    };
    if (singles[ch]) {
      this.pos++;
      return { type: singles[ch], value: ch, pos: start };
    }

    throw new SyntaxError(`Unexpected character: ${ch} at ${start}`);
  }

  private skipWhitespace() {
    while (/\s/.test(this.source[this.pos])) this.pos++;
  }
}

// 使用示例
const lexer = new Lexer('let x: number = 42;');
console.log(lexer.tokenize());
```

### 代码示例：递归下降 Parser 核心

```typescript
// parser.ts —— 递归下降解析器骨架

interface ASTNode {
  kind: string;
}

interface VarDeclNode extends ASTNode {
  kind: 'VarDecl';
  name: string;
  typeAnnotation?: TypeNode;
  initializer?: ExprNode;
}

type TypeNode = { kind: 'PrimitiveType'; name: string } | { kind: 'ArrayType'; elem: TypeNode };
type ExprNode = { kind: 'Literal'; value: unknown } | { kind: 'Identifier'; name: string };

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek(): Token { return this.tokens[this.pos]; }
  private advance(): Token { return this.tokens[this.pos++]; }
  private expect(type: TokenType): Token {
    const tok = this.advance();
    if (tok.type !== type) throw new SyntaxError(`Expected ${type}, got ${tok.type}`);
    return tok;
  }

  parseProgram(): ASTNode[] {
    const stmts: ASTNode[] = [];
    while (this.peek().type !== 'EOF') {
      stmts.push(this.parseStatement());
    }
    return stmts;
  }

  private parseStatement(): ASTNode {
    const tok = this.peek();
    if (tok.type === 'LET' || tok.type === 'CONST') return this.parseVarDecl();
    if (tok.type === 'FUNCTION') return this.parseFunctionDecl();
    if (tok.type === 'INTERFACE') return this.parseInterfaceDecl();
    throw new SyntaxError(`Unexpected token: ${tok.type}`);
  }

  private parseVarDecl(): VarDeclNode {
    this.advance(); // let / const
    const name = this.expect('IDENT').value;
    let typeAnnotation: TypeNode | undefined;
    if (this.peek().type === 'COLON') {
      this.advance();
      typeAnnotation = this.parseType();
    }
    let initializer: ExprNode | undefined;
    if (this.peek().type === 'ASSIGN') {
      this.advance();
      initializer = this.parseExpr();
    }
    this.expect('SEMICOLON');
    return { kind: 'VarDecl', name, typeAnnotation, initializer };
  }

  private parseType(): TypeNode {
    const name = this.expect('IDENT').value;
    if (this.peek().type === 'LBRACKET') {
      this.expect('LBRACKET');
      this.expect('RBRACKET');
      return { kind: 'ArrayType', elem: { kind: 'PrimitiveType', name } };
    }
    return { kind: 'PrimitiveType', name };
  }

  private parseExpr(): ExprNode {
    const tok = this.peek();
    if (tok.type === 'NUMBER') {
      this.advance();
      return { kind: 'Literal', value: Number(tok.value) };
    }
    if (tok.type === 'IDENT') {
      this.advance();
      return { kind: 'Identifier', name: tok.value };
    }
    throw new SyntaxError(`Unexpected expression token: ${tok.type}`);
  }

  private parseFunctionDecl(): ASTNode {
    // 简化版：识别到 function 关键字后消费至块结束
    this.advance(); // function
    const name = this.expect('IDENT').value;
    this.expect('LPAREN');
    // 参数解析省略...
    this.expect('RPAREN');
    this.expect('LBRACE');
    let depth = 1;
    while (depth > 0) {
      const t = this.advance();
      if (t.type === 'LBRACE') depth++;
      if (t.type === 'RBRACE') depth--;
    }
    return { kind: 'FunctionDecl', name } as ASTNode;
  }

  private parseInterfaceDecl(): ASTNode {
    this.advance(); // interface
    const name = this.expect('IDENT').value;
    this.expect('LBRACE');
    // 属性解析省略...
    this.expect('RBRACE');
    return { kind: 'InterfaceDecl', name } as ASTNode;
  }
}
```

**与 `jsts-code-lab/79-compiler-design/` 的关联**

| 本工作坊 | 代码实验室 | 说明 |
|---------|----------|------|
| `lexer.ts` | `79-compiler-design/lexer.ts` | 实验室版本支持完整 JS Token；本版仅支持 TS 子集 |
| `parser.ts` | `79-compiler-design/parser.ts` | 实验室版本支持完整表达式优先级；本版增加类型注解解析 |
| `ast.ts` | `79-compiler-design/ast.ts` | 实验室版本为完整 ESTree；本版增加 TypeAnnotation 节点 |

---

## Milestone 2: Type Checker Basics —— 结构化类型系统

### 目标

基于 M1 的 AST，实现基础类型检查：原始类型推断、赋值兼容性、函数签名检查、接口形状检查。

### 理论基础

**类型环境（Type Environment / Γ）**

类型检查是一个在环境 Γ 下推导表达式类型的过程：

```
Γ ⊢ e : τ    （在环境 Γ 下，表达式 e 具有类型 τ）
```

环境是栈结构：进入函数体时 pushScope()，退出时 popScope()。

**结构子类型（Structural Subtyping）**

TypeScript 采用结构子类型，而非 Java/C# 的名义子类型：

```
τ₁ <: τ₂  ⟺  τ₂ 的所有成员都在 τ₁ 中存在且类型兼容
```

本阶段实现宽度子类型（width subtyping）：`{ x: number, y: number }` 可赋值给 `{ x: number }`。

### 代码示例：类型检查器核心

```typescript
// checker.ts —— 基础类型检查器

type Type =
  | { kind: 'primitive'; name: 'number' | 'string' | 'boolean' | 'null' | 'undefined' }
  | { kind: 'object'; props: Map<string, Type> }
  | { kind: 'function'; params: Type[]; ret: Type }
  | { kind: 'unknown' }
  | { kind: 'error' };

class TypeChecker {
  private env: Map<string, Type>[] = [new Map()];

  private currentScope(): Map<string, Type> {
    return this.env[this.env.length - 1];
  }

  pushScope() { this.env.push(new Map()); }
  popScope() { this.env.pop(); }

  declare(name: string, type: Type) {
    this.currentScope().set(name, type);
  }

  lookup(name: string): Type {
    for (let i = this.env.length - 1; i >= 0; i--) {
      if (this.env[i].has(name)) return this.env[i].get(name)!;
    }
    return { kind: 'error' };
  }

  // 结构子类型判断
  isSubtype(sub: Type, superType: Type): boolean {
    if (superType.kind === 'unknown') return true;
    if (sub.kind !== superType.kind) return false;

    if (sub.kind === 'primitive' && superType.kind === 'primitive') {
      return sub.name === superType.name;
    }

    if (sub.kind === 'object' && superType.kind === 'object') {
      // 宽度子类型：superType 的所有属性必须存在于 sub 中
      for (const [key, superProp] of superType.props) {
        const subProp = sub.props.get(key);
        if (!subProp) return false;
        if (!this.isSubtype(subProp, superProp)) return false;
      }
      return true;
    }

    if (sub.kind === 'function' && superType.kind === 'function') {
      // 逆变参数 + 协变返回
      if (sub.params.length !== superType.params.length) return false;
      for (let i = 0; i < sub.params.length; i++) {
        if (!this.isSubtype(superType.params[i], sub.params[i])) return false; // 参数逆变
      }
      return this.isSubtype(sub.ret, superType.ret); // 返回协变
    }

    return false;
  }

  checkExpr(expr: ExprNode): Type {
    switch (expr.kind) {
      case 'Literal':
        if (typeof expr.value === 'number') return { kind: 'primitive', name: 'number' };
        if (typeof expr.value === 'string') return { kind: 'primitive', name: 'string' };
        if (typeof expr.value === 'boolean') return { kind: 'primitive', name: 'boolean' };
        return { kind: 'unknown' };
      case 'Identifier':
        return this.lookup(expr.name);
      default:
        return { kind: 'unknown' };
    }
  }

  checkVarDecl(node: VarDeclNode): boolean {
    const initType = node.initializer ? this.checkExpr(node.initializer) : { kind: 'unknown' };
    if (node.typeAnnotation) {
      const declared = this.astTypeToCheckerType(node.typeAnnotation);
      if (!this.isSubtype(initType, declared)) {
        console.error(`Type error: ${this.typeToString(initType)} is not assignable to ${this.typeToString(declared)}`);
        return false;
      }
      this.declare(node.name, declared);
    } else {
      this.declare(node.name, initType);
    }
    return true;
  }

  private astTypeToCheckerType(t: TypeNode): Type {
    if (t.kind === 'PrimitiveType') {
      const p = t.name as 'number' | 'string' | 'boolean';
      return { kind: 'primitive', name: p };
    }
    return { kind: 'unknown' };
  }

  private typeToString(t: Type): string {
    if (t.kind === 'primitive') return t.name;
    if (t.kind === 'object') return `{ ${Array.from(t.props.entries()).map(([k, v]) => `${k}: ${this.typeToString(v)}`).join(', ')} }`;
    if (t.kind === 'function') return `(${t.params.map((p) => this.typeToString(p)).join(', ')}) => ${this.typeToString(t.ret)}`;
    return t.kind;
  }
}

// 测试用例
const checker = new TypeChecker();
checker.declare('x', { kind: 'primitive', name: 'number' });
console.log(checker.isSubtype(
  { kind: 'object', props: new Map([['x', { kind: 'primitive', name: 'number' }], ['y', { kind: 'primitive', name: 'string' }]]) },
  { kind: 'object', props: new Map([['x', { kind: 'primitive', name: 'number' }]]) }
)); // true — 宽度子类型
```

**与 `jsts-code-lab/40-type-theory-formal/` 的关联**

| 概念 | 理论文件 | 说明 |
|------|---------|------|
| 结构子类型 | `02-subtyping/structural-subtyping.ts` | 实验室版本包含深度子类型规则；本版聚焦宽度子类型 |
| 类型环境 | `THEORY.md` §2.2 | 自然演绎风格的类型判断规则 |

---

## Milestone 3: Generic Inference —— 基于约束的推断

### 目标

扩展类型检查器，支持泛型函数声明、调用点类型推断、泛型约束。

### 理论基础

**Hindley-Milner vs TypeScript 推断**

| 特性 | HM 算法 | TypeScript |
|------|---------|-----------|
| 策略 | 全局合一（Unification） | 局部约束推断 |
| 多态 | let-多态 | 显式泛型参数 |
| 子类型 | 不支持 | 结构子类型 |
| 上下文类型 | 不支持 | 支持 |

本阶段实现的是 **TypeScript 风格的约束推断**，而非完整 HM：

1. 为泛型参数创建类型变量（如 `T`）
2. 在函数调用时，对比实参类型与形参类型，生成替换映射（substitution）
3. 应用替换到返回类型

**合一（Unification）的简化版**

```
unify(T, number)  →  { T ↦ number }
unify(Array<T>, Array<number>)  →  { T ↦ number }
unify(T, U)  →  错误（未绑定变量）
```

### 代码示例：泛型约束推断实现

```typescript
// generic-inference.ts —— TypeScript 风格的泛型推断

type TypeVar = { kind: 'var'; id: number };

class GenericInference {
  private varCounter = 0;

  freshVar(): TypeVar {
    return { kind: 'var', id: this.varCounter++ };
  }

  // 从函数调用中推断泛型参数
  inferGenericArgs(
    genericParams: string[],
    paramTypes: Type[],
    argTypes: Type[],
  ): Map<number, Type> {
    const subst = new Map<number, Type>();

    for (let i = 0; i < paramTypes.length; i++) {
      this.collectConstraints(paramTypes[i], argTypes[i], subst);
    }

    return subst;
  }

  private collectConstraints(param: Type, arg: Type, subst: Map<number, Type>): void {
    if (param.kind === 'var') {
      // 类型变量 → 直接绑定
      subst.set(param.id, arg);
      return;
    }

    if (param.kind === 'primitive' && arg.kind === 'primitive') {
      if (param.name !== arg.name) {
        throw new TypeError(`Type mismatch: ${param.name} vs ${arg.name}`);
      }
      return;
    }

    if (param.kind === 'object' && arg.kind === 'object') {
      for (const [key, pType] of param.props) {
        const aType = arg.props.get(key);
        if (!aType) throw new TypeError(`Missing property: ${key}`);
        this.collectConstraints(pType, aType, subst);
      }
      return;
    }

    if (param.kind === 'function' && arg.kind === 'function') {
      for (let i = 0; i < param.params.length; i++) {
        this.collectConstraints(param.params[i], arg.params[i], subst);
      }
      this.collectConstraints(param.ret, arg.ret, subst);
      return;
    }
  }

  applySubst(type: Type, subst: Map<number, Type>): Type {
    if (type.kind === 'var') {
      return subst.get(type.id) ?? type;
    }
    if (type.kind === 'object') {
      const newProps = new Map<string, Type>();
      for (const [k, v] of type.props) {
        newProps.set(k, this.applySubst(v, subst));
      }
      return { kind: 'object', props: newProps };
    }
    if (type.kind === 'function') {
      return {
        kind: 'function',
        params: type.params.map((p) => this.applySubst(p, subst)),
        ret: this.applySubst(type.ret, subst),
      };
    }
    return type;
  }
}

// 测试：推断 identity<T>(x: T): T 的 T
const gi = new GenericInference();
const T = gi.freshVar();
const subst = gi.inferGenericArgs(
  ['T'],
  [{ kind: 'var', id: T.id }],        // param: T
  [{ kind: 'primitive', name: 'number' }] // arg: number
);
const returnType = gi.applySubst({ kind: 'var', id: T.id }, subst);
console.log(returnType); // { kind: 'primitive', name: 'number' }
```

**与 `jsts-code-lab/40-type-theory-formal/` 的关联**

| 概念 | 理论文件 | 说明 |
|------|---------|------|
| 合一算法 | `01-type-inference/hindley-milner.ts` | 实验室版本实现完整 HM；本版是 TS 风格的简化 |
| 约束推断 | `THEORY.md` §4.1 | TS 使用自底向上的约束收集 |

---

## Milestone 4: Conditional Types —— 类型级条件分支

### 目标

实现 TypeScript 条件类型 `T extends U ? X : Y` 和 `infer` 关键字的类型求值。

### 理论基础

**条件类型的语义**

条件类型是**类型层面的三元运算符**：

```
T extends U ? X : Y
```

求值规则：

1. 若 `T` 是 `U` 的子类型，结果为 `X`
2. 否则结果为 `Y`
3. 若 `T` 是未确定的泛型参数，则类型保持延迟求值（deferred）

**infer 关键字**

`infer` 在条件类型中引入**类型变量绑定**：

```
T extends Array<infer U> ? U : never
```

当 `T = Array<string>` 时，`U` 被绑定为 `string`，结果为 `string`。

这本质上是**模式匹配（Pattern Matching）**在类型层面的应用。

**映射类型（Mapped Types）**

```
{ [K in keyof T]: X }
```

语义：对 `T` 的每个属性键 `K`，创建新属性，类型为 `X`（可引用 `K`）。

本阶段实现映射类型的简化版，支持 `keyof` 展开和属性遍历。

### 代码示例：条件类型与 infer 的实现

```typescript
// conditional-types.ts —— 类型级条件求值引擎

type ConditionalType = {
  kind: 'conditional';
  check: Type;
  extends: Type;
  trueBranch: Type;
  falseBranch: Type;
};

type InferType = { kind: 'infer'; name: string };

class TypeEvaluator {
  private inferBindings = new Map<string, Type>();

  evaluateConditional(ct: ConditionalType): Type {
    // 检查 check 是否是 extends 的子类型
    if (this.isAssignable(ct.check, ct.extends)) {
      // 尝试提取 infer 绑定
      this.extractInferBindings(ct.check, ct.extends);
      return this.applyInferBindings(ct.trueBranch);
    }
    return ct.falseBranch;
  }

  private isAssignable(source: Type, target: Type): boolean {
    // 简化版：检查 source 是否可以赋值给 target
    if (target.kind === 'unknown') return true;
    if (source.kind === 'primitive' && target.kind === 'primitive') {
      return source.name === target.name;
    }
    if (target.kind === 'object') {
      // 检查 source 是否包含 target 的所有属性
      if (source.kind !== 'object') return false;
      for (const [key, tType] of target.props) {
        const sType = source.props.get(key);
        if (!sType) return false;
        if (!this.isAssignable(sType, tType)) return false;
      }
      return true;
    }
    return false;
  }

  private extractInferBindings(source: Type, target: Type): void {
    // 模式匹配：target 中的 infer 变量从 source 中提取
    if (target.kind === 'object' && source.kind === 'object') {
      for (const [key, tType] of target.props) {
        const sType = source.props.get(key);
        if (sType) this.extractInferBindings(sType, tType);
      }
    }
    // 简化演示：假设 infer 变量名为 'U'，source 是数组元素类型
    if (target.kind === 'var') {
      this.inferBindings.set(`infer_${target.id}`, source);
    }
  }

  private applyInferBindings(type: Type): Type {
    if (type.kind === 'infer') {
      return this.inferBindings.get(type.name) ?? { kind: 'unknown' };
    }
    if (type.kind === 'object') {
      const newProps = new Map<string, Type>();
      for (const [k, v] of type.props) {
        newProps.set(k, this.applyInferBindings(v));
      }
      return { kind: 'object', props: newProps };
    }
    return type;
  }

  // 模拟 ArrayElement<T> = T extends Array<infer U> ? U : never
  createArrayElementExtractor(input: Type): Type {
    const U: InferType = { kind: 'infer', name: 'U' };
    return this.evaluateConditional({
      kind: 'conditional',
      check: input,
      extends: {
        kind: 'object',
        props: new Map([['0', { kind: 'var', id: 999 }]]), // 简化为数组-like
      },
      trueBranch: { kind: 'var', id: 999 }, // 返回 infer 的 U
      falseBranch: { kind: 'primitive', name: 'null' }, // never 的简化
    });
  }
}

// 测试
const evaluator = new TypeEvaluator();
const stringArray: Type = {
  kind: 'object',
  props: new Map([
    ['0', { kind: 'primitive', name: 'string' }],
    ['length', { kind: 'primitive', name: 'number' }],
  ]),
};
console.log(evaluator.isAssignable(stringArray, { kind: 'object', props: new Map([['0', { kind: 'primitive', name: 'string' }]]) }));
```

---

## Milestone 5: Type Challenges —— 类型体操工坊

### 目标

12 道渐进式类型体操题目，覆盖 TypeScript 类型系统的核心技巧。

### 难度分级

| 级别 | 题目 | 核心技巧 |
|------|------|---------|
| 🟢 简单 | 1-3 | 泛型参数、索引访问、递归映射 |
| 🟡 中等 | 4-7 | 条件类型、infer、keyof、映射类型 |
| 🔴 困难 | 8-10 | 模板字面量、递归类型、函数类型变换 |
| ⚫ 地狱 | 11-12 | 分布式条件类型、类型级解析器 |

### 代码示例：类型挑战参考解答

```typescript
// type-challenges-solutions.ts —— 典型题目的类型级实现

// 题目 1: MyPick<T, K> —— 从 T 中挑选 K 指定的属性
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 题目 2: MyReadonly<T> —— 将 T 的所有属性变为只读
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 题目 3: TupleToObject<T> —— 将元组转为对象
type TupleToObject<T extends readonly (string | number)[]> = {
  [P in T[number]]: P;
};

// 题目 4: First<T> —— 获取元组第一个元素
type First<T extends unknown[]> = T extends [infer F, ...unknown[]] ? F : never;

// 题目 5: Length<T> —— 获取元组长度
type Length<T extends readonly unknown[]> = T['length'];

// 题目 6: MyExclude<T, U> —— 从 T 中排除 U
type MyExclude<T, U> = T extends U ? never : T;

// 题目 7: Awaited<T> —— 提取 Promise 的返回值
type MyAwaited<T> = T extends Promise<infer R> ? MyAwaited<R> : T;

// 题目 8: AppendArgument<T, A> —— 给函数追加参数
type AppendArgument<T extends (...args: unknown[]) => unknown, A> =
  T extends (...args: infer P) => infer R ? (...args: [...P, A]) => R : never;

// 题目 9: StringToUnion<T> —— 字符串拆分为联合类型
type StringToUnion<T extends string> =
  T extends `${infer F}${infer R}` ? F | StringToUnion<R> : never;

// 题目 10: TupleToUnion<T> —— 元组转为联合类型
type TupleToUnion<T extends readonly unknown[]> = T[number];
```

### 与前面里程碑的关系

Milestone 1-4 是**值层面**（运行时）实现类型系统；Milestone 5 是**类型层面**（编译时）使用类型系统。

这种对照设计让你理解：

- 在值层面，`genericSolver.ts` 如何求解泛型参数？
- 在类型层面，`Exclude<T, U>` 如何用条件类型实现相同逻辑？
- 真实 TypeScript 编译器将类型层面的表达式**编译**为值层面的类型检查算法

---

## 学习检查清单

完成本工作坊后，你应该能够：

- [ ] 手写一个递归下降解析器处理类型注解
- [ ] 解释结构子类型与名义子类型的区别
- [ ] 实现基础的类型替换（substitution）算法
- [ ] 说明 `infer` 在类型层面的模式匹配机制
- [ ] 独立完成 type-challenges 中 "medium" 级别的题目
- [ ] 阅读 TypeScript `checker.ts` 源码时不感到完全陌生

---

## 权威参考链接

- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) — 直接操作 TS 类型系统的编程接口
- [TypeScript AST Viewer](https://ts-ast-viewer.com/) — 交互式 AST 可视化工具
- [Type Challenges GitHub](https://github.com/type-challenges/type-challenges) — 类型体操题库与社区解答
- [ECMA-262 Specification](https://tc39.es/ecma262/) — JavaScript 语言规范
- [Crafting Interpreters](https://craftinginterpreters.com/) — Robert Nystrom 编写的编译器实现经典教材
- [Programming Language Theory Wiki](https://github.com/steshaw/plt) — 程序语言理论资源汇总
- [The Super Tiny Compiler](https://github.com/jamiebuilds/the-super-tiny-compiler) — 极简编译器教学实现
- [TypeScript Compiler Source (checker.ts)](https://github.com/microsoft/TypeScript/blob/main/src/compiler/checker.ts) — 真实类型检查器源码（~5万行）
- [Parsing Techniques (Aho, Ullman)](https://en.wikipedia.org/wiki/Compilers:_Principles,_Techniques,_and_Tools) — 编译原理龙书
- [Types and Programming Languages (Pierce)](https://www.cis.upenn.edu/~bcpierce/tapl/) — 类型理论标准教材（TAPL）
- [Recursive Descent Parsing](https://craftinginterpreters.com/parsing-expressions.html) — Crafting Interpreters 解析章节
- [Type Inference Algorithms](https://en.wikipedia.org/wiki/Type_inference) — 类型推断算法综述
- [Hindley-Milner Type System](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system) — HM 类型系统百科

> "Types are the leaven of programming; they make it digestible." —— Robin Milner
