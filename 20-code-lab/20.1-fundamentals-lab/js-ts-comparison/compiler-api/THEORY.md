# TypeScript 编译器 API

> **定位**：`20-code-lab/20.1-fundamentals-lab/js-ts-comparison/compiler-api`
> **关联**：`10-fundamentals/` | `30-knowledge-base/`

---

## 一、核心理论

### 1.1 问题域定义

TypeScript Compiler API 暴露了整个编译管道的内部结构（解析器、检查器、发射器、语言服务），支持程序化 AST 遍历、类型查询、代码生成和自定义转换。

### 1.2 形式化基础

编译管道可建模为幺半群：
`SourceFile[] -> (Parser) -> AST -> (Binder) -> SymbolTable -> (Checker) -> TypedAST -> (Emitter) -> JS/DTS`
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
| AST 遍历 | 完整 | 高阶封装 | 无类型 |
| 类型查询 | 完整 | 完整 | 不支持 |
| 代码生成 | `ts.createPrinter` | `Project.createSourceFile` | `@babel/generator` |
| 易用性 | 陡峭 | 友好 | 中等 |
| 类型检查 | 内置 | 内置 | 需外部 tsc |
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

### 3.3 ts-morph：面向对象的编译器 API 封装

```typescript
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: './tsconfig.json' });
const sourceFile = project.getSourceFileOrThrow('src/app.ts');

// 查找并重命名所有名为 "oldName" 的变量
sourceFile.getDescendantsOfKind(SyntaxKind.Identifier)
  .filter(id => id.getText() === 'oldName')
  .forEach(id => id.rename('newName'));

// 添加新导入
sourceFile.addImportDeclaration({
  namedImports: ['useState'],
  moduleSpecifier: 'react',
});

// 保存变更
project.saveSync();
```

### 3.4 Language Service API：实现自定义 IDE 功能

```typescript
import * as ts from 'typescript';

// 创建语言服务宿主
const files: Record<string, string> = { 'file.ts': 'const x = 1;' };
const servicesHost: ts.LanguageServiceHost = {
  getScriptFileNames: () => Object.keys(files),
  getScriptVersion: () => '0',
  getScriptSnapshot: (name) => {
    if (!files[name]) return undefined;
    return ts.ScriptSnapshot.fromString(files[name]);
  },
  getCurrentDirectory: () => process.cwd(),
  getCompilationSettings: () => ({ strict: true }),
  getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  directoryExists: ts.sys.directoryExists,
  getDirectories: ts.sys.getDirectories,
};

const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());

// 获取指定位置的自动补全
const completions = services.getCompletionsAtPosition('file.ts', 10, undefined);
console.log(completions?.entries.map(e => e.name));

// 获取光标位置的快速信息（hover 提示）
const quickInfo = services.getQuickInfoAtPosition('file.ts', 8);
console.log(quickInfo?.displayParts?.map(p => p.text).join(''));
```

### 3.5 自定义 TSLint/ESLint 规则中的类型查询

```typescript
import { ESLintUtils } from '@typescript-eslint/utils';

export const rule = ESLintUtils.RuleCreator(
  (name) => `https://example.com/rules/${name}`
)({
  name: 'no-floating-promises',
  meta: {
    type: 'problem',
    docs: { description: 'Disallow unhandled promises' },
    schema: [],
    messages: { floating: 'Promise must be awaited or explicitly handled.' },
  },
  defaultOptions: [],
  create(context) {
    const parserServices = ESLintUtils.getParserServices(context);
    const checker = parserServices.program.getTypeChecker();

    return {
      ExpressionStatement(node) {
        const tsNode = parserServices.esTreeNodeToTSNodeMap.get(node.expression);
        const type = checker.getTypeAtLocation(tsNode);
        const typeString = checker.typeToString(type);

        if (typeString.startsWith('Promise')) {
          context.report({ node, messageId: 'floating' });
        }
      },
    };
  },
});
```

### 3.6 自定义 Compiler Host：内存中编译

```typescript
import * as ts from 'typescript';

