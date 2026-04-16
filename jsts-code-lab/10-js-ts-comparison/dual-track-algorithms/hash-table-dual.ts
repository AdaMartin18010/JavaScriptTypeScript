/**
 * @file 双轨哈希表：JS 动态类型版 vs TS 泛型类型安全版
 * @category JS/TS Comparison → Dual-Track Algorithms
 */

// ============================================================================
// JS 版：动态类型，运行时检查
// ============================================================================

export class JsHashTable {
  private table: Map<string, { key: unknown; value: unknown }[]>;

  constructor() {
    this.table = new Map();
  }

  private _hash(key: unknown): string {
    if (key === null) return 'null';
    if (key === undefined) return 'undefined';
    if (typeof key === 'object') {
      const obj = key as { hashCode?: () => number };
      if (typeof obj.hashCode === 'function') {
        return `hash:${obj.hashCode()}`;
      }
      return `ref:${Math.random().toString(36).slice(2)}`;
    }
    return `${typeof key}:${String(key)}`;
  }

  private _equals(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a === 'object' && a !== null && typeof (a as { equals?: (o: unknown) => boolean }).equals === 'function') {
      return (a as { equals: (o: unknown) => boolean }).equals(b);
    }
    return false;
  }

  set(key: unknown, value: unknown): void {
    const hash = this._hash(key);
    if (!this.table.has(hash)) {
      this.table.set(hash, []);
    }
    const bucket = this.table.get(hash)!;
    for (const entry of bucket) {
      if (this._equals(entry.key, key)) {
        entry.value = value;
        return;
      }
    }
    bucket.push({ key, value });
  }

  get(key: unknown): unknown | undefined {
    const hash = this._hash(key);
    const bucket = this.table.get(hash);
    if (!bucket) return undefined;
    for (const entry of bucket) {
      if (this._equals(entry.key, key)) {
        return entry.value;
      }
    }
    return undefined;
  }

  has(key: unknown): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: unknown): boolean {
    const hash = this._hash(key);
    const bucket = this.table.get(hash);
    if (!bucket) return false;
    for (let i = 0; i < bucket.length; i++) {
      if (this._equals(bucket[i]!.key, key)) {
        bucket.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  size(): number {
    let count = 0;
    this.table.forEach((bucket) => {
      count += bucket.length;
    });
    return count;
  }
}

// ============================================================================
// TS 版：编译时类型安全，泛型约束
// ============================================================================

export interface Hashable {
  hashCode(): number;
  equals(other: unknown): boolean;
}

export class TsHashTable<K extends Hashable, V> {
  private table: Map<string, { key: K; value: V }[]>;

  constructor() {
    this.table = new Map();
  }

  private _hash(key: K): string {
    return `hash:${key.hashCode()}`;
  }

  set(key: K, value: V): void {
    const hash = this._hash(key);
    if (!this.table.has(hash)) {
      this.table.set(hash, []);
    }
    const bucket = this.table.get(hash)!;
    for (const entry of bucket) {
      if (entry.key.equals(key)) {
        entry.value = value;
        return;
      }
    }
    bucket.push({ key, value });
  }

  get(key: K): V | undefined {
    const hash = this._hash(key);
    const bucket = this.table.get(hash);
    if (!bucket) return undefined;
    for (const entry of bucket) {
      if (entry.key.equals(key)) {
        return entry.value;
      }
    }
    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    const hash = this._hash(key);
    const bucket = this.table.get(hash);
    if (!bucket) return false;
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i]!.key.equals(key)) {
        bucket.splice(i, 1);
        return true;
      }
    }
    return false;
  }

  size(): number {
    let count = 0;
    this.table.forEach((bucket) => {
      count += bucket.length;
    });
    return count;
  }
}
