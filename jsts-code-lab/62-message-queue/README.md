# 62-message-queue

Message queue patterns and implementations in TypeScript.

## Topics

| Topic | File | Description |
|---|---|---|
| Queue Implementation | `queue-implementation.ts` | In-memory message queue with PubSub, TaskQueue, DelayQueue |
| Pub/Sub | `pub-sub.ts` | Publish-subscribe messaging pattern |
| Task Queue | `task-queue.ts` | Priority task queue with retry handling |
| Delay Queue | `delay-queue.ts` | Scheduled/delayed message delivery |
| Message Broker | `message-broker.ts` | Central message routing and delivery |
| Stream Processing | `stream-processing.ts` | Event stream processing primitives |
| Dead Letter Queue | `dead-letter-queue.ts` | Failed message handling with retry and DLQ |
| Consumer Group | `consumer-group.ts` | Partitioned consumer groups with rebalancing |
| Priority Queue | `priority-queue.ts` | Binary heap priority queue with scheduler |

## Running Tests

```bash
npx vitest run 62-message-queue
```
