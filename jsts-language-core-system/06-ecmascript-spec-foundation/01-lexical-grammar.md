# 词法文法与语法文法

> ECMAScript 的词法分析（Lexical Grammar）与语法分析（Syntactic Grammar）
>
> 对齐版本：ECMA-262 2025 (ES16)

---

## 1. 文法层级

ECMAScript 定义了多个文法层级：

| 文法 | 作用 | 产出 |
|------|------|------|
| 词法文法（Lexical Grammar） | 将源码转为 Token | Token 序列 |
| 语法文法（Syntactic Grammar） | 将 Token 转为 AST | 语法树 |
| 数字字符串文法 | 转换字面量 | 数字值 |
| 正则表达式文法 | 解析正则 | RegExp 对象 |
| 模板字面量文法 | 解析模板 | 字符串值 |

---

## 2. 词法文法（Lexical Grammar）

### 2.1 Token 类型

ECMAScript 的 Token 包括：

- **IdentifierName**：标识符（含保留字）
- **Punctuator**：标点符号（`{ } ( ) [ ] ; , .` 等）
- **NumericLiteral**：数字字面量
- **StringLiteral**：字符串字面量
- **Template**：模板字面量
- **RegularExpressionLiteral**：正则表达式字面量

### 2.2 自动分号插入（ASI）

JavaScript 的自动分号插入规则：

```javascript
// 换行后，如果下一行以 `[`、`(`、`/`、`+`、`-`、模板字面量开头，不插入分号
const a = 1
const b = 2 // 插入分号

// 以下情况会插入分号
return
{ a: 1 }    // 被解析为 return; { a: 1 };（返回 undefined）

// 正确写法
return {
  a: 1
};
```

ASI 三大规则：

1. 行结束标记（LineTerminator）后出现非法 Token → 插入分号
2. 输入流结束 → 插入分号
3. 受限产生式（Restricted Productions）中出现 LineTerminator → 插入分号

受限产生式包括：`return`、`throw`、`break`、`continue`、`++`、`--`、`=>`。

### 2.3 保留字

```javascript
// 关键字（不能用作标识符）
break case catch continue debugger default delete do else finally
for function if in instanceof new return switch this throw try
typeof var void while with

// ES5+ 严格模式保留字
implements interface let package private protected public static yield

// ES6+ 保留字
class const enum export extends import super

// 未来保留字
await（模块中）
```

---

## 3. 语法文法（Syntactic Grammar）

### 3.1 上下文无关文法

ECMAScript 使用上下文无关文法（Context-Free Grammar）描述语法：

```
Script :
  ScriptBodyopt

ScriptBody :
  StatementList

StatementList :
  StatementListItem
  StatementList StatementListItem

StatementListItem :
  Statement
  Declaration

Statement :
  BlockStatement
  VariableStatement
  EmptyStatement
  ExpressionStatement
  IfStatement
  BreakableStatement
  ContinueStatement
  BreakStatement
  ReturnStatement
  WithStatement
  LabelledStatement
  ThrowStatement
  TryStatement
  DebuggerStatement
```

### 3.2 产生式示例

```
IfStatement :
  if ( Expression ) Statement else Statement
  if ( Expression ) Statement

ForStatement :
  for ( Expressionopt ; Expressionopt ; Expressionopt ) Statement
  for ( var VariableDeclarationList ; Expressionopt ; Expressionopt ) Statement
  for ( LexicalDeclaration Expressionopt ; Expressionopt ) Statement
```

---

## 4. 解析策略

### 4.1 惰性解析（Lazy Parsing）

引擎采用预解析（Pre-parsing）策略提升性能：

```javascript
function outer() {
  // 预解析阶段：只解析 outer 的头部，跳过 inner 的函数体
  function inner() {
    return 42;
  }
  return inner;
}

outer(); // inner 未被调用，其函数体不会被完全解析
```

### 4.2 完全解析触发条件

- 函数被调用
- 函数被 `eval()` 使用
- 函数被 `new Function()` 使用
- 函数被 `Function.prototype.toString()` 调用

---

## 5. 与 TypeScript 的关系

TypeScript 在 JavaScript 词法/语法之上扩展：

```typescript
// TypeScript 新增的词法 Token
// : < > ? | & ... as satisfies keyof typeof infer extends implements

// TypeScript 新增语法产生式
InterfaceDeclaration :
  interface BindingIdentifier TypeParametersopt InterfaceExtendsClauseopt ObjectType

TypeAliasDeclaration :
  type BindingIdentifier TypeParametersopt TypeAnnotation ;
```

---

**参考规范**：ECMA-262 §5 Notational Conventions | ECMA-262 §11 ECMAScript Language: Lexical Grammar | ECMA-262 §13 ECMAScript Language: Statements and Declarations
