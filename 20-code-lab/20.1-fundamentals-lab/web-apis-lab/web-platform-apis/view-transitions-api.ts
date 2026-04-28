/**
 * # View Transitions API 实践
 *
 * View Transitions API 让页面/元素之间的切换拥有平滑动画，
 * 无需复杂的 CSS 动画库或 JavaScript 动画代码。
 *
 * ## 浏览器支持
 * - Chrome: 111+ (2023.3)
 * - Firefox: 128+ (2024.7)
 * - Safari: 18+ (2024.9)
 * - Baseline: 2025 ✅
 *
 * ## 两种模式
 * 1. **同一文档 View Transitions**：SPA 内页面/状态切换
 * 2. **跨文档 View Transitions**：MPA（多页应用）页面间切换
 */

// ============================================
// 同一文档 View Transitions
// ============================================

/**
 * 触发同一文档内的 View Transition。
 *
 * @example
 * // 切换图片视图
 * transitionView(() => {
 *   thumbnailView.style.display = 'none';
 *   detailView.style.display = 'block';
 * });
 */
export async function transitionView(
  updateCallback: () => void,
  options?: {
    types?: string[]; // View Transition 类型（如 ["slide", "fade"]）
  }
): Promise<ViewTransition | undefined> {
  if (!document.startViewTransition) {
    // 不支持时直接执行更新
    updateCallback();
    return undefined;
  }

  const transition = document.startViewTransition(updateCallback);

  if (options?.types) {
    // Chrome 126+ 支持类型
    (transition as any).types = options.types;
  }

  await transition.updateCallbackDone;
  return transition;
}

// ============================================
// 跨文档 View Transitions (MPA)
// ============================================

/**
 * 启用跨文档 View Transitions。
 * 在 MPA 中，页面跳转时自动应用过渡动画。
 *
 * 使用方式：
 * ```css
 * @view-transition {
 *   navigation: auto;
 * }
 * ```
 */
export function enableCrossDocumentViewTransitions(): void {
  // 通过注入 style 标签启用
  const style = document.createElement("style");
  style.textContent = `
    @view-transition {
      navigation: auto;
    }
  `;
  document.head.appendChild(style);
}

// ============================================
// View Transition 命名与捕获
// ============================================

/**
 * 为元素添加 View Transition 名称，使其在过渡中被捕获和动画。
 *
 * CSS 方式：
 * ```css
 * .thumbnail {
 *   view-transition-name: product-image;
 * }
 * .detail-image {
 *   view-transition-name: product-image;
 * }
 * ```
 *
 * 当两个元素共享相同的 view-transition-name 时，
 * 浏览器会自动计算它们的位置差异并生成过渡动画。
 */
export function setViewTransitionName(
  element: HTMLElement,
  name: string
): void {
  element.style.viewTransitionName = name;
}

/**
 * 清除 View Transition 名称。
 */
export function clearViewTransitionName(element: HTMLElement): void {
  element.style.viewTransitionName = "none";
}

// ============================================
// 自定义 View Transition 动画
// ============================================

/**
 * 创建自定义的 View Transition 动画 CSS。
 *
 * 浏览器自动生成的伪元素结构：
 * ```
 * ::view-transition
 *   └── ::view-transition-group(root)
 *       ├── ::view-transition-image-pair(root)
 *       │   ├── ::view-transition-old(root)
 *       │   └── ::view-transition-new(root)
 *       └── ::view-transition-group(product-image)
 *           └── ::view-transition-image-pair(product-image)
 *               ├── ::view-transition-old(product-image)
 *               └── ::view-transition-new(product-image)
 * ```
 */
export function injectViewTransitionStyles(
  customAnimations: Record<string, string>
): HTMLStyleElement {
  const style = document.createElement("style");

  let css = "";
  for (const [name, animation] of Object.entries(customAnimations)) {
    css += `
      ::view-transition-old(${name}),
      ::view-transition-new(${name}) {
        ${animation}
      }
    `;
  }

  style.textContent = css;
  document.head.appendChild(style);
  return style;
}

/**
 * 预设动画样式。
 */
