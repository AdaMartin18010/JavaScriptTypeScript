/**
 * @file 设计令牌转换器
 * @category Design System → Token Transformer
 * @difficulty medium
 * @tags design-system, tokens, transformer, format-conversion
 *
 * @description
 * 在不同格式之间转换设计令牌（CSS 变量、JSON、SCSS、iOS、Android）
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface TokenValue {
  value: string | number;
  type: 'color' | 'dimension' | 'fontFamily' | 'fontWeight' | 'duration' | 'shadow';
  description?: string;
}

export interface TokenSet {
  [category: string]: {
    [tokenName: string]: TokenValue;
  };
}

export type OutputFormat = 'css' | 'scss' | 'json' | 'android-xml' | 'ios-swift';

// ============================================================================
// 令牌转换器
// ============================================================================

export class DesignTokenTransformer {
  /**
   * 转换为 CSS 自定义属性
   */
  static toCSS(tokens: TokenSet, prefix = 'ds'): string {
    const lines: string[] = [':root {'];

    for (const [category, group] of Object.entries(tokens)) {
      lines.push(`  /* ${category} */`);

      for (const [name, token] of Object.entries(group)) {
        const varName = `--${prefix}-${category}-${this.camelToKebab(name)}`;
        lines.push(`  ${varName}: ${token.value};`);
      }
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * 转换为 SCSS 变量
   */
  static toSCSS(tokens: TokenSet, prefix = 'ds'): string {
    const lines: string[] = [];

    for (const [category, group] of Object.entries(tokens)) {
      lines.push(`// ${category}`);

      for (const [name, token] of Object.entries(group)) {
        const varName = `$${prefix}-${category}-${this.camelToKebab(name)}`;
        lines.push(`${varName}: ${token.value};`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * 转换为扁平 JSON（Style Dictionary 格式）
   */
  static toJSON(tokens: TokenSet): string {
    const flat: Record<string, TokenValue> = {};

    for (const [category, group] of Object.entries(tokens)) {
      for (const [name, token] of Object.entries(group)) {
        flat[`${category}.${name}`] = token;
      }
    }

    return JSON.stringify(flat, null, 2);
  }

  /**
   * 转换为 Android XML 资源
   */
  static toAndroidXML(tokens: TokenSet): string {
    const lines: string[] = ['<?xml version="1.0" encoding="utf-8"?>', '<resources>'];

    for (const [category, group] of Object.entries(tokens)) {
      for (const [name, token] of Object.entries(group)) {
        const resName = `${category}_${this.camelToSnake(name)}`;
        let tag: string;

        switch (token.type) {
          case 'color':
            tag = 'color';
            break;
          case 'dimension':
            tag = 'dimen';
            break;
          case 'fontFamily':
            tag = 'string';
            break;
          default:
            tag = 'string';
        }

        lines.push(`  <${tag} name="${resName}">${token.value}</${tag}>`);
      }
    }

    lines.push('</resources>');
    return lines.join('\n');
  }

  /**
   * 转换为 iOS Swift 常量
   */
  static toIOSSwift(tokens: TokenSet, structName = 'DesignTokens'): string {
    const lines: string[] = [`import UIKit`, '', `enum ${structName} {`];

    for (const [category, group] of Object.entries(tokens)) {
      lines.push(`  // MARK: - ${category}`);

      for (const [name, token] of Object.entries(group)) {
        const constName = this.camelToConstant(name);
        let declaration: string;

        switch (token.type) {
          case 'color':
            declaration = `static let ${constName} = UIColor(named: "${name}")!`;
            break;
          case 'dimension':
            declaration = `static let ${constName}: CGFloat = ${this.parseNumber(token.value)}`;
            break;
          case 'fontFamily':
            declaration = `static let ${constName} = "${token.value}"`;
            break;
          default:
            declaration = `static let ${constName} = "${token.value}"`;
        }

        lines.push(`  ${declaration}`);
      }

      lines.push('');
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * 格式转换入口
   */
  static transform(tokens: TokenSet, format: OutputFormat): string {
    switch (format) {
      case 'css':
        return this.toCSS(tokens);
      case 'scss':
        return this.toSCSS(tokens);
      case 'json':
        return this.toJSON(tokens);
      case 'android-xml':
        return this.toAndroidXML(tokens);
      case 'ios-swift':
        return this.toIOSSwift(tokens);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * 批量转换所有格式
   */
  static transformAll(tokens: TokenSet): Record<OutputFormat, string> {
    return {
      css: this.toCSS(tokens),
      scss: this.toSCSS(tokens),
      json: this.toJSON(tokens),
      'android-xml': this.toAndroidXML(tokens),
      'ios-swift': this.toIOSSwift(tokens)
    };
  }

  private static camelToKebab(str: string): string {
    return str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  private static camelToConstant(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter}`).toUpperCase();
  }

  private static parseNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
}

// ============================================================================
// 令牌归一化
// ============================================================================

export class TokenNormalizer {
  /**
   * 将不同来源的令牌归一化为标准格式
   */
  static normalize(input: Record<string, unknown>): TokenSet {
    const result: TokenSet = {};

    for (const [key, value] of Object.entries(input)) {
      if (typeof value === 'string' || typeof value === 'number') {
        // 简单值
        if (!result.core) result.core = {};
        result.core[key] = { value, type: this.inferType(value) };
      } else if (value && typeof value === 'object') {
        const obj = value as Record<string, unknown>;

        if ('value' in obj) {
          // 已经是 TokenValue 风格
          if (!result.core) result.core = {};
          result.core[key] = {
            value: String(obj.value),
            type: (obj.type as TokenValue['type']) || this.inferType(obj.value)
          };
        } else {
          // 嵌套分类
          result[key] = {};
          for (const [subKey, subValue] of Object.entries(obj)) {
            if (typeof subValue === 'string' || typeof subValue === 'number') {
              result[key][subKey] = { value: subValue, type: this.inferType(subValue) };
            } else if (subValue && typeof subValue === 'object' && 'value' in subValue) {
              const sv = subValue as Record<string, unknown>;
              result[key][subKey] = {
                value: String(sv.value),
                type: (sv.type as TokenValue['type']) || this.inferType(sv.value)
              };
            }
          }
        }
      }
    }

    return result;
  }

  private static inferType(value: unknown): TokenValue['type'] {
    if (typeof value === 'string') {
      if (value.startsWith('#') || value.startsWith('rgb') || /^[a-zA-Z]+$/.test(value)) {
        return 'color';
      }
      if (value.endsWith('px') || value.endsWith('rem') || value.endsWith('em')) {
        return 'dimension';
      }
      if (value.endsWith('ms') || value.endsWith('s')) {
        return 'duration';
      }
      return 'fontFamily';
    }
    if (typeof value === 'number') {
      return 'dimension';
    }
    return 'fontFamily';
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 设计令牌转换器 ===\n');

  const tokens: TokenSet = {
    color: {
      primary: { value: '#3b82f6', type: 'color' },
      secondary: { value: '#64748b', type: 'color' },
      background: { value: '#ffffff', type: 'color' }
    },
    spacing: {
      sm: { value: '8px', type: 'dimension' },
      md: { value: '16px', type: 'dimension' },
      lg: { value: '24px', type: 'dimension' }
    },
    typography: {
      fontFamilyBase: { value: 'system-ui, sans-serif', type: 'fontFamily' },
      fontSizeBase: { value: '16px', type: 'dimension' }
    }
  };

  console.log('--- CSS ---');
  console.log(DesignTokenTransformer.toCSS(tokens));

  console.log('\n--- SCSS ---');
  console.log(DesignTokenTransformer.toSCSS(tokens));

  console.log('\n--- Android XML ---');
  console.log(DesignTokenTransformer.toAndroidXML(tokens));

  console.log('\n--- iOS Swift ---');
  console.log(DesignTokenTransformer.toIOSSwift(tokens));
}
