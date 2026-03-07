/**
 * @file 迭代器模式 (Iterator Pattern)
 * @category Design Patterns → Behavioral
 * @difficulty easy
 * @tags iterator, behavioral, traversal, collection
 * 
 * @description
 * 提供一种方法顺序访问一个聚合对象中的各个元素
 */

// ============================================================================
// 1. 迭代器接口
// ============================================================================

interface Iterator<T> {
  current(): T;
  next(): T;
  hasNext(): boolean;
  reset(): void;
}

// ============================================================================
// 2. 具体迭代器
// ============================================================================

class ArrayIterator<T> implements Iterator<T> {
  private index = 0;

  constructor(private collection: T[]) {}

  current(): T {
    return this.collection[this.index];
  }

  next(): T {
    const item = this.collection[this.index];
    this.index++;
    return item;
  }

  hasNext(): boolean {
    return this.index < this.collection.length;
  }

  reset(): void {
    this.index = 0;
  }
}

// ============================================================================
// 3. 集合接口
// ============================================================================

interface IterableCollection<T> {
  createIterator(): Iterator<T>;
  createReverseIterator(): Iterator<T>;
}

// ============================================================================
// 4. 具体集合
// ============================================================================

class WordsCollection implements IterableCollection<string> {
  private items: string[] = [];

  addItem(item: string): void {
    this.items.push(item);
  }

  getItems(): string[] {
    return [...this.items];
  }

  createIterator(): Iterator<string> {
    return new ArrayIterator(this.items);
  }

  createReverseIterator(): Iterator<string> {
    return new ArrayIterator([...this.items].reverse());
  }
}

// ============================================================================
// 5. 二叉树迭代器
// ============================================================================

class TreeNode<T> {
  value: T;
  left?: TreeNode<T>;
  right?: TreeNode<T>;

  constructor(value: T) {
    this.value = value;
  }
}

class InOrderIterator<T> implements Iterator<T> {
  private stack: TreeNode<T>[] = [];
  private currentNode?: TreeNode<T>;

  constructor(root?: TreeNode<T>) {
    this.currentNode = root;
    this.pushLeftBranch(root);
  }

  private pushLeftBranch(node?: TreeNode<T>): void {
    while (node) {
      this.stack.push(node);
      node = node.left;
    }
  }

  current(): T {
    return this.stack[this.stack.length - 1].value;
  }

  next(): T {
    const node = this.stack.pop()!;
    const value = node.value;
    
    if (node.right) {
      this.pushLeftBranch(node.right);
    }
    
    return value;
  }

  hasNext(): boolean {
    return this.stack.length > 0;
  }

  reset(): void {
    this.stack = [];
  }
}

// ============================================================================
// 6. 使用 JavaScript 内置迭代器
// ============================================================================

class SocialNetwork implements Iterable<string> {
  private profiles: Map<string, string[]> = new Map();

  addProfile(id: string, friends: string[]): void {
    this.profiles.set(id, friends);
  }

  getFriends(id: string): string[] {
    return this.profiles.get(id) || [];
  }

  // 实现 Symbol.iterator
  *[Symbol.iterator](): Generator<string> {
    for (const [id, friends] of this.profiles) {
      yield* friends;
    }
  }

  // 创建迭代器
  createFriendsIterator(profileId: string): Iterator<string> {
    const friends = this.getFriends(profileId);
    return new ArrayIterator(friends);
  }

  // 创建广度优先搜索迭代器
  createBfsIterator(startId: string): Iterator<string> {
    const visited = new Set<string>();
    const queue: string[] = [startId];
    const self = this;

    return {
      current(): string {
        return queue[0];
      },
      next(): string {
        const id = queue.shift()!;
        visited.add(id);
        
        for (const friend of self.getFriends(id)) {
          if (!visited.has(friend)) {
            queue.push(friend);
          }
        }
        
        return id;
      },
      hasNext(): boolean {
        return queue.length > 0;
      },
      reset(): void {
        queue.length = 0;
        queue.push(startId);
        visited.clear();
      }
    };
  }
}

// ============================================================================
// 7. 异步迭代器
// ============================================================================

class AsyncDataSource implements AsyncIterable<number> {
  async *[Symbol.asyncIterator](): AsyncGenerator<number> {
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      yield i;
    }
  }
}

// ============================================================================
// 导出
// ============================================================================

export {
  ArrayIterator,
  WordsCollection,
  TreeNode,
  InOrderIterator,
  SocialNetwork,
  AsyncDataSource
};

export type { Iterator, IterableCollection };
