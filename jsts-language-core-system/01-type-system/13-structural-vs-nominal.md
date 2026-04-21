# 结构子类型 vs 名义类型

> TypeScript 的结构类型系统与 Java/C# 名义类型的对比
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 结构子类型（Structural Subtyping）

TypeScript 使用**结构子类型**：类型兼容性由成员决定，而非声明关系。

```typescript
interface Point2D { x: number; y: number; }
interface Point3D { x: number; y: number; z: number; }

const p3d: Point3D = { x: 1, y: 2, z: 3 };
const p2d: Point2D = p3d; // ✅ Point3D 结构包含 Point2D 的所有成员
```

### 1.1 鸭子类型

"如果它走起来像鸭子，叫起来像鸭子，那它就是鸭子。"

```typescript
interface Duck {
  quack(): void;
  walk(): void;
}

const robot = {
  quack() { console.log("Quack!"); },
  walk() { console.log("Walk!"); }
};

function makeItQuack(duck: Duck) {
  duck.quack();
}

makeItQuack(robot); // ✅ 结构兼容
```

---

## 2. 名义类型（Nominal Typing）

Java、C#、C++ 使用名义类型：类型兼容性由显式声明的关系决定。

```java
// Java：即使结构相同，类型名不同则不兼容
class User { String name; int age; }
class Person { String name; int age; }

User user = new Person(); // ❌ 编译错误：不兼容的类型
```

---

## 3. 对比

| 特性 | 结构类型 | 名义类型 |
|------|---------|---------|
| 兼容性判断 | 成员结构 | 类型名称/声明 |
| 灵活性 | 高 | 低 |
| 类型安全 | 中等 | 高 |
| 重构友好 | 一般 | 好 |
| 运行时开销 | 无 | 可能有 |

---

## 4. TypeScript 中模拟名义类型

### 4.1 品牌类型（Branded Types）

```typescript
type UserId = string & { __brand: "UserId" };
type PostId = string & { __brand: "PostId" };

function getUser(id: UserId) { /* ... */ }
function getPost(id: PostId) { /* ... */ }

const userId = "123" as UserId;
const postId = "123" as PostId;

getUser(userId); // ✅
getUser(postId); // ❌ Type 'PostId' is not assignable to type 'UserId'
```

### 4.2 私有字段模拟

```typescript
class User {
  private __nominal: void;
  constructor(public name: string) {}
}

class Person {
  private __nominal: void;
  constructor(public name: string) {}
}

const person = new Person("Alice");
const user: User = person; // ❌ 私有字段不兼容
```

---

## 5. 优缺点分析

### 5.1 结构类型的优势

- **接口隔离**：无需显式实现接口
- **测试友好**：容易创建 mock 对象
- **跨库兼容**：不同库定义的结构兼容类型可互换

### 5.2 结构类型的劣势

- **意外兼容**：不想兼容的类型可能意外兼容
- **重构风险**：修改属性可能影响意外的地方

```typescript
// 意外兼容的陷阱
interface Point { x: number; y: number; }
interface Vector { x: number; y: number; }

function normalize(v: Vector) {
  const length = Math.sqrt(v.x ** 2 + v.y ** 2);
  return { x: v.x / length, y: v.y / length };
}

const point: Point = { x: 3, y: 4 };
normalize(point); // ✅ 编译通过，但语义上 Point 不应被 normalize
```

---

**参考规范**：TypeScript Handbook: Type Compatibility | TypeScript Spec §3.11