export const viewTransitionPresets = {
  /** 淡入淡出 */
  fade: `
    animation: fade 0.3s ease;
    @keyframes fade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,

  /** 缩放 */
  zoom: `
    animation: zoom 0.3s ease;
    @keyframes zoom {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,

  /** 滑动 */
  slide: `
    animation: slide 0.3s ease;
    @keyframes slide {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `,

  /** 翻转 */
  flip: `
    animation: flip 0.4s ease;
    @keyframes flip {
      from { transform: rotateY(90deg); opacity: 0; }
      to { transform: rotateY(0); opacity: 1; }
    }
  `,
} as const;

// ============================================
// 实用模式：列表项过渡
// ============================================

/**
 * 为列表项添加 View Transition，实现添加/删除/排序动画。
 *
 * @example
 * const listManager = createListViewTransition('todo-list');
 * listManager.addItem('新任务', (container) => {
 *   const li = document.createElement('li');
 *   li.textContent = '新任务';
 *   container.appendChild(li);
 * });
 */
export function createListViewTransition(listId: string): {
  addItem: (name: string, renderFn: (container: HTMLElement) => void) => Promise<void>;
  removeItem: (element: HTMLElement) => Promise<void>;
} {
  const container = document.getElementById(listId);
  if (!container) {
    throw new Error(`List container #${listId} not found`);
  }

  let itemCounter = 0;

  return {
    async addItem(name: string, renderFn: (container: HTMLElement) => void) {
      const itemName = `${listId}-item-${++itemCounter}`;

      await transitionView(() => {
        renderFn(container);
        // 为新添加的元素设置 view-transition-name
        const newElement = container.lastElementChild as HTMLElement;
        if (newElement) {
          setViewTransitionName(newElement, itemName);
        }
      });
    },

    async removeItem(element: HTMLElement) {
      const name = element.style.viewTransitionName || `${listId}-item-${++itemCounter}`;
      setViewTransitionName(element, name);

      await transitionView(() => {
        element.remove();
      });
    },
  };
}

// ============================================
// 实用模式：图片画廊过渡
// ============================================

/**
 * 实现图片从缩略图到详情视图的平滑过渡（类似 Apple Photos 应用）。
 */
export async function transitionImageGallery(options: {
  thumbnail: HTMLElement;
  detailView: HTMLElement;
  detailImage: HTMLElement;
}): Promise<void> {
  const { thumbnail, detailView, detailImage } = options;

  // 设置相同的 view-transition-name
  const transitionName = `gallery-image-${Date.now()}`;
  setViewTransitionName(thumbnail, transitionName);
  setViewTransitionName(detailImage, transitionName);

  await transitionView(() => {
    thumbnail.style.display = "none";
    detailView.style.display = "block";
  });

  // 过渡完成后清理
  clearViewTransitionName(thumbnail);
  clearViewTransitionName(detailImage);
}

// ============================================
// 特性检测
// ============================================

/**
 * 检测浏览器是否支持 View Transitions API。
 */
export function supportsViewTransitions(): boolean {
  return "startViewTransition" in document;
}

/**
 * 检测浏览器是否支持跨文档 View Transitions。
 */
export function supportsCrossDocumentViewTransitions(): boolean {
  return CSS.supports("view-transition-name", "test");
}

// ============================================
// 与路由库的集成
// ============================================

/**
 * React Router / TanStack Router 集成示例。
 *
 * ```tsx
 * // 在路由切换时自动应用 View Transition
 * function ViewTransitionRouter() {
 *   const navigate = useNavigate();
 *
 *   const handleNavigation = (to: string) => {
 *     if (supportsViewTransitions()) {
 *       document.startViewTransition(() => {
 *         navigate(to);
 *       });
 *     } else {
 *       navigate(to);
 *     }
 *   };
 *
 *   return <Link onClick={() => handleNavigation('/about')}>About</Link>;
 * }
 * ```
 */

/**
 * 为导航操作包装 View Transition。
 */
export async function navigateWithTransition(
  navigateFn: () => void
): Promise<void> {
  if (supportsViewTransitions()) {
    const transition = document.startViewTransition(navigateFn);
    await transition.updateCallbackDone;
  } else {
    navigateFn();
  }
}
