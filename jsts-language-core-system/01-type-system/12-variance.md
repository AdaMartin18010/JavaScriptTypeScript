# 型变（Variance）

> 协变、逆变、双变与不变：泛型子类型关系的深度解析
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 型变基础

型变描述**复合类型**如何随其**组成类型**的子类型关系而变化：

```typescript
// 假设 Dog extends Animal

// 协变（Covariant）：复合类型同向变化
let animals: Animal[] = [];
let dogs: Dog[] = [];
animals = dogs; // ✅ Dog[] 是 Animal[] 的子类型

// 逆变（Contravariant）：复合类型反向变化
let animalFn: (a: Animal) => void;
let dogFn: (d: Dog) => void;
animalFn = dogFn; // ❌ 不兼容
```

---

## 2. 四种型变

| 型变 | 方向 | TypeScript 示例 |
|------|------|----------------|
| 协变 | 同向 | 数组 `T[]`、Promise `Promise<T>` |
| 逆变 | 反向 | 函数参数 `(arg: T) => void` |
| 双变 | 双向 | 旧版函数参数（`strictFunctionTypes: false`） |
| 不变 | 无关 | 对象属性、`in`/`out` 显式标注 |

---

## 3. 协变（Covariance）

```typescript
interface Animal { name: string; }
interface Dog extends Animal { breed: string; }

// 数组是协变的
const dogs: Dog[] = [{ name: "Rex", breed: "Labrador" }];
const animals: Animal[] = dogs; // ✅

// 对象属性是协变的
interface Container<T> {
  value: T;
}

const dogContainer: Container<Dog> = { value: { name: "Rex", breed: "Lab" } };
const animalContainer: Container<Animal> = dogContainer; // ✅
```

---

## 4. 逆变（Contravariance）

```typescript
// 函数参数是逆变的
type Handler<T> = (item: T) => void;

const animalHandler: Handler<Animal> = (animal) => {
  console.log(animal.name);
};

const dogHandler: Handler<Dog> = animalHandler; // ✅
// 因为 dogHandler 接收 Dog，可以安全传入 Animal 的处理函数
//（Animal 的处理函数只使用 name，而 Dog 也有 name）
```

### 4.1 为什么参数是逆变的

```typescript
// 如果参数是协变的（不安全）：
const handleDog: (d: Dog) => void = (dog) => {
  console.log(dog.breed); // 需要 breed
};

const handleAnimal: (a: Animal) => void = handleDog;
// 如果允许：传入 Animal（没有 breed）会崩溃
handleAnimal({ name: "Cat" }); // ❌ 运行时错误
```

---

## 5. TypeScript 的型变控制

### 5.1 显式标注（TS 4.7+）

```typescript
// out = 协变
interface Producer<out T> {
  produce(): T;
}

// in = 逆变
interface Consumer<in T> {
  consume(item: T): void;
}

// in out = 不变
interface Storage<in out T> {
  get(): T;
  set(value: T): void;
}
```

### 5.2 strictFunctionTypes

```json
{
  "compilerOptions": {
    "strictFunctionTypes": true  // 函数参数逆变（推荐）
  }
}
```

```typescript
// strictFunctionTypes: true
let f1: (x: Animal) => void;
let f2: (x: Dog) => void;
f1 = f2; // ❌ 错误（安全）

// strictFunctionTypes: false（旧行为）
f1 = f2; // ✅ 允许（不安全）
```

---

## 6. 型变的实际影响

### 6.1 事件处理

```typescript
// 事件类型层次
interface Event { type: string; }
interface MouseEvent extends Event { x: number; y: number; }

// 处理器类型
type EventHandler<E extends Event> = (event: E) => void;

// 逆变允许更通用的处理器
const handleEvent: EventHandler<Event> = (e) => {
  console.log(e.type);
};

const handleMouse: EventHandler<MouseEvent> = handleEvent; // ✅
```

### 6.2 Promise 和 Array

```typescript
// Promise 是协变的
const dogPromise: Promise<Dog> = Promise.resolve({ name: "Rex", breed: "Lab" });
const animalPromise: Promise<Animal> = dogPromise; // ✅

// Array 是协变的
const dogs: Dog[] = [];
const animals: Animal[] = dogs; // ✅
```

---

## 7. 型变检查工具

```typescript
// 测试型变方向
type TestCovariance<T, U> = T extends U ? true : false;

// 数组协变检查
type ArrayCovariant = Dog[] extends Animal[] ? true : false; // true

// 函数参数逆变检查
type FnContravariant = ((x: Animal) => void) extends ((x: Dog) => void) ? true : false; // true
```

---

**参考规范**：TypeScript Handbook: Type Compatibility | TypeScript 4.7 Release Notes: Variance Annotations

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
