import { describe, it, expect } from 'vitest';
import { identity, reverse, logLength, getProperty, createArray, Box, create, apiRequest } from './generics';

describe('generics', () => {
  it('identity should return the same value', () => {
    expect(identity<number>(42)).toBe(42);
    expect(identity('hello')).toBe('hello');
  });

  it('reverse should reverse an array immutably', () => {
    const arr = [1, 2, 3];
    expect(reverse(arr)).toEqual([3, 2, 1]);
    expect(arr).toEqual([1, 2, 3]);
  });

  it('logLength should return the argument and work with length property', () => {
    expect(logLength('test')).toBe('test');
    expect(logLength([1, 2, 3])).toEqual([1, 2, 3]);
  });

  it('getProperty should retrieve nested property', () => {
    const person = { name: 'Alice', age: 30 };
    expect(getProperty(person, 'name')).toBe('Alice');
    expect(getProperty(person, 'age')).toBe(30);
  });

  it('createArray should create array with default generic', () => {
    expect(createArray(3, 'a')).toEqual(['a', 'a', 'a']);
    expect(createArray<number>(2, 5)).toEqual([5, 5]);
  });

  it('Box should store and retrieve values', () => {
    const box = new Box(100);
    expect(box.getValue()).toBe(100);
    box.setValue(200);
    expect(box.value).toBe(200);
  });

  it('create factory should instantiate classes', () => {
    const date = create(Date);
    expect(date).toBeInstanceOf(Date);
  });
});
