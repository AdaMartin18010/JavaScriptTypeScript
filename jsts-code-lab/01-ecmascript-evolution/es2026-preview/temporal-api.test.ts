/**
 * @file Temporal API Tests (ES2026 Preview)
 * @category ECMAScript Evolution → ES2026 Preview
 */

import { describe, it, expect } from 'vitest';
import {
  isTemporalSupported,
  plainDateDemo,
  durationDemo,
  instantDemo,
  immutabilityComparison,
} from './temporal-api.js';

const hasTemporal = typeof (globalThis as unknown as { Temporal?: unknown }).Temporal !== 'undefined';

describe('ES2026 Temporal API', () => {
  it('isTemporalSupported', () => {
    expect(isTemporalSupported()).toBe(hasTemporal);
  });

  it('plainDateDemo', () => {
    const result = plainDateDemo();
    if (hasTemporal) {
      expect(typeof (result as { today: string }).today).toBe('string');
    } else {
      expect(result).toBe('Temporal not supported');
    }
  });

  it('durationDemo', () => {
    const result = durationDemo();
    if (hasTemporal) {
      expect(typeof (result as { result: string }).result).toBe('string');
    } else {
      expect(result).toBe('Temporal not supported');
    }
  });

  it('instantDemo', () => {
    const result = instantDemo();
    if (hasTemporal) {
      expect(typeof (result as { instant: string }).instant).toBe('string');
    } else {
      expect(result).toBe('Temporal not supported');
    }
  });

  it('immutabilityComparison', () => {
    const result = immutabilityComparison();
    expect(result.dateMutable).toBe(true);
    if (hasTemporal) {
      expect(result.temporalImmutable).toBe(true);
    }
  });
});
