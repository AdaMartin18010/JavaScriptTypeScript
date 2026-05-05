---
title: Web 国际化（i18n）完全指南
description: "JavaScript/TypeScript 国际化开发权威指南：ECMA-402 Intl API、Unicode 处理、RTL 布局、时区管理与多语言应用架构"
editLink: true
head:
  - - meta
    - property: og:title
      content: "Web 国际化完全指南 | Awesome JS/TS Ecosystem"
  - - meta
    - property: og:description
      content: "JS/TS 国际化权威指南，覆盖 Intl API、Unicode、RTL、时区与多语言架构"
---

# Web 国际化（i18n）完全指南

> 国际化（Internationalization，简称 i18n）是使应用适应不同语言、地区和文化习惯的过程。
> 本指南基于 ECMA-402 规范、Unicode 标准、MDN 权威文档以及业界最佳实践编写。

## 核心概念

| 术语 | 缩写 | 说明 |
|------|------|------|
| 国际化 | i18n | 设计适应多语言/文化的架构（无需重写代码） |
| 本地化 | l10n | 将应用翻译并适配到特定地区 |
| 全球化 | g11n | i18n + l10n 的统称 |
| 语言标签 | BCP 47 | `zh-CN`、`en-US`、`ja-JP` 等标准标识 |
| 区域设置 | locale | 语言 + 地区 + 可选变体（如 `zh-Hans-CN`） |

## ECMA-402 Intl API

JavaScript 内置的 `Intl` 命名空间提供语言敏感的字符串比较、数字格式化、日期时间格式化等功能。
所有现代浏览器和 Node.js 15+ 均支持核心 API。

### 日期时间格式化（Intl.DateTimeFormat）

```typescript
const date = new Date('2026-05-01T13:00:00Z')

// 基础格式化
new Intl.DateTimeFormat('zh-CN').format(date)
// '2026/5/1'

new Intl.DateTimeFormat('en-US').format(date)
// '5/1/2026'

new Intl.DateTimeFormat('ja-JP').format(date)
// '2026/05/01'

// 带时间
new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'full',
  timeStyle: 'short'
}).format(date)
// '2026年5月1日星期五 21:00'

// 自定义格式
new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  weekday: 'long'
}).format(date)
// 'Freitag, 01. Mai 2026'

// 时区感知
new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  timeZoneName: 'short'
}).format(date)
// '5/1/2026, EDT'
```

**关键选项**

| 选项 | 值 | 说明 |
|------|-----|------|
| `dateStyle` | `full` / `long` / `medium` / `short` | 预设日期格式 |
| `timeStyle` | `full` / `long` / `medium` / `short` | 预设时间格式 |
| `timeZone` | IANA 时区名 | `Asia/Shanghai`、`UTC` |
| `hour12` | `boolean` | 12/24 小时制 |
| `calendar` | 历法名 | `chinese`、`japanese`、`islamic` |

### 数字与货币格式化（Intl.NumberFormat）

```typescript
const num = 1234567.89

// 数字格式化
new Intl.NumberFormat('zh-CN').format(num)
// '1,234,567.89'

new Intl.NumberFormat('de-DE').format(num)
// '1.234.567,89'

new Intl.NumberFormat('hi-IN').format(num)
// '12,34,567.89'（印度数字分组）

// 货币
new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY'
}).format(num)
// '¥1,234,567.89'

new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  currencyDisplay: 'name'
}).format(num)
// '1,234,567.89 US dollars'

// 紧凑数字
new Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  compactDisplay: 'short'
}).format(1234567)
// '123万'

// 单位
new Intl.NumberFormat('en-US', {
  style: 'unit',
  unit: 'kilometer-per-hour'
}).format(120)
// '120 km/h'
```

### 相对时间（Intl.RelativeTimeFormat）

```typescript
const rtf = new Intl.RelativeTimeFormat('zh-CN', { numeric: 'auto' })

rtf.format(-1, 'day')   // '昨天'
rtf.format(0, 'day')    // '今天'
rtf.format(1, 'day')    // '明天'
rtf.format(-3, 'month') // '3个月前'

const rtfEn = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
rtfEn.format(-1, 'day')  // 'yesterday'
```

