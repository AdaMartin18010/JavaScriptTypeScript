---
title: 12 类型技术决策矩阵
description: 建立类型技术选型的系统决策框架：何时使用 interface vs type、泛型 vs 条件类型、类型体操 vs 运行时校验。
---

# 12 类型技术决策矩阵

> **前置知识**：TypeScript 全部核心机制
>
> **目标**：能够为具体场景选择最合适的类型技术

---

## 1. interface vs type

### 1.1 决策矩阵

| 场景 | interface | type | 推荐 |
|------|-----------|------|------|
| 对象形状定义 | ✅ 声明合并 | ✅ | interface |
| 联合类型 | ❌ | ✅ | type |
| 类实现 | ✅ | ❌ | interface |
| 递归类型 | ⚠️ | ✅ | type |
| 映射类型 | ❌ | ✅ | type |
| 工具类型参数 | ❌ | ✅ | type |
| 跨文件扩展 | ✅ 声明合并 | ❌ | interface |

### 1.2 实践建议

```typescript
// ✅ 用 interface 定义对象结构（可扩展）
interface User {
  id: string;
  name: string;
}

// 在其他文件中扩展
interface User {
  email: string;
}

// ✅ 用 type 定义联合、工具类型
type Status = 'idle' | 'loading' | 'success' | 'error';
type UserOrNull = User | null;
```

---

## 2. 泛型 vs 条件类型

### 2.1 使用场景

| 场景 | 泛型 | 条件类型 | 组合 |
|------|------|---------|------|
| 函数参数/返回 | ✅ | ❌ | 泛型 |
| 工具类型 | ✅ | ✅ | 组合 |
| 运行时分支 | ❌ | ✅ | 条件类型 |
| 类型提取 | ❌ | ✅ | infer |
| 集合操作 | ✅ | ⚠️ | 泛型 |

---

## 3. 类型体操 vs 运行时校验

### 3.1 边界判断

```
类型体操适用：                        运行时校验适用：
├── 编译时类型推导                    ├── 外部 API 响应
├── 内部工具类型                      ├── 用户输入
├── 库的类型设计                      ├── 表单数据
└── 类型映射和转换                    └── 配置文件

黄金法则：
- 类型体操用于"已知形状的数据转换"
- 运行时校验用于"未知来源的数据验证"
```

### 3.2 Zod + TypeScript 组合

```typescript
import { z } from 'zod';

// 运行时校验 + 类型推导
const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

// 使用
function processUser(data: unknown): User {
  return UserSchema.parse(data); // 运行时校验 + 类型安全
}
```

---

## 4. 决策流程图

```
需要类型安全？
├── 否 → 使用 any/unknown（快速原型）
└── 是 → 数据来源？
    ├── 内部代码 → 类型体操程度？
    │   ├── 简单 → interface/type
    │   ├── 复杂 → 泛型 + 条件类型
    │   └── 极复杂 → 类型体操（库代码）
    └── 外部数据 → 运行时校验？
        ├── 是 → Zod/Yup/Valibot
        └── 否 → 类型断言（谨慎）
```

---

## 延伸阅读

- [TypeScript Handbook — Advanced Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [Zod Documentation](https://zod.dev/)
