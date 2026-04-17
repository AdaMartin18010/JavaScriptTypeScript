import { describe, it, expect } from 'vitest';
import { BreakpointManager, defaultBreakpoints, ContainerQueryBuilder } from './responsive-breakpoints.js';

describe('BreakpointManager', () => {
  it('registers and retrieves breakpoints', () => {
    const manager = new BreakpointManager();
    manager.register({ name: 'tablet', minWidth: 768, unit: 'px' });
    expect(manager.get('tablet')?.minWidth).toBe(768);
  });

  it('generates min-width media query', () => {
    const manager = new BreakpointManager(defaultBreakpoints);
    const query = manager.generateMediaQuery('md');
    expect(query).toBe('@media screen and (min-width: 768px)');
  });

  it('generates range media query', () => {
    const manager = new BreakpointManager(defaultBreakpoints);
    const query = manager.generateRangeQuery('sm', 'md');
    expect(query).toContain('(min-width: 640px)');
    expect(query).toContain('(max-width: 767px)');
  });

  it('matches breakpoint by width', () => {
    const manager = new BreakpointManager(defaultBreakpoints);
    expect(manager.matchBreakpoint(400)).toBeNull();
    expect(manager.matchBreakpoint(700)).toBe('sm');
    expect(manager.matchBreakpoint(1200)).toBe('lg');
    expect(manager.matchBreakpoint(1600)).toBe('2xl');
  });

  it('resolves responsive values correctly', () => {
    const manager = new BreakpointManager(defaultBreakpoints);
    const value = { base: 'small', sm: 'medium', lg: 'large' };
    expect(manager.resolveValue(400, value)).toBe('small');
    expect(manager.resolveValue(800, value)).toBe('medium');
    expect(manager.resolveValue(1200, value)).toBe('large');
  });

  it('returns all breakpoint names', () => {
    const manager = new BreakpointManager(defaultBreakpoints);
    expect(manager.getNames()).toEqual(['sm', 'md', 'lg', 'xl', '2xl']);
  });
});

describe('ContainerQueryBuilder', () => {
  it('builds container query with multiple conditions', () => {
    const builder = new ContainerQueryBuilder();
    const query = builder.minWidth(300).maxWidth(800).build('card');
    expect(query).toContain('@container card');
    expect(query).toContain('(min-width: 300px)');
    expect(query).toContain('(max-width: 800px)');
  });

  it('supports orientation condition', () => {
    const builder = new ContainerQueryBuilder();
    const query = builder.orientation('landscape').build();
    expect(query).toContain('(orientation: landscape)');
  });
});
