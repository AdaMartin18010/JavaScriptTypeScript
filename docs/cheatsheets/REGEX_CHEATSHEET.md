# JavaScript 正则表达式速查表 (Regular Expressions Cheatsheet)

> 💡 本速查表覆盖 JavaScript RegExp 语法、常用模式及 String / RegExp 方法，适用于 ES2024+ (`v` flag)。

---

## 目录

- [JavaScript 正则表达式速查表 (Regular Expressions Cheatsheet)](#javascript-正则表达式速查表-regular-expressions-cheatsheet)
  - [目录](#目录)
  - [创建正则表达式](#创建正则表达式)
  - [字符类 (Character Classes)](#字符类-character-classes)
  - [锚点 (Anchors)](#锚点-anchors)
  - [量词 (Quantifiers)](#量词-quantifiers)
  - [分组与引用 (Groups \& Backreferences)](#分组与引用-groups--backreferences)
  - [环视 (Lookarounds)](#环视-lookarounds)
  - [标志 (Flags)](#标志-flags)
  - [常用模式 (Common Patterns)](#常用模式-common-patterns)
  - [String 方法](#string-方法)
  - [RegExp 方法](#regexp-方法)
  - [高级技巧](#高级技巧)
    - [使用 Unicode 属性转义](#使用-unicode-属性转义)
    - [原子组模拟（JavaScript 不支持原子组，可用先行断言模拟）](#原子组模拟javascript-不支持原子组可用先行断言模拟)
    - [多行替换函数](#多行替换函数)
  - [正则调试 checklist](#正则调试-checklist)

---

## 创建正则表达式

```js
// 字面量
const re1 = /abc/gi;

// 构造函数（动态构建）
const re2 = new RegExp('abc', 'gi');

// 包含变量
const name = 'foo';
const re3 = new RegExp(`\\b${name}\\b`, 'g');
```

> ⚠️ 构造函数中反斜杠需要双重转义：`\\d` 表示 `\d`。

---

## 字符类 (Character Classes)

| 模式 | 含义 | 示例匹配 |
|------|------|----------|
| `.` | 任意字符（除换行符，除非 `s` flag） | `a.c` → `abc`, `a/c` |
| `\d` | 数字 (digit)，等同于 `[0-9]` | `\d+` → `2024` |
| `\D` | 非数字，等同于 `[^0-9]` | `\D+` → `abc` |
| `\w` | 单词字符 (word)，等同于 `[A-Za-z0-9_]` | `\w+` → `hello_world` |
| `\W` | 非单词字符 | `\W+` → `@#$` |
| `\s` | 空白字符 (space)，含空格/制表/换行 | `\s+` → `\n\t` |
| `\S` | 非空白字符 | `\S+` → `hello` |
| `\b` | 单词边界 (boundary) | `\bcat\b` → 匹配独立单词 `cat` |
| `\B` | 非单词边界 | `\Bcat\B` → 匹配 `concat` 中的 `cat` |
| `[abc]` | 字符集，匹配 a、b 或 c | `[aeiou]` → 元音 |
| `[^abc]` | 否定字符集，除 a、b、c 外 | `[^0-9]` → 非数字 |
| `[a-z]` | 范围 | `[A-Z]` → 大写字母 |
| `[a-zA-Z0-9]` | 多范围组合 | 字母数字 |

```js
// 匹配中文字符
const chinese = /[\u4e00-\u9fa5]+/g;
'你好 world'.match(chinese); // ['你好']

// 匹配十六进制颜色
const hexColor = /#[0-9A-Fa-f]{6}/g;
'#FF5733'.match(hexColor); // ['#FF5733']
```

> 💡 ES2024 `v` flag 支持集合运算：`[\p{Decimal_Number}--[0-9]]` 表示除 0-9 外的数字字符。

---

## 锚点 (Anchors)

| 模式 | 含义 | 示例 |
|------|------|------|
| `^` | 字符串开头 (start) | `^hello` → 以 hello 开头 |
| `$` | 字符串结尾 (end) | `world$` → 以 world 结尾 |
| `\b` | 单词边界 | `\btest\b` → 独立单词 test |
| `\B` | 非单词边界 | `\Bte\B` → 匹配字节中的 `te` |
| `(?=...)` | 正向先行断言 | 见 [环视](#环视-lookarounds) |
| `(?!...)` | 负向先行断言 | 见 [环视](#环视-lookarounds) |

```js
// 验证整行内容
/^\d+$/.test('12345');     // true（纯数字）
/^\d+$/.test('123a45');    // false

// 多行模式下的行首
/^\s*$/gm.test('\n  \n');  // true（空行）
```

> ⚠️ `^` 在字符集 `[^...]` 中表示否定，在字符集外表示字符串开头。

---

## 量词 (Quantifiers)

| 模式 | 含义 | 贪婪性 |
|------|------|--------|
| `*` | 0 次或多次 | 贪婪 |
| `+` | 1 次或多次 | 贪婪 |
| `?` | 0 次或 1 次 | 贪婪 |
| `{n}` | 恰好 n 次 | 贪婪 |
| `{n,}` | 至少 n 次 | 贪婪 |
| `{n,m}` | n 到 m 次 | 贪婪 |
| `*?` | 0 次或多次 | **非贪婪** (lazy) |
| `+?` | 1 次或多次 | **非贪婪** |
| `??` | 0 次或 1 次 | **非贪婪** |
| `{n,m}?` | n 到 m 次 | **非贪婪** |

```js
const str = '<div>内容</div><span>文本</span>';

// 贪婪匹配
str.match(/<.*>/);    // ['<div>内容</div><span>文本</span>']

// 非贪婪匹配
str.match(/<.*?>/);   // ['<div>']
```

> 💡 默认贪婪模式会尽可能多匹配；在解析 HTML/XML 标签时，通常需要非贪婪模式 `.*?`。

---

## 分组与引用 (Groups & Backreferences)

| 模式 | 含义 | 示例 |
|------|------|------|
| `(abc)` | 捕获组 (capturing group) | `/(\d{4})-(\d{2})/` → 捕获年和月 |
| `(?:abc)` | 非捕获组 (non-capturing) | `/(?:\d{4})-(\d{2})/` → 只捕获月 |
| `(?<name>abc)` | 命名捕获组 (named group) | `/(?<year>\d{4})/` |
| `\1`, `\2` | 反向引用 (backreference) | `/(.)\1/` → 匹配 `aa`, `11` |
| `\k<name>` | 命名反向引用 | `/(?<c>.)(.)\k<c>\2/` |

```js
// 捕获组
const dateRe = /(\d{4})-(\d{2})-(\d{2})/;
const m = '2024-12-25'.match(dateRe);
// m[1] = '2024', m[2] = '12', m[3] = '25'

// 命名捕获组
const namedRe = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const nm = '2024-12-25'.match(namedRe);
// nm.groups.year = '2024'

// 非捕获组
const nonCap = /(?:https?:\/\/)?(.+)/;
'https://example.com'.match(nonCap)[1]; // 'example.com'

// 反向引用：匹配重复单词
const repeat = /\b(\w+)\s+\1\b/gi;
'hello hello world'.match(repeat); // ['hello hello']
```

> 💡 不需要提取内容时，始终使用 `(?:...)` 非捕获组，提升性能并减少干扰。

---

## 环视 (Lookarounds)

环视只检查位置，不消耗字符（零宽断言）。

| 模式 | 含义 | 示例 |
|------|------|------|
| `(?=...)` | 正向先行 (positive lookahead) | `\d+(?=px)` → 匹配 `px` 前的数字 |
| `(?!...)` | 负向先行 (negative lookahead) | `\d+(?!px)` → 匹配后面不是 `px` 的数字 |
| `(?<=...)` | 正向后行 (positive lookbehind) | `(?<=\$)\d+` → 匹配 `$` 后的数字 |
| `(?<!...)` | 负向后行 (negative lookbehind) | `(?<!\$)\d+` → 匹配前面不是 `$` 的数字 |

```js
// 正向先行：匹配后面跟着 "元" 的数字
'价格 100元'.match(/\d+(?=元)/); // ['100']

// 负向先行：匹配后面不跟 px 的数字
'100px 200em'.match(/\d+(?!px)/g); // ['200']

// 正向后行：匹配 $ 符号后的金额
'$100 £50'.match(/(?<=\$)\d+/g); // ['100']

// 负向后行：匹配不以 # 开头的单词
'hello #world'.match(/(?<!#)\b\w+/g); // ['hello']
```

> ⚠️ 后行断言 `(?<=...)` / `(?<!...)` 在 JavaScript 中要求固定宽度（如 `(?<=abc)` 合法，但 `(?<=a+)` 在某些引擎中受限）。

---

## 标志 (Flags)

| 标志 | 名称 | 含义 |
|------|------|------|
| `g` | global | 全局匹配，找到所有匹配项 |
| `i` | ignoreCase | 忽略大小写 |
| `m` | multiline | 多行模式，`^` / `$` 匹配每行开头/结尾 |
| `s` | dotAll | `.` 匹配包括换行符在内的任意字符 |
| `u` | unicode | Unicode 模式，支持 `\u{...}` 和 Unicode 属性类 |
| `d` | indices | 在结果中提供匹配子串的起止索引 (`result.indices`) |
| `v` | unicodeSets | ES2024，增强 Unicode 集合运算，替代部分 `u` 场景 |

```js
const str = 'Hello\nWorld';

// s flag：. 匹配换行
str.match(/Hello.World/s); // 匹配成功

// m flag：多行匹配每行开头
str.match(/^World/m); // 匹配成功

// d flag：获取索引
const re = /a(b)c/d;
const result = re.exec('abc');
result.indices[0]; // [0, 3]
result.indices[1]; // [1, 2]

// v flag：Unicode 集合（ES2024）
const reV = /[\p{White_Space}&&\p{ASCII}]/v;
```

> 💡 `v` flag 是 `u` 的升级版，支持集合运算（交集 `&&`、差集 `--`、并集），推荐新项目优先使用。

---

## 常用模式 (Common Patterns)

| 用途 | 正则表达式 |
|------|----------|
| 邮箱 (email) | `/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/` |
| URL | `/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/` |
| 手机号 (中国大陆) | `/^1[3-9]\d{9}$/` |
| IPv4 地址 | `/^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/` |
| 日期 (YYYY-MM-DD) | `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/` |
| 时间 (HH:MM) | `/^([01]\d|2[0-3]):[0-5]\d$/` |
| 身份证 (18位) | `/^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[\dXx]$/` |
| 中文字符 | `/[\u4e00-\u9fa5]/` |
| 空白行 | `/^\s*$/m` |
| 密码 (8-20位，含字母+数字) | `/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,20}$/` |
| Hex 颜色 | `/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/` |
| 文件扩展名 | `/\.([a-zA-Z0-9]+)$/` |

```js
// 邮箱验证（基础版）
const emailRe = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
emailRe.test('user@example.com'); // true

// URL 提取协议、域名、路径
const urlRe = /^(?<protocol>https?:\/\/)?(?<host>[\w.-]+)(?<path>\/.*)?$/;
const urlMatch = 'https://api.example.com/v1/users'.match(urlRe);
// urlMatch.groups.host = 'api.example.com'

// 日期解析（命名捕获组）
const dateRe = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/;
const { groups } = '2024-12-25'.match(dateRe);
// groups = { year: '2024', month: '12', day: '25' }
```

> ⚠️ 邮箱正则无法覆盖所有 RFC 5322 情况，生产环境建议配合发送验证链接。

---

## String 方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `str.match(re)` | 匹配字符串 | `g` flag：数组；无 `g`：`Match` 对象或 `null` |
| `str.matchAll(re)` | 返回迭代器，含所有匹配详情 | `RegExpStringIterator` |
| `str.search(re)` | 返回首次匹配索引 | `number`（无匹配返回 `-1`） |
| `str.replace(re, replacement)` | 替换匹配项 | 新字符串 |
| `str.replaceAll(re|str, replacement)` | 替换所有匹配项 | 新字符串 |
| `str.split(re|str)` | 按正则分割 | `string[]` |

```js
const str = 'The quick brown fox jumps over the lazy dog';

// match
str.match(/\b\w{5}\b/g); // ['quick', 'brown', 'jumps']

// matchAll（推荐替代带 g 的 match，可获取捕获组）
const matches = [...str.matchAll(/\b(\w{5})\b/g)];
// matches[0][1] = 'quick'

// search
str.search(/fox/); // 16

// replace（使用函数）
str.replace(/\b\w+\b/g, word => word.toUpperCase());
// 'THE QUICK BROWN FOX ...'

// replace 引用捕获组
'2024-12-25'.replace(/(\d{4})-(\d{2})-(\d{2})/, '$3/$2/$1');
// '25/12/2024'

// replaceAll
'a,b,c'.replaceAll(',', ' | '); // 'a | b | c'

// split（支持正则）
'a,b; c|d'.split(/[,;|]\s*/); // ['a', 'b', 'c', 'd']
```

> 💡 `matchAll` 返回的迭代器必须用 `[...]` 展开或 `for...of` 遍历，且正则必须带 `g` flag。

---

## RegExp 方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `re.test(str)` | 测试是否匹配 | `boolean` |
| `re.exec(str)` | 执行匹配，返回详细信息 | `Match` 数组 或 `null` |

```js
const re = /(\d{4})-(\d{2})-(\d{2})/g;
const str = '2024-01-01 and 2025-06-15';

// test
re.test(str); // true

// exec（手动遍历，配合 g flag 会记录 lastIndex）
let match;
while ((match = re.exec(str)) !== null) {
  console.log(`Found ${match[0]} at ${match.index}`);
  console.log(`Year: ${match[1]}, Month: ${match[2]}, Day: ${match[3]}`);
}

// 重置 lastIndex（多次 exec 同一正则时需留意）
re.lastIndex = 0;
```

> ⚠️ 带 `g` 或 `y` flag 的正则在 `exec` / `test` 后会更新 `lastIndex`，重复使用前务必重置。

---

## 高级技巧

### 使用 Unicode 属性转义

```js
// 匹配所有字母（含中文、阿拉伯文等）
const letters = /\p{L}+/gu;
'Hello 你好'.match(letters); // ['Hello', '你好']

// 匹配所有数字（含阿拉伯数字、罗马数字等）
const digits = /\p{Number}+/gu;
```

### 原子组模拟（JavaScript 不支持原子组，可用先行断言模拟）

```js
// 模拟 (?>abc) — 匹配后不回溯
const atomic = /(?=(abc))\1/;
```

### 多行替换函数

```js
const template = 'Hello {{name}}, your score is {{score}}';
const data = { name: 'Alice', score: 95 };

template.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] || match);
// 'Hello Alice, your score is 95'
```

---

## 正则调试 checklist

- [ ] 是否忘记 `g` flag 导致只匹配第一个？
- [ ] 是否忘记 `i` flag 导致大小写敏感？
- [ ] 是否因贪婪量词 `.*` 匹配过多？尝试 `.*?`
- [ ] `^` / `$` 是否在多行模式下使用 `m` flag？
- [ ] 是否因 `lastIndex` 残留导致第二次 `test`/`exec` 异常？
- [ ] 构造函数中是否对 `\` 进行了双重转义？
- [ ] Unicode 场景是否添加了 `u` 或 `v` flag？

---

*最后更新：2026-04*
