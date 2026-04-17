/**
 * @file 使用 TypeScript Compiler API 从源码生成 .d.ts 声明文件
 * @category JS/TS Comparison → Compiler API
 * @difficulty medium
 * @tags typescript, compiler-api, declaration, emit
 * @description
 * 利用 ts.createProgram + ts.createCompilerHost 编译内存中的 TS 源码，
 * 通过拦截 writeFile 捕获 .d.ts 输出内容并返回为字符串。
 */

import * as ts from 'typescript';

/**
 * 将 TypeScript 源码编译为 .d.ts 声明文件内容
 *
 * 工程要点：
 * 1. 设置 compilerOptions.declaration = true 与 emitDeclarationOnly = true
 * 2. 创建自定义 CompilerHost，拦截 writeFile 以捕获 .d.ts 内容
 * 3. 对 virtual.ts 返回内存中的源码，其余文件委托给默认 Host
 * 4. 调用 program.emit() 触发声明文件生成
 * 5. 使用 getPreEmitDiagnostics 提前检查源码中的语法/类型错误
 *
 * @param sourceCode - TypeScript 源代码字符串
 * @returns 生成的 .d.ts 内容
 */
export function generateDts(sourceCode: string): string {
  const fileName = 'virtual.ts';
  const defaultHost = ts.createCompilerHost({});
  let dtsContent = '';

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
    writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles) {
      if (fileName.endsWith('.d.ts')) {
        dtsContent = data;
      } else {
        defaultHost.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
      }
    },
  };

  const options: ts.CompilerOptions = {
    declaration: true,
    emitDeclarationOnly: true,
    strict: true,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    skipLibCheck: true,
    noEmitOnError: false, // 即使有错误也尝试生成声明
  };

  const program = ts.createProgram([fileName], options, customHost);

  // 先触发编译，让 writeFile 拦截到 .d.ts 内容
  program.emit();

  // 获取并输出诊断信息（如果有），附加到已生成的 dts 内容前
  const diagnostics = ts.getPreEmitDiagnostics(program);
  if (diagnostics.length > 0) {
    const formatHost: ts.FormatDiagnosticsHost = {
      getCanonicalFileName: (path) => path,
      getCurrentDirectory: () => defaultHost.getCurrentDirectory?.() ?? process.cwd(),
      getNewLine: () => ts.sys.newLine,
    };
    const diagnosticText = ts.formatDiagnosticsWithColorAndContext(diagnostics, formatHost);
    if (diagnosticText.trim()) {
      dtsContent = `/* 编译诊断信息:\n${diagnosticText}\n*/\n` + dtsContent;
    }
  }

  return dtsContent;
}

/**
 * Demo：在控制台打印源码对应的 .d.ts 输出
 */
export function demo(): void {
  const source = `
    export interface Person {
      name: string;
      age: number;
    }

    export function greet(person: Person): string;

    export class Greeter {
      constructor(message: string);
      greet(): string;
    }
  `;

  const dts = generateDts(source);
  console.log('=== 生成的 .d.ts 内容 ===');
  console.log(dts);
}