### 列表格式化（Intl.ListFormat）

```typescript
const items = ['苹果', '香蕉', '橙子']

new Intl.ListFormat('zh-CN', { type: 'conjunction' }).format(items)
// '苹果、香蕉和橙子'

new Intl.ListFormat('en-US', { type: 'conjunction' }).format(items)
// 'apples, bananas, and oranges'

new Intl.ListFormat('en-US', { type: 'disjunction' }).format(items)
// 'apples, bananas, or oranges'
```

### 文本分段（Intl.Segmenter）— ES2022

```typescript
const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' })
const segments = segmenter.segment('今天天气不错')

for (const { segment, index, isWordLike } of segments) {
  console.log(segment, isWordLike)
}
// 今天 true
// 天气 true
// 不错 true
```

### 复数规则（Intl.PluralRules）

```typescript
const pr = new Intl.PluralRules('en')

pr.select(0)   // 'other' → '0 messages'
pr.select(1)   // 'one'   → '1 message'
pr.select(2)   // 'other' → '2 messages'

const prAr = new Intl.PluralRules('ar')
prAr.select(0)  // 'zero'
prAr.select(1)  // 'one'
prAr.select(2)  // 'two'
prAr.select(3)  // 'few'
prAr.select(11) // 'many'
```

**复数类别**：`zero`、`one`、`two`、`few`、`many`、`other`。不同语言支持的类别不同（阿拉伯语有 6 种，中文只有 1 种 `other`）。

### 排序与比较（Intl.Collator）

```typescript
const collator = new Intl.Collator('zh', { sensitivity: 'base' })

['北京', '上海', '广州'].sort(collator.compare)
// ['北京', '广州', '上海']（按拼音排序）

// 忽略标点和大小写
const loose = new Intl.Collator('en', {
  sensitivity: 'base',
  ignorePunctuation: true
})
loose.compare('resume', 'résumé') === 0  // true
```

### 显示名称（Intl.DisplayNames）

```typescript
const dn = new Intl.DisplayNames('zh-CN', { type: 'language' })
dn.of('ja')    // '日语'
dn.of('zh-Hant') // '繁体中文'

const dnRegion = new Intl.DisplayNames('en', { type: 'region' })
dnRegion.of('CN')  // 'China'
dnRegion.of('US')  // 'United States'
```

## Unicode 与字符串处理

### 规范化（Normalization）

Unicode 中同一字符可能有多种编码方式：

| 形式 | 说明 | 示例 |
|------|------|------|
| NFC | 组合形式（Canonical Composition） | `é` = U+00E9 |
| NFD | 分解形式（Canonical Decomposition） | `é` = `e` + `́` |
| NFKC | 兼容组合 | 将全角数字转为半角 |
| NFKD | 兼容分解 | — |

```typescript
const s1 = 'café'        // U+00E9
const s2 = 'caf\u0065\u0301'  // e + combining acute accent

s1 === s2                    // false
s1.normalize('NFC') === s2.normalize('NFC')  // true

// 安全比较函数
function safeCompare(a: string, b: string): boolean {
  return a.normalize('NFC') === b.normalize('NFC')
}
```

### 方向性（Bidi — Bidirectional Text）

```typescript
// 检测文本方向
const isRTL = (text: string): boolean => {
  return /^[\u0591-\u07FF]/.test(text)  // Hebrew, Arabic, Persian
}

// 方向性隔离
const dir = isRTL('مرحبا') ? 'rtl' : 'ltr'
// HTML: <span dir="rtl">مرحبا</span>
```

**RTL 语言**：阿拉伯语（ar）、希伯来语（he）、波斯语（fa）、乌尔都语（ur）等。

## 多语言应用架构

### 项目结构

```
src/
├── i18n/
│   ├── config.ts          # i18n 配置
│   ├── messages/
│   │   ├── zh-CN.json     # 中文翻译
│   │   ├── en-US.json     # 英文翻译
│   │   └── ja-JP.json     # 日文翻译
│   ├── pluralRules.ts     # 复数规则映射
│   └── formats.ts         # 日期/数字格式配置
├── components/
│   └── LocaleSwitcher.tsx # 语言切换组件
└── utils/
    └── i18n.ts            # i18n 工具函数
```

