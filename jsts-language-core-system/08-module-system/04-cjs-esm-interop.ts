/**
 * CJS/ESM 互操作演示 (CJS-ESM Interoperability)
 *
 * 涵盖: __esModule 模拟, createRequire, Conditional Exports 概念,
 *       Dual Package Hazard 模拟, moduleResolution 策略差异,
 *       type: module / .mjs / .cjs 语义演示
 */

// ============================================================
// 1. __esModule 与 Babel 互操作模拟
// ============================================================

function demoEsModuleFlag() {
  console.log("\n=== 1. __esModule 标记与 Babel 互操作模拟 ===");

  // 模拟 Babel 转译后的 CJS 模块
  function createBabelCompiledModule() {
    const exports: Record<string, unknown> = {};
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = function greet(name: string) {
      return `Hello, ${name}`;
    };
    exports.version = "1.0.0";
    exports.PI = 3.14159;
    return exports;
  }

  // 模拟 Babel 的 _interopRequireDefault 辅助函数
  function interopRequireDefault(mod: any) {
    return mod && mod.__esModule ? mod : { default: mod };
  }

  const babelMod = createBabelCompiledModule();
  console.log("  Babel 编译后模块:", babelMod);
  console.log("  __esModule:", babelMod.__esModule);

  // ESM 风格导入（通过 interop 层）
  const wrapped = interopRequireDefault(babelMod);
  console.log("  interopRequireDefault 包装后:", wrapped);
  console.log("  default export:", (wrapped as any).default("ESM"));

  // 模拟非 Babel CJS 模块（无 __esModule）
  const plainCjs = function plainFunction() {
    return "plain";
  };
  (plainCjs as any).helper = "extra";
  const wrappedPlain = interopRequireDefault(plainCjs);
  console.log("  普通 CJS 模块包装后 default:", (wrappedPlain as any).default);
  console.log("    （整个 module.exports 成为 default）");
}

// ============================================================
// 2. createRequire 演示
// ============================================================

function demoCreateRequire() {
  console.log("\n=== 2. createRequire 演示 (ESM 中使用 CJS) ===");

  // 在 ESM 中，无法直接使用 require，但可通过 createRequire 创建
  // import { createRequire } from "node:module";
  // const require = createRequire(import.meta.url);

  console.log("  语法:");
  console.log("    import { createRequire } from 'node:module';");
  console.log("    const require = createRequire(import.meta.url);");
  console.log("    const cjs = require('./legacy.cjs');");

  // 模拟 createRequire 的行为
  const simulatedRequire = (id: string) => {
    console.log(`    [createRequire] resolved and loaded: "${id}"`);
    return { simulated: true, id };
  };

  const result = simulatedRequire("./legacy.cjs");
  console.log("  结果:", result);

  console.log("\n  注意: createRequire 创建的 require 函数与原生 CJS require");
  console.log("        共享同一个 require.cache");
}

// ============================================================
// 3. Dual Package Hazard 模拟
// ============================================================

function demoDualPackageHazard() {
  console.log("\n=== 3. Dual Package Hazard 模拟 ===");

  // 模拟一个同时发布 CJS 和 ESM 的库，两者各自维护状态
  const cjsInstance = {
    counter: 0,
    increment() { this.counter++; return this.counter; },
  };

  const esmInstance = {
    counter: 0,
    increment() { this.counter++; return this.counter; },
  };

  // CJS 消费者
  console.log("  CJS 消费者:");
  console.log("    increment() =", cjsInstance.increment());
  console.log("    increment() =", cjsInstance.increment());

  // ESM 消费者
  console.log("  ESM 消费者:");
  console.log("    increment() =", esmInstance.increment());

  console.log("\n  危险: 两个消费者看到的是不同的状态对象！");
  console.log(`    CJS counter: ${cjsInstance.counter}, ESM counter: ${esmInstance.counter}`);
  console.log("  解决方案: 将共享状态抽离到单一模块，CJS/ESM 入口均引用它");
}

