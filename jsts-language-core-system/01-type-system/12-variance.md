# 变型（协变 / 逆变 / 双变 / 不变）

> 子类型关系在类型参数位置上的行为规则
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 形式化定义

### 1.1 协变（Covariance）

如果 `Cat` 是 `Animal` 的子类型，那么 `Producer<Cat>` 是 `Producer<Animal>` 的子类型：

```typescript
interface Animal { name: string; }
interface Cat extends Animal { meow(): void; }

type Producer<T> = () => T;

const catProducer: Producer<Cat> = () => ({ name: "Whiskers", meow: () => {} });
const animalProducer: Producer<Animal> = catProducer; // ✅ 协变
```

### 1.2 逆变（Contravariance）

如果 `Cat` 是 `Animal` 的子类型，那么 `Consumer<Animal>` 是 `Consumer<Cat>` 的子类型：

```typescript
type Consumer<T> = (item: T) => void;

const animalConsumer: Consumer<Animal> = (a) => console.log(a.name);
const catConsumer: Consumer<Cat> = animalConsumer; // ✅ 逆变
```

### 1.3 双变（Bivariance）

既是协变又是逆变。TypeScript 在**方法参数**中默认使用双变（兼容性问题）：

```typescript
interface Comparator<T> {
  compare(a: T, b: T): number; // 方法参数默认双变
}
```

### 1.4 不变（Invariance）

既不是协变也不是逆变，必须完全匹配：

```typescript
type Box<T> = { value: T };
// Box<Cat> 既不是 Box<Animal> 的子类型，也不是父类型（在严格模式下）
```

---

## 2. 各位置的变型规则

| 位置 | 变型 | 示例 |
|------|------|------|
| 返回值 | 协变 | `() => T` |
| 函数参数 | 逆变 | `(x: T) => void` |
| 属性读取 | 协变 | `{ readonly x: T }` |
| 属性写入 | 逆变 | `{ x: T }`（可变属性）|
| 数组元素 | 协变 | `T[]`（不严格时） |

---

## 3. TypeScript 的变型检查

### 3.1 `--strictFunctionTypes`

启用后，函数类型的参数变为**逆变**：

```typescript
// strictFunctionTypes: true
type Fn = (x: Animal) => void;
const fn: Fn = (x: Cat) => {}; // ❌ 参数逆变：不能将 (Cat) => void 赋给 (Animal) => void
```

### 3.2 `out` / `in` 显式注解（TS 4.7+）

```typescript
type Producer<out T> = () => T;     // 显式标记协变
type Consumer<in T> = (x: T) => void; // 显式标记逆变
```

---

## 4. 实战影响

### 4.1 Event Handler 类型设计

```typescript
// 错误的协变数组
type ClickHandler = (e: MouseEvent) => void;
type handlers: ClickHandler[] = [];

// 由于数组协变，以下赋值在 strictFunctionTypes 关闭时允许
const generalHandlers: ((e: Event) => void)[] = handlers; // 危险！
```

---

## 5. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 方法参数双变 | TS 默认方法参数双变，允许不安全赋值 | 启用 `--strictFunctionTypes` |
| 数组协变 | `T[]` 在写入时不安全 | 使用 `readonly T[]` 或 `ReadonlyArray<T>` |

---

**参考规范**：TypeScript Handbook: Type Compatibility | ECMA-262 §6.2.10 The Completion Record Specification Type
