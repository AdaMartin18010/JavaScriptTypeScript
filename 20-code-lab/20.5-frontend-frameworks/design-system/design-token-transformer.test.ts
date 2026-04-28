import { describe, it, expect } from 'vitest';
import { DesignTokenTransformer, TokenNormalizer } from './design-token-transformer.js';

describe('DesignTokenTransformer', () => {
  const tokens = {
    color: {
      primary: { value: '#3b82f6', type: 'color' as const },
      text: { value: '#1a1a1a', type: 'color' as const }
    },
    spacing: {
      md: { value: '16px', type: 'dimension' as const }
    }
  };

  it('transforms to CSS variables', () => {
    const css = DesignTokenTransformer.toCSS(tokens);
    expect(css).toContain(':root {');
    expect(css).toContain('--ds-color-primary: #3b82f6;');
    expect(css).toContain('--ds-spacing-md: 16px;');
  });

  it('transforms to SCSS variables', () => {
    const scss = DesignTokenTransformer.toSCSS(tokens);
    expect(scss).toContain('$ds-color-primary: #3b82f6;');
    expect(scss).toContain('// color');
  });

  it('transforms to JSON', () => {
    const json = DesignTokenTransformer.toJSON(tokens);
    const parsed = JSON.parse(json);
    expect(parsed['color.primary'].value).toBe('#3b82f6');
  });

  it('transforms to Android XML', () => {
    const xml = DesignTokenTransformer.toAndroidXML(tokens);
    expect(xml).toContain('<?xml version="1.0" encoding="utf-8"?>');
    expect(xml).toContain('<color name="color_primary">#3b82f6</color>');
    expect(xml).toContain('<dimen name="spacing_md">16px</dimen>');
  });

  it('transforms to iOS Swift', () => {
    const swift = DesignTokenTransformer.toIOSSwift(tokens);
    expect(swift).toContain('import UIKit');
    expect(swift).toContain('enum DesignTokens {');
    expect(swift).toContain('static let PRIMARY');
  });

  it('transforms all formats at once', () => {
    const all = DesignTokenTransformer.transformAll(tokens);
    expect(Object.keys(all)).toHaveLength(5);
    expect(all.css).toContain(':root');
    expect(all.json).toContain('color.primary');
  });

  it('throws on unsupported format', () => {
    expect(() => DesignTokenTransformer.transform(tokens, 'unknown' as never)).toThrow();
  });
});

describe('TokenNormalizer', () => {
  it('normalizes flat simple values', () => {
    const input = { primary: '#3b82f6', spacing: '16px' };
    const normalized = TokenNormalizer.normalize(input);
    expect(normalized.core?.primary.value).toBe('#3b82f6');
    expect(normalized.core?.spacing.value).toBe('16px');
  });

  it('normalizes nested objects with value/type', () => {
    const input = {
      color: {
        primary: { value: '#3b82f6', type: 'color' }
      }
    };
    const normalized = TokenNormalizer.normalize(input);
    expect(normalized.color?.primary.value).toBe('#3b82f6');
    expect(normalized.color?.primary.type).toBe('color');
  });

  it('infers color type from hex string', () => {
    const input = { primary: '#fff' };
    const normalized = TokenNormalizer.normalize(input);
    expect(normalized.core?.primary.type).toBe('color');
  });

  it('infers dimension type from px string', () => {
    const input = { gap: '8px' };
    const normalized = TokenNormalizer.normalize(input);
    expect(normalized.core?.gap.type).toBe('dimension');
  });
});
