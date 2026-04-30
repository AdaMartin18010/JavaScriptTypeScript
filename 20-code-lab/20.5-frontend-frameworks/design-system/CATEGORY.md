---
dimension: 综合
sub-dimension: Design system
created: 2026-04-28
---

# 模块归属声明

本模块归属 **「综合」** 维度，聚焦 Design system 核心概念与工程实践。

## 包含内容

- 本模块聚焦 design system 核心概念与工程实践。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 a11y-color-contrast.test.ts
- 📄 a11y-color-contrast.ts
- 📄 component-variants.test.ts
- 📄 component-variants.ts
- 📄 css-in-js-generator.test.ts
- 📄 css-in-js-generator.ts
- 📄 design-token-transformer.test.ts
- 📄 design-token-transformer.ts
- 📄 design-tokens.test.ts
- 📄 design-tokens.ts
- 📄 icon-system.test.ts
- 📄 icon-system.ts
- ... 等 3 个条目

---

> 此分类文档已根据实际模块内容补充代码示例与权威链接。

## 子模块速查

| 子模块 | 核心能力 | 关联文件 |
|--------|----------|----------|
| Design Tokens | 颜色、排版、间距等原子化设计变量管理 | `design-tokens.ts`, `design-token-transformer.ts` |
| Component Variants | 类型安全的组件变体（Variant）生成器 | `component-variants.ts` |
| CSS-in-JS Generator | 运行时/编译时样式生成与主题注入 | `css-in-js-generator.ts` |
| Icon System | SVG 图标树摇优化与统一接口封装 | `icon-system.ts` |
| A11y Color Contrast | WCAG 对比度计算与色板可达性校验 | `a11y-color-contrast.ts` |

## 代码示例：Design Tokens + 主题切换

```typescript
// design-tokens.ts — 类型安全的设计令牌
export const tokens = {
  color: {
    primary: { 50: '#eff6ff', 500: '#3b82f6', 900: '#1e3a8a' },
    neutral: { 0: '#ffffff', 500: '#6b7280', 900: '#111827' },
  },
  spacing: { xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '2rem' },
  font: { sans: 'ui-sans-serif, system-ui, sans-serif', mono: 'ui-monospace, monospace' },
  radius: { sm: '0.25rem', md: '0.5rem', full: '9999px' },
} as const;

export type TokenPath<T, P extends string = ''> =
  T extends Record<string, unknown>
    ? { [K in keyof T]: TokenPath<T[K], `${P}${P extends '' ? '' : '.'}${K & string}`> }[keyof T]
    : P;

// 类型推断示例：
// type AllPaths = TokenPath<typeof tokens>;
// => "color.primary.50" | "color.primary.500" | ... | "radius.full"

// ── 运行时主题 CSS 变量注入 ──
export function injectThemeCSSVariables(theme: typeof tokens): void {
  const root = document.documentElement;
  const flatten = (obj: Record<string, unknown>, prefix = '--'): void => {
    for (const [k, v] of Object.entries(obj)) {
      const key = `${prefix}${k}`;
      if (typeof v === 'object' && v !== null) flatten(v as Record<string, unknown>, `${key}-`);
      else root.style.setProperty(key, String(v));
    }
  };
  flatten(theme);
}
```

## 代码示例：类型安全的组件变体生成器（cva 风格）

