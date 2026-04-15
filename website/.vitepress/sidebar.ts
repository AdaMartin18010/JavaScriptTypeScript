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
      ]
    },
    {
      text: '🔧 后端与工具',
      collapsed: false,
      items: [
        { text: '🗄️ ORM/数据库', link: '/categories/orm-database' },
        { text: '🧪 测试', link: '/categories/testing' },
        { text: '🛠️ Linting', link: '/categories/linting-formatting' },
        { text: '🔐 后端框架', link: '/categories/backend-frameworks' },
      ]
    }
  ]
}
