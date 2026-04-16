import { describe, it, expect } from 'vitest';
import { TypedRouter, exampleRouter, APIClientGenerator } from './end-to-end-types';

describe('TypedRouter', () => {
  it('calls getUser and returns user', async () => {
    const router = new TypedRouter(exampleRouter);
    const user = await router.call('getUser', { id: '123' });
    expect(user.id).toBe('123');
    expect(user.name).toBe('John Doe');
  });

  it('calls createPost and returns post', async () => {
    const router = new TypedRouter(exampleRouter);
    const post = await router.call('createPost', { title: 'Hello', content: 'World' });
    expect(post.title).toBe('Hello');
    expect(post.content).toBe('World');
  });
});

describe('APIClientGenerator', () => {
  it('generates client code with methods', () => {
    const gen = new APIClientGenerator();
    const code = gen.generateClientCode(exampleRouter);
    expect(code).toContain('async getUser(input: any)');
    expect(code).toContain('async createPost(input: any)');
    expect(code).toContain('return response.json()');
  });
});
