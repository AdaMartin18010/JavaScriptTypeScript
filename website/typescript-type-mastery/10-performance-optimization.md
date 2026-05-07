---
title: 10 类型系统性能优化
description: 掌握 TypeScript 编译性能优化：编译速度诊断、项目引用、声明文件优化、类型导入策略和大型项目架构。
---

# 10 类型系统性能优化

> **前置知识**：TypeScript 配置、模块系统
>
> **目标**：能够诊断和优化 TypeScript 编译性能

---

## 1. 编译性能诊断

### 1.1 性能分析

```bash
# 生成性能报告
tsc --generateTrace trace-output

# 查看诊断信息
tsc --extendedDiagnostics

# 关键指标
Files:              1250
Lines:            185000
Identifiers:      450000
Symbols:          920000
Types:            180000
Memory used:     512000K
Assignability cache size:  45000
Identity cache size:       12000
Subtype cache size:        28000
Strict subtype cache size:  8000
I/O Read time:    1.2s
Parse time:       2.5s
Program time:     4.0s
Bind time:        1.5s
Check time:      12.0s   # 重点关注
total time:      18.5s
```

### 1.2 常见瓶颈

| 瓶颈类型 | 症状 | 解决 |
|---------|------|------|
| 类型数量爆炸 | Types > 100k | 减少条件类型嵌套 |
| 深度递归 | Check time 高 | 限制递归深度 |
| 大型联合类型 | Identity cache 高 | 使用接口替代 |
| 循环依赖 | Program time 高 | 重构模块结构 |

---

## 2. 项目引用（Project References）

### 2.1 分层编译

```json
// tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "declaration": true,
    "declarationMap": true
  },
  "references": [
    { "path": "./packages/core" },
    { "path": "./packages/ui" },
    { "path": "./packages/app" }
  ]
}

// packages/core/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"]
}
```

### 2.2 增量编译

```bash
# 构建依赖图
tsc -b

# 增量构建（只编译变化的部分）
tsc -b --incremental

# 监听模式
tsc -b --watch
```

---

## 3. 类型导入优化

### 3.1 import type

```typescript
// ✅ 类型导入在编译后完全擦除
import type { User, Post } from './types';
import { createUser, type CreateUserInput } from './user';

// ✅ 使用 type 修饰符
export type { User } from './types';

// ❌ 避免：导入整个模块只用于类型
import * as Types from './types'; // 可能导致不必要的副作用
```

### 3.2 避免类型循环

```typescript
// ❌ 循环依赖导致编译慢
// types-a.ts
import type { B } from './types-b';
export interface A { b: B; }

// types-b.ts
import type { A } from './types-a';
export interface B { a: A; }

// ✅ 解耦：使用基类型
// base.ts
export interface Base { id: string; }

// types-a.ts
import type { Base } from './base';
export interface A extends Base { bId: string; }

// types-b.ts
import type { Base } from './base';
export interface B extends Base { aId: string; }
```

---

## 4. 大型项目架构

### 4.1 Monorepo 策略

```
project/
├── packages/
│   ├── types/          # 共享类型（独立包）
│   ├── utils/          # 工具函数
│   ├── ui/             # 组件库
│   └── app/            # 应用
├── tsconfig.json       # 根配置（只包含 references）
└── tsconfig.base.json  # 共享配置
```

### 4.2 严格配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **skipLibCheck 关闭** | 类型检查所有 .d.ts 文件 | 开启 skipLibCheck |
| **无项目引用** | 每次编译全部文件 | 使用 composite + references |
| **类型导入未标记** | 编译后残留类型导入 | 使用 import type |
| **深度类型嵌套** | 编译器递归超限 | 限制类型深度 |

---

## 延伸阅读

- [TypeScript Performance](https://github.com/microsoft/TypeScript/wiki/Performance)
- [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
