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

### Proxy 可撤销代理与私有属性保护

```typescript
// revocable-proxy.ts — 可撤销访问权与私有字段模拟
function createSecureResource(data: Record<string, any>) {
  const { proxy, revoke } = Proxy.revocable(data, {
    get(target, prop: string) {
      if (prop.startsWith('_')) {
        throw new Error(`Access denied to private field: ${prop}`);
      }
      return target[prop];
    },
    set(target, prop: string, value) {
      if (prop.startsWith('_')) {
        throw new Error(`Cannot modify private field: ${prop}`);
      }
      target[prop] = value;
      return true;
    },
  });
  return { proxy, revoke };
}

const { proxy: db, revoke } = createSecureResource({
  publicKey: 'abc123',
  _secretToken: 'super-secret',
});

console.log(db.publicKey); // 'abc123'
// console.log(db._secretToken); // Error: Access denied

revoke();
// console.log(db.publicKey); // TypeError: Cannot perform 'get' on a proxy that has been revoked
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

### 装饰器：自动依赖注入

```typescript
// di-decorator.ts — 使用 reflect-metadata 实现依赖注入
import 'reflect-metadata';

const INJECTABLE_METADATA_KEY = Symbol('injectable');
const DEPENDENCIES_KEY = Symbol('dependencies');

function Injectable() {
  return function (target: any) {
    Reflect.defineMetadata(INJECTABLE_METADATA_KEY, true, target);
    return target;
  };
}

function Inject(token: string) {
  return function (target: any, _propertyKey: string, parameterIndex: number) {
    const existing = Reflect.getMetadata(DEPENDENCIES_KEY, target) || [];
    existing[parameterIndex] = token;
    Reflect.defineMetadata(DEPENDENCIES_KEY, existing, target);
  };
}

@Injectable()
class Logger {
  log(msg: string) { console.log(`[LOG] ${msg}`); }
}

