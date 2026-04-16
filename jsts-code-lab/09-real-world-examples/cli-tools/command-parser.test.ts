import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseArgs, CLI, ProgressBar, type CommandHandler } from './command-parser';

describe('parseArgs', () => {
  it('should parse command and positional args', () => {
    const result = parseArgs(['init', 'my-project']);
    expect(result.command).toBe('init');
    expect(result.args).toEqual(['my-project']);
  });

  it('should parse long flags with values', () => {
    const result = parseArgs(['build', '--template=react']);
    expect(result.flags.get('template')).toBe('react');
  });

  it('should parse long flags with space-separated values', () => {
    const result = parseArgs(['build', '-o', './dist']);
    expect(result.flags.get('o')).toBe('./dist');
  });

  it('should parse boolean flags', () => {
    const result = parseArgs(['test', '--watch']);
    expect(result.flags.get('watch')).toBe(true);
  });

  it('should return empty command for flag-only input', () => {
    const result = parseArgs(['--help']);
    expect(result.command).toBe('');
    expect(result.flags.get('help')).toBe(true);
  });
});

describe('CLI', () => {
  let cli: CLI;
  let logs: string[];
  let errors: string[];

  beforeEach(() => {
    cli = new CLI();
    logs = [];
    errors = [];
    vi.spyOn(console, 'log').mockImplementation((msg: string) => logs.push(msg));
    vi.spyOn(console, 'error').mockImplementation((msg: string) => errors.push(msg));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should register and run a command', async () => {
    const handler = vi.fn<CommandHandler>();
    cli.command('test', 'Test command', handler);
    await cli.run(['test']);
    expect(handler).toHaveBeenCalled();
  });

  it('should show help when --help flag is passed', async () => {
    cli.command('test', 'Test command', () => {});
    await cli.run(['--help']);
    expect(logs.some(l => l.includes('Usage:'))).toBe(true);
  });

  it('should call default handler for unknown commands', async () => {
    const defaultHandler = vi.fn<CommandHandler>();
    cli.default(defaultHandler);
    await cli.run(['unknown']);
    expect(defaultHandler).toHaveBeenCalled();
  });

  it('should print help and exit for unknown commands when no default handler', async () => {
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    await cli.run(['unknown']);
    expect(errors.length).toBeGreaterThan(0);
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
  });

  it('should generate help text with registered commands', () => {
    cli.command('init', 'Initialize', () => {});
    cli.command('build', 'Build project', () => {});
    const help = cli.help();
    expect(help).toContain('init');
    expect(help).toContain('build');
  });
});

describe('ProgressBar', () => {
  let writeSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should update progress bar', () => {
    const bar = new ProgressBar(100, 20, 'Progress');
    bar.update(50);
    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('50%'));
  });

  it('should write newline when reaching 100%', () => {
    const bar = new ProgressBar(100, 20, 'Progress');
    bar.update(100);
    expect(writeSpy).toHaveBeenLastCalledWith('\n');
  });

  it('should increment progress', () => {
    const bar = new ProgressBar(10, 10, 'Progress');
    bar.increment();
    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('10%'));
  });
});
