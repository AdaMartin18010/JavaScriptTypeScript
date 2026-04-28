import { describe, it, expect } from 'vitest';
import { Easing, Interpolator, AnimationController, ChartDataAnimator } from './chart-animation.js';

describe('Easing', () => {
  it('linear returns input unchanged', () => {
    expect(Easing.linear(0)).toBe(0);
    expect(Easing.linear(0.5)).toBe(0.5);
    expect(Easing.linear(1)).toBe(1);
  });

  it('easeInQuad produces smaller values than linear at 0 < t < 1', () => {
    expect(Easing.easeInQuad(0.5)).toBe(0.25);
    expect(Easing.easeInQuad(0)).toBe(0);
    expect(Easing.easeInQuad(1)).toBe(1);
  });

  it('easeOutQuad produces values between 0 and 1', () => {
    expect(Easing.easeOutQuad(0.5)).toBe(0.75);
    expect(Easing.easeOutQuad(0)).toBe(0);
    expect(Easing.easeOutQuad(1)).toBe(1);
  });

  it('easeInOutQuad is symmetric', () => {
    expect(Easing.easeInOutQuad(0)).toBe(0);
    expect(Easing.easeInOutQuad(0.5)).toBe(0.5);
    expect(Easing.easeInOutQuad(1)).toBe(1);
    expect(Easing.easeInOutQuad(0.25)).toBeLessThan(0.25);
    expect(Easing.easeInOutQuad(0.75)).toBeGreaterThan(0.75);
  });

  it('easeOutBounce returns 1 at t=1', () => {
    expect(Easing.easeOutBounce(1)).toBe(1);
    expect(Easing.easeOutBounce(0)).toBe(0);
  });

  it('easeOutElastic returns 1 at t=1', () => {
    expect(Easing.easeOutElastic(1)).toBe(1);
    expect(Easing.easeOutElastic(0)).toBe(0);
  });

  it('cubic easings return 0 at t=0 and 1 at t=1', () => {
    expect(Easing.easeInCubic(0)).toBe(0);
    expect(Easing.easeInCubic(1)).toBe(1);
    expect(Easing.easeOutCubic(0)).toBe(0);
    expect(Easing.easeOutCubic(1)).toBe(1);
    expect(Easing.easeInOutCubic(0)).toBe(0);
    expect(Easing.easeInOutCubic(1)).toBe(1);
  });
});

describe('Interpolator', () => {
  it('lerps between two numbers', () => {
    expect(Interpolator.lerp(0, 100, 0)).toBe(0);
    expect(Interpolator.lerp(0, 100, 0.5)).toBe(50);
    expect(Interpolator.lerp(0, 100, 1)).toBe(100);
  });

  it('lerps colors', () => {
    const mid = Interpolator.lerpColor('#ff0000', '#0000ff', 0.5);
    expect(mid).toBe('#800080');
  });

  it('lerps arrays element-wise', () => {
    const result = Interpolator.lerpArray([0, 100], [100, 0], 0.5);
    expect(result).toEqual([50, 50]);
  });

  it('lerps objects', () => {
    const result = Interpolator.lerpObject({ x: 0, y: 100 }, { x: 100, y: 0 }, 0.5);
    expect(result).toEqual({ x: 50, y: 50 });
  });
});

describe('AnimationController', () => {
  it('generates keyframes', () => {
    const frames = AnimationController.generateKeyframes(1000, 60, Easing.linear);
    expect(frames.length).toBe(61);
    expect(frames[0].progress).toBe(0);
    expect(frames[frames.length - 1].progress).toBe(1);
  });

  it('applies easing to keyframes', () => {
    const frames = AnimationController.generateKeyframes(1000, 4, Easing.easeInQuad);
    expect(frames[2].value).toBe(0.25); // (2/4)^2
  });
});

describe('ChartDataAnimator', () => {
  it('animates bar heights', () => {
    const result = ChartDataAnimator.animateBarHeights([0, 0], [100, 200], 0.5);
    expect(result[0]).toBeGreaterThan(0);
    expect(result[0]).toBeLessThan(100);
    expect(result[1]).toBeGreaterThan(0);
    expect(result[1]).toBeLessThan(200);
  });

  it('animates pie slices', () => {
    const from = [{ start: 0, end: 90 }, { start: 90, end: 180 }];
    const to = [{ start: 0, end: 180 }, { start: 180, end: 360 }];
    const result = ChartDataAnimator.animatePieSlices(from, to, 0.5, Easing.linear);
    expect(result[0].end).toBeCloseTo(135, 0);
    expect(result[1].start).toBeCloseTo(135, 0);
  });

  it('counts up values', () => {
    expect(ChartDataAnimator.countUp(0, 100, 0)).toBe(0);
    expect(ChartDataAnimator.countUp(0, 100, 1)).toBe(100);
    const mid = ChartDataAnimator.countUp(0, 100, 0.5, Easing.linear);
    expect(mid).toBe(50);
  });
});
