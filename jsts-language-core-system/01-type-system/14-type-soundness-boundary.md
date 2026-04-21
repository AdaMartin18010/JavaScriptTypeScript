# 类型健全性边界

> TypeScript 的类型安全保证与绕过机制
>
> 对齐版本：TypeScript 5.8–6.0

---

## 1. 类型健全性定义

**类型健全性（Type Soundness）**：如果程序通过类型检查，则运行时不会出现类型错误。

TypeScript 是**有意不健全**的：为了与 JavaScript 的兼容性和灵活性，允许某些类型不安全的操作。

---

## 2. 类型不安全的边界

### 2.1 any 类型

```typescript
let x: any = 4;
x.toFixed();     // 编译通过，运行时安全
x.nonExistent(); // 编译通过，运行时报错
```

### 2.2 类型断言

```typescript
const el = document.getElementById("root") as HTMLDivElement;
// 如果元素不是 div，运行时行为未定义
```

### 2.3 数组协变

```typescript
let animals: Animal[] = [];
let dogs: Dog[] = [];

animals = dogs; // TypeScript 允许（协变）
animals.push(new Cat()); // 运行时：dogs 数组中有了 Cat！
```

### 2.4 非空断言

```typescript
const element = document.getElementById("root")!;
// 如果元素不存在，运行时 null 错误
```

### 2.5 对象字面量多余属性检查

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}

// ❌ 多余属性检查
function createSquare(config: SquareConfig) { /* ... */ }
createSquare({ colour: "red", width: 100 }); // 编译错误

// ✅ 绕过检查
const options = { colour: "red", width: 100 };
createSquare(options); // 编译通过（options 不是对象字面量类型）
```

---

## 3. 提升类型安全

### 3.1 strict 模式

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "strictFunctionTypes": true
  }
}
```

### 3.2 使用 unknown 替代 any

```typescript
// ❌ 不安全
function process(data: any) {
  return data.toString();
}

// ✅ 安全
function process(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
  if (typeof data === "number") {
    return data.toFixed(2);
  }
  return String(data);
}
```

### 3.3 品牌类型

```typescript
type UserId = string & { __brand: "UserId" };
type PostId = string & { __brand: "PostId" };

function getUser(id: UserId) { /* ... */ }

const userId = "123" as UserId;
const postId = "123" as PostId;

getUser(userId); // ✅
getUser(postId); // ❌ Type 'PostId' is not assignable to type 'UserId'
```

---

## 4. 类型安全与开发效率的平衡

| 严格程度 | 配置 | 适用场景 |
|---------|------|---------|
| 宽松 | strict: false | 快速原型、JS 迁移 |
| 标准 | strict: true | 大多数项目 |
| 严格 | strict + noUncheckedIndexedAccess | 高可靠性系统 |
| 极致 | 上述 + branded types + 自定义守卫 | 金融、医疗等 |

---

**参考规范**：TypeScript Handbook: Type Safety | TypeScript Design Goals
