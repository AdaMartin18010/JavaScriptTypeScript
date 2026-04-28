import { describe, it, expect, vi } from 'vitest';
import { CLIBuilder, ProgressBar, Spinner, InteractivePrompt } from './cli-builder.js';

describe('CLIBuilder', () => {
  it('shows help for --help', () => {
    const cli = new CLIBuilder('app', '1.0');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    cli.parse(['--help']);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('app'));
    logSpy.mockRestore();
  });

  it('shows version for --version', () => {
    const cli = new CLIBuilder('app', '1.0');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    cli.parse(['--version']);
    expect(logSpy).toHaveBeenCalledWith('app v1.0');
    logSpy.mockRestore();
  });

  it('executes command action with parsed args', () => {
    const cli = new CLIBuilder('app');
    const action = vi.fn();
    cli.command({ name: 'run', description: 'run it', arguments: [{ name: 'name', required: true, description: 'arg' }], action });
    cli.parse(['run', 'arg1']);
    expect(action).toHaveBeenCalledWith({ name: 'arg1' }, {});
  });
});

describe('ProgressBar', () => {
  it('renders progress to stdout', () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const bar = new ProgressBar(5);
    bar.increment();
    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('%'));
    writeSpy.mockRestore();
  });
});

describe('Spinner', () => {
  it('starts and stops without error', () => {
    const spinner = new Spinner('working');
    spinner.start();
    spinner.stop('done');
  });
});

describe('InteractivePrompt', () => {
  it('ask returns default value', async () => {
    const prompt = new InteractivePrompt();
    const result = await prompt.ask('Name?', 'default');
    expect(result).toBe('default');
  });

  it('confirm returns default', async () => {
    const prompt = new InteractivePrompt();
    expect(await prompt.confirm('Ok?', true)).toBe(true);
    expect(await prompt.confirm('Ok?', false)).toBe(false);
  });
});
