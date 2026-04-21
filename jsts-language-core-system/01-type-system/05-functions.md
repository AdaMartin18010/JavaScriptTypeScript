# 函数类型

> 函数声明、表达式、箭头函数与重载的类型系统表达
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 函数声明类型

```typescript
// 函数声明
function add(a: number, b: number): number {
  return a + b;
}

// 函数表达式
const multiply = function(a: number, b: number): number {
  return a * b;
};

// 箭头函数
const divide = (a: number, b: number): number => a / b;
```

---

## 2. 参数类型

### 2.1 可选参数

```typescript
function greet(name: string, greeting?: string): string {
  return `${greeting ?? "Hello"}, ${name}`;
}
```

### 2.2 默认参数

```typescript
function greet(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}`;
}
```

### 2.3 剩余参数

```typescript
function sum(...numbers: number[]): number {
  return numbers.reduce((a, b) => a + b, 0);
}

sum(1, 2, 3, 4); // 10
```

### 2.4 解构参数

```typescript
function printPoint({ x, y }: { x: number; y: number }): void {
  console.log(`(${x}, ${y})`);
}
```

---

## 3. 函数重载

### 3.1 重载签名与实现签名

```typescript
// 重载签名（对外可见）
function process(input: string): string;
function process(input: number): number;

// 实现签名（不对外可见）
function process(input: string | number): string | number {
  if (typeof input === "string") {
    return input.toUpperCase();
  }
  return input * 2;
}

process("hello"); // ✅ 返回 string
process(42);      // ✅ 返回 number
process(true);    // ❌ 没有接受 boolean 的重载
```

### 3.2 构造函数重载

```typescript
class MyClass {
  constructor(value: string);
  constructor(value: number);
  constructor(value: string | number) {
    // 实现
  }
}
```

---

## 4. this 类型

### 4.1 函数中的 this 参数

```typescript
function clickHandler(this: HTMLButtonElement, event: MouseEvent): void {
  console.log(this.textContent); // this 被约束为 HTMLButtonElement
}

const btn = document.querySelector("button")!;
btn.addEventListener("click", clickHandler);
```

### 4.2 类方法中的 this

```typescript
class Counter {
  count = 0;

  increment() {
    this.count++; // this: Counter
  }
}
```

---

## 5. 函数类型表达式

```typescript
type BinaryOperation = (a: number, b: number) => number;

const add: BinaryOperation = (a, b) => a + b;
```

### 5.1 调用签名（Call Signatures）

```typescript
interface Callable {
  (x: number): number;
  description: string;
}

const fn: Callable = Object.assign(
  (x: number) => x * 2,
  { description: "Doubles a number" }
);
```

### 5.2 构造签名（Construct Signatures）

```typescript
interface Constructor {
  new (name: string): Person;
}

class Person {
  constructor(public name: string) {}
}

function createPerson(ctor: Constructor, name: string): Person {
  return new ctor(name);
}
```

---

**参考规范**：TypeScript Handbook: Functions | ECMA-262 §10.2 ECMAScript Function Objects
