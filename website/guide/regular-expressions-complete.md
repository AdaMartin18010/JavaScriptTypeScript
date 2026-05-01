---
title: JavaScript 正则表达式完全指南
description: "Awesome JS/TS Ecosystem 指南: JavaScript 正则表达式完全指南"
---

---
title: 'JavaScript 正则表达式完全指南'
---

# JavaScript 正则表达式完全指南

> 从入门到精通的正则表达式学习手册

---

## 目录

- [JavaScript 正则表达式完全指南](#javascript-正则表达式完全指南)
  - [目录](#目录)
  - [1. 正则表达式基础语法](#1-正则表达式基础语法)
    - [1.1 字符类](#11-字符类)
      - [基础字符类](#基础字符类)
      - [字符类语法详解](#字符类语法详解)
    - [1.2 量词](#12-量词)
      - [贪婪 vs 懒惰量词](#贪婪-vs-懒惰量词)
    - [1.3 锚点](#13-锚点)
    - [1.4 分组](#14-分组)
      - [分组的高级用法](#分组的高级用法)
  - [2. JavaScript RegExp 对象详解](#2-javascript-regexp-对象详解)
    - [2.1 创建 RegExp 对象](#21-创建-regexp-对象)
    - [2.2 RegExp 实例属性](#22-regexp-实例属性)
    - [2.3 模式验证与编译](#23-模式验证与编译)
  - [3. 高级特性](#3-高级特性)
    - [3.1 前瞻断言 (Lookahead)](#31-前瞻断言-lookahead)
    - [3.2 后顾断言 (Lookbehind)](#32-后顾断言-lookbehind)
    - [3.3 命名捕获组](#33-命名捕获组)
    - [3.4 Unicode 属性](#34-unicode-属性)
    - [3.5 高级分组特性](#35-高级分组特性)
  - [4. 正则表达式性能优化](#4-正则表达式性能优化)
    - [4.1 回溯灾难 (Catastrophic Backtracking)](#41-回溯灾难-catastrophic-backtracking)
      - [识别危险模式](#识别危险模式)
    - [4.2 优化策略](#42-优化策略)
      - [1. 使用原子组模拟](#1-使用原子组模拟)
      - [2. 具体化匹配](#2-具体化匹配)
      - [3. 优化量词使用](#3-优化量词使用)
    - [4.3 性能测试工具](#43-性能测试工具)
    - [4.4 正则表达式编译缓存](#44-正则表达式编译缓存)
  - [5. 常用正则模式](#5-常用正则模式)
    - [5.1 邮箱验证](#51-邮箱验证)
    - [5.2 URL 匹配](#52-url-匹配)
    - [5.3 日期匹配](#53-日期匹配)
    - [5.4 密码强度验证](#54-密码强度验证)
    - [5.5 其他常用模式](#55-其他常用模式)
  - [6. 正则表达式测试和调试工具](#6-正则表达式测试和调试工具)
    - [6.1 在线工具](#61-在线工具)
    - [6.2 代码中调试技巧](#62-代码中调试技巧)
    - [6.3 单元测试正则](#63-单元测试正则)
  - [7. RegExp 方法](#7-regexp-方法)
    - [7.1 RegExp.prototype.test()](#71-regexpprototypetest)
    - [7.2 RegExp.prototype.exec()](#72-regexpprototypeexec)
    - [7.3 String.prototype.match()](#73-stringprototypematch)
    - [7.4 String.prototype.matchAll()](#74-stringprototypematchall)
    - [7.5 String.prototype.replace()](#75-stringprototypereplace)
    - [7.6 String.prototype.split()](#76-stringprototypesplit)
    - [7.7 String.prototype.search()](#77-stringprototypesearch)
    - [7.8 方法对比与选择](#78-方法对比与选择)
  - [8. 标志详解](#8-标志详解)
    - [8.1 全局标志 g](#81-全局标志-g)
    - [8.2 忽略大小写 i](#82-忽略大小写-i)
    - [8.3 多行标志 m](#83-多行标志-m)
    - [8.4 点号匹配所有标志 s (dotAll)](#84-点号匹配所有标志-s-dotall)
    - [8.5 Unicode 标志 u](#85-unicode-标志-u)
    - [8.6 粘性标志 y](#86-粘性标志-y)
    - [8.7 索引标志 d (hasIndices)](#87-索引标志-d-hasindices)
    - [8.8 标志组合](#88-标志组合)
  - [9. 正则表达式安全性](#9-正则表达式安全性)
    - [9.1 ReDoS (正则表达式拒绝服务)](#91-redos-正则表达式拒绝服务)
    - [9.2 安全防护策略](#92-安全防护策略)
    - [9.3 安全正则最佳实践](#93-安全正则最佳实践)
  - [10. 实际案例](#10-实际案例)
    - [10.1 日志解析](#101-日志解析)
    - [10.2 数据提取](#102-数据提取)
    - [10.3 数据验证](#103-数据验证)
  - [附录](#附录)
    - [A. 快速参考表](#a-快速参考表)
    - [B. 性能优化清单](#b-性能优化清单)
    - [C. 常用模式速查](#c-常用模式速查)

---

## 1. 正则表达式基础语法

### 1.1 字符类

字符类用于匹配特定类型的字符。

#### 基础字符类

| 字符类 | 描述 | 示例 |
|--------|------|------|
| `.` | 匹配除换行符外的任意字符 | `/./` 匹配 "a", "1", "@" |
| `\d` | 匹配数字 [0-9] | `/\d/` 匹配 "5", "0" |
| `\D` | 匹配非数字 [^0-9] | `/\D/` 匹配 "a", "#" |
| `\w` | 匹配单词字符 [a-zA-Z0-9_] | `/\w/` 匹配 "A", "_" |
| `\W` | 匹配非单词字符 | `/\W/` 匹配 "@", " " |
| `\s` | 匹配空白字符 | `/\s/` 匹配空格, `\t` |
| `\S` | 匹配非空白字符 | `/\S/` 匹配 "a", "1" |

```javascript
// 字符类示例
const tests = [
  'Hello123',
  'user@email.com',
  '  spaces  '
];

// \d 匹配数字
const digits = 'Hello123'.match(/\d+/g);
console.log(digits); // ['123']

// \w 匹配单词字符
const words = 'user_name-2024'.match(/\w+/g);
console.log(words); // ['user_name', '2024']

// \s 匹配空白
const spaces = 'a b\tc'.match(/\s/g);
console.log(spaces); // [' ', '\t']

// 自定义字符类
const vowels = 'Hello World'.match(/[aeiou]/gi);
console.log(vowels); // ['e', 'o', 'o']

// 范围字符类
const hexDigits = '0x1F3A9'.match(/[0-9A-Fa-f]+/g);
console.log(hexDigits); // ['0', '1F3A9']
```

#### 字符类语法详解

```javascript
// 否定字符类 [^...]
const nonDigits = 'abc123'.match(/[^0-9]+/g);
console.log(nonDigits); // ['abc']

// 字符范围
const lowercase = 'Hello'.match(/[a-z]/g);
console.log(lowercase); // ['e', 'l', 'l', 'o']

const uppercase = 'Hello'.match(/[A-Z]/g);
console.log(uppercase); // ['H']

// 多个范围组合
const alphanumeric = 'Hello123'.match(/[a-zA-Z0-9]+/g);
console.log(alphanumeric); // ['Hello123']

// 特殊字符在字符类中
// 在 [] 中，大多数特殊字符失去特殊含义
const special = '[hello]'.match(/[[\]]/g);
console.log(special); // ['[', ']']

// 例外：^ 在开头表示否定，- 表示范围，\ 仍然转义
const tricky = '^a-b'.match(/[\^\-]/g);
console.log(tricky); // ['^', '-']
```

**性能分析：**

- 字符类比多个 `|` 分隔的选项更高效
- 预定义字符类 (`\d`, `\w`) 经过优化，比自定义范围更快
- 否定字符类 `[^...]` 可能稍慢，因为需要额外检查

**常见错误：**

```javascript
// ❌ 错误：忘记在字符类中转义特殊字符
/[$.]/.test('$'); // true（. 在 [] 中是普通字符）
/[0-9.]+/.test('1.2.3'); // true（预期只匹配数字）

// ✅ 正确：如果需要精确匹配，显式列出
/^[0-9]+$/.test('1.2.3'); // false

// ❌ 错误：混淆字符类和分组
/[abc]+/;  // 匹配 a, b, 或 c 中的一个或多个
/(abc)+/;  // 匹配 "abc" 作为一个整体，重复一次或多次
```

### 1.2 量词

量词指定前面元素出现的次数。

| 量词 | 描述 | 等价形式 |
|------|------|----------|
| `*` | 零次或多次 | `{0,}` |
| `+` | 一次或多次 | `{1,}` |
| `?` | 零次或一次 | `{0,1}` |
| `{n}` | 恰好 n 次 | - |
| `{n,}` | 至少 n 次 | - |
| `{n,m}` | 至少 n 次，至多 m 次 | - |

```javascript
// 贪婪量词示例
const text = 'aabbbcccc';

// * : 零次或多次
console.log(text.match(/a*/g));    // ['aa', '', '', '', '', '', '', '', '', '']

// + : 一次或多次
console.log(text.match(/b+/g));    // ['bbb']

// ? : 零次或一次
console.log('color colour'.match(/colou?r/g)); // ['color', 'colour']

// {n} : 恰好 n 次
console.log(text.match(/c{3}/g));  // ['ccc']

// {n,} : 至少 n 次
console.log(text.match(/c{2,}/g)); // ['cccc']

// {n,m} : n 到 m 次
console.log(text.match(/b{1,2}/g)); // ['bb', 'b']
```

#### 贪婪 vs 懒惰量词

```javascript
const html = '<div>content</div><span>more</span>';

// 贪婪量词（默认）：尽可能多地匹配
const greedy = html.match(/<.*>/g);
console.log(greedy); // ['<div>content</div><span>more</span>']

// 懒惰量词（? 后缀）：尽可能少地匹配
const lazy = html.match(/<.*?>/g);
console.log(lazy);   // ['<div>', '</div>', '<span>', '</span>']

// 各种懒惰量词
const test = 'aaaa';
console.log(test.match(/a*?/g));   // ['', '', '', '', '']
console.log(test.match(/a+?/g));   // ['a', 'a', 'a', 'a']
console.log(test.match(/a{2,}?/g)); // ['aa', 'aa']
```

**性能分析：**

- 贪婪量词通常更快，因为能更快完成匹配
- 懒惰量词在需要精确边界时很有用，但可能导致更多回溯
- `{n,m}` 比 `*` 和 `+` 更精确，可能更高效

**常见错误：**

```javascript
// ❌ 错误：用贪婪量词匹配嵌套结构
const nested = '<div><span>text</span></div>';
/<div>.*<\/div>/.test(nested); // 匹配整个字符串，不是第一个 div

// ✅ 正确：使用否定字符类或懒惰量词
/<div>[^<]*<\/div>/.test(nested);    // 匹配最内层
/<div>.*?<\/div>/.test(nested);      // 懒惰匹配

// ❌ 错误：量词后接可能导致歧义
/a{1,3}1/.test('aa1'); // 需要回溯

// ✅ 正确：明确边界
/a{1,3}(?=1)/.test('aa1'); // 使用前瞻，更清晰
```

### 1.3 锚点

锚点匹配位置而非字符。

| 锚点 | 描述 | 示例 |
|------|------|------|
| `^` | 字符串/行首 | `/^Hello/` |
| `$` | 字符串/行尾 | `/world$/` |
| `\b` | 单词边界 | `/\bword\b/` |
| `\B` | 非单词边界 | `/\Bword\B/` |

```javascript
// ^ 字符串开头
console.log(/^Hello/.test('Hello World')); // true
console.log(/^Hello/.test('Say Hello'));   // false

// $ 字符串结尾
console.log(/World$/.test('Hello World')); // true
console.log(/World$/.test('World Hello')); // false

// \b 单词边界
const text = 'word wording sword';
console.log(text.match(/\bword\b/g));  // ['word']
console.log(text.match(/\bword/g));    // ['word', 'word']

// \B 非单词边界
console.log(text.match(/\Bword\B/g));  // null（word 两端都是边界）
console.log('swordplay'.match(/\Bword\B/)); // ['word']

// 多行模式下的 ^ 和 $
const multiline = `first line
second line
third line`;

// 默认：^ 只匹配字符串开头
console.log(multiline.match(/^second/gm)); // ['second'] (多行模式)

// m 标志：^ 匹配每行开头
console.log(multiline.match(/^second/m));  // ['second']
```

**性能分析：**

- 锚点匹配通常很快，因为不需要检查字符
- 使用 `^` 和 `$` 可以从开头/结尾快速排除不匹配项
- `\b` 检查需要查看前后字符，稍慢一些

**常见错误：**

```javascript
// ❌ 错误：忘记在多行文本中使用 m 标志
const lines = 'line1\nline2';
/^line2/.test(lines);  // false
/^line2/m.test(lines); // true

// ❌ 错误：混淆 ^ 在字符类内外的含义
/^[abc]/.test('abc');  // 字符串以 a, b, 或 c 开头
/[^abc]/.test('abc');  // 匹配非 a, b, c 的字符

// ❌ 错误：忘记转义 $ 在替换中的特殊含义
'test'.replace(/$/, '!'); // 'test\n!' (在多行模式下)

// ✅ 正确：使用 \Z 或确保正确理解
'test'.replace(/\Z/, '!'); // 'test!'
```

### 1.4 分组

分组用于将多个元素视为一个单元，并捕获匹配内容。

```javascript
// 基础分组
const date = '2024-03-15';
const datePattern = /(\d{4})-(\d{2})-(\d{2})/;
const match = date.match(datePattern);

console.log(match[0]); // '2024-03-15' (完整匹配)
console.log(match[1]); // '2024' (第一组)
console.log(match[2]); // '03'   (第二组)
console.log(match[3]); // '15'   (第三组)

// 非捕获分组 (?:...)
const pattern = /(?:https?:\/\/)?(www\.)?example\.com/;
const urlMatch = 'www.example.com'.match(pattern);
console.log(urlMatch[1]); // 'www.' (只有 www 被捕获)

// 分组 + 量词
const repeated = 'abcabcabc'.match(/(abc)+/);
console.log(repeated[0]); // 'abcabcabc'
console.log(repeated[1]); // 'abc' (最后一组)

// 嵌套分组
const complex = 'a1b2'.match(/([a-z](\d))+/);
console.log(complex[0]); // 'a1b2'
console.log(complex[1]); // 'b2'  (外层最后一组)
console.log(complex[2]); // '2'   (内层最后一组)
```

#### 分组的高级用法

```javascript
// 分支 (Alternation) 与分组
const emailOrPhone = /^(?:[\w.]+@[\w.]+|\d{3}-\d{3}-\d{4})$/;
console.log(emailOrPhone.test('test@email.com')); // true
console.log(emailOrPhone.test('123-456-7890'));   // true

// 分组引用 (Backreference)
const doubled = /(\w+)\s+\1/;
console.log(doubled.test('hello hello')); // true
console.log(doubled.test('hello world')); // false

const html = '<div>content</div>';
const tagMatch = html.match(/<(\w+)>[^<]*<\/\1>/);
console.log(tagMatch[1]); // 'div'

// 分组在替换中的应用
const name = 'Doe, John';
const reordered = name.replace(/(\w+),\s*(\w+)/, '$2 $1');
console.log(reordered); // 'John Doe'

// 命名反向引用（ES2018）
const namedBackref = /(?<word>\w+)\s+\k<word>/;
console.log(namedBackref.test('test test')); // true
```

**性能分析：**

- 捕获分组需要存储匹配结果，有轻微性能开销
- 非捕获分组 `(?:...)` 更快，当不需要捕获时优先使用
- 嵌套分组会增加内存使用，复杂模式注意优化

**常见错误：**

```javascript
// ❌ 错误：混淆捕获和非捕获分组
/(abc)/.exec('abc');   // 捕获组，match[1] = 'abc'
/(?:abc)/.exec('abc'); // 非捕获组，match[1] = undefined

// ❌ 错误：反向引用超出范围
/(a)\2/.test('aa'); // \2 不存在，在某些引擎中是错误

// ❌ 错误：忘记分组优先级
/^a|b$/.test('b');  // true（匹配以 a 开头 或 以 b 结尾）
/^(a|b)$/.test('b'); // true（匹配只包含 a 或 b 的字符串）

// ✅ 正确：使用括号明确优先级
/^(?:a|b)+$/.test('abab'); // true
```

---

## 2. JavaScript RegExp 对象详解

### 2.1 创建 RegExp 对象

```javascript
// 方式1：字面量（推荐用于静态模式）
const pattern1 = /\d+/g;

// 方式2：构造函数（推荐用于动态模式）
const pattern2 = new RegExp('\\d+', 'g');

// 动态构建正则
const keyword = 'hello';
const dynamic = new RegExp(keyword, 'gi');
console.log(dynamic.test('HELLO World')); // true

// 转义特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const userInput = 'C++';
const safePattern = new RegExp(escapeRegExp(userInput));
console.log(safePattern.test('C++ is great')); // true
```

### 2.2 RegExp 实例属性

```javascript
const regex = /test/gim;

// 只读属性
console.log(regex.source);      // 'test' (模式字符串)
console.log(regex.flags);       // 'gim' (所有标志)
console.log(regex.global);      // true (g 标志)
console.log(regex.ignoreCase);  // true (i 标志)
console.log(regex.multiline);   // true (m 标志)
console.log(regex.dotAll);      // false (s 标志)
console.log(regex.unicode);     // false (u 标志)
console.log(regex.sticky);      // false (y 标志)
console.log(regex.hasIndices);  // false (d 标志)

// lastIndex（用于全局搜索）
const globalRegex = /a/g;
console.log(globalRegex.lastIndex); // 0

const str = 'banana';
globalRegex.test(str);
console.log(globalRegex.lastIndex); // 2

globalRegex.test(str);
console.log(globalRegex.lastIndex); // 4
```

### 2.3 模式验证与编译

```javascript
// 验证正则表达式语法
try {
  new RegExp('[invalid');
} catch (e) {
  console.log('Invalid regex:', e.message);
}

// 检查 RegExp 对象
console.log(/test/ instanceof RegExp); // true
console.log(RegExp.prototype.toString.call(/test/)); // '/test/'

// 复制正则表达式
const original = /pattern/gi;
const copy = new RegExp(original);
console.log(copy.flags); // 'gi'

// 修改标志创建新正则
const withDotAll = new RegExp(original.source, original.flags + 's');
console.log(withDotAll.flags); // 'gis'
```

**性能分析：**

- 字面量模式在脚本加载时编译，性能更好
- 构造函数模式在运行时编译，适合动态场景
- 每次使用 `new RegExp()` 都会创建新对象，循环中注意缓存

**常见错误：**

```javascript
// ❌ 错误：字符串中未正确转义反斜杠
new RegExp('\d+'); // 实际创建 /d+/（\d 被解释为转义序列）

// ✅ 正确：双重转义
new RegExp('\\d+'); // 创建 /\d+/

// ❌ 错误：在循环中重复创建相同的正则
for (let i = 0; i < 1000; i++) {
  /test/.test(str); // 每次迭代都创建新对象
}

// ✅ 正确：缓存正则
const cached = /test/;
for (let i = 0; i < 1000; i++) {
  cached.test(str);
}

// ❌ 错误：未重置 lastIndex
const g = /o/g;
console.log(g.test('hello')); // true
console.log(g.test('hello')); // true（lastIndex=4）
console.log(g.test('hello')); // false（lastIndex=5，超出范围）

// ✅ 正确：重置 lastIndex
g.lastIndex = 0;
console.log(g.test('hello')); // true
```

---

## 3. 高级特性

### 3.1 前瞻断言 (Lookahead)

前瞻用于匹配后面跟着特定内容的模式，但不消耗字符。

```javascript
// 正向前瞻 (?=...)
// 匹配后面跟着特定内容的模式
const price = 'Price: $100';
const amount = price.match(/\d+(?=\s*dollars)/);
console.log(amount); // null

const price2 = '100 dollars';
console.log(price2.match(/\d+(?=\s*dollars)/)); // ['100']

// 密码强度：必须包含数字
const hasNumber = /^(?=.*\d).+$/;
console.log(hasNumber.test('abc123')); // true
console.log(hasNumber.test('abcdef')); // false

// 负向前瞻 (?!...)
// 匹配后面不跟着特定内容的模式
const notFollowed = /\d+(?!\s*px)/;
console.log('100 px'.match(notFollowed));    // null
console.log('100 em'.match(notFollowed));    // ['100']

// 不匹配特定后缀的文件名
const files = ['file.txt', 'file.log', 'file.tmp'];
const notTmp = files.filter(f => /\.(?!tmp$)/.test(f));
console.log(notTmp); // ['file.txt', 'file.log']
```

### 3.2 后顾断言 (Lookbehind)

后顾用于匹配前面有特定内容的模式，但不消耗字符。（ES2018+）

```javascript
// 正向后顾 (?<=...)
// 匹配前面是特定内容的模式
const text = 'price: $100, amount: 200';
const dollars = text.match(/(?<=\$)\d+/g);
console.log(dollars); // ['100']

// 匹配特定前缀
const prefixed = '(content) [other]';
console.log(prefixed.match(/(?<=\()[^)]+(?=\))/g)); // ['content']

// 负向后顾 (?<!...)
// 匹配前面不是特定内容的模式
const mixed = '$100 200 €300';
const notPrefixed = mixed.match(/(?<!\$)\b\d+\b/g);
console.log(notPrefixed); // ['200']

// 实际应用：数字格式化
const numbers = '1000000 2500000';
const formatted = numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
console.log(formatted); // '1,000,000 2,500,000'
```

### 3.3 命名捕获组

命名捕获组允许为捕获组指定名称，便于引用。（ES2018+）

```javascript
// 基础命名捕获
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const match = '2024-03-15'.match(datePattern);

console.log(match.groups.year);  // '2024'
console.log(match.groups.month); // '03'
console.log(match.groups.day);   // '15'

// 解构使用
const { groups: { year, month, day } } = match;
console.log(`${day}/${month}/${year}`); // '15/03/2024'

// 命名捕获组在替换中的应用
const template = 'Date: {year}-{month}-{day}';
const replaced = '2024-03-15'.replace(
  datePattern,
  'Day: $<day>, Month: $<month>, Year: $<year>'
);
console.log(replaced); // 'Day: 15, Month: 03, Year: 2024'

// 使用函数替换
const fancyDate = '2024-03-15'.replace(datePattern, (...args) => {
  const { year, month, day } = args[args.length - 1];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return `${day} ${months[parseInt(month) - 1]} ${year}`;
});
console.log(fancyDate); // '15 Mar 2024'
```

### 3.4 Unicode 属性

Unicode 属性转义允许基于 Unicode 字符属性匹配。（ES2018+）

```javascript
// 需要 u 标志
const greek = /\p{Script=Greek}/u;
console.log(greek.test('α')); // true
console.log(greek.test('a')); // false

// 匹配所有字母（不仅是 ASCII）
const allLetters = /\p{Letter}+/u;
console.log(allLetters.test('Hello'));      // true
console.log(allLetters.test('Привет'));     // true (俄语)
console.log(allLetters.test('你好'));        // true (中文)
console.log(allLetters.test('こんにちは'));  // true (日语)

// 常用 Unicode 属性
const properties = {
  letter: /\p{L}/u,      // 所有字母
  digit: /\p{N}/u,       // 所有数字
  symbol: /\p{S}/u,      // 符号
  whitespace: /\p{Z}/u,  // 空白
  emoji: /\p{Emoji}/u    // 表情符号
};

// 匹配 emoji
console.log(properties.emoji.test('🎉')); // true

// 非 ASCII 数字
const nonAsciiDigit = /\p{Decimal_Number}/u;
console.log(nonAsciiDigit.test('٣')); // true (阿拉伯数字)

// 特定脚本
const scripts = {
  han: /\p{Script=Han}/u,      // 汉字
  hiragana: /\p{Script=Hiragana}/u, // 平假名
  katakana: /\p{Script=Katakana}/u, // 片假名
  latin: /\p{Script=Latin}/u   // 拉丁字母
};

console.log(scripts.han.test('中')); // true
console.log(scripts.hiragana.test('あ')); // true
```

### 3.5 高级分组特性

```javascript
// 原子组（使用前瞻模拟）
// 原子组一旦匹配成功就不会回溯
const atomic = /(?>a+)b/; // 其他语言的写法
// JavaScript 模拟：(？=(a+))\1
const simulatedAtomic = /(?=(a+))\1b/;

// 条件模式（JavaScript 原生不支持，但可模拟）
// 如果前面匹配了 a，则匹配 b，否则匹配 c
// /(a)?(?(1)b|c)/ 在其他语言中
// JavaScript: /(?:a(b)|[^a](c))/

// 分支重置组（JavaScript 不支持）
// 所有分支共享相同的组编号

// 递归模式（JavaScript 不支持）
// 匹配嵌套结构需要其他方法
```

**性能分析：**

- 前瞻/后顾通常有轻微性能开销，但避免了字符消耗
- 后顾在旧版浏览器中不支持，需要 polyfill
- 命名捕获组增加了内存使用，但提高了代码可读性
- Unicode 属性匹配比简单范围检查慢

**常见错误：**

```javascript
// ❌ 错误：忘记 u 标志
/\p{Letter}/.test('A');   // false（没有 u 标志）
/\p{Letter}/u.test('A');  // true

// ❌ 错误：后顾中的可变长度（在某些实现中不允许）
// /(?<=a+)b/; // 错误：后顾必须是固定长度

// ✅ 正确：固定长度后顾
/(?<=aa)b/; // OK
/(?<=a{2})b/; // OK

// ❌ 错误：命名捕获组语法错误
/(?<name>\w+)/; // 正确
/(?<'name'>\w+)/; // 也正确（引号可选）

// ❌ 错误：混合使用编号和命名引用
const mixed = /(?<name>\w+)\s+\1/; // \1 引用命名组（某些引擎）
// JavaScript 中 \1 仍然可用
```


---

## 4. 正则表达式性能优化

### 4.1 回溯灾难 (Catastrophic Backtracking)

回溯灾难发生在正则引擎尝试过多匹配路径时。

```javascript
// 灾难性回溯示例
const badPattern = /^(\w+\s?)*$/;
const testString = 'a '.repeat(30); // 60 个字符

console.time('bad');
badPattern.test(testString); // 极慢！
console.timeEnd('bad');

// 优化版本
const goodPattern = /^(\w+(?:\s\w+)*)?$/;
console.time('good');
goodPattern.test(testString);
console.timeEnd('good'); // 快得多
```

#### 识别危险模式

```javascript
// 危险模式特征：
// 1. 嵌套量词 + 重叠字符集
// /(a+)+/  - 嵌套 +
// /(a*)*/  - 嵌套 *
// /(\w+\s*)*/ - 嵌套量词，\w 和 \s 可能重叠

// 2. 交替中的量词
// /(a|aa)+/ - 重叠选项
// /(\w|\w\w)+/ - 重叠选项

// 3. 可选量词后跟类似模式
// /a?a+/ - 歧义匹配

// 测试灾难性回溯
function hasCatastrophicBacktracking(pattern, testString) {
  const start = performance.now();
  pattern.test(testString);
  const duration = performance.now() - start;
  return duration > 100; // 超过 100ms 视为问题
}

// 输入长度增加时指数级变慢
for (let n = 20; n <= 30; n++) {
  const str = 'a '.repeat(n);
  const pattern = /^(\w+\s?)*$/;
  const start = performance.now();
  pattern.test(str);
  console.log(`n=${n}: ${(performance.now() - start).toFixed(2)}ms`);
}
```

### 4.2 优化策略

#### 1. 使用原子组模拟

```javascript
// 问题模式
const problem = /"[^"]*"/; // 匹配引号字符串
// 对于 "aaaaaaaaaaaaaaaaaaaaaa（无结束引号）会回溯

// 优化：使用否定字符类
const optimized = /"[^"]*"/; // 已经是优化的

// 另一种优化：使用前瞻模拟原子组
const atomic = /(?="[^"]*")"[^"]*"/;

// 实际例子：匹配 HTML 标签
const htmlSlow = /<[^>]*>/; // 相对安全
const htmlFast = /<[^>]++>/; // 原子组版本（其他语言）
// JavaScript: /<[^>]*>/ 已经足够高效
```

#### 2. 具体化匹配

```javascript
// 避免过度通用
const vague = /.*:/;     // 太宽泛
const specific = /[^:]+:/; // 更具体，无回溯

// 例子：匹配 Email 用户名
const slow = /^.+@/;
const fast = /^[^@]+@/; // 更具体

// 使用字符类限制可能匹配
const dateSlow = /\d\d\/\d\d\/\d\d\d\d/;
const dateFast = /[0-3]\d\/[01]\d\/\d{4}/; // 更具体
```

#### 3. 优化量词使用

```javascript
// 优先使用占用量词（在支持的语言中）
// JavaScript 可以通过否定字符类模拟

// 贪婪 vs 懒惰选择
// 贪婪通常更快，除非需要最小匹配
const html = '<div>content</div>';

// 贪婪 - 快但可能过度匹配
const greedy = /<.*>/g;

// 懒惰 - 更准确但可能更慢
const lazy = /<.*?>/g;

// 优化：使用否定字符类
const optimized = /<[^>]*>/g; // 最快且准确
```

### 4.3 性能测试工具

```javascript
// 简单的正则性能测试器
function benchmarkRegex(pattern, testStrings, iterations = 1000) {
  const results = [];

  for (const [name, str] of testStrings) {
    const times = [];

    // 预热
    for (let i = 0; i < 100; i++) pattern.test(str);

    // 测试
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
      pattern.test(str);
    }
    const total = performance.now() - start;

    results.push({
      name,
      length: str.length,
      totalTime: total.toFixed(2),
      perOperation: (total / iterations * 1000).toFixed(3) + 'μs'
    });
  }

  console.table(results);
}

// 使用示例
const testCases = [
  ['short', 'hello world'],
  ['medium', 'a'.repeat(100)],
  ['long', 'a'.repeat(1000)]
];

benchmarkRegex(/\w+/, testCases);
```

### 4.4 正则表达式编译缓存

```javascript
// 内联字面量会被缓存
function testWithLiteral(str) {
  return /\d+/.test(str); // 同一个正则对象被重用
}

// 构造函数每次创建新对象
function testWithConstructor(str) {
  return new RegExp('\\d+').test(str); // 每次都编译
}

// 优化：缓存动态正则
const cache = new Map();

function getCachedPattern(pattern, flags) {
  const key = `${pattern}:${flags}`;
  if (!cache.has(key)) {
    cache.set(key, new RegExp(pattern, flags));
  }
  return cache.get(key);
}

function testWithCache(str, pattern, flags) {
  return getCachedPattern(pattern, flags).test(str);
}

// 测试
console.time('literal');
for (let i = 0; i < 100000; i++) testWithLiteral('123');
console.timeEnd('literal');

console.time('constructor');
for (let i = 0; i < 100000; i++) testWithConstructor('123');
console.timeEnd('constructor');

console.time('cached');
for (let i = 0; i < 100000; i++) testWithCache('123', '\\d+', '');
console.timeEnd('cached');
```

**性能分析：**

- 简单正则通常执行时间在微秒级
- 灾难性回溯可导致秒级甚至分钟级延迟
- 缓存动态正则可显著提升重复调用性能
- 字符类比点号 `.` 更高效

**常见错误：**

```javascript
// ❌ 错误：未限制输入长度导致 ReDoS
app.post('/validate', (req, res) => {
  const { email } = req.body;
  // 危险：用户控制的长字符串 + 复杂正则
  if (/^([a-z]+)*$/.test(email)) {
    // 处理
  }
});

// ✅ 正确：先验证长度
function safeValidate(input, pattern, maxLength = 1000) {
  if (input.length > maxLength) return false;
  return pattern.test(input);
}

// ❌ 错误：在循环中重复编译
for (const item of items) {
  if (new RegExp(pattern).test(item)) {
    // 处理
  }
}

// ✅ 正确：循环外编译
const regex = new RegExp(pattern);
for (const item of items) {
  if (regex.test(item)) {
    // 处理
  }
}
```

---

## 5. 常用正则模式

### 5.1 邮箱验证

```javascript
// 基础邮箱验证
const emailBasic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// RFC 5322 兼容版本（简化）
const emailRFC = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// 实用版本（推荐）
const emailPractical = /^[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

// 测试
const testEmails = [
  'user@example.com',      // ✓
  'user.name@example.co.uk', // ✓
  'user+tag@example.com',   // ✓
  'user@sub.example.com',   // ✓
  'invalid@.com',          // ✗
  '@example.com',          // ✗
  'user@',                 // ✗
  'user@com',              // ✗
  'user name@example.com'  // ✗
];

testEmails.forEach(email => {
  console.log(`${email}: ${emailPractical.test(email) ? '✓' : '✗'}`);
});

// 提取邮箱
const text = 'Contact: john@example.com or jane@company.co.uk';
const emails = text.match(/[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g);
console.log(emails);
```

**性能分析：**

- 基础版本最快，但可能过于宽松
- RFC 版本最准确，但复杂且慢
- 实用版本在准确性和性能间平衡

**常见错误：**

```javascript
// ❌ 错误：过于严格的验证
const tooStrict = /^[a-z]+@[a-z]+\.[a-z]{2,3}$/;
// 拒绝：大写、数字、+别名、子域名

// ❌ 错误：允许非法字符
const tooLoose = /.@./;
// 接受：" @ " 等无效邮箱
```

### 5.2 URL 匹配

```javascript
// 基础 URL 匹配
const urlBasic = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/;

// 更完整的版本
const urlComplete = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d{2,5})?(\/[^\s]*)?$/;

// 支持各种协议
const urlWithProtocols = /^(https?|ftp|file):\/\/[^\s/$.?#].[^\s]*$/i;

// 提取 URL
const text = 'Visit https://example.com or http://test.org/page?param=1';
const urls = text.match(/https?:\/\/[^\s]+/g);
console.log(urls);

// 域名提取
const domainPattern = /(?:https?:\/\/)?(?:www\.)?([^\/]+)/;
const domain = 'https://www.example.com/path'.match(domainPattern);
console.log(domain[1]); // 'www.example.com'

// 测试
const testUrls = [
  'https://example.com',
  'http://test.org:8080/path',
  'https://sub.domain.co.uk/path?query=1',
  'ftp://files.example.com',
  'not-a-url',
  'http://',
  'example.com' // 无协议
];

testUrls.forEach(url => {
  console.log(`${url}: ${urlBasic.test(url) ? '✓' : '✗'}`);
});
```

### 5.3 日期匹配

```javascript
// ISO 8601 日期 (YYYY-MM-DD)
const dateISO = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// 美国格式 (MM/DD/YYYY)
const dateUS = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;

// 欧洲格式 (DD-MM-YYYY)
const dateEU = /^(0[1-9]|[12]\d|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

// 灵活格式
const dateFlexible = /^(\d{1,4})[-\/.](\d{1,2})[-\/.](\d{1,4})$/;

// 带时间
const dateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:?\d{2})?$/;

// 提取日期组件
const dateStr = '2024-03-15';
const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
if (match) {
  const [, year, month, day] = match;
  console.log(`Year: ${year}, Month: ${month}, Day: ${day}`);
}

// 验证真实日期（考虑闰年等）
function isValidDate(dateString) {
  const pattern = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateString.match(pattern);
  if (!match) return false;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

console.log(isValidDate('2024-02-29')); // true (闰年)
console.log(isValidDate('2023-02-29')); // false (非闰年)
console.log(isValidDate('2024-13-01')); // false (无效月份)
```

### 5.4 密码强度验证

```javascript
// 密码强度要求：
// 1. 至少8个字符
// 2. 包含大写字母
// 3. 包含小写字母
// 4. 包含数字
// 5. 包含特殊字符

// 基础强度
const passwordMedium = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

// 强密码
const passwordStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// 超强密码（12位以上）
const passwordVeryStrong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;

// 分层验证（更灵活）
function checkPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    min12: password.length >= 12
  };

  const passed = Object.values(checks).filter(Boolean).length;

  if (passed <= 2) return { strength: 'weak', score: passed, checks };
  if (passed <= 4) return { strength: 'medium', score: passed, checks };
  return { strength: 'strong', score: passed, checks };
}

// 测试
const passwords = ['abc', 'Abc123', 'Abc123!@', 'Abc123!@#$%^&*', 'MyStr0ng!Pass'];
passwords.forEach(pwd => {
  const result = checkPasswordStrength(pwd);
  console.log(`${pwd}: ${result.strength} (${result.score}/6)`);
});

// 密码熵估算
function calculateEntropy(password) {
  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/\d/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  const entropy = Math.log2(Math.pow(poolSize, password.length));
  return {
    entropy: entropy.toFixed(2),
    rating: entropy < 28 ? 'Very Weak' :
            entropy < 36 ? 'Weak' :
            entropy < 60 ? 'Reasonable' :
            entropy < 80 ? 'Strong' : 'Very Strong'
  };
}
```

### 5.5 其他常用模式

```javascript
// 电话号码（国际格式）
const phoneInternational = /^\+(?:[0-9] ?){6,14}[0-9]$/;
// 美国格式
const phoneUS = /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/;

// IP 地址
const ipAddress = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// IPv6
const ipv6 = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

// 信用卡号（Luhn 算法验证需额外代码）
const creditCard = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11})$/;

// 用户名
const username = /^[a-zA-Z0-9_]{3,20}$/;

// 十六进制颜色
const hexColor = /^#(?:[0-9a-fA-F]{3}){1,2}$/;

// 单词边界（用于搜索）
function createWordPattern(word) {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
}

// slug/URL 友好字符串
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Base64
const base64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

// JWT Token
const jwt = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;

// 测试
console.log('Phone:', phoneUS.test('(123) 456-7890'));
console.log('IP:', ipAddress.test('192.168.1.1'));
console.log('Credit Card:', creditCard.test('4111111111111111')); // Visa test
console.log('Hex Color:', hexColor.test('#FF5733'));
console.log('Slug:', slugPattern.test('my-awesome-post'));
```

---

## 6. 正则表达式测试和调试工具

### 6.1 在线工具

```javascript
// 推荐的在线正则测试工具：

/**
 * 1. Regex101 (https://regex101.com/)
 *    - 支持 JavaScript、Python、PHP、PCRE
 *    - 实时解释正则结构
 *    - 匹配高亮和捕获组显示
 *    - 代码生成器
 *
 * 2. RegExr (https://regexr.com/)
 *    - 社区模式库
 *    - 详细参考文档
 *    - 替换功能测试
 *
 * 3. Debuggex (https://debuggex.com/)
 *    - 可视化正则表达式
 *    - 状态机图
 *    - 适合理解复杂正则
 *
 * 4. Regex-Vis (https://regex-vis.com/)
 *    - 正则表达式可视化
 *    - 编辑器友好
 *
 * 5. JavaScript RegExp 可视化
 *    - 专为 JS 正则优化
 */
```

### 6.2 代码中调试技巧

```javascript
// 1. 启用详细匹配信息
function debugRegex(pattern, str) {
  const regex = new RegExp(pattern.source, pattern.flags + 'd'); // d 标志用于索引
  const match = regex.exec(str);

  if (match) {
    console.log('Match:', match[0]);
    console.log('Index:', match.index);
    console.log('Groups:', match.groups);
    if (match.indices) {
      console.log('Indices:', match.indices);
    }
  } else {
    console.log('No match');
  }

  return match;
}

// 2. 分步构建正则
function buildAndTest() {
  const steps = [
    /^\d{4}/,           // 年
    /^\d{4}-/,          // 年-
    /^\d{4}-\d{2}/,     // 年-月
    /^\d{4}-\d{2}-/,    // 年-月-
    /^\d{4}-\d{2}-\d{2}/ // 完整日期
  ];

  const test = '2024-03-15';
  steps.forEach((step, i) => {
    console.log(`Step ${i + 1}: ${step.test(test)}`);
  });
}

// 3. 可视化匹配过程
function visualizeMatch(pattern, str) {
  const globalPattern = new RegExp(pattern.source, 'g' + pattern.flags.replace(/g/g, ''));
  let match;

  console.log(`Pattern: ${pattern}`);
  console.log(`String: "${str}"\n`);

  while ((match = globalPattern.exec(str)) !== null) {
    const before = str.slice(0, match.index);
    const matched = match[0];
    const after = str.slice(globalPattern.lastIndex);

    console.log(`Match at ${match.index}: "${matched}"`);
    console.log(`  ${before}[${matched}]${after}`);
    console.log('  Groups:', match.slice(1));
    console.log();
  }
}

visualizeMatch(/\w+/g, 'Hello World Test');

// 4. 性能分析
function profileRegex(pattern, str, iterations = 10000) {
  // 预热
  for (let i = 0; i < 100; i++) pattern.test(str);

  // 测试
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    pattern.test(str);
  }
  const duration = performance.now() - start;

  console.log(`Pattern: ${pattern.source}`);
  console.log(`Iterations: ${iterations.toLocaleString()}`);
  console.log(`Total time: ${duration.toFixed(2)}ms`);
  console.log(`Average: ${(duration / iterations * 1000).toFixed(3)}μs`);

  return duration;
}

// 5. 比较多个模式
function comparePatterns(tests, patterns) {
  const results = {};

  for (const [name, pattern] of patterns) {
    results[name] = { correct: 0, total: tests.length };

    for (const [input, expected] of tests) {
      const actual = pattern.test(input);
      if (actual === expected) {
        results[name].correct++;
      }
    }

    results[name].accuracy = (results[name].correct / results[name].total * 100).toFixed(1) + '%';
  }

  console.table(results);
}

// 使用示例
const emailTests = [
  ['test@example.com', true],
  ['invalid', false],
  ['@example.com', false],
  ['test@', false],
  ['test.user@example.co.uk', true]
];

const emailPatterns = [
  ['Simple', /^[^\s@]+@[^\s@]+\.[^\s@]+$/],
  ['RFC', /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/],
  ['Practical', /^[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/]
];

comparePatterns(emailTests, emailPatterns);
```

### 6.3 单元测试正则

```javascript
// 使用 Jest 风格的测试
const regexTests = {
  email: {
    pattern: /^[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
    tests: [
      { input: 'test@example.com', expect: true },
      { input: 'user.name@example.com', expect: true },
      { input: 'user+tag@example.com', expect: true },
      { input: 'invalid', expect: false },
      { input: '@example.com', expect: false },
      { input: 'test@', expect: false },
      { input: '', expect: false }
    ]
  },
  phone: {
    pattern: /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
    tests: [
      { input: '123-456-7890', expect: true },
      { input: '(123) 456-7890', expect: true },
      { input: '+1 123-456-7890', expect: true },
      { input: '1234567890', expect: true },
      { input: '123-45-6789', expect: false },
      { input: '123456789', expect: false }
    ]
  }
};

function runRegexTests() {
  let passed = 0;
  let failed = 0;

  for (const [name, { pattern, tests }] of Object.entries(regexTests)) {
    console.log(`\nTesting: ${name}`);

    for (const { input, expect: expected } of tests) {
      const result = pattern.test(input);
      const status = result === expected ? '✓' : '✗';

      if (result === expected) {
        passed++;
        console.log(`  ${status} "${input}"`);
      } else {
        failed++;
        console.log(`  ${status} "${input}" (expected ${expected}, got ${result})`);
      }
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

runRegexTests();
```


---

## 7. RegExp 方法

### 7.1 RegExp.prototype.test()

```javascript
// 基础用法
const pattern = /hello/i;
console.log(pattern.test('Hello World')); // true
console.log(pattern.test('Goodbye'));     // false

// 性能考虑：test() 比 exec() 更快（当不需要捕获时）
const emails = ['test@example.com', 'invalid', 'user@domain.org'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 高效过滤
const validEmails = emails.filter(e => emailPattern.test(e));

// 全局标志的注意事项
const globalPattern = /test/g;
console.log(globalPattern.test('test')); // true
console.log(globalPattern.test('test')); // false (lastIndex 重置)
console.log(globalPattern.test('test')); // true

// 安全使用：避免 lastIndex 问题
function safeTest(pattern, str) {
  const clone = new RegExp(pattern.source, pattern.flags.replace('g', ''));
  return clone.test(str);
}

// 批量测试
function batchTest(pattern, strings) {
  return strings.map(str => ({
    string: str,
    matches: pattern.test(str)
  }));
}
```

**性能分析：**

- `test()` 是检查匹配最快的方法
- 全局标志 `g` 会改变 `lastIndex`，影响连续调用
- 不需要捕获时优先使用 `test()` 而非 `exec()`

**常见错误：**

```javascript
// ❌ 错误：在循环中使用全局正则
const g = /\d/g;
const numbers = [];
let m;
while (m = g.test('12345')) { // 每次调用都改变 lastIndex
  numbers.push(m);
}
console.log(numbers); // [true, true, true] (只匹配了3次)

// ✅ 正确：使用 exec() 或去除 g 标志
const g2 = /\d/g;
const nums = [];
let match;
while ((match = g2.exec('12345')) !== null) {
  nums.push(match[0]);
}
console.log(nums); // ['1', '2', '3', '4', '5']
```

### 7.2 RegExp.prototype.exec()

```javascript
// 基础用法
const pattern = /(\w+)@(\w+)\.(\w+)/;
const match = pattern.exec('user@example.com');

console.log(match[0]);  // 'user@example.com' (完整匹配)
console.log(match[1]);  // 'user' (第一组)
console.log(match[2]);  // 'example' (第二组)
console.log(match[3]);  // 'com' (第三组)
console.log(match.index); // 0
console.log(match.input); // 'user@example.com'

// 全局搜索
const globalPattern = /\b\w{4}\b/g;
const text = 'This is a test of four letter words';
let result;
while ((result = globalPattern.exec(text)) !== null) {
  console.log(`Found "${result[0]}" at index ${result.index}`);
}

// 使用 lastIndex 控制搜索起点
const p = /test/g;
p.lastIndex = 5;
console.log(p.exec('test test test')); // 匹配第二个 "test"

// 命名捕获组
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const dateMatch = datePattern.exec('2024-03-15');
console.log(dateMatch.groups); // { year: '2024', month: '03', day: '15' }

// 索引信息（d 标志）
const indexed = /(\w+)(\d+)/d;
const indexedMatch = indexed.exec('user123');
console.log(indexedMatch.indices); // [[0, 7], [0, 4], [4, 7]]
```

**性能分析：**

- `exec()` 返回完整匹配信息，比 `test()` 慢
- 全局模式下，每次调用返回下一个匹配
- 非全局模式总是返回第一个匹配

**常见错误：**

```javascript
// ❌ 错误：忘记检查 null
const match = /test/.exec('hello');
console.log(match[0]); // TypeError: Cannot read property '0' of null

// ✅ 正确：检查返回值
const m = /test/.exec('hello');
if (m) {
  console.log(m[0]);
}

// ❌ 错误：全局模式下无限循环
const p = /a/g;
while (p.exec('aaa')) {
  p.lastIndex = 0; // 重置位置导致无限循环
}
```

### 7.3 String.prototype.match()

```javascript
// 非全局模式：返回与 exec() 类似的结果
const match1 = 'hello world'.match(/(\w+)\s(\w+)/);
console.log(match1[0]); // 'hello world'
console.log(match1[1]); // 'hello'
console.log(match1[2]); // 'world'

// 全局模式：返回所有匹配字符串
const match2 = 'hello world test'.match(/\w+/g);
console.log(match2); // ['hello', 'world', 'test']

// 全局模式下不返回捕获组
const match3 = 'a1 b2 c3'.match(/(\w)(\d)/g);
console.log(match3); // ['a1', 'b2', 'c3'] (不包含分组)

// 无匹配返回 null
const match4 = 'hello'.match(/xyz/);
console.log(match4); // null

// 安全使用
const safeMatch = (str, pattern) => str.match(pattern) || [];
console.log(safeMatch('hello', /xyz/)); // []

// matchAll() (ES2020) - 返回迭代器
const allMatches = [...'a1 b2 c3'.matchAll(/(\w)(\d)/g)];
console.log(allMatches[0]); // ['a1', 'a', '1', index: 0, ...]
console.log(allMatches[0][1]); // 'a' (捕获组)
```

### 7.4 String.prototype.matchAll()

```javascript
// 返回迭代器，包含所有匹配和捕获组
const text = '2024-03-15, 2023-12-25';
const dates = text.matchAll(/(\d{4})-(\d{2})-(\d{2})/g);

for (const match of dates) {
  console.log(`Full: ${match[0]}, Year: ${match[1]}`);
}

// 转换为数组
const allDates = [...text.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)];
console.log(allDates.length); // 2

// 使用解构
const results = [...text.matchAll(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/g)];
for (const { groups } of results) {
  console.log(`${groups.day}/${groups.month}/${groups.year}`);
}

// 与 map 结合
const years = [...text.matchAll(/\d{4}/g)].map(m => m[0]);
console.log(years); // ['2024', '2023']
```

### 7.5 String.prototype.replace()

```javascript
// 基础替换
const replaced = 'hello world'.replace('world', 'JavaScript');
console.log(replaced); // 'hello JavaScript'

// 使用正则
const noDigits = 'abc123def'.replace(/\d+/g, '');
console.log(noDigits); // 'abcdef'

// 替换函数
const doubled = '1 2 3'.replace(/\d/g, match => match * 2);
console.log(doubled); // '2 4 6'

// 使用捕获组
const swapped = 'Doe, John'.replace(/(\w+),\s*(\w+)/, '$2 $1');
console.log(swapped); // 'John Doe'

// 命名捕获组
const formatted = '2024-03-15'.replace(
  /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/,
  '$<day>/$<month>/$<year>'
);
console.log(formatted); // '15/03/2024'

// 替换函数完整参数
const detailed = 'a1b2c3'.replace(/([a-z])(\d)/g, (match, p1, p2, offset, string) => {
  return `[${p1}=${p2}@${offset}]`;
});
console.log(detailed); // '[a=1@0][b=2@2][c=3@4]'

// 高级：驼峰转下划线
const camelToSnake = 'camelCaseString'.replace(
  /[A-Z]/g,
  letter => `_${letter.toLowerCase()}`
);
console.log(camelToSnake); // '_camel_case_string'

// 高级：下划线转驼峰
const snakeToCamel = 'snake_case_string'.replace(
  /_([a-z])/g,
  (_, letter) => letter.toUpperCase()
);
console.log(snakeToCamel); // 'snakeCaseString'

// 条件替换
const conditional = 'price: 100, qty: 0'.replace(
  /(\w+):\s*(\d+)/g,
  (match, key, value) => `${key}: ${value > 0 ? value : 'N/A'}`
);
console.log(conditional); // 'price: 100, qty: N/A'
```

### 7.6 String.prototype.split()

```javascript
// 基础分割
const parts = 'a,b,c'.split(',');
console.log(parts); // ['a', 'b', 'c']

// 使用正则
const words = 'hello   world\ttest'.split(/\s+/);
console.log(words); // ['hello', 'world', 'test']

// 保留分隔符（使用捕获组）
const withDelimiters = 'a,b;c'.split(/([,;])/);
console.log(withDelimiters); // ['a', ',', 'b', ';', 'c']

// 限制分割数量
const limited = 'a,b,c,d,e'.split(/,/, 3);
console.log(limited); // ['a', 'b', 'c']

// 复杂分割
const complex = 'key1=value1;key2=value2;key3=value3';
const pairs = complex.split(/;\s*/);
const obj = Object.fromEntries(pairs.map(p => p.split('=')));
console.log(obj); // { key1: 'value1', key2: 'value2', key3: 'value3' }

// 分割 CSV（简单版本）
const csv = 'name,age,city\nJohn,30,NYC\nJane,25,LA';
const lines = csv.split(/\r?\n/);
const headers = lines[0].split(',');
const data = lines.slice(1).map(line => {
  const values = line.split(',');
  return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
});
console.log(data);
```

### 7.7 String.prototype.search()

```javascript
// 返回第一个匹配的索引，无匹配返回 -1
const index = 'hello world'.search(/world/);
console.log(index); // 6

const notFound = 'hello world'.search(/xyz/);
console.log(notFound); // -1

// 与 indexOf 比较
// search 支持正则，indexOf 只支持字符串
const regexIndex = 'price: $100'.search(/\$\d+/);
console.log(regexIndex); // 7

// 忽略 g 标志，总是返回第一个匹配
const first = 'test test test'.search(/test/g);
console.log(first); // 0

// 实用：检查并获取位置
function findPosition(str, pattern) {
  const pos = str.search(pattern);
  return pos >= 0 ? { found: true, position: pos } : { found: false };
}

console.log(findPosition('hello world', /world/));
// { found: true, position: 6 }
```

### 7.8 方法对比与选择

```javascript
// 方法选择指南：

// 1. 只检查是否存在 → test()
if (/pattern/.test(str)) { /* ... */ }

// 2. 获取第一个匹配详情 → exec() 或 match()（非全局）
const match = /pattern/.exec(str);

// 3. 获取所有匹配（不需要捕获组）→ match()（全局）
const all = str.match(/pattern/g);

// 4. 获取所有匹配（需要捕获组）→ matchAll()
for (const m of str.matchAll(/pattern/g)) { /* ... */ }

// 5. 替换内容 → replace()
const newStr = str.replace(/pattern/g, replacement);

// 6. 分割字符串 → split()
const parts = str.split(/pattern/);

// 7. 查找位置 → search()
const pos = str.search(/pattern/);

// 8. 查找索引 → indexOf()（简单字符串）
const idx = str.indexOf('substring');

// 性能对比
function compareMethods() {
  const str = 'The quick brown fox jumps over the lazy dog';
  const pattern = /\w{5}/g;
  const iterations = 100000;

  // test
  let start = performance.now();
  for (let i = 0; i < iterations; i++) pattern.test(str);
  console.log('test:', (performance.now() - start).toFixed(2), 'ms');

  // exec
  pattern.lastIndex = 0;
  start = performance.now();
  for (let i = 0; i < iterations; i++) {
    pattern.lastIndex = 0;
    pattern.exec(str);
  }
  console.log('exec:', (performance.now() - start).toFixed(2), 'ms');

  // match
  start = performance.now();
  for (let i = 0; i < iterations; i++) str.match(pattern);
  console.log('match:', (performance.now() - start).toFixed(2), 'ms');

  // search
  const singlePattern = /\w{5}/;
  start = performance.now();
  for (let i = 0; i < iterations; i++) str.search(singlePattern);
  console.log('search:', (performance.now() - start).toFixed(2), 'ms');
}

compareMethods();
```

**性能分析：**

- `test()` 最快，适合存在性检查
- `search()` 比 `indexOf()` 慢，但支持正则
- `matchAll()` 比多次 `exec()` 更方便，但性能相似
- `replace()` 带函数比带字符串慢

**常见错误：**

```javascript
// ❌ 错误：replace 只替换第一个（无 g 标志）
'aaa'.replace(/a/, 'b'); // 'baa'

// ✅ 正确：添加 g 标志
'aaa'.replace(/a/g, 'b'); // 'bbb'

// ❌ 错误：split 结果包含空字符串
',a,,b,'.split(','); // ['', 'a', '', 'b', '']

// ✅ 正确：过滤空字符串
',a,,b,'.split(',').filter(Boolean); // ['a', 'b']

// ❌ 错误：matchAll 后直接使用
const matches = 'a1b2'.matchAll(/\d/g);
console.log(matches.length); // undefined (是迭代器)

// ✅ 正确：转换为数组
const matchesArray = [...'a1b2'.matchAll(/\d/g)];
console.log(matchesArray.length); // 2
```

---

## 8. 标志详解

### 8.1 全局标志 g

```javascript
// 查找所有匹配，而非仅第一个
const str = 'test test test';

// 无 g 标志
console.log(str.match(/test/)); // ['test', index: 0, ...]

// 有 g 标志
console.log(str.match(/test/g)); // ['test', 'test', 'test']

// 影响的方法
const pattern = /test/g;

// test() - 受 lastIndex 影响
console.log(pattern.test(str)); // true
console.log(pattern.lastIndex); // 4
console.log(pattern.test(str)); // true (第二个)

// exec() - 受 lastIndex 影响
pattern.lastIndex = 0;
console.log(pattern.exec(str)); // 第一个 match
console.log(pattern.exec(str)); // 第二个 match

// match() - 返回所有匹配
console.log(str.match(/test/g)); // 所有匹配

// matchAll() - 必须带 g 标志
[...str.matchAll(/test/g)]; // OK
// [...str.matchAll(/test/)]; // TypeError

// 重置 lastIndex
function resetLastIndex(pattern) {
  pattern.lastIndex = 0;
  return pattern;
}
```

### 8.2 忽略大小写 i

```javascript
// 不区分大小写匹配
console.log(/hello/i.test('HELLO')); // true
console.log(/hello/i.test('Hello')); // true
console.log(/hello/i.test('hElLo')); // true

// 与字符类结合
console.log(/[a-z]/i.test('A')); // true

// Unicode 大小写（需要 u 标志）
console.log(/straße/i.test('STRASSE')); // true
console.log(/straße/iu.test('STRASSE')); // true（更准确）

// 实际应用
function caseInsensitiveSearch(text, keyword) {
  const pattern = new RegExp(escapeRegExp(keyword), 'gi');
  return text.match(pattern) || [];
}
```

### 8.3 多行标志 m

```javascript
// ^ 和 $ 匹配每行的开始和结束
const multiline = `first line
second line
third line`;

// 无 m 标志 - ^ 只匹配字符串开头
console.log(multiline.match(/^second/)); // null

// 有 m 标志 - ^ 匹配每行开头
console.log(multiline.match(/^second/m)); // ['second']
console.log(multiline.match(/^\w+/gm)); // ['first', 'second', 'third']

// 匹配行尾
console.log(multiline.match(/line$/gm)); // ['line', 'line', 'line']

// 实际应用：提取每行的键值对
const config = `name=John
age=30
city=NYC`;

const pairs = config.match(/^\w+=.+$/gm);
console.log(pairs); // ['name=John', 'age=30', 'city=NYC']
```

### 8.4 点号匹配所有标志 s (dotAll)

```javascript
// 默认：. 不匹配换行符
console.log(/a.b/.test('a\nb')); // false

// s 标志：. 匹配所有字符包括换行
console.log(/a.b/s.test('a\nb')); // true

// 替代方案（旧浏览器）
console.log(/a[\s\S]b/.test('a\nb')); // true

// 实际应用：匹配多行注释
const css = `
  /* This is a
     multiline comment */
  .class { color: red; }
`;

const comment = css.match(/\/\*[\s\S]*?\*\//);
console.log(comment[0]);

// 使用 s 标志更简洁
const comment2 = css.match(/\/\*.*?\*\//s);
console.log(comment2[0]);
```

### 8.5 Unicode 标志 u

```javascript
// 启用 Unicode 感知
console.log(/\u{1F600}/.test('😀')); // false
console.log(/\u{1F600}/u.test('😀')); // true

// Unicode 属性转义
console.log(/\p{Emoji}/u.test('🎉')); // true
console.log(/\p{Letter}/u.test('ñ')); // true
console.log(/\p{Script=Han}/u.test('中')); // true

// 正确处理 astral symbols
const str = '𠮷野家'; // 第一个字符是 surrogate pair
console.log(/^./.test(str)); // false（不匹配完整字符）
console.log(/^./u.test(str)); // true（正确匹配）

// 量词和 Unicode
console.log(/👨‍👩‍👧‍👦{2}/.test('👨‍👩‍👧‍👦👨‍👩‍👧‍👦')); // 可能出错
console.log(/👨‍👩‍👧‍👦{2}/u.test('👨‍👩‍👧‍👦👨‍👩‍👧‍👦')); // 更安全
```

### 8.6 粘性标志 y

```javascript
// 从 lastIndex 开始匹配，不跳过任何字符
const pattern = /\d+/y;
const str = '123abc456';

pattern.lastIndex = 0;
console.log(pattern.exec(str)); // ['123']
console.log(pattern.lastIndex); // 3

// 下一次从索引 3 开始，但那里是 'a'
console.log(pattern.exec(str)); // null（严格匹配失败）
console.log(pattern.lastIndex); // 0（失败后重置）

// 对比 g 标志
const globalPattern = /\d+/g;
globalPattern.lastIndex = 3;
console.log(globalPattern.exec(str)); // ['456']（g 标志会跳过非匹配字符）

// 实际应用：词法分析器
function tokenize(input) {
  const tokens = [];
  const patterns = {
    NUMBER: /\d+/y,
    WORD: /[a-zA-Z]+/y,
    SPACE: /\s+/y
  };

  let pos = 0;
  while (pos < input.length) {
    let matched = false;

    for (const [type, pattern] of Object.entries(patterns)) {
      pattern.lastIndex = pos;
      const match = pattern.exec(input);

      if (match) {
        tokens.push({ type, value: match[0] });
        pos = pattern.lastIndex;
        matched = true;
        break;
      }
    }

    if (!matched) {
      throw new Error(`Unexpected character at ${pos}: ${input[pos]}`);
    }
  }

  return tokens;
}

console.log(tokenize('123 hello 456'));
// [{type: 'NUMBER', value: '123'}, {type: 'SPACE', value: ' '},
//  {type: 'WORD', value: 'hello'}, {type: 'SPACE', value: ' '},
//  {type: 'NUMBER', value: '456'}]
```

### 8.7 索引标志 d (hasIndices)

```javascript
// 添加匹配索引信息
const pattern = /(\w+)(\d+)/d;
const match = pattern.exec('user123');

console.log(match.indices);
// [
//   [0, 7],    // 完整匹配
//   [0, 4],    // 第一组
//   [4, 7]     // 第二组
// ]

// 获取每个捕获的起止位置
const start = match.indices[1][0]; // 0
const end = match.indices[1][1];   // 4

// 高亮匹配文本
function highlightMatches(str, pattern) {
  const matches = [...str.matchAll(pattern)];
  let result = str;
  let offset = 0;

  for (const match of matches) {
    if (!match.indices) continue;

    const [start, end] = match.indices[0];
    const adjustedStart = start + offset;
    const adjustedEnd = end + offset;

    const before = result.slice(0, adjustedStart);
    const matched = result.slice(adjustedStart, adjustedEnd);
    const after = result.slice(adjustedEnd);

    result = `${before}[${matched}]${after}`;
    offset += 2; // 添加的括号
  }

  return result;
}

console.log(highlightMatches('user123 test456', /\w+\d+/gd));
// '[user123] [test456]'
```

### 8.8 标志组合

```javascript
// 常用组合
const commonCombinations = {
  // 全局 + 忽略大小写：搜索所有匹配，不区分大小写
  gi: /pattern/gi,

  // 全局 + 多行：搜索所有行的匹配
  gm: /pattern/gm,

  // Unicode + 忽略大小写：正确处理 Unicode 大小写
  iu: /pattern/iu,

  // 全部启用：最全面的匹配
  giuy: /pattern/gimsuy,

  // dotAll + 全局：跨行匹配所有内容
  gs: /pattern/gs
};

// 检查标志
function checkFlags(pattern) {
  return {
    global: pattern.global,
    ignoreCase: pattern.ignoreCase,
    multiline: pattern.multiline,
    dotAll: pattern.dotAll,
    unicode: pattern.unicode,
    sticky: pattern.sticky,
    hasIndices: pattern.hasIndices
  };
}

console.log(checkFlags(/test/gimsuy));

// 动态添加标志
function addFlags(pattern, ...flags) {
  const newFlags = [...new Set(pattern.flags + flags.join(''))].join('');
  return new RegExp(pattern.source, newFlags);
}

console.log(addFlags(/test/, 'g', 'i').flags); // 'gi'
```

**性能分析：**

- `g` 标志会增加内存使用（存储所有匹配）
- `i` 标志会降低匹配速度（需要大小写转换）
- `u` 标志增加 Unicode 处理开销
- `d` 标志存储额外索引信息

**常见错误：**

```javascript
// ❌ 错误：忘记 y 标志会重置 lastIndex
const y = /test/y;
y.lastIndex = 5;
y.test('test test'); // false（从位置5开始，匹配失败，重置为0）

// ✅ 正确：检查匹配结果再使用 lastIndex
if (y.test(str)) {
  console.log(y.lastIndex); // 使用更新后的位置
}

// ❌ 错误：i 标志不适用于某些 Unicode 字符
console.log(/ß/i.test('SS')); // false
console.log(/ß/iu.test('SS')); // true（需要 u 标志）

// ❌ 错误：s 和 m 标志混淆
// s: 点号匹配换行
// m: ^$ 匹配行首行尾
```

---

## 9. 正则表达式安全性

### 9.1 ReDoS (正则表达式拒绝服务)

```javascript
// ReDoS 攻击原理：利用灾难性回溯导致 CPU 耗尽

// 危险模式示例
const dangerousPatterns = [
  /(a+)+$/,           // 嵌套量词
  /(a*)*$/,           // 嵌套量词
  /(a|aa)+$/,         // 重叠选项
  /([a-zA-Z]+)*$/,    // 嵌套量词
  /(a|a?)+$/,         // 歧义量词
  /(\w+\s?)*$/,       // 嵌套量词
];

// 攻击载荷：精心构造的输入
function createAttackString(pattern, length = 30) {
  // 通常使用长字符串 + 不匹配的结尾
  return 'a'.repeat(length) + '!'; // '!' 导致不匹配，触发回溯
}

// 测试 ReDoS
function testReDoS(pattern, maxTime = 1000) {
  const results = [];

  for (let n = 10; n <= 35; n += 5) {
    const input = createAttackString(pattern, n);
    const start = performance.now();

    pattern.test(input);

    const duration = performance.now() - start;
    results.push({ length: n, time: duration.toFixed(2) + 'ms' });

    if (duration > maxTime) {
      console.log(`ReDoS detected at length ${n}`);
      break;
    }
  }

  return results;
}

// 检测危险模式
function isPotentiallyDangerous(pattern) {
  const source = pattern.source;

  // 检测危险特征
  const dangerousFeatures = [
    /\([^)]*\+[^)]*\)\+/,    // (a+)+ 形式
    /\([^)]*\*[^)]*\)\*/,    // (a*)* 形式
    /\([^)]*\|[^)]*\)\+.*\|/, // (a|b)+ 且选项重叠
    /\([^)]*\?\)\+/,          // (a?)+ 形式
  ];

  return dangerousFeatures.some(f => f.test(source));
}

console.log(isPotentiallyDangerous(/(a+)+/)); // true
console.log(isPotentiallyDangerous(/\d+/));   // false
```

### 9.2 安全防护策略

```javascript
// 1. 输入长度限制
function safeTest(pattern, input, maxLength = 1000) {
  if (input.length > maxLength) {
    return { error: 'Input too long', safe: false };
  }
  return { result: pattern.test(input), safe: true };
}

// 2. 执行超时
async function testWithTimeout(pattern, input, timeout = 100) {
  return Promise.race([
    new Promise(resolve => {
      resolve(pattern.test(input));
    }),
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeout);
    })
  ]);
}

// 3. 使用 ReDoS 安全的替代方案
const safeAlternatives = {
  // 危险
  dangerous: /^(\w+\s?)*$/,

  // 安全替代
  safe: /^(?:\w+(?:\s\w+)*)?$/
};

// 4. 正则防火墙
class RegexFirewall {
  constructor(options = {}) {
    this.maxLength = options.maxLength || 1000;
    this.maxTime = options.maxTime || 100;
    this.dangerousCache = new Set();
  }

  isDangerous(pattern) {
    const key = pattern.source;
    if (this.dangerousCache.has(key)) return true;

    const dangerous = this.analyzePattern(pattern);
    if (dangerous) this.dangerousCache.add(key);
    return dangerous;
  }

  analyzePattern(pattern) {
    const source = pattern.source;

    // 检测嵌套量词
    if (/\([^)]*[+*?][^)]*\)[+*?]/.test(source)) {
      // 进一步分析是否有重叠字符集
      return true;
    }

    return false;
  }

  safeTest(pattern, input) {
    // 检查长度
    if (input.length > this.maxLength) {
      throw new Error('Input exceeds maximum length');
    }

    // 检查危险模式
    if (this.isDangerous(pattern)) {
      console.warn('Potentially dangerous pattern detected');
    }

    // 执行测试
    const start = performance.now();
    const result = pattern.test(input);
    const duration = performance.now() - start;

    if (duration > this.maxTime) {
      throw new Error(`Regex execution timeout: ${duration.toFixed(2)}ms`);
    }

    return result;
  }
}

// 使用
const firewall = new RegexFirewall({ maxLength: 500, maxTime: 50 });

// 5. 安全的正则模式库
const safePatterns = {
  email: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,

  url: /^https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/,

  alphanumeric: /^[a-zA-Z0-9]+$/,

  // 严格限制长度
  username: /^[a-zA-Z0-9_]{3,20}$/
};

// 验证模式安全性
function validatePatternSafety(pattern, testCases) {
  const results = {
    safe: true,
    issues: [],
    tests: []
  };

  // 检查模式本身
  if (/\([^)]*[+*][^)]*\)[+*]/.test(pattern.source)) {
    results.issues.push('Nested quantifiers detected');
    results.safe = false;
  }

  // 测试各种长度输入
  for (const length of [10, 100, 500, 1000]) {
    const input = 'a'.repeat(length);
    const start = performance.now();
    pattern.test(input);
    const time = performance.now() - start;

    results.tests.push({ length, time: time.toFixed(2) + 'ms' });

    if (time > 100) {
      results.issues.push(`Slow at length ${length}: ${time.toFixed(2)}ms`);
      results.safe = false;
    }
  }

  return results;
}
```

### 9.3 安全正则最佳实践

```javascript
// 1. 避免危险模式
// ❌ 避免：
const badPatterns = {
  groupStar: /(a*)*/,        // 嵌套 *
  groupPlus: /(a+)+/,        // 嵌套 +
  optionalPlus: /(a?)+/,     // ? 和 +
  alternationOverlap: /(a|aa)+/, // 重叠选项
  nestedGroups: /((a+))+/,   // 嵌套分组
};

// ✅ 使用：
const goodPatterns = {
  simple: /a*/,              // 简单量词
  specific: /a{1,10}/,       // 具体限制
  nonCapture: /(?:a+)*/,     // 非捕获组
  atomic: /(?>a+)b/,         // 原子组（其他语言）
};

// 2. 在服务器端验证时设置超时
// Node.js 示例
const { Worker } = require('worker_threads');

function testRegexWithWorker(pattern, input, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`
      const { parentPort } = require('worker_threads');
      parentPort.once('message', ({ pattern, input }) => {
        const regex = new RegExp(pattern.source, pattern.flags);
        const result = regex.test(input);
        parentPort.postMessage({ result });
      });
    `, { eval: true });

    const timer = setTimeout(() => {
      worker.terminate();
      reject(new Error('Regex timeout'));
    }, timeout);

    worker.once('message', (result) => {
      clearTimeout(timer);
      worker.terminate();
      resolve(result);
    });

    worker.postMessage({ pattern: { source: pattern.source, flags: pattern.flags }, input });
  });
}

// 3. 输入验证
function sanitizeInput(input, type = 'string') {
  const limits = {
    string: 1000,
    email: 254,  // RFC 5321
    url: 2048,
    username: 30
  };

  const limit = limits[type] || limits.string;

  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  if (input.length > limit) {
    throw new Error(`Input exceeds maximum length of ${limit}`);
  }

  // 移除或转义危险字符
  return input.slice(0, limit);
}

// 4. 使用专门的验证库
// 推荐：validator.js 代替复杂正则
// const validator = require('validator');
// validator.isEmail(email);
// validator.isURL(url);
// validator.isAlphanumeric(str);

// 5. 正则审计清单
const securityChecklist = {
  beforeDeploy: [
    '检查是否有嵌套量词',
    '测试极端长度输入',
    '设置执行超时',
    '限制输入长度',
    '监控正则执行时间',
    '使用安全的替代方案'
  ],

  warningSigns: [
    '模式包含 (a+)+ 形式',
    '输入长度无限制',
    '用户可控制正则模式',
    '没有执行超时',
    '复杂的嵌套分组'
  ]
};
```

**性能分析：**

- 安全验证增加约 10-20% 开销
- Worker 线程方式有创建开销，仅用于可疑模式
- 简单长度检查几乎无性能影响

**常见错误：**

```javascript
// ❌ 错误：直接使用用户输入构建正则
const userPattern = req.body.pattern;
const regex = new RegExp(userPattern); // 危险！

// ✅ 正确：使用白名单
const allowedPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^\d{3}-\d{3}-\d{4}$/
};
const pattern = allowedPatterns[req.body.type];

// ❌ 错误：无限制的正则匹配
function validate(input) {
  return /complex pattern/.test(input); // 可能被攻击
}

// ✅ 正确：添加防护
function validateSafe(input) {
  if (input.length > 1000) return false;

  const start = performance.now();
  const result = /complex pattern/.test(input);

  if (performance.now() - start > 100) {
    console.warn('Potential ReDoS attack');
    return false;
  }

  return result;
}
```


---

## 10. 实际案例

### 10.1 日志解析

```javascript
// 常见日志格式解析

// 1. Apache/Nginx 访问日志
// 127.0.0.1 - - [24/Mar/2024:14:32:10 +0800] "GET /index.html HTTP/1.1" 200 1234
const apacheLogPattern = /^(?<ip>\S+)\s+\S+\s+(?<user>\S+)\s+\[(?<time>[^\]]+)\]\s+"(?<method>\S+)\s+(?<path>\S+)\s+(?<protocol>[^"]+)"\s+(?<status>\d+)\s+(?<size>\d+|-)/;

function parseApacheLog(line) {
  const match = line.match(apacheLogPattern);
  if (!match) return null;

  return {
    ip: match.groups.ip,
    user: match.groups.user === '-' ? null : match.groups.user,
    timestamp: parseApacheTime(match.groups.time),
    method: match.groups.method,
    path: match.groups.path,
    protocol: match.groups.protocol,
    status: parseInt(match.groups.status),
    size: match.groups.size === '-' ? 0 : parseInt(match.groups.size)
  };
}

function parseApacheTime(timeStr) {
  // 24/Mar/2024:14:32:10 +0800
  const match = timeStr.match(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}):(\d{2}):(\d{2})\s+([+-]\d{4})/);
  if (!match) return null;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [, day, month, year, hour, minute, second, zone] = match;

  return new Date(`${year}-${months.indexOf(month) + 1}-${day}T${hour}:${minute}:${second}${zone.slice(0, 3)}:${zone.slice(3)}`);
}

// 2. 结构化日志 (JSON)
// {"timestamp":"2024-03-24T14:32:10Z","level":"ERROR","message":"Connection failed","service":"api"}
// 使用 JSON.parse 更高效，但正则可用于提取特定字段
const jsonLogPattern = /"timestamp":"([^"]+)".*?"level":"([^"]+)".*?"message":"([^"]+)".*?"service":"([^"]+)"/;

// 3. 系统日志 (syslog)
// Mar 24 14:32:10 server sshd[1234]: Accepted password for user from 192.168.1.1 port 54321
const syslogPattern = /^(?<month>\w{3})\s+(?<day>\d{1,2})\s+(?<time>\d{2}:\d{2}:\d{2})\s+(?<host>\S+)\s+(?<process>[^[]+)(?:\[(?<pid>\d+)\])?:\s+(?<message>.+)$/;

// 4. 应用错误日志
// [2024-03-24 14:32:10] [ERROR] [module:auth] User login failed: invalid credentials
const appLogPattern = /\[(?<timestamp>\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\]\s+\[(?<level>\w+)\]\s+\[(?<module>[^\]]+)\]\s+(?<message>.+)/;

// 日志分析器类
class LogAnalyzer {
  constructor() {
    this.patterns = {
      apache: apacheLogPattern,
      syslog: syslogPattern,
      app: appLogPattern
    };
    this.stats = {
      total: 0,
      parsed: 0,
      failed: 0,
      byLevel: {},
      byStatus: {}
    };
  }

  parseLine(line, type = 'auto') {
    this.stats.total++;

    let pattern;
    if (type === 'auto') {
      pattern = this.detectFormat(line);
    } else {
      pattern = this.patterns[type];
    }

    if (!pattern) {
      this.stats.failed++;
      return null;
    }

    const match = line.match(pattern);
    if (!match) {
      this.stats.failed++;
      return null;
    }

    this.stats.parsed++;

    // 更新统计
    if (match.groups?.level) {
      this.stats.byLevel[match.groups.level] = (this.stats.byLevel[match.groups.level] || 0) + 1;
    }
    if (match.groups?.status) {
      this.stats.byStatus[match.groups.status] = (this.stats.byStatus[match.groups.status] || 0) + 1;
    }

    return { type, groups: match.groups };
  }

  detectFormat(line) {
    if (line.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) return this.patterns.apache;
    if (line.match(/^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}/)) return this.patterns.syslog;
    if (line.match(/^\[\d{4}-\d{2}-\d{2}/)) return this.patterns.app;
    return null;
  }

  parseBatch(lines) {
    return lines.map(line => this.parseLine(line)).filter(Boolean);
  }

  getStats() {
    return { ...this.stats };
  }
}

// 使用示例
const sampleLogs = [
  '127.0.0.1 - - [24/Mar/2024:14:32:10 +0800] "GET /api/users HTTP/1.1" 200 1234',
  'Mar 24 14:32:10 server sshd[1234]: Accepted password for admin',
  '[2024-03-24 14:32:10] [ERROR] [auth] Authentication failed'
];

const analyzer = new LogAnalyzer();
const parsed = analyzer.parseBatch(sampleLogs);
console.log(parsed);
console.log(analyzer.getStats());

// 5. 提取错误堆栈
const stackTracePattern = /(?<file>[\w.]+):(?<line>\d+):(?<column>\d+)/g;
const stackTrace = `
Error: Something went wrong
    at function1 (app.js:10:15)
    at function2 (utils.js:25:8)
    at main (index.js:45:3)
`;

const stackMatches = [...stackTrace.matchAll(stackTracePattern)];
const locations = stackMatches.map(m => ({
  file: m.groups.file,
  line: parseInt(m.groups.line),
  column: parseInt(m.groups.column)
}));
console.log(locations);
```

**性能分析：**

- 预编译的正则解析百万行日志效率高
- 复杂模式匹配失败会回溯，影响性能
- 建议使用流式处理大文件

**常见错误：**

```javascript
// ❌ 错误：贪婪匹配导致过度捕获
const badPattern = /"(.*)"/;  // 会匹配到最后一个引号
const str = '"hello" "world"';
console.log(str.match(badPattern)[1]); // 'hello" "world'

// ✅ 正确：使用懒惰或非贪婪
const goodPattern = /"([^"]*)"/; // 或 /"(.*?)"/
console.log(str.match(goodPattern)[1]); // 'hello'
```

### 10.2 数据提取

```javascript
// 1. HTML 数据提取
const html = `
<div class="product" data-id="123">
  <h2 class="title">Product Name</h2>
  <span class="price">$99.99</span>
  <span class="currency">USD</span>
</div>
`;

// 提取属性
const dataId = html.match(/data-id="(\d+)"/)?.[1];
console.log(dataId); // '123'

// 提取内容
const title = html.match(/<h2[^>]*>([^<]+)<\/h2>/)?.[1];
console.log(title); // 'Product Name'

// 提取价格
const priceMatch = html.match(/\$(\d+\.\d{2})/);
const price = priceMatch ? parseFloat(priceMatch[1]) : null;
console.log(price); // 99.99

// 2. CSS 解析
const css = `
.container {
  width: 100%;
  height: 200px;
  background-color: #ff5733;
  font-size: 16px;
}
`;

// 提取 CSS 规则
const cssRulePattern = /([^{]+)\{([^}]*)\}/g;
const rules = [...css.matchAll(cssRulePattern)].map(match => ({
  selector: match[1].trim(),
  declarations: match[2].trim().split(';').filter(Boolean).reduce((acc, decl) => {
    const [prop, value] = decl.split(':').map(s => s.trim());
    acc[prop] = value;
    return acc;
  }, {})
}));

console.log(rules);

// 3. Markdown 解析
const markdown = `
# Title
## Subtitle
This is **bold** and *italic* text.
[Link](https://example.com)
`;

// 提取标题
const headers = [...markdown.matchAll(/^(#{1,6})\s+(.+)$/gm)].map(m => ({
  level: m[1].length,
  text: m[2]
}));
console.log(headers);

// 提取链接
const links = [...markdown.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)].map(m => ({
  text: m[1],
  url: m[2]
}));
console.log(links);

// 提取格式
const bold = [...markdown.matchAll(/\*\*(.+?)\*\*/g)].map(m => m[1]);
const italic = [...markdown.matchAll(/\*(.+?)\*/g)].map(m => m[1]);
console.log({ bold, italic });

// 4. SQL 解析
const sql = `
SELECT u.id, u.name, p.title
FROM users u
JOIN posts p ON u.id = p.user_id
WHERE u.active = 1 AND p.created_at > '2024-01-01'
ORDER BY p.created_at DESC
LIMIT 10;
`;

// 提取 SELECT 字段
const selectFields = sql.match(/SELECT\s+(.+?)\s+FROM/i)?.[1]
  .split(',')
  .map(f => f.trim());
console.log(selectFields);

// 提取表名
const tables = [...sql.matchAll(/(?:FROM|JOIN)\s+(\w+)/gi)].map(m => m[1]);
console.log(tables);

// 提取 WHERE 条件
const whereClause = sql.match(/WHERE\s+(.+?)(?:ORDER|GROUP|LIMIT|$)/is)?.[1];
console.log(whereClause);

// 5. 配置文件解析
const config = `
# Database settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=admin
# API settings
API_KEY=sk-1234567890abcdef
API_TIMEOUT=30
`;

// 提取键值对
const configPattern = /^(\w+)=(.+)$/gm;
const settings = [...config.matchAll(configPattern)].reduce((acc, [, key, value]) => {
  acc[key] = value;
  return acc;
}, {});
console.log(settings);

// 6. 代码分析
const code = `
function calculate(a, b) {
  return a + b;
}

const multiply = (x, y) => x * y;

class Calculator {
  add(x, y) {
    return x + y;
  }
}
`;

// 提取函数
const functionPattern = /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*\([^)]*\)\s*\{)/g;
const functions = [...code.matchAll(functionPattern)].map(m => m[1] || m[2] || m[3]);
console.log(functions);

// 提取类
const classes = [...code.matchAll(/class\s+(\w+)/g)].map(m => m[1]);
console.log(classes);

// 通用提取器类
class DataExtractor {
  constructor() {
    this.patterns = {};
  }

  addPattern(name, pattern, extractor) {
    this.patterns[name] = { pattern, extractor };
  }

  extract(data, type) {
    const config = this.patterns[type];
    if (!config) throw new Error(`Unknown type: ${type}`);

    const matches = [...data.matchAll(config.pattern)];
    return matches.map(config.extractor);
  }
}

// 使用
const extractor = new DataExtractor();

extractor.addPattern(
  'emails',
  /[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g,
  m => m[0]
);

extractor.addPattern(
  'urls',
  /https?:\/\/[^\s]+/g,
  m => ({
    url: m[0],
    domain: m[0].match(/https?:\/\/([^\/]+)/)?.[1]
  })
);

const testData = `
Contact us at support@example.com or visit https://example.com/help
For sales: sales@example.com
`;

console.log(extractor.extract(testData, 'emails'));
console.log(extractor.extract(testData, 'urls'));
```

### 10.3 数据验证

```javascript
// 表单验证类
class Validator {
  constructor() {
    this.rules = {};
    this.errors = [];
  }

  addRule(field, pattern, message) {
    if (!this.rules[field]) this.rules[field] = [];
    this.rules[field].push({ pattern, message });
  }

  validate(data) {
    this.errors = [];

    for (const [field, rules] of Object.entries(this.rules)) {
      const value = data[field];

      for (const rule of rules) {
        let isValid;

        if (typeof rule.pattern === 'function') {
          isValid = rule.pattern(value);
        } else {
          isValid = rule.pattern.test(String(value));
        }

        if (!isValid) {
          this.errors.push({ field, message: rule.message });
          break;
        }
      }
    }

    return this.errors.length === 0;
  }

  getErrors() {
    return this.errors;
  }
}

// 预定义验证规则
const validationRules = {
  required: (value) => value != null && String(value).trim() !== '',

  email: /^[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,

  phoneUS: /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,

  url: /^https?:\/\/(?:[-\w.])+(?:[:\d]+)?(?:\/(?:[\w/_.])*(?:\?(?:[\w&=%.])*)?(?:#(?:[\w.])*)?)?$/,

  alphanumeric: /^[a-zA-Z0-9]+$/,

  alpha: /^[a-zA-Z]+$/,

  numeric: /^\d+$/,

  decimal: /^\d+\.?\d*$/,

  dateISO: /^\d{4}-\d{2}-\d{2}$/,

  time24: /^([01]\d|2[0-3]):[0-5]\d$/,

  hexColor: /^#(?:[0-9a-fA-F]{3}){1,2}$/,

  creditCard: /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13})$/,

  zipUS: /^\d{5}(-\d{4})?$/,

  uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,

  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,

  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,

  // 自定义规则生成器
  minLength: (min) => (value) => String(value).length >= min,
  maxLength: (max) => (value) => String(value).length <= max,
  range: (min, max) => (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= min && num <= max;
  },
  pattern: (regex) => regex
};

// 使用示例
const validator = new Validator();

validator.addRule('username', validationRules.required, 'Username is required');
validator.addRule('username', validationRules.minLength(3), 'Username must be at least 3 characters');
validator.addRule('username', validationRules.alphanumeric, 'Username must be alphanumeric');

validator.addRule('email', validationRules.required, 'Email is required');
validator.addRule('email', validationRules.email, 'Invalid email format');

validator.addRule('age', validationRules.range(18, 120), 'Age must be between 18 and 120');

// 测试
const formData1 = {
  username: 'john123',
  email: 'john@example.com',
  age: 25
};

const formData2 = {
  username: 'ab',
  email: 'invalid-email',
  age: 15
};

console.log('Form 1:', validator.validate(formData1)); // true
console.log('Form 1 errors:', validator.getErrors());

console.log('Form 2:', validator.validate(formData2)); // false
console.log('Form 2 errors:', validator.getErrors());

// 高级验证：密码强度
function validatePassword(password) {
  const checks = [
    { test: /.{8,}/, name: 'minLength', message: 'At least 8 characters' },
    { test: /[a-z]/, name: 'lowercase', message: 'At least one lowercase letter' },
    { test: /[A-Z]/, name: 'uppercase', message: 'At least one uppercase letter' },
    { test: /\d/, name: 'number', message: 'At least one number' },
    { test: /[!@#$%^&*(),.?":{}|<>]/, name: 'special', message: 'At least one special character' }
  ];

  const results = checks.map(check => ({
    name: check.name,
    passed: check.test.test(password),
    message: check.message
  }));

  const passed = results.filter(r => r.passed).length;
  const strength = passed < 3 ? 'weak' : passed < 5 ? 'medium' : 'strong';

  return {
    valid: passed >= 3,
    strength,
    score: passed,
    checks: results
  };
}

console.log(validatePassword('Abc123!@'));
console.log(validatePassword('weak'));

// 批量验证
function batchValidate(items, rules) {
  const validator = new Validator();

  // 添加规则
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      validator.addRule(field, rule.pattern, rule.message);
    }
  }

  return items.map((item, index) => {
    const isValid = validator.validate(item);
    return {
      index,
      valid: isValid,
      errors: validator.getErrors()
    };
  });
}

// 使用
const users = [
  { username: 'user1', email: 'user1@test.com' },
  { username: 'u', email: 'invalid' },
  { username: 'user2', email: 'user2@test.com' }
];

const userRules = {
  username: [
    { pattern: validationRules.required, message: 'Username required' },
    { pattern: validationRules.minLength(3), message: 'Min 3 chars' }
  ],
  email: [
    { pattern: validationRules.required, message: 'Email required' },
    { pattern: validationRules.email, message: 'Invalid email' }
  ]
};

const batchResults = batchValidate(users, userRules);
console.log(batchResults);

// 数据清洗
function sanitizeData(data, sanitizers) {
  const cleaned = { ...data };

  for (const [field, sanitizer] of Object.entries(sanitizers)) {
    if (cleaned[field] != null) {
      cleaned[field] = sanitizer(cleaned[field]);
    }
  }

  return cleaned;
}

const sanitizers = {
  email: (v) => v.toLowerCase().trim(),
  phone: (v) => v.replace(/\D/g, ''),
  name: (v) => v.replace(/[^\w\s-]/g, '').trim()
};

const rawData = {
  email: '  JOHN@EXAMPLE.COM  ',
  phone: '(123) 456-7890',
  name: 'John <script>alert(1)</script>'
};

console.log(sanitizeData(rawData, sanitizers));
```

**性能分析：**

- 预编译验证规则提升重复验证性能
- 提前失败策略：多规则时先检查简单规则
- 批量验证时考虑使用 Web Worker

**常见错误：**

```javascript
// ❌ 错误：未处理 null/undefined
/[a-z]+/.test(null); // true (转换为 "null")
/[a-z]+/.test(undefined); // true (转换为 "undefined")

// ✅ 正确：先检查值
function safeTest(pattern, value) {
  if (value == null) return false;
  return pattern.test(String(value));
}

// ❌ 错误：验证规则顺序不当
// 先检查复杂正则，后检查必填
validator.addRule('email', /complex regex/, 'Invalid format');
validator.addRule('email', required, 'Required'); // 空值会通过复杂正则检查

// ✅ 正确：简单规则优先
validator.addRule('email', required, 'Required');
validator.addRule('email', /simple regex/, 'Invalid format');
```

---

## 附录

### A. 快速参考表

```javascript
// 元字符
const metacharacters = {
  '.': '任意字符（除换行）',
  '^': '字符串/行首',
  '$': '字符串/行尾',
  '*': '零次或多次',
  '+': '一次或多次',
  '?': '零次或一次',
  '|': '或',
  '\\': '转义',
  '()': '分组',
  '[]': '字符类',
  '{}': '量词'
};

// 预定义字符类
const predefined = {
  '\\d': '[0-9] - 数字',
  '\\D': '[^0-9] - 非数字',
  '\\w': '[a-zA-Z0-9_] - 单词字符',
  '\\W': '[^a-zA-Z0-9_] - 非单词字符',
  '\\s': '[\\t\\n\\r\\f\\v] - 空白字符',
  '\\S': '[^\\t\\n\\r\\f\\v] - 非空白字符',
  '\\b': '单词边界',
  '\\B': '非单词边界'
};

// 标志
const flags = {
  'g': '全局搜索',
  'i': '忽略大小写',
  'm': '多行模式',
  's': 'dotAll模式',
  'u': 'Unicode模式',
  'y': '粘性模式',
  'd': '生成索引'
};
```

### B. 性能优化清单

```javascript
const optimizationChecklist = {
  beforeWriting: [
    '使用具体字符类而非点号',
    '避免嵌套量词',
    '使用非捕获组 (?:) 当不需要捕获',
    '限制输入长度'
  ],

  afterWriting: [
    '测试极端输入',
    '检查是否存在回溯灾难',
    '对比替代方案性能',
    '添加 ReDoS 防护'
  ],

  inProduction: [
    '设置执行超时',
    '监控正则执行时间',
    '缓存预编译的正则',
    '记录性能异常'
  ]
};
```

### C. 常用模式速查

```javascript
const patterns = {
  email: /^[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
  url: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
  phoneUS: /^(\+1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/,
  dateISO: /^\d{4}-\d{2}-\d{2}$/,
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  hexColor: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
  uuid: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  passwordStrong: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
};
```

---

> **文档结束**
>
> 本文档涵盖了 JavaScript 正则表达式的各个方面，从基础语法到高级特性，从性能优化到安全防护。
>
> 建议阅读顺序：
>
> 1. 第1-2章：掌握基础
> 2. 第7章：熟悉常用方法
> 3. 第3章：学习高级特性
> 4. 第5章：参考常用模式
> 5. 第9章：了解安全注意事项
> 6. 第10章：学习实际应用
>
> 最后通过第4、6、8章深化理解和优化技能。