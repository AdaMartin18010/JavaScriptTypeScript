const fs = require('fs');
const path = require('path');

const dirs = [
  "20-code-lab/20.11-rust-toolchain",
  "20-code-lab/20.12-build-free-typescript",
  "20-code-lab/20.13-edge-databases",
  "20-code-lab/20.2-language-patterns",
  "20-code-lab/20.5-frontend-frameworks",
  "20-code-lab/20.7-ai-agent-infra",
  "20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2020",
  "20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2021",
  "20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2022",
  "20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2023",
  "20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2024",
  "20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2025",
  "20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2025-preview",
  "20-code-lab/20.1-fundamentals-lab/ecmascript-evolution/es2026-preview",
  "20-code-lab/20.1-fundamentals-lab/js-ts-comparison/compiler-api",
  "20-code-lab/20.1-fundamentals-lab/js-ts-comparison/dual-track-algorithms",
  "20-code-lab/20.1-fundamentals-lab/js-ts-comparison/interoperability",
  "20-code-lab/20.1-fundamentals-lab/js-ts-comparison/js-implementations",
  "20-code-lab/20.1-fundamentals-lab/js-ts-comparison/pattern-migration",
  "20-code-lab/20.1-fundamentals-lab/js-ts-comparison/semantic-models",
  "20-code-lab/20.1-fundamentals-lab/js-ts-comparison/syntax-mapping",
  "20-code-lab/20.1-fundamentals-lab/js-ts-comparison/type-theory",
  "20-code-lab/20.1-fundamentals-lab/language-core/01-types",
  "20-code-lab/20.1-fundamentals-lab/language-core/02-variables",
  "20-code-lab/20.1-fundamentals-lab/language-core/03-control-flow",
  "20-code-lab/20.1-fundamentals-lab/language-core/04-functions",
  "20-code-lab/20.1-fundamentals-lab/language-core/05-objects-classes",
  "20-code-lab/20.1-fundamentals-lab/language-core/06-modules",
  "20-code-lab/20.1-fundamentals-lab/language-core/07-metaprogramming",
  "20-code-lab/20.1-fundamentals-lab/language-core/06-modules/dynamic-import",
  "20-code-lab/20.1-fundamentals-lab/language-core/06-modules/esm-basics",
  "20-code-lab/20.1-fundamentals-lab/language-core/06-modules/dynamic-import/config",
  "20-code-lab/20.1-fundamentals-lab/real-world-examples/api-client",
  "20-code-lab/20.1-fundamentals-lab/real-world-examples/auth-system",
  "20-code-lab/20.1-fundamentals-lab/real-world-examples/cli-tools",
  "20-code-lab/20.1-fundamentals-lab/real-world-examples/data-processing",
  "20-code-lab/20.1-fundamentals-lab/real-world-examples/event-bus",
  "20-code-lab/20.1-fundamentals-lab/real-world-examples/state-management",
  "20-code-lab/20.1-fundamentals-lab/real-world-examples/validation",
  "20-code-lab/20.1-fundamentals-lab/real-world-examples/web-server",
  "20-code-lab/20.1-fundamentals-lab/web-apis-lab/web-platform-apis",
  "20-code-lab/20.1-fundamentals-lab/web-assembly/wasm-component-model",
  "20-code-lab/20.10-formal-verification/formal-semantics/00-operational-semantics",
  "20-code-lab/20.10-formal-verification/formal-semantics/02-axiomatic-semantics",
  "20-code-lab/20.10-formal-verification/type-theory-formal/00-lambda-calculus",
  "20-code-lab/20.10-formal-verification/type-theory-formal/01-type-inference",
  "20-code-lab/20.10-formal-verification/type-theory-formal/02-subtyping",
  "20-code-lab/20.10-formal-verification/type-theory-formal/03-mini-typescript",
  "20-code-lab/20.11-rust-toolchain/toolchain-configuration/rust-toolchain-migration",
  "20-code-lab/20.2-language-patterns/architecture-patterns/cqrs",
  "20-code-lab/20.2-language-patterns/architecture-patterns/hexagonal",
  "20-code-lab/20.2-language-patterns/architecture-patterns/layered",
  "20-code-lab/20.2-language-patterns/architecture-patterns/microservices",
  "20-code-lab/20.2-language-patterns/architecture-patterns/mvc",
  "20-code-lab/20.2-language-patterns/architecture-patterns/mvvm",
  "20-code-lab/20.2-language-patterns/design-patterns/behavioral",
  "20-code-lab/20.2-language-patterns/design-patterns/creational",
  "20-code-lab/20.2-language-patterns/design-patterns/js-ts-specific",
  "20-code-lab/20.2-language-patterns/design-patterns/structural",
  "20-code-lab/20.3-concurrency-async/concurrency/async-await",
  "20-code-lab/20.3-concurrency-async/concurrency/atomics",
  "20-code-lab/20.3-concurrency-async/concurrency/event-loop",
  "20-code-lab/20.3-concurrency-async/concurrency/promises",
  "20-code-lab/20.3-concurrency-async/concurrency/streaming",
  "20-code-lab/20.3-concurrency-async/concurrency/workers",
  "20-code-lab/20.4-data-algorithms/algorithms/dynamic-programming",
  "20-code-lab/20.4-data-algorithms/algorithms/graph",
  "20-code-lab/20.4-data-algorithms/algorithms/recursion",
  "20-code-lab/20.4-data-algorithms/algorithms/searching",
  "20-code-lab/20.4-data-algorithms/algorithms/sorting",
  "20-code-lab/20.4-data-algorithms/data-structures/built-in",
  "20-code-lab/20.4-data-algorithms/data-structures/custom",
  "20-code-lab/20.4-data-algorithms/data-structures/functional",
  "20-code-lab/20.5-frontend-frameworks/signals-patterns",
  "20-code-lab/20.5-frontend-frameworks/frontend-frameworks/signals-patterns",
  "20-code-lab/20.7-ai-agent-infra/a2a-protocol",
  "20-code-lab/20.7-ai-agent-infra/agent-patterns",
  "20-code-lab/20.7-ai-agent-infra/mcp-protocol",
  "20-code-lab/20.7-ai-agent-infra/code-generation/ai-assisted-workflow",
  "20-code-lab/20.8-edge-serverless/edge-computing/edge-first-patterns",
  "20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/01-basic-setup",
  "20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/02-server-functions",
  "20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/03-auth",
  "20-code-lab/20.8-edge-serverless/tanstack-start-cloudflare/04-performance",
];

function getTopic(dirPath) {
  const parts = dirPath.split(/[\\/]/);
  const last = parts[parts.length - 1];
  const map = {
    'es2020': 'ES2020 新特性',
    'es2021': 'ES2021 新特性',
    'es2022': 'ES2022 新特性',
    'es2023': 'ES2023 新特性',
    'es2024': 'ES2024 新特性',
    'es2025': 'ES2025 新特性',
    'es2025-preview': 'ES2025 预览特性',
    'es2026-preview': 'ES2026 预览特性',
    'compiler-api': 'TypeScript 编译器 API',
    'dual-track-algorithms': 'JS/TS 双轨算法',
    'interoperability': 'JS 与 TS 互操作性',
    'js-implementations': 'JS 引擎实现差异',
    'pattern-migration': '模式迁移策略',
    'semantic-models': '语义模型对比',
    'syntax-mapping': '语法映射关系',
    'type-theory': '类型理论基础',
    '01-types': '类型系统',
    '02-variables': '变量系统',
    '03-control-flow': '控制流',
    '04-functions': '函数',
    '05-objects-classes': '对象与类',
    '06-modules': '模块系统',
    '07-metaprogramming': '元编程',
    'dynamic-import': '动态导入',
    'esm-basics': 'ESM 基础',
    'config': '配置模块',
    'api-client': 'API 客户端',
    'auth-system': '认证系统',
    'cli-tools': 'CLI 工具',
    'data-processing': '数据处理',
    'event-bus': '事件总线',
    'state-management': '状态管理',
    'validation': '数据验证',
    'web-server': 'Web 服务器',
    'web-platform-apis': 'Web 平台 API',
    'wasm-component-model': 'WASM 组件模型',
    '00-operational-semantics': '操作语义学',
    '02-axiomatic-semantics': '公理语义学',
    '00-lambda-calculus': 'Lambda 演算',
    '01-type-inference': '类型推断',
    '02-subtyping': '子类型关系',
    '03-mini-typescript': 'Mini TypeScript',
    'rust-toolchain-migration': 'Rust 工具链迁移',
    'cqrs': 'CQRS 模式',
    'hexagonal': '六边形架构',
    'layered': '分层架构',
    'microservices': '微服务架构',
    'mvc': 'MVC 模式',
    'mvvm': 'MVVM 模式',
    'behavioral': '行为型设计模式',
    'creational': '创建型设计模式',
    'js-ts-specific': 'JS/TS 特定模式',
    'structural': '结构型设计模式',
    'async-await': 'Async/Await',
    'atomics': '原子操作',
    'event-loop': '事件循环',
    'promises': 'Promise',
    'streaming': '流式处理',
    'workers': 'Web Workers',
    'dynamic-programming': '动态规划',
    'graph': '图算法',
    'recursion': '递归算法',
    'searching': '搜索算法',
    'sorting': '排序算法',
    'built-in': '内置数据结构',
    'custom': '自定义数据结构',
    'functional': '函数式数据结构',
    'signals-patterns': 'Signals 模式',
    'a2a-protocol': 'A2A 协议',
    'agent-patterns': 'Agent 模式',
    'mcp-protocol': 'MCP 协议',
    'ai-assisted-workflow': 'AI 辅助工作流',
    'edge-first-patterns': '边缘优先模式',
    '01-basic-setup': '基础设置',
    '02-server-functions': '服务端函数',
    '03-auth': '认证集成',
    '04-performance': '性能优化',
    '20.11-rust-toolchain': 'Rust 工具链',
    '20.12-build-free-typescript': '免构建 TypeScript',
    '20.13-edge-databases': '边缘数据库',
    '20.2-language-patterns': '语言模式',
    '20.5-frontend-frameworks': '前端框架',
    '20.7-ai-agent-infra': 'AI Agent 基础设施',
  };
  return map[last] || last.replace(/-/g, ' ');
}

