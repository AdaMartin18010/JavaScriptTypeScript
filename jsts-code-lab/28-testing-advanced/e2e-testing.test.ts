import { describe, it, expect } from 'vitest';
import { E2EContext, FixtureManager, Fixtures, E2ETestRunner } from './e2e-testing';

describe('E2EContext', () => {
  it('records steps and asserts text', async () => {
    const page = {
      innerText: async () => 'hello',
      isVisible: async () => true,
      goto: async () => {},
      click: async () => {},
      fill: async () => {},
      screenshot: async () => Buffer.from([]),
      waitForSelector: async () => {},
      textContent: async () => 'hello world'
    } as any;
    const ctx = new E2EContext(page, 'test');
    await ctx.goto('https://example.com');
    await ctx.expectToHaveText('h1', 'hello');
    await ctx.expectToContainText('h1', 'ell');
    expect(ctx.getSteps().length).toBeGreaterThan(0);
  });
});

describe('FixtureManager', () => {
  it('sets up and cleans up fixtures', async () => {
    const fm = new FixtureManager();
    let setup = false;
    let teardown = false;
    const value = await fm.use('x', {
      setup: async () => { setup = true; return 42; },
      teardown: async () => { teardown = true; }
    });
    expect(value).toBe(42);
    expect(setup).toBe(true);
    await fm.cleanup();
    expect(teardown).toBe(true);
  });
});

describe('E2ETestRunner', () => {
  it('runs tests and reports results', async () => {
    const runner = new E2ETestRunner();
    runner.test('passing', async () => {});
    runner.testSkip('skipped', async () => {});
    const results = await runner.run();
    expect(results.passed).toBe(1);
    expect(results.skipped).toBe(1);
    expect(results.failed).toBe(0);
  });

  it('respects only flag', async () => {
    const runner = new E2ETestRunner();
    runner.test('a', async () => {});
    runner.testOnly('b', async () => {});
    runner.test('c', async () => {});
    const results = await runner.run();
    expect(results.passed).toBe(1);
  });
});

describe('Fixtures', () => {
  it('mockPage provides required methods', async () => {
    const fixture = Fixtures.mockPage();
    const page = await fixture.setup();
    expect(typeof page.goto).toBe('function');
    expect(typeof page.isVisible).toBe('function');
    await fixture.teardown(page);
  });
});
