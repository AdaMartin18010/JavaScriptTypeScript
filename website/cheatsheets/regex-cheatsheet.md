---
title: 正则表达式速查表
description: "JavaScript 正则表达式速查：元字符、量词、分组断言、常用模式、Unicode 属性与性能优化"
editLink: true
head:
  - - meta
    - property: og:title
      content: "正则表达式速查表 | Awesome JS/TS Ecosystem"
---

# 正则表达式速查表

> JavaScript 正则引擎基于 ECMAScript 规范，支持 `RegExp` 字面量和构造函数两种写法。ES2018 引入 `s` (dotAll)、`u` (Unicode) 和命名捕获组等关键特性。

## 基础语法

### 创建方式

```javascript
// 字面量（推荐，编译时解析）
const re1 = /abc/gi

// 构造函数（运行时动态构建）
const pattern = 'abc'
const re2 = new RegExp(pattern, 'gi')

// 注意：构造函数中需要双重转义
const re3 = new RegExp('\\d+', 'g')  // 等价于 /\d+/g
```

### 标志（Flags）

| 标志 | 含义 | 引入版本 |
|------|------|----------|
| `g` | 全局匹配（Global） | ES1 |
| `i` | 忽略大小写（Ignore case） | ES1 |
| `m` | 多行模式（Multiline） | ES1 |
| `s` | dotAll 模式（`.` 匹配换行） | ES2018 |
| `u` | Unicode 模式 | ES2015 |
| `y` | 粘性匹配（Sticky） | ES2015 |
| `d` | 生成匹配索引 | ES2022 |

```javascript
// dotAll 模式
const text = 'line1\nline2'
/line1.line2/s.test(text)        // true（默认模式下为 false）

// Unicode 属性转义（需 u 标志）
/\p{Emoji}/u.test('🎉')          // true
/\p{Script=Han}/u.test('中')     // true

// 粘性匹配（从 lastIndex 开始，不匹配则失败）
const re = /\d+/y
re.lastIndex = 2
'12 34'.match(re)                // '34'（从索引 2 开始匹配）
```

## 字符类

| 字符类 | 含义 | 反义 |
|--------|------|------|
| `.` | 任意字符（除换行，`s` 标志下含换行） | — |
| `\d` | 数字 `[0-9]` | `\D` |
| `\w` | 单词字符 `[A-Za-z0-9_]` | `\W` |
| `\s` | 空白字符 `[ \t\n\r\f\v]` | `\S` |
| `\b` | 单词边界 | `\B` |
| `\n` | 换行符 | — |
| `\t` | 制表符 | — |
| `\r` | 回车符 | — |
| `[abc]` | 字符集：a、b 或 c | `[^abc]` |
| `[a-z]` | 范围：a 到 z | `[^a-z]` |

```javascript
// 字符集简写
/[0-9a-fA-F]+/g                 // 十六进制数
/[\u4e00-\u9fa5]+/g              // 中文字符（基本区）
/[^\x00-\x7F]+/g                 // 非 ASCII 字符
```

## 量词

| 量词 | 含义 | 贪婪 | 惰性 |
|------|------|------|------|
| `*` | 0 次或多次 | `.*` | `.*?` |
| `+` | 1 次或多次 | `.+` | `.+?` |
| `?` | 0 次或 1 次 | `.?` | `.??` |
| `{n}` | 恰好 n 次 | `\d{3}` | — |
| `{n,}` | 至少 n 次 | `\d{3,}` | `\d{3,}?` |
| `{n,m}` | n 到 m 次 | `\d{3,5}` | `\d{3,5}?` |

```javascript
// 贪婪 vs 惰性
'"hello" "world"'.match(/".*"/)   // '"hello" "world"'（贪婪，匹配最长）
'"hello" "world"'.match(/".*?"/)  // '"hello"'（惰性，匹配最短）

// 常用量词组合
/^\d{1,3}$/                       // 1-3 位数字
/^[a-zA-Z]{2,}$/                  // 至少 2 个字母
/^\+?[1-9]\d{1,14}$/              // 国际电话号码（E.164）
```

## 分组与引用

```javascript
// 捕获组
const match = '2024-05-01'.match(/(\d{4})-(\d{2})-(\d{2})/)
match[0]   // '2024-05-01'
match[1]   // '2024'
match[2]   // '05'
match[3]   // '01'

// 命名捕获组（ES2018）
const named = '2024-05-01'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/)
named.groups.year   // '2024'
named.groups.month  // '05'

// 非捕获组
/(?:https?:\/\/)?example\.com/   // 分组但不捕获

// 反向引用
/([a-z])\1/                       // 匹配重复字母：'aa', 'bb'
/(?<word>\w+)\s+\k<word>/         // 命名反向引用

// 分支
/cat|dog|bird/                    // 匹配 cat 或 dog 或 bird
```