function getProblemDomain(topic, dirPath) {
  const pd = {
    'ecmascript-evolution': '本模块聚焦 ECMAScript 标准演进中的新特性，解决 JavaScript 语言能力持续扩展带来的学习曲线与兼容性问题。通过形式化示例展示语法特性在实际代码中的应用方式。',
    'compiler-api': '本模块探索 TypeScript 编译器 API 的能力边界，解决程序化地操作 AST、类型检查和代码生成的问题。通过编译器 API 可以实现自定义代码转换、lint 工具和文档生成。',
    'interoperability': '本模块解决 JavaScript 与 TypeScript 在混合项目中的无缝协作问题。探讨类型声明、模块解析和运行时行为的一致性策略。',
    'js-implementations': '本模块分析不同 JavaScript 引擎（V8、SpiderMonkey、JavaScriptCore）的实现差异，解决跨平台行为不一致带来的调试与兼容难题。',
    'pattern-migration': '本模块提供从 JavaScript 模式到 TypeScript 模式的系统化迁移路径，解决增量类型化过程中的架构重构问题。',
    'semantic-models': '本模块对比 JavaScript 动态语义与 TypeScript 静态语义的模型差异，解决理解两种语言层面如何映射同一运行时行为的问题。',
    'syntax-mapping': '本模块建立 JS 与 TS 语法元素之间的映射关系，解决学习者在两种语法体系间转换的认知负担问题。',
    'type-theory': '本模块从类型理论视角审视 TypeScript 的类型系统，解决理解结构性类型、协变逆变等深层概念的理论基础问题。',
    '01-types': '本模块聚焦 JavaScript 的类型系统与 TypeScript 的静态类型扩展，解决动态类型带来的运行时错误与可维护性挑战。通过类型注解和推断提升代码可靠性。',
    '02-variables': '本模块探讨变量声明、作用域和闭包机制，解决变量生命周期管理与内存泄漏预防的问题。涵盖 `var`、`let`、`const` 的语义差异与最佳实践。',
    '03-control-flow': '本模块分析控制流结构（条件、循环、异常），解决复杂业务逻辑下的流程清晰性与错误处理问题。通过结构化编程原则提升代码可读性。',
    '04-functions': '本模块深入研究函数作为一等公民的特性，解决高阶函数、柯里化和函数组合在实际开发中的应用问题。涵盖箭头函数、生成器和异步函数。',
    '05-objects-classes': '本模块对比对象原型链与类语法，解决面向对象设计在 JS/TS 中的表达力与继承复杂度问题。探讨组合优于继承的实践策略。',
    '06-modules': '本模块解决 JavaScript 模块化演进中的代码组织问题。从 IIFE、CommonJS 到 ESM，分析不同模块系统的加载语义与静态分析能力。',
    'dynamic-import': '本模块解决运行时按需加载模块的性能优化问题。通过动态导入实现代码分割、懒加载和条件加载，减少初始包体积。',
    'esm-basics': '本模块解决 ES 模块系统的基础理解问题。涵盖静态导入导出、循环依赖处理和模块命名空间对象的核心语义。',
    '07-metaprogramming': '本模块探索代理、反射和装饰器等元编程技术，解决在运行时拦截和修改对象行为的高级抽象问题。',
    'api-client': '本模块解决 HTTP API 客户端的设计与实现问题。涵盖请求拦截、错误重试、取消机制和类型安全的响应处理。',
    'auth-system': '本模块解决认证系统的常见实现问题。包括 JWT 管理、会话持久化、权限校验和安全最佳实践。',
    'cli-tools': '本模块解决命令行工具的开发问题。涵盖参数解析、交互式提示、进度显示和跨平台兼容性。',
    'data-processing': '本模块解决大规模数据转换与清洗的效率问题。通过流式处理、批处理和函数式管道提升数据处理性能。',
    'event-bus': '本模块解决组件间解耦通信的问题。通过发布订阅模式实现松耦合架构，支持同步与异步事件传播。',
    'state-management': '本模块解决复杂应用状态的一致性与可预测性问题。涵盖单向数据流、不可变更新和状态持久化策略。',
    'validation': '本模块解决输入数据的有效性校验问题。通过模式匹配、运行时类型检查与错误聚合提升数据质量。',
    'web-server': '本模块解决 HTTP 服务器的构建问题。涵盖路由、中间件、错误处理和并发请求管理。',
    'web-platform-apis': '本模块解决 Web 平台原生 API 的高效使用问题。涵盖 DOM、Fetch、Storage、Service Worker 等核心接口。',
    'wasm-component-model': '本模块解决 WebAssembly 组件模型的集成问题。探讨 WASM 与 JS 的边界交互、内存管理和性能优化。',
    'formal-semantics': '本模块从形式语义学角度精确描述程序执行行为，解决自然语言规范中的歧义理解问题。通过操作语义规则定义求值关系。',
    'operational-semantics': '本模块从形式语义学角度精确描述程序执行行为，解决自然语言规范中的歧义理解问题。通过操作语义规则定义求值关系。',
    'axiomatic-semantics': '本模块使用霍尔逻辑和前后置条件形式化验证程序正确性，解决关键代码路径的逻辑保证问题。',
    'lambda-calculus': '本模块通过 Lambda 演算建立函数式编程的理论基础，解决理解高阶函数与计算模型的数学根基问题。',
    'type-inference': '本模块探讨 Hindley-Milner 类型推断算法，解决如何在无显式类型注解的情况下推导最一般类型的理论问题。',
    'subtyping': '本模块分析子类型关系的公理化定义，解决类型层次结构中安全替换原则的数学基础问题。',
    'mini-typescript': '本模块通过构建精简版 TypeScript 类型检查器，解决理解实际编译器类型系统的实现机制问题。',
    'rust-toolchain': '本模块解决 Rust 工具链在 JavaScript 生态系统中的集成问题。涵盖 napi-rs、WASM 绑定和构建流程优化。',
    'rust-toolchain-migration': '本模块解决 Rust 工具链在 JavaScript 生态系统中的集成问题。涵盖 napi-rs、WASM 绑定和构建流程优化。',
    'cqrs': '本模块解决读写负载分离的架构问题。通过命令查询职责分离提升高并发场景下的系统吞吐量与数据一致性。',
    'hexagonal': '本模块解决业务逻辑与外部依赖耦合的问题。通过端口与适配器模式实现可测试、可替换的整洁架构。',
    'layered': '本模块解决关注点分离的经典架构问题。通过分层设计将表现层、业务层和数据层解耦，提升可维护性。',
    'microservices': '本模块解决单体应用扩展性受限的问题。通过服务拆分、独立部署和分布式通信实现水平扩展。',
    'mvc': '本模块解决用户界面与业务逻辑混杂的问题。通过模型-视图-控制器分离职责，提升代码的组织性与可测试性。',
    'mvvm': '本模块解决视图与模型直接耦合的问题。通过视图模型层实现数据绑定与命令模式，简化 UI 状态同步。',
    'behavioral': '本模块解决对象间通信与职责分配的问题。通过观察者、策略、命令等行为模式提升系统的灵活性与可扩展性。',
    'creational': '本模块解决对象创建过程的复杂性问题。通过工厂、建造者、单例等模式封装实例化逻辑，提升创建过程的可控性。',
    'js-ts-specific': '本模块解决 JavaScript 与 TypeScript 生态中特有的设计问题。涵盖模块模式、混入、branded types 等语言特定的惯用法。',
    'structural': '本模块解决类与对象的组合问题。通过适配器、装饰器、代理等结构模式在不改变原有接口的情况下扩展功能。',
    'async-await': '本模块解决异步代码可读性的问题。通过 async/await 语法糖将基于 Promise 的异步流程转换为同步风格的代码结构。',
    'atomics': '本模块解决多线程共享内存的并发安全问题。通过原子操作和内存顺序保证无锁数据结构的正确性。',
    'event-loop': '本模块解决 JavaScript 单线程并发模型的理解问题。深入分析宏任务、微任务和渲染周期的调度机制。',
    'promises': '本模块解决回调地狱与错误处理困难的问题。通过 Promise 链式调用和组合子实现异步流程的声明式管理。',
    'streaming': '本模块解决大数据量处理的内存效率问题。通过流式接口实现渐进式读取、转换和输出，降低内存峰值。',
    'workers': '本模块解决主线程阻塞导致的 UI 卡顿问题。通过 Web Workers 和 Worker Threads 将计算密集型任务 offload 到后台线程。',
    'dynamic-programming': '本模块解决重叠子问题与最优子结构的高效求解问题。通过记忆化和表格法将指数级复杂度降为多项式级。',
    'graph': '本模块解决图结构数据的遍历与路径查找问题。涵盖 DFS、BFS、最短路径和最小生成树等经典算法。',
    'recursion': '本模块解决自相似问题的优雅表达问题。通过递归与尾递归优化将复杂问题分解为可复用的子问题。',
    'searching': '本模块解决有序与无序数据集的高效查找问题。涵盖线性搜索、二分搜索和哈希查找的时间空间权衡。',
    'sorting': '本模块解决数据排序的效率与稳定性问题。对比冒泡、快速、归并和堆排序在不同场景下的适用性。',
    'built-in': '本模块解决内置数据结构的高效使用问题。深入分析 Array、Map、Set、WeakMap 的底层实现与复杂度特征。',
    'custom': '本模块解决特定场景下内置结构不满足需求的问题。通过自定义链表、树、哈希表等实现精细化控制。',
    'functional': '本模块解决不可变数据与函数式编程范式下的结构需求问题。通过持久化数据结构实现高效的空间共享。',
    'frontend-frameworks': '本模块解决现代前端框架的核心机制理解问题。涵盖响应式系统、虚拟 DOM 和组件化架构的设计原理。',
    'signals-patterns': '本模块解决细粒度响应式更新的问题。通过 Signals 模式实现精确的依赖追踪与最小化重渲染。',
    'a2a-protocol': '本模块解决 AI Agent 间互操作的标准化通信问题。通过 A2A 协议实现跨平台、跨厂商的 Agent 协作。',
    'agent-patterns': '本模块解决 AI Agent 系统的设计模式问题。涵盖 ReAct、Plan-and-Solve、多 Agent 协作等架构模式。',
    'mcp-protocol': '本模块解决 AI 模型与外部工具/数据源的标准化连接问题。通过 MCP 协议实现上下文感知的能力扩展。',
    'ai-assisted-workflow': '本模块解决 AI 辅助开发流程的集成问题。涵盖代码生成、审查自动化和智能重构的工作流设计。',
    'edge-databases': '本模块解决边缘计算场景下的数据持久化问题。探讨 SQLite、D1 等轻量级数据库在边缘环境的部署策略。',
    'build-free-typescript': '本模块解决 TypeScript 编译步骤带来的开发体验问题。通过原生 TS 运行时和类型剥离实现零构建开发。',
    'edge-first-patterns': '本模块解决边缘计算架构的设计模式问题。通过边缘优先策略降低延迟、提升可用性并优化带宽。',
    'tanstack-start-cloudflare': '本模块解决 TanStack Start 在 Cloudflare 边缘平台的部署问题。涵盖 SSR、服务端函数和边缘缓存的集成。',
  };
  for (const key in pd) {
    if (dirPath.includes(key)) return pd[key];
  }
  return `本模块解决 ${topic} 领域的核心理论与实践映射问题。通过代码示例和形式化分析建立从概念到实现的认知桥梁。`;
}