// 在内存中编译字符串代码（无需磁盘文件）
function compileInMemory(
  fileName: string,
  sourceCode: string,
  compilerOptions: ts.CompilerOptions = {}
): { js?: string; diagnostics: ts.Diagnostic[] } {
  const files: Map<string, string> = new Map([[fileName, sourceCode]]);

  const host: ts.CompilerHost = {
    ...ts.createCompilerHost(compilerOptions),
    getSourceFile(name, languageVersion) {
      if (files.has(name)) {
        return ts.createSourceFile(name, files.get(name)!, languageVersion);
      }
      return ts.createCompilerHost(compilerOptions).getSourceFile(name, languageVersion);
    },
    readFile(name) {
      return files.get(name) ?? ts.sys.readFile(name);
    },
    fileExists(name) {
      return files.has(name) || ts.sys.fileExists(name);
    },
    writeFile(name, data) {
      if (name.endsWith('.js')) {
        outputJs = data;
      }
    },
  };

  let outputJs: string | undefined;
  const program = ts.createProgram([fileName], compilerOptions, host);
  const diagnostics = ts.getPreEmitDiagnostics(program);
  program.emit();

  return { js: outputJs, diagnostics };
}

// 使用
const result = compileInMemory('test.ts', 'const x: number = "hello";', {
  strict: true,
  noEmitOnError: false,
});

console.log(result.js); // undefined（有类型错误但允许输出）
console.log(ts.formatDiagnosticsWithColorAndContext(result.diagnostics, {
  getCanonicalFileName: f => f,
  getCurrentDirectory: () => '',
  getNewLine: () => '\n',
}));
```

### 3.7 生成声明文件（.d.ts）

```typescript
import * as ts from 'typescript';

function generateDts(sourceFilePath: string): string | undefined {
  const program = ts.createProgram([sourceFilePath], {
    declaration: true,
    emitDeclarationOnly: true,
    strict: true,
  });

  let dtsOutput = '';
  const host: ts.CompilerHost = {
    ...ts.createCompilerHost(program.getCompilerOptions()),
    writeFile(name, data) {
      if (name.endsWith('.d.ts')) {
        dtsOutput = data;
      }
    },
  };

  program.emit(undefined, host.writeFile);
  return dtsOutput;
}

// 示例输入
// export function add(a: number, b: number): number;
// 输出 .d.ts:
// export declare function add(a: number, b: number): number;
```

### 3.8 自定义装饰器 Transformer

```typescript
import * as ts from 'typescript';

// 将 @deprecated 装饰器转换为 JSDoc 注释
const deprecatedTransformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
  return (sourceFile) => {
    const visitor = (node: ts.Node): ts.Node => {
      if (ts.isMethodDeclaration(node) || ts.isPropertyDeclaration(node)) {
        const hasDeprecated = node.decorators?.some((d) =>
          ts.isCallExpression(d.expression) &&
          ts.isIdentifier(d.expression.expression) &&
          d.expression.expression.text === 'deprecated'
        );
        if (hasDeprecated) {
          const jsDoc = ts.factory.createJSDocComment(
            ts.factory.createNodeArray([
              ts.factory.createJSDocText(' @deprecated')
            ])
          );
          ts.addSyntheticLeadingComment(
            node,
            ts.SyntaxKind.MultiLineCommentTrivia,
            ' @deprecated',
            true
          );
        }
      }
      return ts.visitEachChild(node, visitor, context);
    };
    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };
};
```

### 3.9 程序级符号引用查找

```typescript
import * as ts from 'typescript';

function findAllReferences(program: ts.Program, fileName: string, position: number): ts.ReferenceEntry[] {
  const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => program.getSourceFiles().map(f => f.fileName),
    getScriptVersion: () => '0',
    getScriptSnapshot: (name) => {
      const source = program.getSourceFile(name);
      return source ? ts.ScriptSnapshot.fromString(source.text) : undefined;
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => program.getCompilerOptions(),
    getDefaultLibFileName: (options) => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };

  const services = ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
  return services.findReferences(fileName, position) ?? [];
}

// 使用：查找接口 User 的所有引用
const sourceFile = program.getSourceFile('src/models.ts')!;
const userInterface = sourceFile.statements.find(
  (s): s is ts.InterfaceDeclaration =>
    ts.isInterfaceDeclaration(s) && s.name.text === 'User'
);
if (userInterface) {
  const refs = findAllReferences(program, 'src/models.ts', userInterface.name.getStart());
  console.log(`Found ${refs.length} references to User`);
}
```

### 3.10 类型图可视化导出

```typescript
import * as ts from 'typescript';
import * as fs from 'node:fs';

