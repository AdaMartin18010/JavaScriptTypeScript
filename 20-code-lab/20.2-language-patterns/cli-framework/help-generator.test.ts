import { describe, it, expect } from 'vitest'
import { HelpGenerator } from './help-generator.js'

describe('help-generator', () => {
  it('HelpGenerator is defined', () => {
    expect(typeof HelpGenerator).not.toBe('undefined');
  });

  it('generates help with program name', () => {
    const gen = new HelpGenerator({ programName: 'myapp', version: '1.0.0' });
    const help = gen.generate([]);
    expect(help).toContain('myapp');
    expect(help).toContain('1.0.0');
  });

  it('generates command list', () => {
    const gen = new HelpGenerator({ programName: 'myapp', version: '1.0.0' });
    const help = gen.generate([
      { name: 'init', description: 'Initialize project' },
      { name: 'build', description: 'Build project' }
    ]);
    expect(help).toContain('init');
    expect(help).toContain('Initialize project');
    expect(help).toContain('build');
  });

  it('generates command-specific help', () => {
    const gen = new HelpGenerator({ programName: 'myapp', version: '1.0.0' });
    const help = gen.generateForCommand({
      name: 'init',
      description: 'Initialize a project',
      arguments: [{ name: 'name', required: true, description: 'Project name' }],
      flags: [{ name: 'template', type: 'string', default: 'default', description: 'Template name' }],
      examples: ['init my-app --template=react']
    });
    expect(help).toContain('init');
    expect(help).toContain('Project name');
    expect(help).toContain('template');
    expect(help).toContain('Examples');
  });

  it('includes aliases in help', () => {
    const gen = new HelpGenerator({ programName: 'myapp', version: '1.0.0' });
    const help = gen.generate([
      { name: 'generate', description: 'Generate code', aliases: ['g'] }
    ]);
    expect(help).toContain('g');
  });

  it('includes global flags', () => {
    const gen = new HelpGenerator({
      programName: 'myapp',
      version: '1.0.0',
      globalFlags: [{ name: 'verbose', alias: 'v', type: 'boolean', description: 'Verbose output' }]
    });
    const help = gen.generate([]);
    expect(help).toContain('Global Options');
    expect(help).toContain('verbose');
  });
});
