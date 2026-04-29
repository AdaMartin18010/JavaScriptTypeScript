# 国际化 — 理论基础

## 1. i18n 核心概念

- **i18n（Internationalization）**: 使应用支持多语言/地区的工程过程
- **l10n（Localization）**: 针对特定语言/地区的适配过程
- **g11n（Globalization）**: i18n + l10n 的总称

## 2. 文本国际化

### 消息格式化（ICU MessageFormat）

```
{count, plural, =0 {无消息} one {1 条消息} other {# 条消息}}
{gender, select, male {他} female {她} other {TA}}
```

### 翻译管理

- **翻译键**: 结构化命名（`common.button.submit`）
- **回退机制**: 目标语言缺失时回退到默认语言
- **动态加载**: 按需加载语言包，减少首屏体积

## 3. 区域适配

| 维度 | 考量 |
|------|------|
| **日期时间** | 格式（MM/DD/YYYY vs DD/MM/YYYY）、时区、历法 |
| **数字** | 千分位分隔符（, vs .）、小数点、货币符号位置 |
| **文本方向** | LTR（左到右）vs RTL（右到左，如阿拉伯语、希伯来语）|
| **排序** | 不同语言的字母顺序规则 |
| **复数规则** | 不同语言的复数形式数量（英语2种，俄语4种，阿拉伯语6种）|

## 4. RTL 布局

- CSS 逻辑属性：`margin-inline-start` 替代 `margin-left`
- 镜像布局：图标、箭头、进度条需要水平翻转
- 文本混合：RTL 文本中嵌入 LTR 内容（如 URL、数字）

## 5. i18n 库深度对比

| 特性 | react-i18next | FormatJS (react-intl) | Lingui | Tolgee |
|------|--------------|----------------------|--------|--------|
| **框架绑定** | React / 通用 | React / 通用 | React / Vue / Svelte | React / Vue / Angular / Svelte |
| **消息语法** | ICU MessageFormat | ICU MessageFormat | ICU MessageFormat + Macros | ICU MessageFormat |
| **提取方式** | CLI 扫描 / 手动 | CLI 扫描 / Babel 插件 | CLI 扫描 / 宏自动提取 | 运行时提取 / CLI |
| **类型安全** | ✅ TypeScript 生成 | 部分支持 | ✅ 编译时类型生成 | ✅ 类型生成 |
| **服务端渲染** | ✅ 完整支持 | ✅ 完整支持 | ✅ 完整支持 | ✅ 完整支持 |
| **运行时体积** | ~14 kB | ~16 kB | ~8 kB | ~10 kB |
| **翻译平台** | 第三方集成 | 第三方集成 | 第三方集成 | **内置翻译平台** |
| **实时编辑** | ❌ | ❌ | ❌ | ✅ In-context 编辑 |
| **机器翻译** | 插件 | 插件 | 插件 | **内置** |
| **开发体验** | Hook / HOC | Hook / Component | 宏标记文本 | SDK + 平台 |
| **社区规模** | 最大 | 大 | 中等 | 快速增长 |
| **适用场景** | 通用企业应用 | 大型国际化项目 | 性能敏感应用 | 快速迭代产品 |

### 选型建议

```
需要翻译管理平台 + 实时协作？
  ├─ 是 → Tolgee
  └─ 否 → 性能优先？
            ├─ 是 → Lingui（宏编译零运行时开销）
            └─ 否 → React 生态深度？
                      ├─ 是 → react-i18next
                      └─ 否 → FormatJS
```

## 6. 代码示例：FormatJS 完整使用实践

```bash
# 安装依赖
npm install react-intl
npm install -D @formatjs/cli babel-plugin-formatjs
```

```typescript
// src/i18n/config.ts — 国际化配置入口
import { createIntl, createIntlCache, IntlShape } from 'react-intl'

// 消息加载器：按语言动态导入
const messageLoaders: Record<string, () => Promise<Record<string, string>>> = {
  'zh-CN': () => import('./locales/zh-CN.json'),
  'en-US': () => import('./locales/en-US.json'),
  'ja-JP': () => import('./locales/ja-JP.json')
}

const cache = createIntlCache()
let intlInstance: IntlShape

export async function loadLocale(locale: string): Promise<IntlShape> {
  const messages = await messageLoaders[locale]()
  intlInstance = createIntl({ locale, messages }, cache)
  return intlInstance
}

export function getIntl(): IntlShape {
  if (!intlInstance) {
    throw new Error('Intl not initialized. Call loadLocale() first.')
  }
  return intlInstance
}
```

