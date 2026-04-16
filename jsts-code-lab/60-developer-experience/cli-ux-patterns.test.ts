import { describe, it, expect, vi } from 'vitest';
import { ProgressBar, Spinner, PromptSimulator, TableFormatter } from './cli-ux-patterns.js';

describe('ProgressBar', () => {
  it('renders progress to stdout', () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const bar = new ProgressBar({ total: 10, width: 10, label: 'Test' });
    bar.update(5);
    expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('50%'));
    bar.increment();
    writeSpy.mockRestore();
  });

  it('writes newline when complete', () => {
    const writeSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const bar = new ProgressBar({ total: 2 });
    bar.update(2);
    expect(writeSpy).toHaveBeenLastCalledWith('\n');
    writeSpy.mockRestore();
  });
});

describe('Spinner', () => {
  it('starts and stops without error', () => {
    const spinner = new Spinner({ text: 'Working', interval: 10 });
    spinner.start();
    spinner.succeed('Done');
  });
});

describe('PromptSimulator', () => {
  it('singleSelect returns selected value', () => {
    const prompt = new PromptSimulator();
    const result = prompt.singleSelect('Pick', [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }], 1);
    expect(result).toBe('b');
  });

  it('singleSelect clamps out-of-range index', () => {
    const prompt = new PromptSimulator();
    const result = prompt.singleSelect('Pick', [{ label: 'A', value: 'a' }], 5);
    expect(result).toBe('a');
  });

  it('multiSelect returns selected values', () => {
    const prompt = new PromptSimulator();
    const result = prompt.multiSelect('Pick', [{ label: 'A', value: 'a' }, { label: 'B', value: 'b' }, { label: 'C', value: 'c' }], [0, 2]);
    expect(result).toEqual(['a', 'c']);
  });
});

describe('TableFormatter', () => {
  it('formats rows into a table string', () => {
    const formatter = new TableFormatter();
    const output = formatter.format(
      [['build', '1.2s', 'success'], ['lint', '0.8s', 'warning']],
      [{ header: 'Task' }, { header: 'Duration', align: 'right' }, { header: 'Status' }]
    );
    expect(output).toContain('Task');
    expect(output).toContain('build');
    expect(output).toContain('1.2s');
  });
});
