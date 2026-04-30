---
category: frameworks
dimension: 框架生态
sub-dimension: Web 渲染
module: 52-web-rendering
---

# 模块归属声明

本模块归属 **「框架（Frameworks）」** 维度，聚焦 Web 渲染机制、布局系统、动效与交互模型。

## 包含内容

- 智能渲染策略（懒加载、虚拟列表、并发渲染）
- CSS 布局模型（Flexbox、Grid、容器查询）
- 动画与动效模型（CSS Animation、Web Animations API、FLIP）
- 输入处理与事件模型
- 响应式设计模型（移动端适配、断点策略）
- 无障碍（a11y）模型

## 子模块目录结构

| 子模块 | 说明 | 典型文件 |
|--------|------|----------|
| `intelligent-rendering.ts` | 虚拟列表、懒加载、并发渲染调度 | `intelligent-rendering.test.ts` |
| `css-layout-models.ts` | Flexbox / Grid / Container Query 抽象 | `css-layout-models.test.ts` |
| `animations-motion-models.ts` | CSS Animation / WAAPI / FLIP 过渡 | `animations-motion-models.test.ts` |
| `input-handling-models.ts` | 事件委托、手势识别与输入节流 | `input-handling-models.test.ts` |
| `responsive-design-models.ts` | 断点策略、容器查询与流体布局 | `responsive-design-models.test.ts` |
| `accessibility-models.ts` | ARIA 状态机、焦点管理与屏幕阅读器 | `accessibility-models.test.ts` |
| `index.ts` | 模块统一导出 | — |

## 代码示例

### 虚拟列表核心实现

```typescript
// intelligent-rendering.ts
export function useVirtualList<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const scrollTop = useRef(0);
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop.current / itemHeight);
  const endIndex = Math.min(startIndex + visibleCount + 1, items.length);

  const visibleItems = items.slice(startIndex, endIndex).map((item, i) => ({
    item,
    index: startIndex + i,
    style: {
      position: 'absolute',
      top: (startIndex + i) * itemHeight,
      height: itemHeight,
    } as const,
  }));

  return { visibleItems, totalHeight, startIndex, endIndex };
}
```

### FLIP 动画过渡

```typescript
// animations-motion-models.ts
export function flipTransition(
  element: HTMLElement,
  firstRect: DOMRect,
  lastRect: DOMRect
) {
  const deltaX = firstRect.left - lastRect.left;
  const deltaY = firstRect.top - lastRect.top;

  element.animate(
    [
      { transform: `translate(${deltaX}px, ${deltaY}px)` },
      { transform: 'translate(0, 0)' },
    ],
    { duration: 300, easing: 'cubic-bezier(0.2, 0, 0.2, 1)' }
  );
}
```

### 容器查询响应式 Hook

```typescript
// responsive-design-models.ts
export function useContainerQuery(
  ref: React.RefObject<HTMLElement>,
  breakpoints: { name: string; maxWidth: number }[]
) {
  const [active, setActive] = useState<string>(breakpoints[0]?.name ?? '');

  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      const match = breakpoints.find((b) => width <= b.maxWidth);
      setActive(match?.name ?? 'default');
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return active;
}
```

### IntersectionObserver 懒加载图片

```typescript
// lazy-image.ts
export function lazyLoadImages(selector = 'img[data-src]') {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll<HTMLImageElement>(selector).forEach((img) => observer.observe(img));
}
```

### requestAnimationFrame 批处理渲染

```typescript
// raf-batcher.ts
export class RafBatcher {
  private scheduled = false;
  private callbacks = new Set<() => void>();

  add(fn: () => void) {
    this.callbacks.add(fn);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => this.flush());
    }
  }

  private flush() {
    this.scheduled = false;
    const batch = Array.from(this.callbacks);
    this.callbacks.clear();
    batch.forEach((fn) => fn());
  }
}

// 用于高频状态更新场景（滚动、鼠标移动）
export const renderBatcher = new RafBatcher();
```

### CSS Containment 优化渲染边界

```typescript
// css-containment.ts
/**
 * 在组件根节点应用 CSS contain 属性，隔离布局/样式/绘制边界
 * 减少大面积重排/重绘对全局渲染树的影响
 */
export const containStrict = {
  contain: 'strict',
} as const;

export const containLayoutPaint = {
  contain: 'layout paint',
} as const;

// React 用法: <div style={containLayoutPaint}>...</div>
```

### 并发渲染调度器（Time Slicing 概念）

```typescript
// concurrent-scheduler.ts — 模拟 React 18 concurrent 时间切片
export function scheduleConcurrentWork<T>(
  items: T[],
  processor: (item: T) => void,
  options: { chunkSize?: number; yieldMs?: number } = {}
): Promise<void> {
  const { chunkSize = 10, yieldMs = 5 } = options;

  return new Promise((resolve) => {
    let index = 0;

    function workLoop(deadline: IdleDeadline) {
      while (index < items.length && deadline.timeRemaining() > yieldMs) {
        const batchEnd = Math.min(index + chunkSize, items.length);
        for (; index < batchEnd; index++) {
          processor(items[index]);
        }
      }

      if (index < items.length) {
        requestIdleCallback(workLoop);
      } else {
        resolve();
      }
    }

    requestIdleCallback(workLoop);
  });
}

// 可运行示例
const largeDataset = Array.from({ length: 10000 }, (_, i) => i);
scheduleConcurrentWork(largeDataset, (n) => {
  // 处理每一项，不阻塞主线程
  Math.sqrt(n);
}).then(() => console.log('所有项目处理完成'));
```

