# JavaScript TypeScript 代码实验室

> 从理论到实践的完整代码示例库，80+ 模块，305+ TypeScript 文件

[![Modules](https://img.shields.io/badge/Modules-80-blue)](./)
[![Files](https://img.shields.io/badge/Files-305+-green)](./)
[![Patterns](https://img.shields.io/badge/Patterns-23%20GoF-orange)](./)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

---

## 📖 项目简介

本项目是 JavaScript/TypeScript 生态系统的**完整技术实现**，包含：

- **🎓 理论基础**：每个模块配有详细的设计原理和架构论证
- **💻 可运行代码**：305+ TypeScript 文件，全部可独立运行
- **📊 性能分析**：算法复杂度、内存占用、执行效率的理论与实测
- **🏗️ 架构设计**：从设计模式到分布式系统的完整架构实践

---

## 📚 文档导航

### 架构与设计文档

| 文档 | 内容 | 推荐读者 |
|------|------|----------|
| [ARCHITECTURE_GUIDE.md](./ARCHITECTURE_GUIDE.md) | 项目整体架构设计 | 架构师、技术负责人 |
| [DOCUMENTATION_GUIDE.md](./DOCUMENTATION_GUIDE.md) | 文档编写规范 | 贡献者 |
| [CODE_STRUCTURE.md](./CODE_STRUCTURE.md) | 代码结构说明 | 新加入开发者 |

### 模块理论文档

#### 核心基础

- [设计模式理论](./02-design-patterns/THEORY.md) - GoF 模式的理论基础、SOLID 原则形式化论证
- [并发编程架构](./03-concurrency/ARCHITECTURE.md) - 事件循环、内存模型、并发控制理论
- [架构模式解析](./06-architecture-patterns/ARCHITECTURE.md) - 分层、六边形、CQRS、事件溯源

#### 运行时与性能

- [浏览器运行时理论](./50-browser-runtime/THEORY.md) - 渲染管线、V8 引擎、性能优化

---

## 🎯 为什么需要这些文档？

### 代码与理论的关系

```
┌─────────────────────────────────────────────────────────────┐
│                        理论层                                │
│  • 设计原则的形式化定义        • 算法的复杂度分析              │
│  • 架构决策的权衡论证          • 并发模型的数学基础            │
└──────────────────────┬──────────────────────────────────────┘
                       │ 指导
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        设计层                                │
│  • 模块接口设计               • 数据结构选择                  │
│  • 控制流设计                 • 错误处理策略                  │
└──────────────────────┬──────────────────────────────────────┘
                       │ 实现
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        代码层                                │
│  • TypeScript 实现            • 单元测试                      │
│  • 性能优化                   • Demo 示例                     │
└─────────────────────────────────────────────────────────────┘
```

### 示例：单例模式的完整论证

**理论问题**：为什么单例是一种"反模式"？

**形式化论证**：

```
单例 S 的性质：
∀t ∈ Time, Count(Instance) = 1
∀x, y, Accessible(x, S) ∧ Accessible(y, S) → x = y

问题：
1. 违反了单一职责原则（管理实例 + 业务逻辑）
2. 引入了全局状态，破坏了可测试性
3. 在并发环境下需要同步，性能下降

适用条件：
使用单例当且仅当：
1. 资源限制（如数据库连接池）
2. 状态不需要在不同上下文中变化
3. 实例化成本 > 同步开销
```

**代码实现**：

```typescript
// 见 02-design-patterns/creational/singleton.ts
// 包含线程安全、延迟加载、双重检查锁定等完整实现
```

---

## 🛠️ 技术栈

| 工具 | 版本 | 用途 |
|------|------|------|
| Node.js | 22+ | 运行时 |
| TypeScript | 5.8+ | 类型系统 |
| pnpm | 10+ | 包管理 |
| Vitest | 3+ | 测试框架 |
| ESLint | 9+ | 代码检查 |
| Prettier | 3+ | 代码格式化 |

---

## 🚀 快速开始

```bash
# 1. 进入项目目录
cd jsts-code-lab

# 2. 安装依赖
pnpm install

# 3. 运行指定模块的 Demo
pnpm tsx run-demos.ts design-patterns
pnpm tsx run-demos.ts consensus-algorithms
pnpm tsx run-demos.ts quantum-computing

# 4. 运行测试
pnpm test

# 5. 运行测试并查看覆盖率
pnpm test:coverage

# 6. 运行基准测试
pnpm benchmark
```

---

## 📊 项目统计

- **模块数**: 80 个
- **TypeScript 文件**: 305+
- **设计模式**: 23 种 GoF 模式完整实现
- **架构模式**: 6 种企业级架构
- **可运行 Demo**: 110+

---

## 📖 模块分类

| 类别 | 模块范围 | 核心内容 |
|------|----------|----------|
| 语言核心 | 00-09 | 类型系统、设计模式、并发、数据结构、算法 |
| 生态工具 | 10-19 | JS/TS 对比、性能测试、包管理、代码组织 |
| 工程实践 | 20-29 | 数据库 ORM、API 安全、DevOps、微服务 |
| 前沿技术 | 30-39 | AI、Web3、WebAssembly、PWA |
| 智能系统 | 50-59 | AI 驱动 UI、智能渲染、代码生成 |
| 企业架构 | 60-69 | API 网关、消息队列、多租户、插件系统 |
| 分布式 | 70-79 | 一致性算法、容器编排、量子计算、编译器 |
| 高级专题 | 80-89 | 形式化验证、网络安全、自动化系统 |

---

## 🔬 理论与实践的结合

### 并发编程示例

**理论问题**：为什么 JavaScript 使用事件循环而非多线程？

**完整论证**：

```
事件循环的数学模型：
EventLoop = (TaskQueues, MicrotaskQueue, EventSource)

关键性质：
1. 单线程顺序执行保证了 happens-before 关系的简洁性
2. 非阻塞 I/O 通过回调队列实现并发，而非并行
3. 避免了共享内存的同步问题

形式化证明：
对于任何事件处理序列 e₁, e₂, ..., eₙ，
总存在全序关系 ≤ 使得 eᵢ ≤ eᵢ₊₁

这使得：
- 状态变化可预测
- 竞态条件大幅减少
- 编程心智模型简化
```

**代码验证**：

```typescript
// 见 03-concurrency/async-await/async-patterns.ts
// 展示了 Promise、async/await、事件循环的完整实现
```

---

## 📚 深入学习路径

### 初级开发者

1. 00-language-core - 掌握 TypeScript 类型系统
2. 02-design-patterns - 理解 SOLID 原则和设计模式
3. 07-testing - 学习测试驱动开发

### 中级开发者

1. 06-architecture-patterns - 掌握企业级架构
2. 18-frontend-frameworks - 深入前端框架原理
3. 19-backend-development - 后端开发模式

### 高级开发者

1. 70-distributed-systems - 分布式系统原理
2. 71-consensus-algorithms - 一致性算法
3. 77-quantum-computing - 量子计算基础

---

## 🤝 贡献指南

### 添加新模块

1. 按照 `DOCUMENTATION_GUIDE.md` 编写文档
2. 提供完整的理论说明和架构论证
3. 实现可运行的代码和测试
4. 添加 Demo 函数

### 改进现有模块

1. 补充理论说明
2. 完善架构论证
3. 优化代码实现
4. 增加性能分析

---

## 📄 License

MIT License - 详见 [LICENSE](./LICENSE)

---

**核心理念**：代码是理论的具体化，理论是代码的抽象。两者缺一不可。
