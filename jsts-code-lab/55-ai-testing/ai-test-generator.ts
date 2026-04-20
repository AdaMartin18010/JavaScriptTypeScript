/**
 * @file AI辅助测试生成器
 * @category AI Testing → Test Generation
 * @difficulty medium
 * @tags ai-testing, test-generation, property-based-testing, edge-cases, oracles
 *
 * @description
 * AI驱动的测试生成系统，从函数签名、JSDoc注释和类型注解自动生成高质量测试用例。
 * 支持属性基测试生成、边界值分析和测试Oracle提取。
 *
 * 核心能力：
 * - Prompt构建器：从函数签名生成结构化提示
 * - 属性基测试生成：基于类型约束的fuzzing输入
 * - 边界值检测：null、undefined、空值、溢出、NaN、Infinity
 * - 测试Oracle提取：从JSDoc和类型注解推断预期行为
 */

/** 函数参数元信息 */
export interface ParamInfo {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: string;
}

/** 生成的测试用例 */
export interface GeneratedTest {
  id: string;
  name: string;
  inputs: unknown[];
  expected: unknown;
  description: string;
  category: 'valid' | 'boundary' | 'invalid' | 'edge';
  oracleSource: 'jsdoc' | 'type' | 'heuristic';
}

/** Prompt模板 */
export interface PromptTemplate {
  system: string;
  user: string;
  context: string;
}

/** 测试Oracle定义 */
export interface TestOracle {
  preconditions: string[];
  postconditions: string[];
  invariants: string[];
  exceptions: string[];
}

// ==================== Prompt构建器 ====================

export class PromptBuilder {
  /**
   * 从函数签名构建AI测试生成提示
   */
  buildPrompt(functionCode: string, functionName: string): PromptTemplate {
    const params = this.parseParams(functionCode);
    const returnType = this.extractReturnType(functionCode);
    const jsdoc = this.extractJSDoc(functionCode);

    const system = `You are an expert test engineer. Generate comprehensive unit tests that cover:
- Normal cases with valid inputs
- Boundary values and edge cases
- Invalid inputs and error handling
- Type coercion and unexpected input shapes`;

    const user = `Generate tests for function: ${functionName}
Parameters: ${params.map(p => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(', ')}
Return type: ${returnType}`;

    const context = jsdoc
      ? `JSDoc context:\n${jsdoc}`
      : `No JSDoc available. Infer behavior from parameter types: ${params.map(p => p.type).join(', ')}`;

    return { system, user, context };
  }

  parseParams(code: string): ParamInfo[] {
    const match = /\(([\s\S]*?)\)\s*(?::\s*([^{]+))?/.exec(code);
    if (!match || !match[1]) return [];

    return match[1].split(',').map(p => {
      const trimmed = p.trim();
      if (!trimmed) return null;

      const optional = trimmed.includes('?');
      const parts = trimmed.replace(/\?/g, '').split('=').map(s => s.trim());
      const sigParts = parts[0].split(':').map(s => s.trim());

      return {
        name: sigParts[0] || 'arg',
        type: sigParts[1] || 'unknown',
        optional,
        defaultValue: parts[1]
      };
    }).filter((p): p is ParamInfo => p !== null);
  }

  private extractReturnType(code: string): string {
    const match = /\)\s*:\s*([^{;\n]+)/.exec(code);
    return match ? match[1].trim() : 'unknown';
  }

  private extractJSDoc(code: string): string | undefined {
    const match = /\/\*\*([\s\S]*?)\*\//.exec(code);
    return match ? match[1].replace(/^\s*\*\s?/gm, '').trim() : undefined;
  }
}

// ==================== 边界值检测器 ====================

export class EdgeCaseDetector {
  private static readonly TYPE_EDGE_CASES: Record<string, unknown[]> = {
    number: [0, -1, 1, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Infinity, -Infinity, NaN],
    string: ['', ' ', '\\0', '\\n', '\\t', 'a'.repeat(10000), '🎉', 'null', 'undefined'],
    boolean: [],
    array: [[], [undefined], [null], Array(1000)],
    object: [{}, null, undefined, { toString: () => 'evil' }],
    any: [null, undefined, 0, '', false, {}, []]
  };

