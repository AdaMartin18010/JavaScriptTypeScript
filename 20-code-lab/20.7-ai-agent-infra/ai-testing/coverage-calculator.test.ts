import { describe, it, expect } from 'vitest';
import { CoverageCollector, CodeAnalyzer, CoverageCalculator } from './coverage-calculator.js';

describe('CoverageCollector', () => {
  it('tracks line hits', () => {
    const collector = new CoverageCollector();
    collector.hitLine('file.ts', 5);
    collector.hitLine('file.ts', 5);
    const hits = collector.getLineHits('file.ts');
    expect(hits.get(5)).toBe(2);
  });

  it('tracks branch hits', () => {
    const collector = new CoverageCollector();
    collector.hitBranch('file.ts', 10, 0, true);
    const hits = collector.getBranchHits('file.ts');
    expect(hits.get('file.ts:10:0:true')).toBe(true);
  });

  it('clears all data', () => {
    const collector = new CoverageCollector();
    collector.hitLine('file.ts', 1);
    collector.clear();
    expect(collector.getLineHits('file.ts').size).toBe(0);
  });
});

describe('CodeAnalyzer', () => {
  it('identifies executable lines', () => {
    const analyzer = new CodeAnalyzer();
    const result = analyzer.analyze('function add(a, b) {\n  return a + b;\n}');
    expect(result.executableLines.length).toBeGreaterThan(0);
  });

  it('identifies functions', () => {
    const analyzer = new CodeAnalyzer();
    const result = analyzer.analyze('function foo() {}\nconst bar = () => {}');
    expect(result.functions.length).toBe(2);
    expect(result.functions.some(f => f.name === 'foo')).toBe(true);
    expect(result.functions.some(f => f.name === 'bar')).toBe(true);
  });

  it('identifies branches', () => {
    const analyzer = new CodeAnalyzer();
    const result = analyzer.analyze('if (x > 0) { return 1; }');
    expect(result.branches.length).toBeGreaterThan(0);
  });
});

describe('CoverageCalculator', () => {
  it('calculates file coverage', () => {
    const calculator = new CoverageCalculator();
    const collector = new CoverageCollector();
    const code = 'function add(a, b) {\n  return a + b;\n}\nfunction sub(a, b) {\n  return a - b;\n}';

    collector.hitLine('math.ts', 2);
    collector.hitFunction('math.ts', 'add', 1);

    const coverage = calculator.calculateFileCoverage('math.ts', code, collector);
    expect(coverage.lineRate).toBeGreaterThan(0);
    expect(coverage.lineRate).toBeLessThan(1);
  });

  it('calculates full report', () => {
    const calculator = new CoverageCalculator();
    const collector = new CoverageCollector();
    const code = 'function add(a, b) { return a + b; }';

    collector.hitLine('math.ts', 1);
    collector.hitFunction('math.ts', 'add', 1);

    const fileCoverage = calculator.calculateFileCoverage('math.ts', code, collector);
    const report = calculator.calculateReport([fileCoverage]);

    expect(report.totalLineRate).toBeGreaterThan(0);
    expect(report.files.length).toBe(1);
  });

  it('formats report as string', () => {
    const calculator = new CoverageCalculator();
    const report = calculator.calculateReport([]);
    const formatted = calculator.formatReport(report);
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('Coverage Report');
  });
});
