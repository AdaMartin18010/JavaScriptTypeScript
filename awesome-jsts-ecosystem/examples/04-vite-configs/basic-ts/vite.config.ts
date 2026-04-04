import { defineConfig } from 'vite';
import { resolve } from 'path';

// 基础 TypeScript 项目配置
export default defineConfig({
  // 项目根目录
  root: process.cwd(),
  
  // 基础路径
  base: '/',
  
  // 路径解析配置
  resolve: {
    // 路径别名
    alias: {
      '@': resolve(__dirname, './src'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
    },
    // 文件扩展名
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    // 代理配置示例
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  
  // 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 是否生成 source map
    sourcemap: true,
    // 是否压缩代码
    minify: 'terser',
    // 代码分割配置
    rollupOptions: {
      output: {
        // 代码分割
        manualChunks: {
          vendor: ['lodash-es'],
        },
        // 静态资源命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name || '')) {
            return 'images/[name]-[hash][extname]';
          }
          if (/\.(css)$/i.test(assetInfo.name || '')) {
            return 'css/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // 压缩配置
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  
  // CSS 配置
  css: {
    // CSS Modules 配置
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
    // 预处理器配置
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/vars.scss" as *;`,
      },
    },
    // PostCSS 配置（会自动读取 postcss.config.js）
    postcss: {},
  },
  
  // 插件配置
  plugins: [],
  
  // 优化依赖预构建
  optimizeDeps: {
    include: ['lodash-es'],
    exclude: [],
  },
  
  // 环境变量配置
  envPrefix: 'VITE_',
  
  // 日志级别
  logLevel: 'info',
  
  // 清空屏幕
  clearScreen: false,
});
