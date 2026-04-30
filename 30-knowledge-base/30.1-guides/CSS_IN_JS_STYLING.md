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
| **StyleX** | ❌（编译时） | 0 | 良好 | 原生 | ✅ Meta 开源 |

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
| **DevEx** | 热更新快，调试友好 | Source maps 优秀 | 需等待编译 | 生成文件需忽略 |
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

### Vanilla Extract (编译时 + 类型安全 CSS 文件)

```typescript
// styles.css.ts
import { style, styleVariants, createTheme } from '@vanilla-extract/css';

export const [themeClass, vars] = createTheme({
  color: {
    brand: '#0070f3',
    white: '#ffffff',
  },
  space: {
    small: '4px',
    medium: '8px',
  },
});

const base = style({
  borderRadius: '4px',
  border: '1px solid #ddd',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
});

export const button = styleVariants({
  primary: [base, { background: vars.color.brand, color: vars.color.white }],
  secondary: [base, { background: vars.color.white, color: '#333' }],
});

// Button.tsx
import { themeClass, button } from './styles.css.ts';

export function Button({ variant }: { variant: 'primary' | 'secondary' }) {
  return <button className={`${themeClass} ${button[variant]}`}>Click me</button>;
}
```

### CSS Modules (零运行时 + 作用域样式)

```css
/* Button.module.css */
.button {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
}

.primary {
  background: #0070f3;
  color: white;
  border-color: #0070f3;
}

/* Button.tsx */
import styles from './Button.module.css';

export function Button({ primary = false }: { primary?: boolean }) {
  return (
    <button className={`${styles.button} ${primary ? styles.primary : ''}`}>
      Click me
    </button>
  );
}
```

### Tailwind CSS v4 (原子化 + 配置即代码)

```tsx
// app/components/Badge.tsx
export function Badge({
  children,
  variant = 'default',
}: {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'error';
}) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}

// Tailwind v4 CSS-first 配置
// app.css
@import "tailwindcss";

@theme {
  --color-brand-50: #eff6ff;
  --color-brand-500: #0070f3;
  --color-brand-900: #1e3a8a;
}
```

### StyleX (Meta 编译时原子 CSS)

```tsx
// Button.tsx
import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  base: {
    padding: '8px 16px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    cursor: 'pointer',
  },
  primary: {
    backgroundColor: '#0070f3',
    color: 'white',
    borderColor: '#0070f3',
  },
  secondary: {
    backgroundColor: 'white',
    color: '#333',
  },
});

export function Button({ variant = 'secondary' }: { variant?: 'primary' | 'secondary' }) {
  return (
    <button {...stylex.props(styles.base, styles[variant])}>
      Click me
    </button>
  );
}
```

### CSS Houdini — Paint Worklet 自定义绘制

```typescript
// paint-worklet.ts — 在支持的环境中注册自定义 CSS Paint
if ('paintWorklet' in CSS) {
  (CSS as any).paintWorklet.addModule('/worklets/checkerboard.js');
}

// worklets/checkerboard.js
class CheckerboardPainter {
  static get inputProperties() {
    return ['--checkerboard-size', '--checkerboard-color'];
  }

  paint(ctx: PaintRenderingContext2D, geom: PaintSize, props: StylePropertyMapReadOnly) {
    const size = parseInt(props.get('--checkerboard-size')?.toString() || '20');
    const color = props.get('--checkerboard-color')?.toString() || 'black';
    for (let y = 0; y < geom.height; y += size) {
      for (let x = 0; x < geom.width; x += size) {
        if ((x / size + y / size) % 2 === 0) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }
}

registerPaint('checkerboard', CheckerboardPainter);

// CSS 使用
// .card { background: paint(checkerboard); --checkerboard-size: 24px; }
```

### Lightning CSS 与 PostCSS 构建管道

```typescript
// postcss.config.mjs
import tailwindcss from '@tailwindcss/postcss';
import lightningcss from 'postcss-lightningcss';

export default {
  plugins: [
    tailwindcss(),
    lightningcss({
      browsers: '>= 0.25%',
      lightningcssOptions: {
        minify: true,
        cssModules: true,
      },
    }),
  ],
};
```

