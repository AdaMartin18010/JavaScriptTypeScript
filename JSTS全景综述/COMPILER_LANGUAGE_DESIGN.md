# 编译器与语言设计深度指南

> 涵盖编译器架构、词法分析、语法分析、AST、语义分析、中间表示、代码优化、垃圾回收、类型系统和DSL设计的全面技术文档

---

## 目录

- [编译器与语言设计深度指南](#编译器与语言设计深度指南)
  - [目录](#目录)
  - [1. 编译器架构理论（前端-中端-后端）](#1-编译器架构理论前端-中端-后端)
    - [1.1 理论解释](#11-理论解释)
      - [编译器流水线概览](#编译器流水线概览)
      - [各阶段职责](#各阶段职责)
    - [1.2 形式化定义](#12-形式化定义)
    - [1.3 架构优势](#13-架构优势)
    - [1.4 算法伪代码](#14-算法伪代码)
    - [1.5 实现示例](#15-实现示例)
    - [1.6 工具推荐](#16-工具推荐)
  - [2. 词法分析](#2-词法分析)
    - [2.1 理论解释](#21-理论解释)
      - [正则表达式与正则语言](#正则表达式与正则语言)
      - [有限状态机](#有限状态机)
    - [2.2 算法伪代码](#22-算法伪代码)
      - [Thompson构造算法](#thompson构造算法)
      - [子集构造算法（NFA → DFA）](#子集构造算法nfa--dfa)
      - [词法分析器（Scanner）](#词法分析器scanner)
    - [2.3 实现示例](#23-实现示例)
    - [2.4 工具推荐](#24-工具推荐)
  - [3. 语法分析](#3-语法分析)
    - [3.1 理论解释](#31-理论解释)
      - [上下文无关文法（CFG）](#上下文无关文法cfg)
      - [文法分类（Chomsky层次）](#文法分类chomsky层次)
    - [3.2 算法伪代码](#32-算法伪代码)
      - [递归下降解析](#递归下降解析)
      - [LL(1) 预测解析](#ll1-预测解析)
    - [3.3 实现示例](#33-实现示例)
    - [3.4 工具推荐](#34-工具推荐)
  - [4. AST 的形式化定义和操作](#4-ast-的形式化定义和操作)
    - [4.1 理论解释](#41-理论解释)
      - [形式化定义](#形式化定义)
      - [Visitor模式](#visitor模式)
    - [4.2 算法伪代码](#42-算法伪代码)
      - [AST遍历](#ast遍历)
    - [4.3 实现示例](#43-实现示例)
    - [4.4 工具推荐](#44-工具推荐)
  - [5. 语义分析](#5-语义分析)
    - [5.1 理论解释](#51-理论解释)
      - [主要任务](#主要任务)
      - [属性文法](#属性文法)
    - [5.2 算法伪代码](#52-算法伪代码)
      - [符号表管理](#符号表管理)
      - [类型检查](#类型检查)
    - [5.3 实现示例](#53-实现示例)
    - [5.4 工具推荐](#54-工具推荐)
  - [6. 中间表示（IR）和三地址码](#6-中间表示ir和三地址码)
    - [6.1 理论解释](#61-理论解释)
      - [IR的分类](#ir的分类)
      - [三地址码（TAC）](#三地址码tac)
    - [6.2 算法伪代码](#62-算法伪代码)
      - [AST到三地址码转换](#ast到三地址码转换)
      - [基本块划分](#基本块划分)
    - [6.3 实现示例](#63-实现示例)
    - [6.4 工具推荐](#64-工具推荐)
  - [7. 代码生成和优化](#7-代码生成和优化)
    - [7.1 理论解释](#71-理论解释)
      - [优化级别](#优化级别)
      - [优化分类](#优化分类)
    - [7.2 算法伪代码](#72-算法伪代码)
      - [常量折叠](#常量折叠)
      - [死代码消除](#死代码消除)
      - [公共子表达式消除（CSE）](#公共子表达式消除cse)
      - [简单寄存器分配](#简单寄存器分配)
    - [7.3 实现示例](#73-实现示例)
    - [7.4 工具推荐](#74-工具推荐)
  - [8. 垃圾回收理论](#8-垃圾回收理论)
    - [8.1 理论解释](#81-理论解释)
      - [核心概念](#核心概念)
      - [GC算法分类](#gc算法分类)
    - [8.2 算法伪代码](#82-算法伪代码)
      - [标记-清除算法](#标记-清除算法)
      - [引用计数](#引用计数)
      - [分代垃圾回收](#分代垃圾回收)
      - [增量/并发GC](#增量并发gc)
    - [8.3 实现示例](#83-实现示例)
    - [8.4 工具推荐](#84-工具推荐)
  - [9. 类型系统的实现](#9-类型系统的实现)
    - [9.1 理论解释](#91-理论解释)
      - [Lambda演算类型](#lambda演算类型)
      - [类型系统分类](#类型系统分类)
    - [9.2 Hindley-Milner类型推导](#92-hindley-milner类型推导)
      - [算法W](#算法w)
    - [9.3 子类型与多态](#93-子类型与多态)
      - [子类型规则](#子类型规则)
    - [9.4 实现示例](#94-实现示例)
    - [9.5 工具推荐](#95-工具推荐)
  - [10. 领域特定语言（DSL）的设计](#10-领域特定语言dsl的设计)
    - [10.1 理论解释](#101-理论解释)
      - [DSL分类](#dsl分类)
      - [DSL设计原则](#dsl设计原则)
    - [10.2 DSL实现模式](#102-dsl实现模式)
      - [解析器组合子](#解析器组合子)
      - [解释器模式](#解释器模式)
    - [10.3 实现示例](#103-实现示例)
    - [10.4 工具推荐](#104-工具推荐)
  - [总结](#总结)

---

## 1. 编译器架构理论（前端-中端-后端）

### 1.1 理论解释

现代编译器通常采用**三段式设计（Three-Phase Design）**，将编译过程划分为前端（Frontend）、中端（Middle-end）和后端（Backend）三个主要阶段。

#### 编译器流水线概览

```
源代码 → [前端] → AST → [中端] → IR → [后端] → 目标代码
```

#### 各阶段职责

| 阶段 | 主要职责 | 输出 |
|------|---------|------|
| **前端** | 词法分析、语法分析、语义分析、错误报告 | AST (抽象语法树) |
| **中端** | 中间表示生成、机器无关优化 | IR (中间表示) |
| **后端** | 代码生成、寄存器分配、机器相关优化 | 目标机器码 |

### 1.2 形式化定义

编译器可以形式化定义为转换函数：

```
C: L_source → L_target
```

其中 C 保持语义等价。

### 1.3 架构优势

**多前端-多后端架构：**

```
        C前端 —┐
        C++前端—┤
        Rust前端—┼→ 通用IR —→ x86后端
        Swift前端—┤         ARM后端
        ...      ┘         WASM后端
```

对于 n 个前端和 m  个后端，三段式架构只需要 n + m 个组件。

### 1.4 算法伪代码

```
Algorithm Compile(source)
    // 前端处理
    tokens ← LexicalAnalysis(source)
    ast ← SyntaxAnalysis(tokens)
    annotated_ast ← SemanticAnalysis(ast)

    // 中端处理
    ir ← GenerateIR(annotated_ast)
    optimized_ir ← Optimize(ir)

    // 后端处理
    machine_code ← CodeGeneration(optimized_ir)
    final_code ← RegisterAllocation(machine_code)

    return final_code
```

### 1.5 实现示例

```typescript
// 编译器主类架构
abstract class CompilerPhase<TInput, TOutput> {
    abstract execute(input: TInput): TOutput;

    protected reportError(error: CompilerError): void {
        console.error(`[${this.constructor.name}] ${error.message}`);
    }
}

// 前端基类
abstract class Frontend extends CompilerPhase<string, AST> {
    protected lexer: Lexer;
    protected parser: Parser;

    compile(source: string): AST {
        const tokens = this.lexer.tokenize(source);
        return this.parser.parse(tokens);
    }
}

// 中端基类
abstract class MiddleEnd extends CompilerPhase<AST, IR> {
    protected irGenerator: IRGenerator;
    protected optimizer: Optimizer;

    compile(ast: AST): IR {
        const ir = this.irGenerator.generate(ast);
        return this.optimizer.optimize(ir);
    }
}

// 后端基类
abstract class Backend extends CompilerPhase<IR, MachineCode> {
    protected codeGenerator: CodeGenerator;
    protected registerAllocator: RegisterAllocator;

    compile(ir: IR): MachineCode {
        const assembly = this.codeGenerator.generate(ir);
        return this.registerAllocator.allocate(assembly);
    }
}

// 完整编译器
class Compiler {
    constructor(
        private frontend: Frontend,
        private middleEnd: MiddleEnd,
        private backend: Backend
    ) {}

    compile(source: string): MachineCode {
        const ast = this.frontend.compile(source);
        const ir = this.middleEnd.compile(ast);
        return this.backend.compile(ir);
    }
}
```

### 1.6 工具推荐

| 工具 | 用途 | 语言 |
|------|------|------|
| **LLVM** | 完整的编译器基础设施 | C++ |
| **GCC** | GNU编译器集合 | C/C++ |
| **MLIR** | 多级中间表示 | C++ |
| **Cranelift** | 代码生成后端 | Rust |
| **Babel** | JavaScript编译/转译 | JavaScript |
| **SWC** | 快速JavaScript/TypeScript编译器 | Rust |

---

## 2. 词法分析

### 2.1 理论解释

**词法分析（Lexical Analysis）** 是编译的第一个阶段，将字符流转换为标记（Token）流。

#### 正则表达式与正则语言

正则表达式定义的词法结构可以被**有限状态机（FSM）** 识别。

#### 有限状态机

**确定有限自动机（DFA）** 定义为五元组：M = (Q, Σ, δ, q0, F)

其中：

- Q：有限状态集合
- Σ：输入字母表
- δ: Q × Σ → Q：转移函数
- q0 ∈ Q：初始状态
- F ⊆ Q：接受状态集合

**Thompson构造**：任何正则表达式都可以转换为等价的NFA。

**子集构造**：任何NFA都可以转换为等价的DFA。

### 2.2 算法伪代码

#### Thompson构造算法

```
Algorithm ThompsonConstruction(regex)
    if regex = ∅ then
        return NFA with single state (non-accepting)

    if regex = ε then
        return NFA with single accepting state

    if regex = a (where a ∈ Σ) then
        return NFA: q0 --a--> q1 (q1 is accepting)

    if regex = r|s then
        N_r ← ThompsonConstruction(r)
        N_s ← ThompsonConstruction(s)
        return Union(N_r, N_s)

    if regex = rs then
        N_r ← ThompsonConstruction(r)
        N_s ← ThompsonConstruction(s)
        return Concatenation(N_r, N_s)

    if regex = r* then
        N_r ← ThompsonConstruction(r)
        return KleeneClosure(N_r)
```

#### 子集构造算法（NFA → DFA）

```
Algorithm SubsetConstruction(NFA N)
    DFA M ← new DFA()
    initial ← ε-closure({N.start})
    M.start ← initial
    M.states ← {initial}
    unmarked ← {initial}

    while unmarked ≠ ∅ do
        T ← pop(unmarked)
        mark T

        for each input symbol a do
            U ← ε-closure(move(T, a))
            if U ∉ M.states then
                M.states ← M.states ∪ {U}
                unmarked ← unmarked ∪ {U}
            end if
            M.transition[T, a] ← U
        end for
    end while

    return M
```

#### 词法分析器（Scanner）

```
Algorithm Scan(input, dfa)
    tokens ← []
    i ← 0

    while i < input.length do
        state ← dfa.start
        lastAccept ← -1
        lastAcceptPos ← i

        while i < input.length and state ≠ dead do
            state ← dfa.transition[state, input[i]]
            if state ∈ dfa.accepting then
                lastAccept ← state
                lastAcceptPos ← i
            end if
            i ← i + 1
        end while

        if lastAccept ≠ -1 then
            token ← createToken(lastAccept, input[start..lastAcceptPos])
            tokens.append(token)
            i ← lastAcceptPos + 1
        else
            reportError("Invalid token at position", i)
            i ← i + 1
        end if
    end while

    return tokens
```

### 2.3 实现示例

```typescript
// Token 类型定义
enum TokenType {
    NUMBER = "NUMBER",
    IDENTIFIER = "IDENTIFIER",
    KEYWORD = "KEYWORD",
    OPERATOR = "OPERATOR",
    STRING = "STRING",
    EOF = "EOF"
}

interface Token {
    type: TokenType;
    value: string;
    line: number;
    column: number;
}

// DFA 状态
interface DFAState {
    id: number;
    isAccepting: boolean;
    tokenType?: TokenType;
    transitions: Map<string, number>;
}

class DFA {
    states: DFAState[] = [];
    startState: number = 0;
    currentState: number = 0;

    addState(isAccepting: boolean, tokenType?: TokenType): number {
        const id = this.states.length;
        this.states.push({
            id,
            isAccepting,
            tokenType,
            transitions: new Map()
        });
        return id;
    }

    addTransition(from: number, symbol: string, to: number): void {
        this.states[from].transitions.set(symbol, to);
    }

    reset(): void {
        this.currentState = this.startState;
    }

    transition(symbol: string): boolean {
        const state = this.states[this.currentState];
        const next = state.transitions.get(symbol);

        if (next !== undefined) {
            this.currentState = next;
            return true;
        }
        return false;
    }

    isAccepting(): boolean {
        return this.states[this.currentState].isAccepting;
    }

    getTokenType(): TokenType | undefined {
        return this.states[this.currentState].tokenType;
    }
}

// 词法分析器
class Lexer {
    private dfa: DFA;
    private source: string;
    private position: number = 0;
    private line: number = 1;
    private column: number = 1;

    constructor(source: string) {
        this.source = source;
        this.dfa = this.buildDFA();
    }

    private buildDFA(): DFA {
        const dfa = new DFA();
        const s0 = dfa.addState(false);
        dfa.startState = s0;

        const s1 = dfa.addState(false);
        const s2 = dfa.addState(true, TokenType.NUMBER);

        const s3 = dfa.addState(false);
        const s4 = dfa.addState(true, TokenType.IDENTIFIER);

        const s7 = dfa.addState(true, TokenType.OPERATOR);

        // 数字: [0-9]+
        for (let c = 48; c <= 57; c++) {
            const char = String.fromCharCode(c);
            dfa.addTransition(s0, char, s1);
            dfa.addTransition(s1, char, s1);
        }
        dfa.addTransition(s1, " ", s2);
        dfa.addTransition(s1, "\n", s2);

        // 标识符: [a-zA-Z][a-zA-Z0-9]*
        for (let c = 97; c <= 122; c++) {
            const char = String.fromCharCode(c);
            dfa.addTransition(s0, char, s3);
            dfa.addTransition(s3, char, s3);
        }
        for (let c = 65; c <= 90; c++) {
            const char = String.fromCharCode(c);
            dfa.addTransition(s0, char, s3);
            dfa.addTransition(s3, char, s3);
        }
        dfa.addTransition(s3, " ", s4);
        dfa.addTransition(s3, "\n", s4);

        // 简单运算符
        const ops = ["+", "-", "*", "/", "=", "<", ">", "!"];
        for (const op of ops) {
            dfa.addTransition(s0, op, s7);
        }

        return dfa;
    }

    tokenize(): Token[] {
        const tokens: Token[] = [];
        while (this.position < this.source.length) {
            this.skipWhitespace();
            if (this.position >= this.source.length) break;
            const token = this.nextToken();
            if (token) tokens.push(token);
        }
        tokens.push({ type: TokenType.EOF, value: "", line: this.line, column: this.column });
        return tokens;
    }

    private skipWhitespace(): void {
        while (this.position < this.source.length && /\s/.test(this.source[this.position])) {
            if (this.source[this.position] === "\n") {
                this.line++;
                this.column = 1;
            } else {
                this.column++;
            }
            this.position++;
        }
    }

    private nextToken(): Token | null {
        const startPos = this.position;
        const startLine = this.line;
        const startCol = this.column;

        this.dfa.reset();
        let lastAccept = -1;
        let lastAcceptPos = startPos;

        while (this.position < this.source.length) {
            const char = this.source[this.position];
            if (!this.dfa.transition(char)) break;
            if (this.dfa.isAccepting()) {
                lastAccept = this.dfa.currentState;
                lastAcceptPos = this.position;
            }
            this.position++;
            this.column++;
        }

        if (lastAccept !== -1) {
            const value = this.source.substring(startPos, lastAcceptPos + 1);
            const tokenType = this.dfa.states[lastAccept].tokenType!;
            return { type: tokenType, value, line: startLine, column: startCol };
        }
        this.position++;
        return null;
    }
}
```

### 2.4 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **Flex** | 快速词法分析器生成器 | C |
| **JFlex** | Java版本的Flex | Java |
| **ANTLR** | 完整的词法/语法分析器生成器 | 多语言 |
| **re2c** | 快速正则表达式编译器 | C/C++ |
| **JavaCC** | Java Compiler Compiler | Java |

---

## 3. 语法分析

### 3.1 理论解释

**语法分析（Syntax Analysis / Parsing）** 将Token流转换为抽象语法树（AST）。

#### 上下文无关文法（CFG）

形式定义为四元组 G = (V, T, P, S)：

- V：非终结符集合
- T：终结符集合（Token）
- P：产生式规则集合
- S：开始符号

#### 文法分类（Chomsky层次）

| 类型 | 名称 | 产生式限制 |
|------|------|-----------|
| 3 | 正则文法 | A → aB 或 A → a |
| 2 | 上下文无关 | A → α |
| 1 | 上下文有关 | αAβ → αγβ |
| 0 | 无限制 | 任意 |

### 3.2 算法伪代码

#### 递归下降解析

```
Algorithm RecursiveDescent(tokens)
    pos = 0
    return ParseS()

Function ParseS()
    node = new Node("S")
    node.left = ParseA()
    node.right = ParseB()
    return node
```

#### LL(1) 预测解析

```
Algorithm BuildLL1Table(G)
    for each production A -> alpha in G do
        for each terminal a in FIRST(alpha) do
            table[A, a] = A -> alpha
        if epsilon in FIRST(alpha) then
            for each terminal b in FOLLOW(A) do
                table[A, b] = A -> alpha
    return table
```

### 3.3 实现示例

```typescript
interface ASTNode {
    type: string;
    value?: any;
    children?: ASTNode[];
}

class RecursiveDescentParser {
    private tokens: Token[];
    private position: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    parse(): ASTNode {
        return this.parseExpression();
    }

    private parseExpression(): ASTNode {
        const node: ASTNode = { type: "Expression", children: [] };
        node.children.push(this.parseTerm());
        while (this.match(TokenType.OPERATOR, "+", "-")) {
            node.children.push({ type: "BinaryOp", value: this.previous().value });
            node.children.push(this.parseTerm());
        }
        return node;
    }

    private parseTerm(): ASTNode {
        const node: ASTNode = { type: "Term", children: [] };
        node.children.push(this.parseFactor());
        while (this.match(TokenType.OPERATOR, "*", "/")) {
            node.children.push({ type: "BinaryOp", value: this.previous().value });
            node.children.push(this.parseFactor());
        }
        return node;
    }

    private parseFactor(): ASTNode {
        if (this.match(TokenType.NUMBER)) {
            return { type: "NumberLiteral", value: parseFloat(this.previous().value) };
        }
        if (this.match(TokenType.IDENTIFIER)) {
            return { type: "Identifier", value: this.previous().value };
        }
        if (this.match(TokenType.OPERATOR, "(")) {
            const expr = this.parseExpression();
            this.consume(TokenType.OPERATOR, ")");
            return expr;
        }
        throw new Error("Unexpected token");
    }

    private match(type: TokenType, ...values: string[]): boolean {
        if (this.check(type, ...values)) {
            this.advance();
            return true;
        }
        return false;
    }

    private check(type: TokenType, ...values: string[]): boolean {
        if (this.isAtEnd()) return false;
        const token = this.peek();
        return token.type === type and (values.length === 0 or values.includes(token.value));
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.position++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.position];
    }

    private previous(): Token {
        return this.tokens[this.position - 1];
    }

    private consume(type: TokenType, value?: string): Token {
        if (this.check(type, ...(value ? [value] : []))) {
            return this.advance();
        }
        throw new Error("Expected token");
    }
}
```

### 3.4 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **Bison/Yacc** | LALR解析器生成器 | C |
| **ANTLR** | LL(*)解析器生成器 | 多语言 |
| **Happy** | Haskell解析器生成器 | Haskell |
| **Menhir** | OCaml的LR(1)解析器生成器 | OCaml |
| **Tree-sitter** | 增量解析库 | C/Rust |

---

## 4. AST 的形式化定义和操作

### 4.1 理论解释

**抽象语法树（Abstract Syntax Tree, AST）** 是源代码语法结构的树形表示。

#### 形式化定义

AST可以定义为代数数据类型（ADT）：

```
AST = Program(stmts: Statement*)
Statement = Let(name: string, value: Expression)
          | Function(name: string, params: string*, body: Statement*)
          | If(condition: Expression, then: Statement*, else: Statement*)

Expression = Binary(left: Expression, op: Operator, right: Expression)
           | Unary(op: Operator, operand: Expression)
           | Literal(value: number | string | boolean)
           | Identifier(name: string)
           | Call(func: Expression, args: Expression*)
```

#### Visitor模式

AST操作的标准设计模式，将操作与数据结构分离。

### 4.2 算法伪代码

#### AST遍历

```
Algorithm PreorderTraversal(node, visitor)
    visitor.enter(node)
    for child in node.children do
        PreorderTraversal(child, visitor)
    visitor.exit(node)

Algorithm PostorderTraversal(node, visitor)
    for child in node.children do
        PostorderTraversal(child, visitor)
    visitor.visit(node)

Algorithm LevelOrderTraversal(root, visitor)
    queue = [root]
    while queue not empty do
        node = dequeue(queue)
        visitor.visit(node)
        for child in node.children do
            enqueue(queue, child)
```

### 4.3 实现示例

```typescript
// AST节点类型
abstract class ASTNode {
    abstract accept<T>(visitor: ASTVisitor<T>): T;
}

class BinaryExpr extends ASTNode {
    constructor(
        public left: ASTNode,
        public operator: string,
        public right: ASTNode
    ) { super(); }

    accept<T>(visitor: ASTVisitor<T>): T {
        return visitor.visitBinaryExpr(this);
    }
}

class Literal extends ASTNode {
    constructor(public value: number | string | boolean) { super(); }

    accept<T>(visitor: ASTVisitor<T>): T {
        return visitor.visitLiteral(this);
    }
}

class Identifier extends ASTNode {
    constructor(public name: string) { super(); }

    accept<T>(visitor: ASTVisitor<T>): T {
        return visitor.visitIdentifier(this);
    }
}

// Visitor接口
interface ASTVisitor<T> {
    visitBinaryExpr(expr: BinaryExpr): T;
    visitLiteral(literal: Literal): T;
    visitIdentifier(id: Identifier): T;
}

// 具体Visitor：求值
class Evaluator implements ASTVisitor<number> {
    private variables: Map<string, number> = new Map();

    visitBinaryExpr(expr: BinaryExpr): number {
        const left = expr.left.accept(this);
        const right = expr.right.accept(this);

        switch (expr.operator) {
            case "+": return left + right;
            case "-": return left - right;
            case "*": return left * right;
            case "/": return left / right;
            default: throw new Error(`Unknown operator: ${expr.operator}`);
        }
    }

    visitLiteral(literal: Literal): number {
        if (typeof literal.value === "number") return literal.value;
        throw new Error("Expected number");
    }

    visitIdentifier(id: Identifier): number {
        if (this.variables.has(id.name)) {
            return this.variables.get(id.name)!;
        }
        throw new Error(`Undefined variable: ${id.name}`);
    }

    setVariable(name: string, value: number): void {
        this.variables.set(name, value);
    }
}

// 具体Visitor：打印
class Printer implements ASTVisitor<string> {
    visitBinaryExpr(expr: BinaryExpr): string {
        const left = expr.left.accept(this);
        const right = expr.right.accept(this);
        return `(${left} ${expr.operator} ${right})`;
    }

    visitLiteral(literal: Literal): string {
        return String(literal.value);
    }

    visitIdentifier(id: Identifier): string {
        return id.name;
    }
}

// 具体Visitor：类型检查
class TypeChecker implements ASTVisitor<string> {
    private symbolTable: Map<string, string> = new Map();

    visitBinaryExpr(expr: BinaryExpr): string {
        const leftType = expr.left.accept(this);
        const rightType = expr.right.accept(this);

        if (leftType !== rightType) {
            throw new Error(`Type mismatch: ${leftType} ${expr.operator} ${rightType}`);
        }

        if (expr.operator === "+" || expr.operator === "-" ||
            expr.operator === "*" || expr.operator === "/") {
            if (leftType !== "number") {
                throw new Error(`Operator ${expr.operator} requires number`);
            }
            return "number";
        }

        return leftType;
    }

    visitLiteral(literal: Literal): string {
        return typeof literal.value;
    }

    visitIdentifier(id: Identifier): string {
        if (this.symbolTable.has(id.name)) {
            return this.symbolTable.get(id.name)!;
        }
        throw new Error(`Undefined variable: ${id.name}`);
    }
}

// 使用示例
const ast = new BinaryExpr(
    new Literal(2),
    "+",
    new BinaryExpr(
        new Literal(3),
        "*",
        new Literal(4)
    )
);

const evaluator = new Evaluator();
console.log("Result:", ast.accept(evaluator)); // 14

const printer = new Printer();
console.log("AST:", ast.accept(printer)); // (2 + (3 * 4))
```

### 4.4 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **Babel Types** | JavaScript AST类型定义 | JavaScript |
| **AST Explorer** | 在线AST可视化工具 | Web |
| **Esprima** | JavaScript解析器 | JavaScript |
| **Acorn** | 轻量级JavaScript解析器 | JavaScript |
| **@typescript-eslint/typescript-estree** | TypeScript AST | TypeScript |

---

## 5. 语义分析

### 5.1 理论解释

**语义分析（Semantic Analysis）** 在语法正确的基础上检查程序的语义正确性。

#### 主要任务

1. **类型检查**：验证操作数的类型是否兼容
2. **作用域分析**：验证标识符是否在作用域内
3. **控制流检查**：验证控制流是否可达
4. **唯一性检查**：验证标识符是否重复定义

#### 属性文法

属性文法扩展了CFG，为每个文法符号关联属性：

```
E → E1 + T { E.val = E1.val + T.val }
E → T { E.val = T.val }
T → T1 * F { T.val = T1.val * F.val }
T → F { T.val = F.val }
F → num { F.val = num.lexval }
```

### 5.2 算法伪代码

#### 符号表管理

```
Algorithm SymbolTable
    scopes = Stack()

    Function enterScope()
        scopes.push(new Map())

    Function exitScope()
        scopes.pop()

    Function declare(name, type)
        current = scopes.top()
        if name in current then
            error("Redeclaration of", name)
        current[name] = type

    Function lookup(name)
        for scope in scopes (from top to bottom) do
            if name in scope then
                return scope[name]
        error("Undefined identifier:", name)
```

#### 类型检查

```
Algorithm TypeCheck(node, env)
    case node.type of
        "BinaryExpr":
            leftType = TypeCheck(node.left, env)
            rightType = TypeCheck(node.right, env)
            if not Compatible(leftType, rightType, node.op) then
                error("Type mismatch")
            return ResultType(leftType, rightType, node.op)

        "Literal":
            return typeof(node.value)

        "Identifier":
            return env.lookup(node.name)

        "Assignment":
            varType = env.lookup(node.name)
            exprType = TypeCheck(node.value, env)
            if not SubType(exprType, varType) then
                error("Cannot assign", exprType, "to", varType)
            return varType

        "FunctionCall":
            funcType = env.lookup(node.name)
            for i, arg in enumerate(node.args) do
                argType = TypeCheck(arg, env)
                if not SubType(argType, funcType.params[i]) then
                    error("Argument type mismatch")
            return funcType.returnType
```

### 5.3 实现示例

```typescript
// 类型定义
interface Type {
    kind: string;
    name: string;
}

class PrimitiveType implements Type {
    kind = "primitive";
    constructor(public name: string) {}
}

class FunctionType implements Type {
    kind = "function";
    constructor(
        public name: string,
        public paramTypes: Type[],
        public returnType: Type
    ) {}
}

// 符号表
class SymbolTable {
    private scopes: Map<string, Type>[] = [new Map()];

    enterScope(): void {
        this.scopes.push(new Map());
    }

    exitScope(): void {
        if (this.scopes.length > 1) {
            this.scopes.pop();
        }
    }

    declare(name: string, type: Type): void {
        const current = this.scopes[this.scopes.length - 1];
        if (current.has(name)) {
            throw new Error(`Redeclaration of '${name}'`);
        }
        current.set(name, type);
    }

    lookup(name: string): Type {
        for (let i = this.scopes.length - 1; i >= 0; i--) {
            if (this.scopes[i].has(name)) {
                return this.scopes[i].get(name)!;
            }
        }
        throw new Error(`Undefined identifier: '${name}'`);
    }
}

// 语义分析器
class SemanticAnalyzer {
    private symbolTable: SymbolTable;
    private errors: string[] = [];

    constructor() {
        this.symbolTable = new SymbolTable();
    }

    analyze(node: ASTNode): void {
        this.visit(node);
    }

    private visit(node: ASTNode): void {
        switch (node.type) {
            case "Program":
                this.symbolTable.enterScope();
                for (const stmt of node.children || []) {
                    this.visit(stmt);
                }
                this.symbolTable.exitScope();
                break;

            case "VariableDeclaration":
                this.visitVariableDeclaration(node);
                break;

            case "FunctionDeclaration":
                this.visitFunctionDeclaration(node);
                break;

            case "Assignment":
                this.visitAssignment(node);
                break;

            case "Identifier":
                this.symbolTable.lookup(node.value);
                break;

            case "BinaryExpr":
                this.visitBinaryExpr(node);
                break;
        }
    }

    private visitVariableDeclaration(node: ASTNode): void {
        const name = node.value;
        const initType = this.inferType(node.children![0]);
        this.symbolTable.declare(name, initType);
    }

    private visitFunctionDeclaration(node: ASTNode): void {
        const name = node.value;
        const params = node.children![0].children || [];
        const body = node.children![1];

        // 创建函数类型
        const paramTypes = params.map(p => this.inferType(p));
        const funcType = new FunctionType(name, paramTypes, new PrimitiveType("void"));

        // 在函数外部声明函数名
        this.symbolTable.declare(name, funcType);

        // 进入函数作用域
        this.symbolTable.enterScope();

        // 声明参数
        for (const param of params) {
            this.symbolTable.declare(param.value, new PrimitiveType("any"));
        }

        // 分析函数体
        this.visit(body);

        this.symbolTable.exitScope();
    }

    private visitAssignment(node: ASTNode): void {
        const name = node.value;
        const varType = this.symbolTable.lookup(name);
        const exprType = this.inferType(node.children![0]);

        if (!this.isCompatible(exprType, varType)) {
            this.errors.push(
                `Type mismatch: cannot assign ${exprType.name} to ${varType.name}`
            );
        }
    }

    private visitBinaryExpr(node: ASTNode): void {
        const leftType = this.inferType(node.children![0]);
        const rightType = this.inferType(node.children![1]);
        const operator = node.value;

        if (!this.isCompatible(leftType, rightType)) {
            this.errors.push(
                `Type mismatch in binary expression: ${leftType.name} ${operator} ${rightType.name}`
            );
        }

        // 检查运算符是否支持类型
        if (operator === "+" || operator === "-" ||
            operator === "*" || operator === "/") {
            if (leftType.name !== "number" || rightType.name !== "number") {
                this.errors.push(
                    `Operator '${operator}' requires number operands`
                );
            }
        }
    }

    private inferType(node: ASTNode): Type {
        switch (node.type) {
            case "NumberLiteral":
                return new PrimitiveType("number");
            case "StringLiteral":
                return new PrimitiveType("string");
            case "BooleanLiteral":
                return new PrimitiveType("boolean");
            case "Identifier":
                return this.symbolTable.lookup(node.value);
            default:
                return new PrimitiveType("any");
        }
    }

    private isCompatible(source: Type, target: Type): boolean {
        // 简化的类型兼容性检查
        return source.name === target.name || target.name === "any";
    }

    getErrors(): string[] {
        return this.errors;
    }
}
```

### 5.4 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **TypeScript Compiler API** | TypeScript类型检查 | TypeScript |
| **Flow** | JavaScript静态类型检查 | JavaScript |
| **ESLint** | JavaScript静态分析 | JavaScript |
| **SonarQube** | 代码质量分析 | 多语言 |
| **Psalm** | PHP静态分析 | PHP |
| **Mypy** | Python静态类型检查 | Python |

---

## 6. 中间表示（IR）和三地址码

### 6.1 理论解释

**中间表示（Intermediate Representation, IR）** 是编译器内部使用的抽象表示形式，位于AST和目标代码之间。

#### IR的分类

| IR类型 | 描述 | 示例 |
|--------|------|------|
| **高级IR** | 接近AST，保留控制结构 | AST、DAG |
| **中级IR** | 独立于机器，适合优化 | LLVM IR、三地址码 |
| **低级IR** | 接近机器码，含机器细节 | 机器指令序列 |

#### 三地址码（TAC）

三地址码是每个指令最多有三个地址（两个操作数，一个结果）的线性IR：

```
x = y op z      // 二元运算
x = op y        // 一元运算
x = y           // 复制
 goto L         // 无条件跳转
 if x goto L    // 条件跳转
 if x relop y goto L  // 关系跳转
 param x         // 参数传递
 call p, n       // 过程调用
 return y        // 返回
 x = y[i]        // 数组访问
 x[i] = y        // 数组赋值
```

### 6.2 算法伪代码

#### AST到三地址码转换

```
Algorithm GenerateTAC(node, tempCounter)
    case node.type of
        "BinaryExpr":
            t1 = GenerateTAC(node.left, tempCounter)
            t2 = GenerateTAC(node.right, tempCounter)
            result = newTemp()
            emit(result "=" t1 node.op t2)
            return result

        "Literal":
            return node.value

        "Identifier":
            return node.name

        "Assignment":
            rhs = GenerateTAC(node.value, tempCounter)
            emit(node.name "=" rhs)
            return node.name

        "If":
            cond = GenerateTAC(node.condition, tempCounter)
            labelElse = newLabel()
            labelEnd = newLabel()
            emit("ifFalse" cond "goto" labelElse)
            GenerateTAC(node.thenBranch, tempCounter)
            emit("goto" labelEnd)
            emitLabel(labelElse)
            if node.elseBranch then
                GenerateTAC(node.elseBranch, tempCounter)
            emitLabel(labelEnd)

        "While":
            labelStart = newLabel()
            labelEnd = newLabel()
            emitLabel(labelStart)
            cond = GenerateTAC(node.condition, tempCounter)
            emit("ifFalse" cond "goto" labelEnd)
            GenerateTAC(node.body, tempCounter)
            emit("goto" labelStart)
            emitLabel(labelEnd)
```

#### 基本块划分

```
Algorithm PartitionBasicBlocks(instructions)
    leaders = Set()
    leaders.add(0)  // 第一条指令是领导者

    for i = 0 to instructions.length - 1 do
        if instructions[i] is jump or branch then
            leaders.add(target of jump)
            if i + 1 < instructions.length then
                leaders.add(i + 1)

    blocks = []
    currentBlock = []

    for i = 0 to instructions.length - 1 do
        if i in leaders and currentBlock not empty then
            blocks.add(currentBlock)
            currentBlock = []
        currentBlock.add(instructions[i])

    if currentBlock not empty then
        blocks.add(currentBlock)

    return blocks
```

### 6.3 实现示例

```typescript
// 三地址指令类型
enum TACOp {
    ADD = "+", SUB = "-", MUL = "*", DIV = "/",
    ASSIGN = "=",
    GOTO = "goto",
    IF_FALSE = "ifFalse",
    LABEL = "label",
    PARAM = "param",
    CALL = "call",
    RETURN = "return",
    INDEX_LOAD = "=[]",
    INDEX_STORE = "[]="
}

interface TACInstruction {
    op: TACOp;
    result?: string;
    arg1?: string;
    arg2?: string;
}

class TACGenerator {
    private instructions: TACInstruction[] = [];
    private tempCounter = 0;
    private labelCounter = 0;

    generate(ast: ASTNode): TACInstruction[] {
        this.visit(ast);
        return this.instructions;
    }

    private visit(node: ASTNode): string {
        switch (node.type) {
            case "Program":
                for (const stmt of node.children || []) {
                    this.visit(stmt);
                }
                return "";

            case "BinaryExpr":
                return this.visitBinaryExpr(node);

            case "Literal":
                return String(node.value);

            case "Identifier":
                return node.value;

            case "Assignment":
                return this.visitAssignment(node);

            case "If":
                return this.visitIf(node);

            case "While":
                return this.visitWhile(node);

            default:
                return "";
        }
    }

    private visitBinaryExpr(node: ASTNode): string {
        const left = this.visit(node.children![0]);
        const right = this.visit(node.children![1]);
        const result = this.newTemp();

        this.instructions.push({
            op: this.getOperator(node.value),
            result,
            arg1: left,
            arg2: right
        });

        return result;
    }

    private visitAssignment(node: ASTNode): string {
        const value = this.visit(node.children![0]);
        this.instructions.push({
            op: TACOp.ASSIGN,
            result: node.value,
            arg1: value
        });
        return node.value;
    }

    private visitIf(node: ASTNode): string {
        const cond = this.visit(node.children![0]);
        const elseLabel = this.newLabel();
        const endLabel = this.newLabel();

        // ifFalse cond goto elseLabel
        this.instructions.push({
            op: TACOp.IF_FALSE,
            arg1: cond,
            arg2: elseLabel
        });

        // then branch
        this.visit(node.children![1]);

        // goto endLabel
        this.instructions.push({
            op: TACOp.GOTO,
            arg1: endLabel
        });

        // elseLabel:
        this.emitLabel(elseLabel);

        // else branch (if exists)
        if (node.children![2]) {
            this.visit(node.children![2]);
        }

        // endLabel:
        this.emitLabel(endLabel);
        return "";
    }

    private visitWhile(node: ASTNode): string {
        const startLabel = this.newLabel();
        const endLabel = this.newLabel();

        // startLabel:
        this.emitLabel(startLabel);

        const cond = this.visit(node.children![0]);

        // ifFalse cond goto endLabel
        this.instructions.push({
            op: TACOp.IF_FALSE,
            arg1: cond,
            arg2: endLabel
        });

        // body
        this.visit(node.children![1]);

        // goto startLabel
        this.instructions.push({
            op: TACOp.GOTO,
            arg1: startLabel
        });

        // endLabel:
        this.emitLabel(endLabel);
        return "";
    }

    private getOperator(op: string): TACOp {
        switch (op) {
            case "+": return TACOp.ADD;
            case "-": return TACOp.SUB;
            case "*": return TACOp.MUL;
            case "/": return TACOp.DIV;
            default: return TACOp.ASSIGN;
        }
    }

    private newTemp(): string {
        return `t${this.tempCounter++}`;
    }

    private newLabel(): string {
        return `L${this.labelCounter++}`;
    }

    private emitLabel(label: string): void {
        this.instructions.push({
            op: TACOp.LABEL,
            arg1: label
        });
    }

    print(): void {
        for (const inst of this.instructions) {
            switch (inst.op) {
                case TACOp.LABEL:
                    console.log(`${inst.arg1}:`);
                    break;
                case TACOp.GOTO:
                    console.log(`  goto ${inst.arg1}`);
                    break;
                case TACOp.IF_FALSE:
                    console.log(`  ifFalse ${inst.arg1} goto ${inst.arg2}`);
                    break;
                case TACOp.ASSIGN:
                    console.log(`  ${inst.result} = ${inst.arg1}`);
                    break;
                default:
                    console.log(`  ${inst.result} = ${inst.arg1} ${inst.op} ${inst.arg2}`);
            }
        }
    }
}
```

### 6.4 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **LLVM IR** | 现代编译器IR标准 | C++ |
| **MLIR** | 多级IR基础设施 | C++ |
| **C--** | 编译器实现语言 | C |
| **JVM Bytecode** | Java虚拟机字节码 | Java |
| **WebAssembly** | 浏览器IR标准 | 多语言 |

---

## 7. 代码生成和优化

### 7.1 理论解释

**代码生成** 将IR转换为目标机器代码，**代码优化** 改善代码的性能指标。

#### 优化级别

| 级别 | 优化程度 | 编译时间 | 代码质量 |
|------|---------|---------|---------|
| -O0 | 无优化 | 快 | 差 |
| -O1 | 基本优化 | 中等 | 中等 |
| -O2 | 全面优化（推荐） | 较慢 | 好 |
| -O3 | 激进优化 | 慢 | 很好 |
| -Os | 优化大小 | 较慢 | 中等 |

#### 优化分类

**机器无关优化：**

- 常量折叠
- 常量传播
- 死代码消除
- 公共子表达式消除
- 循环优化

**机器相关优化：**

- 寄存器分配
- 指令选择
- 窥孔优化

### 7.2 算法伪代码

#### 常量折叠

```
Algorithm ConstantFolding(instructions)
    for each instruction in instructions do
        if instruction is binary operation then
            if both operands are constants then
                result = evaluate(instruction.op, operand1, operand2)
                replace instruction with constant assignment
```

#### 死代码消除

```
Algorithm DeadCodeElimination(instructions)
    // 构建使用-定义链
    useDef = buildUseDefChain(instructions)

    // 标记活跃变量
    live = Set()
    worklist = Queue()

    // 初始活跃集合：返回值、输出变量
    for each instruction that produces output do
        if instruction.result is used then
            live.add(instruction.result)
            worklist.enqueue(instruction)

    while worklist not empty do
        inst = worklist.dequeue()
        for each operand in inst.operands do
            if operand not in live then
                live.add(operand)
                defInst = findDefinition(operand)
                if defInst then
                    worklist.enqueue(defInst)

    // 删除未使用的定义
    for each instruction in instructions do
        if instruction.defines variable not in live then
            mark for deletion

    remove marked instructions
```

#### 公共子表达式消除（CSE）

```
Algorithm CSE(basicBlocks)
    available = Map()  // expression -> temp

    for each block in basicBlocks do
        for each instruction in block do
            if instruction is computation then
                key = (instruction.op, instruction.operands)
                if key in available then
                    // 用已有值替换
                    instruction.op = ASSIGN
                    instruction.operand = available[key]
                else
                    available[key] = instruction.result
```

#### 简单寄存器分配

```
Algorithm SimpleRegisterAllocation(instructions, numRegisters)
    // 构建冲突图
    interference = buildInterferenceGraph(instructions)

    // 尝试图着色
    stack = []
    nodes = all variables

    while nodes not empty do
        // 找度数小于numRegisters的节点
        node = findNodeWithDegreeLessThan(nodes, interference, numRegisters)
        if node exists then
            remove node from nodes
            stack.push(node)
        else
            // 需要溢出
            node = selectSpillCandidate(nodes, interference)
            mark node for spilling
            remove node from nodes
            stack.push(node)

    // 分配寄存器
    coloring = Map()
    while stack not empty do
        node = stack.pop()
        color = selectColor(node, interference, coloring, numRegisters)
        coloring[node] = color

    return coloring
```

### 7.3 实现示例

```typescript
// 优化器基类
abstract class OptimizationPass {
    abstract optimize(instructions: TACInstruction[]): TACInstruction[];
}

// 常量折叠
class ConstantFolding extends OptimizationPass {
    optimize(instructions: TACInstruction[]): TACInstruction[] {
        const result: TACInstruction[] = [];

        for (const inst of instructions) {
            const folded = this.tryFold(inst);
            result.push(folded);
        }

        return result;
    }

    private tryFold(inst: TACInstruction): TACInstruction {
        if (!inst.arg1 || !inst.arg2) return inst;

        const val1 = parseFloat(inst.arg1);
        const val2 = parseFloat(inst.arg2);

        if (isNaN(val1) || isNaN(val2)) return inst;

        let result: number;
        switch (inst.op) {
            case TACOp.ADD: result = val1 + val2; break;
            case TACOp.SUB: result = val1 - val2; break;
            case TACOp.MUL: result = val1 * val2; break;
            case TACOp.DIV: result = val1 / val2; break;
            default: return inst;
        }

        return {
            op: TACOp.ASSIGN,
            result: inst.result,
            arg1: String(result)
        };
    }
}

// 死代码消除
class DeadCodeElimination extends OptimizationPass {
    optimize(instructions: TACInstruction[]): TACInstruction[] {
        const used = new Set<string>();

        // 第一遍：收集所有被使用的变量
        for (const inst of instructions) {
            if (inst.arg1 && !inst.arg1.match(/^t\d+$/)) {
                used.add(inst.arg1);
            }
            if (inst.arg2 && !inst.arg2.match(/^t\d+$/)) {
                used.add(inst.arg2);
            }
        }

        // 第二遍：删除未被使用的临时变量定义
        return instructions.filter(inst => {
            if (inst.result && inst.result.match(/^t\d+$/)) {
                return used.has(inst.result) || this.hasSideEffect(inst);
            }
            return true;
        });
    }

    private hasSideEffect(inst: TACInstruction): boolean {
        return inst.op === TACOp.CALL ||
               inst.op === TACOp.RETURN ||
               inst.op === TACOp.INDEX_STORE;
    }
}

// 代码生成器
class CodeGenerator {
    private instructions: string[] = [];
    private registerMap: Map<string, string> = new Map();
    private nextReg = 0;

    generate(tac: TACInstruction[]): string {
        this.instructions.push(".text");
        this.instructions.push(".global main");
        this.instructions.push("main:");

        for (const inst of tac) {
            this.emitInstruction(inst);
        }

        this.instructions.push("  ret");
        return this.instructions.join("\n");
    }

    private emitInstruction(inst: TACInstruction): void {
        switch (inst.op) {
            case TACOp.ASSIGN:
                const reg = this.getRegister(inst.result!);
                if (inst.arg1?.match(/^-?\d+$/)) {
                    this.instructions.push(`  mov ${reg}, #${inst.arg1}`);
                } else {
                    const srcReg = this.getRegister(inst.arg1!);
                    this.instructions.push(`  mov ${reg}, ${srcReg}`);
                }
                break;

            case TACOp.ADD:
                this.emitBinaryOp("add", inst);
                break;
            case TACOp.SUB:
                this.emitBinaryOp("sub", inst);
                break;
            case TACOp.MUL:
                this.emitBinaryOp("mul", inst);
                break;
            case TACOp.DIV:
                this.emitBinaryOp("sdiv", inst);
                break;

            case TACOp.LABEL:
                this.instructions.push(`${inst.arg1}:`);
                break;

            case TACOp.GOTO:
                this.instructions.push(`  b ${inst.arg1}`);
                break;

            case TACOp.IF_FALSE:
                const condReg = this.getRegister(inst.arg1!);
                this.instructions.push(`  cmp ${condReg}, #0`);
                this.instructions.push(`  beq ${inst.arg2}`);
                break;
        }
    }

    private emitBinaryOp(op: string, inst: TACInstruction): void {
        const resultReg = this.getRegister(inst.result!);
        const leftReg = this.getRegister(inst.arg1!);
        const rightReg = this.getRegister(inst.arg2!);
        this.instructions.push(`  ${op} ${resultReg}, ${leftReg}, ${rightReg}`);
    }

    private getRegister(varName: string): string {
        if (!this.registerMap.has(varName)) {
            this.registerMap.set(varName, `r${this.nextReg++ % 12}`);
        }
        return this.registerMap.get(varName)!;
    }
}
```

### 7.4 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **LLVM opt** | LLVM优化器 | C++ |
| **GCC Optimizer** | GCC优化框架 | C/C++ |
| **V8 TurboFan** | JavaScript JIT编译器 | C++ |
| **Cranelift** | WebAssembly代码生成 | Rust |
| **Binaryen** | WebAssembly优化工具链 | C++ |

---

## 8. 垃圾回收理论

### 8.1 理论解释

**垃圾回收（Garbage Collection, GC）** 自动管理内存，回收不再使用的对象。

#### 核心概念

- **可达性（Reachability）**：从根对象（全局变量、栈变量等）可以访问到的对象是存活的
- **垃圾（Garbage）**：不可达的对象
- **GC根（GC Roots）**：全局变量、活动栈帧中的局部变量、寄存器中的引用

#### GC算法分类

| 算法 | 原理 | 优点 | 缺点 |
|------|------|------|------|
| **标记-清除** | 标记可达对象，清除未标记 | 简单 | 碎片化 |
| **标记-整理** | 标记后整理存活对象 | 无碎片 | 整理开销 |
| **复制** | 将存活对象复制到新空间 | 高效 | 双倍空间 |
| **引用计数** | 计数引用，计数为0时回收 | 实时 | 循环引用 |
| **分代** | 按对象年龄分代处理 | 高效 | 复杂 |

### 8.2 算法伪代码

#### 标记-清除算法

```
Algorithm MarkSweep(memory)
    // 标记阶段
    worklist = Queue()
    for each root in GC Roots do
        if root != null then
            worklist.enqueue(root)
            root.marked = true

    while worklist not empty do
        obj = worklist.dequeue()
        for each ref in obj.references do
            if ref != null and not ref.marked then
                ref.marked = true
                worklist.enqueue(ref)

    // 清除阶段
    for each obj in memory do
        if not obj.marked then
            free(obj)
        else
            obj.marked = false  // 重置标记
```

#### 引用计数

```
Algorithm ReferenceCounting
    Object.allocate():
        obj = allocateMemory()
        obj.refCount = 0
        return obj

    Object.addReference(ref):
        ref.refCount++

    Object.removeReference(ref):
        ref.refCount--
        if ref.refCount == 0 then
            for each child in ref.references do
                removeReference(child)
            free(ref)
```

#### 分代垃圾回收

```
Algorithm GenerationalGC
    // 新生代（Young Generation）
    newSpace = allocate(Eden + Survivor0 + Survivor1)
    // 老年代（Old Generation）
    oldSpace = allocate(largeSpace)

    Function allocate(size):
        if canAllocateInEden(size) then
            return allocateInEden(size)
        else
            minorGC()  // 触发新生代GC
            return allocateInEden(size)

    Function minorGC():
        // 从GC根和Remembered Set开始
        worklist = GC Roots + Remembered Set

        // 复制存活对象到Survivor
        for each obj in worklist reachable in newSpace do
            if obj.age < threshold then
                copyToSurvivor(obj)
                obj.age++
            else
                promoteToOld(obj)

        // 清空Eden
        clearEden()
        swapSurvivorSpaces()

    Function majorGC():
        // 标记-清除-整理老年代
        markPhase()
        sweepPhase()
        compactPhase()
```

#### 增量/并发GC

```
Algorithm IncrementalGC
    // 三色标记
    WHITE = unvisited
    GREY = visited, children not processed
    BLACK = visited, children processed

    Function incrementalMark():
        work = getWorkBudget()  // 限制每帧工作量

        while work > 0 and greySet not empty do
            obj = greySet.pop()
            for each ref in obj.references do
                if ref.color == WHITE then
                    ref.color = GREY
                    greySet.add(ref)
            obj.color = BLACK
            work--

        if greySet empty then
            sweepPhase()

    Function writeBarrier(source, ref):
        // 处理并发修改
        if source.color == BLACK and ref.color == WHITE then
            ref.color = GREY
            greySet.add(ref)
```

### 8.3 实现示例

```typescript
// 简单的标记-清除GC实现
interface GCObject {
    marked: boolean;
    references: GCObject[];
    data: any;
}

class SimpleGC {
    private heap: GCObject[] = [];
    private roots: GCObject[] = [];

    allocate(data: any): GCObject {
        const obj: GCObject = {
            marked: false,
            references: [],
            data
        };
        this.heap.push(obj);
        return obj;
    }

    addRoot(obj: GCObject): void {
        this.roots.push(obj);
    }

    removeRoot(obj: GCObject): void {
        const index = this.roots.indexOf(obj);
        if (index !== -1) {
            this.roots.splice(index, 1);
        }
    }

    setReference(parent: GCObject, child: GCObject | null, index: number): void {
        parent.references[index] = child!;
    }

    gc(): void {
        console.log("GC started, heap size:", this.heap.length);

        // 标记阶段
        this.mark();

        // 清除阶段
        const collected = this.sweep();

        console.log("GC finished, collected:", collected, "remaining:", this.heap.length);
    }

    private mark(): void {
        const worklist: GCObject[] = [];

        // 初始化：将所有根对象加入工作列表
        for (const root of this.roots) {
            if (root && !root.marked) {
                root.marked = true;
                worklist.push(root);
            }
        }

        // 标记所有可达对象
        while (worklist.length > 0) {
            const obj = worklist.pop()!;

            for (const ref of obj.references) {
                if (ref && !ref.marked) {
                    ref.marked = true;
                    worklist.push(ref);
                }
            }
        }
    }

    private sweep(): number {
        const before = this.heap.length;

        // 保留标记的对象，删除未标记的
        this.heap = this.heap.filter(obj => {
            if (obj.marked) {
                obj.marked = false;  // 重置标记
                return true;
            }
            return false;
        });

        return before - this.heap.length;
    }

    getStats(): { heapSize: number; rootCount: number } {
        return {
            heapSize: this.heap.length,
            rootCount: this.roots.length
        };
    }
}

// 使用示例
const gc = new SimpleGC();

// 创建对象图
const root = gc.allocate("root");
gc.addRoot(root);

const child1 = gc.allocate("child1");
const child2 = gc.allocate("child2");
const orphan = gc.allocate("orphan");  // 不会被回收，因为没有被引用

gc.setReference(root, child1, 0);
gc.setReference(root, child2, 1);

console.log("Before GC:", gc.getStats());
gc.gc();
console.log("After first GC:", gc.getStats());

// 断开引用
gc.setReference(root, null, 0);
gc.gc();
console.log("After second GC:", gc.getStats());
```

### 8.4 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **V8 GC** | JavaScript引擎垃圾回收 | C++ |
| **Go GC** | Go语言的并发三色标记 | Go |
| **Java G1/ZGC/Shenandoah** | JVM现代垃圾回收器 | Java |
| **Boehm GC** | C/C++保守式GC | C |
| **jemalloc** | 内存分配器，支持GC | C |
| **mimalloc** | 高性能内存分配器 | C |

---

## 9. 类型系统的实现

### 9.1 理论解释

**类型系统** 是编程语言中用于定义数据类型并强制执行类型规则的规则集合。

#### Lambda演算类型

```
Simple Types:
    τ ::= int | bool | string | unit | τ → τ

Polymorphic Types:
    σ ::= τ | ∀α.σ
```

#### 类型系统分类

| 特性 | 描述 | 例子 |
|------|------|------|
| **静态/动态** | 类型检查时机 | TypeScript(静态) vs JavaScript(动态) |
| **强/弱** | 类型转换严格程度 | Python(强) vs C(弱) |
| **显式/隐式** | 类型声明要求 | Java(显式) vs Haskell(隐式) |
| **名义/结构** | 类型等价判断 | Java(名义) vs TypeScript(结构) |

### 9.2 Hindley-Milner类型推导

#### 算法W

```
Algorithm W(environment, expression)
    case expression of
        Variable x:
            if x in environment then
                return (Subst.empty, instantiate(environment[x]))
            else
                error("Unbound variable")

        Lambda(x, e):
            β = fresh type variable
            (S1, τ1) = W(environment ∪ {x:β}, e)
            return (S1, S1(β) → τ1)

        Application(e1, e2):
            (S1, τ1) = W(environment, e1)
            (S2, τ2) = W(S1(environment), e2)
            β = fresh type variable
            S3 = unify(S2(τ1), τ2 → β)
            return (S3 ∘ S2 ∘ S1, S3(β))

        Let(x, e1, e2):
            (S1, τ1) = W(environment, e1)
            σ = generalize(S1(environment), τ1)
            (S2, τ2) = W(S1(environment) ∪ {x:σ}, e2)
            return (S2 ∘ S1, τ2)

Function unify(τ1, τ2):
    if τ1 = τ2 then
        return Subst.empty

    if τ1 is type variable α and α not in freeVars(τ2) then
        return Subst.singleton(α, τ2)

    if τ2 is type variable α and α not in freeVars(τ1) then
        return Subst.singleton(α, τ1)

    if τ1 = τ11 → τ12 and τ2 = τ21 → τ22 then
        S1 = unify(τ11, τ21)
        S2 = unify(S1(τ12), S1(τ22))
        return S2 ∘ S1

    error("Type mismatch")
```

### 9.3 子类型与多态

#### 子类型规则

```
Subtyping Rules:
    S-REFL:  τ <: τ

    S-TRANS: if τ1 <: τ2 and τ2 <: τ3 then τ1 <: τ3

    S-FUN:   if τ2 <: τ1 and σ1 <: σ2
             then τ1 → σ1 <: τ2 → σ2

    S-RECORD: if {li:τi} has all fields of {kj:σj}
               and τi <: σi for each common field
               then {li:τi} <: {kj:σj}
```

### 9.4 实现示例

```typescript
// 类型定义
abstract class Type {
    abstract toString(): string;
    abstract equals(other: Type): boolean;
}

class PrimitiveType extends Type {
    constructor(public name: string) {
        super();
    }

    toString(): string {
        return this.name;
    }

    equals(other: Type): boolean {
        return other instanceof PrimitiveType && other.name === this.name;
    }
}

class FunctionType extends Type {
    constructor(
        public paramTypes: Type[],
        public returnType: Type
    ) {
        super();
    }

    toString(): string {
        const params = this.paramTypes.map(t => t.toString()).join(", ");
        return `(${params}) => ${this.returnType.toString()}`;
    }

    equals(other: Type): boolean {
        if (!(other instanceof FunctionType)) return false;
        if (this.paramTypes.length !== other.paramTypes.length) return false;
        for (let i = 0; i < this.paramTypes.length; i++) {
            if (!this.paramTypes[i].equals(other.paramTypes[i])) return false;
        }
        return this.returnType.equals(other.returnType);
    }
}

class TypeVariable extends Type {
    private static counter = 0;
    public id: number;

    constructor() {
        super();
        this.id = TypeVariable.counter++;
    }

    toString(): string {
        return `t${this.id}`;
    }

    equals(other: Type): boolean {
        return other instanceof TypeVariable && other.id === this.id;
    }
}

// 替换（Substitution）
type Substitution = Map<number, Type>;

class TypeInference {
    private substitution: Substitution = new Map();

    infer(env: Map<string, Type>, expr: ASTNode): Type {
        switch (expr.type) {
            case "Literal":
                if (typeof expr.value === "number") {
                    return new PrimitiveType("number");
                } else if (typeof expr.value === "string") {
                    return new PrimitiveType("string");
                } else if (typeof expr.value === "boolean") {
                    return new PrimitiveType("boolean");
                }
                throw new Error("Unknown literal type");

            case "Identifier":
                if (env.has(expr.value)) {
                    return this.apply(env.get(expr.value)!);
                }
                throw new Error(`Unbound variable: ${expr.value}`);

            case "Lambda":
                return this.inferLambda(env, expr);

            case "Application":
                return this.inferApplication(env, expr);

            case "Let":
                return this.inferLet(env, expr);

            default:
                throw new Error(`Unknown expression type: ${expr.type}`);
        }
    }

    private inferLambda(env: Map<string, Type>, expr: ASTNode): Type {
        const paramName = expr.value;
        const paramType = new TypeVariable();

        const newEnv = new Map(env);
        newEnv.set(paramName, paramType);

        const bodyType = this.infer(newEnv, expr.children![0]);

        return new FunctionType([this.apply(paramType)], bodyType);
    }

    private inferApplication(env: Map<string, Type>, expr: ASTNode): Type {
        const funcType = this.infer(env, expr.children![0]);
        const argType = this.infer(env, expr.children![1]);

        const resultType = new TypeVariable();

        this.unify(funcType, new FunctionType([argType], resultType));

        return this.apply(resultType);
    }

    private inferLet(env: Map<string, Type>, expr: ASTNode): Type {
        const name = expr.value;
        const valueType = this.infer(env, expr.children![0]);

        const newEnv = new Map(env);
        newEnv.set(name, valueType);

        return this.infer(newEnv, expr.children![1]);
    }

    private unify(t1: Type, t2: Type): void {
        t1 = this.apply(t1);
        t2 = this.apply(t2);

        if (t1.equals(t2)) return;

        if (t1 instanceof TypeVariable) {
            this.substitution.set(t1.id, t2);
            return;
        }

        if (t2 instanceof TypeVariable) {
            this.substitution.set(t2.id, t1);
            return;
        }

        if (t1 instanceof FunctionType && t2 instanceof FunctionType) {
            if (t1.paramTypes.length !== t2.paramTypes.length) {
                throw new Error("Function arity mismatch");
            }

            for (let i = 0; i < t1.paramTypes.length; i++) {
                this.unify(t1.paramTypes[i], t2.paramTypes[i]);
            }

            this.unify(t1.returnType, t2.returnType);
            return;
        }

        throw new Error(`Cannot unify ${t1.toString()} with ${t2.toString()}`);
    }

    private apply(type: Type): Type {
        if (type instanceof TypeVariable) {
            if (this.substitution.has(type.id)) {
                return this.apply(this.substitution.get(type.id)!);
            }
            return type;
        }

        if (type instanceof FunctionType) {
            return new FunctionType(
                type.paramTypes.map(t => this.apply(t)),
                this.apply(type.returnType)
            );
        }

        return type;
    }
}

// 子类型检查
class Subtyping {
    isSubtype(t1: Type, t2: Type): boolean {
        // 相同类型
        if (t1.equals(t2)) return true;

        // number <: any
        if (t2 instanceof PrimitiveType && t2.name === "any") {
            return true;
        }

        // 函数子类型：逆变参数，协变返回
        if (t1 instanceof FunctionType && t2 instanceof FunctionType) {
            if (t1.paramTypes.length !== t2.paramTypes.length) {
                return false;
            }

            // 参数是逆变的：t2.param <: t1.param
            for (let i = 0; i < t1.paramTypes.length; i++) {
                if (!this.isSubtype(t2.paramTypes[i], t1.paramTypes[i])) {
                    return false;
                }
            }

            // 返回是协变的：t1.return <: t2.return
            return this.isSubtype(t1.returnType, t2.returnType);
        }

        return false;
    }
}
```

### 9.5 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **Hindley-Milner** | 经典类型推导算法 | ML系列 |
| **TypeScript Compiler** | 结构类型系统 | TypeScript |
| **Flow** | JavaScript类型检查器 | JavaScript |
| **Liquid Haskell** | 依赖类型/精炼类型 | Haskell |
| **Rust borrow checker** | 所有权类型系统 | Rust |
| **Idris** | 依赖类型编程 | Idris |

---

## 10. 领域特定语言（DSL）的设计

### 10.1 理论解释

**领域特定语言（Domain-Specific Language, DSL）** 为特定问题域设计的专用语言。

#### DSL分类

| 类型 | 描述 | 例子 |
|------|------|------|
| **外部DSL** | 独立的语言语法 | SQL, Regex, CSS |
| **内部DSL** | 嵌入在宿主语言中 | jQuery, LINQ, Flutter |
| **图形DSL** | 可视化建模 | UML, BPMN |

#### DSL设计原则

1. **专注领域概念**：只包含领域相关的抽象
2. **最小表面**：用最少的语法表达概念
3. **渐进式揭示**：支持从简单到复杂的逐步深入
4. **安全默认**：危险操作需要显式启用

### 10.2 DSL实现模式

#### 解析器组合子

```
// 组合子库
Parser<T> = Input -> (T, Input) | Error

// 基本组合子
satisfy(predicate) :: Parser<Char>
char(c) :: Parser<Char>
string(s) :: Parser<String>

// 组合操作
p1.then(p2) :: Parser<(T1, T2)>
p1.or(p2) :: Parser<T>
p.map(f) :: Parser<U>
p.many() :: Parser<T[]>
p.some() :: Parser<T[]>

// 示例：表达式解析器
expr = term.chainl1(addOp)
term = factor.chainl1(mulOp)
factor = number.or(expr.between(char('('), char(')')))
```

#### 解释器模式

```
// AST定义
Expression = Literal(value)
           | Variable(name)
           | Add(left, right)
           | Subtract(left, right)
           | Multiply(left, right)

// 求值解释器
Function evaluate(expr, environment):
    case expr of
        Literal(v): return v
        Variable(n): return environment[n]
        Add(l, r): return evaluate(l, env) + evaluate(r, env)
        Subtract(l, r): return evaluate(l, env) - evaluate(r, env)
        Multiply(l, r): return evaluate(l, env) * evaluate(r, env)
```

### 10.3 实现示例

```typescript
// =====================================
// 内部DSL：Fluent API示例
// =====================================

// SQL查询构建器 DSL
class QueryBuilder {
    private selectFields: string[] = [];
    private fromTable: string = "";
    private whereConditions: string[] = [];
    private orderByField: string = "";
    private limitCount?: number;

    static select(...fields: string[]): QueryBuilder {
        const qb = new QueryBuilder();
        qb.selectFields = fields;
        return qb;
    }

    from(table: string): this {
        this.fromTable = table;
        return this;
    }

    where(condition: string): this {
        this.whereConditions.push(condition);
        return this;
    }

    and(condition: string): this {
        return this.where(condition);
    }

    orderBy(field: string): this {
        this.orderByField = field;
        return this;
    }

    limit(count: number): this {
        this.limitCount = count;
        return this;
    }

    build(): string {
        let sql = `SELECT ${this.selectFields.join(", ")}`;
        sql += ` FROM ${this.fromTable}`;

        if (this.whereConditions.length > 0) {
            sql += ` WHERE ${this.whereConditions.join(" AND ")}`;
        }

        if (this.orderByField) {
            sql += ` ORDER BY ${this.orderByField}`;
        }

        if (this.limitCount !== undefined) {
            sql += ` LIMIT ${this.limitCount}`;
        }

        return sql;
    }
}

// 使用内部DSL
const query = QueryBuilder
    .select("id", "name", "email")
    .from("users")
    .where("age > 18")
    .and("status = 'active'")
    .orderBy("created_at")
    .limit(10)
    .build();

console.log(query);
// SELECT id, name, email FROM users WHERE age > 18 AND status = 'active' ORDER BY created_at LIMIT 10


// =====================================
// 外部DSL：简单的配置语言
// =====================================

// 配置语言语法：
// config := entry*
// entry := key "=" value
// value := string | number | boolean | list | object
// list := "[" value* "]"
// object := "{" entry* "}"

interface ConfigEntry {
    key: string;
    value: ConfigValue;
}

type ConfigValue = string | number | boolean | ConfigValue[] | { [key: string]: ConfigValue };

class ConfigDSL {
    private position = 0;
    private tokens: Token[];

    constructor(source: string) {
        this.tokens = this.tokenize(source);
    }

    private tokenize(source: string): Token[] {
        // 简化的词法分析
        const tokens: Token[] = [];
        const patterns = [
            { type: "STRING", regex: /^"([^"]*)"/ },
            { type: "NUMBER", regex: /^\d+(\.\d+)?/ },
            { type: "BOOLEAN", regex: /^(true|false)/ },
            { type: "IDENTIFIER", regex: /^[a-zA-Z_]\w*/ },
            { type: "ASSIGN", regex: /^=/ },
            { type: "LBRACE", regex: /^\{/ },
            { type: "RBRACE", regex: /^\}/ },
            { type: "LBRACKET", regex: /^\[/ },
            { type: "RBRACKET", regex: /^\]/ },
            { type: "COMMA", regex: /^,/ },
        ];

        let pos = 0;
        while (pos < source.length) {
            // 跳过空白
            while (pos < source.length && /\s/.test(source[pos])) pos++;
            if (pos >= source.length) break;

            const remaining = source.slice(pos);
            let matched = false;

            for (const pattern of patterns) {
                const match = remaining.match(pattern.regex);
                if (match) {
                    tokens.push({
                        type: pattern.type as TokenType,
                        value: match[1] || match[0]
                    });
                    pos += match[0].length;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                throw new Error(`Unexpected character: ${source[pos]}`);
            }
        }

        tokens.push({ type: TokenType.EOF, value: "" });
        return tokens;
    }

    parse(): Map<string, ConfigValue> {
        const config = new Map<string, ConfigValue>();

        while (!this.isAtEnd()) {
            const entry = this.parseEntry();
            config.set(entry.key, entry.value);
        }

        return config;
    }

    private parseEntry(): ConfigEntry {
        const key = this.consume(TokenType.IDENTIFIER, "Expected key").value;
        this.consume(TokenType.ASSIGN, "Expected '='");
        const value = this.parseValue();
        return { key, value };
    }

    private parseValue(): ConfigValue {
        const token = this.peek();

        switch (token.type) {
            case TokenType.STRING:
                this.advance();
                return token.value;

            case TokenType.NUMBER:
                this.advance();
                return parseFloat(token.value);

            case TokenType.BOOLEAN:
                this.advance();
                return token.value === "true";

            case TokenType.LBRACKET:
                return this.parseList();

            case TokenType.LBRACE:
                return this.parseObject();

            default:
                throw new Error(`Unexpected token: ${token.type}`);
        }
    }

    private parseList(): ConfigValue[] {
        this.consume(TokenType.LBRACKET, "Expected '['");
        const list: ConfigValue[] = [];

        while (!this.check(TokenType.RBRACKET)) {
            list.push(this.parseValue());
            if (this.match(TokenType.COMMA)) {
                continue;
            }
        }

        this.consume(TokenType.RBRACKET, "Expected ']'");
        return list;
    }

    private parseObject(): { [key: string]: ConfigValue } {
        this.consume(TokenType.LBRACE, "Expected '{'");
        const obj: { [key: string]: ConfigValue } = {};

        while (!this.check(TokenType.RBRACE)) {
            const entry = this.parseEntry();
            obj[entry.key] = entry.value;
            if (this.match(TokenType.COMMA)) {
                continue;
            }
        }

        this.consume(TokenType.RBRACE, "Expected '}'");
        return obj;
    }

    private match(...types: TokenType[]): boolean {
        for (const type of types) {
            if (this.check(type)) {
                this.advance();
                return true;
            }
        }
        return false;
    }

    private check(type: TokenType): boolean {
        if (this.isAtEnd()) return false;
        return this.peek().type === type;
    }

    private advance(): Token {
        if (!this.isAtEnd()) this.position++;
        return this.previous();
    }

    private isAtEnd(): boolean {
        return this.peek().type === TokenType.EOF;
    }

    private peek(): Token {
        return this.tokens[this.position];
    }

    private previous(): Token {
        return this.tokens[this.position - 1];
    }

    private consume(type: TokenType, message: string): Token {
        if (this.check(type)) return this.advance();
        throw new Error(message);
    }
}

// 使用外部DSL
const configSource = `
name = "MyApp"
version = 1.0
debug = true
features = ["auth", "api", "ui"]
database = {
    host = "localhost"
    port = 5432
}
`;

const config = new ConfigDSL(configSource).parse();
console.log(Object.fromEntries(config));


// =====================================
// 解析器组合子
// =====================================

type Parser<T> = (input: string) => { success: boolean; value?: T; remaining?: string; error?: string };

const P = {
    // 字符解析
    char(c: string): Parser<string> {
        return (input: string) => {
            if (input.length > 0 && input[0] === c) {
                return { success: true, value: c, remaining: input.slice(1) };
            }
            return { success: false, error: `Expected '${c}'` };
        };
    },

    // 正则解析
    regex(pattern: RegExp): Parser<string> {
        return (input: string) => {
            const match = input.match(pattern);
            if (match && match.index === 0) {
                return { success: true, value: match[0], remaining: input.slice(match[0].length) };
            }
            return { success: false, error: `Pattern ${pattern} not matched` };
        };
    },

    // 顺序组合
    seq<T, U>(p1: Parser<T>, p2: Parser<U>): Parser<[T, U]> {
        return (input: string) => {
            const r1 = p1(input);
            if (!r1.success) return r1;

            const r2 = p2(r1.remaining!);
            if (!r2.success) return r2;

            return { success: true, value: [r1.value!, r2.value!], remaining: r2.remaining };
        };
    },

    // 选择组合
    or<T>(p1: Parser<T>, p2: Parser<T>): Parser<T> {
        return (input: string) => {
            const r1 = p1(input);
            if (r1.success) return r1;
            return p2(input);
        };
    },

    // 映射
    map<T, U>(p: Parser<T>, f: (x: T) => U): Parser<U> {
        return (input: string) => {
            const r = p(input);
            if (!r.success) return r;
            return { success: true, value: f(r.value!), remaining: r.remaining };
        };
    },

    // 零次或多次
    many<T>(p: Parser<T>): Parser<T[]> {
        return (input: string) => {
            const results: T[] = [];
            let remaining = input;

            while (true) {
                const r = p(remaining);
                if (!r.success) break;
                results.push(r.value!);
                remaining = r.remaining!;
            }

            return { success: true, value: results, remaining };
        };
    }
};

// 使用解析器组合子构建表达式解析器
const digit = P.regex(/^[0-9]/);
const number = P.map(P.many(digit), digits => parseInt(digits.join("")));
const plus = P.char("+");
const times = P.char("*");
const lparen = P.char("(");
const rparen = P.char(")");

// factor = number | "(" expr ")"
const factor: Parser<number> = (input: string) => {
    return P.or(
        number,
        P.map(P.seq(P.seq(lparen, expr), rparen), ([[, e], ]) => e)
    )(input);
};

// term = factor ("*" factor)*
const term: Parser<number> = P.map(
    P.seq(factor, P.many(P.map(P.seq(times, factor), ([, f]) => f))),
    ([first, rest]) => rest.reduce((acc, x) => acc * x, first)
);

// expr = term ("+" term)*
function expr(input: string) {
    return P.map(
        P.seq(term, P.many(P.map(P.seq(plus, term), ([, t]) => t))),
        ([first, rest]) => rest.reduce((acc, x) => acc + x, first)
    )(input);
}

// 测试
const testExpr = "2+3*4";
const result = expr(testExpr);
console.log("Parsed:", result);
```

### 10.4 工具推荐

| 工具 | 描述 | 语言 |
|------|------|------|
| **ANTLR** | 完整的DSL开发工具 | 多语言 |
| **Xtext** | Eclipse DSL框架 | Java |
| **JetBrains MPS** | 语言工作台 | Java |
| **Langium** | 基于Langium的DSL | TypeScript |
| **Tree-sitter** | 语法高亮和解析 | C |
| **nearley.js** | JavaScript解析器组合子 | JavaScript |
| **parsimmon** | 强大的解析器组合子库 | JavaScript |

---

## 总结

本文档全面覆盖了编译器与语言设计的核心主题：

| 主题 | 核心概念 | 关键算法 |
|------|---------|---------|
| 编译器架构 | 前端-中端-后端分离 | 三段式编译流程 |
| 词法分析 | 正则表达式、DFA/NFA | Thompson构造、子集构造 |
| 语法分析 | CFG、递归下降、LR | LL(1)、LR(1)解析 |
| AST | 代数数据类型、Visitor模式 | 树遍历算法 |
| 语义分析 | 类型检查、作用域 | 符号表、属性文法 |
| IR | 三地址码、基本块 | AST到TAC转换 |
| 代码优化 | 常量折叠、死代码消除 | 数据流分析 |
| 垃圾回收 | 标记-清除、分代、引用计数 | 三色标记、写屏障 |
| 类型系统 | Hindley-Milner、子类型 | 类型推导、合一 |
| DSL设计 | 内部/外部DSL | 解析器组合子、解释器 |

掌握这些概念是设计和实现编程语言的基础。
