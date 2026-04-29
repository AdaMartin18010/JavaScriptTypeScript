---
category: language-core
dimension: 语言核心
created: 2026-04-27
---

# CATEGORY.md — 02-design-patterns

## 所属维度

**语言核心（Language Core）**

## 边界说明

本模块收录软件工程中经过验证的经典设计模式在 JavaScript/TypeScript 中的实现。设计模式是语言无关的，但本模块聚焦于利用 JS/TS 特有的动态特性、闭包、原型链、类型系统来表达这些模式，属于语言能力的应用层面。

**非本模块内容**：前端组件模式（如 React 高阶组件）、特定框架的架构模式。

## 在语言核心体系中的位置

```
语言核心
  ├── 00-language-core      → 语法与语义基础
  ├── 02-design-patterns（本模块）→ 经典模式的 JS/TS 表达
  └── 05-algorithms         → 算法实现
```

## 子模块目录结构

| 子模块 | 说明 | GoF 分类 | 典型文件 |
|--------|------|----------|----------|
| `creational/` | 创建型模式 | GoF Creational | `singleton.ts`, `factory.ts`, `builder.ts`, `prototype.ts` |
| `structural/` | 结构型模式 | GoF Structural | `adapter.ts`, `decorator.ts`, `proxy.ts`, `composite.ts` |
| `behavioral/` | 行为型模式 | GoF Behavioral | `observer.ts`, `strategy.ts`, `iterator.ts`, `command.ts` |
| `js-specific/` | JS 特有实现 | JS Idioms | `module-pattern.ts`, `revealing-module.ts`, `iife.md` |

## 模式对比矩阵

| 模式 | 分类 | JS 实现难度 | TS 类型安全 | 典型场景 |
|------|------|-------------|-------------|----------|
| **Singleton** | 创建型 | ⭐ 简单 | ⭐⭐ 私有构造器 | 全局配置、连接池 |
| **Factory** | 创建型 | ⭐ 简单 | ⭐⭐⭐ 返回联合类型 | 多态对象创建 |
| **Builder** | 创建型 | ⭐⭐ 中等 | ⭐⭐⭐ 链式类型推断 | 复杂对象组装 |
| **Adapter** | 结构型 | ⭐ 简单 | ⭐⭐⭐ 接口映射 | 第三方库封装 |
| **Decorator** | 结构型 | ⭐⭐ 中等 | ⭐⭐ 实验性装饰器 | AOP、日志、权限 |
| **Proxy** | 结构型 | ⭐ 简单 | ⭐⭐⭐ `Proxy<T>` | 懒加载、验证、缓存 |
| **Observer** | 行为型 | ⭐ 简单 | ⭐⭐⭐ 泛型事件 | 事件总线、响应式 |
| **Strategy** | 行为型 | ⭐ 简单 | ⭐⭐⭐ 策略接口 | 算法替换、排序 |
| **Command** | 行为型 | ⭐⭐ 中等 | ⭐⭐⭐ 命令接口 | 撤销/重做、队列 |

### 代码示例：Proxy 模式（带类型安全）

```typescript
// proxy-validation.ts — 使用 Proxy 实现属性验证

interface User {
  name: string;
  age: number;
  email: string;
}

function createValidatingProxy<T extends Record<string, any>>(
  target: T,
  validators: { [K in keyof T]?: (val: T[K]) => boolean }
): T {
  return new Proxy(target, {
    set(obj, prop: string | symbol, value: any) {
      const validator = validators[prop as keyof T];
      if (validator && !validator(value)) {
        throw new TypeError(`Invalid value for ${String(prop)}: ${value}`);
      }
      obj[prop as keyof T] = value;
      return true;
    }
  });
}

const user = createValidatingProxy<User>(
  { name: 'Alice', age: 30, email: 'alice@example.com' },
  {
    age: (v) => v >= 0 && v <= 150,
    email: (v) => /^\S+@\S+\.\S+$/.test(v)
  }
);

user.age = 31;      // ✅ 通过
// user.age = -5;   // ❌ TypeError: Invalid value for age: -5
```

## 关联索引

- [10-fundamentals/10.1-language-semantics/README.md](../../../10-fundamentals/10.1-language-semantics/README.md)
- [30-knowledge-base/30.2-categories/00-language-core.md](../../../30-knowledge-base/30.2-categories/00-language-core.md)
- [Refactoring Guru — Design Patterns](https://refactoring.guru/design-patterns) — 可视化设计模式指南
- [Patterns.dev](https://www.patterns.dev/) — 现代 Web 开发模式
- [JavaScript Design Patterns](https://addyosmani.com/resources/essentialjsdesignpatterns/book/) — Addy Osmani 开源书籍
- [TypeScript Design Patterns (GitHub)](https://github.com/torokmark/design_patterns_in_typescript) — TS 实现集合
- [Node.js Design Patterns (Book)](https://www.nodejsdesignpatterns.com/) — Node.js 专用模式
