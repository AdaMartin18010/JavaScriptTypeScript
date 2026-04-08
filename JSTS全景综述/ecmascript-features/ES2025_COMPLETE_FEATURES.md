# ES2025 (ES16) 完整特性指南

> 本文档全面涵盖 ES2025 所有新特性的规范定义、形式化语义、使用示例及兼容性信息。
>
> 规范版本: ECMAScript® 2025 Language Specification
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
