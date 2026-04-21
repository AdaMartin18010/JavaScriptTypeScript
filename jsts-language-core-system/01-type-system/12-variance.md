# 变型（Variance）

> 协变、逆变、双变与抗变：类型兼容性的数学基础
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 变型的定义

给定类型构造器 `F<T>`，如果 `A <: B`（A 是 B 的子类型），那么 `F<A>` 与 `F<B>` 的关系定义了变型：

| 变型 | 关系 | 符号 | 示例 |
|------|------|------|------|
| **协变（Covariant）** | `F<A> <: F<B>` | + | 返回值位置、只读属性 |
| **逆变（Contravariant）** | `F<B> <: F<A>` | - | 参数位置（strictFunctionTypes） |
| **双变（Bivariant）** | `F<A> <: F<B>` 且 `F<B> <: F<A>` | ± | 方法参数（默认） |
| **抗变（Invariant）** | 互不兼容 | 0 | 数组（写时）、可变属性 |

---

## 2. 协变（Covariance）

返回值位置是协变的：

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  bark(): void;
}

// 返回值协变
let getAnimal: () => Animal = () => ({ name: "animal" });
let getDog: () => Dog = () => ({ name: "Buddy", bark() {} });

getAnimal = getDog; // ✅ Dog 是 Animal 的子类型，() => Dog <: () => Animal
// getDog = getAnimal; // ❌ Animal 缺少 bark
```

### 2.1 只读属性协变

```typescript
interface Container<T> {
  readonly value: T;
}

let animalContainer: Container<Animal> = { value: { name: "animal" } };
let dogContainer: Container<Dog> = { value: { name: "Buddy", bark() {} } };

animalContainer = dogContainer; // ✅ 只读属性协变
```

---

## 3. 逆变（Contravariance）

参数位置是逆变的（`strictFunctionTypes` 开启时）：

```typescript
// 参数逆变
let handleAnimal: (animal: Animal) => void = (a) => console.log(a.name);
let handleDog: (dog: Dog) => void = (d) => d.bark();

handleDog = handleAnimal; // ✅ (Animal) => void <: (Dog) => void
// handleAnimal = handleDog; // ❌ 可能调用 bark 但传入 Animal
```

**直觉解释**：能接受 Animal 的函数，一定能接受 Dog（因为 Dog 是 Animal）。反之不成立。

---

## 4. 双变（Bivariance）

方法参数默认是双变的（兼容性原因）：

```typescript
interface Comparator<T> {
  compare(a: T, b: T): number; // 方法参数双变
}

let animalComparator: Comparator<Animal> = {
  compare(a, b) { return a.name.localeCompare(b.name); }
};

let dogComparator: Comparator<Dog> = {
  compare(a, b) { return a.name.localeCompare(b.name); }
};

animalComparator = dogComparator; // ✅ 双向兼容
```

**配置严格检查**：

```json
{
  "compilerOptions": {
    "strictFunctionTypes": true // 方法参数变为逆变
  }
}
```

---

## 5. 抗变（Invariance）

数组是抗变的：

```typescript
let animals: Animal[] = [];
let dogs: Dog[] = [];

animals = dogs; // ✅ TypeScript 允许（协变），但运行时不安全
animals.push({ name: "Cat" }); // 运行时：dogs 数组中有了非 Dog！
```

**TypeScript 的设计权衡**：允许数组协变是为了方便使用，但可能导致运行时错误。

---

## 6. 实战影响

### 6.1 事件处理器

```typescript
// 逆变确保类型安全
interface EventHandler<E> {
  (event: E): void;
}

type MouseHandler = EventHandler<MouseEvent>;
type UIHandler = EventHandler<UIEvent>;

const mouseHandler: MouseHandler = (e) => console.log(e.clientX);
const uiHandler: UIHandler = (e) => console.log(e.type);

// UIEvent 是 MouseEvent 的父类型
// 所以 MouseEvent handler 可以赋值给 UIEvent handler
const handler: UIHandler = mouseHandler; // ✅ 逆变
```

### 6.2 回调类型设计

```typescript
// ❌ 使用 interface 方法声明（双变）
interface Processor {
  process(data: string): void;
}

// ✅ 使用函数属性声明（逆变，strictFunctionTypes）
interface Processor {
  process: (data: string) => void;
}
```

---

**参考规范**：TypeScript Handbook: Type Compatibility | TypeScript Spec §3.11
