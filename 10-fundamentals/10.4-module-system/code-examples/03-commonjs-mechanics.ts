/**
 * CommonJS 机制深度解析演示 (CommonJS Mechanics Deep Dive)
 *
 * 涵盖: require() 同步语义, Module Wrapper, module.exports vs exports,
 *       require.cache 单例保证, 循环依赖部分导出, __filename/__dirname
 *
 * 运行方式: npx tsx 03-commonjs-mechanics.ts
 */

// ============================================================
// 1. Module Wrapper 概念演示
// ============================================================

function demoModuleWrapper() {
  console.log("\n=== 1. Module Wrapper 概念演示 ===");

  // Node.js 实际包装方式：
  // (function(exports, require, module, __filename, __dirname) {
  //   // 用户代码
  // });

  function runModuleWrapper(
    userCode: (ctx: {
      exports: Record<string, unknown>;
      require: (id: string) => unknown;
      module: { exports: Record<string, unknown> };
      __filename: string;
      __dirname: string;
    }) => void,
    filename: string
  ) {
    const module = { exports: {} as Record<string, unknown> };
    const exports = module.exports;
    const __dirname = filename.substring(0, filename.lastIndexOf("/"));

    const require = (id: string) => {
      console.log(`    [require("${id}")] from ${filename}`);
      return { simulated: true, id };
    };

    userCode({ exports, require, module, __filename: filename, __dirname });
    return module.exports;
  }

  const result = runModuleWrapper(({ exports, require, module, __filename, __dirname }) => {
    console.log("  模块内可用变量:");
    console.log("    __filename:", __filename);
    console.log("    __dirname:", __dirname);

    exports.greet = (name: string) => `Hello, ${name}!`;
    exports.PI = 3.14159;

    console.log("    exports === module.exports:", exports === module.exports);
  }, "/project/src/math.js");

  console.log("  模块导出结果:", result);
  console.log("  调用导出函数:", (result as any).greet("CommonJS"));
}

// ============================================================
// 2. exports vs module.exports 差异演示
// ============================================================

function demoExportsVsModuleExports() {
  console.log("\n=== 2. exports vs module.exports 差异演示 ===");

  // 场景 1：exports.xxx = ... （正确，修改同一对象）
  const module1: { exports: Record<string, unknown> } = { exports: {} };
  const exports1 = module1.exports;
  exports1.foo = 1;
  exports1.bar = 2;
  console.log("  exports.foo/bar = ... 结果:", module1.exports);

  // 场景 2：module.exports = newObj （正确，替换引用）
  const module2: { exports: Record<string, unknown> } = { exports: {} };
  const exports2 = module2.exports;
  exports2.old = "old";
  module2.exports = { newProp: "new" };
  console.log("  module.exports = newObj 结果:", module2.exports);
  console.log("    exports2 仍指向旧对象:", exports2);

  // 场景 3：exports = newObj （错误，仅改变局部变量）
  const module3: { exports: Record<string, unknown> } = { exports: {} };
  let exports3: Record<string, unknown> = module3.exports;
  exports3.valid = "yes";
  exports3 = { invalid: "no" }; // ❌ 危险操作
  console.log("  exports = newObj 后 module.exports:", module3.exports);
  console.log("    （注意：module.exports 未改变！）");

  // 场景 4：导出单一函数/类（必须用 module.exports）
  const module4: { exports: unknown } = { exports: {} };
  module4.exports = function greet(name: string) {
    return `Hi, ${name}`;
  };
  console.log("  module.exports = function 结果类型:", typeof module4.exports);
}

// ============================================================
// 3. Module Cache 与 Singleton 保证演示
// ============================================================

