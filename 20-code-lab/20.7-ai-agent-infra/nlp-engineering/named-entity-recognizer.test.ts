import { describe, it, expect } from 'vitest';
import { NamedEntityRecognizer } from './named-entity-recognizer.js';

describe('NamedEntityRecognizer', () => {
  it('should extract email and url', () => {
    const ner = new NamedEntityRecognizer();
    const text = 'Reach out to alice@example.com or see https://example.com';
    const entities = ner.extract(text);
    const types = entities.map(e => e.type);
    expect(types).toContain('EMAIL');
    expect(types).toContain('URL');
  });

  it('should add custom pattern', () => {
    const ner = new NamedEntityRecognizer();
    ner.addPattern('ID', /ID-\d{4}/g);
    const entities = ner.extract('User ID-1234 logged in');
    expect(entities.some(e => e.type === 'ID' && e.text === 'ID-1234')).toBe(true);
  });
});
