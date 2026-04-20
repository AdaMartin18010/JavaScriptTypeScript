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
        { text: '迁移指南合集', link: '/guide/migration-guides' },
        { text: 'TanStack Start + Cloudflare 部署指南', link: '/guide/tanstack-start-cloudflare-deployment' },
      ]
    },
    {
      text: '语言核心与运行时',
      collapsed: false,
      items: [
        { text: 'Web APIs 完全指南', link: '/guide/web-apis-guide' },
        { text: 'Node.js 核心模块指南', link: '/guide/nodejs-core-modules-guide' },
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
      text: '🔧 后端与工具',
      collapsed: false,
      items: [
        { text: '🗄️ ORM/数据库', link: '/categories/orm-database' },
        { text: '🧪 测试', link: '/categories/testing' },
        { text: '🔗 测试生态', link: '/categories/testing-ecosystem' },
        { text: '🔐 后端框架', link: '/categories/backend-frameworks' },
      ]
    },
    {
      text: '📱 跨平台与新兴技术',
      collapsed: false,
      items: [
        { text: '📱 移动端开发', link: '/categories/mobile-development' },
        { text: '🔷 WebAssembly', link: '/categories/webassembly' },
        { text: '🚀 TanStack Start', link: '/categories/tanstack-start' },
      ]
    },
    {
      text: '🔩 运维与工程基建',
      collapsed: false,
      items: [
        { text: '🔍 错误监控与日志', link: '/categories/error-monitoring-logging' },
        { text: '🔄 CI/CD 与 DevOps', link: '/categories/ci-cd-devops' },
        { text: '📦 Monorepo 工具', link: '/categories/monorepo-tools' },
        { text: '🚀 部署与托管平台', link: '/categories/deployment-hosting' },
        { text: '🛡️ 安全与合规', link: '/categories/security-compliance' },
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
        { text: '🗄️ ORM 对比', link: '/comparison-matrices/orm-compare' },
        { text: '🗂️ 状态管理对比', link: '/comparison-matrices/state-management-compare' },
        { text: '🧪 测试工具对比', link: '/comparison-matrices/testing-compare' },
        { text: '🎨 UI 库对比', link: '/comparison-matrices/ui-libraries-compare' },
        { text: '📦 包管理器对比', link: '/comparison-matrices/package-managers-compare' },
        { text: '📦 Monorepo 工具对比', link: '/comparison-matrices/monorepo-tools-compare' },
        { text: '🔍 可观测性工具对比', link: '/comparison-matrices/observability-tools-compare' },
        { text: '🚀 部署平台对比', link: '/comparison-matrices/deployment-platforms-compare' },
        { text: '🔄 CI/CD 工具对比', link: '/comparison-matrices/ci-cd-tools-compare' },
        { text: '🌐 浏览器兼容性矩阵', link: '/comparison-matrices/browser-compatibility-compare' },
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
