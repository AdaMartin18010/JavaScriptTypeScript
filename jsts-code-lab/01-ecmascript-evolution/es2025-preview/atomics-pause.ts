/**
 * @file Atomics.pause 自旋锁示例 (ES2025 Preview)
 * @category ECMAScript Evolution → ES2025
 * @difficulty hard
 * @tags atomics, sharedarraybuffer, worker, spinlock, es2025
 * @description
 * 演示 ES2025 Atomics.pause 在高并发自旋锁中的性能优化效果。
 * 包含 SharedArrayBuffer、Worker Threads、有/无 pause 的性能对比。
 * @environment
 * 推荐使用 Node.js >= 22 并配合 tsx 运行：
 *   npx tsx jsts-code-lab/01-ecmascript-evolution/es2025-preview/atomics-pause.ts
 */

import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

// ES2025 类型补丁：Atomics.pause 尚未进入所有 TypeScript lib 定义
declare global {
  interface Atomics {
    pause(iterations?: number): void;
  }
}

const HAS_PAUSE = typeof (Atomics as unknown as Atomics).pause === 'function';

/** 若运行时支持，则调用 Atomics.pause 提示 CPU 降低流水线压力 */
function atomicsPause(iterations = 1): void {
  if (HAS_PAUSE) {
    (Atomics as unknown as Atomics).pause(iterations);
  }
}

interface SpinlockWorkerData {
  sab: SharedArrayBuffer;
  usePause: boolean;
  iterations: number;
  workerId: number;
}

/** 带 Atomics.pause 提示的自旋锁 */
export class Spinlock {
  private view: Int32Array;

  constructor(sab: SharedArrayBuffer) {
    this.view = new Int32Array(sab);
  }

  lock(): void {
    while (Atomics.compareExchange(this.view, 0, 0, 1) !== 0) {
      atomicsPause(1);
    }
  }

  unlock(): void {
    Atomics.store(this.view, 0, 0);
    Atomics.notify(this.view, 0, 1);
  }
}

/** 纯忙等待自旋锁（CPU 空转） */
export class SpinlockNoPause {
  private view: Int32Array;

  constructor(sab: SharedArrayBuffer) {
    this.view = new Int32Array(sab);
  }

  lock(): void {
    while (Atomics.compareExchange(this.view, 0, 0, 1) !== 0) {
      // busy-wait
    }
  }

  unlock(): void {
    Atomics.store(this.view, 0, 0);
    Atomics.notify(this.view, 0, 1);
  }
}

function workerRoutine(): void {
  const data = workerData as SpinlockWorkerData;
  const lock = data.usePause ? new Spinlock(data.sab) : new SpinlockNoPause(data.sab);
  const counter = new Int32Array(data.sab, 4, 1);

  for (let i = 0; i < data.iterations; i++) {
    lock.lock();
    Atomics.add(counter, 0, 1);
    lock.unlock();
  }

  parentPort!.postMessage('done');
}

/**
 * @complexity_analysis
 * - 时间: 主要消耗在 Worker 启动与锁竞争，单轮 lock/unlock 为 O(1)。
 * - 空间: O(workers × stack) + O(1) 共享内存。
 */
export function benchmarkSpinlock(options: {
  workers: number;
  iterations: number;
  usePause: boolean;
}): Promise<number> {
  return new Promise((resolve, reject) => {
    const sab = new SharedArrayBuffer(8); // 0: lock, 4: counter
    const lockView = new Int32Array(sab);
    Atomics.store(lockView, 0, 0);
    Atomics.store(lockView, 1, 0);

    const workers: Worker[] = [];
    let completed = 0;
    const start = process.hrtime.bigint();

    for (let i = 0; i < options.workers; i++) {
      const w = new Worker(new URL(import.meta.url), {
        workerData: {
          sab,
          usePause: options.usePause,
          iterations: options.iterations,
          workerId: i,
        } satisfies SpinlockWorkerData,
      });
      w.on('message', () => {
        completed++;
        if (completed === options.workers) {
          const end = process.hrtime.bigint();
          workers.forEach((w2) => w2.terminate());
          resolve(Number(end - start) / 1e6); // ms
        }
      });
      w.on('error', reject);
      workers.push(w);
    }
  });
}

/** 主线程入口：运行有/无 pause 的两组对比实验 */
export async function runSpinlockBenchmark(): Promise<void> {
  if (!isMainThread) return;

  console.log('=== Atomics.pause 自旋锁性能对比 ===\n');
  const workers = 4;
  const iterations = 50000;

  console.log(`配置: ${workers} 个 Worker, 每个加锁 ${iterations} 次\n`);

  const timeNoPause = await benchmarkSpinlock({ workers, iterations, usePause: false });
  console.log(`无 pause (忙等待): ${timeNoPause.toFixed(2)} ms`);

  if (!HAS_PAUSE) {
    console.log('当前运行时暂不支持 Atomics.pause，以下数据为等效逻辑（实际行为与无 pause 相同）');
  }
  const timeWithPause = await benchmarkSpinlock({ workers, iterations, usePause: true });
  console.log(`有 pause (提示自旋): ${timeWithPause.toFixed(2)} ms`);

  console.log(`\n结论: 在高竞争场景下，Atomics.pause 可显著降低 CPU 功耗与总线竞争。`);
}

// Worker 子线程入口
if (!isMainThread) {
  workerRoutine();
}