### 焦点陷阱（Focus Trap）无障碍实现

```typescript
// accessibility-focus-trap.ts — 模态框/对话框焦点管理
export function createFocusTrap(container: HTMLElement) {
  const focusableSelector =
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

  function trap(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    const focusables = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', trap);
  // 自动聚焦第一个可聚焦元素
  const first = container.querySelector<HTMLElement>(focusableSelector);
  first?.focus();

  return () => container.removeEventListener('keydown', trap);
}
```

### CSS Houdini Paint Worklet

```typescript
// houdini-paint.ts — CSS Houdini 自定义绘制（需在单独 JS 文件注册）
// worklet.ts（单独文件，无法直接 import）
/*
class CheckerboardPainter {
  static get inputProperties() { return ['--checkerboard-size', '--checkerboard-color']; }

  paint(ctx: PaintRenderingContext2D, geom: PaintSize, props: StylePropertyMapReadOnly) {
    const size = parseInt(props.get('--checkerboard-size')?.toString() ?? '20');
    const color = props.get('--checkerboard-color')?.toString() ?? 'black';
    for (let y = 0; y < geom.height; y += size) {
      for (let x = 0; x < geom.width; x += size) {
        if ((x / size + y / size) % 2 === 0) {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }
}
registerPaint('checkerboard', CheckerboardPainter);
*/

// 主线程注册
if ('paintWorklet' in CSS) {
  (CSS as any).paintWorklet.addModule('/worklet.js');
}

// CSS 用法: background: paint(checkerboard);
```

## 相关索引

- [30-knowledge-base/30.2-categories/README.md](../../../30-knowledge-base/30.2-categories/README.md)
- [30-knowledge-base/30.2-categories/09-ssr-meta-frameworks.md](../../../30-knowledge-base/30.2-categories/09-ssr-meta-frameworks.md)
- [30-knowledge-base/30.2-categories/10-styling.md](../../../30-knowledge-base/30.2-categories/10-styling.md)

## 学习资源

| 资源 | 类型 | 链接 |
|------|------|------|
| web.dev — Rendering Performance | 指南 | [web.dev/articles/rendering-performance](https://web.dev/articles/rendering-performance) |
| CSS-Tricks — Flexbox Guide | 指南 | [css-tricks.com/snippets/css/a-guide-to-flexbox](https://css-tricks.com/snippets/css/a-guide-to-flexbox) |
| CSS-Tricks — Grid Guide | 指南 | [css-tricks.com/snippets/css/complete-guide-grid](https://css-tricks.com/snippets/css/complete-guide-grid) |
| MDN — Web Animations API | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) |
| WAI-ARIA Authoring Practices | 指南 | [www.w3.org/WAI/ARIA/apg](https://www.w3.org/WAI/ARIA/apg) |
| Container Queries — MDN | 文档 | [developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries) |
| IntersectionObserver — MDN | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) |
| ResizeObserver — MDN | 文档 | [developer.mozilla.org/en-US/docs/Web/API/ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver) |
| CSS Containment Module Level 2 — W3C | 规范 | [www.w3.org/TR/css-contain-2](https://www.w3.org/TR/css-contain-2/) |
| FLIP Your Animations — Paul Lewis | 博客 | [aerotwist.com/blog/flip-your-animations](https://aerotwist.com/blog/flip-your-animations) |
| High Performance Animations — HTML5 Rocks | 指南 | [www.html5rocks.com/en/tutorials/speed/high-performance-animations](https://www.html5rocks.com/en/tutorials/speed/high-performance-animations) |
| Rendering Performance Checklist — web.dev | 清单 | [web.dev/articles/rendering-performance#checklist](https://web.dev/articles/rendering-performance) |
| React Concurrent Mode — React Docs | 文档 | [react.dev/blog/2022/03/29/react-v18](https://react.dev/blog/2022/03/29/react-v18) |
| web.dev — INP (Interaction to Next Paint) | 指南 | [web.dev/articles/inp](https://web.dev/articles/inp) |
| CSS Houdini — Google Developers | 指南 | [developer.chrome.com/docs/css-ui/houdini-intro](https://developer.chrome.com/docs/css-ui/houdini-intro) |
| W3C CSS Houdini Drafts | 规范 | [drafts.css-houdini.org](https://drafts.css-houdini.org/) |
| A11y Project — Checklist | 清单 | [a11yproject.com/checklist](https://www.a11yproject.com/checklist/) |
| Web Content Accessibility Guidelines (WCAG) 2.2 | 规范 | [w3.org/WAI/WCAG22](https://www.w3.org/WAI/WCAG22/) |
| requestIdleCallback — MDN | 文档 | [developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) |
| scheduler package — React GitHub | 源码 | [github.com/facebook/react/tree/main/packages/scheduler](https://github.com/facebook/react/tree/main/packages/scheduler) |

---

*最后更新: 2026-04-29*
