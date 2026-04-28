/**
 * @file Factory 模式迁移: JavaScript -> TypeScript
 * @category JS/TS Comparison → Pattern Migration
 * @difficulty medium
 * @tags migration, factory, abstract-factory, generic-constraint
 *
 * @description
 * 展示如何将 JavaScript 的简单工厂函数 + if/else 迁移到 TypeScript 的
 * 抽象工厂 + 泛型约束 + createButton<T extends Button>(ctor)。
 */

// ============================================================================
// JavaScript 版本: 简单工厂函数 + if/else
// ============================================================================

/*
function createButtonJS(type) {
  if (type === 'windows') {
    return { render() { return 'Windows Button'; }, onClick(cb) { cb(); } };
  } else if (type === 'mac') {
    return { render() { return 'Mac Button'; }, onClick(cb) { cb(); } };
  } else if (type === 'linux') {
    return { render() { return 'Linux Button'; }, onClick(cb) { cb(); } };
  }
  throw new Error('Unknown button type');
}

const btn = createButtonJS('windows');
console.log(btn.render());
// 问题: 返回类型不固定；新增类型需修改工厂函数；无编译时检查
*/

// ============================================================================
// TypeScript 版本: 抽象工厂 + 泛型约束 + createButton<T extends Button>(ctor)
// ============================================================================

export interface Button {
  render(): string;
  onClick(callback: () => void): void;
}

export interface Checkbox {
  render(): string;
  toggle(): void;
}

// 抽象工厂接口
export interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
}

// Windows 家族
export class WindowsButton implements Button {
  render(): string {
    return 'Windows Button';
  }
  onClick(callback: () => void): void {
    callback();
  }
}

export class WindowsCheckbox implements Checkbox {
  private checked = false;
  render(): string {
    return `Windows Checkbox [${this.checked ? 'X' : ' '}]`;
  }
  toggle(): void {
    this.checked = !this.checked;
  }
}

export class WindowsFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();
  }
  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }
}

// Mac 家族
export class MacButton implements Button {
  render(): string {
    return 'Mac Button';
  }
  onClick(callback: () => void): void {
    callback();
  }
}

export class MacCheckbox implements Checkbox {
  private checked = false;
  render(): string {
    return `Mac Checkbox [${this.checked ? '✓' : ' '}]`;
  }
  toggle(): void {
    this.checked = !this.checked;
  }
}

export class MacFactory implements GUIFactory {
  createButton(): Button {
    return new MacButton();
  }
  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }
}

// 泛型工厂函数: 通过构造函数直接创建，无需 if/else
export function createButton<T extends Button>(Ctor: new () => T): T {
  return new Ctor();
}

export function createCheckbox<T extends Checkbox>(Ctor: new () => T): T {
  return new Ctor();
}

// 使用示例
export function buildUIFromFactory(factory: GUIFactory): { button: Button; checkbox: Checkbox } {
  return {
    button: factory.createButton(),
    checkbox: factory.createCheckbox()
  };
}

export function buildUIFromGeneric(): { button: WindowsButton; checkbox: MacCheckbox } {
  return {
    button: createButton(WindowsButton),
    checkbox: createCheckbox(MacCheckbox)
  };
}

// ============================================================================
// 迁移收益
// ============================================================================

/**
 * 1. 抽象工厂 (GUIFactory) 将产品家族统一封装，新增 OS 只需新增工厂类。
 * 2. 泛型约束 createButton<T extends Button>(ctor) 保证传入的必须是 Button 子类。
 * 3. 返回值类型精确到具体子类 (如 WindowsButton)，无需类型断言。
 * 4. 彻底消除 if/else 字符串判断，编译期即可捕获非法工厂或产品类型。
 */
