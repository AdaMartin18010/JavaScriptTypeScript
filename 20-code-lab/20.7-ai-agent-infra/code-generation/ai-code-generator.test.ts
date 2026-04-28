import { describe, it, expect } from 'vitest';
import { AICodeGenerator } from '\./ai-code-generator.js';

describe('AICodeGenerator', () => {
  it('generates template with variable substitution', () => {
    const gen = new AICodeGenerator();
    const result = gen.generate('react-component', { ComponentName: 'UserList', componentName: 'userlist', props: 'items?: any[]' });
    expect(result).toContain('UserList');
    expect(result).toContain('items?: any[]');
  });

  it('generates component from description', async () => {
    const gen = new AICodeGenerator();
    const code = await gen.generateFromDescription('创建一个UserList用户列表组件');
    expect(code).toContain('UserList');
    expect(code).toContain('react');
  });

  it('generates api endpoint from description', async () => {
    const gen = new AICodeGenerator();
    const code = await gen.generateFromDescription('创建一个POST接口');
    expect(code).toContain('POST');
    expect(code).toContain('NextApiRequest');
  });

  it('returns unknown comment for unrecognized description', async () => {
    const gen = new AICodeGenerator();
    const code = await gen.generateFromDescription('random text');
    expect(code).toContain('Could not generate');
  });
});
