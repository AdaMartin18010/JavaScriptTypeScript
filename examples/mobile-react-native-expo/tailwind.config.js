/** @type {import('tailwindcss').Config} */
module.exports = {
  // 指定需要扫描的文件路径，用于生成对应的 NativeWind 样式类
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // 扩展自定义颜色，与 Colors.ts 中的主题色系统保持一致
      colors: {
        primary: {
          light: '#007AFF',
          dark: '#0A84FF',
        },
        background: {
          light: '#FFFFFF',
          dark: '#000000',
        },
        surface: {
          light: '#F2F2F7',
          dark: '#1C1C1E',
        },
        text: {
          light: '#000000',
          dark: '#FFFFFF',
        },
        muted: {
          light: '#8E8E93',
          dark: '#8E8E93',
        },
        border: {
          light: '#E5E5EA',
          dark: '#38383A',
        },
      },
      // 自定义字体大小层级，适配移动端阅读体验
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['14px', { lineHeight: '20px' }],
        'base': ['16px', { lineHeight: '24px' }],
        'lg': ['18px', { lineHeight: '28px' }],
        'xl': ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
      },
    },
  },
  plugins: [],
};
