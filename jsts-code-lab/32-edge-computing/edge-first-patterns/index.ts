/**
 * =============================================================================
 * 边缘优先架构模式 — 统一入口 (index.ts)
 * =============================================================================
 *
 * 本文件为边缘优先架构实践模块的统一入口，负责编排并运行所有子模块的演示。
 *
 * 包含的子模块：
 *   - edge-cache-strategies.ts    : 4 种边缘缓存策略
 *   - edge-state-patterns.ts      : 3 种边缘状态管理模式
 *   - edge-routing-patterns.ts    : 3 种边缘路由模式
 *
 * 使用方式：
 *   ```bash
 *   # 运行所有演示
 *   npx tsx jsts-code-lab/32-edge-computing/edge-first-patterns/index.ts
 *
 *   # 在代码中导入特定模块
 *   import { demo as cacheDemo } from './edge-cache-strategies.js';
 *   ```
 * =============================================================================
 */

import { fileURLToPath } from 'node:url';
import { demo as runCacheStrategiesDemo } from './edge-cache-strategies.js';
import { demo as runStatePatternsDemo } from './edge-state-patterns.js';
import { demo as runRoutingPatternsDemo } from './edge-routing-patterns.js';

// ─────────────────────────────────────────────────────────────────────────────
// 重新导出各子模块的 demo 函数
// ─────────────────────────────────────────────────────────────────────────────

export { runCacheStrategiesDemo, runStatePatternsDemo, runRoutingPatternsDemo };

// ─────────────────────────────────────────────────────────────────────────────
// 统一运行所有演示
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 顺序运行所有边缘优先架构模式的演示。
 * 每个演示之间留有分隔，便于在终端中阅读输出。
 */
export async function runAllDemos(): Promise<void> {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║           🚀 边缘优先架构模式 — 完整演示 (Edge-First Patterns)                  ║');
  console.log('║                                                                              ║');
  console.log('║  本演示涵盖边缘架构的三大核心领域：                                            ║');
  console.log('║    1. 缓存策略  — 决定数据如何在边缘命中、失效与刷新                            ║');
  console.log('║    2. 状态管理  — 解决分布式边缘节点的状态一致性挑战                            ║');
  console.log('║    3. 路由模式  — 将请求导向最优目标，支撑实验与灰度                            ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

  // ── 演示 1: 缓存策略 ───────────────────────────────────────────────────────
  console.log('\n');
  console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃  模块 1/3: 边缘缓存策略                                                        ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
  try {
    await runCacheStrategiesDemo();
  } catch (error) {
    console.error('缓存策略演示出错:', (error as Error).message);
  }

  // ── 演示 2: 状态管理 ───────────────────────────────────────────────────────
  console.log('\n');
  console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃  模块 2/3: 边缘状态管理                                                        ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
  try {
    await runStatePatternsDemo();
  } catch (error) {
    console.error('状态管理演示出错:', (error as Error).message);
  }

  // ── 演示 3: 路由模式 ───────────────────────────────────────────────────────
  console.log('\n');
  console.log('┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓');
  console.log('┃  模块 3/3: 边缘路由模式                                                        ┃');
  console.log('┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛');
  try {
    await runRoutingPatternsDemo();
  } catch (error) {
    console.error('路由模式演示出错:', (error as Error).message);
  }

  // ── 结束 ───────────────────────────────────────────────────────────────────
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                            🎉 所有演示已完成                                   ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI 入口：当直接运行此文件时，自动执行所有演示
// ─────────────────────────────────────────────────────────────────────────────

const currentFilePath = fileURLToPath(import.meta.url);

// 在 ESM 中检测是否为主模块入口
// 注意：import.meta.url 在直接运行时为文件路径，在被导入时为该模块的 URL
if (process.argv[1] === currentFilePath || process.argv[1]?.endsWith('index.ts')) {
  runAllDemos().catch((err) => {
    console.error('运行演示时发生未捕获的错误:', err);
    process.exit(1);
  });
}
