# Runtime-Impacting TS 特性

> 模块编号: 07-js-ts-symmetric-difference/03
> 复杂度: ⭐⭐⭐⭐ (高级)
> 目标读者: 编译器使用者、性能工程师

---

## 核心命题

大多数 TypeScript 特性在编译后**完全擦除**，但以下特性会**生成额外的 JavaScript 代码**，对运行时产生真实影响。

---

## 1. enum

### 编译前

```typescript
enum Direction {
  Up,
  Down,
  Left,
  Right,
}
```

### 编译后

```javascript
var Direction;
(function (Direction) {
  Direction[Direction["Up"] = 0] = "Up";
  Direction[Direction["Down"] = 1] = "Down";
  Direction[Direction["Left"] = 2] = "Left";
  Direction[Direction["Right"] = 3] = "Right";
})(Direction || (Direction = {}));
```

### 运行时影响

- 生成双向映射对象：`Direction.Up === 0` 且 `Direction[0] === "Up"`
- 增加包体积（每个 enum 约 +10 行）
- IIFE 包装可能干扰 tree-shaking

### 零运行时替代：`const enum`

```typescript
const enum Direction {
  Up = 0,
  Down = 1,
}
```

编译后：直接内联为字面量 `0` 和 `1`，**零运行时开销**。

---

## 2. namespace / module

### 编译前

```typescript
namespace Validation {
  export function isEmail(s: string): boolean {
    return s.includes('@');
  }
}
```

### 编译后

```javascript
var Validation;
(function (Validation) {
  function isEmail(s) {
    return s.includes('@');
  }
  Validation.isEmail = isEmail;
})(Validation || (Validation = {}));
```

### 运行时影响

- 生成 IIFE 和对象赋值
- 污染模块作用域
- 与现代 ES Module 冲突

---

## 3. Parameter Properties

### 编译前

```typescript
class Point {
  constructor(
    public x: number,
    public y: number,
    private z: number
  ) {}
}
```

### 编译后

```javascript
class Point {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}
```

### 运行时影响

- 在构造函数内生成 `this.x = x` 赋值
- `private` 修饰符运行时消失（`this.z` 仍然可访问）

---

## 4. Decorators (Stage 3)

### 编译前

```typescript
class Calculator {
  @logged
  add(a: number, b: number): number {
    return a + b;
  }
}
```

### 编译后

```javascript
let Calculator = class Calculator {
  add(a, b) {
    return a + b;
  }
};
__decorate([
  logged
], Calculator.prototype, "add", 1);
```

### 运行时影响

- 生成 `__decorate` 辅助函数调用
- 需要 tslib 或内联辅助函数
- 增加包体积

---

## 5. emitDecoratorMetadata

当 `tsconfig.json` 中 `emitDecoratorMetadata: true` 时：

```typescript
class Service {
  @Inject
  repository: UserRepository;
}
```

编译后额外生成：

```javascript
__metadata("design:type", UserRepository),
__metadata("design:paramtypes", []),
__metadata("design:returntype", void 0)
```

### 运行时影响

- 注入 `Reflect.metadata` 调用
- 依赖 `reflect-metadata` polyfill
- 显著增加包体积

---

## 6. Class Fields 编译差异

TS 的 class fields 编译行为取决于 `useDefineForClassFields`：

| 配置 | 编译后 | 运行时语义 |
|------|--------|-----------|
| `true` (ES2022) | `Object.defineProperty(this, "x", { value: 10 })` | 不可枚举 |
| `false` (旧 TS) | `this.x = 10` | 可枚举 |

这可能导致**运行时行为差异**！

---

## 7. Legacy 模块语法

### `import = require()`

```typescript
import fs = require('fs');
```

编译后：

```javascript
const fs = require('fs');
```

### `export =`

```typescript
export = MyModule;
```

编译后：

```javascript
module.exports = MyModule;
```

---

## 8. JSX

```tsx
const element = <div className="app">Hello</div>;
```

