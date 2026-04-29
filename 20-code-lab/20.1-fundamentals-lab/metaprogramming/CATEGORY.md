---
dimension: 语言核心
sub-dimension: 元编程
created: 2026-04-28
---

# CATEGORY.md — Metaprogramming

## 模块归属声明

本模块归属 **「语言核心」** 维度，聚焦元编程（Metaprogramming）核心概念与工程实践。

## 包含内容

- 反射（Reflect API）与拦截（Proxy）
- 装饰器（Decorators）与编译时元数据操作
- 代码生成（Code Generation）与 AST 变换
- 依赖注入容器（DI Container）与元数据反射

## 子模块目录结构

| 子模块 | 说明 | 关键特性 |
|--------|------|----------|
| `proxy-interceptor/` | Proxy 拦截器模式 | get/set/apply/has/construct 陷阱 |
| `decorators/` | TypeScript 装饰器 | 类/方法/属性/参数装饰器 |
| `code-generation/` | 运行时代码生成 | `new Function`、模板编译、eval 安全替代 |
| `ast-traverser/` | AST 遍历与变换 | Babel/TypeScript Compiler API |
| `di-container/` | 依赖注入容器 | 反射元数据、自动解析、生命周期管理 |
| `meta-techniques/` | 元技术集合 | Symbol、Well-known symbols、Reflect 元编程 |

## 代码示例

### Proxy 拦截器：验证与日志

```typescript
// proxy-validator.ts — 使用 Proxy 实现运行时验证
function createValidatedUser(target: Record<string, any>) {
  const schema: Record<string, string> = {
    name: 'string',
    age: 'number',
    email: 'string',
  };

  return new Proxy(target, {
    set(obj, prop: string, value) {
      const expected = schema[prop];
      if (expected && typeof value !== expected) {
        throw new TypeError(
          `Property "${prop}" expects ${expected}, got ${typeof value}`
        );
      }
      obj[prop] = value;
      return true;
    },
    get(obj, prop: string) {
      console.log(`[LOG] Accessing "${prop}"`);
      return prop in obj ? obj[prop] : undefined;
    },
  });
}

const user = createValidatedUser({ name: 'Alice', age: 30 });
user.age = 31; // ✅
// user.age = '31'; // ❌ TypeError
```

### 装饰器：方法计时与缓存

```typescript
// decorators.ts — TypeScript 实验性装饰器
import 'reflect-metadata';

function timing(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = function (...args: any[]) {
    const start = performance.now();
    const result = original.apply(this, args);
    const duration = performance.now() - start;
    console.log(`[${propertyKey}] took ${duration.toFixed(2)}ms`);
    return result;
  };
  return descriptor;
}

function memoize(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  const cache = new Map<string, any>();
  descriptor.value = function (...args: any[]) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = original.apply(this, args);
    cache.set(key, result);
    return result;
  };
  return descriptor;
}

class MathService {
  @timing
  @memoize
  fibonacci(n: number): number {
    return n <= 1 ? n : this.fibonacci(n - 1) + this.fibonacci(n - 2);
  }
}
```

### Reflect API：规范化的元操作

```typescript
// reflect-api.ts — 使用 Reflect 替代直接操作
class Point {
  constructor(public x: number, public y: number) {}
}

const p = new Point(3, 4);

// 相比 Object.defineProperty，Reflect 返回布尔值而非抛出异常
const success = Reflect.defineProperty(p, 'z', {
  value: 5,
  writable: true,
});
console.log(success); // true

// 相比 Function.prototype.apply，Reflect.apply 更语义化
const sum = Reflect.apply(Math.max, null, [1, 5, 3]);
console.log(sum); // 5

// Reflect.construct 等价于 new 运算符，但可指定 new.target
const instance = Reflect.construct(Point, [10, 20]);
console.log(instance.x); // 10
```

### AST 遍历：简单的代码分析器

```typescript
// ast-analyzer.ts — 使用 TypeScript Compiler API
import * as ts from 'typescript';

function findUnusedExports(sourceFile: ts.SourceFile): string[] {
  const exports: string[] = [];
  const usages = new Set<string>();

  function visit(node: ts.Node) {
    if (ts.isExportDeclaration(node) && node.exportClause) {
      ts.forEachChild(node.exportClause, (spec) => {
        if (ts.isExportSpecifier(spec)) exports.push(spec.name.text);
      });
    }
    if (ts.isIdentifier(node)) usages.add(node.text);
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);

  return exports.filter((e) => !usages.has(e));
}

const code = `export const foo = 1; export const bar = 2; console.log(foo);`;
const sf = ts.createSourceFile('test.ts', code, ts.ScriptTarget.Latest, true);
console.log(findUnusedExports(sf)); // ['bar']
```

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN — Proxy | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) |
| MDN — Reflect | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect) |
| TC39 Decorators Proposal | 提案 | [github.com/tc39/proposal-decorators](https://github.com/tc39/proposal-decorators) |
| TypeScript Decorators | 文档 | [typescriptlang.org/docs/handbook/decorators.html](https://www.typescriptlang.org/docs/handbook/decorators.html) |
| reflect-metadata | 仓库 | [github.com/rbuckton/reflect-metadata](https://github.com/rbuckton/reflect-metadata) |
| Babel Plugin Handbook | 指南 | [github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) |
| TypeScript Compiler API | 文档 | [github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) |
| AST Explorer | 工具 | [astexplorer.net](https://astexplorer.net) — 在线 AST 可视化 |
| Meta-Programming in JS (Dr. Rauschmayer) | 博客 | [2ality.com/search.html?q=proxy](https://2ality.com/search.html?q=proxy) |

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践
- [jsts-language-core-system/09-object-model](../../../10-fundamentals/10.5-object-model/) — 对象模型与元编程基础

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 ast-traverser.test.ts
- 📄 ast-traverser.ts
- 📄 code-generation.test.ts
- 📄 code-generation.ts
- 📄 decorators.test.ts
- 📄 decorators.ts
- 📄 di-container.test.ts
- 📄 di-container.ts
- 📄 index.ts
- 📄 meta-techniques.test.ts
- 📄 meta-techniques.ts
- 📄 proxy-interceptor.test.ts
- ... 等 3 个条目

---

> 此分类文档已根据实际模块内容补充代码示例与权威链接。

---

*最后更新: 2026-04-29*
