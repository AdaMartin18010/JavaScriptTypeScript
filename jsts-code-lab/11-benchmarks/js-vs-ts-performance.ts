/**
 * @file JavaScript vs TypeScript 性能基准测试
 * @category Benchmarks → Performance Comparison
 * @difficulty medium
 * @tags performance, benchmark, javascript, typescript
 */

interface BenchmarkResult {
  name: string;
  opsPerSecond: number;
  avgTime: number;
  iterations: number;
}

export class Benchmark {
  private results: BenchmarkResult[] = [];

  async run(name: string, fn: () => void, iterations: number = 100000): Promise<BenchmarkResult> {
    for (let i = 0; i < 1000; i++) fn(); // 预热
    
    const start = performance.now();
    for (let i = 0; i < iterations; i++) fn();
    const end = performance.now();

    const result: BenchmarkResult = {
      name,
      opsPerSecond: Math.round(iterations / ((end - start) / 1000)),
      avgTime: (end - start) / iterations,
      iterations
    };

    this.results.push(result);
    return result;
  }

  report(): string {
    return this.results.map(r => 
      `${r.name}: ${r.opsPerSecond.toLocaleString()} ops/sec (avg: ${r.avgTime.toFixed(4)}ms)`
    ).join('\n');
  }
}

// 测试函数
function createPointTS(x: number, y: number): { x: number; y: number } {
  return { x, y };
}

function createPointJS(x: any, y: any) {
  return { x, y };
}

export async function runBenchmarks(): Promise<void> {
  console.log('=== JS vs TS 性能测试 ===\n');
  const bm = new Benchmark();
  
  await bm.run('TS 对象创建', () => createPointTS(Math.random(), Math.random()), 1000000);
  await bm.run('JS 对象创建', () => createPointJS(Math.random(), Math.random()), 1000000);
  
  console.log(bm.report());
  console.log('\n结论: 类型擦除后性能完全相同');
}

export function demo(): void {
  runBenchmarks().catch(console.error);
}
