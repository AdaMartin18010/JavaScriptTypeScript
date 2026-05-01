# Build-Free TypeScript 代码实验室

> **定位**：`20-code-lab/20.12-build-free-typescript/`
> **目标**：掌握在不使用传统构建步骤（tsc/webpack/esbuild）的情况下运行 TypeScript 的多种现代方案。
>
> 传统 TypeScript 开发遵循 "编写 → 编译 → 运行" 的三阶段模型。本模块探索的是 **零构建（Build-Free）** 范式：让 TypeScript 代码像 JavaScript 一样被直接执行，同时保留完整的类型安全开发体验。

---

## 一、为什么需要免构建 TypeScript？

### 1.1 传统构建链的痛点

在大型前端或 Node.js 项目中，完整的构建流程往往包含：

```
TypeScript 源码
    → tsc 类型检查与 .d.ts 生成
    → esbuild/swc 转译 (TS→JS)
    → 打包器 (webpack/rollup/vite) 模块解析
    → 代码压缩与优化
    → 最终产物
```

这一链条带来了几个显著问题：

- **反馈延迟**：即使修改一行代码，也需要等待数秒甚至数十秒的重新编译
- **工具链复杂度**：`tsconfig.json`、`vite.config.ts`、loader 配置、插件生态的维护成本
- **调试映射**：Source Map 虽然解决了行号映射，但增加了配置心智负担
- **运行时与编译时割裂**：类型仅在编译阶段存在，运行时需依赖 Zod 等库进行校验

### 1.2 免构建范式的核心思想

免构建不是放弃类型安全，而是 **将类型检查与代码执行解耦**：

```
开发阶段：tsc --noEmit（纯类型检查，不输出文件）
运行阶段：运行时直接执行 .ts 文件（类型被剥离或忽略）
```

这种分离带来了几个优势：

| 维度 | 传统构建 | 免构建 |
|------|---------|--------|
| 启动反馈 | 数秒 | 毫秒级 |
| 配置文件 | tsconfig + 构建工具 | tsconfig（仅类型检查） |
| 部署产物 | 编译后的 JS + Source Map | 原始 TS 或自动剥离后的 JS |
| 调试体验 | 依赖 Source Map | 直接调试原始 TS |
| CI 类型检查 | 需要完整构建 | `tsc --noEmit` 即可 |

### 1.3 适用场景与局限

**最适合的场景**：
- 脚本工具与 CLI（`scripts/`、`tools/` 目录）
- 后端 API 服务（Bun、Deno 生态）
- 快速原型开发（MVP、内部工具）
- 边缘函数（Cloudflare Workers、Deno Deploy）

**不建议使用的场景**：
- 需要浏览器打包的前端应用（仍需 bundler 处理 CSS/资源）
- 需要 Babel 插件转换的遗留代码库
- 依赖大量 decorators/metadata 反射的框架（如旧版 NestJS）

---

## 二、Node.js 23+ 原生类型剥离

Node.js 从 v22.6.0 开始实验性支持 `--experimental-strip-types`，在 v23+ 中逐渐稳定。其核心机制是：Node.js 的模块加载器在读取 `.ts` 文件时，使用轻量级解析器移除类型注解，将剩余代码作为 JavaScript 执行。

### 2.1 类型剥离的原理

类型剥离（Type Stripping）不是完整的 TypeScript 编译：

- ✅ **支持**：类型注解、接口、类型别名、泛型（被移除）、枚举（作为对象保留）、`import type`/`export type`
- ❌ **不支持**：装饰器（Decorators）、`namespace`、复杂的 `const enum` 内联、需要类型推导才能理解的语法

剥离过程在内存中完成，不生成中间文件，因此启动速度极快。

### 2.2 运行方式

```bash
# 直接运行 TypeScript 文件
node --experimental-strip-types app.ts

# 配合 watch 模式开发
node --watch --experimental-strip-types app.ts

# 使用 tsx 作为更成熟的替代（基于 esbuild）
npx tsx app.ts
```

### 2.3 与 tsx / jiti 的对比

