# TypeScript 5.x–6.0 新特性

> TS 5.8、5.9、6.0 的关键改进与迁移指南
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. TypeScript 5.8 (2025年3月)

### 1.1 条件返回类型检查增强

TypeScript 5.8 增强了条件表达式直接位于 `return` 语句时的类型检查：

```typescript
// TypeScript 5.8 之前：此错误未被发现
declare const untypedCache: Map<any, any>;

function getUrlObject(urlString: string): URL {
  return untypedCache.has(urlString)
    ? untypedCache.get(urlString)  // any，但被隐式接受
    : urlString;                   // string
}

// TypeScript 5.8：报错！
function getUrlObject(urlString: string): URL {
  return untypedCache.has(urlString)
    ? untypedCache.get(urlString)  // ❌ Type 'any' is not assignable to type 'URL'
    : urlString;                   // ❌ Type 'string' is not assignable to type 'URL'
}
```

**原理**：每个分支现在会被检查是否与函数声明的返回类型匹配。

### 1.2 `--erasableSyntaxOnly` 编译器选项

Node.js 23.6+ 支持直接运行 TypeScript 文件（实验性），但仅支持**可擦除语法**。

```typescript
// ✅ 可擦除语法：类型注解可直接移除
const foo: string = 'foo';
function add(a: number, b: number): number { return a + b; }

// ❌ 不可擦除语法
namespace container {           // 有运行时代码的命名空间
  foo.method();
  export type Bar = string;
}

import Bar = container.Bar;     // import = 别名

class Point {
  constructor(public x: number, public y: number) {} // 参数属性
}

enum Direction { Up, Down }     // enum 声明
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "erasableSyntaxOnly": true
  }
}
```

**意义**：TypeScript 团队正为"JavaScript 原生类型语法"提案做准备（Stage 1）。

### 1.3 `--module nodenext` 支持 `require()` ESM

```typescript
// 以前：在 TypeScript 中使用 require() 导入 ESM 会失败
// TypeScript 5.8：在 --module nodenext 下支持
const { readFile } = require("fs");
```

---

## 2. TypeScript 5.9 (2026年Q1)

### 2.1 扩展的条件类型收窄

TypeScript 5.9 可以在条件类型分支中基于联合判别进行类型收窄：

```typescript
// TypeScript 5.8 — 需要 'as' 强制转换
type ApiResponse<T> = 
  | { status: 'success'; data: T } 
  | { status: 'error'; message: string };

function handle<T>(res: ApiResponse<T>) {
  if (res.status === 'success') {
    return (res as Extract<typeof res, { status: 'success' }>).data;
  }
}

// TypeScript 5.9 — 正确收窄，无需转换
function handle<T>(res: ApiResponse<T>) {
  if (res.status === 'success') {
    return res.data; // ✅ TypeScript 正确推断为 T
  }
}
```

### 2.2 `NoInfer<T>` 实用类型

防止类型参数在某些位置被用于推断：

```typescript
// 问题：validate 参数影响 T 的推断
declare function createStore<T>(
  initial: T,
  validate: (v: T) => boolean
): T;

createStore("hello", (v: unknown) => typeof v === "string");
// T = unknown ❌

// 使用 NoInfer 解决
declare function createStore<T>(
  initial: T,
  validate: (v: NoInfer<T>) => boolean
): T;

createStore("hello", (v: unknown) => typeof v === "string");
// T = string ✅ initial 单独决定 T
```

### 2.3 `--strictInference` 标志

新的严格性标志（默认在 `--strict` 下启用）：

```typescript
// 旧行为：TypeScript 在推断模糊时回退到 unknown 或约束类型
// strictInference：要求显式注解
function ambiguous<T>(a: T, b: T): T {
  return a;
}

ambiguous(1, "hello"); // strictInference 下可能报错，要求显式指定 T
```

### 2.4 高阶函数的泛型推断改进

```typescript
const double = <T extends number>(fn: (x: T) => T) => (x: T) => fn(fn(x));

const addTen = (x: number) => x + 10;
const addTwenty = double(addTen); // TypeScript 5.9: (x: number) => number ✅
```

---

## 3. TypeScript 6.0 (2026年3月)

### 3.1 `es2025` target 和 lib 支持

```json
{
  "compilerOptions": {
    "target": "es2025",
    "lib": ["es2025"]
  }
}
```

支持 ES2025 的新特性：Iterator Helpers、Set Methods、Promise.try、Float16Array、RegExp 增强等。

### 3.2 显式资源管理（`using` 声明）

```typescript
// 需要配置: "target": "es2025" 或更高
{
  using file = await openFile("data.txt");
  // 文件操作...
} // 自动调用 file[Symbol.dispose]()

// 异步资源
{
  await using conn = await createConnection();
  // 数据库操作...
} // 自动调用 conn[Symbol.asyncDispose]()
```

### 3.3 装饰器元数据（Decorator Metadata）

Stage 3 装饰器现在支持元数据附着：

```typescript
// 需要启用 experimentalDecorators 和 emitDecoratorMetadata
@metadata("controller")
class UserController {
  @metadata("route", "/users")
  getUsers() {}
}

// 框架可在运行时访问类型信息
// 用于依赖注入、验证、序列化等
```

### 3.4 上下文敏感函数推断改进

TypeScript 6.0 改进了对 `this`-less 上下文敏感函数的推断：

```typescript
function callFunc<T>(callback: (x: T) => void, value: T) {
  return callback(value);
}

// 以前：箭头函数工作正常
callFunc(x => x.toFixed(), 42); // ✅ T = number

// 以前：方法语法有问题
callFunc({
  consume(y) { return y.toFixed(); },  // ❌ y: unknown
  produce(x: number) { return x * 2; }
});

// TypeScript 6.0：方法语法也能正确推断
```

### 3.5 性能改进

| 指标 | 改进幅度 |
|------|---------|
| 增量编译速度 | 40-60% |
| 内存占用 | -25% |
| 语言服务响应 | +30% |

---

## 4. 迁移指南

### 4.1 从 TypeScript 5.7 迁移到 5.8

```bash
npm install typescript@5.8 --save-dev
npx tsc --noEmit  # 检查类型错误
```

### 4.2 推荐的 tsconfig.json（2026）

```json
{
  "compilerOptions": {
    "target": "es2025",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "strict": true,
    "strictInference": true,
    "verbatimModuleSyntax": true,
    "isolatedModules": true,
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "erasableSyntaxOnly": false,
    "lib": ["es2025", "dom"]
  }
}
```

### 4.3 Breaking Changes

| 版本 | Breaking Change | 解决方案 |
|------|----------------|---------|
| 5.8 | `moduleResolution: "node"` 弃用 | 改用 `"bundler"` 或 `"node16"` |
| 5.9 | 泛型约束推断更严格 | 添加显式类型参数 |
| 5.9 | 部分实用类型移除 | 使用现代替代方案 |
| 6.0 | `suppressExcessPropertyErrors` 弃用 | 使用更细粒度控制 |

---

**参考资源**：
- [TypeScript 5.8 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-5-8/)
- [TypeScript 6.0 Release Notes](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/)
- [Node.js TypeScript Support](https://nodejs.org/api/typescript.html)
