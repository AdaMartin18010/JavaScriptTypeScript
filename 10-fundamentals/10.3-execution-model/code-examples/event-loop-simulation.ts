/**
 * @file 事件循环模拟器
 * @category Execution Model → Event Loop
 * @difficulty hard
 * @tags event-loop, macro-task, micro-task, setTimeout, Promise, queueMicrotask
 */

// ============================================================================
// 简化的事件循环模拟器
// ============================================================================

type TaskType = "macro" | "micro" | "render";

interface Task {
  id: number;
  type: TaskType;
  name: string;
  fn: () => void;
  delay?: number;
}

class EventLoopSimulator {
  private macroTaskQueue: Task[] = [];
  private microTaskQueue: Task[] = [];
  private renderQueue: Task[] = [];
  private taskId = 0;
  private running = false;

  /** 添加宏任务 */
  queueMacroTask(name: string, fn: () => void, delay = 0): void {
    this.macroTaskQueue.push({
      id: ++this.taskId,
      type: "macro",
      name,
      fn,
      delay,
    });
    this.macroTaskQueue.sort((a, b) => (a.delay ?? 0) - (b.delay ?? 0));
    console.log(`[Scheduler] 宏任务入队: ${name} (delay: ${delay}ms)`);
  }

  /** 添加微任务 */
  queueMicroTask(name: string, fn: () => void): void {
    this.microTaskQueue.push({
      id: ++this.taskId,
      type: "micro",
      name,
      fn,
    });
    console.log(`[Scheduler] 微任务入队: ${name}`);
  }

  /** 添加渲染任务 */
  queueRenderTask(name: string, fn: () => void): void {
    this.renderQueue.push({
      id: ++this.taskId,
      type: "render",
      name,
      fn,
    });
    console.log(`[Scheduler] 渲染任务入队: ${name}`);
  }

  /** 执行一轮事件循环 */
  async tick(): Promise<void> {
    console.log("\n--- Event Loop Tick ---");

    // 1. 执行一个宏任务
    const macro = this.macroTaskQueue.shift();
    if (macro) {
      console.log(`[Execute] 宏任务: ${macro.name}`);
      macro.fn();
    }

    // 2. 清空所有微任务
    while (this.microTaskQueue.length > 0) {
      const micro = this.microTaskQueue.shift()!;
      console.log(`[Execute] 微任务: ${micro.name}`);
      micro.fn();
    }

    // 3. 渲染阶段
    if (this.renderQueue.length > 0) {
      console.log("[Execute] 渲染阶段");
      while (this.renderQueue.length > 0) {
        const render = this.renderQueue.shift()!;
        render.fn();
      }
    }
  }

  /** 运行模拟直到队列为空 */
  async run(): Promise<void> {
    while (this.macroTaskQueue.length > 0 || this.microTaskQueue.length > 0) {
      await this.tick();
    }
    console.log("\n[Event Loop] 所有任务执行完毕");
  }

  get pendingMacro(): number { return this.macroTaskQueue.length; }
  get pendingMicro(): number { return this.microTaskQueue.length; }
}

// ============================================================================
// 真实浏览器/Node.js 事件循环演示
// ============================================================================

async function demonstrateTaskOrdering(): Promise<void> {
  console.log("=== 真实事件循环任务顺序演示 ===\n");

  return new Promise((resolve) => {
    const logs: string[] = [];

    function log(msg: string): void {
      logs.push(msg);
      console.log(msg);
    }

    log("1. 同步代码开始");

    setTimeout(() => log("5. setTimeout (macro)"), 0);
    setTimeout(() => log("6. setTimeout 第二个 (macro)"), 0);

    Promise.resolve().then(() => {
      log("3. Promise.then (micro)");
      Promise.resolve().then(() => log("4. 嵌套 Promise (micro)"));
    });

    queueMicrotask(() => log("3.5 queueMicrotask (micro)"));

    log("2. 同步代码结束");

    setTimeout(() => {
      log("7. 最后检查");
      resolve();
    }, 50);
  });
}