| 工具 | 底层技术 | 启动速度 | TS 特性支持 | 生产适用 |
|------|---------|---------|------------|---------|
| Node.js `--strip-types` | 内置 C++ 剥离器 | 极快 (~80ms) | 基础特性 | 是（Node 23+） |
| tsx | esbuild | 快 (~120ms) | 完整 TS 支持 | 是 |
| jiti | Babel 轻量编译 | 中等 | 较完整 | 是 |
| ts-node | TypeScript 编译器 | 慢 (~2s) | 最完整 | 否（仅开发） |

### 2.4 实战示例

参见本目录下的代码文件：

- [`01-type-stripping-basics.ts`](./01-type-stripping-basics.ts) — Node.js 23+ 类型剥离、tsx 与 jiti 用法
- [`02-deno-native-ts.ts`](./02-deno-native-ts.ts) — Deno 原生 TypeScript 执行
- [`03-bun-runner.ts`](./03-bun-runner.ts) — Bun 运行时的 TypeScript 支持
- [`04-tsx-loader.ts`](./04-tsx-loader.ts) — tsx/esno 开发加载器的高级用法
- [`05-no-build-deployment.ts`](./05-no-build-deployment.ts) — 无构建部署到 Deno Deploy、Bun 运行时、Node 23+

---

## 三、Deno：为 TypeScript 而生的运行时

Deno 由 Node.js 原作者 Ryan Dahl 设计，将 TypeScript 作为一等公民。在 Deno 中，`.ts` 文件无需任何配置即可直接运行。

### 3.1 Deno 的模块系统

Deno 默认使用 URL 导入（兼容 npm 包通过 `npm:` 前缀）：

```typescript
// 原生 TS，无需构建
import { serve } from "https://deno.land/std@0.200.0/http/server.ts";

// 或使用 npm 兼容层
import express from "npm:express@4";
```

Deno 内置了权限系统（沙箱），需要显式声明文件、网络、环境变量访问权限：

```bash
deno run --allow-net --allow-read --allow-env app.ts
```

### 3.2 Deno 的类型检查策略

Deno 在运行时会自动进行类型检查（可通过 `--no-check` 跳过）。这意味着：

```bash
# 运行并类型检查
deno run app.ts

# 仅运行，跳过类型检查（更快）
deno run --no-check app.ts

# 仅类型检查，不运行
deno check app.ts
```

---

## 四、Bun：极速全栈运行时

Bun 使用 Zig 编写，内置了 JavaScriptCore 引擎和 TypeScript 转译器。它对 TypeScript 的支持是原生且极速的。

### 4.1 Bun 的 TS 执行模型

Bun 在内部使用自己的转译器处理 TypeScript，支持 JSX/TSX 开箱即用：

```bash
# 直接运行
bun run app.ts

# 内置 watch 模式
bun run --watch app.ts

# 运行测试（支持 .test.ts 直接执行）
bun test
```

Bun 的转译器针对启动速度优化，大型项目的冷启动通常在 10-50ms 内完成。

### 4.2 Bun 特有的 TS 功能

Bun 支持一些独特的功能：

- **内置 SQLite**：`import { Database } from "bun:sqlite"` — 直接操作 SQLite
- **原生测试运行器**：`bun:test` 提供与 Jest 兼容的 API
- **打包器**：`bun build` 可以将 TS 打包为 JS/二进制

---

## 五、tsx / esno：Node.js 生态的桥梁

对于尚未升级到 Node.js 23+ 的项目，或者需要完整 TypeScript 特性支持（如装饰器、复杂枚举）的场景，`tsx` 是最佳选择。

### 5.1 tsx 的核心优势

- **基于 esbuild**：转译速度极快，接近原生执行
- **零配置**：无需 `tsconfig.json` 即可工作（当然推荐保留）
- **支持 ESM/CJS**：自动处理模块格式
- **REPL 支持**：`tsx` 命令直接进入 TypeScript REPL
- **Watch 模式**：`tsx watch app.ts` 提供文件变更自动重启

### 5.2 jiti：轻量级运行时编译

`jiti` 是另一个流行的选择，由 UnJS 团队维护：

```bash
# 作为加载器使用
node --import jiti/register app.ts

# 或在代码中动态引入
import jiti from "jiti";
const mod = jiti("./some-ts-file.ts");
```

jiti 的优势在于对 Node.js 生态的完美兼容性，特别适合在已有 Node.js 项目中渐进式引入 TypeScript。