```typescript
// component-variants.ts — 受 class-variance-authority 启发的变体系统

type VariantConfig<V extends Record<string, Record<string, string>>> = {
  base: string;
  variants: V;
  defaultVariants?: { [K in keyof V]?: keyof V[K] };
};

type VariantProps<V extends Record<string, Record<string, string>>> = {
  [K in keyof V]?: keyof V[K];
};

export function createVariants<V extends Record<string, Record<string, string>>>(
  config: VariantConfig<V>
) {
  return (props?: VariantProps<V>): string => {
    const classes: string[] = [config.base];

    for (const [key, value] of Object.entries(config.variants)) {
      const selected = (props?.[key] ?? config.defaultVariants?.[key]) as string;
      if (selected && config.variants[key][selected]) {
        classes.push(config.variants[key][selected]);
      }
    }

    return classes.join(' ');
  };
}

// 使用
const button = createVariants({
  base: 'inline-flex items-center justify-center font-medium transition-colors',
  variants: {
    intent: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    },
    size: {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    },
  },
  defaultVariants: { intent: 'primary', size: 'md' },
});

// 类型推断确保 IDE 自动补全
const className = button({ intent: 'danger', size: 'lg' });
// => "inline-flex items-center ... bg-red-600 text-white hover:bg-red-700 px-6 py-3 text-lg"
```

## 代码示例：CSS-in-JS 主题注入 + 暗色模式

