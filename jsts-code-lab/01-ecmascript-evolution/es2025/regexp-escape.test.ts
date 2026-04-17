/**
 * @file RegExp.escape Tests (ES2025)
 * @category ECMAScript Evolution → ES2025
 */

import { describe, it, expect } from 'vitest';
import {
  basicEscapeDemo,
  safeUserInputDemo,
  searchHighlightDemo,
  specialCharsDemo,
  unicodeDemo,
} from './regexp-escape.js';

const hasRegExpEscape = typeof (RegExp as unknown as { escape?: Function }).escape === 'function';
const itIf = hasRegExpEscape ? it : it.skip;

describe('ES2025 RegExp.escape', () => {
  itIf('basicEscapeDemo', () => {
    expect(basicEscapeDemo()).toBe('\\\\(\\\\*\\\\)');
  });

  itIf('safeUserInputDemo', () => {
    const re = safeUserInputDemo('(*)');
    expect(re.test('(*)')).toBe(true);
  });

  itIf('searchHighlightDemo', () => {
    expect(searchHighlightDemo('Hello world', 'world')).toBe('Hello **world**');
  });

  itIf('specialCharsDemo', () => {
    const result = specialCharsDemo();
    expect(result.newline).toContain('\\n');
    expect(result.tab).toContain('\\t');
    expect(result.slash).toContain('\\/');
  });

  itIf('unicodeDemo', () => {
    expect(unicodeDemo()).toContain('你');
  });
});
