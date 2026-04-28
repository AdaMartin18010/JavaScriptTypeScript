# Milestone 1: Mini Parser —— 迷你解析器

## 理论基础

### 词法分析（Lexical Analysis）

词法分析是编译器的第一个阶段，将字符流转换为 **Token 流**。Token 是语法的最小有意义单元：关键字、标识符、字面量、运算符等。

**正则表达式与有限自动机**

每个 Token 类别可由正则表达式描述：

- 标识符: `[a-zA-Z_][a-zA-Z0-9_]*`
- 数字字面量: `[0-9]+(\.[0-9]+)?`
- 字符串字面量: `"[^"]*"`

词法分析器本质上是一个**有限状态自动机（DFA）**，在代码中通过条件分支实现。

### 递归下降解析（Recursive Descent Parsing）

递归下降是最直观的自顶向下解析技术。每个非终结符对应一个函数，根据当前 Token 决定如何继续解析。

**关键技巧：左递归消除**

原始文法中的左递归（如 `Expr ::= Expr + Term`）会导致无限递归。解决方案是改为迭代：先解析 `Term`，然后在循环中解析 `+ Term`。

**本解析器支持的文法**

```bnf
Program     ::= Statement*
Statement   ::= VarDecl | FunctionDecl | InterfaceDecl | ExprStmt
VarDecl     ::= ("let" | "const") Identifier TypeAnnotation? ("=" Expr)? ";"
FunctionDecl::= "function" Identifier TypeParams? "(" Params? ")" TypeAnnotation? Block
InterfaceDecl::= "interface" Identifier "{" PropSig* "}"
TypeAnnotation ::= ":" Type
Type        ::= Primitive | Identifier | ArrayType | FunctionType
Primitive   ::= "number" | "string" | "boolean" | "null" | "undefined"
ArrayType   ::= Type "[]"
FunctionType::= "(" Types? ")" "=>" Type
Expr        ::= AddExpr
AddExpr     ::= MulExpr (("+" | "-") MulExpr)*
MulExpr     ::= Primary (("*" | "/") Primary)*
Primary     ::= Number | String | Boolean | Identifier | CallExpr | "(" Expr ")"
CallExpr    ::= Identifier "(" Args? ")"
Block       ::= "{" Statement* "}"
```

## 关键代码 Walkthrough

### `lexer.ts`

`Lexer` 类维护 `source`（源代码）、`position`（当前字符位置）、`line`/`column`（行列号）。

核心方法：

- `tokenize()`: 主入口，循环调用 `nextToken()` 直到 EOF
- `readIdentifier()`: 读取字母/数字/下划线序列，查关键字表决定是 KEYWORD 还是 IDENTIFIER
- `readNumber()`: 读取数字，支持整数和小数
- `readString()`: 读取双引号字符串，支持 `\n`, `\\` 等转义

### `parser.ts`

`Parser` 类接收 Token 数组，输出 AST。

核心方法：

- `parse()`: 解析 Program 节点
- `parseStatement()`: 根据当前 Token 类型分发到具体解析器
- `parseExpression()`: 使用优先级爬升（Pratt Parsing）处理二元运算符

### `ast.ts`

定义所有 AST 节点类型。每个节点都有 `loc`（源码位置），用于后续错误报告。

## 运行测试

```bash
pnpm test examples/advanced-compiler-workshop/milestone-01-mini-parser
```

## 延伸阅读

- **Dragon Book** (Aho, Sethi, Ullman) 第 3 章 —— 词法分析
- **Crafting Interpreters** (Bob Nystrom) 第 4-6 章 —— 递归下降解析器手把手教学
- `jsts-code-lab/79-compiler-design/` —— 本项目的完整编译器设计模块
