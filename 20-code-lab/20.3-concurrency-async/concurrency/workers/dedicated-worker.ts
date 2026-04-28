/**
 * @file Dedicated Web Worker
 * @category Concurrency → Workers
 * @difficulty medium
 * @tags worker, web-worker, parallel-processing
 */

// ============================================================================
// 1. Worker 线程代码 (通常放在单独文件中)
// ============================================================================

const workerScript = `
// 在 Worker 内部
self.onmessage = function(event) {
  const { type, data, id } = event.data;
  
  if (type === 'CALCULATE') {
    // 执行耗时计算
    const result = performHeavyCalculation(data);
    self.postMessage({ id, result });
  }
};

function performHeavyCalculation(data) {
  // 模拟耗时计算
  let sum = 0;
  for (let i = 0; i < data.iterations; i++) {
    sum += Math.sqrt(i);
  }
  return sum;
}
`;

// ============================================================================
// 2. Worker 管理器
// ============================================================================

interface WorkerTask {
  id: string;
  type: string;
  data: unknown;
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}

export class WorkerPool {
  private workers: Worker[] = [];
  private queue: WorkerTask[] = [];
  private activeTasks = new Map<string, WorkerTask>();
  private taskId = 0;

  constructor(workerScript: string | URL, private poolSize = navigator.hardwareConcurrency || 4) {
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript, { type: 'module' });
      worker.onmessage = (e) => { this.handleMessage(e.data); };
      worker.onerror = (e) => { this.handleError(e); };
      this.workers.push(worker);
    }
  }

  private getAvailableWorker(): Worker | null {
    for (const worker of this.workers) {
      const isBusy = false;
      for (const task of this.activeTasks.values()) {
        // 简化处理，实际应该有更精确的跟踪
      }
      if (!isBusy) return worker;
    }
    return this.workers[0]; // 返回第一个，实际应该负载均衡
  }

  execute(type: string, data: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = `task-${++this.taskId}`;
      const task: WorkerTask = { id, type, data, resolve, reject };
      
      const worker = this.getAvailableWorker();
      if (worker) {
        this.activeTasks.set(id, task);
        worker.postMessage({ type, data, id });
      } else {
        this.queue.push(task);
      }
    });
  }

  private handleMessage(data: { id: string; result: unknown; error?: string }): void {
    const task = this.activeTasks.get(data.id);
    if (task) {
      this.activeTasks.delete(data.id);
      if (data.error) {
        task.reject(new Error(data.error));
      } else {
        task.resolve(data.result);
      }
      this.processQueue();
    }
  }

  private handleError(error: ErrorEvent): void {
    console.error('Worker error:', error);
  }

  private processQueue(): void {
    if (this.queue.length === 0) return;
    
    const task = this.queue.shift()!;
    const worker = this.getAvailableWorker();
    if (worker) {
      this.activeTasks.set(task.id, task);
      worker.postMessage({ type: task.type, data: task.data, id: task.id });
    } else {
      this.queue.unshift(task);
    }
  }

  terminate(): void {
    for (const worker of this.workers) {
      worker.terminate();
    }
    this.workers = [];
  }
}

// ============================================================================
// 3. 实际 Worker 文件内容 (用于内联 Worker)
// ============================================================================

export function createInlineWorker(fn: () => void): Worker {
  const blob = new Blob([`(${fn.toString})()`], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob));
}

// ============================================================================
// 4. 大数组处理示例
// ============================================================================

export class ArrayProcessor {
  private worker: Worker;

  constructor() {
    const workerCode = `
      self.onmessage = function(e) {
        const { array, operation } = e.data;
        let result;
        
        switch(operation) {
          case 'sum':
            result = array.reduce((a, b) => a + b, 0);
            break;
          case 'max':
            result = Math.max(...array);
            break;
          case 'map':
            result = array.map(x => x * 2);
            break;
          case 'filter':
            result = array.filter(x => x > 50);
            break;
          default:
            result = array;
        }
        
        self.postMessage(result);
      };
    `;
    
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    this.worker = new Worker(URL.createObjectURL(blob));
  }

  process(array: number[], operation: string): Promise<unknown> {
    return new Promise((resolve) => {
      this.worker.onmessage = (e) => { resolve(e.data); };
      this.worker.postMessage({ array, operation });
    });
  }

  terminate(): void {
    this.worker.terminate();
  }
}

// ============================================================================
// 5. 并行映射
// ============================================================================

export async function parallelMap<T, R>(
  items: T[],
  mapper: (item: T) => R,
  workerCount = 4
): Promise<R[]> {
  const chunkSize = Math.ceil(items.length / workerCount);
  const chunks: T[][] = [];

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  const workerCode = `
    self.onmessage = function(e) {
      const { chunk, mapperString } = e.data;
      const mapper = eval('(' + mapperString + ')');
      const result = chunk.map(mapper);
      self.postMessage(result);
    };
  `;

  const blob = new Blob([workerCode], { type: 'application/javascript' });
  const workers = chunks.map(() => new Worker(URL.createObjectURL(blob)));

  const promises = chunks.map((chunk, i) =>
    new Promise<R[]>((resolve) => {
      workers[i].onmessage = (e) => { resolve(e.data); };
      workers[i].postMessage({ chunk, mapperString: mapper.toString() });
    })
  );

  const results = await Promise.all(promises);
  workers.forEach(w => { w.terminate(); });

  return results.flat();
}

// ============================================================================
// 导出
// ============================================================================

export { workerScript };

// ============================================================================
// Demo 函数
// ============================================================================

export function demo(): void {
  console.log("=== Web Workers Demo ===");

  // 注意：Web Workers 需要浏览器环境，这里仅演示 API

  console.log("\n1. Worker Script Example:");
  console.log("   The workerScript constant contains:");
  console.log("   " + workerScript.substring(0, 100) + "...");

  // ArrayProcessor 演示 (需要浏览器环境)
  console.log("\n2. ArrayProcessor API:");
  console.log("   const processor = new ArrayProcessor();");
  console.log("   processor.process([1,2,3,4,5], 'sum')");
  console.log("   processor.process([1,2,3,4,5], 'max')");
  console.log("   processor.process([1,2,3,4,5], 'map') // x * 2");
  console.log("   processor.process([1,2,3,4,5], 'filter') // x > 50");

  // WorkerPool API 演示
  console.log("\n3. WorkerPool API:");
  console.log("   const pool = new WorkerPool('worker.js', 4);");
  console.log("   const result = await pool.execute('CALCULATE', { iterations: 1000000 });");
  console.log("   pool.terminate();");

  // 并行映射 API
  console.log("\n4. parallelMap API:");
  console.log("   const results = await parallelMap(");
  console.log("     [1, 2, 3, 4, 5, 6, 7, 8],");
  console.log("     x => x * x,");
  console.log("     4 // worker count");
  console.log("   );");

  // 内联 Worker 演示
  console.log("\n5. Inline Worker Example:");
  console.log("   const worker = createInlineWorker(() => {");
  console.log("     self.onmessage = (e) => {");
  console.log("       const result = e.data * 2;");
  console.log("       self.postMessage(result);");
  console.log("     };");
  console.log("   });");

  console.log("\nNote: Web Workers require a browser environment.");
  console.log("=== End of Demo ===\n");
}
