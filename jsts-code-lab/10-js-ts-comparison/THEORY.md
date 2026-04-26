# JavaScript 与 TypeScript 差异 — 理论基础

## 1. 类型系统本质差异

| 维度 | JavaScript | TypeScript |
|------|-----------|------------|
| 类型检查 | 运行时 | 编译时 |
| 类型系统 | 动态、鸭子类型 | 静态、结构类型 |
| 类型擦除 | N/A | 编译后移除类型 |
| 类型推断 | 弱（typeof） | 强（基于赋值推断） |

## 2. TypeScript 类型层级

```
unknown → 所有类型的超类型
  ├── any（逃逸舱口）
  ├── object
  │   ├── Array
  │   ├── Function
  │   └── 自定义对象
  ├── string / number / boolean / symbol / bigint
  ├── null / undefined
  └── never → 所有类型的子类型（空集）
```

## 3. 结构化类型系统

TypeScript 使用**结构等价**而非名义等价：

```typescript
interface Point { x: number; y: number }
class Point2D { x: number; y: number }
// Point 与 Point2D 兼容，因为它们结构相同
```

## 4. 类型收窄（Narrowing）

TypeScript 通过控制流分析自动收窄类型：

- `typeof` 守卫: `if (typeof x === 'string')`
- 真值守卫: `if (x)` 排除 null/undefined
- `instanceof` 守卫: `if (x instanceof Date)`
- 自定义类型守卫: `function isString(x: unknown): x is string`
- 判别联合: `if (x.kind === 'circle')`

## 5. 高级类型特性

- **条件类型**: `T extends U ? X : Y`
- **映射类型**: `{ [K in keyof T]: T[K] }`
- **模板字面量类型**: `` `hello-${string}` ``
- **逆变/协变**: 函数参数位置的类型关系

## 6. 与相邻模块的关系

- **00-language-core**: JavaScript 核心机制
- **01-ecmascript-evolution**: ECMAScript 标准演进
- **40-type-theory-formal**: 类型理论的形式化基础
