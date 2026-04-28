/**
 * @file 抽象工厂模式 (Abstract Factory Pattern)
 * @category Design Patterns → Creational
 * @difficulty medium
 * @tags abstract-factory, creational, family-of-objects
 */

// ============================================================================
// 1. 抽象产品接口
// ============================================================================

interface Button {
  render(): string;
  onClick(callback: () => void): void;
}

interface Checkbox {
  render(): string;
  toggle(): void;
}

interface TextField {
  render(): string;
  setText(text: string): void;
  getText(): string;
}

// ============================================================================
// 2. 具体产品 - Windows 风格
// ============================================================================

class WindowsButton implements Button {
  render(): string {
    return 'Rendering Windows-style button';
  }

  onClick(callback: () => void): void {
    console.log('Windows button clicked');
    callback();
  }
}

class WindowsCheckbox implements Checkbox {
  private checked = false;

  render(): string {
    return `Rendering Windows-style checkbox [${this.checked ? 'X' : ' '}]`;
  }

  toggle(): void {
    this.checked = !this.checked;
  }
}

class WindowsTextField implements TextField {
  private text = '';

  render(): string {
    return `Rendering Windows-style text field: "${this.text}"`;
  }

  setText(text: string): void {
    this.text = text;
  }

  getText(): string {
    return this.text;
  }
}

// ============================================================================
// 3. 具体产品 - Mac 风格
// ============================================================================

class MacButton implements Button {
  render(): string {
    return 'Rendering Mac-style button';
  }

  onClick(callback: () => void): void {
    console.log('Mac button clicked');
    callback();
  }
}

class MacCheckbox implements Checkbox {
  private checked = false;

  render(): string {
    return `Rendering Mac-style checkbox [${this.checked ? '✓' : ' '}]`;
  }

  toggle(): void {
    this.checked = !this.checked;
  }
}

class MacTextField implements TextField {
  private text = '';

  render(): string {
    return `Rendering Mac-style text field: "${this.text}"`;
  }

  setText(text: string): void {
    this.text = text;
  }

  getText(): string {
    return this.text;
  }
}

// ============================================================================
// 4. 抽象工厂
// ============================================================================

interface GUIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  createTextField(): TextField;
}

// ============================================================================
// 5. 具体工厂
// ============================================================================

class WindowsFactory implements GUIFactory {
  createButton(): Button {
    return new WindowsButton();
  }

  createCheckbox(): Checkbox {
    return new WindowsCheckbox();
  }

  createTextField(): TextField {
    return new WindowsTextField();
  }
}

class MacFactory implements GUIFactory {
  createButton(): Button {
    return new MacButton();
  }

  createCheckbox(): Checkbox {
    return new MacCheckbox();
  }

  createTextField(): TextField {
    return new MacTextField();
  }
}

// ============================================================================
// 6. 客户端代码
// ============================================================================

class Application {
  private button: Button;
  private checkbox: Checkbox;
  private textField: TextField;

  constructor(factory: GUIFactory) {
    this.button = factory.createButton();
    this.checkbox = factory.createCheckbox();
    this.textField = factory.createTextField();
  }

  render(): string {
    return [
      this.button.render(),
      this.checkbox.render(),
      this.textField.render()
    ].join('\n');
  }
}

// ============================================================================
// 7. 工厂提供者
// ============================================================================

function getFactory(os: 'windows' | 'mac'): GUIFactory {
  switch (os) {
    case 'windows':
      return new WindowsFactory();
    case 'mac':
      return new MacFactory();
    default:
      throw new Error(`Unsupported OS: ${os}`);
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
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
};

export type { Button, Checkbox, TextField, GUIFactory };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Abstract Factory Pattern Demo ===");
  
  // Windows 风格 UI
  const windowsFactory = getFactory("windows");
  const windowsApp = new Application(windowsFactory);
  console.log("Windows UI:");
  console.log(windowsApp.render());
  
  // Mac 风格 UI
  const macFactory = getFactory("mac");
  const macApp = new Application(macFactory);
  console.log("Mac UI:");
  console.log(macApp.render());
  
  // 直接创建组件
  const winButton = new WindowsButton();
  const macCheckbox = new MacCheckbox();
  console.log("Windows button render:", winButton.render());
  console.log("Mac checkbox render:", macCheckbox.render());
  
  console.log("=== End of Demo ===\n");
}