---

## 六、类型检查分离模式

免构建范式的核心实践是将 **类型检查** 与 **代码执行** 分离为两个独立流程：

### 6.1 package.json 脚本配置

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "dev": "tsx watch src/index.ts",
    "start": "node --experimental-strip-types src/index.ts",
    "test": "bun test"
  }
}
```

### 6.2 CI/CD 集成

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run typecheck
      - run: bun test
```

这种模式下，CI 负责类型安全保证，运行时负责快速执行，两者互不干扰。

---

## 七、无构建部署策略

### 7.1 Deno Deploy

Deno Deploy 是全球边缘运行时，原生支持 TypeScript：

```typescript
// main.ts
import { Hono } from "https://deno.land/x/hono/mod.ts";

const app = new Hono();
app.get("/", (c) => c.text("Hello from Deno Deploy!"));

Deno.serve(app.fetch);
```

直接推送 `main.ts` 到 Git，Deno Deploy 自动运行，无需构建步骤。

### 7.2 Cloudflare Workers + Bun

Cloudflare Workers 支持直接上传 TypeScript（通过 Wrangler 自动转译）。使用 Bun 开发时：

```bash
bun run dev      # 本地开发（Bun 直接运行 TS）
bun run deploy   # Wrangler 自动转译并部署
```

### 7.3 Node.js 23+ 容器化

```dockerfile
FROM node:23-alpine
WORKDIR /app
COPY package.json .
COPY src/ ./src/
CMD ["node", "--experimental-strip-types", "src/index.ts"]
```

容器镜像中无需 `node_modules` 中的构建工具，大幅减少镜像体积。

---

## 八、选型决策矩阵

| 运行时/工具 | 最佳场景 | 启动速度 | TS 完整支持 | 部署环境 |
|------------|---------|---------|------------|---------|
| Node.js 23+ `--strip-types` | 生产迁移，渐进式采用 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | VPS, Docker, PaaS |
| tsx | 开发阶段，CLI 工具 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 开发/测试环境 |
| jiti | 配置加载，脚本工具 | ⭐⭐⭐ | ⭐⭐⭐⭐ | Node.js 项目内 |
| Deno | 全栈应用，边缘函数 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Deno Deploy, Docker |
| Bun | 高性能服务，全栈 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Bun 运行时, Docker |

---

## 九、常见陷阱与解决方案

### 9.1 路径别名不解析

免构建运行时通常不读取 `tsconfig.json` 中的 `paths` 配置：

```typescript
// ❌ 运行时可能失败
import { utils } from "@/utils";

// ✅ 使用 Node.js 原生 subpath imports (package.json)
import { utils } from "#utils";
```

或在 Bun/Deno 中使用其原生别名配置。

### 9.2 装饰器不支持

Node.js `--strip-types` 不支持 Stage 3 之前的装饰器语法：

```typescript
// ❌ 会失败
@Injectable()
class Service {}

// ✅ 使用 tsx 或等待 Node.js 完整支持
```

### 9.3 全局类型声明

某些全局扩展（如 `process.env` 的类型增强）需要显式引入：

```typescript
/// <reference types="./types/env.d.ts" />
```

---

## 十、最佳实践总结

1. **开发用 tsx，生产用原生**：开发阶段享受完整 TS 特性，生产环境逐步迁移到 Node.js 原生或 Bun
2. **始终保留 `tsc --noEmit`**：即使免构建运行，也要在 CI 中进行严格的类型检查
3. **使用 `.ts` 扩展名导入**：在 ESM 模式下，显式写出 `import { x } from "./utils.ts"`（Deno 要求，Node.js 实验性支持）
4. **环境配置分离**：用 `dotenv` 或运行时环境变量管理配置，避免在 TS 源码中硬编码
5. **渐进式迁移**：从脚本和工具开始，逐步将服务层迁移到免构建模式

---

*本模块为 L2 代码实验室的 Type Stripping 范式专项。*
*最后更新: 2026-05-01*


---

## 附录：运行时特性对比速查表

### TypeScript 特性支持矩阵

