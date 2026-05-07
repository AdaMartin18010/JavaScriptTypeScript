import type { RequestHandler } from './$types';
import { broadcast } from '../events/+server.ts';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  
  broadcast({
    type: 'typing',
    payload: {
      user: body.user,
      isTyping: body.isTyping,
    },
  });

  return new Response('OK');
};
