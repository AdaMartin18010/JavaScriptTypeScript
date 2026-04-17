import { describe, it, expect } from 'vitest'
import { ProgressBarRenderer } from './progress-bar.js'

describe('progress-bar', () => {
  it('ProgressBarRenderer is defined', () => {
    expect(typeof ProgressBarRenderer).not.toBe('undefined');
  });

  it('throws when total is zero or negative', () => {
    expect(() => new ProgressBarRenderer({ total: 0 })).toThrow('Total must be greater than 0');
    expect(() => new ProgressBarRenderer({ total: -1 })).toThrow('Total must be greater than 0');
  });

  it('can instantiate with valid total', () => {
    const bar = new ProgressBarRenderer({ total: 100 });
    expect(bar).toBeDefined();
    expect(bar.getPercentage()).toBe(0);
  });

  it('increment increases current', () => {
    const bar = new ProgressBarRenderer({ total: 10 });
    bar.increment();
    expect(bar.getCurrent()).toBe(1);
    expect(bar.getPercentage()).toBe(10);
  });

  it('update sets current value', () => {
    const bar = new ProgressBarRenderer({ total: 100 });
    bar.update(50);
    expect(bar.getCurrent()).toBe(50);
    expect(bar.getPercentage()).toBe(50);
  });

  it('update clamps to total', () => {
    const bar = new ProgressBarRenderer({ total: 100 });
    bar.update(150);
    expect(bar.getCurrent()).toBe(100);
  });

  it('getElapsedTime returns non-negative', () => {
    const bar = new ProgressBarRenderer({ total: 10 });
    expect(bar.getElapsedTime()).toBeGreaterThanOrEqual(0);
  });

  it('complete marks as finished', () => {
    const bar = new ProgressBarRenderer({ total: 10 });
    bar.complete();
    expect(bar.getCurrent()).toBe(10);
    expect(bar.getPercentage()).toBe(100);
  });
});
