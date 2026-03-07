# JavaScriptTypeScript

JavaScript TypeScript 全景综述与代码实验室

## 📚 项目概览

本项目是对 JavaScript/TypeScript 生态系统的全面技术分析，包含：

1. **📖 理论文档** (`JSTS全景综述/`) - 14个核心技术文档，超过10万字
2. **💻 代码实验室** (`jsts-code-lab/`) - 可运行、可测试的代码示例

对比两者编程语言的语法语义，转换与等价，示例实例反例，等等
从形式语言的视角来梳理：

1. 类型系统 2. 变量 3.控制流
从语义上的扩展：
1. 设计模式 2. 并发并行同步异步 3. 分布式设计模式 4. 工作流设计模式 5. UI前端等设计模式等
从应用生态上扩展：
1. 编译打包分发，2. 工程 3. 发展趋势等

结合多种思维表征方式 比如 思维导图 多维概念矩阵对比
决策树图 应用场景树图 等

开源著名的软件堆栈等 全面梳理和持续推进

## 🗂️ 项目结构

```
JavaScriptTypeScript/
├── 📚 JSTS全景综述/                    # 理论文档
│   ├── 00_全景综述索引与总结.md
│   ├── 01_language_core.md           # 语言核心
│   ├── 02_package_stdlib.md          # 包管理/标准库
│   ├── 03_design_patterns.md         # 设计模式
│   ├── 04_concurrency.md             # 并发编程
│   ├── 05_distributed_systems.md     # 分布式系统
│   ├── 06_workflow_patterns.md       # 工作流模式
│   ├── 07_architecture.md            # 架构设计
│   ├── 08_observability.md           # 可观测性
│   ├── 09_cicd.md                    # CI/CD
│   ├── 10_ai_ml.md                   # AI/ML
│   └── ... 其他专业文档
│
└── 💻 jsts-code-lab/                   # 代码实验室
    ├── 📁 00-language-core/            # 语言核心
    │   ├── 01-types/                   # 类型系统
    │   ├── 02-variables/               # 变量系统
    │   ├── 03-control-flow/            # 控制流
    │   ├── 04-functions/               # 函数
    │   ├── 05-objects-classes/         # 对象与类
    │   ├── 06-modules/                 # 模块系统
    │   └── 07-metaprogramming/         # 元编程
    │
    ├── 📁 01-ecmascript-evolution/     # ES演进
    │   ├── es2020/                     # 可选链、空值合并等
    │   ├── es2021/                     # Promise.any等
    │   ├── es2022/                     # Class字段等
    │   ├── es2023/                     # 数组新方法
    │   ├── es2024/                     # Object.groupBy等
    │   └── es2025-preview/             # 预览特性
    │
    ├── 📁 02-design-patterns/          # 设计模式
    │   ├── creational/                 # 创建型模式
    │   ├── structural/                 # 结构型模式
    │   ├── behavioral/                 # 行为型模式
    │   └── js-ts-specific/             # JS/TS特有模式
    │
    ├── 📁 03-concurrency/              # 并发编程
    ├── 📁 04-data-structures/          # 数据结构
    ├── 📁 05-algorithms/               # 算法
    ├── 📁 06-architecture-patterns/    # 架构模式
    ├── 📁 07-testing/                  # 测试实践
    ├── 📁 08-performance/              # 性能优化
    ├── 📁 09-real-world-examples/      # 真实场景案例
    ├── 📁 shared/                      # 共享模块
    └── 📁 tests/                       # 测试套件
```

## 🚀 快速开始

### 代码实验室

```bash
# 进入代码实验室
cd jsts-code-lab

# 安装依赖 (Node.js 22+ 和 pnpm 10+)
pnpm install

# 运行示例
pnpm run:ts 00-language-core/01-types/primitives.ts

# 运行测试
pnpm test

# 类型检查
pnpm type-check
```

## 📊 内容统计

| 模块 | 文件数 | 主要特性 |
|------|--------|----------|
| 00-language-core | 15+ | 类型系统、变量、函数、类、模块、元编程 |
| 01-ecmascript-evolution | 20+ | ES2020-ES2025 完整特性 |
| 02-design-patterns | 30+ | GoF 23种模式 + JS/TS特有模式 |
| 03-concurrency | 15+ | 事件循环、Promise、Worker、流 |
| 04-data-structures | 20+ | 内置、自定义、函数式数据结构 |
| 05-algorithms | 20+ | 排序、搜索、递归、动态规划 |
| 06-architecture-patterns | 10+ | 分层、六边形、清洁架构 |
| 07-09 实战 | 15+ | 测试、性能、真实案例 |

## 🛠️ 技术栈

- **Node.js**: 22+ (支持最新TS特性)
- **TypeScript**: 5.8+ (strict模式)
- **pnpm**: 10+ (workspace)
- **Vitest**: 3+ (测试)
- **Vite**: 6+ (构建)
- **ESLint**: 9+ (代码检查)
- **Prettier**: 3+ (格式化)

## 📝 文档索引

### 学习路径

**初学者**:
1. 阅读 `JSTS全景综述/01_language_core.md` (理论)
2. 运行 `jsts-code-lab/00-language-core/` 代码
3. 完成配套测试

**进阶开发者**:
1. 研究 `04_concurrency.md` + `03-concurrency/` 代码
2. 学习 `03_design_patterns.md` + `02-design-patterns/` 实现
3. 实践可观测性和测试

**架构师**:
1. 分析 `05_distributed_systems.md`
2. 研究 `06-architecture-patterns/` 代码
3. 设计微服务架构

## 🔗 关联映射

代码文件头部包含元数据，关联到对应理论文档：

```typescript
/**
 * @file 可选链操作符 (?.)
 * @see ../../../JSTS全景综述/01_language_core.md#可选链操作符
 * @difficulty easy
 * @tags es2020, operator, safety
 */
```

## 🤝 贡献

欢迎贡献！请确保：
1. 代码通过 TypeScript 严格模式检查
2. 每个功能有对应的测试用例
3. 保持代码风格一致
4. 添加清晰的注释和文档

## 📄 License

MIT License