function demoModuleCache() {
  console.log("\n=== 3. Module Cache 与 Singleton 保证 ===");

  const requireCache = new Map<string, { exports: unknown; loaded: boolean }>();
  let executionCount = 0;

  function simulatedRequire(moduleId: string, factory: () => unknown) {
    const key = `/project/node_modules/${moduleId}`;

    if (requireCache.has(key)) {
      console.log(`  [Cache HIT] "${moduleId}"`);
      return requireCache.get(key)!.exports;
    }

    console.log(`  [Cache MISS] "${moduleId}" — executing...`);
    executionCount++;

    // 关键：先加入缓存，再执行！（防止循环依赖无限递归）
    const moduleEntry = { exports: {} as unknown, loaded: false };
    requireCache.set(key, moduleEntry);

    const exports = factory();
    moduleEntry.exports = exports;
    moduleEntry.loaded = true;

    return exports;
  }

  function createStatefulModule() {
    const id = Math.random().toString(36).slice(2, 8);
    let callCount = 0;
    return {
      id,
      getCallCount() { return callCount; },
      invoke() { callCount++; return callCount; },
    };
  }

  const mod1 = simulatedRequire("stateful", createStatefulModule);
  const mod2 = simulatedRequire("stateful", createStatefulModule);
  const mod3 = simulatedRequire("stateful", createStatefulModule);

  console.log("  mod1 === mod2:", mod1 === mod2);
  console.log("  mod1.id:", (mod1 as any).id);
  console.log("  mod2.id:", (mod2 as any).id);
  console.log("  模块工厂执行次数:", executionCount, "（应为 1）");

  (mod1 as any).invoke();
  (mod1 as any).invoke();
  console.log("  mod1 call count:", (mod1 as any).getCallCount());
  console.log("  mod2 call count:", (mod2 as any).getCallCount(), "（同一实例，状态共享）");
}

// ============================================================
// 4. require() 解析算法模拟
// ============================================================

function demoRequireResolution() {
  console.log("\n=== 4. require() 解析算法模拟 ===");

  function resolveModule(id: string, fromDir: string): string | null {
    if (["fs", "path", "os", "util"].includes(id)) {
      return `<core> ${id}`;
    }
    if (id.startsWith("./") || id.startsWith("../")) {
      return `${fromDir}/${id}`;
    }
    if (id.startsWith("/")) {
      return id;
    }
    return `${fromDir}/node_modules/${id}/index.js`;
  }

  const testCases = [
    { id: "fs", from: "/project/src" },
    { id: "./utils", from: "/project/src" },
    { id: "../config", from: "/project/src" },
    { id: "lodash", from: "/project/src" },
    { id: "/absolute/path.js", from: "/project/src" },
  ];

  for (const tc of testCases) {
    const resolved = resolveModule(tc.id, tc.from);
    console.log(`  require("${tc.id}") from "${tc.from}" → "${resolved}"`);
  }
}

// ============================================================
// 5. 循环依赖（部分导出）演示
// ============================================================

function demoCircularDependency() {
  console.log("\n=== 5. 循环依赖（部分导出）演示 ===");

  const cache = new Map<string, { exports: Record<string, unknown> }>();

  function loadModule(name: string, factory: () => void) {
    if (cache.has(name)) {
      console.log(`    [cycle] "${name}" already in cache, returning partial exports`);
      return cache.get(name)!.exports;
    }

    const module = { exports: {} as Record<string, unknown> };
    cache.set(name, module); // 先缓存，再执行！
    console.log(`    [load] "${name}" cached, executing...`);
    factory();
    return module.exports;
  }

  console.log("  执行顺序模拟:");
  const aExports = loadModule("a", () => {
    console.log("    a.js: start execution");
    (cache.get("a")!.exports as any).stage = "a-start";

    const b = loadModule("b", () => {
      console.log("    b.js: start execution");
      (cache.get("b")!.exports as any).name = "module-b";

      const aPartial = loadModule("a", () => {});
      console.log("    b.js: sees a.stage =", (aPartial as any).stage);

      (cache.get("b")!.exports as any).seenAStage = (aPartial as any).stage;
      console.log("    b.js: done");
    });

    void b;
    (cache.get("a")!.exports as any).stage = "a-complete";
    console.log("    a.js: done");
  });

  console.log("\n  最终结果:");
  console.log("    a.exports:", aExports);
  console.log("    b.exports:", cache.get("b")!.exports);
  console.log("  结论: b 看到的是 a 的部分导出（a-start，而非 a-complete）");
}

