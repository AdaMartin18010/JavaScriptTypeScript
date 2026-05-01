---
title: 现代 CSS 架构指南
description: Tailwind CSS 4、CSS 变量系统、容器查询、层叠层与原子化 CSS 的完全指南
---

# 现代 CSS 架构指南

> 最后更新: 2026-05-01

---

## 1. CSS 架构演进

```
2015: BEM + Sass
2018: CSS-in-JS (Styled Components)
2020: Utility-First (Tailwind)
2023: CSS Variables + Design Tokens
2025: Tailwind 4 + CSS Layers + Container Queries
```

---

## 2. Tailwind CSS 4 深度

### 新特性

| 特性 | 说明 | 收益 |
|------|------|------|
| **CSS-first config** | 配置移至 CSS | 无 JS 构建步骤 |
| **@vite-only** | 原生 Vite 插件 | HMR < 50ms |
| **CSS layers** | `@layer` 组织 | 优先级管理 |
| **Container queries** | 内置支持 | 组件级响应式 |

```css
/* Tailwind 4 CSS-first 配置 */
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
  --font-sans: "Inter", sans-serif;
}
```

---

## 3. CSS 变量系统

### 设计令牌

```css
:root {
  /* 颜色 */
  --color-primary-50: #eff6ff;
  --color-primary-500: #3b82f6;
  --color-primary-900: #1e3a8a;

  /* 间距 */
  --space-1: 0.25rem;
  --space-4: 1rem;

  /* 字体 */
  --font-sans: system-ui, sans-serif;
  --text-base: 1rem;
}
```

---

## 4. 容器查询

```css
/* 组件级响应式 */
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    grid-template-columns: 1fr 2fr;
  }
}
```

---

## 5. 层叠层 (Cascade Layers)

```css
@layer reset, base, components, utilities;

@layer reset {
  * { margin: 0; padding: 0; }
}

@layer components {
  .btn { padding: 0.5rem 1rem; }
}

@layer utilities {
  .hidden { display: none; }
}
```

---

## 延伸阅读

- [样式处理分类](../categories/styling)
- [UI 组件库分类](../categories/ui-component-libraries)
