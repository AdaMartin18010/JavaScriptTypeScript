import type { PageServerLoad } from './$types';

interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: number;
}

// In-memory store (use Redis/DB in production)
const messages: Message[] = [
  { id: '1', text: 'Welcome to the chat!', author: 'System', timestamp: Date.now() - 3600000 },
  { id: '2', text: 'Hey everyone! 👋', author: 'Alice', timestamp: Date.now() - 3000000 },
  { id: '3', text: 'Hi Alice! How\'s it going?', author: 'Bob', timestamp: Date.now() - 2400000 },
];

export const load: PageServerLoad = async () => {
  return {
    messages: messages.slice(-50),
  };
};

// Export for API routes to access
export { messages };
