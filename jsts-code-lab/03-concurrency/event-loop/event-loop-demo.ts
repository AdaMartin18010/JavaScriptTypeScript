/**
 * @file 事件循环可视化
 * @category Concurrency → Event Loop
 * @difficulty medium
 * @tags event-loop, microtask, macrotask, v8
 */

// ============================================================================
// 1. 任务优先级演示
// ============================================================================

console.log('1. Sync start');

setTimeout(() => {
  console.log('2. setTimeout (macrotask)');
}, 0);

Promise.resolve().then(() => {
  console.log('3. Promise.then (microtask)');
});

queueMicrotask(() => {
  console.log('4. queueMicrotask (microtask)');
});

console.log('5. Sync end');

// 输出顺序: 1, 5, 3, 4, 2

// ============================================================================
// 2. 嵌套微任务
// ============================================================================

function nestedMicrotasks() {
  console.log('A');

  Promise.resolve().then(() => {
    console.log('B');
    Promise.resolve().then(() => {
      console.log('C');
    });
  });

  Promise.resolve().then(() => {
    console.log('D');
  });

  console.log('E');
}

// nestedMicrotasks();
// 输出: A, E, B, D, C

// ============================================================================
// 3. 宏任务与微任务混合
// ============================================================================

function mixedTasks() {
  console.log('1');

  setTimeout(() => { console.log('2'); }, 0);

  Promise.resolve().then(() => {
    console.log('3');
    setTimeout(() => { console.log('4'); }, 0);
    Promise.resolve().then(() => { console.log('5'); });
  });

  setTimeout(() => {
    console.log('6');
    Promise.resolve().then(() => { console.log('7'); });
  }, 0);

  console.log('8');
}

// mixedTasks();
// 输出: 1, 8, 3, 5, 2, 6, 7, 4

// ============================================================================
// 4. requestAnimationFrame vs setTimeout
// ============================================================================

function compareScheduling() {
  // 浏览器环境
  // requestAnimationFrame(() => console.log('rAF'));
  setTimeout(() => { console.log('setTimeout 0'); }, 0);
  setTimeout(() => { console.log('setTimeout 1'); }, 1);
  Promise.resolve().then(() => { console.log('microtask'); });

  // 顺序: microtask, setTimeout 0, setTimeout 1, rAF (下一帧)
}

// ============================================================================
// 5. 任务队列可视化
// ============================================================================

class EventLoopSimulator {
  private macrotasks: (() => void)[] = [];
  private microtasks: (() => void)[] = [];
  private log: string[] = [];

  setTimeout(fn: () => void, delay = 0): void {
    this.macrotasks.push(fn);
  }

  promiseThen(fn: () => void): void {
    this.microtasks.push(fn);
  }

  sync(code: () => void): void {
    code();
  }

  run(): string[] {
    // 执行所有微任务
    while (this.microtasks.length > 0) {
      const task = this.microtasks.shift()!;
      task();
      this.log.push('microtask executed');
    }

    // 执行一个宏任务
    if (this.macrotasks.length > 0) {
      const task = this.macrotasks.shift()!;
      task();
      this.log.push('macrotask executed');

      // 宏任务后再次检查微任务
      return this.run();
    }

    return this.log;
  }
}

// ============================================================================
// 6. nextTick (Node.js)
// ============================================================================

import { nextTick } from 'node:process';

function nodeNextTickDemo() {
  console.log('Start');

  setTimeout(() => { console.log('setTimeout'); }, 0);
  nextTick(() => { console.log('nextTick'); });
  Promise.resolve().then(() => { console.log('Promise'); });

  console.log('End');
  // 输出: Start, End, nextTick, Promise, setTimeout
}

// ============================================================================
// 7. 避免阻塞事件循环
// ============================================================================

function blockingExample() {
  // ❌ 阻塞操作
  const start = Date.now();
  while (Date.now() - start < 1000) {
    // 阻塞 1 秒
  }
  console.log('Done blocking');
}

function nonBlockingExample() {
  // ✅ 非阻塞操作
  setTimeout(() => {
    console.log('Done non-blocking');
  }, 1000);
}

// ============================================================================
// 8. setImmediate (Node.js)
// ============================================================================

import { setImmediate } from 'node:timers';

function setImmediateDemo() {
  console.log('1');

  setTimeout(() => { console.log('setTimeout'); }, 0);
  setImmediate(() => { console.log('setImmediate'); });
  nextTick(() => { console.log('nextTick'); });

  console.log('2');
  // 输出: 1, 2, nextTick, setTimeout/setImmediate (顺序不确定)
}

// ============================================================================
// 导出
// ============================================================================

export {
  nestedMicrotasks,
  mixedTasks,
  compareScheduling,
  EventLoopSimulator,
  nodeNextTickDemo,
  blockingExample,
  nonBlockingExample,
  setImmediateDemo
};

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Event Loop Demo ===");

  // 同步 vs 微任务 vs 宏任务
  console.log("\n1. Task Priority Demo:");
  console.log("   Expected order: Sync start, Sync end, Promise.then, queueMicrotask, setTimeout");
  
  console.log("   Sync start");
  setTimeout(() => {
    console.log("   setTimeout (macrotask)");
  }, 0);
  Promise.resolve().then(() => {
    console.log("   Promise.then (microtask)");
  });
  queueMicrotask(() => {
    console.log("   queueMicrotask (microtask)");
  });
  console.log("   Sync end");

  // 等待同步代码执行完
  await new Promise(resolve => setTimeout(resolve, 10));

  // 嵌套微任务
  console.log("\n2. Nested Microtasks Demo:");
  console.log("   Expected: A, E, B, D, C");
  console.log("   A");
  Promise.resolve().then(() => {
    console.log("   B");
    Promise.resolve().then(() => {
      console.log("   C");
    });
  });
  Promise.resolve().then(() => {
    console.log("   D");
  });
  console.log("   E");

  await new Promise(resolve => setTimeout(resolve, 10));

  // 事件循环模拟器
  console.log("\n3. Event Loop Simulator:");
  const simulator = new EventLoopSimulator();
  simulator.sync(() => { console.log("   Sync code"); });
  simulator.promiseThen(() => { console.log("   Microtask 1"); });
  simulator.setTimeout(() => { console.log("   Macrotask 1"); });
  simulator.promiseThen(() => { console.log("   Microtask 2"); });
  simulator.setTimeout(() => { console.log("   Macrotask 2"); });
  
  // Note: The simulator doesn't actually execute here
  // but we demonstrate the API
  console.log("   (EventLoopSimulator API demonstrated)");

  // 非阻塞示例
  console.log("\n4. Non-blocking Example:");
  console.log("   Starting non-blocking operation...");
  nonBlockingExample();
  console.log("   Non-blocking operation scheduled (check console in ~1s)");

  await new Promise(resolve => setTimeout(resolve, 0));

  console.log("\n=== End of Demo ===\n");
}
