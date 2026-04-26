/**
 * ESM 深度解析演示 (ESM Deep Dive)
 *
 * 涵盖: Live Bindings, import.meta, 动态 import(),
 *       Import Attributes 语法, Top-Level Await 效应,
 *       Import Defer / Import Text / Source Phase Imports 概念演示,
 *       平台差异与隐式严格模式
 */

// ============================================================
// 1. Live Bindings 演示
// ============================================================

function demoLiveBindings() {
  console.log("\n=== 1. Live Bindings 演示 ===");

  // 模拟 ESM Live Binding：导入方始终看到导出方的当前值
  let sharedBinding = 0;

  const exportModule = {
    get count() {
      return sharedBinding;
    },
    set count(v: number) {
      sharedBinding = v;
    },
    increment() {
      sharedBinding++;
    },
  };

  // 模拟导入方持有的是“绑定引用”而非值拷贝
  const importModule = {
    get count() {
      return exportModule.count;
    }, // 通过 getter 模拟间接绑定
  };

  console.log("  initial importModule.count:", importModule.count);
  exportModule.increment();
  console.log("  after increment:", importModule.count);
  exportModule.count = 100;
  console.log("  after reassignment:", importModule.count);

  // 对比 CJS 值拷贝行为
  let cjsValue = 0;
  const cjsSnapshot = cjsValue; // 拷贝
  cjsValue = 999;
  console.log(
    "  CJS copy snapshot after reassignment:",
    cjsSnapshot,
    "(stays 0)"
  );
}

// ============================================================
// 2. import.meta 演示
// ============================================================

function demoImportMeta() {
  console.log("\n=== 2. import.meta 演示 ===");

  // import.meta 是一个包含模块上下文元数据的对象
  // 在 Node.js ESM 中：
  console.log("  import.meta.url:", import.meta.url);
  console.log(
    "  import.meta.filename:",
    (import.meta as any).filename ?? "(Node 22+ only)"
  );
  console.log(
    "  import.meta.dirname:",
    (import.meta as any).dirname ?? "(Node 22+ only)"
  );

  // import.meta.resolve 解析模块路径
  try {
    const resolved = import.meta.resolve("node:path");
    console.log("  import.meta.resolve('node:path'):", resolved);
  } catch (e: any) {
    console.log("  import.meta.resolve 不可用:", e.message);
  }

  // 模拟 import.meta.main（Deno/Bun 特性）
  const isMain = (import.meta as any).main ?? false;
  console.log("  import.meta.main:", isMain);
}

// ============================================================
// 3. 动态 import() 演示
// ============================================================

async function demoDynamicImport() {
  console.log("\n=== 3. 动态 import() 演示 ===");

  // ✅ 动态导入返回 Promise，可在任意位置调用
  const pathModule = await import("node:path");
  console.log("  dynamic import result type:", typeof pathModule);
  console.log("  path.join('a', 'b'):", pathModule.join("a", "b"));

  // ✅ 条件动态导入
  const shouldLoad = true;
  if (shouldLoad) {
    const osModule = await import("node:os");
    console.log("  conditional load: platform =", osModule.platform());
  }

  // ✅ 动态路径（运行时计算）
  const moduleName = "node:url";
  const mod = await import(moduleName);
  console.log(
    "  runtime path resolved: fileURLToPath exists?",
    typeof mod.fileURLToPath
  );

  // ⚠️ 注意：动态导入无法用于静态分析，打包工具无法 Tree Shake
}

// ============================================================
// 4. Import Attributes (with { type: "json" }) 演示
// ============================================================

function demoImportAttributes() {
  console.log("\n=== 4. Import Attributes 演示 ===");

  // ES2025 语法：import ... with { type: "json" }
  // 由于需要 JSON 文件存在，此处用类型级别和注释演示

  console.log("  ES2025 Import Attributes 语法:");
  console.log(
    "    import config from './config.json' with { type: 'json' };"
  );

  // 在 TypeScript 中，配合 resolveJsonModule 可导入 JSON
  // 但 TS 编译后的 import 需要运行时支持 `with` 语法
  const simulatedJsonImport = {
    default: { name: "app", version: "1.0.0" },
  };
  console.log("  Simulated JSON import:", simulatedJsonImport.default);

  // 旧语法（已废弃）对比
  console.log("  ❌ 废弃语法: assert { type: 'json' }");
  console.log("  ✅ 标准语法: with { type: 'json' }");

  // 类型提示：TypeScript 5.3+ 支持 with 语法解析
  console.log(
    "  TypeScript 5.3+ 在 .ts 文件中支持 `import ... with { }` 语法"
  );
}