// ============================================================
// 6. __filename / __dirname 语义演示
// ============================================================

function demoFilenameDirname() {
  console.log("\n=== 6. __filename / __dirname 语义演示 ===");

  // 在 ESM 中推导等价的 __filename / __dirname
  const currentFile = new URL(import.meta.url).pathname;
  const currentDir = currentFile.substring(0, currentFile.lastIndexOf("/"));

  console.log("  ESM import.meta.url:", import.meta.url);
  console.log("  推导的 __filename (POSIX):", currentFile);
  console.log("  推导的 __dirname (POSIX):", currentDir);

  console.log("\n  对比:");
  console.log("  | 变量       | CJS 提供方式              | ESM 等价写法                        |");
  console.log("  |------------|---------------------------|-------------------------------------|");
  console.log("  | __filename | 运行时注入                | fileURLToPath(import.meta.url)      |");
  console.log("  | __dirname  | 运行时注入                | dirname(fileURLToPath(import.meta.url)) |");
}

// ============================================================
// 7. 删除缓存强制重载演示
// ============================================================

function demoDeleteCache() {
  console.log("\n=== 7. 删除缓存强制重载 (Hot Reload 模拟) ===");

  const hotCache = new Map<string, { exports: unknown }>();
  let version = 1;

  function hotRequire(id: string) {
    const key = id;
    if (!hotCache.has(key)) {
      const exports = { version, data: `module-v${version}` };
      hotCache.set(key, { exports });
    }
    return hotCache.get(key)!.exports;
  }

  console.log("  首次加载:", hotRequire("config"));
  version = 2; // 模拟文件修改
  console.log("  缓存未清除，再次加载:", hotRequire("config"));

  hotCache.delete("config");
  console.log("  清除缓存后加载:", hotRequire("config"));

  console.log("  注意: 生产代码中谨慎操作 require.cache");
}

// ============================================================
// 8. CJS 默认非严格模式行为演示
// ============================================================

function demoSloppyMode() {
  console.log("\n=== 8. CJS 非严格模式行为（对比 ESM） ===");

  const sloppyCode = new Function("obj", "with (obj) { return x + y; }");
  const result = sloppyCode({ x: 10, y: 20 });
  console.log("  with 语句结果 (sloppy mode):", result);

  console.log("  ESM 隐式严格模式: with 语句 → SyntaxError");

  const simulatedModule: { exports: { name: string } } = { exports: { name: "test" } };
  const sloppyThis = (function (this: any) { return this; }).call(simulatedModule.exports);
  console.log("  CJS 模块内 this === module.exports:", sloppyThis === simulatedModule.exports);

  console.log("  ESM 模块内 this === undefined: true");
}

// ============================================================
// Main Demo Entry
// ============================================================

export function demo(): void {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     03-commonjs-mechanics.ts                                   ║");
  console.log("║     CommonJS Mechanics Deep Dive Demonstrations               ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  demoModuleWrapper();
  demoExportsVsModuleExports();
  demoModuleCache();
  demoRequireResolution();
  demoCircularDependency();
  demoFilenameDirname();
  demoDeleteCache();
  demoSloppyMode();

  console.log("\n=== Summary ===");
  console.log("  • Module Wrapper 提供作用域隔离和 5 个注入变量");
  console.log("  • exports 是 module.exports 的引用；exports = newObj 危险");
  console.log("  • require.cache 保证 Singleton：同一路径只执行一次");
  console.log("  • 循环依赖时，后进入的模块看到先进入模块的部分导出");
  console.log("  • __filename / __dirname 由 Node.js 运行时注入");
  console.log("  • CJS 默认非严格模式；模块内 this === module.exports");
  console.log("  • 删除 require.cache 可实现热重载，但应谨慎使用");
}

// Run if executed directly
const currentFile = new URL(import.meta.url).pathname;
if (process.argv[1]?.replace(/\\/g, "/") === currentFile) {
  demo();
}
