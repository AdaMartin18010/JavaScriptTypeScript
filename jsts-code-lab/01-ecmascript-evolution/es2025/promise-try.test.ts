/**
 * @file Promise.try Tests (ES2025)
 * @category ECMAScript Evolution → ES2025
 */

import { describe, it, expect } from 'vitest';
import {
  basicErrorHandlingDemo,
  argumentPassingDemo,
  asyncAwaitIntegrationDemo,
  syncExceptionDemo,
  comparisonDemo,
} from './promise-try.js';

const hasPromiseTry = typeof (Promise as unknown as { try?: Function }).try === 'function';
const itIf = hasPromiseTry ? it : it.skip;

describe('ES2025 Promise.try', () => {
  itIf('basicErrorHandlingDemo', async () => {
    expect(await basicErrorHandlingDemo()).toBe('success');
  });

  itIf('argumentPassingDemo', async () => {
    expect(await argumentPassingDemo(2, 3)).toBe(5);
  });

  itIf('asyncAwaitIntegrationDemo', async () => {
    expect(await asyncAwaitIntegrationDemo()).toBe('async result');
  });

  itIf('syncExceptionDemo', async () => {
    await expect(syncExceptionDemo()).rejects.toThrow('sync error');
  });

  itIf('comparisonDemo', async () => {
    const result = comparisonDemo();
    expect(await result.promiseTry).toBe('caught by try: boom');
    expect(await result.promiseResolve).toBe('uncaught by resolve: boom');
  });
});
