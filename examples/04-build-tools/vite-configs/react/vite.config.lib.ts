/**
 * React 组件库 Vite 库模式配置
 * 
 * 适用场景: 发布到 npm 的 React 组件库
 * 特点: 生成 ESM/CJS/UMD 多格式输出、类型声明、dts 生成
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// 库模式专用插件
// import dts from 'vite-plugin-dts'        // 生成类型声明文件
// import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    react(),
    // dts({
    //   insertTypesEntry: true,  // 在 package.json 中插入 types 字段
    //   rollupTypes: true,       // 合并所有类型声明
    // }),
    // cssInjectedByJsPlugin(),  // 将 CSS 注入 JS
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  // ============================================
  // 库模式核心配置
  // ============================================
  
  build: {
    // 库模式（必须）
    lib: {
      // 库入口
      entry: resolve(__dirname, 'src/index.ts'),
      
      // 库名称（UMD 全局变量名）
      name: 'MyReactLib',
      
      // 输出文件名
      fileName: (format) => `my-react-lib.${format}.js`,
      
      // 输出格式
      formats: ['es', 'cjs', 'umd', 'iife'],
      // 
      // 格式说明:
      // - es: ES 模块 (import/export)，现代浏览器和构建工具
      // - cjs: CommonJS (require/module.exports)，Node.js 环境
      // - umd: Universal Module Definition，浏览器全局变量
      // - iife: Immediately Invoked Function Expression，浏览器 script 标签
    },

    // 输出目录
    outDir: 'dist',
    
    // 清空输出目录
    emptyOutDir: true,

    // Rollup 配置
    rollupOptions: {
      // 外部依赖（不会打包到库中）
      // 这些应该由使用方的项目安装
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        // 其他 peer dependencies
      ],
      
      output: {
        // 全局变量映射（UMD 需要）
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
        
        // 导出模式
        exports: 'named',
        
        // 生成 source map
        sourcemap: true,
        
        // CSS 处理
        // 如果未使用 cssInjectedByJsPlugin，CSS 会单独输出
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'my-react-lib.css'
          }
          return assetInfo.name
        },
      },
    },

    // 类型声明输出配置
    // 配合 vite-plugin-dts 使用
    // 会在 outDir 生成 .d.ts 文件
  },

  // ============================================
  // CSS 配置（库模式特殊处理）
  // ============================================
  
  css: {
    // 提取 CSS 到单独文件
    // 或者使用 cssInjectedByJsPlugin 注入 JS
    modules: {
      // 生成类名格式
      generateScopedName: 'my-lib-[name]-[local]',
    },
  },

  // ============================================
  // 依赖优化
  // ============================================
  
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})

/**
 * 配套的 package.json 配置:
 * 
 * {
 *   "name": "my-react-lib",
 *   "version": "1.0.0",
 *   "description": "My React Component Library",
 *   
 *   // 入口配置 - 让使用者正确导入
 *   "main": "./dist/my-react-lib.cjs.js",        // CommonJS 入口
 *   "module": "./dist/my-react-lib.es.js",       // ES 模块入口
 *   "types": "./dist/index.d.ts",                // 类型声明入口
 *   
 *   // Exports 字段（现代 Node 版本推荐）
 *   "exports": {
 *     ".": {
 *       "import": "./dist/my-react-lib.es.js",
 *       "require": "./dist/my-react-lib.cjs.js",
 *       "types": "./dist/index.d.ts"
 *     },
 *     "./style.css": "./dist/my-react-lib.css",
 *     "./package.json": "./package.json"
 *   },
 *   
 *   // 文件白名单
 *   "files": [
 *     "dist",
 *     "README.md"
 *   ],
 *   
 *   // 对等依赖
 *   "peerDependencies": {
 *     "react": ">=16.8.0",
 *     "react-dom": ">=16.8.0"
 *   },
 *   
 *   // 开发依赖
 *   "devDependencies": {
 *     "@types/react": "^18.0.0",
 *     "@types/react-dom": "^18.0.0",
 *     "@vitejs/plugin-react": "^4.0.0",
 *     "typescript": "^5.0.0",
 *     "vite": "^5.0.0",
 *     "vite-plugin-dts": "^3.0.0"
 *   }
 * }
 * 
 * 库入口文件 src/index.ts 示例:
 * ```ts
 * // 导出组件
 * export { default as Button } from './components/Button'
 * export { default as Modal } from './components/Modal'
 * export { default as Input } from './components/Input'
 * 
 * // 导出类型
 * export type { ButtonProps } from './components/Button'
 * export type { ModalProps } from './components/Modal'
 * 
 * // 导出工具函数
 * export { useModal } from './hooks/useModal'
 * export { theme } from './theme'
 * 
 * // 导出样式（可选）
 * import './styles/index.css'
 * ```
 * 
 * 构建命令:
 * - npm run build       # vite build
 * - npm run build:watch # vite build --watch
 * 
 * 发布前检查清单:
 * [ ] 版本号已更新
 * [ ] CHANGELOG.md 已更新
 * [ ] 类型声明文件正确生成
 * [ ] 所有格式输出正常
 * [ ] 样式文件正确处理
 * [ ] 在测试项目中验证
 */
