# JavaScript/TypeScript 全景知识库 - 完整文档索引

> **版本**: v1.0.0 | **最后更新**: 2026-04-08 | **维护状态**: 活跃维护

---

## 文档全景图

本知识库包含三大核心组成部分：

1. **awesome-jsts-ecosystem** - 生态工具导航
2. **jsts-code-lab** - 代码实验室 (90个技术模块)
3. **docs/** - 分类文档与学习路径

---

## 1. 语言核心 (Language Core)

### 1.1 类型系统

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 语言核心模块 | ./jsts-code-lab/00-language-core/ | TypeScript 类型系统完整实现 | 2星 |
| JS/TS 对比分析 | ./jsts-code-lab/10-js-ts-comparison/ | JavaScript 与 TypeScript 深度对比 | 2星 |
| 元编程 | ./jsts-code-lab/78-metaprogramming/ | 装饰器、反射、代理模式 | 4星 |

### 1.2 ECMAScript 演进

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| ECMAScript 演进史 | ./jsts-code-lab/01-ecmascript-evolution/ | ES6+ 新特性代码实现 | 2星 |
| 执行流分析 | ./jsts-code-lab/14-execution-flow/ | 事件循环、调用栈、执行上下文 | 3星 |

### 1.3 数据结构

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 数据结构实现 | ./jsts-code-lab/04-data-structures/ | 链表、树、图、哈希表等 | 3星 |
| 算法实现 | ./jsts-code-lab/05-algorithms/ | 排序、搜索、动态规划等 | 3星 |

---

## 2. 运行时 (Runtime)

### 2.1 浏览器运行时

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 浏览器运行时理论 | ./jsts-code-lab/50-browser-runtime/THEORY.md | V8引擎、渲染管线、内存管理 | 3星 |
| Web 渲染优化 | ./jsts-code-lab/52-web-rendering/ | 重绘、回流、合成优化 | 3星 |
| 前端框架对比 | ./docs/categories/01-frontend-frameworks.md | React/Vue/Angular/Svelte 对比 | 2星 |

### 2.2 并发模型

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 并发架构文档 | ./jsts-code-lab/03-concurrency/ARCHITECTURE.md | 事件循环、内存模型、并发控制 | 3星 |
| 异步模式实现 | ./jsts-code-lab/03-concurrency/ | Promise、Async/Await、Worker | 3星 |
| 数据流管理 | ./jsts-code-lab/15-data-flow/ | RxJS、Observable、响应式编程 | 3星 |

### 2.3 工具链

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 构建工具对比 | ./docs/categories/03-build-tools.md | Vite/Webpack/esbuild/Rollup | 2星 |
| 代码规范工具 | ./docs/categories/14-linting-formatting.md | ESLint/Prettier/Biome | 1星 |
| 包管理 | ./jsts-code-lab/12-package-management/ | npm/yarn/pnpm/bun | 2星 |

---

## 3. 架构 (Architecture)

### 3.1 设计模式

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 设计模式理论 | ./jsts-code-lab/02-design-patterns/THEORY.md | GoF 23种设计模式 + SOLID 原则 | 3星 |
| 设计模式实现 | ./jsts-code-lab/02-design-patterns/ | TypeScript 实现可运行代码 | 3星 |

### 3.2 架构模式

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 架构模式分析 | ./jsts-code-lab/06-architecture-patterns/ARCHITECTURE.md | 分层、六边形、CQRS、事件溯源 | 4星 |
| 架构模式实现 | ./jsts-code-lab/06-architecture-patterns/ | 企业级架构代码示例 | 4星 |
| 微服务 | ./jsts-code-lab/25-microservices/ | 服务拆分、通信、治理 | 5星 |

### 3.3 分布式系统

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 分布式系统理论 | ./jsts-code-lab/70-distributed-systems/THEORY.md | CAP定理、一致性模型、分区容错 | 5星 |
| 分布式系统实现 | ./jsts-code-lab/70-distributed-systems/ | 分布式ID、锁、事务 | 5星 |
| 共识算法 | ./jsts-code-lab/71-consensus-algorithms/ | Paxos、Raft、PBFT | 5星 |
| 容器编排 | ./jsts-code-lab/72-container-orchestration/ | Docker、Kubernetes | 4星 |

---

## 4. 工程实践 (Engineering Practices)

### 4.1 测试

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 测试基础 | ./jsts-code-lab/07-testing/ | 单元测试、集成测试、TDD | 2星 |
| 高级测试 | ./jsts-code-lab/28-testing-advanced/ | E2E、契约测试、混沌测试 | 3星 |
| AI测试理论 | ./jsts-code-lab/55-ai-testing/THEORY.md | AI驱动测试生成理论 | 4星 |
| 测试工具对比 | ./docs/categories/12-testing.md | Jest/Vitest/Playwright | 2星 |
| 测试对比矩阵 | ./docs/comparison-matrices/testing-compare.md | 测试框架详细对比 | 2星 |

### 4.2 安全

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| API安全 | ./jsts-code-lab/21-api-security/ | OAuth2、JWT、CSRF、XSS防护 | 3星 |
| Web安全 | ./jsts-code-lab/38-web-security/ | CSP、CORS、内容安全策略 | 3星 |
| 网络安全 | ./jsts-code-lab/81-cybersecurity/ | 渗透测试、安全审计 | 4星 |

### 4.3 性能

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 性能优化 | ./jsts-code-lab/08-performance/ | 算法优化、内存管理、懒加载 | 3星 |
| 智能性能 | ./jsts-code-lab/54-intelligent-performance/ | AI驱动性能优化 | 4星 |
| 性能监控 | ./jsts-code-lab/39-performance-monitoring/ | RUM、APM、性能指标 | 3星 |
| 基准测试 | ./jsts-code-lab/11-benchmarks/ | 性能测试方法与工具 | 3星 |

### 4.4 部署与运维

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| DevOps | ./jsts-code-lab/22-deployment-devops/ | CI/CD、GitOps、蓝绿部署 | 3星 |
| 可观测性 | ./jsts-code-lab/74-observability/ | 日志、指标、链路追踪 | 3星 |
| 混沌工程 | ./jsts-code-lab/75-chaos-engineering/ | 故障注入、韧性测试 | 4星 |
| Serverless | ./jsts-code-lab/31-serverless/ | FaaS、BaaS、冷启动优化 | 3星 |

---

## 5. 前沿技术 (Emerging Technologies)

### 5.1 AI 与机器学习

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| AI集成 | ./jsts-code-lab/33-ai-integration/ | LLM API集成、Prompt工程 | 3星 |
| ML工程 | ./jsts-code-lab/76-ml-engineering/ | TensorFlow.js、模型部署 | 4星 |
| 代码生成 | ./jsts-code-lab/56-code-generation/ | AI辅助编程、代码补全 | 3星 |
| 边缘AI | ./jsts-code-lab/82-edge-ai/ | 端侧推理、模型压缩 | 4星 |
| NLP工程 | ./jsts-code-lab/85-nlp-engineering/ | 自然语言处理应用 | 4星 |

### 5.2 边缘计算

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 边缘计算 | ./jsts-code-lab/32-edge-computing/ | CDN Workers、边缘函数 | 3星 |

### 5.3 WebAssembly

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| WebAssembly | ./jsts-code-lab/36-web-assembly/ | WASM集成、性能优化 | 4星 |
| WebAssembly生态 | ./docs/categories/20-webassembly.md | WASM工具与框架 | 3星 |

### 5.4 Web3 与区块链

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| Web3基础 | ./jsts-code-lab/34-blockchain-web3/ | 智能合约、DApp开发 | 4星 |
| 区块链高级 | ./jsts-code-lab/83-blockchain-advanced/ | 共识机制、跨链协议 | 5星 |

### 5.5 量子计算

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 量子计算 | ./jsts-code-lab/77-quantum-computing/ | 量子算法、Q#集成 | 5星 |

---

## 6. 形式化理论 (Formal Theory)

### 6.1 形式化验证

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 形式化验证 | ./jsts-code-lab/80-formal-verification/ | TLA+、模型检测、定理证明 | 5星 |

### 6.2 编译器设计

| 文档 | 路径 | 描述 | 复杂度 |
|------|------|------|--------|
| 编译器设计 | ./jsts-code-lab/79-compiler-design/ | AST、解析器、代码生成 | 5星 |

---

## 7. 生态工具导航 (Ecosystem Navigation)

### 7.1 前端生态

| 文档 | 路径 | 描述 |
|------|------|------|
| 前端框架 | ./docs/categories/01-frontend-frameworks.md | React/Vue/Angular/Svelte等 |
| UI组件库 | ./docs/categories/02-ui-component-libraries.md | Material-UI/Ant Design/shadcn/ui等 |
| 状态管理 | ./docs/categories/05-state-management.md | Redux/Zustand/Pinia等 |
| 路由 | ./docs/categories/06-routing.md | React Router/TanStack Router等 |
| 样式方案 | ./docs/categories/10-styling.md | Tailwind/Styled Components等 |
| 动画 | ./docs/categories/16-animation.md | Framer Motion/GSAP等 |

### 7.2 后端生态

| 文档 | 路径 | 描述 |
|------|------|------|
| 后端框架 | ./docs/categories/14-backend-frameworks.md | Express/NestJS/Fastify等 |
| ORM与数据库 | ./docs/categories/11-orm-database.md | Prisma/TypeORM/Drizzle等 |
| 表单处理 | ./docs/categories/07-form-handling.md | React Hook Form/Formik等 |
| 验证库 | ./docs/categories/08-validation.md | Zod/Yup/Joi等 |

### 7.3 对比矩阵

| 文档 | 路径 | 描述 |
|------|------|------|
| 构建工具对比 | ./docs/comparison-matrices/build-tools-compare.md | Vite/Webpack/esbuild对比表 |
| ORM对比 | ./docs/comparison-matrices/orm-compare.md | ORM选型决策矩阵 |
| 状态管理对比 | ./docs/comparison-matrices/state-management-compare.md | 状态管理方案对比 |
| UI库对比 | ./docs/comparison-matrices/ui-libraries-compare.md | UI组件库对比 |

---

## 8. 学习路径推荐

### 路径一：初学者入门 (4-6周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | TypeScript基础 | ./docs/learning-paths/beginners-path.md | 1-2周 |
|   | 语言核心 | ./jsts-code-lab/00-language-core/ |      |
| 2 | 设计模式 | ./jsts-code-lab/02-design-patterns/THEORY.md | 1-2周 |
| 3 | 测试基础 | ./jsts-code-lab/07-testing/ | 1周 |
| 4 | 前端框架 | ./docs/categories/01-frontend-frameworks.md | 1周 |

### 路径二：进阶工程师 (6-8周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | 架构模式 | ./docs/learning-paths/intermediate-path.md | 2周 |
|   | 架构实现 | ./jsts-code-lab/06-architecture-patterns/ | |
| 2 | 并发编程 | ./jsts-code-lab/03-concurrency/ARCHITECTURE.md | 2周 |
| 3 | 性能优化 | ./jsts-code-lab/08-performance/ | 1周 |
| 4 | 后端开发 | ./jsts-code-lab/19-backend-development/ | 2周 |
| 5 | 微服务 | ./jsts-code-lab/25-microservices/ | 1周 |

### 路径三：架构师之路 (8-12周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | 分布式系统 | ./docs/learning-paths/advanced-path.md | 3周 |
|   | 理论 | ./jsts-code-lab/70-distributed-systems/THEORY.md | |
| 2 | 一致性算法 | ./jsts-code-lab/71-consensus-algorithms/ | 2周 |
| 3 | 容器编排 | ./jsts-code-lab/72-container-orchestration/ | 2周 |
| 4 | 形式化验证 | ./jsts-code-lab/80-formal-verification/ | 2周 |
| 5 | AI集成 | ./jsts-code-lab/33-ai-integration/ | 2周 |

### 路径四：AI 专家 (6-10周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | AI集成基础 | ./jsts-code-lab/33-ai-integration/ | 2周 |
| 2 | ML工程 | ./jsts-code-lab/76-ml-engineering/ | 2周 |
| 3 | 智能性能优化 | ./jsts-code-lab/54-intelligent-performance/ | 2周 |
| 4 | AI测试 | ./jsts-code-lab/55-ai-testing/ | 2周 |
| 5 | 边缘AI | ./jsts-code-lab/82-edge-ai/ | 2周 |

### 路径五：安全专家 (6-8周)

| 阶段 | 模块 | 文档 | 时间 |
|------|------|------|------|
| 1 | Web安全基础 | ./jsts-code-lab/38-web-security/ | 2周 |
| 2 | API安全 | ./jsts-code-lab/21-api-security/ | 2周 |
| 3 | 网络安全 | ./jsts-code-lab/81-cybersecurity/ | 2周 |
| 4 | 形式化验证 | ./jsts-code-lab/80-formal-verification/ | 2周 |

---

## 9. 快速查找表

### 9.1 按技术领域查找

| 领域 | 核心文档 | 生态文档 |
|------|----------|----------|
| 前端开发 | ./jsts-code-lab/18-frontend-frameworks/ | ./docs/categories/01-frontend-frameworks.md |
| 后端开发 | ./jsts-code-lab/19-backend-development/ | ./docs/categories/14-backend-frameworks.md |
| DevOps | ./jsts-code-lab/22-deployment-devops/ | ./docs/categories/03-build-tools.md |
| 数据可视化 | ./jsts-code-lab/58-data-visualization/ | ./docs/categories/04-data-visualization.md |

### 9.2 按问题类型查找

| 问题类型 | 解决方案文档 |
|----------|--------------|
| 如何选型前端框架？ | ./docs/decision-trees.md |
| 如何设计API？ | ./jsts-code-lab/19-backend-development/ |
| 如何优化性能？ | ./jsts-code-lab/08-performance/ |
| 如何保障安全？ | ./jsts-code-lab/38-web-security/ |
| 如何设计分布式系统？ | ./jsts-code-lab/70-distributed-systems/THEORY.md |
| 如何学习TypeScript？ | ./docs/learning-paths/beginners-path.md |
| 如何进阶架构师？ | ./docs/learning-paths/advanced-path.md |
| 如何选型ORM？ | ./docs/comparison-matrices/orm-compare.md |
| 如何选型构建工具？ | ./docs/comparison-matrices/build-tools-compare.md |
| 如何选型测试框架？ | ./docs/comparison-matrices/testing-compare.md |

### 9.3 按复杂度分级

**1-2星 (入门级)**
- ./docs/categories/14-linting-formatting.md - 代码规范工具
- ./jsts-code-lab/00-language-core/ - TypeScript基础
- ./jsts-code-lab/07-testing/ - 测试基础
- ./docs/learning-paths/beginners-path.md - 初学者路径

**3星 (中级)**
- ./jsts-code-lab/02-design-patterns/ - 设计模式
- ./jsts-code-lab/03-concurrency/ - 并发编程
- ./jsts-code-lab/18-frontend-frameworks/ - 前端框架
- ./docs/learning-paths/intermediate-path.md - 进阶路径

**4星 (高级)**
- ./jsts-code-lab/06-architecture-patterns/ - 架构模式
- ./jsts-code-lab/25-microservices/ - 微服务
- ./jsts-code-lab/33-ai-integration/ - AI集成

**5星 (专家级)**
- ./jsts-code-lab/70-distributed-systems/THEORY.md - 分布式系统理论
- ./jsts-code-lab/71-consensus-algorithms/ - 共识算法
- ./jsts-code-lab/80-formal-verification/ - 形式化验证
- ./jsts-code-lab/77-quantum-computing/ - 量子计算

---

## 10. 文档统计

### 10.1 数量统计

| 类别 | 数量 | 占比 |
|------|------|------|
| jsts-code-lab 模块 | 90 | 51% |
| docs/categories 分类 | 20 | 11% |
| docs/comparison-matrices 对比 | 5 | 3% |
| docs/learning-paths 路径 | 3 | 2% |
| 根目录及辅助文档 | 58 | 33% |
| **总计** | **176** | **100%** |

### 10.2 代码实验室模块分布

| 层级 | 模块编号 | 数量 |
|------|----------|------|
| 核心层 (00-19) | 00-17 | 18 |
| 基础层 (20-49) | 20-37 | 18 |
| 智能层 (50-69) | 50-69 | 20 |
| 系统层 (70-89) | 70-89 | 20 |
| 其他 | - | 14 |
| **小计** | | **90** |

### 10.3 理论文档清单

| 模块 | 理论文档 | 类型 |
|------|----------|------|
| 02-design-patterns | THEORY.md | 设计原则 |
| 03-concurrency | ARCHITECTURE.md | 并发架构 |
| 06-architecture-patterns | ARCHITECTURE.md | 系统架构 |
| 50-browser-runtime | THEORY.md | 浏览器原理 |
| 55-ai-testing | THEORY.md | AI测试理论 |
| 70-distributed-systems | THEORY.md | 分布式理论 |

---

## 11. 更新日志

### v1.0.0 (2026-04-08)

- 初始版本发布
- 建立完整的文档索引体系
- 定义五条学习路径
- 创建快速查找表

### 计划更新

- 添加更多 Mermaid 图表
- 完善文档覆盖率统计
- 增加交互式导航

---

## 12. 贡献指南

### 12.1 如何贡献文档

1. **Fork 仓库** - 创建您的仓库副本
2. **创建分支** - git checkout -b add/new-documentation
3. **遵循规范** - 参考 ./jsts-code-lab/DOCUMENTATION_GUIDE.md
4. **提交 PR** - 详细说明添加的内容和原因

### 12.2 文档规范

- 所有文档使用 Markdown 格式
- 代码示例需可运行
- 理论文档需有论证过程
- 英文术语首次出现需附中文翻译

### 12.3 相关链接

- [项目贡献指南](./CONTRIBUTING.md)
- [代码实验室贡献指南](./jsts-code-lab/CONTRIBUTING.md)
- [文档编写规范](./jsts-code-lab/DOCUMENTATION_GUIDE.md)
- [术语表](./GLOSSARY.md)

---

## 附录：完整文件树

```
JavaScriptTypeScript/
├── README.md                          # 项目总览入口
├── README-EN.md                       # 英文版README
├── COMPLETE_DOCUMENTATION_INDEX.md   # 本文档
├── GLOSSARY.md                        # 术语表
├── CONTRIBUTING.md                    # 贡献指南
├── LICENSE                            # 许可证
├── SECURITY.md                        # 安全政策
│
├── awesome-jsts-ecosystem/            # 生态工具导航
│   ├── README.md
│   ├── CONTRIBUTING.md
│   └── docs/
│       ├── guides/
│       ├── comparison-tables/
│       └── translations/
│
├── docs/                              # 分类文档与对比
│   ├── categories/                    # 20个分类文档
│   │   ├── 01-frontend-frameworks.md
│   │   ├── 02-ui-component-libraries.md
│   │   ├── 03-build-tools.md
│   │   └── ... (共20个)
│   ├── comparison-matrices/           # 5个对比矩阵
│   │   ├── build-tools-compare.md
│   │   ├── orm-compare.md
│   │   └── ... (共5个)
│   ├── learning-paths/                # 3条学习路径
│   │   ├── beginners-path.md
│   │   ├── intermediate-path.md
│   │   └── advanced-path.md
│   ├── research/                      # 研究报告
│   └── templates/                     # 文档模板
│
├── jsts-code-lab/                     # 代码实验室 (90模块)
│   ├── README.md
│   ├── ARCHITECTURE_GUIDE.md          # 架构指南
│   ├── CROSS-REFERENCE.md             # 模块交叉引用
│   ├── DOCUMENTATION_GUIDE.md         # 文档规范
│   ├── CODE_STRUCTURE.md              # 代码结构
│   ├── PROJECT_STATUS.md              # 项目状态
│   └── [00-89]-*/                     # 90个技术模块
│       ├── THEORY.md / ARCHITECTURE.md
│       └── *.ts (实现代码)
│
└── website/                           # 项目网站
```

---

> **维护者**: JavaScript/TypeScript 全景知识库团队  
> **最后更新**: 2026-04-08  
> **版本**: v1.0.0
