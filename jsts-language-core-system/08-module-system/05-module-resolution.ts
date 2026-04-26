/**
 * 模块解析算法演示 (Module Resolution)
 *
 * 涵盖: Node.js 解析模拟, TypeScript paths 模拟,
 *       Subpath Imports (#utils) 概念, Exports Map 模拟,
 *       Bare Specifier 解析层级演示
 */

// ============================================================
// 1. Node.js 模块解析算法模拟
// ============================================================

function demoNodeJsResolution() {
  console.log("\n=== 1. Node.js 模块解析算法模拟 ===");

  // 模拟文件系统结构
  const fs = new Map<string, string>([
    ["/project/src/utils.js", "module.exports = {}"],
    ["/project/src/utils/index.js", "module.exports = {}"],
    ["/project/src/helpers.js", "module.exports = {}"],
    ["/project/node_modules/lodash/index.js", "module.exports = {}"],
    ["/project/node_modules/react/index.js", "module.exports = {}"],
  ]);

  function resolveNodeJs(
    specifier: string,
    parentPath: string,
    isEsm: boolean
  ): string | null {
    // 1. 核心模块
    if (["fs", "path", "os", "util", "http"].includes(specifier)) {
      return `<core:${specifier}>`;
    }

    // 2. 绝对路径
    if (specifier.startsWith("/")) {
      return fs.has(specifier) ? specifier : null;
    }

    // 3. 相对路径
    if (specifier.startsWith("./") || specifier.startsWith("../")) {
      const path = require("node:path");
      const resolved = path.resolve(parentPath.replace(/\/[^/]*$/, ""), specifier);

      // ESM: 不自动补全扩展名
      if (isEsm) {
        if (fs.has(resolved)) return resolved;
        if (fs.has(resolved + "/index.js")) return resolved + "/index.js";
        return null;
      }

      // CJS: 尝试扩展名补全
      if (fs.has(resolved)) return resolved;
      if (fs.has(resolved + ".js")) return resolved + ".js";
      if (fs.has(resolved + ".json")) return resolved + ".json";
      if (fs.has(resolved + "/index.js")) return resolved + "/index.js";
      return null;
    }

    // 4. 裸指定符：node_modules 递归查找
    let currentDir = parentPath.replace(/\/[^/]*$/, "");
    while (currentDir.length > 0) {
      const candidate = `${currentDir}/node_modules/${specifier}/index.js`;
      if (fs.has(candidate)) return candidate;
      const parent = currentDir.replace(/\/[^/]*$/, "");
      if (parent === currentDir) break;
      currentDir = parent;
    }

    return null;
  }

  const testCases = [
    { specifier: "./utils", from: "/project/src/app.js", esm: false },
    { specifier: "./utils", from: "/project/src/app.js", esm: true },
    { specifier: "../helpers", from: "/project/src/sub/app.js", esm: false },
    { specifier: "lodash", from: "/project/src/app.js", esm: false },
    { specifier: "fs", from: "/project/src/app.js", esm: false },
  ];

  for (const tc of testCases) {
    const resolved = resolveNodeJs(tc.specifier, tc.from, tc.esm);
    console.log(
      `  ${tc.esm ? "ESM" : "CJS"} resolve("${tc.specifier}") from ${tc.from}`
    );
    console.log(`    → ${resolved ?? "null (MODULE_NOT_FOUND)"}`);
  }

  console.log("\n  关键观察:");
  console.log("    • CJS 自动尝试 .js / index.js 补全");
  console.log("    • ESM 对 ./utils 解析失败（需显式 ./utils.js）");
}

// ============================================================
// 2. TypeScript Path Mapping 模拟
// ============================================================

