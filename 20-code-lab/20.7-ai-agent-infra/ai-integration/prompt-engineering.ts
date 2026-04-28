/**
 * @file Prompt Engineering 模式
 * @category AI Integration → Prompt Engineering
 * @difficulty medium
 * @tags ai, prompt-engineering, few-shot, chain-of-thought, structured-output, ab-testing
 *
 * @description
 * Prompt 工程实现：
 * - Prompt 模板引擎（变量替换）
 * - Few-shot Prompt 构建器
 * - Chain-of-Thought Prompt 生成器
 * - 结构化输出 Prompt（JSON mode）
 * - Prompt 版本管理与 A/B 测试框架
 */

// ============================================================================
// 1. Prompt 模板引擎
// ============================================================================

export interface PromptTemplate {
  id: string;
  template: string;
  variables: string[];
  version: string;
}

export class PromptTemplateEngine {
  private templates = new Map<string, PromptTemplate>();

  register(id: string, template: string, version = '1.0.0'): PromptTemplate {
    const variables = this.extractVariables(template);
    const pt: PromptTemplate = { id, template, variables, version };
    this.templates.set(id, pt);
    return pt;
  }

  render(id: string, variables: Record<string, string | number>): string {
    const pt = this.templates.get(id);
    if (!pt) {
      throw new Error(`Prompt template "${id}" not found`);
    }

    let result = pt.template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(placeholder, String(value));
    }

    // 检查未替换的变量
    const remaining = this.extractVariables(result);
    if (remaining.length > 0) {
      console.warn(`[PromptEngine] Unresolved variables: ${remaining.join(', ')}`);
    }

    return result;
  }

  private extractVariables(template: string): string[] {
    const matches = template.match(/\{\{\s*(\w+)\s*\}\}/g);
    if (!matches) return [];
    return [...new Set(matches.map(m => m.replace(/\{\{\s*|\s*\}\}/g, '')))];
  }
}

// ============================================================================
// 2. Few-shot Prompt 构建器
// ============================================================================

export interface FewShotExample {
  input: string;
  output: string;
  reasoning?: string;
}

export interface FewShotConfig {
  prefix: string;
  examples: FewShotExample[];
  suffix: string;
  exampleTemplate?: (ex: FewShotExample, index: number) => string;
}

export class FewShotPromptBuilder {
  private config: FewShotConfig;

  constructor(config: FewShotConfig) {
    this.config = {
      exampleTemplate: this.defaultExampleTemplate,
      ...config
    };
  }

  build(userInput: string): string {
    const parts: string[] = [];

    if (this.config.prefix) {
      parts.push(this.config.prefix);
    }

    for (let i = 0; i < this.config.examples.length; i++) {
      const ex = this.config.examples[i];
      parts.push(this.config.exampleTemplate!(ex, i));
    }

    if (this.config.suffix) {
      parts.push(this.config.suffix.replace('{{input}}', userInput));
    } else {
      parts.push(`Input: ${userInput}\nOutput:`);
    }

    return parts.join('\n\n');
  }

  addExample(example: FewShotExample): this {
    this.config.examples.push(example);
    return this;
  }

  private defaultExampleTemplate(ex: FewShotExample, index: number): string {
    let result = `Example ${index + 1}:\nInput: ${ex.input}\nOutput: ${ex.output}`;
    if (ex.reasoning) {
      result += `\nReasoning: ${ex.reasoning}`;
    }
    return result;
  }
}

// ============================================================================
// 3. Chain-of-Thought Prompt 生成器
// ============================================================================

export interface CoTStep {
  observation: string;
  thought: string;
  action?: string;
}

export class ChainOfThoughtPromptGenerator {
  private systemPrompt: string;
  private reasoningSteps: CoTStep[] = [];

  constructor(systemPrompt = 'You are a helpful assistant. Think step by step.') {
    this.systemPrompt = systemPrompt;
  }

  addStep(step: CoTStep): this {
    this.reasoningSteps.push(step);
    return this;
  }

  generate(question: string, includeExamples = true): string {
    const parts: string[] = [
      this.systemPrompt,
      '',
      'When answering, follow this reasoning format:',
      '1. Observe the problem',
      '2. Think about the approach',
      '3. Take action or provide the answer',
      ''
    ];

    if (includeExamples && this.reasoningSteps.length > 0) {
      parts.push('Here are some examples of the reasoning process:');
      for (const step of this.reasoningSteps) {
        parts.push(`Observation: ${step.observation}`);
        parts.push(`Thought: ${step.thought}`);
        if (step.action) {
          parts.push(`Action: ${step.action}`);
        }
        parts.push('');
      }
    }

    parts.push(`Question: ${question}`);
    parts.push('Let\'s think step by step.');

    return parts.join('\n');
  }

