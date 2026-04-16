import { describe, it, expect } from 'vitest';
import {
  processJSData,
  processJSDataSafe,
  isUser,
  greetUser,
  formatProductJS,
  formatProductTS,
  userValidator,
  processUser,
  ObjectValidator,
} from './js-ts-interop.js';

describe('processJSData', () => {
  it('should cast data to string and uppercase', () => {
    expect(processJSData('hello')).toBe('HELLO');
  });
});

describe('processJSDataSafe', () => {
  it('should safely process string data', () => {
    expect(processJSDataSafe('hello')).toBe('HELLO');
  });

  it('should throw for non-string data', () => {
    expect(() => processJSDataSafe(123)).toThrow(TypeError);
  });
});

describe('isUser', () => {
  it('should return true for valid user objects', () => {
    expect(isUser({ name: 'Alice', age: 30 })).toBe(true);
  });

  it('should return false for missing properties', () => {
    expect(isUser({ name: 'Alice' })).toBe(false);
  });

  it('should return false for wrong types', () => {
    expect(isUser({ name: 'Alice', age: '30' })).toBe(false);
  });

  it('should return false for null', () => {
    expect(isUser(null)).toBe(false);
  });
});

describe('greetUser', () => {
  it('should greet a valid user', () => {
    expect(greetUser({ name: 'Alice', age: 30 })).toBe('Hello, Alice!');
  });

  it('should greet a stranger for invalid data', () => {
    expect(greetUser({ name: 'Alice' })).toBe('Hello, stranger!');
  });
});

describe('formatProduct', () => {
  const product = { id: '1', name: 'Laptop', price: 999 };

  it('formatProductJS should format product', () => {
    expect(formatProductJS(product)).toBe('Laptop: $999');
  });

  it('formatProductTS should format product', () => {
    expect(formatProductTS(product)).toBe('Laptop: $999');
  });
});

describe('ObjectValidator', () => {
  it('should validate matching objects', () => {
    expect(userValidator.validate({ name: 'Alice', age: 30 })).toBe(true);
  });

  it('should reject objects with wrong types', () => {
    expect(userValidator.validate({ name: 'Alice', age: 'thirty' })).toBe(false);
  });

  it('should reject objects missing properties', () => {
    expect(userValidator.validate({ name: 'Alice' })).toBe(false);
  });

  it('assert should throw for invalid data', () => {
    expect(() => userValidator.assert({ name: 'Alice' })).toThrow(TypeError);
  });

  it('assert should not throw for valid data', () => {
    expect(() => userValidator.assert({ name: 'Alice', age: 30 })).not.toThrow();
  });
});

describe('processUser', () => {
  it('should return validated user data', () => {
    const data = { name: 'Alice', age: 30 };
    expect(processUser(data)).toEqual(data);
  });

  it('should throw for invalid data', () => {
    expect(() => processUser({ name: 'Alice' })).toThrow(TypeError);
  });
});
