/**
 * @file RegExp Modifiers Tests (ES2025)
 * @category ECMAScript Evolution → ES2025
 */

import { describe, it, expect } from 'vitest';
import {
  localIgnoreCaseDemo,
  localMultilineDemo,
  nestedFlagsDemo,
  passwordValidationDemo,
  duplicateNamedGroupsDemo,
} from './regexp-modifiers.js';

const hasRegExpModifiers = (() => {
  try {
    return new RegExp('(?-i:a)', 'i').test('A');
  } catch {
    return false;
  }
})();

const itIf = hasRegExpModifiers ? it : it.skip;

describe('ES2025 RegExp Modifiers', () => {
  itIf('localIgnoreCaseDemo', () => {
    expect(localIgnoreCaseDemo()).toBe(true);
  });

  itIf('localMultilineDemo', () => {
    const result = localMultilineDemo();
    expect(Array.isArray(result)).toBe(true);
  });

  itIf('nestedFlagsDemo', () => {
    expect(nestedFlagsDemo()).toBe(true);
  });

  itIf('passwordValidationDemo', () => {
    expect(passwordValidationDemo('Alice1')).toBe(true);
    expect(passwordValidationDemo('alice1')).toBe(false);
  });

  itIf('duplicateNamedGroupsDemo', () => {
    const result = duplicateNamedGroupsDemo('2026-04-17');
    expect(result).toEqual({ day: '17', month: '04', year: '2026' });
  });
});
