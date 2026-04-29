# CSS-in-JS 样式方案

> JavaScript 生态 CSS-in-JS 方案选型：从运行时样式到编译时提取的演进。

---

## 方案对比

| 方案 | 运行时 | 包体积 | TypeScript | SSR | 2026 状态 |
|------|--------|--------|------------|-----|----------|
| **Styled Components** | ✅ | ~12KB | 良好 | 需配置 | ⚠️ 维护放缓 |
| **Emotion** | ✅ | ~10KB | 良好 | 需配置 | ⚠️ 维护放缓 |
| **Linaria** | ❌（编译时） | 0 | 良好 | 原生 | ✅ 活跃 |
| **Panda CSS** | ❌（编译时） | 0 | 优秀 | 原生 | ✅ 快速增长 |
| **Vanilla Extract** | ❌（编译时） | 0 | 优秀 | 原生 | ✅ 活跃 |
| **Tailwind + CSS Modules** | ❌ | 0 | 需配置 | 原生 | ✅ 主流 |

---

## 深度对比：Styled Components vs Emotion vs Linaria vs Panda CSS

| 维度 | styled-components | Emotion | Linaria | Panda CSS |
|------|-------------------|---------|---------|-----------|
| **实现方式** | 运行时模板字符串解析 | 运行时 `css` prop / `styled` | Babel 编译时提取 | 静态分析 + 生成原子 CSS |
| **运行时开销** | ~12KB + 样式注入计算 | ~10KB + 样式注入计算 | 0 KB | 0 KB |
| **RSC 兼容** | ❌ 需 `use client` | ❌ 需 `use client` | ✅ 原生支持 | ✅ 原生支持 |
| **动态样式** | ✅ `props` 驱动 | ✅ `props` / 主题驱动 | ⚠️ 有限 (`css` 变量回退) | ✅ `cva` / `recipe` 变体 |
| **类型安全** | 中等 (模板字符串) | 中等 (对象样式稍好) | 良好 | 优秀 (生成类型定义) |
| **主题系统** | `ThemeProvider` + Context | `ThemeProvider` + Context | CSS 变量 | `tokens` / `semanticTokens` |
| **构建工具** | 任何 | 任何 | Babel / Vite / Webpack | PostCSS / Vite / Next.js |
| **DevEx** | 热更新快，调试友好 |  Source maps 优秀 | 需等待编译 | 生成文件需忽略 |
| **代表用户** | 大量遗留项目 | 大量遗留项目 | Callstack / 中型项目 | Chakra UI v3 / 新设计系统 |

---

## 代码示例

### Styled Components (运行时 — 遗留项目)

```tsx
import styled from 'styled-components';

const Button = styled.button<{ $primary?: boolean }>`
  background: ${props => props.$primary ? '#0070f3' : 'white'};
  color: ${props => props.$primary ? 'white' : '#333'};
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }
`;

// 使用
<Button $primary>Primary Button</Button>
```

### Emotion (运行时 — 遗留项目)

```tsx
/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const buttonStyle = (primary: boolean) => css`
  background: ${primary ? '#0070f3' : 'white'};
  color: ${primary ? 'white' : '#333'};
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
`;

// 使用
<button css={buttonStyle(true)}>Primary Button</button>
```

### Linaria (编译时)

```tsx
import { styled } from '@linaria/react';

const Button = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? '#0070f3' : 'white'};
  color: ${props => props.primary ? 'white' : '#333'};
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;

  &:hover {
    opacity: 0.9;
  }
`;

// ⚠️ 注意：Linaria 的动态属性依赖 CSS 变量 fallback，实际编译后无运行时
// 更推荐用 data-attribute 或 CSS 变量控制变体
```

### Panda CSS (编译时 + 类型安全)

```tsx
// panda.config.ts
import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  preflight: true,
  include: ['./src/**/*.{tsx,jsx}'],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        colors: {
          primary: { value: '#0070f3' },
          secondary: { value: '#666' },
        },
      },
    },
  },
  outdir: 'styled-system',
});

// src/components/Button.tsx
import { cva } from '../../styled-system/css';

const button = cva({
  base: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  variants: {
    visual: {
      primary: { bg: 'primary', color: 'white', borderColor: 'primary' },
      secondary: { bg: 'white', color: 'secondary' },
    },
    size: {
      sm: { padding: '4px 8px', fontSize: 'sm' },
      md: { padding: '8px 16px', fontSize: 'md' },
    },
  },
  defaultVariants: {
    visual: 'secondary',
    size: 'md',
  },
});

// 使用 — 带完整 TypeScript 自动补全
<button className={button({ visual: 'primary', size: 'sm' })}>Click me</button>
```

---

## 2026 趋势

**运行时 CSS-in-JS 衰退**：Styled Components 和 Emotion 因 RSC（React Server Components）兼容性问题，在 Next.js App Router 中难以使用。社区转向：

- **编译时方案**：Panda CSS, Vanilla Extract, Linaria
- **原子化 CSS**：Tailwind CSS（最主流选择）
- **CSS Modules**：零运行时开销，TypeScript 通过 `*.module.css.d.ts` 支持

---

## 选型建议

| 场景 | 推荐方案 |
|------|---------|
| Next.js App Router | Tailwind CSS 或 Panda CSS |
| 设计系统 | Panda CSS（类型安全令牌） |
| 零依赖偏好 | CSS Modules + PostCSS |
| 遗留项目维护 | 保持 Styled Components，逐步迁移 |

---

## 权威参考链接

| 资源 | 链接 | 说明 |
|------|------|------|
| Styled Components Docs | <https://styled-components.com/docs> | 官方文档 |
| Emotion Docs | <https://emotion.sh/docs/introduction> | 官方文档 |
| Linaria GitHub | <https://github.com/callstack/linaria> | 编译时 CSS-in-JS |
| Panda CSS Docs | <https://panda-css.com/docs> | 官方文档与配置指南 |
| Vanilla Extract | <https://vanilla-extract.style/> | 类型安全 CSS |
| Tailwind CSS | <https://tailwindcss.com/docs> | 原子化 CSS 文档 |
| CSS Modules | <https://github.com/css-modules/css-modules> | 模块化 CSS 规范 |
| Next.js CSS 文档 | <https://nextjs.org/docs/app/building-your-application/styling> | 官方样式指南 |
| The State of CSS 2024 | <https://2024.stateofcss.com/en-US/other-tools/css_in_js> | CSS-in-JS 趋势报告 |

---

*最后更新: 2026-04-29*
