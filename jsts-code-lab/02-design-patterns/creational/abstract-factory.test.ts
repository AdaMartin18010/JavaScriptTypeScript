import { describe, it, expect, vi } from 'vitest';
import {
  WindowsButton,
  WindowsCheckbox,
  WindowsTextField,
  MacButton,
  MacCheckbox,
  MacTextField,
  WindowsFactory,
  MacFactory,
  Application,
  getFactory
} from './abstract-factory.js';

describe('abstract factory pattern', () => {
  it('WindowsFactory should create Windows-style components', () => {
    const factory = new WindowsFactory();
    const button = factory.createButton();
    const checkbox = factory.createCheckbox();
    const textField = factory.createTextField();

    expect(button.render()).toBe('Rendering Windows-style button');
    expect(checkbox.render()).toContain('Windows-style checkbox');
    expect(textField.render()).toContain('Windows-style text field');
  });

  it('MacFactory should create Mac-style components', () => {
    const factory = new MacFactory();
    const button = factory.createButton();
    const checkbox = factory.createCheckbox();
    const textField = factory.createTextField();

    expect(button.render()).toBe('Rendering Mac-style button');
    expect(checkbox.render()).toContain('Mac-style checkbox');
    expect(textField.render()).toContain('Mac-style text field');
  });

  it('Application should render all components from factory', () => {
    const app = new Application(new WindowsFactory());
    const render = app.render();

    expect(render).toContain('Windows-style button');
    expect(render).toContain('Windows-style checkbox');
    expect(render).toContain('Windows-style text field');
  });

  it('getFactory should return correct factory by OS', () => {
    expect(getFactory('windows')).toBeInstanceOf(WindowsFactory);
    expect(getFactory('mac')).toBeInstanceOf(MacFactory);
  });

  it('getFactory should throw for unsupported OS', () => {
    expect(() => getFactory('linux' as 'windows')).toThrow('Unsupported OS: linux');
  });

  it('WindowsButton should support onClick callback', () => {
    const button = new WindowsButton();
    const callback = vi.fn();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    button.onClick(callback);
    expect(callback).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Windows button clicked');

    consoleSpy.mockRestore();
  });

  it('MacCheckbox should support toggle', () => {
    const checkbox = new MacCheckbox();
    expect(checkbox.render()).toContain('[ ]');

    checkbox.toggle();
    expect(checkbox.render()).toContain('[✓]');
  });

  it('WindowsTextField should support setText and getText', () => {
    const field = new WindowsTextField();
    field.setText('Hello');
    expect(field.getText()).toBe('Hello');
    expect(field.render()).toContain('"Hello"');
  });
});
