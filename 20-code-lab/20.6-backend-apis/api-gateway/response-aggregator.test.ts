import { describe, it, expect } from 'vitest';
import {
  ResponseAggregator,
  MergeStrategy,
  ArrayStrategy,
  FirstSuccessStrategy,
  VotingStrategy,
  AggregationError
} from './response-aggregator.js';

describe('ResponseAggregator', () => {
  it('aggregates successful responses', async () => {
    const aggregator = new ResponseAggregator();
    const results = await aggregator.aggregate(
      [{ serviceId: 'a', url: '/' }, { serviceId: 'b', url: '/' }],
      async () => ({ data: 'ok' })
    );
    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
  });

  it('marks failed responses', async () => {
    const aggregator = new ResponseAggregator({ timeout: 50 });
    const results = await aggregator.aggregate(
      [{ serviceId: 'a', url: '/' }],
      async () => new Promise((_, reject) => setTimeout(reject, 100))
    );
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('Timeout');
  });

  it('uses per-request timeout', async () => {
    const aggregator = new ResponseAggregator({ timeout: 5000 });
    const results = await aggregator.aggregate(
      [{ serviceId: 'a', url: '/', timeout: 50 }],
      async () => new Promise((_, reject) => setTimeout(reject, 100))
    );
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('Timeout');
  });

  it('supports fail-fast with required services', async () => {
    const aggregator = new ResponseAggregator({
      failFast: true,
      requiredServices: ['a']
    });
    const results = await aggregator.aggregateWithFailFast(
      [
        { serviceId: 'a', url: '/' },
        { serviceId: 'b', url: '/' }
      ],
      async req => {
        if (req.serviceId === 'a') throw new Error('fail');
        return { data: 'ok' };
      }
    );
    expect(results.some(r => r.serviceId === 'a' && !r.success)).toBe(true);
  });
});

describe('Aggregation Strategies', () => {
  const responses = [
    { serviceId: 'a', success: true, data: { name: 'Alice' }, responseTime: 10 },
    { serviceId: 'b', success: true, data: { age: 30 }, responseTime: 15 },
    { serviceId: 'c', success: false, error: 'timeout', responseTime: 100 }
  ];

  it('merges object data', () => {
    const result = MergeStrategy.aggregate(responses);
    expect(result).toEqual({ name: 'Alice', age: 30 });
  });

  it('returns array of all responses', () => {
    const result = ArrayStrategy.aggregate(responses);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(3);
  });

  it('returns first successful data', () => {
    const result = FirstSuccessStrategy.aggregate(responses);
    expect(result).toEqual({ name: 'Alice' });
  });

  it('returns first successful even with failures first', () => {
    const reversed = [...responses].reverse();
    const result = FirstSuccessStrategy.aggregate(reversed);
    expect(result).toEqual({ age: 30 });
  });

  it('returns null when all fail', () => {
    const allFailed = responses.map(r => ({ ...r, success: false }));
    const result = FirstSuccessStrategy.aggregate(allFailed);
    expect(result).toBeNull();
  });

  it('calculates voting result', () => {
    const result = VotingStrategy.aggregate(responses);
    expect(result).toEqual({
      total: 3,
      successful: 2,
      failed: 1,
      consensus: true
    });
  });

  it('reports no consensus when minority success', () => {
    const mostlyFailed = [
      { serviceId: 'a', success: true, responseTime: 10 },
      { serviceId: 'b', success: false, responseTime: 10 },
      { serviceId: 'c', success: false, responseTime: 10 }
    ];
    const result = VotingStrategy.aggregate(mostlyFailed);
    expect(result.consensus).toBe(false);
  });
});

describe('AggregationError', () => {
  it('is an instance of Error', () => {
    const error = new AggregationError('test');
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('AggregationError');
    expect(error.message).toBe('test');
  });
});
