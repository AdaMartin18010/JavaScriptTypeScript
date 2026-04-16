import { describe, it, expect, vi } from 'vitest';
import { DesignTokenManager } from './design-tokens.js';

describe('DesignTokenManager', () => {
  const tokens = {
    colors: { primary: '#2563eb' },
    spacing: { sm: '8px' },
    typography: {
      fontFamily: { sans: 'sans-serif' },
      fontSize: { base: '16px' },
      fontWeight: { normal: 400 }
    },
    breakpoints: { sm: '640px' }
  };

  it('returns initial tokens', () => {
    const manager = new DesignTokenManager(tokens as any);
    expect(manager.getTokens().colors.primary).toBe('#2563eb');
  });

  it('updates tokens and notifies subscribers', () => {
    const manager = new DesignTokenManager(tokens as any);
    const listener = vi.fn();
    manager.subscribe(listener);
    manager.updateTokens({ colors: { primary: '#ff0000' } });
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ colors: { primary: '#ff0000' } }));
  });

  it('generates CSS variables', () => {
    const manager = new DesignTokenManager(tokens as any);
    const css = manager.generateCSSVariables();
    expect(css).toContain('--color-primary: #2563eb');
    expect(css).toContain('--spacing-sm: 8px');
  });

  it('switches theme to dark', () => {
    const manager = new DesignTokenManager(tokens as any);
    manager.setTheme('dark');
    expect(manager.getTokens().colors.background).toBe('#1a1a1a');
  });
});