### 翻译键设计原则

```json
{
  "common": {
    "save": "保存",
    "cancel": "取消",
    "loading": "加载中..."
  },
  "user": {
    "greeting": "你好，{name}",
    "messageCount": {
      "one": "你有 {count} 条新消息",
      "other": "你有 {count} 条新消息"
    }
  }
}
```

**原则**：

- 按功能模块分组，避免扁平化
- 使用语义化键名，而非英文原文
- 插值变量使用 `{name}` 格式
- 复数形式用对象表示（`one` / `other` / `few` 等）

### React 集成示例（react-intl）

```tsx
import { IntlProvider, FormattedMessage, FormattedNumber, useIntl } from 'react-intl'

function App() {
  return (
    <IntlProvider locale="zh-CN" messages={messages}>
      <UserProfile user={{ name: '张三', balance: 1234.56 }} />
    </IntlProvider>
  )
}

function UserProfile({ user }: { user: { name: string; balance: number } }) {
  const intl = useIntl()

  return (
    <div>
      <h1>
        <FormattedMessage
          id="user.greeting"
          defaultMessage="Hello, {name}"
          values={{ name: user.name }}
        />
      </h1>
      <p>
        {intl.formatNumber(user.balance, {
          style: 'currency',
          currency: 'CNY'
        })}
      </p>
    </div>
  )
}
```

### Vue 集成示例（vue-i18n）

```vue
<script setup>
import { useI18n } from 'vue-i18n'

const { t, n, d } = useI18n()

const messages = 3
const now = new Date()
</script>

<template>
  <div>
    <p>{{ t('user.greeting', { name: '张三' }) }}</p>
    <p>{{ t('user.messageCount', messages, { count: messages }) }}</p>
    <p>{{ n(1234.56, 'currency') }}</p>
    <p>{{ d(now, 'short') }}</p>
  </div>
</template>
```

### 类型安全的 i18n（typesafe-i18n）

```typescript
// i18n-types.ts
import type { BaseTranslation } from 'typesafe-i18n'

type Translation = {
  user: {
    greeting: { name: string }
    messageCount: { count: number }
  }
}

// 编译时类型检查
t('user.greeting', { name: '张三' })      // ✅
t('user.greeting', { name: 123 })        // ❌ 类型错误
t('user.nonexistent')                    // ❌ 键不存在
```

## 国际化框架对比

| 框架 | 生态 | 特点 | 适用场景 |
|------|------|------|----------|
| **react-intl** / FormatJS | React | Facebook 官方、功能全面 | 大型 React 应用 |
| **vue-i18n** | Vue | Vue 生态标准、易上手 | Vue 2/3 应用 |
| **i18next** | 通用 | 最流行、插件丰富、框架无关 | 多框架/原生 JS |
| **Lingui** | React/Vue | 编译时提取、极小运行时 | 性能敏感应用 |
| **typesafe-i18n** | 通用 | 全类型安全、零运行时开销 | TypeScript 优先 |
| **paraglide-js** | 通用 | 编译时、tree-shakeable | 现代全栈框架 |

## 时区处理

### 当前最佳实践

```typescript
// ❌ 避免：依赖服务器时区
new Date('2026-05-01')  // 解析为本地时区，不一致

// ✅ 推荐：显式指定时区
import { formatInTimeZone } from 'date-fns-tz'

formatInTimeZone(
  new Date(),
  'America/New_York',
  'yyyy-MM-dd HH:mm:ss zzz'
)

// ✅ 推荐：使用 UTC 存储，本地时区显示
const stored = new Date().toISOString()  // '2026-05-01T05:00:00.000Z'
```

### Temporal API（未来）

```typescript
// Stage 3 提案，预计 2026-2027 标准化
import { Temporal } from '@js-temporal/polyfill'

const zoned = Temporal.Now.zonedDateTimeISO('Asia/Shanghai')
const plain = zoned.toPlainDate()
const instant = zoned.toInstant()

// 不可变、无歧义、时区感知
const nextDay = plain.add({ days: 1 })
```

