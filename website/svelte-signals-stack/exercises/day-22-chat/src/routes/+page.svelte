<script>
  import { onMount, onDestroy } from 'svelte';

  let { data } = $props();

  // Messages: use $state.raw for performance with large lists
  let messages = $state.raw(data.messages || []);
  let messageTrigger = $state(0);

  let inputText = $state('');
  let username = $state('User' + Math.floor(Math.random() * 1000));
  let connectionStatus = $state('connecting');
  let typingUsers = $state(new Set());

  let eventSource;
  let typingTimeout;
  let reconnectTimer;

  function addMessage(msg) {
    messages = [...messages, msg];
    messageTrigger++;
    scrollToBottom();
  }

  function scrollToBottom() {
    const container = document.querySelector('.messages');
    if (container) container.scrollTop = container.scrollHeight;
  }

  function connect() {
    connectionStatus = 'connecting';
    eventSource = new EventSource('/api/events');

    eventSource.onopen = () => {
      connectionStatus = 'connected';
    };

    eventSource.onmessage = (e) => {
      const data = JSON.parse(e.data);
      
      if (data.type === 'message') {
        addMessage(data.payload);
      } else if (data.type === 'typing') {
        if (data.payload.isTyping) {
          typingUsers = new Set([...typingUsers, data.payload.user]);
        } else {
          const next = new Set(typingUsers);
          next.delete(data.payload.user);
          typingUsers = next;
        }
      }
    };

    eventSource.onerror = () => {
      connectionStatus = 'disconnected';
      eventSource.close();
      reconnectTimer = setTimeout(connect, 3000);
    };
  }

  async function sendMessage() {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    const optimisticId = crypto.randomUUID();
    inputText = '';

    // Optimistic update
    addMessage({
      id: optimisticId,
      text,
      author: username,
      timestamp: Date.now(),
      pending: true,
    });

    // Send to server
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author: username }),
      });

      if (!res.ok) throw new Error('Failed to send');

      // In real app, server would broadcast via SSE
      // Here we just mark as confirmed
      messages = messages.map(m =>
        m.id === optimisticId ? { ...m, pending: false } : m
      );
    } catch {
      // Mark as failed
      messages = messages.map(m =>
        m.id === optimisticId ? { ...m, pending: false, failed: true } : m
      );
    }
  }

  function onInput() {
    // Debounced typing indicator
    fetch('/api/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: username, isTyping: true }),
    }).catch(() => {});

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: username, isTyping: false }),
      }).catch(() => {});
    }, 1000);
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onMount(() => {
    connect();
    scrollToBottom();
  });

  onDestroy(() => {
    eventSource?.close();
    clearTimeout(reconnectTimer);
    clearTimeout(typingTimeout);
  });
</script>

<div class="chat">
  <header>
    <h2>💬 Chat Room</h2>
    <div class="status" class:connected={connectionStatus === 'connected'} class:disconnected={connectionStatus === 'disconnected'}>
      {connectionStatus === 'connected' ? '🟢 Online' : connectionStatus === 'connecting' ? '🟡 Connecting...' : '🔴 Offline'}
    </div>
  </header>

  <div class="messages">
    {#each messages as msg (msg.id)}
      <div class="message" class:self={msg.author === username} class:pending={msg.pending} class:failed={msg.failed}>
        <div class="meta">
          <span class="author">{msg.author}</span>
          <span class="time">{formatTime(msg.timestamp)}</span>
          {#if msg.pending}<span class="badge">Sending...</span>{/if}
          {#if msg.failed}<span class="badge error">Failed</span>{/if}
        </div>
        <div class="text">{msg.text}</div>
      </div>
    {/each}

    {#if typingUsers.size > 0}
      <div class="typing">
        {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
      </div>
    {/if}
  </div>

  <form class="input-area" onsubmit={(e) => { e.preventDefault(); sendMessage(); }}>
    <input
      type="text"
      bind:value={inputText}
      oninput={onInput}
      placeholder="Type a message..."
      disabled={connectionStatus !== 'connected'}
    />
    <button type="submit" disabled={!inputText.trim() || connectionStatus !== 'connected'}>
      Send
    </button>
  </form>
</div>

<style>
  .chat { display: flex; flex-direction: column; height: 100vh; max-width: 800px; margin: 0 auto; background: white; }
  header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e2e8f0; }
  h2 { margin: 0; }
  .status { font-size: 0.875rem; padding: 0.25rem 0.75rem; border-radius: 999px; background: #f1f5f9; }
  .status.connected { background: #dcfce7; color: #166534; }
  .status.disconnected { background: #fef2f2; color: #991b1b; }

  .messages { flex: 1; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .message { max-width: 70%; padding: 0.75rem; border-radius: 12px; background: #f1f5f9; align-self: flex-start; }
  .message.self { background: #dbeafe; align-self: flex-end; }
  .message.pending { opacity: 0.7; }
  .message.failed { border: 2px solid #ef4444; }
  .meta { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.25rem; font-size: 0.75rem; }
  .author { font-weight: 600; }
  .time { color: #94a3b8; }
  .badge { font-size: 0.65rem; padding: 0.1rem 0.4rem; background: #fbbf24; border-radius: 4px; }
  .badge.error { background: #ef4444; color: white; }
  .text { word-break: break-word; }

  .typing { font-size: 0.875rem; color: #94a3b8; font-style: italic; padding: 0.5rem; }

  .input-area { display: flex; gap: 0.5rem; padding: 1rem; border-top: 1px solid #e2e8f0; }
  .input-area input { flex: 1; padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
  .input-area button { padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; }
  .input-area button:disabled { background: #cbd5e1; cursor: not-allowed; }
</style>
