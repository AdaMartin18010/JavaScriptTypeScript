/**
 * @file 组合模式 (Composite Pattern)
 * @category Design Patterns → Structural
 * @difficulty medium
 * @tags composite, structural, tree-structure
 */

// ============================================================================
// 1. 组件接口
// ============================================================================

interface FileSystemComponent {
  getName(): string;
  getSize(): number;
  display(indent?: string): string;
}

// ============================================================================
// 2. 叶子节点 (文件)
// ============================================================================

class File implements FileSystemComponent {
  constructor(private name: string, private size: number) {}

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.size;
  }

  display(indent: string = ''): string {
    return `${indent}📄 ${this.name} (${this.size} bytes)`;
  }
}

// ============================================================================
// 3. 组合节点 (目录)
// ============================================================================

class Directory implements FileSystemComponent {
  private children: FileSystemComponent[] = [];

  constructor(private name: string) {}

  add(component: FileSystemComponent): void {
    this.children.push(component);
  }

  remove(component: FileSystemComponent): void {
    const index = this.children.indexOf(component);
    if (index > -1) {
      this.children.splice(index, 1);
    }
  }

  getName(): string {
    return this.name;
  }

  getSize(): number {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }

  display(indent: string = ''): string {
    const lines = [`${indent}📁 ${this.name}/`];
    for (const child of this.children) {
      lines.push(child.display(indent + '  '));
    }
    return lines.join('\n');
  }
}

// ============================================================================
// 4. UI 组件示例
// ============================================================================

interface UIComponent {
  render(): string;
  getBounds(): { x: number; y: number; width: number; height: number };
}

class Button2 implements UIComponent {
  constructor(
    private label: string,
    private x: number,
    private y: number,
    private width: number,
    private height: number
  ) {}

  render(): string {
    return `<button style="position:absolute;left:${this.x}px;top:${this.y}px;width:${this.width}px;height:${this.height}px">${this.label}</button>`;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

class Panel implements UIComponent {
  private children: UIComponent[] = [];

  constructor(
    private x: number,
    private y: number,
    private width: number,
    private height: number
  ) {}

  add(component: UIComponent): void {
    this.children.push(component);
  }

  render(): string {
    const childrenHtml = this.children.map(c => c.render()).join('');
    return `<div style="position:absolute;left:${this.x}px;top:${this.y}px;width:${this.width}px;height:${this.height}px;border:1px solid">${childrenHtml}</div>`;
  }

  getBounds() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

// ============================================================================
// 5. 表达式树示例
// ============================================================================

interface Expression {
  evaluate(): number;
  toString(): string;
}

class NumberExpression implements Expression {
  constructor(private value: number) {}

  evaluate(): number {
    return this.value;
  }

  toString(): string {
    return this.value.toString();
  }
}

class AddExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  evaluate(): number {
    return this.left.evaluate() + this.right.evaluate();
  }

  toString(): string {
    return `(${this.left.toString()} + ${this.right.toString()})`;
  }
}

class MultiplyExpression implements Expression {
  constructor(private left: Expression, private right: Expression) {}

  evaluate(): number {
    return this.left.evaluate() * this.right.evaluate();
  }

  toString(): string {
    return `(${this.left.toString()} * ${this.right.toString()})`;
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  File,
  Directory,
  Button2,
  Panel,
  NumberExpression,
  AddExpression,
  MultiplyExpression
};

export type { FileSystemComponent, UIComponent, Expression };
