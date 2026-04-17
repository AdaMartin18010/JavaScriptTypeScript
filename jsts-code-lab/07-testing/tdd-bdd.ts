/**
 * @file TDD & BDD 测试驱动开发模式
 * @category Testing → TDD/BDD
 * @difficulty medium
 * @tags testing, tdd, bdd, test-driven-development, behavior-driven-development
 * 
 * @description
 * TDD (测试驱动开发) 和 BDD (行为驱动开发) 是敏捷开发方法论：
 * - TDD: 红-绿-重构循环
 * - BDD: 用自然语言描述行为，促进团队协作
 * - 测试即文档
 */

// ============================================================================
// 1. TDD 红-绿-重构循环示例
// ============================================================================

// TDD 步骤 1: 写一个失败的测试 (红)
// TDD 步骤 2: 编写最简单代码让测试通过 (绿)
// TDD 步骤 3: 重构代码保持测试通过 (重构)

export class StringCalculator {
  // 需求: 支持空字符串返回 0
  add(numbers: string): number {
    if (numbers === '') return 0;
    
    // 需求: 支持单个数字
    if (!numbers.includes(',')) {
      return parseInt(numbers, 10);
    }

    // 需求: 支持两个数字
    const parts = numbers.split(',');
    return parts.reduce((sum, num) => sum + parseInt(num, 10), 0);
  }
}

// ============================================================================
// 2. FizzBuzz - TDD 经典示例
// ============================================================================

export class FizzBuzz {
  convert(num: number): string {
    if (num <= 0) {
      throw new Error('Number must be positive');
    }

    let result = '';
    
    if (num % 3 === 0) result += 'Fizz';
    if (num % 5 === 0) result += 'Buzz';
    
    return result || num.toString();
  }

  generateSequence(count: number): string[] {
    return Array.from({ length: count }, (_, i) => this.convert(i + 1));
  }
}

// ============================================================================
// 3. BDD 风格 - 用 Given-When-Then 描述行为
// ============================================================================

export interface BddScenario {
  given: string;
  when: string;
  then: string;
}

export class ShoppingCart {
  private items: { productId: string; quantity: number; price: number }[] = [];

  // Given 空购物车
  // When 添加商品
  // Then 购物车应包含该商品
  addItem(productId: string, quantity: number, price: number): void {
    const existingItem = this.items.find(i => i.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({ productId, quantity, price });
    }
  }

  // Given 购物车有商品
  // When 移除商品
  // Then 购物车不应包含该商品
  removeItem(productId: string): void {
    this.items = this.items.filter(i => i.productId !== productId);
  }

  // Given 购物车有商品
  // When 计算总价
  // Then 应返回正确总价
  getTotal(): number {
    return this.items.reduce((total, item) => total + item.price * item.quantity, 0);
  }

  // Given 购物车有商品
  // When 应用折扣码
  // Then 总价应减少相应金额
  applyDiscount(code: string): number {
    const discounts: Record<string, number> = {
      'SAVE10': 0.10,
      'SAVE20': 0.20,
      'HALF': 0.50
    };

    const discountRate = discounts[code] || 0;
    return this.getTotal() * (1 - discountRate);
  }

  getItemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

// ============================================================================
// 4. 测试 DSL 构建器
// ============================================================================

export class BddTestBuilder<T> {
  private scenario: BddScenario = { given: '', when: '', then: '' };
  private setupFn?: () => T;
  private actionFn?: (context: T) => void | Promise<void>;
  private assertionFn?: (context: T) => boolean | Promise<boolean>;

  given(description: string, setup: () => T): this {
    this.scenario.given = description;
    this.setupFn = setup;
    return this;
  }

  when(description: string, action: (context: T) => void | Promise<void>): this {
    this.scenario.when = description;
    this.actionFn = action;
    return this;
  }

  then(description: string, assertion: (context: T) => boolean | Promise<boolean>): this {
    this.scenario.then = description;
    this.assertionFn = assertion;
    return this;
  }

  async run(): Promise<TestResult> {
    console.log(`\n场景: Given ${this.scenario.given}`);
    console.log(`       When ${this.scenario.when}`);
    console.log(`       Then ${this.scenario.then}`);

    try {
      if (!this.setupFn || !this.actionFn || !this.assertionFn) {
        throw new Error('场景不完整');
      }

      const context = this.setupFn();
      await this.actionFn(context);
      const passed = await this.assertionFn(context);

      return {
        scenario: this.scenario,
        passed,
        error: passed ? undefined : '断言失败'
      };
    } catch (error) {
      return {
        scenario: this.scenario,
        passed: false,
        error: String(error)
      };
    }
  }
}

export interface TestResult {
  scenario: BddScenario;
  passed: boolean;
  error?: string;
}

// ============================================================================
// 5. 特性文件解析器 (简化版 Gherkin)
// ============================================================================

export interface Feature {
  name: string;
  description: string;
  scenarios: Scenario[];
}

export interface Scenario {
  name: string;
  steps: Step[];
}

export interface Step {
  keyword: 'Given' | 'When' | 'Then' | 'And' | 'But';
  text: string;
}

export class GherkinParser {
  parse(featureText: string): Feature {
    const lines = featureText.split('\n').map(l => l.trim()).filter(l => l);
    
    const feature: Feature = {
      name: '',
      description: '',
      scenarios: []
    };

    let currentScenario: Scenario | null = null;

    for (const line of lines) {
      if (line.startsWith('Feature:')) {
        feature.name = line.replace('Feature:', '').trim();
      } else if (line.startsWith('Scenario:')) {
        currentScenario = {
          name: line.replace('Scenario:', '').trim(),
          steps: []
        };
        feature.scenarios.push(currentScenario);
      } else if (currentScenario && this.isStep(line)) {
        const keyword = this.extractKeyword(line);
        const text = line.replace(new RegExp(`^${keyword}\\s*`), '').trim();
        currentScenario.steps.push({ keyword, text });
      }
    }

    return feature;
  }

