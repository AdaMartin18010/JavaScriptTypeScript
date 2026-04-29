---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 10-js-ts-comparison

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块从语法、语义模型、类型理论到编译工程实践，对 JavaScript 与 TypeScript 进行全方位对比分析。内容涵盖类型擦除、运行时差异、编译器 API 等语言核心议题，是理解 TS 作为 JS 超集的本质边界的关键模块。

**非本模块内容**：框架选型对比、工具链对比、运行时平台（Node/Deno/Bun）对比。

## 在语言核心体系中的位置

```
语言核心
  ├── 10-fundamentals/10.1-language-semantics → 类型系统理论
  ├── 10-fundamentals/10.7-js-ts-symmetric-difference → JS/TS 对称差
  └── 10-js-ts-comparison（本模块）→ 对比实验与编译器 API 实践
```

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `syntax-diffs/` | 语法差异对比实验 | `variable-declarations.ts`, `type-annotations.js` |
| `type-erasure/` | 类型擦除与运行时行为 | `erasure-demos.ts`, `runtime-types.js` |
| `compiler-api/` | TypeScript Compiler API 实践 | `ast-traversal.ts`, `transformer-api.ts` |
| `performance/` | 编译性能与输出对比 | `benchmark-compilation.js`, `output-size.md` |

## 语法对比矩阵

| 特性 | JavaScript (ES2024+) | TypeScript (5.x) | 运行时差异 |
|------|----------------------|------------------|------------|
| **变量声明** | `let`, `const` | `let`, `const` + 显式类型注解 | 无（类型擦除） |
| **函数参数类型** | JSDoc 注解或运行时检查 | 编译时类型检查 | 无 |
| **接口/类型别名** | 无原生支持 | `interface`, `type` | 完全擦除 |
| **枚举** | 无 | `enum`（编译为对象） | 生成 IIFE 对象 |
| **泛型** | 无 | `<T>(arg: T): T` | 擦除为 `any` 或具体类型 |
| **装饰器** | Stage 3（ECMAScript） | 实验性/旧版支持 | 依赖编译器转换 |
| **模块系统** | ESM / CJS | ESM / CJS + 声明文件 | 额外 `.d.ts` 输出 |
| **空值合并** | `??` | `??` + 严格空检查 (`strictNullChecks`) | 仅编译期影响 |
| **可选链** | `?.` | `?.` + 类型收窄 | 无 |

### 类型擦除示例

```typescript
// TypeScript 源码
interface User {
  id: number;
  name: string;
}

function greet(user: User): string {
  return `Hello, ${user.name}`;
}

// 编译后的 JavaScript（类型擦除）
function greet(user) {
  return "Hello, " + user.name;
}
```

### 枚举编译差异

```typescript
// TypeScript
enum Status {
  Pending,
  Approved,
  Rejected,
}

// 编译为 JavaScript（ES5 目标）
var Status;
(function (Status) {
  Status[Status["Pending"] = 0] = "Pending";
  Status[Status["Approved"] = 1] = "Approved";
  Status[Status["Rejected"] = 2] = "Rejected";
})(Status || (Status = {}));
```

### JSDoc 类型注解 vs TypeScript

```javascript
// JavaScript with JSDoc（无需构建步骤即可获得类型提示）
/** @type {(user: { id: number; name: string }) => string} */
function greet(user) {
  return `Hello, ${user.name}`;
}

// TypeScript（编译时检查，需构建步骤）
function greet(user: { id: number; name: string }): string {
  return `Hello, ${user.name}`;
}
```

### Compiler API 极简示例

```typescript
// ast-traversal.ts — 使用 TS Compiler API 提取文件中所有接口名
import ts from 'typescript';

function extractInterfaceNames(sourceFile: ts.SourceFile): string[] {
  const names: string[] = [];
  ts.forEachChild(sourceFile, function visit(node) {
    if (ts.isInterfaceDeclaration(node)) {
      names.push(node.name.text);
    }
    ts.forEachChild(node, visit);
  });
  return names;
}

const program = ts.createProgram(['./sample.ts'], {});
const source = program.getSourceFile('./sample.ts')!;
console.log(extractInterfaceNames(source));
```

### `satisfies` 运算符：推断与约束兼得

```typescript
// TS 4.9+ 引入 satisfies，既保留推断类型，又约束结构
const config = {
  host: 'localhost',
  port: 3000,
  ssl: false,
} satisfies Record<string, string | number | boolean>;

// config.port 仍为 number 类型（而非 string | number | boolean）
const url = `http://${config.host}:${config.port}`;
```

### Branded Types：零开销名义类型

```typescript
// 使用交叉类型创建名义类型，编译后完全擦除
type UserId = string & { __brand: 'UserId' };
type OrderId = string & { __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

function createOrderId(id: string): OrderId {
  return id as OrderId;
}

function queryUser(id: UserId) { /* ... */ }

const uid = createUserId('u-123');
const oid = createOrderId('o-456');

queryUser(uid);   // ✅ OK
// queryUser(oid); // ❌ 编译错误：OrderId 不能赋值给 UserId
```

### `as const` 深度只读推断

```typescript
// JavaScript
const jsRoles = ['admin', 'user', 'guest'];
// jsRoles[0] 运行时可以是任意字符串

// TypeScript with as const
const tsRoles = ['admin', 'user', 'guest'] as const;
// tsRoles 类型为 readonly ['admin', 'user', 'guest']
// tsRoles[0] 精确为字面量 'admin'
type Role = (typeof tsRoles)[number]; // 'admin' | 'user' | 'guest'
```

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — 官方手册
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) — Basarat Ali Syed 开源书籍
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig) — 官方编译器配置参考
- [ECMA-262 Language Specification](https://tc39.es/ecma262/) — JavaScript 语言规范
- [TypeScript Compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) — 微软官方编译器 API 文档
- [TypeScript Evolution](https://mariusschulz.com/blog/series/typescript-evolution) — 按版本详解 TS 特性演进
- [TypeScript Playground](https://www.typescriptlang.org/play) — 官方在线 TS→JS 编译演示
- [DefinitelyTyped](https://definitelytyped.org/) — 社区维护的 JavaScript 库类型定义仓库
- [JSDoc Reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html) — TypeScript 官方 JSDoc 类型支持文档
- [tc39/proposals](https://github.com/tc39/proposals) — ECMAScript 提案跟踪仓库
- [AST Explorer](https://astexplorer.net/) — 多语言 AST 可视化工具，支持 TypeScript
- [TypeScript `satisfies` Operator](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator) — TS 4.9 发布说明
- [Nominal Typing Techniques](https://www.typescriptlang.org/docs/handbook/advanced-types.html#nominal-type-techniques) — 名义类型模拟技术
- [Microsoft TypeScript Wiki](https://github.com/microsoft/TypeScript/wiki) — 官方 Wiki，含设计原则与路线图
- [Total TypeScript](https://www.totaltypescript.com/) — Matt Pocock 的 TypeScript 进阶课程
- [Type Challenges](https://github.com/type-challenges/type-challenges) — 类型体操练习题集