function getConcepts(topic, dirPath) {
  const cm = {
    'ecmascript-evolution': `| 特性 | 定义 | 关联 |
|------|------|------|
| 新语法 | ECMAScript 年度新增的语法构造 | 示例代码 |
| polyfill | 旧环境兼容性补充方案 | shim 文件 |`,
    'compiler-api': `| 概念 | 定义 | 关联 |
|------|------|------|
| AST | 抽象语法树，源代码的结构化表示 | parser.ts |
| TypeChecker | 类型检查与推断引擎 | checker.ts |
| Emitter | 代码生成与输出模块 | emitter.ts |`,
    'interoperability': `| 概念 | 定义 | 关联 |
|------|------|------|
| .d.ts | JS 库的类型声明文件 | types/ |
| JSDoc 类型 | 通过注释嵌入类型信息 | src/*.js |
| 渐进类型化 | 逐步为 JS 项目添加类型约束 | migration/ |`,
    'js-implementations': `| 概念 | 定义 | 关联 |
|------|------|------|
| V8 | Google 的高性能 JS 引擎 | benchmarks/ |
| JIT 编译 | 运行时字节码到机器码的优化 | engine-diff.md |`,
    'pattern-migration': `| 概念 | 定义 | 关联 |
|------|------|------|
| 鸭子类型 | 基于结构而非名义的类型匹配 | before/ |
| 类型守卫 | 运行时 Narrowing 联合类型 | after/ |`,
    'semantic-models': `| 概念 | 定义 | 关联 |
|------|------|------|
| 动态语义 | 运行时的求值规则与效果 | runtime/ |
| 静态语义 | 编译期的类型约束与检查 | static/ |`,
    'syntax-mapping': `| 概念 | 定义 | 关联 |
|------|------|------|
| 类型注解 | TS 对变量/函数附加的类型信息 | mapping.md |
| 类型擦除 | 编译后 TS 类型被移除的机制 | examples/ |`,
    'type-theory': `| 概念 | 定义 | 关联 |
|------|------|------|
| 结构类型 | 基于成员而非声明的类型等价 | structural.ts |
| 类型变型 | 协变、逆变与不变的参数化规则 | variance.ts |`,
    '01-types': `| 概念 | 定义 | 关联 |
|------|------|------|
| 原始类型 | string/number/boolean/null/undefined/symbol/bigint | primitives.ts |
| 对象类型 | 引用类型的结构与接口定义 | object-types.ts |
| 联合类型 | 多个可能类型的析取组合 | union-types.ts |`,
    '02-variables': `| 概念 | 定义 | 关联 |
|------|------|------|
| 作用域链 | 变量解析的层级查找机制 | scope-chain.ts |
| TDZ | 暂时性死区，let/const 的访问限制 | temporal-dead-zone.ts |
| 闭包 | 函数与其词法环境的组合 | closures.ts |`,
    '03-control-flow': `| 概念 | 定义 | 关联 |
|------|------|------|
| 短路求值 | && / || 的条件执行语义 | short-circuit.ts |
| 异常传播 | Error 的冒泡与捕获链 | error-handling.ts |`,
    '04-functions': `| 概念 | 定义 | 关联 |
|------|------|------|
| 一等函数 | 函数作为值传递与返回 | first-class.ts |
| 闭包 | 词法作用域的持久化引用 | closures.ts |
| 生成器 | 可暂停/恢复的迭代器函数 | generators.ts |`,
    '05-objects-classes': `| 概念 | 定义 | 关联 |
|------|------|------|
| 原型链 | 对象属性继承的查找机制 | prototype-chain.ts |
| 类字段 | ES2022 类实例属性的声明语法 | class-fields.ts |`,
    '06-modules': `| 概念 | 定义 | 关联 |
|------|------|------|
| 静态分析 | 编译期确定模块依赖图 | static-analysis.md |
| 命名空间导入 | 整体模块作为单一对象导入 | namespace-import.ts |`,
    'dynamic-import': `| 概念 | 定义 | 关联 |
|------|------|------|
| 代码分割 | 运行时按需加载的代码块 | split-chunks/ |
| 顶层 await | 模块级别的异步等待 | top-level-await.ts |`,
    'esm-basics': `| 概念 | 定义 | 关联 |
|------|------|------|
| 静态导入 | 编译期解析的依赖声明 | import-export.ts |
| 循环依赖 | 模块间相互引用的处理策略 | circular/ |`,
    '07-metaprogramming': `| 概念 | 定义 | 关联 |
|------|------|------|
| Proxy | 拦截对象基本操作的代理器 | proxy-examples.ts |
| Reflect | 提供可拦截操作的默认行为 | reflect-api.ts |
| 装饰器 | 类与成员的注解式元编程 | decorators.ts |`,
    'api-client': `| 概念 | 定义 | 关联 |
|------|------|------|
| 拦截器 | 请求/响应的统一处理管道 | interceptors.ts |
| 取消令牌 | 终止进行中请求的机制 | cancel-token.ts |`,
    'auth-system': `| 概念 | 定义 | 关联 |
|------|------|------|
| JWT | 基于签名的无状态令牌 | jwt-utils.ts |
| Refresh Token | 长期有效的访问令牌续期凭证 | auth-flow.ts |`,
    'cli-tools': `| 概念 | 定义 | 关联 |
|------|------|------|
| 参数解析 | 命令行输入的结构化提取 | arg-parser.ts |
| 进程退出码 | 向 shell 报告执行状态的约定 | exit-codes.ts |`,
    'data-processing': `| 概念 | 定义 | 关联 |
|------|------|------|
| 管道操作 | 数据变换的链式组合 | pipeline.ts |
| 懒求值 | 按需计算以避免中间集合 | lazy-eval.ts |`,
    'event-bus': `| 概念 | 定义 | 关联 |
|------|------|------|
| 发布订阅 | 解耦的消息广播模式 | pub-sub.ts |
| 事件通道 | 带类型约束的命名空间事件 | typed-channels.ts |`,
    'state-management': `| 概念 | 定义 | 关联 |
|------|------|------|
| 不可变更新 | 状态变更始终返回新引用 | immutable-update.ts |
| 选择器 | 从全局状态派生局部视图的函数 | selectors.ts |`,
    'validation': `| 概念 | 定义 | 关联 |
|------|------|------|
| 模式匹配 | 数据结构与校验规则的对应 | schema.ts |
| 错误聚合 | 多字段校验结果的统一收集 | error-aggregator.ts |`,
    'web-server': `| 概念 | 定义 | 关联 |
|------|------|------|
| 中间件 | 请求处理管道的可插拔组件 | middleware.ts |
| 路由 | URL 到处理函数的映射机制 | router.ts |`,
    'web-platform-apis': `| 概念 | 定义 | 关联 |
|------|------|------|
| Fetch API | 现代化的 HTTP 请求接口 | fetch-examples.ts |
| IntersectionObserver | 元素可见性的异步监听 | observer-api.ts |`,
    'wasm-component-model': `| 概念 | 定义 | 关联 |
|------|------|------|
| WIT | WebAssembly 接口类型定义 | interfaces/ |
| 线性内存 | WASM 与 JS 共享的连续字节缓冲区 | memory-utils.ts |`,
    'formal-semantics': `| 概念 | 定义 | 关联 |
|------|------|------|
| 小步语义 | 逐步化简的求值规则 | small-step.md |
| 大步语义 | 直接到结果的关系推导 | big-step.md |`,
    'operational-semantics': `| 概念 | 定义 | 关联 |
|------|------|------|
| 小步语义 | 逐步化简的求值规则 | small-step.md |
| 大步语义 | 直接到结果的关系推导 | big-step.md |`,
    'axiomatic-semantics': `| 概念 | 定义 | 关联 |
|------|------|------|
| 霍尔三元组 | {P} C {Q} 的前后置条件断言 | hoare-logic.md |
| 最弱前置条件 | 保证后置条件的最宽松前置条件 | wp-calculus.ts |`,
    'lambda-calculus': `| 概念 | 定义 | 关联 |
|------|------|------|
| β-归约 | 函数应用的替换规则 | beta-reduction.ts |
| 柯里化 | 多参数函数的单一参数化变换 | currying.ts |`,
    'type-inference': `| 概念 | 定义 | 关联 |
|------|------|------|
| 统一算法 | 类型方程组的替换求解 | unification.ts |
| let-多态 | 泛型绑定的最一般类型推广 | let-polymorphism.ts |`,
    'subtyping': `| 概念 | 定义 | 关联 |
|------|------|------|
| 宽度子类型 | 基于字段超集的子类型关系 | width-subtyping.ts |
| 深度子类型 | 嵌套类型的递归子类型规则 | depth-subtyping.ts |`,
    'mini-typescript': `| 概念 | 定义 | 关联 |
|------|------|------|
| 类型环境 | 变量到类型的映射上下文 | type-env.ts |
| 约束求解 | 类型变量到具体类型的实例化 | solver.ts |`,
    'rust-toolchain': `| 概念 | 定义 | 关联 |
|------|------|------|
| napi-rs | Rust 与 Node.js 的 FFI 绑定框架 | napi-examples/ |
| cargo-cp-artifact | 构建产物的自动复制工具 | build.rs |`,
    'rust-toolchain-migration': `| 概念 | 定义 | 关联 |
|------|------|------|
| napi-rs | Rust 与 Node.js 的 FFI 绑定框架 | napi-examples/ |
| cargo-cp-artifact | 构建产物的自动复制工具 | build.rs |`,
    'cqrs': `| 概念 | 定义 | 关联 |
|------|------|------|
| 命令端 | 负责状态变更的写模型 | commands/ |
| 查询端 | 针对读优化的投影模型 | queries/ |`,
    'hexagonal': `| 概念 | 定义 | 关联 |
|------|------|------|
| 端口 | 定义外部交互的抽象接口 | ports/ |
| 适配器 | 端口的具体技术实现 | adapters/ |`,
    'layered': `| 概念 | 定义 | 关联 |
|------|------|------|
| 依赖规则 | 上层依赖下层，禁止反向引用 | layer-rules.md |
| 领域层 | 包含核心业务逻辑与规则 | domain/ |`,
    'microservices': `| 概念 | 定义 | 关联 |
|------|------|------|
| 服务边界 | 限界上下文定义的业务边界 | boundaries.md |
| 熔断器 | 防止级联故障的保护机制 | circuit-breaker.ts |`,
    'mvc': `| 概念 | 定义 | 关联 |
|------|------|------|
| 控制器 | 接收输入并调度模型与视图 | controllers/ |
| 模型 | 封装业务数据与验证规则 | models/ |`,
    'mvvm': `| 概念 | 定义 | 关联 |
|------|------|------|
| 视图模型 | 视图的抽象状态与命令集合 | view-models/ |
| 数据绑定 | 视图与视图模型的自动同步 | binding-engine.ts |`,
    'behavioral': `| 概念 | 定义 | 关联 |
|------|------|------|
| 观察者模式 | 状态变化时的订阅通知机制 | observer.ts |
| 策略模式 | 可互换算法的封装族 | strategy.ts |`,
    'creational': `| 概念 | 定义 | 关联 |
|------|------|------|
| 工厂方法 | 将实例化延迟到子类 | factory.ts |
| 建造者 | 分步骤构造复杂对象 | builder.ts |`,
    'js-ts-specific': `| 概念 | 定义 | 关联 |
|------|------|------|
| 模块模式 | IIFE 封装私有作用域 | module-pattern.ts |
| Branded Type | 名义类型的模拟实现 | branded-types.ts |`,
    'structural': `| 概念 | 定义 | 关联 |
|------|------|------|
| 适配器 | 接口不兼容类的转换包装 | adapter.ts |
| 装饰器 | 动态附加额外职责 | decorator.ts |`,
    'async-await': `| 概念 | 定义 | 关联 |
|------|------|------|
| 语法糖 | Promise 的同步风格封装 | async-await.ts |
| 错误传播 | try/catch 对 reject 的捕获 | error-handling.ts |`,
    'atomics': `| 概念 | 定义 | 关联 |
|------|------|------|
| SharedArrayBuffer | 多线程共享的线性内存 | shared-memory.ts |
| 内存顺序 | 操作可见性的同步保证 | ordering.ts |`,
    'event-loop': `| 概念 | 定义 | 关联 |
|------|------|------|
| 宏任务 | setTimeout、I/O 等事件回调 | macrotasks.ts |
| 微任务 | Promise.then、queueMicrotask | microtasks.ts |`,
    'promises': `| 概念 | 定义 | 关联 |
|------|------|------|
| 链式调用 | then/catch 的顺序组合 | chaining.ts |
| Promise.all | 并发执行的同步点 | concurrency.ts |`,
    'streaming': `| 概念 | 定义 | 关联 |
|------|------|------|
| 背压 | 生产与消费速率不匹配的处理 | backpressure.ts |
| 转换流 | 数据在管道中的映射处理 | transform-stream.ts |`,
    'workers': `| 概念 | 定义 | 关联 |
|------|------|------|
| Dedicated Worker | 页面独占的后台线程 | dedicated-worker.ts |
| Transferable | 零拷贝的所有权转移对象 | transferable.ts |`,
    'dynamic-programming': `| 概念 | 定义 | 关联 |
|------|------|------|
| 记忆化 | 子问题结果的缓存复用 | memoization.ts |
| 状态转移 | 子问题解的递推关系式 | state-transition.ts |`,
    'graph': `| 概念 | 定义 | 关联 |
|------|------|------|
| 邻接表 | 空间高效的图存储结构 | adjacency-list.ts |
| 拓扑排序 | 有向无环图的线性化排序 | topological-sort.ts |`,
    'recursion': `| 概念 | 定义 | 关联 |
|------|------|------|
| 基例 | 递归终止的条件分支 | base-cases.ts |
| 尾递归 | 可优化的线性递归形式 | tail-recursion.ts |`,
    'searching': `| 概念 | 定义 | 关联 |
|------|------|------|
| 二分搜索 | 有序数据的 O(log n) 查找 | binary-search.ts |
| 哈希查找 | 均摊 O(1) 的键值定位 | hash-lookup.ts |`,
    'sorting': `| 概念 | 定义 | 关联 |
|------|------|------|
| 快速排序 | 分治 pivot 的平均 O(n log n) | quicksort.ts |
| 稳定性 | 相等元素原始顺序的保持 | stable-sort.ts |`,
    'built-in': `| 概念 | 定义 | 关联 |
|------|------|------|
| 时间复杂度 | 操作耗费的渐近增长量级 | complexity.md |
| Map vs Object | 键类型与迭代顺序的差异 | map-vs-object.ts |`,
    'custom': `| 概念 | 定义 | 关联 |
|------|------|------|
| 链表 | 节点引用的线性结构 | linked-list.ts |
| 哈希表 | 散列函数与冲突解决策略 | hash-table.ts |`,
    'functional': `| 概念 | 定义 | 关联 |
|------|------|------|
| 持久化 | 不可变更新下的结构共享 | persistent-tree.ts |
| 惰性求值 | 延迟到必要时的表达式计算 | lazy-list.ts |`,
    'frontend-frameworks': `| 概念 | 定义 | 关联 |
|------|------|------|
| 响应式系统 | 依赖追踪与自动更新 | reactivity.ts |
| 虚拟 DOM | 内存中的 UI 表示层 | vdom.ts |`,
    'signals-patterns': `| 概念 | 定义 | 关联 |
|------|------|------|
| Signal | 携带值与订阅者的响应式原语 | signal.ts |
| 细粒度更新 | 仅变更依赖组件的局部重渲染 | fine-grained.ts |`,
    'a2a-protocol': `| 概念 | 定义 | 关联 |
|------|------|------|
| Agent Card | 描述 Agent 能力与端点的元数据 | agent-card.json |
| Task | 跨 Agent 请求的工作单元 | task-protocol.ts |`,
    'agent-patterns': `| 概念 | 定义 | 关联 |
|------|------|------|
| ReAct | 推理与行动交替的循环模式 | react-pattern.ts |
| 工具调用 | LLM 与外部函数的接口约定 | tool-calling.ts |`,
    'mcp-protocol': `| 概念 | 定义 | 关联 |
|------|------|------|
| Server | 向模型暴露工具与资源的后端 | mcp-server.ts |
| Context | 模型调用的附加上下文信息 | context-provider.ts |`,
    'ai-assisted-workflow': `| 概念 | 定义 | 关联 |
|------|------|------|
| 提示工程 | 引导模型输出的输入结构化技巧 | prompts/ |
| 代码审查 | 自动化质量与安全问题检测 | review-bot.ts |`,
    'edge-databases': `| 概念 | 定义 | 关联 |
|------|------|------|
| D1 | Cloudflare 的 SQLite 边缘数据库 | d1-client.ts |
| 本地优先 | 数据先写本地再同步的架构 | local-first.ts |`,
    'build-free-typescript': `| 概念 | 定义 | 关联 |
|------|------|------|
| 类型剥离 | 运行时移除类型注解的处理 | strip-types.ts |
| 原生导入 | 直接运行 .ts 文件的模块加载 | ts-loader.mjs |`,
    'edge-first-patterns': `| 概念 | 定义 | 关联 |
|------|------|------|
| 边缘渲染 | 在 CDN 节点执行 SSR 的策略 | edge-ssr.ts |
| 地理路由 | 基于用户位置的最近节点调度 | geo-routing.ts |`,
    'tanstack-start-cloudflare': `| 概念 | 定义 | 关联 |
|------|------|------|
| SSR | 服务端渲染的流式传输 | ssr-streaming.ts |
| API 路由 | 文件系统约定的服务端端点 | api-routes.ts |`,
  };
  for (const key in cm) {
    if (dirPath.includes(key)) return cm[key];
  }
  return `| 概念 | 定义 | 关联 |
|------|------|------|
| 核心概念 | ${topic} 的核心定义与语义 | 示例代码 |
| 实践模式 | 工程化中的典型应用场景 | patterns/ |`;
}