async function demonstrateNestedMicrotasks(): Promise<void> {
  console.log("\n=== 微任务嵌套演示 ===\n");

  const logs: string[] = [];

  Promise.resolve().then(() => {
    logs.push("micro 1");
    Promise.resolve().then(() => {
      logs.push("micro 1-1");
      Promise.resolve().then(() => {
        logs.push("micro 1-1-1");
      });
    });
  });

  Promise.resolve().then(() => {
    logs.push("micro 2");
  });

  await new Promise((r) => setTimeout(r, 10));
  console.log("执行顺序:", logs.join(" → "));
}

// ============================================================================
// 反例 (Counter-examples)
// ============================================================================

/** 反例 1: setTimeout 不保证精确时间 */
function counterExample1(): void {
  console.log("\n--- Counter-example 1: setTimeout 不保证精确时间 ---");
  const start = Date.now();
  setTimeout(() => {
    const actual = Date.now() - start;
    console.log(`期望延迟: 0ms, 实际延迟: ${actual}ms (可能 > 0)`);
  }, 0);
}

/** 反例 2: 微任务饥饿 */
function counterExample2(): Promise<void> {
  console.log("\n--- Counter-example 2: 微任务饥饿 ---");
  return new Promise((resolve) => {
    let count = 0;
    function queueNext(): void {
      if (count++ < 3) {
        console.log(`微任务 ${count} 执行`);
        Promise.resolve().then(queueNext);
      } else {
        console.log("宏任务被延迟，因为微任务队列一直在填充");
        resolve();
      }
    }
    Promise.resolve().then(queueNext);

    setTimeout(() => {
      console.log("这个宏任务被延迟到所有微任务之后");
    }, 0);
  });
}

/** 反例 3: Promise 中的同步错误 */
function counterExample3(): void {
  console.log("\n--- Counter-example 3: Promise 构造函数中的同步错误 ---");
  // 创建被拒绝的 Promise 但不处理它
  const unhandled = new Promise((_resolve, reject) => {
    reject(new Error("异步拒绝"));
  });
  // 即使包裹在 try/catch 中也无法捕获，因为 Promise 内部已捕获并转为拒绝态
  console.log("try/catch 无法捕获 Promise 的异步拒绝");
  console.log("需要 .catch() 或 try/catch + await");

  // 清理：附加 catch 避免未处理拒绝
  unhandled.catch(() => {
    // 已处理，静默忽略
  });

  // 正确做法
  new Promise((_resolve, reject) => {
    reject(new Error("正确处理"));
  }).catch((err) => {
    console.log(".catch() 捕获:", (err as Error).message);
  });
}

// ============================================================================
// Demo 函数
// ============================================================================

export async function demo(): Promise<void> {
  console.log("=== Event Loop Simulation Demo ===\n");

  // 使用模拟器
  console.log("--- 1. 简化事件循环模拟器 ---");
  const simulator = new EventLoopSimulator();

  simulator.queueMacroTask("setTimeout A", () => console.log("执行: setTimeout A"), 0);
  simulator.queueMacroTask("setTimeout B", () => console.log("执行: setTimeout B"), 0);
  simulator.queueMicroTask("Promise 1", () => console.log("执行: Promise 1"));
  simulator.queueMicroTask("Promise 2", () => console.log("执行: Promise 2"));
  simulator.queueRenderTask("Render", () => console.log("执行: 渲染更新"));

  await simulator.run();

  // 真实演示
  await demonstrateTaskOrdering();
  await demonstrateNestedMicrotasks();

  // 反例
  counterExample1();
  await new Promise((r) => setTimeout(r, 20));
  await counterExample2();
  counterExample3();

  console.log("\n=== End of Event Loop Demo ===\n");
}

export {
  EventLoopSimulator,
  demonstrateTaskOrdering,
  demonstrateNestedMicrotasks,
};
