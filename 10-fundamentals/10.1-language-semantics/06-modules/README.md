# 模块系统

> ESM 与 CJS 的语义差异、互操作与最佳实践。

---

## ESM (ES Modules)

```javascript
// 导出
export const foo = 1
export default function() {}

// 导入
import { foo } from './module.js'
import defaultExport from './module.js'
```

## CJS (CommonJS)

```javascript
// 导出
module.exports = { foo: 1 }
exports.bar = 2

// 导入
const { foo } = require('./module')
```

## 互操作

```javascript
// ESM 导入 CJS
import cjs from 'cjs-package'

// CJS 导入 ESM（需动态导入）
const { default: esm } = await import('esm-package')
```

---

*最后更新: 2026-04-29*