function getWhyExists(topic, dirPath) {
  const we = {
    'ecmascript-evolution': 'ECMAScript 作为活的语言标准，每年发布新特性以回应开发者社区的痛点。从可选链到顶层 await，新特性的存在理由是在保持向后兼容的前提下提升表达能力与开发效率。',
    'compiler-api': 'TypeScript 编译器不仅是一个命令行工具，其内部 API 暴露了整个语言服务的管道。这使得社区能够构建代码生成器、自定义 linter、迁移工具和 IDE 扩展。',
    'interoperability': 'JavaScript 生态拥有海量未类型化的库，TypeScript 必须与这些资产共存。互操作性机制的存在让渐进类型化成为可能，降低了采用 TS 的门槛。',
    'js-implementations': 'ECMAScript 规范存在实现自由度，不同引擎在性能优化、垃圾回收和并发模型上有差异。理解这些差异对于编写跨平台兼容代码至关重要。',
    'pattern-migration': '从 JavaScript 迁移到 TypeScript 不仅是语法转换，更是思维模式的升级。迁移模式的存在帮助团队在不中断业务交付的前提下逐步获得类型系统的收益。',
    'semantic-models': 'JavaScript 的动态类型与 TypeScript 的静态类型描述的是同一运行时实体，但视角不同。语义模型对比帮助开发者理解为什么某些合法 JS 代码在 TS 中报错。',
    'syntax-mapping': 'TS 类型系统建立在 JS 运行时之上，语法映射建立了两者之间的认知桥梁。它帮助开发者理解类型构造如何对应到值空间的行为。',
    'type-theory': 'TypeScript 的设计深受类型理论影响。理解结构类型、子类型和类型推断的理论基础，能帮助开发者预判类型系统的行为并设计更合理的类型架构。',
    '01-types': '类型系统是防止运行时错误的防线。JavaScript 的动态类型提供了灵活性，但也导致大量隐蔽 bug。TypeScript 在保持 JS 语义的同时引入静态类型，实现了灵活性与安全性的平衡。',
    '02-variables': '变量是程序状态的基本单元。理解作用域、提升和闭包机制，是掌握 JavaScript 异步编程和模块化设计的必要前提。',
    '03-control-flow': '程序的本质是控制流的组合。条件、循环和异常处理构成了业务逻辑的骨架，清晰的控制流设计直接影响代码的可读性与可维护性。',
    '04-functions': '函数是 JavaScript 的核心抽象机制。作为一等公民，函数支持高阶组合、惰性求值和闭包，这使得 JS 具备强大的表达力和函数式编程能力。',
    '05-objects-classes': 'JavaScript 基于原型而非类，但 ES6 class 语法提供了更 familiar 的 OOP 体验。对象与类的机制是组织复杂数据和行为的基石。',
    '06-modules': '随着应用规模增长，代码组织成为核心挑战。模块系统将全局命名空间隔离为独立的可复用单元，是大型项目可维护性的基础。',
    'dynamic-import': '初始加载时间直接影响用户体验。动态导入允许应用按需加载功能模块，是实现代码分割和懒加载的关键技术。',
    'esm-basics': 'ESM 是 JavaScript 官方标准化模块系统。相比 CJS，ESM 支持静态分析、tree-shaking 和顶层 await，是现代构建工具和运行时的基础。',
    '07-metaprogramming': '元编程允许代码在运行时检查和修改自身行为。代理和反射机制为框架开发、测试模拟和 API 拦截提供了强大的基础设施。',
    'api-client': '前后端分离架构下，HTTP 客户端是应用与外部世界交互的边界。良好的客户端设计能够统一错误处理、认证注入和请求重试，提升系统健壮性。',
    'auth-system': '安全是应用开发的底线。认证系统验证用户身份并管理权限边界，其设计直接影响数据安全和合规性。',
    'cli-tools': '命令行是开发者最高效的操作界面。CLI 工具通过脚本化、管道化和批量化，显著提升开发、构建和部署流程的自动化水平。',
    'data-processing': '现代应用处理的数据规模持续增长。高效的数据处理流程是 ETL、分析和报表系统的核心，直接影响业务决策的时效性。',
    'event-bus': '随着组件数量增加，直接引用导致紧耦合。事件总线通过间接通信解耦发送者与接收者，是大型应用架构的粘合剂。',
    'state-management': 'UI 是状态的函数。当状态分散在多个组件中时，数据流变得不可预测。集中式状态管理通过单向数据流提升可预测性和可调试性。',
    'validation': '外部输入是应用安全漏洞的主要来源。严格的验证机制在数据进入系统前建立防线，防止非法数据导致的运行时错误和安全风险。',
    'web-server': 'HTTP 是互联网应用的事实标准通信协议。Web 服务器作为请求的入口，负责路由分发、中间件处理和响应组装，是整个后端架构的基石。',
    'web-platform-apis': '浏览器不仅是渲染引擎，更是功能丰富的应用平台。Web Platform APIs 提供了访问设备能力、网络通信和本地存储的标准接口。',
    'wasm-component-model': 'WebAssembly 提供了接近原生的执行性能，但早期版本与宿主环境交互受限。组件模型标准化了跨语言接口，使 WASM 成为真正的可组合模块。',
    'formal-semantics': '自然语言规范容易产生歧义，导致不同实现行为不一致。操作语义通过数学化的规约关系精确定义每一步求值行为。',
    'operational-semantics': '自然语言规范容易产生歧义，导致不同实现行为不一致。操作语义通过数学化的规约关系精确定义每一步求值行为。',
    'axiomatic-semantics': '软件可靠性要求对关键路径进行严格验证。公理语义通过逻辑断言建立程序正确性的数学证明，是高可信系统的理论基础。',
    'lambda-calculus': 'Lambda 演算是可计算性理论的基石。它证明了极少语法构造即可表达全部可计算函数，为函数式语言和类型系统奠定了数学基础。',
    'type-inference': '显式类型注解增加了开发负担。类型推断算法能够在无人工标注的情况下自动推导最一般类型，是现代化静态语言的核心特性。',
    'subtyping': '子类型是多态和代码复用的基础。理解子类型的数学公理有助于设计合理的类型层次，避免 unsafe 的类型转换。',
    'mini-typescript': '真实编译器复杂度高，难以理解全貌。通过构建最小可用的类型检查器，学习者可以掌握类型系统的核心机制而不被工程细节淹没。',
    'rust-toolchain': 'Rust 提供了内存安全和并发安全的保证，同时性能接近 C++。将其引入 JS 生态可以显著提升计算密集型模块的可靠性和性能。',
    'rust-toolchain-migration': 'Rust 提供了内存安全和并发安全的保证，同时性能接近 C++。将其引入 JS 生态可以显著提升计算密集型模块的可靠性和性能。',
    'cqrs': '读写负载的特征截然不同：读操作高频且可缓存，写操作需要事务保证。CQRS 通过分离模型让两端独立优化，是高并发系统的有效架构。',
    'hexagonal': '业务逻辑不应依赖具体技术实现。六边形架构通过端口和适配器将核心业务与框架、数据库和 UI 解耦，提升可测试性和技术迁移能力。',
    'layered': '复杂系统需要清晰的组织原则。分层架构通过水平切割职责，使每一层只依赖下层接口，降低了理解和修改的认知负担。',
    'microservices': '单体应用在团队规模扩大时遇到部署和扩展瓶颈。微服务通过垂直拆分业务边界，实现独立部署、技术异构和弹性伸缩。',
    'mvc': '用户界面与业务逻辑混杂导致代码难以维护和测试。MVC 通过分离模型、视图和控制器，使每一部分可以独立演进和验证。',
    'mvvm': '视图直接操作模型导致状态同步逻辑分散。MVVM 通过视图模型层集中管理 UI 状态，配合数据绑定实现自动同步，简化前端开发。',
    'behavioral': '对象间的通信方式直接影响系统的灵活性和可维护性。行为模式封装了对象协作中的常见方案，使系统更容易扩展新行为而无需修改现有代码。',
    'creational': '对象创建逻辑分散会导致重复和耦合。创建型模式将实例化过程集中管理，使系统独立于对象的创建、组合和表示方式。',
    'js-ts-specific': 'JavaScript 的动态特性和 TypeScript 的类型系统产生了独特的编程模式。这些模式充分利用了语言特性，是在 JS/TS 生态中高效开发的必备知识。',
    'structural': '类库的设计往往无法预见所有使用场景。结构型模式通过组合而非继承来组装对象，在不修改原有代码的情况下扩展功能。',
    'async-await': '回调函数和 Promise 链在处理复杂异步流程时可读性差。async/await 语法将异步代码转换为类似同步的结构，显著降低了认知负担。',
    'atomics': 'SharedArrayBuffer 使多线程共享内存成为可能，但也引入了数据竞争风险。原子操作提供了无锁的并发安全机制，是高性能并发编程的基础。',
    'event-loop': 'JavaScript 单线程模型简化了并发编程，但理解任务调度机制对于避免阻塞和优化性能至关重要。事件循环是异步编程的底层核心。',
    'promises': '回调地狱是 Node.js 早期异步编程的主要痛点。Promise 通过链式调用和组合子统一了异步操作的接口，使错误处理和并发控制更加直观。',
    'streaming': '大数据量处理时一次性加载会导致内存溢出和响应延迟。流式处理将数据切分为小块逐段处理，是高效 I/O 的核心技术。',
    'workers': 'JavaScript 主线程承担 UI 渲染和事件处理，长时间计算会导致界面卡顿。Workers 将任务 offload 到后台线程，保持主线程响应性。',
    'dynamic-programming': '递归解法虽然直观，但对重叠子问题存在大量重复计算。动态规划通过记忆化或表格法消除冗余，将指数级复杂度优化为多项式级。',
    'graph': '现实世界中大量问题可以建模为图结构：社交网络、依赖关系、路径规划。图算法提供了解决这些连通性、最短路径和排序问题的系统化方法。',
    'recursion': '自相似问题用递归表达最为自然。递归将复杂问题分解为规模更小的同构子问题，是分治和回溯算法的核心思想。',
    'searching': '数据查找是最高频的操作之一。理解不同搜索算法的时间空间特征，能在具体场景下做出最优选择。',
    'sorting': '排序是算法基础中的基础。不同排序算法在稳定性、空间复杂度和适应性上有差异，理解这些权衡是算法设计的起点。',
    'built-in': '内置数据结构经过引擎优化，是日常开发的首选。深入理解其底层实现和复杂度特征，能够避免性能陷阱并做出正确选择。',
    'custom': '内置数据结构无法覆盖所有场景。自定义数据结构允许针对特定访问模式优化，是性能调优和算法实现的基础技能。',
    'functional': '不可变数据消除了共享可变状态导致的 bug。函数式数据结构通过持久化和结构共享，在保持不可变的同时控制空间开销。',
    'frontend-frameworks': '现代前端应用复杂度已接近传统桌面应用。框架通过响应式系统、组件化和虚拟 DOM 等机制，为复杂 UI 的开发提供了可扩展的架构。',
    'signals-patterns': '传统虚拟 DOM 的 diff 过程在大量静态内容中存在不必要开销。Signals 通过细粒度依赖追踪实现精确更新，是前端性能优化的新范式。',
    'a2a-protocol': 'AI Agent 生态正在快速增长，但缺乏统一的互操作标准。A2A 协议定义了 Agent 发现、能力协商和任务协作的标准，是开放 Agent 网络的基础。',
    'agent-patterns': 'LLM 的自主能力需要通过结构化的模式来引导。Agent 模式将推理、规划和工具调用组织为可复用的架构，提升 AI 系统的可控性和可靠性。',
    'mcp-protocol': 'LLM 需要与外部世界交互才能解决实际问题。MCP 协议标准化了模型与工具、数据源之间的连接方式，降低了集成成本。',
    'ai-assisted-workflow': 'AI 正在重塑软件开发的全流程。将 AI 能力嵌入代码生成、审查和重构环节，可以显著提升开发效率和代码质量。',
    'edge-databases': '边缘计算要求数据尽可能地靠近用户。轻量级边缘数据库解决了低延迟读写和离线可用性问题，是边缘架构的关键组件。',
    'build-free-typescript': 'TypeScript 的编译步骤增加了开发反馈循环的长度。免构建方案通过运行时类型剥离或原生支持，让 TS 开发像 JS 一样即时。',
    'edge-first-patterns': '传统中心化架构难以满足全球用户的低延迟需求。边缘优先模式将计算和数据推向离用户最近的节点，是新一代 Web 应用的核心架构思想。',
    'tanstack-start-cloudflare': 'TanStack Start 提供了类型安全的路由和数据层，结合 Cloudflare 的边缘计算能力，可以在全球范围提供低延迟的全栈应用体验。',
  };
  for (const key in we) {
    if (dirPath.includes(key)) return we[key];
  }
  return `${topic} 作为软件工程中的重要课题，其存在是为了解决特定领域的复杂度与可维护性挑战。通过建立系统化的理论框架和实践模式，开发者能够更高效地构建可靠的系统。`;
}

