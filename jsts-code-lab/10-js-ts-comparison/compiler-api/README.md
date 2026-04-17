# TypeScript Compiler API 工程实践

本文档汇集了三个可直接运行的 TypeScript Compiler API 工程示例，展示如何在真实项目中利用 `typescript` 包提供的底层能力进行 AST 分析、代码转换与声明文件生成。

---

## 示例一览

### 1. `extract-types.ts` — AST 类型提取

**用途**：从内存中的 TypeScript 源码字符串里，提取所有变量声明和函数声明的名称及其类型字符串。

**学习价值**：

- 学习如何构建**自定义 `CompilerHost`**，让 `ts.createProgram` 无需真实磁盘文件即可工作。
- 掌握 `TypeChecker.getTypeAtLocation()` 与 `checker.typeToString()` 的使用。
- 理解 AST 遍历模式（`ts.forEachChild`）与节点类型判断（`ts.isVariableDeclaration`、`ts.isFunctionDeclaration`）。

### 2. `custom-transformer.ts` — 自定义 AST Transformer

**用途**：编写自定义 Transformer，遍历类属性声明，为所有非 `readonly` 的属性自动添加 `readonly` 修饰符。

**学习价值**：

- 学习 `ts.TransformerFactory` 的编写范式与 `ts.visitEachChild` 的递归访问模式。
- 掌握 `ts.factory.updatePropertyDeclaration` 对 AST 节点进行不可变更新的方法。
- 理解 `ts.transform()` 与 `ts.createPrinter()` 的完整代码生成链路。

### 3. `generate-dts.ts` — 程序化生成 `.d.ts`

**用途**：将一段 TypeScript 源码编译并生成对应的 `.d.ts` 声明文件内容。

**学习价值**：

- 学习如何在 `CompilerHost.writeFile` 中拦截编译输出，将结果捕获到内存字符串。
- 掌握 `ts.getPreEmitDiagnostics()` 的调用时机与诊断信息格式化。
- 理解 `declaration: true` + `emitDeclarationOnly: true` 的编译选项组合。

---

## 运行命令示例

> 以下命令均假设工作目录为 `jsts-code-lab/`。

```bash
# 运行 extract-types 示例
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/compiler-api/extract-types.ts

# 运行 custom-transformer 示例
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/compiler-api/custom-transformer.ts

# 运行 generate-dts 示例
pnpm exec tsx jsts-code-lab/10-js-ts-comparison/compiler-api/generate-dts.ts
```

---

## 测试

所有示例均配有对应的 `.test.ts` 文件，使用 **vitest** 编写。在项目根目录执行：

```bash
pnpm test jsts-code-lab/10-js-ts-comparison/compiler-api
```

---

文档版本 v1.0 | 最后更新 2026-04-17
