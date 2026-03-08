# 项目目录结构

```text
jsts-code-lab/
├── 📁 00-language-core/              # 语言核心 (17文件)
│   ├── 01-types/                     # 类型系统
│   │   ├── generics.ts
│   │   ├── primitives.ts
│   │   └── type-guards.ts
│   ├── 02-variables/                 # 变量声明
│   ├── 03-control-flow/              # 控制流
│   ├── 04-functions/                 # 函数
│   ├── 05-objects-classes/           # 对象与类
│   ├── 06-modules/                   # 模块系统
│   ├── 07-metaprogramming/           # 元编程
│   └── index.ts
│
├── 📁 01-ecmascript-evolution/       # ES演进 (12文件)
│   ├── es2020/                       # ES2020特性
│   ├── es2021/                       # ES2021特性
│   ├── es2022/                       # ES2022特性
│   ├── es2023/                       # ES2023特性
│   ├── es2024/                       # ES2024特性
│   └── index.ts
│
├── 📁 02-design-patterns/            # 设计模式 (24文件)
│   ├── creational/                   # 创建型模式 (5)
│   │   ├── singleton.ts
│   │   ├── factory.ts
│   │   ├── abstract-factory.ts
│   │   ├── builder.ts
│   │   └── prototype.ts
│   ├── structural/                   # 结构型模式 (7)
│   │   ├── adapter.ts
│   │   ├── bridge.ts
│   │   ├── composite.ts
│   │   ├── decorator.ts
│   │   ├── facade.ts
│   │   ├── flyweight.ts
│   │   └── proxy.ts
│   ├── behavioral/                   # 行为型模式 (11)
│   │   ├── observer.ts
│   │   ├── strategy.ts
│   │   ├── command.ts
│   │   ├── iterator.ts
│   │   ├── mediator.ts
│   │   ├── memento.ts
│   │   ├── state.ts
│   │   ├── template-method.ts
│   │   ├── visitor.ts
│   │   ├── chain-of-responsibility.ts
│   │   └── interpreter.ts
│   └── index.ts
│
├── 📁 03-concurrency/                # 并发编程 (7文件)
│   ├── async-await/
│   ├── promises/
│   ├── event-loop/
│   ├── workers/
│   ├── streaming/
│   └── index.ts
│
├── 📁 04-data-structures/            # 数据结构 (7文件)
│   ├── built-in/
│   ├── custom/
│   │   ├── linked-list.ts
│   │   ├── stack-queue.ts
│   │   ├── tree.ts
│   │   ├── graph.ts
│   │   └── heap.ts
│   └── index.ts
│
├── 📁 05-algorithms/                 # 算法 (7文件)
│   ├── sorting/
│   ├── searching/
│   ├── recursion/
│   ├── dynamic-programming/
│   └── index.ts
│
├── 📁 06-architecture-patterns/      # 架构模式 (7文件)
│   ├── layered/                      # 分层架构
│   ├── hexagonal/                    # 六边形架构
│   ├── mvc/                          # MVC
│   ├── mvvm/                         # MVVM
│   ├── microservices/                # 微服务
│   ├── cqrs/                         # CQRS
│   └── index.ts
│
├── 📁 07-testing/                    # 测试 (6文件)
│   ├── unit-test-patterns.ts
│   ├── integration-testing.ts
│   ├── e2e-testing.ts
│   ├── mock-stub.ts
│   ├── tdd-bdd.ts
│   └── index.ts
│
├── 📁 08-performance/                # 性能优化 (6文件)
│   ├── optimization-patterns.ts
│   ├── memory-management.ts
│   ├── bundle-optimization.ts
│   ├── rendering-optimization.ts
│   ├── network-optimization.ts
│   └── index.ts
│
├── 📁 09-real-world-examples/        # 实战案例 (9文件)
│   ├── api-client/
│   ├── cli-tools/
│   ├── web-server/
│   ├── data-processing/
│   ├── state-management/
│   ├── auth-system/
│   ├── event-bus/
│   ├── validation/
│   └── index.ts
│
├── 📁 10-js-ts-comparison/           # JS/TS对比 (6文件)
│   ├── type-theory/
│   │   └── formal-type-system.ts
│   ├── js-implementations/
│   │   ├── singleton-js.ts
│   │   ├── factory-js.ts
│   │   └── observer-js.ts
│   ├── interoperability/
│   │   └── js-ts-interop.ts
│   └── index.ts
│
├── 📁 11-benchmarks/                 # 性能测试 (2文件)
│   ├── js-vs-ts-performance.ts
│   └── index.ts
│
├── 📁 shared/                        # 共享模块 (4文件)
│   ├── types/
│   └── utils/
│
├── 📁 tests/                         # 测试套件 (8文件)
│   ├── unit/
│   └── index.ts
│
├── 📁 playground/                    # 游乐场
│   └── quick-start/
│
├── 📄 index.ts                       # 主入口
├── 📄 run-demos.ts                   # Demo运行脚本
├── 📄 package.json                   # 项目配置
├── 📄 tsconfig.json                  # TS配置
├── 📄 vitest.config.ts               # 测试配置
└── 📄 PROJECT_STATUS.md              # 项目状态
```

## 统计信息

- **总文件数**: 124
- **TypeScript文件**: 114
- **模块数**: 14
- **Demo函数**: 76个
- **测试文件**: 14个
