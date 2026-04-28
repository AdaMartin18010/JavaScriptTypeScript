import { describe, it, expect } from 'vitest';
import { configurePort, greet, enableFeature, createServerWithNullish, getUserDisplayName, processConfig } from './nullish-coalescing.js';

describe('nullish coalescing (ES2020)', () => {
  it('configurePort should treat 0 as valid', () => {
    expect(configurePort(undefined)).toBe(3000);
    expect(configurePort(0)).toBe(0);
    expect(configurePort(8080)).toBe(8080);
  });

  it('greet should keep empty string', () => {
    expect(greet(undefined)).toBe('Hello, Guest');
    expect(greet('')).toBe('Hello, ');
    expect(greet('Alice')).toBe('Hello, Alice');
  });

  it('enableFeature should treat false as valid', () => {
    expect(enableFeature(undefined)).toBe(true);
    expect(enableFeature(false)).toBe(false);
  });

  it('createServerWithNullish should apply defaults correctly', () => {
    expect(createServerWithNullish({ port: 0, timeout: undefined })).toEqual({
      host: 'localhost',
      port: 0,
      ssl: false,
      timeout: 5000,
    });
  });

  it('getUserDisplayName should return default for missing name', () => {
    expect(getUserDisplayName({ profile: { name: 'Alice' } })).toBe('Alice');
    expect(getUserDisplayName({ profile: {} })).toBe('Anonymous');
    expect(getUserDisplayName(null)).toBe('Anonymous');
  });

  it('processConfig should apply defaults for missing values', () => {
    expect(processConfig({})).toEqual({ timeout: 5000, retries: 3, backoff: 1000 });
    expect(processConfig({ timeout: 1000 })).toEqual({ timeout: 1000, retries: 3, backoff: 1000 });
  });
});