编译后：

```javascript
const element = React.createElement("div", { className: "app" }, "Hello");
```

---

## 9. using / await using

```typescript
using file = openFile('data.txt');
```

编译后：

```javascript
const file = openFile('data.txt');
try {
  // ...
} finally {
  file[Symbol.dispose]();
}
```

---

## 10. `importHelpers` 与 `tslib`

当 `tsconfig.json` 中 `"importHelpers": true` 时，TypeScript 会将辅助函数（如 `__decorate`、`__extends`、`__assign`）集中到 `tslib` 包中引用，而非在每个文件内联：

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "importHelpers": true
  }
}
```

```javascript
// 编译后（有 importHelpers）
import { __decorate } from "tslib";

// 编译后（无 importHelpers，默认）
var __decorate = function(decorators, target, key, desc) { ... };
```

**运行时影响**：
- 减少重复辅助函数代码，节省 bundle 体积（大型项目可节省 5-10%）
- 引入外部依赖 `tslib`，需确保安装

---

## 11. `downlevelIteration` 与生成器降级

当 `target` 低于 `ES2015` 或 `downlevelIteration: true` 时，TypeScript 会注入迭代协议兼容代码：

```typescript
// 编译前
function* idMaker() {
  let index = 0;
  while (true) yield index++;
}

const ids = [...idMaker()];
```

```javascript
// 编译后（downlevelIteration: true, target: ES5）
var __generator = (this && this.__generator) || function (thisArg, body) { ... };
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) { ... };

function idMaker() {
  var index;
  return __generator(this, function (_a) {
    switch (_a.label) {
      case 0:
        index = 0;
        _a.label = 1;
      case 1:
        if (!true) return [3 /*break*/, 3];
        return [4 /*yield*/, index++];
      case 2:
        _a.sent();
        return [3 /*break*/, 1];
      case 3: return [2 /*return*/];
    }
  });
}

var ids = __spreadArray([], idMaker(), true);
```

**运行时影响**：
- 生成大量状态机代码（`__generator`）模拟原生生成器
- `for...of` 循环展开为 `try...catch` + 迭代器协议调用
- 显著增加包体积和执行开销
- **建议**：现代运行环境（Node.js 18+）直接设置 `target: ES2022` 避免降级

---

## 完整对照表

| 特性 | 运行时残留 | 可消除？ | 消除方法 |
|------|-----------|---------|---------|
| `enum` | 对象 + 反向映射 | ✅ | `const enum` |
| `namespace` | IIFE | ✅ | ES Module |
| parameter properties | `this.x = x` | ❌ | 手写赋值 |
| decorators | `__decorate` | ❌ | 不用装饰器 |
| emitDecoratorMetadata | `Reflect.metadata` | ✅ | 关闭配置 |
| class fields | defineProperty/赋值 | ❌ | 统一配置 |
| `import =` | `require()` | ✅ | 标准 ESM |
| `export =` | `module.exports` | ✅ | 标准 ESM |
| JSX | `createElement` | ❌ | 预编译框架 |
| `using` | try/finally | ❌ | 手写 |
| `importHelpers` | `tslib` 辅助函数导入 | ✅ | 关闭配置 |
| `downlevelIteration` | `__generator` / `__spreadArray` 状态机 | ✅ | `target: ES2022` |

---

## 参考

- [TypeScript Compiler Options — `importHelpers`](https://www.typescriptlang.org/tsconfig#importHelpers) — 辅助函数导入配置
- [TypeScript Compiler Options — `downlevelIteration`](https://www.typescriptlang.org/tsconfig#downlevelIteration) — 迭代降级配置
- [TypeScript Compiler Options — `useDefineForClassFields`](https://www.typescriptlang.org/tsconfig#useDefineForClassFields) — 类字段定义语义配置
- [TypeScript Compiler Options — `jsx`](https://www.typescriptlang.org/tsconfig#jsx) — JSX 转换模式配置
- [TypeScript Emit Helpers (`tslib`)](https://github.com/microsoft/tslib) — 官方辅助函数库
- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators) — ECMAScript 装饰器 Stage 3 提案
- [TypeScript Handbook: Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) — namespace 编译行为详解
- [TypeScript Handbook: Enums](https://www.typescriptlang.org/docs/handbook/enums.html) — enum 编译行为与最佳实践
- [TypeScript Handbook: JSX](https://www.typescriptlang.org/docs/handbook/jsx.html) — JSX 转换模式说明
- [ECMAScript Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) — `using` / `await using` TC39 提案

---

## 进阶代码示例

### `const enum` 与 `enum` 包体积对比

```typescript
// ❌ 生成双向映射对象，增加包体积
enum Status { Active = 1, Inactive = 0 }

