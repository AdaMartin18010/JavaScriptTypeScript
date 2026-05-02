import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { sidebar } from './sidebar'

// https://vitepress.dev/reference/site-config
export default withMermaid(defineConfig({
  title: 'Awesome JS/TS',
  description: '精心策划的 JavaScript/TypeScript 生态系统资源列表',
  
  // 中文站点配置
  lang: 'zh-CN',
  
  // 最后更新时间
  lastUpdated: true,
  
  // 清理URL
  cleanUrls: true,

  // 将页面元数据提取为独立 chunk，提升缓存命中率
  metaChunk: true,

  // 忽略已知的跨项目死链（指向项目源码目录的链接，这些不属于 VitePress 站点构建范围）
  ignoreDeadLinks: [
    /jsts-code-lab\//,
    /JSTS全景综述\//,
    /\/10-fundamentals\//,
    /\/20-code-lab\//,
    /\/50-examples\//,
    /\/70-theoretical-foundations\//,
    /^\.\.\/..\/10-fundamentals\//,
    /^\.\.\/..\/20-code-lab\//,
    /^\.\.\/..\/50-examples\//,
    /^\.\.\/..\/70-theoretical-foundations\//,
  ],
  
  // 元数据
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:locale', content: 'zh_CN' }],
    ['meta', { property: 'og:site_name', content: 'Awesome JS/TS Ecosystem' }],
    ['meta', { property: 'og:title', content: 'Awesome JS/TS' }],
    ['meta', { property: 'og:description', content: '精心策划的 JavaScript/TypeScript 生态系统资源列表' }],
    ['meta', { property: 'og:image', content: '/og-image.png' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Awesome JS/TS' }],
    ['meta', { name: 'twitter:description', content: '精心策划的 JavaScript/TypeScript 生态系统资源列表' }],
    ['meta', { name: 'twitter:image', content: '/og-image.png' }],
  ],

  // 主题配置
  themeConfig: {
    // 站点Logo
    logo: '/logo.svg',

    // 外链显示外部跳转图标
    externalLinkIcon: true,
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '分类', link: '/categories/frontend-frameworks' },
      { text: '对比矩阵', link: '/comparison-matrices/frontend-frameworks-compare' },
      { text: '学习路径', link: '/learning-paths/beginners-path' },
      { text: '🧪 代码实验室', link: '/code-lab/' },
      { text: '🔍 搜索', link: '/search' },
      {
        text: '更多',
        items: [
          { text: '🎨 设计模式', link: '/patterns/react-patterns' },
          { text: '📱 跨平台开发', link: '/platforms/data-visualization' },
          { text: '📋 速查表', link: '/cheatsheets/' },
          { text: '📐 架构图', link: '/diagrams/' },
          { text: '📑 研究报告', link: '/research/' },
          { text: '📄 文档模板', link: '/templates/' },
          { text: '关于', link: '/about' },
        ]
      },
    ],

    // 侧边栏
    sidebar,

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/AdaMartin18010/JavaScriptTypeScript' }
    ],

    // 搜索配置
    search: {
      provider: 'local',
      options: {
        locales: {
          'zh-CN': {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    // 页脚
    footer: {
      message: '基于 MIT 许可发布',
      copyright: 'Copyright © 2024-present Awesome JS/TS Ecosystem Contributors'
    },

    // 编辑链接
    editLink: {
      pattern: 'https://github.com/AdaMartin18010/JavaScriptTypeScript/edit/main/website/:path',
      text: '在 GitHub 上编辑此页'
    },

    // 文档页脚配置
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    // 大纲
    outline: {
      label: '页面导航',
      level: 'deep'
    },

    // 最后更新时间文本
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    // 返回顶部
    returnToTopLabel: '回到顶部',

    // 侧边栏菜单文本
    sidebarMenuLabel: '菜单',

    // 暗色模式切换
    darkModeSwitchLabel: '主题',

    // 浅色模式标题
    lightModeSwitchTitle: '切换到浅色模式',

    // 暗色模式标题
    darkModeSwitchTitle: '切换到深色模式',

    // 404 页面
    notFound: {
      title: '页面未找到',
      quote: '抱歉，您访问的页面不存在或已被移动。',
      linkLabel: '返回首页',
      linkText: '带我回家'
    }
  },

  // Markdown配置
  markdown: {
    lineNumbers: true,
    languageAlias: {
      ts: 'typescript',
      js: 'javascript',
      bash: 'bash',
      shell: 'bash',
      zsh: 'bash',
      jsonc: 'json',
      'vue-html': 'html'
    },
    config: (md) => {
      // 可以在这里添加自定义markdown插件
    }
  },

  vite: {
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            'mermaid-vendor': ['vitepress-plugin-mermaid'],
            'vue-vendor': ['vue'],
          }
        }
      }
    }
  },

  sitemap: {
    hostname: 'https://awesome-jsts-ecosystem.vercel.app'
  }
}))
