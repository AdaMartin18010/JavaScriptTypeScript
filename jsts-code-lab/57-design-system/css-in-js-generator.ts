/**
 * @file CSS-in-JS 生成器
 * @category Design System → CSS-in-JS
 * @difficulty medium
 * @tags design-system, css-in-js, styling, stylesheet
 *
 * @description
 * 将设计令牌和组件样式转换为 CSS-in-JS 对象或 CSS 字符串
 */

// ============================================================================
// 类型定义
// ============================================================================

export type CSSValue = string | number;

export interface CSSProperties {
  [property: string]: CSSValue | CSSProperties | undefined;
}

export interface StyleRule {
  selector: string;
  properties: CSSProperties;
  nested?: StyleRule[];
}

export interface StyleSheet {
  rules: StyleRule[];
}

// ============================================================================
// CSS 字符串生成器
// ============================================================================

export class CSSGenerator {
  /**
   * 将 camelCase 属性名转换为 kebab-case
   */
  static camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  /**
   * 生成 CSS 属性字符串
   */
  static property(key: string, value: CSSValue): string {
    const propName = this.camelToKebab(key);
    const propValue = typeof value === 'number' && !/^(zIndex|opacity|flex|order|fontWeight)$/.test(key)
      ? `${value}px`
      : String(value);
    return `  ${propName}: ${propValue};`;
  }

  /**
   * 递归生成样式块
   */
  static ruleBlock(selector: string, properties: CSSProperties, indent = 0): string {
    const indentStr = '  '.repeat(indent);
    const lines: string[] = [`${indentStr}${selector} {`];

    const nestedRules: string[] = [];

    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined) continue;

      if (typeof value === 'object' && value !== null) {
        // 嵌套规则（如 &:hover, @media）
        const nestedSelector = key.startsWith('&') ? key : `&${key}`;
        const resolvedSelector = nestedSelector.replace(/&/g, selector);
        nestedRules.push(this.ruleBlock(resolvedSelector, value as CSSProperties, indent));
      } else {
        lines.push(`${indentStr}${this.property(key, value as CSSValue)}`);
      }
    }

    lines.push(`${indentStr}}`);

    if (nestedRules.length > 0) {
      lines.push(...nestedRules);
    }

    return lines.join('\n');
  }

  /**
   * 将 CSS 对象转换为字符串
   */
  static stringify(styles: Record<string, CSSProperties>): string {
    const blocks: string[] = [];

    for (const [selector, properties] of Object.entries(styles)) {
      blocks.push(this.ruleBlock(selector, properties));
    }

    return blocks.join('\n\n');
  }

  /**
   * 生成关键帧动画
   */
  static keyframes(name: string, frames: Record<string, CSSProperties>): string {
    const lines = [`@keyframes ${name} {`];

    for (const [percentage, properties] of Object.entries(frames)) {
      lines.push(`  ${percentage} {`);
      for (const [key, value] of Object.entries(properties)) {
        if (value !== undefined) {
          lines.push(`    ${this.camelToKebab(key)}: ${value};`);
        }
      }
      lines.push('  }');
    }

    lines.push('}');
    return lines.join('\n');
  }
}

// ============================================================================
// CSS-in-JS 对象生成器
// ============================================================================

export class CSSInJSGenerator {
  /**
   * 创建带有 hover、focus 等伪类的样式对象
   */
  static createInteractiveStyles(
    base: CSSProperties,
    states: { hover?: CSSProperties; focus?: CSSProperties; active?: CSSProperties; disabled?: CSSProperties }
  ): CSSProperties {
    return {
      ...base,
      '&:hover': states.hover,
      '&:focus': states.focus,
      '&:active': states.active,
      '&:disabled': states.disabled
    };
  }

  /**
   * 创建响应式样式
   */
  static createResponsiveStyles(
    base: CSSProperties,
    breakpoints: Record<string, CSSProperties>
  ): CSSProperties {
    const result: CSSProperties = { ...base };

    for (const [bp, styles] of Object.entries(breakpoints)) {
      result[`@media (min-width: ${bp})`] = styles;
    }

    return result;
  }

  /**
   * 合并多个样式对象
   */
  static merge(...styles: CSSProperties[]): CSSProperties {
    return styles.reduce((acc, style) => {
      for (const [key, value] of Object.entries(style)) {
        if (value !== undefined) {
          acc[key] = value;
        }
      }
      return acc;
    }, {} as CSSProperties);
  }

  /**
   * 创建 design token 引用样式
   */
  static tokenStyle(
    tokens: Record<string, string | number>,
    mapping: Record<string, string>
  ): CSSProperties {
    const result: CSSProperties = {};

    for (const [cssProp, tokenKey] of Object.entries(mapping)) {
      if (tokens[tokenKey] !== undefined) {
        result[cssProp] = tokens[tokenKey];
      }
    }

    return result;
  }
}

// ============================================================================
// 原子 CSS 生成器
// ============================================================================

export class AtomicCSSGenerator {
  private utilities = new Map<string, string>();

  /**
   * 注册原子类
   */
  register(className: string, properties: CSSProperties): void {
    this.utilities.set(className, CSSGenerator.ruleBlock(`.${className}`, properties));
  }

  /**
   * 生成原子 CSS 字符串
   */
  generate(classes: string[]): string {
    const blocks: string[] = [];

    for (const cls of classes) {
      const block = this.utilities.get(cls);
      if (block) {
        blocks.push(block);
      }
    }

    return blocks.join('\n\n');
  }

  /**
   * 生成常用间距原子类
   */
  static generateSpacingUtilities(
    prefix: string,
    property: string,
    scale: Record<string, string>
  ): Record<string, CSSProperties> {
    const utilities: Record<string, CSSProperties> = {};

    for (const [key, value] of Object.entries(scale)) {
      utilities[`${prefix}-${key}`] = { [property]: value };
    }

    return utilities;
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== CSS-in-JS 生成器 ===\n');

  // 1. 基础样式对象转 CSS
  const buttonStyles = {
    '.btn': {
      padding: '8px 16px',
      borderRadius: '4px',
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      '&:hover': {
        backgroundColor: '#2563eb'
      },
      '&:disabled': {
        opacity: 0.5
      }
    }
  };

  console.log('--- Button Styles ---');
  console.log(CSSGenerator.stringify(buttonStyles));

  // 2. 关键帧
  console.log('\n--- Keyframes ---');
  console.log(
    CSSGenerator.keyframes('fadeIn', {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    })
  );

  // 3. 交互式样式
  console.log('\n--- Interactive Styles ---');
  const interactive = CSSInJSGenerator.createInteractiveStyles(
    { padding: '8px', border: '1px solid #ccc' },
    {
      hover: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
      focus: { outline: '2px solid #3b82f6' }
    }
  );
  console.log(CSSGenerator.ruleBlock('.input', interactive));

  // 4. 响应式样式
  console.log('\n--- Responsive Styles ---');
  const responsive = CSSInJSGenerator.createResponsiveStyles(
    { fontSize: '14px' },
    { '768px': { fontSize: '16px' }, '1024px': { fontSize: '18px' } }
  );
  console.log(CSSGenerator.ruleBlock('.text', responsive));
}
