import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  // 构建配置
  build: {
    target: 'es2024',
    outDir: 'dist',
    lib: {
      entry: path.resolve(__dirname, 'shared/index.ts'),
      name: 'JSTSCodeLab',
      fileName: 'jsts-code-lab'
    },
    rollupOptions: {
      // 外部依赖
      external: ['node:fs', 'node:path', 'node:util']
    }
  },
  
  // 路径别名
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@core': path.resolve(__dirname, './00-language-core'),
      '@patterns': path.resolve(__dirname, './02-design-patterns'),
      '@concurrency': path.resolve(__dirname, './03-concurrency')
    }
  },
  
  // 开发服务器
  server: {
    port: 3000,
    open: true
  }
});