// ============================================================
// 5. Top-Level Await 效应演示
// ============================================================

async function demoTopLevelAwait() {
  console.log("\n=== 5. Top-Level Await (TLA) 效应演示 ===");

  // 在真实 ESM 中，以下代码可在模块顶层直接写：
  // const data = await fetch('/api/config').then(r => r.json());

  // 此处模拟 TLA 对模块求值顺序的影响
  const executionLog: string[] = [];

  async function createAsyncModule(
    name: string,
    delayMs: number,
    deps: string[] = []
  ) {
    executionLog.push(`${name}: evaluation started`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    executionLog.push(`${name}: evaluation completed (${delayMs}ms)`);
    return { name, deps };
  }

  // 模拟父模块等待子模块的 TLA
  console.log("  模拟带 TLA 的模块求值链...");
  const child = createAsyncModule("child", 50);
  const parent = (async () => {
    await child; // 父必须等待子模块完成
    executionLog.push("parent: started after child");
  })();

  await parent;
  executionLog.forEach((log) => console.log("    ", log));

  console.log("\n  结论: TLA 会阻塞整个模块图的求值链");
  console.log(
    "        父模块必须在子模块的 TLA Promise 决议后才能执行"
  );
}

// ============================================================
// 6. Import Defer (Stage 3) 概念演示
// ============================================================

function demoImportDefer() {
  console.log("\n=== 6. Import Defer (Stage 3, ES2027 预计) 概念演示 ===");

  // 提案语法：import defer * as mod from "./heavy.js";
  // 语义：模块在后台加载，绑定首次访问时才阻塞

  console.log("  提案语法:");
  console.log(
    "    import defer * as heavy from './heavy-computation.js';"
  );
  console.log("    heavy.compute(); // 首次访问时若未加载完成则阻塞");

  // 模拟 defer 语义
  let loaded = false;
  const deferredModule = new Proxy({} as Record<string, unknown>, {
    get(target, prop) {
      if (!loaded) {
        console.log(
          "    [defer] Module not ready, blocking until loaded..."
        );
        loaded = true; // 模拟加载完成
      }
      return (target as any)[prop] ?? `[stub for ${String(prop)}]`;
    },
  });

  console.log("  创建 deferred import (立即可用对象)");
  console.log("  访问 deferredModule.foo:", deferredModule.foo);
  console.log(
    "  第二次访问 deferredModule.foo:",
    deferredModule.foo,
    "(已加载，无阻塞)"
  );
}

// ============================================================
// 7. Import Text (Stage 3) 概念演示
// ============================================================

function demoImportText() {
  console.log("\n=== 7. Import Text (Stage 3, ES2027 预计) 概念演示 ===");

  // 提案语法：
  // import text shaderSource from "./shader.glsl" with { type: "text" };

  console.log("  提案语法:");
  console.log(
    "    import text shaderSource from './shader.glsl' with { type: 'text' };"
  );
  console.log("    console.log(shaderSource); // GLSL 源码字符串");

  // 模拟 Import Text 的语义
  const simulatedTextImport = `
// Simulated GLSL source
#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 fragColor;
void main() {
  fragColor = vec4(v_uv, 0.0, 1.0);
}
  `.trim();

  console.log("  模拟导入的文本内容:");
  console.log(
    simulatedTextImport
      .split("\n")
      .map((l) => "    " + l)
      .join("\n")
  );

  console.log("\n  工程意义:");
  console.log(
    "    • 内联 CSS/GLSL/SQL/HTML 模板，无需构建工具 loader"
  );
  console.log("    • 类型系统可直接推断为 string，提升类型安全");
  console.log("    • 减少 Webpack raw-loader / Vite ?inline 等工具锁定");
}

// ============================================================
// 8. Source Phase Imports (Stage 3) 概念演示
// ============================================================

function demoSourcePhaseImports() {
  console.log("\n=== 8. Source Phase Imports (Stage 3) 概念演示 ===");

  // 提案语法：import source wasmModule from "./mod.wasm";
  // 语义：获取编译后的模块源对象，而非实例化后的导出

  console.log("  提案语法:");
  console.log("    import source modSource from './math.wasm';");
  console.log("    // modSource instanceof WebAssembly.Module === true");

  // 模拟 WASM 的两阶段生命周期
  interface SourceModule {
    source: string;
    instantiate(imports?: unknown): { exports: unknown };
  }

  const wasmSource: SourceModule = {
    source: "(wasm binary)",
    instantiate(imports) {
      console.log(
        "    Instantiating WASM module with imports:",
        imports
      );
      return {
        exports: { add: (a: number, b: number) => a + b },
      };
    },
  };

  console.log("  模拟 source phase import:");
  console.log("    source object:", wasmSource.source);
  const instance = wasmSource.instantiate({ env: {} });
  console.log("    instantiated exports:", instance.exports);
}

// ============================================================
// 9. 平台差异演示 (Platform Differences)
// ============================================================

function demoPlatformDifferences() {
  console.log("\n=== 9. 平台差异 (Browser vs Node.js vs Deno vs Bun) ===");

  console.log("  当前运行时:", typeof process !== "undefined" ? "Node.js/Bun" : "Browser/Deno");
  console.log("  import.meta.url 格式:", import.meta.url.startsWith("file://") ? "file:// URL" : "其他");

  // Node.js 特有的属性检测
  const hasFilename = "filename" in import.meta;
  const hasMain = "main" in import.meta;
  console.log("  import.meta.filename 可用?", hasFilename, "(Node 22+ 特性)");
  console.log("  import.meta.main 可用?", hasMain, "(Deno/Bun 特性)");

  // 浏览器 vs Node.js 的模块解析差异说明
  console.log("\n  关键差异总结:");
  console.log("    Browser : 不支持裸指定符（需 Import Map），受 CORS 限制");
  console.log("    Node.js : 支持 node_modules 裸指定符，双模块问题显著");
  console.log("    Deno    : 支持 URL 导入，默认安全，无 node_modules");
  console.log("    Bun     : 兼容 Node.js，ESM/CJS 互操作更宽松");
}

// ============================================================
// 10. 隐式严格模式与 this 绑定演示
// ============================================================

function demoImplicitStrictMode() {
  console.log("\n=== 10. ESM 隐式严格模式 (Implicit Strict Mode) ===");

  // ESM 模块自动处于严格模式，无需 "use strict"
  console.log("  ESM 中 this === undefined:", (globalThis as any) === undefined); // 模块顶层 this 在严格模式为 undefined

  // 对比非严格模式脚本中的 this
  function checkThisInSloppyMode(this: typeof globalThis) {
    // 在 sloppy mode 中，函数内 this 为 globalThis
    return this;
  }
  const sloppyThis = checkThisInSloppyMode.call(globalThis);
  console.log(
    "  Sloppy mode function this === globalThis:",
    sloppyThis === globalThis
  );

  // 在 ESM 中，即使这样调用，模块顶层 this 仍为 undefined
  console.log("  模块顶层 this:", typeof (globalThis as any), "undefined in ESM strict mode");
}

// ============================================================
// Main Demo Entry
// ============================================================

export async function demo(): Promise<void> {
  console.log(
    "╔════════════════════════════════════════════════════════════════╗"
  );
  console.log(
    "║     02-esm-deep-dive.ts                                        ║"
  );
  console.log(
    "║     ESM Deep Dive Demonstrations                              ║"
  );
  console.log(
    "╚════════════════════════════════════════════════════════════════╝"
  );

  demoLiveBindings();
  demoImportMeta();
  await demoDynamicImport();
  demoImportAttributes();
  await demoTopLevelAwait();
  demoImportDefer();
  demoImportText();
  demoSourcePhaseImports();
  demoPlatformDifferences();
  demoImplicitStrictMode();

  console.log("\n=== Summary ===");
  console.log("  • ESM 导出的是 Live Binding，导入方实时同步导出方值变化");
  console.log("  • import.meta 提供模块级元数据（url, filename, dirname）");
  console.log("  • 动态 import() 返回 Promise，支持条件/运行时路径加载");
  console.log("  • Import Attributes (with { type: 'json' }) 控制加载方式");
  console.log("  • Top-Level Await 使模块变为异步，阻塞父模块求值");
  console.log("  • Import Defer 延迟非关键模块加载至首次访问");
  console.log("  • Import Text 直接导入文件内容为字符串");
  console.log("  • Source Phase Imports 获取 WASM 等模块的源对象");
  console.log("  • 各运行时（Browser/Node/Deno/Bun）对 ESM 支持存在差异");
  console.log("  • ESM 隐式严格模式，模块顶层 this === undefined");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
