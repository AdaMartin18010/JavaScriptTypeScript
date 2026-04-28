import { describe, it, expect } from 'vitest';
import {
  PromptTemplateEngine,
  FewShotPromptBuilder,
  ChainOfThoughtPromptGenerator,
  StructuredOutputPrompt,
  PromptABTestFramework
} from './prompt-engineering.js';

describe('PromptTemplateEngine', () => {
  it('renders template with variables', () => {
    const engine = new PromptTemplateEngine();
    engine.register('test', 'Hello {{name}}, welcome to {{place}}!');
    const result = engine.render('test', { name: 'Alice', place: 'World' });
    expect(result).toBe('Hello Alice, welcome to World!');
  });

  it('throws on missing template', () => {
    const engine = new PromptTemplateEngine();
    expect(() => engine.render('missing', {})).toThrow('not found');
  });
});

describe('FewShotPromptBuilder', () => {
  it('builds few-shot prompt', () => {
    const builder = new FewShotPromptBuilder({
      prefix: 'Translate',
      examples: [{ input: 'hi', output: 'hola' }],
      suffix: 'Input: {{input}}\nOutput:'
    });
    const prompt = builder.build('bye');
    expect(prompt).toContain('Translate');
    expect(prompt).toContain('Input: bye');
  });

  it('chains example additions', () => {
    const builder = new FewShotPromptBuilder({
      prefix: '',
      examples: [],
      suffix: ''
    });
    builder.addExample({ input: 'a', output: 'b' });
    expect(builder.build('x')).toContain('Example 1');
  });
});

describe('ChainOfThoughtPromptGenerator', () => {
  it('generates CoT prompt', () => {
    const cot = new ChainOfThoughtPromptGenerator();
    cot.addStep({ observation: '2+2', thought: 'addition', action: '4' });
    const prompt = cot.generate('What is 3+3?', true);
    expect(prompt).toContain('step by step');
    expect(prompt).toContain('Observation: 2+2');
    expect(prompt).toContain('Question: What is 3+3?');
  });

  it('generates ReAct prompt', () => {
    const cot = new ChainOfThoughtPromptGenerator();
    const prompt = cot.generateReAct('What time is it?', [
      { name: 'clock', description: 'Get current time' }
    ]);
    expect(prompt).toContain('Final Answer:');
    expect(prompt).toContain('Thought:');
    expect(prompt).toContain('Action:');
  });
});

describe('StructuredOutputPrompt', () => {
  it('generates JSON schema prompt', () => {
    const prompt = StructuredOutputPrompt.generate({
      description: 'Extract info',
      schema: {
        type: 'object',
        properties: { name: { type: 'string' } },
        required: ['name']
      }
    });
    expect(prompt).toContain('valid JSON only');
    expect(prompt).toContain('"type": "object"');
  });

  it('parses JSON from markdown response', () => {
    const parsed = StructuredOutputPrompt.parse<{ name: string }>(
      '```json\n{"name": "test"}\n```'
    );
    expect(parsed.name).toBe('test');
  });

  it('parses plain JSON response', () => {
    const parsed = StructuredOutputPrompt.parse<{ age: number }>('{"age": 25}');
    expect(parsed.age).toBe(25);
  });
});

describe('PromptABTestFramework', () => {
  it('selects variants by weight', () => {
    const ab = new PromptABTestFramework();
    ab.addVariant({ id: 'a', name: 'A', template: 'A', weight: 1 });
    ab.addVariant({ id: 'b', name: 'B', template: 'B', weight: 0 });
    ab.startTest('t1', ['a', 'b']);
    expect(ab.selectVariant().id).toBe('a');
  });

  it('tracks results and finds winner', () => {
    const ab = new PromptABTestFramework();
    ab.addVariant({ id: 'win', name: 'Win', template: 'w', weight: 1 });
    ab.addVariant({ id: 'lose', name: 'Lose', template: 'l', weight: 0 });
    ab.startTest('t1', ['win', 'lose']);

    const v = ab.selectVariant();
    ab.recordResult(v.id, true, 100);

    const winner = ab.getWinner();
    expect(winner?.id).toBe('win');
    expect(ab.getResults()[0].successRate).toBe(0.5);
  });
});
