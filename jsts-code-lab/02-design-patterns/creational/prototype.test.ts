import { describe, it, expect } from 'vitest';
import {
  Document,
  Shape,
  PrototypeRegistry,
  carPrototype,
  GameCharacter,
  deepClone
} from './prototype.js';

describe('prototype pattern', () => {
  it('Document should create independent clone', () => {
    const original = new Document('Original', 'Content here', 'Alice', new Date('2024-01-01'));
    const clone = original.clone();

    expect(clone.title).toBe(original.title);
    expect(clone.content).toBe(original.content);
    expect(clone.author).toBe(original.author);
    expect(clone.createdAt.getTime()).toBe(original.createdAt.getTime());
    expect(clone).not.toBe(original);
    expect(clone.createdAt).not.toBe(original.createdAt);
  });

  it('Shape should clone via structuredClone', () => {
    const original = new Shape('circle', 10, 20, { radius: 5 });
    const clone = original.clone();

    expect(clone.type).toBe('circle');
    expect(clone.x).toBe(10);
    expect(clone.metadata).toEqual({ radius: 5 });
    expect(clone).not.toBe(original);
  });

  it('PrototypeRegistry should create clones by name', () => {
    const registry = new PrototypeRegistry();
    const doc = new Document('Template', 'Template content', 'Admin');
    registry.register('template', doc);

    const clone = registry.create<Document>('template');
    expect(clone.title).toBe('Template');
    expect(clone).not.toBe(doc);
  });

  it('PrototypeRegistry should throw for unknown prototype', () => {
    const registry = new PrototypeRegistry();
    expect(() => registry.create('unknown')).toThrow("Prototype 'unknown' not found");
  });

  it('carPrototype should support JavaScript prototype cloning', () => {
    const car = carPrototype.clone();
    expect(car.wheels).toBe(4);
    expect(car.drive()).toBe('Driving...');

    car.color = 'red';
    expect(car.color).toBe('red');
  });

  it('GameCharacter clone should be shallow copy', () => {
    const original = new GameCharacter('Hero', 10, ['sword'], { health: 100, mana: 50, strength: 20 });
    const clone = original.clone();

    expect(clone.name).toBe('Hero');
    expect(clone).not.toBe(original);
    // clone() creates new array via spread and new object via spread
    expect(clone.inventory).toEqual(original.inventory);
    expect(clone.inventory).not.toBe(original.inventory);
    expect(clone.stats).not.toBe(original.stats);
  });

  it('GameCharacter deepClone should deeply copy all fields', () => {
    const original = new GameCharacter('Hero', 10, ['sword'], { health: 100, mana: 50, strength: 20 });
    const clone = original.deepClone();

    expect(clone.inventory).not.toBe(original.inventory);
    expect(clone.stats).not.toBe(original.stats);
    expect(clone.inventory).toEqual(['sword']);
    expect(clone.stats).toEqual({ health: 100, mana: 50, strength: 20 });
  });

  it('deepClone should handle nested objects and arrays', () => {
    const original = {
      a: 1,
      b: [2, 3],
      c: { d: new Date('2024-01-01'), e: null }
    };
    const clone = deepClone(original);

    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.b).not.toBe(original.b);
    expect(clone.c).not.toBe(original.c);
    expect(clone.c.d).not.toBe(original.c.d);
  });
});
