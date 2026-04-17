/**
 * @file 属性基测试（Property-based Testing）原理实现
 * @category Formal Verification → Testing
 * @difficulty medium
 * @tags property-based-testing, quickcheck, generators, shrinking, falsification
 *
 * @description
 * 属性基测试（PBT）不针对具体输入值编写用例，而是定义「对于所有满足某条件的输入，
 * 某性质必须成立」的命题，然后通过随机生成大量输入来尝试证伪该命题。
 *
 * 本实现包含：
 * - 基础生成器（整数、数组、字符串）
 * - 属性执行与反例记录
 * - 极简缩小（shrinking）策略
 */

export interface TestResult {
  passed: boolean;
  runs: number;
  counterexample?: unknown;
  error?: string;
}

export type Generator<T> = () => T;

export class PropertyBasedTesting {
  /**
   * 整数生成器
   */
  static integer(min = -100, max = 100): Generator<number> {
    return () => Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * 正整数生成器
   */
  static positiveInt(max = 100): Generator<number> {
    return () => Math.floor(Math.random() * max) + 1;
  }

  /**
   * 数组生成器
   */
  static array<T>(itemGen: Generator<T>, length = 10): Generator<T[]> {
    return () => Array.from({ length }, () => itemGen());
  }

  /**
   * 字符串生成器（仅小写字母）
   */
  static string(length = 10): Generator<string> {
    return () =>
      Array.from({ length }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
  }

  /**
   * 执行属性测试
   * @param generator - 输入生成器
   * @param property - 待验证的性质谓词
   * @param runs - 随机测试次数
   */
  static forAll<T>(generator: Generator<T>, property: (value: T) => boolean, runs = 100): TestResult {
    for (let i = 0; i < runs; i++) {
      const value = generator();
      try {
        if (!property(value)) {
          return { passed: false, runs: i + 1, counterexample: value };
        }
      } catch (error) {
        return {
          passed: false,
          runs: i + 1,
          counterexample: value,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    return { passed: true, runs };
  }

  /**
   * 带缩小的属性测试（简化版：对整数尝试减小绝对值）
   */
  static forAllWithShrink<T>(
    generator: Generator<T>,
    shrink: (value: T) => T[],
    property: (value: T) => boolean,
    runs = 100
  ): TestResult {
    const result = PropertyBasedTesting.forAll(generator, property, runs);
    if (result.passed || result.counterexample === undefined) return result;

    // 尝试缩小反例
    let smallest = result.counterexample as T;
    const queue = [smallest];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = JSON.stringify(current);
      if (visited.has(key)) continue;
      visited.add(key);

      for (const candidate of shrink(current)) {
        try {
          if (!property(candidate)) {
            smallest = candidate;
            queue.push(candidate);
          }
        } catch {
          // 若抛出异常也视为可缩小
          smallest = candidate;
          queue.push(candidate);
        }
      }
    }

    return { ...result, counterexample: smallest };
  }

  /**
   * 整数缩小策略：向 0 靠近
   */
  static shrinkInt(n: number): number[] {
    if (n === 0) return [];
    const half = Math.trunc(n / 2);
    return [n > 0 ? n - 1 : n + 1, half, 0].filter(v => v !== n);
  }
}

export function demo(): void {
  console.log('=== 属性基测试 ===\n');

  // 性质：加法交换律
  const commResult = PropertyBasedTesting.forAll(
    PropertyBasedTesting.integer(-50, 50),
    (x) => {
      const y = PropertyBasedTesting.integer(-50, 50)();
      return x + y === y + x;
    },
    200
  );
  console.log('加法交换律:', commResult.passed ? '通过' : '失败', `(${commResult.runs} 次)`);

  // 性质：reverse(reverse(arr)) === arr
  const revResult = PropertyBasedTesting.forAll(
    PropertyBasedTesting.array(() => PropertyBasedTesting.integer(0, 9)(), 5),
    (arr) => {
      const reversed = [...arr].reverse();
      return JSON.stringify(reversed.reverse()) === JSON.stringify(arr);
    },
    200
  );
  console.log('反转不变性:', revResult.passed ? '通过' : '失败', `(${revResult.runs} 次)`);

  // 故意失败的性质（用于演示缩小）
  const badResult = PropertyBasedTesting.forAllWithShrink(
    PropertyBasedTesting.integer(-100, 100),
    PropertyBasedTesting.shrinkInt,
    (x) => x < 50,
    200
  );
  console.log('故意失败性质:', badResult.passed ? '通过' : '失败');
  if (!badResult.passed) {
    console.log('  缩小后的反例:', badResult.counterexample);
  }
}
