import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    // 测试环境
    environment: 'node',
    globals: true,
    
    // 覆盖率
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/playground/**'
      ]
    },
    
    // 测试文件匹配
    include: ['**/*.test.ts', 'tests/**/*.ts'],
    exclude: ['node_modules', 'dist', 'playground/experiments/**/*'],
    
    // 超时设置
    testTimeout: 10000,
    hookTimeout: 10000
  },
  
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, './shared'),
      '@core': path.resolve(__dirname, './00-language-core'),
      '@patterns': path.resolve(__dirname, './02-design-patterns'),
      '@concurrency': path.resolve(__dirname, './03-concurrency')
    }
  }
});
