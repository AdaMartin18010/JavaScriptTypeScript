/**
 * @file 链表实现
 * @category Data Structures → Custom
 * @difficulty medium
 * @tags linked-list, data-structure, algorithm
 */

// ============================================================================
// 1. 节点定义
// ============================================================================

class ListNode<T> {
  value: T;
  next: ListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// ============================================================================
// 2. 单向链表
// ============================================================================

export class LinkedList<T> {
  private head: ListNode<T> | null = null;
  private tail: ListNode<T> | null = null;
  private length = 0;

  // 尾部添加 O(1)
  append(value: T): this {
    const node = new ListNode(value);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      this.tail!.next = node;
      this.tail = node;
    }

    this.length++;
    return this;
  }

  // 头部添加 O(1)
  prepend(value: T): this {
    const node = new ListNode(value);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head = node;
    }

    this.length++;
    return this;
  }

  // 查找 O(n)
  find(predicate: (value: T) => boolean): T | undefined {
    let current = this.head;

    while (current) {
      if (predicate(current.value)) {
        return current.value;
      }
      current = current.next;
    }

    return undefined;
  }

  // 删除 O(n)
  delete(value: T): boolean {
    if (!this.head) return false;

    if (this.head.value === value) {
      this.head = this.head.next;
      if (!this.head) this.tail = null;
      this.length--;
      return true;
    }

    let current = this.head;
    while (current.next) {
      if (current.next.value === value) {
        current.next = current.next.next;
        if (!current.next) this.tail = current;
        this.length--;
        return true;
      }
      current = current.next;
    }

    return false;
  }

  // 转换为数组
  toArray(): T[] {
    const result: T[] = [];
    let current = this.head;

    while (current) {
      result.push(current.value);
      current = current.next;
    }

    return result;
  }

  get size(): number {
    return this.length;
  }

  // 迭代器
  *[Symbol.iterator](): Generator<T> {
    let current = this.head;
    while (current) {
      yield current.value;
      current = current.next;
    }
  }
}

// ============================================================================
// 3. 双向链表节点
// ============================================================================

class DoublyListNode<T> {
  value: T;
  next: DoublyListNode<T> | null = null;
  prev: DoublyListNode<T> | null = null;

  constructor(value: T) {
    this.value = value;
  }
}

// ============================================================================
// 4. 双向链表
// ============================================================================

export class DoublyLinkedList<T> {
  private head: DoublyListNode<T> | null = null;
  private tail: DoublyListNode<T> | null = null;
  private length = 0;

  append(value: T): this {
    const node = new DoublyListNode(value);

    if (!this.tail) {
      this.head = this.tail = node;
    } else {
      node.prev = this.tail;
      this.tail.next = node;
      this.tail = node;
    }

    this.length++;
    return this;
  }

  prepend(value: T): this {
    const node = new DoublyListNode(value);

    if (!this.head) {
      this.head = this.tail = node;
    } else {
      node.next = this.head;
      this.head.prev = node;
      this.head = node;
    }

    this.length++;
    return this;
  }

  // 从尾部遍历
  *reverse(): Generator<T> {
    let current = this.tail;
    while (current) {
      yield current.value;
      current = current.prev;
    }
  }

  get size(): number {
    return this.length;
  }
}

// ============================================================================
// 5. 经典算法：反转链表
// ============================================================================

function reverseLinkedList<T>(head: ListNode<T> | null): ListNode<T> | null {
  let prev: ListNode<T> | null = null;
  let current = head;

  while (current) {
    const next = current.next;
    current.next = prev;
    prev = current;
    current = next;
  }

  return prev;
}

// ============================================================================
// 6. 经典算法：检测环
// ============================================================================

function hasCycle<T>(head: ListNode<T> | null): boolean {
  let slow = head;
  let fast = head;

  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;

    if (slow === fast) {
      return true; // 相遇，有环
    }
  }

  return false;
}

// ============================================================================
// 导出
// ============================================================================

export { ListNode, DoublyListNode, reverseLinkedList, hasCycle };
// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Linked List Demo ===");
  
  // 单向链表
  const list = new LinkedList<number>();
  list.append(1).append(2).append(3);
  list.prepend(0);
  console.log("List:", list.toArray());
  console.log("Size:", list.size);
  
  const found = list.find(x => x === 2);
  console.log("Found 2:", found);
  
  list.delete(2);
  console.log("After delete 2:", list.toArray());
  
  // 双向链表
  const dlist = new DoublyLinkedList<string>();
  dlist.append("a").append("b").append("c");
  console.log("\nDoubly linked list forward:", [...dlist]);
  console.log("Doubly linked list reverse:", [...dlist.reverse()]);
  
  // 反转链表
  const head = new ListNode(1);
  head.next = new ListNode(2);
  head.next.next = new ListNode(3);
  const reversed = reverseLinkedList(head);
  console.log("\nReversed list head:", reversed?.value);
  
  console.log("=== End of Demo ===\n");
}
