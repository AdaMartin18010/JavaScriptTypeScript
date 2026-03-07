/**
 * @file 桥接模式 (Bridge Pattern)
 * @category Design Patterns → Structural
 * @difficulty medium
 * @tags bridge, structural, abstraction-implementation
 * 
 * @description
 * 将抽象部分与实现部分分离，使它们都可以独立变化
 */

// ============================================================================
// 1. 实现接口 (Implementation)
// ============================================================================

interface Renderer {
  renderCircle(radius: number, x: number, y: number): void;
  renderRectangle(width: number, height: number, x: number, y: number): void;
}

// ============================================================================
// 2. 具体实现
// ============================================================================

class CanvasRenderer implements Renderer {
  renderCircle(radius: number, x: number, y: number): void {
    console.log(`Canvas: Drawing circle at (${x}, ${y}) with radius ${radius}`);
  }

  renderRectangle(width: number, height: number, x: number, y: number): void {
    console.log(`Canvas: Drawing rectangle at (${x}, ${y}) with size ${width}x${height}`);
  }
}

class SVGRenderer implements Renderer {
  renderCircle(radius: number, x: number, y: number): void {
    console.log(`SVG: <circle cx="${x}" cy="${y}" r="${radius}" />`);
  }

  renderRectangle(width: number, height: number, x: number, y: number): void {
    console.log(`SVG: <rect x="${x}" y="${y}" width="${width}" height="${height}" />`);
  }
}

class WebGLRenderer implements Renderer {
  renderCircle(radius: number, x: number, y: number): void {
    console.log(`WebGL: Rendering circle with shader at (${x}, ${y})`);
  }

  renderRectangle(width: number, height: number, x: number, y: number): void {
    console.log(`WebGL: Rendering rectangle with shader at (${x}, ${y})`);
  }
}

// ============================================================================
// 3. 抽象部分 (Abstraction)
// ============================================================================

abstract class Shape {
  constructor(protected renderer: Renderer) {}

  abstract draw(): void;
  abstract resize(factor: number): void;
}

// ============================================================================
// 4. 扩展抽象
// ============================================================================

class Circle extends Shape {
  constructor(
    renderer: Renderer,
    private radius: number,
    private x: number,
    private y: number
  ) {
    super(renderer);
  }

  draw(): void {
    this.renderer.renderCircle(this.radius, this.x, this.y);
  }

  resize(factor: number): void {
    this.radius *= factor;
  }
}

class Rectangle extends Shape {
  constructor(
    renderer: Renderer,
    private width: number,
    private height: number,
    private x: number,
    private y: number
  ) {
    super(renderer);
  }

  draw(): void {
    this.renderer.renderRectangle(this.width, this.height, this.x, this.y);
  }

  resize(factor: number): void {
    this.width *= factor;
    this.height *= factor;
  }
}

// ============================================================================
// 5. 设备控制示例
// ============================================================================

interface Device {
  isEnabled(): boolean;
  enable(): void;
  disable(): void;
  getVolume(): number;
  setVolume(percent: number): void;
}

class TV implements Device {
  private on = false;
  private volume = 30;

  isEnabled(): boolean {
    return this.on;
  }

  enable(): void {
    this.on = true;
    console.log('TV is now ON');
  }

  disable(): void {
    this.on = false;
    console.log('TV is now OFF');
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(percent: number): void {
    this.volume = Math.max(0, Math.min(100, percent));
    console.log(`TV volume set to ${this.volume}%`);
  }
}

class Radio implements Device {
  private on = false;
  private volume = 20;

  isEnabled(): boolean {
    return this.on;
  }

  enable(): void {
    this.on = true;
    console.log('Radio is now ON');
  }

  disable(): void {
    this.on = false;
    console.log('Radio is now OFF');
  }

  getVolume(): number {
    return this.volume;
  }

  setVolume(percent: number): void {
    this.volume = Math.max(0, Math.min(100, percent));
    console.log(`Radio volume set to ${this.volume}%`);
  }
}

class RemoteControl {
  constructor(protected device: Device) {}

  togglePower(): void {
    if (this.device.isEnabled()) {
      this.device.disable();
    } else {
      this.device.enable();
    }
  }

  volumeUp(): void {
    this.device.setVolume(this.device.getVolume() + 10);
  }

  volumeDown(): void {
    this.device.setVolume(this.device.getVolume() - 10);
  }
}

class AdvancedRemoteControl extends RemoteControl {
  mute(): void {
    this.device.setVolume(0);
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  CanvasRenderer,
  SVGRenderer,
  WebGLRenderer,
  Circle,
  Rectangle,
  TV,
  Radio,
  RemoteControl,
  AdvancedRemoteControl
};

export type { Renderer, Shape, Device };
