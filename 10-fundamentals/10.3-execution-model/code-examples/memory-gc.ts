/**
 * @file 内存管理与垃圾回收
 * @category Execution Model → Memory & GC
 * @difficulty medium
 * @tags garbage-collection, memory-leak, WeakMap, WeakSet, circular-reference, closure
 */

// ============================================================================
// 1. 引用计数的局限性（循环引用）
// ============================================================================

function demonstrateCircularReference(): void {
  console.log("--- 1. 循环引用问题 ---");

  interface Node {
    name: string;
    next: Node | null;
    prev: Node | null;
  }

  // 创建循环引用
  const nodeA: Node = { name: "A", next: null, prev: null };
  const nodeB: Node = { name: "B", next: null, prev: null };

  nodeA.next = nodeB;
  nodeB.prev = nodeA;

  console.log("nodeA.next = nodeB, nodeB.prev = nodeA");
  console.log("循环引用导致引用计数无法归零");

  // 断开外部引用，但由于循环引用，引用计数法无法回收
  // 现代 JS 引擎使用标记-清除，可以处理这种情况
  console.log("但现代 JS 引擎的 mark-and-sweep 可以回收循环引用对象\n");
}

// ============================================================================
// 2. 标记-清除概念演示
// ============================================================================

/** 简化的标记-清除算法演示 */
class MarkAndSweepDemo {
  private objects = new Map<string, { id: string; refs: Set<string>; marked: boolean }>();
  private roots = new Set<string>();

  addObject(id: string, root = false): void {
    this.objects.set(id, { id, refs: new Set(), marked: false });
    if (root) this.roots.add(id);
  }

  addReference(from: string, to: string): void {
    this.objects.get(from)?.refs.add(to);
  }

  removeRoot(id: string): void {
    this.roots.delete(id);
  }

  /** 标记阶段 */
  mark(): void {
    const queue = [...this.roots];
    const visited = new Set<string>();

    for (const id of queue) {
      if (visited.has(id)) continue;
      visited.add(id);

      const obj = this.objects.get(id);
      if (obj) {
        obj.marked = true;
        for (const ref of obj.refs) {
          if (!visited.has(ref)) queue.push(ref);
        }
      }
    }
  }

  /** 清除阶段 */
  sweep(): string[] {
    const collected: string[] = [];
    for (const [id, obj] of this.objects) {
      if (!obj.marked) {
        collected.push(id);
        this.objects.delete(id);
      } else {
        obj.marked = false; // 重置标记
      }
    }
    return collected;
  }

  gc(): string[] {
    console.log("GC: 开始标记...");
    this.mark();
    console.log("GC: 开始清除...");
    const collected = this.sweep();
    console.log(`GC: 回收了 ${collected.length} 个对象: [${collected.join(", ")}]`);
    return collected;
  }

  status(): void {
    const all = [...this.objects.keys()];
    const marked = [...this.objects.values()].filter((o) => o.marked).map((o) => o.id);
    console.log(`存活对象: [${all.join(", ")}], 已标记: [${marked.join(", ")}]`);
  }
}

function demonstrateMarkAndSweep(): void {
  console.log("--- 2. 标记-清除算法演示 ---");

  const gc = new MarkAndSweepDemo();

  // root -> A -> B -> C (循环)
  //             -> D
  gc.addObject("root", true);
  gc.addObject("A");
  gc.addObject("B");
  gc.addObject("C");
  gc.addObject("D");
  gc.addObject("orphan"); // 孤立对象

  gc.addReference("root", "A");
  gc.addReference("A", "B");
  gc.addReference("B", "C");
  gc.addReference("C", "B"); // 循环引用 B <-> C
  gc.addReference("B", "D");

  gc.status();
  gc.gc();
  gc.status();
  console.log("循环引用 B<->C 因为被 root 可达，所以不会被回收");

  // 断开 root -> A
  gc.removeRoot("root");
  console.log("\n断开 root 引用后:");
  gc.gc();
  gc.status();
  console.log("");
}

// ============================================================================
// 3. WeakMap / WeakSet 用于非泄漏缓存
// ============================================================================

function demonstrateWeakMapCache(): void {
  console.log("--- 3. WeakMap/WeakSet 非泄漏缓存 ---");

  // 普通 Map：对象作为 key，即使对象不再被引用，Map 仍持有强引用
  const strongCache = new Map<object, string>();
  // WeakMap：对象作为 key，不阻止垃圾回收
  const weakCache = new WeakMap<object, string>();

  (function (): void {
    const obj = { id: 1 };
    strongCache.set(obj, "strong value");
    weakCache.set(obj, "weak value");
    console.log("函数内 obj 引用存在时:");
    console.log("  strongCache.size:", strongCache.size);
    console.log("  weakCache.has(obj):", weakCache.has(obj));
  })();

  // 强制触发 GC 不可行，但逻辑上 obj 已不再被引用
  console.log("函数执行完毕，obj 引用消失后:");
  console.log("  strongCache.size:", strongCache.size, "(仍持有引用，内存泄漏风险)");
  console.log("  weakCache: key 会被垃圾回收，不会泄漏");
}

