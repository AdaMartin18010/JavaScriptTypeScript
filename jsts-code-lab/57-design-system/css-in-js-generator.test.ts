import { describe, it, expect } from 'vitest';
import { CSSGenerator, CSSInJSGenerator, AtomicCSSGenerator } from './css-in-js-generator.js';

describe('CSSGenerator', () => {
  it('converts camelCase to kebab-case', () => {
    expect(CSSGenerator.camelToKebab('backgroundColor')).toBe('background-color');
    expect(CSSGenerator.camelToKebab('borderRadius')).toBe('border-radius');
    expect(CSSGenerator.camelToKebab('color')).toBe('color');
  });

  it('generates CSS property string', () => {
    expect(CSSGenerator.property('color', 'red')).toBe('  color: red;');
    expect(CSSGenerator.property('margin', 0)).toBe('  margin: 0px;');
  });

  it('stringifies style object to CSS', () => {
    const css = CSSGenerator.stringify({
      '.btn': { padding: '8px', color: 'white' }
    });
    expect(css).toContain('.btn {');
    expect(css).toContain('padding: 8px;');
    expect(css).toContain('color: white;');
  });

  it('handles nested pseudo-selectors', () => {
    const css = CSSGenerator.stringify({
      '.btn': {
        color: 'blue',
        '&:hover': { color: 'red' }
      }
    });
    expect(css).toContain('.btn:hover {');
    expect(css).toContain('color: red;');
  });

  it('generates keyframes', () => {
    const kf = CSSGenerator.keyframes('fadeIn', {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 }
    });
    expect(kf).toContain('@keyframes fadeIn');
    expect(kf).toContain('0%');
    expect(kf).toContain('opacity: 0;');
    expect(kf).toContain('100%');
    expect(kf).toContain('opacity: 1;');
  });
});

describe('CSSInJSGenerator', () => {
  it('creates interactive styles with pseudo states', () => {
    const styles = CSSInJSGenerator.createInteractiveStyles(
      { padding: '8px' },
      { hover: { color: 'red' } }
    );
    expect(styles.padding).toBe('8px');
    expect(styles['&:hover']).toEqual({ color: 'red' });
  });

  it('creates responsive styles', () => {
    const styles = CSSInJSGenerator.createResponsiveStyles(
      { fontSize: '14px' },
      { '768px': { fontSize: '16px' } }
    );
    expect(styles.fontSize).toBe('14px');
    expect(styles['@media (min-width: 768px)']).toEqual({ fontSize: '16px' });
  });

  it('merges multiple style objects', () => {
    const merged = CSSInJSGenerator.merge(
      { color: 'red' },
      { backgroundColor: 'blue' },
      { color: 'green' }
    );
    expect(merged.color).toBe('green');
    expect(merged.backgroundColor).toBe('blue');
  });

  it('maps tokens to CSS properties', () => {
    const tokens = { primary: '#3b82f6', spacingMd: '16px' };
    const styles = CSSInJSGenerator.tokenStyle(tokens, {
      color: 'primary',
      padding: 'spacingMd'
    });
    expect(styles.color).toBe('#3b82f6');
    expect(styles.padding).toBe('16px');
  });
});

describe('AtomicCSSGenerator', () => {
  it('registers and generates utilities', () => {
    const gen = new AtomicCSSGenerator();
    gen.register('p-4', { padding: '16px' });
    gen.register('m-2', { margin: '8px' });
    const css = gen.generate(['p-4', 'm-2']);
    expect(css).toContain('.p-4');
    expect(css).toContain('padding: 16px;');
    expect(css).toContain('.m-2');
    expect(css).toContain('margin: 8px;');
  });

  it('generates spacing utilities', () => {
    const utilities = AtomicCSSGenerator.generateSpacingUtilities('p', 'padding', {
      '1': '4px',
      '2': '8px'
    });
    expect(utilities['p-1']).toEqual({ padding: '4px' });
    expect(utilities['p-2']).toEqual({ padding: '8px' });
  });
});
