/**
 * @file Error.isError Tests (ES2026 Preview)
 * @category ECMAScript Evolution → ES2026 Preview
 */

import { describe, it, expect } from 'vitest';
import {
  isErrorIsErrorSupported,
  detectRealError,
  crossRealmDetection,
  comparisonDemo,
  subclassDetection,
} from './error-is-error.js';

const hasErrorIsError = typeof (Error as unknown as { isError?: Function }).isError === 'function';

describe('ES2026 Error.isError', () => {
  it('isErrorIsErrorSupported', () => {
    expect(isErrorIsErrorSupported()).toBe(hasErrorIsError);
  });

  it('detectRealError', () => {
    const result = detectRealError();
    if (hasErrorIsError) {
      expect(result).toBe(true);
    } else {
      expect(result).toBe('Error.isError not supported');
    }
  });

  it('crossRealmDetection', () => {
    const result = crossRealmDetection();
    if (hasErrorIsError) {
      expect(result).toBe(false);
    } else {
      expect(result).toBe('Error.isError not supported');
    }
  });

  it('comparisonDemo', () => {
    const result = comparisonDemo();
    expect(result.realErrorInstanceof).toBe(true);
    expect(result.plainObjectInstanceof).toBe(false);
    if (hasErrorIsError) {
      expect(result.realErrorIsError).toBe(true);
      expect(result.plainObjectIsError).toBe(false);
    }
  });

  it('subclassDetection', () => {
    const result = subclassDetection();
    if (hasErrorIsError) {
      expect(result.typeError).toBe(true);
      expect(result.rangeError).toBe(true);
      expect(result.syntaxError).toBe(true);
    } else {
      expect(result.typeError).toBe('not supported');
      expect(result.rangeError).toBe('not supported');
      expect(result.syntaxError).toBe('not supported');
    }
  });
});
