---
title: 08 安全最佳实践
description: 掌握 Lit Web Components 的安全最佳实践：XSS 防护、CSP 配置、输入消毒、Shadow DOM 事件边界和常见漏洞防范。
---

# 08 安全最佳实践

> **前置知识**：Web 安全基础、Lit 组件开发
>
> **目标**：能够构建安全的 Web Components，防范常见 Web 漏洞

---

## 1. XSS 防护

### 1.1 模板自动转义

Lit 的 `html` 模板标签自动转义插值内容：

```typescript
import { LitElement, html } from 'lit';

class SafeComponent extends LitElement {
  @property()
  userInput = '<script>alert("xss")</script>';

  render() {
    // ✅ 安全：自动转义
    return html`<div>${this.userInput}</div>`;
    // 渲染为: <div>&lt;script&gt;alert("xss")&lt;/script&gt;</div>
  }
}
```

### 1.2 unsafeHTML 的风险

```typescript
import { LitElement, html, unsafeHTML } from 'lit';

class DangerousComponent extends LitElement {
  @property()
  content = '';

  render() {
    // ❌ 危险：如果 content 来自用户输入，会导致 XSS
    return html`<div>${unsafeHTML(this.content)}</div>`;
  }
}

// 安全的替代方案：DOMPurify
import DOMPurify from 'dompurify';

class SafeRichText extends LitElement {
  @property()
  htmlContent = '';

  render() {
    const clean = DOMPurify.sanitize(this.htmlContent, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
      ALLOWED_ATTR: ['href'],
    });
    return html`<div>${unsafeHTML(clean)}</div>`;
  }
}
```

### 1.3 unsafeCSS 的风险

```typescript
import { LitElement, html, css, unsafeCSS } from 'lit';

class StyledComponent extends LitElement {
  @property()
  themeColor = '#007bff';

  static styles = css`
    :host { display: block; }
  `;

  // 动态样式（安全做法）
  render() {
    return html`
      <style>
        .dynamic { color: ${unsafeCSS(this.themeColor)}; }
      </style>
      <div class="dynamic">内容</div>
    `;
  }
}

// 更安全的做法：使用 CSS 变量
class SaferComponent extends LitElement {
  static styles = css`
    :host { display: block; }
    .dynamic { color: var(--theme-color, #007bff); }
  `;

  @property()
  themeColor = '#007bff';

  render() {
    return html`
      <div class="dynamic" style="--theme-color: ${this.themeColor}">
        内容
      </div>
    `;
  }
}
```

---

## 2. Content Security Policy (CSP)

### 2.1 严格 CSP 配置

```html
<!-- 推荐 CSP 策略 -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
">
```

### 2.2 Lit 与 CSP 兼容性

```typescript
// Lit 使用 lit-html，需要 'unsafe-inline' 用于样式
// 更好的做法：使用哈希或 nonce

// Next.js 示例
import { LitElement, html, css } from 'lit';

// 如果使用严格的 style-src，需要将样式提取到外部 CSS
class CSPFriendlyComponent extends LitElement {
  // 不使用 static styles
  // 而是使用外部 CSS 文件

  render() {
    return html`
      <div class="my-component">
        <h1 class="my-component__title">标题</h1>
      </div>
    `;
  }
}
```

---

## 3. 输入验证

### 3.1 属性验证

```typescript
class ValidatedInput extends LitElement {
  @property()
  value = '';

  @property()
  type: 'text' | 'email' | 'url' = 'text';

  @property({ type: Number })
  maxLength = 100;

  private _validateInput(value: string): boolean {
    if (value.length > this.maxLength) return false;

    switch (this.type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  private _handleInput(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    const isValid = this._validateInput(target.value);

    this.value = target.value;
    this.dispatchEvent(new CustomEvent('change', {
      detail: { value: this.value, valid: isValid },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <input
        .value="${this.value}"
        @input="${this._handleInput}"
        type="${this.type}"
        maxlength="${this.maxLength}"
      />
    `;
  }
}
```

---

## 4. Shadow DOM 安全边界

### 4.1 事件传播控制

```typescript
class SecureComponent extends LitElement {
  private _handleSensitiveEvent(e: CustomEvent) {
    // 阻止事件穿透 Shadow DOM 边界
    if (!e.composed) {
      e.stopPropagation();
    }

    // 清理事件详情中的敏感数据
    const sanitizedDetail = { ...e.detail };
    delete sanitizedDetail.password;
    delete sanitizedDetail.token;

    this.dispatchEvent(new CustomEvent('secure-event', {
      detail: sanitizedDetail,
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    return html`
      <child-component @sensitive-event="${this._handleSensitiveEvent}"></child-component>
    `;
  }
}
```

### 4.2 Slot 内容安全

```typescript
class SafeSlot extends LitElement {
  render() {
    return html`
      <div class="container">
        <!-- 默认插槽：接受任何内容 -->
        <slot></slot>

        <!-- 命名插槽：特定用途 -->
        <slot name="header"></slot>
      </div>
    `;
  }

  // 验证插入的内容
  private _validateSlottedContent() {
    const slotted = this.shadowRoot
      ?.querySelector('slot')
      ?.assignedElements();

    slotted?.forEach(el => {
      // 检查是否包含 script 标签
      if (el.tagName === 'SCRIPT') {
        console.warn('Script tags are not allowed in slots');
        el.remove();
      }
    });
  }
}
```

---

## 5. 常见漏洞防范

### 5.1 开放重定向

```typescript
class LinkComponent extends LitElement {
  @property()
  href = '';

  render() {
    // 验证 URL，防止开放重定向
    const safeUrl = this._sanitizeUrl(this.href);

    return html`<a href="${safeUrl}"><slot></slot></a>`;
  }

  private _sanitizeUrl(url: string): string {
    try {
      const parsed = new URL(url, window.location.href);
      // 只允许同源或白名单域名
      const allowedHosts = ['example.com', 'api.example.com'];
      if (!allowedHosts.includes(parsed.hostname)) {
        return '#';
      }
      return parsed.href;
    } catch {
      return '#';
    }
  }
}
```

### 5.2 点击劫持

```typescript
// 在应用层面添加 X-Frame-Options
// 或通过 CSP frame-ancestors
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **直接使用 innerHTML** | 导致 XSS | 使用 Lit 模板或 DOMPurify |
| **不验证属性** | 恶意输入导致漏洞 | 添加属性验证逻辑 |
| **事件详情泄露** | 自定义事件传递敏感数据 | 清理事件详情 |
| **忽略 CSP** | 应用易受 XSS 攻击 | 配置严格的 CSP |

---

## 练习

1. 为一个富文本编辑器组件添加 XSS 防护：使用 DOMPurify 过滤用户输入的 HTML。
2. 实现一个安全的文件上传组件：验证文件类型、大小，防止恶意文件上传。
3. 配置严格的 CSP 策略，确保 Lit 组件正常工作。

---

## 延伸阅读

- [Lit Security](https://lit.dev/docs/tools/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CSP MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify](https://github.com/cure53/DOMPurify)
