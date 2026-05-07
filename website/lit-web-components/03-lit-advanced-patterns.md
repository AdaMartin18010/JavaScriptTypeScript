---
title: 03 Lit 高级模式
description: 掌握 Lit 的高级功能：自定义指令、反应式控制器、上下文协议、SSR/Hydration，以及复杂组件的设计模式。
---

# 03 Lit 高级模式

> **前置知识**：Lit 基础、Web Components 标准
>
> **目标**：能够设计复杂的 Lit 组件，掌握指令、控制器和上下文系统

---

## 1. 自定义指令

### 1.1 基础指令

```typescript
import { Directive, directive } from 'lit/directive.js';
import { noChange } from 'lit';

class TooltipDirective extends Directive {
  private tooltipEl?: HTMLDivElement;
  private hostEl?: HTMLElement;

  update(part, [text]) {
    this.hostEl = part.element;

    if (!this.tooltipEl) {
      this.tooltipEl = document.createElement('div');
      this.tooltipEl.className = 'tooltip';
      document.body.appendChild(this.tooltipEl);

      // 添加事件监听
      this.hostEl.addEventListener('mouseenter', () => this._show());
      this.hostEl.addEventListener('mouseleave', () => this._hide());
    }

    this.tooltipEl.textContent = text;
    return noChange;
  }

  render(text: string) {
    return noChange;
  }

  private _show() {
    if (this.tooltipEl && this.hostEl) {
      const rect = this.hostEl.getBoundingClientRect();
      this.tooltipEl.style.left = `${rect.left}px`;
      this.tooltipEl.style.top = `${rect.bottom + 4}px`;
      this.tooltipEl.style.display = 'block';
    }
  }

  private _hide() {
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
  }

  // 清理
  disconnected() {
    this.tooltipEl?.remove();
  }
}

const tooltip = directive(TooltipDirective);

// 使用
import { html } from 'lit';

render() {
  return html`
    <button ${tooltip('点击提交表单')}>提交</button>
    <span ${tooltip('这是提示信息')}>?</span>
  `;
}
```

### 1.2 异步指令

```typescript
import { AsyncDirective, directive } from 'lit/async-directive.js';

class FetchDirective extends AsyncDirective {
  private abortController?: AbortController;

  render(url: string) {
    // 取消之前的请求
    this.abortController?.abort();
    this.abortController = new AbortController();

    fetch(url, { signal: this.abortController.signal })
      .then(res => res.text())
      .then(data => this.setValue(data))
      .catch(err => {
        if (err.name !== 'AbortError') {
          this.setValue(`Error: ${err.message}`);
        }
      });

    return '加载中...';
  }

  disconnected() {
    this.abortController?.abort();
  }
}

const fetchData = directive(FetchDirective);

// 使用
render() {
  return html`
    <div>${fetchData('/api/content')}</div>
  `;
}
```

---

## 2. 反应式控制器

### 2.1 控制器模式

```typescript
import { ReactiveController, ReactiveControllerHost } from 'lit';

// 定义控制器
class MouseController implements ReactiveController {
  private host: ReactiveControllerHost;
  pos = { x: 0, y: 0 };

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    window.addEventListener('mousemove', this._onMouseMove);
  }

  hostDisconnected() {
    window.removeEventListener('mousemove', this._onMouseMove);
  }

  private _onMouseMove = (e: MouseEvent) => {
    this.pos = { x: e.clientX, y: e.clientY };
    this.host.requestUpdate();
  };
}

// 在组件中使用
import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('mouse-tracker')
export class MouseTracker extends LitElement {
  private mouse = new MouseController(this);

  render() {
    return html`
      <p>Mouse: ${this.mouse.pos.x}, ${this.mouse.pos.y}</p>
    `;
  }
}
```

### 2.2 通用控制器库

```typescript
// ResizeObserver 控制器
class ResizeController implements ReactiveController {
  host: ReactiveControllerHost;
  observer?: ResizeObserver;
  width = 0;
  height = 0;

  constructor(host: ReactiveControllerHost, private target?: Element) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    const target = this.target || (this.host as LitElement).renderRoot.firstElementChild;
    if (target) {
      this.observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.width = entry.contentRect.width;
          this.height = entry.contentRect.height;
          this.host.requestUpdate();
        }
      });
      this.observer.observe(target);
    }
  }

  hostDisconnected() {
    this.observer?.disconnect();
  }
}

// IntersectionObserver 控制器
class IntersectionController implements ReactiveController {
  host: ReactiveControllerHost;
  observer?: IntersectionObserver;
  isIntersecting = false;

  constructor(
    host: ReactiveControllerHost,
    private options?: IntersectionObserverInit
  ) {
    this.host = host;
    host.addController(this);
  }

  hostConnected() {
    const target = (this.host as LitElement).renderRoot.firstElementChild;
    if (target) {
      this.observer = new IntersectionObserver((entries) => {
        this.isIntersecting = entries[0]?.isIntersecting ?? false;
        this.host.requestUpdate();
      }, this.options);
      this.observer.observe(target);
    }
  }

  hostDisconnected() {
    this.observer?.disconnect();
  }
}
```

