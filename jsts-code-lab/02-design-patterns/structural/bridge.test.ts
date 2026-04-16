import { describe, it, expect, vi } from 'vitest';
import {
  CanvasRenderer,
  SVGRenderer,
  Circle,
  Rectangle,
  TV,
  Radio,
  RemoteControl,
  AdvancedRemoteControl
} from './bridge.js';

describe('bridge pattern', () => {
  it('Circle should delegate drawing to renderer', () => {
    const renderer = new CanvasRenderer();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const circle = new Circle(renderer, 10, 5, 5);

    circle.draw();
    expect(consoleSpy).toHaveBeenCalledWith('Canvas: Drawing circle at (5, 5) with radius 10');

    consoleSpy.mockRestore();
  });

  it('Rectangle should delegate drawing to SVG renderer', () => {
    const renderer = new SVGRenderer();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const rect = new Rectangle(renderer, 20, 30, 0, 0);

    rect.draw();
    expect(consoleSpy).toHaveBeenCalledWith('SVG: <rect x="0" y="0" width="20" height="30" />');

    consoleSpy.mockRestore();
  });

  it('Circle should support resize', () => {
    const renderer = new CanvasRenderer();
    const circle = new Circle(renderer, 10, 0, 0);

    circle.resize(2);
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    circle.draw();
    expect(consoleSpy).toHaveBeenCalledWith('Canvas: Drawing circle at (0, 0) with radius 20');
    consoleSpy.mockRestore();
  });

  it('RemoteControl should toggle TV power', () => {
    const tv = new TV();
    const remote = new RemoteControl(tv);

    expect(tv.isEnabled()).toBe(false);
    remote.togglePower();
    expect(tv.isEnabled()).toBe(true);
    remote.togglePower();
    expect(tv.isEnabled()).toBe(false);
  });

  it('RemoteControl should adjust Radio volume', () => {
    const radio = new Radio();
    const remote = new RemoteControl(radio);

    remote.togglePower();
    expect(radio.getVolume()).toBe(20);

    remote.volumeUp();
    expect(radio.getVolume()).toBe(30);

    remote.volumeDown();
    expect(radio.getVolume()).toBe(20);
  });

  it('AdvancedRemoteControl should mute device', () => {
    const tv = new TV();
    const remote = new AdvancedRemoteControl(tv);

    remote.togglePower();
    remote.volumeUp();
    expect(tv.getVolume()).toBeGreaterThan(0);

    remote.mute();
    expect(tv.getVolume()).toBe(0);
  });

  it('TV volume should be clamped between 0 and 100', () => {
    const tv = new TV();
    const remote = new RemoteControl(tv);

    remote.togglePower();
    tv.setVolume(150);
    expect(tv.getVolume()).toBe(100);

    tv.setVolume(-10);
    expect(tv.getVolume()).toBe(0);
  });
});
