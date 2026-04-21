# 空值合并与可选链

> ?? 与 ?. 的组合模式与最佳实践
>
> 对齐版本：ECMAScript 2020 (ES11) 及之后

---

## 1. 可选链操作符 `?.`

### 1.1 属性访问可选链

```javascript
const user = { profile: { name: "Alice" } };

// 安全访问深层属性
const name = user?.profile?.name;     // "Alice"
const bio = user?.profile?.bio;       // undefined（不报错）
const deep = user?.settings?.theme;   // undefined
```

### 1.2 计算属性可选链

```javascript
const key = "name";
const value = user?.profile?.[key]; // "Alice"
```

### 1.3 函数调用可选链

```javascript
const result = someObject?.method?.(); // 如果 method 不存在，返回 undefined
```

### 1.4 短路行为

```javascript
const obj = null;
const value = obj?.a?.b?.c; // 在 obj 处短路，返回 undefined
// a, b, c 都不会被访问
```

---

## 2. 空值合并运算符 `??`

```javascript
const value = null ?? "default";        // "default"
const value2 = undefined ?? "default";  // "default"
const value3 = 0 ?? "default";          // 0
const value4 = "" ?? "default";         // ""
```

---

## 3. 组合模式

### 3.1 安全访问 + 默认值

```javascript
const theme = user?.settings?.theme ?? "light";
const port = config?.server?.port ?? 3000;
```

### 3.2 深层属性安全访问

```javascript
// 替代繁琐的 && 链
const city = user?.address?.city ?? "Unknown";

// 以前需要：
// const city = user && user.address && user.address.city || "Unknown";
```

### 3.3 数组元素安全访问

```javascript
const firstItem = array?.[0]?.name ?? "No items";
```

---

## 4. 类型系统支持

TypeScript 3.7+ 支持可选链的类型推断：

```typescript
interface User {
  profile?: { name: string; bio?: string };
}

function getBio(user: User): string | undefined {
  return user.profile?.bio;
  // 返回类型：string | undefined（自动推断）
}
```

可选链后的类型收窄：

```typescript
if (user?.profile?.name) {
  // user 被收窄为非 null
  // user.profile 被收窄为非 undefined
  console.log(user.profile.name.toUpperCase());
}
```

---

## 5. 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|---------|
| 可选链不能赋值左侧 | `obj?.prop = value` 是语法错误 | 先检查对象存在性 |
| `?.` 与 `!` 非空断言混用 | `user!.profile?.name` 可能绕过安全检查 | 谨慎使用 `!` |
| 过度使用可选链 | `a?.b?.c?.d?.e` 可读性差 | 考虑使用默认值或提前返回 |
| 可选链不短路副作用 | `obj?.method(sideEffect())` 中 sideEffect 仍会执行 | 注意函数调用中的副作用 |

---

**参考规范**：ECMA-262 §13.3 Optional Chains | ECMA-262 §13.12 Coalesce Expression
