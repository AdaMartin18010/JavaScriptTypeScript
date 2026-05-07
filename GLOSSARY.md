# 术语表 (Glossary)

> JavaScript/TypeScript 生态系统专业术语统一对照表

本术语表旨在统一项目中使用的专业术语，提供中英文对照和简明定义，确保文档的一致性和可读性。

---

## 📋 目录

- [A](#a) | [B](#b) | [C](#c) | [D](#d) | [E](#e) | [F](#f) | [G](#g) | [H](#h) | [I](#i) | [J](#j) | [K](#k) | [L](#l) | [M](#m) | [N](#n) | [O](#o) | [P](#p) | [Q](#q) | [R](#r) | [S](#s) | [T](#t) | [U](#u) | [V](#v) | [W](#w) | [X](#x) | [Y](#y) | [Z](#z)

---

## A

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 抽象语法树 | Abstract Syntax Tree (AST) | 源代码的树形结构表示，用于编译器和代码分析工具 |
| 异步编程 | Asynchronous Programming | 不阻塞主线程的编程模式，通过回调、Promise 或 async/await 实现 |
| 原子操作 | Atomic Operation | 不可中断的操作，要么全部执行成功，要么完全不执行 |
| A2A (Agent-to-Agent Protocol) | A2A | Google 提出的开放协议，允许不同 AI Agent 之间安全地交换能力、上下文和任务状态 |
| 动作 | Action | Svelte 中用于直接操作 DOM 元素的底层接口，通常用于集成第三方库 |
| 适配器 | Adapter | SvelteKit 中用于将应用适配到不同部署目标的构建输出转换器 |
| Agent | Agent | 具备自主决策、工具调用和规划能力的 AI 系统，通常由 LLM + 工具 + 记忆组成 |
| AI 网关 | AI Gateway | 统一管理 AI 模型调用、负载均衡、缓存、成本控制和内容安全的中间层基础设施 |
| AI 网关 | AI Gateway | 统一管理 AI 模型调用、负载均衡、缓存、成本控制和内容安全的中间层基础设施 |

## B

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 背压 | Backpressure | 当生产者速度超过消费者时，用于控制数据流量的机制 |
| blame 追踪 | Blame Tracking | 一种在类型推断和错误报告中追踪类型约束来源的技术，用于精确定位类型错误的根本原因 |
| 蓝绿部署 | Blue-Green Deployment | 同时运行两套生产环境，通过切换流量实现零停机部署 |
| 边界上下文 | Bounded Context | 领域驱动设计中的核心概念，定义领域模型的适用范围 |
| 浏览器运行时 | Browser Runtime | 浏览器中执行 JavaScript 的环境，包括 V8 引擎、事件循环等 |
| 反向代理 | Reverse Proxy | 代表服务器接收客户端请求的中间服务器，常用于负载均衡和安全 |
| better-auth | better-auth | 现代 TypeScript 认证框架，强调类型安全、可扩展性和框架无关性，支持 OAuth、Passkeys 等多种认证方式 |
| 双向绑定 | Bindings | Svelte 中实现视图与状态双向同步的声明式语法机制 |

## C

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 缓存策略 | Caching Strategy | 控制数据缓存行为的规则，如 Cache-Aside、Write-Through 等 |
| Component Model | Component Model | WebAssembly 组件模型，通过 WIT 接口定义语言实现模块间组合与能力安全 |
| Capacitor | Capacitor | Ionic 团队推出的混合应用框架，将 Web 应用嵌入原生 WebView 并通过插件调用原生能力 |
| 类型断言插入 | Cast Insertion | 在类型驱动编译或代码生成过程中，自动插入类型断言以桥接静态类型与运行时类型差异的技术 |
| 命令模式 | Command Pattern | 将请求封装为对象，支持参数化、队列化和日志记录 |
| 编译器信号 | Compiler Signals | 编译器在编译阶段通过静态分析生成的响应式依赖图和更新指令 |
| 上下文 API | Context API | Svelte 提供的跨组件层级传递数据的上下文机制，避免逐层 props 传递
| 并发 | Concurrency | 多个任务在重叠的时间段内执行，不一定同时 |
| 持续部署 | Continuous Deployment (CD) | 自动将通过测试的代码部署到生产环境的实践 |
| 持续集成 | Continuous Integration (CI) | 频繁地将代码集成到主干并自动构建测试的实践 |
| 复制粘贴组件 | Copy-paste Components (shadcn/ui) | 一种组件分发模式，不通过 npm 安装，而是直接复制源码到项目中，提供完全可定制的 UI 组件 | |
| CQRS | Command Query Responsibility Segregation | 命令查询职责分离，读写模型分离的架构模式
| Curry-Howard 对应 | Curry-Howard Correspondence | 数学逻辑与计算理论之间的深刻对应，将命题视为类型、证明视为程序，连接了形式证明与函数式编程 |
| 并行 | Parallelism | 多个任务在同一时刻同时执行，需要多核处理器 |

## D

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 数据流 | Data Flow | 数据在系统中移动和变换的路径 |
| 死代码消除 | Dead Code Elimination (DCE) | 编译时移除未使用代码的优化技术，减少产物体积 |
| 装饰器模式 | Decorator Pattern | 动态地给对象添加额外职责的设计模式 |
| 指称语义 | Denotational Semantics | 通过数学对象和函数来描述程序含义的语义学方法，强调"程序做了什么"而非"如何执行" |
| 依赖注入 | Dependency Injection (DI) | 将依赖从外部传入，而非内部创建的设计模式 |
| 依赖倒置 | Dependency Inversion Principle | 高层模块不应依赖低层模块，两者应依赖抽象 |
| 依赖追踪 | Dependency Tracking | 响应式系统在运行时自动追踪状态与副作用之间依赖关系的技术 |
| 设计模式 | Design Pattern | 软件设计中常见问题的通用可复用解决方案 |
| 分布式系统 | Distributed System | 由多个通过网络通信的独立计算节点组成的系统 |
| Drizzle ORM | Drizzle ORM | 类型安全的 TypeScript ORM，以 SQL-like 查询语法和轻量运行时著称，支持多种关系型数据库 | |
| 领域驱动设计 | Domain-Driven Design (DDD) | 以业务领域为核心的软件设计方法

## E

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 副作用 | Effect / Side Effect | 响应式系统中由状态变化触发的副作用执行单元，如 DOM 更新、网络请求等 |
| 可擦除语法 | Erasable Syntax Only | TypeScript 的 `--erasableSyntaxOnly` 编译选项，要求代码中仅使用可在编译后被完全擦除的语法，以支持直接运行或快速剥离类型 |
| 事件委托 | Event Delegation | 利用事件冒泡机制，在父元素上统一处理子元素事件的技术 |
| 事件循环 | Event Loop | JavaScript 运行时处理异步事件的机制 |
| 事件驱动 | Event-Driven | 通过事件的产生、检测和消费来驱动程序执行的架构 |
| 事件溯源 | Event Sourcing | 用事件序列记录状态变更，而非仅存储当前状态 |
| 显式资源管理 | Explicit Resource Management | ECMAScript 提议的基于 `using` 和 `await using` 声明的资源管理机制，确保作用域结束时自动释放资源 |
| 工厂模式 | Factory Pattern | 封装对象创建逻辑的设计模式 |
| EAS | Expo Application Services | Expo 提供的云端构建、签名、提交和 OTA 更新服务 |

## F

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 函数式编程 | Functional Programming | 以纯函数和不可变数据为核心的编程范式 |
| Fabric | Fabric | React Native 新架构中的 C++ 渲染层，取代旧的 Yoga + ShadowTree 异步渲染 |
| FlashList | FlashList | Shopify 开源的 React Native 高性能列表组件，通过视图回收和布局复用优化长列表性能 |
| 细粒度响应式 | Fine-grained Reactivity | 仅更新依赖发生变化的精确粒度的响应式更新策略，避免不必要的组件级重渲染 |
| 表单动作 | Form Actions | SvelteKit 中处理表单提交的服务端逻辑，支持渐进增强和无 JavaScript 运行 |
| Flight 协议 | Flight Protocol | React Server Components 使用的流式传输协议，用于在服务器和客户端之间序列化组件树和 Promise 状态 | |
| 熔断器 | Circuit Breaker | 防止故障扩散的模式，当错误率超过阈值时快速失败
| 防抖 | Debounce | 延迟执行直到一段时间没有新触发的高频控制技术 |
| 节流 | Throttle | 限制函数执行频率的技术 |

## G

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 垃圾回收 | Garbage Collection (GC) | 自动回收不再使用的内存的机制 |
| 生成器 | Generator | 可暂停和恢复执行的函数，使用 `function*` 语法 |
| 全局状态管理 | Global State Management | 跨组件共享和管理应用状态的模式和工具 |
| 渐进类型 | Gradual Typing | 允许在静态类型与动态类型之间平滑过渡的类型系统设计理念，使未类型化代码能逐步获得类型安全 |
| 渐进类型边界 | Gradual Typing Boundary | 在渐进类型系统中，静态类型代码与动态类型代码交互时产生的边界区域，需要额外的运行时检查或类型断言来保证安全 |
| GraphQL | Graph Query Language | 由 Facebook 开发的 API 查询语言，允许客户端指定所需数据 |

## H

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 哈希表 | Hash Table | 通过哈希函数实现 O(1) 平均时间复杂度查找的数据结构 |
| 高阶组件 | Higher-Order Component (HOC) | 接收组件并返回新组件的函数，用于复用组件逻辑 |
| Hoare 逻辑 | Hoare Logic | 由 Tony Hoare 提出的形式化公理系统，用于推理程序正确性，基于前置条件、后置条件和循环不变式 |
| Helicone | Helicone | 开源 AI 可观测性平台，提供 LLM 调用的监控、缓存、速率限制和成本分析功能 |
| Hermes | Hermes | React Native 默认的 JavaScript 引擎，支持 AOT 字节码预编译和高效的垃圾回收 |

## I

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 不可变性 | Immutability | 数据一旦创建就不能更改的性质 |
| 中间表示 | Intermediate Representation (IR) | 编译器内部使用的中间代码表示形式，介于 AST 与目标代码之间，便于进行多轮优化
| 控制反转 | Inversion of Control (IoC) | 将控制权从调用方转移到框架或容器的原则 |
| 接口隔离 | Interface Segregation Principle | 客户端不应被迫依赖它们不用的方法 |
| 迭代器模式 | Iterator Pattern | 顺序访问聚合对象元素而不暴露其内部表示的模式 |
| import bytes | import bytes | ECMAScript 提案，允许从字节数组或 TypedArray 直接导入 WebAssembly 模块 | |
| import defer | import defer | ECMAScript 提案，支持延迟加载模块，在首次使用时才执行模块初始化 |

## J

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| JSON | JavaScript Object Notation | 轻量级数据交换格式，基于 JavaScript 对象语法 |
| JSI | JavaScript Interface | React Native 新架构中的 C++ 共享层，允许 JS 引擎直接持有 Native 对象引用并同步调用 |
| JSPI | JavaScript Promise Integration | WebAssembly 提案，允许 Wasm 模块同步调用异步 JS API（如 fetch） |
| JIT 编译 | Just-In-Time Compilation | 在运行时将字节码编译为机器码的技术 |

## K

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 键值存储 | Key-Value Store | 以键值对形式存储数据的 NoSQL 数据库 |

## L

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 语言服务器协议 | Language Server Protocol (LSP) | 由 Microsoft 提出的标准化协议，使编辑器能够通过统一的 JSON-RPC 接口与语言服务器通信，提供智能提示、跳转定义等功能 |
| 懒加载 | Lazy Loading | 延迟加载资源直到真正需要时才加载的策略 |
| 线性一致性 | Linearizability | 并发操作看起来像是以某种顺序串行执行的强一致性模型 |
| 加载函数 | Load Function | SvelteKit 中在页面渲染前获取数据的专用函数，支持服务端和客户端预取
| 负载均衡 | Load Balancing | 将工作负载分布到多个计算资源的机制 |
| Langfuse | Langfuse | 开源 LLM 工程平台，提供追踪、评估、提示管理和数据集功能，用于 AI 应用的迭代优化 |

## M

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 微服务 | Microservices | 将应用拆分为小型、独立部署服务的架构风格 |
| 中间件 | Middleware | 处理请求和响应的函数，位于应用和业务逻辑之间 |
| 内存泄漏 | Memory Leak | 不再使用的内存未被回收，导致内存持续增长的问题 |
| 记忆化 | Memoization | 缓存函数计算结果以避免重复计算的优化技术，在响应式系统中用于缓存派生值
| 模块化 | Modularity | 将系统分解为独立、可替换模块的设计原则 |
| 消息队列 | Message Queue | 异步通信的中间件，实现应用间的松耦合 |
| 观察者模式 | Observer Pattern | 对象间一对多依赖关系，一个对象状态变化通知所有依赖者 |
| 单例模式 | Singleton Pattern | 确保类只有一个实例并全局访问的设计模式 |
| MCP (模型上下文协议) | MCP (Model Context Protocol) | Anthropic 提出的开放协议，标准化 AI 模型与外部数据源、工具之间的上下文交换 | |
| 最小公共 Web API | Minimum Common Web API | WinterTC 定义的最小公共 Web API 子集，旨在为边缘运行时和受限环境提供一致的 JavaScript 运行时接口 |

## N

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 命名空间 | Namespace | 用于组织代码、避免命名冲突的逻辑容器 |
| 节点 | Node | 树形数据结构中的基本单元，或分布式系统中的计算单元 |
| NodeNext 模块解析策略 | NodeNext | TypeScript 为匹配 Node.js ESM 行为而设计的模块解析策略，支持 `.mts`、`.cts` 扩展名和 `exports` 字段解析 |
| npm | Node Package Manager | Node.js 默认的包管理工具 |

## O

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 面向对象编程 | Object-Oriented Programming (OOP) | 以对象和类为核心的编程范式 |
| 观察者模式 | Observer Pattern | 定义对象间一对多依赖，状态变化时自动通知依赖者 |
| 开闭原则 | Open/Closed Principle | 对扩展开放，对修改关闭的设计原则 |
| 操作语义 | Operational Semantics | 通过描述程序执行步骤来定义程序行为的语义学方法，通常以抽象机器或规约规则的形式呈现 |
| 乐观锁 | Optimistic Locking | 假设冲突不常发生，提交时检查版本号的并发控制策略 |
| OpenTelemetry | OpenTelemetry (OTel) | CNCF 主导的开放可观测性框架，提供跨语言的 Metrics、Logs、Traces 标准采集和导出协议 | |
| Oxide 引擎 | Oxide Engine (Tailwind v4) | Tailwind CSS v4 基于 Rust 重写的全新引擎，大幅提升构建性能和 CSS 生成效率 | |
| ORM | Object-Relational Mapping | 对象与关系数据库之间的映射技术 |
| OTA | Over-The-Air | 无需重新提交应用商店即可推送代码或资源更新的技术 |

## P

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 管道模式 | Pipeline Pattern | 将处理流程分解为一系列独立阶段的模式 |
| TypeScript 7.0 Go 重写项目 | Project Corsa | Microsoft 内部代号，指使用 Go 语言全面重写 TypeScript 编译器的项目，目标是实现数量级的性能提升 |
| Promise | Promise | 表示异步操作最终完成或失败的对象 |
| 原型模式 | Prototype Pattern | 通过复制现有对象创建新对象的模式 |
| 代理模式 | Proxy Pattern | 为其他对象提供代理以控制访问的设计模式 |
| 发布-订阅 | Pub/Sub (Publish-Subscribe) | 消息模式，发布者和订阅者通过中间件解耦 |
| PWA | Progressive Web App | 使用现代 Web 能力提供类似原生应用体验的 Web 应用 |
| 渐进增强 | Progressive Enhancement | 在不依赖 JavaScript 的情况下保证核心功能可用，再通过 JS 增强体验的 Web 设计策略 |
| Passkeys / WebAuthn | Passkeys / WebAuthn | 基于公钥密码学的无密码认证标准，通过生物识别或硬件密钥实现更安全的身份验证 | |
| 策略模式 | Strategy Pattern | 定义算法族，分别封装起来，让它们可以互相替换

## Q

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 队列 | Queue | 先进先出 (FIFO) 的线性数据结构 |
| 量子计算 | Quantum Computing | 利用量子力学原理进行计算的新型计算模式 |

## R

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 响应式编程 | Reactive Programming | 基于异步数据流和变化传播的编程范式 |
| 响应式宣言 | Reactive Manifesto | 定义响应式系统应具备的四个特性：响应性、弹性、弹性和消息驱动 |
| 重试策略 | Retry Strategy | 失败时自动重试操作的策略，包括指数退避等 |
| REST | Representational State Transfer | 基于 HTTP 的架构风格，用于设计网络应用程序 |
| React 编译器 | React Compiler | React 官方开发的编译时优化工具，自动进行记忆化和依赖追踪，替代手动使用 useMemo/useCallback | |
| 响应式原语 | Reactive Primitive | 响应式系统的最基础构建单元，如 Signal、Atom 等，提供可观测的状态和变更通知能力 |
| 符文 | Runes ($state, $derived, $effect, $props) | Svelte 5 引入的编译时响应式原语，通过特殊语法在编译阶段建立细粒度依赖追踪 |
| RPC | Remote Procedure Call | 使远程调用看起来像本地调用的通信协议
| 路由 | Routing | 根据 URL 或其他规则将请求分发到相应处理程序 |
| 限流 | Rate Limiting | 控制请求速率的机制，防止系统过载 |

## S

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| Saga 模式 | Saga Pattern | 管理长事务的分布式事务模式，通过补偿操作实现一致性 |
| 无服务器 | Serverless | 无需管理服务器的计算模式，由云提供商自动管理基础设施 |
| 服务端渲染 | Server-Side Rendering (SSR) | 在服务器端生成 HTML 的渲染方式 |
| 单一职责 | Single Responsibility Principle | 一个类应该只有一个引起变化的原因 |
| 依赖倒置 | SOLID | 五项面向对象设计原则的首字母缩写 |
| SQL | Structured Query Language | 用于管理关系数据库的标准语言 |
| 静态站点生成 | Static Site Generation (SSG) | 构建时生成静态 HTML 的技术 |
| 流式处理 | Stream Processing | 持续处理无界数据流的计算模式 |
| 结构化子类型 | Structural Subtyping | 基于类型的结构形状而非显式声明来决定子类型关系的原则，TypeScript 的类型系统即以此为核心 |
| 信号 | Signal | 响应式编程中的核心原语，持有值并在值变化时通知订阅者，是细粒度响应式的基础 |
| 代码片段 | Snippet | Svelte 5 引入的可复用模板片段机制，用于在组件间共享渲染块 |
| 源映射 | Source Map | 映射编译后代码与原始源代码位置关系的元数据文件，用于调试 |
| 存储 | Store (Svelte 4 Legacy) | Svelte 4 中基于可观察对象模式的状态管理原语，在 Svelte 5 中被 Runes 取代 |
| 流式服务端渲染 | Streaming SSR | 服务端将 HTML 流式传输到浏览器的技术，允许在数据就绪前逐步渲染页面内容 |
| Svelte 全栈框架 | SvelteKit | 基于 Svelte 的全栈 Web 应用框架，提供路由、服务端渲染、表单处理等能力 |

## T

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| Temporal API | Temporal API | ECMAScript 2026 引入的新一代日期时间 API，旨在彻底解决 `Date` 对象的设计缺陷，提供不可变的、时区感知的时间对象 |
| TurboModule | TurboModule | React Native 新架构中的按需加载原生模块，基于 JSI 支持同步方法调用 |
| 节流 | Throttling | 限制函数执行频率的技术 |
| 时间复杂度 | Time Complexity | 算法执行时间随输入规模增长的变化趋势 |
| 事务 | Transaction | 作为单个逻辑工作单元执行的一系列操作 |
| 树摇优化 | Tree Shaking | 通过静态分析消除未使用导出模块的编译优化技术 |
| 树形结构 | Tree Structure | 由节点组成的层次数据结构 |
| tsgo | tsgo | TypeScript 7.0 基于 Go 重写的编译器命令行工具，是 Project Corsa 的主要交付物，预期取代现有的 Node.js 版 `tsc` |
| 类型擦除 | Type Erasure | 在编译阶段移除类型标注，使生成的运行时代码保持纯 JavaScript/ECMAScript 的编译策略 |
| 类型守卫 | Type Guard | TypeScript 中用于缩小类型的运行时检查 |
| 类型推断 | Type Inference | 编译器自动推导变量类型的能力 |
| WASI | WebAssembly System Interface | WebAssembly 的系统接口标准，提供跨平台的文件、网络和时钟等系统调用抽象 |
| WasmEdge | WasmEdge | CNCF 沙箱项目，高性能 WebAssembly 运行时，支持 AI 推理插件和边缘部署 |
| Wasmtime | Wasmtime | Bytecode Alliance 官方的 WebAssembly 运行时，Rust 编写，支持 WASI Preview 2 |
| wasm-bindgen | wasm-bindgen | Rust 的 WebAssembly 绑定生成工具，自动生成 JS 胶水代码和 TypeScript 类型定义 |
| TypeScript | TypeScript | JavaScript 的超集，添加了静态类型系统 |
| 类型剥离 | Type Stripping | Node.js 原生支持的一种执行 TypeScript 的方式，通过直接剥离类型语法而不进行完整类型检查来运行 `.ts` 文件 |
| Token 级可观测性 | Token-level Observability | 对 AI 模型每次调用的 Token 消耗、延迟、成本进行精细化监控和分析 | |
| TurboModule | TurboModule | React Native 新架构中的按需加载原生模块，基于 JSI 支持同步方法调用 |
| Turso / libSQL | Turso / libSQL | Turso 是基于 libSQL（SQLite 的分支）的边缘托管数据库服务，专为全球低延迟数据访问设计 |

## U

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 单元测试 | Unit Testing | 对软件中最小可测试单元进行验证的测试方法 |
| 统一资源定位符 | URL (Uniform Resource Locator) | 标识互联网上资源位置的地址 |
| UTC | Coordinated Universal Time | 协调世界时，全球时间的标准 |

## V

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 虚拟 DOM | Virtual DOM | 真实 DOM 的内存表示，用于优化渲染性能 |
| V8 引擎 | V8 Engine | Google 开发的高性能 JavaScript 引擎 |
| 变量提升 | Hoisting | JavaScript 将声明移到作用域顶部的行为 |
| 语义版本控制 | Semantic Versioning (SemVer) | 使用 MAJOR.MINOR.PATCH 格式的版本号规范 |

## W

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| Web 组件 | Web Components | 浏览器原生支持的组件化技术，包括 Custom Elements、Shadow DOM 等 |
| WebAssembly | WebAssembly (Wasm) | 一种可以在现代 Web 浏览器中运行的二进制指令格式 |
| Webpack | Webpack | 现代 JavaScript 应用程序的静态模块打包工具 |
| WebSocket | WebSocket | 在单个 TCP 连接上提供全双工通信的协议 |
| Worker 线程 | Web Worker | 在后台线程中运行 JavaScript 的机制 |
| WinterTC / TC55 | WinterTC / TC55 | ECMA TC55 技术委员会，负责制定 Minimum Common Web API 标准，推动边缘运行时兼容性的标准化工作 | |

---

## 📚 缩写对照表

| 缩写 | 全称 | 中文 |
|------|------|------|
| API | Application Programming Interface | 应用程序编程接口 |
| AST | Abstract Syntax Tree | 抽象语法树 |
| BFF | Backend For Frontend | 为前端服务的后端 |
| CI/CD | Continuous Integration/Deployment | 持续集成/部署 |
| CORS | Cross-Origin Resource Sharing | 跨域资源共享 |
| CRUD | Create, Read, Update, Delete | 增删改查 |
| CSP | Content Security Policy | 内容安全策略 |
| CSS | Cascading Style Sheets | 层叠样式表 |
| CSRF | Cross-Site Request Forgery | 跨站请求伪造 |
| DCE | Dead Code Elimination | 死代码消除 |
| DDD | Domain-Driven Design | 领域驱动设计 |
| DOM | Document Object Model | 文档对象模型 |
| DSL | Domain-Specific Language | 领域特定语言 |
| HOC | Higher-Order Component | 高阶组件 |
| IIFE | Immediately Invoked Function Expression | 立即执行函数表达式 |
| IR | Intermediate Representation | 中间表示 |
| JWT | JSON Web Token | JSON 网络令牌 |
| LCP | Largest Contentful Paint | 最大内容绘制 |
| LSP | Language Server Protocol | 语言服务器协议 |
| LSP | Liskov Substitution Principle | 里氏替换原则 |
| MVC | Model-View-Controller | 模型-视图-控制器 |
| MVVM | Model-View-ViewModel | 模型-视图-视图模型 |
| npm | Node Package Manager | Node 包管理器 |
| ORM | Object-Relational Mapping | 对象关系映射 |
| SEO | Search Engine Optimization | 搜索引擎优化 |
| SIMD | SIMD | WebAssembly 的 128 位单指令多数据扩展，用于加速向量计算和图像处理 |
| SOLID | Single, Open/Closed, Liskov, Interface, Dependency | 五大设计原则 |
| SPA | Single Page Application | 单页应用 |
| SSR | Server-Side Rendering | 服务端渲染 |
| TLS | Transport Layer Security | 传输层安全 |
| XSS | Cross-Site Scripting | 跨站脚本攻击 |

---

## 🔄 术语更新记录

| 日期 | 更新内容 |
|------|----------|
| 2026-04-04 | 创建初始术语表，包含 A-Z 分类和缩写对照 |
| 2026-04-19 | 新增 AI Agent、现代认证、ORM、可观测性、前端工程相关术语（共 20 条） |
| 2026-04-17 | 补充 v4.0 语义模型与编译工程相关术语 |
| 2026-04-21 | 补充语言核心系统相关术语：TDZ、Completion Record、Agent、Realm、Job Queue、尾调用优化(TCO)、V8 隐藏类、内联缓存 |
| 2026-05-02 | 新增 Svelte Signals 编译器生态相关术语（共 23 条），覆盖编译器、响应式原语、Svelte 特定 API 及全栈能力 |
| 2026-05-07 | 新增 7 个独立深度专题术语（共 17 条），覆盖 Edge Runtime、数据库层/ORM、AI-Native、Server-First、Lit Web Components |
| 2026-05-07 | 新增移动端跨平台专题术语（共 8 条）：OTA、TurboModule、JSI、Hermes、EAS、Capacitor、Fabric、FlashList |
| 2026-05-07 | 新增 WebAssembly 深度专题术语（共 7 条）：WASI、Component Model、Wasmtime、WasmEdge、JSPI、wasm-bindgen、SIMD |
| 2026-05-07 | 统一 14 个深度专题的交叉引用体系，修复 state-management 首页的代码围栏语法错误 |

---

**使用说明**：

1. 在文档中首次使用专业术语时，建议同时提供中英文
2. 遵循本术语表的标准译名，确保文档一致性
3. 如需添加新术语，请按字母顺序插入并更新目录
