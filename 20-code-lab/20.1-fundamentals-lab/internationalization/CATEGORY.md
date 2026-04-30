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
| 排序 | 不同语言的字母顺序 | `Intl.Collator` |
| 显示名称 | 语言/地区/脚本本地名称 | `Intl.DisplayNames` |

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

### RTL 布局适配（React + CSS Logical Properties）

```tsx
// 动态设置文档方向
import { useEffect } from 'react';

function useDocumentDirection(locale: string) {
  const isRTL = ['ar', 'he', 'fa', 'ur'].some((l) => locale.startsWith(l));
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = locale;
  }, [locale, isRTL]);
  return isRTL;
}

// CSS 逻辑属性自动适配方向
// .margin-inline-start { margin-inline-start: 1rem; }
// LTR 时等价于 margin-left，RTL 时等价于 margin-right
```

### 按需加载语言包（动态 import）

```typescript
// i18n.ts — 运行时动态加载翻译文件
import i18next from 'i18next';

async function loadLocale(locale: string) {
  const module = await import(`./locales/${locale}.json`);
  i18next.addResourceBundle(locale, 'translation', module.default);
  await i18next.changeLanguage(locale);
}

// 使用
await loadLocale('zh-CN');
console.log(i18next.t('welcome'));
```

### Intl.Segmenter 文本分段

```js
// 按 grapheme cluster（字素簇）分段，正确处理 emoji 和组合字符
const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const text = '👨‍👩‍👧‍👦 family';
const segments = Array.from(segmenter.segment(text));
console.log(segments.map((s) => s.segment));
// ['👨‍👩‍👧‍👦', ' ', 'f', 'a', 'm', 'i', 'l', 'y']

// 按词分段
const wordSegmenter = new Intl.Segmenter('zh', { granularity: 'word' });
const sentence = 'JavaScript 很强大';
console.log(Array.from(wordSegmenter.segment(sentence)).map((s) => s.segment));
// ['JavaScript', ' ', '很', '强大']
```

### Temporal API 预览（实验性，需 polyfill）

```typescript
// Temporal 是 ECMAScript 的下一阶段日期时间 API，目前需 @js-temporal/polyfill
import { Temporal } from '@js-temporal/polyfill';

// 不可变的 PlainDate / PlainDateTime
const date = Temporal.PlainDate.from('2025-12-25');
const nextWeek = date.add({ days: 7 });
console.log(nextWeek.toString()); // 2026-01-01

// 时区感知的时间点
const zoned = Temporal.Now.zonedDateTimeISO('Asia/Shanghai');
console.log(zoned.toString()); // 2026-04-29T15:57:00+08:00[Asia/Shanghai]

//  Duration 运算
const duration = Temporal.Duration.from({ hours: 2, minutes: 30 });
const later = zoned.add(duration);
```

> ⚠️ Temporal API 仍处于 TC39 Stage 3，生产环境建议使用 polyfill 或继续沿用 `date-fns` / `luxon`。

### Intl.Collator 本地化排序

```js
// 德语中 ä 排在 a 之后，而非按 Unicode 码点
const german = ['äpfel', 'apfel', 'zitrone'];
german.sort(new Intl.Collator('de').compare);
// ['apfel', 'äpfel', 'zitrone']

// 中文按拼音排序
const names = ['张三', '李四', '王五'];
names.sort(new Intl.Collator('zh').compare);
// ['李四', '王五', '张三']

// 忽略大小写和标点
const en = ['A', 'b', 'C'];
en.sort(new Intl.Collator('en', { sensitivity: 'base', ignorePunctuation: true }).compare);
// ['A', 'b', 'C'] — 视为相等时保持原顺序（稳定排序）
```

### Locale Negotiation（语言协商）

```typescript
// 服务端根据 Accept-Language 选择最佳匹配
function negotiateLocale(
  acceptLanguage: string,
  supported: string[]
): string {
  const requested = acceptLanguage
    .split(',')
    .map((s) => s.trim().split(';')[0]);

  for (const locale of requested) {
    // 精确匹配
    if (supported.includes(locale)) return locale;
    // 语言匹配（如 zh-CN → zh）
    const lang = locale.split('-')[0];
    const match = supported.find((s) => s.startsWith(lang));
    if (match) return match;
  }
  return supported[0]; // 回退到默认
}

// 使用 Intl.Locale 解析规范标签
const loc = new Intl.Locale('zh-Hans-CN-u-ca-chinese');
console.log(loc.language);  // 'zh'
console.log(loc.script);    // 'Hans'
console.log(loc.region);    // 'CN'
console.log(loc.calendar);  // 'chinese'
```

### Intl.DisplayNames 显示名称本地化

