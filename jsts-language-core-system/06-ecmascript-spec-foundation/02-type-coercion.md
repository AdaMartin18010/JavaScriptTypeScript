# 类型强制转换（Type Coercion）

> ECMAScript 的抽象操作与隐式类型转换规则
>
> 对齐版本：ECMA-262 2025 (ES16)

---

## 1. 抽象操作

### 1.1 ToPrimitive

将对象转为原始值：

```javascript
const obj = {
  [Symbol.toPrimitive](hint) {
    if (hint === "number") return 42;
    return "string";
  }
};

console.log(+obj);      // 42（hint = "number"）
console.log(`${obj}`);  // "string"（hint = "string"）
```

### 1.2 ToNumber

| 输入 | 结果 |
|------|------|
| undefined | NaN |
| null | 0 |
| true | 1 |
| false | 0 |
| "" | 0 |
| "123" | 123 |
| "abc" | NaN |
| Symbol | TypeError |

### 1.3 ToString

| 输入 | 结果 |
|------|------|
| undefined | "undefined" |
| null | "null" |
| true | "true" |
| 123 | "123" |
| [1,2,3] | "1,2,3" |
| {} | "[object Object]" |

---

## 2. 二元运算符的强制转换

### 2.1 + 运算符

```javascript
1 + "2"      // "12"（数字转字符串）
1 + true     // 2（true 转 1）
1 + null     // 1（null 转 0）
1 + undefined // NaN（undefined 转 NaN）
```

### 2.2 == 运算符

```javascript
"1" == 1     // true（字符串转数字）
null == undefined // true
0 == false   // true
[] == ""     // true（数组转字符串）
[] == 0      // true
```

**建议**：始终使用 `===` 和 `!==`。

---

## 3. 逻辑运算符

```javascript
// || 返回第一个 truthy 值
0 || "default"  // "default"
"" || "default" // "default"
null || "default" // "default"

// && 返回第一个 falsy 值，或最后一个值
1 && 2 && 3     // 3
1 && 0 && 3     // 0

// ?? 返回第一个非 nullish 值
0 ?? "default"  // 0
null ?? "default" // "default"
```

---

**参考规范**：ECMA-262 §7.1 Type Conversion