function demonstrateWeakSet(): void {
  console.log("\n--- WeakSet 标记对象 ---");

  const processed = new WeakSet<object>();

  class Task {
    name: string;
    constructor(name: string) {
      this.name = name;
    }

    run(): void {
      if (processed.has(this)) {
        console.log(`Task ${this.name} 已处理过，跳过`);
        return;
      }
      processed.add(this);
      console.log(`Task ${this.name} 处理完成`);
    }
  }

  const t1 = new Task("A");
  t1.run();
  t1.run(); // 第二次跳过
  console.log("Task 实例被回收后，WeakSet 中的引用自动消失");
}

// ============================================================================
// 4. 内存泄漏模式
// ============================================================================

/** 反例 1: 闭包引用 DOM 元素 */
function counterExampleClosureDom(): void {
  console.log("\n--- Counter-example 1: 闭包引用 DOM 元素 ---");
  console.log(`
// ❌ 错误：闭包持有 DOM 引用
elements.forEach(el => {
  el.addEventListener('click', () => {
    console.log(el.id); // 闭包持有 el
  });
});
// 即使移除 DOM，事件监听器仍引用 el

// ✅ 正确：使用弱引用或及时移除
elements.forEach(el => {
  const handler = () => console.log(el.id);
  el.addEventListener('click', handler);
  el.addEventListener('remove', () => {
    el.removeEventListener('click', handler);
  });
});
  `);
}

/** 反例 2: 忘记移除事件监听器 */
function counterExampleEventListeners(): void {
  console.log("--- Counter-example 2: 忘记移除事件监听器 ---");
  console.log(`
// ❌ 错误：组件卸载时未移除监听器
class Component {
  constructor() {
    window.addEventListener('resize', this.handleResize);
  }
}
// Component 实例被丢弃，但事件监听器仍在

// ✅ 正确：提供销毁方法
class SafeComponent {
  private handleResize = () => { /* ... */ };

  constructor() {
    window.addEventListener('resize', this.handleResize);
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize);
  }
}
  `);
}

/** 反例 3: 全局变量累积 */
function counterExampleGlobalAccumulation(): void {
  console.log("--- Counter-example 3: 全局变量累积 ---");
  console.log(`
// ❌ 错误：全局数组无限增长
const cache = [];
function process(data) {
  cache.push(data); // 永远不会释放
}

// ✅ 正确：限制缓存大小或使用 LRU
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  set(key: K, value: V) {
    if (this.cache.size >= this.maxSize) {
      const first = this.cache.keys().next().value;
      this.cache.delete(first);
    }
    this.cache.set(key, value);
  }
}
  `);
}

/** 反例 4: 定时器未清理 */
function counterExampleTimers(): void {
  console.log("--- Counter-example 4: 定时器未清理 ---");
  console.log(`
// ❌ 错误：setInterval 未清除
setInterval(() => {
  fetch('/api/status');
}, 1000);
// 即使页面跳转/组件卸载，定时器仍在运行

// ✅ 正确：保存引用并清除
const intervalId = setInterval(() => { /* ... */ }, 1000);
// 清理时:
clearInterval(intervalId);
  `);
}

/** 反例 5: console.log 持有对象引用 */
function counterExampleConsoleLog(): void {
  console.log("--- Counter-example 5: console.log 持有引用 ---");
  console.log(`
// ❌ 注意：DevTools 的 console.log 可能阻止对象被回收
function process() {
  const bigData = new Array(1e6).fill('x');
  console.log(bigData); // DevTools 可能保留引用
}

// ✅ 在生产环境中避免大量 console.log
// 或使用 JSON.stringify 输出摘要
console.log(JSON.stringify(bigData.slice(0, 10)) + "...");
  `);
}

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Memory & GC Demo ===\n");

  demonstrateCircularReference();
  demonstrateMarkAndSweep();
  demonstrateWeakMapCache();
  demonstrateWeakSet();

  // 反例
  counterExampleClosureDom();
  counterExampleEventListeners();
  counterExampleGlobalAccumulation();
  counterExampleTimers();
  counterExampleConsoleLog();

  console.log("\n=== End of Memory & GC Demo ===\n");
}

export {
  MarkAndSweepDemo,
  demonstrateCircularReference,
  demonstrateMarkAndSweep,
  demonstrateWeakMapCache,
  demonstrateWeakSet,
};
