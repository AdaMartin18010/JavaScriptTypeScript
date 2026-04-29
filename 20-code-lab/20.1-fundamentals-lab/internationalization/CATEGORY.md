---
dimension: 应用领域
sub-dimension: 国际化与本地化
created: 2026-04-28
---

# 国际化与本地化（i18n / l10n）

本模块归属 **「应用领域」** 维度，聚焦国际化核心概念与工程实践。

## 包含内容

- i18n/l10n 架构、多语言资源管理、RTL 适配、时区与货币处理。

## 相关索引

- `30-knowledge-base/30.2-categories/README.md` — 分类总览
- `20-code-lab/` — 代码实验室实践

## 目录内容

- 📄 README.md
- 📄 THEORY.md
- 📄 _MIGRATED_FROM.md
- 📄 i18n-system.test.ts
- 📄 i18n-system.ts
- 📄 index.ts

---

## i18n 子模块速查

| 子领域 | 核心问题 | 关键技术 |
|--------|---------|---------|
| 文本翻译 | 多语言字符串替换 | ICU MessageFormat, gettext |
| 日期时间 | 时区、日历、格式偏好 | `Intl.DateTimeFormat`, Temporal |
| 数字/货币 | 精度、符号、进位 | `Intl.NumberFormat` |
| 列表/复数 | 复数规则、列表连接 | `Intl.ListFormat`, `Intl.PluralRules` |
| 双向文本 | RTL 语言布局适配 | `dir="rtl"`, `Intl.Locale` |
| 代码分割 | 按需加载语言包 | 动态 `import()`, webpack/i18n 插件 |

---

## 主流库对比

| 库 | 体积(gzip) | 框架绑定 | MessageFormat | 运行时拔插 | 活跃度 |
|---|-----------|---------|---------------|-----------|--------|
| **i18next** | ~15KB | 无（React/Vue/Angular 插件） | ✅ | ✅ | 高 |
| **FormatJS / react-intl** | ~20KB | React 为主 | ✅ | ❌（需编译） | 高 |
| **Lingui** | ~5KB | React/Vue | ✅ | ✅ | 中 |
| **vue-i18n** | ~10KB | Vue 专用 | ✅ | ✅ | 高 |
| **Fluent** (Mozilla) | ~25KB | 无 | 自研语法 | ✅ | 中 |
| **Intl API (原生)** | 0KB | 无 | ❌ | — | 内置 |

---

## 实践映射

### 原生 Intl API 实战

```js
// === 日期时间本地化 ===
const date = new Date('2025-12-25T10:00:00Z');

// 英语（美国）
new Intl.DateTimeFormat('en-US', {
  dateStyle: 'full',
  timeStyle: 'short',
}).format(date);
// 'Thursday, December 25, 2025 at 6:00 AM'（按目标时区）

// 日语
new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'short'
}).format(date);
// '2025年12月25日(木)'

// === 数字与货币 ===
const amount = 1234567.89;

// 德语格式
new Intl.NumberFormat('de-DE', {
  style: 'currency',
  currency: 'EUR',
}).format(amount);
// '1.234.567,89 €'

// 中文紧凑数字
new Intl.NumberFormat('zh-CN', {
  notation: 'compact',
  compactDisplay: 'short',
}).format(1234567);
// '123万'

// === 复数规则 ===
const pr = new Intl.PluralRules('en');
pr.select(0);  // 'zero' 或 'other'（英语中 0 为 other）
pr.select(1);  // 'one'
pr.select(2);  // 'two'（英语中为 other，阿拉伯语中为 two）

// 阿拉伯语复数
const arPr = new Intl.PluralRules('ar');
arPr.select(0); // 'zero'
arPr.select(1); // 'one'
arPr.select(2); // 'two'
arPr.select(3); // 'few'
arPr.select(11); // 'many'

// === 列表格式化 ===
new Intl.ListFormat('en', { type: 'conjunction' })
  .format(['Apple', 'Banana', 'Cherry']);
// 'Apple, Banana, and Cherry'

// === 相对时间 ===
const rtf = new Intl.RelativeTimeFormat('zh', { numeric: 'auto' });
rtf.format(-1, 'day');  // '昨天'
rtf.format(3, 'month'); // '3个月后'
```

### 带复数的 ICU MessageFormat 示例

```ts
import i18next from 'i18next';

// 资源文件
const resources = {
  en: {
    translation: {
      items: '{{count}} item',
      items_plural: '{{count}} items',
      greeting: 'Hello, {{name}}!',
    },
  },
  zh: {
    translation: {
      // 中文无复数变化
      items: '{{count}} 件商品',
      greeting: '你好，{{name}}！',
    },
  },
};

await i18next.init({ lng: 'en', resources });

i18next.t('items', { count: 1 });  // '1 item'
i18next.t('items', { count: 5 });  // '5 items'
i18next.t('greeting', { name: 'Alice' }); // 'Hello, Alice!'
```

---

## 常见误区

| 误区 | 正确理解 |
|------|---------|
| i18n 只是字符串替换 | 还涉及时区、数字格式、RTL 布局、文化禁忌 |
| 翻译文件用 JSON 嵌套即可 | 大规模项目需 ICU MessageFormat 处理复数/性别/占位符 |
| `Intl` API 所有环境都支持 | Node.js < 13 部分缺失，旧浏览器需 polyfill |
| 语言代码用 `zh` 就够了 | 需区分 `zh-Hans`（简体）与 `zh-Hant`（繁体） |

---

## 扩展阅读

- [MDN: Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [ECMA-402: Intl Specification](https://tc39.es/ecma402/)
- [i18next Documentation](https://www.i18next.com/)

- [FormatJS / react-intl](https://formatjs.io/docs/react-intl/)
- [Unicode CLDR](https://cldr.unicode.org/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- `30-knowledge-base/30.2-categories/README.md`

---

*最后更新: 2026-04-29*
