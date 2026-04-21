# 抽象操作（Abstract Operations）

> ECMA-262 中的内部算法：类型转换、属性操作与对象语义
>
> 对齐版本：ECMA-262 2025 (ES16)

---

## 1. 抽象操作概述

抽象操作是 ECMA-262 规范中定义的算法，以函数形式表示，用于辅助规范的其他部分。它们不是 JavaScript 语言的一部分，而是规范作者的内部工具。

---

## 2. 类型转换操作

### 2.1 ToPrimitive

将对象转换为原始值：

```
ToPrimitive(input, preferredType?)
```

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

### 2.2 ToNumber

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
| Object | 先 ToPrimitive，再 ToNumber |

### 2.3 ToString

| 输入 | 结果 |
|------|------|
| undefined | "undefined" |
| null | "null" |
| true | "true" |
| 123 | "123" |
| [1,2,3] | "1,2,3" |
| {} | "[object Object]" |

---

## 3. 属性操作

### 3.1 Get(O, P)

获取对象属性的值：

```
1. 断言：Type(O) 是 Object
2. 断言：IsPropertyKey(P) 是 true
3. 返回 O.[[Get]](P, O)
```

### 3.2 Set(O, P, V, Throw)

设置对象属性的值：

```
1. 断言：Type(O) 是 Object
2. 断言：IsPropertyKey(P) 是 true
3. 断言：Type(Throw) 是 Boolean
4. 成功？= O.[[Set]](P, V, O)
5. 如果成功？是 false 且 Throw 是 true，抛出 TypeError
6. 返回 success
```

### 3.3 HasProperty(O, P)

检查对象是否有属性：

```
1. 返回 O.[[HasProperty]](P)
```

### 3.4 DeletePropertyOrThrow(O, P)

删除对象属性：

```
1. 成功？= O.[[Delete]](P)
2. 如果成功？是 false，抛出 TypeError
3. 返回 success
```

---

## 4. 对象语义操作

### 4.1 DefinePropertyOrThrow(O, P, desc)

定义对象属性：

```javascript
const obj = {};
Object.defineProperty(obj, "x", {
  value: 1,
  writable: false,
  enumerable: true,
  configurable: true
});
```

### 4.2 GetMethod(V, P)

获取对象的方法：

```
1. 令 func 为 Get(V, P)
2. 如果 func 是 undefined 或 null，返回 undefined
3. 如果 IsCallable(func) 是 false，抛出 TypeError
4. 返回 func
```

### 4.3 Call(F, V, argumentsList)

调用函数：

```
1. 如果 argumentsList 未提供，设为空 List
2. 如果 IsCallable(F) 是 false，抛出 TypeError
3. 返回 F.[[Call]](V, argumentsList)
```

### 4.4 Construct(F, argumentsList, newTarget)

构造函数调用：

```
1. 如果 argumentsList 未提供，设为空 List
2. 如果 newTarget 未提供，设为 F
3. 断言：IsConstructor(F) 是 true
4. 返回 F.[[Construct]](argumentsList, newTarget)
```

---

## 5. 与 JavaScript 的关系

抽象操作虽然不可直接调用，但理解它们有助于：

1. **理解隐式类型转换**：`+`、`==` 等运算符调用哪些抽象操作
2. **理解属性访问**：`obj.prop` 调用 Get 操作
3. **理解函数调用**：`fn()` 调用 Call 操作

---

**参考规范**：ECMA-262 §7.1 Type Conversion | ECMA-262 §7.3 Operations on Objects
