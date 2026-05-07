---
title: 09 性能优化
description: 掌握 Lit Web Components 的性能优化技术：懒加载、代码分割、渲染优化、首次绘制优化和内存管理。
---

# 09 性能优化

> **前置知识**：Lit 组件开发、浏览器性能基础
>
> **目标**：能够构建高性能的 Web Components

---

## 1. 懒加载

### 1.1 动态导入

```typescript
// 按需加载组件
async function loadChartComponent() {
  await import('./chart-component.js');
}

// 滚动到视口时加载
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      loadChartComponent();
      observer.disconnect();
    }
  }
});

observer.observe(document.querySelector('#chart-container')!);
```

### 1.2 条件加载

```typescript
// 根据用户代理加载不同实现
const isMobile = window.matchMedia('(max-width: 768px)').matches;

if (isMobile) {
  await import('./mobile-carousel.js');
} else {
  await import('./desktop-carousel.js');
}
```

---

## 2. 渲染优化

### 2.1 避免不必要更新

```typescript
import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('optimized-list')
export class OptimizedList extends LitElement {
  @property({ type: Array })
  items: string[] = [];

  // 自定义 shouldUpdate
  protected shouldUpdate(changedProperties: Map<string, any>) {
    // 只在 items 变化时更新
    if (changedProperties.has('items')) {
      return true;
    }
    return false;
  }

  // 或使用 hasChanged
  @property({
    type: Array,
    hasChanged(newVal: string[], oldVal: string[]) {
      return JSON.stringify(newVal) !== JSON.stringify(oldVal);
    }
  })
  filteredItems: string[] = [];

  render() {
    return html`
      <ul>
        ${this.items.map(item => html`<li>${item}</li>`)}
      </ul>
    `;
  }
}
```

### 2.2 虚拟滚动

```typescript
@customElement('virtual-list')
export class VirtualList extends LitElement {
  @property({ type: Number }) itemHeight = 50;
  @property({ type: Number }) totalItems = 10000;
  @property({ type: Array }) items: any[] = [];

  @state() private scrollTop = 0;

  private get visibleRange() {
    const start = Math.floor(this.scrollTop / this.itemHeight);
    const count = Math.ceil(this.clientHeight / this.itemHeight) + 1;
    return { start, end: start + count };
  }

  render() {
    const { start, end } = this.visibleRange;
    const visibleItems = this.items.slice(start, end);
    const totalHeight = this.totalItems * this.itemHeight;

    return html`
      <div class="viewport" @scroll="${this._handleScroll}">
        <div class="spacer" style="height: ${totalHeight}px">
          <div class="content" style="transform: translateY(${start * this.itemHeight}px)">
            ${visibleItems.map((item, i) => html`
              <div class="item" style="height: ${this.itemHeight}px">
                ${start + i}: ${item}
              </div>
            `)}
          </div>
        </div>
      </div>
    `;
  }

  private _handleScroll(e: Event) {
    this.scrollTop = (e.target as HTMLElement).scrollTop;
  }
}
```

---

## 3. 内存管理

### 3.1 清理定时器和监听

```typescript
@customElement('memory-safe')
export class MemorySafe extends LitElement {
  private intervalId?: number;
  private resizeObserver?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();

    this.intervalId = window.setInterval(() => {
      this._pollData();
    }, 5000);

    this.resizeObserver = new ResizeObserver((entries) => {
      this._handleResize(entries);
    });
    this.resizeObserver.observe(this);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    // 清理所有资源
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }

    this.resizeObserver?.disconnect();
  }

  private _pollData() { /* ... */ }
  private _handleResize(entries: ResizeObserverEntry[]) { /* ... */ }
}
```

---

## 常见陷阱

| 陷阱 | 说明 | 修正 |
|------|------|------|
| **内存泄漏** | 未清理事件监听 | 在 disconnectedCallback 中清理 |
| **过度渲染** | 频繁的状态更新 | 使用 shouldUpdate 控制 |
| **大列表性能** | 渲染 thousands of items | 使用虚拟滚动 |
| **不必要的 Shadow DOM** | 简单组件也用 Shadow DOM | 考虑不使用 Shadow DOM |

---

## 延伸阅读

- [Lit Performance](https://lit.dev/docs/tools/performance/)
- [Web Components Performance](https://web.dev/custom-elements-v1/)