function demoTsPathMapping() {
  console.log("\n=== 2. TypeScript Path Mapping 模拟 ===");

  // 模拟 tsconfig.json paths
  const pathsConfig: Record<string, string[]> = {
    "@app/*": ["./src/app/*"],
    "@shared/*": ["./shared/*"],
    "@config": ["./src/config/index.ts"],
  };
  const baseUrl = "/project";

  function resolveTsPaths(specifier: string): string | null {
    for (const [pattern, targets] of Object.entries(pathsConfig)) {
      const starIndex = pattern.indexOf("*");
      if (starIndex === -1) {
        if (specifier === pattern) {
          return `${baseUrl}/${targets[0]}`;
        }
      } else {
        const prefix = pattern.slice(0, starIndex);
        const suffix = pattern.slice(starIndex + 1);
        if (specifier.startsWith(prefix) && specifier.endsWith(suffix)) {
          const mid = specifier.slice(prefix.length, specifier.length - suffix.length);
          return `${baseUrl}/${targets[0].replace("*", mid)}`;
        }
      }
    }
    return null;
  }

  const cases = ["@app/components", "@shared/utils", "@config", "@unknown"];
  for (const c of cases) {
    const resolved = resolveTsPaths(c);
    console.log(`  resolve("${c}") → ${resolved ?? "(无匹配)"}`);
  }

  console.log("\n  注意: paths 仅在 TS 编译时生效，不影响 Node.js 运行时!");
  console.log("        运行时需配合打包工具或 Node.js loader hooks 实现相同映射");
}

// ============================================================
// 3. Subpath Imports (#utils) 演示
// ============================================================

function demoSubpathImports() {
  console.log("\n=== 3. Subpath Imports (#utils) 演示 ===");

  // 模拟 package.json imports 字段
  const importsConfig: Record<string, string> = {
    "#utils": "./src/utils/index.js",
    "#config/*": "./config/*.json",
    "#internal/deep": "./src/internal/deep/index.js",
  };

  function resolveSubpathImport(specifier: string): string | null {
    if (!specifier.startsWith("#")) return null;

    // 精确匹配优先
    if (importsConfig[specifier]) {
      return importsConfig[specifier];
    }

    // 通配符匹配
    for (const [pattern, target] of Object.entries(importsConfig)) {
      if (!pattern.endsWith("/*")) continue;
      const prefix = pattern.slice(0, -1);
      if (specifier.startsWith(prefix)) {
        const suffix = specifier.slice(prefix.length);
        return target.replace("*", suffix);
      }
    }

    return null;
  }

  const cases = ["#utils", "#config/app", "#config/db", "#internal/deep", "#unknown"];
  for (const c of cases) {
    const resolved = resolveSubpathImport(c);
    console.log(`  resolve("${c}") → ${resolved ?? "(无匹配)"}`);
  }

  console.log("\n  优势:");
  console.log("    • 封装内部路径，重构不影响外部引用");
  console.log("    • 无需 node_modules 或符号链接");
  console.log("    • TypeScript 原生支持（无需额外 paths 配置）");
}

// ============================================================
// 4. Exports Map / Conditional Exports 解析模拟
// ============================================================

function demoExportsMap() {
  console.log("\n=== 4. Exports Map (Conditional Exports) 解析模拟 ===");

  // 模拟 package.json exports 字段
  const exportsMap: Record<string, any> = {
    ".": {
      types: "./dist/index.d.ts",
      import: "./dist/index.mjs",
      require: "./dist/index.cjs",
      default: "./dist/index.js",
    },
    "./feature": {
      types: "./dist/feature.d.ts",
      import: "./dist/feature.mjs",
      require: "./dist/feature.cjs",
    },
    "./*.js": {
      types: "./types/*.d.ts",
      import: "./esm/*.js",
      require: "./cjs/*.js",
    },
  };

  function resolveConditionalExport(
    subpath: string,
    condition: "import" | "require" | "types" | "default"
  ): string | null {
    // 精确匹配
    if (exportsMap[subpath]) {
      const entry = exportsMap[subpath];
      if (entry[condition]) return entry[condition];
      if (entry.default) return entry.default;
      return null;
    }

    // 通配符匹配
    for (const [pattern, entry] of Object.entries(exportsMap)) {
      if (!pattern.includes("*")) continue;
      const regex = new RegExp("^" + pattern.replace(/\*/g, "(.*)") + "$");
      const match = subpath.match(regex);
      if (match) {
        const replacement = match[1] ?? match[match.length - 1];
        const target = entry[condition] ?? entry.default;
        if (target) return target.replace("*", replacement);
      }
    }

    return null;
  }

  const cases = [
    { subpath: ".", condition: "import" as const },
    { subpath: ".", condition: "require" as const },
    { subpath: "./feature", condition: "types" as const },
    { subpath: "./utils.js", condition: "import" as const },
    { subpath: "./utils.js", condition: "require" as const },
  ];

  for (const tc of cases) {
    const resolved = resolveConditionalExport(tc.subpath, tc.condition);
    console.log(
      `  resolve("${tc.subpath}", condition="${tc.condition}") → ${resolved ?? "null"}`
    );
  }

  console.log("\n  规则:");
  console.log("    • exports 字段优先级高于 main 字段");
  console.log("    • 条件按声明顺序匹配，第一个命中即生效");
  console.log("    • 通配符 * 可捕获子路径片段");
}