---

## 3. 上下文协议（Context Protocol）

### 3.1 提供者-消费者模式

```typescript
import { createContext, provide, consume } from '@lit/context';
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

// 定义上下文
export interface Theme {
  color: string;
  background: string;
}

export const themeContext = createContext<Theme>('theme');

// 提供者组件
@customElement('theme-provider')
export class ThemeProvider extends LitElement {
  @provide({ context: themeContext })
  @property({ attribute: false })
  theme: Theme = {
    color: '#333',
    background: '#fff'
  };

  render() {
    return html`<slot></slot>`;
  }
}

// 消费者组件
@customElement('themed-button')
export class ThemedButton extends LitElement {
  @consume({ context: themeContext, subscribe: true })
  theme?: Theme;

  render() {
    return html`
      <button style="
        color: ${this.theme?.color};
        background: ${this.theme?.background};
      ">
        <slot></slot>
      </button>
    `;
  }
}
```

```html
<!-- 使用 -->
<theme-provider .theme="${{ color: 'white', background: '#007bff' }}">
  <themed-button>主题按钮</themed-button>
</theme-provider>
```

---

## 4. SSR 与 Hydration

### 4.1 Lit SSR 基础

```typescript
// server.ts（Node.js）
import { render } from '@lit-labs/ssr';
import { html } from 'lit';
import './my-element.js';

app.get('/', async (req, res) => {
  const result = await render(html`
    <my-element name="SSR">
      <p>服务器渲染的内容</p>
    </my-element>
  `);

  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <script type="module" src="/my-element.js"></script>
      </head>
      <body>
        ${result}
      </body>
    </html>
  `);
});
```

### 4.2 Hydration

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { hydrate } from '@lit-labs/ssr-client';

@customElement('ssr-element')
export class SsrElement extends LitElement {
  @property()
  name = '';

  render() {
    return html`<h1>Hello, ${this.name}!</h1>`;
  }
}

// 客户端 hydration
if (typeof window !== 'undefined') {
  hydrate(new SsrElement(), document.querySelector('ssr-element')!);
}
```

---

## 5. 复杂组件设计

### 5.1 组合组件

```typescript
import { LitElement, html } from 'lit';
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js';

// Tab 面板组件
@customElement('tab-panel')
export class TabPanel extends LitElement {
  @property()
  label = '';

  render() {
    return html`<slot></slot>`;
  }
}

// Tabs 容器组件
@customElement('my-tabs')
export class MyTabs extends LitElement {
  @property({ type: Number })
  activeIndex = 0;

  @queryAssignedElements({ selector: 'tab-panel' })
  panels!: TabPanel[];

  render() {
    return html`
      <div class="tab-list" role="tablist">
        ${this.panels?.map((panel, i) => html`
          <button
            role="tab"
            aria-selected="${i === this.activeIndex}"
            @click="${() => this.activeIndex = i}"
            class="${i === this.activeIndex ? 'active' : ''}">
            ${panel.label}
          </button>
        `)}
      </div>
      <div class="tab-content">
        <slot></slot>
      </div>
    `;
  }

  updated() {
    // 更新面板可见性
    this.panels?.forEach((panel, i) => {
      panel.style.display = i === this.activeIndex ? 'block' : 'none';
    });
  }
}
```

```html
<!-- 使用 -->
<my-tabs>
  <tab-panel label="首页">
    <h2>首页内容</h2>
  </tab-panel>
  <tab-panel label="设置">
    <h2>设置内容</h2>
  </tab-panel>
</my-tabs>
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **指令未清理** | 自定义指令创建的全局 DOM 未移除 | 实现 `disconnected()` 方法 |
| **控制器重复添加** | 多次实例化同一控制器 | 在 constructor 中只添加一次 |
| **SSR 客户端不匹配** | 服务端和客户端渲染结果不一致 | 确保初始属性一致 |
| **上下文循环依赖** | 上下文提供者和消费者互相依赖 | 分层设计，避免循环 |

---

## 练习

1. 实现一个 `infinite-scroll` 指令：元素进入视口时自动触发加载。
2. 实现一个 `FormController`：管理表单验证状态，可复用于多个表单组件。
3. 实现一个 `ModalController`：管理模态框的打开/关闭状态，支持多个模态框堆叠。

---

## 延伸阅读

- [Lit Context](https://lit.dev/docs/data/context/)
- [Lit SSR](https://lit.dev/docs/ssr/overview/)
- [Lit Labs](https://github.com/lit/lit/tree/main/packages/labs)
