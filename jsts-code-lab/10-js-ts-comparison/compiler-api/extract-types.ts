/**
 * @file 使用 TypeScript Compiler API 提取源码中的变量与函数类型
 * @category JS/TS Comparison → Compiler API
 * @difficulty medium
 * @tags typescript, compiler-api, ast, type-inference
 * @description
 * 通过自定义 CompilerHost 将内存中的 TS 源码虚拟化为程序，
 * 利用 ts.createProgram 与 TypeChecker 遍历 AST，提取声明名称及其类型字符串。
 */

import * as ts from 'typescript';

export interface ExtractedTypeInfo {
  /** 声明名称 */
  name: string;
  /** 声明种类：变量 / 函数 */
  kind: string;
  /** 类型字符串表示 */
  typeString: string;
}

/**
 * 从内存中的 TypeScript 源码提取所有变量声明与函数声明的名称和类型
 *
 * 工程要点：
 * 1. 自定义 CompilerHost，让 createProgram 认为存在名为 virtual.ts 的文件
 * 2. 其余文件操作（如 lib.d.ts）委托给默认的 CompilerHost
 * 3. 遍历 AST 时，对 VariableDeclaration 与 FunctionDeclaration 使用 checker.getTypeAtLocation
 *
 * @param sourceCode - TypeScript 源代码字符串
 * @returns 提取出的类型信息数组
 */
export function extractTypes(sourceCode: string): ExtractedTypeInfo[] {
  const fileName = 'virtual.ts';

  // 创建默认 CompilerHost，用于读取 lib.d.ts 等系统文件
  const defaultHost = ts.createCompilerHost({});

  // 自定义 CompilerHost：拦截对 virtual.ts 的读取
  const customHost: ts.CompilerHost = {
    ...defaultHost,
    getSourceFile(name, languageVersion, onError, shouldCreateNewSourceFile) {
      if (name === fileName) {
        return ts.createSourceFile(fileName, sourceCode, languageVersion, true);
      }
      return defaultHost.getSourceFile(name, languageVersion, onError, shouldCreateNewSourceFile);
    },
    readFile(name) {
      if (name === fileName) {
        return sourceCode;
      }
      return defaultHost.readFile(name);
    },
    fileExists(name) {
      if (name === fileName) {
        return true;
      }
      return defaultHost.fileExists(name);
    },
  };

  // 创建 Program，仅包含虚拟文件
  const program = ts.createProgram([fileName], { noEmit: true }, customHost);
  const checker = program.getTypeChecker();
  const sourceFile = program.getSourceFile(fileName);

  if (!sourceFile) {
    throw new Error('Failed to create virtual source file');
  }

  const results: ExtractedTypeInfo[] = [];

  // 递归遍历 AST 节点
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node)) {
      const name = node.name.getText(sourceFile);
      // 获取该节点在类型系统中的 Type 对象
      const type = checker.getTypeAtLocation(node);
      const typeString = checker.typeToString(type);
      results.push({ name, kind: '变量', typeString });
    } else if (ts.isFunctionDeclaration(node) && node.name) {
      const name = node.name.getText(sourceFile);
      const type = checker.getTypeAtLocation(node);
      const typeString = checker.typeToString(type);
      results.push({ name, kind: '函数', typeString });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return results;
}

/**
 * Demo：在控制台打印提取结果
 */
export function demo(): void {
  const source = `
    const count: number = 42;
    const message = 'hello';
    function add(a: number, b: number): number {
      return a + b;
    }
    const arr = [1, 2, 3];
  `;

  const extracted = extractTypes(source);
  console.log('=== 提取类型信息 ===');
  for (const item of extracted) {
    console.log(`[${item.kind}] ${item.name}: ${item.typeString}`);
  }
}