function getTradeoffs(topic, dirPath) {
  const to = {
    'ecmascript-evolution': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原生新特性 | 代码简洁、语义清晰 | 需要 polyfill/转译 | 现代浏览器环境 |
| 传统兼容写法 | 全平台支持 | 代码冗长、易出错 | 遗留系统维护 |`,
    'compiler-api': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| ts-morph | 高阶抽象、易用 | 额外依赖体积 | 代码生成工具 |
| 原生 Compiler API | 功能完整、官方维护 | 学习曲线陡峭 | 深度定制编译流程 |`,
    'interoperability': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| .d.ts 声明 | 类型安全、IDE 支持 | 需要额外维护 | 第三方 JS 库 |
| JSDoc 注释 | 无需构建步骤 | 类型表达力有限 | 小型 JS 项目 |`,
    'js-implementations': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 特性检测 | 精准适配当前环境 | 运行时开销 | 功能渐进增强 |
| 用户代理判断 | 简单直接 | 不可靠、易过时 | 统计与降级 |`,
    'pattern-migration': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 全面重写 | 架构最清晰 | 风险高、周期长 | 小型项目 |
| 渐进迁移 | 风险可控 | 过渡期复杂度 | 大型遗留系统 |`,
    'semantic-models': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 形式化验证 | 保证正确性 | 成本高、门槛高 | 安全关键系统 |
| 类型检查 | 低成本发现错误 | 无法覆盖所有情况 | 通用应用开发 |`,
    'syntax-mapping': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 显式类型 | 文档即代码 | 编写开销 | 公共 API |
| 类型推断 | 减少冗余 | 复杂场景难追踪 | 内部实现 |`,
    'type-theory': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 名义类型 | 错误信息明确 | 灵活性差 | Java/C# 风格 |
| 结构类型 | 鸭子类型灵活 | 意外兼容风险 | TypeScript 风格 |`,
    '01-types': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 显式注解 | 意图清晰、文档化 | 编写繁琐 | 公共接口 |
| 类型推断 | 代码简洁 | 复杂逻辑难追踪 | 内部实现 |`,
    '02-variables': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| const 优先 | 防止意外重赋值 | 需要区分可变性 | 绝大多数场景 |
| let 必要时 | 允许合法变更 | 需要更多审查 | 循环与累加 |`,
    '03-control-flow': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 早期返回 | 减少嵌套深度 | 分散退出点 | 验证前置条件 |
| 异常抛出 | 强制处理错误 | 控制流隐式跳转 | 不可恢复错误 |`,
    '04-functions': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 纯函数 | 可测试、可缓存 | 需要额外传参 | 数据转换 |
| 副作用函数 | 直接操作外部 | 难以追踪依赖 | I/O 操作 |`,
    '05-objects-classes': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 类继承 | 代码复用直观 | 紧耦合、脆弱基类 | IS-A 关系明确 |
| 对象组合 | 灵活、低耦合 | 更多样板代码 | 行为组装 |`,
    '06-modules': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| ESM | 静态分析、tree-shaking | 旧环境需适配 | 现代项目 |
| CJS | 生态成熟 | 运行时加载、体积大 | Node.js 历史项目 |`,
    'dynamic-import': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 动态导入 | 减少初始加载 | 增加运行时复杂度 | 大型单页应用 |
| 静态导入 | 编译期确定依赖 | 无法条件加载 | 小型库 |`,
    'esm-basics': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 命名导出 | 明确语义、tree-shaking | 重构时影响大 | 工具库 |
| 默认导出 | 简洁导入 | 自动补全不友好 | 主入口组件 |`,
    '07-metaprogramming': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Proxy | 能力强大、透明拦截 | 性能开销显著 | 调试/监控 |
| 显式方法 | 性能最优 | 侵入性修改 | 高频调用路径 |`,
    'api-client': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 集中封装 | 统一逻辑、易维护 | 灵活性受限 | 企业内部服务 |
| 直接 fetch | 无依赖、标准接口 | 重复样板代码 | 简单请求 |`,
    'auth-system': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| JWT | 无状态、可扩展 | 令牌撤销困难 | 分布式系统 |
| Session | 服务端可控 | 存储与扩展开销 | 单体应用 |`,
    'cli-tools': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 交互式提示 | 用户友好 | 自动化困难 | 初始化向导 |
| 纯参数 | 易于脚本化 | 学习成本高 | CI/CD 工具 |`,
    'data-processing': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 流式处理 | 内存占用低 | 实现复杂 | 大文件处理 |
| 批量处理 | 逻辑简单 | 内存峰值高 | 小数据集 |`,
    'event-bus': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 全局总线 | 简单统一 | 全局状态难追踪 | 小型应用 |
| 作用域总线 | 隔离清晰 | 管理复杂度 | 模块化应用 |`,
    'state-management': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 集中式 | 可预测、易调试 | 规模大了冗长 | 中大型应用 |
| 组件本地 | 简单直接 | 跨组件通信困难 | 局部 UI 状态 |`,
    'validation': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 运行时校验 | 覆盖所有输入 | 运行时开销 | 外部 API 边界 |
| 编译时类型 | 零运行时成本 | 无法验证数据形状 | 内部函数参数 |`,
    'web-server': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 微框架 | 轻量、灵活 | 需自行组装 | 定制化 API |
| 全功能框架 | 开箱即用 | 体积与耦合 | 快速原型 |`,
    'web-platform-apis': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 现代 API | 性能与功能先进 | 兼容性限制 | 渐进增强 |
| 传统兼容 | 全浏览器支持 | 功能受限 | 遗留环境 |`,
    'wasm-component-model': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 组件模型 | 跨语言互操作 | 工具链不成熟 | 多语言协作 |
| 直接绑定 | 简单直接 | 平台锁定 | JS-Rust 专用 |`,
    'formal-semantics': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 小步语义 | 精确控制流 | 推导冗长 | 并发分析 |
| 大步语义 | 简洁直观 | 隐藏中间状态 | 正确性证明 |`,
    'operational-semantics': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 小步语义 | 精确控制流 | 推导冗长 | 并发分析 |
| 大步语义 | 简洁直观 | 隐藏中间状态 | 正确性证明 |`,
    'axiomatic-semantics': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 自动证明 | 高效、无遗漏 | 复杂度限制 | 简单循环 |
| 手工推理 | 可处理复杂逻辑 | 易出错、耗时 | 关键算法 |`,
    'lambda-calculus': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 无类型 LC | 表达力极简 | 无法避免运行时错误 | 理论教学 |
| 简单类型 LC | 保证终止性 | 表达力受限 | 安全子集 |`,
    'type-inference': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 显式标注 | 可读性高 | 冗余、维护负担 | 公共 API |
| 自动推断 | 代码简洁 | 错误信息难定位 | 内部实现 |`,
    'subtyping': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 名义子类型 | 意图明确 | 不够灵活 | 传统 OOP |
| 结构子类型 | 灵活组合 | 可能意外兼容 | TypeScript |`,
    'mini-typescript': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 手写检查器 | 完全可控 | 工程量大 | 学习目的 |
| 复用 ts API | 功能完整 | 学习曲线陡峭 | 生产工具 |`,
    'rust-toolchain': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| napi-rs | 类型安全绑定 | 额外学习成本 | Node.js 原生扩展 |
| WASM 编译 | 跨平台、沙箱安全 | 性能开销与限制 | 浏览器端 |`,
    'rust-toolchain-migration': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| napi-rs | 类型安全绑定 | 额外学习成本 | Node.js 原生扩展 |
| WASM 编译 | 跨平台、沙箱安全 | 性能开销与限制 | 浏览器端 |`,
    'cqrs': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 完全分离 | 读写独立优化 | 最终一致性复杂 | 高并发系统 |
| 共享模型 | 简单一致 | 读写互相拖累 | 中小型应用 |`,
    'hexagonal': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 严格六边形 | 完全解耦、可测试 | 抽象开销 | 长生命周期系统 |
| 宽松分层 | 开发效率高 | 边界易模糊 | 快速迭代项目 |`,
    'layered': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 严格分层 | 依赖清晰 | 跨层调用繁琐 | 企业级应用 |
| 宽松分层 | 灵活高效 | 易退化为大泥球 | 初创项目 |`,
    'microservices': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 微服务 | 独立扩展、技术异构 | 分布式复杂度 | 大型团队 |
| 单体 | 简单一致 | 扩展受限 | 小型团队 |`,
    'mvc': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 经典 MVC | 职责清晰 | 视图与控制器耦合 | 服务端渲染 |
| 前端 MVC | 组件化 | 模型与视图难同步 | 传统 SPA |`,
    'mvvm': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 双向绑定 | 自动同步、少样板 | 调试困难 | 表单密集型 |
| 单向数据流 | 可预测、易调试 | 更多样板代码 | 复杂状态应用 |`,
    'behavioral': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 观察者 | 松耦合通知 | 内存泄漏风险 | 事件系统 |
| 策略 | 算法可替换 | 类数量增加 | 规则引擎 |`,
    'creational': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 工厂方法 | 解耦实例化 | 类层次增加 | 多变种对象 |
| 单例 | 全局唯一 | 测试困难、隐藏依赖 | 配置中心 |`,
    'js-ts-specific': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 模块模式 | 私有作用域 | 内存占用 | 兼容旧环境 |
| 类与接口 | 传统 OOP 熟悉感 | 运行时无类型 | 大型团队协作 |`,
    'structural': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 适配器 | 兼容旧接口 | 增加间接层 | 遗留集成 |
| 装饰器 | 动态扩展 | 调试栈变深 | 中间件 |`,
    'async-await': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| async/await | 可读性强 | 错误堆栈丢失 | 顺序异步 |
| Promise 链 | 组合灵活 | 嵌套地狱 | 复杂并行 |`,
    'atomics': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原子操作 | 无锁高性能 | 编程复杂 | 计数器/标志 |
| 锁机制 | 逻辑简单 | 阻塞、死锁风险 | 复杂临界区 |`,
    'event-loop': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 微任务优先 | 快速响应 Promise | 可能饿死宏任务 | 用户交互 |
| 宏任务节流 | 避免阻塞渲染 | 延迟增加 | 批量更新 |`,
    'promises': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Promise.all | 并发执行 | 单失败全失败 | 独立请求 |
| 串行 await | 错误隔离 | 总时长累加 | 有依赖请求 |`,
    'streaming': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Node Stream | 生态成熟 | API 复杂 | 服务端 |
| Web Stream | 标准统一 | Node 支持较晚 | 跨平台 |`,
    'workers': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Worker | 不阻塞主线程 | 通信开销 | 计算密集型 |
| 主线程 | 无通信成本 | 阻塞 UI | 轻量计算 |`,
    'dynamic-programming': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 自顶向下 | 直观递归思路 | 递归栈开销 | 理解问题 |
| 自底向上 | 无栈溢出、常数优化 | 思维转换 | 性能敏感 |`,
    'graph': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| BFS | 最短路径无权图 | 空间开销大 | 层级遍历 |
| DFS | 空间少、易实现 | 可能非最短 | 连通性检测 |`,
    'recursion': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 递归 | 简洁优雅 | 栈溢出风险 | 树形结构 |
| 迭代 | 安全可控 | 代码冗长 | 线性结构 |`,
    'searching': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 二分搜索 | O(log n) | 需有序数据 | 静态有序集合 |
| 哈希搜索 | O(1) 均摊 | 额外空间 | 频繁查找 |`,
    'sorting': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 快速排序 | 平均最快 | 最坏 O(n²) | 通用场景 |
| 归并排序 | 稳定、O(n log n) | 空间 O(n) | 外部排序 |`,
    'built-in': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Map | 任意键、有序 | 无字面量 | 动态集合 |
| Object | 字面量简洁 | 键限于字符串/Symbol | 固定结构 |`,
    'custom': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 自定义结构 | 完全可控 | 实现与维护成本 | 特殊需求 |
| 内置结构 | 经过优化 | 不够灵活 | 通用场景 |`,
    'functional': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 持久化结构 | 安全共享、时间旅行 | 额外内存引用 | 撤销/重做 |
| 可变结构 | 最小内存、最大性能 | 副作用难追踪 | 性能瓶颈 |`,
    'frontend-frameworks': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 虚拟 DOM | 跨平台、声明式 | 运行时开销 | 复杂动态 UI |
| 原生指令 | 无额外层、性能极致 | 平台绑定 | 静态页面 |`,
    'signals-patterns': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| Signals | 细粒度、低内存 | 心智模型新 | 高性能响应式 |
| 虚拟 DOM diff | 生态成熟 | 粗粒度更新 | 通用应用 |`,
    'a2a-protocol': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| A2A 标准 | 跨厂商互操作 | 生态初期 | 多 Agent 系统 |
| 私有协议 | 完全可控 | 孤岛化 | 封闭生态 |`,
    'agent-patterns': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| ReAct | 推理透明 | 延迟高 | 复杂决策 |
| 直接调用 | 速度快 | 不可解释 | 简单任务 |`,
    'mcp-protocol': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| MCP 标准 | 工具生态共享 | 适配成本 | 通用 LLM 应用 |
| 直接集成 | 简单直接 | 重复开发 | 单一应用 |`,
    'ai-assisted-workflow': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| AI 生成 | 效率提升 | 需人工审查 | 样板代码 |
| 手工编写 | 质量可控 | 耗时 | 核心业务逻辑 |`,
    'edge-databases': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 边缘 SQLite | 轻量、成熟 | 写入扩展受限 | 读多写少 |
| D1 | 托管、Serverless | 供应商锁定 | Cloudflare 生态 |`,
    'build-free-typescript': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 原生 TS | 开发体验流畅 | 运行时类型缺失 | 脚本/工具 |
| 传统编译 | 类型安全完整 | 构建步骤繁琐 | 大型项目 |`,
    'edge-first-patterns': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 边缘渲染 | 低延迟 | 计算受限 | 全球用户 |
| 中心渲染 | 算力充沛 | 网络延迟 | 区域用户 |`,
    'tanstack-start-cloudflare': `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 边缘 SSR | 首屏快、SEO | 函数冷启动 | 内容站点 |
| CSR | 交互丰富 | 首屏慢 | 后台应用 |`,
  };
  for (const key in to) {
    if (dirPath.includes(key)) return to[key];
  }
  return `| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|---------|
| 方案 A | 通用、稳健 | 可能非最优 | 大多数场景 |
| 方案 B | 针对性强 | 适用范围窄 | 特定需求 |`;
}

function getComparison(topic, dirPath) {
  const cp = {
    'ecmascript-evolution': '与 Babel 转译方案对比：原生支持减少运行时开销，但需要更长的兼容性等待期。',
    'compiler-api': '与 Babel AST 工具对比：TS Compiler API 提供类型信息，Babel 专注语法转换。',
    'interoperability': '与纯 TS 项目对比：互操作降低了迁移门槛，但增加了类型维护成本。',
    'js-implementations': '引擎差异主要体现在日期解析、正则性能和内存管理上。',
    'pattern-migration': '与重写对比：渐进迁移风险低，但过渡期架构复杂度增加。',
    'semantic-models': '静态语义是动态语义的近似，无法捕捉所有运行时行为。',
    'syntax-mapping': 'TS 类型构造与 JS 值空间存在一对多和多对一的映射关系。',
    'type-theory': '与 Java/C# 名义类型对比：结构类型更灵活，但错误信息可能较晦涩。',
    '01-types': '与 Flow 对比：TS 生态更成熟，类型系统表达力更强。',
    '02-variables': '与其他语言作用域对比：JS 函数作用域 + 提升机制较为独特。',
    '03-control-flow': '与结构化编程理论对比：JS 的异常机制增强了非局部退出能力。',
    '04-functions': '与面向对象语言对比：JS 函数作为一等公民提供了更灵活的抽象能力。',
    '05-objects-classes': '与经典 OOP 对比：JS 原型委托提供了更轻量的继承机制。',
    '06-modules': '与 Python/Java 模块对比：JS 模块系统经历了多次演进，ESM 是最终方向。',
    'dynamic-import': '与 require() 对比：import() 返回 Promise 且遵循 ESM 语义。',
    'esm-basics': '与 CJS 对比：ESM 静态分析支持 tree-shaking，CJS 支持动态路径。',
    '07-metaprogramming': '与 Ruby 元编程对比：JS Proxy 提供了更系统化的拦截能力。',
    'api-client': '与 GraphQL 客户端对比：REST 客户端更简单通用，GraphQL 更灵活精确。',
    'auth-system': '与 OAuth 对比：自建认证更可控，OAuth 更标准化但依赖第三方。',
    'cli-tools': '与 GUI 工具对比：CLI 更适合自动化和远程环境，学习曲线更陡。',
    'data-processing': '与 SQL 对比：流式处理适合无模式数据，SQL 适合结构化查询。',
    'event-bus': '与直接调用对比：总线解耦但增加了间接性和调试难度。',
    'state-management': '与 props drilling 对比：全局状态简化深层传递，但增加了全局依赖。',
    'validation': '与运行时 schema 库对比：编译时类型检查零成本但无法验证外部输入。',
    'web-server': '与 Serverless 对比：传统服务器可控性强，Serverless 弹性更好。',
    'web-platform-apis': '与原生应用 API 对比：Web API 跨平台但能力受限，安全性更高。',
    'wasm-component-model': '与 WASI 对比：组件模型关注接口，WASI 关注系统能力。',
    'formal-semantics': '与指称语义对比：操作语义更接近实际执行，便于实现验证。',
    'operational-semantics': '与指称语义对比：操作语义更接近实际执行，便于实现验证。',
    'axiomatic-semantics': '与模型检测对比：公理验证更抽象，模型检测更自动化。',
    'lambda-calculus': '与图灵机对比：LC 更适合函数式语言理论，图灵机更适合复杂度分析。',
    'type-inference': '与显式类型对比：推断减少冗余，标注增加可读性和约束。',
    'subtyping': '与参数多态对比：子类型关注层次关系，参数多态关注抽象复用。',
    'mini-typescript': '与完整 TS 对比：Mini-TS 聚焦核心机制，忽略泛型约束和模块解析。',
    'rust-toolchain': '与 Node-API (C++) 对比：Rust 内存安全但学习曲线更陡。',
    'rust-toolchain-migration': '与 Node-API (C++) 对比：Rust 内存安全但学习曲线更陡。',
    'cqrs': '与 CRUD 对比：CQRS 适合高并发读，CRUD 适合简单一致场景。',
    'hexagonal': '与洋葱架构对比：六边形更强调外部适配器，洋葱更强调依赖方向。',
    'layered': '与微服务对比：分层是代码级组织，微服务是部署级拆分。',
    'microservices': '与模块化单体对比：微服务部署独立但分布式复杂度高。',
    'mvc': '与 MVP 对比：MVC 控制器更粗粒度，MVP Presenter 更贴近视图。',
    'mvvm': '与 MVI/Elm 对比：MVVM 双向绑定更灵活，MVI 单向流更可预测。',
    'behavioral': '与函数式组合对比：OOP 模式封装状态行为，函数组合更偏数据转换。',
    'creational': '与依赖注入容器对比：创建模式关注实例化逻辑，DI 关注依赖组装。',
    'js-ts-specific': '与经典 GoF 对比：JS/TS 模式充分利用动态特性和类型系统。',
    'structural': '与继承对比：结构模式偏好组合，继承是静态绑定。',
    'async-await': '与 Goroutines 对比：async/await 显式调度，Goroutines 隐式调度。',
    'atomics': '与锁对比：Atomics 无阻塞但能力有限，锁通用但可能死锁。',
    'event-loop': '与多线程调度对比：事件循环单线程简化并发，多线程利用多核。',
    'promises': '与 Futures/Tasks 对比：Promise 不可变，有些语言 Future 可取消。',
    'streaming': '与批量处理对比：流式低内存但高代码复杂度，批量简单但内存峰值高。',
    'workers': '与进程 fork 对比：Workers 轻量但共享内存受限，进程隔离强但开销大。',
    'dynamic-programming': '与贪心算法对比：DP 保证最优但复杂度高，贪心快但可能非最优。',
    'graph': '与树算法对比：图更通用但算法更复杂，树有额外约束可优化。',
    'recursion': '与迭代对比：递归表达力更强，迭代通常性能更优。',
    'searching': '与索引对比：搜索通用但慢，索引快但需要预处理和维护。',
    'sorting': '与无序集合对比：排序后支持范围查询和二分，但维护有序有开销。',
    'built-in': '与自定义结构对比：内置经过优化，自定义更灵活可控。',
    'custom': '与库实现对比：自定义无依赖但需维护，库经过测试但增加体积。',
    'functional': '与可变结构对比：函数式安全但可能有空间开销，可变高效但易出 bug。',
    'frontend-frameworks': '与原生 DOM 对比：框架提升开发效率，原生无抽象开销。',
    'signals-patterns': '与虚拟 DOM 对比：Signals 细粒度更新快，虚拟 DOM 跨平台能力强。',
    'a2a-protocol': '与私有 API 对比：标准化降低集成成本，私有 API 更灵活可控。',
    'agent-patterns': '与硬编码流程对比：模式提升适应性，硬编码更确定和高效。',
    'mcp-protocol': '与直接 API 调用对比：标准化降低重复开发，直接调用更灵活。',
    'ai-assisted-workflow': '与传统开发对比：AI 辅助提升效率，但需要更高审查标准。',
    'edge-databases': '与中心化数据库对比：边缘低延迟但一致性弱，中心强一致但延迟高。',
    'build-free-typescript': '与编译构建对比：免构建开发快，编译构建优化强。',
    'edge-first-patterns': '与云原生对比：边缘降低延迟，云原生计算资源更充沛。',
    'tanstack-start-cloudflare': '与 Next.js 对比：TanStack Start 更轻量、框架无关。',
  };
  for (const key in cp) {
    if (dirPath.includes(key)) return cp[key];
  }
  return `与其他相关技术对比，${topic} 在特定场景下提供了独特的权衡优势。`;
}

function getMisconceptions(topic, dirPath) {
  const mc = {
    'ecmascript-evolution': `| 误区 | 正确理解 |
|------|---------|
| 新特性可以立即在生产环境使用 | 需评估目标运行时支持与转译成本 |
| 所有特性都向后兼容 | 部分特性需要 polyfill 或语法转换 |`,
    'compiler-api': `| 误区 | 正确理解 |
|------|---------|
| 编译器 API 仅用于构建工具 | 也可用于代码生成、迁移工具、IDE 插件 |
| AST 操作不会影响类型检查 | 结构修改后需重新触发类型分析 |`,
    'interoperability': `| 误区 | 正确理解 |
|------|---------|
| JS 文件不能拥有类型安全 | 通过 JSDoc 和 .d.ts 可以实现完整类型 |
| 互操作只需添加 any 类型 | 精确的类型声明才能发挥 TS 价值 |`,
    'js-implementations': `| 误区 | 正确理解 |
|------|---------|
| 所有引擎行为完全一致 | 引擎对边界条件的处理存在差异 |
| 性能优化只需关注 V8 | 不同用户群体使用不同引擎 |`,
    'pattern-migration': `| 误区 | 正确理解 |
|------|---------|
| 迁移就是添加类型注解 | 需要重构架构以发挥类型系统优势 |
| 可以一次性完成全部迁移 | 渐进式迁移风险更低、更容易落地 |`,
    'semantic-models': `| 误区 | 正确理解 |
|------|---------|
| 静态语义完全覆盖动态语义 | 类型系统只能保证部分安全属性 |
| 运行时类型与静态类型一致 | TS 类型在编译后被擦除 |`,
    'syntax-mapping': `| 误区 | 正确理解 |
|------|---------|
| TS 是 JS 的超集因此完全兼容 | 有效 JS 未必能通过 TS 类型检查 |
| 类型擦除不影响运行时 | 装饰器等语法会改变运行时行为 |`,
    'type-theory': `| 误区 | 正确理解 |
|------|---------|
| TypeScript 使用名义类型 | TS 是结构类型系统，不依赖声明名称 |
| any 是安全的顶层类型 | any 会关闭类型检查，应避免滥用 |`,
    '01-types': `| 误区 | 正确理解 |
|------|---------|
| any 可以临时替代所有类型 | any 会传播并破坏整个类型链 |
| unknown 与 any 等价 | unknown 要求使用前先进行类型收窄 |`,
    '02-variables': `| 误区 | 正确理解 |
|------|---------|
| var 和 let 只是语法差异 | var 存在变量提升和函数作用域问题 |
| const 保证值不可变 | const 只保证引用不变，对象内容可变 |`,
    '03-control-flow': `| 误区 | 正确理解 |
|------|---------|
| switch 默认有 break | 缺少 break 会导致穿透执行 |
| try/catch 可以捕获异步错误 | 异步错误需配合 await 或 .catch |`,
    '04-functions': `| 误区 | 正确理解 |
|------|---------|
| 箭头函数完全等价于普通函数 | 箭头函数无自身 this、arguments 和原型 |
| async 函数总是返回 Promise | 即使返回非 Promise 值也会被包装 |`,
    '05-objects-classes': `| 误区 | 正确理解 |
|------|---------|
| class 引入了真正的类 | JS class 仍是原型继承的语法糖 |
| 私有字段 # 可通过反射访问 | 硬私有字段在语言层面不可从外部访问 |`,
    '06-modules': `| 误区 | 正确理解 |
|------|---------|
| ESM 和 CJS 可以随意混用 | 互操作需要特定加载器和转换规则 |
| 循环依赖会自动解决 | 循环依赖可能导致未初始化访问 |`,
    'dynamic-import': `| 误区 | 正确理解 |
|------|---------|
| 动态导入等同于 require | 动态 import() 返回 Promise 且是 ESM 语义 |
| 动态导入无性能成本 | 网络加载和解析仍有显著延迟 |`,
    'esm-basics': `| 误区 | 正确理解 |
|------|---------|
| ESM 不支持循环依赖 | ESM 有静态绑定机制处理循环引用 |
| 导入路径可以省略扩展名 | 浏览器 ESM 要求显式扩展名 |`,
    '07-metaprogramming': `| 误区 | 正确理解 |
|------|---------|
| Proxy 可以拦截所有操作 | 部分原生对象内部槽无法被代理 |
| Reflect 只是 Proxy 的镜像 | Reflect 提供默认行为且可用于普通对象 |`,
    'api-client': `| 误区 | 正确理解 |
|------|---------|
| 封装 fetch 就是 API 客户端 | 完整的客户端需要错误处理、重试、取消 |
| HTTP 错误会自动抛出异常 | fetch 仅在网络故障时 reject |`,
    'auth-system': `| 误区 | 正确理解 |
|------|---------|
| JWT 可以存储敏感信息 | JWT payload 仅 Base64 编码，可解码 |
| 前端可以安全地验证 Token | 密钥不应暴露在前端代码中 |`,
    'cli-tools': `| 误区 | 正确理解 |
|------|---------|
| 进程退出码不重要 | 退出码是脚本链式调用的契约 |
| stdout 和 stderr 可以混用 | stderr 应专用于错误和诊断信息 |`,
    'data-processing': `| 误区 | 正确理解 |
|------|---------|
| 数组方法链总是最优 | 大数组多次遍历可能不如单次循环高效 |
| 流式处理只适合大文件 | 流式也能改善内存抖动和响应性 |`,
    'event-bus': `| 误区 | 正确理解 |
|------|---------|
| 事件总线消除了耦合 | 总线本身成为隐式全局依赖 |
| 更多事件类型总是更好 | 过度细分会导致调试困难和逻辑分散 |`,
    'state-management': `| 误区 | 正确理解 |
|------|---------|
| 所有状态都应全局管理 | 过度全局化导致组件难以复用和测试 |
| 直接修改状态更方便 | 直接修改破坏可预测性和时间旅行调试 |`,
    'validation': `| 误区 | 正确理解 |
|------|---------|
| 前端验证可以替代后端 | 前端验证仅提升体验，后端必须独立校验 |
| 类型检查等于运行时验证 | 类型在编译后消失，不能阻止非法输入 |`,
    'web-server': `| 误区 | 正确理解 |
|------|---------|
| 中间件顺序不重要 | 中间件按注册顺序执行，错误顺序导致异常 |
| 错误处理放在最后即可 | 异步错误需要专门的错误处理中间件 |`,
    'web-platform-apis': `| 误区 | 正确理解 |
|------|---------|
| 现代 API 已全平台支持 | 需检查 caniuse 和降级方案 |
| DOM 操作总是同步的 | 部分 API 如 IntersectionObserver 是异步回调 |`,
    'wasm-component-model': `| 误区 | 正确理解 |
|------|---------|
| WASM 替代 JS | WASM 与 JS 是互补关系，各有适用域 |
| WASM 性能总是优于 JS | 边界调用和数据转换有额外开销 |`,
    'formal-semantics': `| 误区 | 正确理解 |
|------|---------|
| 形式语义只是学术游戏 | 形式语义是编译器优化和验证的基础 |
| 小步与大步语义等价 | 它们在并发和非确定性场景表现不同 |`,
    'operational-semantics': `| 误区 | 正确理解 |
|------|---------|
| 形式语义只是学术游戏 | 形式语义是编译器优化和验证的基础 |
| 小步与大步语义等价 | 它们在并发和非确定性场景表现不同 |`,
    'axiomatic-semantics': `| 误区 | 正确理解 |
|------|---------|
| 形式验证可以消除所有 bug | 验证只覆盖规格内的属性 |
| 手工证明足够可靠 | 复杂系统需要自动化证明辅助 |`,
    'lambda-calculus': `| 误区 | 正确理解 |
|------|---------|
| Lambda 演算只是理论玩具 | 它是函数式语言和类型系统的基石 |
| 任何可计算问题都适合 LC | LC 适合表达式计算，不适合命令式状态 |`,
    'type-inference': `| 误区 | 正确理解 |
|------|---------|
| 推断出的类型总是最精确的 | 推断可能过于宽泛，需要显式标注约束 |
| 类型推断增加运行时开销 | 推断仅在编译期进行，不影响运行时 |`,
    'subtyping': `| 误区 | 正确理解 |
|------|---------|
| 子类型就是继承 | 子类型是语义关系，继承是实现机制 |
| 协变总是安全的 | 函数参数位置需要逆变才保证安全 |`,
    'mini-typescript': `| 误区 | 正确理解 |
|------|---------|
| 简化版无实用价值 | 精简实现是理解真实系统的最佳途径 |
| 类型检查就是遍历 AST | 需要约束收集、统一和上下文管理 |`,
    'rust-toolchain': `| 误区 | 正确理解 |
|------|---------|
| Rust 完全替代 Node C++ 扩展 | Rust 是选项之一，需评估团队技能栈 |
| WASM 比原生绑定更快 | 边界开销使 WASM 在小计算量时不占优 |`,
    'rust-toolchain-migration': `| 误区 | 正确理解 |
|------|---------|
| Rust 完全替代 Node C++ 扩展 | Rust 是选项之一，需评估团队技能栈 |
| WASM 比原生绑定更快 | 边界开销使 WASM 在小计算量时不占优 |`,
    'cqrs': `| 误区 | 正确理解 |
|------|---------|
| CQRS 必须配合事件溯源 | CQRS 可独立使用，事件溯源是可选的 |
| 分离后读写总是一致的 | 最终一致性需要额外的同步机制 |`,
    'hexagonal': `| 误区 | 正确理解 |
|------|---------|
| 六边形架构需要六层 | 六边形是隐喻，核心是端口与适配器 |
| 适配器只是接口包装 | 适配器包含技术细节和错误转换 |`,
    'layered': `| 误区 | 正确理解 |
|------|---------|
| 分层越多越优雅 | 过度分层增加不必要的抽象成本 |
| 层间可以任意穿透 | 依赖规则破坏会导致架构腐化 |`,
    'microservices': `| 误区 | 正确理解 |
|------|---------|
| 微服务解决所有扩展问题 | 引入分布式复杂度，需要配套基础设施 |
| 服务越小越好 | 过细的服务导致通信开销和事务困难 |`,
    'mvc': `| 误区 | 正确理解 |
|------|---------|
| MVC 只适用于服务端 | MVC 思想也适用于前端组件设计 |
| 控制器应该包含业务逻辑 | 业务逻辑应集中在模型层 |`,
    'mvvm': `| 误区 | 正确理解 |
|------|---------|
| 双向绑定总是优于单向 | 复杂状态下单向数据流更易调试 |
| 视图模型只是模型的复制 | 视图模型包含视图特定的状态与命令 |`,
    'behavioral': `| 误区 | 正确理解 |
|------|---------|
| 设计模式增加复杂度 | 模式是经验总结，在合适场景降低复杂度 |
| 所有行为问题都用观察者 | 应根据通信模式选择策略、命令等模式 |`,
    'creational': `| 误区 | 正确理解 |
|------|---------|
| 单例模式总是必要的 | 单例隐藏依赖，测试中可用依赖注入替代 |
| 工厂只是 new 的包装 | 工厂封装创建逻辑和依赖组装 |`,
    'js-ts-specific': `| 误区 | 正确理解 |
|------|---------|
| TS 类型影响运行时 | 类型擦除后运行时无类型信息 |
| any 是类型系统的逃生舱 | 过度使用 any 等于放弃类型安全 |`,
    'structural': `| 误区 | 正确理解 |
|------|---------|
| 适配器用于修复设计缺陷 | 适配器解决接口不匹配，而非设计错误 |
| 装饰器与继承等价 | 装饰器动态组合，继承静态绑定 |`,
    'async-await': `| 误区 | 正确理解 |
|------|---------|
| await 会阻塞线程 | await 挂起协程，不阻塞事件循环 |
| async 函数总是并行执行 | 连续的 await 是顺序执行 |`,
    'atomics': `| 误区 | 正确理解 |
|------|---------|
| Atomics 替代所有锁 | Atomics 适合简单操作，复杂临界区仍需锁 |
| SharedArrayBuffer 总是可用 | 受 Spectre 影响，需要跨域隔离策略 |`,
    'event-loop': `| 误区 | 正确理解 |
|------|---------|
| setTimeout 0 立即执行 | 最小延迟受限于宏任务队列和浏览器节流 |
| 微任务在每次宏任务后清空 | 微任务队列会递归清空直到为空 |`,
    'promises': `| 误区 | 正确理解 |
|------|---------|
| new Promise 中不调用 resolve 会静默失败 | 未 settle 的 Promise 导致内存泄漏 |
| Promise.catch 捕获所有错误 | 同步抛出的错误需用 try/catch 或 reject |`,
    'streaming': `| 误区 | 正确理解 |
|------|---------|
| 流会自动处理背压 | 需要显式检查 writable.needDrain |
| 管道错误会自动传播 | 需使用 pipeline() 或手动监听 error |`,
    'workers': `| 误区 | 正确理解 |
|------|---------|
| Worker 可访问 DOM | Worker 无 window/document，需通过消息通信 |
| postMessage 传递引用 | 结构化克隆复制数据，非共享引用 |`,
    'dynamic-programming': `| 误区 | 正确理解 |
|------|---------|
| DP 就是递归加缓存 | 自底向上 DP 无递归开销，空间可优化 |
| 所有问题都适合 DP | DP 要求最优子结构和重叠子问题 |`,
    'graph': `| 误区 | 正确理解 |
|------|---------|
| 邻接矩阵总是更好 | 稀疏图用邻接表更省空间 |
| DFS 和 BFS 结果等价 | 遍历顺序不同，适用场景也不同 |`,
    'recursion': `| 误区 | 正确理解 |
|------|---------|
| 尾递归一定被优化 | JS 引擎对尾递归优化支持不一致 |
| 递归比迭代更慢 | 递归开销存在，但可读性可能更重要 |`,
    'searching': `| 误区 | 正确理解 |
|------|---------|
| 二分搜索只能用于数组 | 任何支持随机访问的有序集合均可 |
| 哈希搜索总是 O(1) | 冲突严重时退化，且需要额外空间 |`,
    'sorting': `| 误区 | 正确理解 |
|------|---------|
| 快速排序空间复杂度 O(1) | 递归调用栈平均 O(log n) |
| 稳定排序不重要 | 多字段排序时稳定性影响结果 |`,
    'built-in': `| 误区 | 正确理解 |
|------|---------|
| Object 和 Map 完全等价 | Map 支持任意键、有序、有 size 属性 |
| Set 去重引用类型 | Set 按 SameValueZero 比较，对象去重需额外处理 |`,
    'custom': `| 误区 | 正确理解 |
|------|---------|
| 自定义结构总是更快 | 未经优化的自定义实现可能劣于内置 |
| 链表比数组更好 | 随机访问数组 O(1) 优于链表 O(n) |`,
    'functional': `| 误区 | 正确理解 |
|------|---------|
| 持久化结构非常耗内存 | 结构共享使空间开销远小于完全复制 |
| 函数式结构不适合性能敏感场景 | 某些持久化结构在特定操作上有竞争力 |`,
    'frontend-frameworks': `| 误区 | 正确理解 |
|------|---------|
| 虚拟 DOM 总是最快 | 极端简单场景下直接 DOM 操作可能更优 |
| 框架选择决定性能上限 | 开发者对框架的理解和使用方式更重要 |`,
    'signals-patterns': `| 误区 | 正确理解 |
|------|---------|
| Signals 是全新的发明 | Signals 是响应式编程的细粒度演进 |
| Signals 消除所有重渲染 | 组件级更新仍需框架协调 |`,
    'a2a-protocol': `| 误区 | 正确理解 |
|------|---------|
| A2A 替代 HTTP | A2A 建立在 HTTP 之上，是应用层协议 |
| 所有 Agent 都支持 A2A | A2A 需要生态适配，目前覆盖有限 |`,
    'agent-patterns': `| 误区 | 正确理解 |
|------|---------|
| Agent 模式保证正确结果 | 模式提升可控性，不消除模型幻觉 |
| 越复杂的模式越好 | 简单任务使用简单模式降低延迟和成本 |`,
    'mcp-protocol': `| 误区 | 正确理解 |
|------|---------|
| MCP 只连接数据库 | MCP 可连接任何工具、API 和数据源 |
| MCP Server 必须远程部署 | MCP Server 可以本地、远程或嵌入运行 |`,
    'ai-assisted-workflow': `| 误区 | 正确理解 |
|------|---------|
| AI 生成代码无需审查 | AI 输出可能包含幻觉和安全隐患 |
| AI 辅助只适用于生成代码 | 也可用于测试生成、文档和重构建议 |`,
    'edge-databases': `| 误区 | 正确理解 |
|------|---------|
| 边缘数据库等于缓存 | 边缘数据库提供持久化，不仅是缓存 |
| 边缘 SQLite 功能不完整 | 现代边缘 SQLite 支持大部分标准特性 |`,
    'build-free-typescript': `| 误区 | 正确理解 |
|------|---------|
| 免构建意味着无类型检查 | 开发时仍可用 tsc --noEmit 做静态检查 |
| 原生 TS 支持所有特性 | 装饰器等实验性特性支持可能不完整 |`,
    'edge-first-patterns': `| 误区 | 正确理解 |
|------|---------|
| 边缘计算取代云计算 | 边缘与中心是协同关系，各有分工 |
| 边缘函数无状态限制 | 边缘函数通常有 CPU/内存/时长限制 |`,
    'tanstack-start-cloudflare': `| 误区 | 正确理解 |
|------|---------|
| 边缘 SSR 总是比 CSR 快 | 首次加载快，但交互复杂度影响体验 |
| TanStack Start 是元框架 | Start 是路由+数据层，需配合 UI 框架 |`,
  };
  for (const key in mc) {
    if (dirPath.includes(key)) return mc[key];
  }
  return `| 误区 | 正确理解 |
|------|---------|
| ${topic} 很简单无需学习 | 深入理解能避免隐蔽 bug 和性能陷阱 |
| 理论脱离实际 | 理论指导实践中的架构决策 |`;
}

