import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
import react from '@vitejs/plugin-react';

/**
 * Monorepo 项目 Vite 配置
 * 
 * 适用于包含多个子包的 monorepo 项目，使用 vite-plugin-dts 生成类型声明
 */

// 获取包路径
const pkgRoot = resolve(__dirname, 'packages');

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isBuild = mode === 'production';

  return {
    plugins: [
      react(),
      
      // 类型声明生成 - 支持 Monorepo
      dts({
        // 类型输出目录
        outDir: 'dist/types',
        
        // 生成 rollup 类型声明 (合并为一个文件)
        rollupTypes: true,
        
        // 包含的文件
        include: [
          'packages/*/src/**/*',
          'src/**/*',
        ],
        
        // 排除的文件
        exclude: [
          '**/node_modules/**',
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/*.stories.ts',
        ],
        
        // 路径别名解析
        aliasesExclude: [/^@myorg\/.*$/],
        
        // 静态导入处理
        staticImport: true,
        
        // 插入类型入口
        insertTypesEntry: true,
        
        // 类型映射
        copyDtsFiles: true,
        
        // 严格类型检查
        strictOutput: true,
        
        // 日志级别
        logDiagnostics: isDev,
        
        // 跳过诊断 (构建时设为 false)
        skipDiagnostics: !isBuild,
        
        // 类型路径清理
        cleanVueFileName: false,
        
        // 编译器选项覆盖
        compilerOptions: {
          // 允许合成默认导入
          allowSyntheticDefaultImports: true,
          // 跳过库检查
          skipLibCheck: true,
        },
        
        // 源码映射
        sourceMap: isDev,
        
        // 多入口支持
        entryRoot: 'packages',
        
        // 包名映射
        beforeWriteFile: (filePath, content) => {
          // 可以在这里修改输出路径或内容
          console.log(`Generating types: ${filePath}`);
          return { filePath, content };
        },
      }),
    ],

    // 路径解析 - Monorepo 关键配置
    resolve: {
      alias: {
        // 本地包引用
        '@myorg/core': resolve(pkgRoot, 'core/src'),
        '@myorg/utils': resolve(pkgRoot, 'utils/src'),
        '@myorg/ui': resolve(pkgRoot, 'ui/src'),
        '@myorg/hooks': resolve(pkgRoot, 'hooks/src'),
        
        // 通用别名
        '@': resolve(__dirname, 'src'),
        '@packages': pkgRoot,
      },
    },

    // 构建配置
    build: {
      // 库模式配置
      lib: {
        entry: {
          // 多入口配置
          'core': resolve(pkgRoot, 'core/src/index.ts'),
          'utils': resolve(pkgRoot, 'utils/src/index.ts'),
          'ui': resolve(pkgRoot, 'ui/src/index.ts'),
          'hooks': resolve(pkgRoot, 'hooks/src/index.ts'),
        },
        name: 'MyOrg',
        formats: ['es', 'cjs'],
        fileName: (format, entryName) => {
          return `${entryName}/index.${format === 'es' ? 'mjs' : 'js'}`;
        },
      },

      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      
      // Rollup 配置
      rollupOptions: {
        // 外部依赖 - Monorepo 内部包不应打包
        external: [
          'react',
          'react-dom',
          /^@myorg\/.*/, // 以 @myorg 开头的内部包
          'lodash-es',
          'dayjs',
        ],
        
        output: {
          // 保持目录结构
          preserveModules: false,
          
          // 代码分割
          inlineDynamicImports: false,
          
          // 导出模式
          exports: 'named',
          
          // 全局变量映射
          globals: {
            'react': 'React',
            'react-dom': 'ReactDOM',
            'lodash-es': '_',
            'dayjs': 'dayjs',
          },
          
          // 资源文件处理
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.') || [];
            const ext = info[info.length - 1];
            
            if (ext === 'css') {
              return '[name]/style.css';
            }
            return 'assets/[name]-[hash][extname]';
          },
          
          // chunk 文件命名
          chunkFileNames: 'shared/[name]-[hash].js',
        },
      },
      
      // CSS 配置
      cssCodeSplit: true,
      
      // 压缩配置
      minify: isBuild ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },

    // CSS 配置
    css: {
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isDev
          ? '[name]__[local]___[hash:base64:5]'
          : '[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `@use "@/styles/vars.scss" as *;`,
        },
      },
    },

    // 开发服务器
    server: {
      port: 3000,
      open: true,
      fs: {
        // 允许访问 monorepo 根目录
        allow: ['..', '../..'],
      },
    },

    // 优化依赖
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
      ],
      exclude: [
        '@myorg/core',
        '@myorg/utils',
      ],
    },

    // 测试配置
    test: {
      globals: true,
      environment: 'jsdom',
      include: ['packages/**/*.{test,spec}.{ts,tsx}'],
      coverage: {
        reporter: ['text', 'json', 'html'],
        include: ['packages/**/src/**'],
        exclude: ['**/*.d.ts', '**/*.test.ts'],
      },
    },
  };
});
