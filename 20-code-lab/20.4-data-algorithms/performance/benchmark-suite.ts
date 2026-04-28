/**
 * @file 科学 Benchmark 套件
 * @category Performance → Benchmarking
 * @difficulty medium
 * @tags performance, benchmark, profiling, comparison
 *
 * @description
 * 本套件演示如何在 JS/TS 中进行科学的性能对比测试：
 * - 包含热身阶段排除 JIT 编译影响
 * - 多次运行取平均值降低方差
 * - 覆盖算法、数据结构、内存、字符串操作四大维度
 *
 * 运行方式:
 *   npx tsx benchmark-suite.ts
 *   # 或编译后: npx tsc benchmark-suite.ts && node benchmark-suite.js
 */

// ============================================================================
// 1. Benchmark 基础框架
// ============================================================================

/** 单次基准测试结果 */
interface BenchmarkResult {
  /** 操作名称 */
  name: string;
  /** 迭代次数 */
  iterations: number;
  /** 平均耗时 (ms) */
  avgMs: number;
  /** 最小耗时 (ms) */
  minMs: number;
  /** 最大耗时 (ms) */
  maxMs: number;
  /** 相对速度 (以同组最快为 1.00x) */
  relativeSpeed: number;
  /** 每秒操作数 */
  opsPerSecond: number;
}

/** 基准测试选项 */
interface BenchmarkOptions {
  /** 热身迭代次数 (默认: 1000) */
  warmupIterations?: number;
  /** 正式测试迭代次数 (默认: 10000) */
  iterations?: number;
  /** 每组测试重复轮数，取最快轮 (默认: 3) */
  rounds?: number;
}

const DEFAULT_OPTIONS: Required<BenchmarkOptions> = {
  warmupIterations: 1000,
  iterations: 10000,
  rounds: 3,
};

/**
 * 执行单次基准测试
 * @param name 测试名称
 * @param fn 被测函数
 * @param iterations 迭代次数
 * @returns 平均耗时 (ms)
 */
function runSingleBenchmark(name: string, fn: () => void, iterations: number): number {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn();
  }
  const end = performance.now();
  return end - start;
}

/**
 * 执行带热身和多轮采样的基准测试
 * @param name 测试名称
 * @param fn 被测函数
 * @param options 测试选项
 * @returns 测试结果
 */
function benchmark(
  name: string,
  fn: () => void,
  options: BenchmarkOptions = {}
): BenchmarkResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // 热身阶段：触发 JIT 编译，排除冷启动影响
  for (let i = 0; i < opts.warmupIterations; i++) {
    fn();
  }

  // 多轮采样，取最快轮以排除 GC 干扰
  let bestTime = Infinity;
  let worstTime = 0;
  let totalTime = 0;

  for (let round = 0; round < opts.rounds; round++) {
    const elapsed = runSingleBenchmark(name, fn, opts.iterations);
    bestTime = Math.min(bestTime, elapsed);
    worstTime = Math.max(worstTime, elapsed);
    totalTime += elapsed;
  }

  const avgMs = totalTime / opts.rounds;
  const opsPerSecond = Math.round(opts.iterations / (avgMs / 1000));

  return {
    name,
    iterations: opts.iterations,
    avgMs,
    minMs: bestTime,
    maxMs: worstTime,
    relativeSpeed: 1, // 将在 benchmarkGroup 中计算
    opsPerSecond,
  };
}

/**
 * 对同一组候选方案进行横向对比
 * @param groupName 分组名称
 * @param candidates 候选方案数组
 * @param options 测试选项
 * @returns 排序后的结果数组 (从快到慢)
 */
function benchmarkGroup(
  groupName: string,
  candidates: { name: string; fn: () => void }[],
  options?: BenchmarkOptions
): BenchmarkResult[] {
  console.log(`\n┌${'─'.repeat(78)}┐`);
  console.log(`│${centerText(groupName, 78)}│`);
  console.log(`├${'─'.repeat(78)}┤`);

  const results: BenchmarkResult[] = [];
  for (const candidate of candidates) {
    const result = benchmark(candidate.name, candidate.fn, options);
    results.push(result);
  }

  // 按平均耗时排序，计算相对速度
  results.sort((a, b) => a.avgMs - b.avgMs);
  const fastest = results[0].avgMs;

  for (const r of results) {
    r.relativeSpeed = parseFloat((r.avgMs / fastest).toFixed(2));
  }

  // 输出表格
  console.log(`│ ${padRight('操作', 26)} │ ${padLeft('迭代', 8)} │ ${padLeft('平均(ms)', 10)} │ ${padLeft('相对', 6)} │ ${padLeft('ops/s', 10)} │`);
  console.log(`├${'─'.repeat(78)}┤`);
  for (const r of results) {
    const relativeStr = r.relativeSpeed === 1 ? '1.00x' : `${r.relativeSpeed.toFixed(2)}x`;
    console.log(
      `│ ${padRight(r.name, 26)} │ ${padLeft(String(r.iterations), 8)} │ ${padLeft(r.avgMs.toFixed(3), 10)} │ ${padLeft(relativeStr, 6)} │ ${padLeft(formatNumber(r.opsPerSecond), 10)} │`
    );
  }
  console.log(`└${'─'.repeat(78)}┘`);

  return results;
}

