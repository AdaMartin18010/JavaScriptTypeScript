import { describe, it, expect } from 'vitest';
import { Animal, Dog, BankAccount, Rectangle, FluentArray, Shape } from './classes-es6.js';

describe('ES6 classes', () => {
  it('Animal should have name and speak method', () => {
    const animal = new Animal('Rex', 5);
    expect(animal.name).toBe('Rex');
    expect(animal.speak()).toBe('Rex makes a sound');
    expect(Animal.isAnimal(animal)).toBe(true);
  });

  it('Dog should inherit from Animal and override speak', () => {
    const dog = new Dog('Rex', 5, 'German Shepherd');
    expect(dog.speak()).toBe('Rex barks');
    expect(dog.fetch()).toBe('Rex is fetching');
    expect(Dog.species).toBe('Canis lupus');
  });

  it('BankAccount should manage private balance', () => {
    const account = new BankAccount('Alice', 1000);
    account.deposit(500);
    expect(account.getBalance()).toBe(1500);
    account.withdraw(200);
    expect(account.getBalance()).toBe(1300);
    expect(() => account.withdraw(2000)).toThrow('Insufficient funds');
    expect(() => account.deposit(-100)).toThrow('Invalid amount');
  });

  it('Rectangle should compute area and perimeter', () => {
    const rect = new Rectangle(5, 3);
    expect(rect.area()).toBe(15);
    expect(rect.perimeter()).toBe(16);
    expect(rect.describe()).toBe('Area: 15, Perimeter: 16');
  });

  it('FluentArray should support chaining', () => {
    const fluent = new FluentArray<number>();
    fluent.add(1).add(2).add(3).remove(2);
    expect(fluent.length).toBe(2);
  });
});
