import { describe, it, expect, vi } from 'vitest';
import { SimpleCoffee, MilkDecorator, SugarDecorator, WhipDecorator, compose, withLogging } from './decorator';

describe('decorator pattern', () => {
  it('SimpleCoffee should have base cost and description', () => {
    const coffee = new SimpleCoffee();
    expect(coffee.cost()).toBe(10);
    expect(coffee.description()).toBe('Simple coffee');
  });

  it('MilkDecorator should add cost and update description', () => {
    const coffee = new MilkDecorator(new SimpleCoffee());
    expect(coffee.cost()).toBe(12);
    expect(coffee.description()).toBe('Simple coffee, milk');
  });

  it('multiple decorators should stack', () => {
    const coffee = new SugarDecorator(new MilkDecorator(new SimpleCoffee()));
    expect(coffee.cost()).toBe(13);
    expect(coffee.description()).toBe('Simple coffee, milk, sugar');
  });

  it('deluxe coffee should compute correctly', () => {
    const deluxe = new WhipDecorator(new MilkDecorator(new SimpleCoffee()));
    expect(deluxe.cost()).toBe(15);
    expect(deluxe.description()).toBe('Simple coffee, milk, whip');
  });

  it('compose should apply decorators left to right', () => {
    const addOne = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    // compose uses reduce (left-to-right): double then addOne
    const composed = compose<number>(double, addOne);
    expect(composed(5)).toBe(11);
  });

  it('withLogging should wrap object methods', () => {
    const obj = { add: (a: number, b: number) => a + b };
    const logged = withLogging(obj);
    expect(logged.add(2, 3)).toBe(5);
  });
});
