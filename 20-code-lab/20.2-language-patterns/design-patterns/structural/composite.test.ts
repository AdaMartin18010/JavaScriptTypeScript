import { describe, it, expect } from 'vitest';
import {
  File,
  Directory,
  Button2,
  Panel,
  NumberExpression,
  AddExpression,
  MultiplyExpression
} from './composite.js';

describe('composite pattern', () => {
  it('File should return its own size and name', () => {
    const file = new File('readme.txt', 1024);
    expect(file.getName()).toBe('readme.txt');
    expect(file.getSize()).toBe(1024);
    expect(file.display()).toBe('📄 readme.txt (1024 bytes)');
  });

  it('Directory should calculate total size of all children', () => {
    const root = new Directory('root');
    const docs = new Directory('documents');

    docs.add(new File('readme.txt', 1024));
    docs.add(new File('doc.pdf', 3072));
    root.add(docs);
    root.add(new File('photo.jpg', 2048));

    expect(root.getSize()).toBe(6144);
    expect(docs.getSize()).toBe(4096);
  });

  it('Directory display should include nested structure', () => {
    const root = new Directory('root');
    const docs = new Directory('docs');
    docs.add(new File('a.txt', 100));
    root.add(docs);

    const display = root.display();
    expect(display).toContain('📁 root/');
    expect(display).toContain('📁 docs/');
    expect(display).toContain('📄 a.txt');
  });

  it('Directory should support remove', () => {
    const dir = new Directory('dir');
    const file = new File('temp.txt', 100);
    dir.add(file);
    expect(dir.getSize()).toBe(100);

    dir.remove(file);
    expect(dir.getSize()).toBe(0);
  });

  it('Panel should render nested UI components', () => {
    const panel = new Panel(0, 0, 400, 300);
    const button = new Button2('Click me', 10, 10, 100, 30);
    panel.add(button);

    const html = panel.render();
    expect(html).toContain('<div');
    expect(html).toContain('<button');
    expect(html).toContain('Click me');
    expect(html).toContain('width:100px');
  });

  it('Expression tree should evaluate correctly', () => {
    const expr = new AddExpression(
      new MultiplyExpression(new NumberExpression(2), new NumberExpression(3)),
      new NumberExpression(4)
    );

    expect(expr.evaluate()).toBe(10);
    expect(expr.toString()).toBe('((2 * 3) + 4)');
  });

  it('NumberExpression should evaluate to its value', () => {
    const expr = new NumberExpression(42);
    expect(expr.evaluate()).toBe(42);
    expect(expr.toString()).toBe('42');
  });
});
