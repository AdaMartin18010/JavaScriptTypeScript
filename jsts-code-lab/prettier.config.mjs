/** @type {import("prettier").Config} */
export default {
  // 基础格式
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  
  // 缩进与换行
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,
  
  // 对象与数组
  trailingComma: 'none',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'avoid',
  
  // 特殊文件
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 80
      }
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'always'
      }
    }
  ]
};