```typescript
// css-in-js-generator.ts — 零运行时开销的样式生成

export interface Theme {
  colors: Record<string, string>;
  spacing: Record<string, string>;
}

export function generateCSSVariables(theme: Theme, prefix = 'ds'): string {
  const lines: string[] = [`:root {`];

  for (const [category, values] of Object.entries(theme)) {
    for (const [key, value] of Object.entries(values)) {
      lines.push(`  --${prefix}-${category}-${key}: ${value};`);
    }
  }

  lines.push('}');
  return lines.join('\n');
}

export function generateDarkModeVariables(
  darkTheme: Theme,
  prefix = 'ds'
): string {
  const lines: string[] = [`@media (prefers-color-scheme: dark) {`, `  :root {`];

  for (const [category, values] of Object.entries(darkTheme)) {
    for (const [key, value] of Object.entries(values)) {
      lines.push(`    --${prefix}-${category}-${key}: ${value};`);
    }
  }

  lines.push('  }', '}');
  return lines.join('\n');
}

// 使用：在构建时生成静态 CSS
const lightTheme: Theme = {
  colors: { bg: '#ffffff', text: '#111827', border: '#e5e7eb' },
  spacing: { sm: '0.5rem', md: '1rem' },
};

const darkTheme: Theme = {
  colors: { bg: '#111827', text: '#f9fafb', border: '#374151' },
  spacing: lightTheme.spacing,
};

const css = [
  generateCSSVariables(lightTheme),
  generateDarkModeVariables(darkTheme),
].join('\n');
```

## 代码示例：SVG Icon System 与树摇优化

```typescript
// icon-system.ts — 类型安全的图标系统，支持按需加载

export const icons = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17l-5-5"/></svg>',
  cross: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
} as const;

export type IconName = keyof typeof icons;

export function renderIcon(
  name: IconName,
  attrs: Record<string, string> = {}
): SVGSVGElement {
  const parser = new DOMParser();
  const doc = parser.parseFromString(icons[name], 'image/svg+xml');
  const svg = doc.documentElement as unknown as SVGSVGElement;

  for (const [k, v] of Object.entries(attrs)) {
    svg.setAttribute(k, v);
  }

  if (!svg.hasAttribute('aria-hidden') && !svg.hasAttribute('aria-label')) {
    svg.setAttribute('aria-hidden', 'true');
  }

  return svg;
}

// 批量注册自定义元素（Web Components 方式）
export function defineIconElements(): void {
  customElements.define('ds-icon', class extends HTMLElement {
    static get observedAttributes() { return ['name', 'size']; }

    attributeChangedCallback() {
      const name = this.getAttribute('name') as IconName;
      const size = this.getAttribute('size') || '1em';
      if (name && icons[name]) {
        this.innerHTML = icons[name];
        const svg = this.querySelector('svg')!;
        svg.style.width = size;
        svg.style.height = size;
      }
    }
  });
}
```

## 代码示例：WCAG 对比度校验

```typescript
// a11y-color-contrast.ts — 计算相对亮度与对比度比值
function getLuminance(hex: string): number {
  const rgb = hex.replace('#', '').match(/.{2}/g)!.map(x => parseInt(x, 16) / 255);
  const [r, g, b] = rgb.map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(foreground: string, background: string): number {
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAG(foreground: string, background: string, level: 'AA' | 'AAA' = 'AA'): boolean {
  const ratio = getContrastRatio(foreground, background);
  return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
}

// 使用
console.log(getContrastRatio('#111827', '#ffffff')); // 16.1 (AAA)
console.log(meetsWCAG('#6b7280', '#ffffff'));        // false (AA 失败)
```

## 代码示例：W3C Design Token Format 转换器

```typescript
// design-token-transformer.ts — 将 W3C 社区组格式转换为 CSS/Sass/JSON
interface W3CToken {
  $value: string | number;
  $type?: 'color' | 'dimension' | 'fontFamily' | 'duration';
  $description?: string;
}

interface W3CTokenGroup {
  [key: string]: W3CToken | W3CTokenGroup;
}

export function tokensToCSS(tokens: W3CTokenGroup, prefix = ''): string {
  const lines: string[] = [];

  function walk(obj: W3CTokenGroup, path: string) {
    for (const [key, value] of Object.entries(obj)) {
      if ('$value' in value) {
        const token = value as W3CToken;
        const varName = `--${path ? path + '-' : ''}${key}`;
        lines.push(`  ${varName}: ${token.$value};`);
      } else {
        walk(value as W3CTokenGroup, path ? `${path}-${key}` : key);
      }
    }
  }

  lines.push(':root {');
  walk(tokens, prefix);
  lines.push('}');
  return lines.join('\n');
}

// 使用
const w3cTokens: W3CTokenGroup = {
  color: {
    primary: { $value: '#3b82f6', $type: 'color' },
    text: { $value: '#111827', $type: 'color' },
  },
  spacing: {
    sm: { $value: '0.5rem', $type: 'dimension' },
  },
};

console.log(tokensToCSS(w3cTokens));
// :root { --color-primary: #3b82f6; --color-text: #111827; --spacing-sm: 0.5rem; }
```

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| W3C Design Tokens Format | 标准规范 | [design-tokens.github.io/community-group/format](https://design-tokens.github.io/community-group/format/) |
| Radix UI | 无头组件设计哲学 | [radix-ui.com](https://www.radix-ui.com/) |
| Tailwind CSS — Customizing | 主题系统设计参考 | [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |
| class-variance-authority (cva) | 变体管理库 | [cva.style](https://cva.style/) |
| Stitches — CSS-in-JS | 样式库设计 | [stitches.dev](https://stitches.dev/) |
| W3C — CSS Custom Properties | 规范 | [w3.org/TR/css-variables-1](https://www.w3.org/TR/css-variables-1/) |
| Nate Baldwin — Design Tokens 术语 | 参考 | [medium.com/eightshapes-llc](https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444746) |
| Google Material Design 3 | 设计系统参考 | [m3.material.io](https://m3.material.io/) |
| Ark UI | 无头组件库 | [ark-ui.com](https://ark-ui.com/) — Zag.js 驱动的框架无关组件 |
| Panda CSS | 原子化 CSS-in-JS | [panda-css.com](https://panda-css.com/) — 类型安全、零运行时 |
| Open Props | CSS 自定义属性库 | [open-props.style](https://open-props.style/) — 预定义设计令牌集合 |
| WCAG 2.2 Contrast | 规范 | [www.w3.org/WAI/WCAG22/Understanding/contrast-minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) |
| CSS Tricks — Design Tokens | 指南 | [css-tricks.com/what-are-design-tokens](https://css-tricks.com/what-are-design-tokens/) |
| Style Dictionary | 工具 | [amzn.github.io/style-dictionary](https://amzn.github.io/style-dictionary/) — Amazon 跨平台设计令牌转换 |
| Shadcn UI | 组件库 | [ui.shadcn.com](https://ui.shadcn.com/) — Radix + Tailwind 的可复制组件 |

---

*最后更新: 2026-04-30*
