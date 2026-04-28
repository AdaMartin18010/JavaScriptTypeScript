# ESM/CJS 互操作与模块加载语义

> **定位**：`10-fundamentals/10.4-module-system/` — L1 语言核心层：模块系统专题
> **关联**：`jsts-code-lab/12-package-management/` | `docs/guides/module-system-guide.md`
> **规范来源**：ECMA-262 §16.2 Modules | Node.js ESM Docs | TypeScript Module Resolution

---

## 一、核心命题

JavaScript 的模块系统在 2026 年仍处于 **ESM (ECMAScript Modules)** 与 **CJS (CommonJS)** 的双轨制状态。理解两者的互操作机制，是掌握现代 JS/TS 工程的核心前提。

---

## 二、公理化基础

### 公理 1（静态性公理）

ESM 的导入绑定在**解析阶段**即已确定，模块依赖图在代码执行前完全可构建。

### 公理 2（动态性公理）

CJS 的 `require()` 在**执行阶段**动态解析，模块图在运行时才能完整确定。

### 公理 3（互操作公理）

Node.js 作为宿主环境，通过**规范转换层**将 CJS 模块包装为 ESM 兼容的命名空间对象，实现双轨互通。

---

## 三、ESM 加载语义的形式化

### 3.1 模块记录（Module Record）

ECMA-262 定义了抽象的 **Source Text Module Record**，其关键字段：

| 字段 | 类型 | 语义 |
|------|------|------|
| `[[ECMAScriptCode]]` | Parse Node | 模块的 AST |
| `[[ImportEntries]]` | List | 静态导入条目 |
| `[[LocalExportEntries]]` | List | 本地导出条目 |
| `[[StarExportEntries]]` | List | `export *` 条目 |

### 3.2 加载算法

```
1. 解析模块说明符
2. 获取模块源码
3. 创建模块记录
4. 构建依赖图（Link）
5. 执行模块（Evaluate：DFS 拓扑排序）
```

### 3.3 Node.js 模块解析策略

| 策略 | 配置 | 说明 |
|------|------|------|
| CommonJS 解析 | 无 `"type": "module"` | `require()` 使用 CJS 算法 |
| ESM 解析 | `"type": "module"` 或 `.mjs` | `import` 使用 ESM 算法 |
| TS 解析 | `tsconfig.json` | `--module nodenext` / `--module bundler` |

---

## 四、ESM ↔ CJS 互操作矩阵

### 4.1 CJS 导入 ESM

| 场景 | 支持状态 | 限制 |
|------|---------|------|
| `require('./esm.mjs')` | v22+ | 同步加载，顶层 await 阻塞 |
| `require('esm-package')` | v22+ | 包需定义 `exports` |
| 动态 `import()` | 所有版本 | 返回 Promise，异步加载 |

### 4.2 ESM 导入 CJS

**互操作规则表**：

| CJS 导出形式 | ESM 默认导入 | ESM 命名导入 | 说明 |
|-------------|-------------|-------------|------|
| `module.exports = x` | `import x from '...'` | 无命名导入 | `default` 绑定到 `x` |
| `exports.foo = x` | `import mod from '...'` | `import { foo }` | `mod.foo` 或解构 |
| `exports.__esModule = true` | 按 Babel 兼容处理 | 可能提升命名导出 | 互操作暗语 |

---

## 五、循环依赖（Circular Dependencies）

### 5.1 ESM 中的循环依赖

ESM 通过**TDZ（Temporal Dead Zone）** 保护未初始化绑定，避免访问 `undefined`。

**定理（ESM 循环依赖安全定理）**：ESM 的循环依赖在链接阶段即可检测，未初始化绑定通过 TDZ 保护。

### 5.2 CJS 中的循环依赖

CJS 的循环依赖更隐蔽，可能返回**不完整的模块导出**（`{}`）。

---

## 六、Import Attributes 与 Defer

### 6.1 Import Attributes（ES2025）

```javascript
import json from './data.json' with { type: 'json' };
```

### 6.2 Import Defer（Stage 3）

```javascript
import defer * as heavy from './heavy-module.js';
```

---

## 七、决策树：何时用 ESM，何时用 CJS

```
项目类型分析
├── 新项目（Greenfield）
│   └── → 全部使用 ESM
├── 库（Library）
│   └── → 双模式发布（ESM + CJS 回退）
├── 遗留项目（Legacy）
│   └── → 渐进迁移（.mjs / 动态 import()）
└── TypeScript 项目
    └── → "module": "nodenext" 或 "bundler"
```

---

*本文件为 L1 模块系统专题的首篇，后续将补充 `import-attributes-defer.md` 与 `circular-dependency.md`。*