function getReading(topic, dirPath) {
  const rd = {
    'ecmascript-evolution': '- [ECMAScript 提案仓库](https://github.com/tc39/proposals)\n- `30-knowledge-base/30.1-language-evolution/`',
    'compiler-api': '- [TypeScript Compiler API 文档](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)\n- `10-fundamentals/10.5-type-system/`',
    'interoperability': '- [TypeScript JSDoc 支持](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html)\n- `10-fundamentals/10.2-js-ts-bridge/`',
    'js-implementations': '- [V8 博客](https://v8.dev/blog)\n- `30-knowledge-base/30.2-runtimes/`',
    'pattern-migration': '- [TypeScript 迁移指南](https://www.typescriptlang.org/docs/handbook/migrating-from-javascript.html)\n- `10-fundamentals/10.3-migration/`',
    'semantic-models': '- [ECMA-262 规范](https://tc39.es/ecma262/)\n- `20.10-formal-verification/`',
    'syntax-mapping': '- [TypeScript 手册](https://www.typescriptlang.org/docs/handbook/intro.html)\n- `10-fundamentals/10.1-language-core/`',
    'type-theory': '- [TAPL (Types and Programming Languages)](https://www.cis.upenn.edu/~bcpierce/tapl/)\n- `20.10-formal-verification/type-theory-formal/`',
    '01-types': '- [TypeScript 类型手册](https://www.typescriptlang.org/docs/handbook/basic-types.html)\n- `10-fundamentals/10.1-language-core/01-types/`',
    '02-variables': '- [MDN 变量指南](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types)\n- `10-fundamentals/10.1-language-core/02-variables/`',
    '03-control-flow': '- [MDN 控制流](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)\n- `10-fundamentals/10.1-language-core/03-control-flow/`',
    '04-functions': '- [MDN 函数](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions)\n- `10-fundamentals/10.1-language-core/04-functions/`',
    '05-objects-classes': '- [MDN 类](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)\n- `10-fundamentals/10.1-language-core/05-objects-classes/`',
    '06-modules': '- [MDN 模块](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)\n- `10-fundamentals/10.1-language-core/06-modules/`',
    'dynamic-import': '- [V8 动态导入](https://v8.dev/features/dynamic-import)\n- `10-fundamentals/10.1-language-core/06-modules/`',
    'esm-basics': '- [ESM 深度解析](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/)\n- `10-fundamentals/10.1-language-core/06-modules/`',
    '07-metaprogramming': '- [MDN Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)\n- `10-fundamentals/10.1-language-core/07-metaprogramming/`',
    'api-client': '- [Fetch API 规范](https://fetch.spec.whatwg.org/)\n- `30-knowledge-base/30.5-networking/`',
    'auth-system': '- [OWASP 认证备忘单](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)\n- `30-knowledge-base/30.6-security/`',
    'cli-tools': '- [oclif 框架文档](https://oclif.io/docs/introduction)\n- `30-knowledge-base/30.7-tooling/`',
    'data-processing': '- [RxJS 文档](https://rxjs.dev/guide/overview)\n- `30-knowledge-base/30.8-data/`',
    'event-bus': '- [Event Emitter 模式](https://nodejs.org/api/events.html)\n- `20.2-language-patterns/design-patterns/behavioral/`',
    'state-management': '- [Redux 文档](https://redux.js.org/)\n- `20.2-language-patterns/architecture-patterns/`',
    'validation': '- [zod 文档](https://zod.dev/)\n- `30-knowledge-base/30.8-data/`',
    'web-server': '- [Node.js HTTP 模块](https://nodejs.org/api/http.html)\n- `30-knowledge-base/30.4-backend/`',
    'web-platform-apis': '- [Web Platform Docs](https://developer.mozilla.org/en-US/docs/Web/API)\n- `10-fundamentals/10.4-web-platform/`',
    'wasm-component-model': '- [WASM Component Model](https://component-model.bytecodealliance.org/)\n- `30-knowledge-base/30.9-webassembly/`',
    'formal-semantics': '- [Semantics with Applications](https://www.cs.ru.nl/~herman/semanticswithapplications.pdf)\n- `20.10-formal-verification/formal-semantics/`',
    'operational-semantics': '- [Semantics with Applications](https://www.cs.ru.nl/~herman/semanticswithapplications.pdf)\n- `20.10-formal-verification/formal-semantics/`',
    'axiomatic-semantics': '- [Hoare Logic](https://en.wikipedia.org/wiki/Hoare_logic)\n- `20.10-formal-verification/formal-semantics/`',
    'lambda-calculus': '- [Lambda Calculus](https://plato.stanford.edu/entries/lambda-calculus/)\n- `20.10-formal-verification/type-theory-formal/`',
    'type-inference': '- [HM Type Inference](https://en.wikipedia.org/wiki/Hindley%E2%80%93Milner_type_system)\n- `20.10-formal-verification/type-theory-formal/`',
    'subtyping': '- [Subtyping Theory](https://en.wikipedia.org/wiki/Subtyping)\n- `20.10-formal-verification/type-theory-formal/`',
    'mini-typescript': '- [mini-typescript 项目](https://github.com/sandersn/mini-typescript)\n- `20.10-formal-verification/type-theory-formal/`',
    'rust-toolchain': '- [napi-rs 文档](https://napi.rs/)\n- `30-knowledge-base/30.10-native/`',
    'rust-toolchain-migration': '- [napi-rs 文档](https://napi.rs/)\n- `30-knowledge-base/30.10-native/`',
    'cqrs': '- [CQRS 模式](https://martinfowler.com/bliki/CQRS.html)\n- `20.2-language-patterns/architecture-patterns/`',
    'hexagonal': '- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)\n- `20.2-language-patterns/architecture-patterns/`',
    'layered': '- [Layered Architecture](https://www.oreilly.com/library/view/software-architecture-patterns/9781491971437/ch01.html)\n- `20.2-language-patterns/architecture-patterns/`',
    'microservices': '- [Building Microservices](https://samnewman.io/books/building_microservices/)\n- `20.2-language-patterns/architecture-patterns/`',
    'mvc': '- [MVC Pattern](https://developer.mozilla.org/en-US/docs/Glossary/MVC)\n- `20.2-language-patterns/architecture-patterns/`',
    'mvvm': '- [MVVM Pattern](https://learn.microsoft.com/en-us/dotnet/architecture/maui/mvvm)\n- `20.2-language-patterns/architecture-patterns/`',
    'behavioral': '- [GoF Design Patterns](https://en.wikipedia.org/wiki/Design_Patterns)\n- `20.2-language-patterns/design-patterns/`',
    'creational': '- [GoF Design Patterns](https://en.wikipedia.org/wiki/Design_Patterns)\n- `20.2-language-patterns/design-patterns/`',
    'js-ts-specific': '- [JavaScript Patterns](https://shichuan.github.io/javascript-patterns/)\n- `20.2-language-patterns/design-patterns/`',
    'structural': '- [GoF Design Patterns](https://en.wikipedia.org/wiki/Design_Patterns)\n- `20.2-language-patterns/design-patterns/`',
    'async-await': '- [Async Functions V8](https://v8.dev/features/async-await)\n- `20.3-concurrency-async/concurrency/`',
    'atomics': '- [Atomics MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Atomics)\n- `20.3-concurrency-async/concurrency/`',
    'event-loop': '- [What the heck is the event loop](https://www.youtube.com/watch?v=8aGhZQkoFbQ)\n- `20.3-concurrency-async/concurrency/`',
    'promises': '- [Promises MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)\n- `20.3-concurrency-async/concurrency/`',
    'streaming': '- [Node.js Streams](https://nodejs.org/api/stream.html)\n- `20.3-concurrency-async/concurrency/`',
    'workers': '- [Web Workers MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)\n- `20.3-concurrency-async/concurrency/`',
    'dynamic-programming': '- [DP Patterns](https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns)\n- `20.4-data-algorithms/algorithms/`',
    'graph': '- [Graph Algorithms](https://en.wikipedia.org/wiki/Graph_theory)\n- `20.4-data-algorithms/algorithms/`',
    'recursion': '- [Recursion in Functional Programming](https://www.freecodecamp.org/news/how-recursion-works/)\n- `20.4-data-algorithms/algorithms/`',
    'searching': '- [Search Algorithms](https://en.wikipedia.org/wiki/Search_algorithm)\n- `20.4-data-algorithms/algorithms/`',
    'sorting': '- [Sorting Algorithms](https://en.wikipedia.org/wiki/Sorting_algorithm)\n- `20.4-data-algorithms/algorithms/`',
    'built-in': '- [V8 Source](https://github.com/v8/v8)\n- `20.4-data-algorithms/data-structures/`',
    'custom': '- [Data Structures in JS](https://github.com/trekhleb/javascript-algorithms)\n- `20.4-data-algorithms/data-structures/`',
    'functional': '- [Immutable.js](https://immutable-js.github.io/immutable-js/)\n- `20.4-data-algorithms/data-structures/`',
    'frontend-frameworks': '- [SolidJS 响应式](https://www.solidjs.com/)\n- `20.5-frontend-frameworks/`',
    'signals-patterns': '- [SolidJS Signals](https://www.solidjs.com/tutorial/introduction_signals)\n- `20.5-frontend-frameworks/`',
    'a2a-protocol': '- [A2A Protocol](https://github.com/google/A2A)\n- `20.7-ai-agent-infra/`',
    'agent-patterns': '- [LangChain Agents](https://python.langchain.com/docs/modules/agents/)\n- `20.7-ai-agent-infra/`',
    'mcp-protocol': '- [MCP Protocol](https://modelcontextprotocol.io/)\n- `20.7-ai-agent-infra/`',
    'ai-assisted-workflow': '- [GitHub Copilot](https://github.com/features/copilot)\n- `20.7-ai-agent-infra/`',
    'edge-databases': '- [Cloudflare D1](https://developers.cloudflare.com/d1/)\n- `20.13-edge-databases/`',
    'build-free-typescript': '- [Deno 原生 TS](https://deno.land/)\n- `20.12-build-free-typescript/`',
    'edge-first-patterns': '- [Cloudflare Patterns](https://developers.cloudflare.com/workers/reference/how-workers-works/)\n- `20.8-edge-serverless/`',
    'tanstack-start-cloudflare': '- [TanStack Start](https://tanstack.com/start/latest)\n- `20.8-edge-serverless/`',
  };
  for (const key in rd) {
    if (dirPath.includes(key)) return rd[key];
  }
  return '- [MDN Web Docs](https://developer.mozilla.org)\n- `30-knowledge-base/`';
}

