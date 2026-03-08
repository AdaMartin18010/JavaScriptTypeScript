/**
 * @file AI测试生成器
 * @category AI Testing → Test Generation
 * @difficulty medium
 * @tags ai-testing, test-generation, automated-testing
 * 
 * @description
 * AI驱动的测试生成：
 * - 从代码自动生成测试用例
 * - 智能边界值分析
 * - 测试覆盖率优化
 * - 测试维护自动化
 */

export interface TestCase {
  name: string;
  input: unknown;
  expected: unknown;
  description: string;
}

export class AITestGenerator {
  // 分析函数签名生成测试
  generateTests(functionCode: string, functionName: string): TestCase[] {
    const tests: TestCase[] = [];
    
    // 解析参数类型
    const params = this.parseParams(functionCode);
    
    // 为每个参数生成边界值
    for (const param of params) {
      // 正常值
      tests.push({
        name: `${functionName} with valid ${param.name}`,
        input: this.generateValidInput(param),
        expected: 'success',
        description: `Test ${functionName} with valid ${param.type} input`
      });
      
      // 边界值
      tests.push({
        name: `${functionName} with boundary ${param.name}`,
        input: this.generateBoundaryInput(param),
        expected: 'success',
        description: `Test ${functionName} with boundary values`
      });
      
      // 无效值
      tests.push({
        name: `${functionName} with invalid ${param.name}`,
        input: this.generateInvalidInput(param),
        expected: 'error',
        description: `Test ${functionName} error handling`
      });
    }
    
    return tests;
  }
  
  private parseParams(code: string): Array<{ name: string; type: string }> {
    // 简化解析
    const match = code.match(/\(([^)]*)\)/);
    if (!match) return [];
    
    return match[1].split(',').map(p => {
      const [name, type] = p.split(':').map(s => s.trim());
      return { name: name || 'arg', type: type || 'unknown' };
    });
  }
  
  private generateValidInput(param: { name: string; type: string }): unknown {
    const typeMap: Record<string, unknown> = {
      'number': 42,
      'string': 'test',
      'boolean': true,
      'array': [1, 2, 3],
      'object': { key: 'value' }
    };
    return typeMap[param.type] || null;
  }
  
  private generateBoundaryInput(param: { name: string; type: string }): unknown {
    if (param.type === 'number') {
      return [0, -1, Number.MAX_SAFE_INTEGER][Math.floor(Math.random() * 3)];
    }
    if (param.type === 'string') {
      return '';
    }
    return this.generateValidInput(param);
  }
  
  private generateInvalidInput(param: { name: string; type: string }): unknown {
    const invalidMap: Record<string, unknown> = {
      'number': 'not a number',
      'string': 123,
      'boolean': 'not boolean'
    };
    return invalidMap[param.type] || null;
  }
}

export function demo(): void {
  console.log('=== AI测试生成 ===\n');
  
  const generator = new AITestGenerator();
  const code = 'function add(a: number, b: number): number { return a + b; }';
  
  const tests = generator.generateTests(code, 'add');
  console.log(`为 add 函数生成 ${tests.length} 个测试用例:`);
  for (const test of tests) {
    console.log(`  - ${test.name}`);
  }
}
