# 抽象操作（Abstract Operations）

> ECMA-262 规范中定义的内部算法：ToPrimitive、ToString、ToNumber 等
>
> 对齐版本：ECMA-262 §7.1–7.5

---

## 1. 抽象操作概述

**抽象操作（Abstract Operations）** 是 ECMAScript 规范中定义的内部算法，用于描述语言语义的细节。它们：

- 使用 `OperationName(arg1, arg2)` 的命名约定
- 不在 JavaScript 中直接暴露
- 是理解 JS 内部行为的关键

---

## 2. 类型转换操作

### 2.1 ToPrimitive

将对象转换为原始值：

```javascript
// 默认行为：先尝试 valueOf，再尝试 toString
const obj = {
  valueOf() { return 42; },
  toString() { return "hello"; }
};

console.log(Number(obj)); // 42（使用 valueOf）
console.log(String(obj)); // "hello"（使用 toString）
```

### 2.2 ToBoolean

转换为布尔值：

| 输入类型 | 结果 |
|---------|------|
| Undefined | false |
| Null | false |
| Boolean | 输入值 |
| Number | 0, NaN → false; 其他 → true |
| String | "" → false; 其他 → true |
| Symbol | true |
| Object | true |

### 2.3 ToNumber

转换为数字：

```javascript
Number("123");     // 123
Number("");        // 0
Number("  ");      // 0
Number(null);      // 0
Number(undefined); // NaN
Number(true);      // 1
Number(false);     // 0
```

### 2.4 ToString

转换为字符串：

```javascript
String(123);       // "123"
String(null);      // "null"
String(undefined); // "undefined"
String(true);      // "true"
String({});        // "[object Object]"
```

---

## 3. 对象操作

### 3.1 GetValue / PutValue

获取/设置引用类型的值：

```javascript
const obj = { x: 1 };
const ref = obj.x; // GetValue 操作
obj.x = 2;         // PutValue 操作
```

### 3.2 HasProperty

检查对象是否具有某属性（含原型链）：

```javascript
"toString" in {}; // true（继承自 Object.prototype）
```

### 3.3 DefinePropertyOrThrow

定义对象属性，失败时抛出 TypeError：

```javascript
const obj = {};
Object.defineProperty(obj, "x", { value: 1, writable: false });
obj.x = 2; // TypeError in strict mode
```

---

## 4. 环境操作

### 4.1 GetIdentifierReference

解析标识符引用：

```javascript
function outer() {
  const x = 1;
  function inner() {
    console.log(x); // GetIdentifierReference 沿作用域链查找 x
  }
  inner();
}
```

### 4.2 ResolveBinding

解析变量绑定：

```javascript
let x = 1;
// ResolveBinding("x") 在当前词法环境中找到 x 的绑定
```

---

## 5. 与日常开发的关系

### 5.1 == 运算符的抽象操作链

```javascript
1 == "1"
// 步骤：
// 1. Type(1) !== Type("1")，需要类型转换
// 2. ToNumber("1") = 1
// 3. 1 === 1 → true
```

### 5.2 对象属性访问的底层过程

```javascript
obj.prop
// 1. ToPropertyKey("prop")
// 2. obj.[[Get]]("prop", obj)
// 3. 沿原型链查找（如果自身没有）
```

---

**参考规范**：ECMA-262 §7 Abstract Operations