// ============================================================
// 4. Conditional Exports 概念演示
// ============================================================

function demoConditionalExports() {
  console.log("\n=== 4. Conditional Exports 概念演示 ===");

  // 模拟 package.json 的 exports 字段解析
  const pkgExports = {
    ".": {
      import: { types: "./dist/index.d.mts", default: "./dist/index.mjs" },
      require: { types: "./dist/index.d.cts", default: "./dist/index.cjs" },
      default: "./dist/index.js",
    },
    "./utils": {
      import: "./dist/utils.mjs",
      require: "./dist/utils.cjs",
    },
  };

  function resolveExport(
    subpath: string,
    context: "import" | "require"
  ): string | null {
    const entry = (pkgExports as any)[subpath];
    if (!entry) return null;
    if (entry[context]) {
      return typeof entry[context] === "string"
        ? entry[context]
        : entry[context].default;
    }
    if (entry.default) return entry.default;
    return null;
  }

  console.log("  package.json exports 配置:");
  console.log(JSON.stringify(pkgExports, null, 4).replace(/^/gm, "    "));

  console.log("\n  解析结果:");
  console.log("    import 'pkg' →", resolveExport(".", "import"));
  console.log("    require('pkg') →", resolveExport(".", "require"));
  console.log("    import 'pkg/utils' →", resolveExport("./utils", "import"));

  console.log("\n  最佳实践:");
  console.log("    • 始终为 import/require 分别提供入口");
  console.log("    • 优先使用 .mjs/.cjs 避免 type 字段歧义");
  console.log("    • 为 TypeScript 提供 types 条件");
}

// ============================================================
// 5. type: module / .mjs / .cjs 语义演示
// ============================================================

function demoModuleTypeMarkers() {
  console.log("\n=== 5. type: module / .mjs / .cjs 语义 ===");

  // 模拟 Node.js 的模块类型判定逻辑
  function detectModuleType(
    filename: string,
    packageType: "commonjs" | "module" | undefined
  ): "esm" | "cjs" {
    if (filename.endsWith(".mjs")) return "esm";
    if (filename.endsWith(".cjs")) return "cjs";
    if (filename.endsWith(".js")) {
      return packageType === "module" ? "esm" : "cjs";
    }
    return "cjs";
  }

  const cases = [
    { file: "index.js", type: undefined },
    { file: "index.js", type: "module" as const },
    { file: "index.js", type: "commonjs" as const },
    { file: "index.mjs", type: undefined },
    { file: "index.cjs", type: "module" as const },
  ];

  console.log("  Node.js 模块类型判定:");
  for (const c of cases) {
    const result = detectModuleType(c.file, c.type);
    console.log(
      `    ${c.file} (package.type=${c.type ?? "未指定"}) → ${result.toUpperCase()}`
    );
  }

  console.log("\n  结论:");
  console.log("    • .mjs 强制 ESM，.cjs 强制 CJS（不受 package.type 影响）");
  console.log("    • .js 的格式由最近的 package.json 的 type 字段决定");
}

// ============================================================
// 6. TypeScript moduleResolution 策略差异
// ============================================================

function demoModuleResolutionStrategies() {
  console.log("\n=== 6. TypeScript moduleResolution 策略差异 ===");

  const strategies = [
    {
      name: "node",
      esm: "受限",
      cjs: "支持",
      extRequired: false,
      target: "Node.js CJS 项目",
    },
    {
      name: "nodenext",
      esm: "支持",
      cjs: "支持",
      extRequired: true,
      target: "Node.js ESM/CJS 混合库",
    },
    {
      name: "bundler",
      esm: "支持",
      cjs: "支持",
      extRequired: false,
      target: "Vite / Webpack / Rollup 项目",
    },
  ];

  console.log("  | 策略      | ESM   | CJS   | 扩展名 | 适用场景               |");
  console.log("  |-----------|-------|-------|--------|------------------------|");
  for (const s of strategies) {
    console.log(
      `  | ${s.name.padEnd(9)} | ${s.esm.padEnd(5)} | ${s.cjs.padEnd(5)} | ${s.extRequired ? "必须" : "可选  "} | ${s.target.padEnd(22)} |`
    );
  }

  console.log("\n  关键差异示例:");
  console.log("    // tsconfig.json with nodenext");
  console.log("    { \"compilerOptions\": { \"module\": \"NodeNext\", \"moduleResolution\": \"NodeNext\" } }");
  console.log("    // 必须写 import { foo } from './foo.js'（即使是 .ts 源码）");

  console.log("\n    // tsconfig.json with bundler");
  console.log("    { \"compilerOptions\": { \"module\": \"ESNext\", \"moduleResolution\": \"bundler\" } }");
  console.log("    // 可以写 import { foo } from './foo'（无扩展名）");
}

