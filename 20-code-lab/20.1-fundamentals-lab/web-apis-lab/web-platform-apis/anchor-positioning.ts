/**
 * # CSS Anchor Positioning API 实践
 *
 * CSS Anchor Positioning 允许元素相对另一个元素（锚点）自动定位，
 * 无需 JavaScript 计算位置。这消灭了大量 tooltip/dropdown/popover 的 JS 定位代码。
 *
 * ## 浏览器支持
 * - Chrome: 125+ (2024.5)
 * - Firefox: 开发中
 * - Safari: 开发中
 * - Interop 2026 核心目标：预计 2026 年底全浏览器稳定
 *
 * ## 核心概念
 * - **Anchor**：被参照的元素（如按钮）
 * - **Positioned Element**：需要定位的元素（如 tooltip）
 * - **Position Try**：当首选位置放不下时的回退方案
 */

// ============================================
// Anchor Positioning 的 CSS 使用方式
// ============================================

/**
 * 生成 Anchor Positioning 的 CSS 代码。
 *
 * @example
 * // TypeScript 中动态生成样式
 * const styles = generateAnchorStyles({
 *   anchorName: '--tooltip-anchor',
 *   positionedName: '--tooltip',
 *   defaultPosition: 'top',
 *   fallbackPositions: ['bottom', 'right', 'left'],
 *   offset: 8,
 * });
 * styleElement.textContent = styles;
 */
export function generateAnchorStyles(options: {
  /** 锚点元素的名称 */
  anchorName: string;
  /** 定位元素的名称 */
  positionedName: string;
  /** 默认位置 */
  defaultPosition: "top" | "bottom" | "left" | "right";
  /** 回退位置（当默认位置空间不足时） */
  fallbackPositions?: Array<"top" | "bottom" | "left" | "right">;
  /** 锚点与定位元素之间的间距 */
  offset?: number;
}): string {
  const {
    anchorName,
    positionedName,
    defaultPosition,
    fallbackPositions = [],
    offset = 0,
  } = options;

  // 移除开头的 --
  const cleanAnchorName = anchorName.replace(/^--/, "");
  const cleanPositionedName = positionedName.replace(/^--/, "");

  // 位置映射到 CSS inset-area 值
  const positionMap: Record<string, string> = {
    top: "top",
    bottom: "bottom",
    left: "left",
    right: "right",
  };

  // 生成 position-try-fallbacks
  const fallbackNames = fallbackPositions.map(
    (_, i) => `--${cleanPositionedName}-fallback-${i}`
  );

  let css = `
    /* 锚点元素 */
    [style*="anchor-name: ${anchorName}"],
    .${cleanAnchorName}-anchor {
      anchor-name: ${anchorName};
    }

    /* 定位元素 */
    .${cleanPositionedName} {
      position: absolute;
      position-anchor: ${anchorName};
      position-area: ${positionMap[defaultPosition]};
      margin: ${offset}px;
    }
  `;

  // 如果有回退位置，生成 position-try
  if (fallbackPositions.length > 0) {
    // 定义回退方案
    fallbackPositions.forEach((pos, i) => {
      css += `
        @position-try --${cleanPositionedName}-fallback-${i} {
          position-area: ${positionMap[pos]};
        }
      `;
    });

    css += `
      .${cleanPositionedName} {
        position-try-fallbacks: ${fallbackNames.join(", ")};
        position-try-order: most-height;
      }
    `;
  }

  return css;
}

// ============================================
// JavaScript 辅助：动态设置 Anchor
// ============================================

/**
 * 为元素设置 Anchor Positioning 属性。
 */
export function setupAnchorPositioning(options: {
  anchorElement: HTMLElement;
  positionedElement: HTMLElement;
  position?: "top" | "bottom" | "left" | "right";
  offset?: number;
}): void {
  const { anchorElement, positionedElement, position = "top", offset = 8 } = options;

  // 为锚点设置名称
  const anchorName = `--anchor-${Math.random().toString(36).slice(2, 9)}`;
  anchorElement.style.setProperty("anchor-name", anchorName);

  // 为定位元素设置属性
  positionedElement.style.position = "absolute";
  positionedElement.style.setProperty("position-anchor", anchorName);
  positionedElement.style.setProperty("position-area", position);
  positionedElement.style.margin = `${offset}px`;
}

/**
 * 创建 Tooltip 并自动设置 Anchor Positioning。
 */
export function createAnchoredTooltip(options: {
  anchorElement: HTMLElement;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}): HTMLDivElement {
  const { anchorElement, content, position = "top", className = "anchored-tooltip" } = options;

  const tooltip = document.createElement("div");
  tooltip.className = className;
  tooltip.textContent = content;
  tooltip.style.cssText = `
    position: absolute;
    padding: 8px 12px;
    background: #1f2937;
    color: white;
    border-radius: 6px;
    font-size: 14px;
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none;
  `;

  // 使用 Popover API（如果支持）+ Anchor Positioning
  if ("popover" in HTMLElement.prototype) {
    tooltip.setAttribute("popover", "auto");
  }

  document.body.appendChild(tooltip);
  setupAnchorPositioning({
    anchorElement,
    positionedElement: tooltip,
    position,
    offset: 8,
  });

  return tooltip;
}

// ============================================
// 回退方案：JavaScript 定位（不支持 Anchor Positioning 的浏览器）
// ============================================

