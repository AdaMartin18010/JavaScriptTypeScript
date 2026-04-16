import { describe, it, expect, vi } from 'vitest';
import {
  PdfDataMiner,
  CsvDataMiner,
  OrcsAI,
  HumansAI,
  createTemplateMethod
} from './template-method.js';

describe('template method pattern', () => {
  it('PdfDataMiner should execute full mining algorithm', () => {
    const miner = new PdfDataMiner();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    miner.mine('document.pdf');

    expect(consoleSpy).toHaveBeenCalledWith('Opening PDF file: document.pdf');
    expect(consoleSpy).toHaveBeenCalledWith('Extracting data from PDF...');
    expect(consoleSpy).toHaveBeenCalledWith('Parsing PDF data...');
    expect(consoleSpy).toHaveBeenCalledWith('Analyzing data...');
    expect(consoleSpy).toHaveBeenCalledWith('Sending report: Analysis of 1 records');
    expect(consoleSpy).toHaveBeenCalledWith('Closing PDF file');

    consoleSpy.mockRestore();
  });

  it('CsvDataMiner should execute full mining algorithm', () => {
    const miner = new CsvDataMiner();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    miner.mine('data.csv');

    expect(consoleSpy).toHaveBeenCalledWith('Opening CSV file: data.csv');
    expect(consoleSpy).toHaveBeenCalledWith('Extracting data from CSV...');
    expect(consoleSpy).toHaveBeenCalledWith('Parsing CSV data...');
    expect(consoleSpy).toHaveBeenCalledWith('Closing CSV file');

    consoleSpy.mockRestore();
  });

  it('OrcsAI should execute turn with orc-specific actions', () => {
    const ai = new OrcsAI();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    ai.takeTurn();

    expect(consoleSpy).toHaveBeenCalledWith('Collecting resources...');
    expect(consoleSpy).toHaveBeenCalledWith('Building orc strongholds...');
    expect(consoleSpy).toHaveBeenCalledWith('Building units...');
    expect(consoleSpy).toHaveBeenCalledWith('Attacking enemy...');
    expect(consoleSpy).toHaveBeenCalledWith('Orc scout rushing to enemy base');
    expect(consoleSpy).toHaveBeenCalledWith('Orc warriors charging!');

    consoleSpy.mockRestore();
  });

  it('HumansAI should execute turn with human-specific actions', () => {
    const ai = new HumansAI();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    ai.takeTurn();

    expect(consoleSpy).toHaveBeenCalledWith('Building human castles...');
    expect(consoleSpy).toHaveBeenCalledWith('Human scouts patrolling');
    expect(consoleSpy).toHaveBeenCalledWith('Human soldiers marching');

    consoleSpy.mockRestore();
  });

  it('createTemplateMethod should execute steps with hooks', () => {
    const steps: string[] = [];
    const beforeHook = () => steps.push('before');
    const afterHook = () => steps.push('after');

    const process = createTemplateMethod(
      [() => steps.push('step1'), () => steps.push('step2')],
      { before: beforeHook, after: afterHook }
    );

    process();
    expect(steps).toEqual(['before', 'step1', 'step2', 'after']);
  });

  it('createTemplateMethod should work without hooks', () => {
    const steps: string[] = [];
    const process = createTemplateMethod([() => steps.push('a'), () => steps.push('b')]);
    process();
    expect(steps).toEqual(['a', 'b']);
  });
});
