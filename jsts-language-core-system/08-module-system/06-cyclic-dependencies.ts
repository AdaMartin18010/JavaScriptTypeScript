/**
 * 循环依赖演示 (Cyclic Dependencies)
 *
 * 涵盖: CJS 部分导出模拟, ESM TDZ 行为模拟,
 *       循环检测 DFS 算法, 重构策略演示,
 *       延迟加载打破循环, 事件驱动解耦
 */

// ============================================================
// 1. CJS 循环依赖与部分导出模拟
// ============================================================

function demoCjsCircularDependency() {
  console.log("\n=== 1. CJS 循环依赖与部分导出模拟 ===");

  // 模拟 CJS Module Cache
  const requireCache = new Map<string, { exports: Record<string, unknown> }>();

  function simulatedRequire(name: string, factory: () => void) {
    if (requireCache.has(name)) {
      return requireCache.get(name)!.exports;
    }

    const module = { exports: {} as Record<string, unknown> };
    requireCache.set(name, module); // 先缓存，再执行！
    factory();
    return module.exports;
  }

  // 场景：a.js 和 b.js 互相 require
  console.log("  执行顺序:");

  const aExports = simulatedRequire("a.js", () => {
    console.log("    [a.js] start execution");
    (requireCache.get("a.js")!.exports as any).name = "module-a";

    // a 在顶部 require b
    const b = simulatedRequire("b.js", () => {
      console.log("    [b.js] start execution");
      (requireCache.get("b.js")!.exports as any).name = "module-b";

      // b 又 require a → 命中缓存中的部分 a
      const aPartial = simulatedRequire("a.js", () => {});
      console.log("    [b.js] sees a.name =", (aPartial as any).name);
      console.log("    [b.js] sees a.status =", (aPartial as any).status ?? "undefined");

      (requireCache.get("b.js")!.exports as any).status = "b-complete";
      console.log("    [b.js] done");
    });

    void b;
    (requireCache.get("a.js")!.exports as any).status = "a-complete";
    console.log("    [a.js] done");
  });

  console.log("\n  最终结果:");
  console.log("    a.exports:", aExports);
  console.log("    b.exports:", requireCache.get("b.js")!.exports);
  console.log("  结论: b.js 看到 a 的部分导出（name 有值，status 未定义）");
}

// ============================================================
// 2. CJS 延迟加载打破循环
// ============================================================

function demoCjsLazyRequire() {
  console.log("\n=== 2. CJS 延迟加载打破循环 ===");

  const cache = new Map<string, { exports: Record<string, unknown> }>();

  function requireSim(name: string, factory: () => void) {
    if (cache.has(name)) return cache.get(name)!.exports;
    const mod = { exports: {} as Record<string, unknown> };
    cache.set(name, mod);
    factory();
    return mod.exports;
  }

  // 正例：将 require 移到函数内部
  const a = requireSim("lazy-a.js", () => {
    console.log("    [lazy-a.js] defining functions...");
    cache.get("lazy-a.js")!.exports.getBName = function () {
      // 延迟加载：在函数调用时才 require b
      const b = requireSim("lazy-b.js", () => {
        console.log("    [lazy-b.js] executing (delayed)");
        cache.get("lazy-b.js")!.exports.name = "lazy-b";
      });
      return (b as any).name;
    };
  });

  const b = requireSim("lazy-b.js", () => {
    console.log("    [lazy-b.js] executing...");
    cache.get("lazy-b.js")!.exports.name = "lazy-b";
    cache.get("lazy-b.js")!.exports.getAName = function () {
      return "lazy-a";
    };
  });

  console.log("  a.getBName() =", (a as any).getBName());
  console.log("  b.name =", (b as any).name);
  console.log("  结论: 将 require 移到函数内部可打破循环，双方均看到完整导出");
}

// ============================================================
// 3. ESM 循环依赖与 TDZ 模拟
// ============================================================

