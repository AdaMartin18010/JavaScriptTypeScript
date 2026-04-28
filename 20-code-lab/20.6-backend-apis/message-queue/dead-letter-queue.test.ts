import { describe, it, expect } from 'vitest';
import { DeadLetterQueue, DLQConsumer } from './dead-letter-queue.js';

describe('DeadLetterQueue', () => {
  it('enqueues failed messages', () => {
    const dlq = new DeadLetterQueue();
    const msg = dlq.enqueue('1', 'orders', { id: 1 }, 'failed');
    expect(msg.id).toBe('1');
    expect(msg.originalTopic).toBe('orders');
    expect(dlq.getSize()).toBe(1);
  });

  it('returns retryable messages', () => {
    const dlq = new DeadLetterQueue({ maxRetries: 3 });
    dlq.enqueue('1', 'orders', { id: 1 }, 'failed', 0);
    dlq.enqueue('2', 'orders', { id: 2 }, 'failed', 3);
    const retryable = dlq.getRetryableMessages();
    expect(retryable).toHaveLength(1);
    expect(retryable[0].id).toBe('1');
  });

  it('calculates retry delay from config', () => {
    const dlq = new DeadLetterQueue({ retryDelays: [100, 500, 1000] });
    const msg = dlq.enqueue('1', 'orders', { id: 1 }, 'failed', 1);
    expect(dlq.getRetryDelay(msg)).toBe(500);
  });

  it('uses last delay when retry count exceeds config length', () => {
    const dlq = new DeadLetterQueue({ retryDelays: [100, 500] });
    const msg = dlq.enqueue('1', 'orders', { id: 1 }, 'failed', 5);
    expect(dlq.getRetryDelay(msg)).toBe(500);
  });

  it('successfully retries and removes message', async () => {
    const dlq = new DeadLetterQueue();
    dlq.enqueue('1', 'orders', { id: 1 }, 'failed', 0);
    const success = await dlq.retry('1', async () => {});
    expect(success).toBe(true);
    expect(dlq.getSize()).toBe(0);
  });

  it('increments retry count on failed retry', async () => {
    const dlq = new DeadLetterQueue();
    dlq.enqueue('1', 'orders', { id: 1 }, 'failed', 0);
    const success = await dlq.retry('1', async () => { throw new Error('fail'); });
    expect(success).toBe(false);
    const msg = dlq.getMessages()[0];
    expect(msg.retryCount).toBe(1);
  });

  it('returns false for non-existent message retry', async () => {
    const dlq = new DeadLetterQueue();
    const success = await dlq.retry('missing', async () => {});
    expect(success).toBe(false);
  });

  it('returns false when max retries exceeded', async () => {
    const dlq = new DeadLetterQueue({ maxRetries: 1 });
    dlq.enqueue('1', 'orders', { id: 1 }, 'failed', 1);
    const success = await dlq.retry('1', async () => {});
    expect(success).toBe(false);
  });

  it('groups stats by topic', () => {
    const dlq = new DeadLetterQueue();
    dlq.enqueue('1', 'orders', {}, 'fail');
    dlq.enqueue('2', 'orders', {}, 'fail');
    dlq.enqueue('3', 'payments', {}, 'fail');
    expect(dlq.getStatsByTopic()).toEqual({ orders: 2, payments: 1 });
  });

  it('purges expired messages', () => {
    const dlq = new DeadLetterQueue({ retentionPeriod: 1000 });
    dlq.enqueue('1', 'orders', {}, 'fail');
    const purged = dlq.purgeExpired();
    expect(purged).toBe(0);

    // Simulate time passing by manually manipulating
    const msg = dlq.getMessages()[0];
    msg.timestamp = Date.now() - 2000;
    const purgedAfter = dlq.purgeExpired();
    expect(purgedAfter).toBe(1);
  });

  it('notifies handlers on enqueue', () => {
    const dlq = new DeadLetterQueue();
    let received = false;
    dlq.onDeadLetter(() => { received = true; });
    dlq.enqueue('1', 'orders', {}, 'fail');
    expect(received).toBe(true);
  });

  it('clears all messages', () => {
    const dlq = new DeadLetterQueue();
    dlq.enqueue('1', 'orders', {}, 'fail');
    dlq.clear();
    expect(dlq.getSize()).toBe(0);
  });
});

describe('DLQConsumer', () => {
  it('consumes successfully without DLQ', async () => {
    const consumer = new DLQConsumer(async () => {});
    await consumer.consume({ id: '1', topic: 'orders', payload: {} });
    expect(consumer.getDLQ().getSize()).toBe(0);
  });

  it('sends failed consumption to DLQ', async () => {
    const consumer = new DLQConsumer(async () => { throw new Error('fail'); });
    await consumer.consume({ id: '1', topic: 'orders', payload: { id: 1 } });
    expect(consumer.getDLQ().getSize()).toBe(1);
    expect(consumer.getDLQ().getMessages()[0].payload).toEqual({ id: 1 });
  });

  it('retries all retryable messages', async () => {
    let attempts = 0;
    const consumer = new DLQConsumer(async () => {
      attempts++;
      if (attempts < 2) throw new Error('fail');
    });

    await consumer.consume({ id: '1', topic: 'orders', payload: {} });
    await consumer.consume({ id: '2', topic: 'orders', payload: {} });

    const result = await consumer.retryAll();
    expect(result.success + result.failed).toBeGreaterThan(0);
  });
});