// ============================================================
// 7. ESM 导入 CJS 的命名空间模拟
// ============================================================

function demoEsmImportCjsNamespace() {
  console.log("\n=== 7. ESM 导入 CJS 的命名空间模拟 ===");

  // 模拟 Node.js 将 CJS module.exports 包装为 ESM Namespace 对象
  function createSyntheticNamespace(moduleExports: any) {
    if (moduleExports === null || typeof moduleExports !== "object") {
      return Object.freeze({ default: moduleExports, [Symbol.toStringTag]: "Module" });
    }

    const namespace: Record<string, unknown> = {};

    if (moduleExports.__esModule) {
      for (const key of Object.keys(moduleExports)) {
        if (key === "__esModule") continue;
        namespace[key] = moduleExports[key];
      }
      namespace.default = moduleExports.default ?? moduleExports;
    } else {
      namespace.default = moduleExports;
      for (const key of Object.keys(moduleExports)) {
        if (key === "default") continue;
        namespace[key] = moduleExports[key];
      }
    }

    Object.defineProperty(namespace, Symbol.toStringTag, { value: "Module" });
    return Object.freeze(namespace);
  }

  // 场景 A：普通 CJS（无 __esModule）
  const plainCjs = { foo: 1, bar: 2 };
  const nsA = createSyntheticNamespace(plainCjs);
  console.log("  普通 CJS → Namespace:", nsA);

  // 场景 B：Babel 编译 CJS（有 __esModule）
  const babelCjs = { __esModule: true, default: () => "default", version: "1.0" };
  const nsB = createSyntheticNamespace(babelCjs);
  console.log("  Babel CJS → Namespace:", nsB);

  // 场景 C：CJS 导出非对象（如函数）
  const funcCjs = function fn() { return "hello"; };
  (funcCjs as any).meta = "extra";
  const nsC = createSyntheticNamespace(funcCjs);
  console.log("  函数 CJS → Namespace:", nsC);
}

// ============================================================
// Main Demo Entry
// ============================================================

export function demo(): void {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     04-cjs-esm-interop.ts                                      ║");
  console.log("║     CJS/ESM Interoperability Demonstrations                   ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  demoEsModuleFlag();
  demoCreateRequire();
  demoDualPackageHazard();
  demoConditionalExports();
  demoModuleTypeMarkers();
  demoModuleResolutionStrategies();
  demoEsmImportCjsNamespace();

  console.log("\n=== Summary ===");
  console.log("  • __esModule 标记帮助 Babel 在 CJS 中保留 ESM 语义信息");
  console.log("  • createRequire 让 ESM 模块可以使用 CJS 的 require");
  console.log("  • Dual Package Hazard：CJS/ESM 双格式可能导致状态分裂");
  console.log("  • Conditional Exports (exports 字段) 是库作者的最佳实践");
  console.log("  • .mjs 强制 ESM，.cjs 强制 CJS，.js 取决于 package.type");
  console.log("  • TypeScript nodenext 严格匹配 Node.js；bunder 匹配打包工具");
  console.log("  • Node.js 将 CJS module.exports 包装为合成 ESM Namespace 对象");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
