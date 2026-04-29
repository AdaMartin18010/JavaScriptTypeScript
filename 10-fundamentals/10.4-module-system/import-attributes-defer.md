# Import Attributes 与 Import Defer

> **定位**：`10-fundamentals/10.4-module-system/`
> **规范来源**：ECMA-262 Import Attributes (ES2025) | Import Defer 提案 (Stage 3)

---

## Import Attributes（ES2025）

Import Attributes 允许在导入语句中附加**元数据**，向宿主环境传递加载提示。

```javascript
import json from './data.json' with { type: 'json' };
import wasm from './module.wasm' with { type: 'webassembly' };
import styles from './styles.css' with { type: 'css' };
```

### 关键语义

1. **不改变加载行为**：Import Attributes 是**提示**（hint），不改变模块的解析/链接/执行语义
2. **安全性**：防止「错误类型导入」攻击（如将 `.json` 作为 JS 执行）
3. **重复一致性**：同一模块的不同导入必须使用相同的 attributes

### TypeScript 支持

```typescript
// TypeScript 5.3+ 支持 Import Attributes 语法
import data from './data.json' with { type: 'json' };
// data 的类型推断为 JSON 的推断类型
```

---

## Import Defer（Stage 3，预计 ES2026/2027）

Import Defer 允许模块的**命名空间对象**立即可用，但内部模块延迟加载。

```javascript
import defer * as heavy from './heavy-module.js';

// heavy 的命名空间对象立即可用
console.log(heavy); // Module { ... }

// 但访问具体导出时，若模块未加载完成，返回 Promise-like 的延迟引用
const result = heavy.compute(); // 自动等待模块加载完成
```

### 用例

| 场景 | 收益 |
|------|------|
| 大型图表库 | 减少首屏初始化 50%+ |
| 富文本编辑器 | 按需加载编辑器核心 |
| 多语言包 | 仅加载当前语言 |

---

## 对比矩阵：模块加载策略

| 策略 | 语法 | 加载时机 | 适用场景 |
|------|------|---------|---------|
| 静态导入 | `import { x } from '...'` | 解析阶段 | 必需依赖 |
| 动态导入 | `await import('...')` | 执行阶段 | 条件/懒加载 |
| Import Defer | `import defer * as x` | 延迟加载 | 大型可选依赖 |

---

## 代码示例：`import ... with { type: "json" }` 实战

```typescript
// ============================================
// 1. JSON 导入：类型安全的配置加载
// ============================================

// config.json
// {
//   "apiBaseUrl": "https://api.example.com",
//   "timeout": 5000,
//   "features": { "darkMode": true, "beta": false }
// }

// TypeScript 5.3+ 推断 JSON 结构为具体类型
import config from './config.json' with { type: 'json' };

// config 的类型自动推断为：
// {
//   apiBaseUrl: string;
//   timeout: number;
//   features: { darkMode: boolean; beta: boolean; };
// }

function initializeApp() {
  // ✅ 类型安全访问，无需手动断言或 interface 声明
  const baseUrl: string = config.apiBaseUrl;
  const timeout: number = config.timeout;
  const darkMode: boolean = config.features.darkMode;

  // config.apiBaseUrl = 'hacked'; // ❌ Error: 导入的 JSON 在 TS 中是 readonly

  console.log(`API: ${baseUrl}, timeout: ${timeout}ms`);
}

// ============================================
// 2. CSS Module 导入（浏览器原生模块支持）
// ============================================

// styles.css
// .container { display: flex; gap: 1rem; }
// .title { font-size: 1.5rem; }

// Chrome 123+ / Firefox 提案阶段 支持 CSS Module Scripts
import sheet from './styles.css' with { type: 'css' };

// sheet 是 CSSStyleSheet 实例
document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];

// ============================================
// 3. Import Attributes 的断言语义对比
// ============================================

// ES2025 Import Attributes（当前标准）
import data from './data.json' with { type: 'json' };
// 含义：提示宿主以 JSON 方式处理；若宿主不支持则报错

// 旧的 Import Assertions（已废弃语法，ES2022 实验性）
// import data from './data.json' assert { type: 'json' };
// assert 暗示运行时验证，with 暗示宿主提示——语义更精确

// ============================================
// 4. 条件导入与动态 attributes 组合
// ============================================

async function loadLocale(locale: string) {
  // 动态导入 + import attributes：按需加载翻译文件
  const messages = await import(`./locales/${locale}.json`, {
    with: { type: 'json' },
  });
  return messages.default;
}

// ============================================
// 5. 安全性：防止 MIME 类型混淆攻击
// ============================================

// 攻击场景：攻击者上传名为 config.json 的恶意 JS 文件
// 若服务器返回 Content-Type: application/javascript，
// import attributes 会强制要求宿主按 JSON 解析，
// 解析失败 → 抛出 SyntaxError，阻止代码注入

import safeConfig from '/api/config' with { type: 'json' };
// 即使服务器返回 JS，with { type: 'json' } 强制 JSON 解析
```

---

## Import Attributes vs Import Assertions 历史演变

| 特性 | Import Assertions (ES2022 实验) | Import Attributes (ES2025 标准) |
|------|--------------------------------|--------------------------------|
| 语法 | `assert { type: 'json' }` | `with { type: 'json' }` |
| 语义 | 运行时断言 | 宿主提示（hint） |
| 重复导入一致性 | 要求相同 | 要求相同 |
| 浏览器支持 | Chrome 91+ (已废弃) | Chrome 123+, Safari 17+, Node 20+ |
| 未来扩展性 | 低（assert 语义受限） | 高（任意键值提示） |

---

## 权威参考链接

| 资源 | 说明 | 链接 |
|------|------|------|
| **ECMA-262 Import Attributes** | ES2025 规范原文 | [tc39.es/ecma262/#sec-import-attributes](https://tc39.es/ecma262/#sec-import-attributes) |
| **Import Attributes Proposal (tc39)** | GitHub 提案仓库与动机文档 | [github.com/tc39/proposal-import-attributes](https://github.com/tc39/proposal-import-attributes) |
| **Import Defer Proposal (tc39)** | Stage 3 提案 | [github.com/tc39/proposal-import-defer](https://github.com/tc39/proposal-import-defer) |
| **TypeScript 5.3 Release Notes** | Import Attributes 支持说明 | [devblogs.microsoft.com/typescript/announcing-typescript-5-3/#import-attributes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-3/#import-attributes) |
| **MDN: import** | Mozilla 开发者文档（含 attributes） | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) |
| **V8 Blog: Import Attributes** | 引擎实现层面解析 | [v8.dev/features/import-attributes](https://v8.dev/features/import-attributes) |

---

*本文件为模块系统专题的补充篇，已增强对比矩阵与代码示例。*
