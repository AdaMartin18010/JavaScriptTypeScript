/**
 * @file 无障碍颜色对比度检查
 * @category Design System → Accessibility
 * @difficulty medium
 * @tags design-system, a11y, color-contrast, wcag
 *
 * @description
 * 实现 WCAG 2.1 颜色对比度计算与检查工具
 */

// ============================================================================
// 类型定义
// ============================================================================

export interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  passesAALarge: boolean;
  passesAAALarge: boolean;
}

export interface ColorPair {
  foreground: string;
  background: string;
}

export type WCAGLevel = 'AA' | 'AAA';

// ============================================================================
// 颜色解析与转换
// ============================================================================

export class ColorParser {
  /**
   * 将十六进制颜色解析为 RGB 对象
   */
  static parseHex(hex: string): { r: number; g: number; b: number } {
    const clean = hex.replace('#', '');

    if (clean.length === 3) {
      return {
        r: parseInt(clean[0] + clean[0], 16),
        g: parseInt(clean[1] + clean[1], 16),
        b: parseInt(clean[2] + clean[2], 16)
      };
    }

    if (clean.length === 6) {
      return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16)
      };
    }

    throw new Error(`Invalid hex color: ${hex}`);
  }

  /**
   * 解析 RGB/RGBA 字符串
   */
  static parseRGB(rgb: string): { r: number; g: number; b: number; a?: number } {
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (!match) {
      throw new Error(`Invalid RGB color: ${rgb}`);
    }

    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
      a: match[4] ? parseFloat(match[4]) : undefined
    };
  }

  /**
   * 解析 HSL 字符串
   */
  static parseHSL(hsl: string): { h: number; s: number; l: number } {
    const match = hsl.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
    if (!match) {
      throw new Error(`Invalid HSL color: ${hsl}`);
    }

    return {
      h: parseInt(match[1], 10),
      s: parseFloat(match[2]),
      l: parseFloat(match[3])
    };
  }

  /**
   * 通用颜色解析
   */
  static parse(color: string): { r: number; g: number; b: number } {
    color = color.trim().toLowerCase();

    if (color.startsWith('#')) {
      return this.parseHex(color);
    }
    if (color.startsWith('rgb')) {
      return this.parseRGB(color);
    }
    if (color.startsWith('hsl')) {
      const hsl = this.parseHSL(color);
      return this.hslToRGB(hsl.h, hsl.s, hsl.l);
    }

    // 基本颜色名称
    const namedColors: Record<string, string> = {
      black: '#000000', white: '#ffffff', red: '#ff0000',
      green: '#008000', blue: '#0000ff', yellow: '#ffff00',
      cyan: '#00ffff', magenta: '#ff00ff', silver: '#c0c0c0',
      gray: '#808080', grey: '#808080', orange: '#ffa500',
      purple: '#800080', pink: '#ffc0cb'
    };

    const hex = namedColors[color];
    if (hex) {
      return this.parseHex(hex);
    }

    throw new Error(`Unsupported color format: ${color}`);
  }

  /**
   * HSL 转 RGB
   */
  static hslToRGB(h: number, s: number, l: number): { r: number; g: number; b: number } {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0, g = 0, b = 0;

    if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
    else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
    else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
    else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
    else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
    else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255)
    };
  }

  /**
   * RGB 转十六进制
   */
  static toHex(r: number, g: number, b: number): string {
    const toHexChannel = (c: number) => {
      const hex = Math.max(0, Math.min(255, c)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}`;
  }
}

// ============================================================================
// 对比度计算
// ============================================================================

export class ContrastChecker {
  /**
   * 计算相对亮度（WCAG 公式）
   */
  static relativeLuminance(r: number, g: number, b: number): number {
    const normalize = (c: number): number => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };

    return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
  }

  /**
   * 计算两个颜色的对比度比率
   */
  static ratio(color1: string, color2: string): number {
    const rgb1 = ColorParser.parse(color1);
    const rgb2 = ColorParser.parse(color2);

    const lum1 = this.relativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const lum2 = this.relativeLuminance(rgb2.r, rgb2.g, rgb2.b);

    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * 完整对比度检查
   */
  static check(color1: string, color2: string): ContrastResult {
    const r = this.ratio(color1, color2);

    return {
      ratio: Math.round(r * 100) / 100,
      passesAA: r >= 4.5,
      passesAAA: r >= 7,
      passesAALarge: r >= 3,
      passesAAALarge: r >= 4.5
    };
  }

  /**
   * 检查是否通过指定级别
   */
  static passes(color1: string, color2: string, level: WCAGLevel = 'AA', isLargeText = false): boolean {
    const result = this.check(color1, color2);

    if (level === 'AA') {
      return isLargeText ? result.passesAALarge : result.passesAA;
    }

    return isLargeText ? result.passesAAALarge : result.passesAAA;
  }

  /**
   * 在背景色上找到满足对比度要求的前景色调
   */
  static findAccessibleColor(
    background: string,
    candidates: string[],
    level: WCAGLevel = 'AA',
    isLargeText = false
  ): string | null {
    for (const color of candidates) {
      if (this.passes(color, background, level, isLargeText)) {
        return color;
      }
    }
    return null;
  }

  /**
   * 计算最佳对比色（黑或白）
   */
  static bestContrast(background: string): '#000000' | '#ffffff' {
    const rgb = ColorParser.parse(background);
    const luminance = this.relativeLuminance(rgb.r, rgb.g, rgb.b);
    return luminance > 0.179 ? '#000000' : '#ffffff';
  }

  /**
   * 批量检查颜色组合
   */
  static auditPairs(pairs: ColorPair[]): Array<ColorPair & ContrastResult> {
    return pairs.map(pair => ({
      ...pair,
      ...this.check(pair.foreground, pair.background)
    }));
  }
}

// ============================================================================
// 使用示例
// ============================================================================

export function demo(): void {
  console.log('=== 无障碍颜色对比度检查 ===\n');

  // 对比度计算
  console.log('--- 对比度比率 ---');
  console.log('  黑/白:', ContrastChecker.ratio('#000000', '#ffffff').toFixed(2));
  console.log('  蓝/白:', ContrastChecker.ratio('#3b82f6', '#ffffff').toFixed(2));
  console.log('  灰/白:', ContrastChecker.ratio('#9ca3af', '#ffffff').toFixed(2));

  // WCAG 检查
  console.log('\n--- WCAG 检查 ---');
  const check1 = ContrastChecker.check('#3b82f6', '#ffffff');
  console.log('  蓝/白:', JSON.stringify(check1));

  const check2 = ContrastChecker.check('#9ca3af', '#ffffff');
  console.log('  灰/白:', JSON.stringify(check2));

  // 最佳对比色
  console.log('\n--- 最佳对比色 ---');
  ['#3b82f6', '#fbbf24', '#1f2937'].forEach(bg => {
    console.log(`  ${bg} -> ${ContrastChecker.bestContrast(bg)}`);
  });

  // 批量审计
  console.log('\n--- 批量审计 ---');
  const audit = ContrastChecker.auditPairs([
    { foreground: '#000000', background: '#ffffff' },
    { foreground: '#9ca3af', background: '#ffffff' },
    { foreground: '#ffffff', background: '#3b82f6' }
  ]);
  audit.forEach(result => {
    console.log(`  ${result.foreground} on ${result.background}: ratio=${result.ratio}, AA=${result.passesAA}`);
  });
}
