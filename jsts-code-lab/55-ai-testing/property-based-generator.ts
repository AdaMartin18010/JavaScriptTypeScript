/**
 * @file 基于属性的测试数据生成器
 * @category AI Testing → Property-Based Testing
 * @difficulty medium
 * @tags ai-testing, property-based-testing, generative-testing, quickcheck
 *
 * @description
 * 基于性质的测试数据生成器，受 QuickCheck / Hypothesis 启发。
 * 通过定义数据生成器组合子，生成随机测试数据并验证性质。
 *
 * 核心概念：
 * - 生成器 (Generator<T>): 产生类型为 T 的随机值
 * - 性质 (Property): 对任意输入都应成立的断言
 * - Shrink: 测试失败时，自动寻找最小反例
 */

export interface GeneratedValue<T> {
  value: T;
  shrink: () => Generator<T>;
}

export interface PropertyResult {
  passed: boolean;
  iterations: number;
  seed: number;
  counterexample?: unknown;
  shrunkCounterexample?: unknown;
  error?: string;
}

/** 伪随机数生成器（可复现） */
export class SeededRandom {
  private state: number;

  constructor(seed = Date.now()) {
    this.state = seed;
  }

  next(): number {
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// ==================== 基础生成器 ====================

export class Generator<T> {
  constructor(private readonly generateFn: (rng: SeededRandom) => T) {}

  generate(rng: SeededRandom): T {
    return this.generateFn(rng);
  }

  /** 映射生成器输出 */
  map<U>(fn: (value: T) => U): Generator<U> {
    return new Generator(rng => fn(this.generateFn(rng)));
  }

  /**  flatMap: 用生成的值创建新生成器 */
  flatMap<U>(fn: (value: T) => Generator<U>): Generator<U> {
    return new Generator(rng => {
      const value = this.generateFn(rng);
      return fn(value).generate(rng);
    });
  }

  /** 过滤生成值 */
  filter(predicate: (value: T) => boolean, maxAttempts = 100): Generator<T> {
    return new Generator(rng => {
      for (let i = 0; i < maxAttempts; i++) {
        const value = this.generateFn(rng);
        if (predicate(value)) return value;
      }
      throw new Error(`Filter exceeded max attempts (${maxAttempts})`);
    });
  }

  /** 生成数组 */
  array(minLength = 0, maxLength = 10): Generator<T[]> {
    return new Generator(rng => {
      const length = rng.nextInt(minLength, maxLength);
      return Array.from({ length }, () => this.generateFn(rng));
    });
  }
}

// ==================== 内建生成器 ====================

export const Gen = {
  /** 整数生成器 */
  integer(min = -1000, max = 1000): Generator<number> {
    return new Generator(rng => rng.nextInt(min, max));
  },

  /** 正整数 */
  positiveInteger(max = 1000): Generator<number> {
    return new Generator(rng => rng.nextInt(1, max));
  },

  /** 浮点数生成器 */
  float(min = -1000, max = 1000): Generator<number> {
    return new Generator(rng => rng.next() * (max - min) + min);
  },

  /** 布尔生成器 */
  boolean(): Generator<boolean> {
    return new Generator(rng => rng.next() < 0.5);
  },

  /** 字符串生成器 */
  string(minLength = 0, maxLength = 20, chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'): Generator<string> {
    return new Generator(rng => {
      const length = rng.nextInt(minLength, maxLength);
      return Array.from({ length }, () => chars[rng.nextInt(0, chars.length - 1)]).join('');
    });
  },

  /** 从数组中选择一个 */
  oneOf<U>(...values: U[]): Generator<U> {
    return new Generator(rng => values[rng.nextInt(0, values.length - 1)]);
  },

  /** 从生成器中选择一个 */
  oneOfGen<U>(...generators: Generator<U>[]): Generator<U> {
    return new Generator(rng => {
      const gen = generators[rng.nextInt(0, generators.length - 1)];
      return gen.generate(rng);
    });
  },

  /** 固定值 */
  constant<U>(value: U): Generator<U> {
    return new Generator(() => value);
  },

  /** 可选值（可能为 undefined） */
  optional<U>(gen: Generator<U>, probability = 0.3): Generator<U | undefined> {
    return new Generator(rng => (rng.next() < probability ? undefined : gen.generate(rng)));
  },

  /** 对象生成器 */
  record<U extends Record<string, unknown>>(shape: { [K in keyof U]: Generator<U[K]> }): Generator<U> {
    return new Generator(rng => {
      const result = {} as U;
      for (const key of Object.keys(shape) as Array<keyof U>) {
        result[key] = shape[key].generate(rng);
      }
      return result;
    });
  }
};

// ==================== Shrink 策略 ====================

export interface ShrinkStrategy<T> {
  shrink(value: T): T[];
}

export const Shrink = {
  integer(): ShrinkStrategy<number> {
    return {
      shrink(value: number): number[] {
        if (value === 0) return [];
        const half = Math.trunc(value / 2);
        const candidates = [0, -value, half, value - 1, value + 1];
        return [...new Set(candidates)].filter(x => x !== value && Math.abs(x) <= Math.abs(value));
      }
    };
  },

  array<U>(elementShrink: ShrinkStrategy<U>): ShrinkStrategy<U[]> {
    return {
      shrink(value: U[]): U[][] {
        const results: U[][] = [];
        // 移除元素
        for (let i = 0; i < value.length; i++) {
          results.push(value.slice(0, i).concat(value.slice(i + 1)));
        }
        // Shrink 单个元素
        for (let i = 0; i < value.length; i++) {
          for (const shrunk of elementShrink.shrink(value[i])) {
            const copy = [...value];
            copy[i] = shrunk;
            results.push(copy);
          }
        }
        return results;
      }
    };
  }
};

// ==================== 性质测试引擎 ====================

export class PropertyTester {
  private rng: SeededRandom;

  constructor(seed?: number) {
    this.rng = new SeededRandom(seed);
  }

  /**
   * 测试一个性质是否对所有生成的输入成立
   */
  test<T>(
    generator: Generator<T>,
    property: (value: T) => boolean,
    options: {
      iterations?: number;
      shrink?: boolean;
      shrinkStrategy?: ShrinkStrategy<T>;
    } = {}
  ): PropertyResult {
    const { iterations = 100, shrink = true, shrinkStrategy } = options;
    const seed = this.rng['state'] ?? Date.now();

    for (let i = 0; i < iterations; i++) {
      const value = generator.generate(this.rng);

      try {
        if (!property(value)) {
          let shrunk: T | undefined;

          if (shrink && shrinkStrategy) {
            shrunk = this.shrink(value, property, shrinkStrategy);
          }

          return {
            passed: false,
            iterations: i + 1,
            seed,
            counterexample: value,
            shrunkCounterexample: shrunk
          };
        }
      } catch (error) {
        return {
          passed: false,
          iterations: i + 1,
          seed,
          counterexample: value,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    return { passed: true, iterations, seed };
  }

  private shrink<T>(value: T, property: (value: T) => boolean, strategy: ShrinkStrategy<T>): T | undefined {
    let current = value;
    let queue = strategy.shrink(current);

    while (queue.length > 0) {
      const candidate = queue.shift()!;
      try {
        if (!property(candidate)) {
          current = candidate;
          queue = strategy.shrink(current);
        }
      } catch {
        // 异常也视为失败，继续 shrink
        current = candidate;
        queue = strategy.shrink(current);
      }
    }

    return current;
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 基于属性的测试生成 ===\n');

  const tester = new PropertyTester(42);

  // 1. 整数生成
  console.log('--- 随机整数 ---');
  const intGen = Gen.integer(-10, 10);
  const ints = intGen.array(5, 10).generate(tester['rng']);
  console.log('  生成的整数:', ints);

  // 2. 测试交换律性质
  console.log('\n--- 测试加法交换律 (a + b = b + a) ---');
  const pairGen = Gen.record({ a: Gen.integer(-100, 100), b: Gen.integer(-100, 100) });
  const commutativeResult = tester.test(
    pairGen,
    ({ a, b }) => a + b === b + a,
    { iterations: 1000 }
  );
  console.log('  结果:', commutativeResult.passed ? '通过' : '失败');

  // 3. 测试失败的性质（故意失败以演示 shrink）
  console.log('\n--- 测试错误性质 (x * x > x) ---');
  const squareResult = tester.test(
    Gen.integer(-10, 10),
    x => x * x > x,
    { iterations: 50, shrink: true, shrinkStrategy: Shrink.integer() }
  );
  console.log('  结果:', squareResult.passed ? '通过' : '失败');
  if (!squareResult.passed) {
    console.log('  反例:', squareResult.counterexample);
    console.log('  Shrink 后:', squareResult.shrunkCounterexample);
  }

  // 4. 复杂对象生成
  console.log('\n--- 生成用户对象 ---');
  const userGen = Gen.record({
    id: Gen.positiveInteger(9999),
    name: Gen.string(3, 10),
    age: Gen.integer(0, 120),
    active: Gen.boolean()
  });
  const users = userGen.array(3, 5).generate(tester['rng']);
  users.forEach(u => console.log('  ', JSON.stringify(u)));
}
