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

> 此分类文档由批量生成脚本自动创建，请根据实际模块内容补充和调整。

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

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| W3C Design Tokens Format | 标准规范 | [design-tokens.github.io/community-group/format](https://design-tokens.github.io/community-group/format/) |
| Radix UI | 无头组件设计哲学 | [radix-ui.com](https://www.radix-ui.com/) |
| Tailwind CSS — Customizing | 主题系统设计参考 | [tailwindcss.com/docs/theme](https://tailwindcss.com/docs/theme) |
| MDN | 文档 | [developer.mozilla.org](https://developer.mozilla.org) |
| web.dev | 指南 | [web.dev](https://web.dev) |

---

*最后更新: 2026-04-29*