function demoEsmCircularTDZ() {
  console.log("\n=== 3. ESM 循环依赖与 TDZ 行为模拟 ===");

  // 模拟 ESM 模块环境记录和绑定
  const bindings = new Map<string, Map<string, { value: unknown; initialized: boolean }>>();

  function createModule(name: string) {
    bindings.set(name, new Map());
  }

  function defineExport(moduleName: string, bindingName: string, value: unknown) {
    const mod = bindings.get(moduleName)!;
    mod.set(bindingName, { value, initialized: true });
  }

  function getImport(targetModule: string, bindingName: string): unknown {
    const bind = bindings.get(targetModule)?.get(bindingName);
    if (!bind || !bind.initialized) {
      throw new ReferenceError(
        `Cannot access '${bindingName}' before initialization (TDZ)`
      );
    }
    return bind.value;
  }

  // 场景：安全版本（导出在导入前初始化）
  console.log("  [安全版本] a 的导出在触发 b 之前完成:");
  createModule("safe-a");
  createModule("safe-b");

  defineExport("safe-a", "x", 100); // x 先初始化
  // safe-b 被触发，访问 safe-a.x
  try {
    const x = getImport("safe-a", "x");
    defineExport("safe-b", "y", x + 1);
    console.log("    safe-b.y =", getImport("safe-b", "y"));
  } catch (e: any) {
    console.log("    ERROR:", e.message);
  }

  // 场景：危险版本（导出在导入后初始化）
  console.log("\n  [危险版本] a 先触发 b，b 访问 a 的未初始化导出:");
  createModule("unsafe-a");
  createModule("unsafe-b");

  // unsafe-a 先 import unsafe-b，此时 unsafe-a.x 尚未初始化
  try {
    // 模拟 b 被触发后访问 a.x
    const x = getImport("unsafe-a", "x"); // TDZ！x 未初始化
    defineExport("unsafe-b", "y", x);
  } catch (e: any) {
    console.log("    ERROR:", e.message);
  }

  // 之后才初始化 a.x（为时已晚）
  defineExport("unsafe-a", "x", 42);
  console.log("    (a.x 之后才被赋值为 42，但 b 已经抛错)");
}

// ============================================================
// 4. 循环依赖检测算法 (DFS)
// ============================================================

function demoCycleDetection() {
  console.log("\n=== 4. 循环依赖检测算法 (DFS) ===");

  // 用邻接表表示模块依赖图
  const graph: Record<string, string[]> = {
    main: ["utils", "services"],
    utils: ["helpers"],
    services: ["utils", "db"],
    helpers: [],
    db: ["models"],
    models: ["services"], // ← 循环: models → services → db → models
  };

  type Color = "white" | "gray" | "black";
  const colors = new Map<string, Color>();
  const parent = new Map<string, string | null>();
  const cycles: string[][] = [];

  for (const node of Object.keys(graph)) {
    colors.set(node, "white");
    parent.set(node, null);
  }

  function dfs(node: string, path: string[]) {
    colors.set(node, "gray");

    for (const neighbor of graph[node] ?? []) {
      if (colors.get(neighbor) === "white") {
        parent.set(neighbor, node);
        dfs(neighbor, [...path, neighbor]);
      } else if (colors.get(neighbor) === "gray") {
        // 发现后向边 → 循环！
        const cycleStart = path.indexOf(neighbor);
        const cycle = path.slice(cycleStart).concat([neighbor]);
        cycles.push(cycle);
        console.log(`    发现循环: ${cycle.join(" → ")}`);
      }
    }

    colors.set(node, "black");
  }

  console.log("  模块依赖图:", JSON.stringify(graph));
  console.log("  检测结果:");
  for (const node of Object.keys(graph)) {
    if (colors.get(node) === "white") {
      dfs(node, [node]);
    }
  }

  if (cycles.length === 0) {
    console.log("    未发现循环依赖 (DAG)");
  } else {
    console.log(`    共发现 ${cycles.length} 个循环`);
  }
}

// ============================================================
// 5. 重构策略演示：提取公共模块
// ============================================================

function demoRefactorExtractCommon() {
  console.log("\n=== 5. 重构策略：提取公共模块 ===");

  // 循环前：user.js ↔ order.js（互相导入）
  // user.js 需要 Order 类型，order.js 需要 User 类型

  // 重构后：提取 types.js，双方均依赖它
  const typesModule = {
    User: class User { id: number; name: string; constructor(id: number, name: string) { this.id = id; this.name = name; } },
    Order: class Order { id: number; userId: number; constructor(id: number, userId: number) { this.id = id; this.userId = userId; } },
  };

  const userModule = {
    createUser(name: string) {
      return new typesModule.User(Date.now(), name);
    },
    getUserOrders(userId: number) {
      // 通过参数或查询获取，不直接依赖 order 模块
      return [{ orderId: 1, userId }];
    },
  };

  const orderModule = {
    createOrder(userId: number) {
      return new typesModule.Order(Date.now(), userId);
    },
    getOrderUser(orderId: number) {
      // 通过参数或查询获取，不直接依赖 user 模块
      return { userId: 100, orderId };
    },
  };

  const user = userModule.createUser("Alice");
  const order = orderModule.createOrder(user.id);

  console.log("  提取公共 types 模块后:");
  console.log("    user.js → types.js");
  console.log("    order.js → types.js");
  console.log("    无循环！");
  console.log("    创建的用户:", { id: user.id, name: user.name });
  console.log("    创建的订单:", { id: order.id, userId: order.userId });
}

