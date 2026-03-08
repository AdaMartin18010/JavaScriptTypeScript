/**
 * @file 无障碍访问工具
 * @category Accessibility → A11y
 * @difficulty medium
 * @tags accessibility, aria, screen-reader, keyboard, wcag
 * 
 * @description
 * 无障碍访问实现：
 * - ARIA 属性管理
 * - 键盘导航
 * - 屏幕阅读器支持
 * - 焦点管理
 * - 色彩对比度检测
 */

// ============================================================================
// 1. ARIA 属性管理
// ============================================================================

export interface ARIAAttributes {
  role?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
  'aria-expanded'?: boolean | 'true' | 'false';
  'aria-selected'?: boolean | 'true' | 'false';
  'aria-checked'?: boolean | 'true' | 'false' | 'mixed';
  'aria-disabled'?: boolean | 'true' | 'false';
  'aria-readonly'?: boolean | 'true' | 'false';
  'aria-required'?: boolean | 'true' | 'false';
  'aria-invalid'?: boolean | 'true' | 'false' | 'grammar' | 'spelling';
  'aria-pressed'?: boolean | 'true' | 'false' | 'mixed';
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-atomic'?: boolean | 'true' | 'false';
  'aria-relevant'?: string;
  'aria-busy'?: boolean | 'true' | 'false';
  'aria-controls'?: string;
  'aria-owns'?: string;
  'aria-haspopup'?: boolean | 'true' | 'false' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-activedescendant'?: string;
  'aria-valuemin'?: number;
  'aria-valuemax'?: number;
  'aria-valuenow'?: number;
  'aria-valuetext'?: string;
  'aria-orientation'?: 'horizontal' | 'vertical' | 'undefined';
  'aria-level'?: number;
  'aria-posinset'?: number;
  'aria-setsize'?: number;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  'aria-colcount'?: number;
  'aria-colindex'?: number;
  'aria-rowcount'?: number;
  'aria-rowindex'?: number;
  'aria-multiselectable'?: boolean | 'true' | 'false';
  'aria-modal'?: boolean | 'true' | 'false';
  'aria-placeholder'?: string;
  'aria-roledescription'?: string;
  'aria-current'?: boolean | 'true' | 'false' | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-keyshortcuts'?: string;
  'aria-details'?: string;
  'aria-errormessage'?: string;
  'aria-braillelabel'?: string;
  'aria-brailleroledescription'?: string;
}

export class ARIAManager {
  private static instance: ARIAManager;
  private liveRegion: HTMLElement | null = null;

  static getInstance(): ARIAManager {
    if (!ARIAManager.instance) {
      ARIAManager.instance = new ARIAManager();
    }
    return ARIAManager.instance;
  }

  // 创建实时播报区域 (Live Region)
  createLiveRegion(
    priority: 'polite' | 'assertive' = 'polite',
    atomic = false
  ): HTMLElement {
    const region = document.createElement('div');
    region.setAttribute('aria-live', priority);
    region.setAttribute('aria-atomic', atomic ? 'true' : 'false');
    region.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(region);
    this.liveRegion = region;
    return region;
  }

  // 播报消息给屏幕阅读器
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (typeof document === 'undefined') return;
    
    if (!this.liveRegion) {
      this.createLiveRegion(priority);
    }
    
    const region = this.liveRegion!;
    region.setAttribute('aria-live', priority);
    region.textContent = message;
    
    // 清除消息以避免重复
    setTimeout(() => {
      if (region.textContent === message) {
        region.textContent = '';
      }
    }, 1000);
  }

  // 为元素添加 ARIA 属性
  setAttributes(element: HTMLElement, attributes: ARIAAttributes): void {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        element.setAttribute(key, String(value));
      }
    });
  }

  // 移除 ARIA 属性
  removeAttributes(element: HTMLElement, ...attributes: string[]): void {
    attributes.forEach(attr => {
      element.removeAttribute(attr);
    });
  }

  // 获取完整的 ARIA 属性对象
  getAttributes(element: HTMLElement): ARIAAttributes {
    const attrs: ARIAAttributes = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith('aria-') || attr.name === 'role') {
        (attrs as Record<string, string | boolean | number>)[attr.name] = attr.value;
      }
    }
    return attrs;
  }

  // 验证 ARIA 属性
  validateAttributes(element: HTMLElement): string[] {
    const errors: string[] = [];
    const role = element.getAttribute('role');
    
    // 检查必需属性
    if (role === 'slider' && !element.hasAttribute('aria-valuenow')) {
      errors.push('Slider requires aria-valuenow');
    }
    
    if (role === 'checkbox' && !element.hasAttribute('aria-checked')) {
      errors.push('Checkbox requires aria-checked');
    }
    
    // 检查 aria-labelledby 指向的元素是否存在
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy && typeof document !== 'undefined') {
      const labelElement = document.getElementById(labelledBy);
      if (!labelElement) {
        errors.push(`aria-labelledby references non-existent element: ${labelledBy}`);
      }
    }
    
    return errors;
  }
}

