# 循环依赖：检测、分析与解决

> **定位**：`10-fundamentals/10.4-module-system/`

---

## 一、定义

**循环依赖（Circular Dependency）**：模块 A 依赖模块 B，模块 B（直接 or 间接）依赖模块 A，形成有向图中的环。

```
A.js ──→ B.js
  ↑         │
  └─────────┘
```

---

## 二、ESM 与 CJS 的循环依赖处理对比

| 维度 | ESM | CJS |
|------|-----|-----|
| **检测时机** | 链接阶段（静态） | 运行时（动态） |
| **未初始化访问** | TDZ 错误 | 返回 `{}` 或部分导出 |
| **可预测性** | 高 | 低 |
| **解决策略** | 重构为无环图 | 延迟 require / 重构 |

---

## 三、ESM 循环依赖的形式化分析

### 3.1 TDZ 保护机制

```javascript
// a.mjs
import { b } from './b.mjs';  // 若 b 尚未初始化 → ReferenceError (TDZ)
export const a = 'a';

// b.mjs
import { a } from './a.mjs';  // a 的绑定存在但可能未初始化
export const b = 'b';
```

### 3.2 安全模式：函数导出

```javascript
// a.mjs
import { getB } from './b.mjs';
export function getA() { return 'a' + getB(); }

// b.mjs
import { getA } from './a.mjs';
export function getB() { return 'b' + getA(); }
```

函数导出避免 TDZ，因为函数体在调用时才执行。

---

## 四、CJS 循环依赖的诊断与修复

### 4.1 诊断工具

```bash
# madge：循环依赖检测
npx madge --circular src/

# dependency-cruiser：依赖可视化
npx depcruise --config .dependency-cruiser.js src/
```

### 4.2 修复策略

| 策略 | 方法 | 适用场景 |
|------|------|---------|
| **重构为无环** | 提取公共依赖到独立模块 | 架构级循环 |
| **延迟加载** | 将 require 移入函数内部 | 运行时循环 |
| **事件总线** | 用发布-订阅替代直接依赖 | 复杂交互 |
| **依赖注入** | 通过构造函数/配置传入依赖 | 测试友好型重构 |

---

## 五、Monorepo 中的循环依赖

Monorepo 中循环依赖的破坏性更大：

```
@org/users ──→ @org/orders
     ↑              │
     └──────────────┘
```

**类型系统检测**：TypeScript Project References 在编译期即可检测包级循环依赖。

---

*本文件为模块系统专题的循环依赖专项分析。*