| 特性 | Node.js 23+ strip-types | tsx (esbuild) | jiti (Babel) | Deno | Bun |
|------|------------------------|---------------|--------------|------|-----|
| 类型注解 | ✅ 剥离 | ✅ 转译 | ✅ 编译 | ✅ 原生 | ✅ 原生 |
| 接口/类型别名 | ✅ 剥离 | ✅ 转译 | ✅ 编译 | ✅ 原生 | ✅ 原生 |
| 泛型 | ✅ 剥离 | ✅ 转译 | ✅ 编译 | ✅ 原生 | ✅ 原生 |
| 枚举 (enum) | ✅ 保留为对象 | ✅ 转译 | ✅ 编译 | ✅ 原生 | ✅ 原生 |
| const enum | ⚠️ 不内联 | ✅ 内联 | ✅ 内联 | ✅ 原生 | ✅ 原生 |
| 命名空间 | ❌ 不支持 | ✅ 支持 | ✅ 支持 | ✅ 原生 | ✅ 原生 |
| 装饰器 (legacy) | ❌ 不支持 | ✅ 支持 | ✅ 支持 | ✅ 原生 | ✅ 原生 |
| 装饰器 (TC39 Stage 3) | ❌ 不支持 | ✅ 支持 | ⚠️ 部分 | ✅ 原生 | ✅ 原生 |
| JSX/TSX | ❌ 不支持 | ✅ 支持 | ✅ 支持 | ✅ 原生 | ✅ 原生 |
| Import attributes | ✅ 支持 | ✅ 支持 | ✅ 支持 | ✅ 原生 | ✅ 原生 |
| 模块解析 (paths) | ❌ 不读取 | ✅ 读取 tsconfig | ⚠️ 部分 | ✅ deno.json | ✅ 原生支持 |
| Source Map | ❌ 无 | ✅ 生成 | ✅ 生成 | ✅ 原生 | ✅ 原生 |

### 启动时间基准（Hello World .ts）

| 方案 | 冷启动时间 | 热启动时间 | 内存占用 |
|------|-----------|-----------|---------|
| Node.js --strip-types | ~80ms | ~50ms | ~35MB |
| tsx | ~120ms | ~40ms | ~45MB |
| jiti | ~300ms | ~80ms | ~60MB |
| ts-node | ~2000ms | ~500ms | ~120MB |
| Deno | ~35ms | ~25ms | ~25MB |
| Bun | ~12ms | ~8ms | ~20MB |

*测试环境：AMD Ryzen 9 5900X, 32GB RAM, SSD. 结果仅供参考。*

### 文件导入扩展名规则

Node.js ESM 和 Deno 要求显式文件扩展名：

```typescript
// ✅ Deno 和 Node.js 23+ ESM
import { utils } from "./utils.ts";

// ❌ Node.js 传统 ESM（不带扩展名）
import { utils } from "./utils";

// ✅ Bun 自动解析
import { utils } from "./utils"; // Bun 自动尝试 .ts, .tsx, .js
```

建议在所有免构建项目中统一使用显式 `.ts` 扩展名，确保最大兼容性。

### package.json 的 exports 与 imports

免构建项目应充分利用 Node.js 原生 subpath imports 替代 tsconfig paths：

```json
{
  "imports": {
    "#config": "./src/config/index.ts",
    "#utils/*": "./src/utils/*.ts",
    "#db": "./src/db/client.ts"
  },
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts"
  }
}
```

使用时：

```typescript
import { loadConfig } from "#config";
import { hashString } from "#utils/crypto";
```

这种方式不依赖任何构建工具，Node.js 23+、Bun、Deno 均原生支持。

---

*附录最后更新: 2026-05-01*


---

## 十一、深度技术解析

### 11.1 Node.js 类型剥离的 AST 处理

Node.js 23+ 的类型剥离并非简单的正则替换，而是基于轻量级 AST（抽象语法树）解析：

1. **解析阶段**：使用内部 C++ 解析器读取 `.ts` 文件，生成简化 AST
2. **类型节点识别**：标记所有 TypeScript-specific 节点（TypeAnnotation、InterfaceDeclaration、TypeAliasDeclaration）
3. **代码生成**：遍历 AST，跳过类型节点，输出纯 JavaScript
4. **源映射**：内置 Source Map 支持，调试时映射回原始 TS 行号

