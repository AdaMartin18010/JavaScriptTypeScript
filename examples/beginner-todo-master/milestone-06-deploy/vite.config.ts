import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // base: './' 确保资源路径使用相对路径，适配各种部署环境
  base: './',
  plugins: [react()],
  build: {
    // 输出目录（Vercel 默认使用 dist）
    outDir: 'dist',
    // 生成 source map，便于生产环境调试
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['node_modules/', 'src/__tests__/'],
    },
  },
});
