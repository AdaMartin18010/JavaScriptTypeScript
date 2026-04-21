# 结构化类型 vs 标称类型

> TypeScript 的结构子类型系统与名义类型的模拟技术
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 结构化子类型（Structural Subtyping）

TypeScript 使用**结构化子类型**：只要类型的结构兼容，就可以互相赋值：

```typescript
interface Point2D { x: number; y: number; }
interface Vector2D { x: number; y: number; }

const p: Point2D = { x: 1, y: 2 };
const v: Vector2D = p; // ✅ 结构兼容，尽管类型名不同
```

---

## 2. 标称类型模拟

### 2.1 品牌类型（Branded Types）

```typescript
type UserId = string & { readonly __brand: "UserId" };
type PostId = string & { readonly __brand: "PostId" };

function createUserId(id: string): UserId {
  return id as UserId;
}

function getUser(id: UserId) { /* ... */ }

getUser(createUserId("123")); // ✅
// getUser("123" as PostId);  // ❌ 类型不兼容
```

### 2.2 不透明类型（Opaque Types）

```typescript
type Opaque<K, T> = T & { readonly __opaque__: K };
type USD = Opaque<"USD", number>;
type EUR = Opaque<"EUR", number>;

const usd: USD = 100 as USD;
const eur: EUR = 100 as EUR;
// usd + eur; // ❌ 编译错误，防止货币混用
```

### 2.3 唯一符号（Unique Symbol）

```typescript
declare const userIdBrand: unique symbol;
type UserId = string & { readonly [userIdBrand]: true };
```

---

## 3. 实战模式

### 3.1 ID 类型区分

```typescript
type UserId = string & { readonly __brand: "UserId" };
type ProductId = string & { readonly __brand: "ProductId" };
type OrderId = string & { readonly __brand: "OrderId" };

function findUser(id: UserId) { /* ... */ }
function findProduct(id: ProductId) { /* ... */ }
```

### 3.2 单位类型

```typescript
type Meters = number & { readonly __unit: "meters" };
type Seconds = number & { readonly __unit: "seconds" };

function distance(m: Meters) { return m; }
function time(s: Seconds) { return s; }
```

---

## 4. 类型兼容性的边界

结构化类型的意外行为：

```typescript
interface Config { host: string; port: number; }

// 额外的属性在直接赋值时允许（除非启用 excess property checks）
const config: Config = { host: "localhost", port: 3000, extra: true } as Config;
```

---

**参考规范**：TypeScript Handbook: Type Compatibility
