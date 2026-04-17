import { describe, it, expect } from 'vitest';
import { ColorParser, ContrastChecker } from './a11y-color-contrast.js';

describe('ColorParser', () => {
  it('parses 3-char hex colors', () => {
    expect(ColorParser.parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(ColorParser.parseHex('#000')).toEqual({ r: 0, g: 0, b: 0 });
  });

  it('parses 6-char hex colors', () => {
    expect(ColorParser.parseHex('#3b82f6')).toEqual({ r: 59, g: 130, b: 246 });
  });

  it('parses rgb strings', () => {
    expect(ColorParser.parseRGB('rgb(255, 0, 0)')).toEqual({ r: 255, g: 0, b: 0 });
    expect(ColorParser.parseRGB('rgba(0, 0, 255, 0.5)')).toEqual({ r: 0, g: 0, b: 255, a: 0.5 });
  });

  it('parses hsl strings', () => {
    expect(ColorParser.parseHSL('hsl(0, 100%, 50%)')).toEqual({ h: 0, s: 100, l: 50 });
  });

  it('parses named colors', () => {
    expect(ColorParser.parse('black')).toEqual({ r: 0, g: 0, b: 0 });
    expect(ColorParser.parse('white')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('converts hsl to rgb', () => {
    expect(ColorParser.hslToRGB(0, 100, 50)).toEqual({ r: 255, g: 0, b: 0 });
    expect(ColorParser.hslToRGB(120, 100, 50)).toEqual({ r: 0, g: 255, b: 0 });
    expect(ColorParser.hslToRGB(240, 100, 50)).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('converts rgb to hex', () => {
    expect(ColorParser.toHex(255, 0, 0)).toBe('#ff0000');
    expect(ColorParser.toHex(0, 0, 0)).toBe('#000000');
  });
});

describe('ContrastChecker', () => {
  it('calculates black/white contrast as 21', () => {
    expect(ContrastChecker.ratio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('checks WCAG compliance', () => {
    const result = ContrastChecker.check('#000000', '#ffffff');
    expect(result.ratio).toBeCloseTo(21, 1);
    expect(result.passesAA).toBe(true);
    expect(result.passesAAA).toBe(true);
  });

  it('fails low contrast combinations', () => {
    const result = ContrastChecker.check('#cccccc', '#ffffff');
    expect(result.passesAA).toBe(false);
    expect(result.passesAAA).toBe(false);
  });

  it('checks passes helper correctly', () => {
    expect(ContrastChecker.passes('#000000', '#ffffff', 'AA')).toBe(true);
    expect(ContrastChecker.passes('#cccccc', '#ffffff', 'AA')).toBe(false);
  });

  it('finds accessible color from candidates', () => {
    const found = ContrastChecker.findAccessibleColor('#ffffff', ['#cccccc', '#000000']);
    expect(found).toBe('#000000');
  });

  it('returns null when no accessible color found', () => {
    const found = ContrastChecker.findAccessibleColor('#ffffff', ['#eeeeee', '#dddddd']);
    expect(found).toBeNull();
  });

  it('suggests best contrast color', () => {
    expect(ContrastChecker.bestContrast('#ffffff')).toBe('#000000');
    expect(ContrastChecker.bestContrast('#000000')).toBe('#ffffff');
    expect(ContrastChecker.bestContrast('#1a1a1a')).toBe('#ffffff');
  });

  it('audits color pairs', () => {
    const results = ContrastChecker.auditPairs([
      { foreground: '#000000', background: '#ffffff' }
    ]);
    expect(results).toHaveLength(1);
    expect(results[0].passesAA).toBe(true);
  });
});
