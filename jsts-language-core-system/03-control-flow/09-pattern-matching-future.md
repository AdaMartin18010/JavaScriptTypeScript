# 模式匹配（未来方向）

> ECMAScript 提案 Stage 1+ 的模式匹配语法预览
>
> 对齐版本：TC39 提案 | ECMAScript 未来方向

---

## 1. 当前替代方案

JavaScript 目前没有原生模式匹配，使用 switch/if/对象映射：

```javascript
// switch 语句
function handleAction(action) {
  switch (action.type) {
    case "CREATE_USER":
      return createUser(action.payload);
    case "DELETE_USER":
      return deleteUser(action.payload.id);
    default:
      return state;
  }
}

// 对象映射
const handlers = {
  CREATE_USER: (payload) => createUser(payload),
  DELETE_USER: (payload) => deleteUser(payload.id)
};

function handleAction(action) {
  return handlers[action.type]?.(action.payload) ?? state;
}
```

---

## 2. TC39 模式匹配提案

提案引入了 `match` 表达式：

```javascript
const result = match (response) {
  when { status: 200, data: let users } -> users,
  when { status: let s } if s >= 500 -> throw new Error("Server error"),
  when { status: 404 } -> [],
  default -> throw new Error("Unknown response")
};
```

### 2.1 解构匹配

```javascript
const area = match (shape) {
  when { type: "circle", radius: let r } -> Math.PI * r ** 2,
  when { type: "rect", width: let w, height: let h } -> w * h,
  when { type: "triangle", base: let b, height: let h } -> 0.5 * b * h,
  default -> 0
};
```

### 2.2 数组匹配

```javascript
const head = match (arr) {
  when [let first, ...let rest] -> first,
  when [] -> null,
  default -> null
};
```

### 2.3 嵌套匹配

```javascript
const result = match (user) {
  when {
    address: {
      country: "USA",
      zipcode: let zip
    }
  } -> `US-${zip}`,
  when { address: { country: let c } } -> c,
  default -> "Unknown"
};
```

---

## 3. 与 TypeScript 的协同

```typescript
// 类型收窄
function handleEvent(event: MouseEvent | KeyboardEvent | TouchEvent) {
  return match (event) {
    when { type: "click", clientX: let x, clientY: let y } -> { x, y },
    when { type: "keydown", key: let k } -> { key: k },
    when { type: "touchstart", touches: let t } -> { count: t.length },
    default -> null
  };
}
```

---

## 4. 当前可用方案

### 4.1 TypeScript 可辨识联合

```typescript
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rect"; width: number; height: number }
  | { kind: "triangle"; base: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle": return Math.PI * shape.radius ** 2;
    case "rect": return shape.width * shape.height;
    case "triangle": return 0.5 * shape.base * shape.height;
  }
}
```

### 4.2 ts-pattern 库

```typescript
import { match, P } from "ts-pattern";

const result = match(user)
  .with({ role: "admin" }, (u) => `Admin: ${u.name}`)
  .with({ role: "user", verified: true }, (u) => `Verified: ${u.name}`)
  .with({ role: "user" }, (u) => `User: ${u.name}`)
  .otherwise(() => "Guest");
```

---

## 5. 与其他语言的对比

| 语言 | 语法 | 状态 |
|------|------|------|
| Rust | `match x { Some(v) => ..., None => ... }` | 原生支持 |
| Haskell | `case x of { Just v -> ...; Nothing -> ... }` | 原生支持 |
| Python | `match x: case [a, b]: ...` | 3.10+ |
| Elixir | `case x do {a, b} -> ... end` | 原生支持 |
| JavaScript | 提案中 | TC39 Stage 1 |

---

## 6. 提案状态

| 阶段 | 状态 | 预计 |
|------|------|------|
| Stage 0 | 完成 | - |
| Stage 1 | 完成 | - |
| Stage 2 | 进行中 | - |
| Stage 3 | - | 2026+ |
| Stage 4 | - | 2027+ |

---

**参考规范**：TC39 Proposal: Pattern Matching | TypeScript Handbook: Narrowing

## 扩展话题：相关规范与实现细节

### 规范引用

ECMA-262 规范详细定义了本节所有机制。关键章节包括：
- §6.2.3 Completion Record 规范
- §9.1 Environment Records
- §9.4 Execution Contexts
- §10.2.1.1 OrdinaryCallBindThis

### 引擎实现差异

| 引擎 | 相关实现 |
|------|---------|
| V8 (Chrome/Node) | 快速属性访问、隐藏类优化 |
| SpiderMonkey (Firefox) | 形状(shape)系统、基线编译器 |
| JavaScriptCore (Safari) | DFG/FTL 编译器、类型推断 |

### 调试技巧

`javascript
// 使用 Chrome DevTools 检查内部状态
debugger; // 在 Sources 面板查看 Scope 链

// 使用 console.trace() 查看调用栈
function deep() {
  console.trace("Current stack");
}
`

### 常见面试题

1. 解释暂时性死区(TDZ)及其产生原因
2. var/let/const 的区别是什么？
3. 函数声明和函数表达式的提升行为有何不同？
4. 解释 this 的四种绑定规则
5. 什么是闭包？它如何工作？

### 推荐阅读

- ECMA-262 规范官方文档
- TypeScript Handbook
- You Don't Know JS (Kyle Simpson)
- JavaScript: The Definitive Guide

## 深入理解：内存模型与性能

### 内存布局

JavaScript 引擎在内存中组织对象和变量：

`
栈内存（Stack）：
  - 原始值（number, string, boolean等）
  - 函数调用帧
  - 局部变量引用

堆内存（Heap）：
  - 对象
  - 函数闭包
  - 大型数据结构
`

### V8 优化技术

| 技术 | 描述 |
|------|------|
| 隐藏类 | 为对象创建内部形状描述 |
| 内联缓存 | 缓存属性查找位置 |
| 标量替换 | 将小对象分解为局部变量 |
| 逃逸分析 | 确定对象是否离开作用域 |

### 性能基准

`javascript
// 快速属性访问（单态）
obj.x; // 优化：直接偏移访问

// 多态属性访问
if (condition) obj = { x: 1 }; else obj = { x: 2, y: 3 };
obj.x; // 降级：字典查找
`

### 垃圾回收影响

`javascript
// 减少 GC 压力
function process() {
  const data = new Array(1000000);
  // 使用 data...
  // 函数返回后，data 可被回收
}

// 避免内存泄漏
let cache = {};
// 定期清理或使用 WeakMap
`

### 最佳实践总结

1. **优先使用 const**：不可变性帮助引擎优化
2. **避免动态属性**：稳定结构利于隐藏类
3. **减少嵌套深度**：浅层作用域链查找更快
4. **使用箭头函数**：减少 this 绑定开销
5. **缓存频繁访问**：将深层属性提取到局部变量