/**
 * 使用 JavaScript 计算定位（作为 Anchor Positioning 的回退）。
 */
export function positionElementFallback(options: {
  anchorElement: HTMLElement;
  positionedElement: HTMLElement;
  position?: "top" | "bottom" | "left" | "right";
  offset?: number;
  boundaryElement?: HTMLElement;
}): void {
  const {
    anchorElement,
    positionedElement,
    position = "top",
    offset = 8,
    boundaryElement = document.body,
  } = options;

  const anchorRect = anchorElement.getBoundingClientRect();
  const positionedRect = positionedElement.getBoundingClientRect();
  const boundaryRect = boundaryElement.getBoundingClientRect();

  let top = 0;
  let left = 0;

  switch (position) {
    case "top":
      top = anchorRect.top - positionedRect.height - offset;
      left = anchorRect.left + (anchorRect.width - positionedRect.width) / 2;
      break;
    case "bottom":
      top = anchorRect.bottom + offset;
      left = anchorRect.left + (anchorRect.width - positionedRect.width) / 2;
      break;
    case "left":
      top = anchorRect.top + (anchorRect.height - positionedRect.height) / 2;
      left = anchorRect.left - positionedRect.width - offset;
      break;
    case "right":
      top = anchorRect.top + (anchorRect.height - positionedRect.height) / 2;
      left = anchorRect.right + offset;
      break;
  }

  // 边界检查
  if (left < boundaryRect.left) {
    left = boundaryRect.left + offset;
  }
  if (left + positionedRect.width > boundaryRect.right) {
    left = boundaryRect.right - positionedRect.width - offset;
  }
  if (top < boundaryRect.top) {
    top = boundaryRect.top + offset;
  }
  if (top + positionedRect.height > boundaryRect.bottom) {
    top = boundaryRect.bottom - positionedRect.height - offset;
  }

  positionedElement.style.position = "fixed";
  positionedElement.style.top = `${top}px`;
  positionedElement.style.left = `${left}px`;
}

// ============================================
// 检测与自动回退
// ============================================

/**
 * 检测浏览器是否支持 CSS Anchor Positioning。
 */
export function supportsAnchorPositioning(): boolean {
  return CSS.supports("anchor-name", "--test");
}

/**
 * 智能定位：优先使用 Anchor Positioning，不支持时使用 JS 回退。
 */
export function smartPosition(options: {
  anchorElement: HTMLElement;
  positionedElement: HTMLElement;
  position?: "top" | "bottom" | "left" | "right";
  offset?: number;
}): void {
  if (supportsAnchorPositioning()) {
    setupAnchorPositioning(options);
  } else {
    positionElementFallback(options);
  }
}

// ============================================
// Popover + Anchor Positioning 组合
// ============================================

/**
 * Popover API 和 Anchor Positioning 是天生的一对：
 * - Popover 负责「显示/隐藏」行为
 * - Anchor Positioning 负责「位置计算」
 *
 * 这种组合可以消灭 90% 的 tooltip/dropdown JS 库。
 */
export function createPopoverWithAnchor(options: {
  triggerElement: HTMLElement;
  popoverContent: HTMLElement | string;
  position?: "top" | "bottom" | "left" | "right";
  popoverId?: string;
}): { trigger: HTMLButtonElement; popover: HTMLDivElement } {
  const { triggerElement, popoverContent, position = "bottom", popoverId = `popover-${Date.now()}` } = options;

  // 创建触发按钮
  const trigger = document.createElement("button");
  trigger.textContent = triggerElement.textContent || "Open";
  trigger.setAttribute("popovertarget", popoverId);
  trigger.setAttribute("popovertargetaction", "toggle");

  // 创建 Popover 内容
  const popover = document.createElement("div");
  popover.id = popoverId;
  popover.setAttribute("popover", "auto");

  if (typeof popoverContent === "string") {
    popover.innerHTML = popoverContent;
  } else {
    popover.appendChild(popoverContent);
  }

  // 设置 Anchor Positioning
  if (supportsAnchorPositioning()) {
    trigger.style.setProperty("anchor-name", `--${popoverId}-anchor`);
    popover.style.position = "absolute";
    popover.style.setProperty("position-anchor", `--${popoverId}-anchor`);
    popover.style.setProperty("position-area", position);
    popover.style.margin = "8px";
  }

  return { trigger, popover };
}

// ============================================
// 预设 CSS
// ============================================

/**
 * Anchor Positioning 的常用预设样式。
 */
export const anchorPositioningPresets = {
  /** Tooltip 样式 */
  tooltip: `
    .tooltip {
      position: absolute;
      padding: 8px 12px;
      background: #1f2937;
      color: white;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
    }
  `,

  /** Dropdown 样式 */
  dropdown: `
    .dropdown {
      position: absolute;
      min-width: 200px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 1000;
    }
  `,

  /** 箭头指示器 */
  arrow: `
    .anchored-with-arrow::before {
      content: '';
      position: absolute;
      width: 8px;
      height: 8px;
      background: inherit;
      transform: rotate(45deg);
    }
    .anchored-with-arrow[position-area="top"]::before {
      bottom: -4px;
      left: 50%;
      margin-left: -4px;
    }
    .anchored-with-arrow[position-area="bottom"]::before {
      top: -4px;
      left: 50%;
      margin-left: -4px;
    }
  `,
} as const;
