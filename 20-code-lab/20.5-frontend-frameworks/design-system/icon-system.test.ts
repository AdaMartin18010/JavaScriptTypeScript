import { describe, it, expect } from 'vitest';
import { IconRegistry, SVGIconRenderer, presetIcons } from './icon-system.js';

describe('IconRegistry', () => {
  it('registers and retrieves icons', () => {
    const registry = new IconRegistry();
    registry.register({ name: 'test', viewBox: '0 0 24 24', path: 'M0 0' });
    expect(registry.get('test')).toBeDefined();
    expect(registry.get('test')?.viewBox).toBe('0 0 24 24');
  });

  it('registers many icons at once', () => {
    const registry = new IconRegistry();
    registry.registerMany(presetIcons);
    expect(registry.getAllNames().length).toBe(presetIcons.length);
  });

  it('checks icon existence', () => {
    const registry = new IconRegistry();
    registry.registerMany(presetIcons);
    expect(registry.has('check')).toBe(true);
    expect(registry.has('nonexistent')).toBe(false);
  });

  it('searches icons by name', () => {
    const registry = new IconRegistry();
    registry.registerMany(presetIcons);
    const results = registry.search('check');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].name).toBe('check');
  });

  it('searches icons by keyword', () => {
    const registry = new IconRegistry();
    registry.registerMany(presetIcons);
    const results = registry.search('success');
    expect(results.map(r => r.name)).toContain('check');
  });

  it('gets icons by category', () => {
    const registry = new IconRegistry();
    registry.registerMany(presetIcons);
    const actions = registry.getByCategory('action');
    expect(actions.length).toBeGreaterThan(0);
    expect(actions.every(i => i.category === 'action')).toBe(true);
  });

  it('returns categories list', () => {
    const registry = new IconRegistry();
    registry.registerMany(presetIcons);
    expect(registry.getCategories()).toContain('action');
    expect(registry.getCategories()).toContain('navigation');
  });
});

describe('SVGIconRenderer', () => {
  it('renders icon as SVG string', () => {
    const icon = presetIcons[0];
    const svg = SVGIconRenderer.render(icon, { size: 32, color: 'red' });
    expect(svg).toContain('<svg');
    expect(svg).toContain('width="32px"');
    expect(svg).toContain('fill="red"');
    expect(svg).toContain(icon.path);
  });

  it('includes aria attributes when provided', () => {
    const icon = presetIcons[0];
    const svg = SVGIconRenderer.render(icon, { ariaLabel: 'Checkmark' });
    expect(svg).toContain('aria-label="Checkmark"');
  });

  it('generates SVG sprite', () => {
    const sprite = SVGIconRenderer.generateSprite(presetIcons.slice(0, 2));
    expect(sprite).toContain('<svg');
    expect(sprite).toContain('<symbol');
    expect(sprite).toContain('id="icon-check"');
    expect(sprite).toContain('id="icon-close"');
  });

  it('renders sprite reference', () => {
    const ref = SVGIconRenderer.renderSpriteRef('check', { size: 24 });
    expect(ref).toContain('<use href="#icon-check"');
    expect(ref).toContain('width="24px"');
  });
});