  private isStep(line: string): boolean {
    const keywords = ['Given', 'When', 'Then', 'And', 'But'];
    return keywords.some(k => line.startsWith(k));
  }

  private extractKeyword(line: string): Step['keyword'] {
    const match = /^(Given|When|Then|And|But)/.exec(line);
    return (match?.[0] || 'Given') as Step['keyword'];
  }
}

// ============================================================================
// 6. 测试即文档 - 自文档化测试
// ============================================================================

export class DocumentingTest<T> {
  private steps: { description: string; action: () => void | Promise<void> }[] = [];

  step(description: string, action: () => void | Promise<void>): this {
    this.steps.push({ description, action });
    return this;
  }

  async run(): Promise<{ documentation: string; passed: boolean }> {
    const docs: string[] = ['测试文档:', ''];
    
    for (let i = 0; i < this.steps.length; i++) {
      const { description, action } = this.steps[i];
      docs.push(`${i + 1}. ${description}`);
      
      try {
        await action();
      } catch (error) {
        docs.push(`   ✗ 失败: ${error}`);
        return { documentation: docs.join('\n'), passed: false };
      }
    }
    
    docs.push('', '✓ 所有步骤通过');
    return { documentation: docs.join('\n'), passed: true };
  }
}

// ============================================================================
// 7. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== TDD & BDD 测试驱动开发演示 ===\n');

  // TDD - StringCalculator
  console.log('--- TDD: StringCalculator ---');
  const calc = new StringCalculator();
  console.log(`"" = ${calc.add('')} (期望: 0)`);
  console.log(`"1" = ${calc.add('1')} (期望: 1)`);
  console.log(`"1,2" = ${calc.add('1,2')} (期望: 3)`);
  console.log(`"1,2,3,4" = ${calc.add('1,2,3,4')} (期望: 10)`);

  // TDD - FizzBuzz
  console.log('\n--- TDD: FizzBuzz ---');
  const fizzBuzz = new FizzBuzz();
  const sequence = fizzBuzz.generateSequence(15);
  console.log(sequence.join(', '));

  // BDD - ShoppingCart
  console.log('\n--- BDD: ShoppingCart ---');
  const cart = new ShoppingCart();
  
  // Given 空购物车
  console.log('Given: 购物车是空的');
  console.log(`IsEmpty: ${cart.isEmpty()}`);
  
  // When 添加商品
  console.log('When: 添加商品 A (数量: 2, 价格: 50)');
  cart.addItem('A', 2, 50);
  
  console.log('And: 添加商品 B (数量: 1, 价格: 100)');
  cart.addItem('B', 1, 100);
  
  // Then 验证
  console.log('Then: 总价应为 200');
  console.log(`总价: ${cart.getTotal()} (期望: 200)`);
  
  console.log('And: 商品总数为 3');
  console.log(`商品数: ${cart.getItemCount()} (期望: 3)`);

  // BDD DSL 示例
  console.log('\n--- BDD DSL 示例 ---');
  const test = new BddTestBuilder<ShoppingCart>();
  const result = await test
    .given('购物车中有商品总价 100元', () => {
      const c = new ShoppingCart();
      c.addItem('X', 1, 100);
      return c;
    })
    .when('应用 SAVE20 折扣码', async (cart) => {
      cart.applyDiscount('SAVE20');
    })
    .then('总价应变为 80元', (cart) => {
      return cart.applyDiscount('SAVE20') === 80;
    })
    .run();

  console.log(`测试结果: ${result.passed ? '通过' : '失败'}`);
  if (result.error) console.log(`错误: ${result.error}`);

  // Gherkin 解析示例
  console.log('\n--- Gherkin 特性解析 ---');
  const featureText = `
Feature: 用户登录

  Scenario: 成功登录
    Given 用户已注册
    When 用户输入正确的用户名和密码
    Then 用户应成功登录
    And 应看到欢迎消息
  `;

  const parser = new GherkinParser();
  const feature = parser.parse(featureText);
  console.log(`特性: ${feature.name}`);
  console.log(`场景数: ${feature.scenarios.length}`);
  feature.scenarios.forEach(s => {
    console.log(`\n场景: ${s.name}`);
    s.steps.forEach(step => {
      console.log(`  ${step.keyword} ${step.text}`);
    });
  });

  // 自文档化测试
  console.log('\n--- 自文档化测试 ---');
  const docTest = new DocumentingTest<void>();
  const docResult = await docTest
    .step('用户访问登录页面', () => {})
    .step('输入有效的邮箱和密码', () => {})
    .step('点击登录按钮', () => {})
    .step('验证跳转到首页', () => {})
    .run();
  
  console.log(docResult.documentation);
}

// ============================================================================
// 导出
// ============================================================================

;

;
