# Day 22-28: Real-time Chat

> **Difficulty**: 🔥 Advanced  
> **Prerequisites**: Day 15-21 completed, SSE/WebSocket basics  
> **Aligned with**: [16-learning-ladder.md](../../16-learning-ladder.md) — Level 9-10

---

## Learning Objectives

By completing this exercise, you will:

1. ✅ Implement Server-Sent Events (SSE) for real-time updates
2. ✅ Use `$state.raw` for performance-critical data structures
3. ✅ Implement optimistic UI updates
4. ✅ Use SvelteKit `+server.ts` for API endpoints
5. ✅ Handle connection state and reconnection
6. ✅ Understand Edge runtime deployment considerations

---

## Exercise: Real-time Chat Application

Build a chat application with:

### Core Features
- [ ] **Message Feed**: Real-time message display via SSE
- [ ] **Send Message**: POST to API, optimistic UI update
- [ ] **User Presence**: Show online/offline status
- [ ] **Message History**: Load last 50 messages on connect
- [ ] **Typing Indicator**: Show "User is typing..."
- [ ] **Connection Status**: Visual indicator for SSE connection

### Architecture

```
src/routes/
├── +page.svelte              # Chat UI
├── +page.server.ts           # Load initial messages
└── api/
    ├── chat/
    │   └── +server.ts        # POST new message
    └── events/
        └── +server.ts        # SSE endpoint
```

### Data Model

```typescript
interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: number;
  pending?: boolean;  // optimistic update
}

interface Presence {
  user: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: number;
}
```

---

## Acceptance Criteria

| Test | Expected |
|:---|:---|
| Open chat page | Last 50 messages loaded |
| Send message | Appears immediately (optimistic), then confirmed |
| Second user sends | Appears in real-time via SSE |
| Disconnect network | Connection status shows offline |
| Reconnect | Missed messages fetched |
| Type in input | "User is typing..." shown after 300ms delay |
| Stop typing | Indicator disappears after 1s |

---

## Key Concepts

### SSE Server Endpoint

```typescript
// +server.ts
import type { RequestHandler } from './$types';

const clients = new Set<ReadableStreamDefaultController>();

export const GET: RequestHandler = async () => {
  const stream = new ReadableStream({
    start(controller) {
      clients.add(controller);
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
    },
    cancel() {
      clients.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
};

// Broadcast to all clients
function broadcast(message: unknown) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  clients.forEach(c => c.enqueue(data));
}
```

### Optimistic Updates

```svelte
<script>
  let messages = $state<Message[]>([]);

  async function sendMessage(text: string) {
    const optimisticId = crypto.randomUUID();
    
    // Optimistic: add immediately
    messages = [...messages, {
      id: optimisticId,
      text,
      author: 'You',
      timestamp: Date.now(),
      pending: true,
    }];

    // Actual: send to server
    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    
    const confirmed = await res.json();
    
    // Replace optimistic with confirmed
    messages = messages.map(m =>
      m.id === optimisticId ? { ...confirmed, pending: false } : m
    );
  }
</script>
```

### $state.raw for Large Lists

```svelte
<script>
  // For performance: messages are append-only
  // Use $state.raw and manually trigger updates
  let messageList = $state.raw<Message[]>([]);
  let updateTrigger = $state(0);

  function addMessage(msg: Message) {
    messageList.push(msg);
    updateTrigger++; // Force re-render
  }
</script>

{#key updateTrigger}
  {#each messageList as msg (msg.id)}
    <MessageBubble {msg} />
  {/each}
{/key}
```

---

## Project Setup

```bash
cd exercises/day-22-chat
npm install
npm run dev
```

---

## Checklist

- [ ] SSE connection established on page load
- [ ] Messages load from server initially
- [ ] Optimistic updates show immediately
- [ ] Real-time messages appear via SSE
- [ ] Connection status indicator works
- [ ] Typing indicator debounced correctly
- [ ] Message history scrolls to bottom
- [ ] Edge-runtime compatible (no Node-specific APIs)

---

## Hints

<details>
<summary>💡 Hint: SSE reconnection</summary>

Use `EventSource` with automatic reconnection:

```typescript
let eventSource: EventSource;
let reconnectTimer: ReturnType<typeof setTimeout>;

function connect() {
  eventSource = new EventSource('/api/events');
  
  eventSource.onmessage = (e) => {
    const data = JSON.parse(e.data);
    handleMessage(data);
  };
  
  eventSource.onerror = () => {
    eventSource.close();
    reconnectTimer = setTimeout(connect, 3000);
  };
}
```
</details>

<details>
<summary>💡 Hint: Typing indicator debounce</summary>

```typescript
let typingTimeout: ReturnType<typeof setTimeout>;
let isTyping = $state(false);

function onInput() {
  if (!isTyping) {
    isTyping = true;
    notifyTyping(true);
  }
  
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    notifyTyping(false);
  }, 1000);
}
```
</details>

---

> **Congratulations!** Completing Day 22-28 means you've mastered Svelte 5's advanced patterns. Review [25-reactivity-source-proofs.md](../../25-reactivity-source-proofs.md) to understand the theoretical foundations.
