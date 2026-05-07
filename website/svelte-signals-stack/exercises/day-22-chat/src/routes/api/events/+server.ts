import type { RequestHandler } from './$types';

// In-memory client store (use Redis pub/sub in production)
const clients = new Set<ReadableStreamDefaultController>();

export function broadcast(message: unknown) {
  const data = `data: ${JSON.stringify(message)}\n\n`;
  const encoder = new TextEncoder();
  clients.forEach(c => {
    try {
      c.enqueue(encoder.encode(data));
    } catch {
      clients.delete(c);
    }
  });
}

export const GET: RequestHandler = async () => {
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      clients.add(c);
      
      // Send initial connection ack
      const encoder = new TextEncoder();
      c.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
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