  /**
   * 检测指定类型的所有边界值
   */
  detect(type: string): unknown[] {
    const base = EdgeCaseDetector.TYPE_EDGE_CASES[type] ?? EdgeCaseDetector.TYPE_EDGE_CASES.any;
    return [...base, null, undefined];
  }

  /**
   * 检测数值溢出场景
   */
  detectOverflow(type: string, operation?: string): unknown[] {
    if (type !== 'number') return [];

    const cases: unknown[] = [
      Number.MAX_VALUE + 1,
      Number.MIN_VALUE - 1,
      Number.MAX_SAFE_INTEGER + 1,
      Number.MIN_SAFE_INTEGER - 1
    ];

    if (operation === 'divide') {
      cases.push(1 / 0, -1 / 0);
    }
    if (operation === 'multiply') {
      cases.push(Number.MAX_VALUE * 2, Number.MIN_VALUE * 2);
    }

    return cases;
  }

  /**
   * 检测空值与缺失值
   */
  detectNullish(): unknown[] {
    return [null, undefined, void 0];
  }

  /**
   * 检测空集合/容器
   */
  detectEmpty(type: string): unknown[] {
    if (type === 'string') return ['', ' ', '\\t'];
    if (type === 'array' || type.includes('[]')) return [[], new Array(0)];
    if (type === 'object') return [{}, Object.create(null), new Object()];
    return [];
  }
}

// ==================== 测试Oracle提取器 ====================

export class TestOracleExtractor {
  /**
   * 从JSDoc注释提取测试Oracle
   */
  extractFromJSDoc(jsdoc: string): TestOracle {
    const oracle: TestOracle = {
      preconditions: [],
      postconditions: [],
      invariants: [],
      exceptions: []
    };

    const lines = jsdoc.split('\n');
    for (const line of lines) {
      const trimmed = line.trim().replace(/^\*\s?/, '');

      if (trimmed.startsWith('@param')) {
        const match = /@param\s+\{([^}]+)\}\s+\w+\s*-\s*(.+)/.exec(trimmed);
        if (match) {
          oracle.preconditions.push(`${match[1]}: ${match[2]}`);
        }
      }

      if (trimmed.startsWith('@returns')) {
        const match = /@returns\s+\{([^}]+)\}\s*(.+)/.exec(trimmed);
        if (match) {
          oracle.postconditions.push(`${match[1]}: ${match[2]}`);
        }
      }

      if (trimmed.startsWith('@throws')) {
        const match = /@throws\s+\{([^}]+)\}\s*(.+)/.exec(trimmed);
        if (match) {
          oracle.exceptions.push(`${match[1]}: ${match[2]}`);
        }
      }

      if (trimmed.startsWith('@invariant')) {
        oracle.invariants.push(trimmed.replace('@invariant', '').trim());
      }
    }

    return oracle;
  }

  /**
   * 从类型注解推断预期行为
   */
  inferFromType(paramType: string, returnType: string): TestOracle {
    const oracle: TestOracle = {
      preconditions: [],
      postconditions: [],
      invariants: [],
      exceptions: []
    };

    if (returnType === 'number') {
      oracle.invariants.push('Result should be a finite number when inputs are finite');
    }
    if (returnType === 'string') {
      oracle.invariants.push('Result should be a string');
    }
    if (returnType.includes('[]') || returnType.includes('Array')) {
      oracle.invariants.push('Result should be iterable');
    }
    if (paramType.includes('?') || paramType.includes('undefined')) {
      oracle.preconditions.push('Parameter may be undefined');
    }

    return oracle;
  }
}

// ==================== 属性基测试生成器 ====================

export class PropertyBasedTestGenerator {
  private rng = new (class {
    private state = 123456;
    next(): number {
      this.state = (this.state * 16807) % 2147483647;
      return (this.state - 1) / 2147483646;
    }
    nextInt(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    }
  })();

