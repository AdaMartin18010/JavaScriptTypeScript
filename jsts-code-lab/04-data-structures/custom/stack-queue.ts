/**
 * @file 栈与队列
 * @category Data Structures → Custom
 * @difficulty easy
 * @tags stack, queue, data-structure
 */

// ============================================================================
// 1. 栈 (LIFO - Last In First Out)
// ============================================================================

export class Stack<T> {
  private items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }

  toArray(): T[] {
    return [...this.items];
  }
}

// ============================================================================
// 2. 队列 (FIFO - First In First Out)
// ============================================================================

export class Queue<T> {
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);
  }

  dequeue(): T | undefined {
    return this.items.shift();
  }

  front(): T | undefined {
    return this.items[0];
  }

  rear(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }

  clear(): void {
    this.items = [];
  }
}

// ============================================================================
// 3. 双端队列 (Deque)
// ============================================================================

export class Deque<T> {
  private items: T[] = [];

  addFront(item: T): void {
    this.items.unshift(item);
  }

  addRear(item: T): void {
    this.items.push(item);
  }

  removeFront(): T | undefined {
    return this.items.shift();
  }

  removeRear(): T | undefined {
    return this.items.pop();
  }

  peekFront(): T | undefined {
    return this.items[0];
  }

  peekRear(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

// ============================================================================
// 4. 优先队列
// ============================================================================

interface PriorityItem<T> {
  item: T;
  priority: number;
}

export class PriorityQueue<T> {
  private items: PriorityItem<T>[] = [];

  enqueue(item: T, priority: number): void {
    const element: PriorityItem<T> = { item, priority };
    
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (priority < this.items[i].priority) {
        this.items.splice(i, 0, element);
        added = true;
        break;
      }
    }
    
    if (!added) {
      this.items.push(element);
    }
  }

  dequeue(): T | undefined {
    return this.items.shift()?.item;
  }

  peek(): T | undefined {
    return this.items[0]?.item;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}

// ============================================================================
// 5. 循环队列
// ============================================================================

export class CircularQueue<T> {
  private items: (T | undefined)[];
  private head = 0;
  private tail = 0;
  private count = 0;

  constructor(private capacity: number) {
    this.items = new Array(capacity);
  }

  enqueue(item: T): boolean {
    if (this.isFull()) return false;
    
    this.items[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this.count++;
    return true;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    
    const item = this.items[this.head];
    this.items[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this.count--;
    return item;
  }

  peek(): T | undefined {
    return this.items[this.head];
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  isFull(): boolean {
    return this.count === this.capacity;
  }

  size(): number {
    return this.count;
  }
}

// ============================================================================
// 6. 应用：括号匹配
// ============================================================================

export function isBalancedBrackets(str: string): boolean {
  const stack = new Stack<string>();
  const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
  
  for (const char of str) {
    if (['(', '[', '{'].includes(char)) {
      stack.push(char);
    } else if ([')', ']', '}'].includes(char)) {
      if (stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }
  
  return stack.isEmpty();
}

// ============================================================================
// 导出
// ============================================================================

export { isBalancedBrackets };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Stack & Queue Demo ===");
  
  // 栈
  const stack = new Stack<number>();
  stack.push(1);
  stack.push(2);
  stack.push(3);
  console.log("Stack peek:", stack.peek());
  console.log("Stack pop:", stack.pop());
  console.log("Stack size:", stack.size());
  console.log("Stack to array:", stack.toArray());
  
  // 队列
  const queue = new Queue<string>();
  queue.enqueue("first");
  queue.enqueue("second");
  queue.enqueue("third");
  console.log("\nQueue front:", queue.front());
  console.log("Queue dequeue:", queue.dequeue());
  console.log("Queue size:", queue.size());
  
  // 双端队列
  const deque = new Deque<number>();
  deque.addFront(1);
  deque.addRear(2);
  deque.addFront(0);
  console.log("\nDeque:", deque.peekFront(), "...", deque.peekRear());
  
  // 优先队列
  const pq = new PriorityQueue<string>();
  pq.enqueue("low", 3);
  pq.enqueue("high", 1);
  pq.enqueue("medium", 2);
  console.log("\nPriority queue dequeue order:");
  while (!pq.isEmpty()) {
    console.log(" -", pq.dequeue());
  }
  
  // 括号匹配
  console.log("\nBrackets '([])':", isBalancedBrackets("([])"));
  console.log("Brackets '([)]':", isBalancedBrackets("([)]"));
  
  console.log("=== End of Demo ===\n");
}
