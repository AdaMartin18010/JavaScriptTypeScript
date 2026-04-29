# 正则表达式速查表

> **定位**：`30-knowledge-base/30.7-cheatsheets/`

---

## 基础元字符

| 模式 | 含义 | 示例 |
|------|------|------|
| `.` | 任意字符（除换行） | `a.c` → `abc`, `aec` |
| `^` | 字符串开头 | `^hello` |
| `$` | 字符串结尾 | `world$` |
| `\d` | 数字 [0-9] | `\d{3}` → `123` |
| `\w` | 单词字符 [a-zA-Z0-9_] | `\w+` |
| `\s` | 空白字符 | `\s+` |
| `\b` | 单词边界 | `\bword\b` |

---

## 量词

| 模式 | 含义 |
|------|------|
| `*` | 0 次或多次 |
| `+` | 1 次或多次 |
| `?` | 0 次或 1 次 |
| `{n}` | 恰好 n 次 |
| `{n,}` | 至少 n 次 |
| `{n,m}` | n 到 m 次 |

---

## 正则模式对比表

| 模式类型 | 语法 | 用途 | 示例 |
|---------|------|------|------|
| **捕获组** | `(pattern)` | 提取子匹配 | `/(\d{4})-(\d{2})-(\d{2})/` |
| **非捕获组** | `(?:pattern)` | 分组但不提取 | `/(?:https?:\/\/)?domain.com/` |
| **命名捕获** | `(?<name>pattern)` | 具名提取 | `/(?<year>\d{4})-(?<month>\d{2})/` |
| **正向前瞻** | `(?=pattern)` | 后面必须跟着 | `/\d+(?=px)/` 匹配 "12px" 中的 "12" |
| **负向前瞻** | `(?!pattern)` | 后面不能跟着 | `/\d+(?!px)/` 匹配非 px 单位的数字 |
| **正向后顾** | `(?<=pattern)` | 前面必须跟着 | `/(?<=\$)\d+/` 匹配 "$100" 中的 "100" |
| **负向后顾** | `(?<!pattern)` | 前面不能跟着 | `/(?<!\$)\d+/` |
| **原子组** | `(?>pattern)` | 禁止回溯（PCRE） | `/(?>\w+)\b/` |
| **分支** | `a\|b` | 多选 | `/jpg\|png\|gif/` |

---

## 常用模式

```javascript
// Email
const email = /^[\w.-]+@[\w.-]+\.\w{2,}$/;

// URL
const url = /https?:\/\/[\w.-]+\.\w{2,}(\/\S*)?/;

// 中国大陆手机号
const phone = /^1[3-9]\d{9}$/;

// 日期 YYYY-MM-DD
const date = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

// 强密码（8+位，含大小写+数字+特殊字符）
const password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
```

---

## 进阶代码示例

### 前瞻与后顾（Lookahead & Lookbehind）

```javascript
// 正向前瞻：提取带单位的价格数字
const priceRegex = /\d+(?=\s*USD)/g;
'Price: 100 USD, 200 EUR'.match(priceRegex); // ['100']

// 负向前瞻：排除特定后缀
const notPx = /\d+(?!px)/g;
'12px 14em 16px'.match(notPx); // ['14']

// 正向后顾：提取货币符号后的数字
const afterDollar = /(?<=\$)\d+(?:\.\d{2})?/g;
'Items: $19.99, $5.00, ¥100'.match(afterDollar); // ['19.99', '5.00']

// 密码强度实时校验（组合前瞻）
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;
strongPassword.test('Hello1!');      // false (太短)
strongPassword.test('HelloWorld1!'); // true
```

### 命名捕获组与结构化提取

```javascript
// 解析 ISO 8601 日期时间
const isoDate = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})T(?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})/;
const match = '2026-04-29T06:13:58'.match(isoDate);

console.log(match.groups);
// { year: '2026', month: '04', day: '29', hour: '06', minute: '13', second: '58' }

// 替换时使用命名引用
const reformat = '2026-04-29'.replace(
  /(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/,
  '$<d>/$<m>/$<y>'
); // '29/04/2026'
```

### Unicode 属性匹配（ES2018+）

```javascript
// 匹配所有 emoji
const emojiRegex = /\p{Emoji_Presentation}/gu;
'Hello 👋 World 🌍'.match(emojiRegex); // ['👋', '🌍']

// 匹配特定文字系统
const chineseChars = /\p{Script=Han}/gu;
'Hello 世界'.match(chineseChars); // ['世', '界']

// 匹配所有数字（包括阿拉伯数字、罗马数字等）
const allDigits = /\p{Number}/gu;
'Price: ٣٥ (Arabic) or Ⅻ (Roman)'.match(allDigits); // ['٣', '٥', 'Ⅻ']

// 匹配行尾空格（多行模式）
const trailingSpaces = / +$/gm;
const cleaned = code.replace(trailingSpaces, '');
```

### ES2025 RegExp.escape

```javascript
// 安全转义用户输入
const userInput = '[hello]';
const escaped = RegExp.escape(userInput); // "\\[hello\\]"
const regex = new RegExp(escaped);
```

---

## 参考链接

- [MDN — Regular Expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions)
- [JavaScript.info — RegExp](https://javascript.info/regular-expressions)
- [regex101 — Online Regex Tester](https://regex101.com/)
- [ECMAScript RegExp Proposal — `RegExp.escape`](https://github.com/tc39/proposal-regex-escaping)
- [Unicode Property Escapes (ES2018)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Unicode_character_class_escape)
- [PCRE Regex Cheatsheet](https://www.debuggex.com/cheatsheet/regex/pcre)

---

*速查表覆盖 JS/TS 正则表达式的核心模式与 ES2025 新特性。*
