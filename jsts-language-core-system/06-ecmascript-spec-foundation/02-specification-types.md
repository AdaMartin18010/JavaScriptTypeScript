# 规范类型

> ECMA-262 内部使用的规范类型（非语言类型）
>
> 对齐版本：ECMAScript 2025 (ES16)

---

## 1. 规范类型概述

ECMAScript 规范定义了**语言类型**（JavaScript 开发者可见）和**规范类型**（仅用于规范描述）：

| 类别 | 类型 |
|------|------|
| 语言类型 | Undefined, Null, Boolean, String, Symbol, Number, BigInt, Object |
| 规范类型 | Reference, List, Completion Record, Property Descriptor, Environment Record, Abstract Closure, Data Block, Private Name |

---

## 2. Reference 类型

Reference 是规范内部用于表示属性引用的类型：

```
Reference = {
  [[Base]]: value | Environment Record | unresolvable,
  [[ReferencedName]]: String | Symbol | Private Name,
  [[Strict]]: Boolean,
  [[ThisValue]]: Object | undefined
}
```

### 2.1 属性访问创建 Reference

```javascript
obj.prop      // Base = obj, ReferencedName = "prop"
obj[symbol]   // Base = obj, ReferencedName = symbol
obj.#private  // Base = obj, ReferencedName = Private Name
```

### 2.2 Reference 解析

```javascript
// 获取值：GetValue(ref)
const x = obj.prop; // 先创建 Reference，再 GetValue

// 赋值：PutValue(ref, value)
obj.prop = 1; // 先创建 Reference，再 PutValue
```

---

## 3. List 类型

List 是规范中的有序序列（类似数组）：

```
List = [value1, value2, ...]
```

用于：

- 函数参数列表
- 解构模式元素
- 模板字面量部分

---

## 4. Completion Record 类型

```
Completion Record = {
  [[Type]]: normal | break | continue | return | throw,
  [[Value]]: value | empty,
  [[Target]]: String | empty
}
```

- **normal**：正常完成
- **break**：break 语句
- **continue**：continue 语句
- **return**：return 语句
- **throw**：异常

---

## 5. Property Descriptor

```
Property Descriptor = {
  [[Value]]: value,
  [[Writable]]: Boolean,
  [[Get]]: Function | undefined,
  [[Set]]: Function | undefined,
  [[Enumerable]]: Boolean,
  [[Configurable]]: Boolean
}
```

---

## 6. Environment Record

```
Environment Record = {
  [[OuterEnv]]: Environment Record | null,
  // 声明式：绑定标识符 → 值
  // 对象式：绑定全局对象属性
}
```

---

## 7. Data Block 与 Shared Data Block

```
Data Block = 字节序列（用于 TypedArray、ArrayBuffer）
Shared Data Block = 可在多个 Agent 间共享的 Data Block
```

## 8. Private Name 类型

ES2022 私有字段使用 Private Name：

```
Private Name = {
  [[Description]]: String
}
```

```javascript
class Counter {
  #count = 0; // Private Name: { [[Description]]: "count" }

  increment() {
    this.#count++;
  }
}
```

## 9. Abstract Closure

规范中的抽象闭包表示函数的逻辑：

```
Abstract Closure = {
  parameters: List,
  body: algorithm steps,
  [[ECMAScriptCode]]: Parse Node | empty,
  [[ScriptOrModule]]: Script Record | Module Record | empty
}
```

这与 JavaScript 的 Function 对象不同，是规范层面的概念。

## 10. 规范类型与语言类型的映射

| 规范类型 | 对应语言概念 |
|---------|-------------|
| Reference | 属性访问表达式（obj.prop） |
| List | 数组（内部使用） |
| Completion Record | 语句执行结果 |
| Property Descriptor | Object.getOwnPropertyDescriptor 返回值 |
| Environment Record | 作用域/词法环境 |
| Data Block | ArrayBuffer/TypedArray 底层存储 |

## 11. 规范算法示例

以 `ToPrimitive` 为例，展示规范类型的使用：

```
7.1.1 ToPrimitive ( input [ , preferredType ] )
  1. Assert: input is an ECMAScript language value.
  2. If Type(input) is Object, then
     a. Let exoticToPrim be ? GetMethod(input, @@toPrimitive).
     b. If exoticToPrim is not undefined, then
        i. Let result be ? Call(exoticToPrim, input, « hint »).
        ii. If Type(result) is not Object, return result.
        iii. Throw a TypeError exception.
     c. If preferredType is not present, let preferredType be number.
     d. Return ? OrdinaryToPrimitive(input, preferredType).
  3. Return input.
```

其中 `Type()` 返回语言类型，`?` 是 `ReturnIfAbrupt` 的简写。

## 12. 从规范到实现

理解规范类型有助于：

- **阅读 ECMA-262**：理解算法步骤
- **调试引擎行为**：理解 V8/SpiderMonkey 的实现
- **设计工具**：TypeScript 编译器、Babel 插件等

## 13. 规范类型的历史演进

| 版本 | 新增规范类型 |
|------|-------------|
| ES5 | Reference, List, Completion, Property Descriptor, Environment Record |
| ES6 | PromiseReaction, GeneratorRequest |
| ES2017 | Shared Data Block, Agent Record |
| ES2022 | Private Name, Private Environment Record |

---

**参考规范**：ECMA-262 §6.2

## 深入理解：引擎实现与优化

### V8 引擎视角

V8 是 Chrome 和 Node.js 使用的 JavaScript 引擎，其内部实现直接影响本节讨论的机制：

| 组件 | 功能 |
|------|------|
| Ignition | 解释器，生成字节码 |
| Sparkplug | 基线编译器，快速生成本地代码 |
| Maglev | 中层优化编译器，SSA 形式优化 |
| TurboFan | 顶层优化编译器，Sea of Nodes |

### 隐藏类与形状

```javascript
// V8 为相同结构的对象创建隐藏类
const p1 = { x: 1, y: 2 };
const p2 = { x: 3, y: 4 };
// p1 和 p2 共享同一个隐藏类

// 动态添加属性会创建新隐藏类
p1.z = 3; // 降级为字典模式
```

### 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 缓存属性偏移
}

getX({ x: 1 }); // 单态（monomorphic）
getX({ x: 2 }); // 同类型，快速路径
```

### 性能提示

1. 对象初始化时声明所有属性
2. 避免动态删除属性
3. 数组使用连续数字索引
4. 函数参数类型保持一致

### 相关工具

- Chrome DevTools Performance 面板
- Node.js `--prof` 和 `--prof-process`
- V8 flags: `--trace-opt`, `--trace-deopt`