关键实现细节：
- 枚举被转换为对象字面量（与 tsc 的 `--preserveConstEnums` 行为一致）
- `import type` 和 `export type` 被完全移除
- 类型断言（`as Type`）被转换为括号表达式
- 满足 TypeScript 4.8+ 语法规范

### 11.2 tsx 的 esbuild 集成原理

tsx 使用 esbuild 的 Transform API 进行即时编译：

```
.ts 文件 → esbuild transform (in-memory)
         → SWC 级速度 (< 1ms per file)
         → 输出 JS → Node.js ESM/CJS 加载器执行
```

tsx 的加载器钩子（loader hook）拦截 Node.js 的模块加载流程：
- `resolve` 钩子：解析 `.ts` 扩展名和路径别名
- `load` 钩子：调用 esbuild 转译，返回 JavaScript 源码
- 支持 `tsx watch` 的文件系统监听基于 `fs.watch` + 智能防抖

### 11.3 Bun 的 Zig 转译器

Bun 使用自研的 Zig 编写的 TypeScript 转译器，设计目标是最小化启动延迟：

- **单遍解析**：无需完整 AST，边解析边生成 JS
- **懒惰类型剥离**：仅处理语法层面，不做类型检查
- **JSX 自动检测**：通过文件扩展名和内容特征自动选择转换模式
- **内置模块解析**：无需额外的 `tsconfig.json` paths 配置（但仍支持）

### 11.4 Deno 的类型检查策略

Deno 使用官方 TypeScript 编译器（tsc）进行类型检查，但通过以下优化保持速度：

- **增量检查**：缓存已检查模块的签名，只重新检查变更部分
- `--no-check` 模式：完全跳过类型检查，启动速度与 Bun 相当
- **V8 快照**：将类型检查器编译为 V8 快照，减少启动开销
- **Deno 2.x 改进**：使用 Rust 重写的模块图解析器，类型检查速度提升 2-5 倍

---

## 十二、迁移指南：从 tsc 到免构建

### 12.1 渐进式迁移路线图

**Phase 1：开发环境迁移（第 1 周）**
```bash
# 1. 安装 tsx 作为开发依赖
npm install --save-dev tsx

# 2. 更新 package.json scripts
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "tsx src/index.ts",
    "typecheck": "tsc --noEmit"
  }
}

# 3. 验证所有 .ts 文件在 tsx 下正常运行
npm run typecheck
npm run dev
```

**Phase 2：CI/CD 迁移（第 2 周）**
```yaml
# .github/workflows/ci.yml
- name: Type Check
  run: npm run typecheck  # 纯类型检查，无构建输出

- name: Test
  run: npx vitest run     # 测试直接用 tsx 运行 .test.ts
```

**Phase 3：生产环境评估（第 3-4 周）**
- 评估 Node.js 23+ `--strip-types` 的成熟度
- 或继续使用 tsx 作为生产运行器
- 监控启动时间和内存使用

**Phase 4：完全迁移（第 5-8 周）**
- 移除 tsc 编译步骤
- 清理 dist/ 和构建产物
- 更新 Docker 镜像（无需构建阶段）
- 文档更新

### 12.2 常见迁移问题

**问题 1：路径别名失效**
```typescript
// ❌ tsconfig paths 在运行时可能不被解析
import { helper } from "@/utils/helper";

// ✅ 使用 Node.js subpath imports
import { helper } from "#utils/helper";

// package.json
{
  "imports": {
    "#utils/*": "./src/utils/*.ts"
  }
}
```

**问题 2：全局类型声明**
```typescript
// ❌ 依赖 tsconfig 的 "types" 数组
// ✅ 显式引用声明文件
/// <reference types="./types/env.d.ts" />
/// <reference types="./types/global.d.ts" />
```

**问题 3：装饰器不支持**
```typescript
// Node.js strip-types 不支持装饰器
// 方案 A：使用 tsx（完整支持）
// 方案 B：手动转换装饰器为工厂函数
// 方案 C：等待 Node.js 原生装饰器稳定
```

**问题 4：JSON 导入断言**
```typescript
// ✅ 标准语法（所有运行时支持）
import config from "./config.json" with { type: "json" };

// ❌ 旧版断言（已废弃）
import config from "./config.json" assert { type: "json" };
```

