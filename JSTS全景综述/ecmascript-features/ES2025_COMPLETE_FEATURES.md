---
last-updated: 2026-04-27
review-cycle: 6 months
next-review: 2026-10-27
status: current
---
# ES2025 (ES16) 完整特性指南

> 本文档全面涵盖 **ES2025 (ES16) 正式版** 所有新特性的规范定义、形式化语义、使用示例及兼容性信息，同时收录 **Stage 3/4 预览特性**（预计纳入 ES2026）。
>
> 规范版本: ECMAScript® 2025 Language Specification (ECMA-262, 16th edition, June 2025)
> 最后更新: 2026年4月

---

## 目录

- [ES2025 (ES16) 完整特性指南](#es2025-es16-完整特性指南)
  - [目录](#目录)
  - [1. Iterator 辅助方法完整指南](#1-iterator-辅助方法完整指南)
    - [1.1 规范定义](#11-规范定义)
    - [1.2 形式化语义](#12-形式化语义)
      - [Iterator.prototype.map(mapper)](#iteratorprototypemapmapper)
      - [Iterator.prototype.filter(predicate)](#iteratorprototypefilterpredicate)
      - [Iterator.prototype.take(limit)](#iteratorprototypetakelimit)
      - [Iterator.prototype.drop(count)](#iteratorprototypedropcount)
      - [Iterator.prototype.flatMap(mapper)](#iteratorprototypeflatmapmapper)
      - [Iterator.prototype.reduce(reducer, initialValue)](#iteratorprototypereducereducer-initialvalue)
      - [Iterator.prototype.takeWhile(predicate)](#iteratorprototypetakewhilepredicate)
      - [Iterator.prototype.dropWhile(predicate)](#iteratorprototypedropwhilepredicate)
    - [1.3 使用示例](#13-使用示例)
      - [基础链式操作](#基础链式操作)
      - [无限迭代器处理](#无限迭代器处理)
      - [flatMap 展开嵌套](#flatmap-展开嵌套)
      - [reduce 归约操作](#reduce-归约操作)
      - [takeWhile 与 dropWhile 的实际应用](#takewhile-与-dropwhile-的实际应用)
      - [短路求值与性能优化](#短路求值与性能优化)
    - [1.4 兼容性信息](#14-兼容性信息)
  - [2. Set 数学方法的形式化](#2-set-数学方法的形式化)
    - [2.1 规范定义](#21-规范定义)
    - [2.2 形式化语义](#22-形式化语义)
      - [集合成员判定算法](#集合成员判定算法)
      - [Set.prototype.union(other)](#setprototypeunionother)
      - [Set.prototype.intersection(other)](#setprototypeintersectionother)
      - [Set.prototype.difference(other)](#setprototypedifferenceother)
      - [Set.prototype.symmetricDifference(other)](#setprototypesymmetricdifferenceother)
      - [Set.prototype.isSubsetOf(other)](#setprototypeissubsetofother)
      - [Set.prototype.isSupersetOf(other)](#setprototypeissupersetofother)
      - [Set.prototype.isDisjointFrom(other)](#setprototypeisdisjointfromother)
    - [2.3 使用示例](#23-使用示例)
      - [基础集合运算](#基础集合运算)
      - [子集关系判定](#子集关系判定)
      - [实际应用场景](#实际应用场景)
      - [数据分析场景](#数据分析场景)
      - [支持任意可迭代对象](#支持任意可迭代对象)
    - [2.4 兼容性信息](#24-兼容性信息)
  - [3. Promise.try 的错误处理语义](#3-promisetry-的错误处理语义)
    - [3.1 规范定义](#31-规范定义)
    - [3.2 形式化语义](#32-形式化语义)
      - [与 Promise.resolve 的关键区别](#与-promiseresolve-的关键区别)
    - [3.3 使用示例](#33-使用示例)
      - [基本错误统一处理](#基本错误统一处理)
      - [参数传递](#参数传递)
      - [与 async/await 配合](#与-asyncawait-配合)
      - [回调风格函数包装](#回调风格函数包装)
      - [对比 Promise.resolve 和 new Promise](#对比-promiseresolve-和-new-promise)
    - [3.4 兼容性信息](#34-兼容性信息)
  - [4. RegExp.escape 的安全转义算法](#4-regexpescape-的安全转义算法)
    - [4.1 规范定义](#41-规范定义)
    - [4.2 形式化语义](#42-形式化语义)
      - [需要转义的特殊字符集](#需要转义的特殊字符集)
      - [转义策略矩阵](#转义策略矩阵)
    - [4.3 使用示例](#43-使用示例)
      - [基础字符串转义](#基础字符串转义)
      - [用户输入安全处理](#用户输入安全处理)
      - [动态正则构建](#动态正则构建)
      - [处理换行符](#处理换行符)
      - [Unicode 字符处理](#unicode-字符处理)
      - [完整示例：搜索高亮](#完整示例搜索高亮)
    - [4.4 兼容性信息](#44-兼容性信息)
  - [5. RegExp 重复命名捕获组的语义](#5-regexp-重复命名捕获组的语义)
    - [5.1 规范定义](#51-规范定义)
    - [5.2 形式化语义](#52-形式化语义)
      - [命名捕获组唯一性规则](#命名捕获组唯一性规则)
      - [匹配时的语义](#匹配时的语义)
      - [内存表示](#内存表示)
    - [5.3 使用示例](#53-使用示例)
      - [互斥分支中的重复命名](#互斥分支中的重复命名)
      - [多语言支持](#多语言支持)
      - [多种数值格式](#多种数值格式)
      - [错误示例](#错误示例)
    - [5.4 兼容性信息](#54-兼容性信息)
  - [6. RegExp 内联标志的局部语义](#6-regexp-内联标志的局部语义)
    - [6.1 规范定义](#61-规范定义)
    - [6.2 形式化语义](#62-形式化语义)
      - [内联标志语法](#内联标志语法)
      - [作用域规则](#作用域规则)
      - [标志继承与覆盖](#标志继承与覆盖)
    - [6.3 使用示例](#63-使用示例)
      - [局部忽略大小写](#局部忽略大小写)
      - [多行模式局部控制](#多行模式局部控制)
      - [标志切换](#标志切换)
      - [嵌套标志](#嵌套标志)
      - [实际应用：密码验证](#实际应用密码验证)
      - [结合 dotAll 标志](#结合-dotall-标志)
    - [6.4 兼容性信息](#64-兼容性信息)
  - [7. Float16Array 的数值精度分析](#7-float16array-的数值精度分析)
    - [7.1 规范定义](#71-规范定义)
    - [7.2 形式化语义](#72-形式化语义)
      - [IEEE 754 binary16 格式](#ieee-754-binary16-格式)
      - [数值特性对比](#数值特性对比)
      - [精度分析](#精度分析)
      - [舍入算法](#舍入算法)
    - [7.3 使用示例](#73-使用示例)
      - [基础使用](#基础使用)
      - [精度损失演示](#精度损失演示)
      - [与 Float32Array 对比](#与-float32array-对比)
      - [内存节省计算](#内存节省计算)
      - [实际应用场景](#实际应用场景-1)
      - [数据转换](#数据转换)
    - [7.4 兼容性信息](#74-兼容性信息)
  - [8. Import Attributes 的模块加载语义](#8-import-attributes-的模块加载语义)
    - [8.1 规范定义](#81-规范定义)
    - [8.2 形式化语义](#82-形式化语义)
      - [语法形式](#语法形式)
      - [动态导入形式](#动态导入形式)
      - [模块加载算法](#模块加载算法)
      - [JSON 模块语义](#json-模块语义)
      - [完整性检查](#完整性检查)
    - [8.3 使用示例](#83-使用示例)
      - [导入 JSON 模块](#导入-json-模块)
      - [动态导入带属性](#动态导入带属性)
      - [WebAssembly 模块（未来扩展）](#webassembly-模块未来扩展)
      - [与 import 映射配合](#与-import-映射配合)
      - [TypeScript 类型声明](#typescript-类型声明)
      - [属性不匹配错误](#属性不匹配错误)
    - [8.4 兼容性信息](#84-兼容性信息)
  - [附录 C. Stage 3/4 预览特性（预计 ES2026）](#附录-c-stage-34-预览特性预计-es2026)
    - [C.1 Atomics.pause 的内存屏障语义](#c1-atomicspause-的内存屏障语义)
    - [9.1 规范定义](#91-规范定义)
    - [9.2 形式化语义](#92-形式化语义)
      - [抽象操作](#抽象操作)
      - [内存模型位置](#内存模型位置)
      - [CPU 架构映射](#cpu-架构映射)
      - [与自旋锁的配合](#与自旋锁的配合)
    - [9.3 使用示例](#93-使用示例)
      - [基础自旋锁](#基础自旋锁)
      - [带退避的自旋锁](#带退避的自旋锁)
      - [读-复制-更新 (RCU) 模式](#读-复制-更新-rcu-模式)
      - [性能对比](#性能对比)
    - [9.4 兼容性信息](#94-兼容性信息)
    - [C.2 Explicit Resource Management 的 RAII 模式](#c2-explicit-resource-management-的-raii-模式)
    - [10.1 规范定义](#101-规范定义)
    - [10.2 形式化语义](#102-形式化语义)
      - [`using` 声明](#using-声明)
      - [Symbol.dispose 协议](#symboldispose-协议)
      - [DisposableStack](#disposablestack)
      - [异常处理语义](#异常处理语义)
    - [10.3 使用示例](#103-使用示例)
      - [基础 `using` 声明](#基础-using-声明)
      - [多个资源管理](#多个资源管理)
      - [异步资源管理](#异步资源管理)
      - [DisposableStack 手动管理](#disposablestack-手动管理)
      - [defer 模式](#defer-模式)
      - [adopt 模式](#adopt-模式)
      - [异常聚合](#异常聚合)
      - [实际应用场景](#实际应用场景-2)
    - [10.4 兼容性信息](#104-兼容性信息)
  - [附录](#附录)
    - [A. 特性支持速查表](#a-特性支持速查表)
    - [B. 相关提案链接](#b-相关提案链接)
    - [D. 参考文献](#d-参考文献)

---

## 1. Iterator 辅助方法完整指南

### 1.1 规范定义

ES2025 在 `Iterator.prototype` 上引入了一系列辅助方法，使得延迟计算（lazy evaluation）成为可能。这些方法返回新的迭代器，而不是立即计算结果。

**规范位置**: ECMA-262 §27.1.4

```
Iterator.prototype.map(mapper)
Iterator.prototype.filter(predicate)
Iterator.prototype.take(limit)
Iterator.prototype.drop(count)
Iterator.prototype.flatMap(mapper)
Iterator.prototype.reduce(reducer, initialValue)
Iterator.prototype.takeWhile(predicate)
Iterator.prototype.dropWhile(predicate)
Iterator.prototype.toArray()
Iterator.prototype.forEach(fn)
Iterator.prototype.every(predicate)
Iterator.prototype.find(predicate)
Iterator.prototype.some(predicate)
```

### 1.2 形式化语义

#### Iterator.prototype.map(mapper)

**抽象操作**: `CreateMapIterator(iterator, mapper)`

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 iterated 为 GetIteratorDirect(O)
3. 若 IsCallable(mapper) 为 false，抛出 TypeError
4. 创建闭包 closure:
   a. 重复:
      i.   令 next 为 IteratorStep(iterated)
      ii.  若 next 为 false，返回 undefined
      iii. 令 value 为 IteratorValue(next)
      iv.  令 mapped 为 Completion(Call(mapper, undefined, « value »))
      v.   若 abrupt completion，调用 IteratorClose(iterated, mapped)
      vi.  生成 mapped
```

**时间复杂度**: O(1) 初始化，O(n) 遍历总时间

#### Iterator.prototype.filter(predicate)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 iterated 为 GetIteratorDirect(O)
3. 若 IsCallable(predicate) 为 false，抛出 TypeError
4. 创建闭包 closure:
   a. 重复:
      i.   令 next 为 IteratorStep(iterated)
      ii.  若 next 为 false，返回 undefined
      iii. 令 value 为 IteratorValue(next)
      iv.  令 selected 为 Completion(Call(predicate, undefined, « value »))
      v.   若 abrupt completion，调用 IteratorClose(iterated, selected)
      vi.  若 ToBoolean(selected) 为 true，生成 value
```

#### Iterator.prototype.take(limit)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 iterated 为 GetIteratorDirect(O)
3. 令 remaining 为 ToNumber(limit)
4. 若 remaining < 0，抛出 RangeError
5. 若 remaining = 0，调用 IteratorClose(iterated, NormalCompletion(undefined))
6. 创建闭包 closure:
   a. 当 remaining > 0:
      i.   令 next 为 IteratorStep(iterated)
      ii.  若 next 为 false，返回 undefined
      iii. 令 value 为 IteratorValue(next)
      iv.  remaining -= 1
      v.   生成 value
   b. 调用 IteratorClose(iterated, NormalCompletion(undefined))
```

#### Iterator.prototype.drop(count)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 iterated 为 GetIteratorDirect(O)
3. 令 remaining 为 ToNumber(count)
4. 若 remaining < 0，抛出 RangeError
5. 创建闭包 closure:
   a. 当 remaining > 0:
      i.   令 next 为 IteratorStep(iterated)
      ii.  若 next 为 false，返回 undefined
      iii. remaining -= 1
   b. 重复:
      i.   令 next 为 IteratorStep(iterated)
      ii.  若 next 为 false，返回 undefined
      iii. 生成 IteratorValue(next)
```

#### Iterator.prototype.flatMap(mapper)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 iterated 为 GetIteratorDirect(O)
3. 若 IsCallable(mapper) 为 false，抛出 TypeError
4. 创建闭包 closure:
   a. 重复:
      i.   令 next 为 IteratorStep(iterated)
      ii.  若 next 为 false，返回 undefined
      iii. 令 value 为 IteratorValue(next)
      iv.  令 mapped 为 Completion(Call(mapper, undefined, « value »))
      v.   若 abrupt completion，调用 IteratorClose(iterated, mapped)
      vi.  令 innerIterator 为 GetIterator(mapped, sync)
      vii. 令 innerAlive 为 true
      viii.当 innerAlive:
           - 令 innerNext 为 Completion(IteratorStep(innerIterator))
           - 若 innerNext abrupt，调用 IteratorClose(iterated, innerNext)
           - 若 innerNext = false，设 innerAlive = false
           - 否则，生成 IteratorValue(innerNext)
```

#### Iterator.prototype.reduce(reducer, initialValue)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 iterated 为 GetIteratorDirect(O)
3. 若 IsCallable(reducer) 为 false，抛出 TypeError
4. 令 hasInitial 为 arguments.length > 1
5. 若 hasInitial:
   a. 令 accumulator 为 initialValue
6. 否则:
   a. 令 next 为 IteratorStep(iterated)
   b. 若 next = false，抛出 TypeError
   c. 令 accumulator 为 IteratorValue(next)
7. 重复:
   a. 令 next 为 IteratorStep(iterated)
   b. 若 next = false，返回 accumulator
   c. 令 value 为 IteratorValue(next)
   d. 令 result 为 Completion(Call(reducer, undefined, « accumulator, value »))
   e. 若 abrupt completion，调用 IteratorClose(iterated, result)
   f. 设 accumulator 为 result
```

#### Iterator.prototype.takeWhile(predicate)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 iterated 为 GetIteratorDirect(O)
3. 若 IsCallable(predicate) 为 false，抛出 TypeError
4. 创建闭包 closure:
   a. 重复:
      i.   令 next 为 IteratorStep(iterated)
      ii.  若 next = false，返回 undefined
      iii. 令 value 为 IteratorValue(next)
      iv.  令 condition 为 Completion(Call(predicate, undefined, « value »))
      v.   若 abrupt completion，调用 IteratorClose(iterated, condition)
      vi.  若 ToBoolean(condition) = false:
           - 调用 IteratorClose(iterated, NormalCompletion(undefined))
           - 返回 undefined
      vii. 生成 value
```

#### Iterator.prototype.dropWhile(predicate)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 iterated 为 GetIteratorDirect(O)
3. 若 IsCallable(predicate) 为 false，抛出 TypeError
4. 创建闭包 closure:
   a. 令 dropping 为 true
   b. 重复:
      i.   令 next 为 IteratorStep(iterated)
      ii.  若 next = false，返回 undefined
      iii. 令 value 为 IteratorValue(next)
      iv.  若 dropping:
           - 令 condition 为 Completion(Call(predicate, undefined, « value »))
           - 若 abrupt completion，调用 IteratorClose(iterated, condition)
           - 若 ToBoolean(condition) = true，继续（跳过当前值）
           - 否则，设 dropping = false
      v.   生成 value
```

### 1.3 使用示例

#### 基础链式操作

```javascript
// 惰性求值的数字处理管道
const result = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .values()  // 创建数组迭代器
  .filter(x => x % 2 === 0)  // 偶数筛选
  .map(x => x * 2)           // 翻倍
  .take(3)                   // 只取前3个
  .toArray();                // [4, 8, 12]

// 对比传统方法（立即计算所有中间结果）
const eager = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .filter(x => x % 2 === 0)  // [2, 4, 6, 8, 10]
  .map(x => x * 2)           // [4, 8, 12, 16, 20]
  .slice(0, 3);              // [4, 8, 12]
```

#### 无限迭代器处理

```javascript
// 斐波那契无限序列
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 只取前10个大于100的斐波那契数
const largeFibs = fibonacci()
  .dropWhile(x => x <= 100)  // 跳过 <=100 的
  .take(10)                   // 取10个
  .toArray();
// [144, 233, 377, 610, 987, 1597, 2584, 4181, 6765, 10946]
```

#### flatMap 展开嵌套

```javascript
// 处理分页数据
const pages = [
  { items: [1, 2, 3] },
  { items: [4, 5] },
  { items: [6, 7, 8, 9] }
];

const allItems = pages
  .values()
  .flatMap(page => page.items.values())
  .toArray();  // [1, 2, 3, 4, 5, 6, 7, 8, 9]

// 笛卡尔积生成
const colors = ['红', '绿', '蓝'].values();
const sizes = ['S', 'M', 'L'].values();

const cartesian = colors
  .flatMap(c => sizes.map(s => `${c}-${s}`))
  .toArray();
// ['红-S', '红-M', '红-L', '绿-S', '绿-M', '绿-L', '蓝-S', '蓝-M', '蓝-L']
```

#### reduce 归约操作

```javascript
// 使用 reduce 计算总和
const sum = [1, 2, 3, 4, 5]
  .values()
  .reduce((acc, x) => acc + x, 0);  // 15

// 不带初始值（首个元素作为初始值）
const product = [2, 3, 4]
  .values()
  .reduce((acc, x) => acc * x);  // 24

// 空迭代器无初始值会抛出 TypeError
try {
  [].values().reduce((a, b) => a + b);
} catch (e) {
  console.log(e.name);  // TypeError
}
```

#### takeWhile 与 dropWhile 的实际应用

```javascript
// 处理日志时间序列
const logEntries = [
  { time: '09:00', level: 'INFO', msg: 'Start' },
  { time: '09:01', level: 'INFO', msg: 'Init' },
  { time: '09:02', level: 'WARN', msg: 'Config missing' },
  { time: '09:03', level: 'ERROR', msg: 'Failed' },
  { time: '09:04', level: 'INFO', msg: 'Retry' }
].values();

// 获取第一个 ERROR 之前的所有日志
const beforeError = logEntries
  .takeWhile(e => e.level !== 'ERROR')
  .toArray();
// 3条 INFO/WARN 日志

// 跳过初始的 INFO 日志
const afterInfo = [
  { level: 'INFO', msg: '1' },
  { level: 'INFO', msg: '2' },
  { level: 'WARN', msg: '3' },
  { level: 'ERROR', msg: '4' }
].values()
  .dropWhile(e => e.level === 'INFO')
  .toArray();
// [{level:'WARN', msg:'3'}, {level:'ERROR', msg:'4'}]
```

#### 短路求值与性能优化

```javascript
// 惰性求值避免不必要的计算
function* expensiveGenerator() {
  console.log('生成 1'); yield 1;
  console.log('生成 2'); yield 2;
  console.log('生成 3'); yield 3;  // 不会执行
  console.log('生成 4'); yield 4;  // 不会执行
}

const result = expensiveGenerator()
  .map(x => { console.log('映射', x); return x * 10; })
  .take(2)
  .toArray();
// 输出:
// 生成 1
// 映射 1
// 生成 2
// 映射 2
// 结果: [10, 20]
```

### 1.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 122+ | 完整支持 |
| Firefox | 131+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 22.0+ | 完整支持，需 `--harmony-iterator-helpers` (22.x) |
| Deno | 1.40+ | 完整支持 |
| Bun | 1.1+ | 完整支持 |

**Polyfill**: 可使用 `core-js` 的 `es.iterator` 模块

```javascript
import 'core-js/actual/iterator';
```

---

## 2. Set 数学方法的形式化

### 2.1 规范定义

ES2025 为 `Set.prototype` 引入了7个数学方法，使 Set 可以进行集合代数运算。

**规范位置**: ECMA-262 §24.2.4

```
Set.prototype.union(other)
Set.prototype.intersection(other)
Set.prototype.difference(other)
Set.prototype.symmetricDifference(other)
Set.prototype.isSubsetOf(other)
Set.prototype.isSupersetOf(other)
Set.prototype.isDisjointFrom(other)
```

### 2.2 形式化语义

#### 集合成员判定算法

所有 Set 方法都基于 SameValueZero 相等性算法：

```
SameValueZero(x, y):
1. 若 Type(x) ≠ Type(y)，返回 false
2. 若 x 为 Number:
   a. 若 x 为 NaN 且 y 为 NaN，返回 true
   b. 若 x 为 +0 且 y 为 -0，返回 true
   c. 若 x 为 -0 且 y 为 +0，返回 true
   d. 若 x = y，返回 true
   e. 返回 false
3. 返回 SameValueNonNumber(x, y)
```

#### Set.prototype.union(other)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 S 为 ToSet(O)
3. 设 otherRec 为 GetSetRecord(other)
4. 设 resultSet 为 OrderedHashTable 新实例
5. 对 S.[[SetData]] 中每个元素 e:
   a. 将 e 插入 resultSet（若 e 不存在）
6. 令 iteratorRecord 为 GetIterator(otherRec.[[Set]], sync)
7. 重复:
   a. 令 next 为 IteratorStep(iteratorRecord)
   b. 若 next = false，返回 CreateSet(resultSet)
   c. 令 value 为 IteratorValue(next)
   d. 将 value 插入 resultSet（若 value 不存在）
```

**数学定义**: $A \cup B = \{x \mid x \in A \lor x \in B\}$

**性质**:

- 幂等律: $A \cup A = A$
- 交换律: $A \cup B = B \cup A$
- 结合律: $(A \cup B) \cup C = A \cup (B \cup C)$

#### Set.prototype.intersection(other)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 S 为 ToSet(O)
3. 设 otherRec 为 GetSetRecord(other)
4. 设 resultSet 为 OrderedHashTable 新实例
5. 设 thisSize 为 S.[[SetData]] 的大小
6. 设 otherSize 为 otherRec.[[Size]]
7. 若 thisSize ≤ otherSize:
   a. 对 S.[[SetData]] 中每个元素 e:
      i.   若 e 不为 empty
      ii.  若 SetHas(otherRec.[[Set]], e) 为 true
      iii. 将 e 插入 resultSet
8. 否则:
   a. 令 iteratorRecord 为 GetIterator(otherRec.[[Set]], sync)
   b. 重复:
      i.   令 next 为 IteratorStep(iteratorRecord)
      ii.  若 next = false，返回 CreateSet(resultSet)
      iii. 令 value 为 IteratorValue(next)
      iv.  若 SetHas(S, value) 为 true 且 SetHas(resultSet, value) 为 false
      v.   将 value 插入 resultSet
```

**数学定义**: $A \cap B = \{x \mid x \in A \land x \in B\}$

**复杂度优化**: 选择较小的集合进行迭代，时间复杂度 $O(\min(|A|, |B|))$

#### Set.prototype.difference(other)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 S 为 ToSet(O)
3. 设 otherRec 为 GetSetRecord(other)
4. 设 resultSet 为 OrderedHashTable 新实例（复制 S）
5. 令 iteratorRecord 为 GetIterator(otherRec.[[Set]], sync)
6. 重复:
   a. 令 next 为 IteratorStep(iteratorRecord)
   b. 若 next = false，返回 CreateSet(resultSet)
   c. 令 value 为 IteratorValue(next)
   d. 设 index 为 SetDataIndex(resultSet, value)
   e. 若 index ≠ -1，设 resultSet[index] 为 empty
```

**数学定义**: $A \setminus B = \{x \mid x \in A \land x \notin B\}$

#### Set.prototype.symmetricDifference(other)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 S 为 ToSet(O)
3. 设 otherRec 为 GetSetRecord(other)
4. 设 resultSet 为 OrderedHashTable 新实例（复制 S）
5. 令 iteratorRecord 为 GetIterator(otherRec.[[Set]], sync)
6. 重复:
   a. 令 next 为 IteratorStep(iteratorRecord)
   b. 若 next = false，返回 CreateSet(resultSet)
   c. 令 value 为 IteratorValue(next)
   d. 设 index 为 SetDataIndex(resultSet, value)
   e. 若 index ≠ -1:
      i.  设 resultSet[index] 为 empty
   f. 否则:
      i.  将 value 插入 resultSet
```

**数学定义**: $A \triangle B = (A \setminus B) \cup (B \setminus A) = \{x \mid x \in A \oplus x \in B\}$

#### Set.prototype.isSubsetOf(other)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 S 为 ToSet(O)
3. 设 otherRec 为 GetSetRecord(other)
4. 设 thisSize 为 S.[[SetData]] 中非 empty 元素数量
5. 若 thisSize > otherRec.[[Size]]，返回 false（快速失败）
6. 对 S.[[SetData]] 中每个元素 e:
   a. 若 e 不为 empty 且 SetHas(otherRec.[[Set]], e) 为 false
   b. 返回 false
7. 返回 true
```

**数学定义**: $A \subseteq B \iff \forall x (x \in A \rightarrow x \in B)$

#### Set.prototype.isSupersetOf(other)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 S 为 ToSet(O)
3. 设 otherRec 为 GetSetRecord(other)
4. 设 thisSize 为 S.[[SetData]] 中非 empty 元素数量
5. 若 thisSize < otherRec.[[Size]]，返回 false（快速失败）
6. 令 iteratorRecord 为 GetIterator(otherRec.[[Set]], sync)
7. 重复:
   a. 令 next 为 IteratorStep(iteratorRecord)
   b. 若 next = false，返回 true
   c. 令 value 为 IteratorValue(next)
   d. 若 SetHas(S, value) 为 false，返回 false
```

**数学定义**: $A \supseteq B \iff B \subseteq A$

#### Set.prototype.isDisjointFrom(other)

```
1. 设 O 为 RequireObjectCoercible(this value)
2. 设 S 为 ToSet(O)
3. 设 otherRec 为 GetSetRecord(other)
4. 设 thisSize 为 S.[[SetData]] 中非 empty 元素数量
5. 设 otherSize 为 otherRec.[[Size]]
6. 若 thisSize ≤ otherSize:
   a. 对 S.[[SetData]] 中每个元素 e:
      i.  若 e 不为 empty 且 SetHas(otherRec.[[Set]], e) 为 true
      ii. 返回 false
7. 否则:
   a. 令 iteratorRecord 为 GetIterator(otherRec.[[Set]], sync)
   b. 重复:
      i.  令 next 为 IteratorStep(iteratorRecord)
      ii. 若 next = false，返回 true
      iii. 令 value 为 IteratorValue(next)
      iv. 若 SetHas(S, value) 为 true，返回 false
8. 返回 true
```

**数学定义**: $A \cap B = \emptyset$

### 2.3 使用示例

#### 基础集合运算

```javascript
const setA = new Set([1, 2, 3, 4, 5]);
const setB = new Set([4, 5, 6, 7, 8]);

// 并集 (Union): {1, 2, 3, 4, 5, 6, 7, 8}
const union = setA.union(setB);
console.log([...union]);  // [1, 2, 3, 4, 5, 6, 7, 8]

// 交集 (Intersection): {4, 5}
const intersection = setA.intersection(setB);
console.log([...intersection]);  // [4, 5]

// 差集 (Difference): {1, 2, 3}
const difference = setA.difference(setB);
console.log([...difference]);  // [1, 2, 3]

// 对称差集 (Symmetric Difference): {1, 2, 3, 6, 7, 8}
const symDiff = setA.symmetricDifference(setB);
console.log([...symDiff]);  // [1, 2, 3, 6, 7, 8]
```

#### 子集关系判定

```javascript
const small = new Set([1, 2]);
const medium = new Set([1, 2, 3, 4]);
const large = new Set([1, 2, 3, 4, 5]);

// 子集检查
console.log(small.isSubsetOf(medium));  // true
console.log(medium.isSubsetOf(large));  // true
console.log(large.isSubsetOf(small));   // false

// 超集检查
console.log(large.isSupersetOf(medium));  // true
console.log(medium.isSupersetOf(small));  // true

// 不相交检查
const disjointA = new Set([1, 2, 3]);
const disjointB = new Set([4, 5, 6]);
console.log(disjointA.isDisjointFrom(disjointB));  // true
console.log(small.isDisjointFrom(medium));         // false
```

#### 实际应用场景

```javascript
// 权限系统：检查用户角色权限
const userPermissions = new Set(['read', 'write']);
const requiredPermissions = new Set(['read']);

// 检查用户是否有所有必需权限
const hasAllPermissions = requiredPermissions.isSubsetOf(userPermissions);
console.log(hasAllPermissions);  // true

// 检查新增权限
const adminPermissions = new Set(['read', 'write', 'delete', 'admin']);
const newPermissions = adminPermissions.difference(userPermissions);
console.log([...newPermissions]);  // ['delete', 'admin']

// 权限冲突检测（互斥权限不能同时拥有）
const readOnly = new Set(['read']);
const writeAccess = new Set(['write']);
const hasConflict = !readOnly.isDisjointFrom(writeAccess);
console.log(hasConflict);  // true（假设读写互斥）
```

#### 数据分析场景

```javascript
// 用户行为分析
const activeUsers = new Set(['user1', 'user2', 'user3', 'user4']);
const payingUsers = new Set(['user2', 'user4', 'user5']);
const churnedUsers = new Set(['user6', 'user7']);

// 付费活跃用户（交集）
const payingActive = activeUsers.intersection(payingUsers);
console.log([...payingActive]);  // ['user2', 'user4']

// 非付费活跃用户（差集）
const nonPayingActive = activeUsers.difference(payingUsers);
console.log([...nonPayingActive]);  // ['user1', 'user3']

// 所有相关用户（并集）
const allUsers = activeUsers.union(payingUsers).union(churnedUsers);
console.log([...allUsers]);  // ['user1', 'user2', 'user3', 'user4', 'user5', 'user6', 'user7']

// 流失用户是否与活跃用户重叠？
console.log(activeUsers.isDisjointFrom(churnedUsers));  // true（不重叠，数据一致）
```

#### 支持任意可迭代对象

```javascript
const set = new Set([1, 2, 3]);

// 可以与数组运算
set.union([4, 5]);           // Set {1, 2, 3, 4, 5}
set.intersection([2, 3, 4]); // Set {2, 3}

// 可以与 Map 的 keys 运算
const map = new Map([[2, 'a'], [3, 'b']]);
set.intersection(map.keys()); // Set {2, 3}

// 可以与生成器运算
function* gen() { yield 2; yield 5; }
set.union(gen());  // Set {1, 2, 3, 5}
```

### 2.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 122+ | 完整支持 |
| Firefox | 127+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 22.0+ | 完整支持 |
| Deno | 1.40+ | 完整支持 |
| Bun | 1.1+ | 完整支持 |

**Polyfill**: `core-js/actual/set`

---

## 3. Promise.try 的错误处理语义

### 3.1 规范定义

`Promise.try` 是一个工厂方法，用于将同步或异步的函数执行包装为 Promise，统一错误处理。

**规范位置**: ECMA-262 §27.2.4.8

```
Promise.try ( callback, ...args )
```

### 3.2 形式化语义

```
Promise.try(callback, ...args):
1. 令 C 为 this 值
2. 若 Type(C) 不为 Object，抛出 TypeError
3. 令 promiseCapability 为 NewPromiseCapability(C)
4. 尝试:
   a. 令 result 为 Completion(Call(callback, undefined, args))
5. 若 result 为 abrupt completion:
   a. 令 rejectResult 为 Call(promiseCapability.[[Reject]], undefined, « result.[[Value]] »)
   b. 返回 promiseCapability.[[Promise]]
6. 否则:
   a. 令 resolveResult 为 Call(promiseCapability.[[Resolve]], undefined, « result.[[Value]] »)
   b. 返回 promiseCapability.[[Promise]]
```

#### 与 Promise.resolve 的关键区别

| 特性 | Promise.try(fn) | Promise.resolve(fn()) |
|-----|----------------|----------------------|
| 同步异常捕获 | ✅ 捕获并转为 rejected | ❌ 异常直接抛出 |
| 函数执行时机 | 立即执行 | 立即执行 |
| 返回值类型 | Promise | Promise |
| 异步返回值 | 正常 resolve | 正常 resolve |

**形式化证明**:

```
设 f 为任意函数，可能抛出异常或返回任意值

Promise.try(f) 的行为:
  - 若 f() 抛出异常 e，返回 Promise.reject(e)
  - 若 f() 返回 v:
    - 若 v 为 Promise-like，调用 then 解析
    - 否则返回 Promise.resolve(v)

Promise.resolve(f()) 的行为:
  - 若 f() 抛出异常 e，异常直接向上传播（未捕获）
  - 若 f() 返回 v:
    - 若 v 为 Promise-like，调用 then 解析
    - 否则返回 Promise.resolve(v)
```

### 3.3 使用示例

#### 基本错误统一处理

```javascript
// 传统方式的问题：同步和异步错误需要分开处理
function riskyOperation() {
  if (Math.random() > 0.5) {
    throw new Error('同步错误');
  }
  return fetch('/api/data');  // 可能返回 rejected Promise
}

// ❌ 错误：同步错误无法被 catch
try {
  Promise.resolve(riskyOperation())
    .then(data => console.log(data))
    .catch(err => console.error('只捕获异步错误:', err));
} catch (syncErr) {
  console.error('需要额外捕获同步错误:', syncErr);
}

// ✅ 正确：Promise.try 统一处理所有错误
Promise.try(riskyOperation)
  .then(data => console.log(data))
  .catch(err => console.error('捕获所有错误:', err));  // 同步和异步都能捕获
```

#### 参数传递

```javascript
// Promise.try 支持传递参数
function divide(a, b) {
  if (b === 0) throw new Error('除零错误');
  return a / b;
}

Promise.try(divide, 10, 2)
  .then(result => console.log(result))  // 5
  .catch(err => console.error(err));

Promise.try(divide, 10, 0)
  .then(result => console.log(result))
  .catch(err => console.error(err.message));  // "除零错误"
```

#### 与 async/await 配合

```javascript
// 在 async 函数中使用
async function safeExecute(fn, ...args) {
  return await Promise.try(fn, ...args);
}

// 实际应用：统一 API 错误处理
class APIClient {
  async request(url, options) {
    return Promise.try(() => {
      // 同步验证
      if (!url) throw new TypeError('URL is required');
      if (!options.method) throw new TypeError('Method is required');

      // 异步请求
      return fetch(url, options);
    }).then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    });
  }
}
```

#### 回调风格函数包装

```javascript
// 将可能出错的同步函数转为 Promise 风格
const fs = require('fs');

// 传统回调
function readConfigSync(path) {
  const content = fs.readFileSync(path, 'utf8');
  return JSON.parse(content);  // 可能抛出 SyntaxError
}

// 包装为安全的 Promise 版本
function readConfigSafe(path) {
  return Promise.try(readConfigSync, path);
}

// 使用
readConfigSafe('./config.json')
  .then(config => console.log('配置:', config))
  .catch(err => {
    if (err.code === 'ENOENT') {
      console.error('配置文件不存在');
    } else if (err instanceof SyntaxError) {
      console.error('配置格式错误');
    } else {
      console.error('未知错误:', err);
    }
  });
```

#### 对比 Promise.resolve 和 new Promise

```javascript
function mayThrow() {
  if (Math.random() > 0.5) throw new Error('Boom');
  return 'success';
}

// ❌ Promise.resolve: 同步异常会逃逸
const p1 = Promise.resolve(mayThrow());  // 可能直接抛出异常，而不是返回 rejected Promise

// ❌ new Promise: 需要手动 try-catch
const p2 = new Promise((resolve, reject) => {
  try {
    resolve(mayThrow());
  } catch (e) {
    reject(e);
  }
});

// ✅ Promise.try: 简洁且安全
const p3 = Promise.try(mayThrow);
```

### 3.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 128+ | 完整支持 |
| Firefox | 134+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 23.0+ | 完整支持 |
| Deno | 2.0+ | 完整支持 |
| Bun | 1.1.30+ | 完整支持 |

**Polyfill**: 简单实现

```javascript
if (!Promise.try) {
  Promise.try = function(callback, ...args) {
    return new Promise((resolve, reject) => {
      try {
        resolve(callback.apply(this, args));
      } catch (error) {
        reject(error);
      }
    });
  };
}
```

---


## 4. RegExp.escape 的安全转义算法

### 4.1 规范定义

`RegExp.escape` 是一个静态方法，用于将字符串转义为可在正则表达式中安全使用的字面量。

**规范位置**: ECMA-262 §22.2.2.11

```
RegExp.escape ( string )
```

### 4.2 形式化语义

```
RegExp.escape(string):
1. 令 S 为 ToString(string)
2. 令 escaped 为空字符串
3. 令 cpList 为 S 的代码点列表
4. 对于 cpList 中每个代码点 c:
   a. 若 c 在 RegExpSpecialChars 中:
      i.  将 "\\" 追加到 escaped
      ii. 将 c 追加到 escaped
   b. 否则若 c 是 LineTerminator:
      i.  若 c 是 U+000A (LF): 追加 "\\n"
      ii. 若 c 是 U+000D (CR): 追加 "\\r"
      iii.若 c 是 U+2028 (LS): 追加 "\\u2028"
      iv. 若 c 是 U+2029 (PS): 追加 "\\u2029"
   c. 否则若 c 是 ASCII 字母或数字:
      i.  将 c 追加到 escaped
   d. 否则:
      i.  令 hex 为 c 的十六进制表示（小写）
      ii. 若 c ≤ 0xFF: 追加 "\\x" + 两位 hex
      iii.否则: 追加 "\\u{" + hex + "}"
5. 返回 escaped
```

#### 需要转义的特殊字符集

```
RegExpSpecialChars = {
  '^', '$', '\\', '.', '*', '+', '?', '(', ')', '[', ']', '{', '}', '|'
}

LineTerminators = {
  U+000A (Line Feed),
  U+000D (Carriage Return),
  U+2028 (Line Separator),
  U+2029 (Paragraph Separator)
}
```

#### 转义策略矩阵

| 字符类型 | 示例 | 转义方式 | 原因 |
|---------|------|---------|------|
| 特殊元字符 | `*.+?^${}()|[]\` | `\*` | 防止被解释为元字符 |
| ASCII 控制字符 | `\n`, `\r` | `\n`, `\r` | 可读性转义 |
| Unicode 换行符 | U+2028, U+2029 | `\u2028`, `\u2029` | ES2018 换行符 |
| 其他非 ASCII | `中`, `€` | `\u{4e2d}`, `\u{20ac}` | 十六进制转义 |
| ASCII 字母数字 | `a`, `1` | 不转义 | 安全字符 |

### 4.3 使用示例

#### 基础字符串转义

```javascript
// 转义正则特殊字符
RegExp.escape('*.js');        // '\*\.js'
RegExp.escape('price: $100'); // 'price: \$100'
RegExp.escape('a+b');         // 'a\+b'
RegExp.escape('[test]');      // '\[test\]'

// 使用转义后的字符串构建正则
const searchTerm = '*.js';
const escaped = RegExp.escape(searchTerm);
const regex = new RegExp(escaped);  // /\*\.js/ 字面量匹配
console.log(regex.test('*.js'));     // true
console.log(regex.test('a.js'));     // false
```

#### 用户输入安全处理

```javascript
// 安全地构建用户输入搜索
function safeSearch(text, searchTerm) {
  const escaped = RegExp.escape(searchTerm);
  const regex = new RegExp(escaped, 'gi');
  return text.match(regex) || [];
}

// 用户输入可能包含特殊字符
const userInput = '[dangerous]*.+';
const text = 'The [dangerous]*.+ pattern appears here';

// ❌ 不安全：用户输入被解释为正则元字符
const unsafeRegex = new RegExp(userInput);
// 可能抛出异常或行为异常

// ✅ 安全：用户输入被当作字面量
const matches = safeSearch(text, userInput);
console.log(matches);  // ['[dangerous]*.+']
```

#### 动态正则构建

```javascript
// 构建安全的文件名匹配
function createFileMatcher(extension) {
  const escaped = RegExp.escape(extension);
  return new RegExp(`\\.${escaped}$`);
}

const jsMatcher = createFileMatcher('js');      // /\.js$/
const tsxMatcher = createFileMatcher('tsx');    // /\.tsx$/
const complexMatcher = createFileMatcher('min.js');  // /\.min\.js$/

console.log(jsMatcher.test('app.js'));          // true
console.log(jsMatcher.test('app.jsx'));         // false
console.log(complexMatcher.test('app.min.js')); // true
```

#### 处理换行符

```javascript
// 自动转义换行符
RegExp.escape('line1\nline2');     // 'line1\\nline2'
RegExp.escape('line1\r\nline2');   // 'line1\\r\\nline2'

// 在模板字符串中使用
const multiline = `first
second`;
const pattern = RegExp.escape(multiline);
console.log(pattern);  // 'first\\nsecond'

// 匹配多行文本
const regex = new RegExp(pattern);
console.log(regex.test('first\nsecond'));  // true
```

#### Unicode 字符处理

```javascript
// 非 ASCII 字符使用 \u{} 转义
RegExp.escape('café');    // 'caf\\u{e9}'
RegExp.escape('中文字符'); // '\\u{4e2d}\\u{6587}\\u{5b57}\\u{7b26}'
RegExp.escape('💯');       // '\\u{1f4af}'

// Emoji 处理
RegExp.escape('🚀🌟');     // '\\u{1f680}\\u{1f31f}'
```

#### 完整示例：搜索高亮

```javascript
function highlightMatches(text, searchTerm) {
  if (!searchTerm) return text;

  const escaped = RegExp.escape(searchTerm);
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// 测试各种输入
const content = 'The price is $100 [SALE] *limited* offer!';

console.log(highlightMatches(content, '$100'));     // 'The price is <mark>$100</mark> [SALE] *limited* offer!'
console.log(highlightMatches(content, '[SALE]'));   // 'The price is $100 <mark>[SALE]</mark> *limited* offer!'
console.log(highlightMatches(content, '*limited*')); // 'The price is $100 [SALE] <mark>*limited*</mark> offer!'
```

### 4.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 133+ | 完整支持 |
| Firefox | 134+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 24.0+ | 完整支持 |
| Deno | 2.2+ | 完整支持 |
| Bun | 1.2+ | 完整支持 |

**Polyfill**: `core-js/actual/regexp/escape`

---

## 5. RegExp 重复命名捕获组的语义

### 5.1 规范定义

ES2025 允许在同一个正则表达式中使用相同的名称定义多个命名捕获组，只要这些组位于互斥的分支中。

**规范位置**: ECMA-262 §22.2.1

### 5.2 形式化语义

#### 命名捕获组唯一性规则

```
定义：
- 捕获组 A 和 B 是"互斥的"（mutually exclusive），当且仅当
  对于任意输入字符串，A 和 B 不可能同时匹配成功

规则：
同一正则表达式中，两个命名捕获组可以使用相同名称 name，
当且仅当它们是互斥的。

典型互斥情况：
1. 位于同一个 |（选择）运算符的不同分支
   (?<name>A) | (?<name>B)  // ✅ 合法

2. 位于不同分支的嵌套结构中
   ((?<name>A)B) | (C(?<name>D))  // ✅ 合法

非法情况：
1. 同分支内的重复命名
   (?<name>A)(?<name>B)  // ❌ SyntaxError

2. 可能同时匹配的非互斥组
   (?<name>A)|(?<name>B)(?<name>C)  // ❌ 如果 A 和 B 都可能匹配
```

#### 匹配时的语义

```
当正则表达式匹配成功时：
1. 对于每个命名捕获组名称 N：
   a. 找到实际匹配的、名为 N 的捕获组 G（唯一确定）
   b. 设 groups[N] = 捕获子串(G)
   c. 设 groups[N].start = 起始索引(G)
   d. 设 groups[N].end = 结束索引(G)

2. 对于未匹配的命名捕获组：
   a. groups[N] = undefined
```

#### 内存表示

```
RegExpMatch 对象结构：
{
  0: 完整匹配字符串,
  1..n: 数字索引捕获组,
  groups: {
    [name]: 匹配值 | undefined,
    // 同名组只保留实际匹配的那个
  },
  index: 匹配起始索引,
  input: 原始输入字符串,
  length: 捕获组总数 + 1
}
```

### 5.3 使用示例

#### 互斥分支中的重复命名

```javascript
// 解析日期：支持多种格式
const dateRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})|(?<month>\d{2})\/(?<day>\d{2})\/(?<year>\d{4})/;

// ISO 格式匹配
const isoMatch = '2024-03-15'.match(dateRegex);
console.log(isoMatch.groups);
// { year: '2024', month: '03', day: '15' }

// US 格式匹配
const usMatch = '03/15/2024'.match(dateRegex);
console.log(usMatch.groups);
// { year: '2024', month: '03', day: '15' }

// 统一的 groups 接口，无需关心具体格式
function parseDate(str) {
  const match = str.match(dateRegex);
  if (!match) return null;
  const { year, month, day } = match.groups;
  return { year, month, day };
}
```

#### 多语言支持

```javascript
// 匹配不同语言的 "name" 字段
const nameRegex = /
  姓名：(?<name>[\u4e00-\u9fa5]+) |   // 中文
  Name: (?<name>[a-zA-Z\s]+) |       // 英文
  名前：(?<name>[\u3040-\u309F\u30A0-\u30FF]+)  // 日文
/x;

const cn = '姓名：张三'.match(nameRegex);
console.log(cn.groups.name);  // '张三'

const en = 'Name: John Smith'.match(nameRegex);
console.log(en.groups.name);  // 'John Smith'

const jp = '名前：たなか'.match(nameRegex);
console.log(jp.groups.name);  // 'たなか'
```

#### 多种数值格式

```javascript
// 匹配带不同单位的数值
const measureRegex = /^(?<value>\d+(?:\.\d+)?)(?:\s*(?<unit>px|em|rem))|(?<value>\d+(?:\.\d+)?)(?<unit>%)$/;

// 绝对单位
const abs = '16px'.match(measureRegex);
console.log(abs.groups);  // { value: '16', unit: 'px' }

// 百分比（不同分支，相同命名）
const pct = '50%'.match(measureRegex);
console.log(pct.groups);  // { value: '50', unit: '%' }
```

#### 错误示例

```javascript
// ❌ 同分支内重复命名 - SyntaxError
try {
  new RegExp('(?<name>a)(?<name>b)');
} catch (e) {
  console.log(e.message);  // 包含重复捕获组名称
}

// ❌ 非互斥的重复命名
try {
  new RegExp('(?<x>a)|(?<x>b)(?<x>c)');  // 第三个 x 与前面的冲突
} catch (e) {
  console.log(e.message);
}
```

### 5.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 128+ | 完整支持 |
| Firefox | 131+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 23.0+ | 完整支持 |
| Deno | 2.0+ | 完整支持 |
| Bun | 1.1.20+ | 完整支持 |

---

## 6. RegExp 内联标志的局部语义

### 6.1 规范定义

ES2025 允许在正则表达式内部使用 `(?flags:...)` 语法启用或禁用标志，且作用域仅限于括号内的子表达式。

**规范位置**: ECMA-262 §22.2.1

### 6.2 形式化语义

#### 内联标志语法

```
(?<flags>:<pattern>)

flags 可以包含：
  i - 不区分大小写 (ignoreCase)
  m - 多行模式 (multiline)
  s - dotAll 模式

flags 前可以加 - 表示禁用：
  (?-i:...)  - 禁用不区分大小写
  (?-im:...) - 同时禁用 i 和 m
```

#### 作用域规则

```
1. 内联标志的作用域仅限于其包围的子表达式
2. 嵌套的内联标志可以覆盖外部标志
3. 标志修改不影响同一级别的其他分支

形式化：
设 R 为包含标志 F 的正则表达式
设 S = (?<flags>:P) 为内联标志表达式

则：
- S 的匹配使用 flags ∪ F（外部标志并集内联标志）
- 外部表达式使用 flags（不受 S 影响）
- 嵌套表达式继承当前有效标志
```

#### 标志继承与覆盖

```
标志优先级（从高到低）：
1. 最内层内联标志
2. 外层内联标志
3. 正则表达式全局标志（new RegExp 的第二个参数）

规则：
- 启用标志：(?i:...) 添加 i 标志
- 禁用标志：(?-i:...) 移除 i 标志
- 切换标志：(?i-s:...) 添加 i，移除 s
```

### 6.3 使用示例

#### 局部忽略大小写

```javascript
// 只在特定部分忽略大小写
const regex = /hello (?i:world)/;

console.log(regex.test('hello world'));  // true
console.log(regex.test('hello WORLD'));  // true
console.log(regex.test('HELLO world'));  // false（hello 区分大小写）

// 复杂的局部标志
const complex = /API_(?i:key|token|secret)_\w+/;
console.log(complex.test('API_KEY_123'));   // true
console.log(complex.test('API_key_123'));   // true
console.log(complex.test('api_key_123'));   // false（API_ 区分大小写）
```

#### 多行模式局部控制

```javascript
// 只在特定组中使用多行模式
const regex = /^start(?m:.*?$)^end/;

const text = `start
middle
end`;

// 局部 m 标志使 ^$ 匹配行首行尾
const match = text.match(regex);
console.log(match);  // null（整体不是多行模式）

// 完整的多行模式
const regexFull = /^start.*?^end/m;
console.log(text.match(regexFull));  // 匹配成功
```

#### 标志切换

```javascript
// 在表达式中切换标志
const regex = /(?i:hello) (?-i:WORLD)/;

console.log(regex.test('hello WORLD'));  // true
console.log(regex.test('HELLO WORLD'));  // true
console.log(regex.test('hello world'));  // false（WORLD 必须大写）
console.log(regex.test('HELLO world'));  // false
```

#### 嵌套标志

```javascript
// 嵌套的内联标志
const regex = /(?i:out(?-i:IN)er)/;

console.log(regex.test('outer'));    // true
console.log(regex.test('OUTER'));    // true
console.log(regex.test('outINer'));  // true
console.log(regex.test('outiner'));  // false（IN 区分大小写）
console.log(regex.test('OUTINER'));  // true（out 和 er 不区分）
```

#### 实际应用：密码验证

```javascript
// 密码强度检查：不同部分有不同要求
const passwordRegex = /^
  (?=.*[a-z])           # 至少一个小写
  (?=.*[A-Z])           # 至少一个大写
  (?=.*\d)              # 至少一个数字
  (?=.*[!@#$%^&*])      # 至少一个特殊字符
  (?i:[a-z0-9!@#$%^&*]) # 允许的任何字符（不区分大小写计数）
  {8,}                  # 至少8位
$/x;

// 更精确的控制
const betterRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*]{8,}$/;
```

#### 结合 dotAll 标志

```javascript
// 局部启用 dotAll
const regex = /START(?s:.*?)END/;

const multiline = `START
line1
line2
END`;

console.log(multiline.match(regex));  // 匹配整个块

// 不换行的精确匹配
const strict = /START(?-s:.*)END/;
const singleLine = 'START content END';
console.log(singleLine.match(strict));  // 匹配
```

### 6.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 133+ | 完整支持 |
| Firefox | 134+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 24.0+ | 完整支持 |
| Deno | 2.2+ | 完整支持 |
| Bun | 1.2+ | 完整支持 |

---

## 7. Float16Array 的数值精度分析

### 7.1 规范定义

`Float16Array` 是一种类型化数组，使用 IEEE 754-2008 半精度浮点格式（binary16）存储数值。

**规范位置**: ECMA-262 §24.3, §6.1.6.2

### 7.2 形式化语义

#### IEEE 754 binary16 格式

```
位布局（16位）：
[符号位:1][指数位:5][尾数位:10]

编码值：
- 若指数 = 0 且尾数 = 0:   value = (-1)^sign × 0
- 若指数 = 0 且尾数 ≠ 0:   value = (-1)^sign × 2^(-14) × 0.fraction（非规格化数）
- 若 0 < 指数 < 31:         value = (-1)^sign × 2^(exponent-15) × 1.fraction（规格化数）
- 若指数 = 31 且尾数 = 0:   value = (-1)^sign × Infinity
- 若指数 = 31 且尾数 ≠ 0:   value = NaN
```

#### 数值特性对比

| 特性 | Float16 | Float32 | Float64 |
|-----|---------|---------|---------|
| 位数 | 16 | 32 | 64 |
| 指数位 | 5 | 8 | 11 |
| 尾数位 | 10 | 23 | 52 |
| 指数偏移 | 15 | 127 | 1023 |
| 最大正规格化数 | 65504 | ~3.4×10³⁸ | ~1.8×10³⁰⁸ |
| 最小正规格化数 | 6.10×10⁻⁵ | ~1.2×10⁻³⁸ | ~2.2×10⁻³⁰⁸ |
| 最小非规格化数 | 5.96×10⁻⁸ | ~1.4×10⁻⁴⁵ | ~5×10⁻³²⁴ |
| 机器 epsilon | 9.77×10⁻⁴ | ~1.2×10⁻⁷ | ~2.2×10⁻¹⁶ |
| 十进制精度 | ~3-4 位 | ~6-9 位 | ~15-17 位 |

#### 精度分析

```
连续可表示整数的范围：
- Float16: 0 到 2048（之后间隔为2）
- Float32: 0 到 2^24 = 16,777,216
- Float64: 0 到 2^53 = 9,007,199,254,740,992

Float16 的整数间隙：
[0, 2048]:     间隔 = 1
[2049, 4096]:  间隔 = 2
[4097, 8192]:  间隔 = 4
[8193, 16384]: 间隔 = 8
[16385, 65504]: 间隔 ≥ 16
```

#### 舍入算法

```
当将其他格式转换为 Float16：
1. 提取符号、指数、尾数
2. 若指数 > 15（最大规格化指数）：
   a. 若允许溢出，返回 ±Infinity
   b. 否则抛出 RangeError
3. 若指数 < -14（最小规格化指数）：
   a. 转为非规格化数，或下溢为 0
4. 尾数舍入到10位（就近偶数舍入）
5. 组合为16位表示
```

### 7.3 使用示例

#### 基础使用

```javascript
// 创建 Float16Array
const f16 = new Float16Array(4);
f16[0] = 1.5;
f16[1] = 65504;    // 最大值
f16[2] = 0.0001;   // 最小非规格化数附近
f16[3] = 2049;     // 精度损失开始

console.log(f16[0]);  // 1.5
console.log(f16[1]);  // 65504
console.log(f16[3]);  // 2050（2049 被舍入为 2050）

// 从数组创建
const fromArray = new Float16Array([1.0, 2.5, 100.125]);
console.log(fromArray);  // Float16Array [1, 2.5, 100.1]
```

#### 精度损失演示

```javascript
const f16 = new Float16Array(1);

// 大整数精度损失
f16[0] = 2049;
console.log(f16[0]);  // 2050（2049 无法精确表示）

f16[0] = 10000;
console.log(f16[0]);  // 10000（精确）

f16[0] = 10001;
console.log(f16[0]);  // 10000（10001 被舍入为 10000）

// 小数精度
f16[0] = 0.1;
console.log(f16[0]);  // 0.0999755859375

f16[0] = 1.1;
console.log(f16[0]);  // 1.099609375
```

#### 与 Float32Array 对比

```javascript
const f16 = new Float16Array([1.1, 2.2, 3.3]);
const f32 = new Float32Array([1.1, 2.2, 3.3]);
const f64 = new Float64Array([1.1, 2.2, 3.3]);

console.log('Float16:', [...f16]);
// [1.099609375, 2.19921875, 3.298828125]

console.log('Float32:', [...f32]);
// [1.100000023841858, 2.200000047683716, 3.299999952316284]

console.log('Float64:', [...f64]);
// [1.1, 2.2, 3.3]
```

#### 内存节省计算

```javascript
// 大规模数据存储场景
const count = 1000000;

console.log('Float16Array:', (count * 2 / 1024 / 1024).toFixed(2), 'MB');  // 1.91 MB
console.log('Float32Array:', (count * 4 / 1024 / 1024).toFixed(2), 'MB');  // 3.81 MB
console.log('Float64Array:', (count * 8 / 1024 / 1024).toFixed(2), 'MB');  // 7.63 MB
console.log('普通数组:', (count * 64 / 1024 / 1024).toFixed(2), 'MB（估算）');  // ~61 MB
```

#### 实际应用场景

```javascript
// 1. 机器学习模型权重（大量参数，精度要求不高）
const modelWeights = new Float16Array(10000000);  // 20MB vs 80MB

// 2. GPU 纹理数据（WebGPU 支持 Float16）
const textureData = new Float16Array(width * height * 4);

// 3. 传感器数据流（实时采样，精度足够）
class SensorStream {
  constructor(bufferSize = 10000) {
    this.buffer = new Float16Array(bufferSize);
    this.index = 0;
  }

  push(value) {
    // 自动处理精度转换
    this.buffer[this.index] = value;
    this.index = (this.index + 1) % this.buffer.length;
  }
}

// 4. 图形顶点数据
const vertices = new Float16Array([
  0.0, 0.5, 0.0,   // vertex 1
  -0.5, -0.5, 0.0, // vertex 2
  0.5, -0.5, 0.0   // vertex 3
]);
```

#### 数据转换

```javascript
// Float16 与其他类型互转
const float32Data = new Float32Array([1.5, 2.5, 3.14]);

// 转换为 Float16
const asFloat16 = new Float16Array(float32Data);
console.log(asFloat16);  // Float16Array [1.5, 2.5, 3.14]

// 从 Float16 转回
const backTo32 = new Float32Array(asFloat16);
console.log(backTo32);   // Float32Array [1.5, 2.5, 3.14]

// 与 ArrayBuffer 交互
const buffer = new ArrayBuffer(8);
const f16view = new Float16Array(buffer);
const u8view = new Uint8Array(buffer);

f16view[0] = 1.5;
console.log(u8view);  // 查看底层字节表示
```

### 7.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 131+ | 完整支持 |
| Firefox | 129+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 22.0+ | 完整支持（需 --experimental-float16array） |
| Deno | 1.45+ | 完整支持 |
| Bun | 1.1.20+ | 完整支持 |

**Polyfill**: `@petamoriken/float16` npm 包

---


## 8. Import Attributes 的模块加载语义

### 8.1 规范定义

Import Attributes（以前称为 Import Assertions）允许在导入模块时指定额外的元数据属性，主要用于控制模块的加载和解析方式。

**规范位置**: ECMA-262 §16.2.2, §16.2.4

### 8.2 形式化语义

#### 语法形式

```
ImportDeclaration:
  import ModuleSpecifier;
  import ImportClause FromClause;
  import ModuleSpecifier WithClause;           // 带属性
  import ImportClause FromClause WithClause;    // 带属性

FromClause:
  from ModuleSpecifier

WithClause:
  with Attributes

Attributes:
  { AttributeList }

AttributeList:
  Attribute
  AttributeList , Attribute

Attribute:
  AttributeKey : StringLiteral

AttributeKey:
  IdentifierName
  StringLiteral
```

#### 动态导入形式

```
import(ModuleSpecifier, Options)

Options:
  { with: Attributes }
```

#### 模块加载算法

```
HostLoadImportedModule(referrer, specifier, attributes, hostDefined):

1. 令 settingsObject 为 hostDefined.[[SettingsObject]]
2. 令 url 为 ResolveModuleSpecifier(referrer, specifier)
3. 若 url 失败，返回 rejected Promise

4. 令 moduleType 为 "javascript"
5. 若 attributes 包含 "type":
   a. 令 typeValue 为 attributes.[[type]]
   b. 若 typeValue 为 "json"，设 moduleType 为 "json"
   c. 否则若 typeValue 不为 "javascript"，抛出 TypeError

6. 令 existing 为 settingsObject.[[ModuleMap]][url, moduleType]
7. 若 existing 存在，返回 fulfilled Promise(existing)

8. 令 record 为 Host 定义的模块加载过程(url, moduleType)
9. 存储 settingsObject.[[ModuleMap]][url, moduleType] = record
10. 返回 fulfilled Promise(record)
```

#### JSON 模块语义

```
当加载 type: "json" 的模块时：

1. 获取模块资源
2. 将资源解析为 UTF-8 解码的字符串
3. 使用 JSON.parse 解析字符串
4. 创建 Synthetic Module Record:
   - [[ExportNames]]: ["default"]
   - [[Evaluate]]: 返回解析后的 JSON 对象作为 default 导出

注意：JSON 模块是只读的，且解析时会被深冻结（deep freeze）
```

#### 完整性检查

```
Import Attributes 的完整性要求：

1. 若模块加载成功，其属性必须与请求匹配
2. 若模块已存在于 ModuleMap 但属性不同：
   - 若属性语义不兼容，抛出 TypeError
   - 若属性语义兼容，返回已存在的模块

示例：
import data from "./config.json" with { type: "json" };
import data2 from "./config.json" with { type: "json" };  // ✅ 复用
import data3 from "./config.json";  // ❌ 可能抛出（视 Host 而定）
```

### 8.3 使用示例

#### 导入 JSON 模块

```javascript
// config.json
{
  "apiUrl": "https://api.example.com",
  "timeout": 5000,
  "features": {
    "auth": true,
    "caching": false
  }
}

// app.js
import config from './config.json' with { type: 'json' };

console.log(config.apiUrl);     // 'https://api.example.com'
console.log(config.features.auth);  // true

// 解构导入
typeof config;  // 'object'
config instanceof Object;  // true

// 注意：JSON 模块是冻结的
config.timeout = 10000;  // 严格模式下抛出 TypeError，非严格静默失败
```

#### 动态导入带属性

```javascript
// 条件加载配置
async function loadConfig(environment) {
  const config = await import(`./config.${environment}.json`, {
    with: { type: 'json' }
  });
  return config.default;
}

// 使用
const devConfig = await loadConfig('development');
const prodConfig = await loadConfig('production');

// 错误处理
async function safeLoad(path) {
  try {
    return await import(path, { with: { type: 'json' } });
  } catch (err) {
    if (err instanceof TypeError) {
      console.error('属性不匹配或模块类型错误');
    }
    throw err;
  }
}
```

#### WebAssembly 模块（未来扩展）

```javascript
// 当前提案阶段，未来可能支持
import wasmModule from './math.wasm' with { type: 'wasm' };

// 或 CSS 模块
import styles from './styles.css' with { type: 'css' };
document.adoptedStyleSheets = [styles];
```

#### 与 import 映射配合

```json
// importmap.json
{
  "imports": {
    "config": "./config.json"
  }
}
```

```javascript
// 使用映射导入 JSON
import config from 'config' with { type: 'json' };
```

#### TypeScript 类型声明

```typescript
// config.d.ts
declare module '*.json' {
  const value: unknown;
  export default value;
}

// 具体类型声明
interface Config {
  apiUrl: string;
  timeout: number;
}

declare module './config.json' {
  const config: Config;
  export default config;
}
```

#### 属性不匹配错误

```javascript
// ❌ 尝试导入 JSON 但不指定类型
import config from './config.json';
// 可能抛出：TypeError: Module ./config.json needs an import attribute

// ✅ 正确指定类型
import config from './config.json' with { type: 'json' };
```

### 8.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 123+ | 完整支持 |
| Firefox | 127+ | 完整支持 |
| Safari | 17.4+ | 完整支持 |
| Node.js | 20.10+ (LTS), 18.20+ | 实验性标志 `--experimental-import-attributes` |
| Node.js | 22.0+ | 完整支持 |
| Deno | 1.37+ | 完整支持 |
| Bun | 1.0.30+ | 完整支持 |

**配置示例 (Node.js)**:

```json
// package.json
{
  "type": "module",
  "scripts": {
    "start": "node --experimental-import-attributes app.js"
  }
}
```

---

## 附录 C. Stage 3/4 预览特性（预计 ES2026）

> 以下特性在 ECMAScript 2025 (ES16) 正式版中的状态各异。`Atomics.pause` 目前处于 **TC39 Stage 3**；`Explicit Resource Management` 已达 **Stage 4**（已纳入 ES2025）。为便于读者提前了解，此处保留其详细文档。

### C.1 Atomics.pause 的内存屏障语义

### 9.1 规范定义

`Atomics.pause` 是一个提示指令，用于在高竞争的自旋锁（spinlock）场景中优化 CPU 功耗和性能。

**规范位置**: ECMA-262 §25.4.8

### 9.2 形式化语义

#### 抽象操作

```
Atomics.pause([hint])

1. 令 hint 为 hint 参数，若未提供则为 undefined
2. 若 hint 不为 undefined:
   a. 令 hintNumber 为 ToNumber(hint)
   b. 若 hintNumber < 0，令 hintNumber 为 0
   c. 令 hintInt 为 ToInt32(hintNumber)
3. 否则，令 hintInt 为实现定义的默认值

4. 执行 Agent 暂停提示(hintInt):
   a. 这是一个性能提示，非同步原语
   b. 告诉 CPU 当前正在自旋等待，可以优化功耗
   c. hintInt 可以影响暂停的"深度"或持续时间

5. 返回 undefined
```

#### 内存模型位置

```
Atomics.pause 在内存模型中的位置：

内存操作顺序（从强到弱）：
1. Atomics.compareExchange - 完全内存屏障
2. Atomics.exchange / Atomics.store - 释放/获取语义
3. Atomics.load - 获取语义
4. Atomics.pause - 无内存序语义，仅提示

关键性质：
- Atomics.pause 不引入任何 happens-before 关系
- 不保证任何可见性（visibility）
- 不改变内存模型的正式语义
- 纯粹是向底层硬件的性能提示
```

#### CPU 架构映射

```
Atomics.pause 到硬件指令的映射：

x86/x64:
  - hint ≤ 0:   PAUSE 指令
  - hint > 0:   可能的 UMWAIT/TPAUSE（若支持）

ARM64:
  - hint ≤ 0:   YIELD 指令
  - hint > 0:   WFE (Wait For Event) 或 YIELD

其他架构:
  - 可能映射到架构特定的自旋等待提示
  - 或作为空操作（no-op）
```

#### 与自旋锁的配合

```
推荐的自旋锁模式（带指数退避）：

class SpinLock {
  lock() {
    let pauseCount = 0;
    const maxPause = 1000;  // 最大指数

    while (Atomics.compareExchange(this.state, 0, 1) !== 0) {
      // 忙等待，带暂停提示
      Atomics.pause(pauseCount);

      // 指数退避
      pauseCount = Math.min(pauseCount * 2 + 1, maxPause);
    }
  }

  unlock() {
    Atomics.store(this.state, 0, 0);
  }
}
```

### 9.3 使用示例

#### 基础自旋锁

```javascript
// shared-buffer.js
const buffer = new SharedArrayBuffer(4);
const lock = new Int32Array(buffer);

// worker.js
function acquireLock() {
  // 自旋等待锁释放
  while (Atomics.compareExchange(lock, 0, 0, 1) !== 0) {
    Atomics.pause();  // 提示 CPU 我们在忙等待
  }
}

function releaseLock() {
  Atomics.store(lock, 0, 0);
}

// 使用
acquireLock();
try {
  // 临界区
  performCriticalOperation();
} finally {
  releaseLock();
}
```

#### 带退避的自旋锁

```javascript
class AdaptiveSpinLock {
  constructor(sharedBuffer, offset = 0) {
    this.state = new Int32Array(sharedBuffer, offset, 1);
  }

  lock(maxSpins = 10000) {
    let spins = 0;
    let pauseHint = 0;

    while (Atomics.compareExchange(this.state, 0, 0, 1) !== 0) {
      if (spins < maxSpins) {
        // 短等待：积极自旋
        Atomics.pause(pauseHint);
        pauseHint = Math.min(pauseHint + 1, 100);
        spins++;
      } else {
        // 长等待：让出线程
        Atomics.wait(this.state, 0, 1);
        spins = 0;
        pauseHint = 0;
      }
    }
  }

  unlock() {
    const prev = Atomics.exchange(this.state, 0, 0);
    if (prev === 1) {
      // 通知等待的线程
      Atomics.notify(this.state, 0, 1);
    }
  }
}
```

#### 读-复制-更新 (RCU) 模式

```javascript
class RCUBuffer {
  constructor(size) {
    this.buffer = new SharedArrayBuffer(size * 2 + 8);
    this.active = new Int32Array(this.buffer, 0, 1);
    this.readers = new Int32Array(this.buffer, 4, 1);
    this.data = [
      new Uint8Array(this.buffer, 8, size),
      new Uint8Array(this.buffer, 8 + size, size)
    ];
  }

  read(index) {
    const activeIdx = Atomics.load(this.active, 0);
    Atomics.add(this.readers, 0, 1);

    try {
      return this.data[activeIdx][index];
    } finally {
      Atomics.sub(this.readers, 0, 1);
    }
  }

  write(index, value) {
    const inactiveIdx = 1 - Atomics.load(this.active, 0);

    // 写入非活跃缓冲区
    this.data[inactiveIdx][index] = value;

    // 等待现有读者完成
    while (Atomics.load(this.readers, 0) > 0) {
      Atomics.pause(10);  // 较长的暂停提示
    }

    // 切换活跃缓冲区
    Atomics.store(this.active, 0, inactiveIdx);
  }
}
```

#### 性能对比

```javascript
// 无 pause 的自旋锁
function badSpinLock() {
  while (locked) {
    // 全速自旋，100% CPU 占用
  }
}

// 有 pause 的自旋锁
function goodSpinLock() {
  while (locked) {
    Atomics.pause();  // 降低功耗，减少总线竞争
  }
}

// 基准测试代码
async function benchmark() {
  const iterations = 1000000;
  const workers = 4;

  console.time('with-pause');
  await runWithPause(iterations, workers);
  console.timeEnd('with-pause');

  console.time('without-pause');
  await runWithoutPause(iterations, workers);
  console.timeEnd('without-pause');
}
```

### 9.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 134+ | 完整支持 |
| Firefox | 136+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 24.0+ | 完整支持 |
| Deno | 2.2+ | 完整支持 |
| Bun | 1.2+ | 完整支持 |

**注意**: `Atomics.pause` 在单核系统或没有 SharedArrayBuffer 的环境中无效果。

### C.2 Explicit Resource Management 的 RAII 模式

### 10.1 规范定义

Explicit Resource Management（显式资源管理）引入了 `using` 声明和 `DisposableStack`/`AsyncDisposableStack` 类型，为 JavaScript 提供了类似 C++ RAII 的资源管理能力。

**规范位置**: ECMA-262 §14.5, §27.3

### 10.2 形式化语义

#### `using` 声明

```
UsingDeclaration:
  using BindingList;
  using await BindingList;

绑定语义：
1. 声明的变量被隐式标记为"需要自动清理"
2. 当代码块执行结束时（正常返回或抛出异常），
   自动调用资源的 [Symbol.dispose] 或 [Symbol.asyncDispose] 方法

控制流处理：
- 正常返回：按声明逆序调用 dispose
- 异常抛出：先 dispose 所有资源，再传播异常
- 异常中抛出新异常：通过 SuppressedError 聚合
```

#### Symbol.dispose 协议

```
Disposable 接口：
{
  [Symbol.dispose](): void
}

AsyncDisposable 接口：
{
  [Symbol.asyncDispose](): Promise<void>
}

dispose 方法语义：
1. 应幂等（多次调用无副作用）
2. 不应抛出异常（若可能，应捕获并静默处理）
3. 应尽可能完成清理（即使部分失败）
```

#### DisposableStack

```
DisposableStack 操作：

constructor():
  - 创建空的 dispose 栈

use(value):
  - 若 value 有 [Symbol.dispose]，压入栈
  - 返回 value（便于链式调用）

defer(onDispose):
  - 将回调函数压入栈

adopt(value, onDispose):
  - 将值和回调一起压入栈

move():
  - 返回新的 DisposableStack，包含当前栈的所有资源
  - 当前栈变为已释放状态

[Symbol.dispose]():
  - 按 LIFO 顺序调用所有 dispose 操作
  - 若任一抛出异常，继续执行后续 dispose
  - 若多个异常，用 SuppressedError 聚合
```

#### 异常处理语义

```
DisposeResources(资源列表):
1. 令 errors 为空列表
2. 按逆序遍历资源：
   a. 尝试调用 dispose
   b. 若抛出异常 e，将 e 加入 errors
3. 若 errors 为空，返回 NormalCompletion(empty)
4. 若 errors 只有一个，返回 ThrowCompletion(errors[0])
5. 否则:
   a. 令 error 为 errors[最后一个]
   b. 将其他错误作为 suppressed 附加到 error
   c. 返回 ThrowCompletion(error)

SuppressedError 结构：
{
  message: "多个异常被抑制",
  error: 最后一个异常,
  suppressed: [其他异常...]
}
```

### 10.3 使用示例

#### 基础 `using` 声明

```javascript
// 定义可清理资源
class FileHandle {
  constructor(path) {
    this.path = path;
    this.handle = openSync(path, 'r');
  }

  read() {
    return readSync(this.handle);
  }

  [Symbol.dispose]() {
    console.log(`Closing ${this.path}`);
    closeSync(this.handle);
  }
}

// 使用 using 自动管理资源
function processFile() {
  using file = new FileHandle('data.txt');

  const content = file.read();
  console.log(content);

  // 函数返回时自动调用 file[Symbol.dispose]()
}

// 即使抛出异常也会清理
function riskyProcess() {
  using file = new FileHandle('data.txt');

  if (Math.random() > 0.5) {
    throw new Error('Something went wrong');
  }

  return file.read();
  // 异常或返回都会触发 dispose
}
```

#### 多个资源管理

```javascript
function multiResource() {
  using conn = new DatabaseConnection();
  using tx = conn.beginTransaction();
  using file = new FileHandle('backup.sql');

  // 使用资源...
  const data = file.read();
  tx.execute(data);

  // 按声明逆序清理：file → tx → conn
}
```

#### 异步资源管理

```javascript
async function asyncProcess() {
  using await conn = await createAsyncConnection();
  using await file = await openAsyncFile('data.json');

  const data = await file.readJson();
  await conn.insert(data);

  // 按逆序异步清理：await file.dispose() → await conn.dispose()
}

// 混合同步和异步
async function mixed() {
  using syncResource = new SyncResource();
  using await asyncResource = new AsyncResource();

  // 清理顺序：先 await asyncResource，再 syncResource
}
```

#### DisposableStack 手动管理

```javascript
class CompositeResource {
  #stack = new DisposableStack();
  #file;
  #connection;

  constructor() {
    this.#file = this.#stack.use(new FileHandle('config.json'));
    this.#connection = this.#stack.use(new DatabaseConnection());
  }

  process() {
    const config = JSON.parse(this.#file.read());
    return this.#connection.query(config.query);
  }

  [Symbol.dispose]() {
    this.#stack.dispose();
  }
}

// 使用
using resource = new CompositeResource();
const result = resource.process();
```

#### defer 模式

```javascript
function complexOperation() {
  using stack = new DisposableStack();

  // 分配资源
  const buffer = allocateBuffer();
  stack.defer(() => freeBuffer(buffer));

  // 修改全局状态
  const prevState = setGlobalState('processing');
  stack.defer(() => setGlobalState(prevState));

  // 添加事件监听器
  const handler = () => console.log('event');
  element.addEventListener('click', handler);
  stack.defer(() => element.removeEventListener('click', handler));

  // 执行操作...

  // 返回时将按 LIFO 清理：移除监听器 → 恢复状态 → 释放缓冲区
}
```

#### adopt 模式

```javascript
class ManagedBuffer {
  #stack = new DisposableStack();
  #ptr;

  constructor(size) {
    this.#ptr = malloc(size);
    if (!this.#ptr) throw new Error('Allocation failed');

    // 采用原生指针并设置清理
    this.#stack.adopt(this.#ptr, ptr => free(ptr));
  }

  get pointer() {
    return this.#ptr;
  }

  [Symbol.dispose]() {
    this.#stack.dispose();
  }
}

// 使用
using buffer = new ManagedBuffer(1024);
nativeFunction(buffer.pointer);
```

#### 异常聚合

```javascript
class FaultyResource {
  #id;
  constructor(id) { this.#id = id; }

  [Symbol.dispose]() {
    throw new Error(`Dispose failed for ${this.#id}`);
  }
}

function multipleFailures() {
  using r1 = new FaultyResource(1);
  using r2 = new FaultyResource(2);
  using r3 = new FaultyResource(3);
}

try {
  multipleFailures();
} catch (e) {
  console.log(e.message);        // "Dispose failed for 3"
  console.log(e.suppressed);     // [Error("Dispose failed for 2"), Error("Dispose failed for 1")]
  console.log(e instanceof SuppressedError);  // true
}
```

#### 实际应用场景

```javascript
// 文件锁
class FileLock {
  #file;
  #released = false;

  static async acquire(path) {
    const lock = new FileLock();
    await lock.#acquire(path);
    return lock;
  }

  async #acquire(path) {
    this.#file = await open(path, 'r+');
    await this.#file.lock();
  }

  [Symbol.asyncDispose]() {
    if (this.#released) return;
    this.#released = true;
    return this.#file.unlock().then(() => this.#file.close());
  }
}

// 使用
async function atomicWrite(path, data) {
  using await lock = await FileLock.acquire(path);
  using await tmp = await FileHandle.createTemp();

  await tmp.write(data);
  await tmp.flush();
  await rename(tmp.path, path);

  // 自动解锁和清理临时文件
}
```

### 10.4 兼容性信息

| 运行时环境 | 支持版本 | 备注 |
|-----------|---------|------|
| Chrome | 134+ | 完整支持 |
| Firefox | 135+ | 完整支持 |
| Safari | 18.4+ | 完整支持 |
| Node.js | 22.0+ | 完整支持（需 `--experimental-strip-types`） |
| Node.js | 23.0+ | 完整支持 |
| Deno | 2.0+ | 完整支持 |
| Bun | 1.2+ | 完整支持 |

**TypeScript 支持**: TypeScript 5.2+ 原生支持 `using` 和 `await using`

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ESNext", "ESNext.Disposable"]
  }
}
```

---

## 附录

### A. 特性支持速查表

| 特性 | Chrome | Firefox | Safari | Node.js | 规范章节 |
|-----|--------|---------|--------|---------|---------|
| Iterator 辅助方法 | 122+ | 131+ | 18.4+ | 22.0+ | §27.1.4 |
| Set 数学方法 | 122+ | 127+ | 18.4+ | 22.0+ | §24.2.4 |
| Promise.try | 128+ | 134+ | 18.4+ | 23.0+ | §27.2.4.8 |
| RegExp.escape | 133+ | 134+ | 18.4+ | 24.0+ | §22.2.2.11 |
| RegExp 重复命名组 | 128+ | 131+ | 18.4+ | 23.0+ | §22.2.1 |
| RegExp 内联标志 | 133+ | 134+ | 18.4+ | 24.0+ | §22.2.1 |
| Float16Array | 131+ | 129+ | 18.4+ | 22.0+ | §24.3 |
| Import Attributes | 123+ | 127+ | 17.4+ | 22.0+ | §16.2.2 |
| Atomics.pause | 134+ | 136+ | 18.4+ | 24.0+ | §25.4.8 |
| Explicit Resource Management | 134+ | 135+ | 18.4+ | 23.0+ | §14.5 |

### B. 相关提案链接

- [Iterator Helpers](https://github.com/tc39/proposal-iterator-helpers)
- [Set Methods](https://github.com/tc39/proposal-set-methods)
- [Promise.try](https://github.com/tc39/proposal-promise-try)
- [RegExp Escaping](https://github.com/tc39/proposal-regex-escaping)
- [Duplicate Named Capture Groups](https://github.com/tc39/proposal-duplicate-named-capturing-groups)
- [RegExp Modifiers](https://github.com/tc39/proposal-regexp-modifiers)
- [Float16Array](https://github.com/tc39/proposal-float16array)
- [Import Attributes](https://github.com/tc39/proposal-import-attributes)

**Stage 3/4 预览（预计 ES2026）**

- [Atomics.pause](https://github.com/tc39/proposal-atomics-microwait)（Stage 3）
- [Explicit Resource Management](https://github.com/tc39/proposal-explicit-resource-management)（Stage 4，已纳入 ES2025）

### D. 参考文献

1. ECMA-262, 16th Edition, June 2025
2. IEEE 754-2008 Standard for Floating-Point Arithmetic
3. TC39 Meeting Notes (2023-2024)

---

*文档版本: 1.0.0*
*最后更新: 2026年4月*
*规范版本: ECMAScript® 2025*
