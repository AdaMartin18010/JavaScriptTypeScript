# 57-design-system

Design system primitives and utilities implemented in TypeScript.

## Topics

| Topic | File | Description |
|---|---|---|
| Design Tokens | `design-tokens.ts` | Color, spacing, typography token management |
| Responsive Breakpoints | `responsive-breakpoints.ts` | Breakpoint management, media query generation, container queries |
| CSS-in-JS Generator | `css-in-js-generator.ts` | CSS object to string conversion, keyframes, atomic CSS |
| Design Token Transformer | `design-token-transformer.ts` | Convert tokens to CSS/SCSS/Android XML/iOS Swift |
| A11y Color Contrast | `a11y-color-contrast.ts` | WCAG 2.1 contrast ratio calculation and auditing |
| Icon System | `icon-system.ts` | Icon registry, SVG renderer, sprite generation |
| Component Variants | `component-variants.ts` | CVA-style variant generator with compound variants |

## Running Tests

```bash
npx vitest run 57-design-system
```
