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

## 5. 与相邻模块的关系

- **51-ui-components**: UI 组件的国际化支持
- **18-frontend-frameworks**: 框架的 i18n 生态（react-intl、vue-i18n）
- **37-pwa**: PWA 的多语言 manifest 和推送通知
