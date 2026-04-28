/**
 * @file 双轨图结构：JS 动态类型版 vs TS 泛型类型安全版
 * @category JS/TS Comparison → Dual-Track Algorithms
 */

// ============================================================================
// JS 版：动态类型，运行时无检查
// ============================================================================

export class JsGraph {
  private adjacency: Map<unknown, { to: unknown; edge: unknown }[]>;

  constructor() {
    this.adjacency = new Map();
  }

  addVertex(v: unknown): void {
    if (!this.adjacency.has(v)) {
      this.adjacency.set(v, []);
    }
  }

  addEdge(from: unknown, to: unknown, edge: unknown = { weight: 1 }): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacency.get(from)!.push({ to, edge });
  }

  getNeighbors(v: unknown): { to: unknown; edge: unknown }[] | undefined {
    return this.adjacency.has(v) ? [...this.adjacency.get(v)!] : undefined;
  }

  hasVertex(v: unknown): boolean {
    return this.adjacency.has(v);
  }

  bfs(start: unknown, target: unknown): boolean {
    if (!this.adjacency.has(start) || !this.adjacency.has(target)) return false;
    const visited = new Set<unknown>();
    const queue: unknown[] = [start];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === target) return true;
      for (const { to } of this.adjacency.get(current) || []) {
        if (!visited.has(to)) {
          visited.add(to);
          queue.push(to);
        }
      }
    }
    return false;
  }

  dfs(start: unknown, target: unknown): boolean {
    if (!this.adjacency.has(start) || !this.adjacency.has(target)) return false;
    const visited = new Set<unknown>();
    const stack: unknown[] = [start];
    visited.add(start);

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === target) return true;
      for (const { to } of this.adjacency.get(current) || []) {
        if (!visited.has(to)) {
          visited.add(to);
          stack.push(to);
        }
      }
    }
    return false;
  }
}

// ============================================================================
// TS 版：泛型约束，编译时类型安全
// ============================================================================

export class TsGraph<V, E extends { weight: number }> {
  private adjacency: Map<V, { to: V; edge: E }[]>;

  constructor() {
    this.adjacency = new Map();
  }

  addVertex(v: V): void {
    if (!this.adjacency.has(v)) {
      this.adjacency.set(v, []);
    }
  }

  addEdge(from: V, to: V, edge: E): void {
    this.addVertex(from);
    this.addVertex(to);
    this.adjacency.get(from)!.push({ to, edge });
  }

  getNeighbors(v: V): { to: V; edge: E }[] | undefined {
    return this.adjacency.has(v) ? [...this.adjacency.get(v)!] : undefined;
  }

  hasVertex(v: V): boolean {
    return this.adjacency.has(v);
  }

  bfs(start: V, target: V): boolean {
    if (!this.adjacency.has(start) || !this.adjacency.has(target)) return false;
    const visited = new Set<V>();
    const queue: V[] = [start];
    visited.add(start);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === target) return true;
      for (const { to } of this.adjacency.get(current) || []) {
        if (!visited.has(to)) {
          visited.add(to);
          queue.push(to);
        }
      }
    }
    return false;
  }

  dfs(start: V, target: V): boolean {
    if (!this.adjacency.has(start) || !this.adjacency.has(target)) return false;
    const visited = new Set<V>();
    const stack: V[] = [start];
    visited.add(start);

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === target) return true;
      for (const { to } of this.adjacency.get(current) || []) {
        if (!visited.has(to)) {
          visited.add(to);
          stack.push(to);
        }
      }
    }
    return false;
  }
}
