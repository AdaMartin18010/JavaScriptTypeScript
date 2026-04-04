import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// React + TypeScript 项目配置
export default defineConfig(({ mode, command }) => {
  const isDev = mode === 'development';
  const isBuild = command === 'build';

  return {
    // 插件
    plugins: [
      // React 插件，支持 Fast Refresh
      react({
        // JSX 运行时 (classic | automatic)
        jsxRuntime: 'automatic',
        // JSX 导入源
        jsxImportSource: 'react',
        // Babel 配置
        babel: {
          plugins: [
            // 可选：添加装饰器支持
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            // 可选：添加双问号操作符支持
            '@babel/plugin-proposal-nullish-coalescing-operator',
          ],
        },
      }),
      
      // 打包分析 (仅生产构建时启用)
      isBuild && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ].filter(Boolean),

    // 路径解析
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@pages': resolve(__dirname, './src/pages'),
        '@store': resolve(__dirname, './src/store'),
        '@utils': resolve(__dirname, './src/utils'),
        '@assets': resolve(__dirname, './src/assets'),
        '@styles': resolve(__dirname, './src/styles'),
      },
    },

    // CSS 配置
    css: {
      devSourcemap: isDev,
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: isDev
          ? '[name]__[local]___[hash:base64:5]'
          : '[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "@styles/variables.scss" as *;
            @use "@styles/mixins.scss" as *;
          `,
        },
        less: {
          javascriptEnabled: true,
          modifyVars: {
            'primary-color': '#1890ff',
          },
        },
      },
    },

    // 开发服务器
    server: {
      port: 3000,
      open: true,
      host: true,
      cors: true,
      // HMR 配置
      hmr: {
        overlay: true,
      },
      // 代理配置
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy, options) => {
            proxy.on('error', (err, req, res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Sending Request:', req.method, req.url);
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              console.log('Received Response:', proxyRes.statusCode, req.url);
            });
          },
        },
        '/uploads': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },

    // 预览服务器
    preview: {
      port: 4173,
      open: true,
    },

    // 构建配置
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: isDev,
      minify: 'terser',
      
      // Terser 配置
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
        },
        format: {
          comments: false,
        },
      },

      // Rollup 配置
      rollupOptions: {
        output: {
          // 代码分割策略
          manualChunks: {
            // React 核心库
            'react-vendor': ['react', 'react-dom'],
            // 路由
            'router': ['react-router-dom'],
            // 状态管理
            'state': ['zustand'],
            // UI 组件库
            'ui': ['antd'],
            // 工具库
            'utils': ['lodash-es', 'dayjs', 'axios'],
          },
          // 入口文件命名
          entryFileNames: 'js/[name]-[hash].js',
          // Chunk 文件命名
          chunkFileNames: 'js/[name]-[hash].js',
          // 静态资源命名
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            
            // 图片资源
            if (/\.(png|jpe?g|gif|svg|webp|ico|bmp)$/i.test(assetInfo.name || '')) {
              return 'images/[name]-[hash][extname]';
            }
            // 字体资源
            if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
              return 'fonts/[name]-[hash][extname]';
            }
            // CSS 资源
            if (ext === 'css') {
              return 'css/[name]-[hash][extname]';
            }
            // 其他资源
            return 'assets/[name]-[hash][extname]';
          },
        },
      },

      // 报告压缩后块大小
      reportCompressedSize: true,
      // 触发警告的 chunk 大小 (KB)
      chunkSizeWarningLimit: 500,
    },

    // 依赖优化
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lodash-es',
        'dayjs',
        'axios',
        'antd',
        'zustand',
      ],
      exclude: [],
      esbuildOptions: {
        target: 'es2020',
      },
    },

    // JSON 配置
    json: {
      namedExports: true,
      stringify: false,
    },

    // ESBuild 配置
    esbuild: {
      jsxInject: `import React from 'react'`,
      drop: isBuild ? ['console', 'debugger'] : [],
    },

    // 全局常量替换
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __DEV__: JSON.stringify(isDev),
    },

    // 环境变量前缀
    envPrefix: 'VITE_',

    // 日志级别
    logLevel: 'info',

    // 清空屏幕
    clearScreen: false,
  };
});
