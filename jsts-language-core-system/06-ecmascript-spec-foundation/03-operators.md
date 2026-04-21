# 运算符

> ECMAScript 运算符的优先级、结合性与求值顺序
>
> 对齐版本：ECMA-262 2025 (ES16)

---

## 1. 优先级表

| 优先级 | 运算符 | 结合性 |
|--------|--------|--------|
| 20 | `()` | n/a |
| 19 | `.` `[]` `?.` `()` `new` | 左到右 |
| 18 | `new`（无参数）| 右到左 |
| 17 | `++` `--`（后置）| n/a |
| 16 | `!` `~` `+` `-` `++` `--` `typeof` `void` `delete` `await` | 右到左 |
| 15 | `**` | 右到左 |
| 14 | `*` `/` `%` | 左到右 |
| 13 | `+` `-` | 左到右 |
| 12 | `<<` `>>` `>>>` | 左到右 |
| 11 | `<` `<=` `>` `>=` `in` `instanceof` | 左到右 |
| 10 | `==` `!=` `===` `!==` | 左到右 |
| 9 | `&` | 左到右 |
| 8 | `^` | 左到右 |
| 7 | `\|` | 左到右 |
| 6 | `&&` | 左到右 |
| 5 | `\|\|` `??` | 左到右 |
| 4 | `? :` | 右到左 |
| 3 | `=` `+=` `-=` 等 | 右到左 |
| 2 | `yield` `yield*` | 右到左 |
| 1 | `,` | 左到右 |

---

## 2. 短路求值

```javascript
// && 短路
false && anything(); // anything() 不会执行

// || 短路
true || anything(); // anything() 不会执行

// ?? 短路
"default" ?? anything(); // anything() 不会执行
```

---

## 3. 可选链与空值合并

```javascript
// ?. 短路
obj?.property?.method?.(); // 任意一环为 nullish，返回 undefined

// ?? 与 &&、|| 不能混用
const value = a ?? b || c; // ❌ SyntaxError（需括号）
const value = (a ?? b) || c; // ✅
```

---

**参考规范**：ECMA-262 §13.5 Unary Operators | ECMA-262 §13.6 Exponentiation Operator | ECMA-262 §13.7 Multiplicative Operators
