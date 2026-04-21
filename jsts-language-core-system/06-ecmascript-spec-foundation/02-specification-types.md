# 规范类型（Specification Types）

> ECMA-262 中用于描述语言语义的内部类型
>
> 对齐版本：ECMA-262 §6.2

---

## 1. 规范类型概述

**规范类型（Specification Types）** 仅在 ECMAScript 规范中使用，不会直接出现在 JavaScript 代码中：

| 规范类型 | 说明 |
|---------|------|
| Reference | 解析标识符的结果 |
| List | 有序值序列 |
| Record | 键值对集合 |
| Property Descriptor | 属性描述符 |
| Completion Record | 语句执行结果 |
| Data Block | 原始数据块 |

---

## 2. Reference 类型

Reference 是解析标识符的结果，包含三个组件：

```
Reference: {
  Base: object | Environment Record | undefined,
  ReferencedName: string | Symbol,
  Strict: boolean
}
```

### 2.1 与 typeof、delete 的关系

```javascript
typeof undeclaredVar; // "undefined"（因为 Base 是 undefined）
delete obj.prop;      // 调用 obj.[[Delete]]("prop")
```

---

## 3. List 与 Record

### 3.1 List

有序序列：

```
List: [value1, value2, value3]
```

### 3.2 Record

键值对集合：

```
Property Descriptor: {
  [[Value]]: any,
  [[Writable]]: boolean,
  [[Enumerable]]: boolean,
  [[Configurable]]: boolean
}
```

---

## 4. Property Descriptor

```javascript
Object.getOwnPropertyDescriptor({ x: 1 }, "x");
// { value: 1, writable: true, enumerable: true, configurable: true }
```

| 字段 | 说明 |
|------|------|
| [[Value]] | 属性值 |
| [[Writable]] | 是否可写 |
| [[Enumerable]] | 是否可枚举 |
| [[Configurable]] | 是否可配置 |
| [[Get]] | getter 函数 |
| [[Set]] | setter 函数 |

---

## 5. 环境相关类型

### 5.1 Lexical Environment

```
LexicalEnvironment: {
  EnvironmentRecord: DeclarativeRecord | ObjectRecord,
  OuterEnv: LexicalEnvironment | null
}
```

### 5.2 Realm Record

```
RealmRecord: {
  [[Intrinsics]]: 内置对象集合,
  [[GlobalObject]]: 全局对象,
  [[GlobalEnv]]: 全局环境,
  [[TemplateMap]]: 模板字面量缓存
}
```

---

**参考规范**：ECMA-262 §6.2 ECMAScript Specification Types
