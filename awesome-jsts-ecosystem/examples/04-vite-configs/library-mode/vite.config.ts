import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import { visualizer } from 'rollup-plugin-visualizer';

// 库模式配置
export default defineConfig(({ mode, command }) => {
  const isBuild = command === 'build';
  const isAnalyze = mode === 'analyze';

  return {
    plugins: [
      // 类型声明生成
      dts({
        // 输出目录
        outDir: 'dist/types',
        // 是否包含 src 目录结构
        insertTypesEntry: true,
        // 生成 rollup 类型声明
        rollupTypes: true,
        // 包含的文件夹
        include: ['src/**/*'],
        // 排除的文件夹
        exclude: ['src/**/*.test.ts', 'src/**/*.spec.ts'],
        // 静态导入处理
        staticImport: true,
        // 是否跳过类型诊断
        skipDiagnostics: false,
        // 类型诊断日志级别
        logDiagnostics: true,
      }),

      // 打包分析
      isAnalyze && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/stats.html',
      }),
    ].filter(Boolean),

    // 库模式配置
    build: {
      // 库模式
      lib: {
        // 入口文件
        entry: resolve(__dirname, 'src/index.ts'),
        // 库名称 (UMD 模式下使用)
        name: 'MyLibrary',
        // 输出文件名
        fileName: (format) => `my-library.${format}.js`,
        // 输出格式
        formats: ['es', 'cjs', 'umd'],
      },

      // 输出目录
      outDir: 'dist',
      
      // 是否清空输出目录
      emptyOutDir: true,

      // Source map
      sourcemap: true,

      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },

      // Rollup 配置
      rollupOptions: {
        // 外部依赖 (不会打包到库中)
        external: [
          // 视情况将依赖设为外部
          // 'lodash-es',
          // 'dayjs',
        ],

        output: {
          // 全局变量映射 (UMD 模式下使用)
          globals: {
            // 'lodash-es': '_',
            // 'dayjs': 'dayjs',
          },

          // 导出模式
          exports: 'named',

          // 代码分割 (库模式通常不需要)
          inlineDynamicImports: true,

          // 资源文件命名
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            
            if (ext === 'css') {
              return 'styles/[name][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },

          // 保留模块原始结构 (es/cjs 格式)
          preserveModules: false,
        },
      },

      // CSS 代码分割
      cssCodeSplit: true,

      // 报告压缩后大小
      reportCompressedSize: true,
    },

    // 路径解析
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
      },
    },

    // CSS 配置
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/vars.scss" as *;`,
        },
      },
    },

    // 测试配置
    test: {
      globals: true,
      environment: 'jsdom',
    },
  };
});
