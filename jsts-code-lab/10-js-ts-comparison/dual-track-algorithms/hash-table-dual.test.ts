import { describe, it, expect } from 'vitest';
import { JsHashTable, TsHashTable } from './hash-table-dual.js';

class HashableKey {
  constructor(
    private id: number,
    private label: string,
  ) {}

  hashCode(): number {
    return this.id;
  }

  equals(other: unknown): boolean {
    return other instanceof HashableKey && other.id === this.id && other.label === this.label;
  }
}

describe('JsHashTable', () => {
  it('should set and get primitive keys', () => {
    const table = new JsHashTable();
    table.set('name', 'Alice');
    table.set(42, 'answer');
    expect(table.get('name')).toBe('Alice');
    expect(table.get(42)).toBe('answer');
  });

  it('should update existing keys', () => {
    const table = new JsHashTable();
    table.set('key', 1);
    table.set('key', 2);
    expect(table.get('key')).toBe(2);
  });

  it('should check has and delete', () => {
    const table = new JsHashTable();
    table.set('a', 1);
    expect(table.has('a')).toBe(true);
    expect(table.delete('a')).toBe(true);
    expect(table.has('a')).toBe(false);
  });
});

describe('TsHashTable', () => {
  it('should set and get hashable keys', () => {
    const table = new TsHashTable<HashableKey, string>();
    const k1 = new HashableKey(1, 'a');
    table.set(k1, 'value1');
    expect(table.get(k1)).toBe('value1');
  });

  it('should distinguish keys with same hashCode but different equals', () => {
    const table = new TsHashTable<HashableKey, string>();
    const k1 = new HashableKey(1, 'a');
    const k2 = new HashableKey(1, 'b');
    table.set(k1, 'v1');
    table.set(k2, 'v2');
    expect(table.get(k1)).toBe('v1');
    expect(table.get(k2)).toBe('v2');
  });
});

describe('JsHashTable vs TsHashTable equivalence', () => {
  it('should produce the same runtime behavior for hashable objects', () => {
    const jsTable = new JsHashTable();
    const tsTable = new TsHashTable<HashableKey, number>();

    const keys = [new HashableKey(1, 'x'), new HashableKey(2, 'y'), new HashableKey(1, 'z')];

    for (let i = 0; i < keys.length; i++) {
      jsTable.set(keys[i], i * 10);
      tsTable.set(keys[i], i * 10);
    }

    for (let i = 0; i < keys.length; i++) {
      expect(jsTable.get(keys[i])).toBe(tsTable.get(keys[i]));
    }

    expect(jsTable.size()).toBe(tsTable.size());
  });
});
