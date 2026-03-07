# JSTS Code Lab - 代码结构说明

## 📁 项目结构

```
jsts-code-lab/
├── 📁 00-language-core/           # 语言核心 (16文件)
│   ├── 01-types/                  # 类型系统
│   │   ├── primitives.ts          # 原始类型
│   │   └── generics.ts            # 泛型系统
│   ├── 02-variables/              # 变量系统
│   │   └── declarations.ts        # var/let/const
│   ├── 03-control-flow/           # 控制流
│   │   ├── conditionals.ts        # 条件语句
│   │   └── loops.ts               # 循环
│   ├── 04-functions/              # 函数
│   │   ├── arrow-functions.ts     # 箭头函数
│   │   └── this-binding.ts        # this绑定
│   ├── 05-objects-classes/        # 对象与类
│   │   ├── classes-es6.ts         # ES6 Class
│   │   └── prototypes.ts          # 原型链
│   ├── 06-modules/                # 模块系统
│   │   ├── esm-basics/            # ESM基础
│   │   └── dynamic-import/        # 动态导入
│   └── 07-metaprogramming/        # 元编程
│       └── proxies.ts             # Proxy代理
│
├── 📁 01-ecmascript-evolution/    # ES演进 (11文件)
│   ├── es2020/                    # ES2020 特性
│   │   ├── bigint.ts
│   │   ├── promise-allsettled.ts
│   │   ├── optional-chaining.ts
│   │   └── nullish-coalescing.ts
│   ├── es2021/                    # ES2021 特性
│   │   └── promise-any.ts
│   ├── es2022/                    # ES2022 特性
│   │   ├── class-fields.ts
│   │   ├── at-method.ts
│   │   └── error-cause.ts
│   ├── es2023/                    # ES2023 特性
│   │   └── array-methods.ts
│   └── es2024/                    # ES2024 特性
│       ├── groupby.ts
│       └── promise-withresolvers.ts
│
├── 📁 02-design-patterns/         # 设计模式 (13文件)
│   ├── creational/                # 创建型模式
│   │   ├── singleton.ts
│   │   ├── factory.ts
│   │   ├── builder.ts
│   │   ├── prototype.ts
│   │   └── abstract-factory.ts
│   ├── structural/                # 结构型模式
│   │   ├── adapter.ts
│   │   ├── decorator.ts
│   │   ├── composite.ts
│   │   └── facade.ts
│   └── behavioral/                # 行为型模式
│       ├── observer.ts
│       ├── strategy.ts
│       ├── command.ts
│       └── state.ts
│
├── 📁 03-concurrency/             # 并发编程 (4文件)
│   ├── event-loop/
│   │   └── event-loop-demo.ts
│   ├── promises/
│   │   ├── promise-implementation.ts
│   │   └── promise-patterns.ts
│   └── async-await/
│       └── async-patterns.ts
│
├── 📁 04-data-structures/         # 数据结构 (6文件)
│   ├── built-in/
│   │   └── map-set.ts
│   └── custom/
│       ├── linked-list.ts
│       ├── stack-queue.ts
│       ├── tree-traversal.ts
│       ├── graph.ts
│       └── heap.ts
│
├── 📁 05-algorithms/              # 算法 (5文件)
│   ├── sorting/
│   │   ├── quick-sort.ts
│   │   └── merge-sort.ts
│   ├── searching/
│   │   └── binary-search.ts
│   ├── recursion/
│   │   └── fibonacci.ts
│   └── dynamic-programming/
│       └── fibonacci-dp.ts
│
├── 📁 06-architecture-patterns/   # 架构模式 (1文件)
│   └── layered/
│       └── index.ts
│
├── 📁 07-testing/                 # 测试 (1文件)
│   └── unit-test-patterns.ts
│
├── 📁 08-performance/             # 性能 (1文件)
│   └── optimization-patterns.ts
│
├── 📁 09-real-world-examples/     # 实战案例 (4文件)
│   ├── api-client/
│   │   └── index.ts
│   ├── cli-tools/
│   │   └── command-parser.ts
│   ├── web-server/
│   │   └── basic-server.ts
│   └── data-processing/
│       └── pipeline.ts
│
├── 📁 shared/                     # 共享模块 (4文件)
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── index.ts
│   │   └── validation.ts
│   └── index.ts
│
├── 📁 tests/                      # 测试套件 (6文件)
│   ├── unit/
│   │   ├── primitives.test.ts
│   │   ├── optional-chaining.test.ts
│   │   ├── nullish-coalescing.test.ts
│   │   ├── stack-queue.test.ts
│   │   ├── heap.test.ts
│   │   └── design-patterns.test.ts
│   ├── integration/
│   └── e2e/
│
└── 📁 playground/                 # 演练场
    └── quick-start/
        └── index.ts
```

## 📊 统计

- **总文件数**: 83
- **TypeScript**: 75
  - 源码: 69
  - 测试: 6
- **配置**: 8

## 🏷️ 文件命名规范

- **源码文件**: `kebab-case.ts`
- **测试文件**: `kebab-case.test.ts`
- **目录**: `kebab-case`

## 📝 代码头部注释规范

每个文件应包含以下元数据注释：

```typescript
/**
 * @file 文件名
 * @category 分类路径
 * @see 关联的理论文档路径
 * @difficulty warm | easy | medium | hard | extreme
 * @tags 标签1, 标签2
 * @description 简要描述
 */
```