  generateReAct(
    question: string,
    tools: Array<{ name: string; description: string }>
  ): string {
    const parts: string[] = [
      this.systemPrompt,
      '',
      'You can use the following tools:'
    ];

    for (const tool of tools) {
      parts.push(`- ${tool.name}: ${tool.description}`);
    }

    parts.push('');
    parts.push('Use this format:');
    parts.push('Thought: <your reasoning>');
    parts.push('Action: <tool_name>');
    parts.push('Action Input: <input>');
    parts.push('Observation: <result>');
    parts.push('... (repeat as needed)');
    parts.push('Thought: I now have the final answer');
    parts.push('Final Answer: <answer>');
    parts.push('');
    parts.push(`Question: ${question}`);

    return parts.join('\n');
  }
}

// ============================================================================
// 4. 结构化输出 Prompt（JSON mode）
// ============================================================================

export interface JSONSchemaProperty {
  type: string;
  description?: string;
  enum?: (string | number)[];
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
}

export interface StructuredOutputConfig {
  description: string;
  schema: {
    type: 'object';
    properties: Record<string, JSONSchemaProperty>;
    required: string[];
  };
  examples?: unknown[];
}

export class StructuredOutputPrompt {
  static generate(config: StructuredOutputConfig): string {
    const parts: string[] = [
      config.description,
      '',
      'You must respond with valid JSON only. No markdown, no explanation.',
      '',
      'Response schema:',
      '```json',
      JSON.stringify(config.schema, null, 2),
      '```'
    ];

    if (config.examples && config.examples.length > 0) {
      parts.push('');
      parts.push('Examples:');
      for (const ex of config.examples) {
        parts.push(JSON.stringify(ex));
      }
    }

    parts.push('');
    parts.push('Respond with JSON:');

    return parts.join('\n');
  }

  static parse<T>(response: string): T {
    // 尝试提取 JSON（处理可能的 markdown 代码块）
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) ||
                      response.match(/```\s*([\s\S]*?)\s*```/) ||
                      response.match(/(\{[\s\S]*\})/);

    const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : response;
    const cleaned = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();

    try {
      return JSON.parse(cleaned) as T;
    } catch (err) {
      throw new Error(`Failed to parse structured output: ${(err as Error).message}\nRaw: ${response}`);
    }
  }
}

// ============================================================================
// 5. Prompt 版本管理与 A/B 测试框架
// ============================================================================

export interface PromptVariant {
  id: string;
  name: string;
  template: string;
  weight: number; // 0-1
  metrics: {
    impressions: number;
    successes: number;
    avgLatency: number;
    totalLatency: number;
  };
}

export interface ABTestResult {
  variantId: string;
  impressions: number;
  successRate: number;
  avgLatency: number;
}

export class PromptABTestFramework {
  private variants = new Map<string, PromptVariant>();
  private activeTest: string | null = null;

  addVariant(variant: Omit<PromptVariant, 'metrics'>): PromptVariant {
    const fullVariant: PromptVariant = {
      ...variant,
      metrics: { impressions: 0, successes: 0, avgLatency: 0, totalLatency: 0 }
    };
    this.variants.set(variant.id, fullVariant);
    return fullVariant;
  }

  startTest(testId: string, variantIds: string[]): void {
    const missing = variantIds.filter(id => !this.variants.has(id));
    if (missing.length > 0) {
      throw new Error(`Variants not found: ${missing.join(', ')}`);
    }
    this.activeTest = testId;
    console.log(`[ABTest] Started test "${testId}" with ${variantIds.length} variants`);
  }

  selectVariant(): PromptVariant {
    const available = Array.from(this.variants.values());
    if (available.length === 0) {
      throw new Error('No variants available');
    }

    // 按权重随机选择
    const totalWeight = available.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;

    for (const variant of available) {
      random -= variant.weight;
      if (random <= 0) {
        variant.metrics.impressions++;
        return variant;
      }
    }

    return available[available.length - 1];
  }

  recordResult(variantId: string, success: boolean, latencyMs: number): void {
    const variant = this.variants.get(variantId);
    if (!variant) return;

    variant.metrics.impressions++;
    if (success) variant.metrics.successes++;
    variant.metrics.totalLatency += latencyMs;
    variant.metrics.avgLatency = variant.metrics.totalLatency / variant.metrics.impressions;
  }

  getResults(): ABTestResult[] {
    return Array.from(this.variants.values()).map(v => ({
      variantId: v.id,
      impressions: v.metrics.impressions,
      successRate: v.metrics.impressions > 0 ? v.metrics.successes / v.metrics.impressions : 0,
      avgLatency: v.metrics.avgLatency
    }));
  }

  getWinner(): PromptVariant | null {
    const results = this.getResults();
    if (results.length === 0) return null;

    results.sort((a, b) => b.successRate - a.successRate);
    const winner = this.variants.get(results[0].variantId);
    return winner || null;
  }
}

