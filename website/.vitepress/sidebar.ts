import { DefaultTheme } from 'vitepress'

export const sidebar: DefaultTheme.Sidebar = {
  // 指南部分
  '/guide/': [
    {
      text: '开始',
      items: [
        { text: '快速开始', link: '/guide/getting-started' },
        { text: '贡献指南', link: '/guide/contributing' },
      ]
    },
    {
      text: '开发指南',
      collapsed: false,
      items: [
        { text: 'CSS-in-JS 完整指南', link: '/guide/css-in-js-styling' },
        { text: '现代 CSS 架构指南', link: '/guide/modern-css-architecture-guide' },
        { text: '测试策略指南', link: '/guide/testing-strategy-guide' },
        { text: '日期时间处理完全指南', link: '/guide/date-time-handling' },
        { text: '调试与故障排查指南', link: '/guide/debugging-troubleshooting' },
        { text: '文件处理完整指南', link: '/guide/file-handling' },
        { text: 'GraphQL 完全指南', link: '/guide/graphql-complete-guide' },
        { text: '网络编程完全指南', link: '/guide/network-programming' },
        { text: '正则表达式完全指南', link: '/guide/regular-expressions-complete' },
      ]
    },
    {
      text: '架构与运维',
      collapsed: false,
      items: [
        { text: '微服务架构完整指南', link: '/guide/microservices-complete-guide' },
        { text: 'Edge-First 架构指南', link: '/guide/edge-first-architecture-guide' },
        { text: '性能优化指南', link: '/guide/performance-optimization-guide' },
        { text: 'API 设计模式指南', link: '/guide/api-design-patterns-guide' },
        { text: '数据库迁移指南', link: '/guide/database-migration-guide' },
        { text: '迁移指南合集', link: '/guide/migration-guides' },
        { text: 'TanStack Start + Cloudflare 部署指南', link: '/guide/tanstack-start-cloudflare-deployment' },
      ]
    },
    {
      text: '语言核心与运行时',
      collapsed: false,
      items: [
        { text: 'TypeScript 高级模式指南', link: '/guide/typescript-advanced-patterns' },
        { text: '2026-2027 架构与框架趋势', link: '/guide/architecture-trends-2027-guide' },
        { text: 'Web APIs 完全指南', link: '/guide/web-apis-guide' },
        { text: 'Node.js 核心模块指南', link: '/guide/nodejs-core-modules-guide' },
      ]
    },
    {
      text: 'AI 与前沿开发',
      collapsed: false,
      items: [
        { text: 'AI-Native 开发完全指南', link: '/guide/ai-native-development' },
        { text: 'AI SDK 与 Mastra 开发指南', link: '/guide/ai-sdk-guide' },
        { text: 'MCP 协议实战指南', link: '/guide/mcp-guide' },
        { text: 'WebAssembly 完全指南', link: '/guide/webassembly-guide' },
        { text: '浏览器 APIs 2026', link: '/guide/browser-apis-2026' },
      ]
    }
  ],

  // 学习路径部分
  '/learning-paths/': [
    {
      text: '学习路径',
      items: [
        { text: '初学者路径', link: '/learning-paths/beginners-path' },
        { text: '进阶者路径', link: '/learning-paths/intermediate-path' },
        { text: '高级路径', link: '/learning-paths/advanced-path' },
      ]
    }
  ],

  // 代码实验室部分
  '/code-lab/': [
    {
      text: '🧪 代码实验室',
      items: [
        { text: '实验室首页', link: '/code-lab/' },
        { text: '语言核心 (00-09)', link: '/code-lab/language-core' },
        { text: '工程与生态 (10-39)', link: '/code-lab/engineering-ecosystem' },
        { text: '运行时与架构 (50-54)', link: '/code-lab/runtime-architecture' },
        { text: 'AI 与前沿 (33, 55-56, 82, 94)', link: '/code-lab/ai-frontier' },
        { text: '分布式与企业 (59, 61-75)', link: '/code-lab/distributed-enterprise' },
        { text: '理论深度 (40-41, 77-81)', link: '/code-lab/theoretical-depth' },
        { text: '实验室专题 (90-96)', link: '/code-lab/specialized-labs' },
        { text: '⚡ Svelte Signals 实验室', link: '/code-lab/svelte-signals-lab' },
        { text: '🧪 语言核心实验室', link: '/code-lab/language-core-lab' },
        { text: '🧪 异步并发实验室', link: '/code-lab/async-concurrency-lab' },
        { text: '🧪 类型系统实验室', link: '/code-lab/type-system-lab' },
        { text: 'λ Lambda演算实验室', link: '/code-lab/lab-00-lambda-calculus' },
        { text: '⚙️ 操作语义实验室', link: '/code-lab/lab-00-operational-semantics' },
        { text: '📦 工程环境实验室', link: '/code-lab/lab-01-basic-setup' },
        { text: '🔍 类型推断实验室', link: '/code-lab/lab-01-type-inference' },
        { text: '📐 类型系统实验室', link: '/code-lab/lab-01-types' },
        { text: '🧮 公理语义实验室', link: '/code-lab/lab-02-axiomatic-semantics' },
        { text: '🌐 Server Functions实验室', link: '/code-lab/lab-02-server-functions' },
        { text: '📊 子类型关系实验室', link: '/code-lab/lab-02-subtyping' },
        { text: '💾 变量系统实验室', link: '/code-lab/lab-02-variables' },
        { text: '🔐 认证授权实验室', link: '/code-lab/lab-03-auth' },
        { text: '🔄 控制流实验室', link: '/code-lab/lab-03-control-flow' },
        { text: '🏗️ Mini TS编译器实验室', link: '/code-lab/lab-03-mini-typescript' },
      ]
    }
  ],

  // 分类部分
  '/categories/': [
    {
      text: '📦 前端核心',
      collapsed: false,
      items: [
        { text: '🖥️ 前端框架', link: '/categories/frontend-frameworks' },
        { text: '🎨 UI组件库', link: '/categories/ui-component-libraries' },
        { text: '⚡ 构建工具', link: '/categories/build-tools' },
        { text: '📊 数据可视化', link: '/categories/data-visualization' },
        { text: '🗂️ 状态管理', link: '/categories/state-management' },
        { text: '🛣️ 路由', link: '/categories/routing' },
        { text: '🎵 音视频处理', link: '/categories/audio-video' },
        { text: '🎬 动画', link: '/categories/animation' },
        { text: '🗺️ 地图与可视化', link: '/categories/mapping-visualization' },
        { text: '⚛️ 微前端', link: '/categories/micro-frontends' },
      ]
    },
    {
      text: '🛠️ 工程化',
      collapsed: false,
      items: [
        { text: '🎭 SSR/Meta框架', link: '/categories/ssr-meta-frameworks' },
        { text: '📝 表单处理', link: '/categories/form-handling' },
        { text: '✅ 验证', link: '/categories/validation' },
        { text: '🎨 样式处理', link: '/categories/styling' },
        { text: '🛠️ Linting', link: '/categories/linting-formatting' },
      ]
    },
    {
      text: '🔧 后端与数据',
      collapsed: false,
      items: [
        { text: '🔐 后端框架', link: '/categories/backend-frameworks' },
        { text: '📡 API 开发', link: '/categories/api-development' },
        { text: '🗄️ 数据库与存储', link: '/categories/databases' },
        { text: '🗄️ ORM/数据库', link: '/categories/orm-database' },
        { text: '⚡ 实时通信', link: '/categories/real-time-communication' },
        { text: '🧪 测试', link: '/categories/testing' },
        { text: '🔗 测试生态', link: '/categories/testing-ecosystem' },
      ]
    },
    {
      text: '🤖 AI 与前沿',
      collapsed: false,
      items: [
        { text: '🤖 AI/ML 基础设施', link: '/categories/ai-agent-infrastructure' },
      ]
    },
    {
      text: '🦀 Rust 工具链与构建',
      collapsed: false,
      items: [
        { text: '🦀 Rust 工具链全景', link: '/categories/rust-toolchain' },
        { text: '⚡ 构建工具对比', link: '/comparison-matrices/build-tools-compare' },
        { text: '🔧 JS/TS 编译器对比', link: '/comparison-matrices/js-ts-compilers-compare' },
      ]
    },
    {
      text: '📐 语言核心',
      collapsed: false,
      items: [
        { text: '🔷 TypeScript 语言全景', link: '/categories/typescript-language' },
        { text: '⚡ 性能工程与优化', link: '/categories/performance-engineering' },
      ]
    },
    {
      text: '📱 跨平台与新兴技术',
      collapsed: false,
      items: [
        { text: '📱 移动端开发', link: '/categories/mobile-development' },
        { text: '💻 桌面应用开发', link: '/categories/desktop-development' },
        { text: '🔷 WebAssembly', link: '/categories/webassembly' },
        { text: '🚀 TanStack Start', link: '/categories/tanstack-start' },
      ]
    },
    {
      text: '🔩 运维与工程基建',
      collapsed: false,
      items: [
        { text: '🔍 可观测性与监控', link: '/categories/error-monitoring-logging' },
        { text: '🔄 CI/CD 与 DevOps', link: '/categories/ci-cd-devops' },
        { text: '📦 Monorepo 工具', link: '/categories/monorepo-tools' },
        { text: '📦 包管理器', link: '/categories/package-managers' },
        { text: '🚀 部署与托管平台', link: '/categories/deployment-hosting' },
        { text: '🛡️ 安全与认证', link: '/categories/security-compliance' },
      ]
    }
  ],

  // 对比矩阵部分
  '/comparison-matrices/': [
    {
      text: '📊 对比矩阵',
      collapsed: false,
      items: [
        { text: '📋 对比矩阵导航', link: '/comparison-matrices/' },
        { text: '🖥️ 前端框架对比', link: '/comparison-matrices/frontend-frameworks-compare' },
        { text: '🔐 后端框架对比', link: '/comparison-matrices/backend-frameworks-compare' },
        { text: '🎭 SSR 元框架对比', link: '/comparison-matrices/ssr-metaframeworks-compare' },
        { text: '⚡ 构建工具对比', link: '/comparison-matrices/build-tools-compare' },
        { text: '🔧 JS/TS 编译器对比', link: '/comparison-matrices/js-ts-compilers-compare' },
        { text: '🏃 运行时对比', link: '/comparison-matrices/runtime-compare' },
        { text: '🌐 Edge 平台对比', link: '/comparison-matrices/edge-platforms-compare' },
        { text: '🗄️ ORM 对比', link: '/comparison-matrices/orm-compare' },
        { text: '🗂️ 状态管理对比', link: '/comparison-matrices/state-management-compare' },
        { text: '🧪 测试工具对比', link: '/comparison-matrices/testing-compare' },
        { text: '🎨 UI 库对比', link: '/comparison-matrices/ui-libraries-compare' },
        { text: '📦 包管理器对比', link: '/comparison-matrices/package-managers-compare' },
        { text: '📦 Monorepo 工具对比', link: '/comparison-matrices/monorepo-tools-compare' },
        { text: '🔍 可观测性工具对比', link: '/comparison-matrices/observability-tools-compare' },
        { text: '🚀 部署平台对比', link: '/comparison-matrices/deployment-platforms-compare' },
        { text: '🔄 CI/CD 工具对比', link: '/comparison-matrices/ci-cd-tools-compare' },
        { text: '🤖 AI 编码助手对比', link: '/comparison-matrices/ai-tools-compare' },
        { text: '🌐 浏览器兼容性矩阵', link: '/comparison-matrices/browser-compatibility-compare' },
        { text: '🗄️ 数据库对比矩阵', link: '/comparison-matrices/databases-compare' },
        { text: '📡 API 范式对比矩阵', link: '/comparison-matrices/api-paradigms-compare' },
        { text: '⚡ 性能工具对比矩阵', link: '/comparison-matrices/performance-tools-compare' },
        { text: '🔷 TypeScript 编译器对比矩阵', link: '/comparison-matrices/typescript-compilers-compare' },
        { text: '🎨 CSS 框架对比矩阵', link: '/comparison-matrices/css-frameworks-compare' },
      ]
    }
  ],

  // 设计模式部分
  '/patterns/': [
    {
      text: '🎨 设计模式',
      collapsed: false,
      items: [
        { text: 'React 设计模式', link: '/patterns/react-patterns' },
        { text: 'Vue 3 设计模式', link: '/patterns/vue-patterns' },
        { text: 'Node.js 设计模式', link: '/patterns/nodejs-patterns' },
        { text: '测试模式', link: '/patterns/testing-patterns' },
      ]
    }
  ],

  // 跨平台开发部分
  '/platforms/': [
    {
      text: '📱 跨平台开发',
      collapsed: false,
      items: [
        { text: '数据可视化', link: '/platforms/data-visualization' },
        { text: '桌面应用开发', link: '/platforms/desktop-development' },
        { text: '移动端开发', link: '/platforms/mobile-development' },
      ]
    }
  ],

  // 速查表部分
  '/cheatsheets/': [
    {
      text: '📋 速查表',
      collapsed: false,
      items: [
        { text: '速查表首页', link: '/cheatsheets/' },
        { text: 'TypeScript 速查表', link: '/cheatsheets/typescript-cheatsheet' },
      ]
    }
  ],

  // 架构图部分
  '/diagrams/': [
    {
      text: '📐 架构图与流程图',
      collapsed: false,
      items: [
        { text: '架构图首页', link: '/diagrams/' },
        { text: 'CI/CD 流水线', link: '/diagrams/ci-cd-pipeline' },
        { text: '数据库事务流程', link: '/diagrams/database-transaction-flow' },
        { text: 'ECMAScript 演进时间线', link: '/diagrams/ecmascript-timeline' },
        { text: 'Event Loop 架构对比', link: '/diagrams/event-loop-comparison' },
        { text: 'Event Loop 详细流程', link: '/diagrams/event-loop-detailed' },
        { text: '渐进类型系统精度格', link: '/diagrams/gradual-typing-lattice' },
        { text: 'JS 执行模型', link: '/diagrams/js-execution-model' },
        { text: 'JWT 认证流程', link: '/diagrams/jwt-authentication-flow' },
        { text: '微服务模式', link: '/diagrams/microservices-patterns' },
        { text: '模块解析流程', link: '/diagrams/module-resolution-flow' },
        { text: 'Node.js require 流程', link: '/diagrams/node-js-require-flow' },
        { text: '项目知识图谱', link: '/diagrams/project-knowledge-graph' },
        { text: 'Promise 状态机', link: '/diagrams/promise-state-machine' },
        { text: 'React Fiber 架构', link: '/diagrams/react-fiber-architecture' },
        { text: 'TS 编译器架构', link: '/diagrams/typescript-compiler-architecture' },
        { text: '类型系统层次', link: '/diagrams/type-system-hierarchy' },
        { text: 'Webpack 构建流程', link: '/diagrams/webpack-build-flow' },
        { text: '语言核心知识图谱', link: '/diagrams/language-core-knowledge-graph' },
        { text: '生态全景图谱', link: '/diagrams/ecosystem-landscape-graph' },
        { text: '工程实践图谱', link: '/diagrams/engineering-practices-graph' },
      ]
    }
  ],

  // 研究报告部分
  '/research/': [
    {
      text: '📑 研究报告',
      collapsed: false,
      items: [
        { text: '研究报告首页', link: '/research/' },
        { text: 'Awesome-JavaScript 分析', link: '/research/awesome-javascript-analysis' },
        { text: 'Awesome-NodeJS 分析', link: '/research/awesome-nodejs-analysis' },
        { text: '国际权威资源报告', link: '/research/international-resources' },
      ]
    }
  ],

  // Svelte Signals 编译器生态专题（顶层）
  '/svelte-signals-stack/': [
    {
      text: '📘 Svelte Signals 编译器生态',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/svelte-signals-stack/' },
      ]
    },
    {
      text: '核心架构',
      collapsed: false,
      items: [
        { text: '01. Compiler Signals 架构', link: '/svelte-signals-stack/01-compiler-signals-architecture' },
        { text: '02. Svelte 5 Runes 深度指南', link: '/svelte-signals-stack/02-svelte-5-runes' },
        { text: '14. 响应式系统深度原理', link: '/svelte-signals-stack/14-reactivity-deep-dive' },
        { text: '18. SSR 与 Hydration 原理', link: '/svelte-signals-stack/18-ssr-hydration-internals' },
      ]
    },
    {
      text: '全栈开发',
      collapsed: false,
      items: [
        { text: '03. SvelteKit 全栈框架', link: '/svelte-signals-stack/03-sveltekit-fullstack' },
        { text: '04. TypeScript 编译运行时', link: '/svelte-signals-stack/04-typescript-svelte-runtime' },
        { text: '05. Vite + pnpm 构建集成', link: '/svelte-signals-stack/05-vite-pnpm-integration' },
        { text: '06. Edge 同构运行时', link: '/svelte-signals-stack/06-edge-isomorphic-runtime' },
      ]
    },
    {
      text: '语言与语义',
      collapsed: false,
      items: [
        { text: '12. Svelte 语言完全参考', link: '/svelte-signals-stack/12-svelte-language-complete' },
        { text: '13. 组件开发模式大全', link: '/svelte-signals-stack/13-component-patterns' },
      ]
    },
    {
      text: '生态与实践',
      collapsed: false,
      items: [
        { text: '07. 生态工具链', link: '/svelte-signals-stack/07-ecosystem-tools' },
        { text: '08. 生产实践', link: '/svelte-signals-stack/08-production-practices' },
        { text: '09. 迁移指南', link: '/svelte-signals-stack/09-migration-guide' },
      ]
    },
    {
      text: '应用与决策',
      collapsed: false,
      items: [
        { text: '10. 框架对比矩阵', link: '/svelte-signals-stack/10-framework-comparison' },
        { text: '15. 应用领域与场景决策', link: '/svelte-signals-stack/15-application-scenarios' },
        { text: '11. 2026-2028 路线图', link: '/svelte-signals-stack/11-roadmap-2027' },
        { text: '19. 前沿动态追踪', link: '/svelte-signals-stack/19-frontier-tracking' },
      ]
    },
    {
      text: '学习体系',
      collapsed: false,
      items: [
        { text: '16. 渐进式学习阶梯', link: '/svelte-signals-stack/16-learning-ladder' },
        { text: '17. 知识图谱与思维工具', link: '/svelte-signals-stack/17-knowledge-graph' },
      ]
    },
    {
      text: '相关资源',
      collapsed: true,
      items: [
        { text: '前端框架生态', link: '/categories/frontend-frameworks' },
        { text: '前端框架对比矩阵', link: '/comparison-matrices/frontend-frameworks-compare' },
        { text: 'SSR 元框架对比', link: '/comparison-matrices/ssr-metaframeworks-compare' },
        { text: '构建工具生态', link: '/categories/build-tools' },
        { text: 'Edge-First 架构', link: '/guide/edge-first-architecture-guide' },
      ]
    }
  ],

  // TypeScript 类型系统深度专题（顶层）
  '/typescript-type-system/': [
    {
      text: '🔷 TypeScript 类型系统深度专题',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/typescript-type-system/' },
        { text: '01. 类型系统基础', link: '/typescript-type-system/01-type-system-fundamentals' },
        { text: '02. 原始类型深度', link: '/typescript-type-system/02-primitive-types' },
        { text: '03. 对象类型', link: '/typescript-type-system/03-object-types' },
        { text: '04. 函数类型', link: '/typescript-type-system/04-function-types' },
        { text: '05. 泛型深度', link: '/typescript-type-system/05-generics-deep-dive' },
        { text: '06. 条件类型', link: '/typescript-type-system/06-conditional-types' },
        { text: '07. 映射类型', link: '/typescript-type-system/07-mapped-types' },
        { text: '08. 模板字面量类型', link: '/typescript-type-system/08-template-literal-types' },
        { text: '09. 类型推断算法', link: '/typescript-type-system/09-type-inference' },
        { text: '10. 类型兼容性', link: '/typescript-type-system/10-type-compatibility' },
        { text: '11. 内置工具类型', link: '/typescript-type-system/11-utility-types' },
        { text: '12. 类型体操', link: '/typescript-type-system/12-type-challenges' },
        { text: '13. 高级模式', link: '/typescript-type-system/13-advanced-patterns' },
        { text: '14. 声明合并', link: '/typescript-type-system/14-declaration-merging' },
        { text: '15. 装饰器类型系统', link: '/typescript-type-system/15-decorators-types' },
        { text: '16. tsconfig 深度指南', link: '/typescript-type-system/16-tsconfig-deep-dive' },
        { text: '17. 类型系统性能优化', link: '/typescript-type-system/17-performance-optimization' },
        { text: '18. 编译器内部原理', link: '/typescript-type-system/18-type-system-internals' },
      ]
    }
  ],

  // JavaScript 模块系统深度专题（顶层）
  '/module-system/': [
    {
      text: '📦 JavaScript 模块系统深度专题',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/module-system/' },
        { text: '01. ESM 基础', link: '/module-system/01-esm-fundamentals' },
        { text: '02. CJS 内部机制', link: '/module-system/02-cjs-internals' },
        { text: '03. ESM/CJS 互操作', link: '/module-system/03-esm-cjs-interop' },
        { text: '04. Import Attributes', link: '/module-system/04-import-attributes' },
        { text: '05. 循环依赖', link: '/module-system/05-circular-dependencies' },
        { text: '06. 模块解析算法', link: '/module-system/06-module-resolution' },
        { text: '07. 打包器模块图', link: '/module-system/07-bundler-module-graph' },
        { text: '08. Defer & Import Maps', link: '/module-system/08-defer-module-scripts' },
      ]
    }
  ],

  // 理论体系专题：编程原理
  '/programming-principles/': [
    {
      text: '🔬 编程原理',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/programming-principles/' },
        { text: '01. 计算思维', link: '/programming-principles/01-computational-thinking' },
        { text: '02. λ演算', link: '/programming-principles/02-lambda-calculus' },
        { text: '03. 类型论基础', link: '/programming-principles/03-type-theory-fundamentals' },
        { text: '04. 操作语义', link: '/programming-principles/04-operational-semantics' },
        { text: '05. 指称语义', link: '/programming-principles/05-denotational-semantics' },
        { text: '06. 公理化语义', link: '/programming-principles/06-axiomatic-semantics' },
        { text: '07. 抽象解释', link: '/programming-principles/07-abstract-interpretation' },
        { text: '08. 内存模型', link: '/programming-principles/08-memory-models' },
        { text: '09. 并发模型', link: '/programming-principles/09-concurrency-models' },
        { text: '10. 代数效应', link: '/programming-principles/10-algebraic-effects' },
        { text: '11. 线性逻辑与所有权', link: '/programming-principles/11-linear-logic-ownership' },
        { text: '12. 续体语义', link: '/programming-principles/12-continuation-semantics' },
        { text: '13. 渐进类型', link: '/programming-principles/13-gradual-typing-theory' },
        { text: '14. 依赖类型', link: '/programming-principles/14-dependent-types-future' },
        { text: '15. 从原理到实践', link: '/programming-principles/15-principles-to-practice' },
      ]
    }
  ],

  // 理论体系专题：UI原理
  '/ui-principles/': [
    {
      text: '🎨 UI原理',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/ui-principles/' },
        { text: '01. 人机交互基础', link: '/ui-principles/01-hci-foundations' },
        { text: '02. 视觉感知', link: '/ui-principles/02-visual-perception' },
        { text: '03. 认知负荷理论', link: '/ui-principles/03-cognitive-load-theory' },
        { text: '04. 交互设计定律', link: '/ui-principles/04-interaction-design-laws' },
        { text: '05. 设计系统理论', link: '/ui-principles/05-design-systems-theory' },
        { text: '06. 排版与布局', link: '/ui-principles/06-typography-layout-grid' },
        { text: '07. 动效原理', link: '/ui-principles/07-motion-animation-principles' },
        { text: '08. 可访问性理论', link: '/ui-principles/08-accessibility-theory' },
        { text: '09. 响应式与自适应', link: '/ui-principles/09-responsive-adaptive-theory' },
        { text: '10. UI状态模型', link: '/ui-principles/10-ui-state-models' },
        { text: '11. 反馈循环', link: '/ui-principles/11-feedback-loops-ux' },
        { text: '12. 跨文化UI', link: '/ui-principles/12-cross-cultural-ui' },
      ]
    }
  ],

  // 理论体系专题：编程范式
  '/programming-paradigms/': [
    {
      text: '⚡ 编程范式',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/programming-paradigms/' },
        { text: '01. 范式总论', link: '/programming-paradigms/01-paradigm-overview' },
        { text: '02. 命令式范式', link: '/programming-paradigms/02-imperative-paradigm' },
        { text: '03. 结构化编程', link: '/programming-paradigms/03-structured-programming' },
        { text: '04. 函数式范式', link: '/programming-paradigms/04-functional-paradigm' },
        { text: '05. OOP范式', link: '/programming-paradigms/05-oop-paradigm' },
        { text: '06. 逻辑与约束式', link: '/programming-paradigms/06-logic-constraint-paradigm' },
        { text: '07. 反应式范式', link: '/programming-paradigms/07-reactive-paradigm' },
        { text: '08. 并发范式', link: '/programming-paradigms/08-concurrent-paradigm' },
        { text: '09. 数据流范式', link: '/programming-paradigms/09-dataflow-paradigm' },
        { text: '10. 元编程范式', link: '/programming-paradigms/10-metaprogramming-paradigm' },
        { text: '11. 多范式设计', link: '/programming-paradigms/11-multi-paradigm-design' },
        { text: '12. 范式形式化对比', link: '/programming-paradigms/12-paradigm-formal-comparison' },
        { text: '13. 范式演化史', link: '/programming-paradigms/13-paradigm-evolution-timeline' },
        { text: '14. 范式与语言设计', link: '/programming-paradigms/14-paradigm-and-language-design' },
      ]
    }
  ],

  // 理论体系专题：框架模型
  '/framework-models/': [
    {
      text: '🏗️ 框架模型',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/framework-models/' },
        { text: '01. 组件模型理论', link: '/framework-models/01-component-model-theory' },
        { text: '02. 虚拟DOM理论', link: '/framework-models/02-virtual-dom-theory' },
        { text: '03. 响应式与信号', link: '/framework-models/03-reactivity-signals-theory' },
        { text: '04. 状态管理理论', link: '/framework-models/04-state-management-theory' },
        { text: '05. 渲染模型', link: '/framework-models/05-rendering-models' },
        { text: '06. 控制反转与DI', link: '/framework-models/06-control-inversion-theory' },
        { text: '07. 模板引擎理论', link: '/framework-models/07-templating-theory' },
        { text: '08. 编译器即框架', link: '/framework-models/08-compiler-as-framework' },
        { text: '09. 元框架理论', link: '/framework-models/09-meta-framework-theory' },
        { text: '10. 服务端客户端边界', link: '/framework-models/10-server-client-boundary' },
        { text: '11. 路由与导航', link: '/framework-models/11-routing-navigation-theory' },
        { text: '12. 框架性能模型', link: '/framework-models/12-framework-performance-models' },
        { text: '13. 框架选型理论', link: '/framework-models/13-framework-selection-theory' },
        { text: '14. 框架演化模式', link: '/framework-models/14-framework-evolution-patterns' },
      ]
    }
  ],

  // 理论体系专题：应用设计
  '/application-design/': [
    {
      text: '📐 应用设计',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/application-design/' },
        { text: '01. 架构模式总览', link: '/application-design/01-architecture-patterns-overview' },
        { text: '02. 分层架构', link: '/application-design/02-layered-architecture' },
        { text: '03. 领域驱动设计', link: '/application-design/03-domain-driven-design' },
        { text: '04. 整洁架构', link: '/application-design/04-clean-architecture' },
        { text: '05. 微服务设计', link: '/application-design/05-microservices-design' },
        { text: '06. 事件驱动架构', link: '/application-design/06-event-driven-architecture' },
        { text: '07. API设计模式', link: '/application-design/07-api-design-patterns' },
        { text: '08. 数据管理模式', link: '/application-design/08-data-management-patterns' },
        { text: '09. 安全设计', link: '/application-design/09-security-by-design' },
        { text: '10. 可观测性设计', link: '/application-design/10-observability-design' },
        { text: '11. 可测试性设计', link: '/application-design/11-testability-design' },
        { text: '12. 演进式架构', link: '/application-design/12-evolutionary-architecture' },
        { text: '13. 设计系统工程化', link: '/application-design/13-design-systems-engineering' },
        { text: '14. 权衡分析框架', link: '/application-design/14-trade-off-analysis-framework' },
      ]
    }
  ],

  // 理论体系专题：层次关联总论
  '/theoretical-hierarchy/': [
    {
      text: '🔗 理论层次总论',
      collapsed: false,
      items: [
        { text: '🏠 总论首页', link: '/theoretical-hierarchy/' },
        { text: '01. L0→L1：数学到计算', link: '/theoretical-hierarchy/01-math-to-computation' },
        { text: '02. L1→L2：计算到语言', link: '/theoretical-hierarchy/02-computation-to-language' },
        { text: '03. L2→L3：语言到范式', link: '/theoretical-hierarchy/03-language-to-paradigm' },
        { text: '04. L3→L4：范式到框架', link: '/theoretical-hierarchy/04-paradigm-to-framework' },
        { text: '05. L4→L5：框架到应用', link: '/theoretical-hierarchy/05-framework-to-application' },
        { text: '06. L6 UI横向贯穿', link: '/theoretical-hierarchy/06-ui-cross-layer-theory' },
        { text: '07. 演化路径', link: '/theoretical-hierarchy/07-evolution-pathways' },
        { text: '08. 决策框架', link: '/theoretical-hierarchy/08-decision-framework' },
      ]
    }
  ],

  // 状态管理深度专题
  '/state-management/': [
    {
      text: '🗂️ 状态管理深度',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/state-management/' },
        { text: '01. 本地状态', link: '/state-management/01-local-state' },
        { text: '02. 全局状态', link: '/state-management/02-global-state' },
        { text: '03. 服务端状态', link: '/state-management/03-server-state' },
        { text: '04. 表单状态', link: '/state-management/04-form-state' },
        { text: '05. URL状态', link: '/state-management/05-url-state' },
        { text: '06. 异步状态', link: '/state-management/06-async-state' },
        { text: '07. 状态机', link: '/state-management/07-state-machines' },
        { text: '08. 状态组合模式', link: '/state-management/08-state-composition-patterns' },
        { text: '09. 状态同步', link: '/state-management/09-state-synchronization' },
        { text: '10. 状态持久化', link: '/state-management/10-state-persistence' },
        { text: '11. 状态测试策略', link: '/state-management/11-state-testing-strategies' },
        { text: '12. 状态架构对比', link: '/state-management/12-state-architecture-comparison' },
        { text: '13. 微前端状态', link: '/state-management/13-state-in-micro-frontends' },
        { text: '14. 实时协作状态', link: '/state-management/14-real-time-collaborative-state' },
        { text: '15. 状态反模式', link: '/state-management/15-state-management-anti-patterns' },
        { text: '16. Serverless状态', link: '/state-management/16-state-in-serverless-edge' },
        { text: '17. 状态调试', link: '/state-management/17-debugging-state' },
        { text: '18. 状态演化', link: '/state-management/18-state-evolution-patterns' },
        { text: '19. 状态性能优化', link: '/state-management/19-state-performance-optimization' },
        { text: '20. 状态选型指南', link: '/state-management/20-state-management-selection-guide' },
      ]
    }
  ],

  // 测试工程专题
  '/testing-engineering/': [
    {
      text: '🧪 测试工程',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/testing-engineering/' },
        { text: '01. 测试基础理论', link: '/testing-engineering/01-testing-fundamentals' },
        { text: '02. 单元测试深度', link: '/testing-engineering/02-unit-testing-deep-dive' },
        { text: '03. 集成测试', link: '/testing-engineering/03-integration-testing' },
        { text: '04. E2E测试', link: '/testing-engineering/04-e2e-testing' },
        { text: '05. 测试模式', link: '/testing-engineering/05-testing-patterns' },
        { text: '06. 视觉回归测试', link: '/testing-engineering/06-visual-regression-testing' },
        { text: '07. 变异测试', link: '/testing-engineering/07-mutation-testing' },
        { text: '08. 可访问性测试', link: '/testing-engineering/08-accessibility-testing' },
        { text: '09. 安全测试', link: '/testing-engineering/09-security-testing' },
        { text: '10. 性能测试', link: '/testing-engineering/10-performance-testing' },
        { text: '11. CI/CD测试策略', link: '/testing-engineering/11-ci-cd-testing' },
        { text: '12. 测试驱动开发', link: '/testing-engineering/12-test-driven-development' },
        { text: '13. 契约测试', link: '/testing-engineering/13-contract-testing' },
        { text: '14. 测试数据管理', link: '/testing-engineering/14-test-data-management' },
        { text: '15. 生产环境测试', link: '/testing-engineering/15-testing-in-production' },
      ]
    }
  ],

  // 性能工程专题
  '/performance-engineering/': [
    {
      text: '⚡ 性能工程',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/performance-engineering/' },
        { text: '01. 性能基础理论', link: '/performance-engineering/01-performance-fundamentals' },
        { text: '02. 渲染性能', link: '/performance-engineering/02-rendering-performance' },
        { text: '03. 打包优化', link: '/performance-engineering/03-bundle-optimization' },
        { text: '04. 内存管理', link: '/performance-engineering/04-memory-management' },
        { text: '05. 网络优化', link: '/performance-engineering/05-network-optimization' },
        { text: '06. 缓存策略', link: '/performance-engineering/06-caching-strategies' },
        { text: '07. Web Worker并行', link: '/performance-engineering/07-web-worker-parallelism' },
        { text: '08. 性能监控', link: '/performance-engineering/08-performance-monitoring' },
        { text: '09. SSR性能', link: '/performance-engineering/09-ssr-performance' },
        { text: '10. JS引擎优化', link: '/performance-engineering/10-javascript-engine-optimization' },
        { text: '11. 性能测试方法论', link: '/performance-engineering/11-performance-testing-methodology' },
        { text: '12. 性能选型指南', link: '/performance-engineering/12-performance-engineering-selection-guide' },
      ]
    }
  ],

  // 数据库与ORM专题
  '/database-orm/': [
    {
      text: '🗄️ 数据库与ORM',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/database-orm/' },
        { text: '01. 数据库基础理论', link: '/database-orm/01-database-fundamentals' },
        { text: '02. ORM深度', link: '/database-orm/02-orm-deep-dive' },
        { text: '03. 查询优化', link: '/database-orm/03-query-optimization' },
        { text: '04. 数据库迁移', link: '/database-orm/04-database-migrations' },
        { text: '05. 事务与并发', link: '/database-orm/05-transactions-concurrency' },
        { text: '06. NoSQL数据库', link: '/database-orm/06-nosql-databases' },
        { text: '07. 数据库安全', link: '/database-orm/07-database-security' },
        { text: '08. GraphQL与数据库', link: '/database-orm/08-graphql-databases' },
        { text: '09. Serverless数据库', link: '/database-orm/09-serverless-databases' },
        { text: '10. 数据库测试', link: '/database-orm/10-database-testing' },
        { text: '11. 数据库设计模式', link: '/database-orm/11-database-design-patterns' },
        { text: '12. 数据库ORM选型', link: '/database-orm/12-database-orm-selection-guide' },
      ]
    }
  ],

  // 桌面开发专题
  '/desktop-development/': [
    {
      text: '💻 桌面开发',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/desktop-development/' },
        { text: '01. 桌面开发基础', link: '/desktop-development/01-desktop-fundamentals' },
        { text: '02. Electron vs Tauri', link: '/desktop-development/02-electron-tauri-comparison' },
        { text: '03. 桌面UI框架', link: '/desktop-development/03-desktop-ui-frameworks' },
        { text: '04. 桌面安全', link: '/desktop-development/04-desktop-security' },
        { text: '05. 原生API集成', link: '/desktop-development/05-desktop-native-apis' },
        { text: '06. 打包与分发', link: '/desktop-development/06-desktop-packaging-distribution' },
        { text: '07. 桌面性能', link: '/desktop-development/07-desktop-performance' },
        { text: '08. 桌面选型指南', link: '/desktop-development/08-desktop-development-selection-guide' },
      ]
    }
  ],

  // 理论前沿专题：范畴论
  '/theoretical-foundations/': [
    {
      text: '🔬 理论前沿',
      collapsed: false,
      items: [
        { text: '🏠 专题首页', link: '/theoretical-foundations/' },
        { text: '📘 范畴论基础', link: '/theoretical-foundations/cat-01-category-theory-primer' },
        { text: '📗 笛卡尔闭范畴与TS', link: '/theoretical-foundations/cat-02-cartesian-closed-categories' },
        { text: '📕 函子与自然变换', link: '/theoretical-foundations/cat-03-functors-natural-transformations' },
        { text: '📙 Monad与代数效应', link: '/theoretical-foundations/cat-04-monads-algebraic-effects' },
        { text: '📒 极限与余极限', link: '/theoretical-foundations/cat-05-limits-colimits' },
        { text: '🧠 认知科学入门', link: '/theoretical-foundations/cog-01-cognitive-science-primer' },
        { text: '🧠 心智模型与编程', link: '/theoretical-foundations/cog-02-mental-models' },
        { text: '🧠 工作记忆负荷', link: '/theoretical-foundations/cog-03-working-memory' },
        { text: '🧠 UI框架概念模型', link: '/theoretical-foundations/cog-04-conceptual-models-ui' },
        { text: '🧠 React认知分析', link: '/theoretical-foundations/cog-05-react-algebraic-effects' },
        { text: '🔧 模型精化与仿真', link: '/theoretical-foundations/mm-01-model-refinement' },
        { text: '🔧 语义对应理论', link: '/theoretical-foundations/mm-02-semantics-correspondence' },
        { text: '🔧 类型与运行时差', link: '/theoretical-foundations/mm-03-type-runtime-difference' },
        { text: '🔧 反应式模型适配', link: '/theoretical-foundations/mm-04-reactive-adaptation' },
        { text: '🔧 多模型范畴构造', link: '/theoretical-foundations/mm-05-multi-model-category' },
        { text: '📘 伴随与自由遗忘对', link: '/theoretical-foundations/cat-06-adjunctions-free-forgetful' },
        { text: '📗 Yoneda引理', link: '/theoretical-foundations/cat-07-yoneda-lemma' },
        { text: '📕 Topos理论', link: '/theoretical-foundations/cat-08-topos-theory' },
        { text: '📙 计算范式作为范畴', link: '/theoretical-foundations/cat-09-computational-paradigms' },
        { text: '📒 Rust vs TS范畴分析', link: '/theoretical-foundations/cat-10-rust-vs-typescript' },
        { text: '📘 控制流范畴构造', link: '/theoretical-foundations/cat-11-control-flow' },
        { text: '📗 运行时范畴语义', link: '/theoretical-foundations/cat-12-runtime-semantics' },
        { text: '📕 变量系统范畴分析', link: '/theoretical-foundations/cat-13-variable-system' },
        { text: '📙 事件系统范畴语义', link: '/theoretical-foundations/cat-14-event-systems' },
        { text: '📒 并发计算模型', link: '/theoretical-foundations/cat-15-concurrent-computation' },
        { text: '📘 Server Components语义', link: '/theoretical-foundations/cat-16-server-components' },
        { text: '📗 Signals范式范畴论', link: '/theoretical-foundations/cat-17-signals-paradigm' },
        { text: '🧠 Vue响应式认知模型', link: '/theoretical-foundations/cog-06-vue-reactivity' },
        { text: '🧠 Angular架构认知负荷', link: '/theoretical-foundations/cog-07-angular-architecture' },
        { text: '🧠 渲染引擎认知感知', link: '/theoretical-foundations/cog-08-rendering-perception' },
        { text: '🧠 数据流与认知轨迹', link: '/theoretical-foundations/cog-09-data-flow' },
        { text: '🧠 异步并发认知模型', link: '/theoretical-foundations/cog-10-async-concurrency' },
        { text: '🧠 专家新手差异', link: '/theoretical-foundations/cog-11-expert-novice' },
        { text: '🔧 语义对角线论证', link: '/theoretical-foundations/mm-06-diagonal-arguments' },
        { text: '🔧 综合响应理论', link: '/theoretical-foundations/mm-07-comprehensive-response' },
        { text: '🔧 框架范式互操作', link: '/theoretical-foundations/mm-08-framework-paradigm' },
        { text: '🔧 模型间隙形式化验证', link: '/theoretical-foundations/mm-09-formal-verification' },
        { text: '🔧 统一元模型', link: '/theoretical-foundations/mm-10-unified-metamodel' },
        { text: '🔧 执行渲染三角', link: '/theoretical-foundations/mm-11-execution-triangle' },
        { text: '📘 Islands架构语义', link: '/theoretical-foundations/cat-18-islands-architecture' },
        { text: '📗 构建工具范畴论', link: '/theoretical-foundations/cat-19-build-tools' },
        { text: '📕 Web Components语义', link: '/theoretical-foundations/cat-20-web-components' },
        { text: '🧠 多模态交互理论', link: '/theoretical-foundations/cog-12-multimodal-interaction' },
        { text: '🧠 前端计算模型', link: '/theoretical-foundations/cog-13-frontend-computation' },
        { text: '🧠 浏览器渲染原理', link: '/theoretical-foundations/cog-14-browser-rendering' },
        { text: '🧠 边缘计算认知模型', link: '/theoretical-foundations/cog-15-edge-computing' },
        { text: '🧠 现代栈开发者认知', link: '/theoretical-foundations/cog-16-developer-cognitive' },
        { text: '🔧 元框架对称差', link: '/theoretical-foundations/mm-12-meta-framework' },
        { text: '🔧 统一前端架构', link: '/theoretical-foundations/mm-13-unified-frontend' },
      ]
    }
  ],

  // 模板部分
  '/templates/': [
    {
      text: '📄 文档模板',
      collapsed: false,
      items: [
        { text: '模板首页', link: '/templates/' },
        { text: '架构文档模板', link: '/templates/ARCHITECTURE_TEMPLATE' },
        { text: '理论文档模板', link: '/templates/THEORY_TEMPLATE' },
      ]
    }
  ],
}