  /**
   * 基于类型约束生成随机输入
   */
  generateForType(type: string, count = 10): unknown[] {
    const results: unknown[] = [];
    for (let i = 0; i < count; i++) {
      results.push(this.randomValue(type));
    }
    return results;
  }

  private randomValue(type: string): unknown {
    switch (type) {
      case 'number':
        return this.rng.nextInt(-10000, 10000);
      case 'string':
        return this.randomString();
      case 'boolean':
        return this.rng.next() < 0.5;
      case 'array':
        return Array.from({ length: this.rng.nextInt(0, 10) }, () => this.randomValue('number'));
      case 'object':
        return { [this.randomString()]: this.randomValue('number') };
      default:
        return null;
    }
  }

  private randomString(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    const length = this.rng.nextInt(1, 20);
    return Array.from({ length }, () => chars[this.rng.nextInt(0, chars.length - 1)]).join('');
  }

  /**
   * 生成属性断言模板
   */
  generatePropertyAssertion(functionName: string, params: ParamInfo[]): string {
    const propNames = ['commutativity', 'associativity', 'idempotence', 'identity'];
    const applicable = propNames.filter(p => this.isApplicable(p, params));

    if (applicable.length === 0) {
      return `${functionName}: no generic property detected; verify output against oracle`;
    }

    return applicable.map(p => `${functionName} should satisfy ${p}`).join('; ');
  }

  private isApplicable(property: string, params: ParamInfo[]): boolean {
    if (params.length < 2) return false;
    const allNumbers = params.every(p => p.type === 'number');
    if (property === 'commutativity') return allNumbers;
    if (property === 'associativity') return allNumbers && params.length === 3;
    return true;
  }
}

// ==================== AI测试生成器主类 ====================

export class AITestGenerator {
  private promptBuilder = new PromptBuilder();
  private edgeCaseDetector = new EdgeCaseDetector();
  private oracleExtractor = new TestOracleExtractor();
  private propertyGenerator = new PropertyBasedTestGenerator();

  /**
   * 从函数代码生成完整测试套件
   */
  generateTests(functionCode: string, functionName: string): GeneratedTest[] {
    const params = this.promptBuilder.parseParams(functionCode);
    const jsdoc = this.promptBuilder['extractJSDoc'](functionCode);
    const returnType = (this.promptBuilder as any).extractReturnType(functionCode);
    const oracle = jsdoc ? this.oracleExtractor.extractFromJSDoc(jsdoc) : this.oracleExtractor.inferFromType('', returnType);

    const tests: GeneratedTest[] = [];
    let testId = 0;

    // 1. 正常值测试
    tests.push(...this.buildValidTests(params, functionName, oracle, () => `t-${testId++}`));

    // 2. 边界值测试
    tests.push(...this.buildBoundaryTests(params, functionName, () => `t-${testId++}`));

    // 3. 无效值测试
    tests.push(...this.buildInvalidTests(params, functionName, () => `t-${testId++}`));

    // 4. 属性基fuzzing测试
    tests.push(...this.buildPropertyTests(params, functionName, () => `t-${testId++}`));

    return tests;
  }

  private buildValidTests(
    params: ParamInfo[],
    functionName: string,
    oracle: TestOracle,
    nextId: () => string
  ): GeneratedTest[] {
    return params.map(param => ({
      id: nextId(),
      name: `${functionName} valid ${param.name}`,
      inputs: params.map(p => this.defaultValidValue(p.type)),
      expected: oracle.postconditions[0] ?? 'success',
      description: `Valid ${param.type} input for ${param.name}`,
      category: 'valid' as const,
      oracleSource: 'type' as const
    }));
  }

  private buildBoundaryTests(
    params: ParamInfo[],
    functionName: string,
    nextId: () => string
  ): GeneratedTest[] {
    const tests: GeneratedTest[] = [];
    for (const param of params) {
      const edges = this.edgeCaseDetector.detect(param.type);
      for (const edge of edges.slice(0, 4)) {
        tests.push({
          id: nextId(),
          name: `${functionName} boundary ${param.name}=${JSON.stringify(edge)}`,
          inputs: params.map(p => (p.name === param.name ? edge : this.defaultValidValue(p.type))),
          expected: 'defined',
          description: `Edge case for ${param.name}: ${JSON.stringify(edge)}`,
          category: 'boundary',
          oracleSource: 'heuristic'
        });
      }
    }
    return tests;
  }

