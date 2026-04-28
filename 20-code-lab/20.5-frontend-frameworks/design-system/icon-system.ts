/**
 * @file 图标系统
 * @category Design System → Icons
 * @difficulty medium
 * @tags design-system, icons, svg, sprite
 *
 * @description
 * 图标注册、管理与 SVG 生成系统
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface IconDefinition {
  name: string;
  viewBox: string;
  path: string;
  category?: string;
  keywords?: string[];
}

export interface IconRenderOptions {
  size?: number | string;
  color?: string;
  className?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
}

// ============================================================================
// 图标注册表
// ============================================================================

export class IconRegistry {
  private icons = new Map<string, IconDefinition>();
  private categories = new Map<string, Set<string>>();

  /**
   * 注册图标
   */
  register(icon: IconDefinition): void {
    this.icons.set(icon.name, icon);

    if (icon.category) {
      if (!this.categories.has(icon.category)) {
        this.categories.set(icon.category, new Set());
      }
      this.categories.get(icon.category)!.add(icon.name);
    }
  }

  /**
   * 批量注册
   */
  registerMany(icons: IconDefinition[]): void {
    for (const icon of icons) {
      this.register(icon);
    }
  }

  /**
   * 获取图标定义
   */
  get(name: string): IconDefinition | undefined {
    return this.icons.get(name);
  }

  /**
   * 检查图标是否存在
   */
  has(name: string): boolean {
    return this.icons.has(name);
  }

  /**
   * 搜索图标
   */
  search(query: string): IconDefinition[] {
    const lower = query.toLowerCase();
    const results: IconDefinition[] = [];

    for (const icon of this.icons.values()) {
      if (
        icon.name.toLowerCase().includes(lower) ||
        icon.category?.toLowerCase().includes(lower) ||
        icon.keywords?.some(k => k.toLowerCase().includes(lower))
      ) {
        results.push(icon);
      }
    }

    return results;
  }

  /**
   * 按分类获取图标
   */
  getByCategory(category: string): IconDefinition[] {
    const names = this.categories.get(category);
    if (!names) return [];

    return Array.from(names)
      .map(name => this.icons.get(name))
      .filter((icon): icon is IconDefinition => icon !== undefined);
  }

  /**
   * 获取所有分类
   */
  getCategories(): string[] {
    return Array.from(this.categories.keys());
  }

  /**
   * 获取所有图标名称
   */
  getAllNames(): string[] {
    return Array.from(this.icons.keys());
  }
}

// ============================================================================
// SVG 渲染器
// ============================================================================

export class SVGIconRenderer {
  /**
   * 渲染图标为 SVG 字符串
   */
  static render(icon: IconDefinition, options: IconRenderOptions = {}): string {
    const {
      size = 24,
      color = 'currentColor',
      className = '',
      ariaLabel,
      ariaHidden = false
    } = options;

    const sizeAttr = typeof size === 'number' ? `${size}px` : size;
    const classAttr = className ? ` class="${className}"` : '';
    const ariaLabelAttr = ariaLabel ? ` aria-label="${ariaLabel}"` : '';
    const ariaHiddenAttr = ariaHidden ? ' aria-hidden="true"' : '';

    return `<svg${classAttr} width="${sizeAttr}" height="${sizeAttr}" viewBox="${icon.viewBox}" fill="none" xmlns="http://www.w3.org/2000/svg"${ariaLabelAttr}${ariaHiddenAttr}>\n  <path d="${icon.path}" fill="${color}"/>\n</svg>`;
  }

  /**
   * 生成 SVG Sprite（图标集合）
   */
  static generateSprite(icons: IconDefinition[]): string {
    const symbols = icons.map(icon => {
      return `  <symbol id="icon-${icon.name}" viewBox="${icon.viewBox}">\n    <path d="${icon.path}"/>\n  </symbol>`;
    });

    return `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">\n${symbols.join('\n')}\n</svg>`;
  }

  /**
   * 生成使用 sprite 的图标引用
   */
  static renderSpriteRef(name: string, options: IconRenderOptions = {}): string {
    const {
      size = 24,
      color = 'currentColor',
      className = '',
      ariaLabel
    } = options;

    const sizeAttr = typeof size === 'number' ? `${size}px` : size;
    const classAttr = className ? ` class="${className}"` : '';
    const ariaLabelAttr = ariaLabel ? ` aria-label="${ariaLabel}"` : '';

    return `<svg${classAttr} width="${sizeAttr}" height="${sizeAttr}"${ariaLabelAttr}>\n  <use href="#icon-${name}" fill="${color}"/>\n</svg>`;
  }
}

// ============================================================================
// 预设图标
// ============================================================================

export const presetIcons: IconDefinition[] = [
  {
    name: 'check',
    viewBox: '0 0 24 24',
    path: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    category: 'action',
    keywords: ['confirm', 'done', 'success']
  },
  {
    name: 'close',
    viewBox: '0 0 24 24',
    path: 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    category: 'action',
    keywords: ['x', 'cancel', 'delete']
  },
  {
    name: 'menu',
    viewBox: '0 0 24 24',
    path: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
    category: 'navigation',
    keywords: ['hamburger', 'list', 'drawer']
  },
  {
    name: 'search',
    viewBox: '0 0 24 24',
    path: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
    category: 'action',
    keywords: ['find', 'magnify']
  },
  {
    name: 'arrow-right',
    viewBox: '0 0 24 24',
    path: 'M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z',
    category: 'navigation',
    keywords: ['next', 'forward']
  }
];

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 图标系统 ===\n');

  const registry = new IconRegistry();
  registry.registerMany(presetIcons);

  console.log('--- 注册图标 ---');
  console.log('  总数:', registry.getAllNames().length);
  console.log('  分类:', registry.getCategories().join(', '));

  console.log('\n--- 搜索图标 ---');
  const searchResults = registry.search('nav');
  console.log('  搜索 "nav":', searchResults.map(i => i.name).join(', '));

  console.log('\n--- 渲染 SVG ---');
  const check = registry.get('check');
  if (check) {
    console.log(SVGIconRenderer.render(check, { size: 24, color: '#3b82f6' }));
  }

  console.log('\n--- SVG Sprite ---');
  console.log(SVGIconRenderer.generateSprite(presetIcons.slice(0, 2)));
}
