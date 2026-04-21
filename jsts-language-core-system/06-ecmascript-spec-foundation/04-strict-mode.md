# 严格模式（Strict Mode）

> 严格模式的限制与最佳实践
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 启用方式

### 1.1 脚本级严格模式

```javascript
"use strict";

// 整个脚本在严格模式下
```

### 1.2 函数级严格模式

```javascript
function strictFn() {
  "use strict";
  // 仅此函数在严格模式下
}
```

### 1.3 模块自动严格模式

```javascript
// ES Module 自动启用严格模式，无需 "use strict"
export const x = 1;
```

---

## 2. 主要限制

| 行为 | 非严格模式 | 严格模式 |
|------|-----------|---------|
| 未声明变量赋值 | 创建全局变量 | `ReferenceError` |
| 删除不可删除属性 | 静默失败 | `TypeError` |
| 重复参数名 | 允许 | `SyntaxError` |
| `this` 默认绑定 | 全局对象 | `undefined` |
| `with` 语句 | 允许 | `SyntaxError` |
| `eval`/`arguments` 绑定 | 可变 | 不可变 |
| 八进制字面量 | 允许（`010`）| `SyntaxError`（`0o10`） |

---

## 3. 实战示例

```javascript
"use strict";

// ❌ 未声明变量
x = 1; // ReferenceError

// ❌ 删除变量
delete x; // SyntaxError

// ❌ 重复参数
function f(a, a) {} // SyntaxError

// ❌ with 语句
with (obj) {} // SyntaxError

// ❌ this 为 undefined
function test() {
  console.log(this); // undefined
}
test();

// ❌ 八进制
const num = 010; // SyntaxError，应使用 0o10
```

---

## 4. 最佳实践

```
1. 始终使用严格模式（模块自动启用）
2. 使用 ES Module 替代脚本
3. 使用 TypeScript（隐式启用严格模式）
4. 配置 ESLint: strict: ["error", "global"]
```

---

**参考规范**：ECMA-262 §11.2.2 Strict Mode Code