function exportTypeGraph(program: ts.Program, outputPath: string): void {
  const checker = program.getTypeChecker();
  const nodes: Array<{ id: number; name: string; kind: string }> = [];
  const edges: Array<{ from: number; to: number; label: string }> = [];
  let idCounter = 0;

  function getId(): number { return idCounter++; }

  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;

    ts.forEachChild(sourceFile, function visit(node) {
      if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node)) {
        const typeId = getId();
        nodes.push({ id: typeId, name: node.name.text, kind: ts.SyntaxKind[node.kind] });

        const type = checker.getTypeAtLocation(node.name);
        const properties = checker.getPropertiesOfType(type);

        for (const prop of properties) {
          const propType = checker.getTypeOfSymbolAtLocation(prop, node);
          const propTypeName = checker.typeToString(propType);

          // 简化：为每个属性创建虚拟节点
          const propId = getId();
          nodes.push({ id: propId, name: propTypeName, kind: 'PropertyType' });
          edges.push({ from: typeId, to: propId, label: prop.name });
        }
      }
      ts.forEachChild(node, visit);
    });
  }

  // 输出为 Graphviz DOT 格式
  const dot = [
    'digraph TypeGraph {',
    ...nodes.map(n => `  ${n.id} [label="${n.name}"];`),
    ...edges.map(e => `  ${e.from} -> ${e.to} [label="${e.label}"];`),
    '}',
  ].join('\n');

  fs.writeFileSync(outputPath, dot, 'utf-8');
}
```

### 3.8 常见误区

| 误区 | 正确理解 |
|------|---------|
| AST 修改后类型自动更新 | 修改 AST 后需重新创建 `Program` 获取最新类型 |
| `ts-morph` 比原生 API 慢 | ts-morph 底层仍是原生 API，慢在对象封装层 |
| Compiler API 只能分析 TS | 同样可解析 `.js` 文件并执行类型推断（`allowJs`） |
| Language Service 即 Compiler API | Language Service 是更上层的封装，支持增量更新 |

### 3.9 扩展阅读

- [TypeScript Compiler API Wiki](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
- [TypeScript AST Viewer](https://ts-ast-viewer.com/)
- [ts-morph Documentation](https://ts-morph.com/)
- [Babel Plugin Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)
- [AST Explorer](https://astexplorer.net/)
- `10-fundamentals/10.2-type-system/`

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| TypeScript Compiler API Wiki | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API> | 官方编译器 API 文档 |
| TypeScript AST Viewer | <https://ts-ast-viewer.com/> | 交互式 AST 查看器 |
| ts-morph Documentation | <https://ts-morph.com/> | 面向对象的编译器 API 封装 |
| AST Explorer | <https://astexplorer.net/> | 多语言 AST 对比工具 |
| Babel Plugin Handbook | <https://github.com/jamiebuilds/babel-handbook> | Babel 插件开发指南 |
| TypeScript Language Service API | <https://github.com/microsoft/TypeScript/wiki/Architectural-Overview> | 语言服务架构概述 |
| TypeScript Deep Dive — Compiler | <https://basarat.gitbook.io/typescript/overview> | 社区深度教程 |
| TypeScript Compiler Internals | <https://www.typescriptlang.org/dev/typescript-internals/> | 官方内部文档 |
| TypeScript Handbook: AST Traversal | <https://www.typescriptlang.org/docs/handbook/compiler-api.html> | 遍历与生成代码 |
| ESLint TypeScript Utils | <https://typescript-eslint.org/developers/custom-rules> | 自定义规则开发 |
| TypeScript Compiler Host | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#customizing-module-resolution> | 自定义编译宿主 |
| TypeScript Program API | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler> | 最小化编译器示例 |
| TypeScript Transformer API | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#transpiling-a-single-file> | 单文件转换 |
| ts-morph Manipulation | <https://ts-morph.com/manipulation/> | 代码变更操作文档 |
| TypeScript SyntaxKind Reference | <https://basarat.gitbook.io/typescript/overview> | 所有 AST 节点类型参考 |
| TypeScript Compiler API — Program | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#a-minimal-compiler> | Program 对象详解 |
| TypeScript TypeChecker API | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#type-checker-apis> | 类型检查器 API |
| Graphviz DOT Language | <https://graphviz.org/doc/info/lang.html> | 类型图可视化格式 |
| TypeScript Decorators Proposal | <https://github.com/tc39/proposal-decorators> | 装饰器 TC39 提案 |
| TypeScript 5.0 Decorators | <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators> | TS 5.0 装饰器实现 |
| TypeScript Symbol API | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#symbols> | 符号表操作 |
| TypeScript Emitter API | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#emitting> | 代码发射控制 |
| TypeScript Diagnostic API | <https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#diagnostics> | 诊断信息处理 |

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
