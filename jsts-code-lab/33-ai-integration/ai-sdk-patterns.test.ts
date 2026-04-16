import { describe, it, expect } from 'vitest';
import { AISDK, RAGSystem, AIAgent } from './ai-sdk-patterns.js';

describe('AISDK', () => {
  const ai = new AISDK({ apiKey: 'test', model: 'gpt-4' });

  it('chat returns a response', async () => {
    const res = await ai.chat([{ role: 'user', content: 'hi' }]);
    expect(res.choices[0].message.role).toBe('assistant');
    expect(res.usage.total_tokens).toBeGreaterThan(0);
  });

  it('streamChat yields chunks', async () => {
    const chunks: string[] = [];
    for await (const chunk of ai.streamChat([{ role: 'user', content: 'hello world' }])) {
      chunks.push(chunk);
    }
    expect(chunks.length).toBeGreaterThan(0);
  });

  it('createEmbedding returns 1536 dimensions', async () => {
    const vec = await ai.createEmbedding('test');
    expect(vec.length).toBe(1536);
  });
});

describe('RAGSystem', () => {
  it('adds documents and queries top-k', async () => {
    const rag = new RAGSystem(new AISDK({ apiKey: 't' }));
    await rag.addDocument('TypeScript is a typed superset of JavaScript.', { source: 'docs' });
    await rag.addDocument('Python is a programming language.', { source: 'docs' });
    const result = await rag.query('What is TypeScript?', 1);
    expect(result.sources.length).toBeLessThanOrEqual(1);
    expect(result.answer.length).toBeGreaterThan(0);
  });
});

describe('AIAgent', () => {
  it('runs goal and returns content', async () => {
    const agent = new AIAgent(new AISDK({ apiKey: 't' }));
    agent.addTool({
      name: 'echo',
      description: 'Echo tool',
      execute: async (args) => `echo: ${JSON.stringify(args)}`
    });
    const result = await agent.run('Say hello');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});
