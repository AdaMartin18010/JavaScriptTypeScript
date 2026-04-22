# 国际化基础指南

> **目标读者**：希望为项目添加多语言支持的开发者
> **版本**：2026-04

---

## 1. i18n 核心概念

| 术语 | 含义 | 示例 |
|------|------|------|
| **i18n** | Internationalization（国际化） | 使应用支持多语言 |
| **l10n** | Localization（本地化） | 为特定语言翻译内容 |
| **Locale** | 语言+地区标识 | `zh-CN`, `en-US`, `ja-JP` |
| **RTL** | Right-to-Left | 阿拉伯语、希伯来语 |

---

## 2. JS/TS i18n 方案

### 2.1 库选型

| 库 | 特点 | 适用 |
|---|------|------|
| **react-i18next** | React 生态标准 | React 应用 |
| **vue-i18n** | Vue 生态标准 | Vue 应用 |
| **FormatJS** | 标准 ICU 消息格式 | 任何框架 |
| **Paraglide JS** | 编译时、类型安全 | 性能敏感 |
| **Lingui** | 宏提取、轻量 | 现代项目 |

### 2.2 ICU 消息格式

```json
{
  "welcome": "Welcome, {name}!",
  "items": "You have {count, plural, =0 {no items} one {one item} other {{count} items}}.",
  "date": "Today is {today, date, long}"
}
```

---

## 3. 工程实践

### 3.1 翻译工作流

```
开发: 代码中使用翻译 key
  ↓
提取: 自动扫描代码生成翻译文件
  ↓
翻译: 翻译平台 (Crowdin / Lokalise / POEditor)
  ↓
集成: 翻译完成后自动合并到仓库
```

### 3.2 RTL 支持

```css
/* 逻辑属性自动适配方向 */
.start { margin-inline-start: 1rem; }  /* LTR: left, RTL: right */
.end { margin-inline-end: 1rem; }      /* LTR: right, RTL: left */
```

---

## 4. 总结

国际化的核心是**早期规划、流程自动化、测试覆盖**。

**关键行动**：
1. 项目启动时就预留 i18n 架构
2. 使用 ICU 标准格式
3. 自动化翻译提取和集成流程
4. UI 测试包含 RTL 布局

---

## 参考资源

- [i18next 文档](https://www.i18next.com/)
- [FormatJS](https://formatjs.io/)
- [W3C i18n](https://www.w3.org/standards/webdesign/i18n)
