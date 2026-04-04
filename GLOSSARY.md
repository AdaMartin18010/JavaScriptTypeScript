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

## B

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 反向代理 | Reverse Proxy | 代表服务器接收客户端请求的中间服务器，常用于负载均衡和安全 |
| 蓝绿部署 | Blue-Green Deployment | 同时运行两套生产环境，通过切换流量实现零停机部署 |
| 背压 | Backpressure | 当生产者速度超过消费者时，用于控制数据流量的机制 |
| 边界上下文 | Bounded Context | 领域驱动设计中的核心概念，定义领域模型的适用范围 |
| 浏览器运行时 | Browser Runtime | 浏览器中执行 JavaScript 的环境，包括 V8 引擎、事件循环等 |

## C

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 命令模式 | Command Pattern | 将请求封装为对象，支持参数化、队列化和日志记录 |
| 并发 | Concurrency | 多个任务在重叠的时间段内执行，不一定同时 |
| 并行 | Parallelism | 多个任务在同一时刻同时执行，需要多核处理器 |
| 持续集成 | Continuous Integration (CI) | 频繁地将代码集成到主干并自动构建测试的实践 |
| 持续部署 | Continuous Deployment (CD) | 自动将通过测试的代码部署到生产环境的实践 |
| 缓存策略 | Caching Strategy | 控制数据缓存行为的规则，如 Cache-Aside、Write-Through 等 |
| CQRS | Command Query Responsibility Segregation | 命令查询职责分离，读写模型分离的架构模式 |

## D

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 依赖注入 | Dependency Injection (DI) | 将依赖从外部传入，而非内部创建的设计模式 |
| 依赖倒置 | Dependency Inversion Principle | 高层模块不应依赖低层模块，两者应依赖抽象 |
| 装饰器模式 | Decorator Pattern | 动态地给对象添加额外职责的设计模式 |
| 设计模式 | Design Pattern | 软件设计中常见问题的通用可复用解决方案 |
| 分布式系统 | Distributed System | 由多个通过网络通信的独立计算节点组成的系统 |
| 领域驱动设计 | Domain-Driven Design (DDD) | 以业务领域为核心的软件设计方法 |
| 数据流 | Data Flow | 数据在系统中移动和变换的路径 |

## E

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 事件循环 | Event Loop | JavaScript 运行时处理异步事件的机制 |
| 事件驱动 | Event-Driven | 通过事件的产生、检测和消费来驱动程序执行的架构 |
| 事件溯源 | Event Sourcing | 用事件序列记录状态变更，而非仅存储当前状态 |
| 事件委托 | Event Delegation | 利用事件冒泡机制，在父元素上统一处理子元素事件的技术 |
| 工厂模式 | Factory Pattern | 封装对象创建逻辑的设计模式 |

## F

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 函数式编程 | Functional Programming | 以纯函数和不可变数据为核心的编程范式 |
| 熔断器 | Circuit Breaker | 防止故障扩散的模式，当错误率超过阈值时快速失败 |
| 防抖 | Debounce | 延迟执行直到一段时间没有新触发的高频控制技术 |
| 节流 | Throttle | 限制函数执行频率的技术 |

## G

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 垃圾回收 | Garbage Collection (GC) | 自动回收不再使用的内存的机制 |
| 生成器 | Generator | 可暂停和恢复执行的函数，使用 `function*` 语法 |
| 全局状态管理 | Global State Management | 跨组件共享和管理应用状态的模式和工具 |
| GraphQL | Graph Query Language | 由 Facebook 开发的 API 查询语言，允许客户端指定所需数据 |

## H

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 高阶组件 | Higher-Order Component (HOC) | 接收组件并返回新组件的函数，用于复用组件逻辑 |
| 哈希表 | Hash Table | 通过哈希函数实现 O(1) 平均时间复杂度查找的数据结构 |

## I

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 不可变性 | Immutability | 数据一旦创建就不能更改的性质 |
| 控制反转 | Inversion of Control (IoC) | 将控制权从调用方转移到框架或容器的原则 |
| 接口隔离 | Interface Segregation Principle | 客户端不应被迫依赖它们不用的方法 |
| 迭代器模式 | Iterator Pattern | 顺序访问聚合对象元素而不暴露其内部表示的模式 |

## J

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| JSON | JavaScript Object Notation | 轻量级数据交换格式，基于 JavaScript 对象语法 |
| JIT 编译 | Just-In-Time Compilation | 在运行时将字节码编译为机器码的技术 |

## K

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 键值存储 | Key-Value Store | 以键值对形式存储数据的 NoSQL 数据库 |

## L

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 懒加载 | Lazy Loading | 延迟加载资源直到真正需要时才加载的策略 |
| 负载均衡 | Load Balancing | 将工作负载分布到多个计算资源的机制 |
| 线性一致性 | Linearizability | 并发操作看起来像是以某种顺序串行执行的强一致性模型 |

