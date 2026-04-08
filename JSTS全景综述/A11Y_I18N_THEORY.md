# 可访问性 (A11Y) 与国际化 (I18N) 理论完全指南

> 本文档涵盖 Web 可访问性与国际化的理论基础、规范要求、实现指南、代码示例及检查清单。

---

## 目录

- [可访问性 (A11Y) 与国际化 (I18N) 理论完全指南](#可访问性-a11y-与国际化-i18n-理论完全指南)
  - [目录](#目录)
  - [1. 可访问性的理论基础（POUR原则）](#1-可访问性的理论基础pour原则)
    - [1.1 规范要求](#11-规范要求)
    - [1.2 实现指南](#12-实现指南)
      - [可感知性 (Perceivable)](#可感知性-perceivable)
      - [可操作性 (Operable)](#可操作性-operable)
      - [可理解性 (Understandable)](#可理解性-understandable)
      - [健壮性 (Robust)](#健壮性-robust)
    - [1.3 代码示例](#13-代码示例)
      - [TypeScript/React 可访问性组件模式](#typescriptreact-可访问性组件模式)
    - [1.4 检查清单](#14-检查清单)
  - [2. WCAG 2.1/2.2 的形式化要求](#2-wcag-2122-的形式化要求)
    - [2.1 规范要求](#21-规范要求)
      - [合规级别定义](#合规级别定义)
      - [WCAG 2.2 新增成功标准](#wcag-22-新增成功标准)
    - [2.2 实现指南](#22-实现指南)
      - [AA 级别关键要求实现](#aa-级别关键要求实现)
      - [表单错误预防 - 3.3.4 Error Prevention](#表单错误预防---334-error-prevention)
    - [2.3 代码示例](#23-代码示例)
      - [可访问的身份验证 - 3.3.8 Accessible Authentication](#可访问的身份验证---338-accessible-authentication)
    - [2.4 检查清单](#24-检查清单)
  - [3. ARIA 的角色、状态和属性的语义](#3-aria-的角色状态和属性的语义)
    - [3.1 规范要求](#31-规范要求)
      - [ARIA 角色分类](#aria-角色分类)
      - [ARIA 状态与属性](#aria-状态与属性)
    - [3.2 实现指南](#32-实现指南)
      - [ARIA 使用第一规则](#aria-使用第一规则)
      - [关系属性使用](#关系属性使用)
    - [3.3 代码示例](#33-代码示例)
      - [完全可访问的自定义选择组件](#完全可访问的自定义选择组件)
      - [实时区域 (Live Region) 实现](#实时区域-live-region-实现)
    - [3.4 检查清单](#34-检查清单)
  - [4. 键盘导航的焦点管理理论](#4-键盘导航的焦点管理理论)
    - [4.1 规范要求](#41-规范要求)
      - [焦点管理原则](#焦点管理原则)
      - [焦点顺序逻辑](#焦点顺序逻辑)
    - [4.2 实现指南](#42-实现指南)
      - [焦点可见性样式](#焦点可见性样式)
      - [焦点陷阱（Focus Trap）实现](#焦点陷阱focus-trap实现)
    - [4.3 代码示例](#43-代码示例)
      - [完整的焦点管理系统](#完整的焦点管理系统)
    - [4.4 检查清单](#44-检查清单)
  - [5. 屏幕阅读器的交互模型](#5-屏幕阅读器的交互模型)
    - [5.1 规范要求](#51-规范要求)
      - [屏幕阅读器工作原理](#屏幕阅读器工作原理)
      - [虚拟光标与浏览模式](#虚拟光标与浏览模式)
    - [5.2 实现指南](#52-实现指南)
      - [可访问性树优化](#可访问性树优化)
      - [屏幕阅读器专用内容](#屏幕阅读器专用内容)
    - [5.3 代码示例](#53-代码示例)
      - [屏幕阅读器优化的表格](#屏幕阅读器优化的表格)
      - [屏幕阅读器公告系统](#屏幕阅读器公告系统)
    - [5.4 检查清单](#54-检查清单)
  - [6. 国际化的理论基础（Unicode、Locale、CLDR）](#6-国际化的理论基础unicodelocalecldr)
    - [6.1 规范要求](#61-规范要求)
      - [Unicode 核心概念](#unicode-核心概念)
      - [Locale 标识符结构 (BCP 47)](#locale-标识符结构-bcp-47)
      - [CLDR (Unicode Common Locale Data Repository)](#cldr-unicode-common-locale-data-repository)
    - [6.2 实现指南](#62-实现指南)
      - [Unicode 规范化](#unicode-规范化)
      - [Locale 解析与匹配](#locale-解析与匹配)
    - [6.3 代码示例](#63-代码示例)
      - [完整的国际化配置系统](#完整的国际化配置系统)
      - [复数处理实现](#复数处理实现)
    - [6.4 检查清单](#64-检查清单)
  - [7. 文本方向（LTR/RTL）的布局算法](#7-文本方向ltrrtl的布局算法)
    - [7.1 规范要求](#71-规范要求)
      - [Unicode 双向算法 (UBA)](#unicode-双向算法-uba)
      - [CSS 逻辑属性](#css-逻辑属性)
    - [7.2 实现指南](#72-实现指南)
      - [CSS 逻辑属性全面应用](#css-逻辑属性全面应用)
      - [RTL 布局适配](#rtl-布局适配)
    - [7.3 代码示例](#73-代码示例)
      - [React 方向感知组件](#react-方向感知组件)
      - [动态方向检测](#动态方向检测)
    - [7.4 检查清单](#74-检查清单)
  - [8. 日期、时间、数字的本地化格式](#8-日期时间数字的本地化格式)
    - [8.1 规范要求](#81-规范要求)
      - [日期时间格式标准](#日期时间格式标准)
      - [数字格式标准](#数字格式标准)
    - [8.2 实现指南](#82-实现指南)
      - [Intl.DateTimeFormat 使用](#intldatetimeformat-使用)
      - [数字格式化](#数字格式化)
    - [8.3 代码示例](#83-代码示例)
      - [React 本地化格式化 Hook](#react-本地化格式化-hook)
    - [8.4 检查清单](#84-检查清单)
  - [9. 翻译管理（i18n 库架构）](#9-翻译管理i18n-库架构)
    - [9.1 规范要求](#91-规范要求)
      - [i18n 架构核心组件](#i18n-架构核心组件)
    - [9.2 实现指南](#92-实现指南)
      - [react-i18next 实现](#react-i18next-实现)
      - [FormatJS (react-intl) 实现](#formatjs-react-intl-实现)
    - [9.3 代码示例](#93-代码示例)
      - [翻译提取和同步工具](#翻译提取和同步工具)
      - [运行时翻译加载器](#运行时翻译加载器)
    - [9.4 检查清单](#94-检查清单)
  - [10. 可访问性测试的自动化](#10-可访问性测试的自动化)
    - [10.1 规范要求](#101-规范要求)
      - [自动化测试层次](#自动化测试层次)
    - [10.2 实现指南](#102-实现指南)
      - [axe-core 集成](#axe-core-集成)
      - [React 组件可访问性测试](#react-组件可访问性测试)
      - [Cypress 可访问性测试](#cypress-可访问性测试)
    - [10.3 代码示例](#103-代码示例)
      - [Lighthouse CI 配置](#lighthouse-ci-配置)
      - [GitHub Actions 工作流](#github-actions-工作流)
      - [可访问性监控仪表板](#可访问性监控仪表板)
    - [10.4 检查清单](#104-检查清单)
  - [附录](#附录)
    - [A. 参考资源](#a-参考资源)
    - [B. 浏览器开发者工具](#b-浏览器开发者工具)
    - [C. 屏幕阅读器测试](#c-屏幕阅读器测试)

---

## 1. 可访问性的理论基础（POUR原则）

### 1.1 规范要求

**POUR原则**是 Web 可访问性的四大基石，定义于 WCAG 2.1 规范：

| 原则 | 英文全称 | 核心定义 | 目标群体 |
|------|----------|----------|----------|
| **P**erceivable | 可感知性 | 信息和用户界面组件必须以可感知的方式呈现给用户 | 视觉、听觉障碍用户 |
| **O**perable | 可操作性 | 用户界面组件和导航必须可操作 | 运动障碍、认知障碍用户 |
| **U**nderstandable | 可理解性 | 信息和用户界面操作必须可理解 | 认知障碍、学习障碍用户 |
| **R**obust | 健壮性 | 内容必须足够健壮，能被各种用户代理（包括辅助技术）可靠地解释 | 所有用户、未来技术 |

### 1.2 实现指南

#### 可感知性 (Perceivable)

```html
<!-- 为图像提供替代文本 -->
<img src="chart.png" alt="2024年第一季度销售额增长25%的柱状图" />

<!-- 为视频提供字幕 -->
<video controls>
  <source src="tutorial.mp4" type="video/mp4" />
  <track kind="captions" src="captions.vtt" srclang="zh" label="中文字幕" />
</video>

<!-- 确保足够的颜色对比度 -->
<p style="color: #333; background-color: #fff;">
  高对比度文本
</p>
```

#### 可操作性 (Operable)

```html
<!-- 所有功能可通过键盘访问 -->
<button onclick="submit()">提交</button>
<!-- 而非 -->
<div onclick="submit()">提交</div>

<!-- 提供跳过链接 -->
<a href="#main-content" class="skip-link">跳转到主内容</a>
<main id="main-content">
  <!-- 主要内容 -->
</main>
```

#### 可理解性 (Understandable)

```html
<!-- 使用清晰的语言 -->
<label for="email">电子邮件地址</label>
<input type="email" id="email" aria-describedby="email-help" />
<div id="email-help">请输入有效的电子邮件地址，例如：user@example.com</div>

<!-- 提供错误预防和纠正 -->
<input
  type="password"
  aria-invalid="true"
  aria-describedby="password-error"
/>
<div id="password-error" role="alert">密码必须包含至少8个字符</div>
```

#### 健壮性 (Robust)

```html
<!-- 有效的 HTML 标记 -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>页面标题</title>
</head>
<body>
  <!-- 语义化 HTML -->
  <nav aria-label="主导航">
    <ul>
      <li><a href="/">首页</a></li>
    </ul>
  </nav>
</body>
</html>
```

### 1.3 代码示例

#### TypeScript/React 可访问性组件模式

```typescript
// components/AccessibleButton.tsx
import React, { ButtonHTMLAttributes, forwardRef } from 'react';

interface AccessibleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮的描述性标签 */
  label: string;
  /** 是否处于加载状态 */
  isLoading?: boolean;
  /** 加载状态的替代文本 */
  loadingText?: string;
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({ label, isLoading, loadingText, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        disabled={disabled || isLoading}
        aria-label={isLoading ? loadingText : label}
        aria-busy={isLoading}
      >
        {isLoading && <span className="spinner" aria-hidden="true" />}
        {children || label}
      </button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
```

```typescript
// hooks/useA11yAnnouncement.ts
import { useCallback, useRef } from 'react';

export function useA11yAnnouncement() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announcerRef.current) {
      announcerRef.current = document.createElement('div');
      announcerRef.current.setAttribute('aria-live', priority);
      announcerRef.current.setAttribute('aria-atomic', 'true');
      announcerRef.current.className = 'sr-only';
      document.body.appendChild(announcerRef.current);
    }

    // 清空后设置新消息，确保屏幕阅读器会朗读
    announcerRef.current.textContent = '';
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 100);
  }, []);

  return { announce };
}
```

### 1.4 检查清单

| 检查项 | POUR原则 | 优先级 | 检查方法 |
|--------|----------|--------|----------|
| 所有图片都有有意义的 `alt` 文本 | 可感知性 | P0 | 视觉检查 + 屏幕阅读器测试 |
| 视频/音频内容有替代格式 | 可感知性 | P0 | 功能测试 |
| 颜色不是传递信息的唯一方式 | 可感知性 | P0 | 灰度测试 |
| 文本对比度至少 4.5:1（正常）/ 3:1（大文本） | 可感知性 | P0 | 对比度检查工具 |
| 所有交互元素可通过键盘访问 | 可操作性 | P0 | Tab键导航测试 |
| 没有键盘陷阱 | 可操作性 | P0 | Tab键循环测试 |
| 提供跳过导航链接 | 可操作性 | P1 | 键盘测试 |
| 表单错误有清晰的说明 | 可理解性 | P0 | 功能测试 |
| 页面有描述性标题 | 可理解性 | P1 | 视觉检查 |
| HTML 通过验证 | 健壮性 | P1 | W3C Validator |
| 使用语义化 HTML 元素 | 健壮性 | P0 | 代码审查 |

---

## 2. WCAG 2.1/2.2 的形式化要求

### 2.1 规范要求

#### 合规级别定义

| 级别 | 要求 | 适用场景 |
|------|------|----------|
| **A** | 最低级别，如果不满足，某些用户群体将无法访问内容 | 基础合规 |
| **AA** | 解决最常见障碍，许多组织以此为目标 | 推荐标准 |
| **AAA** | 最高级别，并非所有内容都能满足 | 特殊需求 |

#### WCAG 2.2 新增成功标准

| 成功标准 | 级别 | 描述 |
|----------|------|------|
| 2.4.11 Focus Not Obscured (Minimum) | AA | 焦点元素不被完全遮挡 |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | 焦点元素不被任何部分遮挡 |
| 2.4.13 Focus Appearance | AAA | 焦点指示器有特定视觉要求 |
| 2.5.7 Dragging Movements | AA | 提供拖拽的替代操作方式 |
| 2.5.8 Target Size (Minimum) | AA | 目标尺寸至少 24×24 CSS 像素 |
| 3.2.6 Consistent Help | A | 帮助机制在页面间位置一致 |
| 3.3.7 Redundant Entry | A | 避免重复输入相同信息 |
| 3.3.8 Accessible Authentication (Minimum) | AA | 提供无障碍认证方式 |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | 无需认知功能测试的认证 |

### 2.2 实现指南

#### AA 级别关键要求实现

```css
/* 焦点可见性 - 2.4.7 Focus Visible */
:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 2px;
}

/* 目标尺寸 - 2.5.8 Target Size */
.min-target-size {
  min-width: 24px;
  min-height: 24px;
}

/* 文本间距适配 - 1.4.12 Text Spacing */
.respect-text-spacing {
  line-height: 1.5;
  letter-spacing: 0.12em;
  word-spacing: 0.16em;
  margin-bottom: 2em;
}
```

#### 表单错误预防 - 3.3.4 Error Prevention

```typescript
// 表单提交前确认
function ConfirmSubmitForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 检查是否有数据修改
    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        '您有未保存的更改。确定要提交吗？'
      );
      if (!confirmed) return;
    }

    // 提交逻辑
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单字段 */}
      <button type="submit">提交</button>
    </form>
  );
}
```

### 2.3 代码示例

#### 可访问的身份验证 - 3.3.8 Accessible Authentication

```typescript
// 提供多种认证方式
interface AuthOptions {
  password: boolean;
  otp: boolean;
  magicLink: boolean;
  webAuthn: boolean;
}

function AccessibleAuth() {
  const [method, setMethod] = useState<'password' | 'otp' | 'magic-link'>('password');

  return (
    <div>
      <fieldset>
        <legend>选择登录方式</legend>

        <label>
          <input
            type="radio"
            name="auth-method"
            value="password"
            checked={method === 'password'}
            onChange={(e) => setMethod(e.target.value as any)}
          />
          密码登录
        </label>

        <label>
          <input
            type="radio"
            name="auth-method"
            value="otp"
            checked={method === 'otp'}
            onChange={(e) => setMethod(e.target.value as any)}
          />
          验证码登录（发送到邮箱/手机）
        </label>

        <label>
          <input
            type="radio"
            name="auth-method"
            value="magic-link"
            checked={method === 'magic-link'}
            onChange={(e) => setMethod(e.target.value as any)}
          />
          魔法链接登录（无需记忆密码）
        </label>
      </fieldset>

      {method === 'password' && <PasswordLogin />}
      {method === 'otp' && <OTPLogin />}
      {method === 'magic-link' && <MagicLinkLogin />}
    </div>
  );
}

// OTP 组件 - 支持粘贴
function OTPLogin() {
  const [code, setCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 支持从任何地方粘贴完整验证码
  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    setCode(pasted);
  };

  return (
    <div>
      <label htmlFor="otp-code">输入6位验证码</label>
      <input
        ref={inputRef}
        id="otp-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        onPaste={handlePaste}
        aria-describedby="otp-help"
      />
      <p id="otp-help">验证码已发送至您的邮箱/手机</p>
    </div>
  );
}
```

### 2.4 检查清单

| 成功标准 | 级别 | 检查项 | 验证方法 |
|----------|------|--------|----------|
| 1.1.1 Non-text Content | A | 所有非文本内容有文本替代 | 图像分析工具 |
| 1.3.1 Info and Relationships | A | 信息结构可通过编程确定 | 屏幕阅读器测试 |
| 1.4.3 Contrast (Minimum) | AA | 对比度 ≥ 4.5:1（正常文本） | 对比度分析器 |
| 1.4.4 Resize Text | AA | 文本可放大至200% | 浏览器缩放测试 |
| 2.1.1 Keyboard | A | 所有功能可通过键盘操作 | Tab/Enter/Space测试 |
| 2.4.3 Focus Order | A | 焦点顺序符合逻辑 | Tab导航测试 |
| 2.4.7 Focus Visible | AA | 焦点始终可见 | 键盘导航视觉检查 |
| 2.5.8 Target Size (Minimum) | AA | 点击目标 ≥ 24×24px | DevTools测量 |
| 3.1.1 Language of Page | A | 页面有语言标识 | HTML验证 |
| 3.3.1 Error Identification | A | 错误清晰标识 | 表单测试 |
| 3.3.2 Labels or Instructions | A | 标签和说明可见 | 视觉检查 |
| 4.1.2 Name, Role, Value | A | 组件名称、角色、值可编程确定 | 辅助技术测试 |

---

## 3. ARIA 的角色、状态和属性的语义

### 3.1 规范要求

#### ARIA 角色分类

| 类别 | 角色示例 | 用途 |
|------|----------|------|
| **抽象角色** | `role="command"`, `role="input"` | 仅用于定义其他角色，不直接使用 |
| **小部件角色** | `button`, `checkbox`, `dialog`, `tabpanel` | 交互式UI组件 |
| **复合小部件角色** | `combobox`, `grid`, `listbox`, `menu` | 包含多个元素的复杂组件 |
| **文档结构角色** | `article`, `heading`, `list`, `region` | 组织内容结构 |
| **地标角色** | `banner`, `main`, `navigation`, `search` | 页面导航标识 |
| **实时区域角色** | `alert`, `log`, `status`, `timer` | 动态内容更新 |
| **窗口角色** | `alertdialog`, `dialog` | 特殊窗口类型 |

#### ARIA 状态与属性

| 类型 | 属性/状态 | 描述 |
|------|-----------|------|
| **小部件属性** | `aria-autocomplete`, `aria-haspopup`, `aria-expanded` | 小部件行为 |
| **实时区域属性** | `aria-live`, `aria-atomic`, `aria-relevant` | 内容更新通知 |
| **拖拽属性** | `aria-dropeffect`, `aria-grabbed` | 拖拽操作 |
| **关系属性** | `aria-controls`, `aria-describedby`, `aria-labelledby` | 元素关联 |
| **状态** | `aria-busy`, `aria-disabled`, `aria-hidden`, `aria-selected` | 当前状态 |

### 3.2 实现指南

#### ARIA 使用第一规则

> **如果可以使用原生 HTML 元素实现相同功能，就不要使用 ARIA。**

```html
<!-- ❌ 错误：使用 ARIA 代替原生按钮 -->
<div role="button" tabindex="0" onclick="handleClick()">点击我</div>

<!-- ✅ 正确：使用原生按钮 -->
<button onclick="handleClick()">点击我</button>

<!-- ✅ 正确使用 ARIA：自定义组件 -->
<div role="tablist" aria-label="设置选项卡">
  <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1">
    通用设置
  </button>
  <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2">
    安全设置
  </button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1">
  <!-- 通用设置内容 -->
</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" hidden>
  <!-- 安全设置内容 -->
</div>
```

#### 关系属性使用

```html
<!-- aria-labelledby：多个标签组合 -->
<h2 id="section-title">月度报告</h2>
<button aria-labelledby="section-title action-type" id="action-type">
  下载
</button>
<!-- 屏幕阅读器朗读："月度报告 下载" -->

<!-- aria-describedby：提供额外描述 -->
<input
  type="password"
  id="password"
  aria-describedby="password-requirements"
/>
<div id="password-requirements">
  密码必须包含：至少8个字符、1个大写字母、1个数字
</div>

<!-- aria-controls：控制关系 -->
<button aria-expanded="false" aria-controls="faq-answer-1" id="faq-question-1">
  常见问题1
</button>
<div id="faq-answer-1" role="region" aria-labelledby="faq-question-1" hidden>
  答案内容...
</div>
```

### 3.3 代码示例

#### 完全可访问的自定义选择组件

```typescript
// components/AccessibleSelect.tsx
import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface AccessibleSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export function AccessibleSelect({
  label,
  options,
  value,
  onChange,
  placeholder = '请选择...',
  error,
}: AccessibleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const selectedOption = options.find(opt => opt.value === value);
  const activeDescendant = highlightedIndex >= 0
    ? `option-${highlightedIndex}`
    : undefined;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          onChange(options[highlightedIndex].value);
          setIsOpen(false);
          buttonRef.current?.focus();
        } else {
          setIsOpen(true);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex(prev =>
            Math.min(prev + 1, options.length - 1)
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setHighlightedIndex(options.length - 1);
        } else {
          setHighlightedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(options.length - 1);
        break;
    }
  }, [isOpen, highlightedIndex, options, onChange]);

  // 滚动高亮项到视图
  React.useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [isOpen, highlightedIndex]);

  const selectId = `select-${label.replace(/\s+/g, '-').toLowerCase()}`;
  const labelId = `${selectId}-label`;
  const errorId = `${selectId}-error`;

  return (
    <div className="accessible-select">
      <label id={labelId} className="select-label">
        {label}
      </label>

      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${selectId}-listbox`}
        aria-activedescendant={activeDescendant}
        aria-labelledby={labelId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={!!error}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`select-button ${error ? 'error' : ''}`}
      >
        <span className="select-value">
          {selectedOption?.label || placeholder}
        </span>
        <span className="select-arrow" aria-hidden="true">▼</span>
      </button>

      {isOpen && (
        <div
          ref={listboxRef}
          id={`${selectId}-listbox`}
          role="listbox"
          aria-labelledby={labelId}
          className="select-listbox"
        >
          {options.map((option, index) => (
            <div
              key={option.value}
              ref={el => optionRefs.current[index] = el}
              id={`option-${index}`}
              role="option"
              aria-selected={value === option.value}
              aria-disabled={option.disabled}
              className={`select-option
                ${value === option.value ? 'selected' : ''}
                ${index === highlightedIndex ? 'highlighted' : ''}
                ${option.disabled ? 'disabled' : ''}
              `}
              onClick={() => {
                if (!option.disabled) {
                  onChange(option.value);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div id={errorId} className="select-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
```

#### 实时区域 (Live Region) 实现

```typescript
// hooks/useLiveRegion.ts
import { useEffect, useRef, useCallback } from 'react';

type LiveRegionPriority = 'polite' | 'assertive';

export function useLiveRegion() {
  const regionsRef = useRef<Map<LiveRegionPriority, HTMLDivElement>>(new Map());

  useEffect(() => {
    // 创建并挂载实时区域
    const priorities: LiveRegionPriority[] = ['polite', 'assertive'];

    priorities.forEach(priority => {
      const region = document.createElement('div');
      region.setAttribute('aria-live', priority);
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(region);
      regionsRef.current.set(priority, region);
    });

    return () => {
      regionsRef.current.forEach(region => {
        document.body.removeChild(region);
      });
      regionsRef.current.clear();
    };
  }, []);

  const announce = useCallback((message: string, priority: LiveRegionPriority = 'polite') => {
    const region = regionsRef.current.get(priority);
    if (!region) return;

    // 清空后设置新消息，确保朗读
    region.textContent = '';

    // 使用 requestAnimationFrame 确保 DOM 更新
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        region.textContent = message;
      });
    });
  }, []);

  return { announce };
}

// 使用示例
function SearchComponent() {
  const { announce } = useLiveRegion();
  const [results, setResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    announce('正在搜索...', 'polite');

    try {
      const data = await fetchSearchResults(query);
      setResults(data);
      announce(`找到 ${data.length} 个结果`, 'polite');
    } catch (error) {
      announce('搜索出错，请稍后重试', 'assertive');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div>
      <input
        type="search"
        onChange={(e) => handleSearch(e.target.value)}
        aria-busy={isSearching}
      />
      <ul aria-label="搜索结果">
        {results.map(result => (
          <li key={result}>{result}</li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.4 检查清单

| 检查项 | ARIA 规范 | 优先级 | 检查方法 |
|--------|-----------|--------|----------|
| 不使用 ARIA 替代原生语义 | ARIA 第一规则 | P0 | 代码审查 |
| 所有交互元素有明确的 role | 角色定义 | P0 | 屏幕阅读器测试 |
| 动态状态变化同步到 ARIA 属性 | 状态管理 | P0 | 动态内容测试 |
| 使用 aria-label 或 aria-labelledby 提供可访问名称 | 命名计算 | P0 | 可访问性树检查 |
| 使用 aria-describedby 关联描述文本 | 关系属性 | P1 | 屏幕阅读器测试 |
| 焦点管理正确设置 aria-activedescendant | 焦点管理 | P1 | 键盘导航测试 |
| 实时区域 (aria-live) 正确使用 | 实时区域 | P1 | 屏幕阅读器测试 |
| 错误消息使用 role="alert" 或 aria-live="assertive" | 错误通知 | P0 | 错误状态测试 |
| 模态对话框正确管理焦点和 aria-modal | 模态对话框 | P0 | 焦点陷阱测试 |
| 自定义组件遵循 ARIA 设计模式 | 设计模式 | P1 | 模式符合性检查 |

---

## 4. 键盘导航的焦点管理理论

### 4.1 规范要求

#### 焦点管理原则

| 原则 | 描述 | WCAG 关联 |
|------|------|-----------|
| **焦点可见性** | 用户必须始终知道当前焦点位置 | 2.4.7 Focus Visible |
| **焦点顺序** | 焦点移动顺序必须符合逻辑 | 2.4.3 Focus Order |
| **无焦点陷阱** | 用户必须能用键盘离开任何组件 | 2.1.2 No Keyboard Trap |
| **焦点恢复** | 焦点应在适当情况下返回到触发元素 | 最佳实践 |

#### 焦点顺序逻辑

```
视觉顺序应与 DOM 顺序一致：
┌─────────────────────────────────────┐
│  1. 跳过导航链接                      │
├─────────────────────────────────────┤
│  2. Logo / 首页链接                   │
├─────────────────────────────────────┤
│  3. 主导航 (从左到右)                 │
│     3.1 导航项 1                      │
│     3.2 导航项 2                      │
│     3.3 导航项 3                      │
├─────────────────────────────────────┤
│  4. 主内容区                          │
│     4.1 标题                          │
│     4.2 表单字段 (从上到下)            │
│     4.3 操作按钮                      │
├─────────────────────────────────────┤
│  5. 页脚链接                          │
└─────────────────────────────────────┘
```

### 4.2 实现指南

#### 焦点可见性样式

```css
/* 基础焦点样式 */
:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
}

/* 仅键盘焦点的样式（鼠标点击不显示） */
:focus:not(:focus-visible) {
  outline: none;
}

:focus-visible {
  outline: 3px solid #005fcc;
  outline-offset: 3px;
  border-radius: 2px;
}

/* 自定义组件焦点样式 */
.custom-button:focus-visible {
  box-shadow: 0 0 0 3px #005fcc, 0 0 0 5px white;
}

/* 焦点指示器高对比度模式支持 */
@media (forced-colors: active) {
  :focus-visible {
    outline: 3px solid CanvasText;
  }
}
```

#### 焦点陷阱（Focus Trap）实现

```typescript
// hooks/useFocusTrap.ts
import { useEffect, useRef, useCallback } from 'react';

const FOCUSABLE_SELECTORS = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(', ');

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS)
    );
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab' || !containerRef.current) return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Shift + Tab：向后导航
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab：向前导航
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }, [getFocusableElements]);

  useEffect(() => {
    if (!isActive) return;

    // 保存当前焦点元素
    previousActiveElement.current = document.activeElement as HTMLElement;

    // 聚焦到第一个可聚焦元素
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // 恢复之前的焦点
      previousActiveElement.current?.focus();
    };
  }, [isActive, handleKeyDown, getFocusableElements]);

  return containerRef;
}

// 使用示例 - 模态对话框
function Modal({ isOpen, onClose, children }: ModalProps) {
  const containerRef = useFocusTrap(isOpen);

  return isOpen ? (
    <div className="modal-overlay" onClick={onClose}>
      <div
        ref={containerRef}
        className="modal-content"
        role="dialog"
        aria-modal="true"
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  ) : null;
}
```

### 4.3 代码示例

#### 完整的焦点管理系统

```typescript
// utils/focusManager.ts

export interface FocusManagerConfig {
  /** 焦点容器 */
  container: HTMLElement;
  /** 是否循环焦点 */
  loop?: boolean;
  /** 初始焦点元素选择器 */
  initialFocus?: string;
  /** 恢复焦点元素 */
  returnFocus?: HTMLElement | null;
}

export class FocusManager {
  private container: HTMLElement;
  private loop: boolean;
  private previousFocus: HTMLElement | null = null;
  private observers: (() => void)[] = [];

  constructor(config: FocusManagerConfig) {
    this.container = config.container;
    this.loop = config.loop ?? true;
    this.previousFocus = config.returnFocus ?? (document.activeElement as HTMLElement);

    this.init(config.initialFocus);
  }

  private init(initialFocus?: string) {
    // 设置初始焦点
    if (initialFocus) {
      const element = this.container.querySelector(initialFocus) as HTMLElement;
      element?.focus();
    } else {
      this.focusFirst();
    }

    // 监听键盘事件
    this.container.addEventListener('keydown', this.handleKeyDown);

    // 监听焦点变化
    this.setupFocusIndicator();
  }

  private getFocusableElements(): HTMLElement[] {
    const selector = `
      button:not([disabled]):not([aria-hidden="true"]),
      a[href]:not([aria-hidden="true"]),
      input:not([disabled]):not([type="hidden"]):not([aria-hidden="true"]),
      select:not([disabled]):not([aria-hidden="true"]),
      textarea:not([disabled]):not([aria-hidden="true"]),
      [tabindex="0"]:not([aria-hidden="true"]),
      [contenteditable="true"]:not([aria-hidden="true"])
    `;

    return Array.from(this.container.querySelectorAll(selector))
      .filter(el => {
        // 检查元素是否可见
        const style = window.getComputedStyle(el as Element);
        return style.display !== 'none' && style.visibility !== 'hidden';
      }) as HTMLElement[];
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);

    if (e.shiftKey) {
      // 向后导航
      if (currentIndex <= 0) {
        if (this.loop) {
          e.preventDefault();
          lastElement.focus();
        }
      }
    } else {
      // 向前导航
      if (currentIndex >= focusableElements.length - 1 || currentIndex === -1) {
        if (this.loop) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  private setupFocusIndicator() {
    // 添加焦点可见性指示器
    const style = document.createElement('style');
    style.textContent = `
      [data-focus-managed] :focus-visible {
        outline: 3px solid #005fcc !important;
        outline-offset: 2px !important;
      }
    `;
    document.head.appendChild(style);
    this.container.setAttribute('data-focus-managed', 'true');

    this.observers.push(() => {
      document.head.removeChild(style);
    });
  }

  focusFirst() {
    const elements = this.getFocusableElements();
    elements[0]?.focus();
  }

  focusLast() {
    const elements = this.getFocusableElements();
    elements[elements.length - 1]?.focus();
  }

  focusNext() {
    const elements = this.getFocusableElements();
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
    elements[currentIndex + 1]?.focus();
  }

  focusPrevious() {
    const elements = this.getFocusableElements();
    const currentIndex = elements.indexOf(document.activeElement as HTMLElement);
    elements[currentIndex - 1]?.focus();
  }

  restore() {
    this.previousFocus?.focus();
    this.destroy();
  }

  destroy() {
    this.container.removeEventListener('keydown', this.handleKeyDown);
    this.observers.forEach(cleanup => cleanup());
    this.observers = [];
  }
}

// React Hook 封装
export function useFocusManager(isActive: boolean, options?: Omit<FocusManagerConfig, 'container'>) {
  const containerRef = useRef<HTMLElement>(null);
  const managerRef = useRef<FocusManager | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    managerRef.current = new FocusManager({
      container: containerRef.current,
      ...options,
    });

    return () => {
      managerRef.current?.destroy();
    };
  }, [isActive, options]);

  return { containerRef, manager: managerRef };
}
```

### 4.4 检查清单

| 检查项 | 规范要求 | 优先级 | 测试方法 |
|--------|----------|--------|----------|
| 所有交互元素可通过 Tab 键访问 | 2.1.1 Keyboard | P0 | Tab 遍历测试 |
| 焦点顺序符合视觉/逻辑顺序 | 2.4.3 Focus Order | P0 | Tab 顺序验证 |
| 焦点始终可见 | 2.4.7 Focus Visible | P0 | 视觉检查 |
| 模态对话框限制焦点在内部 | 最佳实践 | P0 | 焦点陷阱测试 |
| 关闭模态后焦点返回到触发元素 | 最佳实践 | P1 | 焦点恢复测试 |
| 没有键盘陷阱 | 2.1.2 No Keyboard Trap | P0 | Esc/Tab 退出测试 |
| 自定义组件支持箭头键导航 | ARIA 最佳实践 | P1 | 键盘导航测试 |
| 支持 Home/End/PageUp/PageDown | ARIA 最佳实践 | P2 | 扩展键测试 |
| 焦点样式在高对比度模式可见 | 高对比度支持 | P1 | Windows 高对比度测试 |

---

## 5. 屏幕阅读器的交互模型

### 5.1 规范要求

#### 屏幕阅读器工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                     屏幕阅读器架构                           │
├─────────────────────────────────────────────────────────────┤
│  用户界面层  │ 语音输出、盲文输出、视觉高亮                     │
├─────────────────────────────────────────────────────────────┤
│  处理引擎    │ 语义解析、导航管理、命令解释                     │
├─────────────────────────────────────────────────────────────┤
│  可访问性API │ 可访问性树访问、事件监听                         │
│             │ • MSAA / UI Automation (Windows)               │
│             │ • NSAccessibility (macOS)                      │
│             │ • AT-SPI (Linux)                               │
├─────────────────────────────────────────────────────────────┤
│  浏览器层    │ 构建可访问性树、映射 ARIA/原生语义               │
└─────────────────────────────────────────────────────────────┘
```

#### 虚拟光标与浏览模式

| 模式 | 描述 | 典型使用场景 |
|------|------|--------------|
| **浏览模式** | 使用虚拟光标逐行/元素阅读 | 阅读文档内容 |
| **表单模式** | 直接与应用交互 | 填写表单 |
| **应用模式** | 键盘事件直接传递给应用 | 复杂自定义组件 |

### 5.2 实现指南

#### 可访问性树优化

```html
<!-- ❌ 不良实践：缺乏语义结构 -->
<div class="nav">
  <div class="item" onclick="goHome()">首页</div>
  <div class="item" onclick="goAbout()">关于</div>
</div>

<!-- ✅ 良好实践：清晰的语义结构 -->
<nav aria-label="主导航">
  <ul>
    <li><a href="/">首页</a></li>
    <li><a href="/about">关于</a></li>
  </ul>
</nav>
```

#### 屏幕阅读器专用内容

```css
/* 仅屏幕阅读器可见 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 当元素获得焦点时可见（跳过链接） */
.sr-only-focusable:focus,
.sr-only-focusable:active {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

### 5.3 代码示例

#### 屏幕阅读器优化的表格

```typescript
// components/AccessibleTable.tsx
import React from 'react';

interface Column {
  key: string;
  title: string;
  sortable?: boolean;
}

interface AccessibleTableProps<T> {
  columns: Column[];
  data: T[];
  caption: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export function AccessibleTable<T extends Record<string, any>>({
  columns,
  data,
  caption,
  sortColumn,
  sortDirection,
  onSort,
}: AccessibleTableProps<T>) {
  const tableId = React.useId();

  return (
    <div className="table-container" role="region" aria-labelledby={`${tableId}-caption`} tabIndex={0}>
      <table aria-labelledby={`${tableId}-caption`}>
        <caption id={`${tableId}-caption`} className="sr-only">
          {caption}，可按列标题排序
        </caption>

        <thead>
          <tr>
            {columns.map(column => (
              <th
                key={column.key}
                scope="col"
                aria-sort={sortColumn === column.key ? sortDirection : undefined}
              >
                {column.sortable ? (
                  <button
                    onClick={() => onSort?.(column.key)}
                    aria-label={`按${column.title}排序${
                      sortColumn === column.key
                        ? sortDirection === 'asc' ? '，当前升序' : '，当前降序'
                        : ''
                    }`}
                  >
                    {column.title}
                    {sortColumn === column.key && (
                      <span aria-hidden="true">
                        {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </button>
                ) : (
                  column.title
                )}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((column, colIndex) => (
                <td key={column.key}>
                  {colIndex === 0 ? (
                    <span className="sr-only">行 {rowIndex + 1}：</span>
                  ) : null}
                  {row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### 屏幕阅读器公告系统

```typescript
// services/Announcer.ts
export class Announcer {
  private politeRegion: HTMLDivElement | null = null;
  private assertiveRegion: HTMLDivElement | null = null;

  constructor() {
    this.createRegions();
  }

  private createRegions() {
    // 礼貌通知区域（不中断当前朗读）
    this.politeRegion = this.createRegion('polite');

    // 紧急通知区域（中断当前朗读）
    this.assertiveRegion = this.createRegion('assertive');

    document.body.appendChild(this.politeRegion);
    document.body.appendChild(this.assertiveRegion);
  }

  private createRegion(priority: 'polite' | 'assertive'): HTMLDivElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', 'true');
    region.className = 'sr-only';
    region.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    return region;
  }

  announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
    const region = priority === 'polite' ? this.politeRegion : this.assertiveRegion;
    if (!region) return;

    // 清空现有内容
    region.textContent = '';

    // 使用双重 requestAnimationFrame 确保浏览器会通知变化
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        region.textContent = message;
      });
    });
  }

  // 专门用于路由变化的通知
  announceRouteChange(pageName: string) {
    this.announce(`导航到 ${pageName}`, 'polite');
  }

  // 专门用于加载状态的通知
  announceLoadingComplete(itemCount: number) {
    this.announce(`加载完成，共 ${itemCount} 项内容`, 'polite');
  }

  // 专门用于错误通知
  announceError(errorMessage: string) {
    this.announce(`错误：${errorMessage}`, 'assertive');
  }

  destroy() {
    this.politeRegion?.remove();
    this.assertiveRegion?.remove();
    this.politeRegion = null;
    this.assertiveRegion = null;
  }
}

// 全局单例
export const announcer = new Announcer();
```

### 5.4 检查清单

| 检查项 | 优先级 | 测试方法 |
|--------|--------|----------|
| 页面标题描述性强 | P0 | NVDA/JAWS 标题阅读 |
| 标题层级结构正确 (h1-h6) | P0 | 屏幕阅读器标题导航 |
| 表单字段有正确的标签关联 | P0 | Tab 遍历表单 |
| 按钮和链接文本描述性强 | P0 | 链接列表查看 |
| 数据表格有适当的表头标记 | P0 | 表格导航测试 |
| 动态内容更新正确通知 | P1 | 实时区域测试 |
| 错误消息使用 assertive 通知 | P0 | 错误触发测试 |
| 装饰性图片正确标记 (alt="") | P1 | 图像列表检查 |
|  landmarks (地标) 正确使用 | P1 | 地标导航测试 |
| 内容阅读顺序符合逻辑 | P0 | 线性阅读测试 |

---

## 6. 国际化的理论基础（Unicode、Locale、CLDR）

### 6.1 规范要求

#### Unicode 核心概念

| 概念 | 描述 | 应用 |
|------|------|------|
| **码点 (Code Point)** | U+0000 到 U+10FFFF 的字符标识 | 字符存储和传输 |
| **编码方式 (UTF-8/16/32)** | 码点的字节表示 | 文件和网络传输 |
| **规范化 (Normalization)** | 等价字符的统一表示 | 字符串比较 |
| **双向算法 (Bidi)** | 混合方向文本的显示 | RTL 语言支持 |
| **字素簇 (Grapheme Cluster)** | 用户感知的单个字符 | 光标移动和选择 |

#### Locale 标识符结构 (BCP 47)

```
语言-脚本-区域-变体-扩展
│      │      │     │
│      │      │     └── 扩展：u-nu-latn（使用拉丁数字）
│      │      └──────── 区域：CN（中国）、US（美国）
│      └─────────────── 脚本：Hans（简体）、Hant（繁体）
└────────────────────── 语言：zh（中文）、en（英语）

示例：
• zh-CN：简体中文（中国）
• zh-Hant-TW：繁体中文（台湾）
• en-GB：英语（英国）
• ar-SA：阿拉伯语（沙特阿拉伯）
```

#### CLDR (Unicode Common Locale Data Repository)

| 数据类型 | 包含内容 | 应用场景 |
|----------|----------|----------|
| 语言/区域名称 | 本地化显示名称 | 语言选择器 |
| 日期/时间格式 | 各区域的标准格式 | 日期显示 |
| 数字格式 | 小数点、千分位、货币 | 数字显示 |
| 复数规则 | 各语言的复数形式 | 翻译字符串 |
| 排序规则 | 区域特定的排序 | 列表排序 |
| 日历系统 | 公历、农历、伊斯兰历等 | 日期计算 |

### 6.2 实现指南

#### Unicode 规范化

```typescript
// utils/unicode.ts

/**
 * Unicode 规范化字符串比较
 * NFC: 规范分解后进行规范组合
 * NFD: 规范分解
 * NFKC: 兼容性分解后进行规范组合
 * NFKD: 兼容性分解
 */
export function normalizeString(str: string, form: 'NFC' | 'NFD' | 'NFKC' | 'NFKD' = 'NFC'): string {
  return str.normalize(form);
}

/**
 * 安全的字符串比较（考虑规范化）
 */
export function compareStrings(a: string, b: string): boolean {
  return normalizeString(a) === normalizeString(b);
}

/**
 * 计算字素簇数量（用户感知的字符数）
 */
export function getGraphemeCount(str: string): number {
  // 使用 Intl.Segmenter (ES2022+)
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  return Array.from(segmenter.segment(str)).length;
}

/**
 * 安全的字符串截断
 */
export function truncateString(str: string, maxLength: number): string {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  const segments = Array.from(segmenter.segment(str));

  if (segments.length <= maxLength) return str;

  return segments.slice(0, maxLength).map(s => s.segment).join('') + '…';
}
```

#### Locale 解析与匹配

```typescript
// utils/locale.ts

interface LocaleConfig {
  language: string;
  script?: string;
  region?: string;
  variants?: string[];
}

/**
 * 解析 BCP 47 语言标签
 */
export function parseLocale(tag: string): LocaleConfig {
  const parts = tag.split(/[-_]/);

  const config: LocaleConfig = {
    language: parts[0].toLowerCase(),
  };

  let index = 1;

  // 脚本（4个字母，首字母大写）
  if (parts[index]?.length === 4 && /^[A-Z][a-z]{3}$/.test(parts[index])) {
    config.script = parts[index];
    index++;
  }

  // 区域（2个字母大写或3个数字）
  if (parts[index] && (/^[A-Z]{2}$/.test(parts[index]) || /^\d{3}$/.test(parts[index]))) {
    config.region = parts[index];
    index++;
  }

  // 变体和扩展
  if (index < parts.length) {
    config.variants = parts.slice(index);
  }

  return config;
}

/**
 * 区域回退链
 */
export function getLocaleFallbacks(locale: string): string[] {
  const config = parseLocale(locale);
  const fallbacks: string[] = [];

  // 完整标签
  fallbacks.push(locale);

  // 语言-区域
  if (config.region) {
    fallbacks.push(`${config.language}-${config.region}`);
  }

  // 语言-脚本
  if (config.script) {
    fallbacks.push(`${config.language}-${config.script}`);
  }

  // 仅语言
  fallbacks.push(config.language);

  // 默认
  fallbacks.push('en');

  return [...new Set(fallbacks)];
}

/**
 * 匹配最佳可用区域
 */
export function matchLocale(
  preferred: string[],
  available: string[]
): string | null {
  // 使用 Intl.LocaleMatcher（如果可用）或自定义实现
  for (const pref of preferred) {
    const fallbacks = getLocaleFallbacks(pref);
    for (const fallback of fallbacks) {
      const match = available.find(a =>
        a.toLowerCase() === fallback.toLowerCase()
      );
      if (match) return match;
    }
  }
  return available[0] || null;
}
```

### 6.3 代码示例

#### 完整的国际化配置系统

```typescript
// i18n/config.ts

export interface I18nConfig {
  /** 默认语言 */
  defaultLocale: string;
  /** 支持的语言列表 */
  supportedLocales: string[];
  /** 翻译资源 */
  resources: Record<string, Record<string, any>>;
  /** 复数规则 */
  pluralRules?: Intl.PluralRules;
  /** 数字格式 */
  numberFormats?: Record<string, Intl.NumberFormatOptions>;
  /** 日期格式 */
  dateFormats?: Record<string, Intl.DateTimeFormatOptions>;
}

export const defaultConfig: I18nConfig = {
  defaultLocale: 'zh-CN',
  supportedLocales: ['zh-CN', 'zh-TW', 'en-US', 'en-GB', 'ja-JP', 'ko-KR'],
  resources: {},
  dateFormats: {
    short: { dateStyle: 'short' },
    medium: { dateStyle: 'medium' },
    long: { dateStyle: 'long', timeStyle: 'short' },
    full: { dateStyle: 'full', timeStyle: 'medium' },
  },
  numberFormats: {
    currency: { style: 'currency', currencyDisplay: 'symbol' },
    percent: { style: 'percent', minimumFractionDigits: 2 },
    decimal: { style: 'decimal', maximumFractionDigits: 2 },
  },
};

// 区域特定的元数据
export const localeMetadata: Record<string, {
  direction: 'ltr' | 'rtl';
  calendar: string;
  firstDayOfWeek: number;
  currency: string;
}> = {
  'zh-CN': { direction: 'ltr', calendar: 'gregory', firstDayOfWeek: 1, currency: 'CNY' },
  'zh-TW': { direction: 'ltr', calendar: 'gregory', firstDayOfWeek: 0, currency: 'TWD' },
  'en-US': { direction: 'ltr', calendar: 'gregory', firstDayOfWeek: 0, currency: 'USD' },
  'en-GB': { direction: 'ltr', calendar: 'gregory', firstDayOfWeek: 1, currency: 'GBP' },
  'ja-JP': { direction: 'ltr', calendar: 'gregory', firstDayOfWeek: 0, currency: 'JPY' },
  'ar-SA': { direction: 'rtl', calendar: 'islamic-umalqura', firstDayOfWeek: 6, currency: 'SAR' },
  'he-IL': { direction: 'rtl', calendar: 'gregory', firstDayOfWeek: 0, currency: 'ILS' },
};

// 使用 Intl API 获取区域数据
export function getLocaleInfo(locale: string) {
  const metadata = localeMetadata[locale] || localeMetadata['en-US'];

  return {
    ...metadata,
    // 使用 Intl.DisplayNames 获取语言/区域显示名称
    displayNames: new Intl.DisplayNames(locale, { type: 'language' }),
    // 使用 Intl.ListFormat 获取列表格式
    listFormat: new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }),
    // 使用 Intl.Collator 获取排序规则
    collator: new Intl.Collator(locale, { sensitivity: 'base' }),
    // 使用 Intl.PluralRules 获取复数规则
    pluralRules: new Intl.PluralRules(locale),
  };
}
```

#### 复数处理实现

```typescript
// i18n/pluralization.ts

/**
 * ICU MessageFormat 风格的复数处理
 *
 * 复数类别：
 * - zero：零
 * - one：单数
 * - two：双数
 * - few：少数（2-4）
 * - many：多数
 * - other：其他（默认）
 */
export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export interface PluralMessage {
  zero?: string;
  one: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * 获取复数类别
 */
export function getPluralCategory(count: number, locale: string): PluralCategory {
  const rules = new Intl.PluralRules(locale);
  return rules.select(count) as PluralCategory;
}

/**
 * 格式化复数消息
 */
export function formatPlural(
  count: number,
  messages: PluralMessage,
  locale: string,
  replacements?: Record<string, string | number>
): string {
  const category = getPluralCategory(count, locale);
  let message = messages[category] || messages.other;

  // 替换占位符
  const vars = { count, ...replacements };
  message = message.replace(/\{(\w+)\}/g, (match, key) => {
    return vars[key] !== undefined ? String(vars[key]) : match;
  });

  return message;
}

// 使用示例
const messages: Record<string, PluralMessage> = {
  en: {
    one: '{count} item',
    other: '{count} items',
  },
  zh: {
    other: '{count} 个项目',
  },
  ru: {
    one: '{count} элемент',
    few: '{count} элемента',
    many: '{count} элементов',
    other: '{count} элементов',
  },
  ar: {
    zero: 'لا عناصر',
    one: 'عنصر واحد',
    two: 'عنصران',
    few: '{count} عناصر',
    many: '{count} عنصرًا',
    other: '{count} عنصر',
  },
};

// 测试
console.log(formatPlural(1, messages.en, 'en'));   // "1 item"
console.log(formatPlural(5, messages.en, 'en'));   // "5 items"
console.log(formatPlural(2, messages.ru, 'ru'));   // "2 элемента"
console.log(formatPlural(5, messages.ru, 'ru'));   // "5 элементов"
console.log(formatPlural(0, messages.ar, 'ar'));   // "لا عناصر"
```

### 6.4 检查清单

| 检查项 | 规范/标准 | 优先级 | 验证方法 |
|--------|-----------|--------|----------|
| 使用 UTF-8 编码 | Unicode 标准 | P0 | 文件编码检查 |
| 正确设置 HTML lang 属性 | HTML 规范 | P0 | 验证器检查 |
| 支持 Unicode 规范化 | Unicode 标准 | P1 | 字符串比较测试 |
| 正确处理字素簇 | Unicode 标准 | P1 | Emoji/组合字符测试 |
| 使用标准 Locale 标识符 | BCP 47 | P0 | 语言标签验证 |
| 实现区域回退机制 | 最佳实践 | P1 | 缺失翻译测试 |
| 使用 CLDR 数据进行格式化 | CLDR | P1 | 日期/数字格式测试 |
| 支持 RTL 语言 | Unicode Bidi | P0 | 阿拉伯语/希伯来语测试 |
| 处理各语言的复数规则 | CLDR | P1 | 多语言复数测试 |

---

## 7. 文本方向（LTR/RTL）的布局算法

### 7.1 规范要求

#### Unicode 双向算法 (UBA)

| 概念 | 描述 |
|------|------|
| **字符方向性** | 每个 Unicode 字符有强方向性（L/R）、弱方向性或中性方向性 |
| **嵌入级别** | 算法为每个字符分配嵌入级别，决定显示顺序 |
| **显式格式化字符** | LRE/RLE（嵌入）、LRO/RLO（覆盖）、PDF（终止） |
| **隐式方向解析** | 基于字符本身的方向性自动确定 |

#### CSS 逻辑属性

```
传统物理属性 vs 逻辑属性：

物理属性（与方向绑定）：
  margin-left / margin-right
  padding-left / padding-right
  border-left / border-right
  left / right
  text-align: left / right

逻辑属性（与方向无关）：
  margin-inline-start / margin-inline-end
  padding-inline-start / padding-inline-end
  border-inline-start / border-inline-end
  inset-inline-start / inset-inline-end
  text-align: start / end

书写模式：
  inline = 文本流向方向（LTR/RTL中水平）
  block = 与inline垂直的方向（垂直方向）
```

### 7.2 实现指南

#### CSS 逻辑属性全面应用

```css
/* 基础设置 */
:root {
  --direction: ltr;
}

[dir="rtl"] {
  --direction: rtl;
}

/* 使用逻辑属性 */
.component {
  /* 内联方向边距（随文本方向改变） */
  margin-inline-start: 1rem;  /* LTR: margin-left, RTL: margin-right */
  margin-inline-end: 1rem;    /* LTR: margin-right, RTL: margin-left */

  /* 块级方向边距（始终垂直） */
  margin-block-start: 0.5rem; /* 等同于 margin-top */
  margin-block-end: 0.5rem;   /* 等同于 margin-bottom */

  /* 内边距 */
  padding-inline: 1rem 2rem;  /* start, end */
  padding-block: 0.5rem;      /* start 和 end 相同 */

  /* 边框 */
  border-inline-start: 2px solid blue;

  /* 定位 */
  inset-inline-start: 0;      /* LTR: left, RTL: right */

  /* 文本对齐 */
  text-align: start;          /* LTR: left, RTL: right */

  /* 浮动 */
  float: inline-start;        /* 或 inline-end */
}

/* 边框圆角 */
.rounded-logical {
  border-start-start-radius: 8px;     /* 左上角（LTR）/ 右上角（RTL） */
  border-start-end-radius: 0;         /* 右上角（LTR）/ 左上角（RTL） */
  border-end-start-radius: 0;         /* 左下角（LTR）/ 右下角（RTL） */
  border-end-end-radius: 8px;         /* 右下角（LTR）/ 左下角（RTL） */
}
```

#### RTL 布局适配

```css
/* 方向感知的样式 */
.page-container {
  display: flex;
  flex-direction: column;
}

/* 头部布局 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-inline: 1.5rem;
}

/* Logo 总是在开始侧 */
.logo {
  margin-inline-end: auto;
}

/* 导航菜单 */
.nav-list {
  display: flex;
  gap: 1rem;
  /* 无需指定方向，flex自动适配 */
}

/* 带有图标的按钮 */
.icon-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

/* 图标在开始侧 */
.icon-button .icon {
  /* 如果图标有方向性（如箭头），需要翻转 */
}

[dir="rtl"] .icon-button .directional-icon {
  transform: scaleX(-1);
}

/* 表单标签 */
.form-label {
  display: block;
  text-align: start;  /* 随方向改变 */
  margin-block-end: 0.25rem;
}

/* 水平分隔线 */
.divider {
  border-block-end: 1px solid #ccc;
  margin-block: 1rem;
}

/* 侧边栏布局 */
.with-sidebar {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
}

[dir="rtl"] .with-sidebar {
  /* 不需要特别处理，grid自动处理RTL */
}
```

### 7.3 代码示例

#### React 方向感知组件

```typescript
// components/DirProvider.tsx
import React, { createContext, useContext, useEffect } from 'react';

interface DirContextValue {
  direction: 'ltr' | 'rtl';
  setDirection: (dir: 'ltr' | 'rtl') => void;
  toggleDirection: () => void;
}

const DirContext = createContext<DirContextValue | null>(null);

export function DirProvider({
  children,
  defaultDirection = 'ltr'
}: {
  children: React.ReactNode;
  defaultDirection?: 'ltr' | 'rtl';
}) {
  const [direction, setDirection] = React.useState(defaultDirection);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = direction === 'rtl' ? 'ar' : 'zh';
  }, [direction]);

  const toggleDirection = () => {
    setDirection(prev => prev === 'ltr' ? 'rtl' : 'ltr');
  };

  return (
    <DirContext.Provider value={{ direction, setDirection, toggleDirection }}>
      {children}
    </DirContext.Provider>
  );
}

export function useDirection() {
  const context = useContext(DirContext);
  if (!context) throw new Error('useDirection must be used within DirProvider');
  return context;
}

// 方向感知图标组件
interface DirectionalIconProps {
  ltr: React.ReactNode;
  rtl?: React.ReactNode;
}

export function DirectionalIcon({ ltr, rtl }: DirectionalIconProps) {
  const { direction } = useDirection();
  return <>{direction === 'rtl' ? (rtl ?? ltr) : ltr}</>;
}
```

```typescript
// components/DirectionalArrow.tsx
import React from 'react';
import { useDirection } from './DirProvider';

interface ArrowProps {
  direction: 'left' | 'right' | 'up' | 'down';
  size?: number;
  className?: string;
}

export function DirectionalArrow({ direction, size = 24, className }: ArrowProps) {
  const { direction: textDirection } = useDirection();

  // 将逻辑方向转换为物理方向
  const getPhysicalDirection = () => {
    if (direction === 'left') {
      return textDirection === 'rtl' ? 'right' : 'left';
    }
    if (direction === 'right') {
      return textDirection === 'rtl' ? 'left' : 'right';
    }
    return direction;
  };

  const physicalDir = getPhysicalDirection();

  // 旋转角度
  const rotation = {
    left: 0,
    up: 90,
    right: 180,
    down: 270,
  }[physicalDir];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

// 使用示例
function NavigationButtons() {
  return (
    <div className="flex gap-2">
      <button>
        <DirectionalArrow direction="left" />
        上一页
      </button>
      <button>
        下一页
        <DirectionalArrow direction="right" />
      </button>
    </div>
  );
}
```

#### 动态方向检测

```typescript
// utils/directionDetector.ts

/**
 * 检测文本的主要方向
 */
export function detectTextDirection(text: string): 'ltr' | 'rtl' | 'neutral' {
  // RTL 字符范围
  const rtlRegex = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFF]/;
  // LTR 字符范围（拉丁、中文、日文等）
  const ltrRegex = /[\u0041-\u005A\u0061-\u007A\u0100-\u017F\u0400-\u04FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF]/;

  let rtlCount = 0;
  let ltrCount = 0;

  for (const char of text) {
    if (rtlRegex.test(char)) rtlCount++;
    else if (ltrRegex.test(char)) ltrCount++;
  }

  if (rtlCount > ltrCount) return 'rtl';
  if (ltrCount > rtlCount) return 'ltr';
  return 'neutral';
}

/**
 * 获取元素内容的适当方向
 */
export function getElementDirection(element: HTMLElement): 'ltr' | 'rtl' {
  // 1. 检查 dir 属性
  const dirAttr = element.closest('[dir]')?.getAttribute('dir');
  if (dirAttr === 'rtl' || dirAttr === 'ltr') return dirAttr;

  // 2. 检查 CSS direction
  const computedStyle = window.getComputedStyle(element);
  if (computedStyle.direction === 'rtl') return 'rtl';

  // 3. 检测文本内容
  const textDirection = detectTextDirection(element.textContent || '');
  if (textDirection !== 'neutral') return textDirection;

  // 4. 默认 LTR
  return 'ltr';
}

/**
 * 自动设置文本区域方向
 */
export function autoDirectionTextarea(textarea: HTMLTextAreaElement) {
  const updateDirection = () => {
    const direction = detectTextDirection(textarea.value);
    if (direction !== 'neutral') {
      textarea.dir = direction;
    }
  };

  textarea.addEventListener('input', updateDirection);
  updateDirection();
}
```

### 7.4 检查清单

| 检查项 | 优先级 | 验证方法 |
|--------|--------|----------|
| HTML 元素设置 dir 属性 | P0 | HTML 验证 |
| 使用 CSS 逻辑属性替代物理属性 | P0 | CSS 审查 |
| Flexbox/Grid 布局正确响应 RTL | P0 | RTL 模式测试 |
| 图标方向在 RTL 下正确 | P1 | 视觉检查 |
| 水平滚动方向正确 | P0 | RTL 滚动测试 |
| 日期/时间选择器方向正确 | P1 | RTL 交互测试 |
| 模态框/对话框位置正确 | P1 | RTL 定位测试 |
| 文本区域支持自动方向检测 | P2 | 混合文本测试 |

---

## 8. 日期、时间、数字的本地化格式

### 8.1 规范要求

#### 日期时间格式标准

| 格式类型 | 示例 (zh-CN) | 示例 (en-US) | 示例 (ja-JP) |
|----------|--------------|--------------|--------------|
| 短日期 | 2024/1/15 | 1/15/24 | 2024/01/15 |
| 中日期 | 2024年1月15日 | Jan 15, 2024 | 2024年1月15日 |
| 长日期 | 2024年1月15日星期一 | Monday, January 15, 2024 | 2024年1月15日月曜日 |
| 短时间 | 14:30 | 2:30 PM | 14:30 |
| 完整时间 | 2024年1月15日星期一 14:30:00 GMT+8 | Monday, January 15, 2024 at 2:30:00 PM GMT+8 | 2024年1月15日月曜日 14:30:00 JST |

#### 数字格式标准

| 格式类型 | zh-CN | en-US | de-DE | ar-SA |
|----------|-------|-------|-------|-------|
| 小数点 | 1,234.56 | 1,234.56 | 1.234,56 | ١٬٢٣٤٫٥٦ |
| 千分位 | 1,234,567 | 1,234,567 | 1.234.567 | ١٬٢٣٤٬٥٦٧ |
| 货币 | ¥1,234.56 | $1,234.56 | 1.234,56 € | ١٬٢٣٤٫٥٦ ر.س |
| 百分比 | 12.34% | 12.34% | 12,34 % | ١٢٫٣٤٪ |

### 8.2 实现指南

#### Intl.DateTimeFormat 使用

```typescript
// utils/dateTimeFormat.ts

interface DateTimeFormatOptions {
  locale: string;
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  calendar?: string;
  timeZone?: string;
}

/**
 * 格式化日期时间
 */
export function formatDateTime(
  date: Date | number,
  options: DateTimeFormatOptions
): string {
  const formatter = new Intl.DateTimeFormat(options.locale, {
    dateStyle: options.dateStyle,
    timeStyle: options.timeStyle,
    calendar: options.calendar,
    timeZone: options.timeZone,
  });

  return formatter.format(date);
}

/**
 * 相对时间格式化
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: string,
  options?: Intl.RelativeTimeFormatOptions
): string {
  const formatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
    ...options,
  });

  return formatter.format(value, unit);
}

/**
 * 时间范围格式化
 */
export function formatDateTimeRange(
  start: Date,
  end: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    ...options,
  });

  return formatter.formatRange(start, end);
}

/**
 * 持续时间格式化（自定义实现）
 */
export function formatDuration(
  milliseconds: number,
  locale: string,
  options?: { style?: 'long' | 'short' | 'narrow' }
): string {
  const { style = 'long' } = options || {};

  const units = [
    { unit: 'day', ms: 86400000 },
    { unit: 'hour', ms: 3600000 },
    { unit: 'minute', ms: 60000 },
    { unit: 'second', ms: 1000 },
  ];

  const parts: string[] = [];
  let remaining = milliseconds;

  for (const { unit, ms } of units) {
    const value = Math.floor(remaining / ms);
    if (value > 0) {
      const formatter = new Intl.NumberFormat(locale, { style: 'unit', unit: unit as any, unitDisplay: style });
      parts.push(formatter.format(value));
      remaining %= ms;
    }
  }

  return new Intl.ListFormat(locale, { style, type: 'conjunction' }).format(parts);
}
```

#### 数字格式化

```typescript
// utils/numberFormat.ts

interface CurrencyOptions {
  currency: string;
  locale: string;
  display?: 'symbol' | 'code' | 'name';
}

/**
 * 格式化货币
 */
export function formatCurrency(
  amount: number,
  options: CurrencyOptions
): string {
  const formatter = new Intl.NumberFormat(options.locale, {
    style: 'currency',
    currency: options.currency,
    currencyDisplay: options.display || 'symbol',
  });

  return formatter.format(amount);
}

/**
 * 格式化数字
 */
export function formatNumber(
  num: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  const formatter = new Intl.NumberFormat(locale, options);
  return formatter.format(num);
}

/**
 * 格式化百分比
 */
export function formatPercent(
  value: number,
  locale: string,
  decimalPlaces = 2
): string {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return formatter.format(value);
}

/**
 * 格式化单位
 */
export function formatUnit(
  value: number,
  unit: string,
  locale: string,
  style: 'long' | 'short' | 'narrow' = 'long'
): string {
  // 注意：unit 支持需要较新的浏览器
  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: unit as any,
      unitDisplay: style,
    });
    return formatter.format(value);
  } catch {
    // 降级处理
    const unitNames: Record<string, Record<string, string>> = {
      'kilometer': { long: '公里', short: 'km', narrow: 'km' },
      'meter': { long: '米', short: 'm', narrow: 'm' },
      'kilogram': { long: '千克', short: 'kg', narrow: 'kg' },
      'celsius': { long: '摄氏度', short: '°C', narrow: '°C' },
    };
    const unitName = unitNames[unit]?.[style] || unit;
    return `${value} ${unitName}`;
  }
}

/**
 * 紧凑数字格式化
 */
export function formatCompactNumber(
  num: number,
  locale: string
): string {
  const formatter = new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
  });

  return formatter.format(num);
}
```

### 8.3 代码示例

#### React 本地化格式化 Hook

```typescript
// hooks/useFormatting.ts
import { useMemo, useCallback } from 'react';

interface UseFormattingOptions {
  locale: string;
  timeZone?: string;
}

export function useFormatting({ locale, timeZone }: UseFormattingOptions) {
  // 日期格式化器缓存
  const dateFormatters = useMemo(() => {
    return {
      short: new Intl.DateTimeFormat(locale, {
        dateStyle: 'short',
        timeZone
      }),
      medium: new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeZone
      }),
      long: new Intl.DateTimeFormat(locale, {
        dateStyle: 'long',
        timeZone
      }),
      full: new Intl.DateTimeFormat(locale, {
        dateStyle: 'full',
        timeStyle: 'medium',
        timeZone
      }),
    };
  }, [locale, timeZone]);

  // 数字格式化器
  const numberFormatter = useMemo(() => {
    return new Intl.NumberFormat(locale);
  }, [locale]);

  // 货币格式化器缓存
  const currencyFormatters = useMemo(() => {
    const cache = new Map<string, Intl.NumberFormat>();

    return {
      get: (currency: string) => {
        const key = `${locale}-${currency}`;
        if (!cache.has(key)) {
          cache.set(key, new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
          }));
        }
        return cache.get(key)!;
      },
    };
  }, [locale]);

  // 格式化函数
  const formatDate = useCallback((date: Date | number, style: keyof typeof dateFormatters = 'medium') => {
    return dateFormatters[style].format(date);
  }, [dateFormatters]);

  const formatNumber = useCallback((num: number, options?: Intl.NumberFormatOptions) => {
    if (options) {
      return new Intl.NumberFormat(locale, options).format(num);
    }
    return numberFormatter.format(num);
  }, [locale, numberFormatter]);

  const formatCurrency = useCallback((amount: number, currency: string) => {
    return currencyFormatters.get(currency).format(amount);
  }, [currencyFormatters]);

  const formatRelativeTime = useCallback((
    value: number,
    unit: Intl.RelativeTimeFormatUnit
  ) => {
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    return formatter.format(value, unit);
  }, [locale]);

  return {
    formatDate,
    formatNumber,
    formatCurrency,
    formatRelativeTime,
  };
}

// 使用示例
function Dashboard({ data }: { data: { date: Date; amount: number; count: number } }) {
  const { formatDate, formatCurrency, formatNumber } = useFormatting({
    locale: 'zh-CN',
    timeZone: 'Asia/Shanghai',
  });

  return (
    <div>
      <p>日期: {formatDate(data.date, 'full')}</p>
      <p>金额: {formatCurrency(data.amount, 'CNY')}</p>
      <p>数量: {formatNumber(data.count, { notation: 'compact' })}</p>
    </div>
  );
}
```

### 8.4 检查清单

| 检查项 | 优先级 | 验证方法 |
|--------|--------|----------|
| 使用 Intl.DateTimeFormat 格式化日期 | P0 | 多语言日期显示测试 |
| 使用 Intl.NumberFormat 格式化数字 | P0 | 多语言数字显示测试 |
| 货币格式使用正确的货币符号和位置 | P0 | 多货币测试 |
| 百分比格式符合区域习惯 | P1 | 百分比显示测试 |
| 支持相对时间显示 | P1 | 相对时间显示测试 |
| 处理时区转换 | P1 | 多时区测试 |
| 数字使用区域正确的数字系统 | P1 | 阿拉伯数字/泰文数字测试 |
| 处理日历系统差异 | P2 | 农历/伊斯兰历测试 |

---

## 9. 翻译管理（i18n 库架构）

### 9.1 规范要求

#### i18n 架构核心组件

```
┌─────────────────────────────────────────────────────────────┐
│                      i18n 架构图                             │
├─────────────────────────────────────────────────────────────┤
│  应用层    │ React/Vue/Angular 组件                          │
├─────────────────────────────────────────────────────────────┤
│  Hook/API  │ useTranslation() / t() 函数                     │
├─────────────────────────────────────────────────────────────┤
│  核心引擎   │ 插值、复数、格式化、嵌套                         │
├─────────────────────────────────────────────────────────────┤
│  加载器    │ 资源加载、代码分割、懒加载                        │
├─────────────────────────────────────────────────────────────┤
│  存储层    │ 翻译资源文件 (JSON/YAML)                          │
├─────────────────────────────────────────────────────────────┤
│  工具链    │ 提取、同步、验证、编译                            │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 实现指南

#### react-i18next 实现

```typescript
// i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// 命名空间定义
export const NAMESPACES = {
  common: 'common',
  navigation: 'navigation',
  forms: 'forms',
  errors: 'errors',
  dashboard: 'dashboard',
} as const;

// 资源类型定义
export type Resources = {
  [K in keyof typeof NAMESPACES]: Record<string, string | object>;
};

i18n
  .use(Backend)  // 异步加载翻译文件
  .use(LanguageDetector)  // 自动检测语言
  .use(initReactI18next)
  .init({
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'zh-TW', 'en-US', 'ja-JP'],

    // 命名空间配置
    ns: Object.values(NAMESPACES),
    defaultNS: NAMESPACES.common,

    // 插值配置
    interpolation: {
      escapeValue: true,  // React 已经转义
    },

    // 检测器配置
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // 后端配置
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // 复数配置
    pluralSeparator: '_',
    nsSeparator: ':',
    keySeparator: '.',

    react: {
      useSuspense: true,
    },
  });

export default i18n;
```

```typescript
// i18n/translation.types.ts

// 类型安全的翻译键
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: {
        welcome: string;
        greeting: string;
        actions: {
          save: string;
          cancel: string;
          delete: string;
        };
        status: {
          loading: string;
          error: string;
          success: string;
        };
      };
      forms: {
        validation: {
          required: string;
          email: string;
          minLength: string;
          maxLength: string;
        };
        labels: {
          email: string;
          password: string;
          name: string;
        };
      };
      // ... 其他命名空间
    };
  }
}
```

```typescript
// 翻译资源文件示例 - locales/zh-CN/common.json
{
  "welcome": "欢迎",
  "greeting": "你好，{{name}}！",
  "itemCount": "{{count}} 个项目",
  "itemCount_zero": "没有项目",
  "itemCount_one": "1 个项目",
  "itemCount_other": "{{count}} 个项目",
  "actions": {
    "save": "保存",
    "cancel": "取消",
    "delete": "删除"
  },
  "date": "今天是 {{date, DD/MM/YYYY}}",
  "price": "价格: {{price, currency(CNY)}}",
  "nested": {
    "deep": {
      "value": "嵌套值"
    }
  }
}
```

```typescript
// 使用示例 - components/Greeting.tsx
import { useTranslation } from 'react-i18next';

function Greeting({ userName, itemCount }: { userName: string; itemCount: number }) {
  const { t, i18n } = useTranslation('common');

  return (
    <div>
      {/* 简单翻译 */}
      <h1>{t('welcome')}</h1>

      {/* 插值 */}
      <p>{t('greeting', { name: userName })}</p>

      {/* 复数处理 */}
      <p>{t('itemCount', { count: itemCount })}</p>

      {/* 嵌套键 */}
      <p>{t('nested.deep.value')}</p>

      {/* 切换语言 */}
      <button onClick={() => i18n.changeLanguage('en-US')}>
        Switch to English
      </button>
    </div>
  );
}
```

#### FormatJS (react-intl) 实现

```typescript
// i18n/formatjs-config.tsx
import { IntlProvider, createIntl, createIntlCache, IntlShape } from 'react-intl';
import { ReactNode } from 'react';

// 消息类型定义
interface Messages {
  'app.welcome': { name: string };
  'app.itemCount': { count: number };
  'form.required': { field: string };
  'error.unknown': {};
}

// 消息格式化器
const messages: Record<string, Record<keyof Messages, string>> = {
  'zh-CN': {
    'app.welcome': '欢迎，{name}！',
    'app.itemCount': '{count, plural, =0 {没有项目} one {1 个项目} other {{count} 个项目}}',
    'form.required': '{field} 是必填项',
    'error.unknown': '发生未知错误',
  },
  'en-US': {
    'app.welcome': 'Welcome, {name}!',
    'app.itemCount': '{count, plural, =0 {no items} one {1 item} other {{count} items}}',
    'form.required': '{field} is required',
    'error.unknown': 'An unknown error occurred',
  },
};

// 创建 intl 实例缓存
const cache = createIntlCache();

export function createIntlInstance(locale: string): IntlShape {
  return createIntl(
    {
      locale,
      messages: messages[locale] || messages['en-US'],
      defaultLocale: 'en-US',
    },
    cache
  );
}

// Provider 组件
interface I18nProviderProps {
  locale: string;
  children: ReactNode;
}

export function I18nProvider({ locale, children }: I18nProviderProps) {
  const intl = createIntlInstance(locale);

  return (
    <IntlProvider locale={locale} messages={messages[locale]} defaultLocale="en-US">
      {children}
    </IntlProvider>
  );
}

// 类型安全的 hook
import { useIntl as useIntlOriginal, FormattedMessage, FormattedNumber, FormattedDate } from 'react-intl';

export function useTypedIntl() {
  const intl = useIntlOriginal();

  return {
    ...intl,
    formatMessage: <K extends keyof Messages>(
      id: K,
      values?: Messages[K]
    ): string => {
      return intl.formatMessage({ id }, values);
    },
  };
}

// 使用示例
import { useIntl, FormattedMessage, FormattedNumber, FormattedDate } from 'react-intl';

function ProductCard({ product }: { product: { name: string; price: number; createdAt: Date } }) {
  const intl = useIntl();

  return (
    <div>
      {/* 使用 FormattedMessage 组件 */}
      <FormattedMessage id="app.welcome" values={{ name: product.name }} />

      {/* 使用 formatMessage API */}
      <p>{intl.formatMessage({ id: 'app.itemCount' }, { count: 5 })}</p>

      {/* 数字格式化 */}
      <p>
        <FormattedNumber
          value={product.price}
          style="currency"
          currency="CNY"
        />
      </p>

      {/* 日期格式化 */}
      <p>
        <FormattedDate
          value={product.createdAt}
          year="numeric"
          month="long"
          day="numeric"
        />
      </p>

      {/* 相对时间 */}
      <FormattedRelativeTime value={-2} unit="day" />
    </div>
  );
}
```

### 9.3 代码示例

#### 翻译提取和同步工具

```typescript
// scripts/extract-translations.ts
import { extract } from '@formatjs/cli-lib';
import fs from 'fs/promises';
import path from 'path';
import glob from 'glob';

interface TranslationKey {
  id: string;
  defaultMessage?: string;
  description?: string;
}

/**
 * 从源代码提取翻译键
 */
async function extractTranslations(): Promise<TranslationKey[]> {
  const files = glob.sync('src/**/*.{ts,tsx}');

  const messages = await extract(files, {
    additionalFunctionNames: ['t', 'formatMessage'],
    additionalComponentNames: ['FormattedMessage'],
    format: 'simple',
  });

  return Object.entries(messages).map(([id, value]: [string, any]) => ({
    id,
    defaultMessage: value.defaultMessage,
    description: value.description,
  }));
}

/**
 * 同步翻译文件
 */
async function syncTranslations(
  extractedKeys: TranslationKey[],
  locales: string[],
  baseDir: string
) {
  for (const locale of locales) {
    const filePath = path.join(baseDir, `${locale}.json`);

    // 读取现有翻译
    let existing: Record<string, string> = {};
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      existing = JSON.parse(content);
    } catch {
      // 文件不存在，创建新文件
    }

    // 合并翻译
    const updated: Record<string, string> = {};
    for (const key of extractedKeys) {
      if (existing[key.id]) {
        // 保留现有翻译
        updated[key.id] = existing[key.id];
      } else if (locale === 'en-US' && key.defaultMessage) {
        // 使用默认消息（源语言）
        updated[key.id] = key.defaultMessage;
      } else {
        // 标记为待翻译
        updated[key.id] = `TODO: ${key.defaultMessage || key.id}`;
      }
    }

    // 检测已废弃的键
    const deprecatedKeys = Object.keys(existing).filter(k =>
      !extractedKeys.some(ek => ek.id === k)
    );

    if (deprecatedKeys.length > 0) {
      console.warn(`[${locale}] 废弃的键:`, deprecatedKeys);
    }

    // 写入文件
    await fs.writeFile(
      filePath,
      JSON.stringify(updated, null, 2),
      'utf-8'
    );

    console.log(`✓ 已同步 ${locale}: ${Object.keys(updated).length} 个键`);
  }
}

// 主函数
async function main() {
  const keys = await extractTranslations();
  console.log(`提取了 ${keys.length} 个翻译键`);

  await syncTranslations(keys, ['zh-CN', 'en-US', 'ja-JP'], './locales');
}

main().catch(console.error);
```

#### 运行时翻译加载器

```typescript
// i18n/TranslationLoader.ts

interface TranslationModule {
  default: Record<string, string>;
}

export class TranslationLoader {
  private cache = new Map<string, Record<string, string>>();
  private loadingPromises = new Map<string, Promise<void>>();

  constructor(
    private loadPath: (locale: string) => Promise<TranslationModule>
  ) {}

  async load(locale: string): Promise<Record<string, string>> {
    // 检查缓存
    if (this.cache.has(locale)) {
      return this.cache.get(locale)!;
    }

    // 检查是否正在加载
    if (this.loadingPromises.has(locale)) {
      await this.loadingPromises.get(locale);
      return this.cache.get(locale)!;
    }

    // 开始加载
    const loadPromise = this.loadAndCache(locale);
    this.loadingPromises.set(locale, loadPromise);

    try {
      await loadPromise;
      return this.cache.get(locale)!;
    } finally {
      this.loadingPromises.delete(locale);
    }
  }

  private async loadAndCache(locale: string): Promise<void> {
    try {
      const module = await this.loadPath(locale);
      this.cache.set(locale, module.default);
    } catch (error) {
      console.error(`Failed to load translations for ${locale}:`, error);
      // 使用空对象作为回退
      this.cache.set(locale, {});
    }
  }

  preload(locales: string[]): void {
    locales.forEach(locale => this.load(locale));
  }

  clear(locale?: string): void {
    if (locale) {
      this.cache.delete(locale);
    } else {
      this.cache.clear();
    }
  }
}

// 使用示例
const loader = new TranslationLoader(
  (locale) => import(`../locales/${locale}.json`)
);

// 预加载常用语言
loader.preload(['zh-CN', 'en-US']);

// 切换语言时加载
async function switchLocale(locale: string) {
  const messages = await loader.load(locale);
  i18n.addResourceBundle(locale, 'translation', messages, true, true);
  i18n.changeLanguage(locale);
}
```

### 9.4 检查清单

| 检查项 | 优先级 | 验证方法 |
|--------|--------|----------|
| 所有用户可见字符串都已提取 | P0 | 提取脚本运行 |
| 翻译文件格式正确 | P0 | JSON 验证 |
| 实现翻译回退机制 | P0 | 缺失键测试 |
| 支持复数处理 | P0 | 多复数形式测试 |
| 支持插值和 HTML 内容 | P1 | 插值功能测试 |
| 翻译资源按需加载 | P1 | 网络面板检查 |
| 类型安全的翻译键 | P1 | TypeScript 编译 |
| 实现翻译同步工具 | P2 | 脚本运行测试 |
| 翻译文件版本管理 | P2 | Git 变更检查 |

---

## 10. 可访问性测试的自动化

### 10.1 规范要求

#### 自动化测试层次

| 层次 | 工具 | 覆盖范围 | 检测能力 |
|------|------|----------|----------|
| **静态分析** | ESLint 插件、axe Linter | 代码/标记级别 | 语法规则 |
| **单元测试** | jest-axe, vitest-axe | 组件级别 | 渲染输出 |
| **集成测试** | Cypress + cypress-axe | 页面级别 | DOM 结构 |
| **端到端测试** | Playwright + axe-core | 完整流程 | 交互状态 |
| **CI 自动化** | axe-core CLI, Lighthouse CI | 构建产物 | 完整站点 |

### 10.2 实现指南

#### axe-core 集成

```typescript
// setupTests.ts - Jest 配置
import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// 全局配置
global.axeConfig = {
  rules: {
    // 禁用特定规则（如果有合理原因）
    'color-contrast': { enabled: false }, // 在测试中常因无样式而失败
  },
};
```

```typescript
// utils/test-a11y.ts
import { configureAxe, RunOptions } from 'axe-core';

/**
 * 配置 axe 运行时选项
 */
export const defaultAxeOptions: RunOptions = {
  rules: {
    // 启用所有 WCAG 2.1 AA 规则
    'color-contrast': { enabled: true },
    'empty-heading': { enabled: true },
    'heading-order': { enabled: true },
    'html-has-lang': { enabled: true },
    'image-alt': { enabled: true },
    'label': { enabled: true },
    'link-name': { enabled: true },
    'list': { enabled: true },
    'listitem': { enabled: true },
    'region': { enabled: true },
  },
  // 仅在特定元素上运行
  // include: [['#main-content']],
  // 排除特定元素
  // exclude: [['.decorative']],
};

/**
 * 配置 axe 实例
 */
export const axe = configureAxe({
  branding: {
    brand: 'YourApp',
    application: 'a11y-tests',
  },
  // 自定义规则
  rules: [
    {
      id: 'custom-focus-indicator',
      enabled: true,
      selector: 'button, a, input',
      matches: (node) => {
        const style = window.getComputedStyle(node);
        return style.outline === 'none' && style.boxShadow === 'none';
      },
      metadata: {
        description: 'Ensures focus indicators are visible',
        help: 'Add visible focus indicator to interactive elements',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html',
      },
    },
  ],
});
```

#### React 组件可访问性测试

```typescript
// components/__tests__/Button.a11y.test.tsx
import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(
      <Button onClick={() => {}}>Click me</Button>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have accessible name when using icon only', async () => {
    const { container } = render(
      <Button onClick={() => {}} aria-label="Close dialog">
        <CloseIcon />
      </Button>
    );

    const results = await axe(container, {
      rules: {
        'button-name': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });

  it('should have sufficient color contrast', async () => {
    const { container } = render(
      <Button variant="primary">Primary Button</Button>
    );

    const results = await axe(container, {
      rules: {
        'color-contrast': { enabled: true },
      },
    });
    expect(results).toHaveNoViolations();
  });
});
```

```typescript
// components/__tests__/Modal.a11y.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { axe } from 'jest-axe';
import { Modal } from '../Modal';

describe('Modal Accessibility', () => {
  it('should trap focus when open', async () => {
    render(
      <>
        <button>Outside</button>
        <Modal isOpen={true} onClose={() => {}}>
          <input data-testid="input1" />
          <button>Inside</button>
          <input data-testid="input2" />
        </Modal>
      </>
    );

    const input1 = screen.getByTestId('input1');
    const input2 = screen.getByTestId('input2');

    // 初始焦点应在模态内
    expect(document.activeElement).toBe(input1);

    // Tab 到最后一个元素后继续 Tab 应回到第一个
    input2.focus();
    fireEvent.keyDown(document.activeElement!, { key: 'Tab' });

    // 验证焦点管理
    const results = await axe(container);
    expect(results.violations.filter(v => v.id === 'focus-order-semantics')).toHaveLength(0);
  });

  it('should have no violations when open', async () => {
    const { container } = render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Modal Title"
        aria-describedby="modal-desc"
      >
        <p id="modal-desc">Modal description</p>
        <button>Action</button>
      </Modal>
    );

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

#### Cypress 可访问性测试

```typescript
// cypress/support/commands.ts
import 'cypress-axe';

// 添加自定义命令
declare global {
  namespace Cypress {
    interface Chainable {
      checkA11y(options?: Cypress.AxeOptions): Chainable<Element>;
      checkA11yWithConfig(context?: string, options?: Cypress.AxeOptions): Chainable<Element>;
    }
  }
}

Cypress.Commands.add('checkA11y', (options = {}) => {
  cy.injectAxe();
  cy.checkA11y(
    null,
    {
      ...options,
      includedImpacts: ['critical', 'serious'],
    },
    (violations) => {
      // 自定义报告
      cy.task('log', `${violations.length} accessibility violation(s) detected`);
      violations.forEach((violation) => {
        cy.task('log', `Rule: ${violation.id} - ${violation.description}`);
        cy.task('log', `Nodes: ${violation.nodes.length}`);
      });
    }
  );
});

Cypress.Commands.add('checkA11yWithConfig', (context, options = {}) => {
  cy.injectAxe();
  cy.configureAxe({
    rules: [
      { id: 'heading-order', enabled: true },
      { id: 'region', enabled: true },
    ],
  });
  cy.checkA11y(context, options);
});
```

```typescript
// cypress/e2e/a11y.cy.ts
describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('Homepage should have no detectable accessibility violations', () => {
    cy.checkA11y();
  });

  it('Navigation should be accessible', () => {
    cy.get('nav').checkA11yWithConfig('nav');
  });

  it('Form should have no violations', () => {
    cy.visit('/contact');
    cy.get('form').checkA11yWithConfig('form', {
      rules: {
        'label': { enabled: true },
        'aria-required-attr': { enabled: true },
      },
    });
  });

  it('Modal should manage focus correctly', () => {
    cy.get('[data-testid="open-modal"]').click();
    cy.get('[role="dialog"]').should('be.visible');

    // 检查焦点在模态内
    cy.get('[role="dialog"]').within(() => {
      cy.focused().should('have.attr', 'role', 'dialog').or('be.focused');
    });

    cy.checkA11y('[role="dialog"]');
  });
});
```

### 10.3 代码示例

#### Lighthouse CI 配置

```javascript
// lighthouserc.js
module.exports = {
  ci: {
    collect: {
      // 收集配置
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/about',
        'http://localhost:3000/contact',
      ],
      numberOfRuns: 3,
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 60000,
    },
    assert: {
      // 断言配置
      assertions: {
        // 可访问性分数
        'categories:accessibility': ['error', { minScore: 0.95 }],

        // 具体审计项
        'aria-allowed-attr': 'error',
        'aria-hidden-body': 'error',
        'aria-hidden-focus': 'error',
        'aria-input-field-name': 'error',
        'aria-required-attr': 'error',
        'aria-required-children': 'error',
        'aria-required-parent': 'error',
        'aria-roles': 'error',
        'aria-valid-attr-value': 'error',
        'aria-valid-attr': 'error',
        'button-name': 'error',
        'bypass': 'error',
        'color-contrast': 'error',
        'definition-list': 'error',
        'dlitem': 'error',
        'document-title': 'error',
        'duplicate-id-active': 'error',
        'duplicate-id-aria': 'error',
        'form-field-multiple-labels': 'error',
        'frame-title': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'html-lang-valid': 'error',
        'image-alt': 'error',
        'input-image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'list': 'error',
        'listitem': 'error',
        'meta-viewport': 'error',
        'object-alt': 'error',
        'tabindex': 'error',
        'td-headers-attr': 'error',
        'th-has-data-cells': 'error',
        'valid-lang': 'error',
        'video-caption': 'error',
        'video-description': 'error',

        // 警告级别
        'link-in-text-block': 'warn',
        'skip-link': 'warn',
      },
    },
    upload: {
      // 上传配置
      target: 'temporary-public-storage',
    },
  },
};
```

#### GitHub Actions 工作流

```yaml
# .github/workflows/a11y.yml
name: Accessibility Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  jest-axe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Jest Axe tests
        run: npm run test:a11y -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  lighthouse-ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

  cypress-a11y:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cypress run
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm run start
          wait-on: 'http://localhost:3000'
          browser: chrome
```

#### 可访问性监控仪表板

```typescript
// scripts/a11y-report.ts
import { createReport } from 'axe-core';
import fs from 'fs/promises';
import puppeteer from 'puppeteer';

interface A11yReport {
  url: string;
  timestamp: string;
  violations: any[];
  passes: any[];
  incomplete: any[];
  score: number;
}

async function runA11yAudit(url: string): Promise<A11yReport> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: 'networkidle0' });

  // 注入 axe-core
  await page.addScriptTag({
    path: require.resolve('axe-core'),
  });

  // 运行测试
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run({
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
      },
    });
  });

  await browser.close();

  // 计算分数
  const total = results.violations.length + results.passes.length;
  const score = total > 0
    ? (results.passes.length / total) * 100
    : 100;

  return {
    url,
    timestamp: new Date().toISOString(),
    violations: results.violations,
    passes: results.passes,
    incomplete: results.incomplete,
    score: Math.round(score),
  };
}

async function generateReport(urls: string[]) {
  const reports: A11yReport[] = [];

  for (const url of urls) {
    console.log(`Auditing ${url}...`);
    try {
      const report = await runA11yAudit(url);
      reports.push(report);
    } catch (error) {
      console.error(`Failed to audit ${url}:`, error);
    }
  }

  // 生成 HTML 报告
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Accessibility Report</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 2rem; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .card { padding: 1.5rem; border-radius: 8px; background: #f5f5f5; }
    .score { font-size: 2rem; font-weight: bold; }
    .score-good { color: #22c55e; }
    .score-warning { color: #f59e0b; }
    .score-error { color: #ef4444; }
    .violation { background: #fef2f2; border-left: 4px solid #ef4444; padding: 1rem; margin: 1rem 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; }
  </style>
</head>
<body>
  <h1>Accessibility Report</h1>
  <p>Generated: ${new Date().toLocaleString()}</p>

  <div class="summary">
    <div class="card">
      <div class="label">Average Score</div>
      <div class="score ${getScoreClass(reports.reduce((a, r) => a + r.score, 0) / reports.length)}">
        ${Math.round(reports.reduce((a, r) => a + r.score, 0) / reports.length)}%
      </div>
    </div>
    <div class="card">
      <div class="label">Total Violations</div>
      <div class="score score-error">
        ${reports.reduce((a, r) => a + r.violations.length, 0)}
      </div>
    </div>
    <div class="card">
      <div class="label">Pages Tested</div>
      <div class="score">${reports.length}</div>
    </div>
  </div>

  <h2>Detailed Results</h2>
  <table>
    <thead>
      <tr>
        <th>URL</th>
        <th>Score</th>
        <th>Violations</th>
        <th>Passes</th>
      </tr>
    </thead>
    <tbody>
      ${reports.map(r => `
        <tr>
          <td><a href="${r.url}">${r.url}</a></td>
          <td class="${getScoreClass(r.score)}">${r.score}%</td>
          <td>${r.violations.length}</td>
          <td>${r.passes.length}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Violations</h2>
  ${reports.flatMap(r => r.violations.map(v => `
    <div class="violation">
      <h3>${v.id}</h3>
      <p><strong>${v.impact}</strong>: ${v.description}</p>
      <p>Help: <a href="${v.helpUrl}">${v.helpUrl}</a></p>
      <p>Affected: ${v.nodes.length} element(s)</p>
    </div>
  `)).join('')}
</body>
</html>
  `;

  await fs.writeFile('a11y-report.html', html);
  console.log('Report generated: a11y-report.html');
}

function getScoreClass(score: number): string {
  if (score >= 90) return 'score-good';
  if (score >= 70) return 'score-warning';
  return 'score-error';
}

// 运行
const urls = [
  'http://localhost:3000',
  'http://localhost:3000/about',
  'http://localhost:3000/contact',
];

generateReport(urls);
```

### 10.4 检查清单

| 检查项 | 工具 | 优先级 | 集成点 |
|--------|------|--------|--------|
| 组件级别可访问性测试 | jest-axe | P0 | 单元测试 |
| 页面级别可访问性扫描 | Cypress + axe-core | P0 | E2E 测试 |
| 性能与可访问性分数 | Lighthouse CI | P0 | CI/CD |
| 颜色对比度检查 | axe-core | P0 | 开发/测试 |
| 键盘导航测试 | Cypress/Playwright | P1 | E2E 测试 |
| 屏幕阅读器文本检查 | jest-axe | P1 | 单元测试 |
| 焦点管理验证 | 自定义测试 | P1 | E2E 测试 |
| 自动化可访问性监控 | Puppeteer + axe | P2 | 定期任务 |
| 可访问性回归防护 | CI 门禁 | P0 | PR 检查 |

---

## 附录

### A. 参考资源

| 资源 | URL | 描述 |
|------|-----|------|
| WCAG 2.2 | <https://www.w3.org/WAI/WCAG22/> | W3C 可访问性指南 |
| ARIA 规范 | <https://www.w3.org/WAI/ARIA/apg/> | ARIA 最佳实践指南 |
| axe-core | <https://github.com/dequelabs/axe-core> | 可访问性测试引擎 |
| react-i18next | <https://react.i18next.com/> | React 国际化库 |
| FormatJS | <https://formatjs.io/> | 国际化库和工具 |
| CLDR | <https://cldr.unicode.org/> | Unicode 区域数据 |
| Unicode Bidi | <https://www.unicode.org/reports/tr9/> | 双向文本算法 |

### B. 浏览器开发者工具

| 功能 | Chrome | Firefox | Safari |
|------|--------|---------|--------|
| 可访问性树 | DevTools → Elements → Accessibility | DevTools → Accessibility 面板 | 需启用开发者选项 |
| 对比度检查 | DevTools → Elements → Color picker | 内置颜色选择器 | 有限支持 |
| 键盘导航高亮 | DevTools → Rendering → Focus | 内置 | 有限支持 |
| Lighthouse | DevTools → Lighthouse | 不可用 | 不可用 |
| Axe 扩展 | 可用 | 可用 | 有限支持 |

### C. 屏幕阅读器测试

| 屏幕阅读器 | 平台 | 快捷键 | 测试重点 |
|------------|------|--------|----------|
| NVDA | Windows | Insert 或 Caps Lock | 免费，广泛使用 |
| JAWS | Windows | Insert | 商业软件，企业常用 |
| VoiceOver | macOS/iOS | Cmd + F5 | 苹果生态系统 |
| TalkBack | Android | 音量键同时按 | Android 平台 |
| Narrator | Windows | Win + Ctrl + Enter | Windows 内置 |

---

> **文档版本**: 1.0
> **最后更新**: 2024
> **维护者**: 前端工程化团队
