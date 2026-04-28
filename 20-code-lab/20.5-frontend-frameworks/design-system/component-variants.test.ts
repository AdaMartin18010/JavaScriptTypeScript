import { describe, it, expect } from 'vitest';
import { ComponentVariantGenerator, StyleComposer, buttonVariants } from './component-variants.js';

describe('ComponentVariantGenerator', () => {
  it('generates base class without props', () => {
    const cva = new ComponentVariantGenerator({
      base: 'base-class',
      variants: { size: { sm: 'small', lg: 'large' } },
      defaultVariants: { size: 'sm' }
    });
    expect(cva.generate()).toContain('base-class');
    expect(cva.generate()).toContain('small');
  });

  it('applies specified variants over defaults', () => {
    const cva = new ComponentVariantGenerator({
      base: 'btn',
      variants: { size: { sm: 'small', lg: 'large' } },
      defaultVariants: { size: 'sm' }
    });
    expect(cva.generate({ size: 'lg' })).toContain('large');
    expect(cva.generate({ size: 'lg' })).not.toContain('small');
  });

  it('applies compound variants when criteria match', () => {
    const cva = new ComponentVariantGenerator({
      base: 'btn',
      variants: {
        color: { red: 'red-class', blue: 'blue-class' },
        size: { sm: 'sm-class', lg: 'lg-class' }
      },
      compoundVariants: [
        { criteria: { color: 'red', size: 'lg' }, className: 'compound-class' }
      ]
    });
    const result = cva.generate({ color: 'red', size: 'lg' });
    expect(result).toContain('compound-class');
  });

  it('does not apply compound variants when criteria do not match', () => {
    const cva = new ComponentVariantGenerator({
      base: 'btn',
      variants: {
        color: { red: 'red-class', blue: 'blue-class' },
        size: { sm: 'sm-class', lg: 'lg-class' }
      },
      compoundVariants: [
        { criteria: { color: 'red', size: 'lg' }, className: 'compound-class' }
      ]
    });
    const result = cva.generate({ color: 'blue', size: 'lg' });
    expect(result).not.toContain('compound-class');
  });

  it('returns all combinations', () => {
    const cva = new ComponentVariantGenerator({
      base: 'btn',
      variants: {
        size: { sm: 'sm', lg: 'lg' },
        color: { red: 'red', blue: 'blue' }
      }
    });
    const combos = cva.getCombinations();
    expect(combos.length).toBe(4);
  });

  it('returns default variants', () => {
    const cva = new ComponentVariantGenerator({
      variants: { size: { sm: 'sm', lg: 'lg' } },
      defaultVariants: { size: 'sm' }
    });
    expect(cva.getDefaults()).toEqual({ size: 'sm' });
  });

  it('returns variant options', () => {
    const cva = new ComponentVariantGenerator({
      variants: { size: { sm: 'sm', lg: 'lg' } }
    });
    expect(cva.getVariantOptions('size')).toEqual(['sm', 'lg']);
  });
});

describe('StyleComposer', () => {
  it('composes and deduplicates classes', () => {
    expect(StyleComposer.compose('a b', 'b c')).toBe('a b c');
  });

  it('filters out falsy values', () => {
    expect(StyleComposer.compose('a', undefined, false, 'b')).toBe('a b');
  });

  it('generates conditional classes', () => {
    const result = StyleComposer.conditional({ active: true, disabled: false });
    expect(result).toBe('active');
    expect(result).not.toContain('disabled');
  });

  it('generates inline style string', () => {
    const style = StyleComposer.inlineStyle({ color: 'red', fontSize: 14, margin: undefined });
    expect(style).toContain('color: red');
    expect(style).toContain('font-size: 14');
    expect(style).not.toContain('margin');
  });
});

describe('buttonVariants preset', () => {
  it('generates default button classes', () => {
    const classes = buttonVariants.generate();
    expect(classes).toContain('inline-flex');
    expect(classes).toContain('bg-blue-600');
  });

  it('generates outline variant', () => {
    const classes = buttonVariants.generate({ variant: 'outline' });
    expect(classes).toContain('border-2');
    expect(classes).not.toContain('bg-blue-600');
  });

  it('generates disabled state', () => {
    const classes = buttonVariants.generate({ disabled: true });
    expect(classes).toContain('opacity-50');
    expect(classes).toContain('cursor-not-allowed');
  });

  it('applies compound variant for solid+lg', () => {
    const classes = buttonVariants.generate({ variant: 'solid', size: 'lg' });
    expect(classes).toContain('shadow-lg');
  });
});