// ============================================================
// 5. Bare Specifier 解析层级演示
// ============================================================

function demoBareSpecifierResolution() {
  console.log("\n=== 5. Bare Specifier 解析层级演示 ===");

  // 模拟 node_modules 层级查找
  const fsTree = new Set<string>([
    "/project/src/node_modules/foo",
    "/project/node_modules/foo",
    "/project/node_modules/bar",
    "/node_modules/foo",
    "/node_modules/baz",
  ]);

  function findInNodeModules(specifier: string, fromDir: string): string | null {
    let current = fromDir;
    while (true) {
      const candidate = `${current}/node_modules/${specifier}`;
      if (fsTree.has(candidate)) return candidate;
      const parent = current.replace(/\/[^/]*$/, "");
      if (parent === current || parent === "") break;
      current = parent;
    }
    return null;
  }

  const cases = [
    { specifier: "foo", from: "/project/src/app.js" },
    { specifier: "bar", from: "/project/src/app.js" },
    { specifier: "baz", from: "/project/src/app.js" },
    { specifier: "foo", from: "/project/other/app.js" },
  ];

  for (const tc of cases) {
    const found = findInNodeModules(tc.specifier, tc.from.replace(/\/[^/]*$/, ""));
    console.log(
      `  find("${tc.specifier}") from "${tc.from}" → ${found ?? "MODULE_NOT_FOUND"}`
    );
  }

  console.log("\n  结论:");
  console.log("    • 从最近 parent 的 node_modules 开始查找");
  console.log("    • 不同目录可能解析到不同版本的同一包（monorepo 常见）");
}

// ============================================================
// 6. Scoped Package 解析演示
// ============================================================

function demoScopedPackage() {
  console.log("\n=== 6. Scoped Package (@scope/pkg) 解析演示 ===");

  function parseScopedSpecifier(specifier: string): { scope: string; name: string; subpath: string } | null {
    if (!specifier.startsWith("@")) return null;
    const parts = specifier.split("/");
    if (parts.length < 2) return null;
    const scope = parts[0];
    const name = parts[1];
    const subpath = parts.slice(2).join("/");
    return { scope, name, subpath };
  }

  const cases = ["@types/node", "@company/utils", "@org/pkg/subpath/module"];
  for (const c of cases) {
    const parsed = parseScopedSpecifier(c);
    console.log(`  "${c}" → scope="${parsed?.scope}", name="${parsed?.name}", subpath="${parsed?.subpath || "(none)"}"`);
  }

  console.log("\n  Node.js 将 @scope/name 整体视为包名，子路径在包内继续解析");
}

// ============================================================
// Main Demo Entry
// ============================================================

export function demo(): void {
  console.log("╔════════════════════════════════════════════════════════════════╗");
  console.log("║     05-module-resolution.ts                                    ║");
  console.log("║     Module Resolution Algorithm Demonstrations                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝");

  demoNodeJsResolution();
  demoTsPathMapping();
  demoSubpathImports();
  demoExportsMap();
  demoBareSpecifierResolution();
  demoScopedPackage();

  console.log("\n=== Summary ===");
  console.log("  • Node.js 区分 ESM/CJS 解析：CJS 自动补全扩展名，ESM 不补全");
  console.log("  • TypeScript paths 仅在编译时生效，不影响运行时");
  console.log("  • Subpath Imports (#utils) 封装内部路径，TS 原生支持");
  console.log("  • Conditional Exports 根据 import/require/types 条件返回不同入口");
  console.log("  • Bare Specifier 通过 node_modules 层级递归查找");
  console.log("  • Scoped Package (@scope/pkg) 子路径在包内继续解析");
}

// Run if executed directly
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  demo();
}