```js
// 语言、地区、脚本、货币的本地化显示名称
const dn = new Intl.DisplayNames('zh', { type: 'language' });
dn.of('ja'); // '日语'
dn.of('en-US'); // '英语（美国）'

const regionNames = new Intl.DisplayNames('en', { type: 'region' });
regionNames.of('CN'); // 'China'
regionNames.of('JP'); // 'Japan'

const currencyNames = new Intl.DisplayNames('de', { type: 'currency' });
currencyNames.of('EUR'); // 'Euro'
currencyNames.of('CNY'); // 'Renminbi-Yuan'
```

### Intl.DurationFormat（Stage 3 预览）

```js
// 持续时间格式化（Chrome 120+ 实验性支持）
const duration = { years: 1, months: 2, days: 3, hours: 4 };

// 英文数字样式
const enFmt = new Intl.DurationFormat('en', { style: 'long' });
console.log(enFmt.format(duration));
// '1 year, 2 months, 3 days, 4 hours'

// 中文数字样式
const zhFmt = new Intl.DurationFormat('zh', { style: 'short' });
console.log(zhFmt.format(duration));
// '1年2个月3天4小时'
```

### 代码示例：Next.js 中间件中的 Locale 路由

```typescript
// middleware.ts — 自动语言重定向与路由前缀
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'zh', 'ja'];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查路径是否已包含 locale 前缀
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // 从 cookie 或 Accept-Language 推断 locale
  const locale =
    request.cookies.get('NEXT_LOCALE')?.value ??
    negotiateLocale(request.headers.get('accept-language') ?? '', locales);

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 代码示例：CSS-in-JS 中的 RTL 逻辑属性适配

```typescript
// styles/theme.ts — 使用逻辑属性替代物理方向
import { css } from '@emotion/react';

export const cardStyles = css`
  padding-inline: 1.5rem;  /* 替代 padding-left / padding-right */
  padding-block: 1rem;     /* 替代 padding-top / padding-bottom */
  margin-inline-start: 0.5rem; /* 替代 margin-left */
  border-inline-start: 2px solid var(--accent); /* 替代 border-left */
  text-align: start;       /* 替代 text-align: left，自动适配 RTL */
`;

// 对于需要物理方向的特殊场景（如图标），使用 CSS 自定义属性
export const rtlAwareIcon = css`
  transform: var(--rtl-transform, none);

  [dir='rtl'] & {
    --rtl-transform: scaleX(-1);
  }
`;
```

---

## 常见误区

| 误区 | 正确理解 |
|------|---------|
| i18n 只是字符串替换 | 还涉及时区、数字格式、RTL 布局、文化禁忌 |
| 翻译文件用 JSON 嵌套即可 | 大规模项目需 ICU MessageFormat 处理复数/性别/占位符 |
| `Intl` API 所有环境都支持 | Node.js < 13 部分缺失，旧浏览器需 polyfill |
| 语言代码用 `zh` 就够了 | 需区分 `zh-Hans`（简体）与 `zh-Hant`（繁体） |
| 排序直接用 `Array.prototype.sort()` | 不同语言排序规则不同，需 `Intl.Collator` |

---

## 扩展阅读

- [MDN: Intl API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [ECMA-402: Intl Specification](https://tc39.es/ecma402/)
- [i18next Documentation](https://www.i18next.com/)
- [FormatJS / react-intl](https://formatjs.io/docs/react-intl/)
- [Unicode CLDR](https://cldr.unicode.org/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [TC39 Temporal Proposal](https://tc39.es/proposal-temporal/docs/) — 下一代日期时间 API
- [W3C Internationalization](https://www.w3.org/International/) — W3C 国际化标准
- [RTL Styling 101](https://rtlstyling.com/) — 双向文本布局权威指南
- [caniuse — Intl Support](https://caniuse.com/?search=Intl) — Intl API 浏览器兼容性
- [MDN — CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_logical_properties_and_values) — 逻辑属性与双向布局
- [MDN — Intl.Collator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator) — 本地化排序
- [MDN — Intl.DisplayNames](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DisplayNames) — 显示名称本地化
- [MDN — Intl.Locale](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Locale) — BCP 47 语言标签解析
- [ICU4C Collation Guide](https://unicode-org.github.io/icu/userguide/collation/) — Unicode 排序算法指南
- [Next.js Internationalization](https://nextjs.org/docs/app/building-your-application/routing/internationalization) — Next.js 官方 i18n 路由指南
- [Lingui Documentation](https://lingui.dev/) — 编译时提取的轻量 i18n 库
- [Lingui Macro Extraction](https://lingui.dev/ref/macro) — JSX 宏自动提取翻译键
- [Lingui CLI](https://lingui.dev/ref/cli) — 翻译文件提取与编译工具
- [date-fns Time Zones](https://date-fns.org/v3.6.0/docs/Time-Zones) — 轻量级日期处理库时区支持
- [Luxon Documentation](https://moment.github.io/luxon/) — 现代日期时间库（Moment.js 继承者）
- [i18n Ally VS Code Extension](https://github.com/lokalise/i18n-ally) — 翻译键可视化编辑器插件

---

*最后更新: 2026-04-29*
