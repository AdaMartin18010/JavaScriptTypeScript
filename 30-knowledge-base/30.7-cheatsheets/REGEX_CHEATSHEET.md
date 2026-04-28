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

## 量词

| 模式 | 含义 |
|------|------|
| `*` | 0 次或多次 |
| `+` | 1 次或多次 |
| `?` | 0 次或 1 次 |
| `{n}` | 恰好 n 次 |
| `{n,}` | 至少 n 次 |
| `{n,m}` | n 到 m 次 |

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

## ES2025 RegExp.escape

```javascript
// 安全转义用户输入
const userInput = '[hello]';
const escaped = RegExp.escape(userInput); // "\[hello\]"
const regex = new RegExp(escaped);
```

---

*速查表覆盖 JS/TS 正则表达式的核心模式与 ES2025 新特性。*