// ============================================================================
// 6. 使用示例
// ============================================================================

export async function demo(): Promise<void> {
  console.log('=== Prompt Engineering 模式 ===\n');

  // 1. Prompt 模板引擎
  console.log('1. Prompt 模板引擎');
  const engine = new PromptTemplateEngine();
  engine.register('greeting', 'Hello {{name}}, welcome to {{platform}}! Your role is {{role}}.');
  const rendered = engine.render('greeting', {
    name: 'Alice',
    platform: 'AI Lab',
    role: 'developer'
  });
  console.log('   Rendered:', rendered);

  // 2. Few-shot Prompt
  console.log('\n2. Few-shot Prompt 构建器');
  const fewShot = new FewShotPromptBuilder({
    prefix: 'Translate English to French.',
    examples: [
      { input: 'hello', output: 'bonjour', reasoning: 'Direct greeting translation' },
      { input: 'goodbye', output: 'au revoir' }
    ],
    suffix: 'Input: {{input}}\nOutput:'
  });
  const fewShotPrompt = fewShot.build('thank you');
  console.log('   Prompt:');
  console.log(fewShotPrompt.split('\n').map(l => '   ' + l).join('\n'));

  // 3. Chain-of-Thought
  console.log('\n3. Chain-of-Thought Prompt 生成器');
  const cot = new ChainOfThoughtPromptGenerator(
    'You are a math expert. Solve problems step by step.'
  );
  cot.addStep({
    observation: 'There are 15 trees in the grove. 3 more trees are planted.',
    thought: 'I start with 15 trees. 3 more means 15 + 3 = 18.',
    action: 'Answer: 18'
  });
  const cotPrompt = cot.generate('A juggler has 16 balls. He loses 4. How many remain?', true);
  console.log('   Prompt preview (first 200 chars):', cotPrompt.slice(0, 200) + '...');

  // ReAct 格式
  const reactPrompt = cot.generateReAct('What is the weather in Tokyo?', [
    { name: 'search', description: 'Search the web for information' },
    { name: 'calculator', description: 'Perform calculations' }
  ]);
  console.log('   ReAct preview (first 200 chars):', reactPrompt.slice(0, 200) + '...');

  // 4. 结构化输出
  console.log('\n4. 结构化输出 Prompt');
  const structuredPrompt = StructuredOutputPrompt.generate({
    description: 'Extract person information from the text.',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Person\'s full name' },
        age: { type: 'number', description: 'Person\'s age' },
        hobbies: { type: 'array', items: { type: 'string' }, description: 'List of hobbies' }
      },
      required: ['name', 'age']
    },
    examples: [
      { name: 'John Doe', age: 30, hobbies: ['reading', 'coding'] }
    ]
  });
  console.log('   Prompt preview (first 250 chars):', structuredPrompt.slice(0, 250) + '...');

  // 解析示例
  const mockResponse = '```json\n{"name": "Jane Smith", "age": 25, "hobbies": ["painting"]}\n```';
  const parsed = StructuredOutputPrompt.parse<{ name: string; age: number; hobbies: string[] }>(mockResponse);
  console.log('   Parsed:', JSON.stringify(parsed));

  // 5. A/B 测试框架
  console.log('\n5. Prompt A/B 测试框架');
  const abTest = new PromptABTestFramework();
  abTest.addVariant({
    id: 'v1',
    name: 'Direct prompt',
    template: 'Answer this question: {{question}}',
    weight: 0.5
  });
  abTest.addVariant({
    id: 'v2',
    name: 'Step-by-step prompt',
    template: 'Think step by step to answer: {{question}}',
    weight: 0.5
  });
  abTest.startTest('test-001', ['v1', 'v2']);

  // 模拟多次选择
  for (let i = 0; i < 10; i++) {
    const variant = abTest.selectVariant();
    const success = Math.random() > 0.3;
    abTest.recordResult(variant.id, success, 100 + Math.random() * 200);
  }

  const results = abTest.getResults();
  console.log('   Results:');
  for (const r of results) {
    console.log(`     ${r.variantId}: impressions=${r.impressions}, successRate=${r.successRate.toFixed(2)}, avgLatency=${r.avgLatency.toFixed(0)}ms`);
  }

  const winner = abTest.getWinner();
  console.log(`   Winner: ${winner?.name} (${winner?.id})`);

  console.log('\nPrompt Engineering 要点:');
  console.log('- 模板引擎: 分离 prompt 结构与数据，便于复用和维护');
  console.log('- Few-shot: 通过示例引导模型行为，提高输出质量');
  console.log('- Chain-of-Thought: 显式推理步骤，提升复杂问题准确率');
  console.log('- 结构化输出: 强制 JSON 格式，便于程序化处理');
  console.log('- A/B 测试: 数据驱动地优化 prompt 效果');
}