## M

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 微服务 | Microservices | 将应用拆分为小型、独立部署服务的架构风格 |
| 中间件 | Middleware | 处理请求和响应的函数，位于应用和业务逻辑之间 |
| 内存泄漏 | Memory Leak | 不再使用的内存未被回收，导致内存持续增长的问题 |
| 模块化 | Modularity | 将系统分解为独立、可替换模块的设计原则 |
| 消息队列 | Message Queue | 异步通信的中间件，实现应用间的松耦合 |
| 观察者模式 | Observer Pattern | 对象间一对多依赖关系，一个对象状态变化通知所有依赖者 |
| 单例模式 | Singleton Pattern | 确保类只有一个实例并全局访问的设计模式 |

## N

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 命名空间 | Namespace | 用于组织代码、避免命名冲突的逻辑容器 |
| 节点 | Node | 树形数据结构中的基本单元，或分布式系统中的计算单元 |
| npm | Node Package Manager | Node.js 默认的包管理工具 |

## O

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 面向对象编程 | Object-Oriented Programming (OOP) | 以对象和类为核心的编程范式 |
| 开闭原则 | Open/Closed Principle | 对扩展开放，对修改关闭的设计原则 |
| 观察者模式 | Observer Pattern | 定义对象间一对多依赖，状态变化时自动通知依赖者 |
| 乐观锁 | Optimistic Locking | 假设冲突不常发生，提交时检查版本号的并发控制策略 |
| ORM | Object-Relational Mapping | 对象与关系数据库之间的映射技术 |

## P

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 策略模式 | Strategy Pattern | 定义算法族，分别封装起来，让它们可以互相替换 |
| 代理模式 | Proxy Pattern | 为其他对象提供代理以控制访问的设计模式 |
| 管道模式 | Pipeline Pattern | 将处理流程分解为一系列独立阶段的模式 |
| Promise | Promise | 表示异步操作最终完成或失败的对象 |
| 原型模式 | Prototype Pattern | 通过复制现有对象创建新对象的模式 |
| 发布-订阅 | Pub/Sub (Publish-Subscribe) | 消息模式，发布者和订阅者通过中间件解耦 |
| PWA | Progressive Web App | 使用现代 Web 能力提供类似原生应用体验的 Web 应用 |

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
| RPC | Remote Procedure Call | 使远程调用看起来像本地调用的通信协议 |
| 路由 | Routing | 根据 URL 或其他规则将请求分发到相应处理程序 |
| 限流 | Rate Limiting | 控制请求速率的机制，防止系统过载 |

## S

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 单一职责 | Single Responsibility Principle | 一个类应该只有一个引起变化的原因 |
| 服务端渲染 | Server-Side Rendering (SSR) | 在服务器端生成 HTML 的渲染方式 |
| 静态站点生成 | Static Site Generation (SSG) | 构建时生成静态 HTML 的技术 |
| Saga 模式 | Saga Pattern | 管理长事务的分布式事务模式，通过补偿操作实现一致性 |
| 无服务器 | Serverless | 无需管理服务器的计算模式，由云提供商自动管理基础设施 |
| 流式处理 | Stream Processing | 持续处理无界数据流的计算模式 |
| 依赖倒置 | SOLID | 五项面向对象设计原则的首字母缩写 |
| SQL | Structured Query Language | 用于管理关系数据库的标准语言 |

## T

| 中文术语 | 英文术语 | 定义 |
|---------|---------|------|
| 节流 | Throttling | 限制函数执行频率的技术 |
| 时间复杂度 | Time Complexity | 算法执行时间随输入规模增长的变化趋势 |
| 树形结构 | Tree Structure | 由节点组成的层次数据结构 |
| 类型推断 | Type Inference | 编译器自动推导变量类型的能力 |
| 类型守卫 | Type Guard | TypeScript 中用于缩小类型的运行时检查 |
| 事务 | Transaction | 作为单个逻辑工作单元执行的一系列操作 |
| TypeScript | TypeScript | JavaScript 的超集，添加了静态类型系统 |

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
| DDD | Domain-Driven Design | 领域驱动设计 |
| DOM | Document Object Model | 文档对象模型 |
| DSL | Domain-Specific Language | 领域特定语言 |
| HOC | Higher-Order Component | 高阶组件 |
| IIFE | Immediately Invoked Function Expression | 立即执行函数表达式 |
| JWT | JSON Web Token | JSON 网络令牌 |
| LCP | Largest Contentful Paint | 最大内容绘制 |
| LSP | Liskov Substitution Principle | 里氏替换原则 |
| MVC | Model-View-Controller | 模型-视图-控制器 |
| MVVM | Model-View-ViewModel | 模型-视图-视图模型 |
| npm | Node Package Manager | Node 包管理器 |
| ORM | Object-Relational Mapping | 对象关系映射 |
| SEO | Search Engine Optimization | 搜索引擎优化 |
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

---

**使用说明**：

1. 在文档中首次使用专业术语时，建议同时提供中英文
2. 遵循本术语表的标准译名，确保文档一致性
3. 如需添加新术语，请按字母顺序插入并更新目录