// ============================================================================
// 工具函数
// ============================================================================

function centerText(text: string, width: number): string {
  const padding = Math.max(0, width - text.length);
  const left = Math.floor(padding / 2);
  const right = padding - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

function padRight(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : str + ' '.repeat(len - str.length);
}

function padLeft(str: string, len: number): string {
  return str.length >= len ? str.slice(0, len) : ' '.repeat(len - str.length) + str;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

// ============================================================================
// 2. 算法对比
// ============================================================================

function runAlgorithmBenchmarks(): void {
  const ITERATIONS = 50_000;

  // 2.1 Array.prototype.includes vs Set.prototype.has
  const searchItems = Array.from({ length: 1000 }, (_, i) => `item-${i}`);
  const target = 'item-500';
  const searchSet = new Set(searchItems);

  benchmarkGroup(
    '算法对比 ①: 成员检测 (Array.includes vs Set.has)',
    [
      {
        name: 'Array.prototype.includes',
        fn: () => {
          const exists = searchItems.includes(target);
          // 消费结果防止完全死代码消除
          if (exists === undefined) throw new Error('unexpected');
        },
      },
      {
        name: 'Set.prototype.has',
        fn: () => {
          const exists = searchSet.has(target);
          if (exists === undefined) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS }
  );

  // 2.2 for vs for...of vs Array.prototype.forEach
  const numbers = Array.from({ length: 1000 }, (_, i) => i);

  benchmarkGroup(
    '算法对比 ②: 遍历方式 (for vs for...of vs forEach)',
    [
      {
        name: 'for (index)',
        fn: () => {
          let sum = 0;
          for (let i = 0; i < numbers.length; i++) {
            sum += numbers[i];
          }
          if (sum < 0) throw new Error('unexpected');
        },
      },
      {
        name: 'for...of',
        fn: () => {
          let sum = 0;
          for (const n of numbers) {
            sum += n;
          }
          if (sum < 0) throw new Error('unexpected');
        },
      },
      {
        name: 'Array.prototype.forEach',
        fn: () => {
          let sum = 0;
          numbers.forEach((n) => {
            sum += n;
          });
          if (sum < 0) throw new Error('unexpected');
        },
      },
      {
        name: 'Array.prototype.reduce',
        fn: () => {
          const sum = numbers.reduce((a, b) => a + b, 0);
          if (sum < 0) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS }
  );

  // 2.3 JSON.parse vs 手动解析 (小对象场景)
  const smallJson = '{"id":123,"name":"Alice","active":true,"score":95.5}';

  benchmarkGroup(
    '算法对比 ③: 对象解析 (JSON.parse vs 手动字段提取)',
    [
      {
        name: 'JSON.parse',
        fn: () => {
          const obj = JSON.parse(smallJson);
          if (obj.id !== 123) throw new Error('unexpected');
        },
      },
      {
        name: '手动字符串提取',
        fn: () => {
          // 模拟极度简化的手动解析 (仅作对比，非生产代码)
          const id = parseInt(smallJson.slice(6, 9), 10);
          const nameStart = smallJson.indexOf('"name":"') + 8;
          const nameEnd = smallJson.indexOf('"', nameStart);
          const name = smallJson.slice(nameStart, nameEnd);
          if (id !== 123 || name !== 'Alice') throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS * 2 }
  );
}

// ============================================================================
// 3. 数据结构对比
// ============================================================================

function runDataStructureBenchmarks(): void {
  const ITERATIONS = 30_000;
  const KEY_COUNT = 500;

  // 3.1 Object vs Map (读写性能)
  const objectKeys = Array.from({ length: KEY_COUNT }, (_, i) => `key-${i}`);
  const objectData: Record<string, number> = {};
  objectKeys.forEach((k, i) => { objectData[k] = i; });

  const mapData = new Map<string, number>();
  objectKeys.forEach((k, i) => { mapData.set(k, i); });

  benchmarkGroup(
    '数据结构 ①: 读性能 (Object vs Map)',
    [
      {
        name: 'Object[key] 读取',
        fn: () => {
          let sum = 0;
          for (let i = 0; i < objectKeys.length; i++) {
            sum += objectData[objectKeys[i]];
          }
          if (sum < 0) throw new Error('unexpected');
        },
      },
      {
        name: 'Map.get 读取',
        fn: () => {
          let sum = 0;
          for (let i = 0; i < objectKeys.length; i++) {
            sum += mapData.get(objectKeys[i])!;
          }
          if (sum < 0) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS }
  );

  benchmarkGroup(
    '数据结构 ②: 写性能 (Object vs Map)',
    [
      {
        name: 'Object[key] = value',
        fn: () => {
          const obj: Record<string, number> = {};
          for (let i = 0; i < 100; i++) {
            obj[`k${i}`] = i;
          }
          if (obj.k99 !== 99) throw new Error('unexpected');
        },
      },
      {
        name: 'Map.set',
        fn: () => {
          const m = new Map<string, number>();
          for (let i = 0; i < 100; i++) {
            m.set(`k${i}`, i);
          }
          if (m.get('k99') !== 99) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS * 2 }
  );

  // 3.2 Array vs TypedArray
  const normalArray = Array.from({ length: 1000 }, () => Math.random());
  const typedArray = new Float64Array(normalArray);

  benchmarkGroup(
    '数据结构 ③: 数值遍历 (Array vs Float64Array)',
    [
      {
        name: 'Array<number> 求和',
        fn: () => {
          let sum = 0;
          for (let i = 0; i < normalArray.length; i++) {
            sum += normalArray[i];
          }
          if (sum < 0) throw new Error('unexpected');
        },
      },
      {
        name: 'Float64Array 求和',
        fn: () => {
          let sum = 0;
          for (let i = 0; i < typedArray.length; i++) {
            sum += typedArray[i];
          }
          if (sum < 0) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS }
  );

  benchmarkGroup(
    '数据结构 ④: 数值写入 (Array vs Float64Array)',
    [
      {
        name: 'Array 顺序写入',
        fn: () => {
          const arr = new Array(1000);
          for (let i = 0; i < 1000; i++) {
            arr[i] = i * 0.5;
          }
          if (arr[999] !== 499.5) throw new Error('unexpected');
        },
      },
      {
        name: 'Float64Array 顺序写入',
        fn: () => {
          const arr = new Float64Array(1000);
          for (let i = 0; i < 1000; i++) {
            arr[i] = i * 0.5;
          }
          if (arr[999] !== 499.5) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS * 2 }
  );
}

// ============================================================================
// 4. 内存对比
// ============================================================================

function runMemoryBenchmarks(): void {
  const ITERATIONS = 20_000;

  // 4.1 对象池 vs 直接创建
  interface Point {
    x: number;
    y: number;
    z: number;
  }

  class PointPool {
    private pool: Point[] = [];
    private inUse = new Set<Point>();

    acquire(x: number, y: number, z: number): Point {
      let p: Point;
      if (this.pool.length > 0) {
        p = this.pool.pop()!;
        p.x = x; p.y = y; p.z = z;
      } else {
        p = { x, y, z };
      }
      this.inUse.add(p);
      return p;
    }

    release(p: Point): void {
      if (this.inUse.has(p)) {
        this.inUse.delete(p);
        this.pool.push(p);
      }
    }

    reset(): void {
      this.pool = [];
      this.inUse.clear();
    }
  }

  const pointPool = new PointPool();

  benchmarkGroup(
    '内存 ①: 对象创建 (对象池 vs 直接 new Object)',
    [
      {
        name: '直接创建对象',
        fn: () => {
          const p: Point = { x: 1, y: 2, z: 3 };
          if (p.x + p.y + p.z !== 6) throw new Error('unexpected');
        },
      },
      {
        name: '对象池 acquire/release',
        fn: () => {
          const p = pointPool.acquire(1, 2, 3);
          if (p.x + p.y + p.z !== 6) throw new Error('unexpected');
          pointPool.release(p);
        },
      },
    ],
    { iterations: ITERATIONS }
  );

  // 清理对象池状态避免后续干扰
  pointPool.reset();

  // 4.2 WeakMap vs Map (引用关系演示)
  // 注：GC 行为无法精确测量，但可对比基础操作开销
  const strongMap = new Map<object, string>();
  const weakMap = new WeakMap<object, string>();

  benchmarkGroup(
    '内存 ②: 引用映射 (Map vs WeakMap 基础操作)',
    [
      {
        name: 'Map.set/get',
        fn: () => {
          const key = { id: Math.random() };
          strongMap.set(key, 'value');
          const v = strongMap.get(key);
          if (v !== 'value') throw new Error('unexpected');
          strongMap.delete(key);
        },
      },
      {
        name: 'WeakMap.set/get',
        fn: () => {
          const key = { id: Math.random() };
          weakMap.set(key, 'value');
          const v = weakMap.get(key);
          if (v !== 'value') throw new Error('unexpected');
          // WeakMap 无 delete 也无所谓，key 后续会被 GC
        },
      },
    ],
    { iterations: ITERATIONS }
  );
}

// ============================================================================
// 5. 字符串操作对比
// ============================================================================

function runStringBenchmarks(): void {
  const ITERATIONS = 30_000;
  const PARTS = ['Hello', ' ', 'World', '!', ' ', 'TypeScript', ' ', 'Benchmark'];

  benchmarkGroup(
    '字符串 ①: 短字符串拼接 (模板 vs + vs join)',
    [
      {
        name: "模板字符串 `${a}${b}`",
        fn: () => {
          const s = `${PARTS[0]}${PARTS[1]}${PARTS[2]}${PARTS[3]}${PARTS[4]}${PARTS[5]}${PARTS[6]}${PARTS[7]}`;
          if (s.length < 10) throw new Error('unexpected');
        },
      },
      {
        name: "'+' 运算符拼接",
        fn: () => {
          const s = PARTS[0] + PARTS[1] + PARTS[2] + PARTS[3] + PARTS[4] + PARTS[5] + PARTS[6] + PARTS[7];
          if (s.length < 10) throw new Error('unexpected');
        },
      },
      {
        name: 'Array.join',
        fn: () => {
          const s = PARTS.join('');
          if (s.length < 10) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS }
  );

  // 长字符串动态拼接
  const longParts = Array.from({ length: 50 }, (_, i) => `segment-${i}-data`);

  benchmarkGroup(
    '字符串 ②: 长数组动态拼接 (模板 vs + vs join)',
    [
      {
        name: "'+' 循环拼接",
        fn: () => {
          let s = '';
          for (let i = 0; i < longParts.length; i++) {
            s += longParts[i];
          }
          if (s.length < 100) throw new Error('unexpected');
        },
      },
      {
        name: 'Array.join',
        fn: () => {
          const s = longParts.join('');
          if (s.length < 100) throw new Error('unexpected');
        },
      },
      {
        name: 'Array.join (pre-allocated)',
        fn: () => {
          const arr = new Array(longParts.length);
          for (let i = 0; i < longParts.length; i++) {
            arr[i] = longParts[i];
          }
          const s = arr.join('');
          if (s.length < 100) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS }
  );

  // JSON 序列化对比
  const sampleObj = {
    id: 42,
    name: 'benchmark',
    tags: ['perf', 'js', 'ts'],
    nested: { a: 1, b: true },
  };

  benchmarkGroup(
    '字符串 ③: 序列化 (JSON.stringify vs 手动拼接)',
    [
      {
        name: 'JSON.stringify',
        fn: () => {
          const s = JSON.stringify(sampleObj);
          if (s.length < 20) throw new Error('unexpected');
        },
      },
      {
        name: '手动 toString',
        fn: () => {
          const s = '{"id":' + sampleObj.id + ',"name":"' + sampleObj.name + '","tags":["' +
            sampleObj.tags.join('","') + '"],"nested":{"a":' + sampleObj.nested.a + ',"b":' +
            sampleObj.nested.b + '}}';
          if (s.length < 20) throw new Error('unexpected');
        },
      },
    ],
    { iterations: ITERATIONS }
  );
}

// ============================================================================
// 6. 综合演示入口
// ============================================================================

/**
 * 运行完整的 Benchmark 套件演示
 *
 * 包含以下维度：
 * 1. 算法对比 (includes vs has, 遍历方式, JSON.parse)
 * 2. 数据结构对比 (Object vs Map, Array vs TypedArray)
 * 3. 内存对比 (对象池 vs 直接创建, Map vs WeakMap)
 * 4. 字符串操作对比 (模板 vs + vs join, JSON 序列化)
 */
export function demo(): void {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║              JSTS Code Lab — 科学 Benchmark 套件                             ║');
  console.log('║                                                                              ║');
  console.log('║  原则: 热身排除 JIT 影响 | 多轮采样降低方差 | 消费结果防止死代码消除           ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝');

  runAlgorithmBenchmarks();
  runDataStructureBenchmarks();
  runMemoryBenchmarks();
  runStringBenchmarks();

  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('  Benchmark 套件执行完毕。');
  console.log('  提示：实际结果受 Node.js 版本、CPU 频率、GC 时机影响，建议运行 3 次取稳定值。');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
}

// 如果直接运行此文件，自动执行 demo
// 兼容 CommonJS (node) 与 ESM (tsx)
const isMainModule = (): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require.main === module;
  } catch {
    // ESM 环境下 require 不可用，使用 import.meta.url 判断
    return /benchmark-suite\.ts$/.test(import.meta.url || '');
  }
};

if (isMainModule()) {
  demo();
}
