# 结构类型 vs 名义类型

> TypeScript 的结构类型系统与名义类型的对比
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 结构类型（Structural Typing）

TypeScript 使用**结构类型**：类型兼容基于成员结构，而非显式声明：

```typescript
interface Point { x: number; y: number; }

function distance(p: Point) {
  return Math.sqrt(p.x ** 2 + p.y ** 2);
}

const point = { x: 3, y: 4, color: "red" };
distance(point); // ✅ 兼容（有 x 和 y）
```

---

## 2. 名义类型（Nominal Typing）

Java、C# 等使用**名义类型**：类型兼容基于显式声明：

```java
// Java（名义类型）
class Point { int x, y; }
class Vector { int x, y; }

void process(Point p) { ... }

process(new Vector()); // ❌ 编译错误：Vector 不是 Point
```

---

## 3. 在 TypeScript 中模拟名义类型

### 3.1 品牌类型（Branded Types）

```typescript
type UserId = string & { __brand: "UserId" };
type OrderId = string & { __brand: "OrderId" };

function getUser(id: UserId) { ... }

const userId = "123" as UserId;
const orderId = "123" as OrderId;

getUser(userId);   // ✅
getUser(orderId);  // ❌ Type 'OrderId' is not assignable to type 'UserId'
```

### 3.2 私有字段 + 类

```typescript
class UserId {
  private __brand!: void;
  constructor(public value: string) {}
}

class OrderId {
  private __brand!: void;
  constructor(public value: string) {}
}
```

### 3.3 Symbol 名义类型

```typescript
declare const UserIdSymbol: unique symbol;
type UserId = string & { [UserIdSymbol]: true };
```

---

## 4. 结构类型的优势与风险

| 方面 | 优势 | 风险 |
|------|------|------|
| 灵活性 | 鸭子类型，无需显式继承 | 意外兼容 |
| 测试 | 易于模拟（mock） | 类型可能过于宽松 |
| 重构 | 修改接口不影响现有实现 | 缺少显式契约 |

---

## 5. 何时需要名义类型

```typescript
// 场景：不同域的相同结构
type Meters = number & { __unit: "meters" };
type Seconds = number & { __unit: "seconds" };

function travel(distance: Meters, time: Seconds) { ... }

travel(100 as Meters, 10 as Seconds); // ✅
travel(10 as Seconds, 100 as Meters); // ❌ 编译错误
```

---

## 6. 结构类型的边界情况

### 6.1 多余属性检查

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}

function createSquare(config: SquareConfig) { /* ... */ }

// ❌ 对象字面量触发多余属性检查
createSquare({ colour: "red", width: 100 }); // 错误

// ✅ 变量不触发
createSquare({ colour: "red", width: 100 } as SquareConfig); // 通过
```

### 6.2 函数参数双变检查

```typescript
let f1 = (x: Animal) => void;
let f2 = (x: Dog) => void;

f1 = f2; // ❌ 错误：参数是逆变的
```

---

## 7. 实战选择指南

| 场景 | 推荐方案 |
|------|---------|
| 普通数据结构 | 结构类型（默认） |
| ID/标识符 | 品牌类型 |
| 物理单位 | 品牌类型 |
| 跨域类型 | 显式转换函数 |
| 库 API | 接口（结构） |

---

**参考规范**：TypeScript Handbook: Type Compatibility

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