```typescript
// vite.config.ts — 使用 Lightning CSS 替代 esbuild/minify-css
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { browserslistToTargets } from 'lightningcss';
import browserslist from 'browserslist';

export default defineConfig({
  plugins: [react()],
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: browserslistToTargets(browserslist('>= 0.25%')),
    },
  },
  build: {
    cssMinify: 'lightningcss',
  },
});
```

### UnoCSS 即时原子 CSS 引擎

```typescript
// uno.config.ts
import { defineConfig, presetUno, presetIcons, transformerDirectives } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetIcons()],
  transformers: [transformerDirectives()],
  rules: [
    ['custom-shadow', { 'box-shadow': '0 4px 6px -1px rgb(0 0 0 / 0.1)' }],
  ],
  shortcuts: {
    'btn-base': 'px-4 py-2 rounded border border-transparent cursor-pointer transition',
    'btn-primary': 'btn-base bg-blue-500 text-white hover:bg-blue-600',
  },
});

// 组件中使用
// <button class="btn-primary custom-shadow">Click me</button>
```

---

## 2026 趋势

**运行时 CSS-in-JS 衰退**：Styled Components 和 Emotion 因 RSC（React Server Components）兼容性问题，在 Next.js App Router 中难以使用。社区转向：

- **编译时方案**：Panda CSS, Vanilla Extract, Linaria, StyleX
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
| Meta/Facebook 生态 | StyleX（与 React 深度集成） |

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
| StyleX | <https://stylexjs.com/docs/learn/> | Meta 编译时原子 CSS |
| CSS Modules | <https://github.com/css-modules/css-modules> | 模块化 CSS 规范 |
| Next.js CSS 文档 | <https://nextjs.org/docs/app/building-your-application/styling> | 官方样式指南 |
| The State of CSS 2024 | <https://2024.stateofcss.com/en-US/other-tools/css_in_js> | CSS-in-JS 趋势报告 |
| Chakra UI v3 + Panda CSS | <https://www.chakra-ui.com/> | 新设计系统架构 |
| Tailwind CSS v4 公告 | <https://tailwindcss.com/blog/tailwindcss-v4> | CSS-first 配置引擎 |
| Vanilla Extract Sprinkles | <https://vanilla-extract.style/documentation/packages/sprinkles/> | 原子 CSS on top of VE |
| React Server Components — Styling | <https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns#unsupported-pattern-importing-server-components-into-client-components> | RSC 样式限制说明 |
| Why I Won't Use Next.js — Kent C. Dodds | <https://www.epicweb.dev/why-i-wont-use-nextjs> | 运行时 CSS-in-JS 与 RSC 冲突讨论 |
| The Future of CSS-in-JS | <https://dev.to/srmaganti/the-future-of-css-in-js-1d2o> | 社区趋势综述 |
| CSS Houdini — MDN | <https://developer.mozilla.org/en-US/docs/Web/API/CSS_Houdini> | 浏览器底层 CSS 扩展 API |
| W3C CSS Houdini Drafts | <https://drafts.css-houdini.org/> | CSS Houdini 规范草案 |
| CSS Tricks — A Guide to CSS-in-JS | <https://css-tricks.com/a-thorough-analysis-of-css-in-js/> | 深度分析 CSS-in-JS 技术路线 |
| Smashing Magazine — CSS Architecture | <https://www.smashingmagazine.com/2022/05/semantic-token-based-design-systems/> | 语义化 Token 设计系统 |
| Lightning CSS | <https://lightningcss.dev/> | Rust 极速 CSS 解析、压缩与转换 |
| PostCSS Documentation | <https://postcss.org/docs/> | CSS 后处理工具链 |
| Autoprefixer | <https://github.com/postcss/autoprefixer> | 自动 CSS 前缀补全 |
| UnoCSS — Instant On-demand Atomic CSS | <https://unocss.dev/> | 即时原子 CSS 引擎 |
| Windi CSS (Deprecated) | <https://windicss.org/> | Tailwind 的替代先驱（已停止维护，迁移至 UnoCSS） |
| CSS Nesting — MDN | <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting> | 原生 CSS 嵌套语法 |
| Container Queries — MDN | <https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries> | 容器查询现代布局 |
| Cascade Layers — MDN | <https://developer.mozilla.org/en-US/docs/Web/CSS/@layer> | CSS 层叠层控制优先级 |

---

*最后更新: 2026-04-30*
