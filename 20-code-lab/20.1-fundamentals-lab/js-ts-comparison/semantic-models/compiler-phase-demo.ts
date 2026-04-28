/**
 * @file 编译器阶段演示器
 * @category JS/TS Comparison → Semantic Models
 * @difficulty hard
 * @tags compiler, ast, type-inference, emitter, typescript-api
 *
 * @description
 * 使用真实 TypeScript 编译器 API 演示编译器前端流水线：
 * parse → traverse → type-check → transform → emit。
 *
 * 规范对齐: COMPILER_LANGUAGE_DESIGN.md §1、§5
 */

import ts from 'typescript';

const DEMO_FILE_NAME = 'demo.ts';

/**
 * 使用 ts.createSourceFile 解析源码为 AST，并返回顶层节点类型名称列表。
 */
export function getAstNodeKinds(sourceCode: string): string[] {
  const sourceFile = ts.createSourceFile(DEMO_FILE_NAME, sourceCode, ts.ScriptTarget.ESNext, true);
  const kinds: string[] = [];
  ts.forEachChild(sourceFile, (node) => {
    kinds.push(ts.SyntaxKind[node.kind]);
  });
  return kinds;
}

/**
 * 使用 ts.createProgram 获取类型检查器，推断变量与函数的类型。
 */
export function getInferredTypes(sourceCode: string): {
  variables: Record<string, string>;
  functions: Record<string, string>;
} {
  const sourceFile = ts.createSourceFile(DEMO_FILE_NAME, sourceCode, ts.ScriptTarget.ESNext, true);

  // 构造自定义 CompilerHost，使 createProgram 能读取内存中的 sourceFile
  const compilerHost = ts.createCompilerHost({});
  const originalGetSourceFile = compilerHost.getSourceFile.bind(compilerHost);
  compilerHost.getSourceFile = (fileName, languageVersion, onError, shouldCreateNewSourceFile) => {
    if (fileName === DEMO_FILE_NAME) return sourceFile;
    return originalGetSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
  };

  const program = ts.createProgram([DEMO_FILE_NAME], { noEmit: true }, compilerHost);
  const checker = program.getTypeChecker();

  const variables: Record<string, string> = {};
  const functions: Record<string, string> = {};

  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const type = checker.getTypeAtLocation(node);
      variables[node.name.text] = checker.typeToString(type);
    }
    if (ts.isFunctionDeclaration(node) && node.name) {
      const type = checker.getTypeAtLocation(node);
      functions[node.name.text] = checker.typeToString(type);
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  return { variables, functions };
}

/**
 * 演示 AST 变换：将所有 `const` 声明改为 `let` 声明，
 * 并使用 ts.createPrinter 将修改后的 AST 打印回代码字符串。
 */
export function transformConstToLet(sourceCode: string): string {
  const sourceFile = ts.createSourceFile(DEMO_FILE_NAME, sourceCode, ts.ScriptTarget.ESNext, true);

  const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sf) => {
      function visitor(node: ts.Node): ts.Node {
        if (ts.isVariableStatement(node)) {
          const declList = node.declarationList;
          if (declList.flags & ts.NodeFlags.Const) {
            const newDeclList = ts.factory.createVariableDeclarationList(
              declList.declarations.map((d) => ts.visitNode(d, visitor) as ts.VariableDeclaration),
              ts.NodeFlags.Let
            );
            return ts.factory.updateVariableStatement(node, node.modifiers, newDeclList);
          }
        }
        return ts.visitEachChild(node, visitor, context);
      }
      return ts.visitNode(sf, visitor) as ts.SourceFile;
    };
  };

  const result = ts.transform(sourceFile, [transformer]);
  const transformedSf = result.transformed[0];
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const output = printer.printFile(transformedSf);
  result.dispose();
  return output;
}

/**
 * 综合演示：AST 解析、遍历、类型推断、AST 修改与代码生成。
 */
export function demo(): void {
  const sourceCode = `
function add(a: number, b: number): number {
  return a + b;
}
const result = add(1, 2);
const message: string = "hello";
`;

  console.log('=== 编译器阶段演示（基于真实 TypeScript API）===\n');
  console.log('源码:');
  console.log(sourceCode);

  // 1. AST 摘要
  const kinds = getAstNodeKinds(sourceCode);
  console.log('AST 顶层节点:', kinds.join(', '));

  // 2. 类型推断
  const types = getInferredTypes(sourceCode);
  console.log('\n推断出的类型:');
  for (const [name, type] of Object.entries(types.functions)) {
    console.log(`  函数 ${name}: ${type}`);
  }
  for (const [name, type] of Object.entries(types.variables)) {
    console.log(`  变量 ${name}: ${type}`);
  }

  // 3. AST 变换 + 打印
  const generated = transformConstToLet(sourceCode);
  console.log('\n生成的 JS 代码（const → let）:');
  console.log(generated);
}