let success = 0;
let failed = 0;

for (const dir of dirs) {
  const topic = getTopic(dir);
  const problemDomain = getProblemDomain(topic, dir);
  const concepts = getConcepts(topic, dir);
  const whyExists = getWhyExists(topic, dir);
  const tradeoffs = getTradeoffs(topic, dir);
  const comparison = getComparison(topic, dir);
  const codeMapping = `本模块的代码示例将上述理论概念映射为可运行的实现。通过实际编码练习，可以验证对 ${topic} 核心机制的理解，并观察不同实现选择带来的行为差异。`;
  const misconceptions = getMisconceptions(topic, dir);
  const reading = getReading(topic, dir);

  const content = `# ${topic}

> **定位**：\`${dir}\`
> **关联**：\`10-fundamentals/\` | \`30-knowledge-base/\`

---

## 一、核心理论

### 1.1 问题域定义

${problemDomain}

### 1.2 形式化基础

[本模块的形式化定义与公理/定理陈述]

### 1.3 关键概念

${concepts}

---

## 二、设计原理

### 2.1 为什么存在

${whyExists}

### 2.2 权衡分析

${tradeoffs}

### 2.3 与相关技术的对比

${comparison}

---

## 三、实践映射

### 3.1 从理论到代码

${codeMapping}

### 3.2 常见误区

${misconceptions}

### 3.3 扩展阅读

${reading}

---

*本 THEORY.md 遵循 JS/TS 全景知识库的理论-实践闭环原则。*
`;

  const outPath = path.join(dir, 'THEORY.md');
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(outPath, content, 'utf8');
    success++;
    console.log(`OK: ${outPath}`);
  } catch (err) {
    failed++;
    console.log(`FAIL: ${outPath} - ${err.message}`);
  }
}

console.log('');
console.log('========== SUMMARY ==========');
console.log(`Success: ${success}`);
console.log(`Failed:  ${failed}`);
console.log(`Total:   ${success + failed}`);
