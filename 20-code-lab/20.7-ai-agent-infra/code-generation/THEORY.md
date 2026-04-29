# 代码生成 — 理论基础

## 1. AST（抽象语法树）

源代码的结构化表示，编译器和代码生成工具的核心数据结构：

```
const x = 1 + 2
→
VariableDeclaration
├── declarations
│   └── VariableDeclarator
│       ├── id: Identifier (x)
│       └── init: BinaryExpression (+)
│           ├── left: Literal (1)
│           └── right: Literal (2)
```

## 2. 代码生成工具链对比

| 特性 | Babel | SWC | ESBuild | Oxc | TypeScript Compiler API |
|------|-------|-----|---------|-----|------------------------|
| **语言** | JavaScript | Rust | Go | Rust | TypeScript |
| **主要用途** | 转译、插件生态 | 极速转译 | 极速打包 | 统一工具链 | 类型检查、声明生成 |
| **构建速度** | 中等 | ⚡ 极快（10-20x Babel）| ⚡ 极快（10-20x Babel）| ⚡ 极快 | 慢（侧重类型） |
| **插件系统** | ✅ 极其丰富 | ⚠️ 实验性插件 | ❌ 无插件 | 🚧 开发中 | ✅ 完整 Transformer API |
| **TypeScript 支持** | 通过 preset | 原生支持 | 原生支持 | 原生支持 | 原生（参考实现） |
| **Tree-shaking** | 依赖配置 | 内置 | 内置 | 内置 | 不支持 |
| **Source Map** | 精确 | 精确 | 精确 | 精确 | 精确 |
| **适用场景** | 复杂转换需求 | 大规模项目构建 | 极速开发模式 | 下一代统一工具 | 类型诊断、语言服务 |

### 选型建议

- **需要自定义 AST 转换** → Babel（生态成熟）或 TypeScript Compiler API（类型感知）
- **追求极致构建速度** → SWC（Next.js/Vite 已采用）或 ESBuild
- **需要类型检查 + 打包一体** → TypeScript（tsc）+ ESBuild/SWC 组合
- **未来统一工具链** → 关注 Oxc 演进

## 3. AST 转换代码示例

```typescript
// ast-transform.ts — 使用 Babel 将 console.log 替换为结构化日志

import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import * as t from '@babel/types';

const code = `
function greet(name) {
  console.log('Hello, ' + name);
  return name.toUpperCase();
}
`;

const ast = parse(code, { sourceType: 'module' });

traverse(ast, {
  CallExpression(path) {
    const { callee } = path.node;
    // 匹配 console.log(...)
    if (
      t.isMemberExpression(callee) &&
      t.isIdentifier(callee.object, { name: 'console' }) &&
      t.isIdentifier(callee.property, { name: 'log' })
    ) {
      // 替换为: logger.info(...)
      path.node.callee = t.memberExpression(
        t.identifier('logger'),
        t.identifier('info')
      );
    }
  }
});

const output = generate(ast, {}, code);
console.log(output.code);
// 输出:
// function greet(name) {
//   logger.info('Hello, ' + name);
//   return name.toUpperCase();
// }
```

### 等价的 SWC 插件（Rust 伪代码概念）

```rust
// swc-plugin/src/lib.rs — SWC 插件核心结构
use swc_core::ecma::visit::VisitMut;

pub struct ConsoleToLogger;

impl VisitMut for ConsoleToLogger {
    fn visit_mut_call_expr(&mut self, expr: &mut CallExpr) {
        // 匹配 console.log 并替换为 logger.info
        if is_console_log(expr) {
            expr.callee = MemberExpr {
                obj: Ident::new("logger".into()),
                prop: Ident::new("info".into()).into(),
            }.into();
        }
    }
}
```

## 4. 元编程模式

- **装饰器（Decorator）**: 注解式元数据附加
- **Reflect API**: 运行时类型和元数据操作
- **Proxy**: 拦截对象操作
- **代码模板**: 基于 AST 的代码片段生成
- **宏（Macro）**: 编译期代码生成（如 `babel-plugin-macros`）

## 5. 与相邻模块的关系

- **79-compiler-design**: 编译器的完整设计
- **78-metaprogramming**: 元编程技术
- **23-toolchain-configuration**: 工具链配置

## 参考资源

| 资源 | 类型 | 链接 |
|------|------|------|
| Babel Plugin Handbook | 手册 | [github.com/jamiebuilds/babel-handbook](https://github.com/jamiebuilds/babel-handbook) |
| Babel Parser AST Spec | 规范 | [babeljs.io/docs/babel-parser](https://babeljs.io/docs/babel-parser) |
| SWC Documentation | 文档 | [swc.rs](https://swc.rs) |
| ESBuild Docs | 文档 | [esbuild.github.io](https://esbuild.github.io) |
| Oxc Project | 代码库 | [github.com/oxc-project/oxc](https://github.com/oxc-project/oxc) |
| TypeScript Compiler API | 文档 | [github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) |
| AST Explorer | 工具 | [astexplorer.net](https://astexplorer.net) — 交互式 AST 可视化 |
| TC39 Proposals | 规范 | [tc39.es](https://tc39.es) |

---

*最后更新: 2026-04-29*