// ============================================================================
// 2. 键盘导航
// ============================================================================

export interface KeyboardNavigationOptions {
  selector: string;
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  escapeToClose?: boolean;
}

export class KeyboardNavigator {
  private container: HTMLElement;
  private options: KeyboardNavigationOptions;
  private currentIndex = -1;
  private listeners: Array<{ type: string; handler: EventListener }> = [];

  constructor(container: HTMLElement, options: KeyboardNavigationOptions) {
    this.container = container;
    this.options = {
      loop: true,
      orientation: 'vertical',
      escapeToClose: true,
      ...options
    };
  }

  init(): void {
    this.container.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.container.setAttribute('tabindex', '0');
    
    // 设置 roving tabindex
    const items = this.getFocusableItems();
    items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });
  }

  destroy(): void {
    this.listeners.forEach(({ type, handler }) => {
      this.container.removeEventListener(type, handler);
    });
    this.listeners = [];
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const items = this.getFocusableItems();
    if (items.length === 0) return;

    const { key, shiftKey } = event;
    const { orientation, escapeToClose } = this.options;

    switch (key) {
      case 'ArrowDown':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          this.moveFocus(1, items);
        }
        break;
      case 'ArrowUp':
        if (orientation === 'vertical' || orientation === 'both') {
          event.preventDefault();
          this.moveFocus(-1, items);
        }
        break;
      case 'ArrowRight':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          this.moveFocus(1, items);
        }
        break;
      case 'ArrowLeft':
        if (orientation === 'horizontal' || orientation === 'both') {
          event.preventDefault();
          this.moveFocus(-1, items);
        }
        break;
      case 'Home':
        event.preventDefault();
        this.setFocus(0, items);
        break;
      case 'End':
        event.preventDefault();
        this.setFocus(items.length - 1, items);
        break;
      case 'Tab':
        // 允许 Tab 离开容器
        break;
      case 'Escape':
        if (escapeToClose) {
          event.preventDefault();
          this.container.dispatchEvent(new CustomEvent('nav:close'));
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        const activeElement = items[this.currentIndex];
        if (activeElement) {
          activeElement.click();
        }
        break;
    }
  }

  private moveFocus(direction: number, items: HTMLElement[]): void {
    let newIndex = this.currentIndex + direction;
    
    if (this.options.loop) {
      if (newIndex < 0) newIndex = items.length - 1;
      if (newIndex >= items.length) newIndex = 0;
    } else {
      newIndex = Math.max(0, Math.min(newIndex, items.length - 1));
    }
    
    this.setFocus(newIndex, items);
  }

  private setFocus(index: number, items: HTMLElement[]): void {
    if (index < 0 || index >= items.length) return;
    
    // 更新 tabindex
    items.forEach((item, i) => {
      item.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    
    // 聚焦并滚动到视图
    items[index].focus();
    items[index].scrollIntoView({ block: 'nearest', inline: 'nearest' });
    
    this.currentIndex = index;
    
    // 触发焦点变化事件
    items[index].dispatchEvent(new CustomEvent('nav:focus', { 
      detail: { index, item: items[index] } 
    }));
  }

  private getFocusableItems(): HTMLElement[] {
    return Array.from(this.container.querySelectorAll(this.options.selector));
  }
}

// ============================================================================
// 3. 焦点管理
// ============================================================================

export class FocusManager {
  private focusHistory: HTMLElement[] = [];
  private focusTrapElement: HTMLElement | null = null;
  private focusTrapListeners: Array<() => void> = [];

  // 保存当前焦点
  saveFocus(): HTMLElement | null {
    if (typeof document === 'undefined') return null;
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      this.focusHistory.push(activeElement);
    }
    return activeElement;
  }

  // 恢复上一个焦点
  restoreFocus(): HTMLElement | null {
    const element = this.focusHistory.pop();
    if (element && typeof document !== 'undefined') {
      element.focus();
    }
    return element || null;
  }

  // 创建焦点陷阱 (用于 Modal 等)
  createFocusTrap(element: HTMLElement, options: {
    initialFocus?: HTMLElement;
    returnFocus?: boolean;
    escapeDeactivates?: boolean;
  } = {}): { activate: () => void; deactivate: () => void } {
    const {
      initialFocus,
      returnFocus = true,
      escapeDeactivates = true
    } = options;

    const getFocusableElements = (): HTMLElement[] => {
      const selector = `
        button:not([disabled]),
        [href]:not([disabled]),
        input:not([disabled]),
        select:not([disabled]),
        textarea:not([disabled]),
        [tabindex]:not([tabindex="-1"]):not([disabled]),
        [contenteditable]:not([contenteditable="false"])
      `;
      return Array.from(element.querySelectorAll(selector))
        .filter(el => this.isVisible(el as HTMLElement)) as HTMLElement[];
    };

    const handleTabKey = (event: KeyboardEvent): void => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Tab') {
        handleTabKey(event);
      } else if (event.key === 'Escape' && escapeDeactivates) {
        deactivate();
      }
    };

    const activate = (): void => {
      if (returnFocus) {
        this.saveFocus();
      }
      
      this.focusTrapElement = element;
      element.addEventListener('keydown', handleKeyDown);
      
      // 设置焦点
      const focusTarget = initialFocus || getFocusableElements()[0];
      focusTarget?.focus();
      
      // 设置 aria-modal
      element.setAttribute('aria-modal', 'true');
      if (!element.getAttribute('role')) {
        element.setAttribute('role', 'dialog');
      }
    };

    const deactivate = (): void => {
      element.removeEventListener('keydown', handleKeyDown);
      element.removeAttribute('aria-modal');
      
      if (returnFocus) {
        this.restoreFocus();
      }
      
      this.focusTrapElement = null;
    };

    return { activate, deactivate };
  }

  // 设置页面焦点
  setFocus(element: HTMLElement, options: {
    preventScroll?: boolean;
    focusVisible?: boolean;
  } = {}): void {
    const { preventScroll = false, focusVisible = true } = options;
    
    if (focusVisible) {
      element.classList.add('focus-visible');
    }
    
    element.focus({ preventScroll });
  }

  // 跳过到主要内容
  skipToContent(targetId: string): void {
    if (typeof document === 'undefined') return;
    
    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: false });
      target.removeAttribute('tabindex');
    }
  }

  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  }
}