## RTL 布局实践

### CSS 逻辑属性

```css
/* ❌ 物理属性（不利于 RTL） */
.text {
  margin-left: 1rem;
  text-align: left;
}

/* ✅ 逻辑属性（自动适配方向） */
.text {
  margin-inline-start: 1rem;
  text-align: start;
}
```

| 物理属性 | 逻辑属性 |
|----------|----------|
| `margin-left` | `margin-inline-start` |
| `margin-right` | `margin-inline-end` |
| `padding-left` | `padding-inline-start` |
| `border-left` | `border-inline-start` |
| `text-align: left` | `text-align: start` |
| `float: left` | `float: inline-start` |

### 镜像图标

```css
[dir="rtl"] .icon-arrow {
  transform: scaleX(-1);
}
```

### JavaScript 方向检测

```typescript
function getDocumentDir(): 'ltr' | 'rtl' {
  return document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
}

function isRTLLocale(locale: string): boolean {
  return ['ar', 'he', 'fa', 'ur'].some(l => locale.startsWith(l))
}
```

## 常见陷阱

| 陷阱 | 错误 | 正确 |
|------|------|------|
| 硬编码格式 | `date.toLocaleDateString()` | `new Intl.DateTimeFormat(locale).format(date)` |
| 字符串拼接 | `count + ' messages'` | `Intl.PluralRules` + 翻译键 |
| 忽略时区 | `new Date('2026-01-01')` | `new Date('2026-01-01T00:00:00Z')` |
| 大小写比较 | `locale === 'zh-cn'` | `locale.toLowerCase() === 'zh-cn'` |
| 忽略复数规则 | 中文思维处理英文复数 | 使用框架的复数机制 |
| 字体回退 | 只指定一种字体 | `font-family: 'Noto Sans', 'PingFang SC', sans-serif` |

## 翻译工作流

### 开发流程

```mermaid
graph LR
    A[开发提取键] --> B[翻译管理平台]
    B --> C[译者翻译]
    C --> D[审校 QA]
    D --> E[导入应用]
    E --> F[运行时渲染]
```

### 主流翻译管理平台

| 平台 | 特点 | 价格 |
|------|------|------|
| **Crowdin** | GitHub 集成、机器翻译、术语库 | 免费开源 / 付费 |
| **Lokalise** | API 友好、OTA 更新、截图翻译 | 付费 |
| **Phrase** | CLI 工具、Git 工作流 | 付费 |
| **Weblate** | 自托管、开源 | 免费自托管 |
| **Tolgee** | 开源、上下文截图、自托管 | 免费开源 / 付费 |

## 参考资源

### 规范与标准

- [ECMA-402 Intl API 规范](https://tc39.es/ecma402/) — TC39 官方
- [Unicode CLDR](https://cldr.unicode.org/) — Unicode 通用区域数据仓库
- [BCP 47 语言标签](https://tools.ietf.org/html/bcp47) — IETF 标准
- [W3C 国际化](https://www.w3.org/International/) — W3C 国际化活动

### MDN 文档

- [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [Intl.NumberFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Intl.PluralRules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/PluralRules)
- [Intl.RelativeTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/RelativeTimeFormat)

### 工具与库

- [FormatJS](https://formatjs.io/) — react-intl 底层库
- [i18next](https://www.i18next.com/) — 通用国际化框架
- [vue-i18n](https://vue-i18n.intlify.dev/) — Vue 生态标准
- [Lingui](https://lingui.dev/) — 编译时提取
- [typesafe-i18n](https://github.com/ivanhofer/typesafe-i18n) — 类型安全
- [paraglide-js](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) — 编译时优化
- [Intl Explorer](https://www.intl-explorer.com/) — 交互式 Intl API 探索工具

## 交叉引用

- [正则表达式速查表](../cheatsheets/regex-cheatsheet) — Unicode 属性转义
- [ES2024+ 新特性速查表](../cheatsheets/es2024-cheatsheet) — Intl API 新功能
- [代码实验室](../code-lab/) — 实践项目
