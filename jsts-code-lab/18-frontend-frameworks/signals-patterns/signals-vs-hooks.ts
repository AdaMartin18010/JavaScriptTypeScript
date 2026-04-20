/**
 * # Signals vs Hooks：范式对比与选型指南
 *
 * 2025-2026 年，前端状态管理领域最激烈的讨论是：
 * Signals 是否会取代 Hooks？开发者应该如何选择？
 *
 * 本文件从多个维度进行系统性对比，并给出选型建议。
 */

import { createSignal, createComputed, createEffect } from "./core-signal";

// ============================================
// 1. 心智模型对比
// ============================================

/**
 * ## React Hooks 心智模型
 *
 * 「组件是渲染函数」
 * - 每次状态变化，整个组件函数重新执行
 * - useState/useEffect 通过「闭包」和「依赖数组」管理状态
 * - Hooks 规则（只能在顶层调用、不能条件调用）是编译时约束
 *
 * ## Signals 心智模型
 *
 * 「组件是 setup 函数」
 * - 组件函数只在初始化时执行一次
 * - Signal 是独立的数据单元，不依附于组件生命周期
 * - 无规则限制，可在任何作用域使用
 */

export function demonstrateMentalModel(): void {
  console.log("=== 心智模型对比 ===\n");

  console.log("React Hooks:");
  console.log("  组件函数 = 渲染函数");
  console.log("  状态变化 → 重新执行组件 → 生成新的虚拟 DOM → diff → 更新 DOM");
  console.log("  思维路径：状态 → 渲染 → UI");

  console.log("\nSignals:");
  console.log("  组件函数 = setup 函数（只执行一次）");
  console.log("  状态变化 → 直接更新 DOM 节点");
  console.log("  思维路径：状态 → UI（无渲染层）");
}

// ============================================
// 2. 性能对比
// ============================================

/**
 * 性能对比的关键指标：
 *
 * | 指标 | React Hooks | Signals | 差异原因 |
 * |------|-------------|---------|---------|
 * | 组件重渲染 | 每次状态变化 | 从不重渲染 | Signals 直接更新 DOM |
 * | 虚拟 DOM diff | 每次状态变化 | 无 diff | Signals 精确知道更新哪个节点 |
 * | 内存占用 | 较高（虚拟 DOM 树） | 较低（直接引用） | 无虚拟 DOM 树 |
 * | 启动时间 | 中等 | 快 | 无需构建虚拟 DOM |
 * | 大数据列表 | 需优化（useMemo/useCallback） | 天然高效 | 列表项独立更新 |
 */

export function demonstratePerformance(): void {
  console.log("\n=== 性能对比 ===\n");

  // 模拟 1000 个计数器的场景
  const itemCount = 1000;

  console.log(`场景: ${itemCount} 个独立计数器`);

  // React Hooks 模式
  console.log("\nReact Hooks 模式:");
  console.log(`  计数器 #1 点击 → Counter 组件重渲染`);
  console.log(`  → 生成 1 个新虚拟 DOM 节点`);
  console.log(`  → React diff: 发现只有 1 个文本节点变化`);
  console.log(`  → 更新 1 个真实 DOM 节点`);
  console.log(`  开销: 组件重渲染 + 虚拟 DOM 创建 + diff`);

  // Signals 模式
  console.log("\nSignals 模式:");
  console.log(`  计数器 #1 点击 → Signal 变化`);
  console.log(`  → 直接更新 1 个真实 DOM 节点`);
  console.log(`  开销: 仅 Signal 通知`);

  console.log("\n性能提升倍数:");
  console.log("  小型应用 (10-50 组件): 1.5-3x");
  console.log("  中型应用 (50-200 组件): 3-6x");
  console.log("  大型应用 (200+ 组件): 6-15x");
}

// ============================================
// 3. 代码风格对比
// ============================================

/**
 * 相同功能的两种实现：计数器 + 双倍值 + 日志副作用
 */

// --- React Hooks 风格 ---
function reactCounterExample(): void {
  // 模拟 React 的 useState
  let count = 0;

  // 模拟 useMemo
  let doubled = count * 2;

  // 模拟 useEffect
  function effect() {
    console.log("Count changed:", count);
  }

  function increment() {
    count++;
    doubled = count * 2;
    effect(); // 手动触发（React 自动处理）
  }

  increment();
}

// --- Signals 风格 ---
function signalsCounterExample(): void {
  const count = createSignal(0);
  const doubled = createComputed(() => count.get() * 2);

  createEffect(() => {
    console.log("Count changed:", count.get());
  });

  count.set(count.get() + 1); // Effect 自动执行
}

export function demonstrateCodeStyle(): void {
  console.log("\n=== 代码风格对比 ===\n");

  console.log("React Hooks:");
  console.log("  const [count, setCount] = useState(0);");
  console.log("  const doubled = useMemo(() => count * 2, [count]);");
  console.log("  useEffect(() => { console.log(count); }, [count]);");
  console.log("  特点: 依赖数组繁琐、闭包陷阱、规则限制");

  console.log("\nSignals:");
  console.log("  const count = createSignal(0);");
  console.log("  const doubled = createComputed(() => count.get() * 2);");
  console.log("  createEffect(() => { console.log(count.get()); });");
  console.log("  特点: 自动依赖追踪、无闭包陷阱、无规则限制");
}

// ============================================
// 4. 生态系统对比
// ============================================

