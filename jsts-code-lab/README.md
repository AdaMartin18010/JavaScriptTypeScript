# JSTS Code Lab - JavaScript/TypeScript 代码实验室

> 从理论到实践的完整代码示例库

[![Modules](https://img.shields.io/badge/Modules-44-blue)](./)
[![Files](https://img.shields.io/badge/Files-206-green)](./)
[![Patterns](https://img.shields.io/badge/Patterns-23%20GoF-orange)](./)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

## 📖 项目简介

本项目是 [JavaScriptTypeScript 全景综述](../JSTS全景综述/) 的配套代码实验室，将理论知识转化为可运行、可测试的实际代码。

## 🎯 项目目标

- ✅ **可运行**：每个代码文件都可以独立运行
- ✅ **可测试**：配套完整的单元测试
- ✅ **渐进式**：从基础到高级，循序渐进
- ✅ **对比性**：JavaScript vs TypeScript 对比
- ✅ **实用性**：真实场景案例

## 🛠️ 技术栈

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 22+ | 运行时 |
| TypeScript | 5.8+ | 类型系统 |
| pnpm | 10+ | 包管理 |
| Vitest | 3+ | 测试框架 |
| ESLint | 9+ | 代码检查 |
| Prettier | 3+ | 代码格式化 |

## 🚀 快速开始

```bash
# 1. 进入项目目录
cd jsts-code-lab

# 2. 安装依赖
pnpm install

# 3. 运行单个示例
pnpm run:ts 00-language-core/01-types/primitives.ts

# 4. 运行测试
pnpm test

# 5. 运行测试并查看覆盖率
pnpm test:coverage

# 6. 类型检查
pnpm type-check

# 7. 代码格式化
pnpm format
```

## 📁 目录结构

```
jsts-code-lab/
├── 📁 00-language-core/          # 语言核心
│   ├── 01-types/                 # 类型系统
│   ├── 02-variables/             # 变量系统
│   ├── 03-control-flow/          # 控制流
│   ├── 04-functions/             # 函数
│   ├── 05-objects-classes/       # 对象与类
│   ├── 06-modules/               # 模块系统
│   └── 07-metaprogramming/       # 元编程
│
├── 📁 01-ecmascript-evolution/   # ECMAScript演进
│   ├── es2020/                   # 可选链、空值合并等
│   ├── es2021/                   # Promise.any、逻辑赋值等
│   ├── es2022/                   # Class字段、私有成员等
│   ├── es2023/                   # 数组新方法
│   ├── es2024/                   # Object.groupBy等
│   └── es2025-preview/           # 预览特性
│
├── 📁 02-design-patterns/        # 设计模式
│   ├── creational/               # 创建型模式
│   ├── structural/               # 结构型模式
│   ├── behavioral/               # 行为型模式
│   └── js-ts-specific/           # JS/TS特有模式
│
├── 📁 03-concurrency/            # 并发编程
│   ├── event-loop/               # 事件循环
│   ├── promises/                 # Promise模式
│   ├── async-await/              # 异步函数
│   ├── workers/                  # Web Worker
│   ├── atomics/                  # Atomics API
│   └── streaming/                # 流处理
│
├── 📁 04-data-structures/        # 数据结构
│   ├── built-in/                 # 内置结构
│   ├── custom/                   # 自定义实现
│   └── functional/               # 函数式数据结构
│
├── 📁 05-algorithms/             # 算法
├── 📁 06-architecture-patterns/  # 架构模式
├── 📁 07-testing/                # 测试实践
├── 📁 08-performance/            # 性能优化
├── 📁 09-real-world-examples/    # 真实场景案例
├── 📁 10-js-ts-comparison/       # JS/TS对比
├── 📁 11-benchmarks/             # 性能基准
├── 📁 12-package-management/     # 包管理
├── 📁 13-code-organization/      # 代码组织
├── 📁 14-execution-flow/         # 执行流
├── 📁 15-data-flow/              # 数据流
├── 📁 16-application-development/# 应用开发
├── 📁 17-debugging-monitoring/   # 调试监控
├── 📁 18-frontend-frameworks/    # 前端框架
│   └── reactivity-system.ts      # 响应式系统
├── 📁 19-backend-development/    # 后端开发
│   └── express-patterns.ts       # Express模式
├── 📁 20-database-orm/           # 数据库ORM
│   ├── prisma-patterns.ts        # Prisma模式
│   └── sql-query-builder.ts      # 查询构建器
├── 📁 21-api-security/           # API安全
│   ├── jwt-auth.ts               # JWT认证
│   └── rate-limiter.ts           # 速率限制
├── 📁 22-deployment-devops/      # 部署与DevOps
│   └── docker-config.ts          # Docker配置
├── 📁 23-toolchain-configuration/# 工具链配置
│   └── vite-config.ts            # Vite配置
├── 📁 24-graphql/                # GraphQL
│   └── schema-builder.ts         # Schema构建器
├── 📁 25-microservices/          # 微服务
│   └── service-mesh.ts           # 服务网格
├── 📁 26-event-sourcing/         # 事件溯源
│   └── event-store.ts            # 事件存储
├── 📁 27-internationalization/   # 国际化
│   └── i18n-system.ts            # i18n系统
├── 📁 28-testing-advanced/       # 高级测试
│   └── e2e-testing.ts            # E2E测试
├── 📁 29-documentation/          # 文档生成
│   └── api-docs-generator.ts     # API文档生成
├── 📁 30-real-time-communication/# 实时通信
│   └── sse-webrtc.ts             # SSE/WebRTC
├── 📁 31-serverless/             # 无服务器架构
│   └── serverless-patterns.ts    # Serverless模式
├── 📁 32-edge-computing/         # 边缘计算
│   └── edge-runtime.ts           # 边缘运行时
├── 📁 33-ai-integration/         # AI集成
│   └── ai-sdk-patterns.ts        # AI SDK模式
├── 📁 34-blockchain-web3/        # Web3/区块链
│   └── web3-patterns.ts          # Web3模式
├── 📁 35-accessibility-a11y/     # 无障碍访问
│   └── a11y-utils.ts             # 无障碍工具
├── 📁 36-web-assembly/           # WebAssembly
│   └── wasm-integration.ts       # WASM集成
├── 📁 37-pwa/                    # PWA
│   └── pwa-patterns.ts           # PWA模式
├── 📁 38-web-security/           # Web安全
│   └── xss-csp.ts                # XSS/CSP
├── 📁 39-performance-monitoring/ # 性能监控
│   └── core-web-vitals.ts        # Core Web Vitals
├── 📁 shared/                    # 共享模块
├── 📁 tests/                     # 测试套件
└── 📁 playground/                # 演练场
```

## 📝 代码规范

每个代码文件头部包含元数据注释：

```typescript
/**
 * @file 文件名
 * @category 分类路径
 * @see 关联的理论文档
 * @difficulty 难度等级 (warm/easy/medium/hard/extreme)
 * @tags 标签
 * @description 简要描述
 */
```

## 🔗 与理论文档的关联

每个代码文件都通过 `@see` 标签关联到对应的理论文档：

| 代码路径 | 理论文档 |
|---------|---------|
| `00-language-core/01-types/` | `../JSTS全景综述/01_language_core.md#类型系统` |
| `01-ecmascript-evolution/es2020/` | `../JSTS全景综述/01_language_core.md#ES2020` |
| `02-design-patterns/` | `../JSTS全景综述/03_design_patterns.md` |
| `03-concurrency/` | `../JSTS全景综述/04_concurrency.md` |

## 🧪 测试策略

- **单元测试**：每个模块的独立测试
- **集成测试**：模块间的协作测试
- **覆盖率目标**：核心代码 100%，示例代码关键路径

## 📚 学习路径

### 初学者

1. `00-language-core/01-types/primitives.ts` - 原始类型
2. `00-language-core/02-variables/declarations.ts` - 变量声明
3. `01-ecmascript-evolution/es2020/optional-chaining.ts` - 现代语法

### 进阶开发者

1. `00-language-core/01-types/generics.ts` - 泛型系统
2. `02-design-patterns/` - 设计模式
3. `03-concurrency/` - 并发编程

### 架构师

1. `05-distributed-systems/` - 分布式系统
2. `06-architecture-patterns/` - 架构模式
3. `07-testing/` - 测试策略

## 🤝 贡献指南

1. 代码必须能通过 TypeScript 严格模式检查
2. 每个功能必须有对应的测试用例
3. 保持代码风格一致 (Prettier + ESLint)
4. 添加清晰的注释和文档

## 📄 License

MIT License
