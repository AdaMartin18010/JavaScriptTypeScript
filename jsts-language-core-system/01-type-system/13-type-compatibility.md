# 类型兼容性

> 结构子类型的比较规则：协变、逆变、双变与抗变
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 子类型关系

```typescript
interface Animal {
  name: string;
}

interface Dog extends Animal {
  breed: string;
}

let animal: Animal;
let dog: Dog = { name: "Buddy", breed: "Golden" };

animal = dog; // ✅ Dog 是 Animal 的子类型
```

---

## 2. 变型（Variance）

### 2.1 协变（Covariance）

返回值位置是协变的：

```typescript
let f1: () => Dog = () => ({ name: "Buddy", breed: "Golden" });
let f2: () => Animal = f1; // ✅ 协变
```

### 2.2 逆变（Contravariance）

参数位置是逆变的（`strictFunctionTypes` 开启时）：

```typescript
let f1: (animal: Animal) => void = (a) => console.log(a.name);
let f2: (dog: Dog) => void = f1; // ✅ 逆变

// 反向不允许
let f3: (dog: Dog) => void = (d) => console.log(d.breed);
let f4: (animal: Animal) => void = f3; // ❌ 可能访问 breed 属性
```

### 2.3 双变（Bivariance）

方法参数默认是双变的（兼容性原因）：

```typescript
interface Comparator<T> {
  compare(a: T, b: T): number; // 方法参数是双变的
}
```

### 2.4 抗变（Invariance）

数组是抗变的：

```typescript
let dogs: Dog[] = [];
let animals: Animal[] = dogs; // ✅ 协变（TS 允许，但运行时危险）

animals.push({ name: "Cat" }); // 运行时：dogs 数组中有了非 Dog
```

---

## 3. 类型断言

```typescript
const el = document.getElementById("root") as HTMLDivElement;
const input = <HTMLInputElement>document.getElementById("input"); // JSX 中不可用
```

---

**参考规范**：TypeScript Handbook: Type Compatibility | TypeScript Spec §3.11 Assignment Compatibility