// ============================================================
// 6. 重构策略演示：事件驱动解耦
// ============================================================

function demoRefactorEventDriven() {
  console.log("\n=== 6. 重构策略：事件驱动解耦 ===");

  // 简单的事件总线
  const eventBus = {
    listeners: new Map<string, ((data: unknown) => void)[]>(),
    on(event: string, handler: (data: unknown) => void) {
      if (!this.listeners.has(event)) this.listeners.set(event, []);
      this.listeners.get(event)!.push(handler);
    },
    emit(event: string, data: unknown) {
      for (const handler of this.listeners.get(event) ?? []) {
        handler(data);
      }
    },
  };

  // module-a：发布事件，不直接依赖 module-b
  const moduleA = {
    doSomething() {
      console.log("    [module-a] doing something...");
      eventBus.emit("a:completed", { result: "data-from-a" });
    },
  };

  // module-b：订阅事件，不直接依赖 module-a
  const moduleB = {
    init() {
      eventBus.on("a:completed", (data) => {
        console.log("    [module-b] received event from a:", data);
      });
    },
  };

  moduleB.init();
  moduleA.doSomething();

  console.log("  结论: A 和 B 通过事件总线通信，无直接 import 依赖，循环被打破");
}

// ============================================================
// 7. 动态 import() 打破循环
// ============================================================

async function demoDynamicImportBreakCycle() {
  console.log("\n=== 7. 动态 import() 打破循环 ===");

  // 模拟动态导入：在运行时异步加载模块
  const moduleMap = new Map<string, Record<string, unknown>>([
    ["dynamic-a", { name: "dynamic-a", helper: (x: number) => x * 2 }],
    ["dynamic-b", { name: "dynamic-b", compute: (x: number) => x + 10 }],
  ]);

  async function dynamicImport(id: string) {
    await new Promise((resolve) => setTimeout(resolve, 10)); // 模拟异步加载
    return moduleMap.get(id) ?? {};
  }

  // a 不需要在顶部静态导入 b
  const a = await dynamicImport("dynamic-a");
  console.log("  loaded dynamic-a:", a.name);

  // 仅在需要时才动态加载 b
  const needB = true;
  if (needB) {
    const b = await dynamicImport("dynamic-b");
    console.log("  loaded dynamic-b:", b.name);
    console.log("  a.helper(5) =", (a.helper as Function)(5));
    console.log("  b.compute(5) =", (b.compute as Function)(5));
  }

  console.log("  结论: 动态 import() 将静态依赖变为运行时依赖，打破编译时循环");
}

// ============================================================
// Main Demo Entry
// ============================================================

export async function demo(): Promise<void> {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     06-cyclic-dependencies.ts                                  ║");
  console.log("║     Cyclic Dependencies Demonstrations                        ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  demoCjsCircularDependency();
  demoCjsLazyRequire();
  demoEsmCircularTDZ();
  demoCycleDetection();
  demoRefactorExtractCommon();
  demoRefactorEventDriven();
  await demoDynamicImportBreakCycle();

  console.log("\n=== Summary ===");
  console.log("  • CJS 循环依赖通过缓存机制允许，但可能导致部分导出");
  console.log("  • CJS 延迟 require（函数内）可打破循环，双方看到完整导出");
  console.log("  • ESM 循环依赖中，未初始化的导出处于 TDZ，访问抛 ReferenceError");
  console.log("  • DFS 可检测循环依赖（O(V+E) 时间复杂度）");
  console.log("  • 重构策略: 提取公共模块、依赖倒置、事件驱动、动态导入");
  console.log("  • 工具: madge, dependency-cruiser, eslint-plugin-import");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