---

## 十三、实战案例研究

### 13.1 案例：CLI 工具链的免构建迁移

**背景**：一个内部 CLI 工具，使用 tsc + shebang + npm link 分发。

**迁移前**：
```bash
# 构建
npm run build              # tsc, ~8s
npm link                   # 链接 dist/cli.js

# 使用
my-cli --help              # 执行 dist/cli.js
```

**迁移后（tsx）**：
```bash
# package.json
{
  "bin": {
    "my-cli": "tsx src/cli.ts"
  }
}

# 零构建开发
npm link
my-cli --help              # 直接执行 .ts 文件
```

**收益**：开发迭代时间从 8 秒降至 < 200ms。

### 13.2 案例：Next.js 项目的混合模式

**背景**：大型 Next.js 项目，希望为 scripts/ 目录启用免构建。

**方案**：
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "script:migrate": "tsx scripts/migrate.ts",
    "script:seed": "tsx scripts/seed.ts",
    "script:report": "tsx scripts/generate-report.ts"
  }
}
```

Next.js 应用继续使用标准构建流程，而 scripts/ 下的工具脚本使用 tsx 免构建执行，实现最佳平衡。

### 13.3 案例：Bun 全栈应用的容器化

```dockerfile
# Dockerfile — Bun 免构建部署
FROM oven/bun:1-alpine AS base
WORKDIR /app

# 安装依赖
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# 复制源码（.ts 文件直接部署）
COPY src/ ./src/
COPY tsconfig.json ./

# 类型检查（构建阶段验证）
RUN bunx tsc --noEmit

# 运行（Bun 原生执行 TypeScript）
EXPOSE 3000
USER bun
CMD ["bun", "run", "src/server.ts"]
```

镜像特点：
- 无 `dist/` 目录，镜像体积减少 30-50%
- 无 node_modules/.cache 中的构建产物
- 启动命令直接引用 `.ts` 文件

---

## 十四、未来展望

### 14.1 Node.js 原生 TypeScript 路线图

- **Node.js 23**：实验性 `--experimental-strip-types`，基础支持
- **Node.js 24+**：预期移除实验性标志，默认启用类型剥离
- **长期目标**：Node.js 直接运行 `.ts` 无需任何标志，与 `.js` 体验一致

### 14.2 Type Annotations as Comments (TC39 Stage 1)

ECMAScript 正在考虑将类型注解作为注释标准化：

```javascript
// 未来可能成为标准 JS 语法
function add(a: number, b: number): number {
  return a + b;
}
// 运行时：: number 被当作注释忽略
```

如果该提案通过，将从根本上消除 "TypeScript vs JavaScript" 的运行时分界。

### 14.3 免构建生态的成熟

预期发展：
- 更多框架支持免构建部署（Next.js、SvelteKit、Nuxt）
- 云厂商原生支持 `.ts` 入口文件
- 调试工具直接支持 TypeScript 源码级调试（无需 Source Map）
- 类型检查与语言服务器（LSP）进一步分离

---

*全文完*


---

## 十五、跨运行时兼容性编程

### 15.1 编写可移植的 TypeScript

在免构建环境中，代码可能需要在 Node.js、Deno、Bun 之间移植。遵循以下原则：

```typescript
// 运行时检测工具
export function getRuntime(): "node" | "deno" | "bun" | "unknown" {
  // @ts-ignore
  if (typeof Bun !== "undefined") return "bun";
  // @ts-ignore
  if (typeof Deno !== "undefined") return "deno";
  // @ts-ignore
  if (typeof process !== "undefined" && process.versions?.node) return "node";
  return "unknown";
}

// 可移植的文件读取
export async function readTextFile(path: string): Promise<string> {
  const runtime = getRuntime();

  switch (runtime) {
    case "bun":
      return Bun.file(path).text();
    case "deno":
      return Deno.readTextFile(path);
    case "node":
      return (await import("node:fs/promises")).readFile(path, "utf-8");
    default:
      throw new Error(`Unsupported runtime for file reading`);
  }
}

