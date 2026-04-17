import { describe, it, expect } from 'vitest'
import { InteractivePrompt } from './interactive-prompt.js'

describe('interactive-prompt', () => {
  it('InteractivePrompt is defined', () => {
    expect(typeof InteractivePrompt).not.toBe('undefined');
  });

  it('can instantiate InteractivePrompt', () => {
    const prompt = new InteractivePrompt();
    expect(prompt).toBeDefined();
    prompt.close();
  });

  it('close does not throw', () => {
    const prompt = new InteractivePrompt();
    expect(() => prompt.close()).not.toThrow();
  });

  it('throws on empty choices for select', async () => {
    const prompt = new InteractivePrompt();
    await expect(prompt.select('Pick one', [])).rejects.toThrow('Choices array must not be empty');
    prompt.close();
  });

  it('throws on empty choices for multiselect', async () => {
    const prompt = new InteractivePrompt();
    await expect(prompt.multiselect('Pick some', [])).rejects.toThrow('Choices array must not be empty');
    prompt.close();
  });
});
