# 索引访问类型

> 通过键类型提取子类型与嵌套类型导航
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 基本索引访问

```typescript
interface Person {
  name: string;
  age: number;
  address: {
    city: string;
    zip: number;
  };
}

type Name = Person["name"];     // string
type Age = Person["age"];       // number
type City = Person["address"]["city"]; // string
```

---

## 2. 联合键索引

```typescript
type PersonKeys = Person["name" | "age"]; // string | number

type Values = Person[keyof Person]; // string | number | { city: string; zip: number }
```

---

## 3. 数组/元组索引

```typescript
type StringArray = string[];
type Item = StringArray[number]; // string

type Tuple = [string, number, boolean];
type First = Tuple[0];   // string
type Second = Tuple[1];  // number
type All = Tuple[number]; // string | number | boolean
```

---

## 4. 结合条件类型

```typescript
type DeepValue<T, K extends string> = K extends `${infer F}.${infer R}`
  ? F extends keyof T
    ? DeepValue<T[F], R>
    : never
  : K extends keyof T
  ? T[K]
  : never;

// 使用
type City = DeepValue<Person, "address.city">; // string
```

---

**参考规范**：TypeScript Handbook: Indexed Access Types
