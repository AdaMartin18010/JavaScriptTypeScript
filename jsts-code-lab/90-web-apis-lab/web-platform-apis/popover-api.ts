/**
 * # Popover API 实践
 *
 * Popover API 是 2025 年 Baseline 的全浏览器原生 API，
 * 用于创建弹出层（tooltip、dropdown、modal、menu），无需 JavaScript 定位逻辑。
 *
 * ## 浏览器支持
 * - Chrome: 114+ (2023.6)
 * - Firefox: 125+ (2024.4)
 * - Safari: 17+ (2023.9)
 * - Baseline: 2025 ✅
 *
 * ## 对现有库的冲击
 * - Tippy.js、Popper.js 的核心场景被替代
 * - Radix UI Popover 的底层实现可以简化为原生 API
 * - 但复杂交互逻辑（键盘导航、焦点管理）仍需 JS 辅助
 */

// ============================================
// 基础 Popover
// ============================================

/**
 * 创建原生 Popover 按钮和内容的辅助函数。
 *
 * HTML 结构要求：
 * ```html
 * <button popovertarget="my-popover">打开</button>
 * <div id="my-popover" popover>内容</div>
 * ```
 */
export function createPopoverButton(
  targetId: string,
  buttonText: string,
  options?: {
    action?: "toggle" | "show" | "hide";
    buttonClass?: string;
  }
): HTMLButtonElement {
  const button = document.createElement("button");
  button.textContent = buttonText;
  button.setAttribute("popovertarget", targetId);
  if (options?.action) {
    button.setAttribute("popovertargetaction", options.action);
  }
  if (options?.buttonClass) {
    button.className = options.buttonClass;
  }
  return button;
}

/**
 * 创建原生 Popover 内容容器。
 */
export function createPopoverContent(
  id: string,
  content: string | HTMLElement,
  options?: {
    popoverType?: "auto" | "manual";
    className?: string;
  }
): HTMLDivElement {
  const div = document.createElement("div");
  div.id = id;
  div.setAttribute("popover", options?.popoverType || "auto");
  if (options?.className) {
    div.className = options.className;
  }

  if (typeof content === "string") {
    div.innerHTML = content;
  } else {
    div.appendChild(content);
  }

  return div;
}

// ============================================
// Popover 类型详解
// ============================================

/**
 * `popover="auto"`（默认）：
 * - 点击外部自动关闭
 * - 同时只能有一个 auto popover 打开（后开的会关闭先开的）
 * - 支持 light dismiss（按 Escape 关闭）
 * - 适合：dropdown、tooltip、普通弹出层
 *
 * `popover="manual"`：
 * - 需要显式调用 showPopover() / hidePopover()
 * - 不自动关闭，可以同时打开多个
 * - 适合：modal dialog、复杂菜单、需要持久显示的弹出层
 */

// ============================================
// 程序化控制
// ============================================

/**
 * Popover 元素的程序化 API。
 */
export interface PopoverElement extends HTMLElement {
  popover: "auto" | "manual" | null;
  showPopover(): void;
  hidePopover(): void;
  togglePopover(force?: boolean): boolean;
}

/**
 * 显示 Popover。
 */
export function showPopover(elementId: string): void {
  const el = document.getElementById(elementId) as PopoverElement | null;
  el?.showPopover();
}

/**
 * 隐藏 Popover。
 */
export function hidePopover(elementId: string): void {
  const el = document.getElementById(elementId) as PopoverElement | null;
  el?.hidePopover();
}

/**
 * 切换 Popover 显示状态。
 */
export function togglePopover(elementId: string): boolean {
  const el = document.getElementById(elementId) as PopoverElement | null;
  return el?.togglePopover() ?? false;
}

// ============================================
// 事件处理
// ============================================

/**
 * Popover 相关事件：
 * - `toggle`：Popover 状态变化时触发
 * - `beforetoggle`：Popover 状态变化前触发（可取消）
 */

