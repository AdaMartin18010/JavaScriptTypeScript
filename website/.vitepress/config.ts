import { defineConfig } from 'vitepress'
import { sidebar } from './sidebar'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Awesome JS/TS',
  description: '精心策划的 JavaScript/TypeScript 生态系统资源列表',
  
  // 中文站点配置
  lang: 'zh-CN',
  
  // 最后更新时间
  lastUpdated: true,
  
  // 清理URL
  cleanUrls: true,
  
  // 元数据
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#5f67ee' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:site_name', content: 'Awesome JS/TS Ecosystem' }],
    ['meta', { name: 'og:image', content: '/og-image.png' }],
  ],

  // 主题配置
  themeConfig: {
    // 站点Logo
    logo: '/logo.svg',
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: '分类', link: '/categories/frontend-frameworks' },
      { text: '学习路径', link: '/learning-paths/beginners-path' },
      { text: '关于', link: '/about' },
    ],

    // 侧边栏
    sidebar,

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername/awesome-jsts-ecosystem' }
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
      pattern: 'https://github.com/yourusername/awesome-jsts-ecosystem/edit/main/website/:path',
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
    darkModeSwitchTitle: '切换到深色模式'
  },

  // Markdown配置
  markdown: {
    lineNumbers: true,
    config: (md) => {
      // 可以在这里添加自定义markdown插件
    }
  },

  // 构建配置
  sitemap: {
    hostname: 'https://awesome-jsts-ecosystem.vercel.app'
  }
})
