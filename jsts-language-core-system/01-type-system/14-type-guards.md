# 类型守卫（Type Guards）

> 运行时类型收窄：typeof、instanceof、in、自定义守卫与断言函数
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. typeof 守卫

```typescript
function process(value: string | number) {
  if (typeof value === "string") {
    value.toUpperCase(); // ✅ value 被收窄为 string
  } else {
    value.toFixed(2);    // ✅ value 被收窄为 number
  }
}
```

---

## 2. instanceof 守卫

```typescript
class Dog { bark() {} }
class Cat { meow() {} }

function makeSound(animal: Dog | Cat) {
  if (animal instanceof Dog) {
    animal.bark(); // ✅ animal 被收窄为 Dog
  } else {
    animal.meow(); // ✅ animal 被收窄为 Cat
  }
}
```

---

## 3. in 守卫

```typescript
type Fish = { swim: () => void };
type Bird = { fly: () => void };

function move(animal: Fish | Bird) {
  if ("swim" in animal) {
    animal.swim(); // ✅ Fish
  } else {
    animal.fly();  // ✅ Bird
  }
}
```

---

## 4. 自定义类型守卫

```typescript
function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === "string");
}

function process(value: unknown) {
  if (isStringArray(value)) {
    value.map(s => s.toUpperCase()); // ✅ value 被收窄为 string[]
  }
}
```

---

## 5. 断言函数

```typescript
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new Error("Value must be a string");
  }
}

function process(value: unknown) {
  assertIsString(value);
  value.toUpperCase(); // ✅ value 被断言为 string
}
```

---

**参考规范**：TypeScript Handbook: Narrowing | TypeScript Spec §4.24 Type Guards
