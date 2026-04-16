// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ARIAManager, KeyboardNavigator, FocusManager, ContrastChecker, AccessibilityUtils } from './a11y-utils';

describe('ARIAManager', () => {
  it('creates live region and announces', () => {
    const aria = ARIAManager.getInstance();
    const region = aria.createLiveRegion('polite');
    expect(region.getAttribute('aria-live')).toBe('polite');
    aria.announce('Page loaded');
    expect(region.textContent).toBe('Page loaded');
  });

  it('sets and validates attributes', () => {
    const aria = ARIAManager.getInstance();
    const el = document.createElement('div');
    aria.setAttributes(el, { role: 'slider', 'aria-valuenow': 5 });
    expect(el.getAttribute('role')).toBe('slider');
    const errors = aria.validateAttributes(el);
    expect(errors.length).toBe(0);
  });
});

describe('KeyboardNavigator', () => {
  it('initializes and handles arrow navigation', () => {
    const container = document.createElement('ul');
    for (let i = 0; i < 3; i++) {
      const li = document.createElement('li');
      container.appendChild(li);
    }
    const nav = new KeyboardNavigator(container, { selector: 'li', loop: true });
    nav.init();
    const items = container.querySelectorAll('li');
    expect(items[0].getAttribute('tabindex')).toBe('0');
    nav.destroy();
  });
});

describe('FocusManager', () => {
  it('saves and restores focus', () => {
    const fm = new FocusManager();
    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
    fm.saveFocus();
    const other = document.createElement('button');
    document.body.appendChild(other);
    other.focus();
    fm.restoreFocus();
    expect(document.activeElement).toBe(input);
  });
});

describe('ContrastChecker', () => {
  it('parses hex and rgb colors', () => {
    expect(ContrastChecker.parseColor('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    expect(ContrastChecker.parseColor('rgb(0, 128, 255)')).toEqual({ r: 0, g: 128, b: 255 });
  });

  it('calculates contrast ratio', () => {
    const ratio = ContrastChecker.getContrastRatio('#000000', '#ffffff');
    expect(ratio).toBeGreaterThan(20);
  });

  it('checks WCAG compliance', () => {
    const result = ContrastChecker.checkWCAG('#000000', '#ffffff');
    expect(result.AA).toBe(true);
    expect(result.AAA).toBe(true);
  });
});

describe('AccessibilityUtils', () => {
  it('checks image accessibility', () => {
    const img = document.createElement('img');
    const check = AccessibilityUtils.isAccessible(img);
    expect(check.accessible).toBe(false);
    expect(check.issues).toContain('Image lacks alt text');
  });

  it('fixes missing alt texts', () => {
    const div = document.createElement('div');
    const img = document.createElement('img');
    div.appendChild(img);
    const result = AccessibilityUtils.fixAccessibility(div);
    expect(result.fixed).toBe(1);
    expect(img.getAttribute('alt')).toBeTruthy();
  });
});
