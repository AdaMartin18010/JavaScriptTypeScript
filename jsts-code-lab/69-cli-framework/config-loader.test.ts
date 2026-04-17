import { describe, it, expect } from 'vitest'
import { ConfigLoader, ConfigLoadError } from './config-loader.js'
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('config-loader', () => {
  it('ConfigLoader is defined', () => {
    expect(typeof ConfigLoader).not.toBe('undefined');
  });

  it('can instantiate ConfigLoader', () => {
    const loader = new ConfigLoader();
    expect(loader).toBeDefined();
  });

  it('parses JSON content', () => {
    const loader = new ConfigLoader();
    const result = loader.parse('{"name":"test","value":42}', '.json');
    expect(result).toEqual({ name: 'test', value: 42 });
  });

  it('parses YAML content', () => {
    const loader = new ConfigLoader();
    const yaml = `name: test\nvalue: 42\nenabled: true`;
    const result = loader.parse(yaml, '.yaml');
    expect(result).toEqual({ name: 'test', value: 42, enabled: true });
  });

  it('throws on invalid JSON', () => {
    const loader = new ConfigLoader();
    expect(() => loader.parse('not json', '.json')).toThrow(ConfigLoadError);
  });

  it('throws on unsupported format', () => {
    const loader = new ConfigLoader();
    expect(() => loader.parse('data', '.xml')).toThrow(ConfigLoadError);
  });

  it('load throws for non-existent file', () => {
    const loader = new ConfigLoader();
    expect(() => loader.load('/non/existent/file.json')).toThrow(ConfigLoadError);
  });

  it('save and load JSON roundtrip', () => {
    const loader = new ConfigLoader();
    const tempFile = path.join(process.cwd(), 'temp-test-config.json');
    const data = { app: 'test', port: 3000 };

    try {
      loader.save(tempFile, data);
      const loaded = loader.load<typeof data>(tempFile);
      expect(loaded).toEqual(data);
    } finally {
      if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
  });

  it('search returns null when not found', () => {
    const loader = new ConfigLoader({ searchPaths: ['/nonexistent'] });
    const result = loader.search('missing');
    expect(result).toBeNull();
  });

  it('ConfigLoadError is defined', () => {
    expect(typeof ConfigLoadError).not.toBe('undefined');
  });
});
