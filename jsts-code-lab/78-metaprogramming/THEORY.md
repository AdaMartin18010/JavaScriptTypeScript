# 元编程理论：代码生成代码的艺术

> **目标读者**：高级开发者、编译器爱好者、框架作者
> **关联文档**：[`docs/categories/78-metaprogramming.md`](../../docs/categories/78-metaprogramming.md)
> **版本**：2026-04
> **字数**：约 2,800 字

---

## 1. 元编程的层次

### 1.1 四代元编程

| 层次 | 技术 | 时机 | 示例 |
|------|------|------|------|
| **运行时** | Proxy、Reflect、eval | 执行时 | 代理对象行为 |
| **编译时** | Babel 插件、TypeScript Transform | 编译时 | 语法转换 |
| **类型层** | 模板类型、条件类型 | 类型检查 | 类型体操 |
| **代码生成** | 宏、代码生成器 | 开发时 | Prisma Client 生成 |

---

## 2. 运行时元编程

### 2.1 Proxy 与 Reflect

```typescript
// 实现响应式对象
function reactive<T extends object>(obj: T): T {
  return new Proxy(obj, {
    set(target, key, value) {
      const old = target[key as keyof T];
      target[key as keyof T] = value;
      if (old !== value) notify(key);  // 触发更新
      return true;
    },
  });
}
```

### 2.2 装饰器 (Decorators)

```typescript
// 标准装饰器 (TS 5.0+)
function logged(target: any, context: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.log(`Calling ${context.name}`);
    return target.call(this, ...args);
  };
}

class Example {
  @logged
  add(a: number, b: number) { return a + b; }
}
```

---

## 3. 编译时元编程

### 3.1 AST 转换

```typescript
// Babel 插件：自动添加错误边界
export default function autoErrorBoundary(babel: typeof Babel) {
  return {
    visitor: {
      JSXElement(path) {
        // 转换 <Component /> → <ErrorBoundary><Component /></ErrorBoundary>
      },
    },
  };
}
```

### 3.2 宏 (Macros)

```typescript
// Rust 风格的宏（通过构建工具实现）
// 编译时展开，无运行时开销
const sql = sql`SELECT * FROM users WHERE id = ${userId}`;
// 编译时验证 SQL 语法，生成类型安全的查询函数
```

---

## 4. 反模式

### 反模式 1：过度使用 eval

❌ `eval(userInput)` — 安全风险 + 性能损耗。
✅ 使用 `new Function()` 或 AST 转换。

### 反模式 2：魔法过于隐蔽

❌ 装饰器修改了完全不相关的代码行为。
✅ 魔法应该是可预测的、有文档的。

---

## 5. 总结

元编程是**框架作者的工具，不是应用开发者的日常**。

**核心原则**：
1. 优先使用语言内置机制
2. 代码生成优于运行时魔法
3. 元编程的复杂度应该隐藏，而不是转移

---

## 参考资源

- [Proxy MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
- [TC39 Decorators](https://github.com/tc39/proposal-decorators)
- [Babel Plugin Handbook](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md)
- [ts-morph](https://ts-morph.com/)

---

## 模块代码文件索引

本模块包含以下可运行 TypeScript 代码文件，用于将上述理论概念转化为实践：

- `ast-traverser.ts`
- `code-generation.ts`
- `decorators.ts`
- `di-container.ts`
- `index.ts`
- `meta-techniques.ts`
- `proxy-interceptor.ts`
- `reflection.ts`

> 💡 **学习建议**：阅读 THEORY.md 后，逐一运行上述代码文件，观察理论概念的实际行为。修改参数和边界条件，加深理解。

## 核心理论深化

### 关键设计模式

本模块涉及的核心设计模式包括（根据代码实现提炼）：

1. **模式一**：待根据代码具体分析
2. **模式二**：待根据代码具体分析
3. **模式三**：待根据代码具体分析

### 与相邻模块的关系

| 相邻模块 | 关系说明 |
|---------|---------|
| 前置依赖 | 建议先掌握的基础模块 |
| 后续进阶 | 可继续深化的相关模块 |

---

> 📅 理论深化更新：2026-04-27
