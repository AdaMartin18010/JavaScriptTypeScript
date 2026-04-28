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

---

## 参考

- TypeScript Compiler Options
- [TypeScript Emit Helpers](https://www.typescriptlang.org/docs/handbook/namespaces.html)