@Injectable()
class UserService {
  constructor(@Inject('Logger') private logger: Logger) {}
  getUser(id: string) {
    this.logger.log(`Fetching user ${id}`);
    return { id, name: 'Alice' };
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

### Reflect API：元编程操作合集

```typescript
// reflect-meta.ts — Reflect 全面元操作示例
const obj = { a: 1, b: 2, [Symbol('hidden')]: 3 };

// Reflect.ownKeys 返回所有键（包括 Symbol）
console.log(Reflect.ownKeys(obj)); // ['a', 'b', Symbol(hidden)]

// Reflect.getOwnPropertyDescriptor
const desc = Reflect.getOwnPropertyDescriptor(obj, 'a');
console.log(desc); // { value: 1, writable: true, enumerable: true, configurable: true }

// Reflect.setPrototypeOf
const child = {};
Reflect.setPrototypeOf(child, obj);
console.log(child.a); // 1（继承）

// Reflect.preventExtensions + 检测
Reflect.preventExtensions(obj);
console.log(Reflect.isExtensible(obj)); // false

// Reflect.deleteProperty（语义化 delete 操作符）
const target = { x: 1 };
Reflect.deleteProperty(target, 'x');
console.log('x' in target); // false

// Reflect.get + receiver 参数（处理 Proxy 链）
const proxy = new Proxy({ value: 42 }, {
  get(target, prop, receiver) {
    return Reflect.get(target, prop, receiver);
  },
});
console.log(proxy.value); // 42
```

### Symbol 元编程：Well-known Symbols

```typescript
// well-known-symbols.ts — 使用 Symbol 协议定制对象行为

// Symbol.iterator — 使对象可迭代
class Range {
  constructor(private start: number, private end: number) {}
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) yield i;
  }
}
console.log([...new Range(1, 5)]); // [1, 2, 3, 4, 5]

// Symbol.toPrimitive — 定制类型转换
class Money {
  constructor(private amount: number, private currency: string) {}
  [Symbol.toPrimitive](hint: 'string' | 'number' | 'default') {
    if (hint === 'number') return this.amount;
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }
}
const price = new Money(99.99, 'USD');
console.log(String(price));  // USD 99.99
console.log(+price + 1);     // 100.99

// Symbol.toStringTag — 定制 Object.prototype.toString
class MyClass {}
Object.defineProperty(MyClass.prototype, Symbol.toStringTag, {
  value: 'MyCustomClass',
});
console.log(Object.prototype.toString.call(new MyClass())); // [object MyCustomClass]

// Symbol.asyncIterator — 异步迭代
async function* asyncCounter() {
  for (let i = 0; i < 3; i++) {
    await new Promise(r => setTimeout(r, 10));
    yield i;
  }
}
(async () => {
  for await (const n of asyncCounter()) {
    console.log(n); // 0, 1, 2
  }
})();
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

### 代码生成：安全的模板编译

```typescript
// template-compiler.ts — 安全模板引擎（替代 eval）
function compileTemplate(template: string) {
  // 提取占位符 ${expr}
  const regex = /\$\{(\w+)\}/g;
  const keys: string[] = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    keys.push(match[1]);
  }

  // 使用 Function 构造器（比 eval 安全，限定作用域）
  return new Function(
    ...keys,
    `return \`${template.replace(regex, '${$1}')}\`;`
  );
}

const greet = compileTemplate('Hello, ${name}! You are ${age} years old.');
console.log(greet('Alice', 30)); // Hello, Alice! You are 30 years old.

// 对比危险的 eval：
// eval(`var name = '${userInput}'; ...`); // 若 userInput 包含恶意代码则风险极高
```

## 权威参考链接

| 资源 | 类型 | 链接 |
|------|------|------|
| MDN — Proxy | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) |
| MDN — Reflect | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect) |
| MDN — Symbol | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) |
| MDN — Well-known Symbols | 文档 | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#well-known_symbols](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol#well-known_symbols) |
| TC39 Decorators Proposal | 提案 | [github.com/tc39/proposal-decorators](https://github.com/tc39/proposal-decorators) |
| TypeScript Decorators | 文档 | [typescriptlang.org/docs/handbook/decorators.html](https://www.typescriptlang.org/docs/handbook/decorators.html) |
| reflect-metadata | 仓库 | [github.com/rbuckton/reflect-metadata](https://github.com/rbuckton/reflect-metadata) |
| Babel Plugin Handbook | 指南 | [github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md](https://github.com/jamiebuilds/babel-handbook/blob/master/translations/en/plugin-handbook.md) |
| TypeScript Compiler API | 文档 | [github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API) |
| AST Explorer | 工具 | [astexplorer.net](https://astexplorer.net) — 在线 AST 可视化 |
| Meta-Programming in JS (Dr. Rauschmayer) | 博客 | [2ality.com/search.html?q=proxy](https://2ality.com/search.html?q=proxy) |
| ES6 Proxies in Depth | 博客 | [2ality.com/2014/12/es6-proxies.html](https://2ality.com/2014/12/es6-proxies.html) |
| Exploring ES6: Symbols | 书籍 | [exploringjs.com/es6/ch_symbols.html](https://exploringjs.com/es6/ch_symbols.html) |
| JavaScript Metaprogramming (Dr. Axel) | 博客 | [2ality.com/2014/12/es6-proxies.html](https://2ality.com/2014/12/es6-proxies.html) |
| NestJS Dependency Injection | 文档 | [docs.nestjs.com/providers](https://docs.nestjs.com/providers) |
| InversifyJS | 仓库 | [github.com/inversify/InversifyJS](https://github.com/inversify/InversifyJS) — TS DI 容器 |
| ts-morph | 仓库 | [github.com/dsherret/ts-morph](https://github.com/dsherret/ts-morph) — TS Compiler API 封装 |
| recast | 仓库 | [github.com/benjamn/recast](https://github.com/benjamn/recast) — AST 变换工具 |

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
