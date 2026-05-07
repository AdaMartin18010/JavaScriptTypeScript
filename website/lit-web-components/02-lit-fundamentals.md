---
title: 02 Lit 基础
description: 掌握 Lit 的核心概念：响应式属性、声明式模板、事件系统、样式隔离，以及 LitElement 的生命周期。
---

# 02 Lit 基础

> **前置知识**：Web Components 标准、ES6 Class、Template Literals
>
> **目标**：能够使用 Lit 构建基础的自定义元素组件

---

## 1. Lit 的定位与优势

### 1.1 为什么用 Lit？

Lit 是 Google 开发的轻量级库，基于 Web Components 标准：

| 特性 | 原生 Web Components | Lit |
|------|-------------------|-----|
| 模板语法 | 手动拼接字符串 | 声明式 `html` 模板 |
| 响应式 | 手动管理 | `@property` 自动触发更新 |
| 更新效率 | 全量重渲染 | 智能差异更新 |
| 包体积 | 0（原生） | ~5 KB gzipped |
| 学习曲线 | 陡峭 | 平缓 |

### 1.2 最小示例

```typescript
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('my-greeting')
export class MyGreeting extends LitElement {
  @property()
  name = 'World';

  render() {
    return html`<h1>Hello, ${this.name}!</h1>`;
  }
}
```

```html
<my-greeting name="Lit"></my-greeting>
```

---

## 2. 响应式属性系统

### 2.1 @property 装饰器

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('user-card')
export class UserCard extends LitElement {
  // 字符串属性（默认）
  @property()
  name = '';

  // 数字属性
  @property({ type: Number })
  age = 0;

  // 布尔属性
  @property({ type: Boolean })
  active = false;

  // 数组属性
  @property({ type: Array })
  tags: string[] = [];

  // 对象属性
  @property({ type: Object })
  address = { city: '', country: '' };

  // 内部状态（不反映到属性）
  @property({ attribute: false })
  private _internalState = 0;

  // 自定义属性名映射
  @property({ attribute: 'user-name' })
  userName = '';

  // 反射属性到 DOM
  @property({ reflect: true })
  role = 'user';

  render() {
    return html`
      <div class="card ${this.active ? 'active' : ''}">
        <h2>${this.name}</h2>
        <p>Age: ${this.age}</p>
        <div class="tags">
          ${this.tags.map(tag => html`<span class="tag">${tag}</span>`)}
        </div>
      </div>
    `;
  }
}
```

```html
<!-- 使用 -->
<user-card name="Alice" age="30" active tags='["admin", "editor"]'></user-card>
```

### 2.2 属性配置选项

```typescript
@property({
  // 属性类型转换器
  type: String,

  // 是否映射到 HTML 属性
  attribute: 'my-property', // 或 false

  // 是否反射到 HTML 属性
  reflect: true,

  // 自定义转换器
  converter: {
    fromAttribute(value: string) {
      return JSON.parse(value);
    },
    toAttribute(value: unknown) {
      return JSON.stringify(value);
    }
  },

  // 是否通知变化（用于不使用装饰器的场景）
  noAccessor: false,

  // 是否等待 Promise 解析后再更新
  hasChanged(newVal: unknown, oldVal: unknown) {
    return newVal !== oldVal;
  }
})
```

---

## 3. 声明式模板

### 3.1 html 模板标签

```typescript
import { LitElement, html } from 'lit';

render() {
  return html`
    <div class="container">
      <h1>${this.title}</h1>

      <!-- 条件渲染 -->
      ${this.loading
        ? html`<span class="spinner">加载中...</span>`
        : html`<div class="content">${this.content}</div>`
      }

      <!-- 列表渲染 -->
      <ul>
        ${this.items.map(item => html`
          <li key="${item.id}">
            ${item.name}
          </li>
        `)}
      </ul>
    </div>
  `;
}
```

### 3.2 模板指令

```typescript
import { LitElement, html } from 'lit';
import { classMap, styleMap, repeat, cache, guard, until, live, ref } from 'lit/directives/*.js';

render() {
  return html`
    <!-- classMap: 动态类名 -->
    <div class="${classMap({
      active: this.active,
      disabled: this.disabled,
      'has-error': this.error
    })}">
      动态类名
    </div>

    <!-- styleMap: 动态样式 -->
    <div style="${styleMap({
      color: this.color,
      backgroundColor: this.bgColor,
      fontSize: `${this.size}px`
    })}">
      动态样式
    </div>

    <!-- repeat: 高效列表（带 key） -->
    <ul>
      ${repeat(
        this.items,
        item => item.id,           // key 函数
        item => html`<li>${item.name}</li>`  // 模板函数
      )}
    </ul>

    <!-- cache: 条件切换时缓存模板 -->
    ${cache(this.showDetail
      ? html`<detail-view .data="${this.detailData}"></detail-view>`
      : html`<summary-view .data="${this.summaryData}"></summary-view>`
    )}

    <!-- guard: 只在依赖变化时重新渲染 -->
    ${guard([this.expensiveValue], () => html`
      <expensive-renderer .value="${this.expensiveValue}"></expensive-renderer>
    `)}

    <!-- until: 等待 Promise -->
    <div>
      ${until(this.dataPromise, html`<span>加载中...</span>`)}
    </div>

    <!-- live: 双向绑定（用于表单） -->
    <input .value="${live(this.inputValue)}" @input="${this._onInput}">

    <!-- ref: 获取元素引用 -->
    <input ${ref(this._inputRef)}>
  `;
}
```

---

## 4. 事件系统

### 4.1 监听事件

```typescript
import { LitElement, html } from 'lit';

class MyButton extends LitElement {
  @property({ type: Number })
  count = 0;