## 断言（Anchors & Lookaround）

```javascript
// 行首行尾
/^hello/m.test('hello\nworld')    // true（m 模式下每行独立）
/hello$/.test('say hello')        // true

// 单词边界
/\bword\b/.test('a word here')   // true
/\bword\b/.test('password')      // false

// 正向前瞻（Positive lookahead）
/\d+(?=px)/.exec('font-size: 16px')  // '16'（后面紧跟 px）

// 负向前瞻（Negative lookahead）
/\d+(?!px)/.exec('font-size: 16em')  // '16'（后面不紧跟 px）

// 正向后瞻（Positive lookbehind，ES2018）
/(?<=\$)\d+/.exec('Price: $100')     // '100'（前面是 $）

// 负向后瞻（Negative lookbehind，ES2018）
/(?<!\$)\d+/.exec('100 dollars')      // '100'（前面不是 $）
```

## 常用模式速查

| 场景 | 正则 | 说明 |
|------|------|------|
| 邮箱（宽松） | `[\w.-]+@[\w.-]+\.\w+` | 允许大多数合法邮箱 |
| 邮箱（严格） | `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$` | 标准验证 |
| URL | `https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)` | 基本 URL |
| IPv4 | `\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b` | 标准 IPv4 |
| 手机号（中国大陆） | `^1[3-9]\d{9}$` | 11 位 |
| 身份证号 | `^[1-9]\d{5}(?:18|19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dXx]$` | 18 位 |
| 日期（YYYY-MM-DD） | `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` | ISO 格式 |
| 密码强度 | `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$` | 大小写+数字+特殊字符 |
| 中文姓名 | `^[\u4e00-\u9fa5·]{2,16}$` | 含间隔号 |
| Markdown 链接 | `\[([^\]]+)\]\(([^)]+)\)` | `[text](url)` |
| HTML 标签 | `<([a-z][a-z0-9]*)\b[^>]*>(.*?)<\/\1>` | 匹配配对标签 |
| 十六进制颜色 | `#(?:[0-9a-fA-F]{3}){1,2}` | `#RGB` 或 `#RRGGBB` |

## 常用 API

```javascript
const re = /\d+/g
const str = 'Room 101, Floor 3, Suite 205'

// test — 布尔匹配
re.test(str)                    // true

// exec — 逐次匹配（配合 g/y 标志使用）
let match
while ((match = re.exec(str)) !== null) {
  console.log(match[0], match.index)
}

// match — 返回所有匹配
str.match(/\d+/g)               // ['101', '3', '205']
str.match(/\d+/)                // ['101', index: 5, ...]（无 g 标志返回详情）

// matchAll — 返回迭代器（ES2020，推荐）
for (const m of str.matchAll(/\d+/g)) {
  console.log(m[0], m.index)
}

// search — 返回首个匹配索引
str.search(/Floor/)             // 11

// replace — 替换
str.replace(/\d+/g, '###')      // 'Room ###, Floor ###, Suite ###'
str.replace(/(\d+)/g, '<$1>')   // 'Room <101>, Floor <3>, Suite <205>'
str.replace(/(?<num>\d+)/g, '$<num>')  // 命名引用替换

// split — 分割
'1, 2, 3, 4'.split(/,\s*/)     // ['1', '2', '3', '4']

// replaceAll — 全局替换字符串（ES2021）
str.replaceAll('Room', 'Office') // 不依赖正则
```

## 性能优化

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 灾难性回溯 | `(a+)+b` 匹配大量 `a` | 使用原子组模拟或限制量词嵌套 |
| 贪婪量词过度匹配 | `.*` 匹配过多内容 | 改用惰性 `.*?` 或精确字符类 |
| 频繁编译 | `new RegExp()` 在循环内 | 提取到循环外复用 |
| 大文本匹配慢 | 全局搜索回溯 | 先缩小搜索范围，或使用 `y` 标志 |
| Unicode 处理错误 | 辅助平面字符被拆分 | 始终使用 `u` 标志 |

```javascript
// 灾难性回溯示例（危险！）
const evil = /(a+)+b/
evil.test('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaac')  // 可能挂起数秒

// 安全写法
const safe = /a+b/

// 预编译复用
const emailRe = /^[\w.-]+@[\w.-]+\.\w+$/
function validateEmail(email) {
  return emailRe.test(email)  // 复用同一个 RegExp 实例
}
```

## 参考资源

- [MDN RegExp](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/RegExp)
- [RegExr 在线测试](https://regexr.com/)
- [Regex101 在线测试](https://regex101.com/)
- [Regular-Expressions.info](https://www.regular-expressions.info/)
- [JavaScript 正则可视化](https://jex.im/regulex/)