  private buildInvalidTests(
    params: ParamInfo[],
    functionName: string,
    nextId: () => string
  ): GeneratedTest[] {
    const tests: GeneratedTest[] = [];
    for (const param of params) {
      const invalid = this.edgeCaseDetector.detectOverflow(param.type);
      if (invalid.length > 0) {
        tests.push({
          id: nextId(),
          name: `${functionName} overflow ${param.name}`,
          inputs: params.map(p => (p.name === param.name ? invalid[0] : this.defaultValidValue(p.type))),
          expected: 'throw or finite fallback',
          description: `Overflow test for ${param.name}`,
          category: 'invalid',
          oracleSource: 'heuristic'
        });
      }

      if (!param.optional) {
        tests.push({
          id: nextId(),
          name: `${functionName} nullish ${param.name}`,
          inputs: params.map(p => (p.name === param.name ? null : this.defaultValidValue(p.type))),
          expected: 'throw or guard',
          description: `Nullish rejection for required ${param.name}`,
          category: 'invalid',
          oracleSource: 'type'
        });
      }
    }
    return tests;
  }

  private buildPropertyTests(
    params: ParamInfo[],
    functionName: string,
    nextId: () => string
  ): GeneratedTest[] {
    const assertion = this.propertyGenerator.generatePropertyAssertion(functionName, params);
    const fuzzInputs = params.map(p => this.propertyGenerator.generateForType(p.type, 1)[0]);

    return [{
      id: nextId(),
      name: `${functionName} property fuzz`,
      inputs: fuzzInputs,
      expected: assertion,
      description: `Property-based fuzzing: ${assertion}`,
      category: 'edge',
      oracleSource: 'heuristic'
    }];
  }

  private defaultValidValue(type: string): unknown {
    const map: Record<string, unknown> = {
      number: 42,
      string: 'hello',
      boolean: true,
      array: [1, 2, 3],
      object: { key: 'value' },
      any: 0,
      unknown: null
    };
    return map[type] ?? null;
  }
}

// ==================== 演示 ====================

export async function demo(): Promise<void> {
  console.log('=== AI辅助测试生成 ===\n');

  const generator = new AITestGenerator();
  const code = `
/**
 * 计算两个数的和
 * @param {number} a - 第一个加数
 * @param {number} b - 第二个加数
 * @returns {number} 两数之和
 * @throws {TypeError} 当参数不是数字时
 */
function add(a: number, b: number): number {
  return a + b;
}
`;

  const tests = generator.generateTests(code, 'add');
  console.log(`为 add 函数生成 ${tests.length} 个测试用例:`);

  for (const test of tests) {
    const icon = test.category === 'valid' ? '✓' : test.category === 'boundary' ? '◆' : test.category === 'invalid' ? '✗' : '?';
    console.log(`  ${icon} [${test.category.toUpperCase()}] ${test.name}`);
    console.log(`     → ${test.description} (oracle: ${test.oracleSource})`);
  }

  // Prompt构建演示
  const builder = new PromptBuilder();
  const prompt = builder.buildPrompt(code, 'add');
  console.log('\n--- 生成的Prompt ---');
  console.log('System:', prompt.system.slice(0, 60) + '...');
  console.log('User:', prompt.user);

  // Oracle提取演示
  const extractor = new TestOracleExtractor();
  const oracle = extractor.extractFromJSDoc(`
 * @param {number} a - 第一个加数
 * @param {number} b - 第二个加数
 * @returns {number} 两数之和
 * @throws {TypeError} 当参数不是数字时
`);
  console.log('\n--- 提取的Oracle ---');
  console.log('Preconditions:', oracle.preconditions);
  console.log('Exceptions:', oracle.exceptions);
}
