/**
 * @file 访问者模式 (Visitor Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty hard
 * @tags visitor, behavioral, double-dispatch, element-operations
 * 
 * @description
 * 表示一个作用于某对象结构中的各元素的操作，可以在不改变各元素类的前提下定义新操作
 */

// ============================================================================
// 1. 访问者接口
// ============================================================================

interface Visitor {
  visitDot(dot: Dot): void;
  visitCircle(circle: Circle): void;
  visitRectangle(rectangle: Rectangle): void;
  visitCompoundShape(shape: CompoundShape): void;
}

// ============================================================================
// 2. 元素接口
// ============================================================================

interface Shape {
  move(x: number, y: number): void;
  draw(): void;
  accept(visitor: Visitor): void;
  getId(): string;
}

// ============================================================================
// 3. 具体元素
// ============================================================================

class Dot implements Shape {
  constructor(
    private id: string,
    private x: number,
    private y: number
  ) {}

  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  draw(): void {
    console.log(`Drawing dot ${this.id} at (${this.x}, ${this.y})`);
  }

  accept(visitor: Visitor): void {
    visitor.visitDot(this);
  }

  getId(): string {
    return this.id;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }
}

class Circle implements Shape {
  constructor(
    private id: string,
    private x: number,
    private y: number,
    private radius: number
  ) {}

  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  draw(): void {
    console.log(`Drawing circle ${this.id} at (${this.x}, ${this.y}) with radius ${this.radius}`);
  }

  accept(visitor: Visitor): void {
    visitor.visitCircle(this);
  }

  getId(): string {
    return this.id;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getRadius(): number {
    return this.radius;
  }
}

class Rectangle implements Shape {
  constructor(
    private id: string,
    private x: number,
    private y: number,
    private width: number,
    private height: number
  ) {}

  move(x: number, y: number): void {
    this.x += x;
    this.y += y;
  }

  draw(): void {
    console.log(`Drawing rectangle ${this.id} at (${this.x}, ${this.y}) with size ${this.width}x${this.height}`);
  }

  accept(visitor: Visitor): void {
    visitor.visitRectangle(this);
  }

  getId(): string {
    return this.id;
  }

  getX(): number {
    return this.x;
  }

  getY(): number {
    return this.y;
  }

  getWidth(): number {
    return this.width;
  }

  getHeight(): number {
    return this.height;
  }
}

class CompoundShape implements Shape {
  private children: Shape[] = [];

  constructor(private id: string) {}

  add(shape: Shape): void {
    this.children.push(shape);
  }

  move(x: number, y: number): void {
    for (const child of this.children) {
      child.move(x, y);
    }
  }

  draw(): void {
    console.log(`Drawing compound shape ${this.id}`);
    for (const child of this.children) {
      child.draw();
    }
  }

  accept(visitor: Visitor): void {
    visitor.visitCompoundShape(this);
  }

  getId(): string {
    return this.id;
  }

  getChildren(): Shape[] {
    return [...this.children];
  }
}

// ============================================================================
// 4. 具体访问者
// ============================================================================

class XMLExportVisitor implements Visitor {
  private xml = '';

  visitDot(dot: Dot): void {
    this.xml += `<dot id="${dot.getId()}" x="${dot.getX()}" y="${dot.getY()}" />\n`;
  }

  visitCircle(circle: Circle): void {
    this.xml += `<circle id="${circle.getId()}" x="${circle.getX()}" y="${circle.getY()}" radius="${circle.getRadius()}" />\n`;
  }

  visitRectangle(rectangle: Rectangle): void {
    this.xml += `<rectangle id="${rectangle.getId()}" x="${rectangle.getX()}" y="${rectangle.getY()}" width="${rectangle.getWidth()}" height="${rectangle.getHeight()}" />\n`;
  }

  visitCompoundShape(shape: CompoundShape): void {
    this.xml += `<compound id="${shape.getId()}">\n`;
    for (const child of shape.getChildren()) {
      child.accept(this);
    }
    this.xml += `</compound>\n`;
  }

  getXML(): string {
    return this.xml;
  }
}

class AreaCalculator implements Visitor {
  private totalArea = 0;

  visitDot(): void {
    // 点的面积为0
  }

  visitCircle(circle: Circle): void {
    this.totalArea += Math.PI * circle.getRadius() ** 2;
  }

  visitRectangle(rectangle: Rectangle): void {
    this.totalArea += rectangle.getWidth() * rectangle.getHeight();
  }

  visitCompoundShape(shape: CompoundShape): void {
    for (const child of shape.getChildren()) {
      child.accept(this);
    }
  }

  getTotalArea(): number {
    return this.totalArea;
  }
}

class MoveVisitor implements Visitor {
  constructor(private dx: number, private dy: number) {}

  visitDot(dot: Dot): void {
    dot.move(this.dx, this.dy);
  }

  visitCircle(circle: Circle): void {
    circle.move(this.dx, this.dy);
  }

  visitRectangle(rectangle: Rectangle): void {
    rectangle.move(this.dx, this.dy);
  }

  visitCompoundShape(shape: CompoundShape): void {
    shape.move(this.dx, this.dy);
  }
}

// ============================================================================
// 5. 对象结构
// ============================================================================

class Drawing implements Shape {
  private shapes: Shape[] = [];

  add(shape: Shape): void {
    this.shapes.push(shape);
  }

  remove(shape: Shape): void {
    const index = this.shapes.indexOf(shape);
    if (index > -1) {
      this.shapes.splice(index, 1);
    }
  }

  move(x: number, y: number): void {
    for (const shape of this.shapes) {
      shape.move(x, y);
    }
  }

  draw(): void {
    for (const shape of this.shapes) {
      shape.draw();
    }
  }

  accept(visitor: Visitor): void {
    for (const shape of this.shapes) {
      shape.accept(visitor);
    }
  }

  getId(): string {
    return 'drawing';
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  Dot,
  Circle,
  Rectangle,
  CompoundShape,
  XMLExportVisitor,
  AreaCalculator,
  MoveVisitor,
  Drawing
};

export type { Visitor, Shape };
