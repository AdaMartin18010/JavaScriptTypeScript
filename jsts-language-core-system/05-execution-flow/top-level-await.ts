/**
 * @file Top-Level Await (TLA) 语义演示
 * @category Execution Flow → Top-Level Await
 * @difficulty hard
 * @tags top-level-await, module-evaluation, dynamic-import, async-module
 */

// ============================================================================
// 1. Top-Level Await 语义说明
// ============================================================================

/**
 * Top-Level Await (TLA) 允许在模块顶层使用 await。
 * 关键语义：
 * 1. 包含 TLA 的模块会隐式变成 async module
 * 2. 子模块的 TLA 会阻塞父模块的执行
 * 3. 同级模块可以并行执行
 * 4. import() 动态导入返回 Promise
 */

// ============================================================================
// 2. 模块求值顺序模拟
// ============================================================================

const moduleLogs: string[] = [];

function logModule(stage: string, module: string): void {
  const entry = `[${stage}] ${module}`;
  moduleLogs.push(entry);
  console.log(entry);
}

/** 模拟一个包含 TLA 的模块 */
async function simulateModuleWithTLA(name: string, delay: number): Promise<string> {
  logModule("开始求值", name);
  await new Promise((r) => setTimeout(r, delay));
  logModule("求值完成", name);
  return `${name}-result`;
}

/** 模拟模块依赖图：
 * main → a (TLA 20ms)
 *      → b (TLA 10ms)
 *      → c (无 TLA)
 *
 * a 和 b 可以并行，但都阻塞 main
 */
async function demonstrateModuleEvaluationOrder(): Promise<void> {
  console.log("--- 模块求值顺序演示 ---");
  moduleLogs.length = 0;

  // 模拟并行加载有 TLA 的模块
  const [a, b, c] = await Promise.all([
    simulateModuleWithTLA("module-a (TLA 20ms)", 20),
    simulateModuleWithTLA("module-b (TLA 10ms)", 10),
    (() => {
      logModule("同步求值", "module-c (无 TLA)");
      return Promise.resolve("module-c-result");
    })(),
  ]);

  logModule("main 模块", `收到: ${a}, ${b}, ${c}`);
  console.log("模块求值顺序:", moduleLogs.join(" → "));
}

// ============================================================================
// 3. dynamic import() 与 await
// ============================================================================

async function demonstrateDynamicImport(): Promise<void> {
  console.log("\n--- dynamic import() 演示 ---");

  // 动态导入返回 Promise
  console.log("import() 返回 Promise，可以在 async 函数或 TLA 中使用");

  // 条件导入
  const shouldLoad = true;
  if (shouldLoad) {
    // 模拟动态导入
    const mockModule = await Promise.resolve({
      default: "mock-default-export",
      named: "mock-named-export",
    });
    console.log("条件导入结果:", mockModule.default, mockModule.named);
  }

  // 并行动态导入
  const modules = ["mod1", "mod2", "mod3"];
  const results = await Promise.all(
    modules.map(async (name) => {
      const mod = await Promise.resolve({ name, data: `data-${name}` });
      return mod;
    })
  );
  console.log("并行动态导入:", results.map((r) => r.name));
}

// ============================================================================
// 4. TLA 对模块导出的影响
// ============================================================================

/**
 * 包含 TLA 的模块中：
 * - 在 TLA 之前的导出立即可用
 * - 在 TLA 之后的导出需要等待 TLA 完成后才可用
 */

class ModuleWithTLA<T> {
  private ready = false;
  private value?: T;

  constructor(private name: string) {}

  async initialize(delay: number, value: T): Promise<void> {
    console.log(`[${this.name}] TLA 开始`);
    await new Promise((r) => setTimeout(r, delay));
    this.value = value;
    this.ready = true;
    console.log(`[${this.name}] TLA 完成，导出可用`);
  }

  getExport(): T | undefined {
    if (!this.ready) {
      console.log(`[${this.name}] 警告: 在 TLA 完成前访问导出`);
    }
    return this.value;
  }
}

async function demonstrateTLAExports(): Promise<void> {
  console.log("\n--- TLA 对导出的影响 ---");

  const mod = new ModuleWithTLA<string>("async-module");

  // 模拟 TLA 完成前访问
  console.log("TLA 前访问:", mod.getExport());

  await mod.initialize(10, "initialized-value");

  console.log("TLA 后访问:", mod.getExport());
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: TLA 阻塞整个模块树 */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: TLA 阻塞模块树 ---");
  console.log(`
// ❌ 慢速 TLA 会阻塞所有依赖它的模块
// module-slow.ts
await new Promise(r => setTimeout(r, 5000));
export const value = "slow";

// module-fast.ts 依赖 module-slow.ts
import { value } from "./module-slow.js";
// 即使 module-fast.ts 没有 TLA，也必须等待 module-slow.ts

// ✅ 解决方案：将初始化逻辑移到函数中
// module-slow.ts
export async function initialize() {
  await new Promise(r => setTimeout(r, 5000));
  return "slow";
}
  `);
}

/** 反例 2: 在 CommonJS 中使用 TLA */
function counterExample2(): void {
  console.log("--- Counter-example 2: CommonJS 限制 ---");
  console.log(`
// ❌ TLA 只在 ESM 中可用
// CommonJS 模块不能使用顶层 await

// ✅ 在 CJS 中模拟 TLA
async function main() {
  const result = await someAsyncOp();
  module.exports = result;
}
main();
// 但这会导致导出在异步操作完成前是 undefined
  `);
}

/** 反例 3: 循环依赖 + TLA */
function counterExample3(): void {
  console.log("--- Counter-example 3: 循环依赖风险 ---");
  console.log(`
// ❌ TLA 可能加剧循环依赖问题
// a.ts
import { b } from "./b.js";
await someSetup();
export const a = "a";

// b.ts
import { a } from "./a.js";
export const b = "b";
// 循环依赖 + TLA 可能导致死锁或时序问题

// ✅ 避免循环依赖，或使用动态导入打破循环
// a.ts
const { b } = await import("./b.js");
  `);
}

/** 反例 4: 忘记处理 import() 错误 */
function counterExample4(): void {
  console.log("--- Counter-example 4: 未处理的导入错误 ---");
  console.log(`
// ❌ 忘记处理导入失败
const mod = await import("./maybe-missing.js");

// ✅ 使用 try/catch
let mod;
try {
  mod = await import("./maybe-missing.js");
} catch (err) {
  mod = await import("./fallback.js");
}
  `);
}

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Top-Level Await Demo ===\n");

  await demonstrateModuleEvaluationOrder();
  await demonstrateDynamicImport();
  await demonstrateTLAExports();

  // 反例
  counterExample1();
  counterExample2();
  counterExample3();
  counterExample4();

  console.log("\n=== End of Top-Level Await Demo ===\n");
}

export {
  simulateModuleWithTLA,
  demonstrateModuleEvaluationOrder,
  demonstrateDynamicImport,
  demonstrateTLAExports,
  ModuleWithTLA,
};
