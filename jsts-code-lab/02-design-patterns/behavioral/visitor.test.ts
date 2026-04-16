import { describe, it, expect } from 'vitest';
import {
  Dot,
  Circle,
  Rectangle,
  CompoundShape,
  XMLExportVisitor,
  AreaCalculator,
  MoveVisitor,
  Drawing
} from './visitor.js';

describe('visitor pattern', () => {
  it('XMLExportVisitor should export shapes to XML', () => {
    const exporter = new XMLExportVisitor();
    const dot = new Dot('dot1', 10, 20);
    dot.accept(exporter);

    expect(exporter.getXML()).toContain('<dot id="dot1" x="10" y="20" />');
  });

  it('AreaCalculator should compute correct areas', () => {
    const calculator = new AreaCalculator();
    const circle = new Circle('c1', 0, 0, 5);
    const rectangle = new Rectangle('r1', 0, 0, 10, 20);

    circle.accept(calculator);
    rectangle.accept(calculator);

    expect(calculator.getTotalArea()).toBeCloseTo(Math.PI * 25 + 200);
  });

  it('MoveVisitor should move shapes by offset', () => {
    const circle = new Circle('c1', 10, 20, 5);
    const mover = new MoveVisitor(5, -5);

    circle.accept(mover);
    expect(circle.getX()).toBe(15);
    expect(circle.getY()).toBe(15);
  });

  it('CompoundShape should accept visitor for all children', () => {
    const compound = new CompoundShape('group1');
    compound.add(new Dot('d1', 1, 2));
    compound.add(new Circle('c1', 3, 4, 5));

    const calculator = new AreaCalculator();
    compound.accept(calculator);

    expect(calculator.getTotalArea()).toBeCloseTo(Math.PI * 25);
  });

  it('Drawing should allow adding, removing and visiting shapes', () => {
    const drawing = new Drawing();
    const dot = new Dot('d1', 0, 0);
    const rect = new Rectangle('r1', 0, 0, 10, 10);

    drawing.add(dot);
    drawing.add(rect);

    const calculator = new AreaCalculator();
    drawing.accept(calculator);
    expect(calculator.getTotalArea()).toBe(100);

    drawing.remove(dot);
    const calculator2 = new AreaCalculator();
    drawing.accept(calculator2);
    expect(calculator2.getTotalArea()).toBe(100);
  });

  it('XMLExportVisitor should handle nested compound shapes', () => {
    const exporter = new XMLExportVisitor();
    const compound = new CompoundShape('outer');
    compound.add(new Dot('inner-dot', 5, 5));

    compound.accept(exporter);
    const xml = exporter.getXML();

    expect(xml).toContain('<compound id="outer">');
    expect(xml).toContain('<dot id="inner-dot" x="5" y="5" />');
    expect(xml).toContain('</compound>');
  });
});
