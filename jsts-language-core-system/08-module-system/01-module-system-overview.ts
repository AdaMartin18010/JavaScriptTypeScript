/**
 * 模块系统综述演示 (Module System Overview)
 *
 * 涵盖: 模块封装概念、导入/导出模式、模块图概念、
 *       CJS vs ESM 的基础差异演示、模块解析与循环依赖模拟
 */

// ============================================================
// 1. ESM 导出模式演示 (Export Patterns)
// ============================================================

// 本文件为单个 .ts，以下通过对象与闭包模拟模块接口语义

const mathModule = {
  PI: 3.141592653589793,
  add(a: number, b: number): number {
    return a + b;
  },
  subtract(a: number, b: number): number {
    return a - b;
  },
};

const utilsModule = {
  capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
  },
  debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number): T {
    let timer: ReturnType<typeof setTimeout>;
    return ((...args: unknown[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    }) as T;
  },
};

function demoExportPatterns() {
  console.log("\n=== 1. ESM 导出模式 (Export Patterns) ===");

  // ✅ Named Export 等价：从对象中解构获取
  const { PI, add } = mathModule;
  console.log("  Named Import simulation: PI =", PI);
  console.log("  add(2, 3) =", add(2, 3));

  // ✅ Namespace Import 等价：整体导入
  const math = mathModule;
  console.log("  Namespace Import simulation: math.PI =", math.PI);

  // ✅ Default Export 等价：单一主要导出
  const Calculator = class {
    value = 0;
    add(n: number) {
      this.value += n;
      return this;
    }
    getValue() {
      return this.value;
    }
  };
  const calc = new Calculator();
  console.log(
    "  Default Export simulation: Calculator add result =",
    calc.add(5).getValue()
  );

  // ✅ Side-effect Import 等价：执行初始化逻辑
  const sideEffectModule = (() => {
    console.log(
      "  Side-effect module executed: initializing global registry..."
    );
    return { initialized: true };
  })();
  void sideEffectModule;
}

// ============================================================
// 2. 模块封装性演示 (Encapsulation)
// ============================================================

function demoEncapsulation() {
  console.log("\n=== 2. 模块封装性 (Encapsulation) ===");

  // 模拟模块内部私有状态
  function createCounterModule() {
    let count = 0; // 私有变量，外部无法直接访问
    return {
      increment() {
        count++;
        return count;
      },
      decrement() {
        count--;
        return count;
      },
      getCount() {
        return count;
      },
    };
  }

  const counter = createCounterModule();
  console.log("  initial count:", counter.getCount());
  console.log("  after increment:", counter.increment());
  console.log("  after increment:", counter.increment());

  // ❌ 反例：无模块系统时，所有变量暴露于全局/函数作用域
  // var count = 0; // 可被任何代码意外修改
}

// ============================================================
// 3. 依赖显式化演示 (Explicit Dependencies)
// ============================================================

function demoExplicitDependencies() {
  console.log("\n=== 3. 依赖显式化 (Explicit Dependencies) ===");

  // ✅ 正例：依赖通过参数显式传递
  function formatUserName(
    user: { firstName: string; lastName: string },
    capitalizeFn: (s: string) => string
  ) {
    return `${capitalizeFn(user.firstName)} ${capitalizeFn(user.lastName)}`;
  }

  const user = { firstName: "alice", lastName: "smith" };
  const result = formatUserName(user, utilsModule.capitalize);
  console.log("  Explicit dependency result:", result);

  // ❌ 反例：隐式全局依赖（无模块时代的模式）
  // function badFormatUserName(user) {
  //   return `${capitalize(user.firstName)} ...`; // capitalize 来自哪里？全局！
  // }
}

// ============================================================
// 4. Singleton 语义演示 (Singleton Guarantee)
// ============================================================

function demoSingleton() {
  console.log("\n=== 4. Singleton 语义演示 ===");

  // 模拟 CJS Module Cache 行为
  const moduleCache = new Map<string, { exports: unknown }>();

  function requireSimulated(moduleId: string, factory: () => unknown) {
    if (moduleCache.has(moduleId)) {
      console.log(`  Cache hit for "${moduleId}"`);
      return moduleCache.get(moduleId)!.exports;
    }
    console.log(`  Cache miss for "${moduleId}", executing...`);
    const exports = factory();
    moduleCache.set(moduleId, { exports });
    return exports;
  }

  // 模拟一个带状态的模块
  let moduleExecutionCount = 0;
  function createStateModule() {
    moduleExecutionCount++;
    return {
      id: Math.random().toString(36).slice(2),
      executionCount: moduleExecutionCount,
    };
  }

  const instance1 = requireSimulated("state-module", createStateModule);
  const instance2 = requireSimulated("state-module", createStateModule);
  const instance3 = requireSimulated("state-module", createStateModule);

  console.log("  instance1 === instance2:", instance1 === instance2);
  console.log("  instance1.id:", (instance1 as any).id);
  console.log("  instance2.id:", (instance2 as any).id);
  console.log("  模块实际执行次数:", moduleExecutionCount, "（应为 1）");
}