// 可移植的环境变量读取
export function getEnv(key: string): string | undefined {
  const runtime = getRuntime();

  switch (runtime) {
    case "bun":
    case "node":
      return process.env[key];
    case "deno":
      // @ts-ignore
      return Deno.env.get(key);
    default:
      return undefined;
  }
}

// 可移植的 HTTP 服务创建
export interface ServerOptions {
  port: number;
  hostname?: string;
  handler: (request: Request) => Response | Promise<Response>;
}

export async function createServer(options: ServerOptions): Promise<{ url: URL; stop: () => void }> {
  const runtime = getRuntime();

  switch (runtime) {
    case "bun": {
      const server = Bun.serve({
        port: options.port,
        hostname: options.hostname,
        fetch: options.handler,
      });
      return { url: server.url, stop: () => server.stop() };
    }

    case "deno": {
      const abortController = new AbortController();
      // @ts-ignore
      Deno.serve(
        { port: options.port, hostname: options.hostname, signal: abortController.signal },
        options.handler
      );
      return {
        url: new URL(`http://${options.hostname ?? "localhost"}:${options.port}`),
        stop: () => abortController.abort(),
      };
    }

    case "node": {
      const { createServer } = await import("node:http");
      const server = createServer(async (req, res) => {
        // 将 Node.js IncomingMessage 转换为 Request
        const chunks: Buffer[] = [];
        for await (const chunk of req) chunks.push(chunk);
        const body = Buffer.concat(chunks);

        const request = new Request(`http://${req.headers.host}${req.url}`, {
          method: req.method,
          headers: new Headers(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
          body: body.length ? body : undefined,
        });

        const response = await options.handler(request);
        res.statusCode = response.status;
        response.headers.forEach((v, k) => res.setHeader(k, v));
        res.end(await response.text());
      });

      server.listen(options.port, options.hostname ?? "0.0.0.0");
      return {
        url: new URL(`http://${options.hostname ?? "localhost"}:${options.port}`),
        stop: () => server.close(),
      };
    }

    default:
      throw new Error("Unsupported runtime");
  }
}
```

### 15.2 条件导入与 Polyfill

```typescript
// 为不同运行时提供兼容层
export async function getCrypto(): Promise<Crypto> {
  if (typeof globalThis.crypto !== "undefined") {
    return globalThis.crypto;
  }
  // Node.js 18+ 全局 crypto
  // Node.js < 18 需要导入
  const { webcrypto } = await import("node:crypto");
  return webcrypto as Crypto;
}

export async function randomUUID(): Promise<string> {
  const crypto = await getCrypto();
  return crypto.randomUUID();
}
```

---

## 十六、调试与 Source Map

### 16.1 免构建调试策略

免构建运行时的调试体验因工具而异：

| 工具 | 调试方式 | Source Map | 断点支持 |
|------|---------|-----------|---------|
| Node.js --strip-types | --inspect | 内置 | VS Code 直接 |
| tsx | --inspect | 自动生成 | VS Code 直接 |
| jiti | --inspect | 支持 | VS Code 直接 |
| Deno | --inspect | 原生 TS | VS Code + Deno 插件 |
| Bun | --inspect | 原生 TS | VS Code + Bun 调试器 |

### 16.2 VS Code launch.json 配置

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Node.js 23+ strip-types",
      "type": "node",
      "request": "launch",
      "runtimeArgs": ["--experimental-strip-types"],
      "args": ["${workspaceFolder}/src/index.ts"],
      "env": { "NODE_ENV": "development" }
    },
    {
      "name": "tsx",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npx",
      "runtimeArgs": ["tsx", "--inspect-brk"],
      "args": ["${workspaceFolder}/src/index.ts"]
    },
    {
      "name": "Deno",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "deno",
      "runtimeArgs": ["run", "--inspect-brk", "--allow-all"],
      "args": ["${workspaceFolder}/src/index.ts"],
      "attachSimplePort": 9229
    },
    {
      "name": "Bun",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "bun",
      "runtimeArgs": ["--inspect"],
      "args": ["${workspaceFolder}/src/index.ts"]
    }
  ]
}
```

---

## 十七、测试策略

### 17.1 免构建项目的测试配置

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^1.6.0",
    "@vitest/ui": "^1.6.0",
    "@vitest/coverage-v8": "^1.6.0"
  }
}
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80,
      },
    },
  },
});
```

### 17.2 使用 Bun 测试运行器

Bun 内置测试运行器，API 兼容 Jest：

```typescript
// math.test.ts
import { describe, it, expect } from "bun:test";
import { add, divide } from "./math";

