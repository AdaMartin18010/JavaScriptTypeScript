import { describe, it, expect } from 'vitest';
import { TextPreprocessor } from './text-preprocessor.js';

describe('TextPreprocessor', () => {
  it('should tokenize text', () => {
    const p = new TextPreprocessor();
    expect(p.tokenize('Hello, world!')).toEqual(['hello', 'world']);
  });

  it('should remove stopwords', () => {
    const p = new TextPreprocessor();
    expect(p.removeStopwords(['the', 'quick', 'brown'])).toEqual(['quick', 'brown']);
  });

  it('should stem words', () => {
    const p = new TextPreprocessor();
    expect(p.stem('running')).toBe('runn'); // 简化词干提取仅去掉后缀
    expect(p.stem('jumped')).toBe('jump');
  });

  it('should generate bigrams', () => {
    const p = new TextPreprocessor();
    expect(p.generateNgrams(['a', 'b', 'c'], 2)).toEqual(['a_b', 'b_c']);
  });

  it('should run full preprocess', () => {
    const p = new TextPreprocessor();
    const result = p.preprocess('The cats are running');
    expect(result.tokens).toEqual(['cats', 'running']);
    // 简化词干提取仅去掉后缀，'running' -> 'runn'
    expect(result.stems).toEqual(['cats', 'runn']);
    expect(result.bigrams).toEqual(['cats_running']);
  });
});