// ============================================================
// 5. CJS vs ESM 核心差异模拟
// ============================================================

function demoCjsVsEsmDifferences() {
  console.log("\n=== 5. CJS vs ESM 核心差异模拟 ===");

  // --- 模拟 CJS 的值拷贝语义 ---
  let cjsExportValue = 42;
  const cjsModule = {
    get value() {
      return cjsExportValue;
    },
  };
  const cjsImport = { value: cjsModule.value }; // 拷贝时刻的值
  cjsExportValue = 100; // 重新赋值
  console.log(
    "  CJS copy semantics: imported value =",
    cjsImport.value,
    "(still 42, not live)"
  );

  // --- 模拟 ESM 的 Live Binding ---
  let esmBinding = 42;
  const esmImport = {
    get value() {
      return esmBinding;
    }, // Live Binding：始终读取当前值
  };
  esmBinding = 100; // 重新赋值
  console.log(
    "  ESM live binding: imported value =",
    esmImport.value,
    "(tracks 100)"
  );

  // --- 静态 vs 动态分析 ---
  console.log("\n  静态分析友好性:");
  console.log(
    "    ESM: import/export 必须在顶层，解析时即可确定依赖图"
  );
  console.log("    CJS: require() 可出现在任意位置，路径可动态计算");

  const dynamicPath = "./" + "module" + ".js";
  console.log("    CJS dynamic require path example:", dynamicPath);
  // ESM 中动态路径需使用 import()：
  // const mod = await import(`./${name}.js`);
}

// ============================================================
// 6. 模块图拓扑排序与执行顺序演示
// ============================================================

function demoModuleGraph() {
  console.log("\n=== 6. 模块图 (Module Graph) 与执行顺序 ===");

  // 模拟模块依赖图：main → a → c → d； main → b → c
  const executionOrder: string[] = [];

  function defineModule(
    name: string,
    deps: string[],
    factory: () => void
  ) {
    return { name, deps, factory, executed: false };
  }

  const modules = {
    d: defineModule("d", [], () => executionOrder.push("d")),
    c: defineModule("c", ["d"], () => executionOrder.push("c")),
    a: defineModule("a", ["c"], () => executionOrder.push("a")),
    b: defineModule("b", ["c"], () => executionOrder.push("b")),
    main: defineModule("main", ["a", "b"], () =>
      executionOrder.push("main")
    ),
  };

  function executeModule(name: string, visited = new Set<string>()) {
    if (visited.has(name)) return; // 防止循环
    visited.add(name);
    const mod = modules[name as keyof typeof modules];
    for (const dep of mod.deps) {
      executeModule(dep, visited);
    }
    if (!mod.executed) {
      mod.factory();
      mod.executed = true;
    }
  }

  executeModule("main");
  console.log("  执行顺序 (Post-Order):", executionOrder.join(" → "));
  console.log("  说明：依赖先于被依赖者执行（d → c → a → b → main）");
}

// ============================================================
// 7. 循环依赖概念演示 (Cyclic Dependencies)
// ============================================================

function demoCyclicDependencies() {
  console.log("\n=== 7. 循环依赖 (Cyclic Dependencies) 概念演示 ===");

  // 模拟 CJS 风格的循环依赖：部分导出
  const cjsCache = new Map<string, { exports: Record<string, unknown> }>();
  const cjsFactories = new Map<
    string,
    (exports: Record<string, unknown>, require: (n: string) => unknown) => void
  >();

  function registerCjs(
    name: string,
    factory: (exports: Record<string, unknown>, require: (n: string) => unknown) => void
  ) {
    cjsFactories.set(name, factory);
  }

  function cjsRequire(name: string): Record<string, unknown> {
    if (cjsCache.has(name)) {
      return cjsCache.get(name)!.exports;
    }
    const moduleExports: Record<string, unknown> = {};
    cjsCache.set(name, { exports: moduleExports });
    const factory = cjsFactories.get(name);
    if (factory) {
      factory(moduleExports, cjsRequire);
    }
    return moduleExports;
  }

  // 模块 A 导入 B，B 又导入 A
  registerCjs("a", (exports, require) => {
    exports.loadB = () => require("b");
    exports.name = "A";
  });

  registerCjs("b", (exports, require) => {
    exports.loadA = () => require("a");
    exports.name = "B";
  });

  const modA = cjsRequire("a");
  const modB = cjsRequire("b");

  console.log("  CJS 循环依赖: modA.loadB().name =", (modA.loadB as any)().name);
  console.log("  CJS 循环依赖: modB.loadA().name =", (modB.loadA as any)().name);

  // 演示 CJS 的“部分导出”陷阱：若 B 在 A 执行期间 require A，A 的 exports 尚未完成
  cjsCache.clear();
  registerCjs("partial-a", (exports, require) => {
    const b = require("partial-b");
    exports.name = "A";
    exports.gotBName = (b as any).name; // B 在 A 完成前加载，可能拿到不完整的 A
  });
  registerCjs("partial-b", (exports, require) => {
    const a = require("partial-a"); // 此时 partial-a 的 exports 还是空对象
    exports.name = "B";
    exports.gotAName = (a as any).name; // undefined，因为 A 还没执行到 exports.name
  });

  const partialA = cjsRequire("partial-a");
  console.log("  CJS 部分导出陷阱: partial-a.gotBName =", partialA.gotBName);
  console.log("  CJS 部分导出陷阱: partial-b.gotAName =", cjsRequire("partial-b").gotAName);

  // ESM 风格的 TDZ 模拟：若绑定未初始化则访问报错
  console.log("  ESM 风格: 若循环依赖导致绑定在 TDZ 中，访问会抛出 ReferenceError");
}

