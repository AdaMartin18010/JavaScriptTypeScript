import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  // 忽略文件
  {
    ignores: ['dist/**', 'node_modules/**', 'tmp-dist/**', '**/*.d.ts']
  },
  
  // 基础JS/TS配置
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  
  // 自定义配置
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname
      },
      globals: {
        ...globals.node,
        ...globals.es2024
      }
    },
    rules: {
      // 代码风格
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      
      // 教学示例允许某些实践
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'warn',
      
      // 最佳实践
      'eqeqeq': ['error', 'always'],
      'no-console': 'off', // 示例代码允许console
      'prefer-const': 'error'
    }
  },
  
  // 测试文件特殊配置
  {
    files: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/unbound-method': 'off'
    }
  }
);