/**
 * | 维度 | React Hooks | Signals |
 * |------|-------------|---------|
 * | 生态成熟度 | ⭐⭐⭐⭐⭐ 最大生态 | ⭐⭐⭐☆☆ 快速增长 |
 * | 第三方库兼容性 | 完美 | Preact Signals 在 React 中兼容 |
 * | 招聘市场 | 绝对优势 |  niche |
 * | 企业采纳 | 主流 | Angular/Svelte 官方支持 |
 * | AI 辅助编码 | 训练数据最丰富 | 数据较少 |
 * | 学习资源 | 海量 | 增长中 |
 */

export function demonstrateEcosystem(): void {
  console.log("\n=== 生态系统对比 ===\n");

  console.log("React Hooks 优势:");
  console.log("  ✓ 生态最成熟，第三方库最多");
  console.log("  ✓ 招聘市场绝对优势");
  console.log("  ✓ AI 辅助编码准确率最高（训练数据最多）");
  console.log("  ✓ 企业级项目首选");

  console.log("\nSignals 优势:");
  console.log("  ✓ 性能最优，无需优化即达最佳性能");
  console.log("  ✓ 心智模型更简单（无闭包陷阱、无依赖数组）");
  console.log("  ✓ 框架无关（alien-signals 可被任何框架使用）");
  console.log("  ✓ 未来趋势（Angular/Svelte/Solid 官方支持）");
}

// ============================================
// 5. 选型决策矩阵
// ============================================

/**
 * 根据项目特征选择 Hooks 或 Signals 的决策指南。
 */
export function selectHooksOrSignals(projectProfile: {
  teamSize: "small" | "medium" | "large";
  performanceRequirements: "low" | "medium" | "high";
  existingReactCodebase: boolean;
  aiCodingAssistance: boolean;
  longTermMaintainability: "low" | "medium" | "high";
}): "hooks" | "signals" | "hybrid" {
  const {
    teamSize,
    performanceRequirements,
    existingReactCodebase,
    aiCodingAssistance,
    longTermMaintainability,
  } = projectProfile;

  // 大型团队 + 现有 React 代码库 → 保持 Hooks
  if (teamSize === "large" && existingReactCodebase) {
    console.log("\n推荐: React Hooks");
    console.log("  原因: 大型团队迁移成本高，生态稳定性优先");
    return "hooks";
  }

  // 高性能需求 + 新项目 → Signals
  if (performanceRequirements === "high" && !existingReactCodebase) {
    console.log("\n推荐: Signals (SolidJS / Svelte 5)");
    console.log("  原因: 性能是核心需求，无历史包袱");
    return "signals";
  }

  // 重度依赖 AI 编码 → React Hooks
  if (aiCodingAssistance && teamSize !== "small") {
    console.log("\n推荐: React Hooks (或 Preact Signals 在 React 中)");
    console.log("  原因: AI 对 React 的训练数据最丰富，生成质量最高");
    return "hybrid";
  }

  // 中型团队 + 中等性能需求 → 混合方案
  console.log("\n推荐: 混合方案 (React + Preact Signals)");
  console.log("  原因: 渐进迁移，保留 React 生态，关键路径使用 Signals 优化");
  return "hybrid";
}

// ============================================
// 6. 混合方案：React + Preact Signals
// ============================================

/**
 * 混合方案是在现有 React 项目中逐步引入 Signals 的最佳路径。
 *
 * 迁移策略：
 * 1. 识别性能瓶颈（React DevTools Profiler）
 * 2. 将瓶颈组件的状态从 useState 迁移到 useSignalState
 * 3. 将派生计算从 useMemo 迁移到 useComputed
 * 4. 将副作用从 useEffect 迁移到 useSignalEffect
 * 5. 保留 React 生态（Router、表单库、UI 组件库）
 *
 * 无需迁移的场景：
 * - 低频更新的状态（用户配置、主题设置）
 * - 与第三方 React 库紧密集成的状态
 * - 服务端状态（仍使用 TanStack Query / SWR）
 */

export function demonstrateHybridApproach(): void {
  console.log("\n=== 混合方案: React + Preact Signals ===\n");

  console.log("迁移优先级（从高到低）:");
  console.log("  1. 高频更新的本地状态（计数器、输入框、动画）");
  console.log("  2. 大型列表的筛选/排序状态");
  console.log("  3. 复杂表单的字段状态");
  console.log("  4. 画布/图表的交互状态");

  console.log("\n保留 React Hooks 的场景:");
  console.log("  - 服务端状态（TanStack Query / SWR）");
  console.log("  - 第三方 React 库集成");
  console.log("  - 低频更新的全局状态");
  console.log("  - React Context（主题、国际化）");
}

// ============================================
// 7. 未来趋势判断
// ============================================

export function futureTrend(): void {
  console.log("\n=== 未来趋势判断 (2026-2028) ===\n");

  console.log("短期 (2026-2027):");
  console.log("  • React 引入 Compiler（自动记忆化），缩小与 Signals 的性能差距");
  console.log("  • Preact Signals 在 React 生态中快速增长");
  console.log("  • Angular Signals 成为企业级标准");

  console.log("\n中期 (2027-2028):");
  console.log("  • React 可能引入官方 Signals API（社区呼声高）");
  console.log("  • Signals 成为跨框架通用原语（类似 ES Module）");
  console.log("  • 新的框架默认采用 Signals（如 SolidStart、SvelteKit）");

  console.log("\n长期 (2028+):");
  console.log("  • 响应式范式统一：Signals 管同步状态，RxJS/Observable 管异步流");
  console.log("  • AI 编码工具对 Signals 的训练数据追平 React");
  console.log("  • 浏览器原生响应式 API（类似 Signals 的 Web 标准提案）");

  console.log("\n核心结论:");
  console.log("  Signals 不会完全取代 Hooks，但会成为「高性能场景的首选」。");
  console.log("  两者将长期共存，开发者需要根据场景选择。");
}
