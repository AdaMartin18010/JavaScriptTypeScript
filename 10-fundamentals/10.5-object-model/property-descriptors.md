# 属性描述符：不变性模式与元编程

> **定位**：`10-fundamentals/10.5-object-model/`
> **规范来源**：ECMA-262 §6.1.7.1 Property Attributes

---

## 一、属性描述符的形式化定义

ECMA-262 将属性描述符定义为**记录（Record）**，含以下字段：

| 字段 | 数据描述符 | 访问器描述符 | 默认值 |
|------|-----------|-------------|--------|
| `[[Value]]` | ✅ | ❌ | `undefined` |
| `[[Writable]]` | ✅ | ❌ | `false` |
| `[[Get]]` | ❌ | ✅ | `undefined` |
| `[[Set]]` | ❌ | ✅ | `undefined` |
| `[[Enumerable]]` | ✅ | ✅ | `false` |
| `[[Configurable]]` | ✅ | ✅ | `false` |

---

## 二、不变性模式矩阵

| 模式 | 配置 | 效果 | 用例 |
|------|------|------|------|
| **Prevent Extensions** | `Object.preventExtensions(obj)` | 禁止新增属性 | 密封配置对象 |
| **Seal** | `Object.seal(obj)` | 禁止增删 + 描述符不可变 | 保护对象结构 |
| **Freeze** | `Object.freeze(obj)` | Seal + 所有属性只读 | 常量对象 |
| **Define Property** | `Object.defineProperty` | 精确控制单属性 | 计算属性、私有模拟 |

---

## 三、描述符操作的形式化规则

### 3.1 不可配置属性的限制

若 `[[Configurable]]` 为 `false`：

- ❌ 不可删除该属性
- ❌ 不可将数据描述符改为访问器描述符（或反之）
- ❌ 不可修改 `[[Enumerable]]`
- ⚠️ 可将 `[[Writable]]` 从 `true` 改为 `false`（单向）

### 3.2 严格模式 vs 非严格模式

| 操作 | 非严格模式 | 严格模式 |
|------|-----------|---------|
| 修改只读属性 | 静默失败 | `TypeError` |
| 删除不可配置属性 | 返回 `false` | `TypeError` |
| 访问未定义 getter | `undefined` | `undefined` |

---

## 四、工程实践：用描述符实现品牌类型（Branded Types）

```typescript
// 模拟名义类型：创建不可伪造的品牌属性
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function UserId(id: string): UserId {
  return id as UserId;
}

function OrderId(id: string): OrderId {
  return id as OrderId;
}

// 编译期防止混用
const uid = UserId('u-123');
const oid = OrderId('o-456');

function getUser(id: UserId) { /* ... */ }
getUser(oid); // ❌ TS Error：类型不兼容
```

---

*本文件为对象模型专题的属性描述符深度分析。*
