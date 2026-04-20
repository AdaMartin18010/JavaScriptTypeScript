import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import StackBlitzButton from './components/StackBlitzButton.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    app.component('StackBlitzButton', StackBlitzButton)
    
    // 客户端代码块增强
    if (typeof window !== 'undefined') {
      import('./stackblitz-client').then(m => {
        // 模块自初始化
      }).catch(() => {})
      import('./mermaid-enhancer').then(m => {
        // 模块自初始化
      }).catch(() => {})
    }
  }
} satisfies Theme