  private _handleClick() {
    this.count++;
    // 触发自定义事件
    this.dispatchEvent(new CustomEvent('count-changed', {
      detail: { count: this.count },
      bubbles: true,
      composed: true  // 穿透 Shadow DOM 边界
    }));
  }

  render() {
    return html`
      <button @click="${this._handleClick}">
        点击了 ${this.count} 次
      </button>
    `;
  }
}
```

### 4.2 事件选项

```typescript
render() {
  return html`
    <!-- 阻止默认行为 -->
    <form @submit="${this._handleSubmit}">
    <!-- 等效于 @submit="${(e) => { e.preventDefault(); this._handleSubmit(e); }}" -->

    <!-- 使用事件选项对象 -->
    <div @scroll="${this._handleScroll}" ?passive="${true}"></div>

    <!-- 只触发一次 -->
    <button @click="${{ handleEvent: () => this.init(), once: true }}">
      初始化（只执行一次）
    </button>
  `;
}
```

---

## 5. 样式系统

### 5.1 静态样式

```typescript
import { LitElement, html, css } from 'lit';

class StyledCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      background: var(--card-bg, white);
    }

    :host([variant="primary"]) {
      background: #007bff;
      color: white;
    }

    h2 {
      margin: 0 0 8px 0;
      font-size: 1.25rem;
    }

    ::slotted(p) {
      margin: 0;
      color: var(--card-text-color, #333);
    }
  `;

  @property()
  variant = '';

  render() {
    return html`
      <h2><slot name="title"></slot></h2>
      <slot></slot>
    `;
  }
}
```

### 5.2 动态样式

```typescript
import { LitElement, html, css, unsafeCSS } from 'lit';

class DynamicTheme extends LitElement {
  @property()
  themeColor = '#007bff';

  static styles = css`
    :host { display: block; }
    .themed { padding: 16px; }
  `;

  // 动态生成样式
  private get _dynamicStyles() {
    return css`
      .themed {
        border-left: 4px solid ${unsafeCSS(this.themeColor)};
      }
    `;
  }

  render() {
    // 注意：unsafeCSS 仅用于可信的输入
    return html`
      <style>
        .themed { border-color: ${unsafeCSS(this.themeColor)}; }
      </style>
      <div class="themed">
        主题色边框
      </div>
    `;
  }
}
```

### 5.3 CSS 变量与主题

```typescript
class ThemeAware extends LitElement {
  static styles = css`
    :host {
      --primary-color: #007bff;
      --text-color: #333;
      --bg-color: white;
    }

    :host([theme="dark"]) {
      --primary-color: #4dabf7;
      --text-color: #e9ecef;
      --bg-color: #212529;
    }

    .container {
      color: var(--text-color);
      background: var(--bg-color);
      padding: 16px;
    }

    button {
      background: var(--primary-color);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
    }
  `;

  @property()
  theme = 'light';

  render() {
    return html`
      <div class="container">
        <slot></slot>
        <button @click="${this._toggleTheme}">切换主题</button>
      </div>
    `;
  }

  private _toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
  }
}
```

---

## 6. 生命周期

### 6.1 Lit 生命周期概览

```
constructor()
  └── 创建响应式属性代理
      └── requestUpdate() — 首次更新请求
          └── performUpdate()
              ├── shouldUpdate(changedProperties) — 决定是否更新
              ├── willUpdate(changedProperties) — 更新前
              ├── render() — 渲染模板
              ├── update(changedProperties) — DOM 更新
              ├── firstUpdated(changedProperties) — 首次更新后
              └── updated(changedProperties) — 每次更新后
```

### 6.2 常用生命周期方法

```typescript
import { LitElement, html } from 'lit';

class LifecycleDemo extends LitElement {
  @property()
  data: any[] = [];

  constructor() {
    super();
    console.log('1. constructor');
  }

  connectedCallback() {
    super.connectedCallback();
    console.log('2. connectedCallback');
    // 添加全局事件监听
    window.addEventListener('resize', this._handleResize);
  }

  disconnectedCallback() {
    console.log('3. disconnectedCallback');
    // 清理
    window.removeEventListener('resize', this._handleResize);
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: Map<string, any>) {
    console.log('4. willUpdate', changedProperties);
    // 在 render 前准备数据
    if (changedProperties.has('data')) {
      this._processedData = this._processData(this.data);
    }
  }

  protected firstUpdated(changedProperties: Map<string, any>) {
    console.log('5. firstUpdated');
    // 首次渲染后操作 DOM
    this._inputRef.value?.focus();
  }

  protected updated(changedProperties: Map<string, any>) {
    console.log('6. updated');
    // 每次更新后的操作
  }

  render() {
    console.log('render');
    return html`<div>内容</div>`;
  }

  private _handleResize = () => {
    // 处理窗口大小变化
  };
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **修改属性不触发更新** | 直接修改数组/对象内部 | 创建新引用：`this.items = [...this.items, newItem]` |
| **render 中副作用** | 在 render 中修改状态 | 移到 willUpdate 或事件处理器中 |
| **忘记取消事件监听** | 组件移除后监听仍在 | 在 disconnectedCallback 中清理 |
| **unsafeCSS 注入** | 使用用户输入作为 CSS | 先验证/转义输入 |

---

## 练习

1. 使用 Lit 实现一个 `<counter-button>` 组件：支持 min/max 限制、自定义步长、事件通知。
2. 实现一个 `<todo-list>` 组件：支持添加/删除/完成，使用 repeat 指令优化列表更新。
3. 实现一个 `<tab-panel>` 组件：使用 slots 分发内容，支持 active tab 属性。

---

## 延伸阅读

- [Lit Documentation](https://lit.dev/docs/)
- [Lit Playground](https://lit.dev/playground/)
- [Web Components — Google](https://developers.google.com/web/fundamentals/web-components)
