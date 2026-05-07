---
title: 01 Web Components 标准深度
description: 深入理解 Web Components 三大标准：Custom Elements、Shadow DOM 和 HTML Templates。掌握浏览器原生组件化的核心机制。
---

# 01 Web Components 标准深度

> **前置知识**：ES6 Class、DOM API、CSS 基础
>
> **目标**：理解 Web Components 标准的底层机制，能够手写原生 Custom Element

---

## 1. Web Components 三大标准

### 1.1 标准概览

Web Components 由三个核心技术组成：

| 标准 | 作用 | API |
|------|------|-----|
| **Custom Elements** | 定义新的 HTML 标签 | `customElements.define()` |
| **Shadow DOM** | 封装样式和 DOM 结构 | `attachShadow()` |
| **HTML Templates** | 定义可复用的 HTML 片段 | `<template>`、`<slot>` |

---

## 2. Custom Elements

### 2.1 基础定义

```javascript
// 定义一个自定义元素
class MyButton extends HTMLElement {
  constructor() {
    super(); // 必须首先调用 super()

    // 元素初始化逻辑
    this.addEventListener('click', () => {
      console.log('Button clicked!');
    });
  }

  // 生命周期：元素被插入 DOM
  connectedCallback() {
    this.innerHTML = `<button>点击我</button>`;
  }

  // 生命周期：元素从 DOM 移除
  disconnectedCallback() {
    console.log('Button removed');
  }

  // 生命周期：属性变化时
  static get observedAttributes() {
    return ['label', 'disabled'];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} changed from ${oldValue} to ${newValue}`);
    if (name === 'label') {
      this.querySelector('button').textContent = newValue;
    }
  }
}

// 注册自定义元素（标签名必须包含连字符）
customElements.define('my-button', MyButton);
```

```html
<!-- 使用自定义元素 -->
<my-button label="提交"></my-button>
<my-button label="取消" disabled></my-button>
```

### 2.2 生命周期详解

```javascript
class LifecycleDemo extends HTMLElement {
  constructor() {
    super();
    console.log('1. constructor — 元素实例创建');
    // 注意：此时元素的属性尚未解析完毕
  }

  connectedCallback() {
    console.log('2. connectedCallback — 元素插入 DOM');
    // 安全的操作 DOM 和读取属性的时机
    this.render();
  }

  disconnectedCallback() {
    console.log('3. disconnectedCallback — 元素从 DOM 移除');
    // 清理工作：移除事件监听、取消定时器等
  }

  adoptedCallback() {
    console.log('4. adoptedCallback — 元素移动到新的 document');
    // 例如从 iframe 移动到主文档
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log('5. attributeChangedCallback — 属性变化');
    // 响应属性变化，更新组件状态
  }

  static get observedAttributes() {
    return ['title', 'size'];
  }
}
```

### 2.3 自定义内置元素（Customized Built-in Elements）

```javascript
// 扩展现有 HTML 元素
class FancyButton extends HTMLButtonElement {
  connectedCallback() {
    this.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
    this.style.border = 'none';
    this.style.padding = '10px 20px';
    this.style.borderRadius = '25px';
    this.style.color = 'white';
  }
}

// 注册时指定 extends
customElements.define('fancy-button', FancyButton, { extends: 'button' });
```

```html
<!-- 使用 is 属性 -->
<button is="fancy-button">渐变按钮</button>
```

**注意**：Safari 不支持 Customized Built-in Elements，生产环境建议使用 Autonomous Custom Elements。

---

## 3. Shadow DOM

### 3.1 基础用法

```javascript
class ShadowCard extends HTMLElement {
  constructor() {
    super();

    // 创建 Shadow Root
    const shadow = this.attachShadow({ mode: 'open' });

    // Shadow DOM 内的内容
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          background: white;
        }

        :host([variant="primary"]) {
          background: #007bff;
          color: white;
        }

        h2 {
          margin: 0 0 10px 0;
          font-size: 1.5rem;
        }

        ::slotted(p) {
          color: #666;
          line-height: 1.6;
        }
      </style>

