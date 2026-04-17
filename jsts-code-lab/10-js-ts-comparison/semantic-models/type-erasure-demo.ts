/**
 * @file 类型擦除演示器
 * @category JS/TS Comparison → Semantic Models
 * @difficulty medium
 * @tags type-erasure, compiler-semantics, ts-to-js, typescript-api
 *
 * @description
 * 使用真实 TypeScript 编译器 API 演示类型擦除（Type Erasure）保证。
 * 接收一段 TypeScript 代码字符串，通过 AST Transformer 删除所有类型节点，
 * 输出擦除类型后的等价 JavaScript 代码。
 *
 * 规范对齐: TS Spec §2.2、tc39/proposal-type-annotations §Intentional Omissions
 */

import ts from 'typescript';

/**
 * 构造类型擦除 Transformer。
 * 擦除规则：
 * - interface / type alias → 删除
 * - 类型注解（变量、参数、属性、返回类型）→ 删除
 * - 泛型参数 `<T>` → 删除
 * - `as` / `<Type>expr` 断言 → 删除，保留表达式
 * - `implements` 子句 → 删除
 * - `enum` / 参数属性（parameter properties）→ **保留**
 */
function createTypeErasureTransformer(context: ts.TransformationContext): ts.Transformer<ts.SourceFile> {
  return (sourceFile) => {
    function visitor(node: ts.Node): ts.Node | undefined {
      // 1. 删除 interface 声明
      if (ts.isInterfaceDeclaration(node)) {
        return undefined;
      }

      // 2. 删除 type alias 声明
      if (ts.isTypeAliasDeclaration(node)) {
        return undefined;
      }

      // 3. 删除纯类型导入/导出
      if (ts.isImportDeclaration(node) && node.importClause?.isTypeOnly) {
        return undefined;
      }
      if (ts.isExportDeclaration(node) && node.isTypeOnly) {
        return undefined;
      }

      // 4. as 断言与尖括号断言：保留表达式，删除类型
      if (ts.isAsExpression(node) || ts.isTypeAssertionExpression(node)) {
        return ts.visitNode(node.expression, visitor);
      }

      // 5. satisfies 表达式：保留表达式，删除类型
      if (ts.isSatisfiesExpression(node)) {
        return ts.visitNode(node.expression, visitor);
      }

      // 6. 变量声明：删除类型注解
      if (ts.isVariableDeclaration(node)) {
        return ts.factory.updateVariableDeclaration(
          node,
          node.name,
          undefined, // 删除 definite assignment assertion
          undefined, // 删除类型注解
          node.initializer ? (ts.visitNode(node.initializer, visitor) as ts.Expression) : undefined
        );
      }

      // 7. 参数声明：删除类型注解，但保留修饰符（如 public/private，用于参数属性）
      if (ts.isParameter(node)) {
        return ts.factory.updateParameterDeclaration(
          node,
          node.modifiers,
          node.dotDotDotToken,
          node.name,
          node.questionToken,
          undefined, // 删除类型注解
          node.initializer ? (ts.visitNode(node.initializer, visitor) as ts.Expression) : undefined
        );
      }

      // 8. 属性声明：删除类型注解
      if (ts.isPropertyDeclaration(node)) {
        return ts.factory.updatePropertyDeclaration(
          node,
          node.modifiers,
          node.name,
          node.questionToken,
          undefined, // 删除类型注解
          node.initializer ? (ts.visitNode(node.initializer, visitor) as ts.Expression) : undefined
        );
      }

      // 9. 函数声明：删除泛型参数与返回类型
      if (ts.isFunctionDeclaration(node)) {
        return ts.factory.updateFunctionDeclaration(
          node,
          node.modifiers,
          node.asteriskToken,
          node.name,
          undefined, // 删除泛型参数
          node.parameters.map((p) => ts.visitNode(p, visitor) as ts.ParameterDeclaration),
          undefined, // 删除返回类型
          node.body ? (ts.visitNode(node.body, visitor) as ts.Block) : undefined
        );
      }

      // 10. 函数表达式：删除泛型参数与返回类型
      if (ts.isFunctionExpression(node)) {
        return ts.factory.updateFunctionExpression(
          node,
          node.modifiers,
          node.asteriskToken,
          node.name,
          undefined, // 删除泛型参数
          node.parameters.map((p) => ts.visitNode(p, visitor) as ts.ParameterDeclaration),
          undefined, // 删除返回类型
          ts.visitNode(node.body, visitor) as ts.Block
        );
      }

      // 11. 箭头函数：删除泛型参数与返回类型
      if (ts.isArrowFunction(node)) {
        return ts.factory.updateArrowFunction(
          node,
          node.modifiers,
          undefined, // 删除泛型参数
          node.parameters.map((p) => ts.visitNode(p, visitor) as ts.ParameterDeclaration),
          undefined, // 删除返回类型
          node.equalsGreaterThanToken,
          ts.visitNode(node.body, visitor) as ts.ConciseBody
        );
      }

      // 12. 方法声明：删除泛型参数与返回类型
      if (ts.isMethodDeclaration(node)) {
        return ts.factory.updateMethodDeclaration(
          node,
          node.modifiers,
          node.asteriskToken,
          node.name,
          node.questionToken,
          undefined, // 删除泛型参数
          node.parameters.map((p) => ts.visitNode(p, visitor) as ts.ParameterDeclaration),
          undefined, // 删除返回类型
          node.body ? (ts.visitNode(node.body, visitor) as ts.Block) : undefined
        );
      }

      // 13. 构造函数：删除泛型参数
      if (ts.isConstructorDeclaration(node)) {
        return ts.factory.updateConstructorDeclaration(
          node,
          node.modifiers,
          node.parameters.map((p) => ts.visitNode(p, visitor) as ts.ParameterDeclaration),
          node.body ? (ts.visitNode(node.body, visitor) as ts.Block) : undefined
        );
      }

      // 14. 类声明：删除 implements 子句与泛型参数，保留 extends
      if (ts.isClassDeclaration(node)) {
        const heritageClauses = node.heritageClauses
          ?.filter((hc) => hc.token !== ts.SyntaxKind.ImplementsKeyword)
          .map((hc) => ts.visitNode(hc, visitor) as ts.HeritageClause);
        return ts.factory.updateClassDeclaration(
          node,
          node.modifiers,
          node.name,
          undefined, // 删除泛型参数
          heritageClauses?.length ? heritageClauses : undefined,
          node.members.map((m) => ts.visitNode(m, visitor) as ts.ClassElement)
        );
      }

      // 15. 调用表达式：删除类型参数列表 <T>
      if (ts.isCallExpression(node)) {
        return ts.factory.updateCallExpression(
          node,
          ts.visitNode(node.expression, visitor) as ts.Expression,
          undefined, // 删除类型参数
          node.arguments.map((arg) => ts.visitNode(arg, visitor) as ts.Expression)
        );
      }

      // 16. new 表达式：删除类型参数列表
      if (ts.isNewExpression(node)) {
        return ts.factory.updateNewExpression(
          node,
          ts.visitNode(node.expression, visitor) as ts.Expression,
          undefined, // 删除类型参数
          node.arguments?.map((arg) => ts.visitNode(arg, visitor) as ts.Expression)
        );
      }

      // 17. 其他节点继续递归
      return ts.visitEachChild(node, visitor, context);
    }

    return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
  };
}

/**
 * 使用真实 TypeScript 编译器 API 擦除类型标注。
 *
 * @param tsCode - 输入的 TypeScript 代码字符串
 * @returns 擦除类型后的 JavaScript 代码字符串
 */
export function eraseTypes(tsCode: string): string {
  const sourceFile = ts.createSourceFile('input.ts', tsCode, ts.ScriptTarget.ESNext, true);

  const result = ts.transform(sourceFile, [createTypeErasureTransformer]);
  const transformed = result.transformed[0];

  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed,
    removeComments: false,
  });

  const output = printer.printFile(transformed);
  result.dispose();
  return output.trim();
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  const tsCode = `
interface User {
  name: string;
  age: number;
}

type ID = string | number;

function greet<T>(user: User): string {
  return (user.name as string).toUpperCase();
}

enum Role {
  Admin = 1,
  User = 2,
}

class Person {
  constructor(public name: string) {}
}
`;

  console.log('=== TypeScript 源码 ===');
  console.log(tsCode);
  console.log('=== 擦除类型后的 JavaScript ===');
  console.log(eraseTypes(tsCode));
}