export function onPopoverToggle(
  elementId: string,
  callback: (isShowing: boolean) => void
): () => void {
  const el = document.getElementById(elementId);
  if (!el) return () => {};

  const handler = (e: Event) => {
    const toggleEvent = e as ToggleEvent;
    callback(toggleEvent.newState === "open");
  };

  el.addEventListener("toggle", handler);
  return () => el.removeEventListener("toggle", handler);
}

// ============================================
// 组合示例：Dropdown Menu
// ============================================

/**
 * 使用 Popover API + Anchor Positioning 创建下拉菜单。
 *
 * 注意：Anchor Positioning 是独立 API，与 Popover 配合使用效果更佳。
 * 如果浏览器不支持 Anchor Positioning，可使用 CSS `position: absolute` 回退。
 */
export function createDropdownMenu(options: {
  triggerText: string;
  items: Array<{ label: string; onClick: () => void; disabled?: boolean }>;
}): { trigger: HTMLButtonElement; menu: HTMLDivElement } {
  const menuId = `dropdown-${Math.random().toString(36).slice(2)}`;

  // 触发按钮
  const trigger = createPopoverButton(menuId, options.triggerText, {
    action: "toggle",
    buttonClass: "dropdown-trigger",
  });

  // 菜单内容
  const menuContent = document.createElement("ul");
  menuContent.className = "dropdown-menu";
  menuContent.style.listStyle = "none";
  menuContent.style.padding = "0";
  menuContent.style.margin = "0";

  for (const item of options.items) {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.textContent = item.label;
    button.disabled = item.disabled ?? false;
    button.style.display = "block";
    button.style.width = "100%";
    button.style.textAlign = "left";
    button.style.border = "none";
    button.style.background = "transparent";
    button.style.padding = "8px 16px";
    button.style.cursor = item.disabled ? "not-allowed" : "pointer";

    button.addEventListener("click", () => {
      item.onClick();
      // 点击菜单项后自动关闭 popover
      hidePopover(menuId);
    });

    li.appendChild(button);
    menuContent.appendChild(li);
  }

  const menu = createPopoverContent(menuId, menuContent, {
    popoverType: "auto",
    className: "dropdown-popover",
  });

  // 样式：定位（简单版，实际应用应使用 Anchor Positioning）
  menu.style.positionAnchor = `--${menuId}`;
  menu.style.position = "absolute";
  menu.style.margin = "4px 0 0 0";
  menu.style.padding = "4px 0";
  menu.style.background = "white";
  menu.style.border = "1px solid #e5e7eb";
  menu.style.borderRadius = "6px";
  menu.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
  menu.style.minWidth = "160px";

  return { trigger, menu };
}

// ============================================
// 与 React/Vue 等框架的集成
// ============================================

/**
 * 在 React 中使用 Popover API 的自定义 Hook。
 *
 * @example
 * function MyComponent() {
 *   const { ref, show, hide, toggle, isOpen } = usePopover({
 *     id: 'my-popover',
 *     type: 'auto'
 *   });
 *   return (
 *     <>
 *       <button onClick={toggle}>Toggle</button>
 *       <div ref={ref} id="my-popover" popover="auto">
 *         Content
 *       </div>
 *     </>
 *   );
 * }
 */
export function usePopover(options: {
  id: string;
  type?: "auto" | "manual";
}): {
  show: () => void;
  hide: () => void;
  toggle: () => boolean;
  isOpen: boolean;
} {
  const { id, type = "auto" } = options;

  let isOpen = false;

  const show = () => showPopover(id);
  const hide = () => hidePopover(id);
  const toggle = () => togglePopover(id);

  // 监听 toggle 事件更新状态
  if (typeof document !== "undefined") {
    const el = document.getElementById(id);
    el?.addEventListener("toggle", (e) => {
      const event = e as ToggleEvent;
      isOpen = event.newState === "open";
    });
  }

  return { show, hide, toggle, isOpen };
}

// ============================================
// 特性检测
// ============================================

/**
 * 检测浏览器是否支持 Popover API。
 */
export function supportsPopover(): boolean {
  return HTMLElement.prototype.hasOwnProperty("popover");
}

/**
 * 检测浏览器是否支持 ToggleEvent。
 */
export function supportsToggleEvent(): boolean {
  return typeof ToggleEvent !== "undefined";
}
