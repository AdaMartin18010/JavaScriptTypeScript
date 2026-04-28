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

*本文件为模块系统专题的补充篇。*
