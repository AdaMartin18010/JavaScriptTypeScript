# TypeScript 编译器 API

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/compiler-api`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

TypeScript Compiler API 暴露了整个编译管道的内部结构（解析器、检查器、发射器、语言服务），支持程序化 AST 遍历、类型查询、代码生成和自定义转换。

### 1.2 形式化基础

编译管道可建模为幺半群：
`SourceFile[] → (Parser) → AST → (Binder) → SymbolTable → (Checker) → TypedAST → (Emitter) → JS/DTS`
每阶段输出是下一阶段的输入，且支持增量更新（`Program` 的 `updateFile`）。

### 1.3 关键概念

| 概念 | 定义 | 关联 |
|------|------|------|
| `ts.SourceFile` | 单个文件的 AST 根节点 | `ts.forEachChild` |
| `ts.TypeChecker` | 类型检查与符号解析引擎 | `checker.getTypeAtLocation` |
| `ts.Program` | 编译单元集合，管理文件依赖 | `program.getSourceFiles()` |
| `ts.Transformer` | AST 到 AST 的纯函数转换 | `ts.visitEachChild` |

---

## 二、设计原理

### 2.1 为什么存在

IDE 功能（自动补全、重构）、代码生成器（Prisma、GraphQL codegen）、自定义 linter 和迁移工具都依赖编译器 API。它是 TypeScript 生态可扩展性的根基。

### 2.2 API 对比表

| 能力 | 原生 Compiler API | ts-morph | Babel + TS Plugin |
|------|------------------|----------|-------------------|
| AST 遍历 | ✅ 完整 | ✅ 高阶封装 | ⚠️ 无类型 |
| 类型查询 | ✅ 完整 | ✅ 完整 | ❌ 不支持 |
| 代码生成 | ✅ `ts.createPrinter` | ✅ `Project.createSourceFile` | ✅ `@babel/generator` |
| 易用性 | 陡峭 | 友好 | 中等 |
| 类型检查 | ✅ 内置 | ✅ 内置 | 需外部 tsc |
| 社区生态 | 官方文档稀疏 | 活跃 | 活跃 |

### 2.3 权衡分析

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原生 Compiler API | 零依赖、完全控制 | API 设计底层、文档少 | 编译器插件、IDE 工具 |
| ts-morph | 面向对象、变更追踪 | 包体积大 | 代码生成、批量重构 |
| ESLint + TypeScript | 规则生态成熟 | 仅分析不生成 | Lint、代码规范 |

---

## 三、实践映射

### 3.1 AST 遍历与类型查询

```ts
import * as ts from 'typescript';

// 创建编译程序
const program = ts.createProgram(['src/app.ts'], {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.CommonJS,
  strict: true,
});

const checker = program.getTypeChecker();

// 遍历所有 SourceFile，收集所有接口定义
for (const sourceFile of program.getSourceFiles()) {
  if (sourceFile.isDeclarationFile) continue;

  ts.forEachChild(sourceFile, visit);
}

function visit(node: ts.Node) {
  if (ts.isInterfaceDeclaration(node)) {
    const symbol = checker.getSymbolAtLocation(node.name);
    const type = checker.getDeclaredTypeOfSymbol(symbol!);

    console.log(`Interface: ${node.name.text}`);
    console.log('  Properties:');

    for (const prop of checker.getPropertiesOfType(type)) {
      const propType = checker.getTypeOfSymbolAtLocation(prop, node);
      console.log(`    ${prop.name}: ${checker.typeToString(propType)}`);
    }
  }
  ts.forEachChild(node, visit);
}
```

### 3.2 自定义 Transformer（删除所有 console.log）

```ts
import * as ts from 'typescript';

const removeConsoleTransformer: ts.TransformerFactory<ts.SourceFile> =
  (context) => (sourceFile) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        ts.isIdentifier(node.expression.expression) &&
        node.expression.expression.text === 'console'
      ) {
        // 替换为空语句
        return ts.factory.createEmptyStatement();
      }
      return ts.visitEachChild(node, visitor, context);
    };
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };

// 使用
const result = ts.transform(sourceFile, [removeConsoleTransformer]);
const printer = ts.createPrinter();
console.log(printer.printFile(result.transformed[0]));
```

### 3.3 常见误区

| 误区 | 正确理解 |
|------|---------|
| AST 修改后类型自动更新 | 修改 AST 后需重新创建 `Program` 获取最新类型 |
| `ts-morph` 比原生 API 慢 | ts-morph 底层仍是原生 API，慢在对象封装层 |
| Compiler API 只能分析 TS | 同样可解析 `.js` 文件并执行类型推断（`allowJs`） |

### 3.4 扩展阅读

- [TypeScript Compiler API Wiki](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [TypeScript AST Viewer](https://ts-ast-viewer.com/)
- [ts-morph Documentation](https://ts-morph.com/)
- [Babel Plugin Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)
- [AST Explorer](https://astexplorer.net/)
- `10-fundamentals/10.2-type-system/`

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
