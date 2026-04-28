/**
 * # Web 平台 API 专项模块
 *
 * 2025-2026 年，浏览器原生 API 正在爆发式增长，
 * 大量曾经需要第三方库的功能现在可以原生实现。
 *
 * 本模块覆盖以下原生 API：
 * - Popover API：原生弹出层
 * - View Transitions API：页面/元素过渡动画
 * - Temporal API：现代化日期时间处理
 * - Navigation API：可靠的程序化导航
 * - CSS Anchor Positioning：元素相对定位
 *
 * ## 学习目标
 * 1. 理解每个 API 的设计哲学和适用场景
 * 2. 掌握 API 的基本用法和最佳实践
 * 3. 学会渐进增强策略（特性检测 + 回退方案）
 * 4. 了解这些 API 对第三方库的冲击
 */

export * from "./popover-api";
export * from "./view-transitions-api";
export * from "./temporal-api";
export * from "./navigation-api";
export * from "./anchor-positioning";
