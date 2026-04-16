import { describe, it, expect } from 'vitest';
import { encodeVLQ, decodeVLQ, SourceMapGenerator, SourceMapParser, StackTraceParser } from './source-maps';

describe('VLQ', () => {
  it('roundtrips common values', () => {
    const values = [0, 1, -1, 16, -16, 100, -100];
    for (const v of values) {
      const encoded = encodeVLQ(v);
      const { value } = decodeVLQ(encoded, 0);
      expect(value).toBe(v);
    }
  });

  it('throws on invalid character', () => {
    expect(() => decodeVLQ('!', 0)).toThrow('Invalid VLQ');
  });
});

describe('SourceMapGenerator', () => {
  it('generates a valid source map', () => {
    const gen = new SourceMapGenerator();
    gen.addMapping({ generated: { line: 1, column: 0 }, original: { line: 1, column: 0, source: 'a.ts' } });
    const map = gen.generate('out.js');
    expect(map.version).toBe(3);
    expect(map.sources).toContain('a.ts');
    expect(map.mappings).toBeDefined();
  });
});

describe('SourceMapParser', () => {
  it('parses generated mappings', () => {
    const gen = new SourceMapGenerator();
    gen.addMapping({ generated: { line: 1, column: 0 }, original: { line: 2, column: 4, source: 'a.ts', name: 'foo' } });
    const map = gen.generate('out.js');
    const parser = new SourceMapParser(map);
    const pos = parser.getOriginalPosition(1, 0);
    expect(pos).toEqual({ source: 'a.ts', line: 2, column: 4, name: 'foo' });
  });
});

describe('StackTraceParser', () => {
  it('parses stack frames', () => {
    const parser = new StackTraceParser();
    const frames = parser.parse('    at foo (app.js:10:5)\n    at bar (app.js:20:3)');
    expect(frames.length).toBe(2);
    expect(frames[0]).toEqual({ functionName: 'foo', fileName: 'app.js', lineNumber: 10, columnNumber: 5 });
  });

  it('remaps stack trace using source map', () => {
    const gen = new SourceMapGenerator();
    gen.addMapping({ generated: { line: 1, column: 10 }, original: { line: 5, column: 2, source: 'src.ts' } });
    const map = gen.generate('out.js');
    const parser = new StackTraceParser();
    const remapped = parser.remapStackTrace('Error\n    at foo (out.js:1:10)', map);
    expect(remapped).toContain('src.ts:5:2');
  });
});
