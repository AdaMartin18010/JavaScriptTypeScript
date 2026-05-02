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
        { text: '🌐 Edge-First 架构实战', link: '/code-lab/edge-first-architecture' },
        { text: '⚡ Svelte Signals 实验室', link: '/code-lab/svelte-signals-lab' },
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
