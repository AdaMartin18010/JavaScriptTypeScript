/**
 * @file 使用 TypeScript Transformer API 自动为类属性添加 readonly
 * @category JS/TS Comparison → Compiler API
 * @difficulty medium
 * @tags typescript, compiler-api, transformer, ast-mutation
 * @description
 * 编写自定义 TypeScript Transformer，遍历 Class 中的 PropertyDeclaration，
 * 为所有非 readonly 的属性自动追加 readonly 修饰符，并使用 Printer 输出结果代码。
 */

import * as ts from 'typescript';

/**
 * 创建自动添加 readonly 修饰符的 Transformer
 *
 * 遍历逻辑：
 * 1. 使用 ts.visitEachChild 递归遍历每个节点
 * 2. 当遇到 ts.SyntaxKind.PropertyDeclaration 时：
 *    - 检查 modifiers 中是否已包含 ts.SyntaxKind.ReadonlyKeyword
 *    - 若不存在，使用 ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword) 追加
 *    - 使用 ts.factory.updatePropertyDeclaration 生成新节点
 *
 * @returns TypeScript Transformer 函数
 */
function createReadonlyTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    const visit: ts.Visitor = (node) => {
      if (ts.isPropertyDeclaration(node)) {
        const hasReadonly = node.modifiers?.some(
          (m) => m.kind === ts.SyntaxKind.ReadonlyKeyword
        );

        if (!hasReadonly) {
          const readonlyModifier = ts.factory.createModifier(ts.SyntaxKind.ReadonlyKeyword);
          const newModifiers = ts.factory.createNodeArray([
            readonlyModifier,
            ...(node.modifiers ?? []),
          ]);

          // 更新属性声明，追加 readonly 修饰符
          return ts.factory.updatePropertyDeclaration(
            node,
            node.modifiers ? newModifiers : newModifiers,
            node.name,
            node.questionToken,
            node.type,
            node.initializer
          );
        }
      }

      return ts.visitEachChild(node, visit, context);
    };

    return (sourceFile) => ts.visitNode(sourceFile, visit, ts.isSourceFile) as ts.SourceFile;
  };
}

/**
 * 将源码中的类属性全部转为 readonly 后输出新代码字符串
 *
 * @param sourceCode - TypeScript 源代码字符串
 * @returns 转换后的代码字符串
 */
export function addReadonlyToProperties(sourceCode: string): string {
  const sourceFile = ts.createSourceFile('input.ts', sourceCode, ts.ScriptTarget.Latest, true);

  // 应用 transformer
  const result = ts.transform(sourceFile, [createReadonlyTransformer()]);
  const transformed = result.transformed[0];

  // 使用 Printer 将 AST 打印为代码字符串
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const output = printer.printFile(transformed);

  result.dispose();

  return output;
}

/**
 * Demo：在控制台展示转换前后的代码对比
 */
export function demo(): void {
  const source = `
class User {
  name: string;
  public age: number;
  readonly id: string;
  private email?: string;
}
`;

  const output = addReadonlyToProperties(source);
  console.log('=== 原始代码 ===');
  console.log(source.trim());
  console.log('=== 转换后代码 ===');
  console.log(output.trim());
}
