import type { RequestHandler } from './$types';
import { messages } from '../../+page.server.ts';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  
  const message = {
    id: crypto.randomUUID(),
    text: body.text,
    author: body.author || 'Anonymous',
    timestamp: Date.now(),
  };

  messages.push(message);
  
  // Keep only last 100 messages
  if (messages.length > 100) {
    messages.splice(0, messages.length - 100);
  }

  return new Response(JSON.stringify(message), {
    headers: { 'Content-Type': 'application/json' },
  });
};
