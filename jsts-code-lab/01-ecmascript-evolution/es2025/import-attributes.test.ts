/**
 * @file Import Attributes Tests (ES2025)
 * @category ECMAScript Evolution → ES2025
 */

import { describe, it, expect } from 'vitest';
import {
  buildImportAttributes,
  assertConfig,
  mismatchErrorExplanation,
} from './import-attributes.js';

describe('ES2025 Import Attributes', () => {
  it('buildImportAttributes', () => {
    expect(buildImportAttributes('json')).toEqual({ with: { type: 'json' } });
  });

  it('assertConfig', () => {
    const input = { default: { name: 'test', version: '1.0.0' } };
    expect(assertConfig(input)).toEqual({ name: 'test', version: '1.0.0' });
  });

  it('mismatchErrorExplanation', () => {
    expect(mismatchErrorExplanation()).toContain('.txt');
  });
});
