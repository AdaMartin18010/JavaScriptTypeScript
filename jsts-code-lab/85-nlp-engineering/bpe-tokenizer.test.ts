import { describe, it, expect } from 'vitest';
import { BPETokenizer } from './bpe-tokenizer.js';

describe('BPETokenizer', () => {
  it('should train and encode', () => {
    const tokenizer = new BPETokenizer(20);
    tokenizer.train(['low lower lowest', 'new newer newest']);
    expect(tokenizer.getVocabSize()).toBeGreaterThan(0);

    const ids = tokenizer.encode('low');
    expect(ids.length).toBeGreaterThan(0);
  });

  it('should decode to approximate text', () => {
    const tokenizer = new BPETokenizer(20);
    tokenizer.train(['low lower lowest']);
    const text = 'low';
    const ids = tokenizer.encode(text);
    const decoded = tokenizer.decode(ids);
    expect(decoded).toContain('l');
    expect(decoded).toContain('o');
  });
});