describe("math", () => {
  it("adds two numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("throws on division by zero", () => {
    expect(() => divide(10, 0)).toThrow("Division by zero");
  });
});
```

运行：`bun test`

---

*全文完 — 2026-05-01*


---

## 十八、工具链组合策略

### 18.1 开发-生产双模式配置

许多项目采用"开发用 tsx，生产用原生"的组合策略：

```json
// package.json
{
  "name": "my-app",
  "type": "module",
  "scripts": {
    "dev": "tsx watch --clear-screen=false src/index.ts",
    "dev:debug": "tsx watch --inspect src/index.ts",
    "start": "node --experimental-strip-types src/index.ts",
    "start:bun": "bun run src/index.ts",
    "typecheck": "tsc --noEmit",
    "typecheck:watch": "tsc --noEmit --watch",
    "test": "vitest",
    "test:bun": "bun test",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "hono": "^4.0.0"
  },
  "devDependencies": {
    "tsx": "^4.7.0",
    "typescript": "^5.4.0",
    "vitest": "^1.6.0",
    "@types/node": "^20.11.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0"
  },
  "engines": {
    "node": ">=23.0.0"
  }
}
```

### 18.2 环境特定的入口文件

```typescript
// src/index.ts — 统一入口，自动检测运行时
import { getRuntime } from "./runtime.js";

const runtime = getRuntime();
console.log(`Starting on ${runtime} runtime...`);

// 根据运行时加载对应的启动逻辑
switch (runtime) {
  case "bun":
    await import("./server/bun.js");
    break;
  case "deno":
    await import("./server/deno.js");
    break;
  case "node":
  default:
    await import("./server/node.js");
    break;
}
```

### 18.3 团队协作的免构建规范

```markdown
# 免构建 TypeScript 团队规范

## 开发环境
- 使用 `tsx watch` 进行开发
- VS Code 配置统一的调试 launch.json
- 提交前必须运行 `npm run typecheck`

## 代码规范
- 所有 `.ts` 文件使用显式扩展名导入
- 禁止使用实验性装饰器（直到 Node.js 原生支持）
- 环境变量通过统一配置管理器读取

## CI/CD
- 类型检查为必过项
- 单元测试覆盖 ≥ 80%
- 生产部署使用 Node.js 23+ strip-types 或 Bun

## 依赖管理
- 优先选择 ESM-only 包
- 检查包的 Node.js 兼容性
- 记录所有需要 polyfill 的 API
```

---

## 十九、常见问题 FAQ

### Q: 免构建是否意味着放弃类型安全？
**A**: 完全不是。免构建仅省略编译步骤，类型检查仍通过 `tsc --noEmit` 在开发和 CI 阶段执行。类型安全与是否生成 `.js` 文件无关。

### Q: 生产环境用 tsx 运行是否安全？
**A**: tsx 基于 esbuild，生产中使用完全安全。但如果追求最小依赖，Node.js 23+ 原生 strip-types 或 Bun 是更轻量的选择。

### Q: 如何处理需要在浏览器运行的 TypeScript？
**A**: 浏览器无法直接运行 TypeScript，仍需 bundler（Vite、esbuild）。免构建主要针对服务端和脚本场景。

### Q: 大型项目（1000+ 文件）是否适合免构建？
**A**: 取决于运行时。Bun 和 Deno 处理大型代码库非常出色。Node.js strip-types 也在持续优化，但超大项目可能仍需考虑增量编译。

### Q: 第三方库没有 `.d.ts` 怎么办？
**A**: 使用 `// @ts-ignore` 或创建自定义类型声明文件（`.d.ts`）。长期应向库作者提交 PR 添加类型支持。

### Q: 免构建与 Monorepo（Turborepo / Nx）兼容吗？
**A**: 完全兼容。Turborepo 的管道任务可以配置为 `tsc --noEmit`（类型检查）+ `tsx`（执行），无需 `tsc --build`。

---

*全文完 — 2026-05-01*