// ============================================================================
// 4. 色彩对比度检测
// ============================================================================

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export class ContrastChecker {
  // 解析颜色字符串为 RGB
  static parseColor(color: string): RGBColor | null {
    // 处理 hex 颜色
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16)
        };
      }
      if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16)
        };
      }
    }
    
    // 处理 rgb/rgba
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10)
      };
    }
    
    return null;
  }

  // 计算相对亮度
  static getLuminance(color: RGBColor): number {
    const toLinear = (c: number): number => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    
    const r = toLinear(color.r);
    const g = toLinear(color.g);
    const b = toLinear(color.b);
    
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // 计算对比度比率
  static getContrastRatio(color1: string | RGBColor, color2: string | RGBColor): number {
    const c1 = typeof color1 === 'string' ? this.parseColor(color1) : color1;
    const c2 = typeof color2 === 'string' ? this.parseColor(color2) : color2;
    
    if (!c1 || !c2) return 0;
    
    const l1 = this.getLuminance(c1);
    const l2 = this.getLuminance(c2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // 检查 WCAG 合规性
  static checkWCAG(
    foreground: string | RGBColor,
    background: string | RGBColor,
    fontSize = 16,
    isBold = false
  ): {
    ratio: number;
    AA: boolean;
    AAA: boolean;
    AALarge: boolean;
    AAALarge: boolean;
  } {
    const ratio = this.getContrastRatio(foreground, background);
    
    // 判断是否是大文本
    const isLargeText = fontSize >= 18 || (fontSize >= 14 && isBold);
    
    return {
      ratio: Math.round(ratio * 100) / 100,
      AA: ratio >= 4.5,
      AAA: ratio >= 7,
      AALarge: isLargeText ? ratio >= 3 : ratio >= 4.5,
      AAALarge: isLargeText ? ratio >= 4.5 : ratio >= 7
    };
  }

  // 获取建议的颜色
  static suggestColor(
    baseColor: string,
    targetRatio: number,
    direction: 'lighter' | 'darker' = 'lighter'
  ): string | null {
    const color = this.parseColor(baseColor);
    if (!color) return null;
    
    const luminance = this.getLuminance(color);
    const targetLuminance = direction === 'lighter'
      ? (targetRatio * (luminance + 0.05)) - 0.05
      : ((luminance + 0.05) / targetRatio) - 0.05;
    
    // 简化计算，返回近似值
    const factor = Math.pow(targetLuminance / luminance, 1/2.4);
    
    const newColor = {
      r: Math.min(255, Math.round(color.r * factor)),
      g: Math.min(255, Math.round(color.g * factor)),
      b: Math.min(255, Math.round(color.b * factor))
    };
    
    return `#${newColor.r.toString(16).padStart(2, '0')}${newColor.g.toString(16).padStart(2, '0')}${newColor.b.toString(16).padStart(2, '0')}`;
  }
}

// ============================================================================
// 5. 辅助功能工具
// ============================================================================

export class AccessibilityUtils {
  // 检查元素是否可访问
  static isAccessible(element: HTMLElement): { accessible: boolean; issues: string[] } {
    const issues: string[] = [];
    
    // 检查是否有可访问的名称
    const accessibleName = this.getAccessibleName(element);
    if (!accessibleName) {
      issues.push('Element lacks accessible name');
    }
    
    // 检查交互元素
    const isInteractive = element.matches('button, a, input, select, textarea, [tabindex]');
    if (isInteractive) {
      // 检查是否可以聚焦
      if (element.getAttribute('tabindex') === '-1' && !element.hasAttribute('aria-disabled')) {
        issues.push('Interactive element may not be focusable');
      }
      
      // 检查键盘事件
      const hasKeyHandler = element.onkeydown !== null || 
                           element.getAttribute('onkeydown') !== null;
      if (!hasKeyHandler && element.tagName !== 'INPUT' && element.tagName !== 'TEXTAREA') {
        issues.push('Interactive element may lack keyboard support');
      }
    }
    
    // 检查图片
    if (element.tagName === 'IMG') {
      const alt = (element as HTMLImageElement).alt;
      if (!alt && !element.hasAttribute('aria-label')) {
        issues.push('Image lacks alt text');
      }
    }
    
    return {
      accessible: issues.length === 0,
      issues
    };
  }

  // 获取元素的可访问名称
  static getAccessibleName(element: HTMLElement): string {
    // 优先顺序: aria-labelledby > aria-label > 原生标签
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy && typeof document !== 'undefined') {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) {
        return labelElement.textContent || '';
      }
    }
    
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;
    
    // 表单元素的 label
    if (element.id && typeof document !== 'undefined') {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent || '';
    }
    
    // placeholder 作为后备
    const placeholder = (element as HTMLInputElement).placeholder;
    if (placeholder) return placeholder;
    
    // 按钮的文本内容
    if (element.tagName === 'BUTTON') {
      return element.textContent || '';
    }
    
    return '';
  }

  // 生成跳转到内容的链接
  static createSkipLink(targetId: string, label = 'Skip to main content'): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = `#${targetId}`;
    link.textContent = label;
    link.className = 'skip-link';
    link.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      background: #000;
      color: #fff;
      padding: 8px 16px;
      text-decoration: none;
      z-index: 10000;
      transition: top 0.3s;
    `;
    
    link.addEventListener('focus', () => {
      link.style.top = '0';
    });
    
    link.addEventListener('blur', () => {
      link.style.top = '-40px';
    });
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const focusManager = new FocusManager();
      focusManager.skipToContent(targetId);
    });
    
    return link;
  }

  // 批量修复可访问性问题
  static fixAccessibility(container: HTMLElement): { fixed: number; issues: string[] } {
    let fixed = 0;
    const issues: string[] = [];
    
    // 修复图片
    const images = container.querySelectorAll('img:not([alt])');
    images.forEach((img, index) => {
      (img as HTMLImageElement).alt = `Image ${index + 1}`;
      fixed++;
      issues.push(`Added alt text to image ${index + 1}`);
    });
    
    // 修复表单标签
    const inputs = container.querySelectorAll('input:not([id])');
    inputs.forEach((input, index) => {
      const id = `input-${Date.now()}-${index}`;
      input.setAttribute('id', id);
      fixed++;
      issues.push(`Added id to input ${index + 1}`);
    });
    
    // 修复空按钮
    const emptyButtons = container.querySelectorAll('button:empty:not([aria-label])');
    emptyButtons.forEach((btn, index) => {
      btn.setAttribute('aria-label', `Button ${index + 1}`);
      fixed++;
      issues.push(`Added aria-label to empty button ${index + 1}`);
    });
    
    return { fixed, issues };
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 无障碍访问工具 ===\n');

  console.log('1. ARIA 属性管理');
  const ariaManager = ARIAManager.getInstance();
  
  // 模拟播报
  console.log('   Announcing to screen reader:', 'Page loaded successfully');
  
  // 验证属性
  const mockElement = {
    getAttribute: (name: string) => name === 'role' ? 'slider' : null,
    hasAttribute: (name: string) => name === 'role',
    attributes: [{ name: 'role', value: 'slider' }]
  } as unknown as HTMLElement;
  
  const errors = ariaManager.validateAttributes(mockElement);
  console.log('   ARIA validation errors:', errors);

  console.log('\n2. 键盘导航');
  console.log('   Keyboard navigation features:');
  console.log('   - Arrow keys for navigation');
  console.log('   - Home/End for first/last item');
  console.log('   - Enter/Space for activation');
  console.log('   - Escape to close');
  console.log('   - Roving tabindex pattern');

  console.log('\n3. 焦点管理');
  const focusManager = new FocusManager();
  
  console.log('   Focus management features:');
  console.log('   - Save/restore focus');
  console.log('   - Focus trap for modals');
  console.log('   - Skip to content');
  
  // 模拟焦点陷阱
  console.log('   Focus trap created for modal dialog');

  console.log('\n4. 色彩对比度检测');
  const colorChecks = [
    { fg: '#000000', bg: '#FFFFFF', name: 'Black on White' },
    { fg: '#666666', bg: '#FFFFFF', name: 'Gray on White' },
    { fg: '#FFFFFF', bg: '#0000FF', name: 'White on Blue' },
    { fg: '#FF0000', bg: '#00FF00', name: 'Red on Green' }
  ];
  
  colorChecks.forEach(({ fg, bg, name }) => {
    const result = ContrastChecker.checkWCAG(fg, bg);
    console.log(`   ${name}: Ratio ${result.ratio}:1, WCAG AA: ${result.AA ? '✓' : '✗'}`);
  });

  console.log('\n5. 辅助功能检查');
  const mockCheckElement = {
    tagName: 'IMG',
    matches: () => false,
    getAttribute: () => null,
    hasAttribute: () => false,
    onkeydown: null
  } as unknown as HTMLElement;
  
  const check = AccessibilityUtils.isAccessible(mockCheckElement);
  console.log('   Element accessible:', check.accessible);
  console.log('   Issues found:', check.issues.length);

  console.log('\n无障碍访问要点:');
  console.log('- ARIA 属性: 提供语义信息帮助屏幕阅读器');
  console.log('- 键盘导航: 确保所有功能可用键盘操作');
  console.log('- 焦点管理: 提供清晰的焦点指示和合理的焦点顺序');
  console.log('- 对比度: 文本与背景对比度至少 4.5:1');
  console.log('- 可访问名称: 所有交互元素都应有可访问名称');
  console.log('- 跳过链接: 允许键盘用户跳过导航直达内容');
  console.log('- 实时区域: 动态更新内容时通知屏幕阅读器');
}

// ============================================================================
// 导出
// ============================================================================

export type { 
  ARIAAttributes, 
  KeyboardNavigationOptions, 
  RGBColor 
};