      <h2><slot name="title">默认标题</slot></h2>
      <slot>默认内容</slot>
    `;
  }
}

customElements.define('shadow-card', ShadowCard);
```

```html
<!-- 使用 -->
<shadow-card>
  <span slot="title">卡片标题</span>
  <p>这是卡片的内容。</p>
</shadow-card>

<shadow-card variant="primary">
  <span slot="title">主要卡片</span>
  <p>这是主要样式卡片。</p>
</shadow-card>
```

### 3.2 Shadow DOM 模式

```javascript
// mode: 'open' — 外部可以访问 shadowRoot
const openShadow = this.attachShadow({ mode: 'open' });
console.log(this.shadowRoot); // 可以访问

// mode: 'closed' — 外部无法访问 shadowRoot
const closedShadow = this.attachShadow({ mode: 'closed' });
console.log(this.shadowRoot); // null
```

**建议**：始终使用 `mode: 'open'`，`closed` 不提供真正的安全保护，只会增加调试难度。

### 3.3 CSS 选择器

```css
/* :host — 选择自定义元素本身 */
:host {
  display: block;
}

/* :host() — 带条件的 host 选择 */
:host([disabled]) {
  opacity: 0.5;
  pointer-events: none;
}

/* :host-context() — 根据祖先元素选择 */
:host-context(.dark-theme) {
  background: #333;
  color: white;
}

/* ::slotted() — 选择插入的槽位内容 */
::slotted(h2) {
  color: #007bff;
}

::slotted([slot="header"]) {
  font-weight: bold;
}
```

---

## 4. HTML Templates 和 Slots

### 4.1 Template 元素

```html
<!-- 定义模板 -->
<template id="user-card-template">
  <style>
    .card { padding: 16px; border: 1px solid #ddd; }
    .name { font-weight: bold; }
  </style>
  <div class="card">
    <div class="name"><slot name="name">未知用户</slot></div>
    <div class="email"><slot name="email">无邮箱</slot></div>
  </div>
</template>
```

```javascript
class UserCard extends HTMLElement {
  constructor() {
    super();
    const template = document.getElementById('user-card-template');
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));
  }
}

customElements.define('user-card', UserCard);
```

### 4.2 插槽系统

```html
<!-- 具名插槽 -->
<my-layout>
  <header slot="header">页面标题</header>
  <main slot="content">主要内容</main>
  <footer slot="footer">页脚信息</footer>
</my-layout>

<!-- 默认插槽 -->
<my-container>
  <p>这将进入默认插槽</p>
  <p>这也是默认插槽的内容</p>
</my-container>
```

```javascript
class MyLayout extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        .layout { display: grid; grid-template-rows: auto 1fr auto; min-height: 100vh; }
        header { background: #f0f0f0; padding: 1rem; }
        main { padding: 1rem; }
        footer { background: #333; color: white; padding: 1rem; }
      </style>
      <div class="layout">
        <header><slot name="header"></slot></header>
        <main><slot name="content"></slot></main>
        <footer><slot name="footer"></slot></footer>
      </div>
    `;
  }
}
```

---

## 5. 属性与属性的反射

### 5.1 属性映射

```javascript
class ConfigurableElement extends HTMLElement {
  // getter/setter 实现属性反射
  get title() {
    return this.getAttribute('title') || 'Default';
  }

  set title(value) {
    if (value) {
      this.setAttribute('title', value);
    } else {
      this.removeAttribute('title');
    }
  }

  get size() {
    return parseInt(this.getAttribute('size')) || 16;
  }

  set size(value) {
    this.setAttribute('size', String(value));
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
}
```

### 5.2 自动反射辅助

```javascript
// 使用装饰器模式简化属性反射
function reflectAttribute(target, propertyKey, options = {}) {
  const { type = 'string', defaultValue = '' } = options;

  Object.defineProperty(target, propertyKey, {
    get() {
      const attr = this.getAttribute(propertyKey);
      if (attr === null) return defaultValue;

      switch (type) {
        case 'boolean': return true;
        case 'number': return Number(attr);
        case 'json': return JSON.parse(attr);
        default: return attr;
      }
    },
    set(value) {
      if (type === 'boolean') {
        if (value) this.setAttribute(propertyKey, '');
        else this.removeAttribute(propertyKey);
      } else if (value === null || value === undefined) {
        this.removeAttribute(propertyKey);
      } else {
        this.setAttribute(propertyKey, String(value));
      }
    },
  });
}
```

---

## 6. 浏览器兼容性

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| Custom Elements | 54+ | 63+ | 10.1+ | 79+ |
| Shadow DOM | 53+ | 63+ | 10.1+ | 79+ |
| HTML Templates | 26+ | 22+ | 7.1+ | 13+ |
| Declarative Shadow DOM | 90+ | 123+ | 17+ | 90+ |

### Polyfill

```html
<!-- 旧浏览器兼容 -->
<script src="https://unpkg.com/@webcomponents/webcomponentsjs@latest/webcomponents-loader.js"></script>
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **constructor 中操作属性** | 属性尚未解析 | 延迟到 `connectedCallback` |
| **忘记调用 super()** | 必须首先调用 | 始终在 constructor 第一行调用 |
| **标签名不含连字符** | 注册失败 | 使用 `my-element` 格式 |
| **closed Shadow DOM** | 调试困难 | 使用 open 模式 |

---

## 练习

1. 手写一个原生 `<toggle-switch>` 组件：支持 checked 属性、自定义事件、键盘操作。
2. 实现一个 `<tabs-container>` 组件：使用 Shadow DOM 封装样式，支持具名插槽。
3. 实现一个 `<modal-dialog>` 组件：支持 open 属性、ESC 关闭、焦点管理。

---

## 延伸阅读

- [MDN — Web Components](https://developer.mozilla.org/en-US/docs/Web/Web_Components)
- [Google Web Fundamentals — Custom Elements](https://developers.google.com/web/fundamentals/web-components/customelements)
- [Web Components Best Practices](https://open-wc.org/)