// ============================================================
// 8. 模块解析模拟 (Module Resolution)
// ============================================================

function demoModuleResolution() {
  console.log("\n=== 8. 模块解析 (Module Resolution) 模拟 ===");

  // 模拟 Node.js 的模块解析算法（简化版）
  const fileSystem = new Map<string, string>([
    ["/project/src/utils.js", "utils"],
    ["/project/src/helpers/index.js", "helpers"],
    ["/project/node_modules/lodash/index.js", "lodash"],
  ]);

  function resolve(
    specifier: string,
    contextPath: string
  ): string | undefined {
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      // 相对路径解析（简化）
      const resolved = contextPath.replace(/\/[^\/]+$/, "/") + specifier;
      if (fileSystem.has(resolved)) return resolved;
      if (fileSystem.has(resolved + "/index.js"))
        return resolved + "/index.js";
    }
    if (!specifier.startsWith(".") && !specifier.startsWith("/")) {
      // 裸指定符 -> node_modules
      const bare = "/project/node_modules/" + specifier + "/index.js";
      if (fileSystem.has(bare)) return bare;
    }
    return undefined;
  }

  console.log('  resolve("./utils", "/project/src/main.js") =>', resolve("./utils", "/project/src/main.js"));
  console.log('  resolve("lodash", "/project/src/main.js") =>', resolve("lodash", "/project/src/main.js"));
}

// ============================================================
// 9. 历史演进代码形态对比
// ============================================================

function demoEvolution() {
  console.log("\n=== 9. 历史演进代码形态对比 ===");

  // 1. Script 时代：全局污染
  console.log("  [1995] Script: 全局变量");
  // var PI = 3.14; // 污染全局

  // 2. IIFE 模式：作用域隔离
  console.log("  [2005] IIFE: 函数作用域封装");
  const iifeMath = (function () {
    const PI = 3.14159;
    function add(a: number, b: number) {
      return a + b;
    }
    return { PI, add };
  })();
  console.log("    IIFE result: add(1,2) =", iifeMath.add(1, 2));

  // 3. CommonJS：同步 require
  console.log("  [2009] CommonJS: module.exports + require");
  const cjsMath = {
    exports: {
      PI: 3.14159,
      add: (a: number, b: number) => a + b,
    },
  };
  const requiredMath = cjsMath.exports;
  console.log(
    "    CJS result: add(1,2) =",
    (requiredMath as any).add(1, 2)
  );

  // 4. ESM：静态导入导出
  console.log("  [2015] ESM: import/export (static)");
  // import { add } from "./math.js";
  // export const PI = 3.14159;
  console.log("    ESM: 编译时确定依赖，支持 Tree Shaking");
}

// ============================================================
// Main Demo Entry
// ============================================================

export function demo(): void {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║     01-module-system-overview.ts                               ║"
  );
  console.log(
    "║     Module System Overview Demonstrations                     ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );

  demoExportPatterns();
  demoEncapsulation();
  demoExplicitDependencies();
  demoSingleton();
  demoCjsVsEsmDifferences();
  demoModuleGraph();
  demoCyclicDependencies();
  demoModuleResolution();
  demoEvolution();

  console.log("\n=== Summary ===");
  console.log("  • 模块系统解决封装、复用、依赖显式化三大问题");
  console.log("  • ESM 采用静态结构 + Live Bindings，是现代首选");
  console.log("  • CJS 采用运行时 require + 值拷贝，服务端生态庞大");
  console.log("  • 模块图按拓扑排序执行，确保依赖先求值");
  console.log("  • Singleton 语义由 Module Cache 保证");
  console.log("  • 循环依赖在 CJS 中为部分导出，在 ESM 中表现为 TDZ");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