// ✅ const enum 完全内联，零运行时开销
const enum Priority { Low = 1, Medium = 2, High = 3 }

function getLabel(p: Priority) {
  return p === Priority.High ? 'urgent' : 'normal';
}
// 编译后：function getLabel(p) { return p === 3 ? 'urgent' : 'normal'; }
```

### Decorators + `emitDecoratorMetadata` 完整示例

```typescript
import 'reflect-metadata';

const Injectable = (): ClassDecorator => (target) => {
  Reflect.defineMetadata('design:injectable', true, target);
  return target;
};

const Inject = (token: string): ParameterDecorator => (target, key, index) => {
  const existing = Reflect.getMetadata('design:paramtypes', target, key) || [];
  existing[index] = token;
  Reflect.defineMetadata('design:paramtypes', existing, target, key);
};

@Injectable()
class Database {
  query() { return [{ id: 1 }]; }
}

@Injectable()
class UserService {
  constructor(@Inject('DB') private db: Database) {}
  findAll() { return this.db.query(); }
}

// 编译后包含 __metadata 调用，依赖 reflect-metadata polyfill
```

### `using` 与 `Symbol.dispose` 实践

```typescript
// 定义可释放资源
class TempFile implements Disposable {
  #path: string;
  constructor(name: string) {
    this.#path = `/tmp/${name}`;
    console.log('Created', this.#path);
  }
  [Symbol.dispose]() {
    console.log('Disposed', this.#path);
  }
}

function processData() {
  using file = new TempFile('data.txt');
  // file 在此处自动释放，即使抛出异常
  if (Math.random() > 0.5) throw new Error('Oops');
  return 42;
}
```

### `downlevelIteration` 对 `for...of` 的影响演示

```typescript
// target: ES5 + downlevelIteration: true
const set = new Set([1, 2, 3]);
for (const item of set) {
  console.log(item);
}
// 编译后生成 try/catch + 迭代器协议调用，增加 ~20 行代码
```

---

## 扩展参考链接

- [TypeScript Handbook — Enums](https://www.typescriptlang.org/docs/handbook/enums.html) — enum 编译行为与最佳实践
- [TypeScript Handbook — Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) — 装饰器官方文档
- [TypeScript Handbook — Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) — namespace 编译行为详解
- [TypeScript Handbook — JSX](https://www.typescriptlang.org/docs/handbook/jsx.html) — JSX 转换模式说明
- [TC39 Decorators Proposal](https://github.com/tc39/proposal-decorators) — ECMAScript 装饰器 Stage 3 提案
- [ECMAScript Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management) — `using` / `await using` TC39 提案
- [TypeScript Compiler Options — `importHelpers`](https://www.typescriptlang.org/tsconfig#importHelpers) — 辅助函数导入配置
- [TypeScript Compiler Options — `downlevelIteration`](https://www.typescriptlang.org/tsconfig#downlevelIteration) — 迭代降级配置
- [tslib GitHub Repository](https://github.com/microsoft/tslib) — 官方辅助函数库
- [TypeScript Compiler Options — `useDefineForClassFields`](https://www.typescriptlang.org/tsconfig#useDefineForClassFields) — 类字段定义语义配置
