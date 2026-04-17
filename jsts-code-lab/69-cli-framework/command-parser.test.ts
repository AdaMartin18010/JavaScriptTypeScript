import { describe, it, expect } from 'vitest'
import { CommandParser } from './command-parser.js'

describe('command-parser', () => {
  it('CommandParser is defined', () => {
    expect(typeof CommandParser).not.toBe('undefined');
  });

  it('can instantiate CommandParser', () => {
    const parser = new CommandParser();
    expect(parser).toBeDefined();
  });

  it('parses command with positional args', () => {
    const parser = new CommandParser();
    parser.register({
      name: 'init',
      description: 'Initialize project',
      arguments: [{ name: 'name', required: true }]
    });

    const result = parser.parse(['init', 'my-project']);
    expect(result.command).toBe('init');
    expect(result.positional).toContain('my-project');
  });

  it('parses long flags with values', () => {
    const parser = new CommandParser();
    parser.register({
      name: 'build',
      description: 'Build project',
      flags: [{ name: 'output', type: 'string' }]
    });

    const result = parser.parse(['build', '--output=dist']);
    expect(result.flags.output).toBe('dist');
  });

  it('parses short flag aliases', () => {
    const parser = new CommandParser();
    parser.register({
      name: 'serve',
      description: 'Serve project',
      flags: [{ name: 'port', alias: 'p', type: 'number' }]
    });

    const result = parser.parse(['serve', '-p', '3000']);
    expect(result.flags.port).toBe(3000);
  });

  it('applies default flag values', () => {
    const parser = new CommandParser();
    parser.register({
      name: 'test',
      description: 'Run tests',
      flags: [{ name: 'watch', type: 'boolean', default: false }]
    });

    const result = parser.parse(['test']);
    expect(result.flags.watch).toBe(false);
  });

  it('resolves command aliases', () => {
    const parser = new CommandParser();
    parser.register({
      name: 'generate',
      description: 'Generate code',
      aliases: ['g', 'gen']
    });

    expect(parser.getCommand('g')?.name).toBe('generate');
  });

  it('throws on unknown command', () => {
    const parser = new CommandParser();
    expect(() => parser.parse(['unknown'])).toThrow('Unknown command');
  });

  it('throws on empty argv', () => {
    const parser = new CommandParser();
    expect(() => parser.parse([])).toThrow('No command provided');
  });
});
