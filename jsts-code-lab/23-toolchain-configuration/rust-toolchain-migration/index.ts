/**
 * # Rust 工具链迁移实战
 *
 * 2025-2026 年，JavaScript/TypeScript 工具链正在经历「Rust 化」浪潮：
 * - Biome → 替代 ESLint + Prettier
 * - Oxc (oxlint) → 替代 ESLint（Lint 阶段）
 * - Rolldown → 替代 Rollup（Vite 8 默认底层）
 * - Rspack → 替代 Webpack（企业迁移首选）
 * - Lightning CSS → 替代 PostCSS（Tailwind v4 已采用）
 *
 * 本模块提供从传统 JS 工具链到 Rust 工具链的完整迁移实践。
 */

export * from "./biome-config";
export * from "./oxc-integration";
export * from "./rolldown-config";
export * from "./rspack-migration";