```tsx
// src/components/UserProfile.tsx
import { FormattedMessage, FormattedDate, FormattedNumber, useIntl } from 'react-intl'

interface UserProfileProps {
  user: {
    name: string
    joinDate: Date
    balance: number
    messageCount: number
    gender: 'male' | 'female' | 'other'
  }
}

export function UserProfile({ user }: UserProfileProps) {
  const intl = useIntl()

  return (
    <div className="user-profile">
      {/* 基础文本插值 */}
      <h1>
        <FormattedMessage 
          id="user.greeting" 
          defaultMessage="Welcome, {name}!"
          values={{ name: user.name }}
        />
      </h1>

      {/* 复数处理 */}
      <p>
        <FormattedMessage
          id="user.messages"
          defaultMessage="{count, plural, =0 {No messages} one {One message} other {{count} messages}}"
          values={{ count: user.messageCount }}
        />
      </p>

      {/* 性别选择 */}
      <p>
        <FormattedMessage
          id="user.pronoun"
          defaultMessage="{gender, select, male {He} female {She} other {They}} joined on {date}"
          values={{
            gender: user.gender,
            date: intl.formatDate(user.joinDate, { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          }}
        />
      </p>

      {/* 格式化数字（货币） */}
      <p>
        <FormattedMessage
          id="user.balance"
          defaultMessage="Balance: {amount}"
          values={{
            amount: (
              <FormattedNumber
                value={user.balance}
                style="currency"
                currency={intl.locale === 'ja-JP' ? 'JPY' : 'USD'}
              />
            )
          }}
        />
      </p>

      {/* 相对时间 */}
      <p>
        <FormattedMessage
          id="user.lastActive"
          defaultMessage="Last active: {time}"
          values={{
            time: intl.formatRelativeTime(
              -Math.floor((Date.now() - user.joinDate.getTime()) / 86400000),
              'day'
            )
          }}
        />
      </p>
    </div>
  )
}
```

```json
// src/i18n/locales/zh-CN.json — 中文语言包（由 CLI 提取生成）
{
  "user.greeting": "欢迎，{name}！",
  "user.messages": "{count, plural, =0 {没有消息} one {1 条消息} other {{count} 条消息}}",
  "user.pronoun": "{gender, select, male {他} female {她} other {TA}} 于 {date} 加入",
  "user.balance": "余额：{amount}",
  "user.lastActive": "上次活跃：{time}"
}
```

```bash
# 提取所有翻译键到 JSON
npx formatjs extract 'src/**/*.ts*' --out-file src/i18n/locales/en-US.json --id-interpolation-pattern '[sha512:contenthash:base64:6]'

# 编译翻译文件（生成 AST，减少运行时解析开销）
npx formatjs compile src/i18n/locales/zh-CN.json --ast --out-file src/i18n/compiled/zh-CN.json
```

```tsx
// src/App.tsx — 应用根组件包裹 IntlProvider
import { IntlProvider } from 'react-intl'
import { useEffect, useState } from 'react'
import { loadLocale } from './i18n/config'
import { UserProfile } from './components/UserProfile'

export default function App() {
  const [messages, setMessages] = useState<Record<string, string> | null>(null)
  const [locale, setLocale] = useState('zh-CN')

  useEffect(() => {
    loadLocale(locale).then((intl) => {
      setMessages(intl.messages as Record<string, string>)
    })
  }, [locale])

  if (!messages) return <div>Loading translations...</div>

  return (
    <IntlProvider locale={locale} messages={messages}>
      <select value={locale} onChange={(e) => setLocale(e.target.value)}>
        <option value="zh-CN">简体中文</option>
        <option value="en-US">English</option>
        <option value="ja-JP">日本語</option>
      </select>
      <UserProfile 
        user={{
          name: 'Alice',
          joinDate: new Date('2025-06-15'),
          balance: 12345.67,
          messageCount: 42,
          gender: 'female'
        }}
      />
    </IntlProvider>
  )
}
```

## 7. 权威外部资源

- [FormatJS 官方文档](https://formatjs.io/)
- [react-i18next 官方文档](https://react.i18next.com/)
- [Lingui 官方文档](https://lingui.dev/)
- [Tolgee 官方文档](https://tolgee.io/)
- [ICU MessageFormat 规范](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [W3C — Internationalization Activity](https://www.w3.org/International/)
- [MDN — Internationalization API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [CLDR — Unicode Common Locale Data Repository](https://cldr.unicode.org/)
- [The Programmer's Guide to ICU4C](https://unicode-org.github.io/icu/userguide/icu4c/)

## 8. 与相邻模块的关系

- **51-ui-components**: UI 组件的国际化支持
- **18-frontend-frameworks**: 框架的 i18n 生态（react-intl、vue-i18n）
- **37-pwa**: PWA 的多语言 manifest 和推送通知
